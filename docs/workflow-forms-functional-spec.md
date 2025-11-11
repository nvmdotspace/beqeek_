# Đặc tả Kỹ thuật: Module Quản lý Forms

## 1. Tổng quan

Module này là một công cụ xây dựng biểu mẫu (Form Builder) trực quan, cho phép người dùng tạo, thiết kế và quản lý các biểu mẫu web. Người dùng có thể thêm, sửa, xóa, và sắp xếp các trường trong form, cũng như xem trước kết quả một cách trực tiếp. Các biểu mẫu này sau đó có thể được nhúng và sử dụng trong các quy trình công việc hoặc các trang web khác.

Đây là tài liệu đặc tả không phụ thuộc vào công nghệ, nhằm mục đích hướng dẫn việc triển khai lại tính năng này trên bất kỳ nền tảng nào.

## 2. Các Tính năng chính (Core Features)

Module bao gồm 3 màn hình chính: **Màn hình Chọn loại Form** (`Select View`), **Màn hình Danh sách** (`List View`), và **Màn hình Chi tiết/Xây dựng Form** (`Detail View`).

### F1: Luồng tạo Form mới

1.  Từ **Màn hình Danh sách**, người dùng nhấn nút "Tạo Form mới".
2.  Hệ thống chuyển đến **Màn hình Chọn loại Form**. Tại đây, người dùng thấy một danh mục các mẫu form có sẵn (ví dụ: "Form Cơ bản", "Form Đăng ký") và có thể tìm kiếm.
3.  Người dùng chọn một mẫu form.
4.  Một popup hiện ra yêu cầu nhập `Tên Form` và `Mô tả`.
5.  Sau khi xác nhận, hệ thống sẽ:
    - Gọi API để tạo một bản ghi `FormInstance` mới, với cấu trúc fields được sao chép từ mẫu đã chọn.
    - Tự động chuyển người dùng đến **Màn hình Chi tiết** để bắt đầu tùy chỉnh form.

### F2: Màn hình Danh sách Form (`List View`)

- **Hiển thị danh sách:** Liệt kê tất cả các form đã được tạo. Mỗi mục trong danh sách hiển thị `Tên` và `Mô tả` của form.
- **Điều hướng:**
  - Nhấn vào một form sẽ đưa đến **Màn hình Chi tiết** (F3).
  - Nhấn nút "Tạo Form mới" sẽ bắt đầu luồng F1.

### F3: Màn hình Chi tiết / Xây dựng Form (`Detail View`)

Đây là giao diện chính của Form Builder, được chia làm 2 phần:

- **Phần Cấu hình (Bên trái):**
  - Cho phép chỉnh sửa `ID Form` (chỉ đọc, có thể sao chép) và `Văn bản của nút Gửi` (Submit Button Text).
  - Hiển thị danh sách các trường (field) hiện có trong form.
  - Cho phép **Thêm trường mới** (mở popup cấu hình trường).
  - Cho phép **Sắp xếp lại** các trường bằng cách kéo-thả.

- **Phần Xem trước (Bên phải):**
  - Hiển thị một bản xem trước (preview) của form trong thời gian thực. Mọi thay đổi ở phần cấu hình sẽ được cập nhật ngay lập tức ở đây.

- **Các hành động khác trên màn hình này:**
  - **Nút "Lưu":** Lưu lại toàn bộ cấu trúc của form (bao gồm danh sách các trường và các cài đặt chung) vào backend.
  - **Nút "Xóa":** Xóa vĩnh viễn form (có yêu cầu xác nhận).
  - **Nút "Cài đặt" (biểu tượng bánh răng):** Mở popup để chỉnh sửa thông tin cơ bản như `Tên Form` và `Mô tả` (xem F5).

### F4: Quản lý Trường trong Form

- **Thêm/Sửa trường:**
  - Khi thêm mới hoặc chỉnh sửa một trường, một popup sẽ hiện ra cho phép cấu hình các thuộc tính:
    - `Loại trường`: Text, Email, Number, Textarea, Select, Checkbox, Date, Datetime.
    - `Tên trường (Label)`: Nhãn hiển thị cho người dùng.
    - `Tên biến (Name)`: Tên biến của trường khi gửi dữ liệu, tự động tạo nếu bỏ trống.
    - `Placeholder`: Văn bản gợi ý.
    - `Giá trị mặc định`.
    - `Bắt buộc (Required)`: Bật/tắt.
    - `Tùy chọn (Options)`: Dành riêng cho trường `Select`, cho phép thêm/xóa các cặp giá trị (value) và văn bản hiển thị (text).
- **Xóa trường:** Người dùng có thể xóa một trường ra khỏi form.

### F5: Chỉnh sửa thông tin cơ bản (Tên & Mô tả)

- Tính năng này được kích hoạt từ **Màn hình Chi tiết** (F3) qua nút "Cài đặt".
- Một popup sẽ hiện ra, cho phép người dùng thay đổi `Tên Form`, `Mô tả`, và `Văn bản nút Gửi`.

## 3. Cấu trúc Dữ liệu (Data Structures)

### 3.1. Dữ liệu tĩnh (Hardcoded phía Client)

- **`FormType`**: Mảng định nghĩa các mẫu form có sẵn.

```json
[
  {
    "type": "BASIC",
    "name": "Form Cơ bản",
    "description": "Form cơ bản với các trường văn bản và email.",
    "logo": "https://.../form.png"
  }
  // ... các mẫu khác
]
```

- **`FormTemplateConfig`**: Object chứa cấu hình mặc định cho từng `FormType`.

```json
{
  "BASIC": {
    "title": "Form Cơ bản",
    "fields": [
      { "type": "text", "label": "Họ và Tên", "name": "fullName", "required": true, "placeholder": "Nhập họ và tên" },
      { "type": "email", "label": "Email", "name": "email", "required": true, "placeholder": "Nhập địa chỉ email" }
    ],
    "submitButton": { "text": "Gửi" }
  }
  // ... các cấu hình mẫu khác
}
```

### 3.2. Dữ liệu động (Trao đổi với API)

- **`FormInstance`**: Đối tượng form hoàn chỉnh được lưu trữ trong cơ sở dữ liệu.

```json
{
  "id": "snowflake-id-123",
  "name": "Form liên hệ của tôi",
  "description": "Form trên trang liên hệ",
  "formType": "BASIC",
  "config": {
    "title": "Form liên hệ của tôi",
    "fields": [
      // Mảng các đối tượng Field
    ],
    "submitButton": {
      "text": "Gửi thông tin"
    }
  }
}
```

- **`Field`**: Đối tượng định nghĩa một trường trong mảng `config.fields`.

```json
{
  "type": "select",
  "label": "Bạn biết chúng tôi qua đâu?",
  "name": "source",
  "placeholder": "",
  "defaultValue": "",
  "required": true,
  "options": [
    // Mảng các đối tượng Option
  ]
}
```

- **`Option`**: Đối tượng định nghĩa một tùy chọn trong trường `select`.

```json
{
  "text": "Mạng xã hội",
  "value": "social"
}
```

## 4. Yêu cầu về API (API Endpoints)

Triển khai hiện tại sử dụng phương thức `POST` cho tất cả các yêu cầu API, với cấu trúc đường dẫn: `/api/workspace/{WORKSPACE_ID}/workflow/{action_type}/{resource}`.

- **Lấy danh sách Form:**
  - `POST /api/workspace/{WORKSPACE_ID}/workflow/get/workflow_forms`
  - Response: `{ "data": [FormInstance] }`

- **Lấy chi tiết một Form:**
  - `POST /api/workspace/{WORKSPACE_ID}/workflow/get/workflow_forms/{formId}`
  - Response: `{ "data": FormInstance }`

- **Tạo một Form:**
  - `POST /api/workspace/{WORKSPACE_ID}/workflow/post/workflow_forms`
  - Request Body: `{ "name": "...", "description": "...", "formType": "...", "config": { ... } }`
  - Response: `{ "data": { "id": "..." }, "message": "..." }`

- **Cập nhật một Form:**
  - `POST /api/workspace/{WORKSPACE_ID}/workflow/patch/workflow_forms/{formId}`
  - Request Body: `FormInstance` (toàn bộ đối tượng form với các thay đổi)
  - Response: `{ "message": "..." }`

- **Xóa một Form:**
  - `POST /api/workspace/{WORKSPACE_ID}/workflow/delete/workflow_forms/{formId}`
  - Response: `{ "message": "..." }`
