# Phase 5: Remaining Features

**Date**: 2025-11-17
**Priority**: 🟢 Medium
**Status**: ⚪ Pending Phase 4 Completion
**Duration**: 4-5 days
**Assignees**: TBD

---

## Context

Phase 5 migrates remaining features: Team, Workspace, Auth, Support, Search, Notifications. Lower complexity than Active Tables/Workflows but needed for consistency.

**Dependencies**:

- ✅ Phase 4 completed (workflow patterns established)
- ✅ All core patterns documented

**Links**:

- [Main Plan](./plan.md)
- [Features Directory](../../apps/web/src/features/)

---

## Overview

**Goals**:

1. Migrate ~25 remaining feature files
2. Achieve 100% primitive coverage (exclude exceptions)
3. Standardize spacing across entire app
4. Document final edge cases

**Non-goals**:

- Refactoring feature logic
- Adding new features
- Changing authentication flow

---

## Key Insights from Phase 4

_(To be filled after Phase 4 completion)_

Expected learnings:

- Standardized card layouts
- Consistent dialog patterns
- List/grid hybrid layouts
- Empty state patterns

---

## Requirements

### Functional

- ✅ Preserve workspace dashboard layout
- ✅ Maintain team member list
- ✅ Keep role management functional
- ✅ Preserve login page layout
- ✅ Support help panel spacing
- ✅ Notification list layout

### Non-Functional

- ✅ Percy: 0 visual diffs
- ✅ TypeScript strict mode
- ✅ Auth flow unchanged
- ✅ Performance unchanged

---

## Architecture

### Target Files (25 files)

#### **Team Feature** (10 files)

1. `apps/web/src/features/team/components/team-list.tsx`
   - Team list view
2. `apps/web/src/features/team/components/team-card.tsx`
   - Individual team card
3. `apps/web/src/features/team/components/member-list.tsx`
   - Member list
4. `apps/web/src/features/team/components/member-form-modal.tsx`
   - Add/edit member modal
5. `apps/web/src/features/team/components/role-list.tsx`
   - Role list
6. `apps/web/src/features/team/components/role-form-modal.tsx`
   - Add/edit role modal
7. `apps/web/src/features/team/components/empty-team-list.tsx`
   - Empty state
8. `apps/web/src/features/team/components/empty-role-list.tsx`
   - Empty state
9. `apps/web/src/features/team/pages/team-page.tsx`
   - Team management page
10. `apps/web/src/features/team/pages/roles-page.tsx`
    - Roles management page

#### **Workspace Feature** (6 files)

11. ~~`apps/web/src/features/workspace/components/workspace-card-compact.tsx`~~
    - _(Already using primitives - reference)_
12. `apps/web/src/features/workspace/components/workspace-card.tsx`
    - Standard workspace card
13. `apps/web/src/features/workspace/components/workspace-create-form.tsx`
    - Create workspace form
14. `apps/web/src/features/workspace/components/workspace-empty-state.tsx`
    - Empty state
15. `apps/web/src/features/workspace/components/stat-badge.tsx`
    - Statistics badge
16. ~~`apps/web/src/features/workspace/pages/workspace-dashboard.tsx`~~
    - _(Partially migrated - verify and complete)_

#### **Auth Feature** (1 file)

17. `apps/web/src/features/auth/pages/login-page.tsx`
    - Login form page

#### **Support Feature** (3 files)

18. `apps/web/src/features/support/components/help-panel.tsx`
    - Help sidebar
19. `apps/web/src/features/support/components/help-article.tsx`
    - Article viewer
20. `apps/web/src/features/support/pages/support-page.tsx`
    - Support center page

#### **Search Feature** (2 files)

21. `apps/web/src/features/search/components/search-results.tsx`
    - Search results list
22. `apps/web/src/features/search/components/search-filter-panel.tsx`
    - Filter sidebar

#### **Notifications Feature** (3 files)

23. `apps/web/src/features/notifications/components/notification-list.tsx`
    - Notification list
24. `apps/web/src/features/notifications/components/notification-item.tsx`
    - Individual notification
25. `apps/web/src/features/notifications/pages/notifications-page.tsx`
    - Notifications page

---

## Migration Patterns

### Pattern 1: Team Card

```tsx
// ❌ BEFORE
<div className="p-6 border rounded-lg space-y-4">
  <div className="flex items-center justify-between">
    <h3>{team.name}</h3>
    <Badge>{team.memberCount}</Badge>
  </div>
  <div className="space-y-2">
    <p>{team.description}</p>
    <div className="flex gap-2">
      <Button size="sm">Edit</Button>
      <Button size="sm" variant="outline">Delete</Button>
    </div>
  </div>
</div>

// ✅ AFTER
<Box padding="space-300" border="default" borderRadius="lg">
  <Stack space="space-100">
    <Inline align="center" justify="between">
      <h3>{team.name}</h3>
      <Badge>{team.memberCount}</Badge>
    </Inline>
    <Stack space="space-050">
      <p>{team.description}</p>
      <Inline space="space-050">
        <Button size="sm">Edit</Button>
        <Button size="sm" variant="outline">Delete</Button>
      </Inline>
    </Stack>
  </Stack>
</Box>
```

### Pattern 2: Login Page (Centered Form)

```tsx
// ❌ BEFORE
<div className="min-h-screen flex items-center justify-center p-4">
  <div className="w-full max-w-md space-y-8">
    <div className="text-center space-y-2">
      <Logo />
      <h1>Welcome Back</h1>
    </div>
    <form className="space-y-6">
      <FormField />
      <FormField />
      <Button>Sign In</Button>
    </form>
  </div>
</div>

// ✅ AFTER
<div className="min-h-screen flex items-center justify-center">
  <Box padding="space-100" className="w-full max-w-md">
    <Stack space="space-400">
      <Stack space="space-050" align="center" className="text-center">
        <Logo />
        <h1>Welcome Back</h1>
      </Stack>
      <form>
        <Stack space="space-300">
          <FormField />
          <FormField />
          <Button>Sign In</Button>
        </Stack>
      </form>
    </Stack>
  </Box>
</div>
```

### Pattern 3: Notification Item

```tsx
// ❌ BEFORE
<div className="flex gap-3 p-4 border-b hover:bg-muted">
  <div className="w-2 h-2 rounded-full bg-primary mt-2" />
  <div className="flex-1 space-y-1">
    <p className="font-medium">{notification.title}</p>
    <p className="text-sm text-muted-foreground">{notification.message}</p>
    <span className="text-xs">{notification.time}</span>
  </div>
</div>

// ✅ AFTER
<Inline space="space-075" padding="space-100" className="border-b hover:bg-muted">
  <div className="w-2 h-2 rounded-full bg-primary mt-2" />
  <Stack space="space-025" className="flex-1">
    <p className="font-medium">{notification.title}</p>
    <p className="text-sm text-muted-foreground">{notification.message}</p>
    <span className="text-xs">{notification.time}</span>
  </Stack>
</Inline>
```

### Pattern 4: Search Results

```tsx
// ❌ BEFORE
<div className="grid grid-cols-4 gap-6">
  <div className="col-span-1 border-r pr-6">
    <FilterPanel />
  </div>
  <div className="col-span-3 space-y-4">
    {results.map(r => <ResultCard key={r.id} />)}
  </div>
</div>

// ✅ AFTER
<Grid columns={4} gap="space-300">
  <GridItem span={1}>
    <Box paddingInlineEnd="space-300" className="border-r">
      <FilterPanel />
    </Box>
  </GridItem>
  <GridItem span={3}>
    <Stack space="space-100">
      {results.map(r => <ResultCard key={r.id} />)}
    </Stack>
  </GridItem>
</Grid>
```

### Pattern 5: Help Article

```tsx
// ❌ BEFORE
<article className="prose max-w-none p-8 space-y-6">
  <h1>{article.title}</h1>
  <div className="space-y-4">
    {article.sections.map(s => (
      <section key={s.id} className="space-y-2">
        <h2>{s.title}</h2>
        <p>{s.content}</p>
      </section>
    ))}
  </div>
</article>

// ✅ AFTER
<Box as="article" padding="space-400" className="prose max-w-none">
  <Stack space="space-300">
    <h1>{article.title}</h1>
    <Stack space="space-100">
      {article.sections.map(s => (
        <Stack key={s.id} as="section" space="space-050">
          <h2>{s.title}</h2>
          <p>{s.content}</p>
        </Stack>
      ))}
    </Stack>
  </Stack>
</Box>
```

---

## Implementation Steps

### Step 1: Review Completed Phases (Day 1 - AM)

**1.1 Read Phase 1-4 reports**

- Consolidate all patterns
- Note any new edge cases

**1.2 Prioritize files by complexity**

- Simple cards first
- Complex pages last

---

### Step 2: Migrate Team Feature (Day 1 PM - Day 2)

**Day 1 PM**:

- `team-card.tsx`
- `team-list.tsx`
- `member-list.tsx`
- `empty-team-list.tsx`

**Day 2 AM**:

- `member-form-modal.tsx`
- `role-form-modal.tsx`
- `role-list.tsx`
- `empty-role-list.tsx`

**Day 2 PM**:

- `team-page.tsx`
- `roles-page.tsx`

---

### Step 3: Migrate Workspace Feature (Day 3 - AM)

**Files**:

1. ~~workspace-card-compact.tsx~~ (skip - already migrated)
2. `workspace-card.tsx` (use compact as reference)
3. `workspace-create-form.tsx`
4. `workspace-empty-state.tsx`
5. `stat-badge.tsx`
6. `workspace-dashboard.tsx` (verify/complete)

---

### Step 4: Migrate Auth, Support, Search (Day 3 PM - Day 4)

**Auth** (Day 3 PM):

- `login-page.tsx`

**Support** (Day 4 AM):

- `help-panel.tsx`
- `help-article.tsx`
- `support-page.tsx`

**Search** (Day 4 PM):

- `search-results.tsx`
- `search-filter-panel.tsx`

---

### Step 5: Migrate Notifications (Day 5 - AM)

**Files**:

1. `notification-list.tsx`
2. `notification-item.tsx`
3. `notifications-page.tsx`

---

### Step 6: Validate (Day 5 PM)

- Percy full suite
- Lighthouse audit
- Create Phase 5 report

---

## Todo List

**Day 1**:

- [ ] Review Phase 1-4 migration reports
- [ ] Consolidate pattern documentation
- [ ] Migrate team cards (4 files)

**Day 2**:

- [ ] Migrate team modals (2 files)
- [ ] Migrate team pages (2 files)
- [ ] Migrate role components (2 files)

**Day 3**:

- [ ] Migrate workspace feature (6 files)
- [ ] Migrate login page (1 file)
- [ ] Test auth flow end-to-end

**Day 4**:

- [ ] Migrate support feature (3 files)
- [ ] Migrate search feature (2 files)
- [ ] Test search functionality

**Day 5**:

- [ ] Migrate notifications (3 files)
- [ ] Run Percy suite
- [ ] Lighthouse audits
- [ ] Create Phase 5 report
- [ ] Team review + merge

---

## Success Criteria

**Must Have**:

- ✅ 23+ files migrated (92% target)
- ✅ Percy: 0 visual diffs
- ✅ TypeScript passes
- ✅ Auth flow functional
- ✅ Team/role management working

**Should Have**:

- ✅ All 25 files migrated (100%)
- ✅ Workspace dashboard responsive
- ✅ Notification list scrolling correctly
- ✅ Search results layout preserved

**Nice to Have**:

- ✅ Consistent spacing feel across all features
- ✅ Login page feels polished
- ✅ Ahead of schedule (< 4 days)

---

## Risk Assessment

| Risk                              | Probability | Impact   | Mitigation                         |
| --------------------------------- | ----------- | -------- | ---------------------------------- |
| Auth flow breaks                  | Low         | Critical | Test thoroughly, no logic changes  |
| Workspace dashboard layout shifts | Medium      | Medium   | Reference existing compact version |
| Notification overflow             | Low         | Low      | Test with many notifications       |
| Search filter misalignment        | Low         | Medium   | Test with long filter lists        |

**Rollback Plan**:

- Tag: `phase-4-complete`
- Per-feature rollback if needed
- Auth is critical - rollback entire auth if broken

---

## Security Considerations

- ⚠️ Login page: Ensure no accidental credential exposure during migration
- ✅ Test: Login → Navigate → Logout flow unchanged

---

## Next Steps

**After Phase 5 completion**:

1. Review migration report
2. Prepare for Phase 6 (Validation & Cleanup)
3. Coordinate final testing with QA team
