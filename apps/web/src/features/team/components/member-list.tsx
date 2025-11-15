import { getRouteApi } from '@tanstack/react-router';
import { ROUTES } from '@/shared/route-paths';
import { useGetWorkspaceUsersRaw } from '@/features/workspace-users/hooks/use-get-workspace-users-raw';
import { useGetTeams } from '../hooks/use-get-teams';
import { Card, CardContent } from '@workspace/ui/components/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@workspace/ui/components/table';
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar';
import { Badge } from '@workspace/ui/components/badge';
import { Users } from 'lucide-react';
// @ts-expect-error - Paraglide generates JS without .d.ts files
import { m } from '@/paraglide/generated/messages.js';

const route = getRouteApi(ROUTES.WORKSPACE.TEAM_DETAIL);

interface MemberListProps {
  /** Optional team ID to filter members by */
  teamId?: string;
  isLoading?: boolean;
}

interface MemberWithMemberships {
  id: string;
  fullName: string;
  username?: string;
  email?: string;
  avatar?: string;
  thumbnailAvatar?: string;
  memberships: Array<{
    teamId: string;
    teamName: string;
    roleId: string;
    roleName: string;
    invitedAt: string;
  }>;
}

export function MemberList({ teamId, isLoading: isLoadingProp }: MemberListProps) {
  const { workspaceId } = route.useParams();

  // Fetch all workspace users with memberships (RAW data to preserve workspaceMemberships)
  const { data: rawUsers = [], isLoading: isLoadingUsers } = useGetWorkspaceUsersRaw(workspaceId, {
    query: 'FULL_DETAILS',
  });

  // Fetch teams to map team IDs to names (includes roles via WITH_ROLES query)
  const { data: teams = [] } = useGetTeams(workspaceId, { query: 'WITH_ROLES' });

  const isLoading = isLoadingProp || isLoadingUsers;

  // Build lookup maps
  const teamMap = new Map(teams.map((team) => [team.id, team.teamName]));

  // Build role map from ALL teams (not just current team)
  const roleMap = new Map<string, string>();
  teams.forEach((team) => {
    team.teamRoles?.forEach((role) => {
      roleMap.set(role.id, role.roleName);
    });
  });

  // Process users with memberships
  const members = rawUsers
    .map((user) => {
      const memberships =
        user.workspaceMemberships
          ?.filter((membership) => (teamId ? membership.workspaceTeamId === teamId : true))
          .map((membership) => ({
            teamId: membership.workspaceTeamId,
            teamName: teamMap.get(membership.workspaceTeamId) || m.member_unknown_team(),
            roleId: membership.workspaceTeamRoleId,
            roleName: roleMap.get(membership.workspaceTeamRoleId) || m.member_unknown_role(),
            invitedAt: membership.invitedAt,
          })) || [];

      // Only include users with memberships (if filtering by team)
      if (teamId && memberships.length === 0) {
        return null;
      }

      return {
        id: user.id,
        fullName: user.fullName,
        username: user.globalUser?.username,
        email: user.globalUser?.email,
        avatar: user.avatar,
        thumbnailAvatar: user.thumbnailAvatar,
        memberships,
      } as MemberWithMemberships;
    })
    .filter((member): member is MemberWithMemberships => member !== null);

  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                  <div className="h-3 w-24 bg-muted animate-pulse rounded" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (members.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Users className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {teamId ? m.member_empty_team_title() : m.member_empty_workspace_title()}
          </h3>
          <p className="text-muted-foreground text-center max-w-md">
            {teamId ? m.member_empty_team_description() : m.member_empty_workspace_description()}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{m.member_table_name()}</TableHead>
            <TableHead className="hidden md:table-cell">{m.member_table_username()}</TableHead>
            {!teamId && <TableHead className="hidden lg:table-cell">{m.member_table_teams()}</TableHead>}
            <TableHead className="text-right">{m.member_table_role()}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => (
            <TableRow key={member.id}>
              {/* Name with Avatar */}
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={member.thumbnailAvatar || member.avatar} alt={member.fullName} />
                    <AvatarFallback>{member.fullName.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{member.fullName}</div>
                    {member.email && <div className="text-sm text-muted-foreground md:hidden">{member.email}</div>}
                  </div>
                </div>
              </TableCell>

              {/* Username */}
              <TableCell className="hidden md:table-cell">
                <div className="text-sm">{member.username || '-'}</div>
                {member.email && <div className="text-xs text-muted-foreground">{member.email}</div>}
              </TableCell>

              {/* Teams (only in workspace view) */}
              {!teamId && (
                <TableCell className="hidden lg:table-cell">
                  {member.memberships.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {member.memberships.slice(0, 3).map((membership) => (
                        <Badge key={membership.teamId} variant="secondary" className="text-xs">
                          {membership.teamName}
                        </Badge>
                      ))}
                      {member.memberships.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{member.memberships.length - 3}
                        </Badge>
                      )}
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">{m.member_no_teams()}</span>
                  )}
                </TableCell>
              )}

              {/* Role */}
              <TableCell className="text-right">
                {member.memberships.length > 0 ? (
                  <div className="flex flex-col items-end gap-1">
                    {member.memberships.map((membership) => (
                      <Badge key={`${membership.teamId}-${membership.roleId}`} variant="outline">
                        {membership.roleName}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">{m.member_no_role()}</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
