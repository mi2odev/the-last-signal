'use strict';

const USERNAME_RE = /^[a-zA-Z0-9_-]+$/;

function validateCredentials({ username, password }) {
  const errors = [];
  const u = typeof username === 'string' ? username.trim() : '';

  if (u.length < 3 || u.length > 20) {
    errors.push('Callsign must be 3-20 characters');
  } else if (!USERNAME_RE.test(u)) {
    errors.push('Callsign may only contain letters, numbers, _ and -');
  }

  if (typeof password !== 'string' || password.length < 6 || password.length > 100) {
    errors.push('Access code must be at least 6 characters');
  }

  return errors;
}

function isNum(v) {
  return typeof v === 'number' && Number.isFinite(v);
}

function validateRun(body) {
  const errors = [];

  if (!isNum(body.wpm) || body.wpm < 0 || body.wpm > 400) {
    errors.push('wpm must be a number between 0 and 400');
  }
  if (!isNum(body.accuracy) || body.accuracy < 0 || body.accuracy > 100) {
    errors.push('accuracy must be a number between 0 and 100');
  }
  if (body.mistakes != null && (!isNum(body.mistakes) || body.mistakes < 0)) {
    errors.push('mistakes must be a non-negative number');
  }
  if (body.keystrokes != null && (!isNum(body.keystrokes) || body.keystrokes < 0)) {
    errors.push('keystrokes must be a non-negative number');
  }
  if (body.durationSec != null && (!isNum(body.durationSec) || body.durationSec < 0)) {
    errors.push('durationSec must be a non-negative number');
  }
  if (body.missionId != null && typeof body.missionId !== 'string') {
    errors.push('missionId must be a string');
  }

  return errors;
}

module.exports = { validateCredentials, validateRun };
