# Phase 4: Workflow Features

**Date**: 2025-11-17
**Priority**: 🟡 High
**Status**: ⚪ Pending Phase 3 Completion
**Duration**: 4-5 days
**Assignees**: TBD

---

## Context

Phase 4 migrates Workflow Forms and Workflow Connectors features (~30 files). Some connector files already use primitives (connector-card-compact.tsx) - leverage as reference patterns.

**Dependencies**:

- ✅ Phase 3 completed (settings patterns established)
- ✅ Form layout patterns documented
- ✅ Modal dialog patterns established

**Links**:

- [Main Plan](./plan.md)
- [Workflow Forms](../../apps/web/src/features/workflow-forms/)
- [Workflow Connectors](../../apps/web/src/features/workflow-connectors/)

---

## Overview

**Goals**:

1. Migrate ~18 workflow-forms files
2. Migrate ~12 workflow-connectors files (excluding already migrated)
3. Leverage existing primitive usage in connectors
4. Standardize form builder layouts

**Non-goals**:

- Changing form builder logic
- Modifying connector API integrations
- Refactoring state management

---

## Key Insights from Phase 3

_(To be filled after Phase 3 completion)_

Expected learnings:

- Complex form layout patterns
- Multi-step wizard spacing
- Dialog content patterns
- Nested configuration panels

---

## Requirements

### Functional

- ✅ Preserve form builder drag-drop
- ✅ Maintain field config wizard flow
- ✅ Keep connector card layouts
- ✅ Preserve documentation viewer spacing
- ✅ Template selection grid unchanged

### Non-Functional

- ✅ Percy: 0 visual diffs
- ✅ TypeScript strict mode
- ✅ Form validation functional
- ✅ Connector API calls unchanged

---

## Architecture

### Target Files (30 files)

#### **Workflow Forms - Pages** (3 files)

1. `apps/web/src/features/workflow-forms/pages/workflow-forms-list.tsx`
   - Form list page
2. `apps/web/src/features/workflow-forms/pages/workflow-form-detail.tsx`
   - Form builder page (complex layout)
3. `apps/web/src/features/workflow-forms/pages/workflow-forms-select.tsx`
   - Template selection

#### **Workflow Forms - Builder Components** (8 files)

4. `apps/web/src/features/workflow-forms/components/form-builder-layout.tsx`
   - Main builder layout (3-column: palette, canvas, config)
5. `apps/web/src/features/workflow-forms/components/field-list.tsx`
   - Field palette
6. `apps/web/src/features/workflow-forms/components/field-list-item.tsx`
   - Draggable field item
7. `apps/web/src/features/workflow-forms/components/form-preview.tsx`
   - Canvas/preview area
8. `apps/web/src/features/workflow-forms/components/config-panel.tsx`
   - Right panel configuration
9. `apps/web/src/features/workflow-forms/components/preview-panel.tsx`
   - Form preview modal
10. `apps/web/src/features/workflow-forms/components/empty-field-list.tsx`
    - Empty state
11. `apps/web/src/features/workflow-forms/components/field-config-dialog.tsx`
    - Field settings modal

#### **Workflow Forms - Form Components** (7 files)

12. `apps/web/src/features/workflow-forms/components/create-form-dialog.tsx`
    - Create form modal
13. `apps/web/src/features/workflow-forms/components/form-settings-dialog.tsx`
    - Form settings modal
14. `apps/web/src/features/workflow-forms/components/form-list-item.tsx`
    - Form card
15. `apps/web/src/features/workflow-forms/components/form-template-card.tsx`
    - Template card
16. `apps/web/src/features/workflow-forms/components/field-options-editor.tsx`
    - Options editor (select fields)
17. `apps/web/src/features/workflow-forms/components/form-list-skeleton.tsx`
    - Loading skeleton
18. `apps/web/src/features/workflow-forms/components/empty-state.tsx`
    - Empty state

#### **Workflow Connectors - Pages** (4 files)

19. `apps/web/src/features/workflow-connectors/pages/connector-list-page.tsx`
    - Connector list
20. `apps/web/src/features/workflow-connectors/pages/connector-detail-page.tsx`
    - Connector detail
21. `apps/web/src/features/workflow-connectors/pages/connector-select-page.tsx`
    - Connector picker (grid)
22. ~~`apps/web/src/features/workflow-connectors/pages/connector-select-page-compact.tsx`~~
    - _(Already using primitives - reference only)_

#### **Workflow Connectors - Components** (8 files)

23. ~~`apps/web/src/features/workflow-connectors/components/connector-card-compact.tsx`~~
    - _(Already migrated - use as reference)_
24. `apps/web/src/features/workflow-connectors/components/connector-card.tsx`
    - Standard connector card
25. `apps/web/src/features/workflow-connectors/components/connector-list-item.tsx`
    - List view item
26. `apps/web/src/features/workflow-connectors/components/connector-config-form.tsx`
    - Config form
27. `apps/web/src/features/workflow-connectors/components/documentation-viewer.tsx`
    - Markdown docs viewer
28. `apps/web/src/features/workflow-connectors/components/category-tabs.tsx`
    - Category tabs
29. `apps/web/src/features/workflow-connectors/components/create-connector-dialog.tsx`
    - Create modal
30. `apps/web/src/features/workflow-connectors/components/edit-connector-dialog.tsx`
    - Edit modal

#### **Workflow Connectors - UI Components** (5 files)

31. `apps/web/src/features/workflow-connectors/components/search-input.tsx`
    - Search bar
32. `apps/web/src/features/workflow-connectors/components/empty-state.tsx`
    - Empty state
33. `apps/web/src/features/workflow-connectors/components/connector-card-skeleton.tsx`
    - Loading skeleton
34. `apps/web/src/features/workflow-connectors/components/connector-list-skeleton.tsx`
    - List skeleton
35. `apps/web/src/features/workflow-connectors/components/connector-detail-skeleton.tsx`
    - Detail skeleton

---

## Migration Patterns

### Pattern 1: Form Builder 3-Column Layout

```tsx
// ❌ BEFORE
<div className="grid grid-cols-12 gap-4 h-full">
  <div className="col-span-2 border-r p-4">
    <FieldPalette />
  </div>
  <div className="col-span-7 p-6">
    <FormCanvas />
  </div>
  <div className="col-span-3 border-l p-4">
    <ConfigPanel />
  </div>
</div>

// ✅ AFTER
<Grid columns={12} gap="space-100" className="h-full">
  <GridItem span={2}>
    <Box padding="space-100" className="border-r">
      <FieldPalette />
    </Box>
  </GridItem>
  <GridItem span={7}>
    <Box padding="space-300">
      <FormCanvas />
    </Box>
  </GridItem>
  <GridItem span={3}>
    <Box padding="space-100" className="border-l">
      <ConfigPanel />
    </Box>
  </GridItem>
</Grid>
```

### Pattern 2: Connector Grid (Reference from connector-card-compact)

```tsx
// ✅ GOOD EXAMPLE (already migrated)
<Grid columns={3} gap="space-200">
  {connectors.map((c) => (
    <ConnectorCardCompact key={c.id} connector={c} />
  ))}
</Grid>
```

### Pattern 3: Field Palette Item (Drag-Drop)

```tsx
// ❌ BEFORE
<div
  draggable
  className="flex items-center gap-2 p-3 border rounded cursor-move hover:bg-muted"
>
  <Icon />
  <span>{field.label}</span>
</div>

// ✅ AFTER - Preserve DOM structure for drag-drop
<Inline
  draggable
  align="center"
  space="space-050"
  padding="space-075"
  className="border rounded cursor-move hover:bg-muted"
>
  <Icon />
  <span>{field.label}</span>
</Inline>
```

### Pattern 4: Documentation Viewer

```tsx
// ❌ BEFORE
<div className="prose p-6 space-y-4">
  <h1>{title}</h1>
  <div className="space-y-3">
    <p>{content}</p>
  </div>
</div>

// ✅ AFTER
<Box padding="space-300" className="prose">
  <Stack space="space-100">
    <h1>{title}</h1>
    <Stack space="space-075">
      <p>{content}</p>
    </Stack>
  </Stack>
</Box>
```

### Pattern 5: Category Tabs

```tsx
// ❌ BEFORE
<div className="flex gap-2 border-b px-4">
  {categories.map(c => (
    <button
      key={c.id}
      className="px-4 py-2 -mb-px border-b-2"
    >
      {c.name}
    </button>
  ))}
</div>

// ✅ AFTER
<Inline space="space-050" className="border-b px-[var(--space-100)]">
  {categories.map(c => (
    <button
      key={c.id}
      className="px-[var(--space-100)] py-[var(--space-050)] -mb-px border-b-2"
    >
      {c.name}
    </button>
  ))}
</Inline>
```

---

## Implementation Steps

### Step 1: Review Reference Implementations (Day 1 - AM)

**1.1 Analyze existing primitive usage**

```bash
# Read already-migrated files
cat apps/web/src/features/workflow-connectors/components/connector-card-compact.tsx
cat apps/web/src/features/workflow-connectors/pages/connector-select-page-compact.tsx
```

**1.2 Document patterns**

- Grid layout for connector cards
- Stack spacing for card content
- Inline for metadata rows

---

### Step 2: Migrate Workflow Forms - Builder (Day 1 PM - Day 2)

**Priority Files**:

1. `form-builder-layout.tsx` (most complex)
2. `field-list.tsx`
3. `field-list-item.tsx` (drag-drop - careful!)
4. `form-preview.tsx`
5. `config-panel.tsx`

**Testing checklist**:

- [ ] Drag-drop from palette to canvas works
- [ ] Field reordering in canvas works
- [ ] Config panel updates on field select

---

### Step 3: Migrate Workflow Forms - Dialogs (Day 3)

**Files**:

1. `create-form-dialog.tsx`
2. `form-settings-dialog.tsx`
3. `field-config-dialog.tsx`
4. `preview-panel.tsx`

**Pattern**: Stack-based form layout (from Phase 3)

---

### Step 4: Migrate Workflow Forms - Cards (Day 3 PM)

**Files**:

1. `form-list-item.tsx`
2. `form-template-card.tsx`
3. `field-options-editor.tsx`
4. `form-list-skeleton.tsx`
5. `empty-state.tsx`

---

### Step 5: Migrate Workflow Connectors (Day 4)

**Pages** (AM):

1. `connector-list-page.tsx`
2. `connector-detail-page.tsx`
3. `connector-select-page.tsx`

**Components** (PM):

1. `connector-card.tsx` (use connector-card-compact as reference)
2. `connector-list-item.tsx`
3. `connector-config-form.tsx`
4. `documentation-viewer.tsx`

---

### Step 6: Migrate Remaining Connectors (Day 5 - AM)

**Files**:

1. `category-tabs.tsx`
2. `create-connector-dialog.tsx`
3. `edit-connector-dialog.tsx`
4. `search-input.tsx`
5. `empty-state.tsx`
6. Skeletons (3 files)

---

### Step 7: Validate (Day 5 PM)

- Percy suite
- Lighthouse audit
- Create Phase 4 report

---

## Todo List

**Day 1**:

- [ ] Read connector-card-compact.tsx (reference)
- [ ] Migrate `form-builder-layout.tsx`
- [ ] Migrate `field-list.tsx`
- [ ] Migrate `field-list-item.tsx`
- [ ] Test drag-drop functionality

**Day 2**:

- [ ] Migrate `form-preview.tsx`
- [ ] Migrate `config-panel.tsx`
- [ ] Migrate `preview-panel.tsx`
- [ ] Test builder end-to-end

**Day 3**:

- [ ] Migrate dialogs (3 files)
- [ ] Migrate cards/skeletons (5 files)
- [ ] Migrate `workflow-forms-list.tsx` page

**Day 4**:

- [ ] Migrate connector pages (3 files)
- [ ] Migrate connector components (4 files)
- [ ] Test connector config workflow

**Day 5**:

- [ ] Migrate remaining connectors (9 files)
- [ ] Run Percy suite
- [ ] Lighthouse audits
- [ ] Create Phase 4 report
- [ ] Team review + merge

---

## Success Criteria

**Must Have**:

- ✅ 28+ files migrated (93% target)
- ✅ Percy: 0 visual diffs
- ✅ TypeScript passes
- ✅ Form builder drag-drop functional
- ✅ Connector selection grid working

**Should Have**:

- ✅ All 30 files migrated (100%)
- ✅ Consistent spacing with Active Tables features
- ✅ Documentation viewer readable
- ✅ Category tabs responsive

**Nice to Have**:

- ✅ Builder layout feels more spacious/consistent
- ✅ Connector cards match new design system
- ✅ Ahead of schedule (< 4 days)

---

## Risk Assessment

| Risk                             | Probability | Impact   | Mitigation                                |
| -------------------------------- | ----------- | -------- | ----------------------------------------- |
| Form builder drag-drop breaks    | High        | Critical | Test thoroughly, preserve DOM structure   |
| 3-column layout misaligned       | Medium      | Medium   | Use Grid primitive, test all breakpoints  |
| Documentation viewer overflow    | Low         | Low      | Test long content, ensure scrolling works |
| Connector API integration breaks | Low         | High     | No API changes, only UI spacing           |

**Rollback Plan**:

- Tag: `phase-3-complete`
- Per-file rollback
- Builder layout is critical - rollback entire builder if drag-drop breaks

---

## Security Considerations

N/A - UI-only changes.

---

## Next Steps

**After Phase 4 completion**:

1. Review migration report
2. Parallel Phase 5 (Remaining Features) - can work in parallel if team split
3. Consider early validation testing (subset of Percy suite)
