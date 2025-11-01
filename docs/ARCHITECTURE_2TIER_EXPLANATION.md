# Kiến trúc 2 tầng: Builder Platform & End-User Application

## Tổng quan kiến trúc

```
┌─────────────────────────────────────────────────────────────────┐
│                    BUILDER PLATFORM (apps/web)                  │
│                  Dành cho: Chủ doanh nghiệp / Admin             │
├─────────────────────────────────────────────────────────────────┤
│  - Cấu hình Active Tables (fields, actions, permissions)        │
│  - Thiết kế Kanban/Gantt views                                 │
│  - Phân quyền cho teams/roles                                  │
│  - Xem preview/test                                            │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      │ Lưu config vào database
                      ▼
         ┌────────────────────────────┐
         │   Backend API + Database   │
         │  - Active Tables Config    │
         │  - Active Records (data)   │
         │  - Permissions             │
         │  - Teams/Roles             │
         └────────────┬───────────────┘
                      │
                      │ Đọc config & data
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│              END-USER APPLICATION (chưa có trong code)          │
│                   Dành cho: Nhân viên doanh nghiệp              │
├─────────────────────────────────────────────────────────────────┤
│  - Xem Active Records trên Kanban/List/Gantt                   │
│  - Tạo/Sửa/Xóa records (theo permissions)                      │
│  - Comment, mention đồng nghiệp                                │
│  - Thực thi custom actions                                     │
│  - Nhận notifications                                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## Mối liên hệ giữa các thành phần

### 1. Active Table (Bảng dữ liệu)

**Nơi cấu hình:** Builder Platform (apps/web)
**Nơi sử dụng:** End-User Application

```typescript
// Admin tạo Active Table trong Builder
{
  id: "task_table_001",
  name: "Quản lý Công việc",
  tableType: "TASK_EISENHOWER",

  // Fields: Định nghĩa cấu trúc dữ liệu
  fields: [
    { type: "SHORT_TEXT", name: "task_title", label: "Tên công việc" },
    { type: "DATETIME", name: "due_date", label: "Hạn chót" },
    { type: "SELECT_ONE", name: "status", label: "Trạng thái",
      options: [
        { value: "todo", text: "Chưa làm" },
        { value: "in_progress", text: "Đang làm" },
        { value: "done", text: "Hoàn thành" }
      ]
    },
    { type: "SELECT_ONE_WORKSPACE_USER", name: "assignee", label: "Người thực hiện" }
  ]
}
```

### 2. Active Records (Dữ liệu thực tế)

**Nơi tạo:** End-User Application (nhân viên nhập liệu)
**Nơi xem config:** Builder Platform (để thống kê, debug)

```typescript
// Nhân viên tạo bản ghi trong End-User App
{
  id: "record_001",
  tableId: "task_table_001",
  data: {
    task_title: "Thiết kế giao diện trang chủ",
    due_date: "2025-11-15T17:00:00Z",
    status: "in_progress",  // Giá trị từ options đã định nghĩa
    assignee: "user_nguyen_van_a"
  },
  createdBy: "user_nguyen_van_a",
  createdAt: "2025-11-01T09:00:00Z"
}
```

**Quan hệ:**

- Active Table = "Khuôn mẫu" (template/schema)
- Active Record = "Dữ liệu cụ thể" (instance)
- Giống như: Class vs Object trong lập trình

---

### 3. Kanban Config (Cấu hình view Kanban)

**Nơi cấu hình:** Builder Platform
**Nơi hiển thị:** End-User Application

```typescript
// Admin cấu hình Kanban view trong Builder
{
  kanbanScreenId: "kanban_001",
  screenName: "Theo trạng thái",

  // Trường nào tạo cột?
  statusField: "status",  // → Tạo 3 cột: "Chưa làm", "Đang làm", "Hoàn thành"

  // Hiển thị gì trên thẻ?
  kanbanHeadlineField: "task_title",  // Tiêu đề thẻ
  displayFields: ["due_date", "assignee"]  // Thông tin phụ
}
```

**Khi nhân viên mở End-User App:**

```
┌──────────────┬──────────────┬──────────────┐
│  Chưa làm    │  Đang làm    │  Hoàn thành  │  ← Từ status.options
├──────────────┼──────────────┼──────────────┤
│ ┌──────────┐ │ ┌──────────┐ │ ┌──────────┐ │
│ │ Thiết kế │ │ │ Code API │ │ │ Test UAT │ │  ← task_title
│ │ UI       │ │ │          │ │ │          │ │
│ │ 15/11 🙋 │ │ │ 10/11 👤 │ │ │ 05/11 👨 │ │  ← due_date, assignee
│ └──────────┘ │ └──────────┘ │ └──────────┘ │
│              │              │              │
```

**Kéo thả thẻ → Cập nhật field `status` của record**

---

### 4. Permissions Config (Phân quyền)

**Nơi cấu hình:** Builder Platform
**Nơi enforce:** Backend API (khi End-User App gọi API)

```typescript
// Admin cấu hình permissions trong Builder
{
  permissionsConfig: [
    {
      teamId: 'team_dev',
      roleId: 'role_developer',
      actions: [
        // Nhân viên developer được:
        { actionId: 'create_record', permission: 'allowed' }, // ✅ Tạo task
        { actionId: 'update_record', permission: 'self_created_or_assigned' }, // ✅ Sửa task của mình hoặc được gán
        { actionId: 'delete_record', permission: 'self_created_24h' }, // ✅ Xóa task của mình trong 24h
        { actionId: 'comment_create', permission: 'all' }, // ✅ Comment tất cả task
        { actionId: 'comment_delete', permission: 'comment_self_created_2h' }, // ✅ Xóa comment của mình trong 2h
      ],
    },
    {
      teamId: 'team_dev',
      roleId: 'role_manager',
      actions: [
        // Manager được làm nhiều hơn:
        { actionId: 'update_record', permission: 'all' }, // ✅ Sửa tất cả task
        { actionId: 'delete_record', permission: 'created_by_team' }, // ✅ Xóa task của team
        { actionId: 'comment_delete', permission: 'all' }, // ✅ Xóa tất cả comment
      ],
    },
  ];
}
```

**Flow thực tế:**

```
1. Nhân viên A (role: developer) mở End-User App
2. Click nút "Xóa" trên task do nhân viên B tạo
3. End-User App gửi request: DELETE /records/123
4. Backend check:
   - User A có teamId, roleId nào?
   - Với team/role đó, permissionsConfig cho phép gì?
   - Permission "delete_record" = "self_created_24h"
   - Record 123 do nhân viên B tạo → ❌ DENY
5. Trả về lỗi 403 Forbidden
6. End-User App hiển thị: "Bạn không có quyền xóa task này"
```

---

### 5. Actions (Hành động)

**Nơi định nghĩa:** Builder Platform
**Nơi hiển thị:** End-User Application (dưới dạng buttons/menu)

```typescript
// Admin định nghĩa actions trong Builder
{
  actions: [
    // System actions (built-in)
    { actionId: 'act_001', type: 'create', name: 'Tạo task mới', icon: 'plus' },
    { actionId: 'act_002', type: 'update', name: 'Chỉnh sửa', icon: 'edit' },
    { actionId: 'act_003', type: 'delete', name: 'Xóa', icon: 'trash' },

    // Custom actions (business logic tùy chỉnh)
    { actionId: 'act_101', type: 'custom', name: 'Gửi duyệt', icon: 'check' },
    { actionId: 'act_102', type: 'custom', name: 'Reject', icon: 'x' },
    { actionId: 'act_103', type: 'custom', name: 'Export PDF', icon: 'download' },
  ];
}
```

**End-User App hiển thị:**

```
┌─────────────────────────────────────────┐
│ Task: Thiết kế giao diện                │
│ Status: Đang làm                        │
│ Assignee: Nguyễn Văn A                  │
├─────────────────────────────────────────┤
│ [✏️ Chỉnh sửa] [🗑️ Xóa]                 │  ← System actions
│ [✅ Gửi duyệt] [📥 Export PDF]          │  ← Custom actions
└─────────────────────────────────────────┘
```

**Khi click custom action:**

- End-User App gọi: `POST /records/123/execute_action`
  ```json
  { "actionId": "act_101" } // Gửi duyệt
  ```
- Backend nhận actionId, thực thi business logic tương ứng:
  - Chuyển status → "pending_approval"
  - Gửi notification cho manager
  - Tạo record trong bảng "Approval Requests"
  - etc.

---

## So sánh với các hệ thống tương tự

| Khái niệm trong Beqeek | Airtable           | Monday.com     | Notion            |
| ---------------------- | ------------------ | -------------- | ----------------- |
| Active Table           | Base/Table         | Board          | Database          |
| Fields                 | Fields             | Columns        | Properties        |
| Active Records         | Records            | Items          | Pages             |
| Kanban Config          | Kanban View        | Kanban View    | Board View        |
| Permissions Config     | Permissions        | Permissions    | Permissions       |
| Actions                | Automations        | Automations    | -                 |
| Builder Platform       | Base Designer      | Board Settings | Database Settings |
| End-User App           | Airtable Interface | Board View     | Notion Page       |

---

## Ví dụ thực tế hoàn chỉnh

### Scenario: Công ty ABC quản lý tickets hỗ trợ khách hàng

#### 1️⃣ Admin dùng Builder Platform cấu hình:

**Active Table: "Support Tickets"**

```typescript
{
  fields: [
    { name: "ticket_title", type: "SHORT_TEXT", label: "Tiêu đề" },
    { name: "customer_name", type: "SHORT_TEXT", label: "Khách hàng" },
    { name: "priority", type: "SELECT_ONE", label: "Độ ưu tiên",
      options: [
        { value: "low", text: "Thấp", background_color: "#gray" },
        { value: "medium", text: "Trung bình", background_color: "#blue" },
        { value: "high", text: "Cao", background_color: "#orange" },
        { value: "urgent", text: "Khẩn cấp", background_color: "#red" }
      ]
    },
    { name: "status", type: "SELECT_ONE", label: "Trạng thái",
      options: [
        { value: "new", text: "Mới" },
        { value: "assigned", text: "Đã gán" },
        { value: "in_progress", text: "Đang xử lý" },
        { value: "resolved", text: "Đã giải quyết" },
        { value: "closed", text: "Đóng" }
      ]
    },
    { name: "assigned_to", type: "SELECT_ONE_WORKSPACE_USER", label: "Người xử lý" }
  ],

  kanbanConfigs: [
    {
      screenName: "Theo trạng thái",
      statusField: "status",  // 5 cột
      kanbanHeadlineField: "ticket_title",
      displayFields: ["customer_name", "priority", "assigned_to"]
    },
    {
      screenName: "Theo độ ưu tiên",
      statusField: "priority",  // 4 cột
      kanbanHeadlineField: "ticket_title",
      displayFields: ["customer_name", "status", "assigned_to"]
    }
  ],

  permissionsConfig: [
    {
      teamId: "support_team",
      roleId: "support_agent",
      actions: [
        { actionId: "create", permission: "allowed" },
        { actionId: "access", permission: "all" },
        { actionId: "update", permission: "self_created_or_assigned" },
        { actionId: "delete", permission: "not_allowed" },
        { actionId: "comment_create", permission: "all" }
      ]
    },
    {
      teamId: "support_team",
      roleId: "team_leader",
      actions: [
        { actionId: "delete", permission: "created_by_team" },
        { actionId: "update", permission: "all" },
        { actionId: "custom_close_ticket", permission: "all" }
      ]
    }
  ],

  actions: [
    { type: "create", name: "Tạo ticket" },
    { type: "update", name: "Cập nhật" },
    { type: "delete", name: "Xóa" },
    { type: "custom", actionId: "close_all", name: "Đóng hàng loạt" },
    { type: "custom", actionId: "escalate", name: "Chuyển cấp trên" }
  ]
}
```

#### 2️⃣ Nhân viên support dùng End-User App:

**View Kanban "Theo trạng thái":**

```
┌─────────┬─────────┬───────────┬──────────┬────────┐
│ Mới (5) │ Đã gán  │ Đang xử lý│ Giải quyết│ Đóng  │
├─────────┼─────────┼───────────┼──────────┼────────┤
│ 🎫 #123 │ 🎫 #120 │ 🎫 #115   │ 🎫 #110  │ 🎫 #100│
│ Lỗi app │ Quên MK │ Chậm load │ Thanh toán│ Đã xong│
│ 🔴 Khẩn │ 🟠 Cao  │ 🔵 TB     │ ⚪ Thấp  │        │
│ A. Trần │ B. Mai  │ C. Lê     │ A. Trần  │        │
│         │         │           │          │        │
│ 🎫 #122 │ 🎫 #119 │ 🎫 #114   │          │        │
│ ...     │ ...     │ ...       │          │        │
└─────────┴─────────┴───────────┴──────────┴────────┘
```

**Click vào ticket #123:**

```
┌──────────────────────────────────────────────────┐
│ 🎫 Ticket #123: Lỗi app không mở được           │
│                                                  │
│ Khách hàng: Anh Trần                            │
│ Độ ưu tiên: 🔴 Khẩn cấp                         │
│ Người xử lý: Chưa gán                           │
│ Trạng thái: Mới                                 │
│                                                  │
│ [✏️ Cập nhật] [🚀 Chuyển cấp trên]              │
│                                                  │
├──────────────────────────────────────────────────┤
│ 💬 Comments (3)                                  │
│                                                  │
│ 👤 Support A - 2 giờ trước                      │
│ Đã liên hệ khách, chờ cung cấp screenshot      │
│                                                  │
│ 👤 Support B - 1 giờ trước                      │
│ @SupportA đã nhận được screenshot chưa?         │
│                                                  │
│ 👤 Support A - 30 phút trước                    │
│ @SupportB nhận rồi, đang phân tích. Bug ở...   │
│                                                  │
│ [Viết comment...]                               │
└──────────────────────────────────────────────────┘
```

**Kéo ticket #123 từ cột "Mới" → "Đang xử lý":**

- End-User App: `PATCH /records/123 { status: "in_progress" }`
- Backend check permission: ✅ Allowed
- Update database
- Realtime notification → Team thấy ngay

---

## Tóm tắt quan trọng

| Thành phần              | Builder Platform    | End-User App         |
| ----------------------- | ------------------- | -------------------- |
| **Active Table Config** | ✏️ Tạo/sửa cấu trúc | 👁️ Đọc để render UI  |
| **Active Records**      | 📊 Xem thống kê     | ✏️ CRUD dữ liệu thực |
| **Kanban Config**       | ⚙️ Thiết kế view    | 📋 Hiển thị kanban   |
| **Permissions**         | 🔒 Cấu hình rules   | 🚦 Enforce rules     |
| **Actions**             | 🎨 Định nghĩa       | 🔘 Hiển thị buttons  |
| **Comments**            | -                   | 💬 Thảo luận         |

**Workflow tổng thể:**

1. Admin vào Builder → Tạo/cấu hình Active Table
2. Config lưu vào database
3. Nhân viên vào End-User App → Thấy UI theo config
4. Nhân viên tạo/sửa records → Data lưu vào database
5. Backend enforce permissions khi xử lý request
6. Kanban/Gantt views render theo config + data

**Grants:**

- "Grant" là hành động "cấp quyền" (grant permission)
- Admin "grant" quyền cho role trong permissionsConfig
- End-User App không thấy khái niệm này (chỉ thấy kết quả: được/không được làm gì)
