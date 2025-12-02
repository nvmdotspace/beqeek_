import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { workflowUnitsApi } from '../api/workflow-units-api';
import { workflowUnitsQueryKey } from './use-workflow-units';
import { workflowUnitQueryKey } from './use-workflow-unit';
// @ts-expect-error - Paraglide generates JS without .d.ts files
import { m } from '@/paraglide/generated/messages.js';

/**
 * Hook to delete a workflow unit
 */
export const useDeleteWorkflowUnit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ workspaceId, unitId }: { workspaceId: string; unitId: string }) =>
      workflowUnitsApi.deleteWorkflowUnit(workspaceId, unitId),
    onSuccess: (_, variables) => {
      // Invalidate both list and detail queries
      queryClient.invalidateQueries({
        queryKey: workflowUnitsQueryKey(variables.workspaceId),
      });
      queryClient.invalidateQueries({
        queryKey: workflowUnitQueryKey(variables.workspaceId, variables.unitId),
      });
      toast.success(m.workflowUnits_toast_deleted());
    },
    onError: (error) => {
      toast.error(m.workflowUnits_error_delete(), {
        description: error instanceof Error ? error.message : m.common_tryAgain(),
      });
    },
  });
};
