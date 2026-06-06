import { type Request, type Response, type NextFunction } from "express";
import { AppError } from "../utils/errors.js";
import { logger } from "../utils/logger.js";

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.status).json({
      success: false,
      code: err.code,
      message: err.message,
      ...(err.details ? { errors: err.details } : {}),
    });
  }
  logger.error({ err }, "unhandled_error");
  res.status(500).json({
    success: false,
    code: "SERVER_ERROR",
    message: "An unexpected error occurred",
  });
}
