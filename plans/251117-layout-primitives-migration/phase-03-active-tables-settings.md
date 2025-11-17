# Phase 3: Active Tables Settings

**Date**: 2025-11-17
**Priority**: 🟡 High
**Status**: ⚪ Pending Phase 2 Completion
**Duration**: 5-6 days
**Assignees**: TBD

---

## Context

Phase 3 tackles Active Tables settings pages - field configuration, permissions, view settings, kanban/gantt config. These are complex forms with nested layouts, modal dialogs, and multi-select components.

**Dependencies**:

- ✅ Phase 2 completed (core pages migrated)
- ✅ Dialog migration patterns established
- ✅ Form layout patterns documented

**Links**:

- [Main Plan](./plan.md)
- [Phase 2 Report](./phase-02-migration-report.md) _(created after Phase 2)_
- [Settings Components](../../apps/web/src/features/active-tables/components/settings/)

---

## Overview

**Goals**:

1. Migrate ~25 settings components and pages
2. Establish form layout patterns (Stack-based)
3. Handle complex nested modals
4. Maintain field config wizard UX

**Non-goals**:

- Refactoring form logic (only layout/spacing)
- Adding new features
- Changing validation behavior

---

## Key Insights from Phase 2

_(To be filled after Phase 2 completion)_

Expected learnings:

- Dialog content spacing patterns
- Multi-step form layouts
- Nested Stack/Inline patterns
- Grid usage for settings sections

---

## Requirements

### Functional

- ✅ Preserve field configuration wizard flow
- ✅ Maintain permissions matrix layout
- ✅ Keep kanban/gantt config forms working
- ✅ Preserve view settings panel spacing
- ✅ Multi-select dropdown alignment

### Non-Functional

- ✅ Percy visual regression: 0 diffs
- ✅ TypeScript strict mode
- ✅ Form validation still functional
- ✅ No performance regression

---

## Architecture

### Target Files (25 files)

#### **Settings Layout** (3 files)

1. `apps/web/src/features/active-tables/components/settings/settings-layout.tsx`
   - Main settings container (tabs, sidebar)
2. `apps/web/src/features/active-tables/components/settings/settings-section.tsx`
   - Individual setting section wrapper
3. `apps/web/src/features/active-tables/components/settings/settings-card.tsx`
   - Card wrapper for settings groups

#### **Field Settings** (8 files)

4. `apps/web/src/features/active-tables/components/settings/fields/field-form-modal.tsx`
   - Field create/edit modal
5. `apps/web/src/features/active-tables/components/settings/fields/field-list.tsx`
   - Field list view
6. `apps/web/src/features/active-tables/components/settings/fields/field-item.tsx`
   - Individual field row
7. `apps/web/src/features/active-tables/components/settings/fields/field-type-selector.tsx`
   - Field type picker
8. `apps/web/src/features/active-tables/components/settings/fields/reference-field-config.tsx`
   - Reference field settings
9. `apps/web/src/features/active-tables/components/settings/fields/validation-config.tsx`
   - Field validation rules
10. `apps/web/src/features/active-tables/components/settings/fields/default-value-config.tsx`
    - Default value editor
11. `apps/web/src/features/active-tables/components/settings/fields/field-reorder-dialog.tsx`
    - Drag-drop field reorder

#### **Permissions Settings** (4 files)

12. `apps/web/src/features/active-tables/components/settings/permissions/permissions-settings-section.tsx`
    - Permissions matrix
13. `apps/web/src/features/active-tables/components/settings/permissions/role-permission-row.tsx`
    - Individual role row
14. `apps/web/src/features/active-tables/components/settings/permissions/action-permission-cell.tsx`
    - Permission dropdown cell
15. `apps/web/src/features/active-tables/components/settings/permissions/permission-preset-dialog.tsx`
    - Permission template picker

#### **View Settings** (4 files)

16. `apps/web/src/features/active-tables/components/settings/views/list-view-settings-section.tsx`
    - List view config (table/kanban/gantt)
17. `apps/web/src/features/active-tables/components/settings/views/detail-view-settings-section.tsx`
    - Detail view config (layout, comments position)
18. `apps/web/src/features/active-tables/components/settings/views/view-field-selector.tsx`
    - Field visibility toggles
19. `apps/web/src/features/active-tables/components/settings/views/sort-config-dialog.tsx`
    - Sort order config

#### **Kanban/Gantt Settings** (4 files)

20. `apps/web/src/features/active-tables/components/settings/kanban/kanban-settings-section.tsx`
    - Kanban configuration
21. `apps/web/src/features/active-tables/components/settings/kanban/kanban-form-modal.tsx`
    - Kanban board form
22. `apps/web/src/features/active-tables/components/settings/gantt/gantt-settings-section.tsx`
    - Gantt configuration
23. `apps/web/src/features/active-tables/components/settings/gantt/gantt-form-modal.tsx`
    - Gantt chart form

#### **Filters Settings** (2 files)

24. `apps/web/src/features/active-tables/components/settings/filters/quick-filters-section.tsx`
    - Quick filter config
25. `apps/web/src/features/active-tables/components/settings/filters/filter-preset-dialog.tsx`
    - Saved filter templates

---

## Migration Patterns

### Pattern 1: Settings Section

```tsx
// ❌ BEFORE
<div className="space-y-4 p-6 border rounded-lg">
  <h3 className="font-semibold">Field Settings</h3>
  <div className="space-y-3">
    <FormField />
    <FormField />
  </div>
</div>

// ✅ AFTER
<Box padding="space-300" border="default" borderRadius="lg">
  <Stack space="space-100">
    <h3 className="font-semibold">Field Settings</h3>
    <Stack space="space-075">
      <FormField />
      <FormField />
    </Stack>
  </Stack>
</Box>
```

### Pattern 2: Permissions Matrix

```tsx
// ❌ BEFORE
<div className="overflow-x-auto">
  <table className="w-full">
    <thead>
      <tr className="border-b">
        <th className="px-4 py-3">Role</th>
        <th className="px-4 py-3">Create</th>
        <th className="px-4 py-3">Update</th>
      </tr>
    </thead>
    <tbody className="divide-y">
      {roles.map(r => <PermissionRow key={r.id} />)}
    </tbody>
  </table>
</div>

// ✅ AFTER - Keep table structure, use CSS vars for spacing
<div className="overflow-x-auto">
  <table className="w-full">
    <thead>
      <tr className="border-b">
        <th className="px-[var(--space-100)] py-[var(--space-075)]">Role</th>
        <th className="px-[var(--space-100)] py-[var(--space-075)]">Create</th>
        <th className="px-[var(--space-100)] py-[var(--space-075)]">Update</th>
      </tr>
    </thead>
    <tbody className="divide-y">
      {roles.map(r => <PermissionRow key={r.id} />)}
    </tbody>
  </table>
</div>
```

### Pattern 3: Field Form Modal

```tsx
// ❌ BEFORE
<DialogContent className="max-w-2xl p-6">
  <div className="space-y-6">
    <h2>Create Field</h2>
    <div className="space-y-4">
      <FormField />
      <FormField />
    </div>
    <div className="flex justify-end gap-3 pt-4 border-t">
      <Button variant="outline">Cancel</Button>
      <Button>Save</Button>
    </div>
  </div>
</DialogContent>

// ✅ AFTER
<DialogContent className="max-w-2xl">
  <Box padding="space-300">
    <Stack space="space-300">
      <h2>Create Field</h2>
      <Stack space="space-100">
        <FormField />
        <FormField />
      </Stack>
      <Inline justify="end" space="space-075" className="pt-[var(--space-100)] border-t">
        <Button variant="outline">Cancel</Button>
        <Button>Save</Button>
      </Inline>
    </Stack>
  </Box>
</DialogContent>
```

### Pattern 4: Multi-Select Field

```tsx
// ❌ BEFORE
<div className="space-y-2">
  <Label>Visible Fields</Label>
  <div className="flex flex-wrap gap-2">
    {fields.map(f => (
      <Badge key={f.id} className="cursor-pointer">
        {f.name}
      </Badge>
    ))}
  </div>
</div>

// ✅ AFTER
<Stack space="space-050">
  <Label>Visible Fields</Label>
  <Inline wrap space="space-050">
    {fields.map(f => (
      <Badge key={f.id} className="cursor-pointer">
        {f.name}
      </Badge>
    ))}
  </Inline>
</Stack>
```

### Pattern 5: Nested Settings Groups

```tsx
// ❌ BEFORE
<div className="space-y-8">
  <div className="space-y-4">
    <h3>Display Settings</h3>
    <div className="space-y-3">
      <FormField />
      <FormField />
    </div>
  </div>
  <div className="space-y-4">
    <h3>Behavior Settings</h3>
    <div className="space-y-3">
      <FormField />
      <FormField />
    </div>
  </div>
</div>

// ✅ AFTER
<Stack space="space-400">
  <Stack space="space-100">
    <h3>Display Settings</h3>
    <Stack space="space-075">
      <FormField />
      <FormField />
    </Stack>
  </Stack>
  <Stack space="space-100">
    <h3>Behavior Settings</h3>
    <Stack space="space-075">
      <FormField />
      <FormField />
    </Stack>
  </Stack>
</Stack>
```

---

## Implementation Steps

### Step 1: Review Phase 2 (Day 1 - AM)

**1.1 Read Phase 2 report**

- Note dialog patterns from Phase 2
- Review form layout learnings

**1.2 Sync team on approach**

- Settings have complex nesting (validate patterns)
- Permissions matrix may need exceptions

---

### Step 2: Migrate Settings Layout (Day 1 PM)

**Files**:

1. `settings-layout.tsx`
2. `settings-section.tsx`
3. `settings-card.tsx`

**Focus**: Establish base layout patterns for all settings

---

### Step 3: Migrate Field Settings (Day 2-3)

**Day 2**:

- `field-form-modal.tsx` (most complex)
- `field-list.tsx`
- `field-item.tsx`
- `field-type-selector.tsx`

**Day 3**:

- `reference-field-config.tsx`
- `validation-config.tsx`
- `default-value-config.tsx`
- `field-reorder-dialog.tsx`

**Expected challenges**:

- Drag-drop in field-reorder-dialog (ensure DOM structure unchanged)
- Conditional field config sections (nested Stack patterns)

---

### Step 4: Migrate Permissions (Day 4 - AM)

**Files**:

1. `permissions-settings-section.tsx`
2. `role-permission-row.tsx`
3. `action-permission-cell.tsx`
4. `permission-preset-dialog.tsx`

**Special handling**:

- Table structure: Use CSS vars, NOT primitives
- Cell spacing: CSS vars for th/td padding

---

### Step 5: Migrate View Settings (Day 4 PM)

**Files**:

1. `list-view-settings-section.tsx`
2. `detail-view-settings-section.tsx`
3. `view-field-selector.tsx`
4. `sort-config-dialog.tsx`

---

### Step 6: Migrate Kanban/Gantt Settings (Day 5)

**Files**:

1. `kanban-settings-section.tsx`
2. `kanban-form-modal.tsx`
3. `gantt-settings-section.tsx`
4. `gantt-form-modal.tsx`

---

### Step 7: Migrate Filters + Validate (Day 6)

**AM**:

- `quick-filters-section.tsx`
- `filter-preset-dialog.tsx`

**PM**:

- Percy full suite
- Lighthouse audit
- Create Phase 3 report

---

## Todo List

**Day 1**:

- [ ] Review Phase 2 migration report
- [ ] Migrate `settings-layout.tsx`
- [ ] Migrate `settings-section.tsx`
- [ ] Migrate `settings-card.tsx`
- [ ] Document base layout patterns

**Day 2**:

- [ ] Migrate `field-form-modal.tsx`
- [ ] Migrate `field-list.tsx`
- [ ] Migrate `field-item.tsx`
- [ ] Migrate `field-type-selector.tsx`

**Day 3**:

- [ ] Migrate `reference-field-config.tsx`
- [ ] Migrate `validation-config.tsx`
- [ ] Migrate `default-value-config.tsx`
- [ ] Migrate `field-reorder-dialog.tsx`
- [ ] Test drag-drop functionality

**Day 4**:

- [ ] Migrate permissions section (4 files)
- [ ] Migrate view settings (4 files)
- [ ] Document table spacing exceptions

**Day 5**:

- [ ] Migrate kanban settings (2 files)
- [ ] Migrate gantt settings (2 files)
- [ ] Test kanban/gantt config workflows

**Day 6**:

- [ ] Migrate filters section (2 files)
- [ ] Run Percy suite
- [ ] Lighthouse audits
- [ ] Create Phase 3 report
- [ ] Team review + merge

---

## Success Criteria

**Must Have**:

- ✅ 23+ files migrated (92% target)
- ✅ Percy: 0 visual diffs
- ✅ TypeScript passes
- ✅ Field config wizard functional
- ✅ Permissions matrix layout preserved

**Should Have**:

- ✅ All 25 files migrated (100%)
- ✅ Drag-drop field reorder working
- ✅ Multi-select components aligned correctly
- ✅ Modal dialogs responsive on mobile

**Nice to Have**:

- ✅ Settings forms feel more consistent (side benefit of primitives)
- ✅ Documented table spacing exception pattern
- ✅ Ahead of schedule (< 5 days)

---

## Risk Assessment

| Risk                              | Probability | Impact | Mitigation                                    |
| --------------------------------- | ----------- | ------ | --------------------------------------------- |
| Drag-drop breaks in field-reorder | Medium      | High   | Test thoroughly, keep DOM structure identical |
| Permissions table misaligned      | Low         | Medium | Use CSS vars for table spacing                |
| Nested modal dialogs              | Low         | Medium | Document max nesting depth (2-3 levels)       |
| Form validation issues            | Low         | High   | Test all field types, validation rules        |

**Rollback Plan**:

- Tag: `phase-2-complete`
- Per-file rollback if needed
- Document failed files for retry

---

## Security Considerations

- ⚠️ Permissions matrix: Ensure no accidental permission changes during migration
- ✅ Test: Create role → Set permissions → Verify saved correctly

---

## Next Steps

**After Phase 3 completion**:

1. Review migration report
2. Parallel work possible: Phase 4 (Workflows) + Phase 5 (Other features)
3. Consider team split if bandwidth allows
