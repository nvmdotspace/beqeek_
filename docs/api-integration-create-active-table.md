# Tài liệu tích hợp: API Tạo Active Table

## 1. Tổng quan

### 1.1. Mục đích

Tài liệu này mô tả chi tiết luồng tích hợp API để tạo một Active Table mới, từ tương tác người dùng trên giao diện đến request/response với backend. API này là một phần quan trọng của hệ thống low-code/no-code, cho phép người dùng định nghĩa cấu trúc bảng dữ liệu động với các tính năng nâng cao như mã hóa end-to-end, reference fields, và multi-layout rendering.

### 1.2. Endpoint

```
POST /api/workspace/{workspaceId}/workflow/post/active_tables
```

**Headers:**

```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer {access_token}"
}
```

### 1.3. Đặc điểm nổi bật

- **Dynamic Schema Generation**: User tự định nghĩa cấu trúc bảng qua UI
- **End-to-End Encryption (E2EE)**: Zero-knowledge encryption với key management phía client
- **Auto-initialization**: Tự động sinh encryption key, default actions, hashed keyword fields
- **Multi-tenant**: Workspace isolation với permission system
- **Reference System**: Hỗ trợ foreign keys và reverse lookups giữa các bảng

---

## 2. Luồng tương tác người dùng

### 2.1. Khởi tạo form tạo bảng

**Trigger:** User chọn loại bảng muốn tạo từ danh sách templates

**Function:** `DetailView.openTableConfigForm('create', tableType)`

**UI Elements:**

- **Tên bảng** (`table-name-popup`): Text input, required
- **Loại bảng** (`table-type-popup`): Text input, readonly (đã chọn từ template)
- **Mô tả** (`table-description`): Textarea, optional
- **Mã hóa đầu cuối** (`end-to-end-encryption`): Checkbox toggle

```html
<div id="table-config-form">
  <input type="text" id="table-name-popup" placeholder="Tên Bảng" />
  <input type="text" id="table-type-popup" readonly />
  <textarea id="table-description" placeholder="Mô tả" rows="4"></textarea>

  <div class="switch-label">
    <input type="checkbox" id="end-to-end-encryption" />
    <label>Mã hóa đầu cuối</label>
    <p>Khóa mã hóa được quản lý và lưu trữ hoàn toàn bởi người dùng.</p>
  </div>
</div>
```

### 2.2. Submit form

**Trigger:** User click nút "Xác nhận" trong popup

**Function:** `confirmAction()` → `DetailView.saveTableConfigForm()`

**Validation:**

```javascript
// Kiểm tra các trường bắt buộc
if (!name) {
  CommonUtils.showMessage('Tên bảng không được để trống.', false);
  return;
}
if (this.tableConfigMode === 'create' && !tableType) {
  CommonUtils.showMessage('Loại bảng không được để trống.', false);
  return;
}
```

---

## 3. Logic xử lý client-side

### 3.1. Khởi tạo cấu hình từ template

```javascript
// Lấy config template dựa trên tableType
const config = TABLE_CONFIGS[tableType] || TABLE_CONFIGS.BASIC;

// Khởi tạo các thuộc tính mặc định
this.fields = config.fields || [];
this.tableLimit = 1000;
this.actions = [];
this.quickFilters = [];
```

**TABLE_CONFIGS structure:** (Định nghĩa ở nơi khác trong source code)

```javascript
TABLE_CONFIGS = {
  BASIC: {
    fields: [
      /* predefined fields */
    ],
    // ... other default configs
  },
  TASK_EISENHOWER: {
    fields: [
      /* task-specific fields */
    ],
    // ... other configs
  },
  // ... more templates
};
```

### 3.2. Auto-generation: Hashed Keyword Fields

**Mục đích:** Tạo danh sách các trường có thể tìm kiếm full-text

```javascript
// Lọc các trường có type thuộc nhóm text
this.hashedKeywordFields = this.fields
  .filter((field) => CommonUtils.encryptFields().includes(field.type))
  .map((field) => field.name);

// CommonUtils.encryptFields() returns:
// ['SHORT_TEXT', 'TEXT', 'RICH_TEXT', 'EMAIL', 'URL']
```

**Lý do:** Server sẽ tạo hash tokens từ các trường này để hỗ trợ tìm kiếm trên dữ liệu đã mã hóa mà không cần decrypt.

### 3.3. Auto-generation: Encryption Keys

#### 3.3.1. Sinh khóa mã hóa

```javascript
// Generate 32-character random key
this.encryptionKey = this.generateEncryptionKey();

// Function implementation (example):
generateEncryptionKey() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let key = '';
  for (let i = 0; i < 32; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
}
```

#### 3.3.2. Hash khóa để xác thực

```javascript
// Triple SHA256 hash for authentication
this.encryptionAuthKey = CommonUtils.hashKeyForAuth(this.encryptionKey);

// Implementation:
static hashKeyForAuth(key) {
  let hash = key;
  for (let i = 0; i < 3; i++) {
    hash = CryptoJS.SHA256(hash).toString();
  }
  return hash;
}
```

**Lý do 2 loại key:**

- **`encryptionKey`**: Khóa thật dùng để mã hóa/giải mã dữ liệu (32 ký tự)
- **`encryptionAuthKey`**: Hash của khóa thật, lưu trên server để validate khi user nhập lại

**Lợi ích:**

- Server không bao giờ biết khóa mã hóa thật (zero-knowledge)
- Có thể validate khóa người dùng nhập mà không cần lưu khóa gốc
- Ngăn chặn brute-force attack (triple hash)

### 3.4. Xây dựng Config Object

```javascript
const e2eeEncryption = document.getElementById('end-to-end-encryption').checked;

const tableConfig = {
  ...config, // Spread template config
  title: name, // Tên bảng từ user input
  fields: this.fields, // Mảng Field objects
  actions: this.actions, // Mảng Action objects (initially empty)
  quickFilters: this.quickFilters, // Mảng Quick Filter configs (initially empty)
  tableLimit: this.tableLimit, // Giới hạn số records (default: 1000)
  e2eeEncryption: e2eeEncryption, // Boolean flag

  // ĐIỂM QUAN TRỌNG: Nếu bật E2EE, không gửi key lên server
  encryptionKey: e2eeEncryption ? '' : this.encryptionKey,

  encryptionAuthKey: this.encryptionAuthKey, // Hash để validate
  hashedKeywordFields: this.hashedKeywordFields, // Fields for search indexing
  defaultSort: 'desc', // Sắp xếp mặc định
};
```

---

## 4. API Request

### 4.1. Pre-processing trước khi gửi

```javascript
static async createTable(data) {
  // Security: Xóa encryptionKey khỏi payload nếu bật E2EE
  if(data.config.e2eeEncryption) {
    data.config.encryptionKey = '';
  }

  // Call API endpoint
  const response = await CommonUtils.apiCall(
    `${API_PREFIX}/post/active_tables`,
    data
  );

  return { message: response.message, id: response.data.id };
}
```

### 4.2. Request Payload Structure

```json
{
  "name": "BEQEEK - Công việc",
  "tableType": "TASK_EISENHOWER",
  "description": "Quản lý công việc theo ma trận Eisenhower",
  "config": {
    "title": "BEQEEK - Công việc",

    "fields": [
      {
        "type": "SHORT_TEXT",
        "label": "Tên công việc",
        "name": "task_title",
        "placeholder": "Nhập tên công việc",
        "defaultValue": "",
        "required": true
      },
      {
        "type": "RICH_TEXT",
        "label": "Nội dung công việc",
        "name": "task_description",
        "placeholder": "Mô tả ngắn gọn",
        "defaultValue": "",
        "required": false
      },
      {
        "type": "SELECT_ONE",
        "label": "Ma trận Eisenhower",
        "name": "matrix_quadrant",
        "placeholder": "Chọn nhóm ma trận",
        "defaultValue": "q1",
        "required": true,
        "options": [
          {
            "text": "Quan trọng & Khẩn cấp",
            "value": "q1",
            "text_color": "#ffffff",
            "background_color": "#dc3545"
          }
        ]
      },
      {
        "type": "SELECT_ONE_RECORD",
        "label": "Dự án liên quan",
        "name": "related_project",
        "placeholder": "Chọn dự án",
        "defaultValue": "",
        "required": false,
        "referenceTableId": "806087624279195000",
        "referenceLabelField": "project_name",
        "additionalCondition": "status='active'"
      },
      {
        "type": "FIRST_REFERENCE_RECORD",
        "label": "Công việc cha",
        "name": "parent_task",
        "placeholder": "",
        "defaultValue": "",
        "required": false,
        "referenceTableId": "806087624279195649",
        "referenceField": "child_tasks",
        "referenceLabelField": "task_title",
        "additionalCondition": ""
      },
      {
        "type": "SELECT_ONE_WORKSPACE_USER",
        "label": "Người phụ trách",
        "name": "assignee",
        "placeholder": "Chọn người phụ trách",
        "defaultValue": "",
        "required": false,
        "referenceLabelField": "fullName"
      }
    ],

    "actions": [],
    "quickFilters": [],

    "tableLimit": 1000,
    "defaultSort": "desc",

    "e2eeEncryption": true,
    "encryptionKey": "",
    "encryptionAuthKey": "378001b13df53e005505b18f7cf5a38c6c9b0098a691f0a88d57868cc76ba97e",

    "hashedKeywordFields": ["task_title", "task_description"],

    "recordListConfig": null,
    "recordDetailConfig": null,
    "kanbanConfigs": [],
    "ganttCharts": [],
    "permissionsConfig": []
  }
}
```

### 4.3. Chi tiết các Field Types

#### a. Text Fields

```json
{
  "type": "SHORT_TEXT | TEXT | RICH_TEXT | EMAIL | URL",
  "label": "Display name",
  "name": "field_name",
  "placeholder": "Placeholder text",
  "defaultValue": "",
  "required": false
}
```

**Encryption:** AES-256-CBC (nếu bật E2EE)

#### b. Date/Time Fields

```json
{
  "type": "DATE | DATETIME | TIME",
  "label": "Ngày bắt đầu",
  "name": "start_date",
  "placeholder": "Chọn ngày",
  "defaultValue": "",
  "required": false
}
```

**Encryption:** OPE (Order-Preserving Encryption) để hỗ trợ range queries

#### c. Number Fields

```json
{
  "type": "INTEGER | NUMERIC | YEAR | MONTH | DAY | HOUR | MINUTE | SECOND",
  "label": "Số lượng",
  "name": "quantity",
  "placeholder": "Nhập số",
  "defaultValue": "",
  "required": false
}
```

**Encryption:** OPE để hỗ trợ comparison operations

#### d. Select Fields (với options)

```json
{
  "type": "SELECT_ONE | SELECT_LIST | CHECKBOX_LIST | CHECKBOX_ONE | CHECKBOX_YES_NO",
  "label": "Trạng thái",
  "name": "status",
  "placeholder": "Chọn trạng thái",
  "defaultValue": "pending",
  "required": false,
  "options": [
    {
      "text": "Chưa bắt đầu",
      "value": "pending",
      "text_color": "#ffffff",
      "background_color": "#6c757d"
    },
    {
      "text": "Đang thực hiện",
      "value": "in_progress",
      "text_color": "#ffffff",
      "background_color": "#17a2b8"
    }
  ]
}
```

**Encryption:** HMAC-SHA256 để hỗ trợ equality checks

#### e. Reference Fields (Foreign Keys)

**SELECT_ONE_RECORD / SELECT_LIST_RECORD:**

```json
{
  "type": "SELECT_ONE_RECORD",
  "label": "Dự án liên quan",
  "name": "related_project",
  "placeholder": "Chọn dự án",
  "defaultValue": "",
  "required": false,
  "referenceTableId": "806087624279195000",
  "referenceLabelField": "project_name",
  "additionalCondition": "status='active'"
}
```

**FIRST_REFERENCE_RECORD (Reverse Lookup):**

```json
{
  "type": "FIRST_REFERENCE_RECORD",
  "label": "Công việc cha",
  "name": "parent_task",
  "placeholder": "",
  "defaultValue": "",
  "required": false,
  "referenceTableId": "806087624279195649",
  "referenceField": "child_tasks",
  "referenceLabelField": "task_title",
  "additionalCondition": ""
}
```

**Encryption:** Không mã hóa (lưu plain ID để join)

#### f. Workspace User Fields

```json
{
  "type": "SELECT_ONE_WORKSPACE_USER | SELECT_LIST_WORKSPACE_USER",
  "label": "Người phụ trách",
  "name": "assignee",
  "placeholder": "Chọn người phụ trách",
  "defaultValue": "",
  "required": false,
  "referenceLabelField": "fullName"
}
```

**Encryption:** Không mã hóa (reference đến user table)

---

## 5. Response Handling

### 5.1. Success Response

```json
{
  "message": "Tạo bảng thành công",
  "data": {
    "id": "806087624279195649",
    "name": "BEQEEK - Công việc",
    "tableType": "TASK_EISENHOWER",
    "description": "...",
    "config": {
      /* ... full config object ... */
    },
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

### 5.2. Post-processing sau khi tạo thành công

```javascript
// 1. Lưu encryption key vào localStorage (nếu bật E2EE)
if (e2eeEncryption) {
  await CommonUtils.saveKeyToLocalStorage(response.id, this.encryptionKey);
  tableConfig.encryptionKey = this.encryptionKey;
}

// 2. Cập nhật state
States.currentTable = {
  id: response.id,
  name,
  tableType,
  description,
  config: tableConfig,
};

// 3. Render lại list view (nếu có)
await ListView.render();

// 4. Đóng popup
CommonUtils.closePopup();

// 5. Navigate đến trang chi tiết bảng mới tạo
CommonUtils.navigateToDetail(response.id);
```

### 5.3. Error Response

```json
{
  "message": "Lỗi khi tạo bảng: Tên bảng đã tồn tại",
  "error": "DUPLICATE_TABLE_NAME",
  "statusCode": 400
}
```

**Error Handling:**

```javascript
try {
  const response = await TableAPI.createTable({...});
  // Success handling
} catch (error) {
  console.error('Error saving table config:', error);
  CommonUtils.showMessage(`Lỗi khi lưu cấu hình bảng: ${error.message}`, false);
} finally {
  // Restore UI state
  confirmBtn.classList.remove('btn-loading');
  confirmBtn.innerHTML = `<span class="material-icons">check</span> Xác nhận`;
}
```

---

## 6. End-to-End Encryption Flow

### 6.1. Khi tạo bảng với E2EE enabled

```javascript
// 1. User check vào checkbox "Mã hóa đầu cuối"
const e2eeEncryption = true;

// 2. Client tự sinh key 32 ký tự
this.encryptionKey = this.generateEncryptionKey();
// Example: "ECZXIFx3wMRZ9vFskZOpPGpw63KHyAnl"

// 3. Hash key để lưu trên server (để validate sau này)
this.encryptionAuthKey = CommonUtils.hashKeyForAuth(this.encryptionKey);
// Result: "378001b13df53e005505b18f7cf5a38c6c9b0098a691f0a88d57868cc76ba97e"

// 4. Xóa key thật khỏi payload
tableConfig.encryptionKey = ''; // EMPTY string gửi lên server

// 5. Sau khi tạo thành công, lưu key vào localStorage
localStorage.setItem(`e2ee_key_${WORKSPACE_ID}_${tableId}`, this.encryptionKey);
```

### 6.2. Khi truy cập lại bảng E2EE

```javascript
// 1. Fetch table details từ server
const tableDetails = await TableAPI.fetchTableDetails(tableId);

// 2. Kiểm tra nếu bảng có E2EE
if (tableDetails.config.e2eeEncryption) {
  // 3. Thử load key từ localStorage
  let encryptionKey = CommonUtils.loadKeyFromLocalStorage(tableId);

  // 4. Nếu không có key, hiện popup yêu cầu nhập
  if (!encryptionKey) {
    // Show popup
    document.getElementById('form-table-id').value = tableId;
    document.getElementById('input-encryption-key-auth').value = tableDetails.config.encryptionAuthKey;

    CommonUtils.togglePopup('encryption-key-form');
    DetailView.currentAction = 'table_import_key';

    // Wait for user input...
  }

  // 5. Set key vào config để sử dụng
  tableDetails.config.encryptionKey = encryptionKey;
}
```

### 6.3. Validate key người dùng nhập

```javascript
static async actionTableImportKey() {
  const inputKey = document.getElementById('input-encryption-key').value.trim();
  const storedAuthKey = document.getElementById('input-encryption-key-auth').value;

  // 1. Validate length
  if (!inputKey || inputKey.length !== 32) {
    CommonUtils.showMessage('Khóa mã hóa phải có đúng 32 ký tự.', false);
    return;
  }

  // 2. Validate hash
  if (storedAuthKey !== CommonUtils.hashKeyForAuth(inputKey)) {
    CommonUtils.showMessage('Khóa mã hóa không hợp lệ.', false);
    return;
  }

  // 3. Lưu vào localStorage
  await CommonUtils.saveKeyToLocalStorage(tableId, inputKey);

  // 4. Reload page
  CommonUtils.togglePopup();
  await router();
}
```

### 6.4. Zero-Knowledge Architecture

```
┌─────────────┐                    ┌─────────────┐
│   Client    │                    │   Server    │
└─────────────┘                    └─────────────┘
      │                                   │
      │ 1. Generate 32-char key           │
      │    encryptionKey = "ABC..."      │
      │                                   │
      │ 2. Hash key (SHA256 x3)          │
      │    authKey = hash(hash(hash(key)))│
      │                                   │
      │ 3. POST /active_tables            │
      │    payload: {                     │
      │      encryptionKey: "",      ────►│ 4. Save config
      │      encryptionAuthKey: "378..." │    - encryptionKey: "" (empty)
      │    }                              │    - encryptionAuthKey: "378..."
      │                                   │
      │ 5. localStorage.setItem(          │
      │      "e2ee_key_...", "ABC..."    │
      │    )                              │
      │                                   │
      │                                   │
      │ [LATER] User returns              │
      │                                   │
      │ 6. GET /active_tables/123    ────►│
      │                              ◄──── 7. Return {
      │                                   │      encryptionAuthKey: "378..."
      │                                   │    }
      │ 8. localStorage.getItem(...) │    │
      │    → null (user cleared cache)    │
      │                                   │
      │ 9. Prompt user to input key       │
      │                                   │
      │ 10. User enters: "ABC..."         │
      │     Validate:                     │
      │     hash(hash(hash("ABC...")))   │
      │     === "378..." ✓                │
      │                                   │
      │ 11. localStorage.setItem(...)     │
      │                                   │
      └───────────────────────────────────┘

KEY POINTS:
- Server NEVER sees the real encryption key
- Client validates key using stored hash
- If user loses key → data is permanently inaccessible
```

---

## 7. Default Actions Auto-generation

### 7.1. System Actions

Khi tạo bảng mới, hệ thống tự động tạo 8 actions mặc định:

```javascript
static initDefaultActions(currentActions) {
  const defaultActions = [
    { name: 'Tạo mới bản ghi', type: 'create', icon: 'create' },
    { name: 'Truy cập bản ghi', type: 'access', icon: 'access' },
    { name: 'Cập nhật bản ghi', type: 'update', icon: 'update' },
    { name: 'Xoá bản ghi', type: 'delete', icon: 'delete' },
    { name: 'Thêm bình luận', type: 'comment_create', icon: 'create' },
    { name: 'Truy cập bình luận', type: 'comment_access', icon: 'access' },
    { name: 'Cập nhật bình luận', type: 'comment_update', icon: 'update' },
    { name: 'Xoá bình luận', type: 'comment_delete', icon: 'delete' },
  ];

  // Generate UUID for each action
  return defaultActions.map(action => ({
    ...action,
    actionId: CommonUtils.generateUUIDv7()
  }));
}
```

### 7.2. UUID v7 Generation

```javascript
static generateUUIDv7() {
  const timestamp = Date.now();
  const timestampHex = timestamp.toString(16).padStart(12, '0');
  const randomBytes = Array.from({ length: 16 }, () =>
    Math.floor(Math.random() * 256)
  );

  // Set version (7) and variant bits
  randomBytes[6] = (randomBytes[6] & 0x0f) | 0x70;
  randomBytes[8] = (randomBytes[8] & 0x3f) | 0x80;

  const hex = randomBytes.map(b => b.toString(16).padStart(2, '0'));

  return `${timestampHex.slice(0, 8)}-${timestampHex.slice(8, 12)}-${hex[4]}-${hex[6]}-${hex[8]}${hex[9]}${hex[10]}${hex[11]}${hex[12]}${hex[13]}${hex[14]}${hex[15]}`;
}
```

**Lợi ích UUID v7:**

- Sortable by creation time (prefix là timestamp)
- Globally unique
- Compatible với các hệ thống yêu cầu UUID

---

## 8. Validation Rules

### 8.1. Client-side Validation

#### Trước khi gửi request:

```javascript
// 1. Required fields
if (!name) {
  throw new Error('Tên bảng không được để trống.');
}

// 2. Table type (khi create)
if (this.tableConfigMode === 'create' && !tableType) {
  throw new Error('Loại bảng không được để trống.');
}

// 3. Field validation
this.fields.forEach((field) => {
  if (!field.label || !field.type) {
    throw new Error(`Trường "${field.label || 'Unknown'}" thiếu thông tin bắt buộc.`);
  }

  // Validate options for select fields
  if (['SELECT_ONE', 'SELECT_LIST', 'CHECKBOX_LIST'].includes(field.type)) {
    if (!field.options || field.options.length === 0) {
      throw new Error(`Trường "${field.label}" cần ít nhất một lựa chọn.`);
    }
  }

  // Validate reference fields
  if (['SELECT_ONE_RECORD', 'SELECT_LIST_RECORD', 'FIRST_REFERENCE_RECORD'].includes(field.type)) {
    if (!field.referenceTableId || !field.referenceLabelField) {
      throw new Error(`Trường "${field.label}" thiếu thông tin bảng tham chiếu.`);
    }

    if (field.type === 'FIRST_REFERENCE_RECORD' && !field.referenceField) {
      throw new Error(`Trường "${field.label}" (FIRST_REFERENCE_RECORD) thiếu referenceField.`);
    }
  }
});

// 4. Encryption key validation (if E2EE)
if (e2eeEncryption && this.encryptionKey.length !== 32) {
  throw new Error('Khóa mã hóa phải có đúng 32 ký tự.');
}

// 5. Table limit
if (this.tableLimit < 1 || this.tableLimit > 1000) {
  throw new Error('Giới hạn bản ghi phải từ 1 đến 1000.');
}
```

### 8.2. Expected Server-side Validation

Backend nên validate:

1. **Authentication & Authorization**
   - User có quyền tạo bảng trong workspace không?
   - Workspace ID có tồn tại không?

2. **Business Rules**
   - Tên bảng có trùng trong workspace không?
   - Table type có hợp lệ không?
   - Reference table IDs có tồn tại không?

3. **Data Integrity**
   - Field names có unique không?
   - Action IDs có unique không?
   - Encryption auth key format có đúng không?

4. **Resource Limits**
   - User đã đạt giới hạn số bảng chưa?
   - Table limit có vượt quota workspace không?

---

## 9. Security Considerations

### 9.1. Encryption Key Management

**CRITICAL RULES:**

1. **NEVER send real encryption key to server khi E2EE enabled**

   ```javascript
   if (data.config.e2eeEncryption) {
     data.config.encryptionKey = ''; // Clear before sending
   }
   ```

2. **Always hash key before storing on server**

   ```javascript
   // Triple SHA256
   hash = SHA256(SHA256(SHA256(originalKey)));
   ```

3. **Use localStorage for client-side storage**

   ```javascript
   localStorage.setItem(`e2ee_key_${workspaceId}_${tableId}`, key);
   ```

4. **Warn users about key loss**
   ```
   "Khóa mã hóa được quản lý hoàn toàn bởi người dùng.
    Nếu mất khóa, dữ liệu sẽ không thể khôi phục."
   ```

### 9.2. Authorization

```javascript
// Every API call includes workspace context
const API_PREFIX = `/api/workspace/${WORKSPACE_ID}/workflow`;

// Headers include auth token
headers: {
  'Authorization': `Bearer ${Auth.getAuthToken()}`
}
```

### 9.3. XSS Prevention

- Sanitize user input trước khi render
- Use textContent instead của innerHTML khi có thể
- Validate HTML content trong RICH_TEXT fields

### 9.4. CSRF Protection

- Backend nên validate origin headers
- Use same-site cookies
- Implement CSRF tokens nếu cần

---

## 10. Performance Considerations

### 10.1. Payload Size

**Typical payload:** ~5-15 KB cho bảng có 10-20 fields

**Optimization strategies:**

- Chỉ gửi các thuộc tính cần thiết
- Không gửi computed fields
- Compress nếu payload > 50KB

### 10.2. Client-side Processing

```javascript
// Heavy operations
// 1. Tokenization for field names
CommonUtils.tokenize(fieldLabel).join('_');

// 2. Triple SHA256 hashing
CommonUtils.hashKeyForAuth(key);

// 3. UUID generation
CommonUtils.generateUUIDv7();

// Performance tip: Batch these operations
```

### 10.3. Network Optimization

- Debounce form submissions
- Show loading state during API call
- Implement retry logic cho network failures

---

## 11. Testing Checklist

### 11.1. Unit Tests

- [ ] `generateEncryptionKey()` returns 32 chars
- [ ] `hashKeyForAuth()` produces consistent hash
- [ ] `generateUUIDv7()` format validation
- [ ] Field validation logic
- [ ] Payload building logic

### 11.2. Integration Tests

- [ ] Create table với các field types khác nhau
- [ ] Create table với E2EE enabled
- [ ] Create table với E2EE disabled
- [ ] Create table với reference fields
- [ ] Validate error responses

### 11.3. E2E Tests

- [ ] Complete flow: chọn template → fill form → submit → verify creation
- [ ] E2EE flow: tạo bảng → đóng browser → mở lại → nhập key → verify access
- [ ] Permission check: user không có quyền không tạo được bảng
- [ ] Error handling: network failure, validation errors

### 11.4. Security Tests

- [ ] Verify encryption key không bao giờ gửi lên server khi E2EE=true
- [ ] Verify hash validation works correctly
- [ ] XSS injection trong field labels
- [ ] SQL injection trong additionalCondition
- [ ] Authorization bypass attempts

---

## 12. Common Issues & Troubleshooting

### 12.1. "Khóa mã hóa không hợp lệ"

**Nguyên nhân:**

- User nhập sai key
- Key trong localStorage bị corrupt
- Browser cache bị xóa

**Giải pháp:**

- Verify key length = 32
- Re-hash input key và so sánh với encryptionAuthKey
- Backup key vào file trước khi xóa cache

### 12.2. "Reference table not found"

**Nguyên nhân:**

- Reference table đã bị xóa
- User không có quyền access reference table
- Reference table thuộc workspace khác

**Giải pháp:**

- Validate referenceTableId exists trước khi submit
- Show warning nếu reference table inaccessible
- Allow admin to fix broken references

### 12.3. "Field name already exists"

**Nguyên nhân:**

- Duplicate field names trong config
- Auto-generated name conflict

**Giải pháp:**

```javascript
// Add uniqueness check
const fieldNames = new Set();
fields.forEach((field) => {
  if (fieldNames.has(field.name)) {
    throw new Error(`Duplicate field name: ${field.name}`);
  }
  fieldNames.add(field.name);
});
```

### 12.4. "Request payload too large"

**Nguyên nhân:**

- Quá nhiều fields (>100)
- RICH_TEXT defaultValue quá dài
- Quá nhiều options trong SELECT fields

**Giải pháp:**

- Limit số fields tối đa: 50-100
- Warn user khi payload > 50KB
- Implement pagination cho field list

---

## 13. Future Improvements

### 13.1. Proposed Enhancements

1. **Batch Field Creation**
   - Import fields từ CSV/Excel
   - Copy fields từ bảng khác

2. **Field Templates**
   - Pre-defined field groups (Address, Contact Info, etc.)
   - Custom field templates

3. **Validation Rules**
   - Custom validation expressions
   - Cross-field validation

4. **Computed Fields**
   - Formula-based fields
   - Aggregation fields

5. **Version Control**
   - Track config changes
   - Rollback to previous versions

### 13.2. API Versioning

Consider versioning API:

```
POST /api/v2/workspace/{workspaceId}/workflow/active_tables
```

Breaking changes:

- New required fields
- Changed field types
- Modified encryption algorithm

---

## 14. Related Documentation

- **Functional Spec:** `/docs/specs/active-table-config-functional-spec.md`
- **API Swagger:** `/docs/swagger.yaml`
- **Encryption Core:** `/packages/encryption-core/README.md`
- **Field Types Reference:** `/docs/field-types-reference.md`
- **Permission System:** `/docs/permission-system.md`

---

## 15. Change Log

| Date       | Version | Changes                            | Author |
| ---------- | ------- | ---------------------------------- | ------ |
| 2024-01-15 | 1.0     | Initial documentation              | Droid  |
| TBD        | 1.1     | Add batch field creation section   |        |
| TBD        | 2.0     | API v2 với computed fields support |        |

---

## Appendix A: Complete Example Request

```json
{
  "name": "Task Management - Dev Team",
  "tableType": "TASK_EISENHOWER",
  "description": "Quản lý công việc team phát triển theo phương pháp Eisenhower Matrix",
  "config": {
    "title": "Task Management - Dev Team",
    "fields": [
      {
        "type": "SHORT_TEXT",
        "label": "Task Name",
        "name": "task_name",
        "placeholder": "Enter task name",
        "defaultValue": "",
        "required": true
      },
      {
        "type": "RICH_TEXT",
        "label": "Description",
        "name": "description",
        "placeholder": "Detailed description",
        "defaultValue": "",
        "required": false
      },
      {
        "type": "SELECT_ONE",
        "label": "Priority",
        "name": "priority",
        "placeholder": "Select priority",
        "defaultValue": "medium",
        "required": true,
        "options": [
          {
            "text": "Urgent & Important",
            "value": "urgent_important",
            "text_color": "#ffffff",
            "background_color": "#dc3545"
          },
          {
            "text": "Important, Not Urgent",
            "value": "important",
            "text_color": "#ffffff",
            "background_color": "#28a745"
          },
          {
            "text": "Urgent, Not Important",
            "value": "urgent",
            "text_color": "#ffffff",
            "background_color": "#ff9800"
          },
          {
            "text": "Neither",
            "value": "neither",
            "text_color": "#ffffff",
            "background_color": "#6c757d"
          }
        ]
      },
      {
        "type": "SELECT_ONE_WORKSPACE_USER",
        "label": "Assignee",
        "name": "assignee",
        "placeholder": "Assign to",
        "defaultValue": "",
        "required": false,
        "referenceLabelField": "fullName"
      },
      {
        "type": "DATE",
        "label": "Due Date",
        "name": "due_date",
        "placeholder": "Select due date",
        "defaultValue": "",
        "required": false
      },
      {
        "type": "SELECT_ONE",
        "label": "Status",
        "name": "status",
        "placeholder": "Select status",
        "defaultValue": "todo",
        "required": true,
        "options": [
          {
            "text": "To Do",
            "value": "todo",
            "text_color": "#000000",
            "background_color": "#e3e3e3"
          },
          {
            "text": "In Progress",
            "value": "in_progress",
            "text_color": "#ffffff",
            "background_color": "#17a2b8"
          },
          {
            "text": "Done",
            "value": "done",
            "text_color": "#ffffff",
            "background_color": "#28a745"
          }
        ]
      }
    ],
    "actions": [],
    "quickFilters": [],
    "tableLimit": 1000,
    "defaultSort": "desc",
    "e2eeEncryption": true,
    "encryptionKey": "",
    "encryptionAuthKey": "a7f3e8c9d1b2e5f6a8c4d7e9f2a5b8c1d4e7f9a2b5c8d1e4f7a9b2c5d8e1f4a7",
    "hashedKeywordFields": ["task_name", "description"],
    "recordListConfig": null,
    "recordDetailConfig": null,
    "kanbanConfigs": [],
    "ganttCharts": [],
    "permissionsConfig": []
  }
}
```

## Appendix B: Error Codes Reference

| Error Code                  | HTTP Status | Description                             | Client Action                       |
| --------------------------- | ----------- | --------------------------------------- | ----------------------------------- |
| `INVALID_TABLE_NAME`        | 400         | Tên bảng không hợp lệ                   | Show validation error               |
| `DUPLICATE_TABLE_NAME`      | 409         | Tên bảng đã tồn tại trong workspace     | Suggest alternative name            |
| `INVALID_FIELD_CONFIG`      | 400         | Config của field không hợp lệ           | Show field validation errors        |
| `REFERENCE_TABLE_NOT_FOUND` | 404         | Reference table không tồn tại           | Remove invalid reference            |
| `INVALID_ENCRYPTION_CONFIG` | 400         | Config mã hóa không hợp lệ              | Check encryption settings           |
| `WORKSPACE_NOT_FOUND`       | 404         | Workspace không tồn tại                 | Redirect to workspace selection     |
| `UNAUTHORIZED`              | 401         | Token hết hạn hoặc không hợp lệ         | Trigger token refresh               |
| `FORBIDDEN`                 | 403         | User không có quyền tạo bảng            | Show permission denied message      |
| `TABLE_LIMIT_EXCEEDED`      | 429         | Đã đạt giới hạn số bảng trong workspace | Upgrade plan hoặc delete old tables |
| `PAYLOAD_TOO_LARGE`         | 413         | Request payload quá lớn                 | Reduce field count hoặc compress    |

---

**Document Version:** 1.0  
**Last Updated:** 2024-01-15  
**Maintained By:** Beqeek Development Team
