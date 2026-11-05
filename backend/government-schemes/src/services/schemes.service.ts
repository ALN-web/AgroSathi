/**
 * services/schemes.service.ts
 *
 * Business logic layer for the Government Schemes service.
 *
 * DATA ACCESS: This service NO LONGER reads from JSON directly.
 * All data is retrieved from syncService.getStore(), which acts as
 * the single source of truth. Swapping the underlying data source
 * (API, CSV, Database) only requires changing the adapter in sync.service.ts.
 *
 * Responsibilities:
 *  - Apply filters (schemeType, state, ministry, status)
 *  - Apply pagination
 *  - Delegate full-text search to search.util
 *  - Return strongly-typed results
 */

import {
  GovernmentScheme,
  SchemeSummary,
  SchemesListQuery,
  SchemesSearchQuery,
  SchemeSearchResult,
  PaginationMeta,
  CropRecommendation
} from '../types/scheme.types';
import { searchSchemes } from '../utils/search.util';
import { parsePagination, paginate } from '../utils/pagination.util';
import { buildPaginationMeta } from '../utils/response.util';
import { getValidatedGovUrl } from '../utils/url.util';
import { syncService } from './sync.service';

// ── Data access helper ────────────────────────────────────────────────────────
// All service methods call this instead of reading _store directly.
// This means future sync/reload operations are immediately reflected.
const _store = () => syncService.getStore();

// ── Analytics trackers ───────────────────────────────────────────────────────
const _recommendationCounts: Record<string, number> = {};

// ── Projection helper ────────────────────────────────────────────────────────

function toSummary(scheme: GovernmentScheme): SchemeSummary {
  return {
    id: scheme.id,
    name: scheme.name,
    shortDescription: scheme.shortDescription,
    schemeType: scheme.schemeType,
    ministry: scheme.ministry,
    state: scheme.state,
    status: scheme.status,
    officialWebsite: getValidatedGovUrl(scheme.officialWebsite),
  };
}

// ── Service ──────────────────────────────────────────────────────────────────

export const schemesService = {
  /**
   * GET /api/government-schemes
   * Returns a paginated, filtered list of scheme summaries.
   */
  getAllSchemes(
    query: SchemesListQuery
  ): { data: SchemeSummary[]; meta: PaginationMeta } {
    let results = [..._store()];

    // ── Apply filters ────────────────────────────────────────────────────────

    if (query.schemeType) {
      const type = query.schemeType.toLowerCase();
      results = results.filter((s) =>
        s.schemeType.some((c) => c.toLowerCase().includes(type))
      );
    }

    if (query.state) {
      const state = query.state.toLowerCase();
      results = results.filter((s) => s.state.toLowerCase() === state);
    }

    if (query.ministry) {
      const min = query.ministry.toLowerCase();
      results = results.filter((s) => s.ministry.toLowerCase().includes(min));
    }

    if (query.status) {
      const status = query.status.toLowerCase();
      results = results.filter((s) => s.status.toLowerCase() === status);
    }

    // ── Apply sorting ────────────────────────────────────────────────────────

    const sortBy = query.sortBy ?? 'lastUpdated';
    const sortOrder = query.sortOrder ?? 'desc';

    results.sort((a, b) => {
      let aVal: string | number = a.lastUpdated;
      let bVal: string | number = b.lastUpdated;

      if (sortBy === 'name') {
        aVal = a.name.toLowerCase();
        bVal = b.name.toLowerCase();
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    // ── Apply pagination ─────────────────────────────────────────────────────

    const { page, limit, skip } = parsePagination(query.page, query.limit);
    const total = results.length;
    const paginatedData = paginate(results, skip, limit);

    return {
      data: paginatedData.map(toSummary),
      meta: buildPaginationMeta(page, limit, total),
    };
  },

  /**
   * GET /api/government-schemes/:id
   * Returns a single complete scheme by ID.
   */
  getSchemeById(id: string): GovernmentScheme | null {
    const scheme = _store().find((s) => s.id === id);
    if (!scheme) return null;
    
    return {
      ...scheme,
      officialWebsite: getValidatedGovUrl(scheme.officialWebsite),
    };
  },

  /**
   * GET /api/government-schemes/search?q=...
   * Full-text search across schemes with relevance ranking + pagination.
   */
  searchSchemes(
    query: SchemesSearchQuery
  ): { data: SchemeSearchResult[]; meta: PaginationMeta } {
    let candidates = [..._store()];

    // Pre-filter by schemeType / state if provided
    if (query.schemeType) {
      const type = query.schemeType.toLowerCase();
      candidates = candidates.filter((s) =>
        s.schemeType.some((c) => c.toLowerCase().includes(type))
      );
    }

    if (query.state) {
      const state = query.state.toLowerCase();
      candidates = candidates.filter((s) => s.state.toLowerCase() === state);
    }

    const ranked = searchSchemes(candidates, query.q);

    const { page, limit, skip } = parsePagination(query.page, query.limit);
    const total = ranked.length;
    const paginatedData = paginate(ranked, skip, limit);

    return {
      data: paginatedData,
      meta: buildPaginationMeta(page, limit, total),
    };
  },

  /**
   * Returns a list of all unique categories/types available in the data store.
   * Useful for building filter dropdowns on the frontend.
   */
  getCategories(): string[] {
    const set = new Set<string>();
    _store().forEach((s) => s.schemeType.forEach((c) => set.add(c)));
    return Array.from(set).sort();
  },

  /**
   * Returns a list of all unique ministries available in the data store.
   */
  getMinistries(): string[] {
    const set = new Set<string>(_store().map((s) => s.ministry));
    return Array.from(set).sort();
  },

  /**
   * GET /api/government-schemes/statistics
   *
   * Computes and returns live hero statistics directly from the JSON data store.
   * Updates automatically whenever new schemes are added to governmentSchemes.json.
   * Never returns hardcoded values.
   */
  getStatistics() {
    let totalSchemes = 0;
    let centralSchemes = 0;
    let stateSchemes = 0;
    let technologySchemes = 0;
    let insuranceSchemes = 0;
    let financialSchemes = 0;
    const statesSet = new Set<string>();
    const recentlyAdded: Array<{ id: string; name: string; addedOn: string }> = [];

    for (const s of _store()) {
      totalSchemes++;

      const typeStr = s.schemeType.map((t) => t.toLowerCase()).join(' ');

      if (typeStr.includes('central')) centralSchemes++;
      if (typeStr.includes('state scheme'))  stateSchemes++;
      if (typeStr.includes('technology'))    technologySchemes++;
      if (typeStr.includes('insurance'))     insuranceSchemes++;
      if (typeStr.includes('financial') || typeStr.includes('credit')) financialSchemes++;

      // Accumulate distinct states/coverage areas
      if (s.state && s.state.toLowerCase() !== 'all india') {
        statesSet.add(s.state);
      }

      recentlyAdded.push({ id: s.id, name: s.name, addedOn: s.lastUpdated });
    }

    // "All India" schemes count as covering all 28+8 states/UTs
    const allIndiaCount = _store().filter(s => s.state.toLowerCase() === 'all india').length;
    const statesCovered = allIndiaCount > 0 ? 36 : statesSet.size; // 36 = 28 states + 8 UTs

    // Sort by lastUpdated descending, take top 3
    recentlyAdded.sort((a, b) => new Date(b.addedOn).getTime() - new Date(a.addedOn).getTime());
    const topRecentlyAdded = recentlyAdded.slice(0, 3);

    return {
      totalSchemes,
      centralSchemes,
      stateSchemes,
      technologySchemes,
      insuranceSchemes,
      financialSchemes,
      statesCovered,
      recentlyAdded: topRecentlyAdded,
      computedAt: new Date().toISOString(),
    };
  },

  /**
   * Returns active schemes only (simulating 'featured' behavior).
   */
  getFeaturedSchemes(): SchemeSummary[] {
    return _store().filter((s) => s.status.toLowerCase() === 'active').map(toSummary);
  },

  /**
   * GET /api/government-schemes/recommendations?crop=...
   * Returns tailored recommendations based on a predicted crop.
   */
  getRecommendationsForCrop(crop: string): CropRecommendation[] {
    if (!crop) return [];

    const cropName = crop.toLowerCase();
    const recommendations: CropRecommendation[] = [];

    // Filter active schemes
    const activeSchemes = _store().filter(s => s.status.toLowerCase() === 'active');

    for (const scheme of activeSchemes) {
      let score = 0;
      let tag = '';

      // Check if it's explicitly for this crop
      const isCropMatch = scheme.cropCategories.some(c => 
        c.toLowerCase() === cropName || 
        c.toLowerCase() === 'all crops'
      );

      if (isCropMatch) {
         score += 5;
      } else {
         // If it doesn't match the crop category and isn't 'all crops', we skip it.
         continue; 
      }

      // Check scheme type for relevance tagging and additional scoring
      const typesStr = scheme.schemeType.map(t => t.toLowerCase()).join(' ');
      
      if (typesStr.includes('insurance')) {
        tag = 'Crop Insurance';
        score += 3;
      } else if (typesStr.includes('irrigation')) {
        tag = 'Irrigation Support';
        score += 3;
      } else if (typesStr.includes('organic')) {
        tag = 'Organic Farming';
        score += 3;
      } else if (typesStr.includes('financial') || typesStr.includes('credit')) {
        tag = 'Financial Support';
        score += 2;
      } else if (typesStr.includes('soil') || typesStr.includes('technology')) {
        tag = 'Soil & Tech';
        score += 2;
      } else {
        tag = 'General Scheme';
      }

      // Explicit name matching boosts
      if (scheme.name.toLowerCase().includes('pm-kisan') || scheme.name.toLowerCase().includes('samman nidhi')) {
         score += 5;
         tag = 'Direct Benefit';
      }

      recommendations.push({
        id: scheme.id,
        name: scheme.name,
        shortDescription: scheme.shortDescription,
        schemeType: scheme.schemeType,
        ministry: scheme.ministry,
        financialBenefit: scheme.financialBenefit,
        applicationMode: scheme.applicationMode,
        officialWebsite: getValidatedGovUrl(scheme.officialWebsite),
        relevanceTag: tag,
        relevanceScore: score
      });
    }

    // Sort by relevance score descending
    const topRecs = recommendations
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 5); // Return top 5

    // Track analytics
    for (const rec of topRecs) {
      _recommendationCounts[rec.id] = (_recommendationCounts[rec.id] || 0) + 1;
    }

    return topRecs;
  },

  /**
   * Analytics: Get most recommended schemes
   */
  getMostRecommended(limit = 5): { schemeId: string; count: number }[] {
    return Object.entries(_recommendationCounts)
      .map(([schemeId, count]) => ({ schemeId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }
};
