import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/utils.js';

/**
 * Container primitive - Max-width centered container with responsive padding
 *
 * @example
 * ```tsx
 * <Container maxWidth="xl" padding="gutter">
 *   <Content />
 * </Container>
 * ```
 */

const containerVariants = cva('mx-auto w-full', {
  variants: {
    maxWidth: {
      none: 'max-w-none',
      sm: 'max-w-[var(--container-sm)]',
      md: 'max-w-[var(--container-md)]',
      lg: 'max-w-[var(--container-lg)]',
      xl: 'max-w-[var(--container-xl)]',
      '2xl': 'max-w-[var(--container-2xl)]',
      full: 'max-w-full',
    },
    padding: {
      none: 'px-0',
      'space-025': 'px-[var(--space-025)]',
      'space-050': 'px-[var(--space-050)]',
      'space-075': 'px-[var(--space-075)]',
      'space-100': 'px-[var(--space-100)]',
      'space-150': 'px-[var(--space-150)]',
      'space-200': 'px-[var(--space-200)]',
      'space-250': 'px-[var(--space-250)]',
      'space-300': 'px-[var(--space-300)]',
      'space-400': 'px-[var(--space-400)]',
      'space-500': 'px-[var(--space-500)]',
      'space-600': 'px-[var(--space-600)]',
      'space-800': 'px-[var(--space-800)]',
      'space-1000': 'px-[var(--space-1000)]',
      gutter: 'px-[var(--grid-gutter)]', // Use responsive grid gutter
      margin: 'px-[var(--grid-margin)]', // Use responsive grid margin
    },
    center: {
      true: 'mx-auto',
      false: '',
    },
  },
  defaultVariants: {
    maxWidth: 'xl',
    padding: 'margin',
    center: true,
  },
});

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof containerVariants> {
  /**
   * HTML element to render as
   * @default 'div'
   */
  as?: keyof JSX.IntrinsicElements;
}

export const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, maxWidth, padding, center, as: Component = 'div', ...props }, ref) => {
    return (
      <Component ref={ref} className={cn(containerVariants({ maxWidth, padding, center }), className)} {...props} />
    );
  },
);

Container.displayName = 'Container';
