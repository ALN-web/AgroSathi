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
  eligibilityCriteria?: EligibilityCriteria;
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

export interface CropRecommendation {
  id: string;
  name: string;
  shortDescription: string;
  schemeType: string[];
  ministry: string;
  financialBenefit: string;
  applicationMode: string;
  officialWebsite: string | null;
  relevanceTag: string; // e.g. "Crop Match", "Insurance", "Irrigation", "Fertilizer"
  relevanceScore: number;
}

export interface RelatedScheme {
  id: string;
  name: string;
  shortDescription: string;
  schemeType: string[];
  ministry: string;
  officialWebsite: string | null;
  similarityScore: number;
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

// ── Eligibility Engine DTOs ──────────────────────────────────────────────────

export interface EligibilityCriteria {
  state?: string[];
  minLandSize?: number; // in hectares
  maxLandSize?: number; // in hectares
  farmerType?: string[]; // 'Individual', 'FPO', 'SHG', etc.
  cropCategories?: string[];
  maxIncome?: number; // annual
  gender?: string[]; // 'Male', 'Female', 'Other'
  minAge?: number;
  maxAge?: number;
  caste?: string[]; // 'SC', 'ST', 'OBC', 'General'
  landOwnership?: string[]; // 'Owned', 'Leased', 'Tenant'
}

export interface FarmerProfile {
  state: string;
  farmSize: number;
  farmerType: string;
  crop: string;
  annualIncome: number;
  gender: string;
  age: number;
  caste: string;
  landOwnership: string;
  // Optional profile fields stored for modular reuse
  district?: string;
  irrigationType?: string;
  secondaryCrop?: string;
  organicFarming?: string;
  livestock?: string;
  existingBenefits?: string;
}

export interface EligibilityResult {
  schemeId: string;
  schemeName: string;
  eligibilityStatus: 'Eligible' | 'Possibly Eligible' | 'Not Eligible';
  eligibilityPercentage: number;
  reasons: string[];
}

// ── Bookmark DTOs ────────────────────────────────────────────────────────────

export interface Bookmark {
  userId: string;
  schemeId: string;
  createdAt: string;
}

// ── History DTOs ─────────────────────────────────────────────────────────────

export interface SchemeHistory {
  userId: string;
  schemeId: string;
  viewedAt: string;
}

// ── Sync / Adapter DTOs ─────────────────────────────────────────────────────────

/** Result returned after a sync operation completes. */
export interface SyncResult {
  success: boolean;
  count: number;
  source: string;
  syncedAt: string;
  error?: string;
}

/** Metadata about the current state of the sync service. */
export interface SyncInfo {
  lastSyncAt: string | null;
  source: string | null;
  totalRecords: number;
  status: 'idle' | 'syncing' | 'error' | 'ready';
  lastError?: string;
}

/** Contract that every data-source adapter must implement. */
export interface ISyncAdapter {
  /** Human-readable adapter name, e.g. "JSON File", "Government API". */
  readonly name: string;
  /** Source identifier (file path, endpoint URL, db name, etc.) */
  readonly source: string;
  /** Load and return the full list of schemes from this data source. */
  load(): Promise<GovernmentScheme[]>;
}


