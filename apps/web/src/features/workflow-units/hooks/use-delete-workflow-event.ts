import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { workflowEventsApi } from '../api/workflow-events-api';
import { workflowEventsQueryKey } from './use-workflow-events';
import { workflowEventQueryKey } from './use-workflow-event';
import type { WorkflowEvent } from '../api/types';

/**
 * Hook to delete a workflow event
 */
export const useDeleteWorkflowEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ workspaceId, eventId }: { workspaceId: string; eventId: string }) =>
      workflowEventsApi.deleteWorkflowEvent(workspaceId, eventId),
    onMutate: async ({ workspaceId, eventId }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: workflowEventsQueryKey(workspaceId) });

      // Get the event before deletion (for rollback and unitId)
      const previousEvent = queryClient.getQueryData<WorkflowEvent>(workflowEventQueryKey(workspaceId, eventId));

      // Snapshot previous list
      const previousEvents = queryClient.getQueryData<WorkflowEvent[]>(
        workflowEventsQueryKey(workspaceId, previousEvent?.workflowUnit),
      );

      // Optimistically remove from list
      if (previousEvents) {
        queryClient.setQueryData<WorkflowEvent[]>(
          workflowEventsQueryKey(workspaceId, previousEvent?.workflowUnit),
          previousEvents.filter((e) => e.id !== eventId),
        );
      }

      return { previousEvents, previousEvent };
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousEvents && context?.previousEvent) {
        queryClient.setQueryData(
          workflowEventsQueryKey(variables.workspaceId, context.previousEvent.workflowUnit),
          context.previousEvents,
        );
      }
      toast.error('Failed to delete event', {
        description: error instanceof Error ? error.message : 'Please try again',
      });
    },
    onSuccess: (_, variables, context) => {
      // Invalidate queries
      queryClient.invalidateQueries({
        queryKey: workflowEventsQueryKey(variables.workspaceId, context?.previousEvent?.workflowUnit),
      });
      queryClient.removeQueries({
        queryKey: workflowEventQueryKey(variables.workspaceId, variables.eventId),
      });
      toast.success('Event deleted successfully');
    },
  });
};
