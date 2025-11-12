# Atlassian-Inspired Spacing and Grid System

**Date:** 2025-11-12
**Status:** 🚧 Design Phase
**Version:** 1.0

## Executive Summary

This document outlines the implementation of an Atlassian-inspired spacing and grid system for Beqeek, following their **8px baseline system** and **12-column responsive grid**. The system provides composable primitives for consistent spacing, layout, and responsive design across all application interfaces.

**Key Features:**

- ✅ 8px baseline spacing system (0px to 80px)
- ✅ 14 spacing tokens with semantic names
- ✅ 12-column responsive grid
- ✅ 5 breakpoints for responsive design
- ✅ Composable layout primitives (Box, Stack, Inline)
- ✅ CSS custom properties for theming

## Table of Contents

1. [Spacing System](#spacing-system)
2. [Grid System](#grid-system)
3. [Breakpoint System](#breakpoint-system)
4. [Layout Primitives](#layout-primitives)
5. [Implementation Plan](#implementation-plan)
6. [Usage Guidelines](#usage-guidelines)
7. [Migration Strategy](#migration-strategy)

---

## Spacing System

### 8px Baseline

The foundation of Atlassian's spacing system is the **8px base unit**. This creates a consistent rhythm throughout the UI and ensures:

- Visual harmony across components
- Predictable spacing patterns
- Easy mental calculation (8, 16, 24, 32...)
- Alignment with common screen resolutions

### Spacing Token Scale

Following Atlassian's naming convention where the number represents the percentage of the base unit:

| Token        | REM      | PX   | % of Base | Use Case                         |
| ------------ | -------- | ---- | --------- | -------------------------------- |
| `space.0`    | 0rem     | 0px  | 0%        | Reset spacing                    |
| `space.025`  | 0.125rem | 2px  | 25%       | Hairline gaps, icon padding      |
| `space.050`  | 0.25rem  | 4px  | 50%       | Tight spacing, badges            |
| `space.075`  | 0.375rem | 6px  | 75%       | Compact UI elements              |
| `space.100`  | 0.5rem   | 8px  | 100%      | **Base unit**, default gaps      |
| `space.150`  | 0.75rem  | 12px | 150%      | Small component padding          |
| `space.200`  | 1rem     | 16px | 200%      | Standard spacing, button padding |
| `space.250`  | 1.25rem  | 20px | 250%      | Medium gaps                      |
| `space.300`  | 1.5rem   | 24px | 300%      | Card padding, section gaps       |
| `space.400`  | 2rem     | 32px | 400%      | Large component spacing          |
| `space.500`  | 2.5rem   | 40px | 500%      | Section padding                  |
| `space.600`  | 3rem     | 48px | 600%      | Major layout spacing             |
| `space.800`  | 4rem     | 64px | 800%      | Page section gaps                |
| `space.1000` | 5rem     | 80px | 1000%     | Hero sections, major dividers    |

### Negative Spacing Tokens

For margin adjustments and negative positioning:

| Token                | REM       | PX    | Use Case           |
| -------------------- | --------- | ----- | ------------------ |
| `space.negative-025` | -0.125rem | -2px  | Fine positioning   |
| `space.negative-050` | -0.25rem  | -4px  | Icon alignment     |
| `space.negative-075` | -0.375rem | -6px  | Offset adjustments |
| `space.negative-100` | -0.5rem   | -8px  | Overlap effects    |
| `space.negative-150` | -0.75rem  | -12px | Modal overlays     |
| `space.negative-200` | -1rem     | -16px | Pullback layouts   |
| `space.negative-300` | -1.5rem   | -24px | Decorative offsets |
| `space.negative-400` | -2rem     | -32px | Deep overlaps      |

### CSS Custom Properties

Spacing tokens will be defined as CSS custom properties in `globals.css`:

```css
:root {
  /* ========================================
     SPACING TOKENS (Atlassian 8px system)
     ======================================== */

  /* Positive spacing */
  --space-0: 0rem; /* 0px */
  --space-025: 0.125rem; /* 2px */
  --space-050: 0.25rem; /* 4px */
  --space-075: 0.375rem; /* 6px */
  --space-100: 0.5rem; /* 8px - BASE UNIT */
  --space-150: 0.75rem; /* 12px */
  --space-200: 1rem; /* 16px */
  --space-250: 1.25rem; /* 20px */
  --space-300: 1.5rem; /* 24px */
  --space-400: 2rem; /* 32px */
  --space-500: 2.5rem; /* 40px */
  --space-600: 3rem; /* 48px */
  --space-800: 4rem; /* 64px */
  --space-1000: 5rem; /* 80px */

  /* Negative spacing */
  --space-negative-025: -0.125rem; /* -2px */
  --space-negative-050: -0.25rem; /* -4px */
  --space-negative-075: -0.375rem; /* -6px */
  --space-negative-100: -0.5rem; /* -8px */
  --space-negative-150: -0.75rem; /* -12px */
  --space-negative-200: -1rem; /* -16px */
  --space-negative-300: -1.5rem; /* -24px */
  --space-negative-400: -2rem; /* -32px */
}
```

### Tailwind CSS Integration

Map spacing tokens to Tailwind's spacing scale:

```javascript
// tailwind.config.js
theme: {
  spacing: {
    '0': 'var(--space-0)',
    '0.5': 'var(--space-025)',
    '1': 'var(--space-050)',
    '1.5': 'var(--space-075)',
    '2': 'var(--space-100)',
    '3': 'var(--space-150)',
    '4': 'var(--space-200)',
    '5': 'var(--space-250)',
    '6': 'var(--space-300)',
    '8': 'var(--space-400)',
    '10': 'var(--space-500)',
    '12': 'var(--space-600)',
    '16': 'var(--space-800)',
    '20': 'var(--space-1000)',
  }
}
```

---

## Grid System

### 12-Column Grid Structure

Following Atlassian's grid design with 12 columns for flexible content layouts:

**Grid Components:**

- **Columns:** Content spans 3-12 columns
- **Gutters:** Gaps between columns (responsive)
- **Margins:** Outer edges preventing content overflow

### Breakpoint System

Based on Atlassian's responsive design system:

| Breakpoint | Name        | Min Width | Max Width | Columns | Gutter | Margin |
| ---------- | ----------- | --------- | --------- | ------- | ------ | ------ |
| `xs`       | Extra Small | 0px       | 479px     | 4       | 16px   | 16px   |
| `sm`       | Small       | 480px     | 767px     | 8       | 16px   | 24px   |
| `md`       | Medium      | 768px     | 1023px    | 12      | 24px   | 32px   |
| `lg`       | Large       | 1024px    | 1439px    | 12      | 24px   | 40px   |
| `xl`       | Extra Large | 1440px    | 1767px    | 12      | 24px   | 80px   |
| `2xl`      | 2X Large    | 1768px+   | ∞         | 12      | 24px   | 120px  |

### Breakpoint REM Values

For CSS media queries (1rem = 16px):

| Breakpoint | REM      | Use Case                        |
| ---------- | -------- | ------------------------------- |
| `xs`       | 0rem     | Mobile portrait                 |
| `sm`       | 30rem    | Mobile landscape, small tablets |
| `md`       | 48rem    | Tablets                         |
| `lg`       | 64rem    | Small laptops                   |
| `xl`       | 90rem    | Desktops                        |
| `2xl`      | 110.5rem | Large displays                  |

### CSS Custom Properties

```css
:root {
  /* ========================================
     GRID TOKENS
     ======================================== */

  /* Grid columns */
  --grid-columns: 12;

  /* Responsive gutters */
  --grid-gutter-xs: 1rem; /* 16px */
  --grid-gutter-sm: 1rem; /* 16px */
  --grid-gutter-md: 1.5rem; /* 24px */
  --grid-gutter-lg: 1.5rem; /* 24px */
  --grid-gutter-xl: 1.5rem; /* 24px */
  --grid-gutter-2xl: 1.5rem; /* 24px */

  /* Responsive margins */
  --grid-margin-xs: 1rem; /* 16px */
  --grid-margin-sm: 1.5rem; /* 24px */
  --grid-margin-md: 2rem; /* 32px */
  --grid-margin-lg: 2.5rem; /* 40px */
  --grid-margin-xl: 5rem; /* 80px */
  --grid-margin-2xl: 7.5rem; /* 120px */

  /* Current gutter/margin (changes with breakpoint) */
  --grid-gutter: var(--grid-gutter-xs);
  --grid-margin: var(--grid-margin-xs);
}

/* Breakpoint-specific gutter/margin updates */
@media (min-width: 30rem) {
  :root {
    --grid-gutter: var(--grid-gutter-sm);
    --grid-margin: var(--grid-margin-sm);
  }
}

@media (min-width: 48rem) {
  :root {
    --grid-gutter: var(--grid-gutter-md);
    --grid-margin: var(--grid-margin-md);
  }
}

@media (min-width: 64rem) {
  :root {
    --grid-gutter: var(--grid-gutter-lg);
    --grid-margin: var(--grid-margin-lg);
  }
}

@media (min-width: 90rem) {
  :root {
    --grid-gutter: var(--grid-gutter-xl);
    --grid-margin: var(--grid-margin-xl);
  }
}

@media (min-width: 110.5rem) {
  :root {
    --grid-gutter: var(--grid-gutter-2xl);
    --grid-margin: var(--grid-margin-2xl);
  }
}
```

### Grid Types

**Fluid Grid:**

- Spans full viewport width minus margins
- Columns scale proportionally
- Use for dashboards, full-width layouts

**Fixed Grid:**

- Max width constraint (e.g., 1440px)
- Centers content when exceeding max width
- Use for content-focused pages

---

## Breakpoint System

### Breakpoint Tokens

CSS custom properties for responsive design:

```css
:root {
  /* ========================================
     BREAKPOINT TOKENS
     ======================================== */

  --breakpoint-xs: 0rem; /* 0px */
  --breakpoint-sm: 30rem; /* 480px */
  --breakpoint-md: 48rem; /* 768px */
  --breakpoint-lg: 64rem; /* 1024px */
  --breakpoint-xl: 90rem; /* 1440px */
  --breakpoint-2xl: 110.5rem; /* 1768px */
}
```

### Media Query Utilities

Standardized media queries for consistency:

```css
/* Mobile-first approach */
.container {
  /* Base styles (xs) */
  padding: var(--space-200);
}

@media (min-width: 30rem) {
  /* sm: Small tablets and landscape phones */
  .container {
    padding: var(--space-300);
  }
}

@media (min-width: 48rem) {
  /* md: Tablets */
  .container {
    padding: var(--space-400);
  }
}

@media (min-width: 64rem) {
  /* lg: Small laptops */
  .container {
    padding: var(--space-500);
  }
}

@media (min-width: 90rem) {
  /* xl: Desktops */
  .container {
    padding: var(--space-600);
  }
}

@media (min-width: 110.5rem) {
  /* 2xl: Large displays */
  .container {
    padding: var(--space-800);
  }
}
```

---

## Layout Primitives

### Box Primitive

Generic container with configurable padding and styling:

**Purpose:** Apply consistent padding and basic styling to containers

**Props:**

- `padding`: Spacing token (e.g., `space.200`)
- `backgroundColor`: Color token
- `borderRadius`: Border radius value

**Example:**

```tsx
<Box padding="space.300" backgroundColor="background">
  <Content />
</Box>
```

### Stack Primitive

Vertical layout with managed spacing between children:

**Purpose:** Create vertical stacks with consistent gaps

**Props:**

- `space`: Gap between children (spacing token)
- `align`: Horizontal alignment (`start`, `center`, `end`, `stretch`)

**Example:**

```tsx
<Stack space="space.200" align="start">
  <Header />
  <Content />
  <Footer />
</Stack>
```

### Inline Primitive

Horizontal layout with managed spacing between children:

**Purpose:** Create horizontal layouts with consistent gaps

**Props:**

- `space`: Gap between children (spacing token)
- `align`: Vertical alignment (`start`, `center`, `end`, `baseline`)
- `wrap`: Enable wrapping (`true`/`false`)

**Example:**

```tsx
<Inline space="space.150" align="center" wrap>
  <Button />
  <Button />
  <Button />
</Inline>
```

### Grid Primitive

12-column responsive grid container:

**Purpose:** Create complex responsive layouts

**Props:**

- `columns`: Number of columns (1-12)
- `gap`: Gutter spacing (spacing token)
- `type`: Grid type (`fluid` or `fixed`)

**Example:**

```tsx
<Grid columns={12} gap="space.300" type="fluid">
  <GridItem span={8}>
    <MainContent />
  </GridItem>
  <GridItem span={4}>
    <Sidebar />
  </GridItem>
</Grid>
```

---

## Implementation Plan

### Phase 1: Spacing Tokens ✅

**Files to Modify:**

1. `packages/ui/src/styles/globals.css` - Add spacing tokens

**Tasks:**

- [x] Define 14 positive spacing tokens
- [x] Define 8 negative spacing tokens
- [x] Add comprehensive comments
- [ ] Test in browser

### Phase 2: Grid System Tokens

**Files to Modify:**

1. `packages/ui/src/styles/globals.css` - Add grid and breakpoint tokens

**Tasks:**

- [ ] Define breakpoint tokens (6 breakpoints)
- [ ] Define grid gutter tokens (responsive)
- [ ] Define grid margin tokens (responsive)
- [ ] Add media query updates

### Phase 3: Layout Primitives

**Files to Create:**

1. `packages/ui/src/components/primitives/box.tsx`
2. `packages/ui/src/components/primitives/stack.tsx`
3. `packages/ui/src/components/primitives/inline.tsx`
4. `packages/ui/src/components/primitives/grid.tsx`
5. `packages/ui/src/components/primitives/index.ts`

**Tasks:**

- [ ] Implement Box component
- [ ] Implement Stack component
- [ ] Implement Inline component
- [ ] Implement Grid component
- [ ] Export primitives from index

### Phase 4: Tailwind Integration

**Files to Modify:**

1. `packages/ui/tailwind.config.ts` (or equivalent)

**Tasks:**

- [ ] Map spacing tokens to Tailwind scale
- [ ] Add custom breakpoint configuration
- [ ] Test spacing utilities (p-_, m-_, gap-\*)

### Phase 5: Documentation

**Files to Create:**

1. `docs/spacing-usage-guide.md`
2. `docs/grid-usage-guide.md`
3. `docs/layout-primitives-guide.md`

**Tasks:**

- [ ] Document spacing token usage
- [ ] Document grid system usage
- [ ] Document layout primitives API
- [ ] Add code examples
- [ ] Create visual examples

### Phase 6: Migration

**Tasks:**

- [ ] Audit existing hardcoded spacing
- [ ] Replace with spacing tokens
- [ ] Test for visual regressions
- [ ] Update component library

---

## Usage Guidelines

### Spacing Token Selection

**General Rules:**

1. **Prefer multiples of base unit** (space.100, space.200, space.300)
2. **Use sub-base units sparingly** (space.025, space.050, space.075)
3. **Be consistent** - Same element types use same spacing

**Common Patterns:**

| Element Type   | Spacing Token      | Use Case                |
| -------------- | ------------------ | ----------------------- |
| Icon padding   | `space.050` (4px)  | Tight icon containers   |
| Badge padding  | `space.075` (6px)  | Compact badges          |
| Button padding | `space.200` (16px) | Standard button padding |
| Card padding   | `space.300` (24px) | Card content spacing    |
| Section gaps   | `space.400` (32px) | Between major sections  |
| Page margins   | `space.600` (48px) | Page-level spacing      |

### Grid Column Spans

**Content Width Guidelines:**

| Content Type | Recommended Span | Breakpoint        |
| ------------ | ---------------- | ----------------- |
| Full width   | 12 columns       | All sizes         |
| Main content | 8-9 columns      | lg+               |
| Sidebar      | 3-4 columns      | lg+               |
| Card in grid | 4 columns        | md+, 6 columns sm |
| Form narrow  | 6 columns        | lg+               |
| Form wide    | 8 columns        | lg+               |

### Responsive Design Patterns

**Mobile-First Approach:**

```tsx
// ✅ Good - Progressive enhancement
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
  <Card />
  <Card />
  <Card />
</div>

// ❌ Bad - Desktop-first
<div className="grid grid-cols-3 lg:grid-cols-2 md:grid-cols-1">
  <Card />
  <Card />
  <Card />
</div>
```

### Spacing Consistency

**Component-Level:**

```tsx
// ✅ Good - Consistent spacing using tokens
<Stack space="space.200">
  <Heading />
  <Text />
  <Button />
</Stack>

// ❌ Bad - Mixed hardcoded values
<div className="space-y-3">
  <Heading className="mb-4" />
  <Text className="mb-5" />
  <Button />
</div>
```

---

## Migration Strategy

### Step 1: Identify Hardcoded Spacing

Search patterns:

```bash
# Find hardcoded padding/margin values
grep -r "p-[0-9]\|m-[0-9]\|gap-[0-9]" apps/web/src --include="*.tsx"

# Find hardcoded px values in styles
grep -r "[0-9]px" apps/web/src --include="*.tsx"
```

### Step 2: Replace with Tokens

**Before:**

```tsx
<div className="p-6 gap-4 mt-8">
  <Content />
</div>
```

**After:**

```tsx
<div className="p-[var(--space-300)] gap-[var(--space-200)] mt-[var(--space-400)]">
  <Content />
</div>
```

**Or with Tailwind mapping:**

```tsx
<div className="p-6 gap-4 mt-8">
  {' '}
  {/* Maps to space tokens via config */}
  <Content />
</div>
```

### Step 3: Prioritize Migration

**Priority Order:**

1. New components (use tokens from start)
2. Frequently used components (Button, Card, Alert)
3. Layout components (Grid, Stack, Container)
4. Page-level layouts
5. Feature-specific components

### Step 4: Visual Regression Testing

After migration:

- Test all spacing in light mode
- Test all spacing in dark mode
- Test responsive breakpoints
- Verify alignment and visual rhythm

---

## Design Principles

### Consistency

- **Single Source of Truth:** All spacing values from tokens
- **Predictable Patterns:** Same element types use same spacing
- **Visual Rhythm:** 8px baseline creates harmony

### Composability

- **Primitives Build Complex UIs:** Box, Stack, Inline combine
- **Token-Driven:** Components accept spacing tokens as props
- **Flexible Yet Constrained:** Consistent options, creative freedom

### Responsiveness

- **Mobile-First:** Start small, enhance for larger screens
- **Breakpoint-Aware:** Spacing adjusts at breakpoints
- **Content-First:** Grid adapts to content needs

### Accessibility

- **Touch Targets:** Minimum 44x44px (space.500 = 40px + border)
- **Readable Layouts:** Adequate spacing between elements
- **Focus Indicators:** Spacing for visible focus rings

---

## Benefits

### For Developers

1. **Faster Development:** Predefined spacing reduces decisions
2. **Less CSS:** Reusable tokens replace custom values
3. **Type Safety:** Token names prevent typos
4. **Auto-Complete:** IDE suggests valid token names

### For Designers

1. **Design-Dev Parity:** Same tokens in Figma and code
2. **Consistent Handoffs:** Spacing specifications clear
3. **Easier Prototyping:** Rapid layout creation
4. **Scalable System:** Add new components easily

### For Users

1. **Visual Consistency:** Unified spacing throughout app
2. **Better UX:** Predictable layouts improve usability
3. **Responsive Design:** Optimal spacing on all devices
4. **Accessibility:** Proper spacing aids navigation

---

## Technical Specifications

### Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**CSS Features Used:**

- CSS Custom Properties (CSS Variables)
- CSS Grid
- Flexbox
- Media Queries

### Performance

**Build Impact:**

- CSS tokens: ~2KB (uncompressed)
- Grid utilities: ~3KB (uncompressed)
- Layout primitives: ~5KB (JS + CSS)
- **Total:** ~10KB added to bundle

**Runtime Performance:**

- CSS variables: Native browser support, no JS overhead
- Grid layouts: Hardware-accelerated rendering
- Primitives: Minimal React overhead

---

## Next Steps

### Immediate (Phase 1-2)

1. ✅ Add spacing tokens to globals.css
2. ⏳ Add grid and breakpoint tokens
3. ⏳ Test tokens in browser
4. ⏳ Update Tailwind configuration

### Short-term (Phase 3-4)

5. ⏳ Create layout primitives (Box, Stack, Inline, Grid)
6. ⏳ Document primitive APIs
7. ⏳ Add usage examples
8. ⏳ Create Storybook stories

### Long-term (Phase 5-6)

9. ⏳ Audit existing components
10. ⏳ Migrate to spacing tokens
11. ⏳ Visual regression testing
12. ⏳ Team training

---

## Related Documentation

- **Color System:** `/docs/atlassian-color-system.md`
- **Phase 4 Complete:** `/docs/plans/phase-4-complete.md`
- **Component Variants:** `/docs/component-variants-guide.md`
- **Design System:** `/docs/design-system.md`
- **Token Reference:** `/packages/ui/src/styles/globals.css`

---

## References

- [Atlassian Design System - Spacing](https://atlassian.design/foundations/spacing/primitives)
- [Atlassian Design System - Grid](https://atlassian.design/foundations/grid-beta/applying-grid/)
- [Atlassian Design System - Breakpoints](https://atlassian.design/components/primitives/responsive/breakpoints/)
- [8-Point Grid System Best Practices](https://spec.fm/specifics/8-pt-grid)
- [Material Design - Layout Grid](https://m3.material.io/foundations/layout/understanding-layout/overview)

---

**Document Version:** 1.0
**Last Updated:** November 12, 2025
**Author:** Claude Code
**Status:** 🚧 Design Complete, Implementation In Progress
