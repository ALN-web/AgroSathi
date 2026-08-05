/**
 * middleware/logger.middleware.ts
 *
 * Request logging middleware for the Government Schemes service.
 * Logs: method, url, status, response time.
 */

import { Request, Response, NextFunction } from 'express';

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();

  res.on('finish', () => {
    const ms = Date.now() - start;
    const level = res.statusCode >= 500 ? 'ERROR' : res.statusCode >= 400 ? 'WARN' : 'INFO';
    console.info(
      `[${level}] [${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} — ${ms}ms`
    );
  });

  next();
}
