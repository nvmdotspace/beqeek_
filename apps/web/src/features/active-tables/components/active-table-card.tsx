import { memo, useMemo } from 'react';
import { ShieldCheck, Shield, Table, MoreVertical, Edit, Trash2, ListFilter, Eye, AlertTriangle } from 'lucide-react';

import type { ActiveTable } from '../types';
import { Card, CardContent } from '@workspace/ui/components/card';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import { Text, Heading } from '@workspace/ui/components/typography';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
    const quickFilterCount = table.config?.quickFilters?.length ?? 0;
    const updatedAtLabel =
      table.updatedAt && !Number.isNaN(Date.parse(table.updatedAt))
        ? new Intl.DateTimeFormat(locale, {
            dateStyle: 'medium',
            timeStyle: 'short',
          }).format(new Date(table.updatedAt))
        : null;

    const ModuleIcon = useMemo(() => getModuleIcon(table.tableType), [table.tableType]);
    const moduleColors = useMemo(() => getModuleColors(table.tableType), [table.tableType]);
    const moduleTypeLabel = useMemo(() => getModuleTypeLabel(table.tableType), [table.tableType]);

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
            onOpenRecords?.(table);
          }
        }}
      >
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-start justify-between gap-2.5 sm:gap-3">
            <div className="flex items-start gap-2.5 sm:gap-3 flex-1 min-w-0">
              {/* Module Icon */}
              <div
                className={cn(
                  'flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg',
                  moduleColors.bg,
                )}
              >
                <ModuleIcon className={cn('h-4 w-4 sm:h-4.5 sm:w-4.5', moduleColors.text)} />
              </div>

              <div className="flex-1 min-w-0 space-y-2">
                {/* Title - Full width without competing for space */}
                <Heading level={4} className="text-base leading-tight line-clamp-2 break-words">
                  {table.name}
                </Heading>

                {/* Badges row - Stacked below title with consistent spacing */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Badge
                    variant="outline"
                    className={cn('text-[10px] capitalize font-medium whitespace-nowrap', moduleColors.badge)}
                  >
                    {moduleTypeLabel}
                  </Badge>
                  <Badge
                    variant={isE2EE ? 'default' : 'outline'}
                    className={cn(
                      'flex items-center gap-0.5 text-[10px] whitespace-nowrap h-4 px-1.5',
                      isE2EE ? 'bg-accent-green-subtle text-accent-green' : 'text-muted-foreground',
                    )}
                  >
                    {isE2EE ? (
                      <>
                        <ShieldCheck className="h-2.5 w-2.5 shrink-0" />
                        <span>E2EE</span>
                      </>
                    ) : (
                      <>
                        <Shield className="h-2.5 w-2.5 shrink-0" />
                        <span>Server</span>
                      </>
                    )}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Dropdown menu - Fixed position */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                  <MoreVertical className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onOpen ? (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpen(table);
                    }}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Xem chi tiết
                  </DropdownMenuItem>
                ) : null}
                {onConfigure ? (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onConfigure(table);
                    }}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    {m.activeTables_card_edit()}
                  </DropdownMenuItem>
                ) : null}
                {onDelete ? (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(table);
                    }}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {m.activeTables_card_delete()}
                  </DropdownMenuItem>
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Table className="h-3 w-3" />
              <span>
                {fieldCount} {fieldCount === 1 ? 'field' : 'fields'}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <ListFilter className="h-3 w-3" />
              <span>
                {quickFilterCount} {quickFilterCount === 1 ? 'filter' : 'filters'}
              </span>
            </div>
          </div>

          {updatedAtLabel ? (
            <Text size="small" color="muted" className="mt-2">
              Tạo lúc {updatedAtLabel}
            </Text>
          ) : null}

          {!isEncryptionReady && isE2EE ? (
            <div className="flex items-center gap-2 rounded-md border border-warning/20 bg-warning-subtle p-2 text-xs text-warning mt-3">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
              <span>{m.activeTables_card_encryptionNotReady()}</span>
            </div>
          ) : null}
        </CardContent>
      </Card>
    );
  },
);

ActiveTableCard.displayName = 'ActiveTableCard';
