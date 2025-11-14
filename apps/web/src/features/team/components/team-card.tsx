import { WorkspaceTeam } from '../types/team';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { Edit, Trash2, ChevronRight } from 'lucide-react';
import { getRouteApi } from '@tanstack/react-router';
import { ROUTES } from '@/shared/route-paths';
// @ts-expect-error - Paraglide generates JS without .d.ts files
import { m } from '@/paraglide/generated/messages.js';

const route = getRouteApi(ROUTES.WORKSPACE.TEAM);

interface TeamCardProps {
  team: WorkspaceTeam;
  onEdit: (team: WorkspaceTeam) => void;
  onDelete: (teamId: string) => void;
}

export function TeamCard({ team, onEdit, onDelete }: TeamCardProps) {
  const { workspaceId, locale } = route.useParams();
  const navigate = route.useNavigate();

  const handleNavigateToDetail = () => {
    navigate({
      to: ROUTES.WORKSPACE.TEAM_DETAIL,
      params: { locale, workspaceId, teamId: team.id },
    });
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1 cursor-pointer" onClick={handleNavigateToDetail}>
            <CardTitle className="hover:text-primary transition-colors">{team.teamName}</CardTitle>
            {team.teamDescription && <CardDescription className="mt-2">{team.teamDescription}</CardDescription>}
          </div>
          <Button variant="ghost" size="icon" onClick={handleNavigateToDetail} className="shrink-0">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardFooter className="gap-2 border-t pt-4">
        <Button variant="outline" size="sm" onClick={() => onEdit(team)} className="flex-1">
          <Edit className="h-4 w-4 mr-2" />
          {m.team_edit_button()}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDelete(team.id)}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          {m.team_delete_button()}
        </Button>
      </CardFooter>

      {/* Show role count if available */}
      {team.teamRoles && team.teamRoles.length > 0 && (
        <div className="px-6 pb-4 text-sm text-muted-foreground">
          {team.teamRoles.length} {team.teamRoles.length === 1 ? m.team_role_count_one() : m.team_role_count_other()}
        </div>
      )}
    </Card>
  );
}
