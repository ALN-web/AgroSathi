/**
 * services/schemes.service.ts
 *
 * Business logic layer for the Government Schemes service.
 *
 * This service is the ONLY layer that touches the data source.
 * Controllers must NOT import from data/ directly.
 *
 * Responsibilities:
 *  - Load scheme data from JSON file on startup
 *  - Apply filters (schemeType, state, ministry, status)
 *  - Apply pagination
 *  - Delegate full-text search to search.util
 *  - Return strongly-typed results
 */

import fs from 'fs';
import path from 'path';
import {
  GovernmentScheme,
  SchemeSummary,
  SchemesListQuery,
  SchemesSearchQuery,
  SchemeSearchResult,
  PaginationMeta
} from '../types/scheme.types';
import { searchSchemes } from '../utils/search.util';
import { parsePagination, paginate } from '../utils/pagination.util';
import { buildPaginationMeta } from '../utils/response.util';
import { getValidatedGovUrl } from '../utils/url.util';

// ── In-memory data store (simulates a repository layer) ──────────────────────
// Loaded once from JSON during module initialization.
let _store: GovernmentScheme[] = [];

try {
  const dataPath = path.resolve(__dirname, '../../data/governmentSchemes.json');
  const fileContent = fs.readFileSync(dataPath, 'utf-8');
  _store = JSON.parse(fileContent);
  console.info(`[GovernmentSchemes] Successfully loaded ${_store.length} schemes from JSON database.`);
} catch (error) {
  console.error('[GovernmentSchemes] Failed to load schemes database from JSON:', error);
  // Continue with empty store or fail fast based on requirements.
}

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
    let results = [..._store];

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
    const scheme = _store.find((s) => s.id === id);
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
    let candidates = [..._store];

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
    _store.forEach((s) => s.schemeType.forEach((c) => set.add(c)));
    return Array.from(set).sort();
  },

  /**
   * Returns a list of all unique ministries available in the data store.
   */
  getMinistries(): string[] {
    const set = new Set<string>(_store.map((s) => s.ministry));
    return Array.from(set).sort();
  },

  /**
   * Returns active schemes only (simulating 'featured' behavior).
   */
  getFeaturedSchemes(): SchemeSummary[] {
    return _store.filter((s) => s.status.toLowerCase() === 'active').map(toSummary);
  },
};
