# Layout Primitives Guide

**Last Updated:** 2025-11-12
**Version:** 1.0
**Status:** ✅ Complete

## Overview

Layout primitives are composable building blocks that provide consistent spacing, alignment, and responsive behavior using the Atlassian-inspired **8px spacing system** and **12-column responsive grid**.

**Location:** `@workspace/ui/components/primitives`

**Primitives Available:**

1. **Box** - Generic container with padding and styling
2. **Stack** - Vertical layout with managed gaps
3. **Inline** - Horizontal layout with managed gaps
4. **Grid** - 12-column responsive grid system
5. **Container** - Max-width centered container

---

## Table of Contents

1. [Installation & Imports](#installation--imports)
2. [Box Primitive](#box-primitive)
3. [Stack Primitive](#stack-primitive)
4. [Inline Primitive](#inline-primitive)
5. [Grid Primitive](#grid-primitive)
6. [Container Primitive](#container-primitive)
7. [Composition Patterns](#composition-patterns)
8. [Best Practices](#best-practices)
9. [Common Recipes](#common-recipes)

---

## Installation & Imports

### Import Primitives

```tsx
// Import individual primitives
import { Box } from '@workspace/ui/components/primitives/box';
import { Stack } from '@workspace/ui/components/primitives/stack';
import { Inline } from '@workspace/ui/components/primitives/inline';
import { Grid, GridItem } from '@workspace/ui/components/primitives/grid';
import { Container } from '@workspace/ui/components/primitives/container';

// Or import all from index
import { Box, Stack, Inline, Grid, GridItem, Container } from '@workspace/ui/components/primitives';
```

### TypeScript Support

All primitives are fully typed with TypeScript:

```tsx
import type { BoxProps, StackProps, InlineProps, GridProps, ContainerProps } from '@workspace/ui/components/primitives';
```

---

## Box Primitive

**Purpose:** Generic container with configurable padding, background, and borders.

### API Reference

```tsx
interface BoxProps {
  padding?: 'none' | 'space-025' | 'space-050' | ... | 'space-1000';
  backgroundColor?: 'none' | 'background' | 'card' | 'muted' | 'accent' | 'primary' | 'secondary' | 'destructive' | 'success' | 'warning' | 'info';
  borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  border?: 'none' | 'default' | 'muted' | 'primary' | 'success' | 'warning' | 'info' | 'destructive';
  as?: keyof JSX.IntrinsicElements; // Render as different HTML element
  className?: string;
  children?: React.ReactNode;
}
```

### Basic Usage

```tsx
// Simple padding
<Box padding="space-300">
  <Content />
</Box>

// Card-like box
<Box
  padding="space-400"
  backgroundColor="card"
  borderRadius="lg"
  border="default"
>
  <Card content />
</Box>

// Colored background
<Box padding="space-200" backgroundColor="success" borderRadius="md">
  <SuccessMessage />
</Box>
```

### Use Cases

**Card Wrapper:**

```tsx
<Box padding="space-300" backgroundColor="card" borderRadius="lg" border="default" className="shadow-sm">
  <h3>Card Title</h3>
  <p>Card content goes here</p>
</Box>
```

**Alert Box:**

```tsx
<Box padding="space-250" backgroundColor="warning" borderRadius="md" border="warning">
  <AlertTriangle className="h-4 w-4" />
  <Text>Warning message</Text>
</Box>
```

**Section Container:**

```tsx
<Box padding="space-600" backgroundColor="muted">
  <Section content />
</Box>
```

---

## Stack Primitive

**Purpose:** Vertical layout with consistent gaps between children.

### API Reference

```tsx
interface StackProps {
  space?: 'none' | 'space-025' | 'space-050' | ... | 'space-1000';
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  children?: React.ReactNode;
}
```

### Basic Usage

```tsx
// Vertical stack with gaps
<Stack space="space-200">
  <Header />
  <Content />
  <Footer />
</Stack>

// Centered stack
<Stack space="space-300" align="center">
  <Icon />
  <Heading />
  <Description />
</Stack>

// Space-between stack
<Stack space="space-100" justify="between" className="h-full">
  <TopSection />
  <BottomSection />
</Stack>
```

### Use Cases

**Form Layout:**

```tsx
<Stack space="space-250">
  <label htmlFor="name">Name</label>
  <Input id="name" />

  <label htmlFor="email">Email</label>
  <Input id="email" type="email" />

  <Button type="submit">Submit</Button>
</Stack>
```

**Card Content:**

```tsx
<Card>
  <Stack space="space-200">
    <Heading level={3}>Title</Heading>
    <Text>Description goes here</Text>
    <Inline space="space-150">
      <Button>Action</Button>
      <Button variant="outline">Cancel</Button>
    </Inline>
  </Stack>
</Card>
```

**Navigation Menu:**

```tsx
<Stack space="space-100" as="nav">
  <NavLink href="/home">Home</NavLink>
  <NavLink href="/about">About</NavLink>
  <NavLink href="/contact">Contact</NavLink>
</Stack>
```

---

## Inline Primitive

**Purpose:** Horizontal layout with consistent gaps between children.

### API Reference

```tsx
interface InlineProps {
  space?: 'none' | 'space-025' | 'space-050' | ... | 'space-1000';
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  wrap?: true | false;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  children?: React.ReactNode;
}
```

### Basic Usage

```tsx
// Horizontal layout
<Inline space="space-150">
  <Button>Save</Button>
  <Button variant="outline">Cancel</Button>
  <Button variant="ghost">Delete</Button>
</Inline>

// Centered with wrapping
<Inline space="space-200" align="center" wrap>
  <Tag>React</Tag>
  <Tag>TypeScript</Tag>
  <Tag>Tailwind</Tag>
  <Tag>Vite</Tag>
</Inline>

// Justified between
<Inline justify="between" align="center">
  <Logo />
  <Navigation />
  <UserMenu />
</Inline>
```

### Use Cases

**Button Group:**

```tsx
<Inline space="space-150" align="center">
  <Button variant="primary">Confirm</Button>
  <Button variant="outline">Cancel</Button>
</Inline>
```

**Toolbar:**

```tsx
<Inline space="space-100" align="center" wrap>
  <IconButton icon={<Bold />} />
  <IconButton icon={<Italic />} />
  <IconButton icon={<Underline />} />
  <Separator orientation="vertical" />
  <IconButton icon={<AlignLeft />} />
  <IconButton icon={<AlignCenter />} />
  <IconButton icon={<AlignRight />} />
</Inline>
```

**Tag List:**

```tsx
<Inline space="space-100" wrap>
  {tags.map((tag) => (
    <Badge key={tag} variant="secondary">
      {tag}
    </Badge>
  ))}
</Inline>
```

**Header:**

```tsx
<Inline justify="between" align="center" className="w-full">
  <Inline space="space-200" align="center">
    <Logo />
    <Heading>App Name</Heading>
  </Inline>
  <UserMenu />
</Inline>
```

---

## Grid Primitive

**Purpose:** 12-column responsive grid system with flexible layouts.

### API Reference

```tsx
interface GridProps {
  columns?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  gap?: 'none' | 'space-025' | ... | 'space-1000' | 'gutter';
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  justify?: 'start' | 'center' | 'end' | 'stretch';
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  children?: React.ReactNode;
}

interface GridItemProps {
  span?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 'full';
  spanSm?: 1 | 2 | ... | 12 | 'full'; // Responsive span for sm breakpoint
  spanMd?: 1 | 2 | ... | 12 | 'full'; // Responsive span for md breakpoint
  spanLg?: 1 | 2 | ... | 12 | 'full'; // Responsive span for lg breakpoint
  spanXl?: 1 | 2 | ... | 12 | 'full'; // Responsive span for xl breakpoint
  start?: 1 | 2 | ... | 12 | 'auto';  // Column start position
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  children?: React.ReactNode;
}
```

### Basic Usage

```tsx
// 12-column grid with responsive gutter
<Grid columns={12} gap="gutter">
  <GridItem span={8}>
    <MainContent />
  </GridItem>
  <GridItem span={4}>
    <Sidebar />
  </GridItem>
</Grid>

// 3-column equal grid
<Grid columns={3} gap="space-300">
  <GridItem><Card /></GridItem>
  <GridItem><Card /></GridItem>
  <GridItem><Card /></GridItem>
</Grid>
```

### Responsive Layouts

```tsx
// Mobile: 1 column, Tablet: 2 columns, Desktop: 3 columns
<Grid columns={12} gap="space-300">
  <GridItem span={12} spanMd={6} spanLg={4}>
    <Card />
  </GridItem>
  <GridItem span={12} spanMd={6} spanLg={4}>
    <Card />
  </GridItem>
  <GridItem span={12} spanMd={6} spanLg={4}>
    <Card />
  </GridItem>
</Grid>

// Main content with sidebar that stacks on mobile
<Grid columns={12} gap="space-400">
  <GridItem span={12} spanLg={8}>
    <Article />
  </GridItem>
  <GridItem span={12} spanLg={4}>
    <Aside />
  </GridItem>
</Grid>
```

### Use Cases

**Dashboard Grid:**

```tsx
<Grid columns={12} gap="space-300">
  <GridItem span={12} spanLg={8}>
    <ChartCard />
  </GridItem>
  <GridItem span={12} spanLg={4}>
    <StatsCard />
  </GridItem>
  <GridItem span={6} spanMd={3}>
    <MetricCard />
  </GridItem>
  <GridItem span={6} spanMd={3}>
    <MetricCard />
  </GridItem>
  <GridItem span={6} spanMd={3}>
    <MetricCard />
  </GridItem>
  <GridItem span={6} spanMd={3}>
    <MetricCard />
  </GridItem>
</Grid>
```

**Product Grid:**

```tsx
<Grid columns={12} gap="space-400">
  {products.map((product) => (
    <GridItem key={product.id} span={12} spanSm={6} spanMd={4} spanLg={3}>
      <ProductCard product={product} />
    </GridItem>
  ))}
</Grid>
```

**Form Layout:**

```tsx
<Grid columns={12} gap="space-300">
  <GridItem span={12} spanMd={6}>
    <FormField label="First Name" />
  </GridItem>
  <GridItem span={12} spanMd={6}>
    <FormField label="Last Name" />
  </GridItem>
  <GridItem span={12}>
    <FormField label="Email" />
  </GridItem>
  <GridItem span={12} spanMd={8}>
    <FormField label="Address" />
  </GridItem>
  <GridItem span={12} spanMd={4}>
    <FormField label="Zip Code" />
  </GridItem>
</Grid>
```

---

## Container Primitive

**Purpose:** Max-width centered container with responsive padding.

### API Reference

```tsx
interface ContainerProps {
  maxWidth?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'none' | 'space-025' | ... | 'space-1000' | 'gutter' | 'margin';
  center?: true | false;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  children?: React.ReactNode;
}
```

### Basic Usage

```tsx
// Standard container with max-width and margins
<Container maxWidth="xl" padding="margin">
  <Content />
</Container>

// Full-width container with gutter padding
<Container maxWidth="full" padding="gutter">
  <FullWidthContent />
</Container>

// Narrow container
<Container maxWidth="md" padding="space-600">
  <Article />
</Container>
```

### Use Cases

**Page Layout:**

```tsx
<Container maxWidth="xl" padding="margin">
  <Stack space="space-600">
    <Header />
    <MainContent />
    <Footer />
  </Stack>
</Container>
```

**Article Layout:**

```tsx
<Container maxWidth="lg" padding="space-400">
  <Stack space="space-400">
    <Heading level={1}>Article Title</Heading>
    <Text size="large">Article content...</Text>
  </Stack>
</Container>
```

**Full-Width Hero with Centered Content:**

```tsx
<Box backgroundColor="accent" className="w-full">
  <Container maxWidth="xl" padding="margin">
    <Stack space="space-400" align="center" className="py-[var(--space-800)]">
      <Heading level={1}>Hero Heading</Heading>
      <Text>Hero description</Text>
      <Button>Get Started</Button>
    </Stack>
  </Container>
</Box>
```

---

## Composition Patterns

### Nested Primitives

Primitives work best when composed together:

```tsx
// Container > Grid > Stack
<Container maxWidth="xl" padding="margin">
  <Grid columns={12} gap="space-400">
    <GridItem span={8}>
      <Stack space="space-300">
        <Heading>Main Content</Heading>
        <Text>Article text...</Text>
      </Stack>
    </GridItem>
    <GridItem span={4}>
      <Stack space="space-200">
        <Heading level={3}>Sidebar</Heading>
        <Box padding="space-200" backgroundColor="muted" borderRadius="md">
          <Text>Sidebar content</Text>
        </Box>
      </Stack>
    </GridItem>
  </Grid>
</Container>
```

### Complex Card Layout

```tsx
<Box padding="space-300" backgroundColor="card" borderRadius="lg" border="default">
  <Stack space="space-300">
    {/* Header with actions */}
    <Inline justify="between" align="center">
      <Heading level={3}>Card Title</Heading>
      <Button variant="ghost" size="sm">
        Edit
      </Button>
    </Inline>

    {/* Content */}
    <Text>Card description goes here</Text>

    {/* Metadata */}
    <Inline space="space-150" wrap>
      <Badge>Tag 1</Badge>
      <Badge>Tag 2</Badge>
      <Badge>Tag 3</Badge>
    </Inline>

    {/* Footer actions */}
    <Inline space="space-150" justify="end">
      <Button variant="outline" size="sm">
        Cancel
      </Button>
      <Button size="sm">Save</Button>
    </Inline>
  </Stack>
</Box>
```

---

## Best Practices

### 1. Use Semantic Spacing Tokens

```tsx
// ✅ Good - Semantic spacing names
<Stack space="space-300">
  <Content />
</Stack>

// ❌ Bad - Magic numbers
<div className="space-y-6">
  <Content />
</div>
```

### 2. Compose Primitives

```tsx
// ✅ Good - Composable primitives
<Container maxWidth="xl">
  <Stack space="space-400">
    <Section />
  </Stack>
</Container>

// ❌ Bad - Nested divs with hardcoded styles
<div className="max-w-screen-xl mx-auto px-6">
  <div className="space-y-8">
    <Section />
  </div>
</div>
```

### 3. Use Responsive Spans

```tsx
// ✅ Good - Mobile-first responsive
<GridItem span={12} spanMd={6} spanLg={4}>
  <Card />
</GridItem>

// ❌ Bad - Single fixed span
<GridItem span={4}>
  <Card />
</GridItem>
```

### 4. Leverage `as` Prop for Semantics

```tsx
// ✅ Good - Semantic HTML
<Stack as="nav" space="space-150">
  <NavLink />
</Stack>

<Inline as="ul" space="space-100">
  <li><Item /></li>
</Inline>

// ❌ Bad - Div for everything
<Stack space="space-150">
  <NavLink />
</Stack>
```

### 5. Combine with Tailwind Classes

```tsx
// ✅ Good - Extend with className
<Box padding="space-300" backgroundColor="card" className="shadow-md hover:shadow-lg transition-shadow">
  <Content />
</Box>
```

---

## Common Recipes

### Page Layout Template

```tsx
export function PageLayout({ children }: { children: React.ReactNode }) {
  return (
    <Stack space="none" className="min-h-screen">
      {/* Header */}
      <Box backgroundColor="background" border="default">
        <Container maxWidth="xl" padding="margin">
          <Box padding="space-200">
            <Inline justify="between" align="center">
              <Logo />
              <Navigation />
            </Inline>
          </Box>
        </Container>
      </Box>

      {/* Main content */}
      <Box as="main" className="flex-1">
        <Container maxWidth="xl" padding="margin">
          <Box padding="space-600">{children}</Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box backgroundColor="muted">
        <Container maxWidth="xl" padding="margin">
          <Box padding="space-400">
            <Footer />
          </Box>
        </Container>
      </Box>
    </Stack>
  );
}
```

### Form with Sections

```tsx
<Stack space="space-600">
  {/* Section 1 */}
  <Stack space="space-300">
    <Heading level={2}>Personal Information</Heading>
    <Grid columns={12} gap="space-250">
      <GridItem span={12} spanMd={6}>
        <FormField label="First Name" />
      </GridItem>
      <GridItem span={12} spanMd={6}>
        <FormField label="Last Name" />
      </GridItem>
      <GridItem span={12}>
        <FormField label="Email" />
      </GridItem>
    </Grid>
  </Stack>

  {/* Section 2 */}
  <Stack space="space-300">
    <Heading level={2}>Address</Heading>
    <Grid columns={12} gap="space-250">
      <GridItem span={12}>
        <FormField label="Street" />
      </GridItem>
      <GridItem span={12} spanMd={8}>
        <FormField label="City" />
      </GridItem>
      <GridItem span={12} spanMd={4}>
        <FormField label="Zip" />
      </GridItem>
    </Grid>
  </Stack>

  {/* Actions */}
  <Inline space="space-150" justify="end">
    <Button variant="outline">Cancel</Button>
    <Button>Submit</Button>
  </Inline>
</Stack>
```

### Dashboard Grid

```tsx
<Container maxWidth="2xl" padding="margin">
  <Stack space="space-600">
    <Heading level={1}>Dashboard</Heading>

    {/* Stats row */}
    <Grid columns={12} gap="space-300">
      <GridItem span={12} spanSm={6} spanLg={3}>
        <StatCard title="Revenue" value="$45,231" />
      </GridItem>
      <GridItem span={12} spanSm={6} spanLg={3}>
        <StatCard title="Users" value="2,350" />
      </GridItem>
      <GridItem span={12} spanSm={6} spanLg={3}>
        <StatCard title="Orders" value="1,234" />
      </GridItem>
      <GridItem span={12} spanSm={6} spanLg={3}>
        <StatCard title="Growth" value="+12%" />
      </GridItem>
    </Grid>

    {/* Main content area */}
    <Grid columns={12} gap="space-400">
      <GridItem span={12} spanLg={8}>
        <ChartCard />
      </GridItem>
      <GridItem span={12} spanLg={4}>
        <ActivityFeed />
      </GridItem>
    </Grid>
  </Stack>
</Container>
```

---

## Related Documentation

- **Spacing System:** `/docs/atlassian-spacing-grid-system.md`
- **Phase 5 Complete:** `/docs/plans/phase-5-spacing-grid-complete.md`
- **Token Reference:** `/packages/ui/src/styles/globals.css`
- **Component Source:** `/packages/ui/src/components/primitives/`

---

**Version:** 1.0
**Last Updated:** November 12, 2025
**Status:** ✅ Complete & Ready for Use
