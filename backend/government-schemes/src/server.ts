/**
 * AgroSathi — Government Schemes Service
 * Entry point
 *
 * Exposes:
 *   GET  /api/government-schemes              — list all schemes (filtered, paginated)
 *   GET  /api/government-schemes/search       — full-text search
 *   GET  /api/government-schemes/featured     — featured schemes only
 *   GET  /api/government-schemes/meta/categories  — available categories
 *   GET  /api/government-schemes/meta/ministries  — available ministries
 *   GET  /api/government-schemes/:id          — single scheme detail
 *   POST /api/government-schemes/eligibility  — eligibility engine
 *
 * This module is fully independent — it has NO dependency on the
 * crop-prediction module or any other backend service.
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import { config } from './config';
import { schemesRouter } from './routes/schemes.routes';
import eligibilityRouter from './routes/eligibility.routes';
import { bookmarksRouter } from './routes/bookmarks.routes';
import { historyRouter } from './routes/history.routes';
import { analyticsRouter } from './routes/analytics.routes';
import { syncRouter } from './routes/sync.routes';
import { requestLogger } from './middleware/logger.middleware';
import { globalErrorHandler } from './middleware/error.middleware';
import { rateLimiter } from './middleware/rateLimiter.middleware';

const app = express();

// ── Security ─────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: config.allowedOrigins,
    credentials: true,
  })
);

// ── Body Parsing ──────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Request Logger ────────────────────────────────────────────────────────────
app.use(requestLogger);

// ── Health Check ──────────────────────────────────────────────────────────────
app.get('/api/government-schemes/health', (_req, res) => {
  res.json({
      success: true,
      service: 'government-schemes',
      version: '1.0.0',
      status: 'HEALTHY',
      timestamp: new Date().toISOString(),
      endpoints: [
        'GET  /api/government-schemes',
        'GET  /api/government-schemes/search?q=',
        'GET  /api/government-schemes/featured',
        'GET  /api/government-schemes/meta/categories',
        'GET  /api/government-schemes/meta/ministries',
        'GET  /api/government-schemes/:id',
        'POST /api/government-schemes/eligibility',
      ],
    });
});

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/government-schemes/sync', rateLimiter, syncRouter);
app.use('/api/government-schemes/eligibility', rateLimiter, eligibilityRouter);
app.use('/api/government-schemes/bookmarks', rateLimiter, bookmarksRouter);
app.use('/api/government-schemes/history', rateLimiter, historyRouter);
app.use('/api/government-schemes/analytics', rateLimiter, analyticsRouter);
app.use('/api/government-schemes', rateLimiter, schemesRouter);

// ── 404 Handler ───────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'The requested endpoint does not exist.',
    },
  });
});

// ── Global Error Handler (must be last) ──────────────────────────────────────
app.use(globalErrorHandler);

// ── Start Server ──────────────────────────────────────────────────────────────
const PORT = config.port;

const server = app.listen(PORT, () => {
  console.info(`🌾 [Government Schemes Service] Running on port ${PORT}`);
  console.info(`   Health   → http://localhost:${PORT}/api/government-schemes/health`);
  console.info(`   List     → http://localhost:${PORT}/api/government-schemes`);
  console.info(`   Search      → http://localhost:${PORT}/api/government-schemes/search?q=kisan`);
  console.info(`   Detail      → http://localhost:${PORT}/api/government-schemes/pm-kisan-001`);
  console.info(`   Featured    → http://localhost:${PORT}/api/government-schemes/featured`);
  console.info(`   Eligibility → POST http://localhost:${PORT}/api/government-schemes/eligibility`);
});

process.on('SIGTERM', () => server.close(() => process.exit(0)));
process.on('SIGINT', () => server.close(() => process.exit(0)));
