import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { workflowUnitsApi } from '../api/workflow-units-api';
import { workflowUnitsQueryKey } from './use-workflow-units';
import { workflowUnitQueryKey } from './use-workflow-unit';
import type { UpdateWorkflowUnitRequest } from '../api/types';
// @ts-expect-error - Paraglide generates JS without .d.ts files
import { m } from '@/paraglide/generated/messages.js';

/**
 * Hook to update an existing workflow unit
 */
export const useUpdateWorkflowUnit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      workspaceId,
      unitId,
      data,
    }: {
      workspaceId: string;
      unitId: string;
      data: UpdateWorkflowUnitRequest;
    }) => workflowUnitsApi.updateWorkflowUnit(workspaceId, unitId, data),
    onSuccess: (_, variables) => {
      // Invalidate both list and detail queries
      queryClient.invalidateQueries({
        queryKey: workflowUnitsQueryKey(variables.workspaceId),
      });
      queryClient.invalidateQueries({
        queryKey: workflowUnitQueryKey(variables.workspaceId, variables.unitId),
      });
      toast.success(m.workflowUnits_toast_updated());
    },
    onError: (error) => {
      toast.error(m.workflowUnits_error_update(), {
        description: error instanceof Error ? error.message : m.common_tryAgain(),
      });
    },
  });
};
