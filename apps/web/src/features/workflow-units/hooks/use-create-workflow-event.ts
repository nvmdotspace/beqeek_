import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { workflowEventsApi } from '../api/workflow-events-api';
import { workflowEventsQueryKey } from './use-workflow-events';
import type { CreateWorkflowEventRequest } from '../api/types';
// @ts-expect-error - Paraglide generates JS without .d.ts files
import { m } from '@/paraglide/generated/messages.js';

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
      toast.success(m.workflowEvents_toast_created());
    },
    onError: (error) => {
      toast.error(m.workflowEvents_toast_createFailed(), {
        description: error instanceof Error ? error.message : m.common_tryAgain(),
      });
    },
  });
};
