# Typography Migration Guide

**Version**: 1.0.0
**Date**: 2025-11-12
**Status**: Active

## Overview

This guide provides step-by-step instructions for migrating from manual Tailwind typography classes to semantic typography components. The migration is **gradual and non-breaking** - old and new systems coexist.

## Table of Contents

1. [Migration Strategy](#migration-strategy)
2. [Before You Start](#before-you-start)
3. [Component Mappings](#component-mappings)
4. [Migration Patterns](#migration-patterns)
5. [Common Scenarios](#common-scenarios)
6. [Testing Checklist](#testing-checklist)
7. [Troubleshooting](#troubleshooting)

---

## Migration Strategy

### Gradual Adoption (Recommended)

**Phase 1**: ✅ Infrastructure complete (Phases 1-3 done)

- Design tokens implemented
- Components created and tested
- Documentation written

**Phase 2**: 🔄 Current - Selective migration

- New features use components
- High-priority pages migrate first
- Existing code continues working

**Phase 3**: 🔮 Future - Widespread adoption

- ESLint rules encourage components
- Developer education and training
- Component gallery/Storybook

**Phase 4**: 🔮 Long-term - Consistency enforcement

- Optional: Deprecate manual Tailwind for typography
- Codebase-wide consistency

### Priority Order

Migrate in this order for maximum impact:

1. **New features** - Always use components
2. **Dashboard pages** - High visibility, frequent use
3. **Login/auth pages** - Critical user journey
4. **Workspace pages** - Core functionality
5. **Settings pages** - Lower priority
6. **Modals/dialogs** - Incremental updates
7. **Legacy pages** - As needed during refactors

---

## Before You Start

### Prerequisites

1. **Verify package exports**:

   ```bash
   # Check that @workspace/ui exports typography components
   cat packages/ui/package.json | grep "components/typography"
   ```

2. **Import in your component**:

   ```tsx
   import { Heading, Text, Code, Metric } from '@workspace/ui/components/typography';
   ```

3. **Check for conflicts**:
   - Search for custom `Heading`, `Text`, `Code`, or `Metric` components in your codebase
   - Rename if conflicts exist

### Backward Compatibility

**No breaking changes!** The migration is opt-in:

- ✅ Old Tailwind classes continue working
- ✅ Can mix old and new in same file
- ✅ No forced timeline for migration
- ✅ No runtime errors from non-migrated code

---

## Component Mappings

### Heading Component

| Old (Tailwind)                            | New (Component)       | Notes                    |
| ----------------------------------------- | --------------------- | ------------------------ |
| `<h1 className="text-3xl font-bold">`     | `<Heading level={1}>` | Auto-applies all tokens  |
| `<h2 className="text-2xl font-semibold">` | `<Heading level={2}>` | Semibold weight built-in |
| `<h3 className="text-xl font-semibold">`  | `<Heading level={3}>` | Responsive scaling       |
| `<h4 className="text-lg font-medium">`    | `<Heading level={4}>` | Medium weight default    |
| `<h5 className="text-base font-medium">`  | `<Heading level={5}>` | Smallest heading         |
| `<h6 className="text-sm font-medium">`    | `<Heading level={6}>` | Rarely used              |

**Visual/semantic decoupling**:

```tsx
// OLD: Styled as H2, but semantic H1 (SEO hack)
<h1 className="text-2xl font-semibold">Page Title</h1>

// NEW: Explicit separation of style and semantics
<Heading level={2} as="h1">Page Title</Heading>
```

### Text Component

| Old (Tailwind)                            | New (Component)                                  | Notes            |
| ----------------------------------------- | ------------------------------------------------ | ---------------- |
| `<p className="text-base">`               | `<Text>`                                         | Default size     |
| `<p className="text-lg">`                 | `<Text size="large">`                            | Emphasized body  |
| `<span className="text-sm">`              | `<Text size="small" as="span">`                  | Captions, labels |
| `<p className="font-medium">`             | `<Text weight="medium">`                         | Medium weight    |
| `<p className="font-semibold">`           | `<Text weight="semibold">`                       | More emphasis    |
| `<p className="text-muted-foreground">`   | `<Text color="muted">`                           | Muted color      |
| `<p className="text-destructive">`        | `<Text color="destructive">`                     | Error color      |
| `<label className="text-sm font-medium">` | `<Text as="label" size="small" weight="medium">` | Form labels      |

**Combining variants**:

```tsx
// OLD: Multiple Tailwind classes
<p className="text-lg font-semibold text-primary">
  Emphasized primary text
</p>

// NEW: Component props
<Text size="large" weight="semibold" color="primary">
  Emphasized primary text
</Text>
```

### Code Component

| Old (Tailwind)                                                        | New (Component)         | Notes                 |
| --------------------------------------------------------------------- | ----------------------- | --------------------- |
| `<code className="font-mono text-sm bg-muted px-1.5 py-0.5 rounded">` | `<Code>`                | Inline code (default) |
| `<pre className="bg-muted p-4 rounded-lg"><code>`                     | `<Code inline={false}>` | Block code            |

**Examples**:

```tsx
// OLD: Inline code
<p>
  Use the <code className="font-mono text-sm bg-muted px-1 rounded">useState</code> hook.
</p>

// NEW: Inline code
<Text>
  Use the <Code>useState</Code> hook.
</Text>

// OLD: Block code
<pre className="bg-muted p-4 rounded-lg border overflow-x-auto">
  <code className="font-mono text-sm">
    {codeString}
  </code>
</pre>

// NEW: Block code
<Code inline={false}>
  {codeString}
</Code>
```

### Metric Component

| Old (Tailwind)                                                                                                             | New (Component)                                             | Notes                          |
| -------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- | ------------------------------ |
| `<div><p className="text-2xl font-bold">1,234</p><span className="text-sm text-muted-foreground">Total Users</span></div>` | `<Metric size="medium" value={1234} label="Total Users" />` | Replaces value + label pattern |
| `<p className="text-4xl font-bold">99.9%</p>`                                                                              | `<Metric size="large" value="99.9%" />`                     | Dashboard KPI                  |
| `<span className="text-lg font-semibold">42</span>`                                                                        | `<Metric size="small" value={42} />`                        | Inline metric                  |

---

## Migration Patterns

### Pattern 1: Simple Heading Migration

**Before**:

```tsx
function DashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
      <h2 className="text-xl font-semibold mt-6">Recent Activity</h2>
    </div>
  );
}
```

**After**:

```tsx
import { Heading } from '@workspace/ui/components/typography';

function DashboardPage() {
  return (
    <div>
      <Heading level={1}>Dashboard Overview</Heading>
      <Heading level={2} className="mt-6">
        Recent Activity
      </Heading>
    </div>
  );
}
```

**Changes**:

- ✅ Removed `text-3xl`, `font-bold`, `tracking-tight` (automatic via tokens)
- ✅ Kept `className="mt-6"` for spacing (components accept className)
- ✅ Semantic `level` prop ensures correct HTML element

---

### Pattern 2: Text with Color Variants

**Before**:

```tsx
function ErrorMessage({ error }: { error: string }) {
  return (
    <div>
      <p className="text-sm font-medium text-destructive">{error}</p>
      <p className="text-xs text-muted-foreground mt-1">Please check your input and try again.</p>
    </div>
  );
}
```

**After**:

```tsx
import { Text } from '@workspace/ui/components/typography';

function ErrorMessage({ error }: { error: string }) {
  return (
    <div>
      <Text size="small" weight="medium" color="destructive">
        {error}
      </Text>
      <Text size="small" color="muted" className="mt-1">
        Please check your input and try again.
      </Text>
    </div>
  );
}
```

**Changes**:

- ✅ `text-sm` → `size="small"`
- ✅ `font-medium` → `weight="medium"`
- ✅ `text-destructive` → `color="destructive"`
- ✅ `text-muted-foreground` → `color="muted"`

---

### Pattern 3: Dashboard Metrics

**Before**:

```tsx
function DashboardStats() {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="rounded-lg border p-4">
        <p className="text-2xl font-bold">1,234</p>
        <span className="text-sm text-muted-foreground">Total Users</span>
      </div>
      <div className="rounded-lg border p-4">
        <p className="text-2xl font-bold text-primary">99.9%</p>
        <span className="text-sm text-muted-foreground">Uptime</span>
      </div>
      <div className="rounded-lg border p-4">
        <p className="text-2xl font-bold">42</p>
        <span className="text-sm text-muted-foreground">Active Projects</span>
      </div>
    </div>
  );
}
```

**After**:

```tsx
import { Metric } from '@workspace/ui/components/typography';

function DashboardStats() {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="rounded-lg border p-4">
        <Metric size="medium" value={1234} label="Total Users" />
      </div>
      <div className="rounded-lg border p-4">
        <Metric size="medium" value="99.9%" label="Uptime" valueClassName="text-primary" />
      </div>
      <div className="rounded-lg border p-4">
        <Metric size="medium" value={42} label="Active Projects" />
      </div>
    </div>
  );
}
```

**Changes**:

- ✅ Replaced value + label divs with single `<Metric>` component
- ✅ Used `valueClassName` for custom coloring
- ✅ Simplified markup significantly

---

### Pattern 4: Form Labels

**Before**:

```tsx
function LoginForm() {
  return (
    <form>
      <div>
        <label htmlFor="email" className="text-sm font-medium">
          Email Address
        </label>
        <input id="email" type="email" />
        <span className="text-xs text-muted-foreground">We'll never share your email</span>
      </div>
    </form>
  );
}
```

**After**:

```tsx
import { Text } from '@workspace/ui/components/typography';

function LoginForm() {
  return (
    <form>
      <div>
        <Text as="label" htmlFor="email" size="small" weight="medium">
          Email Address
        </Text>
        <input id="email" type="email" />
        <Text size="small" color="muted">
          We'll never share your email
        </Text>
      </div>
    </form>
  );
}
```

**Changes**:

- ✅ `<label>` → `<Text as="label">`
- ✅ Maintains `htmlFor` attribute for accessibility
- ✅ Helper text uses `color="muted"`

---

### Pattern 5: Mixed Content (Code + Text)

**Before**:

```tsx
function ApiDocs() {
  return (
    <div>
      <h2 className="text-xl font-semibold">API Reference</h2>
      <p className="text-base mt-2">
        Use the <code className="font-mono text-sm bg-muted px-1 rounded">fetchUsers()</code> function:
      </p>
      <pre className="bg-muted p-4 rounded-lg mt-4">
        <code className="font-mono text-sm">
          {`import { fetchUsers } from '@/api';

const users = await fetchUsers({
  page: 1,
  limit: 10
});`}
        </code>
      </pre>
    </div>
  );
}
```

**After**:

```tsx
import { Heading, Text, Code } from '@workspace/ui/components/typography';

function ApiDocs() {
  return (
    <div>
      <Heading level={2}>API Reference</Heading>
      <Text className="mt-2">
        Use the <Code>fetchUsers()</Code> function:
      </Text>
      <Code inline={false} className="mt-4">
        {`import { fetchUsers } from '@/api';

const users = await fetchUsers({
  page: 1,
  limit: 10
});`}
      </Code>
    </div>
  );
}
```

**Changes**:

- ✅ Inline `<Code>` for function names
- ✅ Block `<Code inline={false}>` for multi-line snippets
- ✅ Simplified styling logic

---

## Common Scenarios

### Scenario 1: Card Component

**Before**:

```tsx
function ProjectCard({ title, description, taskCount }) {
  return (
    <div className="rounded-lg border p-4">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground mt-2">{description}</p>
      <div className="flex items-center gap-2 mt-4">
        <span className="text-xl font-bold">{taskCount}</span>
        <span className="text-sm text-muted-foreground">tasks</span>
      </div>
    </div>
  );
}
```

**After**:

```tsx
import { Heading, Text, Metric } from '@workspace/ui/components/typography';

function ProjectCard({ title, description, taskCount }) {
  return (
    <div className="rounded-lg border p-4">
      <Heading level={3}>{title}</Heading>
      <Text size="small" color="muted" className="mt-2">
        {description}
      </Text>
      <Metric size="small" value={taskCount} label="tasks" className="mt-4" />
    </div>
  );
}
```

---

### Scenario 2: Empty State

**Before**:

```tsx
function EmptyState() {
  return (
    <div className="text-center py-12">
      <h3 className="text-xl font-semibold">No projects found</h3>
      <p className="text-sm text-muted-foreground mt-2">Create your first project to get started</p>
      <button className="mt-4">Create Project</button>
    </div>
  );
}
```

**After**:

```tsx
import { Heading, Text } from '@workspace/ui/components/typography';

function EmptyState() {
  return (
    <div className="text-center py-12">
      <Heading level={3}>No projects found</Heading>
      <Text size="small" color="muted" className="mt-2">
        Create your first project to get started
      </Text>
      <button className="mt-4">Create Project</button>
    </div>
  );
}
```

---

### Scenario 3: Vietnamese Content

**Before**:

```tsx
function WorkspacePage() {
  return (
    <div>
      <h1 className="text-3xl font-bold">Quản lý không gian làm việc</h1>
      <p className="text-base mt-2">Hệ thống quản lý công việc hiệu quả cho nhóm của bạn</p>
    </div>
  );
}
```

**After**:

```tsx
import { Heading, Text } from '@workspace/ui/components/typography';

function WorkspacePage() {
  return (
    <div>
      <Heading level={1}>Quản lý không gian làm việc</Heading>
      <Text className="mt-2">Hệ thống quản lý công việc hiệu quả cho nhóm của bạn</Text>
    </div>
  );
}
```

**What happens automatically**:

- ✅ Line heights increase by 8-13% (when `lang="vi"`)
- ✅ Font weights reduce from 700 to 600 for headings
- ✅ Letter spacing normalized
- ✅ All 134 Vietnamese characters render correctly

**Set language in HTML**:

```html
<!-- In index.html or dynamically -->
<html lang="vi"></html>
```

---

## Testing Checklist

After migrating a component, verify:

### Visual Testing

- [ ] Typography matches design specs (size, weight, color)
- [ ] Spacing/margins preserved from old implementation
- [ ] Responsive scaling works at 1024px and 1280px breakpoints
- [ ] Dark mode toggle switches colors correctly
- [ ] Vietnamese diacritics don't clip (if applicable)

### Functional Testing

- [ ] No TypeScript errors
- [ ] Component renders without React warnings
- [ ] Accessibility: Heading hierarchy is correct (h1 → h2 → h3, no skips)
- [ ] Screen reader announces headings properly
- [ ] Custom `className` props still apply
- [ ] Refs work (if using `forwardRef` consumers)

### Browser Testing

- [ ] Chrome/Edge: Latest version
- [ ] Firefox: Latest version
- [ ] Safari: Latest version (macOS/iOS)
- [ ] Mobile: iOS Safari and Chrome

### Performance Testing

- [ ] No runtime errors in console
- [ ] Bundle size acceptable (components add ~4KB total)
- [ ] No performance regressions (React DevTools Profiler)

---

## Troubleshooting

### Issue: Components not found

**Error**: `Cannot find module '@workspace/ui/components/typography'`

**Solution**:

1. Verify package exports in `packages/ui/package.json`:

   ```json
   {
     "exports": {
       "./components/*": "./src/components/*.tsx"
     }
   }
   ```

2. Rebuild packages:

   ```bash
   pnpm --filter @workspace/ui build
   ```

3. Restart dev server:
   ```bash
   pnpm --filter web dev
   ```

---

### Issue: Typography doesn't match design tokens

**Symptom**: Text appears in default browser font, not design system font

**Solution**:

1. Ensure `globals.css` is imported in `main.tsx`:

   ```tsx
   import '@workspace/ui/globals.css';
   ```

2. Check that tokens are defined in `packages/ui/src/styles/globals.css`:

   ```bash
   grep "font-heading-h1-size" packages/ui/src/styles/globals.css
   ```

3. Clear browser cache and hard refresh

---

### Issue: Vietnamese diacritics clipping

**Symptom**: Top/bottom of Vietnamese characters cut off

**Solution**:

1. Set `lang` attribute on `<html>`:

   ```tsx
   document.documentElement.lang = 'vi';
   ```

2. Verify Vietnamese overrides in `globals.css` (line 230+):
   ```css
   :root[lang='vi'] {
     --font-heading-h1-line-height: 3rem; /* Increased for diacritics */
   }
   ```

---

### Issue: TypeScript errors on props

**Error**: `Type '7' is not assignable to type 'HeadingLevel'`

**Solution**:
Heading levels are restricted to 1-6:

```tsx
// ❌ Wrong
<Heading level={7}>Title</Heading>

// ✅ Correct
<Heading level={1}>Title</Heading>
```

---

### Issue: Custom className not applied

**Symptom**: Spacing or custom classes ignored

**Solution**:
All components accept `className` prop:

```tsx
// ✅ Works
<Heading level={1} className="mt-8 text-primary">
  Title
</Heading>;

// ✅ Works with cn()
import { cn } from '@workspace/ui/lib/utils';

<Text className={cn('mt-4', isError && 'text-destructive')}>Message</Text>;
```

---

## Next Steps

1. **Start with new features**: Always use components for new code
2. **Identify high-priority pages**: Dashboard, login, workspace
3. **Migrate page by page**: Test thoroughly after each migration
4. **Update team guidelines**: Document component usage in team wiki
5. **Review pull requests**: Encourage component usage in code reviews

---

## Resources

- **Component API**: [`docs/typography-components.md`](./typography-components.md)
- **Design Tokens**: [`docs/typography-tokens.md`](./typography-tokens.md)
- **Vietnamese Guide**: [`docs/vietnamese-typography-guide.md`](./vietnamese-typography-guide.md)
- **Design System**: [`docs/design-system.md`](./design-system.md)

---

**Migration Status**: ✅ Ready for Phase 4 implementation
**Last Updated**: 2025-11-12
