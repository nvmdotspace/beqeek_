# Phase 2: Component Redesign

**Status**: In Progress
**Date**: 2025-11-16

## Context

Redesigning workflow connectors list UI based on current issues:

- Plain cards lacking visual depth
- Weak visual hierarchy
- "Không có mô tả" text needs better handling
- Category tabs could be more modern
- Missing micro-interactions

## Requirements

### ConnectorListItem Component

**Current Issues**:

- Basic card styling without depth
- Logo area too small (48px)
- Minimal hover effects
- Plain badge styling
- Empty description shows literal "Không có mô tả"

**Design Improvements**:

1. Enhanced card with subtle shadow/border
2. Larger logo area (64px) with better fallback
3. Smooth hover effects (scale 1.02, increased shadow, border accent)
4. Better typography hierarchy (H4 for name, small muted text)
5. Elegant empty state for description (italic, lighter muted)
6. Status indicator (optional: connection status dot)
7. Metadata footer (last updated, etc.)

**Key Patterns**:

- Shadow: `shadow-sm hover:shadow-lg`
- Border: `border border-border hover:border-primary/50`
- Scale: `transition-all hover:scale-[1.02]`
- Logo: `size-16` (64px) instead of `size-12`
- Typography: Use `<Heading level={4}>` and `<Text>`

### CategoryTabs Component

**Current Issues**:

- Default tab styling looks basic
- Badge positioning could be better
- No smooth transitions
- Active state could be more prominent

**Design Improvements**:

1. Pill-style tabs with rounded borders
2. Smooth color transitions on hover/active
3. Better badge integration (inline, subtle)
4. Animated active state indicator
5. Improved spacing and padding

**Key Patterns**:

- Pill shape: `rounded-full`
- Active: `bg-primary text-primary-foreground`
- Inactive: `bg-muted/50 text-muted-foreground hover:bg-muted`
- Badge: Inline with opacity variations

### Loading Skeleton

**Improvements**:

- Add shimmer animation
- Match new card proportions
- Smooth pulsing effect

## Implementation Steps

1. Update ConnectorListItem:
   - Increase logo size and improve fallback
   - Add enhanced hover effects
   - Better typography with semantic components
   - Handle empty description elegantly
   - Add optional metadata footer

2. Update CategoryTabs:
   - Implement pill-style design
   - Add smooth transitions
   - Improve badge integration
   - Enhance active state

3. Update ConnectorListSkeleton:
   - Match new proportions
   - Add shimmer effect

4. Update page layout:
   - Improve spacing
   - Better grid responsiveness

## Design Tokens Used

**Colors**:

- `bg-card` - Card background
- `border-border` - Default border
- `border-primary` - Accent border
- `text-foreground` - Primary text
- `text-muted-foreground` - Secondary text
- `bg-muted` - Subtle backgrounds

**Spacing**:

- Card padding: `p-6` (24px)
- Logo size: `size-16` (64px)
- Gap: `gap-4` (16px)

**Effects**:

- Shadow: `shadow-sm → shadow-lg`
- Scale: `hover:scale-[1.02]`
- Transition: `transition-all duration-200`

## Accessibility Checklist

- [ ] Maintain keyboard navigation
- [ ] Preserve ARIA labels
- [ ] Keep focus indicators visible
- [ ] Ensure 4.5:1 contrast ratio
- [ ] Support screen readers

## Success Criteria

- [ ] Visual depth and polish improved
- [ ] Smooth 60fps animations
- [ ] Mobile-responsive
- [ ] Design system compliant
- [ ] No accessibility regressions
