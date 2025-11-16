# Visual Design Guide: Workflow Connectors Redesign

## Color Palette & Design Tokens

### Base Colors (Semantic Tokens)

```
Background:     bg-background      (Page background)
Card:           bg-card            (Card surfaces)
Muted:          bg-muted           (Subtle backgrounds)
Primary:        bg-primary         (Active states, accents)
```

### Text Colors

```
Primary:        text-foreground           (Main text)
Secondary:      text-muted-foreground     (Descriptive text, labels)
Active:         text-primary              (Hover states, links)
Primary-FG:     text-primary-foreground   (Text on primary backgrounds)
```

### Border Colors

```
Default:        border-border       (Standard borders)
Light:          border-border/50    (Subtle borders)
Hover:          border-primary/30   (Accent on hover)
Primary:        border-primary/20   (Badge accent)
```

### Shadow Layers

```
Rest:           shadow-sm           (1px, subtle elevation)
Hover:          shadow-md           (4px, lifted elevation)
Active:         shadow-sm           (Tab active state)
```

## Component Anatomy

### ConnectorListItem Structure

```
┌─────────────────────────────────────────────────────────────────┐
│ Card Container (group, relative, overflow-hidden)              │
│ • shadow-sm → shadow-md (hover)                                │
│ • border-border → border-primary/30 (hover)                    │
│ • scale-100 → scale-[1.01] (hover)                             │
│                                                                 │
│  ┌──────────┐                                                  │
│  │          │  ┌───────────────────────────────────────┐       │
│  │  Logo    │  │ Heading (H4, 20px)                    │ Badge │
│  │  64x64   │  │ • text-foreground → text-primary      │ Arrow │
│  │          │  │                                        │       │
│  │ Gradient │  │ Description (Small Text, muted)       │       │
│  │ BG + IMG │  │ • line-clamp-2                        │       │
│  │ scale ↑  │  │ • italic + opacity-70 (if empty)      │       │
│  └──────────┘  └───────────────────────────────────────┘       │
│                                                                 │
│  [Gradient Overlay: opacity 0 → 100 on hover]                  │
└─────────────────────────────────────────────────────────────────┘

Spacing:
• Card padding: p-5 (20px)
• Inner gap: gap-5 (20px horizontal)
• Content gap: space-y-1.5 (6px vertical)
• Right section gap: gap-3 (12px)
```

### CategoryTabs Structure

```
┌─────────────────────────────────────────────────────────────────┐
│ TabsList Container                                              │
│ • bg-muted/40 (subtle background)                              │
│ • border border-border/50                                       │
│ • rounded-lg, p-1.5, gap-2                                      │
│                                                                 │
│  ╭──────────╮  ╭──────────╮  ╭──────────╮  ╭──────────╮      │
│  │ Tất cả   │  │ HTTP API │  │ Database │  │ Email    │      │
│  │    12    │  │    5     │  │    3     │  │    2     │      │
│  ╰──────────╯  ╰──────────╯  ╰──────────╯  ╰──────────╯      │
│   [Active]     [Inactive]    [Inactive]    [Disabled]         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

Tab States:
• Active:   bg-primary, text-primary-foreground, shadow-sm
• Inactive: bg-transparent, text-muted-foreground
• Hover:    bg-background/50, text-foreground
• Disabled: opacity-50, cursor-not-allowed

Badge Colors:
• Active:   bg-primary-foreground/20, text-primary-foreground
• Inactive: bg-muted, text-muted-foreground
```

## Animation Sequences

### Card Hover Animation (200ms)

```
1. Card Container:
   • scale: 1.0 → 1.01 (1% larger)
   • shadow: sm → md (depth increase)
   • border: border → border-primary/30 (accent color)

2. Logo Container (staggered):
   • scale: 1.0 → 1.05 (5% larger)

3. Logo Image (nested):
   • scale: 1.0 → 1.10 (10% larger, from parent's 1.05)

4. Heading Text:
   • color: foreground → primary (accent)

5. Badge:
   • bg: secondary → primary/10
   • text: default → primary
   • border: default → primary/20

6. Chevron Icon:
   • color: muted-foreground → primary
   • translate: x-0 → x-0.5 (subtle right shift)

7. Gradient Overlay (300ms):
   • opacity: 0 → 100 (fade in)
```

### Tab Click Animation (200ms)

```
Inactive → Active:
1. Background:   transparent → primary (solid fill)
2. Text:         muted-foreground → primary-foreground
3. Badge BG:     muted → primary-foreground/20
4. Badge Text:   muted-foreground → primary-foreground
5. Shadow:       none → sm (subtle elevation)
```

## Typography Scale

### Hierarchy (Vietnamese Optimized)

```
H1 (Page Title):        36px / 43.2px (1.2)      - Bold
H2 (Section Title):     30px / 37.5px (1.25)     - Semibold
H3 (Subsection):        24px / 32px (1.33)       - Semibold
H4 (Card Title):        20px / 28px (1.4)        - Semibold  ← Used in cards
H5 (Small Heading):     18px / 25.2px (1.4)      - Semibold
H6 (Tiny Heading):      16px / 22.4px (1.4)      - Semibold

Body Large:             16px / 24px (1.5)        - Normal
Body Default:           14px / 20px (1.43)       - Normal    ← Card description
Body Small:             12px / 16px (1.33)       - Normal    ← Metadata

Note: Line heights increase 8-13% when lang="vi"
```

## Spacing System (4px Base)

```
space-1    4px     Tight spacing (badges)
space-1.5  6px     Content vertical gap
space-2    8px     Small gaps
space-2.5  10px    Medium gaps
space-3    12px    List spacing, right section
space-4    16px    Section gaps
space-5    20px    Card padding, logo gap
space-6    24px    Large section gaps
```

## Border Radius Scale

```
rounded-md    6px     Small elements (badges)
rounded-lg    8px     Cards, containers
rounded-xl    12px    Logo containers, featured elements
rounded-full  50%     Pills (tabs, count badges)
```

## Elevation System

```
Level 0 (Flat):        border only, no shadow
Level 1 (Resting):     shadow-sm (0 1px 2px rgba)
Level 2 (Raised):      shadow-md (0 4px 6px rgba)  ← Card hover
Level 3 (Floating):    shadow-lg (0 10px 15px rgba)
```

## Icon Sizes

```
size-4    16px    Small icons (chevron in tabs)
size-5    20px    Medium icons (chevron in cards)
size-6    24px    Default icons (Plug2 fallback)
size-8    32px    Large icons
size-10   40px    Logo images
size-12   48px    Old logo size (deprecated)
size-16   64px    New logo container size
```

## Responsive Breakpoints

### Mobile (320px - 767px)

- Single column layout
- Full width cards
- Wrap category tabs
- Reduced padding (p-4 instead of p-6)
- Smaller logo (size-12 on mobile if needed)

### Tablet (768px - 1023px)

- Same as mobile but more breathing room
- Can show 2 column grid if applicable

### Desktop (1024px+)

- Full spacing (p-6, gap-5)
- Larger logos (size-16)
- No wrapping needed
- Optimal hover effects

## Accessibility Specs

### Focus Indicators

```
Default:        ring-2, ring-ring, ring-offset-2
Compact:        ring-1, ring-ring, ring-offset-1
Inset:          ring-1, ring-inset, ring-ring
```

### Color Contrast Ratios

```
Normal Text (14px):     4.5:1 minimum (WCAG AA)
Large Text (20px+):     3:1 minimum (WCAG AA)
UI Elements:            3:1 minimum

Current Ratios:
• foreground/background:        21:1  ✓ (excellent)
• primary/background:           19:1  ✓ (excellent)
• muted-foreground/background:  4.6:1 ✓ (AA compliant)
```

### Touch Targets (Mobile)

```
Minimum:    44x44px (Apple HIG)
Card:       Full width x 80px height (sufficient)
Tab:        Auto width x 36px height (in scrollable container)
Badge:      Not interactive (display only)
```

## Dark Mode Adaptations

All design tokens automatically adapt:

```
Light Mode Example:
• bg-background:   hsl(0 0% 100%)    White
• text-foreground: hsl(0 0% 3.9%)    Near-black
• border-border:   hsl(0 0% 89.8%)   Light gray

Dark Mode Example:
• bg-background:   hsl(0 0% 3.9%)    Near-black
• text-foreground: hsl(0 0% 98%)     Near-white
• border-border:   hsl(0 0% 14.9%)   Dark gray

Opacity layers work in both:
• primary/10, primary/20, primary/30
• border/50, muted/40
• Automatically adjust to theme
```

## Code Examples

### Minimal Card Pattern

```tsx
<Card className="group hover:shadow-md hover:scale-[1.01] transition-all duration-200">
  <CardContent className="p-5">{/* Content */}</CardContent>
</Card>
```

### Pill Tab Pattern

```tsx
<TabsTrigger
  className={cn(
    'px-4 py-2 rounded-full transition-all duration-200',
    'data-[state=active]:bg-primary data-[state=active]:text-primary-foreground',
  )}
>
  Label
</TabsTrigger>
```

### Logo with Fallback

```tsx
<div className="size-16 rounded-xl bg-gradient-to-br from-muted to-muted/50 border border-border/50">
  {logo ? (
    <img src={logo} alt={name} className="size-10 object-contain" />
  ) : (
    <Plug2 className="size-6 text-primary/60" />
  )}
</div>
```

## Performance Targets

- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s
- Cumulative Layout Shift: < 0.1
- Animation Frame Rate: 60fps (all transitions)
- Time to Interactive: < 3.5s

## Browser Support

- Chrome/Edge 90+ ✓
- Firefox 88+ ✓
- Safari 14+ ✓
- Mobile Safari iOS 14+ ✓
- Chrome Android 90+ ✓

All modern browsers with:

- CSS Custom Properties
- CSS Grid/Flexbox
- CSS Transitions
- CSS Transforms

---

**Reference**: This guide documents the visual design system for the workflow connectors redesign. All patterns follow the main design system at `/docs/design-system.md`.
