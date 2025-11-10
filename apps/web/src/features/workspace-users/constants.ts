/**
 * Workspace Users Query Configuration
 *
 * Centralized constants for workspace users queries to ensure
 * consistent cache key generation across all components.
 *
 * @see docs/plans/20251110-workspace-users-caching-optimization-plan.md
 */

import type { UseQueryOptions } from '@tanstack/react-query';
import type { WorkspaceUser } from '@workspace/active-tables-core';

/**
 * Standard query configuration for workspace users
 *
 * Use this constant everywhere workspace users are fetched to ensure
 * cache consistency and optimal performance.
 *
 * @example
 * ```tsx
 * import { STANDARD_WORKSPACE_USERS_QUERY } from '@/features/workspace-users/constants';
 *
 * const { data: users } = useQuery(STANDARD_WORKSPACE_USERS_QUERY(workspaceId));
 * ```
 */
export const STANDARD_WORKSPACE_USERS_QUERY = (_workspaceId: string) =>
  ({
    staleTime: 5 * 60 * 1000, // 5 minutes - workspace users change infrequently
    gcTime: 10 * 60 * 1000, // 10 minutes - keep in cache for background prefetch
    refetchOnWindowFocus: true, // Refresh on tab switch (user may have changed roles elsewhere)
    refetchOnMount: false, // Don't refetch if data exists and is fresh
    retry: 2, // Retry failed requests twice
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
  }) as const;

/**
 * Query key factory for workspace users
 *
 * Generates consistent query keys for React Query cache.
 * All workspace users queries should use this factory.
 *
 * @param workspaceId - The workspace ID
 * @returns Query key array
 *
 * @example
 * ```tsx
 * const queryKey = workspaceUsersQueryKey('ws_123');
 * // Returns: ['workspace-users', 'ws_123']
 * ```
 */
export function workspaceUsersQueryKey(workspaceId: string): readonly [string, string] {
  return ['workspace-users', workspaceId] as const;
}

/**
 * Cache configuration constants
 */
export const WORKSPACE_USERS_CACHE_CONFIG = {
  /**
   * How long data is considered fresh (5 minutes)
   *
   * During this time, components will use cached data without refetching.
   * This is appropriate for workspace users since they change infrequently.
   */
  STALE_TIME: 5 * 60 * 1000,

  /**
   * How long unused data stays in cache (10 minutes)
   *
   * After this time, cached data is garbage collected.
   * Longer than stale time to support background prefetching.
   */
  GC_TIME: 10 * 60 * 1000,

  /**
   * Number of retry attempts for failed requests
   */
  RETRY_ATTEMPTS: 2,

  /**
   * Maximum retry delay (30 seconds)
   */
  MAX_RETRY_DELAY: 30000,
} as const;

/**
 * Type-safe query options for workspace users
 *
 * Use this type when creating custom query configurations that extend
 * the standard configuration.
 */
export type WorkspaceUsersQueryOptions = UseQueryOptions<WorkspaceUser[], Error>;
