import { useState, useMemo } from 'react';
import { getRouteApi } from '@tanstack/react-router';
import { ROUTES } from '@/shared/route-paths';
import { useSidebarStore, selectCurrentWorkspace } from '@/stores/sidebar-store';
import { useGetTeams } from '../hooks/use-get-teams';
import { useDeleteTeam } from '../hooks/use-delete-team';
import { TeamList } from '../components/team-list';
import { TeamFormModal } from '../components/team-form-modal';
import { Button } from '@workspace/ui/components/button';
import { Heading, Text } from '@workspace/ui/components/typography';
import { Badge } from '@workspace/ui/components/badge';
import { Input } from '@workspace/ui/components/input';
import { Plus, Search, Users, Shield } from 'lucide-react';
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
import type { WorkspaceTeam } from '../types/team';
// @ts-expect-error - Paraglide generates JS without .d.ts files
import { m } from '@/paraglide/generated/messages.js';

const route = getRouteApi(ROUTES.WORKSPACE.TEAM);

export function TeamsPage() {
  const { workspaceId } = route.useParams();
  const currentWorkspace = useSidebarStore(selectCurrentWorkspace);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch teams
  const { data: teams = [], isLoading } = useGetTeams(workspaceId, {
    query: 'WITH_ROLES', // Include roles for display
  });

  // Calculate stats
  const totalTeams = teams.length;
  const totalMembers = useMemo(() => {
    // This would need actual member count from API
    // For now, using placeholder
    return teams.reduce((sum, team) => sum + (team.teamRoles?.length || 0), 0);
  }, [teams]);
  const totalRoles = useMemo(() => {
    return teams.reduce((sum, team) => sum + (team.teamRoles?.length || 0), 0);
  }, [teams]);

  // Filter teams by search query
  const filteredTeams = useMemo(() => {
    if (!searchQuery) return teams;
    const lowerQuery = searchQuery.toLowerCase();
    return teams.filter(
      (team) =>
        team.teamName.toLowerCase().includes(lowerQuery) ||
        (team.teamDescription && team.teamDescription.toLowerCase().includes(lowerQuery)),
    );
  }, [teams, searchQuery]);

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
    <Box padding="space-300">
      <Stack space="space-300">
        {/* Header Section - Matching Active Tables pattern */}
        {/* TODO: Migrate to primitives when responsive gap support is added */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <Stack space="space-025">
            <Heading level={1}>{m.team_page_title()}</Heading>
            <Text size="small" color="muted">
              {currentWorkspace?.workspaceName
                ? `Workspace • ${currentWorkspace.workspaceName}`
                : m.team_page_description()}
            </Text>
          </Stack>

          {/* TODO: Migrate to primitives when responsive gap support is added */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm đội nhóm..."
                className="h-10 rounded-lg border-border/60 pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="brand-primary" size="sm" onClick={handleCreateClick}>
              <Plus className="h-4 w-4 mr-2" />
              {m.team_create_button()}
            </Button>
          </div>
        </div>

        {/* Stats badges */}
        <Inline space="space-250" align="center" wrap className="gap-y-[var(--space-250)]">
          <Badge variant="outline" className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            <span>{totalTeams} đội nhóm</span>
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5" />
            <span>{totalRoles} vai trò</span>
          </Badge>
        </Inline>

        {/* Summary */}
        <Inline space="space-050" wrap className="text-xs text-muted-foreground">
          <Badge variant="outline" className="border-dashed">
            {filteredTeams.length} đội nhóm
          </Badge>
        </Inline>

        {/* Team List */}
        <TeamList
          teams={filteredTeams}
          onEditTeam={handleEditTeam}
          onDeleteTeam={handleDeleteClick}
          isLoading={isLoading}
        />

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
      </Stack>
    </Box>
  );
}

export default TeamsPage;
