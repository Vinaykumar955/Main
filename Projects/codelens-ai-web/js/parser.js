/**
 * @typedef {'long-function'|'magic-number'|'unclear-name'|'duplicate'|'complex-condition'|'deep-nesting'} CodeSmellType
 * @typedef {'info'|'warning'|'error'} SeverityLevel
 */

/**
 * @typedef {Object} CodeSmell
 * @property {number} line
 * @property {CodeSmellType} type
 * @property {string} message
 * @property {SeverityLevel} severity
 */

/**
 * @typedef {Object} QuizQuestion
 * @property {string} id
 * @property {string} code
 * @property {string} question
 * @property {string} correctAnswer
 * @property {number} difficulty
 * @property {string} concept
 */

/**
 * @typedef {Object} ParsedExplanation
 * @property {string} explanation
 * @property {number} complexity
 * @property {number[]} lineReferences
 */

/**
 * @typedef {Object} ParsedQuizEvaluation
 * @property {boolean} isCorrect
 * @property {string} correctAnswer
 * @property {string} explanation
 */

/**
 * @typedef {Object} ParsedAnalogy
 * @property {string} concept
 * @property {string} analogy
 * @property {string} explanation
 */

/**
 * @typedef {Object} ParsedPracticeExercise
 * @property {string} title
 * @property {string} description
 * @property {string} [starterCode]
 * @property {string} [expectedOutput]
 * @property {string} solution
 */

/**
 * @typedef {Object} ParsedLearningPath
 * @property {string[]} topics
 * @property {string[]} resources
 * @property {string[]} prerequisites
 */

const VALID_SMELL_TYPES = ['long-function', 'magic-number', 'unclear-name', 'duplicate', 'complex-condition', 'deep-nesting'];

export class ResponseParser {
  /**
   * @param {string} raw
   * @returns {ParsedExplanation}
   */
  parseExplanation(raw) {
    const clean = this.extractJsonFromResponse(raw) || raw;
    return {
      explanation: clean,
      complexity: this.parseComplexityScore(clean),
      lineReferences: this.extractLineNumbers(clean),
    };
  }

  /**
   * @param {string} raw
   * @param {string} code
   * @returns {CodeSmell[]}
   */
  parseCodeSmells(raw, code) {
    const json = this.extractJsonFromResponse(raw);
    if (json) {
      try {
        const parsed = JSON.parse(json);
        if (Array.isArray(parsed)) {
          return parsed
            .filter((s) => s && s.line !== undefined && s.type)
            .map((s) => ({
              line: typeof s.line === 'number' ? s.line : parseInt(s.line, 10) || 0,
              type: s.type,
              message: s.message || 'Unknown code smell',
              severity: s.severity || 'warning',
            }))
            .filter((s) => VALID_SMELL_TYPES.includes(s.type));
        }
      } catch {
      }
    }

    /** @type {CodeSmell[]} */
    const smells = [];
    const lines = code.split('\n');
    const mentionPattern = /(?:line|ln)\s*[:#]?\s*(\d+)/gi;
    /** @type {RegExpExecArray|null} */
    let match;
    const allMatches = new Set();

    while ((match = mentionPattern.exec(raw)) !== null) {
      const lineNum = parseInt(match[1], 10);
      if (lineNum > 0 && lineNum <= lines.length) {
        allMatches.add(lineNum);
      }
    }

    allMatches.forEach(line => {
      const lineContent = lines[line - 1] || '';
      /** @type {CodeSmellType} */
      let type = 'unclear-name';
      /** @type {SeverityLevel} */
      let severity = 'warning';

      if (lineContent.length > 100) {
        type = 'long-function';
        severity = 'warning';
      } else if (/[0-9]{4,}/.test(lineContent)) {
        type = 'magic-number';
        severity = 'info';
      } else if (/(&&.*){3,}|(\|\|.*){3,}/.test(lineContent)) {
        type = 'complex-condition';
        severity = 'error';
      } else if (/\{[^}]*\{[^}]*\{/.test(lineContent)) {
        type = 'deep-nesting';
        severity = 'error';
      }

      smells.push({
        line,
        type,
        message: `Potential issue detected on line ${line}`,
        severity,
      });
    });

    return smells;
  }

  /**
   * @param {string} raw
   * @returns {string[]}
   */
  parseConcepts(raw) {
    const json = this.extractJsonFromResponse(raw);
    if (json) {
      try {
        const parsed = JSON.parse(json);
        if (Array.isArray(parsed) && parsed.every((i) => typeof i === 'string')) {
          return parsed;
        }
      } catch {
      }
    }

    const concepts = new Set();
    const conceptPatterns = [
      /concept(?:s)?[\s:]+([^\n]+)/gi,
      /(?:key|main|core)\s+(?:concept|idea|topic)[\s:]+([^\n]+)/gi,
    ];

    for (const pattern of conceptPatterns) {
      /** @type {RegExpExecArray|null} */
      let match;
      while ((match = pattern.exec(raw)) !== null) {
        const captured = match[1].split(/[,;]/).map(s => s.trim()).filter(Boolean);
        captured.forEach(c => {
          if (c.length > 2 && c.length < 100) {
            concepts.add(c.replace(/\.$/, ''));
          }
        });
      }
    }

    const termPattern = /`([A-Za-z][A-Za-z0-9\s#+.-]+)`/g;
    /** @type {RegExpExecArray|null} */
    let match;
    while ((match = termPattern.exec(raw)) !== null) {
      const term = match[1].trim();
      if (term.length > 1 && term.split(/\s+/).length <= 4) {
        concepts.add(term);
      }
    }

    return Array.from(concepts).slice(0, 20);
  }

  /**
   * @param {string} raw
   * @returns {QuizQuestion}
   */
  parseQuizQuestion(raw) {
    const json = this.extractJsonFromResponse(raw);
    if (json) {
      try {
        const parsed = JSON.parse(json);
        if (parsed && parsed.question && parsed.correctAnswer) {
          return {
            id: `quiz-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            code: parsed.code || '',
            question: parsed.question,
            correctAnswer: parsed.correctAnswer,
            difficulty: typeof parsed.difficulty === 'number' ? parsed.difficulty : 3,
            concept: parsed.concept || 'general',
          };
        }
      } catch {
      }
    }

    const questionMatch = raw.match(/(?:^|\n)\s*Question[:\s]*([^\n]+)/im);
    const answerMatch = raw.match(/(?:^|\n)\s*(?:Correct Answer|Answer)[:\s]*([^\n]+)/im);
    const codeMatch = raw.match(/```[\s\S]*?```/);

    return {
      id: `quiz-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      code: codeMatch ? codeMatch[0].replace(/```\w*\n?/g, '').trim() : '',
      question: questionMatch ? questionMatch[1].trim() : 'Unknown question',
      correctAnswer: answerMatch ? answerMatch[1].trim() : 'Unknown',
      difficulty: 3,
      concept: 'general',
    };
  }

  /**
   * @param {string} raw
   * @returns {ParsedQuizEvaluation}
   */
  parseQuizEvaluation(raw) {
    const json = this.extractJsonFromResponse(raw);
    if (json) {
      try {
        const parsed = JSON.parse(json);
        if (parsed && parsed.isCorrect !== undefined) {
          return {
            isCorrect: !!parsed.isCorrect,
            correctAnswer: parsed.correctAnswer || '',
            explanation: parsed.explanation || '',
          };
        }
      } catch {
      }
    }

    const correctMatch = raw.match(/(?:correct|right|accurate)/i);
    const incorrectMatch = raw.match(/(?:incorrect|wrong|not correct)/i);
    const isCorrect = correctMatch && !incorrectMatch;

    const answerMatch = raw.match(/(?:correct answer|answer should be)[:\s]*([^\n]+)/i);

    return {
      isCorrect: !!isCorrect,
      correctAnswer: answerMatch ? answerMatch[1].trim() : '',
      explanation: raw.trim(),
    };
  }

  /**
   * @param {string} raw
   * @returns {ParsedAnalogy[]}
   */
  parseAnalogies(raw) {
    const json = this.extractJsonFromResponse(raw);
    if (json) {
      try {
        const parsed = JSON.parse(json);
        if (Array.isArray(parsed)) {
          return parsed
            .filter((a) => a && a.concept && a.analogy)
            .map((a) => ({
              concept: a.concept,
              analogy: a.analogy,
              explanation: a.explanation || '',
            }));
        }
      } catch {
      }
    }

    /** @type {ParsedAnalogy[]} */
    const analogies = [];
    const analogyPattern = /(?:analogy|like|similar to|imagine)[:\s]*([^\n]+?)(?:\.|$)/gi;
    /** @type {RegExpExecArray|null} */
    let match;

    while ((match = analogyPattern.exec(raw)) !== null) {
      const text = match[1].trim();
      if (text.length > 10 && text.length < 200) {
        const concept = text.split(/\s+/).slice(0, 4).join(' ');
        analogies.push({
          concept,
          analogy: text,
          explanation: text,
        });
      }
    }

    return analogies.slice(0, 5);
  }

  /**
   * @param {string} raw
   * @returns {ParsedPracticeExercise[]}
   */
  parsePracticeExercises(raw) {
    const json = this.extractJsonFromResponse(raw);
    if (json) {
      try {
        const parsed = JSON.parse(json);
        if (Array.isArray(parsed)) {
          return parsed
            .filter((e) => e && e.title && e.solution)
            .map((e) => ({
              title: e.title,
              description: e.description || '',
              starterCode: e.starterCode,
              expectedOutput: e.expectedOutput,
              solution: e.solution,
            }));
        }
      } catch {
      }
    }

    /** @type {ParsedPracticeExercise[]} */
    const exercises = [];
    const exerciseBlocks = raw.split(/(?:Exercise|Practice)\s*\d+/i).slice(1);

    for (const block of exerciseBlocks) {
      const title = block.match(/^[:\s]*([^\n]+)/);
      const codeBlocks = block.match(/```[\s\S]*?```/g) || [];
      const solution = codeBlocks.length > 0 ? codeBlocks[codeBlocks.length - 1].replace(/```\w*\n?/g, '').trim() : '';

      exercises.push({
        title: title ? title[1].trim() : 'Practice Exercise',
        description: block.replace(/```[\s\S]*?```/g, '').trim().slice(0, 200),
        solution,
      });
    }

    return exercises.slice(0, 5);
  }

  /**
   * @param {string} raw
   * @returns {ParsedLearningPath}
   */
  parseLearningPath(raw) {
    const json = this.extractJsonFromResponse(raw);
    if (json) {
      try {
        const parsed = JSON.parse(json);
        if (parsed && parsed.topics) {
          return {
            topics: Array.isArray(parsed.topics) ? parsed.topics.filter((t) => typeof t === 'string') : [],
            resources: Array.isArray(parsed.resources) ? parsed.resources.filter((r) => typeof r === 'string') : [],
            prerequisites: Array.isArray(parsed.prerequisites) ? parsed.prerequisites.filter((p) => typeof p === 'string') : [],
          };
        }
      } catch {
      }
    }

    /** @type {string[]} */
    const topics = [];
    /** @type {string[]} */
    const resources = [];
    /** @type {string[]} */
    const prerequisites = [];

    const topicSection = raw.match(/(?:next|recommended|topics?)\s*(?:to learn|topics?)[^:]*:?\s*([\s\S]*?)(?:\n\n|\n(?:resource|prerequisite)|$)/i);
    if (topicSection) {
      const items = topicSection[1].split('\n').filter(l => /^[-*\d.]/.test(l.trim()));
      items.forEach(item => {
        const text = item.replace(/^[-*\d.]+\s*/, '').trim();
        if (text) topics.push(text);
      });
    }

    const resourceSection = raw.match(/(?:resource|reference|reading)[^:]*:?\s*([\s\S]*?)(?:\n\n|\n(?:prerequisite|topic)|$)/i);
    if (resourceSection) {
      const items = resourceSection[1].split('\n').filter(l => /^[-*\d.]/.test(l.trim()));
      items.forEach(item => {
        const text = item.replace(/^[-*\d.]+\s*/, '').trim();
        if (text) resources.push(text);
      });
    }

    const prereqSection = raw.match(/(?:prerequisite|before|assumed)[^:]*:?\s*([\s\S]*?)(?:\n\n|$)/i);
    if (prereqSection) {
      const items = prereqSection[1].split('\n').filter(l => /^[-*\d.]/.test(l.trim()));
      items.forEach(item => {
        const text = item.replace(/^[-*\d.]+\s*/, '').trim();
        if (text) prerequisites.push(text);
      });
    }

    return { topics, resources, prerequisites };
  }

  /**
   * @param {string} raw
   * @returns {number}
   */
  parseComplexityScore(raw) {
    const json = this.extractJsonFromResponse(raw);
    if (json) {
      try {
        const parsed = JSON.parse(json);
        if (parsed && typeof parsed.score === 'number') {
          return Math.max(0, Math.min(10, parsed.score));
        }
      } catch {
      }
    }

    const scorePatterns = [
      /complexity\s*(?:score|rating|level)?[:\s]*(-?\d+(?:\.\d+)?)\s*\/?\s*10/i,
      /(?:complexity|score|rating)[:\s]*(-?\d+(?:\.\d+)?)/i,
      /(-?\d+(?:\.\d+)?)\s*\/?\s*10/,
    ];

    for (const pattern of scorePatterns) {
      const match = raw.match(pattern);
      if (match) {
        const score = parseFloat(match[1]);
        if (!isNaN(score)) {
          return Math.min(10, Math.max(0, Math.round(score * 10) / 10));
        }
      }
    }

    const length = raw.length;
    if (length > 2000) return 8;
    if (length > 1000) return 6;
    if (length > 500) return 4;
    return 2;
  }

  /**
   * @param {string} raw
   * @returns {string|null}
   */
  extractJsonFromResponse(raw) {
    if (!raw) return null;

    const codeBlockMatch = raw.match(/```(?:json)?\s*\n?([\s\S]*?)```/);
    if (codeBlockMatch) {
      const extracted = codeBlockMatch[1].trim();
      try {
        JSON.parse(extracted);
        return extracted;
      } catch {
      }
    }

    const startIdx = raw.indexOf('{');
    const endIdx = raw.lastIndexOf('}');
    const arrayStart = raw.indexOf('[');
    const arrayEnd = raw.lastIndexOf(']');

    if (startIdx !== -1 && endIdx > startIdx) {
      const candidate = raw.slice(startIdx, endIdx + 1);
      try {
        JSON.parse(candidate);
        return candidate;
      } catch {
      }
    }

    if (arrayStart !== -1 && arrayEnd > arrayStart) {
      const candidate = raw.slice(arrayStart, arrayEnd + 1);
      try {
        JSON.parse(candidate);
        return candidate;
      } catch {
      }
    }

    return null;
  }

  /**
   * @private
   * @param {string} text
   * @returns {number[]}
   */
  extractLineNumbers(text) {
    const linePattern = /(?:line|ln)\s*[:#]?\s*(\d+)/gi;
    const lines = new Set();
    /** @type {RegExpExecArray|null} */
    let match;
    while ((match = linePattern.exec(text)) !== null) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num) && num > 0 && num < 100000) {
        lines.add(num);
      }
    }
    return Array.from(lines).sort((a, b) => a - b);
  }
}

/**
 * Standalone: parseExplanation
 * @param {string} raw
 * @returns {ParsedExplanation}
 */
export function parseExplanation(raw) {
  return new ResponseParser().parseExplanation(raw);
}

/**
 * Standalone: parseCodeSmells
 * @param {string} raw
 * @param {string} code
 * @returns {CodeSmell[]}
 */
export function parseCodeSmells(raw, code) {
  return new ResponseParser().parseCodeSmells(raw, code);
}

/**
 * Standalone: parseConcepts
 * @param {string} raw
 * @returns {string[]}
 */
export function parseConcepts(raw) {
  return new ResponseParser().parseConcepts(raw);
}

/**
 * Standalone: parseQuizQuestion
 * @param {string} raw
 * @returns {QuizQuestion}
 */
export function parseQuizQuestion(raw) {
  return new ResponseParser().parseQuizQuestion(raw);
}

/**
 * Standalone: parseQuizEvaluation
 * @param {string} raw
 * @returns {ParsedQuizEvaluation}
 */
export function parseQuizEvaluation(raw) {
  return new ResponseParser().parseQuizEvaluation(raw);
}

/**
 * Standalone: parseAnalogies
 * @param {string} raw
 * @returns {ParsedAnalogy[]}
 */
export function parseAnalogies(raw) {
  return new ResponseParser().parseAnalogies(raw);
}

/**
 * Standalone: parsePracticeExercises
 * @param {string} raw
 * @returns {ParsedPracticeExercise[]}
 */
export function parsePracticeExercises(raw) {
  return new ResponseParser().parsePracticeExercises(raw);
}

/**
 * Standalone: parseLearningPath
 * @param {string} raw
 * @returns {ParsedLearningPath}
 */
export function parseLearningPath(raw) {
  return new ResponseParser().parseLearningPath(raw);
}

/**
 * Standalone: parseComplexityScore
 * @param {string} raw
 * @returns {number}
 */
export function parseComplexityScore(raw) {
  return new ResponseParser().parseComplexityScore(raw);
}

/**
 * Standalone: extractJsonFromResponse
 * @param {string} raw
 * @returns {string|null}
 */
export function extractJsonFromResponse(raw) {
  return new ResponseParser().extractJsonFromResponse(raw);
}
