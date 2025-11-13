# Color System Design Tokens Analysis

**Date**: 2025-11-13
**Version**: 1.0
**Codebase**: Beqeek Workflow Automation Platform

---

## Context

Beqeek's design system uses CSS custom properties (variables) defined in `packages/ui/src/styles/globals.css` with TailwindCSS v4 integration. All colors adapt to light/dark modes, with semantic naming conventions following Atlassian-inspired design principles.

---

## Overview

**Token Architecture**:

- 80+ CSS custom properties organized hierarchically
- Light/dark mode support via `.dark` class selector
- HSL color format for perceptual uniformity
- Semantic naming (status colors, accents, interactive states)
- Fallback to grayscale for neutral tokens

**Coverage**: Base colors, status indicators, accent palette, sidebar styling, chart colors, UI feedback states

---

## Key Findings

1. **Comprehensive semantic layer**: Well-organized status colors (success/warning/info) with subtle variants
2. **8-color accent palette**: Blue, Purple, Green, Teal, Orange, Magenta, Lime, Yellow for categorical data
3. **Consistent dark mode inversions**: Lightness values adjusted proportionally (±15-25%)
4. **Missing explicit scales**: No numbered color scales (50/100/200/etc.) defined
5. **Limited contrast documentation**: No explicit WCAG ratios specified despite AA compliance claims
6. **Sidebar isolation**: Separate color tokens for sidebar (not inherited from base)

---

## Color Token Inventory

### Base/Neutral Colors (Light → Dark)

| Token                  | Light           | Dark            | Purpose                      |
| ---------------------- | --------------- | --------------- | ---------------------------- |
| `--background`         | 100% white      | 3.9% near-black | Page backgrounds             |
| `--foreground`         | 3.9% near-black | 98% near-white  | Primary text                 |
| `--card`               | 100% white      | 3.9% near-black | Card/container backgrounds   |
| `--card-foreground`    | 3.9% near-black | 98% near-white  | Card text                    |
| `--popover`            | 100% white      | 3.9% near-black | Dropdown/tooltip backgrounds |
| `--popover-foreground` | 3.9% near-black | 98% near-white  | Dropdown text                |

### Interactive Colors (Button/Link States)

| Token                    | Light            | Dark            | Purpose                |
| ------------------------ | ---------------- | --------------- | ---------------------- |
| `--primary`              | 9% dark gray     | 98% near-white  | Primary buttons/CTA    |
| `--primary-foreground`   | 98% near-white   | 9% dark gray    | Text on primary        |
| `--secondary`            | 96.1% light gray | 14.9% dark gray | Secondary buttons      |
| `--secondary-foreground` | 9% dark gray     | 98% near-white  | Text on secondary      |
| `--accent`               | 96.1% light gray | 14.9% dark gray | Hover/selection states |
| `--accent-foreground`    | 9% dark gray     | 98% near-white  | Text on accent         |

### Feedback/Status Colors

| Token                      | Light              | Dark               | Semantic               |
| -------------------------- | ------------------ | ------------------ | ---------------------- |
| `--destructive`            | hsl(0 84.2% 60.2%) | hsl(0 62.8% 30.6%) | Delete, errors, danger |
| `--destructive-foreground` | 98% white          | 98% white          | Text (always light)    |
| `--border`                 | 89.8% light gray   | 14.9% dark gray    | Component borders      |
| `--input`                  | 89.8% light gray   | 14.9% dark gray    | Form input borders     |
| `--ring`                   | 3.9% near-black    | 83.1% light gray   | Focus indicators       |

### Status Indicators (3-tier: solid/foreground/subtle)

**Success (Green)**

- Solid: `hsl(142 76% 36%)` → dark `hsl(142 70% 45%)`
- Foreground: Always `hsl(0 0% 98%)`
- Subtle: `hsl(142 76% 96%)` → dark `hsl(142 70% 12%)`
- Subtle-foreground: `hsl(142 76% 25%)` → dark `hsl(142 70% 70%)`

**Warning (Amber)**

- Solid: `hsl(38 92% 50%)` → dark `hsl(38 90% 55%)`
- Foreground: Always `hsl(0 0% 3.9%)`
- Subtle: `hsl(38 92% 95%)` → dark `hsl(38 90% 15%)`
- Subtle-foreground: `hsl(38 92% 30%)` → dark `hsl(38 90% 75%)`

**Info (Blue)**

- Solid: `hsl(217 91% 60%)` → dark `hsl(217 91% 65%)`
- Foreground: Always `hsl(0 0% 98%)`
- Subtle: `hsl(217 91% 96%)` → dark `hsl(217 91% 15%)`
- Subtle-foreground: `hsl(217 91% 30%)` → dark `hsl(217 91% 75%)`

### Accent/Category Palette (8 colors × 4 variants each)

**Each accent has**: base, foreground, subtle, subtle-foreground

1. **Blue** (HRM/Employee): `hsl(217 91% 60%)`
2. **Purple** (Workflows): `hsl(271 81% 56%)`
3. **Green** (Data/Growth): `hsl(142 76% 36%)`
4. **Teal** (CRM/Communication): `hsl(173 80% 40%)`
5. **Orange** (Finance/Analytics): `hsl(24 94% 50%)`
6. **Magenta** (Creative/Branding): `hsl(328 85% 50%)`
7. **Lime** (Achievements): `hsl(82 84% 43%)`
8. **Yellow** (Highlights): `hsl(45 93% 58%)`

**Total**: 32 tokens for accent system (8 colors × 4 variants)

### Chart/Data Visualization Colors (5 series)

| Token       | Light            | Dark             | Usage    |
| ----------- | ---------------- | ---------------- | -------- |
| `--chart-1` | hsl(12 76% 61%)  | hsl(220 70% 50%) | Series 1 |
| `--chart-2` | hsl(173 58% 39%) | hsl(160 60% 45%) | Series 2 |
| `--chart-3` | hsl(197 37% 24%) | hsl(30 80% 55%)  | Series 3 |
| `--chart-4` | hsl(43 74% 66%)  | hsl(280 65% 60%) | Series 4 |
| `--chart-5` | hsl(27 87% 67%)  | hsl(340 75% 55%) | Series 5 |

**Issue**: Completely different hues between light/dark modes—visually incoherent for multi-theme support.

### Sidebar Colors (7 tokens)

| Token                          | Light            | Dark            | Purpose              |
| ------------------------------ | ---------------- | --------------- | -------------------- |
| `--sidebar`                    | 98% near-white   | 9% near-black   | Sidebar background   |
| `--sidebar-foreground`         | 3.9% near-black  | 98% near-white  | Sidebar text         |
| `--sidebar-primary`            | 9% dark gray     | 98% near-white  | Active sidebar items |
| `--sidebar-primary-foreground` | 98% near-white   | 9% near-black   | Text on active       |
| `--sidebar-accent`             | 96.1% light gray | 14.9% dark gray | Hover states         |
| `--sidebar-accent-foreground`  | 9% dark gray     | 98% near-white  | Text on hover        |
| `--sidebar-border`             | 89.8% light gray | 14.9% dark gray | Sidebar borders      |

**Observation**: Sidebar colors mirror base colors exactly—redundant token definitions.

---

## Semantic Mappings

### Color Purpose Classification

**Neutral/Structural**:

- Background, Foreground, Card, Popover, Border, Input (8 tokens)

**Interactive/Action**:

- Primary, Secondary, Accent, Destructive (12 with foreground variants)

**Feedback/Status**:

- Success, Warning, Info (12 tokens: solid/foreground/subtle/subtle-foreground)

**Categorical/Data**:

- Accent palette (8 colors × 4 variants = 32 tokens)
- Chart colors (5 tokens)

**Component-Specific**:

- Sidebar (7 tokens)
- Ring (focus states)

**Total**: 80+ CSS variables organized across 6 functional categories

---

## Observations

### Strengths

✅ **Semantic naming**: Clear purpose (primary, destructive, warning, etc.)
✅ **Dual variants**: Subtle + solid for each status color
✅ **Comprehensive accent palette**: 8 contextual colors for workflows/data types
✅ **Consistent HSL format**: Perceptually uniform transitions
✅ **Light/dark parity**: Every token has defined light AND dark equivalent

### Inconsistencies & Gaps

❌ **Chart color disconnect**: Light/dark modes use entirely different hues (impossible for visual continuity)
❌ **Sidebar redundancy**: 7 tokens mirror base tokens—could consolidate to 1 inheritance layer
❌ **No color scales**: No -50/-100/-200 variations for component states (hover/active/disabled)
❌ **Missing opacity levels**: No alpha/transparency tokens (critical for overlays/disabled states)
❌ **Undocumented ratios**: No WCAG contrast specifications despite AA compliance claims
❌ **Limited foreground consistency**: Success/Info always light; Warning sometimes dark (inconsistent logic)
❌ **Accent lightness inconsistency**: Lime/Yellow use darker foreground (3.9%) vs others (98%)

### Dark Mode Adjustment Patterns

| Status        | Light Lightness | Dark Lightness | Shift  | Pattern             |
| ------------- | --------------- | -------------- | ------ | ------------------- |
| Success       | 36%             | 45%            | +9%    | Brightened          |
| Warning       | 50%             | 55%            | +5%    | Slightly brightened |
| Info          | 60%             | 65%            | +5%    | Slightly brightened |
| Accent Colors | 36-66%          | 45-62%         | ±8-10% | Proportional        |

**Finding**: Dark mode lightness increases ~5-10% to maintain perceived brightness (non-linear perception correction)

---

## Recommendations

1. **Fix chart colors**: Use same hue families with adjusted lightness (not completely different hues)
2. **Consolidate sidebar**: Remove redundant tokens; use CSS inheritance or CSS-in-JS fallbacks
3. **Add opacity scale**: Define `--opacity-10` through `--opacity-90` for disabled/overlay states
4. **Document contrast ratios**: Audit and specify WCAG AA/AAA compliance per color pair
5. **Create color scales**: Define -50/-100/-200 variants for interactive state (hover/focus/active)
6. **Standardize foreground logic**: Choose single rule (e.g., always light on dark; contrast-based selection)
7. **Add color aliases**: `--success` → `--semantic-success` for clarity; keep backwards compatibility
8. **Create a color token cookbook**: Document use cases for each token with example components

---

## Unresolved Questions

- Why do chart colors completely invert hues in dark mode instead of adjusting lightness?
- Are the current color combinations WCAG AA or AAA compliant? (specific ratios needed)
- Is sidebar color duplication intentional for future customization, or technical debt?
- Why do Lime/Yellow use different foreground logic than other accents?
- Are opacity/transparency tokens intentionally omitted or oversight?
