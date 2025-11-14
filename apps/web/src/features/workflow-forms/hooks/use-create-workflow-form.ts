/**
 * useCreateWorkflowForm - Mutation hook for creating workflow forms
 *
 * Creates a new form and invalidates list cache.
 * Pattern: optimistic updates handled by React Query.
 *
 * @see /apps/web/src/features/active-tables/hooks/use-create-record.ts (pattern reference)
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createWorkflowForm } from '../api/workflow-forms-api';
import { workflowFormsQueryKey } from './use-workflow-forms';

import type { FormCreatePayload, FormCreateResponse } from '../types';

/**
 * Hook to create a new workflow form
 *
 * Automatically invalidates list cache on success to trigger refetch.
 * Navigation to detail view should be handled in onSuccess callback.
 *
 * @param workspaceId - Workspace ID
 * @returns Mutation object with mutate, mutateAsync, isPending, etc.
 *
 * @example
 * ```tsx
 * function CreateFormDialog({ workspaceId, onSuccess }: Props) {
 *   const createMutation = useCreateWorkflowForm(workspaceId);
 *   const navigate = useNavigate();
 *
 *   const handleSubmit = (formData: FormData) => {
 *     createMutation.mutate({
 *       name: formData.name,
 *       description: formData.description,
 *       formType: 'BASIC',
 *       config: FORM_CONFIGS.BASIC,
 *     }, {
 *       onSuccess: (response) => {
 *         toast.success(response.message);
 *         navigate(`/forms/${response.data.id}`);
 *       },
 *       onError: (error) => {
 *         toast.error(error.message);
 *       },
 *     });
 *   };
 *
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       <input name="name" placeholder="Form name" required />
 *       <textarea name="description" placeholder="Description" />
 *       <button type="submit" disabled={createMutation.isPending}>
 *         {createMutation.isPending ? 'Creating...' : 'Create Form'}
 *       </button>
 *     </form>
 *   );
 * }
 * ```
 */
export function useCreateWorkflowForm(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation<FormCreateResponse, Error, FormCreatePayload>({
    mutationFn: (payload: FormCreatePayload) => createWorkflowForm(workspaceId, payload),
    onSuccess: () => {
      // Invalidate forms list to trigger refetch
      queryClient.invalidateQueries({ queryKey: workflowFormsQueryKey(workspaceId) });
    },
  });
}
