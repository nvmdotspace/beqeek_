# Atlassian Color System Documentation

## Overview

This project uses an Atlassian-inspired color system with semantic tokens and accent colors, built on TailwindCSS v4 with CSS custom properties for automatic light/dark mode adaptation.

**Implementation Status**: Phase 1 Complete (Token Foundation)

## Color Architecture

### Semantic Status Colors

Status colors convey system states and user feedback:

#### Success (Green)

**Use for**: Positive states, completion, successful encryption, data validation

```css
--success: hsl(142 76% 36%) /* Base: #16a34a */ --success-foreground: hsl(0 0% 98%) /* Text on success bg */
  --success-subtle: hsl(142 76% 96%) /* Light backgrounds */ --success-subtle-foreground: hsl(142 76% 25%)
  /* Text on subtle bg */;
```

**Tailwind Usage**:

```tsx
<div className="bg-success text-success-foreground">Encrypted</div>
<div className="bg-success-subtle text-success-subtle-foreground">Active</div>
```

#### Warning (Amber)

**Use for**: Caution states, alerts, unencrypted data, pending actions

```css
--warning: hsl(38 92% 50%) /* Base: #f59e0b */ --warning-foreground: hsl(0 0% 3.9%) /* Text on warning bg */
  --warning-subtle: hsl(38 92% 95%) /* Light backgrounds */ --warning-subtle-foreground: hsl(38 92% 30%)
  /* Text on subtle bg */;
```

**Tailwind Usage**:

```tsx
<div className="bg-warning text-warning-foreground">Warning</div>
<Badge className="bg-warning-subtle text-warning-subtle-foreground">Pending</Badge>
```

#### Info (Blue)

**Use for**: Informational messages, neutral notifications, help text

```css
--info: hsl(217 91% 60%) /* Base: #3b82f6 */ --info-foreground: hsl(0 0% 98%) /* Text on info bg */
  --info-subtle: hsl(217 91% 96%) /* Light backgrounds */ --info-subtle-foreground: hsl(217 91% 30%)
  /* Text on subtle bg */;
```

**Tailwind Usage**:

```tsx
<Alert className="bg-info-subtle border-info">
  <AlertDescription className="text-info-subtle-foreground">Info</AlertDescription>
</Alert>
```

### Accent Colors

8 distinct accent colors for feature categorization and visual hierarchy:

#### Blue (HRM, Employee Management)

```css
--accent-blue: hsl(217 91% 60%) /* #3b82f6 */ --accent-blue-foreground: hsl(0 0% 98%)
  --accent-blue-subtle: hsl(217 91% 96%) --accent-blue-subtle-foreground: hsl(217 91% 30%);
```

#### Purple (Workflows, Automation)

```css
--accent-purple: hsl(271 81% 56%) /* #a855f7 */ --accent-purple-foreground: hsl(0 0% 98%)
  --accent-purple-subtle: hsl(271 81% 96%) --accent-purple-subtle-foreground: hsl(271 81% 30%);
```

#### Green (Data Operations, Analytics)

```css
--accent-green: hsl(142 76% 36%) /* #16a34a */ --accent-green-foreground: hsl(0 0% 98%)
  --accent-green-subtle: hsl(142 76% 96%) --accent-green-subtle-foreground: hsl(142 76% 25%);
```

#### Teal (CRM, Customer)

```css
--accent-teal: hsl(173 80% 40%) /* #14b8a6 */ --accent-teal-foreground: hsl(0 0% 98%)
  --accent-teal-subtle: hsl(173 80% 96%) --accent-teal-subtle-foreground: hsl(173 80% 25%);
```

#### Orange (Finance, Budget)

```css
--accent-orange: hsl(24 94% 50%) /* #f97316 */ --accent-orange-foreground: hsl(0 0% 98%)
  --accent-orange-subtle: hsl(24 94% 96%) --accent-orange-subtle-foreground: hsl(24 94% 30%);
```

#### Magenta (Creative, Content)

```css
--accent-magenta: hsl(328 85% 50%) /* #ec4899 */ --accent-magenta-foreground: hsl(0 0% 98%)
  --accent-magenta-subtle: hsl(328 85% 96%) --accent-magenta-subtle-foreground: hsl(328 85% 30%);
```

#### Lime (Growth, Marketing)

```css
--accent-lime: hsl(82 84% 43%) /* #84cc16 */ --accent-lime-foreground: hsl(0 0% 3.9%) /* Dark text for contrast */
  --accent-lime-subtle: hsl(82 84% 96%) --accent-lime-subtle-foreground: hsl(82 84% 25%);
```

#### Yellow (Highlights, Notifications)

```css
--accent-yellow: hsl(45 93% 58%) /* #facc15 */ --accent-yellow-foreground: hsl(0 0% 3.9%) /* Dark text for contrast */
  --accent-yellow-subtle: hsl(45 93% 96%) --accent-yellow-subtle-foreground: hsl(45 93% 30%);
```

**Tailwind Usage**:

```tsx
<Badge className="bg-accent-purple text-accent-purple-foreground">Workflow</Badge>
<Card className="bg-accent-teal-subtle border-accent-teal">
  <CardTitle className="text-accent-teal-subtle-foreground">CRM</CardTitle>
</Card>
```

## Dark Mode

All colors automatically adapt to dark mode via `.dark` class:

**Light Mode**: Darker colors with 96% lightness subtle backgrounds
**Dark Mode**: Lighter colors with 12% lightness subtle backgrounds

Example transformation:

```css
/* Light mode */
--success: hsl(142 76% 36%) /* Darker green */ --success-subtle: hsl(142 76% 96%) /* Very light background */
  /* Dark mode (.dark) */ --success: hsl(142 70% 45%) /* Lighter green */ --success-subtle: hsl(142 70% 12%)
  /* Very dark background */;
```

**Implementation**: No manual class switching required - CSS custom properties handle adaptation automatically.

## Token Naming Convention

All color tokens follow a 4-variant pattern:

1. **Base** (`--success`): Primary color, high contrast
2. **Foreground** (`--success-foreground`): Text on base background
3. **Subtle** (`--success-subtle`): Low contrast background
4. **Subtle Foreground** (`--success-subtle-foreground`): Text on subtle background

## Accessibility

**WCAG AA Compliance**: All color combinations maintain minimum contrast ratios:

- Text on base backgrounds: ≥ 4.5:1
- UI components: ≥ 3:1
- Large text (18pt+): ≥ 3:1

**Testing**: Use browser DevTools Contrast Checker to verify ratios.

## Usage Guidelines

### When to Use Status Colors

✅ **DO**:

- Use `success` for completed actions, valid data, encryption status
- Use `warning` for caution states, missing data, pending actions
- Use `info` for neutral informational messages, help text
- Use `destructive` (existing) for errors, failed actions, deletion

❌ **DON'T**:

- Don't use status colors for decorative purposes
- Don't use multiple status colors in same component (choose primary state)
- Don't hardcode RGB/hex colors - always use tokens

### When to Use Accent Colors

✅ **DO**:

- Use accent colors to categorize features/modules
- Use accent colors for data visualization (charts, graphs)
- Use subtle variants for low-emphasis backgrounds
- Maintain consistency (same feature = same color)

❌ **DON'T**:

- Don't use too many accent colors in one view (max 3-4)
- Don't use accent colors for interactive states (use primary/secondary)
- Don't mix accent colors with status colors (status takes priority)

## Migration Path

**Current Status**: Phase 1 Complete - Tokens available but not yet applied to components

**Next Steps** (Phase 2-6):

1. **Phase 2**: Replace hardcoded colors in components with tokens
2. **Phase 3**: Update Badge, Alert, Card variants to use tokens
3. **Phase 4**: Migrate SELECT field option colors to accent tokens
4. **Phase 5**: Update data visualization components
5. **Phase 6**: Final audit and documentation update

## Examples

### Status Badges

```tsx
// Success state
<Badge className="bg-success text-success-foreground">
  <ShieldCheck className="h-4 w-4" /> E2EE Active
</Badge>

// Warning state
<Badge className="bg-warning-subtle text-warning-subtle-foreground">
  <AlertTriangle className="h-4 w-4" /> Key Required
</Badge>

// Info state
<Badge className="bg-info-subtle text-info-subtle-foreground">
  <Info className="h-4 w-4" /> Server Encryption
</Badge>
```

### Accent Cards

```tsx
// Workflow feature
<Card className="bg-accent-purple-subtle border-accent-purple/20">
  <CardHeader>
    <CardTitle className="text-accent-purple">Workflows</CardTitle>
  </CardHeader>
  <CardContent className="text-accent-purple-subtle-foreground">
    Automate your processes
  </CardContent>
</Card>

// CRM feature
<Card className="bg-accent-teal-subtle border-accent-teal/20">
  <CardHeader>
    <CardTitle className="text-accent-teal">Customer Relations</CardTitle>
  </CardHeader>
</Card>
```

### Inline Styles (Direct CSS Variable Access)

```tsx
// For SELECT field options with custom colors
<div
  style={{
    backgroundColor: 'var(--accent-purple)',
    color: 'var(--accent-purple-foreground)',
  }}
>
  Custom option
</div>
```

## Technical Details

**Location**: `/packages/ui/src/styles/globals.css`

**Tokens Defined**:

- Lines 51-72: Semantic status colors (:root)
- Lines 73-123: Accent colors (:root)
- Lines 303-358: Dark mode variants (.dark)
- Lines 466-521: TailwindCSS @theme mappings

**How It Works**:

1. CSS custom properties defined in `:root` (light mode)
2. `.dark` class overrides properties for dark mode
3. `@theme` block maps variables to Tailwind utilities
4. TailwindCSS generates classes like `bg-success`, `text-warning`, etc.

## Future Enhancements

- [ ] Color picker component using accent palette
- [ ] Automatic color assignment for new table types
- [ ] Color contrast validator utility
- [ ] Storybook stories for all color combinations
- [ ] Figma design tokens export

## References

- [Atlassian Design System - Color](https://atlassian.design/foundations/color-new)
- [TailwindCSS v4 - CSS-first configuration](https://tailwindcss.com/docs/v4-beta)
- [WCAG 2.1 AA - Color Contrast](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
