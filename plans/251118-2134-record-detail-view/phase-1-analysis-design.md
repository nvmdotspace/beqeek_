# Phase 1: Analysis & Design

**Phase**: 1 of 4
**Duration**: 2-3 days
**Status**: ✅ Completed
**Completion Date**: 2025-11-18
**Dependencies**: None

## Context

Migrate record detail view from legacy Blade template to React. Blade template (`active-table-records.blade.php` starting line 2202) contains complex business logic for rendering 25+ field types, handling E2EE, managing permissions, and displaying related data. Must extract this logic and port to reusable React components in `@workspace/active-tables-core`.

## Overview

Deep-dive analysis of existing Blade implementation to understand:

- Field rendering patterns for each of 25+ field types
- E2EE encryption/decryption flow per field type
- Permission-based visibility rules
- Layout variants (head-detail, two-column-detail)
- Comments panel integration patterns
- Activity timeline data structure
- Related records display logic
- Inline editing triggers and validation

## Key Insights from Blade Analysis

### RecordView Class Structure (Line 2202+)

```javascript
class RecordView extends CommonStates {
  static currentStates = {
    currentTable: null,
    currentPageId: null,
    previousPageId: null,
    nextPageId: null,
    records: [],
    direction: null,
    limit: 5,
    quickEdit: {
      editingRecordId: null,
      editingFieldName: '',
    },
  };
}
```

**Insights:**

- Quick edit state: tracks single field being edited (inline editing)
- Pagination state: cursor-based with prev/next IDs
- Table config cached in state
- Direction: sort order (asc/desc)

### Field Rendering Patterns (Line 2366+)

```javascript
// Generic table rendering
displayFields.forEach((field) => {
  let displayValue = RecordBaseView.parseDisplayValue(
    field,
    record,
    referenceRecords,
    States.currentReferenceTableDetails,
    userRecords,
  );
  rowHtml += `<td class="editable" ondblclick="RecordView.openQuickEditForm('${record.id}', '${field.name}')">${displayValue}</td>`;
});
```

**Insights:**

- `parseDisplayValue()`: centralized field rendering function
- Double-click triggers inline edit (`openQuickEditForm`)
- Reference records fetched separately and passed to renderer
- User records (workspace users) also fetched separately

### Encryption Key Validation (Line 2355+)

```javascript
if (!encryptionKey) {
  tableHtml = `<p>Không thể tải dữ liệu. Bảng này chưa được thiết lập khoá mã hoá.</p>`;
} else if (encryptionAuthKey !== CommonUtils.hashKeyForAuth(encryptionKey)) {
  tableHtml = `<p>Không thể tải dữ liệu. Khoá mã hoá không hợp lệ.</p>`;
}
```

**Insights:**

- Two-step validation: key exists + auth hash matches
- Auth key stored on server (SHA-256 hash of encryption key)
- If invalid, show error message and block rendering
- Must implement similar validation in React

### Quick Edit Form Logic (Line 3500+)

```javascript
if (['SELECT_LIST', 'CHECKBOX_LIST'].includes(field.type)) {
  const checkboxes = document.getElementsByName('quick-edit-value');
  value = Array.from(checkboxes).filter(cb => cb.checked).map(cb => cb.value);
} else if (['SELECT_ONE_RECORD', 'SELECT_LIST_RECORD', ...].includes(field.type)) {
  const select = $('#quick-edit-value');
  value = field.type === 'SELECT_LIST_RECORD' ? select.val() || [] : select.val();
} else if (field.type === 'FIRST_REFERENCE_RECORD') {
  CommonUtils.showMessage(`Trường ${field.label} là chỉ đọc, không thể chỉnh sửa.`, false);
  return;
}
```

**Insights:**

- Multi-select fields: array of checked values
- Reference fields: Select2 integration
- Read-only fields: `FIRST_REFERENCE_RECORD` cannot be edited
- Validation: required fields checked before save
- Hashed keywords generated for searchable encrypted fields

### Reference Records Fetching (Line 3570+)

```javascript
static async fetchBatchReferenceRecords(tableIdMap, search = '', offset = 0, limit = 20) {
  for (const [tableId, { recordIds, filtering = {}, group }] of Object.entries(tableIdMap)) {
    // Build API params with filtering, search, group
    // Cache results by cacheKey: `${tableId}_${search}_${offset}_${limit}_${group}`
    const response = await TableAPI.fetchRecords(table, filtering, null, 'asc', limit);
    results[tableId] = (response.records || []).filter(rec => rec && rec.id != null);
  }
}
```

**Insights:**

- Batch fetching: multiple tables at once
- Caching mechanism to avoid redundant API calls
- Filter invalid records (null ID)
- Support search/filtering/grouping on reference tables

### Quick Filters (Line 3724+)

```javascript
quickFilterBar.innerHTML = quickFilters.map(filter => {
  const field = fields.find(f => f.name === filter.fieldName);
  if (field.type === 'CHECKBOX_YES_NO') {
    // Dropdown: Tất cả, Có, Không
  } else if (['SELECT_ONE', 'SELECT_LIST'].includes(field.type)) {
    // Dropdown with field options
  } else if (['SELECT_ONE_WORKSPACE_USER', ...].includes(field.type)) {
    // Select2 with user search
  }
});
```

**Insights:**

- Quick filters rendered dynamically based on config
- Different UI per field type (checkbox, select, user select)
- Select2 integration for searchable dropdowns
- Filters applied to `States.currentRecordFilters`

## Requirements

### Functional Requirements

1. **Record Detail Display**
   - Render all fields based on table schema
   - Support 25+ field types with correct formatting
   - Handle null/empty values gracefully
   - Display related records inline
   - Show created/updated metadata

2. **Layout Variants**
   - **Head-Detail**: Title field prominent, sub-line fields below, tail fields in grid
   - **Two-Column**: Head section + two-column field layout
   - **Comments Position**: Right panel (sidebar) or hidden
   - **Mobile-Responsive**: Single column on mobile, two-column on desktop

3. **Inline Editing**
   - Double-click field to enter edit mode
   - Single field editing at a time
   - Show appropriate input (text, select, date picker, etc.)
   - Validate before save
   - Permission checks before allowing edit
   - Save on Enter, cancel on Escape

4. **Comments Panel**
   - Display comments list with avatars
   - Create new comment with rich text editor
   - Edit/delete own comments (permission-based)
   - Tag users (@mention)
   - Show comment metadata (author, timestamp)

5. **Activity Timeline**
   - Show record history (created, updated, field changes)
   - Display who made changes and when
   - Group changes by date
   - Link to related records if changed

6. **E2EE Handling**
   - Decrypt record fields asynchronously
   - Show loading state during decryption
   - Handle decryption errors gracefully
   - Display encrypted badge if E2EE enabled
   - Encrypt field value before inline edit save

7. **Permission-Based UI**
   - Hide fields user cannot access
   - Disable edit for read-only fields
   - Hide delete button if no permission
   - Show permission badges (e.g., "Self-created only")

### Non-Functional Requirements

1. **Performance**
   - Initial render < 200ms
   - Decryption < 500ms for 50 fields
   - Inline edit response < 100ms
   - Smooth animations (60fps)

2. **Accessibility**
   - WCAG 2.1 AA compliance
   - Keyboard navigation (Tab, Enter, Escape)
   - Screen reader support (ARIA labels)
   - Focus indicators visible
   - Color contrast 4.5:1 minimum

3. **Design System Compliance**
   - Use CSS custom properties (no hardcoded colors)
   - Mobile-first responsive design
   - TailwindCSS v4 utilities
   - shadcn/ui components
   - Layout primitives (Box, Stack, Inline, Grid)
   - Vietnamese typography optimization

4. **Reusability**
   - API-agnostic components
   - Props-based configuration
   - No hard dependencies on web app code
   - Export from `@workspace/active-tables-core`

## Architecture

### Component Hierarchy

```
<RecordDetailPage>                      # apps/web (route integration)
  └─ <RecordDetail>                     # active-tables-core (reusable)
      ├─ <RecordDetailLayout>           # Layout wrapper
      │   ├─ <HeadDetailLayout>         # Layout variant 1
      │   └─ <TwoColumnDetailLayout>    # Layout variant 2
      ├─ <FieldDisplay>                 # Read-only field renderer
      │   ├─ <TextField>
      │   ├─ <NumberField>
      │   ├─ <DateField>
      │   ├─ <SelectField>
      │   ├─ <ReferenceField>
      │   └─ ...
      ├─ <InlineEditField>              # Inline editing wrapper
      │   └─ <FieldInput>               # Edit mode input
      ├─ <CommentsPanel>                # Comments sidebar
      │   ├─ <CommentsList>
      │   ├─ <CommentItem>
      │   └─ <CommentEditor>
      ├─ <ActivityTimeline>             # Record history
      │   └─ <TimelineItem>
      └─ <RelatedRecords>               # Related records section
          └─ <RelatedRecordCard>
```

### Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ RecordDetailPage (apps/web)                                      │
│  - Get route params (recordId, tableId, workspaceId)             │
│  - Fetch table config                                            │
│  - Fetch encryption key from localStorage                        │
│  - Call useRecordById hook                                       │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│ useRecordById Hook                                               │
│  - Fetch record from API                                         │
│  - Decrypt fields if E2EE enabled                                │
│  - Return decrypted record + loading/error state                 │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│ RecordDetail Component (active-tables-core)                      │
│  - Props: record, table config, permissions, onFieldChange       │
│  - Render layout based on config.recordDetailConfig.layout       │
│  - Pass fields to FieldDisplay/InlineEditField                   │
│  - Manage inline edit state (editingFieldName)                   │
└────────────────┬────────────────────────────────────────────────┘
                 │
      ┌──────────┴──────────┬──────────────────┬──────────────────┐
      ▼                     ▼                  ▼                  ▼
┌────────────┐  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐
│FieldDisplay│  │InlineEditField │  │ CommentsPanel  │  │ActivityTimeline│
│            │  │                │  │                │  │                │
│ - Render   │  │ - Edit mode    │  │ - Comments     │  │ - History      │
│   value    │  │ - Save/Cancel  │  │   CRUD         │  │   events       │
└────────────┘  └────────────────┘  └────────────────┘  └────────────────┘
```

### State Management Strategy

| State Type   | Tool        | Scope                               | Examples                             |
| ------------ | ----------- | ----------------------------------- | ------------------------------------ |
| Server State | React Query | Record data, comments, table config | `useRecordById`, `useRecordComments` |
| Global State | Zustand     | Encryption key, user preferences    | `useEncryptionStore`, `useViewStore` |
| Local State  | useState    | Inline edit mode, UI toggles        | `editingFieldName`, `showComments`   |

**Anti-patterns to avoid:**

- ❌ Storing server data in local state (causes stale data)
- ❌ Using Zustand for ephemeral UI state (overkill)
- ❌ Passing too many props down (use context if needed)

### Props Interface Design

```typescript
// RecordDetail component
interface RecordDetailProps {
  record: TableRecord; // Decrypted record data
  table: Table; // Table config with fields, permissions
  layout?: 'head-detail' | 'two-column'; // Layout variant
  commentsPosition?: 'right-panel' | 'hidden'; // Comments placement
  onFieldChange?: (fieldName: string, value: any) => Promise<void>; // Inline edit callback
  onDelete?: () => Promise<void>; // Delete record callback
  readOnly?: boolean; // Disable editing
  className?: string; // Custom styles
}

// FieldDisplay component
interface FieldDisplayProps {
  field: FieldConfig; // Field schema (type, label, options)
  value: any; // Field value (already decrypted)
  referenceRecords?: Record<string, TableRecord[]>; // Reference data cache
  userRecords?: Record<string, WorkspaceUser>; // User data cache
  onDoubleClick?: () => void; // Trigger inline edit
  editable?: boolean; // Show edit indicator
  className?: string;
}

// InlineEditField component
interface InlineEditFieldProps {
  field: FieldConfig;
  value: any;
  onSave: (value: any) => Promise<void>;
  onCancel: () => void;
  autoFocus?: boolean;
  className?: string;
}
```

## Related Code Files

### Existing Files to Leverage

1. **Hooks:**
   - `apps/web/src/features/active-tables/hooks/use-record-by-id.ts` - Record fetching + decryption
   - `apps/web/src/features/active-tables/hooks/use-record-comments.ts` - Comments CRUD
   - `apps/web/src/features/active-tables/hooks/use-update-record-field.ts` - Inline field update
   - `apps/web/src/features/active-tables/hooks/use-table-encryption.ts` - Encryption key management

2. **APIs:**
   - `apps/web/src/features/active-tables/api/active-records-api.ts` - Records API client
   - `apps/web/src/features/active-tables/api/active-comments-api.ts` - Comments API client

3. **Components:**
   - `apps/web/src/features/active-tables/components/comments-panel.tsx` - Comments UI (exists, reuse)
   - `apps/web/src/features/active-tables/components/comment-item.tsx` - Single comment display
   - `apps/web/src/features/active-tables/components/rich-comment-editor.tsx` - Comment editor

4. **Utilities:**
   - `packages/encryption-core/src/` - E2EE encryption/decryption
   - `packages/active-tables-core/src/utils/` - Field validation, formatting

5. **Constants:**
   - `packages/beqeek-shared/src/constants/field-types.ts` - Field type constants
   - `packages/beqeek-shared/src/constants/permissions.ts` - Permission constants
   - `packages/beqeek-shared/src/constants/layouts.ts` - Layout constants

### Files to Create

1. **Core Package (`packages/active-tables-core/src/components/record-detail/`)**
   - `record-detail.tsx` - Main component
   - `head-detail-layout.tsx` - Layout variant 1
   - `two-column-detail-layout.tsx` - Layout variant 2
   - `field-display.tsx` - Read-only field renderer
   - `inline-edit-field.tsx` - Inline editing wrapper
   - `activity-timeline.tsx` - Record history
   - `related-records.tsx` - Related records section
   - `index.ts` - Barrel export

2. **Hooks (`packages/active-tables-core/src/hooks/`)**
   - `use-record-detail.ts` - Detail view state management
   - `use-inline-edit.ts` - Inline editing logic
   - `use-field-display.ts` - Field rendering logic

3. **Store (`packages/active-tables-core/src/stores/`)**
   - `detail-view-store.ts` - Zustand store for UI state

4. **Web App (`apps/web/src/features/active-tables/`)**
   - `pages/record-detail-page.tsx` - Route-connected page component

5. **Route (`apps/web/src/routes/$locale/workspaces/$workspaceId/tables/$tableId/records/`)**
   - `$recordId.tsx` - Route file (update existing stub)

## Implementation Steps

### Step 1: Blade Template Deep Analysis (Day 1)

1. Read `active-table-records.blade.php` lines 2200-4000
2. Document `parseDisplayValue()` function logic
3. Extract field type rendering map (25+ types)
4. Document E2EE flow per field type
5. Map permission checks to UI elements
6. Document quick edit form patterns
7. Analyze reference records fetching logic

### Step 2: Design System Review (Day 1)

1. Review `docs/design-system.md` - Typography, colors, spacing
2. Review `docs/layout-primitives-guide.md` - Box, Stack, Inline, Grid
3. Review `docs/typography-components.md` - Heading, Text, Metric
4. Identify reusable UI components from `@workspace/ui`
5. Plan responsive breakpoints (mobile, tablet, desktop)
6. Design dark mode color mappings

### Step 3: Component Architecture Design (Day 2)

1. Design component hierarchy diagram
2. Define props interfaces (TypeScript)
3. Plan state management (local/server/global)
4. Design data flow diagrams
5. Identify reusable sub-components
6. Plan error handling strategy
7. Design loading states

### Step 4: UI/UX Wireframes (Day 2)

1. Sketch head-detail layout (mobile + desktop)
2. Sketch two-column layout (desktop only)
3. Design inline edit interactions (focus, save, cancel)
4. Design comments panel layouts
5. Design activity timeline UI
6. Design related records section
7. Design error/empty states
8. Design loading skeletons

### Step 5: Technical Specifications (Day 2-3)

1. Document API integration points
2. Define encryption handling flow
3. Document permission checking logic
4. Define inline edit validation rules
5. Plan performance optimizations
6. Document accessibility requirements
7. Define testing strategy

### Step 6: Field Rendering Mapping (Day 3)

Create mapping table for all 25+ field types:

| Field Type  | Display Component               | Edit Component             | Encryption | Notes         |
| ----------- | ------------------------------- | -------------------------- | ---------- | ------------- |
| SHORT_TEXT  | `<Text>`                        | `<Input>`                  | AES-256    | Max 255 chars |
| RICH_TEXT   | `<div dangerouslySetInnerHTML>` | `<RichTextEditor>`         | AES-256    | HTML content  |
| INTEGER     | `<Metric>`                      | `<Input type="number">`    | OPE        | No decimals   |
| NUMERIC     | `<Metric>`                      | `<Input>` with AutoNumeric | OPE        | 2 decimals    |
| DATE        | `<Text>` formatted              | `<DatePicker>`             | OPE        | ISO 8601      |
| SELECT_ONE  | `<Badge>` with color            | `<Select>`                 | HMAC       | Option value  |
| SELECT_LIST | Multiple `<Badge>`              | `<MultiSelect>`            | HMAC       | Array         |
| ...         | ...                             | ...                        | ...        | ...           |

### Step 7: Permission Matrix (Day 3)

Document permission checks per action:

| Action         | Permission Check                         | UI Impact                  |
| -------------- | ---------------------------------------- | -------------------------- |
| View record    | `permissions.access`                     | Show/hide entire record    |
| View field     | Field-level permissions                  | Show/hide specific field   |
| Edit field     | `permissions.update` + field permissions | Enable/disable inline edit |
| Delete record  | `permissions.delete`                     | Show/hide delete button    |
| Create comment | `permissions.comment_create`             | Show/hide comment editor   |
| Edit comment   | `permissions.comment_update`             | Show/hide edit button      |

## Todo List

- [x] Read and analyze Blade template (lines 2200-4000) ✅
- [x] Extract `parseDisplayValue()` function logic ✅
- [x] Document field rendering patterns for all 25+ types ✅
- [x] Map E2EE encryption types per field ✅
- [x] Review existing `RecordDetail` component (deleted) ✅
- [x] Review design system documentation ✅
- [x] Design component hierarchy diagram ✅
- [x] Define TypeScript props interfaces ✅
- [x] Plan state management strategy ✅
- [x] Create UI/UX wireframes (head-detail, two-column) ✅
- [x] Design inline edit interactions ✅
- [x] Design comments panel layout ✅
- [x] Design activity timeline UI ✅
- [x] Document API integration points ✅
- [x] Define encryption handling flow ✅
- [x] Create field rendering mapping table (25+ types) ✅
- [x] Create permission matrix ✅
- [x] Define accessibility requirements (WCAG 2.1 AA) ✅
- [x] Plan performance optimizations ✅
- [x] Define testing strategy ✅

## Success Criteria

- [x] Complete understanding of Blade template logic ✅
- [x] Field rendering map covers all 26 field types ✅
- [x] Component architecture diagram clear and complete ✅
- [x] Props interfaces fully typed in TypeScript ✅
- [x] State management strategy documented ✅
- [x] UI/UX wireframes created ✅
- [x] Encryption flow documented for all field types ✅
- [x] Permission checks mapped to UI elements ✅
- [x] Design system compliance verified ✅
- [x] Accessibility requirements defined (WCAG 2.1 AA) ✅
- [x] Performance targets defined ✅
- [x] Testing strategy documented ✅

## Deliverables

All deliverables completed and documented:

1. **Research Reports**:
   - `/docs/research/record-detail-legacy-analysis.md` - Blade template analysis
   - `/docs/research/251118-record-detail-design-patterns.md` - Design system patterns
   - `/docs/research/encryption-requirements-by-field-type.md` - E2EE specifications

2. **Design Documentation**:
   - `/docs/design/record-detail-view-design.md` - Complete UI/UX design specification

3. **Component Architecture**:
   - Component hierarchy diagrams
   - TypeScript props interfaces
   - State management strategy
   - Data flow diagrams

4. **Field Type Coverage**:
   - 26 field types mapped with encryption types
   - Field rendering patterns documented
   - Input component specifications

5. **Implementation Guidance**:
   - Responsive design specifications
   - Accessibility requirements (WCAG 2.1 AA)
   - Performance targets and optimizations
   - Testing strategy and checklist

## Risk Assessment

| Risk                               | Likelihood | Impact | Mitigation                                    |
| ---------------------------------- | ---------- | ------ | --------------------------------------------- |
| Blade logic too complex to extract | Medium     | High   | Incremental analysis, pair programming        |
| Field type coverage incomplete     | Low        | High   | Cross-reference with beqeek-shared constants  |
| Permission logic misunderstood     | Medium     | High   | Thorough permission matrix, test cases        |
| E2EE performance issues            | Medium     | Medium | Async decryption, web workers, loading states |
| Design system violations           | Low        | Medium | Regular design reviews, checklist             |
| Accessibility gaps                 | Low        | Medium | Early WCAG audit, keyboard testing            |

## Security Considerations

1. **E2EE Key Management**
   - Never log encryption keys
   - Store in localStorage only (never send to server)
   - Validate auth key before rendering
   - Clear key on logout

2. **Permission Enforcement**
   - Check permissions on server (primary)
   - UI permissions only hide/disable (not security)
   - Re-check on every mutation
   - Fail closed (default: no access)

3. **XSS Prevention**
   - Sanitize rich text field content
   - Use `dangerouslySetInnerHTML` carefully
   - Escape user input in comments
   - CSP headers enforced

4. **Data Leakage**
   - Don't render hidden fields in DOM
   - Don't include restricted data in API responses
   - Clear sensitive data on unmount
   - No console.log in production

## Next Steps

After Phase 1 completion:

1. Create detailed field rendering components
2. Implement core `RecordDetail` component
3. Build layout variants (head-detail, two-column)
4. Integrate with web app routing
5. Begin Phase 2: Core Package Implementation

## Unresolved Questions

1. How to handle file/attachment fields? (Scope: Phase 2?)
2. Should activity timeline be real-time (WebSocket) or polling?
3. How to handle very large records (100+ fields)?
4. Should inline edit support keyboard shortcuts (Cmd+K)?
5. How to handle related records with deep nesting (3+ levels)?
6. Should comments support file attachments?
7. How to handle optimistic updates for inline edits?
