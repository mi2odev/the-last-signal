'use strict';

const express = require('express');
const cors = require('cors');
const { port, corsOrigin } = require('./config');
const { errorHandler, notFound } = require('./middleware');
const authRoutes = require('./routes/auth.routes');
const leaderboardRoutes = require('./routes/leaderboard.routes');

// Importing db here ensures the schema is created on boot.
require('./db');

const app = express();

app.set('trust proxy', 1);
app.use(cors({ origin: corsOrigin }));
app.use(express.json({ limit: '64kb' }));

// Liveness probe.
app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'the-last-signal', time: new Date().toISOString() }));

app.use('/api/auth', authRoutes);
app.use('/api', leaderboardRoutes);

app.use(notFound);
app.use(errorHandler);

const server = app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`The Last Signal API listening on http://localhost:${port}`);
});

// Graceful shutdown.
function shutdown(signal) {
  // eslint-disable-next-line no-console
  console.log(`\n${signal} received, closing server...`);
  server.close(() => process.exit(0));
}
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

module.exports = app;
