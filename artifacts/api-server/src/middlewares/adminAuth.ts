import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const JWT_SECRET = (() => {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    console.warn(
      "[WARN] SESSION_SECRET environment variable is not set. " +
      "Admin authentication is disabled until it is configured."
    );
    return `__unset__${Math.random().toString(36).slice(2)}`;
  }
  return secret;
})();

export const ADMIN_PASSWORD = (() => {
  const pwd = process.env.ADMIN_PASSWORD;
  if (!pwd) {
    console.warn(
      "[WARN] ADMIN_PASSWORD environment variable is not set. " +
      "Admin login will fail until it is configured."
    );
  }
  return pwd ?? "";
})();

export function adminAuth(req: Request, res: Response, next: NextFunction): void {
  const auth = req.headers.authorization as string | undefined;
  if (!auth?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const decoded = jwt.verify(auth.slice(7), JWT_SECRET) as Record<string, unknown>;
    if (decoded.role !== "admin") {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}
