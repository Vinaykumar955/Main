import * as vscode from 'vscode';
import { OPENROUTER_BASE_URL, OPENROUTER_CHAT_ENDPOINT, DEFAULT_MAX_TOKENS, DEFAULT_TEMPERATURE, MODELS } from '../utils/constants';

export interface CompletionOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  signal?: AbortSignal;
}

interface OpenRouterResponse {
  id: string;
  choices: Array<{
    index: number;
    message?: { role: string; content: string };
    delta?: { role?: string; content?: string };
    finish_reason?: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface OpenRouterModel {
  id: string;
  name: string;
  created: number;
  description?: string;
  context_length?: number;
  pricing: { prompt: string; completion: string };
}

export class OpenRouterClient {
  private apiKey: string;
  private _secretStorageKey: string;

  constructor() {
    this.apiKey = '';
    this._secretStorageKey = 'codelens-ai.openrouter-api-key';
  }

  private async getApiKey(): Promise<string> {
    if (this.apiKey) {
      return this.apiKey;
    }
    const config = vscode.workspace.getConfiguration('codelens-ai');
    let key = config.get<string>('apiKey', '');
    if (key) {
      this.apiKey = key;
      return key;
    }
    try {
      const ext = vscode.extensions.getExtension('codelens-ai.codelens-ai');
      if (ext && ext.secrets) {
        key = await ext.secrets.get(this._secretStorageKey);
        if (key) {
          this.apiKey = key;
          return key;
        }
      }
    } catch {
    }
    return '';
  }

  private async buildHeaders(): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${await this.getApiKey()}`,
    };
    try {
      headers['HTTP-Referer'] = vscode.env.appName || 'https://codelens-ai.dev';
      headers['X-Title'] = 'CodeLens AI';
    } catch {
      headers['HTTP-Referer'] = 'https://codelens-ai.dev';
      headers['X-Title'] = 'CodeLens AI';
    }
    return headers;
  }

  private buildBody(messages: { role: string; content: string }[], options: CompletionOptions): Record<string, unknown> {
    const body: Record<string, unknown> = {
      model: options.model || MODELS.PRIMARY,
      messages,
      temperature: options.temperature ?? DEFAULT_TEMPERATURE,
      max_tokens: options.maxTokens ?? DEFAULT_MAX_TOKENS,
    };
    if (options.stream !== undefined) {
      body.stream = options.stream;
    }
    return body;
  }

  async *streamCompletion(
    messages: { role: string; content: string }[],
    options: CompletionOptions = {}
  ): AsyncGenerator<string> {
    const url = `${OPENROUTER_BASE_URL}${OPENROUTER_CHAT_ENDPOINT}`;
    const body = this.buildBody(messages, { ...options, stream: true });
    const controller = new AbortController();
    const signal = options.signal;

    if (signal) {
      signal.addEventListener('abort', () => controller.abort(), { once: true });
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: await this.buildHeaders(),
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(`OpenRouter API error ${response.status}: ${errorText || response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Response body is not readable');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith(':')) continue;

          if (trimmed.startsWith('data: ')) {
            const data = trimmed.slice(6);
            if (data === '[DONE]') return;

            try {
              const parsed: OpenRouterResponse = JSON.parse(data);
              const delta = parsed.choices?.[0]?.delta?.content;
              if (delta) {
                yield delta;
              }
            } catch {
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  async completion(
    messages: { role: string; content: string }[],
    options: CompletionOptions = {}
  ): Promise<string> {
    const url = `${OPENROUTER_BASE_URL}${OPENROUTER_CHAT_ENDPOINT}`;
    const body = this.buildBody(messages, { ...options, stream: false });

    const response = await fetch(url, {
      method: 'POST',
      headers: await this.buildHeaders(),
      body: JSON.stringify(body),
      signal: options.signal,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(`OpenRouter API error ${response.status}: ${errorText || response.statusText}`);
    }

    const result: OpenRouterResponse = await response.json();
    const content = result.choices?.[0]?.message?.content;
    if (content === undefined) {
      throw new Error('OpenRouter returned an empty response');
    }
    return content;
  }

  async getAvailableModels(): Promise<OpenRouterModel[]> {
    const url = `${OPENROUTER_BASE_URL}/models`;
    const response = await fetch(url, {
      method: 'GET',
      headers: await this.buildHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(`OpenRouter models API error ${response.status}: ${errorText || response.statusText}`);
    }

    const result: { data: OpenRouterModel[] } = await response.json();
    return result.data || [];
  }
}
