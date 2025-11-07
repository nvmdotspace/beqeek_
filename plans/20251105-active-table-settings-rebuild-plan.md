# Active Table Settings Screen Rebuild - Implementation Plan

**Date**: 2025-11-05
**Priority**: High
**Tech Stack**: React 19, TanStack Router, TanStack Query, Zustand, TailwindCSS v4, shadcn/ui
**Based on**: BA Documentation in `docs/BA/active-tables/settings/docs/`

---

## Executive Summary

This plan outlines the complete rebuild of the Active Table Settings screen (`/$locale/workspaces/$workspaceId/tables/$tableId/settings`) based on comprehensive business requirements documented in the BA folder. The implementation will follow React 19 best practices, utilize TanStack Query for server state, local state for UI interactions, and strictly adhere to the single PATCH API endpoint architecture.

**Key Insight from API Documentation**: The system uses **ONE PATCH endpoint** for ALL configuration updates. There are NO individual endpoints for fields, actions, permissions, etc. All changes accumulate in client-side state and are batch-saved when the user clicks the main "Save" button.

---

## 1. Business Requirements Analysis

### 1.1 Settings Sections Overview

Based on the BA documentation, the settings screen consists of **10 major sections**:

| Section                   | Document                                                       | Key Features                                                        | Complexity |
| ------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------- | ---------- |
| **1. General Config**     | `docs/BA/active-tables/settings/docs/01-general-config.md`     | Table ID, encryption key, record limit, default sort, search fields | Medium     |
| **2. Fields Config**      | `docs/BA/active-tables/settings/docs/02-fields-config.md`      | 26+ field types, CRUD operations, validation, E2EE support          | High       |
| **3. Actions Config**     | `docs/BA/active-tables/settings/docs/03-actions-config.md`     | Default actions (8 types), custom actions, UUID generation          | Medium     |
| **4. List View Config**   | `docs/BA/active-tables/settings/docs/04-listview-config.md`    | Generic table layout, head-column layout, field selection           | Medium     |
| **5. Quick Filters**      | `docs/BA/active-tables/settings/docs/05-quick-filters.md`      | Filter by SELECT, CHECKBOX, REFERENCE fields                        | Low        |
| **6. Detail Config**      | `docs/BA/active-tables/settings/docs/06-detail-config.md`      | Head detail layout, two-column layout, comments position            | Medium     |
| **7. Kanban Config**      | `docs/BA/active-tables/settings/docs/07-kanban-config.md`      | Multiple screens, status field, display fields                      | Medium     |
| **8. Gantt Config**       | `docs/BA/active-tables/settings/docs/08-gantt-config.md`       | Task scheduling, dependencies, progress tracking                    | Medium     |
| **9. Permissions Config** | `docs/BA/active-tables/settings/docs/09-permissions-config.md` | Team/role-based, granular permissions, time-based rules             | Very High  |
| **10. Danger Zone**       | `docs/BA/active-tables/settings/docs/10-danger-zone.md`        | Table deletion with confirmation                                    | Low        |

### 1.2 Field Types Supported (26+ Types)

**Text-based**:

- `SHORT_TEXT`, `TEXT`, `RICH_TEXT`, `EMAIL`, `URL`

**Date/Time**:

- `YEAR`, `MONTH`, `DAY`, `HOUR`, `MINUTE`, `SECOND`
- `DATE`, `DATETIME`, `TIME`

**Numeric**:

- `INTEGER`, `NUMERIC`

**Selection**:

- `CHECKBOX_YES_NO`, `CHECKBOX_ONE`, `CHECKBOX_LIST`
- `SELECT_ONE`, `SELECT_LIST`

**Reference**:

- `SELECT_ONE_RECORD`, `SELECT_LIST_RECORD`, `FIRST_REFERENCE_RECORD`

**User**:

- `SELECT_ONE_WORKSPACE_USER`, `SELECT_LIST_WORKSPACE_USER`

Check @package/beqeek-shared/

### 1.3 Critical Business Rules

1. **E2EE (End-to-End Encryption)**:
   - 32-char encryption key stored in localStorage (NEVER sent to server)
   - `encryptionAuthKey` (triple SHA256 hash) stored on server for verification
   - Supports AES-256-CBC (text), OPE (numbers/dates), HMAC-SHA256 (selects)

2. **Default Actions (Auto-generated)**:
   - 8 default actions: create, access, update, delete, comment_create, comment_access, comment_update, comment_delete
   - Custom actions can be added by users
   - Each action has a unique UUID v7 ID

3. **Permissions Model**:
   - Team + Role based (matrix structure)
   - Different permission types per action type
   - Time-based permissions (2h, 12h, 24h, 48h, 72h)
   - Self-created, assigned, team-based rules

4. **Validation Requirements**:
   - Table limit: 1-100,000 records
   - At least one search field required
   - Unique field names (no duplicates)
   - Kanban status field: only SELECT_ONE or SELECT_ONE_WORKSPACE_USER
   - Field dependencies (e.g., Gantt requires start/end date fields)

---

## 2. API Integration Architecture

### 2.1 The Single PATCH Endpoint Pattern

**CRITICAL**: According to `API-ENDPOINTS-ANALYSIS.md`, the system uses:

```
PATCH /api/workspace/{workspaceId}/workflow/patch/active_tables/{tableId}
```

**Key characteristics**:

- Single endpoint for ALL configuration updates
- POST method is used (even for PATCH operations)
- Full config object sent on each save
- Client-side state management with batch updates

### 2.2 Data Flow Pattern

```
┌─────────────────────────────────────────────────────────────┐
│                     USER INTERACTIONS                        │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              LOCAL STATE (useState/Zustand)                  │
│  - Fields array                                              │
│  - Actions array                                             │
│  - Quick filters array                                       │
│  - Kanban configs array                                      │
│  - Permissions config                                        │
│  - All other settings                                        │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ User clicks "Save"
                       ▼
┌─────────────────────────────────────────────────────────────┐
│           useUpdateTableConfig Hook (TanStack Query)         │
│  - Validates full config                                     │
│  - Handles E2EE key sanitization                             │
│  - Optimistic updates                                        │
│  - Error rollback                                            │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ Single PATCH call
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND API                               │
│  PATCH /api/workspace/{wId}/workflow/patch/active_tables/{id}│
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ Success
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              REACT QUERY CACHE INVALIDATION                  │
│  - ['active-table', workspaceId, tableId]                    │
│  - ['active-tables', workspaceId]                            │
└─────────────────────────────────────────────────────────────┘
```

### 2.3 Existing Hook Analysis

The project already has `/apps/web/src/features/active-tables/hooks/use-update-table-config.ts`:

**Strengths**:

- ✅ Proper TanStack Query mutation setup
- ✅ Optimistic updates with rollback on error
- ✅ Comprehensive validation (`validateTableConfig` function)
- ✅ E2EE key handling (sanitizes encryption key before sending)
- ✅ Query invalidation after success
- ✅ TypeScript type safety

**Key Features**:

- Validates table config before submission
- Checks field name uniqueness
- Validates kanban/gantt field dependencies
- Validates quick filter field existence
- Handles metadata updates (name, description, etc.)

**Usage Pattern**:

```typescript
const updateConfig = useUpdateTableConfig(workspaceId, tableId, table, {
  onSuccess: () => toast.success('Configuration updated'),
  onError: (error) => toast.error(error.message),
});

// Update entire config
updateConfig.mutate({
  config: { ...updatedConfig },
  metadata: { name: 'New Name' },
});
```

---

## 3. Component Architecture

### 3.1 Page Structure

```
ActiveTableSettingsPage (Main Container)
│
├── SettingsHeader (Table info, Save/Cancel buttons)
│
├── SettingsTabs (Tab navigation)
│   ├── GeneralTab
│   ├── FieldsTab
│   ├── ActionsTab
│   ├── ViewsTab (List, Detail, Kanban, Gantt)
│   ├── FiltersTab
│   ├── PermissionsTab
│   └── DangerZoneTab
│
└── UnsavedChangesPrompt (Block navigation if dirty)
```

### 3.2 State Management Strategy

**React Query (Server State)**:

- Table data fetching
- Mutation for updates
- Cache invalidation
- Optimistic updates

**Local State (useState - Per Section)**:

- Form inputs during editing
- Temporary field configurations
- Modal open/close states
- Field being edited (index)

**Global State (NOT NEEDED)**:

- Settings are route-specific, no global state required
- Use React Query cache for cross-component access

### 3.3 Component Breakdown by Section

#### 3.3.1 General Settings Component

**Path**: `apps/web/src/features/active-tables/components/settings/general-settings-section.tsx`

**Features**:

- Table ID display with copy button
- Encryption key input (password field)
- Table limit input (1-1000 validation)
- Default sort select (asc/desc)
- Hashed keyword fields multi-select (only text-based fields)

**State**:

```typescript
interface GeneralSettingsState {
  encryptionKey: string;
  tableLimit: number;
  defaultSort: 'asc' | 'desc';
  hashedKeywordFields: string[];
}
```

**Validation**:

- Table limit: must be between 1 and 1000
- Hashed keyword fields: at least one required
- Encryption key: optional, but if E2EE enabled, must be 32 chars

---

#### 3.3.2 Fields Settings Component

**Path**: `apps/web/src/features/active-tables/components/settings/fields-settings-section.tsx`

**Features**:

- List of all fields with edit/delete actions
- "Add Field" button opens modal
- Field type selector (26+ types)
- Dynamic form based on field type
- Options editor for SELECT/CHECKBOX types
- Reference table selector for REFERENCE types
- Auto-generate field `name` from `label`

**Components**:

- `FieldsList` - Main list view
- `FieldFormModal` - Add/edit modal
- `FieldTypeSelector` - Type dropdown
- `FieldOptionsEditor` - For SELECT/CHECKBOX fields
- `ReferenceFieldConfig` - For reference fields

**State**:

```typescript
interface FieldsState {
  fields: Field[];
  editingFieldIndex: number | null;
  isModalOpen: boolean;
  formData: Partial<Field>;
}
```

**Validation**:

- Field name: required, unique, no duplicates
- Field label: required
- Field type: required
- Options: required for SELECT/CHECKBOX (at least 1)
- Reference config: required for REFERENCE types
- FIRST_REFERENCE_RECORD: must have referenceField specified

**Complex Logic**:

- Auto-tokenize label → name (Vietnamese normalization)
- Load reference table fields when table selected
- Filter eligible reference fields for FIRST_REFERENCE_RECORD
- Validate field dependencies when deleting

---

#### 3.3.3 Actions Settings Component

**Path**: `apps/web/src/features/active-tables/components/settings/actions-settings-section.tsx`

**Features**:

- Auto-initialize 8 default actions
- Display only custom actions in UI
- Add custom action button
- UUID v7 generation for action IDs
- Copy action ID button
- Icon selector (Material Icons)

**Components**:

- `ActionsList` - Display custom actions only
- `ActionFormModal` - Add/edit custom actions

**State**:

```typescript
interface ActionsState {
  actions: Action[]; // Includes default + custom
  editingActionIndex: number | null;
  isModalOpen: boolean;
}
```

**Business Logic**:

- `initDefaultActions()`: Merge default actions with existing ones
- Preserve existing action IDs when re-initializing
- Only custom actions (type: 'custom') are editable/deletable
- Default actions are always present (type: 'default')

**Available Icons**:

- `play_arrow`, `send`, `check_circle`, `notifications`, `star`

---

#### 3.3.4 List View Settings Component

**Path**: `apps/web/src/features/active-tables/components/settings/listview-settings-section.tsx`

**Features**:

- Layout selector (generic-table vs head-column)
- Dynamic form based on layout
- Field multi-select for display fields

**Layouts**:

1. **Generic Table**: Multi-select for columns to display
2. **Head Column**: Title field + sub-line fields + tail fields

**State**:

```typescript
interface ListViewState {
  layout: 'generic-table' | 'head-column';
  displayFields?: string[]; // For generic-table
  titleField?: string; // For head-column
  subLineFields?: string[]; // For head-column
  tailFields?: string[]; // For head-column
}
```

---

#### 3.3.5 Quick Filters Component

**Path**: `apps/web/src/features/active-tables/components/settings/quick-filters-section.tsx`

**Features**:

- Add filter button (disabled if no eligible fields)
- List of filters with edit/delete
- Field selector (only CHECKBOX, SELECT, REFERENCE types)
- UUID v7 generation for filter IDs

**Eligible Field Types**:

- `CHECKBOX_YES_NO`
- `SELECT_ONE`, `SELECT_LIST`
- `SELECT_ONE_RECORD`, `SELECT_LIST_RECORD`
- `SELECT_ONE_WORKSPACE_USER`, `SELECT_LIST_WORKSPACE_USER`

**State**:

```typescript
interface QuickFilter {
  filterId: string; // UUID v7
  fieldName: string;
  fieldLabel?: string;
  fieldType?: string;
}
```

---

#### 3.3.6 Detail View Settings Component

**Path**: `apps/web/src/features/active-tables/components/settings/detail-settings-section.tsx`

**Features**:

- Layout selector (head-detail vs two-column-detail)
- Dynamic form based on layout
- Comments position selector (right-panel, bottom, hidden)

**Layouts**:

1. **Head Detail**: Title + sub-line + tail fields
2. **Two Column Detail**: Column 1 fields + Column 2 fields

**State**:

```typescript
interface DetailViewState {
  layout: 'head-detail' | 'two-column-detail';
  headTitleField: string;
  headSubLineFields: string[];
  rowTailFields?: string[]; // Head detail only
  column1Fields?: string[]; // Two column only
  column2Fields?: string[]; // Two column only
  commentsPosition: 'right-panel' | 'bottom' | 'hidden';
}
```

---

#### 3.3.7 Kanban Settings Component

**Path**: `apps/web/src/features/active-tables/components/settings/kanban-settings-section.tsx`

**Features**:

- Add kanban screen button
- List of kanban configs with edit/delete
- Screen name and description
- Status field selector (only SELECT_ONE, SELECT_ONE_WORKSPACE_USER)
- Headline field selector
- Display fields multi-select
- UUID v7 for screen IDs

**State**:

```typescript
interface KanbanConfig {
  kanbanScreenId: string; // UUID v7
  screenName: string;
  screenDescription?: string;
  statusField: string; // Must be SELECT_ONE or SELECT_ONE_WORKSPACE_USER
  kanbanHeadlineField: string;
  displayFields: string[];
}
```

**Validation**:

- Status field: required, must be SELECT_ONE or SELECT_ONE_WORKSPACE_USER
- Screen name: required
- Headline field: recommended but optional
- Multiple kanban configs allowed per table

---

#### 3.3.8 Gantt Settings Component (NOT IN DOCS - Reference Only)

**Note**: Gantt documentation (`08-gantt-config.md`) was listed but not read. Based on README, it should include:

- Task name field
- Start/end date fields
- Progress field (optional)
- Dependency field (optional)

---

#### 3.3.9 Permissions Settings Component

**Path**: `apps/web/src/features/active-tables/components/settings/permissions-settings-section.tsx`

**Features**:

- Fetch teams from workspace
- Fetch roles per team
- Matrix table: Team × Role × Actions
- Dynamic permission options per action type
- Different permissions for create, access, update, delete, comments

**Components**:

- `PermissionsTable` - Main table
- `PermissionSelect` - Dropdown per action
- `TeamRoleRow` - Row per team-role combination

**State**:

```typescript
interface PermissionConfig {
  teamId: string;
  roleId: string;
  actions: Array<{
    actionId: string;
    permission: PermissionType;
  }>;
}
```

**Permission Types by Action**:

**Create Actions**:

- `not_allowed`, `allowed`

**Access/Update/Delete/Custom Actions**:

- `not_allowed`, `all`, `self_created`, `self_created_2h`, `self_created_12h`, `self_created_24h`, `assigned_user`, `related_user`, `self_created_or_assigned`, `self_created_or_related`, `created_by_team`, `created_by_team_2h`, `created_by_team_12h`, `created_by_team_24h`, `created_by_team_48h`, `created_by_team_72h`, `assigned_team_member`, `related_team_member`, `created_or_assigned_team_member`, `created_or_related_team_member`

**Comment Create**:

- `not_allowed`, `allowed`, `self_created`, `assigned_user`, `related_user`

**Comment Access**:

- `not_allowed`, `all`, `comment_self_created`, `comment_self_created_or_tagged`, `comment_created_by_team`, `comment_created_or_tagged_team_member`

**Comment Update/Delete**:

- `not_allowed`, `all`, `comment_self_created`, `comment_self_created_2h`, `comment_self_created_12h`, `comment_self_created_24h`, `comment_created_by_team`, `comment_created_by_team_2h`, `comment_created_by_team_12h`, `comment_created_by_team_24h`

**API Calls**:

- `POST /api/workspace/{workspaceId}/workspace/get/p/teams`
- `POST /api/workspace/{workspaceId}/workspace/get/p/team_roles`

---

#### 3.3.10 Danger Zone Component

**Path**: `apps/web/src/features/active-tables/components/settings/danger-zone-section.tsx`

**Features**:

- Delete table button (prominent red styling)
- Confirmation modal with input verification
- List of consequences
- Loading state during deletion
- Navigate to tables list after success

**Components**:

- `DangerZoneSection` - Main container
- `DeleteTableModal` - Confirmation modal

**State**:

```typescript
interface DangerZoneState {
  showConfirmModal: boolean;
  confirmText: string;
  isDeleting: boolean;
}
```

**Validation**:

- User must type exact table name to confirm
- Button disabled until name matches
- Show loading spinner during deletion

**API Call**:

- `DELETE /api/workspace/{workspaceId}/workflow/delete/active_tables/{tableId}`

---

## 4. UI/UX Requirements

### 4.1 Design Principles

1. **Tabbed Navigation**: Use shadcn/ui Tabs component for section navigation
2. **Responsive Design**: Mobile-first approach with defined breakpoints
3. **Accessibility**: WCAG 2.1 AA compliance, keyboard navigation, screen reader support
4. **Vietnamese Typography**: Optimized font rendering for Vietnamese characters
5. **Dark Mode**: Support based on design system tokens
6. **Loading States**: Skeleton loaders for async operations
7. **Error Feedback**: Toast notifications for success/error states
8. **Unsaved Changes**: Prompt user before navigation if dirty

### 4.2 Component Library Usage

**shadcn/ui Components**:

- `Button` - All action buttons
- `Input`, `Textarea` - Form inputs
- `Select` - Dropdowns
- `Tabs`, `TabsList`, `TabsContent` - Section navigation
- `Dialog`, `DialogContent`, `DialogHeader` - Modals
- `Label` - Form labels
- `Badge` - Field type indicators
- `Card`, `CardHeader`, `CardContent` - Section containers
- `Separator` - Visual dividers
- `Skeleton` - Loading states
- `Alert`, `AlertDescription` - Warnings/errors
- `Tooltip` - Contextual help
- `ScrollArea` - Long lists

**react-select** (for multi-select):

- Already used in BA code
- Style to match design system

**Material Icons**:

- Icon font for action icons
- Consistent with BA code references

### 4.3 Form Patterns

**Inline Editing**:

- Fields list: Click to edit in modal
- Actions list: Click to edit in modal
- Permissions: Direct edit in table cells

**Modal Forms**:

- Add/Edit fields
- Add/Edit actions
- Add/Edit kanban screens
- Confirmation dialogs (delete, danger zone)

**Auto-save Indicators**:

- "Unsaved changes" badge in header
- Save/Cancel buttons always visible
- Dirty state tracking per section

---

## 5. Validation Strategy

### 5.1 Client-Side Validation

**General Settings**:

- Table limit: 1 ≤ n ≤ 100,000
- Hashed keyword fields: at least 1 required
- Encryption key: if E2EE, must be 32 chars

**Fields**:

- Name: required, unique, no duplicates
- Label: required
- Type: required
- Options: required for SELECT/CHECKBOX (at least 1 option)
- Reference config: required for REFERENCE types
- Field dependencies when deleting (check if used in kanban, gantt, filters, etc.)

**Actions**:

- Name: required
- Action ID: auto-generated UUID v7

**Kanban**:

- Screen name: required
- Status field: required, must be SELECT_ONE or SELECT_ONE_WORKSPACE_USER
- Status field must exist in fields list

**Permissions**:

- Each team-role combination must have permissions for all actions
- Permission values must be from allowed enum

**Danger Zone**:

- Confirm text must match table name exactly

### 5.2 Validation Hook

Create reusable validation utilities:

```typescript
// apps/web/src/features/active-tables/utils/validation.ts

export const validateTableConfig = (config: TableConfig): ValidationResult => {
  const errors: ValidationError[] = [];

  // Validate fields
  if (!config.fields || config.fields.length === 0) {
    errors.push({ field: 'fields', message: 'At least one field required' });
  }

  // Validate field uniqueness
  const fieldNames = new Set<string>();
  config.fields?.forEach((field, index) => {
    if (fieldNames.has(field.name)) {
      errors.push({ field: `fields.${index}.name`, message: 'Duplicate field name' });
    }
    fieldNames.add(field.name);
  });

  // Validate kanban configs
  config.kanbanConfigs?.forEach((kanban, index) => {
    const statusField = config.fields?.find((f) => f.name === kanban.statusField);
    if (!statusField) {
      errors.push({
        field: `kanbanConfigs.${index}.statusField`,
        message: 'Status field not found in fields list',
      });
    } else if (!['SELECT_ONE', 'SELECT_ONE_WORKSPACE_USER'].includes(statusField.type)) {
      errors.push({
        field: `kanbanConfigs.${index}.statusField`,
        message: 'Status field must be SELECT_ONE or SELECT_ONE_WORKSPACE_USER',
      });
    }
  });

  // ... more validations

  return {
    isValid: errors.length === 0,
    errors,
  };
};
```

---

## 6. E2EE Handling

### 6.1 Encryption Key Management

**Storage**:

- Encryption key stored in localStorage
- Never sent to API in plain form
- `encryptionAuthKey` (triple SHA256 hash) sent to server for verification

**Implementation**:

```typescript
// In useUpdateTableConfig hook (already exists)
const request: UpdateTableConfigRequest = {
  // ...
  config: {
    ...config,
    encryptionKey: config.e2eeEncryption ? '' : config.encryptionKey || '',
    encryptionAuthKey: config.encryptionAuthKey || '',
  },
};
```

**User Warnings**:

- Show warning when enabling E2EE
- Inform user to backup encryption key
- Warn about data loss if key is lost

### 6.2 Field-Level Encryption

When E2EE is enabled, certain fields are encrypted:

- AES-256-CBC: Text fields (SHORT_TEXT, TEXT, RICH_TEXT, EMAIL, URL)
- OPE: Numeric and date fields (allows range queries)
- HMAC-SHA256: Select fields (allows equality checks)

**UI Indicators**:

- Show lock icon for encrypted fields
- Display encryption type in field list
- Warning when adding/editing fields with E2EE enabled

---

## 7. Implementation Phases

### Phase 1: Foundation (Week 1)

**Tasks**:

1. Create main settings page layout
2. Implement tab navigation
3. Set up routing and params extraction
4. Create settings header with save/cancel
5. Implement unsaved changes detection
6. Set up React Query hooks for fetching table data
7. Integrate existing `useUpdateTableConfig` hook

**Deliverables**:

- `ActiveTableSettingsPage` component
- `SettingsHeader` component
- `SettingsTabs` component
- Route params integration with `getRouteApi()`
- Unsaved changes prompt

---

### Phase 2: General & Fields (Week 2)

**Tasks**:

1. Implement General Settings section
   - Table ID display with copy
   - Encryption key input
   - Table limit input with validation
   - Default sort selector
   - Hashed keyword fields multi-select
2. Implement Fields Settings section
   - Fields list view
   - Add/edit field modal
   - Field type selector
   - Options editor for SELECT/CHECKBOX
   - Reference config for REFERENCE types
   - Auto-generate field name from label
   - Field deletion with dependency check

**Deliverables**:

- `GeneralSettingsSection` component
- `FieldsSettingsSection` component
- `FieldFormModal` component
- `FieldTypeSelector` component
- `FieldOptionsEditor` component
- `ReferenceFieldConfig` component

---

### Phase 3: Actions & Views (Week 3)

**Tasks**:

1. Implement Actions Settings section
   - Default actions initialization
   - Custom actions CRUD
   - UUID v7 generation
   - Icon selector
2. Implement List View Settings
   - Layout selector
   - Dynamic form based on layout
3. Implement Detail View Settings
   - Layout selector
   - Comments position selector

**Deliverables**:

- `ActionsSettingsSection` component
- `ActionFormModal` component
- `ListViewSettingsSection` component
- `DetailSettingsSection` component
- Default actions initialization logic

---

### Phase 4: Filters & Kanban (Week 4)

**Tasks**:

1. Implement Quick Filters section
   - Eligible fields filtering
   - Add/edit/delete filters
   - UUID v7 generation
2. Implement Kanban Settings section
   - Multiple screens support
   - Status field validation
   - Display fields configuration

**Deliverables**:

- `QuickFiltersSection` component
- `QuickFilterFormModal` component
- `KanbanSettingsSection` component
- `KanbanFormModal` component

---

### Phase 5: Permissions & Danger Zone (Week 5)

**Tasks**:

1. Implement Permissions Settings section
   - Fetch teams and roles
   - Permissions matrix table
   - Dynamic permission options per action type
   - Collect permissions on save
2. Implement Danger Zone section
   - Delete table button
   - Confirmation modal with input verification
   - API call and navigation

**Deliverables**:

- `PermissionsSettingsSection` component
- `PermissionsTable` component
- `PermissionSelect` component
- `DangerZoneSection` component
- `DeleteTableModal` component
- Teams/Roles API integration

---

### Phase 6: Integration & Testing (Week 6)

**Tasks**:

1. End-to-end integration testing
2. Validation testing for all sections
3. E2EE flow testing
4. Unsaved changes prompt testing
5. Error handling testing
6. Accessibility audit
7. Performance optimization
8. Documentation

**Deliverables**:

- Complete settings screen
- Test coverage report
- Accessibility compliance report
- Performance audit report
- User documentation

---

## 8. Technical Considerations

### 8.1 Performance Optimization

1. **Code Splitting**: Lazy load setting sections
2. **Virtualization**: Use `@tanstack/react-virtual` for long lists (fields, permissions)
3. **Memoization**: Use `useMemo` for expensive computations (filtered fields, permission options)
4. **Debouncing**: Debounce validation on text inputs
5. **Optimistic Updates**: Already implemented in `useUpdateTableConfig`

### 8.2 Error Handling

1. **API Errors**: Display toast notifications, rollback optimistic updates
2. **Validation Errors**: Inline error messages, prevent submission
3. **Network Errors**: Retry mechanism, offline indicator
4. **Conflict Resolution**: Handle concurrent edits (last-write-wins with warning)

### 8.3 Type Safety

**Leverage Existing Types**:

- `@workspace/active-tables-core` - Field, TableConfig types
- `@workspace/beqeek-shared` - FieldType, validators
- `@workspace/encryption-core` - E2EE utilities

**Create New Types**:

```typescript
// apps/web/src/features/active-tables/types/settings.ts

export interface SettingsTabId {
  id: 'general' | 'fields' | 'actions' | 'views' | 'filters' | 'permissions' | 'danger';
  label: string;
}

export interface UnsavedChanges {
  isDirty: boolean;
  sections: string[];
}

export interface ValidationError {
  field: string;
  message: string;
}
```

### 8.4 Accessibility

1. **Keyboard Navigation**: All interactive elements keyboard accessible
2. **Screen Readers**: ARIA labels, roles, live regions
3. **Focus Management**: Trap focus in modals, restore focus on close
4. **Color Contrast**: Meet WCAG AA standards (already in design system)
5. **Error Announcements**: Use ARIA live regions for validation errors

---

## 9. File Structure

```
apps/web/src/features/active-tables/
├── components/
│   └── settings/
│       ├── settings-header.tsx
│       ├── settings-tabs.tsx
│       ├── general-settings-section.tsx
│       ├── fields-settings-section/
│       │   ├── index.tsx
│       │   ├── fields-list.tsx
│       │   ├── field-form-modal.tsx
│       │   ├── field-type-selector.tsx
│       │   ├── field-options-editor.tsx
│       │   └── reference-field-config.tsx
│       ├── actions-settings-section/
│       │   ├── index.tsx
│       │   ├── actions-list.tsx
│       │   └── action-form-modal.tsx
│       ├── listview-settings-section.tsx
│       ├── detail-settings-section.tsx
│       ├── quick-filters-section/
│       │   ├── index.tsx
│       │   ├── filters-list.tsx
│       │   └── filter-form-modal.tsx
│       ├── kanban-settings-section/
│       │   ├── index.tsx
│       │   ├── kanban-configs-list.tsx
│       │   └── kanban-form-modal.tsx
│       ├── permissions-settings-section/
│       │   ├── index.tsx
│       │   ├── permissions-table.tsx
│       │   ├── permission-select.tsx
│       │   └── team-role-row.tsx
│       ├── danger-zone-section/
│       │   ├── index.tsx
│       │   └── delete-table-modal.tsx
│       └── unsaved-changes-prompt.tsx
├── hooks/
│   ├── use-update-table-config.ts (already exists)
│   ├── use-settings-state.ts (new)
│   ├── use-unsaved-changes.ts (new)
│   ├── use-teams-and-roles.ts (new)
│   └── index.ts
├── utils/
│   ├── validation.ts (new)
│   ├── field-utils.ts (new)
│   ├── permission-utils.ts (new)
│   └── uuid.ts (new - UUID v7 generation)
├── types/
│   └── settings.ts (new)
└── pages/
    └── active-table-settings-page.tsx (update)
```

---

## 10. Key Dependencies

**Existing**:

- `@tanstack/react-router` - Routing, params
- `@tanstack/react-query` - Server state
- `@workspace/ui` - shadcn/ui components
- `@workspace/active-tables-core` - Types, validation
- `@workspace/encryption-core` - E2EE utilities
- `react-select` - Multi-select

**New (if needed)**:

- `@tanstack/react-virtual` - Virtualization for long lists
- `react-hook-form` - Form management (optional, can use controlled components)
- `zod` - Schema validation (optional, manual validation is fine)

---

## 11. Testing Strategy

### 11.1 Unit Tests

**Test Files**:

- `*.test.tsx` for each component
- `*.test.ts` for utilities

**Coverage**:

- Component rendering
- User interactions (click, input, select)
- Validation logic
- State updates
- API integration (mocked)

**Tools**:

- Vitest
- React Testing Library
- MSW (Mock Service Worker) for API mocking

### 11.2 Integration Tests

**Scenarios**:

- Complete settings flow (fetch → edit → save)
- Cross-section dependencies (e.g., delete field used in kanban)
- Unsaved changes prompt
- E2EE enable/disable flow
- Permissions matrix population

### 11.3 E2E Tests

**Scenarios**:

- Add field → Save → Verify in records page
- Configure kanban → Navigate to kanban → Verify layout
- Set permissions → Login as different role → Verify access
- Delete table → Verify navigation and data removal

**Tools**:

- Playwright or Cypress

---

## 12. Migration from Existing Code

### 12.1 Existing Components Analysis

Current files in `apps/web/src/features/active-tables/components/settings/`:

- `general-settings-tab.tsx`
- `security-settings-tab.tsx`
- `fields-settings-tab.tsx`

**Action Items**:

1. Review existing components for reusable logic
2. Extract common patterns (form handling, validation)
3. Decide: refactor vs rebuild
   - **Recommendation**: Rebuild based on BA spec for consistency
   - Keep existing components as reference
4. Ensure backward compatibility with existing table configs

### 12.2 Data Migration Considerations

**Potential Issues**:

- Old configs might not have all new fields
- Default actions might need re-initialization
- Permission configs might need migration

**Solution**:

- Implement config migration logic in `useUpdateTableConfig`
- Handle missing fields with sensible defaults
- Run `initDefaultActions()` when loading table

---

## 13. Success Criteria

### 13.1 Functional Requirements

- [ ] All 10 settings sections fully implemented
- [ ] 26+ field types supported with proper validation
- [ ] Default actions auto-initialization working
- [ ] Kanban screens configurable
- [ ] Permissions matrix fully functional
- [ ] E2EE key handling secure and correct
- [ ] Danger zone with confirmation working
- [ ] Unsaved changes detection and prompt

### 13.2 Non-Functional Requirements

- [ ] Page load time < 2 seconds
- [ ] Settings save time < 1 second
- [ ] WCAG 2.1 AA accessibility compliance
- [ ] 100% TypeScript type coverage
- [ ] 80%+ test coverage
- [ ] Mobile responsive design
- [ ] Dark mode support
- [ ] Vietnamese typography optimized

### 13.3 User Experience

- [ ] Intuitive tab navigation
- [ ] Clear error messages
- [ ] Loading states for all async operations
- [ ] Smooth animations and transitions
- [ ] Keyboard navigation fully functional
- [ ] No layout shifts during loading
- [ ] Consistent with design system

---

## 14. Risks and Mitigation

### 14.1 Technical Risks

| Risk                                      | Impact | Probability | Mitigation                          |
| ----------------------------------------- | ------ | ----------- | ----------------------------------- |
| Performance issues with large field lists | High   | Medium      | Implement virtualization            |
| Complex permissions matrix hard to use    | High   | Medium      | Progressive disclosure, tooltips    |
| E2EE key management confusing             | High   | Low         | Clear UI warnings, documentation    |
| Cross-section dependencies hard to track  | Medium | High        | Comprehensive validation            |
| API changes breaking assumptions          | High   | Low         | Version API, backward compatibility |

### 14.2 Schedule Risks

| Risk                                | Impact | Mitigation                   |
| ----------------------------------- | ------ | ---------------------------- |
| Permissions complexity takes longer | High   | Allocate 2 weeks for Phase 5 |
| Fields section edge cases           | Medium | Thorough BA doc review       |
| Integration issues                  | Medium | Early integration testing    |

---

## 15. Next Steps

1. **Review & Approval**:
   - Review this plan with team
   - Confirm BA requirements alignment
   - Approve tech stack and architecture

2. **Setup**:
   - Create feature branch: `feature/active-tables-settings-rebuild`
   - Set up project board for tracking
   - Create skeleton components

3. **Phase 1 Kickoff**:
   - Implement main settings page layout
   - Set up tab navigation
   - Integrate existing hooks

4. **Daily Standup Topics**:
   - Section completion status
   - Blockers (especially BA clarifications)
   - Integration points coordination

---

## 16. TODO Checklist

**Pre-Implementation**:

- [ ] Review plan with Product Owner
- [ ] Confirm BA documentation is complete (missing Gantt details?)
- [ ] Set up feature branch
- [ ] Create GitHub project board

**Phase 1: Foundation**:

- [ ] Main settings page component
- [ ] Tab navigation
- [ ] Settings header
- [ ] Unsaved changes detection
- [ ] Route params integration

**Phase 2: General & Fields**:

- [ ] General settings section
- [ ] Fields list component
- [ ] Field form modal
- [ ] Field type selector
- [ ] Options editor
- [ ] Reference config

**Phase 3: Actions & Views**:

- [ ] Actions settings section
- [ ] List view settings
- [ ] Detail view settings

**Phase 4: Filters & Kanban**:

- [ ] Quick filters section
- [ ] Kanban settings section

**Phase 5: Permissions & Danger**:

- [ ] Permissions matrix
- [ ] Teams/roles API integration
- [ ] Danger zone section

**Phase 6: Testing & Polish**:

- [ ] Unit tests
- [ ] Integration tests
- [ ] E2E tests
- [ ] Accessibility audit
- [ ] Performance optimization
- [ ] Documentation

---

## 17. References

**BA Documentation**:

- `/docs/BA/active-tables/settings/docs/README.md` - Overview
- `/docs/BA/active-tables/settings/docs/01-general-config.md`
- `/docs/BA/active-tables/settings/docs/02-fields-config.md`
- `/docs/BA/active-tables/settings/docs/03-actions-config.md`
- `/docs/BA/active-tables/settings/docs/04-listview-config.md`
- `/docs/BA/active-tables/settings/docs/05-quick-filters.md`
- `/docs/BA/active-tables/settings/docs/06-detail-config.md`
- `/docs/BA/active-tables/settings/docs/07-kanban-config.md`
- `/docs/BA/active-tables/settings/docs/09-permissions-config.md`
- `/docs/BA/active-tables/settings/docs/10-danger-zone.md`
- `/docs/BA/active-tables/settings/docs/API-ENDPOINTS-ANALYSIS.md` - Critical
- `/docs/BA/active-tables/settings/docs/UPDATE-SUMMARY.md`

**Existing Code**:

- `/apps/web/src/features/active-tables/hooks/use-update-table-config.ts`
- `/apps/web/src/routes/$locale/workspaces/$workspaceId/tables/$tableId/settings.tsx`
- `/apps/web/src/features/active-tables/pages/active-table-settings-page.tsx`
- `/apps/web/src/shared/route-paths.ts` - Route constants
- `/CLAUDE.md` - Project conventions

**Design System**:

- `/docs/design-system.md` - UI/UX guidelines
- `@workspace/ui` - Component library

---

## 18. Glossary

**Terms**:

- **E2EE**: End-to-End Encryption
- **OPE**: Order-Preserving Encryption
- **HMAC**: Hash-based Message Authentication Code
- **UUID v7**: Time-ordered UUID (RFC 4122 variant 7)
- **BA**: Business Analyst
- **CRUD**: Create, Read, Update, Delete
- **TanStack Query**: React Query v5 (new branding)

**Field Types Abbreviations**:

- **SHORT_TEXT**: Short text field
- **RICH_TEXT**: Rich text editor field
- **SELECT_ONE**: Single select dropdown
- **SELECT_LIST**: Multi-select dropdown
- **SELECT_ONE_RECORD**: Reference to single record
- **SELECT_LIST_RECORD**: Reference to multiple records
- **FIRST_REFERENCE_RECORD**: First matching referenced record

---

**End of Implementation Plan**

_This plan should be treated as a living document and updated as requirements evolve or new technical challenges are discovered._
