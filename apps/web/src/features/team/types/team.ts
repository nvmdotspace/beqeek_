/**
 * Workspace Team Types
 *
 * Based on API: /api/workspace/{workspaceId}/workspace/get/teams
 * and /api/workspace/{workspaceId}/workspace/get/p/teams
 */

/**
 * Workspace Team from API
 */
export interface WorkspaceTeam {
  id: string;
  teamName: string;
  teamDescription?: string;
  teamRoleIds?: string[];
  teamRoles?: TeamRole[];
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  labelIds?: string[];
}

/**
 * Team Role nested in team response
 */
export interface TeamRole {
  id: string;
  isDefault?: boolean;
  workspaceTeamId: string;
  roleCode?: string;
  roleName: string;
  roleDescription?: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
  labelIds?: string[];
}

/**
 * Team query fields
 */
export type TeamField =
  | 'id'
  | 'teamName'
  | 'teamDescription'
  | 'teamRoleIds'
  | 'teamRoles{id,isDefault,workspaceTeamId,roleCode,roleName,roleDescription,createdBy,updatedBy,createdAt,updatedAt,labelIds}'
  | 'createdAt'
  | 'updatedAt'
  | 'createdBy'
  | 'updatedBy'
  | 'labelIds';

/**
 * Team filtering options
 * Supported filters from swagger:
 * - id:eq,in
 * - labelId:eq,in
 * - teamName:eq,contains
 * - teamDescription:eq,contains
 * - createdAt:eq,lte,gte,lt,gt|format:Y-m-d H:i:s
 * - updatedAt:eq,lte,gte,lt,gt|format:Y-m-d H:i:s
 */
export interface TeamFiltering {
  'id:eq'?: string;
  'id:in'?: string[];
  'labelId:eq'?: string;
  'labelId:in'?: string[];
  'teamName:eq'?: string;
  'teamName:contains'?: string;
  'teamDescription:eq'?: string;
  'teamDescription:contains'?: string;
  'createdAt:eq'?: string;
  'createdAt:lte'?: string;
  'createdAt:gte'?: string;
  'createdAt:lt'?: string;
  'createdAt:gt'?: string;
  'updatedAt:eq'?: string;
  'updatedAt:lte'?: string;
  'updatedAt:gte'?: string;
  'updatedAt:lt'?: string;
  'updatedAt:gt'?: string;
}

/**
 * Team sorting options
 */
export interface TeamSorting {
  field: 'teamName' | 'createdAt' | 'updatedAt';
  direction: 'asc' | 'desc';
}

/**
 * Query configuration for teams
 */
export interface TeamQueries {
  fields?: string;
  filtering?: TeamFiltering;
  limit?: number;
  offset?: number;
  sorting?: TeamSorting;
}

/**
 * Request body for GET teams
 */
export interface GetTeamsRequest {
  queries?: TeamQueries;
}

/**
 * Response for GET teams
 */
export interface GetTeamsResponse {
  data?: WorkspaceTeam[];
  total?: number;
  message?: string | null;
}

/**
 * Request body for GET team by ID
 */
export interface GetTeamRequest {
  queries?: TeamQueries;
}

/**
 * Response for GET team by ID
 */
export interface GetTeamResponse {
  data?: WorkspaceTeam;
  message?: string | null;
}

/**
 * Team mutation data
 */
export interface TeamMutationData {
  teamName: string;
  teamDescription?: string;
  labelIds?: string[];
}

/**
 * Request body for POST/PATCH team
 */
export interface TeamMutationRequest {
  data: TeamMutationData;
}

/**
 * Response for POST team
 */
export interface TeamMutationResponse {
  data?: WorkspaceTeam;
  message?: string | null;
}

/**
 * Predefined query presets
 */
export const TEAM_QUERY_PRESETS = {
  /**
   * Basic team info without roles
   */
  BASIC: {
    fields: 'id,teamName,teamDescription',
  } satisfies TeamQueries,

  /**
   * Full team details with roles
   */
  WITH_ROLES: {
    fields:
      'id,teamName,teamDescription,teamRoleIds,teamRoles{id,isDefault,workspaceTeamId,roleCode,roleName,roleDescription,createdBy,updatedBy,createdAt,updatedAt,labelIds}',
  } satisfies TeamQueries,

  /**
   * Minimal for dropdown/select
   */
  MINIMAL: {
    fields: 'id,teamName',
  } satisfies TeamQueries,
} as const;

/**
 * Build team query request
 */
export function buildTeamQuery(options?: TeamQueries | keyof typeof TEAM_QUERY_PRESETS): GetTeamsRequest {
  if (!options) {
    return { queries: TEAM_QUERY_PRESETS.WITH_ROLES };
  }

  if (typeof options === 'string') {
    return { queries: TEAM_QUERY_PRESETS[options] };
  }

  return { queries: options };
}
