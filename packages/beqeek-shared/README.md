# @workspace/beqeek-shared

Shared constants, types, and utilities for the Beqeek platform.

## Overview

This package provides system-wide constants and validation helpers for the Beqeek Active Tables feature, based on the [active-table-config-functional-spec.md](../../docs/specs/active-table-config-functional-spec.md).

## Installation

```bash
pnpm add @workspace/beqeek-shared
```

## Quick Reference for Claude Code & Developers

### Import Patterns

```typescript
// ✅ ALWAYS import constants instead of hardcoding
import {
  // Action types
  ACTION_TYPE_COMMENT_CREATE,
  COMMENT_ACTION_TYPES,

  // Permission arrays for UI dropdowns
  COMMENT_CREATE_PERMISSIONS,
  COMMENT_ACCESS_PERMISSIONS,
  COMMENT_MODIFY_PERMISSIONS,

  // Field types
  FIELD_TYPE_SHORT_TEXT,
  TEXT_FIELD_TYPES,

  // Layouts
  RECORD_LIST_LAYOUT_GENERIC_TABLE,

  // Types
  type CommentActionType,
  type FieldType,
} from '@workspace/beqeek-shared';
```

### Anti-Patterns to Avoid

```typescript
// ❌ NEVER hardcode these values:
const COMMENT_CREATE_OPTIONS = ['not_allowed', 'all', ...]; // DON'T DO THIS
type CommentActionType = 'comment_create' | 'comment_access' | ...; // DON'T DO THIS
const FIELD_TYPES = { SHORT_TEXT: 'SHORT_TEXT' }; // DON'T DO THIS

// ✅ ALWAYS import from package:
import {
  COMMENT_CREATE_PERMISSIONS,
  type CommentActionType,
  FIELD_TYPE_SHORT_TEXT
} from '@workspace/beqeek-shared';
```

## Usage

### Field Types

```typescript
import {
  FIELD_TYPE_SHORT_TEXT,
  FIELD_TYPE_SELECT_ONE,
  TEXT_FIELD_TYPES,
  isValidFieldType,
  isTextFieldType,
  requiresOptions,
} from '@workspace/beqeek-shared';

// Check if a value is a valid field type
if (isValidFieldType('SHORT_TEXT')) {
  console.log('Valid field type');
}

// Check field type category
if (isTextFieldType(FIELD_TYPE_SHORT_TEXT)) {
  console.log('This is a text field');
}

// Check if field requires options
if (requiresOptions(FIELD_TYPE_SELECT_ONE)) {
  console.log('This field requires options property');
}
```

### Action Types

```typescript
import {
  ACTION_TYPE_CREATE,
  ACTION_TYPE_UPDATE,
  isValidActionType,
  isSystemActionType,
} from '@workspace/beqeek-shared';

// Validate action type
if (isValidActionType('create')) {
  console.log('Valid action type');
}

// Check if system action
if (isSystemActionType(ACTION_TYPE_UPDATE)) {
  console.log('This is a system-defined action');
}
```

### Permissions

```typescript
import {
  PERMISSION_ALL,
  PERMISSION_SELF_CREATED,
  ACTION_TYPE_UPDATE,
  getValidPermissionsForActionType,
  isValidPermissionForActionType,
} from '@workspace/beqeek-shared';

// Get valid permissions for an action type
const validPermissions = getValidPermissionsForActionType(ACTION_TYPE_UPDATE);
console.log('Valid permissions:', validPermissions);

// Validate permission for action type
if (isValidPermissionForActionType(PERMISSION_SELF_CREATED, ACTION_TYPE_UPDATE)) {
  console.log('Valid permission for this action');
}
```

### Layouts

```typescript
import {
  RECORD_LIST_LAYOUT_GENERIC_TABLE,
  RECORD_DETAIL_LAYOUT_HEAD_DETAIL,
  SORT_ORDER_DESC,
  isValidRecordListLayout,
  isValidSortOrder,
} from '@workspace/beqeek-shared';

// Validate layouts
if (isValidRecordListLayout('generic-table')) {
  console.log('Valid list layout');
}

if (isValidSortOrder('desc')) {
  console.log('Valid sort order');
}
```

## Package Structure

```
src/
├── constants/
│   ├── field-types.ts    # Field type constants and groups
│   ├── action-types.ts   # Action type constants
│   ├── permissions.ts    # Permission constants by action type
│   ├── layouts.ts        # Layout constants
│   └── index.ts          # Barrel export
├── validators/
│   └── index.ts          # Validation helpers
└── index.ts              # Main entry point
```

## Constants Categories

### Field Types

- **Text Fields**: SHORT_TEXT, TEXT, RICH_TEXT, EMAIL, URL
- **Time Fields**: DATE, DATETIME, TIME, YEAR, MONTH, DAY, HOUR, MINUTE, SECOND
- **Number Fields**: INTEGER, NUMERIC
- **Selection Fields**: CHECKBOX_YES_NO, CHECKBOX_ONE, CHECKBOX_LIST, SELECT_ONE, SELECT_LIST
- **Reference Fields**: SELECT_ONE_RECORD, SELECT_LIST_RECORD, SELECT_ONE_WORKSPACE_USER, SELECT_LIST_WORKSPACE_USER, FIRST_REFERENCE_RECORD

### Action Types

- **Record Actions**: create, access, update, delete
- **Comment Actions**: comment_create, comment_access, comment_update, comment_delete
- **Custom Actions**: custom

### Permissions

Permissions vary by action type:

- **Create Actions**: not_allowed, allowed
- **Record Actions**: not_allowed, all, self_created, self_created_2h, assigned_user, created_by_team, etc.
- **Comment Access**: not_allowed, all, comment_self_created, comment_self_created_or_tagged, etc.
- **Comment Modify**: not_allowed, all, comment_self_created, comment_self_created_2h, etc.

### Layouts

- **Record List**: generic-table, head-column
- **Record Detail**: head-detail, two-column-detail
- **Comments Position**: right-panel, hidden
- **Sort Orders**: asc, desc

## Validation Helpers

All validation functions follow the pattern:

- `isValid*()` - Type guard functions that check validity
- `requires*()` - Check if additional properties are required
- `isValid*FieldType()` - Check if field type is valid for specific use cases
- `getValidPermissionsForActionType()` - Get allowed permissions for an action

## TypeScript Support

Full TypeScript support with strict typing:

```typescript
import type { FieldType, ActionType, Permission, RecordListLayout, RecordDetailLayout } from '@workspace/beqeek-shared';

const fieldType: FieldType = 'SHORT_TEXT';
const actionType: ActionType = 'create';
const permission: Permission = 'allowed';
```

## Table Types with i18n

The package provides complete table type templates with i18n support using Paraglide.

```typescript
import { TABLE_TYPE_METADATA, TableType } from '@workspace/beqeek-shared';
// or import specific constants
import { TABLE_TYPE_BLANK, TABLE_TYPE_DEPARTMENT } from '@workspace/beqeek-shared/constants/table-types';

// Example: Using with Paraglide in a React component
import { m } from '@/paraglide/generated/messages';

function TableTypeSelector() {
  const tableTypes = Object.values(TABLE_TYPE_METADATA);

  return (
    <div>
      {tableTypes.map((typeMetadata) => (
        <div key={typeMetadata.type}>
          <img src={typeMetadata.logoUrl} alt={typeMetadata.type} />
          <h3>{m[typeMetadata.nameKey]()}</h3>
          <p>{m[typeMetadata.descriptionKey]()}</p>
        </div>
      ))}
    </div>
  );
}
```

### Available Table Types (35 templates)

- **General**: BLANK (custom setup)
- **Business Operations**: CONTRACT, VENDOR_MANAGEMENT, ASSET_MANAGEMENT
- **HR Management**: EMPLOYEE_PROFILE, DEPARTMENT, JOB_TITLE, WORK_PROCESS, ONBOARDING
- **HR Benefits**: BENEFIT_POLICY, BENEFIT_MANAGEMENT, BENEFIT_PROGRAM_PARTICIPANT
- **HR Compensation**: SALARY_POLICY, SALARY_SETUP, REWARD_POLICY, PENALTY
- **HR Leave**: LEAVE_POLICY, TIME_OFF_RECORD_MANAGEMENT
- **HR Insurance**: INSURANCE_POLICY, TAX_DEDUCTION
- **HR Development**: TRAINING_PROGRAM, LEARNING_PROGRESS, EMPLOYEE_MONTHLY_METRICS
- **HR Culture**: CULTURE_MANAGEMENT, CULTURE_PROGRAM_REGISTRATION
- **Sales & Marketing**: CUSTOMER_PIPELINE, HAIR_SALON_CUSTOMER, INSIGHT_TTM, CONTENT_SCRIPT_MANAGEMENT
- **Project Management**: TASK_EISENHOWER, PROTOTYPE
- **Analysis & Planning**: SWOT_EVALUATION, SCAMPER, HERZBERG_FACTOR
- **Workflow**: APPROVAL_REQUEST

## Table Configurations (NEW!)

The package now includes **complete table configurations** for all 35 table types! Each configuration includes predefined fields, kanban views, gantt charts, and more.

### Import and Use Table Configs

```typescript
// Import from configs module
import { TABLE_CONFIGS, getTableConfig, getTableFields } from '@workspace/beqeek-shared/configs';
import type { TableConfig, TableFieldConfig } from '@workspace/beqeek-shared/types';

// Get complete configuration for a table type
const jobTitleConfig = getTableConfig('JOB_TITLE');
console.log(jobTitleConfig);
// {
//   type: 'JOB_TITLE',
//   title: 'tableType_jobTitle_name', // i18n key
//   fields: [...], // 4 predefined fields
//   kanbanConfigs: [...], // 1 kanban view
//   tableLimit: 30,
//   defaultSort: 'asc',
//   hashedKeywordFields: ['job_title_name', 'job_title_code'],
//   ...
// }

// Get just the fields
const fields = getTableFields('EMPLOYEE_PROFILE');
console.log(fields.length); // 12 fields

// Get a specific field
import { getTableField } from '@workspace/beqeek-shared/configs';
const statusField = getTableField('JOB_TITLE', 'status');
console.log(statusField?.type); // 'SELECT_ONE'
```

### Helper Functions

```typescript
import {
  getRequiredFields,
  getOptionalFields,
  hasKanbanConfigs,
  hasGanttConfigs,
  getSearchableFields,
  validateRequiredFields,
  getTableStats,
  getReferenceFields,
  getSelectFields,
} from '@workspace/beqeek-shared/configs';

// Filter fields
const required = getRequiredFields('JOB_TITLE');
const optional = getOptionalFields('JOB_TITLE');
const references = getReferenceFields('WORK_PROCESS');
const selects = getSelectFields('TASK_EISENHOWER');

// Check features
hasKanbanConfigs('TASK_EISENHOWER'); // true
hasGanttConfigs('TRAINING_PROGRAM'); // true

// Get searchable fields
getSearchableFields('EMPLOYEE_PROFILE'); // ['employee_name', 'employee_code', 'nickname']

// Validate required fields
const result = validateRequiredFields('JOB_TITLE', {
  job_title_name: 'Manager',
  // missing required fields
});
console.log(result.valid); // false
console.log(result.missingFields); // ['job_title_code', 'status']

// Get comprehensive stats
const stats = getTableStats('TASK_EISENHOWER');
console.log(stats);
// {
//   fieldCount: 8,
//   requiredFieldCount: 2,
//   optionalFieldCount: 6,
//   hasKanban: true,
//   kanbanViewCount: 3,
//   hasGantt: true,
//   ganttViewCount: 1,
//   searchableFieldCount: 2,
//   referenceFieldCount: 1,
//   tableLimit: 100,
//   defaultSort: 'desc'
// }
```

### Reference Resolution

Some tables have placeholder references like `{EMPLOYEE_PROFILE}` that need to be resolved:

```typescript
import {
  hasPlaceholderReferences,
  getPlaceholderReferences,
  resolvePlaceholderReferences,
} from '@workspace/beqeek-shared/configs';

// Check for placeholders
hasPlaceholderReferences('WORK_PROCESS'); // true
hasPlaceholderReferences('JOB_TITLE'); // false

// Get list of placeholders
const placeholders = getPlaceholderReferences('WORK_PROCESS');
console.log(placeholders);
// ['EMPLOYEE_PROFILE', 'DEPARTMENT', 'JOB_TITLE', 'SALARY_SETUP']

// Resolve with actual table IDs
const resolved = resolvePlaceholderReferences('WORK_PROCESS', {
  EMPLOYEE_PROFILE: '123456789',
  DEPARTMENT: '987654321',
  JOB_TITLE: '555666777',
  SALARY_SETUP: '111222333',
});
// Returns config with actual IDs instead of {EMPLOYEE_PROFILE}
```

### Type Definitions

```typescript
import type {
  TableConfig,
  TableFieldConfig,
  FieldOption,
  KanbanConfig,
  GanttConfig,
  RecordListConfig,
  RecordDetailConfig,
  FieldConfigWithOptions,
  FieldConfigWithReference,
} from '@workspace/beqeek-shared/types';

// Type guards
import { hasOptions, hasReference, isGenericTableLayout, isHeadColumnLayout } from '@workspace/beqeek-shared/types';

// Use type guards
fields.forEach((field) => {
  if (hasOptions(field)) {
    console.log(field.options); // TypeScript knows this exists
  }
  if (hasReference(field)) {
    console.log(field.referenceTableId); // TypeScript knows this exists
  }
});
```

### Config Structure Example

Each table config follows this structure:

```typescript
{
  type: 'JOB_TITLE',
  title: 'tableType_jobTitle_name', // i18n key
  fields: [
    {
      type: 'SHORT_TEXT',
      label: 'field_jobTitle_name', // i18n key
      name: 'job_title_name',
      placeholder: 'field_jobTitle_name_placeholder', // i18n key
      required: true
    },
    {
      type: 'SELECT_ONE',
      label: 'field_status',
      name: 'status',
      required: true,
      options: [
        {
          text: 'option_active', // i18n key
          value: 'active',
          text_color: '#000000',
          background_color: '#d4edda'
        }
      ]
    }
  ],
  tableLimit: 30,
  defaultSort: 'asc',
  hashedKeywordFields: ['job_title_name', 'job_title_code'],
  quickFilters: [{ fieldName: 'status' }],
  kanbanConfigs: [...],
  ganttCharts: [],
  recordListConfig: {
    layout: 'head-column',
    titleField: 'job_title_name',
    subLineFields: ['job_title_code', 'status']
  },
  recordDetailConfig: null
}
```

### All Available Configs

All 35 table types have complete configurations:

```typescript
import { TABLE_CONFIGS } from '@workspace/beqeek-shared/configs';

Object.keys(TABLE_CONFIGS);
// ['BLANK', 'JOB_TITLE', 'DEPARTMENT', 'EMPLOYEE_PROFILE',
//  'WORK_PROCESS', 'EMPLOYEE_MONTHLY_METRICS', 'PENALTY',
//  'SALARY_SETUP', 'SALARY_POLICY', 'TASK_EISENHOWER', ...]
```

See [docs/table-type-templates-reference.md](../../docs/table-type-templates-reference.md) for complete documentation of all templates.

### i18n Key Pattern

```typescript
// For table type: TABLE_TYPE_DEPARTMENT
nameKey: 'tableType_department_name';
descriptionKey: 'tableType_department_description';

// Usage with Paraglide
const metadata = TABLE_TYPE_METADATA.DEPARTMENT;
const name = m[metadata.nameKey]();
const description = m[metadata.descriptionKey]();
```

All table type translations are stored in:

- `messages/vi.json` (Vietnamese - default)
- `messages/en.json` (English)

## License

MIT
