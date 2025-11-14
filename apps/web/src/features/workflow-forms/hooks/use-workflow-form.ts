/**
 * useWorkflowForm - Query hook for single workflow form detail
 *
 * Fetches form details by ID with no staleness (always fresh).
 * Used in form builder detail view.
 *
 * @see /apps/web/src/features/active-tables/hooks/use-active-tables.ts (pattern reference)
 */

import { useQueryWithAuth } from '@/hooks/use-query-with-auth';
import { selectIsAuthenticated, useAuthStore } from '@/features/auth';

import { getWorkflowFormById } from '../api/workflow-forms-api';

/**
 * Query key factory for workflow form detail
 *
 * @param workspaceId - Workspace ID (optional for disabled queries)
 * @param formId - Form ID (optional for disabled queries)
 * @returns Query key array for React Query
 *
 * @example
 * ```typescript
 * const queryKey = workflowFormQueryKey('workspace123', 'form456');
 * // => ['workflow-form', 'workspace123', 'form456']
 * ```
 */
export const workflowFormQueryKey = (workspaceId?: string, formId?: string) => [
  'workflow-form',
  workspaceId ?? 'unknown',
  formId ?? 'unknown',
];

/**
 * Hook to fetch single workflow form by ID
 *
 * Always fetches fresh data (no staleTime) for detail view consistency.
 *
 * @param workspaceId - Workspace ID (optional - query disabled if not provided)
 * @param formId - Form ID (optional - query disabled if not provided)
 * @returns React Query result with form data
 *
 * @example
 * ```tsx
 * function FormBuilder({ workspaceId, formId }: Props) {
 *   const { data, isLoading, error, refetch } = useWorkflowForm(workspaceId, formId);
 *
 *   if (isLoading) return <LoadingSpinner />;
 *   if (error) return <ErrorMessage error={error} />;
 *   if (!data?.data) return <NotFound />;
 *
 *   const form = data.data;
 *   return (
 *     <div>
 *       <h1>{form.name}</h1>
 *       <p>{form.description}</p>
 *       <FormFields fields={form.config.fields} />
 *       <button onClick={() => refetch()}>Refresh</button>
 *     </div>
 *   );
 * }
 * ```
 */
export const useWorkflowForm = (workspaceId?: string, formId?: string) => {
  const isAuthenticated = useAuthStore(selectIsAuthenticated);

  return useQueryWithAuth({
    queryKey: workflowFormQueryKey(workspaceId, formId),
    queryFn: () => getWorkflowFormById(workspaceId!, formId!),
    enabled: isAuthenticated && !!workspaceId && !!formId,
    // No staleTime - always fetch fresh data for detail view
  });
};
