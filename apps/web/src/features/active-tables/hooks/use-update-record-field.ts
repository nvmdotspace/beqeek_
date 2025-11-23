/**
 * Hook for inline field editing with encryption support
 *
 * Handles single-field updates with proper encryption based on field type
 * Supports permissions check before allowing edits
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateActiveTableRecord } from '../api/active-records-api';
import { buildEncryptedUpdatePayload } from '@/shared/utils/field-encryption';
import type { Table, FieldConfig } from '@workspace/active-tables-core';
import type { FieldType } from '@workspace/beqeek-shared';
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

      // Determine encryption key (same logic as use-update-record.ts)
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

      if (!encryptKey) {
        throw new Error('Table encryption key not found. Cannot encrypt data.');
      }

      // Use buildEncryptedUpdatePayload (same as use-update-record.ts)
      // This ensures consistent payload format:
      // - record: encrypted field value
      // - hashed_keywords: array of keyword hashes (for searchable text fields)
      // - record_hashes: single hash of the value (for equality checks)
      const payload = buildEncryptedUpdatePayload(
        fieldName,
        value,
        fieldConfig as { type: FieldType },
        encryptKey,
        table.config.hashedKeywordFields || [],
      );

      // Send update
      await updateActiveTableRecord(workspaceId, tableId, recordId, payload);

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
