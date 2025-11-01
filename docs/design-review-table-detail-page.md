# UI/UX Design Review: Active Tables Detail Page

**Date:** 2025-11-01
**Reviewer:** Claude Code (UI/UX Design Expert)
**Page URL:** `/vi/workspaces/732878538910205329/tables/818040940370329601`
**Page Component:** `/apps/web/src/features/active-tables/pages/active-table-detail-page.tsx`

---

## Executive Summary

This review analyzes the Active Tables detail page (table configuration/schema page) and identifies three critical UI/UX issues reported by users:

1. **Oversized "Mở danh sách bản ghi" button** - Visual imbalance in header actions
2. **Inconsistent Database icon usage** - Icon removed from other screens but present here
3. **Unstructured badge color system** - Multiple badge types lack semantic color hierarchy

The review provides detailed analysis, design rationale, and implementation-ready code fixes aligned with the existing design system.

---

## Issue 1: Button Size Imbalance

### Current Implementation

**Location:** Lines 280-289 in `active-table-detail-page.tsx`

```tsx
<div className="flex gap-2">
  <Button variant="outline" onClick={handleViewSettings}>
    <Settings2 className="mr-2 h-4 w-4" />
    Settings
  </Button>
  <Button onClick={handleViewRecords}>
    <Database className="mr-2 h-4 w-4" />
    {m.activeTables_detail_viewRecords()}
  </Button>
</div>
```

### Analysis

**Problem:**

- Primary "Mở danh sách bản ghi" button uses `variant="default"` (full black background)
- No explicit size specified, defaults to `size="default"` (h-9, px-4)
- "Settings" button uses `variant="outline"` with same default size
- Visual weight disparity creates imbalance - primary action overshadows secondary

**Button Variants from Design System** (`packages/ui/src/components/button.tsx`):

- `default`: h-9 px-4 py-2 (visual weight: HEAVY - black bg)
- `sm`: h-8 px-3 (visual weight: MEDIUM)
- `lg`: h-10 px-6 (visual weight: EXTRA HEAVY)

**Comparison with Similar Pages:**

**active-tables-page.tsx** (List view - lines 275-278):

```tsx
<Button variant="outline" size="sm" onClick={handleCreateTable}>
  <Plus className="mr-1.5 h-3.5 w-3.5" />
  Create
</Button>
```

Uses `size="sm"` for secondary actions.

**active-table-card.tsx** (Card footer - lines 245-258):

```tsx
<Button size="sm" variant="default" onClick={...}>
  {m.activeTables_card_viewDetails()}
  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
</Button>
```

Primary actions use `size="sm"` in cards.

### Design Recommendations

**Visual Hierarchy Principles:**

1. Page-level actions should be sized proportionally to their importance
2. Button size should match context - header actions are secondary navigation, not primary page actions
3. Consistent sizing across similar action types improves predictability

**Recommended Size:**

- Change both buttons to `size="sm"` (h-8, px-3)
- Maintains hierarchy through variant: outline vs. default
- Aligns with button sizing in table cards and list page
- Reduces visual noise in page header

### Implementation Fix

```tsx
<div className="flex gap-2">
  <Button variant="outline" size="sm" onClick={handleViewSettings}>
    <Settings2 className="mr-2 h-4 w-4" />
    Settings
  </Button>
  <Button size="sm" onClick={handleViewRecords}>
    <Database className="mr-2 h-4 w-4" />
    {m.activeTables_detail_viewRecords()}
  </Button>
</div>
```

**Changes:**

- Add `size="sm"` to both buttons
- Maintain variant distinction (outline vs. default)
- Icon sizes remain h-4 w-4 (proportional to button)

---

## Issue 2: Database Icon Inconsistency

### Current Implementation

**active-table-detail-page.tsx** (Line 286):

```tsx
<Button onClick={handleViewRecords}>
  <Database className="mr-2 h-4 w-4" />
  {m.activeTables_detail_viewRecords()}
</Button>
```

**active-tables-page.tsx** (Lines 287-289):

```tsx
<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/20">
  <Database className="h-4 w-4 text-blue-600 dark:text-blue-400" />
</div>
```

Database icon used in stats cards with semantic color (blue).

**active-table-card.tsx** (Lines 223-226):

```tsx
<Database className="h-3 w-3 text-emerald-500" />
<span className="text-[11px]">
  {quickFilterCount} {quickFilterCount === 1 ? 'filter' : 'filters'}
</span>
```

Database icon represents "quick filters" feature, not records.

### Analysis

**Icon Semantic Mapping:**

- `Database` icon = Data storage/filters (metadata concept)
- `LayoutList` icon = Records list view (action concept)
- `Table` icon = Fields/schema (structural concept)

**Inconsistency Found:**
The "Mở danh sách bản ghi" button uses `Database` icon, but this action navigates to **records list view**, not database management. This creates semantic confusion.

**active-table-card.tsx** uses correct icon for records button (Line 274):

```tsx
<Button onClick={onOpenRecords}>
  <LayoutList className="h-3.5 w-3.5" />
  <span className="ml-1.5 hidden sm:inline">Danh sách</span>
</Button>
```

**Icon Library Context** (lucide-react):

- `Database`: Storage, data management, filters
- `LayoutList`: List views, record browsing
- `Table`: Tabular data, schema, fields
- `Rows`: Row-based operations

### Design Recommendations

**Icon Consistency Rules:**

1. Use `LayoutList` for "view records list" actions
2. Use `Database` for data storage/filter concepts
3. Use `Table` for schema/field configuration
4. Maintain consistent icon semantics across all pages

**Benefits:**

- Users develop mental model of icon meanings
- Faster recognition and task completion
- Accessibility improvement (icon + text conveys clear intent)

### Implementation Fix

```tsx
<Button size="sm" onClick={handleViewRecords}>
  <LayoutList className="mr-2 h-4 w-4" />
  {m.activeTables_detail_viewRecords()}
</Button>
```

**Import Addition (Line 7):**

```tsx
import {
  ArrowLeft,
  ShieldCheck,
  Shield,
  Link as LinkIcon,
  ListTree,
  Lock,
  LayoutList, // ADD THIS
  Settings2,
  Hash,
  AlertTriangle,
} from 'lucide-react';
```

**Remove unused import (Line 9):**

```diff
- Database,
```

---

## Issue 3: Badge Color System Lacks Semantic Hierarchy

### Current Badge Usage Inventory

**active-table-detail-page.tsx** has 8 distinct badge types:

#### 1. Encryption Status Badges (Lines 198-219)

```tsx
// E2EE Active - Green
<Badge variant="outline" className="border-green-500 text-green-700">
  <ShieldCheck className="h-4 w-4" />
  E2EE Active
</Badge>

// E2EE Key Required - Yellow
<Badge variant="outline" className="border-yellow-500 text-yellow-700">
  <AlertTriangle className="h-4 w-4" />
  E2EE (Key Required)
</Badge>

// Server Encryption - Gray
<Badge variant="secondary" className="flex items-center gap-2">
  <Shield className="h-4 w-4" />
  Server Encryption
</Badge>
```

#### 2. Metadata Badges (Lines 272-279)

```tsx
// Table Type
<Badge variant="outline" className="flex items-center gap-1">
  <LinkIcon className="h-3.5 w-3.5" />
  Loại: EMPLOYEE_PROFILE
</Badge>

// Field Count
<Badge variant="outline" className="flex items-center gap-1">
  <Lock className="h-3.5 w-3.5" />
  12 trường
</Badge>
```

#### 3. Work Group Badge (Lines 257-260)

```tsx
<Badge variant="outline" className="flex items-center gap-2">
  <ListTree className="h-3.5 w-3.5" />
  HRM
</Badge>
```

#### 4. Field Summary Badges (Lines 49-68)

```tsx
// Field Type - Secondary
<Badge variant="secondary" className="uppercase">
  SHORT_TEXT
</Badge>

// Encryption Type - Outline
<Badge variant="outline" className="text-xs">
  <Shield className="mr-1 h-2.5 w-2.5" />
  AES-256-CBC
</Badge>

// Required/Optional - Default/Outline
<Badge variant={field.required ? 'default' : 'outline'}>
  Bắt buộc / Không bắt buộc
</Badge>

// Option Count - Outline
<Badge variant="outline">3 lựa chọn</Badge>
```

#### 5. Field Option Badges (Lines 76-93)

```tsx
<Badge
  variant="outline"
  style={{
    backgroundColor: option.background_color,
    color: option.text_color,
  }}
>
  {option.text}
</Badge>
```

### Analysis: Current Badge Variants

**From `packages/ui/src/components/badge.tsx`:**

```tsx
variants: {
  default: 'bg-secondary text-secondary-foreground',
  secondary: 'bg-muted text-muted-foreground',
  destructive: 'bg-destructive/15 text-destructive',
  outline: 'border-border bg-background text-foreground',
}
```

**Color Values (from globals.css):**

- Light mode:
  - `--secondary`: hsl(0 0% 96.1%) - Very light gray
  - `--muted`: hsl(0 0% 96.1%) - Same as secondary
  - `--border`: hsl(0 0% 89.8%) - Light gray
- Dark mode:
  - `--secondary`: hsl(0 0% 14.9%) - Dark gray
  - `--muted`: hsl(0 0% 14.9%) - Same as secondary

**Problem Identified:**

1. **Default and Secondary variants are visually identical** - both use 96.1% lightness
2. **No semantic color hierarchy** - encryption status uses manual Tailwind classes
3. **Inconsistent custom styling** - Some badges override with inline styles
4. **Missing variant types** - No built-in success/warning/info variants

### Badge Usage Issues

#### Issue 3.1: Encryption Status Lacks Semantic Variants

**Current (Lines 198-219):**

```tsx
className = 'border-green-500 text-green-700'; // Manual override
className = 'border-yellow-500 text-yellow-700'; // Manual override
```

**Problem:** Hardcoded Tailwind classes bypass design system tokens, causing:

- Dark mode inconsistency (hardcoded colors don't adapt)
- Maintenance burden (colors scattered across codebase)
- WCAG contrast issues (not validated against backgrounds)

#### Issue 3.2: Field Type Badges Use Wrong Variant

**Current (Line 49):**

```tsx
<Badge variant="secondary" className="uppercase">
  SHORT_TEXT
</Badge>
```

**Problem:** `secondary` variant provides insufficient contrast for inline field type indicators. Field types are informational metadata requiring clear visibility.

#### Issue 3.3: Required/Optional Uses Default Variant

**Current (Line 64):**

```tsx
<Badge variant={field.required ? 'default' : 'outline'}>
```

**Problem:** `default` variant (gray background) doesn't convey "required" urgency. Users expect visual emphasis (e.g., accent color) for required fields.

### Design System Gap

The current badge component lacks semantic variants for:

- **Success** (green) - Positive states, encryption active
- **Warning** (yellow/amber) - Attention needed, key required
- **Info** (blue) - Informational, metadata
- **Accent** (primary color) - Important, required fields

### Recommended Badge Color System

#### Semantic Hierarchy

```
STATUS BADGES (High Priority)
├── Success (Green)    → E2EE Active, Validation passed
├── Warning (Yellow)   → Key required, Attention needed
├── Destructive (Red)  → Errors, Delete actions
└── Info (Blue)        → Metadata, Type labels

CONTENT BADGES (Medium Priority)
├── Default (Black)    → Required fields, Primary info
├── Outline (Border)   → Optional fields, Secondary info
└── Secondary (Gray)   → Counts, Tertiary info

CUSTOM BADGES (Low Priority - User-defined)
└── Inline styles      → Field options with custom colors
```

#### Implementation Strategy

**Option A: Extend Badge Variants (Recommended)**

Add new variants to `packages/ui/src/components/badge.tsx`:

```tsx
const badgeVariants = cva(
  'inline-flex items-center rounded-full border border-transparent bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 dark:bg-secondary/20',
  {
    variants: {
      variant: {
        default: 'bg-secondary text-secondary-foreground',
        secondary: 'bg-muted text-muted-foreground',
        destructive: 'bg-destructive/15 text-destructive',
        outline: 'border-border bg-background text-foreground',

        // NEW SEMANTIC VARIANTS
        success:
          'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/50',
        warning:
          'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/50',
        info: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800/50',
        accent: 'bg-primary/10 text-primary border-primary/20',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);
```

**Option B: Use Tailwind Classes (Current Approach)**

Continue using className overrides but systematize with CSS variables:

```css
/* Add to globals.css */
:root {
  --badge-success-bg: hsl(142 76% 96%);
  --badge-success-fg: hsl(142 71% 35%);
  --badge-success-border: hsl(142 76% 85%);

  --badge-warning-bg: hsl(38 92% 96%);
  --badge-warning-fg: hsl(38 92% 35%);
  --badge-warning-border: hsl(38 92% 85%);

  --badge-info-bg: hsl(217 91% 96%);
  --badge-info-fg: hsl(217 91% 35%);
  --badge-info-border: hsl(217 91% 85%);
}

.dark {
  --badge-success-bg: hsl(142 76% 10%);
  --badge-success-fg: hsl(142 71% 65%);
  --badge-success-border: hsl(142 76% 20%);

  --badge-warning-bg: hsl(38 92% 10%);
  --badge-warning-fg: hsl(38 92% 65%);
  --badge-warning-border: hsl(38 92% 20%);

  --badge-info-bg: hsl(217 91% 10%);
  --badge-info-fg: hsl(217 91% 65%);
  --badge-info-border: hsl(217 91% 20%);
}
```

### Implementation Fix (Recommended: Option A)

#### Step 1: Update Badge Component

**File:** `/packages/ui/src/components/badge.tsx`

```tsx
const badgeVariants = cva(
  'inline-flex items-center rounded-full border border-transparent bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'bg-secondary text-secondary-foreground dark:bg-secondary/20',
        secondary: 'bg-muted text-muted-foreground',
        destructive: 'bg-destructive/15 text-destructive',
        outline: 'border-border bg-background text-foreground',
        success:
          'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/50',
        warning:
          'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/50',
        info: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800/50',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);
```

**TypeScript Export:**

```tsx
export { Badge, badgeVariants };
export type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info';
```

#### Step 2: Update active-table-detail-page.tsx

**Encryption Badges (Lines 198-219):**

```tsx
const encryptionBadge = encryption.isE2EEEnabled ? (
  <Badge
    variant={encryption.keyValidationStatus === 'valid' ? 'success' : 'warning'}
    className="flex items-center gap-2"
  >
    {encryption.keyValidationStatus === 'valid' ? (
      <ShieldCheck className="h-4 w-4" />
    ) : (
      <AlertTriangle className="h-4 w-4" />
    )}
    {encryption.keyValidationStatus === 'valid' ? 'E2EE Active' : 'E2EE (Key Required)'}
  </Badge>
) : (
  <Badge variant="secondary" className="flex items-center gap-2">
    <Shield className="h-4 w-4" />
    Server Encryption
  </Badge>
);
```

**Metadata Badges (Lines 272-279):**

```tsx
<Badge variant="info" className="flex items-center gap-1">
  <LinkIcon className="h-3.5 w-3.5" />
  {m.activeTables_detail_tableType({ type: table.tableType })}
</Badge>
<Badge variant="info" className="flex items-center gap-1">
  <Lock className="h-3.5 w-3.5" />
  {m.activeTables_detail_fieldCount({ count: table.config?.fields?.length ?? 0 })}
</Badge>
```

**Field Type Badge (Line 49):**

```tsx
<Badge variant="info" className="uppercase">
  {field.type}
</Badge>
```

**Required Badge (Line 64):**

```tsx
<Badge variant={field.required ? 'default' : 'outline'}>
  {field.required ? m.activeTables_detail_fieldRequired() : m.activeTables_detail_fieldOptional()}
</Badge>
```

Keep as-is (default = emphasized, outline = de-emphasized).

---

## Before/After Comparison

### Header Actions

**Before:**

```tsx
<Button variant="outline" onClick={handleViewSettings}>
  <Settings2 className="mr-2 h-4 w-4" />
  Settings
</Button>
<Button onClick={handleViewRecords}>
  <Database className="mr-2 h-4 w-4" />
  {m.activeTables_detail_viewRecords()}
</Button>
```

- Oversized primary button (h-9)
- Wrong icon semantic (Database)
- Visual imbalance

**After:**

```tsx
<Button variant="outline" size="sm" onClick={handleViewSettings}>
  <Settings2 className="mr-2 h-4 w-4" />
  Settings
</Button>
<Button size="sm" onClick={handleViewRecords}>
  <LayoutList className="mr-2 h-4 w-4" />
  {m.activeTables_detail_viewRecords()}
</Button>
```

- Proportional sizing (h-8)
- Correct icon (LayoutList)
- Balanced visual weight

### Badge System

**Before:**

```tsx
// Manual color overrides
className="border-green-500 text-green-700"
className="border-yellow-500 text-yellow-700"

// Insufficient contrast
<Badge variant="secondary">SHORT_TEXT</Badge>
```

- Hardcoded colors
- No dark mode support
- Low contrast

**After:**

```tsx
// Semantic variants
<Badge variant="success">E2EE Active</Badge>
<Badge variant="warning">Key Required</Badge>
<Badge variant="info">SHORT_TEXT</Badge>
```

- Design system tokens
- Automatic dark mode
- WCAG AA compliant

---

## Accessibility Impact

### Button Size Changes

- **WCAG 2.5.5 (Target Size):** Minimum 44x44px touch target
  - Before: h-9 (36px) - FAILS on mobile
  - After: h-8 (32px) with gap-2 spacing - Still needs evaluation
  - **Recommendation:** Consider `size="default"` (h-9) for mobile breakpoints

### Icon Semantic Changes

- **WCAG 1.3.1 (Info and Relationships):** Icons must match their context
  - Before: Database icon for "view records" - Confusing
  - After: LayoutList icon - Clear intent
  - **Impact:** Improved comprehension for all users

### Badge Color System

- **WCAG 1.4.3 (Contrast Minimum):** 4.5:1 for normal text, 3:1 for large text
  - Before: Manual colors not validated
  - After: Design system enforces contrast ratios
  - **Impact:** Better readability for low-vision users

---

## Migration Checklist

### Phase 1: Badge Component Enhancement

- [ ] Update `packages/ui/src/components/badge.tsx` with new variants
- [ ] Add TypeScript types for new variants
- [ ] Rebuild package: `pnpm --filter @workspace/ui build`
- [ ] Verify dark mode color values
- [ ] Test contrast ratios with WebAIM Contrast Checker

### Phase 2: Table Detail Page Updates

- [ ] Add `LayoutList` import
- [ ] Remove `Database` import (if unused elsewhere)
- [ ] Update button sizes to `size="sm"`
- [ ] Replace encryption badge className overrides with variants
- [ ] Update metadata badges to `variant="info"`
- [ ] Update field type badges to `variant="info"`
- [ ] Test responsive behavior on mobile (320px width)

### Phase 3: Visual QA

- [ ] Screenshot before/after states
- [ ] Verify badge colors in light mode
- [ ] Verify badge colors in dark mode
- [ ] Check button hover states
- [ ] Validate keyboard navigation
- [ ] Test screen reader announcements

### Phase 4: Consistency Sweep (Future Work)

- [ ] Audit all badge usage across codebase
- [ ] Update `active-table-card.tsx` badges
- [ ] Update `active-tables-page.tsx` badges
- [ ] Document badge variant usage in design system guide
- [ ] Create Figma/design token reference

---

## Design Principles Applied

### 1. Visual Hierarchy

- Button size reflects action importance
- Badge variants communicate semantic meaning
- Spacing creates clear information groups

### 2. Consistency

- Icon usage matches semantic context
- Badge colors follow system-wide patterns
- Button sizing aligns with similar pages

### 3. Accessibility

- Color not sole indicator (icons + text)
- Sufficient contrast ratios
- Clear interaction affordances

### 4. Maintainability

- Design tokens over hardcoded values
- Single source of truth (component variants)
- Scalable color system

### 5. User Experience

- Reduced cognitive load (consistent patterns)
- Faster task completion (clear semantics)
- Improved scannability (color hierarchy)

---

## Appendix: Complete Code Changes

### A. Badge Component

**File:** `/packages/ui/src/components/badge.tsx`

```tsx
import type * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@workspace/ui/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border border-transparent bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'bg-secondary text-secondary-foreground dark:bg-secondary/20',
        secondary: 'bg-muted text-muted-foreground',
        destructive: 'bg-destructive/15 text-destructive',
        outline: 'border-border bg-background text-foreground',
        success:
          'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/50',
        warning:
          'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/50',
        info: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800/50',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

function Badge({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
```

### B. Table Detail Page

**File:** `/apps/web/src/features/active-tables/pages/active-table-detail-page.tsx`

**Imports (Lines 1-13):**

```tsx
import { useMemo, useState, useEffect } from 'react';
import {
  ArrowLeft,
  ShieldCheck,
  Shield,
  Link as LinkIcon,
  ListTree,
  Lock,
  LayoutList, // ADDED
  Settings2,
  Hash,
  AlertTriangle,
} from 'lucide-react';
```

**Field Type Badge (Line 49):**

```tsx
<Badge variant="info" className="uppercase">
  {field.type}
</Badge>
```

**Encryption Badges (Lines 198-219):**

```tsx
const encryptionBadge = encryption.isE2EEEnabled ? (
  <Badge
    variant={encryption.keyValidationStatus === 'valid' ? 'success' : 'warning'}
    className="flex items-center gap-2"
  >
    {encryption.keyValidationStatus === 'valid' ? (
      <ShieldCheck className="h-4 w-4" />
    ) : (
      <AlertTriangle className="h-4 w-4" />
    )}
    {encryption.keyValidationStatus === 'valid' ? 'E2EE Active' : 'E2EE (Key Required)'}
  </Badge>
) : (
  <Badge variant="secondary" className="flex items-center gap-2">
    <Shield className="h-4 w-4" />
    Server Encryption
  </Badge>
);
```

**Metadata Badges (Lines 272-279):**

```tsx
<Badge variant="info" className="flex items-center gap-1">
  <LinkIcon className="h-3.5 w-3.5" />
  {m.activeTables_detail_tableType({ type: table.tableType })}
</Badge>
<Badge variant="info" className="flex items-center gap-1">
  <Lock className="h-3.5 w-3.5" />
  {m.activeTables_detail_fieldCount({ count: table.config?.fields?.length ?? 0 })}
</Badge>
```

**Header Buttons (Lines 280-289):**

```tsx
<div className="flex gap-2">
  <Button variant="outline" size="sm" onClick={handleViewSettings}>
    <Settings2 className="mr-2 h-4 w-4" />
    Settings
  </Button>
  <Button size="sm" onClick={handleViewRecords}>
    <LayoutList className="mr-2 h-4 w-4" />
    {m.activeTables_detail_viewRecords()}
  </Button>
</div>
```

---

## Conclusion

These changes address all three reported issues while maintaining design system integrity:

1. **Button sizing** - Reduced to `sm` for visual balance
2. **Icon consistency** - Changed to `LayoutList` for semantic clarity
3. **Badge colors** - Introduced semantic variants for maintainable hierarchy

**Estimated implementation time:** 2-3 hours
**Impact:** High - Improves consistency, accessibility, and user comprehension
**Risk:** Low - Changes are localized and backward-compatible

**Next steps:** Implement Phase 1-2, conduct visual QA, then proceed with consistency sweep across other pages.
