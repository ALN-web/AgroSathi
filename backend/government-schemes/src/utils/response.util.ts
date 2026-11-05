/**
 * utils/response.util.ts
 *
 * Factory functions for standardised JSON API responses.
 * Every endpoint in the Government Schemes service uses these helpers
 * to ensure a consistent response envelope.
 *
 * Success envelope:
 *   { success: true, data: T, meta?: PaginationMeta }
 *
 * Error envelope:
 *   { success: false, error: { code, message, details? } }
 */

import { PaginationMeta } from '../types/scheme.types';

// ── Success Responses ────────────────────────────────────────────────────────

export function buildSuccessResponse<T>(data: T): {
  success: true;
  data: T;
} {
  return { success: true, data };
}

export function buildPaginatedResponse<T>(
  data: T[],
  meta: PaginationMeta
): {
  success: true;
  data: T[];
  meta: PaginationMeta;
} {
  return { success: true, data, meta };
}

// ── Error Responses ──────────────────────────────────────────────────────────

export function buildErrorResponse(
  code: string,
  message: string,
  details?: unknown
): {
  success: false;
  error: { code: string; message: string; details?: unknown };
} {
  return {
    success: false,
    error: {
      code,
      message,
      ...(details !== undefined && { details }),
    },
  };
}

// ── Pagination Helper ────────────────────────────────────────────────────────

export function buildPaginationMeta(
  page: number,
  limit: number,
  total: number
): PaginationMeta {
  const totalPages = Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}
