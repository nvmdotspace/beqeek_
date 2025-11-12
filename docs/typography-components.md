# Typography Components

**Version**: 1.0.0
**Date**: 2025-11-12
**Status**: Active (Phase 3 Complete)

## Overview

Typography components provide a semantic, type-safe API for rendering text with design system tokens. All components automatically handle Vietnamese optimization, responsive scaling, and dark mode.

## Components

### Heading

Semantic heading component with 6 levels (h1-h6).

**Import**:

```tsx
import { Heading } from '@workspace/ui/components/typography';
```

**Props**:

```typescript
interface HeadingProps {
  level: 1 | 2 | 3 | 4 | 5 | 6; // Visual style and semantic element
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div' | 'span'; // Override HTML element
  children: React.ReactNode;
  className?: string;
}
```

**Examples**:

```tsx
// Page title (h1)
<Heading level={1}>Quản lý không gian làm việc</Heading>

// Section title (h2)
<Heading level={2}>Danh sách dự án</Heading>

// Card title (h3)
<Heading level={3}>Thông tin chi tiết</Heading>

// Visual/semantic decoupling for SEO
<Heading level={2} as="h1">
  Styled as H2, but semantic H1 for SEO
</Heading>

// With custom classes
<Heading level={1} className="text-primary">
  Custom colored heading
</Heading>
```

**Tokens Used**:

- `--font-heading-h{level}-size`
- `--font-heading-h{level}-line-height`
- `--font-heading-h{level}-weight`
- `--font-heading-h{level}-letter-spacing`
- `--font-heading-h{level}-family`

**Vietnamese Optimization**: Automatic when `lang="vi"`

**Responsive**: H1-H3 scale at 1024px (+10%) and 1280px (+15%)

---

### Text

Body text component with size, weight, and color variants.

**Import**:

```tsx
import { Text } from '@workspace/ui/components/typography';
```

**Props**:

```typescript
interface TextProps {
  size?: 'large' | 'default' | 'small'; // Font size
  weight?: 'regular' | 'medium' | 'semibold' | 'bold'; // Font weight
  color?: 'default' | 'muted' | 'primary' | 'secondary' | 'destructive' | 'accent';
  as?: 'p' | 'span' | 'div' | 'label'; // HTML element
  children: React.ReactNode;
  className?: string;
}
```

**Examples**:

```tsx
// Default paragraph
<Text>Standard body text for UI and forms</Text>

// Emphasized text
<Text size="large" weight="medium">
  Large, medium-weight text for emphasis
</Text>

// Helper text
<Text size="small" color="muted">
  Small, muted helper text or captions
</Text>

// Error message
<Text color="destructive" weight="medium">
  This field is required
</Text>

// Inline emphasis
<Text as="p">
  Regular text with <Text as="span" weight="semibold">bold emphasis</Text> inline.
</Text>

// Form label
<Text as="label" weight="medium" htmlFor="email">
  Email Address
</Text>
```

**Tokens Used**:

- `--font-body-{size}-size`
- `--font-body-{size}-line-height`
- `--font-weight-{weight}`
- Color tokens: `--foreground`, `--muted-foreground`, etc.

**Vietnamese Optimization**: Automatic when `lang="vi"`

---

### Code

Monospace code component for inline and block code snippets.

**Import**:

```tsx
import { Code } from '@workspace/ui/components/typography';
```

**Props**:

```typescript
interface CodeProps {
  inline?: boolean; // true = <code>, false = <pre><code>
  children: React.ReactNode;
  className?: string;
}
```

**Examples**:

```tsx
// Inline code
<Text>
  Use the <Code>useState</Code> hook for state management.
</Text>

// Block code
<Code inline={false}>{`
function greet(name: string) {
  return \`Hello, \${name}!\`;
}
`}</Code>

// JSON data display
<Code inline={false}>
  {JSON.stringify({ name: 'Beqeek', version: '1.0' }, null, 2)}
</Code>

// With custom styling
<Code className="bg-primary text-primary-foreground">
  Highlighted code
</Code>
```

**Tokens Used**:

- Inline: `--font-code-inline-*` (0.875em, line-height 1)
- Block: `--font-code-block-*` (0.875rem, line-height 1.5)
- Font family: `--font-family-code` (monospace)

**Styling**:

- Inline: Subtle `bg-muted` background with border
- Block: `<pre><code>` with padding, border, and scrollbar

---

### Metric

Numeric display component for dashboard KPIs and statistics.

**Import**:

```tsx
import { Metric } from '@workspace/ui/components/typography';
```

**Props**:

```typescript
interface MetricProps {
  size?: 'large' | 'medium' | 'small'; // Visual prominence
  value: React.ReactNode; // Numeric or formatted value
  label?: React.ReactNode; // Optional descriptive label
  as?: 'div' | 'span' | 'p';
  className?: string;
  valueClassName?: string; // Custom value styles
  labelClassName?: string; // Custom label styles
}
```

**Examples**:

```tsx
// Dashboard KPI
<Metric size="large" value={1234} label="Total Users" />

// Card statistic
<Metric size="medium" value="99.9%" label="Uptime" />

// Inline metric
<Metric size="small" value={42} label="Active" />

// Custom formatting with units
<Metric
  value={
    <>
      $1,234<sup className="text-sm">.99</sup>
    </>
  }
  label="Revenue"
/>

// Without label
<Metric value={1000} />

// With custom styling
<Metric
  value={95}
  label="Score"
  valueClassName="text-primary"
  labelClassName="text-muted-foreground"
/>

// Vietnamese content
<Metric value={1234} label="Tổng người dùng" />
```

**Tokens Used**:

- `--font-metric-{size}-size`
- `--font-metric-{size}-line-height`
- `--font-metric-{size}-weight` (600 semibold)
- `--font-metric-{size}-letter-spacing` (negative for tighter spacing)

**Layout**: Flexbox column with gap between value and label

**Vietnamese Optimization**: Automatic when `lang="vi"`

---

## Migration Guide

### From Tailwind Classes to Components

**Before** (Phase 2 - Hardcoded Tailwind):

```tsx
<h1 className="text-3xl font-bold tracking-tight">
  Quản lý không gian làm việc
</h1>

<p className="text-2xl font-bold">1,234</p>

<span className="text-sm text-muted-foreground">Helper text</span>

<code className="text-sm font-mono">const example = true;</code>
```

**After** (Phase 3 - Semantic Components):

```tsx
<Heading level={1}>
  Quản lý không gian làm việc
</Heading>

<Metric size="medium" value={1234} />

<Text size="small" color="muted">Helper text</Text>

<Code>const example = true;</Code>
```

### Gradual Migration Strategy

1. **New code**: Use new components
2. **Existing code**: Continue using Tailwind (no rush)
3. **High-priority pages**: Migrate incrementally (dashboard, login)
4. **Phase 4**: Add ESLint rules to encourage new pattern

**No breaking changes** - old and new systems coexist!

---

## Common Patterns

### Page Layout

```tsx
function DashboardPage() {
  return (
    <div>
      {/* Page title */}
      <Heading level={1}>Dashboard Overview</Heading>

      {/* Section with metrics */}
      <section>
        <Heading level={2}>Key Performance Indicators</Heading>
        <div className="grid grid-cols-4 gap-4">
          <Metric size="large" value={1234} label="Total Users" />
          <Metric size="large" value="99.9%" label="Uptime" />
          <Metric size="large" value={42} label="Active Projects" />
          <Metric size="large" value="2.5s" label="Avg Response" />
        </div>
      </section>

      {/* Body content */}
      <Text>
        Welcome to the dashboard. Here you can monitor all your key metrics and manage your workspace efficiently.
      </Text>
    </div>
  );
}
```

### Card Component

```tsx
function ProjectCard({ title, description, stats }) {
  return (
    <div className="rounded-lg border p-4">
      {/* Card title */}
      <Heading level={3}>{title}</Heading>

      {/* Description */}
      <Text color="muted" className="mt-2">
        {description}
      </Text>

      {/* Inline metric */}
      <div className="mt-4">
        <Metric size="small" value={stats.tasks} label="Tasks" />
      </div>
    </div>
  );
}
```

### Form with Labels

```tsx
function LoginForm() {
  return (
    <form>
      {/* Form title */}
      <Heading level={2}>Sign In</Heading>

      {/* Email field */}
      <div>
        <Text as="label" weight="medium" htmlFor="email">
          Email Address
        </Text>
        <input id="email" type="email" className="..." />
        <Text size="small" color="muted">
          We'll never share your email
        </Text>
      </div>

      {/* Error message */}
      <Text color="destructive" weight="medium">
        Invalid credentials
      </Text>

      <button type="submit">Sign In</button>
    </form>
  );
}
```

### Documentation with Code

```tsx
function ApiDocs() {
  return (
    <div>
      {/* Section heading */}
      <Heading level={2}>API Reference</Heading>

      {/* Description */}
      <Text>
        Use the <Code>fetchUsers()</Code> function to retrieve all users:
      </Text>

      {/* Block code example */}
      <Code inline={false}>{`
import { fetchUsers } from '@/api';

const users = await fetchUsers({
  page: 1,
  limit: 10
});
      `}</Code>

      {/* Note */}
      <Text size="small" color="muted">
        Response time typically under 100ms
      </Text>
    </div>
  );
}
```

---

## TypeScript Integration

All components are fully typed with TypeScript:

```tsx
import type { HeadingProps, TextProps, CodeProps, MetricProps } from '@workspace/ui/components/typography';

// Type-safe props
const headingProps: HeadingProps = {
  level: 1, // Type error if not 1-6
  children: 'Title',
};

// Exhaustive color options
const textColor: TextProps['color'] = 'muted'; // Autocomplete suggests all options

// Size variants
const metricSize: MetricProps['size'] = 'large'; // 'large' | 'medium' | 'small'
```

**Benefits**:

- ✅ Autocomplete for all props
- ✅ Type errors for invalid values
- ✅ JSDoc documentation in IDE
- ✅ Refactoring safety

---

## Vietnamese Language Support

All components automatically optimize for Vietnamese when `document.documentElement.lang === 'vi'`:

**HTML Setup**:

```html
<html lang="vi">
  <!-- Components auto-optimize -->
</html>
```

**Dynamic Language Switching**:

```tsx
// App-level language switcher
function LanguageSwitcher() {
  const setLanguage = (lang: 'en' | 'vi') => {
    document.documentElement.lang = lang;
  };

  return (
    <select onChange={(e) => setLanguage(e.target.value)}>
      <option value="en">English</option>
      <option value="vi">Tiếng Việt</option>
    </select>
  );
}
```

**Optimizations Applied**:

- ✅ Increased line-height (+8-13%)
- ✅ Reduced font-weight for headings (700 → 600)
- ✅ Normalized letter-spacing
- ✅ All 134 Vietnamese characters render correctly

**No Props Needed** - Optimization is automatic based on `lang` attribute!

---

## Accessibility

All components follow WCAG 2.1 AA standards:

**Semantic HTML**:

```tsx
// ✅ Good - Semantic HTML with proper hierarchy
<Heading level={1}>Page Title</Heading>
<Heading level={2}>Section Title</Heading>

// ❌ Bad - Non-semantic divs
<div className="text-3xl font-bold">Page Title</div>
```

**Color Contrast**:

- Text colors use design tokens with 4.5:1 contrast minimum
- `color="muted"` maintains 4.5:1 ratio
- `color="destructive"` maintains 4.5:1 ratio

**Keyboard Navigation**:

- Components render semantic HTML (h1-h6, p, code, etc.)
- Screen readers announce heading levels correctly
- Focus management handled by browser

**ARIA Labels** (when needed):

```tsx
// Icon-only metric
<Metric
  value={42}
  aria-label="42 active users"
  aria-describedby="active-users-description"
/>
<Text id="active-users-description" className="sr-only">
  Number of currently active users in the system
</Text>
```

---

## Performance

**Bundle Size Impact**:

- Heading: ~1KB minified
- Text: ~1KB minified
- Code: ~1KB minified
- Metric: ~1KB minified
- **Total**: ~4KB for all 4 components

**Runtime Performance**:

- Zero overhead (thin wrappers around native elements)
- CSS custom properties resolve at ~0.1ms (negligible)
- No JavaScript computation required

**Tree Shaking**:

```tsx
// Only imports what you use
import { Heading, Text } from '@workspace/ui/components/typography';
// Code and Metric NOT included in bundle
```

---

## Browser Support

- ✅ Chrome/Edge 89+
- ✅ Firefox 96+
- ✅ Safari 15.4+
- ✅ iOS Safari 15.4+
- ✅ All modern browsers (2021+)

Components use CSS custom properties (widely supported, no polyfill needed).

---

## Best Practices

### DO ✅

- Use semantic levels (`<Heading level={1}>` for page titles)
- Leverage type-safe props (TypeScript will guide you)
- Use `as` prop for visual/semantic decoupling when needed
- Test with Vietnamese diacritics
- Combine with design system color utilities

### DON'T ❌

- Hardcode font sizes via inline styles (breaks theming)
- Skip semantic HTML (use `<Heading>` not `<div className="text-3xl">`)
- Override tokens with `!important` (use className prop)
- Nest headings incorrectly (h1 → h3 skips h2)

---

## Troubleshooting

### Issue: Component not applying tokens

**Symptom**: Text appears in default browser font
**Cause**: Tokens not loaded
**Solution**:

```tsx
// Ensure globals.css is imported in main.tsx
import '@workspace/ui/globals.css';
```

### Issue: Vietnamese optimization not working

**Symptom**: Diacritics clipped or font weight too heavy
**Cause**: `lang` attribute not set
**Solution**:

```tsx
// Set in index.html or app root
document.documentElement.lang = 'vi';
```

### Issue: TypeScript errors on import

**Symptom**: Cannot find module '@workspace/ui/components/typography'
**Cause**: Package exports misconfigured
**Solution**: Check `packages/ui/package.json` exports field includes `./components/*`

---

## Migration Examples

### Example 1: Dashboard Page

**Before**:

```tsx
<div>
  <h1 className="text-3xl font-bold">Dashboard</h1>
  <p className="text-2xl font-bold">1,234</p>
  <span className="text-sm text-gray-500">Total Users</span>
</div>
```

**After**:

```tsx
<div>
  <Heading level={1}>Dashboard</Heading>
  <Metric size="medium" value={1234} label="Total Users" />
</div>
```

### Example 2: Error Messages

**Before**:

```tsx
{
  error && <div className="text-sm font-medium text-red-500">{error.message}</div>;
}
```

**After**:

```tsx
{
  error && (
    <Text size="small" weight="medium" color="destructive">
      {error.message}
    </Text>
  );
}
```

### Example 3: Code Documentation

**Before**:

```tsx
<p>
  Use <span className="font-mono text-sm bg-gray-100 px-1 rounded">useState</span> for state.
</p>
```

**After**:

```tsx
<Text>
  Use <Code>useState</Code> for state.
</Text>
```

---

## Next Steps

**Phase 4** (Migration & Documentation):

- Update design system docs
- Create visual component gallery
- Add ESLint rules to encourage component usage
- Migrate high-priority pages (dashboard, login)

---

**Component Status**: ✅ Production Ready
**Phase 3**: Complete
**Ready for Phase 4**: Yes
