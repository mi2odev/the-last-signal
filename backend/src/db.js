'use strict';

const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const { dbFile } = require('./config');

// Make sure the folder that will hold the database file exists.
fs.mkdirSync(path.dirname(dbFile), { recursive: true });

const db = new Database(dbFile);

// WAL gives us much better read/write concurrency for an API workload.
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Schema. `IF NOT EXISTS` keeps this safe to run on every boot (idempotent migration).
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    username      TEXT    NOT NULL UNIQUE COLLATE NOCASE,
    password_hash TEXT    NOT NULL,
    created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS runs (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id      INTEGER NOT NULL,
    mission_id   TEXT,
    wpm          REAL    NOT NULL,
    accuracy     REAL    NOT NULL,
    mistakes     INTEGER NOT NULL DEFAULT 0,
    keystrokes   INTEGER NOT NULL DEFAULT 0,
    words        INTEGER NOT NULL DEFAULT 0,
    duration_sec REAL    NOT NULL DEFAULT 0,
    created_at   TEXT    NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_runs_user ON runs(user_id);
  CREATE INDEX IF NOT EXISTS idx_runs_wpm  ON runs(wpm DESC);
`);

module.exports = db;
