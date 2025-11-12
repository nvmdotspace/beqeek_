# Atlassian Design System Color Foundations - Research Report

**Date:** 2025-11-12
**Target:** React + TailwindCSS v4 + shadcn/ui implementation

## 1. Token Structure & Naming

### Hierarchical Pattern

`--ds-[category]-[semantic]-[emphasis]-[state]`

**Categories:**

- `text` - Text and labels
- `icon` - Icon fills
- `background` - Backgrounds and surfaces
- `border` - Borders and dividers
- `surface` - Elevation layers

**Example tokens:**

```css
--ds-text-brand                    /* Brand text */
--ds-background-accent-blue-subtle /* Blue accent background */
--ds-border-danger                 /* Danger border */
--ds-icon-warning                  /* Warning icon */
```

## 2. Semantic Color Roles

### Core Semantics

- **Neutral** - Base interface (backgrounds, text, borders)
- **Brand** - Primary identity (Atlassian blue)
- **Accent** - Differentiation (10 colors: lime, red, orange, yellow, green, teal, blue, purple, magenta, gray)
- **Status** - Communication states:
  - `success` - Positive outcomes
  - `warning` - Caution needed
  - `danger` - Errors/destructive actions
  - `information` - Informational content
  - `discovery` - New features/guidance

### Token Categories by Purpose

**Text Tokens:**

```css
--ds-text                    /* Default text */
--ds-text-subtle             /* Secondary text */
--ds-text-subtlest           /* Tertiary text */
--ds-text-brand              /* Brand text */
--ds-text-danger             /* Error text */
--ds-text-warning            /* Warning text */
--ds-text-success            /* Success text */
--ds-text-discovery          /* Discovery text */
--ds-text-information        /* Info text */
```

**Background Tokens:**

```css
--ds-background-neutral              /* Neutral background */
--ds-background-brand-bold           /* Brand background */
--ds-background-accent-[color]-[emphasis]  /* Accent backgrounds */
--ds-background-danger               /* Danger background */
--ds-background-warning              /* Warning background */
--ds-background-success              /* Success background */
```

**Border Tokens:**

```css
--ds-border                  /* Default border */
--ds-border-bold             /* Emphasized border */
--ds-border-brand            /* Brand border */
--ds-border-selected         /* Selected state */
--ds-border-focused          /* Focus indicator */
--ds-border-danger           /* Error border */
```

**Surface Tokens:**

```css
--ds-surface                 /* Base surface */
--ds-surface-overlay         /* Overlay surface */
--ds-surface-raised          /* Elevated surface */
--ds-surface-hovered         /* Hover state */
--ds-surface-pressed         /* Pressed state */
```

## 3. Color Scales & Values

### Emphasis Levels

Each accent color includes 4-5 emphasis variants (controls contrast):

- **Subtlest** - Minimal contrast (backgrounds)
- **Subtler** - Low contrast (secondary backgrounds)
- **Subtle** - Medium contrast (default backgrounds)
- **Bolder** - High contrast (text, icons, borders)
- **Boldest** - Maximum contrast (optional)

### Light Mode Values (Sample)

**Neutral:**

```css
--ds-text: #292a2e --ds-surface: #ffffff --ds-background-neutral: #0515240f;
```

**Brand (Blue):**

```css
--ds-text-brand: #1868db --ds-background-brand-bold: #1868db;
```

**Accent Colors:**

```css
/* Lime */
--ds-background-accent-lime-subtlest: #efffd6 --ds-background-accent-lime-bolder: #5b7f24 /* Red */
  --ds-background-accent-red-subtlest: #ffeceb --ds-background-accent-red-bolder: #c9372c /* Orange */
  --ds-background-accent-orange-subtlest: #fff5db --ds-background-accent-orange-bolder: #bd5b00 /* Yellow */
  --ds-background-accent-yellow-subtlest: #fef7c8 --ds-background-accent-yellow-bolder: #946f00 /* Green */
  --ds-background-accent-green-subtlest: #dcfff1 --ds-background-accent-green-bolder: #1f845a /* Teal */
  --ds-background-accent-teal-subtlest: #e7f9ff --ds-background-accent-teal-bolder: #227d9b /* Purple */
  --ds-background-accent-purple-subtlest: #f8eefe --ds-background-accent-purple-bolder: #964ac0 /* Magenta */
  --ds-background-accent-magenta-subtlest: #ffecf8 --ds-background-accent-magenta-bolder: #ae4787;
```

**Status Colors:**

```css
/* Success */
--ds-text-success: #4c6b1f --ds-background-success: #efffd6 /* Warning */ --ds-text-warning: #9e4c00
  --ds-background-warning: #fff5db /* Danger */ --ds-text-danger: #ae2e24 --ds-background-danger: #ffeceb
  /* Information */ --ds-text-information: #1558bc --ds-background-information: #e9f2fe;
```

### Dark Mode Values (Sample)

```css
--ds-text: #cecfd2 --ds-surface: #1f1f21 --ds-background-neutral: #ceced912 --ds-text-brand: #669df1
  --ds-background-brand-bold: #669df1;
```

## 4. Light & Dark Mode Implementation

### Theme Switching

Uses `data-color-mode` attribute:

```html
<html data-color-mode="light">
  <!-- Light theme -->
  <html data-color-mode="dark">
    <!-- Dark theme -->
  </html>
</html>
```

### Token Inversion

Dark mode inverts color relationships while maintaining:

- Semantic meaning unchanged
- Contrast ratios preserved
- Interaction states consistent

**Pattern:** Light backgrounds become dark; dark text becomes light. Status colors adjust intensity but keep hue identity.

## 5. Accessibility Requirements

### Contrast Standards

System maintains WCAG compliance through:

- **Text contrast:** Minimum 4.5:1 for normal text, 3:1 for large text
- **UI contrast:** Minimum 3:1 for interactive elements
- **Calibrated pairs:** Each token tested for sufficient contrast in both themes
- **Focus indicators:** High-contrast borders (e.g., `--ds-border-focused`)

### Accessible Patterns

- Use `bolder` variants for text on colored backgrounds
- Pair `subtlest`/`subtle` backgrounds with default text
- Status colors include high-contrast text tokens
- Border tokens provide clear boundaries

## 6. Component Usage Guidelines

### Input Components

```css
/* Base input */
background: var(--ds-background-input);
border: 1px solid var(--ds-border);
color: var(--ds-text);

/* Focus state */
border-color: var(--ds-border-focused);
outline: none;

/* Error state */
border-color: var(--ds-border-danger);
```

### Buttons

```css
/* Primary */
background: var(--ds-background-brand-bold);
color: var(--ds-text-inverse);

/* Hover */
background: var(--ds-background-brand-bold-hovered);

/* Danger */
background: var(--ds-background-danger-bold);
```

### Cards & Surfaces

```css
/* Base card */
background: var(--ds-surface);
border: 1px solid var(--ds-border);

/* Elevated card */
background: var(--ds-surface-raised);

/* Hover state */
background: var(--ds-surface-hovered);
```

### Badges & Tags

```css
/* Success badge */
background: var(--ds-background-success);
color: var(--ds-text-success);

/* Warning badge */
background: var(--ds-background-warning);
color: var(--ds-text-warning);
```

## 7. Implementation for TailwindCSS v4 + shadcn/ui

### Recommended Token Mapping

**Base Tokens (globals.css):**

```css
@layer base {
  :root {
    --background: 0 0% 100%; /* Map to --ds-surface */
    --foreground: 0 0% 16%; /* Map to --ds-text */
    --card: 0 0% 100%; /* Map to --ds-surface-raised */
    --card-foreground: 0 0% 16%;
    --popover: 0 0% 100%;
    --popover-foreground: 0 0% 16%;
    --primary: 215 84% 48%; /* Map to --ds-background-brand-bold */
    --primary-foreground: 0 0% 100%;
    --secondary: 0 0% 96%;
    --secondary-foreground: 0 0% 16%;
    --muted: 0 0% 96%;
    --muted-foreground: 0 0% 40%; /* Map to --ds-text-subtle */
    --accent: 0 0% 96%;
    --accent-foreground: 0 0% 16%;
    --destructive: 0 71% 51%; /* Map to --ds-background-danger-bold */
    --destructive-foreground: 0 0% 100%;
    --border: 0 0% 90%; /* Map to --ds-border */
    --input: 0 0% 90%; /* Map to --ds-border */
    --ring: 215 84% 48%; /* Map to --ds-border-focused */
  }

  .dark {
    --background: 0 0% 12%; /* Map to --ds-surface */
    --foreground: 0 0% 81%; /* Map to --ds-text */
    --card: 0 0% 12%;
    --card-foreground: 0 0% 81%;
    --popover: 0 0% 12%;
    --popover-foreground: 0 0% 81%;
    --primary: 215 78% 68%; /* Map to --ds-background-brand-bold (dark) */
    --primary-foreground: 0 0% 100%;
    --secondary: 0 0% 15%;
    --secondary-foreground: 0 0% 81%;
    --muted: 0 0% 15%;
    --muted-foreground: 0 0% 60%;
    --accent: 0 0% 15%;
    --accent-foreground: 0 0% 81%;
    --destructive: 0 71% 51%;
    --destructive-foreground: 0 0% 100%;
    --border: 0 0% 25%;
    --input: 0 0% 25%;
    --ring: 215 78% 68%;
  }
}
```

### Extended Accent Colors (Optional)

```css
:root {
  --accent-lime-subtle: 75 100% 91%;
  --accent-lime-bolder: 75 54% 32%;
  --accent-green-subtle: 162 100% 93%;
  --accent-green-bolder: 162 63% 32%;
  --accent-teal-subtle: 195 100% 95%;
  --accent-teal-bolder: 195 63% 37%;
  --accent-purple-subtle: 281 83% 97%;
  --accent-purple-bolder: 281 44% 51%;
  --accent-orange-subtle: 41 100% 93%;
  --accent-orange-bolder: 30 100% 37%;
  --accent-yellow-subtle: 52 97% 89%;
  --accent-yellow-bolder: 45 100% 29%;
  --accent-magenta-subtle: 320 100% 96%;
  --accent-magenta-bolder: 325 41% 48%;
}
```

## Unresolved Questions

1. Complete hex value reference for all 100+ tokens unavailable in public docs
2. Official Tailwind preset or CSS variable export from Atlassian not found
3. Specific contrast ratio testing results per token pair not documented
4. Migration path from legacy palette to new token system lacks detail
5. Chart/data visualization color scale ranges not fully specified
