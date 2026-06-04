# CodeLens AI — Project Monorepo

A collection of AI-powered code learning tools. This repository contains three projects under the `Project/` directory.

## Projects

### 1. [codelens-ai](./codelens-ai/) — VS Code Extension

An AI-powered code learning assistant integrated directly into VS Code. Provides inline explanations, complexity heatmaps, code smell detection, and educational features like spaced repetition and quiz mode — all without leaving your editor.

**Stack:** TypeScript, VS Code API, esbuild, OpenRouter AI
**Tests:** 158 passing (Mocha + ts-node)

### 2. [codelens-ai-web](./codelens-ai-web/) — Standalone Web App

A zero-dependency, browser-based version of CodeLens AI. No VS Code, no build step, no npm — just serve static files. Features 6 themes, streaming AI responses, interactive quiz engine, 165+ term glossary, spaced repetition, learning dashboard, and PWA support.

**Stack:** Vanilla JS (ES Modules), Pure CSS (glassmorphism), Canvas API, OpenRouter AI
**Dependencies:** Zero

### 3. [e-commerce](./e-commerce/) — MERN E-Commerce Platform

A full-stack e-commerce platform with role-based access control (Retailer/Consumer), image uploads, cart management, and JWT authentication. Built with React frontend and Express/MongoDB backend.

**Stack:** React.js, Node.js, Express.js, MongoDB (MERN)
**Dependencies:** npm / yarn / pnpm

## Repository Structure

```
Project/
├── README.md                 # This file
├── codelens-ai/              # VS Code extension
│   ├── src/                  # TypeScript source
│   │   ├── extension.ts
│   │   ├── services/         # OpenRouterClient, PromptBuilder, ResponseParser, etc.
│   │   ├── managers/         # Explanation, Decoration, Learning, Sidebar
│   │   ├── providers/        # Diagnostic, Sidebar Webview
│   │   ├── commands/         # Command registrations
│   │   └── utils/            # Types, constants
│   ├── package.json
│   └── tsconfig.json
├── codelens-ai-web/          # Standalone web app
│   ├── index.html
│   ├── css/app.css           # 3162-line design system
│   ├── js/                   # 15 ES modules
│   └── manifest.json         # PWA manifest
└── e-commerce/               # MERN stack
    ├── backend/              # Express API, MongoDB schemas, handlers
    ├── frontend/             # React UI, Tailwind CSS
    └── package.json          # Root orchestrator (concurrently)
```

## Getting Started

### VS Code Extension

```bash
cd Project/codelens-ai
npm install
npm run compile
# Press F5 in VS Code to launch extension
```

### Web App

```bash
cd Project/codelens-ai-web
npx serve .
# Open http://localhost:3000
```

### E-Commerce App

```bash
cd Project/e-commerce
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
# Set up .env with MONGO_URI and JWT_SECRET
npm run start
```

## License

Each project has its own license:
- **codelens-ai** — MIT
- **codelens-ai-web** — MIT
- **e-commerce** — MIT (see [LICENSE](./e-commerce/LICENSE))
