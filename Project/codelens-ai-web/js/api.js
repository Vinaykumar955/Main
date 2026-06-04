// js/api.js - OpenRouter API Client

const MODELS = {
  PRIMARY: 'qwen/qwen3-coder:free',
  FALLBACK_1: 'meta-llama/llama-3.3-70b-instruct:free',
  FALLBACK_2: 'deepseek/deepseek-r1:free',
  FALLBACK_3: 'openrouter/free',
};

const DEPTH_PROMPTS = {
  what: 'Provide a basic description of what the code does at a high level.',
  how: 'Explain how the code works including implementation details, algorithms, and data flow.',
  why: 'Explain the design decisions, trade-offs, and alternatives. Discuss why this approach was chosen over others.',
  teach: 'Teach this code as if explaining to a beginner. Use simple terms, analogies, and break down every concept. Assume minimal prior knowledge.',
};

const ERROR_MESSAGES = {
  401: 'Invalid API key. Please check your OpenRouter API key in settings.',
  402: 'Insufficient credits. Your OpenRouter account needs more credits.',
  429: 'Rate limited. Please wait a moment and try again.',
};

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return hash;
}

function buildPrompt(code, language, depth) {
  const depthInstruction = DEPTH_PROMPTS[depth] || DEPTH_PROMPTS.what;

  const systemPrompt = `You are an expert ${language} instructor. Explain code clearly and thoroughly.
Depth level: ${depth}. ${depthInstruction}
Keep explanations concise but complete. Use code examples where helpful.
Format any code blocks with proper language tags.
Include real-world analogies where appropriate.
Identify code smells, potential bugs, and improvement opportunities.
Rate the code complexity on a scale of 0-10.
Extract key programming concepts from the code.`;

  const userPrompt = `Explain the following ${language} code:

\`\`\`${language}
${code}
\`\`\`

Provide:
1. What the code does
2. How it works (key concepts and patterns)
3. Code complexity score (0-10)
4. Any code smells or issues
5. Real-world analogies for complex concepts
6. Key programming concepts used`;

  return { systemPrompt, userPrompt };
}

class Cache {
  constructor(maxEntries = 50, ttlMs = 3600000) {
    this.maxEntries = maxEntries;
    this.ttlMs = ttlMs;
    this.map = new Map();
  }

  get(key) {
    const entry = this.map.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > this.ttlMs) {
      this.map.delete(key);
      return null;
    }
    return entry.value;
  }

  set(key, value) {
    if (this.map.size >= this.maxEntries) {
      const oldest = this.map.keys().next().value;
      this.map.delete(oldest);
    }
    this.map.set(key, { value, timestamp: Date.now() });
  }

  has(key) {
    return this.get(key) !== null;
  }
}

const responseCache = new Cache();
let activeController = null;
let currentApiKey = '';
let concurrentRequests = 0;
const MAX_CONCURRENT = 3;

export function setApiKey(key) {
  currentApiKey = key;
}

export function cancelRequest() {
  if (activeController) {
    activeController.abort();
    activeController = null;
  }
}

async function tryModel(code, language, depth, callbacks, apiKey, model, signal) {
  const { systemPrompt, userPrompt } = buildPrompt(code, language, depth);

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      stream: true,
      temperature: 0.3,
      max_tokens: 2048,
    }),
    signal,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    return { error: true, status: response.status, body: errorText };
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let fullContent = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const jsonStr = line.slice(6).trim();
      if (!jsonStr || jsonStr === '[DONE]') continue;

      try {
        const parsed = JSON.parse(jsonStr);
        const delta = parsed.choices?.[0]?.delta?.content;
        if (delta) {
          fullContent += delta;
          if (callbacks.onToken) callbacks.onToken(delta);
        }
      } catch {
        // skip malformed lines
      }
    }
  }

  return { error: false, content: fullContent };
}

function parseExplanation(content) {
  const complexityMatch = content.match(/complexity\s*(?:score|rating)?\s*:?\s*(\d+)\s*\/?\s*10/i);
  const complexity = complexityMatch ? parseInt(complexityMatch[1], 10) : null;

  const conceptKeywords = [
    'closure', 'callback', 'promise', 'async', 'await', 'event loop',
    'prototype', 'inheritance', 'hoisting', 'scope', 'currying',
    'memoization', 'recursion', 'polymorphism', 'encapsulation',
    'abstraction', 'composition', 'immutability', 'state',
    'observable', 'subscription', 'stream', 'throttle', 'debounce',
  ];
  const concepts = conceptKeywords.filter(kw => content.toLowerCase().includes(kw.toLowerCase()));

  const sections = [];
  const sectionRegex = /(\d+\.\s*\*\*[^*]+\*\*|###\s+[^\n]+|\*\*[^*]+\*\*)/g;
  let match;
  while ((match = sectionRegex.exec(content)) !== null) {
    sections.push(match[1].replace(/[*#]/g, '').trim());
  }

  return { content, complexity, concepts, sections };
}

export async function explainCode(code, language, depth = 'what', callbacks = {}, options = {}) {
  const apiKey = options.apiKey || currentApiKey;
  if (!apiKey) {
    const err = new Error('No API key provided. Please set your OpenRouter API key.');
    if (callbacks.onError) callbacks.onError(err);
    throw err;
  }

  const signal = options.signal || null;
  const cacheKey = `${hashString(code)}:${language}:${depth}`;
  const cached = responseCache.get(cacheKey);
  if (cached) {
    if (callbacks.onToken) callbacks.onToken(cached.content);
    if (callbacks.onComplete) callbacks.onComplete(cached.content, parseExplanation(cached.content));
    return parseExplanation(cached.content);
  }

  if (concurrentRequests >= MAX_CONCURRENT) {
    const err = new Error('Too many concurrent requests. Please wait for existing requests to finish.');
    if (callbacks.onError) callbacks.onError(err);
    throw err;
  }

  const controller = new AbortController();
  if (!signal) {
    activeController = controller;
  }

  const combinedSignal = signal
    ? combineSignals(signal, controller.signal)
    : controller.signal;

  if (combinedSignal.aborted) {
    const err = new Error('Request cancelled.');
    if (callbacks.onError) callbacks.onError(err);
    throw err;
  }

  concurrentRequests++;

  const modelChain = [
    options.model || MODELS.PRIMARY,
    MODELS.FALLBACK_1,
    MODELS.FALLBACK_2,
    MODELS.FALLBACK_3,
  ];

  let lastError = null;

  try {
    for (const model of modelChain) {
      if (combinedSignal.aborted) {
        throw new DOMException('Aborted', 'AbortError');
      }

      try {
        const result = await tryModel(code, language, depth, callbacks, apiKey, model, combinedSignal);

        if (!result.error) {
          responseCache.set(cacheKey, result.content);
          const parsed = parseExplanation(result.content);
          if (callbacks.onComplete) callbacks.onComplete(result.content, parsed);
          return parsed;
        }

        lastError = result;

        if (result.status === 401 || result.status === 402) {
          break;
        }

        if (result.status >= 500 || result.status === 429) {
          const msg = result.status >= 500
            ? 'AI service is currently unavailable. Trying fallback model...'
            : ERROR_MESSAGES[429];
          if (callbacks.onToken) callbacks.onToken(`\n\n*${msg}*\n\n`);
          continue;
        }

        break;
      } catch (err) {
        if (err.name === 'AbortError') {
          const abortErr = new Error('Request cancelled.');
          if (callbacks.onError) callbacks.onError(abortErr);
          throw abortErr;
        }

        lastError = { error: true, networkError: true, message: err.message };
        if (callbacks.onToken) callbacks.onToken('\n\n*Network error. Please check your internet connection. Trying fallback model...*\n\n');
      }
    }

    const finalError = determineError(lastError);
    if (callbacks.onError) callbacks.onError(finalError);
    throw finalError;
  } finally {
    concurrentRequests--;
    if (!signal) activeController = null;
  }
}

function determineError(result) {
  if (!result) return new Error('AI service is currently unavailable. Please try again later.');

  if (result.status && ERROR_MESSAGES[result.status]) {
    return new Error(ERROR_MESSAGES[result.status]);
  }

  if (result.networkError) {
    return new Error('Network error. Please check your internet connection.');
  }

  return new Error('AI service is currently unavailable. Please try again later.');
}

function combineSignals(signal1, signal2) {
  const controller = new AbortController();

  const onAbort = () => {
    controller.abort();
    signal1.removeEventListener('abort', onAbort);
    signal2.removeEventListener('abort', onAbort);
  };

  signal1.addEventListener('abort', onAbort);
  signal2.addEventListener('abort', onAbort);

  if (signal1.aborted || signal2.aborted) {
    controller.abort();
  }

  return controller.signal;
}

export async function getAvailableModels(apiKey) {
  const key = apiKey || currentApiKey;
  if (!key) throw new Error('API key is required to fetch models.');

  const response = await fetch('https://openrouter.ai/api/v1/models', {
    headers: { Authorization: `Bearer ${key}` },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch models: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.data || [];
}
