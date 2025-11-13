# Phase 02: Button Components Research

## Context

Analysis of button component color usage in Beqeek's design system. Examines button variants, state transitions, color token mappings, and usage patterns across the application.

**Date**: 2025-11-13
**Scope**: Button component variants, color tokens, state management
**Status**: Complete

## Overview

Button component built with CVA (Class Variance Authority) and Tailwind CSS. Uses semantic color tokens from design system (primary, secondary, accent, destructive). 6 distinct variants + 4 sizes with comprehensive state management (disabled, focus, hover).

**File**: `packages/ui/src/components/button.tsx` (49 lines)

## Button Variants

| Variant         | Purpose                    | Default Use Case                       |
| --------------- | -------------------------- | -------------------------------------- |
| **default**     | Primary action button      | Important CTAs (submit, create, save)  |
| **secondary**   | Secondary action button    | Alternative actions, lower priority    |
| **outline**     | Bordered button            | Neutral actions, cancel, copy buttons  |
| **ghost**       | Minimal interaction button | Icon buttons, toggles, expand/collapse |
| **destructive** | Danger action button       | Delete, remove operations              |
| **link**        | Text link styling          | Navigation within content              |

**Variants Found**: 6 types
**Active Variants**: 5 (link variant not used in codebase)

## Color Mappings

### Default Variant

- **Resting**: `bg-primary` + `text-primary-foreground` + `shadow-sm`
- **Hover**: `bg-primary/90` (10% opacity reduction)
- **Light Mode**: Black bg (HSL 0°, 0%, 9%) → White text (HSL 0°, 0%, 98%)
- **Dark Mode**: White bg (HSL 0°, 0%, 98%) → Black text (HSL 0°, 0%, 9%)

### Secondary Variant

- **Resting**: `bg-secondary` + `text-secondary-foreground` + `shadow-xs`
- **Hover**: `bg-secondary/80` (20% opacity reduction)
- **Light Mode**: Light gray bg (HSL 0°, 0%, 96.1%) → Dark gray text (HSL 0°, 0%, 9%)
- **Dark Mode**: Darker gray bg (HSL 0°, 0%, 14.9%) → White text (HSL 0°, 0%, 98%)

### Outline Variant

- **Resting**: `border border-input` + `bg-background` + `shadow-xs`
- **Hover**: `bg-accent` + `text-accent-foreground`
- **Light Mode**: White bg with gray border (HSL 0°, 0%, 89.8%) → Changes to light accent on hover
- **Dark Mode**: Dark bg with gray border → Changes to dark accent on hover

### Ghost Variant

- **Resting**: No background, no border (transparent)
- **Hover**: `bg-accent` + `text-accent-foreground`
- **Light Mode**: Transparent → Light gray bg on hover
- **Dark Mode**: Transparent → Darker gray bg on hover

### Destructive Variant

- **Resting**: `bg-destructive` + `text-destructive-foreground` + `shadow-xs`
- **Hover**: `bg-destructive/90` (10% opacity reduction)
- **Light Mode**: Red bg (HSL 0°, 84.2%, 60.2%) → White text
- **Dark Mode**: Darker red bg (HSL 0°, 62.8%, 30.6%) → White text

### Link Variant

- **Resting**: `text-primary` + `underline-offset-4`
- **Hover**: `hover:underline`
- **Light Mode**: Black text with underline offset
- **Dark Mode**: White text with underline offset

## Size Variants

| Size        | Height        | Padding                   | Icon SVG Size | Use Case            |
| ----------- | ------------- | ------------------------- | ------------- | ------------------- |
| **default** | 36px (h-9)    | px-4 py-2                 | 16px (size-4) | Standard buttons    |
| **sm**      | 32px (h-8)    | px-3 / px-2.5 (with icon) | 16px (size-4) | Compact UI elements |
| **lg**      | 40px (h-10)   | px-6 / px-4 (with icon)   | 16px (size-4) | Prominent CTAs      |
| **icon**    | 36px (size-9) | square                    | 16px (size-4) | Icon-only buttons   |

**Usage Distribution**:

- `size="sm"`: 28 instances (most used)
- `size="icon"`: 9 instances
- `size="lg"`: 1 instance
- Unspecified (default): ~38+ instances

## State Management

### Shared States (All Variants)

```
Base: inline-flex items-center justify-center gap-2
      whitespace-nowrap rounded-md text-sm font-medium
      transition-[color,box-shadow]

Disabled: pointer-events-none opacity-50
Focus: ring-4 outline-1 focus-visible:ring-inset
Icon SVG: pointer-events-none shrink-0
Ring Color: ring-ring/10 (light), ring-ring/20 (dark)
Outline: outline-ring/50 (light), outline-ring/40 (dark)
```

### Disabled State

- All variants: `disabled:pointer-events-none` + `disabled:opacity-50`
- Visual feedback: Reduced opacity prevents user interaction

### Focus State

- `focus-visible:ring-4`: 4px ring using `--ring` token
- Ring opacity: 10% light mode, 20% dark mode
- Outline: 1px at 50% opacity (light), 40% opacity (dark)
- Type: Inset ring for contained appearance

### Hover State

- Most variants: Opacity reduction (80-90%) or background shift
- Ghost/Outline only: Add background/foreground on hover
- Link: Adds underline

## Usage Patterns

### Variant Usage Frequency (160 instances analyzed)

1. **outline**: 70 instances (43.75%) - Most used variant
   - Copy buttons, cancel actions, neutral interactions
   - Icon buttons with outline style
2. **ghost**: 53 instances (33.12%) - Second most used
   - Icon-only toggles, expand/collapse, visibility toggles
   - Minimal visual weight required
3. **secondary**: 17 instances (10.62%)
   - Alternative CTAs, create workspace button
   - Lower priority actions requiring visibility
4. **destructive**: 12 instances (7.5%)
   - Delete table, remove encryption key operations
   - Danger zone actions
5. **default**: 7 instances (4.37%)
   - Primary submit buttons, save actions
   - Least used (most CTAs use outline/secondary)
6. **info**: 1 instance (0.62%) - Not in official variants
7. **link**: 0 instances - Not used

### Size Distribution

- **sm**: 28 instances (most used for compact UI)
- **default**: ~38+ unspecified (implicit)
- **icon**: 9 instances (icon-only buttons)
- **lg**: 1 instance (rare, minimal usage)

### Context-Based Usage

- **Settings/Configuration**: outline + ghost (copy, toggle, configure)
- **Workspace Management**: secondary (create workspace)
- **Form Submissions**: default (with custom gradient in login page)
- **Danger Actions**: destructive (delete operations)
- **Navigation/Toggles**: ghost (expand sections, show/hide)

### Custom Color Overrides Detected

- **Login Button**: Custom gradient `from-accent-blue to-accent-teal` with custom hover states
  - Bypasses button variant color system
  - Uses semantic accent colors directly
  - Custom shadow handling (shadow-lg/xl)

## State Transitions

### Color Changes by State

**Default Variant**:

- Resting → Hover: 10% opacity decrease on primary
- Resting → Focus: Ring around button + outline
- Resting → Disabled: 50% opacity

**Outline Variant**:

- Resting → Hover: Border stays, background/text shifts to accent
- Resting → Focus: Ring + outline applied
- Resting → Disabled: 50% opacity

**Ghost Variant**:

- Resting → Hover: Accent background/text appears
- Resting → Focus: Ring + outline applied
- Resting → Disabled: 50% opacity

**Focus Ring**:

- All variants: `ring-ring/10` (light), `ring-ring/20` (dark)
- Outline: `outline-ring/50` (light), `outline-ring/40` (dark)
- Visual: Dark outline in light mode, light outline in dark mode

## Observations

### Color System Strengths

1. Consistent token usage across variants
2. Light/dark mode fully supported with HSL definitions
3. Semantic naming (primary, secondary, destructive) intuitive
4. State transitions (hover, disabled, focus) standardized
5. Shadow values adjusted per variant (shadow-sm, shadow-xs)

### Current Issues/Gaps

1. **Variant Underutilization**:
   - Default (4.37%) barely used despite being primary variant
   - Most CTAs use outline/secondary instead of default
   - Suggests design ambiguity about primary action styling

2. **Custom Color Overrides**:
   - Login button uses custom gradient, bypassing variant system
   - Inconsistent with other buttons in application
   - Creates maintenance burden

3. **Missing Info Variant**:
   - One button uses `variant="info"` but not defined in buttonVariants CVA
   - Would fail if referenced again (runtime error)
   - Should either remove or add to variants

4. **Size Usage Skew**:
   - Only 1 `size="lg"` instance across entire codebase
   - Most buttons either sm or default
   - lg variant defined but severely underused

5. **Visual Hierarchy**:
   - 43.75% outline buttons may create hierarchy confusion
   - Secondary variant (10.62%) underused for alternate actions
   - Button styling doesn't strongly differentiate primary vs secondary

## Recommendations

### 1. Clarify Default Variant Usage

- Decision: Should `variant="default"` be the primary CTA?
- Action: Audit all submit/primary buttons, consolidate styling
- Expected: Increase default variant usage to 20-30%

### 2. Remove Custom Color Overrides

- Issue: Login button custom gradient breaks system consistency
- Action: Create custom variant within CVA if gradient needed
- Example: Add `gradient: 'from-accent-blue to-accent-teal hover:from-accent-blue/90'`
- Benefit: Centralized color control, maintainability

### 3. Fix Info Variant Reference

- Issue: Button uses `variant="info"` but not defined
- Action: Either remove reference or add variant definition
- Preferred: Add info variant to match alert/badge patterns

### 4. Increase Lg Size Usage

- Issue: `size="lg"` defined but barely used (1 instance)
- Action: Audit primary CTAs, apply lg size to page-level actions
- Benefit: Better visual hierarchy, mobile-friendly sizing

### 5. Establish Variant Guidelines

- Document when to use each variant:
  - default: Primary page-level CTAs
  - secondary: Alternative actions with equal importance
  - outline: Neutral/cancel actions
  - ghost: Icon toggles, minimal interaction
  - destructive: Danger zone only
- Add to design system documentation

### 6. Review Focus State Contrast

- Current: ring-ring/10 (light), ring-ring/20 (dark)
- Issue: Low opacity ring may not meet WCAG AA contrast requirements
- Action: Test actual contrast ratio, increase opacity if needed
- Target: 4.5:1 contrast for accessibility

### 7. Create Button Usage Examples

- Document actual patterns from codebase
- Show variant selection decision tree
- Provide component prop combinations (e.g., outline + icon)
- Add to Storybook/component library documentation

## Unresolved Questions

1. **Should default variant be used more?** Currently underused (4.37%) despite being "default"
2. **Are custom gradients a design requirement?** Login button suggests custom gradient support needed
3. **Info variant intentional?** Why is it used if not officially defined?
4. **Size lg purpose?** Why defined if barely used (1 instance)?
5. **Focus ring opacity sufficient?** Does ring-ring/10-20 meet WCAG AA contrast requirements?
6. **Outline as default?** Why is outline (43.75%) preferred over default (4.37%) for CTAs?

---

**Document Version**: 1.0
**Last Updated**: 2025-11-13
**Next Steps**: Review recommendations with design team, implement consolidated variant strategy
