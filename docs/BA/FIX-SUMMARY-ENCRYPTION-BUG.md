# Fix Summary: Encryption Bug in Record Create/Update

## Issue

Records were being sent to the server in **plaintext** instead of encrypted format, regardless of encryption mode.

**Observed Payload:**

```json
{
  "record": {
    "task_title": "Nam Test 333", // ❌ Plaintext
    "matrix_quadrant": "q1" // ❌ Plaintext
  },
  "hashed_keywords": {},
  "record_hashes": {}
}
```

---

## Root Cause

### Misunderstanding of Encryption Modes

**Incorrect assumption**: `e2eeEncryption: false` means "no encryption needed"

**Correct understanding** (per `encryption-modes-corrected.md`):

| Mode                                  | Key Storage         | Client Encrypts? | Server Stores  |
| ------------------------------------- | ------------------- | ---------------- | -------------- |
| Server-Side (`e2eeEncryption: false`) | Server DB           | ✅ Yes           | Encrypted data |
| E2EE (`e2eeEncryption: true`)         | Client localStorage | ✅ Yes           | Encrypted data |

**Both modes require client-side encryption!** The only difference is WHERE the encryption key comes from.

### Code Bug

**Files affected:**

1. `apps/web/src/features/active-tables/hooks/use-create-record.ts`
2. `apps/web/src/features/active-tables/hooks/use-update-record.ts` (2 mutations)
3. `apps/web/src/shared/utils/field-encryption.ts`

**Buggy logic:**

```typescript
if (isEncrypted) {  // Only true for E2EE
  // Encrypt with localStorage key
  payload = buildEncryptedCreatePayload(...);
} else {
  // ❌ BUG: Send plaintext!
  payload = buildPlaintextCreatePayload(record);
}
```

This completely ignored **server-side encryption mode**, sending raw data when `e2eeEncryption: false`.

---

## Fix Applied

### 1. Fixed `use-create-record.ts`

**Before:**

```typescript
const isEncrypted = table.config.e2eeEncryption;

if (isEncrypted) {
  const encryptionKey = localStorage.getItem(`table_${tableId}_encryption_key`);
  payload = buildEncryptedCreatePayload(record, table, encryptionKey);
} else {
  payload = buildPlaintextCreatePayload(record); // ❌ Wrong!
}
```

**After:**

```typescript
const isE2EE = table.config.e2eeEncryption;
let encryptionKey: string | null = null;

if (isE2EE) {
  // E2EE Mode: localStorage key
  encryptionKey = localStorage.getItem(`table_${tableId}_encryption_key`);
  if (!encryptionKey) {
    throw new Error('Encryption key not found. Please enter your encryption key.');
  }
} else {
  // Server-Side Mode: server-provided key
  encryptionKey = table.config.encryptionKey ?? null;
  if (!encryptionKey) {
    throw new Error('Table encryption key not found in config. Cannot encrypt data.');
  }
}

// Both modes encrypt!
payload = buildEncryptedCreatePayload(record, table, encryptionKey);
```

### 2. Fixed `use-update-record.ts`

**Two mutations fixed:**

- Single field update (lines 69-104)
- Bulk field update (lines 228-280)

**Same pattern:**

- Check `e2eeEncryption` flag
- Get key from localStorage (E2EE) OR `table.config.encryptionKey` (server-side)
- Always encrypt before sending

### 3. Removed `buildPlaintextCreatePayload` and `buildPlaintextUpdatePayload`

These functions were based on a flawed assumption. Replaced with a comment explaining why they were removed.

**Files changed:**

- `apps/web/src/features/active-tables/hooks/use-create-record.ts:208-218`
- `apps/web/src/shared/utils/field-encryption.ts:154-164`

### 4. Added Debug Logging

```typescript
console.log('[useCreateRecord] Table config:', {
  tableId,
  e2eeEncryption: table.config.e2eeEncryption,
  serverEncryptionKey: table.config.encryptionKey ? '***exists***' : 'null',
  hasLocalStorageKey: !!localStorage.getItem(`table_${tableId}_encryption_key`),
});
```

This helps diagnose encryption mode issues in production.

---

## Expected Behavior After Fix

### Server-Side Encryption Mode

**When:** `table.config.e2eeEncryption === false`

**Key source:** `table.config.encryptionKey` (from server API response)

**Request payload:**

```json
{
  "record": {
    "task_title": "VWkTpdhz6vn1+UHauplsl7Ivsm5oEi/0ETq267gCX2s=", // ✅ AES encrypted
    "matrix_quadrant": "69c8dd1329d23d9d..." // ✅ HMAC hash
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

### E2EE Mode

**When:** `table.config.e2eeEncryption === true`

**Key source:** `localStorage.getItem('table_{tableId}_encryption_key')`

**Request payload:** Same encrypted format, but using different encryption key

**Security difference:**

- Server-side: Server can decrypt (has the key)
- E2EE: Server CANNOT decrypt (zero-knowledge)

---

## Files Changed

### Modified:

1. ✅ `apps/web/src/features/active-tables/hooks/use-create-record.ts`
   - Lines 71-106: Fixed encryption mode detection
   - Lines 208-218: Removed plaintext function

2. ✅ `apps/web/src/features/active-tables/hooks/use-update-record.ts`
   - Lines 9-10: Removed plaintext import
   - Lines 69-104: Fixed single field update
   - Lines 228-280: Fixed bulk field update

3. ✅ `apps/web/src/shared/utils/field-encryption.ts`
   - Lines 154-164: Removed plaintext function

### Created:

- ✅ `docs/BA/ISSUE-PLAINTEXT-RECORDS-CORRECTED.md` - Detailed analysis
- ✅ `docs/BA/FIX-SUMMARY-ENCRYPTION-BUG.md` - This file

---

## Testing Checklist

### Before Testing

- [ ] Rebuild packages: `pnpm build`
- [ ] Clear browser cache and localStorage
- [ ] Restart dev server

### Server-Side Encryption Mode

- [ ] Table has `e2eeEncryption: false` and `encryptionKey: "32_chars"`
- [ ] Console shows: "Server-side encryption mode: Encrypting with server key"
- [ ] Network request shows encrypted base64 strings, not plaintext
- [ ] `hashed_keywords` and `record_hashes` are populated
- [ ] Records decrypt correctly when fetched

### E2EE Mode

- [ ] Table has `e2eeEncryption: true` and `encryptionKey: null`
- [ ] localStorage has `table_{id}_encryption_key`
- [ ] Console shows: "E2EE mode: Encrypting with localStorage key"
- [ ] Network request shows encrypted data
- [ ] Records decrypt correctly when fetched

### Error Handling

- [ ] E2EE without localStorage key → Shows encryption key modal
- [ ] Server-side without config key → Throws clear error
- [ ] Invalid key format → Handled gracefully

---

## Security Impact

### Before Fix (Vulnerable)

- ❌ Data sent to server in **plaintext**
- ❌ Anyone with network access could read sensitive data
- ❌ Server logs contained plaintext values
- ❌ Backups exposed sensitive information

### After Fix (Secure)

- ✅ Data encrypted **before** leaving client
- ✅ Network requests contain only encrypted blobs
- ✅ Server logs show only encrypted values
- ✅ Backups contain only encrypted data

**Even with server-side encryption mode**, data is now protected in transit and at rest.

---

## Lessons Learned

1. **Read documentation carefully**: The term "server-side encryption" was misleading. Better terms:
   - "Server-managed encryption" (server holds key)
   - "Client-managed encryption" (E2EE)

2. **Both modes protect data**: Even server-side encryption mode requires client-side encryption. The difference is key management, not encryption itself.

3. **Test encryption modes separately**: Don't assume E2EE and server-side modes behave similarly.

4. **Add debug logging early**: Would have caught this bug immediately during development.

---

## Related Documentation

- ✅ `docs/technical/encryption-modes-corrected.md` - Correct understanding of modes
- ✅ `docs/specs/active-tables/create record/CREATE_RECORD_API_REFERENCE.md` - API spec
- ✅ `docs/BA/hashed-keywords-explained.md` - Hashing explanation
- ✅ `docs/BA/ISSUE-PLAINTEXT-RECORDS-CORRECTED.md` - Detailed root cause analysis

---

**Date:** 2025-11-10
**Author:** Claude Code
**Status:** ✅ Fixed and Documented
**Severity:** 🔴 Critical (Data Security)
