import { useMemo } from 'react';

import { useQueryWithAuth } from '@/hooks/use-query-with-auth';
import { useAuthStore, selectIsAuthenticated } from '@/features/auth';

import { getActiveTables, getActiveWorkGroups } from '../api/active-tables-api';
import { useTableManager, useEncryption } from '@workspace/active-tables-hooks';
import { createActiveTablesApiClient } from '@/shared/api/active-tables-client';
import type { ActiveTable, ActiveWorkGroup } from '../types';

export const activeWorkGroupsQueryKey = (workspaceId?: string) => ['active-work-groups', workspaceId ?? 'unknown'];
export const activeTablesQueryKey = (workspaceId?: string) => ['active-tables', workspaceId ?? 'unknown'];

export const useActiveWorkGroups = (workspaceId?: string) => {
  const isAuthenticated = useAuthStore(selectIsAuthenticated);

  return useQueryWithAuth({
    queryKey: activeWorkGroupsQueryKey(workspaceId),
    queryFn: () => getActiveWorkGroups(workspaceId!),
    enabled: isAuthenticated && !!workspaceId,
  });
};

export const useActiveTables = (workspaceId?: string) => {
  const isAuthenticated = useAuthStore(selectIsAuthenticated);

  return useQueryWithAuth({
    queryKey: activeTablesQueryKey(workspaceId),
    queryFn: () => getActiveTables(workspaceId!),
    enabled: isAuthenticated && !!workspaceId,
  });
};

export const useActiveTablesGroupedByWorkGroup = (workspaceId?: string) => {
  const workGroupsQuery = useActiveWorkGroups(workspaceId);
  const tablesQuery = useActiveTables(workspaceId);
  const isEnabled = Boolean(workspaceId);

  // Initialize encryption and table manager hooks
  const { isReady: isEncryptionReady, initialize: initializeEncryption } = useEncryption();

  // Create real API client if workspaceId is available
  const apiClient = useMemo(() => {
    if (!workspaceId) return null;
    return createActiveTablesApiClient(workspaceId);
  }, [workspaceId]);

  const { tables: coreTables, isLoadingTables } = useTableManager({
    apiClient: apiClient || {
      get: async (_url: string) => ({ data: {} }),
      post: async (_url: string, _data?: any) => ({ data: {} }),
      put: async (_url: string, _data?: any) => ({ data: {} }),
      delete: async (_url: string) => {},
    },
    workspaceId: workspaceId || '',
  });

  const workGroups = isEnabled ? (workGroupsQuery.data?.data ?? []) : [];
  const tables = isEnabled ? (tablesQuery.data?.data ?? []) : [];

  const grouped = useMemo<Array<{ group: ActiveWorkGroup; tables: ActiveTable[] }>>(() => {
    if (!isEnabled) {
      return [];
    }

    const groups = workGroupsQuery.data?.data ?? [];
    const tableList = tablesQuery.data?.data ?? [];
    const byGroup = new Map<string, ActiveTable[]>();

    tableList.forEach((table) => {
      const list = byGroup.get(table.workGroupId) ?? [];
      list.push(table);
      byGroup.set(table.workGroupId, list);
    });

    return groups.map((group) => ({
      group,
      tables: byGroup.get(group.id) ?? [],
    }));
  }, [isEnabled, workGroupsQuery.data, tablesQuery.data]);

  const hasAnyTables = grouped.some((entry) => entry.tables.length > 0);

  return {
    workGroups,
    tables,
    grouped,
    hasAnyTables,
    isLoading: !isEnabled ? false : workGroupsQuery.isLoading || tablesQuery.isLoading,
    isFetching: !isEnabled ? false : workGroupsQuery.isFetching || tablesQuery.isFetching,
    error: !isEnabled ? null : workGroupsQuery.error || tablesQuery.error,
    refetch: async () => {
      if (!isEnabled) return;
      await Promise.all([workGroupsQuery.refetch(), tablesQuery.refetch()]);
    },
    // Additional hooks integration
    isEncryptionReady,
    initializeEncryption,
    coreTables,
    isLoadingCoreTables: isLoadingTables,
  };
};
