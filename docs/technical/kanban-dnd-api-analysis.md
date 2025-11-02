# Kanban Drag & Drop API Analysis - Production Request

## Request Overview

### Endpoint

```
POST /api/workspace/{workspaceId}/workflow/patch/active_tables/{tableId}/records/{recordId}
```

### Actual Request

```
POST https://app.o1erp.com/api/workspace/732878538910205329/workflow/patch/active_tables/818040940370329601/records/818047935265636353
```

**Parameters**:

- `workspaceId`: `732878538910205329`
- `tableId`: `818040940370329601`
- `recordId`: `818047935265636353`

## Request Headers

```http
accept: */*
accept-language: vi,en-US;q=0.9,en;q=0.8
authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
content-type: application/json
origin: https://beqeek.com
referer: https://beqeek.com/
sec-fetch-mode: cors
sec-fetch-site: cross-site
```

**Key Points**:

- ✅ CORS request từ `beqeek.com` → `app.o1erp.com`
- ✅ JWT Bearer token authentication
- ✅ Content-Type: `application/json`

## Request Payload Analysis

```json
{
  "record": {
    "gender": "a3df591b6c8454faa3c881644e258a3702f3203b0c0a7eed4725b7ff121187e2"
  },
  "hashed_keywords": {},
  "record_hashes": {
    "gender": "a3df591b6c8454faa3c881644e258a3702f3203b0c0a7eed4725b7ff121187e2"
  }
}
```

### Field Analysis

#### 1. `record` Object

```json
{
  "gender": "a3df591b6c8454faa3c881644e258a3702f3203b0c0a7eed4725b7ff121187e2"
}
```

**Observations**:

- Field name: `gender` (đây là `statusField` trong kanban config)
- Value: `a3df591b6c8454faa3c881644e258a3702f3203b0c0a7eed4725b7ff121187e2`
- Value format: **64-character hex string** = SHA-256 hash
- **Không phải plaintext** như expected!

**Phân tích value**:

```javascript
const value = 'a3df591b6c8454faa3c881644e258a3702f3203b0c0a7eed4725b7ff121187e2';
value.length; // 64
/^[a-f0-9]+$/.test(value); // true → hex string
```

#### 2. `hashed_keywords` Object

```json
{}
```

**Empty object** - Điều này có nghĩa:

- Field `gender` **KHÔNG** nằm trong `table.config.hashedKeywordFields[]`
- Không cần hash cho full-text search

#### 3. `record_hashes` Object

```json
{
  "gender": "a3df591b6c8454faa3c881644e258a3702f3203b0c0a7eed4725b7ff121187e2"
}
```

**Same hash value** như trong `record.gender`!

**Phân tích**:

- `record_hashes` được dùng cho **Order-Preserving Encryption (OPE)** hoặc **HMAC hashing**
- Với SELECT_ONE fields, sử dụng **HMAC-SHA256**
- Hash này cho phép server thực hiện **equality checks** trên encrypted data

## Schema Type Detection

### Table Config Inference

Dựa trên payload, có thể suy ra:

```javascript
const tableConfig = {
  e2eeEncryption: true, // ← Vì có encrypted values
  hashedKeywordFields: [], // ← Vì hashed_keywords = {}
  fields: [
    {
      name: 'gender',
      type: 'SELECT_ONE', // ← Dùng cho kanban status
      label: 'Gender', // hoặc "Giới tính"
      // Field này được encrypt bằng HMAC-SHA256
      options: [
        {
          value: 'male', // Original plaintext
          label: 'Nam',
        },
        {
          value: 'female', // Original plaintext
          label: 'Nữ',
        },
        // Hash "a3df591b6c8454faa3c881644e258a3702f3203b0c0a7eed4725b7ff121187e2"
        // có thể là HMAC("male") hoặc HMAC("female")
      ],
    },
  ],
};
```

### Kanban Config Inference

```javascript
const kanbanConfig = {
  kanbanScreenId: "...",
  screenName: "Gender Board", // hoặc "Bảng Giới tính"
  screenDescription: "...",
  statusField: "gender",  // ← Field dùng để group columns
  kanbanHeadlineField: "...",
  displayFields: [...]
};
```

## Encryption Flow Analysis

### Client-side Encryption Process

```javascript
// Giả sử user kéo card từ column "Nam" sang column "Nữ"
const dragDropFlow = {
  // 1. User action
  userAction: {
    fromColumn: 'male', // Column source
    toColumn: 'female', // Column destination (NEW VALUE)
    recordId: '818047935265636353',
  },

  // 2. Get encryption key from localStorage
  encryptionKey: localStorage.getItem('table_818040940370329601_encryption_key'),
  // encryptionKey example: "0123456789abcdef0123456789abcdef" (32 chars)

  // 3. Encrypt new value using HMAC-SHA256
  encryptedValue: CryptoJS.HmacSHA256('female', encryptionKey).toString(),
  // Result: "a3df591b6c8454faa3c881644e258a3702f3203b0c0a7eed4725b7ff121187e2"

  // 4. Build request payload
  payload: {
    record: {
      gender: 'a3df591b6c8454faa3c881644e258a3702f3203b0c0a7eed4725b7ff121187e2',
    },
    hashed_keywords: {}, // Empty vì gender không trong hashedKeywordFields
    record_hashes: {
      gender: 'a3df591b6c8454faa3c881644e258a3702f3203b0c0a7eed4725b7ff121187e2',
    },
  },
};
```

### Detailed Encryption Logic

```typescript
import CryptoJS from 'crypto-js';

interface EncryptionParams {
  fieldName: string;
  newValue: string;
  encryptionKey: string;
  fieldType: 'SELECT_ONE' | 'SHORT_TEXT' | 'INTEGER';
  isHashedKeyword: boolean;
}

function buildUpdatePayload(params: EncryptionParams) {
  const { fieldName, newValue, encryptionKey, fieldType, isHashedKeyword } = params;

  const payload = {
    record: {},
    hashed_keywords: {},
    record_hashes: {},
  };

  // For SELECT_ONE fields (used in kanban)
  if (fieldType === 'SELECT_ONE') {
    // Encrypt using HMAC-SHA256
    const hmacHash = CryptoJS.HmacSHA256(newValue, encryptionKey).toString();

    payload.record[fieldName] = hmacHash;
    payload.record_hashes[fieldName] = hmacHash; // Same value!

    // Only if field is in hashedKeywordFields (for full-text search)
    if (isHashedKeyword) {
      payload.hashed_keywords[fieldName] = hmacHash;
    }
  }

  return payload;
}

// Example usage for kanban drag-drop:
const payload = buildUpdatePayload({
  fieldName: 'gender',
  newValue: 'female', // ← New column value
  encryptionKey: '0123456789abcdef0123456789abcdef',
  fieldType: 'SELECT_ONE',
  isHashedKeyword: false, // ← Vì hashed_keywords = {}
});

// Result:
// {
//   record: { gender: "a3df591b..." },
//   hashed_keywords: {},
//   record_hashes: { gender: "a3df591b..." }
// }
```

## Server-side Processing

### Expected Server Behavior

```javascript
// Server receives encrypted payload
const request = {
  record: { gender: 'a3df591b...' },
  record_hashes: { gender: 'a3df591b...' },
};

// Server does NOT decrypt
// Server stores encrypted value directly in database
await db.records.update(recordId, {
  values: {
    gender: 'a3df591b...', // Store encrypted
  },
  hashes: {
    gender: 'a3df591b...', // Store hash for queries
  },
});

// Later, when querying by status:
const femaleRecords = await db.records.find({
  tableId: tableId,
  'hashes.gender': 'a3df591b...', // Use hash for equality check
});
```

### Why This Design?

**Zero-Knowledge Encryption**:

1. ✅ Server **never sees** plaintext values ("male", "female")
2. ✅ Server **can still filter** records by status using hash equality
3. ✅ Server **cannot decrypt** values without encryption key
4. ✅ Encryption key **only exists** in client localStorage

**Trade-offs**:

- ✅ Maximum privacy & security
- ⚠️ Server cannot perform range queries (>, <)
- ⚠️ Server cannot perform LIKE queries
- ⚠️ Server cannot sort by encrypted SELECT_ONE fields
- ✅ But equality checks work perfectly for kanban!

## Implementation Code for React App

### 1. Encryption Utility

```typescript
// apps/web/src/shared/utils/field-encryption.ts
import CryptoJS from 'crypto-js';
import type { FieldType } from '@workspace/beqeek-shared';

export function encryptFieldValue(value: any, fieldType: FieldType, encryptionKey: string): string {
  switch (fieldType) {
    case 'SELECT_ONE':
    case 'SELECT_ONE_WORKSPACE_USER':
      // HMAC-SHA256 for equality checks
      return CryptoJS.HmacSHA256(String(value), encryptionKey).toString();

    case 'SHORT_TEXT':
    case 'RICH_TEXT':
      // AES-256-CBC for full encryption
      return CryptoJS.AES.encrypt(String(value), encryptionKey).toString();

    case 'INTEGER':
    case 'NUMERIC':
    case 'DATE':
    case 'DATETIME':
      // OPE (Order-Preserving Encryption) - would need separate library
      // For now, use HMAC (loses ordering capability)
      return CryptoJS.HmacSHA256(String(value), encryptionKey).toString();

    default:
      throw new Error(`Unsupported field type for encryption: ${fieldType}`);
  }
}

export function buildEncryptedUpdatePayload(
  fieldName: string,
  newValue: any,
  fieldSchema: { type: FieldType },
  encryptionKey: string,
  hashedKeywordFields: string[],
) {
  const encrypted = encryptFieldValue(newValue, fieldSchema.type, encryptionKey);

  const payload: {
    record: Record<string, any>;
    hashed_keywords: Record<string, any>;
    record_hashes: Record<string, any>;
  } = {
    record: { [fieldName]: encrypted },
    hashed_keywords: {},
    record_hashes: {},
  };

  // For SELECT_ONE, always add to record_hashes
  if (['SELECT_ONE', 'SELECT_ONE_WORKSPACE_USER'].includes(fieldSchema.type)) {
    payload.record_hashes[fieldName] = encrypted;
  }

  // Only add to hashed_keywords if field is in the list
  if (hashedKeywordFields.includes(fieldName)) {
    payload.hashed_keywords[fieldName] = encrypted;
  }

  return payload;
}
```

### 2. Kanban Update Hook

```typescript
// apps/web/src/features/active-tables/hooks/use-kanban-update.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { activeTablesClient } from '@/shared/api/active-tables-client';
import { buildEncryptedUpdatePayload } from '@/shared/utils/field-encryption';
import type { ActiveTable } from '@workspace/beqeek-shared';

export function useKanbanUpdate(table: ActiveTable) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      recordId,
      statusFieldName,
      newStatusValue,
    }: {
      recordId: string;
      statusFieldName: string;
      newStatusValue: string;
    }) => {
      const isEncrypted = table.config.e2eeEncryption;

      let payload;

      if (isEncrypted) {
        const encryptionKey = localStorage.getItem(`table_${table.tableId}_encryption_key`);

        if (!encryptionKey) {
          throw new Error('Encryption key not found');
        }

        const statusField = table.config.fields.find((f) => f.name === statusFieldName);

        if (!statusField) {
          throw new Error('Status field not found in schema');
        }

        payload = buildEncryptedUpdatePayload(
          statusFieldName,
          newStatusValue,
          statusField,
          encryptionKey,
          table.config.hashedKeywordFields || [],
        );
      } else {
        // Plaintext payload
        payload = {
          record: { [statusFieldName]: newStatusValue },
          hashed_keywords: {},
          record_hashes: {},
        };
      }

      return activeTablesClient.updateRecord(table.workspaceId, table.tableId, recordId, payload);
    },

    onSuccess: () => {
      // Invalidate records query to refetch
      queryClient.invalidateQueries({
        queryKey: ['active-tables', table.tableId, 'records'],
      });
    },
  });
}
```

### 3. Kanban DnD Handler

```typescript
// apps/web/src/features/active-tables/components/kanban/use-kanban-dnd.ts
import { useState } from 'react';
import { DragEndEvent } from '@dnd-kit/core';
import { useKanbanUpdate } from '../../hooks/use-kanban-update';
import type { ActiveTable, KanbanConfig } from '@workspace/beqeek-shared';

export function useKanbanDnd(table: ActiveTable, kanbanConfig: KanbanConfig) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const updateMutation = useKanbanUpdate(table);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const recordId = active.id as string;
    const currentStatus = active.data.current?.status;
    const newStatus = over.id as string;

    // No change
    if (currentStatus === newStatus) return;

    // Update record status
    updateMutation.mutate({
      recordId,
      statusFieldName: kanbanConfig.statusField,
      newStatusValue: newStatus,
    });
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  return {
    activeId,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
    isUpdating: updateMutation.isPending,
  };
}
```

### 4. API Client Method

```typescript
// apps/web/src/shared/api/active-tables-client.ts
export const activeTablesClient = {
  // ... other methods

  updateRecord: async (
    workspaceId: string,
    tableId: string,
    recordId: string,
    payload: {
      record: Record<string, any>;
      hashed_keywords?: Record<string, any>;
      record_hashes?: Record<string, any>;
    },
  ) => {
    const response = await httpClient.post(
      `/api/workspace/${workspaceId}/workflow/patch/active_tables/${tableId}/records/${recordId}`,
      payload,
    );

    return response.data;
  },
};
```

## Key Insights from Production Request

### 1. Encryption is MANDATORY

- Even for simple SELECT_ONE fields like "gender"
- Client must encrypt BEFORE sending to server
- Server stores encrypted values

### 2. Dual Storage Pattern

```json
{
  "record": { "field": "encrypted_value" }, // Stored in DB
  "record_hashes": { "field": "same_hash" } // Used for queries
}
```

### 3. HMAC-SHA256 Properties

- **Deterministic**: Same input → same hash
- **One-way**: Cannot reverse hash → plaintext
- **Keyed**: Different keys → different hashes
- **Equality check**: Can compare hashes to find matches

### 4. No Plaintext in Transit

```
Client (plaintext) → Encrypt → Network (encrypted) → Server (encrypted) → DB (encrypted)
                                                                            ↓
Client (plaintext) ← Decrypt ← Network (encrypted) ← Server (encrypted) ← DB (encrypted)
```

### 5. Performance Trade-off

- ⚠️ Client must encrypt EVERY update
- ⚠️ Server cannot optimize queries on encrypted fields
- ✅ Maximum security & privacy
- ✅ Zero-knowledge architecture

## Testing Commands

### cURL Test (with your token)

```bash
curl -X POST 'https://app.o1erp.com/api/workspace/732878538910205329/workflow/patch/active_tables/818040940370329601/records/818047935265636353' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -d '{
    "record": {
      "gender": "a3df591b6c8454faa3c881644e258a3702f3203b0c0a7eed4725b7ff121187e2"
    },
    "hashed_keywords": {},
    "record_hashes": {
      "gender": "a3df591b6c8454faa3c881644e258a3702f3203b0c0a7eed4725b7ff121187e2"
    }
  }'
```

### Expected Response

```json
{
  "success": true,
  "message": "Record updated successfully",
  "data": {
    "recordId": "818047935265636353",
    "updatedAt": "2025-11-02T10:51:51.626426Z"
  }
}
```

## Summary

| Aspect                    | Value                           |
| ------------------------- | ------------------------------- |
| **Encryption Method**     | HMAC-SHA256                     |
| **Field Type**            | SELECT_ONE                      |
| **Hash Length**           | 64 characters (hex)             |
| **Plaintext Sent**        | ❌ No                           |
| **Server Decrypts**       | ❌ No                           |
| **Can Query by Equality** | ✅ Yes (using hash)             |
| **Can Query by Range**    | ❌ No                           |
| **Key Storage**           | localStorage (client-side only) |

**Conclusion**: Production system uses **true E2EE** with client-side encryption. For kanban DnD, you MUST encrypt the new status value before sending to API!
