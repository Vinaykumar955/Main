# Contributing to Campus Bazaar

Thanks for stopping by. Campus Bazaar is a **student-built portfolio project**,
so the bar for contributions is "would this make the demo more interesting?"
More than that, you're welcome to fork and experiment.

## Ground rules

1. **Be kind.** This is a learning space. Assume good faith.
2. **Keep the aesthetic consistent.** Nothing OS × Hermes Agent — monochrome,
   single red accent, dot-matrix textures, hairline borders, mechanical
   easing. New UI should feel like it belongs in the same device.
3. **TypeScript strict.** No `any` in the client, no untyped event handlers.
4. **No paid dependencies.** Free-tier services only.
5. **Don't commit secrets.** `.env` is git-ignored. `.env.example` is allowed.
6. **Don't commit build artifacts.** `node_modules/`, `dist/`, `.vite/`,
   `server/uploads/*`, `*.tsbuildinfo`, `*.log` are all ignored.

## Local setup

```bash
# 1. install everything (workspaces)
npm install

# 2. start client (5173) + server (5000) in parallel
npm run dev
```

The frontend runs against an in-memory store out of the box — no MongoDB
required. See the project README for the full MongoDB setup (local, Docker,
or Atlas free tier).

## Workflow

1. **Open an issue first** for non-trivial changes. The maintainer (Vinay)
   triages weekly. Trivial fixes (typos, broken links, manifest bugs) can
   go straight to PR.
2. **Branch from `main`.** Naming: `feat/<slug>`, `fix/<slug>`,
   `chore/<slug>`, `docs/<slug>`.
3. **Keep PRs small.** < 400 lines diff where possible. One concern per PR.
4. **Run the checks locally before pushing:**

   ```bash
   npm run type-check
   npm run lint
   npm run build
   ```

5. **Use Conventional Commits** for commit messages
   (`feat: …`, `fix: …`, `chore: …`, `docs: …`, `refactor: …`,
   `style: …`, `test: …`).
6. **PR template** is auto-injected — fill it in.

## Coding conventions

- **Client** (`client/src/`): feature-sliced (`features/<name>/`),
  no cross-feature imports. UI primitives live in `components/ui/`.
- **Server** (`server/src/`): controllers thin, services own the logic,
  Mongoose models in `models/`, validation via Zod schemas.
- **Tailwind:** tokens resolve to CSS variables (see `client/src/styles/index.css`).
  Don't hard-code hex values — use the existing utility classes.
- **Naming:** PascalCase for components, camelCase for hooks/utilities,
  UPPER_SNAKE for env vars and constants.

## Reporting bugs

Use the **Bug Report** issue template. Include:

- Steps to reproduce
- Expected vs actual behaviour
- Browser / Node version
- Screenshots or a short clip
- Console output, if any

## Suggesting features

Use the **Feature Request** issue template. New features should fit at least
one of:

- Help students find/sell items in their hostel
- Build trust between buyers and sellers
- Stay delightfully on-brand (the Nothing-OS vibe)

## License

By contributing, you agree that your contributions are licensed under the
project's **MIT License**.
