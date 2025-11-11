/**
 * Hook for inline field editing with encryption support
 *
 * Handles single-field updates with proper encryption based on field type
 * Supports permissions check before allowing edits
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateActiveTableRecord } from '../api/active-records-api';
import { CommonUtils } from '@workspace/encryption-core';
import type { Table, FieldConfig } from '@workspace/active-tables-core';
import type { ActiveTableRecordPermissions } from '../types';

export interface UpdateFieldOptions {
  /** Encryption key for E2EE tables */
  encryptionKey?: string | null;
  /** Callback on success */
  onSuccess?: () => void;
  /** Callback on error */
  onError?: (error: Error) => void;
}

/**
 * Hook for updating a single record field
 *
 * @example
 * ```tsx
 * const { updateField, isUpdating } = useUpdateRecordField(
 *   workspaceId,
 *   tableId,
 *   recordId,
 *   table,
 *   { encryptionKey: encryption.encryptionKey }
 * );
 *
 * // Update a field
 * await updateField('title', 'New Title');
 * ```
 */
export function useUpdateRecordField(
  workspaceId: string,
  tableId: string,
  recordId: string,
  table: Table | null,
  options?: UpdateFieldOptions,
) {
  const queryClient = useQueryClient();
  const { encryptionKey, onSuccess, onError } = options ?? {};

  const mutation = useMutation({
    mutationFn: async ({ fieldName, value }: { fieldName: string; value: unknown }) => {
      if (!table) {
        throw new Error('Table config not available');
      }

      // Find field config
      const fieldConfig = table.config.fields?.find((f) => f.name === fieldName);
      if (!fieldConfig) {
        throw new Error(`Field ${fieldName} not found in table config`);
      }

      // Determine encryption key
      let encryptKey: string | null = null;
      if (table.config.e2eeEncryption) {
        // E2EE mode: use provided encryption key
        encryptKey = encryptionKey ?? null;
        if (!encryptKey) {
          throw new Error('Encryption key required for E2EE table');
        }
      } else if (table.config.encryptionKey) {
        // Server-side encryption: use key from config
        encryptKey = table.config.encryptionKey;
      }

      // Encrypt value if needed
      let encryptedValue = value;
      let recordHashes: Record<string, string | string[]> = {};

      if (encryptKey) {
        // Create table detail object for encryption
        const tableDetail = {
          ...table,
          config: {
            ...table.config,
            encryptionKey: encryptKey,
          },
        };

        // Encrypt the value based on field type
        encryptedValue = CommonUtils.encryptTableData(tableDetail as any, fieldName, value);

        // Generate hash for searchable fields (text fields)
        if (typeof value === 'string' && value.trim()) {
          const hashedKeywords = CommonUtils.hashKeyword(value, encryptKey);
          if (hashedKeywords.length > 0) {
            recordHashes[fieldName] = hashedKeywords;
          }
        }
      }

      // Prepare update request
      const updateRequest = {
        record: {
          [fieldName]: encryptedValue,
        },
        record_hashes: Object.keys(recordHashes).length > 0 ? recordHashes : undefined,
      };

      // Send update
      await updateActiveTableRecord(workspaceId, tableId, recordId, updateRequest);

      return { fieldName, value };
    },
    onSuccess: (data) => {
      // Invalidate record cache to refetch updated data
      void queryClient.invalidateQueries({
        queryKey: ['record', workspaceId, tableId, recordId],
      });

      // Also invalidate records list
      void queryClient.invalidateQueries({
        queryKey: ['active-table-records', workspaceId, tableId],
      });

      onSuccess?.();
    },
    onError: (error: Error) => {
      console.error('[useUpdateRecordField] Update failed:', error);
      onError?.(error);
    },
  });

  return {
    updateField: mutation.mutate,
    updateFieldAsync: mutation.mutateAsync,
    isUpdating: mutation.isPending,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
  };
}

/**
 * Check if user can edit a specific field
 *
 * @param permissions - Record permissions from API
 * @param fieldConfig - Field configuration
 * @returns true if user can edit the field
 */
export function canEditField(permissions: ActiveTableRecordPermissions | undefined, fieldConfig: FieldConfig): boolean {
  if (!permissions) return false;

  // Check if user has update permission
  if (!permissions.update) return false;

  // Check field-specific edit restrictions if any
  // TODO: Add field-level permission checks when implemented
  // For now, just check record-level update permission

  return true;
}
