import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import {
  createActiveTableRecord,
  updateActiveTableRecord,
  deleteActiveTableRecord,
  type CreateRecordRequest,
  type UpdateRecordRequest
} from '../api/active-records-api';

export interface UseRecordManagementOptions {
  workspaceId: string;
  tableId: string;
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
  onSuccess,
  onError,
}: UseRecordManagementOptions): UseRecordManagementReturn {
  const queryClient = useQueryClient();

  // Create record mutation
  const createRecordMutation = useMutation({
    mutationFn: async (data: Record<string, any>) => {
      const request: CreateRecordRequest = {
        record: data,
        // TODO: Implement encryption and hashing based on table config
        hashed_keywords: {},
        record_hashes: {},
      };

      return await createActiveTableRecord(workspaceId, tableId, request);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['records', workspaceId, tableId] });
      queryClient.invalidateQueries({ queryKey: ['active-records', workspaceId, tableId] });
      onSuccess?.('Record created successfully');
    },
    onError: (error) => {
      console.error('Failed to create record:', error);
      onError?.('Failed to create record. Please try again.');
    },
  });

  // Update record mutation
  const updateRecordMutation = useMutation({
    mutationFn: async ({ recordId, data }: { recordId: string; data: Record<string, any> }) => {
      const request: UpdateRecordRequest = {
        record: data,
        // TODO: Implement encryption and hashing based on table config
        hashed_keywords: {},
        record_hashes: {},
      };

      return await updateActiveTableRecord(workspaceId, tableId, recordId, request);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['records', workspaceId, tableId] });
      queryClient.invalidateQueries({ queryKey: ['active-records', workspaceId, tableId] });
      onSuccess?.('Record updated successfully');
    },
    onError: (error) => {
      console.error('Failed to update record:', error);
      onError?.('Failed to update record. Please try again.');
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
