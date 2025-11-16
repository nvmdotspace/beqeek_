/**
 * Layout Primitives - Composable layout building blocks
 *
 * These components provide consistent spacing, alignment, and responsive behavior
 * using the Atlassian-inspired 8px spacing system and 12-column grid.
 *
 * @see /docs/atlassian-spacing-grid-system.md for design specifications
 * @see /docs/layout-primitives-guide.md for usage guidelines
 */

export { Box } from './box.js';
export type { BoxProps } from './box.js';

export { Stack } from './stack.js';
export type { StackProps } from './stack.js';

export { Inline } from './inline.js';
export type { InlineProps } from './inline.js';

export { Grid, GridItem } from './grid.js';
export type { GridProps, GridItemProps } from './grid.js';

export { Container } from './container.js';
export type { ContainerProps } from './container.js';
