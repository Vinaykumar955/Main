# CodeLens AI — Standalone Web App

AI-powered code analysis and learning platform — no VS Code needed. Open in any browser and start learning.

## Features

- **AI Code Explanations** — Paste any code, get instant explanations at 4 depth levels (What/How/Why/Teach)
- **Streaming Responses** — Real-time token-by-token streaming via OpenRouter API
- **Code Smell Detection** — Identifies anti-patterns, complexity issues, and potential bugs
- **Real-World Analogies** — Abstract concepts explained through familiar metaphors
- **Interactive Quiz Engine** — Auto-generated quizzes with SM-2 spaced repetition
- **Built-in Glossary** — 165+ programming terms across 10 categories with search and filter
- **Learning Dashboard** — Track streaks, skill levels, badges, and progress over time
- **Spaced Repetition** — Scientifically optimized review scheduling (SM-2 algorithm)
- **6 Themes** — Dark, Light, High Contrast, Solarized, Dracula, Nord
- **Accessibility** — Dyslexia-friendly mode, reduced motion, keyboard navigation
- **PWA Support** — Service worker for offline caching, installable as a standalone app
- **Export** — Save explanations and history as Markdown or CSV

## Tech Stack

| Area | Tech |
|------|------|
| Core | Vanilla JavaScript (ES Modules) |
| Styling | Pure CSS (3162 lines, glassmorphism, 6 themes, 19 animations) |
| AI API | OpenRouter (multi-model with fallback chain) |
| Storage | localStorage (history, settings, learner data) |
| Charts | Canvas API (radar, bar, calendar heatmap) |
| PWA | Service Worker + Web App Manifest |

Zero external dependencies — no npm, no build step, no CDN.

## Quick Start

1. **Serve the app** (ES modules require HTTP):
   ```bash
   npx serve .
   # or
   python -m http.server 8080
   ```
2. Open in your browser
3. Click the Settings gear → Enter your [OpenRouter API key](https://openrouter.ai/keys)
4. Paste code in the editor → Click **Explain Code**

## Project Structure

```
codelens-ai-web/
├── index.html          # App shell (265 lines)
├── manifest.json       # PWA manifest
├── sw.js               # Service worker
├── favicon.svg         # App icon
├── css/
│   └── app.css         # Full design system (6 themes, responsive, animations)
├── js/
│   ├── app.js          # Main orchestrator (1243 lines)
│   ├── api.js          # OpenRouter client with streaming
│   ├── editor.js       # Code editor with line-numbered gutter
│   ├── glossary.js     # 165+ programming terms
│   ├── learner.js      # SM-2 spaced repetition, quiz engine, stats
│   ├── parser.js       # Response parsing (explanations, smells, concepts)
│   ├── renderer.js     # DOM renderer with skeleton loading
│   ├── storage.js      # localStorage wrapper with LRU cache
│   ├── ui.js           # 8 UI components (toast, modal, command palette, etc.)
│   ├── utils.js        # Shared utilities (debounce, formatDate, etc.)
│   └── visualizer.js   # Canvas chart engine (radar, calendar, progress)
└── tests/              # Test placeholder directory
```

## Configuration

All settings are accessible from the Settings modal (gear icon):

| Setting | Description | Default |
|---------|-------------|---------|
| API Key | OpenRouter API key | — |
| Model | AI model to use | `qwen/qwen3-coder:free` |
| Theme | UI theme | Dark |
| Analogies | Enable real-world analogies | Off |
| Code Smells | Enable smell detection | On |
| Complexity Heatmap | Show complexity scores | On |
| Simplify Mode | Simplified explanations | Off |
| Dyslexia Mode | OpenDyslexic font + spacing | Off |
| Reduced Motion | Disable animations | Off |

## API

Connects to `https://openrouter.ai/api/v1/chat/completions` with SSE streaming.
Supports automatic fallback through 4 models, exponential backoff retry, and rate limiting (max 3 concurrent requests).

## License

MIT
