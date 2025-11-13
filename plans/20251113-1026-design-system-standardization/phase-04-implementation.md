# Phase 4: Implementation

**Phase**: 04
**Status**: 📋 Planned
**Date**: 2025-11-13
**Priority**: High
**Dependencies**: Phases 1-3 complete

## Context

- [Main Plan](plan.md)
- [Phase 2: Typography](phase-02-typography-standardization.md)
- [Phase 3: Component Sizing](phase-03-component-sizing.md)

## Overview

Systematically implement all typography, sizing, and spacing standardizations across the application following the specifications from Phases 2-3.

## Implementation Strategy

### Approach: Page-by-Page

1. Start with lower-traffic pages (Workspace Dashboard)
2. Move to higher-traffic pages (Modules)
3. Apply learnings to remaining pages
4. Verify consistency across all pages

### Testing Protocol

- Visual regression testing after each page
- Accessibility audit for each page
- Cross-browser verification (Chrome, Safari, Firefox)
- Mobile responsiveness check

## Implementation Sequence

### Batch 1: Workspace Dashboard (Priority 1)

**File**: `apps/web/src/features/workspace/pages/workspace-dashboard.tsx`

#### Changes:

```tsx
// 1. Page Title
// Before:
<Heading level={2} className="text-2xl font-bold">
  {m.workspace_dashboard_title()}
</Heading>

// After:
<Heading level={1}>
  {m.workspace_dashboard_title()}
</Heading>

// 2. Section Headers
// Before:
<Heading level={3} className="text-lg font-semibold">
  Tổng quan
</Heading>

// After:
<Heading level={2}>
  Tổng quan
</Heading>

// 3. Section Spacing
// Verify: <Stack space="space-600"> for main sections

// 4. Grid Gaps
// Before: gap-[var(--space-300)]
// After: gap-4 (for consistency with modules page)
```

**Testing**:

- [ ] Page title renders correctly
- [ ] Section headers consistent
- [ ] Stat badges aligned properly
- [ ] Workspace cards display correctly
- [ ] No layout shifts

### Batch 2: Modules Page (Priority 1)

**File**: `apps/web/src/features/active-tables/pages/active-tables-page.tsx`

#### Changes:

```tsx
// 1. Page Title
// Verify: Already uses <Heading level={1}>

// 2. Button Sizing
// Before:
<Button variant="outline" size="sm" onClick={handleCreateTable}>
  <Plus className="mr-1.5 h-3.5 w-3.5" />
  Create
</Button>

// After: Verify size="sm" is consistent (h-8)

// 3. Section Headers
// Verify: <Heading level={2}> for "Ungrouped" and workgroup names

// 4. Filter Buttons
// Standardize all filter buttons to size="sm" (h-8)

// 5. Grid Gap
// Before: gap-6
// After: gap-4 (for consistency)
```

**Testing**:

- [ ] Filter buttons same height
- [ ] Grid spacing consistent
- [ ] Cards render at correct size
- [ ] Stat badges aligned
- [ ] Search input matches buttons

### Batch 3: Card Components (Priority 2)

#### ActiveTableCard

**File**: `apps/web/src/features/active-tables/components/active-table-card.tsx`

```tsx
// 1. Card Title
// Before:
<Text weight="medium" className="truncate">
  {table.name}
</Text>

// After:
<Heading level={4} className="truncate">
  {table.name}
</Heading>

// 2. Icon Sizes
// Verify: Module icon h-4.5 w-4.5 → h-5 w-5 (standardize)
// Verify: Metadata icons h-3 w-3 (correct for small context)

// 3. Badge Sizes
// Verify: Encryption badge h-4 px-1 (correct for xs)
// Verify: Module type badge text-[10px] → use standard badge size

// 4. Padding
// Verify: p-4 (correct for compact cards)
```

#### WorkspaceCardCompact

**File**: `apps/web/src/features/workspace/components/workspace-card-compact.tsx`

```tsx
// 1. Avatar Size
// Verify: Consistent sizing (h-9 w-9 or h-10 w-10)

// 2. Card Padding
// Verify: p-4 or p-6 (document the standard)

// 3. Text Sizing
// Verify: Uses <Text> component with proper sizes
```

### Batch 4: StatBadge Component (Priority 2)

**File**: `apps/web/src/features/workspace/components/stat-badge.tsx`

```tsx
// Verify icon sizes are consistent
// Currently: h-6 w-6 container, h-4 w-4 icon
// Consider: Increase to h-5 w-5 icon for better visibility

// Standardize padding
// Current: p-2
// Verify this matches design system
```

## Detailed Implementation Steps

### Step 1: Typography Migration (4 hours)

1. **Workspace Dashboard** (1 hour)
   - Replace manual heading classes with `<Heading>` component
   - Update section headers to H2
   - Verify body text uses `<Text>` component

2. **Modules Page** (1 hour)
   - Verify heading hierarchy
   - Standardize card titles to H4
   - Update filter labels

3. **Card Components** (2 hours)
   - Update ActiveTableCard title
   - Update WorkspaceCardCompact title
   - Verify all text elements

### Step 2: Button Standardization (2 hours)

1. **Primary Actions** (30 min)
   - Verify "Create" buttons: size="default"
   - Verify icon buttons: size="icon"

2. **Filter Buttons** (1 hour)
   - Standardize all to size="sm"
   - Verify icon sizes (h-3.5 w-3.5)

3. **Dropdown Triggers** (30 min)
   - Verify menu buttons consistent

### Step 3: Spacing Adjustments (2 hours)

1. **Page Containers** (30 min)
   - Standardize to p-6
   - Verify responsive padding

2. **Section Spacing** (30 min)
   - Use space-600 between major sections
   - Use gap-4 between section items

3. **Grid Layouts** (1 hour)
   - Standardize gaps: gap-4
   - Verify responsive breakpoints

## Code Review Checklist

Before merging each batch:

### Typography

- [ ] No manual text-\* classes on headings
- [ ] All headings use `<Heading>` component
- [ ] Body text uses `<Text>` component
- [ ] Metrics use `<Metric>` component

### Sizing

- [ ] Buttons use size prop (no h-\* classes)
- [ ] Icons appropriate for context
- [ ] Cards follow padding standards
- [ ] Badges use standard sizes

### Spacing

- [ ] Page padding consistent (p-6)
- [ ] Section spacing using tokens
- [ ] Grid gaps standardized
- [ ] No arbitrary values

### Consistency

- [ ] Similar elements look identical
- [ ] Hierarchy clear and intentional
- [ ] Dark mode tested
- [ ] Mobile responsive

## Testing & QA

### Visual Regression

```bash
# Take screenshots before changes
npm run screenshot:before

# Make changes

# Take screenshots after changes
npm run screenshot:after

# Compare
npm run screenshot:diff
```

### Manual Testing

**Browser Testing**:

- [ ] Chrome (latest)
- [ ] Safari (latest)
- [ ] Firefox (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

**Responsive Testing**:

- [ ] Mobile (375px)
- [ ] Tablet (768px)
- [ ] Desktop (1024px)
- [ ] Large Desktop (1440px)
- [ ] 4K (2560px)

**Accessibility Testing**:

- [ ] Keyboard navigation
- [ ] Screen reader (NVDA/JAWS)
- [ ] Color contrast (WCAG AA)
- [ ] Touch target sizes (44px min)

### Automated Tests

```bash
# Run lint
pnpm lint

# Run type check
pnpm --filter web check-types

# Run build
pnpm build

# Run tests
pnpm test
```

## Risk Mitigation

| Risk                   | Probability | Impact | Mitigation                                   |
| ---------------------- | ----------- | ------ | -------------------------------------------- |
| Layout shifts          | Medium      | High   | Test before/after, use fixed dimensions      |
| Breaking changes       | Low         | High   | Gradual rollout, feature flags               |
| Performance regression | Low         | Medium | Monitor bundle size, test render performance |
| Accessibility issues   | Medium      | High   | Automated testing, manual audit              |
| User confusion         | Low         | Low    | Changes are subtle, progressive disclosure   |

## Rollback Plan

If critical issues arise:

1. **Immediate**: Revert commit
2. **Identify**: Root cause analysis
3. **Fix**: Address specific issue
4. **Re-deploy**: With fix applied
5. **Monitor**: Extra attention for 24h

## Success Metrics

### Quantitative

- Zero manual font-size classes on headings
- Zero manual height classes on buttons
- <5% bundle size increase
- No accessibility regressions
- 100% pages following standard

### Qualitative

- Visual consistency across pages
- Clear hierarchy
- Professional appearance
- Improved maintainability

## Deployment Strategy

### Phase 4a: Dev/Staging (Day 1)

- Deploy to development
- Internal testing
- Gather feedback

### Phase 4b: Production Rollout (Day 2)

- Deploy during low-traffic period
- Monitor error rates
- Quick rollback if needed

### Phase 4c: Monitoring (Day 3-7)

- Watch user feedback
- Monitor performance
- Address any issues

## Post-Implementation

After successful deployment:

1. Update design system documentation
2. Create before/after comparison
3. Document lessons learned
4. Share with team
5. Plan future improvements

## Next Steps

Proceed to [Phase 5: Documentation](phase-05-documentation.md)

## References

- [Component Implementation Guide](../../docs/design-system.md#components)
- [Typography Migration](../../docs/typography-components.md)
- [Testing Guide](../../docs/testing.md)
