/**
 * middleware/validate.middleware.ts
 *
 * Query-string validation middleware using Joi.
 * Validates GET query parameters before they reach the controller.
 *
 * Usage:
 *   router.get('/search', validateQuery(searchSchema), controller.search);
 */

import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { buildErrorResponse } from '../utils/response.util';
import { HTTP_STATUS, ERROR_CODES } from '../constants/api';

/**
 * Returns an Express middleware that validates req.query against the given schema.
 */
export function validateQuery(schema: Joi.ObjectSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      allowUnknown: false,
      convert: true,
    });

    if (error) {
      const details = error.details.map((d) => ({
        field: d.path.join('.'),
        message: d.message,
      }));

      res.status(HTTP_STATUS.BAD_REQUEST).json(
        buildErrorResponse(ERROR_CODES.VALIDATION_ERROR, 'Invalid query parameters', details)
      );
      return;
    }

    // Replace req.query with the sanitised / coerced value
    req.query = value as Record<string, string>;
    next();
  };
}
