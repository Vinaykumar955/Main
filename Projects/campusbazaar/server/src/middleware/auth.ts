import { type Request, type Response, type NextFunction } from "express";
import { verifyToken } from "../utils/token.js";
import { User } from "../models/User.js";
import { Unauthorized } from "../utils/errors.js";

export interface AuthedRequest extends Request {
  user?: {
    id: string;
    role: "user" | "moderator" | "admin";
  };
}

export async function auth(req: AuthedRequest, _res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) throw Unauthorized("No token");
    const token = header.split(" ")[1];
    if (!token) throw Unauthorized("No token");
    const decoded = verifyToken<{ id: string }>(token);
    const user = await User.findById(decoded.id);
    if (!user) throw Unauthorized("Invalid token");
    if (user.role !== "admin" && user.role !== "moderator" && user.role !== "user") {
      throw Unauthorized("Invalid role");
    }
    req.user = { id: user.id, role: user.role };
    next();
  } catch (err) {
    next(err);
  }
}

export function requireRole(...roles: Array<"user" | "moderator" | "admin">) {
  return (req: AuthedRequest, _res: Response, next: NextFunction) => {
    if (!req.user) return next(Unauthorized());
    if (!roles.includes(req.user.role)) return next(Unauthorized("Insufficient role"));
    next();
  };
}
