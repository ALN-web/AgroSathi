/**
 * types/scheme.types.ts
 *
 * Domain type definitions for the Government Schemes service.
 * All interfaces and enums are defined here and shared across
 * controllers, services, and routes.
 */

// ── Core Domain Model ────────────────────────────────────────────────────────

export interface GovernmentScheme {
  id: string;
  name: string;
  shortDescription: string;
  fullDescription: string;
  schemeType: string[];
  benefits: string[];
  eligibility: string[];
  requiredDocuments: string[];
  officialWebsite: string | null;
  ministry: string;
  state: string;
  cropCategories: string[];
  financialBenefit: string;
  applicationMode: string;
  status: string;
  lastUpdated: string;
}

// ── API Response Shapes ──────────────────────────────────────────────────────

export interface SchemeSummary {
  id: string;
  name: string;
  shortDescription: string;
  schemeType: string[];
  ministry: string;
  state: string;
  status: string;
  officialWebsite: string | null;
}

export interface SchemeSearchResult {
  id: string;
  name: string;
  shortDescription: string;
  schemeType: string[];
  ministry: string;
  relevanceScore: number;
  officialWebsite: string | null;
}

// ── Query / Filter DTOs ──────────────────────────────────────────────────────

export interface SchemesListQuery {
  schemeType?: string;
  ministry?: string;
  state?: string;
  status?: string;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'lastUpdated';
  sortOrder?: 'asc' | 'desc';
}

export interface SchemesSearchQuery {
  q: string;
  schemeType?: string;
  state?: string;
  page?: number;
  limit?: number;
}

// ── Pagination Metadata ──────────────────────────────────────────────────────

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}
