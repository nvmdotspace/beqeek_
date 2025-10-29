import { useMemo } from 'react';
import { ArrowLeft, ShieldCheck, Shield, Link as LinkIcon, ListTree, Lock, Database, Settings2 } from 'lucide-react';
import { useNavigate, useLocation, useParams } from '@tanstack/react-router';

// @ts-ignore
import { m } from "@/paraglide/generated/messages.js";
import { useWorkspaces } from '@/features/workspace/hooks/use-workspaces';
import { useActiveTables, useActiveWorkGroups } from '../hooks/use-active-tables';
import type { ActiveFieldConfig, ActiveTable, ActiveWorkGroup } from '../types';

import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Skeleton } from '@workspace/ui/components/skeleton';

interface FieldSummaryProps {
  field: ActiveFieldConfig;
}

const FieldSummary = ({ field }: FieldSummaryProps) => {
    const optionCount = field.options?.length ?? 0;

  return (
    <div className="rounded-lg border border-border/60 bg-card/40 p-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-foreground">{field.label}</p>
          <p className="text-xs text-muted-foreground">{field.name}</p>
        </div>
        <Badge variant="secondary" className="uppercase">
          {field.type}
        </Badge>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <Badge variant={field.required ? 'default' : 'outline'}>
          {field.required ? m.activeTables_detail_fieldRequired() : m.activeTables_detail_fieldOptional()}
        </Badge>
        {optionCount > 0 ? (
          <Badge variant="outline">{m.activeTables_detail_fieldOptions({ count: optionCount })}</Badge>
        ) : null}
      </div>

      {field.placeholder ? <p className="mt-3 text-sm text-muted-foreground">{field.placeholder}</p> : null}

      {field.options && field.options.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {field.options.slice(0, 6).map((option) => (
            <Badge
              key={option.value}
              variant="outline"
              className="flex items-center gap-2"
              style={
                option.background_color
                  ? {
                      backgroundColor: option.background_color,
                      color: option.text_color ?? 'inherit',
                    }
                  : undefined
              }
            >
              {option.text}
            </Badge>
          ))}
          {field.options.length > 6 ? <Badge variant="secondary">+{field.options.length - 6}</Badge> : null}
        </div>
      ) : null}
    </div>
  );
};

const LoadingState = () => (
  <div className="space-y-6">
    <Skeleton className="h-16 w-full rounded-xl" />
    <Skeleton className="h-32 w-full rounded-xl" />
    <div className="grid gap-4 md:grid-cols-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <Skeleton key={index} className="h-40 w-full rounded-xl" />
      ))}
    </div>
  </div>
);

const NotFoundState = ({ onBack }: { onBack: () => void }) => {
    return (
    <Card className="border-destructive/40 bg-destructive/10">
      <CardHeader>
        <CardTitle className="text-destructive">{m.activeTables_detail_notFoundTitle()}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-destructive">
        <p>{m.activeTables_detail_notFoundDescription()}</p>
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {m.activeTables_detail_backToList()}
        </Button>
      </CardContent>
    </Card>
  );
};

const useActiveTableDetail = (
  tables: ActiveTable[] | undefined,
  workGroups: ActiveWorkGroup[] | undefined,
  tableId?: string,
) => {
  return useMemo(() => {
    if (!tableId) {
      return { table: undefined, workGroup: undefined };
    }
    const table = tables?.find((item) => item.id === tableId);
    const workGroup = table ? workGroups?.find((group) => group.id === table.workGroupId) : undefined;
    return { table, workGroup };
  }, [tables, workGroups, tableId]);
};

export const ActiveTableDetailPage = () => {
  const params = useParams({ strict: false });
  const location = useLocation();
  const navigate = useNavigate();
  const locale = 'en'; // Placeholder for locale
  const tableId = params.tableId as string;
  const localeParam = location.pathname.split('/')[1];
  const searchState = (location.search ?? {}) as Record<string, unknown>;
  const searchWorkspaceId = typeof searchState.workspaceId === 'string' ? searchState.workspaceId : undefined;
  const localePrefix = localeParam ? `/${localeParam}` : (locale as string) === 'vi' ? '' : `/${locale}`;

  const { data: workspacesData } = useWorkspaces();
  const workspaceOptions = workspacesData?.data ?? [];
  const workspaceId = searchWorkspaceId ?? workspaceOptions[0]?.id;

  const { data: tablesResp, isLoading: tablesLoading, error: tablesError } = useActiveTables(workspaceId);
  const { data: workGroupsResp, isLoading: workGroupsLoading } = useActiveWorkGroups(workspaceId);

  const { table, workGroup } = useActiveTableDetail(tablesResp?.data, workGroupsResp?.data, tableId);

  const handleBack = () => {
    navigate({ to: `${localePrefix}/workspaces/tables`, search: workspaceId ? { workspaceId } : undefined });
  };

  const handleViewRecords = () => {
    if (!tableId) return;
    navigate({
      to: `${localePrefix}/workspaces/tables/${tableId}/records`,
      search: workspaceId ? { workspaceId } : undefined,
    });
  };

  const handleViewSettings = () => {
    if (!tableId) return;
    navigate({
      to: `${localePrefix}/workspaces/tables/${tableId}/settings`,
      search: workspaceId ? { workspaceId } : undefined,
    });
  };

  const encryptionBadge = table?.config?.e2eeEncryption ? (
    <Badge variant="default" className="flex items-center gap-2">
      <ShieldCheck className="h-4 w-4" />
      {m.activeTables_detail_encryptionE2EE()}
    </Badge>
  ) : (
    <Badge variant="secondary" className="flex items-center gap-2">
      <Shield className="h-4 w-4" />
      {m.activeTables_detail_encryptionServer()}
    </Badge>
  );

  const isLoading = tablesLoading || workGroupsLoading;

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <Button variant="ghost" onClick={handleBack} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          {m.activeTables_detail_backToList()}
        </Button>
        <LoadingState />
      </div>
    );
  }

  if (!tableId || tablesError || !table) {
    return (
      <div className="space-y-6 p-6">
        <Button variant="ghost" onClick={handleBack} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          {m.activeTables_detail_backToList()}
        </Button>
        <NotFoundState onBack={handleBack} />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <Button variant="ghost" size="sm" className="h-8 px-2" onClick={handleBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {m.activeTables_detail_backToList()}
            </Button>
            {workGroup ? (
              <Badge variant="outline" className="flex items-center gap-2">
                <ListTree className="h-3.5 w-3.5" />
                {workGroup.name}
              </Badge>
            ) : null}
          </div>

          <h1 className="text-3xl font-bold tracking-tight">{table.name}</h1>
          {table.description ? (
            <p className="max-w-2xl text-sm text-muted-foreground leading-relaxed">{table.description}</p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {encryptionBadge}
          <Badge variant="outline" className="flex items-center gap-1">
            <LinkIcon className="h-3.5 w-3.5" />
            {m.activeTables_detail_tableType({ type: table.tableType })}
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Lock className="h-3.5 w-3.5" />
            {m.activeTables_detail_fieldCount({ count: table.config?.fields?.length ?? 0 })}
          </Badge>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleViewSettings}>
              <Settings2 className="mr-2 h-4 w-4" />
              Settings
            </Button>
            <Button onClick={handleViewRecords}>
              <Database className="mr-2 h-4 w-4" />
              {m.activeTables_detail_viewRecords()}
            </Button>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            {m.activeTables_detail_encryptionTitle()}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>{m.activeTables_detail_encryptionDescription()}</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>{m.activeTables_detail_encryptionKeyManagement()}</li>
            <li>{m.activeTables_detail_encryptionAccess()}</li>
          </ul>
        </CardContent>
      </Card>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">{m.activeTables_detail_fieldsTitle()}</h2>
          <Badge variant="outline">
            {m.activeTables_detail_visibleFields({ count: table.config?.fields?.length ?? 0 })}
          </Badge>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {table.config?.fields?.map((field) => (
            <FieldSummary key={field.name} field={field} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default ActiveTableDetailPage;
