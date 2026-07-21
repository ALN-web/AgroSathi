/**
 * middleware/error.middleware.ts
 *
 * Global error handler for the Crop Prediction service.
 * Must be registered as the LAST middleware in the Express app.
 *
 * TODO: integrate with logger service once implemented.
 */

import { Request, Response, NextFunction } from 'express';

export function globalErrorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('[CropPrediction] Unhandled error:', err.message);

  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    },
  });
}
