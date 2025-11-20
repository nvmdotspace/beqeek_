import { useAuthStore, selectIsAuthenticated } from '@/features/auth';
import { useQueryWithAuth } from '@/hooks/use-query-with-auth';
import { workflowUnitsApi } from '../api/workflow-units-api';

export const workflowUnitQueryKey = (workspaceId?: string, unitId?: string) => [
  'workflow-unit',
  workspaceId ?? 'unknown',
  unitId ?? 'unknown',
];

/**
 * Hook to fetch a single workflow unit by ID
 */
export const useWorkflowUnit = (workspaceId?: string, unitId?: string) => {
  const isAuthenticated = useAuthStore(selectIsAuthenticated);

  return useQueryWithAuth({
    queryKey: workflowUnitQueryKey(workspaceId, unitId),
    queryFn: () => workflowUnitsApi.getWorkflowUnit(workspaceId!, unitId!),
    enabled: isAuthenticated && !!workspaceId && !!unitId,
  });
};
