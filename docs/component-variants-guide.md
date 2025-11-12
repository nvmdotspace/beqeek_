# Component Variants Guide

**Last Updated:** 2025-11-12
**Phase:** 3 Complete

## Overview

This guide documents the semantic color variants available for Badge and Alert components in the UI package. All variants use Atlassian-inspired design tokens that automatically adapt to light/dark themes.

## Badge Component

**Location:** `@workspace/ui/components/badge`

### Available Variants

#### 1. default (Gray)

**Use:** General purpose, neutral information

```tsx
<Badge variant="default">Default</Badge>
```

#### 2. secondary (Muted)

**Use:** Less emphasis, background information

```tsx
<Badge variant="secondary">Secondary</Badge>
```

#### 3. destructive (Red)

**Use:** Errors, deletions, critical warnings

```tsx
<Badge variant="destructive">Error</Badge>
```

#### 4. outline (Border only)

**Use:** Minimal emphasis, clean look

```tsx
<Badge variant="outline">Outlined</Badge>
```

#### 5. success (Green) ✨ NEW

**Use:** Successful actions, completed states, valid data, encryption enabled

```tsx
<Badge variant="success">
  <ShieldCheck className="h-4 w-4" />
  E2EE Active
</Badge>
```

**Design tokens:**

- Background: `bg-success-subtle` (light green)
- Text: `text-success` (green)
- Border: `border-success/20` (subtle green border)

**Examples:**

- ✅ Encryption key validated
- ✅ Copy successful
- ✅ Data saved
- ✅ Process completed

#### 6. warning (Yellow/Amber) ✨ NEW

**Use:** Warnings, cautions, pending actions, missing data

```tsx
<Badge variant="warning">
  <AlertTriangle className="h-4 w-4" />
  Key Required
</Badge>
```

**Design tokens:**

- Background: `bg-warning-subtle` (light amber)
- Text: `text-warning` (amber)
- Border: `border-warning/20` (subtle amber border)

**Examples:**

- ⚠️ Encryption key needed
- ⚠️ Missing required field
- ⚠️ Action pending
- ⚠️ Attention needed

#### 7. info (Blue) ✨ NEW

**Use:** Informational messages, help text, neutral notifications

```tsx
<Badge variant="info">
  <Info className="h-4 w-4" />
  Server Encryption
</Badge>
```

**Design tokens:**

- Background: `bg-info-subtle` (light blue)
- Text: `text-info` (blue)
- Border: `border-info/20` (subtle blue border)

**Examples:**

- ℹ️ Information notices
- ℹ️ Feature descriptions
- ℹ️ Help tooltips
- ℹ️ System messages

### Size Variants

```tsx
<Badge size="base">Base Size</Badge>
<Badge size="compact">Compact Size</Badge>
```

- **base**: Default text size (12px)
- **compact**: Smaller text (11px) for dense UIs

### Complete Examples

```tsx
import { Badge } from '@workspace/ui/components/badge';
import { ShieldCheck, AlertTriangle, Info } from 'lucide-react';

// Encryption status
<Badge variant="success">
  <ShieldCheck className="h-4 w-4" />
  Encrypted
</Badge>

// Warning state
<Badge variant="warning" size="compact">
  <AlertTriangle className="h-3.5 w-3.5" />
  Unverified
</Badge>

// Info badge
<Badge variant="info">
  <Info className="h-4 w-4" />
  Server-side
</Badge>
```

---

## Alert Component

**Location:** `@workspace/ui/components/alert`

### Available Variants

#### 1. default (Gray)

**Use:** General notifications, neutral messages

```tsx
<Alert>
  <AlertTitle>Note</AlertTitle>
  <AlertDescription>This is a general message.</AlertDescription>
</Alert>
```

#### 2. destructive (Red)

**Use:** Errors, critical warnings, dangerous actions

```tsx
<Alert variant="destructive">
  <AlertTriangle className="h-4 w-4" />
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>Something went wrong. Please try again.</AlertDescription>
</Alert>
```

#### 3. success (Green) ✨ NEW

**Use:** Success messages, confirmations, completed actions

```tsx
<Alert variant="success">
  <ShieldCheck className="h-4 w-4" />
  <AlertTitle>Success</AlertTitle>
  <AlertDescription>Your encryption key has been validated successfully.</AlertDescription>
</Alert>
```

**Design tokens:**

- Background: `bg-success-subtle`
- Text: `text-success`
- Border: `border-success/50`
- Icon color: `text-success`

**Examples:**

- ✅ Operation completed successfully
- ✅ Data saved
- ✅ Settings updated
- ✅ Encryption enabled

#### 4. warning (Yellow/Amber) ✨ NEW

**Use:** Warnings, cautions, attention needed

```tsx
<Alert variant="warning">
  <AlertTriangle className="h-4 w-4" />
  <AlertTitle>Warning</AlertTitle>
  <AlertDescription>This table requires an encryption key to view encrypted data.</AlertDescription>
</Alert>
```

**Design tokens:**

- Background: `bg-warning-subtle`
- Text: `text-warning`
- Border: `border-warning/50`
- Icon color: `text-warning`

**Examples:**

- ⚠️ Action requires confirmation
- ⚠️ Missing required data
- ⚠️ Potential issues detected
- ⚠️ Review before proceeding

#### 5. info (Blue) ✨ NEW

**Use:** Informational messages, tips, helpful context

```tsx
<Alert variant="info">
  <Info className="h-4 w-4" />
  <AlertTitle>Information</AlertTitle>
  <AlertDescription>You can use quick filters to find records faster.</AlertDescription>
</Alert>
```

**Design tokens:**

- Background: `bg-info-subtle`
- Text: `text-info`
- Border: `border-info/50`
- Icon color: `text-info`

**Examples:**

- ℹ️ Feature explanations
- ℹ️ Tips and tricks
- ℹ️ System information
- ℹ️ Help documentation

### Complete Examples

```tsx
import { Alert, AlertTitle, AlertDescription } from '@workspace/ui/components/alert';
import { ShieldCheck, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';

// Success alert
<Alert variant="success">
  <CheckCircle2 className="h-4 w-4" />
  <AlertTitle>Encryption Enabled</AlertTitle>
  <AlertDescription>
    End-to-end encryption has been successfully activated for this table.
  </AlertDescription>
</Alert>

// Warning alert
<Alert variant="warning">
  <AlertTriangle className="h-4 w-4" />
  <AlertTitle>Missing Configuration</AlertTitle>
  <AlertDescription>
    Some required fields are not configured. Please review the settings.
  </AlertDescription>
</Alert>

// Info alert
<Alert variant="info">
  <Info className="h-4 w-4" />
  <AlertTitle>Quick Tip</AlertTitle>
  <AlertDescription>
    Use Ctrl+K to quickly search across all tables.
  </AlertDescription>
</Alert>
```

---

## Usage Guidelines

### When to Use Success

✅ **DO:**

- Encryption successfully enabled
- Data saved/updated successfully
- Operation completed without errors
- Validation passed
- Authentication successful

❌ **DON'T:**

- General positive sentiment (use default)
- Minor confirmations (use toast instead)
- Expected behavior (no feedback needed)

### When to Use Warning

✅ **DO:**

- Missing required data/configuration
- Action requires user attention
- Potential issues detected
- Temporary unavailability
- Deprecated features

❌ **DON'T:**

- Critical errors (use destructive)
- Successful operations (use success)
- General information (use info)

### When to Use Info

✅ **DO:**

- Feature explanations
- Help documentation
- Tips and best practices
- System notifications
- Neutral status updates

❌ **DON'T:**

- Warnings or errors (use warning/destructive)
- Success confirmations (use success)
- Urgent actions (use warning)

### When to Use Destructive

✅ **DO:**

- Errors that prevent operation
- Data loss warnings
- Irreversible actions
- Critical system failures
- Security alerts

❌ **DON'T:**

- Warnings (use warning)
- General cautions (use warning)
- Informational errors (use info)

---

## Accessibility

All variants maintain WCAG AA contrast ratios:

- Text on backgrounds: ≥ 4.5:1
- Icons: ≥ 3:1
- Borders: ≥ 3:1

### Screen Reader Support

```tsx
// Alert has role="alert" by default
<Alert variant="success">
  <AlertTitle>Success</AlertTitle>
  <AlertDescription>Operation completed</AlertDescription>
</Alert>

// Badges are informational spans (no special role needed)
<Badge variant="warning">Warning</Badge>
```

---

## Theme Support

All variants automatically adapt to light/dark modes using CSS custom properties. No manual dark mode classes required.

**Light Mode:**

- Subtle backgrounds (96% lightness)
- Darker text (25-36% lightness)
- Visible borders

**Dark Mode:**

- Darker backgrounds (12% lightness)
- Lighter text (45-70% lightness)
- Maintained contrast

---

## Migration from Hardcoded Colors

### Before (Hardcoded)

```tsx
// ❌ Old way - hardcoded colors
<Badge className="bg-green-100 text-green-700 border-green-500">
  Success
</Badge>

<Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200">
  <p className="text-blue-900 dark:text-blue-100">Info</p>
</Alert>
```

### After (Semantic Tokens)

```tsx
// ✅ New way - semantic variants
<Badge variant="success">
  Success
</Badge>

<Alert variant="info">
  <AlertDescription>Info</AlertDescription>
</Alert>
```

---

## Design Tokens Reference

**Badge Tokens:**

```css
/* Success */
bg-success-subtle     /* Light green background */
text-success          /* Green text */
border-success/20     /* Subtle green border */

/* Warning */
bg-warning-subtle     /* Light amber background */
text-warning          /* Amber text */
border-warning/20     /* Subtle amber border */

/* Info */
bg-info-subtle        /* Light blue background */
text-info             /* Blue text */
border-info/20        /* Subtle blue border */
```

**Alert Tokens:**

```css
/* Success */
bg-success-subtle     /* Light green background */
text-success          /* Green text */
border-success/50     /* Medium green border */
[&>svg]:text-success  /* Green icon */

/* Warning */
bg-warning-subtle     /* Light amber background */
text-warning          /* Amber text */
border-warning/50     /* Medium amber border */
[&>svg]:text-warning  /* Amber icon */

/* Info */
bg-info-subtle        /* Light blue background */
text-info             /* Blue text */
border-info/50        /* Medium blue border */
[&>svg]:text-info     /* Blue icon */
```

---

## Testing Checklist

- [ ] All variants render in light mode
- [ ] All variants render in dark mode
- [ ] Icons display correct colors
- [ ] Text maintains readable contrast
- [ ] Borders are visible but subtle
- [ ] Variants work with size options
- [ ] Screen readers announce content
- [ ] Keyboard navigation works

---

## Related Documentation

- **Color System:** `/docs/atlassian-color-system.md`
- **Phase 2 Complete:** `/docs/plans/phase-2-complete.md`
- **Token Definitions:** `/packages/ui/src/styles/globals.css`
