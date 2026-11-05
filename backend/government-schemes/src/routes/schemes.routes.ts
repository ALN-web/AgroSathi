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

import { Router, Request, Response } from 'express';
import { schemesController } from '../controllers/schemes.controller';
import { validateQuery } from '../middleware/validate.middleware';
import { listSchemesSchema, searchSchemesSchema } from '../schemas/schemes.schema';
import { auditGovUrl } from '../utils/url.util';

export const schemesRouter = Router();

// ── URL Safety Validation utility route ──────────────────────────────────────

/**
 * GET /api/government-schemes/utils/validate-url?url=...
 *
 * Validates whether a URL is a safe, officially recognised government domain.
 * Returns the full UrlValidationResult with validity flag and rejection reason.
 */
schemesRouter.get('/utils/validate-url', (req: Request, res: Response) => {
  const url = req.query.url as string;
  if (!url) {
    res.status(400).json({ success: false, error: 'Query parameter "url" is required.' });
    return;
  }
  const result = auditGovUrl(url);
  res.status(200).json({ success: true, data: result });
});

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
 * GET /api/government-schemes/statistics
 *
 * Returns live-computed hero statistics derived directly from governmentSchemes.json.
 * Auto-updates whenever the JSON file is updated.
 */
schemesRouter.get('/statistics', schemesController.getStatistics);

/**
 * GET /api/government-schemes/recommendations?crop=...
 * 
 * Returns scheme recommendations tailored for a specific crop.
 */
schemesRouter.get('/recommendations', schemesController.getRecommendationsForCrop);

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
 * GET /api/government-schemes/:id/recommendations
 *
 * Returns top 5 related schemes based on similarity matching.
 */
schemesRouter.get('/:id/recommendations', schemesController.getRelatedSchemes);

/**
 * GET /api/government-schemes/:id
 *
 * Returns the full detail object for one scheme.
 * Responds with 404 if not found.
 */
schemesRouter.get('/:id', schemesController.getSchemeById);
