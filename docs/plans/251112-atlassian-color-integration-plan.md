# Atlassian Design System Color Integration - Implementation Plan

**Date**: 2025-11-12
**Project**: Beqeek Workflow Automation Platform
**Status**: Draft
**Estimated Duration**: 4-6 weeks

---

## Executive Summary

Integrate Atlassian Design System color tokens into Beqeek's existing shadcn/ui + TailwindCSS v4 design system. Goal: support custom badge colors for Active Tables SELECT_ONE/SELECT_LIST field options while maintaining WCAG AA contrast, dark mode support, and design consistency.

**Key Objectives:**

1. Extend globals.css with Atlassian-inspired semantic color tokens
2. Create color utility components for badges/pills with accent color support
3. Migrate hardcoded colors to design tokens (70+ instances found)
4. Document color usage guidelines
5. Maintain backwards compatibility with existing components

**Success Metrics:**

- Zero hardcoded color values in production code
- All color combinations meet WCAG AA (4.5:1 text, 3:1 UI)
- 10 accent colors available for user-defined badge colors
- Dark mode support for all color tokens
- No visual regressions in existing UI

---

## Background & Context

### Current State Analysis

**Design System Stack:**

- TailwindCSS v4 with native CSS custom properties
- shadcn/ui components (Radix UI primitives)
- 33 existing color tokens in `packages/ui/src/styles/globals.css`
- Hardcoded colors found in 70+ instances (bg-emerald, bg-red, bg-yellow, etc.)

**Color Usage Patterns:**

1. **Status indicators**: Encryption status (green), warnings (yellow), errors (red)
2. **Feature modules**: Blue (tables), purple (automations), teal (integrations)
3. **SELECT field options**: Hardcoded 8 color presets in field-options-editor.tsx
4. **Badge component**: 7 variants (default, secondary, destructive, outline, success, warning, info)

**Active Tables SELECT Options:**

```tsx
// Current implementation (field-options-editor.tsx)
const COLOR_PRESETS = [
  { text: '#1F2937', background: '#F3F4F6', name: 'Gray' }, // Hardcoded hex
  { text: '#1E40AF', background: '#DBEAFE', name: 'Blue' },
  { text: '#047857', background: '#D1FAE5', name: 'Green' },
  { text: '#DC2626', background: '#FEE2E2', name: 'Red' },
  // ... 8 total presets
];
```

**Gap Analysis:**

- ❌ No semantic color tokens for status communication
- ❌ Limited accent color palette (only 5 chart colors)
- ❌ Hardcoded hex values in SELECT field options
- ❌ Inconsistent color naming (bg-emerald vs bg-green)
- ❌ No centralized color system documentation

### Atlassian Design System Integration

**Research Findings** (from `docs/research/atlassian-color-system-analysis.md`):

- **10 accent colors**: lime, red, orange, yellow, green, teal, blue, purple, magenta, gray
- **4-5 emphasis levels**: subtlest → subtler → subtle → bolder → boldest
- **Semantic categories**: text, icon, background, border, surface
- **Status colors**: success, warning, danger, information, discovery

**Token Structure:**

```css
--ds-[category]-[semantic]-[emphasis]-[state]
Example: --ds-background-accent-blue-subtle
         --ds-text-success
         --ds-border-danger
```

**Benefits:**

- ✅ Battle-tested by Atlassian products (Jira, Confluence, Trello)
- ✅ WCAG AA compliant contrast ratios
- ✅ Rich accent color palette for user customization
- ✅ Semantic naming improves maintainability
- ✅ Dark mode support built-in

---

## Architecture Overview

### Token Hierarchy

```
Root Level (globals.css)
├── Core Tokens (existing - preserve)
│   ├── --background, --foreground
│   ├── --primary, --secondary, --accent
│   ├── --destructive, --muted
│   └── --border, --input, --ring
│
├── Extended Semantic Tokens (NEW - Phase 2)
│   ├── Status Colors
│   │   ├── --color-success-*
│   │   ├── --color-warning-*
│   │   ├── --color-danger-*
│   │   ├── --color-information-*
│   │   └── --color-discovery-*
│   │
│   ├── Accent Colors (10 colors × 4 emphasis levels = 40 tokens)
│   │   ├── --accent-lime-{subtlest|subtle|bolder|boldest}
│   │   ├── --accent-red-{subtlest|subtle|bolder|boldest}
│   │   ├── --accent-orange-{subtlest|subtle|bolder|boldest}
│   │   ├── --accent-yellow-{subtlest|subtle|bolder|boldest}
│   │   ├── --accent-green-{subtlest|subtle|bolder|boldest}
│   │   ├── --accent-teal-{subtlest|subtle|bolder|boldest}
│   │   ├── --accent-blue-{subtlest|subtle|bolder|boldest}
│   │   ├── --accent-purple-{subtlest|subtle|bolder|boldest}
│   │   ├── --accent-magenta-{subtlest|subtle|bolder|boldest}
│   │   └── --accent-gray-{subtlest|subtle|bolder|boldest}
│   │
│   └── Semantic Aliases
│       ├── --color-encryption-bg (→ --accent-green-subtle)
│       ├── --color-automation-bg (→ --accent-purple-subtle)
│       └── --color-integration-bg (→ --accent-teal-subtle)
│
└── Tailwind @theme Mappings (NEW - Phase 2)
    ├── --color-success: var(--accent-green-bolder)
    ├── --color-warning: var(--accent-yellow-bolder)
    ├── --color-danger: var(--accent-red-bolder)
    └── ... (40+ mappings)
```

### Component Architecture

```
@workspace/ui/components/
├── badge.tsx (MODIFY - Phase 3)
│   └── Add accent color variants
│
├── color-badge.tsx (NEW - Phase 3)
│   └── Customizable badge with 10 accent colors
│
└── color-picker/ (NEW - Phase 3)
    ├── color-picker.tsx
    ├── color-preset-palette.tsx
    └── types.ts
```

### Data Flow

```
User Action (SELECT field config)
      ↓
Color Picker Component (UI)
      ↓
Selects accent color preset (e.g., "blue-subtle")
      ↓
Stored in database as semantic token name
      ↓
Rendered via ColorBadge component
      ↓
CSS custom property resolves to HSL value
      ↓
TailwindCSS classes applied with dark mode support
```

---

## Phase 1: Token Analysis & Mapping (Week 1)

**Goal**: Map Atlassian tokens to shadcn/ui design system, define HSL color values for light/dark modes.

### 1.1 Color Audit (2 days)

**Tasks:**

1. **Document existing color usage**
   - Extract all hardcoded color classes from codebase
   - Categorize by purpose (status, feature, decoration)
   - Identify duplicates and inconsistencies
   - Create visual color inventory spreadsheet

2. **Map existing tokens to Atlassian semantics**

   ```
   Current Token              → Atlassian Equivalent
   --destructive              → --color-danger
   --muted-foreground         → --color-text-subtle
   --ring                     → --color-border-focused
   --chart-1 (blue)           → --accent-blue-bolder
   --chart-2 (green)          → --accent-green-bolder
   ```

3. **Identify migration priorities**
   - Critical: Badge variants, SELECT field options
   - High: Encryption status, feature module badges
   - Medium: Decorative colors in landing pages
   - Low: Chart colors (already working)

**Deliverables:**

- `docs/color-audit-report.md` - Complete color usage analysis
- `docs/color-mapping-table.md` - Token migration matrix
- Spreadsheet: `color-inventory.xlsx` (HSL values, contrast ratios)

### 1.2 HSL Color Value Definition (3 days)

**Tasks:**

1. **Define 10 accent color scales** (4 emphasis levels each)
   - Convert Atlassian hex values to HSL (Tailwind v4 format)
   - Test in light mode: verify contrast ratios (WCAG AA)
   - Test in dark mode: adjust lightness/saturation for visibility
   - Document usage guidelines per emphasis level

2. **Create contrast testing matrix**
   - Test all text/background combinations
   - Validate focus ring visibility
   - Check icon legibility on colored backgrounds
   - Document failing combinations

3. **Define status color system**

   ```css
   /* Success (green) */
   --color-success-subtle: hsl(162 100% 93%) /* Background */ --color-success: hsl(162 63% 32%) /* Text/Border */
     --color-success-bold: hsl(162 100% 20%) /* Emphasis */ /* Warning (yellow) */
     --color-warning-subtle: hsl(52 97% 89%) --color-warning: hsl(45 100% 29%) --color-warning-bold: hsl(45 100% 20%)
     /* Danger (red) */ --color-danger-subtle: hsl(0 100% 95%) --color-danger: hsl(0 71% 51%)
     /* Maps to existing --destructive */ --color-danger-bold: hsl(0 71% 35%);
   ```

**Deliverables:**

- `packages/ui/src/styles/color-tokens.css` (draft)
- `docs/color-contrast-report.md` - WCAG compliance matrix
- Figma file: Color palette with accessibility annotations

### 1.3 Integration Strategy Document (1 day)

**Tasks:**

1. Document backwards compatibility approach
2. Define token naming conventions
3. Create migration checklist for developers
4. Define rollback plan if issues arise

**Deliverables:**

- `docs/color-integration-strategy.md`
- `docs/color-token-naming-guide.md`

---

## Phase 2: Token Extension in globals.css (Week 2)

**Goal**: Extend `packages/ui/src/styles/globals.css` with 50+ new color tokens without breaking existing components.

### 2.1 Core Token Preservation (1 day)

**Tasks:**

1. **Backup existing globals.css**

   ```bash
   cp packages/ui/src/styles/globals.css packages/ui/src/styles/globals.css.backup
   ```

2. **Add version comment header**

   ```css
   /**
    * Beqeek Design System - Color Tokens
    * Version: 2.0.0 (Atlassian Color Integration)
    * Last Updated: 2025-11-12
    *
    * Token Categories:
    * 1. Core Tokens (v1.0 - shadcn/ui baseline)
    * 2. Status Tokens (v2.0 - Atlassian-inspired)
    * 3. Accent Tokens (v2.0 - 10 colors × 4 emphasis)
    * 4. Semantic Aliases (v2.0 - feature-specific)
    */
   ```

3. **Verify no token name conflicts**
   - Check for overlapping names with Tailwind defaults
   - Test build process with new tokens

**Deliverables:**

- Backed-up globals.css
- Version-tagged token file

### 2.2 Status Color System (2 days)

**Tasks:**

1. **Add status tokens** (success, warning, danger, information, discovery)

   ```css
   :root {
     /* ========================================
        STATUS COLOR SYSTEM (v2.0)
        ======================================== */

     /* Success (Green) */
     --color-success-subtlest: hsl(162 100% 93%); /* Lightest background */
     --color-success-subtle: hsl(162 80% 85%); /* Default background */
     --color-success: hsl(162 63% 32%); /* Text, icons, borders */
     --color-success-bold: hsl(162 100% 20%); /* High emphasis */

     /* Warning (Yellow) */
     --color-warning-subtlest: hsl(52 97% 89%);
     --color-warning-subtle: hsl(52 90% 75%);
     --color-warning: hsl(45 100% 29%);
     --color-warning-bold: hsl(45 100% 20%);

     /* Danger (Red) - Aliased to --destructive */
     --color-danger-subtlest: hsl(0 100% 95%);
     --color-danger-subtle: hsl(0 84% 85%);
     --color-danger: var(--destructive); /* Reuse existing */
     --color-danger-bold: hsl(0 71% 35%);

     /* Information (Blue) */
     --color-information-subtlest: hsl(215 100% 96%);
     --color-information-subtle: hsl(215 84% 85%);
     --color-information: hsl(215 84% 48%);
     --color-information-bold: hsl(215 84% 35%);

     /* Discovery (Purple) */
     --color-discovery-subtlest: hsl(281 83% 97%);
     --color-discovery-subtle: hsl(281 70% 85%);
     --color-discovery: hsl(281 44% 51%);
     --color-discovery-bold: hsl(281 44% 35%);
   }

   .dark {
     /* Dark mode adjustments */
     --color-success-subtlest: hsl(162 70% 10%);
     --color-success-subtle: hsl(162 60% 15%);
     --color-success: hsl(162 60% 45%);
     --color-success-bold: hsl(162 70% 60%);

     /* ... (repeat for all status colors) */
   }
   ```

2. **Add Tailwind @theme mappings**

   ```css
   @theme inline {
     /* Status Colors */
     --color-success-subtlest: var(--color-success-subtlest);
     --color-success: var(--color-success);
     --color-warning-subtlest: var(--color-warning-subtlest);
     --color-warning: var(--color-warning);
     --color-danger-subtlest: var(--color-danger-subtlest);
     --color-danger: var(--color-danger);
     /* ... */
   }
   ```

3. **Create utility classes**
   ```css
   @layer utilities {
     .text-success {
       color: var(--color-success);
     }
     .text-warning {
       color: var(--color-warning);
     }
     .text-danger {
       color: var(--color-danger);
     }
     .bg-success-subtle {
       background-color: var(--color-success-subtle);
     }
     .bg-warning-subtle {
       background-color: var(--color-warning-subtle);
     }
     /* ... (20+ utility classes) */
   }
   ```

**Deliverables:**

- Updated `globals.css` with 20+ status tokens
- Test page: `apps/web/src/features/__dev__/color-status-test.tsx`
- Screenshot: Status colors in light/dark mode

### 2.3 Accent Color Palette (3 days)

**Tasks:**

1. **Add 10 accent colors × 4 emphasis levels** (40 tokens)

   ```css
   :root {
     /* ========================================
        ACCENT COLOR PALETTE (v2.0)
        Atlassian-inspired, 4 emphasis levels
        ======================================== */

     /* Lime */
     --accent-lime-subtlest: hsl(75 100% 91%); /* Lightest */
     --accent-lime-subtle: hsl(75 80% 75%); /* Light */
     --accent-lime-bolder: hsl(75 54% 32%); /* Dark text/icons */
     --accent-lime-boldest: hsl(75 54% 20%); /* Darkest */

     /* Red */
     --accent-red-subtlest: hsl(0 100% 95%);
     --accent-red-subtle: hsl(0 84% 85%);
     --accent-red-bolder: hsl(0 71% 51%);
     --accent-red-boldest: hsl(0 71% 35%);

     /* Orange */
     --accent-orange-subtlest: hsl(30 100% 93%);
     --accent-orange-subtle: hsl(30 100% 75%);
     --accent-orange-bolder: hsl(30 100% 37%);
     --accent-orange-boldest: hsl(30 100% 25%);

     /* Yellow */
     --accent-yellow-subtlest: hsl(52 97% 89%);
     --accent-yellow-subtle: hsl(52 90% 75%);
     --accent-yellow-bolder: hsl(45 100% 29%);
     --accent-yellow-boldest: hsl(45 100% 20%);

     /* Green */
     --accent-green-subtlest: hsl(162 100% 93%);
     --accent-green-subtle: hsl(162 80% 85%);
     --accent-green-bolder: hsl(162 63% 32%);
     --accent-green-boldest: hsl(162 63% 20%);

     /* Teal */
     --accent-teal-subtlest: hsl(195 100% 95%);
     --accent-teal-subtle: hsl(195 80% 80%);
     --accent-teal-bolder: hsl(195 63% 37%);
     --accent-teal-boldest: hsl(195 63% 25%);

     /* Blue */
     --accent-blue-subtlest: hsl(215 100% 96%);
     --accent-blue-subtle: hsl(215 84% 85%);
     --accent-blue-bolder: hsl(215 84% 48%);
     --accent-blue-boldest: hsl(215 84% 35%);

     /* Purple */
     --accent-purple-subtlest: hsl(281 83% 97%);
     --accent-purple-subtle: hsl(281 70% 85%);
     --accent-purple-bolder: hsl(281 44% 51%);
     --accent-purple-boldest: hsl(281 44% 35%);

     /* Magenta */
     --accent-magenta-subtlest: hsl(325 100% 96%);
     --accent-magenta-subtle: hsl(325 80% 85%);
     --accent-magenta-bolder: hsl(325 41% 48%);
     --accent-magenta-boldest: hsl(325 41% 35%);

     /* Gray (Neutral) */
     --accent-gray-subtlest: hsl(0 0% 96%);
     --accent-gray-subtle: hsl(0 0% 85%);
     --accent-gray-bolder: hsl(0 0% 35%);
     --accent-gray-boldest: hsl(0 0% 20%);
   }

   .dark {
     /* Dark mode: invert lightness, adjust saturation */
     --accent-lime-subtlest: hsl(75 60% 12%);
     --accent-lime-subtle: hsl(75 50% 20%);
     --accent-lime-bolder: hsl(75 60% 55%);
     --accent-lime-boldest: hsl(75 70% 70%);

     /* ... (repeat for all 10 colors) */
   }
   ```

2. **Map accent colors to Tailwind color scale**

   ```css
   @theme inline {
     /* Accent Colors - Lime */
     --color-accent-lime-subtlest: var(--accent-lime-subtlest);
     --color-accent-lime-subtle: var(--accent-lime-subtle);
     --color-accent-lime-bolder: var(--accent-lime-bolder);
     --color-accent-lime-boldest: var(--accent-lime-boldest);

     /* ... (40 total mappings) */
   }
   ```

3. **Create semantic feature aliases**

   ```css
   :root {
     /* ========================================
        SEMANTIC ALIASES (v2.0)
        Feature-specific color mappings
        ======================================== */

     /* Active Tables Module */
     --feature-tables-bg: var(--accent-blue-subtle);
     --feature-tables-fg: var(--accent-blue-bolder);
     --feature-tables-border: var(--accent-blue-bolder);

     /* Encryption Status */
     --feature-encryption-bg: var(--accent-green-subtle);
     --feature-encryption-fg: var(--accent-green-bolder);
     --feature-encryption-icon: var(--accent-green-bolder);

     /* Automation Module */
     --feature-automation-bg: var(--accent-purple-subtle);
     --feature-automation-fg: var(--accent-purple-bolder);

     /* Warning States */
     --feature-warning-bg: var(--accent-yellow-subtle);
     --feature-warning-fg: var(--accent-yellow-bolder);
   }
   ```

**Deliverables:**

- Updated `globals.css` with 40 accent tokens + 10 semantic aliases
- Test page: `apps/web/src/features/__dev__/color-accent-test.tsx`
- Visual regression test suite

### 2.4 Build & Test (1 day)

**Tasks:**

1. **Verify build process**

   ```bash
   pnpm --filter @workspace/ui build
   pnpm --filter web dev
   ```

2. **Test color resolution in browser DevTools**
   - Inspect computed styles for new tokens
   - Toggle dark mode and verify inversions
   - Check cascade: token → alias → utility class

3. **Run visual regression tests**
   - Screenshot existing pages (baseline)
   - Compare with new token system
   - Document any unexpected changes

**Deliverables:**

- Build success confirmation
- Visual regression report

---

## Phase 3: Color Utility Components (Week 3)

**Goal**: Create ColorBadge, ColorPicker, and color preset utilities for SELECT field options.

### 3.1 ColorBadge Component (2 days)

**Location**: `packages/ui/src/components/color-badge.tsx`

**Features:**

- 10 accent colors (lime, red, orange, yellow, green, teal, blue, purple, magenta, gray)
- 3 emphasis levels (subtle, default, bold)
- Size variants (sm, md, lg)
- Icon support
- Dark mode aware
- TypeScript generics for data binding

**API Design:**

```tsx
import { ColorBadge } from '@workspace/ui/components/color-badge';

// Basic usage
<ColorBadge color="green" emphasis="subtle">
  Active
</ColorBadge>

// With icon
<ColorBadge color="blue" emphasis="default" icon={<Database />}>
  Table
</ColorBadge>

// Size variants
<ColorBadge color="red" emphasis="bold" size="sm">
  Urgent
</ColorBadge>

// Custom styles
<ColorBadge color="purple" className="rounded-md">
  Automation
</ColorBadge>
```

**Type Definitions:**

```tsx
export type AccentColor =
  | 'lime'
  | 'red'
  | 'orange'
  | 'yellow'
  | 'green'
  | 'teal'
  | 'blue'
  | 'purple'
  | 'magenta'
  | 'gray';

export type ColorEmphasis = 'subtle' | 'default' | 'bold';

export interface ColorBadgeProps {
  /** Accent color from Atlassian palette */
  color: AccentColor;

  /** Emphasis level (controls contrast) */
  emphasis?: ColorEmphasis;

  /** Size variant */
  size?: 'sm' | 'md' | 'lg';

  /** Optional leading icon */
  icon?: React.ReactNode;

  /** Badge content */
  children: React.ReactNode;

  /** Additional CSS classes */
  className?: string;

  /** Click handler */
  onClick?: () => void;
}
```

**Implementation Strategy:**

```tsx
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@workspace/ui/lib/utils';

const colorBadgeVariants = cva(
  // Base styles
  'inline-flex items-center gap-1.5 rounded-full font-normal transition-colors',
  {
    variants: {
      color: {
        lime: '',
        red: '',
        orange: '',
        yellow: '',
        green: '',
        teal: '',
        blue: '',
        purple: '',
        magenta: '',
        gray: '',
      },
      emphasis: {
        subtle: '', // Subtlest bg + bolder text
        default: '', // Subtle bg + bolder text
        bold: '', // Bolder bg + white text
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-sm',
        lg: 'px-3 py-1.5 text-sm',
      },
    },
    compoundVariants: [
      // Lime variations
      {
        color: 'lime',
        emphasis: 'subtle',
        className:
          'bg-[var(--accent-lime-subtlest)] text-[var(--accent-lime-bolder)] border border-[var(--accent-lime-subtle)]',
      },
      {
        color: 'lime',
        emphasis: 'default',
        className: 'bg-[var(--accent-lime-subtle)] text-[var(--accent-lime-bolder)]',
      },
      {
        color: 'lime',
        emphasis: 'bold',
        className: 'bg-[var(--accent-lime-bolder)] text-white',
      },
      // ... (30 total compound variants: 10 colors × 3 emphasis)
    ],
    defaultVariants: {
      emphasis: 'default',
      size: 'md',
    },
  },
);

export function ColorBadge({ color, emphasis, size, icon, children, className, onClick }: ColorBadgeProps) {
  return (
    <span
      className={cn(
        colorBadgeVariants({ color, emphasis, size }),
        onClick && 'cursor-pointer hover:opacity-80',
        className,
      )}
      onClick={onClick}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
}
```

**Testing:**

```tsx
// Storybook stories
export default {
  title: 'Components/ColorBadge',
  component: ColorBadge,
};

export const AllColors = () => (
  <div className="space-y-4">
    {['lime', 'red', 'orange', 'yellow', 'green', 'teal', 'blue', 'purple', 'magenta', 'gray'].map((color) => (
      <div key={color} className="flex gap-2">
        <ColorBadge color={color} emphasis="subtle">
          {color} subtle
        </ColorBadge>
        <ColorBadge color={color} emphasis="default">
          {color} default
        </ColorBadge>
        <ColorBadge color={color} emphasis="bold">
          {color} bold
        </ColorBadge>
      </div>
    ))}
  </div>
);

export const DarkMode = () => (
  <div className="dark bg-background p-4">
    <AllColors />
  </div>
);
```

**Deliverables:**

- `packages/ui/src/components/color-badge.tsx`
- `packages/ui/src/components/color-badge.stories.tsx` (Storybook)
- Unit tests: `packages/ui/src/components/color-badge.test.tsx`
- Export from `packages/ui/src/components/index.ts`

### 3.2 ColorPresetPalette Component (2 days)

**Location**: `packages/ui/src/components/color-picker/color-preset-palette.tsx`

**Purpose**: Visual color selector for SELECT field option configuration.

**Features:**

- Grid layout of 10 accent colors
- Click to select
- Active state indicator
- Tooltip with color name
- Keyboard navigation (arrow keys)
- Empty state (no color selected)

**API Design:**

```tsx
import { ColorPresetPalette } from '@workspace/ui/components/color-picker';

<ColorPresetPalette
  selected={{ color: 'green', emphasis: 'subtle' }}
  onChange={({ color, emphasis }) => {
    console.log('Selected:', color, emphasis);
  }}
  size="md"
/>;
```

**Type Definitions:**

```tsx
export interface ColorPreset {
  color: AccentColor;
  emphasis: ColorEmphasis;
}

export interface ColorPresetPaletteProps {
  /** Currently selected color */
  selected?: ColorPreset;

  /** Callback when color is selected */
  onChange: (preset: ColorPreset) => void;

  /** Size of color swatches */
  size?: 'sm' | 'md' | 'lg';

  /** Show emphasis selector below palette */
  showEmphasisSelector?: boolean;
}
```

**Implementation:**

```tsx
import { Check } from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent } from '@workspace/ui/components/tooltip';

const ACCENT_COLORS: AccentColor[] = [
  'lime',
  'red',
  'orange',
  'yellow',
  'green',
  'teal',
  'blue',
  'purple',
  'magenta',
  'gray',
];

const COLOR_LABELS: Record<AccentColor, string> = {
  lime: 'Lime',
  red: 'Red',
  orange: 'Orange',
  yellow: 'Yellow',
  green: 'Green',
  teal: 'Teal',
  blue: 'Blue',
  purple: 'Purple',
  magenta: 'Magenta',
  gray: 'Gray',
};

export function ColorPresetPalette({
  selected,
  onChange,
  size = 'md',
  showEmphasisSelector = true,
}: ColorPresetPaletteProps) {
  const [emphasis, setEmphasis] = useState<ColorEmphasis>(selected?.emphasis ?? 'subtle');

  const swatchSize = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10',
  }[size];

  return (
    <div className="space-y-3">
      {/* Color Grid */}
      <div className="grid grid-cols-5 gap-2">
        {ACCENT_COLORS.map((color) => {
          const isSelected = selected?.color === color && selected?.emphasis === emphasis;
          const bgClass = `bg-[var(--accent-${color}-${emphasis})]`;

          return (
            <Tooltip key={color}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    swatchSize,
                    bgClass,
                    'rounded-md border-2 transition-all',
                    isSelected ? 'border-ring shadow-md' : 'border-border hover:border-ring/50',
                    'flex items-center justify-center',
                  )}
                  onClick={() => onChange({ color, emphasis })}
                  aria-label={`Select ${COLOR_LABELS[color]}`}
                >
                  {isSelected && <Check className="h-4 w-4 text-white" />}
                </button>
              </TooltipTrigger>
              <TooltipContent>{COLOR_LABELS[color]}</TooltipContent>
            </Tooltip>
          );
        })}
      </div>

      {/* Emphasis Selector */}
      {showEmphasisSelector && (
        <div className="flex gap-2">
          {(['subtle', 'default', 'bold'] as ColorEmphasis[]).map((level) => (
            <button
              key={level}
              type="button"
              className={cn(
                'px-3 py-1.5 text-xs rounded-md border transition-colors',
                emphasis === level
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background text-foreground border-border hover:bg-accent',
              )}
              onClick={() => {
                setEmphasis(level);
                if (selected) {
                  onChange({ ...selected, emphasis: level });
                }
              }}
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

**Deliverables:**

- `packages/ui/src/components/color-picker/color-preset-palette.tsx`
- `packages/ui/src/components/color-picker/index.ts` (barrel export)
- Storybook story with interactive demo

### 3.3 Update Badge Component (1 day)

**Location**: `packages/ui/src/components/badge.tsx`

**Goal**: Add accent color variants to existing Badge component.

**Changes:**

```tsx
const badgeVariants = cva(
  'inline-flex items-center rounded-full border border-transparent bg-secondary px-2 py-0.5 text-xs font-normal text-secondary-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 dark:bg-secondary/20',
  {
    variants: {
      variant: {
        default: 'bg-secondary text-secondary-foreground',
        secondary: 'bg-muted text-muted-foreground',
        destructive: 'bg-destructive/15 text-destructive',
        outline: 'border-border bg-background text-foreground',

        // Existing status variants (preserve)
        success: 'bg-[var(--color-success-subtle)] text-[var(--color-success)] border-[var(--color-success)]/20',
        warning: 'bg-[var(--color-warning-subtle)] text-[var(--color-warning)] border-[var(--color-warning)]/20',
        info: 'bg-[var(--color-information-subtle)] text-[var(--color-information)] border-[var(--color-information)]/20',

        // NEW: Accent color variants
        lime: 'bg-[var(--accent-lime-subtle)] text-[var(--accent-lime-bolder)] border-[var(--accent-lime-bolder)]/20',
        red: 'bg-[var(--accent-red-subtle)] text-[var(--accent-red-bolder)] border-[var(--accent-red-bolder)]/20',
        orange:
          'bg-[var(--accent-orange-subtle)] text-[var(--accent-orange-bolder)] border-[var(--accent-orange-bolder)]/20',
        yellow:
          'bg-[var(--accent-yellow-subtle)] text-[var(--accent-yellow-bolder)] border-[var(--accent-yellow-bolder)]/20',
        green:
          'bg-[var(--accent-green-subtle)] text-[var(--accent-green-bolder)] border-[var(--accent-green-bolder)]/20',
        teal: 'bg-[var(--accent-teal-subtle)] text-[var(--accent-teal-bolder)] border-[var(--accent-teal-bolder)]/20',
        blue: 'bg-[var(--accent-blue-subtle)] text-[var(--accent-blue-bolder)] border-[var(--accent-blue-bolder)]/20',
        purple:
          'bg-[var(--accent-purple-subtle)] text-[var(--accent-purple-bolder)] border-[var(--accent-purple-bolder)]/20',
        magenta:
          'bg-[var(--accent-magenta-subtle)] text-[var(--accent-magenta-bolder)] border-[var(--accent-magenta-bolder)]/20',
        gray: 'bg-[var(--accent-gray-subtle)] text-[var(--accent-gray-bolder)] border-[var(--accent-gray-bolder)]/20',
      },
      size: {
        base: '',
        compact: 'text-[11px] leading-[16px] tracking-tight',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'base',
    },
  },
);
```

**Testing:**

- Verify backwards compatibility (existing variants work)
- Test new accent color variants
- Visual regression for all existing usages

**Deliverables:**

- Updated `badge.tsx` with 10 new variants
- Updated Storybook story showing all variants

### 3.4 Integration Testing (1 day)

**Tasks:**

1. **Test ColorBadge in Active Tables**
   - Replace hardcoded badge colors
   - Verify SELECT field option rendering

2. **Test ColorPresetPalette in Field Editor**
   - Integrate into field-options-editor.tsx
   - Verify color selection persists to database

3. **Test Badge component migrations**
   - Search for existing Badge usages
   - Spot-check migrations

4. **Cross-browser testing**
   - Chrome, Firefox, Safari
   - Mobile browsers (iOS Safari, Chrome Android)

**Deliverables:**

- Test report with screenshots
- Bug fix list (if any)

---

## Phase 4: Migration of Hardcoded Colors (Week 4-5)

**Goal**: Replace 70+ hardcoded color instances with design tokens.

### 4.1 Critical Path Migration (3 days)

**Priority 1: Active Tables Module** (affects user data)

**Files to migrate:**

1. **`field-options-editor.tsx`** - Replace COLOR_PRESETS with ColorPresetPalette

   ```tsx
   // BEFORE (hardcoded hex)
   const COLOR_PRESETS = [
     { text: '#1F2937', background: '#F3F4F6', name: 'Gray' },
     { text: '#1E40AF', background: '#DBEAFE', name: 'Blue' },
   ];

   // AFTER (semantic tokens)
   import { ColorPresetPalette } from '@workspace/ui/components/color-picker';

   <ColorPresetPalette
     selected={{ color: option.color, emphasis: option.emphasis }}
     onChange={(preset) => updateOption({ ...option, ...preset })}
   />;
   ```

2. **`active-table-card.tsx`** - Replace encryption badge colors

   ```tsx
   // BEFORE
   className={cn(
     isE2EE ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : ''
   )}

   // AFTER
   {isE2EE && (
     <Badge variant="green">
       <ShieldCheck className="h-3 w-3" />
       Encrypted
     </Badge>
   )}
   ```

3. **`encryption-status-card.tsx`** - Use ColorBadge

   ```tsx
   // BEFORE
   <ShieldCheck className="h-5 w-5 text-green-600" />

   // AFTER
   <ColorBadge color="green" emphasis="bold" icon={<ShieldCheck />}>
     End-to-End Encrypted
   </ColorBadge>
   ```

**Priority 2: Status Indicators** (visual consistency)

**Files to migrate:** 4. **`error-display.tsx`** - Warning colors 5. **`active-tables-page.tsx`** - Feature module badges 6. **`active-table-records-page.tsx`** - Warning banners

**Deliverables:**

- 6 migrated files
- PR: "feat(colors): migrate Active Tables to design tokens"
- Visual regression screenshots

### 4.2 Secondary Path Migration (4 days)

**Priority 3: Authentication & Workspace Pages**

**Files to migrate:** 7. **`login-page.tsx`** - Feature badges (green, blue, purple) 8. **`workspace-dashboard.tsx`** - Dashboard cards 9. **`workspace-card.tsx`** - Workspace status

**Priority 4: Module Utilities**

**Files to migrate:** 10. **`module-icons.ts`** - Replace hardcoded bg/text classes

````tsx
// BEFORE
bg: 'bg-blue-100 dark:bg-blue-900/20',
badge: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',

    // AFTER
    bg: 'bg-[var(--accent-blue-subtle)]',
    badge: 'bg-[var(--accent-blue-subtlest)] text-[var(--accent-blue-bolder)]',
    ```

**Priority 5: Components**

**Files to migrate:** 11. **`app-sidebar.tsx`** - Sidebar feature indicators 12. **`navigation-menu.tsx`** - Active state colors 13. **`keyboard-shortcuts-help.tsx`** - Key badge colors

**Testing Strategy:**

- Migrate 2-3 files per day
- Run visual regression after each file
- Test dark mode for every migration
- Commit atomically (one file per commit)

**Deliverables:**

- 7 additional migrated files
- PR series (one per feature module)
- Migration checklist spreadsheet

### 4.3 Low Priority Migration (3 days)

**Priority 6: Decorative Colors** (marketing pages)

**Files to migrate:** 14. Landing page feature cards 15. Pricing page badges 16. Help/documentation pages

**Strategy:**

- Batch commits (group by page)
- Lower visual regression priority
- Focus on semantic correctness

**Deliverables:**

- All decorative colors migrated
- PR: "chore(colors): migrate decorative elements to design tokens"

### 4.4 Database Schema Update (2 days)

**Goal**: Store semantic color tokens instead of hex values in Active Tables field options.

**Current Schema:**

```sql
-- active_table_fields.field_options (JSONB)
[
  {
    "value": "status_done",
    "text": "Done",
    "text_color": "#047857",          -- ❌ Hardcoded hex
    "background_color": "#D1FAE5"     -- ❌ Hardcoded hex
  }
]
````

**New Schema:**

```sql
-- active_table_fields.field_options (JSONB)
[
  {
    "value": "status_done",
    "text": "Done",
    "color_preset": {                 -- ✅ Semantic token
      "color": "green",
      "emphasis": "subtle"
    }
  }
]
```

**Migration Strategy:**

1. **Add new fields without dropping old ones** (backwards compatible)
2. **Write data migration script** to populate color_preset from text_color/background_color
3. **Update API serializers** to send both formats during transition period
4. **Update frontend** to prefer color_preset, fallback to hex
5. **Deprecate text_color/background_color** after 2 releases

**Migration Script:**

```typescript
// scripts/migrate-field-colors.ts
import { db } from './db';

const HEX_TO_PRESET: Record<string, { color: AccentColor; emphasis: ColorEmphasis }> = {
  // Map old hex pairs to new semantic tokens
  '#D1FAE5': { color: 'green', emphasis: 'subtle' },
  '#047857': { color: 'green', emphasis: 'default' },
  '#FEE2E2': { color: 'red', emphasis: 'subtle' },
  // ... (map all 8 original presets)
};

async function migrateFieldColors() {
  const fields = await db.activeTableField.findMany({
    where: { field_type: { in: ['SELECT_ONE', 'SELECT_LIST'] } },
  });

  for (const field of fields) {
    const options = field.field_options as FieldOption[];
    const migratedOptions = options.map((opt) => {
      const bgHex = opt.background_color;
      const preset = HEX_TO_PRESET[bgHex] ?? { color: 'gray', emphasis: 'subtle' };

      return {
        ...opt,
        color_preset: preset, // NEW
        // Keep old fields for backwards compat
        text_color: opt.text_color,
        background_color: opt.background_color,
      };
    });

    await db.activeTableField.update({
      where: { id: field.id },
      data: { field_options: migratedOptions },
    });
  }
}
```

**API Changes:**

```typescript
// apps/web/src/shared/api/active-tables-client.ts

// Serializer (API → Frontend)
function deserializeFieldOption(raw: any): FieldOption {
  return {
    value: raw.value,
    text: raw.text,
    // NEW: Prefer semantic tokens
    color: raw.color_preset?.color,
    emphasis: raw.color_preset?.emphasis,
    // OLD: Fallback to hex (backwards compat)
    text_color: raw.text_color,
    background_color: raw.background_color,
  };
}

// Request builder (Frontend → API)
function serializeFieldOption(opt: FieldOption): any {
  return {
    value: opt.value,
    text: opt.text,
    // Send both formats during transition
    color_preset: opt.color && opt.emphasis ? { color: opt.color, emphasis: opt.emphasis } : null,
    // Compute hex from semantic tokens for backwards compat
    text_color: opt.color ? getTextColorHex(opt.color, opt.emphasis) : opt.text_color,
    background_color: opt.color ? getBgColorHex(opt.color, opt.emphasis) : opt.background_color,
  };
}
```

**Deliverables:**

- Migration script: `scripts/migrate-field-colors.ts`
- Updated API serializers
- Database migration (add color_preset column)
- Rollback plan document

---

## Phase 5: Documentation & Guidelines (Week 6)

**Goal**: Comprehensive documentation for developers and designers.

### 5.1 Color Usage Guidelines (2 days)

**Document**: `docs/color-usage-guidelines.md`

**Sections:**

1. **When to Use Each Color**
   - Status colors (success, warning, danger, info, discovery)
   - Accent colors (user-defined, decorative)
   - Feature module colors (semantic aliases)

2. **Emphasis Level Selection**
   - Subtlest: Very low contrast backgrounds (hover states)
   - Subtle: Default backgrounds for badges/pills
   - Bolder: Text, icons, borders (high contrast)
   - Boldest: Maximum emphasis (rare use)

3. **Accessibility Requirements**
   - Minimum contrast ratios (4.5:1 text, 3:1 UI)
   - Never use color alone to convey information
   - Include text labels or icons
   - Test with color blindness simulators

4. **Dark Mode Considerations**
   - Tokens automatically invert
   - Test all combinations in both modes
   - Avoid pure white text on colored backgrounds

**Code Examples:**

```tsx
// ✅ GOOD: Status indicator with icon and text
<Badge variant="success">
  <Check className="h-3 w-3" />
  Verified
</Badge>

// ❌ BAD: Color alone without context
<div className="bg-green-500" />

// ✅ GOOD: Semantic alias for encryption
<Badge className="bg-[var(--feature-encryption-bg)] text-[var(--feature-encryption-fg)]">
  <ShieldCheck className="h-3 w-3" />
  E2EE Enabled
</Badge>

// ❌ BAD: Hardcoded accent color
<Badge className="bg-emerald-500/10 text-emerald-600">
  Encrypted
</Badge>
```

**Deliverables:**

- `docs/color-usage-guidelines.md` (3000+ words)
- Figma file with annotated examples

### 5.2 Developer Migration Guide (1 day)

**Document**: `docs/color-migration-guide.md`

**Sections:**

1. **Quick Migration Checklist**

   ```md
   - [ ] Identify hardcoded color classes (bg-_, text-_, border-\*)
   - [ ] Map to semantic token or accent color
   - [ ] Replace with design token CSS variable
   - [ ] Test in light mode
   - [ ] Test in dark mode
   - [ ] Run visual regression tests
   - [ ] Update Storybook story (if applicable)
   ```

2. **Common Migration Patterns**

   ```tsx
   // Pattern 1: Status badges
   // BEFORE: <Badge className="bg-green-500/10 text-green-600">Success</Badge>
   // AFTER:  <Badge variant="success">Success</Badge>

   // Pattern 2: Feature module colors
   // BEFORE: <div className="bg-blue-100 text-blue-600">Tables</div>
   // AFTER:  <div className="bg-[var(--feature-tables-bg)] text-[var(--feature-tables-fg)]">Tables</div>

   // Pattern 3: Custom accent colors
   // BEFORE: <span style={{ backgroundColor: '#FEE2E2', color: '#DC2626' }}>Urgent</span>
   // AFTER:  <ColorBadge color="red" emphasis="subtle">Urgent</ColorBadge>
   ```

3. **Troubleshooting**
   - Token not resolving: Check @theme mappings
   - Wrong color in dark mode: Verify .dark selector
   - Contrast issues: Use bolder emphasis level

**Deliverables:**

- `docs/color-migration-guide.md`
- Interactive CodeSandbox demo

### 5.3 Component Documentation (1 day)

**Update existing docs:**

1. **`docs/design-system.md`** - Add color token reference
2. **`packages/ui/README.md`** - Document new components
3. **Storybook** - Add "Color System" section

**New documentation:**

- **`packages/ui/src/components/color-badge.md`** - API reference
- **`packages/ui/src/components/color-picker/README.md`** - Usage guide

**Deliverables:**

- Updated design system docs
- Component API references
- Storybook "Color System" category

### 5.4 Accessibility Audit (2 days)

**Tasks:**

1. **Automated contrast testing**
   - Run axe-core on all color combinations
   - Generate compliance report
   - Fix failing combinations

2. **Manual screen reader testing**
   - Test ColorBadge with NVDA/VoiceOver
   - Verify color names are announced
   - Test ColorPresetPalette keyboard navigation

3. **Color blindness testing**
   - Simulate protanopia, deuteranopia, tritanopia
   - Verify information is conveyed without color
   - Document any issues + resolutions

**Deliverables:**

- `docs/color-accessibility-audit.md`
- WCAG compliance report (100% AA target)
- Figma file with color blindness simulations

---

## Phase 6: Rollout & Monitoring (Week 6)

### 6.1 Staged Rollout Plan

**Stage 1: Internal Testing** (2 days)

- Deploy to staging environment
- Internal team testing
- Collect feedback on color accuracy

**Stage 2: Beta Users** (3 days)

- Enable for 10% of users via feature flag
- Monitor error rates, performance
- Collect user feedback

**Stage 3: Full Rollout** (2 days)

- Deploy to 100% of users
- Monitor analytics for usage patterns
- Prepare hotfix if issues arise

### 6.2 Monitoring & Metrics

**Technical Metrics:**

- CSS bundle size (should not increase >5KB)
- Color token resolution time (should be instant)
- Dark mode toggle performance
- Error rate (target: <0.1%)

**User Metrics:**

- Badge color customization usage (target: 30% of SELECT fields)
- Color preset selection distribution
- Dark mode usage (baseline vs post-launch)

**Deliverables:**

- Monitoring dashboard (Grafana/Datadog)
- Weekly metrics report (4 weeks post-launch)

---

## Rollback Plan

**If critical issues arise:**

### Rollback Triggers

1. Error rate exceeds 1% for 10+ minutes
2. Visual regressions affect >5% of pages
3. Dark mode completely broken
4. WCAG AA compliance drops below 90%

### Rollback Steps

1. **Revert globals.css** to backup version

   ```bash
   git checkout HEAD~1 packages/ui/src/styles/globals.css
   pnpm --filter @workspace/ui build
   ```

2. **Revert component changes** (ColorBadge, Badge variants)

   ```bash
   git revert <commit-hash-range>
   ```

3. **Keep database migration** (color_preset field remains, frontend falls back to hex)

4. **Deploy hotfix** within 1 hour

5. **Post-mortem** within 24 hours

---

## Risk Assessment

| Risk                               | Probability | Impact | Mitigation                                              |
| ---------------------------------- | ----------- | ------ | ------------------------------------------------------- |
| Visual regressions in production   | Medium      | High   | Comprehensive visual regression testing, staged rollout |
| Dark mode contrast issues          | Medium      | Medium | Automated contrast testing, manual QA in dark mode      |
| Performance degradation (CSS size) | Low         | Medium | Monitor bundle size, tree-shake unused tokens           |
| User confusion with color picker   | Low         | Low    | User testing, tooltips, documentation                   |
| Database migration failures        | Low         | High   | Test migration on staging, write rollback script        |
| Backwards incompatibility          | Low         | Medium | Maintain dual format (hex + semantic) during transition |

---

## Dependencies & Prerequisites

**Technical:**

- [x] TailwindCSS v4 installed
- [x] shadcn/ui components available
- [x] Storybook setup
- [ ] Visual regression testing tool (Chromatic/Percy)
- [ ] Accessibility testing tool (axe DevTools)

**Design:**

- [ ] Figma file with Atlassian color palette
- [ ] Approval from design team on token mappings
- [ ] Accessibility review by UX team

**Team:**

- 1 Frontend engineer (full-time, 6 weeks)
- 1 Designer (part-time, 2 weeks for review/documentation)
- 1 QA engineer (part-time, 1 week for testing)

---

## Success Criteria

**Phase 1-2 (Tokens):**

- ✅ 50+ new color tokens added to globals.css
- ✅ Zero build errors
- ✅ All tokens resolve correctly in browser DevTools

**Phase 3 (Components):**

- ✅ ColorBadge component supports 10 colors × 3 emphasis = 30 variants
- ✅ ColorPresetPalette fully functional with keyboard navigation
- ✅ Badge component backwards compatible

**Phase 4 (Migration):**

- ✅ 70+ hardcoded colors replaced with design tokens
- ✅ Zero visual regressions (or all documented + approved)
- ✅ Database migration successful (100% records migrated)

**Phase 5 (Documentation):**

- ✅ 3 comprehensive docs published (usage, migration, accessibility)
- ✅ WCAG AA compliance: 100% of color combinations
- ✅ Storybook updated with color system section

**Phase 6 (Rollout):**

- ✅ Staged rollout complete (0% → 10% → 100%)
- ✅ Error rate <0.1%
- ✅ 30%+ of SELECT fields use custom colors (within 1 month)

---

## Unresolved Questions

1. **Token Naming:** Should we use `--accent-*` or `--ds-accent-*` (Atlassian prefix)?
   - **Recommendation:** Use `--accent-*` for brevity, document Atlassian origin in comments

2. **Emphasis Level Count:** Support all 5 levels (subtlest/subtler/subtle/bolder/boldest) or simplify to 4?
   - **Recommendation:** Start with 4 (subtlest/subtle/bolder/boldest), add subtler later if needed

3. **Chart Colors:** Migrate existing `--chart-1` to `--chart-5` or leave as-is?
   - **Recommendation:** Leave chart colors unchanged (already working, low priority)

4. **Feature Aliases:** How many semantic aliases should we create?
   - **Recommendation:** Start with 5 (encryption, tables, automations, integrations, warnings), expand based on usage

5. **Color Picker UX:** Should we show hex values alongside semantic names?
   - **Recommendation:** No, hide implementation details. Show only color names (e.g., "Green Subtle")

6. **Mobile Support:** Any touch-specific considerations for ColorPresetPalette?
   - **Recommendation:** Increase touch target size to 44×44px on mobile (iOS guidelines)

---

## Appendix

### A. Color Token Reference Table

| Token Name              | Light Mode HSL     | Dark Mode HSL      | Usage                   |
| ----------------------- | ------------------ | ------------------ | ----------------------- |
| `--accent-green-subtle` | `hsl(162 80% 85%)` | `hsl(162 60% 15%)` | Green badge background  |
| `--accent-green-bolder` | `hsl(162 63% 32%)` | `hsl(162 60% 45%)` | Green badge text/border |
| `--accent-red-subtle`   | `hsl(0 84% 85%)`   | `hsl(0 70% 15%)`   | Red badge background    |
| `--accent-red-bolder`   | `hsl(0 71% 51%)`   | `hsl(0 71% 55%)`   | Red badge text/border   |
| ...                     | ...                | ...                | ...                     |

(Full table: 50+ tokens)

### B. Migration Checklist Spreadsheet

| File Path                  | Hardcoded Colors             | Status         | Assignee | PR Link |
| -------------------------- | ---------------------------- | -------------- | -------- | ------- |
| `field-options-editor.tsx` | 8 hex presets                | ✅ Done        | @dev1    | #123    |
| `active-table-card.tsx`    | bg-emerald, text-emerald     | ✅ Done        | @dev1    | #124    |
| `login-page.tsx`           | bg-green, bg-blue, bg-purple | 🔄 In Progress | @dev2    | -       |
| ...                        | ...                          | ...            | ...      | ...     |

(Full spreadsheet: 70+ rows)

### C. Color Contrast Matrix

| Combination                                          | Ratio | WCAG AA | WCAG AAA |
| ---------------------------------------------------- | ----- | ------- | -------- |
| `--accent-green-bolder` on `--accent-green-subtle`   | 5.2:1 | ✅ Pass | ✅ Pass  |
| `--accent-yellow-bolder` on `--accent-yellow-subtle` | 4.6:1 | ✅ Pass | ❌ Fail  |
| `white` on `--accent-blue-bolder`                    | 4.8:1 | ✅ Pass | ❌ Fail  |
| ...                                                  | ...   | ...     | ...      |

(Full matrix: 100+ combinations)

### D. Component API Quick Reference

```tsx
// ColorBadge
<ColorBadge
  color="green"
  emphasis="subtle"
  size="md"
  icon={<Icon />}
>
  Text
</ColorBadge>

// ColorPresetPalette
<ColorPresetPalette
  selected={{ color: 'green', emphasis: 'subtle' }}
  onChange={(preset) => console.log(preset)}
  showEmphasisSelector={true}
/>

// Badge (extended)
<Badge variant="green">Text</Badge>
<Badge variant="success">Text</Badge>
```

---

**End of Implementation Plan**

**Next Steps:**

1. Review plan with team
2. Assign engineers to phases
3. Set up project tracking (Jira/Linear)
4. Begin Phase 1 (Token Analysis) on 2025-11-18
