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

// ── POST /api/government-schemes/eligibility ─────────────────────────────────

export const eligibilitySchema = Joi.object({
  state: Joi.string().trim().min(2).max(100).required().messages({
    'any.required': '"state" is required',
  }),

  farmSize: Joi.number().positive().required().messages({
    'any.required': '"farmSize" (in hectares) is required',
    'number.positive': '"farmSize" must be a positive number',
  }),

  farmerType: Joi.string()
    .trim()
    .valid('Individual', 'Tenant', 'SHG', 'FPO')
    .required()
    .messages({
      'any.required': '"farmerType" is required',
      'any.only': '"farmerType" must be one of: Individual, Tenant, SHG, FPO',
    }),

  crop: Joi.string().trim().min(2).max(100).required().messages({
    'any.required': '"crop" is required',
  }),

  annualIncome: Joi.number().min(0).required().messages({
    'any.required': '"annualIncome" (in INR) is required',
  }),

  gender: Joi.string()
    .trim()
    .valid('Male', 'Female', 'Other')
    .required()
    .messages({
      'any.required': '"gender" is required',
      'any.only': '"gender" must be one of: Male, Female, Other',
    }),

  age: Joi.number().integer().min(18).max(100).required().messages({
    'any.required': '"age" is required',
    'number.min': 'Minimum age is 18',
  }),

  caste: Joi.string()
    .trim()
    .valid('SC', 'ST', 'OBC', 'General')
    .required()
    .messages({
      'any.required': '"caste" is required',
      'any.only': '"caste" must be one of: SC, ST, OBC, General',
    }),

  landOwnership: Joi.string()
    .trim()
    .valid('Owned', 'Leased', 'Tenant')
    .required()
    .messages({
      'any.required': '"landOwnership" is required',
      'any.only': '"landOwnership" must be one of: Owned, Leased, Tenant',
    }),
});

