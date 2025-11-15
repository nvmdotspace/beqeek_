# Hashed Keywords Analysis - Active Tables

## Tổng Quan

`hashed_keywords` là một phần quan trọng trong payload khi tạo/cập nhật record, được sử dụng cho **full-text search** trên dữ liệu đã mã hóa.

## Logic trong Source Code Cũ (Blade.php)

### 1. Nguồn Gốc: Table Config

`hashedKeywordFields` được định nghĩa trong **table configuration** (không phải runtime):

```javascript
// Ví dụ: Eisenhower Matrix Table
{
  "config": {
    "hashedKeywordFields": [
      "task_title",
      "task_description"
    ],
    // ... other config
  }
}
```

**Vị trí trong code:**

- File: `docs/html-module/active-tables.blade.php`
- Được define trong mỗi table template
- Là array chứa tên các field cần index cho full-text search

**Ví dụ từ các table templates:**

```javascript
// Job Title table
"hashedKeywordFields": [
  "job_title_name",
  "job_title_code"
]

// Policy table
"hashedKeywordFields": [
  "policy_code",
  "policy_name"
]

// Request table
"hashedKeywordFields": [
  "request_title"
]

// Blank table
"hashedKeywordFields": []
```

### 2. Logic Xử Lý (Create/Update Record)

**File:** `docs/html-module/active-table-records.blade.php:3117-3164`

```javascript
static async saveRecord() {
  const fields = States.currentTable?.config?.fields || [];
  const hashedKeywordFields = States.currentTable?.config?.hashedKeywordFields || [];
  const data = {};
  const hashedKeywords = {};

  fields.forEach(field => {
    // ... collect form data into data[field.name]

    // Generate hashed keywords for eligible fields
    if (hashedKeywordFields.includes(field.name) &&
        CommonUtils.encryptFields().includes(field.type)) {
      hashedKeywords[field.name] = CommonUtils.hashKeyword(
        data[field.name],
        States.currentTable?.config?.encryptionKey
      );
    }
  });

  // Send to API
  await TableAPI.createRecord(States.currentTable, {
    record: data,
    hashed_keywords: hashedKeywords
  });
}
```

### 3. Điều Kiện Thêm vào Hashed Keywords

Một field CHỈ được thêm vào `hashed_keywords` khi thỏa **CẢ HAI** điều kiện:

1. **Field name** nằm trong `hashedKeywordFields` config
2. **Field type** thuộc nhóm `encryptFields()` (text fields)

```javascript
// CommonUtils.encryptFields() - Line 7001
static encryptFields() {
  return ['SHORT_TEXT', 'TEXT', 'RICH_TEXT', 'EMAIL', 'URL'];
}
```

**❌ KHÔNG bao gồm:**

- `SELECT_ONE`, `SELECT_LIST`
- `CHECKBOX_YES_NO`, `CHECKBOX_LIST`
- `INTEGER`, `NUMERIC`
- `DATE`, `DATETIME`, `TIME`
- Reference fields (`SELECT_ONE_RECORD`, etc.)

### 4. Cách Hoạt Động

**Tokenization & Hashing:**

```javascript
// CommonUtils.hashKeyword() tokenizes text and hashes each token
hashKeyword('Task về meeting khách hàng', encryptionKey);
// Returns: ["hash1", "hash2", "hash3", "hash4", "hash5"]
```

**Ví dụ Request Payload:**

```json
{
  "record": {
    "task_title": "encrypted_base64_string",
    "task_description": "encrypted_base64_string",
    "status": "hash_value"
  },
  "hashed_keywords": {
    "task_title": ["token1_hash", "token2_hash", "token3_hash"],
    "task_description": ["token1_hash", "token2_hash", ...]
  },
  "record_hashes": {
    "task_title": "hmac_hash",
    "task_description": "hmac_hash",
    "status": "hmac_hash"
  }
}
```

## Vấn Đề Phát Hiện

### Request từ docs/req/create-record.js (SAI)

Request này chứa SELECT fields trong hashed_keywords - **KHÔNG ĐÚNG**:

```json
"hashed_keywords": {
  "task_title": [...],
  "task_description": [...],
  "matrix_quadrant": "hash_value",  // ← SAI! SELECT_ONE không được có
  "status": "hash_value",            // ← SAI! SELECT_ONE không được có
  "color_tag": ["hash_value"]        // ← SAI! SELECT_LIST không được có
}
```

**Nguyên nhân:** Request này từ version cũ hơn hoặc implementation sai đã bị fix.

### React Code Ban Đầu (SAI)

```typescript
// ❌ SAI - đang thêm SELECT fields vào hashed_keywords
if (CommonUtils.hashEncryptFields().includes(field.type)) {
  payload.hashed_keywords![fieldName] = encryptedValue;
}
```

## Logic ĐÚNG cho React Code

### Đã Fix trong use-create-record.ts

```typescript
// ✅ ĐÚNG - chỉ thêm text fields có trong hashedKeywordFields
const hashedKeywordFields = table.config.hashedKeywordFields || [];

fields.forEach((field: FieldConfig) => {
  const fieldName = field.name;
  const value = record[fieldName];

  if (value === undefined || value === null || value === '') {
    return;
  }

  // Encrypt field
  const encryptedValue = CommonUtils.encryptTableData(tableDetail, fieldName, value);
  payload.record[fieldName] = encryptedValue;

  // Generate hashed_keywords ONLY for text fields in hashedKeywordFields
  if (hashedKeywordFields.includes(fieldName) && CommonUtils.encryptFields().includes(field.type)) {
    payload.hashed_keywords![fieldName] = CommonUtils.hashKeyword(value as string, encryptionKey);
  }
});
```

## So Sánh Request Đúng vs Sai

### ✅ Request ĐÚNG (Blade.php)

```json
{
  "record": {
    "task_title": "PDVEnhQ/YhnvUAsEqeYuneFneKLcxIwDLCP1emT2/ss=",
    "task_description": "9Z6VTQofh7EKJWdRfxf8PxV8W3hL48ZQ...",
    "matrix_quadrant": "c420071e207dc0e0b534e51ee23322a19fdc9d3a20e50e82cab7af7cbea927e6",
    "status": "20bc534fb1cdf23178878ddbf795f550f76eb149475ec0b6d3eea85194c81322"
  },
  "hashed_keywords": {
    "task_title": ["hash1", "hash2", "hash3"],
    "task_description": ["hash1", "hash2", ...]
    // ← CHỈ có text fields
  }
}
```

### ❌ Request SAI (docs/req/create-record.js)

```json
{
  "record": { ... },
  "hashed_keywords": {
    "task_title": [...],
    "task_description": [...],
    "matrix_quadrant": "hash",  // ← SAI!
    "status": "hash",            // ← SAI!
    "color_tag": ["hash"]        // ← SAI!
  }
}
```

## Tại Sao SELECT Fields KHÔNG Có trong Hashed Keywords?

### 1. SELECT fields đã được hash trong `record`

```javascript
// SELECT_ONE/SELECT_LIST được mã hóa bằng HMAC-SHA256
CommonUtils.encryptTableData(table, 'status', 'done');
// Returns: "hash_of_done"
```

### 2. Server có thể so sánh trực tiếp

Khi filter:

```javascript
// Client gửi
filtering: {
  status: 'hash_of_done';
}

// Server so sánh
record.status === 'hash_of_done'; // exact match
```

### 3. Text fields cần tokenization

```javascript
// Text field cần tách từ để search
"Task về meeting khách hàng"
→ ["task", "về", "meeting", "khách", "hàng"]
→ [hash1, hash2, hash3, hash4, hash5]

// Server có thể search partial: "meeting"
→ hash3 có trong hashed_keywords.task_title
```

## Quy Tắc Sử Dụng

### Khi Nào Thêm Field vào hashedKeywordFields?

✅ **NÊN thêm:**

- Text fields cần full-text search (SHORT_TEXT, TEXT, RICH_TEXT)
- Ví dụ: task_title, task_description, policy_name, request_title

❌ **KHÔNG thêm:**

- SELECT_ONE, SELECT_LIST (đã hash trong record)
- CHECKBOX fields (đã hash trong record)
- Number fields (dùng OPE encryption)
- Date fields (dùng OPE encryption)
- Reference fields (không encrypt)

### Performance Considerations

**Lưu ý:** Mỗi field trong `hashedKeywordFields` sẽ:

1. Tăng kích thước payload (array of token hashes)
2. Tăng thời gian xử lý (tokenization + hashing)
3. Tăng storage trên server

→ Chỉ thêm các field **thực sự cần** full-text search!

## Checklist Khi Tạo Table Template Mới

- [ ] Xác định fields nào cần full-text search
- [ ] Chỉ thêm TEXT fields vào `hashedKeywordFields`
- [ ] KHÔNG thêm SELECT/CHECKBOX/NUMBER/DATE fields
- [ ] Test search functionality trên frontend
- [ ] Verify payload size hợp lý

## References

- Source cũ: `docs/html-module/active-table-records.blade.php:3117-3164`
- React implementation: `apps/web/src/features/active-tables/hooks/use-create-record.ts:163-187`
- Encryption utilities: `packages/encryption-core/src/common-utils.ts`
- Table templates: `docs/html-module/active-tables.blade.php`
