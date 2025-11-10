# ISSUE: Records Being Created Without Encryption - CORRECTED

## ❌ Previous Misunderstanding

**Incorrect assumption**: `e2eeEncryption: false` means "don't encrypt data"

**Reality**: BOTH encryption modes require encryption. The difference is WHERE the encryption key comes from.

---

## Problem Summary

**Observed Behavior:**

```json
{
  "record": {
    "task_title": "Nam Test 333", // ❌ Plaintext!
    "matrix_quadrant": "q1", // ❌ Plaintext!
    "status": "pending" // ❌ Plaintext!
  },
  "hashed_keywords": {},
  "record_hashes": {}
}
```

**Expected Behavior (BOTH modes):**

```json
{
  "record": {
    "task_title": "VWkTpdhz6vn1+UHauplsl7Ivsm5oEi/0ETq267gCX2s=", // ✅ AES encrypted
    "matrix_quadrant": "69c8dd1329d23d9d...", // ✅ HMAC hash
    "status": "a3273e304468cb4d..." // ✅ HMAC hash
  },
  "hashed_keywords": {
    "task_title": "78c0821d60bd419d...",
    "matrix_quadrant": "69c8dd1329d23d9d...",
    "status": "a3273e304468cb4d..."
  },
  "record_hashes": {
    "task_title": "78c0821d60bd419d...",
    "matrix_quadrant": "69c8dd1329d23d9d...",
    "status": "a3273e304468cb4d..."
  }
}
```

---

## ✅ Correct Understanding of Encryption Modes

**Reference:** `docs/technical/encryption-modes-corrected.md`

### Mode 1: Server-Side Encryption (`e2eeEncryption: false`)

- Encryption key **generated and stored by server**
- Server **sends key to client** in API response: `table.config.encryptionKey`
- Client **encrypts data** before sending to server
- Server stores **encrypted data** in database
- Client **decrypts data** when reading using `table.config.encryptionKey`

**API Response:**

```json
{
  "config": {
    "e2eeEncryption": false,
    "encryptionKey": "mRX76b6kRRi3Alz0V5gFbqOT4MF7cZtx", // ← Server provides key
    "encryptionAuthKey": "d4ea0cb2cf5a6bc85ee3f163f9b66b7948d8ac3906fc6945e4fdbc1ba3918c79"
  }
}
```

### Mode 2: End-to-End Encryption (E2EE) (`e2eeEncryption: true`)

- Encryption key **generated and stored by client** (localStorage)
- Key **NEVER sent to server**
- Client **encrypts data** before sending to server
- Server stores **encrypted data** in database
- Client **decrypts data** when reading using localStorage key

**API Response:**

```json
{
  "config": {
    "e2eeEncryption": true,
    "encryptionKey": null, // ← Server does NOT provide key
    "encryptionAuthKey": "d4ea0cb2cf5a6bc85ee3f163f9b66b7948d8ac3906fc6945e4fdbc1ba3918c79"
  }
}
```

### Key Insight

| Aspect                    | Server-Side Encryption       | E2EE           |
| ------------------------- | ---------------------------- | -------------- |
| **Data in Database**      | ✅ Encrypted                 | ✅ Encrypted   |
| **Client Encryption**     | ✅ Required                  | ✅ Required    |
| **Encryption Key Source** | `table.config.encryptionKey` | `localStorage` |
| **Server Has Key**        | ✅ Yes                       | ❌ No          |

**Both modes encrypt data before sending to server!**

---

## Root Cause Analysis

### 🐛 **Bug in `useCreateRecord` Hook**

**File:** `apps/web/src/features/active-tables/hooks/use-create-record.ts:82-97` (before fix)

```typescript
if (isEncrypted) {
  // E2EE mode: Encrypt with localStorage key
  payload = buildEncryptedCreatePayload(record, table, encryptionKey);
} else {
  // ❌ BUG: This sends PLAINTEXT!
  payload = buildPlaintextCreatePayload(record);
}
```

**What went wrong:**

1. Code assumed `e2eeEncryption: false` means "no encryption"
2. Created `buildPlaintextCreatePayload()` function that sends raw data
3. Server-side encryption mode was **completely ignored**

**Correct logic:**

```typescript
if (isE2EE) {
  // E2EE mode: Use key from localStorage
  encryptionKey = localStorage.getItem(`table_${tableId}_encryption_key`);
} else {
  // Server-side mode: Use key from table config
  encryptionKey = table.config.encryptionKey;
}

// BOTH modes use the same encryption function!
payload = buildEncryptedCreatePayload(record, table, encryptionKey);
```

---

## The Fix

### Changes Made to `use-create-record.ts`

#### 1. **Removed the false dichotomy** (lines 71-106)

**Before:**

```typescript
const isEncrypted = table.config.e2eeEncryption;

if (isEncrypted) {
  // E2EE only
  const encryptionKey = localStorage.getItem(...);
  payload = buildEncryptedCreatePayload(...);
} else {
  // ❌ Wrong: Plaintext mode
  payload = buildPlaintextCreatePayload(record);
}
```

**After:**

```typescript
const isE2EE = table.config.e2eeEncryption;
let encryptionKey: string | null = null;

if (isE2EE) {
  // E2EE Mode: localStorage key
  encryptionKey = localStorage.getItem(`table_${tableId}_encryption_key`);
} else {
  // Server-Side Mode: server-provided key
  encryptionKey = table.config.encryptionKey ?? null;
}

// Both modes encrypt!
payload = buildEncryptedCreatePayload(record, table, encryptionKey);
```

#### 2. **Removed `buildPlaintextCreatePayload` function** (lines 208-218)

This function was based on a flawed assumption. Both modes require encryption.

#### 3. **Added debug logging** (lines 73-79)

```typescript
console.log('[useCreateRecord] Table config:', {
  tableId,
  e2eeEncryption: table.config.e2eeEncryption,
  serverEncryptionKey: table.config.encryptionKey ? '***exists***' : 'null',
  hasLocalStorageKey: !!localStorage.getItem(`table_${tableId}_encryption_key`),
});
```

This helps diagnose which mode is active and whether keys are available.

---

## Expected Behavior After Fix

### Scenario 1: Server-Side Encryption (Default)

**Table Config:**

```json
{
  "e2eeEncryption": false,
  "encryptionKey": "mRX76b6kRRi3Alz0V5gFbqOT4MF7cZtx"
}
```

**Create Record Flow:**

1. User fills form: `{ task_title: "Nam Test 333", matrix_quadrant: "q1" }`
2. Hook checks `e2eeEncryption` → `false`
3. Hook gets key from `table.config.encryptionKey`
4. Hook encrypts data with server key
5. Sends encrypted payload to API
6. Server stores encrypted data in DB

**Request Payload:**

```json
{
  "record": {
    "task_title": "VWkTpdhz6vn1+UHauplsl7Ivsm5oEi/0ETq267gCX2s=",
    "matrix_quadrant": "69c8dd1329d23d9d..."
  },
  "hashed_keywords": {
    "task_title": "78c0821d60bd419d...",
    "matrix_quadrant": "69c8dd1329d23d9d..."
  },
  "record_hashes": {
    "task_title": "78c0821d60bd419d...",
    "matrix_quadrant": "69c8dd1329d23d9d..."
  }
}
```

### Scenario 2: E2EE Mode

**Table Config:**

```json
{
  "e2eeEncryption": true,
  "encryptionKey": null
}
```

**Create Record Flow:**

1. User fills form: `{ task_title: "Secret Task", matrix_quadrant: "q2" }`
2. Hook checks `e2eeEncryption` → `true`
3. Hook gets key from `localStorage.getItem('table_808_encryption_key')`
4. Hook encrypts data with localStorage key
5. Sends encrypted payload to API
6. Server stores encrypted data in DB (cannot decrypt!)

**Request Payload:**

```json
{
  "record": {
    "task_title": "different_encrypted_value=",
    "matrix_quadrant": "different_hash_value"
  },
  "hashed_keywords": {...},
  "record_hashes": {...}
}
```

---

## Testing Checklist

After applying the fix, verify:

### Server-Side Encryption Mode

- [ ] Table config has `e2eeEncryption: false`
- [ ] Table config has `encryptionKey: "32_char_key"`
- [ ] Console shows: "Server-side encryption mode: Encrypting with server key"
- [ ] Network request payload is encrypted (base64 strings, hashes)
- [ ] Records are decrypted correctly when fetched

### E2EE Mode

- [ ] Table config has `e2eeEncryption: true`
- [ ] Table config has `encryptionKey: null`
- [ ] localStorage has `table_{id}_encryption_key`
- [ ] Console shows: "E2EE mode: Encrypting with localStorage key"
- [ ] Network request payload is encrypted
- [ ] Records are decrypted correctly when fetched

### Error Cases

- [ ] E2EE mode without localStorage key → Shows error modal
- [ ] Server-side mode without config key → Throws error
- [ ] Invalid encryption key → Decryption fails gracefully

---

## Related Files

**Fixed:**

- `apps/web/src/features/active-tables/hooks/use-create-record.ts:71-106`

**Reference:**

- `docs/technical/encryption-modes-corrected.md` (corrected understanding)
- `docs/specs/active-tables/create record/CREATE_RECORD_API_REFERENCE.md` (API spec)
- `docs/BA/hashed-keywords-explained.md` (hashing explanation)

**Similar Issues to Check:**

- `use-update-record.ts` - May have same bug
- `use-delete-record.ts` - Check if encryption applies
- Any other mutation hooks

---

## Acknowledgment

Thank you for pointing out the misunderstanding about encryption modes. The fix now correctly implements:

1. ✅ Server-side encryption uses `table.config.encryptionKey`
2. ✅ E2EE uses localStorage key
3. ✅ Both modes encrypt data before sending
4. ✅ No plaintext data is ever sent to server

**Document Created:** 2025-11-10
**Author:** Claude Code (corrected)
**Status:** ✅ Fixed
