import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { workflowEventsApi } from '../api/workflow-events-api';
import { workflowEventsQueryKey } from './use-workflow-events';
import type { CreateWorkflowEventRequest } from '../api/types';

/**
 * Hook to create a new workflow event
 */
export const useCreateWorkflowEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ workspaceId, data }: { workspaceId: string; data: CreateWorkflowEventRequest }) =>
      workflowEventsApi.createWorkflowEvent(workspaceId, data),
    onSuccess: (_, variables) => {
      // Invalidate events list for this unit
      queryClient.invalidateQueries({
        queryKey: workflowEventsQueryKey(variables.workspaceId, variables.data.workflowUnit),
      });
      // Also invalidate "all events" query
      queryClient.invalidateQueries({
        queryKey: workflowEventsQueryKey(variables.workspaceId),
      });
      toast.success('Event created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create event', {
        description: error instanceof Error ? error.message : 'Please try again',
      });
    },
  });
};
