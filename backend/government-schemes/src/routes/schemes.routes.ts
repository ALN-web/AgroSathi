/**
 * routes/schemes.routes.ts
 *
 * Express router for the Government Schemes REST API.
 *
 * Route order matters:
 *   /search  — must be declared BEFORE /:id
 *   /featured — must be declared BEFORE /:id
 *   /meta/*  — must be declared BEFORE /:id
 *   /:id     — must be declared LAST to avoid matching static segments
 *
 * All routes are prefixed with /api/government-schemes by server.ts.
 */

import { Router } from 'express';
import { schemesController } from '../controllers/schemes.controller';
import { validateQuery } from '../middleware/validate.middleware';
import { listSchemesSchema, searchSchemesSchema } from '../schemas/schemes.schema';

export const schemesRouter = Router();

// ── Static routes (must precede /:id) ───────────────────────────────────────

/**
 * GET /api/government-schemes/search?q=<query>[&schemeType=...][&state=...][&page=1][&limit=10]
 *
 * Full-text search across all schemes.
 * Query param "q" is required (min 2 chars).
 */
schemesRouter.get(
  '/search',
  validateQuery(searchSchemesSchema),
  schemesController.searchSchemes
);

/**
 * GET /api/government-schemes/featured
 *
 * Returns only featured, active schemes.
 */
schemesRouter.get('/featured', schemesController.getFeaturedSchemes);

/**
 * GET /api/government-schemes/meta/categories
 *
 * Returns all available category values for filter dropdowns.
 */
schemesRouter.get('/meta/categories', schemesController.getCategories);

/**
 * GET /api/government-schemes/meta/ministries
 *
 * Returns all unique ministry names for filter dropdowns.
 */
schemesRouter.get('/meta/ministries', schemesController.getMinistries);

// ── Collection route ─────────────────────────────────────────────────────────

/**
 * GET /api/government-schemes[?schemeType=...][&state=...][&ministry=...][&status=Active]
 *                             [&sortBy=...][&sortOrder=...][&page=1][&limit=10]
 *
 * Returns a paginated, filtered list of scheme summaries.
 */
schemesRouter.get(
  '/',
  validateQuery(listSchemesSchema),
  schemesController.getAllSchemes
);

// ── Dynamic ID route (must be last) ─────────────────────────────────────────

/**
 * GET /api/government-schemes/:id
 *
 * Returns the full detail object for one scheme.
 * Responds with 404 if not found.
 */
schemesRouter.get('/:id', schemesController.getSchemeById);
