import { useAuthStore, selectIsAuthenticated } from '@/features/auth';
import { useQueryWithAuth } from '@/hooks/use-query-with-auth';
import { workflowEventsApi } from '../api/workflow-events-api';

export const activeTablesQueryKey = (workspaceId?: string) => ['active-tables', workspaceId ?? 'unknown'];

export const activeTableQueryKey = (workspaceId?: string, tableId?: string) => [
  'active-table',
  workspaceId ?? 'unknown',
  tableId ?? 'unknown',
];

/**
 * Hook to fetch active tables for ACTIVE_TABLE trigger configuration
 */
export const useActiveTables = (workspaceId?: string) => {
  const isAuthenticated = useAuthStore(selectIsAuthenticated);

  return useQueryWithAuth({
    queryKey: activeTablesQueryKey(workspaceId),
    queryFn: () => workflowEventsApi.getActiveTables(workspaceId!),
    enabled: isAuthenticated && !!workspaceId,
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
