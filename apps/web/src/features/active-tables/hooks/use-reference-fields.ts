import { useQuery } from '@tanstack/react-query';
import { getActiveTableRecords, type RecordQueryRequest } from '../api/active-tables-api';
import type { ActiveTableRecord } from '../types';
import type { FieldConfig } from '@workspace/active-tables-core';

/**
 * Hook to resolve reference fields (SELECT_ONE_RECORD, SELECT_LIST_RECORD)
 * Batch fetches all referenced records grouped by table ID
 *
 * @param workspaceId - Current workspace ID
 * @param records - Records containing reference field values
 * @param fields - Field configurations to identify reference fields
 * @param enabled - Whether to enable the query
 */
export function useReferenceFieldData(
  workspaceId: string,
  records: ActiveTableRecord[],
  fields: FieldConfig[],
  enabled: boolean = true,
) {
  return useQuery({
    queryKey: ['reference-fields', workspaceId, records.map((r) => r.id).join(',')],
    queryFn: async () => {
      // Step 1: Identify reference fields
      const referenceFields = fields.filter((f) => f.type === 'SELECT_ONE_RECORD' || f.type === 'SELECT_LIST_RECORD');

      if (referenceFields.length === 0) {
        return {};
      }

      // Step 2: Group record IDs by table ID
      const recordIdsByTable = new Map<string, Set<string>>();

      records.forEach((record) => {
        referenceFields.forEach((field) => {
          const value = record.record[field.name];

          if (!value || !field.referenceTableId) return;

          // Handle SELECT_ONE_RECORD (single ID)
          if (field.type === 'SELECT_ONE_RECORD' && typeof value === 'string') {
            if (!recordIdsByTable.has(field.referenceTableId)) {
              recordIdsByTable.set(field.referenceTableId, new Set());
            }
            recordIdsByTable.get(field.referenceTableId)!.add(value);
          }

          // Handle SELECT_LIST_RECORD (array of IDs)
          if (field.type === 'SELECT_LIST_RECORD' && Array.isArray(value)) {
            if (!recordIdsByTable.has(field.referenceTableId)) {
              recordIdsByTable.set(field.referenceTableId, new Set());
            }
            value.forEach((id) => {
              if (typeof id === 'string') {
                recordIdsByTable.get(field.referenceTableId!)!.add(id);
              }
            });
          }
        });
      });

      // Step 3: Batch fetch records for each table
      const fetchPromises = Array.from(recordIdsByTable.entries()).map(async ([tableId, recordIds]) => {
        // Fetch all records for this table using filtering by IDs
        const request: RecordQueryRequest = {
          paging: 'cursor',
          filtering: {
            id: Array.from(recordIds), // Filter by specific IDs
          },
          direction: 'asc',
          limit: 1000, // High limit since we're fetching by specific IDs
        };

        const response = await getActiveTableRecords(workspaceId, tableId, request);

        return [tableId, response.data] as const;
      });

      const results = await Promise.all(fetchPromises);

      // Step 4: Build lookup map: tableId -> { recordId -> record }
      const referenceDataMap: Record<string, Record<string, ActiveTableRecord>> = {};

      results.forEach(([tableId, recordList]) => {
        referenceDataMap[tableId] = {};
        recordList.forEach((record) => {
          referenceDataMap[tableId][record.id] = record;
        });
      });

      return referenceDataMap;
    },
    enabled: enabled && records.length > 0 && fields.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    gcTime: 10 * 60 * 1000, // 10 minutes garbage collection
  });
}

/**
 * Helper to get display value for a reference field
 *
 * @param tableId - Reference table ID
 * @param recordId - Record ID to look up
 * @param referenceData - Data from useReferenceFieldData
 * @param displayField - Field name to display (default: first field)
 */
export function getReferenceDisplayValue(
  tableId: string | undefined,
  recordId: string,
  referenceData: Record<string, Record<string, ActiveTableRecord>> | undefined,
  displayField?: string,
): string {
  if (!tableId || !referenceData || !referenceData[tableId]) {
    return recordId; // Fallback to ID if not found
  }

  const record = referenceData[tableId][recordId];

  if (!record) {
    return recordId;
  }

  // Use displayField if provided, otherwise use first field value
  if (displayField && record.record[displayField]) {
    return String(record.record[displayField]);
  }

  // Fallback: return first non-empty field value
  const firstValue = Object.values(record.record).find((v) => v !== null && v !== undefined && v !== '');

  return firstValue ? String(firstValue) : recordId;
}
