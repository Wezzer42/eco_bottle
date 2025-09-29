import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export interface AuthenticatedRequest extends Request {
  user?: { id: string; email: string; sub?: string };
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const token = header.slice("Bearer ".length);
  try {
    const secret = process.env.JWT_SECRET || "dev-secret";
    const payload = jwt.verify(token, secret) as { sub?: string; id?: string; email: string };
    // Поддерживаем как sub (стандартный JWT), так и id для обратной совместимости
    const userId = payload.sub || payload.id;
    if (!userId) {
      return res.status(401).json({ error: "Invalid token: missing user ID" });
    }
    req.user = { id: userId, email: payload.email, sub: payload.sub };
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

