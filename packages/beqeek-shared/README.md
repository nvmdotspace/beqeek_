# @workspace/beqeek-shared

Shared constants, types, and utilities for the Beqeek platform.

## Overview

This package provides system-wide constants and validation helpers for the Beqeek Active Tables feature, based on the [active-table-config-functional-spec.md](../../docs/specs/active-table-config-functional-spec.md).

## Installation

```bash
pnpm add @workspace/beqeek-shared
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

### Available Table Types (37 templates)

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
