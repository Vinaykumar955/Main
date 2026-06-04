import * as vscode from 'vscode';
import * as crypto from 'crypto';
import { ExplanationResult, DepthLevel, ExplanationHistoryEntry, CodeSmell } from '../utils/types';
import { Logger } from '../services/Logger';
import { OpenRouterClient } from '../services/OpenRouterClient';
import { PromptBuilder } from '../services/PromptBuilder';
import { ResponseParser } from '../services/ResponseParser';
import { ExplanationCache } from '../services/ExplanationCache';
import { CircuitBreaker } from '../services/CircuitBreaker';
import { RetryWithBackoff } from '../services/RetryWithBackoff';
import { ErrorHandler } from '../services/ErrorHandler';
import { DecorationManager } from './DecorationManager';
import { MODELS, DEFAULT_CHUNK_SIZE } from '../utils/constants';

export class ExplanationManager implements vscode.Disposable {
  private logger: Logger;
  private openRouterClient: OpenRouterClient;
  private promptBuilder: PromptBuilder;
  private responseParser: ResponseParser;
  private cache: ExplanationCache;
  private circuitBreaker: CircuitBreaker;
  private retryWithBackoff: RetryWithBackoff;
  private errorHandler: ErrorHandler;
  private decorationManager: DecorationManager;

  private history: ExplanationHistoryEntry[] = [];

  constructor(
    openRouterClient: OpenRouterClient,
    promptBuilder: PromptBuilder,
    responseParser: ResponseParser,
    cache: ExplanationCache,
    circuitBreaker: CircuitBreaker,
    retryWithBackoff: RetryWithBackoff,
    decorationManager: DecorationManager,
    errorHandler: ErrorHandler
  ) {
    this.logger = Logger.getInstance();
    this.openRouterClient = openRouterClient;
    this.promptBuilder = promptBuilder;
    this.responseParser = responseParser;
    this.cache = cache;
    this.circuitBreaker = circuitBreaker;
    this.retryWithBackoff = retryWithBackoff;
    this.errorHandler = errorHandler;
    this.decorationManager = decorationManager;
  }

  async explainFile(): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showWarningMessage('No active editor found.');
      return;
    }

    const text = editor.document.getText();
    const language = editor.document.languageId;
    const filePath = editor.document.uri.fsPath;

    if (!text.trim()) {
      vscode.window.showWarningMessage('The active file is empty.');
      return;
    }

    const config = vscode.workspace.getConfiguration('codelens-ai');
    const depth = config.get<DepthLevel>('depth', 'how');

    const chunks = this.chunkCode(text, DEFAULT_CHUNK_SIZE);
    let lineOffset = 0;

    await vscode.window.withProgress({
      location: vscode.ProgressLocation.Notification,
      title: 'CodeLens AI: Analyzing file...',
      cancellable: true,
    }, async (progress, token) => {
      for (let i = 0; i < chunks.length; i++) {
        if (token.isCancellationRequested) {
          this.logger.info('File explanation cancelled by user');
          return;
        }

        const chunk = chunks[i];
        const lineStart = lineOffset + 1;
        const lineEnd = lineOffset + chunk.split('\n').length;

        progress.report({ message: `Chunk ${i + 1}/${chunks.length} (lines ${lineStart}-${lineEnd})` });

        try {
          const result = await this.explainCode(chunk, filePath, language, depth, lineStart, lineEnd);
          if (result) {
            this.decorateResult(result, lineOffset);
            this.addToHistory(chunk, result, filePath, language, depth);
          }
        } catch (error) {
          this.errorHandler.handleError(error, `explainFile chunk ${i + 1}`);
        }

        lineOffset += chunk.split('\n').length;
      }
    });
  }

  async explainSelection(): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showWarningMessage('No active editor found.');
      return;
    }

    const selection = editor.selection;
    if (selection.isEmpty) {
      vscode.window.showWarningMessage('No code selected. Select some code to explain.');
      return;
    }

    const document = editor.document;
    const language = document.languageId;
    const filePath = document.uri.fsPath;

    const config = vscode.workspace.getConfiguration('codelens-ai');
    const depth = config.get<DepthLevel>('depth', 'how');

    const startLine = Math.max(0, selection.start.line - 5);
    const endLine = Math.min(document.lineCount - 1, selection.end.line + 5);

    let text = '';
    for (let i = startLine; i <= endLine; i++) {
      const prefix = i >= selection.start.line && i <= selection.end.line ? '> ' : '  ';
      text += prefix + document.lineAt(i).text + '\n';
    }

    try {
      const result = await this.explainCode(text, filePath, language, depth, startLine + 1, endLine + 1);
      if (result) {
        this.decorateResult(result, startLine);
        this.addToHistory(text, result, filePath, language, depth);
      }
    } catch (error) {
      this.errorHandler.handleError(error, 'explainSelection');
    }
  }

  async explainError(): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;

    const diagnostics = vscode.languages.getDiagnostics(editor.document.uri);
    const errors = diagnostics.filter(d => d.severity === vscode.DiagnosticSeverity.Error);

    if (errors.length === 0) {
      vscode.window.showInformationMessage('No errors found in the current file.');
      return;
    }

    const error = errors[0];
    const line = editor.document.lineAt(error.range.start.line);
    const code = line.text;
    const errorMessage = error.message;

    try {
      const messages = [
        { role: 'system' as const, content: this.promptBuilder.buildSystemPrompt(editor.document.languageId, 'how' as DepthLevel) },
        { role: 'user' as const, content: this.promptBuilder.buildErrorExplanationPrompt(errorMessage, code) },
      ];

      const response = await this.sendWithFallback(messages);

      const result: ExplanationResult = {
        lines: code,
        explanation: response,
        complexity: this.responseParser.parseComplexityScore(response),
        smells: this.responseParser.parseCodeSmells(response, code),
        concepts: this.responseParser.parseConcepts(response),
      };

      this.decorateResult(result, error.range.start.line);

      const entry: ExplanationHistoryEntry = {
        id: `err-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        timestamp: Date.now(),
        filePath: editor.document.uri.fsPath,
        language: editor.document.languageId,
        lines: code,
        explanation: response,
        depth: 'how',
        model: MODELS.PRIMARY,
      };
      this.history.push(entry);
    } catch (error) {
      this.errorHandler.handleError(error, 'explainError');
    }
  }

  async exportMarkdown(): Promise<void> {
    if (this.history.length === 0) {
      vscode.window.showInformationMessage('No explanations to export.');
      return;
    }

    const lines: string[] = [];
    lines.push('# CodeLens AI - Explanation History\n');
    lines.push(`Generated on: ${new Date().toLocaleString()}\n`);
    lines.push(`Total explanations: ${this.history.length}\n`);
    lines.push('---\n');

    for (const entry of this.history) {
      lines.push(`## ${entry.filePath} (lines ${entry.lines.replace(/\n/g, ' ').slice(0, 80)}...)\n`);
      lines.push(`- **Language:** ${entry.language}`);
      lines.push(`- **Depth:** ${entry.depth}`);
      lines.push(`- **Model:** ${entry.model}`);
      lines.push(`- **Time:** ${new Date(entry.timestamp).toLocaleString()}\n`);
      lines.push('### Code\n');
      lines.push('```\n' + entry.lines + '\n```\n');
      lines.push('### Explanation\n');
      lines.push(entry.explanation + '\n');
      lines.push('---\n');
    }

    const doc = await vscode.workspace.openTextDocument({
      content: lines.join('\n'),
      language: 'markdown',
    });

    await vscode.window.showTextDocument(doc);
    this.logger.info('Explanations exported to markdown');
  }

  getHistory(): ExplanationHistoryEntry[] {
    return [...this.history];
  }

  getHistoryByDate(date: Date): ExplanationHistoryEntry[] {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return this.history.filter(
      entry => entry.timestamp >= startOfDay.getTime() && entry.timestamp <= endOfDay.getTime()
    );
  }

  clearHistory(): void {
    this.history = [];
    this.logger.info('Explanation history cleared');
  }

  private async explainCode(
    code: string,
    filePath: string,
    language: string,
    depth: DepthLevel,
    lineStart: number,
    lineEnd: number
  ): Promise<ExplanationResult | null> {
    const cacheKey = this.cacheKey(code, language, depth);
    const cached = this.cache.get(cacheKey);
    if (cached) {
      this.logger.debug('Cache hit for explanation', { key: cacheKey });
      const parsed = this.responseParser.parseExplanation(cached.data);
      const smells = this.responseParser.parseCodeSmells(cached.data, code);
      const concepts = this.responseParser.parseConcepts(cached.data);
      const analogies = this.responseParser.parseAnalogies(cached.data);
      return {
        lines: code,
        explanation: parsed.explanation,
        complexity: parsed.complexity,
        smells,
        concepts,
        analogies,
      };
    }

    try {
      const messages = [
        { role: 'system' as const, content: this.promptBuilder.buildSystemPrompt(language, depth) },
        { role: 'user' as const, content: this.promptBuilder.buildExplanationPrompt(code, filePath, lineStart, lineEnd) },
      ];

      const response = await this.sendWithFallback(messages);

      this.cache.set(cacheKey, {
        key: cacheKey,
        data: response,
        timestamp: Date.now(),
        model: MODELS.PRIMARY,
        language,
      });

      const parsed = this.responseParser.parseExplanation(response);
      const smells = this.responseParser.parseCodeSmells(response, code);
      const concepts = this.responseParser.parseConcepts(response);
      const analogies = this.responseParser.parseAnalogies(response);

      return {
        lines: code,
        explanation: parsed.explanation,
        complexity: parsed.complexity,
        smells,
        concepts,
        analogies,
      };
    } catch (error) {
      this.errorHandler.handleError(error, 'explainCode');
      return null;
    }
  }

  private decorateResult(result: ExplanationResult, lineStart: number): void {
    if (!result) return;

    for (const smell of result.smells) {
      const adjustedLine = smell.line > 0 ? smell.line + lineStart : lineStart;
      this.decorationManager.showSmell(adjustedLine, smell);
    }

    if (result.complexity > 0) {
      const lines = result.lines.split('\n').length;
      for (let i = 0; i < lines; i++) {
        this.decorationManager.showComplexity(lineStart + i, result.complexity);
      }
    }

    if (result.analogies && result.analogies.length > 0) {
      for (const analogy of result.analogies) {
        this.decorationManager.showVocabulary(lineStart, analogy.concept, analogy.analogy);
      }
    }
  }

  private addToHistory(
    code: string,
    result: ExplanationResult,
    filePath: string,
    language: string,
    depth: DepthLevel
  ): void {
    const entry: ExplanationHistoryEntry = {
      id: `exp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      timestamp: Date.now(),
      filePath,
      language,
      lines: code.slice(0, 200),
      explanation: result.explanation.slice(0, 500),
      depth,
      model: MODELS.PRIMARY,
    };
    this.history.push(entry);
  }

  private chunkCode(text: string, size: number): string[] {
    const lines = text.split('\n');
    const chunks: string[] = [];
    for (let i = 0; i < lines.length; i += size) {
      chunks.push(lines.slice(i, i + size).join('\n'));
    }
    return chunks;
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

  private cacheKey(code: string, language: string, depth: DepthLevel): string {
    const hash = crypto.createHash('md5').update(`${code}|${language}|${depth}`).digest('hex');
    return hash;
  }

  dispose(): void {
    this.cache.clear();
    this.history = [];
  }
}
