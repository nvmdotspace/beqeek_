import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import {
  createActiveTableRecord,
  updateActiveTableRecord,
  deleteActiveTableRecord,
  type CreateRecordRequest,
  type UpdateRecordRequest
} from '../api/active-records-api';
import {
  encryptRecordForMutation,
  prepareEncryptedRequest,
  isValidEncryptionKey,
  EncryptionError,
} from '../utils/query-encryption';
import type { ActiveFieldConfig } from '../types';

export interface UseRecordManagementOptions {
  workspaceId: string;
  tableId: string;
  fields?: ActiveFieldConfig[];
  encryptionKey?: string;
  isE2EEEnabled?: boolean;
  onSuccess?: (message: string) => void;
  onError?: (error: string) => void;
}

export interface UseRecordManagementReturn {
  createRecord: (data: Record<string, any>) => Promise<void>;
  updateRecord: (recordId: string, data: Record<string, any>) => Promise<void>;
  deleteRecord: (recordId: string) => Promise<void>;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
}

export function useRecordManagement({
  workspaceId,
  tableId,
  fields,
  encryptionKey,
  isE2EEEnabled = false,
  onSuccess,
  onError,
}: UseRecordManagementOptions): UseRecordManagementReturn {
  const queryClient = useQueryClient();

  /**
   * Prepare record data for API request
   * Encrypts data if E2EE is enabled and encryption key is available
   */
  const prepareRecordData = async (data: Record<string, any>): Promise<CreateRecordRequest> => {
    // If E2EE is enabled, validate prerequisites and encrypt
    if (isE2EEEnabled) {
      if (!fields || fields.length === 0) {
        throw new EncryptionError('Field configurations required for E2EE tables');
      }

      if (!isValidEncryptionKey(encryptionKey)) {
        throw new EncryptionError('Valid 32-character encryption key required for E2EE tables');
      }

      try {
        // Encrypt record using encryption-core
        const encryptedPayload = await encryptRecordForMutation(data, fields, encryptionKey!);

        // Prepare request with encrypted data
        return prepareEncryptedRequest(encryptedPayload);
      } catch (error) {
        console.error('Encryption failed:', error);
        throw error instanceof EncryptionError
          ? error
          : new EncryptionError('Failed to encrypt record data', undefined, error as Error);
      }
    }

    // For non-E2EE tables, send plain data
    return {
      record: data,
      hashed_keywords: {},
      record_hashes: {},
    };
  };

  // Create record mutation
  const createRecordMutation = useMutation({
    mutationFn: async (data: Record<string, any>) => {
      const request = await prepareRecordData(data);
      return await createActiveTableRecord(workspaceId, tableId, request);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['records', workspaceId, tableId] });
      queryClient.invalidateQueries({ queryKey: ['active-records', workspaceId, tableId] });
      queryClient.invalidateQueries({ queryKey: ['active-table-records', workspaceId, tableId] });
      onSuccess?.('Record created successfully');
    },
    onError: (error) => {
      console.error('Failed to create record:', error);
      const errorMessage = error instanceof EncryptionError
        ? `Encryption error: ${error.message}`
        : 'Failed to create record. Please try again.';
      onError?.(errorMessage);
    },
  });

  // Update record mutation
  const updateRecordMutation = useMutation({
    mutationFn: async ({ recordId, data }: { recordId: string; data: Record<string, any> }) => {
      const request = await prepareRecordData(data);
      return await updateActiveTableRecord(workspaceId, tableId, recordId, request);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['records', workspaceId, tableId] });
      queryClient.invalidateQueries({ queryKey: ['active-records', workspaceId, tableId] });
      queryClient.invalidateQueries({ queryKey: ['active-table-records', workspaceId, tableId] });
      onSuccess?.('Record updated successfully');
    },
    onError: (error) => {
      console.error('Failed to update record:', error);
      const errorMessage = error instanceof EncryptionError
        ? `Encryption error: ${error.message}`
        : 'Failed to update record. Please try again.';
      onError?.(errorMessage);
    },
  });

  // Delete record mutation
  const deleteRecordMutation = useMutation({
    mutationFn: async (recordId: string) => {
      return await deleteActiveTableRecord(workspaceId, tableId, recordId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['records', workspaceId, tableId] });
      queryClient.invalidateQueries({ queryKey: ['active-records', workspaceId, tableId] });
      queryClient.invalidateQueries({ queryKey: ['active-table-records', workspaceId, tableId] });
      onSuccess?.('Record deleted successfully');
    },
    onError: (error) => {
      console.error('Failed to delete record:', error);
      onError?.('Failed to delete record. Please try again.');
    },
  });

  // Action methods
  const createRecord = useCallback(async (data: Record<string, any>) => {
    await createRecordMutation.mutateAsync(data);
  }, [createRecordMutation]);

  const updateRecord = useCallback(async (recordId: string, data: Record<string, any>) => {
    await updateRecordMutation.mutateAsync({ recordId, data });
  }, [updateRecordMutation]);

  const deleteRecord = useCallback(async (recordId: string) => {
    await deleteRecordMutation.mutateAsync(recordId);
  }, [deleteRecordMutation]);

  return {
    createRecord,
    updateRecord,
    deleteRecord,
    isCreating: createRecordMutation.isPending,
    isUpdating: updateRecordMutation.isPending,
    isDeleting: deleteRecordMutation.isPending,
  };
}
