# Layout Primitives Migration Research

**Research Date**: 2025-11-17
**Focus**: Migrating from hardcoded Tailwind spacing to Layout Primitives system

## 1. Migration Patterns

### Bottom-Up Approach (Recommended)

- **Start small**: Begin with core UI components (Button, Link, Alert) — encapsulated, frequently reused
- **Gradual rollout**: Component-by-component, NOT big-bang rewrite
- **Order**: UI primitives → composite components → feature layouts → pages

### Pattern Examples

```tsx
// ❌ BEFORE: Hardcoded Tailwind spacing
<div className="flex gap-4 p-6">
  <Button className="mt-2">Click</Button>
</div>

// ✅ AFTER: Layout primitives
<Stack gap="4" padding="6">
  <Button>Click</Button>
</Stack>
```

```tsx
// ❌ BEFORE: Mixed spacing utilities
<div className="space-y-6 px-8">
  <Header />
  <Content className="mb-4" />
</div>

// ✅ AFTER: Semantic primitives
<Stack gap="6" paddingInline="8">
  <Header />
  <Content />
</Stack>
```

### Key Principles

1. **Eliminate margin**: Convert `margin` to container `padding` or flex/grid `gap`
2. **Use semantic props**: `paddingInline`, `paddingBlock` instead of `px-*`, `py-*`
3. **Co-locate spacing**: Keep spacing decisions at container level, not child level

## 2. Edge Cases (When NOT to Use Primitives)

### Scenarios to Avoid Primitives

1. **Pixel-perfect designs**: One-off spacing (e.g., `pt-[23px]` for optical alignment)

   ```tsx
   // Use Tailwind directly for non-standard spacing
   <Icon className="translate-y-[2px]" /> {/* Optical centering */}
   ```

2. **Animation/transition targets**: CSS transitions need stable class names

   ```tsx
   // Primitives may generate dynamic classes
   <motion.div className="p-4 transition-all" /> {/* Keep direct */}
   ```

3. **Third-party integration**: Libraries expecting specific class structures

   ```tsx
   // Some chart libraries scan className for dimensions
   <Chart className="w-full h-96" /> {/* Don't wrap */}
   ```

4. **Responsive breakpoints**: Complex breakpoint-specific spacing

   ```tsx
   // Tailwind: sm:gap-2 md:gap-4 lg:gap-8
   // If primitives don't support responsive props, use Tailwind
   ```

5. **Legacy code in migration**: Keep existing patterns during gradual migration

### Migration Exceptions

- **Global layouts**: System-level spacing (app shell, nav) — migrate last
- **Complex grids**: CSS Grid with named areas — may need custom classes
- **Print styles**: `@media print` spacing — keep in CSS

## 3. Performance Implications

### Runtime Performance

✅ **NO RUNTIME PENALTY** — Polymorphic `as` prop has zero runtime overhead

- Wrapper components compile to same React elements as direct usage
- Modern bundlers eliminate wrapper abstractions during build

### TypeScript Performance

⚠️ **TS SERVER SLOWDOWN** — Complex polymorphic types strain tsserver

- Issue: Generic constraints on `as` prop cause type-checking delays
- Impact: Slower IntelliSense in large codebases (500+ components)
- Mitigation:
  - Use `asChild` pattern (Radix approach) instead of `as` prop
  - Limit polymorphic depth (avoid nesting polymorphic components)
  - Cache type definitions for common element types

### Bundle Size

- Negligible: ~2-5KB for full primitive system (gzipped)
- Tree-shaking: Only imported primitives bundled

### Recommendations

1. **Measure first**: Run Lighthouse before/after migration
2. **Monitor TS performance**: Track `tsserver` memory usage in large files
3. **Avoid over-abstraction**: Don't wrap primitives in more wrappers

## 4. TypeScript Type Safety

### Polymorphic `as` Prop Pattern

```tsx
// ✅ Type-safe polymorphic component
type PolymorphicProps<T extends React.ElementType> = {
  as?: T;
  gap?: '1' | '2' | '4' | '6' | '8';
  children: React.ReactNode;
} & Omit<React.ComponentPropsWithoutRef<T>, 'as' | 'gap'>;

export const Stack = <T extends React.ElementType = 'div'>({
  as,
  gap,
  ...props
}: PolymorphicProps<T>) => {
  const Component = as || 'div';
  return <Component data-gap={gap} {...props} />;
};

// Usage: Full type inference
<Stack as="section" aria-labelledby="title"> {/* Knows section props */}
<Stack as={Link} to="/path"> {/* Knows Link props */}
```

### forwardRef + Generics (Complex)

```tsx
// Type annotation approach (most compatible)
type BoxProps<T extends React.ElementType> = PolymorphicProps<T> & {
  ref?: React.Ref<any>;
};

export const Box = React.forwardRef(
  <T extends React.ElementType = 'div'>({ as, ...props }: BoxProps<T>, ref: React.Ref<any>) => {
    const Component = as || 'div';
    return <Component ref={ref} {...props} />;
  },
) as <T extends React.ElementType = 'div'>(props: BoxProps<T>) => React.ReactElement;
```

### Alternative: `asChild` Pattern (Radix/Radix Themes)

```tsx
// Simpler TypeScript, better composition
<Stack gap="4" asChild>
  <Link to="/path">Content</Link>
</Stack>;

// Implementation (merges props onto child)
if (asChild && React.isValidElement(children)) {
  return React.cloneElement(children, { ...props, ...children.props });
}
```

### Type Safety Checklist

- ✅ Use `React.ComponentPropsWithoutRef<T>` for prop inheritance
- ✅ Omit conflicting keys (`as`, custom props) from element props
- ✅ Provide default element type (`= 'div'`)
- ✅ Test with `<Component as={CustomComponent} customProp="..." />`
- ⚠️ Avoid deep polymorphic nesting (TS performance)

## 5. Testing Strategy

### Visual Regression Testing (Percy + Storybook)

**Setup**:

```bash
pnpm add -D @percy/cli @percy/storybook
```

**Workflow**:

1. **Baseline snapshots**: Generate before migration starts
2. **Component-level testing**: Test primitives in isolation + compositions
3. **CI integration**: Block PRs with visual regressions

**Example Storybook stories**:

```tsx
export const AllSpacingVariants: Story = {
  render: () => (
    <Stack gap="1">
      {['1', '2', '4', '6', '8'].map((gap) => (
        <Stack key={gap} gap={gap}>
          <Box>Item 1</Box>
          <Box>Item 2</Box>
        </Stack>
      ))}
    </Stack>
  ),
};
```

### Unit Tests (React Testing Library)

```tsx
describe('Stack primitive', () => {
  it('applies correct gap class', () => {
    const { container } = render(
      <Stack gap="4">
        <div>Child</div>
      </Stack>,
    );
    expect(container.firstChild).toHaveAttribute('data-gap', '4');
  });

  it('forwards polymorphic props', () => {
    render(
      <Stack as="section" aria-label="Test">
        Content
      </Stack>,
    );
    expect(screen.getByRole('region')).toBeInTheDocument();
  });
});
```

### Integration Tests

```tsx
// Test spacing changes don't break layouts
it('maintains card grid spacing after migration', () => {
  render(<CardGrid />);
  const cards = screen.getAllByTestId('card');
  const gap = cards[1].getBoundingClientRect().left - cards[0].getBoundingClientRect().right;
  expect(gap).toBe(16); // 1rem = 16px
});
```

### Testing Checklist

- [ ] Storybook stories for all spacing variants
- [ ] Percy baseline snapshots captured
- [ ] Responsive breakpoint tests (sm/md/lg)
- [ ] Dark mode spacing consistency
- [ ] Accessibility: Sufficient touch targets (44px min)
- [ ] Edge cases: Empty states, single items, overflow

## 6. Common Pitfalls

### 1. Margin Leakage

```tsx
// ❌ WRONG: Child applies margin (leaks outside container)
<Card>
  <Button className="mt-4">Action</Button>
</Card>

// ✅ CORRECT: Parent controls spacing
<Stack gap="4">
  <Card />
  <Button>Action</Button>
</Stack>
```

### 2. Mixing Systems

```tsx
// ❌ WRONG: Mixing Tailwind + primitives creates duplication
<Stack gap="4" className="space-y-6">

// ✅ CORRECT: Choose one system
<Stack gap="6">
```

### 3. Over-Abstraction

```tsx
// ❌ WRONG: Unnecessary wrapper layers
<Stack>
  <Stack>
    <CustomStack>
      <div>Content</div>

// ✅ CORRECT: Minimal layers
<Stack gap="4">
  <div>Content</div>
```

### 4. Ignoring Responsive Design

```tsx
// ❌ WRONG: Fixed spacing on all screens
<Stack gap="8"> {/* Too large on mobile */}

// ✅ CORRECT: Responsive spacing (if supported)
<Stack gap={{ base: '4', md: '8' }}>
```

### 5. Breaking Existing Layouts

```tsx
// Migration safety: Test before/after
// Use data attributes for gradual rollout
<div data-layout="legacy" className="p-4"> {/* Old */}
<Stack data-layout="primitive" padding="4"> {/* New */}
```

### 6. TypeScript Type Assertion Abuse

```tsx
// ❌ WRONG: Losing type safety
const props = stackProps as any;

// ✅ CORRECT: Proper generic inference
<Stack<'section'> as="section" {...sectionProps} />;
```

## Summary Recommendations

1. **Migrate incrementally**: UI components → layouts → pages
2. **Eliminate margins**: Use container `padding` and `gap`
3. **Visual regression test**: Percy + Storybook baseline snapshots
4. **Avoid primitives for**: One-off spacing, complex grids, third-party libs
5. **Performance**: Zero runtime cost, minor TS overhead (use `asChild` if slow)
6. **TypeScript**: Use `asChild` pattern over complex `as` prop generics
7. **Testing**: Snapshot all spacing variants, test responsive breakpoints
8. **Branch-based migration**: Don't migrate piecemeal in production

## Unresolved Questions

1. **Responsive prop support**: Does primitive system support breakpoint-specific spacing (e.g., `gap={{ sm: '2', lg: '6' }}`)?
2. **CSS Grid compatibility**: How to handle `grid-template-areas` with primitives?
3. **Animation library integration**: Compatibility with Framer Motion layout animations?
4. **Migration tooling**: Automated codemod for Tailwind → primitives conversion?
5. **Performance benchmarks**: Actual tsserver impact on codebase size (500-5000 components)?
