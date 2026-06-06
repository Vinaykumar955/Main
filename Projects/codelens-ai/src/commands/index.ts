import * as vscode from 'vscode';

export function getActiveEditorOrWarn(): vscode.TextEditor | undefined {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showWarningMessage('No active editor found. Open a file first.');
    return undefined;
  }
  return editor;
}

export function getSelectedLines(editor: vscode.TextEditor): { start: number; end: number } | null {
  const selection = editor.selection;
  if (selection.isEmpty) {
    return null;
  }
  return {
    start: selection.start.line,
    end: selection.end.line,
  };
}

export function getFileLanguage(editor: vscode.TextEditor): string {
  return editor.document.languageId || 'plaintext';
}

export function showSettingsUI(): void {
  vscode.commands.executeCommand('workbench.action.openSettings', 'codelens-ai.');
}

export async function showInformationWithAction(
  message: string,
  action: string
): Promise<boolean> {
  const result = await vscode.window.showInformationMessage(message, action);
  return result === action;
}
