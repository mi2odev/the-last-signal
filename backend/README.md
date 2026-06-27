# The Last Signal — Backend

A REST API backed by an **online PostgreSQL database** (Aiven), powering **operator
accounts** and the **global leaderboard** for The Last Signal.

- **Express** — HTTP API
- **Aiven for PostgreSQL** (`pg`) — hosted Postgres in the cloud (free plan)
- **bcryptjs** — password hashing
- **jsonwebtoken** — stateless auth (JWT bearer tokens)

The data lives in the cloud, so it persists across deploys and is shared by every client.

## Create the online database (free)

1. Sign up at <https://aiven.io> (free, no card needed).
2. **Create service → PostgreSQL → Free plan**, pick a cloud/region, and create it.
3. Wait until the service status is **Running**, then open it. In the
   **Connection information** panel copy the **Service URI** — it looks like:
   ```
   postgres://avnadmin:PASSWORD@pg-xxxx-yourproj.aivencloud.com:12345/defaultdb?sslmode=require
   ```
4. Paste it into `backend/.env` as `DATABASE_URL` (see below). The schema is created
   automatically on first boot — no manual migration needed.

> The Service URI already contains the username and password, so it's the only value
> you need. Aiven requires TLS; `DATABASE_SSL=require` (the default) handles that.
> Optionally download the **CA Certificate** from the console and set `DATABASE_CA_CERT`
> for full certificate verification.

## Quick start

```bash
cd backend
npm install
cp .env.example .env          # Windows: copy .env.example .env
#  -> set DATABASE_URL (Aiven Service URI) and a real JWT_SECRET
npm run dev                   # starts http://localhost:4000 with auto-reload
```

`npm start` runs without the file watcher (for production).

## Configuration

All settings come from environment variables (see `.env.example`):

| Variable           | Default                         | Purpose                                              |
| ------------------ | ------------------------------- | ---------------------------------------------------- |
| `DATABASE_URL`     | _(required)_                    | Aiven Postgres Service URI (`postgres://…`)          |
| `DATABASE_SSL`     | `require`                       | `require` (Aiven) or `disable` (local non-TLS PG)    |
| `DATABASE_CA_CERT` | _(empty)_                       | Optional CA cert (path or PEM) for full TLS verify   |
| `PORT`             | `4000`                          | API port                                             |
| `JWT_SECRET`       | `dev-insecure-secret-change-me` | Signs access tokens — **change this**                |
| `JWT_EXPIRES_IN`   | `7d`                            | Token lifetime                                       |
| `CORS_ORIGIN`      | `http://localhost:5173`         | Allowed browser origin(s), or `*`                    |
| `BCRYPT_ROUNDS`    | `10`                            | Password hash cost                                   |

The server will not start without `DATABASE_URL`. In `NODE_ENV=production` it also
refuses to boot with the default `JWT_SECRET`.

## Data model

```
users
  id            BIGSERIAL PK
  username      TEXT        -- unique on lower(username), i.e. case-insensitive
  password_hash TEXT        -- bcrypt
  created_at    TIMESTAMPTZ

runs                        -- one row per completed typing mission
  id            BIGSERIAL PK
  user_id       BIGINT FK -> users.id (cascade delete)
  mission_id    TEXT        -- e.g. "LS-12" (nullable for quick play)
  wpm           REAL
  accuracy      REAL        -- 0..100
  mistakes      INTEGER
  keystrokes    INTEGER
  words         INTEGER
  duration_sec  REAL
  created_at    TIMESTAMPTZ
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
| GET    | `/stats/global`  | —        | —                           | `{ words, cities, runs, operators }` |
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

The leaderboard and home-page totals are entirely real — they reflect actual
registered operators and the runs they complete. There is no demo/seed data.
