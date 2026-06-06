import * as vscode from 'vscode';

export enum ErrorType {
  DNS_FAILURE = 'dns_failure',
  CONNECTION_REFUSED = 'connection_refused',
  SSL_ERROR = 'ssl_error',
  TIMEOUT = 'timeout',
  UNAUTHORIZED = 'unauthorized',
  INSUFFICIENT_CREDITS = 'insufficient_credits',
  RATE_LIMITED = 'rate_limited',
  PROVIDER_DOWN = 'provider_down',
  MALFORMED_JSON = 'malformed_json',
  USER_CANCELLED = 'user_cancelled',
  UNKNOWN = 'unknown',
}

export interface ClassifiedError {
  type: ErrorType;
  message: string;
  userMessage: string;
  action: ErrorAction;
}

export enum ErrorAction {
  RETRY = 'retry',
  FALLBACK = 'fallback',
  SHOW_SETTINGS = 'showSettings',
  SHOW_OUTPUT = 'showOutput',
  CHANGE_MODEL = 'changeModel',
  WAIT = 'wait',
  NONE = 'none',
}

const errorMessages: Record<ErrorType, string> = {
  [ErrorType.DNS_FAILURE]: 'Could not reach the AI service. Please check your internet connection and try again.',
  [ErrorType.CONNECTION_REFUSED]: 'The connection was refused. This might be a network issue or a firewall blocking the request.',
  [ErrorType.SSL_ERROR]: 'A security certificate error occurred. Please check your system date and time, or try a different network.',
  [ErrorType.TIMEOUT]: 'The request took too long. The AI service might be slow right now. Please try again.',
  [ErrorType.UNAUTHORIZED]: 'Your API key is not valid. Please check your API key in the settings.',
  [ErrorType.INSUFFICIENT_CREDITS]: 'Your OpenRouter account has insufficient credits. Please add credits to continue.',
  [ErrorType.RATE_LIMITED]: 'Too many requests. Please wait a moment and try again.',
  [ErrorType.PROVIDER_DOWN]: 'The AI service is currently unavailable. Please try again later.',
  [ErrorType.MALFORMED_JSON]: 'Received an unexpected response from the AI service. Please try again.',
  [ErrorType.USER_CANCELLED]: 'Request was cancelled.',
  [ErrorType.UNKNOWN]: 'An unexpected error occurred. Please try again.',
};

const errorActions: Record<ErrorType, ErrorAction> = {
  [ErrorType.DNS_FAILURE]: ErrorAction.RETRY,
  [ErrorType.CONNECTION_REFUSED]: ErrorAction.RETRY,
  [ErrorType.SSL_ERROR]: ErrorAction.RETRY,
  [ErrorType.TIMEOUT]: ErrorAction.RETRY,
  [ErrorType.UNAUTHORIZED]: ErrorAction.SHOW_SETTINGS,
  [ErrorType.INSUFFICIENT_CREDITS]: ErrorAction.CHANGE_MODEL,
  [ErrorType.RATE_LIMITED]: ErrorAction.WAIT,
  [ErrorType.PROVIDER_DOWN]: ErrorAction.FALLBACK,
  [ErrorType.MALFORMED_JSON]: ErrorAction.RETRY,
  [ErrorType.USER_CANCELLED]: ErrorAction.NONE,
  [ErrorType.UNKNOWN]: ErrorAction.RETRY,
};

export class ErrorHandler {
  classifyError(error: any): ClassifiedError {
    const type = this.determineType(error);
    const userMessage = errorMessages[type];
    const action = errorActions[type];

    return {
      type,
      message: error?.message || error?.toString() || 'Unknown error',
      userMessage,
      action,
    };
  }

  getUserMessage(errorType: ErrorType): string {
    return errorMessages[errorType] || errorMessages[ErrorType.UNKNOWN];
  }

  getAction(errorType: ErrorType): ErrorAction {
    return errorActions[errorType] || ErrorAction.RETRY;
  }

  handleError(error: any, context?: string): ClassifiedError {
    const classified = this.classifyError(error);

    this.logError(classified, context);

    if (classified.type === ErrorType.USER_CANCELLED) {
      return classified;
    }

    if (classified.action === ErrorAction.SHOW_SETTINGS) {
      vscode.window.showErrorMessage(classified.userMessage, 'Open Settings').then(selection => {
        if (selection === 'Open Settings') {
          vscode.commands.executeCommand('workbench.action.openSettings', 'codelens-ai.openrouterApiKey');
        }
      });
    } else if (classified.action === ErrorAction.CHANGE_MODEL) {
      vscode.window.showErrorMessage(classified.userMessage, 'Change Model').then(selection => {
        if (selection === 'Change Model') {
          vscode.commands.executeCommand('workbench.action.openSettings', 'codelens-ai.model');
        }
      });
    } else if (classified.action === ErrorAction.RETRY || classified.action === ErrorAction.WAIT) {
      vscode.window.showWarningMessage(classified.userMessage, 'Retry').then(selection => {
        if (selection === 'Retry') {
          vscode.commands.executeCommand('codelens-ai.retry');
        }
      });
    } else if (classified.action === ErrorAction.FALLBACK) {
      vscode.window.showWarningMessage(classified.userMessage, 'Switch Model').then(selection => {
        if (selection === 'Switch Model') {
          vscode.commands.executeCommand('codelens-ai.switchModel');
        }
      });
    }

    return classified;
  }

  private determineType(error: any): ErrorType {
    if (!error) return ErrorType.UNKNOWN;

    const message = (error.message || error.toString() || '').toLowerCase();

    if (error.name === 'AbortError' || error.name === 'Canceled' || message.includes('cancelled') || message.includes('canceled') || message.includes('abort')) {
      return ErrorType.USER_CANCELLED;
    }

    if (message.includes('enotfound') || message.includes('dns') || message.includes('getaddrinfo') || message.includes('eai_again')) {
      return ErrorType.DNS_FAILURE;
    }

    if (message.includes('econnrefused') || message.includes('connection refused') || message.includes('econnreset')) {
      return ErrorType.CONNECTION_REFUSED;
    }

    if (message.includes('ssl') || message.includes('certificate') || message.includes('cert') || message.includes('tls') || message.includes('secure') || message.includes('econnaborted')) {
      return ErrorType.SSL_ERROR;
    }

    if (message.includes('timeout') || message.includes('timed out') || message.includes('etimedout')) {
      return ErrorType.TIMEOUT;
    }

    if (message.includes('401') || message.includes('unauthorized') || message.includes('invalid api key') || message.includes('invalid key') || message.includes('authentication')) {
      return ErrorType.UNAUTHORIZED;
    }

    if (message.includes('402') || message.includes('insufficient') || message.includes('credits') || message.includes('quota') || message.includes('payment')) {
      return ErrorType.INSUFFICIENT_CREDITS;
    }

    if (message.includes('429') || message.includes('rate limit') || message.includes('too many requests')) {
      return ErrorType.RATE_LIMITED;
    }

    if (message.includes('502') || message.includes('503') || message.includes('bad gateway') || message.includes('service unavailable') || message.includes('provider') || message.includes('upstream')) {
      return ErrorType.PROVIDER_DOWN;
    }

    if (message.includes('json') || message.includes('parse') || message.includes('unexpected token') || message.includes('malformed')) {
      return ErrorType.MALFORMED_JSON;
    }

    const statusCode = error.status || error.statusCode;
    if (statusCode) {
      if (statusCode === 401) return ErrorType.UNAUTHORIZED;
      if (statusCode === 402) return ErrorType.INSUFFICIENT_CREDITS;
      if (statusCode === 429) return ErrorType.RATE_LIMITED;
      if (statusCode >= 500) return ErrorType.PROVIDER_DOWN;
    }

    return ErrorType.UNKNOWN;
  }

  private logError(classified: ClassifiedError, context?: string): void {
    const output = vscode.window.createOutputChannel('CodeLens AI');
    const timestamp = new Date().toISOString();
    const contextInfo = context ? ` [${context}]` : '';
    output.appendLine(`[${timestamp}] [ERROR]${contextInfo} Type: ${classified.type}`);
    output.appendLine(`[${timestamp}] [ERROR]${contextInfo} Message: ${classified.message}`);
    output.appendLine(`[${timestamp}] [ERROR]${contextInfo} UserMessage: ${classified.userMessage}`);
    output.appendLine(`[${timestamp}] [ERROR]${contextInfo} Action: ${classified.action}`);
  }
}
