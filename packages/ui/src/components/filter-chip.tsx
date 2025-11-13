import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Check } from 'lucide-react';

import { cn } from '@workspace/ui/lib/utils';

const filterChipVariants = cva(
  'inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
  {
    variants: {
      variant: {
        /**
         * @recommended Default filter variant with brand-driven active state.
         * Uses subtle blue background when selected, maintains accessibility with checkmark icon.
         */
        default: cn(
          // Inactive state
          'data-[state=inactive]:border-transparent data-[state=inactive]:text-muted-foreground',
          'data-[state=inactive]:hover:bg-accent data-[state=inactive]:hover:text-foreground',
          // Active state - Brand-driven with triple visual indicators (color + border + icon)
          'data-[state=active]:bg-[var(--brand-primary-subtle)] data-[state=active]:text-[var(--brand-primary)]',
          'data-[state=active]:border-[var(--brand-primary)] data-[state=active]:font-semibold',
        ),
        /**
         * Success variant for positive filters (encrypted, completed, approved).
         */
        success: cn(
          'data-[state=inactive]:border-transparent data-[state=inactive]:text-muted-foreground',
          'data-[state=inactive]:hover:bg-accent data-[state=inactive]:hover:text-foreground',
          'data-[state=active]:bg-[var(--success-subtle)] data-[state=active]:text-[var(--success)]',
          'data-[state=active]:border-[var(--success)] data-[state=active]:font-semibold',
        ),
        /**
         * Warning variant for caution filters (unencrypted, pending, draft).
         */
        warning: cn(
          'data-[state=inactive]:border-transparent data-[state=inactive]:text-muted-foreground',
          'data-[state=inactive]:hover:bg-accent data-[state=inactive]:hover:text-foreground',
          'data-[state=active]:bg-[var(--warning-subtle)] data-[state=active]:text-[var(--warning)]',
          'data-[state=active]:border-[var(--warning)] data-[state=active]:font-semibold',
        ),
        /**
         * Destructive variant for negative filters (deleted, rejected, failed).
         */
        destructive: cn(
          'data-[state=inactive]:border-transparent data-[state=inactive]:text-muted-foreground',
          'data-[state=inactive]:hover:bg-accent data-[state=inactive]:hover:text-foreground',
          'data-[state=active]:bg-destructive/10 data-[state=active]:text-destructive',
          'data-[state=active]:border-destructive data-[state=active]:font-semibold',
        ),
      },
      size: {
        default: 'h-8 px-3 py-1.5',
        sm: 'h-7 px-2.5 py-1 text-xs',
        lg: 'h-9 px-4 py-2',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface FilterChipProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'value' | 'onToggle'>,
    VariantProps<typeof filterChipVariants> {
  /**
   * Whether the filter is currently active/selected.
   */
  active?: boolean;
  /**
   * Show checkmark icon when active. Improves accessibility by providing non-color indicator.
   * @default true
   */
  showCheck?: boolean;
  /**
   * Custom icon to display instead of the default checkmark.
   */
  icon?: React.ReactNode;
  /**
   * Optional value for controlled filter groups.
   */
  value?: string;
  /**
   * Callback when the filter chip is clicked.
   * Receives the value (if provided) and the click event.
   */
  onToggle?: (value: string | undefined, event: React.MouseEvent<HTMLButtonElement>) => void;
}

/**
 * FilterChip Component
 *
 * A brand-driven filter chip component with built-in accessibility features.
 * Follows the Beqeek Design System color hierarchy for filter states.
 *
 * Features:
 * - Triple visual indicators: color + border + checkmark icon (not color alone)
 * - Semantic color variants for different filter types
 * - Full keyboard navigation support
 * - ARIA attributes for screen readers
 * - Motion preference support (via globals.css)
 *
 * @example
 * ```tsx
 * // Basic usage
 * <FilterChip active={statusFilter === 'all'} onClick={() => setStatusFilter('all')}>
 *   All
 * </FilterChip>
 *
 * // With value for controlled groups
 * <FilterChip
 *   value="encrypted"
 *   active={encryptionFilter === 'encrypted'}
 *   onToggle={(value) => setEncryptionFilter(value)}
 *   variant="success"
 * >
 *   E2EE
 * </FilterChip>
 *
 * // Custom icon
 * <FilterChip active icon={<ShieldCheck className="h-3.5 w-3.5" />}>
 *   Encrypted
 * </FilterChip>
 * ```
 */
const FilterChip = React.forwardRef<HTMLButtonElement, FilterChipProps>(
  (
    { className, variant, size, active = false, showCheck = true, icon, value, onToggle, onClick, children, ...props },
    ref,
  ) => {
    const handleClick = React.useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        // Call onToggle if provided (preferred for controlled filter groups)
        if (onToggle) {
          onToggle(value, event);
        }
        // Also call onClick for backward compatibility
        if (onClick) {
          onClick(event);
        }
      },
      [onToggle, onClick, value],
    );

    return (
      <button
        ref={ref}
        type="button"
        role="button"
        aria-pressed={active}
        data-state={active ? 'active' : 'inactive'}
        data-value={value}
        className={cn(filterChipVariants({ variant, size }), className)}
        onClick={handleClick}
        {...props}
      >
        {/* Show custom icon OR checkmark when active */}
        {active && (icon ?? (showCheck && <Check className="h-3.5 w-3.5" aria-hidden="true" />))}
        {children}
      </button>
    );
  },
);

FilterChip.displayName = 'FilterChip';

export { FilterChip, filterChipVariants };
