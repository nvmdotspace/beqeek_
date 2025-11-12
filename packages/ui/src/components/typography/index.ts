/**
 * Typography components using design system tokens
 *
 * All components automatically apply:
 * - Typography design tokens (font size, line height, weight, etc.)
 * - Vietnamese language optimization when document.documentElement.lang === 'vi'
 * - Responsive scaling at 1024px and 1280px breakpoints
 * - Dark mode support via theme color tokens
 *
 * @module typography
 */

export { Heading, type HeadingProps } from './heading.js';
export { Text, type TextProps } from './text.js';
export { Code, type CodeProps } from './code.js';
export { Metric, type MetricProps } from './metric.js';
