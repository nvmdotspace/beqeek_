# Phase 3: Component Sizing and Spacing

**Phase**: 03
**Status**: 📋 Planned
**Date**: 2025-11-13
**Priority**: High
**Dependencies**: Phase 2 complete

## Context

- [Main Plan](plan.md)
- [Phase 1: Analysis](phase-01-analysis-and-audit.md)
- [Phase 2: Typography](phase-02-typography-standardization.md)
- [Design System](../../docs/design-system.md)

## Overview

Standardize component dimensions, padding, margins, and spacing using design system tokens to ensure visual consistency across all UI elements.

## Component Sizing Standards

### Buttons

#### Height Standards

| Size    | Height         | Padding X   | Padding Y     | Usage                          |
| ------- | -------------- | ----------- | ------------- | ------------------------------ |
| sm      | 32px (h-8)     | 12px (px-3) | 8px (py-2)    | Compact spaces, inline actions |
| default | 36px (h-9)     | 16px (px-4) | 10px (py-2.5) | Standard buttons               |
| lg      | 40px (h-10)    | 20px (px-5) | 12px (py-3)   | Prominent actions              |
| icon    | 36px (h-9 w-9) | -           | -             | Icon-only buttons              |

#### Implementation

```tsx
// ❌ Before (inconsistent)
<Button className="h-8">Action</Button>
<Button className="h-9">Action</Button>
<Button className="h-10">Action</Button>

// ✅ After (standardized)
<Button size="sm">Action</Button>
<Button size="default">Action</Button>
<Button size="lg">Action</Button>
```

### Inputs

#### Height Standards (matching buttons)

| Size    | Height      | Padding   | Border | Usage            |
| ------- | ----------- | --------- | ------ | ---------------- |
| sm      | 32px (h-8)  | px-3 py-2 | 1px    | Compact forms    |
| default | 36px (h-9)  | px-3 py-2 | 1px    | Standard inputs  |
| lg      | 40px (h-10) | px-4 py-3 | 1px    | Prominent inputs |

### Cards

#### Padding Standards

| Card Type     | Padding    | Gap     | Border | Usage              |
| ------------- | ---------- | ------- | ------ | ------------------ |
| Stat Badge    | p-2 (8px)  | gap-1.5 | 1px    | Metrics display    |
| Compact Card  | p-4 (16px) | gap-3   | 1px    | Table/module cards |
| Standard Card | p-6 (24px) | gap-4   | 1px    | Workspace cards    |
| Detail Card   | p-8 (32px) | gap-6   | 1px    | Full-width content |

#### Implementation

```tsx
// ❌ Before (inconsistent)
<Card className="p-3">...</Card>
<Card className="p-4">...</Card>
<Card className="p-6">...</Card>

// ✅ After (consistent with card type)
<Card className="p-4">...</Card> // Compact
<Card className="p-6">...</Card> // Standard
```

### Icons

#### Size Standards

| Context      | Size | Class   | Usage                 |
| ------------ | ---- | ------- | --------------------- |
| Small Icon   | 12px | h-3 w-3 | Badge icons, inline   |
| Default Icon | 16px | h-4 w-4 | Button icons, lists   |
| Medium Icon  | 20px | h-5 w-5 | Headers, stat cards   |
| Large Icon   | 24px | h-6 w-6 | Page headers, avatars |

### Avatars

| Size | Dimensions       | Border Radius | Usage              |
| ---- | ---------------- | ------------- | ------------------ |
| xs   | 24px (h-6 w-6)   | rounded-md    | Tiny lists         |
| sm   | 32px (h-8 w-8)   | rounded-lg    | Comments, mentions |
| md   | 40px (h-10 w-10) | rounded-lg    | User menus, cards  |
| lg   | 48px (h-12 w-12) | rounded-xl    | Profiles           |

### Badges

| Size    | Height     | Padding | Font Size | Usage           |
| ------- | ---------- | ------- | --------- | --------------- |
| xs      | 16px (h-4) | px-1    | 10px      | Dense tables    |
| sm      | 20px (h-5) | px-1.5  | 11px      | Cards, filters  |
| default | 24px (h-6) | px-2    | 12px      | Standard badges |

## Spacing System Standards

### Container Spacing

#### Page Padding

```tsx
// ✅ Standardized page container
<div className="p-6">
  {' '}
  // 24px on all sides
  {/* Page content */}
</div>
```

#### Section Spacing

```tsx
// ✅ Consistent section gaps
<Stack space="space-600">
  {' '}
  // 24px between sections
  <section>...</section>
  <section>...</section>
</Stack>
```

### Grid Layouts

#### Responsive Grid Standards

```tsx
// ✅ Standardized grid pattern
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">{/* Cards */}</div>

// Gap sizes:
// - gap-3 (12px): Dense grids
// - gap-4 (16px): Standard grids
// - gap-5 (20px): Spacious grids
// - gap-6 (24px): Very spacious
```

### Stack Spacing

| Space Token | px   | Usage                 |
| ----------- | ---- | --------------------- |
| space-025   | 2px  | Tight inline elements |
| space-050   | 4px  | Very tight stacks     |
| space-100   | 8px  | Tight stacks          |
| space-150   | 12px | Compact stacks        |
| space-200   | 16px | Standard stacks       |
| space-250   | 20px | Comfortable stacks    |
| space-300   | 24px | Spacious stacks       |
| space-400   | 32px | Very spacious         |
| space-600   | 48px | Page sections         |

## Border Radius Standards

### Component Radii

| Element | Radius | Class        | Usage                  |
| ------- | ------ | ------------ | ---------------------- |
| Small   | 4px    | rounded-sm   | Badges, small elements |
| Medium  | 6px    | rounded-md   | Inputs, buttons        |
| Default | 8px    | rounded-lg   | Cards, dialogs         |
| Large   | 12px   | rounded-xl   | Page sections          |
| Full    | 50%    | rounded-full | Avatars, pills         |

### Border Standards

```tsx
// ✅ Consistent border usage
border border-border/60  // Standard card border
border border-border     // Interactive elements
border-2 border-primary  // Focus states
```

## Shadow Standards

### Elevation System

```css
/* Level 0: No shadow (default) */
shadow-none

/* Level 1: Subtle hover */
shadow-sm  /* 0 1px 2px rgba(0, 0, 0, 0.05) */

/* Level 2: Card elevation */
shadow     /* 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06) */

/* Level 3: Dropdown, modal */
shadow-md  /* 0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06) */

/* Level 4: Page dialogs */
shadow-lg  /* 0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05) */
```

## Implementation Checklist

### By Component Type

#### Buttons

- [ ] All buttons use size prop (sm/default/lg)
- [ ] Icon buttons use size="icon"
- [ ] No manual height classes on buttons
- [ ] Padding matches size variant

#### Inputs

- [ ] Input heights match button heights
- [ ] Consistent padding (px-3 py-2)
- [ ] Border radius standardized (rounded-md)
- [ ] Focus rings consistent

#### Cards

- [ ] StatBadge: p-2 padding
- [ ] Compact cards: p-4 padding
- [ ] Standard cards: p-6 padding
- [ ] Consistent border-border/60

#### Icons

- [ ] Button icons: h-4 w-4
- [ ] Stat card icons: h-5 w-5
- [ ] Badge icons: h-3 w-3
- [ ] No arbitrary icon sizes

#### Grid Layouts

- [ ] Consistent gap-4 or gap-5
- [ ] Responsive breakpoints: md, lg, xl, 2xl
- [ ] Column counts: 2, 3, 4, 5

### By Page

#### Workspace Dashboard

- [ ] Page padding: p-6
- [ ] Section spacing: space-600
- [ ] Card grid: gap-4
- [ ] Button sizes: size="default"

#### Modules Page

- [ ] Page padding: p-6
- [ ] Section spacing: gap-6
- [ ] Card grid: gap-6 → gap-4 (standardize)
- [ ] Button sizes: verify consistency

## Files to Update

### Components

1. `packages/ui/src/components/button.tsx`
   - Verify size variants
   - Update documentation

2. `packages/ui/src/components/input.tsx`
   - Standardize heights
   - Match button sizing

3. `packages/ui/src/components/card.tsx`
   - Document padding standards
   - Create variants if needed

### Pages

1. `apps/web/src/features/workspace/pages/workspace-dashboard.tsx`
   - Update grid gaps
   - Verify button sizes
   - Check spacing tokens

2. `apps/web/src/features/active-tables/pages/active-tables-page.tsx`
   - Standardize grid gap (gap-6 → gap-4)
   - Update button sizes
   - Verify spacing

### Card Components

1. `apps/web/src/features/workspace/components/workspace-card-compact.tsx`
   - Verify padding (should be p-4 or p-6)
   - Check icon sizes

2. `apps/web/src/features/active-tables/components/active-table-card.tsx`
   - Verify padding (currently p-4 ✓)
   - Check icon sizes

## Testing & Validation

### Visual Regression

- [ ] Compare before/after screenshots
- [ ] Verify alignment across pages
- [ ] Check responsive behavior
- [ ] Test dark mode

### Accessibility

- [ ] Touch targets ≥44px
- [ ] Focus indicators visible
- [ ] Contrast ratios maintained
- [ ] Keyboard navigation works

### Performance

- [ ] No layout shifts
- [ ] Consistent rendering
- [ ] No flickering

## Success Criteria

- [ ] All buttons within a page use same size
- [ ] Cards have consistent padding by type
- [ ] Grid gaps uniform across pages
- [ ] Icons sized appropriately for context
- [ ] Spacing follows design token system
- [ ] Zero arbitrary values (no px-[13px])

## Next Steps

Proceed to [Phase 4: Implementation](phase-04-implementation.md)

## References

- [TailwindCSS Spacing](https://tailwindcss.com/docs/customizing-spacing)
- [Design System Spacing](../../docs/design-system.md#spacing--layout)
- [shadcn/ui Button](https://ui.shadcn.com/docs/components/button)
