/**
 * Workflow Connectors - Type Definitions
 *
 * Core types for workflow connector system supporting 5 connector types:
 * - SMTP (email)
 * - Google Sheets (OAuth)
 * - Zalo OA (OAuth)
 * - Kiotviet (API key)
 * - Active Table (internal)
 */

// ============================================================================
// Connector Type Constants
// ============================================================================

/** SMTP email connector */
export const CONNECTOR_TYPE_SMTP = 'SMTP' as const;

/** Google Sheets connector (OAuth) */
export const CONNECTOR_TYPE_GOOGLE_SHEETS = 'GOOGLE_SHEETS' as const;

/** Zalo Official Account connector (OAuth) */
export const CONNECTOR_TYPE_ZALO_OA = 'ZALO_OA' as const;

/** Kiotviet POS connector (API key) */
export const CONNECTOR_TYPE_KIOTVIET = 'KIOTVIET' as const;

/** Active Table connector (internal) */
export const CONNECTOR_TYPE_ACTIVE_TABLE = 'ACTIVE_TABLE' as const;

/**
 * Union type of all supported connector types
 */
export type ConnectorType =
  | typeof CONNECTOR_TYPE_SMTP
  | typeof CONNECTOR_TYPE_GOOGLE_SHEETS
  | typeof CONNECTOR_TYPE_ZALO_OA
  | typeof CONNECTOR_TYPE_KIOTVIET
  | typeof CONNECTOR_TYPE_ACTIVE_TABLE;

// ============================================================================
// Connector Type Definition
// ============================================================================

/**
 * Connector type metadata for display in selection UI
 */
export interface ConnectorTypeDefinition {
  /** Unique connector type identifier */
  type: ConnectorType;
  /** Display name (Vietnamese) */
  name: string;
  /** Description for users */
  description: string;
  /** Logo URL or path */
  logo: string;
  /** Optional Lucide icon name */
  icon?: string;
}

// ============================================================================
// Config Field Types
// ============================================================================

/**
 * Supported config field input types
 */
export type ConfigFieldType = 'text' | 'number' | 'password' | 'checkbox';

/**
 * Config field definition for dynamic form generation
 */
export interface ConfigFieldDefinition {
  /** Field name (used as key in config object) */
  name: string;
  /** Input type for form rendering */
  type: ConfigFieldType;
  /** Display label (Vietnamese) */
  label: string;
  /** Whether field is required */
  required: boolean;
  /** Whether field contains secret data (password, token) */
  secret: boolean;
  /** Whether field is readonly (OAuth tokens) */
  readonly?: boolean;
}

// ============================================================================
// Connector Config Definition
// ============================================================================

/**
 * Connector configuration schema definition
 * Maps connector type to its required fields and OAuth support
 */
export interface ConnectorConfigDefinition {
  /** Connector type this config applies to */
  connectorType: ConnectorType;
  /** Whether connector requires OAuth flow */
  oauth: boolean;
  /** Dynamic config fields for form generation */
  configFields: ConfigFieldDefinition[];
}

// ============================================================================
// Connector Instance
// ============================================================================

/**
 * Connector instance from API
 * Represents a configured connector in the system
 */
export interface ConnectorInstance {
  /** Unique connector ID (UUID) */
  id: string;
  /** User-defined connector name */
  name: string;
  /** User-defined description */
  description: string;
  /** Connector type */
  connectorType: ConnectorType;
  /** Dynamic config object (field values) */
  config: Record<string, unknown>;
  /** Optional documentation URL or markdown */
  documentation?: string;
  /** ISO 8601 timestamp */
  createdAt?: string;
  /** ISO 8601 timestamp */
  updatedAt?: string;
}

// ============================================================================
// API Request/Response Types
// ============================================================================

/**
 * Input for creating a new connector instance
 */
export interface CreateConnectorInput {
  /** Connector name */
  name: string;
  /** Connector description */
  description: string;
  /** Connector type */
  connectorType: ConnectorType;
}

/**
 * Input for updating an existing connector
 */
export interface UpdateConnectorInput {
  /** Updated name (optional) */
  name?: string;
  /** Updated description (optional) */
  description?: string;
  /** Updated config object (optional) */
  config?: Record<string, unknown>;
}
