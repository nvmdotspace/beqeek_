# Phase 1: Compact Statistics Redesign

**Date:** 2025-11-12
**Priority:** High
**Status:** 🚧 In Progress
**Estimated Time:** 2 hours

## Context

Current statistics cards occupy excessive vertical space (~150px height per card) with 5 cards in a grid, pushing primary content below the fold. Need to reduce to ~70px height while maintaining readability and visual hierarchy.

## Overview

Redesign statistics section from large individual cards to a compact horizontal stats bar, reducing vertical space by 50-60% while maintaining all information and improving scannability.

## Key Insights

### Current Problems

1. **Excessive Height:** Cards are ~150px tall with large padding
2. **Wasted Space:** Large icon circles (~40px) and generous padding
3. **Below Fold:** Workspace list pushed down, requiring scroll on load
4. **Inefficient Grid:** 4-5 columns create wide gaps on large screens

### Design Opportunities

1. **Compact Layout:** Horizontal arrangement with minimal padding
2. **Smaller Icons:** Reduce from ~40px to ~20-24px
3. **Tighter Typography:** Smaller numbers and labels
4. **Single Row:** All stats in one scannable line
5. **Design System:** Use space-200, space-150 for tight spacing

## Requirements

### Functional Requirements

- ✅ Display all 5 statistics (workspaces, modules, tables, workflows, team)
- ✅ Maintain visual distinction between metrics
- ✅ Preserve accent colors for categorization
- ✅ Responsive behavior (stack on mobile if needed)
- ✅ Accessible labels and semantic HTML

### Non-Functional Requirements

- ✅ Height: ≤70px (reduce from ~150px)
- ✅ Loading states: Skeleton loaders
- ✅ Smooth transitions: Fade-in animation
- ✅ WCAG AA contrast ratios
- ✅ Design system tokens only

## Architecture

### Component Structure

```tsx
<Inline space="space-200" align="center" wrap>
  {' '}
  {/* Horizontal layout */}
  <StatBadge icon={Folder} value={totalWorkspaces} label="Workspaces" color="accent-blue" />
  <StatBadge icon={Table} value={24} label="Modules" color="primary" />
  {/* ...more stats */}
</Inline>
```

### Design Tokens to Use

- **Spacing:** `space-150` (12px), `space-200` (16px)
- **Colors:**
  - Workspaces: `accent-blue` + `accent-blue-subtle`
  - Modules: `primary` + `primary/10`
  - Tables: `success` + `success-subtle`
  - Workflows: `accent` + `accent-subtle`
  - Team: `warning` + `warning-subtle`
- **Typography:** Metric component (size="small")

## Related Code Files

### To Modify

- `apps/web/src/features/workspace/pages/workspace-dashboard.tsx` (lines 48-105)
  - Replace statistics grid with compact Inline layout

### To Create

- `apps/web/src/features/workspace/components/stat-badge.tsx` (new component)
  - Compact badge-style statistics component

### References

- `packages/ui/src/components/primitives/inline.tsx` - Use for horizontal layout
- `packages/ui/src/components/badge.tsx` - Reference for badge styling
- `packages/ui/src/components/typography.tsx` - Metric component

## Implementation Steps

### Step 1: Create StatBadge Component

```tsx
// apps/web/src/features/workspace/components/stat-badge.tsx
import { Box, Inline } from '@workspace/ui/components/primitives';
import { Metric } from '@workspace/ui/components/typography';
import { cn } from '@workspace/ui/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface StatBadgeProps {
  icon: LucideIcon;
  value: number;
  label: string;
  color?: string;
  loading?: boolean;
}

export const StatBadge = ({ icon: Icon, value, label, color = 'primary', loading }: StatBadgeProps) => {
  if (loading) {
    return <Skeleton className="h-[60px] w-[140px] rounded-lg" />;
  }

  return (
    <Box padding="space-200" backgroundColor="card" borderRadius="lg" border="default" className="min-w-[140px]">
      <Inline space="space-150" align="center">
        <div className={cn('h-6 w-6 rounded-md flex items-center justify-center', `bg-${color}-subtle`)}>
          <Icon className={cn('h-4 w-4', `text-${color}`)} />
        </div>
        <div className="flex flex-col gap-0.5">
          <Metric size="small" value={value} />
          <Text size="small" color="muted">
            {label}
          </Text>
        </div>
      </Inline>
    </Box>
  );
};
```

### Step 2: Update Dashboard Layout

```tsx
// In workspace-dashboard.tsx, replace lines 48-105

{
  /* Compact Statistics Bar */
}
{
  !isLoading && !error && totalWorkspaces > 0 && (
    <Inline space="space-200" align="center" wrap className="pb-2">
      <StatBadge
        icon={Folder}
        value={totalWorkspaces}
        label={m.workspace_dashboard_totalWorkspaces()}
        color="accent-blue"
        loading={isLoading}
      />
      <StatBadge
        icon={Table}
        value={24}
        label={m.workspace_dashboard_activeTables()}
        color="primary"
        loading={isLoading}
      />
      <StatBadge
        icon={Table}
        value={24}
        label={m.workspace_dashboard_activeTables()}
        color="success"
        loading={isLoading}
      />
      <StatBadge icon={Zap} value={8} label={m.workspace_dashboard_workflows()} color="accent" loading={isLoading} />
      <StatBadge
        icon={Users}
        value={15}
        label={m.workspace_dashboard_teamMembers()}
        color="warning"
        loading={isLoading}
      />
    </Inline>
  );
}
```

### Step 3: Add Responsive Behavior

```tsx
// Mobile: Stack vertically
// Tablet: 2-3 per row
// Desktop: All in one row

<Inline
  space="space-200"
  align="center"
  wrap
  className="gap-y-[var(--space-200)]" // Vertical gap when wrapped
>
  {/* Stats */}
</Inline>
```

### Step 4: Test & Refine

- ✅ Verify height ≤70px at all breakpoints
- ✅ Check icon sizes (should be ~20-24px)
- ✅ Validate color contrast
- ✅ Test loading states
- ✅ Verify responsive wrapping

## Todo List

- [ ] Create `stat-badge.tsx` component
- [ ] Import Inline primitive from design system
- [ ] Replace Card grid with Inline layout in dashboard
- [ ] Apply design system spacing tokens
- [ ] Add responsive wrapping behavior
- [ ] Implement loading skeleton states
- [ ] Test on mobile (xs, sm breakpoints)
- [ ] Test on desktop (md, lg, xl, 2xl breakpoints)
- [ ] Validate WCAG AA contrast
- [ ] Remove old Card-based statistics code

## Success Criteria

### Visual

- ✅ Statistics section height ≤70px (down from ~150px)
- ✅ All 5 statistics visible in compact format
- ✅ Icons are ~20-24px (down from ~40px)
- ✅ Consistent spacing using design tokens
- ✅ Professional, polished appearance

### Functional

- ✅ Responsive at all breakpoints (xs to 2xl)
- ✅ Loading states display correctly
- ✅ Smooth fade-in transitions
- ✅ Accessible keyboard navigation
- ✅ Screen reader compatible

### Technical

- ✅ 100% design system token usage
- ✅ Zero hardcoded spacing/colors
- ✅ TypeScript type-safe
- ✅ Reusable StatBadge component
- ✅ Performance optimized (<100ms render)

## Risk Assessment

### Low Risk

- Component is simple and isolated
- Design system provides all needed primitives
- No API changes required
- Easy to revert if issues arise

### Mitigation

- Create reusable component for future use
- Test thoroughly at all breakpoints
- Validate with design system tokens
- Keep old code commented for easy rollback

## Security Considerations

- No security implications (display-only component)
- No user input or data processing
- Uses existing workspace data from secure API

## Next Steps

After Phase 1 completion:

1. Gather feedback on compact statistics
2. Measure vertical space savings
3. Proceed to Phase 2: Workspace Cards Redesign
4. Consider adding tooltips for additional stat details (optional)

---

**Status:** Ready for implementation
**Dependencies:** Beqeek Design System (complete)
**Blocking:** None
