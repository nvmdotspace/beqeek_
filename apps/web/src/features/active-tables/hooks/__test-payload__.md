# Create Record Payload Verification

## Changes Made to `use-create-record.ts`

### ✅ Issue 1: Fixed `hashed_keywords` Array Wrapping

**Before:**

```typescript
const keywords = CommonUtils.hashKeyword(value, encryptionKey); // Returns ["hash1", "hash2", ...]
payload.hashed_keywords![fieldName] = keywords; // ❌ Stores array
```

**After:**

```typescript
payload.hashed_keywords![fieldName] = HMAC.hash(value, encryptionKey); // ✅ Stores single hash string
```

### ✅ Issue 2: Added `hashed_keywords` for SELECT/CHECKBOX Fields

**Before:**

- SELECT fields were only added to `record` and `record_hashes`
- Missing from `hashed_keywords` entirely

**After:**

```typescript
if (CommonUtils.hashEncryptFields().includes(field.type)) {
  // SELECT/CHECKBOX fields: hashed_keywords = same as record (already hashed)
  payload.hashed_keywords![fieldName] = encryptedValue;
}
```

### ✅ Issue 3: Fixed Empty String Handling

**Before:**

```typescript
if (value === undefined || value === null) {
  return;
}
// Empty strings were still processed
```

**After:**

```typescript
if (value === undefined || value === null || value === '') {
  return; // Skip empty strings entirely
}
```

## Expected Payload Structure (After Fix)

### Example Input Data:

```typescript
{
  task_title: "Design landing page",           // SHORT_TEXT (hashedKeywordField)
  matrix_quadrant: "q2",                       // SELECT_ONE
  status: "in_progress",                       // SELECT_ONE
  assignee: "user_123",                        // SELECT_ONE_WORKSPACE_USER (reference)
  start_date: "",                              // DATE (empty - should be skipped)
}
```

### Expected Output Payload:

```json
{
  "record": {
    "task_title": "base64_aes_encrypted_string", // AES-256-CBC encrypted
    "matrix_quadrant": "69c8dd1329d23d9d...", // HMAC-SHA256 hash
    "status": "a3273e304468cb4d...", // HMAC-SHA256 hash
    "assignee": "user_123" // Plain (reference field)
    // ✅ start_date excluded (empty string)
  },
  "hashed_keywords": {
    "task_title": "78c0821d60bd419d...", // ✅ Single hash (not array)
    "matrix_quadrant": "69c8dd1329d23d9d...", // ✅ Same as record
    "status": "a3273e304468cb4d..." // ✅ Same as record
    // ✅ assignee excluded (reference field)
    // ✅ start_date excluded (empty)
  },
  "record_hashes": {
    "task_title": "78c0821d60bd419d...", // Hash of original value
    "matrix_quadrant": "69c8dd1329d23d9d...", // Same as record
    "status": "a3273e304468cb4d...", // Same as record
    "assignee": "9672dae72a2140363c5842ccc28e0afa..." // Hash of "user_123"
    // ✅ start_date excluded (empty)
  }
}
```

## Key Differences from API Spec

### Field Type Handling Matrix:

| Field Type        | record          | hashed_keywords       | record_hashes  |
| ----------------- | --------------- | --------------------- | -------------- |
| SHORT_TEXT        | AES encrypted   | HMAC hash (single) ✅ | HMAC hash      |
| SELECT_ONE        | HMAC hash       | Same as record ✅     | Same as record |
| SELECT_LIST       | HMAC hash array | Same as record ✅     | Same as record |
| SELECT_ONE_RECORD | Plain           | ❌ Excluded           | HMAC hash      |
| DATE              | OPE encrypted   | ❌ Excluded           | HMAC hash      |
| INTEGER           | OPE encrypted   | ❌ Excluded           | HMAC hash      |

### Search Index Usage:

**hashed_keywords Purpose:**

- Enable server-side search/filter WITHOUT encryption key
- Server compares `hashed_keywords` values for exact match

**Example Search Flow:**

```typescript
// Client wants to filter: matrix_quadrant = "q2"
const filterHash = HMAC.hash("q2", encryptionKey); // "69c8dd..."

// Send to server
POST /api/records {
  filtering: {
    record: {
      matrix_quadrant: "69c8dd..."  // Server searches hashed_keywords
    }
  }
}

// Server SQL:
SELECT * FROM search_index
WHERE field = 'matrix_quadrant'
  AND hash = '69c8dd...'
```

## Implementation Notes

### Why SELECT Fields Use Same Hash in Both Places:

From `hashed-keywords-explained.md:315-327`:

```typescript
// SELECT_ONE is hashEncryptFields() - only hashed, NOT encrypted
encryptedRecord.matrix_quadrant = HMAC.hash('q2', key); // "8f3c2b4e..."
hashedKeywords.matrix_quadrant = encryptedRecord.matrix_quadrant; // Same!
```

### Why Text Fields Use Different Values:

```typescript
// SHORT_TEXT is encryptFields() - encrypted + hashed separately
encryptedRecord.task_title = AES.encrypt('Design', key); // "U2FsdGVk..."
hashedKeywords.task_title = HMAC.hash('Design', key); // "abc123..." (different!)
```

## Verification Checklist

- ✅ Text fields (SHORT_TEXT): Single hash in `hashed_keywords`, not array
- ✅ SELECT fields: Present in `hashed_keywords` with same value as `record`
- ✅ Empty strings: Excluded from all sections
- ✅ Reference fields: Excluded from `hashed_keywords`, present in `record_hashes`
- ✅ Array fields (SELECT_LIST): Array in both `record` and `hashed_keywords`

## Testing

To test this fix:

1. Create a new record with mixed field types
2. Inspect network request payload
3. Verify structure matches expected output above
4. Confirm server accepts and indexes correctly
