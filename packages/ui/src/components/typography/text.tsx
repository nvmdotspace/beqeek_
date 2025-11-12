import * as React from 'react';
import { cn } from '@workspace/ui/lib/utils';

/**
 * Text size variants
 */
type TextSize = 'large' | 'default' | 'small';

/**
 * Text weight variants
 */
type TextWeight = 'regular' | 'medium' | 'semibold' | 'bold';

/**
 * Text color variants using design system tokens
 */
type TextColor =
  | 'default' // --foreground
  | 'muted' // --muted-foreground
  | 'primary' // --primary
  | 'secondary' // --secondary-foreground
  | 'destructive' // --destructive
  | 'accent'; // --accent-foreground

/**
 * HTML elements that can render text
 */
type TextElement = 'p' | 'span' | 'div' | 'label';

export interface TextProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * Text size determines font size and line height.
   * Maps to typography design tokens (--font-body-*-size, --font-body-*-line-height)
   *
   * @default 'default'
   *
   * @example
   * <Text size="large">Emphasized body text</Text>
   * <Text size="default">Standard UI text</Text>
   * <Text size="small">Captions and labels</Text>
   */
  size?: TextSize;

  /**
   * Text weight (font-weight)
   *
   * @default 'regular'
   *
   * @example
   * <Text weight="regular">Normal text</Text>
   * <Text weight="medium">Slightly emphasized</Text>
   * <Text weight="semibold">Emphasized text</Text>
   * <Text weight="bold">Strong emphasis</Text>
   */
  weight?: TextWeight;

  /**
   * Text color using design system tokens.
   * Automatically adapts to dark mode.
   *
   * @default 'default'
   *
   * @example
   * <Text color="default">Primary text color</Text>
   * <Text color="muted">Secondary/helper text</Text>
   * <Text color="primary">Highlighted text</Text>
   * <Text color="destructive">Error messages</Text>
   */
  color?: TextColor;

  /**
   * HTML element to render
   *
   * @default 'p'
   *
   * @example
   * <Text as="p">Paragraph text</Text>
   * <Text as="span">Inline text</Text>
   * <Text as="label">Form label</Text>
   */
  as?: TextElement;

  /**
   * Content to render
   */
  children: React.ReactNode;

  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Color class mapping to design system tokens
 */
const colorClasses: Record<TextColor, string> = {
  default: 'text-foreground',
  muted: 'text-muted-foreground',
  primary: 'text-primary',
  secondary: 'text-secondary-foreground',
  destructive: 'text-destructive',
  accent: 'text-accent-foreground',
};

/**
 * Text component for body text with size, weight, and color variants.
 *
 * Automatically applies typography design tokens based on size:
 * - Font size and line height
 * - Vietnamese optimization when document.documentElement.lang === 'vi'
 * - Theme-aware colors that adapt to dark mode
 *
 * @example
 * // Basic paragraph
 * <Text>Default body text with standard size and weight</Text>
 *
 * @example
 * // Emphasized text
 * <Text size="large" weight="medium">
 *   Large, medium-weight text for emphasis
 * </Text>
 *
 * @example
 * // Helper text
 * <Text size="small" color="muted">
 *   Small, muted helper text or captions
 * </Text>
 *
 * @example
 * // Inline text
 * <p>
 *   Regular text with <Text as="span" weight="semibold">bold emphasis</Text> inline.
 * </p>
 *
 * @example
 * // Error message
 * <Text color="destructive" weight="medium">
 *   This field is required
 * </Text>
 *
 * @example
 * // Vietnamese content (auto-optimized when lang="vi")
 * <Text>Hệ thống quản lý công việc hiệu quả</Text>
 */
export const Text = React.forwardRef<HTMLElement, TextProps>(
  ({ size = 'default', weight = 'regular', color = 'default', as = 'p', children, className, ...props }, ref) => {
    const Component = as;

    // Map size to CSS custom properties
    const textStyles = {
      fontSize: `var(--font-body-${size}-size)`,
      lineHeight: `var(--font-body-${size}-line-height)`,
      fontWeight: `var(--font-weight-${weight})`,
      fontFamily: `var(--font-body-${size}-family)`,
      letterSpacing: `var(--font-body-${size}-letter-spacing)`,
    };

    return (
      <Component ref={ref as any} style={textStyles} className={cn(colorClasses[color], className)} {...props}>
        {children}
      </Component>
    );
  },
);

Text.displayName = 'Text';
