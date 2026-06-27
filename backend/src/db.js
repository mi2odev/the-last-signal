'use strict';

const fs = require('fs');
const { Pool } = require('pg');
const { databaseUrl, dbSsl, dbCaCert } = require('./config');

// Build the SSL option. Aiven serves a self-signed CA, so without the CA cert we
// connect over TLS but skip CA verification (rejectUnauthorized:false). Supply
// DATABASE_CA_CERT to verify properly.
function buildSsl() {
  if (!dbSsl) return false;
  if (dbCaCert) {
    const ca = dbCaCert.includes('BEGIN CERTIFICATE') ? dbCaCert : fs.readFileSync(dbCaCert, 'utf8');
    return { rejectUnauthorized: true, ca };
  }
  // No CA supplied: still encrypt, but don't verify the (self-signed) Aiven CA.
  return { rejectUnauthorized: false };
}

// Strip any sslmode/ssl query params from the URL so that TLS is governed solely
// by the `ssl` option below. Otherwise `sslmode=require` in the Aiven URI forces
// certificate verification and rejects Aiven's self-signed CA.
function cleanUrl(url) {
  try {
    const u = new URL(url);
    u.searchParams.delete('sslmode');
    u.searchParams.delete('ssl');
    return u.toString();
  } catch (e) {
    return url;
  }
}

const pool = new Pool({
  connectionString: cleanUrl(databaseUrl),
  ssl: buildSsl(),
  max: 10,
  idleTimeoutMillis: 30000,
});

// Schema. Each statement is idempotent (IF NOT EXISTS), so init() is safe on every
// boot and doubles as a lightweight migration. Case-insensitive uniqueness on the
// username is enforced with a unique index over lower(username).
const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS users (
     id            BIGSERIAL PRIMARY KEY,
     username      TEXT        NOT NULL,
     password_hash TEXT        NOT NULL,
     created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
   )`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS progress INTEGER NOT NULL DEFAULT 0`,
  `CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username_lower ON users (lower(username))`,
  `CREATE TABLE IF NOT EXISTS runs (
     id           BIGSERIAL   PRIMARY KEY,
     user_id      BIGINT      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     mission_id   TEXT,
     wpm          REAL        NOT NULL,
     accuracy     REAL        NOT NULL,
     mistakes     INTEGER     NOT NULL DEFAULT 0,
     keystrokes   INTEGER     NOT NULL DEFAULT 0,
     words        INTEGER     NOT NULL DEFAULT 0,
     duration_sec REAL        NOT NULL DEFAULT 0,
     created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
   )`,
  `CREATE INDEX IF NOT EXISTS idx_runs_user ON runs(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_runs_wpm  ON runs(wpm DESC)`,
];

async function init() {
  for (const statement of SCHEMA) {
    await pool.query(statement);
  }
}

// Async query helpers. `params` is a positional array (use $1, $2, ... in the SQL).
async function get(sql, params) {
  const result = await pool.query(sql, params);
  return result.rows[0] || null;
}

async function all(sql, params) {
  const result = await pool.query(sql, params);
  return result.rows;
}

async function run(sql, params) {
  return pool.query(sql, params);
}

module.exports = { pool, init, get, all, run };
