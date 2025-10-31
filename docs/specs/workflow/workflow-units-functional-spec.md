# Đặc tả Kỹ thuật: Module Soạn thảo Luồng (Workflow Units)

## 1. Tổng quan

Module "Workflow Units" là một công cụ phát triển low-code/no-code, cho phép người dùng xây dựng các quy trình tự động hóa phức tạp. Mỗi "Luồng" (Workflow Unit) là một tập hợp các "Sự kiện" (Event). Mỗi sự kiện được kích hoạt bởi một nguồn (ví dụ: lịch trình, webhook) và thực thi một chuỗi các hành động được định nghĩa bằng ngôn ngữ YAML.

Điểm cốt lõi của module là trình soạn thảo logic hai chế độ, cho phép người dùng định nghĩa các hành động bằng cách viết mã YAML trực tiếp trong trình soạn thảo Monaco (giống VS Code) hoặc bằng cách sử dụng trình soạn thảo khối trực quan (Google Blockly) để kéo-thả các khối logic mà không cần viết code.

## 2. Các Tính năng chính (Core Features)

### F1: Quản lý Luồng (Workflow Unit)

- **CRUD cơ bản:** Người dùng có thể tạo, xem danh sách, sửa (tên, mô tả), và xóa các Luồng.
- **Container cho Sự kiện:** Mỗi Luồng hoạt động như một thư mục để chứa và quản lý nhiều Sự kiện liên quan.

### F2: Quản lý Sự kiện (Workflow Event)

Đây là trái tim của module, nơi người dùng định nghĩa "khi nào" và "cái gì" sẽ được thực thi.

- **Tạo/Sửa Sự kiện:**
  - Mỗi sự kiện thuộc về một Luồng.
  - Người dùng có thể tạo, sửa, xóa các sự kiện trong một Luồng.
- **Cấu hình Nguồn kích hoạt (Trigger):** Người dùng phải chọn một trong các nguồn sau để kích hoạt sự kiện:
  - `SCHEDULE`: Chạy theo lịch trình, sử dụng cú pháp Cron.
  - `WEBHOOK`: Kích hoạt khi có một HTTP request đến một URL duy nhất được hệ thống cung cấp.
  - `OPTIN_FORM`: Kích hoạt khi một biểu mẫu (từ module Workflow Forms) được gửi.
  - `ACTIVE_TABLE`: Kích hoạt khi một hành động (action) trên một Bảng (từ module Active Table) được thực hiện.
- **Soạn thảo Logic (YAML/Blockly):** Xem F3.
- **Trạng thái:** Mỗi sự kiện có thể được bật (Hoạt động) hoặc tắt.

### F3: Trình soạn thảo Logic hai chế độ

Người dùng có hai cách để định nghĩa logic cho một sự kiện, và có thể chuyển đổi qua lại giữa hai chế độ này:

1.  **Trình soạn thảo YAML (Monaco Editor):**
    - Cung cấp một môi trường soạn thảo mã chuyên nghiệp để viết trực tiếp logic của sự kiện bằng cú pháp YAML.
    - Hỗ trợ đầy đủ các tính năng như tô màu cú pháp, tự động thụt lề...

2.  **Trình soạn thảo Khối (Blockly Editor):**
    - Cung cấp một giao diện kéo-thả trực quan.
    - Người dùng lắp ráp các khối logic có sẵn (ví dụ: "Gửi Email", "Gọi API", "Điều kiện If/Else", "Vòng lặp") để xây dựng quy trình.
    - Khi hoàn tất, trình soạn thảo khối sẽ tự động **sinh ra mã YAML** tương ứng.
    - Các khối có sẵn bao gồm: xử lý Bảng, Người dùng, gửi Email, gọi Google Sheet, gọi API, Delay, Điều kiện, Vòng lặp, các phép toán, xử lý đối tượng và mảng...

### F4: Giám sát (Monitoring)

- **Giao diện Console:** Cung cấp một màn hình console để xem log output của một sự kiện trong thời gian thực.
- **Kết nối WebSocket:** Dữ liệu log được đẩy từ server tới trình duyệt thông qua kết nối WebSocket để theo dõi trực tiếp quá trình thực thi của luồng.

## 3. Cấu trúc Dữ liệu

### 3.1. `WorkflowUnit` (Luồng)

Đối tượng cấp cao nhất, đại diện cho một luồng tự động hóa.

```json
{
  "id": "snowflake-id-unit-123",
  "name": "Luồng xử lý đơn hàng",
  "description": "Bao gồm các sự kiện liên quan đến đơn hàng mới."
}
```

### 3.2. `WorkflowEvent` (Sự kiện)

Định nghĩa một trigger và chuỗi hành động.

```json
{
  "id": "snowflake-id-event-456",
  "workflowUnit": "snowflake-id-unit-123",
  "eventName": "Khi có đơn hàng mới từ Form",
  "eventSourceType": "OPTIN_FORM", // SCHEDULE | WEBHOOK | OPTIN_FORM | ACTIVE_TABLE
  "eventSourceParams": {
    // Cấu trúc của object này phụ thuộc vào eventSourceType. Xem chi tiết bên dưới.
  },
  "eventActive": true, // boolean
  "yaml": "...nội dung file YAML chứa logic...", // String
  "responseId": "uuid-response-jkl" // ID để kết nối WebSocket console
}
```

#### Chi tiết `eventSourceParams` cho từng `eventSourceType`

- **Khi `eventSourceType` là `SCHEDULE`:**
  - **Mục đích:** Kích hoạt sự kiện theo một lịch trình định sẵn.
  - **Cấu trúc `eventSourceParams`:**
    ```json
    {
      "expression": "*/5 * * * *" // String: Biểu thức Cron.
    }
    ```

- **Khi `eventSourceType` là `WEBHOOK`:**
  - **Mục đích:** Kích hoạt sự kiện thông qua một HTTP request từ bên ngoài.
  - **Cấu trúc `eventSourceParams`:**
    ```json
    {
      "webhookId": "uuid-for-webhook-url-789" // String: ID duy nhất để tạo nên URL của webhook.
    }
    ```

- **Khi `eventSourceType` là `OPTIN_FORM`:**
  - **Mục đích:** Kích hoạt sự kiện khi một biểu mẫu cụ thể được gửi.
  - **Cấu trúc `eventSourceParams`:**
    ```json
    {
      "formId": "snowflake-id-yua", // String: ID của form trong module Workflow Forms.
      "webhookId": "uuid-for-form-webhook-abc", // String: ID duy nhất cho webhook của form.
      "actionId": "uuid-form-action-xyz" // String (Tùy chọn): ID của một action cụ thể trong form (nếu có).
    }
    ```

- **Khi `eventSourceType` là `ACTIVE_TABLE`:**
  - **Mục đích:** Kích hoạt sự kiện khi một hành động trên một bảng dữ liệu được thực hiện.
  - **Cấu trúc `eventSourceParams`:**
    ```json
    {
      "tableId": "snowflake-id-def", // String: ID của bảng trong module Active Table.
      "actionId": "uuid-table-action-ghi", // String: ID của action được định nghĩa trên bảng đó.
      "webhookId": "uuid-table-action-ghi" // String: Trùng với actionId.
    }
    ```

### 3.3. Cấu trúc Logic YAML

Đây là "ngôn ngữ" của workflow, định nghĩa các bước thực thi. Cấu trúc cơ bản bao gồm `stages` (các giai đoạn), mỗi stage chứa một danh sách các `blocks` (hành động). Dưới đây là toàn bộ các kịch bản YAML hiện có.

**1. Ghi Log (log)**

```yaml
stages:
  - name: process_order
    blocks:
      - type: log
        name: log_start
        input:
          message: 'Bắt đầu xử lý đơn hàng $[input.id]'
          level: info
          context:
            order_id: $[input.id]
            customer: $[input.customer]
```

**2. Tương tác với Bảng (table)**

- **Lấy danh sách (get_list):**

  ```yaml
  stages:
    - name: get_users
      blocks:
        - type: table
          name: users
          input:
            connector: '123123123123123123'
            action: get_list
            query:
              filter:
                status: 'active'
              sort:
                - 'created_at:desc'
              limit: 10
  ```

- **Lấy một bản ghi (get_one):**

  ```yaml
  stages:
    - name: get_user
      blocks:
        - type: table
          name: user
          input:
            connector: '123123123123123123'
            action: get_one
            record: '$[config.table_id]'
  ```

- **Tạo mới (create):**

  ```yaml
  stages:
    - name: create_user
      blocks:
        - type: table
          name: user_create
          input:
            connector: '123123123123123123'
            action: create
            data:
              name: 'John Doe'
              email: 'john.doe@example.com'
  ```

- **Cập nhật (update):**

  ```yaml
  stages:
    - name: update_user
      blocks:
        - type: table
          name: user_update
          input:
            connector: '123123123123123123'
            action: update
            record: '25634563456345'
            data:
              status: 'inactive'
  ```

- **Xóa (delete):**

  ```yaml
  stages:
    - name: delete_user
      blocks:
        - type: table
          name: user_delete
          input:
            connector: '123123123123123123'
            action: delete
            record: '25634563456345'
  ```

- **Tạo bình luận (comment_create):**

  ```yaml
  stages:
    - name: add_comment
      blocks:
        - type: table
          name: comment
          input:
            connector: '123123123123123123'
            action: comment_create
            record: '25634563456345'
            content: 'This is a comment.'
  ```

- **Lấy một bình luận (comment_get_one):**
  ```yaml
  stages:
    - name: get_comment
      blocks:
        - type: table
          name: comment_one
          input:
            connector: '123123123123123123'
            action: comment_get_one
            record: '25634563456345'
            comment: '25634563456345'
  ```

**3. Gửi Email (smtp_email)**

```yaml
stages:
  - name: send_email
    blocks:
      - type: smtp_email
        name: send_vip_email
        input:
          connector: 'snowflake-id-smtp-connector-213'
          to: 'manager@example.com'
          toName: 'Manager'
          subject: 'Đơn hàng giá trị cao!'
          body: |
            Có đơn hàng mới mã $[input.id] với giá trị {{ .workflowData.total }}.
```

**4. Vòng lặp (loop)**

```yaml
stages:
  - name: process_users
    blocks:
      - type: loop
        name: loop_users
        input:
          array: '{{ .workflowData.data }}'
          iterator: user
        blocks:
          - type: log
            name: log_user
            input:
              message: 'Processing user $[user.name]'
              level: info
```

**5. Điều kiện (condition)**

```yaml
stages:
  - name: check_order
    blocks:
      - type: condition
        name: check_total
        input:
          expressions:
            - operator: greater_than_or_equals
              operand: '{{ .workflowData.total }}'
              value: 1000
        then:
          - type: log
            name: log_vip
            input:
              message: 'VIP order'
              level: info
        else:
          - type: log
            name: log_regular
            input:
              message: 'Regular order'
              level: info
```

**6. Nhóm điều kiện (Expression Group)**

```yaml
stages:
  - name: check_complex_order
    blocks:
      - type: condition
        name: check_order_and_customer
        input:
          expressions:
            - operator: and
              conditions:
                - operator: greater_than
                  operand: { { .workflowData.total } }
                  value: 500
                - operator: equals
                  operand: '{{ .workflowData.customer.segment }}'
                  value: 'premium'
        then:
          - type: log
            name: log_premium_order
            input:
              message: 'Premium customer order over 500'
              level: info
```

**7. Tính toán (math)**

```yaml
stages:
  - name: calculate_total
    blocks:
      - type: math
        name: total_price
        input:
          aggregate: sum
          expressions:
            - operator: multiply
              left: '{{ .workflowData.price }}'
              right: { { .workflowData.quantity } }
            - operator: add
              left: 0
              right: { { .workflowData.shipping_fee } }
```

**8. Khai báo biến (definition)**

```yaml
stages:
  - name: define_variables
    blocks:
      - type: definition
        name: customer_info
        input:
          data:
            name: '{{ .workflowData.customer_name }}'
            email: '{{ .workflowData.customer_email }}'
```

**9. Gọi API (api_call)**
Thực hiện một cuộc gọi HTTP đến một điểm cuối (endpoint) bên ngoài.

- `url`: URL của API.
- `method`: Phương thức HTTP (`GET`, `POST`, `PUT`, `DELETE`).
- `request_type`: Định dạng của dữ liệu gửi đi.
  - `json`: Gửi payload dưới dạng `application/json`.
  - `form_params`: Gửi dưới dạng `application/x-www-form-urlencoded`.
  - `multipart`: Gửi dưới dạng `multipart/form-data`, thường dùng để tải lên tệp.
- `response_format`: Định dạng mong muốn của dữ liệu trả về.
  - `json`: Phân tích phản hồi dưới dạng JSON.
  - `text`: Đọc phản hồi dưới dạng văn bản thuần túy.
  - `base64`: Mã hóa phản hồi sang định dạng Base64.
- `headers`: (Tùy chọn) Các header của HTTP request.
- `payload`: (Tùy chọn) Dữ liệu cần gửi đi.

```yaml
stages:
  - name: call_external_api
    blocks:
      - type: api_call
        name: get_weather
        input:
          url: 'https://api.weather.com/v1/current'
          method: POST
          request_type: json
          response_format: json
          headers:
            Authorization: 'Bearer your_api_key'
            X-Custom-Header: 'custom_value'
          payload:
            city: 'Hanoi'
            units: 'metric'
```

**10. Điều kiện khớp (match)**

```yaml
stages:
  - name: route_ticket
    blocks:
      - type: match
        name: route_by_department
        input:
          value: $[input.department]
          cases:
            - pattern: 'sales'
              then:
                - type: log
                  name: log_sales
                  input:
                    message: 'Ticket for Sales'
                    level: info
            - pattern: 'support'
              then:
                - type: log
                  name: log_support
                  input:
                    message: 'Ticket for Support'
                    level: info
            - pattern: '*'
              then:
                - type: log
                  name: log_default
                  input:
                    message: 'Default case'
                    level: info
```

**11. Trì hoãn (delay)**

```yaml
stages:
  - name: wait_for_payment
    blocks:
      - type: delay
        name: delay_5_minutes
        input:
          duration:
            value: 5
            unit: minutes
        callback: 'check_payment_status'
```

**12. Tương tác với Người dùng (user)**

- **Lấy danh sách (get_list):**

  ```yaml
  stages:
    - name: get_all_users
      blocks:
        - type: user
          name: all_users
          input:
            action: get_list
            query:
              filter:
                role: 'admin'
  ```

- **Lấy một người dùng (get_one):**
  ```yaml
  stages:
    - name: get_specific_user
      blocks:
        - type: user
          name: one_user
          input:
            action: get_one
            id: '1'
  ```

**13. Tương tác với Google Sheet (google_sheet)**

- **Tạo trang tính (sheet_create):**

  ```yaml
  stages:
    - name: create_report_sheet
      blocks:
        - type: google_sheet
          name: new_sheet
          input:
            connector: 'your_google_sheet_connector_id'
            action: sheet_create
            title: 'Monthly Report'
  ```

- **Nối dữ liệu (sheet_append):**

  ```yaml
  stages:
    - name: add_data_to_sheet
      blocks:
        - type: google_sheet
          name: append_data
          input:
            connector: 'your_google_sheet_connector_id'
            action: sheet_append
            sheet_id: 'your_sheet_id'
            range: 'A1'
            values:
              - ['Name', 'Email']
              - ['John Doe', 'john@example.com']
  ```

- **Đọc dữ liệu (sheet_read):**

  ```yaml
  stages:
    - name: read_data_from_sheet
      blocks:
        - type: google_sheet
          name: read_sheet
          input:
            connector: 'your_google_sheet_connector_id'
            action: sheet_read
            sheet_id: 'your_sheet_id'
            range: 'A1:B2'
  ```

- **Cập nhật dữ liệu (sheet_update):**
  ```yaml
  stages:
    - name: update_data_in_sheet
      blocks:
        - type: google_sheet
          name: update_sheet
          input:
            connector: 'your_google_sheet_connector_id'
            action: sheet_update
            sheet_id: 'your_sheet_id'
            range: 'A2'
            values:
              - ['Jane Doe', 'jane@example.com']
  ```

## 4. Yêu cầu về API

- **Lưu ý:** Giống các module trước, triển khai hiện tại dùng `POST` cho tất cả các yêu cầu.
- **API Prefix:** `/api/workspace/{WORKSPACE_ID}/workflow`

### 4.1. Quản lý Luồng (WorkflowUnitAPI)

- `POST /get/workflow_units`: Lấy danh sách các Luồng.
- `POST /get/workflow_units/{unitId}`: Lấy chi tiết một Luồng.
- `POST /post/workflow_units`: Tạo Luồng mới.
- `POST /patch/workflow_units/{unitId}`: Cập nhật Luồng.
- `POST /delete/workflow_units/{unitId}`: Xóa Luồng.

### 4.2. Quản lý Sự kiện (WorkflowEventAPI)

- `POST /get/workflow_events`: Lấy danh sách sự kiện (có thể lọc theo `workflowUnit`).
- `POST /get/workflow_events/{eventId}`: Lấy chi tiết một Sự kiện.
- `POST /post/workflow_events`: Tạo Sự kiện mới.
- `POST /patch/workflow_events/{eventId}`: Cập nhật Sự kiện.
- `POST /delete/workflow_events/{eventId}`: Xóa Sự kiện.

### 4.3. API phụ trợ

- `POST /get/workflow_forms`: Lấy danh sách các Form để chọn trong cấu hình trigger `OPTIN_FORM`.
- `POST /get/active_tables`: Lấy danh sách các Bảng để chọn trong cấu hình trigger `ACTIVE_TABLE`.
- `POST /get/active_tables/{tableId}`: Lấy chi tiết một Bảng (bao gồm các actions) để chọn trong cấu hình trigger.

### 4.4. WebSocket

- **Endpoint:** `ws://connect.o1erp.com`
- **Tham số kết nối:** `?sys={WORKSPACE_ID}&token=nvmteam&response_id={responseId}`
- **Mục đích:** Nhận log thực thi của một sự kiện trong thời gian thực.
