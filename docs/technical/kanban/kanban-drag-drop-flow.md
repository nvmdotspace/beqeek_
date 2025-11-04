# Phân tích Luồng Drag & Drop Kanban Board

## Tổng quan

Tài liệu này phân tích chi tiết luồng kéo-thả (drag & drop) card trong Kanban Board của Active Tables, đặc biệt tập trung vào cách tạo request payload khi gọi API cập nhật record.

## Kiến trúc tổng quan

```
User drags card → Drop event → Validate change → Prepare data → Encrypt fields → Hash fields → API call
```

## Chi tiết luồng xử lý

### 1. Khởi tạo Drag & Drop (`initDragAndDrop()`)

**Location**: `KanbanView.initDragAndDrop()` (line ~5030)

Phương thức này thiết lập các event listeners cho drag & drop:

```javascript
static initDragAndDrop() {
    const { currentKanbanConfig } = this.states();

    const columns = document.querySelectorAll('.kanban-column');
    columns.forEach(column => {
        // Event: Khi kéo card qua column
        column.addEventListener('dragover', e => {
            e.preventDefault();
            column.style.background = '#e5e7eb'; // Highlight column
        });

        // Event: Khi rời khỏi column
        column.addEventListener('dragleave', () => {
            column.style.background = ''; // Reset highlight
        });

        // Event: Khi thả card vào column
        column.addEventListener('drop', async e => {
            // ... xử lý logic drop
        });
    });

    // Thiết lập draggable cho cards
    const cards = document.querySelectorAll('.kanban-card');
    cards.forEach(card => {
        card.addEventListener('dragstart', e => {
            e.dataTransfer.setData('text/plain', card.dataset.recordId);
            card.classList.add('dragging');
        });

        card.addEventListener('dragend', () => {
            card.classList.remove('dragging');
        });
    });
}
```

### 2. Xử lý Drop Event

Khi user thả card vào column mới:

```javascript
column.addEventListener('drop', async (e) => {
  e.preventDefault();
  column.style.background = '';

  // Lấy record ID từ dataTransfer
  const recordId = e.dataTransfer.getData('text/plain');

  // Lấy status mới từ data attribute của column
  const newStatus = column.dataset.status;

  const card = document.querySelector(`.kanban-card[data-record-id="${recordId}"]`);
  const currentStatus = card.closest('.kanban-column').dataset.status;

  // Validation: Nếu thả trong cùng column, huỷ thao tác
  if (currentStatus === newStatus) {
    console.log('Thả trong cùng cột, huỷ thao tác.');
    return;
  }

  // Di chuyển card DOM sang column mới
  const columnContent = column.querySelector('.kanban-column-content');
  if (card) {
    card.classList.add('dragging');
    columnContent.appendChild(card);

    try {
      // Chuẩn bị data để gọi API
      const hashedKeywords = {};
      const field = States.currentTable.config.fields.find((f) => f.name === currentKanbanConfig.statusField);
      const hashedKeywordFields = States.currentTable.config?.hashedKeywordFields || [];

      // Hash keywords nếu field yêu cầu
      if (hashedKeywordFields.includes(field.name) && CommonUtils.encryptFields().includes(field.type)) {
        hashedKeywords[field.name] = CommonUtils.hashKeyword(newStatus, States.currentTable?.config?.encryptionKey);
      }

      const data = {
        record: { [currentKanbanConfig.statusField]: newStatus },
        hashed_keywords: hashedKeywords,
      };

      // Gọi API để cập nhật record
      await TableAPI.updateRecord(States.currentTable, recordId, data);
      CommonUtils.showMessage('Cập nhật trạng thái thành công.', true);
    } catch (error) {
      CommonUtils.showMessage(`Lỗi khi cập nhật trạng thái: ${error.message}`, false);
      card.remove();
      await this.renderKanbanBoard(); // Rollback UI
    } finally {
      card.classList.remove('dragging');
    }
  }
});
```

### 3. API Update Record (`TableAPI.updateRecord()`)

**Location**: `TableAPI.updateRecord()` (line ~1747)

Phương thức này xử lý mã hóa và hash dữ liệu trước khi gọi API:

```javascript
static async updateRecord(table, recordId, data) {
    const encryptionKey = table?.config?.encryptionKey || '';
    const fields = table?.config?.fields || [];

    // Clone data để không thay đổi input
    const encryptedData = { ...data, record: { ...data.record } };

    // Bước 1: Mã hóa từng field trong record
    fields.forEach(field => {
        if(data.record[field.name]) {
            encryptedData.record[field.name] = CommonUtils.encryptTableData(
                table,
                field.name,
                data.record[field.name]
            );
        }
    });

    // Bước 2: Tạo record_hashes cho tất cả fields
    if(encryptedData.record) {
        encryptedData.record_hashes = CommonUtils.hashRecordData(
            fields,
            data.record,  // Sử dụng data gốc (chưa mã hóa)
            encryptionKey
        );
    }

    // Bước 3: Gọi API
    const response = await CommonUtils.apiCall(
        `${API_PREFIX}/patch/active_tables/${table.id}/records/${recordId}`,
        encryptedData
    );

    return { message: response.message };
}
```

### 4. Encryption Logic (`CommonUtils.encryptTableData()`)

**Location**: `CommonUtils.encryptTableData()` (line ~1267)

Mã hóa field value dựa trên loại field:

```javascript
static encryptTableData(table, fieldName, value) {
    if (!fieldName || !value) return value;

    const field = table.config.fields.find(f => f.name === fieldName);
    const encryptionKey = table.config.encryptionKey;

    // SELECT_ONE, SELECT_LIST: HMAC-SHA256
    if (CommonUtils.hashEncryptFields().includes(field.type) &&
        ['CHECKBOX_LIST', 'SELECT_LIST'].includes(field.type) && value) {
        return value.map(v =>
            CryptoJS.HmacSHA256(v, encryptionKey).toString(CryptoJS.enc.Hex)
        );
    }
    else if (CommonUtils.hashEncryptFields().includes(field.type) && value) {
        return CryptoJS.HmacSHA256(value, encryptionKey).toString(CryptoJS.enc.Hex);
    }

    // SHORT_TEXT, RICH_TEXT, TEXT, EMAIL, URL: AES-256-CBC
    else if (CommonUtils.encryptFields().includes(field.type) && value) {
        return CommonUtils.encryptData(value, encryptionKey);
    }

    // INTEGER, NUMERIC, DATE, DATETIME: OPE (Order-Preserving Encryption)
    else if (CommonUtils.opeEncryptFields().includes(field.type) && value) {
        if(!OPEncryptor.ope) {
            OPEncryptor.ope = new OPEncryptor(encryptionKey);
        }

        if (['DATE'].includes(field.type)) {
            return OPEncryptor.ope.encryptStringDate(value);
        } else if (['DATETIME'].includes(field.type)) {
            return OPEncryptor.ope.encryptStringDatetime(value);
        } else if (field.type === 'NUMERIC') {
            return OPEncryptor.ope.encryptDecimal(value);
        } else {
            return OPEncryptor.ope.encryptInt(value);
        }
    }

    // SELECT_ONE_RECORD, SELECT_LIST_RECORD, SELECT_ONE_WORKSPACE_USER, etc: Không mã hóa
    else {
        return value;
    }
}
```

**Phân loại field types**:

```javascript
// Hash-based encryption (HMAC-SHA256)
static hashEncryptFields() {
    return ['CHECKBOX_YES_NO', 'CHECKBOX_ONE', 'CHECKBOX_LIST', 'SELECT_ONE', 'SELECT_LIST'];
}

// Symmetric encryption (AES-256-CBC)
static encryptFields() {
    return ['SHORT_TEXT', 'RICH_TEXT', 'TEXT', 'EMAIL', 'URL'];
}

// Order-preserving encryption (OPE)
static opeEncryptFields() {
    return ['YEAR', 'MONTH', 'DAY', 'HOUR', 'MINUTE', 'SECOND', 'DATE', 'DATETIME', 'TIME', 'INTEGER', 'NUMERIC'];
}

// Không mã hóa (reference fields)
static noneEncryptFields() {
    return ['SELECT_ONE_RECORD', 'SELECT_LIST_RECORD', 'SELECT_ONE_WORKSPACE_USER', 'SELECT_LIST_WORKSPACE_USER'];
}
```

### 5. Hashing Logic (`CommonUtils.hashRecordData()`)

**Location**: `CommonUtils.hashRecordData()` (line ~1298)

Tạo hash cho tất cả fields để server có thể index/search:

```javascript
static hashRecordData(fields, record, tableKey) {
    if (!fields || !record || !tableKey) {
        return {};
    }

    const hashedData = {};

    fields.forEach(field => {
        const fieldName = field.name;
        const fieldType = field.type;

        if (record.hasOwnProperty(fieldName)) {
            const fieldValue = record[fieldName];

            // Array fields: Hash từng item
            if (Array.isArray(fieldValue) &&
                ['CHECKBOX_LIST', 'SELECT_LIST'].includes(fieldType)) {
                hashedData[fieldName] = fieldValue.map(item =>
                    CryptoJS.HmacSHA256(item, tableKey).toString(CryptoJS.enc.Hex)
                );
            }
            // Single value fields: Hash giá trị
            else {
                hashedData[fieldName] = CryptoJS.HmacSHA256(
                    fieldValue,
                    tableKey
                ).toString(CryptoJS.enc.Hex);
            }
        }
    });

    return hashedData;
}
```

## Ví dụ cụ thể

### Case Study: Drag card từ "Doing" sang "Done"

**Giả sử**:

- Field name: `matrix_quadrant` (type: `SELECT_ONE`)
- Table encryption key: `my-secret-encryption-key-32char`
- Record ID: `806164958264950785`
- New status value: `done`

**Bước 1: Chuẩn bị data ban đầu**

```javascript
const data = {
  record: { matrix_quadrant: 'done' },
  hashed_keywords: {},
};
```

**Bước 2: Encrypt field value (SELECT_ONE → HMAC-SHA256)**

```javascript
const encryptedValue = CryptoJS.HmacSHA256('done', 'my-secret-encryption-key-32char').toString(CryptoJS.enc.Hex);
// Result: "d96ba1768a0f22f6e67f1251b737dec232427c2dacd926694ad799fcf2dce018"

encryptedData.record = {
  matrix_quadrant: 'd96ba1768a0f22f6e67f1251b737dec232427c2dacd926694ad799fcf2dce018',
};
```

**Bước 3: Hash toàn bộ record**

```javascript
const recordHashes = CommonUtils.hashRecordData(fields, data.record, encryptionKey);
// Result: {
//     matrix_quadrant: "d96ba1768a0f22f6e67f1251b737dec232427c2dacd926694ad799fcf2dce018"
// }

encryptedData.record_hashes = recordHashes;
```

**Bước 4: Final payload**

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

**Giải thích**:

- `record.matrix_quadrant`: Giá trị đã mã hóa, được lưu vào database
- `record_hashes.matrix_quadrant`: Hash của giá trị gốc, dùng để index/search
- Với field `SELECT_ONE`, cả 2 giá trị giống nhau vì cùng dùng HMAC-SHA256

### Case Study 2: Text field (AES-256-CBC)

**Giả sử**:

- Field name: `title` (type: `SHORT_TEXT`)
- Value: `"My Task Title"`

**Encryption process**:

```javascript
// Bước 1: Encrypt với AES-256-CBC
const encryptedValue = CommonUtils.encryptData('My Task Title', encryptionKey);
// Result: "IV+ciphertext" (base64 encoded)
// Example: "xJ9fK2l...encrypted...data"

// Bước 2: Hash cho record_hashes
const hashedValue = CryptoJS.HmacSHA256('My Task Title', encryptionKey).toString(CryptoJS.enc.Hex);
// Result: "a3f8b2c...hash..."
```

**Final payload**:

```json
{
  "record": {
    "title": "xJ9fK2l...encrypted...data"
  },
  "hashed_keywords": {},
  "record_hashes": {
    "title": "a3f8b2c...hash..."
  }
}
```

**Lưu ý**: Với text fields, `record[field]` và `record_hashes[field]` **khác nhau**:

- `record[field]`: AES-256-CBC encrypted (có thể decrypt)
- `record_hashes[field]`: HMAC-SHA256 hash (không thể decrypt, chỉ để search)

### Case Study 3: Numeric field (OPE)

**Giả sử**:

- Field name: `budget` (type: `NUMERIC`)
- Value: `1500.50`

**Encryption process**:

```javascript
// Bước 1: Encrypt với OPE
const ope = new OPEncryptor(encryptionKey);
const encryptedValue = ope.encryptDecimal(1500.5);
// Result: OPE encrypted value (still sortable/comparable)
// Example: "encrypted_numeric_representation"

// Bước 2: Hash cho record_hashes
const hashedValue = CryptoJS.HmacSHA256('1500.50', encryptionKey).toString(CryptoJS.enc.Hex);
```

**Final payload**:

```json
{
  "record": {
    "budget": "encrypted_numeric_representation"
  },
  "hashed_keywords": {},
  "record_hashes": {
    "budget": "hash_of_original_value"
  }
}
```

## API Endpoint

### Request

```
PATCH /api/workspace/{workspaceId}/workflow/patch/active_tables/{tableId}/records/{recordId}
```

**Headers**:

```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Body**:

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

### Response

**Success (200)**:

```json
{
  "message": "Record updated successfully",
  "data": {
    "id": "806164958264950785"
  }
}
```

**Error (400/500)**:

```json
{
  "message": "Error message",
  "errors": {}
}
```

## Encryption Methods Summary

| Field Type                              | Encryption Method | Reversible | Use Case                  |
| --------------------------------------- | ----------------- | ---------- | ------------------------- |
| SELECT_ONE, SELECT_LIST                 | HMAC-SHA256       | ❌         | Equality search           |
| CHECKBOX_YES_NO, CHECKBOX_ONE           | HMAC-SHA256       | ❌         | Equality search           |
| SHORT_TEXT, RICH_TEXT, TEXT, EMAIL, URL | AES-256-CBC       | ✅         | Display to user           |
| INTEGER, NUMERIC                        | OPE               | ✅         | Range queries, sorting    |
| DATE, DATETIME, TIME                    | OPE               | ✅         | Range queries, sorting    |
| SELECT_ONE_RECORD, SELECT_LIST_RECORD   | None              | N/A        | Reference (not encrypted) |
| SELECT_ONE_WORKSPACE_USER               | None              | N/A        | Reference (not encrypted) |

## Security Considerations

### 1. Encryption Key Management

- **Lưu trữ**: Encryption key được lưu trong `localStorage` của client
- **Truyền tải**: Key **không bao giờ** được gửi lên server
- **Xác thực**: Server chỉ lưu `encryptionAuthKey` = `SHA256(SHA256(SHA256(key)))` để validate

```javascript
static hashKeyForAuth(key) {
    let hash = key;
    for (let i = 0; i < 3; i++) {
        hash = CryptoJS.SHA256(hash).toString();
    }
    return hash;
}
```

### 2. AES-256-CBC Implementation

- **IV (Initialization Vector)**: Random 16 bytes cho mỗi lần encrypt
- **Padding**: PKCS7
- **Mode**: CBC (Cipher Block Chaining)
- **IV Storage**: Gắn vào đầu ciphertext

```javascript
static encryptData(data, key) {
    const keyBytes = CryptoJS.enc.Utf8.parse(key);
    const iv = CryptoJS.lib.WordArray.random(16); // Random IV

    const encrypted = CryptoJS.AES.encrypt(data, keyBytes, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    });

    // Gắn IV vào đầu ciphertext
    const encryptedBase64 = CryptoJS.enc.Base64.stringify(
        iv.concat(encrypted.ciphertext)
    );

    return encryptedBase64;
}
```

### 3. HMAC-SHA256 for Hashing

- **Purpose**:
  - Equality search trong database
  - Keyword indexing
  - Privacy-preserving search
- **Key**: Table encryption key
- **Output**: 64 character hex string

### 4. OPE (Order-Preserving Encryption)

- **Purpose**: Cho phép range queries và sorting trên encrypted data
- **Implementation**: Custom OPE algorithm trong `OPEncryptor` class
- **Security**: Trade-off giữa functionality (sorting) và security

## Error Handling

### Client-side Validation

```javascript
// Check encryption key exists
if (!encryptionKey) {
  throw new Error('Table chưa được thiết lập khoá mã hoá');
}

// Validate encryption key with auth key
if (encryptionAuthKey !== CommonUtils.hashKeyForAuth(encryptionKey)) {
  throw new Error('Khoá mã hoá không hợp lệ');
}

// Validate status change
if (currentStatus === newStatus) {
  console.log('Thả trong cùng cột, huỷ thao tác.');
  return;
}
```

### Error Recovery

```javascript
try {
  await TableAPI.updateRecord(States.currentTable, recordId, data);
  CommonUtils.showMessage('Cập nhật trạng thái thành công.', true);
} catch (error) {
  // Rollback UI changes
  CommonUtils.showMessage(`Lỗi: ${error.message}`, false);
  card.remove();
  await this.renderKanbanBoard(); // Re-render from server state
}
```

## Performance Considerations

### 1. Batch Operations

Khi load nhiều records, encryption/decryption được thực hiện song song:

```javascript
const kanbanRecords = Object.fromEntries(
    await Promise.all(
        statusOptions.map(async (option) => {
            const response = await RecordView.fetchRecords(...);
            // Encrypt/decrypt parallel
            return [option.value, response];
        })
    )
);
```

### 2. Caching

- **Reference records**: Cache trong memory để tránh fetch lại
- **User records**: Lưu trong `localStorage`, refresh mỗi 24h
- **Table details**: Cache trong `States.currentTable`

### 3. Lazy Loading

```javascript
static async loadMore(status) {
    const { kanbanRecords } = this.states();
    const response = await RecordView.fetchRecords(
        States.currentTable,
        filters,
        kanbanRecords[status].nextPageId, // Cursor-based pagination
        direction,
        limit
    );
    // Append to existing records
}
```

## Testing Scenarios

### Test Case 1: Drag trong cùng column

- **Expected**: Không gọi API, không có thay đổi

### Test Case 2: Drag sang column mới

- **Expected**:
  - Card di chuyển sang column mới
  - API được gọi với payload đúng
  - Toast message thành công

### Test Case 3: API call failed

- **Expected**:
  - Card được remove khỏi DOM
  - Kanban board re-render từ server state
  - Toast message lỗi

### Test Case 4: Invalid encryption key

- **Expected**:
  - Không cho phép drag
  - Hiển thị warning message

## Related Files

- `active-table-records.blade.php`: Main implementation
- `apps/web/src/features/active-tables/`: React implementation (tương tự logic)
- `packages/active-tables-core/`: Core logic reusable
- `packages/encryption-core/`: Encryption utilities

## Migration Notes

Khi migrate từ PHP blade template sang React:

1. **State management**: Blade dùng global `States`, React nên dùng Zustand
2. **Drag & drop library**: Consider dùng `@dnd-kit/core` thay vì vanilla JS
3. **Encryption**: Reuse `@workspace/encryption-core` package
4. **API client**: Dùng `@/shared/api/active-tables-client.ts`

## References

- [Crypto-JS Documentation](https://github.com/brix/crypto-js)
- [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
- [HMAC-SHA256](https://en.wikipedia.org/wiki/HMAC)
- [Order-Preserving Encryption](https://en.wikipedia.org/wiki/Order-preserving_encryption)

---

**Last Updated**: 2025-11-03  
**Author**: Analysis based on `active-table-records.blade.php`
