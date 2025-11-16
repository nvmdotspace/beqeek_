/**
 * Workflow Connectors - Connector Configuration Definitions
 *
 * Defines configuration schemas for each connector type
 * Used for dynamic form generation and validation
 */

import {
  CONNECTOR_TYPE_SMTP,
  CONNECTOR_TYPE_GOOGLE_SHEETS,
  CONNECTOR_TYPE_ZALO_OA,
  CONNECTOR_TYPE_KIOTVIET,
  CONNECTOR_TYPE_ACTIVE_TABLE,
  type ConnectorConfigDefinition,
} from './types.js';

/**
 * Array of all connector configuration definitions
 * Maps each connector type to its required fields and OAuth support
 */
export const CONNECTOR_CONFIGS: ConnectorConfigDefinition[] = [
  // =========================================================================
  // SMTP Connector
  // =========================================================================
  {
    connectorType: CONNECTOR_TYPE_SMTP,
    oauth: false,
    configFields: [
      {
        name: 'host',
        type: 'text',
        label: 'SMTP Host',
        required: true,
        secret: false,
      },
      {
        name: 'port',
        type: 'number',
        label: 'SMTP Port',
        required: true,
        secret: false,
      },
      {
        name: 'username',
        type: 'text',
        label: 'Username',
        required: true,
        secret: false,
      },
      {
        name: 'password',
        type: 'password',
        label: 'Password',
        required: true,
        secret: true,
      },
      {
        name: 'from_email',
        type: 'text',
        label: 'From Email',
        required: true,
        secret: false,
      },
      {
        name: 'from_name',
        type: 'text',
        label: 'From Name',
        required: false,
        secret: false,
      },
      {
        name: 'checkDailyUnique',
        type: 'checkbox',
        label: 'Check Daily Unique',
        required: false,
        secret: false,
      },
      {
        name: 'trackingEmail',
        type: 'checkbox',
        label: 'Tracking Email',
        required: false,
        secret: false,
      },
    ],
  },

  // =========================================================================
  // Google Sheets Connector (OAuth)
  // =========================================================================
  {
    connectorType: CONNECTOR_TYPE_GOOGLE_SHEETS,
    oauth: true,
    configFields: [
      {
        name: 'access_token',
        type: 'text',
        label: 'access_token',
        required: false,
        readonly: true,
        secret: false,
      },
      {
        name: 'expires_in',
        type: 'text',
        label: 'expires_in',
        required: false,
        readonly: true,
        secret: false,
      },
      {
        name: 'refresh_token',
        type: 'text',
        label: 'refresh_token',
        required: false,
        readonly: true,
        secret: false,
      },
      {
        name: 'scope',
        type: 'text',
        label: 'scope',
        required: false,
        readonly: true,
        secret: false,
      },
      {
        name: 'token_type',
        type: 'text',
        label: 'token_type',
        required: false,
        readonly: true,
        secret: false,
      },
      {
        name: 'created',
        type: 'text',
        label: 'created',
        required: false,
        readonly: true,
        secret: false,
      },
    ],
  },

  // =========================================================================
  // Zalo OA Connector (OAuth)
  // =========================================================================
  {
    connectorType: CONNECTOR_TYPE_ZALO_OA,
    oauth: true,
    configFields: [
      {
        name: 'accessToken',
        type: 'text',
        label: 'Access Token',
        required: false,
        readonly: true,
        secret: true,
      },
      {
        name: 'refreshToken',
        type: 'text',
        label: 'Refresh Token',
        required: false,
        readonly: true,
        secret: true,
      },
    ],
  },

  // =========================================================================
  // Kiotviet Connector (API Key)
  // =========================================================================
  {
    connectorType: CONNECTOR_TYPE_KIOTVIET,
    oauth: false,
    configFields: [
      {
        name: 'clientId',
        type: 'text',
        label: 'Client ID',
        required: true,
        secret: false,
      },
      {
        name: 'clientSecret',
        type: 'password',
        label: 'Client Secret',
        required: true,
        secret: true,
      },
      {
        name: 'retailerCode',
        type: 'text',
        label: 'Retailer Code',
        required: true,
        secret: false,
      },
      {
        name: 'accessToken',
        type: 'text',
        label: 'Mã truy cập API (access token)',
        required: false,
        secret: true,
      },
    ],
  },

  // =========================================================================
  // Active Table Connector
  // =========================================================================
  {
    connectorType: CONNECTOR_TYPE_ACTIVE_TABLE,
    oauth: false,
    configFields: [
      {
        name: 'tableId',
        type: 'text',
        label: 'Table ID',
        required: true,
        secret: false,
      },
      {
        name: 'tableKey',
        type: 'password',
        label: 'Table Encryption Key',
        required: true,
        secret: true,
      },
    ],
  },
];
