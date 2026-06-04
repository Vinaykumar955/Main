import { MAX_RETRIES, BASE_BACKOFF_MS } from '../utils/constants';

export interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  signal?: AbortSignal;
}

const NON_RETRYABLE_STATUS_CODES = [400, 401, 402, 403, 404, 405, 406, 422];

function isRetryable(error: any): boolean {
  if (!error) return true;

  const message = (error.message || error.toString() || '').toLowerCase();

  if (error.name === 'AbortError' || message.includes('cancelled') || message.includes('canceled') || message.includes('abort')) {
    return false;
  }

  const status = error.status || error.statusCode;
  if (status && NON_RETRYABLE_STATUS_CODES.includes(status)) {
    return false;
  }

  const nonRetryable = [
    'invalid api key', 'unauthorized', 'insufficient credits', 'invalid request',
    'not found', 'bad request', 'method not allowed', 'not acceptable',
    'unprocessable entity',
  ];

  for (const phrase of nonRetryable) {
    if (message.includes(phrase)) return false;
  }

  return true;
}

function calculateDelay(attempt: number, baseDelay: number): number {
  const exponential = baseDelay * Math.pow(2, attempt);
  return Math.random() * exponential;
}

export class RetryWithBackoff {
  private defaultMaxRetries: number;
  private defaultBaseDelay: number;

  constructor(maxRetries?: number, baseDelay?: number) {
    this.defaultMaxRetries = maxRetries ?? MAX_RETRIES;
    this.defaultBaseDelay = baseDelay ?? BASE_BACKOFF_MS;
  }

  async execute<T>(
    fn: () => Promise<T>,
    options?: RetryOptions
  ): Promise<T> {
    const maxRetries = options?.maxRetries ?? this.defaultMaxRetries;
    const baseDelay = options?.baseDelay ?? this.defaultBaseDelay;
    const signal = options?.signal;

    let lastError: any;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (signal?.aborted) {
          throw new DOMException('Aborted', 'AbortError');
        }
        return await fn();
      } catch (error) {
        lastError = error;

        if (signal?.aborted) {
          throw error;
        }

        if (!isRetryable(error)) {
          throw error;
        }

        if (attempt >= maxRetries) {
          throw error;
        }

        const delay = calculateDelay(attempt, baseDelay);
        await this.sleep(delay, signal);
      }
    }

    throw lastError;
  }

  private sleep(ms: number, signal?: AbortSignal): Promise<void> {
    return new Promise((resolve, reject) => {
      if (signal?.aborted) {
        return reject(new DOMException('Aborted', 'AbortError'));
      }

      const timer = setTimeout(resolve, ms);

      const onAbort = () => {
        clearTimeout(timer);
        reject(new DOMException('Aborted', 'AbortError'));
      };

      signal?.addEventListener('abort', onAbort, { once: true });

      const unsubscribe = () => signal?.removeEventListener('abort', onAbort);
      const originalResolve = resolve;
      resolve = () => {
        unsubscribe();
        originalResolve();
      };
    });
  }
}
