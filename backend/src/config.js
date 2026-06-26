'use strict';

require('dotenv').config();
const path = require('path');

function parseOrigins(value) {
  if (!value || value.trim() === '*') return '*';
  return value.split(',').map((o) => o.trim()).filter(Boolean);
}

const config = {
  port: parseInt(process.env.PORT || '4000', 10),
  jwtSecret: process.env.JWT_SECRET || 'dev-insecure-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  dbFile: process.env.DB_FILE
    ? path.resolve(__dirname, '..', process.env.DB_FILE)
    : path.join(__dirname, '..', 'data', 'the-last-signal.db'),
  corsOrigin: parseOrigins(process.env.CORS_ORIGIN),
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '10', 10),
  isProd: process.env.NODE_ENV === 'production',
};

if (config.isProd && config.jwtSecret === 'dev-insecure-secret-change-me') {
  // Fail fast so an insecure default secret never reaches production.
  throw new Error('Refusing to start in production with the default JWT_SECRET. Set JWT_SECRET in your environment.');
}

module.exports = config;
