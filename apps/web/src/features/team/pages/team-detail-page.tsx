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
import { ArrowLeft, Plus } from 'lucide-react';
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
    <div className="container mx-auto p-6 space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={handleBackToTeams}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{m.team_detail_title()}</h1>
          <p className="text-muted-foreground">{isTeamLoading ? m.common_loading() : team?.teamName}</p>
        </div>
      </div>

      {/* Roles Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">{m.team_roles_section()}</h2>
          <Button onClick={handleCreateRole}>
            <Plus className="h-4 w-4 mr-2" />
            {m.role_create_button()}
          </Button>
        </div>
        <RoleList
          roles={roles}
          onEditRole={handleEditRole}
          onDeleteRole={handleDeleteRole}
          isLoading={isRolesLoading}
        />
      </div>

      {/* Members Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">{m.team_members_section()}</h2>
          <Button onClick={() => setIsMemberFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {m.member_add_button()}
          </Button>
        </div>
        <MemberList teamId={teamId} />
      </div>

      {/* Role Form Modal */}
      <RoleFormModal
        open={isRoleFormOpen}
        onClose={() => setIsRoleFormOpen(false)}
        teamId={teamId}
        role={editingRole}
      />

      {/* Member Form Modal */}
      <MemberFormModal open={isMemberFormOpen} onClose={() => setIsMemberFormOpen(false)} preselectedTeamId={teamId} />

      {/* Delete Role Confirmation */}
      <AlertDialog open={!!deletingRoleId} onOpenChange={(open) => !open && setDeletingRoleId(null)}>
        <AlertDialogContent>
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
    </div>
  );
}

export default TeamDetailPage;
