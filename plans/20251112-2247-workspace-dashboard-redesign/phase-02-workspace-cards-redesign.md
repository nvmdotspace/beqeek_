# Phase 2: Simplified Workspace Cards Redesign

**Date:** 2025-11-12
**Priority:** High
**Status:** ⏳ Pending (after Phase 1)
**Estimated Time:** 3 hours

## Context

Current workspace cards are cluttered with excessive information (manager details, creation date, workspace key badge, two bottom buttons), making them hard to scan and requiring two clicks to access a workspace. Need to simplify to Jira-inspired minimal design.

## Overview

Redesign workspace cards to show only essential information (avatar, name, optional key), make entire card clickable for navigation, and reveal additional actions on hover. Reduce card complexity while improving usability and scannability.

## Key Insights

### Current Problems

1. **Information Overload:** Manager avatar+name, creation date, key badge all visible
2. **Navigation Friction:** Two clicks required (card → "Modules" button)
3. **Visual Clutter:** Two bottom buttons add weight and complexity
4. **Hard to Scan:** Too much text per card slows down finding desired workspace
5. **Inefficient Space:** Cards are ~280-320px tall with low information density

### Jira's Space List Pattern (Reference)

- **Minimal Info:** Large space icon, space name, space key
- **One-Click Access:** Entire card is clickable
- **Hover Actions:** Favorite/star button appears on hover
- **Clean Layout:** ~120-140px height, highly scannable
- **Visual Focus:** Icon and name dominate, key is subtle

### Design Opportunities

1. **Reduce Height:** From ~300px to ~120-140px (55-60% reduction)
2. **One-Click Navigation:** Click anywhere on card → Go to workspace modules
3. **Progressive Disclosure:** Show additional info on hover only
4. **Better Scanning:** Large icon + name + subtle key
5. **Consistent Spacing:** Use space-200, space-300 from design system

## Requirements

### Functional Requirements

- ✅ Display workspace avatar/icon (prominent)
- ✅ Display workspace name (clickable, prominent)
- ✅ Display workspace key (subtle, optional)
- ✅ Entire card clickable → Navigate to workspace modules page
- ✅ Hover state reveals favorite/star action
- ✅ Responsive grid (1-3 columns based on viewport)
- ✅ Loading states with skeletons

### Non-Functional Requirements

- ✅ Card height: ~120-140px (reduce from ~300px)
- ✅ Smooth hover transitions (200-300ms)
- ✅ Keyboard accessible (tab navigation, Enter to activate)
- ✅ WCAG AA contrast and focus indicators
- ✅ Design system tokens only

## Architecture

### Component Structure

```tsx
<Grid columns={12} gap="space-300">
  <GridItem span={12} spanMd={6} spanLg={4}>
    <WorkspaceCard
      workspace={workspace}
      onClick={() => navigate({ to: ROUTES.WORKSPACE.MODULES })}
      onFavorite={(id) => toggleFavorite(id)}
    />
  </GridItem>
</Grid>
```

### Card Internal Structure

```tsx
<Box
  as="button" // Semantic HTML for clickable card
  padding="space-300"
  backgroundColor="card"
  borderRadius="lg"
  border="default"
  className="group relative hover:shadow-md transition-all"
>
  {/* Favorite Button - Visible on hover */}
  <button className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
    <Star />
  </button>

  {/* Main Content */}
  <Stack space="space-200" align="center">
    {/* Avatar - Large */}
    <Avatar size="xl" src={workspace.avatar} />

    {/* Workspace Name */}
    <Heading level={3} className="text-center">
      {workspace.name}
    </Heading>

    {/* Workspace Key - Subtle */}
    <Badge variant="outline" size="sm" className="text-muted-foreground">
      {workspace.key}
    </Badge>
  </Stack>
</Box>
```

### Design Tokens to Use

- **Spacing:**
  - Card padding: `space-300` (24px)
  - Internal gaps: `space-200` (16px)
  - Grid gaps: `space-300` (24px)
- **Colors:**
  - Background: `bg-card`
  - Border: `border-border`
  - Hover shadow: Built-in shadow utilities
  - Key badge: `text-muted-foreground`
- **Typography:**
  - Name: Heading level 3 (18-20px)
  - Key: Badge (small, 12-13px)

## Related Code Files

### To Modify

- `apps/web/src/features/workspace/pages/workspace-dashboard.tsx` (lines 160-172)
  - Update WorkspaceGrid usage to use new card design

### To Create

- `apps/web/src/features/workspace/components/workspace-card-compact.tsx` (new component)
  - Simplified clickable card component

### To Reference

- `packages/ui/src/components/primitives/box.tsx` - Polymorphic card wrapper
- `packages/ui/src/components/primitives/stack.tsx` - Vertical layout
- `packages/ui/src/components/avatar.tsx` - Avatar component
- `packages/ui/src/components/badge.tsx` - Key badge
- `apps/web/src/shared/route-paths.ts` - Navigation constants

## Implementation Steps

### Step 1: Create WorkspaceCardCompact Component

```tsx
// apps/web/src/features/workspace/components/workspace-card-compact.tsx
import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Star } from 'lucide-react';
import { Box, Stack } from '@workspace/ui/components/primitives';
import { Heading } from '@workspace/ui/components/typography';
import { Avatar } from '@workspace/ui/components/avatar';
import { Badge } from '@workspace/ui/components/badge';
import { cn } from '@workspace/ui/lib/utils';
import { ROUTES } from '@/shared/route-paths';
import type { Workspace } from '../types';

interface WorkspaceCardCompactProps {
  workspace: Workspace;
  onFavorite?: (workspaceId: string) => void;
}

export const WorkspaceCardCompact = ({ workspace, onFavorite }: WorkspaceCardCompactProps) => {
  const navigate = useNavigate();
  const [isFavorited, setIsFavorited] = useState(workspace.isFavorited ?? false);

  const handleClick = () => {
    navigate({
      to: ROUTES.ACTIVE_TABLES.LIST,
      params: { workspaceId: workspace.id, locale: 'vi' }, // TODO: Get locale from context
    });
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    setIsFavorited(!isFavorited);
    onFavorite?.(workspace.id);
  };

  return (
    <Box
      as="button"
      padding="space-300"
      backgroundColor="card"
      borderRadius="lg"
      border="default"
      onClick={handleClick}
      className={cn(
        'group relative w-full',
        'transition-all duration-200',
        'hover:shadow-md hover:border-primary/20',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        'cursor-pointer',
      )}
    >
      {/* Favorite Button - Hover State */}
      <button
        onClick={handleFavorite}
        className={cn(
          'absolute top-4 right-4 p-1.5 rounded-md',
          'transition-opacity duration-200',
          'opacity-0 group-hover:opacity-100',
          'hover:bg-muted',
          'focus-visible:opacity-100',
        )}
        aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
      >
        <Star className={cn('h-4 w-4', isFavorited ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground')} />
      </button>

      {/* Main Content */}
      <Stack space="space-200" align="center">
        {/* Avatar - Large */}
        <Avatar
          src={workspace.avatar}
          alt={workspace.name}
          size="xl" // ~64px
          className="ring-2 ring-border"
        />

        {/* Workspace Name */}
        <Heading level={3} className="text-center line-clamp-2">
          {workspace.name}
        </Heading>

        {/* Workspace Key - Subtle */}
        {workspace.key && (
          <Badge variant="outline" className="text-xs text-muted-foreground">
            {workspace.key}
          </Badge>
        )}
      </Stack>
    </Box>
  );
};
```

### Step 2: Update WorkspaceGrid Component

```tsx
// Update apps/web/src/features/workspace/components/workspace-grid.tsx
import { Grid, GridItem } from '@workspace/ui/components/primitives';
import { WorkspaceCardCompact } from './workspace-card-compact';
import type { Workspace } from '../types';

interface WorkspaceGridProps {
  workspaces: Workspace[];
  onFavorite?: (workspaceId: string) => void;
}

export const WorkspaceGrid = ({ workspaces, onFavorite }: WorkspaceGridProps) => {
  return (
    <Grid columns={12} gap="space-300">
      {workspaces.map((workspace) => (
        <GridItem key={workspace.id} span={12} spanMd={6} spanLg={4}>
          <WorkspaceCardCompact workspace={workspace} onFavorite={onFavorite} />
        </GridItem>
      ))}
    </Grid>
  );
};
```

### Step 3: Update Dashboard Page

```tsx
// In workspace-dashboard.tsx, ensure WorkspaceGrid usage is correct
{
  !isLoading && !error && totalWorkspaces > 0 && (
    <div className="space-y-[var(--space-400)]">
      <div className="flex items-center justify-between">
        <Heading level={2}>{m.workspace_dashboard_listTitle()}</Heading>
        <Text size="small" color="muted">
          {totalWorkspaces} {m.workspace_dashboard_workspaces()}
        </Text>
      </div>
      <WorkspaceGrid
        workspaces={workspaces}
        onFavorite={(id) => console.log('Toggle favorite:', id)} // TODO: Implement
      />
    </div>
  );
}
```

### Step 4: Add Hover Animations

```tsx
// In WorkspaceCardCompact
<Box
  // ... other props
  className={cn(
    'group relative w-full',
    'transition-all duration-200 ease-in-out',
    'hover:shadow-lg hover:shadow-primary/5',
    'hover:border-primary/30',
    'hover:-translate-y-0.5', // Subtle lift effect
    'active:translate-y-0', // Reset on click
    // ... other classes
  )}
>
```

### Step 5: Responsive Grid Behavior

```tsx
<Grid columns={12} gap="space-300">
  <GridItem
    span={12} // Mobile: 1 column (full width)
    spanMd={6} // Tablet: 2 columns
    spanLg={4} // Desktop: 3 columns
  >
    <WorkspaceCardCompact />
  </GridItem>
</Grid>
```

### Step 6: Keyboard Navigation

```tsx
// Ensure keyboard accessibility
<Box
  as="button"
  type="button"
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }}
  aria-label={`Open ${workspace.name} workspace`}
  // ... other props
>
```

## Todo List

- [ ] Create `workspace-card-compact.tsx` component
- [ ] Import primitives (Box, Stack, Grid, GridItem)
- [ ] Implement click handler with TanStack Router navigation
- [ ] Add favorite/star button with hover state
- [ ] Style hover transitions and lift effect
- [ ] Add keyboard navigation support
- [ ] Update WorkspaceGrid to use new component
- [ ] Remove old WorkspaceCard with buttons
- [ ] Test on mobile (xs, sm breakpoints)
- [ ] Test on tablet (md breakpoint)
- [ ] Test on desktop (lg, xl, 2xl breakpoints)
- [ ] Validate keyboard navigation (Tab, Enter, Space)
- [ ] Validate screen reader announcements
- [ ] Test favorite toggle functionality

## Success Criteria

### Visual

- ✅ Card height ≤140px (down from ~300px)
- ✅ Clean, minimal design matching Jira's aesthetic
- ✅ Large, prominent workspace icon/avatar
- ✅ Smooth hover animations and lift effect
- ✅ Favorite button reveals on hover

### Functional

- ✅ One-click navigation to workspace modules
- ✅ Entire card is clickable (not just name)
- ✅ Favorite toggle works without navigating
- ✅ Responsive grid (1-3 columns based on viewport)
- ✅ Keyboard accessible (Tab + Enter)
- ✅ Screen reader compatible

### Technical

- ✅ 100% design system token usage
- ✅ Semantic HTML (button element for card)
- ✅ Type-safe TypeScript
- ✅ TanStack Router integration
- ✅ Zero hardcoded values
- ✅ Performance optimized

## Risk Assessment

### Medium Risk

- **User Adaptation:** Users accustomed to two-button layout
  - **Mitigation:** Better UX with one-click access, clearer affordances
- **Favorite Interaction:** Stop propagation might be missed
  - **Mitigation:** Test thoroughly, add visible hover state

### Low Risk

- Component is isolated and easy to test
- Router navigation is well-established pattern
- Design system provides all needed primitives

## Security Considerations

- No security implications (UI-only changes)
- Uses existing secure workspace data from API
- Navigation uses established routing patterns

## Next Steps

After Phase 2 completion:

1. Gather user feedback on simplified cards
2. Measure click-through rate improvement
3. Consider adding workspace description on hover (optional)
4. Proceed to Phase 3: Component Integration & Testing

---

**Status:** Ready for implementation (after Phase 1)
**Dependencies:** Phase 1 (Statistics Redesign)
**Blocking:** None
