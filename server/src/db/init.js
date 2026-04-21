import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { ENV } from "../config/env.js";

// Ensure data directory exists
fs.mkdirSync(path.dirname(ENV.DB_PATH), { recursive: true });

const db = new Database(ENV.DB_PATH);

// Enable WAL mode for better concurrent read performance
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    display_name TEXT NOT NULL,
    created_at DATETIME DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    notes TEXT DEFAULT '',
    status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open', 'closed')),
    important INTEGER NOT NULL DEFAULT 0,
    urgent INTEGER NOT NULL DEFAULT 0,
    opened_by INTEGER NOT NULL REFERENCES users(id),
    closed_by INTEGER REFERENCES users(id),
    opened_at DATETIME DEFAULT (datetime('now')),
    closed_at DATETIME,
    updated_at DATETIME DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
  CREATE INDEX IF NOT EXISTS idx_tasks_opened_by ON tasks(opened_by);
`);

// Migrate: add important/urgent columns if missing (existing DBs)
const cols = db
  .prepare("PRAGMA table_info(tasks)")
  .all()
  .map((c) => c.name);
if (!cols.includes("important")) {
  db.exec("ALTER TABLE tasks ADD COLUMN important INTEGER NOT NULL DEFAULT 0");
}
if (!cols.includes("urgent")) {
  db.exec("ALTER TABLE tasks ADD COLUMN urgent INTEGER NOT NULL DEFAULT 0");
}

export default db;
