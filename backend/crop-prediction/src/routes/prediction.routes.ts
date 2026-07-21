/**
 * routes/prediction.routes.ts
 *
 * Express router for the Crop Prediction API.
 *
 * Routes:
 *   POST   /api/v1/crop-prediction/predict        — Single prediction
 *   POST   /api/v1/crop-prediction/predict/batch  — Batch predictions (TODO)
 *   GET    /api/v1/crop-prediction/history        — Prediction history (TODO)
 *
 * TODO: Uncomment and wire up controllers + middleware once implemented.
 */

import { Router } from 'express';
import { predictionController } from '../controllers/prediction.controller';
import { reportController } from '../controllers/report.controller';
import { validateRequest } from '../middleware/validate.middleware';
import { predictionRequestSchema } from '../schemas/prediction.schema';

const router = Router();

// ── Single Prediction ────────────────────────────────────────────────────────
router.post(
  '/predict',
  validateRequest(predictionRequestSchema),
  predictionController.predict
);

// ── Batch Prediction ─────────────────────────────────────────────────────────
router.post(
  '/predict/batch',
  predictionController.predictBatch
);

// ── Prediction History ───────────────────────────────────────────────────────
router.get('/history', predictionController.getHistory);

// ── PDF Report ───────────────────────────────────────────────────────────────
// POST /api/crop-prediction/report
// Accepts the same 7 input features as /predict and returns a downloadable PDF.
router.post(
  '/report',
  validateRequest(predictionRequestSchema),
  reportController.generate
);

export { router as predictionRouter };
