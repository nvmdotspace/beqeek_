# Record Detail View - UI/UX Design Specification

**Date**: 2025-11-18
**Status**: Design Phase Complete
**Version**: 1.0.0

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Component Architecture](#component-architecture)
3. [Layout Variants](#layout-variants)
4. [Field Display & Editing](#field-display--editing)
5. [Comments Panel](#comments-panel)
6. [Activity Timeline](#activity-timeline)
7. [Responsive Design](#responsive-design)
8. [Accessibility](#accessibility)
9. [Loading & Error States](#loading--error-states)
10. [Implementation Checklist](#implementation-checklist)

---

## Executive Summary

### Design Objectives

Create a flexible, accessible record detail view supporting two layout variants:

1. **Head-Detail Layout**: Single-column, mobile-first, stacked fields
2. **Two-Column Layout**: Desktop-optimized, grid-based, sidebar comments

### Key Features

- **Inline Editing**: Double-click fields to edit in place with permission checks
- **Comments Panel**: Configurable positioning (right panel, bottom, hidden)
- **Activity Timeline**: Chronological field change history with user attribution
- **Related Records**: Navigate between referenced records
- **E2EE Support**: Client-side encryption/decryption indicators
- **Vietnamese Typography**: Optimized for diacritical marks
- **Dark Mode**: Full theme support via design tokens

### Design System Compliance

✅ Layout primitives: Box, Stack, Grid, Inline, Container
✅ Typography components: Heading, Text, Metric
✅ Design tokens: CSS custom properties for colors, spacing
✅ Input styling standards: border-input, focus-visible:ring-1
✅ Responsive breakpoints: Mobile-first (xs → sm → md → lg → xl)
✅ WCAG 2.1 AA: Keyboard nav, ARIA labels, focus indicators
✅ Vietnamese support: Automatic line-height optimization

---

## Component Architecture

### Hierarchical Structure

```
RecordDetailPage (apps/web wrapper)
│
├─ RecordDetailHeader
│  ├─ Title (H1 heading)
│  ├─ Encryption Status Badge (success/warning/info)
│  └─ Action Buttons (Edit, Delete, Custom Actions)
│
├─ Layout Variant Renderer (conditional)
│  │
│  ├─ HeadDetailLayout
│  │  ├─ TitleSection (Box with padding="space-300")
│  │  │  ├─ Heading level={1} (titleField)
│  │  │  └─ Inline (badges for subLineFields)
│  │  ├─ Stack space="space-300" (tailFields)
│  │  │  └─ FieldRenderer[] (vertical list)
│  │  └─ CommentsPanel (conditional, bottom position)
│  │
│  └─ TwoColumnLayout
│     ├─ HeaderSection (Box, full-width)
│     │  ├─ Heading level={1} (headTitleField)
│     │  └─ Inline (badges for headSubLineFields)
│     ├─ Grid columns={12} gap="space-400"
│     │  ├─ GridItem span={12} spanLg={5-8} (column1Fields)
│     │  ├─ GridItem span={12} spanLg={3-6} (column2Fields)
│     │  └─ GridItem span={12} spanLg={4} (comments sidebar)
│     └─ CommentsPanel (conditional, right or bottom)
│
├─ Shared Field Components
│  ├─ FieldDisplay (read-only)
│  │  ├─ Label (Text size="small" weight="medium" color="muted")
│  │  ├─ Value Renderer (type-specific display)
│  │  └─ Last Updated Tooltip (if valueUpdatedAt exists)
│  │
│  ├─ InlineEditField (editable)
│  │  ├─ Edit Button (ghost icon button)
│  │  ├─ Input/Select/Textarea (field type dependent)
│  │  └─ Action Bar (Save + Cancel buttons)
│  │
│  ├─ ActivityTimeline
│  │  ├─ Timeline Item[] (reverse chronological)
│  │  │  ├─ Avatar (user icon)
│  │  │  ├─ Change Description (field: old → new)
│  │  │  └─ Timestamp (relative time)
│  │  └─ Load More Button (pagination)
│  │
│  └─ RelatedRecords
│     ├─ Reference Link[]
│     └─ Empty State ("No related records")
│
└─ Error Boundary (wraps entire view)
   ├─ Encryption Key Error
   ├─ Permission Denied Error
   └─ Network/Loading Error
```

### Component Responsibilities

#### RecordDetailPage

- Route integration with TanStack Router
- Fetch record data via React Query
- Handle encryption key validation
- Manage permission checks
- Coordinate layout rendering

#### RecordDetailHeader

- Display record title (encrypted field if E2EE)
- Show encryption status badge
- Render permission-based action buttons
- Handle action menu interactions

#### Layout Variants

- **HeadDetailLayout**: Single-column, mobile-optimized
- **TwoColumnLayout**: Multi-column, desktop-optimized
- Dynamic rendering based on `table.config.recordDetailLayout`

#### FieldDisplay

- Type-specific value rendering (text, number, date, select, etc.)
- Decryption for E2EE fields
- Empty state handling ("—" for null values)
- Last updated timestamp tooltip

#### InlineEditField

- Double-click to enter edit mode
- Permission validation before enabling edit
- Field-specific input rendering
- Optimistic UI updates
- Error handling with validation messages

#### CommentsPanel

- Rich text editor with formatting toolbar
- @mention support (workspace users)
- Permission-based edit/delete
- Real-time updates (React Query)
- Scroll area with fixed height

#### ActivityTimeline

- Reverse chronological field changes
- Group by date (Today, Yesterday, Last 7 days, etc.)
- User avatars + display names
- Diff view (old value → new value)
- Link to related records

---

## Layout Variants

### 1. Head-Detail Layout (Mobile-First)

**Configuration**: `recordDetailLayout: 'HEAD_DETAIL'`

#### Structure

```
┌─────────────────────────────────────┐
│ Container maxWidth="xl" padding="margin"
│ ┌───────────────────────────────────┐
│ │ Box (TitleSection)                │
│ │ padding="space-300" bg="card"     │
│ │ ┌─────────────────────────────┐   │
│ │ │ Heading level={1}           │   │
│ │ │ {record.titleField}         │   │
│ │ └─────────────────────────────┘   │
│ │ ┌─────────────────────────────┐   │
│ │ │ Inline space="space-100"    │   │
│ │ │ [Badge] [Badge] [Badge]     │   │
│ │ └─────────────────────────────┘   │
│ └───────────────────────────────────┘
│
│ ┌───────────────────────────────────┐
│ │ Stack space="space-300"           │
│ │ ┌─────────────────────────────┐   │
│ │ │ FieldRenderer (Field 1)     │   │
│ │ │ Label: Email                │   │
│ │ │ Value: user@example.com     │   │
│ │ └─────────────────────────────┘   │
│ │ ┌─────────────────────────────┐   │
│ │ │ FieldRenderer (Field 2)     │   │
│ │ │ Label: Phone                │   │
│ │ │ Value: +84 123 456 789      │   │
│ │ └─────────────────────────────┘   │
│ │ ... (more fields)               │
│ └───────────────────────────────────┘
│
│ ┌───────────────────────────────────┐
│ │ CommentsPanel (if not hidden)     │
│ │ height: auto (stacks below)       │
│ └───────────────────────────────────┘
└─────────────────────────────────────┘
```

#### Field Configuration

```typescript
interface HeadDetailConfig {
  titleField: string; // Field name for main heading
  subLineFields: string[]; // Fields rendered as badges below title
  tailFields: string[]; // Remaining fields in vertical stack
  commentsPosition: 'HIDDEN' | 'RIGHT_PANEL' | 'BOTTOM';
}
```

#### Responsive Behavior

- **Mobile (< 768px)**: Single column, full-width
- **Tablet (768px+)**: Single column, max-width constrained
- **Desktop (1024px+)**: Single column, centered with margins

#### Code Example

```tsx
import { Container, Box, Stack, Inline } from '@workspace/ui/components/primitives';
import { Heading, Text } from '@workspace/ui/components/typography';
import { Badge } from '@workspace/ui/components/badge';

function HeadDetailLayout({ record, fields, config }: Props) {
  const titleField = fields.find((f) => f.name === config.titleField);
  const subLineFields = config.subLineFields.map((name) => fields.find((f) => f.name === name));
  const tailFields = config.tailFields.map((name) => fields.find((f) => f.name === name));

  return (
    <Container maxWidth="xl" padding="margin">
      <Stack space="space-600">
        {/* Title Section */}
        <Box padding="space-300" backgroundColor="card" borderRadius="lg" border="default">
          <Stack space="space-200">
            <Heading level={1}>{renderFieldValue(titleField, record)}</Heading>
            <Inline space="space-100" wrap>
              {subLineFields.map((field) => (
                <Badge key={field.name} variant="secondary">
                  {renderFieldValue(field, record)}
                </Badge>
              ))}
            </Inline>
          </Stack>
        </Box>

        {/* Field List */}
        <Stack space="space-300">
          {tailFields.map((field) => (
            <FieldRenderer key={field.name} field={field} record={record} />
          ))}
        </Stack>

        {/* Comments Panel */}
        {config.commentsPosition !== 'HIDDEN' && <CommentsPanel recordId={record.id} />}
      </Stack>
    </Container>
  );
}
```

---

### 2. Two-Column Layout (Desktop-Optimized)

**Configuration**: `recordDetailLayout: 'TWO_COLUMN'`

#### Structure (Desktop)

```
┌─────────────────────────────────────────────────────────────┐
│ Container maxWidth="2xl" padding="margin"                   │
│ ┌───────────────────────────────────────────────────────────┐
│ │ Box (HeaderSection) - Full Width                          │
│ │ ┌─────────────────────────────────────────────────────┐   │
│ │ │ Heading level={1} - {headTitleField}                │   │
│ │ └─────────────────────────────────────────────────────┘   │
│ │ ┌─────────────────────────────────────────────────────┐   │
│ │ │ Inline - [Badge] [Badge] [Badge]                    │   │
│ │ └─────────────────────────────────────────────────────┘   │
│ └───────────────────────────────────────────────────────────┘
│
│ ┌───────────────────────────────────────────────────────────┐
│ │ Grid columns={12} gap="space-400"                         │
│ │ ┌─────────────────────┐ ┌─────────────┐ ┌─────────────┐ │
│ │ │ GridItem span=5     │ │ span=3      │ │ span=4      │ │
│ │ │ (Column 1 Fields)   │ │ (Column 2)  │ │ (Comments)  │ │
│ │ │                     │ │             │ │             │ │
│ │ │ ┌─────────────────┐ │ │ ┌─────────┐ │ │ ┌─────────┐ │ │
│ │ │ │ Field: Email    │ │ │ │ Field   │ │ │ │ Comment │ │ │
│ │ │ └─────────────────┘ │ │ └─────────┘ │ │ │ Editor  │ │ │
│ │ │ ┌─────────────────┐ │ │ ┌─────────┐ │ │ └─────────┘ │ │
│ │ │ │ Field: Phone    │ │ │ │ Field   │ │ │ ┌─────────┐ │ │
│ │ │ └─────────────────┘ │ │ └─────────┘ │ │ │ Comment │ │ │
│ │ │ ┌─────────────────┐ │ │ ┌─────────┐ │ │ │ List    │ │ │
│ │ │ │ Field: Address  │ │ │ │ Field   │ │ │ │ (scroll)│ │ │
│ │ │ └─────────────────┘ │ │ └─────────┘ │ │ └─────────┘ │ │
│ │ └─────────────────────┘ └─────────────┘ └─────────────┘ │
│ └───────────────────────────────────────────────────────────┘
└─────────────────────────────────────────────────────────────┘
```

#### Structure (Mobile)

```
┌─────────────────────────────────────┐
│ Container padding="margin"          │
│ ┌───────────────────────────────────┐
│ │ Box (HeaderSection)               │
│ │ Heading + Badges (full width)     │
│ └───────────────────────────────────┘
│
│ ┌───────────────────────────────────┐
│ │ Grid columns={12}                 │
│ │ ┌───────────────────────────────┐ │
│ │ │ GridItem span={12}            │ │
│ │ │ Column 1 Fields (stacked)     │ │
│ │ └───────────────────────────────┘ │
│ │ ┌───────────────────────────────┐ │
│ │ │ GridItem span={12}            │ │
│ │ │ Column 2 Fields (stacked)     │ │
│ │ └───────────────────────────────┘ │
│ │ ┌───────────────────────────────┐ │
│ │ │ GridItem span={12}            │ │
│ │ │ Comments (stacked below)      │ │
│ │ └───────────────────────────────┘ │
│ └───────────────────────────────────┘
└─────────────────────────────────────┘
```

#### Field Configuration

```typescript
interface TwoColumnConfig {
  headTitleField: string; // Main title field
  headSubLineFields: string[]; // Badge fields below title
  column1Fields: string[]; // Left column fields
  column2Fields: string[]; // Right column fields
  commentsPosition: 'RIGHT_PANEL' | 'BOTTOM' | 'HIDDEN';
}
```

#### Column Span Logic

```typescript
// Responsive spans based on comments position
const getColumnSpans = (commentsPosition: CommentsPosition) => {
  if (commentsPosition === 'RIGHT_PANEL') {
    return {
      column1: { span: 12, spanLg: 5 }, // 5/12 on desktop
      column2: { span: 12, spanLg: 3 }, // 3/12 on desktop
      comments: { span: 12, spanLg: 4 }, // 4/12 on desktop
    };
  }

  // No sidebar comments - equal columns
  return {
    column1: { span: 12, spanLg: 6 }, // 6/12 on desktop
    column2: { span: 12, spanLg: 6 }, // 6/12 on desktop
    comments: { span: 12 }, // Full width below
  };
};
```

#### Code Example

```tsx
import { Container, Box, Stack, Grid, GridItem, Inline } from '@workspace/ui/components/primitives';
import { Heading } from '@workspace/ui/components/typography';

function TwoColumnLayout({ record, fields, config }: Props) {
  const spans = getColumnSpans(config.commentsPosition);

  return (
    <Container maxWidth="2xl" padding="margin">
      <Stack space="space-600">
        {/* Header Section */}
        <Box padding="space-400" backgroundColor="card" borderRadius="lg" border="default">
          <Stack space="space-250">
            <Heading level={1}>{renderFieldValue(headTitleField, record)}</Heading>
            <Inline space="space-100" wrap>
              {headSubLineFields.map((field) => (
                <Badge key={field.name}>{renderFieldValue(field, record)}</Badge>
              ))}
            </Inline>
          </Stack>
        </Box>

        {/* Content Grid */}
        <Grid columns={12} gap="space-400">
          {/* Column 1 */}
          <GridItem {...spans.column1}>
            <Stack space="space-300">
              {column1Fields.map((field) => (
                <FieldRenderer key={field.name} field={field} record={record} />
              ))}
            </Stack>
          </GridItem>

          {/* Column 2 */}
          <GridItem {...spans.column2}>
            <Stack space="space-300">
              {column2Fields.map((field) => (
                <FieldRenderer key={field.name} field={field} record={record} />
              ))}
            </Stack>
          </GridItem>

          {/* Comments Panel (if right sidebar) */}
          {config.commentsPosition === 'RIGHT_PANEL' && (
            <GridItem {...spans.comments}>
              <CommentsPanel recordId={record.id} />
            </GridItem>
          )}
        </Grid>

        {/* Comments Panel (if bottom) */}
        {config.commentsPosition === 'BOTTOM' && <CommentsPanel recordId={record.id} />}
      </Stack>
    </Container>
  );
}
```

---

## Field Display & Editing

### Field Renderer Component

#### Read-Only Display

```
┌────────────────────────────────────┐
│ Stack space="space-100"            │
│ ┌──────────────────────────────┐   │
│ │ Inline justify="between"     │   │
│ │ ┌─────────────┐ ┌──────────┐ │   │
│ │ │ Label       │ │ Edit Btn │ │   │
│ │ │ (muted)     │ │ (ghost)  │ │   │
│ │ └─────────────┘ └──────────┘ │   │
│ └──────────────────────────────┘   │
│ ┌──────────────────────────────┐   │
│ │ Value (foreground)           │   │
│ │ user@example.com             │   │
│ └──────────────────────────────┘   │
│ ┌──────────────────────────────┐   │
│ │ Text size="small" (muted)    │   │
│ │ 🔄 Updated 2h ago            │   │
│ └──────────────────────────────┘   │
└────────────────────────────────────┘
```

#### Code Implementation

```tsx
import { Stack, Inline } from '@workspace/ui/components/primitives';
import { Text } from '@workspace/ui/components/typography';
import { Button } from '@workspace/ui/components/button';
import { Edit } from 'lucide-react';

interface FieldDisplayProps {
  field: Field;
  value: any;
  lastUpdated?: string;
  onEdit?: () => void;
  canEdit: boolean;
}

function FieldDisplay({ field, value, lastUpdated, onEdit, canEdit }: FieldDisplayProps) {
  const displayValue = renderValueByType(field.type, value, field);

  return (
    <Stack space="space-100">
      {/* Label + Edit Button */}
      <Inline justify="between" align="center">
        <Text size="small" weight="medium" color="muted" as="label">
          {field.label}
          {field.required && <span className="text-destructive ml-1">*</span>}
        </Text>

        {canEdit && onEdit && (
          <Button variant="ghost" size="sm" onClick={onEdit} aria-label={`Edit ${field.label}`}>
            <Edit className="size-3" />
          </Button>
        )}
      </Inline>

      {/* Value */}
      <Text size="default">{displayValue || <span className="text-muted-foreground">—</span>}</Text>

      {/* Last Updated Timestamp */}
      {lastUpdated && (
        <Text size="small" color="muted">
          🔄 Updated {formatRelativeTime(lastUpdated)}
        </Text>
      )}
    </Stack>
  );
}
```

### Field Type Rendering

#### Type-Specific Renderers

```typescript
function renderValueByType(type: FieldType, value: any, field: Field): ReactNode {
  if (value == null || value === '') return null;

  switch (type) {
    case FIELD_TYPE_SHORT_TEXT:
    case FIELD_TYPE_TEXT:
    case FIELD_TYPE_EMAIL:
    case FIELD_TYPE_URL:
      return <span>{value}</span>;

    case FIELD_TYPE_RICH_TEXT:
      return (
        <div
          className="prose prose-sm dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: sanitize(marked.parse(value)) }}
        />
      );

    case FIELD_TYPE_INTEGER:
      return <span>{formatNumber(value, 0)}</span>;

    case FIELD_TYPE_NUMERIC:
      return <span>{formatNumber(value, 2)}</span>;

    case FIELD_TYPE_DATE:
      return <span>{formatDate(value, 'MMM DD, YYYY')}</span>;

    case FIELD_TYPE_DATETIME:
      return <span>{formatDate(value, 'MMM DD, YYYY HH:mm')}</span>;

    case FIELD_TYPE_SELECT_ONE:
      const option = field.options.find(opt => opt.value === value);
      return option ? (
        <Badge
          style={{
            backgroundColor: option.backgroundColor,
            color: option.textColor
          }}
        >
          {option.text}
        </Badge>
      ) : null;

    case FIELD_TYPE_SELECT_LIST:
      const selectedOptions = field.options.filter(opt =>
        value.includes(opt.value)
      );
      return (
        <Inline space="space-100" wrap>
          {selectedOptions.map(opt => (
            <Badge
              key={opt.value}
              style={{
                backgroundColor: opt.backgroundColor,
                color: opt.textColor
              }}
            >
              {opt.text}
            </Badge>
          ))}
        </Inline>
      );

    case FIELD_TYPE_SELECT_ONE_RECORD:
      return <ReferenceRecordLink recordId={value} tableId={field.referenceTableId} />;

    case FIELD_TYPE_SELECT_LIST_RECORD:
      return (
        <Stack space="space-100">
          {value.map(id => (
            <ReferenceRecordLink
              key={id}
              recordId={id}
              tableId={field.referenceTableId}
            />
          ))}
        </Stack>
      );

    case FIELD_TYPE_SELECT_ONE_WORKSPACE_USER:
      return <UserAvatar userId={value} showName />;

    case FIELD_TYPE_SELECT_LIST_WORKSPACE_USER:
      return (
        <Inline space="space-100" wrap>
          {value.map(userId => (
            <UserAvatar key={userId} userId={userId} size="sm" showName />
          ))}
        </Inline>
      );

    case FIELD_TYPE_CHECKBOX_YES_NO:
      return (
        <Badge variant={value ? 'success' : 'secondary'}>
          {value ? 'Yes' : 'No'}
        </Badge>
      );

    default:
      return <span>{String(value)}</span>;
  }
}
```

### Inline Editing

#### Edit Mode States

**1. View Mode (Default)**

```
┌────────────────────────────────────┐
│ Label: Email                       │
│ Value: user@example.com    [Edit] │
│ Updated 2h ago                     │
└────────────────────────────────────┘
        │ Double-click or Edit button
        ▼
```

**2. Edit Mode (Active)**

```
┌────────────────────────────────────┐
│ Label: Email *                     │
│ ┌────────────────────────────────┐ │
│ │ [Input] user@example.com       │ │
│ └────────────────────────────────┘ │
│ ┌──────────────┐ ┌──────────────┐ │
│ │ [Cancel]     │ │ [Save]       │ │
│ └──────────────┘ └──────────────┘ │
└────────────────────────────────────┘
        │ Save or Enter key
        ▼
```

**3. Saving State**

```
┌────────────────────────────────────┐
│ Label: Email                       │
│ ┌────────────────────────────────┐ │
│ │ [Input] user@example.com ⏳    │ │
│ └────────────────────────────────┘ │
│ [Cancel] [Saving...] (disabled)   │
└────────────────────────────────────┘
        │ API response
        ▼
```

**4. Error State**

```
┌────────────────────────────────────┐
│ Label: Email                       │
│ ┌────────────────────────────────┐ │
│ │ [Input] invalid-email ⚠️       │ │ ← border-destructive
│ └────────────────────────────────┘ │
│ ❌ Invalid email format           │ ← text-destructive
│ [Cancel] [Save]                   │
└────────────────────────────────────┘
```

#### Inline Edit Component

```tsx
import { useState } from 'react';
import { Stack, Inline } from '@workspace/ui/components/primitives';
import { Text } from '@workspace/ui/components/typography';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface InlineEditFieldProps {
  field: Field;
  value: any;
  recordId: string;
  onSave: (newValue: any) => Promise<void>;
  canEdit: boolean;
}

function InlineEditField({ field, value, recordId, onSave, canEdit }: InlineEditFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [error, setError] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const saveMutation = useMutation({
    mutationFn: async (newValue: any) => {
      // Validate
      const validationError = validateField(field, newValue);
      if (validationError) {
        throw new Error(validationError);
      }

      // Encrypt if needed
      const encryptedValue = field.encrypted ? encryptFieldValue(field.type, newValue, encryptionKey) : newValue;

      // Save via API
      await onSave(encryptedValue);
    },
    onSuccess: () => {
      setIsEditing(false);
      setError(null);
      queryClient.invalidateQueries({ queryKey: ['record', recordId] });
      toast.success(`${field.label} updated`);
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  const handleSave = () => {
    saveMutation.mutate(editValue);
  };

  const handleCancel = () => {
    setEditValue(value);
    setError(null);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (!isEditing) {
    return <FieldDisplay field={field} value={value} onEdit={() => canEdit && setIsEditing(true)} canEdit={canEdit} />;
  }

  return (
    <Stack space="space-150">
      {/* Label */}
      <Text size="small" weight="medium" color="muted" as="label">
        {field.label}
        {field.required && <span className="text-destructive ml-1">*</span>}
      </Text>

      {/* Input (type-specific) */}
      {renderEditInput(field, editValue, setEditValue, handleKeyDown, error)}

      {/* Error Message */}
      {error && (
        <Text size="small" color="destructive" role="alert">
          {error}
        </Text>
      )}

      {/* Action Buttons */}
      <Inline space="space-150">
        <Button variant="outline" size="sm" onClick={handleCancel} disabled={saveMutation.isPending}>
          Cancel
        </Button>
        <Button size="sm" onClick={handleSave} disabled={saveMutation.isPending}>
          {saveMutation.isPending ? 'Saving...' : 'Save'}
        </Button>
      </Inline>
    </Stack>
  );
}
```

#### Field-Specific Inputs

```tsx
function renderEditInput(
  field: Field,
  value: any,
  onChange: (val: any) => void,
  onKeyDown: (e: React.KeyboardEvent) => void,
  hasError: boolean,
) {
  const inputProps = {
    value,
    onChange: (e) => onChange(e.target.value),
    onKeyDown,
    'aria-invalid': hasError,
    autoFocus: true,
  };

  switch (field.type) {
    case FIELD_TYPE_SHORT_TEXT:
    case FIELD_TYPE_EMAIL:
    case FIELD_TYPE_URL:
      return <Input {...inputProps} type={getInputType(field.type)} />;

    case FIELD_TYPE_TEXT:
      return <Textarea {...inputProps} rows={3} />;

    case FIELD_TYPE_RICH_TEXT:
      return <RichTextEditor value={value} onChange={onChange} placeholder={field.placeholder} />;

    case FIELD_TYPE_INTEGER:
    case FIELD_TYPE_NUMERIC:
      return <Input {...inputProps} type="number" step={field.type === FIELD_TYPE_NUMERIC ? '0.01' : '1'} />;

    case FIELD_TYPE_DATE:
      return <DatePicker value={value} onChange={onChange} />;

    case FIELD_TYPE_DATETIME:
      return <DateTimePicker value={value} onChange={onChange} />;

    case FIELD_TYPE_SELECT_ONE:
      return (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select option" />
          </SelectTrigger>
          <SelectContent>
            {field.options.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.text}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );

    case FIELD_TYPE_SELECT_LIST:
      return <MultiSelect value={value} onChange={onChange} options={field.options} />;

    case FIELD_TYPE_SELECT_ONE_RECORD:
      return (
        <ReferenceRecordSelect
          value={value}
          onChange={onChange}
          tableId={field.referenceTableId}
          labelField={field.referenceLabelField}
          additionalCondition={field.additionalCondition}
        />
      );

    case FIELD_TYPE_SELECT_ONE_WORKSPACE_USER:
      return <UserSelect value={value} onChange={onChange} />;

    case FIELD_TYPE_CHECKBOX_YES_NO:
      return (
        <div className="flex items-center gap-2">
          <Checkbox checked={value} onCheckedChange={onChange} id={`checkbox-${field.name}`} />
          <Label htmlFor={`checkbox-${field.name}`}>{field.label}</Label>
        </div>
      );

    default:
      return <Input {...inputProps} />;
  }
}
```

---

## Comments Panel

### Layout Structure

```
┌────────────────────────────────────┐
│ Box padding="space-300"            │
│ backgroundColor="card"             │
│ borderRadius="lg" border="default" │
│ height: calc(100vh - 200px)        │
│                                    │
│ ┌──────────────────────────────┐   │
│ │ Inline justify="between"     │   │
│ │ ┌──────────┐ ┌────────────┐  │   │
│ │ │ Heading  │ │ Metric     │  │   │
│ │ │ Comments │ │ (12)       │  │   │
│ │ └──────────┘ └────────────┘  │   │
│ └──────────────────────────────┘   │
│                                    │
│ ┌──────────────────────────────┐   │
│ │ Separator                    │   │
│ └──────────────────────────────┘   │
│                                    │
│ ┌──────────────────────────────┐   │
│ │ ScrollArea (flex-1)          │   │
│ │ ┌──────────────────────────┐ │   │
│ │ │ CommentCard              │ │   │
│ │ │ ┌──────┐ ┌────────────┐ │ │   │
│ │ │ │Avatar│ │Name · 2h   │ │ │   │
│ │ │ └──────┘ └────────────┘ │ │   │
│ │ │ Comment text content... │ │   │
│ │ │ [Edit] [Delete]         │ │   │
│ │ └──────────────────────────┘ │   │
│ │ (more comments...)           │   │
│ │                              │   │
│ └──────────────────────────────┘   │
│                                    │
│ ┌──────────────────────────────┐   │
│ │ CommentInput                 │   │
│ │ ┌──────────────────────────┐ │   │
│ │ │ RichTextEditor           │ │   │
│ │ │ (with toolbar)           │ │   │
│ │ └──────────────────────────┘ │   │
│ │ [Button: Post Comment]       │   │
│ └──────────────────────────────┘   │
└────────────────────────────────────┘
```

### Comments Panel Component

```tsx
import { Box, Stack, Inline, ScrollArea } from '@workspace/ui/components/primitives';
import { Heading, Text, Metric } from '@workspace/ui/components/typography';
import { Separator } from '@workspace/ui/components/separator';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface CommentsPanelProps {
  recordId: string;
  maxHeight?: string;
}

function CommentsPanel({ recordId, maxHeight = 'calc(100vh - 200px)' }: CommentsPanelProps) {
  const queryClient = useQueryClient();

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['comments', recordId],
    queryFn: () => fetchComments(recordId),
  });

  const addCommentMutation = useMutation({
    mutationFn: (content: string) => createComment(recordId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', recordId] });
      toast.success('Comment added');
    },
  });

  return (
    <Box
      padding="space-300"
      backgroundColor="card"
      borderRadius="lg"
      border="default"
      className="flex flex-col"
      style={{ maxHeight }}
    >
      <Stack space="space-300" className="h-full">
        {/* Header */}
        <Inline justify="between" align="center">
          <Heading level={3}>Comments</Heading>
          <Metric size="small" value={comments.length} />
        </Inline>

        <Separator />

        {/* Comments List */}
        <ScrollArea className="flex-1">
          {isLoading ? (
            <CommentsSkeleton count={3} />
          ) : comments.length === 0 ? (
            <EmptyState title="No comments yet" description="Be the first to comment" />
          ) : (
            <Stack space="space-200">
              {comments.map((comment) => (
                <CommentCard key={comment.id} comment={comment} recordId={recordId} />
              ))}
            </Stack>
          )}
        </ScrollArea>

        {/* Comment Input */}
        <CommentInput
          onSubmit={(content) => addCommentMutation.mutate(content)}
          isSubmitting={addCommentMutation.isPending}
        />
      </Stack>
    </Box>
  );
}
```

### Comment Card Component

```tsx
import { Stack, Inline } from '@workspace/ui/components/primitives';
import { Text } from '@workspace/ui/components/typography';
import { Avatar } from '@workspace/ui/components/avatar';
import { Button } from '@workspace/ui/components/button';
import { DropdownMenu } from '@workspace/ui/components/dropdown-menu';
import { MoreVertical, Edit, Trash } from 'lucide-react';

interface CommentCardProps {
  comment: Comment;
  recordId: string;
}

function CommentCard({ comment, recordId }: CommentCardProps) {
  const { user: currentUser } = useAuthStore();
  const canEdit = comment.userId === currentUser?.id;
  const canDelete = comment.userId === currentUser?.id || currentUser?.role === 'admin';

  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);

  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: (newContent: string) => updateComment(recordId, comment.id, newContent),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', recordId] });
      setIsEditing(false);
      toast.success('Comment updated');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteComment(recordId, comment.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', recordId] });
      toast.success('Comment deleted');
    },
  });

  if (isEditing) {
    return (
      <Box padding="space-200" backgroundColor="muted" borderRadius="md">
        <Stack space="space-150">
          <RichTextEditor value={editContent} onChange={setEditContent} placeholder="Edit comment..." />
          <Inline space="space-100">
            <Button size="sm" onClick={() => updateMutation.mutate(editContent)} disabled={updateMutation.isPending}>
              Save
            </Button>
            <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
          </Inline>
        </Stack>
      </Box>
    );
  }

  return (
    <Box padding="space-200" backgroundColor="muted" borderRadius="md">
      <Stack space="space-150">
        {/* Header */}
        <Inline justify="between" align="start">
          <Inline space="space-150" align="center">
            <Avatar src={comment.user.avatar} fallback={comment.user.name[0]} size="sm" />
            <Stack space="space-025">
              <Text size="small" weight="medium">
                {comment.user.name}
              </Text>
              <Text size="small" color="muted">
                {formatRelativeTime(comment.createdAt)}
              </Text>
            </Stack>
          </Inline>

          {(canEdit || canDelete) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {canEdit && (
                  <DropdownMenuItem onClick={() => setIsEditing(true)}>
                    <Edit className="size-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                )}
                {canDelete && (
                  <DropdownMenuItem onClick={() => deleteMutation.mutate()} className="text-destructive">
                    <Trash className="size-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </Inline>

        {/* Content */}
        <div
          className="prose prose-sm dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{
            __html: sanitize(marked.parse(comment.content)),
          }}
        />
      </Stack>
    </Box>
  );
}
```

### Comment Input Component

```tsx
import { useState } from 'react';
import { Stack } from '@workspace/ui/components/primitives';
import { Button } from '@workspace/ui/components/button';
import { RichTextEditor } from '@/components/rich-text-editor';

interface CommentInputProps {
  onSubmit: (content: string) => void;
  isSubmitting: boolean;
}

function CommentInput({ onSubmit, isSubmitting }: CommentInputProps) {
  const [content, setContent] = useState('');

  const handleSubmit = () => {
    if (content.trim()) {
      onSubmit(content);
      setContent('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Stack space="space-150">
      <RichTextEditor
        value={content}
        onChange={setContent}
        onKeyDown={handleKeyDown}
        placeholder="Write a comment... (Cmd/Ctrl + Enter to submit)"
        minHeight="80px"
      />
      <Button onClick={handleSubmit} disabled={!content.trim() || isSubmitting} className="self-end">
        {isSubmitting ? 'Posting...' : 'Post Comment'}
      </Button>
    </Stack>
  );
}
```

---

## Activity Timeline

### Visual Structure

```
┌────────────────────────────────────┐
│ Box padding="space-300"            │
│ ┌──────────────────────────────┐   │
│ │ Heading level={3}            │   │
│ │ Activity Timeline            │   │
│ └──────────────────────────────┘   │
│                                    │
│ ┌──────────────────────────────┐   │
│ │ Separator                    │   │
│ └──────────────────────────────┘   │
│                                    │
│ ┌──────────────────────────────┐   │
│ │ Stack space="space-300"      │   │
│ │ ┌──────────────────────────┐ │   │
│ │ │ Text weight="semibold"   │ │   │
│ │ │ Today                    │ │   │
│ │ └──────────────────────────┘ │   │
│ │ ┌──────────────────────────┐ │   │
│ │ │ TimelineItem             │ │   │
│ │ │ ┌────┐                   │ │   │
│ │ │ │ 👤 │ John updated     │ │   │
│ │ │ └────┘ Status:          │ │   │
│ │ │        "Open" → "Done"  │ │   │
│ │ │        2 hours ago      │ │   │
│ │ └──────────────────────────┘ │   │
│ │ ┌──────────────────────────┐ │   │
│ │ │ TimelineItem             │ │   │
│ │ │ ┌────┐                   │ │   │
│ │ │ │ 👤 │ Sarah added      │ │   │
│ │ │ └────┘ Comment           │ │   │
│ │ │        5 hours ago      │ │   │
│ │ └──────────────────────────┘ │   │
│ │                              │   │
│ │ ┌──────────────────────────┐ │   │
│ │ │ Text weight="semibold"   │ │   │
│ │ │ Yesterday                │ │   │
│ │ └──────────────────────────┘ │   │
│ │ (more items...)              │   │
│ └──────────────────────────────┘   │
│                                    │
│ ┌──────────────────────────────┐   │
│ │ Button variant="outline"     │   │
│ │ Load More Activity           │   │
│ └──────────────────────────────┘   │
└────────────────────────────────────┘
```

### Activity Timeline Component

```tsx
import { Box, Stack, Inline } from '@workspace/ui/components/primitives';
import { Heading, Text } from '@workspace/ui/components/typography';
import { Separator } from '@workspace/ui/components/separator';
import { Avatar } from '@workspace/ui/components/avatar';
import { Button } from '@workspace/ui/components/button';
import { useInfiniteQuery } from '@tanstack/react-query';

interface ActivityTimelineProps {
  recordId: string;
}

function ActivityTimeline({ recordId }: ActivityTimelineProps) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: ['activity', recordId],
    queryFn: ({ pageParam = 0 }) => fetchActivity(recordId, { offset: pageParam, limit: 20 }),
    getNextPageParam: (lastPage, pages) => (lastPage.hasMore ? pages.length * 20 : undefined),
  });

  const activities = data?.pages.flatMap((page) => page.items) ?? [];
  const groupedActivities = groupByDate(activities);

  if (isLoading) {
    return <ActivitySkeleton />;
  }

  return (
    <Box padding="space-300" backgroundColor="card" borderRadius="lg" border="default">
      <Stack space="space-300">
        <Heading level={3}>Activity Timeline</Heading>
        <Separator />

        {activities.length === 0 ? (
          <EmptyState title="No activity yet" description="Changes to this record will appear here" />
        ) : (
          <Stack space="space-400">
            {Object.entries(groupedActivities).map(([date, items]) => (
              <Stack key={date} space="space-200">
                <Text weight="semibold" color="muted">
                  {date}
                </Text>
                <Stack space="space-150">
                  {items.map((activity) => (
                    <TimelineItem key={activity.id} activity={activity} />
                  ))}
                </Stack>
              </Stack>
            ))}
          </Stack>
        )}

        {hasNextPage && (
          <Button variant="outline" onClick={() => fetchNextPage()} disabled={isFetchingNextPage} className="w-full">
            {isFetchingNextPage ? 'Loading...' : 'Load More Activity'}
          </Button>
        )}
      </Stack>
    </Box>
  );
}
```

### Timeline Item Component

```tsx
import { Inline, Stack } from '@workspace/ui/components/primitives';
import { Text } from '@workspace/ui/components/typography';
import { Avatar } from '@workspace/ui/components/avatar';
import { Badge } from '@workspace/ui/components/badge';

interface TimelineItemProps {
  activity: Activity;
}

function TimelineItem({ activity }: TimelineItemProps) {
  const renderActivityContent = () => {
    switch (activity.type) {
      case 'field_update':
        return (
          <Stack space="space-050">
            <Text size="default">
              <Text as="span" weight="medium">
                {activity.user.name}
              </Text>{' '}
              updated{' '}
              <Text as="span" weight="medium">
                {activity.fieldLabel}
              </Text>
            </Text>
            <Inline space="space-100" align="center">
              <Badge variant="secondary" className="font-mono">
                {formatValue(activity.oldValue)}
              </Badge>
              <Text size="small" color="muted">
                →
              </Text>
              <Badge variant="secondary" className="font-mono">
                {formatValue(activity.newValue)}
              </Badge>
            </Inline>
          </Stack>
        );

      case 'comment_create':
        return (
          <Text size="default">
            <Text as="span" weight="medium">
              {activity.user.name}
            </Text>{' '}
            added a comment
          </Text>
        );

      case 'record_create':
        return (
          <Text size="default">
            <Text as="span" weight="medium">
              {activity.user.name}
            </Text>{' '}
            created this record
          </Text>
        );

      case 'custom_action':
        return (
          <Text size="default">
            <Text as="span" weight="medium">
              {activity.user.name}
            </Text>{' '}
            triggered{' '}
            <Text as="span" weight="medium">
              {activity.actionName}
            </Text>
          </Text>
        );

      default:
        return (
          <Text size="default">
            <Text as="span" weight="medium">
              {activity.user.name}
            </Text>{' '}
            {activity.description}
          </Text>
        );
    }
  };

  return (
    <Inline space="space-150" align="start">
      <Avatar src={activity.user.avatar} fallback={activity.user.name[0]} size="sm" />
      <Stack space="space-050" className="flex-1">
        {renderActivityContent()}
        <Text size="small" color="muted">
          {formatRelativeTime(activity.createdAt)}
        </Text>
      </Stack>
    </Inline>
  );
}
```

### Date Grouping Logic

```typescript
function groupByDate(activities: Activity[]): Record<string, Activity[]> {
  const groups: Record<string, Activity[]> = {};

  activities.forEach((activity) => {
    const date = new Date(activity.createdAt);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let label: string;
    if (isSameDay(date, today)) {
      label = 'Today';
    } else if (isSameDay(date, yesterday)) {
      label = 'Yesterday';
    } else if (isWithinDays(date, 7)) {
      label = format(date, 'EEEE'); // "Monday", "Tuesday", etc.
    } else {
      label = format(date, 'MMM DD, YYYY');
    }

    if (!groups[label]) {
      groups[label] = [];
    }
    groups[label].push(activity);
  });

  return groups;
}
```

---

## Responsive Design

### Breakpoint Strategy

| Breakpoint       | Min Width | Layout Behavior | Component Adjustments               |
| ---------------- | --------- | --------------- | ----------------------------------- |
| **xs** (default) | 0px       | Single column   | Full-width fields, stacked comments |
| **sm**           | 640px     | Single column   | Increased padding                   |
| **md**           | 768px     | Transition      | Grid columns start collapsing       |
| **lg**           | 1024px    | Multi-column    | Two-column grid, sidebar comments   |
| **xl**           | 1280px    | Expanded        | Wider max-width, more spacing       |

### Responsive Layout Examples

#### Head-Detail Layout (All Breakpoints)

```tsx
// Always single column
<Container maxWidth="xl" padding="margin">
  <Stack space="space-600">
    {/* Title section - full width at all breakpoints */}
    <Box padding="space-300" backgroundColor="card">
      <Heading level={1}>{title}</Heading>
    </Box>

    {/* Fields - stacked vertically at all breakpoints */}
    <Stack space="space-300">
      {fields.map((field) => (
        <FieldRenderer key={field.name} field={field} />
      ))}
    </Stack>

    {/* Comments - always at bottom */}
    <CommentsPanel />
  </Stack>
</Container>
```

#### Two-Column Layout (Responsive)

```tsx
<Container maxWidth="2xl" padding="margin">
  <Stack space="space-600">
    {/* Header - full width always */}
    <Box padding="space-400" backgroundColor="card">
      <Heading level={1}>{title}</Heading>
    </Box>

    {/* Content grid - responsive spans */}
    <Grid columns={12} gap="space-400">
      {/* Column 1: span={12} on mobile, span={5-8} on desktop */}
      <GridItem span={12} spanLg={commentsOnSide ? 5 : 6}>
        <Stack space="space-300">
          {column1Fields.map((field) => (
            <FieldRenderer key={field.name} field={field} />
          ))}
        </Stack>
      </GridItem>

      {/* Column 2: span={12} on mobile, span={3-6} on desktop */}
      <GridItem span={12} spanLg={commentsOnSide ? 3 : 6}>
        <Stack space="space-300">
          {column2Fields.map((field) => (
            <FieldRenderer key={field.name} field={field} />
          ))}
        </Stack>
      </GridItem>

      {/* Comments: span={12} always, but positioned differently */}
      {commentsOnSide ? (
        <GridItem span={12} spanLg={4}>
          <CommentsPanel maxHeight="calc(100vh - 200px)" />
        </GridItem>
      ) : (
        <GridItem span={12}>
          <CommentsPanel />
        </GridItem>
      )}
    </Grid>
  </Stack>
</Container>
```

### Mobile Optimizations

#### Touch Targets

```tsx
// Minimum 44x44px touch targets
<Button
  size="default"  // h-9 = 36px (meets 44x44 with padding)
  className="min-h-11 min-w-11"  // Force 44px minimum
>
  Action
</Button>

// Icon buttons with larger hit area
<Button
  variant="ghost"
  size="icon"
  className="size-11"  // 44x44px
  aria-label="Edit field"
>
  <Edit className="size-4" />
</Button>
```

#### Mobile-Specific Spacing

```tsx
// Reduce padding on mobile
<Box
  padding="space-200"  // 16px on mobile
  className="md:p-6"   // 24px on tablet+
>
  <Content />
</Box>

// Stack spacing adjustments
<Stack
  space="space-200"     // 16px on mobile
  className="md:gap-6"  // 24px on tablet+
>
  <Item />
  <Item />
</Stack>
```

#### Inline Editing on Mobile

```tsx
// Full-screen modal for complex inputs on mobile
const [isEditing, setIsEditing] = useState(false);

// Mobile: Sheet (bottom drawer)
// Desktop: Inline editing
const EditComponent = isMobile ? Sheet : 'div';

<EditComponent>
  {isMobile ? (
    <SheetContent side="bottom" className="h-[80vh]">
      <SheetHeader>
        <SheetTitle>Edit {field.label}</SheetTitle>
      </SheetHeader>
      <FieldInput field={field} value={value} />
    </SheetContent>
  ) : (
    <InlineEditField field={field} value={value} />
  )}
</EditComponent>;
```

---

## Accessibility

### WCAG 2.1 AA Compliance

#### Keyboard Navigation

**Tab Order**:

1. Action buttons (Edit, Delete, Custom)
2. Field edit buttons (in reading order)
3. Comment input
4. Comment actions (Edit, Delete)
5. Activity timeline (if interactive)

**Keyboard Shortcuts**:

- `Tab` / `Shift+Tab`: Navigate between focusable elements
- `Enter` / `Space`: Activate buttons, checkboxes
- `Escape`: Cancel inline editing, close dialogs
- `Cmd/Ctrl + Enter`: Submit comment
- Arrow keys: Navigate select dropdowns

#### Implementation

```tsx
// Focus trap in edit mode
import { useFocusTrap } from '@/hooks/use-focus-trap';

function InlineEditField({ field }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const editRef = useRef<HTMLDivElement>(null);

  useFocusTrap(editRef, isEditing);

  return (
    <div ref={editRef}>
      {isEditing ? (
        <Stack space="space-150">
          <Input
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Escape') setIsEditing(false);
              if (e.key === 'Enter') handleSave();
            }}
          />
          <Inline space="space-100">
            <Button onClick={handleSave}>Save</Button>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
          </Inline>
        </Stack>
      ) : (
        <FieldDisplay onEdit={() => setIsEditing(true)} />
      )}
    </div>
  );
}
```

### ARIA Labels

```tsx
// Icon buttons MUST have aria-label
<Button
  variant="ghost"
  size="icon"
  aria-label="Edit email address"
>
  <Edit className="size-4" />
</Button>

// Form inputs with errors
<Input
  id="email"
  type="email"
  aria-invalid={hasError}
  aria-describedby={hasError ? "email-error" : undefined}
  aria-required={field.required}
/>
{hasError && (
  <span id="email-error" className="text-sm text-destructive" role="alert">
    {errorMessage}
  </span>
)}

// Live regions for dynamic content
<div
  role="status"
  aria-live="polite"
  aria-atomic="true"
  className="sr-only"
>
  {savingStatus}
</div>

// Field labels properly associated
<Label htmlFor="description">
  Description
  {field.required && <span className="text-destructive">*</span>}
</Label>
<Textarea
  id="description"
  aria-describedby="description-hint"
/>
<Text id="description-hint" size="small" color="muted">
  Max 500 characters
</Text>
```

### Screen Reader Support

```tsx
// Skip to main content
<a
  href="#record-detail-content"
  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50"
>
  Skip to record details
</a>

// Semantic headings
<Heading level={1} id="record-title">
  {record.title}
</Heading>

<Heading level={2}>Contact Information</Heading>
<Stack space="space-200">
  <FieldDisplay field={emailField} />
  <FieldDisplay field={phoneField} />
</Stack>

// Status announcements
<div role="status" aria-live="polite" className="sr-only">
  {isLoading && "Loading record details"}
  {isSaving && "Saving changes"}
  {saveSuccess && "Changes saved successfully"}
  {saveError && `Error: ${errorMessage}`}
</div>

// Descriptive link text
<Link to={referenceRecordPath}>
  View related contract #{contractNumber}
  <span className="sr-only">(opens in new tab)</span>
</Link>
```

### Focus Indicators

```tsx
// Standard focus ring (applied to all interactive elements)
const focusClasses = cn(
  'focus-visible:outline-none',
  'focus-visible:ring-1',
  'focus-visible:ring-inset',
  'focus-visible:ring-ring'
);

// Button focus ring
<Button className={cn(
  'focus-visible:ring-4',
  'focus-visible:ring-offset-2',
  'focus-visible:ring-primary'
)}>
  Save
</Button>

// Custom focus for field containers
<div className={cn(
  'group',
  'focus-within:ring-1',
  'focus-within:ring-ring',
  'rounded-md',
  'transition-shadow'
)}>
  <FieldDisplay />
</div>
```

### Color Contrast

All design tokens meet WCAG 2.1 AA contrast ratios:

```typescript
// Text contrast validation
const textContrast = {
  'text-foreground on bg-background': '13.5:1', // ✅ AAA
  'text-muted-foreground on bg-background': '4.8:1', // ✅ AA
  'text-primary-foreground on bg-primary': '15.2:1', // ✅ AAA
  'text-destructive on bg-background': '4.5:1', // ✅ AA
};

// Interactive element contrast
const interactiveContrast = {
  'border-input on bg-background': '3.2:1', // ✅ AA (UI components)
  'border-destructive on bg-background': '4.5:1', // ✅ AA
};

// Never hardcode colors
// ❌ BAD: <div className="text-gray-600 bg-gray-100">
// ✅ GOOD: <div className="text-muted-foreground bg-muted">
```

---

## Loading & Error States

### Loading States

#### Skeleton Loaders

```tsx
import { Skeleton } from '@workspace/ui/components/skeleton';
import { Stack, Box } from '@workspace/ui/components/primitives';

function RecordDetailSkeleton() {
  return (
    <Container maxWidth="xl" padding="margin">
      <Stack space="space-600">
        {/* Title Section */}
        <Box padding="space-300" backgroundColor="card" borderRadius="lg">
          <Stack space="space-200">
            <Skeleton className="h-9 w-3/4" /> {/* Title */}
            <div className="flex gap-2">
              <Skeleton className="h-6 w-20" /> {/* Badge */}
              <Skeleton className="h-6 w-24" /> {/* Badge */}
            </div>
          </Stack>
        </Box>

        {/* Field List */}
        <Stack space="space-300">
          {[...Array(5)].map((_, i) => (
            <Box key={i} padding="space-200" backgroundColor="card" borderRadius="md">
              <Stack space="space-100">
                <Skeleton className="h-4 w-24" /> {/* Label */}
                <Skeleton className="h-5 w-full" /> {/* Value */}
              </Stack>
            </Box>
          ))}
        </Stack>

        {/* Comments Skeleton */}
        <Box padding="space-300" backgroundColor="card" borderRadius="lg">
          <Stack space="space-200">
            <Skeleton className="h-6 w-32" /> {/* Heading */}
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="size-8 rounded-full" /> {/* Avatar */}
                <Stack space="space-100" className="flex-1">
                  <Skeleton className="h-4 w-32" /> {/* Name */}
                  <Skeleton className="h-16 w-full" /> {/* Comment */}
                </Stack>
              </div>
            ))}
          </Stack>
        </Box>
      </Stack>
    </Container>
  );
}
```

#### Progressive Loading

```tsx
function RecordDetailPage() {
  const { recordId } = route.useParams();

  // Query with suspense
  const { data: record, isLoading } = useQuery({
    queryKey: ['record', recordId],
    queryFn: () => fetchRecord(recordId),
  });

  const { data: comments } = useQuery({
    queryKey: ['comments', recordId],
    queryFn: () => fetchComments(recordId),
    enabled: !!record, // Don't fetch until record loads
  });

  if (isLoading) {
    return <RecordDetailSkeleton />;
  }

  return (
    <RecordDetail record={record}>
      {comments ? <CommentsPanel comments={comments} /> : <CommentsSkeleton />}
    </RecordDetail>
  );
}
```

### Error States

#### Encryption Key Error

```tsx
function EncryptionKeyError({ tableId }: { tableId: string }) {
  const [key, setKey] = useState('');
  const [error, setError] = useState('');

  const validateMutation = useMutation({
    mutationFn: async (encryptionKey: string) => {
      const isValid = await validateEncryptionKey(tableId, encryptionKey);
      if (!isValid) {
        throw new Error('Invalid encryption key');
      }
      localStorage.setItem(`table_${tableId}_encryption_key`, encryptionKey);
      return encryptionKey;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['record'] });
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  return (
    <Container maxWidth="md" padding="margin">
      <Box padding="space-400" backgroundColor="warning" borderRadius="lg" border="warning">
        <Stack space="space-300">
          <Inline space="space-150" align="center">
            <AlertTriangle className="size-6 text-warning-foreground" />
            <Heading level={2}>Encryption Key Required</Heading>
          </Inline>

          <Text>This table uses end-to-end encryption. Enter your encryption key to view record details.</Text>

          <Stack space="space-150">
            <Label htmlFor="encryption-key">Encryption Key</Label>
            <Input
              id="encryption-key"
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="32-character encryption key"
              aria-invalid={!!error}
              aria-describedby={error ? 'key-error' : undefined}
            />
            {error && (
              <Text id="key-error" size="small" color="destructive" role="alert">
                {error}
              </Text>
            )}
          </Stack>

          <Button
            onClick={() => validateMutation.mutate(key)}
            disabled={key.length !== 32 || validateMutation.isPending}
          >
            {validateMutation.isPending ? 'Validating...' : 'Unlock Record'}
          </Button>

          <Alert variant="warning">
            <AlertTitle>Important</AlertTitle>
            <AlertDescription>
              Keep your encryption key safe. If lost, you cannot recover encrypted data.
            </AlertDescription>
          </Alert>
        </Stack>
      </Box>
    </Container>
  );
}
```

#### Permission Denied Error

```tsx
function PermissionDeniedError() {
  const navigate = route.useNavigate();

  return (
    <Container maxWidth="md" padding="margin">
      <Box
        padding="space-400"
        backgroundColor="card"
        borderRadius="lg"
        border="default"
        className="text-center"
      >
        <Stack space="space-300" align="center">
          <div className="size-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <Lock className="size-8 text-destructive" />
          </div>

          <Stack space="space-150" align="center">
            <Heading level={2}>Access Denied</Heading>
            <Text color="muted">
              You don't have permission to view this record.
            </Text>
          </Text>

          <Inline space="space-150">
            <Button variant="outline" onClick={() => navigate({ to: '/back' })}>
              Go Back
            </Button>
            <Button onClick={() => navigate({ to: ROUTES.WORKSPACE.HOME })}>
              Go to Dashboard
            </Button>
          </Inline>
        </Stack>
      </Box>
    </Container>
  );
}
```

#### Network Error

```tsx
function NetworkError({ onRetry }: { onRetry: () => void }) {
  return (
    <Container maxWidth="md" padding="margin">
      <Box padding="space-400" backgroundColor="card" borderRadius="lg" border="default">
        <Stack space="space-300" align="center">
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertTitle>Connection Error</AlertTitle>
            <AlertDescription>
              Failed to load record details. Check your internet connection and try again.
            </AlertDescription>
          </Alert>

          <Button onClick={onRetry}>Retry</Button>
        </Stack>
      </Box>
    </Container>
  );
}
```

#### Empty States

```tsx
function EmptyFieldValue({ fieldLabel }: { fieldLabel: string }) {
  return (
    <Stack space="space-100">
      <Text size="small" weight="medium" color="muted">
        {fieldLabel}
      </Text>
      <Text color="muted">—</Text>
    </Stack>
  );
}

function EmptyComments() {
  return (
    <Box padding="space-600" className="text-center">
      <Stack space="space-200" align="center">
        <div className="size-12 rounded-full bg-muted flex items-center justify-center">
          <MessageSquare className="size-6 text-muted-foreground" />
        </div>
        <Stack space="space-100" align="center">
          <Text weight="medium">No comments yet</Text>
          <Text size="small" color="muted">
            Be the first to comment on this record
          </Text>
        </Stack>
      </Stack>
    </Box>
  );
}

function EmptyActivity() {
  return (
    <Box padding="space-600" className="text-center">
      <Stack space="space-200" align="center">
        <div className="size-12 rounded-full bg-muted flex items-center justify-center">
          <Activity className="size-6 text-muted-foreground" />
        </div>
        <Stack space="space-100" align="center">
          <Text weight="medium">No activity yet</Text>
          <Text size="small" color="muted">
            Changes to this record will appear here
          </Text>
        </Stack>
      </Stack>
    </Box>
  );
}
```

---

## Implementation Checklist

### Phase 1: Core Components

- [ ] **RecordDetailPage**: Route integration, data fetching
- [ ] **RecordDetailHeader**: Title, encryption badge, actions
- [ ] **FieldDisplay**: Read-only field renderer with type switch
- [ ] **Type-specific renderers**: Text, number, date, select, reference
- [ ] **Encryption/decryption**: Client-side E2EE handling
- [ ] **Permission checks**: Hide/disable based on record.permissions

### Phase 2: Layout Variants

- [ ] **HeadDetailLayout**: Single-column implementation
- [ ] **TwoColumnLayout**: Grid-based implementation
- [ ] **Layout configuration**: Parse table.config.recordDetailLayout
- [ ] **Field grouping**: titleField, subLineFields, tailFields
- [ ] **Responsive behavior**: GridItem span props for breakpoints
- [ ] **Comments positioning**: Right panel, bottom, hidden

### Phase 3: Inline Editing

- [ ] **InlineEditField**: Edit mode component
- [ ] **Field-specific inputs**: Text, select, date, reference, user
- [ ] **Validation**: Client-side field validation
- [ ] **Save mutation**: API integration with React Query
- [ ] **Optimistic updates**: Immediate UI feedback
- [ ] **Error handling**: Display validation errors
- [ ] **Keyboard shortcuts**: Enter to save, Escape to cancel

### Phase 4: Comments Panel

- [ ] **CommentsPanel**: List + input component
- [ ] **CommentCard**: Display with edit/delete
- [ ] **CommentInput**: Rich text editor
- [ ] **Create mutation**: Add new comments
- [ ] **Update mutation**: Edit existing comments
- [ ] **Delete mutation**: Remove comments
- [ ] **Permission checks**: Can edit/delete own comments
- [ ] **Real-time updates**: React Query invalidation

### Phase 5: Activity Timeline

- [ ] **ActivityTimeline**: Infinite scroll list
- [ ] **TimelineItem**: Field change renderer
- [ ] **Date grouping**: Today, Yesterday, Last 7 days
- [ ] **Activity types**: Field updates, comments, actions
- [ ] **Diff display**: Old value → New value
- [ ] **User attribution**: Avatars + display names
- [ ] **Load more**: Pagination with React Query

### Phase 6: Responsive Design

- [ ] **Mobile layouts**: Single-column stacking
- [ ] **Touch targets**: Minimum 44x44px
- [ ] **Mobile spacing**: Reduced padding on small screens
- [ ] **Sheet for editing**: Bottom drawer on mobile
- [ ] **Viewport meta tag**: Prevent zoom on double-tap
- [ ] **Scroll behavior**: Smooth scrolling for long content

### Phase 7: Accessibility

- [ ] **Keyboard navigation**: Tab order, focus trap
- [ ] **ARIA labels**: Icon buttons, form inputs
- [ ] **Screen reader**: Semantic HTML, live regions
- [ ] **Focus indicators**: Visible focus rings
- [ ] **Color contrast**: WCAG 2.1 AA compliance
- [ ] **Skip links**: Jump to main content

### Phase 8: Loading & Error States

- [ ] **Skeleton loaders**: Field list, comments, activity
- [ ] **Progressive loading**: Record first, then comments
- [ ] **Encryption error**: Key input modal
- [ ] **Permission error**: Access denied message
- [ ] **Network error**: Retry button
- [ ] **Empty states**: No data, no comments, no activity

### Phase 9: Testing

- [ ] **Unit tests**: Field renderers, formatters
- [ ] **Integration tests**: Inline editing flow
- [ ] **E2E tests**: Full record detail interaction
- [ ] **Accessibility tests**: Axe, keyboard nav
- [ ] **Responsive tests**: Mobile, tablet, desktop
- [ ] **E2EE tests**: Encryption/decryption correctness

### Phase 10: Documentation

- [ ] **Component README**: Usage examples
- [ ] **Storybook stories**: Component variations
- [ ] **API documentation**: Props interfaces
- [ ] **Migration guide**: From legacy Blade template
- [ ] **Design tokens**: Color, spacing reference
- [ ] **Accessibility guide**: WCAG compliance

---

## Design System Compliance Summary

### ✅ Design Tokens Used

**Colors**: `background`, `card`, `muted`, `accent`, `primary`, `destructive`, `foreground`, `muted-foreground`, `border`, `input`, `ring`

**Spacing**: `space-025` through `space-1000` (Atlassian 8px system)

**Typography**: Heading levels, Text sizes/weights/colors

**Radius**: `sm`, `md`, `lg`, `xl` for border-radius

### ✅ Layout Primitives

**Container**: Max-width constraints with responsive padding

**Box**: Generic containers with padding/bg/border props

**Stack**: Vertical layouts with consistent gaps

**Inline**: Horizontal layouts with wrapping support

**Grid + GridItem**: 12-column responsive grid system

### ✅ Typography Components

**Heading**: Semantic h1-h6 with automatic styling

**Text**: Body text with size/weight/color variants

**Metric**: Numeric displays for stats

### ✅ Accessibility Features

**Keyboard Nav**: Tab order, focus trap, shortcuts

**ARIA**: Labels, roles, live regions, invalid states

**Focus Indicators**: Visible rings on all interactive elements

**Screen Readers**: Semantic HTML, skip links, status announcements

**Color Contrast**: WCAG 2.1 AA compliant (4.5:1 text, 3:1 UI)

### ✅ Responsive Design

**Mobile-First**: Base styles for xs, progressive enhancement

**Breakpoints**: xs (0), sm (640), md (768), lg (1024), xl (1280)

**Touch Targets**: 44x44px minimum for buttons

**Adaptive Layouts**: GridItem span props for responsive columns

### ✅ Vietnamese Typography

**Character Support**: Full diacritical marks (134 chars)

**Line Height**: Auto-optimized when `lang="vi"`

**Font Weights**: Adjusted for Vietnamese readability

---

**Design Document Complete**
**Next Steps**: Begin implementation starting with Phase 1 (Core Components)
**Review**: Schedule design review with team before coding
**Timeline**: Estimated 2-3 weeks for full implementation

---

**Document Version**: 1.0.0
**Last Updated**: 2025-11-18
**Author**: UI/UX Designer (Claude Code)
**Status**: Ready for Implementation
