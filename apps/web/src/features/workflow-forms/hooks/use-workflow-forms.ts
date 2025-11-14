/**
 * useWorkflowForms - Query hook for listing workflow forms
 *
 * Fetches all workflow forms for a workspace with caching.
 * Cache config: 2min stale, 5min garbage collection.
 *
 * @see /apps/web/src/features/active-tables/hooks/use-active-tables.ts (pattern reference)
 */

import { useQueryWithAuth } from '@/hooks/use-query-with-auth';
import { selectIsAuthenticated, useAuthStore } from '@/features/auth';

import { getWorkflowForms } from '../api/workflow-forms-api';

/**
 * Query key factory for workflow forms list
 *
 * @param workspaceId - Workspace ID (optional for disabled queries)
 * @returns Query key array for React Query
 *
 * @example
 * ```typescript
 * const queryKey = workflowFormsQueryKey('workspace123');
 * // => ['workflow-forms', 'workspace123']
 * ```
 */
export const workflowFormsQueryKey = (workspaceId?: string) => ['workflow-forms', workspaceId ?? 'unknown'];

/**
 * Hook to fetch all workflow forms for a workspace
 *
 * @param workspaceId - Workspace ID (optional - query disabled if not provided)
 * @returns React Query result with forms data
 *
 * @example
 * ```tsx
 * function FormsList({ workspaceId }: { workspaceId: string }) {
 *   const { data, isLoading, error } = useWorkflowForms(workspaceId);
 *
 *   if (isLoading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error.message}</div>;
 *
 *   const forms = data?.data ?? [];
 *   return (
 *     <ul>
 *       {forms.map(form => (
 *         <li key={form.id}>{form.name}</li>
 *       ))}
 *     </ul>
 *   );
 * }
 * ```
 */
export const useWorkflowForms = (workspaceId?: string) => {
  const isAuthenticated = useAuthStore(selectIsAuthenticated);

  return useQueryWithAuth({
    queryKey: workflowFormsQueryKey(workspaceId),
    queryFn: () => getWorkflowForms(workspaceId!),
    enabled: isAuthenticated && !!workspaceId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};
