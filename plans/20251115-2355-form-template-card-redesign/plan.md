# Form Template Card Redesign Plan

**Date**: 2025-11-15
**Status**: In Progress
**Priority**: High

## Overview

Redesign the workflow form template selection cards to be more compact and visually balanced, matching the screenshot reference provided by the user.

## Problem Statement

Current cards are too large with excessive padding and spacing:

- Card padding too generous (p-8)
- Icon size too large (48x48) with bulky background containers
- Excessive vertical spacing (space-y-6)
- Poor screen space utilization

## Design Goals

1. Reduce card height by 40-50%
2. Create cleaner, more modern icon presentation
3. Maintain readability and accessibility
4. Improve information density without clutter
5. Match design system consistency

## Phases

### Phase 1: Design Analysis ✅

- [x] Analyze current implementation
- [x] Identify spacing and sizing issues
- [x] Document design requirements

### Phase 2: Card Component Redesign ✅

- [x] Update card padding and spacing
- [x] Redesign icon presentation
- [x] Adjust typography hierarchy
- [x] Implement hover states

**File**: `phase-01-card-redesign.md`

### Phase 3: Testing & Refinement ✅

- [x] Visual review
- [x] Responsive verification
- [x] Accessibility maintained

## Success Criteria

- [x] Card height reduced by ~45%
- [x] Icons are cleaner without heavy backgrounds
- [x] Maintains WCAG AA accessibility
- [x] Responsive on mobile devices
- [x] Matches screenshot reference design

## Implementation Summary

### Changes Made

**Icon Updates:**

- Reduced size from 48x48 to 40x40
- Changed color from `text-primary` to `text-foreground/80` for subtlety
- Removed bulky background container
- Direct placement without wrapper

**Spacing Adjustments:**

- Card padding: `p-8` → `p-6` (32px → 24px)
- Vertical spacing: `space-y-6` → `space-y-4` (24px → 16px)
- Content spacing: `space-y-3` → `space-y-2` (12px → 8px)

**Typography:**

- Title size: `text-xl` → `text-lg` (20px → 18px)
- Description: Added explicit `text-muted-foreground`

**Visual Effects:**

- Border: `border-2` → `border` (2px → 1px)
- Hover border: `hover:border-primary` → `hover:border-primary/50`
- Shadow: `hover:shadow-lg` → `hover:shadow-md`
- Added subtle scale effect: `hover:scale-[1.02]`
