'use strict';

const express = require('express');
const cors = require('cors');
const { port, corsOrigin } = require('./config');
const { init, pool } = require('./db');
const { errorHandler, notFound } = require('./middleware');
const authRoutes = require('./routes/auth.routes');
const leaderboardRoutes = require('./routes/leaderboard.routes');

const app = express();

app.set('trust proxy', 1);
app.use(cors({ origin: corsOrigin }));
app.use(express.json({ limit: '64kb' }));

// Liveness probe.
app.get('/api/health', (req, res) =>
  res.json({ status: 'ok', service: 'the-last-signal', time: new Date().toISOString() })
);

app.use('/api/auth', authRoutes);
app.use('/api', leaderboardRoutes);

app.use(notFound);
app.use(errorHandler);

let server;

async function start() {
  // Ensure the database schema exists before accepting traffic.
  await init();
  server = app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`The Last Signal API listening on http://localhost:${port}`);
  });
}

start().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Failed to start server:', err);
  process.exit(1);
});

// Graceful shutdown.
function shutdown(signal) {
  // eslint-disable-next-line no-console
  console.log(`\n${signal} received, closing server...`);
  const done = () => pool.end().finally(() => process.exit(0));
  if (server) server.close(done);
  else done();
}
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

module.exports = app;
