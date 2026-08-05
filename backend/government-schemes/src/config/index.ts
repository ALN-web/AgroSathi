/**
 * config/index.ts
 *
 * Centralised runtime configuration for the Government Schemes service.
 * All environment variables are read once here and exported as a typed object.
 */

export const config = {
  // ── Server ──────────────────────────────────────────────────
  port: Number(process.env.GOVT_SCHEMES_PORT) || 8020,
  nodeEnv: process.env.NODE_ENV ?? 'development',
  isDev: (process.env.NODE_ENV ?? 'development') === 'development',

  // ── CORS ────────────────────────────────────────────────────
  allowedOrigins: (process.env.ALLOWED_ORIGINS ?? 'http://localhost:5173,http://localhost:3000').split(','),

  // ── Pagination ───────────────────────────────────────────────
  pagination: {
    defaultPage: 1,
    defaultLimit: 10,
    maxLimit: 100,
  },

  // ── Rate Limiting ───────────────────────────────────────────
  rateLimit: {
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 200,
  },

  // ── Logging ─────────────────────────────────────────────────
  log: {
    level: process.env.LOG_LEVEL ?? 'info',
    dir: process.env.LOG_DIR ?? './logs',
  },
} as const;
