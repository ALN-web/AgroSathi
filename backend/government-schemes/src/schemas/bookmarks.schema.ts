/**
 * schemas/bookmarks.schema.ts
 *
 * Joi validation schema for Bookmarks.
 */

import Joi from 'joi';

export const addBookmarkSchema = Joi.object({
  schemeId: Joi.string().trim().required().messages({
    'any.required': '"schemeId" is required',
    'string.empty': '"schemeId" cannot be empty',
  }),
});
