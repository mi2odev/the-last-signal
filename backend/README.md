# The Last Signal — Backend

A self-contained REST API + SQLite database powering **operator accounts** and the
**global leaderboard** for The Last Signal.

- **Express** — HTTP API
- **SQLite** (via `better-sqlite3`) — zero-config embedded database, a single file under `data/`
- **bcryptjs** — password hashing
- **jsonwebtoken** — stateless auth (JWT bearer tokens)

No external database server is required — the database is just a file.

## Quick start

```bash
cd backend
npm install
cp .env.example .env          # then edit JWT_SECRET (Windows: copy .env.example .env)
npm run seed                  # optional: load demo leaderboard operators
npm run dev                   # starts http://localhost:4000 with auto-reload
```

`npm start` runs without the file watcher (for production).

## Configuration

All settings come from environment variables (see `.env.example`):

| Variable        | Default                         | Purpose                                    |
| --------------- | ------------------------------- | ------------------------------------------ |
| `PORT`          | `4000`                          | API port                                   |
| `JWT_SECRET`    | `dev-insecure-secret-change-me` | Signs access tokens — **change this**      |
| `JWT_EXPIRES_IN`| `7d`                            | Token lifetime                             |
| `DB_FILE`       | `./data/the-last-signal.db`     | SQLite file location                       |
| `CORS_ORIGIN`   | `http://localhost:5173`         | Allowed browser origin(s), or `*`          |
| `BCRYPT_ROUNDS` | `10`                            | Password hash cost                         |

In `NODE_ENV=production` the server refuses to boot with the default secret.

## Data model

```
users
  id            INTEGER PK
  username      TEXT UNIQUE (case-insensitive)
  password_hash TEXT (bcrypt)
  created_at    TEXT

runs                       -- one row per completed typing mission
  id            INTEGER PK
  user_id       INTEGER FK -> users.id (cascade delete)
  mission_id    TEXT       -- e.g. "LS-12" (nullable for quick play)
  wpm           REAL
  accuracy      REAL       -- 0..100
  mistakes      INTEGER
  keystrokes    INTEGER
  words         INTEGER
  duration_sec  REAL
  created_at    TEXT
```

The leaderboard and personal stats are **derived** from `runs` with aggregate
queries — best WPM is `MAX(wpm)`, accuracy is `AVG(accuracy)`, tests is `COUNT(*)`.

## API

Base path: `/api`

### Auth

| Method | Path             | Auth | Body                        | Response |
| ------ | ---------------- | ---- | --------------------------- | -------- |
| POST   | `/auth/register` | —    | `{ username, password }`    | `{ token, user }` |
| POST   | `/auth/login`    | —    | `{ username, password }`    | `{ token, user }` |
| GET    | `/auth/me`       | ✔    | —                           | `{ user }` |

- Callsign: 3-20 chars, `[A-Za-z0-9_-]`, unique (case-insensitive).
- Access code: 6-100 chars.
- Auth endpoints are rate-limited to 20 attempts / IP / 15 min.

### Leaderboard & stats

| Method | Path             | Auth     | Body / Query                | Response |
| ------ | ---------------- | -------- | --------------------------- | -------- |
| GET    | `/leaderboard`   | optional | `?limit=50`                 | `{ leaderboard: [...], you? }` |
| POST   | `/runs`          | ✔        | run payload (below)         | `{ ok: true }` |
| GET    | `/stats/me`      | ✔        | —                           | `{ stat, recent, wpmSeries, accDist }` |
| GET    | `/health`        | —        | —                           | `{ status: "ok", ... }` |

Run payload:

```json
{
  "missionId": "LS-12",
  "wpm": 142,
  "accuracy": 97.4,
  "mistakes": 4,
  "keystrokes": 740,
  "durationSec": 62
}
```

`leaderboard` rows match the shape the frontend already renders:

```json
{ "rank": 1, "user": "NOVA_PRIME", "wpm": 178, "acc": 99.1, "tests": 1284, "me": false }
```

When you pass a bearer token, your own row is flagged `me: true`; if you rank below
the returned page, your standing is added as a separate `you` field.

## Auth flow

1. `POST /auth/register` or `/auth/login` → returns a JWT `token`.
2. Send it on protected requests: `Authorization: Bearer <token>`.
3. After each finished mission, `POST /api/runs` with the result.
4. Read `GET /api/leaderboard` and `GET /api/stats/me` to populate the UI.

## Connecting the frontend

A ready-made client lives at [`../src/api.js`](../src/api.js). It stores the token in
`localStorage` and exposes `api.register / login / leaderboard / submitRun / myStats`.

If your backend is not on `http://localhost:4000`, set `VITE_API_URL` in a root `.env`:

```
VITE_API_URL=http://localhost:4000/api
```

Example wiring inside `src/App.jsx`:

```js
import { api } from './api';

// replace the cosmetic register()/login() handlers:
async register(e) {
  if (e?.preventDefault) e.preventDefault();
  try {
    await api.register(this.state.authUser, this.state.authPass);
    this.setState({ registered: true });
    this.toast('OPERATOR CREATED', 'ok');
  } catch (err) { this.toast(err.message.toUpperCase(), 'rec'); }
}

async login(e) {
  if (e?.preventDefault) e.preventDefault();
  try {
    await api.login(this.state.authUser, this.state.authPass);
    this.toast('SIGNAL CONNECTED', 'ok');
    setTimeout(() => this.go('home'), 750);
  } catch (err) { this.toast(err.message.toUpperCase(), 'rec'); }
}

// after a mission completes (_finish), submit the result:
api.submitRun({ missionId: m.id, wpm, accuracy: acc, mistakes, keystrokes, durationSec: el })
  .catch(() => {});

// load the live leaderboard / stats where the static arrays are used:
const { leaderboard } = await api.leaderboard();
const stats = await api.myStats();
```

## Demo accounts

After `npm run seed`, the demo operators (`NOVA_PRIME`, `GHOST_RELAY`, …) all share the
password `operator123`.
