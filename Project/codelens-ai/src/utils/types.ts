export interface Message {
  type: string;
  id: string;
  payload?: any;
  error?: string;
  correlationId?: string;
}

export type DepthLevel = 'what' | 'how' | 'why';

export interface ExplanationResult {
  lines: string;
  explanation: string;
  complexity: number;
  smells: CodeSmell[];
  concepts: string[];
  analogies?: ParsedAnalogy[];
}

export interface ParsedAnalogy {
  concept: string;
  analogy: string;
  explanation: string;
}

export interface CodeSmell {
  line: number;
  type: 'long-function' | 'magic-number' | 'unclear-name' | 'duplicate' | 'complex-condition' | 'deep-nesting';
  message: string;
  severity: 'info' | 'warning' | 'error';
}

export interface ExplanationHistoryEntry {
  id: string;
  timestamp: number;
  filePath: string;
  language: string;
  lines: string;
  explanation: string;
  depth: DepthLevel;
  model: string;
}

export interface QuizQuestion {
  id: string;
  code: string;
  question: string;
  correctAnswer: string;
  userAnswer?: string;
  isCorrect?: boolean;
  difficulty: number;
  concept: string;
}

export interface SpacedRepetitionItem {
  id: string;
  concept: string;
  code: string;
  explanation: string;
  ease: number;
  interval: number;
  repetitions: number;
  nextReview: number;
  lastReview: number;
}

export interface LearnerStats {
  totalLinesExplained: number;
  totalConceptsLearned: number;
  quizScore: number;
  streakDays: number;
  lastActive: number;
  topicsMastered: string[];
  topicsInProgress: string[];
  totalReviews: number;
  averageDifficulty: number;
}

export interface DecorationState {
  line: number;
  type: 'explanation' | 'complexity' | 'smell' | 'vocabulary';
  visible: boolean;
  data?: any;
}

export interface CacheEntry {
  key: string;
  data: string;
  timestamp: number;
  model: string;
  language: string;
}
