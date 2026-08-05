/**
 * middleware/error.middleware.ts
 *
 * Global error handler for the Government Schemes service.
 * Must be registered as the LAST middleware in the Express app.
 */

import { Request, Response, NextFunction } from 'express';
import { buildErrorResponse } from '../utils/response.util';
import { HTTP_STATUS, ERROR_CODES } from '../constants/api';

export function globalErrorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('[GovernmentSchemes] Unhandled error:', err.message);

  res.status(HTTP_STATUS.INTERNAL).json(
    buildErrorResponse(
      ERROR_CODES.INTERNAL_ERROR,
      process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
    )
  );
}
