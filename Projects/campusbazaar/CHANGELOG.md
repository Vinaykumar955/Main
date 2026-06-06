# Changelog

All notable changes to **Campus Bazaar** are documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Round-2 polish pass: 3-line hamburger moved to the leftmost navbar slot;
  the CAMPUS//BAZAAR logo + version stamp shift right of it.
- `/browse` now opens with the filter panel turned **ON** by default; the
  FILTERS button is highlighted in the signal colour.
- `ImageWithFallback` now stamps a label overlay on every listing image so
  the product name is always visible, even if the upstream photo doesn't
  perfectly match the title.
- Demo-admin sign-in: a one-tap `SIGN_IN_AS_DEMO_ADMIN` button on the auth
  page and the admin-restricted gate. Credentials are pre-filled
  (`aarav_x@hostel.edu` / `password123`).
- Restricted admin layout now shows the demo credentials panel and a
  shortcut to sign in or jump to `/auth?email=…&password=…`.
- Universal `rounded` / `rounded-md` pass on buttons, inputs, selects,
  chips, cards, tiles, and the sidebar/drawer so the whole UI has a
  consistent corner radius.
- `hover:border-fg-subtle hover:shadow-panel-raised` pass on every
  clickable container (Discover tiles, Trust cards, category tiles,
  listing cards, the 3-rail grid in `/browse`).
- New `src/lib/notify.ts` helper that wraps the toast store with
  `toast.success/danger/info/warning/neutral(title, body)`.

### Changed
- Auth card is now `rounded-md`; auth feature rows on the left rail have
  hover lift.
- Free Zone and Midnight Rush row hover now nudges the row indicator in
  by 2px (`hover:pl-3.5`).

## [0.1.0] — Initial release

### Added
- Monorepo with `client/` (React 18 + Vite + TS strict) and `server/`
  (Node + Express + Mongoose).
- 21 feature modules: auth, listings, browse, create-listing, listing
  detail, messages, saved, notifications, profile, settings, admin
  dashboard, command palette, sidebar drawer, hero ticker, theming, etc.
- Design system: **Nothing OS × Hermes Agent** — off-black / off-white
  surfaces, single signal-red accent (themeable to cyan / amber / violet),
  dot-matrix textures, hairline borders, telemetry strips, ASCII
  separators, mechanical easing.
- Mock data layer (`src/data/localStore.ts`) that lets the entire UI run
  end-to-end without a backend.
- `authService` does a one-shot `/health` probe and falls through to the
  in-memory store when the API is down — useful for portfolio demos.
- 10 hostels: NC 1-6 + Zakir A-D. Sign-up form is wired to the list.
- 12 categories, ~36 listings across routers / textbooks / electronics
  / furniture / cycles / kitchen / sports / clothing / fest / free /
  services / other.
- Server tolerates MongoDB-not-running in dev: logs `mongo.continuing_without_db`
  and keeps listening.
- README with 30-second no-Mongo quick start, full MongoDB setup
  (local install / Docker / Atlas free tier), troubleshooting table,
  design tokens, and a11y notes.
- `.env.example` for both `client/` and `server/`.
- `server/src/seed.ts` for one-shot seeding (idempotent guarded).
