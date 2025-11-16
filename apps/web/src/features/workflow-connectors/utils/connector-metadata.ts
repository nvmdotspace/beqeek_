/**
 * Connector Metadata Utilities
 *
 * Helper functions to extract metadata from connector instances
 * for display in connector cards
 */

import { CONNECTOR_CONFIGS } from '@workspace/beqeek-shared/workflow-connectors';
import type { ConnectorInstance } from '@workspace/beqeek-shared/workflow-connectors';

/**
 * Get configuration field count for a connector type
 */
export function getConnectorFieldCount(connectorType: string): number {
  const config = CONNECTOR_CONFIGS.find((c) => c.connectorType === connectorType);
  return config?.configFields?.length ?? 0;
}

/**
 * Check if connector type uses OAuth
 */
export function isOAuthConnector(connectorType: string): boolean {
  const config = CONNECTOR_CONFIGS.find((c) => c.connectorType === connectorType);
  return config?.oauth ?? false;
}

/**
 * Get filled field count from connector instance config
 */
export function getFilledFieldCount(connector: ConnectorInstance): number {
  if (!connector.config || typeof connector.config !== 'object') {
    return 0;
  }

  return Object.values(connector.config).filter((value) => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    return true;
  }).length;
}

/**
 * Check if connector has valid OAuth token
 */
export function hasValidOAuthToken(connector: ConnectorInstance): boolean {
  if (!isOAuthConnector(connector.connectorType)) {
    return false;
  }

  const config = connector.config as Record<string, unknown>;
  if (!config) return false;

  // Check for common OAuth token fields
  const hasAccessToken = Boolean(config.access_token || config.accessToken);
  const hasRefreshToken = Boolean(config.refresh_token || config.refreshToken);

  return hasAccessToken || hasRefreshToken;
}

/**
 * Get connector type display name
 */
export function getConnectorTypeName(connectorType: string): string {
  const typeMap: Record<string, string> = {
    SMTP: 'SMTP',
    GOOGLE_SHEETS: 'Google Sheets',
    ZALO_OA: 'Zalo OA',
    KIOTVIET: 'KiotViet',
    ACTIVE_TABLE: 'Active Table',
  };

  return typeMap[connectorType] || connectorType;
}

/**
 * Format connector update timestamp
 */
export function formatConnectorUpdateTime(updatedAt?: string | null, locale = 'vi'): string | null {
  if (!updatedAt || Number.isNaN(Date.parse(updatedAt))) {
    return null;
  }

  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(updatedAt));
}
