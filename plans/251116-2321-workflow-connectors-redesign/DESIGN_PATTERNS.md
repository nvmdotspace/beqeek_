# Design Patterns Reference

This document catalogs reusable design patterns from the workflow connectors redesign that can be applied to other components.

## 1. Enhanced Interactive Card Pattern

**Use Case**: Any clickable card/list item that needs professional hover effects

```tsx
<Card
  className={cn(
    // Base styles
    'group relative overflow-hidden',
    'border border-border bg-card',

    // Shadow and depth
    'shadow-sm hover:shadow-md',

    // Hover effects
    'transition-all duration-200 ease-out',
    'hover:scale-[1.01]',
    'hover:border-primary/30',

    // Cursor and focus
    'cursor-pointer',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
  )}
  onClick={handleClick}
  role="button"
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }}
>
  <CardContent className="p-5">{/* Content */}</CardContent>

  {/* Subtle gradient overlay on hover */}
  <div
    className={cn(
      'absolute inset-0 bg-gradient-to-r from-transparent via-primary/[0.02] to-transparent',
      'opacity-0 group-hover:opacity-100 transition-opacity duration-300',
      'pointer-events-none',
    )}
    aria-hidden="true"
  />
</Card>
```

**Key Features**:

- Group hover for coordinated child animations
- Multi-layer hover effects (shadow, scale, border)
- Gradient overlay for sophistication
- Proper keyboard accessibility
- Smooth 200ms transitions

## 2. Logo Container with Animation

**Use Case**: Logo/icon containers in cards, avatars, etc.

```tsx
<div
  className={cn(
    'size-16 rounded-xl flex items-center justify-center flex-shrink-0',
    'bg-gradient-to-br from-muted to-muted/50',
    'border border-border/50',
    'transition-transform duration-200',
    'group-hover:scale-105',
  )}
>
  {logo ? (
    <img
      src={logo}
      alt={name}
      className="size-10 object-contain transition-transform duration-200 group-hover:scale-110"
    />
  ) : (
    <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
      <IconComponent className="size-6 text-primary/60" />
    </div>
  )}
</div>
```

**Key Features**:

- Gradient background for depth
- Nested scale animations (container + image)
- Elegant fallback with icon
- Proper flex-shrink-0 to prevent squashing

## 3. Pill-Style Category Tabs

**Use Case**: Filtering tabs, navigation pills, segmented controls

```tsx
<Tabs value={activeCategory} onValueChange={onCategoryChange}>
  <TabsList
    className={cn(
      'inline-flex flex-wrap items-center gap-2',
      'h-auto p-1.5',
      'bg-muted/40 rounded-lg border border-border/50',
    )}
  >
    <TabsTrigger
      value={value}
      className={cn(
        // Base styles
        'relative px-4 py-2 rounded-full',
        'text-sm font-medium',
        'transition-all duration-200',

        // Inactive state
        'text-muted-foreground bg-transparent',
        'hover:text-foreground hover:bg-background/50',

        // Active state
        'data-[state=active]:bg-primary',
        'data-[state=active]:text-primary-foreground',
        'data-[state=active]:shadow-sm',

        // Focus state
        'focus-visible:outline-none',
        'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
      )}
    >
      <span className="flex items-center gap-2">
        {label}
        {/* Inline badge */}
        <span
          className={cn(
            'inline-flex items-center justify-center',
            'min-w-[1.5rem] h-5 px-1.5 rounded-full',
            'text-xs font-semibold',
            'transition-colors duration-200',
            isActive ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-muted-foreground',
          )}
        >
          {count}
        </span>
      </span>
    </TabsTrigger>
  </TabsList>
</Tabs>
```

**Key Features**:

- Pill shape with rounded-full
- Container with subtle background
- Inline badges that adapt to active state
- Smooth color transitions
- Disabled state support

## 4. Elegant Empty State Text

**Use Case**: Placeholder text for missing/empty fields

```tsx
const hasContent = content && content.trim().length > 0;

<Text size="small" color="muted" className={cn('line-clamp-2', !hasContent && 'italic opacity-70')}>
  {hasContent ? content : 'Chưa có mô tả'}
</Text>;
```

**Key Features**:

- Conditional styling based on content
- Italic + reduced opacity for empty state
- Softer empty message ("Chưa có" vs "Không có")
- Line clamping for overflow

## 5. Coordinated Hover Effects

**Use Case**: Multiple child elements that should respond to parent hover

```tsx
<div className="group">
  {/* Element 1: Color transition */}
  <Heading level={4} className="truncate group-hover:text-primary transition-colors duration-200">
    {title}
  </Heading>

  {/* Element 2: Badge with multiple transitions */}
  <Badge
    variant="secondary"
    className="transition-colors duration-200 group-hover:bg-primary/10 group-hover:text-primary group-hover:border-primary/20"
  >
    {type}
  </Badge>

  {/* Element 3: Icon with translation */}
  <ChevronRight className="size-5 text-muted-foreground transition-all duration-200 group-hover:text-primary group-hover:translate-x-0.5" />
</div>
```

**Key Features**:

- Group class on parent
- group-hover: prefix on children
- Staggered effects create depth
- All use 200ms for consistency

## 6. Loading Skeleton Matching Pattern

**Use Case**: Skeleton states that match actual component proportions

```tsx
{
  /* Match actual component structure */
}
<Card className="border border-border bg-card shadow-sm">
  <CardContent className="p-5">
    {' '}
    {/* Same padding as real component */}
    <div className="flex items-center gap-5">
      {' '}
      {/* Same gap */}
      {/* Logo - same size */}
      <Skeleton className="size-16 rounded-xl flex-shrink-0" />
      {/* Content - same spacing */}
      <div className="flex-1 space-y-2.5">
        <Skeleton className="h-6 w-64" /> {/* H4 height */}
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-full max-w-lg" /> {/* Text size */}
          <Skeleton className="h-4 w-3/4 max-w-md" />
        </div>
      </div>
      {/* Right section - same gap */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <Skeleton className="h-6 w-24 rounded-md" />
        <Skeleton className="size-5" />
      </div>
    </div>
  </CardContent>
</Card>;
```

**Key Features**:

- Exact same layout structure
- Matching padding, gaps, sizes
- Same border and shadow
- Realistic two-line descriptions

## 7. Focus State Pattern

**Use Case**: Accessible focus indicators for all interactive elements

```tsx
className={cn(
  'focus-visible:outline-none',
  'focus-visible:ring-2',
  'focus-visible:ring-ring',
  'focus-visible:ring-offset-2',
)}
```

**Variations**:

```tsx
// Inset ring (for inputs)
'focus-visible:ring-1 focus-visible:ring-inset';

// With offset (for buttons, cards)
'focus-visible:ring-2 focus-visible:ring-offset-2';

// Smaller ring (for compact elements)
'focus-visible:ring-1 focus-visible:ring-offset-1';
```

## 8. Responsive Typography Pattern

**Use Case**: Semantic typography with proper hierarchy

```tsx
// Card title
<Heading level={4} className="truncate">
  {title}
</Heading>

// Description
<Text size="small" color="muted" className="line-clamp-2">
  {description}
</Text>

// Metadata
<Text size="small" color="muted" className="italic">
  {timestamp}
</Text>
```

**Key Features**:

- Semantic components from design system
- Proper heading levels (H4 for card titles)
- Color variants (muted for secondary text)
- Truncation/clamping for overflow

## 9. Badge Hover Pattern

**Use Case**: Badges that enhance on parent hover

```tsx
<Badge
  variant="secondary"
  className={cn(
    'transition-colors duration-200',
    'group-hover:bg-primary/10',
    'group-hover:text-primary',
    'group-hover:border-primary/20',
  )}
>
  {label}
</Badge>
```

**Key Features**:

- Subtle background change (primary/10)
- Text color matches background
- Border coordination
- Smooth 200ms transition

## 10. Disabled State Pattern

**Use Case**: Tabs/buttons that should show disabled state

```tsx
<TabsTrigger
  value={value}
  disabled={count === 0}
  className={cn(
    // ... other classes
    count === 0 && 'opacity-50 cursor-not-allowed',
  )}
>
  {label}
</TabsTrigger>
```

**Key Features**:

- Conditional disabled prop
- Visual feedback (opacity-50)
- Cursor indication (cursor-not-allowed)
- Maintains proper semantics

## Design Token Reference

**Common Tokens Used**:

- `bg-card` - Card backgrounds
- `border-border` - Standard borders
- `border-primary` - Accent borders
- `text-foreground` - Primary text
- `text-muted-foreground` - Secondary text
- `bg-muted` - Subtle backgrounds
- `shadow-sm` → `shadow-md` - Elevation
- `rounded-lg` (8px) - Standard radius
- `rounded-xl` (12px) - Larger radius
- `rounded-full` - Pills/badges
- `p-5` (20px) - Card padding
- `gap-5` (20px) - Element spacing
- `size-16` (64px) - Logo size

## Performance Guidelines

**Animation Best Practices**:

- Duration: 200ms for most interactions, 300ms for overlays
- Easing: `ease-out` for natural deceleration
- Properties: Use `transform` and `opacity` (GPU-accelerated)
- Avoid: `width`, `height`, `padding` in animations (cause reflow)

**Transition Classes**:

```tsx
'transition-all duration-200 ease-out'; // Multi-property
'transition-colors duration-200'; // Colors only
'transition-transform duration-200'; // Transform only
'transition-opacity duration-300'; // Overlay fades
```

## Accessibility Checklist

For any interactive component:

- [ ] Keyboard accessible (Enter/Space triggers)
- [ ] Focus indicator visible (focus-visible:ring-2)
- [ ] ARIA label on cards/buttons
- [ ] aria-hidden on decorative elements
- [ ] Screen reader tested
- [ ] Color contrast meets 4.5:1 (text) or 3:1 (large text)
- [ ] Touch targets min 44x44px on mobile

## Related Documentation

- [Design System](../../../docs/design-system.md) - Full design system reference
- [Typography Components](../../../docs/typography-components.md) - Semantic typography
- [Design Review Checklist](../../../docs/design-review-checklist.md) - PR requirements
