# Phase 2: Core Package Implementation

**Phase**: 2 of 4
**Duration**: 3-4 days
**Status**: Not Started
**Dependencies**: Phase 1 (Analysis & Design)

## Context

Build reusable React components in `@workspace/active-tables-core` package for record detail view. Components must be API-agnostic, props-based, and reusable across multiple projects (current web app + future low-code/no-code platform).

## Overview

Implement core components:

- `RecordDetail` - Main container component
- `HeadDetailLayout` - Mobile-friendly layout
- `TwoColumnDetailLayout` - Desktop-optimized layout
- `FieldDisplay` - Read-only field renderer (25+ types)
- `InlineEditField` - Inline editing wrapper
- `ActivityTimeline` - Record history display
- `RelatedRecords` - Related records section
- Zustand store for UI state
- Hooks for common operations

## Key Insights

### Component Philosophy

**Separation of Concerns:**

- **Presentation**: Components only render, no API calls
- **Business Logic**: Hooks handle data fetching, mutations
- **State**: Zustand for UI state, React Query for server state
- **Styling**: Design tokens only, no hardcoded values

**Reusability Patterns:**

- Accept data as props (no hard dependencies)
- Callbacks for actions (`onFieldChange`, `onDelete`)
- Flexible layouts via config props
- Support both controlled/uncontrolled modes

### Package Structure

```
packages/active-tables-core/src/
├── components/
│   └── record-detail/
│       ├── record-detail.tsx              # Main component
│       ├── layouts/
│       │   ├── head-detail-layout.tsx     # Layout 1
│       │   └── two-column-layout.tsx      # Layout 2
│       ├── fields/
│       │   ├── field-display.tsx          # Read-only renderer
│       │   ├── inline-edit-field.tsx      # Edit wrapper
│       │   └── field-renderers/
│       │       ├── text-field-display.tsx
│       │       ├── number-field-display.tsx
│       │       ├── date-field-display.tsx
│       │       ├── select-field-display.tsx
│       │       ├── reference-field-display.tsx
│       │       └── ...
│       ├── activity-timeline.tsx          # History display
│       ├── related-records.tsx            # Related records
│       └── index.ts                       # Barrel export
├── hooks/
│   ├── use-record-detail.ts               # Detail view state
│   ├── use-inline-edit.ts                 # Inline editing
│   └── use-field-display.ts               # Field rendering
├── stores/
│   └── detail-view-store.ts               # Zustand store
└── types/
    └── record-detail.ts                    # TypeScript types
```

## Requirements

### RecordDetail Component

**Purpose**: Main container that orchestrates layout, field rendering, and interactions

**Props:**

```typescript
interface RecordDetailProps {
  // Data
  record: TableRecord; // Decrypted record data
  table: Table; // Table config with fields

  // Layout
  layout?: 'head-detail' | 'two-column'; // Default: from config
  commentsPosition?: 'right-panel' | 'hidden'; // Default: from config

  // Callbacks
  onFieldChange?: (fieldName: string, value: any) => Promise<void>;
  onDelete?: () => Promise<void>;
  onRecordClick?: (recordId: string) => void; // Related records

  // Features
  readOnly?: boolean; // Disable editing
  showComments?: boolean; // Show comments panel
  showTimeline?: boolean; // Show activity timeline
  showRelatedRecords?: boolean; // Show related records

  // Reference data (for field rendering)
  referenceRecords?: Record<string, TableRecord[]>;
  userRecords?: Record<string, WorkspaceUser>;

  // Styling
  className?: string;
}
```

**Behavior:**

- Render layout based on `layout` prop
- Pass fields to `FieldDisplay` components
- Manage inline edit state (one field at a time)
- Show/hide comments panel based on `commentsPosition`
- Handle keyboard shortcuts (Escape to close inline edit)
- Display loading skeleton while data loading

### HeadDetailLayout Component

**Purpose**: Mobile-friendly layout with prominent title field

**Structure:**

```
┌────────────────────────────────────────┐
│ [Back] Record Title           [Actions]│
├────────────────────────────────────────┤
│ Sub-line Fields (badges/chips)         │
├────────────────────────────────────────┤
│ Field 1 Label                          │
│ Field 1 Value                          │
├────────────────────────────────────────┤
│ Field 2 Label                          │
│ Field 2 Value                          │
├────────────────────────────────────────┤
│ ...                                    │
├────────────────────────────────────────┤
│ Activity Timeline                      │
└────────────────────────────────────────┘
```

**Config:**

```typescript
recordDetailConfig: {
  layout: 'head-detail',
  titleField: 'task_name',           // Large heading
  subLineFields: ['status', 'assignee'], // Below title
  tailFields: ['description', 'due_date', ...], // Main content
}
```

### TwoColumnDetailLayout Component

**Purpose**: Desktop-optimized two-column layout

**Structure:**

```
┌─────────────────────────────────────────────────────────┐
│ [Back] Record Title                        [Actions]    │
├─────────────────────────────────────────────────────────┤
│ Sub-line Fields (badges/chips)                          │
├──────────────────────────────┬──────────────────────────┤
│ Column 1 Fields              │ Column 2 Fields          │
│                              │                          │
│ Field 1 Label                │ Field 4 Label            │
│ Field 1 Value                │ Field 4 Value            │
│                              │                          │
│ Field 2 Label                │ Field 5 Label            │
│ Field 2 Value                │ Field 5 Value            │
│                              │                          │
│ ...                          │ ...                      │
│                              │                          │
│ Activity Timeline            │                          │
└──────────────────────────────┴──────────────────────────┘
```

**Config:**

```typescript
recordDetailConfig: {
  layout: 'two-column-detail',
  headTitleField: 'customer_name',
  headSubLineFields: ['status', 'priority'],
  column1Fields: ['email', 'phone', 'company'],
  column2Fields: ['created_at', 'updated_at', 'tags'],
}
```

### FieldDisplay Component

**Purpose**: Render field value in read-only mode

**Props:**

```typescript
interface FieldDisplayProps {
  field: FieldConfig; // Field schema
  value: any; // Already decrypted
  referenceRecords?: Record<string, TableRecord[]>;
  userRecords?: Record<string, WorkspaceUser>;
  onDoubleClick?: () => void; // Trigger inline edit
  editable?: boolean; // Show edit indicator
  loading?: boolean; // Show skeleton
  error?: string; // Show error message
  className?: string;
}
```

**Rendering Logic:**

| Field Type                 | Display Component               | Example                |
| -------------------------- | ------------------------------- | ---------------------- |
| SHORT_TEXT                 | `<Text>`                        | "Hello World"          |
| TEXT                       | `<Text>` with line breaks       | "Line 1\nLine 2"       |
| RICH_TEXT                  | `<div dangerouslySetInnerHTML>` | "<p>HTML</p>"          |
| EMAIL                      | `<Link>` with mailto            | "user@example.com"     |
| URL                        | `<Link>` with external icon     | "https://example.com"  |
| INTEGER                    | `<Metric>`                      | 42                     |
| NUMERIC                    | `<Metric>` with decimals        | 123.45                 |
| DATE                       | `<Text>` formatted              | "Nov 18, 2025"         |
| DATETIME                   | `<Text>` formatted              | "Nov 18, 2025 9:34 PM" |
| TIME                       | `<Text>` formatted              | "9:34 PM"              |
| CHECKBOX_YES_NO            | `<Badge>` (Yes/No)              | "Yes"                  |
| SELECT_ONE                 | `<Badge>` with color            | "Active" (green)       |
| SELECT_LIST                | Multiple `<Badge>`              | "High", "Urgent"       |
| SELECT_ONE_RECORD          | `<Link>` to record              | "John Doe"             |
| SELECT_LIST_RECORD         | Multiple `<Link>`               | "John", "Jane"         |
| SELECT_ONE_WORKSPACE_USER  | `<Avatar>` + name               | "👤 John Doe"          |
| SELECT_LIST_WORKSPACE_USER | Multiple `<Avatar>`             | "👤👤👤"               |
| FIRST_REFERENCE_RECORD     | `<Link>` (read-only)            | "Related Record"       |

**Behavior:**

- Show hover effect if `editable`
- Show cursor pointer on hover
- Emit `onDoubleClick` event
- Show skeleton if `loading`
- Show error message if `error`

### InlineEditField Component

**Purpose**: Inline editing wrapper with save/cancel

**Props:**

```typescript
interface InlineEditFieldProps {
  field: FieldConfig;
  value: any;
  onSave: (value: any) => Promise<void>;
  onCancel: () => void;
  autoFocus?: boolean; // Focus on mount
  validateOnChange?: boolean; // Validate as user types
  className?: string;
}
```

**Features:**

- Show appropriate input based on field type
- Validate before save (required, format, constraints)
- Show loading state during save
- Show error message if save fails
- Keyboard shortcuts: Enter to save, Escape to cancel
- Click outside to cancel (optional)

**Input Components:**

| Field Type                   | Input Component                          | Library          |
| ---------------------------- | ---------------------------------------- | ---------------- |
| SHORT_TEXT, TEXT, EMAIL, URL | `<Input>`                                | shadcn/ui        |
| RICH_TEXT                    | `<RichTextEditor>`                       | Custom (Tiptap?) |
| INTEGER, NUMERIC             | `<Input type="number">` with AutoNumeric | AutoNumeric.js   |
| DATE                         | `<DatePicker>`                           | shadcn/ui        |
| DATETIME                     | `<DateTimePicker>`                       | shadcn/ui        |
| TIME                         | `<TimePicker>`                           | shadcn/ui        |
| CHECKBOX_YES_NO              | `<Checkbox>`                             | shadcn/ui        |
| SELECT_ONE                   | `<Select>`                               | shadcn/ui        |
| SELECT_LIST                  | `<MultiSelect>`                          | shadcn/ui        |
| SELECT_ONE_RECORD            | `<Combobox>`                             | shadcn/ui        |
| SELECT_LIST_RECORD           | `<MultiSelect>` searchable               | shadcn/ui        |
| SELECT_ONE_WORKSPACE_USER    | `<Combobox>` with avatars                | shadcn/ui        |
| SELECT_LIST_WORKSPACE_USER   | `<MultiSelect>` with avatars             | shadcn/ui        |

### ActivityTimeline Component

**Purpose**: Display record history and changes

**Props:**

```typescript
interface ActivityTimelineProps {
  recordId: string;
  events: TimelineEvent[]; // Activity events
  loading?: boolean;
  className?: string;
}

interface TimelineEvent {
  id: string;
  type: 'created' | 'updated' | 'commented' | 'custom';
  user: WorkspaceUser;
  timestamp: string; // ISO 8601
  changes?: FieldChange[]; // Field changes
  comment?: string; // Comment content
}

interface FieldChange {
  fieldName: string;
  fieldLabel: string;
  oldValue: any;
  newValue: any;
}
```

**Layout:**

```
┌────────────────────────────────────────┐
│ Activity Timeline                      │
├────────────────────────────────────────┤
│ ● John Doe created record              │
│   Nov 18, 2025 9:00 AM                 │
├────────────────────────────────────────┤
│ ● Jane Smith updated status            │
│   Nov 18, 2025 10:30 AM                │
│   • Status: Todo → In Progress         │
├────────────────────────────────────────┤
│ ● Bob Johnson commented                │
│   Nov 18, 2025 2:15 PM                 │
│   "Great progress!"                    │
└────────────────────────────────────────┘
```

### RelatedRecords Component

**Purpose**: Display records related through reference fields

**Props:**

```typescript
interface RelatedRecordsProps {
  record: TableRecord;
  table: Table;
  referenceRecords: Record<string, TableRecord[]>;
  onRecordClick?: (recordId: string) => void;
  className?: string;
}
```

**Behavior:**

- Group by reference field
- Show record title/name
- Link to record detail
- Show count if many records
- Collapse/expand sections

## Architecture

### Component Communication

```
RecordDetail (Container)
├── Props down: record, table, callbacks
└── Events up: onFieldChange, onDelete

FieldDisplay (Presentational)
├── Props down: field, value, referenceRecords
└── Events up: onDoubleClick

InlineEditField (Controlled)
├── Props down: field, value, onSave, onCancel
└── Events up: onSave with new value

ActivityTimeline (Presentational)
└── Props down: events, loading

RelatedRecords (Presentational)
├── Props down: record, referenceRecords
└── Events up: onRecordClick
```

### State Management

**Zustand Store (`detail-view-store.ts`):**

```typescript
interface DetailViewState {
  // Inline editing
  editingRecordId: string | null;
  editingFieldName: string | null;

  // UI state
  showComments: boolean;
  showTimeline: boolean;
  showRelatedRecords: boolean;

  // Actions
  startEdit: (recordId: string, fieldName: string) => void;
  cancelEdit: () => void;
  toggleComments: () => void;
  toggleTimeline: () => void;
  toggleRelatedRecords: () => void;
}
```

**Usage:**

```typescript
const { editingFieldName, startEdit, cancelEdit } = useDetailViewStore();

// Start inline edit
const handleDoubleClick = () => {
  if (hasPermission('update')) {
    startEdit(record.id, field.name);
  }
};

// Cancel inline edit
const handleCancel = () => {
  cancelEdit();
};
```

### Hooks

**`use-record-detail.ts`:**

```typescript
export function useRecordDetail(
  recordId: string,
  tableId: string,
  options?: {
    enabled?: boolean;
    encryptionKey?: string;
  },
) {
  // Fetch record
  const { record, isLoading, error } = useRecordById(/* ... */);

  // Fetch reference records
  const { referenceRecords } = useReferenceRecords(/* ... */);

  // Fetch user records
  const { userRecords } = useUserRecords(/* ... */);

  // Activity timeline
  const { events } = useActivityTimeline(recordId);

  return {
    record,
    referenceRecords,
    userRecords,
    events,
    isLoading,
    error,
  };
}
```

**`use-inline-edit.ts`:**

```typescript
export function useInlineEdit(field: FieldConfig, onSave: (value: any) => Promise<void>) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(field.value);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(value);
      setIsEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setValue(field.value);
    setError(null);
    setIsEditing(false);
  };

  return {
    isEditing,
    value,
    error,
    isSaving,
    startEdit: () => setIsEditing(true),
    setValue,
    handleSave,
    handleCancel,
  };
}
```

## Related Code Files

### Files to Create

1. **Components:**
   - `packages/active-tables-core/src/components/record-detail/record-detail.tsx`
   - `packages/active-tables-core/src/components/record-detail/layouts/head-detail-layout.tsx`
   - `packages/active-tables-core/src/components/record-detail/layouts/two-column-layout.tsx`
   - `packages/active-tables-core/src/components/record-detail/fields/field-display.tsx`
   - `packages/active-tables-core/src/components/record-detail/fields/inline-edit-field.tsx`
   - `packages/active-tables-core/src/components/record-detail/fields/field-renderers/` (25+ files)
   - `packages/active-tables-core/src/components/record-detail/activity-timeline.tsx`
   - `packages/active-tables-core/src/components/record-detail/related-records.tsx`

2. **Hooks:**
   - `packages/active-tables-core/src/hooks/use-record-detail.ts`
   - `packages/active-tables-core/src/hooks/use-inline-edit.ts`
   - `packages/active-tables-core/src/hooks/use-field-display.ts`

3. **Store:**
   - `packages/active-tables-core/src/stores/detail-view-store.ts`

4. **Types:**
   - `packages/active-tables-core/src/types/record-detail.ts`

### Files to Reference

1. **Existing Components:**
   - `packages/ui/src/components/` - shadcn/ui components
   - `packages/active-tables-core/src/components/fields/` - Field renderers (Phase 2)

2. **Constants:**
   - `packages/beqeek-shared/src/constants/field-types.ts`
   - `packages/beqeek-shared/src/constants/layouts.ts`

## Implementation Steps

### Day 1: Core Structure

1. Create directory structure
2. Define TypeScript types (`record-detail.ts`)
3. Create Zustand store (`detail-view-store.ts`)
4. Implement `RecordDetail` component skeleton
5. Implement `HeadDetailLayout` component
6. Implement `TwoColumnDetailLayout` component
7. Write unit tests for layouts

### Day 2: Field Display

1. Implement `FieldDisplay` component
2. Create field renderer components (25+ types)
3. Add field type detection logic
4. Handle null/empty values
5. Add loading states
6. Add error states
7. Write unit tests for field renderers

### Day 3: Inline Editing

1. Implement `InlineEditField` component
2. Create input wrappers for each field type
3. Add validation logic
4. Implement save/cancel handlers
5. Add keyboard shortcuts (Enter, Escape)
6. Add loading states during save
7. Write unit tests for inline edit

### Day 4: Timeline & Related Records

1. Implement `ActivityTimeline` component
2. Format timeline events
3. Group events by date
4. Implement `RelatedRecords` component
5. Group by reference field
6. Add collapse/expand functionality
7. Write unit tests

### Day 5: Hooks & Integration

1. Implement `useRecordDetail` hook
2. Implement `useInlineEdit` hook
3. Implement `useFieldDisplay` hook
4. Integrate all components in `RecordDetail`
5. Add prop validation
6. Add accessibility attributes
7. Write integration tests

### Day 6: Polish & Documentation

1. Add loading skeletons
2. Add error boundaries
3. Optimize performance (memo, useMemo)
4. Add dark mode support
5. Write component documentation
6. Create usage examples
7. Update package exports

## Todo List

- [ ] Create directory structure in `active-tables-core`
- [ ] Define TypeScript types (`RecordDetailProps`, etc.)
- [ ] Create Zustand store (`detail-view-store.ts`)
- [ ] Implement `RecordDetail` component skeleton
- [ ] Implement `HeadDetailLayout` component
- [ ] Implement `TwoColumnDetailLayout` component
- [ ] Implement `FieldDisplay` component
- [ ] Create 25+ field renderer components
- [ ] Implement `InlineEditField` component
- [ ] Create input wrappers for each field type
- [ ] Add validation logic to inline edit
- [ ] Implement keyboard shortcuts (Enter, Escape)
- [ ] Implement `ActivityTimeline` component
- [ ] Implement `RelatedRecords` component
- [ ] Implement `useRecordDetail` hook
- [ ] Implement `useInlineEdit` hook
- [ ] Implement `useFieldDisplay` hook
- [ ] Add loading states and skeletons
- [ ] Add error boundaries
- [ ] Add accessibility attributes (ARIA)
- [ ] Optimize performance (React.memo, useMemo)
- [ ] Write unit tests for all components
- [ ] Write integration tests
- [ ] Write component documentation
- [ ] Create usage examples
- [ ] Update package exports (`index.ts`)

## Success Criteria

- [ ] All components render without errors
- [ ] All 25+ field types display correctly
- [ ] Inline editing works for all field types
- [ ] Validation prevents invalid saves
- [ ] Keyboard shortcuts work (Enter, Escape)
- [ ] Loading states show during async operations
- [ ] Error states display helpful messages
- [ ] Components are fully typed (TypeScript)
- [ ] Unit tests pass with >80% coverage
- [ ] Integration tests pass 100%
- [ ] Components use design tokens (no hardcoded colors)
- [ ] Dark mode fully supported
- [ ] Accessibility: ARIA labels, keyboard nav
- [ ] Performance: <200ms initial render
- [ ] Documentation complete with examples

## Risk Assessment

| Risk                             | Likelihood | Impact | Mitigation                                   |
| -------------------------------- | ---------- | ------ | -------------------------------------------- |
| Field renderer complexity        | Medium     | High   | Incremental implementation, thorough testing |
| Inline edit edge cases           | High       | Medium | Comprehensive validation tests               |
| Performance issues (many fields) | Medium     | Medium | React.memo, virtualization if needed         |
| Type safety gaps                 | Low        | Medium | Strict TypeScript mode, thorough typing      |
| Component coupling               | Medium     | High   | Props-based API, no hard dependencies        |
| Accessibility violations         | Low        | Medium | ARIA audit, keyboard testing                 |

## Security Considerations

1. **XSS Prevention:**
   - Sanitize rich text before rendering
   - Use `dangerouslySetInnerHTML` only when necessary
   - Escape user input in comments

2. **Data Validation:**
   - Validate all inputs before save
   - Check field constraints (min, max, pattern)
   - Prevent injection attacks

3. **Permission Enforcement:**
   - Check permissions before enabling edit
   - Disable UI for restricted fields
   - Re-validate on server (primary check)

## Next Steps

After Phase 2 completion:

1. Build `RecordDetailPage` in web app
2. Integrate with TanStack Router
3. Connect to API hooks
4. Handle encryption key management
5. Begin Phase 3: Web App Integration

## Unresolved Questions

1. Should we virtualize field list for records with 100+ fields?
2. How to handle concurrent edits (optimistic updates)?
3. Should inline edit auto-save on blur or require explicit save?
4. How to handle rich text editor toolbar (floating vs. fixed)?
5. Should activity timeline be paginated or infinite scroll?
6. How to handle related records with circular references?
7. Should we implement undo/redo for inline edits?
