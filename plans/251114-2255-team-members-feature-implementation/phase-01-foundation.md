# Phase 1: Foundation & Routes

## Context

**Parent Plan**: [plan.md](./plan.md)
**Dependencies**: None
**Related Docs**:

- [TanStack Router Guide](../../apps/web/src/shared/route-helpers.md)
- [Route Constants](../../apps/web/src/shared/route-paths.ts)
- [Design System](../../docs/design-system.md)

## Overview

**Date**: 2025-11-14
**Description**: Setup route structure, page layouts, navigation flow
**Priority**: P0 (Foundational)
**Estimated Time**: 2-3 hours
**Implementation Status**: Completed
**Review Status**: Passed (Build successful)

## Key Insights

1. **File-based routing**: TanStack Router auto-generates from `src/routes/` structure
2. **Two-page pattern**: Teams list (workspace-level) + Team detail (team-level)
3. **Lazy loading**: All page components lazy loaded with Suspense
4. **Route constants**: Use ROUTES.WORKSPACE.TEAM for type-safe navigation
5. **Legacy navigation**: history.pushState → navigate() with getRouteApi()

## Requirements

### Functional

- Teams list route at `/$locale/workspaces/$workspaceId/team`
- Team detail route at `/$locale/workspaces/$workspaceId/team/$teamId`
- Navigation from teams list → team detail
- Back navigation from team detail → teams list
- Loading states during page transitions
- 404 handling for invalid teamId

### Non-Functional

- Type-safe route params with getRouteApi()
- Code splitting (lazy load pages)
- i18n message keys defined
- Accessible navigation (keyboard, screen reader)

## Architecture

### Route Structure

```
apps/web/src/routes/$locale/workspaces/$workspaceId/
├── team.tsx              # Teams list (existing placeholder)
└── team/
    └── $teamId.tsx       # Team detail (NEW)
```

### Component Structure

```
apps/web/src/features/team/
├── pages/
│   ├── teams-page.tsx        # Replace existing team-page.tsx
│   └── team-detail-page.tsx  # NEW team detail page
└── components/               # (Phase 2-4)
```

### Navigation Flow

```
Workspace Settings
    └─> Teams List (/team)
           └─> Team Detail (/team/:teamId)
                  └─> Back to Teams List
```

## Related Code Files

**Existing:**

- `apps/web/src/routes/$locale/workspaces/$workspaceId/team.tsx` (modify)
- `apps/web/src/features/team/pages/team-page.tsx` (replace)
- `apps/web/src/shared/route-paths.ts` (add constants)

**New:**

- `apps/web/src/routes/$locale/workspaces/$workspaceId/team/$teamId.tsx`
- `apps/web/src/features/team/pages/team-detail-page.tsx`

## Implementation Steps

### 1. Update Route Constants (5 min)

**File**: `apps/web/src/shared/route-paths.ts`

Add team routes to ROUTES.WORKSPACE:

```typescript
WORKSPACE: {
  // ... existing routes

  /** Team management: /$locale/workspaces/$workspaceId/team */
  TEAM: '/$locale/workspaces/$workspaceId/team' as const,

  /** Team detail: /$locale/workspaces/$workspaceId/team/$teamId */
  TEAM_DETAIL: '/$locale/workspaces/$workspaceId/team/$teamId' as const,

  // ... rest
}
```

Update ROUTE_GROUPS.WORKSPACE to include new routes.

### 2. Create Team Detail Route File (10 min)

**File**: `apps/web/src/routes/$locale/workspaces/$workspaceId/team/$teamId.tsx`

```typescript
import { createFileRoute } from '@tanstack/react-router';
import { lazy, Suspense } from 'react';

const TeamDetailPageLazy = lazy(() =>
  import('@/features/team/pages/team-detail-page').then((m) => ({
    default: m.TeamDetailPage,
  }))
);

export const Route = createFileRoute('/$locale/workspaces/$workspaceId/team/$teamId')({
  component: TeamDetailComponent,
});

function TeamDetailComponent() {
  return (
    <Suspense fallback={<div className="p-6">Loading team details...</div>}>
      <TeamDetailPageLazy />
    </Suspense>
  );
}
```

### 3. Create Teams List Page (30 min)

**File**: `apps/web/src/features/team/pages/teams-page.tsx`

```typescript
import { getRouteApi } from '@tanstack/react-router';
import { ROUTES } from '@/shared/route-paths';
import { Button } from '@workspace/ui/components/button';
import { Card, CardHeader, CardTitle, CardDescription } from '@workspace/ui/components/card';
import { Plus } from 'lucide-react';

const route = getRouteApi(ROUTES.WORKSPACE.TEAM);

export function TeamsPage() {
  const { workspaceId, locale } = route.useParams();
  const navigate = route.useNavigate();

  // TODO Phase 2: Add useGetTeams hook
  // TODO Phase 2: Add TeamList component
  // TODO Phase 2: Add CreateTeamModal

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Teams</h1>
          <p className="text-muted-foreground">
            Manage workspace teams and roles
          </p>
        </div>
        <Button onClick={() => {/* TODO: Open create modal */}}>
          <Plus className="h-4 w-4 mr-2" />
          Create Team
        </Button>
      </div>

      {/* Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Teams List</CardTitle>
          <CardDescription>
            Team list will appear here (Phase 2)
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}

export default TeamsPage;
```

### 4. Create Team Detail Page (30 min)

**File**: `apps/web/src/features/team/pages/team-detail-page.tsx`

```typescript
import { getRouteApi } from '@tanstack/react-router';
import { ROUTES } from '@/shared/route-paths';
import { Button } from '@workspace/ui/components/button';
import { Card, CardHeader, CardTitle, CardDescription } from '@workspace/ui/components/card';
import { ArrowLeft, Plus } from 'lucide-react';

const route = getRouteApi(ROUTES.WORKSPACE.TEAM_DETAIL);

export function TeamDetailPage() {
  const { workspaceId, teamId, locale } = route.useParams();
  const navigate = route.useNavigate();

  // TODO Phase 2: Add useGetTeam hook
  // TODO Phase 3: Add useGetRoles hook
  // TODO Phase 4: Add team users query

  const handleBackToTeams = () => {
    navigate({
      to: ROUTES.WORKSPACE.TEAM,
      params: { locale, workspaceId },
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={handleBackToTeams}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Team Settings</h1>
          <p className="text-muted-foreground">
            Team: {teamId} {/* TODO: Replace with team name */}
          </p>
        </div>
      </div>

      {/* Roles Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Roles</h2>
          <Button onClick={() => {/* TODO: Open create role modal */}}>
            <Plus className="h-4 w-4 mr-2" />
            Create Role
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Roles List</CardTitle>
            <CardDescription>
              Roles will appear here (Phase 3)
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Members Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Members</h2>
          <Button onClick={() => {/* TODO: Open add member modal */}}>
            <Plus className="h-4 w-4 mr-2" />
            Add Member
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Members List</CardTitle>
            <CardDescription>
              Team members will appear here (Phase 4)
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}

export default TeamDetailPage;
```

### 5. Update Team Route Entry Point (10 min)

**File**: `apps/web/src/routes/$locale/workspaces/$workspaceId/team.tsx`

```typescript
import { createFileRoute } from '@tanstack/react-router';
import { lazy, Suspense } from 'react';

const TeamsPageLazy = lazy(() =>
  import('@/features/team/pages/teams-page').then((m) => ({
    default: m.TeamsPage,
  }))
);

export const Route = createFileRoute('/$locale/workspaces/$workspaceId/team')({
  component: TeamComponent,
});

function TeamComponent() {
  return (
    <Suspense fallback={<div className="p-6">Loading teams...</div>}>
      <TeamsPageLazy />
    </Suspense>
  );
}
```

### 6. Add i18n Messages (15 min)

**File**: `messages/vi.json`

Add team-specific messages:

```json
{
  "team_page_title": "Quản lý đội nhóm",
  "team_page_description": "Quản lý đội nhóm và vai trò trong workspace",
  "team_create_button": "Tạo đội nhóm mới",
  "team_detail_title": "Cài đặt đội nhóm",
  "team_roles_section": "Vai trò",
  "team_members_section": "Thành viên",
  "team_back_to_list": "Quay lại danh sách",
  "role_create_button": "Tạo vai trò mới",
  "member_add_button": "Thêm thành viên"
}
```

**File**: `messages/en.json`

```json
{
  "team_page_title": "Manage Teams",
  "team_page_description": "Manage workspace teams and roles",
  "team_create_button": "Create Team",
  "team_detail_title": "Team Settings",
  "team_roles_section": "Roles",
  "team_members_section": "Members",
  "team_back_to_list": "Back to Teams",
  "role_create_button": "Create Role",
  "member_add_button": "Add Member"
}
```

### 7. Delete Old Placeholder (5 min)

**File**: `apps/web/src/features/team/pages/team-page.tsx`

Delete this file (replaced by teams-page.tsx).

Update exports in `apps/web/src/features/team/index.ts` if needed.

## Todo List

- [ ] Update route-paths.ts with TEAM and TEAM_DETAIL constants
- [ ] Create team/$teamId.tsx route file
- [ ] Create teams-page.tsx with basic layout
- [ ] Create team-detail-page.tsx with sections
- [ ] Update team.tsx route entry
- [ ] Add i18n messages (vi.json, en.json)
- [ ] Delete old team-page.tsx placeholder
- [ ] Test navigation: teams list ↔ team detail
- [ ] Verify route params extraction with getRouteApi()
- [ ] Check loading states and suspense fallbacks

## Success Criteria

- [ ] Routes accessible at correct URLs
- [ ] Navigation works bidirectionally
- [ ] Route params type-safe (no type assertions)
- [ ] Loading states display correctly
- [ ] i18n messages render properly
- [ ] No console errors or warnings
- [ ] Passes TypeScript strict mode checks

## Risk Assessment

**Low Risk:**

- Straightforward route setup
- Standard TanStack Router patterns
- No complex state needed yet

**Mitigation:**

- Follow existing route patterns in codebase
- Test navigation thoroughly
- Verify type safety with getRouteApi()

## Security Considerations

- Workspace context required (already enforced by parent route)
- Team ID validation (handled by API, 404 if not found)
- No sensitive data displayed yet (placeholder text only)

## Next Steps

After Phase 1 completion:
→ **Phase 2**: Implement team management UI (list, create, edit, delete)
