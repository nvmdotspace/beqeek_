import { useEffect, useMemo, useState } from 'react';
import { Loader2, Paintbrush2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

// @ts-ignore
import { m } from '@/paraglide/generated/messages.js';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { ScrollArea } from '@workspace/ui/components/scroll-area';
import { Separator } from '@workspace/ui/components/separator';
import { ColorPicker } from '@workspace/ui/components/color-picker';
import { Tabs, TabsList, TabsTrigger } from '@workspace/ui/components/tabs';
import { Badge } from '@workspace/ui/components/badge';
import { toast } from '@workspace/ui/components/sonner';

import type { ActiveTable, ActiveTableRecord, KanbanConfig } from '../types';
import { updateActiveTable } from '../api/active-tables-api';
import { activeTablesQueryKey } from '../hooks/use-active-tables';

interface ColumnStyleMap {
  [value: string]: string;
}

interface RecordKanbanViewProps {
  workspaceId: string;
  table: ActiveTable;
  records: ActiveTableRecord[];
  isLoading: boolean;
}

const deriveInitialColors = (config?: KanbanConfig): ColumnStyleMap => {
  if (!config?.columnStyles) {
    return {};
  }
  return config.columnStyles.reduce<ColumnStyleMap>((acc, style) => {
    if (style.value && style.color) {
      acc[style.value] = style.color;
    }
    return acc;
  }, {});
};

export const RecordKanbanView = ({ workspaceId, table, records, isLoading }: RecordKanbanViewProps) => {
  const queryClient = useQueryClient();
  const [activeConfigId, setActiveConfigId] = useState<string | null>(
    () => table.config.kanbanConfigs[0]?.kanbanScreenId ?? null,
  );

  const activeConfig = useMemo(() => {
    if (!activeConfigId) return null;
    return table.config.kanbanConfigs.find((config) => config.kanbanScreenId === activeConfigId) ?? null;
  }, [activeConfigId, table.config.kanbanConfigs]);

  useEffect(() => {
    if (!activeConfigId && table.config.kanbanConfigs[0]) {
      setActiveConfigId(table.config.kanbanConfigs[0].kanbanScreenId);
    }
  }, [activeConfigId, table.config.kanbanConfigs]);

  const statusField = activeConfig?.statusField;
  const headlineField = activeConfig?.kanbanHeadlineField;
  const displayFields = activeConfig?.displayFields ?? [];

  const statusFieldDefinition = useMemo(() => {
    if (!statusField) return null;
    return table.config.fields.find((field) => field.name === statusField) ?? null;
  }, [statusField, table.config.fields]);

  const [draftColors, setDraftColors] = useState<ColumnStyleMap>(() => deriveInitialColors(activeConfig ?? undefined));

  useEffect(() => {
    setDraftColors(deriveInitialColors(activeConfig ?? undefined));
  }, [activeConfig]);

  const statusOptions = (statusFieldDefinition?.options ?? []).map((option) => ({
    value: option.value,
    label: option.text,
    fallbackColor: option.background_color ?? '#e2e8f0',
  }));

  const columns = useMemo(() => {
    if (!statusField) {
      return [] as Array<{ value: string; label: string; records: ActiveTableRecord[] }>;
    }
    return statusOptions.map((option) => ({
      value: option.value,
      label: option.label,
      records: records.filter((record) => String(record.record[statusField] ?? '') === option.value),
    }));
  }, [records, statusField, statusOptions]);

  const initialColors = useMemo(() => deriveInitialColors(activeConfig ?? undefined), [activeConfig]);

  const hasChanges = useMemo(() => {
    return JSON.stringify(initialColors) !== JSON.stringify(draftColors);
  }, [initialColors, draftColors]);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!activeConfig) return;
      const nextConfigs = table.config.kanbanConfigs.map((config) =>
        config.kanbanScreenId === activeConfig.kanbanScreenId
          ? {
              ...config,
              columnStyles: Object.entries(draftColors).map(([value, color]) => ({ value, color })),
            }
          : config,
      );
      await updateActiveTable(workspaceId, table.id, {
        data: {
          config: {
            ...table.config,
            kanbanConfigs: nextConfigs,
          },
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: activeTablesQueryKey(workspaceId) });
      toast.success(m.activeTables_kanban_saved());
    },
    onError: (error) => {
      console.error('Failed to update kanban colors', error);
      toast.error(m.activeTables_kanban_errorSave());
    },
  });

  if (table.config.kanbanConfigs.length === 0) {
    return (
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-base font-semibold">{m.activeTables_kanban_title()}</CardTitle>
          <CardDescription>{m.activeTables_kanban_noConfig()}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!activeConfig || !statusFieldDefinition) {
    return (
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-base font-semibold">{m.activeTables_kanban_title()}</CardTitle>
          <CardDescription>{m.activeTables_kanban_statusMissing()}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">{m.activeTables_kanban_title()}</CardTitle>
            <CardDescription>
              {activeConfig.screenDescription || m.activeTables_kanban_customizeColors()}
            </CardDescription>
          </div>
          {table.config.kanbanConfigs.length > 1 ? (
            <Tabs value={activeConfigId ?? ''} onValueChange={setActiveConfigId} className="w-full md:w-auto">
              <TabsList className="flex w-full flex-wrap gap-1">
                {table.config.kanbanConfigs.map((config) => (
                  <TabsTrigger key={config.kanbanScreenId} value={config.kanbanScreenId} className="text-xs md:text-sm">
                    {config.screenName}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          ) : null}
        </CardHeader>
        <Separator />
        <CardContent className="grid gap-4 md:grid-cols-[minmax(0,1fr)_320px]">
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {m.activeTables_comments_loading()}
              </div>
            ) : (
              <div className="flex min-h-[320px] gap-4 pb-4">
                {columns.map((column) => {
                  const columnColor = draftColors[column.value] ??
                    statusOptions.find((option) => option.value === column.value)?.fallbackColor ??
                    '#e2e8f0';

                  return (
                    <Card
                      key={column.value}
                      className="flex min-w-[220px] flex-1 flex-col border border-border/70 bg-muted/30"
                      style={{ borderTop: `3px solid ${columnColor}` }}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between gap-2">
                          <CardTitle className="text-sm font-semibold text-foreground">
                            {column.label}
                          </CardTitle>
                          <Badge variant="outline" className="text-xs">
                            {column.records.length}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="flex-1 overflow-hidden px-2 py-0">
                        <ScrollArea className="h-[320px] pr-2">
                          <div className="space-y-2">
                            {column.records.map((record) => (
                              <div key={record.id} className="rounded-lg border border-border/60 bg-background p-3 shadow-sm">
                                <p className="line-clamp-2 text-sm font-medium text-foreground">
                                  {headlineField ? String(record.record[headlineField] ?? '—') : record.id}
                                </p>
                                {displayFields.length ? (
                                  <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                                    {displayFields.map((fieldName) => {
                                      const field = table.config.fields.find((item) => item.name === fieldName);
                                      return (
                                        <li key={`${record.id}-${fieldName}`}>
                                          <span className="font-medium">{field?.label ?? fieldName}:</span>{' '}
                                          <span>{String(record.record[fieldName] ?? '—')}</span>
                                        </li>
                                      );
                                    })}
                                  </ul>
                                ) : null}
                              </div>
                            ))}
                            {!column.records.length ? (
                              <div className="rounded-lg border border-dashed border-border/50 bg-muted/20 p-4 text-center text-xs text-muted-foreground">
                                {m.activeTables_kanban_emptyColumn()}
                              </div>
                            ) : null}
                          </div>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4 rounded-xl border border-border/60 bg-background px-4 py-4">
            <div className="flex items-center gap-2">
              <Paintbrush2 className="h-4 w-4" />
              <h3 className="text-sm font-semibold text-foreground">
                {m.activeTables_kanban_customizeColors()}
              </h3>
            </div>
            <div className="space-y-3">
              {statusOptions.map((option) => {
                const colorValue = draftColors[option.value] ?? option.fallbackColor ?? '#e2e8f0';
                return (
                  <div key={option.value} className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-muted/20 px-3 py-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">{option.label}</p>
                      <p className="text-xs text-muted-foreground">{m.activeTables_kanban_columnColor()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <ColorPicker
                        color={colorValue}
                        onChange={(newColor) =>
                          setDraftColors((prev) => ({
                            ...prev,
                            [option.value]: newColor,
                          }))
                        }
                        description={option.label}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setDraftColors((prev) => {
                            const next = { ...prev };
                            delete next[option.value];
                            return next;
                          })
                        }
                      >
                        {m.activeTables_kanban_colorReset()}
                      </Button>
                    </div>
                  </div>
                );
              })}
              {!statusOptions.length ? (
                <p className="text-xs text-muted-foreground">
                  {m.activeTables_kanban_statusMissing()}
                </p>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => mutation.mutate()}
                disabled={mutation.isPending || !hasChanges}
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {m.activeTables_kanban_save()}
                  </>
                ) : (
                  m.activeTables_kanban_save()
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setDraftColors(initialColors)}
                disabled={!hasChanges || mutation.isPending}
              >
                {m.activeTables_kanban_cancel()}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
