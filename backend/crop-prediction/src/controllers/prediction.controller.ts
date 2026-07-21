/**
 * controllers/prediction.controller.ts
 *
 * HTTP request handler for crop prediction.
 * The controller has exactly ONE responsibility:
 *   - Receive validated HTTP input
 *   - Call responseBuilderService.build()
 *   - Return JSON response
 *
 * No business logic. No data merging. No service orchestration.
 */

import { Request, Response, NextFunction } from 'express';
import { responseBuilderService } from '../services/responseBuilder.service';
import { PredictionRequestDTO } from '../schemas/prediction.schema';
import { HTTP_STATUS, ERROR_CODES } from '../constants/api';
import { buildSuccessResponse, buildErrorResponse } from '../helpers/response.helper';

export const predictionController = {
  /**
   * POST /api/crop-prediction/predict
   * Accepts 7 ML features and returns the full unified prediction response.
   */
  predict: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const body = req.body as PredictionRequestDTO;
      const result = await responseBuilderService.build(body);
      res.status(HTTP_STATUS.OK).json(buildSuccessResponse(result));
    } catch (err) {
      console.error('[PredictionController] Error in predict:', err);
      res.status(HTTP_STATUS.INTERNAL).json(buildErrorResponse(
        ERROR_CODES.PREDICTION_FAILED,
        'Failed to run prediction',
        err instanceof Error ? err.message : err
      ));
    }
  },

  /**
   * POST /api/crop-prediction/predict/batch
   * Reserved for future batch prediction implementation.
   */
  predictBatch: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    res.status(HTTP_STATUS.SERVICE_UNAVAILABLE).json(buildErrorResponse(
      ERROR_CODES.INTERNAL_ERROR,
      'Batch prediction not yet implemented'
    ));
  },

  /**
   * GET /api/crop-prediction/history
   * Reserved for future prediction history implementation.
   */
  getHistory: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    res.status(HTTP_STATUS.SERVICE_UNAVAILABLE).json(buildErrorResponse(
      ERROR_CODES.INTERNAL_ERROR,
      'History not yet implemented'
    ));
  },
};
