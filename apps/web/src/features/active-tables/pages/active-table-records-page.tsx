import { ArrowLeft, Database, FolderOpen, ShieldCheck } from 'lucide-react';
import { useLocation, useNavigate, useParams } from '@tanstack/react-router';

import { useTranslation } from '@/hooks/use-translation';
import { useWorkspaces } from '@/features/workspace/hooks/use-workspaces';
import { useActiveTables } from '../hooks/use-active-tables';
import { useActiveTableRecords } from '../hooks/use-active-records';
import { useEncryption } from '@workspace/active-tables-hooks';
import type { ActiveFieldConfig, ActiveTableRecord } from '../types';

import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Badge } from '@workspace/ui/components/badge';
import { Skeleton } from '@workspace/ui/components/skeleton';
import { Input } from '@workspace/ui/components/input';

const formatRecordValue = (value: unknown): string => {
  if (value == null) return '—';
  if (Array.isArray(value)) {
    return value.map((item) => (typeof item === 'object' ? JSON.stringify(item) : String(item))).join(', ');
  }
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch (error) {
      console.warn('Failed to stringify record value', error);
      return '[Encrypted]';
    }
  }
  return String(value);
};

const TableSkeleton = () => (
  <div className="space-y-3">
    <Skeleton className="h-10 w-full rounded-lg" />
    <Skeleton className="h-64 w-full rounded-lg" />
  </div>
);

const RecordsTable = ({
  fields,
  records,
  emptyLabel,
}: {
  fields: ActiveFieldConfig[];
  records: ActiveTableRecord[];
  emptyLabel: string;
}) => {
  if (!records.length) {
    return (
      <div className="rounded-lg border border-dashed border-border/60 bg-muted/30 p-10 text-center text-sm text-muted-foreground">
        {emptyLabel}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-border/70 text-sm">
        <thead className="bg-muted/50">
          <tr>
            <th className="sticky left-0 z-10 bg-muted/80 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              ID
            </th>
            {fields.map((field) => (
              <th
                key={field.name}
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground"
              >
                {field.label}
              </th>
            ))}
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Updated At
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60 bg-background">
          {records.map((record) => (
            <tr key={record.id} className="hover:bg-muted/30">
              <td className="sticky left-0 z-10 bg-background/95 px-4 py-3 font-medium text-foreground">{record.id}</td>
              {fields.map((field) => (
                <td key={field.name} className="max-w-[280px] truncate px-4 py-3 text-muted-foreground">
                  {formatRecordValue(record.record[field.name])}
                </td>
              ))}
              <td className="px-4 py-3 text-xs text-muted-foreground">
                {record.updatedAt ? new Date(record.updatedAt).toLocaleString() : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export const ActiveTableRecordsPage = () => {
  const params = useParams({ strict: false });
  const location = useLocation();
  const navigate = useNavigate();
  const { t, locale } = useTranslation();
  const { isReady: isEncryptionReady } = useEncryption();
  const tableId = params.tableId as string;

  const search = (location.search ?? {}) as Record<string, unknown>;
  const searchWorkspaceId = typeof search.workspaceId === 'string' ? search.workspaceId : undefined;
  const localePrefix = locale === 'vi' ? '' : `/${locale}`;

  const { data: workspacesData } = useWorkspaces();
  const workspaceOptions = workspacesData?.data ?? [];
  const workspaceId = searchWorkspaceId ?? workspaceOptions[0]?.id;

  const { data: tablesResp, isLoading: isLoadingTables, error: tablesError } = useActiveTables(workspaceId);
  const table = tablesResp?.data.find((item) => item.id === tableId);

  const {
    records,
    isLoading: isLoadingRecords,
    isFetching,
    error: recordsError,
    page,
    loadNext,
    loadPrevious,
    refetch,
  } = useActiveTableRecords({ workspaceId, tableId });

  const handleBack = () => {
    navigate({
      to: `${localePrefix}/workspaces/tables/${tableId ?? ''}`,
      search: workspaceId ? { workspaceId } : undefined,
    });
  };

  if (!tableId || !workspaceId) {
    return (
      <div className="space-y-6 p-6">
        <Button variant="ghost" onClick={() => navigate({ to: `${localePrefix}/workspaces/tables` })}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('activeTables.records.backToDetail')}
        </Button>
        <Card className="border-destructive/40 bg-destructive/10">
          <CardContent className="py-10 text-center text-sm text-destructive">
            {t('activeTables.records.invalidContext')}
          </CardContent>
        </Card>
      </div>
    );
  }

  const isLoading = isLoadingTables || isLoadingRecords;
  const error = tablesError || recordsError;
  const fields = table?.config?.fields ?? [];

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <Button variant="ghost" size="sm" className="h-8 px-2" onClick={handleBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('activeTables.records.backToDetail')}
            </Button>
            <Badge variant="outline" className="flex items-center gap-1 uppercase">
              <Database className="h-3.5 w-3.5" />
              {t('activeTables.records.recordsBadge')}
            </Badge>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            {table
              ? t('activeTables.records.title', { name: table.name })
              : t('activeTables.records.title', { name: '...' })}
          </h1>
          {table?.description ? (
            <p className="max-w-2xl text-sm text-muted-foreground leading-relaxed">{table.description}</p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <FolderOpen className="h-3.5 w-3.5" />
            {t('activeTables.records.fieldCount', { count: fields.length })}
          </Badge>
          {table?.config?.e2eeEncryption ? (
            <Badge variant="default" className="flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" />
              {t('activeTables.records.encryptionE2EE')}
            </Badge>
          ) : null}
          {!isEncryptionReady && table?.config?.e2eeEncryption && (
            <Badge variant="outline" className="flex items-center gap-1 text-yellow-600">
              <ShieldCheck className="h-3.5 w-3.5" />
              {t('activeTables.card.encryptionNotReady')}
            </Badge>
          )}
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold">{t('activeTables.records.viewerTitle')}</CardTitle>
            <p className="text-xs text-muted-foreground">{t('activeTables.records.viewerDescription')}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Input placeholder={t('activeTables.records.searchPlaceholder')} className="h-9 w-60" disabled />
            <Button variant="outline" size="sm" onClick={refetch} disabled={isFetching}>
              {isFetching ? t('activeTables.records.refreshing') : t('activeTables.records.refresh')}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <TableSkeleton />
          ) : error ? (
            <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-6 text-sm text-destructive">
              {error instanceof Error ? error.message : t('activeTables.records.errorGeneric')}
            </div>
          ) : (
            <RecordsTable fields={fields} records={records} emptyLabel={t('activeTables.records.emptyState')} />
          )}

          <div className="flex items-center justify-between border-t border-border/60 pt-4 text-xs text-muted-foreground">
            <span>
              {t('activeTables.records.paginationLabel', {
                page: page + 1,
                count: records.length,
              })}
            </span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={loadPrevious} disabled={page === 0 || isFetching}>
                {t('activeTables.records.prev')}
              </Button>
              <Button variant="outline" size="sm" onClick={loadNext} disabled={records.length === 0 || isFetching}>
                {t('activeTables.records.next')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ActiveTableRecordsPage;
