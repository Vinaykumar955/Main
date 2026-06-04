import { CodeSmell, QuizQuestion } from '../utils/types';

export interface ParsedExplanation {
  explanation: string;
  complexity: number;
  lineReferences: number[];
}

export interface ParsedQuizEvaluation {
  isCorrect: boolean;
  correctAnswer: string;
  explanation: string;
}

export interface ParsedAnalogy {
  concept: string;
  analogy: string;
  explanation: string;
}

export interface ParsedPracticeExercise {
  title: string;
  description: string;
  starterCode?: string;
  expectedOutput?: string;
  solution: string;
}

export interface ParsedLearningPath {
  topics: string[];
  resources: string[];
  prerequisites: string[];
}

export interface ParsedComplexityScore {
  score: number;
  factors: string[];
}

export class ResponseParser {
  parseExplanation(raw: string): ParsedExplanation {
    const clean = this.extractJsonFromResponse(raw) || raw;
    return {
      explanation: clean,
      complexity: this.parseComplexityScore(clean),
      lineReferences: this.extractLineNumbers(clean),
    };
  }

  parseCodeSmells(raw: string, code: string): CodeSmell[] {
    const json = this.extractJsonFromResponse(raw);
    if (json) {
      try {
        const parsed = JSON.parse(json);
        if (Array.isArray(parsed)) {
          return parsed
            .filter((s: any) => s && s.line !== undefined && s.type)
            .map((s: any) => ({
              line: typeof s.line === 'number' ? s.line : parseInt(s.line, 10) || 0,
              type: s.type as CodeSmell['type'],
              message: s.message || 'Unknown code smell',
              severity: (s.severity as CodeSmell['severity']) || 'warning',
            }))
            .filter((s: CodeSmell) =>
              ['long-function', 'magic-number', 'unclear-name', 'duplicate', 'complex-condition', 'deep-nesting'].includes(s.type)
            );
        }
      } catch {
      }
    }

    const smells: CodeSmell[] = [];
    const lines = code.split('\n');
    const mentionPattern = /(?:line|ln)\s*[:#]?\s*(\d+)/gi;
    let match: RegExpExecArray | null;
    const allMatches = new Set<number>();

    while ((match = mentionPattern.exec(raw)) !== null) {
      const lineNum = parseInt(match[1], 10);
      if (lineNum > 0 && lineNum <= lines.length) {
        allMatches.add(lineNum);
      }
    }

    allMatches.forEach(line => {
      const lineContent = lines[line - 1] || '';
      let type: CodeSmell['type'] = 'unclear-name';
      let severity: CodeSmell['severity'] = 'warning';

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

  parseConcepts(raw: string): string[] {
    const json = this.extractJsonFromResponse(raw);
    if (json) {
      try {
        const parsed = JSON.parse(json);
        if (Array.isArray(parsed) && parsed.every((i: any) => typeof i === 'string')) {
          return parsed;
        }
      } catch {
      }
    }

    const concepts = new Set<string>();
    const conceptPatterns = [
      /concept(?:s)?[\s:]+([^\n]+)/gi,
      /(?:key|main|core)\s+(?:concept|idea|topic)[\s:]+([^\n]+)/gi,
    ];

    for (const pattern of conceptPatterns) {
      let match: RegExpExecArray | null;
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
    let match: RegExpExecArray | null;
    while ((match = termPattern.exec(raw)) !== null) {
      const term = match[1].trim();
      if (term.length > 1 && term.split(/\s+/).length <= 4) {
        concepts.add(term);
      }
    }

    return Array.from(concepts).slice(0, 20);
  }

  parseQuizQuestion(raw: string): QuizQuestion {
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

  parseQuizEvaluation(raw: string): ParsedQuizEvaluation {
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

  parseAnalogies(raw: string): ParsedAnalogy[] {
    const json = this.extractJsonFromResponse(raw);
    if (json) {
      try {
        const parsed = JSON.parse(json);
        if (Array.isArray(parsed)) {
          return parsed
            .filter((a: any) => a && a.concept && a.analogy)
            .map((a: any) => ({
              concept: a.concept,
              analogy: a.analogy,
              explanation: a.explanation || '',
            }));
        }
      } catch {
      }
    }

    const analogies: ParsedAnalogy[] = [];
    const analogyPattern = /(?:analogy|like|similar to|imagine)[:\s]*([^\n]+?)(?:\.|$)/gi;
    let match: RegExpExecArray | null;

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

  parsePracticeExercises(raw: string): ParsedPracticeExercise[] {
    const json = this.extractJsonFromResponse(raw);
    if (json) {
      try {
        const parsed = JSON.parse(json);
        if (Array.isArray(parsed)) {
          return parsed
            .filter((e: any) => e && e.title && e.solution)
            .map((e: any) => ({
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

    const exercises: ParsedPracticeExercise[] = [];
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

  parseLearningPath(raw: string): ParsedLearningPath {
    const json = this.extractJsonFromResponse(raw);
    if (json) {
      try {
        const parsed = JSON.parse(json);
        if (parsed && parsed.topics) {
          return {
            topics: Array.isArray(parsed.topics) ? parsed.topics.filter((t: any) => typeof t === 'string') : [],
            resources: Array.isArray(parsed.resources) ? parsed.resources.filter((r: any) => typeof r === 'string') : [],
            prerequisites: Array.isArray(parsed.prerequisites) ? parsed.prerequisites.filter((p: any) => typeof p === 'string') : [],
          };
        }
      } catch {
      }
    }

    const topics: string[] = [];
    const resources: string[] = [];
    const prerequisites: string[] = [];

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

  parseComplexityScore(raw: string): number {
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

  extractJsonFromResponse(raw: string): string | null {
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

  private extractLineNumbers(text: string): number[] {
    const linePattern = /(?:line|ln)\s*[:#]?\s*(\d+)/gi;
    const lines = new Set<number>();
    let match: RegExpExecArray | null;
    while ((match = linePattern.exec(text)) !== null) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num) && num > 0 && num < 100000) {
        lines.add(num);
      }
    }
    return Array.from(lines).sort((a, b) => a - b);
  }
}
