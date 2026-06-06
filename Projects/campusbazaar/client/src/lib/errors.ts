/**
 * Custom error classes for the domain.
 * The renderer / hook layer can switch on `code` to react meaningfully.
 */

export type AppErrorCode =
  | "NETWORK"
  | "TIMEOUT"
  | "ABORTED"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "VALIDATION"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "SERVER"
  | "UNKNOWN";

export class AppError extends Error {
  public readonly code: AppErrorCode;
  public readonly status: number | undefined;
  public readonly details: unknown;

  constructor(opts: { code: AppErrorCode; message: string; status?: number; details?: unknown }) {
    super(opts.message);
    this.name = "AppError";
    this.code = opts.code;
    this.status = opts.status;
    this.details = opts.details;
  }

  static fromUnknown(err: unknown): AppError {
    if (err instanceof AppError) return err;
    if (err instanceof Error) {
      return new AppError({ code: "UNKNOWN", message: err.message });
    }
    return new AppError({ code: "UNKNOWN", message: "An unknown error occurred" });
  }
}

export class NetworkError extends AppError {
  constructor(message = "Network unavailable") {
    super({ code: "NETWORK", message });
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super({ code: "VALIDATION", message, details, status: 400 });
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super({ code: "NOT_FOUND", message, status: 404 });
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Sign in required") {
    super({ code: "UNAUTHORIZED", message, status: 401 });
  }
}
