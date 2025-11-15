import { WorkspaceTeam } from '../types/team';
import { Card, CardContent } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { Heading, Text } from '@workspace/ui/components/typography';
import { Badge } from '@workspace/ui/components/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu';
import { Edit, Trash2, Eye, MoreVertical, Users, Shield } from 'lucide-react';
import { getRouteApi } from '@tanstack/react-router';
import { ROUTES } from '@/shared/route-paths';
import { cn } from '@workspace/ui/lib/utils';
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

  const roleCount = team.teamRoles?.length ?? 0;
  const locale_display = 'vi-VN';

  const updatedAtLabel = team.updatedAt
    ? new Intl.DateTimeFormat(locale_display, {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(new Date(team.updatedAt))
    : null;

  const handleNavigateToDetail = () => {
    navigate({
      to: ROUTES.WORKSPACE.TEAM_DETAIL,
      params: { locale, workspaceId, teamId: team.id },
    });
  };

  return (
    <Card
      className={cn(
        'group relative overflow-hidden',
        'border-border/60 shadow-sm',
        'transition-all duration-200',
        'hover:shadow-md',
        'cursor-pointer',
      )}
      onClick={(e) => {
        const target = e.target as HTMLElement;
        if (!target.closest('button') && !target.closest('[role="button"]')) {
          handleNavigateToDetail();
        }
      }}
    >
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-2.5 sm:gap-3">
          <div className="flex items-start gap-2.5 sm:gap-3 flex-1 min-w-0">
            {/* Team Icon */}
            <div
              className={cn(
                'flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg',
                'bg-accent-blue-subtle',
              )}
            >
              <Users className={cn('h-4 w-4 sm:h-4.5 sm:w-4.5', 'text-accent-blue')} />
            </div>

            <div className="flex-1 min-w-0 space-y-2">
              {/* Title */}
              <Heading level={4} className="text-base leading-tight line-clamp-2 break-words">
                {team.teamName}
              </Heading>

              {/* Badges row */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <Badge
                  variant="outline"
                  className={cn(
                    'text-[10px] font-medium whitespace-nowrap',
                    'border-accent-blue-subtle bg-accent-blue-subtle/30 text-accent-blue',
                  )}
                >
                  Đội nhóm
                </Badge>
              </div>
            </div>
          </div>

          {/* Dropdown menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                <MoreVertical className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  handleNavigateToDetail();
                }}
              >
                <Eye className="mr-2 h-4 w-4" />
                {m.team_view_detail_button()}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(team);
                }}
              >
                <Edit className="mr-2 h-4 w-4" />
                {m.team_edit_button()}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(team.id);
                }}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {m.team_delete_button()}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Metadata row */}
        <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Shield className="h-3 w-3" />
            <span>
              {roleCount} {roleCount === 1 ? 'vai trò' : 'vai trò'}
            </span>
          </div>
        </div>

        {/* Description */}
        {team.teamDescription && (
          <Text size="small" color="muted" className="mt-2 line-clamp-2">
            {team.teamDescription}
          </Text>
        )}

        {/* Updated date */}
        {updatedAtLabel && (
          <Text size="small" color="muted" className="mt-2">
            Cập nhật lúc {updatedAtLabel}
          </Text>
        )}
      </CardContent>
    </Card>
  );
}
