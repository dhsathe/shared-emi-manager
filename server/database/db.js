import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

const databasePath = resolve(
  process.env.DATABASE_PATH || "./data/emi-group.db",
);
mkdirSync(dirname(databasePath), { recursive: true });

const db = new Database(databasePath);
db.pragma("journal_mode = WAL");
db.exec(`
  CREATE TABLE IF NOT EXISTS emis (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    amount INTEGER NOT NULL CHECK (amount > 0),
    category TEXT NOT NULL,
    date TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`);

export function listEmis() {
  return db
    .prepare(
      "SELECT id, name, amount, category, date, status FROM emis ORDER BY date ASC, id ASC",
    )
    .all();
}

export function createEmi({ name, amount, category, date }) {
  const result = db
    .prepare(
      "INSERT INTO emis (name, amount, category, date) VALUES (?, ?, ?, ?)",
    )
    .run(name, amount, category, date);
  return db
    .prepare(
      "SELECT id, name, amount, category, date, status FROM emis WHERE id = ?",
    )
    .get(result.lastInsertRowid);
}

export function toggleEmi(id) {
  db.prepare(
    "UPDATE emis SET status = CASE WHEN status = 'paid' THEN 'pending' ELSE 'paid' END WHERE id = ?",
  ).run(id);
  return db
    .prepare(
      "SELECT id, name, amount, category, date, status FROM emis WHERE id = ?",
    )
    .get(id);
}

export function deleteEmi(id) {
  return db.prepare("DELETE FROM emis WHERE id = ?").run(id).changes > 0;
}
