/**
 * middleware/rateLimiter.middleware.ts
 *
 * Rate limiting middleware for the prediction endpoint.
 * Prevents API abuse and protects the Python ML subprocess from overload.
 *
 * TODO: replace with express-rate-limit once package is installed.
 * TODO: use Redis store for distributed rate limiting in production.
 */

import { Request, Response, NextFunction } from 'express';

/** In-memory placeholder — NOT for production use */
const requestCounts = new Map<string, { count: number; resetAt: number }>();

export function rateLimiter(req: Request, res: Response, next: NextFunction): void {
  const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000;
  const max = Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100;

  const ip = req.ip ?? 'unknown';
  const now = Date.now();
  const record = requestCounts.get(ip);

  if (!record || now > record.resetAt) {
    requestCounts.set(ip, { count: 1, resetAt: now + windowMs });
    next();
    return;
  }

  if (record.count >= max) {
    res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests — please try again later.',
      },
    });
    return;
  }

  record.count += 1;
  next();
}
