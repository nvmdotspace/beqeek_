import { useAuthStore, selectIsAuthenticated } from '@/features/auth';
import { useQueryWithAuth } from '@/hooks/use-query-with-auth';
import { workflowUnitsApi } from '../api/workflow-units-api';

export const workflowUnitsQueryKey = (workspaceId?: string) => ['workflow-units', workspaceId ?? 'unknown'];

/**
 * Hook to fetch all workflow units for a workspace
 */
export const useWorkflowUnits = (workspaceId?: string) => {
  const isAuthenticated = useAuthStore(selectIsAuthenticated);

  return useQueryWithAuth({
    queryKey: workflowUnitsQueryKey(workspaceId),
    queryFn: () => workflowUnitsApi.getWorkflowUnits(workspaceId!),
    enabled: isAuthenticated && !!workspaceId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
