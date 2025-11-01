import { useQuery } from '@tanstack/react-query';
import { getActiveTableRecords, type RecordQueryRequest } from '../api/active-tables-api';
import { decryptRecords } from '@workspace/active-tables-core';
import type { ActiveTableRecord, ActiveTable } from '../types';
import type { KanbanConfig, FieldConfig } from '@workspace/active-tables-core';

/**
 * Kanban column data structure
 */
export interface KanbanColumnData {
  status: string;
  records: ActiveTableRecord[];
  nextId: string | null;
  previousId: string | null;
}

/**
 * Hook to fetch Kanban records using parallel multi-fetch pattern
 * Fetches one API call per status column for independent pagination
 *
 * @param workspaceId - Current workspace ID
 * @param tableId - Table ID
 * @param table - Table with config (needed for decryption)
 * @param kanbanConfig - Kanban configuration
 * @param filters - Additional filters (excluding status)
 * @param encryptionKey - Encryption key for decryption (null if no encryption)
 * @param limit - Records per column (default: 50)
 * @param enabled - Whether to enable the query
 */
export function useKanbanRecords(
  workspaceId: string,
  tableId: string,
  table: ActiveTable | null,
  kanbanConfig: KanbanConfig | null,
  filters: Record<string, unknown> = {},
  encryptionKey: string | null,
  limit: number = 50,
  enabled: boolean = true,
) {
  return useQuery({
    queryKey: ['kanban-records', workspaceId, tableId, kanbanConfig?.kanbanScreenId, filters, limit],
    queryFn: async () => {
      if (!table || !kanbanConfig) {
        throw new Error('Table and Kanban config required');
      }

      // Step 1: Find the status field
      const statusField = table.config?.fields?.find((f: FieldConfig) => f.name === kanbanConfig.statusField);

      if (!statusField || statusField.type !== 'SELECT_ONE') {
        throw new Error('Kanban status field must be SELECT_ONE type');
      }

      const statusOptions = statusField.options || [];

      if (statusOptions.length === 0) {
        throw new Error('Status field has no options');
      }

      // Step 2: Parallel fetch - one API call per status column
      const kanbanRecordsArray = await Promise.all(
        statusOptions.map(async (option) => {
          // Build request for this status
          const request: RecordQueryRequest = {
            paging: 'cursor',
            filtering: {
              ...filters,
              record: {
                ...((filters.record as Record<string, unknown>) || {}),
                [statusField.name]: option.value, // Filter by this status
              },
            },
            direction: 'desc',
            limit,
          };

          // Fetch records for this status
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
              console.error(`Failed to decrypt records for status ${option.value}:`, error);
              // Use encrypted data as fallback
            }
          }

          // Return column data
          const columnData: KanbanColumnData = {
            status: option.value,
            records: decryptedRecords,
            nextId: response.next_id || null,
            previousId: response.previous_id || null,
          };

          return [option.value, columnData] as const;
        }),
      );

      // Step 3: Convert to object map: { status -> columnData }
      const kanbanData = Object.fromEntries(kanbanRecordsArray);

      return kanbanData;
    },
    enabled: enabled && !!table && !!kanbanConfig && !!workspaceId && !!tableId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to load more records for a specific Kanban column
 * Used for per-column pagination
 *
 * @param workspaceId - Current workspace ID
 * @param tableId - Table ID
 * @param table - Table with config
 * @param statusFieldName - Status field name
 * @param statusValue - Status value for this column
 * @param nextId - Cursor for next page
 * @param filters - Additional filters
 * @param encryptionKey - Encryption key
 * @param limit - Records per page
 */
export function useKanbanColumnLoadMore(
  workspaceId: string,
  tableId: string,
  table: ActiveTable | null,
  statusFieldName: string,
  statusValue: string,
  nextId: string | null,
  filters: Record<string, unknown> = {},
  encryptionKey: string | null,
  limit: number = 50,
) {
  return useQuery({
    queryKey: ['kanban-column-more', workspaceId, tableId, statusValue, nextId, filters, limit],
    queryFn: async () => {
      const request: RecordQueryRequest = {
        paging: 'cursor',
        filtering: {
          ...filters,
          record: {
            ...((filters.record as Record<string, unknown>) || {}),
            [statusFieldName]: statusValue,
          },
        },
        next_id: nextId,
        direction: 'desc',
        limit,
      };

      const response = await getActiveTableRecords(workspaceId, tableId, request);

      // Decrypt if needed
      let decryptedRecords = response.data;

      if (encryptionKey && table?.config?.fields) {
        try {
          decryptedRecords = await decryptRecords(response.data, table.config.fields, encryptionKey, true, 50);
        } catch (error) {
          console.error(`Failed to decrypt more records for status ${statusValue}:`, error);
        }
      }

      return {
        records: decryptedRecords,
        nextId: response.next_id || null,
      };
    },
    enabled: !!nextId && !!table && !!workspaceId && !!tableId,
  });
}
