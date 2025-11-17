import { format } from 'date-fns';
import { Globe, ShieldCheck, Users, Grid3x3 } from 'lucide-react';
import { Link } from '@tanstack/react-router';

import type { Workspace } from '@/shared/api/types';
import { ROUTES } from '@/shared/route-paths';

import { Card, CardContent, CardDescription, CardFooter, CardHeader } from '@workspace/ui/components/card';
import { Badge } from '@workspace/ui/components/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar';
import { Button } from '@workspace/ui/components/button';
import { Heading, Text } from '@workspace/ui/components/typography';

import { initialsFromName } from '../utils/initials';
// @ts-expect-error - Paraglide generates JS without .d.ts files
import { m } from '@/paraglide/generated/messages.js';
import { useCurrentLocale } from '@/hooks/use-current-locale';

type WorkspaceCardProps = {
  workspace: Workspace;
};

export const WorkspaceCard = ({ workspace }: WorkspaceCardProps) => {
  const locale = useCurrentLocale();
  const { workspaceName, namespace, myWorkspaceUser, logo, thumbnailLogo, createdAt, ownedByUser } = workspace;

  return (
    <Card className="h-full transition hover:-translate-y-0.5 hover:shadow-lg">
      <CardHeader className="flex flex-row items-start gap-3 pb-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={thumbnailLogo || logo || `https://api.dicebear.com/7.x/initials/svg?seed=${namespace}`} />
          <AvatarFallback className="text-sm bg-primary text-primary-foreground">
            {initialsFromName(workspaceName)}
          </AvatarFallback>
        </Avatar>
        <div className="grow space-y-1">
          <Heading level={3}>{workspaceName}</Heading>
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
            {m.workspace_card_owner()}
          </Badge>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-3 py-3">
        <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-card/60 p-2 text-sm text-muted-foreground">
          <Users className="size-3.5 text-primary" />
          <div className="space-y-0.5">
            <Text size="small" className="text-[10px] uppercase tracking-wide text-foreground/70">
              {m.workspace_card_managerLabel()}
            </Text>
            <Text size="small" className="font-medium">
              {myWorkspaceUser?.fullName ?? m.workspace_card_noInfo()}
            </Text>
          </div>
        </div>
        <div className="rounded-lg border border-dashed border-border/60 bg-muted/40 p-2 text-[10px] text-muted-foreground">
          <p>
            {m.workspace_card_createdAt()} {createdAt ? format(new Date(createdAt), 'dd/MM/yyyy') : '—'}
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2 pt-3">
        <Button asChild variant="outline" size="sm" className="flex-1 text-xs">
          <Link to={ROUTES.ACTIVE_TABLES.LIST} params={{ locale, workspaceId: workspace.id }}>
            <Grid3x3 className="mr-1.5 h-3.5 w-3.5" />
            {m.workspace_card_activeTables()}
          </Link>
        </Button>
        <Button asChild size="sm" className="flex-1 text-xs">
          <Link to={ROUTES.WORKSPACES} params={{ locale }}>
            {m.workspace_card_openWorkspace()}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};
