import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/index.js";
import type { AuthUser } from "../types/index.js";

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : undefined;

  if (!token) {
    res.status(401).json({ error: "Unauthorized", message: "Missing token" });
    return;
  }

  try {
    const payload = jwt.verify(token, config.jwt.secret) as AuthUser;
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ error: "Unauthorized", message: "Invalid token" });
  }
}

/** Optional auth: sets req.user if valid token, does not fail if missing. */
export function optionalAuthMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : undefined;

  if (!token) {
    next();
    return;
  }

  try {
    const payload = jwt.verify(token, config.jwt.secret) as AuthUser;
    req.user = payload;
  } catch {
    // ignore invalid token for optional auth
  }
  next();
}
