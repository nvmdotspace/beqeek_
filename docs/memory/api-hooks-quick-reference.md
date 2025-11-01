# API Hooks Quick Reference

**Quick reference for Active Tables API hooks and patterns**

---

## 📦 Core Hooks

### `useActiveTableRecordsWithConfig`

**Purpose**: Load table config + records with guaranteed order

```typescript
const {
  table, // Table with config
  records, // Raw records from API
  nextId, // Pagination cursor
  previousId, // Previous page cursor
  isReady, // Both table & records loaded
  isLoading, // Any loading state
  refetchAll, // Refetch both
} = useActiveTableRecordsWithConfig(workspaceId, tableId, {
  paging: 'cursor',
  limit: 50,
  direction: 'desc',
});
```

**Location**: `apps/web/src/features/active-tables/hooks/use-active-tables.ts:134-185`

---

## 🔗 Reference Field Hooks

### `useReferenceFieldData`

**Purpose**: Resolve SELECT_ONE_RECORD and SELECT_LIST_RECORD

```typescript
const { data: referenceData } = useReferenceFieldData(
  workspaceId,
  records,
  table.config.fields,
  true, // enabled
);

// referenceData structure:
// {
//   'table-id-1': {
//     'record-id-1': { id, record, ... },
//     'record-id-2': { id, record, ... }
//   },
//   'table-id-2': { ... }
// }

// Get display value
const displayValue = getReferenceDisplayValue(
  field.referenceTableId,
  recordId,
  referenceData,
  'name', // display field
);
```

**Location**: `apps/web/src/features/active-tables/hooks/use-reference-fields.ts`

**Cache**: 5 minutes

---

## 👥 User Field Hooks

### `useWorkspaceUserData`

**Purpose**: Resolve SELECT_ONE_WORKSPACE_USER and SELECT_LIST_WORKSPACE_USER

```typescript
const { data: userData } = useWorkspaceUserData(
  workspaceId,
  records,
  table.config.fields,
  true, // enabled
);

// userData structure:
// {
//   'user-id-1': { id, email, name, avatar },
//   'user-id-2': { id, email, name, avatar }
// }

// Get display value
const userName = getUserDisplayValue(userId, userData, 'name+email');
const avatar = getUserAvatar(userId, userData);
```

**Location**: `apps/web/src/features/active-tables/hooks/use-workspace-users.ts`

**Cache**: 10 minutes

---

## 📊 Kanban Hooks

### `useKanbanRecords`

**Purpose**: Parallel multi-fetch (one API call per status)

```typescript
const { data: kanbanData } = useKanbanRecords(
  workspaceId,
  tableId,
  table,
  kanbanConfig,
  filters, // Additional filters (excluding status)
  encryptionKey,
  50, // limit per column
  true, // enabled
);

// kanbanData structure:
// {
//   'todo': {
//     status: 'todo',
//     records: [...],
//     nextId: '...',
//     previousId: null
//   },
//   'in_progress': { ... },
//   'done': { ... }
// }
```

**Location**: `apps/web/src/features/active-tables/hooks/use-kanban-records.ts`

**Pattern**: Parallel fetch using `Promise.all()`

**Cache**: 2 minutes

### `useKanbanColumnLoadMore`

**Purpose**: Load more records for a specific column

```typescript
const { data: moreData } = useKanbanColumnLoadMore(
  workspaceId,
  tableId,
  table,
  'status', // status field name
  'in_progress', // status value
  nextId, // cursor from column
  filters,
  encryptionKey,
  50,
);

// moreData structure:
// {
//   records: [...],
//   nextId: '...' | null
// }
```

---

## 📅 Gantt Hooks

### `useGanttRecords`

**Purpose**: Single large fetch for timeline view

```typescript
const { data: ganttData } = useGanttRecords(
  workspaceId,
  tableId,
  table,
  ganttConfig,
  filters,
  encryptionKey,
  true, // enabled
);

// ganttData structure:
// {
//   records: [...],  // Filtered + validated records
//   totalCount: 147,
//   hasMore: false
// }
```

**Location**: `apps/web/src/features/active-tables/hooks/use-gantt-records.ts`

**Pattern**: Single fetch with `limit: 50000`

**Validation**: Filters out records with invalid dates

**Cache**: 5 minutes

### Helper Functions

```typescript
// Parse date from record
const startDate = getGanttDateValue(record, 'start_date');
const endDate = getGanttDateValue(record, 'due_date');

// Get progress value (0-100)
const progress = getGanttProgressValue(record, 'progress');
```

---

## 🔍 Search Hooks

### `useFullTextSearch`

**Purpose**: Full-text search with encrypted keyword hashing

```typescript
const { data: searchResults } = useFullTextSearch(
  workspaceId,
  tableId,
  table,
  'project design', // search query
  encryptionKey,
  {}, // additional filters
  50, // limit
  true, // enabled
);

// searchResults structure:
// {
//   records: [...],
//   totalCount: 12,
//   nextId: '...',
//   query: 'project design'
// }
```

**Location**: `apps/web/src/features/active-tables/hooks/use-fulltext-search.ts`

**How It Works**:

1. Tokenizes query into keywords
2. Hashes each keyword using HMAC-SHA256 (if encrypted)
3. Sends hashed keywords to server
4. Server searches using hashed values
5. Client decrypts results

**Cache**: 30 seconds

### `useDebouncedFullTextSearch`

**Purpose**: Debounced search (prevents too many API calls)

```typescript
const { data: searchResults } = useDebouncedFullTextSearch(
  workspaceId,
  tableId,
  table,
  searchQuery,
  encryptionKey,
  300, // debounce ms
  {}, // filters
  50, // limit
);
```

**Minimum Query Length**: 2 characters

### `clientSideSearch`

**Purpose**: Fallback for client-side filtering

```typescript
const filtered = clientSideSearch(
  records,
  'search query',
  ['task_title', 'description'], // optional: fields to search
);
```

---

## 🔐 Encryption Patterns

### Server-Side Encryption

```typescript
// Key from server config
const encryptionKey = table.config.encryptionKey;

// Decrypt
const decrypted = await decryptRecords(
  records,
  table.config.fields,
  encryptionKey,
  true, // useCache
  50, // batchSize
);
```

### E2EE (End-to-End Encryption)

```typescript
// Key from localStorage
const { encryptionKey, isKeyValid } = useTableEncryption(workspaceId, tableId, table.config);

// Only decrypt if key is valid
if (isKeyValid && encryptionKey) {
  const decrypted = await decryptRecords(records, table.config.fields, encryptionKey, true, 50);
}
```

---

## 🎯 Common Patterns

### Pattern 1: List View with Pagination

```typescript
const { table, records, nextId, isReady } = useActiveTableRecordsWithConfig(workspaceId, tableId, {
  paging: 'cursor',
  limit: 50,
  direction: 'desc',
});

const encryption = useTableEncryption(workspaceId, tableId, table?.config);

const [decryptedRecords, setDecryptedRecords] = useState(records);

useEffect(() => {
  const decrypt = async () => {
    if (!isReady || !table?.config) return;

    const key = encryption.encryptionKey || table.config.encryptionKey;
    if (!key) {
      setDecryptedRecords(records);
      return;
    }

    const decrypted = await decryptRecords(records, table.config.fields, key, true, 50);
    setDecryptedRecords(decrypted);
  };

  decrypt();
}, [isReady, records, encryption.encryptionKey, table?.config]);
```

### Pattern 2: Kanban View with References

```typescript
const { table, isReady } = useActiveTable(workspaceId, tableId);
const encryption = useTableEncryption(workspaceId, tableId, table?.config);

const { data: kanbanData } = useKanbanRecords(
  workspaceId,
  tableId,
  table,
  kanbanConfig,
  {},
  encryption.encryptionKey || table?.config?.encryptionKey,
  50,
  isReady,
);

// Resolve references
const allRecords = Object.values(kanbanData || {}).flatMap((col) => col.records);
const { data: referenceData } = useReferenceFieldData(workspaceId, allRecords, table?.config?.fields || [], isReady);
```

### Pattern 3: Search with Debouncing

```typescript
const [searchQuery, setSearchQuery] = useState('');

const { data: searchResults, isLoading } = useDebouncedFullTextSearch(
  workspaceId,
  tableId,
  table,
  searchQuery,
  encryptionKey,
  300, // 300ms debounce
  {},
  50
);

// In UI
<Input
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
  placeholder="Search records..."
/>

{isLoading && <Spinner />}
{searchResults && <RecordList records={searchResults.records} />}
```

---

## ⚡ Performance Tips

1. **Enable Caching**: Always use `useCache: true` in `decryptRecords()`
2. **Batch Size**: Use 50-100 for batch size
3. **Stale Time**: Adjust based on data volatility
   - User data: 10 minutes
   - Reference data: 5 minutes
   - Search results: 30 seconds
   - Records: 2 minutes
4. **Debouncing**: Use 300ms for search inputs
5. **Pagination**: Load 50 records per page
6. **Kanban**: Parallel fetches are faster than sequential

---

## 🐛 Common Issues

### Issue 1: Records Load Before Table Config

**Solution**: Use `useActiveTableRecordsWithConfig()` instead of separate hooks

### Issue 2: Decryption Fails Silently

**Solution**: Check `isReady` and `table?.config` before decrypting

### Issue 3: Reference Fields Show IDs

**Solution**: Use `useReferenceFieldData()` and `getReferenceDisplayValue()`

### Issue 4: Search Returns No Results

**Solution**: Check encryption key is correct and keywords are hashed

### Issue 5: Kanban Columns Empty

**Solution**: Verify status field is `SELECT_ONE` type with options

---

## 📚 See Also

- **Implementation Summary**: `/docs/memory/api-integration-implementation-summary.md`
- **API Analysis**: `/docs/api-integration-analysis.md`
- **Implementation Guide**: `/docs/implementation-guide-real-api.md`
