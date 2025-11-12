import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/utils.js';

/**
 * Stack primitive - Vertical layout with managed spacing between children
 *
 * @example
 * ```tsx
 * <Stack space="space-200" align="start">
 *   <Header />
 *   <Content />
 *   <Footer />
 * </Stack>
 * ```
 */

const stackVariants = cva('flex flex-col', {
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
  },
  defaultVariants: {
    space: 'none',
    align: 'stretch',
    justify: 'start',
  },
});

export interface StackProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof stackVariants> {
  /**
   * HTML element to render as
   * @default 'div'
   */
  as?: keyof JSX.IntrinsicElements;
}

export const Stack = React.forwardRef<HTMLDivElement, StackProps>(
  ({ className, space, align, justify, as: Component = 'div', ...props }, ref) => {
    return <Component ref={ref} className={cn(stackVariants({ space, align, justify }), className)} {...props} />;
  },
);

Stack.displayName = 'Stack';
