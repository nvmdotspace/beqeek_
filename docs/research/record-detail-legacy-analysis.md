# Legacy Record Detail View Analysis

**Source**: `docs/html-module/active-table-records.blade.php` (Lines 2202+)
**Purpose**: Extract React migration patterns from legacy Blade/jQuery implementation
**Date**: 2025-11-18

---

## 1. RecordView Class Structure (Lines 2202-4088)

### State Management

```javascript
// Lines 2203-2218
static currentStates = {
  currentTable: null,
  currentPageId: null,
  previousPageId: null,
  nextPageId: null,
  records: [],
  direction: null,  // 'asc' | 'desc'
  limit: 5,
  quickEdit: {
    editingRecordId: null,
    editingFieldName: ''
  }
}
static referenceCache = {}  // Caches reference records by tableId
```

**React Migration**: Use Zustand store with:

- `currentTable` → React Query cache
- Pagination state → URL params + local state
- `quickEdit` → Modal state (local useState)
- `referenceCache` → React Query cache with stale time

---

## 2. Field Rendering Patterns (`parseDisplayValue`, Lines 2027-2091)

### Core Logic

```javascript
parseDisplayValue(field, record, referenceRecords, referenceTableDetails, userRecords);
```

### Field Type Rendering Map

| Field Type                     | Rendering Logic                                                               | Decryption       |
| ------------------------------ | ----------------------------------------------------------------------------- | ---------------- | ---- | ------------------------------- |
| **SELECT_ONE**                 | Find option, render badge with `text_color`/`background_color` (Line 2042)    | None             |
| **SELECT_LIST**                | Array of options, join with `, `                                              | None             |
| **SELECT_ONE_RECORD**          | Fetch from `referenceRecords[tableId]`, decrypt label field (Lines 2044-2058) | AES-256 on label |
| **SELECT_LIST_RECORD**         | Map IDs to decrypted labels, join `, `                                        | AES-256 on label |
| **FIRST_REFERENCE_RECORD**     | Find by `referenceField === record.id` (Lines 2059-2064)                      | AES-256 on label |
| **SELECT_ONE_WORKSPACE_USER**  | Map to `userRecords[id].fullName` (Lines 2065-2076)                           | None             |
| **SELECT_LIST_WORKSPACE_USER** | Array of userIds → fullNames, join `, `                                       | None             |
| **NUMERIC**                    | `formatNumber(val, ".", ",", 2)` (Line 2078)                                  | OPE              |
| **INTEGER**                    | `formatNumber(val, ".", ",", 0)` (Line 2080)                                  | OPE              |
| **RICH_TEXT**                  | `marked.parse(value)` (Line 2083)                                             | AES-256          |
| **CHECKBOX_YES_NO**            | `'Có'` / `'Không'` (Line 2085)                                                | None             |
| **Default**                    | `value                                                                        |                  | '-'` | AES-256 if in `encryptFields()` |

### Tooltip Pattern (Line 2088)

```javascript
// Show last updated timestamp if exists
`<span class="tooltip-wrapper">
  <span class="info-icon">i</span>
  <span class="tooltip">${record.valueUpdatedAt[field.name]}</span>
</span>`;
```

**React Migration**: Create `<FieldRenderer>` component with type switch, use `@workspace/encryption-core` for decryption.

---

## 3. E2EE Encryption Flow

### Encryption Key Validation (Lines 2355-2362, 2647-2658)

```javascript
const { encryptionKey, encryptionAuthKey } = table.config;

if (!encryptionKey) {
  // Show error: "Bảng chưa thiết lập khoá mã hoá"
}
if (encryptionAuthKey !== CommonUtils.hashKeyForAuth(encryptionKey)) {
  // Show error: "Khoá mã hoá không hợp lệ"
}
```

### Decryption by Field Type (`CommonUtils.decryptTableData`, Lines 699-728)

```javascript
// AES-256-CBC for text fields
if (encryptFields().includes(field.type)) {
  return decryptData(value, encryptionKey);
}

// OPE for numbers/dates (enables range queries)
if (opeEncryptFields().includes(field.type)) {
  OPEncryptor.ope = new OPEncryptor(encryptionKey);
  return OPEncryptor.ope.decrypt(value);
}

// HMAC-SHA256 for selects (hash-based, no decryption)
if (hashEncryptFields().includes(field.type)) {
  return value; // Cannot decrypt HMAC
}
```

### Encryption on Save (Lines 679-696)

```javascript
// AES-256
if (encryptFields().includes(field.type)) {
  return encryptData(value, encryptionKey);
}

// OPE
if (opeEncryptFields().includes(field.type)) {
  if (field.type === 'DATE') return OPEncryptor.ope.encryptStringDate(value);
  if (field.type === 'DATETIME') return OPEncryptor.ope.encryptStringDatetime(value);
  if (field.type === 'NUMERIC') return OPEncryptor.ope.encryptDecimal(value);
  return OPEncryptor.ope.encryptInt(value);
}

// HMAC for selects
if (hashEncryptFields().includes(field.type)) {
  if (Array.isArray(value)) {
    return value.map((v) => CryptoJS.HmacSHA256(v, encryptionKey).toString());
  }
  return CryptoJS.HmacSHA256(value, encryptionKey).toString();
}
```

**React Migration**: Use `@workspace/encryption-core` utilities, validate key on mount, show errors via toast.

---

## 4. Inline Editing (Quick Edit, Lines 3209-3478)

### Trigger Pattern (Line 2368)

```javascript
// Double-click on table cell
<td class="editable" ondblclick="RecordView.openQuickEditForm('${recordId}', '${fieldName}')">
```

### Quick Edit Form Workflow

1. **Fetch current record** (Line 3228)
2. **Render field-specific input** (Lines 3236-3280):
   - Text: `<input type="text">`
   - RICH_TEXT: `<textarea>` + SimpleMDE (Lines 2662-2672)
   - SELECT_ONE: `<select>` with options
   - SELECT_LIST: Checkboxes (Lines 3248-3251)
   - DATE/DATETIME: `<input>` + Flatpickr (Lines 3298-3306)
   - NUMERIC/INTEGER: AutoNumeric formatter (Lines 3307-3318)
   - SELECT_ONE_RECORD: Select2 with AJAX (Lines 3319-3399)
   - WORKSPACE_USER: Select2 with user search (Lines 3400-3444)
3. **Save on confirm** (Lines 3142-3195):
   - Validate required fields
   - Encrypt data per field type
   - Call `TableAPI.updateRecord()`
   - Refresh view

### Select2 AJAX Pattern (Lines 3324-3372)

```javascript
$select.select2({
  placeholder: 'Chọn bản ghi',
  ajax: {
    url: `${API_PREFIX}/get/active_tables/${field.referenceTableId}/records`,
    method: 'POST',
    data: (params) => ({
      filtering: {
        record: {
          ...additionalCondition,
          search: params.term,
        },
      },
      limit: 20,
      offset: (params.page - 1) * 20,
    }),
    processResults: (data) => ({
      results: data.data.map((rec) => ({
        id: rec.id,
        text: decryptTableData(refTableDetails, labelField, rec.record[labelField]),
      })),
    }),
  },
});
```

**React Migration**: Use TanStack Form + modal, replace Select2 with shadcn Combobox + React Query infinite scroll.

---

## 5. Reference Records Fetching (Lines 3921-4047)

### Step 1: Collect Reference Field Map (Lines 3921-3986)

```javascript
collectReferenceFieldMap(fields, records) {
  const referenceFieldMap = {};

  fields.forEach(field => {
    if (['SELECT_ONE_RECORD', 'SELECT_LIST_RECORD'].includes(field.type)) {
      const recordIds = records.flatMap(r => r.record[field.name]).filter(Boolean);

      referenceFieldMap[field.referenceTableId] = {
        tableId: field.referenceTableId,
        recordIds: [...new Set(recordIds)],
        referenceField: field.referenceField,
        filtering: parseAdditionalCondition(field.additionalCondition)
      };
    }

    if (field.type === 'FIRST_REFERENCE_RECORD') {
      // Add reverse lookup filter: referenceField:in [recordIds]
      referenceFieldMap[field.referenceTableId] = {
        tableId: field.referenceTableId,
        recordIds: [],
        filtering: {
          [`${field.referenceField}:in`]: records.map(r => r.id)
        }
      };
    }
  });

  return referenceFieldMap;
}
```

### Step 2: Batch Fetch (Lines 3570-3617)

```javascript
async fetchBatchReferenceRecords(tableIdMap) {
  const results = {};

  for (const [tableId, { recordIds, filtering }] of Object.entries(tableIdMap)) {
    const cacheKey = `${tableId}_${search}_${offset}_${limit}`;
    if (cache[cacheKey]) {
      results[tableId] = cache[cacheKey];
      continue;
    }

    const response = await TableAPI.fetchRecords(
      table,
      { record: filtering, 'id:in': recordIds },
      null,
      'asc',
      limit
    );

    results[tableId] = response.records.filter(rec => rec?.id != null);
    cache[cacheKey] = results[tableId];
  }

  return results; // { [tableId]: [records] }
}
```

### Step 3: User Records (Lines 4014-4047)

```javascript
async fetchReferenceUserRecords(userFieldMap) {
  const userIds = Object.values(userFieldMap).flatMap(m => m.userIds);

  const data = await fetchUsers(); // Workspace users API

  return data.data.reduce((acc, user) => {
    acc[user.id] = user;
    return acc;
  }, {}); // { [userId]: user }
}
```

**React Migration**: Use React Query `useQueries()` with batched fetching, cache by tableId + recordIds hash.

---

## 6. Permission Checking (Lines 2371-2396, 2488-2533)

### Action Menu Rendering

```javascript
// Filter actions by permissions
const displayActions = actions.filter(action =>
  ['custom', 'update', 'delete'].includes(action.type) &&
  record.permissions[action.type === 'custom' ? `custom_${action.actionId}` : action.type]
);

// Render action menu
${displayActions.map(action => `
  <button onclick="${
    action.type === 'update' ? `openRecordForm('edit', '${recordId}')` :
    action.type === 'delete' ? `deleteRecord('${recordId}')` :
    `triggerAction('${action.actionId}', '${recordId}')`
  }">
    ${action.icon ? `<span>${action.icon}</span>` : ''}
    ${action.name}
  </button>
`)}
```

**Permissions Object** (from API response):

```javascript
record.permissions = {
  access: true,
  update: true,
  delete: false,
  custom_approve: true,
  custom_reject: false,
};
```

**React Migration**: Use permission hook `useRecordPermissions(record)`, conditionally render actions.

---

## 7. Quick Filter Implementation (Lines 3725-3785)

### Filter Rendering by Field Type

```javascript
quickFilters.map(filter => {
  const field = fields.find(f => f.name === filter.fieldName);

  if (field.type === 'CHECKBOX_YES_NO') {
    return `<select onchange="applyQuickFilter('${field.name}', this.value)">
      <option value="">Tất cả</option>
      <option value="true">Có</option>
      <option value="false">Không</option>
    </select>`;
  }

  if (['SELECT_ONE', 'SELECT_LIST'].includes(field.type)) {
    return `<select>
      <option value="">Tất cả</option>
      ${field.options.map(opt => `<option value="${opt.value}">${opt.text}</option>`)}
    </select>`;
  }

  if (['SELECT_ONE_WORKSPACE_USER'].includes(field.type)) {
    const users = await fetchUsers();
    return `<select>
      ${users.map(u => `<option value="${u.id}">${u.fullName}</option>`)}
    </select>`;
  }

  // SELECT_ONE_RECORD: Empty for now (requires async load)
  return `<select><option value="">Tất cả</option></select>`;
});
```

### Apply Filter (Lines 3653-3669)

```javascript
applyQuickFilter(fieldName, value) {
  States.currentRecordFilters = {
    ...States.currentRecordFilters,
    record: {
      ...States.currentRecordFilters.record,
      [fieldName]: value
    }
  };

  // Update URL query params
  pushQuery({ filtering: currentRecordFilters });

  // Refetch records
  await filterRecords();
}
```

**React Migration**: Use URL params with TanStack Router search params, debounce filter changes.

---

## 8. Error Handling Patterns

### Encryption Key Errors (Lines 2355-2362)

```javascript
if (!encryptionKey) {
  return '<p>Bảng chưa được thiết lập khoá mã hoá.</p>';
}
if (encryptionAuthKey !== hashKeyForAuth(encryptionKey)) {
  return '<p>Khoá mã hoá không hợp lệ.</p>';
}
```

### API Errors (Lines 2250-2253, 3612-3616)

```javascript
try {
  const response = await TableAPI.fetchRecords(...);
} catch (error) {
  console.error('Error rendering records:', error);
  CommonUtils.showMessage('Không thể tải danh sách bản ghi', false);
}
```

### Invalid Reference Records (Lines 3353-3359)

```javascript
const validRecords = data.data.filter((rec) => {
  if (!rec || rec.id == null) {
    console.warn('Invalid record found:', rec);
    return false;
  }
  return true;
});
```

**React Migration**: Use React Query error boundaries, toast notifications, graceful degradation for missing refs.

---

## 9. React Migration Recommendations

### Component Hierarchy

```
RecordDetailPage
├── RecordDetailHeader (title, actions, encryption status)
├── RecordFieldList (layout: head-detail | two-column)
│   └── FieldRenderer[] (type-specific rendering + inline edit)
├── CommentsPanel (if commentsPosition === 'right-panel')
└── ActivityTimeline (valueUpdatedAt tooltips)
```

### State Management

- **Table Config**: React Query `useTableQuery(tableId)`
- **Record Data**: React Query `useRecordQuery(recordId)`
- **Reference Records**: React Query `useQueries()` batched
- **User Records**: React Query `useWorkspaceUsers()`
- **Quick Edit**: Zustand modal store or local state
- **Filters**: URL params via TanStack Router

### Key Hooks

```typescript
useEncryption(table); // Validates key, provides encrypt/decrypt
useRecordPermissions(record); // Returns { canEdit, canDelete, customActions }
useReferenceRecords(tableId, recordIds); // Batched fetch with cache
useFieldRenderer(field, value); // Type-specific display logic
useInlineEdit(recordId, fieldName); // Quick edit modal
```

### Performance Optimizations

- **Lazy load reference records** only for visible fields
- **Cache reference table details** in React Query
- **Debounce quick filters** (300ms)
- **Virtual scrolling** for large record lists
- **Memoize field renderers** with `React.memo()`

### Security Checklist

- ✅ Validate encryption key on mount
- ✅ Never send `encryptionKey` to API
- ✅ Decrypt only on client-side
- ✅ Warn users about key backup
- ✅ Check permissions before rendering actions
- ✅ Sanitize RICH_TEXT with DOMPurify

---

## 10. Key Code Snippets for Reference

### Encryption Key Storage (Local Storage)

```javascript
// Save key (Line 3635)
await CommonUtils.saveKeyToLocalStorage(tableId, key);

// Retrieve key
const key = localStorage.getItem(`table_${tableId}_encryption_key`);
```

### Record Decryption Loop (Lines 1665-1672)

```javascript
const decryptedRecords = response.data.map((record) => {
  const decryptedRecord = { ...record };
  decryptedRecord.record = { ...record.record };

  fields.forEach((field) => {
    decryptedRecord.record[field.name] = CommonUtils.decryptTableData(table, field.name, record.record[field.name]);
  });

  return decryptedRecord;
});
```

### Permission-Based Action Filter (Line 2371)

```javascript
const displayActions = actions.filter(
  (action) =>
    ['custom', 'update', 'delete'].includes(action.type) &&
    record.permissions[action.type === 'custom' ? `custom_${action.actionId}` : action.type],
);
```

---

## Unresolved Questions

1. **Field validation**: Where is `field.required` validated before save? (Not found in quick edit flow)
2. **Optimistic updates**: Should inline edits update UI before API response?
3. **Conflict resolution**: What if record changes between fetch and save?
4. **Reference record pagination**: How to handle >20 reference records in Select2?
5. **RICH_TEXT security**: Does legacy code sanitize Markdown output? (Line 2083 uses `marked.parse` without sanitization)
6. **Cache invalidation**: When should `referenceCache` be cleared?
7. **FIRST_REFERENCE_RECORD**: How to edit readonly fields in full form mode?

---

**Report Path**: `/Users/macos/Workspace/buildinpublic/beqeek/docs/research/record-detail-legacy-analysis.md`
**Lines Analyzed**: ~3,000 (2202-5200)
**Next Steps**: Review existing React components in `packages/active-tables-core` for reusable patterns.
