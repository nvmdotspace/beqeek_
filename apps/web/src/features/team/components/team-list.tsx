import { WorkspaceTeam } from '../types/team';
import { TeamCard } from './team-card';
import { EmptyTeamList } from './empty-team-list';

interface TeamListProps {
  teams: WorkspaceTeam[];
  onEditTeam: (team: WorkspaceTeam) => void;
  onDeleteTeam: (teamId: string) => void;
  isLoading?: boolean;
}

export function TeamList({ teams, onEditTeam, onDeleteTeam, isLoading }: TeamListProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Skeleton loader */}
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-48 rounded-lg border bg-card animate-pulse" />
        ))}
      </div>
    );
  }

  if (teams.length === 0) {
    return <EmptyTeamList />;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {teams.map((team) => (
        <TeamCard key={team.id} team={team} onEdit={onEditTeam} onDelete={onDeleteTeam} />
      ))}
    </div>
  );
}
