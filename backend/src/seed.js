'use strict';

// Seeds the database with the demo operators shown in the original static UI so
// the leaderboard has content before real players sign up. Idempotent: skips
// operators that already exist. Run with `npm run seed`.

const db = require('./db');
const { hashPassword } = require('./auth');

const DEMO = [
  { user: 'NOVA_PRIME', wpm: 178, acc: 99.1, tests: 1284 },
  { user: 'GHOST_RELAY', wpm: 171, acc: 98.4, tests: 1109 },
  { user: 'AETHER_07', wpm: 166, acc: 98.9, tests: 980 },
  { user: 'CIPHER_X', wpm: 159, acc: 97.8, tests: 1442 },
  { user: 'HALCYON', wpm: 154, acc: 98.2, tests: 712 },
  { user: 'VESPER', wpm: 149, acc: 96.9, tests: 889 },
  { user: 'KESTREL', wpm: 138, acc: 96.1, tests: 604 },
  { user: 'MERIDIAN', wpm: 133, acc: 95.8, tests: 521 },
  { user: 'ZEPHYR_9', wpm: 129, acc: 97.0, tests: 466 },
];

const DEMO_PASSWORD = 'operator123';

const findUser = db.prepare('SELECT id FROM users WHERE username = ? COLLATE NOCASE');
const insertUser = db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)');
const insertRun = db.prepare(`
  INSERT INTO runs (user_id, mission_id, wpm, accuracy, mistakes, keystrokes, words, duration_sec)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

// Generate `tests` plausible runs whose MAX wpm equals the target best and whose
// AVG accuracy lands near the target accuracy.
function fabricateRuns(userId, target) {
  const insertMany = db.transaction((count) => {
    for (let i = 0; i < count; i++) {
      const isBest = i === 0;
      const wpm = isBest ? target.wpm : Math.max(40, target.wpm - 5 - Math.floor(Math.random() * 35));
      const acc = Math.min(100, Math.max(82, target.acc + (Math.random() * 4 - 2)));
      const words = 40 + Math.floor(Math.random() * 25);
      const keystrokes = words * 5;
      const mistakes = Math.round(keystrokes * (1 - acc / 100));
      const duration = Math.round((words / Math.max(wpm, 1)) * 60);
      insertRun.run(userId, null, wpm, Math.round(acc * 10) / 10, mistakes, keystrokes, words, duration);
    }
  });
  // Cap fabricated rows so seeding stays fast; the leaderboard only needs the count to be representative.
  insertMany(Math.min(target.tests, 60));
}

async function main() {
  const passwordHash = await hashPassword(DEMO_PASSWORD);
  let created = 0;

  const seedOne = (target) => {
    if (findUser.get(target.user)) return false;
    const info = insertUser.run(target.user, passwordHash);
    fabricateRuns(Number(info.lastInsertRowid), target);
    return true;
  };

  for (const target of DEMO) {
    if (seedOne(target)) created += 1;
  }

  // eslint-disable-next-line no-console
  console.log(`Seed complete. Created ${created} new demo operator(s) (password: "${DEMO_PASSWORD}").`);
  process.exit(0);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Seed failed:', err);
  process.exit(1);
});
