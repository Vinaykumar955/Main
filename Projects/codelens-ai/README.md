# CodeLens AI — AI-Powered Code Learning Assistant

![Visual Studio Marketplace Version](https://img.shields.io/badge/VS%20Marketplace-v1.0.0-blue)
![OpenRouter](https://img.shields.io/badge/OpenRouter-Free%20API-ff6b35)
![License](https://img.shields.io/badge/License-MIT-green)

![CodeLens AI Screenshot](images/screenshot.png)

## Features

### Tier 1: Core Features (10)

| # | Feature | Description |
|---|---------|-------------|
| 1 | AI-Powered Code Explanations | Get instant, context-aware explanations for any code file or selection using OpenRouter AI models |
| 2 | Inline Decoration Overlay | Explanations appear directly in the editor as subtle text decorations without disrupting your workflow |
| 3 | Complexity Heatmap | Visual indicators show code complexity at a glance with color-coded badges (🟢 low / 🟡 medium / 🔴 high) |
| 4 | Code Smell Detection | Automatic detection of common anti-patterns including long functions, magic numbers, unclear names, duplicates, complex conditions, and deep nesting |
| 5 | Multi-Model AI Support | Choose from 4 AI models including Qwen 3 Coder, Llama 3.3 70B, DeepSeek R1, and OpenRouter free tier |
| 6 | File-Level Explanations | Get comprehensive explanations for entire files via right-click or command palette |
| 7 | Selection-Based Explanations | Select specific code sections for targeted, line-specific explanations |
| 8 | Configurable Depth Levels | Choose between What (overview), How (implementation details), or Why (design decisions) |
| 9 | Explanation History | Browse and revisit past explanations with full search and filter capabilities |
| 10 | Vocabulary Highlighting | Key programming terms are highlighted inline with instant definitions from the built-in glossary |

### Tier 2: Educational Features (8)

| # | Feature | Description | Research |
|---|---------|-------------|----------|
| 11 | Real-World Analogies | Complex concepts explained through familiar real-world analogies and metaphors | Dual Coding Theory (Paivio, 1971) |
| 12 | Socratic Questioning | Guided learning through questions rather than direct answers | Self-Explanation Effect (Chi et al., 1994) |
| 13 | Quiz Mode | Auto-generated multiple-choice quizzes test comprehension after explanations | Testing Effect (Roediger & Karpicke, 2006) |
| 14 | Spaced Repetition | Scientifically optimized review scheduling using the SM-2 algorithm | Spacing Effect (Ebbinghaus, 1885; Wozniak, 1987) |
| 15 | Practice Problem Generation | Generate coding exercises based on current code with varying difficulty | Deliberate Practice (Ericsson et al., 1993) |
| 16 | Error Explanation | Get plain-English explanations of compilation and runtime errors with fixes | Worked Example Effect (Atkinson et al., 2000) |
| 17 | Learner Statistics Dashboard | Track progress with detailed learning analytics including streaks and mastery | Self-Regulated Learning (Zimmerman, 2002) |
| 18 | Learning Path Recommendations | AI-suggested next topics based on current knowledge and skill gaps | Zone of Proximal Development (Vygotsky, 1978) |

### Tier 3: Accessibility Features (5)

| # | Feature | Description | WCAG Criterion |
|---|---------|-------------|----------------|
| 19 | Dyslexia-Friendly Mode | OpenDyslexic font and increased letter/line spacing | WCAG 3.1 Readable |
| 20 | Simplify Mode | Simplified explanations using plain language for beginners | WCAG 3.1.5 Reading Level |
| 21 | High-Contrast Mode | High-contrast text and background for all inline decorations | WCAG 1.4.6 Contrast Enhanced |
| 22 | Text-to-Speech | Screen reader compatible output for all explanations | WCAG 2.1.1 Keyboard |
| 23 | Reduced Motion | Reduced animations and transitions for motion sensitivity | WCAG 2.3.3 Animations |

### Tier 4: Advanced Features (7)

| # | Feature | Description |
|---|---------|-------------|
| 24 | Multi-Model Fallback Chain | Automatic fallback through 4 AI models when one is unavailable or rate-limited |
| 25 | Caching with LRU Eviction | Intelligent response caching with configurable size limits and TTL |
| 26 | Circuit Breaker Pattern | Prevents cascading failures by stopping requests after repeated failures, with automatic half-open recovery |
| 27 | Retry with Exponential Backoff | Resilient API calls with jitter and non-retryable error classification |
| 28 | Viewport Culling | Only visible lines trigger AI requests, reducing unnecessary API calls |
| 29 | Debounced Updates | Selection and edit events are debounced (300ms) to avoid flooding the API |
| 30 | Export to Markdown/CSV | Save explanations and history for offline reference and sharing |

## Quick Start

1. **Install** from [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=codelens-ai.codelens-ai)
2. **Get your free API key** from [OpenRouter](https://openrouter.ai/keys)
3. **Configure** in VS Code Settings (`Ctrl+,`) → Search for `codelens-ai` → Enter your API key
4. **Open** any code file (JavaScript, TypeScript, Python, Java, Go, Rust, and 10 more)
5. **Right-click** → **"Explain with CodeLens AI"** or use `Ctrl+Shift+E`

## Usage

### Explaining Code

- **Explain File**: Right-click in the editor → `CodeLens AI: Explain File` (`Ctrl+Shift+E`). Get a comprehensive breakdown of the entire file.
- **Explain Selection**: Select lines of code → Right-click → `CodeLens AI: Explain Selection` (`Ctrl+Shift+X`). Get targeted explanations for specific sections.
- **Inline Decorations**: Explanations appear as non-intrusive text decorations at the end of each explained line. Toggle them with `CodeLens AI: Toggle Inline Explanations`. Decorations use color-coded badges for complexity and code smells.

### Chat Panel

Open the CodeLens AI sidebar from the activity bar. The panel has 4 tabs:

- **Explain**: Paste or type code for instant AI explanations with configurable depth
- **History**: Browse past explanations grouped by file with search
- **Analytics**: View learner stats including lines explained, concepts learned, quiz scores, and streaks
- **Glossary**: Search the built-in glossary of 140+ programming terms across 10 categories

### Educational Tools

- **Depth Slider**: Toggle between What (basic), How (detailed), and Why (architectural) explanation depth
- **Analogies**: Enable real-world analogies in settings to make abstract concepts concrete
- **Quiz Mode**: Enable automatic quiz generation after explanations to test retention
- **Spaced Repetition**: Concepts are automatically scheduled for review using the SM-2 algorithm

### Accessibility Modes

- **Dyslexia Mode**: Enables OpenDyslexic font with increased spacing
- **Simplify Mode**: Strips jargon and uses simple vocabulary
- **High Contrast**: Maximum contrast for all UI elements
- **Text-to-Speech**: Explanations compatible with screen readers
- **Reduced Motion**: Disables non-essential animations

### Exporting

- **Markdown**: Save explanations as `.explain.md` files with proper formatting and code blocks
- **CSV**: Export explanation history to CSV for analysis or note-taking

## Requirements

- **VS Code** 1.85 or higher
- **OpenRouter API key** (free tier available at https://openrouter.ai/keys)
- **Internet connection** for AI model access

## Extension Settings

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `codelens-ai.apiKey` | `string` | `""` | OpenRouter API Key |
| `codelens-ai.model` | `string` | `"qwen/qwen3-coder:free"` | AI model to use for explanations |
| `codelens-ai.depth` | `string` | `"what"` | Explanation depth level (`what` / `how` / `why`) |
| `codelens-ai.enableAnalogy` | `boolean` | `false` | Enable real-world analogies in explanations |
| `codelens-ai.enableHeatmap` | `boolean` | `true` | Enable complexity heatmap overlay |
| `codelens-ai.enableSmells` | `boolean` | `true` | Enable code smell detection |
| `codelens-ai.chunkSize` | `number` | `20` | Number of lines to explain at once |
| `codelens-ai.maxTokens` | `number` | `2048` | Maximum tokens per API call |
| `codelens-ai.temperature` | `number` | `0.3` | AI response temperature (0 = precise, 2 = creative) |
| `codelens-ai.dyslexiaMode` | `boolean` | `false` | Enable dyslexia-friendly font and spacing |
| `codelens-ai.simplifyMode` | `boolean` | `false` | Simplify explanations for beginners |
| `codelens-ai.highContrast` | `boolean` | `false` | Enable high-contrast decorations |
| `codelens-ai.ttsEnabled` | `boolean` | `false` | Enable text-to-speech for explanations |
| `codelens-ai.socraticMode` | `boolean` | `false` | Enable Socratic questioning mode |
| `codelens-ai.quizMode` | `boolean` | `false` | Enable automatic quiz generation |
| `codelens-ai.practiceMode` | `boolean` | `false` | Enable practice problem generation |
| `codelens-ai.cacheSize` | `number` | `500` | Maximum cache entries |
| `codelens-ai.reducedMotion` | `boolean` | `false` | Reduce motion in UI animations |

## Commands

| ID | Title | Keybinding |
|----|-------|------------|
| `codelens-ai.explainFile` | CodeLens AI: Explain File | `Ctrl+Shift+E` |
| `codelens-ai.explainSelection` | CodeLens AI: Explain Selection | `Ctrl+Shift+X` |
| `codelens-ai.toggleInline` | CodeLens AI: Toggle Inline Explanations | — |
| `codelens-ai.quizMe` | CodeLens AI: Quiz Me on Code | — |
| `codelens-ai.exportMarkdown` | CodeLens AI: Export Explanations as Markdown | — |
| `codelens-ai.bookmarkLine` | CodeLens AI: Bookmark Line for Review | — |
| `codelens-ai.showHistory` | CodeLens AI: Show Explanation History | — |
| `codelens-ai.openSettings` | CodeLens AI: Open Settings | — |
| `codelens-ai.generatePractice` | CodeLens AI: Generate Practice Problems | — |
| `codelens-ai.explainError` | CodeLens AI: Explain Error | — |

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   Presentation Layer                        │
│  ┌──────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │ Webview Panel│  │Inline Decorations│  │ Context Menu │  │
│  │  (Sidebar)   │  │  (Editor)        │  │ (Right-Click)│  │
│  └──────┬───────┘  └────────┬─────────┘  └──────┬───────┘  │
└─────────┼────────────────────┼────────────────────┼─────────┘
          │                    │                    │
┌─────────┼────────────────────┼────────────────────┼─────────┐
│         ▼                    ▼                    ▼         │
│                   Core Services Layer                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ PromptBuilder│  │ResponseParser│  │OpenRouter    │      │
│  │              │  │              │  │Client        │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │Explanation   │  │Decoration   │  │Explanation   │      │
│  │Cache         │  │Manager      │  │Manager       │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐                         │
│  │Learning      │  │Sidebar      │                         │
│  │Manager       │  │Manager      │                         │
│  └──────────────┘  └──────────────┘                         │
└─────────────────────────────────────────────────────────────┘
          │                    │                    │
┌─────────┼────────────────────┼────────────────────┼─────────┐
│         ▼                    ▼                    ▼         │
│                 Infrastructure Layer                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │CircuitBreaker│  │RetryWith    │  │ErrorHandler  │      │
│  │              │  │Backoff      │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │Logger        │  │Spaced       │  │Glossary      │      │
│  │              │  │Repetition   │  │(140+ terms)  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

## Error Handling

The extension implements a robust fallback chain for handling AI service failures:

1. **Primary Model** → On failure, immediately try fallback model
2. **Fallback 1** (Llama 3.3 70B) → On failure, try next fallback
3. **Fallback 2** (DeepSeek R1) → On failure, try final fallback
4. **Fallback 3** (OpenRouter free) → On failure, show user-friendly error

Each error is classified by type:
- **401 Unauthorized** → Opens Settings to fix API key
- **429 Rate Limited** → Shows wait suggestion with retry button
- **5xx Provider Down** → Automatic model switch
- **Network/DNS Errors** → Automatic retry with exponential backoff
- **Malformed Response** → Transparent retry

The **Circuit Breaker** pattern prevents cascading failures: after 5 consecutive failures, the circuit opens and blocks all requests for 60 seconds, then transitions to half-open for recovery.

## Performance

- **Caching**: LRU eviction cache (configurable up to 500 entries) with 24-hour TTL. Duplicate requests for the same code are deduplicated via in-flight request coalescing.
- **Viewport Culling**: Only lines visible in the editor trigger API requests. A 50-line buffer pre-fetches adjacent lines.
- **Debouncing**: Selection change events are debounced at 300ms to batch rapid edits.
- **esbuild Bundling**: Extension is compiled with esbuild for fast startup and minimal bundle size.

## Academic Citations

The educational features in CodeLens AI are grounded in established learning science research:

1. Ausubel, D. P. (1968). *Educational psychology: A cognitive view*. Holt, Rinehart & Winston.
2. Chi, M. T. H., De Leeuw, N., Chiu, M.-H., & LaVancher, C. (1994). Eliciting self-explanations improves understanding. *Cognitive Science, 18*(3), 439-477.
3. Ebbinghaus, H. (1885). *Über das Gedächtnis*. Wozniak, P. A. (1987). Application of SM-2 algorithm.
4. Ericsson, K. A., Krampe, R. T., & Tesch-Römer, C. (1993). The role of deliberate practice in the acquisition of expert performance. *Psychological Review, 100*(3), 363-406.
5. Mayer, R. E. (2005). Cognitive theory of multimedia learning. In *The Cambridge handbook of multimedia learning* (pp. 31-48). Cambridge University Press.
6. Paivio, A. (1971). *Imagery and verbal processes*. Holt, Rinehart & Winston.
7. Roediger, H. L., & Karpicke, J. D. (2006). Test-enhanced learning: Taking memory tests improves long-term retention. *Psychological Science, 17*(3), 249-255.
8. Sweller, J. (1988). Cognitive load during problem solving: Effects on learning. *Cognitive Science, 12*(2), 257-285.
9. Vygotsky, L. S. (1978). *Mind in society: The development of higher psychological processes*. Harvard University Press.
10. Atkinson, R. K., Derry, S. J., Renkl, A., & Wortham, D. (2000). Learning from examples: Instructional principles from the worked examples research. *Review of Educational Research, 70*(2), 181-214.

## Known Issues

- The free tier of OpenRouter models may have rate limits. If you encounter 429 errors, wait a moment or switch to a different model.
- Inline decorations may not render correctly in split-editor views. Toggle decorations off and back on to reset.
- Very large files (>1000 lines) may take longer to explain. Use selection-based explanations for large codebases.
- Some AI models may occasionally produce incorrect explanations. Always verify critical code understanding with official documentation.
- The text-to-speech feature requires OS-level screen reader support.

## Release Notes

See [CHANGELOG.md](CHANGELOG.md) for version history.

## License

MIT License — see [LICENSE](LICENSE) for details.

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Before submitting, please run `npm run lint` and ensure all tests pass with `npm test`.
