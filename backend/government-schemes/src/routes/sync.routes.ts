/**
 * routes/sync.routes.ts
 *
 * Express router for the Sync API.
 * All routes prefixed with /api/government-schemes/sync
 */

import { Router } from 'express';
import { syncController } from '../controllers/sync.controller';

export const syncRouter = Router();

/**
 * GET /api/government-schemes/sync/status
 * Returns sync metadata.
 */
syncRouter.get('/status', syncController.getStatus);

/**
 * POST /api/government-schemes/sync/trigger
 * Manually trigger a fresh sync from the active data adapter.
 */
syncRouter.post('/trigger', syncController.triggerSync);
