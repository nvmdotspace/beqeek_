# Phase 1: Design Audit and Documentation

**Phase**: 01
**Status**: ✅ Completed
**Date**: 2025-11-13
**Priority**: High
**Dependencies**: None

## Context

- [Main Plan](plan.md)
- [Workspace Dashboard](../../apps/web/src/features/workspace/pages/workspace-dashboard.tsx)
- [Modules Page](../../apps/web/src/features/active-tables/pages/active-tables-page.tsx)

## Overview

Conduct comprehensive visual audit of existing pages to identify and document all design inconsistencies across typography, spacing, sizing, and component usage.

## Key Findings

### Typography Inconsistencies

#### Page Titles

- **Modules Page**: "Modules"
  - Font size: ~32px (text-3xl)
  - Font weight: 700 (font-bold)
  - Line height: tight

- **Workspace Page**: "Bảng điều khiển Workspace"
  - Font size: ~28-30px (text-2xl)
  - Font weight: 700 (font-bold)
  - **Issue**: Different size for same hierarchy level

#### Section Headings

- "Tổng quan" (Workspace): text-lg font-semibold
- "Ungrouped" (Modules): text-xl font-bold
- **Issue**: Inconsistent sizing and weight for section headers

#### Body Text

- Card labels vary: 12px, 13px, 14px
- Metadata text: 11px vs 12px
- **Issue**: No consistent scale for body text hierarchy

### Button Inconsistencies

#### Primary Buttons

- "Tất cả nhóm" (Modules): h-9 (36px)
- "Create" (Modules): h-8 (32px)
- **Issue**: Primary action buttons different sizes

#### Filter Buttons

- Status filters: h-7 (28px)
- Some filter chips: h-8 (32px)
- **Issue**: Inconsistent filter button heights

### Card Design Variations

#### Stat Cards (StatBadge)

- **Consistent**: Both pages use StatBadge component
- Icon sizes vary: h-4 w-4 vs h-5 w-5
- **Issue**: Icon sizing not standardized

#### Content Cards

- **Modules Cards**:
  - Padding: p-4 (16px)
  - Gap between icon and text: gap-3 (12px)
  - Border: border-border/60

- **Workspace Cards**:
  - More spacious padding
  - Larger avatar sizes
  - Different internal layout

- **Issue**: Cards serve similar purposes but have different visual weights

### Spacing Inconsistencies

#### Page Container

- Modules: p-6 (24px)
- Workspace: p-[var(--space-400)] (likely 16px)
- **Issue**: Inconsistent page padding

#### Grid Gaps

- Modules: gap-6 (24px)
- Workspace: gap-[var(--space-300)] (12px)
- **Issue**: Different spacing between cards

#### Stack Spacing

- Section spacing varies: space-y-4, space-y-6, space-y-8
- **Issue**: No systematic spacing scale being followed

### Color & Border Usage

#### Borders

- Some cards: border-border/60
- Other cards: border-border/70
- **Issue**: Inconsistent border opacity

#### Badge Colors

- Encryption badges: custom colors (accent-green-subtle)
- Status badges: outline variant
- **Issue**: Badge styling not systematized

## Measurements (Estimated)

| Element        | Modules Page  | Workspace Page | Standard Needed          |
| -------------- | ------------- | -------------- | ------------------------ |
| Page Title     | 32px/2rem     | 28px/1.75rem   | 36px/2.25rem (H1)        |
| Section Header | 20px/1.25rem  | 18px/1.125rem  | 24px/1.5rem (H2)         |
| Card Title     | 14px/0.875rem | 16px/1rem      | 16px/1rem (H4)           |
| Body Text      | 13-14px       | 14px           | 14px/0.875rem            |
| Button Height  | 28-36px       | 32px           | 36px default, 32px sm    |
| Card Padding   | 16px          | 20px+          | 16px (p-4)               |
| Grid Gap       | 24px          | 12px           | 16-20px (gap-4 to gap-5) |

## Root Causes

1. **No Enforced Typography Scale**: Components use arbitrary text-\* classes
2. **Inconsistent Design Token Usage**: Some use CSS variables, others hardcoded
3. **Multiple Button Variants**: No clear size standards
4. **Lack of Component Library Review**: Similar components built differently
5. **Missing Design System Governance**: No checks before implementation

## Recommendations

### Immediate Actions

1. Define canonical typography scale (H1-H6, body, caption)
2. Standardize button sizes (default, sm, lg)
3. Create spacing scale using design tokens
4. Audit all card components for consistency

### Long-term Solutions

1. Implement ESLint rules for design token usage
2. Create Storybook for component documentation
3. Establish design review process
4. Add visual regression tests

## Risk Assessment

| Risk                        | Impact | Mitigation                         |
| --------------------------- | ------ | ---------------------------------- |
| Breaking visual consistency | Medium | Gradual rollout, phase by phase    |
| User confusion from changes | Low    | Changes are subtle refinements     |
| Development time            | Medium | Clear specifications reduce rework |
| Regression bugs             | Medium | Thorough testing after each phase  |

## Next Steps

Proceed to [Phase 2: Typography Standardization](phase-02-typography-standardization.md)

## References

- [Design System Docs](../../docs/design-system.md)
- [Typography Components](../../docs/typography-components.md)
- Screenshots analyzed: Modules page, Workspace dashboard
