/**
 * Hook to create Active Table records
 *
 * Handles encryption logic for E2EE tables and provides optimistic updates.
 * Encrypts all fields based on type, generates hashed keywords and record hashes.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createActiveTableRecord } from '../api/active-records-api';
import { CommonUtils, HMAC } from '@workspace/encryption-core';
import type { Table, FieldConfig } from '@workspace/active-tables-core';
import type { CreateRecordRequest } from '../api/active-records-api';

/**
 * Type for field values - can be string, number, boolean, Date, array, or null
 */
type FieldValue = string | number | boolean | Date | string[] | null | undefined;

/**
 * Standard API response for record creation
 */
type CreateRecordResponse = {
  data: {
    id: string;
  };
  message?: string;
};

/**
 * Parameters for creating a record
 */
export interface CreateRecordParams {
  record: Record<string, FieldValue>;
}

/**
 * Hook to create a new record
 *
 * @param workspaceId - Workspace ID
 * @param tableId - Table ID
 * @param table - Active table configuration (for encryption and field schema)
 * @returns Mutation object with mutate, mutateAsync, isPending, etc.
 *
 * @example
 * ```tsx
 * const createMutation = useCreateRecord(workspaceId, tableId, table);
 *
 * // Create new record
 * createMutation.mutate({
 *   record: {
 *     name: 'John Doe',
 *     email: 'john@example.com',
 *     status: 'active',
 *   },
 * }, {
 *   onSuccess: (response) => {
 *     console.log('Created record ID:', response.data.id);
 *   },
 * });
 * ```
 */
export function useCreateRecord(workspaceId: string, tableId: string, table: Table | null) {
  const queryClient = useQueryClient();

  return useMutation<CreateRecordResponse, Error, CreateRecordParams>({
    mutationFn: async ({ record }: CreateRecordParams) => {
      if (!table) {
        throw new Error('Table configuration not loaded');
      }

      const isE2EE = table.config.e2eeEncryption;

      // Debug logging
      console.log('[useCreateRecord] Table config:', {
        tableId,
        e2eeEncryption: table.config.e2eeEncryption,
        serverEncryptionKey: table.config.encryptionKey ? '***exists***' : 'null',
        hasLocalStorageKey: !!localStorage.getItem(`table_${tableId}_encryption_key`),
      });

      let encryptionKey: string | null = null;

      if (isE2EE) {
        // E2EE Mode: Use encryption key from localStorage
        encryptionKey = localStorage.getItem(`table_${tableId}_encryption_key`);

        if (!encryptionKey) {
          throw new Error('Encryption key not found. Please enter your encryption key.');
        }

        console.log('[useCreateRecord] E2EE mode: Encrypting with localStorage key');
      } else {
        // Server-Side Encryption Mode: Use encryption key from server config
        encryptionKey = table.config.encryptionKey ?? null;

        if (!encryptionKey) {
          throw new Error('Table encryption key not found in config. Cannot encrypt data.');
        }

        console.log('[useCreateRecord] Server-side encryption mode: Encrypting with server key');
      }

      // Build encrypted payload (both modes require encryption!)
      const payload = buildEncryptedCreatePayload(record, table, encryptionKey);
      console.log('[useCreateRecord] Encrypted payload:', payload);

      // API endpoint: POST /api/workspace/{workspaceId}/workflow/post/active_tables/{tableId}/records
      const response = await createActiveTableRecord(workspaceId, tableId, payload);

      return response;
    },

    onSuccess: () => {
      if (!table) return;

      // Invalidate queries to refetch and show the new record
      queryClient.invalidateQueries({
        queryKey: ['active-table-records', workspaceId, tableId],
        exact: false, // Match all queries with this prefix
      });

      // Also invalidate table detail query to update record count
      queryClient.invalidateQueries({
        queryKey: ['active-table-detail', workspaceId, tableId],
        exact: false,
      });
    },

    onError: (err) => {
      console.error('Failed to create record:', err);
    },
  });
}

/**
 * Build encrypted create payload
 * Encrypts all field values based on field type and generates hashes
 */
function buildEncryptedCreatePayload(
  record: Record<string, FieldValue>,
  table: Table,
  encryptionKey: string,
): CreateRecordRequest {
  const payload: CreateRecordRequest = {
    record: {},
    hashed_keywords: {},
    record_hashes: {},
  };

  const fields = table.config.fields;
  const hashedKeywordFields = table.config.hashedKeywordFields || [];

  // Create a temporary table detail for CommonUtils
  const tableDetail = {
    id: table.id,
    config: {
      ...table.config,
      encryptionKey: encryptionKey,
    },
  };

  // Step 1: Encrypt all fields first
  fields.forEach((field: FieldConfig) => {
    const fieldName = field.name;
    const value = record[fieldName];

    // Skip undefined/null/empty values for optional fields
    if (value === undefined || value === null || value === '') {
      return;
    }

    // Encrypt field value using CommonUtils
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const encryptedValue = CommonUtils.encryptTableData(tableDetail as any, fieldName, value);
    payload.record[fieldName] = encryptedValue;

    // Generate hashed_keywords ONLY for text fields configured for full-text search
    // Per blade.php logic (line 3162-3164), only add if:
    // 1. Field is in hashedKeywordFields config (for full-text search)
    // 2. AND field type is a text field (SHORT_TEXT, TEXT, RICH_TEXT, etc.)
    // NOTE: SELECT/CHECKBOX fields are NOT added to hashed_keywords
    if (hashedKeywordFields.includes(fieldName) && CommonUtils.encryptFields().includes(field.type)) {
      // Text fields: tokenize and hash each token for full-text search
      // Returns array of hashed tokens: ['hash1', 'hash2', ...]
      payload.hashed_keywords![fieldName] = CommonUtils.hashKeyword(value as string, encryptionKey);
    }
  });

  // Step 2: Generate record_hashes from ENCRYPTED values (not raw values)
  // This ensures integrity check on server side matches encrypted data
  fields.forEach((field: FieldConfig) => {
    const fieldName = field.name;
    const encryptedValue = payload.record[fieldName];

    // Skip reference fields and undefined values
    if (!encryptedValue || CommonUtils.noneEncryptFields().includes(field.type)) {
      return;
    }

    // Hash the encrypted value
    if (Array.isArray(encryptedValue)) {
      payload.record_hashes![fieldName] = HMAC.hashArray(
        encryptedValue.map((v) => String(v)),
        encryptionKey,
      );
    } else {
      payload.record_hashes![fieldName] = HMAC.hash(String(encryptedValue), encryptionKey);
    }
  });

  return payload;
}

/**
 * Note: buildPlaintextCreatePayload was removed.
 *
 * According to encryption-modes-corrected.md, BOTH encryption modes
 * (server-side and E2EE) require client-side encryption before sending.
 * The only difference is WHERE the encryption key comes from:
 * - Server-side: table.config.encryptionKey
 * - E2EE: localStorage
 *
 * Both modes use buildEncryptedCreatePayload().
 */
