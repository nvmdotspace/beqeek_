import { memo, useMemo } from 'react';
import {
  ShieldCheck,
  Shield,
  Table,
  ArrowRight,
  MoreVertical,
  MoreHorizontal,
  Edit,
  Trash2,
  Database,
  LayoutList,
  MessageSquare,
  Workflow,
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu';
// @ts-expect-error - Paraglide generates JS without .d.ts files
import { m } from '@/paraglide/generated/messages.js';
import { useEncryption } from '../hooks/use-encryption-stub';
import { cn } from '@workspace/ui/lib/utils';
import { getModuleIcon, getModuleColors, getModuleTypeLabel } from '../utils/module-icons';

interface ActiveTableCardProps {
  table: ActiveTable;
  onOpen?: (table: ActiveTable) => void;
  onConfigure?: (table: ActiveTable) => void;
  onOpenRecords?: (table: ActiveTable) => void;
  onOpenComments?: (table: ActiveTable) => void;
  onOpenAutomations?: (table: ActiveTable) => void;
  onDelete?: (table: ActiveTable) => void;
}

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

    const fieldPreview = useMemo(() => table.config?.fields?.slice(0, 3) ?? [], [table.config?.fields]);
    const ModuleIcon = useMemo(() => getModuleIcon(table.tableType), [table.tableType]);
    const moduleColors = useMemo(() => getModuleColors(table.tableType), [table.tableType]);
    const moduleTypeLabel = useMemo(() => getModuleTypeLabel(table.tableType), [table.tableType]);

    return (
      <Card
        className={cn(
          'group relative flex h-full flex-col overflow-hidden',
          'border-border/70 bg-background/50 shadow-sm',
          'transition-all duration-200',
          'hover:border-border hover:shadow-lg hover:bg-background',
          'cursor-pointer',
          'focus-visible:outline-none focus-visible:ring-2',
          'focus-visible:ring-blue-500 focus-visible:ring-offset-2',
        )}
        role="button"
        tabIndex={0}
        aria-label={`${table.name} module, ${fieldCount} fields, ${actionsCount} automations, ${isE2EE ? 'encrypted with E2EE' : 'server-side encryption'}, last updated ${updatedAtLabel || 'unknown'}`}
        onClick={(e) => {
          const target = e.target as HTMLElement;
          if (!target.closest('button') && !target.closest('[role="button"]')) {
            onOpen?.(table);
          }
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onOpen?.(table);
          }
        }}
      >
        <CardHeader className="pb-3 px-4 pt-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              {/* Module Icon */}
              <div
                className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors',
                  moduleColors.bg,
                )}
              >
                <ModuleIcon className={cn('h-4.5 w-4.5', moduleColors.text)} />
              </div>

              <div className="space-y-1.5 flex-1 min-w-0">
                <CardTitle className="text-lg font-semibold tracking-tight break-words">{table.name}</CardTitle>
                <Badge variant="outline" className={cn('text-[11px] capitalize font-medium w-fit', moduleColors.badge)}>
                  <ModuleIcon className="mr-1 h-2.5 w-2.5" />
                  {moduleTypeLabel}
                </Badge>
                {table.description ? (
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{table.description}</p>
                ) : null}
              </div>
            </div>
            <div className="flex flex-col items-end gap-1.5 shrink-0">
              <Badge
                variant={isE2EE ? 'default' : 'outline'}
                className={cn(
                  'flex items-center gap-1 text-[11px] whitespace-nowrap h-5 px-1.5',
                  isE2EE ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : '',
                )}
              >
                {isE2EE ? (
                  <>
                    <ShieldCheck className="h-3 w-3 shrink-0" />
                    <span>E2EE</span>
                  </>
                ) : (
                  <>
                    <Shield className="h-3 w-3 shrink-0" />
                    <span>Server</span>
                  </>
                )}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <MoreVertical className="h-3.5 w-3.5" />
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

        <CardContent className="flex flex-col gap-3 text-sm text-muted-foreground px-4 pb-3">
          <div className="grid grid-cols-1 gap-2.5 text-xs md:grid-cols-3">
            <div className="rounded-lg border border-border/50 bg-muted/30 p-2.5 transition-colors hover:bg-muted/40">
              <div className="flex items-center gap-1.5 font-medium text-foreground mb-1.5">
                <Table className="h-3 w-3 text-blue-500" />
                <span className="text-[11px]">
                  {fieldCount} {fieldCount === 1 ? 'field' : 'fields'}
                </span>
              </div>
              {fieldPreview.length ? (
                <div className="flex flex-wrap gap-1">
                  {fieldPreview.map((field) => (
                    <Badge
                      key={field.name}
                      variant="secondary"
                      className="max-w-[120px] truncate text-[10px] font-medium h-4 px-1"
                    >
                      {field.label}
                    </Badge>
                  ))}
                  {fieldCount > fieldPreview.length ? (
                    <Badge variant="outline" className="text-[10px] font-medium h-4 px-1">
                      +{fieldCount - fieldPreview.length}
                    </Badge>
                  ) : null}
                </div>
              ) : null}
            </div>
            <div className="rounded-lg border border-border/50 bg-muted/30 p-2.5 transition-colors hover:bg-muted/40">
              <div className="flex items-center gap-1.5 font-medium text-foreground mb-1.5">
                <Workflow className="h-3 w-3 text-purple-500" />
                <span className="text-[11px]">
                  {actionsCount} {actionsCount === 1 ? 'automation' : 'automations'}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {actionsCount ? 'Workflows trigger on events' : 'No automations yet'}
              </p>
            </div>
            <div className="rounded-lg border border-border/50 bg-muted/30 p-2.5 transition-colors hover:bg-muted/40">
              <div className="flex items-center gap-1.5 font-medium text-foreground mb-1.5">
                <Database className="h-3 w-3 text-emerald-500" />
                <span className="text-[11px]">
                  {quickFilterCount} {quickFilterCount === 1 ? 'filter' : 'filters'}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {quickFilterCount ? 'Saved quick filters' : 'No filters defined'}
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

        <CardFooter className="mt-auto border-t border-border/60 bg-muted/20 py-2.5 px-4">
          <div className="flex items-center justify-between gap-3 w-full">
            {/* PRIMARY ACTION */}
            <Button
              size="sm"
              variant="default"
              onClick={(e) => {
                e.stopPropagation();
                onOpen?.(table);
              }}
              disabled={!onOpen}
              className="h-8 px-3 text-xs font-medium"
              aria-label={`View details for ${table.name}`}
            >
              {m.activeTables_card_viewDetails()}
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>

            {/* SECONDARY ACTIONS */}
            <div className="flex items-center gap-1.5">
              {/* Records Button */}
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenRecords?.(table);
                }}
                disabled={!onOpenRecords}
                className="h-8 px-2.5 text-xs"
                aria-label={`Xem danh sách ${table.name}`}
              >
                <LayoutList className="h-3.5 w-3.5" />
                <span className="ml-1.5 hidden sm:inline">Danh sách</span>
              </Button>

              {/* Overflow Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    aria-label="More actions"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onOpenComments ? (
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenComments(table);
                      }}
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Comments
                    </DropdownMenuItem>
                  ) : null}
                  {onOpenAutomations ? (
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenAutomations(table);
                      }}
                    >
                      <Workflow className="mr-2 h-4 w-4" />
                      Automations
                    </DropdownMenuItem>
                  ) : null}
                  {onConfigure ? (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onConfigure(table);
                        }}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        {m.activeTables_card_edit()}
                      </DropdownMenuItem>
                    </>
                  ) : null}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Timestamp (optional second row) */}
          {updatedAtLabel ? (
            <div className="text-[11px] text-muted-foreground/70 text-center mt-2">
              {m.activeTables_card_updatedAt({ when: updatedAtLabel })}
            </div>
          ) : null}
        </CardFooter>
      </Card>
    );
  },
);

ActiveTableCard.displayName = 'ActiveTableCard';
