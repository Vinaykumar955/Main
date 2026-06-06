import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../config/env.js";

export function signToken(payload: { id: string }, options?: SignOptions): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRE,
    ...options,
  } as SignOptions);
}

export function verifyToken<T = { id: string }>(token: string): T {
  return jwt.verify(token, env.JWT_SECRET) as T;
}
