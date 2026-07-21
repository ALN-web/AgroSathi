/**
 * AgroSathi — Crop Prediction Service
 * Entry point
 *
 * Accepts: N, P, K, Temperature, Humidity, pH, Rainfall
 * Returns: Predicted crop with confidence and metadata
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import { predictionRouter } from './routes/prediction.routes';

import { requestLogger } from './middleware/logger.middleware';
import { globalErrorHandler } from './middleware/error.middleware';
import { rateLimiter } from './middleware/rateLimiter.middleware';

const app = express();

// ── Security ────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: (process.env.ALLOWED_ORIGINS ?? 'http://localhost:3000').split(','),
    credentials: true,
  })
);

// ── Body Parsing ────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// ── Health Check ─────────────────────────────────
app.get('/api/crop-prediction/health', (_req, res) => {
  res.json({
    success: true,
    service: 'crop-prediction',
    version: '1.0.0',
    status: 'HEALTHY',
    timestamp: new Date().toISOString(),
    features: ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall'],
  });
});

// ── Routes ───────────────────────────────────────
app.use('/api/crop-prediction', rateLimiter, predictionRouter);

// ── Error Handler ────────────────────────────────
app.use(globalErrorHandler);

// ── Start ────────────────────────────────────────
const PORT = Number(process.env.CROP_PREDICTION_PORT) || 8010;
const server = app.listen(PORT, () => {
  console.info(`🌱 [Crop Prediction Service] Running on port ${PORT}`);
  console.info(`   Health → http://localhost:${PORT}/api/v1/crop-prediction/health`);
});

process.on('SIGTERM', () => server.close(() => process.exit(0)));
process.on('SIGINT', () => server.close(() => process.exit(0)));
