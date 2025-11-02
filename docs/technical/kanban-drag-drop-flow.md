# Kanban Drag & Drop Flow Analysis

## Tổng quan

File HTML module cũ (`active-tables-v2.blade.php`) sử dụng một hệ thống kanban cơ bản với cấu hình được lưu trong table config. Hiện tại React app đã có `@dnd-kit` được cài đặt nhưng chưa được implement.

## 1. Cấu trúc dữ liệu Kanban Config

### Schema trong Swagger API

```yaml
KanbanConfig:
  type: object
  properties:
    kanbanScreenId:
      type: string
      description: UUID v7 của màn hình kanban
    screenName:
      type: string
      description: Tên màn hình hiển thị
    screenDescription:
      type: string
      description: Mô tả màn hình
    statusField:
      type: string
      description: Field name dùng làm trạng thái (phải là SELECT_ONE hoặc SELECT_ONE_WORKSPACE_USER)
    kanbanHeadlineField:
      type: string
      description: Field name hiển thị làm tiêu đề card
    displayFields:
      type: array
      items:
        type: string
      description: Danh sách field names hiển thị trên card
  required:
    - kanbanScreenId
    - screenName
    - statusField
    - kanbanHeadlineField
    - displayFields
```

### Lưu trong ActiveTableConfig

```typescript
interface ActiveTableConfig {
  // ... other fields
  kanbanConfigs: KanbanConfig[]; // Mảng các cấu hình kanban
  // ... other fields
}
```

**Location trong code**: [active-tables-v2.blade.php:1871-1874](../technical/html-module/active-tables-v2.blade.php#L1871-L1874)

## 2. Quản lý Kanban Config (Table Settings)

### 2.1 UI Configuration Flow

**File**: [active-tables-v2.blade.php:2254-2395](../technical/html-module/active-tables-v2.blade.php#L2254-L2395)

```javascript
// Hiển thị danh sách kanban configs
DetailView.renderKanbanConfigs() {
  const kanbanConfigList = document.getElementById('kanban-config-list');
  kanbanConfigList.innerHTML = this.kanbanConfigs.map((config, index) => {
    return `
      <div class="kanban-config-item">
        <div class="kanban-config-item-header">
          <span>${config.screenName}</span>
          <div class="field-actions">
            <span onclick="DetailView.editKanbanConfig(${index})">edit</span>
            <span onclick="DetailView.removeKanbanConfig(${index})">delete</span>
          </div>
        </div>
        <div>Trường trạng thái: ${field.label}</div>
      </div>
    `;
  }).join('');
}
```

### 2.2 Add/Edit Kanban Config

**Điều kiện**: Chỉ các field có type `SELECT_ONE` hoặc `SELECT_ONE_WORKSPACE_USER` mới có thể dùng làm status field.

```javascript
// Mở form cấu hình
DetailView.openKanbanConfigForm(index = null) {
  // Lọc các field phù hợp
  const eligibleFields = this.fields.filter(field =>
    ['SELECT_ONE', 'SELECT_ONE_WORKSPACE_USER'].includes(field.type)
  );

  // Populate dropdowns
  kanbanStatusField.innerHTML = eligibleFields.map(field =>
    `<option value="${field.name}">${field.label} (${field.type})</option>`
  );

  // Nếu edit, load data từ config hiện tại
  if (index !== null) {
    const config = this.kanbanConfigs[index];
    kanbanScreenId.value = config.screenId;
    kanbanScreenName.value = config.screenName;
    kanbanStatusField.value = config.statusField;
    // ...
  } else {
    // Tạo mới với UUID v7
    kanbanScreenId.value = CommonUtils.generateUUIDv7();
  }
}
```

### 2.3 Save Kanban Config

```javascript
DetailView.saveKanbanConfig() {
  const kanbanConfig = {
    kanbanScreenId: document.getElementById('kanban-screen-id').value,
    screenName: document.getElementById('kanban-screen-name').value,
    screenDescription: document.getElementById('kanban-screen-description').value,
    statusField: document.getElementById('kanban-status-field').value,
    kanbanHeadlineField: document.getElementById('kanban-headline-field').value,
    displayFields: $('#kanban-display-fields').val() || [],
  };

  // Thêm hoặc cập nhật trong mảng local
  if (this.editingKanbanConfigIndex !== null) {
    this.kanbanConfigs[this.editingKanbanConfigIndex] = kanbanConfig;
  } else {
    this.kanbanConfigs.push(kanbanConfig);
  }

  // Re-render UI
  this.renderKanbanConfigs();
}
```

**Lưu ý**: Config chỉ được lưu vào `this.kanbanConfigs` trong memory. Để persist, cần gọi API `PATCH /active_tables/{tableId}` với toàn bộ config.

### 2.4 API Call để lưu Table Config

**Endpoint**: `POST /api/workspace/{workspaceId}/workflow/patch/active_tables/{tableId}`

**Location**: [active-tables-v2.blade.php:1131](../technical/html-module/active-tables-v2.blade.php#L1131)

```javascript
const response = await CommonUtils.apiCall(`${API_PREFIX}/patch/active_tables/${tableId}`, {
  config: {
    title: this.title,
    fields: this.fields,
    actions: this.actions,
    quickFilters: this.quickFilters,
    kanbanConfigs: this.kanbanConfigs, // ← Gửi toàn bộ kanban configs
    recordListConfig: this.recordListConfig,
    // ... other config fields
  },
});
```

**Request Schema** (Swagger):

```yaml
ActiveTableMutationRequest:
  properties:
    config:
      $ref: '#/components/schemas/ActiveTableConfig'
  required:
    - config
```

## 3. Luồng Drag & Drop Records trong Kanban View

### 3.1 Tổng quan Flow

**Mục tiêu**: Khi kéo thả record từ column này sang column khác, cần update field `statusField` của record đó.

```
┌─────────────────────────────────────────────────────────────┐
│                     Kanban Board View                        │
├──────────────────┬──────────────────┬──────────────────────┤
│   Column: TODO   │ Column: DOING    │   Column: DONE       │
│                  │                  │                       │
│ ┌──────────────┐ │                  │                       │
│ │  Record #1   │ │                  │                       │
│ │  Headline    │ │                  │                       │
│ │  - Field 1   │ │                  │                       │
│ └──────────────┘ │                  │                       │
│       │          │                  │                       │
│       │ DRAG     │                  │                       │
│       └──────────┼──────────────────┤                       │
│                  │ ┌──────────────┐ │                       │
│                  │ │  Record #1   │ │ DROP here             │
│                  │ │  Headline    │ │                       │
│                  │ │  - Field 1   │ │                       │
│                  │ └──────────────┘ │                       │
└──────────────────┴──────────────────┴──────────────────────┘
```

### 3.2 Dữ liệu cần thiết

**Từ Kanban Config**:

- `statusField`: Tên field dùng làm trạng thái (e.g., "status")
- `kanbanHeadlineField`: Field hiển thị tiêu đề card
- `displayFields`: Array field names hiển thị trên card

**Từ Field Schema**:

```javascript
const statusFieldSchema = table.config.fields.find((f) => f.name === kanbanConfig.statusField);

// statusFieldSchema.type === "SELECT_ONE"
// statusFieldSchema.options = [
//   { value: "todo", label: "To Do", color: "#..." },
//   { value: "doing", label: "Doing", color: "#..." },
//   { value: "done", label: "Done", color: "#..." }
// ]
```

**Từ Records**:

```javascript
const records = [
  {
    recordId: '01234567-...',
    values: {
      status: 'todo', // ← statusField value
      title: 'Task 1', // ← kanbanHeadlineField value
      description: '...',
      // ... other fields
    },
  },
];
```

### 3.3 Group Records by Status

```javascript
function groupRecordsByStatus(records, statusFieldName) {
  const grouped = {};

  records.forEach((record) => {
    const statusValue = record.values[statusFieldName];
    if (!grouped[statusValue]) {
      grouped[statusValue] = [];
    }
    grouped[statusValue].push(record);
  });

  return grouped;
}

// Example usage:
const kanbanData = groupRecordsByStatus(records, kanbanConfig.statusField);
// Result:
// {
//   "todo": [record1, record2],
//   "doing": [record3],
//   "done": [record4, record5]
// }
```

### 3.4 Render Kanban Columns

**Từ field options** (không phải từ records):

```javascript
function renderKanbanBoard(kanbanConfig, fieldSchema, records) {
  const columns = fieldSchema.options.map((option) => {
    const columnRecords = records.filter((r) => r.values[kanbanConfig.statusField] === option.value);

    return {
      id: option.value,
      label: option.label,
      color: option.color,
      records: columnRecords,
    };
  });

  return columns;
}
```

**Lưu ý quan trọng**:

- Columns được tạo từ `fieldSchema.options`, **không phải** từ unique values trong records
- Điều này đảm bảo hiển thị đủ tất cả trạng thái, kể cả khi không có record nào

### 3.5 Drag & Drop Event Handler (Khái niệm)

**HTML Module cũ KHÔNG có implementation thực tế**, nhưng flow nên như sau:

```javascript
// Pseudo-code cho DnD flow
function onDragEnd(event) {
  const { active, over } = event;

  if (!over || active.id === over.id) return;

  const recordId = active.id; // Record đang kéo
  const oldStatus = active.data.current.status; // Status cũ
  const newStatus = over.id; // Column đích

  if (oldStatus === newStatus) return;

  // Optimistic update UI
  updateRecordStatusLocally(recordId, newStatus);

  // Call API
  updateRecordStatus(recordId, newStatus).catch((error) => {
    // Rollback on error
    updateRecordStatusLocally(recordId, oldStatus);
    showError(error);
  });
}
```

### 3.6 API Call để Update Record

**Endpoint**: `POST /api/workspace/{workspaceId}/workflow/patch/active_tables/{tableId}/records/{recordId}`

**Location**: [swagger.yaml:865-886](../swagger.yaml#L865-L886)

```javascript
async function updateRecordStatus(tableId, recordId, statusFieldName, newStatusValue) {
  const endpoint = `${API_PREFIX}/patch/active_tables/${tableId}/records/${recordId}`;

  const requestBody = {
    record: {
      [statusFieldName]: newStatusValue, // ← Chỉ update field trạng thái
    },
  };

  // Nếu table có E2EE, cần encrypt trước
  if (table.config.e2eeEncryption) {
    requestBody.record = await encryptRecord(requestBody.record, encryptionKey);
  }

  // Nếu field có trong hashedKeywordFields
  if (table.config.hashedKeywordFields.includes(statusFieldName)) {
    requestBody.hashed_keywords = {
      [statusFieldName]: hmacSha256(newStatusValue, encryptionKey),
    };
  }

  const response = await CommonUtils.apiCall(endpoint, requestBody);
  return response;
}
```

**Request Schema**:

```yaml
ActiveTableRecordUpdateRequest:
  type: object
  required:
    - record
  properties:
    record:
      type: object
      additionalProperties: true # Dynamic fields based on schema
    hashed_keywords:
      type: object
      nullable: true
      additionalProperties: true # For E2EE search
    record_hashes:
      type: object
      nullable: true
      additionalProperties: true # For E2EE ordering
```

**Response**:

```yaml
StandardResponse:
  properties:
    success:
      type: boolean
    message:
      type: string
    data:
      type: object
```

### 3.7 Encryption Handling (nếu E2EE enabled)

**Kiểm tra encryption**:

```javascript
const isEncrypted = table.config.e2eeEncryption;
const encryptionKey = localStorage.getItem(`table_${tableId}_encryption_key`);
```

**Các loại encryption dựa trên field type**:

| Field Type                | Encryption Method      | Use Case                                     |
| ------------------------- | ---------------------- | -------------------------------------------- |
| SELECT_ONE                | HMAC-SHA256            | Cho phép equality check (status === 'doing') |
| SELECT_ONE_WORKSPACE_USER | HMAC-SHA256            | Tương tự                                     |
| SHORT_TEXT, RICH_TEXT     | AES-256-CBC            | Full text encryption                         |
| INTEGER, NUMERIC          | OPE (Order-Preserving) | Cho phép range queries                       |
| DATE, DATETIME            | OPE                    | Cho phép sorting/filtering                   |

**Example encryption cho SELECT_ONE**:

```javascript
import CryptoJS from 'crypto-js';

function encryptSelectValue(value, encryptionKey) {
  // HMAC-SHA256 for exact match queries
  const hash = CryptoJS.HmacSHA256(value, encryptionKey).toString();
  return hash;
}

// Update request với encrypted value
const requestBody = {
  record: {
    status: newStatusValue, // Plaintext, server sẽ encrypt
  },
  hashed_keywords: {
    status: encryptSelectValue(newStatusValue, encryptionKey), // For search
  },
};
```

**Lưu ý**:

- Client gửi cả plaintext và hashed version
- Server lưu encrypted version + hash
- Query sau này dùng hash để tìm kiếm

## 4. Implementation với @dnd-kit

### 4.1 Cài đặt packages (Đã có)

```json
{
  "dependencies": {
    "@dnd-kit/core": "^6.3.1",
    "@dnd-kit/sortable": "^10.0.0",
    "@dnd-kit/utilities": "^3.2.2"
  }
}
```

### 4.2 Component Structure đề xuất

```
src/features/active-tables/
├── components/
│   ├── kanban/
│   │   ├── kanban-board.tsx          # Main kanban container
│   │   ├── kanban-column.tsx         # Droppable column
│   │   ├── kanban-card.tsx           # Draggable record card
│   │   ├── kanban-card-overlay.tsx   # Drag overlay component
│   │   └── use-kanban-dnd.ts         # DnD logic hook
│   └── ...
├── hooks/
│   ├── use-kanban-config.ts          # Hook to get kanban config
│   └── use-update-record.ts          # Mutation hook
└── ...
```

### 4.3 Basic Implementation Example

```typescript
// kanban-board.tsx
import { DndContext, DragOverlay } from '@dnd-kit/core';

export function KanbanBoard({ kanbanConfig, records, onUpdateRecord }) {
  const [activeId, setActiveId] = useState(null);

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const recordId = active.id;
    const newStatus = over.id;

    // Optimistic update
    onUpdateRecord(recordId, {
      [kanbanConfig.statusField]: newStatus
    });
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      {/* Render columns */}
      <DragOverlay>
        {activeId ? <KanbanCardOverlay id={activeId} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
```

## 5. API Endpoints Summary

### 5.1 Table Management

| Method | Endpoint                                   | Purpose                                         |
| ------ | ------------------------------------------ | ----------------------------------------------- |
| POST   | `/workflow/get/active_tables`              | List all tables                                 |
| POST   | `/workflow/get/active_tables/{tableId}`    | Get table details                               |
| POST   | `/workflow/post/active_tables`             | Create table                                    |
| POST   | `/workflow/patch/active_tables/{tableId}`  | **Update table config (bao gồm kanbanConfigs)** |
| POST   | `/workflow/delete/active_tables/{tableId}` | Delete table                                    |

### 5.2 Record Management

| Method | Endpoint                                                      | Purpose                     |
| ------ | ------------------------------------------------------------- | --------------------------- |
| POST   | `/workflow/get/active_tables/{tableId}/records`               | List records (with filters) |
| POST   | `/workflow/get/active_tables/{tableId}/records/{recordId}`    | Get record detail           |
| POST   | `/workflow/post/active_tables/{tableId}/records`              | Create record               |
| POST   | `/workflow/patch/active_tables/{tableId}/records/{recordId}`  | **Update record (cho DnD)** |
| POST   | `/workflow/delete/active_tables/{tableId}/records/{recordId}` | Delete record               |

**Note**: Tất cả đều là POST method (RPC-style API), không dùng RESTful verbs.

## 6. Key Takeaways

### ✅ Điểm mạnh của thiết kế hiện tại:

1. **Flexible config**: Mỗi table có thể có nhiều kanban views khác nhau
2. **Type-safe status field**: Chỉ cho phép SELECT_ONE/SELECT_ONE_WORKSPACE_USER
3. **E2EE support**: HMAC-SHA256 cho SELECT fields vẫn cho phép equality checks
4. **Customizable display**: Tự chọn headline field và display fields

### ⚠️ Limitations cần lưu ý:

1. **No drag ordering**: Không có field để lưu thứ tự cards trong cùng column
2. **No swimlanes**: Chỉ có 1 dimension grouping (status field)
3. **No WIP limits**: Không giới hạn số lượng cards per column
4. **Config in memory**: HTML module lưu config tạm trong `this.kanbanConfigs`, cần save table để persist

### 🚀 Implementation steps cho React app:

1. **Phase 1: Config Management**
   - UI để add/edit/remove kanban configs trong table settings
   - Validation cho eligible fields
   - Save/load từ API

2. **Phase 2: Basic Kanban View**
   - Render columns từ field options
   - Group records by status value
   - Display cards với headline + display fields

3. **Phase 3: Drag & Drop**
   - Setup @dnd-kit DndContext
   - Implement draggable cards + droppable columns
   - Handle onDragEnd event
   - API call để update record

4. **Phase 4: Optimization**
   - Optimistic updates
   - Loading states
   - Error handling & rollback
   - E2EE encryption cho status updates

## 7. Tài liệu tham khảo

- **API Spec**: [swagger.yaml](../swagger.yaml)
- **HTML Module**: [active-tables-v2.blade.php](../technical/html-module/active-tables-v2.blade.php)
- **@dnd-kit Docs**: https://docs.dndkit.com/
- **Design System**: [design-system.md](../design-system.md)
