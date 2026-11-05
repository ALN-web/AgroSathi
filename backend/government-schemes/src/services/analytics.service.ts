/**
 * services/analytics.service.ts
 *
 * Aggregates analytics across the different modules (schemes, history, bookmarks).
 */

import { schemesService } from './schemes.service';
import { historyService } from './history.service';
import { bookmarkService } from './bookmark.service';

export const analyticsService = {
  /**
   * Generates a comprehensive analytics report.
   */
  getAnalyticsReport() {
    // We use a high limit to fetch all schemes to count them
    const allSchemesResponse = schemesService.getAllSchemes({ limit: 1000 });
    const allSchemes = allSchemesResponse.data;

    let total = allSchemes.length;
    let central = 0;
    let state = 0;
    let insurance = 0;
    let technology = 0;
    let financial = 0;

    for (const s of allSchemes) {
      const typeStr = s.schemeType.map((t) => t.toLowerCase()).join(' ');
      if (typeStr.includes('central')) central++;
      if (typeStr.includes('state')) state++;
      if (typeStr.includes('insurance')) insurance++;
      if (typeStr.includes('technology')) technology++;
      if (typeStr.includes('financial') || typeStr.includes('credit')) financial++;
    }

    // Map helper to attach scheme names to counts
    const mapWithNames = (items: { schemeId: string; count: number }[]) => {
      return items.map((item) => {
        const scheme = schemesService.getSchemeById(item.schemeId);
        return {
          id: item.schemeId,
          name: scheme ? scheme.name : 'Unknown Scheme',
          count: item.count,
        };
      });
    };

    const mostViewed = mapWithNames(historyService.getMostViewed(5));
    const mostBookmarked = mapWithNames(bookmarkService.getMostBookmarked(5));
    const mostRecommended = mapWithNames(schemesService.getMostRecommended(5));

    return {
      overview: {
        totalSchemes: total,
        centralSchemes: central,
        stateSchemes: state,
        insuranceSchemes: insurance,
        technologySchemes: technology,
        financialSchemes: financial,
      },
      leaderboards: {
        mostViewed,
        mostBookmarked,
        mostRecommended,
      },
      generatedAt: new Date().toISOString(),
    };
  },
};
