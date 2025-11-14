/**
 * useDeleteWorkflowForm - Mutation hook for deleting workflow forms
 *
 * Deletes form and invalidates list cache.
 * Pattern: optimistic updates handled by React Query.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteWorkflowForm } from '../api/workflow-forms-api';
import { workflowFormsQueryKey } from './use-workflow-forms';
import { workflowFormQueryKey } from './use-workflow-form';

import type { FormDeleteResponse } from '../types';

/**
 * Hook to delete a workflow form
 *
 * Invalidates both list and detail caches on success.
 * Navigation to list view should be handled in onSuccess callback.
 *
 * @param workspaceId - Workspace ID
 * @returns Mutation object with mutate, mutateAsync, isPending, etc.
 *
 * @example
 * ```tsx
 * function DeleteFormButton({ workspaceId, formId, formName }: Props) {
 *   const deleteMutation = useDeleteWorkflowForm(workspaceId);
 *   const navigate = useNavigate();
 *
 *   const handleDelete = () => {
 *     if (!confirm(`Xóa vĩnh viễn form "${formName}"? Không thể hoàn tác.`)) {
 *       return;
 *     }
 *
 *     deleteMutation.mutate(formId, {
 *       onSuccess: (response) => {
 *         toast.success(response.message || 'Form deleted');
 *         navigate('/forms'); // Navigate to list
 *       },
 *       onError: (error) => {
 *         toast.error(`Delete failed: ${error.message}`);
 *       },
 *     });
 *   };
 *
 *   return (
 *     <button
 *       onClick={handleDelete}
 *       disabled={deleteMutation.isPending}
 *       className="btn-destructive"
 *     >
 *       {deleteMutation.isPending ? 'Deleting...' : 'Delete Form'}
 *     </button>
 *   );
 * }
 * ```
 */
export function useDeleteWorkflowForm(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation<FormDeleteResponse, Error, string>({
    mutationFn: (formId: string) => deleteWorkflowForm(workspaceId, formId),
    onSuccess: (_, formId) => {
      // Invalidate list cache
      queryClient.invalidateQueries({ queryKey: workflowFormsQueryKey(workspaceId) });

      // Remove detail cache for deleted form
      queryClient.removeQueries({
        queryKey: workflowFormQueryKey(workspaceId, formId),
      });
    },
  });
}
