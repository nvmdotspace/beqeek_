import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/utils.js';

/**
 * Inline primitive - Horizontal layout with managed spacing between children
 *
 * @example
 * ```tsx
 * <Inline space="space-150" align="center" wrap>
 *   <Button />
 *   <Button />
 *   <Button />
 * </Inline>
 * ```
 */

const inlineVariants = cva('flex', {
  variants: {
    space: {
      none: 'gap-0',
      'space-025': 'gap-[var(--space-025)]',
      'space-050': 'gap-[var(--space-050)]',
      'space-075': 'gap-[var(--space-075)]',
      'space-100': 'gap-[var(--space-100)]',
      'space-150': 'gap-[var(--space-150)]',
      'space-200': 'gap-[var(--space-200)]',
      'space-250': 'gap-[var(--space-250)]',
      'space-300': 'gap-[var(--space-300)]',
      'space-400': 'gap-[var(--space-400)]',
      'space-500': 'gap-[var(--space-500)]',
      'space-600': 'gap-[var(--space-600)]',
      'space-800': 'gap-[var(--space-800)]',
      'space-1000': 'gap-[var(--space-1000)]',
    },
    align: {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      stretch: 'items-stretch',
      baseline: 'items-baseline',
    },
    justify: {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
      around: 'justify-around',
      evenly: 'justify-evenly',
    },
    wrap: {
      true: 'flex-wrap',
      false: 'flex-nowrap',
    },
  },
  defaultVariants: {
    space: 'none',
    align: 'center',
    justify: 'start',
    wrap: false,
  },
});

export interface InlineProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof inlineVariants> {
  /**
   * HTML element to render as
   * @default 'div'
   */
  as?: keyof JSX.IntrinsicElements;
}

export const Inline = React.forwardRef<HTMLDivElement, InlineProps>(
  ({ className, space, align, justify, wrap, as: Component = 'div', ...props }, ref) => {
    return (
      <Component ref={ref} className={cn(inlineVariants({ space, align, justify, wrap }), className)} {...props} />
    );
  },
);

Inline.displayName = 'Inline';
