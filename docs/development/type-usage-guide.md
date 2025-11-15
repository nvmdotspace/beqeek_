# Type Usage Guide - Active Tables

## Overview

Hướng dẫn sử dụng types từ shared packages thay vì định nghĩa lại trong component.

## Available Packages

### 1. @workspace/beqeek-shared

**Purpose:** TypeScript-only constants, types, và validators

**Location:** `packages/beqeek-shared/src/`

**Exports:**

- Field type constants và groups
- Action type constants
- Permission constants và arrays
- Layout constants
- Table type templates

### 2. @workspace/active-tables-core

**Purpose:** React components, hooks, stores, và types cho Active Tables

**Location:** `packages/active-tables-core/src/`

**Exports:**

- Field types và utilities
- Record types
- Configuration types
- Common types
- Response types
- React components và hooks

## Type Imports by Use Case

### Field Types & Constants

✅ **ALWAYS import from packages:**

```typescript
// ✅ CORRECT - Import from beqeek-shared
import {
  FIELD_TYPE_SHORT_TEXT,
  FIELD_TYPE_SELECT_ONE,
  FIELD_TYPE_SELECT_LIST,
  TEXT_FIELD_TYPES,
  SELECTION_FIELD_TYPES,
  type FieldType,
} from '@workspace/beqeek-shared';

// ❌ WRONG - Don't hardcode or redefine
const FIELD_TYPE_SHORT_TEXT = 'SHORT_TEXT';
type FieldType = 'SHORT_TEXT' | 'SELECT_ONE' | ...;
```

**Available exports:**

- Individual constants: `FIELD_TYPE_*`
- Groups: `TEXT_FIELD_TYPES`, `NUMBER_FIELD_TYPES`, `SELECTION_FIELD_TYPES`, etc.
- Type: `FieldType` (union type of all field types)

### Table & Field Configuration

✅ **Use from active-tables-core:**

```typescript
// ✅ CORRECT - Import from active-tables-core
import type { Table, FieldConfig, FieldOption, TableConfig } from '@workspace/active-tables-core';

// ❌ WRONG - Don't redefine
interface MyFieldConfig {
  type: string;
  label: string;
  // ...
}
```

**Available types:**

- `Table` - Full table with metadata + config
- `TableConfig` - Table configuration object
- `FieldConfig` - Field definition with all properties
- `FieldOption` - Select/checkbox option structure

### Record Data

✅ **Use TableRecord type:**

```typescript
// ✅ CORRECT - Import from active-tables-core
import type { TableRecord } from '@workspace/active-tables-core';

// TableRecord includes:
// - id: string
// - record: Record<string, unknown>
// - createdBy, updatedBy, createdAt, updatedAt
// - record_hashes, hashed_keywords (for E2EE)
// - permissions

// ❌ WRONG - Don't use generic object
const record: any = { ... };
const record: Record<string, any> = { ... };
```

### Record Field Values

⚠️ **Currently NO shared type** - Define locally with clear documentation:

```typescript
/**
 * Type for field values in form data
 * Covers all possible field value types based on FieldType
 *
 * - Text fields: string
 * - Number fields: number
 * - Date/Time fields: string (ISO 8601 format)
 * - Checkbox fields: boolean
 * - Single select fields: string (option value)
 * - Multi-select fields: string[] (array of option values)
 * - Reference fields: string | string[] (record IDs)
 */
type RecordFieldValue = string | number | boolean | string[];
```

**Usage:**

```typescript
// Form data
const formData: Record<string, RecordFieldValue> = {
  task_title: 'Do something',
  priority: 'high',
  assignees: ['user1', 'user2'],
  is_completed: false,
  due_date: '2025-11-20',
};

// API payload
interface CreateRecordParams {
  record: Record<string, RecordFieldValue>;
}
```

### Action Types & Permissions

✅ **Import from beqeek-shared:**

```typescript
// ✅ CORRECT - Import action types
import {
  ACTION_TYPE_CREATE,
  ACTION_TYPE_ACCESS,
  ACTION_TYPE_UPDATE,
  ACTION_TYPE_DELETE,
  COMMENT_ACTION_TYPES,
  type CommentActionType,
} from '@workspace/beqeek-shared';

// ✅ CORRECT - Import permission arrays
import {
  CREATE_PERMISSIONS,
  RECORD_ACTION_PERMISSIONS,
  COMMENT_CREATE_PERMISSIONS,
  COMMENT_ACCESS_PERMISSIONS,
  COMMENT_MODIFY_PERMISSIONS,
} from '@workspace/beqeek-shared';

// ❌ WRONG - Don't hardcode
const permissions = ['not_allowed', 'all', 'self_created'];
```

### Layout Constants

✅ **Import from beqeek-shared:**

```typescript
// ✅ CORRECT - Import layout constants
import {
  RECORD_LIST_LAYOUT_GENERIC_TABLE,
  RECORD_LIST_LAYOUT_HEAD_COLUMN,
  RECORD_DETAIL_LAYOUT_TWO_COLUMN,
  COMMENTS_POSITION_RIGHT_PANEL,
  type RecordListLayout,
  type RecordDetailLayout,
} from '@workspace/beqeek-shared';

// ❌ WRONG - Don't hardcode strings
const layout = 'generic-table';
```

## Anti-Patterns

### ❌ Using `any` Type

```typescript
// ❌ WRONG - Loses all type safety
const data: any = formData;
const config: Record<string, any> = tableConfig;

// ✅ CORRECT - Use proper types
const data: Record<string, RecordFieldValue> = formData;
const config: TableConfig = tableConfig;
```

### ❌ Using `as any` Casts

```typescript
// ❌ WRONG - Defeats TypeScript's purpose
const fullWidthTypes = [...];
const isFullWidth = fullWidthTypes.includes(field.type as any);

// ✅ CORRECT - Use proper type annotation
const fullWidthTypes: readonly string[] = [...];
const isFullWidth = fullWidthTypes.includes(field.type);
```

### ❌ Redefining Shared Types

```typescript
// ❌ WRONG - Duplicates existing types
interface MyFieldConfig {
  type: string;
  label: string;
  name: string;
}

// ✅ CORRECT - Import from package
import type { FieldConfig } from '@workspace/active-tables-core';
```

### ❌ Hardcoding Constants

```typescript
// ❌ WRONG - Hardcoded values
const TEXT_FIELDS = ['SHORT_TEXT', 'TEXT', 'RICH_TEXT'];
if (field.type === 'SELECT_ONE') { ... }

// ✅ CORRECT - Import constants
import {
  TEXT_FIELD_TYPES,
  FIELD_TYPE_SELECT_ONE,
} from '@workspace/beqeek-shared';

if (TEXT_FIELD_TYPES.includes(field.type)) { ... }
if (field.type === FIELD_TYPE_SELECT_ONE) { ... }
```

## Package Import Patterns

### beqeek-shared (TypeScript only)

```typescript
// Named imports for constants
import {
  FIELD_TYPE_SHORT_TEXT,
  FIELD_TYPE_SELECT_ONE,
  ACTION_TYPE_CREATE,
  CREATE_PERMISSIONS,
} from '@workspace/beqeek-shared';

// Type imports
import type { FieldType, TableConfig, PermissionConfig } from '@workspace/beqeek-shared';

// Subpath imports (if needed)
import { FIELD_TYPE_SHORT_TEXT } from '@workspace/beqeek-shared/constants';
import type { TableConfig } from '@workspace/beqeek-shared/types';
```

### active-tables-core (React + Types)

```typescript
// Type imports
import type { Table, FieldConfig, TableRecord, RecordComment } from '@workspace/active-tables-core';

// Component imports
import { FieldRenderer, RecordList, KanbanBoard, GanttChartView } from '@workspace/active-tables-core';

// Hook imports
import { usePermissions, useEncryption, useFieldValue } from '@workspace/active-tables-core';

// Utility imports
import { isValidRecord, hasPermission, isTextField } from '@workspace/active-tables-core';
```

## Type Safety Checklist

When writing new components:

- [ ] Import field type constants from `@workspace/beqeek-shared`
- [ ] Import config types from `@workspace/active-tables-core`
- [ ] Import record types from `@workspace/active-tables-core`
- [ ] Define local types with JSDoc documentation if not in packages
- [ ] Use `Record<string, RecordFieldValue>` for form data
- [ ] Use `TableRecord` for API responses
- [ ] Use `FieldConfig` for field definitions
- [ ] NEVER use `any` type
- [ ] NEVER use `as any` casts
- [ ] Use `readonly` for constant arrays
- [ ] Add type guards where needed

## Examples

### ✅ Good Example - Create Record Dialog

```typescript
import type { Table, FieldConfig } from '@workspace/active-tables-core';
import {
  FIELD_TYPE_SELECT_LIST,
  FIELD_TYPE_CHECKBOX_LIST,
  FIELD_TYPE_INTEGER,
  FIELD_TYPE_NUMERIC,
} from '@workspace/beqeek-shared';

type RecordFieldValue = string | number | boolean | string[];

interface CreateRecordDialogProps {
  table: Table;
  workspaceId: string;
  tableId: string;
  onSuccess?: (recordId: string) => void;
}

function getDefaultValues(table: Table): Record<string, RecordFieldValue> {
  const defaults: Record<string, RecordFieldValue> = {};

  table.config.fields.forEach((field: FieldConfig) => {
    if (field.type === FIELD_TYPE_INTEGER || field.type === FIELD_TYPE_NUMERIC) {
      defaults[field.name] = 0;
    } else if (field.type === FIELD_TYPE_SELECT_LIST || field.type === FIELD_TYPE_CHECKBOX_LIST) {
      defaults[field.name] = [];
    } else {
      defaults[field.name] = '';
    }
  });

  return defaults;
}
```

### ❌ Bad Example - Using any

```typescript
// DON'T DO THIS
interface CreateRecordDialogProps {
  table: any; // ❌ Use Table type
  workspaceId: string;
  tableId: string;
  onSuccess?: (recordId: string) => void;
}

function getDefaultValues(table: any): Record<string, any> {
  // ❌ Use proper types
  const defaults: any = {}; // ❌

  table.config.fields.forEach((field: any) => {
    // ❌
    if (field.type === 'INTEGER' || field.type === 'NUMERIC') {
      // ❌ Use constants
      defaults[field.name] = 0;
    }
  });

  return defaults;
}
```

## Common Mistakes & Fixes

### Mistake 1: Not importing shared constants

```typescript
// ❌ Before
if (field.type === 'SELECT_ONE') { ... }

// ✅ After
import { FIELD_TYPE_SELECT_ONE } from '@workspace/beqeek-shared';
if (field.type === FIELD_TYPE_SELECT_ONE) { ... }
```

### Mistake 2: Using any for record data

```typescript
// ❌ Before
const record: any = { task_title: '...' };

// ✅ After
const record: Record<string, RecordFieldValue> = { task_title: '...' };
```

### Mistake 3: Redefining types

```typescript
// ❌ Before
interface Field {
  type: string;
  label: string;
  name: string;
}

// ✅ After
import type { FieldConfig } from '@workspace/active-tables-core';
const field: FieldConfig = { ... };
```

## Resources

- beqeek-shared README: `/packages/beqeek-shared/README.md`
- active-tables-core README: `/packages/active-tables-core/README.md`
- Field types reference: `/packages/beqeek-shared/src/constants/field-types.ts`
- Type definitions: `/packages/active-tables-core/src/types/`

## Summary

**Golden Rules:**

1. ✅ ALWAYS import types from packages
2. ✅ NEVER use `any` type
3. ✅ NEVER hardcode constants
4. ✅ Document local types with JSDoc
5. ✅ Use type guards for runtime checks
6. ✅ Prefer `readonly` for constant arrays
7. ✅ Use specific types over generic `Record<string, any>`
