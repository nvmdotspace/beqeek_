# Task Management Template - Design System Style Guide

## Overview

The Task Management template is a comprehensive, production-ready dashboard built with modern web technologies. It features a clean, professional design with full dark mode support, responsive layouts, and a cohesive design system based on Tailwind CSS 4 and Radix UI primitives.

### Technology Stack

- **Framework**: Next.js 16.0.1 with React 19.2
- **Styling**: Tailwind CSS 4 with PostCSS
- **UI Components**: Radix UI primitives (shadcn/ui approach)
- **Icons**: Lucide React
- **State Management**: Zustand 5.0.8
- **Theming**: next-themes with dark mode support
- **Animations**: tw-animate-css

---

## Color Palette

The design system uses OKLCH color space for consistent, perceptually uniform colors across both light and dark themes.

### Light Theme Colors

#### Primary Colors

```css
--background: oklch(1 0 0) /* Pure white */ --foreground: oklch(0.145 0 0) /* Near black */ --primary: oklch(0.205 0 0)
  /* Dark gray/black */ --primary-foreground: oklch(0.985 0 0) /* Off-white */;
```

#### Secondary & Accent Colors

```css
--secondary: oklch(0.97 0 0) /* Very light gray */ --secondary-foreground: oklch(0.205 0 0) /* Dark gray */
  --muted: oklch(0.97 0 0) /* Very light gray */ --muted-foreground: oklch(0.556 0 0) /* Medium gray */
  --accent: oklch(0.97 0 0) /* Very light gray */ --accent-foreground: oklch(0.205 0 0) /* Dark gray */;
```

#### Semantic Colors

```css
--destructive: oklch(0.577 0.245 27.325) /* Red for errors/destructive actions */ --border: oklch(0.922 0 0)
  /* Light border gray */ --input: oklch(0.922 0 0) /* Input border color */ --ring: oklch(0.708 0 0)
  /* Focus ring color */;
```

#### Card & Popover Colors

```css
--card: oklch(1 0 0) /* White card background */ --card-foreground: oklch(0.145 0 0) /* Dark text */
  --popover: oklch(1 0 0) /* White popover background */ --popover-foreground: oklch(0.145 0 0) /* Dark text */;
```

#### Chart Colors

```css
--chart-1: oklch(0.646 0.222 41.116) /* Orange */ --chart-2: oklch(0.6 0.118 184.704) /* Blue */
  --chart-3: oklch(0.398 0.07 227.392) /* Dark blue */ --chart-4: oklch(0.828 0.189 84.429) /* Yellow */
  --chart-5: oklch(0.769 0.188 70.08) /* Lime */;
```

#### Sidebar Colors

```css
--sidebar: oklch(0.985 0 0) /* Off-white */ --sidebar-foreground: oklch(0.145 0 0) /* Dark text */
  --sidebar-primary: oklch(0.205 0 0) /* Dark */ --sidebar-primary-foreground: oklch(0.985 0 0) /* Off-white */
  --sidebar-accent: oklch(0.97 0 0) /* Light gray */ --sidebar-accent-foreground: oklch(0.205 0 0) /* Dark */
  --sidebar-border: oklch(0.922 0 0) /* Light border */ --sidebar-ring: oklch(0.708 0 0) /* Focus ring */;
```

### Dark Theme Colors

#### Primary Colors

```css
--background: oklch(0.145 0 0) /* Near black */ --foreground: oklch(0.985 0 0) /* Off-white */
  --primary: oklch(0.922 0 0) /* Light gray */ --primary-foreground: oklch(0.205 0 0) /* Dark gray */;
```

#### Secondary & Accent Colors

```css
--secondary: oklch(0.269 0 0) /* Dark gray */ --secondary-foreground: oklch(0.985 0 0) /* Off-white */
  --muted: oklch(0.269 0 0) /* Dark gray */ --muted-foreground: oklch(0.708 0 0) /* Medium gray */
  --accent: oklch(0.269 0 0) /* Dark gray */ --accent-foreground: oklch(0.985 0 0) /* Off-white */;
```

#### Semantic Colors

```css
--destructive: oklch(0.704 0.191 22.216) /* Lighter red for dark mode */ --border: oklch(1 0 0 / 10%)
  /* Semi-transparent white border */ --input: oklch(1 0 0 / 15%) /* Semi-transparent white input */
  --ring: oklch(0.556 0 0) /* Medium gray focus ring */;
```

#### Card & Popover Colors

```css
--card: oklch(0.205 0 0) /* Dark gray card */ --card-foreground: oklch(0.985 0 0) /* Off-white text */
  --popover: oklch(0.205 0 0) /* Dark gray popover */ --popover-foreground: oklch(0.985 0 0) /* Off-white text */;
```

#### Chart Colors (Dark Mode)

```css
--chart-1: oklch(0.488 0.243 264.376) /* Purple */ --chart-2: oklch(0.696 0.17 162.48) /* Cyan */
  --chart-3: oklch(0.769 0.188 70.08) /* Lime */ --chart-4: oklch(0.627 0.265 303.9) /* Magenta */
  --chart-5: oklch(0.645 0.246 16.439) /* Orange */;
```

#### Sidebar Colors (Dark Mode)

```css
--sidebar: oklch(0.205 0 0) /* Dark gray */ --sidebar-foreground: oklch(0.985 0 0) /* Off-white */
  --sidebar-primary: oklch(0.488 0.243 264.376) /* Purple */ --sidebar-primary-foreground: oklch(0.985 0 0)
  /* Off-white */ --sidebar-accent: oklch(0.269 0 0) /* Darker gray */ --sidebar-accent-foreground: oklch(0.985 0 0)
  /* Off-white */ --sidebar-border: oklch(1 0 0 / 10%) /* Semi-transparent white */ --sidebar-ring: oklch(0.556 0 0)
  /* Medium gray */;
```

### Status Colors

Task status colors with custom icons:

```typescript
Backlog: #53565A (Gray)
Todo: #53565A (Gray)
In Progress: #facc15 (Yellow 400)
Technical Review: #22c55e (Green 500)
Paused: #0ea5e9 (Cyan 500)
Completed: #8b5cf6 (Violet 500)
```

### Label Colors

Label badges use semantic colors with opacity variants:

```typescript
Design: bg-cyan-100 text-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-400
Marketing: bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400
Product: bg-pink-100 text-pink-700 dark:bg-pink-950/50 dark:text-pink-400
New Releases: bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-400
New Features: bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-400
```

### Priority Colors

Priority indicators use specific colors:

```typescript
Urgent: text-pink-500 (Stars icon)
High: text-red-500 (InfoIcon)
Medium: text-cyan-500 (Hexagon)
Low: No visual indicator
Completed: text-green-500 (CheckCircle)
```

### Utility Colors

```typescript
Progress bar: #10b981 (Emerald 500)
Progress trail: #EDEDED (Light gray)
Notification badge: bg-red-500 text-white
Border dashed: border-dashed
```

---

## Typography

### Font Families

The design system uses Google Fonts' Geist family:

```typescript
Primary Font: Geist (--font-geist-sans)
- Variable font with extensive weight range
- Used for UI, headings, body text
- Applied via: font-sans class

Monospace Font: Geist Mono (--font-geist-mono)
- Used for code, technical content
- Applied via: font-mono class
```

### Font Sizes

Tailwind CSS text size scale:

```css
text-[10px]    /* 10px - Used in small badges, metadata */
text-xs        /* 12px (0.75rem) - Small text, labels */
text-sm        /* 14px (0.875rem) - Body text, buttons */
text-base      /* 16px (1rem) - Default body text */
text-lg        /* 18px (1.125rem) - Large headings */
text-xl        /* 20px (1.25rem) - Section headers */
```

### Font Weights

```css
font-normal    /* 400 - Regular body text */
font-medium    /* 500 - Emphasized text, active items */
font-semibold  /* 600 - Headings, titles */
```

### Font Usage Patterns

#### Headings

```typescript
Page Title: text-base lg:text-lg font-semibold
Card Title: text-sm font-medium leading-tight
Section Title: text-xs font-medium
```

#### Body Text

```typescript
Description: text-xs text-muted-foreground
Sidebar Items: text-sm
Input Placeholder: text-xs lg:text-sm
```

#### Metadata & Labels

```typescript
Badge Text: text-[10px] px-1.5 py-0.5 font-medium
Badge (standard): text-xs font-medium
Date Labels: text-xs text-muted-foreground
Avatar Fallback: text-[10px]
```

### Line Heights

```css
leading-none   /* 1 - Compact headings */
leading-tight  /* 1.25 - Card titles, tight layouts */
leading-normal /* Default - Body text (not explicitly set) */
```

### Text Utilities

```css
antialiased           /* Smooth font rendering */
line-clamp-2          /* Truncate to 2 lines */
whitespace-nowrap     /* Prevent text wrapping */
truncate              /* Ellipsis overflow */
underline-offset-4    /* Link underlines */
```

---

## Spacing System

### Base Radius Scale

```css
--radius: 0.625rem (10px) --radius-sm: calc(var(--radius) - 4px) /* 6px */ --radius-md: calc(var(--radius) - 2px)
  /* 8px */ --radius-lg: var(--radius) /* 10px */ --radius-xl: calc(var(--radius) + 4px) /* 14px */;
```

### Tailwind Spacing Scale (Commonly Used)

```css
0.5  → 2px     /* 0.125rem */
1    → 4px     /* 0.25rem */
1.5  → 6px     /* 0.375rem */
2    → 8px     /* 0.5rem */
2.5  → 10px    /* 0.625rem */
3    → 12px    /* 0.75rem */
4    → 16px    /* 1rem */
5    → 20px    /* 1.25rem */
6    → 24px    /* 1.5rem */
8    → 32px    /* 2rem */
9    → 36px    /* 2.25rem */
10   → 40px    /* 2.5rem */
```

### Padding Patterns

#### Cards & Containers

```typescript
Card: py-6 gap-6
Card Header: px-6
Card Content: px-6
Card with border: px-3 py-2.5
Task Card Main: px-3 py-2.5
Task Card Footer: px-3 py-2.5
```

#### Buttons

```typescript
Default Button: h-9 px-4 py-2
Small Button: h-8 px-3 gap-1.5
Large Button: h-10 px-6
Icon Button: size-9
Icon Small: size-8
Icon Large: size-10
```

#### Inputs

```typescript
Input: h-9 px-3 py-1
Search Input: h-8 pl-8 pr-10 (with icons)
```

#### Badges

```typescript
Badge: px-2 py-0.5 (rounded-full)
Small Badge: px-1.5 py-0.5 text-[10px]
```

#### Layout Spacing

```typescript
Sidebar: p-4
Header: px-3 lg:px-6 py-3
Section Gap: space-y-0.5, space-y-6
Grid Gap: gap-1.5, gap-2, gap-3, gap-4
```

### Margin Patterns

```typescript
Bottom Margins: mb-2, mb-3, mb-6
Top Margins: mt-0.5, mt-4
Right Margins: mr-2, ml-2, ml-auto
Negative Space (Avatars): -space-x-2
```

### Gap Patterns

```typescript
Flex Gap: gap-1, gap-1.5, gap-2, gap-3, gap-4
Flex Column: flex-col gap-6, flex-col gap-1.5
Flex Wrap: flex-wrap gap-2
```

---

## Component Styles

### Button Component

#### Variants

**Default Button**

```typescript
Style: bg-[#242424] text-white hover:bg-[#242424]/90
Shadow: inset 0 -4px 1px -1px rgba(0,0,0,0.14), 0 4px 6px 0 rgba(0,0,0,0.14)
Transition: transition-all
```

**Destructive Button**

```typescript
Style: bg-destructive text-white hover:bg-destructive/90
Dark mode: dark:bg-destructive/60
Focus: focus-visible:ring-destructive/20
```

**Outline Button**

```typescript
Style: border bg-background shadow-xs hover:bg-accent
Dark mode: dark:bg-input/30 dark:border-input dark:hover:bg-input/50
```

**Secondary Button**

```typescript
Style: bg-secondary text-secondary-foreground hover:bg-secondary/80
```

**Ghost Button**

```typescript
Style: hover:bg-accent hover:text-accent-foreground
Dark mode: dark:hover:bg-accent/50
```

**Link Button**

```typescript
Style: text-primary underline-offset-4 hover:underline
```

#### Sizes

```typescript
default: h-9 px-4 py-2 has-[>svg]:px-3
sm: h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5
lg: h-10 rounded-md px-6 has-[>svg]:px-4
icon: size-9
icon-sm: size-8
icon-lg: size-10
```

#### Common Utilities

```typescript
Base: inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium
Disabled: disabled:pointer-events-none disabled:opacity-50
Focus: focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]
SVG: [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0
```

### Badge Component

#### Variants

**Default Badge**

```typescript
Style: border-transparent bg-primary text-primary-foreground
Hover: [a&]:hover:bg-primary/90
```

**Secondary Badge**

```typescript
Style: border-transparent bg-secondary text-secondary-foreground
Hover: [a&]:hover:bg-secondary/90
```

**Destructive Badge**

```typescript
Style: border-transparent bg-destructive text-white
Hover: [a&]:hover:bg-destructive/90
Dark mode: dark:bg-destructive/60
```

**Outline Badge**

```typescript
Style: text-foreground
Hover: [a&]:hover:bg-accent [a&]:hover:text-accent-foreground
```

#### Base Styles

```typescript
Base: inline-flex items-center justify-center rounded-full border px-2 py-0.5 text-xs font-medium
Utilities: w-fit whitespace-nowrap shrink-0 gap-1 overflow-hidden
SVG: [&>svg]:size-3 [&>svg]:pointer-events-none
Focus: focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]
Transition: transition-[color,box-shadow]
```

### Card Component

```typescript
Card: bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm
Card Header: flex flex-col gap-1.5 px-6
Card Title: leading-none font-semibold
Card Description: text-muted-foreground text-sm
Card Content: px-6
Card Footer: flex items-center px-6
```

### Input Component

```typescript
Base: h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs
Dark mode: dark:bg-input/30 border-input
Placeholder: placeholder:text-muted-foreground
Selection: selection:bg-primary selection:text-primary-foreground
Focus: focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]
Invalid: aria-invalid:ring-destructive/20 aria-invalid:border-destructive
Disabled: disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50
File input: file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium
Responsive: text-base md:text-sm
```

### Avatar Component

```typescript
Avatar Root: relative flex size-8 shrink-0 overflow-hidden rounded-full
Avatar Image: aspect-square size-full
Avatar Fallback: bg-muted flex size-full items-center justify-center rounded-full
```

### Task Card Component

#### Structure

```typescript
Container: bg-background shrink-0 rounded-lg overflow-hidden border border-border

Header Section:
- Padding: px-3 py-2.5
- Status Icon: size-5 bg-muted rounded-sm p-1
- Title: text-sm font-medium leading-tight
- Priority Icons: size-4 shrink-0
- Description: text-xs text-muted-foreground mb-3 line-clamp-2

Footer Section:
- Border: border-t border-border border-dashed
- Padding: px-3 py-2.5
- Metadata Items: border border-border rounded-sm py-1 px-2
- Icons: size-3
- Avatars: size-5 border-2 border-background -space-x-2
```

### Sidebar Component

```typescript
Sidebar Item:
- Base: w-full justify-between px-3 py-2 h-auto text-sm
- Active: bg-muted text-foreground font-medium
- Inactive: text-muted-foreground hover:bg-muted/50 hover:text-foreground

Sidebar Section:
- Title: text-xs h-auto py-0 text-muted-foreground
- Gap: mb-2, space-y-0.5

Sidebar Header: pb-0, px-4 pt-4
Sidebar Content: p-4
Sidebar Footer: p-4 space-y-0.5
```

### Popover Component

```typescript
Content: bg-popover text-popover-foreground z-50 w-72 rounded-md border p-4 shadow-md
Animations:
  - Open: data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95
  - Close: data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95
  - Slide: data-[side=bottom]:slide-in-from-top-2 (and variants)
Offset: sideOffset = 4
```

### Separator Component

```typescript
Base: bg-border shrink-0
Horizontal: data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full
Vertical: data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px
```

### Skeleton Component

```typescript
Style: bg-accent animate-pulse rounded-md
```

---

## Shadows & Elevation

### Shadow Scale

```typescript
shadow - xs; /* Small, subtle shadow for inputs */
shadow - sm; /* Small shadow for cards */
shadow - md; /* Medium shadow for popovers, dropdowns */
shadow; /* Default Tailwind shadow */
```

### Custom Box Shadows

**Button (Default Variant)**

```css
box-shadow:
  inset 0 -4px 1px -1px rgba(0, 0, 0, 0.14),
  /* Inner shadow for depth */ 0 4px 6px 0 rgba(0, 0, 0, 0.14); /* Outer shadow for elevation */
```

### Component Elevation Hierarchy

```typescript
Level 0 (Base): No shadow - Background elements
Level 1 (Cards): shadow-sm - Task cards, containers
Level 2 (Raised): shadow-xs - Inputs, buttons (outline)
Level 3 (Floating): shadow-md - Popovers, dropdowns, tooltips
Level 4 (Modal): Higher z-index with backdrop
```

### Z-Index Scale

```typescript
z - 50; /* Popovers, dropdowns, tooltips */
z - 40; /* Modals, dialogs */
z - 30; /* Overlays */
z - 20; /* Fixed headers */
z - 10; /* Sticky elements */
```

---

## Animations & Transitions

### Transition Properties

```typescript
transition - all; /* All properties - buttons, badges */
transition - [color, box - shadow]; /* Specific properties - badges */
transition - colors; /* Color changes only */
```

### Animation Classes (tw-animate-css)

#### Entrance Animations

```css
animate-in              /* Base entrance animation */
fade-in-0              /* Fade in from 0 opacity */
zoom-in-95             /* Zoom in from 95% scale */
slide-in-from-top-2    /* Slide from top */
slide-in-from-bottom-2 /* Slide from bottom */
slide-in-from-left-2   /* Slide from left */
slide-in-from-right-2  /* Slide from right */
```

#### Exit Animations

```css
animate-out            /* Base exit animation */
fade-out-0            /* Fade out to 0 opacity */
zoom-out-95           /* Zoom out to 95% scale */
```

#### Loading Animations

```css
animate-pulse         /* Skeleton loading states */
```

### Component-Specific Animations

**Popover**

```typescript
Open State:
  data-[state=open]:animate-in
  data-[state=open]:fade-in-0
  data-[state=open]:zoom-in-95

Close State:
  data-[state=closed]:animate-out
  data-[state=closed]:fade-out-0
  data-[state=closed]:zoom-out-95

Directional:
  data-[side=bottom]:slide-in-from-top-2
  data-[side=left]:slide-in-from-right-2
  data-[side=right]:slide-in-from-left-2
  data-[side=top]:slide-in-from-bottom-2
```

**Skeleton**

```typescript
animate - pulse; /* Continuous pulsing for loading states */
```

### Hover Effects

```typescript
hover: bg - accent; /* Background color change */
hover: bg - secondary / 80; /* Background with opacity */
hover: text - accent - foreground; /* Text color change */
hover: underline; /* Text decoration */
dark: hover: bg - accent / 50; /* Dark mode hover variants */
```

### Focus Effects

```typescript
focus-visible:border-ring                  /* Border color on focus */
focus-visible:ring-ring/50                 /* Focus ring with 50% opacity */
focus-visible:ring-[3px]                   /* 3px ring width */
focus-visible:ring-destructive/20          /* Error state ring */
```

---

## Border Radius

### Border Radius Scale

```typescript
rounded - sm; /* 6px - Small elements, icons */
rounded - md; /* 8px - Inputs, buttons (small/large) */
rounded - lg; /* 10px - Task cards, default containers */
rounded - xl; /* 14px - Large cards, major containers */
rounded - full; /* 9999px - Badges, avatars, pills */
```

### Component Usage

```typescript
Task Card: rounded-lg
Card Component: rounded-xl
Button: rounded-md
Badge: rounded-full
Avatar: rounded-full
Input: rounded-md
Status Icon Container: rounded-sm
Metadata Items: rounded-sm
Popover: rounded-md
```

### Corner Rounding Utilities

```typescript
rounded-t-*     /* Top corners only */
rounded-b-*     /* Bottom corners only */
rounded-l-*     /* Left corners only */
rounded-r-*     /* Right corners only */
rounded-tl-*    /* Top-left corner */
rounded-tr-*    /* Top-right corner */
rounded-bl-*    /* Bottom-left corner */
rounded-br-*    /* Bottom-right corner */
```

---

## Opacity & Transparency

### Opacity Scale

```typescript
opacity - 0; /* 0% - Hidden elements */
opacity - 50; /* 50% - Disabled states */
opacity - 100; /* 100% - Default visible */
```

### Color with Opacity

#### Using Color Channels

```typescript
bg - destructive / 60; /* Destructive color at 60% */
bg - secondary / 80; /* Secondary color at 80% */
bg - secondary / 90; /* Secondary color at 90% */
ring - ring / 50; /* Ring color at 50% */
ring - destructive / 20; /* Destructive ring at 20% */
ring - destructive / 40; /* Destructive ring at 40% (dark) */
hover: bg - accent / 50; /* Accent hover at 50% */
```

#### CSS Custom Properties with Opacity

```css
oklch(1 0 0 / 10%)      /* White at 10% - borders in dark mode */
oklch(1 0 0 / 15%)      /* White at 15% - inputs in dark mode */
```

### Component Opacity Patterns

```typescript
Disabled State: opacity-50
Dark Mode Borders: oklch(1 0 0 / 10%)
Dark Mode Inputs: oklch(1 0 0 / 15%)
Dark Mode Destructive: bg-destructive/60
Hover States: /80, /90
Focus Rings: /20, /40, /50
Label Backgrounds (Dark): bg-cyan-950/50
```

### Transparency Usage

```typescript
Background transparency: bg-transparent
Input backgrounds: bg-transparent (with border)
File input: file:bg-transparent
Outline hidden: outline-hidden
Border transparent: border-transparent
```

---

## Common Tailwind CSS Usage in the Project

### Layout Utilities

```typescript
/* Flexbox */
flex, inline-flex
flex-col, flex-row
items-center, items-start, items-end
justify-center, justify-between, justify-start, justify-end
gap-1, gap-2, gap-3, gap-4, gap-6
flex-1 (flex-grow)
flex-wrap
shrink-0

/* Grid */
grid
grid-cols-*

/* Positioning */
relative, absolute, fixed
top-*, left-*, right-*, bottom-*
z-10, z-50

/* Display */
hidden
block
inline-flex
overflow-hidden
overflow-x-auto
```

### Sizing Utilities

```typescript
/* Width */
w-full, w-fit, w-auto
w-56, w-72
min-w-0
max-w-*

/* Height */
h-auto, h-full
h-8, h-9, h-10
min-h-*
max-h-*

/* Size (width + height) */
size-3, size-3.5, size-4, size-5, size-6, size-8, size-9, size-10

/* Aspect Ratio */
aspect-square
```

### Spacing Utilities

```typescript
/* Padding */
p-0, p-1, p-2, p-3, p-4, p-6
px-*, py-*
pt-*, pb-*, pl-*, pr-*

/* Margin */
m-0, m-auto
mx-*, my-*
mt-*, mb-*, ml-*, mr-*
-space-x-2 (negative space for overlapping)

/* Space Between */
space-y-0.5, space-y-6
space-x-*
```

### Typography Utilities

```typescript
/* Font Size */
text-[10px], text-xs, text-sm, text-base, text-lg

/* Font Weight */
font-normal, font-medium, font-semibold

/* Line Height */
leading-none, leading-tight

/* Text Alignment */
text-left, text-center, text-right

/* Text Color */
text-foreground, text-muted-foreground
text-primary, text-secondary
text-white, text-pink-500, text-red-500, etc.

/* Text Transform */
uppercase, lowercase, capitalize

/* Text Decoration */
underline, underline-offset-4

/* Text Overflow */
truncate, line-clamp-2
whitespace-nowrap
```

### Border Utilities

```typescript
/* Border Width */
(border, border - 0);
(border - t, border - b, border - l, border - r);
border - 2;

/* Border Style */
border - solid;
border - dashed;

/* Border Color */
border - border;
border - input;
border - transparent;
border - ring;
border - background;
border - destructive;

/* Outline */
outline - none;
outline - ring / 50;
outline - hidden;
```

### Background Utilities

```typescript
/* Background Color */
bg-background, bg-foreground
bg-card, bg-popover
bg-primary, bg-secondary
bg-muted, bg-accent
bg-destructive
bg-transparent

/* Background with Variants */
bg-cyan-100, bg-cyan-950/50
bg-green-100, bg-pink-100, etc.

/* Gradient (Note: Custom utility) */
bg-linear-to-br from-purple-500 to-pink-600
```

### Dark Mode Utilities

```typescript
/* Color Variants */
dark:bg-*, dark:text-*
dark:border-*, dark:hover:*

/* Specific Dark Mode Patterns */
dark:bg-input/30
dark:bg-destructive/60
dark:bg-cyan-950/50
dark:text-cyan-400
dark:hover:bg-accent/50
dark:aria-invalid:ring-destructive/40
```

### State Utilities

```typescript
/* Hover */
hover:bg-*, hover:text-*
hover:underline
hover:bg-accent/50

/* Focus */
focus-visible:border-ring
focus-visible:ring-ring/50
focus-visible:ring-[3px]

/* Active */
active:*

/* Disabled */
disabled:pointer-events-none
disabled:cursor-not-allowed
disabled:opacity-50

/* Aria States */
aria-invalid:border-destructive
aria-invalid:ring-destructive/20

/* Data Attributes */
data-[state=open]:animate-in
data-[state=closed]:animate-out
data-[orientation=horizontal]:h-px
data-[side=bottom]:slide-in-from-top-2
```

### Interaction Utilities

```typescript
/* Cursor */
cursor - pointer;
cursor - not - allowed;

/* Pointer Events */
pointer - events - none;

/* User Select */
select - none;
selection: bg - primary;
selection: text - primary - foreground;
```

### Responsive Utilities

```typescript
/* Breakpoints */
sm:*, md:*, lg:*, xl:*, 2xl:*

/* Common Responsive Patterns */
hidden lg:flex
text-base md:text-sm
px-3 lg:px-6
w-full lg:w-auto
```

### Custom Utilities & Modifiers

```typescript
/* Parent State Selectors */
[a&]:hover:bg-primary/90           /* Hover when parent is anchor */
has-[>svg]:px-3                    /* Has child SVG */
[&_svg]:pointer-events-none        /* All child SVGs */
[&_svg:not([class*='size-'])]:size-4  /* Conditional child styling */

/* Group/Peer */
group, group-hover:*
peer, peer-*

/* Custom Slots */
data-slot="button"
data-slot="card"
data-slot="input"
```

---

## Example Component Reference Design Code

### Complete Task Card Example

```tsx
<div className="bg-background shrink-0 rounded-lg overflow-hidden border border-border">
  {/* Main content */}
  <div className="px-3 py-2.5">
    {/* Title with status icon */}
    <div className="flex items-center gap-2 mb-2">
      <div className="size-5 mt-0.5 shrink-0 flex items-center justify-center bg-muted rounded-sm p-1">
        <StatusIcon />
      </div>
      <h3 className="text-sm font-medium leading-tight flex-1">Task Title</h3>
      <Stars className="size-4 shrink-0 text-pink-500" />
    </div>

    {/* Description */}
    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
      Task description goes here with automatic truncation after two lines.
    </p>

    {/* Labels */}
    <div className="flex flex-wrap gap-1.5">
      <Badge
        variant="secondary"
        className="text-[10px] px-1.5 py-0.5 font-medium bg-cyan-100 text-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-400"
      >
        Design
      </Badge>
    </div>
  </div>

  {/* Footer with metadata */}
  <div className="px-3 py-2.5 border-t border-border border-dashed">
    <div className="flex items-center justify-between flex-wrap gap-2">
      {/* Metadata items */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
        <div className="flex items-center gap-1.5 border border-border rounded-sm py-1 px-2">
          <Calendar className="size-3" />
          <span>Sep 7</span>
        </div>
        <div className="flex items-center gap-1.5 border border-border rounded-sm py-1 px-2">
          <MessageSquare className="size-3" />
          <span>5</span>
        </div>
      </div>

      {/* Avatars */}
      <div className="flex -space-x-2">
        <Avatar className="size-5 border-2 border-background">
          <AvatarImage src="avatar.png" />
          <AvatarFallback className="text-[10px]">AB</AvatarFallback>
        </Avatar>
      </div>
    </div>
  </div>
</div>
```

### Button Examples

```tsx
{
  /* Default Button */
}
<Button>
  <Plus className="size-4" />
  Add Task
</Button>;

{
  /* Outline Button */
}
<Button variant="outline" size="sm" className="gap-2">
  <Github className="size-4" />
  GitHub
</Button>;

{
  /* Ghost Button */
}
<Button variant="ghost" className="w-full justify-between px-3 py-2 h-auto text-sm">
  <div className="flex items-center gap-3">
    <Bell className="size-4" />
    <span>Notifications</span>
  </div>
  <div className="bg-red-500 text-white text-xs rounded-full size-5 flex items-center justify-center">12</div>
</Button>;

{
  /* Icon Button */
}
<Button variant="outline" size="icon">
  <Search className="size-4" />
</Button>;
```

### Input Examples

```tsx
{
  /* Standard Input */
}
<Input type="text" placeholder="Enter text" className="h-9" />;

{
  /* Search Input with Icons */
}
<div className="relative">
  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
  <Input type="search" placeholder="Search anything" className="pl-8 pr-10 text-xs h-8 bg-background" />
  <Kbd className="absolute right-2 top-1/2 -translate-y-1/2">/</Kbd>
</div>;
```

### Badge Examples

```tsx
{
  /* Secondary Badge with Custom Color */
}
<Badge
  variant="secondary"
  className="text-[10px] px-1.5 py-0.5 font-medium bg-pink-100 text-pink-700 dark:bg-pink-950/50 dark:text-pink-400"
>
  Product
</Badge>;

{
  /* Default Badge */
}
<Badge>New</Badge>;

{
  /* Destructive Badge */
}
<Badge variant="destructive">Error</Badge>;

{
  /* Outline Badge */
}
<Badge variant="outline">Draft</Badge>;
```

### Card Examples

```tsx
{
  /* Standard Card */
}
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description text</CardDescription>
  </CardHeader>
  <CardContent>Card content goes here</CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>;
```

### Popover Examples

```tsx
{
  /* Popover with Calendar */
}
<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline" size="sm" className="gap-2">
      <Calendar className="size-4" />
      Select date
    </Button>
  </PopoverTrigger>
  <PopoverContent className="w-auto p-0" align="end">
    <Calendar mode="single" />
  </PopoverContent>
</Popover>;
```

### Sidebar Item Example

```tsx
{
  /* Sidebar Navigation Item */
}
<Button
  variant="ghost"
  className="w-full justify-between px-3 py-2 h-auto text-sm bg-muted text-foreground font-medium"
>
  <div className="flex items-center gap-3">
    <Star className="size-4" />
    <span>Tasks</span>
  </div>
</Button>;

{
  /* Sidebar Item with Badge */
}
<Button
  variant="ghost"
  className="w-full justify-between px-3 py-2 h-auto text-sm text-muted-foreground hover:bg-muted/50 hover:text-foreground"
>
  <div className="flex items-center gap-3">
    <Bell className="size-4" />
    <span>Notifications</span>
  </div>
  <div className="bg-red-500 text-white text-xs rounded-full size-5 flex items-center justify-center">12</div>
</Button>;
```

### Avatar Group Example

```tsx
{
  /* Stacked Avatars */
}
<div className="flex -space-x-2">
  <Avatar className="size-5 border-2 border-background">
    <AvatarImage src="https://api.dicebear.com/9.x/glass/svg?seed=Alice" />
    <AvatarFallback className="text-[10px]">A</AvatarFallback>
  </Avatar>
  <Avatar className="size-5 border-2 border-background">
    <AvatarImage src="https://api.dicebear.com/9.x/glass/svg?seed=Bob" />
    <AvatarFallback className="text-[10px]">B</AvatarFallback>
  </Avatar>
  <Avatar className="size-5 border-2 border-background">
    <AvatarImage src="https://api.dicebear.com/9.x/glass/svg?seed=Charlie" />
    <AvatarFallback className="text-[10px]">C</AvatarFallback>
  </Avatar>
</div>;
```

### Dropdown Menu Example

```tsx
{
  /* Dropdown with Items */
}
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="ghost" className="flex items-center gap-3">
      <div className="size-6 bg-linear-to-br from-purple-500 to-pink-600 rounded-sm shadow flex items-center justify-center text-white text-xs font-semibold">
        SU
      </div>
      <span className="font-semibold">Square UI</span>
      <ChevronDown className="size-3 text-muted-foreground" />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent className="w-56" align="start">
    <DropdownMenuItem>
      <div className="flex items-center gap-3 w-full">
        <span>Item 1</span>
        <Check className="size-4 ml-auto" />
      </div>
    </DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem>
      <Plus className="size-4" />
      <span>Add new</span>
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>;
```

### Responsive Layout Example

```tsx
{
  /* Header with Responsive Elements */
}
<div className="border-b border-border bg-background">
  <div className="flex items-center justify-between px-3 lg:px-6 py-3">
    <div className="flex items-center gap-2">
      <SidebarTrigger />
      <h1 className="text-base lg:text-lg font-semibold">Task</h1>
    </div>

    <div className="flex items-center gap-2 lg:gap-4">
      <Button variant="outline" className="hidden lg:flex">
        Share
      </Button>
      <div className="hidden lg:flex items-center gap-2">{/* Desktop-only content */}</div>
    </div>
  </div>
</div>;
```

### Status Icon Example

```tsx
{
  /* Custom SVG Status Icon */
}
<svg width="14" height="14" viewBox="0 0 14 14" fill="none">
  <circle
    cx="7"
    cy="7"
    r="6"
    fill="none"
    stroke="#facc15"
    strokeWidth="2"
    strokeDasharray="3.14 0"
    strokeDashoffset="-0.7"
  />
  <circle
    className="progress"
    cx="7"
    cy="7"
    r="2"
    fill="none"
    stroke="#facc15"
    strokeWidth="4"
    strokeDasharray="2.08 100"
    strokeDashoffset="0"
    transform="rotate(-90 7 7)"
  />
</svg>;
```

### Loading Skeleton Example

```tsx
{
  /* Skeleton Loading State */
}
<div className="space-y-3">
  <Skeleton className="h-4 w-full" />
  <Skeleton className="h-4 w-3/4" />
  <Skeleton className="h-20 w-full" />
</div>;
```

---

## Design System Guidelines

### Color Usage Guidelines

1. **Always use CSS custom properties** for theme colors to ensure dark mode compatibility
2. **Use semantic color names** (primary, secondary, muted) instead of hardcoded colors
3. **Apply opacity modifiers** for hover states and disabled elements
4. **Use OKLCH color space** for new colors to maintain perceptual uniformity
5. **Label colors should have both light and dark variants**

### Typography Guidelines

1. **Use font-medium for emphasis** instead of bold to maintain visual weight
2. **Apply line-clamp for descriptions** to prevent layout breaks
3. **Use text-xs for metadata** and supporting information
4. **Keep heading hierarchy consistent** across all pages
5. **Use muted-foreground for secondary text** to establish visual hierarchy

### Spacing Guidelines

1. **Use consistent gap values**: 1.5, 2, 3, 4, 6
2. **Card padding should be px-3 or px-6** depending on card size
3. **Maintain 8px grid system** for all spacing
4. **Use negative space (-space-x-2)** for overlapping avatars
5. **Apply mb-2 or mb-3** for vertical rhythm in cards

### Component Guidelines

1. **Always use variant props** for component styling instead of custom classes
2. **Combine size and variant** for consistent component appearance
3. **Use asChild prop** when wrapping buttons around links
4. **Apply shrink-0** to icons to prevent layout issues
5. **Use data-slot attributes** for component identification

### Responsive Design Guidelines

1. **Mobile-first approach**: Base styles for mobile, lg: prefix for desktop
2. **Hide non-essential elements** on mobile (hidden lg:flex)
3. **Adjust padding** for different screen sizes (px-3 lg:px-6)
4. **Use responsive text sizes** (text-base lg:text-lg)
5. **Collapse sidebar** on mobile devices

### Accessibility Guidelines

1. **Use focus-visible** for keyboard navigation indicators
2. **Apply aria-invalid** states for form validation
3. **Include alt text** for all images
4. **Use semantic HTML** elements (button, nav, aside)
5. **Ensure sufficient color contrast** for text readability

## Additional Resources

### File Locations

- **Global Styles**: `/templates/task-management/app/globals.css`
- **UI Components**: `/templates/task-management/components/ui/`
- **Task Components**: `/templates/task-management/components/task/`
- **Layout**: `/templates/task-management/app/layout.tsx`
- **Mock Data**: `/templates/task-management/mock-data/`

### Dependencies

- **Tailwind CSS**: v4
- **Radix UI**: Latest versions
- **Lucide React**: v0.552.0
- **class-variance-authority**: v0.7.1
- **next-themes**: v0.4.6
- **tw-animate-css**: v1.4.0

### Color Tools

- **OKLCH Color Picker**: https://oklch.com
- **Tailwind Color Generator**: Use for extending color palette
- **Dark Mode Testing**: Use next-themes toggle for testing

---

## Conclusion

This design system provides a comprehensive, scalable foundation for building consistent user interfaces. It emphasizes:

- **Consistency**: Unified color palette, typography, and spacing
- **Accessibility**: Focus states, ARIA attributes, and semantic HTML
- **Responsiveness**: Mobile-first approach with breakpoint modifiers
- **Maintainability**: CSS custom properties and variant-based components
- **Dark Mode**: Full theme support with OKLCH color space
- **Performance**: Optimized with Tailwind CSS and minimal custom CSS

All components follow these established patterns, making the codebase predictable, maintainable, and easy to extend.
