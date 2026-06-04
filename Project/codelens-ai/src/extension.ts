import * as vscode from 'vscode';
import { Logger } from './services/Logger';
import { OpenRouterClient } from './services/OpenRouterClient';
import { PromptBuilder } from './services/PromptBuilder';
import { ResponseParser } from './services/ResponseParser';
import { ExplanationCache } from './services/ExplanationCache';
import { CircuitBreaker } from './services/CircuitBreaker';
import { RetryWithBackoff } from './services/RetryWithBackoff';
import { ErrorHandler } from './services/ErrorHandler';
import { DecorationManager } from './managers/DecorationManager';
import { ExplanationManager } from './managers/ExplanationManager';
import { SidebarManager } from './managers/SidebarManager';
import { LearningManager } from './managers/LearningManager';
import { SidebarProvider } from './providers/SidebarProvider';
import { DiagnosticProvider } from './providers/DiagnosticProvider';
import { showSettingsUI, showInformationWithAction } from './commands/index';
import { DEBOUNCE_DELAY } from './utils/constants';

let logger: Logger;
let decorationManager: DecorationManager;
let explanationManager: ExplanationManager;
let sidebarManager: SidebarManager;
let learningManager: LearningManager;
let sidebarProvider: SidebarProvider;
let diagnosticProvider: DiagnosticProvider;

export async function activate(context: vscode.ExtensionContext): Promise<void> {
  logger = Logger.getInstance();

  const openRouterClient = new OpenRouterClient();
  const promptBuilder = new PromptBuilder();
  const responseParser = new ResponseParser();
  const explanationCache = new ExplanationCache();
  const circuitBreaker = new CircuitBreaker();
  const retryWithBackoff = new RetryWithBackoff();
  const errorHandler = new ErrorHandler();

  decorationManager = new DecorationManager();
  explanationManager = new ExplanationManager(
    openRouterClient,
    promptBuilder,
    responseParser,
    explanationCache,
    circuitBreaker,
    retryWithBackoff,
    decorationManager,
    errorHandler
  );
  sidebarManager = new SidebarManager(context);
  learningManager = new LearningManager(context);
  sidebarProvider = new SidebarProvider(explanationManager, context.extensionUri);
  diagnosticProvider = new DiagnosticProvider();

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(SidebarProvider.viewType, sidebarProvider, {
      webviewOptions: { retainContextWhenHidden: true },
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('codelens-ai.explainFile', () => {
      explanationManager.explainFile();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('codelens-ai.explainSelection', () => {
      explanationManager.explainSelection();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('codelens-ai.toggleInline', () => {
      decorationManager.toggleAll();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('codelens-ai.quizMe', () => {
      learningManager.generateQuiz();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('codelens-ai.exportMarkdown', () => {
      explanationManager.exportMarkdown();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('codelens-ai.bookmarkLine', () => {
      learningManager.bookmarkLine();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('codelens-ai.clearHistory', () => {
      explanationManager.clearHistory();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('codelens-ai.showHistory', () => {
      sidebarManager.showHistory();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('codelens-ai.openSettings', () => {
      showSettingsUI();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('codelens-ai.generatePractice', () => {
      learningManager.generatePractice();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('codelens-ai.explainError', () => {
      explanationManager.explainError();
    })
  );

  let debounceTimer: NodeJS.Timeout | undefined;
  context.subscriptions.push(
    vscode.window.onDidChangeTextEditorSelection((event) => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      debounceTimer = setTimeout(() => {
        decorationManager.onSelectionChange(event);
      }, DEBOUNCE_DELAY);
    })
  );

  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument((event) => {
      decorationManager.onTextChange(event);
    })
  );

  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      decorationManager.onActiveEditorChange(editor);
    })
  );

  context.subscriptions.push(decorationManager);
  context.subscriptions.push(explanationManager);
  context.subscriptions.push(sidebarManager);
  context.subscriptions.push(learningManager);
  context.subscriptions.push(diagnosticProvider);

  const hasApiKey = await checkApiKey();
  if (!hasApiKey) {
    const configure = 'Configure';
    const result = await vscode.window.showWarningMessage(
      'CodeLens AI requires an OpenRouter API key. Please configure it in settings.',
      configure
    );
    if (result === configure) {
      showSettingsUI();
    }
    return;
  }

  logger.info('CodeLens AI activated');
}

export function deactivate(): void {
  if (decorationManager) decorationManager.dispose();
  if (explanationManager) explanationManager.dispose();
  if (sidebarManager) sidebarManager.dispose();
  if (learningManager) learningManager.dispose();
  if (sidebarProvider) sidebarProvider.dispose();
  if (diagnosticProvider) diagnosticProvider.dispose();
  if (logger) logger.info('CodeLens AI deactivated');
}

async function checkApiKey(): Promise<boolean> {
  try {
    const config = vscode.workspace.getConfiguration('codelens-ai');
    const key = config.get<string>('apiKey', '');
    if (key) return true;

    const ext = vscode.extensions.getExtension('codelens-ai.codelens-ai');
    if (ext && ext.secrets) {
      const secretKey = await ext.secrets.get('codelens-ai.openrouter-api-key');
      if (secretKey) return true;
    }

    return false;
  } catch {
    return false;
  }
}
