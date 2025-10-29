import { useCallback, useMemo, useState } from 'react';

import { useQueryWithAuth } from '@/hooks/use-query-with-auth';
import { useAuthStore, selectIsAuthenticated } from '@/features/auth';

import { fetchActiveTableRecords } from '../api/active-records-api';
import { decryptRecords } from '../utils/record-decryptor';
import { analyzeRecordsEncryption } from '../utils/encryption-detection';
import type { ActiveRecordsResponse, ActiveTableRecord, ActiveFieldConfig } from '../types';

export interface UseActiveRecordsOptions {
  workspaceId?: string;
  tableId?: string;
  pageSize?: number;
  fields?: ActiveFieldConfig[];
  encryptionKey?: string;
  isE2EEEnabled?: boolean;
}

export interface UseActiveRecordsResult {
  records: ActiveTableRecord[];
  response: ActiveRecordsResponse | undefined;
  page: number;
  pageSize: number;
  setPage: (page: number) => void;
  loadNext: () => void;
  loadPrevious: () => void;
  isLoading: boolean;
  isFetching: boolean;
  error: Error | null;
  refetch: () => void;
  /** Whether data appears to be encrypted (detected from patterns) */
  dataLooksEncrypted: boolean;
}

export const useActiveTableRecords = (options: UseActiveRecordsOptions): UseActiveRecordsResult => {
  const {
    workspaceId,
    tableId,
    pageSize = 25,
    fields,
    encryptionKey,
    isE2EEEnabled = false,
  } = options;
  const [page, setPage] = useState(0);
  const isAuthenticated = useAuthStore(selectIsAuthenticated);

  // For E2EE tables, wait for encryption key to be loaded before fetching
  const enabled = Boolean(
    isAuthenticated &&
    workspaceId &&
    tableId &&
    (!isE2EEEnabled || (isE2EEEnabled && encryptionKey && fields))
  );

  const queryResult = useQueryWithAuth({
    // Include encryption state in queryKey to trigger refetch when it changes
    queryKey: [
      'active-table-records',
      workspaceId,
      tableId,
      page,
      pageSize,
      isE2EEEnabled,
      encryptionKey ? 'with-key' : 'no-key', // Track key availability without exposing actual key
    ],
    queryFn: async () => {
      console.log('[useActiveTableRecords] Fetching records with:', {
        isE2EEEnabled,
        hasEncryptionKey: !!encryptionKey,
        hasFields: !!fields,
        fieldsCount: fields?.length || 0,
      });

      // Step 1: Fetch encrypted records from API
      const response = await fetchActiveTableRecords({
        workspaceId: workspaceId!,
        tableId: tableId!,
        limit: pageSize,
        offset: page * pageSize,
      });

      console.log('[useActiveTableRecords] Fetched', response.data?.length || 0, 'records');

      // Step 2: Auto-detect encryption if config doesn't indicate it
      let shouldDecrypt = isE2EEEnabled;

      if (!isE2EEEnabled && response.data && response.data.length > 0) {
        const encryptionAnalysis = analyzeRecordsEncryption(response.data);
        console.log('[useActiveTableRecords] Encryption auto-detection:', encryptionAnalysis);

        if (encryptionAnalysis.looksEncrypted) {
          console.warn(
            '[useActiveTableRecords] ⚠️ Data appears encrypted but e2eeEncryption flag is false. ' +
            `${encryptionAnalysis.encryptionPercentage.toFixed(1)}% of fields look encrypted.`
          );
          shouldDecrypt = true;
        }
      }

      // Step 3: Decrypt records if encryption is detected and prerequisites are met
      if (shouldDecrypt && encryptionKey && fields && fields.length > 0 && response.data) {
        console.log('[useActiveTableRecords] Starting decryption...');
        try {
          // Decrypt records using existing decryptor (with caching)
          const decryptedRecords = await decryptRecords(
            response.data,
            fields,
            encryptionKey,
            true // useCache = true for better performance
          );

          console.log('[useActiveTableRecords] Decryption complete. Sample decrypted record:', {
            id: decryptedRecords[0]?.id,
            recordKeys: decryptedRecords[0] ? Object.keys(decryptedRecords[0].record) : [],
            firstFieldValue: decryptedRecords[0]
              ? decryptedRecords[0].record[Object.keys(decryptedRecords[0].record)[0]]
              : null,
          });

          // Return response with decrypted records
          return {
            ...response,
            data: decryptedRecords,
          };
        } catch (error) {
          console.error('[useActiveTableRecords] Failed to decrypt records:', error);
          // Return original encrypted records on decryption error
          // This allows UI to still render, though data will be encrypted
          return response;
        }
      }

      // Return records as-is if decryption not needed or not available
      console.log('[useActiveTableRecords] Decryption skipped:', {
        isE2EEEnabled,
        hasEncryptionKey: !!encryptionKey,
        hasFields: !!fields,
        reason: !isE2EEEnabled
          ? 'E2EE not enabled'
          : !encryptionKey
          ? 'No encryption key'
          : !fields
          ? 'No fields config'
          : 'Unknown',
      });
      return response;
    },
    enabled,
    placeholderData: (previousData) => previousData,
  });

  const records = useMemo(() => queryResult.data?.data ?? [], [queryResult.data]);

  // Detect if data looks encrypted (for UI indicators)
  const dataLooksEncrypted = useMemo(() => {
    if (isE2EEEnabled) return true; // Config says it's encrypted
    if (records.length === 0) return false;

    const analysis = analyzeRecordsEncryption(records);
    return analysis.looksEncrypted;
  }, [records, isE2EEEnabled]);

  const loadNext = useCallback(() => {
    if (!queryResult.data?.data?.length) return;
    setPage((prev) => prev + 1);
  }, [queryResult.data]);

  const loadPrevious = useCallback(() => {
    setPage((prev) => Math.max(prev - 1, 0));
  }, []);

  const refetch = useCallback(() => {
    queryResult.refetch();
  }, [queryResult]);

  return {
    records,
    response: queryResult.data,
    page,
    pageSize,
    setPage,
    loadNext,
    loadPrevious,
    isLoading: queryResult.isLoading,
    isFetching: queryResult.isFetching,
    error: (queryResult.error as Error) ?? null,
    refetch,
    dataLooksEncrypted,
  };
};
