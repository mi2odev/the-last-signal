'use strict';

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { jwtSecret, jwtExpiresIn, bcryptRounds } = require('./config');

function hashPassword(plain) {
  return bcrypt.hash(plain, bcryptRounds);
}

function verifyPassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

function signToken(user) {
  return jwt.sign({ sub: user.id, username: user.username }, jwtSecret, {
    expiresIn: jwtExpiresIn,
  });
}

function readToken(req) {
  const header = req.headers.authorization || '';
  return header.startsWith('Bearer ') ? header.slice(7) : null;
}

// Hard gate: rejects the request when no valid token is present.
function authRequired(req, res, next) {
  const token = readToken(req);
  if (!token) return res.status(401).json({ error: 'Missing authorization token' });
  try {
    req.user = jwt.verify(token, jwtSecret);
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// Soft gate: attaches req.user when a valid token is present, otherwise continues
// anonymously. Used by the public leaderboard so it can flag the caller's own row.
function optionalAuth(req, res, next) {
  const token = readToken(req);
  if (token) {
    try {
      req.user = jwt.verify(token, jwtSecret);
    } catch (e) {
      /* ignore — treat as anonymous */
    }
  }
  next();
}

module.exports = { hashPassword, verifyPassword, signToken, authRequired, optionalAuth };
