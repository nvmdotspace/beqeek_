/**
 * Layout Primitives - Composable layout building blocks
 *
 * These components provide consistent spacing, alignment, and responsive behavior
 * using the Atlassian-inspired 8px spacing system and 12-column grid.
 *
 * @see /docs/atlassian-spacing-grid-system.md for design specifications
 * @see /docs/layout-primitives-guide.md for usage guidelines
 */

export { Box } from './box';
export type { BoxProps } from './box';

export { Stack } from './stack';
export type { StackProps } from './stack';

export { Inline } from './inline';
export type { InlineProps } from './inline';

export { Grid, GridItem } from './grid';
export type { GridProps, GridItemProps } from './grid';

export { Container } from './container';
export type { ContainerProps } from './container';
