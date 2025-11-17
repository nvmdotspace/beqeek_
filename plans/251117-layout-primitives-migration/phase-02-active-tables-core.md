# Phase 2: Active Tables Core Pages

**Date**: 2025-11-17
**Priority**: 🟡 High
**Status**: ⚪ Pending Phase 1 Completion
**Duration**: 5-6 days
**Assignees**: TBD

---

## Context

Phase 2 scales pilot learnings to migrate ~20 core Active Tables pages and components. Focuses on record management UI (lists, kanban, gantt, comments) - the most user-facing surfaces.

**Dependencies**:

- ✅ Phase 1 completed successfully (8-10 files migrated)
- ✅ Migration patterns documented
- ✅ Percy baseline testing established
- ✅ Primitive enhancements merged (if any from Phase 1)

**Links**:

- [Main Plan](./plan.md)
- [Phase 1 Report](./phase-01-migration-report.md) _(created after Phase 1)_
- [Active Tables Feature](../../apps/web/src/features/active-tables/)

---

## Overview

**Goals**:

1. Migrate all core Active Tables pages (~10 pages)
2. Migrate critical record components (~10 components)
3. Maintain 100% visual parity (Percy baseline)
4. Document new edge cases discovered

**Non-goals**:

- Settings pages (saved for Phase 3)
- Field-specific components (Phase 3)
- Experimental features (if any)

---

## Key Insights from Phase 1

_(To be filled after Phase 1 completion)_

Expected learnings:

- Common padding patterns for dialogs
- Grid layout challenges (if any)
- TypeScript patterns for polymorphic refs
- Responsive spacing edge cases

---

## Requirements

### Functional

- ✅ Preserve record list layouts (table, kanban, gantt)
- ✅ Maintain comment panel spacing
- ✅ Preserve quick filter chip alignment
- ✅ Keep modal dialog padding consistent
- ✅ Maintain responsive breakpoints (mobile/desktop)

### Non-Functional

- ✅ Percy visual regression: 0 unapproved diffs
- ✅ TypeScript strict mode compliance
- ✅ No performance degradation (Lighthouse ±2)
- ✅ Bundle size increase < 3KB (incremental)

---

## Architecture

### Target Files (20 files)

#### **Core Pages** (10 files)

1. ~~`active-table-records-page.tsx`~~ _(migrated in Phase 1)_
2. ~~`record-detail-page.tsx`~~ _(migrated in Phase 1)_
3. `apps/web/src/features/active-tables/pages/active-table-list-page.tsx`
   - Main table list (if different from active-tables-page)
4. `apps/web/src/features/active-tables/components/record-list/generic-table-view.tsx`
   - Record table view
5. `apps/web/src/features/active-tables/components/record-list/kanban-view.tsx`
   - Kanban board layout
6. `apps/web/src/features/active-tables/components/record-list/gantt-view.tsx`
   - Gantt chart layout
7. `apps/web/src/features/active-tables/components/record-detail/record-header.tsx`
   - Record detail header
8. `apps/web/src/features/active-tables/components/record-detail/record-fields.tsx`
   - Field renderer layout
9. `apps/web/src/features/active-tables/components/comments/comments-panel.tsx`
   - Comments sidebar/panel
10. `apps/web/src/features/active-tables/components/comments/comment-item.tsx`
    - Individual comment layout

#### **Record Management Components** (10 files)

11. `apps/web/src/features/active-tables/components/record-actions-bar.tsx`
    - Action toolbar (bulk actions)
12. `apps/web/src/features/active-tables/components/record-filters.tsx`
    - Filter controls
13. ~~`apps/web/src/features/active-tables/components/quick-filters-bar.tsx`~~ _(Phase 1)_
14. `apps/web/src/features/active-tables/components/record-card.tsx`
    - Individual record card (kanban)
15. `apps/web/src/features/active-tables/components/column-header.tsx`
    - Table column headers
16. `apps/web/src/features/active-tables/components/pagination-controls.tsx`
    - Pagination bar
17. `apps/web/src/features/active-tables/components/view-switcher.tsx`
    - Layout switcher (table/kanban/gantt)
18. `apps/web/src/features/active-tables/components/bulk-actions-dialog.tsx`
    - Bulk edit modal
19. `apps/web/src/features/active-tables/components/record-import-dialog.tsx`
    - Import records modal
20. `apps/web/src/features/active-tables/components/record-export-dialog.tsx`
    - Export records modal

---

## Migration Patterns

### Pattern 1: Kanban Column Layout

```tsx
// ❌ BEFORE
<div className="flex gap-4 p-4">
  <div className="flex-1 space-y-3">
    {records.map(r => <RecordCard key={r.id} />)}
  </div>
</div>

// ✅ AFTER
<Inline space="space-100" padding="space-100">
  <Stack space="space-075" className="flex-1">
    {records.map(r => <RecordCard key={r.id} />)}
  </Stack>
</Inline>
```

### Pattern 2: Record Detail Two-Column

```tsx
// ❌ BEFORE
<div className="grid grid-cols-2 gap-8 p-6">
  <div className="space-y-4">
    <FieldRenderer />
  </div>
  <div className="space-y-4">
    <CommentsPanel />
  </div>
</div>

// ✅ AFTER
<Grid columns={2} gap="space-400" padding="space-300">
  <Stack space="space-100">
    <FieldRenderer />
  </Stack>
  <Stack space="space-100">
    <CommentsPanel />
  </Stack>
</Grid>
```

### Pattern 3: Comment Item

```tsx
// ❌ BEFORE
<div className="flex gap-3 p-4 border-b">
  <Avatar />
  <div className="flex-1 space-y-2">
    <Header />
    <Content />
  </div>
</div>

// ✅ AFTER
<Inline space="space-075" padding="space-100" className="border-b">
  <Avatar />
  <Stack space="space-050" className="flex-1">
    <Header />
    <Content />
  </Stack>
</Inline>
```

### Pattern 4: Action Bar

```tsx
// ❌ BEFORE
<div className="flex items-center justify-between px-6 py-3 border-b">
  <div className="flex gap-2">
    <Button />
    <Button />
  </div>
  <SearchInput />
</div>

// ✅ AFTER
<Inline
  align="center"
  justify="between"
  space="space-050"
  className="px-[var(--space-300)] py-[var(--space-075)] border-b"
>
  <Inline space="space-050">
    <Button />
    <Button />
  </Inline>
  <SearchInput />
</Inline>
```

### Pattern 5: Responsive Grid (Exception)

```tsx
// ❌ BEFORE
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {items.map(i => <Card key={i.id} />)}
</div>

// ✅ AFTER - Use Tailwind if Grid doesn't support responsive columns
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[var(--space-300)]">
  {items.map(i => <Card key={i.id} />)}
</div>

// OR extend Grid primitive with responsive variants
```

---

## Implementation Steps

### Step 1: Review Phase 1 Learnings (Day 1 - AM)

**1.1 Read Phase 1 migration report**

- Note successful patterns
- Note blockers/exceptions
- Review primitive enhancements

**1.2 Update target file list**

- Remove files already migrated in Phase 1
- Prioritize by complexity (simple → complex)

**1.3 Sync with team**

- Share Phase 1 report
- Get approval to proceed
- Assign files if multiple devs

---

### Step 2: Migrate Record List Views (Day 1 PM - Day 2)

**Priority Order**:

1. `generic-table-view.tsx` (simplest)
2. `kanban-view.tsx` (column layout)
3. `gantt-view.tsx` (timeline layout - may have exceptions)

**Process per file**:

```bash
# 1. Analyze
rg "gap-|space-|p[xy]?-|m[xy]?-" {file}

# 2. Create test page in Storybook (if not exists)
# 3. Take Percy snapshot (baseline)
# 4. Migrate
# 5. Test visually + TypeScript
# 6. Percy snapshot (after)
# 7. Commit
```

**Expected challenges**:

- Kanban columns: Need flex-1 className passthrough
- Gantt timeline: May use absolute positioning (skip primitives)

---

### Step 3: Migrate Record Detail Components (Day 3)

**Files**:

1. `record-header.tsx`
2. `record-fields.tsx`
3. `comments-panel.tsx`
4. `comment-item.tsx`

**Focus**:

- Two-column layout (Grid primitive)
- Nested Stack spacing (field groups)
- Comment list vertical rhythm

---

### Step 4: Migrate Toolbars & Controls (Day 4)

**Files**:

1. `record-actions-bar.tsx`
2. `record-filters.tsx`
3. `view-switcher.tsx`
4. `pagination-controls.tsx`

**Pattern**: Inline with justify="between"

---

### Step 5: Migrate Dialogs (Day 5)

**Files**:

1. `bulk-actions-dialog.tsx`
2. `record-import-dialog.tsx`
3. `record-export-dialog.tsx`

**Pattern**: Stack for form layout, Inline for button groups

---

### Step 6: Validate & Document (Day 6)

**6.1 Percy full suite**

```bash
npx percy storybook ./storybook-static
```

**6.2 Lighthouse audit**

```bash
# Test key pages:
# - /tables (list)
# - /tables/{id}/records (record list)
# - /tables/{id}/records/{id} (detail)
```

**6.3 Create Phase 2 report**

```markdown
# phase-02-migration-report.md

- Files migrated: X/20
- New patterns discovered: Y
- Edge cases: Z
- Percy results: Link
- Performance: Before/After
```

---

## Todo List

**Day 1**:

- [ ] Review Phase 1 migration report
- [ ] Update target file list (remove Phase 1 files)
- [ ] Migrate `generic-table-view.tsx`
- [ ] Migrate `kanban-view.tsx`
- [ ] Document kanban column challenges

**Day 2**:

- [ ] Migrate `gantt-view.tsx` (or document exceptions)
- [ ] Migrate `record-card.tsx`
- [ ] Migrate `column-header.tsx`
- [ ] Percy snapshots for Day 1-2 files

**Day 3**:

- [ ] Migrate `record-header.tsx`
- [ ] Migrate `record-fields.tsx`
- [ ] Migrate `comments-panel.tsx`
- [ ] Migrate `comment-item.tsx`

**Day 4**:

- [ ] Migrate `record-actions-bar.tsx`
- [ ] Migrate `record-filters.tsx`
- [ ] Migrate `view-switcher.tsx`
- [ ] Migrate `pagination-controls.tsx`

**Day 5**:

- [ ] Migrate `bulk-actions-dialog.tsx`
- [ ] Migrate `record-import-dialog.tsx`
- [ ] Migrate `record-export-dialog.tsx`
- [ ] Remaining component cleanup

**Day 6**:

- [ ] Run full Percy suite
- [ ] Lighthouse audits (3 key pages)
- [ ] Create Phase 2 migration report
- [ ] Team review + approval
- [ ] Merge or create PR

---

## Success Criteria

**Must Have**:

- ✅ 18+ files migrated (90% target)
- ✅ Percy visual regression: 0 unapproved diffs
- ✅ TypeScript compilation passes
- ✅ Core user flows working (create/read/update records)

**Should Have**:

- ✅ All 20 files migrated (100%)
- ✅ Kanban drag-drop still functional
- ✅ Gantt timeline rendering correctly
- ✅ Comments panel responsive on mobile

**Nice to Have**:

- ✅ Grid primitive extended for responsive columns
- ✅ Box primitive supports paddingInline/paddingBlock
- ✅ Migration time < 5 days (ahead of schedule)

---

## Risk Assessment

| Risk                       | Probability | Impact | Mitigation                                                    |
| -------------------------- | ----------- | ------ | ------------------------------------------------------------- |
| Kanban drag-drop breaks    | Medium      | High   | Test with react-beautiful-dnd, ensure DOM structure unchanged |
| Gantt absolute positioning | High        | Low    | Document exception, keep Tailwind                             |
| Comments panel overflow    | Low         | Medium | Test long content, ensure scroll behavior                     |
| Mobile responsive issues   | Medium      | Medium | Test all breakpoints, fallback to Tailwind if needed          |

**Rollback Plan**:

- Tag before Phase 2: `phase-1-complete`
- Rollback per file if issues found
- Document failed files for Phase 3 retry

---

## Security Considerations

N/A - UI-only changes.

---

## Next Steps

**After Phase 2 completion**:

1. Review migration report
2. Update Phase 3 plan based on learnings
3. Proceed to Phase 3 (Active Tables Settings)
4. Consider parallel work on Phase 4 (Workflows) if team bandwidth allows
