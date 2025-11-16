/**
 * React Query Key Factory for Workflow Connectors
 *
 * Hierarchical query key structure:
 * - ['workflow-connectors', workspaceId] - Root for all connector queries
 * - [..., 'list'] - List queries
 * - [..., 'detail', connectorId] - Detail queries
 * - [..., 'oauth', connectorId] - OAuth state queries
 */

export const connectorKeys = {
  /**
   * Root key for all connector queries in a workspace
   */
  all: (workspaceId: string) => ['workflow-connectors', workspaceId] as const,

  /**
   * Base key for all list queries
   */
  lists: (workspaceId: string) => [...connectorKeys.all(workspaceId), 'list'] as const,

  /**
   * Key for connector list with optional filters
   */
  list: (workspaceId: string, filters?: Record<string, unknown>) =>
    [...connectorKeys.lists(workspaceId), filters] as const,

  /**
   * Base key for all detail queries
   */
  details: (workspaceId: string) => [...connectorKeys.all(workspaceId), 'detail'] as const,

  /**
   * Key for specific connector detail
   */
  detail: (workspaceId: string, connectorId: string) => [...connectorKeys.details(workspaceId), connectorId] as const,

  /**
   * Key for OAuth state (manual refetch only)
   */
  oauthState: (workspaceId: string, connectorId: string) =>
    [...connectorKeys.detail(workspaceId, connectorId), 'oauth'] as const,
};
