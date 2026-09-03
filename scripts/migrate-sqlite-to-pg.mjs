/**
 * Standalone one-time migration script: SQLite -> PostgreSQL
 * 
 * Usage:
 *   DATABASE_URL="postgresql://user:password@host:port/dbname?sslmode=require" node scripts/migrate-sqlite-to-pg.mjs
 */

import Database from "better-sqlite3";
import postgres from "postgres";
import path from "path";
import fs from "fs";

const sqlitePath = path.resolve(process.cwd(), "data/cp_analyzer.db");
const pgUrl = process.env.DATABASE_URL;

if (!fs.existsSync(sqlitePath)) {
  console.log(`[INFO] No SQLite database found at ${sqlitePath}. Nothing to migrate.`);
  process.exit(0);
}

if (!pgUrl) {
  console.error(`[ERROR] DATABASE_URL environment variable is required.`);
  console.error(`Example: DATABASE_URL="postgresql://..." node scripts/migrate-sqlite-to-pg.mjs`);
  process.exit(1);
}

console.log(`[START] Migrating SQLite (${sqlitePath}) to PostgreSQL...`);

const sqlite = new Database(sqlitePath, { readonly: true });
const sql = postgres(pgUrl, { max: 10, prepare: false });

const TABLES_IN_ORDER = [
  "techniques",
  "patterns",
  "variations",
  "technique_combinations",
  "problems",
  "submissions",
  "users",
  "user_solved_problems",
  "problem_knowledge",
  "representative_problems",
  "segments",
  "segment_problems",
  "solution_evidence",
  "verification_records",
  "pattern_aliases",
  "mastery_records",
  "revision_logs",
];

async function migrateTable(tableName) {
  // Check if table exists in SQLite
  const tableExists = sqlite
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name = ?")
    .get(tableName);

  if (!tableExists) {
    console.log(`  - Table "${tableName}" does not exist in SQLite, skipping.`);
    return 0;
  }

  const rows = sqlite.prepare(`SELECT * FROM "${tableName}"`).all();
  if (rows.length === 0) {
    console.log(`  - Table "${tableName}" is empty (0 rows).`);
    return 0;
  }

  console.log(`  -> Migrating "${tableName}" (${rows.length} rows)...`);

  const BATCH_SIZE = 250;
  let inserted = 0;

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    
    // Clean null characters or types if necessary
    const cleanedBatch = batch.map((row) => {
      const copy = { ...row };
      for (const [key, value] of Object.entries(copy)) {
        if (typeof value === "string" && value.includes("\u0000")) {
          copy[key] = value.replace(/\u0000/g, "");
        }
      }
      return copy;
    });

    try {
      await sql`
        INSERT INTO ${sql(tableName)} ${sql(cleanedBatch)}
        ON CONFLICT DO NOTHING
      `;
      inserted += batch.length;
    } catch (err) {
      console.warn(`    [WARN] Batch insert error in "${tableName}": ${err.message}. Trying row-by-row fallback...`);
      for (const row of cleanedBatch) {
        try {
          await sql`
            INSERT INTO ${sql(tableName)} ${sql(row)}
            ON CONFLICT DO NOTHING
          `;
          inserted++;
        } catch (rowErr) {
          console.error(`    [ROW ERROR] Failed row in "${tableName}":`, rowErr.message);
        }
      }
    }
  }

  console.log(`  ✓ Table "${tableName}" completed (${inserted}/${rows.length} rows processed).`);
  return inserted;
}

async function run() {
  let totalMigrated = 0;
  try {
    for (const table of TABLES_IN_ORDER) {
      const count = await migrateTable(table);
      totalMigrated += count;
    }

    console.log(`\n[SUCCESS] SQLite -> PostgreSQL migration complete! Total rows processed: ${totalMigrated}`);
  } catch (error) {
    console.error(`\n[FATAL] Migration failed:`, error);
    process.exit(1);
  } finally {
    sqlite.close();
    await sql.end();
  }
}

run();
