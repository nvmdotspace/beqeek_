/**
 * API Response type definitions
 *
 * Note: These are provided for convenience but the package is API-agnostic.
 * Parent applications should handle API calls and pass data via props.
 */

import type { WorkGroup, Table } from './common.js';
import type { TableRecord } from './record.js';

// ============================================
// Generic Response
// ============================================

/**
 * Generic paginated response
 */
export interface PaginatedResponse<T> {
  /** Response data array */
  data: T[];

  /** Maximum items per page */
  limit?: number;

  /** Sort configuration */
  sort?: Record<string, unknown>;
}

// ============================================
// Work Groups Response
// ============================================

/**
 * Response from get work groups API
 */
export interface WorkGroupsResponse extends PaginatedResponse<WorkGroup> {}

// ============================================
// Tables Response
// ============================================

/**
 * Response from get tables API
 */
export interface TablesResponse extends PaginatedResponse<Table> {}

// ============================================
// Records Response
// ============================================

/**
 * Response from get records API (supports cursor pagination)
 */
export interface RecordsResponse {
  /** Record data array */
  data: TableRecord[];

  /** Next cursor for pagination */
  next_id?: string | null;

  /** Previous cursor for pagination */
  previous_id?: string | null;

  /** Maximum items per page */
  limit?: number;

  /** Offset for page-based pagination */
  offset?: number;
}

// ============================================
// Legacy Type Aliases (for backward compatibility)
// ============================================

/**
 * @deprecated Use WorkGroupsResponse instead
 */
export type ActiveWorkGroupsResponse = WorkGroupsResponse;

/**
 * @deprecated Use TablesResponse instead
 */
export type ActiveTablesResponse = TablesResponse;

/**
 * @deprecated Use RecordsResponse instead
 */
export type ActiveRecordsResponse = RecordsResponse;
