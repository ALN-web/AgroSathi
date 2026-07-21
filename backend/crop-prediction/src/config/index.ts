/**
 * config/index.ts
 *
 * Centralised runtime configuration for the Crop Prediction service.
 * All environment variables are read once here and exported as a typed object.
 *
 * TODO: add validation (e.g. with Joi or zod) before service launch.
 */

export const config = {
  // ── Server ──────────────────────────────────────
  port: Number(process.env.CROP_PREDICTION_PORT) || 8010,
  nodeEnv: process.env.NODE_ENV ?? 'development',
  isDev: (process.env.NODE_ENV ?? 'development') === 'development',

  // ── CORS ────────────────────────────────────────
  allowedOrigins: (process.env.ALLOWED_ORIGINS ?? 'http://localhost:3000').split(','),

  // ── Gemini ──────────────────────────────────────
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || '',
  },

  // ── Python / ML ─────────────────────────────────
  python: {
    executable: process.env.PYTHON_EXECUTABLE ?? 'python3',
    scriptsPath: process.env.PYTHON_SCRIPTS_PATH ?? './python/scripts',
    modelPath: process.env.ML_MODEL_PATH ?? './python/model/crop_model.pkl',
    scalerPath: process.env.ML_SCALER_PATH ?? './python/model/scaler.pkl',
    encoderPath: process.env.ML_ENCODER_PATH ?? './python/model/label_encoder.pkl',
  },

  // ── Logging ─────────────────────────────────────
  log: {
    level: process.env.LOG_LEVEL ?? 'info',
    dir: process.env.LOG_DIR ?? './logs',
  },

  // ── File Paths ───────────────────────────────────
  paths: {
    uploads: process.env.UPLOAD_DIR ?? './uploads',
    temp: process.env.TEMP_DIR ?? './temp',
    responses: process.env.RESPONSE_DIR ?? './responses',
    maxFileSizeMb: Number(process.env.MAX_FILE_SIZE_MB) || 10,
  },

  // ── Rate Limiting ───────────────────────────────
  rateLimit: {
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  },
} as const;
