# Workspaces Detail Module - Technical Documentation

## 1. Tổng quan module

File `workspaces-detail.blade.php` là một module quản lý workspace hoàn chỉnh trong Laravel, cung cấp giao diện quản lý workspaces, teams, roles và users với hệ thống routing và API calls được xây dựng chuyên nghiệp.

## 2. Cấu trúc giao diện theo loại hiển thị

### 2.1 Detail View (`detail-view`)

**Mục đích**: Hiển thị chi tiết workspace và quản lý teams, users

**Cấu trúc HTML:**

```html
<div id="detail-view" class="detail-view" style="display: none; height: 100vh; width: 100%; overflow: hidden;">
  <!-- Header Section -->
  <div class="detail-header">
    <h2>Cài đặt</h2>
    <h2 id="detail-name" class="detail-name"></h2>
    <span class="material-icons edit-icon" onclick="openWorkspaceForm('edit')">edit</span>
    <span id="detail-namespace" class="detail-description"></span>
    <button class="btn btn-destructive" onclick="deleteWorkspace()">
      <span class="material-icons">delete</span>
    </button>
  </div>

  <!-- Content Sections -->
  <div class="section" id="team-section">
    <h3>Đội nhóm</h3>
    <button class="btn btn-primary btn-create" onclick="openTeamForm('create')">Tạo đội nhóm mới</button>
    <div id="team-list"></div>
  </div>

  <div class="section" id="user-section">
    <h3>Thành viên</h3>
    <button class="btn btn-primary btn-create" onclick="DetailView.openUserForm('create')">Thêm thành viên</button>
    <div id="user-list"></div>
  </div>
</div>
```

**Cách hiển thị dữ liệu:**

- **Workspace Info**: Tên workspace và namespace được load từ API và hiển thị trong header
- **Teams List**: Danh sách teams với tên, mô tả và nút xóa
- **Users List**: Danh sách users với fullName, username và team-role mapping

**Render method:**

```javascript
static async render(workspaceId) {
    // 1. Load workspace details
    this.currentWorkspace = await WorkspaceAPI.fetchWorkspaceDetails(workspaceId);

    // 2. Load teams
    this.teams = await WorkspaceAPI.fetchTeams(workspaceId);

    // 3. Load users with team-role mapping
    this.users = await WorkspaceAPI.fetchUsers(workspaceId);

    // 4. Render HTML với dữ liệu đã load
    CommonUtils.hideRaptorRippleByElementById('team-list', teamsHTML);
    CommonUtils.hideRaptorRippleByElementById('user-list', usersHTML);
}
```

### 2.2 Team View (`team-view`)

**Mục đích**: Hiển thị chi tiết một team cụ thể với roles và members

**Cấu trúc HTML:**

```html
<div id="team-view" class="team-view" style="display: none; height: 100vh; width: 100%; overflow: hidden;">
  <!-- Header with back button -->
  <div class="detail-header">
    <button class="btn btn-back" onclick="CommonUtils.navigateToDetail(workspaceId)">
      <span class="material-icons">arrow_back</span>
    </button>
    <h2 id="team-name" class="detail-name"></h2>
  </div>

  <!-- Role Section -->
  <div class="section" id="team-role-section">
    <h3>Vai trò</h3>
    <button class="btn btn-primary btn-create" onclick="openRoleForm('create')">Tạo vai trò mới</button>
    <div id="team-role-list"></div>
  </div>

  <!-- Team Users Section -->
  <div class="section" id="team-user-section">
    <h3>Thành viên</h3>
    <button class="btn btn-primary btn-create" onclick="TeamView.openUserForm('create')">Thêm thành viên</button>
    <div id="team-user-list"></div>
  </div>
</div>
```

**Render method:**

```javascript
static async render(workspaceId, teamId) {
    // 1. Load workspace và team details
    this.currentWorkspace = await WorkspaceAPI.fetchWorkspaceDetails(workspaceId);
    this.currentTeam = await WorkspaceAPI.fetchTeamDetails(workspaceId, teamId);

    // 2. Load roles cho team này
    this.roles = await WorkspaceAPI.fetchTeamRoles(workspaceId, teamId);

    // 3. Load users thuộc team này
    this.users = await WorkspaceAPI.fetchTeamUsers(workspaceId, teamId);

    // 4. Render HTML
    CommonUtils.hideRaptorRippleByElementById('team-role-list', rolesHTML);
    CommonUtils.hideRaptorRippleByElementById('team-user-list', usersHTML);
}
```

### 2.3 Popup Forms

**Các loại form:**

1. **Workspace Form** (`workspace-form`): Tạo/sửa workspace
2. **Team Form** (`team-form`): Tạo/sửa team
3. **Role Form** (`role-form`): Tạo/sửa role
4. **User Form** (`user-form`): Thêm user mới hoặc mời user hiện có

**Cấu trúc chung:**

```html
<div class="popup-overlay" id="popup-overlay">
  <div class="popup">
    <h2 id="popup-title"></h2>
    <div id="[form-type]-form">
      <div class="popup-form">
        <!-- Dynamic form fields -->
      </div>
    </div>
    <div class="popup-actions">
      <button class="btn btn-secondary" onclick="closePopup()">Hủy</button>
      <button class="btn btn-primary" onclick="confirmAction()">Xác nhận</button>
    </div>
  </div>
</div>
```

## 3. Hệ thống API Calls chi tiết

### 3.1 Cấu hình API

```javascript
// Constants
const API_BASE_URL = {!! isset($apiBaseUrl) ? "'" . $apiBaseUrl . "'" : 'window.location.origin' !!};
const WORKSPACE_API_PREFIX = `/workspace`;
const USER_API_PREFIX = `/user`;

// Authentication headers
const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${Auth.getAuthToken()}`,
    'X-Encrypted': 'pyu1_glxqd_zby_oy_dypqs_u23w5q7l'
};
```

### 3.2 Workspace API Calls

#### **Get Workspace Details**

```javascript
// Endpoint: GET /api/user/me/get/workspaces/{workspaceId}
// Headers: Authorization: Bearer {token}, X-Encrypted: {encrypted_key}
// Query params: fields=id,workspaceName,namespace,ownedBy,logo,thumbnailLogo,createdAt,updatedAt,ownedByUser,myWorkspaceUser

static async fetchWorkspaceDetails(workspaceId) {
    const response = await CommonUtils.apiCall(`/user/me/get/workspaces/${workspaceId}`, {
        queries: {
            fields: 'id,workspaceName,namespace,ownedBy,logo,thumbnailLogo,createdAt,updatedAt,ownedByUser,myWorkspaceUser'
        }
    });
    return response.data;
}
```

#### **Create Workspace**

```javascript
// Endpoint: POST /api/workspace/post/workspaces
// Body: { workspaceName: string, namespace: string }

static async createWorkspace(data) {
    const response = await CommonUtils.apiCall(`${WORKSPACE_API_PREFIX}/post/workspaces`, { data });
    return { message: response.message, id: response.data.id };
}
```

#### **Update Workspace**

```javascript
// Endpoint: PATCH /api/workspace/patch/workspaces/{workspaceId}
// Body: { workspaceName: string, namespace: string }

static async updateWorkspace(workspaceId, data) {
    const response = await CommonUtils.apiCall(`${WORKSPACE_API_PREFIX}/patch/workspaces/${workspaceId}`, { data });
    return { message: response.message };
}
```

#### **Delete Workspace**

```javascript
// Endpoint: DELETE /api/workspace/delete/workspaces/{workspaceId}

static async deleteWorkspace(workspaceId) {
    const response = await CommonUtils.apiCall(`${WORKSPACE_API_PREFIX}/delete/workspaces/${workspaceId}`, {});
    return { message: response.message };
}
```

### 3.3 Team API Calls

#### **Get Teams List**

```javascript
// Endpoint: GET /api/workspace/{workspaceId}/workspace/get/p/teams
// Query params: fields=id,teamName,teamDescription,teamRoleIds,teamRoles{id,isDefault,workspaceTeamId,roleCode,roleName,roleDescription,createdBy,updatedBy,createdAt,updatedAt,labelIds}

static async fetchTeams(workspaceId) {
    const response = await CommonUtils.apiCall(`${WORKSPACE_API_PREFIX}/${workspaceId}/workspace/get/p/teams`, {
        queries: {
            fields: 'id,teamName,teamDescription,teamRoleIds,teamRoles{id,isDefault,workspaceTeamId,roleCode,roleName,roleDescription,createdBy,updatedBy,createdAt,updatedAt,labelIds}'
        }
    });
    return response.data;
}
```

#### **Get Team Details**

```javascript
// Endpoint: GET /api/workspace/{workspaceId}/workspace/get/teams/{teamId}

static async fetchTeamDetails(workspaceId, teamId) {
    const response = await CommonUtils.apiCall(`${WORKSPACE_API_PREFIX}/${workspaceId}/workspace/get/teams/${teamId}`, {
        queries: {
            fields: 'id,teamName,teamDescription,createdAt,updatedAt,createdByUser,teamRoleIds,teamRoles'
        }
    });
    return response.data;
}
```

#### **Create Team**

```javascript
// Endpoint: POST /api/workspace/{workspaceId}/workspace/post/teams
// Body: { teamName: string }

static async createTeam(workspaceId, data) {
    const response = await CommonUtils.apiCall(`${WORKSPACE_API_PREFIX}/${workspaceId}/workspace/post/teams`, { data });
    return { message: response.message, id: response.data.id };
}
```

### 3.4 Role API Calls

#### **Get Team Roles**

```javascript
// Endpoint: GET /api/workspace/{workspaceId}/workspace/get/p/team_roles
// Query params: constraints={workspaceTeamId: teamId}, fields=id,workspaceTeamId,roleCode,roleName,roleDescription

static async fetchTeamRoles(workspaceId, teamId) {
    const response = await CommonUtils.apiCall(`${WORKSPACE_API_PREFIX}/${workspaceId}/workspace/get/p/team_roles`, {
        constraints: { workspaceTeamId: teamId },
        queries: { fields: 'id,workspaceTeamId,roleCode,roleName,roleDescription' }
    });
    return response.data;
}
```

#### **Create Role**

```javascript
// Endpoint: POST /api/workspace/{workspaceId}/workspace/post/team_roles
// Constraints: { workspaceTeamId: teamId }
// Body: { roleName: string, roleDescription: string }

static async createTeamRole(workspaceId, teamId, data) {
    const response = await CommonUtils.apiCall(`${WORKSPACE_API_PREFIX}/${workspaceId}/workspace/post/team_roles`, {
        constraints: { workspaceTeamId: teamId },
        data: data
    });
    return { message: response.message, id: response.data.id };
}
```

### 3.5 User API Calls

#### **Get Users List**

```javascript
// Endpoint: GET /api/workspace/{workspaceId}/workspace/get/users
// Query params: fields=id,fullName,avatar,thumbnailAvatar,globalUser{username},workspaceMemberships{userId,workspaceTeamRoleId,workspaceTeamId,invitedAt},createdAt

static async fetchUsers(workspaceId) {
    const response = await CommonUtils.apiCall(`${WORKSPACE_API_PREFIX}/${workspaceId}/workspace/get/users`, {
        queries: {
            fields: 'id,fullName,avatar,thumbnailAvatar,globalUser{username},workspaceMemberships{userId,workspaceTeamRoleId,workspaceTeamId,invitedAt},createdAt'
        }
    });
    return response.data;
}
```

#### **Get Team-specific Users**

```javascript
// Endpoint: GET /api/workspace/{workspaceId}/workspace/get/users
// Query params: filtering={workspaceTeamRole: {workspaceTeamId: teamId}}

static async fetchTeamUsers(workspaceId, teamId) {
    const response = await CommonUtils.apiCall(`${WORKSPACE_API_PREFIX}/${workspaceId}/workspace/get/users`, {
        queries: {
            fields: 'id,fullName,avatar,thumbnailAvatar,globalUser{username},workspaceMemberships{userId,workspaceTeamRoleId,workspaceTeamId,invitedAt},createdAt',
            filtering: {
                workspaceTeamRole: {
                    workspaceTeamId: teamId
                }
            }
        }
    });
    return response.data;
}
```

#### **Find User by Username**

```javascript
// Endpoint: GET /api/user/get/users/via-username/{username}

static async fetchUserByUsername(username) {
    const response = await CommonUtils.apiCall(`${USER_API_PREFIX}/get/users/via-username/${username}`, {
        queries: { fields: 'id,username,fullName,email,phone,createdAt,updatedAt,thumbnailAvatar,avatar' }
    });
    return response.data;
}
```

#### **Create New User**

```javascript
// Endpoint: POST /api/workspace/{workspaceId}/workspace/post/users
// Constraints: { workspaceTeamId: teamId, workspaceTeamRoleId: roleId }
// Body: { username: string, password: string, email: string, fullName: string }

static async createUser(workspaceId, data, teamId, roleId) {
    const response = await CommonUtils.apiCall(`${WORKSPACE_API_PREFIX}/${workspaceId}/workspace/post/users`, {
        constraints: { workspaceTeamId: teamId, workspaceTeamRoleId: roleId },
        data: data
    });
    return { message: response.message, id: response.data.id };
}
```

#### **Invite Existing User**

```javascript
// Endpoint: POST /api/workspace/{workspaceId}/workspace/post/invitations/bulk
// Body: [{ workspaceTeamId: teamId, workspaceTeamRoleId: roleId, userId: userId }]

static async inviteUser(workspaceId, data) {
    const response = await CommonUtils.apiCall(`${WORKSPACE_API_PREFIX}/${workspaceId}/workspace/post/invitations/bulk`, { data });
    return { message: response.message };
}
```

## 4. Authentication & Security

### 4.1 Token Management

```javascript
class Auth {
  static getAuthToken() {
    this.refreshTokenIfNeeded();
    return localStorage.getItem('access_token') || '';
  }

  static refreshTokenIfNeeded() {
    const lastRefresh = localStorage.getItem('last_token_refresh');
    if (!lastRefresh || this.isOneDayPassed(lastRefresh)) {
      this.refreshToken();
    }
  }

  static async refreshToken() {
    const response = await fetch(`${API_BASE_URL}/api/auth/post/refresh_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await response.json();
    localStorage.setItem('access_token', data.accessToken);
    localStorage.setItem('refresh_token', data.refreshToken);
    localStorage.setItem('last_token_refresh', new Date().toISOString());
  }
}
```

### 4.2 API Call Wrapper

```javascript
static async apiCall(endpoint, data = {}) {
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Auth.getAuthToken()}`,
        'X-Encrypted': 'pyu1_glxqd_zby_oy_dypqs_u23w5q7l'
    };

    const options = {
        method: 'POST',
        headers,
        body: JSON.stringify(data)
    };

    const response = await fetch(`${API_BASE_URL}/api${endpoint}`, options);
    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message || `HTTP ${response.status}`);
    }

    return result;
}
```

## 5. Routing System

### 5.1 Route Configuration

```javascript
const ROUTES = [
  {
    path: new RegExp(`^${ROUTE_PREFIX}/workspaces/(.+)/teams/(.+)$`),
    viewId: 'team-view',
    render: async (params) => await TeamView.render(params.workspaceId, params.teamId),
  },
  {
    path: new RegExp(`^${ROUTE_PREFIX}/workspaces/(.+)$`),
    viewId: 'detail-view',
    render: async (params) => await DetailView.render(params.workspaceId),
  },
];
```

### 5.2 Router Function

```javascript
async function router() {
  const path = window.location.pathname;
  let matchedRoute = null;
  let params = {};

  for (const route of ROUTES) {
    if (route.path instanceof RegExp) {
      const match = path.match(route.path);
      if (match) {
        matchedRoute = route;
        params.workspaceId = match[1];
        if (match[2]) params.teamId = match[2];
        break;
      }
    }
  }

  if (!matchedRoute) {
    CommonUtils.navigateToList();
    return;
  }

  CommonUtils.toggleViews(matchedRoute.viewId);
  await matchedRoute.render(params);
}
```

## 6. Form Handling & Validation

### 6.1 Workspace Form

**Fields:**

- `workspaceName` (required): Tên workspace
- `namespace` (required): Namespace của workspace

**Validation:**

```javascript
if (!workspaceName || !namespace) {
  CommonUtils.showMessage('Tên Workspace và Namespace không được để trống.', false);
  return;
}
```

### 6.2 Team Form

**Fields:**

- `teamName` (required): Tên team

### 6.3 Role Form

**Fields:**

- `roleName` (required): Tên role
- `roleDescription` (optional): Mô tả role

### 6.4 User Form

**Fields:**

- `username` (required): Username của user
- `teamId` (required): ID của team
- `roleId` (required): ID của role
- `email` (optional): Email của user
- `fullName` (optional): Họ tên đầy đủ
- `password` (required nếu user mới): Mật khẩu

**Logic xử lý:**

```javascript
const user = await WorkspaceAPI.fetchUserByUsername(username);
if (user) {
  // User đã tồn tại → Mời user vào workspace
  await WorkspaceAPI.inviteUser(this.currentWorkspace.id, [
    {
      workspaceTeamId: teamId,
      workspaceTeamRoleId: roleId,
      userId: user.id,
    },
  ]);
} else {
  // User chưa tồn tại → Tạo user mới
  if (!password) {
    CommonUtils.showMessage('Mật khẩu không được để trống cho user mới.', false);
    return;
  }
  await WorkspaceAPI.createUser(
    this.currentWorkspace.id,
    {
      username,
      password,
      email,
      fullName: fullname,
    },
    teamId,
    roleId,
  );
}
```

## 7. Error Handling

### 7.1 API Error Handling

```javascript
try {
  const response = await CommonUtils.apiCall(endpoint, data);
  return response;
} catch (error) {
  console.error(`Error in ${endpoint}:`, error);
  throw error;
}
```

### 7.2 UI Error Messages

```javascript
static showMessage(message, isSuccess) {
    const msgDiv = document.getElementById('message');
    msgDiv.textContent = message;
    msgDiv.className = `message ${isSuccess ? 'message-success' : 'message-error'}`;
    msgDiv.style.display = 'block';

    setTimeout(() => {
        msgDiv.style.display = 'none';
    }, 3000);
}
```

### 7.3 Loading States

```javascript
// Show loading
CommonUtils.showRaptorRippleByElementById('element-id', 'raptor-ripple..raptor-ripple..raptor-ripple..');

// Hide loading and show data
CommonUtils.hideRaptorRippleByElementById('element-id', dataHTML);
```

## 8. Navigation Methods

```javascript
// Navigate to workspace list
static navigateToList() {
    window.location.href = `${window.location.origin}${ROUTE_PREFIX}/workspaces`;
}

// Navigate to workspace detail
static navigateToDetail(workspaceId) {
    history.pushState({}, '', `${ROUTE_PREFIX}/workspaces/${workspaceId}`);
    router();
}

// Navigate to team detail
static navigateToTeam(workspaceId, teamId) {
    history.pushState({}, '', `${ROUTE_PREFIX}/workspaces/${workspaceId}/teams/${teamId}`);
    router();
}
```

## 9. Security Features

1. **Token-based Authentication**: Mỗi request đều có Bearer token
2. **Encrypted Headers**: Headers bổ sung cho bảo mật
3. **Input Validation**: Validate tất cả input trước khi gửi
4. **Confirmation Dialogs**: Xác nhận trước khi xóa
5. **Error Boundary**: Xử lý lỗi ở từng level
6. **Auto Token Refresh**: Tự động refresh token sau 24h

## 10. Performance Optimization

1. **Lazy Loading**: Load data theo từng phần khi cần
2. **Caching**: Không có caching explicit nhưng có token refresh
3. **Progressive Enhancement**: Hiển thị UI trước, load data sau
4. **Optimized Queries**: Chỉ lấy fields cần thiết
5. **Async/Await**: Tất cả API calls đều dùng async/await

Module này cung cấp một hệ thống quản lý workspace hoàn chỉnh với đầy đủ CRUD operations, authentication, error handling và routing được xây dựng theo best practices của modern web development.
