import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/utils.js';

/**
 * Grid primitive - 12-column responsive grid container
 *
 * @example
 * ```tsx
 * <Grid columns={12} gap="space-300">
 *   <GridItem span={8}>
 *     <MainContent />
 *   </GridItem>
 *   <GridItem span={4}>
 *     <Sidebar />
 *   </GridItem>
 * </Grid>
 * ```
 */

const gridVariants = cva('grid', {
  variants: {
    columns: {
      1: 'grid-cols-1',
      2: 'grid-cols-2',
      3: 'grid-cols-3',
      4: 'grid-cols-4',
      5: 'grid-cols-5',
      6: 'grid-cols-6',
      7: 'grid-cols-7',
      8: 'grid-cols-8',
      9: 'grid-cols-9',
      10: 'grid-cols-10',
      11: 'grid-cols-11',
      12: 'grid-cols-12',
    },
    gap: {
      none: 'gap-0',
      'space-025': 'gap-[var(--space-025)]',
      'space-037': 'gap-[var(--space-037)]',
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
      gutter: 'gap-[var(--grid-gutter)]', // Use responsive grid gutter
    },
    align: {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      stretch: 'items-stretch',
      baseline: 'items-baseline',
    },
    justify: {
      start: 'justify-items-start',
      center: 'justify-items-center',
      end: 'justify-items-end',
      stretch: 'justify-items-stretch',
    },
  },
  defaultVariants: {
    columns: 12,
    gap: 'gutter',
    align: 'stretch',
    justify: 'stretch',
  },
});

export interface GridProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof gridVariants> {
  /**
   * HTML element to render as
   * @default 'div'
   */
  as?: React.ElementType;
}

export const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  ({ className, columns, gap, align, justify, as = 'div', ...props }, ref) => {
    const Component = as as React.ElementType;
    return <Component ref={ref} className={cn(gridVariants({ columns, gap, align, justify }), className)} {...props} />;
  },
);

Grid.displayName = 'Grid';

/**
 * GridItem - Child component for Grid that controls column span
 *
 * @example
 * ```tsx
 * <GridItem span={8} spanMd={6} spanSm={12}>
 *   <Content />
 * </GridItem>
 * ```
 */

const gridItemVariants = cva('', {
  variants: {
    span: {
      1: 'col-span-1',
      2: 'col-span-2',
      3: 'col-span-3',
      4: 'col-span-4',
      5: 'col-span-5',
      6: 'col-span-6',
      7: 'col-span-7',
      8: 'col-span-8',
      9: 'col-span-9',
      10: 'col-span-10',
      11: 'col-span-11',
      12: 'col-span-12',
      full: 'col-span-full',
    },
    spanSm: {
      1: 'sm:col-span-1',
      2: 'sm:col-span-2',
      3: 'sm:col-span-3',
      4: 'sm:col-span-4',
      5: 'sm:col-span-5',
      6: 'sm:col-span-6',
      7: 'sm:col-span-7',
      8: 'sm:col-span-8',
      9: 'sm:col-span-9',
      10: 'sm:col-span-10',
      11: 'sm:col-span-11',
      12: 'sm:col-span-12',
      full: 'sm:col-span-full',
    },
    spanMd: {
      1: 'md:col-span-1',
      2: 'md:col-span-2',
      3: 'md:col-span-3',
      4: 'md:col-span-4',
      5: 'md:col-span-5',
      6: 'md:col-span-6',
      7: 'md:col-span-7',
      8: 'md:col-span-8',
      9: 'md:col-span-9',
      10: 'md:col-span-10',
      11: 'md:col-span-11',
      12: 'md:col-span-12',
      full: 'md:col-span-full',
    },
    spanLg: {
      1: 'lg:col-span-1',
      2: 'lg:col-span-2',
      3: 'lg:col-span-3',
      4: 'lg:col-span-4',
      5: 'lg:col-span-5',
      6: 'lg:col-span-6',
      7: 'lg:col-span-7',
      8: 'lg:col-span-8',
      9: 'lg:col-span-9',
      10: 'lg:col-span-10',
      11: 'lg:col-span-11',
      12: 'lg:col-span-12',
      full: 'lg:col-span-full',
    },
    spanXl: {
      1: 'xl:col-span-1',
      2: 'xl:col-span-2',
      3: 'xl:col-span-3',
      4: 'xl:col-span-4',
      5: 'xl:col-span-5',
      6: 'xl:col-span-6',
      7: 'xl:col-span-7',
      8: 'xl:col-span-8',
      9: 'xl:col-span-9',
      10: 'xl:col-span-10',
      11: 'xl:col-span-11',
      12: 'xl:col-span-12',
      full: 'xl:col-span-full',
    },
    start: {
      1: 'col-start-1',
      2: 'col-start-2',
      3: 'col-start-3',
      4: 'col-start-4',
      5: 'col-start-5',
      6: 'col-start-6',
      7: 'col-start-7',
      8: 'col-start-8',
      9: 'col-start-9',
      10: 'col-start-10',
      11: 'col-start-11',
      12: 'col-start-12',
      auto: 'col-start-auto',
    },
  },
  defaultVariants: {
    span: 12,
  },
});

export interface GridItemProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof gridItemVariants> {
  /**
   * HTML element to render as
   * @default 'div'
   */
  as?: React.ElementType;
}

export const GridItem = React.forwardRef<HTMLDivElement, GridItemProps>(
  ({ className, span, spanSm, spanMd, spanLg, spanXl, start, as = 'div', ...props }, ref) => {
    const Component = as as React.ElementType;
    return (
      <Component
        ref={ref}
        className={cn(gridItemVariants({ span, spanSm, spanMd, spanLg, spanXl, start }), className)}
        {...props}
      />
    );
  },
);

GridItem.displayName = 'GridItem';
