# Phase 2: Typography Standardization

**Phase**: 02
**Status**: 🟡 In Progress
**Date**: 2025-11-13
**Priority**: High
**Dependencies**: Phase 1 complete

## Context

- [Main Plan](plan.md)
- [Phase 1: Analysis](phase-01-analysis-and-audit.md)
- [Typography Components](../../docs/typography-components.md)
- [Design System](../../docs/design-system.md)

## Overview

Establish and implement consistent typography system across all pages using the existing Typography components (`<Heading>`, `<Text>`, `<Metric>`).

## Current State Problems

1. Page titles use different sizes (text-2xl vs text-3xl)
2. Section headings inconsistent (text-lg vs text-xl)
3. Body text varies (text-xs, text-sm, text-base)
4. Font weights not systematized (600 vs 700 for same purpose)
5. Manual Tailwind classes instead of typography components

## Typography Scale Standard

Based on design system documentation and best practices:

### Heading Scale (Using `<Heading>` component)

| Level | Size (rem/px)   | Weight | Usage             | Tailwind Equivalent     |
| ----- | --------------- | ------ | ----------------- | ----------------------- |
| H1    | 2.25rem (36px)  | 700    | Page titles       | text-4xl font-bold      |
| H2    | 1.875rem (30px) | 600    | Section titles    | text-3xl font-semibold  |
| H3    | 1.5rem (24px)   | 600    | Subsection titles | text-2xl font-semibold  |
| H4    | 1.25rem (20px)  | 600    | Card titles       | text-xl font-semibold   |
| H5    | 1.125rem (18px) | 600    | Small headings    | text-lg font-semibold   |
| H6    | 1rem (16px)     | 600    | Smallest headings | text-base font-semibold |

### Body Text Scale (Using `<Text>` component)

| Size    | rem/px          | Weight | Usage            | Tailwind Equivalent |
| ------- | --------------- | ------ | ---------------- | ------------------- |
| Large   | 1rem (16px)     | 400    | Emphasized body  | text-base           |
| Default | 0.875rem (14px) | 400    | Standard UI text | text-sm             |
| Small   | 0.75rem (12px)  | 400    | Captions, labels | text-xs             |

### Specialized (Using `<Metric>` component)

| Size    | rem/px          | Weight | Usage             |
| ------- | --------------- | ------ | ----------------- |
| Large   | 2rem (32px)     | 700    | Dashboard metrics |
| Medium  | 1.5rem (24px)   | 700    | Card metrics      |
| Default | 1.125rem (18px) | 600    | Small metrics     |

## Implementation Plan

### Step 1: Page Titles (H1)

**Files to update:**

- `apps/web/src/features/workspace/pages/workspace-dashboard.tsx`
- `apps/web/src/features/active-tables/pages/active-tables-page.tsx`

**Changes:**

```tsx
// ❌ Before (inconsistent)
<h1 className="text-2xl font-bold">Bảng điều khiển Workspace</h1>
<Heading level={1}>Modules</Heading> // May have different styling

// ✅ After (standardized)
<Heading level={1}>Bảng điều khiển Workspace</Heading>
<Heading level={1}>Modules</Heading>
```

### Step 2: Section Headings (H2)

**Target sections:**

- "Tổng quan" (Workspace)
- "Danh sách workspace của bạn" (Workspace)
- "Ungrouped" (Modules)
- Workgroup names (Modules)

**Changes:**

```tsx
// ❌ Before
<h3 className="text-lg font-semibold">Tổng quan</h3>
<Heading level={3} className="text-lg font-semibold">Danh sách workspace của bạn</Heading>
<Heading level={2}>Ungrouped</Heading> // Inconsistent styling

// ✅ After
<Heading level={2}>Tổng quan</Heading>
<Heading level={2}>Danh sách workspace của bạn</Heading>
<Heading level={2}>Ungrouped</Heading>
```

### Step 3: Card Titles (H3/H4)

**Components to update:**

- `WorkspaceCardCompact`
- `ActiveTableCard`

**Changes:**

```tsx
// ❌ Before
<Text weight="medium" className="truncate">{table.name}</Text>

// ✅ After
<Heading level={4} className="truncate">{table.name}</Heading>
```

### Step 4: Body Text

**Standardize all body text:**

```tsx
// Small labels
<Text size="small" color="muted">Label</Text>

// Standard text
<Text>Standard content</Text>

// Emphasized
<Text weight="medium">Important text</Text>
```

### Step 5: Metrics

**Stat badges and counters:**

```tsx
// ❌ Before
<p className="text-2xl font-bold">{value}</p>

// ✅ After
<Metric value={value} />
```

## Detailed Changes by File

### workspace-dashboard.tsx

| Line | Current                                                                    | Updated                                  | Reason                      |
| ---- | -------------------------------------------------------------------------- | ---------------------------------------- | --------------------------- |
| ~38  | `<Heading level={2} className="text-2xl font-bold">`                       | `<Heading level={1}>`                    | Page title should be H1     |
| ~46  | `<Heading level={3} className="text-lg font-semibold">Tổng quan</Heading>` | `<Heading level={2}>Tổng quan</Heading>` | Section header should be H2 |
| ~132 | `<Heading level={3} className="text-lg font-semibold">`                    | `<Heading level={2}>`                    | Section header              |

### active-tables-page.tsx

| Line | Current               | Updated                  | Reason          |
| ---- | --------------------- | ------------------------ | --------------- |
| ~253 | `<Heading level={1}>` | Verify uses H1 correctly | Page title      |
| ~483 | `<Heading level={2}>` | Verify consistency       | Section headers |

### active-table-card.tsx

| Line | Current                  | Updated               | Reason     |
| ---- | ------------------------ | --------------------- | ---------- |
| ~101 | `<Text weight="medium">` | `<Heading level={4}>` | Card title |

### workspace-card-compact.tsx

Check for similar patterns.

## Testing Checklist

- [ ] All page titles render at same size
- [ ] Section headers consistent across pages
- [ ] Card titles have uniform styling
- [ ] Body text follows size hierarchy
- [ ] Vietnamese diacritics render correctly
- [ ] Dark mode maintains contrast ratios
- [ ] Responsive scaling works on mobile
- [ ] No layout shifts from size changes

## Vietnamese Typography Considerations

When `lang="vi"`:

- Line heights automatically increase 8-13%
- Font weights adjust (700→600 for headings)
- Letter spacing normalized
- All changes preserve diacritic spacing

## Accessibility Impact

| Change                | Impact                               | Mitigation                   |
| --------------------- | ------------------------------------ | ---------------------------- |
| Heading hierarchy     | ✅ Improved screen reader navigation | Semantic HTML maintained     |
| Font size consistency | ✅ Better readability                | Follows WCAG guidelines      |
| Text contrast         | ✅ Maintains AA standards            | Design tokens enforce ratios |

## Success Criteria

- [ ] Zero manual font-size classes on headings
- [ ] All headings use `<Heading>` component
- [ ] Body text uses `<Text>` component
- [ ] Metrics use `<Metric>` component
- [ ] Visual consistency verified across 3+ pages
- [ ] Typography documentation updated

## Rollout Strategy

1. **Phase 2a**: Workspace dashboard (lower traffic)
2. **Phase 2b**: Modules page
3. **Phase 2c**: Remaining pages
4. **Verification**: Visual regression tests

## Next Steps

Proceed to [Phase 3: Component Sizing](phase-03-component-sizing.md)

## References

- [Typography Components Documentation](../../docs/typography-components.md)
- [Vietnamese Typography Guide](../../docs/vietnamese-typography-guide.md)
- [WCAG 2.1 Text Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/visual-presentation)
