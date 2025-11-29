# Đặc tả Module: Soạn thảo Luồng (Workflow Units)

> **Phiên bản:** 2.0
> **Cập nhật:** 2025-11-29
> **Trạng thái:** Đề xuất thiết kế mới

## 1. Tổng quan

Module Workflow Units là công cụ low-code/no-code cho phép xây dựng quy trình tự động hóa. Mỗi Luồng (Workflow Unit) chứa nhiều Sự kiện (Event), mỗi sự kiện được kích hoạt bởi trigger và thực thi chuỗi hành động định nghĩa bằng YAML.

### 1.1 Điểm mới trong phiên bản 2.0

1. **Inline Connector Creation** - Tạo connector ngay trong workflow builder
2. **Improved Node Config Panel** - Form cấu hình chi tiết cho từng loại node
3. **Connector Selector** - Component chọn và tạo connector thông minh
4. **Real-time Validation** - Kiểm tra cấu hình trước khi lưu

---

## 2. Kiến trúc Hệ thống

### 2.1 Hierarchy

```
Workspace
└── Workflow Units (Luồng)
    └── Workflow Events (Sự kiện)
        ├── Trigger (Nguồn kích hoạt)
        │   ├── SCHEDULE (Cron)
        │   ├── WEBHOOK (HTTP)
        │   ├── OPTIN_FORM (Form submit)
        │   └── ACTIVE_TABLE (Table action)
        │
        └── Logic (YAML/Blockly)
            ├── Actions (Hành động)
            │   ├── table_operation → [Connector: ACTIVE_TABLE]
            │   ├── smtp_email → [Connector: SMTP]
            │   ├── google_sheet → [Connector: GOOGLE_SHEETS]
            │   ├── api_call → (no connector)
            │   └── ...
            │
            └── Logic Blocks
                ├── condition
                ├── loop
                ├── match
                └── ...
```

### 2.2 Connector Dependencies

| Node Type         | Requires Connector | Connector Type |
| ----------------- | ------------------ | -------------- |
| `table_operation` | ✅                 | ACTIVE_TABLE   |
| `smtp_email`      | ✅                 | SMTP           |
| `google_sheet`    | ✅                 | GOOGLE_SHEETS  |
| `api_call`        | ❌                 | -              |
| `user_operation`  | ❌                 | -              |
| `delay`           | ❌                 | -              |
| `log`             | ❌                 | -              |
| `condition`       | ❌                 | -              |
| `loop`            | ❌                 | -              |
| `match`           | ❌                 | -              |
| `math`            | ❌                 | -              |
| `definition`      | ❌                 | -              |

---

## 3. Cấu trúc Dữ liệu

### 3.1 WorkflowUnit (Luồng)

```typescript
interface WorkflowUnit {
  id: string; // Snowflake ID
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}
```

### 3.2 WorkflowEvent (Sự kiện)

```typescript
type EventSourceType = 'SCHEDULE' | 'WEBHOOK' | 'OPTIN_FORM' | 'ACTIVE_TABLE';

interface WorkflowEvent {
  id: string;
  workflowUnit: string; // FK to WorkflowUnit
  eventName: string;
  eventSourceType: EventSourceType;
  eventSourceParams: EventSourceParams;
  eventActive: boolean;
  yaml: string; // YAML logic content
  responseId: string; // WebSocket console ID
}

// Discriminated union for eventSourceParams
type EventSourceParams = ScheduleParams | WebhookParams | OptinFormParams | ActiveTableParams;

interface ScheduleParams {
  expression: string; // Cron expression
}

interface WebhookParams {
  webhookId: string; // UUID for webhook URL
}

interface OptinFormParams {
  formId: string;
  webhookId: string;
  actionId?: string;
}

interface ActiveTableParams {
  tableId: string;
  actionId: string;
  webhookId: string; // Same as actionId
}
```

### 3.3 Node Types (For Visual Builder)

```typescript
type NodeType =
  // Triggers (4)
  | 'trigger_schedule'
  | 'trigger_webhook'
  | 'trigger_form'
  | 'trigger_table'
  // Actions (7)
  | 'table_operation'
  | 'smtp_email'
  | 'google_sheet'
  | 'api_call'
  | 'user_operation'
  | 'delay'
  | 'log'
  // Logic (6)
  | 'condition'
  | 'match'
  | 'loop'
  | 'math'
  | 'definition'
  | 'log_logic';

type NodeCategory = 'trigger' | 'action' | 'logic';

interface NodeDefinition {
  type: NodeType;
  label: string;
  category: NodeCategory;
  icon: string; // Lucide icon name
  description: string;
  defaultData: Partial<WorkflowNodeData>;
  requiresConnector?: ConnectorType; // NEW: Connector dependency
}
```

### 3.4 Node Data Types với Connector

```typescript
// Nodes requiring connector
interface TableOperationData extends BaseNodeData {
  connector: string; // Connector ID (ACTIVE_TABLE type)
  action: 'get_list' | 'get_one' | 'create' | 'update' | 'delete' | 'comment_create' | 'comment_get_one';
  record?: string;
  query?: TableQuery;
  data?: Record<string, unknown>;
  content?: string; // For comments
}

interface SmtpEmailData extends BaseNodeData {
  connector: string; // Connector ID (SMTP type)
  to: string;
  toName?: string;
  subject: string;
  body: string;
  cc?: string;
  bcc?: string;
}

interface GoogleSheetData extends BaseNodeData {
  connector: string; // Connector ID (GOOGLE_SHEETS type)
  action: 'sheet_create' | 'sheet_append' | 'sheet_read' | 'sheet_update';
  sheetId?: string;
  title?: string; // For sheet_create
  range?: string;
  values?: unknown[][];
}

// Nodes without connector
interface ApiCallData extends BaseNodeData {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  requestType: 'json' | 'form_params' | 'multipart';
  responseFormat: 'json' | 'text' | 'base64';
  headers?: Record<string, string>;
  payload?: unknown;
}
```

---

## 4. YAML Logic Reference

### 4.1 Block Types với Connector

#### 4.1.1 Table Operation (với connector)

```yaml
stages:
  - name: get_orders
    blocks:
      - type: table
        name: orders_list
        input:
          connector: '123456789012345678' # ACTIVE_TABLE connector ID
          action: get_list
          query:
            filter:
              status: 'pending'
            sort:
              - 'created_at:desc'
            limit: 10
```

#### 4.1.2 SMTP Email (với connector)

```yaml
stages:
  - name: send_notification
    blocks:
      - type: smtp_email
        name: order_confirmation
        input:
          connector: '987654321098765432' # SMTP connector ID
          to: '$[input.customer_email]'
          toName: '$[input.customer_name]'
          subject: 'Xác nhận đơn hàng #$[input.order_id]'
          body: |
            Cảm ơn bạn đã đặt hàng!

            Mã đơn hàng: $[input.order_id]
            Tổng tiền: {{ .workflowData.total }}
```

#### 4.1.3 Google Sheet (với connector)

```yaml
stages:
  - name: log_to_sheet
    blocks:
      - type: google_sheet
        name: append_order
        input:
          connector: '111222333444555666' # GOOGLE_SHEETS connector ID
          action: sheet_append
          sheet_id: 'your_sheet_id'
          range: 'A1'
          values:
            - ['$[input.order_id]', '$[input.customer_name]', '{{ .workflowData.total }}']
```

### 4.2 Block Types không cần Connector

#### 4.2.1 API Call

```yaml
stages:
  - name: call_external
    blocks:
      - type: api_call
        name: get_weather
        input:
          url: 'https://api.weather.com/v1/current'
          method: POST
          request_type: json
          response_format: json
          headers:
            Authorization: 'Bearer $[config.api_key]'
          payload:
            city: 'Hanoi'
```

#### 4.2.2 Logic Blocks

```yaml
# Condition
- type: condition
  name: check_vip
  input:
    expressions:
      - operator: greater_than_or_equals
        operand: '{{ .workflowData.total }}'
        value: 1000000
  then:
    - type: log
      name: log_vip
      input:
        message: 'VIP customer order'
        level: info
  else:
    - type: log
      name: log_regular
      input:
        message: 'Regular order'
        level: info

# Loop
- type: loop
  name: process_items
  input:
    array: '{{ .workflowData.items }}'
    iterator: item
  blocks:
    - type: log
      name: log_item
      input:
        message: 'Processing item: $[item.name]'
        level: info

# Match
- type: match
  name: route_by_region
  input:
    value: '$[input.region]'
    cases:
      - pattern: 'north'
        then:
          - type: smtp_email
            name: email_north
            input:
              connector: 'north_smtp_connector'
              to: 'north@company.com'
              subject: 'New order from North'
              body: '...'
      - pattern: '*'
        then:
          - type: log
            name: log_default
            input:
              message: 'Unknown region'
              level: warn

# Math
- type: math
  name: calc_total
  input:
    aggregate: sum
    expressions:
      - operator: multiply
        left: '{{ .workflowData.price }}'
        right: '{{ .workflowData.quantity }}'
      - operator: add
        left: 0
        right: '{{ .workflowData.shipping }}'

# Definition
- type: definition
  name: set_vars
  input:
    data:
      discount: 0.1
      max_items: 100

# Delay
- type: delay
  name: wait_5min
  input:
    duration:
      value: 5
      unit: minutes
  callback: 'check_payment'
```

---

## 5. API Endpoints

### 5.1 Workflow Unit APIs

| Method | Endpoint                               | Mô tả           |
| ------ | -------------------------------------- | --------------- |
| POST   | `/workflow/get/workflow_units`         | Danh sách luồng |
| POST   | `/workflow/get/workflow_units/{id}`    | Chi tiết luồng  |
| POST   | `/workflow/post/workflow_units`        | Tạo luồng       |
| POST   | `/workflow/patch/workflow_units/{id}`  | Cập nhật luồng  |
| POST   | `/workflow/delete/workflow_units/{id}` | Xóa luồng       |

### 5.2 Workflow Event APIs

| Method | Endpoint                                | Mô tả             |
| ------ | --------------------------------------- | ----------------- |
| POST   | `/workflow/get/workflow_events`         | Danh sách sự kiện |
| POST   | `/workflow/get/workflow_events/{id}`    | Chi tiết sự kiện  |
| POST   | `/workflow/post/workflow_events`        | Tạo sự kiện       |
| POST   | `/workflow/patch/workflow_events/{id}`  | Cập nhật sự kiện  |
| POST   | `/workflow/delete/workflow_events/{id}` | Xóa sự kiện       |

### 5.3 Helper APIs

| Method | Endpoint                           | Mô tả                          |
| ------ | ---------------------------------- | ------------------------------ |
| POST   | `/workflow/get/workflow_forms`     | Danh sách forms (cho trigger)  |
| POST   | `/workflow/get/active_tables`      | Danh sách tables (cho trigger) |
| POST   | `/workflow/get/active_tables/{id}` | Chi tiết table + actions       |

### 5.4 New APIs (Đề xuất)

#### 5.4.1 Validate YAML

```
POST /api/workspace/{workspaceId}/workflow/post/workflow_events/validate

Request Body:
{
  "yaml": "stages:\n  - name: test\n    blocks: []",
  "validateConnectors": true  // Check if connectors exist and are valid
}

Response:
{
  "data": {
    "valid": true,
    "errors": [],
    "warnings": [
      {
        "line": 5,
        "message": "Connector 'xyz' chưa được cấu hình"
      }
    ],
    "connectorStatus": {
      "123456789": { "exists": true, "status": "connected" },
      "987654321": { "exists": true, "status": "error" }
    }
  }
}
```

#### 5.4.2 Get Connectors for Node Type

```
POST /api/workspace/{workspaceId}/workflow/get/connectors-for-node

Request Body:
{
  "nodeType": "smtp_email"
}

Response:
{
  "data": {
    "requiredType": "SMTP",
    "connectors": [
      {
        "id": "123",
        "name": "Email Marketing",
        "status": "connected"
      },
      {
        "id": "456",
        "name": "Email Nội bộ",
        "status": "error"
      }
    ]
  }
}
```

### 5.5 WebSocket (Console)

```
Endpoint: ws://connect.o1erp.com
Params: ?sys={WORKSPACE_ID}&token=nvmteam&response_id={responseId}

// Incoming messages
{
  "type": "log",
  "timestamp": "2025-11-29T10:30:00Z",
  "level": "info",
  "message": "Processing order #123",
  "context": { "order_id": "123" }
}
```

---

## 6. Thiết kế UI/UX

### 6.1 Node Config Panel với Connector Selector

#### 6.1.1 SMTP Email Node

```
┌─────────────────────────────────────────────────┐
│  📧 Gửi Email                                   │
│  ──────────────────────────────────────────────  │
│                                                 │
│  Connector SMTP *                               │
│  ┌─────────────────────────────────────────┐   │
│  │  [🔍] Chọn connector...              ▼  │   │
│  │  ──────────────────────────────────────  │   │
│  │  📧 Email Marketing        🟢          │   │
│  │  📧 Email Nội bộ           🔴 Lỗi      │   │
│  │  ──────────────────────────────────────  │   │
│  │  [+ Tạo connector mới]                  │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ────────────────────────────────────────────── │
│                                                 │
│  Người nhận *                                   │
│  [{{ input.customer_email }}              ]    │
│  ℹ️ Hỗ trợ biến: $[input.field], {{ .var }}    │
│                                                 │
│  Tên người nhận                                 │
│  [{{ input.customer_name }}               ]    │
│                                                 │
│  Tiêu đề *                                      │
│  [Xác nhận đơn hàng #$[input.order_id]    ]    │
│                                                 │
│  Nội dung *                                     │
│  ┌─────────────────────────────────────────┐   │
│  │ Cảm ơn bạn đã đặt hàng!                 │   │
│  │                                         │   │
│  │ Mã đơn hàng: $[input.order_id]          │   │
│  │ Tổng tiền: {{ .workflowData.total }}    │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ▼ Tùy chọn nâng cao                           │
│  ┌─────────────────────────────────────────┐   │
│  │  CC    [                              ] │   │
│  │  BCC   [                              ] │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
└─────────────────────────────────────────────────┘
```

#### 6.1.2 Table Operation Node

```
┌─────────────────────────────────────────────────┐
│  📊 Thao tác Bảng                               │
│  ──────────────────────────────────────────────  │
│                                                 │
│  Connector Bảng *                               │
│  ┌─────────────────────────────────────────┐   │
│  │  [🔍] Chọn bảng...                   ▼  │   │
│  │  ──────────────────────────────────────  │   │
│  │  📋 Đơn hàng              🟢           │   │
│  │  📋 Khách hàng            🟢           │   │
│  │  📋 Sản phẩm              🟢           │   │
│  │  ──────────────────────────────────────  │   │
│  │  [+ Tạo connector mới]                  │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  Hành động *                                    │
│  ┌─────────────────────────────────────────┐   │
│  │  ○ Lấy danh sách (get_list)            │   │
│  │  ○ Lấy một bản ghi (get_one)           │   │
│  │  ● Tạo mới (create)                    │   │
│  │  ○ Cập nhật (update)                   │   │
│  │  ○ Xóa (delete)                        │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ────────────────────────────────────────────── │
│                                                 │
│  Dữ liệu tạo mới                               │
│  ┌─────────────────────────────────────────┐   │
│  │ {                                       │   │
│  │   "name": "$[input.name]",              │   │
│  │   "email": "$[input.email]"             │   │
│  │ }                                       │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
└─────────────────────────────────────────────────┘
```

#### 6.1.3 Google Sheet Node

```
┌─────────────────────────────────────────────────┐
│  📊 Google Sheet                                │
│  ──────────────────────────────────────────────  │
│                                                 │
│  Connector Google Sheet *                       │
│  ┌─────────────────────────────────────────┐   │
│  │  [🔍] Chọn connector...              ▼  │   │
│  │  ──────────────────────────────────────  │   │
│  │  📊 Sheet Báo cáo         🟢           │   │
│  │  📊 Sheet Marketing       🟠 Hết hạn   │   │
│  │  ──────────────────────────────────────  │   │
│  │  [+ Tạo connector mới]                  │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ⚠️ Connector "Sheet Marketing" cần kết nối lại│
│     [Đi đến trang Kết nối ▸]                   │
│                                                 │
│  Hành động *                                    │
│  [Nối dữ liệu (sheet_append)              ▼]   │
│                                                 │
│  Sheet ID *                                     │
│  [1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74Ogv...]  │
│                                                 │
│  Range *                                        │
│  [A1                                      ]    │
│                                                 │
│  Dữ liệu                                        │
│  ┌─────────────────────────────────────────┐   │
│  │ [                                       │   │
│  │   ["$[input.name]", "$[input.email]"]   │   │
│  │ ]                                       │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 6.2 Quick Create Connector Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     WORKFLOW BUILDER                             │
│  ┌─────────────┐                    ┌───────────────────────┐   │
│  │ Node Palette│                    │ Node Config Panel     │   │
│  │             │                    │                       │   │
│  │ [📧 Email]  │ ──drag──────────▶ │ Connector: [None]  ▼  │   │
│  │             │                    │ [+ Tạo connector mới] │   │
│  └─────────────┘                    └───────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                                              │
                                              │ click
                                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  ✨ Tạo Connector SMTP mới                              [✕]    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Tên *                                                          │
│  [Email cho workflow này                                   ]   │
│                                                                 │
│  ⚡ Cấu hình nhanh (tùy chọn)                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Host   [smtp.gmail.com]    Port [587]                  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  💡 Hoàn thiện cấu hình sau tại Kết nối > [Tên connector]      │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                           [Hủy]    [Tạo và sử dụng]            │
└─────────────────────────────────────────────────────────────────┘
                                              │
                                              │ success
                                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Node Config Panel                                              │
│                                                                 │
│  Connector: [📧 Email cho workflow này  🟡] ▼                  │
│             ↑ Auto-selected                                     │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  ⚠️ Connector chưa cấu hình đầy đủ                      │   │
│  │  [Cấu hình ngay ▸]                                      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  [Tiếp tục cấu hình các trường khác...]                       │
└─────────────────────────────────────────────────────────────────┘
```

### 6.3 Connector Status trong Canvas

```
┌─────────────────────────────────────────────────────────────────┐
│  WORKFLOW CANVAS                                                 │
│                                                                 │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐  │
│  │ ⏰ Schedule  │──────│ 📊 Get Data  │──────│ 📧 Send Email│  │
│  │              │      │ 🟢 OK        │      │ 🔴 Error     │  │
│  └──────────────┘      └──────────────┘      └──────────────┘  │
│                                                   │              │
│                               Click to see error ─┘              │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  ⚠️ Node "Send Email" có vấn đề:                          │  │
│  │  • Connector "Email Marketing" đang bị lỗi kết nối        │  │
│  │  [Kiểm tra connector ▸]                                   │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 7. Component Structure

```
features/workflow-units/
├── api/
│   ├── workflow-unit-api.ts
│   ├── workflow-event-api.ts
│   └── query-keys.ts
│
├── components/
│   ├── workflow-unit-card.tsx
│   ├── event-card.tsx
│   ├── event-list-sidebar.tsx
│   ├── trigger-config-form.tsx
│   ├── console-viewer.tsx
│   │
│   ├── dialogs/
│   │   ├── create-workflow-unit-dialog.tsx
│   │   ├── create-event-dialog.tsx
│   │   ├── edit-workflow-unit-dialog.tsx
│   │   ├── edit-event-dialog.tsx
│   │   └── delete-confirm-dialog.tsx
│   │
│   └── workflow-builder/
│       ├── workflow-canvas.tsx
│       ├── canvas-header.tsx
│       ├── node-palette.tsx
│       ├── yaml-editor.tsx
│       ├── editor-mode-toggle.tsx
│       │
│       ├── nodes/
│       │   ├── base-workflow-node.tsx
│       │   └── index.tsx
│       │
│       ├── node-config/                    # NEW: Enhanced config
│       │   ├── node-config-panel.tsx
│       │   ├── node-config-drawer.tsx
│       │   │
│       │   ├── forms/                      # Node-specific forms
│       │   │   ├── smtp-email-form.tsx
│       │   │   ├── table-operation-form.tsx
│       │   │   ├── google-sheet-form.tsx
│       │   │   ├── api-call-form.tsx
│       │   │   ├── condition-form.tsx
│       │   │   ├── loop-form.tsx
│       │   │   └── ...
│       │   │
│       │   └── fields/                     # Reusable form fields
│       │       ├── connector-selector.tsx  # NEW
│       │       ├── variable-input.tsx
│       │       ├── json-editor.tsx
│       │       └── cron-input.tsx
│       │
│       └── validation/                     # NEW: YAML validation
│           ├── yaml-validator.ts
│           └── connector-validator.ts
│
├── hooks/
│   ├── use-workflow-units.ts
│   ├── use-workflow-events.ts
│   ├── use-workflow-editor-store.ts
│   └── use-node-connectors.ts             # NEW
│
├── stores/
│   └── workflow-editor-store.ts
│
├── pages/
│   ├── workflow-units-page.tsx
│   ├── workflow-unit-detail-page.tsx
│   └── workflow-event-builder-page.tsx
│
├── types/
│   └── console-types.ts
│
└── utils/
    ├── node-types.ts
    ├── yaml-generator.ts
    └── node-connector-map.ts              # NEW
```

---

## 8. Node-Connector Mapping

```typescript
// utils/node-connector-map.ts

import type { NodeType } from './node-types';
import type { ConnectorType } from '@workspace/beqeek-shared/workflow-connectors';

/**
 * Map node types to required connector types
 */
export const NODE_CONNECTOR_MAP: Partial<Record<NodeType, ConnectorType>> = {
  // Actions requiring connectors
  table_operation: 'ACTIVE_TABLE',
  smtp_email: 'SMTP',
  google_sheet: 'GOOGLE_SHEETS',

  // These nodes don't require connectors
  // api_call: undefined,
  // user_operation: undefined,
  // delay: undefined,
  // log: undefined,
  // condition: undefined,
  // loop: undefined,
  // match: undefined,
  // math: undefined,
  // definition: undefined,
};

/**
 * Check if a node type requires a connector
 */
export function nodeRequiresConnector(nodeType: NodeType): boolean {
  return nodeType in NODE_CONNECTOR_MAP;
}

/**
 * Get connector type for a node type
 */
export function getConnectorTypeForNode(nodeType: NodeType): ConnectorType | undefined {
  return NODE_CONNECTOR_MAP[nodeType];
}
```

---

## 9. Implementation Priority

### Phase 1: Foundation

1. Update `NODE_DEFINITIONS` với `requiresConnector` field
2. Tạo `node-connector-map.ts`
3. Tạo `ConnectorSelector` component cơ bản

### Phase 2: Config Panel Forms

1. `SmtpEmailForm` với connector selector
2. `TableOperationForm` với connector selector
3. `GoogleSheetForm` với connector selector
4. Các form khác (không cần connector)

### Phase 3: Inline Creation

1. `QuickCreateConnectorDialog` component
2. Integration với `ConnectorSelector`
3. Toast notification + redirect link

### Phase 4: Validation

1. YAML validator với connector check
2. Canvas node status indicators
3. Pre-save validation warnings

---

## 10. Migration Notes

### 10.1 Existing Data

- YAML với `connector: 'xxx'` vẫn hoạt động
- Không cần migration

### 10.2 Backward Compatibility

- Visual builder generate YAML format cũ
- API không thay đổi

---

## 11. Câu hỏi mở

1. **Connector validation timing?** - Validate lúc save hay realtime?
2. **Missing connector behavior?** - Cho save với warning hay block?
3. **Connector refresh?** - Tự động refresh list khi tạo inline?
4. **Draft mode?** - Lưu draft workflow chưa có connector?
