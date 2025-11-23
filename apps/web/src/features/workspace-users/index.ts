/**
 * Workspace Users Feature
 *
 * Main entry point for workspace users functionality including:
 * - User fetching hooks with React Query caching
 * - Prefetch hook for performance optimization
 * - User mapping utilities for fast lookups
 * - Query constants for consistent cache keys
 * - Profile management components
 */

// Hooks
export * from './hooks';

// Utils
export * from './utils';

// Components
export * from './components';

// Constants
export {
  STANDARD_WORKSPACE_USERS_QUERY,
  workspaceUsersQueryKey,
  WORKSPACE_USERS_CACHE_CONFIG,
  type WorkspaceUsersQueryOptions,
} from './constants';

// Types
export type { WorkspaceUser } from '@workspace/active-tables-core';
