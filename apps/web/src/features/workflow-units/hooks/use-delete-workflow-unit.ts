import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { workflowUnitsApi } from '../api/workflow-units-api';
import { workflowUnitsQueryKey } from './use-workflow-units';
import { workflowUnitQueryKey } from './use-workflow-unit';

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
      toast.success('Workflow unit deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete workflow unit', {
        description: error instanceof Error ? error.message : 'Please try again',
      });
    },
  });
};
