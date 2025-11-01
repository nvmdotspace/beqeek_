# API Integration Analysis: List Records, Kanban & Gantt Views

**Source**: `/docs/technical/html-module/active-table-records.blade.php` (Blade/jQuery implementation)

**Purpose**: Document API call patterns from the legacy implementation to guide React/TypeScript integration

---

## Table of Contents

1. [Core API Pattern](#core-api-pattern)
2. [List Records View](#list-records-view)
3. [Kanban View](#kanban-view)
4. [Gantt View](#gantt-view)
5. [Common Patterns](#common-patterns)
6. [React Implementation Guide](#react-implementation-guide)

---

## Core API Pattern

### TableAPI.fetchRecords() - Universal Record Fetcher

**Location**: Lines 3429-3494

**Endpoint**:

```
POST ${API_PREFIX}/get/active_tables/${tableId}/records
```

**Request Payload**:

```javascript
{
  paging: 'cursor',
  filtering: {
    // Field filters with encryption
    record: {
      'field_name': encryptedValue,
      'field_name:operator': encryptedValue
    },
    // Full-text search (hashed keywords)
    fulltext: 'hashed_keyword1 hashed_keyword2',
    // Direct filters
    id: 'record-id'
  },
  next_id: null | 'cursor-id',
  direction: 'asc' | 'desc',
  limit: 50
}
```

**Response**:

```javascript
{
  data: [
    {
      id: 'record-id',
      record: {
        field_name: 'encrypted_value',
        // ... other fields
      },
      permissions: {
        access: true,
        update: true,
        delete: true,
        custom_actionId: true
      },
      valueUpdatedAt: {
        field_name: '2025-11-01T10:30:00Z'
      },
      createdAt: '2025-11-01T10:00:00Z',
      updatedAt: '2025-11-01T10:30:00Z'
    }
  ],
  next_id: 'cursor-id' | null,
  previous_id: 'cursor-id' | null
}
```

**Encryption Flow**:

1. **Before API Call** (Client-side encryption):

   ```javascript
   // Encrypt filter values
   const encryptedFilters = Object.entries(filters.record).reduce((acc, [fieldName, value]) => {
     const field = table.config.fields.find((f) => f.name === fieldName);
     acc[fieldName] = CommonUtils.encryptTableData(table, fieldName, value);
     return acc;
   }, {});
   ```

2. **After API Call** (Client-side decryption):
   ```javascript
   // Decrypt all fields in each record
   const decryptedRecords = response.data.map((record) => {
     const decrypted = { ...record, record: { ...record.record } };
     fields.forEach((field) => {
       decrypted.record[field.name] = CommonUtils.decryptTableData(table, field.name, record.record[field.name]);
     });
     return decrypted;
   });
   ```

**Encryption Methods by Field Type**:

- **AES-256-CBC**: TEXT, RICH_TEXT, SHORT_TEXT, EMAIL, URL (random IV prepended)
- **OPE (Order-Preserving)**: INTEGER, NUMERIC, DATE, DATETIME, YEAR, MONTH, etc.
- **HMAC-SHA256**: SELECT_ONE, SELECT_LIST, CHECKBOX_YES_NO (for equality checks)

---

## List Records View

### RecordView Class

**Location**: Lines 4012-4358

**Render Flow**:

```javascript
RecordView.render(tableId, queryParams)
  ↓
RecordView.renderContent()
  ↓
RecordView.renderGenericTable() OR RecordView.renderHeadColumn()
  ↓
RecordView.fetchRecords(table, filters, currentPageId, direction, limit)
  ↓
TableAPI.fetchRecords() [Core API]
```

### Two Layout Modes

#### 1. Generic Table Layout (lines 4084-4223)

**Config**:

```javascript
{
  recordListConfig: {
    layout: 'generic-table',
    displayFields: ['field1', 'field2', 'field3']  // Fields to show in columns
  }
}
```

**API Call**:

```javascript
const response = await RecordView.fetchRecords(
  States.currentTable,
  States.currentRecordFilters, // { record: {}, fulltext: '' }
  currentPageId, // null or cursor
  direction, // 'asc' | 'desc'
  limit, // e.g., 50
);
```

**Pagination**: Cursor-based with "Previous" and "Next" buttons

**Search**: Full-text search with hashed keywords

```javascript
if (query) {
  States.currentRecordFilters['fulltext'] = CommonUtils.hashKeyword(query, table.config.encryptionKey).join(' ');
}
```

#### 2. Head-Column Layout (lines 4225-4358)

**Config**:

```javascript
{
  recordListConfig: {
    layout: 'head-column',
    titleField: 'task_title',           // Main headline
    subLineFields: ['assignee', 'status'], // Metadata below title
    tailFields: ['start_date', 'due_date'] // Bottom section fields
  }
}
```

**API Call**: Same as generic table

**Rendering**: Card-based layout with title + metadata + tail fields

---

## Kanban View

### KanbanView Class

**Location**: Lines 6336-6938

**Render Flow**:

```javascript
KanbanView.render(tableId, kanbanConfigId, queryParams)
  ↓
KanbanView.renderContent()
  ↓
KanbanView.renderKanbanBoard()
  ↓
FOR EACH status option:
  RecordView.fetchRecords(table, { ...filters, record: { status: option.value } })
  ↓
  TableAPI.fetchRecords() [Core API]
```

### Key Difference: Multiple API Calls

**Kanban Config**:

```javascript
{
  kanbanConfigs: [
    {
      kanbanScreenId: 'kanban-1',
      screenName: 'Task Progress Board',
      statusField: 'status', // Field to group by (must be SELECT_ONE)
      kanbanHeadlineField: 'task_title', // Card title
      displayFields: ['assignee', 'due_date', 'priority'], // Card metadata
    },
  ];
}
```

**API Calls** (lines 6618-6653):

```javascript
// Get status field options
const statusField = table.config.fields.find((f) => f.name === config.statusField);
const statusOptions = statusField.options; // [{ value: 'todo', text: 'To Do' }, ...]

// PARALLEL API calls - one per status
const kanbanRecords = Object.fromEntries(
  await Promise.all(
    statusOptions.map(async (option) => {
      const response = await RecordView.fetchRecords(
        States.currentTable,
        {
          ...States.currentRecordFilters,
          record: {
            ...States.currentRecordFilters.record,
            [statusField.name]: option.value, // Filter by status
          },
        },
        currentPageId,
        direction,
        limit, // e.g., 50 per column
      );

      return [
        option.value,
        {
          status: option.value,
          statusField: statusField.name,
          records: response.records,
          nextPageId: response.nextId,
          // ...reference data
        },
      ];
    }),
  ),
);
```

**Result**: Object with status values as keys

```javascript
{
  'todo': { records: [...], nextPageId: '...' },
  'in_progress': { records: [...], nextPageId: '...' },
  'done': { records: [...], nextPageId: null }
}
```

**Load More per Column** (lines 6869-6920):

```javascript
static async loadMore(status) {
  const kanbanRecord = kanbanRecords[status];

  const response = await RecordView.fetchRecords(
    States.currentTable,
    {
      ...States.currentRecordFilters,
      record: {
        ...States.currentRecordFilters.record,
        [kanbanRecord.statusField]: status
      }
    },
    kanbanRecord.nextPageId,  // Load next page for THIS column
    direction,
    limit
  );

  // Append to existing records for this status
  kanbanRecords[status].records = [...response.records];
  kanbanRecords[status].nextPageId = response.nextId;
}
```

**Drag-and-Drop Update** (lines 6815-6838):

```javascript
// When card is dropped to new status column
const data = {
  record: { [statusField]: newStatus },
};
await TableAPI.updateRecord(States.currentTable, recordId, data);
```

---

## Gantt View

### GanttView Class

**Location**: Lines 6940-7188

**Render Flow**:

```javascript
GanttView.render(tableId, ganttConfigId, queryParams)
  ↓
GanttView.renderContent()
  ↓
GanttView.renderGanttBoard()
  ↓
RecordView.fetchRecords(table, filters, currentPageId, direction, limit)
  ↓
TableAPI.fetchRecords() [Core API]
```

### Key Difference: Single Large Fetch

**Gantt Config**:

```javascript
{
  ganttCharts: [
    {
      ganttScreenId: 'gantt-1',
      screenName: 'Project Timeline',
      taskNameField: 'task_title', // Task name
      startDateField: 'start_date', // Start date (DATE/DATETIME)
      endDateField: 'due_date', // End date (DATE/DATETIME)
      progressField: 'progress', // Progress % (INTEGER/NUMERIC) [optional]
      dependencyField: 'dependencies', // Task dependencies (SELECT_LIST_RECORD) [optional]
    },
  ];
}
```

**API Call** (lines 7068-7074):

```javascript
// Single API call fetching ALL records
const response = await RecordView.fetchRecords(
  States.currentTable,
  States.currentRecordFilters,
  currentPageId,
  direction,
  50000, // Very high limit - fetch all records at once
);

const ganttRecords = response.records;
```

**Data Transformation** (lines 7090-7114):

```javascript
const ganttData = ganttRecords
  .map((record) => {
    let taskName = record.record[taskNameField.name] || '';
    let startDate = record.record[startDateField.name] || '';
    let endDate = record.record[endDateField.name] || '';
    let progress = progressField ? record.record[progressField.name] : null;
    let dependencies = dependencyField ? record.record[dependencyField.name] : null;

    // Resolve dependencies if using SELECT_LIST_RECORD
    if (dependencyField && ['SELECT_ONE_RECORD', 'SELECT_LIST_RECORD'].includes(dependencyField.type)) {
      const refRecords = referenceRecords[dependencyField.referenceTableId] || [];
      const ids = Array.isArray(dependencies) ? dependencies : [dependencies];
      dependencies = ids
        .map((id) => {
          const refRecord = refRecords.find((r) => r.id === id);
          return refRecord ? refRecord.id : id;
        })
        .filter(Boolean)
        .join(',');
    }

    return {
      id: record.id,
      name: taskName || '-',
      start: startDate,
      end: endDate,
      progress: progress ? parseFloat(progress) : 0,
      dependencies: dependencies || '',
    };
  })
  .filter((task) => task.start && task.end); // Filter out invalid tasks
```

**Rendering** (lines 7125-7167):

```javascript
// Uses Frappe Gantt library
const chartInstance = new Gantt(ganttContainer, ganttData, {
  view_mode: 'Day',
  language: 'vi',
  bar_height: 20,
  padding: 18,
  custom_popup_html: task => `...`,
  on_click: task => { ... },
  on_date_change: (task, start, end) => { ... },
  on_progress_change: (task, progress) => { ... }
});
```

---

## Common Patterns

### 1. Reference Field Resolution

All views fetch reference records for `SELECT_ONE_RECORD` and `SELECT_LIST_RECORD` fields:

```javascript
// Collect reference field requirements
const referenceFieldMap = RecordView.collectReferenceFieldMap(fields, records);
// Result: { tableId: { recordIds: [...], filtering: {...} } }

// Batch fetch reference records
const referenceRecords = await RecordView.fetchBatchReferenceRecords(referenceFieldMap);
// Result: { tableId: [record1, record2, ...] }

// Display reference labels
const refRecord = referenceRecords[field.referenceTableId].find((r) => r.id === value);
const displayValue = refRecord ? refRecord.record[field.referenceLabelField] : value;
```

### 2. Workspace User Resolution

For `SELECT_ONE_WORKSPACE_USER` and `SELECT_LIST_WORKSPACE_USER` fields:

```javascript
const userFieldMap = RecordView.collectReferenceUserFieldMap(fields, records);
const userRecords = await RecordView.fetchReferenceUserRecords(userFieldMap);
// Result: { userId: { id, fullName, ... }, ... }

const displayValue = userIds
  .map((id) => {
    const user = userRecords[id];
    return user ? user.fullName : id;
  })
  .join(', ');
```

### 3. Quick Filters

All views support quick filters (lines 5537-5594):

```javascript
// Render quick filter dropdowns based on table.config.quickFilters
const quickFilters = [{ fieldName: 'status' }, { fieldName: 'priority' }];

// Apply filter
RecordView.applyQuickFilter(fieldName, value);
// Updates: States.currentRecordFilters.record[fieldName] = value
// Then: Re-fetches records
```

### 4. Full-Text Search

Implemented with hashed keywords (lines 4099-4105, 4246-4252):

```javascript
const query = searchInput.value.toLowerCase();
if (query) {
  // Hash keywords for encrypted search
  States.currentRecordFilters['fulltext'] = CommonUtils.hashKeyword(query, table.config.encryptionKey).join(' ');
} else {
  States.currentRecordFilters.fulltext = '';
}
```

---

## React Implementation Guide

### Recommended Approach

Based on the blade template analysis, here's how to integrate real APIs in the React codebase:

#### 1. Update Active Tables API Client

**File**: `apps/web/src/shared/api/active-tables-client.ts`

```typescript
// Already exists - just ensure it matches the blade pattern
export async function fetchRecords(
  workspaceId: string,
  tableId: string,
  params: {
    paging?: 'cursor';
    filtering?: {
      record?: Record<string, any>;
      fulltext?: string;
      id?: string;
    };
    next_id?: string | null;
    direction?: 'asc' | 'desc';
    limit?: number;
  },
): Promise<{
  data: TableRecord[];
  next_id: string | null;
  previous_id: string | null;
}> {
  const response = await httpClient.post(
    `/api/workspace/${workspaceId}/workflow/get/active_tables/${tableId}/records`,
    {
      paging: params.paging || 'cursor',
      filtering: params.filtering || {},
      next_id: params.next_id || null,
      direction: params.direction || 'desc',
      limit: params.limit || 50,
    },
  );
  return response.data;
}
```

#### 2. Update Record List Page

**File**: `apps/web/src/features/active-tables/pages/active-table-records-page.tsx`

**Replace mock data logic**:

```typescript
// BEFORE (lines 66-84):
const useMockData = true;
const displayRecords = useMockData ? mockRecords : decryptedRecords;

// AFTER:
const useMockData = false; // Disable mock data
const displayRecords = decryptedRecords;

// Update useActiveTableRecordsWithConfig hook to use real API
// (Already implemented - just verify encryption/decryption flow)
```

#### 3. Implement Kanban API Integration

**Pattern from blade**: Fetch records PER STATUS COLUMN

```typescript
// In KanbanBoard component
const fetchKanbanRecords = async () => {
  const statusField = table.config.fields.find((f) => f.name === kanbanConfig.statusField);
  const statusOptions = statusField?.options || [];

  // Parallel fetch - one API call per status
  const kanbanRecordsMap = await Promise.all(
    statusOptions.map(async (option) => {
      const response = await fetchRecords(workspaceId, tableId, {
        paging: 'cursor',
        filtering: {
          ...currentFilters,
          record: {
            ...currentFilters.record,
            [statusField.name]: option.value,
          },
        },
        direction: 'desc',
        limit: 50,
      });

      // Decrypt records
      const decrypted = await decryptRecords(response.data, table.config.fields, encryptionKey, true, 50);

      return [
        option.value,
        {
          records: decrypted,
          nextId: response.next_id,
        },
      ];
    }),
  );

  return Object.fromEntries(kanbanRecordsMap);
};
```

#### 4. Implement Gantt API Integration

**Pattern from blade**: Single large fetch, then transform

```typescript
// In GanttChartView component
const fetchGanttRecords = async () => {
  const response = await fetchRecords(workspaceId, tableId, {
    paging: 'cursor',
    filtering: currentFilters,
    direction: 'asc',
    limit: 50000, // Fetch all records
  });

  // Decrypt records
  const decrypted = await decryptRecords(response.data, table.config.fields, encryptionKey, true, 50);

  // Transform to Gantt format
  return decrypted
    .map((record) => ({
      id: record.id,
      name: record.record[ganttConfig.taskNameField],
      start: record.record[ganttConfig.startDateField],
      end: record.record[ganttConfig.endDateField],
      progress: ganttConfig.progressField ? parseFloat(record.record[ganttConfig.progressField]) : 0,
      dependencies: ganttConfig.dependencyField ? record.record[ganttConfig.dependencyField] : '',
    }))
    .filter((task) => task.start && task.end);
};
```

#### 5. Handle Encryption/Decryption

**Already implemented in**: `packages/active-tables-core/src/lib/encryption.ts`

**Key functions**:

- `encryptRecordData()`: Encrypt before create/update
- `decryptRecords()`: Decrypt after fetch (batch with LRU cache)
- `clearDecryptionCache()`: Clear cache when table changes

**Usage pattern**:

```typescript
// Before API call (create/update)
const encryptedData = await encryptRecordData(recordData, table.config.fields, encryptionKey);

// After API call (fetch)
const decryptedRecords = await decryptRecords(
  records,
  table.config.fields,
  encryptionKey,
  true, // useCache
  50, // batchSize
);
```

---

## Key Takeaways

### List Records

- **Single API call** with cursor pagination
- **Two layouts**: generic-table (traditional table) vs head-column (card-based)
- **Full-text search** with hashed keywords
- **Quick filters** for common fields

### Kanban

- **Multiple parallel API calls** - one per status column
- **Per-column pagination** with "Load More" buttons
- **Drag-and-drop** triggers update mutation
- **Status field must be SELECT_ONE** type

### Gantt

- **Single large API call** (limit: 50000)
- **No pagination** - fetches all records at once
- **Data transformation** to Gantt library format
- **Supports task dependencies** via SELECT_LIST_RECORD

### Common Patterns

- **Encryption before send**, **decryption after receive**
- **Batch reference record fetching** for SELECT\_\*\_RECORD fields
- **Workspace user resolution** for SELECT\_\*\_WORKSPACE_USER fields
- **Cursor-based pagination** for all views
- **Quick filters and full-text search** across all views

---

## Migration Checklist

- [ ] Disable mock data in `active-table-records-page.tsx`
- [ ] Verify `useActiveTableRecordsWithConfig` hook uses real API
- [ ] Implement Kanban multi-fetch pattern with per-column pagination
- [ ] Implement Gantt single-fetch pattern with data transformation
- [ ] Test encryption/decryption flow end-to-end
- [ ] Verify reference field resolution works
- [ ] Implement drag-and-drop mutation for Kanban
- [ ] Add quick filter support to UI
- [ ] Test full-text search with hashed keywords
- [ ] Handle E2EE key validation and warnings

---

**End of Document**
