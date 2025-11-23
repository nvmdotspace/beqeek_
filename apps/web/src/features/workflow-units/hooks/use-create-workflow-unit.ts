import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { workflowUnitsApi } from '../api/workflow-units-api';
import { workflowUnitsQueryKey } from './use-workflow-units';
import type { CreateWorkflowUnitRequest } from '../api/types';

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
      toast.success('Workflow unit created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create workflow unit', {
        description: error instanceof Error ? error.message : 'Please try again',
      });
    },
  });
};
