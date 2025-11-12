import * as React from 'react';
import { cn } from '@workspace/ui/lib/utils';

/**
 * Heading levels map to semantic HTML heading elements
 */
type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

/**
 * HTML heading elements that can be rendered
 */
type HeadingElement = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div' | 'span';

export interface HeadingProps extends Omit<React.HTMLAttributes<HTMLHeadingElement>, 'color'> {
  /**
   * Heading level determines visual style and default semantic HTML element.
   * Maps to typography design tokens (--font-heading-h1-*, etc.)
   *
   * @example
   * <Heading level={1}>Page Title</Heading> // Renders <h1> with h1 styles
   * <Heading level={2}>Section Title</Heading> // Renders <h2> with h2 styles
   */
  level: HeadingLevel;

  /**
   * Override the default HTML element while maintaining visual style.
   * Useful for SEO optimization (e.g., visual h2 that's semantic h1).
   *
   * @default Matches level (level={1} → <h1>, level={2} → <h2>, etc.)
   *
   * @example
   * <Heading level={2} as="h1">Styled as H2, semantic H1 for SEO</Heading>
   */
  as?: HeadingElement;

  /**
   * Content to render inside the heading
   */
  children: React.ReactNode;

  /**
   * Additional CSS classes to apply
   */
  className?: string;
}

/**
 * Heading component with semantic levels and Vietnamese language optimization.
 *
 * Automatically applies typography design tokens based on level:
 * - Font size, line height, weight, letter spacing
 * - Vietnamese optimization when document.documentElement.lang === 'vi'
 * - Responsive scaling at 1024px (h1-h3) and 1280px (h1-h2)
 *
 * @example
 * // Basic usage
 * <Heading level={1}>Page Title</Heading>
 *
 * @example
 * // Visual/semantic decoupling for SEO
 * <Heading level={2} as="h1">Styled as H2, but semantic H1</Heading>
 *
 * @example
 * // With custom classes
 * <Heading level={3} className="text-primary">Custom colored heading</Heading>
 *
 * @example
 * // Vietnamese content (auto-optimized when lang="vi")
 * <Heading level={1}>Quản lý không gian làm việc</Heading>
 */
export const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ level, as, children, className, ...props }, ref) => {
    // Default to semantic HTML element matching level
    const Component = (as || `h${level}`) as HeadingElement;

    // Map level to CSS custom properties
    const headingStyles = {
      fontSize: `var(--font-heading-h${level}-size)`,
      lineHeight: `var(--font-heading-h${level}-line-height)`,
      fontWeight: `var(--font-heading-h${level}-weight)`,
      letterSpacing: `var(--font-heading-h${level}-letter-spacing)`,
      fontFamily: `var(--font-heading-h${level}-family)`,
    };

    return (
      <Component ref={ref} style={headingStyles} className={cn('text-foreground', className)} {...props}>
        {children}
      </Component>
    );
  },
);

Heading.displayName = 'Heading';
