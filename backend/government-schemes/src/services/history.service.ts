/**
 * services/history.service.ts
 *
 * Business logic layer for managing recently viewed schemes.
 * Keeps track of the last 10 viewed schemes per user.
 */

import { SchemeHistory, GovernmentScheme } from '../types/scheme.types';
import { schemesService } from './schemes.service';

const _historyStore: SchemeHistory[] = [];
const MAX_HISTORY_PER_USER = 10;

export const historyService = {
  /**
   * Log that a user viewed a scheme.
   * If the scheme is already in history, it bumps to the top.
   * If the history exceeds 10 items, the oldest is removed.
   */
  logView(userId: string, schemeId: string): void {
    // Check if it already exists
    const existingIndex = _historyStore.findIndex(
      (h) => h.userId === userId && h.schemeId === schemeId
    );

    if (existingIndex !== -1) {
      // Remove it from current position to move it to the front
      _historyStore.splice(existingIndex, 1);
    }

    // Add to the front
    _historyStore.unshift({
      userId,
      schemeId,
      viewedAt: new Date().toISOString(),
    });

    // Enforce max 10 per user
    const userRecords = _historyStore.filter((h) => h.userId === userId);
    if (userRecords.length > MAX_HISTORY_PER_USER) {
      const oldestRecord = userRecords[userRecords.length - 1];
      const oldestIndex = _historyStore.findIndex(
        (h) => h.userId === oldestRecord.userId && h.schemeId === oldestRecord.schemeId
      );
      if (oldestIndex !== -1) {
        _historyStore.splice(oldestIndex, 1);
      }
    }
  },

  /**
   * Get the last 10 viewed schemes for a user, fully populated.
   */
  getRecentlyViewed(userId: string): GovernmentScheme[] {
    const userHistory = _historyStore
      .filter((h) => h.userId === userId)
      .sort((a, b) => new Date(b.viewedAt).getTime() - new Date(a.viewedAt).getTime());

    // Map to scheme data
    const populatedSchemes = userHistory
      .map((h) => schemesService.getSchemeById(h.schemeId))
      .filter((s): s is GovernmentScheme => s !== null);

    return populatedSchemes;
  },

  /**
   * Analytics: Get the most viewed schemes across all users.
   */
  getMostViewed(limit = 5): { schemeId: string; count: number }[] {
    const counts: Record<string, number> = {};
    for (const h of _historyStore) {
      counts[h.schemeId] = (counts[h.schemeId] || 0) + 1;
    }

    return Object.entries(counts)
      .map(([schemeId, count]) => ({ schemeId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  },
};
