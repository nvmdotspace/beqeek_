/**
 * useReferenceRecords Hook
 *
 * Fetches records from referenced tables for displaying in reference fields
 * Returns records grouped by table ID for easy lookup
 * Handles decryption for encrypted tables
 *
 * Supports 3 types of reference fields:
 * - SELECT_ONE_RECORD: Direct lookup by record ID
 * - SELECT_LIST_RECORD: Direct lookup by multiple record IDs
 * - FIRST_REFERENCE_RECORD: Reverse lookup with group parameter
 */

import { useQueries, useQueryClient } from '@tanstack/react-query';
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
import { activeTableQueryKey } from './use-active-tables';

/**
 * Reference field mapping info
 */
interface ReferenceFieldInfo {
  tableId: string;
  fieldType: string;
  referenceField?: string; // For FIRST_REFERENCE_RECORD
  recordIds: Set<string>; // IDs to filter
}

/**
 * Collect reference field information from table config and current records
 * Similar to RecordView.collectReferenceFieldMap from spec
 *
 * @param visibleFields - Optional array of field names to limit collection to visible fields only
 */
function collectReferenceFieldMap(
  table: Table | null,
  records: TableRecord[],
  visibleFields?: string[],
): Map<string, ReferenceFieldInfo> {
  if (!table || !table.config.fields || !records.length) return new Map();

  const fieldMap = new Map<string, ReferenceFieldInfo>();

  table.config.fields.forEach((field: FieldConfig) => {
    const isReferenceField =
      field.type === FIELD_TYPE_SELECT_ONE_RECORD ||
      field.type === FIELD_TYPE_SELECT_LIST_RECORD ||
      field.type === FIELD_TYPE_FIRST_REFERENCE_RECORD;

    if (!isReferenceField || !field.referenceTableId) return;

    // ✅ Skip if visibleFields is provided and this field is not in the list
    if (visibleFields && !visibleFields.includes(field.name)) return;

    const tableId = field.referenceTableId;

    if (!fieldMap.has(tableId)) {
      fieldMap.set(tableId, {
        tableId,
        fieldType: field.type,
        referenceField: field.referenceField,
        recordIds: new Set<string>(),
      });
    }

    const info = fieldMap.get(tableId)!;

    // Collect record IDs based on field type
    if (field.type === FIELD_TYPE_FIRST_REFERENCE_RECORD) {
      // For FIRST_REFERENCE_RECORD: collect current record IDs
      // These will be used to filter records in referenced table where referenceField matches
      records.forEach((record) => {
        info.recordIds.add(record.id);
      });
    } else {
      // For SELECT_ONE_RECORD and SELECT_LIST_RECORD: collect referenced IDs
      records.forEach((record) => {
        // Get record data from various possible locations
        const recordData: Record<string, unknown> =
          record.data || record.record || (record as unknown as Record<string, unknown>);
        const value = recordData[field.name];

        if (value != null) {
          if (Array.isArray(value)) {
            // SELECT_LIST_RECORD
            value.forEach((id) => {
              if (id) info.recordIds.add(String(id));
            });
          } else {
            // SELECT_ONE_RECORD
            info.recordIds.add(String(value));
          }
        }
      });
    }
  });

  return fieldMap;
}

export interface UseReferenceRecordsOptions {
  /** Enable/disable query */
  enabled?: boolean;
  /** Limit records per table */
  limit?: number;
  /** Current records being displayed (for filtering) */
  records?: TableRecord[];
  /** Only fetch references for these field names (optimization) */
  visibleFields?: string[];
}

/**
 * Fetch reference records from all tables referenced in the table config
 * Handles decryption for encrypted tables
 *
 * Implementation follows spec from docs/first-reference-record-spec.md:
 * - For SELECT_ONE_RECORD/SELECT_LIST_RECORD: Filter by id:in
 * - For FIRST_REFERENCE_RECORD: Filter by {referenceField}:in and add group parameter
 *
 * @example
 * ```tsx
 * const { referenceRecords, isLoading } = useReferenceRecords(
 *   workspaceId,
 *   table,
 *   { records: currentRecords }
 * );
 *
 * // referenceRecords = {
 * //   'table-id-1': [record1, record2, ...],
 * //   'table-id-2': [record3, record4, ...],
 * // }
 * ```
 */
export function useReferenceRecords(workspaceId: string, table: Table | null, options?: UseReferenceRecordsOptions) {
  const { enabled = true, limit = 1000, records = [], visibleFields } = options || {};
  const queryClient = useQueryClient();

  // Collect reference field mapping from table config and current records
  // Only collect fields that are actually visible in the UI
  const referenceFieldMap = useMemo(
    () => collectReferenceFieldMap(table, records, visibleFields),
    [table, records, visibleFields],
  );

  // Convert map to array for useQueries
  const referenceQueries = useMemo(() => {
    return Array.from(referenceFieldMap.values());
  }, [referenceFieldMap]);

  // Fetch table configs and records for each referenced table
  const queries = useQueries({
    queries: referenceQueries.map((info) => ({
      queryKey: [
        'reference-records',
        workspaceId,
        info.tableId,
        info.fieldType,
        Array.from(info.recordIds).sort().join(','), // Include IDs in cache key
      ],
      queryFn: async () => {
        const recordIdsArray = Array.from(info.recordIds);

        // Build filtering based on field type
        let filtering:
          | {
              record: {
                [key: string]: string[];
              };
            }
          | undefined = undefined;
        let group: string | undefined = undefined;

        if (recordIdsArray.length > 0) {
          if (info.fieldType === FIELD_TYPE_FIRST_REFERENCE_RECORD && info.referenceField) {
            // FIRST_REFERENCE_RECORD: Filter by {referenceField}:in and set group
            // Spec: docs/first-reference-record-spec.md lines 117-119, 158-161
            filtering = {
              record: {
                [`${info.referenceField}:in`]: recordIdsArray,
              },
            };
            group = info.referenceField;
          } else {
            // SELECT_ONE_RECORD, SELECT_LIST_RECORD: Filter by id:in
            filtering = {
              record: {
                'id:in': recordIdsArray,
              },
            };
          }
        }

        // Fetch table config using shared query key (allows React Query to dedupe)
        // Use fetchQuery to get from cache if available
        const tableResponse = await queryClient.fetchQuery({
          queryKey: activeTableQueryKey(workspaceId, info.tableId),
          queryFn: () => getActiveTable(workspaceId, info.tableId),
          staleTime: 5 * 60 * 1000, // 5 minutes
        });

        // Fetch records separately
        const recordsResponse = await fetchActiveTableRecords({
          workspaceId,
          tableId: info.tableId,
          limit,
          offset: 0,
          filters: filtering,
          group: group || undefined, // Add group parameter for FIRST_REFERENCE_RECORD
        });

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

        return { tableId: info.tableId, records: decryptedRecords };
      },
      enabled: enabled && !!workspaceId && !!info.tableId && info.recordIds.size > 0,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    })),
  });

  // Extract stable data from queries to use as memo dependency
  // This prevents re-renders when query status changes but data hasn't changed
  const queryDataArray = queries.map((q) => q.data);

  // Convert to Record<tableId, TableRecord[]> format
  const referenceRecords = useMemo(() => {
    const records: Record<string, TableRecord[]> = {};

    queryDataArray.forEach((data) => {
      if (data) {
        const { tableId, records: tableRecords } = data;
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
    // Use JSON.stringify to do deep comparison of data content
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(queryDataArray)]);

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
