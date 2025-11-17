import { useState } from 'react';
import { getRouteApi } from '@tanstack/react-router';
import { ROUTES } from '@/shared/route-paths';
import { useGetTeam } from '../hooks/use-get-team';
import { useGetRoles } from '../hooks/use-get-roles';
import { useDeleteRole } from '../hooks/use-delete-role';
import { RoleList } from '../components/role-list';
import { RoleFormModal } from '../components/role-form-modal';
import { MemberList } from '../components/member-list';
import { MemberFormModal } from '../components/member-form-modal';
import { Button } from '@workspace/ui/components/button';
import { Heading, Text } from '@workspace/ui/components/typography';
import { ArrowLeft, Plus } from 'lucide-react';
import { Box, Stack, Inline } from '@workspace/ui/components/primitives';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@workspace/ui/components/alert-dialog';
import type { WorkspaceTeamRole } from '../types/role';
// @ts-expect-error - Paraglide generates JS without .d.ts files
import { m } from '@/paraglide/generated/messages.js';

const route = getRouteApi(ROUTES.WORKSPACE.TEAM_DETAIL);

export function TeamDetailPage() {
  const { workspaceId, teamId, locale } = route.useParams();
  const navigate = route.useNavigate();

  // Fetch team details
  const { data: team, isLoading: isTeamLoading } = useGetTeam(workspaceId, teamId, {
    query: 'WITH_ROLES',
  });

  // Fetch roles
  const { data: roles = [], isLoading: isRolesLoading } = useGetRoles(workspaceId, teamId, { query: 'FULL' });

  // Role modal state
  const [isRoleFormOpen, setIsRoleFormOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<WorkspaceTeamRole | null>(null);
  const [deletingRoleId, setDeletingRoleId] = useState<string | null>(null);

  // Member modal state
  const [isMemberFormOpen, setIsMemberFormOpen] = useState(false);

  // Delete role mutation
  const deleteRole = useDeleteRole(workspaceId, {
    mutationOptions: {
      onSuccess: () => {
        setDeletingRoleId(null);
        // TODO: Success toast
      },
      onError: (error) => {
        console.error('Delete role error:', error);
        // TODO: Error toast
      },
    },
  });

  const handleBackToTeams = () => {
    navigate({
      to: ROUTES.WORKSPACE.TEAM,
      params: { locale, workspaceId },
    });
  };

  const handleCreateRole = () => {
    setEditingRole(null);
    setIsRoleFormOpen(true);
  };

  const handleEditRole = (role: WorkspaceTeamRole) => {
    setEditingRole(role);
    setIsRoleFormOpen(true);
  };

  const handleDeleteRole = (roleId: string) => {
    setDeletingRoleId(roleId);
  };

  const handleConfirmDeleteRole = () => {
    if (deletingRoleId) {
      deleteRole.mutate({
        roleId: deletingRoleId,
        request: { constraints: { workspaceTeamId: teamId } },
      });
    }
  };

  const deletingRole = roles.find((r) => r.id === deletingRoleId);

  return (
    <Box padding="space-300" className="container mx-auto">
      <Stack space="space-300">
        {/* Header with Back Button */}
        <Inline space="space-100" align="center">
          <Button variant="ghost" size="icon" onClick={handleBackToTeams}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Stack space="space-025" className="flex-1">
            <Heading level={1}>{m.team_detail_title()}</Heading>
            <Text size="small" color="muted">
              {isTeamLoading ? m.common_loading() : team?.teamName}
            </Text>
          </Stack>
        </Inline>

        {/* Roles Section */}
        <Stack space="space-100">
          <Inline space="space-100" align="center" className="justify-between">
            <Heading level={2}>{m.team_roles_section()}</Heading>
            <Button onClick={handleCreateRole}>
              <Plus className="h-4 w-4 mr-2" />
              {m.role_create_button()}
            </Button>
          </Inline>
          <RoleList
            roles={roles}
            onEditRole={handleEditRole}
            onDeleteRole={handleDeleteRole}
            isLoading={isRolesLoading}
          />
        </Stack>

        {/* Members Section */}
        <Stack space="space-100">
          <Inline space="space-100" align="center" className="justify-between">
            <Heading level={2}>{m.team_members_section()}</Heading>
            <Button onClick={() => setIsMemberFormOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              {m.member_add_button()}
            </Button>
          </Inline>
          <MemberList teamId={teamId} />
        </Stack>

        {/* Role Form Modal */}
        <RoleFormModal
          open={isRoleFormOpen}
          onClose={() => setIsRoleFormOpen(false)}
          teamId={teamId}
          role={editingRole}
        />

        {/* Member Form Modal */}
        <MemberFormModal
          open={isMemberFormOpen}
          onClose={() => setIsMemberFormOpen(false)}
          preselectedTeamId={teamId}
        />

        {/* Delete Role Confirmation */}
        <AlertDialog open={!!deletingRoleId} onOpenChange={(open) => !open && setDeletingRoleId(null)}>
          <AlertDialogContent className="max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle>{m.role_delete_title()}</AlertDialogTitle>
              <AlertDialogDescription>
                {m.role_delete_description({ roleName: deletingRole?.roleName || '' })}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleteRole.isPending}>{m.common_cancel()}</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmDeleteRole}
                disabled={deleteRole.isPending}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleteRole.isPending ? m.common_deleting() : m.role_delete_confirm()}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Stack>
    </Box>
  );
}

export default TeamDetailPage;
