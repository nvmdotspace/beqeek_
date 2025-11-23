import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { workflowEventsApi } from '../api/workflow-events-api';
import { workflowEventsQueryKey } from './use-workflow-events';
import { workflowEventQueryKey } from './use-workflow-event';
import type { UpdateWorkflowEventRequest, WorkflowEvent } from '../api/types';

/**
 * Hook to update an existing workflow event
 */
export const useUpdateWorkflowEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      workspaceId,
      eventId,
      data,
    }: {
      workspaceId: string;
      eventId: string;
      data: UpdateWorkflowEventRequest;
    }) => workflowEventsApi.updateWorkflowEvent(workspaceId, eventId, data),
    onMutate: async ({ workspaceId, eventId, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: workflowEventQueryKey(workspaceId, eventId) });

      // Snapshot previous value
      const previousEvent = queryClient.getQueryData<WorkflowEvent>(workflowEventQueryKey(workspaceId, eventId));

      // Optimistically update
      if (previousEvent) {
        queryClient.setQueryData<WorkflowEvent>(workflowEventQueryKey(workspaceId, eventId), {
          ...previousEvent,
          ...data,
          updatedAt: new Date().toISOString(),
        });
      }

      return { previousEvent };
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousEvent) {
        queryClient.setQueryData(
          workflowEventQueryKey(variables.workspaceId, variables.eventId),
          context.previousEvent,
        );
      }
      toast.error('Failed to update event', {
        description: error instanceof Error ? error.message : 'Please try again',
      });
    },
    onSuccess: (updatedEvent, variables) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({
        queryKey: workflowEventQueryKey(variables.workspaceId, variables.eventId),
      });
      queryClient.invalidateQueries({
        queryKey: workflowEventsQueryKey(variables.workspaceId, updatedEvent.workflowUnit),
      });
      toast.success('Event updated successfully');
    },
  });
};
