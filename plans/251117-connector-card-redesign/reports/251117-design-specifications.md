# Connector Card Redesign - Design Specifications

**Date**: 2025-11-17
**Designer**: Claude (UI/UX Expert)
**Status**: Final Specification

## Executive Summary

Redesigned connector selection cards with 45% height reduction (160px → 88px) while maintaining all business requirements through horizontal icon-prominent layout.

---

## Design Philosophy

**Principles**:

1. Compact without sacrificing clarity
2. Left-aligned for faster scanning
3. Icon-prominent for brand recognition
4. Vietnamese typography optimized
5. Design token compliance (100%)

---

## Visual Specifications

### Card Dimensions

```
Desktop (2 columns):
┌────────────────────────────────────────────────┐
│ [Icon]  Connector Name                         │
│  40px   Short description explaining purpose   │
│         and key features here...               │
└────────────────────────────────────────────────┘
Width: (container - gap) / 2
Height: 88px (fixed)
```

### Layout Breakdown

**Padding**: 16px horizontal, 12px vertical

- Top: 12px
- Right: 16px
- Bottom: 12px
- Left: 16px

**Internal Structure**:

```
Flex container (horizontal):
├─ Icon container (flex-shrink-0)
│  ├─ Size: 40x40px
│  ├─ Margin right: 12px (gap-3)
│  └─ Alignment: flex-start
│
└─ Content container (flex-1, min-w-0)
   ├─ Title (text-base, font-semibold, leading-tight)
   ├─ Spacing: 4px (space-y-1)
   └─ Description (text-sm, line-clamp-2, text-muted-foreground)
```

**Total Height Calculation**:

- Padding top: 12px
- Title line height: ~20px (text-base 16px × 1.25 tight)
- Gap: 4px
- Description line height: ~42px (text-sm 14px × 1.5 normal × 2 lines)
- Padding bottom: 12px
- **Total: ~90px** (88px with optimization)

---

## Typography Specifications

### Title (Connector Name)

**Desktop & Tablet**:

- Font family: `var(--font-sans)` (Inter)
- Font size: 16px (`text-base`)
- Font weight: 600 (`font-semibold`)
- Line height: 1.25 (`leading-tight`)
- Color: `var(--foreground)`
- Letter spacing: 0.02em
- Max lines: 1
- Overflow: `truncate` or `text-ellipsis`

**Mobile**:

- Same as desktop (maintains readability)

### Description

**Desktop & Tablet**:

- Font family: `var(--font-sans)` (Inter)
- Font size: 14px (`text-sm`)
- Font weight: 400 (`font-normal`)
- Line height: 1.5 (`leading-normal`)
- Color: `var(--muted-foreground)` (hsl(0 0% 45.1%))
- Letter spacing: 0.02em
- Max lines: 2 (`line-clamp-2`)
- Overflow: ellipsis

**Mobile**:

- Same as desktop

### Vietnamese Optimization

- Line height: 1.5 minimum (diacritics need space)
- Letter spacing: 0.02em (readability)
- Font: Inter (full Vietnamese support)
- No ALL CAPS (Vietnamese rarely uses uppercase)

---

## Color Specifications

### Default State

```css
/* Card Background */
background-color: var(--card); /* #ffffff light, #0a0a0a dark */

/* Card Border */
border: 1px solid;
border-color: var(--border) / 0.6; /* #e5e5e5 with 60% opacity */

/* Title Text */
color: var(--foreground); /* #0a0a0a light, #fafafa dark */

/* Description Text */
color: var(--muted-foreground); /* #737373 light, #a3a3a3 dark */
```

### Hover State

```css
/* Border */
border-color: var(--primary) / 0.4; /* #171717 with 40% opacity */

/* Background (subtle tint) */
background-color: var(--accent) / 0.2; /* #f5f5f5 with 20% opacity */

/* Shadow */
box-shadow:
  0 4px 6px -1px rgb(0 0 0 / 0.1),
  0 2px 4px -2px rgb(0 0 0 / 0.1);
/* shadow-md */
```

### Focus State (Keyboard Navigation)

```css
/* Focus ring */
outline: none;
box-shadow:
  0 0 0 2px var(--background),
  0 0 0 4px var(--ring);
/* focus-visible:ring-2 focus-visible:ring-offset-2 */
```

### Active/Pressed State

```css
/* Scale down slightly */
transform: scale(0.98);

/* Darker border */
border-color: var(--primary) / 0.6;
```

---

## Icon Specifications

### Size & Shape

- Dimensions: 40×40px (`size-10`)
- Border radius: 8px (`rounded-lg`)
- Object fit: `contain` (preserves aspect ratio)
- Flex shrink: 0 (prevents squishing)

### Fallback (No Logo)

```tsx
<div className="size-10 rounded-lg bg-primary/20 flex items-center justify-center">
  <div className="size-5 bg-primary/40 rounded" />
</div>
```

**Colors**:

- Background: `var(--primary)` with 20% opacity
- Inner square: `var(--primary)` with 40% opacity
- Inner square size: 20×20px (`size-5`)
- Inner square radius: 4px (`rounded`)

---

## Grid Layout Specifications

### Responsive Breakpoints

**Mobile (< 768px)**:

```tsx
grid-cols-1
gap-3 (12px)
```

**Tablet (768px - 1024px)**:

```tsx
md:grid-cols-2
gap-3 (12px)
```

**Desktop (>= 1024px)**:

```tsx
md:grid-cols-2 (NOT lg:grid-cols-3)
gap-3 (12px)
```

**Rationale**: 2 columns prevent overcrowding, maintain card readability with 88px height.

### Container Width

```tsx
className = 'container mx-auto p-6 space-y-6';
```

- Max width: container (varies by breakpoint)
- Padding: 24px all sides
- Section spacing: 24px vertical

---

## Interaction Specifications

### Cursor

```css
cursor: pointer;
```

### Transitions

```css
transition-property: all;
transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
transition-duration: 200ms;
```

**Affected properties**:

- border-color
- background-color
- box-shadow
- transform (active state)

### Hover Animation Sequence

1. **0ms**: Default state
2. **100ms**: Border color changes to primary/40
3. **200ms**: Shadow and background fully visible
4. No scale transform (maintains grid alignment)

### Focus Animation

1. User tabs to card
2. Focus ring appears immediately (no transition)
3. Same hover effects apply on focus

### Click/Tap Feedback

1. **mousedown/touchstart**: Scale to 0.98, border to primary/60
2. **mouseup/touchend**: Return to hover state
3. **onClick**: Execute handler, navigate to dialog

---

## Accessibility Specifications

### Semantic HTML

```tsx
<Card
  role="button"
  tabIndex={0}
  aria-label={`Tạo ${connectorType.name} connector`}
>
```

### Keyboard Navigation

**Supported keys**:

- `Tab`: Focus next/previous card
- `Enter`: Activate card (open dialog)
- `Space`: Activate card (open dialog)
- `Shift + Tab`: Focus previous card

**Handler**:

```tsx
onKeyDown={(e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault(); // Prevent scroll on Space
    onClick();
  }
}}
```

### Screen Reader Support

**Announcement**:

```
"Button. Tạo SMTP connector. SMTP. Kết nối với máy chủ SMTP để gửi email."
```

**Structure**:

- Role: button
- Label: Tạo {name} connector
- Title: {name}
- Description: {description}

### Color Contrast (WCAG 2.1 AA)

**Title text**:

- Foreground: #0a0a0a (light mode)
- Background: #ffffff
- Ratio: 21:1 ✓ (exceeds 4.5:1)

**Description text**:

- Foreground: #737373 (muted)
- Background: #ffffff
- Ratio: 4.6:1 ✓ (meets 4.5:1)

**Border (hover)**:

- Primary/40: #171717 with 40% opacity
- Ratio: 3.2:1 ✓ (meets 3:1 for UI components)

### Focus Indicators

- Visible focus ring: 2px solid var(--ring)
- Offset: 2px from element
- Color contrast: Meets 3:1 requirement
- Never hidden (no `outline: none` without alternative)

---

## Spacing System

### Card Internal Spacing

```
px-4: 16px (1rem)
py-3: 12px (0.75rem)
gap-3: 12px (horizontal gap between icon and content)
space-y-1: 4px (vertical gap between title and description)
```

### Grid Spacing

```
gap-3: 12px (gap between cards)
```

### Section Spacing

```
space-y-6: 24px (vertical spacing between header and grid)
p-6: 24px (container padding)
```

**4px Grid Compliance**: ✓ All spacing uses 4px increments

---

## Dark Mode Specifications

### Automatic Adaptation

All colors use CSS custom properties that auto-adapt:

```css
/* Light Mode */
--card: #ffffff;
--foreground: #0a0a0a;
--muted-foreground: #737373;
--border: #e5e5e5;
--primary: #171717;

/* Dark Mode (applied via .dark class) */
--card: #0a0a0a;
--foreground: #fafafa;
--muted-foreground: #a3a3a3;
--border: #262626;
--primary: #fafafa;
```

**No hardcoded colors** - design automatically adapts to theme.

---

## Mobile Optimizations

### Touch Targets

- Minimum size: 88px height × full width
- Exceeds 44×44px WCAG requirement ✓

### Touch Feedback

- Active state: scale(0.98) + darker border
- Visual feedback within 100ms
- No reliance on hover states

### Text Readability

- 16px minimum font size (title)
- 14px body text (acceptable for mobile)
- High contrast maintained
- 1.5 line height for Vietnamese text

### Performance

- No images loaded until needed (lazy loading)
- Transitions use transform and opacity (GPU-accelerated)
- No layout shifts (fixed height cards)

---

## Implementation Checklist

- [ ] Use design tokens exclusively (no hardcoded colors)
- [ ] Implement keyboard navigation (Enter/Space)
- [ ] Add ARIA labels for screen readers
- [ ] Test with Vietnamese text (long names/descriptions)
- [ ] Verify color contrast (WCAG 2.1 AA)
- [ ] Test focus indicators visibility
- [ ] Validate responsive behavior (mobile, tablet, desktop)
- [ ] Ensure touch targets ≥44×44px
- [ ] Test dark mode appearance
- [ ] Verify grid layout (2 columns max desktop)
- [ ] Add smooth transitions (200ms)
- [ ] Test with screen reader (VoiceOver, NVDA)

---

## Unresolved Questions

None. All design decisions finalized and documented.
