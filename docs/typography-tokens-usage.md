# Typography Tokens Usage Guide

**Version**: 1.0.0
**Date**: 2025-11-12
**Status**: Active (Phase 2 Complete)

## Overview

This guide provides practical instructions for using the typography design tokens implemented in Phase 2 of the typography component rebuild.

## What's Been Implemented

✅ **90+ CSS Custom Properties** - Complete typography token system
✅ **Vietnamese Optimization** - `:root[lang="vi"]` overrides for line-height and weight
✅ **Responsive Scaling** - H1-H3 scale up at 1024px and 1280px breakpoints
✅ **TailwindCSS v4 Integration** - All tokens mapped to Tailwind theme
✅ **Dark Mode Support** - Typography inherits from existing color tokens
✅ **Test Suite** - Comprehensive Vietnamese character testing HTML

## Token Categories

### 1. Font Families

```css
--font-family-sans:
  Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif --font-family-mono: Menlo, Monaco,
  Consolas, 'Liberation Mono', 'Courier New',
  monospace --font-family-heading: var(--font-family-sans) --font-family-body: var(--font-family-sans)
    --font-family-code: var(--font-family-mono);
```

### 2. Font Weights

```css
--font-weight-regular: 400 --font-weight-medium: 500 --font-weight-semibold: 600 --font-weight-bold: 700;
```

### 3. Heading Tokens (H1-H6)

Each heading level has 5 properties:

```css
--font-heading-h1-size: 2.25rem /* Font size */ --font-heading-h1-line-height: 2.7rem /* Line height */
  --font-heading-h1-weight: 700 /* Font weight */ --font-heading-h1-family: var(...) /* Font family */
  --font-heading-h1-letter-spacing: -0.025em /* Letter spacing */;
```

**Available levels**: `h1`, `h2`, `h3`, `h4`, `h5`, `h6`

### 4. Body Text Tokens

Three sizes: `large`, `default`, `small`

```css
--font-body-default-size: 0.875rem --font-body-default-line-height: 1.25rem --font-body-default-weight: 400
  --font-body-default-family: var(...) --font-body-default-letter-spacing: 0em;
```

### 5. Code Tokens

Two types: `inline`, `block`

```css
--font-code-block-size: 0.875rem --font-code-block-line-height: 1.5 --font-code-block-weight: 400
  --font-code-block-family: var(...) --font-code-block-letter-spacing: 0em;
```

### 6. Metric Tokens

Three sizes: `large`, `medium`, `small`

```css
--font-metric-medium-size: 1.5rem --font-metric-medium-line-height: 1.875rem --font-metric-medium-weight: 600
  --font-metric-medium-family: var(...) --font-metric-medium-letter-spacing: -0.025em;
```

### 7. Semantic Aliases

Convenient shortcuts for common use cases:

```css
--font-page-title-size: var(--font-heading-h1-size) --font-section-title-size: var(--font-heading-h2-size)
  --font-card-title-size: var(--font-heading-h3-size) --font-dialog-title-size: var(--font-heading-h4-size)
  --font-button-size: var(--font-body-default-size) --font-label-size: var(--font-body-default-size)
  --font-caption-size: var(--font-body-small-size);
```

## Usage Examples

### Direct CSS Usage

```css
.page-title {
  font-size: var(--font-heading-h1-size);
  line-height: var(--font-heading-h1-line-height);
  font-weight: var(--font-heading-h1-weight);
  letter-spacing: var(--font-heading-h1-letter-spacing);
  font-family: var(--font-heading-h1-family);
}

/* Or use semantic aliases */
.page-title {
  font-size: var(--font-page-title-size);
  line-height: var(--font-page-title-line-height);
  font-weight: var(--font-page-title-weight);
}
```

### With TailwindCSS (Phase 3)

After Phase 3 component implementation:

```tsx
// Current (legacy - will be replaced)
<h1 className="text-3xl font-bold">Page Title</h1>

// New (using tokens via components - Phase 3)
<Heading level={1}>Page Title</Heading>
```

### Vietnamese Language Support

The system automatically applies Vietnamese optimizations when `lang="vi"`:

```html
<!-- In index.html or dynamically set -->
<html lang="vi">
  <body>
    <h1>Quản lý công việc</h1>
    <!-- Automatically gets:
         - Increased line-height (3rem vs 2.7rem)
         - Reduced font-weight (600 vs 700)
         - Normal letter-spacing (0em vs -0.025em)
    -->
  </body>
</html>
```

### Responsive Typography

Typography scales automatically at breakpoints:

```css
/* Mobile/Tablet (0-1023px): Base scale */
h1 {
  font-size: 2.25rem;
} /* 36px */

/* Desktop (1024px-1279px): +10% for h1-h3 */
@media (min-width: 1024px) {
  h1 {
    font-size: 2.5rem;
  } /* 40px */
}

/* Large Desktop (1280px+): +15% for h1-h2 */
@media (min-width: 1280px) {
  h1 {
    font-size: 2.625rem;
  } /* 42px */
}
```

**No manual breakpoints needed** - tokens handle this automatically!

## Testing

### Visual Test Suite

Open the test suite in a browser:

```bash
open packages/ui/src/__tests__/vietnamese-typography.test.html
```

**Test Coverage**:

- ✅ All 134 Vietnamese characters
- ✅ Diacritic clipping prevention
- ✅ Real-world content examples
- ✅ Line height comparison (English vs Vietnamese)
- ✅ Font weight comparison (700 vs 600)
- ✅ Responsive typography (resize browser to test)
- ✅ Dark mode toggle

### Browser DevTools Inspection

```javascript
// Check if tokens are loaded
const styles = getComputedStyle(document.documentElement);

console.log('H1 Size:', styles.getPropertyValue('--font-heading-h1-size'));
console.log('H1 Line Height:', styles.getPropertyValue('--font-heading-h1-line-height'));
console.log('H1 Weight:', styles.getPropertyValue('--font-heading-h1-weight'));

// Check Vietnamese overrides
document.documentElement.lang = 'vi';
const viStyles = getComputedStyle(document.documentElement);
console.log('Vietnamese H1 Weight:', viStyles.getPropertyValue('--font-heading-h1-weight'));
```

### Verify in Production Build

```bash
pnpm --filter web build
pnpm --filter web preview
```

Then inspect the CSS output to confirm tokens are compiled correctly.

## Migration Path (Phase 4)

### Current State (Before Migration)

```tsx
// ❌ Old pattern - hardcoded Tailwind classes
<h1 className="text-3xl font-bold tracking-tight">
  Quản lý không gian làm việc
</h1>

<p className="text-2xl font-bold">1,234</p>

<span className="text-sm text-muted-foreground">Helper text</span>
```

### Future State (After Phase 3 Components)

```tsx
// ✅ New pattern - semantic components
<Heading level={1}>
  Quản lý không gian làm việc
</Heading>

<Metric size="medium" value={1234} label="Total Users" />

<Text size="small" color="muted">Helper text</Text>
```

### Gradual Migration Strategy

Phase 3 components will be **additive** (not breaking):

1. **New code**: Use new components
2. **Existing code**: Continue using Tailwind classes (works fine)
3. **High-priority pages**: Migrate incrementally (dashboard, login)
4. **Phase 4**: Add ESLint rules to encourage new pattern

**No forced migration** - old and new systems coexist!

## Common Patterns

### Page Title

```css
.page-title {
  font-size: var(--font-page-title-size);
  line-height: var(--font-page-title-line-height);
  font-weight: var(--font-page-title-weight);
}
```

### Section Heading

```css
.section-heading {
  font-size: var(--font-section-title-size);
  line-height: var(--font-section-title-line-height);
  font-weight: var(--font-section-title-weight);
}
```

### Card Title

```css
.card-title {
  font-size: var(--font-card-title-size);
  line-height: var(--font-card-title-line-height);
  font-weight: var(--font-card-title-weight);
}
```

### Dashboard Metric

```css
.metric-value {
  font-size: var(--font-metric-medium-size);
  line-height: var(--font-metric-medium-line-height);
  font-weight: var(--font-metric-medium-weight);
  letter-spacing: var(--font-metric-medium-letter-spacing);
}
```

### Button Text

```css
.button {
  font-size: var(--font-button-size);
  line-height: var(--font-button-line-height);
  font-weight: var(--font-button-weight);
}
```

### Label Text

```css
.form-label {
  font-size: var(--font-label-size);
  line-height: var(--font-label-line-height);
  font-weight: var(--font-label-weight);
}
```

### Caption/Helper Text

```css
.helper-text {
  font-size: var(--font-caption-size);
  line-height: var(--font-caption-line-height);
  font-weight: var(--font-caption-weight);
}
```

## Debugging Tips

### Token Not Applying?

1. **Check if token exists**:

   ```javascript
   getComputedStyle(document.documentElement).getPropertyValue('--font-heading-h1-size');
   ```

2. **Check CSS specificity** - Inline styles or !important may override
3. **Check browser DevTools** - Computed tab shows final values
4. **Clear cache** - Hard refresh (Cmd+Shift+R / Ctrl+Shift+F5)

### Vietnamese Optimization Not Working?

1. **Check `lang` attribute**:

   ```javascript
   document.documentElement.lang; // Should be 'vi'
   ```

2. **Set language programmatically**:

   ```javascript
   document.documentElement.lang = 'vi';
   ```

3. **Check `:root[lang="vi"]` specificity** - Should override default `:root`

### Responsive Scaling Not Working?

1. **Check viewport width**:

   ```javascript
   window.innerWidth; // Should be >= 1024px or >= 1280px
   ```

2. **Verify media query loading** - Check DevTools Sources tab
3. **Test in different browsers** - Some browsers cache media queries

## Best Practices

### DO ✅

- Use semantic token names (`--font-page-title-size`)
- Apply tokens via CSS custom properties
- Test with Vietnamese diacritics (ậ, ễ, ữ, etc.)
- Verify dark mode appearance
- Test responsive scaling at 1024px and 1280px
- Use `:root[lang="vi"]` for Vietnamese optimizations

### DON'T ❌

- Hardcode font sizes (`font-size: 24px`)
- Use Tailwind utilities directly in new components (use tokens)
- Ignore Vietnamese line-height requirements
- Mix token-based and hardcoded values
- Override tokens with inline styles (breaks theming)

## Performance Notes

- **CSS Custom Properties**: ~0.1ms lookup time (negligible)
- **No JavaScript required**: Pure CSS solution
- **Optimal caching**: Tokens defined once, referenced everywhere
- **Bundle size**: +2KB minified (90+ tokens)
- **Runtime overhead**: None (native browser feature)

## Browser Support

- ✅ Chrome/Edge 89+
- ✅ Firefox 96+
- ✅ Safari 15.4+
- ✅ iOS Safari 15.4+
- ✅ All modern browsers (2021+)

**CSS Custom Properties** are widely supported - no polyfill needed!

## Next Steps

**Phase 3** (Component Implementation):

- Build `<Heading>`, `<Text>`, `<Code>`, `<Metric>` React components
- Integrate tokens into components
- Export from `@workspace/ui` package
- Add TypeScript types and JSDoc

**Phase 4** (Migration & Documentation):

- Update design system docs
- Create migration guide
- Add visual component gallery
- Set up ESLint rules

## Support

**Questions?** Check:

- [Typography Scale Specification](/docs/typography-scale.md)
- [Vietnamese Typography Guide](/docs/vietnamese-typography-guide.md)
- [Design Tokens Reference](/docs/typography-tokens.md)
- [Test Suite](/packages/ui/src/__tests__/vietnamese-typography.test.html)

---

**Phase 2 Status**: ✅ Complete
**Tokens Active**: Yes (loaded in `packages/ui/src/styles/globals.css`)
**Ready for Phase 3**: Yes
