/**
 * schemas/schemes.schema.ts
 *
 * Joi validation schemas for query parameters accepted by the
 * Government Schemes REST API endpoints.
 */

import Joi from 'joi';
import { config } from '../config';

// ── GET /api/government-schemes ──────────────────────────────────────────────

export const listSchemesSchema = Joi.object({
  schemeType: Joi.string().trim().optional(),
  
  ministry: Joi.string().trim().max(150).optional(),
  
  state: Joi.string().trim().optional(),
  
  status: Joi.string().trim().optional(),

  page: Joi.number()
    .integer()
    .min(1)
    .default(config.pagination.defaultPage)
    .optional(),

  limit: Joi.number()
    .integer()
    .min(1)
    .max(config.pagination.maxLimit)
    .default(config.pagination.defaultLimit)
    .optional(),

  sortBy: Joi.string().valid('name', 'lastUpdated').default('lastUpdated').optional(),

  sortOrder: Joi.string().valid('asc', 'desc').default('desc').optional(),
});

// ── GET /api/government-schemes/search ──────────────────────────────────────

export const searchSchemesSchema = Joi.object({
  q: Joi.string().trim().min(2).max(200).required().messages({
    'string.min': 'Search query must be at least 2 characters',
    'string.max': 'Search query must not exceed 200 characters',
    'any.required': 'Query parameter "q" is required',
  }),

  schemeType: Joi.string().trim().optional(),
  
  state: Joi.string().trim().optional(),

  page: Joi.number()
    .integer()
    .min(1)
    .default(config.pagination.defaultPage)
    .optional(),

  limit: Joi.number()
    .integer()
    .min(1)
    .max(config.pagination.maxLimit)
    .default(config.pagination.defaultLimit)
    .optional(),
});
