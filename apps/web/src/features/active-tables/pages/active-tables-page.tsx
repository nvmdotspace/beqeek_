import { useEffect, useState, useMemo } from 'react';
import { RefreshCw, Search, ShieldCheck, Database, Workflow, KeyRound, Filter } from 'lucide-react';

import { ActiveTableCard } from '../components/active-table-card';
import { useActiveTablesGroupedByWorkGroup } from '../hooks/use-active-tables';
import { ActiveTablesEmptyState } from '../components/active-tables-empty-state';
import { TableManagementDialog } from '../components/table-management-dialog';
import type { TableFormData } from '../components/table-management-dialog';
import { useTableManagement } from '../hooks/use-table-management';
// @ts-expect-error - Paraglide generates JS without .d.ts files
import { m } from '@/paraglide/generated/messages.js';
import { getRouteApi } from '@tanstack/react-router';
import { useSidebarStore, selectCurrentWorkspace } from '@/stores/sidebar-store';
import { ROUTES } from '@/shared/route-paths';

import { Button } from '@workspace/ui/components/button';
import { FilterChip } from '@workspace/ui/components/filter-chip';
import { NavTab } from '@workspace/ui/components/nav-tab';
import { Skeleton } from '@workspace/ui/components/skeleton';
import { Badge } from '@workspace/ui/components/badge';
import { Input } from '@workspace/ui/components/input';
import { Alert, AlertDescription, AlertTitle } from '@workspace/ui/components/alert';
import { Heading, Text } from '@workspace/ui/components/typography';
import { cn } from '@workspace/ui/lib/utils';
import type { ActiveTable } from '../types';
import { useEncryption } from '../hooks/use-encryption-stub';
import { ErrorCard } from '@/components/error-display';
import { StatBadge } from '@/features/workspace/components/stat-badge';
import { Inline } from '@workspace/ui/components/primitives';

const formatStatusLabel = (tableType?: string) => {
  if (!tableType) return 'standard';
  return tableType.replace(/[_-]/g, ' ').toLowerCase();
};

// Type-safe route API for this route
const route = getRouteApi(ROUTES.ACTIVE_TABLES.LIST);

export const ActiveTablesPage = () => {
  const navigate = route.useNavigate();
  const { workspaceId, locale } = route.useParams();

  // Also sync with Zustand store for backward compatibility
  const currentWorkspace = useSidebarStore(selectCurrentWorkspace);

  const [selectedWorkGroupId, setSelectedWorkGroupId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isTableDialogOpen, setIsTableDialogOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<ActiveTable | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [encryptionFilter, setEncryptionFilter] = useState<'all' | 'encrypted' | 'standard'>('all');
  const [automationFilter, setAutomationFilter] = useState<'all' | 'automated' | 'manual'>('all');
  const [showAllStatusFilters, setShowAllStatusFilters] = useState<boolean>(false);
  const { isReady: isEncryptionReady } = useEncryption();

  // Priority STATUS filters (most common, shown by default)
  const priorityStatusFilters = ['employee profile', 'department', 'work process', 'contract'];

  // Reset filters when workspace changes
  useEffect(() => {
    setStatusFilter('all');
    setEncryptionFilter('all');
    setAutomationFilter('all');
    setSearchQuery('');
    setShowAllStatusFilters(false);
    setSelectedWorkGroupId('all');
  }, [workspaceId]);

  const {
    grouped,
    workGroups,
    hasAnyTables,
    isLoading: isTablesLoading,
    isFetching,
    error,
    refetch,
  } = useActiveTablesGroupedByWorkGroup(workspaceId || '');

  const { createTable, updateTable, deleteTable, isCreating, isUpdating } = useTableManagement({
    workspaceId: workspaceId || '',
    onSuccess: (message) => {
      console.log(message);
      setIsTableDialogOpen(false);
      setEditingTable(null);
      refetch();
    },
    onError: (error) => {
      console.error(error);
      // Error will be shown via toast in the hook
    },
  });

  useEffect(() => {
    setSelectedWorkGroupId('all');
  }, [workspaceId]);

  const visibleGroups = useMemo(() => {
    if (selectedWorkGroupId === 'all') {
      return grouped;
    }

    return grouped.filter((entry) => entry.group.id === selectedWorkGroupId);
  }, [grouped, selectedWorkGroupId]);

  const allTables = useMemo(() => visibleGroups.flatMap((entry) => entry.tables), [visibleGroups]);
  const totalTables = useMemo(() => grouped.reduce((count, entry) => count + entry.tables.length, 0), [grouped]);
  const encryptedTables = useMemo(
    () =>
      grouped.reduce((count, entry) => count + entry.tables.filter((table) => table.config?.e2eeEncryption).length, 0),
    [grouped],
  );
  const automationEnabledTables = useMemo(
    () =>
      grouped.reduce(
        (count, entry) => count + entry.tables.filter((table) => (table.config?.actions?.length ?? 0) > 0).length,
        0,
      ),
    [grouped],
  );

  const filteredGroups = useMemo(() => {
    if (!searchQuery) {
      return visibleGroups
        .map((groupEntry) => ({
          ...groupEntry,
          tables: groupEntry.tables.filter((table) => {
            const statusMatches = statusFilter === 'all' || formatStatusLabel(table.tableType) === statusFilter;
            const encryptionMatches =
              encryptionFilter === 'all' ||
              (encryptionFilter === 'encrypted' ? table.config?.e2eeEncryption : !table.config?.e2eeEncryption);
            const automationMatches =
              automationFilter === 'all' ||
              (automationFilter === 'automated'
                ? (table.config?.actions?.length ?? 0) > 0
                : (table.config?.actions?.length ?? 0) === 0);
            return statusMatches && encryptionMatches && automationMatches;
          }),
        }))
        .filter((entry) => entry.tables.length > 0);
    }
    const lowerCaseQuery = searchQuery.toLowerCase();
    return visibleGroups
      .map((groupEntry) => ({
        ...groupEntry,
        tables: groupEntry.tables.filter(
          (table) =>
            (table.name.toLowerCase().includes(lowerCaseQuery) ||
              table.description?.toLowerCase().includes(lowerCaseQuery)) &&
            (statusFilter === 'all' || formatStatusLabel(table.tableType) === statusFilter) &&
            (encryptionFilter === 'all' ||
              (encryptionFilter === 'encrypted' ? table.config?.e2eeEncryption : !table.config?.e2eeEncryption)) &&
            (automationFilter === 'all' ||
              (automationFilter === 'automated'
                ? (table.config?.actions?.length ?? 0) > 0
                : (table.config?.actions?.length ?? 0) === 0)),
        ),
      }))
      .filter((groupEntry) => groupEntry.tables.length > 0);
  }, [visibleGroups, searchQuery, statusFilter, encryptionFilter, automationFilter]);

  const statusOptions = useMemo(() => {
    const unique = new Set<string>();
    allTables.forEach((table) => {
      const label = formatStatusLabel(table.tableType);
      if (label) {
        unique.add(label);
      }
    });
    return Array.from(unique).sort();
  }, [allTables]);

  useEffect(() => {
    if (statusFilter !== 'all' && !statusOptions.includes(statusFilter)) {
      setStatusFilter('all');
    }
  }, [statusOptions, statusFilter]);

  const shouldShowEncryptionReminder = encryptedTables > 0 && !isEncryptionReady;
  const activeFilterCount =
    (statusFilter !== 'all' ? 1 : 0) +
    (encryptionFilter !== 'all' ? 1 : 0) +
    (automationFilter !== 'all' ? 1 : 0) +
    (selectedWorkGroupId !== 'all' ? 1 : 0);

  const handleOpenTable = (table: ActiveTable) => {
    if (!workspaceId) {
      return;
    }

    // Navigate to table detail - params are fully typed
    navigate({
      to: ROUTES.ACTIVE_TABLES.TABLE_DETAIL,
      params: { locale, workspaceId, tableId: table.id },
    });
  };

  const handleCreateTable = () => {
    setEditingTable(null);
    setIsTableDialogOpen(true);
  };

  const handleConfigureTable = (table: ActiveTable) => {
    setEditingTable(table);
    setIsTableDialogOpen(true);
  };

  const handleDeleteTable = async (table: ActiveTable) => {
    if (confirm(`Are you sure you want to delete "${table.name}"? This action cannot be undone.`)) {
      await deleteTable(table.id);
    }
  };

  const handleSaveTable = async (tableData: TableFormData) => {
    if (editingTable) {
      await updateTable(editingTable.id, tableData);
    } else {
      await createTable(tableData);
    }
  };

  const handleOpenRecords = (table: ActiveTable) => {
    if (!workspaceId) return;

    navigate({
      to: ROUTES.ACTIVE_TABLES.TABLE_RECORDS,
      params: { locale, workspaceId, tableId: table.id },
    });
  };

  const handleOpenComments = (table: ActiveTable) => {
    if (!workspaceId) return;

    navigate({
      to: ROUTES.ACTIVE_TABLES.TABLE_RECORDS,
      params: { locale, workspaceId, tableId: table.id },
    });
  };

  const handleOpenAutomations = (table: ActiveTable) => {
    if (!workspaceId) return;

    navigate({
      to: ROUTES.ACTIVE_TABLES.TABLE_DETAIL,
      params: { locale, workspaceId, tableId: table.id },
    });
  };

  const filteredTotalTables = filteredGroups.reduce((count, entry) => count + entry.tables.length, 0);

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <Heading level={1}>{m.activeTables_page_title()}</Heading>
            <Text size="small" color="muted">
              {currentWorkspace?.workspaceName
                ? `Workspace • ${currentWorkspace.workspaceName}`
                : m.activeTables_page_subtitle()}
            </Text>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={m.activeTables_page_searchPlaceholder()}
                className="h-10 rounded-lg border-border/60 pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <div className="text-sm text-muted-foreground">
                Workspace •{' '}
                <span className="font-medium text-foreground">{currentWorkspace?.workspaceName || 'No workspace'}</span>
              </div>
              <Button variant="outline" size="icon" disabled={isTablesLoading} onClick={() => refetch()}>
                <RefreshCw className={cn('h-4 w-4', isFetching && 'animate-spin')} />
              </Button>
              <Button variant="brand-primary" size="sm" onClick={handleCreateTable} disabled={!workspaceId}>
                Create
              </Button>
            </div>
          </div>
        </div>

        <Inline space="space-250" align="center" wrap className="gap-y-[var(--space-250)]">
          <StatBadge
            icon={Database}
            value={totalTables}
            label="Modules"
            color="accent-blue"
            loading={isTablesLoading}
          />
          <StatBadge
            icon={ShieldCheck}
            value={encryptedTables}
            label="Encrypted"
            color="success"
            loading={isTablesLoading}
          />
          <StatBadge
            icon={Workflow}
            value={automationEnabledTables}
            label="Automations"
            color="accent-purple"
            loading={isTablesLoading}
          />
        </Inline>
      </div>

      {shouldShowEncryptionReminder ? (
        <Alert className="border-warning bg-warning-subtle text-warning">
          <KeyRound className="h-4 w-4" />
          <AlertTitle>Encryption key vault not ready</AlertTitle>
          <AlertDescription className="text-sm">
            Restore your local encryption keys to unlock encrypted tables. Without the keys, you will not be able to
            read or update secured fields.
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="outline" className="border-dashed">
            {m.activeTables_page_totalTables({ count: filteredTotalTables })}
          </Badge>
          <Badge variant="secondary" className="border-dashed">
            {m.activeTables_page_totalWorkGroups({ count: workGroups.length })}
          </Badge>
          <div className="flex items-center gap-2 rounded-full border border-border/60 px-3 py-1 text-xs text-foreground">
            <Filter className="h-3.5 w-3.5 text-muted-foreground" />
            {activeFilterCount
              ? `${activeFilterCount} filter${activeFilterCount > 1 ? 's' : ''} active`
              : 'No filters applied'}
          </div>
        </div>

        <div className="rounded-xl border border-border/60 bg-card p-4 shadow-sm">
          {/* Workgroup Tabs Section - Level 2: Navigation with border-bottom accent */}
          <div className="mb-4">
            <div className="flex flex-wrap items-center gap-0 border-b border-border">
              <NavTab active={selectedWorkGroupId === 'all'} onClick={() => setSelectedWorkGroupId('all')} size="sm">
                {m.activeTables_page_workGroupAll()}
              </NavTab>
              {workGroups.map((group) => (
                <NavTab
                  key={group.id}
                  active={selectedWorkGroupId === group.id}
                  onClick={() => setSelectedWorkGroupId(group.id)}
                  size="sm"
                >
                  {group.name}
                </NavTab>
              ))}
            </div>
          </div>

          {/* Filter Rows Section */}
          <div className="space-y-3 pt-4 border-t border-border/40">
            {/* Status Filter */}
            {statusOptions.length ? (
              <div className="flex items-start gap-3">
                <Text size="small" weight="medium" className="min-w-[100px] text-muted-foreground pt-1.5">
                  Status
                </Text>
                <div className="flex-1 flex flex-wrap items-center gap-1.5">
                  <FilterChip active={statusFilter === 'all'} onClick={() => setStatusFilter('all')}>
                    All
                  </FilterChip>
                  {statusOptions
                    .filter((status) => showAllStatusFilters || priorityStatusFilters.includes(status))
                    .map((status) => (
                      <FilterChip
                        key={status}
                        active={statusFilter === status}
                        onClick={() => setStatusFilter(status)}
                        className="capitalize"
                      >
                        {status}
                      </FilterChip>
                    ))}
                  {statusOptions.length > priorityStatusFilters.length && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowAllStatusFilters(!showAllStatusFilters)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      {showAllStatusFilters
                        ? '− Less'
                        : `+ More (${statusOptions.length - priorityStatusFilters.filter((pf) => statusOptions.includes(pf)).length})`}
                    </Button>
                  )}
                </div>
              </div>
            ) : null}

            {/* Encryption Filter */}
            <div className="flex items-start gap-3">
              <Text size="small" weight="medium" className="min-w-[100px] text-muted-foreground pt-1.5">
                Encryption
              </Text>
              <div className="flex-1 flex flex-wrap items-center gap-1.5">
                <FilterChip active={encryptionFilter === 'all'} onClick={() => setEncryptionFilter('all')}>
                  All
                </FilterChip>
                <FilterChip
                  active={encryptionFilter === 'encrypted'}
                  onClick={() => setEncryptionFilter('encrypted')}
                  variant="success"
                >
                  E2EE
                </FilterChip>
                <FilterChip active={encryptionFilter === 'standard'} onClick={() => setEncryptionFilter('standard')}>
                  Server-side
                </FilterChip>
              </div>
            </div>

            {/* Automation Filter */}
            <div className="flex items-start gap-3">
              <Text size="small" weight="medium" className="min-w-[100px] text-muted-foreground pt-1.5">
                Automation
              </Text>
              <div className="flex-1 flex flex-wrap items-center gap-1.5">
                <FilterChip active={automationFilter === 'all'} onClick={() => setAutomationFilter('all')}>
                  All
                </FilterChip>
                <FilterChip active={automationFilter === 'automated'} onClick={() => setAutomationFilter('automated')}>
                  With workflows
                </FilterChip>
                <FilterChip active={automationFilter === 'manual'} onClick={() => setAutomationFilter('manual')}>
                  Manual only
                </FilterChip>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isTablesLoading ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-64 w-full rounded-xl" />
          ))}
        </div>
      ) : null}

      {!isTablesLoading && error ? (
        <ErrorCard error={error} onRetry={() => refetch()} showDetails={import.meta.env.DEV} />
      ) : null}

      {!isTablesLoading && !error && !hasAnyTables ? <ActiveTablesEmptyState onCreate={handleCreateTable} /> : null}

      {!isTablesLoading && !error && hasAnyTables ? (
        <div className="space-y-8">
          {filteredGroups.map(({ group, tables }) => (
            <section key={group.id} className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Heading level={2}>{group.name}</Heading>
                  {group.description ? (
                    <Text size="small" color="muted">
                      {group.description}
                    </Text>
                  ) : null}
                </div>
                <Badge variant="outline" className="bg-background">
                  {m.activeTables_page_groupTableCount({ count: tables.length })}
                </Badge>
              </div>
              <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4">
                {tables.map((table) => (
                  <ActiveTableCard
                    key={table.id}
                    table={table}
                    onOpen={handleOpenTable}
                    onConfigure={handleConfigureTable}
                    onOpenRecords={handleOpenRecords}
                    onOpenComments={handleOpenComments}
                    onOpenAutomations={handleOpenAutomations}
                    onDelete={handleDeleteTable}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : null}

      <TableManagementDialog
        open={isTableDialogOpen}
        onOpenChange={setIsTableDialogOpen}
        table={editingTable}
        workGroups={workGroups}
        onSave={handleSaveTable}
        isLoading={isCreating || isUpdating}
      />
    </div>
  );
};

export default ActiveTablesPage;
