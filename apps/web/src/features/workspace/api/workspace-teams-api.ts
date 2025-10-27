import { apiRequest } from '@/shared/api/http-client';

export interface WorkspaceTeamRole {
  id: string;
  roleName: string;
  roleDescription?: string;
  workspaceTeamId: string;
  isDefault?: boolean;
}

export interface WorkspaceTeam {
  id: string;
  teamName: string;
  teamDescription?: string;
  teamRoles?: WorkspaceTeamRole[];
}

interface WorkspaceTeamsResponse {
  data?: {
    data?: WorkspaceTeam[];
  };
}

export const getWorkspaceTeamsWithRoles = (workspaceId: string) =>
  apiRequest<WorkspaceTeamsResponse, Record<string, unknown>>({
    url: `/api/workspace/${workspaceId}/workspace/get/p/teams`,
    method: 'POST',
    data: {
      queries: {
        fields: 'id,teamName,teamDescription,teamRoles{id,roleName,workspaceTeamId,isDefault,roleDescription}',
      },
    },
  });
