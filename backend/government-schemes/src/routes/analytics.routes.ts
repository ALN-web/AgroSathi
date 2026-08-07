/**
 * routes/analytics.routes.ts
 *
 * Express router for the Government Schemes Analytics API.
 * All routes prefixed with /api/government-schemes/analytics
 */

import { Router } from 'express';
import { analyticsController } from '../controllers/analytics.controller';

export const analyticsRouter = Router();

/**
 * GET /api/government-schemes/analytics
 * Returns aggregated analytics overview + leaderboards.
 */
analyticsRouter.get('/', analyticsController.getAnalytics);
