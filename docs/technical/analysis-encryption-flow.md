# Phân tích Luồng Mã Hóa Active Table Records

## Tổng Quan

Hệ thống Active Tables sử dụng **hai cơ chế mã hóa song song**:

1. **E2EE (End-to-End Encryption)**: Key lưu ở client, không bao giờ gửi lên server
2. **Server-Side Encryption**: Key lưu và quản lý bởi server

## 1. Kiến Trúc Mã Hóa

### 1.1. Cấu Trúc Key Management

```javascript
// Table Config Structure
{
  config: {
    e2eeEncryption: boolean,        // Bật/tắt E2EE
    encryptionAuthKey: string,      // SHA256 hash của encryption key (lưu server)
    encryptionKey: string           // 32-character key (CHỈ LƯU CLIENT)
  }
}
```

### 1.2. Phân Loại Field Types Theo Phương Thức Mã Hóa

Hệ thống phân chia fields thành 4 nhóm dựa trên phương thức mã hóa:

#### **A. AES-256-CBC Encryption** (encryptFields)

- **Field Types**: `SHORT_TEXT`, `RICH_TEXT`, `TEXT`, `EMAIL`, `URL`
- **Thuật toán**: AES-256-CBC với IV ngẫu nhiên 16 bytes
- **Đặc điểm**:
  - IV được gắn vào đầu ciphertext
  - Output: Base64(IV + Ciphertext)
  - Hỗ trợ operators: `eq`, `ne`

```javascript
static encryptData(data, key) {
    const keyBytes = CryptoJS.enc.Utf8.parse(key);
    const iv = CryptoJS.lib.WordArray.random(16);
    const encrypted = CryptoJS.AES.encrypt(data, keyBytes, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    });
    return CryptoJS.enc.Base64.stringify(iv.concat(encrypted.ciphertext));
}
```

#### **B. OPE (Order-Preserving Encryption)** (opeEncryptFields)

- **Field Types**: `YEAR`, `MONTH`, `DAY`, `HOUR`, `MINUTE`, `SECOND`, `DATE`, `DATETIME`, `TIME`, `INTEGER`, `NUMERIC`
- **Mục đích**: Cho phép so sánh thứ tự trên dữ liệu mã hóa
- **Đặc điểm**:
  - Bảo toàn thứ tự: `encrypt(a) < encrypt(b)` khi `a < b`
  - Hỗ trợ range queries
  - Hỗ trợ operators: `eq`, `ne`, `lt`, `gt`, `lte`, `gte`, `between`, `not_between`

```javascript
if (['DATE'].includes(field.type)) {
  return OPEncryptor.ope.encryptStringDate(value);
} else if (['DATETIME'].includes(field.type)) {
  return OPEncryptor.ope.encryptStringDatetime(value);
} else if (field.type === 'NUMERIC') {
  return OPEncryptor.ope.encryptDecimal(value);
} else {
  return OPEncryptor.ope.encryptInt(value);
}
```

#### **C. HMAC-SHA256 Hashing** (hashEncryptFields)

- **Field Types**: `CHECKBOX_YES_NO`, `CHECKBOX_ONE`, `CHECKBOX_LIST`, `SELECT_ONE`, `SELECT_LIST`
- **Thuật toán**: HMAC-SHA256
- **Đặc điểm**:
  - One-way hashing (không thể decrypt)
  - So sánh bằng cách hash lại giá trị
  - Hỗ trợ operators: `eq`, `ne`, `in`, `not_in`

```javascript
// Single value
return CryptoJS.HmacSHA256(value, encryptionKey).toString(CryptoJS.enc.Hex);

// List values
return value.map((v) => CryptoJS.HmacSHA256(v, encryptionKey).toString(CryptoJS.enc.Hex));
```

#### **D. No Encryption** (noneEncryptFields)

- **Field Types**: `SELECT_ONE_RECORD`, `SELECT_LIST_RECORD`, `SELECT_ONE_WORKSPACE_USER`, `SELECT_LIST_WORKSPACE_USER`
- **Lý do**: References đến các entities khác, không cần mã hóa

---

## 2. Luồng API Call: GET Active Table Records

### 2.1. Endpoint Structure

```
POST /api/workspace/{workspaceId}/workflow/get/active_tables/{tableId}/records
```

**Note**: Mặc dù là GET operation nhưng sử dụng POST method để hỗ trợ complex filtering.

### 2.2. Chi Tiết Request Flow

#### **Bước 1: Load Table Details**

```javascript
// Line 3360-3394
static async fetchTableDetails(tableId) {
    const response = await CommonUtils.apiCall(
        `${API_PREFIX}/get/active_tables/${tableId}`,
        {},
        true
    );

    // Kiểm tra E2EE
    if (response.data?.config?.e2eeEncryption) {
        let encryptionKey = CommonUtils.loadKeyFromLocalStorage(tableId) ?? '';

        if (!encryptionKey) {
            // Hiển thị popup yêu cầu nhập key
            document.getElementById('form-table-id').value = response.data.id;
            document.getElementById('input-encryption-key-auth').value =
                response.data.config.encryptionAuthKey ?? '';

            CommonUtils.togglePopup('encryption-key-form');
            RecordView.currentAction = 'table_import_key';
        }

        // Gán key vào config (KHÔNG GỬI LÊN SERVER)
        response.data.config.encryptionKey = encryptionKey;
    }

    return response.data;
}
```

**Key Security Points**:

- `encryptionKey` (32 chars) được load từ localStorage
- Server chỉ lưu `encryptionAuthKey` (SHA256 hash để verify)
- Key KHÔNG BAO GIỜ được gửi qua network

#### **Bước 2: Verify Encryption Key** (nếu user nhập key mới)

```javascript
// Line 2592-2598
static hashKeyForAuth(key) {
    let hash = key;
    for (let i = 0; i < 3; i++) {
        hash = CryptoJS.SHA256(hash).toString();
    }
    return hash;
}
```

**Process**:

1. User nhập 32-character key
2. Hash 3 lần bằng SHA256: `SHA256(SHA256(SHA256(key)))`
3. So sánh với `encryptionAuthKey` từ server
4. Nếu match → lưu vào localStorage và memory

#### **Bước 3: Prepare Filter Parameters (Client-Side Encryption)**

```javascript
// Line 3437-3456
const filtering = Object.entries(filters || {}).reduce((acc, [fieldName, value]) => {
  if (value !== '') {
    if (fieldName === 'record' && typeof value === 'object') {
      // Mã hóa TỪNG FIELD trong filter TRƯỚC KHI GỬI
      acc.record = Object.entries(value).reduce((recAcc, [k, v]) => {
        if (v !== '') {
          const [fieldName, operator] = k.split(':');
          // MÃ HÓA VALUE THEO FIELD TYPE
          recAcc[k] = CommonUtils.encryptTableData(table, fieldName, v);
        }
        return recAcc;
      }, {});
    } else {
      acc[fieldName] = value;
    }
  }
  return acc;
}, {});
```

**Example Filter Transformation**:

```javascript
// Input Filter (plaintext)
{
  record: {
    "status:eq": "active",           // SELECT_ONE → HMAC-SHA256
    "age:gte": 18,                   // INTEGER → OPE
    "name:eq": "John"                // SHORT_TEXT → AES-256-CBC
  }
}

// Output Filter (encrypted) - gửi lên server
{
  record: {
    "status:eq": "a3f8c9d2e1...",   // HMAC hash
    "age:gte": "8234567",            // OPE encrypted
    "name:eq": "vGh8Kl2mN..."        // AES encrypted
  }
}
```

#### **Bước 4: Send Request to Server**

```javascript
// Line 3459-3469
const response = await CommonUtils.apiCall(
  `${API_PREFIX}/get/active_tables/${table.id}/records`,
  {
    paging: 'cursor',
    filtering: filtering, // ENCRYPTED FILTERS
    next_id: nextId,
    direction: direction,
    limit: limit,
  },
  true,
);
```

**Server Processing**:

- Server nhận ENCRYPTED values trong filters
- Server so sánh encrypted values với encrypted data trong DB
- Server KHÔNG BAO GIỜ biết plaintext values

#### **Bước 5: Decrypt Response (Client-Side)**

```javascript
// Line 3474-3482
const decryptedRecords = response.data.map((record) => {
  const decryptedRecord = { ...record };
  decryptedRecord.record = { ...record.record };

  // Giải mã TỪNG FIELD theo type
  fields.forEach((field) => {
    decryptedRecord.record[field.name] = CommonUtils.decryptTableData(table, field.name, record.record[field.name]);
  });

  return decryptedRecord;
});
```

**Decryption Logic per Field Type**:

```javascript
// Line 2512-2554
static decryptTableData(tableDetail, fieldName, value) {
    const field = tableDetail.config.fields.find(f => f.name === fieldName);
    const encryptionKey = tableDetail.config.encryptionKey;

    if (CommonUtils.encryptFields().includes(field.type) && value) {
        // AES-256-CBC: Decrypt với key
        return CommonUtils.decryptData(value, encryptionKey);

    } else if (CommonUtils.opeEncryptFields().includes(field.type) && value) {
        // OPE: Decrypt để lấy original value
        if(!OPEncryptor.ope) {
            OPEncryptor.ope = new OPEncryptor(encryptionKey);
        }
        return OPEncryptor.ope.decrypt(value);

    } else if (CommonUtils.hashEncryptFields().includes(field.type) && value) {
        // HMAC: So sánh hash với options để tìm original value
        if (['CHECKBOX_LIST', 'SELECT_LIST'].includes(field.type)) {
            return value.map(v => {
                const option = field.options.find(opt =>
                    CryptoJS.HmacSHA256(opt.value, encryptionKey).toString(CryptoJS.enc.Hex) === v
                );
                return option ? option.value : v;
            });
        } else {
            const option = field.options.find(opt =>
                CryptoJS.HmacSHA256(opt.value, encryptionKey).toString(CryptoJS.enc.Hex) === value
            );
            return option ? option.value : value;
        }

    } else {
        // No encryption fields
        return value;
    }
}
```

---

## 3. Đánh Giá Về Hiểu Biết Của Bạn

### ✅ **Những Điểm Đúng**

1. **Hai cơ chế mã hóa**: Bạn hiểu đúng có E2EE (key ở client) và server-side encryption
2. **Key storage**: Key E2EE được lưu ở client (localStorage), không gửi lên server
3. **API flow**: Server nhận và lưu trữ encrypted data, không biết plaintext

### 🔄 **Những Điểm Cần Làm Rõ**

#### **1. "Mã hóa lưu key ở server" - CẦN CHÍNH XÁC HÓA**

Thực tế có **3 trường hợp**:

**Case A: E2EE Mode** (`e2eeEncryption = true`)

```
- encryptionKey (32 chars) → LƯU Ở CLIENT (localStorage)
- encryptionAuthKey (SHA256 hash) → LƯU Ở SERVER (để verify)
- Server KHÔNG BAO GIỜ có plaintext key
```

**Case B: Server-Side Encryption Mode** (`e2eeEncryption = false`)

```
- Server tự generate và lưu encryption key
- Server mã hóa/giải mã dữ liệu
- Client nhận về plaintext data
```

**Case C: No Encryption**

```
- Không có encryption config
- Data lưu plaintext
```

#### **2. Authentication Key Process**

```javascript
// Client-side verification
const userInputKey = 'my32characterencryptionkey12345';

// Hash 3 lần
let authHash = CryptoJS.SHA256(userInputKey).toString();
authHash = CryptoJS.SHA256(authHash).toString();
authHash = CryptoJS.SHA256(authHash).toString();

// So sánh với server's encryptionAuthKey
if (authHash === table.config.encryptionAuthKey) {
  // Key đúng → lưu localStorage
  localStorage.setItem(`encryption_key_${tableId}`, userInputKey);
} else {
  // Key sai → reject
}
```

**Security Rationale**:

- Server lưu triple-hashed key → không thể reverse để lấy original key
- Client phải có original key để decrypt data
- Nếu key bị mất → data mất vĩnh viễn (true E2EE)

#### **3. Full-Text Search với Encryption**

Hệ thống có cơ chế đặc biệt cho fulltext search:

```javascript
// Line 2409-2420
static hashKeyword(text, tableToken = '') {
    if (!text || typeof text !== 'string') return [];
    const tokens = this.tokenize(text);
    return tokens.map(token => {
        return CryptoJS.HmacSHA256(token, tableToken).toString(CryptoJS.enc.Hex)
    });
}

// Tokenization
static tokenize(text) {
    return text
        .normalize('NFD')                      // tách dấu tiếng Việt
        .replace(/[\u0300-\u036f]/g, '')       // xóa dấu
        .toLowerCase()
        .split(/\W+/)                          // tách theo ký tự không phải chữ/số
        .filter(Boolean);
}
```

**Process**:

1. Text được tokenize thành từ riêng lẻ
2. Mỗi token được hash bằng HMAC-SHA256
3. Hashed tokens được lưu trong `hashed_keywords` array
4. Fulltext search so sánh hash tokens, không phải plaintext

---

## 4. Security Model Analysis

### **Threat Model**

| Scenario            | E2EE Protection           | Server-Side Protection |
| ------------------- | ------------------------- | ---------------------- |
| Database breach     | ✅ Data vẫn encrypted     | ❌ Keys có thể bị lộ   |
| Server compromise   | ✅ Server không có key    | ⚠️ Keys trong memory   |
| Man-in-the-middle   | ✅ TLS + E2EE             | ✅ TLS encryption      |
| Client-side malware | ❌ Key trong localStorage | ❌ Plaintext visible   |
| User forgets key    | ❌ Data mất vĩnh viễn     | ✅ Server có key       |

### **Key Recovery Implications**

**E2EE Mode**:

- ❌ Không có key recovery mechanism
- ❌ Nếu mất key → data không thể decrypt
- ✅ True end-to-end security

**Server-Side Mode**:

- ✅ Server có thể rotate keys
- ✅ Admin có thể recover data
- ⚠️ Server compromise = full data exposure

---

## 5. Workflow Summary Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT (Browser)                          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  1. Load Table Details                                        │
│     ├─ GET /active_tables/{tableId}                          │
│     ├─ Check e2eeEncryption flag                             │
│     └─ If E2EE: Load key from localStorage                   │
│                                                               │
│  2. Verify Key (if needed)                                    │
│     ├─ User inputs 32-char key                               │
│     ├─ SHA256³(key) → compare with server's authKey          │
│     └─ If match: localStorage.setItem(key)                   │
│                                                               │
│  3. Prepare Filters (ENCRYPT CLIENT-SIDE)                    │
│     ├─ Text fields → AES-256-CBC                             │
│     ├─ Numbers/Dates → OPE                                   │
│     └─ Selects → HMAC-SHA256                                 │
│                                                               │
│  4. Send Request                                              │
│     POST /active_tables/{tableId}/records                    │
│     Body: { filtering: { record: { /*encrypted*/ } } }       │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    SERVER (Laravel/PHP)                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  5. Process Request                                           │
│     ├─ Receive ENCRYPTED filters                             │
│     ├─ Query DB with encrypted values                        │
│     ├─ Compare encrypted-to-encrypted                        │
│     └─ Return ENCRYPTED results                              │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT (Browser)                          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  6. Decrypt Response (CLIENT-SIDE)                            │
│     ├─ AES fields → CryptoJS.AES.decrypt()                   │
│     ├─ OPE fields → OPEncryptor.decrypt()                    │
│     └─ HMAC fields → lookup in options array                 │
│                                                               │
│  7. Display Plaintext Data                                    │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. Recommendations & Best Practices

### **For E2EE Implementation**

1. **Key Backup Mechanism**:
   - Implement key export/download feature
   - Warn users on first key input
   - Store recovery phrases

2. **Key Rotation**:
   - Currently NO rotation support
   - Would require re-encrypting all records

3. **Multi-Device Sync**:
   - Keys in localStorage → không sync across devices
   - Consider secure key sync mechanism

4. **Audit Logging**:
   - Log key access attempts
   - Track decryption operations

### **For Security Hardening**

1. **Memory Protection**:
   - Clear keys from memory after use
   - Implement timeout for key expiry

2. **Content Security Policy**:
   - Prevent XSS attacks
   - Restrict script sources

3. **Key Derivation**:
   - Current: User provides 32-char key directly
   - Better: PBKDF2 with salt for key derivation

---

## 7. Kết Luận

### **Về Hiểu Biết Của Bạn**

**✅ Chính xác**:

- Có 2 modes: E2EE và server-side
- E2EE key lưu client, không gửi server
- Filters và data đều được mã hóa client-side

**🔄 Cần điều chỉnh**:

- "Mã hóa lưu key ở server" → Chính xác hơn: "Server-side encryption mode" hoặc "Non-E2EE mode"
- Server KHÔNG BAO GIỜ có plaintext key trong E2EE mode
- Server chỉ lưu `encryptionAuthKey` (triple-hashed) để verify

### **Về Implementation**

**Strengths**:

- ✅ True E2EE với client-side encryption
- ✅ Multiple encryption schemes phù hợp với field types
- ✅ Order-preserving cho range queries
- ✅ Searchable encryption cho selects

**Weaknesses**:

- ⚠️ Không có key recovery mechanism
- ⚠️ Keys trong localStorage dễ bị XSS
- ⚠️ Không có key rotation
- ⚠️ Triple SHA256 cho auth key (không cần 3 lần)

---

## References

- **File**: `docs/technical/html-module/active-table-records.blade.php`
- **API Spec**: `docs/specs/doc-get-active-records.md`
- **Encryption Functions**: Lines 2422-2598
- **API Call Flow**: Lines 3360-3494
