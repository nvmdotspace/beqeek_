# PHÂN QUYỀN VÀ ACTIONS - HƯỚNG DẪN THỰC TẾ

## Document Information

- **Feature**: Permissions System & Actions
- **Ngày tạo**: 05/11/2025
- **Mục đích**: Giải thích hệ thống phân quyền và actions với use cases thực tế

---

## MỤC LỤC

1. [Executive Summary](#1-executive-summary)
2. [Khái niệm cơ bản](#2-khái-niệm-cơ-bản)
3. [Actions - Các hành động](#3-actions---các-hành-động)
4. [Permissions Config - Phân quyền](#4-permissions-config---phân-quyền)
5. [Ví dụ thực tế](#5-ví-dụ-thực-tế)
6. [Use Cases chi tiết](#6-use-cases-chi-tiết)
7. [Implementation Guide](#7-implementation-guide)
8. [Best Practices](#8-best-practices)

---

## 1. EXECUTIVE SUMMARY

### Tóm tắt nhanh

**Hệ thống Phân quyền** = Kiểm soát **AI có quyền làm GÌ** với **bản ghi NÀO**

```
┌─────────────────────────────────────────────────────┐
│                                                      │
│  WHO (Role/Team) → CAN DO WHAT (Action)            │
│                  → ON WHICH RECORDS (Permission)    │
│                                                      │
└─────────────────────────────────────────────────────┘
```

**3 thành phần chính**:

1. **Actions**: Định nghĩa các hành động có thể làm (create, update, delete, custom)
2. **Permissions Config**: Quy định ai được làm hành động nào
3. **Record Permissions**: Mỗi record có danh sách actions user được phép thực hiện

---

## 2. KHÁI NIỆM CƠ BẢN

### 2.1. Role & Team

Trong hệ thống workspace:

```
Workspace
├── Team A (Sales)
│   ├── Role: Manager
│   ├── Role: Sales Rep
│   └── Role: Intern
├── Team B (Support)
│   ├── Role: Lead
│   └── Role: Agent
└── Team C (Admin)
    └── Role: Administrator
```

**Mỗi user** = **1 Team** + **1 Role** trong team đó

**Ví dụ**:

- User "Nguyễn Văn A" = Team Sales + Role Manager
- User "Trần Thị B" = Team Support + Role Agent

### 2.2. Actions - Hành động

**Actions** = Các hành động user có thể thực hiện trên records

**Có 2 loại**:

#### A. System Actions (Built-in)

```javascript
{
  "type": "create",   // Tạo record mới
  "name": "Tạo mới"
}

{
  "type": "access",   // Xem/truy cập record
  "name": "Xem"
}

{
  "type": "update",   // Sửa record
  "name": "Chỉnh sửa"
}

{
  "type": "delete",   // Xóa record
  "name": "Xóa"
}

{
  "type": "comment_create",   // Tạo comment
  "name": "Bình luận"
}

{
  "type": "comment_access",   // Xem comments
  "name": "Xem bình luận"
}

{
  "type": "comment_update",   // Sửa comment
  "name": "Sửa bình luận"
}

{
  "type": "comment_delete",   // Xóa comment
  "name": "Xóa bình luận"
}
```

#### B. Custom Actions (Tùy chỉnh)

```javascript
{
  "type": "custom",
  "actionId": "approve_order",
  "name": "Duyệt đơn hàng",
  "icon": "check_circle"
}

{
  "type": "custom",
  "actionId": "send_email",
  "name": "Gửi email",
  "icon": "email"
}

{
  "type": "custom",
  "actionId": "export_pdf",
  "name": "Xuất PDF",
  "icon": "picture_as_pdf"
}
```

### 2.3. Permissions Config

**Permissions Config** = Quy định role nào được thực hiện action nào

```javascript
{
  "permissionsConfig": [
    {
      "teamId": "team_sales",
      "roleId": "role_manager",
      "actions": [
        {
          "actionId": "update",
          "permission": "all"  // ← KEY: Điều kiện được phép
        },
        {
          "actionId": "delete",
          "permission": "self_created"
        },
        {
          "actionId": "approve_order",
          "permission": "created_by_team"
        }
      ]
    }
  ]
}
```

### 2.4. Record Permissions

**Mỗi record có object `permissions`** chứa danh sách actions user được phép:

```javascript
{
  "id": "record_001",
  "record": {
    "customer_name": "Nguyễn Văn A",
    "total_amount": 1000000,
    // ... other fields
  },
  "permissions": {
    "access": true,           // ✅ Được xem
    "update": true,           // ✅ Được sửa
    "delete": false,          // ❌ Không được xóa
    "custom_approve_order": true,  // ✅ Được duyệt đơn
    "custom_send_email": false     // ❌ Không được gửi email
  }
}
```

**Backend tính toán** `permissions` dựa trên:

- User's Team & Role
- PermissionsConfig
- Record data (createdBy, assignedUser, etc.)
- Current time (cho các permission có time limit)

---

## 3. ACTIONS - CÁC HÀNH ĐỘNG

### 3.1. System Actions

#### CREATE Action

```javascript
{
  "type": "create",
  "name": "Tạo mới"
}
```

**Permissions Options**:

- `not_allowed`: Không được tạo
- `allowed`: Được tạo

**Ví dụ**:

```javascript
// Sales Rep ĐƯỢC tạo đơn hàng
{
  "teamId": "team_sales",
  "roleId": "role_rep",
  "actions": [
    { "actionId": "create", "permission": "allowed" }
  ]
}

// Intern KHÔNG được tạo đơn hàng
{
  "teamId": "team_sales",
  "roleId": "role_intern",
  "actions": [
    { "actionId": "create", "permission": "not_allowed" }
  ]
}
```

---

#### ACCESS Action

```javascript
{
  "type": "access",
  "name": "Xem"
}
```

**Permissions Options**: (nhiều options nhất!)

- `not_allowed`: Không được xem
- `all`: Xem tất cả records
- `self_created`: Chỉ xem records do mình tạo
- `self_created_2h/12h/24h`: Xem trong thời gian giới hạn
- `assigned_user`: Chỉ xem records được gán cho mình
- `related_user`: Xem records liên quan đến mình
- `self_created_or_assigned`: Xem records do mình tạo HOẶC được gán
- `created_by_team`: Xem records do bất kỳ ai trong team tạo
- `assigned_team_member`: Xem records gán cho người trong team
- ... và nhiều options khác

**Ví dụ**:

```javascript
// Manager xem TẤT CẢ đơn hàng
{
  "teamId": "team_sales",
  "roleId": "role_manager",
  "actions": [
    { "actionId": "access", "permission": "all" }
  ]
}

// Sales Rep chỉ xem đơn của mình hoặc được gán
{
  "teamId": "team_sales",
  "roleId": "role_rep",
  "actions": [
    { "actionId": "access", "permission": "self_created_or_assigned" }
  ]
}

// Intern chỉ xem đơn do mình tạo trong 24h
{
  "teamId": "team_sales",
  "roleId": "role_intern",
  "actions": [
    { "actionId": "access", "permission": "self_created_24h" }
  ]
}
```

---

#### UPDATE & DELETE Actions

**Tương tự ACCESS**, có nhiều permission options

**Ví dụ**:

```javascript
// Manager sửa/xóa TẤT CẢ đơn hàng
{
  "actions": [
    { "actionId": "update", "permission": "all" },
    { "actionId": "delete", "permission": "all" }
  ]
}

// Sales Rep chỉ sửa đơn của mình
{
  "actions": [
    { "actionId": "update", "permission": "self_created" },
    { "actionId": "delete", "permission": "not_allowed" }
  ]
}

// Intern sửa đơn của mình trong 2h, không được xóa
{
  "actions": [
    { "actionId": "update", "permission": "self_created_2h" },
    { "actionId": "delete", "permission": "not_allowed" }
  ]
}
```

---

### 3.2. Custom Actions

**Custom Actions** = Actions tùy chỉnh do admin định nghĩa

**Cấu trúc**:

```javascript
{
  "type": "custom",
  "actionId": "unique_id",      // Unique identifier
  "name": "Display Name",       // Tên hiển thị
  "icon": "material_icon_name"  // Icon (optional)
}
```

**Ví dụ**:

#### A. Approve Order (Duyệt đơn)

```javascript
{
  "type": "custom",
  "actionId": "approve_order",
  "name": "Duyệt đơn hàng",
  "icon": "check_circle"
}
```

**Permission Config**:

```javascript
// Chỉ Manager được duyệt
{
  "teamId": "team_sales",
  "roleId": "role_manager",
  "actions": [
    { "actionId": "approve_order", "permission": "all" }
  ]
}

// Sales Rep không được duyệt
{
  "teamId": "team_sales",
  "roleId": "role_rep",
  "actions": [
    { "actionId": "approve_order", "permission": "not_allowed" }
  ]
}
```

---

#### B. Send Invoice (Gửi hóa đơn)

```javascript
{
  "type": "custom",
  "actionId": "send_invoice",
  "name": "Gửi hóa đơn",
  "icon": "receipt"
}
```

**Permission Config**:

```javascript
// Chỉ gửi hóa đơn cho đơn do mình tạo
{
  "teamId": "team_sales",
  "roleId": "role_rep",
  "actions": [
    { "actionId": "send_invoice", "permission": "self_created" }
  ]
}
```

---

#### C. Cancel Order (Hủy đơn)

```javascript
{
  "type": "custom",
  "actionId": "cancel_order",
  "name": "Hủy đơn hàng",
  "icon": "cancel"
}
```

**Permission Config**:

```javascript
// Manager hủy tất cả
{
  "teamId": "team_sales",
  "roleId": "role_manager",
  "actions": [
    { "actionId": "cancel_order", "permission": "all" }
  ]
}

// Sales Rep chỉ hủy đơn của mình trong 12h
{
  "teamId": "team_sales",
  "roleId": "role_rep",
  "actions": [
    { "actionId": "cancel_order", "permission": "self_created_12h" }
  ]
}
```

---

## 4. PERMISSIONS CONFIG - PHÂN QUYỀN

### 4.1. Cấu trúc đầy đủ

```javascript
{
  "permissionsConfig": [
    {
      "teamId": "team_sales",
      "roleId": "role_manager",
      "actions": [
        { "actionId": "create", "permission": "allowed" },
        { "actionId": "access", "permission": "all" },
        { "actionId": "update", "permission": "all" },
        { "actionId": "delete", "permission": "all" },
        { "actionId": "approve_order", "permission": "all" },
        { "actionId": "send_invoice", "permission": "all" }
      ]
    },
    {
      "teamId": "team_sales",
      "roleId": "role_rep",
      "actions": [
        { "actionId": "create", "permission": "allowed" },
        { "actionId": "access", "permission": "self_created_or_assigned" },
        { "actionId": "update", "permission": "self_created" },
        { "actionId": "delete", "permission": "not_allowed" },
        { "actionId": "approve_order", "permission": "not_allowed" },
        { "actionId": "send_invoice", "permission": "self_created" }
      ]
    },
    {
      "teamId": "team_sales",
      "roleId": "role_intern",
      "actions": [
        { "actionId": "create", "permission": "allowed" },
        { "actionId": "access", "permission": "self_created_24h" },
        { "actionId": "update", "permission": "self_created_2h" },
        { "actionId": "delete", "permission": "not_allowed" },
        { "actionId": "approve_order", "permission": "not_allowed" },
        { "actionId": "send_invoice", "permission": "not_allowed" }
      ]
    }
  ]
}
```

### 4.2. Permission Values chi tiết

#### CREATE Actions

| Value         | Meaning           |
| ------------- | ----------------- |
| `not_allowed` | ❌ Không được tạo |
| `allowed`     | ✅ Được tạo       |

---

#### ACCESS, UPDATE, DELETE, CUSTOM Actions

| Value                             | Meaning                       | Example                 |
| --------------------------------- | ----------------------------- | ----------------------- |
| `not_allowed`                     | ❌ Không được phép            | -                       |
| `all`                             | ✅ Tất cả records             | Manager xem mọi đơn     |
| `self_created`                    | ✅ Records do mình tạo        | Rep xem đơn của mình    |
| `self_created_2h`                 | ✅ Records mình tạo trong 2h  | Intern sửa trong 2h     |
| `self_created_12h`                | ✅ Trong 12h                  | Sửa trong 12h           |
| `self_created_24h`                | ✅ Trong 24h                  | Xem trong 24h           |
| `assigned_user`                   | ✅ Records được gán cho mình  | Đơn gán cho Rep         |
| `related_user`                    | ✅ Records liên quan đến mình | Có mention/tag mình     |
| `self_created_or_assigned`        | ✅ Tạo HOẶC gán               | Đơn của mình + được gán |
| `self_created_or_related`         | ✅ Tạo HOẶC liên quan         | -                       |
| `created_by_team`                 | ✅ Bất kỳ ai trong team tạo   | Team member tạo         |
| `created_by_team_2h`              | ✅ Team tạo trong 2h          | -                       |
| `created_by_team_12h`             | ✅ Team tạo trong 12h         | -                       |
| `created_by_team_24h`             | ✅ Team tạo trong 24h         | -                       |
| `created_by_team_48h`             | ✅ Team tạo trong 48h         | -                       |
| `created_by_team_72h`             | ✅ Team tạo trong 72h         | -                       |
| `assigned_team_member`            | ✅ Gán cho ai trong team      | -                       |
| `related_team_member`             | ✅ Liên quan đến team         | -                       |
| `created_or_assigned_team_member` | ✅ Team tạo HOẶC gán          | -                       |
| `created_or_related_team_member`  | ✅ Team tạo HOẶC liên quan    | -                       |

---

#### COMMENT Actions

**Comment Create**: Tương tự ACCESS/UPDATE/DELETE

**Comment Access**:
| Value | Meaning |
|-------|---------|
| `not_allowed` | ❌ Không xem |
| `all` | ✅ Xem tất cả comments |
| `comment_self_created` | ✅ Comments mình tạo |
| `comment_self_created_or_tagged` | ✅ Mình tạo HOẶC có tag mình |
| `comment_created_by_team` | ✅ Team tạo |
| `comment_created_or_tagged_team_member` | ✅ Team tạo HOẶC tag team |

**Comment Update/Delete**:
| Value | Meaning |
|-------|---------|
| `not_allowed` | ❌ Không được |
| `all` | ✅ Tất cả comments |
| `comment_self_created` | ✅ Comments mình tạo |
| `comment_self_created_2h/12h/24h` | ✅ Mình tạo trong time limit |
| `comment_created_by_team` | ✅ Team tạo |
| `comment_created_by_team_2h/12h/24h` | ✅ Team tạo trong time limit |

---

## 5. VÍ DỤ THỰC TẾ

### 5.1. Hệ thống CRM - Quản lý Khách hàng

#### Scenario

**Công ty có**:

- Team Sales (3 roles: Manager, Senior Rep, Junior Rep)
- Team Support (2 roles: Lead, Agent)
- Bảng: Customers (Khách hàng)

#### Actions Definition

```javascript
{
  "actions": [
    { "type": "create", "name": "Tạo khách hàng" },
    { "type": "access", "name": "Xem khách hàng" },
    { "type": "update", "name": "Sửa thông tin" },
    { "type": "delete", "name": "Xóa khách hàng" },
    { "type": "custom", "actionId": "assign_to_user", "name": "Gán cho người khác", "icon": "person_add" },
    { "type": "custom", "actionId": "send_email", "name": "Gửi email", "icon": "email" },
    { "type": "custom", "actionId": "export_data", "name": "Xuất dữ liệu", "icon": "download" }
  ]
}
```

#### Permissions Config

```javascript
{
  "permissionsConfig": [
    // Sales Manager - Full control
    {
      "teamId": "team_sales",
      "roleId": "role_manager",
      "actions": [
        { "actionId": "create", "permission": "allowed" },
        { "actionId": "access", "permission": "all" },
        { "actionId": "update", "permission": "all" },
        { "actionId": "delete", "permission": "all" },
        { "actionId": "assign_to_user", "permission": "all" },
        { "actionId": "send_email", "permission": "all" },
        { "actionId": "export_data", "permission": "all" }
      ]
    },

    // Senior Sales Rep - Limited control
    {
      "teamId": "team_sales",
      "roleId": "role_senior_rep",
      "actions": [
        { "actionId": "create", "permission": "allowed" },
        { "actionId": "access", "permission": "self_created_or_assigned" },
        { "actionId": "update", "permission": "self_created_or_assigned" },
        { "actionId": "delete", "permission": "not_allowed" },
        { "actionId": "assign_to_user", "permission": "self_created" },
        { "actionId": "send_email", "permission": "self_created_or_assigned" },
        { "actionId": "export_data", "permission": "self_created_or_assigned" }
      ]
    },

    // Junior Sales Rep - Very limited
    {
      "teamId": "team_sales",
      "roleId": "role_junior_rep",
      "actions": [
        { "actionId": "create", "permission": "allowed" },
        { "actionId": "access", "permission": "self_created" },
        { "actionId": "update", "permission": "self_created_24h" },
        { "actionId": "delete", "permission": "not_allowed" },
        { "actionId": "assign_to_user", "permission": "not_allowed" },
        { "actionId": "send_email", "permission": "self_created" },
        { "actionId": "export_data", "permission": "not_allowed" }
      ]
    },

    // Support Lead - Read + update
    {
      "teamId": "team_support",
      "roleId": "role_lead",
      "actions": [
        { "actionId": "create", "permission": "not_allowed" },
        { "actionId": "access", "permission": "all" },
        { "actionId": "update", "permission": "assigned_team_member" },
        { "actionId": "delete", "permission": "not_allowed" },
        { "actionId": "assign_to_user", "permission": "assigned_team_member" },
        { "actionId": "send_email", "permission": "assigned_team_member" },
        { "actionId": "export_data", "permission": "not_allowed" }
      ]
    },

    // Support Agent - Read only assigned
    {
      "teamId": "team_support",
      "roleId": "role_agent",
      "actions": [
        { "actionId": "create", "permission": "not_allowed" },
        { "actionId": "access", "permission": "assigned_user" },
        { "actionId": "update", "permission": "assigned_user" },
        { "actionId": "delete", "permission": "not_allowed" },
        { "actionId": "assign_to_user", "permission": "not_allowed" },
        { "actionId": "send_email", "permission": "assigned_user" },
        { "actionId": "export_data", "permission": "not_allowed" }
      ]
    }
  ]
}
```

#### Test Cases

**Case 1: Sales Manager tạo customer mới**

```javascript
// User: sales_manager_001
// Action: create

// Step 1: Check permission in config
permissionsConfig
  .find((p) => p.teamId === 'team_sales' && p.roleId === 'role_manager')
  .actions.find((a) => a.actionId === 'create');
// → { "actionId": "create", "permission": "allowed" }

// Result: ✅ Allowed - Hiển thị button "Tạo mới"
```

**Case 2: Senior Rep xem customer do Junior Rep tạo nhưng gán cho mình**

```javascript
// User: senior_rep_001
// Record:
{
  "id": "cust_001",
  "createdBy": "junior_rep_002",  // ← Người khác tạo
  "assignedUser": "senior_rep_001" // ← Gán cho mình
}

// Step 1: Check permission in config
// → "self_created_or_assigned"

// Step 2: Backend checks
// - self_created? NO (createdBy ≠ current user)
// - assigned? YES (assignedUser === current user)

// Result: ✅ Allowed - record.permissions.access = true
```

**Case 3: Junior Rep cố sửa customer sau 48h**

```javascript
// User: junior_rep_001
// Record:
{
  "id": "cust_002",
  "createdBy": "junior_rep_001",
  "createdAt": "2025-11-01T10:00:00Z"
}

// Current time: 2025-11-03T10:00:00Z (48h sau)

// Step 1: Check permission config
// → "self_created_24h"

// Step 2: Backend checks
// - self_created? YES
// - within 24h? NO (48h > 24h)

// Result: ❌ Not allowed - record.permissions.update = false
```

**Case 4: Support Agent xem customer không được gán**

```javascript
// User: support_agent_001
// Record:
{
  "id": "cust_003",
  "createdBy": "sales_rep_001",
  "assignedUser": "support_agent_002"  // ← Gán cho người khác
}

// Step 1: Check permission config
// → "assigned_user"

// Step 2: Backend checks
// - assigned_user? NO (assignedUser ≠ current user)

// Result: ❌ Not allowed
// - Record không xuất hiện trong list view
// - Không thể access detail view
```

---

### 5.2. Hệ thống Order Management - Quản lý Đơn hàng

#### Scenario

**E-commerce company có**:

- Team Sales (Manager, Rep)
- Team Warehouse (Manager, Staff)
- Team Finance (Accountant, Auditor)
- Bảng: Orders (Đơn hàng)

#### Actions Definition

```javascript
{
  "actions": [
    { "type": "create", "name": "Tạo đơn hàng" },
    { "type": "access", "name": "Xem đơn hàng" },
    { "type": "update", "name": "Sửa đơn hàng" },
    { "type": "delete", "name": "Xóa đơn hàng" },

    // Custom actions theo workflow
    { "type": "custom", "actionId": "confirm_order", "name": "Xác nhận đơn", "icon": "check" },
    { "type": "custom", "actionId": "cancel_order", "name": "Hủy đơn", "icon": "cancel" },
    { "type": "custom", "actionId": "prepare_shipping", "name": "Chuẩn bị giao hàng", "icon": "local_shipping" },
    { "type": "custom", "actionId": "complete_order", "name": "Hoàn thành đơn", "icon": "check_circle" },
    { "type": "custom", "actionId": "create_invoice", "name": "Tạo hóa đơn", "icon": "receipt" },
    { "type": "custom", "actionId": "approve_refund", "name": "Duyệt hoàn tiền", "icon": "money_off" }
  ]
}
```

#### Permissions Config

```javascript
{
  "permissionsConfig": [
    // Sales Manager
    {
      "teamId": "team_sales",
      "roleId": "role_manager",
      "actions": [
        { "actionId": "create", "permission": "allowed" },
        { "actionId": "access", "permission": "all" },
        { "actionId": "update", "permission": "all" },
        { "actionId": "delete", "permission": "created_by_team_24h" },
        { "actionId": "confirm_order", "permission": "all" },
        { "actionId": "cancel_order", "permission": "all" },
        { "actionId": "prepare_shipping", "permission": "not_allowed" },
        { "actionId": "complete_order", "permission": "not_allowed" },
        { "actionId": "create_invoice", "permission": "all" },
        { "actionId": "approve_refund", "permission": "not_allowed" }
      ]
    },

    // Sales Rep
    {
      "teamId": "team_sales",
      "roleId": "role_rep",
      "actions": [
        { "actionId": "create", "permission": "allowed" },
        { "actionId": "access", "permission": "self_created" },
        { "actionId": "update", "permission": "self_created" },
        { "actionId": "delete", "permission": "not_allowed" },
        { "actionId": "confirm_order", "permission": "self_created" },
        { "actionId": "cancel_order", "permission": "self_created_2h" },
        { "actionId": "prepare_shipping", "permission": "not_allowed" },
        { "actionId": "complete_order", "permission": "not_allowed" },
        { "actionId": "create_invoice", "permission": "self_created" },
        { "actionId": "approve_refund", "permission": "not_allowed" }
      ]
    },

    // Warehouse Manager
    {
      "teamId": "team_warehouse",
      "roleId": "role_manager",
      "actions": [
        { "actionId": "create", "permission": "not_allowed" },
        { "actionId": "access", "permission": "all" },
        { "actionId": "update", "permission": "all" },
        { "actionId": "delete", "permission": "not_allowed" },
        { "actionId": "confirm_order", "permission": "not_allowed" },
        { "actionId": "cancel_order", "permission": "all" },
        { "actionId": "prepare_shipping", "permission": "all" },
        { "actionId": "complete_order", "permission": "all" },
        { "actionId": "create_invoice", "permission": "not_allowed" },
        { "actionId": "approve_refund", "permission": "not_allowed" }
      ]
    },

    // Warehouse Staff
    {
      "teamId": "team_warehouse",
      "roleId": "role_staff",
      "actions": [
        { "actionId": "create", "permission": "not_allowed" },
        { "actionId": "access", "permission": "assigned_user" },
        { "actionId": "update", "permission": "assigned_user" },
        { "actionId": "delete", "permission": "not_allowed" },
        { "actionId": "confirm_order", "permission": "not_allowed" },
        { "actionId": "cancel_order", "permission": "not_allowed" },
        { "actionId": "prepare_shipping", "permission": "assigned_user" },
        { "actionId": "complete_order", "permission": "assigned_user" },
        { "actionId": "create_invoice", "permission": "not_allowed" },
        { "actionId": "approve_refund", "permission": "not_allowed" }
      ]
    },

    // Finance Accountant
    {
      "teamId": "team_finance",
      "roleId": "role_accountant",
      "actions": [
        { "actionId": "create", "permission": "not_allowed" },
        { "actionId": "access", "permission": "all" },
        { "actionId": "update", "permission": "not_allowed" },
        { "actionId": "delete", "permission": "not_allowed" },
        { "actionId": "confirm_order", "permission": "not_allowed" },
        { "actionId": "cancel_order", "permission": "not_allowed" },
        { "actionId": "prepare_shipping", "permission": "not_allowed" },
        { "actionId": "complete_order", "permission": "not_allowed" },
        { "actionId": "create_invoice", "permission": "all" },
        { "actionId": "approve_refund", "permission": "all" }
      ]
    }
  ]
}
```

#### Workflow Example

**Order Flow**:

```
1. Sales Rep tạo đơn (create)
   ↓
2. Sales Rep xác nhận đơn (confirm_order)
   ↓
3. Warehouse Staff chuẩn bị hàng (prepare_shipping)
   ↓
4. Warehouse Staff hoàn thành đơn (complete_order)
   ↓
5. Finance Accountant tạo hóa đơn (create_invoice)
```

**Permissions theo từng bước**:

```javascript
// Step 1: Sales Rep tạo order_001
{
  "id": "order_001",
  "createdBy": "sales_rep_001",
  "status": "draft",
  "permissions": {
    "access": true,           // ✅ self_created
    "update": true,           // ✅ self_created
    "confirm_order": true,    // ✅ self_created
    "cancel_order": true,     // ✅ self_created_2h
    "prepare_shipping": false // ❌ not_allowed
  }
}

// Step 2: Sales Rep xác nhận → status = "confirmed"
// Gán cho Warehouse Staff
{
  "id": "order_001",
  "status": "confirmed",
  "assignedUser": "warehouse_staff_001"
}

// Warehouse Staff xem order_001
{
  "permissions": {
    "access": true,             // ✅ assigned_user
    "update": true,             // ✅ assigned_user
    "prepare_shipping": true,   // ✅ assigned_user
    "complete_order": true      // ✅ assigned_user
  }
}

// Sales Rep vẫn thấy nhưng không sửa được (vì assignedUser đổi)
{
  "permissions": {
    "access": true,             // ✅ self_created
    "update": false,            // ❌ not assigned anymore
    "prepare_shipping": false   // ❌ not_allowed
  }
}
```

---

## 6. USE CASES CHI TIẾT

### 6.1. Time-based Permissions

**Scenario**: Cho phép sửa/xóa trong thời gian giới hạn

**Use Case**: Junior employee tạo record, có 2h để sửa lỗi

```javascript
{
  "teamId": "team_sales",
  "roleId": "role_junior",
  "actions": [
    { "actionId": "update", "permission": "self_created_2h" },
    { "actionId": "delete", "permission": "self_created_2h" }
  ]
}
```

**Timeline**:

```
10:00 AM - Junior Rep tạo order_001
  ↓
10:30 AM - Có thể sửa ✅ (trong 2h)
  ↓
11:30 AM - Có thể xóa ✅ (trong 2h)
  ↓
12:01 PM - KHÔNG thể sửa/xóa ❌ (> 2h)
```

**Backend Logic**:

```javascript
function checkPermission(user, action, record) {
  const config = getPermissionConfig(user.teamId, user.roleId);
  const permission = config.actions.find((a) => a.actionId === action).permission;

  if (permission === 'self_created_2h') {
    const now = new Date();
    const createdAt = new Date(record.createdAt);
    const hoursDiff = (now - createdAt) / (1000 * 60 * 60);

    return record.createdBy === user.id && hoursDiff <= 2;
  }
}
```

---

### 6.2. Assignment-based Permissions

**Scenario**: Chỉ người được assigned mới làm được

**Use Case**: Support ticket system

```javascript
// Support Agent chỉ xử lý tickets được gán
{
  "teamId": "team_support",
  "roleId": "role_agent",
  "actions": [
    { "actionId": "access", "permission": "assigned_user" },
    { "actionId": "update", "permission": "assigned_user" },
    { "actionId": "custom_resolve", "permission": "assigned_user" }
  ]
}
```

**Example**:

```javascript
// Ticket 1: Gán cho agent_001
{
  "id": "ticket_001",
  "assignedUser": "agent_001",
  "status": "open"
}

// agent_001 login
→ record.permissions.access = true ✅
→ record.permissions.update = true ✅
→ record.permissions.custom_resolve = true ✅

// agent_002 login
→ record.permissions.access = false ❌
→ Không thấy ticket này trong list
```

---

### 6.3. Team-based Permissions

**Scenario**: Bất kỳ ai trong team đều xem được

**Use Case**: Team collaboration

```javascript
// Team member xem records của cả team
{
  "teamId": "team_sales",
  "roleId": "role_rep",
  "actions": [
    { "actionId": "access", "permission": "created_by_team" },
    { "actionId": "update", "permission": "created_or_assigned_team_member" }
  ]
}
```

**Example**:

```javascript
// Sales Team có 3 reps
// Rep A tạo order_001
// Rep B tạo order_002
// Rep C tạo order_003

// Rep A login:
→ Thấy order_001, order_002, order_003 ✅ (created_by_team)
→ Sửa được order_001 ✅ (self created)
→ Không sửa được order_002, order_003 ❌ (not assigned)

// Nếu order_002 được assign cho Rep A:
→ Sửa được order_002 ✅ (assigned)
```

---

### 6.4. Hierarchical Permissions

**Scenario**: Manager có quyền cao hơn staff

**Use Case**: Approval workflow

```javascript
// Manager - full control
{
  "teamId": "team_sales",
  "roleId": "role_manager",
  "actions": [
    { "actionId": "access", "permission": "all" },
    { "actionId": "update", "permission": "all" },
    { "actionId": "delete", "permission": "all" },
    { "actionId": "approve", "permission": "all" }
  ]
}

// Staff - limited
{
  "teamId": "team_sales",
  "roleId": "role_staff",
  "actions": [
    { "actionId": "access", "permission": "self_created" },
    { "actionId": "update", "permission": "self_created_24h" },
    { "actionId": "delete", "permission": "not_allowed" },
    { "actionId": "approve", "permission": "not_allowed" }
  ]
}
```

---

### 6.5. Multi-team Access

**Scenario**: Record liên quan đến nhiều teams

**Use Case**: Cross-team collaboration

```javascript
// Order có assignedSalesRep và assignedWarehouseStaff

// Sales Team
{
  "teamId": "team_sales",
  "roleId": "role_rep",
  "actions": [
    { "actionId": "access", "permission": "self_created_or_assigned" },
    { "actionId": "update", "permission": "self_created" }
  ]
}

// Warehouse Team
{
  "teamId": "team_warehouse",
  "roleId": "role_staff",
  "actions": [
    { "actionId": "access", "permission": "assigned_user" },
    { "actionId": "update", "permission": "assigned_user" }
  ]
}
```

**Example**:

```javascript
{
  "id": "order_001",
  "createdBy": "sales_rep_001",
  "assignedSalesRep": "sales_rep_001",
  "assignedWarehouseStaff": "warehouse_staff_001"
}

// sales_rep_001:
→ access ✅ (self_created)
→ update ✅ (self_created)

// warehouse_staff_001:
→ access ✅ (assigned in assignedWarehouseStaff field)
→ update ✅ (assigned)
```

---

## 7. IMPLEMENTATION GUIDE

### 7.1. Frontend - Display Actions

**Code**: Lines 2368-2395

```javascript
// Get actions from table config
const actions = States.currentTable?.config?.actions || [];

// Filter actions based on record permissions
const displayActions = actions.filter(
  (action) =>
    ['custom', 'update', 'delete'].includes(action.type) &&
    record.permissions[
      action.type === 'custom'
        ? `custom_${action.actionId}` // custom_approve_order
        : action.type // update, delete
    ],
);

// Render action menu
if (displayActions.length > 0) {
  html += `
    <div class="action-menu">
      ${displayActions
        .map(
          (action) => `
        <button onclick="${getActionHandler(action, record.id)}">
          ${action.icon ? `<span class="material-icons">${action.icon}</span>` : ''}
          ${action.name}
        </button>
      `,
        )
        .join('')}
    </div>
  `;
}
```

**How it works**:

1. Loop qua `actions` array
2. Check `record.permissions[actionId]`
3. Chỉ hiển thị actions có permission = true

---

### 7.2. Frontend - Trigger Custom Action

**Code**: Lines 2547-2574

```javascript
static async triggerAction(actionId, recordId, tableId) {
  // Find record
  let record = records.find(r => r.id === recordId);

  try {
    // Call API
    const response = await CommonUtils.apiCall(
      `${API_PREFIX}/post/active_tables/${tableId}/records/${recordId}/action/${actionId}`,
      {
        responseId: CommonUtils.getResponseId(),
        workflowData: record
      }
    );

    CommonUtils.showMessage('Thực hiện action thành công!', true);

    // Refresh list/detail view
    await RecordView.renderRecordList();
  } catch (error) {
    CommonUtils.showMessage(`Lỗi: ${error.message}`, false);
  }
}
```

**API Call**:

```
POST /api/workspace/{workspaceId}/workflow/post/active_tables/{tableId}/records/{recordId}/action/{actionId}

Body:
{
  "responseId": "unique_response_id",
  "workflowData": {
    "id": "record_001",
    "record": { ... }
  }
}
```

---

### 7.3. Backend - Calculate Permissions

**Pseudo-code** (backend logic):

```javascript
function calculateRecordPermissions(user, record, permissionsConfig) {
  // Get user's team & role config
  const userConfig = permissionsConfig.find((p) => p.teamId === user.teamId && p.roleId === user.roleId);

  if (!userConfig) {
    return {}; // No permissions
  }

  const permissions = {};

  // Loop through each action
  userConfig.actions.forEach((actionConfig) => {
    const { actionId, permission } = actionConfig;

    // Calculate based on permission value
    permissions[actionId] = checkPermissionValue(user, record, permission);
  });

  return permissions;
}

function checkPermissionValue(user, record, permission) {
  const now = new Date();
  const createdAt = new Date(record.createdAt);
  const hoursSinceCreated = (now - createdAt) / (1000 * 60 * 60);

  switch (permission) {
    case 'not_allowed':
      return false;

    case 'allowed':
    case 'all':
      return true;

    case 'self_created':
      return record.createdBy === user.id;

    case 'self_created_2h':
      return record.createdBy === user.id && hoursSinceCreated <= 2;

    case 'self_created_12h':
      return record.createdBy === user.id && hoursSinceCreated <= 12;

    case 'self_created_24h':
      return record.createdBy === user.id && hoursSinceCreated <= 24;

    case 'assigned_user':
      return record.assignedUser === user.id || (record.assignedUsers && record.assignedUsers.includes(user.id));

    case 'related_user':
      return checkUserRelated(user.id, record);

    case 'self_created_or_assigned':
      return record.createdBy === user.id || record.assignedUser === user.id;

    case 'created_by_team':
      return checkUserInSameTeam(record.createdBy, user.id);

    case 'created_by_team_24h':
      return checkUserInSameTeam(record.createdBy, user.id) && hoursSinceCreated <= 24;

    case 'assigned_team_member':
      return checkAssignedToTeamMember(record, user.teamId);

    // ... more cases

    default:
      return false;
  }
}
```

---

### 7.4. Backend - API Response Structure

**Fetch Records Response**:

```javascript
{
  "success": true,
  "data": [
    {
      "id": "record_001",
      "createdAt": "2025-11-05T10:00:00Z",
      "createdBy": "user_001",
      "updatedAt": "2025-11-05T11:00:00Z",
      "updatedBy": "user_001",

      // Record data
      "record": {
        "customer_name": "Nguyễn Văn A",
        "total_amount": 1000000,
        "status": "pending",
        "assignedUser": "user_002"
      },

      // Permissions for current user
      "permissions": {
        "access": true,
        "update": true,
        "delete": false,
        "custom_approve_order": false,
        "custom_send_invoice": true,
        "custom_cancel_order": true
      }
    },
    // ... more records
  ],
  "next_id": "cursor_token",
  "previous_id": null
}
```

---

## 8. BEST PRACTICES

### 8.1. Designing Permissions

#### ✅ DO

**1. Start with least privilege**

```javascript
// Start restrictive, expand as needed
{
  "roleId": "role_new_hire",
  "actions": [
    { "actionId": "create", "permission": "allowed" },
    { "actionId": "access", "permission": "self_created" },
    { "actionId": "update", "permission": "self_created_2h" },
    { "actionId": "delete", "permission": "not_allowed" }
  ]
}
```

**2. Use time limits for sensitive actions**

```javascript
// Prevent accidental changes after time passes
{ "actionId": "delete", "permission": "self_created_12h" }
```

**3. Separate read and write permissions**

```javascript
// Allow read but restrict write
{ "actionId": "access", "permission": "all" },
{ "actionId": "update", "permission": "self_created" }
```

**4. Use team-based for collaboration**

```javascript
// Team can see each other's work
{ "actionId": "access", "permission": "created_by_team" }
```

---

#### ❌ DON'T

**1. Don't give "all" permission by default**

```javascript
// BAD - too permissive
{
  "roleId": "role_staff",
  "actions": [
    { "actionId": "delete", "permission": "all" }  // ❌ Dangerous!
  ]
}

// GOOD
{
  "roleId": "role_staff",
  "actions": [
    { "actionId": "delete", "permission": "not_allowed" }  // ✅ Safe
  ]
}
```

**2. Don't mix permissions across different domains**

```javascript
// BAD - Finance shouldn't handle warehouse
{
  "teamId": "team_finance",
  "actions": [
    { "actionId": "prepare_shipping", "permission": "all" }  // ❌ Wrong domain!
  ]
}
```

**3. Don't forget time windows**

```javascript
// BAD - No time limit
{ "actionId": "update", "permission": "self_created" }  // Can edit forever

// GOOD - Add time limit
{ "actionId": "update", "permission": "self_created_24h" }  // Only 24h
```

---

### 8.2. Testing Permissions

**Test Matrix**:

| User Role | Action        | Own Record | Team Record | Other Record | Expected         |
| --------- | ------------- | ---------- | ----------- | ------------ | ---------------- |
| Manager   | access        | ✅         | ✅          | ✅           | All allowed      |
| Manager   | delete        | ✅         | ✅          | ✅           | All allowed      |
| Rep       | access        | ✅         | ✅          | ❌           | Team only        |
| Rep       | update        | ✅         | ❌          | ❌           | Own only         |
| Rep       | delete        | ❌         | ❌          | ❌           | Not allowed      |
| Intern    | update (< 2h) | ✅         | ❌          | ❌           | Own + time limit |
| Intern    | update (> 2h) | ❌         | ❌          | ❌           | Time expired     |

**Test Scenarios**:

```javascript
// Test 1: Self-created permission
describe('self_created permission', () => {
  it('should allow access to own records', () => {
    const user = { id: 'user_001', teamId: 'team_a', roleId: 'role_rep' };
    const record = { id: 'rec_001', createdBy: 'user_001' };

    const allowed = checkPermission(user, 'access', record);
    expect(allowed).toBe(true);
  });

  it('should deny access to others records', () => {
    const user = { id: 'user_001', teamId: 'team_a', roleId: 'role_rep' };
    const record = { id: 'rec_002', createdBy: 'user_002' };

    const allowed = checkPermission(user, 'access', record);
    expect(allowed).toBe(false);
  });
});

// Test 2: Time-based permission
describe('self_created_2h permission', () => {
  it('should allow within 2 hours', () => {
    const now = new Date('2025-11-05T12:00:00Z');
    const user = { id: 'user_001' };
    const record = {
      createdBy: 'user_001',
      createdAt: '2025-11-05T11:00:00Z', // 1 hour ago
    };

    const allowed = checkPermission(user, 'update', record, now);
    expect(allowed).toBe(true);
  });

  it('should deny after 2 hours', () => {
    const now = new Date('2025-11-05T14:00:00Z');
    const user = { id: 'user_001' };
    const record = {
      createdBy: 'user_001',
      createdAt: '2025-11-05T11:00:00Z', // 3 hours ago
    };

    const allowed = checkPermission(user, 'update', record, now);
    expect(allowed).toBe(false);
  });
});
```

---

### 8.3. Common Patterns

#### Pattern 1: CRUD Hierarchy

```javascript
// Manager - Full CRUD
{
  "roleId": "role_manager",
  "actions": [
    { "actionId": "create", "permission": "allowed" },
    { "actionId": "access", "permission": "all" },
    { "actionId": "update", "permission": "all" },
    { "actionId": "delete", "permission": "all" }
  ]
}

// Staff - CRUD on own records
{
  "roleId": "role_staff",
  "actions": [
    { "actionId": "create", "permission": "allowed" },
    { "actionId": "access", "permission": "self_created_or_assigned" },
    { "actionId": "update", "permission": "self_created" },
    { "actionId": "delete", "permission": "not_allowed" }
  ]
}

// Read-only role
{
  "roleId": "role_viewer",
  "actions": [
    { "actionId": "create", "permission": "not_allowed" },
    { "actionId": "access", "permission": "all" },
    { "actionId": "update", "permission": "not_allowed" },
    { "actionId": "delete", "permission": "not_allowed" }
  ]
}
```

---

#### Pattern 2: Approval Workflow

```javascript
// Creator - Create and submit
{
  "roleId": "role_creator",
  "actions": [
    { "actionId": "create", "permission": "allowed" },
    { "actionId": "update", "permission": "self_created" },
    { "actionId": "custom_submit", "permission": "self_created" },
    { "actionId": "custom_approve", "permission": "not_allowed" }
  ]
}

// Approver - Approve only
{
  "roleId": "role_approver",
  "actions": [
    { "actionId": "create", "permission": "not_allowed" },
    { "actionId": "access", "permission": "all" },
    { "actionId": "update", "permission": "not_allowed" },
    { "actionId": "custom_approve", "permission": "all" },
    { "actionId": "custom_reject", "permission": "all" }
  ]
}
```

---

#### Pattern 3: Handoff Workflow

```javascript
// Sales - Create and handoff
{
  "teamId": "team_sales",
  "roleId": "role_rep",
  "actions": [
    { "actionId": "create", "permission": "allowed" },
    { "actionId": "update", "permission": "self_created" },
    { "actionId": "custom_assign_warehouse", "permission": "self_created" },
    { "actionId": "custom_complete", "permission": "not_allowed" }
  ]
}

// Warehouse - Execute assigned work
{
  "teamId": "team_warehouse",
  "roleId": "role_staff",
  "actions": [
    { "actionId": "create", "permission": "not_allowed" },
    { "actionId": "access", "permission": "assigned_user" },
    { "actionId": "update", "permission": "assigned_user" },
    { "actionId": "custom_complete", "permission": "assigned_user" }
  ]
}
```

---

## 9. TROUBLESHOOTING

### 9.1. Common Issues

#### Issue 1: Action không hiển thị

**Problem**: Button action không xuất hiện trong UI

**Causes**:

1. ❌ `record.permissions[actionId]` = false
2. ❌ Action không trong config
3. ❌ Frontend filter sai

**Debug**:

```javascript
// Check record permissions
console.log('Record permissions:', record.permissions);

// Check if action exists in config
console.log('Table actions:', States.currentTable.config.actions);

// Check filter logic
const displayActions = actions.filter(
  (action) =>
    ['custom', 'update', 'delete'].includes(action.type) &&
    record.permissions[action.type === 'custom' ? `custom_${action.actionId}` : action.type],
);
console.log('Display actions:', displayActions);
```

---

#### Issue 2: Permission denied unexpectedly

**Problem**: User should have permission nhưng bị denied

**Causes**:

1. ❌ Time limit exceeded
2. ❌ Record not assigned to user
3. ❌ Wrong team/role config
4. ❌ Backend calculation sai

**Debug**:

```javascript
// Backend log
console.log('User:', {
  id: user.id,
  teamId: user.teamId,
  roleId: user.roleId,
});

console.log('Record:', {
  id: record.id,
  createdBy: record.createdBy,
  createdAt: record.createdAt,
  assignedUser: record.assignedUser,
});

console.log('Permission Config:', userConfig);

console.log('Calculated Permission:', calculatePermission(user, record, 'update'));
```

---

#### Issue 3: Too many permissions

**Problem**: User có quyền quá nhiều

**Causes**:

1. ❌ Permission = "all" cho role thấp
2. ❌ No time limit on sensitive actions
3. ❌ Wrong team/role assignment

**Fix**:

```javascript
// Review and tighten permissions
{
  "roleId": "role_staff",
  "actions": [
    // BAD
    { "actionId": "delete", "permission": "all" }

    // GOOD
    { "actionId": "delete", "permission": "not_allowed" }
  ]
}
```

---

## 10. KẾT LUẬN

### Summary

**Hệ thống Phân quyền** bao gồm 3 layers:

```
┌────────────────────────────────────────────┐
│ Layer 1: Actions Definition                │
│ → Define what can be done                  │
└────────────────────────────────────────────┘
                  ↓
┌────────────────────────────────────────────┐
│ Layer 2: Permissions Config                │
│ → Define who can do what                   │
└────────────────────────────────────────────┘
                  ↓
┌────────────────────────────────────────────┐
│ Layer 3: Record Permissions                │
│ → Calculated for each record & user        │
└────────────────────────────────────────────┘
```

**Key Concepts**:

1. **Actions** = Các hành động có thể thực hiện
2. **Permissions Config** = Quy tắc phân quyền theo Team/Role
3. **Record Permissions** = Kết quả tính toán cho từng record/user
4. **Permission Values** = Điều kiện cụ thể (all, self_created, assigned_user, etc.)

**Benefits**:

- ✅ Fine-grained access control
- ✅ Time-based restrictions
- ✅ Team collaboration support
- ✅ Flexible custom actions
- ✅ Secure by default

**Use Cases**:

- CRM systems
- Order management
- Project management
- Document workflows
- Approval processes

---

**Document Created**: 05/11/2025  
**Author**: Business Analyst  
**Status**: ✅ Complete  
**Version**: 1.0
