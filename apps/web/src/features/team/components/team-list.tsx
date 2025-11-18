import { WorkspaceTeam } from '../types/team';
import { TeamCard } from './team-card';
import { EmptyTeamList } from './empty-team-list';
import { Grid } from '@workspace/ui/components/primitives';
import { Skeleton } from '@workspace/ui/components/skeleton';

interface TeamListProps {
  teams: WorkspaceTeam[];
  onEditTeam: (team: WorkspaceTeam) => void;
  onDeleteTeam: (teamId: string) => void;
  isLoading?: boolean;
}

export function TeamList({ teams, onEditTeam, onDeleteTeam, isLoading }: TeamListProps) {
  if (isLoading) {
    return (
      <Grid
        columns={1}
        gap="space-100"
        className="sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4"
      >
        {/* Skeleton loader */}
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-48 w-full rounded-xl" />
        ))}
      </Grid>
    );
  }

  if (teams.length === 0) {
    return <EmptyTeamList />;
  }

  return (
    <Grid
      columns={1}
      gap="space-100"
      className="sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4"
    >
      {teams.map((team) => (
        <TeamCard key={team.id} team={team} onEdit={onEditTeam} onDelete={onDeleteTeam} />
      ))}
    </Grid>
  );
}
