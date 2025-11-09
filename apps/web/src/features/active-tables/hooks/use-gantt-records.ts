import { useQuery } from '@tanstack/react-query';
import { getActiveTableRecords, type RecordQueryRequest } from '../api/active-tables-api';
import { decryptRecords } from '@workspace/active-tables-core';
import type { ActiveTableRecord, ActiveTable } from '../types';
import type { GanttConfig } from '@workspace/active-tables-core';

/**
 * Hook to fetch Gantt records using single large fetch pattern
 * Fetches all records at once (high limit) for timeline rendering
 *
 * @param workspaceId - Current workspace ID
 * @param tableId - Table ID
 * @param table - Table with config (needed for decryption)
 * @param ganttConfig - Gantt configuration
 * @param filters - Additional filters
 * @param encryptionKey - Encryption key for decryption (null if no encryption)
 * @param enabled - Whether to enable the query
 */
export function useGanttRecords(
  workspaceId: string,
  tableId: string,
  table: ActiveTable | null,
  ganttConfig: GanttConfig | null,
  filters: Record<string, unknown> = {},
  encryptionKey: string | null,
  enabled: boolean = true,
) {
  return useQuery({
    queryKey: ['gantt-records', workspaceId, tableId, ganttConfig?.ganttScreenId, filters],
    queryFn: async () => {
      if (!table || !ganttConfig) {
        throw new Error('Table and Gantt config required');
      }

      // Single large fetch - load all records for timeline
      const request: RecordQueryRequest = {
        paging: 'cursor',
        filtering: filters,
        direction: 'asc', // Ascending for chronological timeline
        limit: 50000, // Very high limit to get all records
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
            100, // Higher batch size for large dataset
          );
        } catch (error) {
          console.error('Failed to decrypt Gantt records:', error);
          // Use encrypted data as fallback
        }
      }

      // Filter and transform records for Gantt display
      const ganttRecords = transformRecordsForGantt(decryptedRecords, ganttConfig);

      return {
        records: ganttRecords,
        totalCount: decryptedRecords.length,
        hasMore: !!response.next_id, // Indicates if there are even more records
      };
    },
    enabled: enabled && !!table && !!ganttConfig && !!workspaceId && !!tableId,
    staleTime: 5 * 60 * 1000, // 5 minutes (Gantt data changes less frequently)
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Transform records for Gantt chart display
 * Filters out records without valid dates and parses date fields
 *
 * @param records - Raw records
 * @param ganttConfig - Gantt configuration
 */
function transformRecordsForGantt(records: ActiveTableRecord[], ganttConfig: GanttConfig): ActiveTableRecord[] {
  const { startDateField, endDateField } = ganttConfig;

  return records.filter((record) => {
    // Must have start date
    const startDate = record.record[startDateField];
    if (!startDate) return false;

    // Parse start date
    try {
      const startDateObj = new Date(String(startDate));
      if (isNaN(startDateObj.getTime())) return false;
    } catch {
      return false;
    }

    // End date is optional, but if provided must be valid
    const endDate = record.record[endDateField];
    if (endDate) {
      try {
        const endDateObj = new Date(String(endDate));
        if (isNaN(endDateObj.getTime())) return false;

        // Validate: end date must be >= start date
        const startDateObj = new Date(String(startDate));
        if (endDateObj < startDateObj) return false;
      } catch {
        return false;
      }
    }

    return true;
  });
}

/**
 * Helper to parse date value from record
 *
 * @param record - Record
 * @param fieldName - Field name
 */
export function getGanttDateValue(record: ActiveTableRecord, fieldName: string): Date | null {
  const value = record.record[fieldName];

  if (!value) return null;

  try {
    const date = new Date(String(value));
    return isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
}

/**
 * Helper to get progress value (0-100)
 *
 * @param record - Record
 * @param progressField - Progress field name
 */
export function getGanttProgressValue(record: ActiveTableRecord, progressField?: string): number {
  if (!progressField) return 0;

  const value = record.record[progressField];

  if (value === null || value === undefined) return 0;

  const numValue = Number(value);

  if (isNaN(numValue)) return 0;

  // Clamp to 0-100
  return Math.max(0, Math.min(100, numValue));
}
