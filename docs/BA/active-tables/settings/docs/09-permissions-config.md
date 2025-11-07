# Tài liệu: Phân quyền (Permissions Configuration)

## 1. Tổng quan

Phần **Phân quyền** cho phép cấu hình chi tiết quyền truy cập cho từng nhóm (team) và vai trò (role) trên bảng dữ liệu.

### Chức năng chính:

- Cấu hình quyền theo team và role
- Hỗ trợ nhiều loại quyền: create, access, update, delete, custom actions, comments
- Quyền linh hoạt: tất cả, người tạo, người được giao, theo thời gian, theo team

---

## 2. Cấu trúc dữ liệu

```typescript
interface PermissionRule {
  actionId: string; // ID của action
  permission: PermissionType; // Loại quyền
}

interface PermissionConfig {
  teamId: string; // ID của team
  roleId: string; // ID của role
  actions: PermissionRule[]; // Các quyền cho action
}

enum PermissionType {
  // Create permissions
  NOT_ALLOWED = 'not_allowed',
  ALLOWED = 'allowed',

  // Access/Edit/Delete/Custom permissions
  ALL = 'all',
  SELF_CREATED = 'self_created',
  SELF_CREATED_2H = 'self_created_2h',
  SELF_CREATED_12H = 'self_created_12h',
  SELF_CREATED_24H = 'self_created_24h',
  ASSIGNED_USER = 'assigned_user',
  RELATED_USER = 'related_user',
  SELF_CREATED_OR_ASSIGNED = 'self_created_or_assigned',
  SELF_CREATED_OR_RELATED = 'self_created_or_related',
  CREATED_BY_TEAM = 'created_by_team',
  CREATED_BY_TEAM_2H = 'created_by_team_2h',
  CREATED_BY_TEAM_12H = 'created_by_team_12h',
  CREATED_BY_TEAM_24H = 'created_by_team_24h',
  CREATED_BY_TEAM_48H = 'created_by_team_48h',
  CREATED_BY_TEAM_72H = 'created_by_team_72h',
  ASSIGNED_TEAM_MEMBER = 'assigned_team_member',
  RELATED_TEAM_MEMBER = 'related_team_member',
  CREATED_OR_ASSIGNED_TEAM_MEMBER = 'created_or_assigned_team_member',
  CREATED_OR_RELATED_TEAM_MEMBER = 'created_or_related_team_member',

  // Comment create permissions
  SELF_CREATED_RECORD = 'self_created',
  ASSIGNED_USER_RECORD = 'assigned_user',
  RELATED_USER_RECORD = 'related_user',

  // Comment access permissions
  COMMENT_SELF_CREATED = 'comment_self_created',
  COMMENT_SELF_CREATED_OR_TAGGED = 'comment_self_created_or_tagged',
  COMMENT_CREATED_BY_TEAM = 'comment_created_by_team',
  COMMENT_CREATED_OR_TAGGED_TEAM_MEMBER = 'comment_created_or_tagged_team_member',

  // Comment update/delete permissions
  COMMENT_SELF_CREATED_2H = 'comment_self_created_2h',
  COMMENT_SELF_CREATED_12H = 'comment_self_created_12h',
  COMMENT_SELF_CREATED_24H = 'comment_self_created_24h',
  COMMENT_CREATED_BY_TEAM_2H = 'comment_created_by_team_2h',
  COMMENT_CREATED_BY_TEAM_12H = 'comment_created_by_team_12h',
  COMMENT_CREATED_BY_TEAM_24H = 'comment_created_by_team_24h',
}

interface Team {
  id: string;
  teamName: string;
  teamDescription?: string;
}

interface Role {
  id: string;
  workspaceTeamId: string;
  roleCode: string;
  roleName: string;
  roleDescription?: string;
}
```

---

## 3. Component React (tóm tắt)

```tsx
const PermissionsConfiguration: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [roles, setRoles] = useState<Map<string, Role[]>>(new Map());
  const [permissions, setPermissions] = useState<PermissionConfig[]>([]);

  // Fetch teams và roles
  useEffect(() => {
    fetchTeamsAndRoles();
  }, []);

  // Permission options based on action type
  const getPermissionOptions = (actionType: string) => {
    switch (actionType) {
      case 'create':
        return [
          { value: 'not_allowed', label: 'Không' },
          { value: 'allowed', label: 'Được phép' },
        ];
      case 'access':
      case 'update':
      case 'delete':
      case 'custom':
        return [
          { value: 'not_allowed', label: 'Không' },
          { value: 'all', label: 'Tất cả' },
          { value: 'self_created', label: 'Người dùng tạo' },
          // ... more options
        ];
      // ... more cases
    }
  };

  // Render permissions table
  return (
    <table className="permissions-table">
      <thead>
        <tr>
          <th>Team</th>
          <th>Role</th>
          <th>Permissions</th>
        </tr>
      </thead>
      <tbody>
        {teams.map((team) =>
          roles.get(team.id)?.map((role) => (
            <tr key={`${team.id}-${role.id}`}>
              <td>{team.teamName}</td>
              <td>{role.roleName}</td>
              <td>
                {actions.map((action) => (
                  <div key={action.actionId}>
                    <label>{action.name}</label>
                    <select
                      value={getPermission(team.id, role.id, action.actionId)}
                      onChange={(e) => updatePermission(team.id, role.id, action.actionId, e.target.value)}
                    >
                      {getPermissionOptions(action.type).map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </td>
            </tr>
          )),
        )}
      </tbody>
    </table>
  );
};
```

---

## 4. So sánh với Code gốc

```javascript
static async populatePermissionsTable() {
    const teams = await this.fetchTeams();
    const permissionsTableBody = document.getElementById('permissions-table-body');
    permissionsTableBody.innerHTML = '';

    const CreateOptions = [
        { value: 'not_allowed', label: 'Không' },
        { value: 'allowed', label: 'Được phép' },
    ];

    const AccessEditDeleteAndCustomOptions = [
        { value: 'not_allowed', label: 'Không' },
        { value: 'all', label: 'Tất cả' },
        { value: 'self_created', label: 'Người dùng tạo' },
        { value: 'self_created_2h', label: 'Người dùng tạo trong 2h đầu' },
        // ... more options
    ];

    for (const team of teams) {
        const roles = await this.fetchTeamRoles(team.id);
        for (const role of roles) {
            const existingConfig = States.currentTable?.config?.permissionsConfig?.find(p => p.teamId === team.id && p.roleId === role.id) || {};

            const actions = States.currentTable.config.actions.map(action => {
                const options = action.type === 'create' ? CreateOptions
                    : (['access', 'update', 'delete', 'custom'].includes(action.type) ? AccessEditDeleteAndCustomOptions
                        : (action.type === 'comment_create' ? CommentCreateOptions
                            : (action.type === 'comment_access' ? CommentAccessOptions
                                : (['comment_update', 'comment_delete'].includes(action.type) ? CommentUpdateDeleteOptions
                                    : []))));
                return `
                    <div style="margin-bottom: 8px;">
                        <label style="margin-bottom: 4px;display: block;">${action.name}</label>
                        <select data-action-id="${action.actionId}" style="width: 100%;">
                            ${options.map(option => `
                                <option value="${option.value}" ${existingConfig?.actions?.find(a => a.actionId === action.actionId && a.permission === option.value) ? 'selected' : ''}>${option.label}</option>
                            `).join('')}
                        </select>
                    </div>
                `;
            }).join('');

            innerHTML = `<tr data-team-id="${team.id}" data-role-id="${role.id}">
                <td>${team.teamName}</td>
                <td>${role.roleName}</td>
                <td colspan="3">
                    ${actions}
                </td>
            </tr>`;
            permissionsTableBody.innerHTML = innerHTML;
        }
    }
}

// Collect permissions configuration when saving
static async saveTableConfig() {
    const permissionsConfig = [];
    const rows = document.querySelectorAll('#permissions-table-body tr');
    rows.forEach(row => {
        const teamId = row.dataset.teamId;
        const roleId = row.dataset.roleId;

        const actions = [];
        row.querySelectorAll('select').forEach(select => {
            const actionId = select.getAttribute('data-action-id');
            const value = select.value;
            if (value) {
                actions.push({
                    actionId: actionId,
                    permission: value
                });
            }
        });

        permissionsConfig.push({
            teamId: teamId,
            roleId: roleId,
            actions: actions
        });
    });

    const config = {
        // ... other config
        permissionsConfig
    };

    // Save to API
    await TableAPI.updateTable(States.currentTable.id, { config });
}

static async fetchTeams() {
    const response = await fetch(`${API_BASE_URL}/api/workspace/${WORKSPACE_ID}/workspace/get/p/teams`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Auth.getAuthToken()}`
        },
        body: JSON.stringify({
            queries: {
                fields: 'id,teamName,teamDescription,teamRoleIds,teamRoles{...}',
                filtering: {}
            }
        })
    });
    const data = await response.json();
    return data.data || [];
}

static async fetchTeamRoles(teamId) {
    const response = await fetch(`${API_BASE_URL}/api/workspace/${WORKSPACE_ID}/workspace/get/p/team_roles`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Auth.getAuthToken()}`
        },
        body: JSON.stringify({
            constraints: {
                workspaceTeamId: teamId
            },
            queries: {
                fields: 'id,workspaceTeamId,roleCode,roleName,roleDescription'
            }
        })
    });
    const data = await response.json();
    return data.data || [];
}
```

---

## 5. Permission Types Giải thích

### Create Permissions:

- **not_allowed**: Không cho phép tạo
- **allowed**: Cho phép tạo

### Access/Update/Delete Permissions:

- **not_allowed**: Không cho phép
- **all**: Tất cả records
- **self_created**: Chỉ records người dùng tạo
- **self_created_2h/12h/24h**: Records người dùng tạo trong khoảng thời gian
- **assigned_user**: Records được giao cho người dùng
- **related_user**: Records có liên quan đến người dùng
- **created_by_team**: Records tạo bởi bất kỳ thành viên team
- **assigned_team_member**: Records giao cho bất kỳ thành viên team

### Comment Permissions:

- **comment_self_created**: Chỉ comments của người dùng
- **comment_self_created_or_tagged**: Comments của người dùng hoặc được tag
- **comment_created_by_team**: Comments của team members

---

## 6. Quy trình nghiệp vụ

### Setup Permissions:

1. Fetch danh sách teams từ workspace
2. Với mỗi team, fetch danh sách roles
3. Hiển thị bảng permissions cho từng team-role combination
4. Với mỗi action, hiển thị dropdown các permission options phù hợp
5. Load existing permissions từ config
6. Khi save, collect tất cả permissions và gửi lên API

### Permission Evaluation (Backend logic):

1. Lấy team và role của user hiện tại
2. Tìm permission config tương ứng
3. Với mỗi action, check permission rule
4. Evaluate dựa trên record data và user context
5. Return allowed/denied
