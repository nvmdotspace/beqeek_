import { useAuthStore, selectIsAuthenticated } from '@/features/auth';
import { useQueryWithAuth } from '@/hooks/use-query-with-auth';
import { workflowEventsApi } from '../api/workflow-events-api';

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
 * Hook to fetch active tables for ACTIVE_TABLE trigger configuration
 * Supports filtering by table IDs
 *
 * @example
 * ```tsx
 * // Fetch all active tables
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
  const filtering = tableIds?.length
    ? {
        'id:in': tableIds,
      }
    : undefined;

  return useQueryWithAuth({
    queryKey: activeTablesQueryKey(workspaceId, tableIds),
    queryFn: () =>
      workflowEventsApi.getActiveTables(workspaceId!, {
        filtering,
      }),
    enabled: isAuthenticated && !!workspaceId && enabled,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
};

/**
 * Hook to fetch a single active table with actions for ACTIVE_TABLE trigger configuration
 */
export const useActiveTable = (workspaceId?: string, tableId?: string) => {
  const isAuthenticated = useAuthStore(selectIsAuthenticated);

  return useQueryWithAuth({
    queryKey: activeTableQueryKey(workspaceId, tableId),
    queryFn: () => workflowEventsApi.getActiveTable(workspaceId!, tableId!),
    enabled: isAuthenticated && !!workspaceId && !!tableId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
};
