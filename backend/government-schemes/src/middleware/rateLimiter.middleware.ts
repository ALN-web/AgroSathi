/**
 * middleware/rateLimiter.middleware.ts
 *
 * In-memory sliding-window rate limiter for the Government Schemes service.
 * Each unique IP is tracked per window.
 *
 * TODO: Replace with a Redis-backed store for distributed deployments.
 */

import { Request, Response, NextFunction } from 'express';
import { config } from '../config';
import { buildErrorResponse } from '../utils/response.util';
import { HTTP_STATUS, ERROR_CODES } from '../constants/api';

interface WindowRecord {
  count: number;
  resetAt: number;
}

const requestCounts = new Map<string, WindowRecord>();

export function rateLimiter(req: Request, res: Response, next: NextFunction): void {
  const { windowMs, max } = config.rateLimit;
  const ip = req.ip ?? 'unknown';
  const now = Date.now();

  const record = requestCounts.get(ip);

  if (!record || now > record.resetAt) {
    requestCounts.set(ip, { count: 1, resetAt: now + windowMs });
    next();
    return;
  }

  if (record.count >= max) {
    res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json(
      buildErrorResponse(
        ERROR_CODES.RATE_LIMIT_EXCEEDED,
        'Too many requests — please try again later.'
      )
    );
    return;
  }

  record.count += 1;
  next();
}
