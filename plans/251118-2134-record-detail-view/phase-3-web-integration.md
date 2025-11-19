# Phase 3: Web App Integration

**Phase**: 3 of 4
**Duration**: 2-3 days
**Status**: Not Started
**Dependencies**: Phase 2 (Core Package Implementation)

## Context

Integrate reusable `RecordDetail` component from `@workspace/active-tables-core` into web app. Connect to TanStack Router, handle encryption key management, implement permission-based UI, add loading/error states, and optimize for mobile responsiveness.

## Overview

Build `RecordDetailPage` component that:

- Integrates with TanStack Router (`/$locale/workspaces/$workspaceId/tables/$tableId/records/$recordId`)
- Fetches record data using `useRecordById` hook
- Manages encryption keys via localStorage
- Checks permissions before rendering UI elements
- Handles loading, error, and empty states
- Provides breadcrumb navigation
- Supports mobile-responsive layouts
- Integrates comments panel
- Adds keyboard shortcuts

## Key Insights

### Route Integration Pattern

**File-based routing** (TanStack Router):

```
apps/web/src/routes/
└── $locale/
    └── workspaces/
        └── $workspaceId/
            └── tables/
                └── $tableId/
                    └── records/
                        └── $recordId.tsx  # This route
```

**Route params:**

- `locale`: Language (vi, en)
- `workspaceId`: Workspace UUID
- `tableId`: Table UUID
- `recordId`: Record UUID

### Data Flow

```
Route ($recordId.tsx)
  ↓
getRouteApi(ROUTES.ACTIVE_TABLES.RECORD_DETAIL)
  ↓
useParams() → { locale, workspaceId, tableId, recordId }
  ↓
useRecordById(workspaceId, tableId, recordId, table, { encryptionKey })
  ↓
RecordDetail component (from active-tables-core)
  ↓
Display record with inline editing
```

### Permission Checks

| Feature        | Permission                   | Fallback                 |
| -------------- | ---------------------------- | ------------------------ |
| View record    | `permissions.access`         | Show "No access" message |
| Edit field     | `permissions.update`         | Disable inline edit      |
| Delete record  | `permissions.delete`         | Hide delete button       |
| Create comment | `permissions.comment_create` | Hide comment editor      |
| Edit comment   | `permissions.comment_update` | Hide edit button         |

## Requirements

### RecordDetailPage Component

**Purpose**: Route-connected page component that orchestrates data fetching and rendering

**Structure:**

```typescript
export function RecordDetailPage() {
  // 1. Get route params
  const { locale, workspaceId, tableId, recordId } = route.useParams();

  // 2. Fetch table config
  const { table, isLoading: isLoadingTable } = useActiveTable(tableId);

  // 3. Get encryption key
  const { encryptionKey } = useTableEncryption(tableId);

  // 4. Fetch record
  const { record, isLoading, error } = useRecordById(
    workspaceId,
    tableId,
    recordId,
    table,
    { encryptionKey }
  );

  // 5. Fetch reference records
  const { referenceRecords } = useReferenceRecords(/* ... */);

  // 6. Fetch user records
  const { userRecords } = useUserRecords(workspaceId);

  // 7. Render
  if (isLoading) return <LoadingSkeleton />;
  if (error) return <ErrorState error={error} />;
  if (!record) return <NotFoundState />;

  return (
    <RecordDetail
      record={record}
      table={table}
      referenceRecords={referenceRecords}
      userRecords={userRecords}
      onFieldChange={handleFieldChange}
      onDelete={handleDelete}
    />
  );
}
```

### Features to Implement

1. **Breadcrumb Navigation**

   ```
   Workspace > Tables > Table Name > Record Title
   ```

2. **Action Menu**
   - Edit record (full form)
   - Delete record
   - Duplicate record
   - Export record
   - Share record link

3. **Keyboard Shortcuts**
   - `Escape`: Close inline edit / Go back
   - `Cmd/Ctrl + S`: Save inline edit
   - `Cmd/Ctrl + E`: Enter edit mode (first field)
   - `Cmd/Ctrl + K`: Open comments panel
   - `Cmd/Ctrl + /`: Show shortcuts help

4. **Loading States**
   - Table loading skeleton
   - Record loading skeleton
   - Decryption loading overlay
   - Field-level loading (inline edit save)

5. **Error States**
   - Table not found
   - Record not found
   - Encryption key missing/invalid
   - Decryption failed
   - No access permission
   - Network error

6. **Mobile Optimization**
   - Single-column layout on mobile
   - Sticky header with back button
   - Bottom sheet for comments
   - Swipe gestures (back/forward)

## Architecture

### Component Structure

```
RecordDetailPage (apps/web)
├── <Breadcrumb /> - Navigation
├── <RecordHeader /> - Title + Actions
├── <EncryptionKeyPrompt /> - If key missing
├── <ErrorBoundary>
│   ├── <LoadingSkeleton /> - If loading
│   ├── <ErrorState /> - If error
│   ├── <NotFoundState /> - If not found
│   └── <RecordDetail /> - Main component (from core)
│       ├── Layout (HeadDetail / TwoColumn)
│       ├── Fields (inline editable)
│       ├── CommentsPanel (sidebar)
│       ├── ActivityTimeline
│       └── RelatedRecords
└── <ShortcutsHelp /> - Keyboard shortcuts modal
```

### Route Configuration

**File:** `apps/web/src/routes/$locale/workspaces/$workspaceId/tables/$tableId/records/$recordId.tsx`

```typescript
import { createFileRoute } from '@tanstack/react-router';
import { lazy, Suspense } from 'react';
import { getRouteApi } from '@tanstack/react-router';
import { ROUTES } from '@/shared/route-paths';

const RecordDetailPageLazy = lazy(
  () => import('@/features/active-tables/pages/record-detail-page')
);

const route = getRouteApi(ROUTES.ACTIVE_TABLES.RECORD_DETAIL);

export const Route = createFileRoute(ROUTES.ACTIVE_TABLES.RECORD_DETAIL)({
  component: RecordDetailComponent,
  beforeLoad: async ({ params }) => {
    // Auth guard
    const isAuthenticated = getIsAuthenticated();
    if (!isAuthenticated) {
      throw redirect({ to: ROUTES.LOGIN });
    }
  },
});

function RecordDetailComponent() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <RecordDetailPageLazy />
    </Suspense>
  );
}
```

### Hooks Integration

**Existing hooks to use:**

1. **`useRecordById`** - Fetch + decrypt record

```typescript
const { record, rawRecord, isLoading, isDecrypting, error, permissions } = useRecordById(
  workspaceId,
  tableId,
  recordId,
  table,
  { encryptionKey, enabled: !!encryptionKey },
);
```

2. **`useTableEncryption`** - Get encryption key

```typescript
const { encryptionKey, setEncryptionKey, clearEncryptionKey } = useTableEncryption(tableId);
```

3. **`useUpdateRecordField`** - Inline field update

```typescript
const { mutateAsync: updateField, isPending } = useUpdateRecordField(workspaceId, tableId);
```

4. **`useDeleteRecord`** - Delete record

```typescript
const { mutateAsync: deleteRecord, isPending } = useDeleteRecord(workspaceId, tableId);
```

5. **`useRecordComments`** - Comments CRUD

```typescript
const { comments, createComment, updateComment, deleteComment } = useRecordComments(workspaceId, tableId, recordId);
```

### State Management

**Local State (useState):**

- UI toggles (show comments, show timeline)
- Keyboard shortcuts help modal
- Delete confirmation dialog
- Share link dialog

**Server State (React Query):**

- Record data
- Comments data
- Reference records
- User records

**Global State (Zustand):**

- Encryption key (via `useTableEncryption`)
- User preferences (layout, theme)

## Related Code Files

### Files to Create

1. **Page Component:**
   - `apps/web/src/features/active-tables/pages/record-detail-page.tsx`

2. **Supporting Components:**
   - `apps/web/src/features/active-tables/components/record-header.tsx`
   - `apps/web/src/features/active-tables/components/record-loading-skeleton.tsx`
   - `apps/web/src/features/active-tables/components/record-not-found.tsx`
   - `apps/web/src/features/active-tables/components/shortcuts-help-dialog.tsx`

3. **Route File (update existing):**
   - `apps/web/src/routes/$locale/workspaces/$workspaceId/tables/$tableId/records/$recordId.tsx`

### Files to Reference

1. **Existing Hooks:**
   - `apps/web/src/features/active-tables/hooks/use-record-by-id.ts`
   - `apps/web/src/features/active-tables/hooks/use-table-encryption.ts`
   - `apps/web/src/features/active-tables/hooks/use-update-record-field.ts`
   - `apps/web/src/features/active-tables/hooks/use-delete-record.ts`
   - `apps/web/src/features/active-tables/hooks/use-record-comments.ts`

2. **Existing Components:**
   - `apps/web/src/features/active-tables/components/encryption-key-modal.tsx`
   - `apps/web/src/features/active-tables/components/comments-panel.tsx`
   - `apps/web/src/components/error-boundary.tsx`

3. **Core Package:**
   - `packages/active-tables-core/src/components/record-detail/record-detail.tsx`

## Implementation Steps

### Day 1: Route & Page Setup

1. Update route file (`$recordId.tsx`)
2. Create `RecordDetailPage` component skeleton
3. Integrate `getRouteApi()` for params
4. Add auth guard with `beforeLoad`
5. Add lazy loading with Suspense
6. Create loading skeleton component
7. Create error state component
8. Create not-found state component

### Day 2: Data Fetching & Integration

1. Integrate `useRecordById` hook
2. Handle encryption key management
3. Show encryption key prompt if missing
4. Integrate `useUpdateRecordField` for inline edits
5. Integrate `useDeleteRecord` for delete action
6. Fetch reference records
7. Fetch user records
8. Handle loading states
9. Handle error states

### Day 3: UI Components & Features

1. Create `RecordHeader` component (title + actions)
2. Add breadcrumb navigation
3. Integrate `RecordDetail` component from core
4. Add action menu (edit, delete, duplicate, share)
5. Add keyboard shortcuts
6. Create shortcuts help dialog
7. Add mobile optimizations
8. Add dark mode support

### Day 4: Comments & Timeline

1. Integrate `CommentsPanel` component
2. Connect to `useRecordComments` hook
3. Add activity timeline
4. Handle comment permissions
5. Add related records section
6. Test all interactions
7. Add error boundaries

### Day 5: Polish & Optimization

1. Add smooth animations
2. Optimize performance (memo, lazy)
3. Add accessibility attributes
4. Test keyboard navigation
5. Test mobile responsiveness
6. Fix bugs
7. Update documentation

## Todo List

- [ ] Update route file (`$recordId.tsx`)
- [ ] Create `RecordDetailPage` component
- [ ] Integrate `getRouteApi()` for type-safe params
- [ ] Add auth guard with `beforeLoad`
- [ ] Add lazy loading with Suspense
- [ ] Create loading skeleton component
- [ ] Create error state component
- [ ] Create not-found state component
- [ ] Integrate `useRecordById` hook
- [ ] Handle encryption key management
- [ ] Show encryption key prompt if missing
- [ ] Integrate `useUpdateRecordField` for inline edits
- [ ] Integrate `useDeleteRecord` for delete action
- [ ] Fetch reference records
- [ ] Fetch user records
- [ ] Create `RecordHeader` component
- [ ] Add breadcrumb navigation
- [ ] Integrate `RecordDetail` from core package
- [ ] Add action menu (edit, delete, duplicate, share)
- [ ] Implement keyboard shortcuts
- [ ] Create shortcuts help dialog
- [ ] Add mobile optimizations
- [ ] Integrate `CommentsPanel`
- [ ] Connect to `useRecordComments` hook
- [ ] Add activity timeline
- [ ] Add related records section
- [ ] Add error boundaries
- [ ] Add smooth animations
- [ ] Optimize performance (React.memo)
- [ ] Add accessibility attributes (ARIA)
- [ ] Test keyboard navigation
- [ ] Test mobile responsiveness
- [ ] Fix bugs
- [ ] Update documentation

## Success Criteria

- [ ] Route integration works with TanStack Router
- [ ] Record displays correctly with all fields
- [ ] Inline editing works with encryption
- [ ] Comments panel integrates smoothly
- [ ] Activity timeline displays events
- [ ] Related records display correctly
- [ ] Encryption key prompt works
- [ ] Loading states display correctly
- [ ] Error states show helpful messages
- [ ] Permission checks work correctly
- [ ] Keyboard shortcuts functional
- [ ] Mobile-responsive on all devices
- [ ] Dark mode fully supported
- [ ] Accessibility: WCAG 2.1 AA
- [ ] Performance: <300ms page load
- [ ] No console errors or warnings

## Risk Assessment

| Risk                            | Likelihood | Impact | Mitigation                                 |
| ------------------------------- | ---------- | ------ | ------------------------------------------ |
| Route params type safety issues | Low        | Medium | Use `getRouteApi()` pattern                |
| Encryption key management bugs  | Medium     | High   | Thorough testing, clear error messages     |
| Permission checks incomplete    | Medium     | High   | Comprehensive permission matrix tests      |
| Performance issues on mobile    | Medium     | Medium | Code splitting, lazy loading, profiling    |
| Keyboard shortcuts conflicts    | Low        | Low    | Test with all browsers, document shortcuts |
| Comments panel layout breaks    | Low        | Medium | Responsive design, test all breakpoints    |

## Security Considerations

1. **Auth Guards:**
   - Check authentication in `beforeLoad`
   - Redirect to login if not authenticated
   - Validate workspace/table access

2. **Permission Enforcement:**
   - Check `permissions.access` before rendering record
   - Disable edit if no `permissions.update`
   - Hide delete if no `permissions.delete`
   - Check comment permissions separately

3. **Encryption Key:**
   - Never log or transmit key
   - Store in localStorage only
   - Clear on logout
   - Validate auth key before use

4. **XSS Prevention:**
   - Sanitize rich text fields
   - Escape user input in comments
   - Use CSP headers

## Next Steps

After Phase 3 completion:

1. E2E testing with Playwright
2. Accessibility audit
3. Performance profiling
4. Cross-browser testing
5. Begin Phase 4: Testing & Refinement

## Unresolved Questions

1. Should we prefetch related records on hover?
2. How to handle offline mode (service worker)?
3. Should we implement auto-save for inline edits?
4. How to handle long-running decryption (web workers)?
5. Should activity timeline be real-time (WebSocket)?
6. How to handle record versioning/history?
7. Should we cache decrypted records in memory?
