/**
 * Workspace Team & Role Query Configuration
 *
 * Centralized constants for workspace teams and roles queries to ensure
 * consistent cache key generation across all components.
 */

import type { UseQueryOptions } from '@tanstack/react-query';
import type { WorkspaceTeam, WorkspaceTeamRole } from './types';

/**
 * Standard query configuration for workspace teams
 *
 * Use this constant everywhere workspace teams are fetched to ensure
 * cache consistency and optimal performance.
 */
export const STANDARD_WORKSPACE_TEAMS_QUERY = (_workspaceId: string) =>
  ({
    staleTime: 5 * 60 * 1000, // 5 minutes - teams change infrequently
    gcTime: 10 * 60 * 1000, // 10 minutes - keep in cache
    refetchOnWindowFocus: true,
    refetchOnMount: false,
    retry: 2,
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
  }) as const;

/**
 * Standard query configuration for workspace team roles
 */
export const STANDARD_WORKSPACE_ROLES_QUERY = (_workspaceId: string, _teamId: string) =>
  ({
    staleTime: 5 * 60 * 1000, // 5 minutes - roles change infrequently
    gcTime: 10 * 60 * 1000, // 10 minutes - keep in cache
    refetchOnWindowFocus: true,
    refetchOnMount: false,
    retry: 2,
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
  }) as const;

/**
 * Query key factory for workspace teams
 */
export function workspaceTeamsQueryKey(workspaceId: string): readonly [string, string] {
  return ['workspace-teams', workspaceId] as const;
}

/**
 * Query key factory for workspace team roles
 */
export function workspaceTeamRolesQueryKey(workspaceId: string, teamId: string): readonly [string, string, string] {
  return ['workspace-team-roles', workspaceId, teamId] as const;
}

/**
 * Cache configuration constants
 */
export const WORKSPACE_TEAMS_CACHE_CONFIG = {
  STALE_TIME: 5 * 60 * 1000,
  GC_TIME: 10 * 60 * 1000,
  RETRY_ATTEMPTS: 2,
  MAX_RETRY_DELAY: 30000,
} as const;

/**
 * Type-safe query options
 */
export type WorkspaceTeamsQueryOptions = UseQueryOptions<WorkspaceTeam[], Error>;
export type WorkspaceTeamRolesQueryOptions = UseQueryOptions<WorkspaceTeamRole[], Error>;
