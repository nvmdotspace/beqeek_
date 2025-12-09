# Shared Constants Reference

## Anti-Patterns to Avoid

❌ **DO NOT hardcode action types or permissions**:

```typescript
// ❌ Bad - hardcoded values
type CommentActionType = 'comment_create' | 'comment_access' | 'comment_update' | 'comment_delete';
const OPTIONS = ['not_allowed', 'all', 'self_created'];

// ✅ Good - import from package
import { COMMENT_ACTION_TYPES, COMMENT_MODIFY_PERMISSIONS, type CommentActionType } from '@workspace/beqeek-shared';
```

❌ **DO NOT duplicate field type definitions**:

```typescript
// ❌ Bad - local definitions
const FIELD_TYPES = { SHORT_TEXT: 'SHORT_TEXT', RICH_TEXT: 'RICH_TEXT' };

// ✅ Good - import constants
import { FIELD_TYPE_SHORT_TEXT, FIELD_TYPE_RICH_TEXT } from '@workspace/beqeek-shared';
```

## Common Import Patterns

**For UI components with permissions logic**:

```typescript
import {
  COMMENT_ACTION_TYPES,
  COMMENT_CREATE_PERMISSIONS,
  COMMENT_ACCESS_PERMISSIONS,
  COMMENT_MODIFY_PERMISSIONS,
  type CommentActionType,
} from '@workspace/beqeek-shared';
```

**For field-based components**:

```typescript
import {
  FIELD_TYPE_SHORT_TEXT,
  FIELD_TYPE_SELECT_ONE,
  TEXT_FIELD_TYPES,
  QUICK_FILTER_VALID_FIELD_TYPES,
  type FieldType,
} from '@workspace/beqeek-shared';
```

**For table configuration**:

```typescript
import {
  TABLE_CONFIGS,
  TABLE_TYPE_BLANK,
  TABLE_TYPE_TASK_EISENHOWER,
  type TableConfig,
} from '@workspace/beqeek-shared/configs';
```

**For layout configuration**:

```typescript
import {
  RECORD_LIST_LAYOUT_GENERIC_TABLE,
  RECORD_DETAIL_LAYOUT_TWO_COLUMN,
  COMMENTS_POSITION_RIGHT_PANEL,
  type RecordListLayout,
} from '@workspace/beqeek-shared';
```

**For React components**:

```typescript
import { FieldRenderer, KanbanBoard, RecordList, usePermissions, useEncryption } from '@workspace/active-tables-core';
```

## Available Constants Reference

### Action Types (`@workspace/beqeek-shared`)

- `ACTION_TYPE_CREATE`, `ACTION_TYPE_ACCESS`, `ACTION_TYPE_UPDATE`, `ACTION_TYPE_DELETE`
- `ACTION_TYPE_COMMENT_CREATE`, `ACTION_TYPE_COMMENT_ACCESS`, `ACTION_TYPE_COMMENT_UPDATE`, `ACTION_TYPE_COMMENT_DELETE`
- `ACTION_TYPE_CUSTOM`
- Arrays: `COMMENT_ACTION_TYPES`, `RECORD_ACTION_TYPES`, `SYSTEM_ACTION_TYPES`

### Permission Arrays (`@workspace/beqeek-shared`)

- `CREATE_PERMISSIONS` - For 'create' action dropdowns
- `RECORD_ACTION_PERMISSIONS` - For 'access', 'update', 'delete' actions
- `COMMENT_CREATE_PERMISSIONS` - For 'comment_create' action (19 options)
- `COMMENT_ACCESS_PERMISSIONS` - For 'comment_access' action (6 options)
- `COMMENT_MODIFY_PERMISSIONS` - For 'comment_update' and 'comment_delete' (10 options)

### Field Types (`@workspace/beqeek-shared`)

- Text: `FIELD_TYPE_SHORT_TEXT`, `FIELD_TYPE_TEXT`, `FIELD_TYPE_RICH_TEXT`, `FIELD_TYPE_EMAIL`, `FIELD_TYPE_URL`
- Time: `FIELD_TYPE_DATE`, `FIELD_TYPE_DATETIME`, `FIELD_TYPE_TIME`, etc.
- Number: `FIELD_TYPE_INTEGER`, `FIELD_TYPE_NUMERIC`
- Selection: `FIELD_TYPE_SELECT_ONE`, `FIELD_TYPE_SELECT_LIST`, etc.
- Reference: `FIELD_TYPE_SELECT_ONE_RECORD`, `FIELD_TYPE_SELECT_LIST_RECORD`, etc.
- Groups: `TEXT_FIELD_TYPES`, `NUMBER_FIELD_TYPES`, `SELECTION_FIELD_TYPES`, etc.

### Layout Constants (`@workspace/beqeek-shared`)

- List layouts: `RECORD_LIST_LAYOUT_GENERIC_TABLE`, `RECORD_LIST_LAYOUT_HEAD_COLUMN`
- Detail layouts: `RECORD_DETAIL_LAYOUT_HEAD_DETAIL`, `RECORD_DETAIL_LAYOUT_TWO_COLUMN`
- Comments: `COMMENTS_POSITION_RIGHT_PANEL`, `COMMENTS_POSITION_HIDDEN`
- Sort: `SORT_ORDER_ASC`, `SORT_ORDER_DESC`

### Table Templates (`@workspace/beqeek-shared/configs`)

- 35 pre-configured templates: `TABLE_TYPE_BLANK`, `TABLE_TYPE_TASK_EISENHOWER`, `TABLE_TYPE_CONTRACT`, etc.
- Access via: `TABLE_CONFIGS[TABLE_TYPE_TASK_EISENHOWER]`
