const vscode = {
  window: {
    createOutputChannel: () => ({ appendLine: () => {} }),
    showErrorMessage: () => Promise.resolve(undefined),
    showWarningMessage: () => Promise.resolve(undefined),
    showInformationMessage: () => Promise.resolve(undefined),
    onDidChangeTextEditorSelection: () => ({ dispose: () => {} }),
    onDidChangeActiveTextEditor: () => ({ dispose: () => {} }),
  },
  workspace: {
    getConfiguration: () => ({
      get: (key, defaultValue) => defaultValue,
    }),
    onDidChangeTextDocument: () => ({ dispose: () => {} }),
  },
  commands: {
    executeCommand: () => Promise.resolve(undefined),
  },
  extensions: {
    getExtension: () => undefined,
  },
  env: {
    appName: 'CodeLens AI Test',
  },
  EventEmitter: class {
    constructor() {
      this.event = () => {};
    }
    fire() {}
    dispose() {}
  },
  Disposable: class {
    dispose() {}
  },
  ThemeColor: class {
    constructor(id) {
      this.id = id;
    }
  },
  ExtensionContext: class {
    constructor() {
      this.subscriptions = [];
      this.extensionUri = '';
      this.secrets = { get: async () => undefined, store: async () => {}, delete: async () => {} };
    }
  },
};

module.exports = vscode;
module.exports.default = vscode;
