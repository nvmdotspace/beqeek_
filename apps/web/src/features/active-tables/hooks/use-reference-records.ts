/**
 * useReferenceRecords Hook
 *
 * Fetches records from referenced tables for displaying in reference fields
 * Returns records grouped by table ID for easy lookup
 * Handles decryption for encrypted tables
 */

import { useQueries } from '@tanstack/react-query';
import { useMemo } from 'react';
import { fetchActiveTableRecords } from '../api/active-records-api';
import { getActiveTable } from '../api/active-tables-api';
import { decryptRecord } from '@workspace/active-tables-core';
import type { Table, TableRecord, FieldConfig } from '@workspace/active-tables-core';
import type { ActiveTableRecord } from '../types';
import {
  FIELD_TYPE_SELECT_ONE_RECORD,
  FIELD_TYPE_SELECT_LIST_RECORD,
  FIELD_TYPE_FIRST_REFERENCE_RECORD,
} from '@workspace/beqeek-shared';

/**
 * Extract unique referenced table IDs from table config
 */
function getReferencedTableIds(table: Table | null): string[] {
  if (!table || !table.config.fields) return [];

  const tableIds = new Set<string>();

  table.config.fields.forEach((field: FieldConfig) => {
    const isReferenceField =
      field.type === FIELD_TYPE_SELECT_ONE_RECORD ||
      field.type === FIELD_TYPE_SELECT_LIST_RECORD ||
      field.type === FIELD_TYPE_FIRST_REFERENCE_RECORD;

    if (isReferenceField && field.referenceTableId) {
      tableIds.add(field.referenceTableId);
    }
  });

  return Array.from(tableIds);
}

export interface UseReferenceRecordsOptions {
  /** Enable/disable query */
  enabled?: boolean;
  /** Limit records per table */
  limit?: number;
}

/**
 * Fetch reference records from all tables referenced in the table config
 * Handles decryption for encrypted tables
 *
 * @example
 * ```tsx
 * const { referenceRecords, isLoading } = useReferenceRecords(
 *   workspaceId,
 *   table
 * );
 *
 * // referenceRecords = {
 * //   'table-id-1': [record1, record2, ...],
 * //   'table-id-2': [record3, record4, ...],
 * // }
 * ```
 */
export function useReferenceRecords(workspaceId: string, table: Table | null, options?: UseReferenceRecordsOptions) {
  const { enabled = true, limit = 1000 } = options || {};

  // Extract referenced table IDs
  const referencedTableIds = useMemo(() => getReferencedTableIds(table), [table]);

  // Fetch table configs and records for each referenced table
  const queries = useQueries({
    queries: referencedTableIds.map((tableId) => ({
      queryKey: ['reference-records', workspaceId, tableId],
      queryFn: async () => {
        // Fetch both table config and records
        const [tableResponse, recordsResponse] = await Promise.all([
          getActiveTable(workspaceId, tableId),
          fetchActiveTableRecords({ workspaceId, tableId, limit, offset: 0 }),
        ]);

        const refTable = tableResponse.data;
        const rawRecords = recordsResponse.data;

        // Decrypt records if needed
        const encryptionKey = refTable.config.encryptionKey || null;
        const needsDecryption = refTable.config.e2eeEncryption || encryptionKey;

        let decryptedRecords: ActiveTableRecord[];

        if (needsDecryption && encryptionKey) {
          // Decrypt all records
          decryptedRecords = await Promise.all(
            rawRecords.map(async (r) => {
              try {
                const record: TableRecord = {
                  id: r.id,
                  record: r.record,
                  data: r.record,
                  createdBy: r.createdBy,
                  updatedBy: r.updatedBy,
                  createdAt: r.createdAt,
                  updatedAt: r.updatedAt,
                  valueUpdatedAt: r.valueUpdatedAt,
                  relatedUserIds: r.relatedUserIds,
                  assignedUserIds: r.assignedUserIds,
                  record_hashes: r.record_hashes,
                  hashed_keywords: r.hashed_keywords,
                  permissions: r.permissions,
                };

                const decrypted = await decryptRecord(record, refTable.config.fields, encryptionKey);

                // Return as ActiveTableRecord with decrypted data
                return {
                  ...r,
                  record: decrypted.record,
                };
              } catch (error) {
                console.error(`[useReferenceRecords] Decryption failed for record ${r.id}:`, error);
                return r; // Return encrypted record on error
              }
            }),
          );
        } else {
          decryptedRecords = rawRecords;
        }

        return { tableId, records: decryptedRecords };
      },
      enabled: enabled && !!workspaceId && !!tableId,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    })),
  });

  // Convert to Record<tableId, TableRecord[]> format
  const referenceRecords = useMemo(() => {
    const records: Record<string, TableRecord[]> = {};

    queries.forEach((query) => {
      if (query.data) {
        const { tableId, records: tableRecords } = query.data;
        // Convert ActiveTableRecord[] to TableRecord[]
        records[tableId] = tableRecords.map((r) => ({
          id: r.id,
          record: r.record,
          data: r.record, // Sync data with record
          createdBy: r.createdBy,
          updatedBy: r.updatedBy,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
          valueUpdatedAt: r.valueUpdatedAt,
          relatedUserIds: r.relatedUserIds,
          assignedUserIds: r.assignedUserIds,
          record_hashes: r.record_hashes,
          hashed_keywords: r.hashed_keywords,
          permissions: r.permissions,
        }));
      }
    });

    return records;
  }, [queries]);

  const isLoading = queries.some((q) => q.isLoading);
  const error = queries.find((q) => q.error)?.error || null;

  return {
    referenceRecords,
    isLoading,
    error,
    refetch: async () => {
      await Promise.all(queries.map((q) => q.refetch()));
    },
  };
}
