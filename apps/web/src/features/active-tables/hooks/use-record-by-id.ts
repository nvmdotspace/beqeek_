/**
 * Hook to fetch a single record by ID
 *
 * Uses filtering[id][eq]=recordId with limit=1 for efficient fetching
 * Handles encryption/decryption automatically based on table config
 *
 * @see docs/specs/doc-get-active-records.md
 * @see docs/technical/encryption-modes-corrected.md
 */

import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { fetchActiveTableRecords } from '../api/active-records-api';
import { decryptRecord } from '@workspace/active-tables-core';
import type { Table, TableRecord } from '@workspace/active-tables-core';
import type { ActiveTableRecord } from '../types';

export interface UseRecordByIdOptions {
  /** Enable/disable query */
  enabled?: boolean;
  /** Encryption key for E2EE tables */
  encryptionKey?: string | null;
  /** Refetch interval in ms */
  refetchInterval?: number;
}

/**
 * Fetch and decrypt a single record by ID
 *
 * @param workspaceId - Workspace ID
 * @param tableId - Table ID
 * @param recordId - Record ID to fetch
 * @param table - Table config (for decryption)
 * @param options - Query options
 *
 * @example
 * ```tsx
 * const { record, isLoading, error } = useRecordById(
 *   workspaceId,
 *   tableId,
 *   recordId,
 *   table,
 *   { encryptionKey: encryption.encryptionKey }
 * );
 * ```
 */
export function useRecordById(
  workspaceId: string,
  tableId: string,
  recordId: string,
  table: Table | null,
  options?: UseRecordByIdOptions,
) {
  const { enabled = true, encryptionKey, refetchInterval } = options ?? {};

  // Fetch record with filtering[id:eq]=recordId
  const query = useQuery({
    queryKey: ['record', workspaceId, tableId, recordId],
    queryFn: async () => {
      const response = await fetchActiveTableRecords({
        workspaceId,
        tableId,
        limit: 1,
        offset: 0,
        filters: {
          'id:eq': recordId,
        },
      });

      // Return first record or null
      return response.data[0] || null;
    },
    enabled: enabled && !!workspaceId && !!tableId && !!recordId,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    refetchInterval,
    retry: 2,
  });

  // Decrypt record if needed (async operation)
  const [decryptedRecord, setDecryptedRecord] = useState<TableRecord | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);

  useEffect(() => {
    const decryptAsync = async () => {
      const rawRecord = query.data;
      if (!rawRecord || !table) {
        setDecryptedRecord(null);
        return;
      }

      // Convert ActiveTableRecord to TableRecord format
      const record: TableRecord = {
        id: rawRecord.id,
        record: rawRecord.record, // Required field
        data: rawRecord.record, // Alias for convenience
        createdBy: rawRecord.createdBy,
        updatedBy: rawRecord.updatedBy,
        createdAt: rawRecord.createdAt,
        updatedAt: rawRecord.updatedAt,
        valueUpdatedAt: rawRecord.valueUpdatedAt,
        relatedUserIds: rawRecord.relatedUserIds,
        assignedUserIds: rawRecord.assignedUserIds,
        record_hashes: rawRecord.record_hashes,
        hashed_keywords: rawRecord.hashed_keywords,
        permissions: rawRecord.permissions,
      };

      // Check if encryption is enabled
      const needsDecryption = table.config.e2eeEncryption || table.config.encryptionKey;
      if (!needsDecryption) {
        // No encryption - ensure data property is synced
        const recordWithData: TableRecord = {
          ...record,
          data: record.record,
        };
        setDecryptedRecord(recordWithData);
        return;
      }

      // Determine decryption key
      let decryptKey: string | null = null;
      if (table.config.e2eeEncryption) {
        // E2EE mode: use provided encryption key
        decryptKey = encryptionKey ?? null;
      } else {
        // Server-side encryption: use key from config
        decryptKey = table.config.encryptionKey ?? null;
      }

      if (!decryptKey) {
        // No key available - return encrypted record with data property
        const recordWithData: TableRecord = {
          ...record,
          data: record.record,
        };
        setDecryptedRecord(recordWithData);
        return;
      }

      // Decrypt record asynchronously
      setIsDecrypting(true);
      try {
        const decrypted = await decryptRecord(record, table.config.fields ?? [], decryptKey);
        // Ensure both 'record' and 'data' properties exist after decryption
        const recordWithData: TableRecord = {
          ...decrypted,
          data: decrypted.record, // Sync data with decrypted record
        };
        setDecryptedRecord(recordWithData);
      } catch (error) {
        console.error('[useRecordById] Decryption failed:', error);
        // Return encrypted record with data property on error
        const recordWithData: TableRecord = {
          ...record,
          data: record.record,
        };
        setDecryptedRecord(recordWithData);
      } finally {
        setIsDecrypting(false);
      }
    };

    void decryptAsync();
  }, [query.data, table, encryptionKey]);

  return {
    record: decryptedRecord,
    rawRecord: query.data as ActiveTableRecord | null,
    isLoading: query.isLoading || isDecrypting,
    isFetching: query.isFetching,
    isDecrypting,
    error: query.error,
    refetch: query.refetch,
    permissions: query.data?.permissions,
  };
}
