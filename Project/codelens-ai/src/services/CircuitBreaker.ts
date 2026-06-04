import { CIRCUIT_BREAKER_THRESHOLD, CIRCUIT_BREAKER_RESET_MS } from '../utils/constants';

export enum CircuitState {
  CLOSED = 'closed',
  OPEN = 'open',
  HALF_OPEN = 'half_open',
}

export class CircuitBreaker {
  private state: CircuitState;
  private failureCount: number;
  private lastFailureTime: number;
  private threshold: number;
  private resetTimeout: number;

  constructor(threshold?: number, resetTimeout?: number) {
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.lastFailureTime = 0;
    this.threshold = threshold ?? CIRCUIT_BREAKER_THRESHOLD;
    this.resetTimeout = resetTimeout ?? CIRCUIT_BREAKER_RESET_MS;
  }

  recordFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.state === CircuitState.HALF_OPEN || this.failureCount >= this.threshold) {
      this.state = CircuitState.OPEN;
    }
  }

  recordSuccess(): void {
    this.failureCount = 0;
    this.state = CircuitState.CLOSED;
  }

  isOpen(): boolean {
    if (this.state === CircuitState.CLOSED) {
      return false;
    }

    if (this.state === CircuitState.OPEN) {
      if (this.resetTimeout > 0) {
        const elapsed = Date.now() - this.lastFailureTime;
        if (elapsed >= this.resetTimeout) {
          this.state = CircuitState.HALF_OPEN;
          return false;
        }
      }
      return true;
    }

    return false;
  }

  getState(): CircuitState {
    if (this.state === CircuitState.OPEN && this.resetTimeout > 0) {
      const elapsed = Date.now() - this.lastFailureTime;
      if (elapsed >= this.resetTimeout) {
        this.state = CircuitState.HALF_OPEN;
      }
    }
    return this.state;
  }

  getFailureCount(): number {
    return this.failureCount;
  }

  reset(): void {
    this.failureCount = 0;
    this.state = CircuitState.CLOSED;
    this.lastFailureTime = 0;
  }
}
