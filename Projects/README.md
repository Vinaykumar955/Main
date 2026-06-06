# Projects

A collection of student-built projects. Each sub-directory is an
independent project with its own README, license, and tooling.

```
Projects/
├── README.md           # This file
├── campusbazaar/       # Second-hand hostel marketplace
├── codelens-ai/        # VS Code extension for AI code learning
├── codelens-ai-web/    # Standalone web app version of CodeLens AI
└── e-commerce/         # MERN stack e-commerce platform
```

---

## 1. Campus Bazaar

> A second-hand marketplace for hostel communities — Nothing OS × Hermes
> Agent aesthetic, 10 hostels (NC 1-6 + Zakir A-D), 12 categories, demo
> admin, in-memory fallback so the whole UI runs without a backend.

**Stack:** React 18 · Vite · TypeScript (strict) · Tailwind · Express · Mongoose · TanStack Query · Zustand

```bash
cd campusbazaar
npm install
npm run dev
# → http://localhost:5173  (Vite client)
# → http://localhost:5000  (Express API, optional)
```

See [`campusbazaar/README.md`](./campusbazaar/README.md) for the full
feature list, MongoDB setup (local / Docker / Atlas), architecture
diagram, and design system notes.

## 2. CodeLens AI — VS Code Extension

> An AI-powered code learning assistant integrated directly into VS Code.
> Provides inline explanations, complexity heatmaps, code smell detection,
> and educational features like spaced repetition and quiz mode — all
> without leaving your editor.

**Stack:** TypeScript · VS Code API · esbuild · OpenRouter AI
**Tests:** 158 passing (Mocha + ts-node)

```bash
cd codelens-ai
npm install
npm run compile
# Press F5 in VS Code to launch extension
```

See [`codelens-ai/README.md`](./codelens-ai/README.md).

## 3. CodeLens AI — Standalone Web App

> A zero-dependency, browser-based version of CodeLens AI. No VS Code, no
> build step, no npm — just serve static files. Features 6 themes,
> streaming AI responses, interactive quiz engine, 165+ term glossary,
> spaced repetition, learning dashboard, and PWA support.

**Stack:** Vanilla JS (ES Modules) · Pure CSS (glassmorphism) · Canvas API · OpenRouter AI
**Dependencies:** Zero

```bash
cd codelens-ai-web
npx serve .
# Open http://localhost:3000
```

See [`codelens-ai-web/README.md`](./codelens-ai-web/README.md).

## 4. E-Commerce

> A full-stack e-commerce platform with role-based access control
> (Retailer/Consumer), image uploads, cart management, and JWT
> authentication. Built with React frontend and Express/MongoDB backend.

**Stack:** React.js · Node.js · Express.js · MongoDB (MERN)

```bash
cd e-commerce
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
# Set up .env with MONGO_URI and JWT_SECRET
npm run start
```

See [`e-commerce/README.md`](./e-commerce/README.md).

---

## Repository Structure

```
Main/
├── README.md                 # This monorepo's index
├── .gitignore                # shared ignore rules
└── Projects/
    ├── README.md             # this file
    ├── campusbazaar/         # Marketplace
    ├── codelens-ai/          # VS Code extension
    ├── codelens-ai-web/      # Web app
    └── e-commerce/           # MERN e-commerce
```

## License

Each project has its own license:

- **campusbazaar** — MIT (see [LICENSE](./campusbazaar/LICENSE))
- **codelens-ai** — MIT (see [LICENSE](./codelens-ai/LICENSE))
- **codelens-ai-web** — MIT
- **e-commerce** — MIT (see [LICENSE](./e-commerce/LICENSE))
