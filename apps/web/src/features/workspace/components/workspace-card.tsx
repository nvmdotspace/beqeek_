import { format } from "date-fns"
import { Globe, ShieldCheck, Users } from "lucide-react"

import type { Workspace } from "@/shared/api/types"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar"

import { initialsFromName } from "../utils/initials"
import { useTranslation } from '@/hooks/use-translation'

type WorkspaceCardProps = {
  workspace: Workspace
}

export const WorkspaceCard = ({ workspace }: WorkspaceCardProps) => {
  const {
    workspaceName,
    namespace,
    myWorkspaceUser,
    logo,
    thumbnailLogo,
    createdAt,
    ownedByUser,
  } = workspace

  const imgSrc: string | undefined = logo ?? thumbnailLogo ?? undefined
  const { t } = useTranslation()

  return (
    <Card className="h-full transition hover:-translate-y-0.5 hover:shadow-lg">
      <CardHeader className="flex flex-row items-start gap-4">
        <Avatar className="size-12">
          <AvatarImage src={imgSrc} alt={workspaceName} />
          <AvatarFallback>{initialsFromName(workspaceName)}</AvatarFallback>
        </Avatar>
        <div className="grow space-y-2">
          <CardTitle className="text-xl">{workspaceName}</CardTitle>
          <CardDescription className="flex items-center gap-2 text-xs uppercase tracking-wide">
            <Badge variant="outline" className="border-white/10 bg-white/5 text-xs font-semibold text-foreground">
              <Globe className="size-3.5" />
              <span className="ml-1.5">{namespace}</span>
            </Badge>
          </CardDescription>
        </div>
        {ownedByUser ? (
          <Badge variant="secondary" className="self-start text-[11px] font-semibold">
            <ShieldCheck className="mr-1.5 size-3" />
            {t('workspace.card.owner')}
          </Badge>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-card/60 p-3 text-sm text-muted-foreground">
          <Users className="size-4 text-primary" />
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wide text-foreground/70">{t('workspace.card.managerLabel')}</p>
            <p className="text-sm font-medium text-foreground">
              {myWorkspaceUser?.fullName ?? t('workspace.card.noInfo')}
            </p>
            <p className="text-xs text-muted-foreground">{myWorkspaceUser?.email}</p>
          </div>
        </div>
        <div className="rounded-lg border border-dashed border-border/60 bg-muted/40 p-3 text-xs text-muted-foreground">
          <p>{t('workspace.card.createdAt')} {createdAt ? format(new Date(createdAt), "dd/MM/yyyy HH:mm") : "—"}</p>
          <p>
            {t('workspace.card.e2eeLabel')} <span className="font-medium text-emerald-400">{t('workspace.card.e2eeEnabled')}</span>
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <a
          href="#"
          className="text-sm font-medium text-primary transition hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {t('workspace.card.openWorkspace')}
        </a>
      </CardFooter>
    </Card>
  )
}
