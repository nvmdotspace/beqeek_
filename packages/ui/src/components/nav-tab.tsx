import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@workspace/ui/lib/utils';

const navTabVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap px-3 py-2 text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
  {
    variants: {
      variant: {
        /**
         * @recommended Default tab variant with border-bottom accent.
         * Uses brand color for active state, clearly separating navigation from filtering.
         */
        default: cn(
          'rounded-none border-b-2',
          // Inactive state
          'data-[state=inactive]:border-transparent data-[state=inactive]:text-muted-foreground',
          'data-[state=inactive]:hover:text-foreground data-[state=inactive]:hover:border-border',
          // Active state - Brand-driven with bottom border accent
          'data-[state=active]:border-[var(--brand-primary)] data-[state=active]:text-[var(--brand-primary)]',
          'data-[state=active]:font-semibold',
        ),
      },
      size: {
        default: 'h-10',
        sm: 'h-9 text-xs',
        lg: 'h-11',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface NavTabProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'value' | 'onSelect'>,
    VariantProps<typeof navTabVariants> {
  /**
   * Whether the tab is currently active/selected.
   */
  active?: boolean;
  /**
   * Optional value for controlled tab groups.
   */
  value?: string;
  /**
   * Callback when the tab is clicked.
   * Receives the value (if provided) and the click event.
   */
  onSelect?: (value: string | undefined, event: React.MouseEvent<HTMLButtonElement>) => void;
}

/**
 * NavTab Component
 *
 * A tab navigation component with border-bottom accent pattern.
 * Designed to clearly differentiate Level 2 (navigation) from Level 3 (filtering).
 *
 * Features:
 * - Bottom-border accent (not background fill)
 * - Brand-driven active state
 * - Full keyboard navigation support
 * - ARIA attributes for screen readers
 * - Motion preference support (via globals.css)
 *
 * Visual Hierarchy:
 * - Level 1: Primary CTAs (brand-primary buttons)
 * - Level 2: Tab Navigation (border-bottom accent) ← NavTab
 * - Level 3: Filter Chips (subtle background + border + icon)
 * - Level 4: Secondary Actions (outline/secondary buttons)
 * - Level 5: Minimal Interactions (ghost buttons)
 *
 * @example
 * ```tsx
 * // Basic usage
 * <NavTab active={tab === 'all'} onClick={() => setTab('all')}>
 *   All
 * </NavTab>
 *
 * // With value for controlled groups
 * <NavTab
 *   value="hrm"
 *   active={selectedGroup === 'hrm'}
 *   onSelect={(value) => setSelectedGroup(value)}
 * >
 *   HRM
 * </NavTab>
 *
 * // Complete tab bar
 * <div className="flex gap-0 border-b border-border">
 *   <NavTab active={tab === 'all'} onClick={() => setTab('all')}>All</NavTab>
 *   <NavTab active={tab === 'active'} onClick={() => setTab('active')}>Active</NavTab>
 *   <NavTab active={tab === 'archived'} onClick={() => setTab('archived')}>Archived</NavTab>
 * </div>
 * ```
 */
const NavTab = React.forwardRef<HTMLButtonElement, NavTabProps>(
  ({ className, variant, size, active = false, value, onSelect, onClick, children, ...props }, ref) => {
    const handleClick = React.useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        // Call onSelect if provided (preferred for controlled tab groups)
        if (onSelect) {
          onSelect(value, event);
        }
        // Also call onClick for backward compatibility
        if (onClick) {
          onClick(event);
        }
      },
      [onSelect, onClick, value],
    );

    return (
      <button
        ref={ref}
        type="button"
        role="tab"
        aria-selected={active}
        data-state={active ? 'active' : 'inactive'}
        data-value={value}
        className={cn(navTabVariants({ variant, size }), className)}
        onClick={handleClick}
        {...props}
      >
        {children}
      </button>
    );
  },
);

NavTab.displayName = 'NavTab';

export { NavTab, navTabVariants };
