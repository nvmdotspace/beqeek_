import { useQuery } from '@tanstack/react-query';
import { getActiveTableRecords, type RecordQueryRequest } from '../api/active-tables-api';
import { decryptRecords } from '@workspace/active-tables-core';
import type { ActiveTableRecord, ActiveTable } from '../types';
import CryptoJS from 'crypto-js';

/**
 * Hash keywords for full-text search
 * Server expects HMAC-SHA256 hashed keywords separated by spaces
 *
 * @param query - Search query string
 * @param encryptionKey - Encryption key for hashing (null if no encryption)
 */
function hashSearchKeywords(query: string, encryptionKey: string | null): string {
  if (!encryptionKey) {
    // No encryption - send plain text keywords
    return query.trim();
  }

  // Tokenize query into keywords
  const keywords = query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter((k) => k.length > 0);

  // Hash each keyword using HMAC-SHA256
  const hashedKeywords = keywords.map((keyword) => {
    return CryptoJS.HmacSHA256(keyword, encryptionKey).toString();
  });

  // Join with spaces for server
  return hashedKeywords.join(' ');
}

/**
 * Hook for full-text search in Active Tables
 * Automatically hashes keywords if encryption is enabled
 *
 * @param workspaceId - Current workspace ID
 * @param tableId - Table ID
 * @param table - Table with config
 * @param searchQuery - User's search query
 * @param encryptionKey - Encryption key (null if no encryption)
 * @param additionalFilters - Additional record filters
 * @param limit - Result limit (default: 50)
 * @param enabled - Whether to enable the query
 */
export function useFullTextSearch(
  workspaceId: string,
  tableId: string,
  table: ActiveTable | null,
  searchQuery: string,
  encryptionKey: string | null,
  additionalFilters: Record<string, unknown> = {},
  limit: number = 50,
  enabled: boolean = true,
) {
  const trimmedQuery = searchQuery.trim();

  return useQuery({
    queryKey: ['fulltext-search', workspaceId, tableId, trimmedQuery, additionalFilters, limit],
    queryFn: async () => {
      if (!table) {
        throw new Error('Table required for search');
      }

      if (trimmedQuery.length === 0) {
        // Empty query - return empty results
        return {
          records: [],
          totalCount: 0,
          nextId: null,
        };
      }

      // Hash keywords for encrypted tables
      const hashedQuery = hashSearchKeywords(trimmedQuery, encryptionKey);

      // Build search request
      const request: RecordQueryRequest = {
        paging: 'cursor',
        filtering: {
          ...additionalFilters,
          fulltext: hashedQuery, // Server expects hashed keywords
        },
        direction: 'desc',
        limit,
      };

      const response = await getActiveTableRecords(workspaceId, tableId, request);

      // Decrypt if encryption key available
      let decryptedRecords = response.data;

      if (encryptionKey && table.config?.fields) {
        try {
          decryptedRecords = await decryptRecords(
            response.data,
            table.config.fields,
            encryptionKey,
            true, // useCache
            50, // batchSize
          );
        } catch (error) {
          console.error('Failed to decrypt search results:', error);
          // Use encrypted data as fallback
        }
      }

      return {
        records: decryptedRecords,
        totalCount: decryptedRecords.length,
        nextId: response.next_id || null,
        query: trimmedQuery, // Original query for display
      };
    },
    enabled: enabled && !!table && !!workspaceId && !!tableId && trimmedQuery.length > 0,
    staleTime: 30 * 1000, // 30 seconds (search results change quickly)
    gcTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Debounced search hook
 * Delays search execution until user stops typing
 *
 * @param workspaceId - Current workspace ID
 * @param tableId - Table ID
 * @param table - Table with config
 * @param searchQuery - User's search query
 * @param encryptionKey - Encryption key
 * @param debounceMs - Debounce delay in milliseconds (default: 300ms)
 * @param additionalFilters - Additional filters
 * @param limit - Result limit
 */
export function useDebouncedFullTextSearch(
  workspaceId: string,
  tableId: string,
  table: ActiveTable | null,
  searchQuery: string,
  encryptionKey: string | null,
  debounceMs: number = 300,
  additionalFilters: Record<string, unknown> = {},
  limit: number = 50,
) {
  // Use React Query's built-in debouncing via queryKey
  const trimmedQuery = searchQuery.trim();
  const shouldSearch = trimmedQuery.length >= 2; // Minimum 2 characters

  return useFullTextSearch(
    workspaceId,
    tableId,
    table,
    trimmedQuery,
    encryptionKey,
    additionalFilters,
    limit,
    shouldSearch,
  );
}

/**
 * Client-side filtering fallback
 * For non-encrypted tables or when server search is unavailable
 *
 * @param records - Records to filter
 * @param searchQuery - Search query
 * @param searchFields - Field names to search in (optional)
 */
export function clientSideSearch(
  records: ActiveTableRecord[],
  searchQuery: string,
  searchFields?: string[],
): ActiveTableRecord[] {
  const query = searchQuery.toLowerCase().trim();

  if (query.length === 0) {
    return records;
  }

  const keywords = query.split(/\s+/).filter((k) => k.length > 0);

  return records.filter((record) => {
    // Search in specified fields or all fields
    const fieldsToSearch = searchFields || Object.keys(record.record);

    // Check if any field contains all keywords
    return keywords.every((keyword) => {
      return fieldsToSearch.some((fieldName) => {
        const value = record.record[fieldName];

        if (value === null || value === undefined) return false;

        const stringValue = String(value).toLowerCase();

        return stringValue.includes(keyword);
      });
    });
  });
}
