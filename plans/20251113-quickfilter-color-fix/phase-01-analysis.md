# Phase 01: Analysis and Diagnosis

**Date:** 2025-11-13
**Status:** Complete
**Priority:** High

## Context

User reported that quick filter component is not rendering or functioning correctly due to color implementation issues in the new color system.

## Screenshot Analysis

### Visual Design Details

**Typography:**

- Font Family: Likely "Geist Sans" or similar modern sans-serif (not Inter/Poppins)
- Font Sizes:
  - Filter labels: ~13-14px (small, medium weight)
  - Button text: ~13px
  - Section title: ~18-20px

**Color Palette (Light Mode):**

- Active button background: `hsl(217 91% 96%)` - Light blue subtle
- Active button border: `hsl(217 91% 60%)` - Brand primary blue
- Active button text: `hsl(217 91% 60%)` - Brand primary blue
- Inactive button text: `hsl(0 0% 45.1%)` - Muted foreground
- Filter label text: `hsl(0 0% 45.1%)` - Muted foreground
- Card background: `hsl(0 0% 100%)` - White
- Border: `hsl(0 0% 89.8%)` with 60% opacity

**Layout:**

- Border radius: ~8px for buttons
- Padding:
  - Button horizontal: 12-16px
  - Button vertical: 6-8px
  - Row gap: 12px
- Check icon size: 14px (3.5 in Tailwind)

**Component States:**

- Active: Blue background + blue border + check icon
- Inactive: Transparent + hover gray background
- Hover (inactive): Light gray background
- Focus: Ring outline

## Problem Identification

### Issue 1: Inline HSL Color Strings

**Location:** Lines 391, 394-398, 414-421, etc.

```tsx
// ❌ WRONG - Inline HSL with var()
className={cn(
  statusFilter === 'all'
    ? 'bg-[hsl(var(--brand-primary-subtle))] text-[hsl(var(--brand-primary))]'
    : 'text-muted-foreground hover:text-foreground'
)}
style={
  statusFilter === 'all'
    ? { borderColor: 'hsl(var(--brand-primary))' }
    : undefined
}
```

**Why it fails:**

1. Arbitrary value syntax `[hsl(var(...))]` doesn't properly resolve CSS variables
2. HSL values in design system are already complete (e.g., `217 91% 60%`)
3. Tailwind needs direct token references or proper arbitrary values

### Issue 2: Mixed Styling Approaches

Combining `className` with inline `style` prop creates maintenance issues and style precedence conflicts.

## Root Cause

The developer attempted to use design system tokens but applied them incorrectly:

- Used `hsl(var(--token))` instead of `var(--token)` directly
- Design tokens are already HSL values, don't need `hsl()` wrapper in arbitrary values
- Should use Tailwind utilities that reference tokens, not inline styles

## Correct Approach

### Option A: Use Tailwind Custom Colors (Recommended)

```tsx
className={cn(
  'transition-all rounded-lg border',
  isActive
    ? 'bg-brand-primary-subtle text-brand-primary border-brand-primary font-medium'
    : 'text-muted-foreground hover:text-foreground hover:bg-accent border-transparent'
)}
```

### Option B: Proper Arbitrary Values (if needed)

```tsx
className={cn(
  'transition-all rounded-lg border',
  isActive
    ? 'bg-[var(--brand-primary-subtle)] text-[var(--brand-primary)] border-[var(--brand-primary)]'
    : 'text-muted-foreground hover:text-foreground hover:bg-accent border-transparent'
)}
```

## Key Insights

1. **Design System Tokens:** Already defined in `globals.css` with complete HSL values
2. **Tailwind Configuration:** Likely extends theme to include brand colors
3. **Check Icon:** Should only show when filter is active
4. **Transition:** All state changes should have smooth transitions
5. **Accessibility:** Focus states and keyboard navigation required

## Design System Tokens Used

```css
--brand-primary: hsl(217 91% 60%); /* Primary blue */
--brand-primary-subtle: hsl(217 91% 96%); /* Light blue background */
--muted-foreground: hsl(0 0% 45.1%); /* Gray text */
--accent: hsl(0 0% 96.1%); /* Hover background */
--border: hsl(0 0% 89.8%); /* Border color */
```

## Next Steps

1. ✅ Replace inline `hsl(var(...))` with proper Tailwind classes
2. ✅ Remove inline `style` prop usage
3. ✅ Verify Tailwind config includes brand color utilities
4. ✅ Test all filter button states (active, inactive, hover, focus)
5. ✅ Verify check icon visibility logic

## Related Code Files

- `apps/web/src/features/active-tables/pages/active-tables-page.tsx` (lines 376-576)
- `packages/ui/src/styles/globals.css` (color token definitions)
- `packages/ui/tailwind.config.ts` (theme extension)
