import { memo } from 'react';
import { ShieldCheck, Shield, Table, ArrowRight, AlertTriangle } from 'lucide-react';

import type { ActiveTable } from '../types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import { useTranslation } from '@/hooks/use-translation';
import { useEncryption } from '@workspace/active-tables-hooks';

interface ActiveTableCardProps {
  table: ActiveTable;
  onOpen?: (table: ActiveTable) => void;
}

export const ActiveTableCard = memo(({ table, onOpen }: ActiveTableCardProps) => {
  const { t, locale } = useTranslation();
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

  return (
    <Card className="flex h-full flex-col border-border/60">
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-xl font-semibold leading-tight">{table.name}</CardTitle>
          <Badge variant={isE2EE ? 'default' : 'secondary'} className="flex items-center gap-1">
            {isE2EE ? <ShieldCheck className="h-3.5 w-3.5" /> : <Shield className="h-3.5 w-3.5" />}
            {isE2EE ? t('activeTables.card.e2ee') : t('activeTables.card.serverEncryption')}
          </Badge>
        </div>
        {table.description ? (
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{table.description}</p>
        ) : null}
      </CardHeader>

      <CardContent className="flex flex-col gap-3 text-sm text-muted-foreground">
        <div className="flex items-center gap-2 font-medium text-foreground">
          <Table className="h-4 w-4 text-primary" />
          <span className="uppercase tracking-wide text-xs font-semibold text-primary">{table.tableType}</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">{t('activeTables.card.fieldsLabel', { count: fieldCount })}</Badge>
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
            {t('activeTables.card.encryptionNotReady')}
          </div>
        )}
      </CardContent>

      <CardFooter className="mt-auto flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          {updatedAtLabel ? t('activeTables.card.updatedAt', { when: updatedAtLabel }) : '\u00A0'}
        </div>
        <Button variant="outline" size="sm" onClick={() => onOpen?.(table)}>
          {t('activeTables.card.viewDetails')}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
});

ActiveTableCard.displayName = 'ActiveTableCard';
