import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/utils.js';

/**
 * Box primitive - Generic container with configurable padding
 *
 * @example
 * ```tsx
 * <Box padding="space-300" backgroundColor="background">
 *   <Content />
 * </Box>
 * ```
 */

const boxVariants = cva('', {
  variants: {
    padding: {
      none: 'p-0',
      'space-025': 'p-[var(--space-025)]',
      'space-050': 'p-[var(--space-050)]',
      'space-075': 'p-[var(--space-075)]',
      'space-100': 'p-[var(--space-100)]',
      'space-150': 'p-[var(--space-150)]',
      'space-200': 'p-[var(--space-200)]',
      'space-250': 'p-[var(--space-250)]',
      'space-300': 'p-[var(--space-300)]',
      'space-400': 'p-[var(--space-400)]',
      'space-500': 'p-[var(--space-500)]',
      'space-600': 'p-[var(--space-600)]',
      'space-800': 'p-[var(--space-800)]',
      'space-1000': 'p-[var(--space-1000)]',
    },
    backgroundColor: {
      none: '',
      background: 'bg-background',
      card: 'bg-card',
      muted: 'bg-muted',
      accent: 'bg-accent',
      primary: 'bg-primary',
      secondary: 'bg-secondary',
      destructive: 'bg-destructive',
      success: 'bg-success-subtle',
      warning: 'bg-warning-subtle',
      info: 'bg-info-subtle',
    },
    borderRadius: {
      none: 'rounded-none',
      sm: 'rounded-sm',
      md: 'rounded-md',
      lg: 'rounded-lg',
      xl: 'rounded-xl',
      '2xl': 'rounded-2xl',
      full: 'rounded-full',
    },
    border: {
      none: '',
      default: 'border border-border',
      muted: 'border border-muted',
      primary: 'border border-primary',
      success: 'border border-success',
      warning: 'border border-warning',
      info: 'border border-info',
      destructive: 'border border-destructive',
    },
  },
  defaultVariants: {
    padding: 'none',
    backgroundColor: 'none',
    borderRadius: 'none',
    border: 'none',
  },
});

export interface BoxProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof boxVariants> {
  /**
   * HTML element to render as
   * @default 'div'
   */
  as?: keyof JSX.IntrinsicElements;
}

export const Box = React.forwardRef<HTMLDivElement, BoxProps>(
  ({ className, padding, backgroundColor, borderRadius, border, as: Component = 'div', ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={cn(boxVariants({ padding, backgroundColor, borderRadius, border }), className)}
        {...props}
      />
    );
  },
);

Box.displayName = 'Box';
