export class AppError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly details?: unknown;

  constructor(opts: { message: string; status?: number; code?: string; details?: unknown }) {
    super(opts.message);
    this.name = "AppError";
    this.status = opts.status ?? 500;
    this.code = opts.code ?? "SERVER_ERROR";
    this.details = opts.details;
  }
}

export const NotFound = (msg = "Not found") => new AppError({ message: msg, status: 404, code: "NOT_FOUND" });
export const Unauthorized = (msg = "Sign in required") => new AppError({ message: msg, status: 401, code: "UNAUTHORIZED" });
export const Forbidden = (msg = "Not allowed") => new AppError({ message: msg, status: 403, code: "FORBIDDEN" });
export const BadRequest = (msg: string, details?: unknown) => new AppError({ message: msg, status: 400, code: "BAD_REQUEST", details });
