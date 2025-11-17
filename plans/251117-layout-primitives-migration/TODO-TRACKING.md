# Layout Primitives Migration - TODO Tracking

**Last Updated**: 2025-11-17
**Status**: Phase 1 Complete, TODOs Cataloged

---

## Overview

This document tracks all TODO comments added during the Layout Primitives migration. These TODOs represent temporary workarounds that should be addressed when primitives gain new capabilities.

**Total TODOs**: 15
**Categories**: 2 (Responsive Support, Missing Tokens)

---

## Category 1: Responsive Support Needed (10 TODOs)

**Issue**: Primitives don't support responsive props like `sm:`, `lg:` breakpoints
**Impact**: Medium - Must preserve Tailwind classes for responsive spacing
**Priority**: High - Affects 10 locations across 4 files
**Solution**: Add responsive spacing props to primitives API

### TODO #1-3: Responsive Padding (record-detail-page.tsx)

**File**: `apps/web/src/features/active-tables/pages/record-detail-page.tsx`

**Location 1** (Line 268):

```tsx
{
  /* TODO: Migrate to primitives when responsive padding support is added */
}
<div className="p-4 sm:p-6">
  <Stack space="space-300">
    <Skeleton className="h-10 w-48" />
    {/* ... */}
  </Stack>
</div>;
```

**Pattern**: `p-4 sm:p-6` (8px mobile, 24px tablet+)

**Location 2** (Line 334):

```tsx
{
  /* TODO: Migrate to primitives when responsive padding support is added */
}
<div className="container max-w-7xl mx-auto px-4 sm:px-6 py-3">
  <Inline space="space-075" justify="between" align="center">
    {/* Header content */}
  </Inline>
</div>;
```

**Pattern**: `px-4 sm:px-6` (horizontal padding responsive)

**Location 3** (Line 351):

```tsx
{
  /* TODO: Migrate to primitives when responsive padding and gap support is added */
}
<div className="container max-w-7xl mx-auto p-4 sm:p-6">
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">{/* Main content */}</div>
</div>;
```

**Pattern**: `p-4 sm:p-6` + `gap-4 lg:gap-6` (padding + gap both responsive)

---

### TODO #4-5: Responsive Gap (active-table-records-page.tsx)

**File**: `apps/web/src/features/active-tables/pages/active-table-records-page.tsx`

**Location 1** (Line 440):

```tsx
{
  /* TODO: Migrate to primitives when responsive gap support is added */
}
<div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
  <Heading level={2}>Records</Heading>
  <Inline space="space-050" align="center">
    {/* Action buttons */}
  </Inline>
</div>;
```

**Pattern**: `gap-3` + direction change `flex-col lg:flex-row`

**Location 2** (Line 524):

```tsx
{
  /* TODO: Migrate to primitives when responsive gap support is added */
}
<div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
  {/* Filter controls */}
</div>;
```

**Pattern**: `gap-3` + `flex-col sm:flex-row`

---

### TODO #6-7: Responsive Gap (active-tables-page.tsx)

**File**: `apps/web/src/features/active-tables/pages/active-tables-page.tsx`

**Location 1** (Line 254):

```tsx
{
  /* TODO: Migrate to primitives when responsive gap support is added */
}
<div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
  <Heading level={2}>Active Tables</Heading>
  <Button>Create Table</Button>
</div>;
```

**Pattern**: `gap-3` + direction change

**Location 2** (Line 265):

```tsx
{
  /* TODO: Migrate to primitives when responsive gap support is added */
}
<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
  <SearchInput />
  <FilterButton />
</div>;
```

**Pattern**: `gap-3` + `flex-col sm:flex-row`

---

### TODO #8-9: Responsive Padding + Gap (active-table-card.tsx)

**File**: `apps/web/src/features/active-tables/components/active-table-card.tsx`

**Location 1** (Line 75):

```tsx
{
  /* TODO: Migrate to primitives when responsive padding support is added */
}
<CardContent className="p-4 sm:p-5">{/* Card content */}</CardContent>;
```

**Pattern**: `p-4 sm:p-5` (16px mobile, 20px tablet+)

**Location 2** (Line 77):

```tsx
{
  /* TODO: Migrate to primitives when responsive gap support is added */
}
<div className="flex items-start justify-between gap-2.5 sm:gap-3">
  <Inline space="space-075" align="start" className="flex-1 min-w-0 sm:gap-3">
    {/* Icon + content */}
  </Inline>
</div>;
```

**Pattern**: `gap-2.5 sm:gap-3` (10px mobile, 12px tablet+)

---

### TODO #10: Responsive Padding (quick-filters-bar.tsx)

**File**: `apps/web/src/features/active-tables/components/quick-filters-bar.tsx`

**Location** (Line 192):

```tsx
{
  /* TODO: Migrate to primitives when responsive padding support is added */
}
<div className="px-3 sm:px-6 py-3">
  <Inline justify="between" align="center">
    {/* Filter header */}
  </Inline>
</div>;
```

**Pattern**: `px-3 sm:px-6 py-3` (horizontal padding responsive)

---

### Proposed Solution: Responsive Props API

```typescript
// Box component with responsive padding
<Box
  padding="space-100"           // Default (all sizes)
  paddingSm="space-150"          // sm breakpoint (640px+)
  paddingMd="space-200"          // md breakpoint (768px+)
  paddingLg="space-300"          // lg breakpoint (1024px+)
>
  {children}
</Box>

// Inline component with responsive gap
<Inline
  space="space-075"              // Default
  spaceSm="space-100"            // sm breakpoint
  spaceLg="space-150"            // lg breakpoint
  direction="column"             // Default
  directionSm="row"              // sm breakpoint
>
  {children}
</Inline>

// Stack component with responsive gap
<Stack
  space="space-075"
  spaceSm="space-100"
  spaceLg="space-150"
>
  {children}
</Stack>
```

**Implementation Plan**:

1. Extend primitive props types with responsive variants
2. Add responsive className generation logic
3. Update all 10 TODO locations
4. Test across breakpoints

---

## Category 2: Missing Spacing Token (5 TODOs)

**Issue**: No `space-037` token for 6px spacing (gap-1.5)
**Impact**: Low - Uses className fallback successfully
**Priority**: Medium - Improves type safety and consistency
**Solution**: Add `space-037: '6px'` to spacing scale

### TODO #11-12: Missing space-037 (active-table-card.tsx)

**File**: `apps/web/src/features/active-tables/components/active-table-card.tsx`

**Location 1** (Line 98):

```tsx
{
  /* TODO: Update when space-037 (6px) is added to spacing scale */
}
<Inline wrap align="center" className="gap-1.5">
  <Badge>Module Type</Badge>
  <Badge>E2EE Status</Badge>
</Inline>;
```

**Current Fallback**: `className="gap-1.5"` (works but not type-safe)
**Desired**: `<Inline space="space-037" wrap align="center">`

**Location 2** (Line 184):

```tsx
{
  /* TODO: Update when space-037 (6px) is added to spacing scale */
}
<Inline align="center" className="gap-1.5">
  <Table className="h-3 w-3" />
  <span>5 fields</span>
</Inline>;
```

**Usage**: Icon + count spacing

---

### TODO #13-15: Missing space-037 (quick-filters-bar.tsx)

**File**: `apps/web/src/features/active-tables/components/quick-filters-bar.tsx`

**Location 1** (Line 234):

```tsx
// TODO: Update when space-037 (6px) is added to spacing scale
return (
  <Inline key={field.name} align="center" className="gap-1.5">
    <Popover>{/* Multi-select filter */}</Popover>
  </Inline>
);
```

**Usage**: Filter control wrapper

**Location 2** (Line 294):

```tsx
// TODO: Update when space-037 (6px) is added to spacing scale
return (
  <Inline key={field.name} align="center" className="gap-1.5">
    <Select>{/* Single-select filter */}</Select>
  </Inline>
);
```

**Usage**: Filter control wrapper

**Location 3** (Line 349):

```tsx
{
  /* TODO: Update when space-037 (6px) is added to spacing scale */
}
<Inline align="center" className="gap-1.5">
  <Badge variant="outline" className="text-xs h-5">
    {filters.length} filters active
  </Badge>
</Inline>;
```

**Usage**: Badge wrapper

---

### Proposed Solution: Add space-037 Token

**File to Update**: `packages/ui/src/components/primitives/spacing.ts` (or equivalent)

```typescript
export const spaceScale = {
  'space-none': '0',
  'space-025': '2px',
  'space-037': '6px', // NEW - for gap-1.5
  'space-050': '4px',
  'space-075': '6px', // Note: Same as space-037, but maps to gap-3
  'space-100': '8px',
  'space-150': '12px',
  'space-200': '16px',
  'space-250': '20px',
  'space-300': '24px',
  'space-400': '32px',
  'space-500': '40px',
  'space-600': '48px',
  'space-800': '64px',
  'space-1000': '80px',
} as const;

export type SpaceScale = keyof typeof spaceScale;
```

**Note**: `space-037` and `space-075` both equal 6px but serve different purposes:

- `space-037` → gap-1.5 (tight icon spacing)
- `space-075` → gap-3 (comfortable spacing)

**Alternative Approach**: Use semantic naming instead:

```typescript
'space-icon-tight': '6px',   // gap-1.5
'space-icon-normal': '8px',  // gap-2
'space-icon-loose': '12px',  // gap-3
```

**Implementation Plan**:

1. Add `space-037` to spacing scale
2. Update SpaceScale type
3. Replace all 5 `className="gap-1.5"` with `space="space-037"`
4. Test type safety

---

## Summary by File

| File                          | Responsive TODOs | Missing Token TODOs | Total  |
| ----------------------------- | ---------------- | ------------------- | ------ |
| record-detail-page.tsx        | 3                | 0                   | 3      |
| active-table-records-page.tsx | 2                | 0                   | 2      |
| active-tables-page.tsx        | 2                | 0                   | 2      |
| active-table-card.tsx         | 2                | 2                   | 4      |
| quick-filters-bar.tsx         | 1                | 3                   | 4      |
| **TOTAL**                     | **10**           | **5**               | **15** |

---

## Priority Matrix

| Category           | Priority | Effort | Impact   | Timeline |
| ------------------ | -------- | ------ | -------- | -------- |
| Responsive Support | High     | Medium | 10 files | Sprint 2 |
| Missing space-037  | Medium   | Low    | 5 files  | Sprint 1 |

---

## Completion Checklist

### Sprint 1: Missing Token ✅ COMPLETE

- [x] Add `space-037` to spacing scale (globals.css:294)
- [x] Update TypeScript types (box.tsx, inline.tsx, stack.tsx, grid.tsx)
- [x] Replace TODO #11 (active-table-card.tsx:98)
- [x] Replace TODO #12 (active-table-card.tsx:184)
- [x] Replace TODO #13 (quick-filters-bar.tsx:234)
- [x] Replace TODO #14 (quick-filters-bar.tsx:294)
- [x] Replace TODO #15 (quick-filters-bar.tsx:349)
- [x] Test all 5 locations (zero TypeScript errors)
- [ ] Commit: "feat(primitives): add space-037 token for gap-1.5"

### Sprint 2: Responsive Props

- [ ] Design responsive props API
- [ ] Implement responsive spacing for Box
- [ ] Implement responsive spacing for Inline
- [ ] Implement responsive spacing for Stack
- [ ] Replace TODO #1 (record-detail-page.tsx:268)
- [ ] Replace TODO #2 (record-detail-page.tsx:334)
- [ ] Replace TODO #3 (record-detail-page.tsx:351)
- [ ] Replace TODO #4 (active-table-records-page.tsx:440)
- [ ] Replace TODO #5 (active-table-records-page.tsx:524)
- [ ] Replace TODO #6 (active-tables-page.tsx:254)
- [ ] Replace TODO #7 (active-tables-page.tsx:265)
- [ ] Replace TODO #8 (active-table-card.tsx:75)
- [ ] Replace TODO #9 (active-table-card.tsx:77)
- [ ] Replace TODO #10 (quick-filters-bar.tsx:192)
- [ ] Test responsive behavior across all breakpoints
- [ ] Commit: "feat(primitives): add responsive spacing props"

---

## Tracking Commands

### Find all TODOs

```bash
rg "TODO.*primitives?" apps/web/src/features/active-tables --line-number

rg "TODO.*space-037|TODO.*Update when" apps/web/src/features/active-tables --line-number
```

### Check completion status

```bash
# Should return 0 results when all fixed
rg "TODO.*Migrate to primitives when responsive" apps/web/src/features/active-tables

rg "TODO.*Update when space-037" apps/web/src/features/active-tables
```

### Verify no hardcoded gap-1.5 remains

```bash
# After fixing space-037 TODOs
rg "className=\"gap-1\.5\"" apps/web/src/features/active-tables
```

---

## Notes

- All TODOs are **safe workarounds** - code works correctly today
- TODOs represent **improvement opportunities** not bugs
- Responsive Tailwind classes work fine until primitives support breakpoints
- `className="gap-1.5"` fallback is valid until `space-037` added

**Last Verified**: 2025-11-17
**Next Review**: After Sprint 1 completion
