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
import { useSidebarStore } from '@/stores/sidebar-store';
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
import { Box, Stack, Inline, Grid } from '@workspace/ui/components/primitives';

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
  const currentWorkspace = useSidebarStore((state) => state.currentWorkspace);

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
    <Box padding="space-300">
      <Stack space="space-300">
        {/* Header section with title, search, and buttons */}
        {/* TODO: Migrate to primitives when responsive gap support is added */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <Stack space="space-025">
            <Heading level={1}>{m.activeTables_page_title()}</Heading>
            <Text size="small" color="muted">
              {currentWorkspace?.workspaceName
                ? `Workspace • ${currentWorkspace.workspaceName}`
                : m.activeTables_page_subtitle()}
            </Text>
          </Stack>

          {/* TODO: Migrate to primitives when responsive gap support is added */}
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
            <Inline space="space-050" align="center">
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
            </Inline>
          </div>
        </div>

        {/* Stat badges section */}
        <Inline space="space-250" align="center" wrap className="gap-y-[var(--space-250)]">
          <StatBadge icon={Database} value={totalTables} label="Apps" color="accent-blue" loading={isTablesLoading} />
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

        {/* Alert section */}
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

        {/* Filter section */}
        <Stack space="space-100">
          <Inline space="space-050" wrap className="text-xs text-muted-foreground">
            <Badge variant="outline" className="border-dashed">
              {m.activeTables_page_totalTables({ count: filteredTotalTables })}
            </Badge>
            <Badge variant="secondary" className="border-dashed">
              {m.activeTables_page_totalWorkGroups({ count: workGroups.length })}
            </Badge>
            <div className="rounded-full border border-border/60 text-xs text-foreground">
              <Box padding="space-025" className="px-3">
                <Inline space="space-050" align="center">
                  <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                  {activeFilterCount
                    ? `${activeFilterCount} filter${activeFilterCount > 1 ? 's' : ''} active`
                    : 'No filters applied'}
                </Inline>
              </Box>
            </div>
          </Inline>

          <Box padding="space-100" backgroundColor="card" borderRadius="xl" border="default" className="shadow-sm">
            {/* Workgroup Tabs Section - Level 2: Navigation with border-bottom accent */}
            <Stack space="space-300">
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

              {/* Filter Rows Section */}
              <Stack space="space-100">
                {/* Status Filter */}
                {statusOptions.length ? (
                  <Inline space="space-100" align="start">
                    <Text size="small" weight="medium" className="min-w-[100px] text-muted-foreground pt-1">
                      Status
                    </Text>
                    <Inline space="space-075" wrap align="center" className="flex-1">
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
                          className="h-7 text-xs text-muted-foreground hover:text-foreground"
                        >
                          {showAllStatusFilters
                            ? '− Less'
                            : `+ More (${statusOptions.length - priorityStatusFilters.filter((pf) => statusOptions.includes(pf)).length})`}
                        </Button>
                      )}
                    </Inline>
                  </Inline>
                ) : null}

                {/* Encryption Filter */}
                <Inline space="space-100" align="start">
                  <Text size="small" weight="medium" className="min-w-[100px] text-muted-foreground pt-1">
                    Encryption
                  </Text>
                  <Inline space="space-075" wrap align="center" className="flex-1">
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
                    <FilterChip
                      active={encryptionFilter === 'standard'}
                      onClick={() => setEncryptionFilter('standard')}
                    >
                      Server-side
                    </FilterChip>
                  </Inline>
                </Inline>

                {/* Automation Filter */}
                <Inline space="space-100" align="start">
                  <Text size="small" weight="medium" className="min-w-[100px] text-muted-foreground pt-1">
                    Automation
                  </Text>
                  <Inline space="space-075" wrap align="center" className="flex-1">
                    <FilterChip active={automationFilter === 'all'} onClick={() => setAutomationFilter('all')}>
                      All
                    </FilterChip>
                    <FilterChip
                      active={automationFilter === 'automated'}
                      onClick={() => setAutomationFilter('automated')}
                    >
                      With workflows
                    </FilterChip>
                    <FilterChip active={automationFilter === 'manual'} onClick={() => setAutomationFilter('manual')}>
                      Manual only
                    </FilterChip>
                  </Inline>
                </Inline>
              </Stack>
            </Stack>
          </Box>
        </Stack>

        {isTablesLoading ? (
          <Grid columns={2} gap="space-300" className="xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-64 w-full rounded-xl" />
            ))}
          </Grid>
        ) : null}

        {!isTablesLoading && error ? (
          <ErrorCard error={error} onRetry={() => refetch()} showDetails={import.meta.env.DEV} />
        ) : null}

        {!isTablesLoading && !error && !hasAnyTables ? <ActiveTablesEmptyState onCreate={handleCreateTable} /> : null}

        {!isTablesLoading && !error && hasAnyTables ? (
          <Stack space="space-400">
            {filteredGroups.map(({ group, tables }) => (
              <section key={group.id}>
                <Stack space="space-100">
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
                  <Grid
                    columns={1}
                    gap="space-100"
                    className="sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4"
                  >
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
                  </Grid>
                </Stack>
              </section>
            ))}
          </Stack>
        ) : null}

        <TableManagementDialog
          open={isTableDialogOpen}
          onOpenChange={setIsTableDialogOpen}
          table={editingTable}
          workGroups={workGroups}
          onSave={handleSaveTable}
          isLoading={isCreating || isUpdating}
        />
      </Stack>
    </Box>
  );
};

export default ActiveTablesPage;
