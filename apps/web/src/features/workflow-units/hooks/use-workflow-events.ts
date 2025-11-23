import { useAuthStore, selectIsAuthenticated } from '@/features/auth';
import { useQueryWithAuth } from '@/hooks/use-query-with-auth';
import { workflowEventsApi } from '../api/workflow-events-api';

export const workflowEventsQueryKey = (workspaceId?: string, unitId?: string) => [
  'workflow-events',
  workspaceId ?? 'unknown',
  unitId ?? 'all',
];

/**
 * Hook to fetch all workflow events for a workspace (optionally filtered by unit ID)
 */
export const useWorkflowEvents = (workspaceId?: string, unitId?: string) => {
  const isAuthenticated = useAuthStore(selectIsAuthenticated);

  return useQueryWithAuth({
    queryKey: workflowEventsQueryKey(workspaceId, unitId),
    queryFn: () => workflowEventsApi.getWorkflowEvents(workspaceId!, unitId),
    enabled: isAuthenticated && !!workspaceId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
