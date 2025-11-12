import * as React from 'react';
import { cn } from '@workspace/ui/lib/utils';

export interface CodeProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * Render as inline code (within text) or block code (standalone).
   *
   * - `inline`: Renders <code> with inline styles (87.5% parent font-size)
   * - `block`: Renders <pre><code> with block styles and consistent line-height
   *
   * @default true (inline code)
   *
   * @example
   * // Inline code within text
   * <p>Use the <Code>useState</Code> hook for state management.</p>
   *
   * @example
   * // Block code
   * <Code inline={false}>{`
   * function example() {
   *   return true;
   * }
   * `}</Code>
   */
  inline?: boolean;

  /**
   * Content to render (code string or React nodes)
   */
  children: React.ReactNode;

  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Code component for displaying code snippets with monospace font.
 *
 * Automatically applies typography design tokens:
 * - Monospace font family (Menlo, Monaco, Consolas)
 * - Inline: 0.875em (87.5% of parent), line-height 1
 * - Block: 0.875rem (14px), line-height 1.5
 * - Background and border styling for visual distinction
 *
 * @example
 * // Inline code within paragraph
 * <Text>
 *   Use <Code>const example = true;</Code> in your code.
 * </Text>
 *
 * @example
 * // Block code snippet
 * <Code inline={false}>{`
 * function greet(name: string) {
 *   return \`Hello, \${name}!\`;
 * }
 * `}</Code>
 *
 * @example
 * // With custom styling
 * <Code className="bg-primary text-primary-foreground">
 *   Highlighted code
 * </Code>
 *
 * @example
 * // JSON data display
 * <Code inline={false}>
 *   {JSON.stringify({ name: 'Beqeek', version: '1.0' }, null, 2)}
 * </Code>
 */
export const Code = React.forwardRef<HTMLElement, CodeProps>(
  ({ inline = true, children, className, ...props }, ref) => {
    if (inline) {
      // Inline code: <code> element with subtle background
      const inlineStyles = {
        fontSize: 'var(--font-code-inline-size)',
        lineHeight: 'var(--font-code-inline-line-height)',
        fontWeight: 'var(--font-code-inline-weight)',
        fontFamily: 'var(--font-code-inline-family)',
        letterSpacing: 'var(--font-code-inline-letter-spacing)',
      };

      return (
        <code
          ref={ref as React.Ref<HTMLElement>}
          style={inlineStyles}
          className={cn(
            'relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-normal',
            'border border-border/50',
            className,
          )}
          {...props}
        >
          {children}
        </code>
      );
    }

    // Block code: <pre><code> with consistent formatting
    const blockStyles = {
      fontSize: 'var(--font-code-block-size)',
      lineHeight: 'var(--font-code-block-line-height)',
      fontWeight: 'var(--font-code-block-weight)',
      fontFamily: 'var(--font-code-block-family)',
      letterSpacing: 'var(--font-code-block-letter-spacing)',
    };

    return (
      <pre
        ref={ref as React.Ref<HTMLPreElement>}
        className={cn(
          'overflow-x-auto rounded-lg border border-border bg-muted p-4',
          'scrollbar-thin scrollbar-track-muted scrollbar-thumb-border',
          className,
        )}
        {...props}
      >
        <code style={blockStyles} className="font-mono text-sm">
          {children}
        </code>
      </pre>
    );
  },
);

Code.displayName = 'Code';
