/**
 * Connection Status Badge Component
 *
 * Displays connector connection status with color-coded indicators
 * Status is computed client-side from connector config data
 */

import { memo, useMemo } from 'react';
import { CheckCircle2, Circle, AlertCircle, XCircle } from 'lucide-react';
// @ts-expect-error - Paraglide generates JS without .d.ts files
import { m } from '@/paraglide/generated/messages.js';
import { Badge } from '@workspace/ui/components/badge';
import { cn } from '@workspace/ui/lib/utils';
import type { ConnectorInstance } from '@workspace/beqeek-shared/workflow-connectors';
import {
  isOAuthConnector,
  hasValidOAuthToken,
  getFilledFieldCount,
  getConnectorFieldCount,
} from '../utils/connector-metadata';

/**
 * Connection status types
 * - connected: OAuth active or credentials configured
 * - disconnected: Not configured
 * - expired: OAuth token expired (future - needs backend)
 * - error: Connection test failed (future - needs backend)
 */
export type ConnectionStatus = 'connected' | 'disconnected' | 'expired' | 'error';

interface ConnectionStatusBadgeProps {
  /** Connector instance to evaluate */
  connector: ConnectorInstance;
  /** Badge size */
  size?: 'sm' | 'md';
  /** Show label text */
  showLabel?: boolean;
  /** Additional className */
  className?: string;
}

interface StatusConfigItem {
  color: string;
  bgColor: string;
  borderColor: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  labelShort: string;
}

const getStatusConfig = (): Record<ConnectionStatus, StatusConfigItem> => ({
  connected: {
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-950/30',
    borderColor: 'border-green-200 dark:border-green-800',
    icon: CheckCircle2,
    label: m.connectors_status_connected(),
    labelShort: m.connectors_status_connectedShort(),
  },
  disconnected: {
    color: 'text-muted-foreground',
    bgColor: 'bg-muted/50',
    borderColor: 'border-border',
    icon: Circle,
    label: m.connectors_status_disconnected(),
    labelShort: m.connectors_status_disconnectedShort(),
  },
  expired: {
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-50 dark:bg-orange-950/30',
    borderColor: 'border-orange-200 dark:border-orange-800',
    icon: AlertCircle,
    label: m.connectors_status_expired(),
    labelShort: m.connectors_status_expiredShort(),
  },
  error: {
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-950/30',
    borderColor: 'border-red-200 dark:border-red-800',
    icon: XCircle,
    label: m.connectors_status_error(),
    labelShort: m.connectors_status_errorShort(),
  },
});

/**
 * Compute connection status from connector instance
 * This is a client-side heuristic until backend provides /status endpoint
 */
export function computeConnectionStatus(connector: ConnectorInstance): ConnectionStatus {
  const isOAuth = isOAuthConnector(connector.connectorType);

  if (isOAuth) {
    // For OAuth connectors, check if tokens exist
    const hasToken = hasValidOAuthToken(connector);
    return hasToken ? 'connected' : 'disconnected';
  }

  // For credentials connectors, check if required fields are filled
  const _totalFields = getConnectorFieldCount(connector.connectorType);
  const filledFields = getFilledFieldCount(connector);

  if (filledFields === 0) {
    return 'disconnected';
  }

  // If some fields are filled but not all required ones, still show as connected
  // (user may have intentionally left optional fields empty)
  if (filledFields > 0) {
    return 'connected';
  }

  return 'disconnected';
}

export const ConnectionStatusBadge = memo(
  ({ connector, size = 'sm', showLabel = true, className }: ConnectionStatusBadgeProps) => {
    const status = computeConnectionStatus(connector);
    const statusConfig = useMemo(() => getStatusConfig(), []);
    const config = statusConfig[status];
    const Icon = config.icon;

    const iconSize = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4';
    const textSize = size === 'sm' ? 'text-[10px]' : 'text-xs';
    const padding = size === 'sm' ? 'px-1.5 py-0.5' : 'px-2 py-1';

    return (
      <Badge
        variant="outline"
        className={cn(
          'inline-flex items-center gap-1 font-medium',
          config.bgColor,
          config.borderColor,
          config.color,
          textSize,
          padding,
          className,
        )}
      >
        <Icon className={iconSize} />
        {showLabel && <span>{size === 'sm' ? config.labelShort : config.label}</span>}
      </Badge>
    );
  },
);

ConnectionStatusBadge.displayName = 'ConnectionStatusBadge';

/**
 * Simple dot indicator for compact displays
 */
export const ConnectionStatusDot = memo(
  ({ connector, className }: { connector: ConnectorInstance; className?: string }) => {
    const status = computeConnectionStatus(connector);
    const statusConfig = useMemo(() => getStatusConfig(), []);
    const config = statusConfig[status];

    return (
      <span
        className={cn('inline-block h-2 w-2 rounded-full', className)}
        style={{
          backgroundColor:
            status === 'connected'
              ? 'rgb(34 197 94)' // green-500
              : status === 'expired'
                ? 'rgb(249 115 22)' // orange-500
                : status === 'error'
                  ? 'rgb(239 68 68)' // red-500
                  : 'rgb(156 163 175)', // gray-400
        }}
        title={config.label}
      />
    );
  },
);

ConnectionStatusDot.displayName = 'ConnectionStatusDot';
