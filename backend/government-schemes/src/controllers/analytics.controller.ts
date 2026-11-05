/**
 * controllers/analytics.controller.ts
 *
 * HTTP request handlers for the Analytics API.
 */

import { Request, Response, NextFunction } from 'express';
import { analyticsService } from '../services/analytics.service';
import { buildSuccessResponse } from '../utils/response.util';
import { HTTP_STATUS } from '../constants/api';

export const analyticsController = {
  /**
   * GET /api/government-schemes/analytics
   * Returns aggregated analytics about schemes, views, bookmarks, and recommendations.
   */
  getAnalytics: (_req: Request, res: Response, next: NextFunction): void => {
    try {
      const analytics = analyticsService.getAnalyticsReport();
      res.status(HTTP_STATUS.OK).json(buildSuccessResponse(analytics));
    } catch (err) {
      console.error('[AnalyticsController] Error in getAnalytics:', err);
      next(err);
    }
  },
};
