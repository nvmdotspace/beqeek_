/**
 * API Response Types for Workflow Connectors
 *
 * Mirrors the backend RPC API response structure
 */

import type { ConnectorInstance } from '@workspace/beqeek-shared/workflow-connectors';

/**
 * Response for listing all connectors
 * POST /api/workspace/{workspaceId}/workflow/get/workflow_connectors
 */
export interface ConnectorListResponse {
  data: ConnectorInstance[];
}

/**
 * Response for getting connector details
 * POST /api/workspace/{workspaceId}/workflow/get/workflow_connectors/{connectorId}
 */
export interface ConnectorDetailResponse {
  data: ConnectorInstance;
}

/**
 * Response for creating a connector
 * POST /api/workspace/{workspaceId}/workflow/post/workflow_connectors
 */
export interface CreateConnectorResponse {
  data: { id: string };
  message: string;
}

/**
 * Response for updating a connector
 * POST /api/workspace/{workspaceId}/workflow/patch/workflow_connectors/{connectorId}
 */
export interface UpdateConnectorResponse {
  message: string;
}

/**
 * Response for deleting a connector
 * POST /api/workspace/{workspaceId}/workflow/delete/workflow_connectors/{connectorId}
 */
export interface DeleteConnectorResponse {
  message: string;
}

/**
 * Response for getting OAuth state token
 * POST /api/workspace/{workspaceId}/workflow/get/workflow_connectors/{connectorId}/oauth2_state
 */
export interface OAuthStateResponse {
  data: { state: string };
}
