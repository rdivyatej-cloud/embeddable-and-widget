import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.resolve(__dirname, '../../database.sqlite');
const db = new Database(dbPath, { verbose: console.log });

export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE,
      token TEXT UNIQUE
    );

    CREATE TABLE IF NOT EXISTS widgets (
      id TEXT PRIMARY KEY,
      owner_id TEXT NOT NULL,
      title TEXT,
      button_text TEXT,
      type TEXT,
      FOREIGN KEY(owner_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS submissions (
      id TEXT PRIMARY KEY,
      widget_id TEXT NOT NULL,
      data TEXT,
      ip_address TEXT,
      country TEXT,
      city TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(widget_id) REFERENCES widgets(id)
    );
  `);
}

export default db;
