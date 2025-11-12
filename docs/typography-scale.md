# Beqeek Typography Scale

**Version**: 1.0.0
**Date**: 2025-11-12
**Based on**: Atlassian Design System + Current Beqeek Usage

## Overview

This document defines the typography scale for Beqeek, adapted from Atlassian's design system with optimizations for Vietnamese language support.

## Font Stack

### Sans-serif (Primary)

```css
--font-sans: Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

**Current Implementation**: Uses Inter font (not Geist Sans as mentioned in docs)
**Vietnamese Support**: ✅ Full support for all 134 Vietnamese characters

### Monospace (Code)

```css
--font-mono: Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
```

**Vietnamese Support**: ✅ Full support

## Typography Scale Definition

### Heading Scale

Based on Atlassian system with adjustments for Beqeek's needs:

| Level | Semantic | Size (rem) | Size (px) | Weight | Line Height     | Usage                      |
| ----- | -------- | ---------- | --------- | ------ | --------------- | -------------------------- |
| `h1`  | Display  | 2.25       | 36        | 600    | 1.2 (2.7rem)    | Page titles, hero sections |
| `h2`  | XXLarge  | 1.875      | 30        | 600    | 1.25 (2.375rem) | Section titles             |
| `h3`  | XLarge   | 1.5        | 24        | 600    | 1.33 (2rem)     | Subsection titles          |
| `h4`  | Large    | 1.25       | 20        | 600    | 1.4 (1.75rem)   | Card titles, dialog titles |
| `h5`  | Medium   | 1.125      | 18        | 600    | 1.44 (1.625rem) | List headers               |
| `h6`  | Small    | 1          | 16        | 600    | 1.5 (1.5rem)    | Minor headings             |

**Vietnamese Optimization**: Weight 600 (semibold) preferred over 700 (bold) for better readability with Vietnamese diacritics.

### Body Text Scale

| Size    | Size (rem) | Size (px) | Weight | Line Height    | Usage                       |
| ------- | ---------- | --------- | ------ | -------------- | --------------------------- |
| Large   | 1          | 16        | 400    | 1.5 (1.5rem)   | Emphasized body text, leads |
| Default | 0.875      | 14        | 400    | 1.43 (1.25rem) | Standard body text          |
| Small   | 0.75       | 12        | 400    | 1.33 (1rem)    | Captions, labels, metadata  |

**Current Usage Analysis**:

- Most components use `text-sm` (14px) as default
- Large text (`text-base` 16px) used sparingly
- Small text (`text-xs` 12px) for labels and metadata

### Code Text

| Type   | Size            | Weight | Line Height | Font Family |
| ------ | --------------- | ------ | ----------- | ----------- |
| Inline | 0.875em         | 400    | 1           | Monospace   |
| Block  | 0.875rem (14px) | 400    | 1.5         | Monospace   |

**Usage**: Code snippets, technical values, JSON data

### Metric Text (Numeric Display)

| Size   | Size (rem) | Size (px) | Weight | Line Height     | Usage          |
| ------ | ---------- | --------- | ------ | --------------- | -------------- |
| Large  | 2          | 32        | 600    | 1.2 (2.4rem)    | Dashboard KPIs |
| Medium | 1.5        | 24        | 600    | 1.25 (1.875rem) | Card metrics   |
| Small  | 1.25       | 20        | 600    | 1.3 (1.625rem)  | Inline metrics |

**Current Usage**: Dashboard uses `text-2xl font-bold` (24px/700) for metrics - will migrate to Medium/600

## Font Weights

| Name     | Value | Token                    | Usage                           |
| -------- | ----- | ------------------------ | ------------------------------- |
| Regular  | 400   | `--font-weight-regular`  | Body text, descriptions         |
| Medium   | 500   | `--font-weight-medium`   | Emphasized text, labels         |
| Semibold | 600   | `--font-weight-semibold` | Headings, buttons               |
| Bold     | 700   | `--font-weight-bold`     | Strong emphasis (use sparingly) |

**Note**: Prefer 600 over 700 for Vietnamese text headings.

## Vietnamese Language Optimizations

### Line Height Adjustments

Vietnamese text with diacritics requires additional vertical space:

| Context   | English | Vietnamese | Adjustment |
| --------- | ------- | ---------- | ---------- |
| Headings  | 1.2-1.4 | 1.3-1.5    | +0.1       |
| Body Text | 1.43    | 1.5-1.625  | +0.07-0.19 |
| Dense UI  | 1.33    | 1.43       | +0.1       |

**Implementation**: Apply via `:root[lang="vi"]` selector or component props.

### Font Weight

Vietnamese diacritics appear heavier than Latin base characters:

- **Headings**: Use 600 (semibold) instead of 700 (bold)
- **Body**: Use 400 (regular) - no change needed
- **Emphasis**: Use 500 (medium) instead of 600

### Letter Spacing

Vietnamese text benefits from slightly increased tracking:

- **Headings**: `tracking-tight` (-0.025em) → `tracking-normal` (0)
- **Body**: `tracking-normal` (0) - no change
- **All caps**: `tracking-wide` (0.025em) → `tracking-wider` (0.05em)

## Responsive Typography

### Breakpoints

Typography scales at these breakpoints:

| Breakpoint | Min Width | Adjustments         |
| ---------- | --------- | ------------------- |
| Mobile     | 0px       | Base scale (100%)   |
| Tablet     | 768px     | +0% (no change)     |
| Desktop    | 1024px    | +10% for h1-h3 only |
| Large      | 1280px    | +15% for h1-h2 only |

### Responsive Heading Scale

| Level | Mobile    | Tablet    | Desktop (1024px+) | Large (1280px+) |
| ----- | --------- | --------- | ----------------- | --------------- |
| h1    | 36px      | 36px      | 40px (+10%)       | 42px (+15%)     |
| h2    | 30px      | 30px      | 33px (+10%)       | 35px (+15%)     |
| h3    | 24px      | 24px      | 26px (+10%)       | 26px            |
| h4-h6 | No change | No change | No change         | No change       |

**Implementation**: Use `@media (min-width: 1024px)` and `(min-width: 1280px)`

## Current State Analysis

### Font Usage Audit (62 files)

**Typography Classes Found**:

- `text-xs` (12px): Metadata, labels
- `text-sm` (14px): Default body text (most common)
- `text-base` (16px): Large body text
- `text-lg` (18px): Subheadings
- `text-xl` (20px): Card titles, dialog titles
- `text-2xl` (24px): Metrics, section titles
- `text-3xl` (30px): Page titles
- `text-4xl` (36px): Hero text (login page)

**Font Weights Found** (53 files):

- `font-normal` (400): Body text
- `font-medium` (500): Rare usage
- `font-semibold` (600): Subheadings
- `font-bold` (700): Headings, metrics

**Line Height Usage**: Only 7 files use custom line heights (most rely on Tailwind defaults)

**Letter Spacing**: 14 usages, mostly `tracking-tight` and `tracking-wide`

### Issues Identified

❌ **Inconsistent heading styles**: Same text size with different weights across components
❌ **No semantic structure**: No `<h1>-<h6>` hierarchy enforcement
❌ **No design tokens**: All typography uses Tailwind utility classes directly
❌ **Vietnamese not optimized**: No lang-specific line height adjustments
❌ **Font config mismatch**: Uses Inter but docs mention Geist Sans
❌ **No responsive scaling**: Fixed sizes across all breakpoints

### High-Priority Migration Targets

Based on usage frequency:

1. **Page titles** (text-3xl font-bold) → `<Heading level={1}>`
2. **Section titles** (text-2xl font-bold) → `<Heading level={2}>`
3. **Card titles** (text-xl font-semibold) → `<Heading level={3}>`
4. **Metrics** (text-2xl font-bold) → `<Metric size="medium">`
5. **Body text** (text-sm) → `<Text>` (default)
6. **Labels** (text-xs) → `<Text size="small">`

## Component API Specification

### Heading Component

```tsx
interface HeadingProps {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div' | 'span';
  children: React.ReactNode;
  className?: string;
}

// Usage
<Heading level={1}>Page Title</Heading>
<Heading level={2} as="h1">SEO H1 but styled as H2</Heading>
```

### Text Component

```tsx
interface TextProps {
  size?: 'large' | 'default' | 'small';
  weight?: 'regular' | 'medium' | 'semibold' | 'bold';
  color?: 'default' | 'muted' | 'primary' | 'secondary' | 'destructive' | 'success' | 'warning';
  as?: 'p' | 'span' | 'div';
  children: React.ReactNode;
  className?: string;
}

// Usage
<Text>Default body text</Text>
<Text size="small" color="muted">Helper text</Text>
<Text weight="semibold">Emphasized text</Text>
```

### Code Component

```tsx
interface CodeProps {
  inline?: boolean;
  children: React.ReactNode;
  className?: string;
}

// Usage
<Code inline>const example = true;</Code>
<Code>{`
function example() {
  return true;
}
`}</Code>
```

### Metric Component

```tsx
interface MetricProps {
  size?: 'large' | 'medium' | 'small';
  value: string | number;
  label?: string;
  className?: string;
}

// Usage
<Metric size="large" value={1234} label="Total Users" />
<Metric value="99.9%" label="Uptime" />
```

## Design Tokens Mapping

### Token Structure

Format: `--font-{category}-{property}-{variant}`

```css
/* Heading tokens */
--font-heading-h1-size: 2.25rem;
--font-heading-h1-line-height: 2.7rem;
--font-heading-h1-weight: 600;

--font-heading-h2-size: 1.875rem;
--font-heading-h2-line-height: 2.375rem;
--font-heading-h2-weight: 600;

/* Body tokens */
--font-body-default-size: 0.875rem;
--font-body-default-line-height: 1.25rem;
--font-body-default-weight: 400;

--font-body-large-size: 1rem;
--font-body-large-line-height: 1.5rem;
--font-body-large-weight: 400;

--font-body-small-size: 0.75rem;
--font-body-small-line-height: 1rem;
--font-body-small-weight: 400;

/* Code tokens */
--font-code-size: 0.875rem;
--font-code-line-height: 1.5;
--font-code-weight: 400;

/* Metric tokens */
--font-metric-large-size: 2rem;
--font-metric-large-line-height: 2.4rem;
--font-metric-large-weight: 600;

/* Vietnamese overrides (applied when :root[lang="vi"]) */
--font-heading-h1-line-height-vi: 3rem; /* +0.3rem */
--font-heading-h2-line-height-vi: 2.625rem; /* +0.25rem */
--font-body-default-line-height-vi: 1.375rem; /* +0.125rem */
```

### TailwindCSS v4 Integration

```css
@theme {
  /* Typography scale */
  --font-size-h1: var(--font-heading-h1-size);
  --font-size-h2: var(--font-heading-h2-size);
  --font-size-h3: var(--font-heading-h3-size);
  --font-size-h4: var(--font-heading-h4-size);
  --font-size-h5: var(--font-heading-h5-size);
  --font-size-h6: var(--font-heading-h6-size);

  --font-size-body-lg: var(--font-body-large-size);
  --font-size-body: var(--font-body-default-size);
  --font-size-body-sm: var(--font-body-small-size);
}
```

## Testing Checklist

### Visual Regression Tests

- [ ] All heading levels render correctly
- [ ] Vietnamese diacritics don't clip
- [ ] Line heights accommodate descenders/ascenders
- [ ] Font weights render consistently across browsers
- [ ] Dark mode text remains readable

### Accessibility Tests

- [ ] Heading hierarchy is semantic (`<h1>` → `<h6>`)
- [ ] Contrast ratios meet WCAG 2.1 AA (4.5:1 for body, 3:1 for large)
- [ ] Text is resizable up to 200% without breaking layout
- [ ] Line length doesn't exceed 80 characters (optimal readability)

### Vietnamese Language Tests

- [ ] All 134 Vietnamese characters render correctly
- [ ] Diacritics don't overlap with text above/below
- [ ] Increased line height applied when lang="vi"
- [ ] Font weight 600 used for Vietnamese headings
- [ ] Long Vietnamese words wrap correctly

### Performance Tests

- [ ] Font loading doesn't block rendering (font-display: swap)
- [ ] No FOIT (Flash of Invisible Text)
- [ ] Font files are subset for Vietnamese + Latin only
- [ ] Total font payload < 100KB

## Migration Strategy

### Phase 1: Design Token Setup (Current)

- Define all CSS custom properties
- Add Vietnamese overrides
- Update globals.css

### Phase 2: Component Implementation

- Build `<Heading>`, `<Text>`, `<Code>`, `<Metric>` components
- Add TypeScript types
- Write unit tests

### Phase 3: Gradual Migration

- Start with high-traffic pages (dashboard, login)
- Migrate one feature at a time
- Keep old and new systems side-by-side

### Phase 4: Cleanup

- Remove Tailwind typography utilities
- Add ESLint rules to enforce component usage
- Update documentation

## References

- Atlassian Typography: https://atlassian.design/foundations/typography
- Vietnamese Typography Guide: https://vietnamesetypography.com/
- WCAG 2.1 Text: https://www.w3.org/WAI/WCAG21/quickref/#text
- TailwindCSS v4 Theme: https://tailwindcss.com/docs/theme

---

**Next Steps**: Proceed to Phase 2 - Design Token System Implementation
