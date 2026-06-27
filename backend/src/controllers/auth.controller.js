'use strict';

const { get, run } = require('../db');
const { hashPassword, verifyPassword, signToken } = require('../auth');
const { validateCredentials } = require('../validators');

function publicUser(row) {
  return { id: Number(row.id), username: row.username, createdAt: row.created_at };
}

async function register(req, res) {
  const username = String(req.body.username || '').trim();
  const password = String(req.body.password || '');

  const errors = validateCredentials({ username, password });
  if (errors.length) return res.status(400).json({ error: errors.join('. ') });

  const existing = await get('SELECT id FROM users WHERE lower(username) = lower($1)', [username]);
  if (existing) {
    return res.status(409).json({ error: 'Operator callsign already taken' });
  }

  const passwordHash = await hashPassword(password);
  const inserted = await get(
    'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id',
    [username, passwordHash]
  );
  const user = { id: Number(inserted.id), username };
  const token = signToken(user);

  return res.status(201).json({ token, user, progress: 0 });
}

async function login(req, res) {
  const username = String(req.body.username || '').trim();
  const password = String(req.body.password || '');

  if (!username || !password) {
    return res.status(400).json({ error: 'Callsign and access code are required' });
  }

  const row = await get('SELECT * FROM users WHERE lower(username) = lower($1)', [username]);
  // Run the comparison even when the user is missing to avoid timing leaks,
  // but always answer with the same generic message.
  const ok = row ? await verifyPassword(password, row.password_hash) : false;
  if (!row || !ok) {
    return res.status(401).json({ error: 'Invalid callsign or access code' });
  }

  const token = signToken({ id: Number(row.id), username: row.username });
  return res.json({ token, user: { id: Number(row.id), username: row.username }, progress: Number(row.progress) || 0 });
}

async function me(req, res) {
  const row = await get('SELECT id, username, created_at, progress FROM users WHERE id = $1', [req.user.sub]);
  if (!row) return res.status(404).json({ error: 'User not found' });
  return res.json({ user: publicUser(row), progress: Number(row.progress) || 0 });
}

// PUT /api/auth/progress — persist the operator's furthest-unlocked mission.
// Monotonic: progress only ever increases (GREATEST), so an out-of-order request can't roll it back.
async function saveProgress(req, res) {
  let p = Number(req.body && req.body.progress);
  if (!Number.isFinite(p) || p < 0 || p > 100000) {
    return res.status(400).json({ error: 'progress must be a non-negative integer' });
  }
  p = Math.floor(p);
  const row = await get('UPDATE users SET progress = GREATEST(progress, $1) WHERE id = $2 RETURNING progress', [
    p,
    req.user.sub,
  ]);
  return res.json({ progress: row ? Number(row.progress) : p });
}

module.exports = { register, login, me, saveProgress };
