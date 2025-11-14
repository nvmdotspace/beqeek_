/**
 * useUpdateWorkflowForm - Mutation hook for updating workflow forms
 *
 * Updates existing form and invalidates both list and detail caches.
 * Pattern: optimistic updates handled by React Query.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateWorkflowForm } from '../api/workflow-forms-api';
import { workflowFormsQueryKey } from './use-workflow-forms';
import { workflowFormQueryKey } from './use-workflow-form';

import type { FormUpdatePayload, FormUpdateResponse } from '../types';

/**
 * Parameters for update mutation
 */
export interface UpdateWorkflowFormParams {
  /** Form ID to update */
  formId: string;
  /** Updated form data */
  payload: FormUpdatePayload;
}

/**
 * Hook to update an existing workflow form
 *
 * Invalidates both list and detail caches on success.
 * Form builder UI should reflect changes immediately via optimistic updates.
 *
 * @param workspaceId - Workspace ID
 * @returns Mutation object with mutate, mutateAsync, isPending, etc.
 *
 * @example
 * ```tsx
 * function FormBuilder({ workspaceId, formId }: Props) {
 *   const updateMutation = useUpdateWorkflowForm(workspaceId);
 *   const [config, setConfig] = useState<FormConfig>(initialConfig);
 *
 *   const handleSave = () => {
 *     updateMutation.mutate({
 *       formId,
 *       payload: {
 *         name: 'Updated Form Name',
 *         description: 'Updated description',
 *         config,
 *       },
 *     }, {
 *       onSuccess: (response) => {
 *         toast.success(response.message || 'Form updated');
 *       },
 *       onError: (error) => {
 *         toast.error(`Update failed: ${error.message}`);
 *       },
 *     });
 *   };
 *
 *   return (
 *     <div>
 *       <FormConfigEditor value={config} onChange={setConfig} />
 *       <button onClick={handleSave} disabled={updateMutation.isPending}>
 *         {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useUpdateWorkflowForm(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation<FormUpdateResponse, Error, UpdateWorkflowFormParams>({
    mutationFn: ({ formId, payload }: UpdateWorkflowFormParams) => updateWorkflowForm(workspaceId, formId, payload),
    onSuccess: (_, variables) => {
      // Invalidate list cache
      queryClient.invalidateQueries({ queryKey: workflowFormsQueryKey(workspaceId) });

      // Invalidate detail cache for the updated form
      queryClient.invalidateQueries({
        queryKey: workflowFormQueryKey(workspaceId, variables.formId),
      });
    },
  });
}
