# Phase 1: Pilot Migration

**Date**: 2025-11-17
**Priority**: 🔴 Critical (validates entire approach)
**Status**: 🔵 Ready to Start
**Duration**: 3-4 days
**Assignees**: TBD

---

## Context

Pilot phase validates migration approach on 8-10 high-impact Active Tables files. Establishes testing infrastructure (Percy, Storybook), documents edge cases, and proves pixel-perfect migration is achievable.

**Links**:

- [Main Plan](./plan.md)
- [Research Report](./RESEARCH.md)
- [Primitives Code](../../packages/ui/src/components/primitives/)

---

## Overview

**Goals**:

1. Migrate 8-10 Tier 1 Active Tables files without visual regressions
2. Setup Percy + Storybook baseline testing
3. Document migration patterns and edge cases
4. Validate TypeScript type safety with polymorphic components
5. Establish rollback procedures

**Non-goals**:

- Full feature coverage (save for later phases)
- Responsive breakpoint migration (document exceptions)
- Codemod automation (manual migration for learning)

---

## Key Insights from Research

1. **Zero runtime penalty** - Polymorphic `as` prop compiles away
2. **Margin elimination strategy** - Convert all `m*-*` to container `padding`/`gap`
3. **Edge cases to avoid** - One-off spacing (`pt-[23px]`), animation targets, third-party libs
4. **TypeScript pattern** - Use `asChild` approach if `as` prop causes slowdowns
5. **Testing requirement** - Percy baseline snapshots mandatory before changes

---

## Requirements

### Functional

- ✅ Preserve exact visual appearance (pixel-perfect)
- ✅ Maintain responsive behavior (mobile/tablet/desktop)
- ✅ Pass TypeScript compilation (strict mode)
- ✅ No runtime errors (console warnings/errors)
- ✅ Preserve accessibility (ARIA attributes, keyboard nav)

### Non-Functional

- ✅ Percy baseline match (0 visual diffs)
- ✅ Lighthouse performance unchanged (±2 points)
- ✅ Bundle size increase < 5KB (primitives are ~2-5KB gzipped)
- ✅ Dev server HMR working (no type errors slowing down)

---

## Architecture

### Target Files (Tier 1 - High Impact)

**Core Pages** (4 files):

1. `apps/web/src/features/active-tables/pages/active-table-records-page.tsx`
   - Record list view with filters, kanban, gantt
   - Complex grid layout, multiple spacing contexts
   - ~25 spacing patterns (gap, space-y, padding)

2. `apps/web/src/features/active-tables/pages/record-detail-page.tsx`
   - Record detail with two-column layout
   - Comments panel, field renderer
   - ~18 spacing patterns

3. `apps/web/src/features/active-tables/pages/active-tables-page.tsx`
   - Table list with cards
   - Grid layout, search bar
   - ~15 spacing patterns

4. `apps/web/src/features/active-tables/pages/active-table-detail-page.tsx`
   - Table configuration page
   - Settings tabs, field list
   - ~20 spacing patterns

**Key Components** (4-6 files): 5. `apps/web/src/features/active-tables/components/active-table-card.tsx`

- Reusable table card
- ~8 spacing patterns

6. `apps/web/src/features/active-tables/components/quick-filters-bar.tsx`
   - Filter chips bar
   - ~10 spacing patterns (horizontal gap, padding)

7. `apps/web/src/features/active-tables/components/record-form/create-record-dialog.tsx`
   - Modal dialog form
   - ~12 spacing patterns

8. `apps/web/src/features/active-tables/components/record-form/update-record-dialog.tsx`
   - Edit modal dialog
   - ~12 spacing patterns

**Optional (if time permits)**: 9. `apps/web/src/features/active-tables/components/table-management-dialog.tsx` 10. `apps/web/src/features/active-tables/components/settings/settings-layout.tsx`

### Migration Patterns

#### Pattern 1: Vertical Stack (space-y-\*)

```tsx
// ❌ BEFORE
<div className="space-y-6">
  <Header />
  <Content />
</div>

// ✅ AFTER
<Stack space="space-300">
  <Header />
  <Content />
</Stack>
```

**Mapping**:

- `space-y-1` → `space="space-025"` (2px)
- `space-y-2` → `space="space-050"` (4px)
- `space-y-3` → `space="space-075"` (6px)
- `space-y-4` → `space="space-100"` (8px)
- `space-y-6` → `space="space-150"` (12px)
- `space-y-8` → `space="space-200"` (16px)

#### Pattern 2: Horizontal Inline (gap-\*)

```tsx
// ❌ BEFORE
<div className="flex gap-4 items-center">
  <Button />
  <Button />
</div>

// ✅ AFTER
<Inline space="space-100" align="center">
  <Button />
  <Button />
</Inline>
```

#### Pattern 3: Padding (p*-*)

```tsx
// ❌ BEFORE
<div className="p-6 bg-card rounded-lg">
  <Content />
</div>

// ✅ AFTER
<Box padding="space-300" backgroundColor="card" borderRadius="lg">
  <Content />
</Box>
```

#### Pattern 4: Grid Layout

```tsx
// ❌ BEFORE
<div className="grid grid-cols-3 gap-6">
  <Card />
  <Card />
  <Card />
</div>

// ✅ AFTER
<Grid columns={3} gap="space-300">
  <Card />
  <Card />
  <Card />
</Grid>
```

#### Pattern 5: Margin Elimination

```tsx
// ❌ BEFORE
<div>
  <Header className="mb-4" />
  <Content className="mt-2" />
</div>

// ✅ AFTER
<Stack space="space-100">
  <Header />
  <Content />
</Stack>
```

#### Pattern 6: Mixed Padding (px/py)

```tsx
// ❌ BEFORE
<div className="px-8 py-6">
  <Content />
</div>

// ✅ AFTER - Use CSS custom properties if Box doesn't support paddingInline
<div className="px-[var(--space-400)] py-[var(--space-300)]">
  <Content />
</div>

// OR extend Box primitive (recommended for Phase 2+)
```

---

## Implementation Steps

### Step 1: Setup Testing Infrastructure (Day 1 - Morning)

**1.1 Install Percy + Storybook**

```bash
pnpm add -D @percy/cli @percy/storybook
```

**1.2 Create Storybook stories for primitives**

```bash
# Create stories directory
mkdir -p packages/ui/src/components/primitives/__stories__

# Files to create:
# - box.stories.tsx
# - stack.stories.tsx
# - inline.stories.tsx
# - grid.stories.tsx
```

**1.3 Generate Percy baseline snapshots**

```bash
# Build Storybook
pnpm build-storybook

# Generate Percy baseline
npx percy storybook ./storybook-static
```

**1.4 Setup git branch**

```bash
git checkout -b feat/layout-primitives-phase-1
git tag phase-0-baseline
```

---

### Step 2: Migrate First File (Day 1 - Afternoon)

**File**: `active-table-card.tsx` (simplest, most reused)

**2.1 Read current implementation**

```bash
# Analyze spacing patterns
rg "gap-|space-|p[xy]\?-|m[xy]\?-" apps/web/src/features/active-tables/components/active-table-card.tsx
```

**2.2 Create backup**

```bash
cp active-table-card.tsx active-table-card.tsx.backup
```

**2.3 Apply migration patterns**

- Replace `space-y-*` with `Stack`
- Replace `gap-*` with `Inline`
- Replace `p-*` with `Box padding`
- Eliminate all `m*-*` (convert to parent gap/padding)

**2.4 Test visually**

```bash
# Run dev server
pnpm dev

# Navigate to table list page
# Compare before/after screenshots
```

**2.5 Test TypeScript**

```bash
pnpm --filter web check-types
```

**2.6 Commit if successful**

```bash
git add .
git commit -m "refactor(active-tables): migrate active-table-card to primitives"
```

---

### Step 3: Migrate Core Pages (Day 2)

**Files** (in order):

1. `active-tables-page.tsx` - Depends on `active-table-card.tsx`
2. `active-table-detail-page.tsx` - Independent
3. `active-table-records-page.tsx` - Complex (skip if blocked)
4. `record-detail-page.tsx` - Complex (skip if blocked)

**Process per file**:

1. Analyze patterns → Document edge cases
2. Migrate → Test → Commit
3. If blocked: Document issue, skip file

**Expected blockers**:

- Responsive breakpoints not supported by primitives → Fallback to Tailwind
- Complex grid layouts → May need custom Grid extension
- Animation targets → Keep Tailwind classes

---

### Step 4: Migrate Dialogs (Day 3)

**Files**:

1. `create-record-dialog.tsx`
2. `update-record-dialog.tsx`
3. `table-management-dialog.tsx` (optional)

**Focus areas**:

- Modal content spacing (Stack for vertical flow)
- Form field spacing (Stack with consistent gap)
- Button groups (Inline with space)

---

### Step 5: Validate & Document (Day 4)

**5.1 Percy visual regression test**

```bash
# Build updated Storybook
pnpm build-storybook

# Run Percy
npx percy storybook ./storybook-static

# Review diffs in Percy dashboard
```

**5.2 Lighthouse performance audit**

```bash
# Before (baseline tag)
git checkout phase-0-baseline
pnpm build && pnpm preview
# Run Lighthouse on key pages, save report

# After (current)
git checkout feat/layout-primitives-phase-1
pnpm build && pnpm preview
# Run Lighthouse, compare scores
```

**5.3 Document findings**

```markdown
# Create: phase-01-migration-report.md

- Files migrated: 8-10 (list)
- Patterns documented: 6+ (list with examples)
- Edge cases found: X (list with solutions)
- TypeScript issues: Y (list with fixes)
- Visual regressions: 0 (Percy report link)
- Performance impact: ±N points (Lighthouse diff)
```

**5.4 Update primitives if needed**

```typescript
// Example: Add paddingInline/paddingBlock support to Box
export interface BoxProps {
  padding?: SpaceScale;
  paddingInline?: SpaceScale; // NEW
  paddingBlock?: SpaceScale; // NEW
  // ...
}
```

---

## Todo List

**Day 1**:

- [ ] Install Percy + Storybook dependencies
- [ ] Create primitive Storybook stories (Box, Stack, Inline, Grid)
- [ ] Generate Percy baseline snapshots
- [ ] Create `feat/layout-primitives-phase-1` branch
- [ ] Migrate `active-table-card.tsx`
- [ ] Visual test + TypeScript check
- [ ] Commit if successful

**Day 2**:

- [ ] Migrate `active-tables-page.tsx`
- [ ] Migrate `active-table-detail-page.tsx`
- [ ] Attempt `active-table-records-page.tsx` (complex)
- [ ] Attempt `record-detail-page.tsx` (complex)
- [ ] Document blockers/edge cases

**Day 3**:

- [ ] Migrate `create-record-dialog.tsx`
- [ ] Migrate `update-record-dialog.tsx`
- [ ] Migrate `quick-filters-bar.tsx`
- [ ] Migrate optional files if time permits

**Day 4**:

- [ ] Run Percy visual regression suite
- [ ] Run Lighthouse audits (before/after)
- [ ] Create migration report document
- [ ] Update primitives if enhancements needed
- [ ] Review with team, get approval
- [ ] Merge to main or create PR

---

## Success Criteria

**Must Have**:

- ✅ 8-10 files migrated without visual regressions
- ✅ Percy baseline match (0 unapproved diffs)
- ✅ TypeScript compilation passes
- ✅ No console errors in dev/prod
- ✅ Migration report documenting patterns

**Should Have**:

- ✅ Lighthouse score unchanged (±2 points)
- ✅ At least 2 complex pages migrated (records-page, detail-page)
- ✅ 6+ migration patterns documented with examples
- ✅ Edge case handling documented (responsive, animations, etc.)

**Nice to Have**:

- ✅ Primitive enhancements merged (paddingInline, responsive props)
- ✅ Codemod prototype for Pattern 1-3 automation
- ✅ ESLint rule to prevent new hardcoded spacing

---

## Risk Assessment

| Risk                   | Probability | Impact | Mitigation                                               |
| ---------------------- | ----------- | ------ | -------------------------------------------------------- |
| Percy baseline fails   | Medium      | High   | Regenerate after fixing snapshot issues                  |
| Complex layouts break  | High        | Medium | Document exceptions, fallback to Tailwind                |
| TypeScript errors      | Low         | Medium | Use `asChild` pattern if `as` prop fails                 |
| Performance regression | Low         | Low    | Bundle size analysis, rollback if >5KB                   |
| Team resistance        | Low         | High   | Show before/after comparisons, emphasize maintainability |

**Rollback Plan**:

1. Revert to `phase-0-baseline` tag
2. Cherry-pick successful migrations
3. Document failed patterns for later

---

## Security Considerations

N/A - UI-only changes, no auth/data handling modifications.

---

## Next Steps

**After Phase 1 completion**:

1. Review migration report with team
2. Update [Phase 2 plan](./phase-02-active-tables-core.md) based on learnings
3. If successful → Proceed to Phase 2 (Active Tables Core)
4. If blocked → Iterate on primitives, retry Phase 1

**Decision Point**:

- **Success**: Visual parity + type safety + documented patterns → **Green light for Phase 2**
- **Partial success**: Some files migrated, others documented as exceptions → **Adjust approach, retry**
- **Failure**: Primitives don't support required patterns → **Reevaluate strategy, consider CSS variables only**
