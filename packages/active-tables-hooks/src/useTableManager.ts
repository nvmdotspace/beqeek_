import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { TableManager } from '@workspace/active-tables-core';
import type { TableConfig, CreateTableRequest, UpdateTableRequest } from '@workspace/active-tables-core';

export interface UseTableManagerOptions {
  apiClient: any;
  workspaceId: string;
}

export interface UseTableManagerReturn {
  // Queries
  tables: TableConfig[] | undefined;
  isLoadingTables: boolean;
  tablesError: Error | null;

  // Mutations
  createTableMutation: any;
  updateTableMutation: any;
  deleteTableMutation: any;
  duplicateTableMutation: any;

  // Actions
  createTable: (request: CreateTableRequest) => Promise<TableConfig>;
  updateTable: (tableId: string, request: UpdateTableRequest) => Promise<TableConfig>;
  deleteTable: (tableId: string) => Promise<void>;
  duplicateTable: (sourceTableId: string, newName: string) => Promise<TableConfig>;
  getTable: (tableId: string) => Promise<TableConfig | null>;
  refreshTables: () => void;
}

export function useTableManager(options: UseTableManagerOptions): UseTableManagerReturn {
  const { apiClient, workspaceId } = options;
  const queryClient = useQueryClient();

  const tableManager = new TableManager(apiClient);

  // Query for tables list
  const {
    data: tables,
    isLoading: isLoadingTables,
    error: tablesError
  } = useQuery({
    queryKey: ['tables', workspaceId],
    queryFn: () => tableManager.listTables(workspaceId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Create table mutation
  const createTableMutation = useMutation({
    mutationFn: (request: CreateTableRequest) => tableManager.createTable(request),
    onSuccess: (newTable) => {
      queryClient.invalidateQueries({ queryKey: ['tables', workspaceId] });
      queryClient.setQueryData(['table', newTable.id], newTable);
    },
    onError: (error) => {
      console.error('Failed to create table:', error);
    }
  });

  // Update table mutation
  const updateTableMutation = useMutation({
    mutationFn: ({ tableId, request }: { tableId: string; request: UpdateTableRequest }) =>
      tableManager.updateTable(tableId, request),
    onSuccess: (updatedTable) => {
      queryClient.invalidateQueries({ queryKey: ['tables', workspaceId] });
      queryClient.setQueryData(['table', updatedTable.id], updatedTable);
    },
    onError: (error) => {
      console.error('Failed to update table:', error);
    }
  });

  // Delete table mutation
  const deleteTableMutation = useMutation({
    mutationFn: (tableId: string) => tableManager.deleteTable(tableId),
    onSuccess: (_, tableId) => {
      queryClient.invalidateQueries({ queryKey: ['tables', workspaceId] });
      queryClient.removeQueries({ queryKey: ['table', tableId] });
    },
    onError: (error) => {
      console.error('Failed to delete table:', error);
    }
  });

  // Duplicate table mutation
  const duplicateTableMutation = useMutation({
    mutationFn: ({ sourceTableId, newName }: { sourceTableId: string; newName: string }) =>
      tableManager.duplicateTable(sourceTableId, newName),
    onSuccess: (newTable) => {
      queryClient.invalidateQueries({ queryKey: ['tables', workspaceId] });
      queryClient.setQueryData(['table', newTable.id], newTable);
    },
    onError: (error) => {
      console.error('Failed to duplicate table:', error);
    }
  });

  // Action methods
  const createTable = useCallback(async (request: CreateTableRequest): Promise<TableConfig> => {
    return createTableMutation.mutateAsync(request);
  }, [createTableMutation]);

  const updateTable = useCallback(async (
    tableId: string,
    request: UpdateTableRequest
  ): Promise<TableConfig> => {
    return updateTableMutation.mutateAsync({ tableId, request });
  }, [updateTableMutation]);

  const deleteTable = useCallback(async (tableId: string): Promise<void> => {
    return deleteTableMutation.mutateAsync(tableId);
  }, [deleteTableMutation]);

  const duplicateTable = useCallback(async (
    sourceTableId: string,
    newName: string
  ): Promise<TableConfig> => {
    return duplicateTableMutation.mutateAsync({ sourceTableId, newName });
  }, [duplicateTableMutation]);

  const getTable = useCallback(async (tableId: string): Promise<TableConfig | null> => {
    return tableManager.getTable(tableId);
  }, [tableManager]);

  const refreshTables = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['tables', workspaceId] });
  }, [queryClient, workspaceId]);

  return {
    // Queries
    tables,
    isLoadingTables,
    tablesError,

    // Mutations
    createTableMutation,
    updateTableMutation,
    deleteTableMutation,
    duplicateTableMutation,

    // Actions
    createTable,
    updateTable,
    deleteTable,
    duplicateTable,
    getTable,
    refreshTables
  };
}
