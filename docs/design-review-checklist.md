# Design Review Checklist

Use this checklist before submitting any PR with UI changes.

## Quick Reference

Before submitting, ask yourself:

- ✅ Am I using design system components?
- ✅ Are my headings semantic (`<Heading>`)?
- ✅ Do my buttons use the `size` prop?
- ✅ Am I using design tokens for spacing?
- ✅ Does this match existing patterns?

## Typography ✍️

- [ ] **No manual text size classes on headings**
  - ❌ `<h1 className="text-2xl font-bold">`
  - ✅ `<Heading level={1}>`

- [ ] **All headings use `<Heading>` component**
  - Import: `import { Heading } from '@workspace/ui/components/typography'`
  - Levels: H1 (page title), H2 (sections), H3 (subsections), H4 (cards)

- [ ] **Body text uses `<Text>` component**
  - Import: `import { Text } from '@workspace/ui/components/typography'`
  - Props: `size="small"`, `weight="medium"`, `color="muted"`

- [ ] **Metrics use `<Metric>` component**
  - Import: `import { Metric } from '@workspace/ui/components/typography'`
  - For numbers: `<Metric value={count} />`

- [ ] **Font weights appropriate for hierarchy**
  - H1-H2: font-bold (700) or font-semibold (600)
  - H3-H6: font-semibold (600)
  - Body: font-normal (400) or font-medium (500)

## Component Sizing 📏

- [ ] **Buttons use `size` prop (no `h-*` classes)**
  - ❌ `<Button className="h-10">`
  - ✅ `<Button size="default">` (h-9/36px)
  - ✅ `<Button size="sm">` (h-8/32px)
  - ✅ `<Button size="lg">` (h-10/40px)
  - ✅ `<Button size="icon">` (h-9 w-9)

- [ ] **Input heights match button heights**
  - Default input: h-9 (36px)
  - Small input: h-8 (32px)

- [ ] **Icons sized appropriately for context**
  - Badge icons: `h-3 w-3` (12px)
  - Button icons: `h-4 w-4` (16px)
  - Stat card icons: `h-5 w-5` (20px)
  - Header icons: `h-6 w-6` (24px)

- [ ] **Cards follow padding standards**
  - Stat badges: `p-2` (8px)
  - Compact cards: `p-4` (16px) ← **Default for table/module cards**
  - Standard cards: `p-6` (24px) ← **For workspace cards**
  - Detail views: `p-8` (32px)

- [ ] **Badges use standard sizes**
  - xs: `h-4 px-1` (16px height)
  - sm: `h-5 px-1.5` (20px height)
  - default: `h-6 px-2` (24px height)

## Spacing 📐

- [ ] **Page padding is `p-6`** (24px on all sides)

  ```tsx
  <div className="p-6">{/* Page content */}</div>
  ```

- [ ] **Section spacing uses design tokens**

  ```tsx
  <Stack space="space-600">{/* Sections */}</Stack>
  ```

- [ ] **Grid gaps standardized**
  - Default card grid: `gap-4` (16px) ← **Use this**
  - Dense grids: `gap-3` (12px)
  - Spacious layouts: `gap-5` (20px)

- [ ] **No arbitrary values**
  - ❌ `p-[13px]`, `gap-[18px]`, `mt-[22px]`
  - ✅ `p-4`, `gap-4`, `mt-6`

- [ ] **Stack spacing uses `space-*` tokens**
  - `space-100` (8px): Tight
  - `space-200` (16px): Standard
  - `space-300` (24px): Comfortable
  - `space-600` (48px): Page sections

## Colors & Borders 🎨

- [ ] **Using design tokens (not hardcoded)**
  - ❌ `bg-white`, `text-gray-600`, `border-gray-200`
  - ✅ `bg-background`, `text-muted-foreground`, `border-border`

- [ ] **Border opacity consistent**
  - Standard: `border-border/60`
  - Interactive: `border-border`
  - Focus: `border-2 border-primary`

- [ ] **Dark mode compatibility checked**
  - All colors adapt to dark mode
  - Sufficient contrast in both modes
  - No hardcoded light/dark values

- [ ] **Semantic colors used appropriately**
  - Success: `text-success`, `bg-success-subtle`
  - Error: `text-destructive`, `bg-destructive`
  - Warning: `text-warning`, `bg-warning-subtle`
  - Info: `text-info`, `bg-info-subtle`

## Layout & Grid 📱

- [ ] **Mobile-first approach**
  - Start with mobile layout
  - Add breakpoints for larger screens

- [ ] **Standard breakpoints used**
  - `md:` 768px+ (tablets)
  - `lg:` 1024px+ (laptops)
  - `xl:` 1280px+ (desktops)
  - `2xl:` 1536px+ (large displays)

- [ ] **Grid columns responsive**

  ```tsx
  // Standard pattern
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
  ```

- [ ] **Text scales appropriately**
  - Headings responsive at 1024px+ and 1280px+
  - Body text remains readable
  - No horizontal scroll

## Accessibility ♿

- [ ] **Touch targets ≥ 44px**
  - Buttons, links, inputs meet minimum size
  - Icon buttons: `size="icon"` (36px × 36px)

- [ ] **Color contrast ≥ 4.5:1**
  - Normal text: 4.5:1
  - Large text (18px+): 3:1
  - Use design tokens (pre-validated)

- [ ] **Focus indicators visible**
  - Default: `focus-visible:ring-1 focus-visible:ring-ring`
  - Buttons: `focus-visible:ring-4`
  - No `outline-none` without alternative

- [ ] **Keyboard navigation works**
  - Tab through interactive elements
  - Enter/Space activates buttons
  - Escape closes modals
  - Arrow keys for lists/menus

- [ ] **ARIA labels present**
  ```tsx
  // Icon buttons MUST have labels
  <Button size="icon" aria-label="Close dialog">
    <X className="h-4 w-4" />
  </Button>
  ```

## Responsive Design 📱

- [ ] **Tested on mobile** (375px width minimum)
  - No horizontal scroll
  - Touch targets adequate
  - Text readable without zoom

- [ ] **Tested on tablet** (768px)
  - Layout adapts appropriately
  - Grid columns adjust
  - Navigation accessible

- [ ] **Tested on desktop** (1280px+)
  - Cards don't stretch too wide
  - Optimal column count
  - Efficient use of space

- [ ] **Tested on large displays** (1920px+)
  - Content doesn't become too sparse
  - Maximum 5 columns for cards
  - Maintains visual hierarchy

## Code Quality 💻

- [ ] **No inline styles**
  - ❌ `style={{ padding: '16px' }}`
  - ✅ `className="p-4"`

- [ ] **Reusing existing components**
  - Check `packages/ui/` first
  - Check feature components
  - Don't duplicate existing work

- [ ] **Following naming conventions**
  - Components: PascalCase
  - Files: kebab-case
  - Props: camelCase

- [ ] **TypeScript types complete**
  - Props fully typed
  - No `any` types
  - Interfaces documented

- [ ] **Comments for complex logic**
  - Why, not what
  - Edge cases explained
  - TODO items tracked

## Testing & Validation ✅

- [ ] **Visual regression tested**
  - Compare before/after
  - Check similar pages
  - Verify consistency

- [ ] **Tested in multiple browsers**
  - Chrome (latest)
  - Safari (latest)
  - Firefox (latest)

- [ ] **Mobile devices tested**
  - iOS Safari
  - Android Chrome
  - Various screen sizes

- [ ] **Dark mode tested**
  - Colors adapt correctly
  - Contrast maintained
  - Icons visible

- [ ] **Accessibility audit passed**
  - Axe DevTools scan
  - Keyboard navigation
  - Screen reader test

## Common Mistakes to Avoid ⚠️

1. **Using manual text classes**: Use `<Heading>` and `<Text>` components
2. **Hardcoded sizes**: Use `size` prop on buttons, `space-*` tokens for spacing
3. **Arbitrary values**: Stick to design system scale (4px increments)
4. **Inconsistent icons**: Match icon size to context
5. **Skipping responsive**: Always test mobile first
6. **Forgetting dark mode**: Use design tokens automatically
7. **Missing ARIA labels**: Icon buttons need labels
8. **Tight touch targets**: Minimum 44px for interactive elements

## Quick Fixes

### "My button is the wrong size"

```tsx
// ❌ Wrong
<Button className="h-10 px-6">Action</Button>

// ✅ Correct
<Button size="default">Action</Button>
```

### "My heading looks different from other pages"

```tsx
// ❌ Wrong
<h2 className="text-xl font-semibold">Section Title</h2>

// ✅ Correct
<Heading level={2}>Section Title</Heading>
```

### "My grid cards are too wide on large screens"

```tsx
// ❌ Wrong
<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

// ✅ Correct
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
```

### "My spacing doesn't match other pages"

```tsx
// ❌ Wrong
<div className="mt-5 mb-7 px-[18px]">

// ✅ Correct
<div className="p-6">
<Stack space="space-600">
```

## Resources

- [Design System](./design-system.md)
- [Typography Components](./typography-components.md)
- [Component Standards](./design-standardization-summary.md)
- [Implementation Plan](../plans/20251113-1026-design-system-standardization/plan.md)

## Questions?

If you're unsure about any design decision:

1. Check existing similar components
2. Review design system documentation
3. Ask in design channel
4. Refer to standardization plan

---

**Last Updated**: 2025-11-13
**Version**: 1.0
