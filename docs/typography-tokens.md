# Typography Design Tokens

**Version**: 1.0.0
**Date**: 2025-11-12
**For**: Beqeek Typography System - Phase 2 Implementation

## Token Architecture

### Naming Convention

Format: `--font-{category}-{element}-{property}-{variant?}`

**Categories**:

- `heading` - Heading elements (h1-h6)
- `body` - Body text
- `code` - Monospace/code text
- `metric` - Numeric displays

**Properties**:

- `size` - Font size (rem)
- `line-height` - Line height (rem or unitless)
- `weight` - Font weight (100-900)
- `family` - Font family stack

**Variants** (optional):

- Size variants: `large`, `medium`, `small`
- Language variants: `vi` (Vietnamese)
- Responsive variants: `mobile`, `tablet`, `desktop`

## Core Token Definitions

### Font Families

```css
:root {
  /* Primary font (currently Inter, not Geist Sans) */
  --font-family-sans: Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

  /* Monospace font */
  --font-family-mono: Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;

  /* Aliases for semantic usage */
  --font-family-heading: var(--font-family-sans);
  --font-family-body: var(--font-family-sans);
  --font-family-code: var(--font-family-mono);
}
```

### Font Weights

```css
:root {
  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
}
```

## Heading Tokens

### H1 (Display)

```css
:root {
  --font-heading-h1-size: 2.25rem; /* 36px */
  --font-heading-h1-line-height: 2.7rem; /* 43.2px, ratio 1.2 */
  --font-heading-h1-weight: 700;
  --font-heading-h1-family: var(--font-family-heading);
  --font-heading-h1-letter-spacing: -0.025em;
}

/* Vietnamese optimizations */
:root[lang='vi'] {
  --font-heading-h1-line-height: 3rem; /* 48px, ratio 1.33 (+11%) */
  --font-heading-h1-weight: 600; /* Lighter for diacritics */
  --font-heading-h1-letter-spacing: 0em; /* Normal spacing */
}

/* Responsive - Desktop (1024px+) */
@media (min-width: 1024px) {
  :root {
    --font-heading-h1-size: 2.5rem; /* 40px (+10%) */
  }
}

/* Responsive - Large Desktop (1280px+) */
@media (min-width: 1280px) {
  :root {
    --font-heading-h1-size: 2.625rem; /* 42px (+15%) */
  }
}
```

### H2 (XXLarge)

```css
:root {
  --font-heading-h2-size: 1.875rem; /* 30px */
  --font-heading-h2-line-height: 2.375rem; /* 38px, ratio 1.27 */
  --font-heading-h2-weight: 700;
  --font-heading-h2-family: var(--font-family-heading);
  --font-heading-h2-letter-spacing: -0.025em;
}

:root[lang='vi'] {
  --font-heading-h2-line-height: 2.625rem; /* 42px, ratio 1.4 (+10%) */
  --font-heading-h2-weight: 600;
  --font-heading-h2-letter-spacing: 0em;
}

@media (min-width: 1024px) {
  :root {
    --font-heading-h2-size: 2.0625rem; /* 33px (+10%) */
  }
}

@media (min-width: 1280px) {
  :root {
    --font-heading-h2-size: 2.15625rem; /* 34.5px (+15%) */
  }
}
```

### H3 (XLarge)

```css
:root {
  --font-heading-h3-size: 1.5rem; /* 24px */
  --font-heading-h3-line-height: 2rem; /* 32px, ratio 1.33 */
  --font-heading-h3-weight: 600;
  --font-heading-h3-family: var(--font-family-heading);
  --font-heading-h3-letter-spacing: -0.025em;
}

:root[lang='vi'] {
  --font-heading-h3-line-height: 2.1rem; /* 33.6px, ratio 1.4 (+5%) */
  --font-heading-h3-weight: 600; /* Same */
  --font-heading-h3-letter-spacing: 0em;
}

@media (min-width: 1024px) {
  :root {
    --font-heading-h3-size: 1.65rem; /* 26.4px (+10%) */
  }
}
```

### H4 (Large)

```css
:root {
  --font-heading-h4-size: 1.25rem; /* 20px */
  --font-heading-h4-line-height: 1.75rem; /* 28px, ratio 1.4 */
  --font-heading-h4-weight: 600;
  --font-heading-h4-family: var(--font-family-heading);
  --font-heading-h4-letter-spacing: 0em;
}

:root[lang='vi'] {
  --font-heading-h4-line-height: 1.875rem; /* 30px, ratio 1.5 (+7%) */
}
```

### H5 (Medium)

```css
:root {
  --font-heading-h5-size: 1.125rem; /* 18px */
  --font-heading-h5-line-height: 1.625rem; /* 26px, ratio 1.44 */
  --font-heading-h5-weight: 600;
  --font-heading-h5-family: var(--font-family-heading);
  --font-heading-h5-letter-spacing: 0em;
}

:root[lang='vi'] {
  --font-heading-h5-line-height: 1.75rem; /* 28px, ratio 1.56 (+8%) */
}
```

### H6 (Small)

```css
:root {
  --font-heading-h6-size: 1rem; /* 16px */
  --font-heading-h6-line-height: 1.5rem; /* 24px, ratio 1.5 */
  --font-heading-h6-weight: 600;
  --font-heading-h6-family: var(--font-family-heading);
  --font-heading-h6-letter-spacing: 0em;
}

:root[lang='vi'] {
  --font-heading-h6-line-height: 1.625rem; /* 26px, ratio 1.625 (+8%) */
}
```

## Body Text Tokens

### Large Body Text

```css
:root {
  --font-body-large-size: 1rem; /* 16px */
  --font-body-large-line-height: 1.5rem; /* 24px, ratio 1.5 */
  --font-body-large-weight: 400;
  --font-body-large-family: var(--font-family-body);
  --font-body-large-letter-spacing: 0em;
}

:root[lang='vi'] {
  --font-body-large-line-height: 1.625rem; /* 26px, ratio 1.625 (+8%) */
}
```

### Default Body Text

```css
:root {
  --font-body-default-size: 0.875rem; /* 14px */
  --font-body-default-line-height: 1.25rem; /* 20px, ratio 1.43 */
  --font-body-default-weight: 400;
  --font-body-default-family: var(--font-family-body);
  --font-body-default-letter-spacing: 0em;
}

:root[lang='vi'] {
  --font-body-default-line-height: 1.375rem; /* 22px, ratio 1.57 (+10%) */
}
```

### Small Body Text

```css
:root {
  --font-body-small-size: 0.75rem; /* 12px */
  --font-body-small-line-height: 1rem; /* 16px, ratio 1.33 */
  --font-body-small-weight: 400;
  --font-body-small-family: var(--font-family-body);
  --font-body-small-letter-spacing: 0em;
}

:root[lang='vi'] {
  --font-body-small-line-height: 1.125rem; /* 18px, ratio 1.5 (+13%) */
}
```

## Code Tokens

### Inline Code

```css
:root {
  --font-code-inline-size: 0.875em; /* 87.5% of parent */
  --font-code-inline-line-height: 1; /* Unitless, inherits parent */
  --font-code-inline-weight: 400;
  --font-code-inline-family: var(--font-family-code);
  --font-code-inline-letter-spacing: 0em;
}
```

### Block Code

```css
:root {
  --font-code-block-size: 0.875rem; /* 14px */
  --font-code-block-line-height: 1.5; /* Unitless, 21px */
  --font-code-block-weight: 400;
  --font-code-block-family: var(--font-family-code);
  --font-code-block-letter-spacing: 0em;
}
```

## Metric Tokens

### Large Metrics

```css
:root {
  --font-metric-large-size: 2rem; /* 32px */
  --font-metric-large-line-height: 2.4rem; /* 38.4px, ratio 1.2 */
  --font-metric-large-weight: 600;
  --font-metric-large-family: var(--font-family-sans);
  --font-metric-large-letter-spacing: -0.025em;
}

:root[lang='vi'] {
  --font-metric-large-line-height: 2.6rem; /* 41.6px, ratio 1.3 (+8%) */
  --font-metric-large-letter-spacing: 0em;
}
```

### Medium Metrics

```css
:root {
  --font-metric-medium-size: 1.5rem; /* 24px */
  --font-metric-medium-line-height: 1.875rem; /* 30px, ratio 1.25 */
  --font-metric-medium-weight: 600;
  --font-metric-medium-family: var(--font-family-sans);
  --font-metric-medium-letter-spacing: -0.025em;
}

:root[lang='vi'] {
  --font-metric-medium-line-height: 2.025rem; /* 32.4px, ratio 1.35 (+8%) */
  --font-metric-medium-letter-spacing: 0em;
}
```

### Small Metrics

```css
:root {
  --font-metric-small-size: 1.25rem; /* 20px */
  --font-metric-small-line-height: 1.625rem; /* 26px, ratio 1.3 */
  --font-metric-small-weight: 600;
  --font-metric-small-family: var(--font-family-sans);
  --font-metric-small-letter-spacing: 0em;
}

:root[lang='vi'] {
  --font-metric-small-line-height: 1.75rem; /* 28px, ratio 1.4 (+8%) */
}
```

## Semantic Aliases

These tokens provide semantic names for common use cases:

```css
:root {
  /* Page structure */
  --font-page-title-size: var(--font-heading-h1-size);
  --font-page-title-line-height: var(--font-heading-h1-line-height);
  --font-page-title-weight: var(--font-heading-h1-weight);

  --font-section-title-size: var(--font-heading-h2-size);
  --font-section-title-line-height: var(--font-heading-h2-line-height);
  --font-section-title-weight: var(--font-heading-h2-weight);

  /* Components */
  --font-card-title-size: var(--font-heading-h3-size);
  --font-card-title-line-height: var(--font-heading-h3-line-height);
  --font-card-title-weight: var(--font-heading-h3-weight);

  --font-dialog-title-size: var(--font-heading-h4-size);
  --font-dialog-title-line-height: var(--font-heading-h4-line-height);
  --font-dialog-title-weight: var(--font-heading-h4-weight);

  /* UI elements */
  --font-button-size: var(--font-body-default-size);
  --font-button-line-height: var(--font-body-default-line-height);
  --font-button-weight: var(--font-weight-medium);

  --font-label-size: var(--font-body-default-size);
  --font-label-line-height: var(--font-body-default-line-height);
  --font-label-weight: var(--font-weight-medium);

  --font-caption-size: var(--font-body-small-size);
  --font-caption-line-height: var(--font-body-small-line-height);
  --font-caption-weight: var(--font-weight-regular);
}
```

## TailwindCSS v4 Integration

Map design tokens to Tailwind theme:

```css
/* In packages/ui/src/styles/globals.css */

@theme {
  /* Font families */
  --font-sans: var(--font-family-sans);
  --font-mono: var(--font-family-mono);

  /* Font sizes - Map to Tailwind text-* utilities */
  --font-size-h1: var(--font-heading-h1-size);
  --font-size-h2: var(--font-heading-h2-size);
  --font-size-h3: var(--font-heading-h3-size);
  --font-size-h4: var(--font-heading-h4-size);
  --font-size-h5: var(--font-heading-h5-size);
  --font-size-h6: var(--font-heading-h6-size);

  --font-size-body-lg: var(--font-body-large-size);
  --font-size-body: var(--font-body-default-size);
  --font-size-body-sm: var(--font-body-small-size);

  --font-size-code: var(--font-code-block-size);

  --font-size-metric-lg: var(--font-metric-large-size);
  --font-size-metric-md: var(--font-metric-medium-size);
  --font-size-metric-sm: var(--font-metric-small-size);

  /* Font weights */
  --font-weight-normal: var(--font-weight-regular);
  --font-weight-medium: var(--font-weight-medium);
  --font-weight-semibold: var(--font-weight-semibold);
  --font-weight-bold: var(--font-weight-bold);

  /* Line heights */
  --line-height-h1: var(--font-heading-h1-line-height);
  --line-height-h2: var(--font-heading-h2-line-height);
  --line-height-h3: var(--font-heading-h3-line-height);
  --line-height-h4: var(--font-heading-h4-line-height);
  --line-height-h5: var(--font-heading-h5-line-height);
  --line-height-h6: var(--font-heading-h6-line-height);

  --line-height-body-lg: var(--font-body-large-line-height);
  --line-height-body: var(--font-body-default-line-height);
  --line-height-body-sm: var(--font-body-small-line-height);
}
```

## Usage in Components

### CSS Classes (Direct Token Usage)

```css
/* Component-specific typography */
.page-title {
  font-size: var(--font-heading-h1-size);
  line-height: var(--font-heading-h1-line-height);
  font-weight: var(--font-heading-h1-weight);
  font-family: var(--font-heading-h1-family);
  letter-spacing: var(--font-heading-h1-letter-spacing);
}

.card-title {
  font-size: var(--font-card-title-size);
  line-height: var(--font-card-title-line-height);
  font-weight: var(--font-card-title-weight);
}

.body-text {
  font-size: var(--font-body-default-size);
  line-height: var(--font-body-default-line-height);
  font-weight: var(--font-body-default-weight);
}
```

### React Components (TypeScript)

```tsx
// Export token values for TypeScript usage
export const typographyTokens = {
  heading: {
    h1: {
      size: 'var(--font-heading-h1-size)',
      lineHeight: 'var(--font-heading-h1-line-height)',
      weight: 'var(--font-heading-h1-weight)',
    },
    // ... other levels
  },
  body: {
    large: {
      size: 'var(--font-body-large-size)',
      lineHeight: 'var(--font-body-large-line-height)',
      weight: 'var(--font-body-large-weight)',
    },
    default: {
      size: 'var(--font-body-default-size)',
      lineHeight: 'var(--font-body-default-line-height)',
      weight: 'var(--font-body-default-weight)',
    },
    small: {
      size: 'var(--font-body-small-size)',
      lineHeight: 'var(--font-body-small-line-height)',
      weight: 'var(--font-body-small-weight)',
    },
  },
} as const;
```

## Migration Strategy

### Phase 1: Add Tokens (Non-Breaking)

1. Add all token definitions to `packages/ui/src/styles/globals.css`
2. Add TailwindCSS theme mappings
3. No component changes yet

### Phase 2: Component Implementation

1. Create `<Heading>`, `<Text>`, `<Code>`, `<Metric>` components using tokens
2. Export components from `@workspace/ui`
3. Add TypeScript types

### Phase 3: Gradual Adoption

1. New components use new system
2. Migrate high-traffic pages incrementally
3. Old Tailwind utilities still work

### Phase 4: Deprecation

1. Add ESLint rules discouraging direct Tailwind text utilities
2. Create codemod for automated migration
3. Remove deprecated Tailwind utilities

## Testing Tokens

### Visual Regression Tests

```tsx
// Test all heading levels
describe('Typography Tokens', () => {
  test('heading tokens render correctly', () => {
    const styles = getComputedStyle(document.documentElement);

    expect(styles.getPropertyValue('--font-heading-h1-size')).toBe('2.25rem');
    expect(styles.getPropertyValue('--font-heading-h1-line-height')).toBe('2.7rem');
  });

  test('Vietnamese tokens apply when lang="vi"', () => {
    document.documentElement.lang = 'vi';
    const styles = getComputedStyle(document.documentElement);

    expect(styles.getPropertyValue('--font-heading-h1-line-height')).toBe('3rem');
    expect(styles.getPropertyValue('--font-heading-h1-weight')).toBe('600');
  });
});
```

### Accessibility Tests

```tsx
test('font sizes meet minimum requirements', () => {
  const styles = getComputedStyle(document.documentElement);

  // Body text minimum 14px
  const bodySize = parseFloat(styles.getPropertyValue('--font-body-default-size'));
  expect(bodySize).toBeGreaterThanOrEqual(0.875); // 14px

  // Small text minimum 12px
  const smallSize = parseFloat(styles.getPropertyValue('--font-body-small-size'));
  expect(smallSize).toBeGreaterThanOrEqual(0.75); // 12px
});
```

## Documentation

### Token Reference Sheet

Create a visual reference in Storybook or documentation site showing:

- All heading levels with sample text
- Body text variations
- Code samples
- Metric displays
- Side-by-side English/Vietnamese examples

### Developer Guide

Provide clear guidance on:

- When to use each token
- How to add new variants
- How to test token changes
- How to handle responsive typography

## Summary

**Total Tokens Defined**: 90+

**Categories**:

- Heading tokens: 30 (6 levels × 5 properties)
- Body tokens: 15 (3 sizes × 5 properties)
- Code tokens: 10 (2 types × 5 properties)
- Metric tokens: 15 (3 sizes × 5 properties)
- Semantic aliases: 20+

**Vietnamese Support**: All tokens include `:root[lang="vi"]` overrides

**Responsive**: H1-H3 scale up at 1024px and 1280px breakpoints

**TailwindCSS Integration**: Full theme mapping for utility class usage

---

**Next Steps**: Implement these tokens in `packages/ui/src/styles/globals.css` (Phase 2)
