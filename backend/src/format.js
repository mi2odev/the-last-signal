'use strict';

// "1:02" style mm:ss for a single run.
function fmtDuration(sec) {
  const s = Math.max(0, Math.round(sec || 0));
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, '0')}`;
}

// "38h 24m" style for an accumulated total.
function fmtTotalTime(sec) {
  const total = Math.max(0, Math.round(sec || 0));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function comma(n) {
  return Number(n || 0).toLocaleString('en-US');
}

module.exports = { fmtDuration, fmtTotalTime, comma };
