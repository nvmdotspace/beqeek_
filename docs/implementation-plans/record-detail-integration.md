# Record Detail Navigation Implementation Plan

## Executive Summary

The navigation from records list to record detail **already exists and is working**. The current implementation in `record-detail-page.tsx` uses a **custom-built** RecordDetailView component that duplicates functionality already available in `@workspace/active-tables-core`.

**Goal**: Replace the custom implementation with the core `RecordDetail` component from `@workspace/active-tables-core` to:

- Reduce code duplication
- Leverage battle-tested core components
- Gain built-in E2EE support
- Get proper field rendering with FieldRenderer
- Support inline editing capabilities

---

## Current State Analysis

### ✅ What's Already Working

1. **Navigation Flow** (active-table-records-page.tsx:175-188)

   ```typescript
   const handleViewRecord = (recordOrId: TableRecord | string) => {
     // Saves list context (filters, view mode, record IDs)
     listContext.save({ recordIds, search, timestamp });

     // Navigates to ROUTES.ACTIVE_TABLES.RECORD_DETAIL
     navigate({ to, params: { locale, workspaceId, tableId, recordId } });
   };
   ```

2. **Record Detail Page Structure** (record-detail-page.tsx)
   - Type-safe route params using `getRouteApi()`
   - Loads table config and all records via `useActiveTableRecordsWithConfig`
   - Prev/Next navigation with keyboard shortcuts
   - List context restoration for back navigation
   - Proper loading and error states

3. **Custom RecordDetailView Component** (record-detail-view.tsx)
   - Layout switching (head-detail vs two-column)
   - Comments panel positioning
   - Field rendering via `RecordFieldDisplay`
   - Uses constants from `@workspace/beqeek-shared`

### ❌ What Needs to Change

1. **Component Source**: Currently using custom `RecordDetailView` instead of core `RecordDetail`
2. **Field Rendering**: Using custom `RecordFieldDisplay` instead of core `FieldRenderer`
3. **Encryption**: Custom components don't handle E2EE decryption
4. **Type Alignment**: Custom props don't match core component interfaces
5. **Missing Features**: No inline editing, no workspace users integration

---

## Architecture Overview

### Component Hierarchy (Target State)

```
RecordDetailPage (apps/web)
└── RecordDetail (@workspace/active-tables-core)
    ├── LoadingState / ErrorState (built-in)
    ├── HeadDetailLayout OR TwoColumnDetailLayout
    │   ├── FieldRenderer (for titleField)
    │   ├── FieldRenderer (for subLineFields)
    │   └── FieldRenderer (for tailFields/columnFields)
    └── CommentsPanel (if configured)
```

### Data Flow

```
1. Route params → getRouteApi(ROUTES.ACTIVE_TABLES.RECORD_DETAIL)
2. API call → useActiveTableRecordsWithConfig(workspaceId, tableId)
3. Response → { table, records }
4. Find record → records.find(r => r.id === recordId)
5. Extract config → table.config.recordDetailConfig
6. Render → RecordDetail(record, table.config, recordDetailConfig)
```

### State Management

| State Type     | Storage        | Purpose                                |
| -------------- | -------------- | -------------------------------------- |
| Route params   | URL            | workspaceId, tableId, recordId, locale |
| List context   | sessionStorage | recordIds array for prev/next nav      |
| Table config   | React Query    | Table schema, fields, config           |
| Records        | React Query    | All records for navigation             |
| Encryption key | localStorage   | E2EE decryption (if enabled)           |

---

## Type System

### Core Types (from @workspace/active-tables-core)

```typescript
// packages/active-tables-core/src/types/config.ts
export interface RecordDetailConfig {
  layout: string; // 'head-detail' | 'two-column'
  commentsPosition: string; // 'right-panel' | 'bottom' | 'none'
  titleField: string;
  subLineFields: string[];
  tailFields: string[]; // For head-detail layout
  column1Fields?: string[]; // For two-column layout
  column2Fields?: string[];
}

// packages/active-tables-core/src/components/record-detail/record-detail-props.ts
export interface RecordDetailProps extends BaseRecordDetailProps {
  enableEditing?: boolean;
  onUpdate?: (recordId: string, updates: Record<string, unknown>) => Promise<void>;
  onDelete?: (recordId: string) => Promise<void>;
  comments?: RecordComment[];
  onCommentAdd?: (content: string) => Promise<void>;
  onCommentUpdate?: (commentId: string, content: string) => Promise<void>;
  onCommentDelete?: (commentId: string) => Promise<void>;
  commentsLoading?: boolean;
  className?: string;
  onRetry?: () => void;
}

export interface BaseRecordDetailProps {
  table: Table;
  record: TableRecord;
  config: RecordDetailConfig;
  loading?: boolean;
  error?: Error | string | null;
  currentUser?: CurrentUser;
  workspaceUsers?: WorkspaceUser[];
  messages?: Partial<ActiveTablesMessages>;
  encryptionKey?: string;
}
```

### Constants (from @workspace/beqeek-shared)

```typescript
// Already imported in current code - keep using these
import {
  RECORD_DETAIL_LAYOUT_HEAD_DETAIL, // 'head-detail'
  RECORD_DETAIL_LAYOUT_TWO_COLUMN, // 'two-column-detail'
  COMMENTS_POSITION_RIGHT_PANEL, // 'right-panel'
  COMMENTS_POSITION_HIDDEN, // 'hidden'
} from '@workspace/beqeek-shared/constants/layouts';
```

---

## Implementation Plan

### Phase 1: Prepare RecordDetailPage Component ✅

**Files to Modify:**

- `apps/web/src/features/active-tables/pages/record-detail-page.tsx`

**Changes:**

1. Import `RecordDetail` from `@workspace/active-tables-core`
2. Remove custom `RecordDetailView` import
3. Update props mapping to match core component interface
4. Add encryption key from `useTableEncryption` hook
5. Fetch workspace users for field rendering
6. Map table.config to proper RecordDetailConfig structure

**Code Changes:**

```typescript
// 1. Update imports
import { RecordDetail } from '@workspace/active-tables-core';
import { useTableEncryption } from '../hooks/use-table-encryption';
import { useGetWorkspaceUsers } from '@/features/workspace-users/hooks/use-get-workspace-users';

// 2. Add encryption and workspace users hooks
const encryption = useTableEncryption(workspaceId ?? '', tableId, table?.config);
const { data: workspaceUsers } = useGetWorkspaceUsers(workspaceId, {
  query: 'BASIC_WITH_AVATAR',
});

// 3. Build config with proper defaults
const recordDetailConfig: RecordDetailConfig = {
  layout: RECORD_DETAIL_LAYOUT_HEAD_DETAIL,
  commentsPosition: COMMENTS_POSITION_RIGHT_PANEL,
  titleField: table.config.fields[0]?.name ?? '',
  subLineFields: [],
  tailFields: [],
  column1Fields: [],
  column2Fields: [],
  ...(table.config.recordDetailConfig ?? {}),
};

// 4. Replace RecordDetailView with RecordDetail
<RecordDetail
  table={table}
  record={currentRecord}
  config={recordDetailConfig}
  loading={recordsLoading}
  error={recordsError}
  currentUser={undefined} // TODO: Add auth context
  workspaceUsers={workspaceUsers}
  encryptionKey={encryption.encryptionKey || undefined}
  onCommentAdd={handleCommentAdd}
  comments={[]} // TODO: Integrate comments API
  commentsLoading={false}
  messages={{
    loading: 'Loading record...',
    error: 'Failed to load record',
    recordNotFound: 'Record not found',
  }}
  onRetry={() => window.location.reload()}
/>
```

### Phase 2: Remove Custom Components 🗑️

**Files to Delete:**

- `apps/web/src/features/active-tables/components/record-detail-view.tsx` (custom implementation)
- `apps/web/src/features/active-tables/components/record-detail-header.tsx` (if not used elsewhere)
- `apps/web/src/features/active-tables/components/record-field-display.tsx` (replaced by FieldRenderer)

**Verification:**

- Run `pnpm build` to ensure no broken imports
- Search codebase for any remaining imports of deleted files

### Phase 3: Fix Type Inconsistencies 🔧

**Issue**: Core component expects `Table` type from `@workspace/active-tables-core`, but API returns different structure

**Solution**: Create type adapter in hooks

```typescript
// apps/web/src/features/active-tables/hooks/use-active-tables.ts

import type { Table as CoreTable } from '@workspace/active-tables-core';
import type { ActiveTable } from '../types';

/**
 * Convert API table response to core Table type
 */
export function adaptToCoreTable(apiTable: ActiveTable): CoreTable {
  return {
    id: apiTable.id,
    name: apiTable.name,
    description: apiTable.description,
    config: apiTable.config, // Should match TableConfig from core
    createdAt: apiTable.createdAt,
    updatedAt: apiTable.updatedAt,
  };
}
```

### Phase 4: Integrate Comments API 💬

**New File**: `apps/web/src/features/active-tables/hooks/use-record-comments.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { activeTablesClient } from '@/shared/api/active-tables-client';
import type { RecordComment } from '@workspace/active-tables-core';

export function useRecordComments(workspaceId: string, tableId: string, recordId: string) {
  const queryClient = useQueryClient();

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['record-comments', workspaceId, tableId, recordId],
    queryFn: () => fetchRecordComments(workspaceId, tableId, recordId),
    enabled: !!workspaceId && !!tableId && !!recordId,
  });

  const addCommentMutation = useMutation({
    mutationFn: (content: string) => createRecordComment(workspaceId, tableId, recordId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['record-comments', workspaceId, tableId, recordId],
      });
    },
  });

  const updateCommentMutation = useMutation({
    mutationFn: ({ commentId, content }: { commentId: string; content: string }) =>
      updateRecordComment(workspaceId, tableId, recordId, commentId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['record-comments', workspaceId, tableId, recordId],
      });
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: string) => deleteRecordComment(workspaceId, tableId, recordId, commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['record-comments', workspaceId, tableId, recordId],
      });
    },
  });

  return {
    comments,
    isLoading,
    addComment: (content: string) => addCommentMutation.mutateAsync(content),
    updateComment: (commentId: string, content: string) => updateCommentMutation.mutateAsync({ commentId, content }),
    deleteComment: (commentId: string) => deleteCommentMutation.mutateAsync(commentId),
  };
}

// TODO: Implement API functions when endpoints are available
async function fetchRecordComments(workspaceId: string, tableId: string, recordId: string): Promise<RecordComment[]> {
  // Return empty for now
  return [];
}

async function createRecordComment(
  workspaceId: string,
  tableId: string,
  recordId: string,
  content: string,
): Promise<RecordComment> {
  // TODO: Implement when API available
  throw new Error('Not implemented');
}

async function updateRecordComment(
  workspaceId: string,
  tableId: string,
  recordId: string,
  commentId: string,
  content: string,
): Promise<void> {
  // TODO: Implement when API available
  throw new Error('Not implemented');
}

async function deleteRecordComment(
  workspaceId: string,
  tableId: string,
  recordId: string,
  commentId: string,
): Promise<void> {
  // TODO: Implement when API available
  throw new Error('Not implemented');
}
```

### Phase 5: Add Current User Context 👤

**Approach**: Add auth context to provide currentUser prop

```typescript
// apps/web/src/features/active-tables/pages/record-detail-page.tsx

import { useAuthStore } from '@/stores/auth-store';

// Inside component
const currentUser = useAuthStore((state) => state.user);

// Pass to RecordDetail
<RecordDetail
  currentUser={currentUser ? {
    id: currentUser.id,
    fullName: currentUser.fullName,
    avatar: currentUser.avatar,
  } : undefined}
  // ... other props
/>
```

---

## Configuration Handling

### Default Config Strategy

```typescript
/**
 * Build recordDetailConfig with safe defaults
 */
function buildRecordDetailConfig(table: Table): RecordDetailConfig {
  const baseConfig = table.config.recordDetailConfig;
  const firstField = table.config.fields[0]?.name ?? '';

  return {
    // Layout defaults
    layout: baseConfig?.layout || RECORD_DETAIL_LAYOUT_HEAD_DETAIL,
    commentsPosition: baseConfig?.commentsPosition || COMMENTS_POSITION_RIGHT_PANEL,

    // Required fields with fallbacks
    titleField: baseConfig?.titleField || firstField,
    subLineFields: baseConfig?.subLineFields || [],
    tailFields: baseConfig?.tailFields || [],

    // Optional two-column fields
    column1Fields: baseConfig?.column1Fields || [],
    column2Fields: baseConfig?.column2Fields || [],
  };
}
```

### Field Validation

```typescript
/**
 * Validate that configured fields exist in table schema
 */
function validateDetailConfig(
  config: RecordDetailConfig,
  fields: FieldConfig[],
): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const fieldNames = new Set(fields.map((f) => f.name));

  // Check title field
  if (!fieldNames.has(config.titleField)) {
    errors.push(`Title field "${config.titleField}" not found in table schema`);
  }

  // Check other fields
  const allConfigFields = [
    ...config.subLineFields,
    ...config.tailFields,
    ...(config.column1Fields || []),
    ...(config.column2Fields || []),
  ];

  allConfigFields.forEach((fieldName) => {
    if (!fieldNames.has(fieldName)) {
      errors.push(`Field "${fieldName}" not found in table schema`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}
```

---

## Error Handling

### Scenarios and Solutions

| Scenario                   | Detection                                       | Solution                                                     |
| -------------------------- | ----------------------------------------------- | ------------------------------------------------------------ |
| Missing recordDetailConfig | `!table.config.recordDetailConfig`              | Use default head-detail layout with first field as title     |
| Invalid titleField         | Field not in schema                             | Use first field in schema as fallback                        |
| Empty field arrays         | All arrays length === 0                         | Display all fields in order from schema                      |
| Invalid layout value       | Layout not recognized                           | Fall back to head-detail (core component handles this)       |
| Missing record             | `!currentRecord`                                | Core component shows "Record not found" error state          |
| E2EE without key           | `table.config.e2eeEncryption && !encryptionKey` | Show encryption key prompt (already handled in records page) |
| API error                  | React Query error state                         | Core component shows error with retry button                 |

---

## Testing Checklist

### Unit Tests

- [ ] buildRecordDetailConfig with various inputs
- [ ] validateDetailConfig edge cases
- [ ] Type adapters (API → Core)

### Integration Tests

- [ ] Navigation from records list to detail
- [ ] Prev/Next navigation preserves list context
- [ ] Back button restores view mode and filters
- [ ] Keyboard shortcuts (←, →, Esc) work
- [ ] Layout switching (head-detail ↔ two-column)
- [ ] Comments panel positioning (right, bottom, none)

### E2EE Tests

- [ ] Encrypted table displays decrypted values
- [ ] Missing encryption key shows appropriate UI
- [ ] Key validation on detail page load

### Responsive Tests

- [ ] Mobile: Comments panel position
- [ ] Mobile: Two-column collapses to single
- [ ] Tablet: Proper spacing and layout

---

## Migration Checklist

### Pre-Implementation

- [x] Analyze current implementation
- [x] Document core component interface
- [x] Create type mapping strategy
- [ ] Review encryption requirements
- [ ] Plan comments API integration

### Implementation

- [ ] Phase 1: Update RecordDetailPage to use core component
- [ ] Phase 2: Remove custom components
- [ ] Phase 3: Fix type inconsistencies
- [ ] Phase 4: Integrate comments API (stub for now)
- [ ] Phase 5: Add current user context

### Post-Implementation

- [ ] Remove deleted files from git
- [ ] Update documentation
- [ ] Run full test suite
- [ ] Manual QA on dev environment
- [ ] Performance check (encryption overhead)

---

## Key Technical Decisions

### 1. Why Replace Custom Components?

**Decision**: Use `@workspace/active-tables-core` components instead of custom implementation

**Rationale**:

- **DRY Principle**: Core components are used by multiple consumers
- **Encryption Support**: Built-in E2EE handling with `useRecordDecryption` hook
- **Field Rendering**: `FieldRenderer` handles all 30+ field types correctly
- **Maintenance**: Bugs fixed once, benefits all consumers
- **Features**: Inline editing, user references, proper validation

### 2. How to Handle Type Mismatches?

**Decision**: Create adapter functions instead of modifying core types

**Rationale**:

- Core package is shared across multiple apps
- Web app API structure may differ from other consumers
- Adapters keep transformation logic in web app layer
- Easier to update when API changes

### 3. When to Implement Comments?

**Decision**: Stub comments API for Phase 4, implement later

**Rationale**:

- Core component works with empty comments array
- Comments API endpoint may not exist yet
- Can be added incrementally without blocking detail view
- UI/UX is already built and tested in core

### 4. Encryption Key Management?

**Decision**: Reuse existing `useTableEncryption` hook from records page

**Rationale**:

- Consistent UX (same key prompt on both pages)
- Key is cached in localStorage (no re-prompting)
- Validation already implemented
- Handles both E2EE and non-E2EE tables

---

## Potential Issues & Solutions

### Issue 1: Core Component Layout Not Matching

**Symptom**: UI looks different from design mockups

**Cause**: Core component uses different CSS classes

**Solution**:

- Use `className` prop to override styling
- Submit PR to core package if design is better
- Add custom CSS module for web-specific styles

### Issue 2: Missing Workspace Users

**Symptom**: User reference fields show IDs instead of names

**Cause**: Workspace users not fetched or not passed to component

**Solution**:

```typescript
const { data: workspaceUsers } = useGetWorkspaceUsers(workspaceId, {
  query: 'BASIC_WITH_AVATAR',
});
```

### Issue 3: Slow Performance with E2EE

**Symptom**: Detail page loads slowly for encrypted tables

**Cause**: Decryption happens synchronously in component

**Solution**:

- Core component already uses `useMemo` for decryption
- Ensure `encryptionKey` doesn't change on every render
- Consider decrypting in React Query transform function

### Issue 4: Comments Not Loading

**Symptom**: Comments panel is empty

**Cause**: API integration incomplete

**Solution**:

- Verify API endpoint exists in Swagger spec
- Implement `use-record-comments.ts` hook when ready
- Use mock data from core package for development

---

## Files Summary

### Files to Modify

1. `apps/web/src/features/active-tables/pages/record-detail-page.tsx` - Replace custom component with core
2. `apps/web/src/features/active-tables/hooks/use-active-tables.ts` - Add type adapter functions

### Files to Create

1. `apps/web/src/features/active-tables/hooks/use-record-comments.ts` - Comments API integration
2. `apps/web/src/features/active-tables/utils/record-detail-config.ts` - Config builder and validator

### Files to Delete

1. `apps/web/src/features/active-tables/components/record-detail-view.tsx`
2. `apps/web/src/features/active-tables/components/record-detail-header.tsx` (if not used elsewhere)
3. `apps/web/src/features/active-tables/components/record-field-display.tsx`

### Files to Review

1. `apps/web/src/features/active-tables/components/comments-panel.tsx` - Check compatibility with core
2. `apps/web/src/features/active-tables/hooks/use-table-encryption.ts` - Ensure returns correct format

---

## Success Criteria

✅ **Implementation Complete When**:

1. Record detail page uses `RecordDetail` from core package
2. All layouts render correctly (head-detail, two-column)
3. Comments panel positions work (right, bottom, none)
4. E2EE tables decrypt properly
5. Workspace users display in user reference fields
6. No TypeScript errors or `any` types
7. All deleted files removed from git
8. Navigation preserves list context
9. Keyboard shortcuts work
10. Mobile responsive design maintained

---

## References

- **Core Component**: `packages/active-tables-core/src/components/record-detail/`
- **Type Definitions**: `packages/active-tables-core/src/types/config.ts`
- **Constants**: `packages/beqeek-shared/src/constants/layouts.ts`
- **Functional Spec**: `docs/specs/active-table-config-functional-spec.md` (Section 2.5)
- **Legacy Implementation**: `docs/BA/active-tables/WORKSPACES_DETAIL_ANALYSIS.md`

---

**Document Version**: 1.0
**Created**: 2025-01-10
**Status**: Planning Complete
**Next Step**: Begin Phase 1 Implementation
