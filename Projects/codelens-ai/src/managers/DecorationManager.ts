import * as vscode from 'vscode';
import { DecorationState, CodeSmell } from '../utils/types';
import { HEATMAP_COLORS, VIEWPORT_CULL_BUFFER } from '../utils/constants';
import { Logger } from '../services/Logger';

export class DecorationManager implements vscode.Disposable {
  private logger: Logger;
  private disposables: vscode.Disposable[] = [];

  private explanationDecoration: vscode.TextEditorDecorationType;
  private complexityDecoration: vscode.TextEditorDecorationType;
  private smellDecoration: vscode.TextEditorDecorationType;
  private vocabularyDecoration: vscode.TextEditorDecorationType;

  private decorations: Map<string, DecorationState[]> = new Map();
  private visible: boolean = true;
  private lineVisibility: Map<number, boolean> = new Map();

  constructor() {
    this.logger = Logger.getInstance();
    this.explanationDecoration = this.createDecoration(
      'explanation',
      {
        borderWidth: '0 0 0 3px',
        borderStyle: 'solid',
        borderColor: 'var(--vscode-editorInfo-border)',
        backgroundColor: 'var(--vscode-editorInfo-background)',
        isWholeLine: true,
        gutterIconPath: undefined,
        gutterIconSize: 'contain',
        overviewRulerColor: 'var(--vscode-editorInfo-border)',
        overviewRulerLane: vscode.OverviewRulerLane.Right,
      }
    );

    this.complexityDecoration = this.createDecoration(
      'complexity',
      {
        borderWidth: '0 0 0 3px',
        borderStyle: 'solid',
        borderColor: 'var(--vscode-editorWarning-border)',
        backgroundColor: 'transparent',
        isWholeLine: true,
        overviewRulerColor: 'var(--vscode-editorWarning-border)',
        overviewRulerLane: vscode.OverviewRulerLane.Center,
      }
    );

    this.smellDecoration = this.createDecoration(
      'smell',
      {
        borderWidth: '0 0 0 3px',
        borderStyle: 'solid',
        borderColor: 'var(--vscode-editorError-border)',
        backgroundColor: 'var(--vscode-editorError-background)',
        isWholeLine: true,
        gutterIconPath: undefined,
        gutterIconSize: 'contain',
        overviewRulerColor: 'var(--vscode-editorError-border)',
        overviewRulerLane: vscode.OverviewRulerLane.Left,
      }
    );

    this.vocabularyDecoration = this.createDecoration(
      'vocabulary',
      {
        borderWidth: '0 0 0 3px',
        borderStyle: 'dotted',
        borderColor: 'var(--vscode-editorLink-activeForeground)',
        backgroundColor: 'transparent',
        isWholeLine: false,
        overviewRulerColor: 'var(--vscode-editorLink-activeForeground)',
        overviewRulerLane: vscode.OverviewRulerLane.Right,
      }
    );
  }

  private createDecoration(
    key: string,
    options: vscode.DecorationRenderOptions
  ): vscode.TextEditorDecorationType {
    return vscode.window.createTextEditorDecorationType(options);
  }

  showExplanation(line: number, text: string): void {
    const editor = vscode.window.activeTextEditor;
    if (!editor || !this.visible) return;

    const hoverMessage = new vscode.MarkdownString();
    hoverMessage.appendMarkdown(text);
    hoverMessage.isTrusted = true;
    hoverMessage.supportHtml = true;

    const range = new vscode.Range(
      new vscode.Position(line, 0),
      new vscode.Position(line, editor.document.lineAt(line).text.length)
    );

    const decoration: vscode.DecorationOptions = {
      range,
      hoverMessage,
    };

    editor.setDecorations(this.explanationDecoration, [decoration]);
    this.recordState(line, 'explanation', { text });
  }

  showComplexity(line: number, score: number): void {
    const editor = vscode.window.activeTextEditor;
    if (!editor || !this.visible) return;

    let color: { border: string; background: string; badge: string };
    if (score <= 3) {
      color = HEATMAP_COLORS.low;
    } else if (score <= 6) {
      color = HEATMAP_COLORS.medium;
    } else {
      color = HEATMAP_COLORS.high;
    }

    const range = new vscode.Range(
      new vscode.Position(line, 0),
      new vscode.Position(line, editor.document.lineAt(line).text.length)
    );

    const hoverMsg = new vscode.MarkdownString();
    hoverMsg.appendMarkdown(`${color.badge} Complexity: ${score}/10`);
    hoverMsg.isTrusted = true;

    const decoration: vscode.DecorationOptions = {
      range,
      hoverMessage: hoverMsg,
    };

    editor.setDecorations(this.complexityDecoration, [decoration]);
    this.recordState(line, 'complexity', { score });
  }

  showSmell(line: number, smell: CodeSmell): void {
    const editor = vscode.window.activeTextEditor;
    if (!editor || !this.visible) return;

    const range = new vscode.Range(
      new vscode.Position(line, 0),
      new vscode.Position(line, editor.document.lineAt(line).text.length)
    );

    const hoverMessage = new vscode.MarkdownString();
    hoverMessage.appendMarkdown(`**${smell.type}**: ${smell.message}`);
    hoverMessage.isTrusted = true;

    const decoration: vscode.DecorationOptions = {
      range,
      hoverMessage,
    };

    editor.setDecorations(this.smellDecoration, [decoration]);
    this.recordState(line, 'smell', smell);
  }

  showVocabulary(line: number, term: string, definition: string): void {
    const editor = vscode.window.activeTextEditor;
    if (!editor || !this.visible) return;

    const range = new vscode.Range(
      new vscode.Position(line, 0),
      new vscode.Position(line, editor.document.lineAt(line).text.length)
    );

    const hoverMessage = new vscode.MarkdownString();
    hoverMessage.appendMarkdown(`**${term}**: ${definition}`);
    hoverMessage.isTrusted = true;

    const decoration: vscode.DecorationOptions = {
      range,
      hoverMessage,
    };

    editor.setDecorations(this.vocabularyDecoration, [decoration]);
    this.recordState(line, 'vocabulary', { term, definition });
  }

  clearAll(): void {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      editor.setDecorations(this.explanationDecoration, []);
      editor.setDecorations(this.complexityDecoration, []);
      editor.setDecorations(this.smellDecoration, []);
      editor.setDecorations(this.vocabularyDecoration, []);
    }
    this.decorations.clear();
    this.lineVisibility.clear();
  }

  clearLine(line: number): void {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;

    const lineRange = new vscode.Range(
      new vscode.Position(line, 0),
      new vscode.Position(line, editor.document.lineAt(line).text.length)
    );

    const isInRange = (d: DecorationState) => d.line === line;
    const states = Array.from(this.decorations.values()).flat();
    const match = states.find(isInRange);
    if (!match) return;

    const decoType = this.getDecorationType(match.type);
    if (decoType) {
      editor.setDecorations(decoType, []);
    }

    for (const [key, stateList] of this.decorations.entries()) {
      this.decorations.set(key, stateList.filter(s => s.line !== line));
    }

    this.lineVisibility.delete(line);
  }

  toggleAll(): boolean {
    this.visible = !this.visible;
    if (!this.visible) {
      this.clearAll();
    } else {
      this.updateVisibleDecorations();
    }
    this.logger.info(`Decorations toggled: ${this.visible ? 'visible' : 'hidden'}`);
    return this.visible;
  }

  toggleLine(line: number): boolean {
    const current = this.lineVisibility.get(line) ?? true;
    this.lineVisibility.set(line, !current);

    if (!current) {
      this.updateVisibleDecorations();
    } else {
      this.clearLine(line);
    }

    return !current;
  }

  onSelectionChange(event: vscode.TextEditorSelectionChangeEvent): void {
    if (!this.visible) return;
    this.updateVisibleDecorations();
  }

  onTextChange(event: vscode.TextDocumentChangeEvent): void {
    if (!this.visible) return;
    for (const change of event.contentChanges) {
      const startLine = change.range.start.line;
      const endLine = change.range.end.line;
      for (let line = startLine; line <= endLine; line++) {
        this.clearLine(line);
      }
    }
  }

  onActiveEditorChange(editor: vscode.TextEditor | undefined): void {
    if (editor && this.visible) {
      this.updateVisibleDecorations();
    }
  }

  updateVisibleDecorations(): void {
    const editor = vscode.window.activeTextEditor;
    if (!editor || !this.visible) return;

    const visibleRanges = editor.visibleRanges;
    if (visibleRanges.length === 0) return;

    const visibleLines = new Set<number>();
    for (const range of visibleRanges) {
      const start = Math.max(0, range.start.line - VIEWPORT_CULL_BUFFER);
      const end = Math.min(editor.document.lineCount - 1, range.end.line + VIEWPORT_CULL_BUFFER);
      for (let i = start; i <= end; i++) {
        visibleLines.add(i);
      }
    }

    const explanationDecorations: vscode.DecorationOptions[] = [];
    const complexityDecorations: vscode.DecorationOptions[] = [];
    const smellDecorations: vscode.DecorationOptions[] = [];
    const vocabularyDecorations: vscode.DecorationOptions[] = [];

    for (const [key, stateList] of this.decorations.entries()) {
      for (const state of stateList) {
        if (!visibleLines.has(state.line)) continue;
        if (this.lineVisibility.get(state.line) === false) continue;

        const range = new vscode.Range(
          new vscode.Position(state.line, 0),
          new vscode.Position(state.line, editor.document.lineAt(state.line).text.length)
        );

        let hoverMessage: vscode.MarkdownString | undefined;
        if (state.data) {
          hoverMessage = new vscode.MarkdownString();
          if (state.type === 'explanation') {
            hoverMessage.appendMarkdown(state.data.text || '');
          } else if (state.type === 'smell') {
            hoverMessage.appendMarkdown(`**${state.data.type}**: ${state.data.message}`);
          } else if (state.type === 'vocabulary') {
            hoverMessage.appendMarkdown(`**${state.data.term}**: ${state.data.definition}`);
          } else if (state.type === 'complexity' && state.data.score !== undefined) {
            const color = state.data.score <= 3 ? HEATMAP_COLORS.low : state.data.score <= 6 ? HEATMAP_COLORS.medium : HEATMAP_COLORS.high;
            hoverMessage.appendMarkdown(`${color.badge} Complexity: ${state.data.score}/10`);
          }
          hoverMessage.isTrusted = true;
        }

        const deco: vscode.DecorationOptions = { range, hoverMessage };

        switch (state.type) {
          case 'explanation': explanationDecorations.push(deco); break;
          case 'complexity': complexityDecorations.push(deco); break;
          case 'smell': smellDecorations.push(deco); break;
          case 'vocabulary': vocabularyDecorations.push(deco); break;
        }
      }
    }

    editor.setDecorations(this.explanationDecoration, explanationDecorations);
    editor.setDecorations(this.complexityDecoration, complexityDecorations);
    editor.setDecorations(this.smellDecoration, smellDecorations);
    editor.setDecorations(this.vocabularyDecoration, vocabularyDecorations);
  }

  private recordState(line: number, type: DecorationState['type'], data?: any): void {
    const key = `${type}`;
    if (!this.decorations.has(key)) {
      this.decorations.set(key, []);
    }
    const list = this.decorations.get(key)!;
    const existing = list.find(s => s.line === line && s.type === type);
    if (existing) {
      existing.data = data;
      existing.visible = true;
    } else {
      list.push({ line, type, visible: true, data });
    }
  }

  private getDecorationType(type: DecorationState['type']): vscode.TextEditorDecorationType | undefined {
    switch (type) {
      case 'explanation': return this.explanationDecoration;
      case 'complexity': return this.complexityDecoration;
      case 'smell': return this.smellDecoration;
      case 'vocabulary': return this.vocabularyDecoration;
    }
  }

  dispose(): void {
    this.clearAll();
    this.explanationDecoration.dispose();
    this.complexityDecoration.dispose();
    this.smellDecoration.dispose();
    this.vocabularyDecoration.dispose();
    for (const d of this.disposables) {
      d.dispose();
    }
    this.disposables = [];
  }
}
