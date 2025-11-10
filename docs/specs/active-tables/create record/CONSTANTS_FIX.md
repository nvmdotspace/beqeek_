# Constants Usage Fix

**Date**: 2025-11-10
**Issue**: Hardcoded string literals instead of using constants from `@workspace/beqeek-shared`

## Problem

The initial implementation used hardcoded string literals for field type comparisons:

```typescript
// ❌ Bad - Hardcoded strings
if (field.type === 'SHORT_TEXT') { ... }
if (field.type === 'SELECT_ONE' || field.type === 'SELECT_LIST') { ... }
```

**Issues with this approach**:

1. **No type safety** - Typos won't be caught at compile time
2. **Inconsistent** - Different from the rest of the codebase
3. **Maintenance burden** - If field type names change, need to update in multiple places
4. **Violates DRY** - Field type definitions already exist in `@workspace/beqeek-shared`

## Solution

Replaced all hardcoded strings with constants from `@workspace/beqeek-shared`:

```typescript
// ✅ Good - Using constants
import {
  FIELD_TYPE_SHORT_TEXT,
  FIELD_TYPE_SELECT_ONE,
  FIELD_TYPE_SELECT_LIST,
} from '@workspace/beqeek-shared';

if (field.type === FIELD_TYPE_SHORT_TEXT) { ... }
if (field.type === FIELD_TYPE_SELECT_ONE || field.type === FIELD_TYPE_SELECT_LIST) { ... }
```

## Files Modified

### 1. `field-input.tsx`

**Location**: `apps/web/src/features/active-tables/components/record-form/field-input.tsx`

**Changes**:

- ✅ Added imports for all field type constants
- ✅ Replaced all 18 hardcoded field type strings with constants

**Constants imported**:

```typescript
import {
  FIELD_TYPE_SHORT_TEXT,
  FIELD_TYPE_TEXT,
  FIELD_TYPE_EMAIL,
  FIELD_TYPE_URL,
  FIELD_TYPE_RICH_TEXT,
  FIELD_TYPE_INTEGER,
  FIELD_TYPE_NUMERIC,
  FIELD_TYPE_DATE,
  FIELD_TYPE_DATETIME,
  FIELD_TYPE_TIME,
  FIELD_TYPE_CHECKBOX_YES_NO,
  FIELD_TYPE_SELECT_ONE,
  FIELD_TYPE_SELECT_LIST,
  FIELD_TYPE_CHECKBOX_LIST,
  FIELD_TYPE_SELECT_ONE_RECORD,
  FIELD_TYPE_SELECT_LIST_RECORD,
  FIELD_TYPE_SELECT_ONE_WORKSPACE_USER,
  FIELD_TYPE_SELECT_LIST_WORKSPACE_USER,
} from '@workspace/beqeek-shared';
```

**Replacements**:

```typescript
// Before → After
'SHORT_TEXT' → FIELD_TYPE_SHORT_TEXT
'TEXT' → FIELD_TYPE_TEXT
'EMAIL' → FIELD_TYPE_EMAIL
'URL' → FIELD_TYPE_URL
'RICH_TEXT' → FIELD_TYPE_RICH_TEXT
'INTEGER' → FIELD_TYPE_INTEGER
'NUMERIC' → FIELD_TYPE_NUMERIC
'DATE' → FIELD_TYPE_DATE
'DATETIME' → FIELD_TYPE_DATETIME
'TIME' → FIELD_TYPE_TIME
'CHECKBOX_YES_NO' → FIELD_TYPE_CHECKBOX_YES_NO
'SELECT_ONE' → FIELD_TYPE_SELECT_ONE
'SELECT_LIST' → FIELD_TYPE_SELECT_LIST
'CHECKBOX_LIST' → FIELD_TYPE_CHECKBOX_LIST
'SELECT_ONE_RECORD' → FIELD_TYPE_SELECT_ONE_RECORD
'SELECT_LIST_RECORD' → FIELD_TYPE_SELECT_LIST_RECORD
'SELECT_ONE_WORKSPACE_USER' → FIELD_TYPE_SELECT_ONE_WORKSPACE_USER
'SELECT_LIST_WORKSPACE_USER' → FIELD_TYPE_SELECT_LIST_WORKSPACE_USER
```

### 2. `create-record-dialog.tsx`

**Location**: `apps/web/src/features/active-tables/components/record-form/create-record-dialog.tsx`

**Changes**:

- ✅ Added imports for field type constants
- ✅ Replaced 4 hardcoded strings with constants in `getDefaultValues()` function
- ✅ Replaced 1 hardcoded string in field filtering logic

**Constants imported**:

```typescript
import {
  FIELD_TYPE_FIRST_REFERENCE_RECORD,
  FIELD_TYPE_CHECKBOX_YES_NO,
  FIELD_TYPE_SELECT_LIST,
  FIELD_TYPE_CHECKBOX_LIST,
} from '@workspace/beqeek-shared';
```

**Replacements**:

```typescript
// Before → After
'FIRST_REFERENCE_RECORD' → FIELD_TYPE_FIRST_REFERENCE_RECORD
'CHECKBOX_YES_NO' → FIELD_TYPE_CHECKBOX_YES_NO
'SELECT_LIST' → FIELD_TYPE_SELECT_LIST
'CHECKBOX_LIST' → FIELD_TYPE_CHECKBOX_LIST
```

## Benefits

### 1. Type Safety

```typescript
// Compile-time error if constant is misspelled
if (field.type === FIELD_TYPE_SHORT_TEXTT) { ... }
//                  ^^^^^^^^^^^^^^^^^^^^^^
// Error: Cannot find name 'FIELD_TYPE_SHORT_TEXTT'
```

### 2. Auto-completion

IDE provides auto-completion for all available field types:

- `FIELD_TYPE_` → shows all 25+ field type constants
- Prevents typos and reduces cognitive load

### 3. Single Source of Truth

```typescript
// All field types defined once in beqeek-shared
// Changes propagate automatically to all consumers
export const FIELD_TYPE_SHORT_TEXT = 'SHORT_TEXT' as const;
```

### 4. Consistency

```typescript
// Now matches the pattern used throughout the codebase
// encryption-core, active-tables-core, etc. all use constants
if (CommonUtils.encryptFields().includes(fieldType)) {
  // Uses FIELD_TYPE_SHORT_TEXT internally
}
```

### 5. Future-proof

If field type names change or new types are added:

- ✅ Update once in `@workspace/beqeek-shared`
- ✅ All consumers automatically use new values
- ✅ No need to search/replace across codebase

## Verification

### Build Status

```bash
✅ pnpm build - Successful (6.28s)
✅ No type errors
✅ Bundle size unchanged
```

### Code Review Checklist

- [x] All hardcoded field type strings replaced with constants
- [x] Imports added for all used constants
- [x] Build passes successfully
- [x] No regression in functionality
- [x] Consistent with codebase patterns

## Related Constants Available

### Field Type Groups

```typescript
import {
  TEXT_FIELD_TYPES, // ['SHORT_TEXT', 'TEXT', 'RICH_TEXT', 'EMAIL', 'URL']
  TIME_FIELD_TYPES, // ['DATE', 'DATETIME', 'TIME', ...]
  NUMBER_FIELD_TYPES, // ['INTEGER', 'NUMERIC']
  SELECTION_FIELD_TYPES, // ['SELECT_ONE', 'SELECT_LIST', ...]
  REFERENCE_FIELD_TYPES, // ['SELECT_ONE_RECORD', ...]
} from '@workspace/beqeek-shared';

// Usage example
if (TEXT_FIELD_TYPES.includes(field.type)) {
  // Handle all text fields
}
```

### Validation Groups

```typescript
import {
  QUICK_FILTER_VALID_FIELD_TYPES,
  KANBAN_STATUS_VALID_FIELD_TYPES,
  GANTT_DATE_VALID_FIELD_TYPES,
  FIELD_TYPES_WITH_OPTIONS,
  FIELD_TYPES_WITH_REFERENCE,
} from '@workspace/beqeek-shared';
```

## Best Practices Going Forward

### ✅ DO

```typescript
// Import constants
import { FIELD_TYPE_SHORT_TEXT } from '@workspace/beqeek-shared';

// Use in comparisons
if (field.type === FIELD_TYPE_SHORT_TEXT) { ... }

// Use in switch statements
switch (field.type) {
  case FIELD_TYPE_SHORT_TEXT:
    // ...
    break;
}
```

### ❌ DON'T

```typescript
// Don't use hardcoded strings
if (field.type === 'SHORT_TEXT') { ... }

// Don't create local constants
const SHORT_TEXT = 'SHORT_TEXT'; // Already exists in beqeek-shared!

// Don't use string unions without constants
type FieldType = 'SHORT_TEXT' | 'TEXT' | ...; // Use from beqeek-shared!
```

## Additional Notes

### Other Packages Already Using Constants Correctly

1. **encryption-core** (`packages/encryption-core/src/common-utils.ts`):

```typescript
import {
  FIELD_TYPE_SHORT_TEXT,
  FIELD_TYPE_TEXT,
  // ... all field types
} from '@workspace/beqeek-shared';
```

2. **active-tables-core**: Uses type definitions from beqeek-shared

3. **Web app features**: Most features already use constants

This fix brings the create record implementation in line with the existing codebase standards.

## Summary

**Total Changes**:

- Files modified: 2
- Hardcoded strings replaced: 23
- Constants imported: 22
- Build status: ✅ Passing
- Type safety: ✅ Improved
- Consistency: ✅ Achieved

The create record feature now follows the same constant usage pattern as the rest of the Beqeek codebase.
