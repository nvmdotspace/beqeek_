# Kanban Drag & Drop - API Payload Quick Reference

## TL;DR

Khi drag card từ column này sang column khác trong Kanban board, hệ thống gọi API PATCH để cập nhật field status của record với payload đã được **encrypt** và **hash**.

## API Endpoint

```
PATCH /api/workspace/{workspaceId}/workflow/patch/active_tables/{tableId}/records/{recordId}
```

## Payload Structure

```json
{
  "record": {
    "{fieldName}": "{encryptedValue}"
  },
  "hashed_keywords": {},
  "record_hashes": {
    "{fieldName}": "{hashedValue}"
  }
}
```

## Ví dụ thực tế

### Input

- Field: `matrix_quadrant` (type: `SELECT_ONE`)
- Value: `"done"`
- Encryption key: `my-secret-encryption-key-32char`

### Output Payload

```json
{
  "record": {
    "matrix_quadrant": "d96ba1768a0f22f6e67f1251b737dec232427c2dacd926694ad799fcf2dce018"
  },
  "hashed_keywords": {},
  "record_hashes": {
    "matrix_quadrant": "d96ba1768a0f22f6e67f1251b737dec232427c2dacd926694ad799fcf2dce018"
  }
}
```

## Luồng xử lý

```
1. User drops card → Extract recordId and newStatus
2. Validate: currentStatus !== newStatus
3. Prepare data: { record: { fieldName: newValue } }
4. Encrypt field value based on type
5. Hash all field values for indexing
6. API call with encrypted payload
7. Update UI or rollback on error
```

## Encryption Methods by Field Type

| Field Type        | Encryption  | record[field] | record_hashes[field] |
| ----------------- | ----------- | ------------- | -------------------- |
| SELECT_ONE        | HMAC-SHA256 | Hash          | Hash (same)          |
| SHORT_TEXT        | AES-256-CBC | Encrypted     | Hash (different)     |
| INTEGER           | OPE         | OPE encrypted | Hash (different)     |
| DATE              | OPE         | OPE encrypted | Hash (different)     |
| SELECT_ONE_RECORD | None        | Plain value   | Not present          |

## Code References

### Client-side (JavaScript)

```javascript
// 1. Drop event handler
column.addEventListener('drop', async e => {
    const recordId = e.dataTransfer.getData('text/plain');
    const newStatus = column.dataset.status;

    const data = {
        record: { [statusField]: newStatus },
        hashed_keywords: {}
    };

    await TableAPI.updateRecord(table, recordId, data);
});

// 2. Encryption
static async updateRecord(table, recordId, data) {
    const encryptedData = { ...data, record: { ...data.record } };

    // Encrypt fields
    fields.forEach(field => {
        encryptedData.record[field.name] =
            CommonUtils.encryptTableData(table, field.name, data.record[field.name]);
    });

    // Hash fields
    encryptedData.record_hashes =
        CommonUtils.hashRecordData(fields, data.record, encryptionKey);

    return await apiCall(endpoint, encryptedData);
}
```

### React Implementation (Equivalent)

```typescript
// In KanbanView component
const handleDrop = async (recordId: string, newStatus: string) => {
  const data = {
    record: { [statusField]: newStatus },
    hashed_keywords: {},
  };

  await updateRecord(tableId, recordId, data);
};

// In active-tables-client.ts
export async function updateRecord(tableId: string, recordId: string, data: UpdateRecordPayload) {
  const encryptedData = encryptRecordFields(data);

  return httpClient.patch(
    `/api/workspace/${workspaceId}/workflow/patch/active_tables/${tableId}/records/${recordId}`,
    encryptedData,
  );
}
```

## Key Security Points

1. **Encryption key**: Stored in localStorage, **never sent to server**
2. **Server validation**: Uses `encryptionAuthKey = SHA256³(key)`
3. **AES-256-CBC**: Random IV for each encryption
4. **HMAC-SHA256**: Deterministic hash for searching
5. **OPE**: Order-preserving for range queries

## Common Pitfalls

❌ **Don't**: Send encryption key to server

```javascript
// WRONG
const data = {
  record: { status: 'done' },
  encryptionKey: table.config.encryptionKey, // ❌ Never do this
};
```

✅ **Do**: Encrypt client-side, send encrypted data

```javascript
// CORRECT
const encryptedValue = encryptTableData(table, 'status', 'done');
const data = {
  record: { status: encryptedValue },
  record_hashes: { status: hashValue('done') },
};
```

❌ **Don't**: Use same value for encryption and hashing

```javascript
// WRONG (if field type is SHORT_TEXT)
record: { title: aesEncrypt("My Title") },
record_hashes: { title: aesEncrypt("My Title") } // ❌ Should be hash
```

✅ **Do**: Encrypt for storage, hash for indexing

```javascript
// CORRECT
record: { title: aesEncrypt("My Title") },
record_hashes: { title: hmacSha256("My Title") }
```

## Debugging Tips

### Check encryption key

```javascript
console.log('Has encryption key:', !!table.config.encryptionKey);
console.log('Key length:', table.config.encryptionKey?.length); // Should be 32
console.log('Auth key valid:', table.config.encryptionAuthKey === hashKeyForAuth(table.config.encryptionKey));
```

### Inspect payload before API call

```javascript
console.log('Original data:', data);
console.log('Encrypted data:', encryptedData);
console.log('Payload:', JSON.stringify(encryptedData, null, 2));
```

### Verify encryption reversibility

```javascript
// For AES-256-CBC (should decrypt to original)
const encrypted = encryptData('test', key);
const decrypted = decryptData(encrypted, key);
console.assert(decrypted === 'test');

// For HMAC-SHA256 (should be deterministic)
const hash1 = CryptoJS.HmacSHA256('test', key).toString(CryptoJS.enc.Hex);
const hash2 = CryptoJS.HmacSHA256('test', key).toString(CryptoJS.enc.Hex);
console.assert(hash1 === hash2);
```

## Testing API Call

### Using curl

```bash
curl 'https://app.o1erp.com/api/workspace/732878538910205325/workflow/patch/active_tables/806087624279195649/records/806164958264950785' \
  -X POST \
  -H 'Authorization: Bearer {token}' \
  -H 'Content-Type: application/json' \
  --data-raw '{
    "record": {
      "matrix_quadrant": "d96ba1768a0f22f6e67f1251b737dec232427c2dacd926694ad799fcf2dce018"
    },
    "hashed_keywords": {},
    "record_hashes": {
      "matrix_quadrant": "d96ba1768a0f22f6e67f1251b737dec232427c2dacd926694ad799fcf2dce018"
    }
  }'
```

### Using JavaScript fetch

```javascript
const response = await fetch(
  `${API_BASE_URL}/api/workspace/${workspaceId}/workflow/patch/active_tables/${tableId}/records/${recordId}`,
  {
    method: 'POST', // Note: POST method with PATCH endpoint
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      record: { matrix_quadrant: encryptedValue },
      hashed_keywords: {},
      record_hashes: { matrix_quadrant: hashedValue },
    }),
  },
);

const result = await response.json();
console.log('Update result:', result);
```

## Related Documentation

- 📖 [Full Analysis](./kanban-drag-drop-flow.md) - Chi tiết đầy đủ
- 🔐 [Encryption Core](../../packages/encryption-core/) - Implementation
- 🎨 [Active Tables Design](./active-tables-design.md) - Architecture
- 🔌 [API Specification](../swagger.yaml) - OpenAPI spec

---

**Quick Links**:

- Implementation: `docs/technical/html-module/active-table-records.blade.php` (line 5030+)
- React equivalent: `apps/web/src/features/active-tables/pages/active-table-records-page.tsx`
- API client: `apps/web/src/shared/api/active-tables-client.ts`
- Encryption utils: `packages/encryption-core/src/index.ts`
