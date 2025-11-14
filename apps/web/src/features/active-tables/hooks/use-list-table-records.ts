/**
 * Hook for listing records from an active table
 *
 * API: POST /api/workspace/{workspaceId}/workflow/get/active_tables/{tableId}/records
 * Used for reference fields to fetch records for selection
 *
 * IMPORTANT: This uses cursor-based pagination and decryption from use-infinite-active-table-records
 * to ensure encrypted data is properly decrypted before display
 */

import { fetchActiveTableRecords } from '../api/active-records-api';
import { decryptRecords } from '@workspace/active-tables-core';
import type { Table } from '@workspace/active-tables-core';

/**
 * Record type for async select (simplified)
 */
export interface AsyncRecordSelectRecord {
  id: string;
  [key: string]: unknown;
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
 * Uses the same API as use-infinite-active-table-records to ensure proper decryption
 *
 * @param workspaceId - Current workspace ID
 * @param tableId - Referenced table ID
 * @param additionalCondition - Optional filter condition (e.g., "status='active'")
 * @param table - Table config (for decryption)
 * @param encryptionKey - Encryption key for E2EE tables
 * @returns Function to fetch records with pagination and search
 *
 * @example
 * ```tsx
 * // Without filter
 * const fetchRecords = createFetchRecordsFunction(workspaceId, referencedTableId, undefined, table, encryptionKey);
 *
 * // With filter
 * const fetchRecords = createFetchRecordsFunction(
 *   workspaceId,
 *   referencedTableId,
 *   "status='active' AND is_deleted=false",
 *   table,
 *   encryptionKey
 * );
 *
 * // Use in FieldRenderer
 * <FieldRenderer
 *   fetchRecords={fetchRecords}
 *   ...
 * />
 * ```
 */
// Cursor cache for pagination
const cursorCache = new Map<string, string>();

export function createFetchRecordsFunction(
  workspaceId: string,
  tableId: string,
  additionalCondition?: string,
  table?: Table | null,
  encryptionKey?: string | null,
): (query: string, page: number) => Promise<FetchRecordsResult> {
  return async (query: string, page: number): Promise<FetchRecordsResult> => {
    // Build filtering object
    const filtering: Record<string, unknown> = {};

    // Add search query
    if (query && query.trim()) {
      filtering.search = query;
    }

    // Add additionalCondition if provided
    if (additionalCondition && additionalCondition.trim()) {
      filtering.additionalCondition = additionalCondition;
    }

    // Create cache key for this specific query
    const cacheKey = `${tableId}_${query}_${additionalCondition || ''}`;

    // Reset cursor cache when fetching page 1
    if (page === 1) {
      cursorCache.delete(cacheKey);
    }

    // Get cursor for current page (page > 1)
    const cursor = page > 1 ? cursorCache.get(cacheKey) : undefined;

    // Use cursor-based pagination
    const response = await fetchActiveTableRecords({
      workspaceId,
      tableId,
      paging: 'cursor',
      limit: 50,
      direction: 'desc',
      next_id: cursor,
      filters: Object.keys(filtering).length > 0 ? filtering : undefined,
    });

    let records = response.data || [];

    // Decrypt records if table has encryption
    if (table && records.length > 0) {
      const needsDecryption = table.config?.e2eeEncryption || table.config?.encryptionKey;

      if (needsDecryption) {
        let decryptKey: string | null = null;

        if (table.config.e2eeEncryption) {
          // E2EE mode: use provided encryption key
          decryptKey = encryptionKey ?? null;
        } else {
          // Server-side encryption: use key from config
          decryptKey = table.config.encryptionKey ?? null;
        }

        if (decryptKey && table.config.fields) {
          try {
            const decrypted = await decryptRecords(
              records,
              table.config.fields,
              decryptKey,
              true, // useCache
              50, // batchSize
            );
            records = decrypted;
          } catch (error) {
            console.error('[createFetchRecordsFunction] Decryption failed:', error);
            // Continue with encrypted data - AsyncRecordSelect will show encrypted values
          }
        }
      }
    }

    // Extract id and record fields for AsyncRecordSelect
    // Structure: { id: "123", task_title: "...", status: "...", ... }
    // AsyncRecordSelect will use record[labelFieldName] for display
    const simplifiedRecords = records.map((r) => {
      const recordData = r.record || {};
      return {
        id: r.id,
        ...recordData, // Spread all decrypted fields (task_title, status, etc.)
      };
    });

    // Check if there are more records and cache the cursor for next page
    const hasMore = !!response.next_id;
    if (hasMore && response.next_id) {
      cursorCache.set(cacheKey, response.next_id);
    }

    return { records: simplifiedRecords, hasMore };
  };
}

/**
 * Create a fetchRecordsByIds function for fetching specific records by IDs
 *
 * This is used to fetch initial selected records for reference fields in edit mode
 * Follows the same pattern as source code: filtering.record['id:in'] = recordIds
 *
 * @param workspaceId - Current workspace ID
 * @param tableId - Referenced table ID
 * @param table - Table config (for decryption)
 * @param encryptionKey - Encryption key for E2EE tables
 * @returns Function to fetch specific records by their IDs
 *
 * @example
 * ```tsx
 * const fetchRecordsByIds = createFetchRecordsByIdsFunction(workspaceId, tableId, table, encryptionKey);
 * const selectedRecords = await fetchRecordsByIds(['id1', 'id2', 'id3']);
 * ```
 */
export function createFetchRecordsByIdsFunction(
  workspaceId: string,
  tableId: string,
  table?: Table | null,
  encryptionKey?: string | null,
): (recordIds: string[]) => Promise<AsyncRecordSelectRecord[]> {
  return async (recordIds: string[]): Promise<AsyncRecordSelectRecord[]> => {
    if (!recordIds || recordIds.length === 0) {
      return [];
    }

    // Build filtering object with id:in
    const filtering: Record<string, unknown> = {
      'id:in': recordIds, // ⭐ Fetch specific IDs (source code line 3588)
    };

    // API call with id:in filter
    const response = await fetchActiveTableRecords({
      workspaceId,
      tableId,
      paging: 'cursor',
      limit: recordIds.length,
      direction: 'desc',
      filters: filtering,
    });

    let records = response.data || [];

    console.log('[createFetchRecordsByIdsFunction] API response:', {
      recordsCount: records.length,
      sampleRecord: records[0],
    });

    // Decrypt records if table has encryption
    if (table && records.length > 0) {
      const needsDecryption = table.config?.e2eeEncryption || table.config?.encryptionKey;

      if (needsDecryption) {
        let decryptKey: string | null = null;

        if (table.config.e2eeEncryption) {
          // E2EE mode: use provided encryption key
          decryptKey = encryptionKey ?? null;
        } else {
          // Server-side encryption: use key from config
          decryptKey = table.config.encryptionKey ?? null;
        }

        if (decryptKey && table.config.fields) {
          try {
            const decrypted = await decryptRecords(
              records,
              table.config.fields,
              decryptKey,
              true, // useCache
              recordIds.length, // batchSize
            );
            records = decrypted;
            console.log('[createFetchRecordsByIdsFunction] Decryption successful');
          } catch (error) {
            console.error('[createFetchRecordsByIdsFunction] Decryption failed:', error);
            // Continue with encrypted data
          }
        }
      }
    }

    // Extract id and record fields
    const simplifiedRecords = records.map((r) => {
      const recordData = r.record || {};
      return {
        id: r.id,
        ...recordData,
      };
    });

    return simplifiedRecords;
  };
}
