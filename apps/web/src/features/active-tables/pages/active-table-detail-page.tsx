import { useMemo, useState, useEffect } from 'react';
import {
  ArrowLeft,
  ShieldCheck,
  Shield,
  Link as LinkIcon,
  ListTree,
  Lock,
  LayoutList,
  Settings2,
  Hash,
  AlertTriangle,
} from 'lucide-react';
import { getRouteApi } from '@tanstack/react-router';

// @ts-expect-error - Paraglide generates JS without .d.ts files
import { m } from '@/paraglide/generated/messages.js';
import { useActiveTable, useActiveWorkGroups } from '../hooks/use-active-tables';
import type { ActiveFieldConfig, ActiveTable, ActiveWorkGroup } from '../types';
import { useTableEncryption } from '../hooks/use-table-encryption';
import { FieldSummary } from '@workspace/active-tables-core';
import { ROUTES } from '@/shared/route-paths';
import { ErrorCard } from '@/components/error-display';

import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Skeleton } from '@workspace/ui/components/skeleton';
import { Heading, Text } from '@workspace/ui/components/typography';
import { EncryptionKeyModal } from '../components/encryption-key-modal';
import { EncryptionStatusCard } from '../components/encryption-status-card';
import { EncryptionTypeBreakdown } from '../components/encryption-type-breakdown';

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

const useActiveTableDetail = (table: ActiveTable | undefined, workGroups: ActiveWorkGroup[] | undefined) => {
  return useMemo(() => {
    if (!table) {
      return { table: undefined, workGroup: undefined };
    }
    const workGroup = workGroups?.find((group) => group.id === table.workGroupId);
    return { table, workGroup };
  }, [table, workGroups]);
};

// Type-safe route API for table detail route
const route = getRouteApi(ROUTES.ACTIVE_TABLES.TABLE_DETAIL);

export const ActiveTableDetailPage = () => {
  const navigate = route.useNavigate();
  const { tableId, workspaceId, locale } = route.useParams();

  // Fetch only the specific table instead of all tables
  const { data: tableResp, isLoading: tableLoading, error: tableError } = useActiveTable(workspaceId, tableId);

  // Only fetch workGroups (we need this for the breadcrumb display)
  const { data: workGroupsResp, isLoading: workGroupsLoading } = useActiveWorkGroups(workspaceId);

  const { table, workGroup } = useActiveTableDetail(tableResp?.data, workGroupsResp?.data);

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
    navigate({
      to: ROUTES.ACTIVE_TABLES.LIST,
      params: { locale, workspaceId },
    });
  };

  const handleViewRecords = () => {
    if (!tableId || !workspaceId) return;

    navigate({
      to: ROUTES.ACTIVE_TABLES.TABLE_RECORDS,
      params: { locale, workspaceId, tableId },
    });
  };

  const handleViewSettings = () => {
    if (!tableId || !workspaceId) return;

    navigate({
      to: ROUTES.ACTIVE_TABLES.TABLE_SETTINGS,
      params: { locale, workspaceId, tableId },
    });
  };

  const encryptionBadge = encryption.isE2EEEnabled ? (
    <Badge
      variant="outline"
      size="compact"
      className={`flex items-center gap-2 ${
        encryption.keyValidationStatus === 'valid' ? 'border-success text-success' : 'border-warning text-warning'
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
    <Badge variant="secondary" size="compact" className="flex items-center gap-2">
      <Shield className="h-4 w-4" />
      Server Encryption
    </Badge>
  );

  const isLoading = tableLoading || workGroupsLoading;

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

  // Error state - use enhanced error display
  if (tableError) {
    return (
      <div className="space-y-6 p-6">
        <Button variant="ghost" onClick={handleBack} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          {m.activeTables_detail_backToList()}
        </Button>
        <ErrorCard error={tableError} onBack={handleBack} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  // Not found state
  if (!tableId || !table) {
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
              <Badge variant="outline" size="compact" className="flex items-center gap-2">
                <ListTree className="h-3.5 w-3.5" />
                {workGroup.name}
              </Badge>
            ) : null}
          </div>

          <Heading level={1}>{table.name}</Heading>
          {table.description ? (
            <Text size="small" color="muted" className="max-w-2xl leading-relaxed">
              {table.description}
            </Text>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {encryptionBadge}
          <Badge variant="outline" size="compact" className="flex items-center gap-1">
            <LinkIcon className="h-3.5 w-3.5" />
            {m.activeTables_detail_tableType({ type: table.tableType })}
          </Badge>
          <Badge variant="outline" size="compact" className="flex items-center gap-1">
            <Lock className="h-3.5 w-3.5" />
            {m.activeTables_detail_fieldCount({ count: table.config?.fields?.length ?? 0 })}
          </Badge>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleViewSettings}>
              <Settings2 className="mr-2 h-4 w-4" />
              Settings
            </Button>
            <Button variant="outline" size="sm" onClick={handleViewRecords}>
              {m.activeTables_detail_viewRecords()}
            </Button>
          </div>
        </div>
      </div>

      <EncryptionStatusCard table={table} encryption={encryption} onEnterKey={() => setIsEncryptionModalOpen(true)} />

      <EncryptionTypeBreakdown
        fields={table.config?.fields ?? []}
        hashedKeywordFields={table.config?.hashedKeywordFields ?? []}
        isE2EEEnabled={encryption.isE2EEEnabled}
      />

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <Heading level={2}>{m.activeTables_detail_fieldsTitle()}</Heading>
          <Badge variant="outline" size="compact">
            {m.activeTables_detail_visibleFields({ count: table.config?.fields?.length ?? 0 })}
          </Badge>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {table.config?.fields?.map((field) => (
            <FieldSummary
              key={field.name}
              field={field}
              isE2EEEnabled={encryption.isE2EEEnabled}
              messages={{
                required: m.activeTables_detail_fieldRequired(),
                optional: m.activeTables_detail_fieldOptional(),
                options: (count: number) => m.activeTables_detail_fieldOptions({ count }),
              }}
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
