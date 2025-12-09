/**
 * Kanban Column Records Hook
 *
 * Fetches records for each Kanban column (status value) separately.
 * This allows:
 * - Independent loading states per column
 * - Better performance with parallel API calls
 * - Proper filtering per column (e.g., filter by status value)
 *
 * @see use-kanban-records.ts for single-call approach (deprecated)
 */

import { useQueries } from '@tanstack/react-query';
import { useState, useEffect, useMemo, useRef } from 'react';
import { fetchActiveTableRecords } from '../api/active-records-api';
import { decryptRecords } from '@workspace/active-tables-core';
import { CommonUtils } from '@workspace/encryption-core';
import type { TableRecord, Table, KanbanConfig, FieldOption } from '@workspace/active-tables-core';
import type { ActiveRecordsResponse } from '../types';

const KANBAN_COLUMN_PAGE_SIZE = 50;

export interface UseKanbanColumnRecordsOptions {
  /** Number of records per column (default: 50) */
  pageSize?: number;
  /** Sort direction */
  direction?: 'asc' | 'desc';
  /** Enable query */
  enabled?: boolean;
  /** Encryption key for E2EE tables */
  encryptionKey?: string | null;
  /** Base filters to apply (quick filters, search) */
  filters?: Record<string, unknown>;
}

export interface ColumnRecordsState {
  /** Column ID (status option value) */
  columnId: string;
  /** Column label */
  columnLabel: string;
  /** Records for this column */
  records: TableRecord[];
  /** Loading state */
  isLoading: boolean;
  /** Fetching state (background refetch) */
  isFetching: boolean;
  /** Error if any */
  error: Error | null;
  /** Total count in this column */
  count: number;
}

/**
 * Hook for fetching Kanban records per column
 *
 * Each column (status value) gets its own API call with:
 * - Base filters (quick filters, search)
 * - Status field filter for that column's value
 */
export function useKanbanColumnRecords(
  workspaceId: string,
  tableId: string,
  table: Table | null,
  kanbanConfig: KanbanConfig | null,
  options?: UseKanbanColumnRecordsOptions,
) {
  const {
    pageSize = KANBAN_COLUMN_PAGE_SIZE,
    direction = 'desc',
    enabled = true,
    encryptionKey,
    filters,
  } = options ?? {};

  const [isDecrypting, setIsDecrypting] = useState(false);
  const [decryptedByColumn, setDecryptedByColumn] = useState<Map<string, TableRecord[]>>(new Map());

  // Get status field and its options
  const statusField = useMemo(() => {
    if (!table?.config?.fields || !kanbanConfig?.statusField) return null;
    return table.config.fields.find((f) => f.name === kanbanConfig.statusField) ?? null;
  }, [table?.config?.fields, kanbanConfig?.statusField]);

  const statusOptions = useMemo(() => {
    if (!statusField?.options) return [];
    return statusField.options as FieldOption[];
  }, [statusField?.options]);

  // Encrypt base filters
  const encryptedBaseFilters = useMemo(() => {
    if (!filters || !table) return filters;

    const needsEncryption = table.config.e2eeEncryption || table.config.encryptionKey;
    if (!needsEncryption) return filters;

    const encrypted: Record<string, unknown> = {};

    if (filters.record && typeof filters.record === 'object') {
      const recordFilters: Record<string, unknown> = {};
      Object.entries(filters.record).forEach(([fieldName, value]) => {
        if (value !== '' && value !== undefined && value !== null) {
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
          recordFilters[fieldName] = CommonUtils.encryptTableData(tableDetail, fieldName, value);
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

  // Build filter for a specific column (status value)
  const buildColumnFilter = useMemo(() => {
    return (statusValue: string) => {
      if (!kanbanConfig?.statusField || !table) return encryptedBaseFilters;

      const columnFilter: Record<string, unknown> = { ...encryptedBaseFilters };

      // Add status field filter
      const recordFilters: Record<string, unknown> = {
        ...(columnFilter.record as Record<string, unknown> | undefined),
      };

      // Encrypt status value if needed
      const needsEncryption = table.config.e2eeEncryption || table.config.encryptionKey;
      if (needsEncryption) {
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
        recordFilters[kanbanConfig.statusField] = CommonUtils.encryptTableData(
          tableDetail,
          kanbanConfig.statusField,
          statusValue,
        );
      } else {
        recordFilters[kanbanConfig.statusField] = statusValue;
      }

      columnFilter.record = recordFilters;
      return columnFilter;
    };
  }, [kanbanConfig?.statusField, table, encryptedBaseFilters]);

  // Create queries for each column
  const queries = useQueries({
    queries: statusOptions.map((option) => ({
      queryKey: [
        'kanban-column-records',
        workspaceId,
        tableId,
        kanbanConfig?.kanbanScreenId ?? 'default',
        option.value,
        pageSize,
        direction,
        encryptedBaseFilters,
      ],
      queryFn: async (): Promise<{ columnId: string; response: ActiveRecordsResponse }> => {
        const columnFilters = buildColumnFilter(String(option.value));
        const response = await fetchActiveTableRecords({
          workspaceId,
          tableId,
          paging: 'cursor',
          limit: pageSize,
          direction,
          filters: columnFilters,
        });
        return { columnId: String(option.value), response };
      },
      enabled: enabled && !!workspaceId && !!tableId && !!kanbanConfig && statusOptions.length > 0,
      staleTime: 30 * 1000,
      gcTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    })),
  });

  // Aggregate loading states
  const isLoading = queries.some((q) => q.isLoading);
  const isFetching = queries.some((q) => q.isFetching);
  const hasError = queries.some((q) => q.error);
  const firstError = queries.find((q) => q.error)?.error ?? null;

  // Track queries data hash to detect actual data changes
  const queriesDataHash = useMemo(() => {
    return queries
      .map((q) => (q.data ? `${q.data.columnId}:${q.data.response.data?.length ?? 0}:${q.dataUpdatedAt}` : 'empty'))
      .join('|');
  }, [queries]);

  // Track previous hash to avoid redundant decryption
  const prevQueriesDataHashRef = useRef<string>('');

  // Decrypt records per column
  useEffect(() => {
    const decryptAllColumns = async () => {
      if (!table || queries.some((q) => q.isLoading)) {
        return;
      }

      // Skip if data hasn't actually changed
      if (queriesDataHash === prevQueriesDataHashRef.current) {
        return;
      }
      prevQueriesDataHashRef.current = queriesDataHash;

      const needsDecryption = table.config.e2eeEncryption || table.config.encryptionKey;
      const newDecrypted = new Map<string, TableRecord[]>();

      setIsDecrypting(true);

      try {
        for (const query of queries) {
          if (!query.data) continue;

          const { columnId, response } = query.data;
          const rawRecords = response.data ?? [];

          if (rawRecords.length === 0) {
            newDecrypted.set(columnId, []);
            continue;
          }

          if (!needsDecryption) {
            const recordsWithData = rawRecords.map((r) => ({
              ...r,
              data: r.record,
            }));
            newDecrypted.set(columnId, recordsWithData);
            continue;
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
            newDecrypted.set(columnId, recordsWithData);
            continue;
          }

          const decrypted = await decryptRecords(rawRecords, table.config.fields ?? [], decryptKey, true, 50);
          const recordsWithData = decrypted.map((r) => ({
            ...r,
            data: r.record,
          }));
          newDecrypted.set(columnId, recordsWithData);
        }

        setDecryptedByColumn(newDecrypted);
      } catch (error) {
        console.error('[useKanbanColumnRecords] Decryption failed:', error);
        // Fallback to raw records
        const fallback = new Map<string, TableRecord[]>();
        for (const query of queries) {
          if (query.data) {
            const { columnId, response } = query.data;
            const rawRecords = response.data ?? [];
            fallback.set(
              columnId,
              rawRecords.map((r) => ({ ...r, data: r.record })),
            );
          }
        }
        setDecryptedByColumn(fallback);
      } finally {
        setIsDecrypting(false);
      }
    };

    void decryptAllColumns();
  }, [queriesDataHash, table, encryptionKey, queries]);

  // Build column states
  const columnStates = useMemo((): ColumnRecordsState[] => {
    return statusOptions.map((option, index) => {
      const query = queries[index];
      const columnId = String(option.value);
      const records = decryptedByColumn.get(columnId) ?? [];

      return {
        columnId,
        columnLabel: option.text ?? columnId,
        records,
        isLoading: query?.isLoading ?? false,
        isFetching: query?.isFetching ?? false,
        error: (query?.error as Error) ?? null,
        count: records.length,
      };
    });
  }, [statusOptions, queries, decryptedByColumn]);

  // Flatten all records for compatibility with existing code
  const allRecords = useMemo(() => {
    const all: TableRecord[] = [];
    decryptedByColumn.forEach((records) => {
      all.push(...records);
    });
    return all;
  }, [decryptedByColumn]);

  return {
    /** All records flattened (for backward compatibility) */
    records: allRecords,
    /** Records organized by column */
    columnStates,
    /** Records map by column ID */
    recordsByColumn: decryptedByColumn,
    /** Overall loading state */
    isLoading,
    /** Overall fetching state */
    isFetching,
    /** First error encountered */
    error: firstError,
    /** Whether any column has error */
    hasError,
    /** Decryption in progress */
    isDecrypting,
    /** Status field used for columns */
    statusField,
    /** Refetch all columns */
    refetchAll: () => queries.forEach((q) => q.refetch()),
  };
}
