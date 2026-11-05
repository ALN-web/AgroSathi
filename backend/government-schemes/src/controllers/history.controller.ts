/**
 * controllers/history.controller.ts
 *
 * HTTP request handlers for the Recently Viewed Schemes API.
 */

import { Request, Response, NextFunction } from 'express';
import { historyService } from '../services/history.service';
import { buildSuccessResponse, buildErrorResponse } from '../utils/response.util';
import { HTTP_STATUS, ERROR_CODES } from '../constants/api';

/**
 * Helper to extract userId from headers.
 */
function getUserId(req: Request): string | null {
  const userId = req.headers['x-user-id'] as string;
  return userId ? userId.trim() : null;
}

export const historyController = {
  /**
   * GET /api/government-schemes/history
   * Returns up to the last 10 viewed schemes.
   * Header: x-user-id
   */
  getRecentlyViewed: (req: Request, res: Response, next: NextFunction): void => {
    try {
      const userId = getUserId(req);
      if (!userId) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json(
          buildErrorResponse(ERROR_CODES.UNAUTHORIZED, 'Missing "x-user-id" header.')
        );
        return;
      }

      const history = historyService.getRecentlyViewed(userId);
      res.status(HTTP_STATUS.OK).json(buildSuccessResponse(history));
    } catch (err) {
      console.error('[HistoryController] Error in getRecentlyViewed:', err);
      next(err);
    }
  },
};
