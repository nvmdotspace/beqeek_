# Beqeek Design System

**Version**: 1.0.0
**Last Updated**: 2025-11-12
**Status**: Active

## Table of Contents

1. [Overview](#overview)
2. [Design Tokens](#design-tokens)
3. [Color System](#color-system)
4. [Typography](#typography)
5. [Spacing & Layout](#spacing--layout)
6. [Components](#components)
7. [Accessibility](#accessibility)
8. [Best Practices](#best-practices)
9. [Vietnamese Typography](#vietnamese-typography)

---

## Overview

Beqeek's design system is built on TailwindCSS v4, shadcn/ui, and Radix UI primitives. It emphasizes:

- **CSS Custom Properties** for theming (light/dark mode)
- **Mobile-first responsive design** with defined breakpoints
- **WCAG 2.1 AA accessibility** standards
- **Type-safe components** with full TypeScript support
- **Vietnamese typography** optimization

### Tech Stack

- **TailwindCSS v4**: Utility-first CSS framework with native CSS custom properties
- **shadcn/ui**: Composable component system built on Radix UI
- **Radix UI**: Unstyled, accessible component primitives
- **class-variance-authority**: Type-safe variant management
- **Geist Fonts**: Sans-serif and monospace font families

---

## Design Tokens

Design tokens are CSS custom properties defined in `packages/ui/src/styles/globals.css`. All components MUST use these tokens instead of hardcoded values.

### Token Categories

**Color Tokens**: Background, foreground, borders, interactive states
**Spacing Tokens**: Consistent spacing scale (0.25rem increments)
**Radius Tokens**: Border radius values (sm, md, lg, xl)
**Typography Tokens**: Font families, sizes, weights, line heights

### Using Tokens

```tsx
// ✅ CORRECT: Use design tokens
<div className="bg-background text-foreground border-border rounded-lg" />

// ❌ WRONG: Hardcoded values
<div className="bg-white text-gray-900 border-gray-200 rounded-lg" />
```

### Benefits

- ✅ Automatic dark mode support
- ✅ Consistent theming across app
- ✅ Easy theme customization
- ✅ Reduced maintenance burden

---

## Color System

All colors are defined as HSL values with semantic naming. The system automatically adapts to light/dark modes.

### Semantic Color Tokens

#### Base Colors

| Token                  | Light Mode       | Dark Mode        | Usage               |
| ---------------------- | ---------------- | ---------------- | ------------------- |
| `--background`         | `hsl(0 0% 100%)` | `hsl(0 0% 3.9%)` | Page background     |
| `--foreground`         | `hsl(0 0% 3.9%)` | `hsl(0 0% 98%)`  | Primary text        |
| `--card`               | `hsl(0 0% 100%)` | `hsl(0 0% 3.9%)` | Card backgrounds    |
| `--card-foreground`    | `hsl(0 0% 3.9%)` | `hsl(0 0% 98%)`  | Card text           |
| `--popover`            | `hsl(0 0% 100%)` | `hsl(0 0% 3.9%)` | Popover backgrounds |
| `--popover-foreground` | `hsl(0 0% 3.9%)` | `hsl(0 0% 98%)`  | Popover text        |

#### Interactive Colors

| Token                    | Light Mode        | Dark Mode         | Usage                    |
| ------------------------ | ----------------- | ----------------- | ------------------------ |
| `--primary`              | `hsl(0 0% 9%)`    | `hsl(0 0% 98%)`   | Primary buttons, links   |
| `--primary-foreground`   | `hsl(0 0% 98%)`   | `hsl(0 0% 9%)`    | Text on primary          |
| `--secondary`            | `hsl(0 0% 96.1%)` | `hsl(0 0% 14.9%)` | Secondary buttons        |
| `--secondary-foreground` | `hsl(0 0% 9%)`    | `hsl(0 0% 98%)`   | Text on secondary        |
| `--accent`               | `hsl(0 0% 96.1%)` | `hsl(0 0% 14.9%)` | Hover states, highlights |
| `--accent-foreground`    | `hsl(0 0% 9%)`    | `hsl(0 0% 98%)`   | Text on accent           |

#### Feedback Colors

| Token                      | Light Mode           | Dark Mode            | Usage                               |
| -------------------------- | -------------------- | -------------------- | ----------------------------------- |
| `--destructive`            | `hsl(0 84.2% 60.2%)` | `hsl(0 62.8% 30.6%)` | Errors, delete actions              |
| `--destructive-foreground` | `hsl(0 0% 98%)`      | `hsl(0 0% 98%)`      | Text on destructive                 |
| `--muted`                  | `hsl(0 0% 96.1%)`    | `hsl(0 0% 14.9%)`    | Disabled states, subtle backgrounds |
| `--muted-foreground`       | `hsl(0 0% 45.1%)`    | `hsl(0 0% 63.9%)`    | Placeholder text, secondary text    |

#### Borders & Focus

| Token      | Light Mode        | Dark Mode         | Usage             |
| ---------- | ----------------- | ----------------- | ----------------- |
| `--border` | `hsl(0 0% 89.8%)` | `hsl(0 0% 14.9%)` | Component borders |
| `--input`  | `hsl(0 0% 89.8%)` | `hsl(0 0% 14.9%)` | Input borders     |
| `--ring`   | `hsl(0 0% 3.9%)`  | `hsl(0 0% 83.1%)` | Focus rings       |

#### Chart Colors

| Token       | Light Mode         | Dark Mode          | Usage               |
| ----------- | ------------------ | ------------------ | ------------------- |
| `--chart-1` | `hsl(12 76% 61%)`  | `hsl(220 70% 50%)` | Chart data series 1 |
| `--chart-2` | `hsl(173 58% 39%)` | `hsl(160 60% 45%)` | Chart data series 2 |
| `--chart-3` | `hsl(197 37% 24%)` | `hsl(30 80% 55%)`  | Chart data series 3 |
| `--chart-4` | `hsl(43 74% 66%)`  | `hsl(280 65% 60%)` | Chart data series 4 |
| `--chart-5` | `hsl(27 87% 67%)`  | `hsl(340 75% 55%)` | Chart data series 5 |

#### Sidebar Colors

| Token                          | Light Mode        | Dark Mode         | Usage                |
| ------------------------------ | ----------------- | ----------------- | -------------------- |
| `--sidebar`                    | `hsl(0 0% 98%)`   | `hsl(0 0% 9%)`    | Sidebar background   |
| `--sidebar-foreground`         | `hsl(0 0% 3.9%)`  | `hsl(0 0% 98%)`   | Sidebar text         |
| `--sidebar-primary`            | `hsl(0 0% 9%)`    | `hsl(0 0% 98%)`   | Sidebar active items |
| `--sidebar-primary-foreground` | `hsl(0 0% 98%)`   | `hsl(0 0% 9%)`    | Text on active items |
| `--sidebar-accent`             | `hsl(0 0% 96.1%)` | `hsl(0 0% 14.9%)` | Sidebar hover states |
| `--sidebar-accent-foreground`  | `hsl(0 0% 9%)`    | `hsl(0 0% 98%)`   | Text on hover        |
| `--sidebar-border`             | `hsl(0 0% 89.8%)` | `hsl(0 0% 14.9%)` | Sidebar borders      |

### Usage in Components

```tsx
// Text colors
<p className="text-foreground">Primary text</p>
<p className="text-muted-foreground">Secondary text</p>

// Backgrounds
<div className="bg-background">Page background</div>
<div className="bg-card">Card background</div>

// Borders
<div className="border-border">Standard border</div>
<input className="border-input">Input border</input>

// Interactive states
<button className="bg-primary text-primary-foreground hover:bg-primary/90">
  Primary button
</button>
```

---

## Typography

Typography system provides **semantic components** and design tokens using Inter font family with Vietnamese optimization and responsive scaling.

### Typography Components (Recommended)

Beqeek provides semantic typography components that automatically apply design tokens. These replace manual Tailwind classes for better consistency and maintainability.

#### Quick Start

```tsx
import { Heading, Text, Code, Metric } from '@workspace/ui/components/typography';

// Semantic heading with automatic styling
<Heading level={1}>Page Title</Heading>

// Body text with size and color variants
<Text size="large" weight="medium">Emphasized text</Text>

// Inline or block code
<Code>const example = true;</Code>

// Numeric displays for dashboards
<Metric size="large" value={1234} label="Total Users" />
```

**📖 Full documentation**: [`docs/typography-components.md`](./typography-components.md)

#### Component Overview

| Component   | Purpose                   | Key Props                 | Example                                      |
| ----------- | ------------------------- | ------------------------- | -------------------------------------------- |
| `<Heading>` | Semantic headings (h1-h6) | `level` (1-6), `as`       | `<Heading level={2}>Section Title</Heading>` |
| `<Text>`    | Body text with variants   | `size`, `weight`, `color` | `<Text color="muted">Helper text</Text>`     |
| `<Code>`    | Inline/block code         | `inline` (boolean)        | `<Code inline={false}>{code}</Code>`         |
| `<Metric>`  | Numeric displays          | `size`, `value`, `label`  | `<Metric value={99.9} label="Uptime %" />`   |

#### Benefits

- ✅ **Automatic design token application** - No manual CSS classes
- ✅ **Vietnamese optimization** - When `lang="vi"` is set
- ✅ **Responsive scaling** - Typography scales at 1024px and 1280px
- ✅ **Dark mode support** - Theme-aware colors
- ✅ **Type-safe props** - Full TypeScript support
- ✅ **Accessibility** - Semantic HTML with WCAG 2.1 AA compliance

#### Migration Example

```tsx
// ⚠️ OLD: Manual Tailwind classes
<h1 className="text-3xl font-bold tracking-tight">
  Quản lý không gian làm việc
</h1>
<p className="text-2xl font-bold">1,234</p>
<span className="text-sm text-muted-foreground">Helper text</span>

// ✅ NEW: Semantic components (recommended)
<Heading level={1}>
  Quản lý không gian làm việc
</Heading>
<Metric size="medium" value={1234} />
<Text size="small" color="muted">Helper text</Text>
```

### Design Tokens

Typography design tokens are defined in `packages/ui/src/styles/globals.css` with 100+ CSS custom properties.

#### Heading Scale

| Level | Size            | Weight | Line Height     | Usage             |
| ----- | --------------- | ------ | --------------- | ----------------- |
| H1    | 2.25rem (36px)  | 700    | 2.7rem (1.2)    | Page titles       |
| H2    | 1.875rem (30px) | 600    | 2.375rem (1.25) | Section titles    |
| H3    | 1.5rem (24px)   | 600    | 2rem (1.33)     | Subsection titles |
| H4    | 1.25rem (20px)  | 600    | 1.75rem (1.4)   | Card titles       |
| H5    | 1.125rem (18px) | 600    | 1.575rem (1.4)  | Small headings    |
| H6    | 1rem (16px)     | 600    | 1.4rem (1.4)    | Smallest headings |

**Responsive**: H1-H3 scale +10% at 1024px, H1-H2 scale +15% at 1280px

#### Body Text Scale

| Size    | Font Size       | Line Height    | Usage            |
| ------- | --------------- | -------------- | ---------------- |
| Large   | 1rem (16px)     | 1.5rem (1.5)   | Emphasized body  |
| Default | 0.875rem (14px) | 1.25rem (1.43) | Standard UI text |
| Small   | 0.75rem (12px)  | 1rem (1.33)    | Captions, labels |

#### Vietnamese Optimization

When `document.documentElement.lang === 'vi'`:

- ✅ Line heights increase 8-13% for diacritic spacing
- ✅ Font weights reduce from 700→600 for headings
- ✅ Letter spacing normalized
- ✅ All 134 Vietnamese characters supported

See: [`docs/vietnamese-typography-guide.md`](./vietnamese-typography-guide.md)

### Font Families

**Sans-serif**: Inter (actual), Geist Sans (documented but not implemented)
**Monospace**: Menlo, Monaco, Consolas (code, data)

```tsx
// CSS custom properties
font-family: var(--font-family-sans);
font-family: var(--font-family-mono);
```

### Legacy Tailwind Classes

**Note**: While Tailwind utility classes still work, **new code should use typography components** for better consistency.

#### Font Sizes

| Class       | Size            | Usage                   |
| ----------- | --------------- | ----------------------- |
| `text-xs`   | 0.75rem (12px)  | Captions, labels        |
| `text-sm`   | 0.875rem (14px) | Small text, form inputs |
| `text-base` | 1rem (16px)     | Body text               |
| `text-lg`   | 1.125rem (18px) | Subheadings             |
| `text-xl`   | 1.25rem (20px)  | Headings                |
| `text-2xl`  | 1.5rem (24px)   | Page titles             |
| `text-3xl`  | 1.875rem (30px) | Hero headings           |
| `text-4xl`  | 2.25rem (36px)  | Large headlines         |

#### Font Weights

| Class           | Weight | Usage            |
| --------------- | ------ | ---------------- |
| `font-normal`   | 400    | Body text        |
| `font-medium`   | 500    | Emphasis, labels |
| `font-semibold` | 600    | Subheadings      |
| `font-bold`     | 700    | Headings         |

#### Line Heights

| Class             | Height | Usage             |
| ----------------- | ------ | ----------------- |
| `leading-none`    | 1      | Tight text        |
| `leading-tight`   | 1.25   | Headings          |
| `leading-snug`    | 1.375  | Subheadings       |
| `leading-normal`  | 1.5    | Body text         |
| `leading-relaxed` | 1.625  | Long-form content |

### Migration Strategy

**Gradual migration** - No breaking changes required:

1. ✅ **New features**: Use typography components (`<Heading>`, `<Text>`, etc.)
2. ⚠️ **Existing code**: Keep Tailwind classes (migrate incrementally)
3. 📋 **High-priority pages**: Dashboard, login, workspace pages (Phase 4)
4. 🔮 **Future**: ESLint rules will encourage component usage

See migration examples in [`docs/typography-components.md`](./typography-components.md)

---

## Spacing & Layout

### Spacing Scale

TailwindCSS v4 uses a 0.25rem (4px) spacing scale:

| Class          | Size    | Pixels |
| -------------- | ------- | ------ |
| `p-0`, `m-0`   | 0rem    | 0px    |
| `p-1`, `m-1`   | 0.25rem | 4px    |
| `p-2`, `m-2`   | 0.5rem  | 8px    |
| `p-3`, `m-3`   | 0.75rem | 12px   |
| `p-4`, `m-4`   | 1rem    | 16px   |
| `p-6`, `m-6`   | 1.5rem  | 24px   |
| `p-8`, `m-8`   | 2rem    | 32px   |
| `p-12`, `m-12` | 3rem    | 48px   |
| `p-16`, `m-16` | 4rem    | 64px   |

### Border Radius

| Token         | Value                       | Class        | Usage                 |
| ------------- | --------------------------- | ------------ | --------------------- |
| `--radius-sm` | `calc(var(--radius) - 4px)` | `rounded-sm` | Small elements        |
| `--radius-md` | `calc(var(--radius) - 2px)` | `rounded-md` | Medium elements       |
| `--radius-lg` | `var(--radius)`             | `rounded-lg` | Large elements, cards |
| `--radius-xl` | `calc(var(--radius) + 4px)` | `rounded-xl` | Modals, dialogs       |

Base radius: `--radius: 0.6rem` (≈10px)

### Responsive Breakpoints

**Mobile-first approach**: Write styles for mobile, then add responsive classes for larger screens.

| Breakpoint | Min Width | Class Prefix | Usage                       |
| ---------- | --------- | ------------ | --------------------------- |
| `xs`       | 0px       | (default)    | Mobile phones               |
| `sm`       | 640px     | `sm:`        | Large phones, small tablets |
| `md`       | 768px     | `md:`        | Tablets                     |
| `lg`       | 1024px    | `lg:`        | Laptops, small desktops     |
| `xl`       | 1280px    | `xl:`        | Desktops                    |
| `2xl`      | 1536px    | `2xl:`       | Large desktops              |

### Layout Examples

```tsx
// Responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <Card />
  <Card />
  <Card />
</div>

// Container with responsive padding
<div className="container mx-auto px-4 sm:px-6 lg:px-8">
  {/* Content */}
</div>

// Flex layout with spacing
<div className="flex flex-col gap-4 md:flex-row md:gap-6">
  <div>Item 1</div>
  <div>Item 2</div>
</div>
```

### Mobile-Specific Utilities

```css
/* Hide scrollbar on mobile (in globals.css) */
.hide-scrollbar-mobile {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.hide-scrollbar-mobile::-webkit-scrollbar {
  display: none;
}

/* Prevent horizontal overflow */
@media (max-width: 767px) {
  html,
  body {
    overflow-x: hidden;
  }
}
```

---

## Components

### Input Components (MANDATORY STANDARDS)

All input components MUST use design tokens for consistent appearance across light/dark modes.

#### Standard Input Classes

```tsx
// Base input styling
className={cn(
  // Layout
  "flex h-10 w-full rounded-md",

  // Colors (design tokens - REQUIRED)
  "border border-input",
  "bg-background text-foreground",

  // Spacing
  "px-3 py-2",

  // Typography
  "text-sm",

  // Transitions
  "transition-all",

  // Placeholder
  "placeholder:text-muted-foreground",

  // Focus state (REQUIRED)
  "focus-visible:outline-none",
  "focus-visible:ring-1",
  "focus-visible:ring-inset",
  "focus-visible:ring-ring",

  // Error state
  "aria-invalid:border-destructive",

  // Disabled state
  "disabled:cursor-not-allowed",
  "disabled:opacity-50"
)}
```

#### Input Component Example

```tsx
import { cn } from '@workspace/ui/lib/utils';

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, type = 'text', ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm transition-all placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
```

#### Textarea Component Example

```tsx
const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<'textarea'>>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm transition-all placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
```

### Button Component

Buttons use class-variance-authority for type-safe variants.

#### Variants

| Variant       | Usage                          | Appearance                         |
| ------------- | ------------------------------ | ---------------------------------- |
| `default`     | Primary actions                | Solid primary color                |
| `destructive` | Delete, dangerous actions      | Red/destructive color              |
| `outline`     | Secondary actions              | Border with transparent background |
| `secondary`   | Less prominent actions         | Subtle gray background             |
| `ghost`       | Tertiary actions, icon buttons | Transparent, hover effect          |
| `link`        | Text links                     | Underline on hover                 |

#### Sizes

| Size      | Height      | Usage                          |
| --------- | ----------- | ------------------------------ |
| `sm`      | 32px        | Compact spaces, inline actions |
| `default` | 36px        | Standard buttons               |
| `lg`      | 40px        | Prominent actions              |
| `icon`    | 36px × 36px | Icon-only buttons              |

#### Button Examples

```tsx
import { Button } from '@workspace/ui/components/button';

// Primary action
<Button variant="default">Save Changes</Button>

// Destructive action
<Button variant="destructive">Delete</Button>

// Secondary action
<Button variant="outline">Cancel</Button>

// Icon button
<Button variant="ghost" size="icon">
  <Icon />
</Button>

// As child (custom element)
<Button asChild>
  <a href="/link">Link Button</a>
</Button>
```

### Card Component

Cards are containers with consistent padding and borders.

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@workspace/ui/components/card';

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Optional description text</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card content goes here</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>;
```

### Dialog Component

Modals with backdrop and focus trap.

```tsx
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@workspace/ui/components/dialog';

<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>Dialog description text</DialogDescription>
    </DialogHeader>
    {/* Dialog content */}
  </DialogContent>
</Dialog>;
```

### Form Components

#### Label

```tsx
import { Label } from '@workspace/ui/components/label';

<Label htmlFor="email">Email Address</Label>
<Input id="email" type="email" />
```

#### Checkbox

```tsx
import { Checkbox } from '@workspace/ui/components/checkbox';

<div className="flex items-center gap-2">
  <Checkbox id="terms" />
  <Label htmlFor="terms">Accept terms and conditions</Label>
</div>;
```

#### Select

```tsx
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@workspace/ui/components/select';

<Select>
  <SelectTrigger>
    <SelectValue placeholder="Select option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
  </SelectContent>
</Select>;
```

### Feedback Components

#### Alert

```tsx
import { Alert, AlertTitle, AlertDescription } from '@workspace/ui/components/alert';

<Alert>
  <AlertTitle>Alert Title</AlertTitle>
  <AlertDescription>Alert message content</AlertDescription>
</Alert>

// Destructive variant
<Alert variant="destructive">
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>Something went wrong</AlertDescription>
</Alert>
```

#### Toast (Sonner)

```tsx
import { toast } from 'sonner';

// Success toast
toast.success('Changes saved successfully');

// Error toast
toast.error('Failed to save changes');

// Custom toast
toast('Custom message', {
  description: 'Additional details here',
  action: {
    label: 'Undo',
    onClick: () => console.log('Undo'),
  },
});
```

---

## Accessibility

### WCAG 2.1 AA Compliance

All components MUST meet WCAG 2.1 Level AA standards:

- **Contrast Ratios**: 4.5:1 for normal text, 3:1 for large text
- **Keyboard Navigation**: All interactive elements focusable and operable via keyboard
- **Screen Reader Support**: ARIA labels, roles, and live regions
- **Focus Indicators**: Visible focus rings on all interactive elements

### Focus Management

```tsx
// Standard focus ring (REQUIRED for all inputs)
focus-visible:outline-none
focus-visible:ring-1
focus-visible:ring-inset
focus-visible:ring-ring

// Button focus ring
focus-visible:ring-4
focus-visible:outline-1

// Custom focus styles
focus-visible:ring-2
focus-visible:ring-offset-2
focus-visible:ring-primary
```

### ARIA Attributes

```tsx
// Button with icon only - MUST have aria-label
<Button variant="ghost" size="icon" aria-label="Close dialog">
  <X className="size-4" />
</Button>

// Form input with error - use aria-invalid and aria-describedby
<Input
  aria-invalid={hasError}
  aria-describedby={hasError ? 'error-message' : undefined}
/>
{hasError && <span id="error-message" className="text-sm text-destructive">{errorMessage}</span>}

// Dialog - use DialogTitle and DialogDescription
<Dialog>
  <DialogContent>
    <DialogTitle>Accessible Dialog Title</DialogTitle>
    <DialogDescription>This description is read by screen readers</DialogDescription>
  </DialogContent>
</Dialog>
```

### Keyboard Navigation

All interactive components support standard keyboard patterns:

- **Enter/Space**: Activate buttons, toggles
- **Escape**: Close dialogs, dropdowns, popovers
- **Tab/Shift+Tab**: Navigate between focusable elements
- **Arrow keys**: Navigate within lists, menus, tabs
- **Home/End**: Jump to first/last item in lists

### Screen Reader Support

```tsx
// Live announcements for dynamic content
<div role="status" aria-live="polite" className="sr-only">
  {statusMessage}
</div>

// Screen reader only text
<span className="sr-only">Additional context for screen readers</span>

// Skip to main content link
<a href="#main-content" className="sr-only focus:not-sr-only">
  Skip to main content
</a>
```

---

## Best Practices

### Component Development

#### DO ✅

- **Use design tokens** for all colors, spacing, typography
- **Follow mobile-first** responsive design
- **Include ARIA attributes** for accessibility
- **Write TypeScript** with full type coverage
- **Use `cn()` utility** for conditional classes
- **Test keyboard navigation** on all interactive elements
- **Support dark mode** via design tokens

```tsx
// ✅ Good example
import { cn } from '@workspace/ui/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outlined';
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(({ className, variant = 'default', ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'rounded-lg bg-card p-6 text-card-foreground shadow-sm',
        variant === 'outlined' && 'border border-border',
        className,
      )}
      {...props}
    />
  );
});
Card.displayName = 'Card';
```

#### DON'T ❌

- **Hardcode colors** or spacing values
- **Skip accessibility** features (ARIA, keyboard nav)
- **Ignore dark mode** support
- **Use inline styles** instead of Tailwind classes
- **Mix state management** (don't use Zustand for server data)
- **Create components** without TypeScript types

```tsx
// ❌ Bad example
const Card = ({ children }) => {
  return (
    <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '8px' }} className="shadow-sm">
      {children}
    </div>
  );
};
```

### State Management

**Local State (useState)** - UI-only state, form inputs, modals, toggles
**Server State (React Query)** - API data, caching, mutations, invalidation
**Global State (Zustand)** - User preferences, auth, theme, sidebar, language

### Performance

- **Code splitting**: Use lazy loading for routes and heavy components
- **Memoization**: Use `React.memo()`, `useMemo()`, `useCallback()` for expensive operations
- **Virtualization**: Use virtual scrolling for long lists (react-window, @tanstack/react-virtual)
- **Image optimization**: Use WebP format, lazy loading, responsive images

### Code Quality

```bash
# Lint code
pnpm lint

# Type check
pnpm --filter web check-types

# Format code
pnpm format

# Build (includes type checking)
pnpm build
```

---

## Vietnamese Typography

### Character Support

Beqeek fully supports Vietnamese diacritics (thanh điệu):

- **Acute accent**: á, é, í, ó, ú, ý
- **Grave accent**: à, è, ì, ò, ù, ỳ
- **Hook above**: ả, ẻ, ỉ, ỏ, ủ, ỷ
- **Tilde**: ã, ẽ, ĩ, õ, ũ, ỹ
- **Dot below**: ạ, ẹ, ị, ọ, ụ, ỵ
- **Horn**: ơ, ư (with all tone marks)
- **Breve**: ă (with all tone marks)

### Font Rendering

Geist Sans and Geist Mono are optimized for Vietnamese characters:

```tsx
// Default font stack includes Vietnamese support
<p className="font-sans">Tiếng Việt được hỗ trợ đầy đủ</p>
```

### Text Spacing

Vietnamese text benefits from slightly increased line height:

```tsx
// For Vietnamese body text
<p className="leading-relaxed">Nội dung tiếng Việt dài với nhiều dấu thanh điệu</p>
```

### Internationalization

Beqeek uses Paraglide.js for i18n with Vietnamese (vi) as default:

```tsx
import { languageTag } from '@/paraglide/runtime';
import * as m from '@/paraglide/messages';

// Current language
const lang = languageTag(); // 'vi' or 'en'

// Translated message
const message = m.welcome(); // Auto-selects based on current language
```

---

## Component Checklist

Before submitting a new component, verify:

- [ ] Uses design tokens (no hardcoded colors/spacing)
- [ ] Supports dark mode (via CSS custom properties)
- [ ] Mobile-first responsive design
- [ ] Full TypeScript types with JSDoc comments
- [ ] ARIA attributes for accessibility
- [ ] Keyboard navigation support
- [ ] Focus indicators visible
- [ ] Tested with screen reader
- [ ] Vietnamese character support (if text-based)
- [ ] Documented in design system
- [ ] Uses `cn()` for conditional classes
- [ ] Follows naming conventions (PascalCase for components)

---

## Resources

### Internal Documentation

- **Project README**: `/README.md`
- **CLAUDE.md**: `/CLAUDE.md` (development guidelines)
- **Architecture**: `/docs/architecture.md`
- **API Docs**: `/docs/swagger.yaml`

### External Resources

- **TailwindCSS v4**: https://tailwindcss.com/
- **shadcn/ui**: https://ui.shadcn.com/
- **Radix UI**: https://www.radix-ui.com/
- **WCAG 2.1**: https://www.w3.org/WAI/WCAG21/quickref/
- **CVA**: https://cva.style/docs

---

**Questions or feedback?** Open an issue in the project repository.
