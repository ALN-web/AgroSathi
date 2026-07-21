/**
 * middleware/logger.middleware.ts
 *
 * Request logging middleware using Winston.
 * Logs: method, url, status, response time, requestId.
 *
 * TODO: configure file transports for production log rotation.
 */

import { Request, Response, NextFunction } from 'express';

/** Simple console-based request logger placeholder */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  res.on('finish', () => {
    const ms = Date.now() - start;
    console.info(
      `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} — ${ms}ms`
    );
  });
  next();
}

/**
 * TODO: Replace with Winston instance
 * import winston from 'winston';
 * export const logger = winston.createLogger({ ... });
 */
