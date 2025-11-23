/**
 * Hook for creating InlineEditContext for RecordDetail inline editing
 *
 * Provides workspaceUsers and fetchRecords functions for reference/user fields
 * Used by record-detail-page.tsx to enable rich inline editing
 */

import { useMemo, useCallback, useState, useEffect } from 'react';
import { useQueries } from '@tanstack/react-query';
import type { Table } from '@workspace/active-tables-core';
import type { InlineEditContext } from '@workspace/active-tables-core';
import type { WorkspaceUser } from '@workspace/active-tables-core';
import {
  FIELD_TYPE_SELECT_ONE_RECORD,
  FIELD_TYPE_SELECT_LIST_RECORD,
  FIELD_TYPE_SELECT_ONE_WORKSPACE_USER,
  FIELD_TYPE_SELECT_LIST_WORKSPACE_USER,
} from '@workspace/beqeek-shared';
import { createFetchRecordsFunction, createFetchRecordsByIdsFunction } from './use-list-table-records';
import { getActiveTable } from '../api/active-tables-api';
import { activeTableQueryKey } from './use-active-tables';

interface UseInlineEditContextOptions {
  workspaceId: string;
  table: Table | null;
  record: { id: string; data?: Record<string, unknown>; record?: Record<string, unknown> } | null;
  workspaceUsers?: WorkspaceUser[];
  encryptionKey?: string | null;
  /** Only fetch references for these field names (optimization) */
  visibleFields?: string[];
  /**
   * Pre-fetched reference records from useReferenceRecords
   * If provided, skips fetching initial records (optimization)
   * Accepts TableRecord[] or simpler { id: string }[] format
   */
  referenceRecords?: Record<
    string,
    Array<{ id: string; data?: Record<string, unknown>; record?: Record<string, unknown> }>
  >;
  /**
   * Loading state from useReferenceRecords
   * When true, skip local fetching to avoid duplicate API calls
   */
  isLoadingReferenceRecords?: boolean;
}

/**
 * Check if field type is a record reference field
 */
function isRecordReferenceField(type: string): boolean {
  return type === FIELD_TYPE_SELECT_ONE_RECORD || type === FIELD_TYPE_SELECT_LIST_RECORD;
}

/**
 * Check if field type is a user reference field
 */
function _isUserReferenceField(type: string): boolean {
  return type === FIELD_TYPE_SELECT_ONE_WORKSPACE_USER || type === FIELD_TYPE_SELECT_LIST_WORKSPACE_USER;
}

/**
 * Hook to create InlineEditContext for RecordDetail
 */
export function useInlineEditContext({
  workspaceId,
  table,
  record,
  workspaceUsers,
  encryptionKey: _encryptionKey,
  visibleFields,
  referenceRecords: preloadedReferenceRecords,
  isLoadingReferenceRecords = false,
}: UseInlineEditContextOptions): InlineEditContext | undefined {
  // Get reference fields from table config - filter by visibleFields if provided
  const referenceFields = useMemo(() => {
    if (!table) return [];
    const allReferenceFields = table.config.fields.filter((f) => isRecordReferenceField(f.type));

    // If visibleFields provided, only include fields that are visible
    if (visibleFields && visibleFields.length > 0) {
      return allReferenceFields.filter((f) => visibleFields.includes(f.name));
    }

    return allReferenceFields;
  }, [table, visibleFields]);

  // Get unique referenced table IDs
  const referencedTableIds = useMemo(() => {
    const ids = new Set<string>();
    referenceFields.forEach((field) => {
      const refTableId = field.referenceTableId || field.referencedTableId;
      if (refTableId) ids.add(refTableId);
    });
    return Array.from(ids);
  }, [referenceFields]);

  // Fetch referenced table metadata using shared query key pattern
  // This allows React Query to dedupe calls with useReferenceRecords
  const referencedTablesQueries = useQueries({
    queries: referencedTableIds.map((tableId) => ({
      queryKey: activeTableQueryKey(workspaceId, tableId), // Shared key with useActiveTable
      queryFn: async () => {
        const response = await getActiveTable(workspaceId, tableId);
        return response;
      },
      enabled: !!workspaceId && !!tableId,
      staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    })),
  });

  // Extract stable data from queries to prevent re-renders on status changes
  const queryDataArray = referencedTablesQueries.map((q) => q?.data?.data);

  // Convert queries array to Record<tableId, Table>
  const referencedTables = useMemo(() => {
    const results: Record<string, Table> = {};
    referencedTableIds.forEach((tableId, index) => {
      const tableData = queryDataArray[index];
      if (tableData) {
        results[tableId] = tableData;
      }
    });
    return results;
    // Use JSON.stringify for stable dependency - only recompute when data changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [referencedTableIds, JSON.stringify(queryDataArray)]);

  // Store initial records for each field (pre-selected values)
  const [initialRecordsMap, setInitialRecordsMap] = useState<
    Record<string, Array<{ id: string; [key: string]: unknown }>>
  >({});

  // Load initial records for reference fields
  // OPTIMIZATION: Skip if preloadedReferenceRecords is provided OR still loading (from useReferenceRecords)
  useEffect(() => {
    // Skip fetching if:
    // 1. We already have preloaded data from useReferenceRecords
    // 2. useReferenceRecords is still loading (to avoid race condition/duplicate fetches)
    if (isLoadingReferenceRecords) {
      return;
    }
    if (preloadedReferenceRecords && Object.keys(preloadedReferenceRecords).length > 0) {
      return;
    }

    const loadInitialRecords = async () => {
      if (!record || !table || referenceFields.length === 0) return;

      const recordData = record.data || record.record || {};
      const newInitialRecords: Record<string, Array<{ id: string; [key: string]: unknown }>> = {};

      await Promise.all(
        referenceFields.map(async (field) => {
          const selectedValue = recordData[field.name];
          if (!selectedValue) return;

          const refTableId = field.referenceTableId || field.referencedTableId;
          if (!refTableId) return;

          const refTable = referencedTables[refTableId];
          if (!refTable) return;

          // Get encryption key for referenced table
          let refEncryptionKey: string | null = null;
          if (refTable.config.e2eeEncryption) {
            refEncryptionKey = localStorage.getItem(`table_${refTableId}_encryption_key`);
          }

          try {
            const fetchByIds = createFetchRecordsByIdsFunction(workspaceId, refTableId, refTable, refEncryptionKey);
            const selectedIds = Array.isArray(selectedValue) ? selectedValue : [selectedValue];
            const validIds = selectedIds.filter((id) => id != null && id !== '');

            if (validIds.length > 0) {
              const records = await fetchByIds(validIds);
              newInitialRecords[field.name] = records;
            }
          } catch (error) {
            console.error(`[useInlineEditContext] Failed to load initial records for ${field.name}:`, error);
          }
        }),
      );

      setInitialRecordsMap(newInitialRecords);
    };

    loadInitialRecords();
  }, [
    record,
    table,
    referenceFields,
    referencedTables,
    workspaceId,
    preloadedReferenceRecords,
    isLoadingReferenceRecords,
  ]);

  // Create getFetchRecords function
  const getFetchRecords = useCallback(
    (fieldName: string) => {
      if (!table) return undefined;

      const field = table.config.fields.find((f) => f.name === fieldName);
      if (!field || !isRecordReferenceField(field.type)) return undefined;

      const refTableId = field.referenceTableId || field.referencedTableId;
      if (!refTableId) return undefined;

      const refTable = referencedTables[refTableId];
      if (!refTable) return undefined;

      // Get encryption key for referenced table
      let refEncryptionKey: string | null = null;
      if (refTable.config.e2eeEncryption) {
        refEncryptionKey = localStorage.getItem(`table_${refTableId}_encryption_key`);
      }

      return createFetchRecordsFunction(workspaceId, refTableId, field.additionalCondition, refTable, refEncryptionKey);
    },
    [table, referencedTables, workspaceId],
  );

  // Create getInitialRecords function
  // Uses preloaded data from useReferenceRecords if available, otherwise from local state
  const getInitialRecords = useCallback(
    (fieldName: string) => {
      // First, try to get from preloaded reference records
      if (preloadedReferenceRecords) {
        // Find the field to get its referenced table ID
        const field = table?.config.fields.find((f) => f.name === fieldName);
        if (field) {
          const refTableId = field.referenceTableId || field.referencedTableId;
          if (refTableId && preloadedReferenceRecords[refTableId]) {
            return preloadedReferenceRecords[refTableId];
          }
        }
      }
      // Fallback to local state
      return initialRecordsMap[fieldName];
    },
    [initialRecordsMap, preloadedReferenceRecords, table],
  );

  // Return undefined if no table
  if (!table) return undefined;

  return {
    workspaceUsers,
    getFetchRecords,
    getInitialRecords,
  };
}
