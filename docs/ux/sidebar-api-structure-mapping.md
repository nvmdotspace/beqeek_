# Sidebar API Structure Mapping

## Tổng quan
Tài liệu này mapping chi tiết giữa API endpoints và sidebar navigation items, đảm bảo sidebar phản ánh đúng cấu trúc backend và quyền truy cập.

## API Endpoint Analysis

### 1. Global APIs (Không cần workspaceId)

#### 1.1 Authentication APIs
```yaml
Endpoints:
- POST /api/auth/post/authenticate
- POST /api/register  
- POST /api/auth/post/refresh_token

Sidebar Mapping:
→ Không hiển thị trong sidebar (handled by auth flow)
→ Ảnh hưởng đến user state và permissions
```

#### 1.2 User Management APIs
```yaml
Endpoints:
- GET /api/user/me/get/workspaces
- GET /api/user/get/users/via-username/{username}

Sidebar Mapping:
→ Workspace Selector dropdown
→ User profile section
→ Team member lookup functionality
```

#### 1.3 Global Templates
```yaml
Endpoints:
- GET /api/templates

Sidebar Mapping:
→ Quick Actions: "Browse Templates"
→ Workflow section: "Template Library"
```

### 2. Workspace-Level APIs

#### 2.1 Workspace Management
```yaml
Endpoints:
- GET /api/workspace/{workspaceId}
- GET /api/workspace/{workspaceId}/teams

Sidebar Mapping:
Navigation Section: "Workspace Features"
├── Workspace Settings
└── Team Management
```

#### 2.2 Active Tables APIs
```yaml
Base Path: /api/workspace/{workspaceId}/workflow/

Table Management:
- GET /active_tables (List tables)
- GET /active_tables/{tableId} (Table details)
- POST /active_tables (Create table)
- PUT /active_tables/{tableId} (Update table)
- DELETE /active_tables/{tableId} (Delete table)

Records Management:
- GET /active_tables/{tableId}/records
- GET /active_tables/{tableId}/records/{recordId}
- POST /active_tables/{tableId}/records
- PUT /active_tables/{tableId}/records/{recordId}
- DELETE /active_tables/{tableId}/records/{recordId}

Comments System:
- GET /active_tables/{tableId}/records/{recordId}/comments
- POST /active_tables/{tableId}/records/{recordId}/comments
- PUT /active_tables/{tableId}/records/{recordId}/comments/{commentId}
- DELETE /active_tables/{tableId}/records/{recordId}/comments/{commentId}

Actions/Automation:
- GET /active_tables/{tableId}/actions
- POST /active_tables/{tableId}/actions
- PUT /active_tables/{tableId}/actions/{actionId}
- DELETE /active_tables/{tableId}/actions/{actionId}

Sidebar Mapping:
Navigation Section: "Workspace Features"
├── Active Tables (Primary feature)
│   ├── Quick Actions: "New Table", "Import Data"
│   ├── Table List (from GET /active_tables)
│   ├── Recent Records
│   └── Table Templates
└── Analytics
    ├── Table Statistics
    └── Usage Reports
```

#### 2.3 Workflow System APIs
```yaml
Base Path: /api/workspace/{workspaceId}/workflow/

Workflow Units:
- GET /workflow_units
- GET /workflow_units/{workflowUnitId}
- POST /workflow_units
- PUT /workflow_units/{workflowUnitId}
- DELETE /workflow_units/{workflowUnitId}

Events Management:
- GET /events
- GET /events/{eventId}
- POST /events
- PUT /events/{eventId}
- DELETE /events/{eventId}

Forms:
- GET /forms
- GET /forms/{formId}
- POST /forms
- PUT /forms/{formId}
- DELETE /forms/{formId}

Connectors:
- GET /workflow_connectors
- GET /workflow_connectors/{connectorId}

Work Groups:
- GET /work_groups
- GET /work_groups/{workGroupId}
- POST /work_groups
- PUT /work_groups/{workGroupId}
- DELETE /work_groups/{workGroupId}

Sidebar Mapping:
Navigation Section: "Workspace Features"
├── Workflow (Secondary feature)
│   ├── Quick Actions: "New Workflow", "Browse Templates"
│   ├── Workflow Builder
│   ├── Event Triggers
│   ├── Form Designer
│   ├── Connectors Library
│   └── Work Groups
└── Activity Logs
    ├── Workflow Executions
    └── Event History
```

### 3. Sidebar Navigation Structure

#### 3.1 Complete Navigation Mapping
```typescript
interface SidebarNavigation {
  // Workspace Selector
  workspaceSelector: {
    api: "GET /api/user/me/get/workspaces",
    component: "WorkspaceDropdown",
    state: "currentWorkspace"
  },

  // Global Navigation
  globalNavigation: [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: "Home",
      apis: ["GET /api/user/me/get/workspaces"] // For workspace stats
    },
    {
      title: "Search",
      href: "/search", 
      icon: "Search",
      apis: ["GET /api/workspace/{workspaceId}/workflow/active_tables"] // Search across tables
    },
    {
      title: "Notifications",
      href: "/notifications",
      icon: "Bell",
      apis: [] // Real-time notifications
    }
  ],

  // Quick Actions (Workspace-dependent)
  quickActions: [
    {
      title: "New Table",
      action: "createTable",
      icon: "Plus",
      api: "POST /api/workspace/{workspaceId}/workflow/active_tables"
    },
    {
      title: "New Workflow", 
      action: "createWorkflow",
      icon: "GitBranch",
      api: "POST /api/workspace/{workspaceId}/workflow/workflow_units"
    },
    {
      title: "New Form",
      action: "createForm", 
      icon: "FileText",
      api: "POST /api/workspace/{workspaceId}/workflow/forms"
    }
  ],

  // Workspace Features
  workspaceFeatures: [
    {
      title: "Active Tables",
      href: "/workspace/{workspaceId}/tables",
      icon: "Database",
      apis: [
        "GET /api/workspace/{workspaceId}/workflow/active_tables",
        "GET /api/workspace/{workspaceId}/workflow/active_tables/{tableId}/records"
      ],
      badge: "tableCount"
    },
    {
      title: "Workflow",
      href: "/workspace/{workspaceId}/workflow", 
      icon: "Workflow",
      apis: [
        "GET /api/workspace/{workspaceId}/workflow/workflow_units",
        "GET /api/workspace/{workspaceId}/workflow/events"
      ],
      badge: "activeWorkflows"
    },
    {
      title: "Team",
      href: "/workspace/{workspaceId}/team",
      icon: "Users", 
      apis: [
        "GET /api/workspace/{workspaceId}/teams"
      ],
      badge: "memberCount"
    },
    {
      title: "Roles",
      href: "/workspace/{workspaceId}/roles",
      icon: "Shield",
      apis: [] // Role management APIs
    },
    {
      title: "Analytics", 
      href: "/workspace/{workspaceId}/analytics",
      icon: "Activity",
      apis: [] // Analytics APIs
    }
  ],

  // Organization
  organization: [
    {
      title: "Starred",
      href: "/workspace/{workspaceId}/starred", 
      icon: "Star",
      apis: [] // User preferences
    },
    {
      title: "Archived",
      href: "/workspace/{workspaceId}/archived",
      icon: "Archive", 
      apis: [] // Archived items
    }
  ]
}
```

### 4. Permission-Based Navigation

#### 4.1 API Permission Mapping
```yaml
Read Permissions:
- GET endpoints → View navigation items
- List endpoints → Show counts/badges

Write Permissions:  
- POST endpoints → Show "Create" actions
- PUT endpoints → Show "Edit" actions
- DELETE endpoints → Show "Delete" actions

Admin Permissions:
- Workspace management → Show workspace settings
- Team management → Show team/role sections
- System settings → Show admin sections
```

#### 4.2 Dynamic Navigation Logic
```typescript
interface NavigationPermissions {
  canViewTables: boolean;      // GET /active_tables
  canCreateTables: boolean;    // POST /active_tables  
  canManageWorkflow: boolean;  // POST /workflow_units
  canManageTeam: boolean;      // GET /teams
  canManageRoles: boolean;     // Role management
  isWorkspaceAdmin: boolean;   // Full workspace access
}

// Navigation items filter based on permissions
const getVisibleNavigation = (permissions: NavigationPermissions) => {
  return navigationItems.filter(item => {
    switch(item.section) {
      case 'tables':
        return permissions.canViewTables;
      case 'workflow': 
        return permissions.canManageWorkflow;
      case 'team':
        return permissions.canManageTeam;
      case 'roles':
        return permissions.canManageRoles;
      default:
        return true;
    }
  });
};
```

### 5. Real-time Updates

#### 5.1 WebSocket Integration
```yaml
Real-time Events:
- workspace.updated → Refresh workspace selector
- table.created → Update table count badge
- workflow.executed → Update activity logs
- team.member_added → Update team count
- notification.new → Update notification badge

Sidebar Updates:
- Badge counts refresh automatically
- Navigation items update based on permissions
- Recent items list updates with user activity
```

#### 5.2 Cache Strategy
```typescript
interface SidebarCache {
  workspaces: {
    data: Workspace[];
    expiry: number; // 5 minutes
  };
  
  tableCount: {
    [workspaceId: string]: number;
    expiry: number; // 2 minutes  
  };
  
  permissions: {
    [workspaceId: string]: NavigationPermissions;
    expiry: number; // 10 minutes
  };
}
```

### 6. Error Handling

#### 6.1 API Error Mapping
```yaml
403 Forbidden:
→ Hide navigation item
→ Show permission denied message

404 Not Found:
→ Remove from navigation
→ Redirect to parent section

500 Server Error:
→ Show error state
→ Retry mechanism

Network Error:
→ Show offline indicator
→ Cache last known state
```

### 7. Performance Optimization

#### 7.1 Lazy Loading Strategy
```typescript
// Load navigation data progressively
const navigationLoader = {
  immediate: [
    'GET /api/user/me/get/workspaces', // Workspace selector
  ],
  
  onWorkspaceSelect: [
    'GET /api/workspace/{workspaceId}', // Workspace details
    'GET /api/workspace/{workspaceId}/teams', // Team info
  ],
  
  onSectionExpand: [
    'GET /api/workspace/{workspaceId}/workflow/active_tables', // Table list
    'GET /api/workspace/{workspaceId}/workflow/workflow_units', // Workflow list
  ]
};
```

#### 7.2 Bundle Optimization
```yaml
Critical Navigation:
- Workspace selector
- Primary navigation items
- Permission checks

Lazy Loaded:
- Badge counts
- Recent items
- Secondary features
```

## Kết luận

Mapping này đảm bảo:

1. **API Consistency**: Mỗi navigation item tương ứng với specific API endpoints
2. **Permission Alignment**: Navigation hiển thị đúng với quyền user từ API
3. **Performance**: Lazy loading và caching optimize cho UX
4. **Real-time**: WebSocket updates keep sidebar current
5. **Error Resilience**: Graceful handling khi API fails

Sidebar trở thành reflection chính xác của backend capabilities và user permissions.