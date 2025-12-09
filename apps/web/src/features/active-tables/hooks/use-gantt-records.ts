/**
 * Gantt Records Hook
 *
 * Separate API call for Gantt chart view with:
 * - Default pageSize: 1000 (timeline view needs all tasks for visualization)
 * - Automatic refetch when gantt config changes
 * - NO date range filtering (range selector only affects chart rendering, not API)
 *
 * @see use-infinite-active-table-records.ts for List view
 */

import { useQuery } from '@tanstack/react-query';
import { useState, useEffect, useMemo } from 'react';
import { fetchActiveTableRecords } from '../api/active-records-api';
import { decryptRecords } from '@workspace/active-tables-core';
import { CommonUtils } from '@workspace/encryption-core';
import type { TableRecord, Table, GanttConfig } from '@workspace/active-tables-core';
import type { ActiveRecordsResponse } from '../types';

const GANTT_DEFAULT_PAGE_SIZE = 1000;

export interface UseGanttRecordsOptions {
  /** Number of records to fetch (default: 1000) */
  pageSize?: number;
  /** Sort direction */
  direction?: 'asc' | 'desc';
  /** Enable query */
  enabled?: boolean;
  /** Encryption key for E2EE tables */
  encryptionKey?: string | null;
  /** Filters to apply (quick filters only, no date range) */
  filters?: Record<string, unknown>;
}

/**
 * Hook for fetching Gantt chart records
 *
 * Unlike useInfiniteActiveTableRecords, this hook:
 * - Fetches all records in one call (default 100)
 * - Uses ganttScreenId as part of query key for separate caching
 * - Optimized for timeline view (no infinite scroll)
 */
export function useGanttRecords(
  workspaceId: string,
  tableId: string,
  table: Table | null,
  ganttConfig: GanttConfig | null,
  options?: UseGanttRecordsOptions,
) {
  const {
    pageSize = GANTT_DEFAULT_PAGE_SIZE,
    direction = 'asc', // Gantt typically sorts by start date ascending
    enabled = true,
    encryptionKey,
    filters,
  } = options ?? {};

  const [isDecrypting, setIsDecrypting] = useState(false);
  const [decryptionError, setDecryptionError] = useState<Error | null>(null);
  const [decryptedRecords, setDecryptedRecords] = useState<TableRecord[]>([]);

  // Encrypt filters for E2E tables
  const encryptedFilters = useMemo(() => {
    if (!filters || !table) return filters;

    const needsEncryption = table.config.e2eeEncryption || table.config.encryptionKey;
    if (!needsEncryption) return filters;

    const encrypted: Record<string, unknown> = {};

    if (filters.record && typeof filters.record === 'object') {
      const recordFilters: Record<string, unknown> = {};
      Object.entries(filters.record).forEach(([fieldKey, value]) => {
        if (value !== '' && value !== undefined && value !== null) {
          // Check if this is an operator-based filter (e.g., "fieldName:between")
          const isOperatorFilter = fieldKey.includes(':');

          if (isOperatorFilter) {
            // For date range filters with operators, handle OPE encryption if needed
            const parts = fieldKey.split(':');
            const fieldName = parts[0];
            const operator = parts[1];
            const field = table.config.fields?.find((f) => f.name === fieldName);

            if (fieldName && field && Array.isArray(value) && (operator === 'between' || operator === 'not_between')) {
              // OPE encrypt date values for encrypted tables
              const tableDetail = {
                id: table.id,
                name: table.name,
                config: {
                  ...table.config,
                  fields:
                    table.config.fields?.map((f) => ({
                      ...f,
                      required: f.required ?? false,
                    })) ?? [],
                },
              };
              const encryptedValues = value.map((v) => CommonUtils.encryptTableData(tableDetail, fieldName, v));
              recordFilters[fieldKey] = encryptedValues;
            } else {
              // Pass through other operator filters
              recordFilters[fieldKey] = value;
            }
          } else {
            // Standard equality filter encryption
            const tableDetail = {
              id: table.id,
              name: table.name,
              config: {
                ...table.config,
                fields:
                  table.config.fields?.map((field) => ({
                    ...field,
                    required: field.required ?? false,
                  })) ?? [],
              },
            };
            recordFilters[fieldKey] = CommonUtils.encryptTableData(tableDetail, fieldKey, value);
          }
        }
      });
      encrypted.record = recordFilters;
    }

    // Handle search query
    if (filters.fulltext && typeof filters.fulltext === 'string' && filters.fulltext.trim()) {
      const searchEncryptionKey = table.config.e2eeEncryption ? encryptionKey : table.config.encryptionKey;
      if (searchEncryptionKey) {
        encrypted.fulltext = CommonUtils.hashKeyword(filters.fulltext.trim(), searchEncryptionKey).join(' ');
      } else {
        encrypted.fulltext = filters.fulltext.trim();
      }
    }

    // Copy other filter properties
    Object.entries(filters).forEach(([key, value]) => {
      if (key !== 'record' && key !== 'fulltext') {
        encrypted[key] = value;
      }
    });

    return encrypted;
  }, [filters, table, encryptionKey]);

  // Query key includes ganttScreenId for separate caching per chart
  const queryKey = useMemo(
    () => [
      'gantt-records',
      workspaceId,
      tableId,
      ganttConfig?.ganttScreenId ?? 'default',
      pageSize,
      direction,
      encryptedFilters,
    ],
    [workspaceId, tableId, ganttConfig?.ganttScreenId, pageSize, direction, encryptedFilters],
  );

  const query = useQuery<ActiveRecordsResponse, Error>({
    queryKey,
    queryFn: async () => {
      const response = await fetchActiveTableRecords({
        workspaceId,
        tableId,
        paging: 'cursor',
        limit: pageSize,
        direction,
        filters: encryptedFilters,
      });
      return response;
    },
    enabled: enabled && !!workspaceId && !!tableId && !!ganttConfig,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // Memoize rawRecords to prevent infinite loop in useEffect
  const rawRecords = useMemo(() => query.data?.data ?? [], [query.data?.data]);

  // Decrypt records if needed
  useEffect(() => {
    const decryptAllRecords = async () => {
      if (!table) {
        setDecryptedRecords([]);
        return;
      }

      if (rawRecords.length === 0) {
        setDecryptedRecords([]);
        return;
      }

      const needsDecryption = table.config.e2eeEncryption || table.config.encryptionKey;
      if (!needsDecryption) {
        const recordsWithData = rawRecords.map((r) => ({
          ...r,
          data: r.record,
        }));
        setDecryptedRecords(recordsWithData);
        return;
      }

      let decryptKey: string | null = null;
      if (table.config.e2eeEncryption) {
        decryptKey = encryptionKey ?? null;
      } else {
        decryptKey = table.config.encryptionKey ?? null;
      }

      if (!decryptKey) {
        const recordsWithData = rawRecords.map((r) => ({
          ...r,
          data: r.record,
        }));
        setDecryptedRecords(recordsWithData);
        return;
      }

      setIsDecrypting(true);
      setDecryptionError(null);

      try {
        const decrypted = await decryptRecords(rawRecords, table.config.fields ?? [], decryptKey, true, 50);
        const recordsWithData = decrypted.map((r) => ({
          ...r,
          data: r.record,
        }));
        setDecryptedRecords(recordsWithData);
      } catch (error) {
        console.error('[useGanttRecords] Decryption failed:', error);
        setDecryptionError(error instanceof Error ? error : new Error('Decryption failed'));
        const recordsWithData = rawRecords.map((r) => ({
          ...r,
          data: r.record,
        }));
        setDecryptedRecords(recordsWithData);
      } finally {
        setIsDecrypting(false);
      }
    };

    void decryptAllRecords();
  }, [rawRecords, table, encryptionKey]);

  return {
    records: decryptedRecords,
    rawRecords,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error || decryptionError,
    isDecrypting,
    decryptionError,
    refetch: query.refetch,
    totalCount: query.data?.data?.length ?? 0,
    hasMore: !!query.data?.next_id,
  };
}
