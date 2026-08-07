/**
 * controllers/bookmarks.controller.ts
 *
 * HTTP request handlers for the Bookmark API.
 * Extracts userId from the 'x-user-id' header to mock authentication.
 */

import { Request, Response, NextFunction } from 'express';
import { bookmarkService } from '../services/bookmark.service';
import { addBookmarkSchema } from '../schemas/bookmarks.schema';
import { buildSuccessResponse, buildErrorResponse } from '../utils/response.util';
import { HTTP_STATUS, ERROR_CODES } from '../constants/api';

/**
 * Helper to extract userId.
 * In a real app with auth middleware, this would come from req.user.id.
 */
function getUserId(req: Request): string | null {
  const userId = req.headers['x-user-id'] as string;
  return userId ? userId.trim() : null;
}

export const bookmarksController = {
  /**
   * POST /api/government-schemes/bookmarks
   * Body: { schemeId: string }
   * Header: x-user-id
   */
  addBookmark: (req: Request, res: Response, next: NextFunction): void => {
    try {
      const userId = getUserId(req);
      if (!userId) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json(
          buildErrorResponse(ERROR_CODES.UNAUTHORIZED, 'Missing "x-user-id" header.')
        );
        return;
      }

      const { error, value } = addBookmarkSchema.validate(req.body);
      if (error) {
        res.status(HTTP_STATUS.BAD_REQUEST).json(
          buildErrorResponse(ERROR_CODES.VALIDATION_ERROR, error.message)
        );
        return;
      }

      try {
        const bookmark = bookmarkService.addBookmark(userId, value.schemeId);
        res.status(HTTP_STATUS.CREATED).json(buildSuccessResponse(bookmark));
      } catch (err: any) {
        // Handle scheme not found
        res.status(HTTP_STATUS.NOT_FOUND).json(
          buildErrorResponse(ERROR_CODES.SCHEME_NOT_FOUND, err.message)
        );
      }
    } catch (err) {
      console.error('[BookmarksController] Error in addBookmark:', err);
      next(err);
    }
  },

  /**
   * DELETE /api/government-schemes/bookmarks/:schemeId
   * Header: x-user-id
   */
  removeBookmark: (req: Request, res: Response, next: NextFunction): void => {
    try {
      const userId = getUserId(req);
      if (!userId) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json(
          buildErrorResponse(ERROR_CODES.UNAUTHORIZED, 'Missing "x-user-id" header.')
        );
        return;
      }

      const { schemeId } = req.params;
      if (!schemeId) {
        res.status(HTTP_STATUS.BAD_REQUEST).json(
          buildErrorResponse(ERROR_CODES.VALIDATION_ERROR, 'schemeId parameter is required.')
        );
        return;
      }

      bookmarkService.removeBookmark(userId, schemeId);
      res.status(HTTP_STATUS.OK).json(buildSuccessResponse({ message: 'Bookmark removed successfully.' }));
    } catch (err) {
      console.error('[BookmarksController] Error in removeBookmark:', err);
      next(err);
    }
  },

  /**
   * GET /api/government-schemes/bookmarks
   * Header: x-user-id
   */
  getUserBookmarks: (req: Request, res: Response, next: NextFunction): void => {
    try {
      const userId = getUserId(req);
      if (!userId) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json(
          buildErrorResponse(ERROR_CODES.UNAUTHORIZED, 'Missing "x-user-id" header.')
        );
        return;
      }

      const bookmarks = bookmarkService.getUserBookmarks(userId);
      res.status(HTTP_STATUS.OK).json(buildSuccessResponse(bookmarks));
    } catch (err) {
      console.error('[BookmarksController] Error in getUserBookmarks:', err);
      next(err);
    }
  },
};
