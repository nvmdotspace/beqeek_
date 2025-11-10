# ISSUE: Records Being Created Without Encryption

## Problem Summary

**Observed Behavior:**

```json
{
  "record": {
    "task_title": "Nam Test 333",
    "task_description": "<p>Nam Test 333</p>",
    "matrix_quadrant": "q1",
    "status": "pending"
  },
  "hashed_keywords": {},
  "record_hashes": {}
}
```

**Expected Behavior (E2EE Enabled):**

```json
{
  "record": {
    "task_title": "VWkTpdhz6vn1+UHauplsl7Ivsm5oEi/0ETq267gCX2s=", // AES encrypted
    "matrix_quadrant": "69c8dd1329d23d9d...", // HMAC hash
    "status": "a3273e304468cb4d..." // HMAC hash
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

## Root Cause Analysis

### 1. **Table Template Default: E2EE is Disabled**

**File:** `packages/beqeek-shared/src/configs/table-configs.ts`

**All 35 table templates have:**

```typescript
e2eeEncryption: false,  // Line 43 (BLANK template)
```

**Affected templates:**

- `TABLE_TYPE_BLANK`
- `TABLE_TYPE_TASK_EISENHOWER` (line 972)
- `TABLE_TYPE_CONTRACT`
- ... all 35 templates

### 2. **Encryption Logic in `useCreateRecord`**

**File:** `apps/web/src/features/active-tables/hooks/use-create-record.ts:71-98`

```typescript
const isEncrypted = table.config.e2eeEncryption; // ← Reads from table config

if (isEncrypted) {
  // Encrypt and hash
  payload = buildEncryptedCreatePayload(record, table, encryptionKey);
} else {
  // Send plaintext (current behavior)
  payload = buildPlaintextCreatePayload(record);
}
```

**Flow:**

1. Table created from template → `e2eeEncryption: false`
2. User creates record → Hook checks `table.config.e2eeEncryption`
3. Value is `false` → Goes to plaintext path
4. Data sent unencrypted to server

---

## Why This Happens

### Table Creation Flow

**File:** `apps/web/src/features/active-tables/hooks/use-table-management.ts:160`

```typescript
config: {
  title: data.name,
  fields: localizedFields,
  e2eeEncryption: data.e2eeEncryption,  // ← From form data
  encryptionKey, // Empty if E2EE enabled
  ...
}
```

**Problem:** When creating a table from a template:

1. Template is loaded with `e2eeEncryption: false`
2. User fills form (table name, type, etc.)
3. Unless user explicitly enables E2EE in form, it stays `false`
4. Table is saved with `e2eeEncryption: false`
5. All subsequent records are created in plaintext

---

## Impact Assessment

### Security Implications

| Scenario                    | Data Storage       | Search/Filter       | Client Processing    |
| --------------------------- | ------------------ | ------------------- | -------------------- |
| **Current (E2EE disabled)** | ❌ Plaintext in DB | ✅ Server-side SQL  | ⚡ Fast (no decrypt) |
| **Expected (E2EE enabled)** | ✅ Encrypted in DB | ⚠️ Client-side only | 🐢 Slower (decrypt)  |

### Data Exposure Risk

**What is exposed when E2EE is disabled:**

```json
// Stored in database AS-IS
{
  "task_title": "Secret project name",
  "task_description": "Confidential details",
  "assignee": "user_id_123",
  "status": "pending"
}
```

**Anyone with database access can:**

- ✅ Read all field values
- ✅ Search full-text without client
- ✅ Run analytics queries
- ✅ Export data directly

**Zero-knowledge encryption (E2EE enabled) prevents this:**

- ❌ Database admin cannot read data
- ❌ Backup leaks reveal nothing
- ❌ SQL injection only gets encrypted blobs
- ✅ Only client with encryption key can decrypt

---

## Solution Options

### Option 1: Enable E2EE by Default in Templates ✅ **RECOMMENDED**

**Change:** `packages/beqeek-shared/src/configs/table-configs.ts`

```typescript
// Before
[TableTypes.TABLE_TYPE_TASK_EISENHOWER]: {
  e2eeEncryption: false,
  ...
}

// After
[TableTypes.TABLE_TYPE_TASK_EISENHOWER]: {
  e2eeEncryption: true,  // ✅ Enable by default
  hashedKeywordFields: ['task_title', 'task_description'],  // Auto-generated
  ...
}
```

**Pros:**

- ✅ Secure by default (zero-knowledge)
- ✅ No UI changes needed
- ✅ Protects sensitive data immediately

**Cons:**

- ⚠️ Performance hit (client-side crypto)
- ⚠️ Users must manage encryption keys
- ⚠️ Lost key = lost data

**Use Cases:**

- Personal task managers
- HR data (salaries, reviews)
- Medical records
- Legal documents
- Any PII (Personally Identifiable Information)

---

### Option 2: Add E2EE Toggle in Table Creation Form

**Change:** Add checkbox in table creation dialog

```tsx
<FormField name="e2eeEncryption">
  <FormLabel>
    Enable End-to-End Encryption
    <InfoTooltip>
      Data will be encrypted on your device before sending to server. You must save the encryption key - if lost, data
      cannot be recovered.
    </InfoTooltip>
  </FormLabel>
  <Switch defaultChecked={false} />
</FormField>
```

**Pros:**

- ✅ User choice
- ✅ Clear understanding of trade-offs
- ✅ Can disable for non-sensitive data

**Cons:**

- ⚠️ Users may skip (insecure by default)
- ⚠️ Requires UI changes
- ⚠️ Education burden on users

---

### Option 3: Detect Sensitive Fields and Auto-Enable E2EE

**Logic:**

```typescript
function shouldEnableE2EE(fields: FieldConfig[]): boolean {
  const sensitiveFieldNames = [
    'salary',
    'wage',
    'compensation',
    'ssn',
    'passport',
    'id_number',
    'password',
    'secret',
    'private',
    'medical',
    'health',
    'diagnosis',
  ];

  return fields.some((field) => sensitiveFieldNames.some((keyword) => field.name.toLowerCase().includes(keyword)));
}
```

**Pros:**

- ✅ Smart defaults
- ✅ Protects sensitive data automatically
- ✅ No user decision needed

**Cons:**

- ⚠️ False positives/negatives
- ⚠️ Heuristic may miss edge cases
- ⚠️ Inconsistent behavior

---

## Recommended Solution

### **Enable E2EE for Specific Sensitive Table Types**

**Tables that SHOULD have E2EE enabled:**

1. `TABLE_TYPE_EMPLOYEE` - HR data (salary, reviews)
2. `TABLE_TYPE_CONTRACT` - Legal agreements
3. `TABLE_TYPE_INVOICE` - Financial data
4. `TABLE_TYPE_CUSTOMER` - PII
5. `TABLE_TYPE_TASK_EISENHOWER` - Personal productivity (optional)

**Tables that can stay plaintext:**

1. `TABLE_TYPE_BLANK` - User decides
2. `TABLE_TYPE_JOB_TITLE` - Public data
3. `TABLE_TYPE_PRODUCT` - Inventory (non-sensitive)

**Implementation:**

```typescript
// packages/beqeek-shared/src/configs/table-configs.ts

const SENSITIVE_TABLE_TYPES = [
  TABLE_TYPE_EMPLOYEE,
  TABLE_TYPE_CONTRACT,
  TABLE_TYPE_INVOICE,
  TABLE_TYPE_CUSTOMER,
];

function getDefaultE2EEConfig(tableType: string): boolean {
  return SENSITIVE_TABLE_TYPES.includes(tableType);
}

export const TABLE_CONFIGS: Record<string, TableConfig> = {
  [TableTypes.TABLE_TYPE_EMPLOYEE]: {
    e2eeEncryption: true,  // ✅ Sensitive data
    hashedKeywordFields: ['employee_name', 'email'],
    ...
  },

  [TableTypes.TABLE_TYPE_TASK_EISENHOWER]: {
    e2eeEncryption: false,  // ❌ User choice (add toggle)
    hashedKeywordFields: ['task_title', 'task_description'],
    ...
  },
};
```

---

## Migration Path for Existing Tables

### If E2EE is Enabled After Data Exists

**Problem:** Existing records are in plaintext, new records are encrypted

**Solution 1: Dual-Mode Support** (complex)

```typescript
// Detect if record is encrypted
function isRecordEncrypted(record: any): boolean {
  return record.task_title?.match(/^[A-Za-z0-9+/=]+$/) !== null;
}

// Decrypt conditionally
function decryptRecord(record: any, key: string): any {
  if (isRecordEncrypted(record)) {
    return CommonUtils.decryptTableData(...);
  }
  return record; // Already plaintext
}
```

**Solution 2: Force Migration** (recommended)

```typescript
// When enabling E2EE on existing table
async function migrateToE2EE(tableId: string, encryptionKey: string) {
  // 1. Fetch all records (plaintext)
  const records = await fetchAllRecords(tableId);

  // 2. Encrypt each record
  const encryptedRecords = records.map((record) => buildEncryptedCreatePayload(record, table, encryptionKey));

  // 3. Batch update
  await batchUpdateRecords(tableId, encryptedRecords);

  // 4. Update table config
  await updateTableConfig(tableId, { e2eeEncryption: true });
}
```

---

## Action Items

### Immediate Fix (Option 1)

1. ✅ **Update table templates** with E2EE enabled for sensitive types
2. ✅ **Add encryption key generation** in table creation flow
3. ✅ **Show encryption key backup modal** after table creation
4. ✅ **Update documentation** about E2EE enabled tables

### Long-term Improvements (Option 2)

1. ⚠️ **Add E2EE toggle** in table settings (enable/disable after creation)
2. ⚠️ **Implement migration tool** for plaintext → encrypted conversion
3. ⚠️ **Add encryption key recovery** mechanism (backup codes, etc.)
4. ⚠️ **Performance optimization** for client-side decryption

---

## Testing Checklist

After enabling E2EE by default:

- [ ] Create new table from template → Check `e2eeEncryption: true`
- [ ] Create record → Verify payload is encrypted
- [ ] Fetch records → Verify client-side decryption works
- [ ] Search/filter → Verify hashed keywords work
- [ ] Update record → Verify encryption maintained
- [ ] Delete record → Verify cascade works
- [ ] Export data → Verify encrypted format
- [ ] Import data → Verify decryption on import

---

## Current Status

**Problem Identified:**

- ✅ Root cause: Templates have `e2eeEncryption: false`
- ✅ Fix location: `packages/beqeek-shared/src/configs/table-configs.ts`
- ✅ Impact: ALL tables created from templates are plaintext

**Next Steps:**

1. Decide which table types should have E2EE enabled by default
2. Update template configurations
3. Add encryption key management UI
4. Test end-to-end flow

**Document Created:** 2025-11-10
**Author:** Business Analyst + Claude Code
**Status:** 🔍 Analysis Complete, Awaiting Implementation Decision
