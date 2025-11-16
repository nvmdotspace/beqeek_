# Phase 1: Research & Analysis

**Date**: 2025-11-17
**Status**: Completed
**Priority**: High

## Context

Current connector card design uses centered layout with excessive whitespace. Need to reduce card height by 30-40% while maintaining scannability.

## Current Implementation Analysis

### Code Structure

**File**: `apps/web/src/features/workflow-connectors/components/connector-card.tsx`

**Current Layout**:

```tsx
<Card className="p-4 space-y-3 text-center">
  {/* Icon - Centered, 48x48px */}
  <div className="flex justify-center">
    <img className="size-12 object-contain rounded-lg" />
  </div>

  {/* Title - Heading level 4, centered */}
  <Heading level={4} className="text-center">

  {/* Description - Small text, muted, 2 lines max */}
  <Text size="small" color="muted" className="line-clamp-2">
</Card>
```

**Issues Identified**:

- `p-4` (16px padding) + `space-y-3` (12px gaps) = excessive vertical space
- Centered alignment creates wide, bloated cards
- 3-column grid (lg:grid-cols-3) with large cards
- Each element stacked vertically increases height

### Typography Prediction

Based on design guidelines and Heading/Text components:

- **Heading level 4**: `text-xl` (20px) with `leading-tight` (1.25)
- **Text small**: `text-sm` (14px) with `leading-normal` (1.5)
- **Font family**: Inter (Vietnamese-optimized)
- **Icon size**: 48x48px (size-12)

### Spacing Analysis

- Card padding: 16px all sides
- Vertical gap between elements: 12px
- Total estimated height: ~160-180px per card
- Target height reduction: 30-40% → ~100-120px

## Modern SaaS Patterns Research

### Key Findings from Industry Leaders

**Zapier (2024)**:

- Component-based selection with flexible layouts
- 2-3 column responsive grids
- Minimal design with clear labels and icons
- High contrast for readability

**Make.com**:

- Visual scenario editor with drag-drop modules
- Click to see app list, search and select
- Emphasis on clean design and logical layout
- User accessibility focus

**n8n**:

- Resource locator pattern for finding specific items
- Most important to least important field ordering
- Connected fields bundled together
- Drag and drop components

**General SaaS Marketplace Trends**:

- Grid-based layouts preferred for familiarity
- Minimal design philosophy
- High contrast and clear typography
- Compact formats with crucial details visible

### Card Design Pattern Insights

**Hover States (2024)**:

- Animated effects signify clickability
- Reveal additional info without cluttering
- Mobile: no hover, rely on visual affordance
- Desktop: scale, shadow, color transitions

**Compact Integration Design**:

- Left-aligned icon + text (list-like pattern)
- Horizontal layout reduces height
- Icon-text alignment critical for scanability
- Compact mode ideal for space-limited contexts

## Design Direction Recommendations

### Pattern 1: Horizontal Compact (List-style)

- Icon left, content right
- Single row layout
- 60-80px height
- Easy scanning, high density

### Pattern 2: Compact Grid (Reduced padding)

- Keep grid but reduce padding
- Smaller icon (32x32px)
- Left-aligned content
- 100-120px height

### Pattern 3: Hybrid (Icon-prominent)

- Icon left (medium size 40x40px)
- Title + description stacked right
- Horizontal with vertical text flow
- 90-110px height

## Success Criteria

- [ ] Card height reduced by 30-40%
- [ ] All business info retained (icon, title, description)
- [ ] Maintains scannability
- [ ] Responsive (mobile to desktop)
- [ ] Accessible (WCAG 2.1 AA)
- [ ] Vietnamese typography optimized
- [ ] Search/filter integration
- [ ] Hover states clear and smooth

## Next Steps

Create 3 detailed design alternatives with specifications
