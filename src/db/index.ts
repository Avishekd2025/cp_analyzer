import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";
import path from "path";
import fs from "fs";

const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, "cp_analyzer.db");
const sqlite = new Database(dbPath);

// Enable WAL mode for performance and concurrent reads
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

export const db = drizzle(sqlite, { schema });
export { schema };

// Function to ensure tables exist
export function initDatabase() {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT,
      name TEXT NOT NULL,
      avatar_url TEXT,
      codeforces_handle TEXT NOT NULL UNIQUE,
      rating INTEGER DEFAULT 0,
      max_rating INTEGER DEFAULT 0,
      rank TEXT DEFAULT 'unrated',
      total_solved INTEGER DEFAULT 0,
      total_analyzed INTEGER DEFAULT 0,
      last_synced_at TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS user_solved_problems (
      id TEXT PRIMARY KEY,
      user_handle TEXT NOT NULL,
      contest_id INTEGER NOT NULL,
      "index" TEXT NOT NULL,
      problem_id TEXT NOT NULL,
      name TEXT NOT NULL,
      rating INTEGER,
      tags TEXT NOT NULL,
      problem_url TEXT NOT NULL,
      solved_at INTEGER NOT NULL,
      submission_id INTEGER,
      language TEXT,
      is_analyzed INTEGER DEFAULT 0,
      primary_pattern_id TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE UNIQUE INDEX IF NOT EXISTS user_problem_unique_idx ON user_solved_problems(user_handle, contest_id, "index");
    CREATE INDEX IF NOT EXISTS user_handle_idx ON user_solved_problems(user_handle);
    CREATE INDEX IF NOT EXISTS is_analyzed_idx ON user_solved_problems(is_analyzed);

    CREATE TABLE IF NOT EXISTS problems (
      id TEXT PRIMARY KEY,
      contest_id INTEGER NOT NULL,
      "index" TEXT NOT NULL,
      name TEXT NOT NULL,
      rating INTEGER,
      tags TEXT NOT NULL,
      problem_url TEXT NOT NULL,
      solved_at INTEGER NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS submissions (
      id INTEGER PRIMARY KEY,
      problem_id TEXT NOT NULL REFERENCES problems(id),
      verdict TEXT NOT NULL,
      language TEXT NOT NULL,
      passed_test_count INTEGER DEFAULT 0,
      time_consumed_millis INTEGER DEFAULT 0,
      memory_consumed_bytes INTEGER DEFAULT 0,
      submission_time INTEGER NOT NULL,
      code_snippet TEXT
    );

    CREATE TABLE IF NOT EXISTS segments (
      id TEXT PRIMARY KEY,
      segment_number INTEGER NOT NULL,
      start_problem_idx INTEGER NOT NULL,
      end_problem_idx INTEGER NOT NULL,
      total_problems INTEGER NOT NULL DEFAULT 200,
      new_concepts_count INTEGER DEFAULT 0,
      repeated_concepts_count INTEGER DEFAULT 0,
      new_variations_count INTEGER DEFAULT 0,
      uncommonIdeasCount INTEGER DEFAULT 0,
      new_combinations_count INTEGER DEFAULT 0,
      summary_notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS segment_problems (
      id TEXT PRIMARY KEY,
      segment_id TEXT NOT NULL REFERENCES segments(id),
      problem_id TEXT NOT NULL REFERENCES problems(id),
      solved_at INTEGER NOT NULL,
      order_in_segment INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS solution_evidence (
      id TEXT PRIMARY KEY,
      problem_id TEXT NOT NULL REFERENCES problems(id),
      source_type TEXT NOT NULL,
      editorial_url TEXT,
      editorial_snippet TEXT,
      author TEXT,
      raw_reference TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS verification_records (
      id TEXT PRIMARY KEY,
      problem_id TEXT NOT NULL REFERENCES problems(id),
      status TEXT NOT NULL,
      confidence_score INTEGER NOT NULL DEFAULT 100,
      algorithm_crosscheck TEXT,
      complexity_verified TEXT,
      correctness_reasoning TEXT,
      verified_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS techniques (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      description TEXT NOT NULL,
      color TEXT NOT NULL,
      icon TEXT NOT NULL,
      commonality TEXT NOT NULL DEFAULT 'COMMON'
    );

    CREATE TABLE IF NOT EXISTS patterns (
      id TEXT PRIMARY KEY,
      technique_id TEXT NOT NULL REFERENCES techniques(id),
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      core_idea TEXT NOT NULL,
      mental_model TEXT NOT NULL,
      real_life_analogy TEXT NOT NULL,
      discovery_flow TEXT NOT NULL,
      recognition_signals TEXT NOT NULL,
      standard_approach TEXT NOT NULL,
      why_it_works_proof TEXT NOT NULL,
      why_not_others TEXT NOT NULL,
      common_mistakes TEXT NOT NULL,
      implementation_insights TEXT NOT NULL,
      rarity_tier TEXT NOT NULL DEFAULT 'COMMON',
      used_count INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS variations (
      id TEXT PRIMARY KEY,
      pattern_id TEXT NOT NULL REFERENCES patterns(id),
      name TEXT NOT NULL,
      slug TEXT NOT NULL,
      description TEXT NOT NULL,
      constraint_context TEXT NOT NULL,
      representative_problem_id TEXT
    );

    CREATE TABLE IF NOT EXISTS technique_combinations (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      technique_a_id TEXT NOT NULL REFERENCES techniques(id),
      technique_b_id TEXT NOT NULL REFERENCES techniques(id),
      rationale TEXT NOT NULL,
      role_a TEXT NOT NULL,
      role_b TEXT NOT NULL,
      emergence_clue TEXT NOT NULL,
      representative_problem_id TEXT,
      frequency INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS problem_knowledge (
      id TEXT PRIMARY KEY,
      problem_id TEXT NOT NULL REFERENCES problems(id),
      primary_pattern_id TEXT NOT NULL REFERENCES patterns(id),
      secondary_technique_ids TEXT NOT NULL,
      key_observation TEXT NOT NULL,
      why_this_approach TEXT NOT NULL,
      safe_decision_proof TEXT NOT NULL,
      variation_id TEXT,
      implementation_techniques TEXT NOT NULL,
      common_traps TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS representative_problems (
      id TEXT PRIMARY KEY,
      pattern_id TEXT NOT NULL REFERENCES patterns(id),
      problem_id TEXT NOT NULL REFERENCES problems(id),
      progression_tier INTEGER NOT NULL,
      progression_label TEXT NOT NULL,
      why_representative TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS pattern_aliases (
      id TEXT PRIMARY KEY,
      pattern_id TEXT NOT NULL REFERENCES patterns(id),
      alias TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS mastery_records (
      id TEXT PRIMARY KEY,
      pattern_id TEXT NOT NULL REFERENCES patterns(id),
      exposure_count INTEGER DEFAULT 0,
      variation_coverage INTEGER DEFAULT 0,
      combination_coverage INTEGER DEFAULT 0,
      revision_score INTEGER DEFAULT 0,
      last_revised_at TEXT
    );

    CREATE TABLE IF NOT EXISTS revision_logs (
      id TEXT PRIMARY KEY,
      problem_id TEXT NOT NULL REFERENCES problems(id),
      pattern_id TEXT NOT NULL REFERENCES patterns(id),
      mode TEXT NOT NULL,
      question_prompt TEXT NOT NULL,
      user_response TEXT,
      is_correct INTEGER DEFAULT 1,
      feedback TEXT NOT NULL,
      timestamp TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Safe migration check for existing tables
  try {
    const tableInfo = sqlite.pragma("table_info(users)") as { name: string }[];
    const colNames = new Set(tableInfo.map((c) => c.name));
    if (!colNames.has("total_analyzed")) {
      sqlite.exec(`ALTER TABLE users ADD COLUMN total_analyzed INTEGER DEFAULT 0;`);
    }
  } catch (err) {
    console.error("Migration pragma check error:", err);
  }
}

// Auto-initialize tables
initDatabase();
