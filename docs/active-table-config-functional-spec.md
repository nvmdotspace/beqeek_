# Đặc tả chức năng: Trang Cấu hình Active Table

## 1. Tổng quan

### 1.1. Mục đích

Tài liệu này mô tả các chức năng của trang "Cấu hình Active Table". Trang này là một công cụ quản trị cho phép người dùng định nghĩa và quản lý toàn bộ cấu trúc, hành vi, và giao diện của một bảng dữ liệu động (gọi là Active Table).

### 1.2. Phạm vi

Đặc tả này bao gồm các tính năng từ việc tạo cấu trúc dữ liệu (các trường), định nghĩa các hành động người dùng có thể thực hiện, tùy chỉnh giao diện hiển thị (danh sách, chi tiết, Kanban, Gantt), và thiết lập quyền truy cập.

---

## 2. Mô hình dữ liệu trung tâm

Toàn bộ cấu hình của một Active Table được định nghĩa bởi một đối tượng JSON lớn. Giao diện người dùng trên trang này là công cụ để chỉnh sửa đối tượng này.

### 2.1. Cấu trúc đối tượng Config chính

```json
{
  "id": "string", // Read-only
  "name": "string",
  "description": "string",
  "tableType": "string",
  "e2eeEncryption": "boolean",
  "encryptionAuthKey": "string", // Hash của khóa mã hóa
  "limit": "number",
  "defaultSort": "'asc' | 'desc'",
  "hashedKeywordFields": ["field_name_1", "field_name_2"],
  "fields": [
    /* xem 2.2 */
  ],
  "actions": [
    /* xem 2.3 */
  ],
  "recordListConfig": {
    /* xem 2.4 */
  },
  "recordDetailConfig": {
    /* xem 2.4 */
  },
  "quickFilters": [
    /* xem 2.5 */
  ],
  "kanbanConfigs": [
    /* xem 2.6 */
  ],
  "ganttCharts": [
    /* xem 2.7 */
  ],
  "permissionsConfig": [
    /* xem 2.8 */
  ]
}
```

Ví dụ:

```json
{
  "id": "826289384109113345",
  "name": "Công việc full type",
  "workGroupId": "",
  "tableType": "TASK_EISENHOWER",
  "description": "",
  "config": {
    "title": "Công việc full type",
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
        "placeholder": "Mô tả ngắn gọn về nội dung công việc",
        "defaultValue": "",
        "required": false
      },
      {
        "type": "DATETIME",
        "label": "Thời gian bắt đầu",
        "name": "start_date",
        "placeholder": "Chọn thời gian bắt đầu",
        "defaultValue": "",
        "required": false
      },
      {
        "type": "DATETIME",
        "label": "Thời gian kết thúc",
        "name": "duo_date",
        "placeholder": "Chọn thời gian kết thúc",
        "defaultValue": "",
        "required": false
      },
      {
        "type": "SELECT_ONE",
        "label": "Ma trận Eisenhower",
        "name": "matrix_quadrant",
        "placeholder": "Chọn nhóm ma trận Eisenhower",
        "defaultValue": "q1",
        "required": false,
        "options": [
          {
            "text": "Quan trọng & Khẩn cấp (Làm ngay)",
            "value": "q1",
            "text_color": "#ffffff",
            "background_color": "#dc3545"
          },
          {
            "text": "Quan trọng & Không khẩn cấp (Kế hoạch)",
            "value": "q2",
            "text_color": "#ffffff",
            "background_color": "#28a745"
          },
          {
            "text": "Không quan trọng & Khẩn cấp (Ủy quyền)",
            "value": "q3",
            "text_color": "#ffffff",
            "background_color": "#ffc107"
          },
          {
            "text": "Không quan trọng & Không khẩn cấp (Loại bỏ)",
            "value": "q4",
            "text_color": "#ffffff",
            "background_color": "#6c757d"
          }
        ]
      },
      {
        "type": "SELECT_ONE",
        "label": "Kế hoạch triển khai",
        "name": "no_plan",
        "placeholder": "Chọn kế hoạch",
        "defaultValue": "",
        "required": false,
        "options": [
          {
            "text": "Chưa có kế hoạch",
            "value": "no_plan",
            "text_color": "#ffffff",
            "background_color": "#6c757d"
          },
          {
            "text": "Sẽ triển khai sớm",
            "value": "implement_soon",
            "text_color": "#ffffff",
            "background_color": "#28a745"
          },
          {
            "text": "Sẽ triển khai sau",
            "value": "implement_later",
            "text_color": "#ffffff",
            "background_color": "#ffc107"
          }
        ]
      },
      {
        "type": "SELECT_ONE",
        "label": "Tình trạng công việc",
        "name": "self_evaluation",
        "placeholder": "Chọn mức đánh giá",
        "defaultValue": "",
        "required": false,
        "options": [
          {
            "text": "Thuận lợi",
            "value": "excellent",
            "text_color": "#ffffff",
            "background_color": "#28a745"
          },
          {
            "text": "Khó khăn",
            "value": "difficult",
            "text_color": "#ffffff",
            "background_color": "#fd7e14"
          },
          {
            "text": "Chưa đủ thông tin xử lý",
            "value": "missing_info",
            "text_color": "#ffffff",
            "background_color": "#ffc107"
          },
          {
            "text": "Phụ thuộc vào bên thứ ba",
            "value": "dependency_blocked",
            "text_color": "#ffffff",
            "background_color": "#17a2b8"
          },
          {
            "text": "Cần hỗ trợ",
            "value": "need_help",
            "text_color": "#ffffff",
            "background_color": "#ff5733"
          },
          {
            "text": "Đề nghị xem xét lại kế hoạch",
            "value": "reconsider_plan",
            "text_color": "#ffffff",
            "background_color": "#6610f2"
          }
        ]
      },
      {
        "type": "SELECT_ONE_WORKSPACE_USER",
        "label": "Người phụ trách",
        "name": "assignee",
        "placeholder": "Chọn người phụ trách",
        "defaultValue": "",
        "required": false,
        "referenceLabelField": "fullName"
      },
      {
        "type": "SELECT_ONE",
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
          },
          {
            "text": "Hoàn thành",
            "value": "completed",
            "text_color": "#ffffff",
            "background_color": "#28a745"
          },
          {
            "text": "Hủy bỏ",
            "value": "cancelled",
            "text_color": "#ffffff",
            "background_color": "#dc3545"
          }
        ]
      },
      {
        "type": "SELECT_LIST_WORKSPACE_USER",
        "label": "Người liên quan",
        "name": "related_users",
        "placeholder": "Chọn người liên quan",
        "defaultValue": "",
        "required": false,
        "referenceLabelField": "fullName"
      },
      {
        "type": "SELECT_LIST",
        "label": "Thẻ màu",
        "name": "color_tag",
        "placeholder": "Chọn thẻ màu",
        "defaultValue": "",
        "required": false,
        "options": [
          {
            "text": "đen",
            "value": "den",
            "text_color": "#000000",
            "background_color": "#ffffff"
          },
          {
            "text": "vàng",
            "value": "vang",
            "text_color": "#ffff80",
            "background_color": "#ffffff"
          },
          {
            "text": "đỏ",
            "value": "do",
            "text_color": "#ff0000",
            "background_color": "#ffffff"
          }
        ]
      },
      {
        "type": "TEXT",
        "label": "Ghi chú",
        "name": "notes",
        "placeholder": "Nhập ghi chú",
        "defaultValue": "",
        "required": false
      },
      {
        "type": "SELECT_LIST_RECORD",
        "label": "Phòng ban liên quan",
        "name": "related_departments",
        "placeholder": "Chọn phòng ban liên quan",
        "defaultValue": "",
        "required": false,
        "referenceTableId": "818041752232394753",
        "referenceField": "",
        "referenceLabelField": "department_name",
        "additionalCondition": ""
      },
      {
        "type": "SELECT_ONE_RECORD",
        "label": "Hồ sơ nhân sự",
        "name": "employee",
        "placeholder": "Chọn hồ sơ nhân sự",
        "defaultValue": "",
        "required": false,
        "referenceTableId": "818040940370329601",
        "referenceField": "",
        "referenceLabelField": "employee_name",
        "additionalCondition": ""
      },
      {
        "type": "CHECKBOX_LIST",
        "label": "Check list",
        "name": "check_list",
        "placeholder": "Chọn check list",
        "defaultValue": "",
        "required": false,
        "options": [
          {
            "text": "Đã kiểm tra",
            "value": "checked",
            "text_color": "#000000",
            "background_color": "#ffffff"
          },
          {
            "text": "Đã báo cáo sếp",
            "value": "reported",
            "text_color": "#000000",
            "background_color": "#ffffff"
          },
          {
            "text": "Đã triển khai",
            "value": "deployed",
            "text_color": "#000000",
            "background_color": "#ffffff"
          }
        ]
      },
      {
        "type": "YEAR",
        "label": "Năm",
        "name": "year",
        "placeholder": "Nhập năm",
        "defaultValue": "2025",
        "required": false
      },
      {
        "type": "MONTH",
        "label": "Tháng",
        "name": "month",
        "placeholder": "Nhập tháng",
        "defaultValue": "01",
        "required": false
      },
      {
        "type": "DAY",
        "label": "Ngày",
        "name": "day",
        "placeholder": "Nhập ngày",
        "defaultValue": "01",
        "required": false
      },
      {
        "type": "HOUR",
        "label": "Giờ",
        "name": "hour",
        "placeholder": "Nhập giờ",
        "defaultValue": "00",
        "required": false
      },
      {
        "type": "MINUTE",
        "label": "Phút",
        "name": "minutes",
        "placeholder": "Nhập phút",
        "defaultValue": "00",
        "required": false
      },
      {
        "type": "DATE",
        "label": "Ngày tháng",
        "name": "date",
        "placeholder": "Nhập ngày",
        "defaultValue": "",
        "required": false
      },
      {
        "type": "TIME",
        "label": "Thời gian (giờ-phút-giây)",
        "name": "time",
        "placeholder": "Nhập thời gian",
        "defaultValue": "00:00",
        "required": false
      },
      {
        "type": "INTEGER",
        "label": "Trọng số công việc",
        "name": "task_weight",
        "placeholder": "Nhập trọng số công việc",
        "defaultValue": "",
        "required": false
      },
      {
        "type": "NUMERIC",
        "label": "Tiền về dự kiến (VNĐ)",
        "name": "money",
        "placeholder": "Nhập tiền về dự kiến",
        "defaultValue": "100000.00",
        "required": false
      },
      {
        "type": "EMAIL",
        "label": "Email khách hàng",
        "name": "customer_email",
        "placeholder": "Nhập email khách hàng",
        "defaultValue": "sangdung.ts@gmail.com",
        "required": false
      },
      {
        "type": "URL",
        "label": "Trang chủ",
        "name": "home_url",
        "placeholder": "Nhập trang chủ",
        "defaultValue": "https://beqeek.com",
        "required": false
      },
      {
        "type": "CHECKBOX_YES_NO",
        "label": "Đã nhận đủ tiền",
        "name": "check_money",
        "placeholder": "Đã nhận đủ tiền",
        "defaultValue": "",
        "required": false
      },
      {
        "type": "CHECKBOX_ONE",
        "label": "Danh mục",
        "name": "category",
        "placeholder": "Chọn danh mục",
        "defaultValue": "",
        "required": false
      },
      {
        "type": "FIRST_REFERENCE_RECORD",
        "label": "Hội nhập",
        "name": "onboarding",
        "placeholder": "Trường này readonly, nếu dòng chữ này xuất hiện có nghĩa là đang sai ở đâu đó",
        "defaultValue": "",
        "required": false,
        "referenceTableId": "826375571175899137",
        "referenceField": "task",
        "referenceLabelField": "employee_name",
        "additionalCondition": ""
      }
    ],
    "actions": [
      {
        "name": "Tạo mới bản ghi",
        "type": "create",
        "icon": "create",
        "actionId": "019a4d0c-10ef-25-71-867906c9311ccf6f"
      },
      {
        "name": "Truy cập bản ghi",
        "type": "access",
        "icon": "access",
        "actionId": "019a4d0c-10ef-d8-79-9e3a81dd216fea78"
      },
      {
        "name": "Cập nhật bản ghi",
        "type": "update",
        "icon": "update",
        "actionId": "019a4d0c-10ef-02-75-8a11db1d3983350e"
      },
      {
        "name": "Xoá bản ghi",
        "type": "delete",
        "icon": "delete",
        "actionId": "019a4d0c-10ef-0a-7f-abdb19e7476ce35a"
      },
      {
        "name": "Thêm bình luận",
        "type": "comment_create",
        "icon": "create",
        "actionId": "019a4d0c-10ef-e1-7e-b88341cc7cea411f"
      },
      {
        "name": "Truy cập bình luận",
        "type": "comment_access",
        "icon": "access",
        "actionId": "019a4d0c-10ef-d0-70-a27fa08cd9cfa519"
      },
      {
        "name": "Cập nhật bình luận",
        "type": "comment_update",
        "icon": "update",
        "actionId": "019a4d0c-10ef-c1-77-a71217b1b582a247"
      },
      {
        "name": "Xoá bình luận",
        "type": "comment_delete",
        "icon": "delete",
        "actionId": "019a4d0c-10ef-a1-75-a91ac148711bb090"
      }
    ],
    "quickFilters": [
      {
        "fieldName": "assignee"
      },
      {
        "fieldName": "status"
      },
      {
        "fieldName": "matrix_quadrant"
      },
      {
        "fieldName": "self_evaluation"
      },
      {
        "fieldName": "related_users"
      }
    ],
    "tableLimit": 1000,
    "e2eeEncryption": false,
    "hashedKeywordFields": ["task_title", "task_description"],
    "defaultSort": "desc",
    "kanbanConfigs": [
      {
        "kanbanScreenId": "01995098-a0bf-7c1b-9bca-5877b1ae7ceb",
        "screenName": "Ma trận Eisenhower",
        "screenDescription": "",
        "statusField": "matrix_quadrant",
        "kanbanHeadlineField": "task_title",
        "displayFields": ["start_date", "duo_date", "assignee", "status", "self_evaluation", "plan"]
      },
      {
        "kanbanScreenId": "01995098-a0bf-76b4-9eb6-efc9ce0797ca",
        "screenName": "Trạng thái",
        "screenDescription": "",
        "statusField": "status",
        "kanbanHeadlineField": "task_title",
        "displayFields": ["start_date", "duo_date", "matrix_quadrant", "assignee", "self_evaluation", "plan"]
      },
      {
        "kanbanScreenId": "01995098-a0bf-7cb0-9036-3bd1a23fadfa",
        "screenName": "Tình trạng công việc",
        "screenDescription": "Phân loại theo đánh giá tình trạng",
        "statusField": "self_evaluation",
        "kanbanHeadlineField": "task_title",
        "displayFields": ["assignee", "matrix_quadrant", "status", "duo_date", "plan"]
      },
      {
        "kanbanScreenId": "01995098-a0bf-7897-9adf-05e5891b2b1e",
        "screenName": "Kế hoạch",
        "screenDescription": "Phân loại theo kế hoạch triển khai",
        "statusField": "plan",
        "kanbanHeadlineField": "task_title",
        "displayFields": ["matrix_quadrant", "assignee", "status", "self_evaluation", "duo_date"]
      }
    ],
    "recordListConfig": {
      "layout": "generic-table",
      "displayFields": [
        "task_title",
        "task_description",
        "start_date",
        "duo_date",
        "matrix_quadrant",
        "no_plan",
        "self_evaluation",
        "assignee",
        "status",
        "related_users",
        "color_tag",
        "notes",
        "related_departments",
        "employee",
        "check_list",
        "year",
        "month",
        "day",
        "hour",
        "minutes",
        "date",
        "time",
        "task_weight",
        "money",
        "customer_email",
        "home_url",
        "check_money",
        "category",
        "onboarding"
      ]
    },
    "recordDetailConfig": {
      "layout": "head-detail",
      "commentsPosition": "right-panel",
      "headTitleField": "task_title",
      "headSubLineFields": ["matrix_quadrant", "assignee", "status"],
      "rowTailFields": ["task_description", "start_date", "duo_date", "self_evaluation"]
    },
    "permissionsConfig": [
      {
        "teamId": "818003905471315969",
        "roleId": "818003906121433089",
        "actions": [
          {
            "actionId": "019a4d0c-10ef-25-71-867906c9311ccf6f",
            "permission": "allowed"
          },
          {
            "actionId": "019a4d0c-10ef-d8-79-9e3a81dd216fea78",
            "permission": "all"
          },
          {
            "actionId": "019a4d0c-10ef-02-75-8a11db1d3983350e",
            "permission": "all"
          },
          {
            "actionId": "019a4d0c-10ef-0a-7f-abdb19e7476ce35a",
            "permission": "all"
          },
          {
            "actionId": "019a4d0c-10ef-e1-7e-b88341cc7cea411f",
            "permission": "self_created"
          },
          {
            "actionId": "019a4d0c-10ef-d0-70-a27fa08cd9cfa519",
            "permission": "comment_self_created"
          },
          {
            "actionId": "019a4d0c-10ef-c1-77-a71217b1b582a247",
            "permission": "comment_self_created"
          },
          {
            "actionId": "019a4d0c-10ef-a1-75-a91ac148711bb090",
            "permission": "comment_self_created"
          }
        ]
      }
    ],
    "ganttCharts": [
      {
        "ganttScreenId": "01995098-a0bf-76ff-b96e-5218415dd40a",
        "screenName": "Timeline công việc",
        "screenDescription": "",
        "taskNameField": "task_title",
        "startDateField": "start_date",
        "endDateField": "duo_date",
        "progressField": null,
        "dependencyField": null
      }
    ],
    "encryptionKey": "IvmrHQzycueDW7jgW9BftcCbrf20RUUt",
    "encryptionAuthKey": "7fe470dde1e39355502a6616ba21ef328d8c99b63e37a742c7035e7f880ffb95"
  }
}
```

### 2.2. Đối tượng `Field` (Trường dữ liệu)

Mỗi phần tử trong mảng `fields` định nghĩa một cột trong bảng dữ liệu. Giao diện nhập liệu cho người dùng cuối sẽ được sinh ra dựa trên các định nghĩa này.

#### 2.2.1. Cấu trúc cơ bản

```json
{
  "type": "string",
  "label": "string",
  "name": "string",
  "placeholder": "string",
  "defaultValue": "any",
  "required": "boolean"
  // ... các thuộc tính cho từng loại cụ thể
}
```

- `label`: Tên hiển thị của trường trên giao diện (ví dụ: "Tên khách hàng").
- `name`: Tên định danh duy nhất của trường, dùng làm key trong đối tượng dữ liệu (ví dụ: `ten_khach_hang`).
- `required`: Trường có bắt buộc nhập hay không.

#### 2.2.2. Phân loại chi tiết các `type`

##### a. Nhóm Text

- **`SHORT_TEXT`**, **`EMAIL`**, **`URL`**: Dùng cho chuỗi ngắn.
  - **UI Control**: Input text (`<input type="text">`).
  - **Validation**: `EMAIL` và `URL` cần có validation định dạng.
  - **Ví dụ JSON**:
    ```json
    {
      "type": "SHORT_TEXT",
      "label": "Tên công việc",
      "name": "task_title",
      "placeholder": "Nhập tên công việc",
      "defaultValue": "",
      "required": true
    }
    ```
- **`TEXT`**: Dùng cho đoạn văn bản dài.
  - **UI Control**: Textarea (`<textarea>`).
  - **Ví dụ JSON**:
    ```json
    {
      "type": "TEXT",
      "label": "Ghi chú",
      "name": "notes",
      "placeholder": "Nhập ghi chú",
      "defaultValue": "",
      "required": false
    }
    ```
- **`RICH_TEXT`**: Dùng cho nội dung có định dạng.
  - **UI Control**: Một trình soạn thảo WYSIWYG (ví dụ: TinyMCE, Quill.js).
  - **Ví dụ JSON**:
    ```json
    {
      "type": "RICH_TEXT",
      "label": "Nội dung công việc",
      "name": "task_description",
      "placeholder": "Mô tả ngắn gọn về nội dung công việc",
      "defaultValue": "",
      "required": false
    }
    ```

##### b. Nhóm Thời gian

- **`DATE`**, **`DATETIME`**, **`TIME`**: Dùng để chọn ngày/giờ.
  - **UI Control**: Một widget chọn ngày/giờ (Date/Time Picker).
  - **Ví dụ JSON (`DATETIME`)**:
    ```json
    {
      "type": "DATETIME",
      "label": "Thời gian bắt đầu",
      "name": "start_date",
      "placeholder": "Chọn thời gian bắt đầu",
      "defaultValue": "",
      "required": false
    }
    ```
- **`YEAR`**, **`MONTH`**, **`DAY`**, **`HOUR`**, **`MINUTE`**, **`SECOND`**: Dùng cho các giá trị số nguyên đại diện cho một phần của thời gian.
  - **UI Control**: Input số (`<input type="number">`) hoặc dropdown.
  - **Ví dụ JSON (`YEAR`)**:
    ```json
    {
      "type": "YEAR",
      "label": "Năm",
      "name": "year",
      "placeholder": "Nhập năm",
      "defaultValue": "2025",
      "required": false
    }
    ```

##### c. Nhóm Số

- **`INTEGER`**, **`NUMERIC`**: Dùng cho giá trị số.
  - **UI Control**: Input số (`<input type="number">`). `NUMERIC` cho phép nhập số thực, `INTEGER` chỉ cho phép số nguyên.
  - **Ví dụ JSON (`INTEGER`)**:
    ```json
    {
      "type": "INTEGER",
      "label": "Trọng số công việc",
      "name": "task_weight",
      "placeholder": "Nhập trọng số công việc",
      "defaultValue": "",
      "required": false
    }
    ```
  - **Ví dụ JSON (`NUMERIC`)**:
    ```json
    {
      "type": "NUMERIC",
      "label": "Tiền về dự kiến (VNĐ)",
      "name": "money",
      "placeholder": "Nhập tiền về dự kiến",
      "defaultValue": "100000.00",
      "required": false
    }
    ```

##### d. Nhóm Lựa chọn (Sử dụng thuộc tính `options`)

Thuộc tính `options` là một mảng các đối tượng, cho phép định nghĩa các lựa chọn có sẵn cho trường. Cấu trúc này rất hữu ích để hiển thị các trạng thái dưới dạng "tag" hoặc "badge" có màu sắc.

**Cấu trúc một item trong `options`:**

```json
{
  "value": "string",
  "text": "string",
  "text_color": "string",
  "background_color": "string"
}
```

- `value`: Giá trị thực tế sẽ được lưu vào cơ sở dữ liệu (ví dụ: `"pending_approval"`).
- `text`: Nhãn hiển thị cho người dùng (ví dụ: `"Chờ phê duyệt"`).
- `text_color`: Mã màu HEX hoặc tên màu cho chữ của tag/badge (ví dụ: `"#ffffff"`).
- `background_color`: Mã màu HEX hoặc tên màu cho nền của tag/badge (ví dụ: `"#ff9800"`).

**Các loại trường sử dụng `options`:**

- **`CHECKBOX_YES_NO`**: Lựa chọn đúng/sai.
  - **UI Control**: Một checkbox duy nhất.
  - **Ví dụ JSON**:
    ```json
    {
      "type": "CHECKBOX_YES_NO",
      "label": "Đã nhận đủ tiền",
      "name": "check_money",
      "placeholder": "Đã nhận đủ tiền",
      "defaultValue": "",
      "required": false
    }
    ```
- **`CHECKBOX_ONE`**, **`SELECT_ONE`**: Chọn một giá trị từ một danh sách.
  - **UI Control**: Nhóm radio button hoặc dropdown chọn một. Các lựa chọn được điền từ mảng `options`.
  - **Ví dụ JSON (`SELECT_ONE`)**:
    ```json
    {
      "type": "SELECT_ONE",
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
          "text": "Hoàn thành",
          "value": "completed",
          "text_color": "#ffffff",
          "background_color": "#28a745"
        }
      ]
    }
    ```
- **`CHECKBOX_LIST`**, **`SELECT_LIST`**: Chọn nhiều giá trị từ một danh sách.
  - **UI Control**: Nhóm checkbox hoặc dropdown/tag input chọn nhiều. Các lựa chọn được điền từ mảng `options`.
  - **Ví dụ JSON (`SELECT_LIST`)**:
    ```json
    {
      "type": "SELECT_LIST",
      "label": "Thẻ màu",
      "name": "color_tag",
      "placeholder": "Chọn thẻ màu",
      "defaultValue": "",
      "required": false,
      "options": [
        {
          "text": "đen",
          "value": "den",
          "text_color": "#000000",
          "background_color": "#ffffff"
        },
        {
          "text": "vàng",
          "value": "vang",
          "text_color": "#ffff80",
          "background_color": "#ffffff"
        }
      ]
    }
    ```

##### e. Nhóm Tham chiếu (Sử dụng các thuộc tính `reference_*`)

- **`SELECT_ONE_RECORD`**, **`SELECT_LIST_RECORD`**: Dùng để tạo liên kết tới một hoặc nhiều bản ghi ở một Active Table khác.
  - **UI Control**: Một dropdown có chức năng tìm kiếm (autocomplete) hoặc một nút mở ra popup để tìm và chọn bản ghi từ bảng khác.
  - **Thuộc tính liên quan**:
    - `referenceTableId`: ID của bảng nguồn cần lấy dữ liệu.
    - `referenceLabelField`: Tên trường trong bảng nguồn sẽ được dùng để hiển thị cho người dùng (ví dụ: `ten_san_pham`).
    - `additionalCondition`: (Tùy chọn) Một chuỗi điều kiện để lọc các bản ghi được phép chọn từ bảng nguồn (ví dụ: `"trang_thai='hoat_dong'"`).
  - **Ví dụ JSON (`SELECT_ONE_RECORD`)**:
    ```json
    {
      "type": "SELECT_ONE_RECORD",
      "label": "Hồ sơ nhân sự",
      "name": "employee",
      "placeholder": "Chọn hồ sơ nhân sự",
      "defaultValue": "",
      "required": false,
      "referenceTableId": "818040940370329601",
      "referenceField": "",
      "referenceLabelField": "employee_name",
      "additionalCondition": ""
    }
    ```
- **`FIRST_REFERENCE_RECORD`**: Một trường đặc biệt, **chỉ đọc (read-only)**, dùng để hiển thị dữ liệu từ một bản ghi ở bảng khác có liên kết ngược lại với bản ghi hiện tại.
  - **Mục đích**: Thường dùng để hiển thị thông tin tóm tắt từ một mối quan hệ "has-one" hoặc "has-many" từ phía "một". Ví dụ: hiển thị "ngày thanh toán đầu tiên" của một "đơn hàng".
  - **UI Control**: Chỉ hiển thị dưới dạng văn bản, không có control nhập liệu.
  - **Thuộc tính liên quan**:
    - `referenceTableId`: ID của bảng tham chiếu (bảng B) cần tìm kiếm.
    - `referenceField`: **(Bắt buộc)** Tên của trường trong `referenceTableId` (bảng B) chứa ID của bản ghi hiện tại (bảng A). Trường này **phải có kiểu `SELECT_ONE_RECORD`** trên bảng tham chiếu. Đây là "khóa ngoại" của liên kết ngược.
    - `referenceLabelField`: Tên trường trong `referenceTableId` (bảng B) sẽ được dùng để hiển thị giá trị.
    - `additionalCondition`: (Tùy chọn) Điều kiện lọc bổ sung khi tìm kiếm trong bảng tham chiếu.
  - **Cơ chế hoạt động API**:
    - Để tối ưu, khi hiển thị một danh sách các bản ghi, frontend sẽ gom tất cả ID của các bản ghi đang hiển thị và gửi một truy vấn hàng loạt duy nhất đến `referenceTableId`.
    - Truy vấn này sử dụng tham số `group` bằng với giá trị của `referenceField`. Điều này cho phép backend nhóm các kết quả theo `referenceField` và chỉ trả về bản ghi đầu tiên cho mỗi nhóm, giúp giảm đáng kể lượng dữ liệu truyền về và tối ưu hóa hiệu suất.
  - **Ví dụ JSON**:
    ```json
    {
      "type": "FIRST_REFERENCE_RECORD",
      "label": "Hội nhập",
      "name": "onboarding",
      "placeholder": "Trường này readonly, nếu dòng chữ này xuất hiện có nghĩa là đang sai ở đâu đó",
      "defaultValue": "",
      "required": false,
      "referenceTableId": "826375571175899137",
      "referenceField": "task",
      "referenceLabelField": "employee_name",
      "additionalCondition": ""
    }
    ```

##### f. Nhóm Người dùng

- **`SELECT_ONE_WORKSPACE_USER`**, **`SELECT_LIST_WORKSPACE_USER`**: Dùng để chọn một hoặc nhiều người dùng trong workspace.
  - **UI Control**: Một dropdown có chức năng tìm kiếm (autocomplete) để tìm và chọn người dùng.
  - **Ví dụ JSON (`SELECT_ONE_WORKSPACE_USER`)**:
    ```json
    {
      "type": "SELECT_ONE_WORKSPACE_USER",
      "label": "Người phụ trách",
      "name": "assignee",
      "placeholder": "Chọn người phụ trách",
      "defaultValue": "",
      "required": false,
      "referenceLabelField": "fullName"
    }
    ```

### 2.3. Đối tượng `Action` (Hành động)

Đối tượng này định nghĩa một hành động mà người dùng có thể thực hiện trên một bản ghi hoặc trên cả bảng. Các hành động này thường được hiển thị dưới dạng các nút (button) trên giao diện.

#### 2.3.1. Cấu trúc cơ bản

```json
{
  "actionId": "string",
  "name": "string",
  "type": "string",
  "icon": "string"
}
```

- **`actionId`**: Một mã định danh duy nhất (UUID) cho mỗi hành động. Đây là thuộc tính quan trọng nhất đối với các hành động tùy chỉnh, vì nó được dùng để backend hoặc các hệ thống khác xác định logic nghiệp vụ cần thực thi.
- **`name`**: Nhãn văn bản hiển thị trên nút cho người dùng thấy (ví dụ: "Gửi phê duyệt", "Xuất file PDF").
- **`icon`**: Tên của một icon (ví dụ, từ thư viện Material Icons) để hiển thị bên cạnh nhãn, giúp giao diện trực quan hơn.
- **`type`**: Phân loại hành động. Đây là thuộc tính quyết định hành vi của nút. Xem chi tiết bên dưới.

#### 2.3.2. Phân loại chi tiết các `type`

Có hai nhóm `type` chính: hành động hệ thống và hành động tùy chỉnh.

##### a. Hành động Hệ thống (System Actions)

Đây là các hành động có sẵn với các hành vi đã được định nghĩa trước, gắn liền với các chức năng CRUD cơ bản.

- **`create`**: Mở ra giao diện/form để tạo một bản ghi mới.
- **`access`**: Di chuyển người dùng đến trang xem chi tiết của một bản ghi đã chọn.
- **`update`**: Mở ra giao diện/form để chỉnh sửa một bản ghi hiện có.
- **`delete`**: Kích hoạt luồng xóa một bản ghi (thường có yêu cầu xác nhận).
- **`comment_create`**, **`comment_access`**, **`comment_update`**, **`comment_delete`**: Tương tự như trên, nhưng áp dụng cho các chức năng CRUD trên các bình luận (comments) của một bản ghi.

##### b. Hành động Tùy chỉnh (Custom Actions)

- **`custom`**: Đây là loại hành động linh hoạt nhất, do người dùng tự định nghĩa.
  - **Mục đích**: Dùng để kích hoạt các quy trình nghiệp vụ (business logic) đặc thù không thuộc CRUD cơ bản. Ví dụ: "Gửi email thông báo", "Chuyển trạng thái sang Đã duyệt", "Đồng bộ với hệ thống khác".
  - **Hành vi Frontend**: Khi người dùng nhấn vào nút của một hành động `custom`, giao diện người dùng (frontend) có trách nhiệm gửi một sự kiện lên backend, mang theo `actionId` của hành động đó và ID của bản ghi đang được tác động.
  - **Hành vi Backend**: Backend lắng nghe các sự kiện này. Dựa vào `actionId` nhận được, nó sẽ thực thi logic nghiệp vụ tương ứng đã được lập trình sẵn.

### 2.4. Đối tượng `recordListConfig`

Đối tượng này quy định cách hiển thị một danh sách các bản ghi.

#### 2.4.1. Cấu trúc

```json
{
  "layout": "'generic-table' | 'head-column'",

  // Dùng cho layout 'generic-table'
  "displayFields": ["field_name_1", "field_name_2"],

  // Dùng cho layout 'head-column'
  "titleField": "string",
  "subLineFields": ["field_name_3"],
  "tailFields": ["field_name_4"]
}
```

#### 2.4.2. Giải thích Layouts

- **`generic-table`**: Bố cục bảng tiêu chuẩn.
  - **Mô tả**: Mỗi bản ghi là một hàng, mỗi trường là một cột.
  - **Thuộc tính**: `displayFields` là một mảng các `name` của trường, quy định những cột nào sẽ được hiển thị và theo thứ tự nào.

- **`head-column`**: Bố cục dạng "thẻ" (card) rút gọn.
  - **Mô tả**: Mỗi bản ghi được hiển thị như một dòng thông tin tóm tắt, phù hợp với giao diện mobile hoặc khi cần hiển thị nhiều thông tin trong không gian hẹp.
  - **Thuộc tính**:
    - `titleField`: Tên của trường sẽ được dùng làm tiêu đề chính (in đậm, chữ to).
    - `subLineFields`: Mảng các tên trường sẽ được hiển thị thành các dòng thông tin phụ bên dưới tiêu đề.
    - `tailFields`: Mảng các tên trường sẽ được hiển thị ở phía cuối của dòng, thường dùng cho trạng thái, ngày tháng hoặc các thông tin ngắn gọn.

### 2.5. Đối tượng `recordDetailConfig`

Đối tượng này quy định cách hiển thị chi tiết của một bản ghi duy nhất.

#### 2.5.1. Cấu trúc

```json
{
  "layout": "'head-detail' | 'two-column-detail'",
  "commentsPosition": "'right-panel' | 'hidden'",

  // Dùng cho layout 'head-detail'
  "titleField": "string",
  "subLineFields": ["field_name_1"],
  "tailFields": ["field_name_2"],

  // Dùng cho layout 'two-column-detail'
  "headTitleField": "string",
  "headSubLineFields": ["field_name_3"],
  "column1Fields": ["field_name_4", "field_name_5"],
  "column2Fields": ["field_name_6", "field_name_7"]
}
```

#### 2.5.2. Giải thích Layouts

- **`head-detail`**: Bố cục một cột.
  - **Mô tả**: Tương tự `head-column` của màn hình danh sách, nhưng các trường được xếp dọc từ trên xuống, phù hợp cho màn hình hẹp.
  - **Thuộc tính**: `titleField`, `subLineFields`, `tailFields`.

- **`two-column-detail`**: Bố cục hai cột.
  - **Mô tả**: Bố cục dành cho màn hình rộng, chia các trường thông tin thành hai cột trái và phải.
  - **Thuộc tính**:
    - `headTitleField`, `headSubLineFields`: Tiêu đề và các dòng phụ sẽ trải dài hết chiều rộng của panel.
    - `column1Fields`: Mảng các tên trường sẽ hiển thị ở cột bên trái.
    - `column2Fields`: Mảng các tên trường sẽ hiển thị ở cột bên phải.

#### 2.5.3. Thuộc tính khác

- **`commentsPosition`**: Quy định cách hiển thị của khu vực bình luận/lịch sử hoạt động.
  - `right-panel`: Hiển thị ở một cột riêng bên phải.
  - `hidden`: Ẩn khu vực bình luận.

### 2.6. Đối tượng `Quick Filter`

Quick Filter là một cấu hình để **chỉ định các trường dữ liệu sẽ được hiển thị như một bộ lọc nhanh** trên giao diện màn hình danh sách.

#### 2.6.1. Mục đích

Định nghĩa các trường sẽ được "ghim" lên đầu màn hình danh sách bản ghi, cho phép người dùng truy cập và lọc nhanh theo các trường đó mà không cần vào phần bộ lọc nâng cao. Ví dụ: nếu bạn thêm trường `status` vào danh sách Quick Filter, một dropdown lọc theo `status` sẽ hiện ra ở vị trí nổi bật.

#### 2.6.2. Cấu trúc

Mỗi phần tử trong mảng `quickFilters` là một đối tượng có cấu trúc cực kỳ đơn giản:

```json
{
  "fieldName": "string"
}
```

- **`fieldName`**: `name` của trường dữ liệu (từ danh sách `fields` chính) sẽ được hiển thị dưới dạng một control (thường là dropdown) để lọc trên màn hình danh sách.

#### 2.6.3. Các loại trường hợp lệ

Chỉ các trường có kiểu lựa chọn (choice-based) mới có thể được dùng làm Quick Filter. Dựa trên mã nguồn, các loại trường hợp lệ là:

- `CHECKBOX_YES_NO`
- `SELECT_ONE`
- `SELECT_LIST`
- `SELECT_ONE_RECORD`
- `SELECT_ONE_WORKSPACE_USER`
- `SELECT_LIST_WORKSPACE_USER`

### 2.7. Đối tượng `Kanban Config`

Đối tượng này định nghĩa một "view" Kanban. Một Active Table có thể có nhiều view Kanban khác nhau (ví dụ: một view cho team Marketing, một view cho team Kỹ thuật). Mỗi view sẽ hiển thị các bản ghi dưới dạng các thẻ (card) được sắp xếp vào các cột.

#### 2.7.1. Mục đích

Giúp người dùng hình dung quy trình làm việc (workflow) bằng cách nhóm các công việc/bản ghi vào các cột trạng thái. Người dùng có thể kéo-thả các thẻ giữa các cột để cập nhật trạng thái của chúng.

#### 2.7.2. Cấu trúc

Mỗi phần tử trong mảng `kanbanConfigs` là một đối tượng với cấu trúc sau, được cấu hình thông qua popup "Cấu hình Kanban" (`id="kanban-config-form"`):

```json
{
  "kanbanScreenId": "string",
  "screenName": "string",
  "screenDescription": "string",
  "statusField": "string",
  "kanbanHeadlineField": "string",
  "displayFields": ["field_name_1", "field_name_2"]
}
```

- **`kanbanScreenId`**: UUID để định danh duy nhất cho view Kanban này.
  - **UI Control**: `input[type=hidden]#kanban-screen-id`
- **`screenName`**: Tên của view Kanban (ví dụ: "Quy trình xử lý ticket", "Pipeline bán hàng"). Tên này sẽ hiển thị trên menu chọn view của người dùng.
  - **UI Control**: `input[type=text]#kanban-screen-name`
- **`screenDescription`**: Mô tả chi tiết hơn về mục đích của view Kanban này.
  - **UI Control**: `textarea#kanban-screen-description`
- **`statusField`**: **Thuộc tính quan trọng nhất.** Đây là `name` của trường sẽ được dùng để tạo ra các cột cho bảng Kanban. Các giá trị duy nhất của trường này sẽ trở thành các cột. Ví dụ, nếu `statusField` là trường "Trạng thái" có các lựa chọn "Mới", "Đang xử lý", "Hoàn thành", bảng Kanban sẽ có 3 cột tương ứng.
  - **UI Control**: `select#kanban-status-field`
- **`kanbanHeadlineField`**: `name` của trường sẽ được dùng làm tiêu đề chính (chữ to, in đậm) cho mỗi thẻ Kanban.
  - **UI Control**: `select#kanban-headline-field`
- **`displayFields`**: Một mảng các `name` của các trường khác sẽ được hiển thị trên thẻ Kanban để cung cấp thêm thông tin tóm tắt.
  - **UI Control**: `select[multiple]#kanban-display-fields`

#### 2.7.3. Các loại trường hợp lệ

- Đối với `statusField`, chỉ các trường lựa chọn đơn (single-choice) mới hợp lệ, vì một thẻ chỉ có thể ở một cột tại một thời điểm. Dựa trên mã nguồn (`active-tables-v2.blade.php`), các loại trường hợp lệ là:
  - `SELECT_ONE`
  - `SELECT_ONE_RECORD`
  - `SELECT_ONE_WORKSPACE_USER`
- Đối với `kanbanHeadlineField` và `displayFields`, tất cả các loại trường đều có thể được chọn.

### 2.8. Đối tượng `Gantt Config`

Đối tượng này định nghĩa một "view" Gantt Chart. Một Active Table có thể có nhiều view Gantt khác nhau. Mỗi view sẽ hiển thị các bản ghi dưới dạng các thanh (bar) trên một dòng thời gian, giúp theo dõi tiến độ dự án.

#### 2.8.1. Mục đích

Giúp người dùng lập kế hoạch và theo dõi tiến độ của các công việc hoặc dự án theo thời gian. Biểu đồ Gantt trực quan hóa ngày bắt đầu, ngày kết thúc, tiến độ và sự phụ thuộc giữa các công việc.

#### 2.8.2. Cấu trúc

Mỗi phần tử trong mảng `ganttCharts` là một đối tượng với cấu trúc sau, được cấu hình thông qua popup "Cấu hình Gantt" (`id="gantt-config-form"`):

```json
{
  "ganttScreenId": "string",
  "screenName": "string",
  "screenDescription": "string",
  "taskNameField": "string",
  "startDateField": "string",
  "endDateField": "string",
  "progressField": "string",
  "dependencyField": "string"
}
```

- **`ganttScreenId`**: UUID để định danh duy nhất cho view Gantt này.
  - **UI Control**: `input[type=hidden]#gantt-screen-id`
- **`screenName`**: Tên của view Gantt (ví dụ: "Kế hoạch dự án A", "Lịch trình sản xuất").
  - **UI Control**: `input[type=text]#gantt-screen-name`
- **`screenDescription`**: Mô tả chi tiết hơn về mục đích của view Gantt này.
  - **UI Control**: `textarea#gantt-screen-description`
- **`taskNameField`**: `name` của trường sẽ được dùng làm tên cho mỗi nhiệm vụ (thanh) trên biểu đồ.
  - **UI Control**: `select#gantt-task-name-field`
- **`startDateField`**: `name` của trường chứa ngày bắt đầu của nhiệm vụ.
  - **UI Control**: `select#gantt-start-date-field`
- **`endDateField`**: `name` của trường chứa ngày kết thúc của nhiệm vụ.
  - **UI Control**: `select#gantt-end-date-field`
- **`progressField`**: (Tùy chọn) `name` của trường chứa tỷ lệ phần trăm hoàn thành của nhiệm vụ (một số từ 0 đến 100).
  - **UI Control**: `select#gantt-progress-field`
- **`dependencyField`**: (Tùy chọn) `name` của trường chứa ID của các nhiệm vụ phụ thuộc (để vẽ các đường liên kết giữa các nhiệm vụ).
  - **UI Control**: `select#gantt-dependency-field`

#### 2.8.3. Các loại trường hợp lệ

Dựa trên mã nguồn (`active-tables-v2.blade.php`):

- **`taskNameField`**: Tất cả các loại trường đều có thể được chọn.
- **`startDateField`**, **`endDateField`**: Chỉ các trường có loại `DATE` hoặc `DATETIME` là hợp lệ.
- **`progressField`**: Chỉ các trường có loại `INTEGER` hoặc `NUMERIC` là hợp lệ.
- **`dependencyField`**: Chỉ các trường có loại `SELECT_LIST_RECORD` là hợp lệ, vì nó cần tham chiếu đến các bản ghi (nhiệm vụ) khác trong cùng bảng.

### 2.9. Đối tượng `Permissions Config` (Phân quyền Hành động)

Phần này mô tả cấu trúc `permissionsConfig`, mô hình phân quyền chi tiết dùng để kiểm soát việc thực thi các `Actions` (đã định nghĩa ở mục 2.3) cho từng `Role` trong mỗi `Team`.

#### 2.9.1. Mục đích

Cung cấp một cơ chế kiểm soát chi tiết, cho phép người quản trị chỉ định chính xác `Role` nào có quyền thực thi `Action` nào, và trong điều kiện nào (ví dụ: chỉ trên các bản ghi do chính mình tạo, hoặc trên tất cả bản ghi).

#### 2.9.2. Cấu trúc dữ liệu

Đối tượng cấu hình chính chứa một thuộc tính là `permissionsConfig`, là một mảng các đối tượng. Mỗi đối tượng trong mảng này định nghĩa một bộ quyền cho một cặp `teamId` và `roleId`.

**Cấu trúc tổng quan:**

```json
{
  "permissionsConfig": [
    {
      "teamId": "string",
      "roleId": "string",
      "actions": [
        {
          "actionId": "string",
          "permission": "string"
        }
        // ... more action permissions
      ]
    }
    // ... more team/role permissions
  ]
}
```

- **`teamId`**: ID của `Team` được cấu hình quyền.
- **`roleId`**: ID của `Role` (thuộc `teamId` tương ứng) được cấu hình quyền.
- **`actions`**: Một mảng định nghĩa các quyền trên từng `Action` cụ thể cho `Role` này.
  - **`actionId`**: ID của `Action` (từ danh sách `actions` ở mục 2.3) đang được cấp quyền.
  - **`permission`**: Chuỗi ký tự xác định quyền và điều kiện. Giá trị này được chọn từ một danh sách thả xuống trên giao diện, và danh sách này thay đổi tùy thuộc vào `type` của `Action` được cấu hình.

#### 2.9.3. Các giá trị `permission` cho phép theo Action Type

Dựa trên logic của hàm `populatePermissionsTable` trong mã nguồn, các tùy chọn cho `permission` được phân loại như sau:

##### a. Action có `type = 'create'`

Chỉ có hai tùy chọn, quyết định việc có được tạo bản ghi mới hay không.

- `not_allowed`: Không được phép.
- `allowed`: Được phép.

##### b. Action có `type` là `'access'`, `'update'`, `'delete'`, hoặc `'custom'`

Đây là nhóm quyền đa dạng nhất, cho phép kiểm soát hành động dựa trên quyền sở hữu hoặc liên quan đến bản ghi.

- `not_allowed`: Không được phép.
- `all`: Áp dụng trên tất cả bản ghi.
- `self_created`: Chỉ trên các bản ghi do chính người dùng tạo.
- `self_created_2h`: ... trong 2 giờ đầu.
- `self_created_12h`: ... trong 12 giờ đầu.
- `self_created_24h`: ... trong 24 giờ đầu.
- `assigned_user`: Chỉ trên các bản ghi được gán cho người dùng đó.
- `related_user`: Chỉ trên các bản ghi có liên quan đến người dùng.
- `self_created_or_assigned`: Trên các bản ghi do người dùng tạo HOẶC được gán cho họ.
- `self_created_or_related`: Trên các bản ghi do người dùng tạo HOẶC có liên quan đến họ.
- `created_by_team`: Trên các bản ghi được tạo bởi bất kỳ thành viên nào trong team.
- `created_by_team_2h`: ... trong 2 giờ đầu.
- `created_by_team_12h`: ... trong 12 giờ đầu.
- `created_by_team_24h`: ... trong 24 giờ đầu.
- `created_by_team_48h`: ... trong 48 giờ đầu.
- `created_by_team_72h`: ... trong 72 giờ đầu.
- `assigned_team_member`: Trên các bản ghi được gán cho bất kỳ thành viên nào trong team.
- `related_team_member`: Trên các bản ghi liên quan đến bất kỳ thành viên nào trong team.
- `created_or_assigned_team_member`: Trên các bản ghi được tạo bởi HOẶC gán cho bất kỳ thành viên nào trong team.
- `created_or_related_team_member`: Trên các bản ghi được tạo bởi HOẶC liên quan đến bất kỳ thành viên nào trong team.

##### c. Action có `type = 'comment_create'`

(Bao gồm các quyền tương tự nhóm b, nhưng áp dụng cho ngữ cảnh "trên bản ghi nào thì được tạo bình luận").

##### d. Action có `type = 'comment_access'`

Kiểm soát việc xem các bình luận.

- `not_allowed`: Không được xem.
- `all`: Xem tất cả bình luận.
- `comment_self_created`: Chỉ xem các bình luận do chính mình tạo.
- `comment_self_created_or_tagged`: Xem bình luận do mình tạo hoặc có nhắc đến (tag) mình.
- `comment_created_by_team`: Xem các bình luận được tạo bởi bất kỳ ai trong team.
- `comment_created_or_tagged_team_member`: Xem các bình luận được tạo bởi người trong team hoặc có tag thành viên trong team.

##### e. Action có `type` là `'comment_update'` hoặc `'comment_delete'`

Kiểm soát việc sửa/xóa bình luận, thường giới hạn theo thời gian.

- `not_allowed`: Không được phép.
- `all`: Sửa/xóa tất cả bình luận (quyền admin).
- `comment_self_created`: Chỉ sửa/xóa bình luận do mình tạo.
- `comment_self_created_2h`: ... trong 2 giờ đầu.
- `comment_self_created_12h`: ... trong 12 giờ đầu.
- `comment_self_created_24h`: ... trong 24 giờ đầu.
- `comment_created_by_team`: Sửa/xóa bình luận của bất kỳ ai trong team.
- `comment_created_by_team_2h`: ... trong 2 giờ đầu.
- `comment_created_by_team_12h`: ... trong 12 giờ đầu.
- `comment_created_by_team_24h`: ... trong 24 giờ đầu.

#### 2.9.4. Tương tác trên UI

- Giao diện Phân quyền (`id="pane-permissions"`) gọi hàm `populatePermissionsTable` để vẽ giao diện.
- Với mỗi cặp Team-Role, một danh sách các `Action` của bảng sẽ được hiển thị.
- Mỗi `Action` đi kèm một danh sách thả xuống (dropdown `<select>`) chứa các giá trị `permission` tương ứng với `Action Type` như đã mô tả ở trên.
- Khi người quản trị chọn một giá trị từ dropdown, hàm `saveTableConfig` sẽ đọc tất cả các lựa chọn này, xây dựng lại mảng `permissionsConfig` và gửi lên API để lưu.

---

## 3. Chức năng & Giao diện người dùng

Giao diện được chia theo các tab ở sidebar bên trái.

### 3.1. Tab: Chung (General)

- **Mục đích**: Cấu hình các thiết lập cơ bản cho bảng.
- **UI Components**:
  - `ID Bảng`: Text input, read-only. Có nút "Copy" bên cạnh.
  - `Khóa mã hóa`: Text input.
  - `Giới hạn bản ghi`: Number input (1-1000).
  - `Chiều sắp xếp mặc định`: Dropdown (`Cũ nhất`/`Mới nhất`).
  - `Trường dữ liệu tìm kiếm`: Multi-select dropdown, danh sách các trường có trong bảng.

### 3.2. Tab: Danh sách trường (Fields)

- **Mục đích**: Quản lý tất cả các trường dữ liệu của bảng.
- **UI Components**:
  - Một danh sách các "thẻ" (card), mỗi thẻ đại diện cho một trường đã tạo.
  - Mỗi thẻ hiển thị tên trường và có nút "Sửa", "Xóa".
  - Nút "Thêm trường" ở cuối danh sách.
- **Tương tác**:
  - Click "Thêm trường" hoặc "Sửa" sẽ mở ra **Popup Cấu hình Trường**.

### 3.3. Popup: Cấu hình Trường

- **Mục đích**: Form để tạo hoặc sửa một trường dữ liệu.
- **UI Components**:
  - `Loại trường`: Dropdown với danh sách tất cả các `type` ở mục 2.2.
  - `Tên trường` (Label): Text input.
  - `Tên biến` (Name): Text input, nên được tự động sinh ra từ Tên trường và không cho phép sửa.
  - `Placeholder`: Text input.
  - `Giá trị mặc định`: Text input.
  - `Bắt buộc`: Checkbox/Switch.
- **UI Điều kiện**:
  - Nếu `Loại trường` là `SELECT...` hoặc `CHECKBOX...`, một khu vực "Tùy chọn" sẽ hiện ra, cho phép người dùng thêm/xóa các cặp key-value.
  - Nếu `Loại trường` là `..._RECORD`, một khu vực "Tham chiếu" sẽ hiện ra, cho phép chọn Bảng tham chiếu và các trường liên quan.
- **Hành vi**: Khi "Xác nhận", dữ liệu trường được cập nhật vào state của client. Dữ liệu chỉ được gửi lên server khi người dùng bấm nút "Lưu" chính.

### 3.4. Tab: Danh sách hành động (Actions)

- **Mục đích**: Quản lý các hành động tùy chỉnh người dùng có thể thực hiện trên bản ghi.
- **UI Components**: Tương tự như Tab "Danh sách trường", nhưng dành cho các hành động.
- **Tương tác**: Mở ra **Popup Cấu hình Hành động** (gồm các input cho Tên, Icon).

### 3.5. Tab: Cấu hình màn danh sách (List View)

- **Mục đích**: Tùy chỉnh giao diện khi hiển thị nhiều bản ghi.
- **UI Components**:
  - `Loại bố cục`: Dropdown (`Bố cục bảng`, `Bố cục nhiều dòng`).
  - Dựa vào lựa chọn trên, các multi-select dropdown khác sẽ hiện ra để người dùng chọn các trường sẽ hiển thị ở các vị trí khác nhau (ví dụ: `Các trường hiển thị` cho layout bảng; `Trường tiêu đề`, `Các dòng đầu`, `Các dòng cuối` cho layout nhiều dòng).

### 3.6. Tab: Cấu hình chi tiết (Detail View)

- **Mục đích**: Tùy chỉnh giao diện khi xem một bản ghi.
- **UI Components**: Tương tự Tab "Cấu hình màn danh sách", nhưng với các layout cho màn chi tiết (`Bố cục nhiều dòng`, `Bố cục hai cột`).

### 3.7. Các Tab khác (Kanban, Gantt, Phân quyền, Hành động cẩn trọng)

- **Kanban/Gantt**: Cho phép tạo nhiều cấu hình hiển thị. Mỗi cấu hình có tên và các dropdown để chọn các trường tương ứng (trường trạng thái cho Kanban, trường ngày bắt đầu/kết thúc cho Gantt).
- **Phân quyền**: Hiển thị một bảng (matrix) với các hàng là Team/Role và các cột là quyền (Xem, Sửa, Xóa...). Admin có thể tick vào các checkbox để cấp quyền.
- **Hành động cẩn trọng**: Chứa nút "Xóa" bảng. Yêu cầu xác nhận trước khi thực hiện.

---

## 4. Hành vi chung

- **Lưu trữ trạng thái**: Mọi thay đổi trên giao diện (thêm/sửa/xóa trường, thay đổi cấu hình layout...) phải được lưu vào một đối tượng state ở phía client.
- **Nút "Lưu" chính**: Khi được nhấn, toàn bộ đối tượng state của client sẽ được gom lại thành một JSON (theo cấu trúc ở mục 2.1) và gửi lên API endpoint `PATCH /api/workspace/{workspaceId}/workflow/active_tables/{tableId}`.
- **Thông báo**: Sử dụng toast/notification để thông báo kết quả các hành động (Lưu thành công, Lỗi, Đã xóa...).
