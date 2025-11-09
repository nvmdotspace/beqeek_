# @workspace/active-tables-core

React components, hooks, stores, and utilities for Active Tables - the core UI layer for configurable workflow data tables.

## Installation

This is an internal workspace package. Import directly:

```typescript
import { FieldRenderer, KanbanBoard } from '@workspace/active-tables-core';
```

**Peer Dependencies** (must be provided by consuming app):

- `react` >= 19.0.0
- `react-dom` >= 19.0.0
- `@tanstack/react-table` >= 8.0.0
- `@workspace/beqeek-shared` (for types and constants)
- `@workspace/encryption-core` (for E2EE support)

## Architecture Overview

This package provides API-agnostic, reusable UI components for Active Tables features. It follows a phased implementation approach:

- **Phase 0**: ✅ Encryption utilities and types
- **Phase 1**: ✅ Type system, hooks, stores, constants
- **Phase 2**: ✅ Field Renderers (25+ field types)
- **Phase 3**: ✅ List Views (table & card layouts)
- **Phase 4**: ✅ Detail Views (single/two-column, comments)
- **Phase 5**: ✅ Kanban Board (drag-and-drop)
- **Phase 6**: ✅ Gantt Chart (timeline, zoom, progress)
- **Phase 7+**: 🚧 Filters, actions (coming soon)

## Components

### Field Renderers (Phase 2)

Render any field type with automatic type detection:

```typescript
import { FieldRenderer } from '@workspace/active-tables-core/components';

// Auto-detects field type and renders appropriate component
<FieldRenderer
  field={fieldConfig}
  value={recordValue}
  onChange={handleChange}
  readOnly={false}
  error={fieldError}
/>
```

Individual field components available:

```typescript
import {
  // Text fields
  ShortTextField,
  TextField,
  RichTextField,
  EmailField,
  UrlField,

  // Time fields
  DateField,
  DateTimeField,
  TimeField,
  YearField,
  MonthField,
  DayField,
  HourField,
  MinuteField,
  SecondField,

  // Number fields
  IntegerField,
  NumericField,

  // Selection fields
  CheckboxYesNoField,
  CheckboxOneField,
  CheckboxListField,
  SelectOneField,
  SelectListField,

  // Reference fields
  SelectOneRecordField,
  SelectListRecordField,
  SelectOneWorkspaceUserField,
  SelectListWorkspaceUserField,
  FirstReferenceRecordField,
} from '@workspace/active-tables-core/components';
```

### List Views (Phase 3)

Display records in different layouts:

```typescript
import { RecordList } from '@workspace/active-tables-core/components';

// Generic table layout
<RecordList
  records={records}
  fields={fields}
  config={{
    layout: 'generic-table',
    displayFields: ['name', 'status', 'created_at']
  }}
  onRecordClick={handleRecordClick}
  onSort={handleSort}
/>

// Card/head-column layout
<RecordList
  records={records}
  fields={fields}
  config={{
    layout: 'head-column',
    titleField: 'name',
    subLineFields: ['status', 'assignee'],
    tailFields: ['created_at']
  }}
/>
```

### Detail Views (Phase 4)

Show single record details:

```typescript
import { RecordDetail } from '@workspace/active-tables-core/components';

// Head-detail layout (mobile-friendly)
<RecordDetail
  record={record}
  fields={fields}
  config={{
    layout: 'head-detail',
    titleField: 'name',
    subLineFields: ['status', 'assignee'],
    tailFields: ['description', 'created_at']
  }}
  commentsPosition="right-panel"
  comments={comments}
  onFieldChange={handleFieldChange}
/>

// Two-column layout (desktop)
<RecordDetail
  record={record}
  fields={fields}
  config={{
    layout: 'two-column-detail',
    headTitleField: 'name',
    headSubLineFields: ['status'],
    column1Fields: ['assignee', 'priority'],
    column2Fields: ['due_date', 'tags']
  }}
/>
```

### Kanban Board (Phase 5)

Drag-and-drop kanban view:

```typescript
import { KanbanBoard } from '@workspace/active-tables-core/components/kanban';

<KanbanBoard
  records={records}
  fields={fields}
  config={{
    kanbanScreenId: 'uuid',
    screenName: 'Task Status Board',
    statusField: 'status',
    kanbanHeadlineField: 'title',
    displayFields: ['assignee', 'due_date', 'priority']
  }}
  onCardMove={handleCardMove}
  onCardClick={handleCardClick}
/>
```

### Gantt Chart (Phase 6)

Timeline visualization:

```typescript
import { GanttChart } from '@workspace/active-tables-core/components/gantt';

<GanttChart
  records={records}
  fields={fields}
  config={{
    ganttScreenId: 'uuid',
    screenName: 'Project Timeline',
    taskNameField: 'task_name',
    startDateField: 'start_date',
    endDateField: 'end_date',
    progressField: 'completion_percentage',
    dependencyField: 'dependencies'
  }}
  onTaskUpdate={handleTaskUpdate}
  onTaskClick={handleTaskClick}
/>
```

### State Components

Loading, error, and empty states:

```typescript
import {
  LoadingState,
  ErrorState,
  EmptyState
} from '@workspace/active-tables-core/components/states';

// Loading spinner with message
<LoadingState message="Loading records..." />

// Error display with retry
<ErrorState
  error={error}
  onRetry={handleRetry}
/>

// Empty state with CTA
<EmptyState
  title="No records found"
  description="Create your first record to get started"
  action={{
    label: 'Create Record',
    onClick: handleCreate
  }}
/>
```

## Hooks

### useActiveTable

Main hook for table operations:

```typescript
import { useActiveTable } from '@workspace/active-tables-core/hooks';

const { table, records, loading, error, createRecord, updateRecord, deleteRecord, refreshRecords } = useActiveTable({
  tableId: 'table-uuid',
  encryptionKey: 'optional-32-char-key',
});
```

### usePermissions

Check user permissions:

```typescript
import { usePermissions } from '@workspace/active-tables-core/hooks';

const { canCreate, canUpdate, canDelete, canComment, checkPermission } = usePermissions({
  table,
  record,
  currentUser,
  teamId,
  roleId,
});

// Check specific permission
const allowed = checkPermission('update', record);
```

### useEncryption

Handle E2EE operations:

```typescript
import { useEncryption } from '@workspace/active-tables-core/hooks';

const { encryptRecord, decryptRecord, encryptField, decryptField, isEncrypted } = useEncryption(encryptionKey);

// Encrypt before save
const encrypted = await encryptRecord(record, fields);

// Decrypt after fetch
const decrypted = await decryptRecord(encrypted, fields);
```

### useInlineEdit

Inline editing for fields:

```typescript
import { useInlineEdit } from '@workspace/active-tables-core/hooks';

const { editingField, startEdit, saveEdit, cancelEdit, isEditing } = useInlineEdit({
  onSave: async (field, value) => {
    await updateRecord(recordId, { [field]: value });
  },
});
```

### useFieldValue

Field value management:

```typescript
import { useFieldValue } from '@workspace/active-tables-core/hooks';

const { value, displayValue, setValue, validate, error } = useFieldValue({
  field: fieldConfig,
  initialValue: record[fieldConfig.name],
  onChange: handleFieldChange,
});
```

## Stores (Zustand)

### View Store

Manage view preferences:

```typescript
import { useViewStore } from '@workspace/active-tables-core/stores';

const { currentView, setView, viewPreferences, updatePreferences } = useViewStore();

// Switch between views
setView('kanban');
setView('list');
setView('gantt');
```

### Filter Store

Manage filters and search:

```typescript
import { useFilterStore } from '@workspace/active-tables-core/stores';

const { filters, quickFilters, searchTerm, addFilter, removeFilter, clearFilters, setSearchTerm } = useFilterStore();

// Add filter
addFilter({
  field: 'status',
  operator: 'equals',
  value: 'active',
});
```

### Selection Store

Track selected records:

```typescript
import { useSelectionStore } from '@workspace/active-tables-core/stores';

const { selectedIds, selectRecord, deselectRecord, selectAll, clearSelection, isSelected } = useSelectionStore();
```

## Utilities

### Record Operations

```typescript
import {
  recordDecryptor,
  recordValidator,
  recordFormatter,
  recordComparator,
} from '@workspace/active-tables-core/utils';

// Decrypt records batch
const decrypted = await recordDecryptor.decryptBatch(records, fields, key);

// Validate record
const errors = recordValidator.validate(record, fields);

// Format for display
const formatted = recordFormatter.format(record, fields);

// Compare for sorting
const sorted = records.sort(recordComparator.byField('created_at', 'desc'));
```

### Field Operations

```typescript
import {
  fieldValidator,
  fieldFormatter,
  fieldTypeDetector,
  fieldDefaultValue,
} from '@workspace/active-tables-core/utils';

// Validate field value
const error = fieldValidator.validate(value, fieldConfig);

// Format for display
const display = fieldFormatter.format(value, fieldConfig);

// Detect field type
const type = fieldTypeDetector.detect(value);

// Get default value
const defaultVal = fieldDefaultValue.get(fieldConfig);
```

### Permission Checker

```typescript
import { permissionChecker } from '@workspace/active-tables-core/utils';

// Check action permission
const allowed = permissionChecker.canPerform({
  action: 'update',
  permission: 'self_created_24h',
  record,
  currentUser,
  teamMembers,
});
```

### Encryption Helpers

```typescript
import { encryptionHelpers } from '@workspace/active-tables-core/utils';

// Generate key
const key = encryptionHelpers.generateKey();

// Validate key
const isValid = encryptionHelpers.validateKey(key);

// Get encryption type for field
const encType = encryptionHelpers.getEncryptionType(fieldType);
```

## Types

All types are re-exported from `@workspace/beqeek-shared`:

```typescript
import type {
  // Table types
  ActiveTable,
  ActiveTableRecord,
  ActiveTableComment,

  // Field types
  FieldConfig,
  FieldType,
  FieldOption,

  // Config types
  TableConfig,
  RecordListConfig,
  RecordDetailConfig,
  KanbanConfig,
  GanttConfig,

  // Permission types
  PermissionConfig,
  PermissionRule,

  // Encrypted types
  EncryptedRecord,
  DecryptedRecord,
} from '@workspace/active-tables-core/types';
```

## Common Patterns

### Building a Complete Table View

```typescript
import {
  RecordList,
  useActiveTable,
  usePermissions,
  useFilterStore,
  LoadingState,
  ErrorState
} from '@workspace/active-tables-core';

function TableView({ tableId }) {
  const { records, loading, error } = useActiveTable({ tableId });
  const { canCreate } = usePermissions({ table });
  const { filters } = useFilterStore();

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;

  const filteredRecords = applyFilters(records, filters);

  return (
    <>
      {canCreate && <CreateButton />}
      <RecordList
        records={filteredRecords}
        fields={table.fields}
        config={table.recordListConfig}
      />
    </>
  );
}
```

### Inline Editing with Encryption

```typescript
import {
  FieldRenderer,
  useInlineEdit,
  useEncryption
} from '@workspace/active-tables-core';

function EditableField({ field, record, encryptionKey }) {
  const { encryptField } = useEncryption(encryptionKey);
  const { startEdit, saveEdit, isEditing } = useInlineEdit({
    onSave: async (fieldName, value) => {
      const encrypted = await encryptField(value, field);
      await updateRecord(record.id, { [fieldName]: encrypted });
    }
  });

  return (
    <FieldRenderer
      field={field}
      value={record[field.name]}
      onChange={(value) => saveEdit(field.name, value)}
      readOnly={!isEditing(field.name)}
      onDoubleClick={() => startEdit(field.name)}
    />
  );
}
```

### Custom Kanban with Permissions

```typescript
import {
  KanbanBoard,
  usePermissions,
  permissionChecker
} from '@workspace/active-tables-core';

function SecureKanban({ config, records }) {
  const { checkPermission } = usePermissions();

  const handleCardMove = async (cardId, newStatus) => {
    const record = records.find(r => r.id === cardId);

    if (!checkPermission('update', record)) {
      toast.error('No permission to update this record');
      return false;
    }

    await updateRecord(cardId, { status: newStatus });
    return true;
  };

  return (
    <KanbanBoard
      config={config}
      records={records}
      onCardMove={handleCardMove}
      readOnly={!checkPermission('update')}
    />
  );
}
```

## Package Structure

```
packages/active-tables-core/
├── src/
│   ├── components/           # React components
│   │   ├── common/           # Shared components
│   │   ├── fields/           # 25+ field renderers
│   │   ├── record-list/      # List view layouts
│   │   ├── record-detail/    # Detail view layouts
│   │   ├── kanban/           # Kanban board
│   │   ├── gantt/            # Gantt chart
│   │   └── states/           # Loading/error/empty
│   ├── hooks/                # React hooks
│   ├── stores/               # Zustand stores
│   ├── utils/                # Utilities
│   ├── types/                # TypeScript types
│   └── constants/            # Constants
└── package.json
```

## Best Practices

### ✅ DO:

- Use `FieldRenderer` for automatic field type detection
- Leverage hooks for common operations (permissions, encryption)
- Use stores for cross-component state (filters, selection)
- Import types from this package (re-exported from beqeek-shared)
- Handle encryption/decryption at the data layer

### ❌ DON'T:

- Make direct API calls (use hooks/utilities)
- Hardcode field type logic (use FieldRenderer)
- Store sensitive data in component state
- Skip permission checks
- Mix encrypted and decrypted data

## Contributing

When adding new components:

1. Follow the phased implementation approach
2. Add to appropriate directory structure
3. Export from relevant index file
4. Include TypeScript types
5. Add usage examples to README
6. Consider encryption implications

## License

Internal workspace package - not published to npm.
