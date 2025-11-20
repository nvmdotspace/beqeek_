import { useAuthStore, selectIsAuthenticated } from '@/features/auth';
import { useQueryWithAuth } from '@/hooks/use-query-with-auth';
import { workflowEventsApi } from '../api/workflow-events-api';

export const workflowFormsQueryKey = (workspaceId?: string) => ['workflow-forms', workspaceId ?? 'unknown'];

/**
 * Hook to fetch workflow forms for OPTIN_FORM trigger configuration
 */
export const useWorkflowForms = (workspaceId?: string) => {
  const isAuthenticated = useAuthStore(selectIsAuthenticated);

  return useQueryWithAuth({
    queryKey: workflowFormsQueryKey(workspaceId),
    queryFn: () => workflowEventsApi.getWorkflowForms(workspaceId!),
    enabled: isAuthenticated && !!workspaceId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
};
