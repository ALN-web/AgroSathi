/**
 * helpers/featureVector.helper.ts
 *
 * Converts a validated PredictionRequestDTO into the exact ordered array
 * that the trained sklearn model expects.
 *
 * Feature order must match the training dataset column order:
 *   [N, P, K, temperature, humidity, ph, rainfall]
 */

import { MODEL_FEATURE_ORDER } from '../constants/api';

export type RawFeatures = {
  N: number;
  P: number;
  K: number;
  temperature: number;
  humidity: number;
  ph: number;
  rainfall: number;
};

/**
 * Returns a numeric array in the exact order the model was trained on.
 * @param features Validated request body
 */
export function toFeatureVector(features: RawFeatures): number[] {
  return MODEL_FEATURE_ORDER.map((key) => features[key as keyof RawFeatures]);
}

/**
 * Rounds all feature values to a sensible precision before passing to Python.
 */
export function sanitiseFeatures(features: RawFeatures): RawFeatures {
  return {
    N: Math.round(features.N * 100) / 100,
    P: Math.round(features.P * 100) / 100,
    K: Math.round(features.K * 100) / 100,
    temperature: Math.round(features.temperature * 100) / 100,
    humidity: Math.round(features.humidity * 100) / 100,
    ph: Math.round(features.ph * 100) / 100,
    rainfall: Math.round(features.rainfall * 100) / 100,
  };
}
