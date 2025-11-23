/**
 * Hook for creating InlineEditContext for RecordDetail inline editing
 *
 * Provides workspaceUsers and fetchRecords functions for reference/user fields
 * Used by record-detail-page.tsx to enable rich inline editing
 */

import { useMemo, useCallback, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { Table, FieldConfig } from '@workspace/active-tables-core';
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

interface UseInlineEditContextOptions {
  workspaceId: string;
  table: Table | null;
  record: { id: string; data?: Record<string, unknown>; record?: Record<string, unknown> } | null;
  workspaceUsers?: WorkspaceUser[];
  encryptionKey?: string | null;
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
function isUserReferenceField(type: string): boolean {
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
  encryptionKey,
}: UseInlineEditContextOptions): InlineEditContext | undefined {
  // Get all reference fields from table config
  const referenceFields = useMemo(() => {
    if (!table) return [];
    return table.config.fields.filter((f) => isRecordReferenceField(f.type));
  }, [table]);

  // Get unique referenced table IDs
  const referencedTableIds = useMemo(() => {
    const ids = new Set<string>();
    referenceFields.forEach((field) => {
      const refTableId = field.referenceTableId || field.referencedTableId;
      if (refTableId) ids.add(refTableId);
    });
    return Array.from(ids);
  }, [referenceFields]);

  // Fetch referenced table metadata for all referenced tables
  const referencedTablesQueries = useQuery({
    queryKey: ['referenced-tables', workspaceId, referencedTableIds],
    queryFn: async () => {
      const results: Record<string, Table> = {};
      await Promise.all(
        referencedTableIds.map(async (tableId) => {
          try {
            const response = await getActiveTable(workspaceId, tableId);
            if (response.data) {
              results[tableId] = response.data;
            }
          } catch (error) {
            console.error(`[useInlineEditContext] Failed to fetch table ${tableId}:`, error);
          }
        }),
      );
      return results;
    },
    enabled: referencedTableIds.length > 0 && !!workspaceId,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const referencedTables = referencedTablesQueries.data || {};

  // Store initial records for each field (pre-selected values)
  const [initialRecordsMap, setInitialRecordsMap] = useState<
    Record<string, Array<{ id: string; [key: string]: unknown }>>
  >({});

  // Load initial records for reference fields
  useEffect(() => {
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
  }, [record, table, referenceFields, referencedTables, workspaceId]);

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
  const getInitialRecords = useCallback(
    (fieldName: string) => {
      return initialRecordsMap[fieldName];
    },
    [initialRecordsMap],
  );

  // Return undefined if no table
  if (!table) return undefined;

  return {
    workspaceUsers,
    getFetchRecords,
    getInitialRecords,
  };
}
