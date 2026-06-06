export const EXTENSION_ID = 'codelens-ai';
export const EXTENSION_NAME = 'CodeLens AI';

export const MODELS = {
  PRIMARY: 'qwen/qwen3-coder:free',
  FALLBACK_1: 'meta-llama/llama-3.3-70b-instruct:free',
  FALLBACK_2: 'deepseek/deepseek-r1:free',
  FALLBACK_3: 'openrouter/free',
} as const;

export const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';
export const OPENROUTER_CHAT_ENDPOINT = '/chat/completions';

export const DEFAULT_CHUNK_SIZE = 20;
export const DEFAULT_MAX_TOKENS = 2048;
export const DEFAULT_TEMPERATURE = 0.3;
export const DEBOUNCE_DELAY = 300;
export const VIEWPORT_CULL_BUFFER = 50;

export const CACHE_MAX_ENTRIES = 500;
export const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

export const CIRCUIT_BREAKER_THRESHOLD = 5;
export const CIRCUIT_BREAKER_RESET_MS = 60000;
export const MAX_RETRIES = 4;
export const BASE_BACKOFF_MS = 1000;

export const HEATMAP_COLORS = {
  low: { border: '#22c55e40', background: '#22c55e15', badge: '🟢' },
  medium: { border: '#eab30840', background: '#eab30815', badge: '🟡' },
  high: { border: '#ef444440', background: '#ef444415', badge: '🔴' },
};

export const SMELL_ICONS = {
  'long-function': '$(warning)',
  'magic-number': '$(info)',
  'unclear-name': '$(question)',
  'duplicate': '$(copy)',
  'complex-condition': '$(error)',
  'deep-nesting': '$(debug-step-over)',
};

export const SUPPORTED_LANGUAGES = [
  'javascript', 'typescript', 'python', 'java', 'go', 'rust',
  'cpp', 'csharp', 'ruby', 'php', 'swift', 'kotlin', 'scala', 'r', 'sql',
];

export const LANGUAGE_PROMPTS: Record<string, string> = {
  javascript: 'You are a JavaScript expert instructor. Explain code like you\'re teaching a beginner.',
  typescript: 'You are a TypeScript expert instructor. Explain types, interfaces, and generics clearly.',
  python: 'You are a Python expert instructor. Explain Pythonic patterns and idioms.',
  java: 'You are a Java expert instructor. Explain OOP concepts and Java idioms.',
  go: 'You are a Go expert instructor. Explain goroutines, channels, and Go idioms.',
  rust: 'You are a Rust expert instructor. Explain ownership, borrowing, and lifetimes.',
  cpp: 'You are a C++ expert instructor. Explain memory management and STL.',
  csharp: 'You are a C# expert instructor. Explain .NET concepts and C# idioms.',
  ruby: 'You are a Ruby expert instructor. Explain Ruby idioms and metaprogramming.',
  php: 'You are a PHP expert instructor. Explain modern PHP patterns.',
  swift: 'You are a Swift expert instructor. Explain Swift idioms and iOS patterns.',
  kotlin: 'You are a Kotlin expert instructor. Explain Kotlin idioms and multiplatform concepts.',
  scala: 'You are a Scala expert instructor. Explain functional programming and Scala idioms.',
  r: 'You are an R expert instructor. Explain statistical computing and R idioms.',
  sql: 'You are a SQL expert instructor. Explain query optimization and database concepts.',
};

export const PEDAGOGICAL_CITATIONS = {
  cognitiveLoad: 'Sweller, J. (1988). Cognitive load during problem solving: Effects on learning. Cognitive Science, 12(2), 257-285.',
  zpd: 'Vygotsky, L. S. (1978). Mind in society: The development of higher psychological processes. Harvard University Press.',
  dualCoding: 'Paivio, A. (1971). Imagery and verbal processes. Holt, Rinehart & Winston.',
  testingEffect: 'Roediger, H. L., & Karpicke, J. D. (2006). Test-enhanced learning. Psychological Science, 17(3), 249-255.',
  spacedRepetition: 'Ebbinghaus, H. (1885). Über das Gedächtnis. Wozniak, P. A. (1987). Application of SM-2 algorithm.',
  deliberatePractice: 'Ericsson, K. A., Krampe, R. T., & Tesch-Römer, C. (1993). The role of deliberate practice in expert performance. Psychological Review, 100(3), 363-406.',
  selfExplanation: 'Chi, M. T. H., et al. (1994). Eliciting self-explanations improves understanding. Cognitive Science, 18(3), 439-477.',
  workedExample: 'Atkinson, R. K., et al. (2000). Learning from examples: Instructional principles from the worked examples research. Review of Educational Research, 70(2), 181-214.',
};
