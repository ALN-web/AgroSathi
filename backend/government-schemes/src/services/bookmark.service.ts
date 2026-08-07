/**
 * services/bookmark.service.ts
 *
 * Business logic layer for managing user bookmarks.
 */

import { Bookmark, GovernmentScheme } from '../types/scheme.types';
import { schemesService } from './schemes.service';

// In-memory data store for bookmarks.
// In a real application, this would be a database collection/table.
const _bookmarksStore: Bookmark[] = [];

export const bookmarkService = {
  /**
   * Add a scheme to user's bookmarks.
   */
  addBookmark(userId: string, schemeId: string): Bookmark {
    // Validate that the scheme actually exists
    const scheme = schemesService.getSchemeById(schemeId);
    if (!scheme) {
      throw new Error(`Scheme with id "${schemeId}" does not exist.`);
    }

    // Check if it already exists
    const existing = _bookmarksStore.find(
      (b) => b.userId === userId && b.schemeId === schemeId
    );
    if (existing) {
      return existing; // Idempotent
    }

    const newBookmark: Bookmark = {
      userId,
      schemeId,
      createdAt: new Date().toISOString(),
    };

    _bookmarksStore.push(newBookmark);
    return newBookmark;
  },

  /**
   * Remove a scheme from user's bookmarks.
   */
  removeBookmark(userId: string, schemeId: string): void {
    const index = _bookmarksStore.findIndex(
      (b) => b.userId === userId && b.schemeId === schemeId
    );

    if (index !== -1) {
      _bookmarksStore.splice(index, 1);
    }
  },

  /**
   * Get all bookmarks for a specific user, including the populated scheme data.
   */
  getUserBookmarks(userId: string): GovernmentScheme[] {
    // Get all bookmark records for the user, sort by newest first
    const userBookmarks = _bookmarksStore
      .filter((b) => b.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Map to actual scheme data (filtering out any schemes that might have been deleted)
    const populatedSchemes = userBookmarks
      .map((b) => schemesService.getSchemeById(b.schemeId))
      .filter((s): s is GovernmentScheme => s !== null);

    return populatedSchemes;
  },

  /**
   * Analytics: Get the most bookmarked schemes.
   */
  getMostBookmarked(limit = 5): { schemeId: string; count: number }[] {
    const counts: Record<string, number> = {};
    for (const b of _bookmarksStore) {
      counts[b.schemeId] = (counts[b.schemeId] || 0) + 1;
    }

    return Object.entries(counts)
      .map(([schemeId, count]) => ({ schemeId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  },
};
