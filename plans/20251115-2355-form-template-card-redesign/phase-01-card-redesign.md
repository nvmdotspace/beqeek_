# Phase 1: Card Component Redesign

**Date**: 2025-11-15
**Priority**: High
**Status**: In Progress

## Context

Redesigning `FormTemplateCard` component to match the more compact and elegant design shown in the screenshot.

## Current Implementation Analysis

**File**: `apps/web/src/features/workflow-forms/components/form-template-card.tsx`

**Current Spacing**:

- Card padding: `p-8` (32px)
- Vertical spacing: `space-y-6` (24px)
- Icon container: `p-4` (16px padding)
- Icon size: 48x48px

**Issues**:

1. Excessive padding makes cards unnecessarily tall
2. Icon background (`bg-primary/5`) creates visual weight
3. Large spacing reduces information density
4. Poor use of screen real estate

## Design Requirements

### Spacing Adjustments

- **Card padding**: `p-8` → `p-6` (reduce from 32px to 24px)
- **Vertical spacing**: `space-y-6` → `space-y-4` (reduce from 24px to 16px)
- **Icon container**: Remove background, reduce padding
- **Content spacing**: `space-y-3` → `space-y-2`

### Icon Design

- Remove colored background container
- Reduce icon size: 48px → 40px
- Simpler presentation with subtle hover effect
- Direct placement without wrapper div

### Typography

- **Title**: Keep `text-xl font-semibold` (20px)
- **Description**: `text-sm` → `text-sm` with better `line-height`
- Improve text color contrast

### Visual Effects

- Reduce border thickness: `border-2` → `border`
- Lighter hover shadow
- Subtle transition timing

## Implementation Steps

### Step 1: Update Card Padding

```tsx
// Before
<CardHeader className="space-y-6 p-8">

// After
<CardHeader className="space-y-4 p-6">
```

### Step 2: Simplify Icon Container

```tsx
// Before
<div className="flex justify-center">
  <div className="rounded-xl bg-primary/5 p-4 group-hover:bg-primary/10 transition-colors">
    {getIcon()}
  </div>
</div>

// After
<div className="flex justify-center">
  {getIcon()}
</div>
```

### Step 3: Reduce Icon Size

```tsx
// Update width/height from 48 to 40
width = '40';
height = '40';
```

### Step 4: Update Content Spacing

```tsx
// Before
<div className="space-y-3 text-center">

// After
<div className="space-y-2 text-center">
```

### Step 5: Refine Border and Hover

```tsx
// Before
className = 'group cursor-pointer border-2 hover:border-primary hover:shadow-lg transition-all duration-200';

// After
className = 'group cursor-pointer border hover:border-primary hover:shadow-md transition-all duration-200';
```

## Expected Outcome

- Card height reduced by ~45%
- Cleaner, more professional appearance
- Better information density
- Maintained accessibility and readability
- Improved hover feedback

## Success Metrics

- [ ] Visual height matches screenshot reference
- [ ] Icons appear clean without backgrounds
- [ ] Spacing feels balanced
- [ ] Hover states remain clear
- [ ] Mobile responsive maintained
