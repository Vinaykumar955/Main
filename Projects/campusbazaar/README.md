# CAMPUS//BAZAAR

> A second-hand marketplace for hostel communities — routers, topper notes,
> cycles, diyas, fest decor, services. Cash on pickup, floor-rep sealed,
> no strangers, no shipping. Built as a student portfolio project.

```
CAMPUS//BAZAAR  v0.1.0  ·  HOSTEL.CIRC.0X42  ·  SIG=ON  ·  UPLINK=OK
```

![Status](https://img.shields.io/badge/status-active-success?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)
![Node](https://img.shields.io/badge/node-%E2%89%A518-339933?style=flat-square&logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?style=flat-square&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-18-61dafb?style=flat-square&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-5-646cff?style=flat-square&logo=vite&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-3-38bdf8?style=flat-square&logo=tailwindcss&logoColor=white)
![Mongo](https://img.shields.io/badge/MongoDB-optional-47a248?style=flat-square&logo=mongodb&logoColor=white)

---

## Table of Contents

- [Highlights](#highlights)
- [Demo](#demo)
- [Stack](#stack)
- [30-Second Quick Start (no MongoDB)](#30-second-quick-start-no-mongodb)
- [Connect MongoDB](#connect-mongodb)
  - [Option A — Local](#option-a--local-mongodb-easiest)
  - [Option B — Docker](#option-b--docker-zero-install)
  - [Option C — Atlas (free cloud)](#option-c--mongodb-atlas-free-cloud)
- [Architecture](#architecture)
- [Folder Structure](#folder-structure)
- [Scripts](#scripts)
- [Environment](#environment)
- [Design System](#design-system)
- [Accessibility](#accessibility)
- [Performance](#performance)
- [Roadmap](#roadmap)
- [Troubleshooting](#troubleshooting)
- [Author](#author)
- [License](#license)

---

## Highlights

- 🛏️ **Floor-only commerce** — 10 hostels (NC 1-6 + Zakir A-D), every
  transaction is between students on the same block.
- 🎨 **Nothing OS × Hermes Agent aesthetic** — off-black / off-white
  surfaces, single signal-red accent (swappable to cyan / amber / violet
  at runtime), dot-matrix textures, telemetry strips, hairline borders,
  ASCII separators, corner ticks, mechanical easing.
- ⚡ **Works without a backend** — `authService` does a one-shot
  `/health` probe and falls through to an in-memory store. The entire
  UI is demoable offline, in <30 seconds.
- 🧱 **Strict TypeScript, feature-sliced** — `noUncheckedIndexedAccess`,
  no cross-feature imports, barrel exports.
- 🛂 **Demo admin** — `aarav_x@hostel.edu` / `password123` is one tap away
  from the auth page and the admin-restricted gate.
- 🔍 **Trust built in** — floor-rep verification badges, in-app chat with
  paper trail, average 18-min pickup window, 0% fees.

## Demo

| Screen              | What to look for                                              |
|---------------------|---------------------------------------------------------------|
| `/`                 | Hero with typewriter phrases, ticker strip, FLOOR_PULSE card |
| `/browse`           | Filter panel **on by default**, grid + list views, 12 categories |
| `/listing/<id>`     | Image grid + label overlay, seller card, message modal        |
| `/sell`             | 5-step wizard, autosave to localStorage                       |
| `/messages`         | Threaded chat with paper trail                                |
| `/admin`            | RESTRICTED → demo-admin sign-in → dashboard                   |
| `Cmd/Ctrl + K`      | Command palette — search, jump, theme, accent                |

Run `npm run dev` and open <http://localhost:5173>.

## Stack

| Layer       | Tech                                                                          |
|-------------|-------------------------------------------------------------------------------|
| Client      | React 18 · Vite · TypeScript (strict) · Tailwind CSS · shadcn/ui patterns     |
| Server      | Node.js · Express · Mongoose · Zod · JWT · Multer                              |
| State       | TanStack Query (server) · Zustand (client, persisted)                          |
| Forms       | react-hook-form + zod resolvers                                                |
| Animation   | framer-motion (respects `prefers-reduced-motion`)                             |
| Tooling     | Concurrently · tsx · ESLint 9 (flat) · Prettier · pino                        |
| Optional    | Supabase (env-flagged) — wire-in instructions in `features/auth/authService.ts` |

## 30-Second Quick Start (no MongoDB)

The frontend runs entirely against an in-memory store out of the box.
You can try the whole app without installing MongoDB.

```bash
# 1. install
npm install

# 2. (optional) copy envs
cp server/.env.example server/.env
cp client/.env.example client/.env.local

# 3. dev — runs both client (5173) and server (5000) in parallel
npm run dev
```

Open <http://localhost:5173>. Sign in with any `.edu` email + 8+ char password
(the mock auth accepts anything). For the seeded admin, use
`aarav_x@hostel.edu` / `password123`.

> **No data is persisted** in this mode — refresh the page and you're back
> to the seed listings baked into `client/src/data/mockData.ts`. To get
> real persistence, hook up MongoDB (next section).

## Connect MongoDB

### Why

- **Persistence across restarts.** The in-browser store resets on every
  page refresh; MongoDB survives server restarts.
- **Cross-device auth.** Without a database, "signing in" on a different
  device creates a brand-new user. With MongoDB, the same email/password
  works everywhere.
- **Server-side queries.** Filters, search, sort, pagination are real
  database queries — no client-side faking.
- **Multer uploads.** Images uploaded to `POST /uploads/listings` are
  written to disk, but their metadata needs Mongo to be queryable.

### Option A — Local MongoDB (easiest)

1. **Install MongoDB Community Edition** for your OS:
   - **Windows**: download the MSI from
     <https://www.mongodb.com/try/download/community>, run it. Make sure
     "Install MongoDB as a Service" is checked.
   - **macOS**: `brew tap mongodb/brew && brew install mongodb-community`
   - **Linux (Ubuntu/Debian)**: follow
     <https://www.mongodb.com/docs/manual/installation/>

2. **Verify it's running:**
   ```bash
   # Windows
   net start | findstr MongoDB

   # macOS / Linux
   brew services list  # or: systemctl status mongod
   ```
   You should see the `mongodb` / `mongod` service running. Default port
   is **27017**.

3. **Wire it up** — copy and edit the env file:
   ```bash
   cp server/.env.example server/.env
   ```
   Confirm (or change) the URI:
   ```env
   MONGODB_URI=mongodb://127.0.0.1:27017/campusbazaar
   JWT_SECRET=replace-with-long-random-string
   ```

4. **Seed the database** (categories + demo admin + a couple of listings):
   ```bash
   npm run seed
   ```

5. **Run the app:**
   ```bash
   npm run dev
   ```
   On boot you should now see `mongo.connected` instead of
   `mongo.connection_failed`.

### Option B — Docker (zero-install)

```bash
docker run -d --name cb-mongo -p 27017:27017 -v cb-mongo-data:/data/db mongo:7
```

The default `MONGODB_URI=mongodb://127.0.0.1:27017/campusbazaar` in
`server/.env.example` works as-is. Run `npm run seed && npm run dev`.

Stop / remove later:
```bash
docker stop cb-mongo             # keep data
docker rm cb-mongo               # also delete the container
docker volume rm cb-mongo-data   # wipe data
```

### Option C — MongoDB Atlas (free cloud)

1. Create an account at <https://www.mongodb.com/cloud/atlas/register>.
2. Create a **free M0 cluster** in the region closest to you. Atlas
   spins it up in ~3 minutes.
3. **Whitelist your IP** under *Security → Network Access*. For local
   dev, click "Add Current IP Address".
4. **Create a database user** under *Security → Database Access* — note
   the username & password.
5. **Get the connection string** under *Deployment → Connect → Drivers*:
   ```
   mongodb+srv://USER:PASS@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. In `server/.env`:
   ```env
   MONGODB_URI=mongodb+srv://USER:PASS@cluster0.xxxxx.mongodb.net/campusbazaar?retryWrites=true&w=majority
   ```
7. `npm run seed && npm run dev`.

### Verifying the connection

- **In the dev-server logs** you should see `mongo.connected { host: "..." }`
  instead of `mongo.connection_failed`.
- **In your browser**, open <http://localhost:5000/api/health> — you
  should get `{"status":"ok"}`.
- **In `mongosh`** (or Compass), run `use campusbazaar; show collections;`
  — you should see `users`, `listings`, `categories`.

## Architecture

```
┌────────────────────────┐         ┌────────────────────────┐
│  Browser (React SPA)   │         │   MongoDB (optional)   │
│  Vite :5173            │  HTTP   │   :27017               │
│  TanStack Query        ├────────►│   Mongoose models      │
│  Zustand (persisted)   │   /api  │   Zod validation       │
│  Tailwind + tokens     │         │   JWT auth             │
└────────────────────────┘         └────────────────────────┘
            │                                 ▲
            │   /uploads/* (multer disk)      │
            └─────────────────────────────────┘
```

When the API is unreachable, the client falls through to
`client/src/data/localStore.ts` — a fully-functional in-memory
implementation of every hook. Same query keys, same response shape.

## Folder Structure

```
campusbazaar/
├─ client/                              React + Vite SPA
│  ├─ public/                           static assets (favicon, manifest)
│  ├─ src/
│  │  ├─ app/                           bootstrap (App, main, providers)
│  │  ├─ config/                        env, copy, theme, accent palette
│  │  ├─ styles/                        tailwind + global CSS tokens
│  │  ├─ lib/                           pure utils, errors, notify
│  │  ├─ types/                         shared domain types
│  │  ├─ hooks/                         cross-feature primitives
│  │  ├─ services/                      axios instance + API helpers
│  │  ├─ data/                          mock data + local store
│  │  ├─ store/                         zustand stores (auth, ui, listings,
│  │  │                                 modal, toast)
│  │  ├─ components/
│  │  │  ├─ ui/                         primitives (Button, Card, Modal, …)
│  │  │  └─ layout/                     shells (Layout, Navbar, Sidebar,
│  │  │                                 CommandPalette, …)
│  │  ├─ features/                      auth, listings, profile, messages,
│  │  │                                 settings, admin, … (21 features)
│  │  └─ routes/                        route table (lazy)
│  ├─ tailwind.config.ts                tokens resolve to CSS variables
│  ├─ vite.config.ts                    proxy /api + /uploads → :5000
│  └─ tsconfig.json                     strict + noUncheckedIndexedAccess
│
└─ server/                              Express API
   ├─ src/
   │  ├─ config/                        env, db
   │  ├─ utils/                         logger, token, errors, asyncHandler
   │  ├─ models/                        User, Listing, Message, …
   │  ├─ middleware/                    auth, upload, errorHandler
   │  ├─ routes/                        /api/{auth,listings,users,messages,…}
   │  ├─ app.ts                         express composition
   │  ├─ server.ts                      boot (handles EADDRINUSE cleanly)
   │  └─ seed.ts                        one-shot seed
   └─ .env.example
```

### Feature-slicing rules

- A feature (`features/auth/`) may import from `components/`, `hooks/`,
  `lib/`, `store/`, `services/`, `data/`, `types/`, `styles/`.
- A feature must **not** import from another feature.
- UI primitives (`components/ui/`) must not import from features.
- Barrel exports via `index.ts`; deep imports discouraged.

## Scripts

| From root           | What it does                                  |
|---------------------|-----------------------------------------------|
| `npm run dev`       | Run client + server with concurrently         |
| `npm run dev:client`| Vite dev server on :5173                      |
| `npm run dev:server`| tsx watch on server, :5000                    |
| `npm run build`     | Type-check + build both workspaces            |
| `npm run lint`      | ESLint (client)                               |
| `npm run type-check`| TypeScript check for both workspaces          |
| `npm run seed`      | Seed MongoDB with categories + demo data      |
| `npm run format`    | Prettier (client)                             |

## Environment

### `server/.env`

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://127.0.0.1:27017/campusbazaar
JWT_SECRET=replace-with-long-random-string
JWT_EXPIRE=7d
UPLOAD_DIR=uploads
```

If `MONGODB_URI` is unset (or Mongo is down), the server logs a warning
and still boots so the client can run in mock mode. No data is persisted
between restarts.

### `client/.env.local`

```env
VITE_API_URL=/api
VITE_APP_ENV=development
VITE_BUILD_HASH=local

# Optional — enable Supabase for auth (falls back to in-memory store if unset).
# VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
# VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

## Design System

Defined in `client/tailwind.config.ts` and `client/src/styles/index.css`.

- **Ink** (`ink-50` … `ink-950`) — surfaces and text
- **Paper** (`paper-50` … `paper-950`) — light-mode surfaces
- **Signal** (`signal-300` … `signal-700`) — primary accent (red; swappable
  to cyan / amber / violet at runtime via accent picker in Settings)
- **Status** — `success`, `warning`, `info`
- Custom utilities: `.text-tabular`, `.text-mono`, `.text-display`,
  `.glass`, `.corner-ticks`, `.skeleton`, `.text-glow`, `.scanline`,
  `.hairline-b/.t`, `.caret`

All Tailwind colours are wired to CSS variables, so the user's theme +
accent choice re-skins the whole app by setting classes / inline vars on
`<html>` — no rebuild needed. All animations respect
`prefers-reduced-motion`.

## Accessibility

- Keyboard-first: `Cmd/Ctrl+K` opens command palette, all dialogs trap
  focus, `Esc` closes, `Enter` submits.
- All interactive elements meet 3:1 contrast and have visible focus rings
  (`focus-visible:outline-signal`).
- Semantic landmarks (`<header>`, `<nav>`, `<main>`, `<aside>`, `<footer>`).
- Forms use proper `<label>`s and `aria-describedby` for errors.
- Images have meaningful `alt` text; decorative ones use `alt=""`.
- Reduced-motion media query disables non-essential animation.
- All buttons / links have accessible names; tooltips and ARIA labels
  where icons stand alone.

## Performance

- **Lazy routes** — every page is `React.lazy` + `<Suspense>`.
- **Manual chunks** — `vendor`, `query`, `motion` split via Vite
  `build.rollupOptions.output.manualChunks`.
- **Image fallbacks** — `ImageWithFallback` shows a labelled placeholder
  when the upstream photo is missing or mismatched.
- **Persisted UI state** — Zustand `persist` middleware keeps auth, UI
  preferences, and saved listings across reloads.
- **No re-render thrash** — selectors are used everywhere; the listings
  grid uses `auto-rows-fr` for stable card heights.

## Roadmap

- [x] Mock-only mode (`/browse`, `/sell`, `/messages`, `/saved`,
      `/notifications`, `/profile`, `/settings`, `/admin`)
- [x] Lazy routes + manual chunks
- [x] Command palette + sidebar drawer
- [x] Demo-admin sign-in flow
- [x] Filter panel default-ON
- [x] Image-with-title-label fallback
- [x] Universal `rounded` / hover pass
- [ ] Real Supabase wiring (env-flagged, awaits user keys)
- [ ] Storybook for `components/ui/`
- [ ] Playwright E2E for the happy paths
- [ ] PWA manifest + service worker (offline browse cache)
- [ ] Push-notification opt-in via web-push

## Troubleshooting

| Symptom                                | Fix                                                                                            |
|----------------------------------------|------------------------------------------------------------------------------------------------|
| `ECONNREFUSED 127.0.0.1:27017`         | Mongo isn't running. Start the service (`net start MongoDB` / `brew services start mongodb-community` / `docker start cb-mongo`). |
| `MongooseServerSelectionError` in prod | `MONGODB_URI` is wrong. Test it with `mongosh "<uri>"`.                                        |
| `Authentication failed`                | Username/password wrong, or you forgot `?authSource=admin`.                                   |
| Seed runs but the app still shows mock data | You're hitting the in-memory store, not the API. Set `VITE_API_URL=/api` in `client/.env.local` and restart `npm run dev`. |
| Port 5000 already in use                | Another process is on :5000. Either stop it or set `PORT=5050` in `server/.env`.            |
| RENDER_FAILED on a route               | An orphan Vite is serving a stale build. Kill stray `tsx`/`node` processes and re-run `npm run dev`. |
| `Failed to fetch dynamically imported module` | Vite proxy / build cache out of sync. Stop dev server, delete `client/.vite`, restart. |

## Author

**Vinay Kumar** — [@vinaykumar955](https://github.com/vinaykumar955)

Student-built portfolio piece. If you spot a bug, a typo, or a way to
improve the demo, [open an issue](../../issues) — feedback is welcome.

## License

[MIT](./LICENSE) — student project, no warranties.
