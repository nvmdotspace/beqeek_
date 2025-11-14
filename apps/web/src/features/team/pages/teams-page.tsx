import { useState } from 'react';
import { getRouteApi } from '@tanstack/react-router';
import { ROUTES } from '@/shared/route-paths';
import { useGetTeams } from '../hooks/use-get-teams';
import { useDeleteTeam } from '../hooks/use-delete-team';
import { TeamList } from '../components/team-list';
import { TeamFormModal } from '../components/team-form-modal';
import { Button } from '@workspace/ui/components/button';
import { Plus } from 'lucide-react';
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
import type { WorkspaceTeam } from '../types/team';
// @ts-expect-error - Paraglide generates JS without .d.ts files
import { m } from '@/paraglide/generated/messages.js';

const route = getRouteApi(ROUTES.WORKSPACE.TEAM);

export function TeamsPage() {
  const { workspaceId } = route.useParams();

  // Fetch teams
  const { data: teams = [], isLoading } = useGetTeams(workspaceId, {
    query: 'WITH_ROLES', // Include roles for display
  });

  // Modal state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<WorkspaceTeam | null>(null);
  const [deletingTeamId, setDeletingTeamId] = useState<string | null>(null);

  // Delete mutation
  const deleteTeam = useDeleteTeam(workspaceId, {
    mutationOptions: {
      onSuccess: () => {
        setDeletingTeamId(null);
        // TODO: Show success toast
      },
      onError: (error) => {
        // TODO: Show error toast
        console.error('Delete team error:', error);
      },
    },
  });

  const handleCreateClick = () => {
    setEditingTeam(null);
    setIsFormModalOpen(true);
  };

  const handleEditTeam = (team: WorkspaceTeam) => {
    setEditingTeam(team);
    setIsFormModalOpen(true);
  };

  const handleDeleteClick = (teamId: string) => {
    setDeletingTeamId(teamId);
  };

  const handleConfirmDelete = () => {
    if (deletingTeamId) {
      deleteTeam.mutate(deletingTeamId);
    }
  };

  const deletingTeam = teams.find((t) => t.id === deletingTeamId);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{m.team_page_title()}</h1>
          <p className="text-muted-foreground">{m.team_page_description()}</p>
        </div>
        <Button onClick={handleCreateClick}>
          <Plus className="h-4 w-4 mr-2" />
          {m.team_create_button()}
        </Button>
      </div>

      {/* Team List */}
      <TeamList teams={teams} onEditTeam={handleEditTeam} onDeleteTeam={handleDeleteClick} isLoading={isLoading} />

      {/* Create/Edit Modal */}
      <TeamFormModal open={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} team={editingTeam} />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingTeamId} onOpenChange={(open) => !open && setDeletingTeamId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{m.team_delete_title()}</AlertDialogTitle>
            <AlertDialogDescription>
              {m.team_delete_description({ teamName: deletingTeam?.teamName || '' })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteTeam.isPending}>{m.common_cancel()}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deleteTeam.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteTeam.isPending ? m.common_deleting() : m.team_delete_confirm()}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default TeamsPage;
