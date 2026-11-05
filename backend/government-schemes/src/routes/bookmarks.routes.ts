/**
 * routes/bookmarks.routes.ts
 *
 * Express router for the Government Schemes Bookmarks REST API.
 * All routes prefixed with /api/government-schemes/bookmarks
 */

import { Router } from 'express';
import { bookmarksController } from '../controllers/bookmarks.controller';

export const bookmarksRouter = Router();

/**
 * GET /api/government-schemes/bookmarks
 * Returns all bookmarked schemes for the user.
 */
bookmarksRouter.get('/', bookmarksController.getUserBookmarks);

/**
 * POST /api/government-schemes/bookmarks
 * Adds a scheme to the user's bookmarks.
 */
bookmarksRouter.post('/', bookmarksController.addBookmark);

/**
 * DELETE /api/government-schemes/bookmarks/:schemeId
 * Removes a scheme from the user's bookmarks.
 */
bookmarksRouter.delete('/:schemeId', bookmarksController.removeBookmark);
