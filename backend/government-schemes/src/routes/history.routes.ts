/**
 * routes/history.routes.ts
 *
 * Express router for the Recently Viewed Schemes API.
 * All routes prefixed with /api/government-schemes/history
 */

import { Router } from 'express';
import { historyController } from '../controllers/history.controller';

export const historyRouter = Router();

/**
 * GET /api/government-schemes/history
 * Returns the last 10 viewed schemes.
 */
historyRouter.get('/', historyController.getRecentlyViewed);
