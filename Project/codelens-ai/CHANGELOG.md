# Changelog

All notable changes to CodeLens AI will be documented in this file.

The format is based on [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-06-04

### Initial Release

#### Tier 1: Core Features
- AI-Powered Code Explanations — instant, context-aware explanations for any code file or selection
- Inline Decoration Overlay — explanations appear directly in the editor as subtle text decorations
- Complexity Heatmap — visual indicators with color-coded badges for code complexity
- Code Smell Detection — automatic detection of 6 anti-pattern types
- Multi-Model AI Support — 4 configurable AI models (Qwen, Llama, DeepSeek, OpenRouter)
- File-Level Explanations — comprehensive file analysis via right-click or command palette
- Selection-Based Explanations — targeted explanations for selected code sections
- Configurable Depth Levels — What / How / Why explanation depth
- Explanation History — browse and revisit past explanations
- Vocabulary Highlighting — inline definitions for 140+ programming terms

#### Tier 2: Educational Features
- Real-World Analogies — Dual Coding Theory-based analogies in explanations
- Socratic Questioning — guided learning through questions (Self-Explanation Effect)
- Quiz Mode — auto-generated multiple-choice quizzes (Testing Effect)
- Spaced Repetition — SM-2 algorithm for optimized review scheduling
- Practice Problem Generation — coding exercises based on current code
- Error Explanation — plain-English explanations of errors
- Learner Statistics Dashboard — progress tracking with streaks and mastery metrics
- Learning Path Recommendations — AI-suggested next topics (ZPD-based)

#### Tier 3: Accessibility Features
- Dyslexia-Friendly Mode — OpenDyslexic font and spacing (WCAG 3.1)
- Simplify Mode — plain language for beginners (WCAG 3.1.5)
- High-Contrast Mode — enhanced contrast decorations (WCAG 1.4.6)
- Text-to-Speech — screen reader compatible output (WCAG 2.1.1)
- Reduced Motion — reduced UI animations (WCAG 2.3.3)

#### Tier 4: Advanced Features
- Multi-Model Fallback Chain — 4-level automatic model fallback
- Caching with LRU Eviction — configurable 500-entry cache with 24h TTL
- Circuit Breaker Pattern — 5-failure threshold with 60s recovery
- Retry with Exponential Backoff — jitter-based retry with non-retryable error classification
- Viewport Culling — only visible lines trigger API requests
- Debounced Updates — 300ms debounce on selection and edit events
- Export to Markdown/CSV — save explanations and history

## [0.5.0] - 2026-05-15

### Beta

- AI-Powered Code Explanations for files and selections
- Inline Decoration Overlay with configurable display
- Complexity Heatmap with color-coded badges
- Code Smell Detection for 6 anti-pattern types
- Multi-Model AI Support with manual model selection
- Configurable Depth Levels (What / How / Why)
- Explanation History with search
- OpenRouter integration with API key configuration
- 15 supported programming languages
- Context menu integration for file and selection commands

## [0.1.0] - 2026-04-20

### Alpha

- Foundation architecture with 3-layer design
- PromptBuilder for constructing AI prompts
- ResponseParser for extracting structured data from AI responses
- ExplanationCache with LRU eviction and TTL
- CircuitBreaker for failure isolation
- RetryWithBackoff for resilient API calls
- ErrorHandler with error classification
- Glossary with 140+ programming terms across 10 categories
- SpacedRepetition implementing the SM-2 algorithm
- Basic VS Code extension activation and command registration
