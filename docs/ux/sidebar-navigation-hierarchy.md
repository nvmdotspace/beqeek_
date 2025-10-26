# Sidebar Navigation Hierarchy

## Tổng quan
Tài liệu này định nghĩa cấu trúc phân cấp navigation cho sidebar, từ high-level organization đến chi tiết implementation.

## 1. Hierarchical Structure Overview

```
Sidebar Navigation
├── Workspace Selector (Level 0)
├── Global Navigation (Level 1)
├── Quick Actions (Level 2 - Contextual)
├── Workspace Features (Level 2 - Primary)
├── Workspace Organization (Level 3 - Secondary)
└── Footer Actions (Level 4 - Utility)
```

## 2. Detailed Navigation Hierarchy

### 2.1 Level 0: Workspace Selector
```yaml
Purpose: Context switching và workspace identification
Position: Top of sidebar
Behavior: Always visible, collapsible dropdown

Structure:
Workspace Selector
├── Current Workspace Display
│   ├── Workspace Icon/Avatar
│   ├── Workspace Name
│   ├── Workspace Type Badge
│   └── Dropdown Indicator
└── Workspace Dropdown
    ├── Workspace List
    │   ├── Recent Workspaces (max 5)
    │   ├── All Workspaces (alphabetical)
    │   └── Workspace Search
    ├── Workspace Actions
    │   ├── Create New Workspace
    │   ├── Join Workspace
    │   └── Workspace Settings
    └── User Context
        ├── Switch Account
        └── Manage Organizations
```

### 2.2 Level 1: Global Navigation
```yaml
Purpose: Cross-workspace features và global actions
Position: Below workspace selector
Behavior: Always visible, independent of workspace

Structure:
Global Navigation
├── Dashboard
│   ├── Overview
│   ├── Recent Activity
│   └── Cross-workspace Analytics
├── Search
│   ├── Global Search
│   ├── Advanced Filters
│   └── Saved Searches
├── Notifications
│   ├── Unread Count Badge
│   ├── Notification Types
│   └── Notification Settings
└── Help & Support
    ├── Documentation
    ├── Tutorials
    ├── Contact Support
    └── Feature Requests
```

### 2.3 Level 2: Quick Actions (Contextual)
```yaml
Purpose: Frequent workspace-specific actions
Position: Below global navigation
Behavior: Conditional on workspace selection
Visibility: Hidden when no workspace selected

Structure:
Quick Actions
├── Primary Actions
│   ├── New Table
│   │   ├── From Template
│   │   ├── From Scratch
│   │   └── Import Data
│   ├── New Workflow
│   │   ├── From Template
│   │   ├── Automation Builder
│   │   └── Event Trigger
│   └── New Form
│       ├── Contact Form
│       ├── Survey Form
│       └── Custom Form
├── Secondary Actions
│   ├── Import/Export
│   ├── Bulk Operations
│   └── Data Migration
└── Templates
    ├── Browse Templates
    ├── My Templates
    └── Community Templates
```

### 2.4 Level 2: Workspace Features (Primary)
```yaml
Purpose: Core workspace functionality
Position: Main content area
Behavior: Primary navigation for workspace features
Visibility: Conditional on workspace selection và permissions

Structure:
Workspace Features
├── Active Tables
│   ├── Table List
│   │   ├── Recent Tables (max 5)
│   │   ├── Starred Tables
│   │   ├── All Tables (categorized)
│   │   └── Table Search
│   ├── Table Actions
│   │   ├── Create Table
│   │   ├── Import Data
│   │   ├── Table Templates
│   │   └── Bulk Operations
│   ├── Table Analytics
│   │   ├── Usage Statistics
│   │   ├── Performance Metrics
│   │   └── Data Quality
│   └── Table Settings
│       ├── Permissions
│       ├── Integrations
│       └── Backup/Restore
├── Workflow
│   ├── Workflow Builder
│   │   ├── Visual Designer
│   │   ├── Code Editor
│   │   └── Template Library
│   ├── Workflow Management
│   │   ├── Active Workflows
│   │   ├── Scheduled Workflows
│   │   ├── Failed Workflows
│   │   └── Workflow History
│   ├── Event System
│   │   ├── Event Triggers
│   │   ├── Event Handlers
│   │   ├── Event Logs
│   │   └── Event Analytics
│   ├── Forms & Connectors
│   │   ├── Form Designer
│   │   ├── Form Submissions
│   │   ├── API Connectors
│   │   └── Integration Hub
│   └── Work Groups
│       ├── Group Management
│       ├── Task Assignment
│       ├── Progress Tracking
│       └── Collaboration Tools
├── Team Management
│   ├── Team Members
│   │   ├── Member List
│   │   ├── Member Roles
│   │   ├── Member Activity
│   │   └── Member Invitations
│   ├── Team Structure
│   │   ├── Departments
│   │   ├── Teams
│   │   ├── Reporting Lines
│   │   └── Organizational Chart
│   ├── Collaboration
│   │   ├── Team Chat
│   │   ├── Shared Resources
│   │   ├── Meeting Scheduler
│   │   └── Project Boards
│   └── Team Analytics
│       ├── Productivity Metrics
│       ├── Collaboration Stats
│       └── Performance Reports
├── Roles & Permissions
│   ├── Role Management
│   │   ├── Default Roles
│   │   ├── Custom Roles
│   │   ├── Role Templates
│   │   └── Role Assignment
│   ├── Permission Matrix
│   │   ├── Feature Permissions
│   │   ├── Data Permissions
│   │   ├── Administrative Rights
│   │   └── API Access
│   ├── Access Control
│   │   ├── IP Restrictions
│   │   ├── Time-based Access
│   │   ├── Device Management
│   │   └── Session Control
│   └── Audit & Compliance
│       ├── Access Logs
│       ├── Permission Changes
│       ├── Compliance Reports
│       └── Security Alerts
└── Analytics & Reporting
    ├── Dashboard Builder
    │   ├── Widget Library
    │   ├── Custom Dashboards
    │   ├── Shared Dashboards
    │   └── Dashboard Templates
    ├── Data Analytics
    │   ├── Table Analytics
    │   ├── Workflow Analytics
    │   ├── User Analytics
    │   └── Performance Analytics
    ├── Reporting Engine
    │   ├── Report Builder
    │   ├── Scheduled Reports
    │   ├── Report Templates
    │   └── Export Options
    └── Business Intelligence
        ├── KPI Tracking
        ├── Trend Analysis
        ├── Predictive Analytics
        └── Data Visualization
```

### 2.5 Level 3: Workspace Organization (Secondary)
```yaml
Purpose: Content organization và personal productivity
Position: Below primary features
Behavior: Personal workspace organization
Visibility: Always visible when workspace selected

Structure:
Workspace Organization
├── Starred Items
│   ├── Starred Tables
│   ├── Starred Workflows
│   ├── Starred Reports
│   └── Starred Dashboards
├── Recent Activity
│   ├── Recently Viewed
│   ├── Recently Modified
│   ├── Recently Created
│   └── Activity Timeline
├── Archived Items
│   ├── Archived Tables
│   ├── Archived Workflows
│   ├── Archived Projects
│   └── Archive Management
├── Personal Collections
│   ├── My Bookmarks
│   ├── My Templates
│   ├── My Dashboards
│   └── My Reports
└── Workspace Insights
    ├── Usage Summary
    ├── Productivity Metrics
    ├── Collaboration Stats
    └── Personal Goals
```

### 2.6 Level 4: Footer Actions (Utility)
```yaml
Purpose: System-level actions và user management
Position: Bottom of sidebar
Behavior: Always visible, minimal space

Structure:
Footer Actions
├── User Profile
│   ├── Profile Picture
│   ├── User Name
│   ├── User Status
│   └── Profile Dropdown
│       ├── Profile Settings
│       ├── Account Preferences
│       ├── Billing & Plans
│       ├── API Keys
│       └── Sign Out
├── System Settings
│   ├── Theme Toggle
│   ├── Language Selector
│   ├── Notification Settings
│   └── Accessibility Options
├── Help & Support
│   ├── Documentation
│   ├── Keyboard Shortcuts
│   ├── Contact Support
│   └── Feature Feedback
└── System Status
    ├── Connection Status
    ├── Sync Status
    ├── Version Info
    └── System Health
```

## 3. Responsive Behavior

### 3.1 Desktop (>= 1024px)
```yaml
Layout: Full sidebar (280px width)
Behavior: All levels visible
Interaction: Hover states, tooltips
Collapse: Optional sidebar collapse to icons only

Hierarchy Display:
├── Full text labels
├── Icons + text
├── Nested navigation
├── Expandable sections
└── Rich tooltips
```

### 3.2 Tablet (768px - 1023px)
```yaml
Layout: Collapsible sidebar (240px width)
Behavior: Auto-collapse on content interaction
Interaction: Touch-friendly targets
Collapse: Automatic on route change

Hierarchy Display:
├── Condensed text labels
├── Icons + abbreviated text
├── Simplified nesting
├── Accordion-style sections
└── Essential tooltips
```

### 3.3 Mobile (< 768px)
```yaml
Layout: Overlay sidebar (full width)
Behavior: Hidden by default, overlay on open
Interaction: Touch gestures, swipe to close
Collapse: Always collapsed, opens as overlay

Hierarchy Display:
├── Large touch targets
├── Simplified navigation
├── Single-level sections
├── Essential features only
└── No tooltips (use labels)
```

## 4. Navigation States

### 4.1 State Hierarchy
```typescript
interface NavigationState {
  // Global States
  isCollapsed: boolean;
  isMobile: boolean;
  isLoading: boolean;
  
  // Workspace States
  hasWorkspace: boolean;
  workspaceId: string | null;
  workspacePermissions: Permission[];
  
  // Section States
  expandedSections: string[];
  activeSection: string;
  activeItem: string;
  
  // User States
  userRole: UserRole;
  userPreferences: UserPreferences;
  
  // System States
  connectionStatus: 'online' | 'offline' | 'syncing';
  notificationCount: number;
  hasUpdates: boolean;
}
```

### 4.2 State Transitions
```yaml
No Workspace Selected:
├── Show: Workspace Selector, Global Navigation, Footer
├── Hide: Quick Actions, Workspace Features, Organization
└── State: Prompt user to select workspace

Workspace Selected:
├── Show: All navigation levels
├── Load: Workspace-specific data
├── Filter: Based on permissions
└── State: Full navigation available

Loading States:
├── Skeleton: Show loading placeholders
├── Progressive: Load sections incrementally
├── Fallback: Show cached data while loading
└── Error: Show error states with retry options

Permission Changes:
├── Dynamic: Update navigation in real-time
├── Graceful: Hide restricted sections smoothly
├── Feedback: Show permission denied messages
└── Recovery: Restore access when permissions granted
```

## 5. Accessibility Hierarchy

### 5.1 Semantic Structure
```html
<nav role="navigation" aria-label="Main navigation">
  <!-- Level 0: Workspace Selector -->
  <section aria-label="Workspace selector">
    <button aria-expanded="false" aria-haspopup="listbox">
      Current workspace
    </button>
  </section>
  
  <!-- Level 1: Global Navigation -->
  <section aria-label="Global navigation">
    <ul role="menubar">
      <li role="menuitem">Dashboard</li>
      <li role="menuitem">Search</li>
    </ul>
  </section>
  
  <!-- Level 2: Quick Actions -->
  <section aria-label="Quick actions">
    <ul role="toolbar">
      <li role="button">New Table</li>
      <li role="button">New Workflow</li>
    </ul>
  </section>
  
  <!-- Level 2: Workspace Features -->
  <section aria-label="Workspace features">
    <ul role="tree">
      <li role="treeitem" aria-expanded="true">
        <span>Active Tables</span>
        <ul role="group">
          <li role="treeitem">Table 1</li>
        </ul>
      </li>
    </ul>
  </section>
</nav>
```

### 5.2 Keyboard Navigation
```yaml
Tab Order:
1. Workspace Selector
2. Global Navigation (sequential)
3. Quick Actions (sequential)
4. Workspace Features (tree navigation)
5. Organization (sequential)
6. Footer Actions (sequential)

Keyboard Shortcuts:
- Tab/Shift+Tab: Navigate between sections
- Arrow Keys: Navigate within sections
- Enter/Space: Activate items
- Escape: Close dropdowns/overlays
- Alt+1-9: Quick section access
- Ctrl+K: Global search
- Ctrl+Shift+N: New item (context-aware)
```

## 6. Performance Considerations

### 6.1 Rendering Optimization
```yaml
Virtual Scrolling:
- Large lists (>100 items)
- Table lists, workflow lists
- Member lists, activity logs

Lazy Loading:
- Section content on expand
- Badge counts on demand
- Secondary navigation items

Memoization:
- Navigation item components
- Permission calculations
- State selectors
```

### 6.2 Data Loading Strategy
```yaml
Critical Path:
1. User authentication
2. Workspace list
3. Current workspace permissions
4. Primary navigation items

Progressive Enhancement:
1. Badge counts
2. Recent items
3. Secondary features
4. Analytics data

Background Loading:
1. Template libraries
2. Activity logs
3. System notifications
4. Feature updates
```

## 7. Future Extensibility

### 7.1 Plugin Architecture
```typescript
interface NavigationPlugin {
  id: string;
  name: string;
  level: NavigationLevel;
  position: number;
  permissions: Permission[];
  component: React.ComponentType;
  routes: Route[];
}

// Plugin registration
const registerNavigationPlugin = (plugin: NavigationPlugin) => {
  // Validate plugin
  // Insert into hierarchy
  // Update routing
  // Refresh navigation
};
```

### 7.2 Customization Framework
```yaml
User Customization:
- Reorder navigation items
- Hide/show sections
- Create custom shortcuts
- Personalize quick actions

Admin Customization:
- Configure available features
- Set default navigation
- Create role-based views
- Brand navigation elements

Developer Customization:
- Add custom sections
- Integrate third-party tools
- Create navigation extensions
- Build custom workflows
```

## Kết luận

Cấu trúc navigation hierarchy này cung cấp:

1. **Clear Organization**: Logical grouping từ global đến specific
2. **Scalable Architecture**: Dễ dàng thêm features mới
3. **User-Centric Design**: Prioritize theo user workflow
4. **Responsive Adaptation**: Optimal trên mọi device
5. **Accessibility Compliance**: WCAG 2.1 AA standards
6. **Performance Optimized**: Lazy loading và efficient rendering
7. **Future-Proof**: Plugin architecture cho extensibility

Navigation trở thành backbone của user experience, guiding users through complex workflows một cách intuitive và efficient.