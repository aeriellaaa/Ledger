const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, '..', 'data', 'ledger.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    type TEXT,
    amount REAL,
    category TEXT,
    date TEXT,
    description TEXT,
    recurring INTEGER,
    recurrence_frequency TEXT,
    recurrence_endDate TEXT,
    userId TEXT
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT,
    email TEXT UNIQUE,
    password_hash TEXT
  )
`);
db.exec(`
  CREATE TABLE IF NOT EXISTS meta (
    key TEXT PRIMARY KEY,
    value TEXT
  )
`);

// Seed a default balance of 0 if none exists yet
const existingBalance = db.prepare('SELECT value FROM meta WHERE key = ?').get('balance');
if (!existingBalance) {
  db.prepare('INSERT INTO meta (key, value) VALUES (?, ?)').run('balance', '0');
}
module.exports = db;