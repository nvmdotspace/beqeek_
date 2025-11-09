/**
 * Hook to update Active Table records
 *
 * Handles encryption logic for E2EE tables and provides optimistic updates.
 * Used primarily for kanban drag-and-drop operations.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createActiveTablesApiClient } from '@/shared/api/active-tables-client';
import { buildEncryptedUpdatePayload, buildPlaintextUpdatePayload } from '@/shared/utils/field-encryption';
import type { Table, FieldConfig, TableRecord, RecordsResponse } from '@workspace/active-tables-core';
import type { FieldType } from '@workspace/beqeek-shared';

/**
 * Type for field values - can be string, number, boolean, Date, array, or null
 */
type FieldValue = string | number | boolean | Date | string[] | null | undefined;

/**
 * Standard API response for record mutations
 */
interface RecordMutationResponse {
  success: boolean;
  message: string;
  data?: {
    recordId: string;
    updatedAt: string;
  };
}

/**
 * Parameters for updating a single field
 */
export interface UpdateRecordFieldParams {
  recordId: string;
  fieldName: string;
  newValue: FieldValue;
}

/**
 * Hook to update a single field in a record
 *
 * @param workspaceId - Workspace ID
 * @param tableId - Table ID
 * @param table - Active table configuration (for encryption and field schema)
 * @returns Mutation object with mutate, mutateAsync, isPending, etc.
 *
 * @example
 * ```tsx
 * const updateMutation = useUpdateRecordField(workspaceId, tableId, table);
 *
 * // Update status field on drag-drop
 * updateMutation.mutate({
 *   recordId: '818047935265636353',
 *   fieldName: 'gender',
 *   newValue: 'female',
 * });
 * ```
 */
export function useUpdateRecordField(workspaceId: string, tableId: string, table: Table | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ recordId, fieldName, newValue }: UpdateRecordFieldParams) => {
      if (!table) {
        throw new Error('Table configuration not loaded');
      }

      const client = createActiveTablesApiClient(workspaceId);
      const isEncrypted = table.config.e2eeEncryption;

      let payload;

      if (isEncrypted) {
        // E2EE mode: Encrypt value before sending
        const encryptionKey = localStorage.getItem(`table_${tableId}_encryption_key`);

        if (!encryptionKey) {
          throw new Error('Encryption key not found. Please enter your encryption key.');
        }

        // Find field schema
        const fieldSchema = table.config.fields.find((f: FieldConfig) => f.name === fieldName);

        if (!fieldSchema) {
          throw new Error(`Field "${fieldName}" not found in table schema`);
        }

        // Build encrypted payload
        payload = buildEncryptedUpdatePayload(
          fieldName,
          newValue,
          fieldSchema as { type: FieldType },
          encryptionKey,
          table.config.hashedKeywordFields || [],
        );
      } else {
        // Plaintext mode
        payload = buildPlaintextUpdatePayload(fieldName, newValue);
      }

      // API endpoint: POST /api/workspace/{workspaceId}/workflow/patch/active_tables/{tableId}/records/{recordId}
      const response = await client.post<RecordMutationResponse>(
        `/workflow/patch/active_tables/${tableId}/records/${recordId}`,
        payload,
      );

      return response.data;
    },

    onMutate: async ({ recordId, fieldName, newValue }) => {
      if (!table) return;

      // Cancel outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({
        queryKey: ['active-table-records', workspaceId, tableId],
        exact: false,
      });

      // Snapshot all queries for rollback
      const previousQueries: { key: readonly unknown[]; data: unknown }[] = [];
      queryClient
        .getQueriesData({
          queryKey: ['active-table-records', workspaceId, tableId],
          exact: false,
        })
        .forEach(([key, data]) => {
          previousQueries.push({ key, data });
        });

      // Optimistically update all matching queries
      queryClient.setQueriesData(
        {
          queryKey: ['active-table-records', workspaceId, tableId],
          exact: false,
        },
        (old: RecordsResponse | undefined) => {
          if (!old?.data) return old;

          return {
            ...old,
            data: old.data.map((record: TableRecord) => {
              if (record.id === recordId) {
                return {
                  ...record,
                  record: {
                    ...record.record,
                    [fieldName]: newValue,
                  },
                  // Also update data field if it exists (for compatibility)
                  data: record.data
                    ? {
                        ...record.data,
                        [fieldName]: newValue,
                      }
                    : undefined,
                };
              }
              return record;
            }),
          };
        },
      );

      // Return context for rollback
      return { previousQueries };
    },

    onError: (err, variables, context) => {
      // Rollback on error - restore all previous queries
      if (context?.previousQueries) {
        context.previousQueries.forEach(({ key, data }) => {
          queryClient.setQueryData(key, data);
        });
      }

      console.error('Failed to update record:', err);
    },

    onSuccess: () => {
      if (!table) return;

      // Invalidate queries to refetch and sync with server
      // Use queryKey prefix to match all queries regardless of params
      queryClient.invalidateQueries({
        queryKey: ['active-table-records', workspaceId, tableId],
        exact: false, // Match all queries with this prefix
      });
    },
  });
}

/**
 * Hook for batch updating multiple fields
 *
 * @param workspaceId - Workspace ID
 * @param tableId - Table ID
 * @param table - Active table configuration (for encryption and field schema)
 * @returns Mutation object
 *
 * @example
 * ```tsx
 * const batchUpdate = useBatchUpdateRecord(workspaceId, tableId, table);
 *
 * batchUpdate.mutate({
 *   recordId: '123',
 *   updates: {
 *     status: 'done',
 *     priority: 'high',
 *     assignee: 'user123',
 *   },
 * });
 * ```
 */
export function useBatchUpdateRecord(workspaceId: string, tableId: string, table: Table | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ recordId, updates }: { recordId: string; updates: Record<string, FieldValue> }) => {
      if (!table) {
        throw new Error('Table configuration not loaded');
      }

      const client = createActiveTablesApiClient(workspaceId);
      const isEncrypted = table.config.e2eeEncryption;

      const payload: {
        record: Record<string, string | unknown>;
        hashed_keywords: Record<string, string>;
        record_hashes: Record<string, string>;
      } = {
        record: {},
        hashed_keywords: {},
        record_hashes: {},
      };

      if (isEncrypted) {
        const encryptionKey = localStorage.getItem(`table_${tableId}_encryption_key`);

        if (!encryptionKey) {
          throw new Error('Encryption key not found. Please enter your encryption key.');
        }

        // Encrypt each field
        for (const [fieldName, value] of Object.entries(updates)) {
          const fieldSchema = table.config.fields.find((f: FieldConfig) => f.name === fieldName);

          if (!fieldSchema) {
            console.warn(`Field "${fieldName}" not found in schema, skipping`);
            continue;
          }

          const fieldPayload = buildEncryptedUpdatePayload(
            fieldName,
            value,
            fieldSchema as { type: FieldType },
            encryptionKey,
            table.config.hashedKeywordFields || [],
          );

          // Merge into main payload
          Object.assign(payload.record, fieldPayload.record);
          Object.assign(payload.hashed_keywords, fieldPayload.hashed_keywords);
          Object.assign(payload.record_hashes, fieldPayload.record_hashes);
        }
      } else {
        // Plaintext mode
        payload.record = updates;
      }

      const response = await client.post<RecordMutationResponse>(
        `/workflow/patch/active_tables/${tableId}/records/${recordId}`,
        payload,
      );

      return response.data;
    },

    onSuccess: () => {
      if (!table) return;

      queryClient.invalidateQueries({
        queryKey: ['active-table-records', workspaceId, tableId],
        exact: false, // Match all queries with this prefix
      });
    },
  });
}
