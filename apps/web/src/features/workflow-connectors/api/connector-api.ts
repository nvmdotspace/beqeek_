/**
 * React Query API Layer for Workflow Connectors
 *
 * Provides hooks for all CRUD operations with automatic cache management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/shared/api/http-client';
import type {
  ConnectorInstance,
  CreateConnectorInput,
  UpdateConnectorInput,
} from '@workspace/beqeek-shared/workflow-connectors';
import type {
  ConnectorListResponse,
  ConnectorDetailResponse,
  CreateConnectorResponse,
  UpdateConnectorResponse,
  DeleteConnectorResponse,
  OAuthStateResponse,
} from './types';
import { connectorKeys } from './query-keys';

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * List all connectors in a workspace
 *
 * @param workspaceId - Current workspace ID
 * @returns Query result with connector array
 *
 * @example
 * ```tsx
 * const { data: connectors, isLoading } = useConnectors(workspaceId);
 * ```
 */
export const useConnectors = (workspaceId: string) => {
  return useQuery({
    queryKey: connectorKeys.lists(workspaceId),
    queryFn: async () => {
      const response = await apiRequest<ConnectorListResponse>({
        method: 'POST',
        url: `/api/workspace/${workspaceId}/workflow/get/workflow_connectors`,
        data: {},
      });
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Get connector details by ID
 *
 * @param workspaceId - Current workspace ID
 * @param connectorId - Connector ID to fetch
 * @param enabled - Whether query is enabled (default: true)
 * @returns Query result with connector instance
 *
 * @example
 * ```tsx
 * const { data: connector } = useConnectorDetail(workspaceId, connectorId);
 * ```
 */
export const useConnectorDetail = (workspaceId: string, connectorId: string, enabled = true) => {
  return useQuery({
    queryKey: connectorKeys.detail(workspaceId, connectorId),
    queryFn: async () => {
      const response = await apiRequest<ConnectorDetailResponse>({
        method: 'POST',
        url: `/api/workspace/${workspaceId}/workflow/get/workflow_connectors/${connectorId}`,
        data: {},
      });
      return response.data;
    },
    enabled: enabled && !!connectorId,
    staleTime: 1000 * 60 * 5,
  });
};

/**
 * Get OAuth state token for OAuth flow
 *
 * @param workspaceId - Current workspace ID
 * @param connectorId - Connector ID
 * @returns Query result with OAuth state token (manual refetch only)
 *
 * @example
 * ```tsx
 * const { data, refetch } = useOAuthState(workspaceId, connectorId);
 * // Later, when user clicks "Connect with OAuth"
 * const { data: { state } } = await refetch();
 * ```
 */
export const useOAuthState = (workspaceId: string, connectorId: string) => {
  return useQuery({
    queryKey: connectorKeys.oauthState(workspaceId, connectorId),
    queryFn: async () => {
      const response = await apiRequest<OAuthStateResponse>({
        method: 'POST',
        url: `/api/workspace/${workspaceId}/workflow/get/workflow_connectors/${connectorId}/oauth2_state`,
        data: {},
      });
      return response.data;
    },
    enabled: false, // Manual refetch only
  });
};

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * Create a new connector instance
 *
 * @param workspaceId - Current workspace ID
 * @returns Mutation for creating connector
 *
 * @example
 * ```tsx
 * const createMutation = useCreateConnector(workspaceId);
 *
 * await createMutation.mutateAsync({
 *   name: 'My SMTP Server',
 *   description: 'Production email server',
 *   connectorType: CONNECTOR_TYPE_SMTP
 * });
 * ```
 */
export const useCreateConnector = (workspaceId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateConnectorInput) => {
      const response = await apiRequest<CreateConnectorResponse>({
        method: 'POST',
        url: `/api/workspace/${workspaceId}/workflow/post/workflow_connectors`,
        data: input,
      });
      return response;
    },
    onSuccess: () => {
      // Invalidate list to show new connector
      queryClient.invalidateQueries({ queryKey: connectorKeys.lists(workspaceId) });
    },
  });
};

/**
 * Update an existing connector
 *
 * @param workspaceId - Current workspace ID
 * @param connectorId - Connector ID to update
 * @returns Mutation for updating connector
 *
 * @example
 * ```tsx
 * const updateMutation = useUpdateConnector(workspaceId, connectorId);
 *
 * await updateMutation.mutateAsync({
 *   name: 'Updated Name',
 *   config: { host: 'smtp.example.com', port: 587, ... }
 * });
 * ```
 */
export const useUpdateConnector = (workspaceId: string, connectorId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateConnectorInput) => {
      const response = await apiRequest<UpdateConnectorResponse>({
        method: 'POST',
        url: `/api/workspace/${workspaceId}/workflow/patch/workflow_connectors/${connectorId}`,
        data: input,
      });
      return response;
    },
    onSuccess: () => {
      // Invalidate both list and detail
      queryClient.invalidateQueries({ queryKey: connectorKeys.lists(workspaceId) });
      queryClient.invalidateQueries({ queryKey: connectorKeys.detail(workspaceId, connectorId) });
    },
  });
};

/**
 * Delete a connector
 *
 * @param workspaceId - Current workspace ID
 * @returns Mutation for deleting connector
 *
 * @example
 * ```tsx
 * const deleteMutation = useDeleteConnector(workspaceId);
 *
 * await deleteMutation.mutateAsync(connectorId);
 * ```
 */
export const useDeleteConnector = (workspaceId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (connectorId: string) => {
      const response = await apiRequest<DeleteConnectorResponse>({
        method: 'POST',
        url: `/api/workspace/${workspaceId}/workflow/delete/workflow_connectors/${connectorId}`,
        data: {},
      });
      return response;
    },
    onSuccess: () => {
      // Invalidate list to remove deleted connector
      queryClient.invalidateQueries({ queryKey: connectorKeys.lists(workspaceId) });
    },
  });
};
