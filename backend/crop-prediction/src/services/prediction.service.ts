/**
 * services/prediction.service.ts
 *
 * Module 1: Machine Learning Prediction
 *
 * Responsibilities (strictly):
 *  - Bridge to Python crop_model.pkl via pythonBridgeService
 *  - Validate and pass input features
 *  - Return crop prediction, model accuracy, and alternative crop scores
 *
 * This service has NO knowledge of Gemini, metadata, or response formatting.
 * It is a pure ML inference interface.
 *
 * Reusable by: Soil Analysis, future ML-based prediction modules.
 */

import { PredictionRequestDTO } from '../schemas/prediction.schema';
import { MLPredictionResult } from '../schemas/response.schema';
import { pythonBridgeService } from './pythonBridge.service';

// Raw shape returned by predict.py stdout
type RawMLOutput = {
  predictedCrop: { cropName: string; modelAccuracy: number };
  alternativeCrops: { cropName: string; suitabilityScore: number }[];
};

export const predictionService = {
  /**
   * Run a single crop prediction via the Python ML model.
   * Returns ONLY ML data: crop, accuracy, and alternative scores.
   * No AI calls. No metadata. No formatting.
   *
   * @param features - Validated input (N, P, K, temperature, humidity, ph, rainfall)
   * @returns MLPredictionResult
   */
  runPrediction: async (features: PredictionRequestDTO): Promise<MLPredictionResult> => {
    const raw = await pythonBridgeService.runScript('predict.py', features) as RawMLOutput;

    return {
      crop: raw.predictedCrop.cropName,
      accuracy: raw.predictedCrop.modelAccuracy,
      alternatives: raw.alternativeCrops.map(alt => ({
        crop: alt.cropName,
        score: alt.suitabilityScore,
      })),
    };
  },

  /**
   * Batch prediction stub — reserved for future implementation.
   */
  runBatchPrediction: async (_featuresList: PredictionRequestDTO[]): Promise<MLPredictionResult[]> => {
    throw new Error('predictionService.runBatchPrediction — not yet implemented');
  },
};
