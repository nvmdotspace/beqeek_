# Phân tích API Endpoints - Tài liệu vs Code thực tế

## ⚠️ VẤN ĐỀ QUAN TRỌNG PHÁT HIỆN

Tài liệu trong thư mục `docs/` đang mô tả các API endpoints **KHÔNG ĐÚNG** với implementation thực tế trong code.

---

## 📊 So sánh API Endpoints

### 1. General Config (Cấu hình chung)

#### Tài liệu (`docs/01-general-config.md`):

```typescript
// API Services trong tài liệu
const generalConfigAPI = {
  fetchConfig: async (tableId: string) => {
    const response = await api.get(`/api/tables/${tableId}/config/general`);
    return response.data;
  },

  updateConfig: async (tableId: string, config: Partial<GeneralConfig>) => {
    const response = await api.patch(`/api/tables/${tableId}/config/general`, config);
    return response.data;
  },
};
```

#### Code thực tế (`active-tables-v2.blade.php`):

```javascript
// Thực tế trong code
const API_PREFIX = `/api/workspace/${WORKSPACE_ID}/workflow`;

static async updateTable(tableId, data) {
    const response = await CommonUtils.apiCall(
        `${API_PREFIX}/patch/active_tables/${tableId}`,
        data
    );
    return { message: response.message };
}

// Tức là: /api/workspace/{workspaceId}/workflow/patch/active_tables/{tableId}
```

**❌ KHÔNG KHỚP**

---

### 2. Fields Config (Danh sách trường)

#### Tài liệu (`docs/02-fields-config.md`):

```typescript
// API Services trong tài liệu
const fieldAPI = {
  fetchFields: async (tableId: string) => {
    const response = await api.get(`/api/tables/${tableId}/fields`);
    return response.data;
  },

  createField: async (tableId: string, field: Field) => {
    const response = await api.post(`/api/tables/${tableId}/fields`, field);
    return response.data;
  },

  updateField: async (tableId: string, index: number, field: Field) => {
    const response = await api.put(`/api/tables/${tableId}/fields/${index}`, field);
    return response.data;
  },

  deleteField: async (tableId: string, index: number) => {
    await api.delete(`/api/tables/${tableId}/fields/${index}`);
  },
};
```

#### Code thực tế:

```javascript
// KHÔNG CÓ các endpoint riêng cho fields
// TẤT CẢ được update thông qua 1 endpoint duy nhất:
static async updateTable(tableId, data) {
    const response = await CommonUtils.apiCall(
        `${API_PREFIX}/patch/active_tables/${tableId}`,
        {
            name,
            description,
            config: {
                ...config,
                fields: this.fields,  // Fields nằm trong config
                actions: this.actions,
                quickFilters: this.quickFilters,
                // ... tất cả config khác
            }
        }
    );
}
```

**❌ KHÔNG KHỚP**

---

### 3. Actions Config (Danh sách hành động)

#### Tài liệu (`docs/03-actions-config.md`):

```typescript
// API Services trong tài liệu
const actionAPI = {
  fetchActions: async (tableId: string) => {
    const response = await api.get(`/api/tables/${tableId}/actions`);
    return response.data;
  },

  createAction: async (tableId: string, action: Action) => {
    const response = await api.post(`/api/tables/${tableId}/actions`, action);
    return response.data;
  },

  updateAction: async (tableId: string, actionId: string, action: Action) => {
    const response = await api.put(`/api/tables/${tableId}/actions/${actionId}`, action);
    return response.data;
  },
};
```

#### Code thực tế:

```javascript
// KHÔNG CÓ các endpoint riêng cho actions
// TẤT CẢ được update thông qua 1 endpoint duy nhất:
static async updateTable(tableId, data) {
    const response = await CommonUtils.apiCall(
        `${API_PREFIX}/patch/active_tables/${tableId}`,
        {
            config: {
                actions: this.actions,  // Actions nằm trong config
                // ...
            }
        }
    );
}
```

**❌ KHÔNG KHỚP**

---

## 🔍 API THỰC TẾ ĐƯỢC SỬ DỤNG

### Base URL & Prefix

```javascript
const API_BASE_URL = window.location.origin; // hoặc từ config
const API_PREFIX = `/api/workspace/${WORKSPACE_ID}/workflow`;
```

### Các endpoints thực tế:

#### 1. Lấy danh sách bảng

```javascript
GET (via POST) /api/workspace/{workspaceId}/workflow/get/active_tables
```

#### 2. Lấy chi tiết bảng

```javascript
GET (via POST) /api/workspace/{workspaceId}/workflow/get/active_tables/{tableId}
```

#### 3. Tạo bảng mới

```javascript
POST /api/workspace/{workspaceId}/workflow/post/active_tables
Body: {
  name: string,
  tableType: string,
  description: string,
  config: {
    title: string,
    fields: Field[],
    actions: Action[],
    quickFilters: QuickFilter[],
    tableLimit: number,
    e2eeEncryption: boolean,
    encryptionKey: string,
    encryptionAuthKey: string,
    hashedKeywordFields: string[],
    kanbanConfigs: KanbanConfig[],
    ganttCharts: GanttChart[],
    recordListConfig: RecordListConfig,
    recordDetailConfig: RecordDetailConfig,
    permissionsConfig: PermissionsConfig[]
  }
}
```

#### 4. Cập nhật bảng (TẤT CẢ CẤU HÌNH)

```javascript
PATCH (via POST) /api/workspace/{workspaceId}/workflow/patch/active_tables/{tableId}
Body: {
  name: string,
  description: string,
  config: {
    // TOÀN BỘ config bao gồm:
    // - fields
    // - actions
    // - quickFilters
    // - kanbanConfigs
    // - ganttCharts
    // - recordListConfig
    // - recordDetailConfig
    // - permissionsConfig
    // - tableLimit
    // - defaultSort
    // - hashedKeywordFields
    // - encryptionKey
    // - encryptionAuthKey
  }
}
```

#### 5. Xóa bảng

```javascript
DELETE (via POST) /api/workspace/{workspaceId}/workflow/delete/active_tables/{tableId}
```

#### 6. Lấy danh sách Teams

```javascript
POST /api/workspace/{workspaceId}/workspace/get/p/teams
Body: {
  queries: {
    fields: string,
    filtering: object
  }
}
```

#### 7. Lấy danh sách Team Roles

```javascript
POST /api/workspace/{workspaceId}/workspace/get/p/team_roles
Body: {
  constraints: {
    workspaceTeamId: string
  },
  queries: {
    fields: string
  }
}
```

#### 8. Lấy danh sách Users

```javascript
POST /api/workspace/{workspaceId}/workspace/get/users
Body: {
  queries: {
    fields: string,
    filtering: object
  }
}
```

---

## ⚡ ĐẶC ĐIỂM QUAN TRỌNG

### 1. **Một endpoint cho tất cả updates**

- Code thực tế **KHÔNG** có các endpoint riêng lẻ cho fields, actions, permissions, etc.
- **TẤT CẢ** được update thông qua 1 endpoint duy nhất: `PATCH /api/workspace/{workspaceId}/workflow/patch/active_tables/{tableId}`
- Mỗi lần "Lưu", toàn bộ config (fields, actions, permissions, layouts, ...) được gửi lên

### 2. **POST method cho GET operations**

```javascript
static async apiCall(endpoint, data = {}, isGetAction = false) {
    const options = {
        method: isGetAction ? 'POST' : 'POST',  // ← Luôn là POST!
        headers,
        body: JSON.stringify(data),
    };
}
```

- Các API GET thực chất dùng POST method
- Parameter `isGetAction` chỉ để phân biệt mục đích, không ảnh hưởng method

### 3. **Workspace-scoped URLs**

- Tất cả endpoints đều có prefix: `/api/workspace/{workspaceId}/`
- Có 2 nhóm:
  - `workflow/` - cho active tables
  - `workspace/` - cho teams, roles, users

---

## 📝 KHUYẾN NGHỊ

### 1. **Cập nhật tài liệu ngay lập tức** ✅ HOÀN THÀNH

Tài liệu hiện tại đang gây nhầm lẫn nghiêm trọng cho developers. Đã cập nhật:

- ✅ Xóa bỏ các API Services giả định (fetchFields, createField, updateField, deleteField, etc.)
- ✅ Thay bằng API thực tế: `updateTable()` với toàn bộ config
- ✅ Giải thích rõ: "Mọi thay đổi được lưu thông qua 1 endpoint PATCH duy nhất"
- ✅ Cập nhật: `01-general-config.md`, `02-fields-config.md`, `03-actions-config.md`
- ✅ Thêm warning và link đến tài liệu này trong README.md

### 2. **Thêm section "API Integration"**

Mỗi tài liệu cần có section mới:

```markdown
## API Integration

**⚠️ LƯU Ý QUAN TRỌNG**:
Không có API endpoint riêng cho [Fields/Actions/...].
Tất cả cấu hình được lưu thông qua endpoint:
```

PATCH /api/workspace/{workspaceId}/workflow/patch/active_tables/{tableId}

```

Khi người dùng nhấn nút "Lưu", toàn bộ config (bao gồm fields, actions, permissions, layouts, ...) được gửi lên cùng lúc.

Xem [API Endpoints Documentation](./API-ENDPOINTS.md) để biết chi tiết.
```

### 3. **Tạo tài liệu API chuyên dụng**

Nên tạo file `docs/API-ENDPOINTS.md` để document đầy đủ:

- Base URLs
- Authentication
- Request/Response formats
- Error handling
- Rate limiting (nếu có)

### 4. **Cập nhật ví dụ code**

Thay vì:

```typescript
// ❌ SAI - Không tồn tại trong thực tế
await fieldAPI.createField(tableId, field);
```

Dùng:

```typescript
// ✅ ĐÚNG - Cách thực tế hoạt động
DetailView.fields.push(field); // Thêm vào state local
// ... người dùng nhấn "Lưu"
await TableAPI.updateTable(tableId, {
  config: {
    fields: DetailView.fields,
    actions: DetailView.actions,
    // ... toàn bộ config
  },
});
```

---

## 🎯 KẾT LUẬN

**Tài liệu hiện tại (docs/) đang mô tả một RESTful API không tồn tại.**

Implementation thực tế sử dụng:

- ✅ 1 endpoint PATCH duy nhất cho mọi update
- ✅ POST method cho cả GET operations
- ✅ Workspace-scoped URLs
- ✅ Batch update toàn bộ config

**Ưu tiên cao: Cập nhật lại toàn bộ tài liệu API để khớp với code thực tế.**

---

## 🔧 VẤN ĐỀ PHỤ: Icon naming inconsistency

### Phát hiện:

- **Tài liệu**: Icon được gọi là `play`
- **Code thực tế**: Icon là `play_arrow` (Material Icons)

```html
<!-- Code thực tế -->
<option value="play_arrow">Play</option>
```

### Giải thích:

Đây KHÔNG phải là lỗi. Material Icons có:

- `play_arrow` - icon mũi tên play ▶
- `play_circle` - icon play trong vòng tròn
- `play_circle_outline` - icon play outline

Code đúng với Material Icons naming convention. Tài liệu có thể cập nhật để rõ ràng hơn nhưng không cần thiết phải thay đổi code.

---

## ✅ CẬP NHẬT HOÀN THÀNH (2025-01-04)

- ✅ File `01-general-config.md` - Đã cập nhật API Integration section
- ✅ File `02-fields-config.md` - Đã cập nhật API Integration section
- ✅ File `03-actions-config.md` - Đã cập nhật API Integration section
- ✅ File `README.md` - Đã thêm warning về API
- ✅ File `API-ENDPOINTS-ANALYSIS.md` - Tài liệu phân tích đầy đủ

**Kết quả:** Tài liệu giờ đã phản ánh chính xác cách API thực sự hoạt động trong code.
