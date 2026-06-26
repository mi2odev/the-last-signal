'use strict';

const db = require('../db');
const { hashPassword, verifyPassword, signToken } = require('../auth');
const { validateCredentials } = require('../validators');

const stmts = {
  insertUser: db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)'),
  findByUsername: db.prepare('SELECT * FROM users WHERE username = ? COLLATE NOCASE'),
  findById: db.prepare('SELECT id, username, created_at FROM users WHERE id = ?'),
};

function publicUser(row) {
  return { id: row.id, username: row.username, createdAt: row.created_at };
}

async function register(req, res) {
  const username = String(req.body.username || '').trim();
  const password = String(req.body.password || '');

  const errors = validateCredentials({ username, password });
  if (errors.length) return res.status(400).json({ error: errors.join('. ') });

  if (stmts.findByUsername.get(username)) {
    return res.status(409).json({ error: 'Operator callsign already taken' });
  }

  const passwordHash = await hashPassword(password);
  const info = stmts.insertUser.run(username, passwordHash);
  const user = { id: Number(info.lastInsertRowid), username };
  const token = signToken(user);

  return res.status(201).json({ token, user });
}

async function login(req, res) {
  const username = String(req.body.username || '').trim();
  const password = String(req.body.password || '');

  if (!username || !password) {
    return res.status(400).json({ error: 'Callsign and access code are required' });
  }

  const row = stmts.findByUsername.get(username);
  // Run the comparison even when the user is missing to avoid timing leaks,
  // but always answer with the same generic message.
  const ok = row ? await verifyPassword(password, row.password_hash) : false;
  if (!row || !ok) {
    return res.status(401).json({ error: 'Invalid callsign or access code' });
  }

  const token = signToken(row);
  return res.json({ token, user: { id: row.id, username: row.username } });
}

function me(req, res) {
  const row = stmts.findById.get(req.user.sub);
  if (!row) return res.status(404).json({ error: 'User not found' });
  return res.json({ user: publicUser(row) });
}

module.exports = { register, login, me };
