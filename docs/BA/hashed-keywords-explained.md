# GIẢI THÍCH CHI TIẾT: HASHED_KEYWORDS VÀ TẠI SAO CẦN GỬI LÊN SERVER

## 1. VÍ DỤ BẠN ĐANG THẮC MẮC

```json
{
  "record": {
    "matrix_quadrant": "q2"
  },
  "hashed_keywords": {
    "matrix_quadrant": "sha256_hash_q2..."
  }
}
```

**Câu hỏi**:

1. ❓ Giá trị `"sha256_hash_q2..."` này là gì?
2. ❓ Tại sao phải gửi `hashed_keywords` khi đã có `record`?

---

## 2. TRẢ LỜI NHANH

### Giá trị `hashed_keywords` là gì?

```javascript
// Giá trị THẬT của "sha256_hash_q2..." là:
const encryptionKey = 'user_secret_key_abc123';
const value = 'q2';

const hashedValue = CryptoJS.HmacSHA256(value, encryptionKey).toString(CryptoJS.enc.Hex);
// Result: "8f3c2b4e9d7a1f6e5c8b2a3d4f5e6c7b8a9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4"
```

### Tại sao phải gửi?

**🔍 Để SERVER có thể SEARCH và FILTER mà KHÔNG cần biết encryption key!**

---

## 3. PHÂN TÍCH CHI TIẾT

### 3.1. Có 4 Loại Encryption Cho Các Field Types

**Code** (Lines 609-620):

```javascript
// 1. Full Encryption (AES)
static encryptFields() {
    return ['SHORT_TEXT', 'RICH_TEXT', 'TEXT', 'EMAIL', 'URL'];
}

// 2. OPE (Order Preserving Encryption) - Giữ thứ tự
static opeEncryptFields() {
    return ['YEAR', 'MONTH', 'DAY', 'HOUR', 'MINUTE', 'SECOND',
            'DATE', 'DATETIME', 'TIME', 'INTEGER', 'NUMERIC'];
}

// 3. Hash Only (HMAC-SHA256) - CHỈ HASH, KHÔNG ENCRYPT!
static hashEncryptFields() {
    return ['CHECKBOX_YES_NO', 'CHECKBOX_ONE', 'CHECKBOX_LIST',
            'SELECT_ONE', 'SELECT_LIST'];  // ← matrix_quadrant thuộc loại này!
}

// 4. No Encryption
static noneEncryptFields() {
    return ['SELECT_ONE_RECORD', 'SELECT_LIST_RECORD',
            'SELECT_ONE_WORKSPACE_USER', 'SELECT_LIST_WORKSPACE_USER'];
}
```

### 3.2. Field `matrix_quadrant` Thuộc Loại Nào?

```javascript
// Field definition
{
  "type": "SELECT_ONE",  // ← Thuộc hashEncryptFields()!
  "name": "matrix_quadrant",
  "label": "Ma trận",
  "options": [
    { "text": "Q1 - Quan trọng & Khẩn cấp", "value": "q1" },
    { "text": "Q2 - Quan trọng & Không khẩn", "value": "q2" },
    { "text": "Q3 - Không quan trọng & Khẩn", "value": "q3" },
    { "text": "Q4 - Không quan trọng & Không khẩn", "value": "q4" }
  ]
}
```

**→ `SELECT_ONE` thuộc `hashEncryptFields()` → CHỈ HASH, KHÔNG ENCRYPT!**

---

## 4. HASHING PROCESS CHI TIẾT

### 4.1. Code Implementation

**Function** (Lines 668-697):

```javascript
static encryptTableData(table, fieldName, value) {
    const field = table.config.fields.find(f => f.name === fieldName);
    const encryptionKey = table.config.encryptionKey;

    // Check field type
    if (CommonUtils.hashEncryptFields().includes(field.type)) {
        // SELECT_ONE, SELECT_LIST, CHECKBOX_* → HASH!

        if (['CHECKBOX_LIST', 'SELECT_LIST'].includes(field.type)) {
            // Array values - hash each item
            return value.map(v =>
                CryptoJS.HmacSHA256(v, encryptionKey).toString(CryptoJS.enc.Hex)
            );
        } else {
            // Single value - hash once
            return CryptoJS.HmacSHA256(value, encryptionKey).toString(CryptoJS.enc.Hex);
        }
    }

    // ... other field types
}
```

### 4.2. Ví Dụ Thực Tế

```javascript
// INPUT
const table = {
  config: {
    encryptionKey: 'my_secret_key_12345',
    fields: [
      {
        type: 'SELECT_ONE',
        name: 'matrix_quadrant',
        options: [
          { value: 'q1', text: 'Q1' },
          { value: 'q2', text: 'Q2' },
          { value: 'q3', text: 'Q3' },
          { value: 'q4', text: 'Q4' },
        ],
      },
    ],
  },
};

const value = 'q2';

// PROCESS
const hashedValue = CryptoJS.HmacSHA256(value, table.config.encryptionKey).toString(CryptoJS.enc.Hex);

// OUTPUT
console.log(hashedValue);
// "8f3c2b4e9d7a1f6e5c8b2a3d4f5e6c7b8a9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4"
```

### 4.3. Tại Sao Dùng HMAC-SHA256?

**HMAC-SHA256 = Hash-based Message Authentication Code**

```javascript
// SHA256 alone (KHÔNG AN TOÀN)
const hash1 = CryptoJS.SHA256('q2').toString();
// → Ai cũng có thể tính được hash này!
// → Attacker có thể brute-force tất cả values

// HMAC-SHA256 with secret key (AN TOÀN)
const hash2 = CryptoJS.HmacSHA256('q2', 'my_secret_key').toString();
// → Chỉ người có secret key mới tính được hash này!
// → Attacker KHÔNG thể brute-force
```

**Security Benefits**:

- ✅ Cannot reverse engineer (one-way function)
- ✅ Cannot brute-force without encryption key
- ✅ Deterministic (same input + key = same hash)
- ✅ Fast to compute

---

## 5. TẠI SAO PHẢI GỬI HASHED_KEYWORDS?

### 5.1. Problem: Server Cần Search/Filter Nhưng KHÔNG CÓ Encryption Key

```
┌─────────────────────────────────────────────────────────────┐
│                         SCENARIO                             │
│                                                              │
│  User muốn filter: "Hiển thị tất cả tasks ở Q2"            │
│                                                              │
│  Database có:                                                │
│    - Record 1: matrix_quadrant = "hash_of_q1"               │
│    - Record 2: matrix_quadrant = "hash_of_q2"  ← Want this  │
│    - Record 3: matrix_quadrant = "hash_of_q3"               │
│                                                              │
│  ❓ Server làm sao biết "hash_of_q2" là gì?                 │
│     → Server KHÔNG CÓ encryption key!                       │
│     → Server KHÔNG THỂ tính hash!                           │
└─────────────────────────────────────────────────────────────┘
```

### 5.2. Solution: Client Gửi Hash Lên!

```javascript
// CLIENT-SIDE
// Step 1: User selects filter "Q2"
const filterValue = "q2";

// Step 2: Client HAS encryption key
const encryptionKey = "my_secret_key_12345";

// Step 3: Client tính hash
const filterHash = CryptoJS.HmacSHA256(filterValue, encryptionKey).toString();
// → "8f3c2b4e9d7a1f6e5c8b2a3d4f5e6c7b8a9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4"

// Step 4: Send hash to server
const request = {
  filtering: {
    record: {
      matrix_quadrant: filterHash  // ← Send hash, not original value!
    }
  }
};

// SERVER-SIDE
// Step 5: Server searches database
SELECT * FROM records
WHERE matrix_quadrant = '8f3c2b4e9d7a1f6e5c8b2a3d4f5e6c7b8a9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4';

// Step 6: Found! Return encrypted record
// Client decrypts on receive
```

---

## 6. FULL EXAMPLE: CREATE RECORD VỚI HASHED_KEYWORDS

### 6.1. User Input

```javascript
// User fills form
const formData = {
  task_title: 'Design landing page', // SHORT_TEXT
  task_description: 'Create mockups', // TEXT
  start_date: '2025-11-05', // DATE
  matrix_quadrant: 'q2', // SELECT_ONE
  status: 'in_progress', // SELECT_ONE
  assignee: 'user_123', // SELECT_ONE_WORKSPACE_USER
};
```

### 6.2. Client Processing

```javascript
const table = {
  config: {
    encryptionKey: 'my_secret_key_12345',
    fields: [
      { type: 'SHORT_TEXT', name: 'task_title' },
      { type: 'TEXT', name: 'task_description' },
      { type: 'DATE', name: 'start_date' },
      { type: 'SELECT_ONE', name: 'matrix_quadrant' },
      { type: 'SELECT_ONE', name: 'status' },
      { type: 'SELECT_ONE_WORKSPACE_USER', name: 'assignee' },
    ],
  },
};

// Process each field
const encryptedRecord = {};
const hashedKeywords = {};

// 1. task_title (SHORT_TEXT) → Full Encryption (AES)
encryptedRecord.task_title = CryptoJS.AES.encrypt('Design landing page', table.config.encryptionKey).toString();
// → "U2FsdGVkX1+xyz123..."

hashedKeywords.task_title = CryptoJS.HmacSHA256('Design landing page', table.config.encryptionKey).toString();
// → "abc123def456..."

// 2. task_description (TEXT) → Full Encryption (AES)
encryptedRecord.task_description = CryptoJS.AES.encrypt('Create mockups', table.config.encryptionKey).toString();
// → "U2FsdGVkX1+abc456..."

hashedKeywords.task_description = CryptoJS.HmacSHA256('Create mockups', table.config.encryptionKey).toString();
// → "def789ghi012..."

// 3. start_date (DATE) → OPE (Order Preserving Encryption)
if (!OPEncryptor.ope) {
  OPEncryptor.ope = new OPEncryptor(table.config.encryptionKey);
}
encryptedRecord.start_date = OPEncryptor.ope.encryptStringDate('2025-11-05');
// → "encrypted_2025_11_05" (still sortable!)

hashedKeywords.start_date = CryptoJS.HmacSHA256('2025-11-05', table.config.encryptionKey).toString();
// → "jkl345mno678..."

// 4. matrix_quadrant (SELECT_ONE) → Hash Only
encryptedRecord.matrix_quadrant = CryptoJS.HmacSHA256('q2', table.config.encryptionKey).toString();
// → "8f3c2b4e9d7a..." (THIS IS THE HASH!)

hashedKeywords.matrix_quadrant = encryptedRecord.matrix_quadrant;
// → Same value! (Vì nó chỉ hash, không encrypt)

// 5. status (SELECT_ONE) → Hash Only
encryptedRecord.status = CryptoJS.HmacSHA256('in_progress', table.config.encryptionKey).toString();
// → "pqr901stu234..."

hashedKeywords.status = encryptedRecord.status;
// → Same value!

// 6. assignee (SELECT_ONE_WORKSPACE_USER) → No Encryption
encryptedRecord.assignee = 'user_123'; // Original value
// No hash needed (references không hash)
```

### 6.3. API Request

```json
POST /api/workspace/{id}/workflow/post/active_tables/{tableId}/records

{
  "record": {
    "task_title": "U2FsdGVkX1+xyz123...",           // AES encrypted
    "task_description": "U2FsdGVkX1+abc456...",     // AES encrypted
    "start_date": "encrypted_2025_11_05",           // OPE encrypted
    "matrix_quadrant": "8f3c2b4e9d7a...",           // HMAC-SHA256 hash
    "status": "pqr901stu234...",                    // HMAC-SHA256 hash
    "assignee": "user_123"                          // Plain text
  },
  "record_hashes": {
    "task_title": "abc123def456...",
    "task_description": "def789ghi012...",
    "start_date": "jkl345mno678...",
    "matrix_quadrant": "8f3c2b4e9d7a...",          // Same as record!
    "status": "pqr901stu234..."                    // Same as record!
  }
}
```

### 6.4. Database Storage

```javascript
// records table
{
  id: "record_808912345678901234",
  record: {
    task_title: "U2FsdGVkX1+xyz123...",           // Encrypted (can't search)
    task_description: "U2FsdGVkX1+abc456...",     // Encrypted (can't search)
    start_date: "encrypted_2025_11_05",           // OPE (can compare)
    matrix_quadrant: "8f3c2b4e9d7a...",           // Hash (can search!)
    status: "pqr901stu234...",                    // Hash (can search!)
    assignee: "user_123"                          // Plain (can search)
  }
}

// search_index table (for fast full-text search)
{
  record_id: "record_808912345678901234",
  hashes: [
    { field: "task_title", hash: "abc123def456..." },
    { field: "task_description", hash: "def789ghi012..." },
    { field: "start_date", hash: "jkl345mno678..." },
    { field: "matrix_quadrant", hash: "8f3c2b4e9d7a..." },
    { field: "status", hash: "pqr901stu234..." }
  ]
}
```

---

## 7. SEARCH/FILTER FLOW

### 7.1. Scenario: User Filters "Matrix Quadrant = Q2"

```javascript
// CLIENT-SIDE
// Step 1: User selects filter
const filterValue = 'q2';

// Step 2: Client tính hash
const encryptionKey = localStorage.getItem('encryption_key');
const filterHash = CryptoJS.HmacSHA256(filterValue, encryptionKey).toString();
// → "8f3c2b4e9d7a..."

// Step 3: Send to server
const request = {
  filtering: {
    record: {
      matrix_quadrant: filterHash, // ← Hash, not "q2"!
    },
  },
};

fetch('/api/.../records', {
  method: 'POST',
  body: JSON.stringify(request),
});
```

```sql
-- SERVER-SIDE
-- Step 4: Database query
SELECT * FROM records
WHERE record->>'matrix_quadrant' = '8f3c2b4e9d7a...';

-- OR using search index (faster)
SELECT r.* FROM records r
JOIN search_index si ON si.record_id = r.id
WHERE si.field = 'matrix_quadrant'
  AND si.hash = '8f3c2b4e9d7a...';
```

```javascript
// CLIENT-SIDE (After response)
// Step 5: Decrypt results
const records = response.data.map((record) => ({
  ...record,
  record: {
    ...record.record,
    task_title: CryptoJS.AES.decrypt(record.record.task_title, encryptionKey).toString(CryptoJS.enc.Utf8),
    // "Design landing page"

    matrix_quadrant: decryptSelectValue(record.record.matrix_quadrant, field.options, encryptionKey),
    // "q2" (by matching hash with options)
  },
}));
```

### 7.2. Decrypt SELECT_ONE Value

```javascript
// Function to decrypt SELECT_ONE/SELECT_LIST
function decryptSelectValue(hashedValue, options, encryptionKey) {
  // Try each option until find match
  for (const option of options) {
    const optionHash = CryptoJS.HmacSHA256(option.value, encryptionKey).toString();

    if (optionHash === hashedValue) {
      return option.value; // Found!
    }
  }

  return hashedValue; // Not found, return as-is
}

// Example
const options = [
  { value: 'q1', text: 'Q1' },
  { value: 'q2', text: 'Q2' }, // ← This will match!
  { value: 'q3', text: 'Q3' },
  { value: 'q4', text: 'Q4' },
];

const result = decryptSelectValue(
  '8f3c2b4e9d7a...', // Hashed "q2"
  options,
  'my_secret_key_12345',
);
// → "q2"
```

---

## 8. TẠI SAO HASH CHỨ KHÔNG ENCRYPT CHO SELECT FIELDS?

### 8.1. So Sánh

| Aspect           | Hash (Current)      | Full Encryption (Alternative) |
| ---------------- | ------------------- | ----------------------------- |
| **Storage**      | 64 chars (SHA256)   | Variable length               |
| **Speed**        | ⚡ Fast             | 🐢 Slower                     |
| **Search**       | ✅ Exact match only | ❌ Cannot search              |
| **Decrypt**      | ✅ Try all options  | ❌ Need key                   |
| **Security**     | ✅ Good (with HMAC) | ✅ Better                     |
| **Practicality** | ✅ Very practical   | ⚠️ Overkill                   |

### 8.2. Why Hash is Good for SELECT Fields?

```javascript
// SELECT_ONE has limited, known values
const options = ['q1', 'q2', 'q3', 'q4']; // Only 4 values!

// Hash is sufficient because:
// ✅ Values are from fixed set (not user input)
// ✅ Fast to compute
// ✅ Fast to search
// ✅ Deterministic (same input = same hash)
// ✅ Can decrypt by trying all options (only 4!)

// Full encryption would be overkill:
// ❌ Slower
// ❌ Harder to search
// ❌ More storage
// ❌ Same security (with HMAC)
```

---

## 9. KẾT LUẬN

### 9.1. Tóm Tắt

**Request Body**:

```json
{
  "record": {
    "matrix_quadrant": "8f3c2b4e9d7a..." // ← HMAC-SHA256 hash of "q2"
  },
  "record_hashes": {
    "matrix_quadrant": "8f3c2b4e9d7a..." // ← Same hash (for search index)
  }
}
```

**Tại sao giống nhau?**

- `SELECT_ONE` chỉ hash, không encrypt
- `record.matrix_quadrant` = hashed value (for storage)
- `record_hashes.matrix_quadrant` = same hash (for search index)

**Tại sao gửi cả 2?**

- `record`: Stored trong main table
- `record_hashes`: Indexed riêng cho fast search

### 9.2. 4 Loại Field Processing

| Field Type            | Example           | Processing  | record Value  | record_hashes Value |
| --------------------- | ----------------- | ----------- | ------------- | ------------------- |
| **encryptFields**     | SHORT_TEXT        | AES encrypt | Encrypted     | Hash of original    |
| **opeEncryptFields**  | DATE              | OPE encrypt | OPE encrypted | Hash of original    |
| **hashEncryptFields** | SELECT_ONE        | HMAC-SHA256 | Hash          | Same hash           |
| **noneEncryptFields** | SELECT_ONE_RECORD | None        | Original      | Not included        |

### 9.3. Key Benefits

**🔐 Security**:

- Server không có encryption key
- Data encrypted at rest
- Cannot reverse engineer

**⚡ Performance**:

- Fast search on hashed fields
- Deterministic hashing
- Indexed for speed

**🎯 Functionality**:

- Exact match search
- Filter và sort
- Aggregate queries

**🔄 Flexibility**:

- Client-side encryption
- Zero-knowledge architecture
- User controls keys

---

## 10. CODE FLOW DIAGRAM

```
┌──────────────────────────────────────────────────────────────┐
│                    USER CREATES RECORD                        │
│                                                               │
│  matrix_quadrant: "q2" (User selects from dropdown)          │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│                CLIENT-SIDE PROCESSING                         │
│                                                               │
│  1. Get encryption key from localStorage                     │
│     → "my_secret_key_12345"                                  │
│                                                               │
│  2. Check field type: SELECT_ONE                             │
│     → Found in hashEncryptFields()                           │
│                                                               │
│  3. Hash value with HMAC-SHA256                              │
│     → hash("q2", "my_secret_key_12345")                      │
│     → "8f3c2b4e9d7a1f6e5c8b2a3d..."                          │
│                                                               │
│  4. Build request:                                            │
│     {                                                         │
│       "record": {                                             │
│         "matrix_quadrant": "8f3c2b4e..."                     │
│       },                                                      │
│       "record_hashes": {                                      │
│         "matrix_quadrant": "8f3c2b4e..."                     │
│       }                                                       │
│     }                                                         │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│                    API REQUEST (HTTPS)                        │
│                                                               │
│  POST /api/.../records                                        │
│  Body: { record: {...}, record_hashes: {...} }              │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│                    SERVER PROCESSING                          │
│                                                               │
│  1. Validate request                                          │
│  2. Store in records table:                                   │
│     - matrix_quadrant = "8f3c2b4e..."                        │
│  3. Index in search_index table:                             │
│     - field = "matrix_quadrant"                              │
│     - hash = "8f3c2b4e..."                                   │
│  4. Return success                                            │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│                    DATABASE STORAGE                           │
│                                                               │
│  records:                                                     │
│    id: "record_001"                                           │
│    record: { matrix_quadrant: "8f3c2b4e..." }               │
│                                                               │
│  search_index:                                                │
│    record_id: "record_001"                                    │
│    field: "matrix_quadrant"                                   │
│    hash: "8f3c2b4e..."                                       │
└───────────────────────────────────────────────────────────────┘


┌──────────────────────────────────────────────────────────────┐
│                USER SEARCHES "Q2"                             │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│                CLIENT-SIDE SEARCH                             │
│                                                               │
│  1. User selects filter: "q2"                                │
│  2. Hash search term: hash("q2", key) = "8f3c2b4e..."       │
│  3. Send to server: filtering: { matrix_quadrant: "8f..." } │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│                SERVER SEARCH QUERY                            │
│                                                               │
│  SELECT * FROM records r                                      │
│  JOIN search_index si ON si.record_id = r.id                │
│  WHERE si.field = 'matrix_quadrant'                          │
│    AND si.hash = '8f3c2b4e...'                               │
│                                                               │
│  → Found record_001!                                          │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│                CLIENT-SIDE DECRYPT                            │
│                                                               │
│  1. Receive: { matrix_quadrant: "8f3c2b4e..." }             │
│  2. Try each option:                                          │
│     - hash("q1", key) = "abc123..." ❌                       │
│     - hash("q2", key) = "8f3c2b4e..." ✅ MATCH!             │
│  3. Display to user: "Q2"                                     │
└───────────────────────────────────────────────────────────────┘
```

---

## TÓM TẮT NHANH 🎯

**1. `hashed_keywords` là gì?**
→ HMAC-SHA256 hash của field value với encryption key

**2. Tại sao gửi?**
→ Server cần search/filter nhưng KHÔNG CÓ encryption key

**3. Tại sao hash chứ không encrypt cho SELECT fields?**
→ Faster, simpler, đủ an toàn (fixed options)

**4. `record` và `record_hashes` khác nhau như thế nào?**
→ Với SELECT fields: GIỐNG NHAU (cả 2 đều là hash)
→ Với TEXT fields: KHÁC NHAU (encrypted vs hash)

**5. Có thể bỏ `record_hashes` không?**
→ KHÔNG! Server cần để index và search

---

**Document Created**: 04/11/2025  
**Author**: Business Analyst  
**Status**: ✅ Complete
