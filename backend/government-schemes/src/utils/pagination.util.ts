/**
 * utils/pagination.util.ts
 *
 * Helpers to parse and apply pagination parameters from
 * Express query strings.
 */

import { config } from '../config';

export interface ParsedPagination {
  page: number;
  limit: number;
  skip: number;
}

/**
 * Parse page/limit from raw query string values.
 * Falls back to config defaults and enforces the maxLimit ceiling.
 */
export function parsePagination(
  rawPage: unknown,
  rawLimit: unknown
): ParsedPagination {
  const page = Math.max(1, parseInt(String(rawPage ?? config.pagination.defaultPage), 10) || config.pagination.defaultPage);
  const limit = Math.min(
    config.pagination.maxLimit,
    Math.max(1, parseInt(String(rawLimit ?? config.pagination.defaultLimit), 10) || config.pagination.defaultLimit)
  );

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
}

/**
 * Slice an array using pre-computed skip / limit values.
 */
export function paginate<T>(items: T[], skip: number, limit: number): T[] {
  return items.slice(skip, skip + limit);
}
