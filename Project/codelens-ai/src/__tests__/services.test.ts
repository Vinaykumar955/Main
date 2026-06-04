import * as assert from 'assert';
import { PromptBuilder } from '../services/PromptBuilder';
import { ResponseParser } from '../services/ResponseParser';
import { ExplanationCache } from '../services/ExplanationCache';
import { SpacedRepetition } from '../services/SpacedRepetition';
import { Glossary } from '../services/Glossary';
import { SpacedRepetitionItem } from '../utils/types';

suite('PromptBuilder — Integration', () => {
  let builder: PromptBuilder;

  setup(() => {
    builder = new PromptBuilder();
  });

  test('All prompt types return correct structure', () => {
    const code = 'function fibonacci(n: number): number {\n  if (n <= 1) return n;\n  return fibonacci(n - 1) + fibonacci(n - 2);\n}';

    const sysPrompt = builder.buildSystemPrompt('typescript', 'why', {
      analogy: true,
      socratic: true,
      simplify: true,
    });
    assert.ok(sysPrompt.includes('TypeScript expert instructor'), 'System prompt should target TypeScript');
    assert.ok(sysPrompt.includes('Depth level: why'), 'Should include depth');
    assert.ok(sysPrompt.includes('analogies'), 'Should include analogy mode');
    assert.ok(sysPrompt.includes('Socratic'), 'Should include socratic mode');
    assert.ok(sysPrompt.includes('simple terms'), 'Should include simplify mode');

    const explPrompt = builder.buildExplanationPrompt(code, 'fib.ts', 1, 5);
    assert.ok(explPrompt.includes('fib.ts'), 'Should include filename');
    assert.ok(explPrompt.includes('Lines: 1-5'), 'Should include line range');
    assert.ok(explPrompt.includes(code), 'Should include full code');
    assert.ok(explPrompt.includes('Key concepts'), 'Should ask for concepts');
    assert.ok(explPrompt.includes('potential issues'), 'Should ask for improvements');

    const smellPrompt = builder.buildCodeSmellPrompt(code);
    assert.ok(smellPrompt.includes('code smells'), 'Should target code smells');
    assert.ok(smellPrompt.includes('long-function'), 'Should list valid smell types');
    assert.ok(smellPrompt.includes('deep-nesting'), 'Should list valid smell types');

    const analogyPrompt = builder.buildAnalogyPrompt(code, 'recursion');
    assert.ok(analogyPrompt.includes('recursion'), 'Should include concept');
    assert.ok(analogyPrompt.includes('analogies'), 'Should reference analogies');

    const vocabPrompt = builder.buildVocabularyPrompt('recursion', 'function calls itself');
    assert.ok(vocabPrompt.includes('recursion'), 'Should include term');
    assert.ok(vocabPrompt.includes('function calls itself'), 'Should include context');
    assert.ok(vocabPrompt.includes('code example'), 'Should ask for example');

    const practicePrompt = builder.buildPracticePrompt(code, 3);
    assert.ok(practicePrompt.includes('3'), 'Should include count');
    assert.ok(practicePrompt.includes('practice exercises'), 'Should reference exercises');

    const errorPrompt = builder.buildErrorExplanationPrompt('Stack overflow', code);
    assert.ok(errorPrompt.includes('Stack overflow'), 'Should include error text');

    const quizPrompt = builder.buildQuizPrompt(code, 'recursion');
    assert.ok(quizPrompt.includes('recursion'), 'Should include concept');
    assert.ok(quizPrompt.includes('quiz question'), 'Should reference quiz');

    const pathPrompt = builder.buildLearningPathPrompt(['variables'], ['closures']);
    assert.ok(pathPrompt.includes('variables'), 'Should include mastered');
    assert.ok(pathPrompt.includes('closures'), 'Should include learning');

    const socraticPrompt = builder.buildSocraticPrompt(code, 'I think it uses recursion');
    assert.ok(socraticPrompt.includes('Socratic method'), 'Should reference Socratic');
    assert.ok(socraticPrompt.includes('I think it uses recursion'), 'Should include previous answer');
  });

  test('buildSystemPrompt combines all options correctly', () => {
    const prompt = builder.buildSystemPrompt('python', 'how', {
      analogy: true,
      socratic: true,
      simplify: true,
      quiz: true,
    });
    assert.ok(prompt.includes('Python expert instructor'));
    assert.ok(prompt.includes('analogies'));
    assert.ok(prompt.includes('Socratic'));
    assert.ok(prompt.includes('simple terms'));
    assert.ok(prompt.includes('quiz question'));
    assert.ok(prompt.includes('Keep explanations concise'));
    assert.ok(prompt.includes('Format any code blocks'));
  });

  test('buildExplanationPrompt handles multiline code blocks', () => {
    const code = 'line1\nline2\nline3';
    const prompt = builder.buildExplanationPrompt(code, 'test.py', 10, 12);
    assert.ok(prompt.includes('```\n' + code + '\n```'), 'Should wrap code in fenced block');
    const lines = prompt.split('\n');
    const codeStart = lines.indexOf('```');
    const codeEnd = lines.lastIndexOf('```');
    assert.ok(codeStart >= 0 && codeEnd > codeStart, 'Code should be between fences');
  });

  test('buildErrorExplanationPrompt handles empty code', () => {
    const prompt = builder.buildErrorExplanationPrompt('TypeError', '');
    assert.ok(prompt.includes('TypeError'), 'Should include error');
    assert.ok(!prompt.includes('```'), 'Should not include code block for empty code');
  });

  test('buildLearningPathPrompt handles empty arrays', () => {
    const prompt = builder.buildLearningPathPrompt([], []);
    assert.ok(prompt.includes('None'), 'Should handle empty mastered topics');
  });

  test('buildSocraticPrompt without previous answer', () => {
    const prompt = builder.buildSocraticPrompt('const x = 1;');
    assert.ok(!prompt.includes('The user provided'), 'Should not include previous answer section');
  });
});

suite('ResponseParser — Integration', () => {
  let parser: ResponseParser;

  setup(() => {
    parser = new ResponseParser();
  });

  const realisticExplanation = `## Code Explanation

This function implements the Fibonacci sequence using recursion. 

**Complexity score:** 7/10

\`\`\`typescript
function fibonacci(n: number): number {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}
\`\`\`

Key concepts:
- Recursion
- Base case
- Time complexity

The function has exponential time complexity O(2^n). Consider using memoization.`;

  test('parseExplanation with realistic AI response', () => {
    const result = parser.parseExplanation(realisticExplanation);
    assert.ok(result.explanation.length > 50, 'Should extract substantial explanation');
    assert.ok(result.explanation.includes('Fibonacci'), 'Should contain key content');
    assert.ok(result.complexity >= 0 && result.complexity <= 10, 'Complexity should be 0-10');
    assert.strictEqual(result.complexity, 7, 'Should extract complexity score');
  });

  test('parseCodeSmells with realistic response detecting issues', () => {
    const aiResponse = `I found a code smell in this function. On line 3, there's a magic number 42. Also, line 1 has a long function that should be broken down.

\`\`\`json
[
  {"line": 1, "type": "long-function", "message": "Function is too long (50 lines)", "severity": "warning"},
  {"line": 3, "type": "magic-number", "message": "Magic number 42 detected", "severity": "info"}
]
\`\`\``;

    const code = Array(50).fill('// comment').join('\n') + '\nconst x = 42;\n';
    const smells = parser.parseCodeSmells(aiResponse, code);
    assert.ok(smells.length >= 2, 'Should detect multiple smells');
    const magicSmell = smells.find(s => s.type === 'magic-number');
    assert.ok(magicSmell, 'Should detect magic number');
    const longFunc = smells.find(s => s.type === 'long-function');
    assert.ok(longFunc, 'Should detect long function');
  });

  test('parseCodeSmells with non-JSON response', () => {
    const aiResponse = 'The code looks clean. I found a minor issue on line 5 with a long condition.';
    const longLine = 'if (a && b && c && d) { ';
    const code = 'const x = 1;\nconst y = 2;\nconst z = 3;\nconst w = 4;\n' + longLine;
    const smells = parser.parseCodeSmells(aiResponse, code);
    assert.ok(Array.isArray(smells), 'Should return array');
  });

  test('parseConcepts with realistic response', () => {
    const aiResponse = `Key concepts: recursion, memoization, dynamic programming

The main idea here is \`recursion\` where the function calls itself. We also use \`base case\` to terminate the recursion.
Core concept: divide and conquer approach.`;
    const concepts = parser.parseConcepts(aiResponse);
    assert.ok(concepts.length >= 3, 'Should extract multiple concepts');
    assert.ok(concepts.some(c => c.toLowerCase().includes('recursion')), 'Should find recursion');
    assert.ok(concepts.some(c => c.toLowerCase().includes('memoization')), 'Should find memoization');
  });

  test('parseComplexityScore handles various formats', () => {
    assert.strictEqual(parser.parseComplexityScore('Complexity score: 8/10'), 8, 'Format: "score: X/10"');
    assert.strictEqual(parser.parseComplexityScore('Complexity rating: 4.5/10'), 4.5, 'Format: decimal score');
    assert.strictEqual(parser.parseComplexityScore('Score: 10'), 10, 'Format: "Score: X"');
    assert.strictEqual(parser.parseComplexityScore('Complexity: 3'), 3, 'Format: "Complexity: X"');
  });

  test('extractJsonFromResponse handles various JSON formats', () => {
    const fenced = 'text\n```json\n{"a": 1}\n```\ntext';
    assert.strictEqual(parser.extractJsonFromResponse(fenced), '{"a": 1}', 'Code-fenced JSON');

    const bare = '{"b": 2}';
    assert.strictEqual(parser.extractJsonFromResponse(bare), '{"b": 2}', 'Bare JSON object');

    const array = 'text\n[1, 2, 3]\ntext';
    assert.strictEqual(parser.extractJsonFromResponse(array), '[1, 2, 3]', 'Bare JSON array');

    const nested = '{"outer": {"inner": [1, 2]}}';
    assert.strictEqual(parser.extractJsonFromResponse(nested), nested, 'Nested JSON');
  });

  test('parseQuizQuestion with realistic format', () => {
    const raw = `Here is a quiz question:

Question: What is the time complexity of binary search?
Code:
\`\`\`javascript
function binarySearch(arr, target) {
  let left = 0, right = arr.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}
\`\`\`

Correct Answer: O(log n)
Difficulty: 3
Concept: algorithms`;

    const quiz = parser.parseQuizQuestion(raw);
    assert.ok(quiz.id.startsWith('quiz-'), 'Should generate quiz ID');
    assert.ok(quiz.question.includes('binary search'), 'Should extract question');
    assert.ok(quiz.correctAnswer.includes('log'), 'Should extract answer');
    assert.ok(quiz.code.includes('binarySearch'), 'Should extract code');
    assert.strictEqual(quiz.difficulty, 3, 'Should use default difficulty when not in JSON');
  });

  test('parseAnalogies with realistic analogies', () => {
    const raw = `Think of recursion like Matryoshka dolls - each doll contains a smaller version of itself.
    
Another analogy: recursion is like standing between two mirrors, seeing infinite reflections of yourself.
    
Like a Russian doll, a recursive function contains a smaller version of its own operation.`;
    const analogies = parser.parseAnalogies(raw);
    assert.ok(analogies.length > 0, 'Should extract analogies');
    const hasDollAnalogy = analogies.some(a => a.analogy.includes('doll') || a.analogy.includes('mirror'));
    assert.ok(hasDollAnalogy, 'Should find doll or mirror analogy');
  });

  test('parseLearningPath with realistic recommendation', () => {
    const raw = `## Recommended Learning Path

Based on your current knowledge, here are the next topics:

Next topics to learn:
- Asynchronous Programming
- Promises and Async/Await
- Error Handling Patterns
- Event Loop Deep Dive

Resources:
- MDN: Asynchronous JavaScript
- JavaScript.info: Promises
- You Don't Know JS: Async & Performance

Prerequisites:
- Basic JavaScript syntax
- Functions and callbacks
- Basic understanding of scope`;

    const path = parser.parseLearningPath(raw);
    assert.ok(path.topics.length >= 3, 'Should extract multiple topics');
    assert.ok(path.topics.some(t => t.toLowerCase().includes('async')), 'Should find async topics');
    assert.ok(path.resources.length >= 2, 'Should extract resources');
    assert.ok(path.prerequisites.length >= 2, 'Should extract prerequisites');
  });

  test('parsePracticeExercises with realistic exercises', () => {
    const raw = `Exercise 1: Implement a function that reverses a string
Description: Write a function that takes a string and returns it reversed.
\`\`\`javascript
function reverseString(str) {
  return str.split('').reverse().join('');
}
\`\`\`

Exercise 2: Find the maximum number in an array
\`\`\`javascript
function findMax(arr) {
  return Math.max(...arr);
}
\`\`\``;

    const exercises = parser.parsePracticeExercises(raw);
    assert.ok(exercises.length >= 2, 'Should extract multiple exercises');
    const first = exercises[0];
    assert.ok(first.title.length > 0, 'Should have title');
    assert.ok(first.solution.length > 0, 'Should have solution code');
  });

  test('parseQuizEvaluation with various response formats', () => {
    const correct = parser.parseQuizEvaluation('Correct! The answer is indeed O(n).');
    assert.strictEqual(correct.isCorrect, true, 'Should detect correct');
    assert.ok(correct.explanation.length > 0, 'Should return explanation');

    const incorrect = parser.parseQuizEvaluation('Wrong. The correct answer is O(log n).');
    assert.strictEqual(incorrect.isCorrect, false, 'Should detect incorrect');

    const explicit = parser.parseQuizEvaluation('```json\n{"isCorrect": true, "correctAnswer": "O(log n)", "explanation": "Binary search halves the search space each iteration."}\n```');
    assert.strictEqual(explicit.isCorrect, true, 'Should detect correct from JSON');
    assert.strictEqual(explicit.correctAnswer, 'O(log n)', 'Should extract answer from JSON');
  });

  test('parseComplexityScore estimates from content heuristics', () => {
    assert.strictEqual(parser.parseComplexityScore('a'.repeat(2500)), 8, 'Very long content should score 8');
    assert.strictEqual(parser.parseComplexityScore('a'.repeat(1500)), 6, 'Long content should score 6');
    assert.strictEqual(parser.parseComplexityScore('a'.repeat(750)), 4, 'Medium content should score 4');
    assert.strictEqual(parser.parseComplexityScore('short'), 2, 'Short content should score 2');
  });

  test('explicit complexity score overrides heuristic', () => {
    const longText = 'Complexity score: 3/10\n' + 'x'.repeat(3000);
    assert.strictEqual(parser.parseComplexityScore(longText), 3, 'Explicit score should override length heuristic');
  });
});

suite('ExplanationCache — Integration', () => {
  test('Cache behavior under load with many entries', () => {
    const cache = new ExplanationCache(100, 60000);

    for (let i = 0; i < 100; i++) {
      cache.set(`key-${i}`, {
        data: `value-${i}`,
        timestamp: Date.now(),
        model: 'test',
        language: 'ts',
      });
    }

    assert.strictEqual(cache.size(), 100, 'Should store 100 entries');

    for (let i = 0; i < 100; i++) {
      const entry = cache.get(`key-${i}`);
      assert.ok(entry !== null, `Entry key-${i} should exist`);
      assert.strictEqual(entry!.data, `value-${i}`, `Entry key-${i} should have correct value`);
    }

    const stats = cache.getStats();
    assert.strictEqual(stats.hits, 100, 'Should have 100 hits');
    assert.strictEqual(stats.misses, 0, 'Should have 0 misses');
  });

  test('Eviction under memory pressure', () => {
    const cache = new ExplanationCache(5);

    for (let i = 0; i < 10; i++) {
      cache.set(`key-${i}`, {
        data: `value-${i}`,
        timestamp: Date.now(),
        model: 'test',
        language: 'ts',
      });
    }

    assert.strictEqual(cache.size(), 5, 'Should keep only 5 entries after eviction');

    for (let i = 0; i < 5; i++) {
      assert.strictEqual(cache.get(`key-${i}`), null, `key-${i} should be evicted`);
    }

    for (let i = 5; i < 10; i++) {
      assert.ok(cache.get(`key-${i}`) !== null, `key-${i} should still exist`);
    }
  });

  test('Access order affects LRU eviction', () => {
    const cache = new ExplanationCache(3);

    cache.set('a', { data: 'a', timestamp: Date.now(), model: 'm', language: 'l' });
    cache.set('b', { data: 'b', timestamp: Date.now(), model: 'm', language: 'l' });
    cache.set('c', { data: 'c', timestamp: Date.now(), model: 'm', language: 'l' });

    cache.get('a');
    cache.get('b');

    cache.set('d', { data: 'd', timestamp: Date.now(), model: 'm', language: 'l' });

    assert.strictEqual(cache.get('c'), null, 'c should be evicted (least recently accessed)');
    assert.ok(cache.get('a') !== null, 'a should exist (recently accessed)');
    assert.ok(cache.get('b') !== null, 'b should exist (recently accessed)');
    assert.ok(cache.get('d') !== null, 'd should exist (newly added)');
  });

  test('Purge expired entries across multiple operations', () => {
    const cache = new ExplanationCache(10, 100);

    cache.set('expired1', { data: 'e1', timestamp: Date.now() - 200, model: 'm', language: 'l' });
    cache.set('expired2', { data: 'e2', timestamp: Date.now() - 200, model: 'm', language: 'l' });
    cache.set('fresh1', { data: 'f1', timestamp: Date.now(), model: 'm', language: 'l' });
    cache.set('fresh2', { data: 'f2', timestamp: Date.now(), model: 'm', language: 'l' });

    assert.strictEqual(cache.purgeExpired(), 2, 'Should purge 2 expired');
    assert.strictEqual(cache.size(), 2, 'Should have 2 fresh entries');
    assert.ok(cache.get('fresh1') !== null, 'Fresh entries should survive');
    assert.ok(cache.get('fresh2') !== null, 'Fresh entries should survive');
  });

  test('Mixed hit/miss stats are accurate', () => {
    const cache = new ExplanationCache();
    cache.set('exists', { data: 'value', timestamp: Date.now(), model: 'm', language: 'l' });

    const accesses = ['exists', 'missing1', 'exists', 'missing2', 'exists'];
    accesses.forEach(k => cache.get(k));

    const stats = cache.getStats();
    assert.strictEqual(stats.hits, 3, 'Should have 3 hits');
    assert.strictEqual(stats.misses, 2, 'Should have 2 misses');
    assert.strictEqual(stats.hitRate, 0.6, 'Hit rate should be 0.6');
  });

  test('getOrFetch does not cache when fetcher throws', async () => {
    const cache = new ExplanationCache();
    try {
      await cache.getOrFetch('fail-key', async () => {
        throw new Error('fetch failed');
      });
    } catch {
      // expected
    }
    assert.strictEqual(cache.get('fail-key'), null, 'Failed fetch should not cache');
  });
});

suite('SpacedRepetition — Integration', () => {
  let sr: SpacedRepetition;

  setup(() => {
    sr = new SpacedRepetition();
  });

  function makeItem(overrides: Partial<SpacedRepetitionItem> = {}): SpacedRepetitionItem {
    return {
      id: 'item-1',
      concept: 'test',
      code: '',
      explanation: '',
      ease: 2.5,
      interval: 0,
      repetitions: 0,
      nextReview: 0,
      lastReview: 0,
      ...overrides,
    };
  }

  test('Full SM-2 sequence with various qualities', () => {
    let item = makeItem();

    item = sr.calculateNextReview(item, 5);
    assert.strictEqual(item.interval, 1, 'Perfect first review: interval = 1');
    assert.strictEqual(item.repetitions, 1, 'Repetitions = 1');

    item = sr.calculateNextReview(item, 4);
    assert.strictEqual(item.interval, 6, 'Good second review: interval = 6');
    assert.strictEqual(item.repetitions, 2, 'Repetitions = 2');

    item = sr.calculateNextReview(item, 3);
    const expectedInterval = Math.round(6 * item.ease);
    assert.strictEqual(item.interval, expectedInterval, 'Third review uses ease × previous interval');
    assert.strictEqual(item.repetitions, 3, 'Repetitions = 3');

    item = sr.calculateNextReview(item, 2);
    assert.strictEqual(item.interval, 1, 'Failed review (< 3): interval resets to 1');
    assert.strictEqual(item.repetitions, 0, 'Failed review: repetitions reset to 0');
  });

  test('Ease factor increases with high quality', () => {
    let item = makeItem({ ease: 2.5 });
    item = sr.calculateNextReview(item, 5);
    assert.ok(item.ease > 2.5, 'Ease should increase with quality 5');
  });

  test('Ease factor decreases with low quality', () => {
    let item = makeItem({ ease: 2.5 });
    item = sr.calculateNextReview(item, 2);
    assert.ok(item.ease < 2.5, 'Ease should decrease with quality 2');
  });

  test('Ease never goes below 1.3 even with repeated low quality', () => {
    let item = makeItem({ ease: 2.5 });
    for (let i = 0; i < 20; i++) {
      item = sr.calculateNextReview(item, 0);
      if (item.ease < 1.3) {
        assert.fail(`Ease fell below 1.3 at iteration ${i}: ${item.ease}`);
      }
    }
    assert.strictEqual(Math.round(item.ease * 100) / 100, 1.3, 'Ease should stabilize at 1.3');
  });

  test('getItemPriority sorts overdue items correctly', () => {
    const now = Date.now();
    const items = [
      makeItem({ id: 'a', nextReview: now - 10000, ease: 2.5 }),
      makeItem({ id: 'b', nextReview: now - 5000, ease: 1.5 }),
      makeItem({ id: 'c', nextReview: now - 20000, ease: 2.0 }),
    ];

    const priorities = items.map(i => ({ id: i.id, priority: sr.getItemPriority(i) }));
    priorities.sort((a, b) => b.priority - a.priority);

    assert.strictEqual(priorities[0].id, 'c', 'Most overdue should have highest priority');
    assert.strictEqual(priorities[1].id, 'a', 'Second most overdue should have second highest');
  });

  test('getNextReviewDate returns correct timestamp', () => {
    const item = makeItem({ nextReview: 123456789 });
    assert.strictEqual(sr.getNextReviewDate(item), 123456789, 'Should return nextReview timestamp');
  });
});

suite('Glossary — Integration', () => {
  let glossary: Glossary;

  setup(() => {
    glossary = new Glossary();
  });

  test('Every category has expected number of terms', () => {
    const expectedSizes: Record<string, number> = {
      variables: 8,
      functions: 13,
      oop: 16,
      patterns: 10,
      'data-structures': 18,
      algorithms: 14,
      concurrency: 11,
      web: 13,
      databases: 11,
      misc: 34,
    };

    for (const [category, expected] of Object.entries(expectedSizes)) {
      const terms = glossary.getTermsByCategory(category);
      assert.strictEqual(terms.length, expected, `Category "${category}" should have ${expected} terms`);
    }
  });

  test('No duplicate terms in glossary', () => {
    const all = glossary.getAllTerms();
    const terms = all.map(t => t.term.toLowerCase());
    const unique = new Set(terms);
    assert.strictEqual(unique.size, terms.length, 'All terms should be unique');
  });

  test('Every definition is non-empty', () => {
    const all = glossary.getAllTerms();
    for (const entry of all) {
      assert.ok(entry.definition.length > 0, `Definition for "${entry.term}" should not be empty`);
    }
  });

  test('Search with partial term matches across categories', () => {
    const results = glossary.searchDefinitions('tree');
    assert.ok(results.length >= 4, 'Should find tree-related terms from multiple categories');
    const categories = new Set(results.map(r => r.category));
    assert.ok(categories.size >= 2, 'Results should span multiple categories');
  });

  test('getTermsByCategory returns empty for non-existent category', () => {
    const terms = glossary.getTermsByCategory('nonexistent');
    assert.strictEqual(terms.length, 0, 'Should return empty array');
  });

  test('Glossary is populated immediately after construction', () => {
    const g = new Glossary();
    assert.ok(g.getDefinition('variable') !== null, 'Should have definitions immediately');
    assert.ok(g.getDefinition('algorithm') !== null, 'Should have definitions immediately');
    assert.ok(g.getDefinition('API') !== null, 'Should have definitions immediately');
  });
});
