'use strict';

require('dotenv').config();

function parseOrigins(value) {
  if (!value || value.trim() === '*') return '*';
  return value.split(',').map((o) => o.trim()).filter(Boolean);
}

const config = {
  port: parseInt(process.env.PORT || '4000', 10),
  jwtSecret: process.env.JWT_SECRET || 'dev-insecure-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',

  // Aiven for PostgreSQL connection string ("Service URI" in the Aiven console),
  // e.g. postgres://avnadmin:PASSWORD@host:port/defaultdb?sslmode=require
  databaseUrl: process.env.DATABASE_URL || '',

  // Aiven requires TLS. 'require' (default) connects over SSL; 'disable' turns it
  // off (only for a local Postgres without TLS).
  dbSsl: (process.env.DATABASE_SSL || 'require').toLowerCase() !== 'disable',

  // Optional: the Aiven CA certificate (raw PEM contents or a path to a .pem file).
  // When provided the server fully verifies the server certificate; when omitted it
  // still uses SSL but does not verify the CA (fine to get started).
  dbCaCert: process.env.DATABASE_CA_CERT || '',

  corsOrigin: parseOrigins(process.env.CORS_ORIGIN),
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '10', 10),
  isProd: process.env.NODE_ENV === 'production',
};

if (!config.databaseUrl) {
  throw new Error(
    'DATABASE_URL is not set. Create a free PostgreSQL service at https://aiven.io, ' +
      'copy its Service URI, and add it as DATABASE_URL in backend/.env (see .env.example and README).'
  );
}

if (config.isProd && config.jwtSecret === 'dev-insecure-secret-change-me') {
  throw new Error('Refusing to start in production with the default JWT_SECRET. Set JWT_SECRET in your environment.');
}

module.exports = config;
