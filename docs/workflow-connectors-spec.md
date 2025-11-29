# Đặc tả Module: Quản lý Kết nối (Workflow Connectors)

> **Phiên bản:** 2.0
> **Cập nhật:** 2025-11-29
> **Trạng thái:** Đề xuất thiết kế mới

## 1. Tổng quan

Module Workflow Connectors quản lý các kết nối đến dịch vụ bên thứ ba (SMTP, Google Sheets, Zalo OA, Kiotviet, Active Table). Các connector này được sử dụng trong Workflow Units để thực thi các hành động tự động.

### 1.1 Mục tiêu thiết kế mới

1. **Cải thiện UX Detail Page** - Tách biệt UI cho OAuth vs Credentials connectors
2. **Inline Connector Creation** - Cho phép tạo connector ngay trong workflow builder
3. **Connection Status** - Hiển thị trạng thái kết nối rõ ràng
4. **Progressive Disclosure** - Ẩn thông tin kỹ thuật không cần thiết

---

## 2. Kiến trúc Hệ thống

### 2.1 Phân loại Connector theo Authentication

| Type            | Auth Method      | Connectors             | UI Approach                      |
| --------------- | ---------------- | ---------------------- | -------------------------------- |
| **OAuth**       | OAuth2 Flow      | Google Sheets, Zalo OA | Status Card + Connect/Disconnect |
| **Credentials** | API Key/Password | SMTP, Kiotviet         | Form Fields + Test Connection    |
| **Internal**    | Table Reference  | Active Table           | Picker UI (dropdown)             |

### 2.2 Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     Workflow Builder                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────┐  │
│  │ Node Palette │ → │ Node Config │ → │ Connector Selector   │  │
│  └─────────────┘    └─────────────┘    │  ├─ Existing list    │  │
│                                        │  └─ + Create inline  │  │
│                                        └─────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Connector Management                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │ List View    │  │ Detail View  │  │ Inline Create Dialog │   │
│  │ (existing)   │  │ (redesigned) │  │ (new component)      │   │
│  └──────────────┘  └──────────────┘  └──────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Backend API                              │
│  POST /workflow/get/workflow_connectors                          │
│  POST /workflow/post/workflow_connectors                         │
│  POST /workflow/patch/workflow_connectors/{id}                   │
│  POST /workflow/delete/workflow_connectors/{id}                  │
│  POST /workflow/get/workflow_connectors/{id}/status (NEW)        │
│  POST /workflow/get/workflow_connectors/{id}/oauth2_state        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Cấu trúc Dữ liệu

### 3.1 ConnectorType (Static - Client)

```typescript
type ConnectorType = 'SMTP' | 'GOOGLE_SHEETS' | 'ZALO_OA' | 'KIOTVIET' | 'ACTIVE_TABLE';

interface ConnectorTypeDefinition {
  type: ConnectorType;
  name: string; // Tên hiển thị
  description: string; // Mô tả ngắn
  logo: string; // URL hoặc path
  authMethod: 'oauth' | 'credentials' | 'internal';
}
```

### 3.2 ConnectorConfigDefinition (Static - Client)

```typescript
type ConfigFieldType = 'text' | 'number' | 'password' | 'checkbox' | 'select';

interface ConfigFieldDefinition {
  name: string;
  type: ConfigFieldType;
  label: string;
  required: boolean;
  secret: boolean;
  readonly?: boolean;
  placeholder?: string;
  hint?: string; // NEW: Inline help text
  group?: string; // NEW: Group fields together
  showCondition?: string; // NEW: Progressive disclosure
}

interface ConnectorConfigDefinition {
  connectorType: ConnectorType;
  oauth: boolean;
  configFields: ConfigFieldDefinition[];
  fieldGroups?: FieldGroup[]; // NEW
}

interface FieldGroup {
  id: string;
  label: string;
  collapsed?: boolean; // For advanced settings
}
```

### 3.3 ConnectorInstance (Dynamic - API)

```typescript
interface ConnectorInstance {
  id: string;
  name: string;
  description: string;
  connectorType: ConnectorType;
  config: Record<string, unknown>;
  documentation?: string;

  // NEW fields
  connectionStatus?: ConnectionStatus;
  connectedAccount?: string; // Email/username for OAuth
  lastTestedAt?: string; // ISO 8601
  usedInWorkflows?: string[]; // Workflow IDs using this connector
  createdAt?: string;
  updatedAt?: string;
}

type ConnectionStatus =
  | 'connected' // OAuth active, credentials valid
  | 'disconnected' // Not configured
  | 'expired' // OAuth token expired
  | 'error'; // Connection test failed
```

### 3.4 Quick Create Input (NEW)

```typescript
// Minimal input for inline creation from workflow builder
interface QuickCreateConnectorInput {
  name: string;
  connectorType: ConnectorType;
  config?: Record<string, unknown>; // Optional initial config
}

// Response includes ID for immediate use
interface QuickCreateConnectorResponse {
  data: {
    id: string;
    name: string;
    connectorType: ConnectorType;
    connectionStatus: ConnectionStatus;
  };
  message: string;
}
```

---

## 4. API Endpoints

### 4.1 Existing Endpoints (Giữ nguyên)

| Method | Endpoint                                              | Mô tả           |
| ------ | ----------------------------------------------------- | --------------- |
| POST   | `/workflow/get/workflow_connectors`                   | Lấy danh sách   |
| POST   | `/workflow/get/workflow_connectors/{id}`              | Lấy chi tiết    |
| POST   | `/workflow/post/workflow_connectors`                  | Tạo mới         |
| POST   | `/workflow/patch/workflow_connectors/{id}`            | Cập nhật        |
| POST   | `/workflow/delete/workflow_connectors/{id}`           | Xóa             |
| POST   | `/workflow/get/workflow_connectors/{id}/oauth2_state` | Lấy OAuth state |

### 4.2 New Endpoints (Đề xuất)

#### 4.2.1 Connection Status

```
POST /api/workspace/{workspaceId}/workflow/get/workflow_connectors/{id}/status

Request Body: {}

Response:
{
  "data": {
    "status": "connected" | "disconnected" | "expired" | "error",
    "connectedAccount": "user@gmail.com",  // For OAuth
    "expiresAt": "2025-12-01T00:00:00Z",   // For OAuth
    "lastTestedAt": "2025-11-29T10:30:00Z",
    "errorMessage": null                    // If status is error
  }
}
```

#### 4.2.2 Test Connection

```
POST /api/workspace/{workspaceId}/workflow/post/workflow_connectors/{id}/test

Request Body: {}

Response:
{
  "data": {
    "success": true,
    "message": "Kết nối thành công",
    "testedAt": "2025-11-29T10:30:00Z",
    "details": {
      // Connector-specific details
      "smtpResponse": "250 OK",  // For SMTP
      "sheetsAccess": true       // For Google Sheets
    }
  }
}
```

#### 4.2.3 Quick Create (For Inline Creation)

```
POST /api/workspace/{workspaceId}/workflow/post/workflow_connectors/quick

Request Body:
{
  "name": "SMTP cho Workflow X",
  "connectorType": "SMTP",
  "config": {
    "host": "smtp.gmail.com",
    "port": 587
  }
}

Response:
{
  "data": {
    "id": "snowflake-id-123",
    "name": "SMTP cho Workflow X",
    "connectorType": "SMTP",
    "connectionStatus": "disconnected"
  },
  "message": "Tạo connector thành công"
}
```

#### 4.2.4 List Connectors by Type (For Selector)

```
POST /api/workspace/{workspaceId}/workflow/get/workflow_connectors/by-type

Request Body:
{
  "connectorType": "SMTP",  // Optional filter
  "includeStatus": true     // Include connection status
}

Response:
{
  "data": [
    {
      "id": "123",
      "name": "Email Marketing",
      "connectorType": "SMTP",
      "connectionStatus": "connected"
    },
    {
      "id": "456",
      "name": "Email Nội bộ",
      "connectorType": "SMTP",
      "connectionStatus": "error"
    }
  ]
}
```

---

## 5. Thiết kế UI/UX

### 5.1 Connector Detail Page (Redesigned)

#### 5.1.1 Layout Structure

```
┌─────────────────────────────────────────────────────────────────┐
│  HEADER                                                          │
│  ┌────┐                                                          │
│  │ ←  │  [Logo] Google Sheets    🟢 Đang hoạt động    [⚙️] [🗑️] │
│  └────┘  Marketing Automation                                    │
│          Sync dữ liệu với Google Sheets                          │
├─────────────────────────────────────────────────────────────────┤
│  MAIN CONTENT (2-column on desktop, stacked on mobile)          │
│  ┌──────────────────────────┐  ┌──────────────────────────────┐ │
│  │  🔐 XÁC THỰC             │  │  📖 HƯỚNG DẪN                │ │
│  │  ────────────────────────│  │  ──────────────────────────  │ │
│  │                          │  │                              │ │
│  │  [OAuth Card / Form]     │  │  ## Cách sử dụng             │ │
│  │                          │  │  1. Chọn spreadsheet...      │ │
│  │                          │  │  2. Cấp quyền truy cập...    │ │
│  │                          │  │                              │ │
│  │  ▼ Chi tiết kỹ thuật     │  │  💡 Tips: ...                │ │
│  │  (collapsed)             │  │                              │ │
│  └──────────────────────────┘  └──────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│  FOOTER                                                          │
│  🔗 Đang sử dụng trong: Workflow A, Workflow B          [Xem ▸] │
└─────────────────────────────────────────────────────────────────┘
```

#### 5.1.2 OAuth Connector UI (Google Sheets, Zalo OA)

**Trạng thái: Chưa kết nối**

```
┌─────────────────────────────────────────────────┐
│  🔐 Trạng thái kết nối          ⚪ Chưa kết nối │
│  ──────────────────────────────────────────────  │
│                                                 │
│  [Illustration: Connect cloud services]         │
│                                                 │
│  Để sử dụng connector này, bạn cần đăng         │
│  nhập và cấp quyền truy cập cho Beqeek.         │
│                                                 │
│        [🔗 Kết nối với Google]                  │
│                                                 │
└─────────────────────────────────────────────────┘
```

**Trạng thái: Đã kết nối**

```
┌─────────────────────────────────────────────────┐
│  🔐 Trạng thái kết nối        🟢 Đang hoạt động │
│  ──────────────────────────────────────────────  │
│                                                 │
│  📧 user@gmail.com                              │
│  🕐 Kết nối lúc: 29/11/2025, 10:30              │
│  ⏰ Token tự động làm mới                        │
│                                                 │
│  [Ngắt kết nối]  [Kết nối tài khoản khác]       │
│                                                 │
│  ▼ Chi tiết kỹ thuật                            │
│  ┌───────────────────────────────────────────┐  │
│  │ Scopes: spreadsheets.readonly, drive...   │  │
│  │ Token expires: 2025-11-29T12:30:00Z       │  │
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

#### 5.1.3 Credentials Connector UI (SMTP, Kiotviet)

```
┌─────────────────────────────────────────────────┐
│  🔐 Cấu hình SMTP                               │
│  ──────────────────────────────────────────────  │
│                                                 │
│  ┌─ Thông tin máy chủ ─────────────────────┐   │
│  │  SMTP Host *        [smtp.gmail.com    ]│   │
│  │                     ℹ️ VD: smtp.gmail.com│   │
│  │  Port *             [587              ]│   │
│  │                     📌 Phổ biến: 587, 465│   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ┌─ Thông tin đăng nhập ───────────────────┐   │
│  │  Username *         [email@example.com ]│   │
│  │  Password *         [••••••••••••••••• ]│   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ┌─ Thông tin gửi mail ────────────────────┐   │
│  │  From Email *       [noreply@company.vn]│   │
│  │  From Name          [Company Name      ]│   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ▼ Tùy chọn nâng cao                           │
│  ┌─────────────────────────────────────────┐   │
│  │  ☐ Check Daily Unique                   │   │
│  │  ☐ Tracking Email                       │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  [🔌 Kiểm tra kết nối]        [💾 Lưu cấu hình] │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 5.2 Inline Connector Creation (NEW)

#### 5.2.1 Trigger Point trong Workflow Builder

Khi user chọn node cần connector (SMTP, Google Sheet, Table), config panel hiển thị:

```
┌─────────────────────────────────────────────────┐
│  📧 Gửi Email (SMTP)                            │
│  ──────────────────────────────────────────────  │
│                                                 │
│  Connector *                                    │
│  ┌─────────────────────────────────────────┐   │
│  │  [🔍] Chọn connector...              ▼  │   │
│  │  ──────────────────────────────────────  │   │
│  │  📧 Email Marketing        🟢 Connected │   │
│  │  📧 Email Nội bộ           🔴 Error     │   │
│  │  ──────────────────────────────────────  │   │
│  │  [+ Tạo connector mới]                  │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  To *            [{{ input.email }}]           │
│  Subject *       [Xác nhận đơn hàng]           │
│  Body *          [...]                         │
└─────────────────────────────────────────────────┘
```

#### 5.2.2 Quick Create Dialog

```
┌─────────────────────────────────────────────────────────────────┐
│  ✨ Tạo Connector SMTP mới                              [✕]    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Tên định danh *                                                │
│  [Email cho Workflow Đơn hàng                               ]   │
│                                                                 │
│  Mô tả                                                          │
│  [Gửi email xác nhận đơn hàng cho khách                    ]   │
│                                                                 │
│  ──────────────────────────────────────────────────────────────  │
│                                                                 │
│  ⚡ Cấu hình nhanh (tùy chọn)                                   │
│                                                                 │
│  SMTP Host           [smtp.gmail.com                        ]   │
│  Port                [587                                   ]   │
│                                                                 │
│  💡 Bạn có thể hoàn thiện cấu hình sau trong trang Kết nối     │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                           [Hủy]    [Tạo và sử dụng]            │
└─────────────────────────────────────────────────────────────────┘
```

#### 5.2.3 Flow sau khi tạo inline

```
User tạo connector inline
         │
         ▼
┌─────────────────────┐
│ API: Quick Create   │
│ POST .../quick      │
└─────────────────────┘
         │
         ▼
┌─────────────────────┐    ┌─────────────────────┐
│ Connector created   │───▶│ Auto-select in      │
│ with basic info     │    │ node config         │
└─────────────────────┘    └─────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────┐
│ Toast notification:                              │
│ "Đã tạo connector. [Cấu hình đầy đủ ▸]"        │
└─────────────────────────────────────────────────┘
```

### 5.3 Connector Selector Component

```typescript
interface ConnectorSelectorProps {
  connectorType: ConnectorType;
  value?: string;  // Selected connector ID
  onChange: (connectorId: string) => void;
  onCreateNew?: () => void;
  showStatus?: boolean;
  disabled?: boolean;
}

// Usage in NodeConfigPanel
<ConnectorSelector
  connectorType="SMTP"
  value={selectedConnectorId}
  onChange={handleConnectorChange}
  onCreateNew={() => setShowQuickCreateDialog(true)}
  showStatus
/>
```

### 5.4 Connection Status Badge

```typescript
interface ConnectionStatusBadgeProps {
  status: ConnectionStatus;
  size?: 'sm' | 'md';
}

const STATUS_CONFIG = {
  connected: {
    color: 'green',
    icon: '🟢',
    label: 'Đang hoạt động',
    labelShort: 'OK',
  },
  disconnected: {
    color: 'gray',
    icon: '⚪',
    label: 'Chưa kết nối',
    labelShort: '—',
  },
  expired: {
    color: 'orange',
    icon: '🟠',
    label: 'Cần kết nối lại',
    labelShort: 'Hết hạn',
  },
  error: {
    color: 'red',
    icon: '🔴',
    label: 'Lỗi kết nối',
    labelShort: 'Lỗi',
  },
};
```

---

## 6. Component Structure

```
features/workflow-connectors/
├── api/
│   ├── connector-api.ts      # API client
│   ├── query-keys.ts         # React Query keys
│   └── types.ts              # API types
│
├── components/
│   ├── connector-card.tsx
│   ├── connector-list-item.tsx
│   ├── category-tabs.tsx
│   ├── search-input.tsx
│   ├── empty-state.tsx
│   │
│   │── detail/                        # NEW: Detail page components
│   │   ├── connector-header.tsx
│   │   ├── oauth-status-card.tsx
│   │   ├── credentials-form.tsx
│   │   ├── documentation-panel.tsx
│   │   ├── usage-footer.tsx
│   │   └── technical-details.tsx
│   │
│   ├── selector/                      # NEW: Selector components
│   │   ├── connector-selector.tsx
│   │   ├── connector-option.tsx
│   │   └── quick-create-dialog.tsx
│   │
│   ├── shared/                        # NEW: Shared components
│   │   ├── connection-status-badge.tsx
│   │   ├── connector-icon.tsx
│   │   └── test-connection-button.tsx
│   │
│   ├── create-connector-dialog.tsx
│   └── edit-connector-dialog.tsx
│
├── hooks/
│   ├── use-connectors.ts
│   ├── use-connector.ts
│   ├── use-connection-status.ts      # NEW
│   ├── use-test-connection.ts        # NEW
│   └── use-quick-create.ts           # NEW
│
├── pages/
│   ├── connector-list-page.tsx
│   ├── connector-select-page.tsx
│   └── connector-detail-page.tsx     # REDESIGNED
│
└── utils/
    └── connector-metadata.ts
```

---

## 7. Implementation Priority

### Phase 1: Core Improvements

1. Connection Status Badge component
2. API endpoint `/status`
3. Redesign Detail Page layout
4. Separate OAuth vs Credentials UI

### Phase 2: Inline Creation

1. ConnectorSelector component
2. QuickCreateDialog component
3. API endpoint `/quick`
4. Integration with NodeConfigPanel

### Phase 3: Enhanced Features

1. Test Connection functionality
2. Usage tracking (workflows using connector)
3. Documentation panel improvements
4. Error recovery flows

---

## 8. Migration Notes

### 8.1 Breaking Changes

- Không có breaking changes cho API hiện tại
- Các endpoint mới là bổ sung, không thay thế

### 8.2 Backward Compatibility

- Detail page cũ vẫn hoạt động trong quá trình chuyển đổi
- Feature flag `NEW_CONNECTOR_UI` để rollout dần

### 8.3 Data Migration

- Không cần migration database
- `connectionStatus` được tính toán runtime từ config

---

## 9. Câu hỏi mở

1. **Multiple accounts per type?** - Có cho phép nhiều Google accounts cho cùng 1 workspace không?
2. **Connector sharing?** - Có share connector giữa các workspace không?
3. **Audit log?** - Cần log lịch sử thay đổi connector không?
4. **Rate limiting?** - Giới hạn số lần test connection?
