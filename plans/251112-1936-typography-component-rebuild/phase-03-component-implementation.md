# Phase 03: Component Implementation

**Duration**: 3 days
**Dependencies**: Phase 02 (Design Token System)
**Status**: Draft

## Objectives

1. Build Heading component with 6 semantic levels
2. Implement Text component with 3 size variants
3. Create Code component for inline/block code
4. Develop Metric component for data displays
5. Add full TypeScript types and accessibility features

## Tasks

### Task 3.1: Heading Component (5 hours)

**Goal**: Semantic heading component with proper HTML mapping and variants

**File**: `packages/ui/src/components/typography/heading.tsx`

**Implementation:**

````tsx
import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@workspace/ui/lib/utils';

/**
 * Heading variants using typography design tokens
 */
const headingVariants = cva('font-sans text-foreground', {
  variants: {
    level: {
      display: 'text-heading-display font-heading-display leading-heading-display tracking-tight',
      large: 'text-heading-large font-heading-large leading-heading-large tracking-tight',
      medium: 'text-heading-medium font-heading-medium leading-heading-medium',
      small: 'text-heading-small font-heading-small leading-heading-small',
      xsmall: 'text-heading-xsmall font-heading-xsmall leading-heading-xsmall',
      xxsmall: 'text-heading-xxsmall font-heading-xxsmall leading-heading-xxsmall',
    },
    color: {
      default: 'text-foreground',
      muted: 'text-muted-foreground',
      primary: 'text-primary',
      destructive: 'text-destructive',
    },
  },
  defaultVariants: {
    level: 'medium',
    color: 'default',
  },
});

/**
 * Semantic mapping of levels to HTML elements
 */
const levelToElement = {
  display: 'h1',
  large: 'h2',
  medium: 'h3',
  small: 'h4',
  xsmall: 'h5',
  xxsmall: 'h6',
} as const;

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement>, VariantProps<typeof headingVariants> {
  /**
   * Typography level (maps to semantic HTML element)
   * @default 'medium'
   */
  level?: keyof typeof levelToElement;
  /**
   * Render as child component (useful for Next.js Link, TanStack Router Link)
   * @default false
   */
  asChild?: boolean;
  /**
   * Override default HTML element (use sparingly for visual hierarchy mismatches)
   */
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
}

/**
 * Heading component with semantic HTML mapping and design token integration
 *
 * @example
 * ```tsx
 * // Page title (renders as <h1>)
 * <Heading level="display">Dashboard</Heading>
 *
 * // Section heading (renders as <h2>)
 * <Heading level="large">Recent Activity</Heading>
 *
 * // Visual hierarchy mismatch (h1 styled as h3)
 * <Heading level="medium" as="h1">Styled smaller</Heading>
 *
 * // Custom color
 * <Heading level="small" color="muted">Subtitle</Heading>
 *
 * // As Link component
 * <Heading level="medium" asChild>
 *   <Link to="/page">Linked Heading</Link>
 * </Heading>
 * ```
 */
export const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, level = 'medium', color, asChild = false, as, ...props }, ref) => {
    const Comp = asChild ? Slot : as || levelToElement[level];

    return <Comp ref={ref} className={cn(headingVariants({ level, color }), className)} {...props} />;
  },
);

Heading.displayName = 'Heading';
````

**Tests**: `packages/ui/src/components/typography/__tests__/heading.test.tsx`

```tsx
import { render } from '@testing-library/react';
import { Heading } from '../heading';

describe('Heading', () => {
  it('renders display level as h1', () => {
    const { container } = render(<Heading level="display">Title</Heading>);
    expect(container.querySelector('h1')).toBeInTheDocument();
  });

  it('renders large level as h2', () => {
    const { container } = render(<Heading level="large">Section</Heading>);
    expect(container.querySelector('h2')).toBeInTheDocument();
  });

  it('overrides element with as prop', () => {
    const { container } = render(
      <Heading level="medium" as="h1">
        Override
      </Heading>,
    );
    expect(container.querySelector('h1')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<Heading className="custom-class">Test</Heading>);
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('supports asChild pattern', () => {
    const { getByRole } = render(
      <Heading asChild>
        <a href="/link">Link Heading</a>
      </Heading>,
    );
    expect(getByRole('link')).toHaveTextContent('Link Heading');
  });
});
```

**Acceptance**:

- [ ] 6 heading levels implemented
- [ ] Semantic HTML mapping correct
- [ ] TypeScript types complete
- [ ] Tests passing (5/5)
- [ ] JSDoc comments complete

### Task 3.2: Text Component (4 hours)

**Goal**: Body text component with size variants and semantic options

**File**: `packages/ui/src/components/typography/text.tsx`

````tsx
import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@workspace/ui/lib/utils';

const textVariants = cva('font-sans', {
  variants: {
    size: {
      large: 'text-body-large leading-body-large',
      default: 'text-body leading-body',
      small: 'text-body-small leading-body-small',
    },
    weight: {
      normal: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
    },
    color: {
      default: 'text-foreground',
      muted: 'text-muted-foreground',
      primary: 'text-primary',
      secondary: 'text-secondary-foreground',
      destructive: 'text-destructive',
      success: 'text-green-600 dark:text-green-400',
      warning: 'text-amber-600 dark:text-amber-400',
    },
    align: {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
      justify: 'text-justify',
    },
  },
  defaultVariants: {
    size: 'default',
    weight: 'normal',
    color: 'default',
    align: 'left',
  },
});

export interface TextProps extends React.HTMLAttributes<HTMLElement>, VariantProps<typeof textVariants> {
  /**
   * HTML element to render
   * @default 'p'
   */
  as?: 'p' | 'span' | 'div' | 'label' | 'legend';
  /**
   * Render as child component
   * @default false
   */
  asChild?: boolean;
  /**
   * Truncate text with ellipsis
   * @default false
   */
  truncate?: boolean;
  /**
   * Clamp text to N lines
   */
  lineClamp?: 1 | 2 | 3 | 4 | 5 | 6;
}

/**
 * Text component for body content with size/weight/color variants
 *
 * @example
 * ```tsx
 * // Standard paragraph
 * <Text>This is default body text</Text>
 *
 * // Large text for long-form content
 * <Text size="large">Article content goes here...</Text>
 *
 * // Small caption text
 * <Text size="small" color="muted">Caption or helper text</Text>
 *
 * // Medium weight label
 * <Text as="label" weight="medium">Form Label</Text>
 *
 * // Truncated with ellipsis
 * <Text truncate>Very long text that will be truncated...</Text>
 *
 * // Line clamping
 * <Text lineClamp={3}>Multi-line text that clamps to 3 lines...</Text>
 * ```
 */
export const Text = React.forwardRef<HTMLElement, TextProps>(
  (
    {
      className,
      size,
      weight,
      color,
      align,
      as: Component = 'p',
      asChild = false,
      truncate = false,
      lineClamp,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : Component;

    return (
      <Comp
        ref={ref}
        className={cn(
          textVariants({ size, weight, color, align }),
          truncate && 'truncate',
          lineClamp && `line-clamp-${lineClamp}`,
          className,
        )}
        {...props}
      />
    );
  },
);

Text.displayName = 'Text';
````

**Acceptance**:

- [ ] 3 size variants working
- [ ] 7 color options available
- [ ] Truncate and line-clamp utilities
- [ ] Semantic elements (p, span, label, div)
- [ ] Full TypeScript types

### Task 3.3: Code Component (3 hours)

**Goal**: Inline and block code components with syntax highlighting support

**File**: `packages/ui/src/components/typography/code.tsx`

````tsx
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@workspace/ui/lib/utils';

const codeVariants = cva('font-mono', {
  variants: {
    variant: {
      inline: 'text-code leading-code bg-muted px-1.5 py-0.5 rounded-md border border-border',
      block: 'text-code leading-code-block bg-muted p-4 rounded-lg border border-border overflow-x-auto',
    },
    color: {
      default: 'text-foreground',
      muted: 'text-muted-foreground',
      primary: 'text-primary',
    },
  },
  defaultVariants: {
    variant: 'inline',
    color: 'default',
  },
});

export interface CodeProps extends React.HTMLAttributes<HTMLElement>, VariantProps<typeof codeVariants> {
  /**
   * Render as pre>code for block code
   * @default false (renders as <code> inline)
   */
  block?: boolean;
}

/**
 * Code component for inline and block code snippets
 *
 * @example
 * ```tsx
 * // Inline code
 * <Text>Install with <Code>npm install</Code></Text>
 *
 * // Block code
 * <Code block>
 *   const example = 'code block';
 *   console.log(example);
 * </Code>
 *
 * // Custom color
 * <Code color="primary">highlighted code</Code>
 * ```
 */
export const Code = React.forwardRef<HTMLElement, CodeProps>(
  ({ className, variant, color, block, children, ...props }, ref) => {
    const codeElement = (
      <code ref={ref} className={cn(codeVariants({ variant: block ? 'block' : variant, color }), className)} {...props}>
        {children}
      </code>
    );

    if (block) {
      return <pre className="not-prose">{codeElement}</pre>;
    }

    return codeElement;
  },
);

Code.displayName = 'Code';
````

**Acceptance**:

- [ ] Inline variant working
- [ ] Block variant with pre wrapper
- [ ] Horizontal scroll for long lines
- [ ] Design tokens applied

### Task 3.4: Metric Component (3 hours)

**Goal**: Component for displaying numeric data and metrics

**File**: `packages/ui/src/components/typography/metric.tsx`

````tsx
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@workspace/ui/lib/utils';

const metricVariants = cva('font-sans tabular-nums', {
  variants: {
    size: {
      large: 'text-metric-large leading-metric-large font-metric-large',
      medium: 'text-metric-medium leading-metric-medium font-metric-medium',
      small: 'text-metric-small leading-metric-small font-metric-small',
    },
    color: {
      default: 'text-foreground',
      primary: 'text-primary',
      success: 'text-green-600 dark:text-green-400',
      warning: 'text-amber-600 dark:text-amber-400',
      danger: 'text-destructive',
    },
  },
  defaultVariants: {
    size: 'medium',
    color: 'default',
  },
});

export interface MetricProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof metricVariants> {
  /**
   * Metric value (number or string)
   */
  value: string | number;
  /**
   * Optional label below metric
   */
  label?: string;
  /**
   * Optional unit (%, $, etc.)
   */
  unit?: string;
  /**
   * Unit position
   * @default 'suffix'
   */
  unitPosition?: 'prefix' | 'suffix';
}

/**
 * Metric component for displaying numeric data with labels
 *
 * @example
 * ```tsx
 * // Large metric
 * <Metric size="large" value={1234} label="Total Users" />
 *
 * // With percentage
 * <Metric value={87.5} unit="%" label="Completion Rate" />
 *
 * // With currency prefix
 * <Metric value={49.99} unit="$" unitPosition="prefix" label="Revenue" />
 *
 * // Colored metric
 * <Metric value={23} color="success" label="New Orders" />
 * ```
 */
export const Metric = React.forwardRef<HTMLDivElement, MetricProps>(
  ({ className, size, color, value, label, unit, unitPosition = 'suffix', ...props }, ref) => {
    return (
      <div ref={ref} className={cn('space-y-1', className)} {...props}>
        <div className={cn(metricVariants({ size, color }))}>
          {unit && unitPosition === 'prefix' && <span className="mr-1">{unit}</span>}
          {value}
          {unit && unitPosition === 'suffix' && <span className="ml-1">{unit}</span>}
        </div>
        {label && <div className="text-body-small leading-body-small text-muted-foreground">{label}</div>}
      </div>
    );
  },
);

Metric.displayName = 'Metric';
````

**Acceptance**:

- [ ] 3 size variants working
- [ ] Label support
- [ ] Unit prefix/suffix
- [ ] Tabular nums for alignment
- [ ] Color variants

### Task 3.5: Component Exports & Documentation (2 hours)

**Goal**: Export all components and create usage documentation

**File**: `packages/ui/src/components/typography/index.ts`

```typescript
export { Heading, type HeadingProps } from './heading';
export { Text, type TextProps } from './text';
export { Code, type CodeProps } from './code';
export { Metric, type MetricProps } from './metric';
```

**File**: `packages/ui/src/components/index.ts` (add exports)

```typescript
// Existing exports...
export * from './typography';
```

**Documentation**: `packages/ui/docs/typography.md`

```markdown
# Typography Components

Semantic typography components using Atlassian-inspired design tokens.

## Components

### Heading

6 semantic levels (display, large, medium, small, xsmall, xxsmall)

### Text

Body text with 3 sizes (large, default, small)

### Code

Inline and block code snippets

### Metric

Numeric data displays with labels and units

## Usage Examples

[Include comprehensive examples from components]

## Vietnamese Support

All components support Vietnamese diacritics with optimized line-heights.

## Accessibility

- Semantic HTML elements
- WCAG 2.1 AA contrast ratios
- Screen reader compatible
```

**Acceptance**:

- [ ] All components exported from @workspace/ui
- [ ] Documentation complete with examples
- [ ] Storybook stories (if applicable)

## Acceptance Criteria

- [ ] Heading component with 6 levels (display → xxsmall)
- [ ] Text component with 3 sizes and 7 colors
- [ ] Code component (inline + block variants)
- [ ] Metric component with label/unit support
- [ ] All components use design tokens (no hardcoded values)
- [ ] Full TypeScript types with JSDoc
- [ ] Unit tests passing (20+ tests total)
- [ ] Vietnamese characters render correctly in all components
- [ ] Accessibility features (semantic HTML, ARIA where needed)
- [ ] Dark mode compatible

## Risks

**Risk**: CVA bundle size increase
**Mitigation**: CVA is already a dependency, minimal impact

**Risk**: Breaking changes to existing Button/Input styling
**Mitigation**: Components are additive, no existing changes

**Risk**: Developers continue using raw Tailwind classes
**Mitigation**: Documentation, migration guide, linting rules

## Deliverables

1. `packages/ui/src/components/typography/heading.tsx`
2. `packages/ui/src/components/typography/text.tsx`
3. `packages/ui/src/components/typography/code.tsx`
4. `packages/ui/src/components/typography/metric.tsx`
5. `packages/ui/src/components/typography/index.ts`
6. `packages/ui/docs/typography.md`
7. Unit tests (20+ test cases)

## Next Phase

Phase 04: Migration & Documentation - Migrate existing code, write migration guide, update design system docs
