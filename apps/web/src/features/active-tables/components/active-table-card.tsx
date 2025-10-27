import { memo, useMemo } from 'react';
import {
  ShieldCheck,
  Shield,
  Table,
  ArrowRight,
  MoreVertical,
  Edit,
  Trash2,
  Database,
  MessageSquare,
  Workflow,
  Settings2,
  AlertTriangle,
} from 'lucide-react';

import type { ActiveTable } from '../types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu';
// @ts-ignore
import { m } from "@/paraglide/generated/messages.js";
import { useEncryption } from '@workspace/active-tables-hooks';
import { cn } from '@workspace/ui/lib/utils';

interface ActiveTableCardProps {
  table: ActiveTable;
  onOpen?: (table: ActiveTable) => void;
  onConfigure?: (table: ActiveTable) => void;
  onOpenRecords?: (table: ActiveTable) => void;
  onOpenComments?: (table: ActiveTable) => void;
  onOpenAutomations?: (table: ActiveTable) => void;
  onDelete?: (table: ActiveTable) => void;
}

const formatTableStatus = (tableType?: string) => {
  if (!tableType) {
    return 'standard';
  }
  return tableType.replace(/[_-]/g, ' ');
};

export const ActiveTableCard = memo(
  ({
    table,
    onOpen,
    onConfigure,
    onOpenRecords,
    onOpenComments,
    onOpenAutomations,
    onDelete,
  }: ActiveTableCardProps) => {
  const locale = 'en'; // Placeholder for locale
  const { isReady: isEncryptionReady } = useEncryption();
  const fieldCount = table.config?.fields?.length ?? 0;
  const isE2EE = Boolean(table.config?.e2eeEncryption);
    const actionsCount = table.config?.actions?.length ?? 0;
    const quickFilterCount = table.config?.quickFilters?.length ?? 0;
  const updatedAtLabel =
    table.updatedAt && !Number.isNaN(Date.parse(table.updatedAt))
      ? new Intl.DateTimeFormat(locale, {
          dateStyle: 'medium',
          timeStyle: 'short',
        }).format(new Date(table.updatedAt))
      : null;

    const statusLabel = useMemo(() => formatTableStatus(table.tableType), [table.tableType]);
    const fieldPreview = useMemo(() => table.config?.fields?.slice(0, 3) ?? [], [table.config?.fields]);

    return (
      <Card className="group relative flex h-full flex-col overflow-hidden border-border/70 bg-background/90 shadow-sm transition-shadow hover:shadow-md">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle className="text-xl font-semibold tracking-tight">{table.name}</CardTitle>
                <Badge variant="outline" className="text-xs capitalize">
                  {statusLabel}
                </Badge>
              </div>
              {table.description ? (
                <p className="text-sm text-muted-foreground line-clamp-2">{table.description}</p>
              ) : null}
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge
                variant={isE2EE ? 'default' : 'outline'}
                className={cn(
                  'flex items-center gap-1 text-xs',
                  isE2EE ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : '',
                )}
              >
                {isE2EE ? (
                  <>
                    <ShieldCheck className="h-3.5 w-3.5" />
                    End-to-end encrypted
                  </>
                ) : (
                  <>
                    <Shield className="h-3.5 w-3.5" />
                    Server encrypted
                  </>
                )}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onConfigure ? (
                    <DropdownMenuItem onClick={() => onConfigure(table)}>
                      <Edit className="mr-2 h-4 w-4" />
                      {m.activeTables_card_edit()}
                    </DropdownMenuItem>
                  ) : null}
                  {onDelete ? (
                    <DropdownMenuItem
                      onClick={() => onDelete(table)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      {m.activeTables_card_delete()}
                    </DropdownMenuItem>
                  ) : null}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex flex-col gap-3 text-sm text-muted-foreground">
          <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-3">
            <div className="rounded-lg border border-border/50 bg-muted/30 p-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Table className="h-3.5 w-3.5 text-primary" />
                {m.activeTables_card_fieldsLabel({ count: fieldCount })}
              </div>
              {fieldPreview.length ? (
                <div className="mt-2 flex flex-wrap gap-1">
                  {fieldPreview.map((field) => (
                    <Badge key={field.name} variant="secondary" className="max-w-[120px] truncate text-[10px] uppercase">
                      {field.label}
                    </Badge>
                  ))}
                  {fieldCount > fieldPreview.length ? (
                    <Badge variant="outline" className="text-[10px]">
                      +{fieldCount - fieldPreview.length}
                    </Badge>
                  ) : null}
                </div>
              ) : null}
            </div>
            <div className="rounded-lg border border-border/50 bg-muted/30 p-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Workflow className="h-3.5 w-3.5 text-purple-500" />
                {actionsCount} automation{actionsCount === 1 ? '' : 's'}
              </div>
              <p className="mt-2 text-xs leading-relaxed">
                {actionsCount
                  ? `Runs ${actionsCount === 1 ? '1 workflow' : `${actionsCount} workflows`} when triggered`
                  : 'No automation rules configured yet'}
              </p>
            </div>
            <div className="rounded-lg border border-border/50 bg-muted/30 p-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Database className="h-3.5 w-3.5 text-blue-500" />
                {quickFilterCount} smart filter{quickFilterCount === 1 ? '' : 's'}
              </div>
              <p className="mt-2 text-xs leading-relaxed">
                {quickFilterCount
                  ? 'Saved quick filters available'
                  : 'No quick filters defined'}
              </p>
            </div>
          </div>

          {!isEncryptionReady && isE2EE ? (
            <div className="flex items-center gap-2 rounded-md border border-yellow-200 bg-yellow-50/80 p-2 text-xs text-yellow-900 dark:border-yellow-500/40 dark:bg-yellow-950/40 dark:text-yellow-200">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
              <span>{m.activeTables_card_encryptionNotReady()}</span>
            </div>
          ) : null}
        </CardContent>

        <CardFooter className="mt-auto flex flex-col gap-3 border-t border-border/60 pt-4">
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" onClick={() => onOpen?.(table)}>
              {m.activeTables_card_viewDetails()}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onConfigure?.(table)}
              disabled={!onConfigure}
            >
              <Settings2 className="mr-2 h-4 w-4" />
              Configure
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onOpenRecords?.(table)}
              disabled={!onOpenRecords}
            >
              <Database className="mr-2 h-4 w-4" />
              Records
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onOpenComments?.(table)}
              disabled={!onOpenComments}
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Comments
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onOpenAutomations?.(table)}
              disabled={!onOpenAutomations}
            >
              <Workflow className="mr-2 h-4 w-4" />
              Automations
            </Button>
          </div>
          <div className="text-xs text-muted-foreground">
            {updatedAtLabel ? m.activeTables_card_updatedAt({ when: updatedAtLabel }) : '\u00A0'}
          </div>
        </CardFooter>
      </Card>
    );
  },
);

ActiveTableCard.displayName = 'ActiveTableCard';
