import { useState } from 'react';
import { format } from 'date-fns';

import type { Workspace } from '@/shared/api/types';

import { getRouteApi, useNavigate } from '@tanstack/react-router';
import { Star, Users, ShieldCheck, Globe } from 'lucide-react';

import { Badge } from '@workspace/ui/components/badge';
import { Card, CardContent, CardHeader } from '@workspace/ui/components/card';
import { cn } from '@workspace/ui/lib/utils';

import { ROUTES } from '@/shared/route-paths';
import { getWorkspaceLogo } from '@/shared/utils/workspace-logo';
import { useSidebarStore } from '@/stores/sidebar-store';
// @ts-expect-error - Paraglide generates JS without .d.ts files
import { m } from '@/paraglide/generated/messages.js';

const route = getRouteApi('/$locale/workspaces');

interface WorkspaceCardCompactProps {
  workspace: Workspace;
  onFavorite?: (workspaceId: string) => void;
  isFavorited?: boolean;
}

export const WorkspaceCardCompact = ({
  workspace,
  onFavorite,
  isFavorited: initialFavorited = false,
}: WorkspaceCardCompactProps) => {
  const navigate = useNavigate();
  const { locale } = route.useParams();
  const [isFavorited, setIsFavorited] = useState(initialFavorited);
  const { setCurrentWorkspace } = useSidebarStore();

  const handleCardClick = () => {
    // Sync workspace to sidebar store before navigation
    setCurrentWorkspace({
      id: workspace.id,
      workspaceName: workspace.workspaceName,
      namespace: workspace.namespace,
      description: workspace.description,
      logo: workspace.logo,
      thumbnailLogo: workspace.thumbnailLogo,
      memberCount: 0,
      tableCount: 0,
      workflowCount: 0,
    });

    navigate({
      to: ROUTES.ACTIVE_TABLES.LIST,
      params: { workspaceId: workspace.id, locale },
    });
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorited(!isFavorited);
    onFavorite?.(workspace.id);
  };

  const logoUrl = getWorkspaceLogo(workspace);

  return (
    <Card
      className={cn(
        'group relative cursor-pointer',
        'transition-all duration-200 ease-in-out',
        'hover:shadow-lg hover:shadow-primary/5',
        'hover:border-primary/30',
        'hover:-translate-y-0.5',
        'active:translate-y-0',
      )}
      onClick={handleCardClick}
    >
      {/* Favorite Button - Hover State */}
      <button
        onClick={handleFavorite}
        className={cn(
          'absolute top-3 right-3 p-1.5 rounded-md z-10',
          'transition-opacity duration-200',
          'opacity-0 group-hover:opacity-100',
          'hover:bg-muted',
          'focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        )}
        aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
        type="button"
      >
        <Star
          className={cn('h-3.5 w-3.5', isFavorited ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground')}
        />
      </button>

      <CardHeader className="flex flex-row items-start gap-3 pb-2 pt-4">
        {/* Avatar */}
        <img
          src={logoUrl}
          alt={workspace.workspaceName}
          className="h-10 w-10 rounded-lg object-cover ring-1 ring-border shrink-0"
        />

        <div className="grow space-y-1 min-w-0">
          {/* Workspace Name */}
          <h3 className="text-base font-semibold leading-tight line-clamp-1">{workspace.workspaceName}</h3>

          {/* Namespace Badge */}
          <div className="flex items-center gap-1.5">
            <Badge
              variant="outline"
              className="border-border/60 bg-muted/40 text-[10px] font-medium uppercase tracking-wide"
            >
              <Globe className="h-2.5 w-2.5 mr-0.5" />
              {workspace.namespace}
            </Badge>
            {workspace.ownedByUser && (
              <Badge variant="secondary" className="text-[10px] font-semibold">
                <ShieldCheck className="mr-0.5 h-2.5 w-2.5" />
                {m.workspace_card_owner()}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-2 py-2 pb-4">
        {/* Manager Info */}
        <div className="flex items-center gap-2 rounded-md border border-border/60 bg-muted/30 px-2 py-1.5 text-xs">
          <Users className="h-3 w-3 text-primary shrink-0" />
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
              {m.workspace_card_managerLabel()}
            </p>
            <p className="text-xs font-medium truncate">
              {workspace.myWorkspaceUser?.fullName ?? m.workspace_card_noInfo()}
            </p>
          </div>
        </div>

        {/* Creation Date */}
        <div className="rounded-md border border-dashed border-border/60 bg-muted/20 px-2 py-1.5 text-[10px] text-muted-foreground">
          {m.workspace_card_createdAt()}{' '}
          {workspace.createdAt ? format(new Date(workspace.createdAt), 'dd/MM/yyyy') : '—'}
        </div>
      </CardContent>
    </Card>
  );
};
