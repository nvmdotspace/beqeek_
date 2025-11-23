# Record Detail View Design Patterns Research

**Date:** 2025-11-18
**Status:** Complete
**Research Duration:** ~30 minutes

## Executive Summary

Research completed on design system patterns for implementing record detail views with head-detail and two-column layouts. Focused on layout primitives, typography components, color tokens, and accessibility patterns from Beqeek design system.

---

## 1. Layout Primitives (Primary Tool)

### Recommended Primitives

**Box** - Card-like containers with semantic styling

```tsx
import { Box } from '@workspace/ui/components/primitives';

// Field display container
<Box padding="space-300" backgroundColor="card" borderRadius="lg" border="default">
  <FieldRenderer />
</Box>;
```

**Stack** - Vertical layouts for fields

```tsx
import { Stack } from '@workspace/ui/components/primitives';

// Field list
<Stack space="space-200">
  <FieldLabel />
  <FieldValue />
  <FieldLabel />
  <FieldValue />
</Stack>;
```

**Grid + GridItem** - Responsive two-column layout

```tsx
import { Grid, GridItem } from '@workspace/ui/components/primitives';

// Two-column detail
<Grid columns={12} gap="space-400">
  <GridItem span={12} spanLg={6}>
    <LeftColumnFields />
  </GridItem>
  <GridItem span={12} spanLg={6}>
    <RightColumnFields />
  </GridItem>
</Grid>;
```

**Inline** - Horizontal metadata rows

```tsx
import { Inline } from '@workspace/ui/components/primitives';

// Badge row, action buttons
<Inline space="space-100" wrap>
  <Badge>Status</Badge>
  <Badge>Priority</Badge>
</Inline>;
```

### Spacing Tokens (Atlassian 8px System)

| Token       | Value | Use Case                   |
| ----------- | ----- | -------------------------- |
| `space-100` | 8px   | Field gaps, tight spacing  |
| `space-150` | 12px  | Small component padding    |
| `space-200` | 16px  | Standard field spacing     |
| `space-250` | 20px  | Medium gaps                |
| `space-300` | 24px  | Card padding, section gaps |
| `space-400` | 32px  | Large component spacing    |
| `space-600` | 48px  | Major layout spacing       |

**Key Principle**: Use semantic tokens NOT magic numbers

---

## 2. Typography Components

### Heading Component

```tsx
import { Heading } from '@workspace/ui/components/typography';

// Record title
<Heading level={1}>Record Title</Heading>

// Section headers
<Heading level={2}>Details</Heading>

// Field group labels
<Heading level={4}>Contact Information</Heading>
```

**Hierarchy**: H1 (36px) → H2 (30px) → H3 (24px) → H4 (20px)
**Responsive**: Scales +10% at 1024px, +15% at 1280px for H1-H3
**Vietnamese**: Auto-optimizes when `lang="vi"` (line-height +8-13%, weight 700→600)

### Text Component

```tsx
import { Text } from '@workspace/ui/components/typography';

// Field labels
<Text size="small" weight="medium" color="muted">
  Email Address
</Text>

// Field values
<Text size="default" weight="regular">
  user@example.com
</Text>

// Helper text
<Text size="small" color="muted">
  Last updated 2 hours ago
</Text>
```

**Variants**:

- Size: `large` (16px), `default` (14px), `small` (12px)
- Weight: `regular`, `medium`, `semibold`, `bold`
- Color: `default`, `muted`, `primary`, `destructive`, `accent`

### Metric Component

```tsx
import { Metric } from '@workspace/ui/components/typography';

// Numeric stats in header
<Metric size="medium" value={42} label="Comments" />;
```

---

## 3. Color System (Design Tokens)

### Background Colors

| Token          | Light Mode        | Dark Mode         | Usage              |
| -------------- | ----------------- | ----------------- | ------------------ |
| `--background` | `hsl(0 0% 100%)`  | `hsl(0 0% 3.9%)`  | Page background    |
| `--card`       | `hsl(0 0% 100%)`  | `hsl(0 0% 3.9%)`  | Card backgrounds   |
| `--muted`      | `hsl(0 0% 96.1%)` | `hsl(0 0% 14.9%)` | Subtle backgrounds |
| `--accent`     | `hsl(0 0% 96.1%)` | `hsl(0 0% 14.9%)` | Hover states       |

### Text Colors

| Token                | Light Mode           | Dark Mode            | Usage                  |
| -------------------- | -------------------- | -------------------- | ---------------------- |
| `--foreground`       | `hsl(0 0% 3.9%)`     | `hsl(0 0% 98%)`      | Primary text           |
| `--muted-foreground` | `hsl(0 0% 45.1%)`    | `hsl(0 0% 63.9%)`    | Labels, secondary text |
| `--destructive`      | `hsl(0 84.2% 60.2%)` | `hsl(0 62.8% 30.6%)` | Errors                 |

### Status Colors (Semantic)

| Token       | Usage                  | Light Mode         |
| ----------- | ---------------------- | ------------------ |
| `--success` | Completion, encryption | `hsl(142 76% 36%)` |
| `--warning` | Caution, unencrypted   | `hsl(38 92% 50%)`  |
| `--info`    | Informational          | `hsl(217 91% 60%)` |

**Critical**: NEVER hardcode colors - always use design tokens for dark mode support

---

## 4. Input Styling Standards (MANDATORY)

### Standard Input Classes

```tsx
className={cn(
  // Layout
  "flex h-10 w-full rounded-md",

  // Colors (design tokens - REQUIRED)
  "border border-input",
  "bg-background text-foreground",

  // Spacing
  "px-3 py-2",

  // Typography
  "text-sm",

  // Transitions
  "transition-all",

  // Placeholder
  "placeholder:text-muted-foreground",

  // Focus state (REQUIRED)
  "focus-visible:outline-none",
  "focus-visible:ring-1",
  "focus-visible:ring-inset",
  "focus-visible:ring-ring",

  // Error state
  "aria-invalid:border-destructive",

  // Disabled state
  "disabled:cursor-not-allowed",
  "disabled:opacity-50"
)}
```

**Design Tokens Used**:

- `border-input`: Input border color (adapts to theme)
- `bg-background`: Background color
- `text-foreground`: Text color
- `text-muted-foreground`: Placeholder text
- `ring-ring`: Focus ring color
- `border-destructive`: Error border

---

## 5. Responsive Design Strategy

### Breakpoints (Mobile-First)

| Breakpoint | Min Width | Class Prefix | Usage         |
| ---------- | --------- | ------------ | ------------- |
| `xs`       | 0px       | (default)    | Mobile phones |
| `sm`       | 640px     | `sm:`        | Large phones  |
| `md`       | 768px     | `md:`        | Tablets       |
| `lg`       | 1024px    | `lg:`        | Laptops       |
| `xl`       | 1280px    | `xl:`        | Desktops      |

### Layout Strategy

**Head-Detail Layout** (Single Column):

- Stack all fields vertically on mobile
- Maintain single column on larger screens
- Use `Stack` primitive with `space-200` gaps

**Two-Column Layout**:

- Mobile (< 1024px): Stack columns vertically (12-span)
- Desktop (≥ 1024px): Split 6-6 or 8-4 columns
- Comments: Side panel on desktop, bottom panel on mobile

```tsx
// Responsive two-column
<Grid columns={12} gap="space-400">
  <GridItem span={12} spanLg={8}>
    {/* Main content stacks on mobile */}
  </GridItem>
  <GridItem span={12} spanLg={4}>
    {/* Sidebar stacks below on mobile */}
  </GridItem>
</Grid>
```

---

## 6. Accessibility Checklist (WCAG 2.1 AA)

### Focus Management

```tsx
// ✅ REQUIRED for all interactive elements
focus-visible:outline-none
focus-visible:ring-1
focus-visible:ring-inset
focus-visible:ring-ring
```

### ARIA Attributes

```tsx
// Icon button
<Button variant="ghost" size="icon" aria-label="Edit field">
  <Edit className="size-4" />
</Button>

// Form error
<Input
  aria-invalid={hasError}
  aria-describedby={hasError ? 'error-message' : undefined}
/>
{hasError && <span id="error-message" className="text-sm text-destructive">{errorMessage}</span>}
```

### Semantic HTML

```tsx
// ✅ Use semantic headings
<Heading level={2}>Section Title</Heading>

// ❌ NOT this
<div className="text-2xl font-bold">Section Title</div>
```

### Keyboard Navigation

- Tab/Shift+Tab: Navigate between fields
- Enter/Space: Activate buttons
- Escape: Close dialogs/popovers
- All interactive elements MUST be keyboard accessible

### Screen Reader Support

```tsx
// Live announcements
<div role="status" aria-live="polite" className="sr-only">
  {statusMessage}
</div>

// Screen reader only text
<span className="sr-only">Additional context</span>
```

### Contrast Requirements

- Normal text: 4.5:1 minimum
- Large text: 3:1 minimum
- Design tokens ensure compliance

---

## 7. Component Patterns from @workspace/ui

### Available Components

**Layout**:

- `Box`, `Stack`, `Inline`, `Grid`, `GridItem`, `Container`
- `Separator` - Horizontal/vertical dividers

**Typography**:

- `Heading`, `Text`, `Code`, `Metric`

**Form**:

- `Input`, `Textarea`, `Label`, `Select`, `Checkbox`, `Switch`

**Feedback**:

- `Alert`, `Badge`, `Skeleton`, `Progress`, `Sonner` (toast)

**Overlay**:

- `Dialog`, `Sheet`, `Popover`, `Tooltip`, `DropdownMenu`, `ContextMenu`

**Data**:

- `Table`, `Card`, `Avatar`, `ScrollArea`, `Tabs`

### Common Patterns

**Field Display**:

```tsx
<Stack space="space-100">
  <Text size="small" weight="medium" color="muted" as="label">
    Email Address
  </Text>
  <Text size="default">user@example.com</Text>
</Stack>
```

**Card Section**:

```tsx
<Box padding="space-300" backgroundColor="card" borderRadius="lg" border="default">
  <Stack space="space-200">
    <Heading level={3}>Section Title</Heading>
    <FieldList />
  </Stack>
</Box>
```

**Action Bar**:

```tsx
<Inline space="space-150" justify="end">
  <Button variant="outline">Cancel</Button>
  <Button>Save Changes</Button>
</Inline>
```

**Status Badge Row**:

```tsx
<Inline space="space-100" wrap>
  <Badge variant="success">Active</Badge>
  <Badge variant="secondary">High Priority</Badge>
</Inline>
```

---

## 8. Dark Mode Implementation

### Automatic Support

Design tokens automatically adapt to dark mode:

```tsx
// ✅ Dark mode automatic
<Box backgroundColor="card" borderRadius="lg" border="default">
  <Text color="muted">Auto-adapts to theme</Text>
</Box>

// ❌ Hardcoded - breaks dark mode
<div className="bg-white border-gray-300">
  <span className="text-gray-500">Breaks in dark mode</span>
</div>
```

### Theme Toggle

Dark mode class applied to `<html>`:

```html
<html class="dark"></html>
```

All design tokens in `:root` and `.dark` selectors ensure seamless switching.

---

## 9. Vietnamese Typography Considerations

### Automatic Optimization

When `document.documentElement.lang === 'vi'`:

- Line-height increases 8-13% for diacritic spacing
- Font-weight reduces 700→600 for headings
- Letter-spacing normalized
- All 134 Vietnamese characters supported

### Implementation

Typography components auto-optimize:

```tsx
<Heading level={1}>Quản lý không gian làm việc</Heading>
// Auto-applies Vietnamese optimization via CSS tokens
```

**No props needed** - optimization is automatic based on `lang` attribute.

### Manual Adjustments (if needed)

```tsx
// For Vietnamese body text
<Text className="leading-relaxed">Nội dung tiếng Việt dài với nhiều dấu thanh điệu</Text>
```

---

## 10. Record Detail Layouts (From Active Tables)

### Layout Constants

```tsx
import {
  RECORD_DETAIL_LAYOUT_HEAD_DETAIL,
  RECORD_DETAIL_LAYOUT_TWO_COLUMN,
  COMMENTS_POSITION_RIGHT_PANEL,
  COMMENTS_POSITION_HIDDEN,
  type RecordDetailLayout,
  type CommentsPosition,
} from '@workspace/beqeek-shared/constants/layouts';
```

### Head-Detail Layout

**Characteristics**:

- Single column view
- Stacked fields vertically
- Suitable for narrow screens
- Uses: `titleField`, `subLineFields`, `tailFields`

**Recommended Structure**:

```tsx
<Container maxWidth="xl" padding="margin">
  <Stack space="space-600">
    {/* Title section */}
    <Box padding="space-300" backgroundColor="card" borderRadius="lg" border="default">
      <Stack space="space-200">
        <Heading level={1}>{record.title}</Heading>
        <Inline space="space-100" wrap>
          {subLineFields.map((field) => (
            <Badge>{field}</Badge>
          ))}
        </Inline>
      </Stack>
    </Box>

    {/* Fields section */}
    <Stack space="space-300">
      {fields.map((field) => (
        <FieldRenderer key={field.id} field={field} />
      ))}
    </Stack>

    {/* Comments (if not hidden) */}
    {commentsPosition === COMMENTS_POSITION_RIGHT_PANEL && <CommentsPanel />}
  </Stack>
</Container>
```

### Two-Column Layout

**Characteristics**:

- Information split left/right columns
- Wide screen optimized
- Uses: `headTitleField`, `headSubLineFields`, `column1Fields`, `column2Fields`

**Recommended Structure**:

```tsx
<Container maxWidth="2xl" padding="margin">
  <Stack space="space-600">
    {/* Header */}
    <Box padding="space-400" backgroundColor="card" borderRadius="lg" border="default">
      <Stack space="space-250">
        <Heading level={1}>{record.headTitle}</Heading>
        <Inline space="space-100" wrap>
          {headSubLineFields.map((badge) => (
            <Badge>{badge}</Badge>
          ))}
        </Inline>
      </Stack>
    </Box>

    {/* Main content area */}
    <Grid columns={12} gap="space-400">
      {/* Left column */}
      <GridItem span={12} spanLg={commentsPosition === 'right-panel' ? 5 : 6}>
        <Stack space="space-300">
          {column1Fields.map((field) => (
            <FieldRenderer />
          ))}
        </Stack>
      </GridItem>

      {/* Right column */}
      <GridItem span={12} spanLg={commentsPosition === 'right-panel' ? 3 : 6}>
        <Stack space="space-300">
          {column2Fields.map((field) => (
            <FieldRenderer />
          ))}
        </Stack>
      </GridItem>

      {/* Comments panel */}
      {commentsPosition === COMMENTS_POSITION_RIGHT_PANEL && (
        <GridItem span={12} spanLg={4}>
          <CommentsPanel />
        </GridItem>
      )}
    </Grid>
  </Stack>
</Container>
```

### Comments Panel Positioning

**Right Panel** (`COMMENTS_POSITION_RIGHT_PANEL`):

- Desktop: Side column (4-span on 12-column grid)
- Mobile: Stacks below main content
- Fixed height with `ScrollArea` component

**Hidden** (`COMMENTS_POSITION_HIDDEN`):

- Comments not displayed
- Use full width for content

---

## 11. Practical Component Recipes

### Field Group Card

```tsx
<Box padding="space-300" backgroundColor="card" borderRadius="lg" border="default">
  <Stack space="space-250">
    <Heading level={3}>Contact Information</Heading>
    <Separator />
    <Stack space="space-200">
      <FieldRow label="Email" value="user@example.com" />
      <FieldRow label="Phone" value="+84 123 456 789" />
    </Stack>
  </Stack>
</Box>
```

### Editable Field Row

```tsx
<Stack space="space-100">
  <Inline justify="between" align="center">
    <Text size="small" weight="medium" color="muted">
      Description
    </Text>
    <Button variant="ghost" size="sm" aria-label="Edit description">
      <Edit className="size-3" />
    </Button>
  </Inline>
  <Text size="default">{record.description || '—'}</Text>
</Stack>
```

### Status Section

```tsx
<Box padding="space-250" backgroundColor="muted" borderRadius="md">
  <Inline space="space-150" align="center">
    <Badge variant="success">Active</Badge>
    <Separator orientation="vertical" className="h-4" />
    <Text size="small" color="muted">
      Updated 2h ago
    </Text>
  </Inline>
</Box>
```

### Loading Skeleton

```tsx
import { Skeleton } from '@workspace/ui/components/skeleton';

<Stack space="space-200">
  <Skeleton className="h-8 w-3/4" /> {/* Title */}
  <Skeleton className="h-4 w-1/2" /> {/* Subtitle */}
  <Skeleton className="h-24 w-full" /> {/* Content */}
</Stack>;
```

---

## 12. Performance Considerations

### Code Splitting

Layout primitives and typography components are lightweight:

- Box: ~0.5KB
- Stack/Inline: ~0.5KB each
- Grid: ~1KB
- Heading/Text: ~1KB each
- **Total**: ~4-5KB for full primitive set

### Virtualization

For long field lists, use `@tanstack/react-virtual`:

```tsx
import { useVirtualizer } from '@tanstack/react-virtual';

// Virtual scrolling for 100+ fields
```

### Lazy Loading

Heavy components (rich text editor, charts):

```tsx
const RichTextEditor = lazy(() => import('./rich-text-editor'));

<Suspense fallback={<Skeleton className="h-48" />}>
  <RichTextEditor />
</Suspense>;
```

---

## 13. Implementation Recommendations

### For Head-Detail Layout

1. **Use `Stack` primitive** with `space-200` for field list
2. **Title section**: `Box` with `padding="space-300"`, `backgroundColor="card"`
3. **Field labels**: `Text size="small" weight="medium" color="muted"`
4. **Field values**: `Text size="default"`
5. **Comments**: Bottom section below fields (mobile-friendly)

### For Two-Column Layout

1. **Use `Grid` with 12 columns** and responsive `GridItem` spans
2. **Header section**: Full-width `Box` with title and badges
3. **Column split**: 6-6 (equal) or 8-4 (main + sidebar)
4. **Comments panel**: 4-span column on right (desktop), stacks on mobile
5. **Field groups**: Nested `Box` components with `Stack` for vertical fields

### Field Rendering Patterns

**Read-only field**:

```tsx
<Stack space="space-100">
  <Label>{field.label}</Label>
  <Text>{field.value || '—'}</Text>
</Stack>
```

**Inline-editable field**:

```tsx
<Stack space="space-100">
  <Label>{field.label}</Label>
  {editing ? <Input value={value} onChange={handleChange} /> : <Text onClick={() => setEditing(true)}>{value}</Text>}
</Stack>
```

### Comments Panel Structure

```tsx
<Box
  padding="space-300"
  backgroundColor="card"
  borderRadius="lg"
  border="default"
  className="h-full max-h-[calc(100vh-200px)]"
>
  <Stack space="space-300">
    <Inline justify="between" align="center">
      <Heading level={3}>Comments</Heading>
      <Metric size="small" value={comments.length} />
    </Inline>

    <Separator />

    <ScrollArea className="flex-1">
      <Stack space="space-200">
        {comments.map((comment) => (
          <CommentCard key={comment.id} />
        ))}
      </Stack>
    </ScrollArea>

    <CommentInput onSubmit={handleCommentAdd} />
  </Stack>
</Box>
```

---

## Unresolved Questions

None - design system documentation is comprehensive and complete.

---

## Next Steps

1. **Create implementation plan** based on these patterns
2. **Build layout components** for head-detail and two-column views
3. **Implement field renderers** with inline editing support
4. **Add comments panel** with right-panel positioning
5. **Test responsive behavior** on mobile/tablet/desktop breakpoints
6. **Verify accessibility** with keyboard navigation and screen readers
7. **Validate dark mode** appearance across all components

---

**Research Complete** | 251118
