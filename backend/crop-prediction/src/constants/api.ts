/**
 * constants/api.ts
 *
 * API-level constants shared across controllers, routes and middleware.
 */

export const API_PREFIX = '/api/crop-prediction';

export const ENDPOINTS = {
  HEALTH: `${API_PREFIX}/health`,
  PREDICT: `${API_PREFIX}/predict`,
  PREDICT_BATCH: `${API_PREFIX}/predict/batch`,
  HISTORY: `${API_PREFIX}/history`,
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  UNPROCESSABLE: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

export const ERROR_CODES = {
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  PREDICTION_FAILED: 'PREDICTION_FAILED',
  MODEL_NOT_LOADED: 'MODEL_NOT_LOADED',
  PYTHON_BRIDGE_ERROR: 'PYTHON_BRIDGE_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
} as const;

/** Feature names exactly as expected by the trained sklearn model */
export const MODEL_FEATURE_ORDER = [
  'N',
  'P',
  'K',
  'temperature',
  'humidity',
  'ph',
  'rainfall',
] as const;

export const MODEL_VERSION = '1.0.0';
export const MODEL_ALGORITHM = 'RandomForestClassifier'; // TODO: update after training
export const TOP_N_ALTERNATIVES = 3;
