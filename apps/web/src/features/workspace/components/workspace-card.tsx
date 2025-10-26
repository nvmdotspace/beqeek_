import { format } from 'date-fns';
import { Globe, ShieldCheck, Users, Database } from 'lucide-react';
import { Link } from '@tanstack/react-router';

import type { Workspace } from '@/shared/api/types';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Badge } from '@workspace/ui/components/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar';
import { Button } from '@workspace/ui/components/button';

import { initialsFromName } from '../utils/initials';
import { useTranslation } from '@/hooks/use-translation';

type WorkspaceCardProps = {
  workspace: Workspace;
};

export const WorkspaceCard = ({ workspace }: WorkspaceCardProps) => {
  const { workspaceName, namespace, myWorkspaceUser, logo, thumbnailLogo, createdAt, ownedByUser } = workspace;

  const { t } = useTranslation();

  return (
    <Card className="h-full transition hover:-translate-y-0.5 hover:shadow-lg">
      <CardHeader className="flex flex-row items-start gap-3 pb-3">
        <Avatar className="h-10 w-10">
          <AvatarImage
            src={
              namespace
                ? `https://api.dicebear.com/7.x/initials/svg?seed=${namespace}`
                : undefined
            }
          />
          <AvatarFallback className="text-sm bg-primary text-primary-foreground">
            {initialsFromName(workspaceName)}
          </AvatarFallback>
        </Avatar>
        <div className="grow space-y-1">
          <CardTitle className="text-lg leading-tight">{workspaceName}</CardTitle>
          <CardDescription className="flex items-center gap-2 text-xs uppercase tracking-wide">
            <Badge variant="outline" className="border-white/10 bg-white/5 text-xs font-semibold text-foreground">
              <Globe className="size-3" />
              <span className="ml-1">{namespace}</span>
            </Badge>
          </CardDescription>
        </div>
        {ownedByUser ? (
          <Badge variant="secondary" className="self-start text-[10px] font-semibold">
            <ShieldCheck className="mr-1 size-2.5" />
            {t('workspace.card.owner')}
          </Badge>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-3 py-3">
        <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-card/60 p-2 text-sm text-muted-foreground">
          <Users className="size-3.5 text-primary" />
          <div className="space-y-0.5">
            <p className="text-[10px] uppercase tracking-wide text-foreground/70">{t('workspace.card.managerLabel')}</p>
            <p className="text-xs font-medium text-foreground">
              {myWorkspaceUser?.fullName ?? t('workspace.card.noInfo')}
            </p>
          </div>
        </div>
        <div className="rounded-lg border border-dashed border-border/60 bg-muted/40 p-2 text-[10px] text-muted-foreground">
          <p>
            {t('workspace.card.createdAt')} {createdAt ? format(new Date(createdAt), 'dd/MM/yyyy') : '—'}
          </p>
          <p>
            {t('workspace.card.e2eeLabel')}{' '}
            <span className="font-medium text-emerald-400">{t('workspace.card.e2eeEnabled')}</span>
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2 pt-3">
        <Button asChild variant="outline" size="sm" className="flex-1 text-xs">
          <Link to="/workspaces/tables" search={{ workspaceId: workspace.id }}>
            <Database className="mr-1.5 h-3.5 w-3.5" />
            {t('workspace.card.activeTables')}
          </Link>
        </Button>
        <Button asChild size="sm" className="flex-1 text-xs">
          <Link to="/workspaces" search={{ workspaceId: workspace.id }}>
            {t('workspace.card.openWorkspace')}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};
