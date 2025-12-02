import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { workflowEventsApi } from '../api/workflow-events-api';
import { workflowEventsQueryKey } from './use-workflow-events';
import { workflowEventQueryKey } from './use-workflow-event';
import type { WorkflowEvent } from '../api/types';
// @ts-expect-error - Paraglide generates JS without .d.ts files
import { m } from '@/paraglide/generated/messages.js';

/**
 * Hook to toggle event active status
 */
export const useToggleEventActive = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ workspaceId, eventId, active }: { workspaceId: string; eventId: string; active: boolean }) =>
      workflowEventsApi.toggleEventActive(workspaceId, eventId, active),
    onMutate: async ({ workspaceId, eventId, active }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: workflowEventQueryKey(workspaceId, eventId) });

      // Snapshot previous value
      const previousEvent = queryClient.getQueryData<WorkflowEvent>(workflowEventQueryKey(workspaceId, eventId));

      // Optimistically update single event
      if (previousEvent) {
        queryClient.setQueryData<WorkflowEvent>(workflowEventQueryKey(workspaceId, eventId), {
          ...previousEvent,
          eventActive: active,
          updatedAt: new Date().toISOString(),
        });
      }

      // Optimistically update in list
      const previousEvents = queryClient.getQueryData<WorkflowEvent[]>(
        workflowEventsQueryKey(workspaceId, previousEvent?.workflowUnit),
      );

      if (previousEvents) {
        queryClient.setQueryData<WorkflowEvent[]>(
          workflowEventsQueryKey(workspaceId, previousEvent?.workflowUnit),
          previousEvents.map((event) =>
            event.id === eventId ? { ...event, eventActive: active, updatedAt: new Date().toISOString() } : event,
          ),
        );
      }

      return { previousEvent, previousEvents };
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousEvent) {
        queryClient.setQueryData(
          workflowEventQueryKey(variables.workspaceId, variables.eventId),
          context.previousEvent,
        );
      }
      if (context?.previousEvents && context?.previousEvent) {
        queryClient.setQueryData(
          workflowEventsQueryKey(variables.workspaceId, context.previousEvent.workflowUnit),
          context.previousEvents,
        );
      }
      toast.error(m.workflowEvents_toast_toggleFailed(), {
        description: error instanceof Error ? error.message : m.common_tryAgain(),
      });
    },
    onSuccess: (updatedEvent, variables) => {
      // Invalidate to ensure fresh data
      queryClient.invalidateQueries({
        queryKey: workflowEventQueryKey(variables.workspaceId, variables.eventId),
      });
      queryClient.invalidateQueries({
        queryKey: workflowEventsQueryKey(variables.workspaceId, updatedEvent.workflowUnit),
      });
      toast.success(
        updatedEvent.eventActive ? m.workflowEvents_toast_activated() : m.workflowEvents_toast_deactivated(),
      );
    },
  });
};
