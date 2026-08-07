/**
 * controllers/sync.controller.ts
 *
 * HTTP request handlers for the Sync API.
 */

import { Request, Response, NextFunction } from 'express';
import { syncService } from '../services/sync.service';
import { buildSuccessResponse, buildErrorResponse } from '../utils/response.util';
import { HTTP_STATUS, ERROR_CODES } from '../constants/api';

export const syncController = {
  /**
   * GET /api/government-schemes/sync/status
   * Returns metadata about the current sync state.
   */
  getStatus: (_req: Request, res: Response, next: NextFunction): void => {
    try {
      const info = syncService.getSyncInfo();
      res.status(HTTP_STATUS.OK).json(buildSuccessResponse(info));
    } catch (err) {
      console.error('[SyncController] Error in getStatus:', err);
      next(err);
    }
  },

  /**
   * POST /api/government-schemes/sync/trigger
   * Manually triggers a re-sync with the active data adapter.
   */
  triggerSync: async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await syncService.sync();

      if (!result.success) {
        res.status(HTTP_STATUS.INTERNAL).json(
          buildErrorResponse(ERROR_CODES.INTERNAL_ERROR, result.error ?? 'Sync failed.')
        );
        return;
      }

      res.status(HTTP_STATUS.OK).json(buildSuccessResponse(result));
    } catch (err) {
      console.error('[SyncController] Error in triggerSync:', err);
      next(err);
    }
  },
};
