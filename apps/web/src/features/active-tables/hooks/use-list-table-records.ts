/**
 * Hook for listing records from an active table
 *
 * API: POST /api/workspace/{workspaceId}/workflow/get/active_tables/{tableId}/records
 * Used for reference fields to fetch records for selection
 */

import { createActiveTablesApiClient } from '@/shared/api/active-tables-client';

/**
 * Record type for async select (simplified)
 */
export interface AsyncRecordSelectRecord {
  id: string;
  [key: string]: unknown;
}

/**
 * Request parameters for listing records
 */
export interface ListTableRecordsParams {
  /** Page number (1-based) */
  page: number;
  /** Records per page */
  per_page: number;
  /** Search query */
  search?: string;
}

/**
 * API response for listing records
 */
interface ListTableRecordsResponse {
  records: AsyncRecordSelectRecord[];
  total: number;
  page: number;
  per_page: number;
}

/**
 * Result of fetching records
 */
export interface FetchRecordsResult {
  records: AsyncRecordSelectRecord[];
  hasMore: boolean;
}

/**
 * Create a fetchRecords function for a specific table
 *
 * This returns a function that can be passed to FieldRenderer for async record selection
 *
 * @param workspaceId - Current workspace ID
 * @param tableId - Referenced table ID
 * @returns Function to fetch records with pagination and search
 *
 * @example
 * ```tsx
 * const fetchRecords = createFetchRecordsFunction(workspaceId, referencedTableId);
 *
 * // Use in FieldRenderer
 * <FieldRenderer
 *   fetchRecords={fetchRecords}
 *   ...
 * />
 * ```
 */
export function createFetchRecordsFunction(
  workspaceId: string,
  tableId: string,
): (query: string, page: number) => Promise<FetchRecordsResult> {
  return async (query: string, page: number): Promise<FetchRecordsResult> => {
    const client = createActiveTablesApiClient(workspaceId);

    // API: POST /api/workspace/{workspaceId}/workflow/get/active_tables/{tableId}/records
    const response = await client.post<ListTableRecordsResponse>(`/workflow/get/active_tables/${tableId}/records`, {
      page,
      per_page: 50, // Fetch 50 records at a time
      search: query || undefined,
    });

    const records = response.data.records || [];
    const total = response.data.total || 0;

    // Calculate if there are more records
    const hasMore = page * 50 < total;

    return { records, hasMore };
  };
}
