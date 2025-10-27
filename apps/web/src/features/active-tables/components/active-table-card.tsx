import { memo } from 'react';
import { ShieldCheck, Shield, Table, ArrowRight, AlertTriangle, MoreVertical, Edit, Trash2, Database, FolderOpen } from 'lucide-react';

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

interface ActiveTableCardProps {
  table: ActiveTable;
  onOpen?: (table: ActiveTable) => void;
  onEdit?: (table: ActiveTable) => void;
  onDelete?: (table: ActiveTable) => void;
}

export const ActiveTableCard = memo(({ table, onOpen, onEdit, onDelete }: ActiveTableCardProps) => {
  const locale = 'en'; // Placeholder for locale
  const { isReady: isEncryptionReady } = useEncryption();
  const fieldCount = table.config?.fields?.length ?? 0;
  const isE2EE = Boolean(table.config?.e2eeEncryption);
  const updatedAtLabel =
    table.updatedAt && !Number.isNaN(Date.parse(table.updatedAt))
      ? new Intl.DateTimeFormat(locale, {
          dateStyle: 'medium',
          timeStyle: 'short',
        }).format(new Date(table.updatedAt))
      : null;

  // Example of a real-time status (can be dynamic based on actual data)
  const isEditing = Math.random() > 0.7; // Placeholder for real-time status

  return (
    <Card className="flex h-full flex-col border-border/60">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg leading-none">{table.name}</CardTitle>
              <Badge variant="outline" className="text-xs capitalize">
                {table.tableType || 'standard'}
              </Badge>
            </div>
            {table.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">{table.description}</p>
            )}
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Table className="h-3 w-3" />
                {table.config?.fields?.length || 0} fields
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            {table.config?.e2eeEncryption ? (
              <Badge variant="secondary" className="text-xs flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" />
                E2EE
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs">
                Server Encrypted
              </Badge>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit?.(table)}>
                  <Edit className="mr-2 h-4 w-4" />
                  {m.activeTables_card_edit()}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDelete?.(table)} className="text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  {m.activeTables_card_delete()}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-3 text-sm text-muted-foreground">
        <div className="flex items-center gap-2 font-medium text-foreground">
          <Table className="h-4 w-4 text-primary" />
          <span className="uppercase tracking-wide text-xs font-semibold text-primary">{table.tableType}</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">{m.activeTables_card_fieldsLabel({ count: fieldCount })}</Badge>
          {table.config?.fields?.slice(0, 3).map((field) => (
            <Badge key={field.name} variant="secondary" className="capitalize">
              {field.label}
            </Badge>
          ))}
          {fieldCount > 3 ? (
            <Badge variant="outline" className="bg-muted/20">
              +{fieldCount - 3}
            </Badge>
          ) : null}
        </div>

        {/* Encryption status warning */}
        {!isEncryptionReady && isE2EE && (
          <div className="rounded-md bg-yellow-50 border border-yellow-200 p-2 text-xs text-yellow-800 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            {m.activeTables_card_encryptionNotReady()}
          </div>
        )}
      </CardContent>

      <CardFooter className="mt-auto flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          {updatedAtLabel ? m.activeTables_card_updatedAt({ when: updatedAtLabel }) : '\u00A0'}
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onOpen?.(table)}>
                <ArrowRight className="mr-2 h-4 w-4" />
                {m.activeTables_card_viewDetails()}
              </DropdownMenuItem>
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(table)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Table
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(table)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Table
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="sm" onClick={() => onOpen?.(table)}>
            {m.activeTables_card_viewDetails()}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
});

ActiveTableCard.displayName = 'ActiveTableCard';
