import { Lock, LockOpen, AlertCircle } from 'lucide-react';

import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@workspace/ui/components/tooltip';

/**
 * Encryption status types
 */
export type EncryptionStatus = 'encrypted' | 'key-required' | 'not-encrypted';

/**
 * Props for EncryptionStatus component
 */
export interface EncryptionStatusProps {
  /** Current encryption status */
  status: EncryptionStatus;
  /** Whether E2EE is enabled for the table */
  isE2EEEnabled?: boolean;
  /** Whether encryption key is loaded */
  isKeyLoaded?: boolean;
  /** Callback when user clicks to manage encryption key */
  onManageKey?: () => void;
  /** Display as button instead of badge */
  interactive?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * EncryptionStatus component
 *
 * Visual indicator showing encryption status of an Active Table.
 *
 * Status variants:
 * - `encrypted`: E2EE enabled and key loaded (green badge with lock icon)
 * - `key-required`: E2EE enabled but key missing (yellow/warning badge)
 * - `not-encrypted`: E2EE disabled (gray badge with open lock)
 *
 * Features:
 * - Visual status badge with color coding
 * - Icon representation for quick recognition
 * - Tooltip with detailed information
 * - Optional interactive mode (clickable to manage key)
 * - Accessibility support with ARIA labels
 *
 * @example
 * ```tsx
 * // As status badge
 * <EncryptionStatus
 *   status="encrypted"
 *   isE2EEEnabled={true}
 *   isKeyLoaded={true}
 * />
 *
 * // As interactive button
 * <EncryptionStatus
 *   status="key-required"
 *   isE2EEEnabled={true}
 *   isKeyLoaded={false}
 *   onManageKey={handleOpenKeyDialog}
 *   interactive
 * />
 * ```
 */
export function EncryptionStatus({
  status,
  onManageKey,
  interactive = false,
  className = '',
}: EncryptionStatusProps) {
  /**
   * Get status configuration based on current state
   */
  const getStatusConfig = () => {
    switch (status) {
      case 'encrypted':
        return {
          label: 'Encrypted',
          icon: Lock,
          variant: 'default' as const,
          description: 'This table is encrypted and unlocked with your key',
          ariaLabel: 'Table is encrypted and accessible',
        };
      case 'key-required':
        return {
          label: 'Key Required',
          icon: AlertCircle,
          variant: 'destructive' as const,
          description: 'Encryption key required to view this table',
          ariaLabel: 'Encryption key required to access table',
        };
      case 'not-encrypted':
      default:
        return {
          label: 'Not Encrypted',
          icon: LockOpen,
          variant: 'secondary' as const,
          description: 'This table is not encrypted',
          ariaLabel: 'Table is not encrypted',
        };
    }
  };

  const config = getStatusConfig();
  const IconComponent = config.icon;

  /**
   * Render as interactive button
   */
  if (interactive && onManageKey) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={onManageKey}
              className={className}
              aria-label={config.ariaLabel}
            >
              <IconComponent className="h-4 w-4 mr-2" aria-hidden="true" />
              {config.label}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{config.description}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Click to manage encryption key
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  /**
   * Render as status badge
   */
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={className}>
            <Badge
              variant={config.variant}
              className="gap-1.5"
              aria-label={config.ariaLabel}
            >
              <IconComponent className="h-3 w-3" aria-hidden="true" />
              {config.label}
            </Badge>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{config.description}</p>
          {status === 'encrypted' && (
            <p className="text-xs text-muted-foreground mt-1">
              Key loaded from browser storage
            </p>
          )}
          {status === 'key-required' && (
            <p className="text-xs text-muted-foreground mt-1">
              Enter your encryption key to access data
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * Hook to determine encryption status from table state
 *
 * @param isE2EEEnabled - Whether E2EE is enabled for the table
 * @param isKeyLoaded - Whether encryption key is loaded
 * @returns Current encryption status
 *
 * @example
 * ```tsx
 * const status = useEncryptionStatus(table.config.e2eeEncryption, isKeyLoaded);
 * <EncryptionStatus status={status} />
 * ```
 */
export function useEncryptionStatus(
  isE2EEEnabled: boolean,
  isKeyLoaded: boolean
): EncryptionStatus {
  if (!isE2EEEnabled) {
    return 'not-encrypted';
  }

  return isKeyLoaded ? 'encrypted' : 'key-required';
}
