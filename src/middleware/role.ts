import type { Request, Response, NextFunction } from "express";

/** Require user to have one of the given roles. Use after authMiddleware. */
export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const userRole = (user as { role?: string }).role ?? "explorer";
    if (!roles.includes(userRole)) {
      res.status(403).json({
        error: "Forbidden",
        message: `Requires role: ${roles.join(" or ")}`,
      });
      return;
    }
    next();
  };
}
