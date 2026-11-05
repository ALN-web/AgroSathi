/**
 * constants/api.ts
 *
 * Shared HTTP status codes and error code constants for the
 * Government Schemes service.
 */

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  UNPROCESSABLE: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  SCHEME_NOT_FOUND: 'SCHEME_NOT_FOUND',
  INVALID_QUERY: 'INVALID_QUERY',
  SEARCH_FAILED: 'SEARCH_FAILED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
} as const;

export const API_VERSION = 'v1' as const;
export const SERVICE_NAME = 'government-schemes' as const;
