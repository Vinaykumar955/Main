import * as vscode from 'vscode';
import { Message } from '../utils/types';
import { Logger } from '../services/Logger';

export class SidebarManager implements vscode.Disposable {
  private logger: Logger;
  private context: vscode.ExtensionContext;

  constructor(context: vscode.ExtensionContext) {
    this.logger = Logger.getInstance();
    this.context = context;
  }

  showHistory(): void {
    vscode.commands.executeCommand('workbench.view.extension.codelens-ai');
    setTimeout(() => {
      this.focusSidebar();
    }, 500);
  }

  sendMessage(webview: vscode.Webview, message: Message): void {
    const msg: Message = {
      ...message,
      correlationId: message.id || '',
    };
    try {
      webview.postMessage(msg);
    } catch (error) {
      this.logger.warn('Failed to send message to sidebar webview', { error: (error as Error).message });
    }
  }

  handleMessage(message: Message): void {
    switch (message.type) {
      case 'getHistory':
        vscode.commands.executeCommand('codelens-ai.showHistory');
        break;
      case 'getStats':
        break;
      case 'exportMarkdown':
        vscode.commands.executeCommand('codelens-ai.exportMarkdown');
        break;
      case 'changeDepth':
        if (message.payload?.depth) {
          const config = vscode.workspace.getConfiguration('codelens-ai');
          config.update('depth', message.payload.depth, vscode.ConfigurationTarget.Global);
        }
        break;
      case 'toggleSetting':
        if (message.payload?.key) {
          const config = vscode.workspace.getConfiguration('codelens-ai');
          const current = config.get<boolean>(message.payload.key, true);
          config.update(message.payload.key, !current, vscode.ConfigurationTarget.Global);
        }
        break;
      case 'bookmarkLine':
        vscode.commands.executeCommand('codelens-ai.bookmarkLine');
        break;
      case 'getExplanation':
        vscode.commands.executeCommand('codelens-ai.explainSelection');
        break;
      case 'clearHistory':
        vscode.commands.executeCommand('codelens-ai.clearHistory');
        break;
      case 'generateQuiz':
        vscode.commands.executeCommand('codelens-ai.quizMe');
        break;
      case 'getBookmarks':
        break;
      default:
        this.logger.debug('Unknown sidebar message type', { type: message.type });
    }
  }

  private focusSidebar(): void {
    try {
      vscode.commands.executeCommand('workbench.view.extension.codelens-ai');
    } catch (error) {
      this.logger.warn('Could not focus sidebar', { error: (error as Error).message });
    }
  }

  dispose(): void {
  }
}
