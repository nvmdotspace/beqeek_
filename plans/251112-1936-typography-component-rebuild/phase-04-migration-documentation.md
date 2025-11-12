# Phase 04: Migration & Documentation

**Duration**: 3 days
**Dependencies**: Phase 03 (Component Implementation)
**Status**: Draft

## Objectives

1. Create migration guide for existing code
2. Update design system documentation
3. Build visual component gallery
4. Migrate high-priority pages
5. Establish linting rules for new code

## Tasks

### Task 4.1: Migration Guide (4 hours)

**Goal**: Document migration path from ad-hoc Tailwind classes to Typography components

**File**: `docs/migration/typography-migration.md`

**Content Structure:**

````markdown
# Typography Migration Guide

## Overview

Migrate from ad-hoc Tailwind utilities to semantic Typography components.

## Migration Mapping

### Headings

**Before:**

```tsx
<h1 className="text-3xl font-bold leading-tight">Page Title</h1>
<h2 className="text-2xl font-semibold">Section Title</h2>
<h3 className="text-xl font-semibold">Subsection</h3>
```
````

**After:**

```tsx
<Heading level="display">Page Title</Heading>
<Heading level="large">Section Title</Heading>
<Heading level="medium">Subsection</Heading>
```

**Benefits:**

- Semantic HTML mapping automatic
- Design token integration
- Responsive scaling built-in
- Vietnamese optimization included

### Body Text

**Before:**

```tsx
<p className="text-base leading-normal">Regular text</p>
<span className="text-sm text-muted-foreground">Helper text</span>
<p className="text-lg leading-relaxed">Long-form content</p>
```

**After:**

```tsx
<Text>Regular text</Text>
<Text size="small" color="muted">Helper text</Text>
<Text size="large">Long-form content</Text>
```

### Code Snippets

**Before:**

```tsx
<code className="font-mono text-sm bg-muted px-1.5 py-0.5 rounded">npm install</code>

<pre className="font-mono text-sm bg-muted p-4 rounded-lg overflow-x-auto">
  <code>const example = 'code';</code>
</pre>
```

**After:**

```tsx
<Code>npm install</Code>

<Code block>
  const example = 'code';
</Code>
```

### Metrics/Stats

**Before:**

```tsx
<div>
  <div className="text-4xl font-bold">1,234</div>
  <div className="text-sm text-muted-foreground">Total Users</div>
</div>
```

**After:**

```tsx
<Metric size="large" value={1234} label="Total Users" />
```

## Migration Strategy

### Phase 1: New Features (Week 1)

- Use new Typography components for all new code
- Add to component guidelines

### Phase 2: High-Traffic Pages (Week 2-3)

- Migrate dashboard, workspace list, table detail
- Focus on user-facing pages

### Phase 3: Gradual Migration (Ongoing)

- Update pages as they're modified
- No forced rewrite of working code

### Phase 4: Deprecation (3 months)

- Add linting rules to discourage raw classes
- Update component library examples

## Common Patterns

### Pattern 1: Page Titles with Actions

**Before:**

```tsx
<div className="flex items-center justify-between">
  <h1 className="text-3xl font-bold">Dashboard</h1>
  <Button>New Table</Button>
</div>
```

**After:**

```tsx
<div className="flex items-center justify-between">
  <Heading level="display">Dashboard</Heading>
  <Button>New Table</Button>
</div>
```

### Pattern 2: Card Headers

**Before:**

```tsx
<CardHeader>
  <h3 className="text-xl font-semibold">Card Title</h3>
  <p className="text-sm text-muted-foreground">Card description</p>
</CardHeader>
```

**After:**

```tsx
<CardHeader>
  <Heading level="small">Card Title</Heading>
  <Text size="small" color="muted">
    Card description
  </Text>
</CardHeader>
```

### Pattern 3: Form Labels

**Before:**

```tsx
<label className="text-sm font-medium" htmlFor="email">
  Email Address
</label>
```

**After:**

```tsx
<Text as="label" weight="medium" htmlFor="email">
  Email Address
</Text>
```

## Troubleshooting

### Issue: Visual hierarchy mismatch

**Problem:** Need h1 element but styled as h3
**Solution:** Use `as` prop

```tsx
<Heading level="medium" as="h1">
  Smaller h1
</Heading>
```

### Issue: Custom styling needed

**Problem:** Need additional Tailwind classes
**Solution:** Use `className` prop

```tsx
<Heading level="large" className="text-primary underline">
  Custom Styled
</Heading>
```

### Issue: Vietnamese text too tight

**Problem:** Diacritics clipping
**Solution:** Increase line-height

```tsx
<Text size="large" style={{ lineHeight: '1.75' }}>
  Nội dung tiếng Việt
</Text>
```

## Automated Migration

### Codemod (Optional)

```bash
# Install jscodeshift
pnpm add -D jscodeshift

# Run codemod
npx jscodeshift -t scripts/codemods/typography-migrate.ts apps/web/src
```

**Codemod**: `scripts/codemods/typography-migrate.ts`

```typescript
// Transform simple heading patterns
export default function transform(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);

  // Transform <h1 className="text-3xl font-bold"> → <Heading level="display">
  root
    .find(j.JSXElement, {
      openingElement: { name: { name: 'h1' } },
    })
    .forEach((path) => {
      const classNameAttr = path.value.openingElement.attributes.find((attr) => attr.name?.name === 'className');

      if (classNameAttr?.value?.value?.includes('text-3xl') && classNameAttr?.value?.value?.includes('font-bold')) {
        // Replace with Heading component
        path.value.openingElement.name.name = 'Heading';
        path.value.closingElement.name.name = 'Heading';

        // Add level prop
        path.value.openingElement.attributes = [
          j.jsxAttribute(j.jsxIdentifier('level'), j.stringLiteral('display')),
          ...path.value.openingElement.attributes.filter((attr) => attr.name?.name !== 'className'),
        ];
      }
    });

  return root.toSource();
}
```

## Checklist

Before marking migration complete:

- [ ] Import Typography components from @workspace/ui
- [ ] Replace heading elements with <Heading>
- [ ] Replace paragraph/span text with <Text>
- [ ] Replace code snippets with <Code>
- [ ] Replace metrics/stats with <Metric>
- [ ] Test Vietnamese character rendering
- [ ] Verify responsive behavior
- [ ] Check dark mode appearance
- [ ] Run accessibility audit (axe DevTools)
- [ ] Update component tests

````

**Acceptance**:
- [ ] Migration guide complete with 10+ examples
- [ ] Common patterns documented
- [ ] Troubleshooting section
- [ ] Optional codemod script

### Task 4.2: Design System Documentation (3 hours)

**Goal**: Update design-system.md with new Typography system

**File**: `docs/design-system.md`

**Updates:**

```markdown
## Typography

Beqeek's typography system uses semantic components built on Atlassian Design System principles.

### Font Families

**Sans-serif**: Geist Sans (default)
- Optimized for UI text and Vietnamese diacritics
- Variable font (100-900 weights)
- Fallback: Inter, system-ui, -apple-system

**Monospace**: Geist Mono (code)
- Technical content and code snippets
- Variable font (100-900 weights)
- Fallback: Menlo, Monaco, Consolas

### Typography Scale

**Headings** (6 semantic levels):
| Level | Size | Weight | Usage |
|-------|------|--------|-------|
| display | 2.25rem (36px) | Bold (700) | Page titles |
| large | 1.875rem (30px) | Semibold (600) | Section headers |
| medium | 1.5rem (24px) | Semibold (600) | Subsections |
| small | 1.25rem (20px) | Semibold (600) | Card headers |
| xsmall | 1.125rem (18px) | Medium (500) | Small headings |
| xxsmall | 1rem (16px) | Medium (500) | Inline headings |

**Body Text** (3 sizes):
| Size | Rem | Usage |
|------|-----|-------|
| large | 1rem (16px) | Long-form content, articles |
| default | 0.875rem (14px) | UI text, forms, buttons |
| small | 0.75rem (12px) | Captions, helper text, labels |

**Code/Monospace**:
- Inline: 0.875rem (14px), gray background, rounded
- Block: 0.875rem (14px), code block styling, scrollable

**Metrics/Data**:
- Large: 2rem (32px) - Dashboard KPIs
- Medium: 1.5rem (24px) - Card statistics
- Small: 1rem (16px) - Inline metrics

### Design Tokens

Typography design tokens are CSS custom properties:

```css
/* Heading tokens */
--font-heading-display-size: 2.25rem;
--font-heading-display-line-height: 1.2;
--font-heading-display-weight: 700;

/* Body tokens */
--font-body-default-size: 0.875rem;
--font-body-default-line-height: 1.5;
--font-body-default-weight: 400;

/* Code tokens */
--font-code-inline-size: 0.875rem;

/* Metric tokens */
--font-metric-large-size: 2rem;
````

### Components

#### Heading Component

```tsx
import { Heading } from '@workspace/ui/components/typography';

// Page title (renders <h1>)
<Heading level="display">Dashboard</Heading>

// Section header (renders <h2>)
<Heading level="large">Recent Activity</Heading>

// Subsection (renders <h3>)
<Heading level="medium">Table Settings</Heading>

// Custom color
<Heading level="small" color="primary">Highlighted</Heading>

// Visual hierarchy mismatch
<Heading level="medium" as="h1">Styled as h3 but semantically h1</Heading>
```

#### Text Component

```tsx
import { Text } from '@workspace/ui/components/typography';

// Default body text
<Text>Regular paragraph text</Text>

// Large text for articles
<Text size="large">Long-form content...</Text>

// Small caption
<Text size="small" color="muted">Helper text</Text>

// Truncated text
<Text truncate>Very long text that will be truncated...</Text>

// Line clamping
<Text lineClamp={3}>Multi-line text clamped to 3 lines...</Text>
```

#### Code Component

```tsx
import { Code } from '@workspace/ui/components/typography';

// Inline code
<Text>Run <Code>npm install</Code> to install dependencies</Text>

// Block code
<Code block>
  {`const config = {
  theme: 'dark',
  fontSize: 14,
};`}
</Code>
```

#### Metric Component

```tsx
import { Metric } from '@workspace/ui/components/typography';

// Simple metric
<Metric value={1234} label="Total Users" />

// With percentage
<Metric value={87.5} unit="%" label="Completion Rate" />

// With currency
<Metric value={49.99} unit="$" unitPosition="prefix" label="Revenue" />

// Colored
<Metric value={+12} color="success" label="Growth" />
```

### Vietnamese Typography

Vietnamese language requires additional spacing for diacritics:

**Optimizations:**

- Line-height increased to 1.625 (default) and 1.75 (large text)
- Medium weight (500) preferred over bold for headings
- All 134 Vietnamese characters supported

**Testing:**

```tsx
<Text>Các thanh điệu: á à ả ã ạ, é è ẻ ẽ ẹ, ơ ớ ờ ở ỡ ợ, ư ứ ừ ử ữ ự</Text>
```

### Responsive Typography

Typography scales at 4 breakpoints:

| Breakpoint       | display | large    | medium   |
| ---------------- | ------- | -------- | -------- |
| Mobile (0px)     | 2.25rem | 1.875rem | 1.5rem   |
| Tablet (768px)   | 2.5rem  | 2rem     | 1.625rem |
| Desktop (1024px) | 2.75rem | 2.25rem  | 1.75rem  |
| XL (1280px)      | 3rem    | 2.5rem   | 1.75rem  |

### Accessibility

Typography components meet WCAG 2.1 AA standards:

✅ Semantic HTML elements (h1-h6, p, code)
✅ 4.5:1 contrast ratio for body text
✅ 3:1 contrast ratio for headings
✅ Proper heading hierarchy
✅ Screen reader compatible
✅ Keyboard navigable (where interactive)

### Best Practices

**DO ✅**

- Use semantic Heading levels (display → xxsmall)
- Use Text component for body content
- Use Code component for technical content
- Use Metric for numeric displays
- Follow heading hierarchy (don't skip levels)
- Use design tokens (no hardcoded sizes)

**DON'T ❌**

- Mix Heading levels (h1 → h3, skipping h2)
- Use raw <h1>, <p> tags with Tailwind classes
- Hardcode font sizes (use components)
- Use bold weight for Vietnamese headings (use medium)
- Skip semantic HTML for styling

````

**Acceptance**:
- [ ] design-system.md updated with Typography section
- [ ] All 4 components documented
- [ ] Vietnamese section included
- [ ] Examples match component APIs

### Task 4.3: Visual Component Gallery (3 hours)

**Goal**: Build interactive gallery showcasing Typography components

**File**: `apps/web/src/features/design-system/pages/typography-gallery.tsx`

```tsx
import { Heading, Text, Code, Metric } from '@workspace/ui/components/typography';
import { Card, CardHeader, CardContent } from '@workspace/ui/components/card';

export function TypographyGallery() {
  return (
    <div className="container mx-auto py-8 space-y-12">
      <div>
        <Heading level="display">Typography Gallery</Heading>
        <Text size="large" color="muted">
          Semantic typography components with design tokens
        </Text>
      </div>

      {/* Headings Section */}
      <Card>
        <CardHeader>
          <Heading level="large">Headings</Heading>
          <Text color="muted">6 semantic levels with automatic HTML mapping</Text>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Code>level="display"</Code>
            <Heading level="display">Display Heading (H1)</Heading>
          </div>
          <div>
            <Code>level="large"</Code>
            <Heading level="large">Large Heading (H2)</Heading>
          </div>
          <div>
            <Code>level="medium"</Code>
            <Heading level="medium">Medium Heading (H3)</Heading>
          </div>
          <div>
            <Code>level="small"</Code>
            <Heading level="small">Small Heading (H4)</Heading>
          </div>
          <div>
            <Code>level="xsmall"</Code>
            <Heading level="xsmall">XSmall Heading (H5)</Heading>
          </div>
          <div>
            <Code>level="xxsmall"</Code>
            <Heading level="xxsmall">XXSmall Heading (H6)</Heading>
          </div>
        </CardContent>
      </Card>

      {/* Text Section */}
      <Card>
        <CardHeader>
          <Heading level="large">Body Text</Heading>
          <Text color="muted">3 sizes with weight and color variants</Text>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Code>size="large"</Code>
            <Text size="large">
              Large text for long-form content and articles. Optimized line-height for readability.
            </Text>
          </div>
          <div>
            <Code>size="default"</Code>
            <Text>Default body text for UI components, forms, and general content.</Text>
          </div>
          <div>
            <Code>size="small"</Code>
            <Text size="small">Small text for captions, labels, and helper text.</Text>
          </div>

          <div className="border-t pt-4">
            <Text weight="medium">Weight variants</Text>
            <div className="space-y-2 mt-2">
              <Text weight="normal">Normal weight (400)</Text>
              <Text weight="medium">Medium weight (500)</Text>
              <Text weight="semibold">Semibold weight (600)</Text>
            </div>
          </div>

          <div className="border-t pt-4">
            <Text weight="medium">Color variants</Text>
            <div className="space-y-2 mt-2">
              <Text color="default">Default foreground</Text>
              <Text color="muted">Muted foreground</Text>
              <Text color="primary">Primary color</Text>
              <Text color="destructive">Destructive color</Text>
              <Text color="success">Success color</Text>
              <Text color="warning">Warning color</Text>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Code Section */}
      <Card>
        <CardHeader>
          <Heading level="large">Code</Heading>
          <Text color="muted">Inline and block code snippets</Text>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Text>
              Install dependencies with <Code>npm install</Code> or <Code>pnpm install</Code>
            </Text>
          </div>
          <div>
            <Text weight="medium" className="mb-2">Block code</Text>
            <Code block>
              {`const config = {
  theme: 'dark',
  fontSize: 14,
  lineHeight: 1.5,
};

export default config;`}
            </Code>
          </div>
        </CardContent>
      </Card>

      {/* Metrics Section */}
      <Card>
        <CardHeader>
          <Heading level="large">Metrics</Heading>
          <Text color="muted">Numeric displays with labels and units</Text>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Metric size="large" value={1234} label="Total Users" />
            <Metric size="medium" value={87.5} unit="%" label="Completion Rate" />
            <Metric size="small" value={49.99} unit="$" unitPosition="prefix" label="MRR" />
          </div>
          <div className="border-t mt-6 pt-6">
            <Text weight="medium" className="mb-4">Color variants</Text>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Metric value={+12} color="success" label="Growth" />
              <Metric value={-5} color="danger" label="Churn" />
              <Metric value={98} color="primary" label="Score" />
              <Metric value={45} color="warning" label="Pending" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vietnamese Section */}
      <Card>
        <CardHeader>
          <Heading level="large">Vietnamese Support</Heading>
          <Text color="muted">Optimized for Vietnamese diacritics</Text>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Heading level="medium">Tiêu đề tiếng Việt</Heading>
            <Text size="large">
              Các thanh điệu tiếng Việt: á à ả ã ạ, é è ẻ ẽ ẹ, í ì ỉ ĩ ị, ó ò ỏ õ ọ, ú ù ủ ũ ụ, ý ỳ ỷ ỹ ỵ
            </Text>
            <Text>
              Nguyên âm đặc biệt: ơ ớ ờ ở ỡ ợ, ư ứ ừ ử ữ ự, ă ắ ằ ẳ ẵ ặ
            </Text>
            <Text size="small" color="muted">
              Đoạn văn mẫu: Việc tối ưu hóa hệ thống thiết kế đòi hỏi sự chú ý đến từng chi tiết nhỏ.
            </Text>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
````

**Route**: `apps/web/src/routes/$locale/design-system/typography.tsx`

**Acceptance**:

- [ ] Gallery page accessible
- [ ] All 4 components showcased
- [ ] Vietnamese examples included
- [ ] Responsive on mobile

### Task 4.4: High-Priority Page Migration (6 hours)

**Goal**: Migrate 3-5 high-traffic pages to new Typography components

**Priority Pages:**

1. Dashboard (`apps/web/src/routes/$locale/workspaces/$workspaceId/index.tsx`)
2. Active Tables List (`apps/web/src/features/active-tables/pages/active-tables-page.tsx`)
3. Record Detail (`apps/web/src/features/active-tables/pages/record-detail-page.tsx`)
4. Workspace Selector (`apps/web/src/components/workspace-selector.tsx`)
5. Navigation Menu (`apps/web/src/components/navigation-menu.tsx`)

**Migration Process:**

1. Import Typography components
2. Replace heading tags with `<Heading>`
3. Replace text elements with `<Text>`
4. Replace code snippets with `<Code>`
5. Replace metrics with `<Metric>`
6. Test visual appearance
7. Test responsive behavior
8. Test Vietnamese rendering

**Example Migration (Workspace Selector):**

**Before:**

```tsx
<div>
  <h2 className="text-xl font-semibold">Select Workspace</h2>
  <p className="text-sm text-muted-foreground">Choose a workspace to continue</p>
</div>
```

**After:**

```tsx
<div>
  <Heading level="large">Select Workspace</Heading>
  <Text size="small" color="muted">
    Choose a workspace to continue
  </Text>
</div>
```

**Acceptance**:

- [ ] 3-5 pages migrated
- [ ] Visual regression testing passed
- [ ] No accessibility regressions
- [ ] Vietnamese text renders correctly

### Task 4.5: Linting Rules (2 hours)

**Goal**: Prevent usage of raw typography Tailwind classes in new code

**File**: `.eslintrc.cjs` (or ESLint config)

**Rule**: Custom ESLint rule to discourage raw classes

```javascript
// eslint-plugin-local/typography-components.js
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Encourage use of Typography components over raw Tailwind classes',
    },
    messages: {
      useTypographyComponent:
        'Use Typography components (<Heading>, <Text>, <Code>) instead of raw text-* classes. See docs/migration/typography-migration.md',
    },
  },
  create(context) {
    return {
      JSXAttribute(node) {
        if (node.name.name === 'className' && node.value?.type === 'Literal' && typeof node.value.value === 'string') {
          const className = node.value.value;
          const hasHeadingClasses = /(text-[2-4]xl|text-xl|text-lg).*font-(bold|semibold)/.test(className);
          const hasBodyClasses = /text-(base|sm|xs).*leading-(normal|relaxed)/.test(className);

          if (hasHeadingClasses || hasBodyClasses) {
            context.report({
              node,
              messageId: 'useTypographyComponent',
            });
          }
        }
      },
    };
  },
};
```

**Configuration:**

```javascript
// .eslintrc.cjs
module.exports = {
  plugins: ['local'],
  rules: {
    'local/typography-components': 'warn', // Warn, don't error (allows gradual migration)
  },
};
```

**Acceptance**:

- [ ] ESLint rule created
- [ ] Rule warns on raw typography classes
- [ ] Rule doesn't break CI
- [ ] Documentation updated

## Acceptance Criteria

- [ ] Migration guide complete (10+ examples)
- [ ] design-system.md updated with Typography section
- [ ] Visual gallery page built and accessible
- [ ] 3-5 high-priority pages migrated successfully
- [ ] Linting rules established (warn level)
- [ ] No visual regressions detected
- [ ] Vietnamese rendering validated on migrated pages
- [ ] Accessibility audit passed (axe DevTools)
- [ ] Documentation reviewed and approved

## Risks

**Risk**: Migration breaks existing UI
**Mitigation**: Visual regression testing, gradual rollout, keep legacy code working

**Risk**: Developers bypass new components
**Mitigation**: Documentation, linting rules, code review guidelines

**Risk**: Performance impact (bundle size)
**Mitigation**: Measure bundle size, components are tree-shakeable

## Deliverables

1. `docs/migration/typography-migration.md` - Migration guide
2. `docs/design-system.md` - Updated documentation
3. `apps/web/src/features/design-system/pages/typography-gallery.tsx` - Visual gallery
4. Migrated pages (3-5 high-priority)
5. `.eslintrc.cjs` - Linting rules
6. `docs/adr/typography-component-migration.md` - Architecture Decision Record

## Success Metrics

- 80% of new code uses Typography components (within 2 weeks)
- 0 visual regression bugs reported
- 0 accessibility regressions
- Positive developer feedback on DX

## Post-Launch

### Week 1-2

- Monitor usage adoption
- Collect developer feedback
- Fix any issues

### Month 1-3

- Gradual migration of legacy code
- Update Storybook stories
- Improve documentation based on feedback

### Month 3+

- Promote linting rules to 'error' level
- Deprecate raw Tailwind typography patterns
- Consider automated migration (codemod)
