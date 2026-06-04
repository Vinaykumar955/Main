import * as vscode from 'vscode';
import { CodeSmell } from '../utils/types';
import { SMELL_ICONS } from '../utils/constants';

const DIAGNOSTIC_COLLECTION_NAME = 'codelens-ai-smells';

export class DiagnosticProvider implements vscode.Disposable {
  private collection: vscode.DiagnosticCollection;
  private disposables: vscode.Disposable[] = [];

  constructor() {
    this.collection = vscode.languages.createDiagnosticCollection(DIAGNOSTIC_COLLECTION_NAME);
    this.disposables.push(this.collection);

    const openListener = vscode.workspace.onDidOpenTextDocument(doc => {
      this.analyzeDocument(doc);
    });
    const saveListener = vscode.workspace.onDidSaveTextDocument(doc => {
      this.analyzeDocument(doc);
    });
    const changeListener = vscode.workspace.onDidChangeTextDocument(event => {
      if (event.contentChanges.length > 0) {
        this.analyzeDocument(event.document);
      }
    });

    this.disposables.push(openListener, saveListener, changeListener);

    vscode.workspace.textDocuments.forEach(doc => this.analyzeDocument(doc));
  }

  provideDiagnostics(document: vscode.TextDocument, collection: vscode.DiagnosticCollection): void {
    const smells = this.detectSmells(document);
    const diagnostics = smells.map(smell => this.createDiagnostic(document, smell));
    collection.set(document.uri, diagnostics);
  }

  private analyzeDocument(document: vscode.TextDocument): void {
    if (document.uri.scheme !== 'file' && document.uri.scheme !== 'untitled') {
      return;
    }

    const smells = this.detectSmells(document);
    const diagnostics = smells.map(smell => this.createDiagnostic(document, smell));
    this.collection.set(document.uri, diagnostics);
  }

  private detectSmells(document: vscode.TextDocument): CodeSmell[] {
    const smells: CodeSmell[] = [];
    const text = document.getText();
    const lines = text.split('\n');

    if (lines.length > 50) {
      smells.push({
        line: 1,
        type: 'long-function',
        message: `File has ${lines.length} lines. Consider breaking it into smaller modules or functions.`,
        severity: 'warning',
      });
    }

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNum = i + 1;

      const magicNumberPattern = /(?<![\w.])\b\d{4,}\b(?![\w.])/;
      if (magicNumberPattern.test(line) && !line.trim().startsWith('//') && !line.trim().startsWith('/*') && !line.trim().startsWith('*')) {
        const match = line.match(magicNumberPattern);
        if (match) {
          smells.push({
            line: lineNum,
            type: 'magic-number',
            message: `Magic number '${match[0]}' found. Consider extracting it to a named constant.`,
            severity: 'info',
          });
        }
      }

      if (line.includes('||') || line.includes('&&')) {
        const conditions = (line.match(/(\|\||&&)/g) || []).length;
        if (conditions >= 3) {
          smells.push({
            line: lineNum,
            type: 'complex-condition',
            message: `Complex condition detected with ${conditions + 1} clauses. Consider simplifying.`,
            severity: 'error',
          });
        }
      }

      if ((line.match(/\{/g) || []).length > 2 && (line.match(/\}/g) || []).length > 2) {
        smells.push({
          line: lineNum,
          type: 'deep-nesting',
          message: 'Deep nesting detected on this line. Consider refactoring.',
          severity: 'warning',
        });
      }

      const shortNamePattern = /\b([a-z]{1,2})\s*(?=[:=]|,|\))/g;
      let nameMatch: RegExpExecArray | null;
      while ((nameMatch = shortNamePattern.exec(line)) !== null) {
        if (
          !line.trim().startsWith('//') &&
          !line.trim().startsWith('/*') &&
          nameMatch[1].length <= 2 &&
          !['i', 'j', 'k', 'id', 'ex', 'to', 'by', 'at', 'on', 'in', 'of', 'is', 'it', 'as', 'ok', 'no'].includes(nameMatch[1])
        ) {
          smells.push({
            line: lineNum,
            type: 'unclear-name',
            message: `Short variable name '${nameMatch[1]}' found. Consider a more descriptive name.`,
            severity: 'info',
          });
          break;
        }
      }
    }

    return smells;
  }

  private createDiagnostic(document: vscode.TextDocument, smell: CodeSmell): vscode.Diagnostic {
    const range = new vscode.Range(
      new vscode.Position(smell.line - 1, 0),
      new vscode.Position(smell.line - 1, document.lineAt(smell.line - 1).text.length)
    );

    const severityMap: Record<string, vscode.DiagnosticSeverity> = {
      info: vscode.DiagnosticSeverity.Information,
      warning: vscode.DiagnosticSeverity.Warning,
      error: vscode.DiagnosticSeverity.Error,
    };

    const diagnostic = new vscode.Diagnostic(
      range,
      `${SMELL_ICONS[smell.type] || '$(info)'} ${smell.message}`,
      severityMap[smell.severity] || vscode.DiagnosticSeverity.Warning
    );

    diagnostic.source = 'CodeLens AI';
    diagnostic.code = smell.type;
    diagnostic.tags = [vscode.DiagnosticTag.Unnecessary];

    diagnostic.relatedInformation = [
      new vscode.DiagnosticRelatedInformation(
        new vscode.Location(document.uri, range),
        'Explain this code smell'
      ),
    ];

    return diagnostic;
  }

  getCollection(): vscode.DiagnosticCollection {
    return this.collection;
  }

  dispose(): void {
    this.collection.clear();
    this.collection.dispose();
    for (const d of this.disposables) {
      d.dispose();
    }
    this.disposables = [];
  }
}
