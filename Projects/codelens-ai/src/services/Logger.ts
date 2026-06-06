import * as vscode from 'vscode';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

const LOG_LEVEL_NAMES: Record<LogLevel, string> = {
  [LogLevel.DEBUG]: 'DEBUG',
  [LogLevel.INFO]: 'INFO',
  [LogLevel.WARN]: 'WARN',
  [LogLevel.ERROR]: 'ERROR',
};

export class Logger {
  private static instance: Logger;
  private outputChannel: vscode.OutputChannel;
  private level: LogLevel;

  private constructor() {
    this.outputChannel = vscode.window.createOutputChannel('CodeLens AI');
    this.level = this.getConfiguredLevel();
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private getConfiguredLevel(): LogLevel {
    try {
      const config = vscode.workspace.getConfiguration('codelens-ai');
      const levelStr = config.get<string>('logLevel', 'info').toLowerCase();
      switch (levelStr) {
        case 'debug': return LogLevel.DEBUG;
        case 'info': return LogLevel.INFO;
        case 'warn': return LogLevel.WARN;
        case 'error': return LogLevel.ERROR;
        default: return LogLevel.INFO;
      }
    } catch {
      return LogLevel.INFO;
    }
  }

  private log(level: LogLevel, message: string, data?: any): void {
    if (level < this.level) return;

    const timestamp = new Date().toISOString();
    const levelName = LOG_LEVEL_NAMES[level];
    const dataStr = data !== undefined ? ` ${JSON.stringify(data)}` : '';
    const formatted = `[${timestamp}] [${levelName}] ${message}${dataStr}`;

    this.outputChannel.appendLine(formatted);
    
    if (level >= LogLevel.ERROR) {
      try {
        console.error(`[CodeLens AI] ${message}`, data || '');
      } catch {
      }
    } else if (level >= LogLevel.WARN) {
      try {
        console.warn(`[CodeLens AI] ${message}`, data || '');
      } catch {
      }
    }
  }

  debug(message: string, data?: any): void {
    this.log(LogLevel.DEBUG, message, data);
  }

  info(message: string, data?: any): void {
    this.log(LogLevel.INFO, message, data);
  }

  warn(message: string, data?: any): void {
    this.log(LogLevel.WARN, message, data);
  }

  error(message: string, data?: any): void {
    this.log(LogLevel.ERROR, message, data);
  }

  setLevel(level: LogLevel): void {
    this.level = level;
  }

  show(): void {
    this.outputChannel.show();
  }

  dispose(): void {
    this.outputChannel.dispose();
    if (Logger.instance === this) {
      Logger.instance = undefined as any;
    }
  }
}
