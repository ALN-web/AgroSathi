/**
 * helpers/response.helper.ts
 *
 * Utility functions for building consistent API response objects.
 * Used by controllers to avoid duplicating response shapes.
 */

import { v4 as uuidv4 } from 'uuid';

export function buildSuccessResponse<T>(data: T) {
  return {
    success: true as const,
    requestId: uuidv4(),
    timestamp: new Date().toISOString(),
    data,
  };
}

export function buildErrorResponse(code: string, message: string, details?: unknown) {
  return {
    success: false as const,
    requestId: uuidv4(),
    timestamp: new Date().toISOString(),
    error: { code, message, ...(details !== undefined && { details }) },
  };
}
