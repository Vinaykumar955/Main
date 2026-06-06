import * as vscode from 'vscode';
import { QuizQuestion, SpacedRepetitionItem, LearnerStats, DepthLevel } from '../utils/types';
import { Logger } from '../services/Logger';
import { OpenRouterClient } from '../services/OpenRouterClient';
import { PromptBuilder } from '../services/PromptBuilder';
import { ResponseParser } from '../services/ResponseParser';
import { RetryWithBackoff } from '../services/RetryWithBackoff';
import { CircuitBreaker } from '../services/CircuitBreaker';
import { SpacedRepetition } from '../services/SpacedRepetition';
import { Glossary } from '../services/Glossary';
import { ErrorHandler } from '../services/ErrorHandler';
import { MODELS } from '../utils/constants';

const STORAGE_KEYS = {
  history: 'codelens-ai.learning.history',
  stats: 'codelens-ai.learning.stats',
  spacedRepetition: 'codelens-ai.learning.spaced-repetition',
  bookmarks: 'codelens-ai.learning.bookmarks',
  settings: 'codelens-ai.learning.settings',
};

interface Bookmark {
  id: string;
  line: number;
  filePath: string;
  code: string;
  note: string;
  timestamp: number;
}

interface LearningSettings {
  dailyGoal: number;
  reviewLimit: number;
  enableSpacedRepetition: boolean;
}

export class LearningManager implements vscode.Disposable {
  private context: vscode.ExtensionContext;
  private openRouterClient: OpenRouterClient;
  private promptBuilder: PromptBuilder;
  private responseParser: ResponseParser;
  private retryWithBackoff: RetryWithBackoff;
  private circuitBreaker: CircuitBreaker;
  private errorHandler: ErrorHandler;
  private spacedRepetition: SpacedRepetition;
  private glossary: Glossary;
  private logger: Logger;

  private _history: QuizQuestion[] = [];
  private _stats: LearnerStats;
  private _spacedRepetitionItems: SpacedRepetitionItem[] = [];
  private _bookmarks: Bookmark[] = [];
  private _settings: LearningSettings;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
    this.openRouterClient = new OpenRouterClient();
    this.promptBuilder = new PromptBuilder();
    this.responseParser = new ResponseParser();
    this.retryWithBackoff = new RetryWithBackoff();
    this.circuitBreaker = new CircuitBreaker();
    this.errorHandler = new ErrorHandler();
    this.spacedRepetition = new SpacedRepetition();
    this.glossary = new Glossary();
    this.logger = Logger.getInstance();

    this._stats = this.getDefaultStats();
    this._settings = {
      dailyGoal: 5,
      reviewLimit: 10,
      enableSpacedRepetition: true,
    };

    this.loadData();
  }

  private getDefaultStats(): LearnerStats {
    return {
      totalLinesExplained: 0,
      totalConceptsLearned: 0,
      quizScore: 0,
      streakDays: 0,
      lastActive: 0,
      topicsMastered: [],
      topicsInProgress: [],
      totalReviews: 0,
      averageDifficulty: 0,
    };
  }

  async generateQuiz(): Promise<QuizQuestion | undefined> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showWarningMessage('Open a file to generate a quiz.');
      return undefined;
    }

    const code = editor.document.getText();
    if (!code.trim()) {
      vscode.window.showWarningMessage('The active file is empty.');
      return undefined;
    }

    try {
      const messages = [
        { role: 'system' as const, content: this.promptBuilder.buildSystemPrompt(editor.document.languageId, 'how' as DepthLevel, { quiz: true }) },
        { role: 'user' as const, content: this.promptBuilder.buildQuizPrompt(code, '') },
      ];

      const response = await this.sendWithFallback(messages);
      const quiz = this.responseParser.parseQuizQuestion(response);
      this._history.push(quiz);
      this.saveData();
      return quiz;
    } catch (error) {
      this.errorHandler.handleError(error, 'generateQuiz');
      return undefined;
    }
  }

  async evaluateQuizAnswer(questionId: string, answer: string): Promise<{ isCorrect: boolean; explanation: string } | undefined> {
    const question = this._history.find(q => q.id === questionId);
    if (!question) {
      vscode.window.showWarningMessage('Quiz question not found.');
      return undefined;
    }

    try {
      const prompt = [
        { role: 'system' as const, content: 'You are a programming quiz evaluator. Evaluate the answer and provide feedback.' },
        { role: 'user' as const, content: `Question: ${question.question}\nCode: ${question.code}\nCorrect answer: ${question.correctAnswer}\nUser's answer: ${answer}\nIs the user correct? Provide a brief explanation.` },
      ];

      const response = await this.sendWithFallback(prompt);
      const evaluation = this.responseParser.parseQuizEvaluation(response);

      question.userAnswer = answer;
      question.isCorrect = evaluation.isCorrect;
      this.saveData();

      if (evaluation.isCorrect && question.concept) {
        this.recordReview(question.concept, 4);
      }

      return evaluation;
    } catch (error) {
      this.errorHandler.handleError(error, 'evaluateQuizAnswer');
      return undefined;
    }
  }

  async bookmarkLine(): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showWarningMessage('No active editor.');
      return;
    }

    const line = editor.selection.active.line;
    const code = editor.document.lineAt(line).text;
    const filePath = editor.document.uri.fsPath;

    const note = await vscode.window.showInputBox({
      prompt: 'Add a note for this bookmark (optional)',
      placeHolder: 'Why are you bookmarking this line?',
    });

    const bookmark: Bookmark = {
      id: `bm-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      line: line + 1,
      filePath,
      code: code.trim(),
      note: note || '',
      timestamp: Date.now(),
    };

    this._bookmarks.push(bookmark);
    this.saveData();
    this.logger.info('Bookmark added', { line: bookmark.line, file: bookmark.filePath });
    vscode.window.showInformationMessage(`Bookmarked line ${line + 1}`);
  }

  async generatePractice(): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showWarningMessage('No active editor.');
      return;
    }

    const code = editor.document.getText();
    if (!code.trim()) {
      vscode.window.showWarningMessage('The active file is empty.');
      return;
    }

    try {
      const messages = [
        { role: 'system' as const, content: this.promptBuilder.buildSystemPrompt(editor.document.languageId, 'how' as DepthLevel) },
        { role: 'user' as const, content: this.promptBuilder.buildPracticePrompt(code, 3) },
      ];

      const response = await this.sendWithFallback(messages);
      const exercises = this.responseParser.parsePracticeExercises(response);

      if (exercises.length === 0) {
        vscode.window.showInformationMessage('No practice exercises could be generated. Try again.');
        return;
      }

      const doc = await vscode.workspace.openTextDocument({
        content: exercises.map((ex, i) => {
          let text = `## Exercise ${i + 1}: ${ex.title}\n\n${ex.description}\n\n`;
          if (ex.starterCode) text += `### Starter Code\n\`\`\`\n${ex.starterCode}\n\`\`\`\n\n`;
          if (ex.expectedOutput) text += `### Expected Output\n\`\`\`\n${ex.expectedOutput}\n\`\`\`\n\n`;
          text += `### Solution\n\`\`\`\n${ex.solution}\n\`\`\`\n`;
          return text;
        }).join('\n---\n\n'),
        language: 'markdown',
      });
      await vscode.window.showTextDocument(doc);
    } catch (error) {
      this.errorHandler.handleError(error, 'generatePractice');
    }
  }

  recordReview(concept: string, quality: number): void {
    const existing = this._spacedRepetitionItems.find(i => i.concept === concept);
    if (existing) {
      const updated = this.spacedRepetition.calculateNextReview(existing, quality);
      const idx = this._spacedRepetitionItems.indexOf(existing);
      this._spacedRepetitionItems[idx] = updated;
    } else {
      const newItem: SpacedRepetitionItem = {
        id: `sr-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        concept,
        code: '',
        explanation: '',
        ease: 2.5,
        interval: 0,
        repetitions: 0,
        nextReview: Date.now(),
        lastReview: Date.now(),
      };
      const updated = this.spacedRepetition.calculateNextReview(newItem, quality);
      this._spacedRepetitionItems.push(updated);
    }

    this._stats.totalReviews++;
    this.saveData();
  }

  getDueReviews(): SpacedRepetitionItem[] {
    return this.spacedRepetition.getDueItems(this._spacedRepetitionItems);
  }

  getGlossaryDefinition(term: string): string | null {
    return this.glossary.getDefinition(term);
  }

  async getLearningPath(): Promise<{ topics: string[]; resources: string[]; prerequisites: string[] }> {
    try {
      const messages = [
        { role: 'system' as const, content: 'You are a learning path advisor for programming.' },
        { role: 'user' as const, content: this.promptBuilder.buildLearningPathPrompt(this._stats.topicsMastered, this._stats.topicsInProgress) },
      ];

      const response = await this.sendWithFallback(messages);
      return this.responseParser.parseLearningPath(response);
    } catch (error) {
      this.errorHandler.handleError(error, 'getLearningPath');
      return { topics: [], resources: [], prerequisites: [] };
    }
  }

  getLearnerStats(): LearnerStats {
    this.updateStreak();
    return { ...this._stats };
  }

  getBookmarks(): Bookmark[] {
    return [...this._bookmarks];
  }

  getQuizHistory(): QuizQuestion[] {
    return [...this._history];
  }

  private updateStreak(): void {
    const now = Date.now();
    const today = new Date(now).setHours(0, 0, 0, 0);
    const lastActive = new Date(this._stats.lastActive).setHours(0, 0, 0, 0);

    if (lastActive === 0) {
      this._stats.streakDays = 1;
    } else if (today === lastActive) {
    } else if (today - lastActive === 86400000) {
      this._stats.streakDays++;
    } else if (today > lastActive) {
      this._stats.streakDays = 1;
    }

    this._stats.lastActive = now;
    this.saveData();
  }

  private async sendWithFallback(messages: { role: string; content: string }[]): Promise<string> {
    if (this.circuitBreaker.isOpen()) {
      throw new Error('Circuit breaker is open. Please try again later.');
    }

    const models = [MODELS.PRIMARY, MODELS.FALLBACK_1, MODELS.FALLBACK_2, MODELS.FALLBACK_3];

    for (const model of models) {
      try {
        const result = await this.retryWithBackoff.execute(() =>
          this.openRouterClient.completion(messages, { model })
        );
        this.circuitBreaker.recordSuccess();
        return result;
      } catch (error) {
        this.circuitBreaker.recordFailure();
        if (model === models[models.length - 1]) {
          throw error;
        }
        this.logger.warn(`Model ${model} failed, trying fallback`, { error: (error as Error).message });
      }
    }

    throw new Error('All models failed');
  }

  private loadData(): void {
    try {
      const rawHistory = this.context.globalState.get<string>(STORAGE_KEYS.history);
      if (rawHistory) this._history = JSON.parse(rawHistory);

      const rawStats = this.context.globalState.get<string>(STORAGE_KEYS.stats);
      if (rawStats) this._stats = { ...this._stats, ...JSON.parse(rawStats) };

      const rawSR = this.context.globalState.get<string>(STORAGE_KEYS.spacedRepetition);
      if (rawSR) this._spacedRepetitionItems = JSON.parse(rawSR);

      const rawBookmarks = this.context.globalState.get<string>(STORAGE_KEYS.bookmarks);
      if (rawBookmarks) this._bookmarks = JSON.parse(rawBookmarks);

      const rawSettings = this.context.globalState.get<string>(STORAGE_KEYS.settings);
      if (rawSettings) this._settings = { ...this._settings, ...JSON.parse(rawSettings) };
    } catch (error) {
      this.logger.warn('Failed to load learning data', { error: (error as Error).message });
    }
  }

  private saveData(): void {
    try {
      this.context.globalState.update(STORAGE_KEYS.history, JSON.stringify(this._history));
      this.context.globalState.update(STORAGE_KEYS.stats, JSON.stringify(this._stats));
      this.context.globalState.update(STORAGE_KEYS.spacedRepetition, JSON.stringify(this._spacedRepetitionItems));
      this.context.globalState.update(STORAGE_KEYS.bookmarks, JSON.stringify(this._bookmarks));
      this.context.globalState.update(STORAGE_KEYS.settings, JSON.stringify(this._settings));
    } catch (error) {
      this.logger.warn('Failed to save learning data', { error: (error as Error).message });
    }
  }

  dispose(): void {
    this.saveData();
  }
}
