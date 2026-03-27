import Database from 'better-sqlite3'

const db = new Database('todos.db')

db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id    INTEGER PRIMARY KEY,
    name  TEXT    NOT NULL,
    email TEXT    NOT NULL,
    login TEXT    NOT NULL UNIQUE
  );

  CREATE TABLE IF NOT EXISTS todos (
    id        INTEGER PRIMARY KEY,
    title     TEXT    NOT NULL,
    completed INTEGER NOT NULL DEFAULT 0,
    user_id   INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );
`)

export default db