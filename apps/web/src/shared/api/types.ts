export interface StandardResponse<T = unknown> {
  success?: boolean
  message?: string | null
  errors?: Record<string, string[]> | null
  data?: T
}

export interface PaginationMeta {
  current_page?: number
  last_page?: number
  per_page?: number
  total?: number
  [key: string]: unknown
}

export interface PaginatedResponse<T> extends StandardResponse<T[]> {
  data: T[]
  meta?: PaginationMeta
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
  phone?: string | null
  phoneCountryCode?: string | null
  avatar?: string | null
  thumbnailAvatar?: string | null
  emailVerifiedAt?: string | null
  phoneVerifiedAt?: string | null
  createdAt?: string | null
  updatedAt?: string | null
  globalUser?: {
    username: string
  } | null
}

// Workspace types
export interface Workspace {
  id: string
  namespace: string
  workspaceName: string
  description?: string | null
  myWorkspaceUser?: User | null
  ownedByUser?: User | boolean | null
  ownedBy?: string
  logo?: string | null
  thumbnailLogo?: string | null
  createdAt?: string | null
  updatedAt?: string | null
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
