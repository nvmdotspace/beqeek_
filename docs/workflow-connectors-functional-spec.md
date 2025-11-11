# Đặc tả Kỹ thuật: Module Quản lý Connectors

## 1. Tổng quan

Module này cho phép người dùng quản lý các "connector" - là các kết nối đã được cấu hình tới các dịch vụ của bên thứ ba (như SMTP, Google Sheets, Zalo...). Các connector này sau đó có thể được sử dụng trong các quy trình công việc (workflow) khác của hệ thống.

Đây là một tài liệu đặc tả không phụ thuộc vào công nghệ, nhằm mục đích hướng dẫn việc triển khai lại tính năng này trên bất kỳ nền tảng nào (ví dụ: React, Vue, Angular kết hợp với backend API).

## 2. Các Tính năng chính (Core Features) - Dựa trên triển khai thực tế

Module này có 3 màn hình chính: **Màn hình Chọn loại Connector** (`Select View`), **Màn hình Danh sách** (`List View`), và **Màn hình Chi tiết** (`Detail View`).

### F1: Luồng tạo Connector mới

1.  Từ **Màn hình Danh sách**, người dùng nhấn nút "Tạo Connector mới".
2.  Hệ thống chuyển đến **Màn hình Chọn loại Connector**. Tại đây, người dùng thấy một danh mục các loại connector được hỗ trợ và có thể tìm kiếm.
3.  Người dùng chọn một loại connector (ví dụ: "SMTP").
4.  Một popup hiện ra yêu cầu nhập `Tên định danh` và `Mô tả` cho connector.
5.  Sau khi xác nhận, hệ thống sẽ:
    a. Gọi API để tạo một `ConnectorInstance` mới.
    b. Tự động chuyển người dùng đến **Màn hình Chi tiết** cho connector vừa tạo.

### F2: Màn hình Danh sách Connector (`List View`)

- **Hiển thị danh sách:** Hiển thị tất cả `ConnectorInstance` đã được tạo, mỗi mục gồm có Tên và Mô tả.
- **Lọc theo loại:** Cung cấp các tab để lọc danh sách theo `connectorType` (Tất cả, SMTP, Zalo...). Mỗi tab hiển thị số lượng connector tương ứng.
- **Điều hướng:**
  - Nhấn vào một connector sẽ đưa đến **Màn hình Chi tiết** (F3).
  - Nhấn nút "Tạo Connector mới" sẽ bắt đầu luồng F1.

### F3: Màn hình Chi tiết Connector (`Detail View`)

Đây là màn hình trung tâm để quản lý một connector cụ thể.

- **Hiển thị thông tin:** Hiển thị tên của connector.
- **Quản lý Cấu hình Kỹ thuật:**
  - Giao diện render động các trường cấu hình kỹ thuật (`config`) dựa trên `connectorType`.
  - Đối với connector dùng OAuth2, giao diện hiển thị nút để bắt đầu luồng xác thực.
  - Nút **"Lưu"** trên màn hình này chỉ dùng để lưu các thay đổi trong phần cấu hình kỹ thuật này.
- **Xem tài liệu:** Hiển thị tài liệu hướng dẫn (Markdown) cho loại connector đang xem.
- **Các hành động khác:**
  - **Nút "Xóa":** Cho phép xóa connector (có yêu cầu xác nhận).
  - **Nút "Cài đặt" (biểu tượng bánh răng):** Mở một popup để chỉnh sửa thông tin cơ bản (Tên và Mô tả) của connector (xem F4).
  - **Nút "Quay lại":** Đưa người dùng về **Màn hình Danh sách** (F2).

### F4: Chỉnh sửa thông tin cơ bản (Tên & Mô tả)

- Tính năng này được kích hoạt từ **Màn hình Chi tiết** (F3) thông qua nút "Cài đặt".
- Một popup sẽ hiện ra, cho phép người dùng thay đổi `Tên` và `Mô tả` của connector.
- Nút "Xác nhận" trong popup sẽ gọi API để cập nhật các thông tin này.

## 3. Cấu trúc Dữ liệu (Data Structures) - Dựa trên triển khai thực tế

**Lưu ý:** Trong triển khai hiện tại, dữ liệu định nghĩa về các loại connector và cấu hình của chúng được **hardcode** dưới dạng các biến JavaScript ở phía client. Dưới đây là cấu trúc chính xác của các dữ liệu tĩnh này.

### 3.1. `connectorTypes` (Dữ liệu tĩnh phía Client)

Đây là mảng các đối tượng định nghĩa mỗi loại connector có sẵn trong hệ thống.

```json
[
  {
    "type": "SMTP",
    "name": "SMTP",
    "description": "Kết nối với máy chủ SMTP để gửi email.",
    "logo": "/images/email.png"
  },
  {
    "type": "GOOGLE_SHEETS",
    "name": "Google Sheet",
    "description": "Kết nối với Google Sheet để truy cập dữ liệu người dùng và dịch vụ.",
    "logo": "https://a.mktgcdn.com/p/-PwOQsJ3DFhmP-ysVNuotfaRuvS5CJnvkxe-xSGj8ZQ/4267x4267.png"
  },
  {
    "type": "ZALO_OA",
    "name": "Zalo OA",
    "description": "Kết nối với Zalo Official Account để gửi tin nhắn và quản lý khách hàng.",
    "logo": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRMDg68zSJU2TpKyMFJwkWpuGsXF_FTMJguqA&s"
  },
  {
    "type": "KIOTVIET",
    "name": "Kiotviet",
    "description": "Kết nối với Kiotviet để quản lý bán hàng và kho.",
    "logo": "https://encrypted-tbn0.gstatic.com/images?q=tbn9GcSu9JZqHuRPU5YePaTYEB8OuU-ejDAPlYH8UQ&s"
  },
  {
    "type": "ACTIVE_TABLE",
    "name": "Bảng",
    "description": "Kết nối với bảng để quản lý dữ liệu",
    "logo": ""
  }
]
```

### 3.2. `ConnectorConfigDefinition` (Dữ liệu tĩnh phía Client)

Đây là mảng các đối tượng định nghĩa các trường cấu hình và loại xác thực cho mỗi `connectorType`.

```json
[
  {
    "connectorType": "SMTP",
    "oauth": false,
    "configFields": [
      { "name": "host", "type": "text", "label": "SMTP Host", "required": true, "secret": false },
      { "name": "port", "type": "number", "label": "SMTP Port", "required": true, "secret": false },
      { "name": "username", "type": "text", "label": "Username", "required": true, "secret": false },
      { "name": "password", "type": "password", "label": "Password", "required": true, "secret": true },
      { "name": "from_email", "type": "text", "label": "From Email", "required": true, "secret": false },
      { "name": "from_name", "type": "text", "label": "From Name", "required": false, "secret": false },
      {
        "name": "checkDailyUnique",
        "type": "checkbox",
        "label": "Check Daily Unique",
        "required": false,
        "secret": false
      },
      { "name": "trackingEmail", "type": "checkbox", "label": "Tracking Email", "required": false, "secret": false }
    ]
  },
  {
    "connectorType": "GOOGLE_SHEETS",
    "oauth": true,
    "configFields": [
      {
        "name": "access_token",
        "type": "text",
        "label": "access_token",
        "required": false,
        "readonly": true,
        "secret": false
      },
      {
        "name": "expires_in",
        "type": "text",
        "label": "expires_in",
        "required": false,
        "readonly": true,
        "secret": false
      },
      {
        "name": "refresh_token",
        "type": "text",
        "label": "refresh_token",
        "required": false,
        "readonly": true,
        "secret": false
      },
      { "name": "scope", "type": "text", "label": "scope", "required": false, "readonly": true, "secret": false },
      {
        "name": "token_type",
        "type": "text",
        "label": "token_type",
        "required": false,
        "readonly": true,
        "secret": false
      },
      { "name": "created", "type": "text", "label": "created", "required": false, "readonly": true, "secret": false }
    ]
  },
  {
    "connectorType": "ZALO_OA",
    "oauth": true,
    "configFields": [
      {
        "name": "accessToken",
        "type": "text",
        "label": "Access Token",
        "required": false,
        "readonly": true,
        "secret": true
      },
      {
        "name": "refreshToken",
        "type": "text",
        "label": "Refresh Token",
        "required": false,
        "readonly": true,
        "secret": true
      }
    ]
  },
  {
    "connectorType": "KIOTVIET",
    "oauth": false,
    "configFields": [
      { "name": "clientId", "type": "text", "label": "Client ID", "required": true, "secret": false },
      { "name": "clientSecret", "type": "password", "label": "Client Secret", "required": true, "secret": true },
      { "name": "retailerCode", "type": "text", "label": "Retailer Code", "required": true, "secret": false },
      {
        "name": "accessToken",
        "type": "text",
        "label": "Mã truy cập API (access token)",
        "required": false,
        "secret": true
      }
    ]
  },
  {
    "connectorType": "ACTIVE_TABLE",
    "oauth": false,
    "configFields": [
      { "name": "tableId", "type": "text", "label": "Table ID", "required": true, "secret": false },
      { "name": "tableKey", "type": "password", "label": "Table Encryption Key", "required": true, "secret": true }
    ]
  }
]
```

### 3.3. `ConnectorInstance` (Dữ liệu động từ API)

Đại diện cho một connector cụ thể đã được người dùng tạo và cấu hình. Đây là đối tượng được trao đổi với API.

```json
{
  "id": "snowflake-id-1234", // String, UUID
  "name": "Email Marketing của tôi", // String, người dùng tự đặt
  "description": "Dùng để gửi email cho chiến dịch X", // String
  "connectorType": "SMTP", // String, Foreign Key tới ConnectorType.type
  "config": {
    // Object, chứa các giá trị cấu hình
    "host": "smtp.example.com",
    "port": 587,
    "username": "user@example.com",
    "password": "...",
    "checkDailyUnique": true
  },
  "documentation": "### Hướng dẫn SMTP\n- Điền đầy đủ thông tin..." // String, nội dung Markdown từ API
}
```

## 4. Yêu cầu về API (API Endpoints) - Dựa trên triển khai thực tế

**Lưu ý quan trọng:** Triển khai JavaScript hiện tại (`workflow-connectors.blade.php`) sử dụng phương thức `POST` cho hầu hết các yêu cầu API, kể cả các hành động đọc hay xóa dữ liệu. Đường dẫn API cũng tuân theo một cấu trúc cụ thể: `/api/workspace/{WORKSPACE_ID}/workflow/{action_type}/{resource}`.

**Dữ liệu cấu hình tĩnh:**

- Dữ liệu về `ConnectorType` (các loại connector) và `ConnectorConfigDefinition` (cấu hình cho từng loại) hiện đang được **hardcode** trong file JavaScript phía client. Không có API endpoint để lấy dữ liệu này.

**Các Endpoint động:**

- **Lấy danh sách Connector:**
  - `POST /api/workspace/{WORKSPACE_ID}/workflow/get/workflow_connectors`
  - Request Body: `{}` (rỗng)
  - Response: `{ "data": [ConnectorInstance] }`

- **Lấy chi tiết một Connector:**
  - `POST /api/workspace/{WORKSPACE_ID}/workflow/get/workflow_connectors/{connectorId}`
  - Request Body: `{}` (rỗng)
  - Response: `{ "data": ConnectorInstance }`

- **Tạo một Connector:**
  - `POST /api/workspace/{WORKSPACE_ID}/workflow/post/workflow_connectors`
  - Request Body: `{ "name": "...", "description": "...", "connectorType": "..." }`
  - Response: `{ "data": { "id": "..." }, "message": "..." }`

- **Cập nhật một Connector:**
  - `POST /api/workspace/{WORKSPACE_ID}/workflow/patch/workflow_connectors/{connectorId}`
  - Request Body: `{ "name": "...", "description": "...", "config": { ... } }`
  - Response: `{ "message": "..." }`

- **Xóa một Connector:**
  - `POST /api/workspace/{WORKSPACE_ID}/workflow/delete/workflow_connectors/{connectorId}`
  - Request Body: `{}` (rỗng)
  - Response: `{ "message": "..." }`

- **Bắt đầu luồng OAuth2:**
  - `POST /api/workspace/{WORKSPACE_ID}/workflow/get/workflow_connectors/{connectorId}/oauth2_state`
  - Request Body: `{}` (rỗng)
  - Response: `{ "data": { "state": "..." } }`
  - **Ghi chú:** Frontend sẽ dùng `state` này để xây dựng URL redirect tới `https://app.o1erp.com/api/workflow/get/workflow_connectors/oauth2?state={state}`.
