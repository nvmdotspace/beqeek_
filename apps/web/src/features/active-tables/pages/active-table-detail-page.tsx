import { useMemo, useState, useEffect } from 'react';
import { ArrowLeft, ShieldCheck, Shield, Link as LinkIcon, ListTree, Lock, Database, Settings2, Hash, AlertTriangle } from 'lucide-react';
import { useNavigate, useLocation, useParams } from '@tanstack/react-router';

// @ts-ignore
import { m } from "@/paraglide/generated/messages.js";
import { useWorkspaces } from '@/features/workspace/hooks/use-workspaces';
import { useActiveTables, useActiveWorkGroups } from '../hooks/use-active-tables';
import type { ActiveFieldConfig, ActiveTable, ActiveWorkGroup } from '../types';
import { useTableEncryption } from '../hooks/use-table-encryption';
import { getEncryptionTypeForField } from '@workspace/active-tables-core';

import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Skeleton } from '@workspace/ui/components/skeleton';
import { EncryptionKeyModal } from '../components/encryption-key-modal';
import { EncryptionStatusCard } from '../components/encryption-status-card';
import { EncryptionTypeBreakdown } from '../components/encryption-type-breakdown';

interface FieldSummaryProps {
  field: ActiveFieldConfig;
  isE2EEEnabled: boolean;
}

const FieldSummary = ({ field, isE2EEEnabled }: FieldSummaryProps) => {
  const optionCount = field.options?.length ?? 0;
  const encryptionType = isE2EEEnabled ? getEncryptionTypeForField(field.type) : 'NONE';

  return (
    <div className="rounded-lg border border-border/60 bg-card/40 p-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-foreground">{field.label}</p>
          <p className="text-xs text-muted-foreground">{field.name}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Badge variant="secondary" className="uppercase">
            {field.type}
          </Badge>
          {encryptionType !== 'NONE' && (
            <Badge variant="outline" className="text-xs">
              {encryptionType === 'AES-256-CBC' && <Shield className="mr-1 h-2.5 w-2.5" />}
              {encryptionType === 'OPE' && <Lock className="mr-1 h-2.5 w-2.5" />}
              {encryptionType === 'HMAC-SHA256' && <Hash className="mr-1 h-2.5 w-2.5" />}
              {encryptionType}
            </Badge>
          )}
        </div>
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

  // Encryption state and hooks
  const [isEncryptionModalOpen, setIsEncryptionModalOpen] = useState(false);
  const encryption = useTableEncryption(workspaceId ?? '', tableId, table?.config);

  // Auto-open modal if E2EE enabled but no key
  useEffect(() => {
    if (table && encryption.isE2EEEnabled && !encryption.isKeyLoaded) {
      setIsEncryptionModalOpen(true);
    }
  }, [table, encryption.isE2EEEnabled, encryption.isKeyLoaded]);

  // Handle encryption key saved
  const handleKeySaved = async (key: string) => {
    const success = await encryption.saveKey(key);
    if (success) {
      console.log('Encryption key saved successfully');
    }
  };

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

  const encryptionBadge = encryption.isE2EEEnabled ? (
    <Badge
      variant="outline"
      className={`flex items-center gap-2 ${
        encryption.keyValidationStatus === 'valid'
          ? 'border-green-500 text-green-700'
          : 'border-yellow-500 text-yellow-700'
      }`}
    >
      {encryption.keyValidationStatus === 'valid' ? (
        <ShieldCheck className="h-4 w-4" />
      ) : (
        <AlertTriangle className="h-4 w-4" />
      )}
      {encryption.keyValidationStatus === 'valid' ? 'E2EE Active' : 'E2EE (Key Required)'}
    </Badge>
  ) : (
    <Badge variant="secondary" className="flex items-center gap-2">
      <Shield className="h-4 w-4" />
      Server Encryption
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

      <EncryptionStatusCard
        table={table}
        encryption={encryption}
        onEnterKey={() => setIsEncryptionModalOpen(true)}
      />

      <EncryptionTypeBreakdown
        fields={table.config?.fields ?? []}
        hashedKeywordFields={table.config?.hashedKeywordFields ?? []}
        isE2EEEnabled={encryption.isE2EEEnabled}
      />

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">{m.activeTables_detail_fieldsTitle()}</h2>
          <Badge variant="outline">
            {m.activeTables_detail_visibleFields({ count: table.config?.fields?.length ?? 0 })}
          </Badge>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {table.config?.fields?.map((field) => (
            <FieldSummary
              key={field.name}
              field={field}
              isE2EEEnabled={encryption.isE2EEEnabled}
            />
          ))}
        </div>
      </section>

      {/* Encryption Key Modal */}
      {table && workspaceId && (
        <EncryptionKeyModal
          isOpen={isEncryptionModalOpen}
          onClose={() => setIsEncryptionModalOpen(false)}
          table={table}
          workspaceId={workspaceId}
          onKeySaved={handleKeySaved}
        />
      )}
    </div>
  );
};

export default ActiveTableDetailPage;
