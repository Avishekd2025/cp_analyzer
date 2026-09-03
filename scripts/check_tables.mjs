import Database from "better-sqlite3";

const db = new Database("./data/cp_analyzer.db");
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all();
console.log("Tables in data/cp_analyzer.db:");
for (const t of tables) {
  const count = db.prepare(`SELECT count(*) as c FROM "${t.name}"`).get();
  console.log(`  ${t.name}: ${count.c} rows`);
}
