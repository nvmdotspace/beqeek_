# TÀI LIỆU NGHIỆP VỤ: LUỒNG KANBAN BOARD

## Document Information

- **Tên dự án**: BEQEEK - Hệ thống Quản lý Công việc
- **Module**: Active Table - Kanban View
- **Phiên bản**: 1.0
- **Ngày tạo**: 03/11/2025
- **Người tạo**: Business Analyst

---

## 1. TỔNG QUAN

### 1.1. Mục đích

Tài liệu này mô tả chi tiết nghiệp vụ của chức năng **Kanban Board** trong hệ thống Active Table. Kanban Board cho phép người dùng quản lý và theo dõi công việc theo phương pháp trực quan, với các công việc được sắp xếp thành các cột dựa trên trạng thái hoặc phân loại đã định nghĩa.

### 1.2. Phạm vi

Tài liệu bao gồm:

- Mô tả chi tiết luồng nghiệp vụ Kanban
- Cấu hình và thiết lập Kanban Board
- Các thao tác người dùng có thể thực hiện
- Tích hợp với hệ thống Active Table
- Quy tắc và ràng buộc nghiệp vụ

### 1.3. Đối tượng sử dụng

- **End Users**: Nhân viên sử dụng Kanban để quản lý công việc hàng ngày
- **Team Leaders**: Quản lý và theo dõi tiến độ công việc của team
- **Administrators**: Cấu hình và tùy chỉnh Kanban Board theo nhu cầu tổ chức

---

## 2. KIẾN TRÚC TỔNG QUAN

### 2.1. Vị trí trong hệ thống

```
Active Table
├── Bảng (Table View)
├── Kanban (Kanban View) ← Tài liệu này
├── Gantt (Gantt Chart)
└── Charts (Data Visualization)
```

### 2.2. Luồng dữ liệu

```
[Cấu hình Kanban] → [Active Table Config] → [Kanban Render Engine] → [Kanban UI]
         ↓                                              ↓
    [Fields Config]                              [User Actions]
         ↓                                              ↓
    [Record Data] ←──────────────────────────────→ [Database]
```

---

## 3. CẤU TRÚC DỮ LIỆU KANBAN

### 3.1. Đối tượng Kanban Config

Mỗi Active Table có thể có nhiều cấu hình Kanban khác nhau. Mỗi cấu hình được định nghĩa trong mảng `kanbanConfigs`:

```json
{
  "kanbanConfigs": [
    {
      "name": "string", // Tên màn hình Kanban
      "description": "string", // Mô tả màn hình
      "groupByField": "string", // Tên trường dùng để nhóm (cột)
      "cardTitleField": "string", // Tên trường hiển thị làm tiêu đề card
      "cardSubtitleField": "string", // Tên trường hiển thị làm phụ đề
      "cardFields": ["string"] // Mảng tên các trường hiển thị trên card
    }
  ]
}
```

### 3.2. Ví dụ cấu hình thực tế

Dựa trên screenshot, hệ thống BEQEEK có cấu hình Kanban như sau:

```json
{
  "kanbanConfigs": [
    {
      "name": "Ma trận Eisenhower",
      "description": "Kanban board theo ma trận quản lý thời gian Eisenhower",
      "groupByField": "matrix_quadrant",
      "cardTitleField": "task_title",
      "cardSubtitleField": "task_description",
      "cardFields": ["start_date", "duo_date", "self_evaluation", "assignee", "status"]
    },
    {
      "name": "Trạng thái",
      "description": "Kanban board theo trạng thái công việc",
      "groupByField": "status",
      "cardTitleField": "task_title",
      "cardSubtitleField": "task_description",
      "cardFields": ["start_date", "duo_date", "self_evaluation", "assignee", "matrix_quadrant"]
    },
    {
      "name": "Tình trạng công việc",
      "description": "Kanban board theo mức độ thuận lợi",
      "groupByField": "self_evaluation",
      "cardTitleField": "task_title",
      "cardSubtitleField": "task_description",
      "cardFields": ["start_date", "duo_date", "assignee", "status", "matrix_quadrant"]
    }
  ]
}
```

---

## 4. CẤU TRÚC FIELDS (TRƯỜNG DỮ LIỆU)

### 4.1. Trường Group By (Nhóm cột)

Trường được chọn làm `groupByField` phải là loại **SELECT_ONE** với các options được định nghĩa rõ ràng:

```json
{
  "type": "SELECT_ONE",
  "name": "matrix_quadrant",
  "label": "Ma trận Eisenhower",
  "required": true,
  "options": [
    {
      "text": "Quan trọng & Khẩn cấp (Main-stream)",
      "value": "q1",
      "text_color": "#ffffff",
      "background_color": "#dc3545"
    },
    {
      "text": "Quan trọng & Không khẩn cấp (Growth)",
      "value": "q2",
      "text_color": "#ffffff",
      "background_color": "#28a745"
    },
    {
      "text": "Không quan trọng & Khẩn cấp (No-problem)",
      "value": "q3",
      "text_color": "#ffffff",
      "background_color": "#f15c14"
    },
    {
      "text": "Không quan trọng & Không khẩn cấp (Idea)",
      "value": "q4",
      "text_color": "#ffffff",
      "background_color": "#6c757d"
    }
  ]
}
```

### 4.2. Các trường hiển thị trên Card

Dựa trên screenshot, các loại trường thường được hiển thị:

| Tên trường         | Loại                      | Mục đích                                            |
| ------------------ | ------------------------- | --------------------------------------------------- |
| `task_title`       | SHORT_TEXT                | Tiêu đề công việc                                   |
| `task_description` | RICH_TEXT                 | Mô tả chi tiết                                      |
| `start_date`       | DATETIME                  | Thời gian bắt đầu                                   |
| `duo_date`         | DATETIME                  | Thời gian kết thúc (Deadline)                       |
| `self_evaluation`  | SELECT_ONE                | Tình trạng công việc                                |
| `assignee`         | SELECT_ONE_WORKSPACE_USER | Người phụ trách                                     |
| `status`           | SELECT_ONE                | Trạng thái (Chưa bắt đầu/Đang thực hiện/Hoàn thành) |

---

## 5. LUỒNG NGHIỆP VỤ CHÍNH

### 5.1. Khởi tạo Kanban Board

#### Flow Diagram

```
[User truy cập Active Table]
    ↓
[Nhấn tab "Kanban"]
    ↓
[Hệ thống kiểm tra kanbanConfigs]
    ↓
├─ Có config → [Hiển thị Kanban Selector]
│                    ↓
│              [User chọn Kanban config]
│                    ↓
│              [Render Kanban Board]
└─ Không có → [Hiển thị empty state]
```

#### Business Rules

1. **BR-KB-001**: Nếu Active Table chưa có `kanbanConfigs`, hiển thị empty state với message hướng dẫn Admin cấu hình
2. **BR-KB-002**: Nếu có nhiều `kanbanConfigs`, hiển thị dropdown selector để user chọn view
3. **BR-KB-003**: Kanban config được chọn lần trước sẽ được lưu vào localStorage và tự động load lại khi user quay lại

### 5.2. Render Kanban Board

#### Quy trình render

```javascript
// Pseudo code
function renderKanbanBoard(kanbanConfig, records) {
  // 1. Lấy danh sách options từ groupByField
  const columns = getFieldOptions(kanbanConfig.groupByField);

  // 2. Tạo các cột Kanban
  columns.forEach((column) => {
    createKanbanColumn({
      title: column.text,
      backgroundColor: column.background_color,
      textColor: column.text_color,
    });
  });

  // 3. Phân bổ records vào các cột
  records.forEach((record) => {
    const columnValue = record[kanbanConfig.groupByField];
    const column = findColumn(columnValue);

    column.addCard({
      title: record[kanbanConfig.cardTitleField],
      subtitle: record[kanbanConfig.cardSubtitleField],
      fields: renderCardFields(record, kanbanConfig.cardFields),
    });
  });

  // 4. Render UI
  renderToDOM(kanbanBoard);
}
```

#### Business Rules

- **BR-KB-004**: Mỗi cột Kanban tương ứng với một option của trường `groupByField`
- **BR-KB-005**: Màu nền và màu chữ của header cột được lấy từ `background_color` và `text_color` trong options
- **BR-KB-006**: Nếu record không có giá trị cho `groupByField` (null/empty), card sẽ được đặt vào cột "Chưa phân loại" (nếu có)
- **BR-KB-007**: Cards trong cùng một cột được sắp xếp theo `created_at` (mới nhất lên đầu)

### 5.3. Hiển thị Kanban Card

#### Cấu trúc Card

```
┌─────────────────────────────────┐
│ [Card Title]               [⋮]  │ ← Action Menu
├─────────────────────────────────┤
│ [Card Subtitle]                 │
├─────────────────────────────────┤
│ Thời gian bắt đầu: [Date]       │
│ Thời gian kết thúc: [Date]      │
│ Tình trạng công việc: [Badge]   │
│ Người phụ trách: [User]         │
│ Trạng thái: [Badge]             │
└─────────────────────────────────┘
```

#### Business Rules

- **BR-KB-008**: Card title là bắt buộc, nếu không có hiển thị "(Không có tiêu đề)"
- **BR-KB-009**: Card subtitle có thể để trống
- **BR-KB-010**: Các trường thuộc loại SELECT_ONE hiển thị dưới dạng badge với màu tương ứng
- **BR-KB-011**: Trường DATETIME hiển thị theo format: "DD/MM/YYYY HH:mm" hoặc "-" nếu trống
- **BR-KB-012**: Trường SELECT_ONE_WORKSPACE_USER hiển thị tên người dùng hoặc "-" nếu chưa assign

### 5.4. Chuyển đổi giữa các Kanban Views

#### Use Case

**Actor**: End User  
**Precondition**: Active Table có nhiều hơn 1 kanbanConfig  
**Main Flow**:

1. User nhấn vào Kanban selector dropdown (hiển thị ở đầu Kanban board)
2. Hệ thống hiển thị danh sách các kanbanConfig với tên và mô tả
3. User chọn một config
4. Hệ thống lưu lựa chọn vào localStorage
5. Hệ thống re-render Kanban board với config mới

**Business Rules**:

- **BR-KB-013**: Khi chuyển view, tất cả filters và search query được giữ nguyên
- **BR-KB-014**: Animation chuyển đổi giữa các view phải smooth (fade in/out hoặc slide)

---

## 6. CÁC THAO TÁC NGƯỜI DÙNG

### 6.1. Tìm kiếm và Lọc

#### 6.1.1. Tìm kiếm toàn văn

- **Vị trí**: Thanh tìm kiếm ở đầu trang
- **Chức năng**: Tìm kiếm trong các trường đã cấu hình trong `hashedKeywordFields`
- **Business Rules**:
  - **BR-KB-015**: Search áp dụng cho tất cả records trên mọi cột Kanban
  - **BR-KB-016**: Kết quả tìm kiếm được highlight (bold) trong card title
  - **BR-KB-017**: Nếu không có kết quả, hiển thị empty state "Không tìm thấy bản ghi"

#### 6.1.2. Quick Filters

Dựa trên screenshot, hệ thống hỗ trợ 3 loại quick filter:

| Filter             | Trường            | Loại                      |
| ------------------ | ----------------- | ------------------------- |
| Trạng thái         | `status`          | SELECT_ONE                |
| Ma trận Eisenhower | `matrix_quadrant` | SELECT_ONE                |
| Người phụ trách    | `assignee`        | SELECT_ONE_WORKSPACE_USER |

**Business Rules**:

- **BR-KB-018**: Có thể apply nhiều filters cùng lúc (AND logic)
- **BR-KB-019**: Filter "Tất cả" = không filter (show tất cả)
- **BR-KB-020**: Khi apply filter, cards không match sẽ bị ẩn khỏi tất cả cột
- **BR-KB-021**: Số lượng cards còn lại sau filter được hiển thị trên header mỗi cột

#### 6.1.3. Advanced Filter

- **Vị trí**: Button filter icon (☰) bên cạnh nút "Bản ghi mới"
- **Chức năng**: Mở popup cho phép tạo filter phức tạp với nhiều điều kiện
- **Business Rules**:
  - **BR-KB-022**: Hỗ trợ các operator: =, !=, >, <, >=, <=, contains, not contains
  - **BR-KB-023**: Có thể thêm nhiều điều kiện với AND/OR logic
  - **BR-KB-024**: Filter được lưu vào URL params để có thể share link

### 6.2. Tạo mới Record

#### Use Case

**Actor**: End User  
**Precondition**: User có quyền tạo record (action type = 'create')  
**Main Flow**:

1. User nhấn nút "Bản ghi mới" (+ Bản ghi mới)
2. Hệ thống mở popup form với tất cả fields được cấu hình
3. User nhập thông tin và chọn giá trị cho `groupByField`
4. User nhấn "Lưu"
5. Hệ thống validate dữ liệu
6. Hệ thống tạo record mới
7. Card mới xuất hiện trên cột tương ứng với giá trị `groupByField`

**Business Rules**:

- **BR-KB-025**: Trường required phải được điền (đánh dấu \*)
- **BR-KB-026**: Card mới sẽ xuất hiện ở đầu cột (top)
- **BR-KB-027**: Nếu tạo thành công, hiển thị toast notification "Đã tạo bản ghi"

#### Alternative Flow: Tạo nhanh từ cột

**Main Flow**:

1. User nhấn nút "Tải thêm" ở cuối một cột
2. Hệ thống mở popup form với `groupByField` đã được pre-fill theo cột đó
3. User nhập thông tin các trường còn lại
4. User nhấn "Lưu"
5. Card mới xuất hiện ngay trong cột đó

**Business Rules**:

- **BR-KB-028**: Giá trị `groupByField` đã được lock, user không thể thay đổi
- **BR-KB-029**: Shortcut này chỉ khả dụng khi có ít nhất 1 field required khác ngoài `groupByField`

### 6.3. Xem chi tiết Record

#### Use Case

**Actor**: End User  
**Precondition**: User có quyền xem record (action type = 'access')  
**Main Flow**:

1. User click vào card trong Kanban
2. Hệ thống navigate đến trang chi tiết record
3. Hiển thị tất cả thông tin của record theo layout được cấu hình trong `recordDetailConfig`

**Business Rules**:

- **BR-KB-030**: URL thay đổi thành `/active_tables/{tableId}/records/{recordId}`
- **BR-KB-031**: User có thể quay lại Kanban bằng nút Back
- **BR-KB-032**: Khi quay lại, Kanban vẫn giữ nguyên state (view, filters, scroll position)

### 6.4. Cập nhật Record

#### 6.4.1. Quick Edit

**Main Flow**:

1. User click vào menu (⋮) trên card
2. Chọn action "Sửa nhanh"
3. Hệ thống mở popup với các trường quan trọng
4. User sửa thông tin
5. User nhấn "Lưu"
6. Card được cập nhật realtime

**Business Rules**:

- **BR-KB-033**: Quick edit chỉ hiển thị các trường trong `cardFields` + `groupByField`
- **BR-KB-034**: Nếu user thay đổi `groupByField`, card sẽ tự động move sang cột mới

#### 6.4.2. Full Edit

**Main Flow**:

1. User vào trang chi tiết record
2. Nhấn nút "Sửa" hoặc click vào menu actions
3. Hệ thống mở popup form với tất cả fields
4. User sửa thông tin
5. User nhấn "Lưu"
6. Hệ thống cập nhật database
7. UI được refresh

**Business Rules**:

- **BR-KB-035**: User chỉ được sửa nếu có quyền (permission = 'all', 'self_created', etc.)
- **BR-KB-036**: Nếu không có quyền, nút "Sửa" bị ẩn hoặc disabled

#### 6.4.3. Drag & Drop (If implemented)

**Main Flow**:

1. User drag một card từ cột này sang cột khác
2. Hệ thống hiển thị drop zone
3. User drop card vào cột mới
4. Hệ thống tự động cập nhật giá trị `groupByField` của record
5. Card xuất hiện trong cột mới

**Business Rules**:

- **BR-KB-037**: Drag & drop chỉ thay đổi giá trị của `groupByField`, các trường khác giữ nguyên
- **BR-KB-038**: Nếu không có quyền sửa, drag & drop bị disabled
- **BR-KB-039**: Animation smooth khi move card
- **BR-KB-040**: Nếu update fail, card sẽ revert về vị trí cũ với error toast

### 6.5. Xóa Record

#### Use Case

**Actor**: End User  
**Precondition**: User có quyền xóa (action type = 'delete')  
**Main Flow**:

1. User click menu (⋮) trên card
2. Chọn action "Xóa"
3. Hệ thống hiển thị confirmation dialog: "Bạn có chắc chắn muốn xóa bản ghi này?"
4. User xác nhận
5. Hệ thống xóa record
6. Card biến mất khỏi Kanban với animation fade out

**Business Rules**:

- **BR-KB-041**: Phải có confirmation trước khi xóa
- **BR-KB-042**: Nếu xóa thành công, hiển thị toast "Đã xóa bản ghi"
- **BR-KB-043**: Nếu xóa thất bại, hiển thị error message và giữ nguyên card

### 6.6. Custom Actions

#### Use Case

**Actor**: End User  
**Precondition**: Admin đã cấu hình custom actions trong Active Table  
**Main Flow**:

1. User click menu (⋮) trên card
2. Hệ thống hiển thị danh sách actions có sẵn
3. User chọn một custom action (VD: "Gửi email", "Export PDF", "Chuyển trạng thái")
4. Hệ thống thực thi action
5. Hiển thị kết quả cho user

**Business Rules**:

- **BR-KB-044**: Custom actions chỉ hiển thị nếu user có permission
- **BR-KB-045**: Actions có thể trigger workflow, API call, hoặc UI change
- **BR-KB-046**: Kết quả action được notify qua toast hoặc dock message

---

## 7. TÍCH HỢP HỆ THỐNG

### 7.1. API Endpoints

#### 7.1.1. Lấy danh sách Records

```
GET /api/workspace/{workspaceId}/workflow/active_tables/{tableId}/records
Query Parameters:
- search: string (optional)
- filters: JSON string (optional)
- page: number (default: 1)
- limit: number (default: 50)
```

**Response**:

```json
{
  "data": [
    {
      "id": "string",
      "created_at": "datetime",
      "updated_at": "datetime",
      "created_by": "userId",
      "fields": {
        "task_title": "Bổ sung loại trường Mã tự sinh",
        "matrix_quadrant": "q1",
        "status": "in_progress",
        ...
      }
    }
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 5,
    "total_records": 247
  }
}
```

#### 7.1.2. Tạo Record mới

```
POST /api/workspace/{workspaceId}/workflow/active_tables/{tableId}/records
Body: {
  "fields": {
    "task_title": "string",
    "matrix_quadrant": "q1",
    ...
  }
}
```

#### 7.1.3. Cập nhật Record

```
PATCH /api/workspace/{workspaceId}/workflow/active_tables/{tableId}/records/{recordId}
Body: {
  "fields": {
    "status": "completed",
    ...
  }
}
```

#### 7.1.4. Xóa Record

```
DELETE /api/workspace/{workspaceId}/workflow/active_tables/{tableId}/records/{recordId}
```

### 7.2. WebSocket Integration

Hệ thống sử dụng WebSocket để real-time update khi có thay đổi:

```javascript
// Socket connection
socket.on('record_created', (data) => {
  // Thêm card mới vào Kanban
  KanbanView.addCard(data.record);
});

socket.on('record_updated', (data) => {
  // Cập nhật card
  KanbanView.updateCard(data.record);

  // Nếu groupByField thay đổi, move card sang cột khác
  if (data.changes.includes('groupByField')) {
    KanbanView.moveCard(data.recordId, data.newColumn);
  }
});

socket.on('record_deleted', (data) => {
  // Xóa card
  KanbanView.removeCard(data.recordId);
});
```

**Business Rules**:

- **BR-KB-047**: Real-time update chỉ apply cho users đang xem cùng Active Table
- **BR-KB-048**: Nếu mất kết nối WebSocket, hiển thị warning banner ở đầu trang
- **BR-KB-049**: Khi reconnect thành công, tự động refresh data để đồng bộ

---

## 8. PERMISSIONS & SECURITY

### 8.1. Quyền truy cập Kanban View

| Action         | Permission Required | Description                                 |
| -------------- | ------------------- | ------------------------------------------- |
| View Kanban    | `access` action     | Xem được Kanban board và các cards          |
| Create Record  | `create` action     | Tạo mới record từ Kanban                    |
| Update Record  | `update` action     | Sửa thông tin record (quick edit/full edit) |
| Delete Record  | `delete` action     | Xóa record khỏi Kanban                      |
| Custom Actions | Per action config   | Thực thi các custom actions                 |

### 8.2. Data-level Security

**Business Rules**:

- **BR-KB-050**: User chỉ thấy cards của records mà họ có quyền `access`
- **BR-KB-051**: Nếu permission = `self_created`, chỉ thấy cards do mình tạo
- **BR-KB-052**: Nếu permission = `assigned_user`, chỉ thấy cards được assign cho mình
- **BR-KB-053**: Admin với permission = `all` sẽ thấy tất cả cards

### 8.3. E2E Encryption (Optional)

Nếu Active Table có `e2eeEncryption = true`:

- **BR-KB-054**: Card data được encrypt trước khi lưu database
- **BR-KB-055**: Decrypt client-side bằng `encryptionAuthKey`
- **BR-KB-056**: User phải nhập encryption key lần đầu truy cập

---

## 9. UI/UX SPECIFICATIONS

### 9.1. Responsive Design

#### Desktop (>1024px)

- Hiển thị tất cả các cột Kanban ngang nhau
- Scroll ngang nếu có nhiều hơn 4-5 cột
- Mỗi cột width: 300-350px

#### Tablet (768px - 1024px)

- Scroll ngang
- Mỗi cột width: 280px

#### Mobile (<768px)

- Stack các cột thành vertical layout
- Mỗi cột chiếm full width
- Scroll dọc

### 9.2. Color Coding

Dựa trên screenshot, color scheme của Ma trận Eisenhower:

- **Q1 (Main-stream)**: `#dc3545` - Đỏ (Quan trọng & Khẩn cấp)
- **Q2 (Growth)**: `#28a745` - Xanh lá (Quan trọng & Không khẩn cấp)
- **Q3 (No-problem)**: `#f15c14` - Cam (Không quan trọng & Khẩn cấp)
- **Q4 (Idea)**: `#6c757d` - Xám (Không quan trọng & Không khẩn cấp)

**Business Rules**:

- **BR-KB-057**: Header cột sử dụng `background_color` và `text_color` từ field options
- **BR-KB-058**: Badges trong card cũng sử dụng màu từ field options
- **BR-KB-059**: Có contrast ratio tối thiểu 4.5:1 để đảm bảo accessibility

### 9.3. Animation & Interactions

| Interaction            | Animation              | Duration |
| ---------------------- | ---------------------- | -------- |
| Card appear            | Fade in + Scale        | 200ms    |
| Card move              | Slide + Ease           | 300ms    |
| Card remove            | Fade out + Scale down  | 200ms    |
| Column expand/collapse | Height transition      | 250ms    |
| Drag & drop            | Follow cursor + Shadow | -        |

### 9.4. Empty States

#### 9.4.1. Cột trống

```
┌─────────────────────────┐
│   Không có bản ghi      │
│                         │
│   [+ Tải thêm]          │
└─────────────────────────┘
```

#### 9.4.2. Không có kết quả tìm kiếm

```
┌─────────────────────────────────────┐
│    🔍                               │
│   Không tìm thấy bản ghi            │
│   Thử điều chỉnh từ khóa tìm kiếm   │
└─────────────────────────────────────┘
```

#### 9.4.3. Chưa cấu hình Kanban

```
┌─────────────────────────────────────┐
│    ⚙️                                │
│   Chưa có cấu hình Kanban           │
│   Vui lòng liên hệ Admin để         │
│   thiết lập Kanban Board            │
└─────────────────────────────────────┘
```

---

## 10. PERFORMANCE CONSIDERATIONS

### 10.1. Lazy Loading

**Business Rules**:

- **BR-KB-060**: Mỗi cột load tối đa 20 cards ban đầu
- **BR-KB-061**: User scroll xuống cuối cột → auto load thêm 20 cards
- **BR-KB-062**: Infinite scroll cho đến khi hết records hoặc đạt limit

### 10.2. Optimization

| Metric       | Target  | Solution                                 |
| ------------ | ------- | ---------------------------------------- |
| Initial Load | < 2s    | API pagination + CDN                     |
| Card Render  | < 100ms | Virtual scrolling cho cột có >100 cards  |
| Drag & Drop  | 60fps   | RequestAnimationFrame + GPU acceleration |
| Search       | < 500ms | Debounce 300ms + Backend indexing        |

### 10.3. Caching Strategy

- **BR-KB-063**: Kanban config cache trong localStorage (expire 1 giờ)
- **BR-KB-064**: Records cache trong memory (clear khi switch table)
- **BR-KB-065**: Field configs cache trong localStorage (expire khi version change)

---

## 11. ERROR HANDLING

### 11.1. Common Errors

| Error Code | Message                        | User Action            |
| ---------- | ------------------------------ | ---------------------- |
| `KB_001`   | Không có quyền truy cập Kanban | Liên hệ Admin          |
| `KB_002`   | Không tìm thấy cấu hình Kanban | Yêu cầu Admin cấu hình |
| `KB_003`   | Không thể tải dữ liệu          | Refresh trang          |
| `KB_004`   | Không có quyền tạo record      | -                      |
| `KB_005`   | Validation error               | Kiểm tra lại form      |
| `KB_006`   | Network error                  | Kiểm tra kết nối       |
| `KB_007`   | Permission denied              | Liên hệ Admin          |

### 11.2. Fallback Behavior

**Business Rules**:

- **BR-KB-066**: Nếu WebSocket disconnect, switch sang polling mode (5s interval)
- **BR-KB-067**: Nếu API timeout, retry 3 lần với exponential backoff
- **BR-KB-068**: Nếu render error, hiển thị error boundary với nút "Reload"

---

## 12. TESTING SCENARIOS

### 12.1. Functional Testing

| Test Case | Steps                       | Expected Result                 |
| --------- | --------------------------- | ------------------------------- |
| TC-KB-001 | Navigate to Kanban tab      | Kanban board loads successfully |
| TC-KB-002 | Switch between Kanban views | View changes correctly          |
| TC-KB-003 | Create new record           | Card appears in correct column  |
| TC-KB-004 | Update groupByField         | Card moves to new column        |
| TC-KB-005 | Delete record               | Card disappears                 |
| TC-KB-006 | Apply filter                | Only matching cards show        |
| TC-KB-007 | Search keyword              | Matching cards highlighted      |
| TC-KB-008 | Drag & drop card            | Card moves and updates          |

### 12.2. Permission Testing

| Test Case | Setup                             | Expected Result             |
| --------- | --------------------------------- | --------------------------- |
| TC-KB-P01 | User without access permission    | Cannot see Kanban tab       |
| TC-KB-P02 | User with self_created permission | Only sees own cards         |
| TC-KB-P03 | User without create permission    | "Bản ghi mới" button hidden |
| TC-KB-P04 | User without update permission    | Cannot edit cards           |
| TC-KB-P05 | User without delete permission    | Delete option hidden        |

### 12.3. Edge Cases

| Test Case | Scenario                         | Expected Result            |
| --------- | -------------------------------- | -------------------------- |
| TC-KB-E01 | Column with 0 cards              | Shows empty state          |
| TC-KB-E02 | Card with missing required field | Shows "(Không có tiêu đề)" |
| TC-KB-E03 | Very long card title             | Truncate with ellipsis     |
| TC-KB-E04 | 100+ cards in one column         | Virtual scroll + lazy load |
| TC-KB-E05 | Network disconnect during drag   | Revert and show error      |

---

## 13. FUTURE ENHANCEMENTS

### 13.1. Planned Features

1. **Swim lanes**: Nhóm theo 2 chiều (ví dụ: Ma trận + Người phụ trách)
2. **Card templates**: Tạo nhanh card từ template
3. **Bulk actions**: Chọn nhiều cards để update/delete cùng lúc
4. **Card dependencies**: Hiển thị mối quan hệ giữa các cards
5. **Time tracking**: Tích hợp timer trên card
6. **WIP limits**: Giới hạn số lượng cards trong cột
7. **Card cover**: Thêm ảnh cover cho card
8. **Labels**: Thêm tags/labels cho cards

### 13.2. Analytics Integration

- Dashboard hiển thị:
  - Distribution of cards across columns
  - Average time in each status
  - Bottleneck detection
  - Velocity trends

---

## 14. APPENDIX

### 14.1. Glossary

| Term           | Definition                                              |
| -------------- | ------------------------------------------------------- |
| Active Table   | Bảng dữ liệu động có thể cấu hình linh hoạt             |
| Kanban Board   | Bảng trực quan quản lý công việc theo cột trạng thái    |
| Card           | Thẻ đại diện cho một record/công việc                   |
| Column         | Cột trong Kanban, đại diện cho một trạng thái/phân loại |
| Group By Field | Trường dùng để phân nhóm cards vào các cột              |
| Quick Filter   | Bộ lọc nhanh ở đầu trang                                |
| Empty State    | Trạng thái không có dữ liệu                             |

### 14.2. References

- **Functional Spec**: `/docs/active-table-config-functional-spec.md`
- **Blade Template**: `/resources/views/active-table-records.blade.php`
- **API Documentation**: `/docs/api/active-tables.md`
- **Kanban Best Practices**: https://www.atlassian.com/agile/kanban

### 14.3. Change Log

| Version | Date       | Author  | Changes          |
| ------- | ---------- | ------- | ---------------- |
| 1.0     | 03/11/2025 | BA Team | Initial document |

---

## 15. SIGN-OFF

| Role             | Name | Signature | Date |
| ---------------- | ---- | --------- | ---- |
| Business Analyst |      |           |      |
| Product Owner    |      |           |      |
| Technical Lead   |      |           |      |
| QA Lead          |      |           |      |

---

**End of Document**
