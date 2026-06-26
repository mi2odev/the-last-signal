'use strict';

const db = require('../db');
const { validateRun } = require('../validators');
const { fmtDuration, fmtTotalTime, comma } = require('../format');

const stmts = {
  insertRun: db.prepare(`
    INSERT INTO runs (user_id, mission_id, wpm, accuracy, mistakes, keystrokes, words, duration_sec)
    VALUES (@user_id, @mission_id, @wpm, @accuracy, @mistakes, @keystrokes, @words, @duration_sec)
  `),

  // One aggregated row per operator who has logged at least one run.
  leaderboard: db.prepare(`
    SELECT u.id, u.username,
           MAX(r.wpm)             AS best_wpm,
           ROUND(AVG(r.accuracy), 1) AS avg_acc,
           COUNT(r.id)            AS tests
    FROM users u
    JOIN runs r ON r.user_id = u.id
    GROUP BY u.id
    ORDER BY best_wpm DESC, avg_acc DESC, tests DESC
    LIMIT ?
  `),

  // The caller's rank, computed across every operator (not just the top page).
  myRank: db.prepare(`
    WITH board AS (
      SELECT u.id,
             MAX(r.wpm)             AS best_wpm,
             ROUND(AVG(r.accuracy), 1) AS avg_acc,
             COUNT(r.id)            AS tests,
             RANK() OVER (ORDER BY MAX(r.wpm) DESC, ROUND(AVG(r.accuracy),1) DESC, COUNT(r.id) DESC) AS rank
      FROM users u
      JOIN runs r ON r.user_id = u.id
      GROUP BY u.id
    )
    SELECT * FROM board WHERE id = ?
  `),

  summary: db.prepare(`
    SELECT
      MAX(wpm)                       AS best_wpm,
      ROUND(AVG(wpm), 0)             AS avg_wpm,
      COUNT(id)                      AS total_tests,
      COALESCE(SUM(words), 0)        AS total_words,
      COALESCE(SUM(duration_sec), 0) AS total_time
    FROM runs WHERE user_id = ?
  `),

  recent: db.prepare(`
    SELECT wpm, accuracy, mistakes, duration_sec, created_at
    FROM runs WHERE user_id = ?
    ORDER BY created_at DESC, id DESC LIMIT ?
  `),

  series: db.prepare(`
    SELECT wpm FROM runs WHERE user_id = ?
    ORDER BY created_at ASC, id ASC LIMIT 12
  `),

  accDist: db.prepare(`
    SELECT
      SUM(CASE WHEN accuracy >= 98 THEN 1 ELSE 0 END)                  AS top,
      SUM(CASE WHEN accuracy >= 95 AND accuracy < 98 THEN 1 ELSE 0 END) AS high,
      SUM(CASE WHEN accuracy >= 90 AND accuracy < 95 THEN 1 ELSE 0 END) AS mid,
      SUM(CASE WHEN accuracy < 90 THEN 1 ELSE 0 END)                   AS low,
      COUNT(id)                                                        AS total
    FROM runs WHERE user_id = ?
  `),
};

// POST /api/runs — record a completed transmission for the authenticated operator.
function submitRun(req, res) {
  const body = req.body || {};
  const errors = validateRun(body);
  if (errors.length) return res.status(400).json({ error: errors.join('. ') });

  const keystrokes = Number.isFinite(body.keystrokes) ? Math.round(body.keystrokes) : 0;
  const words = Number.isFinite(body.words) ? Math.round(body.words) : Math.round(keystrokes / 5);

  stmts.insertRun.run({
    user_id: req.user.sub,
    mission_id: body.missionId || null,
    wpm: Math.round(body.wpm * 10) / 10,
    accuracy: Math.round(body.accuracy * 10) / 10,
    mistakes: Number.isFinite(body.mistakes) ? Math.round(body.mistakes) : 0,
    keystrokes,
    words,
    duration_sec: Number.isFinite(body.durationSec) ? body.durationSec : 0,
  });

  return res.status(201).json({ ok: true });
}

// GET /api/leaderboard — public; flags the caller's row when authenticated.
function leaderboard(req, res) {
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 50, 1), 200);
  const rows = stmts.leaderboard.all(limit);
  const meId = req.user ? req.user.sub : null;

  const board = rows.map((r, i) => ({
    rank: i + 1,
    user: r.username,
    wpm: Math.round(r.best_wpm),
    acc: r.avg_acc,
    tests: r.tests,
    me: meId === r.id,
  }));

  const response = { leaderboard: board };

  // If the caller is logged in but outside the returned page, include their standing.
  if (meId && !board.some((b) => b.me)) {
    const mine = stmts.myRank.get(meId);
    if (mine) {
      response.you = {
        rank: mine.rank,
        user: req.user.username,
        wpm: Math.round(mine.best_wpm),
        acc: mine.avg_acc,
        tests: mine.tests,
        me: true,
      };
    }
  }

  return res.json(response);
}

// GET /api/stats/me — full dashboard payload for the authenticated operator.
function stats(req, res) {
  const uid = req.user.sub;
  const s = stmts.summary.get(uid) || {};

  const recent = stmts.recent.all(uid, 8).map((r) => ({
    date: String(r.created_at).slice(0, 10).replace(/-/g, '.'),
    wpm: Math.round(r.wpm),
    acc: Math.round(r.accuracy * 10) / 10,
    dur: fmtDuration(r.duration_sec),
    miss: r.mistakes,
  }));

  const wpmSeries = stmts.series.all(uid).map((r) => Math.round(r.wpm));

  const d = stmts.accDist.get(uid) || {};
  const total = d.total || 0;
  const pct = (n) => (total ? Math.round((n / total) * 100) : 0);
  const accDist = [
    { label: '98-100%', pct: pct(d.top), color: '#00E5FF' },
    { label: '95-97%', pct: pct(d.high), color: '#8B5CF6' },
    { label: '90-94%', pct: pct(d.mid), color: '#FF7A00' },
    { label: 'below 90%', pct: pct(d.low), color: '#5d6f92' },
  ];

  return res.json({
    stat: {
      bestWpm: Math.round(s.best_wpm || 0),
      avgWpm: Math.round(s.avg_wpm || 0),
      totalTests: s.total_tests || 0,
      totalWords: comma(s.total_words || 0),
      totalTime: fmtTotalTime(s.total_time || 0),
    },
    recent,
    wpmSeries,
    accDist,
  });
}

module.exports = { submitRun, leaderboard, stats };
