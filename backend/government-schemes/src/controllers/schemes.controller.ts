/**
 * controllers/schemes.controller.ts
 *
 * HTTP request handlers for the Government Schemes API.
 *
 * Controller responsibilities:
 *   - Extract validated query/params from the request
 *   - Call schemesService
 *   - Return a standardised JSON response
 *
 * No business logic. No direct data access.
 */

import { Request, Response, NextFunction } from 'express';
import { schemesService } from '../services/schemes.service';
import {
  SchemesListQuery,
  SchemesSearchQuery,
} from '../types/scheme.types';
import {
  buildSuccessResponse,
  buildPaginatedResponse,
  buildErrorResponse,
} from '../utils/response.util';
import { HTTP_STATUS, ERROR_CODES } from '../constants/api';

export const schemesController = {
  /**
   * GET /api/government-schemes
   *
   * Returns a paginated list of scheme summaries.
   * Supports optional filtering by schemeType, state, ministry, status.
   * Supports sorting and pagination.
   */
  getAllSchemes: (req: Request, res: Response, next: NextFunction): void => {
    try {
      const query = req.query as unknown as SchemesListQuery;
      const { data, meta } = schemesService.getAllSchemes(query);
      res.status(HTTP_STATUS.OK).json(buildPaginatedResponse(data, meta));
    } catch (err) {
      console.error('[SchemesController] Error in getAllSchemes:', err);
      next(err);
    }
  },

  /**
   * GET /api/government-schemes/search?q=<query>
   *
   * Full-text search across scheme titles, descriptions, tags, etc.
   * Returns ranked results by relevance score with pagination.
   *
   * NOTE: This route must be registered BEFORE /:id so Express
   * does not interpret "search" as an ID.
   */
  searchSchemes: (req: Request, res: Response, next: NextFunction): void => {
    try {
      const query = req.query as unknown as SchemesSearchQuery;
      const { data, meta } = schemesService.searchSchemes(query);
      res.status(HTTP_STATUS.OK).json(buildPaginatedResponse(data, meta));
    } catch (err) {
      console.error('[SchemesController] Error in searchSchemes:', err);
      next(err);
    }
  },

  /**
   * GET /api/government-schemes/:id
   *
   * Returns the complete detail object for a single scheme.
   * Responds with 404 if no scheme matches the given ID.
   */
  getSchemeById: (req: Request, res: Response, next: NextFunction): void => {
    try {
      const { id } = req.params;
      const scheme = schemesService.getSchemeById(id);

      if (!scheme) {
        res.status(HTTP_STATUS.NOT_FOUND).json(
          buildErrorResponse(
            ERROR_CODES.SCHEME_NOT_FOUND,
            `Scheme with id "${id}" was not found.`
          )
        );
        return;
      }

      // Log history if user is authenticated (via mock header)
      const userId = req.headers['x-user-id'] as string;
      if (userId) {
        // We import dynamically or top level. Better to do top level, but for now we'll require it here to avoid replacing imports.
        // Wait, replace_file_content can't easily add top-level imports if I don't know the exact lines without replacing the whole file. 
        // Let's just use require for historyService inside the block to be safe and clean, or I will replace the whole file content block.
        // I'll require it locally to be safe.
        const { historyService } = require('../services/history.service');
        historyService.logView(userId.trim(), scheme.id);
      }

      res.status(HTTP_STATUS.OK).json(buildSuccessResponse(scheme));
    } catch (err) {
      console.error('[SchemesController] Error in getSchemeById:', err);
      next(err);
    }
  },

  /**
   * GET /api/government-schemes/meta/categories
   *
   * Returns a list of all available category values.
   * Useful for populating filter dropdowns without hardcoding values.
   */
  getCategories: (_req: Request, res: Response, next: NextFunction): void => {
    try {
      const categories = schemesService.getCategories();
      res.status(HTTP_STATUS.OK).json(buildSuccessResponse(categories));
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/government-schemes/meta/ministries
   *
   * Returns a list of all unique ministry names available in the dataset.
   */
  getMinistries: (_req: Request, res: Response, next: NextFunction): void => {
    try {
      const ministries = schemesService.getMinistries();
      res.status(HTTP_STATUS.OK).json(buildSuccessResponse(ministries));
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/government-schemes/statistics
   *
   * Returns live-computed hero statistics from the JSON data store.
   */
  getStatistics: (_req: Request, res: Response, next: NextFunction): void => {
    try {
      const stats = schemesService.getStatistics();
      res.status(HTTP_STATUS.OK).json(buildSuccessResponse(stats));
    } catch (err) {
      console.error('[SchemesController] Error in getStatistics:', err);
      next(err);
    }
  },

  /**
   * GET /api/government-schemes/featured
   *
   * Returns only the featured, active schemes.
   * Useful for the hero / highlights section of the frontend.
   */
  getFeaturedSchemes: (_req: Request, res: Response, next: NextFunction): void => {
    try {
      const featured = schemesService.getFeaturedSchemes();
      res.status(HTTP_STATUS.OK).json(buildSuccessResponse(featured));
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/government-schemes/recommendations?crop=...
   * 
   * Returns scheme recommendations specifically tailored for a predicted crop.
   */
  getRecommendationsForCrop: (req: Request, res: Response, next: NextFunction): void => {
    try {
      const crop = req.query.crop as string;
      if (!crop) {
        res.status(HTTP_STATUS.BAD_REQUEST).json(
          buildErrorResponse(ERROR_CODES.VALIDATION_ERROR, 'The "crop" query parameter is required.')
        );
        return;
      }

      const recommendations = schemesService.getRecommendationsForCrop(crop);
      res.status(HTTP_STATUS.OK).json(buildSuccessResponse(recommendations));
    } catch (err) {
      console.error('[SchemesController] Error in getRecommendationsForCrop:', err);
      next(err);
    }
  },

  /**
   * GET /api/government-schemes/:id/recommendations
   *
   * Returns top 5 related schemes based on similarity matching.
   */
  getRelatedSchemes: (req: Request, res: Response, next: NextFunction): void => {
    try {
      const { id } = req.params;
      // Dynamically import to avoid top-level circular dependencies if any
      const { recommendationService } = require('../services/recommendation.service');
      
      try {
        const related = recommendationService.getRelatedSchemes(id);
        res.status(HTTP_STATUS.OK).json(buildSuccessResponse(related));
      } catch (err: any) {
        res.status(HTTP_STATUS.NOT_FOUND).json(
          buildErrorResponse(ERROR_CODES.SCHEME_NOT_FOUND, err.message)
        );
      }
    } catch (err) {
      console.error('[SchemesController] Error in getRelatedSchemes:', err);
      next(err);
    }
  },
};
