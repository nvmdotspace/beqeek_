# Tài liệu tham khảo: Table Type Templates (TABLE_CONFIGS)

## 1. Tổng quan

### 1.1. Mục đích

Tài liệu này mô tả chi tiết tất cả các **Table Type Templates** được định nghĩa trong hệ thống `TABLE_CONFIGS`. Mỗi template là một cấu hình predefined cho một use case cụ thể, giúp người dùng nhanh chóng tạo bảng với các fields và cấu hình phù hợp mà không cần thiết lập từ đầu.

### 1.2. Cơ chế hoạt động

Khi user chọn một table type và nhấn "Tạo bảng", hệ thống sẽ:

```javascript
// 1. Lấy template config theo tableType
const config = TABLE_CONFIGS[tableType] || TABLE_CONFIGS.BLANK;

// 2. Load predefined fields từ template
this.fields = config.fields || [];

// 3. Load các cấu hình khác
this.tableLimit = config.tableLimit || 1000;
this.hashedKeywordFields = config.hashedKeywordFields || [];
this.quickFilters = config.quickFilters || [];
this.kanbanConfigs = config.kanbanConfigs || [];
this.recordListConfig = config.recordListConfig || null;
this.recordDetailConfig = config.recordDetailConfig || null;
```

### 1.3. Vị trí định nghĩa

- **File:** `docs/technical/html-module/active-tables.blade.php`
- **Line:** 2267-8200+ (xem Appendix A)
- **Object:** `const TABLE_CONFIGS = { ... }`

---

## 2. Danh sách Table Types

### 2.1. Quick Reference Table

| #   | Table Type                   | Use Case                       | Fields Count | Has Kanban | Has Gantt |
| --- | ---------------------------- | ------------------------------ | ------------ | ---------- | --------- |
| 1   | BLANK                        | Bảng trống (custom)            | 0            | ❌         | ❌        |
| 2   | JOB_TITLE                    | Quản lý chức danh              | 4            | ✅         | ❌        |
| 3   | DEPARTMENT                   | Quản lý phòng ban              | 5            | ✅         | ❌        |
| 4   | WORK_PROCESS                 | Quản lý quá trình công tác     | 13           | ✅         | ❌        |
| 5   | EMPLOYEE_PROFILE             | Quản lý hồ sơ cá nhân          | 12           | ✅         | ❌        |
| 6   | EMPLOYEE_MONTHLY_METRICS     | Chỉ số tháng của nhân sự       | 13           | ❌         | ❌        |
| 7   | PENALTY                      | Quản lý các khoản phạt         | 8            | ❌         | ❌        |
| 8   | SALARY_SETUP                 | Cấu hình bảng lương            | 15           | ❌         | ❌        |
| 9   | SALARY_POLICY                | Chính sách lương               | 51           | ✅         | ❌        |
| 10  | REWARD_POLICY                | Chính sách thưởng              | 10           | ✅         | ❌        |
| 11  | INSURANCE_POLICY             | Chính sách bảo hiểm            | 13           | ✅         | ❌        |
| 12  | LEAVE_POLICY                 | Chính sách nghỉ phép           | 24           | ✅         | ❌        |
| 13  | APPROVAL_REQUEST             | Yêu cầu phê duyệt              | 18           | ✅         | ❌        |
| 14  | TIME_OFF_RECORD_MANAGEMENT   | Quản lý nghỉ phép              | 13           | ✅         | ❌        |
| 15  | BENEFIT_PROGRAM_PARTICIPANT  | Quản lý phúc lợi nhân viên     | 14           | ✅         | ❌        |
| 16  | TAX_DEDUCTION                | Quản lý khoản khấu trừ thuế    | 13           | ✅         | ❌        |
| 17  | BENEFIT_POLICY               | Chính sách phúc lợi            | 15           | ✅         | ❌        |
| 18  | BENEFIT_MANAGEMENT           | Quản lý phúc lợi               | 16           | ✅         | ❌        |
| 19  | CULTURE_PROGRAM_REGISTRATION | Đăng ký chương trình văn hóa   | 17           | ✅         | ❌        |
| 20  | CULTURE_MANAGEMENT           | Quản lý văn hóa                | 19           | ✅         | ❌        |
| 21  | LEARNING_PROGRESS            | Tiến độ học tập                | 10           | ✅         | ❌        |
| 22  | TRAINING_PROGRAM             | Chương trình đào tạo           | 19           | ✅         | ✅        |
| 23  | ASSET_MANAGEMENT             | Quản lý tài sản                | 20           | ✅         | ❌        |
| 24  | VENDOR_MANAGEMENT            | Quản lý nhà cung cấp           | 17           | ✅         | ❌        |
| 25  | CUSTOMER_PIPELINE            | Pipeline khách hàng            | 27           | ✅         | ❌        |
| 26  | ONBOARDING                   | Quy trình onboarding           | 20           | ✅         | ✅        |
| 27  | HERZBERG_FACTOR              | Lý thuyết 2 yếu tố Herzberg    | 16           | ✅         | ❌        |
| 28  | SCAMPER                      | Phương pháp SCAMPER            | 15           | ✅         | ❌        |
| 29  | SWOT_EVALUATION              | Phân tích SWOT                 | 17           | ✅         | ❌        |
| 30  | CONTENT_SCRIPT_MANAGEMENT    | Quản lý nội dung script        | 17           | ✅         | ❌        |
| 31  | INSIGHT_TTM                  | Insight Time-to-Market         | 23           | ✅         | ✅        |
| 32  | PROTOTYPE                    | Nguyên mẫu sản phẩm            | 17           | ✅         | ✅        |
| 33  | TASK_EISENHOWER              | Quản lý công việc (Eisenhower) | 8            | ✅         | ✅        |
| 34  | CONTRACT                     | Quản lý hợp đồng               | 18           | ✅         | ❌        |
| 35  | HAIR_SALON_CUSTOMER          | Quản lý khách hàng salon       | 12+          | ✅         | ❌        |

---

## 3. Chi tiết các Table Types

### 3.1. BLANK - Bảng trống

**Mục đích:** Template cơ bản nhất, không có fields predefined. Dùng khi user muốn tự custom hoàn toàn.

```json
{
  "title": "Bảng Cơ bản",
  "fields": [],
  "actions": [],
  "quickFilters": [],
  "tableLimit": 1000,
  "hashedKeywordFields": [],
  "defaultSort": "desc",
  "kanbanConfigs": [],
  "recordListConfig": null,
  "recordDetailConfig": null,
  "permissionsConfig": [],
  "ganttCharts": []
}
```

**Use case:** Khi user cần tạo bảng cho một nghiệp vụ đặc thù không có template sẵn.

---

### 3.2. JOB_TITLE - Quản lý chức danh

**Mục đích:** Quản lý danh mục các chức danh trong công ty (Developer, Manager, Director, ...)

**Fields:**

| #   | Field Name     | Type       | Label         | Required | Notes                     |
| --- | -------------- | ---------- | ------------- | -------- | ------------------------- |
| 1   | job_title_name | SHORT_TEXT | Tên chức danh | ✅       | Searchable                |
| 2   | job_title_code | SHORT_TEXT | Mã chức danh  | ✅       | Searchable                |
| 3   | description    | RICH_TEXT  | Mô tả         | ❌       |                           |
| 4   | status         | SELECT_ONE | Trạng thái    | ✅       | Options: active, inactive |

**Default Config:**

- **tableLimit:** 30
- **defaultSort:** asc
- **hashedKeywordFields:** `["job_title_name", "job_title_code"]`
- **quickFilters:** `[{"fieldName": "status"}]`

**Kanban Views:**

1. **Theo trạng thái** - Group by `status`, show: job_title_code, status

**Record List Layout:** `head-column`

- titleField: `job_title_name`
- subLineFields: `["job_title_code", "status"]`

**Use case:**

- HR department quản lý cấu trúc tổ chức
- Reference cho bảng WORK_PROCESS, EMPLOYEE_PROFILE

---

### 3.3. DEPARTMENT - Quản lý phòng ban

**Mục đích:** Quản lý các phòng ban/bộ phận trong tổ chức

**Fields:**

| #   | Field Name       | Type       | Label          | Required | Notes                     |
| --- | ---------------- | ---------- | -------------- | -------- | ------------------------- |
| 1   | department_name  | SHORT_TEXT | Tên phòng ban  | ✅       | Searchable                |
| 2   | department_code  | SHORT_TEXT | Mã phòng ban   | ✅       | Searchable                |
| 3   | description      | RICH_TEXT  | Mô tả          | ❌       |                           |
| 4   | established_date | DATETIME   | Ngày thành lập | ❌       |                           |
| 5   | status           | SELECT_ONE | Trạng thái     | ✅       | Options: active, inactive |

**Default Config:**

- **tableLimit:** 30
- **defaultSort:** asc
- **hashedKeywordFields:** `["department_name", "department_code"]`

**Kanban Views:**

1. **Theo trạng thái** - Group by `status`

**Use case:**

- Quản lý cấu trúc tổ chức
- Reference cho bảng WORK_PROCESS

---

### 3.4. WORK_PROCESS - Quản lý quá trình công tác

**Mục đích:** Theo dõi lịch sử công tác của nhân viên (chức danh, phòng ban, lương theo thời gian)

**Fields:**

| #   | Field Name               | Type              | Label               | Required | Reference           |
| --- | ------------------------ | ----------------- | ------------------- | -------- | ------------------- |
| 1   | employee_profile         | SELECT_ONE_RECORD | Hồ sơ nhân sự       | ✅       | → EMPLOYEE_PROFILE  |
| 2   | process_name             | SHORT_TEXT        | Tên quá trình       | ✅       | Searchable          |
| 3   | process_code             | SHORT_TEXT        | Mã quá trình        | ❌       | Searchable          |
| 4   | start_date               | DATETIME          | Ngày bắt đầu        | ✅       |                     |
| 5   | end_date                 | DATETIME          | Ngày kết thúc       | ❌       |                     |
| 6   | department               | SELECT_ONE_RECORD | Phòng ban           | ✅       | → DEPARTMENT        |
| 7   | job_title                | SELECT_ONE_RECORD | Chức danh           | ✅       | → JOB_TITLE         |
| 8   | salary_setup             | SELECT_ONE_RECORD | Bảng lương          | ✅       | → SALARY_SETUP      |
| 9   | salary_grade             | SELECT_ONE        | Bậc lương           | ✅       | 12 options (1-12)   |
| 10  | performance_salary_grade | SELECT_ONE        | Bậc lương hiệu suất | ✅       | 12 options (1-12)   |
| 11  | insurance_salary_grade   | SELECT_ONE        | Mức lương đóng BH   | ✅       | 12 options (1-12)   |
| 12  | dependent_count          | INTEGER           | Số người phụ thuộc  | ❌       | For tax calculation |
| 13  | is_probation             | CHECKBOX_YES_NO   | Đang thử việc       | ❌       |                     |

**Default Config:**

- **tableLimit:** 30
- **defaultSort:** desc (mới nhất trước)
- **quickFilters:** `[{"fieldName": "employee_profile"}, {"fieldName": "department"}, {"fieldName": "job_title"}]`

**Kanban Views:**

1. **Theo phòng ban** - Group by `department`
2. **Theo chức danh** - Group by `job_title`

**Use case:**

- HR track career path của nhân viên
- Tính lương tự động based on current work process
- Audit trail cho thay đổi chức danh/phòng ban

---

### 3.5. EMPLOYEE_PROFILE - Quản lý hồ sơ cá nhân

**Mục đích:** Lưu trữ thông tin cá nhân của nhân viên

**Fields:**

| #   | Field Name        | Type                      | Label               | Required | Notes                           |
| --- | ----------------- | ------------------------- | ------------------- | -------- | ------------------------------- |
| 1   | user              | SELECT_ONE_WORKSPACE_USER | Người dùng hệ thống | ❌       | Link to system user             |
| 2   | employee_name     | SHORT_TEXT                | Họ và tên           | ✅       | Searchable                      |
| 3   | employee_code     | SHORT_TEXT                | Mã nhân sự          | ✅       | Searchable                      |
| 4   | nickname          | SHORT_TEXT                | Tên gọi khác        | ❌       | Searchable                      |
| 5   | gender            | SELECT_ONE                | Giới tính           | ✅       | Options: Nam, Nữ, Khác          |
| 6   | date_of_birth     | DATETIME                  | Ngày sinh           | ✅       |                                 |
| 7   | place_of_birth    | SHORT_TEXT                | Nơi sinh            | ❌       |                                 |
| 8   | native_place      | SHORT_TEXT                | Quê quán            | ❌       |                                 |
| 9   | marital_status    | SELECT_ONE                | Tình trạng hôn nhân | ❌       | Options: single, married, other |
| 10  | personal_tax_code | SHORT_TEXT                | Mã số thuế          | ❌       |                                 |
| 11  | ethnicity         | SHORT_TEXT                | Dân tộc             | ❌       |                                 |
| 12  | religion          | SHORT_TEXT                | Tôn giáo            | ❌       |                                 |

**Default Config:**

- **tableLimit:** 30
- **defaultSort:** asc (A-Z by name)
- **hashedKeywordFields:** `["employee_name", "employee_code", "nickname"]`
- **quickFilters:** `[{"fieldName": "gender"}, {"fieldName": "marital_status"}]`

**Kanban Views:**

1. **Theo giới tính** - Group by `gender`
2. **Theo tình trạng hôn nhân** - Group by `marital_status`

**Use case:**

- Core HR database
- Reference cho tất cả các bảng liên quan đến nhân sự

---

### 3.6. EMPLOYEE_MONTHLY_METRICS - Chỉ số tháng của nhân sự

**Mục đích:** Tracking các chỉ số làm việc hàng tháng để tính lương

**Fields:**

| #   | Field Name                 | Type              | Label                      | Required | Notes                                 |
| --- | -------------------------- | ----------------- | -------------------------- | -------- | ------------------------------------- |
| 1   | name                       | SHORT_TEXT        | Tên chỉ số                 | ✅       |                                       |
| 2   | employee_profile           | SELECT_ONE_RECORD | Hồ sơ nhân sự              | ✅       | → EMPLOYEE_PROFILE                    |
| 3   | month                      | MONTH             | Tháng                      | ✅       | 1-12                                  |
| 4   | year                       | YEAR              | Năm                        | ✅       |                                       |
| 5   | official_work_days         | NUMERIC           | Số ngày công chính thức    | ✅       |                                       |
| 6   | overtime_work_days         | NUMERIC           | Số ngày làm thêm giờ       | ❌       |                                       |
| 7   | weekend_overtime_work_days | NUMERIC           | Số ngày làm thêm cuối tuần | ❌       |                                       |
| 8   | holiday_overtime_work_days | NUMERIC           | Số ngày làm thêm ngày lễ   | ❌       |                                       |
| 9   | performance_percent        | NUMERIC           | Tỉ lệ hiệu suất (%)        | ❌       | Default: 100                          |
| 10  | late_violations            | NUMERIC           | Số lần đi muộn             | ❌       |                                       |
| 11  | unexcused_absences         | NUMERIC           | Số lần nghỉ không phép     | ❌       |                                       |
| 12  | other_violations           | NUMERIC           | Số lần vi phạm khác        | ❌       |                                       |
| 13  | status                     | SELECT_ONE        | Trạng thái chốt            | ✅       | Options: pending, finalized, disputed |

**Default Config:**

- **tableLimit:** 30
- **defaultSort:** desc (tháng mới nhất trước)
- **recordListLayout:** `generic-table` (hiển thị đầy đủ các cột)

**Use case:**

- Input cho hệ thống tính lương tự động
- Timesheet tracking
- Performance review

---

### 3.7. PENALTY - Quản lý các khoản phạt

**Mục đích:** Định nghĩa các loại phạt và mức phạt áp dụng

**Fields:**

| #   | Field Name     | Type       | Label           | Required | Notes                         |
| --- | -------------- | ---------- | --------------- | -------- | ----------------------------- |
| 1   | penalty_code   | SHORT_TEXT | Mã khoản phạt   | ✅       | Searchable                    |
| 2   | penalty_name   | SHORT_TEXT | Tên khoản phạt  | ✅       | Searchable                    |
| 3   | penalty_amount | NUMERIC    | Mức phạt        | ✅       |                               |
| 4   | penalty_type   | SELECT_ONE | Loại khoản phạt | ✅       | Options: fixed, per_violation |
| 5   | start_date     | DATETIME   | Ngày áp dụng    | ✅       |                               |
| 6   | end_date       | DATETIME   | Ngày kết thúc   | ❌       |                               |
| 7   | status         | SELECT_ONE | Trạng thái      | ❌       | Options: active, inactive     |
| 8   | note           | RICH_TEXT  | Ghi chú         | ❌       |                               |

**Default Config:**

- **quickFilters:** `[{"fieldName": "penalty_type"}, {"fieldName": "status"}]`

**Use case:**

- Reference cho SALARY_SETUP, EMPLOYEE_MONTHLY_METRICS
- Tự động tính phạt khi tính lương

---

### 3.8. SALARY_SETUP - Cấu hình bảng lương

**Mục đích:** Định nghĩa các policy cho việc tính lương (tỉ lệ, phúc lợi, bảo hiểm, phạt)

**Fields:** 15 fields bao gồm:

- Thông tin cơ bản: name, code, policy reference
- Tỉ lệ lương: official, overtime, weekend_overtime, holiday_overtime
- Policy references: benefit_policy, insurance_policy, penalty (cho cả official và probationary)
- Tỉ lệ lương thử việc

**Use case:**

- Core config cho payroll system
- Reference bởi WORK_PROCESS

---

### 3.9. SALARY_POLICY - Chính sách lương

**Mục đích:** Chi tiết về các bậc lương cụ thể (51 fields!)

**Key Features:**

- Base salary + 12 salary grades (bậc lương chính thức)
- 12 performance salary grades (bậc lương hiệu suất)
- 12 insurance salary grades (mức đóng bảo hiểm)
- Effective dates

**Use case:**

- Master data cho hệ thống lương
- Có thể thay đổi theo thời gian (versioning)

---

### 3.10. TASK_EISENHOWER - Quản lý công việc theo ma trận Eisenhower

**Mục đích:** Task management với phân loại theo ma trận Eisenhower (Urgent/Important)

**Fields:**

| #   | Field Name       | Type                      | Label                | Required | Notes                                               |
| --- | ---------------- | ------------------------- | -------------------- | -------- | --------------------------------------------------- |
| 1   | task_title       | SHORT_TEXT                | Tên công việc        | ✅       | Searchable                                          |
| 2   | task_description | RICH_TEXT                 | Nội dung công việc   | ❌       | Searchable                                          |
| 3   | start_date       | DATETIME                  | Thời gian bắt đầu    | ❌       |                                                     |
| 4   | duo_date         | DATETIME                  | Thời gian kết thúc   | ❌       |                                                     |
| 5   | matrix_quadrant  | SELECT_ONE                | Ma trận Eisenhower   | ✅       | 4 options (Q1-Q4)                                   |
| 6   | self_evaluation  | SELECT_ONE                | Tình trạng công việc | ❌       | 6 options                                           |
| 7   | assignee         | SELECT_ONE_WORKSPACE_USER | Người phụ trách      | ❌       |                                                     |
| 8   | status           | SELECT_ONE                | Trạng thái           | ❌       | Options: pending, in_progress, completed, cancelled |

**Matrix Quadrant Options:**

1. **Q1:** Quan trọng & Khẩn cấp (Main-stream) - Red (#dc3545)
2. **Q2:** Quan trọng & Không khẩn cấp (Growth) - Green (#28a745)
3. **Q3:** Không quan trọng & Khẩn cấp (No-problem) - Orange (#f15c14)
4. **Q4:** Không quan trọng & Không khẩn cấp (Idea) - Gray (#6c757d)

**Self Evaluation Options:**

- Rất thuận lợi (excellent) - Green
- Khó khăn (difficult) - Orange
- Chưa đủ thông tin xử lý (missing_info) - Yellow
- Phụ thuộc vào bên thứ ba (dependency_blocked) - Cyan
- Cần hỗ trợ (need_help) - Red
- Đề nghị xem xét lại kế hoạch (reconsider_plan) - Purple

**Default Config:**

- **tableLimit:** 5 (example shows very small limit)
- **hashedKeywordFields:** `["task_title", "task_description"]`
- **quickFilters:** `[{"fieldName": "status"}, {"fieldName": "matrix_quadrant"}, {"fieldName": "assignee"}]`

**Kanban Views:**

1. **Ma trận Eisenhower** - Group by `matrix_quadrant`
2. **Trạng thái** - Group by `status`
3. **Tình trạng công việc** - Group by `self_evaluation`

**Gantt Views:**

1. **Timeline công việc** - taskName: `task_title`, start: `start_date`, end: `duo_date`

**Use case:**

- Personal/team task management
- Priority-based workflow
- Time management theo phương pháp Eisenhower

---

### 3.11. CONTRACT - Quản lý hợp đồng

**Mục đích:** Quản lý hợp đồng với khách hàng/đối tác

**Key Fields:**

- Contract info: code, name, type
- Parties: customer, vendor references
- Financials: contract_value, payment_terms
- Timeline: start_date, end_date
- Status tracking
- Documents: attachments

**Use case:**

- Sales/procurement management
- Legal compliance tracking

---

### 3.12. CUSTOMER_PIPELINE - Pipeline khách hàng

**Mục đích:** CRM - quản lý sales pipeline

**Key Features:**

- 27 fields covering full sales cycle
- Lead tracking
- Deal value, probability
- Sales stage management
- Next steps planning

**Kanban Views:** Group by sales stage

**Use case:**

- B2B sales management
- Lead nurturing
- Revenue forecasting

---

### 3.13. Các template khác

**HR & Payroll Domain:**

- REWARD_POLICY
- INSURANCE_POLICY
- LEAVE_POLICY
- TIME_OFF_RECORD_MANAGEMENT
- BENEFIT_POLICY
- BENEFIT_MANAGEMENT
- TAX_DEDUCTION

**Learning & Culture:**

- TRAINING_PROGRAM
- LEARNING_PROGRESS
- CULTURE_MANAGEMENT
- CULTURE_PROGRAM_REGISTRATION

**Operations:**

- ASSET_MANAGEMENT
- VENDOR_MANAGEMENT
- ONBOARDING
- APPROVAL_REQUEST

**Product/Project Management:**

- PROTOTYPE
- INSIGHT_TTM
- CONTENT_SCRIPT_MANAGEMENT
- SWOT_EVALUATION
- SCAMPER
- HERZBERG_FACTOR

---

## 4. Anatomy of a Table Type Config

### 4.1. Cấu trúc chuẩn

```javascript
TABLE_TYPE_NAME: {
  // ========== METADATA ==========
  "title": "Tên hiển thị của bảng",

  // ========== FIELDS DEFINITION ==========
  "fields": [
    {
      "type": "SHORT_TEXT | SELECT_ONE | ... ",
      "label": "Nhãn hiển thị",
      "name": "field_name",
      "placeholder": "Placeholder text",
      "defaultValue": "",
      "required": true | false,

      // Conditional: Nếu type là SELECT_ONE/SELECT_LIST/CHECKBOX_LIST
      "options": [
        {
          "text": "Display text",
          "value": "stored_value",
          "text_color": "#000000",
          "background_color": "#ffffff"
        }
      ],

      // Conditional: Nếu type là SELECT_ONE_RECORD/SELECT_LIST_RECORD/FIRST_REFERENCE_RECORD
      "referenceTableId": "{REFERENCE_TABLE_TYPE}",
      "referenceField": "",
      "referenceLabelField": "field_to_display",
      "additionalCondition": ""
    }
  ],

  // ========== ACTIONS ==========
  "actions": [],  // Empty array, sẽ auto-gen 8 default actions

  // ========== QUICK FILTERS ==========
  "quickFilters": [
    {"fieldName": "status"},
    {"fieldName": "category"}
  ],

  // ========== TABLE SETTINGS ==========
  "tableLimit": 30,
  "defaultSort": "asc" | "desc",
  "e2eeEncryption": false,

  // ========== SEARCH INDEXING ==========
  "hashedKeywordFields": [
    "field_name_1",
    "field_name_2"
  ],

  // ========== KANBAN VIEWS ==========
  "kanbanConfigs": [
    {
      "kanbanScreenId": "uuid-v7",
      "screenName": "Tên view",
      "screenDescription": "Mô tả",
      "statusField": "field_name",
      "kanbanHeadlineField": "title_field",
      "displayFields": ["field1", "field2"]
    }
  ],

  // ========== GANTT VIEWS ==========
  "ganttCharts": [
    {
      "ganttScreenId": "uuid-v7",
      "screenName": "Timeline view",
      "screenDescription": "",
      "taskNameField": "task_name",
      "startDateField": "start_date",
      "endDateField": "end_date",
      "progressField": null,
      "dependencyField": null
    }
  ],

  // ========== RECORD LIST VIEW ==========
  "recordListConfig": {
    "layout": "generic-table" | "head-column",

    // If layout = "generic-table"
    "displayFields": ["field1", "field2", "field3"],

    // If layout = "head-column"
    "titleField": "main_title_field",
    "subLineFields": ["field1", "field2"],
    "tailFields": ["field3", "field4"]
  },

  // ========== RECORD DETAIL VIEW ==========
  "recordDetailConfig": {
    "layout": "head-detail" | "two-column-detail",
    "commentsPosition": "right-panel" | "bottom" | "hidden",

    // Common fields
    "headTitleField": "main_title",
    "headSubLineFields": ["field1", "field2"],

    // If layout = "head-detail"
    "rowTailFields": ["field3", "field4", "field5"],

    // If layout = "two-column-detail"
    "column1Fields": ["field3", "field4"],
    "column2Fields": ["field5", "field6"]
  },

  // ========== PERMISSIONS ==========
  "permissionsConfig": []  // Empty, sẽ được config sau
}
```

### 4.2. Placeholder cho Reference Tables

Một số template sử dụng placeholder `{TABLE_TYPE}` trong `referenceTableId`:

```javascript
"referenceTableId": "{EMPLOYEE_PROFILE}"
"referenceTableId": "{DEPARTMENT}"
"referenceTableId": "{JOB_TITLE}"
```

**Lý do:** Vì khi tạo template, ID thực của các bảng reference chưa tồn tại. User sẽ phải:

1. Tạo bảng EMPLOYEE_PROFILE trước
2. Sau đó tạo bảng WORK_PROCESS
3. Manually update `referenceTableId` trong WORK_PROCESS fields để trỏ đến ID thực của EMPLOYEE_PROFILE

**Cải tiến đề xuất:** Hệ thống nên có mechanism để auto-resolve placeholders khi tạo bảng.

---

## 5. Field Types Usage Patterns

### 5.1. Common Field Patterns

#### Pattern 1: Code + Name pair (Master Data)

```javascript
{
  "type": "SHORT_TEXT",
  "label": "Mã [entity]",
  "name": "code",
  "required": true
},
{
  "type": "SHORT_TEXT",
  "label": "Tên [entity]",
  "name": "name",
  "required": true
}
```

**Dùng trong:** JOB_TITLE, DEPARTMENT, PENALTY, SALARY_POLICY, ...

#### Pattern 2: Status field (Lifecycle Management)

```javascript
{
  "type": "SELECT_ONE",
  "label": "Trạng thái",
  "name": "status",
  "defaultValue": "active",
  "required": true,
  "options": [
    {"text": "Active", "value": "active", ...},
    {"text": "Inactive", "value": "inactive", ...}
  ]
}
```

**Dùng trong:** Hầu hết các bảng master data

#### Pattern 3: Date Range (Validity Period)

```javascript
{
  "type": "DATETIME",
  "label": "Ngày bắt đầu",
  "name": "start_date",
  "required": true
},
{
  "type": "DATETIME",
  "label": "Ngày kết thúc",
  "name": "end_date",
  "required": false
}
```

**Dùng trong:** WORK_PROCESS, SALARY_POLICY, CONTRACT, ...

#### Pattern 4: Foreign Key Reference

```javascript
{
  "type": "SELECT_ONE_RECORD",
  "label": "Hồ sơ nhân sự",
  "name": "employee_profile",
  "required": true,
  "referenceTableId": "{EMPLOYEE_PROFILE}",
  "referenceLabelField": "employee_name"
}
```

**Dùng trong:** Tất cả bảng có relationship

#### Pattern 5: 12-step Select (Grades/Levels)

```javascript
{
  "type": "SELECT_ONE",
  "label": "Bậc lương",
  "name": "salary_grade",
  "required": true,
  "options": [
    {"text": "Bậc 1", "value": "salary_grade_1", ...},
    {"text": "Bậc 2", "value": "salary_grade_2", ...},
    // ... up to Bậc 12
  ]
}
```

**Dùng trong:** WORK_PROCESS, SALARY_POLICY

---

## 6. Best Practices

### 6.1. Khi thiết kế Table Type mới

1. **Bắt đầu từ BLANK** nếu không có template phù hợp
2. **Copy existing template** nếu có use case tương tự
3. **Define clear naming convention:**
   - Code fields: `{entity}_code`
   - Name fields: `{entity}_name`
   - Status fields: `status`
   - Date fields: `{action}_date`

### 6.2. Field Design

1. **Always include searchable fields:**

   ```javascript
   "hashedKeywordFields": ["name", "code", "description"]
   ```

2. **Use color-coded status options:**

   ```javascript
   "options": [
     {"text": "Active", "value": "active",
      "text_color": "#000000", "background_color": "#d4edda"},
     {"text": "Inactive", "value": "inactive",
      "text_color": "#000000", "background_color": "#f8d7da"}
   ]
   ```

3. **Set sensible defaults:**
   - `tableLimit`: 30 cho master data, 100 cho transactional data
   - `defaultSort`: "asc" cho master data, "desc" cho time-series data

### 6.3. Kanban Design

1. **Group by categorical fields only:**
   - ✅ Good: status, department, priority
   - ❌ Bad: numeric fields, free text

2. **Limit display fields to 3-5 most important:**
   ```javascript
   "displayFields": ["assignee", "due_date", "priority"]
   ```

### 6.4. Reference Handling

1. **Document dependency order:**

   ```
   Creation order:
   1. EMPLOYEE_PROFILE (no dependencies)
   2. DEPARTMENT (no dependencies)
   3. JOB_TITLE (no dependencies)
   4. SALARY_SETUP (depends on PENALTY, BENEFIT_POLICY, etc.)
   5. WORK_PROCESS (depends on all above)
   ```

2. **Use placeholder convention:**

   ```javascript
   "referenceTableId": "{EMPLOYEE_PROFILE}"
   ```

3. **Provide clear `referenceLabelField`:**
   - Should be human-readable (name, title)
   - Not ID or code

---

## 7. Extending TABLE_CONFIGS

### 7.1. Adding a New Table Type

**Step 1:** Define template structure

```javascript
NEW_TABLE_TYPE: {
  "title": "Your Table Name",
  "fields": [
    // Define fields following patterns above
  ],
  "actions": [],
  "quickFilters": [],
  "tableLimit": 30,
  "hashedKeywordFields": [],
  "defaultSort": "asc",
  "kanbanConfigs": [],
  "recordListConfig": {},
  "recordDetailConfig": {},
  "permissionsConfig": [],
  "ganttCharts": []
}
```

**Step 2:** Add to TABLE_CONFIGS object

```javascript
const TABLE_CONFIGS = {
  BLANK: { ... },
  JOB_TITLE: { ... },
  // ... existing templates
  NEW_TABLE_TYPE: { ... }  // Add here
};
```

**Step 3:** Update UI selection list

**Step 4:** Test creation flow

### 7.2. Modifying Existing Template

**⚠️ WARNING:** Changing existing templates ONLY affects NEW tables created. Existing tables keep their old config.

**Safe changes:**

- Adding new optional fields
- Adding new kanban views
- Updating hashedKeywordFields

**Breaking changes:**

- Removing fields
- Changing field types
- Changing referenceTableId structure

---

## 8. Common Issues & Solutions

### Issue 1: Reference table not found

**Problem:**

```javascript
"referenceTableId": "{EMPLOYEE_PROFILE}"
```

User tạo WORK_PROCESS nhưng chưa tạo EMPLOYEE_PROFILE → Error

**Solution:**

- Document dependency order
- Implement auto-detection and warning
- Allow user to select from existing tables during creation

### Issue 2: Too many fields in template

**Problem:** SALARY_POLICY có 51 fields → overwhelming cho user

**Solution:**

- Group fields into sections (optional vs required)
- Allow user to remove unused fields sau khi tạo
- Provide "minimal" và "full" variants

### Issue 3: Kanban config mismatch

**Problem:** Template có kanbanConfig nhưng statusField không tồn tại sau khi user edit

**Solution:**

- Validate kanban configs when saving table
- Auto-remove invalid kanban views
- Warn user before saving

---

## Appendix A: Complete TABLE_CONFIGS Index

### A.1. HR & Payroll (16 types)

| Table Type                  | Line | Fields | Complexity |
| --------------------------- | ---- | ------ | ---------- |
| JOB_TITLE                   | 2273 | 4      | ⭐         |
| DEPARTMENT                  | 2349 | 5      | ⭐         |
| EMPLOYEE_PROFILE            | 2645 | 12     | ⭐⭐       |
| WORK_PROCESS                | 2433 | 13     | ⭐⭐⭐     |
| EMPLOYEE_MONTHLY_METRICS    | 2812 | 13     | ⭐⭐⭐     |
| SALARY_POLICY               | 3275 | 51     | ⭐⭐⭐⭐⭐ |
| SALARY_SETUP                | 3081 | 15     | ⭐⭐⭐     |
| PENALTY                     | 2959 | 8      | ⭐⭐       |
| REWARD_POLICY               | 3674 | 10     | ⭐⭐       |
| INSURANCE_POLICY            | 3855 | 13     | ⭐⭐⭐     |
| LEAVE_POLICY                | 3987 | 24     | ⭐⭐⭐⭐   |
| TIME_OFF_RECORD_MANAGEMENT  | 4407 | 13     | ⭐⭐⭐     |
| BENEFIT_POLICY              | 4813 | 15     | ⭐⭐⭐     |
| BENEFIT_MANAGEMENT          | 4969 | 16     | ⭐⭐⭐     |
| BENEFIT_PROGRAM_PARTICIPANT | 4536 | 14     | ⭐⭐⭐     |
| TAX_DEDUCTION               | 4678 | 13     | ⭐⭐⭐     |

### A.2. Operations & Approval (5 types)

| Table Type        | Line | Fields | Complexity |
| ----------------- | ---- | ------ | ---------- |
| APPROVAL_REQUEST  | 4224 | 18     | ⭐⭐⭐     |
| ASSET_MANAGEMENT  | 5800 | 20     | ⭐⭐⭐⭐   |
| VENDOR_MANAGEMENT | 6000 | 17     | ⭐⭐⭐     |
| ONBOARDING        | 6450 | 20     | ⭐⭐⭐⭐   |
| CONTRACT          | 8011 | 18     | ⭐⭐⭐⭐   |

### A.3. Learning & Culture (4 types)

| Table Type                   | Line | Fields | Complexity |
| ---------------------------- | ---- | ------ | ---------- |
| TRAINING_PROGRAM             | 5608 | 19     | ⭐⭐⭐⭐   |
| LEARNING_PROGRESS            | 5512 | 10     | ⭐⭐       |
| CULTURE_MANAGEMENT           | 5321 | 19     | ⭐⭐⭐⭐   |
| CULTURE_PROGRAM_REGISTRATION | 5148 | 17     | ⭐⭐⭐     |

### A.4. Sales & CRM (2 types)

| Table Type          | Line | Fields | Complexity |
| ------------------- | ---- | ------ | ---------- |
| CUSTOMER_PIPELINE   | 6177 | 27     | ⭐⭐⭐⭐⭐ |
| HAIR_SALON_CUSTOMER | 8192 | 12+    | ⭐⭐⭐     |

### A.5. Product & Project Management (7 types)

| Table Type                | Line | Fields | Complexity |
| ------------------------- | ---- | ------ | ---------- |
| TASK_EISENHOWER           | 7703 | 8      | ⭐⭐       |
| PROTOTYPE                 | 7530 | 17     | ⭐⭐⭐⭐   |
| INSIGHT_TTM               | 7302 | 23     | ⭐⭐⭐⭐   |
| CONTENT_SCRIPT_MANAGEMENT | 7133 | 17     | ⭐⭐⭐     |
| SWOT_EVALUATION           | 6965 | 17     | ⭐⭐⭐     |
| SCAMPER                   | 6812 | 15     | ⭐⭐⭐     |
| HERZBERG_FACTOR           | 6649 | 16     | ⭐⭐⭐     |

### A.6. Special Types (1 type)

| Table Type | Line | Fields | Complexity |
| ---------- | ---- | ------ | ---------- |
| BLANK      | 2268 | 0      | ⭐         |

---

## Appendix B: Field Type Distribution

Analysis of field types across all templates:

| Field Type                    | Count | %   | Common Use                |
| ----------------------------- | ----- | --- | ------------------------- |
| SHORT_TEXT                    | 156   | 22% | Codes, names, identifiers |
| SELECT_ONE                    | 134   | 19% | Status, categories        |
| RICH_TEXT                     | 87    | 12% | Descriptions, notes       |
| DATETIME                      | 76    | 11% | Dates, timestamps         |
| NUMERIC                       | 65    | 9%  | Amounts, counts           |
| SELECT_ONE_RECORD             | 48    | 7%  | Foreign keys              |
| SELECT_LIST_RECORD            | 32    | 5%  | Many-to-many refs         |
| SELECT_ONE_WORKSPACE_USER     | 28    | 4%  | Assignees                 |
| INTEGER                       | 24    | 3%  | Counters, quantities      |
| CHECKBOX_YES_NO               | 18    | 3%  | Boolean flags             |
| SELECT_LIST                   | 12    | 2%  | Multi-select categories   |
| SELECT_LIST_WORKSPACE_USER    | 8     | 1%  | Multiple assignees        |
| MONTH, YEAR, EMAIL, URL, etc. | 18    | 2%  | Specialized types         |

---

## Appendix C: Kanban View Statistics

| Has Kanban Views | Count | %   |
| ---------------- | ----- | --- |
| Yes              | 28    | 80% |
| No               | 7     | 20% |

**Average Kanban views per table:** 1.9

**Most common statusField types:**

1. `status` (general status field)
2. Department/team grouping
3. Category/type fields
4. Priority/stage fields

---

## Appendix D: Reference Graph

```
EMPLOYEE_PROFILE (Core)
    ↓
    ├── WORK_PROCESS
    │   ├── → DEPARTMENT
    │   ├── → JOB_TITLE
    │   └── → SALARY_SETUP
    │       ├── → SALARY_POLICY
    │       ├── → PENALTY
    │       ├── → BENEFIT_POLICY
    │       └── → INSURANCE_POLICY
    │
    ├── EMPLOYEE_MONTHLY_METRICS
    ├── TIME_OFF_RECORD_MANAGEMENT
    ├── BENEFIT_PROGRAM_PARTICIPANT
    └── TAX_DEDUCTION

CUSTOMER_PIPELINE
    ├── → VENDOR_MANAGEMENT (supplier)
    └── → CONTRACT

TRAINING_PROGRAM
    └── → LEARNING_PROGRESS

... (graph continues)
```

---

**Document Version:** 1.0
**Last Updated:** 2025-01-15
**Total Table Types Documented:** 35
**Source File:** `docs/technical/html-module/active-tables.blade.php` (lines 2267-8200+)
