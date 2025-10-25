export interface StandardResponse {
  success: boolean
  message?: string
  errors?: Record<string, string[]>
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

// Auth types
export interface LoginRequest {
  username: string
  password: string
}

export interface AuthTokens {
  userId: string
  accessToken: string
  refreshToken: string
}

export interface RefreshTokenRequest {
  refreshToken: string
}

// User types
export interface User {
  id: string
  fullName: string
  email: string
  phone?: string
  phoneCountryCode?: string
  avatar?: string
  thumbnailAvatar?: string
  emailVerifiedAt?: string
  phoneVerifiedAt?: string
  createdAt: string
  updatedAt: string
  globalUser?: {
    username: string
  }
}

// Workspace types
export interface Workspace {
  id: string
  namespace: string
  workspaceName: string
  description?: string
  myWorkspaceUser?: User
  ownedByUser: boolean
  ownedBy: string
  logo?: string
  thumbnailLogo?: string
  createdAt: string
  updatedAt: string
}

export interface WorkspaceMutationData {
  workspaceName: string
  namespace: string
  description?: string
  logo?: string
}

export type WorkspaceMutationRequest = MutationRequest<WorkspaceMutationData>

// Team types
export interface WorkspaceTeam {
  id: string
  teamName: string
  teamDescription?: string
  teamRoleIds: string[]
  teamRoles?: WorkspaceTeamRole[]
  createdAt: string
  updatedAt: string
}

// Role types
export interface WorkspaceTeamRole {
  id: string
  isDefault: boolean
  workspaceTeamId: string
  roleCode: string
  roleName: string
  roleDescription?: string
  createdBy: string
  updatedBy?: string
  createdAt: string
  updatedAt: string
  labelIds?: string[]
}

// Active Table types
export interface ActiveTable {
  id: string
  tableName: string
  tableDescription?: string
  tableSchema: Record<string, unknown>
  encryptionEnabled: boolean
  encryptionAuthKey?: string
  createdAt: string
  updatedAt: string
}

export interface ActiveTableRecord {
  id: string
  tableId: string
  data: Record<string, unknown>
  encryptedData?: Record<string, unknown>
  hashedKeywords?: string[]
  createdAt: string
  updatedAt: string
}

// Query types
export interface QueryRequest {
  queries?: {
    fields?: string
    filtering?: Record<string, unknown>
    sorting?: string
    pagination?: {
      page: number
      per_page: number
    }
  }
  constraints?: Record<string, unknown>
}

export interface MutationRequest<T = unknown> {
  data: T
  constraints?: Record<string, unknown>
}

export type WorkspaceListResponse = PaginatedResponse<Workspace>
