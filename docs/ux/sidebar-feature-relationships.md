# Sidebar Feature Relationships Analysis

## Tổng quan
Tài liệu này phân tích các mối quan hệ giữa các features trong hệ thống BEQEEK để thiết kế sidebar phù hợp với cấu trúc dữ liệu và luồng người dùng.

## Phân tích từ API Structure

### 1. Cấu trúc phân cấp chính

```
Global Level (Không cần workspaceId)
├── Authentication (/api/auth/*)
├── User Registration (/api/register)
├── User Lookup (/api/user/get/users/via-username/{username})
└── Workflow Templates (/api/templates)

User Level
├── My Workspaces (/api/user/me/get/workspaces)
└── User Profile Management

Workspace Level (/api/workspace/{workspaceId}/*)
├── Workspace Details
├── Teams Management
├── Active Tables
│   ├── Table CRUD Operations
│   ├── Records Management
│   ├── Comments System
│   └── Actions/Automation
├── Workflow System
│   ├── Workflow Units
│   ├── Events Management
│   ├── Forms
│   └── Connectors
└── Work Groups
```

### 2. Quan hệ phụ thuộc chính

#### 2.1 Workspace Dependencies
- **Tất cả features chính** đều phụ thuộc vào việc chọn workspace
- **Active Tables** là core feature của mỗi workspace
- **Teams & Roles** quản lý quyền truy cập trong workspace
- **Workflow** tự động hóa các quy trình trong workspace

#### 2.2 Active Tables Dependencies
```
Active Tables
├── Records (Dữ liệu chính)
├── Comments (Tương tác trên records)
├── Actions (Automation rules)
└── Fields Configuration
```

#### 2.3 Workflow Dependencies
```
Workflow System
├── Workflow Units (Logic blocks)
├── Events (Triggers)
├── Forms (Data input)
├── Connectors (External integrations)
└── Work Groups (Execution context)
```

#### 2.4 Team & Permission Dependencies
```
Workspace Access Control
├── Teams (Nhóm người dùng)
├── Roles (Quyền hạn)
├── User Assignment
└── Resource Permissions
```

### 3. Navigation Flow Analysis

#### 3.1 User Journey Patterns
1. **Workspace Selection** → Feature Access
2. **Active Tables** → Records → Comments/Actions
3. **Workflow** → Units → Events → Forms
4. **Team Management** → Roles → Permissions

#### 3.2 Cross-Feature Relationships
- **Active Tables ↔ Workflow**: Tables có thể trigger workflows
- **Teams ↔ Active Tables**: Teams có quyền truy cập tables
- **Workflow ↔ Forms**: Forms thu thập data cho workflows
- **Work Groups ↔ Teams**: Work groups organize team workflows

### 4. Sidebar Design Implications

#### 4.1 Hierarchical Structure
```
Sidebar Navigation
├── Workspace Selector (Required first)
├── Global Navigation
│   ├── Dashboard
│   ├── Search
│   └── Notifications
├── Quick Actions (Workspace-dependent)
│   ├── New Table
│   ├── New Workflow
│   └── Invite Team
├── Workspace Features
│   ├── Active Tables (Primary)
│   ├── Workflow (Secondary)
│   ├── Team Management
│   ├── Roles & Permissions
│   ├── Analytics
│   └── Activity Logs
└── Organization
    ├── Starred Items
    └── Archived Items
```

#### 4.2 Conditional Navigation
- **No Workspace Selected**: Chỉ hiển thị Global Navigation + Workspace Selector
- **Workspace Selected**: Hiển thị full navigation với workspace-specific features
- **Permission-based**: Một số features chỉ hiển thị với quyền phù hợp

### 5. Feature Priority & Grouping

#### 5.1 Primary Features (Always visible)
- Active Tables
- Workflow
- Team Management

#### 5.2 Secondary Features (Contextual)
- Analytics
- Activity Logs
- Roles & Permissions

#### 5.3 Utility Features
- Search
- Notifications
- Settings

### 6. State Management Requirements

#### 6.1 Current Workspace State
```typescript
interface WorkspaceState {
  currentWorkspace: Workspace | null;
  isWorkspaceSelected: boolean;
  userPermissions: Permission[];
}
```

#### 6.2 Navigation State
```typescript
interface NavigationState {
  activeSection: string;
  expandedSections: string[];
  recentItems: NavigationItem[];
}
```

### 7. Responsive Behavior

#### 7.1 Desktop (>1024px)
- Full sidebar với tất cả sections
- Collapsible sidebar
- Hover tooltips khi collapsed

#### 7.2 Tablet (768px - 1024px)
- Overlay sidebar
- Simplified navigation
- Touch-friendly interactions

#### 7.3 Mobile (<768px)
- Bottom navigation cho primary features
- Drawer sidebar cho secondary features
- Gesture-based navigation

### 8. Performance Considerations

#### 8.1 Lazy Loading
- Workspace data chỉ load khi cần
- Navigation items load theo permission
- Recent items cache locally

#### 8.2 Caching Strategy
- Workspace list cache 5 minutes
- Permission cache 10 minutes
- Navigation state persist locally

### 9. Accessibility Requirements

#### 9.1 Keyboard Navigation
- Tab order logical
- Arrow keys cho navigation
- Enter/Space cho activation

#### 9.2 Screen Reader Support
- Proper ARIA labels
- Navigation landmarks
- State announcements

### 10. Future Extensibility

#### 10.1 Plugin Architecture
- Sidebar sections có thể extend
- Custom navigation items
- Third-party integrations

#### 10.2 Customization
- User-defined section order
- Collapsible sections
- Favorite items pinning

## Kết luận

Sidebar design phải phản ánh đúng cấu trúc phân cấp của hệ thống:
1. **Workspace-centric**: Mọi feature chính đều phụ thuộc workspace
2. **Permission-aware**: Navigation thay đổi theo quyền user
3. **Context-sensitive**: Quick actions và features hiển thị theo context
4. **Scalable**: Dễ dàng thêm features mới mà không phá vỡ UX

Thiết kế này đảm bảo user có thể navigate hiệu quả trong hệ thống phức tạp với nhiều features và levels of access.