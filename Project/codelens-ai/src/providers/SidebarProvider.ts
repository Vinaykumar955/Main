import * as vscode from 'vscode';
import { ExplanationManager } from '../managers/ExplanationManager';
import { Message } from '../utils/types';

export class SidebarProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'codelens-ai.sidebarPanel';

  private _view?: vscode.WebviewView;
  private extensionUri: vscode.Uri;

  constructor(
    private readonly explanationManager: ExplanationManager,
    extensionUri: vscode.Uri
  ) {
    this.extensionUri = extensionUri;
  }

  resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ): void {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this.extensionUri],
    };

    webviewView.webview.html = this.getHtmlForWebview(webviewView.webview);

    webviewView.webview.onDidReceiveMessage(
      (message: Message) => {
        this.handleMessage(message);
      }
    );

    this.sendInitialState();
  }

  private async sendInitialState(): Promise<void> {
    const config = vscode.workspace.getConfiguration('codelens-ai');
    const settings = {
      depth: config.get<string>('depth', 'how'),
      showInline: config.get<boolean>('enableInline', true),
      autoExplain: config.get<boolean>('autoExplain', false),
      enableComplexity: config.get<boolean>('enableHeatmap', true),
      enableSmells: config.get<boolean>('enableSmells', true),
    };

    const history = this.explanationManager.getHistory();

    this.postMessage({
      type: 'initialState',
      id: 'init',
      payload: { settings, historyCount: history.length },
    });
  }

  private async handleMessage(message: Message): Promise<void> {
    try {
      switch (message.type) {
        case 'getHistory': {
          const history = this.explanationManager.getHistory();
          this.postMessage({ type: 'history', id: message.id, payload: history, correlationId: message.id });
          break;
        }
        case 'getStats': {
          const stats = this.explanationManager.getHistory();
          this.postMessage({
            type: 'stats',
            id: message.id,
            payload: { totalExplanations: stats.length, history: stats },
            correlationId: message.id,
          });
          break;
        }
        case 'exportMarkdown': {
          await this.explanationManager.exportMarkdown();
          break;
        }
        case 'changeDepth': {
          const config = vscode.workspace.getConfiguration('codelens-ai');
          await config.update('depth', message.payload?.depth, vscode.ConfigurationTarget.Global);
          break;
        }
        case 'toggleSetting': {
          if (message.payload?.key) {
            const config = vscode.workspace.getConfiguration('codelens-ai');
            const current = config.get<boolean>(message.payload.key, false);
            await config.update(message.payload.key, !current, vscode.ConfigurationTarget.Global);
          }
          break;
        }
        case 'bookmarkLine': {
          vscode.commands.executeCommand('codelens-ai.bookmarkLine');
          break;
        }
        case 'getExplanation': {
          vscode.commands.executeCommand('codelens-ai.explainSelection');
          break;
        }
        case 'clearHistory': {
          this.explanationManager.clearHistory();
          this.postMessage({ type: 'historyCleared', id: message.id, correlationId: message.id });
          break;
        }
        case 'generateQuiz': {
          vscode.commands.executeCommand('codelens-ai.quizMe');
          break;
        }
        case 'getBookmarks': {
          const state = this.explanationManager.getHistory();
          this.postMessage({ type: 'bookmarks', id: message.id, payload: state, correlationId: message.id });
          break;
        }
        default:
          break;
      }
    } catch (error) {
      const err = error as Error;
      this.postMessage({ type: 'error', id: message.id, payload: { message: err.message }, correlationId: message.id });
    }
  }

  postMessage(message: Message): void {
    if (this._view) {
      this._view.webview.postMessage(message);
    }
  }

  private getHtmlForWebview(webview: vscode.Webview): string {
    const htmlPath = vscode.Uri.joinPath(this.extensionUri, 'src', 'webview', 'index.html');
    try {
      const fs = require('fs');
      let html = fs.readFileSync(htmlPath.fsPath, 'utf8');

      const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this.extensionUri, 'src', 'webview', 'app.js'));
      const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(this.extensionUri, 'src', 'webview', 'style.css'));

      html = html
        .replace(/{{main_js}}/g, scriptUri.toString())
        .replace(/{{style_css}}/g, styleUri.toString());

      const nonce = this.getNonce();
      html = html.replace(/{{nonce}}/g, nonce);

      return html;
    } catch {
      return this.getFallbackHtml(webview);
    }
  }

  private getFallbackHtml(webview: vscode.Webview): string {
    const nonce = this.getNonce();
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'nonce-${nonce}';">
  <title>CodeLens AI</title>
</head>
<body>
  <div id="root">
    <h2>CodeLens AI</h2>
    <p>Loading...</p>
  </div>
  <script nonce="${nonce}">
    const vscode = acquireVsCodeApi();
    window.addEventListener('message', event => {
      const message = event.data;
      const root = document.getElementById('root');
      if (message.type === 'initialState') {
        const html = '<h2>CodeLens AI</h2>' +
          '<p>Explanations: ' + (message.payload.historyCount || 0) + '</p>' +
          '<div style="margin-top:16px">' +
          '<button onclick="vscode.postMessage({type:\'getHistory\',id:\'h1\'})">View History</button><br><br>' +
          '<button onclick="vscode.postMessage({type:\'generateQuiz\',id:\'q1\'})">Generate Quiz</button><br><br>' +
          '<button onclick="vscode.postMessage({type:\'exportMarkdown\',id:\'e1\'})">Export Markdown</button><br><br>' +
          '<button onclick="vscode.postMessage({type:\'getBookmarks\',id:\'b1\'})">Bookmarks</button>' +
          '</div>';
        root.innerHTML = html;
      }
    });
    vscode.postMessage({ type: 'ready', id: 'ready' });
  </script>
</body>
</html>`;
  }

  private getNonce(): string {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 64; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }

  dispose(): void {
    this._view = undefined;
  }
}
