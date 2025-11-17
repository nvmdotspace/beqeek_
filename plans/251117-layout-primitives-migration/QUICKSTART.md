# Layout Primitives Migration - Quick Start Guide

**Goal**: Migrate 113+ files from hardcoded Tailwind spacing to Layout Primitives in 6 phases.

---

## 🚀 Phase 1: Pilot Migration (Start Here)

**Duration**: 3-4 days
**Files**: 8-10 Tier 1 Active Tables files
**Purpose**: Validate approach, establish patterns, setup testing

### Step-by-Step

#### 1. Setup Testing (Day 1 Morning)

```bash
# Install Percy
pnpm add -D @percy/cli @percy/storybook

# Create Storybook stories for primitives
mkdir -p packages/ui/src/components/primitives/__stories__

# Generate Percy baseline
pnpm build-storybook
npx percy storybook ./storybook-static
```

#### 2. Create Branch

```bash
git checkout -b feat/layout-primitives-phase-1
git tag phase-0-baseline
```

#### 3. Migrate First File (Day 1 Afternoon)

```bash
# Target: active-table-card.tsx (simplest, most reused)

# 1. Analyze patterns
rg "gap-|space-|p[xy]?-|m[xy]?-" \
  apps/web/src/features/active-tables/components/active-table-card.tsx

# 2. Backup
cp active-table-card.tsx active-table-card.tsx.backup

# 3. Apply patterns (see CHEATSHEET below)

# 4. Test
pnpm dev
# Navigate to table list, verify visually

# 5. Type check
pnpm --filter web check-types

# 6. Commit
git add .
git commit -m "refactor(active-tables): migrate active-table-card to primitives"
```

#### 4. Continue with Core Pages (Day 2-3)

Migrate in order:

1. `active-tables-page.tsx`
2. `active-table-detail-page.tsx`
3. `active-table-records-page.tsx`
4. `record-detail-page.tsx`
5. `create-record-dialog.tsx`
6. `update-record-dialog.tsx`

#### 5. Validate (Day 4)

```bash
# Percy visual regression
pnpm build-storybook
npx percy storybook ./storybook-static

# Lighthouse audit
pnpm build && pnpm --filter web preview
# Run Lighthouse on key pages

# Create report
touch plans/251117-layout-primitives-migration/reports/phase-01-migration-report.md
```

---

## 📋 Pattern Cheatsheet

### Import Primitives

```tsx
import { Box, Stack, Inline, Grid, GridItem } from '@workspace/ui/components/primitives';
```

### Common Replacements

| Before                                     | After                                |
| ------------------------------------------ | ------------------------------------ |
| `<div className="space-y-6">`              | `<Stack space="space-300">`          |
| `<div className="flex gap-4">`             | `<Inline space="space-100">`         |
| `<div className="p-6">`                    | `<Box padding="space-300">`          |
| `<div className="grid grid-cols-3 gap-6">` | `<Grid columns={3} gap="space-300">` |
| `<div className="mt-4">`                   | Move to parent Stack/Inline          |

### Space Scale Reference

```tsx
space = 'space-025'; // 2px  (gap-1)
space = 'space-050'; // 4px  (gap-2)
space = 'space-075'; // 6px  (gap-3)
space = 'space-100'; // 8px  (gap-4) ← DEFAULT
space = 'space-150'; // 12px (gap-6)
space = 'space-200'; // 16px (gap-8)
space = 'space-300'; // 24px (gap-12)
space = 'space-400'; // 32px (gap-16)
```

### Example Transformations

#### Vertical List

```tsx
// ❌ BEFORE
<div className="space-y-4">
  {items.map(i => <Item key={i.id} />)}
</div>

// ✅ AFTER
<Stack space="space-100">
  {items.map(i => <Item key={i.id} />)}
</Stack>
```

#### Button Group

```tsx
// ❌ BEFORE
<div className="flex gap-2 justify-end">
  <Button variant="outline">Cancel</Button>
  <Button>Save</Button>
</div>

// ✅ AFTER
<Inline space="space-050" justify="end">
  <Button variant="outline">Cancel</Button>
  <Button>Save</Button>
</Inline>
```

#### Card with Padding

```tsx
// ❌ BEFORE
<div className="p-6 bg-card border rounded-lg">
  <h3>Title</h3>
  <p>Content</p>
</div>

// ✅ AFTER
<Box
  padding="space-300"
  backgroundColor="card"
  border="default"
  borderRadius="lg"
>
  <Stack space="space-050">
    <h3>Title</h3>
    <p>Content</p>
  </Stack>
</Box>
```

#### Eliminate Margin

```tsx
// ❌ BEFORE
<div>
  <Header className="mb-6" />
  <Content />
</div>

// ✅ AFTER
<Stack space="space-300">
  <Header />
  <Content />
</Stack>
```

---

## ⚠️ Common Pitfalls

### 1. Don't Mix Systems

```tsx
// ❌ WRONG
<Stack space="space-100" className="space-y-6">

// ✅ CORRECT
<Stack space="space-100">
```

### 2. Eliminate ALL Margins

```tsx
// ❌ WRONG
<Stack space="space-100">
  <Item className="mt-2" /> {/* margin leakage */}
</Stack>

// ✅ CORRECT
<Stack space="space-100">
  <Item />
</Stack>
```

### 3. Preserve flex-1 (if needed)

```tsx
// ❌ WRONG
<Inline space="space-100">
  <Sidebar />
  <Main /> {/* lost flex-1 */}
</Inline>

// ✅ CORRECT
<Inline space="space-100">
  <Sidebar />
  <Main className="flex-1" />
</Inline>
```

### 4. Tables Need CSS Vars

```tsx
// ❌ WRONG
<Box as="table">
  <Box as="th" padding="space-100">

// ✅ CORRECT
<table>
  <th className="px-[var(--space-100)] py-[var(--space-075)]">
```

---

## 🧪 Testing Checklist

After each file migration:

- [ ] **Visual check**: Component looks identical in browser
- [ ] **TypeScript**: `pnpm --filter web check-types` passes
- [ ] **Console**: No errors in browser console
- [ ] **Responsive**: Test mobile/tablet/desktop
- [ ] **Dark mode**: Spacing unchanged in dark mode
- [ ] **Interactions**: Hover, click, keyboard nav still work
- [ ] **Commit**: `git commit -m "refactor: migrate {file} to primitives"`

---

## 📊 Progress Tracking

Create checklist in phase report:

```markdown
## Phase 1 Progress

### Files Migrated

- [x] active-table-card.tsx
- [x] active-tables-page.tsx
- [x] active-table-detail-page.tsx
- [ ] active-table-records-page.tsx
- [ ] record-detail-page.tsx
- [ ] create-record-dialog.tsx
- [ ] update-record-dialog.tsx
- [ ] quick-filters-bar.tsx

### Patterns Documented

- [x] Vertical Stack (space-y → Stack)
- [x] Horizontal Inline (flex gap → Inline)
- [x] Box Padding (p-\* → Box padding)
- [ ] Grid Layout (grid → Grid)
- [ ] Margin Elimination (m-\* → gap)

### Blockers

- None so far
```

---

## 🎯 Success Criteria (Phase 1)

**Must Have**:

- ✅ 8-10 files migrated
- ✅ Percy: 0 visual diffs
- ✅ TypeScript passes
- ✅ Pattern documentation complete

**Ready for Phase 2 if**:

- ✅ Migration approach validated
- ✅ Testing infrastructure working
- ✅ Team approval received

---

## 📚 Next Steps

After Phase 1:

1. Create `reports/phase-01-migration-report.md`
2. Team review + approval
3. Tag release: `git tag phase-1-complete`
4. Read [phase-02-active-tables-core.md](./phase-02-active-tables-core.md)
5. Start Phase 2

---

## 🆘 Need Help?

**Docs to read**:

- [Main Plan](./plan.md) - Overview, timeline, risks
- [RESEARCH.md](./RESEARCH.md) - Detailed patterns, edge cases
- [README.md](./README.md) - Complete guide

**Reference implementations**:

- `packages/ui/src/components/primitives/` - Primitive components
- `apps/web/src/features/workspace/components/workspace-card-compact.tsx` - Already migrated
- `apps/web/src/features/workflow-connectors/components/connector-card-compact.tsx` - Already migrated

**Commands**:

```bash
# Find hardcoded spacing in a file
rg "gap-|space-|p[xy]?-|m[xy]?-" {file}

# Find all files with hardcoded spacing
rg -l "gap-|space-|p[xy]?-|m[xy]?-" apps/web/src/features

# Check TypeScript
pnpm --filter web check-types

# Run dev server
pnpm dev

# Build for production
pnpm build

# Run Percy
npx percy storybook ./storybook-static
```

---

**Status**: 🔵 Ready to Start
**Estimated Time**: 3-4 days for Phase 1
**Last Updated**: 2025-11-17
