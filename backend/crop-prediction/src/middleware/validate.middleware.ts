/**
 * middleware/validate.middleware.ts
 *
 * Generic Joi request body validation middleware factory.
 * Usage: router.post('/predict', validateRequest(predictionRequestSchema), controller)
 *
 * TODO: wire up in routes once schemas are finalised.
 */

import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
// import { HTTP_STATUS, ERROR_CODES } from '../constants/api';

/**
 * Returns an Express middleware that validates req.body against the given Joi schema.
 * On failure, responds with 422 Unprocessable Entity.
 */
export function validateRequest(schema: Joi.ObjectSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });

    if (error) {
      res.status(422).json({
        success: false,
        error: {
          code: 'VALIDATION_FAILED',
          message: 'Input validation failed',
          details: error.details.map((d) => ({
            field: d.path.join('.'),
            message: d.message,
          })),
        },
      });
      return;
    }

    // Replace body with sanitised + coerced value
    req.body = value;
    next();
  };
}
