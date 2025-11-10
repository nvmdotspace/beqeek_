/**
 * Infinite scroll hook for Active Table Records
 *
 * Implements cursor-based pagination with React Query infinite query
 * for smooth infinite scroll experience with automatic loading.
 *
 * Features:
 * - Cursor-based pagination (using nextId)
 * - Automatic prefetching of next page
 * - Decryption support for E2EE tables
 * - Mobile-optimized batch sizing
 * - Error handling and retry logic
 *
 * @see docs/BA/active-table-records-infinite-scroll-ux-review.md
 */

import { useInfiniteQuery } from '@tanstack/react-query';
import { useState, useEffect, useMemo } from 'react';
import { getActiveTableRecords, type ActiveTableRecordsResponse } from '../api/active-tables-api';
import { decryptRecords } from '@workspace/active-tables-core';
import type { TableRecord, Table } from '@workspace/active-tables-core';

// Use the existing type from API
type ListRecordsResponse = ActiveTableRecordsResponse;

/**
 * Options for infinite records query
 */
export interface UseInfiniteActiveTableRecordsOptions {
  /** Number of records per page (default: 50 desktop, 25 mobile) */
  pageSize?: number;
  /** Sort direction */
  direction?: 'asc' | 'desc';
  /** Enable query (default: true) */
  enabled?: boolean;
  /** Encryption key for E2EE tables */
  encryptionKey?: string | null;
}

/**
 * Hook for infinite scroll of active table records
 *
 * @param workspaceId - Current workspace ID
 * @param tableId - Table ID to fetch records from
 * @param table - Table metadata and configuration
 * @param options - Query options
 * @returns Infinite query result with flattened records
 *
 * @example
 * ```tsx
 * const {
 *   records,
 *   isLoading,
 *   isFetchingNextPage,
 *   hasNextPage,
 *   fetchNextPage,
 *   error,
 * } = useInfiniteActiveTableRecords(workspaceId, tableId, table);
 * ```
 */
export function useInfiniteActiveTableRecords(
  workspaceId: string,
  tableId: string,
  table: Table | null,
  options?: UseInfiniteActiveTableRecordsOptions,
) {
  const { pageSize: providedPageSize, direction = 'desc', enabled = true, encryptionKey } = options ?? {};

  const pageSize = useMemo(() => {
    if (providedPageSize !== undefined) return providedPageSize;
    if (typeof window === 'undefined') return 50;
    return window.innerWidth < 768 ? 25 : 50;
  }, [providedPageSize]);

  const [isDecrypting, setIsDecrypting] = useState(false);
  const [decryptionError, setDecryptionError] = useState<Error | null>(null);

  const query = useInfiniteQuery<ListRecordsResponse, Error>({
    queryKey: ['active-table-records', workspaceId, tableId, pageSize, direction],
    queryFn: async ({ pageParam }) => {
      const response = await getActiveTableRecords(workspaceId, tableId, {
        paging: 'cursor',
        limit: pageSize,
        direction,
        next_id: pageParam as string | undefined,
      });

      return response;
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.next_id ?? undefined,
    enabled: enabled && !!workspaceId && !!tableId,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 2,
  });

  // Flatten pages into single array of records
  const rawRecords = useMemo(() => {
    if (!query.data?.pages) return [];
    return query.data.pages.flatMap((page) => page.data ?? []);
  }, [query.data?.pages]);

  // Decrypt records if encryption is enabled
  const [decryptedRecords, setDecryptedRecords] = useState<TableRecord[]>([]);

  useEffect(() => {
    const decryptAllRecords = async () => {
      if (!table || rawRecords.length === 0) {
        setDecryptedRecords([]);
        return;
      }

      const needsDecryption = table.config.e2eeEncryption || table.config.encryptionKey;
      if (!needsDecryption) {
        setDecryptedRecords(rawRecords);
        return;
      }

      let decryptKey: string | null = null;
      if (table.config.e2eeEncryption) {
        // E2EE mode: use provided encryption key
        decryptKey = encryptionKey ?? null;
      } else {
        // Server-side encryption: use key from config
        decryptKey = table.config.encryptionKey ?? null;
      }

      if (!decryptKey) {
        setDecryptedRecords(rawRecords);
        return;
      }

      setIsDecrypting(true);
      setDecryptionError(null);

      try {
        const decrypted = await decryptRecords(
          rawRecords,
          table.config.fields ?? [],
          decryptKey,
          true, // useCache
          50, // batchSize
        );
        setDecryptedRecords(decrypted);
      } catch (error) {
        console.error('[useInfiniteActiveTableRecords] Decryption failed:', error);
        setDecryptionError(error instanceof Error ? error : new Error('Decryption failed'));
        setDecryptedRecords(rawRecords); // Fallback to raw records
      } finally {
        setIsDecrypting(false);
      }
    };

    void decryptAllRecords();
  }, [rawRecords, table, encryptionKey]);

  return {
    records: decryptedRecords,
    rawRecords, // Unencrypted records for debugging
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isFetchingNextPage: query.isFetchingNextPage,
    hasNextPage: query.hasNextPage ?? false,
    error: query.error || decryptionError,
    isDecrypting,
    decryptionError,
    fetchNextPage: query.fetchNextPage,
    refetch: query.refetch,
    pageCount: query.data?.pages.length ?? 0,
  };
}
