import { useAuthStore, selectIsAuthenticated } from '@/features/auth';
import { useQueryWithAuth } from '@/hooks/use-query-with-auth';
import { workflowEventsApi } from '../api/workflow-events-api';

export const workflowEventQueryKey = (workspaceId?: string, eventId?: string) => [
  'workflow-event',
  workspaceId ?? 'unknown',
  eventId ?? 'unknown',
];

/**
 * Hook to fetch a single workflow event by ID
 */
export const useWorkflowEvent = (workspaceId?: string, eventId?: string) => {
  const isAuthenticated = useAuthStore(selectIsAuthenticated);

  return useQueryWithAuth({
    queryKey: workflowEventQueryKey(workspaceId, eventId),
    queryFn: () => workflowEventsApi.getWorkflowEvent(workspaceId!, eventId!),
    enabled: isAuthenticated && !!workspaceId && !!eventId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
