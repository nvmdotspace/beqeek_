# Implementation Guide: Real API Integration for Active Tables

**Date**: 2025-11-01
**Purpose**: Bridge blade template (jQuery) API patterns to React/TypeScript with existing packages

---

## Prerequisites

Đọc trước:

- `/docs/api-integration-analysis.md` - API call flow patterns
- `/docs/technical/encryption-modes-corrected.md` - Encryption modes
- `/packages/active-tables-core/README-LIST-VIEWS.md` - List view components

---

## Architecture Overview

### Existing Package Structure

```
packages/
├── active-tables-core/          # React components + Zustand stores
│   ├── src/components/
│   │   ├── record-list/         # ✅ RecordList component (head-column, generic-table)
│   │   ├── kanban/              # ✅ KanbanBoard component
│   │   ├── gantt/               # ✅ GanttChartView component
│   │   └── fields/              # ✅ FieldRenderer component
│   ├── src/lib/
│   │   └── encryption.ts        # ✅ decryptRecords(), clearDecryptionCache()
│   └── src/types/               # ✅ TableRecord, TableConfig types
│
├── encryption-core/             # Core encryption utilities
│   └── src/
│       ├── aes.ts               # AES-256-CBC encryption/decryption
│       ├── ope.ts               # Order-Preserving Encryption
│       └── hmac.ts              # HMAC-SHA256 hashing
│
└── beqeek-shared/               # Shared types and validators
    └── src/types/
        └── active-tables.ts     # Shared type definitions
```

### Current Implementation Status

**✅ Already Implemented**:

- RecordList component (head-column + generic-table layouts)
- KanbanBoard component with drag-and-drop
- GanttChartView component with timeline
- FieldRenderer for all field types
- Encryption/decryption utilities
- Type definitions

**❌ Missing**:

- Real API integration (currently using mock data)
- Per-column pagination for Kanban
- Reference field resolution
- Workspace user resolution
- Full-text search with hashed keywords

---

## Step-by-Step Implementation

### Phase 1: Verify API Client (Already Done)

**File**: `apps/web/src/shared/api/active-tables-client.ts`

```typescript
// ✅ Already exists - verify it matches blade pattern
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

**✅ Verification**: Check that this matches blade template's `TableAPI.fetchRecords()` (lines 1616-1681)

---

### Phase 2: Disable Mock Data

**File**: `apps/web/src/features/active-tables/pages/active-table-records-page.tsx`

**Line 67**: Change from `true` to `false`

```typescript
// BEFORE:
const useMockData = true; // Toggle this to use real data

// AFTER:
const useMockData = false; // Use real API
```

**Line 84**: Update display records

```typescript
// BEFORE:
const displayRecords = useMockData ? mockRecords : decryptedRecords;

// AFTER:
const displayRecords = decryptedRecords; // Always use real data
```

**Remove or comment out mock data imports** (lines 28, 68-69):

```typescript
// import { generateMockTableConfig, generateMockRecords } from '../lib/mock-data';
// const mockTableConfig = useMemo(() => generateMockTableConfig(), []);
// const mockRecords = useMemo(() => generateMockRecords(12), []);
```

---

### Phase 3: Implement Encryption Integration

**Current implementation** (lines 86-155) already handles BOTH encryption modes correctly! ✅

**Key verification points**:

1. **Server-Side Encryption** (lines 104-107):

```typescript
else {
  // Server-side encryption mode: Key provided by server in config
  decryptionKey = table.config.encryptionKey ?? null;
}
```

2. **E2EE Mode** (lines 96-103):

```typescript
if (encryption.isE2EEEnabled) {
  // E2EE mode: Key from localStorage (user must input)
  if (!encryption.isKeyValid || !encryption.encryptionKey) {
    // No valid key - show encrypted data
    setDecryptedRecords(records);
    return;
  }
  decryptionKey = encryption.encryptionKey;
}
```

3. **Batch Decryption** (lines 119-126):

```typescript
const decrypted = await decryptRecords(
  records,
  table.config.fields ?? [],
  decryptionKey!,
  true, // useCache - enable LRU caching
  50, // batchSize - process 50 records at a time
);
```

**✅ This matches blade template pattern** (lines 1662-1669)

---

### Phase 4: Implement Reference Field Resolution

**Pattern from blade** (lines 4133-4140, 6629-6648):

```typescript
// Collect reference field requirements
const referenceFieldMap = RecordView.collectReferenceFieldMap(fields, records);
// Batch fetch reference records
const referenceRecords = await RecordView.fetchBatchReferenceRecords(referenceFieldMap);
```

**New implementation needed**:

**File**: `apps/web/src/features/active-tables/hooks/use-reference-records.ts`

```typescript
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchRecords } from '@/shared/api/active-tables-client';
import type { TableRecord, FieldConfig } from '@workspace/active-tables-core';

/**
 * Collect reference field requirements from records
 */
function collectReferenceFieldMap(
  fields: FieldConfig[],
  records: TableRecord[],
): Record<string, { recordIds: string[]; filtering: Record<string, any> }> {
  const referenceFields = fields.filter((f) =>
    ['SELECT_ONE_RECORD', 'SELECT_LIST_RECORD', 'FIRST_REFERENCE_RECORD'].includes(f.type),
  );

  const map: Record<string, { recordIds: Set<string>; filtering: Record<string, any> }> = {};

  referenceFields.forEach((field) => {
    if (!field.referenceTableId) return;

    if (!map[field.referenceTableId]) {
      map[field.referenceTableId] = {
        recordIds: new Set(),
        filtering: field.additionalCondition ? Object.fromEntries(new URLSearchParams(field.additionalCondition)) : {},
      };
    }

    records.forEach((record) => {
      const value = record.record[field.name];
      if (!value) return;

      if (field.type === 'FIRST_REFERENCE_RECORD') {
        // For FIRST_REFERENCE_RECORD, we need to fetch by referenceField
        // Will be handled in the fetch logic
      } else if (Array.isArray(value)) {
        value.forEach((id) => map[field.referenceTableId!].recordIds.add(id));
      } else {
        map[field.referenceTableId!].recordIds.add(value);
      }
    });
  });

  // Convert Set to Array
  return Object.fromEntries(
    Object.entries(map).map(([tableId, data]) => [
      tableId,
      { recordIds: Array.from(data.recordIds), filtering: data.filtering },
    ]),
  );
}

/**
 * Batch fetch reference records
 */
export function useReferenceRecords(
  workspaceId: string,
  fields: FieldConfig[],
  records: TableRecord[],
  enabled: boolean = true,
) {
  const referenceFieldMap = useMemo(() => collectReferenceFieldMap(fields, records), [fields, records]);

  const referenceTableIds = Object.keys(referenceFieldMap);

  const queries = useQuery({
    queryKey: ['reference-records', referenceTableIds, referenceFieldMap],
    queryFn: async () => {
      const results: Record<string, TableRecord[]> = {};

      await Promise.all(
        Object.entries(referenceFieldMap).map(async ([tableId, { recordIds, filtering }]) => {
          if (recordIds.length === 0) {
            results[tableId] = [];
            return;
          }

          const response = await fetchRecords(workspaceId, tableId, {
            paging: 'cursor',
            filtering: {
              id: recordIds.join(','), // Batch fetch by IDs
              ...filtering,
            },
            limit: 1000, // High limit for reference records
          });

          results[tableId] = response.data || [];
        }),
      );

      return results;
    },
    enabled: enabled && referenceTableIds.length > 0,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  return queries;
}
```

---

### Phase 5: Implement Workspace User Resolution

**Pattern from blade** (lines 4145-4150, 6630-6631):

```typescript
const userFieldMap = RecordView.collectReferenceUserFieldMap(fields, records);
const userRecords = await RecordView.fetchReferenceUserRecords(userFieldMap);
```

**New implementation needed**:

**File**: `apps/web/src/features/active-tables/hooks/use-workspace-users.ts`

```typescript
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { httpClient } from '@/shared/api/http-client';
import type { TableRecord, FieldConfig } from '@workspace/active-tables-core';

interface WorkspaceUser {
  id: string;
  fullName: string;
  email?: string;
}

/**
 * Collect user IDs from records
 */
function collectUserIds(fields: FieldConfig[], records: TableRecord[]): string[] {
  const userFields = fields.filter((f) => ['SELECT_ONE_WORKSPACE_USER', 'SELECT_LIST_WORKSPACE_USER'].includes(f.type));

  const userIds = new Set<string>();

  userFields.forEach((field) => {
    records.forEach((record) => {
      const value = record.record[field.name];
      if (!value) return;

      if (Array.isArray(value)) {
        value.forEach((id) => userIds.add(id));
      } else {
        userIds.add(value);
      }
    });
  });

  return Array.from(userIds);
}

/**
 * Fetch workspace users
 */
export function useWorkspaceUsers(
  workspaceId: string,
  fields: FieldConfig[],
  records: TableRecord[],
  enabled: boolean = true,
) {
  const userIds = useMemo(() => collectUserIds(fields, records), [fields, records]);

  const query = useQuery({
    queryKey: ['workspace-users', workspaceId, userIds],
    queryFn: async () => {
      if (userIds.length === 0) return {};

      const response = await httpClient.post(`/api/workspace/${workspaceId}/workspace/get/users`, {
        queries: {
          fields: 'id,fullName,email',
          filtering: {
            id: userIds.join(','),
          },
        },
      });

      // Convert array to object for easy lookup
      const users = response.data?.data || [];
      return users.reduce((acc: Record<string, WorkspaceUser>, user: WorkspaceUser) => {
        acc[user.id] = user;
        return acc;
      }, {});
    },
    enabled: enabled && userIds.length > 0,
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
  });

  return query;
}
```

---

### Phase 6: Update RecordList Integration

**File**: `apps/web/src/features/active-tables/pages/active-table-records-page.tsx`

**Add reference resolution** (around line 176):

```typescript
// Import new hooks
import { useReferenceRecords } from '../hooks/use-reference-records';
import { useWorkspaceUsers } from '../hooks/use-workspace-users';

// In component, after filteredRecords
const { data: referenceRecords = {}, isLoading: referencesLoading } = useReferenceRecords(
  workspaceId,
  displayTable.config?.fields || [],
  filteredRecords,
  !useMockData
);

const { data: workspaceUsers = {}, isLoading: usersLoading } = useWorkspaceUsers(
  workspaceId,
  displayTable.config?.fields || [],
  filteredRecords,
  !useMockData
);

// Update RecordList component (line 376-389)
<RecordList
  table={displayTable}
  records={filteredRecords}
  config={displayTable.config.recordListConfig}
  loading={referencesLoading || usersLoading}
  error={null}
  onRecordClick={handleViewRecord}
  referenceRecords={referenceRecords}      // ✅ Add this
  workspaceUsers={workspaceUsers}          // ✅ Add this
  messages={{
    loading: 'Loading records...',
    error: 'Failed to load records',
    noRecordsFound: 'No records found',
    noRecordsDescription: 'Try adjusting your filters or create a new record',
  }}
/>
```

---

### Phase 7: Implement Kanban Multi-Fetch Pattern

**Pattern from blade** (lines 6618-6653): **Parallel API calls - one per status**

**File**: `apps/web/src/features/active-tables/hooks/use-kanban-records.ts`

```typescript
import { useQuery } from '@tanstack/react-query';
import { fetchRecords } from '@/shared/api/active-tables-client';
import { decryptRecords } from '@workspace/active-tables-core';
import type { TableConfig, KanbanConfig, TableRecord } from '@workspace/active-tables-core';

interface KanbanColumnData {
  status: string;
  records: TableRecord[];
  nextId: string | null;
}

export function useKanbanRecords(
  workspaceId: string,
  tableId: string,
  table: { config: TableConfig } | null,
  kanbanConfig: KanbanConfig | null,
  filters: Record<string, any> = {},
  encryptionKey: string | null,
  enabled: boolean = true,
) {
  return useQuery({
    queryKey: ['kanban-records', tableId, kanbanConfig?.kanbanScreenId, filters],
    queryFn: async () => {
      if (!table || !kanbanConfig) return {};

      const statusField = table.config.fields.find((f) => f.name === kanbanConfig.statusField);

      if (!statusField || !['SELECT_ONE', 'SELECT_ONE_WORKSPACE_USER'].includes(statusField.type)) {
        throw new Error('Invalid status field for Kanban');
      }

      const statusOptions = statusField.options || [];

      // Parallel fetch - one API call per status
      const kanbanRecordsArray = await Promise.all(
        statusOptions.map(async (option) => {
          const response = await fetchRecords(workspaceId, tableId, {
            paging: 'cursor',
            filtering: {
              ...filters,
              record: {
                ...filters.record,
                [statusField.name]: option.value,
              },
            },
            direction: 'desc',
            limit: 50,
          });

          // Decrypt records
          const decrypted = encryptionKey
            ? await decryptRecords(response.data, table.config.fields, encryptionKey, true, 50)
            : response.data;

          return [
            option.value,
            {
              status: option.value,
              records: decrypted,
              nextId: response.next_id,
            } as KanbanColumnData,
          ];
        }),
      );

      return Object.fromEntries(kanbanRecordsArray);
    },
    enabled: enabled && !!table && !!kanbanConfig,
    staleTime: 1 * 60 * 1000, // Cache for 1 minute
  });
}
```

**Usage in page**:

```typescript
// In KanbanBoard tab
const { data: kanbanRecords = {}, isLoading: kanbanLoading } = useKanbanRecords(
  workspaceId,
  tableId,
  displayTable,
  kanbanConfig,
  currentFilters,
  encryptionKey,
  viewMode === 'kanban'
);

<KanbanBoard
  table={displayTable}
  records={kanbanRecords}  // Object with status as keys
  config={kanbanConfig}
  onRecordMove={handleRecordMove}
  onRecordClick={handleViewRecord}
  // ...
/>
```

---

### Phase 8: Implement Gantt Single-Fetch Pattern

**Pattern from blade** (lines 7068-7074): **Single large fetch**

**File**: `apps/web/src/features/active-tables/hooks/use-gantt-records.ts`

```typescript
import { useQuery } from '@tanstack/react-query';
import { fetchRecords } from '@/shared/api/active-tables-client';
import { decryptRecords } from '@workspace/active-tables-core';
import type { TableConfig, GanttConfig, TableRecord } from '@workspace/active-tables-core';

export function useGanttRecords(
  workspaceId: string,
  tableId: string,
  table: { config: TableConfig } | null,
  ganttConfig: GanttConfig | null,
  filters: Record<string, any> = {},
  encryptionKey: string | null,
  enabled: boolean = true,
) {
  return useQuery({
    queryKey: ['gantt-records', tableId, ganttConfig?.ganttScreenId, filters],
    queryFn: async () => {
      if (!table || !ganttConfig) return [];

      // Single large fetch - all records at once
      const response = await fetchRecords(workspaceId, tableId, {
        paging: 'cursor',
        filtering: filters,
        direction: 'asc',
        limit: 50000, // Very high limit
      });

      // Decrypt records
      const decrypted = encryptionKey
        ? await decryptRecords(response.data, table.config.fields, encryptionKey, true, 50)
        : response.data;

      // Transform to Gantt format
      return decrypted
        .map((record) => ({
          id: record.id,
          name: record.record[ganttConfig.taskNameField] || '-',
          start: record.record[ganttConfig.startDateField] || '',
          end: record.record[ganttConfig.endDateField] || '',
          progress: ganttConfig.progressField ? parseFloat(record.record[ganttConfig.progressField]) || 0 : 0,
          dependencies: ganttConfig.dependencyField ? record.record[ganttConfig.dependencyField] || '' : '',
        }))
        .filter((task) => task.start && task.end); // Filter invalid tasks
    },
    enabled: enabled && !!table && !!ganttConfig,
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes
  });
}
```

---

### Phase 9: Implement Full-Text Search

**Pattern from blade** (lines 4099-4105):

```typescript
// Hash keywords for encrypted search
if (query) {
  States.currentRecordFilters['fulltext'] = CommonUtils.hashKeyword(query, table.config.encryptionKey).join(' ');
}
```

**Implementation**:

**File**: `packages/encryption-core/src/hash-keyword.ts`

```typescript
import CryptoJS from 'crypto-js';

/**
 * Tokenize text (remove accents, lowercase, split by non-alphanumeric)
 */
function tokenize(text: string): string[] {
  return text
    .normalize('NFD') // Decompose Vietnamese diacritics
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .toLowerCase()
    .split(/\W+/) // Split by non-alphanumeric
    .filter(Boolean); // Remove empty strings
}

/**
 * Hash keywords using HMAC-SHA256
 */
export function hashKeyword(text: string, key: string): string[] {
  if (!text || typeof text !== 'string') return [];

  const tokens = tokenize(text);

  return tokens.map((token) => {
    try {
      return CryptoJS.HmacSHA256(token, key).toString(CryptoJS.enc.Hex);
    } catch (error) {
      console.error('Hashing error:', error);
      return token; // Fallback to original token
    }
  });
}
```

**Usage in page**:

```typescript
import { hashKeyword } from '@workspace/encryption-core';

// In search handler
const handleSearch = (query: string) => {
  if (query.trim()) {
    const hashedKeywords = hashKeyword(query, displayTable.config.encryptionKey || '').join(' ');

    setCurrentFilters({
      ...currentFilters,
      fulltext: hashedKeywords,
    });
  } else {
    setCurrentFilters({
      ...currentFilters,
      fulltext: '',
    });
  }
};
```

---

## Testing Checklist

### Phase 1: List Records

- [ ] Disable mock data (`useMockData = false`)
- [ ] Verify real API calls are made
- [ ] Check records display correctly
- [ ] Test encryption/decryption for both modes:
  - [ ] Server-side encryption (key from API)
  - [ ] E2EE (key from localStorage)
- [ ] Test pagination (Previous/Next buttons)
- [ ] Test search with hashed keywords
- [ ] Test reference field display
- [ ] Test workspace user field display

### Phase 2: Kanban

- [ ] Verify parallel API calls (one per status)
- [ ] Check records grouped by status
- [ ] Test per-column pagination ("Load More")
- [ ] Test drag-and-drop (triggers update mutation)
- [ ] Test reference field resolution
- [ ] Test workspace user resolution

### Phase 3: Gantt

- [ ] Verify single large fetch (limit: 50000)
- [ ] Check timeline rendering
- [ ] Test date range filtering
- [ ] Test task dependencies
- [ ] Test progress display

### Phase 4: Encryption

- [ ] Server-side: Key from `table.config.encryptionKey`
- [ ] E2EE: Key from localStorage
- [ ] E2EE: Show "Enter Key" modal when missing
- [ ] E2EE: Validate key with `encryptionAuthKey`
- [ ] Both modes: Decrypt correctly
- [ ] Cache: LRU cache works for performance

### Phase 5: Edge Cases

- [ ] Empty records
- [ ] Invalid encryption key
- [ ] Missing reference records
- [ ] Network errors
- [ ] Large datasets (1000+ records)

---

## Performance Optimizations

### 1. LRU Cache for Decryption

**Already implemented** in `packages/active-tables-core/src/lib/encryption.ts`:

```typescript
const decrypted = await decryptRecords(
  records,
  fields,
  encryptionKey,
  true, // ✅ useCache - LRU caching
  50, // ✅ batchSize - process 50 at a time
);
```

### 2. React Query Caching

**Stale times**:

- Reference records: 5 minutes
- Workspace users: 10 minutes
- Kanban records: 1 minute
- Gantt records: 2 minutes

### 3. Batch API Calls

**Kanban**: Parallel Promise.all (not sequential)
**References**: Batch by table ID
**Users**: Batch by user IDs (comma-separated)

---

## Error Handling

### API Errors

```typescript
try {
  const response = await fetchRecords(...);
  // ...
} catch (error) {
  console.error('Fetch Records Error:', error);
  toast.error('Failed to load records');
  return { records: [], nextId: null, previousId: null };
}
```

### Decryption Errors

```typescript
try {
  const decrypted = await decryptRecords(...);
  setDecryptedRecords(decrypted);
} catch (error) {
  console.error('Failed to decrypt records:', error);
  toast.error('Decryption failed. Please check your encryption key.');
  setDecryptedRecords(records); // Show encrypted data
}
```

### Missing Encryption Key (E2EE)

```typescript
if (encryption.isE2EEEnabled && !encryption.isKeyValid) {
  return (
    <Card className="border-yellow-500 bg-yellow-50">
      <CardContent className="p-4">
        <p className="text-sm text-yellow-800">
          Encryption key is required to view encrypted data.
          Please enter your encryption key.
        </p>
        <Button onClick={() => showEncryptionKeyModal()}>
          Enter Key
        </Button>
      </CardContent>
    </Card>
  );
}
```

---

## Migration Checklist

- [ ] **Phase 1**: Verify API client matches blade pattern
- [ ] **Phase 2**: Disable mock data
- [ ] **Phase 3**: Verify encryption integration
- [ ] **Phase 4**: Implement reference field resolution
- [ ] **Phase 5**: Implement workspace user resolution
- [ ] **Phase 6**: Update RecordList integration
- [ ] **Phase 7**: Implement Kanban multi-fetch
- [ ] **Phase 8**: Implement Gantt single-fetch
- [ ] **Phase 9**: Implement full-text search
- [ ] **Testing**: Run all test cases
- [ ] **Performance**: Verify caching works
- [ ] **Documentation**: Update API docs

---

## Next Steps

1. **Start with Phase 2** - Disable mock data and test with real API
2. **If working**: Proceed to Phase 4 (reference fields)
3. **If errors**: Check encryption key handling
4. **After List works**: Implement Kanban (Phase 7)
5. **After Kanban works**: Implement Gantt (Phase 8)
6. **Polish**: Add full-text search (Phase 9)

---

## Resources

- **API Patterns**: `/docs/api-integration-analysis.md`
- **Encryption Modes**: `/docs/technical/encryption-modes-corrected.md`
- **Component Docs**: `/packages/active-tables-core/README-LIST-VIEWS.md`
- **Blade Template**: `/docs/technical/html-module/active-table-records.blade.php`

---

**End of Guide**
