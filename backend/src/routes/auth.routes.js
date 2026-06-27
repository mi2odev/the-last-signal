'use strict';

const express = require('express');
const { register, login, me, saveProgress } = require('../controllers/auth.controller');
const { authRequired } = require('../auth');
const { rateLimit, asyncHandler } = require('../middleware');

const router = express.Router();

// Throttle credential endpoints: 20 attempts per IP per 15 minutes.
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });

router.post('/register', authLimiter, asyncHandler(register));
router.post('/login', authLimiter, asyncHandler(login));
router.get('/me', authRequired, asyncHandler(me));
router.put('/progress', authRequired, asyncHandler(saveProgress));

module.exports = router;
