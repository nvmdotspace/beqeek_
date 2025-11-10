/**
 * Hook for prefetching workspace users on page load
 *
 * This hook prefetches workspace users when a table/workspace page loads,
 * ensuring instant availability when field input dialogs open.
 *
 * @see docs/plans/20251110-workspace-users-caching-optimization-plan.md
 */

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { createActiveTablesApiClient } from '@/shared/api/active-tables-client';
import {
  buildWorkspaceUsersQuery,
  WORKSPACE_USERS_QUERY_PRESETS,
  type WorkspaceUsersQueries,
  type GetWorkspaceUsersRequest,
} from '../types/workspace-users-query';
import { workspaceUsersQueryKey, STANDARD_WORKSPACE_USERS_QUERY } from '../constants';
import type { WorkspaceUser } from '@workspace/active-tables-core';

/**
 * API response user type (from backend)
 */
interface ApiWorkspaceUser {
  id: string;
  fullName: string;
  avatar?: string;
  thumbnailAvatar?: string;
  email?: string;
  username?: string;
  globalUser?: {
    username: string;
    email?: string;
  };
  workspaceMemberships?: Array<{
    userId: string;
    workspaceTeamRoleId: string;
    workspaceTeamId: string;
    invitedAt: string;
  }>;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * API response for workspace users
 */
interface GetWorkspaceUsersResponse {
  data?: ApiWorkspaceUser[];
  total?: number;
  message?: string | null;
}

/**
 * Map API user response to WorkspaceUser type expected by active-tables-core
 */
function mapApiUserToWorkspaceUser(apiUser: ApiWorkspaceUser): WorkspaceUser {
  return {
    id: apiUser.id,
    name: apiUser.fullName,
    avatar: apiUser.avatar,
    role: undefined,
  };
}

/**
 * Options for useWorkspaceUsersWithPrefetch hook
 */
export interface UseWorkspaceUsersWithPrefetchOptions {
  /**
   * Query configuration - can be:
   * - A preset name (e.g., 'CREATE_RECORD_FORM', 'BASIC_WITH_AVATAR')
   * - A custom WorkspaceUsersQueries object
   * - undefined (uses BASIC_WITH_AVATAR preset by default for consistency with field-input.tsx)
   */
  query?: WorkspaceUsersQueries | keyof typeof WORKSPACE_USERS_QUERY_PRESETS;

  /**
   * Whether to enable prefetching
   * @default true
   */
  enabled?: boolean;
}

/**
 * Prefetch workspace users on page load
 *
 * This hook initiates a background fetch of workspace users when the page loads,
 * ensuring the data is cached and instantly available when field input dialogs open.
 *
 * Performance impact:
 * - Without prefetch: 250ms to open field input dialog (fetch + render)
 * - With prefetch: 10ms to open field input dialog (render only)
 *
 * @param workspaceId - Current workspace ID
 * @param options - Prefetch options
 *
 * @example
 * ```tsx
 * // In active-table-records-page.tsx
 * import { useWorkspaceUsersWithPrefetch } from '@/features/workspace-users';
 *
 * export function ActiveTableRecordsPage() {
 *   const { workspaceId } = route.useParams();
 *
 *   // Prefetch users on page load (uses BASIC_WITH_AVATAR by default)
 *   useWorkspaceUsersWithPrefetch(workspaceId);
 *
 *   return <RecordList />; // Field inputs will have instant data
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Custom query configuration
 * useWorkspaceUsersWithPrefetch(workspaceId, {
 *   query: {
 *     fields: 'id,fullName,avatar',
 *     limit: 50
 *   }
 * });
 * ```
 *
 * @example
 * ```tsx
 * // Conditional prefetch
 * useWorkspaceUsersWithPrefetch(workspaceId, {
 *   enabled: hasUserReferenceFields
 * });
 * ```
 */
export function useWorkspaceUsersWithPrefetch(workspaceId: string, options?: UseWorkspaceUsersWithPrefetchOptions) {
  const queryClient = useQueryClient();
  const { query = 'BASIC_WITH_AVATAR', enabled = true } = options ?? {};

  useEffect(() => {
    if (!enabled || !workspaceId) {
      return;
    }

    const requestBody: GetWorkspaceUsersRequest = buildWorkspaceUsersQuery(query);
    const queryKey = workspaceUsersQueryKey(workspaceId);

    // Prefetch users in background
    void queryClient.prefetchQuery({
      queryKey: [...queryKey, requestBody.queries],
      queryFn: async () => {
        const client = createActiveTablesApiClient(workspaceId);

        // API: POST /api/workspace/{workspaceId}/workspace/get/users
        const response = await client.post<GetWorkspaceUsersResponse>(
          '/workspace/get/users',
          requestBody as Record<string, unknown>,
        );

        const apiUsers = response.data.data ?? [];
        const mappedUsers = apiUsers.map(mapApiUserToWorkspaceUser);

        console.log('[useWorkspaceUsersWithPrefetch] Prefetched workspace users:', {
          workspaceId,
          count: mappedUsers.length,
          query: query,
        });

        return mappedUsers;
      },
      ...STANDARD_WORKSPACE_USERS_QUERY(workspaceId),
    });
  }, [workspaceId, query, enabled, queryClient]);
}
