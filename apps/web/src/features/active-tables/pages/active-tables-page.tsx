import { useEffect, useState, useMemo } from 'react';
import {
  RefreshCw,
  Search,
  Plus,
  ShieldCheck,
  Database,
  Workflow,
  KeyRound,
  Filter,
} from 'lucide-react';

import { ActiveTableCard } from '../components/active-table-card';
import { useActiveTablesGroupedByWorkGroup } from '../hooks/use-active-tables';
import { ActiveTablesEmptyState } from '../components/active-tables-empty-state';
import { TableManagementDialog } from '../components/table-management-dialog';
import { useTableManagement } from '../hooks/use-table-management';
// @ts-ignore
import { m } from "@/paraglide/generated/messages.js";
import { getRouteApi } from '@tanstack/react-router';
import { useSidebarStore, selectCurrentWorkspace } from '@/stores/sidebar-store';
import { ROUTES } from '@/shared/route-paths';

import { Button } from '@workspace/ui/components/button';
import { Skeleton } from '@workspace/ui/components/skeleton';
import { Badge } from '@workspace/ui/components/badge';
import { Input } from '@workspace/ui/components/input';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Alert, AlertDescription, AlertTitle } from '@workspace/ui/components/alert';
import { cn } from '@workspace/ui/lib/utils';
import type { ActiveTable } from '../types';
import { useEncryption } from '../hooks/use-encryption-stub';

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

  const { createTable, updateTable, deleteTable, isCreating, isUpdating, isDeleting } = useTableManagement({
    workspaceId: workspaceId || '',
    onSuccess: (message) => {
      console.log(message);
      setIsTableDialogOpen(false);
      setEditingTable(null);
      refetch();
    },
    onError: (error) => {
      console.error(error);
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
    () => grouped.reduce((count, entry) => count + entry.tables.filter((table) => table.config?.e2eeEncryption).length, 0),
    [grouped],
  );
  const automationEnabledTables = useMemo(
    () =>
      grouped.reduce(
        (count, entry) =>
          count + entry.tables.filter((table) => (table.config?.actions?.length ?? 0) > 0).length,
        0,
      ),
    [grouped],
  );
  const encryptedPercentage = totalTables
    ? Math.round((encryptedTables / totalTables) * 100)
    : 0;

  const filteredGroups = useMemo(() => {
    if (!searchQuery) {
      return visibleGroups
        .map((groupEntry) => ({
          ...groupEntry,
          tables: groupEntry.tables.filter((table) => {
            const statusMatches =
              statusFilter === 'all' || formatStatusLabel(table.tableType) === statusFilter;
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
    return visibleGroups.map((groupEntry) => ({
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
    })).filter(groupEntry => groupEntry.tables.length > 0);
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

  const handleSaveTable = async (tableData: any) => {
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
            <h1 className="text-3xl font-bold tracking-tight">{m.activeTables_page_title()}</h1>
            <p className="text-sm text-muted-foreground">
              {currentWorkspace?.workspaceName
                ? `Workspace • ${currentWorkspace.workspaceName}`
                : m.activeTables_page_subtitle()}
            </p>
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
                Workspace • <span className="font-medium text-foreground">{currentWorkspace?.workspaceName || 'No workspace'}</span>
              </div>
              <Button variant="outline" size="icon" disabled={isTablesLoading} onClick={() => refetch()}>
                <RefreshCw className={cn('h-4 w-4', isFetching && 'animate-spin')} />
              </Button>
              <Button onClick={handleCreateTable} disabled={!workspaceId}>
                <Plus className="mr-2 h-4 w-4" />
                Create Table
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-border/60 bg-gradient-to-br from-background to-muted/20 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/20">
                  <Database className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <span>Modules</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold tracking-tight text-foreground">{totalTables}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Across {workGroups.length} workgroup{workGroups.length === 1 ? '' : 's'}
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-gradient-to-br from-background to-muted/20 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/20">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <span>Encrypted</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold tracking-tight text-foreground">{encryptedTables}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {encryptedTables ? `${encryptedPercentage}% with E2EE protection` : 'Ready to secure sensitive data'}
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-gradient-to-br from-background to-muted/20 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/20">
                  <Workflow className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <span>Automations</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold tracking-tight text-foreground">{automationEnabledTables}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Trigger workflows from records
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {shouldShowEncryptionReminder ? (
        <Alert className="border-amber-300 bg-amber-50/80 text-amber-900 dark:border-amber-500/40 dark:bg-amber-950/40 dark:text-amber-100">
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
            {activeFilterCount ? `${activeFilterCount} filter${activeFilterCount > 1 ? 's' : ''} active` : 'No filters applied'}
          </div>
        </div>

        <div className="flex flex-col gap-3 rounded-xl border border-border/60 bg-muted/20 p-4">
          <div className="flex flex-wrap items-center gap-2">
          <Button
            variant={selectedWorkGroupId === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedWorkGroupId('all')}
          >
            {m.activeTables_page_workGroupAll()}
          </Button>
          {workGroups.map((group) => (
            <Button
              key={group.id}
              variant={selectedWorkGroupId === group.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedWorkGroupId(group.id)}
            >
              {group.name}
            </Button>
          ))}
        </div>

          {statusOptions.length ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground min-w-[80px]">Status</span>
                <div className="flex flex-wrap items-center gap-1.5">
                  <Button
                    size="sm"
                    variant={statusFilter === 'all' ? 'default' : 'outline'}
                    onClick={() => setStatusFilter('all')}
                    className="h-7 px-2.5 text-xs"
                  >
                    All
                  </Button>
                  {statusOptions
                    .filter((status) => showAllStatusFilters || priorityStatusFilters.includes(status))
                    .map((status) => (
                      <Button
                        key={status}
                        size="sm"
                        variant={statusFilter === status ? 'default' : 'outline'}
                        className="capitalize h-7 px-2.5 text-xs"
                        onClick={() => setStatusFilter(status)}
                      >
                        {status}
                      </Button>
                    ))}
                  {statusOptions.length > priorityStatusFilters.length && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowAllStatusFilters(!showAllStatusFilters)}
                      className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                    >
                      {showAllStatusFilters
                        ? '− Less'
                        : `+ More (${statusOptions.length - priorityStatusFilters.filter((pf) => statusOptions.includes(pf)).length})`}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ) : null}

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground min-w-[80px]">Encryption</span>
              <div className="flex flex-wrap items-center gap-1.5">
                <Button
                  size="sm"
                  variant={encryptionFilter === 'all' ? 'default' : 'outline'}
                  onClick={() => setEncryptionFilter('all')}
                  className="h-7 px-2.5 text-xs"
                >
                  All
                </Button>
                <Button
                  size="sm"
                  variant={encryptionFilter === 'encrypted' ? 'default' : 'outline'}
                  onClick={() => setEncryptionFilter('encrypted')}
                  className="h-7 px-2.5 text-xs"
                >
                  E2EE
                </Button>
                <Button
                  size="sm"
                  variant={encryptionFilter === 'standard' ? 'default' : 'outline'}
                  onClick={() => setEncryptionFilter('standard')}
                  className="h-7 px-2.5 text-xs"
                >
                  Server-side
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground min-w-[80px]">Automation</span>
              <div className="flex flex-wrap items-center gap-1.5">
                <Button
                  size="sm"
                  variant={automationFilter === 'all' ? 'default' : 'outline'}
                  onClick={() => setAutomationFilter('all')}
                  className="h-7 px-2.5 text-xs"
                >
                  All
                </Button>
                <Button
                  size="sm"
                  variant={automationFilter === 'automated' ? 'default' : 'outline'}
                  onClick={() => setAutomationFilter('automated')}
                  className="h-7 px-2.5 text-xs"
                >
                  With workflows
                </Button>
                <Button
                  size="sm"
                  variant={automationFilter === 'manual' ? 'default' : 'outline'}
                  onClick={() => setAutomationFilter('manual')}
                  className="h-7 px-2.5 text-xs"
                >
                  Manual only
                </Button>
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
        <div className="rounded-lg border border-destructive bg-destructive/20 p-6 text-sm text-destructive">
          {error instanceof Error ? error.message : m.activeTables_page_errorGeneric()}
        </div>
      ) : null}

      {!isTablesLoading && !error && !hasAnyTables ? <ActiveTablesEmptyState onCreate={handleCreateTable} /> : null}

      {!isTablesLoading && !error && hasAnyTables ? (
        <div className="space-y-8">
          {filteredGroups.map(({ group, tables }) => (
            <section key={group.id} className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">{group.name}</h2>
                  {group.description ? <p className="text-sm text-muted-foreground">{group.description}</p> : null}
                </div>
                <Badge variant="outline" className="bg-background">
                  {m.activeTables_page_groupTableCount({ count: tables.length })}
                </Badge>
              </div>
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
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
