/**
 * Workflow Connectors - Barrel Export
 *
 * Central export point for all workflow connector types, constants, and data
 * Import from: @workspace/beqeek-shared/workflow-connectors
 */

// ============================================================================
// Types
// ============================================================================

export type {
  ConnectorType,
  ConnectorTypeDefinition,
  ConfigFieldType,
  ConfigFieldDefinition,
  ConnectorConfigDefinition,
  ConnectorInstance,
  CreateConnectorInput,
  UpdateConnectorInput,
} from './types.js';

// ============================================================================
// Constants
// ============================================================================

export {
  CONNECTOR_TYPE_SMTP,
  CONNECTOR_TYPE_GOOGLE_SHEETS,
  CONNECTOR_TYPE_ZALO_OA,
  CONNECTOR_TYPE_KIOTVIET,
  CONNECTOR_TYPE_ACTIVE_TABLE,
} from './types.js';

// ============================================================================
// Data Arrays
// ============================================================================

export { CONNECTOR_TYPES } from './connector-types.js';
export { CONNECTOR_CONFIGS } from './connector-configs.js';
