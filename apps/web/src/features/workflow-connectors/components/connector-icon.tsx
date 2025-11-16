/**
 * Connector Icon Component
 *
 * Compact icon display with type-based background colors
 * Matches Active Tables card icon style
 */

import { Plug2, Mail, FileSpreadsheet, MessageSquare, ShoppingCart, Table } from 'lucide-react';
import { cn } from '@workspace/ui/lib/utils';
import {
  CONNECTOR_TYPE_SMTP,
  CONNECTOR_TYPE_GOOGLE_SHEETS,
  CONNECTOR_TYPE_ZALO_OA,
  CONNECTOR_TYPE_KIOTVIET,
  CONNECTOR_TYPE_ACTIVE_TABLE,
  type ConnectorType,
} from '@workspace/beqeek-shared/workflow-connectors';

interface ConnectorIconProps {
  /** Connector type */
  type: ConnectorType;
  /** Logo URL (optional, fallback to icon) */
  logo?: string;
  /** Size variant */
  size?: 'default' | 'large';
  /** Additional className */
  className?: string;
}

/**
 * Get background and text colors for connector type
 */
function getConnectorColors(type: ConnectorType) {
  switch (type) {
    case CONNECTOR_TYPE_SMTP:
      return {
        bg: 'bg-blue-100 dark:bg-blue-950/30',
        text: 'text-blue-700 dark:text-blue-400',
        badge: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/50 dark:text-blue-400',
      };
    case CONNECTOR_TYPE_GOOGLE_SHEETS:
      return {
        bg: 'bg-emerald-100 dark:bg-emerald-950/30',
        text: 'text-emerald-700 dark:text-emerald-400',
        badge:
          'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-400',
      };
    case CONNECTOR_TYPE_ZALO_OA:
      return {
        bg: 'bg-sky-100 dark:bg-sky-950/30',
        text: 'text-sky-700 dark:text-sky-400',
        badge: 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950/50 dark:text-sky-400',
      };
    case CONNECTOR_TYPE_KIOTVIET:
      return {
        bg: 'bg-teal-100 dark:bg-teal-950/30',
        text: 'text-teal-700 dark:text-teal-400',
        badge: 'border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-900 dark:bg-teal-950/50 dark:text-teal-400',
      };
    case CONNECTOR_TYPE_ACTIVE_TABLE:
      return {
        bg: 'bg-purple-100 dark:bg-purple-950/30',
        text: 'text-purple-700 dark:text-purple-400',
        badge:
          'border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-900 dark:bg-purple-950/50 dark:text-purple-400',
      };
    default:
      return {
        bg: 'bg-muted',
        text: 'text-muted-foreground',
        badge: 'border-border bg-muted text-muted-foreground',
      };
  }
}

/**
 * Get fallback icon for connector type
 */
function getFallbackIcon(type: ConnectorType) {
  switch (type) {
    case CONNECTOR_TYPE_SMTP:
      return Mail;
    case CONNECTOR_TYPE_GOOGLE_SHEETS:
      return FileSpreadsheet;
    case CONNECTOR_TYPE_ZALO_OA:
      return MessageSquare;
    case CONNECTOR_TYPE_KIOTVIET:
      return ShoppingCart;
    case CONNECTOR_TYPE_ACTIVE_TABLE:
      return Table;
    default:
      return Plug2;
  }
}

export function ConnectorIcon({ type, logo, size = 'default', className }: ConnectorIconProps) {
  const colors = getConnectorColors(type);
  const FallbackIcon = getFallbackIcon(type);

  const containerSize = size === 'large' ? 'h-10 w-10 sm:h-12 sm:w-12' : 'h-8 w-8 sm:h-9 sm:w-9';
  const iconSize = size === 'large' ? 'h-5 w-5 sm:h-6 sm:w-6' : 'h-4 w-4 sm:h-4.5 sm:w-4.5';
  const logoSize = size === 'large' ? 'h-7 w-7 sm:h-8 sm:w-8' : 'h-5 w-5 sm:h-6 sm:w-6';

  return (
    <div className={cn('flex shrink-0 items-center justify-center rounded-lg', colors.bg, containerSize, className)}>
      {logo ? (
        <img src={logo} alt="" className={cn('object-contain', logoSize)} />
      ) : (
        <FallbackIcon className={cn(colors.text, iconSize)} />
      )}
    </div>
  );
}

/**
 * Export color utilities for reuse in badges
 */
export { getConnectorColors };
