# Hướng dẫn sử dụng Value Builders

> **Phiên bản:** 1.0
> **Cập nhật:** 2025-11-29
> **Liên quan:** [workflow-units-spec.md](./workflow-units-spec.md)

## 1. Tổng quan

Value Builders là bộ công cụ giúp xây dựng dữ liệu phức tạp (objects, arrays) trong các node workflow một cách trực quan. Thay vì viết JSON thủ công, người dùng có thể sử dụng giao diện visual builder hoặc chuyển sang JSON editor khi cần.

### 1.1 Các thành phần

| Component           | Mô tả                                |
| ------------------- | ------------------------------------ |
| **ValueBuilder**    | Wrapper chính với toggle Visual/JSON |
| **KeyValueBuilder** | Xây dựng object dạng key-value pairs |
| **ArrayBuilder**    | Xây dựng array với danh sách items   |
| **JsonEditor**      | Monaco editor cho JSON phức tạp      |
| **VariablePicker**  | Chọn biến `$[context.field]`         |

### 1.2 Hỗ trợ biến

Value Builders hỗ trợ chèn biến động với cú pháp `$[context.field]`:

```
$[trigger.data]        → Dữ liệu từ trigger
$[trigger.record_id]   → ID bản ghi (trigger table)
$[step_name.result]    → Kết quả từ step trước
$[step_name.response]  → Response từ API call
$[env.API_KEY]         → Biến môi trường
$[secrets.token]       → Secret được mã hóa
```

---

## 2. Sử dụng trong Node Forms

### 2.1 Table Operation Node

**Mục đích:** Cấu hình query lọc và data tạo/cập nhật bản ghi.

#### Get List (với Query)

```
┌─────────────────────────────────────────────────┐
│  Query                                           │
│  ┌────────────────────────────────────────────┐ │
│  │ [Visual] [JSON]                         🔄 │ │
│  │                                             │ │
│  │  Key              Value              [🗑️] │ │
│  │  [status    ]    [pending       ] [$] [+] │ │
│  │  [limit     ]    [10            ] [$] [+] │ │
│  │  [sort      ]    [created_at:desc] [$] [+] │ │
│  │                                             │ │
│  │  [+ Thêm trường]                            │ │
│  └────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

**Output YAML:**

```yaml
stages:
  - name: get_orders
    blocks:
      - type: table
        name: orders_list
        input:
          connector: '123456789012345678'
          action: get_list
          query:
            status: 'pending'
            limit: 10
            sort: 'created_at:desc'
```

#### Create/Update (với Data)

```
┌─────────────────────────────────────────────────┐
│  Data                                            │
│  ┌────────────────────────────────────────────┐ │
│  │ [Visual] [JSON]                         🔄 │ │
│  │                                             │ │
│  │  Key              Value              [🗑️] │ │
│  │  [customer_name] [$[trigger.name]   ] [$] │ │
│  │  [email        ] [$[trigger.email]  ] [$] │ │
│  │  [status       ] [new               ] [$] │ │
│  │                                             │ │
│  │  [+ Thêm trường]                            │ │
│  └────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

**Output YAML:**

```yaml
stages:
  - name: create_order
    blocks:
      - type: table
        name: new_order
        input:
          connector: '123456789012345678'
          action: create
          data:
            customer_name: '$[trigger.name]'
            email: '$[trigger.email]'
            status: 'new'
```

---

### 2.2 API Call Node

**Mục đích:** Cấu hình headers và payload cho HTTP request.

#### Headers Configuration

```
┌─────────────────────────────────────────────────┐
│  Headers                                         │
│  ┌────────────────────────────────────────────┐ │
│  │ [Visual] [JSON]                         🔄 │ │
│  │                                             │ │
│  │  Key              Value              [🗑️] │ │
│  │  [Authorization] [Bearer $[env.TOKEN]] [$] │ │
│  │  [Content-Type ] [application/json  ] [$] │ │
│  │  [X-Request-ID ] [$[trigger.id]     ] [$] │ │
│  │                                             │ │
│  │  [+ Thêm header]                            │ │
│  └────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

**Output YAML:**

```yaml
stages:
  - name: call_api
    blocks:
      - type: api_call
        name: external_api
        input:
          url: 'https://api.example.com/v1/orders'
          method: POST
          request_type: json
          response_format: json
          headers:
            Authorization: 'Bearer $[env.TOKEN]'
            Content-Type: 'application/json'
            X-Request-ID: '$[trigger.id]'
```

#### Payload Configuration

```
┌─────────────────────────────────────────────────┐
│  Payload                                         │
│  ┌────────────────────────────────────────────┐ │
│  │ [Visual] [JSON]                         🔄 │ │
│  │                                             │ │
│  │  {                                          │ │
│  │    "order_id": "$[trigger.order_id]",      │ │
│  │    "items": "$[get_items.data]",           │ │
│  │    "total": "$[calc_total.result]",        │ │
│  │    "metadata": {                           │ │
│  │      "source": "workflow",                 │ │
│  │      "timestamp": "$[trigger.timestamp]"   │ │
│  │    }                                        │ │
│  │  }                                          │ │
│  └────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

**Output YAML:**

```yaml
stages:
  - name: send_order
    blocks:
      - type: api_call
        name: submit_order
        input:
          url: 'https://api.partner.com/orders'
          method: POST
          request_type: json
          response_format: json
          payload:
            order_id: '$[trigger.order_id]'
            items: '$[get_items.data]'
            total: '$[calc_total.result]'
            metadata:
              source: 'workflow'
              timestamp: '$[trigger.timestamp]'
```

---

### 2.3 Log Node

**Mục đích:** Cấu hình context data cho debug logging.

```
┌─────────────────────────────────────────────────┐
│  Context                                         │
│  ┌────────────────────────────────────────────┐ │
│  │ [Visual] [JSON]                         🔄 │ │
│  │                                             │ │
│  │  Key              Value              [🗑️] │ │
│  │  [order_id     ] [$[trigger.order_id]] [$] │ │
│  │  [customer     ] [$[trigger.email]   ] [$] │ │
│  │  [step_result  ] [$[prev_step.result]] [$] │ │
│  │                                             │ │
│  │  [+ Thêm trường]                            │ │
│  └────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

**Output YAML:**

```yaml
stages:
  - name: debug
    blocks:
      - type: log
        name: order_log
        input:
          message: 'Processing order $[trigger.order_id]'
          level: info
          context:
            order_id: '$[trigger.order_id]'
            customer: '$[trigger.email]'
            step_result: '$[prev_step.result]'
```

---

## 3. Chế độ hiển thị

### 3.1 Visual Mode (Mặc định)

Sử dụng cho:

- Objects đơn giản với key-value pairs
- Arrays với items cùng kiểu
- Dữ liệu có cấu trúc phẳng

**Ưu điểm:**

- Trực quan, dễ thao tác
- Hỗ trợ chèn biến nhanh qua button `[$]`
- Tự động validate JSON format

### 3.2 JSON Mode

Sử dụng cho:

- Objects lồng nhau nhiều cấp
- Arrays với mixed types
- Import JSON từ nguồn khác

**Ưu điểm:**

- Linh hoạt cho cấu trúc phức tạp
- Syntax highlighting
- Error highlighting khi JSON invalid

### 3.3 Chuyển đổi chế độ

```
┌─────────────────────────────────────────────┐
│  [Visual] [JSON]  ← Click để chuyển         │
│  ─────────────────────────────────────────   │
│  ⚠️ Chuyển đổi sẽ giữ nguyên dữ liệu        │
│  ⚠️ JSON invalid sẽ hiển thị lỗi            │
└─────────────────────────────────────────────┘
```

---

## 4. Variable Picker

### 4.1 Cách sử dụng

1. Click button `[$]` bên cạnh input
2. Chọn biến từ dropdown
3. Biến được chèn dạng `$[variable.path]`

### 4.2 Biến có sẵn

#### Trigger Variables

| Variable            | Mô tả                              | Trigger Type |
| ------------------- | ---------------------------------- | ------------ |
| `trigger.data`      | Toàn bộ dữ liệu trigger            | All          |
| `trigger.id`        | ID của trigger event               | All          |
| `trigger.timestamp` | Thời gian trigger                  | All          |
| `trigger.record_id` | ID bản ghi                         | ACTIVE_TABLE |
| `trigger.action`    | Loại action (create/update/delete) | ACTIVE_TABLE |
| `trigger.form_data` | Dữ liệu form submit                | OPTIN_FORM   |
| `trigger.body`      | Request body                       | WEBHOOK      |
| `trigger.headers`   | Request headers                    | WEBHOOK      |

#### Step Variables

| Variable               | Mô tả                               |
| ---------------------- | ----------------------------------- |
| `{step_name}.result`   | Kết quả trả về từ step              |
| `{step_name}.success`  | Boolean thành công/thất bại         |
| `{step_name}.response` | Response data (API call)            |
| `{step_name}.status`   | HTTP status code (API call)         |
| `{step_name}.data`     | Array/Object data (Table operation) |
| `{step_name}.count`    | Số lượng records (Table operation)  |

#### Environment & Secrets

| Variable          | Mô tả             |
| ----------------- | ----------------- |
| `env.APP_URL`     | URL ứng dụng      |
| `env.API_KEY`     | API key công khai |
| `secrets.api_key` | API key mã hóa    |
| `secrets.token`   | Token mã hóa      |

---

## 5. Ví dụ YAML đầy đủ

### 5.1 Workflow xử lý đơn hàng

```yaml
stages:
  # Stage 1: Lấy thông tin khách hàng
  - name: get_customer
    blocks:
      - type: table
        name: customer_info
        input:
          connector: '123456789012345678'
          action: get_one
          record: '$[trigger.customer_id]'

  # Stage 2: Tính tổng đơn hàng
  - name: calculate
    blocks:
      - type: math
        name: calc_total
        input:
          aggregate: sum
          expressions:
            - operator: multiply
              left: '$[trigger.price]'
              right: '$[trigger.quantity]'
            - operator: add
              left: 0
              right: '$[trigger.shipping]'

  # Stage 3: Tạo đơn hàng
  - name: create_order
    blocks:
      - type: table
        name: new_order
        input:
          connector: '123456789012345678'
          action: create
          data:
            customer_id: '$[trigger.customer_id]'
            customer_name: '$[customer_info.data.name]'
            customer_email: '$[customer_info.data.email]'
            items: '$[trigger.items]'
            total: '$[calc_total.result]'
            status: 'pending'
            created_at: '$[trigger.timestamp]'

  # Stage 4: Gọi API thanh toán
  - name: payment
    blocks:
      - type: api_call
        name: create_payment
        input:
          url: 'https://api.payment.com/v1/charges'
          method: POST
          request_type: json
          response_format: json
          headers:
            Authorization: 'Bearer $[secrets.payment_key]'
            Content-Type: 'application/json'
          payload:
            order_id: '$[new_order.data.id]'
            amount: '$[calc_total.result]'
            currency: 'VND'
            customer:
              name: '$[customer_info.data.name]'
              email: '$[customer_info.data.email]'

  # Stage 5: Cập nhật trạng thái
  - name: update_status
    blocks:
      - type: condition
        name: check_payment
        input:
          expressions:
            - operator: equals
              operand: '$[create_payment.status]'
              value: 200
        then:
          - type: table
            name: update_success
            input:
              connector: '123456789012345678'
              action: update
              record: '$[new_order.data.id]'
              data:
                status: 'paid'
                payment_id: '$[create_payment.response.id]'
        else:
          - type: table
            name: update_failed
            input:
              connector: '123456789012345678'
              action: update
              record: '$[new_order.data.id]'
              data:
                status: 'payment_failed'
                error: '$[create_payment.response.error]'

  # Stage 6: Gửi email xác nhận
  - name: notification
    blocks:
      - type: smtp_email
        name: send_confirmation
        input:
          connector: '987654321098765432'
          to: '$[customer_info.data.email]'
          toName: '$[customer_info.data.name]'
          subject: 'Xác nhận đơn hàng #$[new_order.data.id]'
          body: |
            Xin chào $[customer_info.data.name],

            Đơn hàng #$[new_order.data.id] của bạn đã được xác nhận.

            Chi tiết:
            - Tổng tiền: $[calc_total.result] VND
            - Trạng thái: $[update_success.data.status]

            Cảm ơn bạn đã mua hàng!

  # Stage 7: Log kết quả
  - name: logging
    blocks:
      - type: log
        name: order_completed
        input:
          message: 'Order $[new_order.data.id] completed'
          level: info
          context:
            order_id: '$[new_order.data.id]'
            customer_email: '$[customer_info.data.email]'
            total: '$[calc_total.result]'
            payment_status: '$[create_payment.status]'
```

### 5.2 Workflow sync dữ liệu

```yaml
stages:
  # Lấy danh sách records cần sync
  - name: fetch_data
    blocks:
      - type: table
        name: pending_records
        input:
          connector: '111222333444555666'
          action: get_list
          query:
            sync_status: 'pending'
            limit: 100
            sort: 'created_at:asc'

  # Loop qua từng record
  - name: process_records
    blocks:
      - type: loop
        name: sync_loop
        input:
          array: '$[pending_records.data]'
          iterator: record
        blocks:
          # Gọi API external
          - type: api_call
            name: sync_to_external
            input:
              url: 'https://api.external.com/sync'
              method: POST
              request_type: json
              response_format: json
              headers:
                Authorization: 'Bearer $[env.EXTERNAL_API_KEY]'
                X-Idempotency-Key: '$[record.id]'
              payload:
                id: '$[record.id]'
                data: '$[record.data]'
                timestamp: '$[trigger.timestamp]'

          # Cập nhật trạng thái sync
          - type: table
            name: update_sync_status
            input:
              connector: '111222333444555666'
              action: update
              record: '$[record.id]'
              data:
                sync_status: 'completed'
                synced_at: '$[trigger.timestamp]'
                external_id: '$[sync_to_external.response.id]'

          # Log từng record
          - type: log
            name: log_sync
            input:
              message: 'Synced record $[record.id]'
              level: debug
              context:
                record_id: '$[record.id]'
                external_id: '$[sync_to_external.response.id]'

  # Log tổng kết
  - name: summary
    blocks:
      - type: log
        name: sync_complete
        input:
          message: 'Sync completed: $[pending_records.count] records'
          level: info
          context:
            total_records: '$[pending_records.count]'
            timestamp: '$[trigger.timestamp]'
```

### 5.3 Workflow với conditional routing

```yaml
stages:
  - name: route_by_type
    blocks:
      - type: match
        name: order_router
        input:
          value: '$[trigger.order_type]'
          cases:
            # Case: Digital product
            - pattern: 'digital'
              then:
                - type: api_call
                  name: deliver_digital
                  input:
                    url: 'https://api.delivery.com/digital'
                    method: POST
                    request_type: json
                    response_format: json
                    payload:
                      order_id: '$[trigger.order_id]'
                      email: '$[trigger.customer_email]'
                      product_url: '$[trigger.download_url]'

            # Case: Physical product
            - pattern: 'physical'
              then:
                - type: api_call
                  name: create_shipment
                  input:
                    url: 'https://api.shipping.com/shipments'
                    method: POST
                    request_type: json
                    response_format: json
                    headers:
                      Authorization: 'Bearer $[secrets.shipping_key]'
                    payload:
                      order_id: '$[trigger.order_id]'
                      address:
                        name: '$[trigger.shipping_name]'
                        street: '$[trigger.shipping_street]'
                        city: '$[trigger.shipping_city]'
                        country: '$[trigger.shipping_country]'
                      items: '$[trigger.items]'

            # Case: Subscription
            - pattern: 'subscription'
              then:
                - type: table
                  name: create_subscription
                  input:
                    connector: '777888999000111222'
                    action: create
                    data:
                      customer_id: '$[trigger.customer_id]'
                      plan_id: '$[trigger.plan_id]'
                      start_date: '$[trigger.timestamp]'
                      status: 'active'

            # Default case
            - pattern: '*'
              then:
                - type: log
                  name: unknown_type
                  input:
                    message: 'Unknown order type: $[trigger.order_type]'
                    level: warning
                    context:
                      order_id: '$[trigger.order_id]'
                      order_type: '$[trigger.order_type]'
```

---

## 6. Best Practices

### 6.1 Đặt tên biến

```yaml
# ✅ Tốt: Tên rõ ràng, mô tả chức năng
- name: get_customer_orders
- name: calc_order_total
- name: send_confirmation_email

# ❌ Xấu: Tên mơ hồ
- name: step1
- name: data
- name: do_something
```

### 6.2 Sử dụng biến

```yaml
# ✅ Tốt: Reference step name cụ thể
data:
  total: '$[calc_order_total.result]'
  customer: '$[get_customer.data.name]'

# ❌ Xấu: Hardcode values
data:
  total: 100000
  customer: 'John'
```

### 6.3 Error handling

```yaml
# ✅ Tốt: Kiểm tra kết quả trước khi sử dụng
- type: condition
  name: check_api_success
  input:
    expressions:
      - operator: equals
        operand: '$[api_call.success]'
        value: true
  then:
    - type: table
      name: save_result
      input:
        data:
          result: '$[api_call.response]'
  else:
    - type: log
      name: log_error
      input:
        message: 'API failed: $[api_call.response.error]'
        level: error
```

### 6.4 Logging

```yaml
# ✅ Tốt: Log với context đầy đủ
- type: log
  name: order_processed
  input:
    message: 'Processed order $[trigger.order_id]'
    level: info
    context:
      order_id: '$[trigger.order_id]'
      customer: '$[trigger.customer_email]'
      total: '$[calc_total.result]'
      duration_ms: '$[trigger.timestamp]'

# ❌ Xấu: Log thiếu context
- type: log
  name: done
  input:
    message: 'Done'
    level: info
```

---

## 7. Troubleshooting

### 7.1 JSON Parse Error

**Vấn đề:** Chuyển từ Visual sang JSON báo lỗi

**Giải pháp:**

1. Kiểm tra các giá trị có chứa ký tự đặc biệt (`"`, `\`, `{`, `}`)
2. Escape ký tự đặc biệt: `\"`, `\\`
3. Sử dụng JSON mode trực tiếp cho dữ liệu phức tạp

### 7.2 Variable Not Found

**Vấn đề:** Biến không xuất hiện trong Variable Picker

**Giải pháp:**

1. Kiểm tra step trước đã được định nghĩa chưa
2. Kiểm tra tên step chính xác (case-sensitive)
3. Biến chỉ available từ các step trước node hiện tại

### 7.3 Data Not Syncing

**Vấn đề:** Thay đổi trong Visual mode không phản ánh ở JSON

**Giải pháp:**

1. Click ra ngoài input để trigger save
2. Kiểm tra console errors
3. Refresh component nếu cần

---

## 8. Tham khảo

- [Workflow Units Spec](./workflow-units-spec.md) - Đặc tả đầy đủ
- [Workflow Connectors Spec](./workflow-connectors-spec.md) - Cấu hình connectors
- [YAML Logic Reference](./workflow-units-spec.md#4-yaml-logic-reference) - Tham khảo cú pháp YAML
