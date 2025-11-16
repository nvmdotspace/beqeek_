# Design Guidelines

## Design Philosophy

Beqeek design system prioritizes **clarity, efficiency, and Vietnamese localization** for enterprise workflow automation.

**Core Principles**:

1. **Functional First**: Prioritize usability over aesthetics
2. **Vietnamese Optimized**: Typography & spacing for Vietnamese text
3. **Consistent**: Design tokens ensure uniform appearance
4. **Accessible**: WCAG 2.1 AA compliance minimum
5. **Performant**: Lightweight components, optimized rendering

## Design System Foundation

### Design Tokens (CSS Variables)

**CRITICAL**: Never use hardcoded colors. Always use design tokens.

#### Color Palette

```css
/* Light Mode */
--background: #ffffff;
--foreground: #0a0a0a;
--card: #ffffff;
--card-foreground: #0a0a0a;
--primary: #171717;
--primary-foreground: #fafafa;
--secondary: #f5f5f5;
--secondary-foreground: #171717;
--muted: #f5f5f5;
--muted-foreground: #737373;
--accent: #f5f5f5;
--accent-foreground: #171717;
--destructive: #ef4444;
--destructive-foreground: #fafafa;
--border: #e5e5e5;
--input: #e5e5e5;
--ring: #0a0a0a;

/* Dark Mode */
--background: #0a0a0a;
--foreground: #fafafa;
/* ... (auto-adapts) */
```

**Usage**:

```typescript
// ✅ Correct
<div className="bg-background text-foreground border-border" />

// ❌ Wrong
<div className="bg-white text-black border-gray-300" />
```

#### Spacing Scale

Based on 4px grid:

```css
/* Tailwind default scale */
0   → 0px
1   → 4px
2   → 8px
3   → 12px
4   → 16px
5   → 20px
6   → 24px
8   → 32px
10  → 40px
12  → 48px
16  → 64px
20  → 80px
24  → 96px
```

**Common Patterns**:

```typescript
// Component padding
className = 'p-4'; // 16px - small component
className = 'p-6'; // 24px - medium component
className = 'p-8'; // 32px - large component

// Section spacing
className = 'space-y-4'; // 16px vertical gap
className = 'space-y-6'; // 24px vertical gap
className = 'space-y-8'; // 32px vertical gap

// Layout gaps
className = 'gap-2'; // 8px - tight
className = 'gap-4'; // 16px - normal
className = 'gap-6'; // 24px - comfortable
```

#### Typography

**Font Families**:

```css
--font-sans: 'Inter', 'Segoe UI', system-ui, -apple-system;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

**Scale**:

```typescript
// Headings
text-4xl  → 36px (2.25rem)  // Page title
text-3xl  → 30px (1.875rem) // Section title
text-2xl  → 24px (1.5rem)   // Card title
text-xl   → 20px (1.25rem)  // Sub-heading
text-lg   → 18px (1.125rem) // Large body

// Body
text-base → 16px (1rem)     // Default text
text-sm   → 14px (0.875rem) // Small text
text-xs   → 12px (0.75rem)  // Caption, meta
```

**Font Weights**:

```typescript
font-normal    → 400 (body text)
font-medium    → 500 (emphasized text)
font-semibold  → 600 (headings, buttons)
font-bold      → 700 (major headings)
```

**Line Heights**:

```typescript
leading-tight    → 1.25   (headings)
leading-snug     → 1.375  (large body)
leading-normal   → 1.5    (default body)
leading-relaxed  → 1.625  (comfortable reading)
```

**Vietnamese Optimization**:

```css
/* Package: packages/ui/src/styles/globals.css */
body {
  font-family: var(--font-sans);
  line-height: 1.6; /* Vietnamese diacritics need more space */
  letter-spacing: 0.02em;
}
```

#### Border Radius

```typescript
rounded-none  → 0px
rounded-sm    → 2px   // Subtle (tags, badges)
rounded-md    → 6px   // Default (buttons, inputs)
rounded-lg    → 8px   // Cards, modals
rounded-xl    → 12px  // Large cards
rounded-full  → 9999px // Avatars, pills
```

#### Shadows

```typescript
shadow - sm; // Subtle (dropdown items)
shadow - md; // Default (cards)
shadow - lg; // Elevated (modals)
shadow - xl; // Floating (popovers)
```

## Component Standards

### Buttons

**Variants**:

```typescript
// Primary (main actions)
<Button variant="primary">
  Save Changes
</Button>

// Secondary (alternative actions)
<Button variant="secondary">
  Cancel
</Button>

// Destructive (dangerous actions)
<Button variant="destructive">
  Delete
</Button>

// Ghost (subtle actions)
<Button variant="ghost">
  Learn More
</Button>

// Link (navigation)
<Button variant="link">
  View Details
</Button>
```

**Sizes**:

```typescript
<Button size="sm">Small</Button>      // 32px height
<Button size="default">Default</Button> // 40px height
<Button size="lg">Large</Button>      // 48px height
```

**States**:

```typescript
<Button disabled>Processing...</Button>
<Button loading>Saving...</Button>
```

**Best Practices**:

- Use `primary` for main CTA (1 per section)
- Use `secondary` for alternative actions
- Use `destructive` for delete/remove actions
- Always provide accessible labels
- Include loading states for async actions

### Inputs

**Standard Input Classes** (MANDATORY):

```typescript
const inputClasses = cn(
  // Base
  'border border-input rounded-md',
  'bg-background text-foreground',
  'px-3 py-2',
  'transition-all',

  // Focus
  'focus-visible:outline-none',
  'focus-visible:ring-1',
  'focus-visible:ring-inset',
  'focus-visible:ring-ring',

  // States
  'placeholder:text-muted-foreground',
  'disabled:cursor-not-allowed',
  'disabled:opacity-50',
  'aria-invalid:border-destructive',
);
```

**Variants**:

```typescript
// Text input
<Input
  type="text"
  placeholder="Enter name"
  value={value}
  onChange={handleChange}
/>

// With label
<div className="space-y-2">
  <Label htmlFor="name">Full Name</Label>
  <Input id="name" />
</div>

// With error
<div className="space-y-2">
  <Input aria-invalid={!!error} />
  {error && <p className="text-sm text-destructive">{error}</p>}
</div>
```

### Filter Buttons

**Quick Filter Pattern** (Active Tables, Lists):

Filter buttons are a specialized button variant used for filtering and categorizing content. They use brand colors to indicate active state.

**Standard Implementation**:

```typescript
<Button
  size="sm"
  variant="ghost"
  onClick={() => setFilter(value)}
  className={cn(
    'transition-all rounded-lg border',
    isActive
      ? 'bg-[var(--brand-primary-subtle)] text-[var(--brand-primary)] border-[var(--brand-primary)] font-medium'
      : 'text-muted-foreground hover:text-foreground hover:bg-accent border-transparent'
  )}
>
  {isActive && <Check className="h-3.5 w-3.5 mr-1" />}
  Filter Label
</Button>
```

**Color Tokens (CRITICAL)**:

```css
/* Active State */
--brand-primary: hsl(217 91% 60%); /* Text & border */
--brand-primary-subtle: hsl(217 91% 96%); /* Background */

/* Inactive State */
--muted-foreground: hsl(0 0% 45.1%); /* Text */
--accent: hsl(0 0% 96.1%); /* Hover background */
```

**Usage Rules**:

✅ **DO:**

- Use `var(--token)` syntax in arbitrary values: `bg-[var(--brand-primary-subtle)]`
- Include check icon for active filters
- Use `transition-all` for smooth state changes
- Keep all styles in className (no inline style prop)
- Use `font-medium` for active state emphasis

❌ **DON'T:**

- Use `hsl(var(--token))` - double HSL wrapping is invalid
- Mix className with inline style prop
- Hardcode color values
- Forget the check icon on active state
- Use different colors for filter groups

**States**:

```typescript
// Active (selected filter)
'bg-[var(--brand-primary-subtle)] text-[var(--brand-primary)] border-[var(--brand-primary)] font-medium';

// Inactive (default)
'text-muted-foreground hover:text-foreground hover:bg-accent border-transparent';

// Focus (accessibility)
// Inherited from Button component's focus-visible styles
```

**Layout Pattern**:

```typescript
<div className="flex items-start gap-3">
  {/* Label */}
  <Text size="small" weight="medium" className="min-w-[100px] text-muted-foreground pt-1.5">
    Filter Label
  </Text>

  {/* Filter buttons */}
  <div className="flex-1 flex flex-wrap items-center gap-1.5">
    <FilterButton isActive={filter === 'all'} onClick={() => setFilter('all')}>
      All
    </FilterButton>
    <FilterButton isActive={filter === 'option1'} onClick={() => setFilter('option1')}>
      Option 1
    </FilterButton>
    <FilterButton isActive={filter === 'option2'} onClick={() => setFilter('option2')}>
      Option 2
    </FilterButton>
  </div>
</div>
```

**Best Practices**:

1. **Single Active State**: Only one filter per group should be active
2. **Check Icon**: Always show check mark on active filters
3. **Responsive**: Use `flex-wrap` to handle mobile layouts
4. **Consistent Spacing**: Use `gap-1.5` (6px) between buttons
5. **Label Alignment**: Align filter labels with `pt-1.5` to match button text baseline

**Common Mistake - Color Implementation**:

```typescript
// ❌ WRONG: Double HSL wrapping + inline styles
className="bg-[hsl(var(--brand-primary-subtle))]"
style={{ borderColor: 'hsl(var(--brand-primary))' }}

// ✅ CORRECT: Direct var() reference in arbitrary values
className="bg-[var(--brand-primary-subtle)] border-[var(--brand-primary)]"
```

**Why It Matters**:

- CSS custom properties already contain complete HSL values
- Wrapping with `hsl()` creates invalid CSS: `hsl(hsl(217 91% 60%))`
- Arbitrary values in Tailwind v4 must use `var()` directly
- Inline styles prevent Tailwind optimization and purging

### Cards

**Structure**:

```typescript
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Optional description</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Main content */}
  </CardContent>
  <CardFooter>
    {/* Actions */}
  </CardFooter>
</Card>
```

**Sizes**:

```typescript
// Compact
<Card className="p-4">

// Default
<Card className="p-6">

// Spacious
<Card className="p-8">
```

**Card Layout Patterns**:

**Centered Vertical Layout** (Legacy - Not Recommended):

```typescript
// ❌ Avoid: Excessive height, centered alignment
<CardContent className="p-4 space-y-3 text-center">
  <div className="flex justify-center">
    <img className="size-12" />
  </div>
  <Heading level={4} className="text-center">Title</Heading>
  <Text className="line-clamp-2">Description</Text>
</CardContent>
```

**Horizontal Icon-Prominent Layout** (Recommended):

```typescript
// ✅ Preferred: Compact, left-aligned, scannable
<CardContent className="px-4 py-3">
  <div className="flex items-start gap-3">
    {/* Icon - 40×40px for balance */}
    <div className="flex-shrink-0">
      <img className="size-10" />
    </div>

    {/* Content - Left-aligned, stacked */}
    <div className="flex-1 min-w-0 space-y-1">
      <div className="text-base font-semibold truncate">Title</div>
      <Text size="small" color="muted" className="line-clamp-2 leading-relaxed">
        Description text optimized for Vietnamese typography
      </Text>
    </div>
  </div>
</CardContent>
```

**Benefits of Horizontal Layout**:

- 45% height reduction (160px → 88px)
- Better scannability (left-to-right reading)
- Icon-prominent design (visual hierarchy)
- Space-efficient grids (show 2-3 more items)
- Vietnamese typography optimization

**Grid Patterns**:

```typescript
// 2-column compact (recommended for selection grids)
<div className="grid grid-cols-1 md:grid-cols-2 gap-3">

// 3-column standard (use for dashboard cards)
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
```

### Tables

**Standard Table Pattern**:

```typescript
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@workspace/ui/components/table';

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Status</TableHead>
      <TableHead className="text-right">Actions</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {data.map(item => (
      <TableRow key={item.id}>
        <TableCell className="font-medium">{item.name}</TableCell>
        <TableCell><Badge>{item.status}</Badge></TableCell>
        <TableCell className="text-right">
          <Button variant="ghost" size="sm">Edit</Button>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

**TanStack Table Integration**:

```typescript
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table';

const table = useReactTable({
  data,
  columns,
  getCoreRowModel: getCoreRowModel(),
});

<Table>
  <TableHeader>
    {table.getHeaderGroups().map(headerGroup => (
      <TableRow key={headerGroup.id}>
        {headerGroup.headers.map(header => (
          <TableHead key={header.id}>
            {flexRender(header.column.columnDef.header, header.getContext())}
          </TableHead>
        ))}
      </TableRow>
    ))}
  </TableHeader>
  <TableBody>
    {/* Similar pattern for body */}
  </TableBody>
</Table>
```

### Dialogs & Modals

```typescript
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>
        Optional description text
      </DialogDescription>
    </DialogHeader>
    {/* Content */}
    <DialogFooter>
      <Button variant="secondary" onClick={() => setIsOpen(false)}>
        Cancel
      </Button>
      <Button onClick={handleSave}>
        Save
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

**Best Practices**:

- Always provide `DialogTitle` for accessibility
- Use `DialogDescription` for context
- Include clear primary/secondary actions
- Close on backdrop click (default)
- Trap focus within modal

### Forms

**Standard Form Pattern**:

```typescript
import { useForm } from 'react-hook-form';

interface FormValues {
  name: string;
  email: string;
}

function MyForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>();

  const onSubmit = (data: FormValues) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          {...register('name', { required: 'Name is required' })}
          aria-invalid={!!errors.name}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          {...register('email', { required: 'Email is required' })}
          aria-invalid={!!errors.email}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <Button type="submit">Submit</Button>
    </form>
  );
}
```

## Layout Patterns

### Page Layout

```typescript
// Standard page layout
<div className="container mx-auto p-6 space-y-6">
  {/* Header */}
  <div className="flex items-center justify-between">
    <div>
      <h1 className="text-3xl font-bold">Page Title</h1>
      <p className="text-muted-foreground">Description</p>
    </div>
    <Button>Primary Action</Button>
  </div>

  {/* Content */}
  <Card>
    {/* Main content */}
  </Card>
</div>
```

### Grid Layouts

```typescript
// 2-column grid
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  <Card>Column 1</Card>
  <Card>Column 2</Card>
</div>

// 3-column grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <Card>Column 1</Card>
  <Card>Column 2</Card>
  <Card>Column 3</Card>
</div>

// Responsive grid with auto-fit
<div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6">
  {items.map(item => <Card key={item.id}>{item.content}</Card>)}
</div>
```

### Sidebar Layout

```typescript
<div className="flex h-screen">
  {/* Sidebar */}
  <aside className="w-64 border-r border-border bg-card">
    <nav className="p-4 space-y-2">
      {/* Navigation items */}
    </nav>
  </aside>

  {/* Main content */}
  <main className="flex-1 overflow-auto">
    <div className="container p-6">
      {/* Page content */}
    </div>
  </main>
</div>
```

## Responsive Design

### Breakpoints

```typescript
// Tailwind default breakpoints
sm:  640px   // Small tablets
md:  768px   // Tablets
lg:  1024px  // Laptops
xl:  1280px  // Desktops
2xl: 1536px  // Large desktops
```

### Mobile-First Approach

```typescript
// ✅ Mobile-first (preferred)
<div className="
  flex-col         // Mobile: vertical stack
  md:flex-row      // Tablet+: horizontal layout
">

// ❌ Desktop-first (avoid)
<div className="
  flex-row         // Default desktop
  max-md:flex-col  // Override for mobile (harder to maintain)
">
```

### Common Responsive Patterns

```typescript
// Hide on mobile
<div className="hidden md:block">Desktop only</div>

// Show on mobile only
<div className="block md:hidden">Mobile only</div>

// Responsive padding
<div className="p-4 md:p-6 lg:p-8">

// Responsive text
<h1 className="text-2xl md:text-3xl lg:text-4xl">

// Responsive columns
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
```

## Accessibility (WCAG 2.1 AA)

### Requirements

1. **Color Contrast**: 4.5:1 for normal text, 3:1 for large text
2. **Keyboard Navigation**: All interactive elements accessible via keyboard
3. **Screen Readers**: Semantic HTML + ARIA labels
4. **Focus Indicators**: Visible focus states
5. **Form Labels**: Every input must have associated label

### Implementation

**Semantic HTML**:

```typescript
// ✅ Correct
<button onClick={handleClick}>Click me</button>
<a href="/page">Link</a>

// ❌ Wrong
<div onClick={handleClick}>Click me</div>
<div className="cursor-pointer">Link</div>
```

**ARIA Labels**:

```typescript
// Icon-only buttons
<Button aria-label="Close dialog">
  <X className="h-4 w-4" />
</Button>

// Screen reader text
<span className="sr-only">Loading...</span>

// Descriptive links
<a href="/profile" aria-label="View John's profile">
  Profile
</a>
```

**Keyboard Navigation**:

```typescript
// Custom keyboard handlers
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick();
    }
  }}
>
```

**Focus Management**:

```typescript
// Trap focus in modal
import { Dialog } from '@workspace/ui/components/dialog';
// Dialog component handles focus trap automatically

// Manage focus manually
const buttonRef = useRef<HTMLButtonElement>(null);
useEffect(() => {
  if (isOpen) {
    buttonRef.current?.focus();
  }
}, [isOpen]);
```

## Dark Mode

### Implementation

Dark mode handled via CSS variables:

```typescript
// Toggle dark mode
<html className="dark">
  {/* All colors auto-adapt */}
</html>
```

**Theme Provider**:

```typescript
// apps/web/src/providers/theme-provider.tsx
import { ThemeProvider } from '@workspace/ui/components/theme-provider';

<ThemeProvider defaultTheme="system" storageKey="beqeek-theme">
  <App />
</ThemeProvider>
```

**Usage**:

```typescript
import { useTheme } from '@workspace/ui/components/theme-provider';

function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      Toggle Theme
    </Button>
  );
}
```

## Icons

### Lucide React

```typescript
import { Home, Settings, User, ChevronRight } from 'lucide-react';

// Standard size
<Home className="h-4 w-4" />      // 16px (small)
<Home className="h-5 w-5" />      // 20px (default)
<Home className="h-6 w-6" />      // 24px (large)

// With color
<Home className="h-5 w-5 text-primary" />
<Home className="h-5 w-5 text-muted-foreground" />

// In buttons
<Button>
  <Home className="mr-2 h-4 w-4" />
  Go Home
</Button>
```

## Animation

### Transitions

```typescript
// Default transition (all properties)
<div className="transition-all duration-200">

// Specific properties
<div className="transition-colors duration-200">
<div className="transition-transform duration-300">

// Custom easing
<div className="transition-all duration-200 ease-in-out">
```

### Hover States

```typescript
// Scale
<Button className="hover:scale-105 transition-transform">

// Color change
<div className="hover:bg-accent hover:text-accent-foreground transition-colors">

// Shadow
<Card className="hover:shadow-lg transition-shadow">
```

### Loading States

```typescript
// Spinner
<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />

// Pulse
<div className="animate-pulse bg-muted h-4 rounded" />

// Skeleton
<div className="space-y-2">
  <div className="h-4 bg-muted rounded animate-pulse" />
  <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
</div>
```

## Vietnamese Typography

### Special Considerations

1. **Diacritics**: Vietnamese uses many diacritics (á, à, ả, ã, ạ, etc.)
   - Increase line-height: 1.6 minimum
   - Letter-spacing: 0.02em for readability

2. **Font Selection**: Use fonts with proper Vietnamese diacritic support
   - Inter (✅ recommended)
   - Segoe UI (✅ recommended)
   - Roboto (✅ supported)
   - Arial (⚠️ acceptable)

3. **Text Wrapping**: Vietnamese words can be longer than English
   - Use `break-words` for long text
   - Increase container width when possible

4. **Capitalization**: Vietnamese rarely uses ALL CAPS
   - Use `capitalize` or `normal-case` instead of `uppercase`

**Example**:

```typescript
<p className="
  leading-relaxed    // 1.625 line height
  tracking-wide      // 0.02em letter spacing
  break-words        // Allow long word wrapping
">
  Hệ thống quản lý workflow tự động hóa
</p>
```

## Best Practices Checklist

### Component Development

- [ ] Use design tokens (no hardcoded colors)
- [ ] Mobile-first responsive design
- [ ] WCAG 2.1 AA accessibility
- [ ] Vietnamese typography optimization
- [ ] Dark mode support (via CSS variables)
- [ ] Loading/error/empty states
- [ ] Keyboard navigation
- [ ] Screen reader support
- [ ] Focus management

### Common Mistakes to Avoid

❌ **Don't**:

```typescript
// Hardcoded colors
<div className="bg-gray-100 text-gray-900 border-gray-300">

// Missing accessibility
<div onClick={handleClick}>Clickable</div>

// Desktop-first responsive
<div className="flex-row max-md:flex-col">

// Missing states
{loading ? <div>Loading...</div> : data && <Content />}
```

✅ **Do**:

```typescript
// Design tokens
<div className="bg-background text-foreground border-border">

// Proper accessibility
<button onClick={handleClick} aria-label="Description">

// Mobile-first responsive
<div className="flex-col md:flex-row">

// Comprehensive states
{loading && <LoadingState />}
{error && <ErrorState error={error} />}
{!data && <EmptyState />}
{data && <Content data={data} />}
```

## Resources

- **shadcn/ui Docs**: https://ui.shadcn.com/docs
- **Radix UI**: https://www.radix-ui.com/primitives
- **TailwindCSS**: https://tailwindcss.com/docs
- **WCAG Guidelines**: https://www.w3.org/WAI/WCAG21/quickref/
- **Lucide Icons**: https://lucide.dev/icons
