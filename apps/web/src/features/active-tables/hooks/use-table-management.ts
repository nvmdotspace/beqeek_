import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import {
  createActiveTable,
  updateActiveTable,
  deleteActiveTable,
  type CreateTableRequest,
  type UpdateTableRequest
} from '../api/active-tables-api';
import type { TableFormData } from '../components/table-management-dialog';

export interface UseTableManagementOptions {
  workspaceId: string;
  onSuccess?: (message: string) => void;
  onError?: (error: string) => void;
}

export interface UseTableManagementReturn {
  createTable: (data: TableFormData) => Promise<void>;
  updateTable: (tableId: string, data: TableFormData) => Promise<void>;
  deleteTable: (tableId: string) => Promise<void>;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
}

export function useTableManagement({
  workspaceId,
  onSuccess,
  onError,
}: UseTableManagementOptions): UseTableManagementReturn {
  const queryClient = useQueryClient();

  // Create table mutation
  const createTableMutation = useMutation({
    mutationFn: async (data: TableFormData) => {
      const request: CreateTableRequest = {
        data: {
          name: data.name,
          workGroupId: data.workGroupId,
          tableType: data.tableType,
          description: data.description,
          config: {
            title: data.name,
            fields: data.fields,
            e2eeEncryption: data.e2eeEncryption,
            encryptionKey: data.encryptionKey,
            actions: [],
            quickFilters: [],
            tableLimit: 1000,
            hashedKeywordFields: [],
            defaultSort: 'createdAt',
            kanbanConfigs: [],
            recordListConfig: {
              layout: 'table',
              titleField: data.fields[0]?.name || 'id',
              subLineFields: [],
              tailFields: [],
            },
            recordDetailConfig: {
              layout: 'head-detail',
              commentsPosition: 'bottom',
              headTitleField: data.fields[0]?.name || 'id',
              headSubLineFields: [],
              rowTailFields: [],
            },
            permissionsConfig: [],
            ganttCharts: [],
            encryptionAuthKey: data.encryptionKey ?
              // Simple hash for demo - in production use proper crypto
              btoa(data.encryptionKey.repeat(3)).substring(0, 64) :
              '',
          },
        },
      };

      return await createActiveTable(workspaceId, request);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables', workspaceId] });
      queryClient.invalidateQueries({ queryKey: ['active-tables', workspaceId] });
      onSuccess?.('Table created successfully');
    },
    onError: (error) => {
      console.error('Failed to create table:', error);
      onError?.('Failed to create table. Please try again.');
    },
  });

  // Update table mutation
  const updateTableMutation = useMutation({
    mutationFn: async ({ tableId, data }: { tableId: string; data: TableFormData }) => {
      const request: UpdateTableRequest = {
        data: {
          name: data.name,
          workGroupId: data.workGroupId,
          tableType: data.tableType,
          description: data.description,
          config: {
            title: data.name,
            fields: data.fields,
            e2eeEncryption: data.e2eeEncryption,
            encryptionKey: data.encryptionKey,
            actions: [],
            quickFilters: [],
            tableLimit: 1000,
            hashedKeywordFields: [],
            defaultSort: 'createdAt',
            kanbanConfigs: [],
            recordListConfig: {
              layout: 'table',
              titleField: data.fields[0]?.name || 'id',
              subLineFields: [],
              tailFields: [],
            },
            recordDetailConfig: {
              layout: 'head-detail',
              commentsPosition: 'bottom',
              headTitleField: data.fields[0]?.name || 'id',
              headSubLineFields: [],
              rowTailFields: [],
            },
            permissionsConfig: [],
            ganttCharts: [],
            encryptionAuthKey: data.encryptionKey ?
              btoa(data.encryptionKey.repeat(3)).substring(0, 64) :
              '',
          },
        },
      };

      return await updateActiveTable(workspaceId, tableId, request);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables', workspaceId] });
      queryClient.invalidateQueries({ queryKey: ['active-tables', workspaceId] });
      onSuccess?.('Table updated successfully');
    },
    onError: (error) => {
      console.error('Failed to update table:', error);
      onError?.('Failed to update table. Please try again.');
    },
  });

  // Delete table mutation
  const deleteTableMutation = useMutation({
    mutationFn: async (tableId: string) => {
      return await deleteActiveTable(workspaceId, tableId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables', workspaceId] });
      queryClient.invalidateQueries({ queryKey: ['active-tables', workspaceId] });
      onSuccess?.('Table deleted successfully');
    },
    onError: (error) => {
      console.error('Failed to delete table:', error);
      onError?.('Failed to delete table. Please try again.');
    },
  });

  // Action methods
  const createTable = useCallback(async (data: TableFormData) => {
    await createTableMutation.mutateAsync(data);
  }, [createTableMutation]);

  const updateTable = useCallback(async (tableId: string, data: TableFormData) => {
    await updateTableMutation.mutateAsync({ tableId, data });
  }, [updateTableMutation]);

  const deleteTable = useCallback(async (tableId: string) => {
    await deleteTableMutation.mutateAsync(tableId);
  }, [deleteTableMutation]);

  return {
    createTable,
    updateTable,
    deleteTable,
    isCreating: createTableMutation.isPending,
    isUpdating: updateTableMutation.isPending,
    isDeleting: deleteTableMutation.isPending,
  };
}
