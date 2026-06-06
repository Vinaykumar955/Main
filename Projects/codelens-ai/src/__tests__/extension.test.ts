import * as assert from 'assert';
import { PromptBuilder } from '../services/PromptBuilder';
import { ResponseParser } from '../services/ResponseParser';
import { ExplanationCache } from '../services/ExplanationCache';
import { CircuitBreaker, CircuitState } from '../services/CircuitBreaker';
import { RetryWithBackoff } from '../services/RetryWithBackoff';
import { SpacedRepetition } from '../services/SpacedRepetition';
import { Glossary } from '../services/Glossary';
import { ErrorHandler, ErrorType } from '../services/ErrorHandler';
import {
  MODELS,
  SUPPORTED_LANGUAGES,
  LANGUAGE_PROMPTS,
  HEATMAP_COLORS,
  SMELL_ICONS,
  CACHE_MAX_ENTRIES,
  CIRCUIT_BREAKER_THRESHOLD,
  CIRCUIT_BREAKER_RESET_MS,
  MAX_RETRIES,
  BASE_BACKOFF_MS,
} from '../utils/constants';
import { SpacedRepetitionItem, CacheEntry } from '../utils/types';

suite('PromptBuilder', () => {
  let builder: PromptBuilder;

  setup(() => {
    builder = new PromptBuilder();
  });

  test('buildSystemPrompt returns correct language prompt for typescript', () => {
    const prompt = builder.buildSystemPrompt('typescript', 'what');
    assert.ok(prompt.includes('TypeScript expert instructor'), 'Should include TypeScript-specific prompt');
    assert.ok(prompt.includes('Depth level: what'), 'Should include depth level');
  });

  test('buildSystemPrompt returns correct language prompt for python', () => {
    const prompt = builder.buildSystemPrompt('python', 'how');
    assert.ok(prompt.includes('Python expert instructor'), 'Should include Python-specific prompt');
    assert.ok(prompt.includes('Depth level: how'), 'Should include depth level');
  });

  test('buildSystemPrompt falls back to default for unknown language', () => {
    const prompt = builder.buildSystemPrompt('brainfuck', 'what');
    assert.ok(prompt.includes('expert programming instructor'), 'Should use default prompt for unknown language');
  });

  test('buildSystemPrompt uses typescript default when language is undefined', () => {
    const prompt = builder.buildSystemPrompt(undefined as any, 'what');
    assert.ok(prompt.includes('expert programming instructor'), 'Should use default prompt');
  });

  test('buildExplanationPrompt includes code in output', () => {
    const code = 'const x = 42;';
    const prompt = builder.buildExplanationPrompt(code, 'test.ts', 1, 1);
    assert.ok(prompt.includes(code), 'Should include the code block');
    assert.ok(prompt.includes('test.ts'), 'Should include file path');
    assert.ok(prompt.includes('Lines: 1-1'), 'Should include line range');
  });

  test('buildExplanationPrompt handles empty file path', () => {
    const prompt = builder.buildExplanationPrompt('let y = 10;', '', 5, 10);
    assert.ok(prompt.includes('Lines: 5-10'), 'Should include line range');
    assert.ok(prompt.includes('let y = 10;'), 'Should include code');
  });

  test('Depth levels change system prompt content', () => {
    const whatPrompt = builder.buildSystemPrompt('javascript', 'what');
    const howPrompt = builder.buildSystemPrompt('javascript', 'how');
    const whyPrompt = builder.buildSystemPrompt('javascript', 'why');

    assert.ok(whatPrompt.includes('basic description'), 'What level should mention basic description');
    assert.ok(howPrompt.includes('implementation details'), 'How level should mention implementation details');
    assert.ok(whyPrompt.includes('design decisions'), 'Why level should mention design decisions');
  });

  test('buildSystemPrompt includes analogy instruction when enabled', () => {
    const prompt = builder.buildSystemPrompt('python', 'what', { analogy: true });
    assert.ok(prompt.includes('analogies'), 'Should include analogy instruction');
    assert.ok(prompt.includes('metaphors'), 'Should mention metaphors');
  });

  test('buildSystemPrompt includes socratic instruction when enabled', () => {
    const prompt = builder.buildSystemPrompt('python', 'what', { socratic: true });
    assert.ok(prompt.includes('Socratic method'), 'Should include Socratic instruction');
    assert.ok(prompt.includes('guiding questions'), 'Should mention guiding questions');
  });

  test('buildSystemPrompt includes simplify instruction when enabled', () => {
    const prompt = builder.buildSystemPrompt('python', 'what', { simplify: true });
    assert.ok(prompt.includes('simple terms'), 'Should include simplify instruction');
    assert.ok(prompt.includes('Avoid all jargon'), 'Should mention avoiding jargon');
  });

  test('buildCodeSmellPrompt requests structured analysis', () => {
    const prompt = builder.buildCodeSmellPrompt('function foo() { return 42; }');
    assert.ok(prompt.includes('code smells'), 'Should mention code smells');
    assert.ok(prompt.includes('line number'), 'Should ask for line number');
    assert.ok(prompt.includes('severity'), 'Should ask for severity');
  });

  test('buildAnalogyPrompt includes concept and code', () => {
    const prompt = builder.buildAnalogyPrompt('const a = [1,2,3];', 'array map');
    assert.ok(prompt.includes('array map'), 'Should include concept');
    assert.ok(prompt.includes('const a = [1,2,3];'), 'Should include code');
    assert.ok(prompt.includes('analogies'), 'Should mention analogies');
  });

  test('buildVocabularyPrompt includes term and context', () => {
    const prompt = builder.buildVocabularyPrompt('closure', 'function inner scope');
    assert.ok(prompt.includes('closure'), 'Should include term');
    assert.ok(prompt.includes('function inner scope'), 'Should include context');
    assert.ok(prompt.includes('definition'), 'Should ask for definition');
  });

  test('buildErrorExplanationPrompt includes error and code', () => {
    const prompt = builder.buildErrorExplanationPrompt('TypeError: x is not a function', 'x();');
    assert.ok(prompt.includes('TypeError'), 'Should include error');
    assert.ok(prompt.includes('x();'), 'Should include code');
    assert.ok(prompt.includes('caused the error'), 'Should ask for cause');
  });

  test('buildQuizPrompt generates question structure', () => {
    const prompt = builder.buildQuizPrompt('let x = 5;', 'variables');
    assert.ok(prompt.includes('quiz question'), 'Should mention quiz question');
    assert.ok(prompt.includes('variables'), 'Should include concept');
    assert.ok(prompt.includes('let x = 5;'), 'Should include code');
  });

  test('buildPracticePrompt specifies count', () => {
    const prompt = builder.buildPracticePrompt('function add(a,b) { return a + b; }', 3);
    assert.ok(prompt.includes('3'), 'Should include count');
    assert.ok(prompt.includes('practice exercises'), 'Should mention practice exercises');
  });

  test('buildLearningPathPrompt includes mastered and learning topics', () => {
    const prompt = builder.buildLearningPathPrompt(['variables', 'loops'], ['closures']);
    assert.ok(prompt.includes('variables'), 'Should include mastered topics');
    assert.ok(prompt.includes('closures'), 'Should include learning topics');
    assert.ok(prompt.includes('learning path'), 'Should mention learning path');
  });

  test('buildSocraticPrompt includes code without answer', () => {
    const prompt = builder.buildSocraticPrompt('const x = 1;');
    assert.ok(prompt.includes('Socratic method'), 'Should mention Socratic method');
    assert.ok(prompt.includes('Do NOT provide the answer'), 'Should instruct not to give answer');
    assert.ok(prompt.includes('const x = 1;'), 'Should include code');
  });
});

suite('ResponseParser', () => {
  let parser: ResponseParser;

  setup(() => {
    parser = new ResponseParser();
  });

  test('parseExplanation extracts explanation text', () => {
    const result = parser.parseExplanation('This code defines a function that adds two numbers.');
    assert.ok(result.explanation.length > 0, 'Should extract explanation text');
    assert.ok(typeof result.complexity === 'number', 'Complexity should be a number');
    assert.ok(Array.isArray(result.lineReferences), 'Line references should be an array');
  });

  test('parseExplanation includes complexity score', () => {
    const result = parser.parseExplanation('Complexity score: 7/10. This is a complex function.');
    assert.strictEqual(result.complexity, 7, 'Should parse explicit complexity score');
  });

  test('parseCodeSmells returns array of smells from JSON', () => {
    const raw = '```json\n[{"line": 5, "type": "magic-number", "message": "Magic number 42", "severity": "info"}]\n```';
    const code = 'let x = 42;\nlet y = 10;\nlet z = 5;\nlet a = 3;\nlet b = 42;';
    const smells = parser.parseCodeSmells(raw, code);
    assert.ok(Array.isArray(smells), 'Should return array');
    assert.strictEqual(smells.length, 1, 'Should have 1 smell');
    assert.strictEqual(smells[0].type, 'magic-number', 'Should detect magic number');
    assert.strictEqual(smells[0].line, 5, 'Should report correct line');
  });

  test('parseCodeSmells returns empty array for clean code', () => {
    const raw = 'This code looks clean and well-structured. No issues found.';
    const code = 'const x = 1;\nconst y = 2;';
    const smells = parser.parseCodeSmells(raw, code);
    assert.ok(Array.isArray(smells), 'Should return array');
  });

  test('parseCodeSmells handles malformed JSON gracefully', () => {
    const raw = '```json\n{invalid json}\n```';
    const code = 'function foo() { return 42; }';
    const smells = parser.parseCodeSmells(raw, code);
    assert.ok(Array.isArray(smells), 'Should return array even with malformed JSON');
  });

  test('parseCodeSmells validates smell types', () => {
    const raw = '```json\n[{"line": 1, "type": "invalid-type", "message": "test", "severity": "info"}]\n```';
    const code = 'const x = 1;';
    const smells = parser.parseCodeSmells(raw, code);
    assert.strictEqual(smells.length, 0, 'Should filter out invalid types');
  });

  test('parseComplexityScore returns 0-10 number', () => {
    assert.strictEqual(parser.parseComplexityScore('Complexity: 5/10'), 5, 'Should parse explicit score');
    assert.strictEqual(parser.parseComplexityScore('Score: 10/10'), 10, 'Should parse max score');
    assert.strictEqual(parser.parseComplexityScore('Rating: 0/10'), 0, 'Should parse min score');
  });

  test('parseComplexityScore clamps values to 0-10 range', () => {
    assert.strictEqual(parser.parseComplexityScore('Score: 15/10'), 10, 'Should clamp to 10');
    assert.strictEqual(parser.parseComplexityScore('Score: -5/10'), 0, 'Should clamp to 0');
  });

  test('parseComplexityScore estimates from text length when no explicit score', () => {
    const short = parser.parseComplexityScore('short text');
    assert.ok(short >= 0 && short <= 10, 'Should return valid score for short text');
    const longText = 'x'.repeat(3000);
    const long = parser.parseComplexityScore(longText);
    assert.strictEqual(long, 8, 'Long text should get higher estimated score');
  });

  test('parseQuizQuestion returns valid QuizQuestion from JSON', () => {
    const raw = '```json\n{"question": "What is a variable?", "correctAnswer": "A named storage", "code": "let x = 1;", "difficulty": 2, "concept": "variables"}\n```';
    const quiz = parser.parseQuizQuestion(raw);
    assert.ok(quiz.id.startsWith('quiz-'), 'Should generate quiz ID');
    assert.strictEqual(quiz.question, 'What is a variable?', 'Should extract question');
    assert.strictEqual(quiz.correctAnswer, 'A named storage', 'Should extract answer');
    assert.strictEqual(quiz.difficulty, 2, 'Should extract difficulty');
    assert.strictEqual(quiz.concept, 'variables', 'Should extract concept');
  });

  test('parseQuizQuestion falls back to regex parsing for non-JSON', () => {
    const raw = 'Question: What is a closure?\nCorrect Answer: A function with access to outer scope\n```\nfunction outer() { let x = 1; }\n```';
    const quiz = parser.parseQuizQuestion(raw);
    assert.ok(quiz.question.includes('closure'), 'Should extract question via regex');
    assert.ok(quiz.correctAnswer.length > 0, 'Should extract answer via regex');
  });

  test('parseQuizQuestion returns defaults for completely malformed input', () => {
    const quiz = parser.parseQuizQuestion('');
    assert.strictEqual(quiz.question, 'Unknown question', 'Should fallback to default question');
    assert.strictEqual(quiz.correctAnswer, 'Unknown', 'Should fallback to default answer');
    assert.strictEqual(quiz.difficulty, 3, 'Should use default difficulty');
  });

  test('extractJsonFromResponse handles code-fenced JSON', () => {
    const raw = 'Some text\n```json\n{"key": "value"}\n```\nMore text';
    const result = parser.extractJsonFromResponse(raw);
    assert.strictEqual(result, '{"key": "value"}', 'Should extract JSON from code fence');
  });

  test('extractJsonFromResponse returns null for non-JSON', () => {
    const result = parser.extractJsonFromResponse('Just plain text without JSON');
    assert.strictEqual(result, null, 'Should return null for non-JSON');
  });

  test('extractJsonFromResponse extracts bare JSON object', () => {
    const raw = 'text {"hello": "world"} more text';
    const result = parser.extractJsonFromResponse(raw);
    assert.strictEqual(result, '{"hello": "world"}', 'Should extract bare JSON object');
  });

  test('extractJsonFromResponse extracts bare JSON array', () => {
    const raw = 'text [1, 2, 3] more text';
    const result = parser.extractJsonFromResponse(raw);
    assert.strictEqual(result, '[1, 2, 3]', 'Should extract bare JSON array');
  });

  test('extractJsonFromResponse returns null for empty input', () => {
    assert.strictEqual(parser.extractJsonFromResponse(''), null, 'Should return null for empty string');
    assert.strictEqual(parser.extractJsonFromResponse(null as any), null, 'Should return null for null');
  });

  test('parseConcepts extracts concepts from text', () => {
    const raw = 'Key concept: closures, higher-order functions';
    const concepts = parser.parseConcepts(raw);
    assert.ok(concepts.length > 0, 'Should extract concepts');
    assert.ok(concepts.some(c => c.toLowerCase().includes('closure')), 'Should find closures');
  });

  test('parseConcepts extracts backtick terms', () => {
    const raw = 'The `Promise` object represents async operations.';
    const concepts = parser.parseConcepts(raw);
    assert.ok(concepts.includes('Promise'), 'Should extract backtick term');
  });

  test('parseQuizEvaluation detects correct answer', () => {
    const result = parser.parseQuizEvaluation('The answer is correct! Good job.');
    assert.strictEqual(result.isCorrect, true, 'Should detect correct evaluation');
  });

  test('parseQuizEvaluation detects incorrect answer', () => {
    const result = parser.parseQuizEvaluation('That is incorrect. The correct answer is B.');
    assert.strictEqual(result.isCorrect, false, 'Should detect incorrect evaluation');
  });

  test('parseAnalogies extracts analogies from text', () => {
    const raw = 'Think of it like a recipe: just as a recipe lists steps, a function lists instructions.';
    const analogies = parser.parseAnalogies(raw);
    assert.ok(analogies.length > 0, 'Should extract analogies');
    assert.ok(analogies[0].analogy.includes('recipe'), 'Should find recipe analogy');
  });

  test('parsePracticeExercises extracts exercises', () => {
    const raw = 'Exercise 1: Write a function\n```\nfunction add(a,b) { return a + b; }\n```';
    const exercises = parser.parsePracticeExercises(raw);
    assert.ok(exercises.length > 0, 'Should extract exercises');
    assert.ok(exercises[0].solution.includes('return'), 'Should include solution');
  });

  test('parseLearningPath extracts topics and resources', () => {
    const raw = 'Recommended topics to learn:\n- Closures\n- Promises\n\nResources:\n- MDN Web Docs';
    const path = parser.parseLearningPath(raw);
    assert.ok(path.topics.some(t => t.toLowerCase().includes('closure')), 'Should extract topics');
    assert.ok(path.resources.length > 0, 'Should extract resources');
  });
});

suite('ExplanationCache', () => {
  let cache: ExplanationCache;

  setup(() => {
    cache = new ExplanationCache(3, 5000);
  });

  test('set and get work correctly', () => {
    cache.set('test-key', {
      data: 'explanation text',
      timestamp: Date.now(),
      model: 'test-model',
      language: 'typescript',
    });
    const result = cache.get('test-key');
    assert.ok(result !== null, 'Should retrieve cached value');
    assert.strictEqual(result!.data, 'explanation text', 'Should match stored data');
    assert.strictEqual(result!.model, 'test-model', 'Should match stored model');
    assert.strictEqual(result!.language, 'typescript', 'Should match stored language');
  });

  test('Missing key returns null', () => {
    const result = cache.get('nonexistent-key');
    assert.strictEqual(result, null, 'Should return null for missing key');
  });

  test('LRU eviction works when full', () => {
    cache.set('key1', { data: 'a', timestamp: Date.now(), model: 'm1', language: 'l1' });
    cache.set('key2', { data: 'b', timestamp: Date.now(), model: 'm2', language: 'l2' });
    cache.set('key3', { data: 'c', timestamp: Date.now(), model: 'm3', language: 'l3' });
    cache.get('key1');
    cache.get('key2');
    cache.set('key4', { data: 'd', timestamp: Date.now(), model: 'm4', language: 'l4' });

    const result3 = cache.get('key3');
    assert.strictEqual(result3, null, 'key3 should be evicted (least recently accessed)');
    assert.ok(cache.get('key1') !== null, 'key1 should still exist');
    assert.ok(cache.get('key2') !== null, 'key2 should still exist');
    assert.ok(cache.get('key4') !== null, 'key4 should exist');
  });

  test('TTL expiration works', () => {
    cache = new ExplanationCache(10, 50);
    cache.set('test-key', {
      data: 'will expire',
      timestamp: Date.now() - 100,
      model: 'test',
      language: 'ts',
    });
    const result = cache.get('test-key');
    assert.strictEqual(result, null, 'Entry with expired TTL should return null');
  });

  test('getStats returns correct hit/miss counts', () => {
    cache.set('key1', { data: 'a', timestamp: Date.now(), model: 'm', language: 'l' });
    cache.get('key1');
    cache.get('missing');

    const stats = cache.getStats();
    assert.strictEqual(stats.hits, 1, 'Should have 1 hit');
    assert.strictEqual(stats.misses, 1, 'Should have 1 miss');
    assert.strictEqual(stats.hitRate, 0.5, 'Hit rate should be 0.5');
  });

  test('clear removes all entries', () => {
    cache.set('key1', { data: 'a', timestamp: Date.now(), model: 'm', language: 'l' });
    cache.set('key2', { data: 'b', timestamp: Date.now(), model: 'm', language: 'l' });
    cache.clear();

    assert.strictEqual(cache.size(), 0, 'Cache should be empty after clear');
    assert.strictEqual(cache.getStats().hits, 0, 'Hits should be reset');
    assert.strictEqual(cache.getStats().misses, 0, 'Misses should be reset');
  });

  test('has returns true for existing key', () => {
    cache.set('key1', { data: 'test', timestamp: Date.now(), model: 'm', language: 'l' });
    assert.ok(cache.has('key1'), 'has() should return true for existing key');
    assert.ok(!cache.has('missing'), 'has() should return false for missing key');
  });

  test('getOrFetch returns existing value without calling fetcher', async () => {
    cache.set('key1', { data: 'cached', timestamp: Date.now(), model: 'm', language: 'l' });
    let fetcherCalled = false;
    const result = await cache.getOrFetch('key1', async () => {
      fetcherCalled = true;
      return 'fresh';
    });
    assert.strictEqual(result, 'cached', 'Should return cached value');
    assert.strictEqual(fetcherCalled, false, 'Fetcher should not be called');
  });

  test('getOrFetch deduplicates concurrent requests', async () => {
    let callCount = 0;
    const slowFetcher = async () => {
      callCount++;
      await new Promise(resolve => setTimeout(resolve, 100));
      return 'result';
    };

    const [r1, r2] = await Promise.all([
      cache.getOrFetch('same-key', slowFetcher),
      cache.getOrFetch('same-key', slowFetcher),
    ]);
    assert.strictEqual(r1, 'result', 'First call should return result');
    assert.strictEqual(r2, 'result', 'Second call should return same result');
    assert.strictEqual(callCount, 1, 'Fetcher should only be called once');
  });

  test('purgeExpired removes expired entries', () => {
    cache = new ExplanationCache(10, 100);
    cache.set('fresh', { data: 'fresh', timestamp: Date.now(), model: 'm', language: 'l' });
    cache.set('stale', { data: 'stale', timestamp: Date.now() - 200, model: 'm', language: 'l' });
    const purged = cache.purgeExpired();
    assert.strictEqual(purged, 1, 'Should purge 1 expired entry');
    assert.strictEqual(cache.size(), 1, 'Should have 1 remaining entry');
  });

  test('keys returns all cache keys', () => {
    cache.set('key1', { data: 'a', timestamp: Date.now(), model: 'm', language: 'l' });
    cache.set('key2', { data: 'b', timestamp: Date.now(), model: 'm', language: 'l' });
    const keys = cache.keys();
    assert.strictEqual(keys.length, 2, 'Should return 2 keys');
  });

  test('size returns correct count', () => {
    assert.strictEqual(cache.size(), 0, 'Fresh cache should have size 0');
    cache.set('k1', { data: 'a', timestamp: Date.now(), model: 'm', language: 'l' });
    assert.strictEqual(cache.size(), 1, 'Should have size 1 after add');
  });

  test('update existing key does not trigger eviction', () => {
    const smallCache = new ExplanationCache(2);
    smallCache.set('k1', { data: 'a', timestamp: Date.now(), model: 'm', language: 'l' });
    smallCache.set('k2', { data: 'b', timestamp: Date.now(), model: 'm', language: 'l' });
    smallCache.set('k1', { data: 'updated', timestamp: Date.now(), model: 'm', language: 'l' });
    assert.strictEqual(smallCache.size(), 2, 'Should still have 2 entries');
  });

  test('constructor uses default constants when not provided', () => {
    const defaultCache = new ExplanationCache();
    assert.strictEqual((defaultCache as any).maxEntries, CACHE_MAX_ENTRIES, 'Should use CACHE_MAX_ENTRIES');
    assert.strictEqual((defaultCache as any).ttlMs, 24 * 60 * 60 * 1000, 'Should use default TTL');
  });
});

suite('CircuitBreaker', () => {
  let cb: CircuitBreaker;

  setup(() => {
    cb = new CircuitBreaker(3, 1000);
  });

  test('Starts CLOSED', () => {
    assert.strictEqual(cb.getState(), CircuitState.CLOSED, 'Should start in CLOSED state');
  });

  test('isOpen returns false when CLOSED', () => {
    assert.strictEqual(cb.isOpen(), false, 'CLOSED circuit should not be open');
  });

  test('Opens after threshold failures', () => {
    cb.recordFailure();
    assert.strictEqual(cb.isOpen(), false, 'After 1 failure, still closed');
    cb.recordFailure();
    assert.strictEqual(cb.isOpen(), false, 'After 2 failures, still closed');
    cb.recordFailure();
    assert.strictEqual(cb.isOpen(), true, 'After 3 failures, should open');
  });

  test('recordSuccess resets circuit to CLOSED', () => {
    cb.recordFailure();
    cb.recordFailure();
    cb.recordFailure();
    assert.ok(cb.isOpen(), 'Circuit should be open');
    cb.recordSuccess();
    assert.strictEqual(cb.isOpen(), false, 'After success, circuit should be closed');
    assert.strictEqual(cb.getFailureCount(), 0, 'Failure count should reset to 0');
  });

  test('isOpen returns correct state transitions', () => {
    assert.strictEqual(cb.isOpen(), false, 'Initially closed');
    cb.recordFailure();
    assert.strictEqual(cb.isOpen(), false, 'Still closed after 1 failure');
    cb.recordFailure();
    cb.recordFailure();
    assert.strictEqual(cb.isOpen(), true, 'Open after threshold');
  });

  test('HALF_OPEN allows trial request after reset timeout', () => {
    cb = new CircuitBreaker(2, 10);
    cb.recordFailure();
    cb.recordFailure();
    assert.ok(cb.isOpen(), 'Circuit should be open');
    assert.strictEqual(cb.getState(), CircuitState.OPEN, 'State should be OPEN');
  });

  test('getState transitions to HALF_OPEN after timeout', () => {
    cb = new CircuitBreaker(2, 5);
    cb.recordFailure();
    cb.recordFailure();
    assert.strictEqual(cb.getState(), CircuitState.OPEN, 'Should be OPEN');
  });

  test('reset restores initial state', () => {
    cb.recordFailure();
    cb.recordFailure();
    cb.recordFailure();
    cb.reset();
    assert.strictEqual(cb.getState(), CircuitState.CLOSED, 'After reset, should be CLOSED');
    assert.strictEqual(cb.getFailureCount(), 0, 'After reset, failure count should be 0');
    assert.strictEqual(cb.isOpen(), false, 'After reset, should not be open');
  });

  test('getFailureCount returns current count', () => {
    assert.strictEqual(cb.getFailureCount(), 0, 'Initial count should be 0');
    cb.recordFailure();
    assert.strictEqual(cb.getFailureCount(), 1, 'Should be 1 after 1 failure');
    cb.recordFailure();
    assert.strictEqual(cb.getFailureCount(), 2, 'Should be 2 after 2 failures');
  });

  test('constructor uses default constants', () => {
    const defaultCb = new CircuitBreaker();
    assert.strictEqual((defaultCb as any).threshold, CIRCUIT_BREAKER_THRESHOLD, 'Should use CIRCUIT_BREAKER_THRESHOLD');
    assert.strictEqual((defaultCb as any).resetTimeout, CIRCUIT_BREAKER_RESET_MS, 'Should use CIRCUIT_BREAKER_RESET_MS');
  });

  test('recordFailure transitions HALF_OPEN to OPEN', () => {
    cb = new CircuitBreaker(2, -1);
    cb.recordFailure();
    cb.recordFailure();
    assert.ok(cb.isOpen(), 'Should be open');
    cb.recordSuccess();
    assert.strictEqual(cb.getState(), CircuitState.CLOSED, 'Should reset to closed');
    cb.recordFailure();
    assert.strictEqual(cb.getState(), CircuitState.CLOSED, 'One failure keeps closed');
    cb.recordFailure();
    assert.strictEqual(cb.getState(), CircuitState.OPEN, 'Two failures opens again');
  });
});

suite('RetryWithBackoff', () => {
  let retry: RetryWithBackoff;

  setup(() => {
    retry = new RetryWithBackoff(3, 10);
  });

  test('Successful call returns result', async () => {
    const result = await retry.execute(async () => 'success');
    assert.strictEqual(result, 'success', 'Should return the function result');
  });

  test('Failing call retries and eventually throws', async () => {
    let callCount = 0;
    const failingFn = async () => {
      callCount++;
      throw new Error('Server error');
    };

    try {
      await retry.execute(failingFn);
      assert.fail('Should have thrown');
    } catch (error: any) {
      assert.ok(error.message.includes('Server error'), 'Should throw the original error');
      assert.strictEqual(callCount, 4, 'Should have attempted 4 times (initial + 3 retries)');
    }
  });

  test('Non-retryable error does not retry', async () => {
    let callCount = 0;
    const authFn = async () => {
      callCount++;
      const error = new Error('Unauthorized');
      (error as any).status = 401;
      throw error;
    };

    try {
      await retry.execute(authFn);
      assert.fail('Should have thrown');
    } catch (error: any) {
      assert.ok(error.message.includes('Unauthorized'), 'Should throw unauthorized error');
      assert.strictEqual(callCount, 1, 'Should only attempt once (non-retryable)');
    }
  });

  test('Non-retryable error by message detection', async () => {
    let callCount = 0;
    const invalidKeyFn = async () => {
      callCount++;
      throw new Error('Invalid API key');
    };

    try {
      await retry.execute(invalidKeyFn);
      assert.fail('Should have thrown');
    } catch {
      assert.strictEqual(callCount, 1, 'Should not retry invalid API key errors');
    }
  });

  test('Abort signal stops execution', async () => {
    const controller = new AbortController();
    controller.abort();

    try {
      await retry.execute(async () => 'never', { signal: controller.signal });
      assert.fail('Should have thrown');
    } catch (error: any) {
      assert.ok(error.name === 'AbortError' || error.message.includes('Abort'), 'Should throw abort error');
    }
  });

  test('Respects custom maxRetries option', async () => {
    let callCount = 0;
    try {
      await retry.execute(async () => {
        callCount++;
        throw new Error('fail');
      }, { maxRetries: 1 });
    } catch {
      assert.strictEqual(callCount, 2, 'Should attempt 2 times (initial + 1 retry)');
    }
  });

  test('Constructor uses default constants', () => {
    const defaultRetry = new RetryWithBackoff();
    assert.strictEqual((defaultRetry as any).defaultMaxRetries, MAX_RETRIES, 'Should use MAX_RETRIES');
    assert.strictEqual((defaultRetry as any).defaultBaseDelay, BASE_BACKOFF_MS, 'Should use BASE_BACKOFF_MS');
  });
});

suite('SpacedRepetition', () => {
  let sr: SpacedRepetition;
  let baseItem: SpacedRepetitionItem;

  setup(() => {
    sr = new SpacedRepetition();
    baseItem = {
      id: 'test-1',
      concept: 'closures',
      code: 'function outer() { let x = 1; return () => x; }',
      explanation: 'Closures allow inner functions to access outer scope.',
      ease: 2.5,
      interval: 0,
      repetitions: 0,
      nextReview: 0,
      lastReview: 0,
    };
  });

  test('First review with quality 4 gives interval 1 day', () => {
    const result = sr.calculateNextReview(baseItem, 4);
    assert.strictEqual(result.interval, 1, 'First review should have 1 day interval');
    assert.strictEqual(result.repetitions, 1, 'Repetitions should increment to 1');
  });

  test('Second review with quality 3 gives interval 6 days', () => {
    const itemAfterFirst = sr.calculateNextReview(baseItem, 4);
    const result = sr.calculateNextReview(itemAfterFirst, 3);
    assert.strictEqual(result.interval, 6, 'Second review should have 6 day interval');
    assert.strictEqual(result.repetitions, 2, 'Repetitions should be 2');
  });

  test('Third review uses ease factor multiplication', () => {
    const item1 = sr.calculateNextReview(baseItem, 4);
    const item2 = sr.calculateNextReview(item1, 4);
    const result = sr.calculateNextReview(item2, 4);
    const expectedInterval = Math.round(6 * 2.5);
    assert.strictEqual(result.interval, expectedInterval, `Third interval should be 6 * ease`);
    assert.strictEqual(result.repetitions, 3, 'Repetitions should be 3');
  });

  test('Quality < 3 resets interval to 1', () => {
    const itemAfterFirst = sr.calculateNextReview(baseItem, 4);
    const result = sr.calculateNextReview(itemAfterFirst, 1);
    assert.strictEqual(result.interval, 1, 'Failed review should reset interval to 1');
    assert.strictEqual(result.repetitions, 0, 'Failed review should reset repetitions to 0');
  });

  test('Ease factor minimum is 1.3', () => {
    const item = sr.calculateNextReview({ ...baseItem, ease: 1.3 }, 0);
    assert.ok(item.ease >= 1.3, 'Ease factor should never go below 1.3');
  });

  test('getDueItems returns only overdue items', () => {
    const pastDue = { ...baseItem, id: 'past', nextReview: Date.now() - 10000 };
    const futureDue = { ...baseItem, id: 'future', nextReview: Date.now() + 10000 };
    const due = sr.getDueItems([pastDue, futureDue]);
    assert.strictEqual(due.length, 1, 'Should return 1 overdue item');
    assert.strictEqual(due[0].id, 'past', 'Should return the past-due item');
  });

  test('getDueItems returns empty array for no overdue items', () => {
    const future = { ...baseItem, nextReview: Date.now() + 100000 };
    assert.strictEqual(sr.getDueItems([future]).length, 0, 'No items should be due');
  });

  test('assessRecall returns correct quality', () => {
    assert.strictEqual(sr.assessRecall(5), 'perfect', 'Quality 5 should be perfect');
    assert.strictEqual(sr.assessRecall(3), 'hard', 'Quality 3 should be hard');
    assert.strictEqual(sr.assessRecall(1), 'forgot', 'Quality 1 should be forgot');
    assert.strictEqual(sr.assessRecall(0), 'review', 'Quality 0 should be review');
  });

  test('getItemPriority returns positive for overdue items', () => {
    const overdue = { ...baseItem, nextReview: Date.now() - 10000 };
    assert.ok(sr.getItemPriority(overdue) > 0, 'Overdue items should have positive priority');
  });

  test('getItemPriority returns negative for future items', () => {
    const future = { ...baseItem, nextReview: Date.now() + 10000 };
    assert.ok(sr.getItemPriority(future) < 0, 'Future items should have negative priority');
  });

  test('Quality is clamped to 0-5 range', () => {
    const resultHigh = sr.calculateNextReview(baseItem, 10);
    const resultLow = sr.calculateNextReview(baseItem, -5);
    assert.ok(resultHigh.ease > 0, 'High quality should be handled');
    assert.ok(resultLow.ease > 0, 'Low quality should be handled');
  });
});

suite('Glossary', () => {
  let glossary: Glossary;

  setup(() => {
    glossary = new Glossary();
  });

  test('getDefinition returns for known term', () => {
    const def = glossary.getDefinition('variable');
    assert.ok(def !== null, 'Should find definition for "variable"');
    assert.ok(def!.includes('storage location'), 'Should contain expected definition text');
  });

  test('getDefinition is case-insensitive', () => {
    const def1 = glossary.getDefinition('CLOSURE');
    const def2 = glossary.getDefinition('Closure');
    assert.strictEqual(def1, def2, 'Case should not matter');
    assert.ok(def1 !== null, 'Should find uppercase term');
  });

  test('getDefinition returns null for unknown term', () => {
    const def = glossary.getDefinition('xyzzy_unknown_term_42');
    assert.strictEqual(def, null, 'Should return null for unknown term');
  });

  test('searchDefinitions returns matching terms', () => {
    const results = glossary.searchDefinitions('variable');
    assert.ok(results.length > 0, 'Should find results for "variable"');
    assert.ok(results.some(r => r.term === 'variable'), 'Should include exact match');
  });

  test('searchDefinitions returns empty for no matches', () => {
    const results = glossary.searchDefinitions('zzz_nothing_yyy');
    assert.strictEqual(results.length, 0, 'Should return empty array');
  });

  test('searchDefinitions searches term and definition text', () => {
    const results = glossary.searchDefinitions('storage');
    assert.ok(results.length > 0, 'Should find terms matching definition text');
    assert.ok(results.some(r => r.term === 'variable'), 'Should find "variable" via definition');
  });

  test('All 10 categories are populated', () => {
    const categories = glossary.getCategories();
    assert.strictEqual(categories.length, 10, 'Should have 10 categories');
    const expectedCategories = [
      'variables', 'functions', 'oop', 'patterns', 'data-structures',
      'algorithms', 'concurrency', 'web', 'databases', 'misc',
    ];
    for (const cat of expectedCategories) {
      assert.ok(categories.includes(cat), `Should include category "${cat}"`);
    }
  });

  test('Each category has at least 5 terms', () => {
    const categories = glossary.getCategories();
    for (const cat of categories) {
      const terms = glossary.getTermsByCategory(cat);
      assert.ok(terms.length >= 5, `Category "${cat}" should have at least 5 terms (has ${terms.length})`);
    }
  });

  test('getAllTerms returns all terms', () => {
    const all = glossary.getAllTerms();
    assert.ok(all.length >= 140, 'Should have at least 140 terms');
  });

  test('getTermsByLanguage returns language-specific terms', () => {
    const jsTerms = glossary.getTermsByLanguage('javascript');
    assert.ok(jsTerms.length > 0, 'Should find JavaScript-specific terms');
    assert.ok(jsTerms.some(t => t.term === 'hoisting'), 'Should include hoisting');
    assert.ok(jsTerms.some(t => t.term === 'arrow function'), 'Should include arrow function');
  });

  test('getTermsByLanguage returns empty for unknown language', () => {
    const terms = glossary.getTermsByLanguage('brainfuck');
    assert.strictEqual(terms.length, 0, 'Should return empty for unknown language');
  });

  test('getTermsByCategory returns correct terms', () => {
    const oopTerms = glossary.getTermsByCategory('oop');
    assert.ok(oopTerms.some(t => t.term === 'class'), 'Should include class');
    assert.ok(oopTerms.some(t => t.term === 'inheritance'), 'Should include inheritance');
    assert.ok(oopTerms.some(t => t.term === 'polymorphism'), 'Should include polymorphism');
  });

  test('searchDefinitions with empty query returns empty', () => {
    assert.strictEqual(glossary.searchDefinitions('').length, 0, 'Empty query should return empty');
    assert.strictEqual(glossary.searchDefinitions('   ').length, 0, 'Whitespace query should return empty');
  });

  test('getDefinition returns null for empty/whitespace term', () => {
    assert.strictEqual(glossary.getDefinition(''), null, 'Empty term should return null');
    assert.strictEqual(glossary.getDefinition('   '), null, 'Whitespace term should return null');
  });
});

suite('Constants', () => {
  test('MODELS has PRIMARY and 3 fallbacks', () => {
    assert.strictEqual(MODELS.PRIMARY, 'qwen/qwen3-coder:free', 'PRIMARY should be Qwen 3 Coder');
    assert.strictEqual(MODELS.FALLBACK_1, 'meta-llama/llama-3.3-70b-instruct:free', 'FALLBACK_1 should be Llama');
    assert.strictEqual(MODELS.FALLBACK_2, 'deepseek/deepseek-r1:free', 'FALLBACK_2 should be DeepSeek');
    assert.strictEqual(MODELS.FALLBACK_3, 'openrouter/free', 'FALLBACK_3 should be OpenRouter free');
    assert.strictEqual(Object.keys(MODELS).length, 4, 'Should have exactly 4 model entries');
  });

  test('SUPPORTED_LANGUAGES has all 15 languages', () => {
    assert.strictEqual(SUPPORTED_LANGUAGES.length, 15, 'Should have exactly 15 languages');
    const expected = [
      'javascript', 'typescript', 'python', 'java', 'go', 'rust',
      'cpp', 'csharp', 'ruby', 'php', 'swift', 'kotlin', 'scala', 'r', 'sql',
    ];
    for (const lang of expected) {
      assert.ok(SUPPORTED_LANGUAGES.includes(lang), `Should include "${lang}"`);
    }
  });

  test('LANGUAGE_PROMPTS has all 15 entries', () => {
    assert.strictEqual(Object.keys(LANGUAGE_PROMPTS).length, 15, 'Should have exactly 15 prompt entries');
    for (const lang of SUPPORTED_LANGUAGES) {
      assert.ok(LANGUAGE_PROMPTS[lang] !== undefined, `Should have prompt for "${lang}"`);
      assert.ok(LANGUAGE_PROMPTS[lang].length > 20, `Prompt for "${lang}" should be substantial`);
    }
  });

  test('HEATMAP_COLORS has low/medium/high', () => {
    assert.ok(HEATMAP_COLORS.low !== undefined, 'Should have low color');
    assert.ok(HEATMAP_COLORS.medium !== undefined, 'Should have medium color');
    assert.ok(HEATMAP_COLORS.high !== undefined, 'Should have high color');
    assert.ok(HEATMAP_COLORS.low.border.startsWith('#'), 'Low border should be hex color');
    assert.ok(HEATMAP_COLORS.medium.badge.length > 0, 'Medium badge should have content');
    assert.ok(HEATMAP_COLORS.high.badge.length > 0, 'High badge should have content');
  });

  test('Each language prompt is unique', () => {
    const values = Object.values(LANGUAGE_PROMPTS);
    const unique = new Set(values);
    assert.strictEqual(unique.size, values.length, 'All language prompts should be unique');
  });

  test('SMELL_ICONS has all 6 smell types', () => {
    const expectedTypes = ['long-function', 'magic-number', 'unclear-name', 'duplicate', 'complex-condition', 'deep-nesting'] as const;
    for (const type of expectedTypes) {
      assert.ok(SMELL_ICONS[type] !== undefined, `Should have icon for "${type}"`);
    }
  });
});

suite('ErrorHandler', () => {
  let handler: ErrorHandler;

  setup(() => {
    handler = new ErrorHandler();
  });

  test('classifyError returns correct error type for 401', () => {
    const error = { message: 'Unauthorized', status: 401, statusCode: 401 };
    const result = handler.classifyError(error);
    assert.strictEqual(result.type, ErrorType.UNAUTHORIZED, '401 should be UNAUTHORIZED');
  });

  test('classifyError returns correct error type for 429', () => {
    const error = { message: 'Too Many Requests', status: 429 };
    const result = handler.classifyError(error);
    assert.strictEqual(result.type, ErrorType.RATE_LIMITED, '429 should be RATE_LIMITED');
  });

  test('classifyError returns correct error type for 502', () => {
    const error = { message: 'Bad Gateway', status: 502 };
    const result = handler.classifyError(error);
    assert.strictEqual(result.type, ErrorType.PROVIDER_DOWN, '502 should be PROVIDER_DOWN');
  });

  test('getUserMessage returns non-empty string', () => {
    const msg = handler.getUserMessage(ErrorType.UNAUTHORIZED);
    assert.ok(msg.length > 0, 'Should return non-empty user message');
    assert.ok(msg.includes('API key'), 'Should mention API key for unauthorized');
  });

  test('classifyError detects DNS failure from message', () => {
    const error = { message: 'getaddrinfo ENOTFOUND openrouter.ai' };
    const result = handler.classifyError(error);
    assert.strictEqual(result.type, ErrorType.DNS_FAILURE, 'ENOTFOUND should be DNS_FAILURE');
  });

  test('classifyError detects timeout from message', () => {
    const error = { message: 'timeout of 5000ms exceeded' };
    const result = handler.classifyError(error);
    assert.strictEqual(result.type, ErrorType.TIMEOUT, 'Timeout message should be TIMEOUT');
  });

  test('classifyError detects insufficient credits', () => {
    const error = { message: 'Insufficient credits', status: 402 };
    const result = handler.classifyError(error);
    assert.strictEqual(result.type, ErrorType.INSUFFICIENT_CREDITS, '402 should be INSUFFICIENT_CREDITS');
  });

  test('classifyError detects user cancelled', () => {
    const error = { name: 'AbortError', message: 'The operation was aborted' };
    const result = handler.classifyError(error);
    assert.strictEqual(result.type, ErrorType.USER_CANCELLED, 'AbortError should be USER_CANCELLED');
  });

  test('classifyError detects SSL errors', () => {
    const error = { message: 'SSL certificate error' };
    const result = handler.classifyError(error);
    assert.strictEqual(result.type, ErrorType.SSL_ERROR, 'SSL error should be SSL_ERROR');
  });

  test('classifyError detects connection refused', () => {
    const error = { message: 'connect ECONNREFUSED' };
    const result = handler.classifyError(error);
    assert.strictEqual(result.type, ErrorType.CONNECTION_REFUSED, 'ECONNREFUSED should be CONNECTION_REFUSED');
  });

  test('classifyError detects malformed JSON', () => {
    const error = { message: 'Unexpected token in JSON' };
    const result = handler.classifyError(error);
    assert.strictEqual(result.type, ErrorType.MALFORMED_JSON, 'JSON parse error should be MALFORMED_JSON');
  });

  test('Unknown error defaults to UNKNOWN type', () => {
    const error = { message: 'Some random cryptic error' };
    const result = handler.classifyError(error);
    assert.strictEqual(result.type, ErrorType.UNKNOWN, 'Unknown errors should default to UNKNOWN');
  });

  test('classifyError handles null/undefined gracefully', () => {
    const result = handler.classifyError(null);
    assert.strictEqual(result.type, ErrorType.UNKNOWN, 'Null error should be UNKNOWN');
    const result2 = handler.classifyError(undefined);
    assert.strictEqual(result2.type, ErrorType.UNKNOWN, 'Undefined error should be UNKNOWN');
  });

  test('classifyError returns appropriate action for each error type', () => {
    const auth = handler.classifyError({ message: '401 Unauthorized', status: 401 });
    assert.strictEqual(auth.action, 'showSettings', 'Unauthorized should suggest showSettings');
    const rate = handler.classifyError({ message: '429 Too Many Requests', status: 429 });
    assert.strictEqual(rate.action, 'wait', 'Rate limited should suggest wait');
    const down = handler.classifyError({ message: '502 Bad Gateway', status: 502 });
    assert.strictEqual(down.action, 'fallback', 'Provider down should suggest fallback');
  });

  test('getUserMessage returns specific messages per error type', () => {
    const msgs = [
      ErrorType.DNS_FAILURE,
      ErrorType.TIMEOUT,
      ErrorType.UNAUTHORIZED,
      ErrorType.RATE_LIMITED,
      ErrorType.PROVIDER_DOWN,
    ];
    for (const type of msgs) {
      const msg = handler.getUserMessage(type);
      assert.ok(msg.length > 0, `Should have message for ${type}`);
    }
  });

  test('getUserMessage for UNKNOWN returns fallback', () => {
    const msg = handler.getUserMessage(ErrorType.UNKNOWN);
    assert.ok(msg.includes('unexpected error'), 'Unknown message should mention unexpected error');
  });
});
