'use strict';

const express = require('express');
const { submitRun, leaderboard, stats, globalStats } = require('../controllers/leaderboard.controller');
const { authRequired, optionalAuth } = require('../auth');
const { asyncHandler } = require('../middleware');

const router = express.Router();

// Public leaderboard. optionalAuth lets us mark the caller's own row when a token is sent.
router.get('/leaderboard', optionalAuth, asyncHandler(leaderboard));

// Public network-wide totals for the home page.
router.get('/stats/global', asyncHandler(globalStats));

// Record a finished run (auth required).
router.post('/runs', authRequired, asyncHandler(submitRun));

// Personal dashboard stats (auth required).
router.get('/stats/me', authRequired, asyncHandler(stats));

module.exports = router;
