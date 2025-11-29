# Hướng dẫn Cấu hình YAML Editor - Workflow Units

## Mục lục

1. [Tổng quan](#1-tổng-quan)
2. [Kiến trúc Migration](#2-kiến-trúc-migration)
3. [Cấu trúc YAML](#3-cấu-trúc-yaml)
4. [Trigger Types](#4-trigger-types)
5. [Step Types - Actions](#5-step-types---actions)
6. [Step Types - Logic](#6-step-types---logic)
7. [Biến và Template](#7-biến-và-template)
8. [Compound Nodes (Nested Blocks)](#8-compound-nodes-nested-blocks)
9. [Callbacks (Delay Handling)](#9-callbacks-delay-handling)
10. [Ánh xạ Legacy → New Format](#10-ánh-xạ-legacy--new-format)
11. [Ví dụ Thực tế](#11-ví-dụ-thực-tế)
12. [Troubleshooting](#12-troubleshooting)

---

## 1. Tổng quan

### 1.1 Mục đích

Module Workflow Units cho phép người dùng xây dựng quy trình tự động hóa phức tạp thông qua:

- **Visual Editor**: Kéo thả nodes trên React Flow canvas
- **YAML Editor**: Viết code YAML trực tiếp với Monaco Editor
- **Chuyển đổi hai chiều**: Visual ↔ YAML đồng bộ realtime

### 1.2 Luồng dữ liệu

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│ React Flow  │ ──▶ │ IR (Inter-   │ ──▶ │    YAML     │
│   Nodes     │     │ mediate Rep) │     │   String    │
└─────────────┘     └──────────────┘     └─────────────┘
       ▲                   │                    │
       │                   ▼                    ▼
       │            ┌──────────────┐     ┌─────────────┐
       └────────────│   Zod        │ ◀── │  js-yaml    │
                    │  Validation  │     │   Parser    │
                    └──────────────┘     └─────────────┘
```

### 1.3 Files chính

| File                     | Mô tả                              |
| ------------------------ | ---------------------------------- |
| `yaml-types.ts`          | TypeScript interfaces cho IR       |
| `yaml-schemas.ts`        | Zod schemas để validate            |
| `yaml-parser.ts`         | Parse YAML → IR                    |
| `yaml-serializer.ts`     | Serialize IR → YAML                |
| `legacy-yaml-adapter.ts` | Convert legacy PHP format → new IR |
| `reactflow-to-ir.ts`     | Convert React Flow → IR            |
| `ir-to-reactflow.ts`     | Convert IR → React Flow            |

---

## 2. Kiến trúc Migration

### 2.1 Legacy Format (PHP/Blockly)

```yaml
stages:
  - name: stage_name
    blocks:
      - type: log
        name: step_name
        input:
          message: 'Hello'
          level: info
        blocks: # Nested blocks
          - type: log
            name: nested
            input:
              message: 'Nested'
```

### 2.2 New IR Format (React Flow)

```yaml
version: '1.0'
trigger:
  type: table
  config:
    tableId: '123'
    actionId: '456'
steps:
  - id: log_1
    name: step_name
    type: log
    config:
      message: 'Hello'
      level: info
    depends_on: []
    position:
      x: 400
      y: 100
```

### 2.3 Điểm khác biệt chính

| Aspect       | Legacy                  | New IR                       |
| ------------ | ----------------------- | ---------------------------- |
| Root key     | `stages`                | `trigger` + `steps`          |
| Config key   | `input`                 | `config`                     |
| Nesting      | `blocks` trong `blocks` | `branches` / `nested_blocks` |
| Dependencies | Implicit (order)        | Explicit `depends_on`        |
| Position     | Không có                | `position: {x, y}`           |
| ID           | Không có                | `id` bắt buộc                |

---

## 3. Cấu trúc YAML

### 3.1 WorkflowIR Schema

```typescript
interface WorkflowIR {
  version: string; // "1.0"
  trigger: TriggerIR; // Trigger configuration
  steps: StepIR[]; // Array of workflow steps
  callbacks?: CallbackIR[]; // Optional delay callbacks
  metadata?: {
    // Optional metadata
    description?: string;
    tags?: string[];
  };
}
```

### 3.2 StepIR Schema

```typescript
interface StepIR {
  id: string; // Unique identifier (alphanumeric, _, -)
  name: string; // Display name
  type: string; // Node type (log, api_call, condition, etc.)
  config: Record<string, unknown>; // Type-specific configuration
  depends_on?: string[]; // Array of step IDs this step depends on
  position?: { x: number; y: number }; // Canvas position

  // For compound nodes only:
  branches?: {
    // condition type only
    then?: StepIR[];
    else?: StepIR[];
  };
  nested_blocks?: StepIR[]; // loop/match type only
}
```

### 3.3 Validation Rules

- `id` phải unique trong toàn workflow
- `id` chỉ chứa: `a-zA-Z0-9_-`
- `branches` chỉ valid cho type `condition`
- `nested_blocks` chỉ valid cho type `loop` hoặc `match`
- Không được có cả `branches` và `nested_blocks` cùng lúc

---

## 4. Trigger Types

### 4.1 Schedule Trigger

Kích hoạt theo lịch trình cron.

```yaml
trigger:
  type: schedule
  config:
    expression: '*/5 * * * *' # Every 5 minutes
    timezone: 'Asia/Ho_Chi_Minh' # Optional timezone
```

**Cron Expression Format:**

```
┌───────────── minute (0 - 59)
│ ┌───────────── hour (0 - 23)
│ │ ┌───────────── day of month (1 - 31)
│ │ │ ┌───────────── month (1 - 12)
│ │ │ │ ┌───────────── day of week (0 - 6)
│ │ │ │ │
* * * * *
```

**Ví dụ phổ biến:**

- `0 9 * * 1-5` - 9h sáng các ngày thường
- `0 0 1 * *` - 0h ngày đầu mỗi tháng
- `*/15 * * * *` - Mỗi 15 phút

### 4.2 Webhook Trigger

Kích hoạt khi nhận HTTP request.

```yaml
trigger:
  type: webhook
  config:
    webhookId: 'uuid-webhook-123'
```

**URL Format:** `https://api.beqeek.com/webhook/{workspaceId}/{webhookId}`

**Dữ liệu truy cập:** `$[trigger.body]`, `$[trigger.headers]`, `$[trigger.query]`

### 4.3 Form Trigger

Kích hoạt khi form được submit.

```yaml
trigger:
  type: form
  config:
    formId: 'snowflake-form-id'
    webhookId: 'uuid-form-webhook'
    actionId: 'uuid-action-id' # Optional: specific action
```

**Dữ liệu truy cập:** `$[trigger.formData]`, `$[trigger.submittedAt]`

### 4.4 Table Trigger

Kích hoạt khi action trên Active Table được thực hiện.

```yaml
trigger:
  type: table
  config:
    tableId: 'snowflake-table-id'
    actionId: 'uuid-table-action'
    webhookId: 'uuid-table-action' # Thường trùng actionId
```

**Dữ liệu truy cập:**

- `$[trigger.record]` - Record data
- `$[trigger.recordId]` - Record ID
- `$[trigger.action]` - Action name
- `$[trigger.user]` - User who triggered

---

## 5. Step Types - Actions

### 5.1 Log

Ghi log message.

```yaml
- id: log_1
  name: log_start
  type: log
  config:
    message: 'Processing order $[trigger.orderId]'
    level: info # info | warn | error | debug
    context: # Optional context object
      orderId: '$[trigger.orderId]'
      timestamp: '$[now]'
```

**Truy cập kết quả:** `$[log_1.logged]` (boolean)

### 5.2 Table Operation

Thao tác với Active Table.

```yaml
# GET LIST
- id: get_users
  name: get_users
  type: table_operation
  config:
    connector: '123123123123123' # Table ID
    action: get_list
    query:
      filter:
        status: 'active'
        role: '$[trigger.role]'
      sort:
        - 'created_at:desc'
      limit: 10
      offset: 0

# GET ONE
- id: get_user
  name: get_user
  type: table_operation
  config:
    connector: '123123123123123'
    action: get_one
    record: '$[trigger.recordId]'

# CREATE
- id: create_user
  name: create_user
  type: table_operation
  config:
    connector: '123123123123123'
    action: create
    data:
      name: '$[trigger.name]'
      email: '$[trigger.email]'
      status: 'pending'

# UPDATE
- id: update_user
  name: update_user
  type: table_operation
  config:
    connector: '123123123123123'
    action: update
    record: '$[trigger.recordId]'
    data:
      status: 'active'
      updatedAt: '$[now]'

# DELETE
- id: delete_user
  name: delete_user
  type: table_operation
  config:
    connector: '123123123123123'
    action: delete
    record: '$[trigger.recordId]'
```

**Truy cập kết quả:**

- `$[get_users.data]` - Array of records
- `$[get_users.total]` - Total count
- `$[get_user.record]` - Single record
- `$[create_user.id]` - Created record ID

### 5.3 Table Comment

Thao tác với comments trên record.

```yaml
# CREATE COMMENT
- id: add_comment
  name: add_comment
  type: table_comment_create
  config:
    connector: '123123123123123'
    record: '$[trigger.recordId]'
    content: 'Auto-generated comment: $[trigger.message]'

# GET COMMENT
- id: get_comment
  name: get_comment
  type: table_comment_get_one
  config:
    connector: '123123123123123'
    record: '$[trigger.recordId]'
    comment: '$[trigger.commentId]'
```

### 5.4 SMTP Email

Gửi email qua SMTP connector.

```yaml
- id: send_email
  name: send_vip_notification
  type: smtp_email
  config:
    connector: 'smtp-connector-id'
    to: 'manager@example.com'
    toName: 'Manager'
    cc: 'team@example.com' # Optional
    bcc: 'archive@example.com' # Optional
    subject: 'New VIP Order #$[trigger.orderId]'
    body: |
      Dear Manager,

      A new VIP order has been placed:
      - Order ID: $[trigger.orderId]
      - Customer: $[trigger.customerName]
      - Total: $[trigger.total] VND

      Please review and approve.
    isHtml: true # Optional, default false
    attachments: # Optional
      - filename: 'invoice.pdf'
        content: '$[generate_invoice.pdf]'
```

**Truy cập kết quả:** `$[send_email.messageId]`, `$[send_email.success]`

### 5.5 API Call

Gọi HTTP API bên ngoài.

```yaml
- id: call_api
  name: get_weather
  type: api_call
  config:
    url: 'https://api.weather.com/v1/current'
    method: POST # GET | POST | PUT | DELETE | PATCH
    requestType: json # json | form_params | multipart
    responseFormat: json # json | text | base64
    headers:
      Authorization: 'Bearer $[secrets.API_KEY]'
      X-Request-ID: '$[uuid]'
      Content-Type: 'application/json'
    payload:
      city: '$[trigger.city]'
      units: 'metric'
    timeout: 30000 # Optional, milliseconds
    retries: 3 # Optional, retry count
```

**Request Types:**

- `json` - `application/json`
- `form_params` - `application/x-www-form-urlencoded`
- `multipart` - `multipart/form-data` (file upload)

**Response Formats:**

- `json` - Parse as JSON object
- `text` - Plain text string
- `base64` - Base64 encoded (for binary)

**Truy cập kết quả:**

- `$[call_api.data]` - Response body
- `$[call_api.status]` - HTTP status code
- `$[call_api.headers]` - Response headers

### 5.6 Google Sheet

Thao tác với Google Sheets.

```yaml
# CREATE SHEET
- id: create_sheet
  name: create_report
  type: google_sheet
  config:
    connector: 'google-connector-id'
    action: sheet_create
    title: 'Monthly Report $[trigger.month]'

# APPEND DATA
- id: append_data
  name: append_rows
  type: google_sheet
  config:
    connector: 'google-connector-id'
    action: sheet_append
    sheetId: '$[create_sheet.sheetId]'
    range: 'A1'
    values:
      - ['Name', 'Email', 'Status']
      - ['$[trigger.name]', '$[trigger.email]', 'Active']

# READ DATA
- id: read_data
  name: read_sheet
  type: google_sheet
  config:
    connector: 'google-connector-id'
    action: sheet_read
    sheetId: 'your-sheet-id'
    range: 'A1:C100'

# UPDATE DATA
- id: update_cell
  name: update_status
  type: google_sheet
  config:
    connector: 'google-connector-id'
    action: sheet_update
    sheetId: 'your-sheet-id'
    range: 'C2'
    values:
      - ['Completed']
```

### 5.7 User Operation

Thao tác với users trong workspace.

```yaml
# GET LIST
- id: get_admins
  name: get_admins
  type: user_operation
  config:
    action: get_list
    query:
      filter:
        role: 'admin'

# GET ONE
- id: get_user
  name: get_specific_user
  type: user_operation
  config:
    action: get_one
    id: '$[trigger.userId]'
```

### 5.8 Delay

Trì hoãn thực thi với callback.

```yaml
- id: wait_payment
  name: wait_for_payment
  type: delay
  config:
    duration:
      value: 5
      unit: minutes # seconds | minutes | hours | days
    callback: 'check_payment_status' # References callback section
```

**Duration Units:** `seconds`, `minutes`, `hours`, `days`

---

## 6. Step Types - Logic

### 6.1 Condition

Điều kiện if/then/else.

```yaml
- id: check_vip
  name: check_vip_order
  type: condition
  config:
    expressions:
      - operator: greater_than_or_equals
        operand: '$[trigger.total]'
        value: 1000000
  branches:
    then:
      - id: log_vip
        name: log_vip
        type: log
        config:
          message: 'VIP order detected'
          level: info
    else:
      - id: log_regular
        name: log_regular
        type: log
        config:
          message: 'Regular order'
          level: info
```

**Operators:**
| Operator | Mô tả |
|----------|-------|
| `equals` | Bằng (==) |
| `not_equals` | Khác (!=) |
| `greater_than` | Lớn hơn (>) |
| `greater_than_or_equals` | Lớn hơn hoặc bằng (>=) |
| `less_than` | Nhỏ hơn (<) |
| `less_than_or_equals` | Nhỏ hơn hoặc bằng (<=) |
| `contains` | Chứa (string/array) |
| `not_contains` | Không chứa |
| `starts_with` | Bắt đầu với |
| `ends_with` | Kết thúc với |
| `is_empty` | Rỗng |
| `is_not_empty` | Không rỗng |
| `is_null` | Null |
| `is_not_null` | Không null |

### 6.2 Expression Groups

Nhóm điều kiện với AND/OR.

```yaml
- id: complex_check
  name: check_premium_order
  type: condition
  config:
    expressions:
      - operator: and
        conditions:
          - operator: greater_than
            operand: '$[trigger.total]'
            value: 500000
          - operator: equals
            operand: '$[trigger.customer.segment]'
            value: 'premium'
      - operator: or # Multiple groups
        conditions:
          - operator: equals
            operand: '$[trigger.paymentMethod]'
            value: 'credit_card'
          - operator: equals
            operand: '$[trigger.paymentMethod]'
            value: 'bank_transfer'
```

### 6.3 Loop

Vòng lặp qua array.

```yaml
- id: process_items
  name: process_order_items
  type: loop
  config:
    items: '$[trigger.items]' # Array to iterate
    itemVariable: 'item' # Variable name for each item
    indexVariable: 'index' # Optional: index variable
  nested_blocks:
    - id: log_item
      name: log_item
      type: log
      config:
        message: 'Processing item $[index]: $[item.name]'
        level: info
    - id: update_stock
      name: update_stock
      type: table_operation
      config:
        connector: 'stock-table-id'
        action: update
        record: '$[item.productId]'
        data:
          quantity: '$[item.newQuantity]'
```

**Truy cập trong loop:**

- `$[item]` - Current item
- `$[item.property]` - Item property
- `$[index]` - Current index (0-based)

### 6.4 Match (Switch/Case)

Pattern matching.

```yaml
- id: route_ticket
  name: route_by_department
  type: match
  config:
    value: '$[trigger.department]'
    cases:
      - pattern: 'sales'
        then:
          - id: assign_sales
            name: assign_sales
            type: log
            config:
              message: 'Routing to Sales team'
              level: info
      - pattern: 'support'
        then:
          - id: assign_support
            name: assign_support
            type: log
            config:
              message: 'Routing to Support team'
              level: info
      - pattern: '*' # Default case (wildcard)
        then:
          - id: assign_general
            name: assign_general
            type: log
            config:
              message: 'Routing to General queue'
              level: info
```

### 6.5 Math

Phép tính toán học.

```yaml
# Simple math
- id: calc_total
  name: calculate_total
  type: math
  config:
    operation: multiply
    operandA: '$[trigger.price]'
    operandB: '$[trigger.quantity]'
    precision: 2

# Complex expression (Visual Builder)
- id: calc_discount
  name: calculate_discounted_price
  type: math
  config:
    mathExpression:
      type: operation
      operator: multiply
      left:
        type: variable
        value: 'trigger.price'
      right:
        type: operation
        operator: subtract
        left:
          type: value
          value: 1
        right:
          type: operation
          operator: divide
          left:
            type: variable
            value: 'trigger.discountPercent'
          right:
            type: value
            value: 100
    precision: 2
```

**Operations (Simple mode):**

- Binary: `add`, `subtract`, `multiply`, `divide`, `modulo`, `power`, `min`, `max`
- Unary: `abs`, `round`, `floor`, `ceil`, `sqrt`, `log`, `exp`, `negate`

**Truy cập kết quả:** `$[calc_total.result]`

### 6.6 Definition

Khai báo biến.

```yaml
- id: define_customer
  name: customer_info
  type: definition
  config:
    data:
      fullName: '$[trigger.firstName] $[trigger.lastName]'
      email: '$[trigger.email]'
      isVip: true
      metadata:
        source: 'workflow'
        createdAt: '$[now]'
```

**Truy cập:** `$[define_customer.fullName]`, `$[define_customer.metadata.source]`

### 6.7 Object Lookup

Truy xuất giá trị từ object.

```yaml
- id: get_config
  name: get_region_config
  type: object_lookup
  config:
    object:
      vn:
        currency: 'VND'
        timezone: 'Asia/Ho_Chi_Minh'
      us:
        currency: 'USD'
        timezone: 'America/New_York'
    key: '$[trigger.region]'
    default:
      currency: 'USD'
      timezone: 'UTC'
```

**Truy cập:** `$[get_config.value]`, `$[get_config.value.currency]`

---

## 7. Biến và Template

### 7.1 Cú pháp biến

```
$[path.to.value]
```

### 7.2 Biến hệ thống

| Biến              | Mô tả                         |
| ----------------- | ----------------------------- |
| `$[trigger.*]`    | Dữ liệu từ trigger            |
| `$[now]`          | Timestamp hiện tại (ISO 8601) |
| `$[uuid]`         | UUID v4 mới                   |
| `$[workspace.id]` | Workspace ID                  |
| `$[secrets.KEY]`  | Secret từ vault               |

### 7.3 Tham chiếu step output

```yaml
$[step_id.property]
$[step_id.nested.property]
$[step_id.array[0].property]
```

### 7.4 Ví dụ

```yaml
# Trigger data
$[trigger.orderId]
$[trigger.customer.email]
$[trigger.items[0].name]

# Step outputs
$[get_users.data]
$[get_users.data[0].email]
$[call_api.data.results]
$[calc_total.result]

# System
$[now]                          # 2024-01-15T10:30:00Z
$[uuid]                         # 550e8400-e29b-41d4-a716-446655440000
$[secrets.OPENAI_API_KEY]       # sk-...
```

### 7.5 String interpolation

```yaml
message: 'Order #$[trigger.orderId] from $[trigger.customer.name]'
url: 'https://api.example.com/orders/$[trigger.orderId]'
```

---

## 8. Compound Nodes (Nested Blocks)

### 8.1 Condition với branches

```yaml
- id: check_amount
  name: check_order_amount
  type: condition
  config:
    expressions:
      - operator: greater_than
        operand: '$[trigger.amount]'
        value: 1000
  branches:
    then:
      - id: then_log
        name: high_value_log
        type: log
        config:
          message: 'High value order'
      - id: then_email
        name: notify_manager
        type: smtp_email
        config:
          connector: 'smtp-id'
          to: 'manager@example.com'
          subject: 'High value order'
          body: 'Please review order $[trigger.orderId]'
    else:
      - id: else_log
        name: normal_log
        type: log
        config:
          message: 'Normal order'
```

### 8.2 Loop với nested_blocks

```yaml
- id: process_orders
  name: process_pending_orders
  type: loop
  config:
    items: '$[get_orders.data]'
    itemVariable: 'order'
  nested_blocks:
    - id: update_order
      name: mark_processing
      type: table_operation
      config:
        connector: 'orders-table'
        action: update
        record: '$[order.id]'
        data:
          status: 'processing'
    - id: notify_customer
      name: send_notification
      type: smtp_email
      config:
        connector: 'smtp-id'
        to: '$[order.customerEmail]'
        subject: 'Order $[order.id] is being processed'
        body: 'Your order is now being processed.'
```

### 8.3 Nested compound nodes

```yaml
- id: outer_loop
  name: process_categories
  type: loop
  config:
    items: '$[trigger.categories]'
    itemVariable: 'category'
  nested_blocks:
    - id: check_active
      name: check_category_active
      type: condition
      config:
        expressions:
          - operator: equals
            operand: '$[category.active]'
            value: true
      branches:
        then:
          - id: inner_loop
            name: process_products
            type: loop
            config:
              items: '$[category.products]'
              itemVariable: 'product'
            nested_blocks:
              - id: update_product
                name: update_price
                type: table_operation
                config:
                  connector: 'products-table'
                  action: update
                  record: '$[product.id]'
                  data:
                    price: '$[product.newPrice]'
```

---

## 9. Callbacks (Delay Handling)

### 9.1 Delay step với callback reference

```yaml
steps:
  - id: create_order
    name: create_order
    type: table_operation
    config:
      connector: 'orders-table'
      action: create
      data:
        status: 'pending_payment'

  - id: wait_payment
    name: wait_for_payment
    type: delay
    config:
      duration:
        value: 30
        unit: minutes
      callback: 'check_payment' # References callback ID

callbacks:
  - id: check_payment
    name: check_payment_status
    type: log
    config:
      message: 'Checking payment status'
    steps:
      - id: get_order
        name: get_order_status
        type: table_operation
        config:
          connector: 'orders-table'
          action: get_one
          record: '$[trigger.orderId]'
      - id: check_paid
        name: check_if_paid
        type: condition
        config:
          expressions:
            - operator: equals
              operand: '$[get_order.record.status]'
              value: 'paid'
        branches:
          then:
            - id: fulfill
              name: start_fulfillment
              type: log
              config:
                message: 'Starting fulfillment for order $[trigger.orderId]'
          else:
            - id: cancel
              name: cancel_order
              type: table_operation
              config:
                connector: 'orders-table'
                action: update
                record: '$[trigger.orderId]'
                data:
                  status: 'cancelled'
                  cancelReason: 'Payment timeout'
```

### 9.2 CallbackIR Schema

```typescript
interface CallbackIR {
  id: string; // Unique callback ID
  name: string; // Display name
  type: string; // Node type
  config: Record<string, unknown>;
  steps?: StepIR[]; // Nested steps
  position?: { x: number; y: number };
}
```

---

## 10. Ánh xạ Legacy → New Format

### 10.1 Block Type Mapping

| Legacy Type    | New Type          |
| -------------- | ----------------- |
| `table`        | `table_operation` |
| `smtp_email`   | `smtp_email`      |
| `google_sheet` | `google_sheet`    |
| `api_call`     | `api_call`        |
| `user`         | `user_operation`  |
| `delay`        | `delay`           |
| `log`          | `log`             |
| `condition`    | `condition`       |
| `match`        | `match`           |
| `loop`         | `loop`            |
| `math`         | `math`            |
| `definition`   | `definition`      |

### 10.2 Input → Config Mapping

| Legacy Key              | New Key                 | Notes    |
| ----------------------- | ----------------------- | -------- |
| `input.array`           | `config.items`          | Loop     |
| `input.iterator`        | `config.itemVariable`   | Loop     |
| `input.request_type`    | `config.requestType`    | API Call |
| `input.response_format` | `config.responseFormat` | API Call |
| `input.record`          | `config.record`         | Table    |

### 10.3 Trigger Mapping

| eventSourceType | trigger.type |
| --------------- | ------------ |
| `ACTIVE_TABLE`  | `table`      |
| `WEBHOOK`       | `webhook`    |
| `OPTIN_FORM`    | `form`       |
| `SCHEDULE`      | `schedule`   |

### 10.4 Auto-conversion

Khi load workflow legacy, hệ thống tự động:

1. Detect format via `isLegacyFormat()`
2. Convert via `convertLegacyToIR()`
3. Generate unique step IDs
4. Map input → config
5. Flatten stages → steps với `depends_on`
6. Preserve nested structure cho compound nodes

---

## 11. Ví dụ Thực tế

### 11.1 Order Processing Workflow

```yaml
version: '1.0'
trigger:
  type: table
  config:
    tableId: 'orders-table-id'
    actionId: 'new-order-action'

steps:
  # Step 1: Log order received
  - id: log_received
    name: log_order_received
    type: log
    config:
      message: 'New order received: $[trigger.orderId]'
      level: info

  # Step 2: Get customer details
  - id: get_customer
    name: get_customer_info
    type: table_operation
    config:
      connector: 'customers-table'
      action: get_one
      record: '$[trigger.customerId]'
    depends_on:
      - log_received

  # Step 3: Check VIP status
  - id: check_vip
    name: check_vip_customer
    type: condition
    config:
      expressions:
        - operator: equals
          operand: '$[get_customer.record.tier]'
          value: 'vip'
    depends_on:
      - get_customer
    branches:
      then:
        - id: vip_discount
          name: apply_vip_discount
          type: math
          config:
            operation: multiply
            operandA: '$[trigger.total]'
            operandB: 0.9
            precision: 0
        - id: vip_email
          name: send_vip_confirmation
          type: smtp_email
          config:
            connector: 'smtp-connector'
            to: '$[get_customer.record.email]'
            subject: 'VIP Order Confirmation - 10% Discount Applied!'
            body: |
              Dear $[get_customer.record.name],

              Thank you for your VIP order!
              Original: $[trigger.total] VND
              After discount: $[vip_discount.result] VND
      else:
        - id: regular_email
          name: send_regular_confirmation
          type: smtp_email
          config:
            connector: 'smtp-connector'
            to: '$[get_customer.record.email]'
            subject: 'Order Confirmation'
            body: |
              Dear $[get_customer.record.name],

              Thank you for your order!
              Total: $[trigger.total] VND

  # Step 4: Process order items
  - id: process_items
    name: update_inventory
    type: loop
    config:
      items: '$[trigger.items]'
      itemVariable: 'item'
    depends_on:
      - check_vip
    nested_blocks:
      - id: update_stock
        name: decrease_stock
        type: table_operation
        config:
          connector: 'inventory-table'
          action: update
          record: '$[item.productId]'
          data:
            stock: '$[item.newStock]'

  # Step 5: Final update
  - id: update_order
    name: mark_processing
    type: table_operation
    config:
      connector: 'orders-table'
      action: update
      record: '$[trigger.orderId]'
      data:
        status: 'processing'
        processedAt: '$[now]'
    depends_on:
      - process_items
```

### 11.2 Scheduled Report Workflow

```yaml
version: '1.0'
trigger:
  type: schedule
  config:
    expression: '0 8 * * 1' # 8 AM every Monday
    timezone: 'Asia/Ho_Chi_Minh'

steps:
  # Get last week's orders
  - id: get_orders
    name: fetch_weekly_orders
    type: table_operation
    config:
      connector: 'orders-table'
      action: get_list
      query:
        filter:
          createdAt:
            $gte: '$[lastWeekStart]'
            $lte: '$[lastWeekEnd]'
        sort:
          - 'createdAt:desc'

  # Calculate totals
  - id: calc_revenue
    name: calculate_revenue
    type: math
    config:
      mathExpression:
        type: operation
        operator: sum
        left:
          type: variable
          value: 'get_orders.data'
        right:
          type: value
          value: 'total' # Sum field
    depends_on:
      - get_orders

  # Create Google Sheet report
  - id: create_report
    name: create_weekly_report
    type: google_sheet
    config:
      connector: 'google-connector'
      action: sheet_create
      title: 'Weekly Report - Week $[weekNumber]'
    depends_on:
      - calc_revenue

  # Append summary
  - id: write_summary
    name: write_report_summary
    type: google_sheet
    config:
      connector: 'google-connector'
      action: sheet_append
      sheetId: '$[create_report.sheetId]'
      range: 'A1'
      values:
        - ['Weekly Sales Report']
        - ['Period', '$[lastWeekStart] - $[lastWeekEnd]']
        - ['Total Orders', '$[get_orders.total]']
        - ['Total Revenue', '$[calc_revenue.result] VND']
        - ['']
        - ['Order ID', 'Customer', 'Total', 'Status']
    depends_on:
      - create_report

  # Write order details
  - id: write_orders
    name: write_order_details
    type: loop
    config:
      items: '$[get_orders.data]'
      itemVariable: 'order'
    depends_on:
      - write_summary
    nested_blocks:
      - id: append_order
        name: append_order_row
        type: google_sheet
        config:
          connector: 'google-connector'
          action: sheet_append
          sheetId: '$[create_report.sheetId]'
          range: 'A7'
          values:
            - ['$[order.id]', '$[order.customerName]', '$[order.total]', '$[order.status]']

  # Send email notification
  - id: send_report
    name: email_report
    type: smtp_email
    config:
      connector: 'smtp-connector'
      to: 'management@example.com'
      subject: 'Weekly Sales Report - Week $[weekNumber]'
      body: |
        The weekly sales report is ready.

        Summary:
        - Total Orders: $[get_orders.total]
        - Total Revenue: $[calc_revenue.result] VND

        Full report: https://docs.google.com/spreadsheets/d/$[create_report.sheetId]
    depends_on:
      - write_orders
```

---

## 12. Troubleshooting

### 12.1 Validation Errors

| Error                                              | Nguyên nhân                               | Giải pháp                                 |
| -------------------------------------------------- | ----------------------------------------- | ----------------------------------------- |
| "Step ID cannot be empty"                          | ID step trống                             | Thêm `id` cho step                        |
| "Step ID must contain only alphanumeric..."        | ID chứa ký tự đặc biệt                    | Chỉ dùng `a-z`, `A-Z`, `0-9`, `_`, `-`    |
| "branches is only valid for condition type"        | `branches` trên step không phải condition | Xóa `branches` hoặc đổi `type: condition` |
| "nested_blocks is only valid for loop/match"       | `nested_blocks` trên step không hợp lệ    | Xóa hoặc đổi type sang `loop`/`match`     |
| "Step cannot have both branches and nested_blocks" | Có cả 2 fields                            | Chỉ giữ 1 trong 2                         |
| "Circular dependency detected"                     | Steps tham chiếu vòng                     | Kiểm tra `depends_on`                     |

### 12.2 Runtime Errors

| Error                        | Nguyên nhân        | Giải pháp                                |
| ---------------------------- | ------------------ | ---------------------------------------- |
| "Variable not found: $[xxx]" | Biến không tồn tại | Kiểm tra step ID và path                 |
| "Connector not found"        | Connector ID sai   | Verify connector ID từ Connectors module |
| "API call timeout"           | Request quá lâu    | Tăng `timeout` hoặc kiểm tra endpoint    |
| "Invalid cron expression"    | Cú pháp cron sai   | Validate với cron validator              |

### 12.3 Common Mistakes

1. **Quên `depends_on`:**

   ```yaml
   # Wrong - steps run in parallel
   - id: step_1
     ...
   - id: step_2    # Runs parallel with step_1!
     ...

   # Correct
   - id: step_2
     depends_on:
       - step_1
   ```

2. **Sai cú pháp biến:**

   ```yaml
   # Wrong
   message: "Value: {{ trigger.value }}"  # Legacy syntax

   # Correct
   message: "Value: $[trigger.value]"
   ```

3. **Type mismatch trong condition:**

   ```yaml
   # Wrong - comparing string to number
   expressions:
     - operator: greater_than
       operand: "$[trigger.status]"    # String "active"
       value: 100                       # Number

   # Correct
   expressions:
     - operator: equals
       operand: "$[trigger.status]"
       value: "active"
   ```

4. **Loop không có nested_blocks:**

   ```yaml
   # Wrong - nothing happens in loop
   - id: my_loop
     type: loop
     config:
       items: '$[data]'
       itemVariable: 'item'

   # Correct
   - id: my_loop
     type: loop
     config:
       items: '$[data]'
       itemVariable: 'item'
     nested_blocks:
       - id: process_item
         type: log
         config:
           message: '$[item.name]'
   ```

---

## Appendix A: Complete Type Reference

```typescript
// Trigger Types
type TriggerType = 'schedule' | 'webhook' | 'form' | 'table';

// Step Types - Actions
type ActionType =
  | 'log'
  | 'table_operation'
  | 'table_comment_create'
  | 'table_comment_get_one'
  | 'smtp_email'
  | 'api_call'
  | 'google_sheet'
  | 'user_operation'
  | 'delay';

// Step Types - Logic
type LogicType = 'condition' | 'loop' | 'match' | 'math' | 'definition' | 'object_lookup';

// Table Actions
type TableAction = 'get_list' | 'get_one' | 'create' | 'update' | 'delete';

// Google Sheet Actions
type SheetAction = 'sheet_create' | 'sheet_read' | 'sheet_append' | 'sheet_update';

// Condition Operators
type ConditionOperator =
  | 'equals'
  | 'not_equals'
  | 'greater_than'
  | 'greater_than_or_equals'
  | 'less_than'
  | 'less_than_or_equals'
  | 'contains'
  | 'not_contains'
  | 'starts_with'
  | 'ends_with'
  | 'is_empty'
  | 'is_not_empty'
  | 'is_null'
  | 'is_not_null'
  | 'and'
  | 'or';

// Math Operators
type MathOperator =
  | 'add'
  | 'subtract'
  | 'multiply'
  | 'divide'
  | 'modulo'
  | 'power'
  | 'min'
  | 'max'
  | 'abs'
  | 'round'
  | 'floor'
  | 'ceil'
  | 'sqrt'
  | 'log'
  | 'exp'
  | 'negate';
```

---

## Appendix B: Version History

| Version | Date    | Changes                                        |
| ------- | ------- | ---------------------------------------------- |
| 1.0     | 2024-01 | Initial IR format                              |
| 1.1     | 2024-03 | Added compound nodes (branches, nested_blocks) |
| 1.2     | 2024-06 | Added callbacks for delay handling             |
| 1.3     | 2024-11 | Added math expression builder, auto-layout     |

---

_Document maintained by Beqeek Engineering Team_
_Last updated: November 2024_
