'use strict';

const { get, all, run } = require('../db');
const { validateRun } = require('../validators');
const { fmtDuration, fmtTotalTime, comma } = require('../format');

const SQL = {
  insertRun: `
    INSERT INTO runs (user_id, mission_id, wpm, accuracy, mistakes, keystrokes, words, duration_sec)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,

  // One aggregated row per operator who has logged at least one run.
  leaderboard: `
    SELECT u.id, u.username,
           MAX(r.wpm)                        AS best_wpm,
           ROUND(AVG(r.accuracy)::numeric, 1) AS avg_acc,
           COUNT(r.id)                       AS tests
    FROM users u
    JOIN runs r ON r.user_id = u.id
    GROUP BY u.id, u.username
    ORDER BY best_wpm DESC, avg_acc DESC, tests DESC
    LIMIT $1`,

  // The caller's rank, computed across every operator (not just the top page).
  myRank: `
    WITH board AS (
      SELECT u.id,
             MAX(r.wpm)                         AS best_wpm,
             ROUND(AVG(r.accuracy)::numeric, 1) AS avg_acc,
             COUNT(r.id)                        AS tests,
             RANK() OVER (
               ORDER BY MAX(r.wpm) DESC, ROUND(AVG(r.accuracy)::numeric, 1) DESC, COUNT(r.id) DESC
             ) AS rank
      FROM users u
      JOIN runs r ON r.user_id = u.id
      GROUP BY u.id
    )
    SELECT * FROM board WHERE id = $1`,

  summary: `
    SELECT
      MAX(wpm)                          AS best_wpm,
      ROUND(AVG(wpm)::numeric, 0)       AS avg_wpm,
      ROUND(AVG(accuracy)::numeric, 1)  AS avg_acc,
      MAX(accuracy)                     AS best_acc,
      COUNT(id)                         AS total_tests,
      COALESCE(SUM(words), 0)           AS total_words,
      COALESCE(SUM(duration_sec), 0)    AS total_time,
      COUNT(DISTINCT mission_id) FILTER (WHERE mission_id IS NOT NULL) AS cities
    FROM runs WHERE user_id = $1`,

  recent: `
    SELECT mission_id, wpm, accuracy, mistakes, duration_sec, created_at
    FROM runs WHERE user_id = $1
    ORDER BY created_at DESC, id DESC LIMIT $2`,

  perDay: `
    SELECT to_char(created_at::date, 'YYYY-MM-DD') AS day, COUNT(*)::int AS v
    FROM runs WHERE user_id = $1 AND created_at >= (now() - interval '6 days')::date
    GROUP BY 1`,

  joined: `SELECT created_at FROM users WHERE id = $1`,

  series: `
    SELECT wpm FROM runs WHERE user_id = $1
    ORDER BY created_at ASC, id ASC LIMIT 12`,

  accDist: `
    SELECT
      SUM(CASE WHEN accuracy >= 98 THEN 1 ELSE 0 END)                  AS top,
      SUM(CASE WHEN accuracy >= 95 AND accuracy < 98 THEN 1 ELSE 0 END) AS high,
      SUM(CASE WHEN accuracy >= 90 AND accuracy < 95 THEN 1 ELSE 0 END) AS mid,
      SUM(CASE WHEN accuracy < 90 THEN 1 ELSE 0 END)                   AS low,
      COUNT(id)                                                        AS total
    FROM runs WHERE user_id = $1`,

  // Network-wide totals for the home page cards.
  global: `
    SELECT
      (SELECT COALESCE(SUM(words), 0) FROM runs)                                AS words,
      (SELECT COUNT(DISTINCT mission_id) FROM runs WHERE mission_id IS NOT NULL) AS cities,
      (SELECT COUNT(*) FROM runs)                                               AS runs,
      (SELECT COUNT(*) FROM users)                                             AS operators`,
};

// pg returns TIMESTAMPTZ as a JS Date and bigint/numeric as strings — normalise here.
function fmtDate(value) {
  const d = value instanceof Date ? value : new Date(value);
  return d.toISOString().slice(0, 10).replace(/-/g, '.');
}

// POST /api/runs — record a completed transmission for the authenticated operator.
async function submitRun(req, res) {
  const body = req.body || {};
  const errors = validateRun(body);
  if (errors.length) return res.status(400).json({ error: errors.join('. ') });

  const keystrokes = Number.isFinite(body.keystrokes) ? Math.round(body.keystrokes) : 0;
  const words = Number.isFinite(body.words) ? Math.round(body.words) : Math.round(keystrokes / 5);

  await run(SQL.insertRun, [
    req.user.sub,
    body.missionId || null,
    Math.round(body.wpm * 10) / 10,
    Math.round(body.accuracy * 10) / 10,
    Number.isFinite(body.mistakes) ? Math.round(body.mistakes) : 0,
    keystrokes,
    words,
    Number.isFinite(body.durationSec) ? body.durationSec : 0,
  ]);

  return res.status(201).json({ ok: true });
}

// GET /api/leaderboard — public; flags the caller's row when authenticated.
async function leaderboard(req, res) {
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 50, 1), 200);
  const rows = await all(SQL.leaderboard, [limit]);
  const meId = req.user ? req.user.sub : null;

  const board = rows.map((r, i) => ({
    rank: i + 1,
    user: r.username,
    wpm: Math.round(Number(r.best_wpm)),
    acc: Number(r.avg_acc),
    tests: Number(r.tests),
    me: meId === Number(r.id),
  }));

  const response = { leaderboard: board };

  // If the caller is logged in but outside the returned page, include their standing.
  if (meId && !board.some((b) => b.me)) {
    const mine = await get(SQL.myRank, [meId]);
    if (mine) {
      response.you = {
        rank: Number(mine.rank),
        user: req.user.username,
        wpm: Math.round(Number(mine.best_wpm)),
        acc: Number(mine.avg_acc),
        tests: Number(mine.tests),
        me: true,
      };
    }
  }

  return res.json(response);
}

// Build a real 7-day "tests per day" series (zero-filled) from per-day counts.
const DOW = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
function buildTestsPerDay(rows) {
  const map = {};
  rows.forEach((r) => { map[r.day] = Number(r.v) || 0; });
  const out = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    out.push({ d: DOW[d.getDay()], v: map[key] || 0 });
  }
  return out;
}

// GET /api/stats/me — full dashboard payload for the authenticated operator.
async function stats(req, res) {
  const uid = req.user.sub;
  const s = (await get(SQL.summary, [uid])) || {};

  const recentRows = await all(SQL.recent, [uid, 8]);
  const recent = recentRows.map((r) => ({
    date: fmtDate(r.created_at),
    missionId: r.mission_id || null,
    wpm: Math.round(Number(r.wpm)),
    acc: Math.round(Number(r.accuracy) * 10) / 10,
    dur: fmtDuration(Number(r.duration_sec)),
    miss: Number(r.mistakes),
  }));

  const seriesRows = await all(SQL.series, [uid]);
  const wpmSeries = seriesRows.map((r) => Math.round(Number(r.wpm)));

  const d = (await get(SQL.accDist, [uid])) || {};
  const total = Number(d.total) || 0;
  const pct = (n) => (total ? Math.round((Number(n) / total) * 100) : 0);
  const accDist = [
    { label: '98-100%', pct: pct(d.top), color: '#00E5FF' },
    { label: '95-97%', pct: pct(d.high), color: '#8B5CF6' },
    { label: '90-94%', pct: pct(d.mid), color: '#FF7A00' },
    { label: 'below 90%', pct: pct(d.low), color: '#5d6f92' },
  ];

  const testsPerDay = buildTestsPerDay(await all(SQL.perDay, [uid]));
  const joinedRow = await get(SQL.joined, [uid]);

  const totalTests = Number(s.total_tests) || 0;
  const bestWpm = Math.round(Number(s.best_wpm) || 0);
  const bestAcc = Number(s.best_acc) || 0;
  const totalTimeSec = Number(s.total_time) || 0;
  const cities = Number(s.cities) || 0;

  // Achievements are derived from real stats (no fabricated unlocks).
  const achievements = {
    firstLight: totalTests >= 1,
    speedDemon: bestWpm >= 140,
    perfectSignal: bestAcc >= 100,
    centurion: totalTests >= 10,
    marathon: totalTimeSec >= 1800,
    globetrotter: cities >= 50,
  };

  return res.json({
    stat: {
      bestWpm,
      avgWpm: Math.round(Number(s.avg_wpm) || 0),
      avgAcc: Number(s.avg_acc) || 0,
      totalTests,
      totalWords: comma(Number(s.total_words) || 0),
      totalTime: fmtTotalTime(totalTimeSec),
    },
    recent,
    wpmSeries,
    accDist,
    testsPerDay,
    achievements,
    joined: joinedRow ? fmtDate(joinedRow.created_at) : null,
  });
}

// GET /api/stats/global — public network-wide totals for the home page.
async function globalStats(req, res) {
  const r = (await get(SQL.global, [])) || {};
  return res.json({
    words: Number(r.words) || 0,
    cities: Number(r.cities) || 0,
    runs: Number(r.runs) || 0,
    operators: Number(r.operators) || 0,
  });
}

module.exports = { submitRun, leaderboard, stats, globalStats };
