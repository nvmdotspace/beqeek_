# Encryption Requirements by Field Type

**Date**: 2025-11-18
**Purpose**: Comprehensive mapping of encryption algorithms, implementation patterns, and security considerations for all 26 field types in Active Tables E2EE system.

---

## Encryption Algorithm Summary

| Algorithm       | Field Types               | Purpose         | Key Characteristics                                     |
| --------------- | ------------------------- | --------------- | ------------------------------------------------------- |
| **AES-256-CBC** | Text fields (5)           | Confidentiality | Random IV, full encryption, base64 encoded              |
| **OPE**         | Number/Date fields (11)   | Range queries   | Order-preserving, supports sorting/filtering            |
| **HMAC-SHA256** | Selection fields (5)      | Equality checks | One-way hash, option value matching                     |
| **NONE**        | Reference/User fields (5) | No encryption   | Data stored plain, referenced data encrypted separately |

---

## Field Type Encryption Matrix

### 1. Text Fields (AES-256-CBC)

#### SHORT_TEXT

- **Encryption**: AES-256-CBC with random IV
- **Format**: `base64(IV + ciphertext)`
- **Use Cases**: Titles, names, short descriptions
- **Implementation**: `CommonUtils.encryptTextField(value, encryptionKey)`
- **Decryption**: `CommonUtils.decryptTextField(encrypted, encryptionKey)`
- **Max Length**: 255 characters (plaintext)
- **Searchability**: Hashed keywords for search

#### TEXT

- **Encryption**: Same as SHORT_TEXT
- **Use Cases**: Long descriptions, notes, multiline text
- **Max Length**: Unlimited
- **Special**: Newlines preserved in encryption

#### RICH_TEXT

- **Encryption**: AES-256-CBC (HTML content encrypted)
- **Use Cases**: Formatted content, Markdown, HTML
- **Sanitization**: Required before encryption (DOMPurify)
- **Decryption**: Returns HTML string
- **Display**: `dangerouslySetInnerHTML` with sanitized output

#### EMAIL

- **Encryption**: AES-256-CBC
- **Validation**: Email format before encryption
- **Use Cases**: Contact emails, user emails
- **Searchability**: Domain part can be hashed separately

#### URL

- **Encryption**: AES-256-CBC
- **Validation**: URL format before encryption
- **Use Cases**: Website links, resource URLs
- **Display**: Hostname extracted and shown in UI

---

### 2. Number & Date Fields (OPE - Order-Preserving Encryption)

#### INTEGER

- **Encryption**: OPE algorithm
- **Format**: `ciphertext|strong_enc` (pipe-delimited)
- **Range**: -2^31 to 2^31-1
- **Sorting**: Encrypted values preserve order
- **Filtering**: Range queries supported (`gte`, `lte`, `eq`)
- **Implementation**: `CommonUtils.encryptOPE(value, encryptionKey)`

#### NUMERIC

- **Encryption**: OPE (on scaled integer)
- **Decimal Places**: 0-10 (configurable per field)
- **Pre-processing**: `value * 10^decimalPlaces` before encryption
- **Post-processing**: Divide by scale factor after decryption
- **Display**: Formatted with thousands separator (dot in Vietnamese)

#### DATE

- **Encryption**: OPE (Unix timestamp)
- **Format**: ISO 8601 date → Unix timestamp → OPE
- **Sorting**: Chronological order preserved
- **Filtering**: Date range queries supported
- **Display**: `toLocaleDateString()` with locale

#### DATETIME

- **Encryption**: OPE (Unix timestamp with ms precision)
- **Format**: ISO 8601 datetime → Unix ms → OPE
- **Precision**: Millisecond
- **Display**: `toLocaleString()` with timezone

#### TIME

- **Encryption**: OPE (seconds since midnight)
- **Format**: HH:MM:SS → seconds → OPE
- **Range**: 0-86399 (24-hour)
- **Display**: Time picker component

#### Time Component Fields (YEAR, MONTH, DAY, HOUR, MINUTE, SECOND)

- **Encryption**: OPE (integer value)
- **YEAR**: 1900-2100 range
- **MONTH**: 1-12
- **DAY**: 1-31
- **HOUR**: 0-23
- **MINUTE**: 0-59
- **SECOND**: 0-59
- **Use Cases**: Separate time components for custom date logic

---

### 3. Selection Fields (HMAC-SHA256)

#### SELECT_ONE

- **Encryption**: HMAC-SHA256 of option value
- **Format**: `base64(HMAC-SHA256(value, key))`
- **Matching**: Hash comparison against option values
- **Options**: Encrypted option values stored separately
- **Display**: Option text from `options` array
- **Filtering**: Equality check only (no ranges)

#### SELECT_LIST

- **Encryption**: Array of HMAC hashes
- **Format**: JSON array of base64 hashes
- **Matching**: Each hash matched against options
- **Display**: Multiple badges with option texts
- **Filtering**: `in` operator with hash arrays

#### CHECKBOX_YES_NO

- **Encryption**: HMAC of boolean string ("yes"/"no")
- **Values**: "yes" | "no" | null
- **Display**: Checkbox component
- **Filtering**: Equality check

#### CHECKBOX_ONE

- **Encryption**: Same as SELECT_ONE
- **UI**: Radio buttons instead of dropdown
- **Use Cases**: Single choice with checkbox UX

#### CHECKBOX_LIST

- **Encryption**: Same as SELECT_LIST
- **UI**: Multiple checkboxes
- **Use Cases**: Multi-choice with checkbox UX

---

### 4. Reference Fields (No Direct Encryption)

#### SELECT_ONE_RECORD

- **Encryption**: NONE (stores record ID)
- **Referenced Data**: Encrypted in referenced table
- **Label Field**: Decrypted from referenced record
- **Implementation**: `useReferenceRecords` hook fetches and decrypts
- **Display**: Referenced record's label field value
- **Filtering**: By referenced record ID

#### SELECT_LIST_RECORD

- **Encryption**: NONE (stores array of record IDs)
- **Format**: JSON array of IDs
- **Display**: Multiple badges with referenced labels
- **Batch Fetching**: `fetchBatchReferenceRecords` for efficiency

#### FIRST_REFERENCE_RECORD

- **Encryption**: NONE (computed field)
- **Logic**: Reverse lookup - finds first record in referenced table pointing to this record
- **Read-Only**: Cannot be edited directly
- **Filter**: `filtering[referenceField:eq]=currentRecordId`

#### SELECT_ONE_WORKSPACE_USER

- **Encryption**: NONE (stores user ID)
- **User Data**: Fetched from workspace users endpoint
- **Display**: User name + avatar
- **Searchable**: User search via Select2-style dropdown

#### SELECT_LIST_WORKSPACE_USER

- **Encryption**: NONE (array of user IDs)
- **Display**: Multiple user badges
- **Use Cases**: Assigned users, collaborators

---

## Encryption Implementation Patterns

### 1. Client-Side Encryption Flow

```typescript
// Before API call (create/update)
const encryptedValue = await encryptFieldValue(value, field, encryptionKey);

// Encryption dispatcher
function encryptFieldValue(value: unknown, field: FieldConfig, key: string) {
  const encType = getEncryptionTypeForField(field.type);

  switch (encType) {
    case 'AES-256-CBC':
      return CommonUtils.encryptTextField(String(value), key);
    case 'OPE':
      return CommonUtils.encryptOPE(Number(value), key);
    case 'HMAC-SHA256':
      return Array.isArray(value) ? value.map((v) => CommonUtils.hashValue(v, key)) : CommonUtils.hashValue(value, key);
    default:
      return value; // No encryption
  }
}
```

### 2. Client-Side Decryption Flow

```typescript
// After API response
const decryptedRecord = await decryptRecord(record, fields, encryptionKey);

// Decryption dispatcher
async function decryptFieldValue(value: string, field: FieldConfig, key: string) {
  if (!value) return null;

  const encType = getEncryptionTypeForField(field.type);

  switch (encType) {
    case 'AES-256-CBC':
      return await CommonUtils.decryptTextField(value, key);
    case 'OPE':
      const decrypted = await CommonUtils.decryptOPE(value, key);
      // Scale back if NUMERIC with decimal places
      if (field.type === 'NUMERIC' && field.decimalPlaces) {
        return decrypted / Math.pow(10, field.decimalPlaces);
      }
      return decrypted;
    case 'HMAC-SHA256':
      // Match hash against options
      return await matchHashToOption(value, field.options, key);
    default:
      return value;
  }
}
```

### 3. Hashed Keywords for Search

```typescript
// Generate searchable keywords for encrypted text fields
function generateHashedKeywords(value: string, encryptionKey: string): string[] {
  const keywords = extractKeywords(value); // Tokenize into words
  return keywords.map((keyword) => CommonUtils.hashValue(keyword, encryptionKey));
}

// Search implementation
const searchHashes = generateHashedKeywords(searchQuery, encryptionKey);
const filtering = {
  'hashed_keywords:contains_any': searchHashes,
};
```

---

## Security Considerations

### 1. Key Management

**Storage**:

- ✅ Encryption key stored in `localStorage` only
- ✅ Never transmitted to server in API requests
- ✅ Key format: 32-character UTF-8 string (not hex)
- ✅ Key validation: `encryptionAuthKey === SHA256(encryptionKey)`

**Lifecycle**:

- Generated once per table (user-provided or auto-generated)
- Stored per table: `encryption_key_${workspaceId}_${tableId}`
- Cleared on logout or table deletion
- Backup responsibility: User must save key externally

**Validation**:

```typescript
// Before any encryption/decryption
if (!encryptionKey || encryptionKey.length !== 32) {
  throw new Error('Invalid encryption key format');
}

if (table.encryptionAuthKey !== hashKeyForAuth(encryptionKey)) {
  throw new Error('Encryption key authentication failed');
}
```

### 2. IV Generation (AES-256-CBC)

- ✅ Random IV per field per record (crypto.getRandomValues)
- ✅ IV prepended to ciphertext
- ✅ Different IV even for identical values
- ❌ Never reuse IV with same key

### 3. Salt-Free HMAC (Consistency Required)

- ⚠️ No salt used (deterministic hashing required for equality checks)
- ✅ Key acts as salt (32-char random)
- ⚠️ Same option value always produces same hash (necessary for filtering)

### 4. OPE Security Trade-offs

- ⚠️ Order-preserving leaks relative ordering information
- ✅ Acceptable for dates/numbers where ordering is needed
- ✅ Strong encryption component (`strong_enc`) adds security layer
- ❌ Not suitable for highly sensitive numeric data

### 5. Reference Field Privacy

- ✅ Reference field stores only IDs (no encryption needed)
- ✅ Referenced record's label field encrypted independently
- ✅ Decryption happens after batch fetch
- ⚠️ Record IDs are visible (UUIDs, not sequential)

---

## Performance Considerations

### 1. Decryption Performance

| Field Count   | Decryption Time | Optimization        |
| ------------- | --------------- | ------------------- |
| 1-10 fields   | <50ms           | Direct decryption   |
| 10-50 fields  | <500ms          | Batch processing    |
| 50-100 fields | <1000ms         | Web Worker (future) |

**Optimization Strategies**:

- Cache decrypted values in memory (React Query cache)
- Decrypt visible fields first (lazy decrypt off-screen)
- Use Web Worker for >50 fields (Phase 3)

### 2. Reference Record Batching

```typescript
// Collect all reference IDs across visible records
const referenceMap = buildReferenceMap(records, fields);

// Single batch API call
const referencedRecords = await fetchBatchReferenceRecords(referenceMap);

// Decrypt all reference labels
const decryptedRefs = await decryptRecords(referencedRecords, refFields, key);
```

### 3. Hashed Keyword Caching

- Generate hashed keywords on record save
- Store in `hashed_keywords` field (JSON array)
- Avoid regenerating on every search
- Update when record changes

---

## Error Handling

### 1. Decryption Failures

```typescript
try {
  const decrypted = await decryptFieldValue(value, field, key);
  return decrypted;
} catch (error) {
  console.error(`Decryption failed for field ${field.name}:`, error);

  // Fallback display
  return {
    __error: true,
    __encrypted: value,
    __message: 'Decryption failed - invalid key or corrupted data',
  };
}
```

### 2. Missing Encryption Key

```typescript
if (!encryptionKey && table.encryptionMode === 'CLIENT_SIDE') {
  // Prompt user for encryption key
  showEncryptionKeyModal(workspaceId, tableId);
  return;
}
```

### 3. Invalid Encryption Auth Key

```typescript
if (encryptionAuthKey !== hashKeyForAuth(encryptionKey)) {
  showError('Encryption key is invalid. Cannot decrypt data.');
  clearEncryptionKey(workspaceId, tableId);
  return;
}
```

---

## Testing Requirements

### 1. Encryption/Decryption Round-Trip Tests

For each field type:

- Encrypt plaintext value
- Decrypt ciphertext
- Assert: `decrypted === original`

### 2. OPE Order Preservation Tests

```typescript
const values = [10, 5, 20, 15];
const encrypted = values.map((v) => encryptOPE(v, key));
const sorted = encrypted.sort();
const decrypted = sorted.map((e) => decryptOPE(e, key));

expect(decrypted).toEqual([5, 10, 15, 20]);
```

### 3. HMAC Equality Tests

```typescript
const hash1 = hashValue('option1', key);
const hash2 = hashValue('option1', key);
const hash3 = hashValue('option2', key);

expect(hash1).toBe(hash2); // Deterministic
expect(hash1).not.toBe(hash3); // Different values
```

### 4. Reference Field Batch Fetching

```typescript
const records = [
  { id: 'r1', assignedUserId: 'u1' },
  { id: 'r2', assignedUserId: 'u2' },
  { id: 'r3', assignedUserId: 'u1' },
];

const users = await fetchBatchUsers(['u1', 'u2']);
expect(Object.keys(users)).toHaveLength(2); // Deduped
```

---

## Migration from Legacy

### Blade → React Encryption Differences

| Aspect             | Blade (Legacy)           | React (New)                     |
| ------------------ | ------------------------ | ------------------------------- |
| Library            | crypto-js (CDN)          | crypto-js (npm)                 |
| Decryption         | Synchronous              | Async (Promise-based)           |
| Caching            | Manual cache object      | React Query cache               |
| Key Storage        | `sessionStorage`         | `localStorage`                  |
| IV Generation      | `crypto.getRandomValues` | Same                            |
| Hash Algorithm     | SHA-256                  | Same                            |
| OPE Implementation | Custom JS                | Same algorithm, Promise-wrapped |

**Compatibility**: ✅ New implementation can decrypt legacy data (same algorithms)

---

## Unresolved Questions

1. **Web Worker Decryption**: Implement for large records (>50 fields)?
2. **Encryption Progress**: Show progress bar for batch encryption?
3. **Key Rotation**: Support re-encryption with new key?
4. **Selective Field Encryption**: Allow per-field encryption toggle?
5. **Encryption Audit Log**: Track encryption/decryption events?
6. **Offline Decryption**: Cache decrypted values for offline use?

---

**Next Steps**:

1. Implement `encryptFieldValue` and `decryptFieldValue` utilities
2. Add unit tests for all 26 field types
3. Create encryption performance benchmarks
4. Document key backup/recovery process for users
