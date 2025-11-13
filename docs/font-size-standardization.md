# Font Size Standardization

**Version**: 1.0.0
**Date**: 2025-11-13
**Status**: Implemented

## Overview

This document defines mandatory font size standards for all form elements across the Beqeek application to ensure visual consistency and design system compliance.

## Standard Font Sizes

### Form Elements

All form input elements **MUST** use `text-sm` (14px / 0.875rem):

| Element Type                     | Font Size Class | Pixel Size | Usage                    |
| -------------------------------- | --------------- | ---------- | ------------------------ |
| Input (text, email, url, number) | `text-sm`       | 14px       | All text inputs          |
| Textarea                         | `text-sm`       | 14px       | Multi-line text          |
| Select (native)                  | `text-sm`       | 14px       | Dropdown selects         |
| Select (custom dropdown)         | `text-sm`       | 14px       | Custom select components |
| Date/DateTime/Time               | `text-sm`       | 14px       | Date pickers             |
| Checkbox label                   | `text-sm`       | 14px       | Checkbox labels          |

### Supporting Elements

| Element Type  | Font Size Class       | Pixel Size | Usage               |
| ------------- | --------------------- | ---------- | ------------------- |
| Label         | `text-sm font-medium` | 14px       | Field labels        |
| Helper text   | `text-xs`             | 12px       | Instructions, hints |
| Error message | `text-xs`             | 12px       | Validation errors   |
| Placeholder   | `text-sm` (inherit)   | 14px       | Input placeholders  |

## Implementation Checklist

### ✅ Fixed Components (2025-11-13)

All field renderers in `packages/active-tables-core/src/components/fields/`:

- [x] `text-field.tsx` - Added `text-sm` to inputClasses
- [x] `textarea-field.tsx` - Added `text-sm` + replaced hardcoded colors with design tokens
- [x] `number-field.tsx` - Added `text-sm` to inputClasses
- [x] `date-field.tsx` - Added `text-sm` to inputClasses
- [x] `datetime-field.tsx` - Added `text-sm` to inputClasses
- [x] `time-field.tsx` - Added `text-sm` to inputClasses
- [x] `select-field.tsx` - Added `text-sm` to selectClasses
- [x] `checkbox-field.tsx` - Replaced hardcoded colors with design tokens (label already had `text-sm`)

### Already Compliant

- `packages/ui/src/components/input.tsx` - Has `text-sm`
- `packages/ui/src/components/select.tsx` - Has `text-sm` on trigger and items
- `packages/ui/src/components/label.tsx` - Has `text-sm font-medium`
- `packages/active-tables-core/src/components/fields/user-select.tsx` - Has `text-sm`
- `packages/active-tables-core/src/components/fields/async-record-select.tsx` - Has `text-sm`

## Standard Input Classes Template

Use this template for all new form input components:

```tsx
const inputClasses = `
  w-full px-3 py-2
  text-sm
  border border-input rounded-lg
  bg-background text-foreground
  transition-all
  placeholder:text-muted-foreground
  focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-ring
  disabled:cursor-not-allowed disabled:opacity-50
  aria-invalid:border-destructive
  ${className || ''}
`.trim();
```

### Key Points

1. **Always include `text-sm`** - Never omit this class
2. **Use design tokens** - `border-input`, `bg-background`, `text-foreground` (NOT hardcoded colors)
3. **Consistent spacing** - `px-3 py-2` for all inputs
4. **Standard height** - `h-10` (40px) implied by padding
5. **Focus state** - Use standard ring pattern with `ring-ring` token
6. **Disabled state** - Always include opacity and cursor rules
7. **Error state** - Use `aria-invalid:border-destructive`

## Migration Guide

### For Existing Components

If you find a component missing `text-sm`:

1. Locate the className string
2. Add `text-sm` on its own line after spacing classes
3. Verify design token usage (no hardcoded colors)
4. Build and test

### Example Migration

```diff
const inputClasses = `
  w-full px-3 py-2
+ text-sm
- border border-gray-300 rounded-lg
+ border border-input rounded-lg
- bg-white text-black
+ bg-background text-foreground
  transition-all
  placeholder:text-muted-foreground
- focus:outline-none focus:ring-2 focus:ring-blue-500
+ focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-ring
  disabled:cursor-not-allowed disabled:opacity-50
- ${error ? 'border-red-500' : ''}
+ aria-invalid:border-destructive
  ${className || ''}
`.trim();
```

## Testing

After applying font size standardization:

1. **Visual inspection** - All inputs should have consistent text size
2. **Cross-browser** - Test in Chrome, Safari, Firefox
3. **Dark mode** - Verify design tokens work in both themes
4. **Responsive** - Check mobile and desktop viewports
5. **Accessibility** - Verify focus states and error states

## Related Issues Fixed

### Before (Issues)

- ❌ Select dropdowns had inconsistent font sizes (16px browser default vs 14px)
- ❌ Native `<select>` elements were larger than custom Select components
- ❌ Textarea used hardcoded gray borders (`border-gray-300`) breaking dark mode
- ❌ Checkbox used hardcoded blue colors (`text-blue-600`, `ring-blue-500`)
- ❌ Some fields didn't respect design system tokens

### After (Resolved)

- ✅ All form elements use `text-sm` (14px)
- ✅ Consistent visual appearance across all field types
- ✅ All components use design tokens (automatic dark mode support)
- ✅ Perfect alignment in multi-column form layouts
- ✅ Professional, cohesive user experience

## Design System Compliance

This standardization ensures 100% compliance with:

- `docs/design-system.md` - Typography standards (Section 4)
- `docs/design-system.md` - Input component standards (Section 6.1)
- `docs/design-system.md` - Design token usage (Section 2)

## Anti-Patterns to Avoid

### ❌ DON'T

```tsx
// Missing text-sm
<input className="w-full px-3 py-2 border rounded" />

// Hardcoded colors
<input className="border-gray-300 focus:ring-blue-500" />

// Inconsistent sizing
<input className="text-base" /> // 16px - TOO LARGE
<input className="text-xs" />   // 12px - TOO SMALL
```

### ✅ DO

```tsx
// Correct standard pattern
<input className="w-full px-3 py-2 text-sm border border-input bg-background focus-visible:ring-ring" />
```

## Maintenance

- **New components**: Use standard template above
- **PRs**: Verify font-size compliance before merge
- **Reviews**: Check for `text-sm` on all form inputs
- **Regression testing**: Include font size in visual regression suite

---

**Questions or improvements?** Open an issue or PR in the project repository.
