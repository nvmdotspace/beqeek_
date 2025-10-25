import { User, Workspace, WorkspaceTeam, WorkspaceTeamRole, ActiveTable, ActiveTableRecord } from '../types';

// Mock data store
class MockDataStore {
  private users: Map<string, User> = new Map();
  private workspaces: Map<string, Workspace> = new Map();
  private teams: Map<string, WorkspaceTeam> = new Map();
  private roles: Map<string, WorkspaceTeamRole> = new Map();
  private activeTables: Map<string, ActiveTable> = new Map();
  private activeTableRecords: Map<string, ActiveTableRecord> = new Map();
  private tokens: Map<string, { userId: string; expiresAt: number }> = new Map();

  constructor() {
    this.initializeData();
  }

  private initializeData() {
    // Initialize sample users
    const user1: User = {
      id: '1',
      fullName: 'Captain Bolt',
      email: 'captain@beqeek.com',
      phone: '+84123456789',
      phoneCountryCode: '+84',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=captain',
      thumbnailAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=captain&size=64',
      emailVerifiedAt: '2024-01-01T00:00:00Z',
      phoneVerifiedAt: '2024-01-01T00:00:00Z',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      globalUser: { username: 'captainbolt' },
    };

    const user2: User = {
      id: '2',
      fullName: 'John Doe',
      email: 'john@beqeek.com',
      phone: '+84987654321',
      phoneCountryCode: '+84',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john',
      thumbnailAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john&size=64',
      emailVerifiedAt: '2024-01-02T00:00:00Z',
      createdAt: '2024-01-02T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
      globalUser: { username: 'johndoe' },
    };

    this.users.set('1', user1);
    this.users.set('2', user2);

    // Initialize sample workspaces
    const workspace1: Workspace = {
      id: '1001',
      namespace: 'beqeek-main',
      workspaceName: 'BEQEEK Main Workspace',
      description: 'Workspace chính quản lý toàn bộ cấu hình demo',
      myWorkspaceUser: user1,
      ownedByUser: true,
      ownedBy: '1',
      logo: 'https://api.dicebear.com/7.x/shapes/svg?seed=beqeek',
      thumbnailLogo: 'https://api.dicebear.com/7.x/shapes/svg?seed=beqeek&size=64',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    };

    this.workspaces.set('1001', workspace1);

    // Initialize sample teams
    const team1: WorkspaceTeam = {
      id: '2001',
      teamName: 'Development Team',
      teamDescription: 'Core development team for BEQEEK platform',
      teamRoleIds: ['3001', '3002'],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    };

    this.teams.set('2001', team1);

    // Initialize sample roles
    const role1: WorkspaceTeamRole = {
      id: '3001',
      isDefault: true,
      workspaceTeamId: '2001',
      roleCode: 'ADMIN',
      roleName: 'Administrator',
      roleDescription: 'Full access to all features',
      createdBy: '1',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      labelIds: [],
    };

    const role2: WorkspaceTeamRole = {
      id: '3002',
      isDefault: false,
      workspaceTeamId: '2001',
      roleCode: 'MEMBER',
      roleName: 'Team Member',
      roleDescription: 'Standard team member access',
      createdBy: '1',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      labelIds: [],
    };

    this.roles.set('3001', role1);
    this.roles.set('3002', role2);

    // Initialize sample active tables
    const table1: ActiveTable = {
      id: '4001',
      tableName: 'Tasks',
      tableDescription: 'Task management table',
      tableSchema: {
        task_title: { type: 'SHORT_TEXT', required: true },
        task_description: { type: 'RICH_TEXT', required: false },
        priority: { type: 'SELECT_ONE', options: ['Low', 'Medium', 'High'] },
        due_date: { type: 'DATE', required: false },
        status: { type: 'SELECT_ONE', options: ['Todo', 'In Progress', 'Done'] },
      },
      encryptionEnabled: true,
      encryptionAuthKey: 'mock_encryption_auth_key_hash',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    };

    this.activeTables.set('4001', table1);
  }

  // User methods
  getUser(id: string): User | undefined {
    return this.users.get(id);
  }

  getUserByUsername(username: string): User | undefined {
    return Array.from(this.users.values()).find((user) => user.globalUser?.username === username);
  }

  getAllUsers(): User[] {
    return Array.from(this.users.values());
  }

  // Workspace methods
  getWorkspace(id: string): Workspace | undefined {
    return this.workspaces.get(id);
  }

  getUserWorkspaces(userId: string): Workspace[] {
    return Array.from(this.workspaces.values()).filter((workspace) => workspace.ownedBy === userId);
  }

  createWorkspace(
    userId: string,
    data: { workspaceName: string; namespace: string; description?: string; logo?: string },
  ): Workspace {
    const id = (Date.now() + Math.random()).toString(36);
    const now = new Date().toISOString();
    const owner = this.getUser(userId);

    const workspace: Workspace = {
      id,
      namespace: data.namespace,
      workspaceName: data.workspaceName,
      description: data.description,
      myWorkspaceUser: owner || undefined,
      ownedByUser: true,
      ownedBy: userId,
      logo: data.logo,
      thumbnailLogo: data.logo,
      createdAt: now,
      updatedAt: now,
    };

    this.workspaces.set(id, workspace);

    return workspace;
  }

  // Team methods
  getTeam(id: string): WorkspaceTeam | undefined {
    return this.teams.get(id);
  }

  getWorkspaceTeams(workspaceId: string): WorkspaceTeam[] {
    // In a real scenario, teams would be filtered by workspace
    console.log('Getting teams for workspace:', workspaceId);
    return Array.from(this.teams.values());
  }

  createTeam(team: Omit<WorkspaceTeam, 'id' | 'createdAt' | 'updatedAt'>): WorkspaceTeam {
    const id = Date.now().toString();
    const newTeam: WorkspaceTeam = {
      ...team,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.teams.set(id, newTeam);
    return newTeam;
  }

  // Role methods
  getRole(id: string): WorkspaceTeamRole | undefined {
    return this.roles.get(id);
  }

  getTeamRoles(teamId: string): WorkspaceTeamRole[] {
    return Array.from(this.roles.values()).filter((role) => role.workspaceTeamId === teamId);
  }

  createRole(role: Omit<WorkspaceTeamRole, 'id' | 'createdAt' | 'updatedAt'>): WorkspaceTeamRole {
    const id = Date.now().toString();
    const newRole: WorkspaceTeamRole = {
      ...role,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.roles.set(id, newRole);
    return newRole;
  }

  // Active Table methods
  getActiveTable(id: string): ActiveTable | undefined {
    return this.activeTables.get(id);
  }

  getWorkspaceActiveTables(workspaceId: string): ActiveTable[] {
    console.log('Getting active tables for workspace:', workspaceId);
    return Array.from(this.activeTables.values());
  }

  // Token methods
  createToken(userId: string): string {
    const token = `mock_token_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    const expiresAt = Date.now() + 3600000; // 1 hour
    this.tokens.set(token, { userId, expiresAt });
    return token;
  }

  validateToken(token: string): string | null {
    const tokenData = this.tokens.get(token);
    if (!tokenData || tokenData.expiresAt < Date.now()) {
      this.tokens.delete(token);
      return null;
    }
    return tokenData.userId;
  }

  // Generic CRUD helpers
  generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substring(2, 11);
  }
}

export const mockStore = new MockDataStore();
