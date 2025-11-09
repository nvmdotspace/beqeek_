/**
 * Redesigned Record List View
 *
 * Aligns the list UI with the table + detail configuration patterns by:
 * - Surfacing configured title/subline/tail fields with the same label + badge style
 *   used in `fields-settings-section.tsx`
 * - Using grid based key/value blocks inspired by `detail-view-settings-section.tsx`
 */

import { useMemo, type ReactNode } from 'react';
import type { ActiveTableRecord } from '../types';
import type { FieldConfig, Table } from '@workspace/active-tables-core';
import { Badge } from '@workspace/ui/components/badge';
import { Skeleton } from '@workspace/ui/components/skeleton';
import { RecordFieldDisplay } from './record-field-display';
import { cn } from '@workspace/ui/lib/utils';
import { Button } from '@workspace/ui/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu';
import { MoreVertical } from 'lucide-react';
import { buildFieldMap, resolveListDisplayConfig, type ResolvedRecordListConfig } from './record-list-view.helpers';

type RecordListAction = {
  key: string;
  label: string;
  icon?: ReactNode;
  onSelect: (record: ActiveTableRecord) => void;
};

interface RecordListViewProps {
  table: Table;
  records: ActiveTableRecord[];
  isDecrypting?: boolean;
  loading?: boolean;
  onRecordClick?: (recordId: string) => void;
  recordActions?: RecordListAction[];
}

/**
 * Field block component that mirrors the settings visual language (label + type badge)
 */
const FieldBlock = ({ field, value, className = '' }: { field: FieldConfig; value: unknown; className?: string }) => (
  <div
    className={cn(
      'rounded-xl border border-border/60 bg-card/50 p-3 shadow-[0_1px_2px_rgba(15,23,42,0.05)]',
      className,
    )}
  >
    <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
      <span>{field.label}</span>
      <Badge variant="outline" className="text-[10px] font-semibold">
        {field.type}
      </Badge>
      <span className="font-mono text-[10px] text-muted-foreground/80">{field.name}</span>
    </div>
    <div className="mt-2 text-sm font-medium text-foreground">
      <RecordFieldDisplay field={field} value={value} mode="block" showLabel={false} />
    </div>
  </div>
);

/**
 * Subline pill that keeps the label/value compact
 */
const SubLineField = ({ field, value }: { field: FieldConfig; value: unknown }) => (
  <div className="rounded-full border border-border/80 bg-muted/40 px-3 py-1.5 text-xs">
    <div className="flex items-center gap-2">
      <span className="font-medium text-muted-foreground/90">{field.label}</span>
      <span className="text-foreground">
        <RecordFieldDisplay field={field} value={value} mode="inline" showLabel={false} className="text-xs" />
      </span>
    </div>
  </div>
);

/**
 * Empty and loading states that match the rest of the feature area
 */
const RecordListPlaceholder = ({ isLoading }: { isLoading?: boolean }) => {
  if (!isLoading) {
    return (
      <div className="rounded-2xl border border-dashed bg-muted/20 p-10 text-center">
        <p className="text-base font-semibold text-foreground">Chưa có bản ghi nào</p>
        <p className="mt-2 text-sm text-muted-foreground">Thêm bản ghi mới để bắt đầu theo dõi dữ liệu.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Skeleton className="h-20 w-full rounded-2xl" />
      <Skeleton className="h-20 w-full rounded-2xl" />
      <Skeleton className="h-20 w-full rounded-2xl" />
    </div>
  );
};

export function RecordListView({
  table,
  records,
  loading,
  isDecrypting,
  onRecordClick,
  recordActions,
}: RecordListViewProps) {
  const fieldMap = useMemo(() => buildFieldMap((table.config.fields ?? []) as FieldConfig[]), [table.config.fields]);
  const resolvedConfig = useMemo<ResolvedRecordListConfig>(() => resolveListDisplayConfig(table), [table]);
  const normalizedActions = useMemo<RecordListAction[]>(() => {
    if (recordActions && recordActions.length > 0) {
      return recordActions;
    }
    if (!onRecordClick) {
      return [];
    }
    return [
      {
        key: 'view',
        label: 'Xem chi tiết',
        onSelect: (target: ActiveTableRecord) => onRecordClick(target.id),
      },
    ];
  }, [recordActions, onRecordClick]);

  if (loading) {
    return <RecordListPlaceholder isLoading />;
  }

  if (!records.length) {
    return <RecordListPlaceholder />;
  }

  return (
    <div className="space-y-4">
      {isDecrypting && (
        <div className="rounded-xl border border-blue-300 bg-blue-50/70 px-4 py-2 text-sm text-blue-900 dark:border-blue-500 dark:bg-blue-500/10 dark:text-blue-100">
          Đang giải mã dữ liệu... Vui lòng chờ trong giây lát.
        </div>
      )}

      {records.map((record) => {
        const data = record.data ?? record.record ?? {};
        const titleFieldConfig = resolvedConfig.titleField ? fieldMap.get(resolvedConfig.titleField) : undefined;
        const titleValue = resolvedConfig.titleField ? data[resolvedConfig.titleField] : null;

        const subLineConfigs = resolvedConfig.subLineFields
          .map((name) => fieldMap.get(name))
          .filter((f): f is FieldConfig => Boolean(f));

        const detailConfigs = resolvedConfig.detailFields
          .map((name) => fieldMap.get(name))
          .filter((f): f is FieldConfig => Boolean(f));

        return (
          <article
            key={record.id}
            role="button"
            tabIndex={0}
            onClick={() => onRecordClick?.(record.id)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onRecordClick?.(record.id);
              }
            }}
            className="group rounded-2xl border border-border/70 bg-card/60 p-4 shadow-[0_12px_40px_-24px_rgba(15,23,42,0.45)] transition hover:-translate-y-0.5 hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 sm:p-6"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/80">Record</p>
                <div className="text-lg font-semibold leading-tight text-foreground">
                  {titleFieldConfig ? (
                    <RecordFieldDisplay field={titleFieldConfig} value={titleValue} showLabel={false} />
                  ) : (
                    <span>{String(titleValue || record.id)}</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">ID: {record.id}</p>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                {record.updatedAt && <span>Cập nhật: {new Date(record.updatedAt).toLocaleString()}</span>}
                {record.createdAt && !record.updatedAt && (
                  <span>Tạo lúc: {new Date(record.createdAt).toLocaleString()}</span>
                )}
                <Badge variant="secondary" className="bg-muted text-xs font-medium">
                  {table.name}
                </Badge>
                {normalizedActions.length > 0 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" onClick={(event) => event.stopPropagation()}>
                      {normalizedActions.map((action) => (
                        <DropdownMenuItem
                          key={action.key}
                          onClick={(event) => {
                            event.stopPropagation();
                            action.onSelect(record);
                          }}
                          className="flex items-center gap-2"
                        >
                          {action.icon ? <span className="text-muted-foreground">{action.icon}</span> : null}
                          <span>{action.label}</span>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>

            {subLineConfigs.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {subLineConfigs.map((field) => (
                  <SubLineField key={field.name} field={field} value={data[field.name]} />
                ))}
              </div>
            )}

            {detailConfigs.length > 0 && (
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {detailConfigs.map((field) => (
                  <FieldBlock key={field.name} field={field} value={data[field.name]} />
                ))}
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
