# TÀI LIỆU NGHIỆP VỤ: LUỒNG GANTT CHART

## Document Information

- **Tên dự án**: BEQEEK - Hệ thống Quản lý Công việc
- **Module**: Active Table - Gantt Chart View
- **Phiên bản**: 1.0
- **Ngày tạo**: 03/11/2025
- **Người tạo**: Business Analyst

---

## 1. TỔNG QUAN

### 1.1. Mục đích

Tài liệu này mô tả chi tiết nghiệp vụ của chức năng **Gantt Chart** trong hệ thống Active Table. Gantt Chart cho phép người dùng quản lý và theo dõi tiến độ công việc theo trục thời gian, với khả năng hiển thị mối quan hệ phụ thuộc giữa các nhiệm vụ và theo dõi phần trăm hoàn thành.

### 1.2. Phạm vi

Tài liệu bao gồm:

- Mô tả chi tiết luồng nghiệp vụ Gantt Chart
- Cấu hình và thiết lập Gantt Chart
- Các thao tác người dùng có thể thực hiện
- Hiển thị timeline, dependencies và progress
- Tích hợp với hệ thống Active Table
- Quy tắc và ràng buộc nghiệp vụ

### 1.3. Đối tượng sử dụng

- **Project Managers**: Quản lý timeline và dependencies của dự án
- **Team Leaders**: Theo dõi tiến độ và phân bổ công việc
- **Team Members**: Xem task assignment và deadline
- **Administrators**: Cấu hình Gantt Chart theo nhu cầu dự án

### 1.4. Lợi ích nghiệp vụ

- **Timeline Visualization**: Nhìn thấy toàn cảnh dự án theo trục thời gian
- **Dependency Management**: Quản lý các task phụ thuộc lẫn nhau
- **Progress Tracking**: Theo dõi % hoàn thành của từng task
- **Resource Planning**: Phân bổ nguồn lực dựa trên timeline
- **Bottleneck Detection**: Phát hiện các task bị trễ hoặc blocking

---

## 2. KIẾN TRÚC TỔNG QUAN

### 2.1. Vị trí trong hệ thống

```
Active Table
├── Bảng (Table View)
├── Kanban (Kanban View)
├── Gantt (Gantt Chart) ← Tài liệu này
└── Charts (Data Visualization)
```

### 2.2. Luồng dữ liệu

```
[Cấu hình Gantt] → [Active Table Config] → [Gantt Render Engine] → [Timeline UI]
         ↓                                              ↓
    [Fields Config]                              [User Actions]
         ↓                                              ↓
    [Record Data] ←──────────────────────────────→ [Database]
         ↓
[Dependency Graph] → [Critical Path Calculation]
```

### 2.3. Thư viện sử dụng

Dựa vào industry standards, Gantt Chart thường sử dụng:

- **dhtmlxGantt** hoặc **Frappe Gantt**: Rendering engine
- **D3.js**: Custom visualization nếu cần
- **Moment.js/Day.js**: Date manipulation

---

## 3. CẤU TRÚC DỮ LIỆU GANTT

### 3.1. Đối tượng Gantt Config

Mỗi Active Table có thể có nhiều cấu hình Gantt khác nhau. Mỗi cấu hình được định nghĩa trong mảng `ganttCharts`:

```json
{
  "ganttCharts": [
    {
      "ganttScreenId": "uuid", // ID duy nhất
      "screenName": "string", // Tên màn hình Gantt
      "screenDescription": "string", // Mô tả
      "taskNameField": "string", // Trường hiển thị tên task
      "startDateField": "string", // Trường ngày bắt đầu
      "endDateField": "string", // Trường ngày kết thúc
      "progressField": "string", // Trường % hoàn thành (optional)
      "dependencyField": "string" // Trường dependencies (optional)
    }
  ]
}
```

### 3.2. Ví dụ cấu hình thực tế

Dựa trên hệ thống quản lý công việc:

```json
{
  "ganttCharts": [
    {
      "ganttScreenId": "808912345678901234",
      "screenName": "Timeline Dự án",
      "screenDescription": "Gantt chart hiển thị toàn bộ timeline và dependencies của dự án",
      "taskNameField": "task_title",
      "startDateField": "start_date",
      "endDateField": "duo_date",
      "progressField": "completion_percentage",
      "dependencyField": "dependent_tasks"
    },
    {
      "ganttScreenId": "808912345678901235",
      "screenName": "Kế hoạch Sprint",
      "screenDescription": "Timeline công việc trong sprint hiện tại",
      "taskNameField": "task_title",
      "startDateField": "start_date",
      "endDateField": "duo_date",
      "progressField": "completion_percentage",
      "dependencyField": null
    },
    {
      "ganttScreenId": "808912345678901236",
      "screenName": "Roadmap Sản phẩm",
      "screenDescription": "Lộ trình phát triển sản phẩm dài hạn",
      "taskNameField": "feature_name",
      "startDateField": "planned_start",
      "endDateField": "planned_end",
      "progressField": "development_progress",
      "dependencyField": "blocking_features"
    }
  ]
}
```

### 3.3. Ràng buộc dữ liệu

| Field               | Required | Valid Types        | Validation Rules                 |
| ------------------- | -------- | ------------------ | -------------------------------- |
| `ganttScreenId`     | Yes      | UUID               | Auto-generated, unique           |
| `screenName`        | Yes      | String             | Max 100 chars, unique per table  |
| `screenDescription` | No       | String             | Max 500 chars                    |
| `taskNameField`     | Yes      | Any field type     | Must exist in fields config      |
| `startDateField`    | Yes      | DATE, DATETIME     | Must exist, cannot be null       |
| `endDateField`      | Yes      | DATE, DATETIME     | Must exist, must be >= startDate |
| `progressField`     | No       | INTEGER, NUMERIC   | Range: 0-100                     |
| `dependencyField`   | No       | SELECT_LIST_RECORD | Must reference same table        |

---

## 4. CẤU TRÚC FIELDS (TRƯỜNG DỮ LIỆU)

### 4.1. Trường Task Name

Trường hiển thị tên nhiệm vụ trên thanh Gantt:

```json
{
  "type": "SHORT_TEXT",
  "name": "task_title",
  "label": "Tên công việc",
  "placeholder": "Nhập tên công việc",
  "defaultValue": "",
  "required": true
}
```

**Business Rules**:

- **BR-GN-001**: Nếu `taskNameField` trống, hiển thị "(Chưa đặt tên)"
- **BR-GN-002**: Task name được truncate nếu quá dài (max 50 chars trên bar)
- **BR-GN-003**: Hover vào bar sẽ hiển thị full task name trong tooltip

### 4.2. Trường Start Date / End Date

Các trường xác định khoảng thời gian của task:

```json
{
  "type": "DATETIME",
  "name": "start_date",
  "label": "Thời gian bắt đầu",
  "placeholder": "Chọn thời gian bắt đầu",
  "defaultValue": "",
  "required": false
},
{
  "type": "DATETIME",
  "name": "duo_date",
  "label": "Thời gian kết thúc",
  "placeholder": "Chọn thời gian kết thúc",
  "defaultValue": "",
  "required": false
}
```

**Business Rules**:

- **BR-GN-004**: Nếu task không có `startDate`, không hiển thị trên Gantt
- **BR-GN-005**: Nếu task không có `endDate`, sử dụng `startDate + 1 day` làm default
- **BR-GN-006**: `endDate` phải >= `startDate`, nếu không hiển thị validation error
- **BR-GN-007**: Tasks có `endDate` trong quá khứ được highlight bằng màu đỏ (overdue)

### 4.3. Trường Progress (Optional)

Trường hiển thị phần trăm hoàn thành:

```json
{
  "type": "INTEGER",
  "name": "completion_percentage",
  "label": "Phần trăm hoàn thành",
  "placeholder": "Nhập số từ 0-100",
  "defaultValue": "0",
  "required": false,
  "validation": {
    "min": 0,
    "max": 100
  }
}
```

**Business Rules**:

- **BR-GN-008**: Progress value phải trong khoảng 0-100
- **BR-GN-009**: Nếu không có `progressField`, không hiển thị progress bar
- **BR-GN-010**: Progress bar được render bên trong task bar với màu khác
- **BR-GN-011**: Task có progress = 100% được đánh dấu "completed" với checkmark icon

### 4.4. Trường Dependencies (Optional)

Trường xác định các task phụ thuộc:

```json
{
  "type": "SELECT_LIST_RECORD",
  "name": "dependent_tasks",
  "label": "Các task phụ thuộc",
  "placeholder": "Chọn các task cần hoàn thành trước",
  "defaultValue": [],
  "required": false,
  "referenceTable": "self",
  "referenceLabelField": "task_title"
}
```

**Business Rules**:

- **BR-GN-012**: Dependency field phải là `SELECT_LIST_RECORD` tham chiếu đến chính bảng hiện tại
- **BR-GN-013**: Dependencies được vẽ bằng arrows từ task nguồn đến task đích
- **BR-GN-014**: Circular dependencies được detect và prevent (show error message)
- **BR-GN-015**: Khi update task có dependencies, system gợi ý update cascade các task con

---

## 5. LUỒNG NGHIỆP VỤ CHÍNH

### 5.1. Khởi tạo Gantt Chart

#### Flow Diagram

```
[User truy cập Active Table]
    ↓
[Nhấn tab "Gantt"]
    ↓
[Hệ thống kiểm tra ganttCharts config]
    ↓
├─ Có config → [Hiển thị Gantt Selector]
│                    ↓
│              [User chọn Gantt config]
│                    ↓
│              [Load records có startDate & endDate]
│                    ↓
│              [Calculate timeline range]
│                    ↓
│              [Build dependency graph (nếu có)]
│                    ↓
│              [Render Gantt Chart]
└─ Không có → [Hiển thị empty state]
```

#### Business Rules

- **BR-GN-016**: Nếu Active Table chưa có `ganttCharts`, hiển thị empty state với CTA "Cấu hình Gantt"
- **BR-GN-017**: Nếu có nhiều `ganttCharts`, hiển thị dropdown selector
- **BR-GN-018**: Gantt config được chọn lần trước được lưu vào localStorage
- **BR-GN-019**: Default timeline range: từ earliest startDate đến latest endDate + 2 weeks buffer

### 5.2. Calculate Timeline Range

#### Quy trình tính toán

```javascript
// Pseudo code
function calculateTimelineRange(records, config) {
  // 1. Lọc records có đủ startDate và endDate
  const validRecords = records.filter((r) => r[config.startDateField] && r[config.endDateField]);

  if (validRecords.length === 0) {
    return getDefaultRange(); // Today - 1 month to Today + 2 months
  }

  // 2. Tìm ngày sớm nhất và muộn nhất
  const dates = validRecords.flatMap((r) => [new Date(r[config.startDateField]), new Date(r[config.endDateField])]);

  const minDate = new Date(Math.min(...dates));
  const maxDate = new Date(Math.max(...dates));

  // 3. Thêm buffer
  const rangeStart = addDays(minDate, -7); // 1 week before
  const rangeEnd = addDays(maxDate, 14); // 2 weeks after

  return { start: rangeStart, end: rangeEnd };
}
```

#### Business Rules

- **BR-GN-020**: Timeline range tự động điều chỉnh để fit tất cả tasks
- **BR-GN-021**: Có buffer 1 tuần trước task đầu tiên và 2 tuần sau task cuối
- **BR-GN-022**: User có thể zoom in/out hoặc pan để thay đổi visible range
- **BR-GN-023**: "Today" line được hiển thị nếu current date nằm trong range

### 5.3. Render Gantt Chart

#### Cấu trúc UI

```
┌──────────────────────────────────────────────────────────────┐
│ [Gantt Selector ▼] [View: Day|Week|Month] [Today] [Zoom +-] │
├──────────────┬───────────────────────────────────────────────┤
│ Task Name    │       Timeline (Days/Weeks/Months)           │
│              │  ← Past  │  Today  │  Future →                │
├──────────────┼───────────────────────────────────────────────┤
│ Task A       │    ████████████░░░░ 75%                       │
│ Task B       │         ████████████ 100% ✓                   │
│ Task C       │              ██████ 30%                        │
│ └─ Task C.1  │                ████ 50%        ← Dependency   │
│ Task D       │                     ████████ 0%                │
└──────────────┴───────────────────────────────────────────────┘
      │                      │
   Task List            Gantt Bars & Timeline
```

#### Rendering Logic

```javascript
// Pseudo code
function renderGanttChart(records, config, timelineRange) {
  // 1. Group và sort records
  const sortedRecords = sortByStartDate(records);

  // 2. Build dependency tree
  const depTree = buildDependencyTree(records, config.dependencyField);

  // 3. Calculate row positions
  const rows = sortedRecords.map((record, index) => ({
    id: record.id,
    yPosition: index * ROW_HEIGHT,
    indent: calculateIndent(record, depTree),
    taskName: record[config.taskNameField],
    startDate: record[config.startDateField],
    endDate: record[config.endDateField],
    progress: record[config.progressField] || 0,
    dependencies: record[config.dependencyField] || [],
  }));

  // 4. Render task list (left panel)
  renderTaskList(rows);

  // 5. Render timeline header
  renderTimelineHeader(timelineRange, viewMode);

  // 6. Render task bars
  rows.forEach((row) => {
    renderTaskBar(row, timelineRange);
    renderProgressBar(row);
  });

  // 7. Render dependency arrows
  rows.forEach((row) => {
    row.dependencies.forEach((depId) => {
      renderDependencyArrow(row.id, depId);
    });
  });

  // 8. Render today line
  if (isTodayInRange(timelineRange)) {
    renderTodayLine();
  }
}
```

#### Business Rules

- **BR-GN-024**: Tasks được sắp xếp theo `startDate` (ascending)
- **BR-GN-025**: Tasks có dependencies được indent để show parent-child relationship
- **BR-GN-026**: Task bars có màu khác nhau dựa trên status:
  - **Not started**: Xám (#6c757d)
  - **In progress**: Xanh dương (#007bff)
  - **Completed**: Xanh lá (#28a745)
  - **Overdue**: Đỏ (#dc3545)
- **BR-GN-027**: Task bar chiều rộng tỷ lệ với duration
- **BR-GN-028**: Progress bar hiển thị bên trong task bar với opacity 0.6

---

## 6. CÁC THAO TÁC NGƯỜI DÙNG

### 6.1. Thay đổi View Mode

#### View Modes

| Mode    | Time Unit | Column Width | Best For           |
| ------- | --------- | ------------ | ------------------ |
| Day     | 1 day     | 40px         | Tasks < 1 month    |
| Week    | 1 week    | 60px         | Tasks 1-6 months   |
| Month   | 1 month   | 80px         | Tasks 6+ months    |
| Quarter | 3 months  | 100px        | High-level roadmap |

#### Business Rules

- **BR-GN-029**: Default view mode được chọn tự động dựa trên timeline range:
  - Range < 2 months → Day view
  - Range 2-12 months → Week view
  - Range > 12 months → Month view
- **BR-GN-030**: User có thể manually switch view mode bất kỳ lúc nào
- **BR-GN-031**: View mode được lưu vào localStorage per Gantt config

### 6.2. Zoom và Pan

#### Use Case: Zoom Timeline

**Main Flow**:

1. User click nút "+" để zoom in hoặc "-" để zoom out
2. Hệ thống adjust column width và time unit
3. Timeline re-render với scale mới
4. Visible range được điều chỉnh để giữ nguyên center point

**Business Rules**:

- **BR-GN-032**: Zoom levels: 50%, 75%, 100%, 125%, 150%, 200%
- **BR-GN-033**: Khi zoom in quá mức, auto switch sang view mode chi tiết hơn
- **BR-GN-034**: Keyboard shortcuts: Ctrl/Cmd + "+" (zoom in), Ctrl/Cmd + "-" (zoom out)

#### Use Case: Pan Timeline

**Main Flow**:

1. User drag timeline bằng mouse hoặc dùng scrollbar
2. Visible range shift left/right
3. Tasks ngoài visible range không được render (performance optimization)

**Business Rules**:

- **BR-GN-035**: Horizontal scroll: mouse wheel hoặc drag
- **BR-GN-036**: Vertical scroll: chuẩn scrollbar cho danh sách tasks
- **BR-GN-037**: Pan bằng drag: giữ Shift + drag hoặc middle mouse button

### 6.3. Navigate to Today

#### Use Case

**Actor**: End User  
**Main Flow**:

1. User click nút "Today"
2. Hệ thống scroll timeline để current date ở giữa màn hình
3. Highlight "today" line trong 2 giây

**Business Rules**:

- **BR-GN-038**: Nếu today ngoài timeline range, auto extend range và scroll
- **BR-GN-039**: "Today" line là vertical dashed line màu đỏ

### 6.4. Create/Edit/Delete Tasks

#### 6.4.1. Create Task từ Gantt

**Main Flow**:

1. User click nút "+ Bản ghi mới"
2. Popup form mở với các fields, `startDateField` và `endDateField` được highlight
3. User nhập thông tin và chọn dates
4. User nhấn "Lưu"
5. Task bar mới xuất hiện trên Gantt với animation

**Business Rules**:

- **BR-GN-040**: Có thể tạo task bằng cách click vào timeline trống (nếu feature enabled)
- **BR-GN-041**: Khi click vào date trên timeline, `startDate` được pre-fill = clicked date
- **BR-GN-042**: Default duration = 1 day (endDate = startDate + 1)

#### 6.4.2. Edit Task qua Drag & Drop

**Main Flow**:

1. User drag task bar sang trái/phải để thay đổi start date
2. Hoặc drag edge của bar để thay đổi duration
3. Khi drop, hệ thống hiển thị confirmation popup với dates mới
4. User confirm → Database được update

**Business Rules**:

- **BR-GN-043**: Drag bar = move cả start & end date, giữ nguyên duration
- **BR-GN-044**: Drag left edge = thay đổi start date, giữ nguyên end date
- **BR-GN-045**: Drag right edge = thay đổi end date, giữ nguyên start date
- **BR-GN-046**: Snap to grid dựa trên view mode (day/week/month)
- **BR-GN-047**: Nếu task có dependencies, warning về possible conflicts
- **BR-GN-048**: Nếu user không có quyền edit, drag bị disabled

#### 6.4.3. Edit Task qua Form

**Main Flow**:

1. User double-click vào task bar hoặc task name
2. Popup edit form mở
3. User sửa thông tin
4. User nhấn "Lưu"
5. Task bar được update với animation

**Business Rules**:

- **BR-GN-049**: Double-click = open edit form (nếu có quyền)
- **BR-GN-050**: Single-click = select task và highlight dependencies
- **BR-GN-051**: Có thể edit cả progress % từ form

#### 6.4.4. Update Progress

**Main Flow**:

1. User click vào task bar
2. Progress slider xuất hiện (hoặc trong quick edit popup)
3. User kéo slider từ 0-100%
4. Progress bar được update realtime
5. Khi release, giá trị được save

**Business Rules**:

- **BR-GN-052**: Progress chỉ có thể update nếu có `progressField` configured
- **BR-GN-053**: Progress = 100% → task status tự động chuyển sang "completed" (nếu có status field)
- **BR-GN-054**: Có thể nhập số trực tiếp thay vì dùng slider

#### 6.4.5. Delete Task

**Main Flow**:

1. User right-click vào task hoặc click menu (⋮)
2. Chọn "Xóa"
3. Confirmation dialog: "Task này có dependencies, bạn có chắc muốn xóa?"
4. User confirm
5. Task bar biến mất với animation
6. Dependencies arrows bị remove

**Business Rules**:

- **BR-GN-055**: Nếu task có child dependencies, show warning
- **BR-GN-056**: Có option để cascade delete hoặc chỉ xóa parent
- **BR-GN-057**: Không thể delete nếu không có quyền

### 6.5. Manage Dependencies

#### 6.5.1. Add Dependency

**Main Flow** (nếu feature enabled):

1. User click vào task nguồn
2. Nhấn nút "Add Dependency" hoặc drag từ task handle
3. Click vào task đích
4. Arrow được vẽ từ nguồn → đích
5. `dependencyField` được update

**Business Rules**:

- **BR-GN-058**: Không thể tạo circular dependency
- **BR-GN-059**: Dependencies types:
  - **Finish-to-Start (FS)**: Task B bắt đầu khi Task A kết thúc (default)
  - **Start-to-Start (SS)**: Task B bắt đầu khi Task A bắt đầu
  - **Finish-to-Finish (FF)**: Task B kết thúc khi Task A kết thúc
- **BR-GN-060**: Arrow color:
  - **Normal**: Xám (#6c757d)
  - **Critical path**: Đỏ (#dc3545)
  - **Violated**: Đỏ đậm với warning icon

#### 6.5.2. Remove Dependency

**Main Flow**:

1. User click vào dependency arrow
2. Arrow được highlight
3. Press Delete key hoặc click trash icon
4. Confirmation: "Xóa mối quan hệ phụ thuộc?"
5. Arrow biến mất

**Business Rules**:

- **BR-GN-061**: Chỉ có thể xóa dependency nếu có quyền edit task

#### 6.5.3. Highlight Dependencies

**Main Flow**:

1. User click vào một task
2. Task được highlight với border màu xanh
3. Tất cả predecessor tasks highlight màu vàng nhạt
4. Tất cả successor tasks highlight màu xanh nhạt
5. Dependency arrows liên quan được làm đậm

**Business Rules**:

- **BR-GN-062**: Click vào whitespace để deselect
- **BR-GN-063**: Hover vào arrow hiển thị tooltip: "Task A → Task B (Finish-to-Start)"

### 6.6. Filter và Search

#### 6.6.1. Timeline Filter

**Main Flow**:

1. User click vào date range picker
2. Chọn start date và end date
3. Gantt chỉ hiển thị tasks có overlap với date range đã chọn
4. Timeline range được adjust

**Business Rules**:

- **BR-GN-064**: Date range filter AND với các filters khác
- **BR-GN-065**: Có preset filters: "This Week", "This Month", "This Quarter", "This Year"

#### 6.6.2. Quick Filters

Similar to Kanban, có thể filter theo:

- Status
- Assignee
- Priority
- Custom fields

**Business Rules**:

- **BR-GN-066**: Filters được apply instantly
- **BR-GN-067**: Filtered tasks bị ẩn khỏi Gantt chart
- **BR-GN-068**: Show count: "Hiển thị 15/47 tasks"

#### 6.6.3. Search

**Main Flow**:

1. User gõ keyword vào search box
2. Matching tasks được highlight
3. Non-matching tasks bị dim (opacity 0.3)
4. Click vào search result → scroll đến task đó

**Business Rules**:

- **BR-GN-069**: Search trong task name và các keyword fields
- **BR-GN-070**: Highlight matching text với màu vàng

### 6.7. Export và Print

#### 6.7.1. Export to Image

**Main Flow**:

1. User click nút "Export"
2. Chọn format: PNG, JPG, PDF
3. Chọn visible range hoặc entire chart
4. Hệ thống generate image
5. Download file

**Business Rules**:

- **BR-GN-071**: Export bao gồm cả task list và timeline
- **BR-GN-072**: Watermark có thể được thêm vào (optional)
- **BR-GN-073**: High resolution export cho print quality

#### 6.7.2. Export to Excel/CSV

**Main Flow**:

1. User click "Export" → "Excel"
2. Hệ thống export data dưới dạng table:
   - Columns: Task Name, Start Date, End Date, Progress, Assignee, Dependencies
3. Download file .xlsx hoặc .csv

**Business Rules**:

- **BR-GN-074**: Export chỉ data, không export visual chart
- **BR-GN-075**: Include filters info trong sheet đầu tiên

#### 6.7.3. Print

**Main Flow**:

1. User click "Print"
2. Browser print dialog mở
3. Gantt chart được format cho print:
   - Break long timelines thành multiple pages
   - Header/footer với page numbers
4. User print hoặc save as PDF

**Business Rules**:

- **BR-GN-076**: Print layout: landscape orientation
- **BR-GN-077**: Page size: A4 hoặc Letter
- **BR-GN-078**: Option để chỉ print visible range hoặc entire chart

---

## 7. ADVANCED FEATURES

### 7.1. Critical Path Method (CPM)

#### Định nghĩa

Critical Path là chuỗi tasks có total duration dài nhất từ start đến end của project. Bất kỳ delay nào trên critical path sẽ làm delay toàn bộ project.

#### Calculation Algorithm

```javascript
// Pseudo code
function calculateCriticalPath(tasks, dependencies) {
  // 1. Build directed acyclic graph (DAG)
  const graph = buildDAG(tasks, dependencies);

  // 2. Forward pass - Calculate earliest start/finish
  tasks.forEach((task) => {
    task.ES = max(predecessors.map((p) => p.EF)) || 0;
    task.EF = task.ES + task.duration;
  });

  // 3. Backward pass - Calculate latest start/finish
  const projectEnd = max(tasks.map((t) => t.EF));
  tasks.reverse().forEach((task) => {
    task.LF = min(successors.map((s) => s.LS)) || projectEnd;
    task.LS = task.LF - task.duration;
  });

  // 4. Calculate slack/float
  tasks.forEach((task) => {
    task.slack = task.LS - task.ES; // or task.LF - task.EF
  });

  // 5. Tasks with slack = 0 are on critical path
  const criticalPath = tasks.filter((t) => t.slack === 0);

  return criticalPath;
}
```

#### Business Rules

- **BR-GN-079**: Critical path tasks được highlight với màu đỏ (#dc3545)
- **BR-GN-080**: Dependencies trên critical path được vẽ bằng red arrows
- **BR-GN-081**: Toggle để show/hide critical path
- **BR-GN-082**: Tooltip hiển thị slack time cho mỗi task
- **BR-GN-083**: Warning nếu có tasks trên critical path bị overdue

### 7.2. Milestones

#### Định nghĩa

Milestones là các điểm mốc quan trọng trong project, thường là tasks có duration = 0 (start date = end date).

#### Visual Representation

- Icon: Diamond shape (♦) thay vì rectangular bar
- Size: Lớn hơn normal tasks để dễ nhận diện
- Color: Màu vàng hoặc highlight color

#### Business Rules

- **BR-GN-084**: Task có `startDate = endDate` được tự động detect là milestone
- **BR-GN-085**: Hoặc có thể có field riêng `is_milestone` (boolean)
- **BR-GN-086**: Milestones luôn được pin ở top của group (nếu có grouping)
- **BR-GN-087**: Milestones có label hiển thị ở bên phải timeline

### 7.3. Baselines (So sánh kế hoạch vs thực tế)

#### Định nghĩa

Baseline là snapshot của plan ban đầu. Gantt hiển thị cả planned timeline (baseline) và actual timeline để so sánh.

#### Visual Representation

```
Original Plan:  ║░░░░░░░░░░░░░░░░║  (light gray, thin bar below)
Actual:         ║████████████░░░░║  (colored bar, regular)
                                     ↑ Deviation
```

#### Business Rules

- **BR-GN-088**: Baseline được save khi user click "Set Baseline"
- **BR-GN-089**: Fields cần lưu: `baseline_start_date`, `baseline_end_date`, `baseline_duration`
- **BR-GN-090**: Toggle để show/hide baseline
- **BR-GN-091**: Variance được calculate và hiển thị:
  - **On time**: Xanh lá
  - **Ahead of schedule**: Xanh dương
  - **Behind schedule**: Đỏ

### 7.4. Resource Allocation

#### Định nghĩa

Nếu có trường `assignee`, Gantt có thể hiển thị resource allocation - ai đang làm việc gì, vào thời gian nào.

#### View Modes

1. **Grouped by Resource**: Tasks được group theo người được assign
2. **Resource Histogram**: Bar chart hiển thị % allocation của mỗi người theo thời gian
3. **Resource Leveling**: Tự động adjust timeline để tránh over-allocation

#### Business Rules

- **BR-GN-092**: Có thể switch view từ "Grouped by Time" sang "Grouped by Resource"
- **BR-GN-093**: Warning nếu một người được assign > 100% capacity trong cùng timeframe
- **BR-GN-094**: Color code theo người để dễ phân biệt

### 7.5. Collapsible Task Groups

#### Use Case

Với projects lớn có nhiều tasks, cần khả năng collapse/expand groups.

#### Implementation

- Tasks có thể được group theo:
  - Parent-child relationships (từ `dependencyField`)
  - Custom grouping field (ví dụ: `phase`, `epic`)
  - Assignee

#### Business Rules

- **BR-GN-095**: Click vào expand/collapse icon (▶/▼) để toggle group
- **BR-GN-096**: Collapsed group hiển thị:
  - Summary bar (span từ earliest start đến latest end)
  - Aggregated progress
  - Count: "(5 tasks)"
- **BR-GN-097**: State được lưu vào localStorage

---

## 8. TÍCH HỢP HỆ THỐNG

### 8.1. API Endpoints

#### 8.1.1. Get Gantt Config

```
GET /api/workspace/{workspaceId}/workflow/active_tables/{tableId}/config
Response: {
  "ganttCharts": [...]
}
```

#### 8.1.2. Get Records for Gantt

```
GET /api/workspace/{workspaceId}/workflow/active_tables/{tableId}/records
Query Parameters:
- ganttConfigId: uuid (optional)
- startDate: ISO date (filter)
- endDate: ISO date (filter)
- filters: JSON string
```

**Response**:

```json
{
  "data": [
    {
      "id": "record_001",
      "fields": {
        "task_title": "Design UI mockups",
        "start_date": "2025-11-05T09:00:00Z",
        "duo_date": "2025-11-12T18:00:00Z",
        "completion_percentage": 60,
        "assignee": "user_123",
        "dependent_tasks": ["record_002", "record_003"]
      },
      "created_at": "2025-11-01T10:00:00Z",
      "created_by": "user_456"
    }
  ]
}
```

#### 8.1.3. Update Task Dates (Drag & Drop)

```
PATCH /api/workspace/{workspaceId}/workflow/active_tables/{tableId}/records/{recordId}
Body: {
  "fields": {
    "start_date": "2025-11-06T09:00:00Z",
    "duo_date": "2025-11-13T18:00:00Z"
  }
}
```

#### 8.1.4. Bulk Update (Move Dependencies)

```
POST /api/workspace/{workspaceId}/workflow/active_tables/{tableId}/records/bulk-update
Body: {
  "updates": [
    {
      "recordId": "record_001",
      "fields": { "start_date": "...", "duo_date": "..." }
    },
    {
      "recordId": "record_002",
      "fields": { "start_date": "...", "duo_date": "..." }
    }
  ]
}
```

### 8.2. WebSocket Real-time Updates

```javascript
// Socket events for Gantt
socket.on('gantt_task_updated', (data) => {
  const { recordId, fields } = data;

  // Update task bar position/length
  GanttView.updateTask(recordId, {
    startDate: fields.start_date,
    endDate: fields.duo_date,
    progress: fields.completion_percentage,
  });

  // Re-calculate dependencies if needed
  if (fields.dependent_tasks) {
    GanttView.redrawDependencies(recordId);
  }
});

socket.on('gantt_task_created', (data) => {
  GanttView.addTask(data.record);
});

socket.on('gantt_task_deleted', (data) => {
  GanttView.removeTask(data.recordId);
  GanttView.removeDependencies(data.recordId);
});
```

**Business Rules**:

- **BR-GN-098**: Real-time updates chỉ apply nếu affected tasks visible trong current view
- **BR-GN-099**: Nếu task ngoài visible range, chỉ update data cache, không re-render
- **BR-GN-100**: Show toast notification: "Task 'ABC' đã được cập nhật bởi User X"

### 8.3. Integration với Calendar Systems

#### iCal/ICS Export

**Main Flow**:

1. User click "Export" → "Calendar (.ics)"
2. Hệ thống generate ICS file với:
   - Events = Tasks
   - Start/End times
   - Location = Project name
   - Description = Task description
3. User import vào Google Calendar/Outlook

#### Google Calendar Sync (Two-way)

**Business Rules**:

- **BR-GN-101**: Tasks được sync sang Google Calendar như events
- **BR-GN-102**: Khi update event trên Calendar, task trong Gantt cũng được update
- **BR-GN-103**: Có thể chọn which calendar to sync với

---

## 9. PERMISSIONS & SECURITY

### 9.1. View Permissions

| Permission Level | Can View Gantt | Can See All Tasks          | Can Edit Timeline |
| ---------------- | -------------- | -------------------------- | ----------------- |
| None             | ❌             | ❌                         | ❌                |
| View Only        | ✅             | Based on record permission | ❌                |
| Edit             | ✅             | Based on record permission | ✅                |
| Admin            | ✅             | ✅ All tasks               | ✅                |

### 9.2. Action Permissions

**Business Rules**:

- **BR-GN-104**: Drag & drop disabled nếu user không có `update` permission
- **BR-GN-105**: "Bản ghi mới" button hidden nếu không có `create` permission
- **BR-GN-106**: Delete action hidden nếu không có `delete` permission
- **BR-GN-107**: Dependency management requires `update` permission on both tasks
- **BR-GN-108**: Export functions available cho tất cả users có `access` permission

### 9.3. Data Filtering by Permission

```javascript
// Backend logic
function filterTasksByPermission(tasks, user, permission) {
  return tasks.filter((task) => {
    switch (permission) {
      case 'all':
        return true;
      case 'self_created':
        return task.created_by === user.id;
      case 'assigned_user':
        return task.fields.assignee === user.id;
      case 'team_member':
        return task.created_by_team === user.team_id;
      default:
        return false;
    }
  });
}
```

**Business Rules**:

- **BR-GN-109**: Tasks mà user không có quyền view sẽ không xuất hiện trên Gantt
- **BR-GN-110**: Dependencies đến hidden tasks được hiển thị là dashed line với label "Hidden Task"

---

## 10. UI/UX SPECIFICATIONS

### 10.1. Layout Structure

```
┌─────────────────────────────────────────────────────────────────┐
│ Header: [Back] BEQEEK - Công việc [Gantt Selector ▼]           │
├─────────────────────────────────────────────────────────────────┤
│ Toolbar: [Search...] [+ Bản ghi mới] [Filter] [Today]          │
│          [View: Week ▼] [Zoom: 100% ± ] [Export ▼]             │
├──────────────┬──────────────────────────────────────────────────┤
│              │ Timeline Header                                  │
│              │ [Nov 2025 ──────────────────────────────────>]   │
│              │  1│ 8│15│22│29│ 6│13│20│27│                      │
├──────────────┼──────────────────────────────────────────────────┤
│ Tasks        │                                                  │
│ (Scrollable) │ Gantt Bars & Dependencies (Scrollable H & V)    │
│              │                                                  │
│ [ Task A  ]  │    ████████████░░░░ 75%                          │
│ [ Task B  ]  │         ████████████ 100% ✓                      │
│ [▼Group   ]  │              ████████░░░░░░ 40%                  │
│   [ Child ]  │                ████░░ 25%                         │
│ [ Task D  ]  │                     ████████ 0%                   │
│              │                                                  │
└──────────────┴──────────────────────────────────────────────────┘
  │← 250px →│  │←        Flexible Width                      →│
   Fixed        Scrollable
```

### 10.2. Task Bar Design

#### Normal Task

```
┌──────────────────────────────┐
│ Task Name ███████████░░░░ 60%│ ← Progress percentage shown
└──────────────────────────────┘
  │←    Duration     →│
```

#### Milestone

```
         ♦
    Task Name
```

#### Collapsed Group

```
┌────────────────────────────────────┐
│ ▶ Group Name (5 tasks) ═════ 45%  │ ← Summary bar (different style)
└────────────────────────────────────┘
```

#### Task with Dependencies

```
Task A ████████████ ──────→ Task B ████████
       (predecessor)         (successor)
```

### 10.3. Color Scheme

| Element             | Color                   | Usage                    |
| ------------------- | ----------------------- | ------------------------ |
| Not Started         | `#6c757d` (Gray)        | Tasks chưa bắt đầu       |
| In Progress         | `#007bff` (Blue)        | Tasks đang thực hiện     |
| Completed           | `#28a745` (Green)       | Tasks đã hoàn thành      |
| Overdue             | `#dc3545` (Red)         | Tasks quá hạn            |
| Critical Path       | `#dc3545` (Red)         | Tasks trên critical path |
| Today Line          | `#dc3545` (Red, dashed) | Vertical line hiện tại   |
| Weekend             | `#f8f9fa` (Light Gray)  | Background cho Sat/Sun   |
| Progress Bar        | Darker shade            | Inside task bar          |
| Dependency Arrow    | `#6c757d` (Gray)        | Normal dependencies      |
| Critical Dependency | `#dc3545` (Red)         | Critical path arrows     |

### 10.4. Responsive Design

#### Desktop (>1200px)

- Task list width: 250px (fixed)
- Timeline: Flexible width
- Show full task names
- Show all toolbar buttons

#### Tablet (768px - 1200px)

- Task list width: 200px
- Timeline: Scrollable horizontal
- Truncate long task names
- Some toolbar buttons in dropdown menu

#### Mobile (<768px)

- **Switch to List View**: Gantt chart không practical trên mobile
- Hiển thị tasks dưới dạng list với dates
- Option để view simplified timeline
- Full editing vẫn khả dụng qua forms

**Business Rules**:

- **BR-GN-111**: Mobile devices auto redirect sang Table View với sort by start date
- **BR-GN-112**: Có notification: "Gantt Chart works best on larger screens"
- **BR-GN-113**: User có thể force view Gantt nhưng với limited functionality

### 10.5. Animations

| Action           | Animation                   | Duration |
| ---------------- | --------------------------- | -------- |
| Task appear      | Fade in + slide down        | 300ms    |
| Task move (drag) | Follow cursor smoothly      | -        |
| Task resize      | Smooth width transition     | 200ms    |
| Dependency draw  | Animated stroke             | 400ms    |
| Zoom in/out      | Scale transform             | 250ms    |
| Pan              | Translate with inertia      | -        |
| Collapse/expand  | Height + opacity transition | 300ms    |
| Progress update  | Width transition            | 200ms    |

### 10.6. Accessibility

**Business Rules**:

- **BR-GN-114**: Keyboard navigation:
  - Tab: Navigate giữa tasks
  - Arrow keys: Move selected task
  - Enter: Edit selected task
  - Delete: Delete selected task
  - Ctrl+C/V: Copy/paste tasks
- **BR-GN-115**: Screen reader support:
  - ARIA labels cho tất cả interactive elements
  - Announce khi tasks được updated
  - Table view alternative cho screen readers
- **BR-GN-116**: High contrast mode support
- **BR-GN-117**: Focus indicators rõ ràng
- **BR-GN-118**: Minimum touch target size: 44x44px

---

## 11. PERFORMANCE OPTIMIZATION

### 11.1. Large Dataset Handling

**Scenarios**:

- **Small project**: < 50 tasks → Render all
- **Medium project**: 50-500 tasks → Virtual scrolling
- **Large project**: > 500 tasks → Pagination + lazy loading

#### Virtual Scrolling

```javascript
// Pseudo code
function renderVisibleTasks() {
  const scrollTop = ganttContainer.scrollTop;
  const containerHeight = ganttContainer.clientHeight;
  const rowHeight = 40;

  const startIndex = Math.floor(scrollTop / rowHeight);
  const endIndex = Math.ceil((scrollTop + containerHeight) / rowHeight);

  const visibleTasks = allTasks.slice(startIndex, endIndex + BUFFER);

  renderTasks(visibleTasks);
}
```

**Business Rules**:

- **BR-GN-119**: Chỉ render tasks visible trong viewport + buffer 20 rows
- **BR-GN-120**: Scroll events throttled (16ms) để maintain 60fps
- **BR-GN-121**: Dependencies chỉ được vẽ cho visible tasks

### 11.2. Caching Strategy

| Data Type          | Cache Location | Expiry         | Refresh Trigger   |
| ------------------ | -------------- | -------------- | ----------------- |
| Gantt Config       | LocalStorage   | 1 hour         | Config update     |
| Tasks Data         | Memory         | Until unmount  | Real-time updates |
| Rendered SVG       | Canvas cache   | Until zoom/pan | View change       |
| Dependencies Graph | Memory         | 5 minutes      | Task update       |

### 11.3. Rendering Optimization

**Business Rules**:

- **BR-GN-122**: Use canvas rendering for timeline với > 200 tasks (thay vì SVG/HTML)
- **BR-GN-123**: Debounce drag events (50ms) để tránh re-render quá nhiều
- **BR-GN-124**: Lazy load dependency arrows (chỉ render khi zoom in)
- **BR-GN-125**: Progressive rendering: Render critical tasks trước, non-critical sau

### 11.4. Network Optimization

**Business Rules**:

- **BR-GN-126**: Batch API calls: Thay vì update từng task, batch multiple updates
- **BR-GN-127**: Use HTTP/2 multiplexing cho parallel requests
- **BR-GN-128**: Compress response với gzip/brotli
- **BR-GN-129**: Implement request coalescing (merge duplicate requests trong 100ms window)

---

## 12. ERROR HANDLING

### 12.1. Validation Errors

| Error Code | Condition              | Message                                  | User Action       |
| ---------- | ---------------------- | ---------------------------------------- | ----------------- |
| `GN_001`   | End date < Start date  | "Ngày kết thúc phải sau ngày bắt đầu"    | Fix dates         |
| `GN_002`   | Circular dependency    | "Phát hiện vòng lặp phụ thuộc"           | Remove dependency |
| `GN_003`   | Invalid date format    | "Định dạng ngày không hợp lệ"            | Re-enter date     |
| `GN_004`   | Task duration = 0      | "Duration phải > 0 (hoặc tạo milestone)" | Fix duration      |
| `GN_005`   | Missing required field | "Trường [field] là bắt buộc"             | Fill field        |
| `GN_006`   | Progress > 100%        | "Progress phải từ 0-100%"                | Correct value     |
| `GN_007`   | Invalid dependency     | "Task không tồn tại"                     | Select valid task |

### 12.2. System Errors

| Error Code | Cause             | Message                       | Fallback           |
| ---------- | ----------------- | ----------------------------- | ------------------ |
| `GN_S01`   | No gantt config   | "Chưa cấu hình Gantt Chart"   | Show setup guide   |
| `GN_S02`   | API timeout       | "Không thể tải dữ liệu"       | Retry button       |
| `GN_S03`   | Network error     | "Mất kết nối mạng"            | Offline mode       |
| `GN_S04`   | Render error      | "Không thể hiển thị Gantt"    | Show table view    |
| `GN_S05`   | Permission denied | "Không có quyền truy cập"     | Contact admin      |
| `GN_S06`   | Invalid config    | "Cấu hình Gantt không hợp lệ" | Use default config |

### 12.3. Dependency Validation

#### Circular Dependency Detection

```javascript
// Pseudo code
function hasCircularDependency(taskId, newDependency, graph) {
  // DFS to check if adding newDependency creates cycle
  const visited = new Set();
  const stack = [newDependency];

  while (stack.length > 0) {
    const current = stack.pop();

    if (current === taskId) {
      return true; // Cycle detected
    }

    if (visited.has(current)) {
      continue;
    }

    visited.add(current);
    const dependencies = graph[current] || [];
    stack.push(...dependencies);
  }

  return false;
}
```

**Business Rules**:

- **BR-GN-130**: Kiểm tra circular dependency trước khi save
- **BR-GN-131**: Hiển thị danh sách tasks trong cycle để user fix
- **BR-GN-132**: Suggest breaking the cycle tại task nào

### 12.4. Error Boundaries

**Business Rules**:

- **BR-GN-133**: Nếu Gantt render fail, fallback sang Table View
- **BR-GN-134**: Show error details cho Admins, generic message cho Users
- **BR-GN-135**: Log errors sang monitoring system (Sentry, etc.)
- **BR-GN-136**: Có "Report Bug" button để user gửi feedback

---

## 13. TESTING SCENARIOS

### 13.1. Functional Testing

| Test Case | Steps                              | Expected Result                      |
| --------- | ---------------------------------- | ------------------------------------ |
| TC-GN-F01 | Navigate to Gantt tab              | Gantt renders successfully           |
| TC-GN-F02 | Switch view modes (Day/Week/Month) | Timeline adjusts correctly           |
| TC-GN-F03 | Zoom in/out                        | Scale changes, tasks remain accurate |
| TC-GN-F04 | Click "Today" button               | Scroll to current date               |
| TC-GN-F05 | Create new task                    | Bar appears in correct position      |
| TC-GN-F06 | Drag task bar left/right           | Start/end dates update               |
| TC-GN-F07 | Drag task bar edges                | Duration changes                     |
| TC-GN-F08 | Update progress slider             | Progress bar updates                 |
| TC-GN-F09 | Delete task                        | Bar disappears, dependencies removed |
| TC-GN-F10 | Add dependency                     | Arrow drawn from task A to B         |
| TC-GN-F11 | Select task                        | Dependencies highlighted             |
| TC-GN-F12 | Filter by date range               | Only relevant tasks shown            |
| TC-GN-F13 | Search task name                   | Matching tasks highlighted           |
| TC-GN-F14 | Export to PNG                      | Image downloaded                     |
| TC-GN-F15 | Export to Excel                    | Data file downloaded                 |

### 13.2. Dependency Testing

| Test Case | Setup                     | Expected Result                   |
| --------- | ------------------------- | --------------------------------- |
| TC-GN-D01 | Create A→B dependency     | Arrow drawn                       |
| TC-GN-D02 | Try create B→A (circular) | Error: "Circular dependency"      |
| TC-GN-D03 | Delete task A with deps   | Warning, then remove arrows       |
| TC-GN-D04 | Move task A to later date | Warning: "B depends on A"         |
| TC-GN-D05 | Chain deps A→B→C          | All arrows shown                  |
| TC-GN-D06 | Click task A              | B and C highlighted as successors |

### 13.3. Permission Testing

| Test Case | User Permission      | Expected Result         |
| --------- | -------------------- | ----------------------- |
| TC-GN-P01 | No access            | Cannot see Gantt tab    |
| TC-GN-P02 | View only            | Can view, drag disabled |
| TC-GN-P03 | Self-created only    | Only see own tasks      |
| TC-GN-P04 | No create permission | "+ Bản ghi mới" hidden  |
| TC-GN-P05 | No update permission | Drag & edit disabled    |
| TC-GN-P06 | No delete permission | Delete option hidden    |

### 13.4. Performance Testing

| Test Case  | Dataset         | Target            | Actual |
| ---------- | --------------- | ----------------- | ------ |
| TC-GN-PR01 | 50 tasks        | < 1s initial load |        |
| TC-GN-PR02 | 500 tasks       | < 3s initial load |        |
| TC-GN-PR03 | 1000 tasks      | < 5s initial load |        |
| TC-GN-PR04 | Drag task       | 60fps             |        |
| TC-GN-PR05 | Zoom in/out     | < 200ms           |        |
| TC-GN-PR06 | Pan timeline    | No jank           |        |
| TC-GN-PR07 | Update progress | < 100ms           |        |

### 13.5. Edge Cases

| Test Case | Scenario                     | Expected Result                   |
| --------- | ---------------------------- | --------------------------------- |
| TC-GN-E01 | Task with no dates           | Not shown on Gantt                |
| TC-GN-E02 | Task with only start date    | Default duration = 1 day          |
| TC-GN-E03 | Task duration = 1 hour       | Show on timeline (zoom to hours)  |
| TC-GN-E04 | Task duration = 5 years      | Show on timeline (zoom to months) |
| TC-GN-E05 | 100 dependencies on one task | Show count, collapsible list      |
| TC-GN-E06 | Task name > 100 chars        | Truncate with ellipsis            |
| TC-GN-E07 | Progress = 0%                | Empty progress bar                |
| TC-GN-E08 | Progress = 100%              | Full bar + checkmark              |
| TC-GN-E09 | Network disconnect           | Show offline indicator            |
| TC-GN-E10 | Drag task while loading      | Disabled, show loader             |

### 13.6. Cross-browser Testing

| Browser       | Version | Status          | Notes             |
| ------------- | ------- | --------------- | ----------------- |
| Chrome        | Latest  | ✅ Pass         | Recommended       |
| Firefox       | Latest  | ✅ Pass         |                   |
| Safari        | Latest  | ⚠️ Minor issues | Canvas rendering  |
| Edge          | Latest  | ✅ Pass         |                   |
| Mobile Safari | iOS 15+ | ⚠️ Limited      | Redirect to table |
| Chrome Mobile | Latest  | ⚠️ Limited      | Redirect to table |

---

## 14. ANALYTICS & REPORTING

### 14.1. Gantt Metrics

Hệ thống có thể thu thập các metrics:

| Metric                | Description                 | Formula                                            |
| --------------------- | --------------------------- | -------------------------------------------------- |
| Project Duration      | Total time từ start đến end | MAX(end_date) - MIN(start_date)                    |
| Completed Tasks       | % tasks hoàn thành          | COUNT(progress=100) / COUNT(all)                   |
| On-Time Rate          | % tasks hoàn thành đúng hạn | COUNT(completed & endDate<=due) / COUNT(completed) |
| Average Task Duration | Duration trung bình         | AVG(endDate - startDate)                           |
| Critical Path Length  | Duration của critical path  | SUM(durations on critical path)                    |
| Slack Time            | Available buffer            | Total duration - Critical path length              |

### 14.2. Dashboard Widgets

Có thể tạo các dashboard widgets dựa trên Gantt data:

1. **Timeline Overview**: Mini Gantt showing high-level view
2. **Progress Chart**: Bar chart showing completion by phase
3. **Resource Utilization**: Heatmap of resource allocation
4. **Milestone Tracker**: List of upcoming milestones
5. **Risk Indicator**: Tasks at risk (overdue or on critical path)

### 14.3. Insights & Recommendations

AI/ML có thể analyze Gantt data để đưa ra insights:

- "Task X thường bị delay, nên add buffer"
- "Resource Y bị over-allocated trong week 3"
- "Critical path có 3 tasks chưa assign người"
- "Dự án có 80% khả năng delay 5 ngày"

**Business Rules**:

- **BR-GN-137**: Insights được generate daily và show trong notification
- **BR-GN-138**: Admin có thể subscribe email reports (weekly/monthly)
- **BR-GN-139**: Có dashboard riêng để view tất cả insights

---

## 15. FUTURE ENHANCEMENTS

### 15.1. Planned Features

| Priority | Feature                    | Description                                   | Effort |
| -------- | -------------------------- | --------------------------------------------- | ------ |
| P0       | Auto-scheduling            | Tự động tính toán dates dựa trên dependencies | High   |
| P0       | What-if Analysis           | Simulate changes trước khi apply              | Medium |
| P1       | Resource Leveling          | Auto-adjust timeline để tránh conflicts       | High   |
| P1       | Baseline Comparison        | Compare planned vs actual                     | Medium |
| P2       | Template Library           | Save và reuse Gantt templates                 | Low    |
| P2       | Smart Dependencies         | Suggest dependencies dựa trên patterns        | Medium |
| P3       | Collaborative Planning     | Multi-user editing realtime                   | High   |
| P3       | Integration với MS Project | Import/export .mpp files                      | High   |

### 15.2. Advanced Analytics

- **Earned Value Management (EVM)**: Track project performance (PV, EV, AC)
- **Monte Carlo Simulation**: Predict completion date based on uncertainty
- **Burndown/Burnup Charts**: Agile metrics integration
- **Cost Tracking**: Integrate budget và actual costs vào Gantt

### 15.3. AI-Powered Features

- **Smart Scheduling**: AI suggest optimal task sequence
- **Risk Prediction**: ML predict which tasks likely to delay
- **Auto-assign**: AI recommend who should work on what
- **Smart Notifications**: Alert only khi có changes quan trọng

---

## 16. APPENDIX

### 16.1. Glossary

| Term          | Definition                                                      |
| ------------- | --------------------------------------------------------------- |
| Gantt Chart   | Biểu đồ thanh hiển thị schedule của project theo timeline       |
| Task Bar      | Thanh ngang đại diện cho một task trên Gantt                    |
| Milestone     | Điểm mốc quan trọng, thường có duration = 0                     |
| Dependency    | Mối quan hệ phụ thuộc giữa hai tasks                            |
| Critical Path | Chuỗi tasks dài nhất xác định duration của project              |
| Slack Time    | Thời gian buffer, task có thể delay mà không ảnh hưởng deadline |
| Baseline      | Snapshot của plan ban đầu để so sánh                            |
| Float         | Tương tự slack time                                             |
| Lead Time     | Thời gian task con có thể bắt đầu trước task cha kết thúc       |
| Lag Time      | Thời gian delay giữa task cha kết thúc và task con bắt đầu      |

### 16.2. Formula Reference

#### Duration Calculation

```
Duration (days) = EndDate - StartDate
Duration (working days) = Count(WorkingDays between StartDate and EndDate)
```

#### Critical Path

```
ES = Earliest Start = MAX(EF of predecessors) or 0
EF = Earliest Finish = ES + Duration
LS = Latest Start = LF - Duration
LF = Latest Finish = MIN(LS of successors) or Project End
Slack = LS - ES = LF - EF
Critical Task: Slack = 0
```

#### Progress Calculation

```
Overall Progress = SUM(TaskProgress * TaskDuration) / SUM(TotalDuration)
Weighted Progress = SUM(TaskProgress * TaskWeight) / SUM(TotalWeight)
```

### 16.3. References

- **PMI PMBOK Guide**: Project Management Body of Knowledge
- **Microsoft Project**: Industry standard for Gantt charts
- **dhtmlxGantt Documentation**: https://docs.dhtmlx.com/gantt/
- **Frappe Gantt**: https://frappe.io/gantt
- **Critical Path Method**: https://en.wikipedia.org/wiki/Critical_path_method

### 16.4. Change Log

| Version | Date       | Author  | Changes          |
| ------- | ---------- | ------- | ---------------- |
| 1.0     | 03/11/2025 | BA Team | Initial document |

---

## 17. SIGN-OFF

| Role             | Name | Signature | Date |
| ---------------- | ---- | --------- | ---- |
| Business Analyst |      |           |      |
| Product Owner    |      |           |      |
| Technical Lead   |      |           |      |
| Project Manager  |      |           |      |
| QA Lead          |      |           |      |

---

**End of Document**

**Total Business Rules**: 139
**Total Test Cases**: 50+
**Document Pages**: ~40
