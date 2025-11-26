import { useMemo } from 'react';

import { useQueryWithAuth } from '@/hooks/use-query-with-auth';
import { useAuthStore, selectIsAuthenticated } from '@/features/auth';

import {
  getActiveTables,
  getActiveWorkGroups,
  getActiveTable,
  type GetActiveTablesOptions,
} from '../api/active-tables-api';
import { fetchActiveTableRecords, type FetchActiveRecordsParams } from '../api/active-records-api';
import { useEncryption } from './use-encryption-stub';

import type { ActiveTable, ActiveWorkGroup } from '../types';

export const activeWorkGroupsQueryKey = (workspaceId?: string) => ['active-work-groups', workspaceId ?? 'unknown'];
export const activeTablesQueryKey = (workspaceId?: string, filterIds?: string[]) => [
  'active-tables',
  workspaceId ?? 'unknown',
  filterIds?.length ? filterIds.sort().join(',') : 'all',
];
export const activeTableQueryKey = (workspaceId?: string, tableId?: string) => [
  'active-table',
  workspaceId ?? 'unknown',
  tableId ?? 'unknown',
];
export const activeTableRecordsQueryKey = (
  workspaceId?: string,
  tableId?: string,
  params?: Omit<FetchActiveRecordsParams, 'workspaceId' | 'tableId'>,
) => ['active-table-records', workspaceId ?? 'unknown', tableId ?? 'unknown', params ?? {}];

export const useActiveWorkGroups = (workspaceId?: string) => {
  const isAuthenticated = useAuthStore(selectIsAuthenticated);

  return useQueryWithAuth({
    queryKey: activeWorkGroupsQueryKey(workspaceId),
    queryFn: () => getActiveWorkGroups(workspaceId!),
    enabled: isAuthenticated && !!workspaceId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Options for useActiveTables hook
 */
export interface UseActiveTablesOptions {
  /** Filter by specific table IDs (id:in) */
  tableIds?: string[];
  /** Enable/disable query */
  enabled?: boolean;
}

/**
 * Hook to fetch active tables with optional filtering
 *
 * @example
 * ```tsx
 * // Fetch all tables
 * const { data } = useActiveTables(workspaceId);
 *
 * // Fetch specific tables by ID
 * const { data } = useActiveTables(workspaceId, {
 *   tableIds: ['table-1', 'table-2']
 * });
 * ```
 */
export const useActiveTables = (workspaceId?: string, options?: UseActiveTablesOptions) => {
  const { tableIds, enabled = true } = options ?? {};
  const isAuthenticated = useAuthStore(selectIsAuthenticated);

  // Build filtering object for id:in
  const filtering: GetActiveTablesOptions['filtering'] = tableIds?.length
    ? {
        'id:in': tableIds,
      }
    : undefined;

  return useQueryWithAuth({
    queryKey: activeTablesQueryKey(workspaceId, tableIds),
    queryFn: () => getActiveTables(workspaceId!, { filtering }),
    enabled: isAuthenticated && !!workspaceId && enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useActiveTable = (workspaceId?: string, tableId?: string) => {
  const isAuthenticated = useAuthStore(selectIsAuthenticated);

  return useQueryWithAuth({
    queryKey: activeTableQueryKey(workspaceId, tableId),
    queryFn: () => getActiveTable(workspaceId!, tableId!),
    enabled: isAuthenticated && !!workspaceId && !!tableId,
  });
};

export const useActiveTablesGroupedByWorkGroup = (workspaceId?: string) => {
  const workGroupsQuery = useActiveWorkGroups(workspaceId);
  const tablesQuery = useActiveTables(workspaceId);
  const isEnabled = Boolean(workspaceId);

  // Initialize encryption hook
  const { isReady: isEncryptionReady, initialize: initializeEncryption } = useEncryption();

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

    const result = groups.map((group) => ({
      group,
      tables: byGroup.get(group.id) ?? [],
    }));

    // Handle ungrouped tables (tables without a workGroup or with empty workGroupId)
    const ungroupedTables: ActiveTable[] = [];
    const existingGroupIds = new Set(groups.map((g) => g.id));

    tableList.forEach((table) => {
      if (!table.workGroupId || !existingGroupIds.has(table.workGroupId)) {
        ungroupedTables.push(table);
      }
    });

    // Add ungrouped tables as a default group if any exist
    if (ungroupedTables.length > 0) {
      result.push({
        group: {
          id: '',
          name: 'Ungrouped',
          description: 'Tables without a workgroup',
        } as ActiveWorkGroup,
        tables: ungroupedTables,
      });
    }

    return result;
  }, [isEnabled, workGroupsQuery.data, tablesQuery.data]);

  const hasAnyTables = tables.length > 0;

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
  };
};

/**
 * Combined hook that ensures table config is loaded before fetching records
 * This prevents race conditions where records API returns before table config
 * is available, which is critical for proper encryption/decryption handling
 */
export const useActiveTableRecordsWithConfig = (
  workspaceId?: string,
  tableId?: string,
  params?: Omit<FetchActiveRecordsParams, 'workspaceId' | 'tableId'>,
) => {
  const isAuthenticated = useAuthStore(selectIsAuthenticated);

  // Step 1: Load table details first
  const tableQuery = useActiveTable(workspaceId, tableId);
  const table = tableQuery.data?.data;

  // Step 2: Only enable records query when table config is available
  const recordsQuery = useQueryWithAuth({
    queryKey: activeTableRecordsQueryKey(workspaceId, tableId, params),
    queryFn: () =>
      fetchActiveTableRecords({
        workspaceId: workspaceId!,
        tableId: tableId!,
        ...params,
      }),
    // Wait for table config to be loaded before fetching records
    enabled: isAuthenticated && !!workspaceId && !!tableId && !!table?.config,
  });

  // Memoize records array to prevent unnecessary re-renders
  // The empty array fallback should be stable across renders
  const records = useMemo(() => recordsQuery.data?.data ?? [], [recordsQuery.data?.data]);
  const nextId = recordsQuery.data?.next_id ?? null;
  const previousId = recordsQuery.data?.previous_id ?? null;
  const isReady = !tableQuery.isLoading && !!table?.config && !recordsQuery.isLoading;

  return {
    // Table data
    table,
    tableLoading: tableQuery.isLoading,
    tableError: tableQuery.error,

    // Records data
    records,
    recordsLoading: recordsQuery.isLoading,
    recordsError: recordsQuery.error,

    // Pagination
    nextId,
    previousId,

    // Combined state
    isReady,
    isLoading: tableQuery.isLoading || recordsQuery.isLoading,
    error: tableQuery.error || recordsQuery.error,

    // Refetch functions
    refetchTable: tableQuery.refetch,
    refetchRecords: recordsQuery.refetch,
    refetchAll: async () => {
      await Promise.all([tableQuery.refetch(), recordsQuery.refetch()]);
    },
  };
};
