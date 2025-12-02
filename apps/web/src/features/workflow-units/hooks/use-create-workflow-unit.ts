import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { workflowUnitsApi } from '../api/workflow-units-api';
import { workflowUnitsQueryKey } from './use-workflow-units';
import type { CreateWorkflowUnitRequest } from '../api/types';
// @ts-expect-error - Paraglide generates JS without .d.ts files
import { m } from '@/paraglide/generated/messages.js';

/**
 * Hook to create a new workflow unit
 */
export const useCreateWorkflowUnit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ workspaceId, data }: { workspaceId: string; data: CreateWorkflowUnitRequest }) =>
      workflowUnitsApi.createWorkflowUnit(workspaceId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: workflowUnitsQueryKey(variables.workspaceId),
      });
      toast.success(m.workflowUnits_toast_created());
    },
    onError: (error) => {
      toast.error(m.workflowUnits_error_create(), {
        description: error instanceof Error ? error.message : m.common_tryAgain(),
      });
    },
  });
};
