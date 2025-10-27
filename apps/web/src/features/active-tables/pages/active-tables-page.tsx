import { useEffect, useMemo, useState } from 'react';
import {
  ChevronDown,
  RefreshCw,
  Search,
  Plus,
  ShieldCheck,
  Database,
  Workflow,
  KeyRound,
  Filter,
} from 'lucide-react';

import { useWorkspaces } from '@/features/workspace/hooks/use-workspaces';
import { ActiveTableCard } from '../components/active-table-card';
import { useActiveTablesGroupedByWorkGroup } from '../hooks/use-active-tables';
import { ActiveTablesEmptyState } from '../components/active-tables-empty-state';
import { TableManagementDialog } from '../components/table-management-dialog';
import { useTableManagement } from '../hooks/use-table-management';
// @ts-ignore
import { m } from "@/paraglide/generated/messages.js";
import { useLocation, useNavigate } from '@tanstack/react-router';

import { Button } from '@workspace/ui/components/button';
import { Skeleton } from '@workspace/ui/components/skeleton';
import { Badge } from '@workspace/ui/components/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu';
import { Input } from '@workspace/ui/components/input';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Alert, AlertDescription, AlertTitle } from '@workspace/ui/components/alert';
import { cn } from '@workspace/ui/lib/utils';
import type { ActiveTable } from '../types';
import { useEncryption } from '@workspace/active-tables-hooks';

const formatStatusLabel = (tableType?: string) => {
  if (!tableType) return 'standard';
  return tableType.replace(/[_-]/g, ' ').toLowerCase();
};

export const ActiveTablesPage = () => {
  const locale = 'en'; // Placeholder for locale
  const location = useLocation();
  const { data: workspacesData, isLoading: isWorkspacesLoading } = useWorkspaces();
  const navigate = useNavigate();
  const workspaceOptions = useMemo(() => workspacesData?.data ?? [], [workspacesData]);
  const search = (location.search ?? {}) as Record<string, unknown>;
  const workspaceParam = typeof search.workspaceId === 'string' ? search.workspaceId : undefined;
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>(workspaceParam || '');
  const [selectedWorkGroupId, setSelectedWorkGroupId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isTableDialogOpen, setIsTableDialogOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<ActiveTable | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [encryptionFilter, setEncryptionFilter] = useState<'all' | 'encrypted' | 'standard'>('all');
  const [automationFilter, setAutomationFilter] = useState<'all' | 'automated' | 'manual'>('all');
  const localePrefix = (locale as string) === 'vi' ? '' : `/${locale}`;
  const { isReady: isEncryptionReady } = useEncryption();

  useEffect(() => {
    if (!selectedWorkspaceId && workspaceOptions.length > 0) {
      setSelectedWorkspaceId(workspaceOptions[0]!.id);
    }
  }, [selectedWorkspaceId, workspaceOptions]);

  useEffect(() => {
    setStatusFilter('all');
    setEncryptionFilter('all');
    setAutomationFilter('all');
    setSearchQuery('');
  }, [selectedWorkspaceId]);

  const {
    grouped,
    workGroups,
    hasAnyTables,
    isLoading: isTablesLoading,
    isFetching,
    error,
    refetch,
  } = useActiveTablesGroupedByWorkGroup(selectedWorkspaceId || '');

  const { createTable, updateTable, deleteTable, isCreating, isUpdating, isDeleting } = useTableManagement({
    workspaceId: selectedWorkspaceId || '',
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
  }, [selectedWorkspaceId]);

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

  const workspaceName = useMemo(
    () => workspaceOptions.find((workspace) => workspace.id === selectedWorkspaceId)?.workspaceName,
    [workspaceOptions, selectedWorkspaceId],
  );
  const shouldShowEncryptionReminder = encryptedTables > 0 && !isEncryptionReady;
  const activeFilterCount =
    (statusFilter !== 'all' ? 1 : 0) +
    (encryptionFilter !== 'all' ? 1 : 0) +
    (automationFilter !== 'all' ? 1 : 0) +
    (selectedWorkGroupId !== 'all' ? 1 : 0);

  const handleOpenTable = (table: ActiveTable) => {
    if (!selectedWorkspaceId) {
      return;
    }

    navigate({
      to: `${localePrefix}/workspaces/tables/${table.id}`,
      search: { workspaceId: selectedWorkspaceId },
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
    if (!selectedWorkspaceId) return;
    navigate({
      to: `${localePrefix}/workspaces/tables/${table.id}/records`,
      search: { workspaceId: selectedWorkspaceId },
    });
  };

  const handleOpenComments = (table: ActiveTable) => {
    if (!selectedWorkspaceId) return;
    navigate({
      to: `${localePrefix}/workspaces/tables/${table.id}/records`,
      search: { workspaceId: selectedWorkspaceId, panel: 'comments' },
    });
  };

  const handleOpenAutomations = (table: ActiveTable) => {
    if (!selectedWorkspaceId) return;
    navigate({
      to: `${localePrefix}/workspaces/tables/${table.id}`,
      search: { workspaceId: selectedWorkspaceId, section: 'automations' },
    });
  };

  const filteredTotalTables = filteredGroups.reduce((count, entry) => count + entry.tables.length, 0);

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Active Tables</h1>
            <p className="text-sm text-muted-foreground">
              {workspaceName
                ? `Workspace • ${workspaceName}`
                : 'Select a workspace to explore configured Active Tables.'}
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-10 min-w-[220px] justify-between rounded-lg">
                    <span className="truncate text-sm">
                      {isWorkspacesLoading
                        ? m.activeTables_page_workspaceLoading()
                        : workspaceName ?? m.activeTables_page_workspacePlaceholder()}
                    </span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64">
                  {workspaceOptions.map((workspace) => (
                    <DropdownMenuItem
                      key={workspace.id}
                      onSelect={() => setSelectedWorkspaceId(workspace.id)}
                      className="flex flex-col items-start gap-1"
                    >
                      <span className="font-medium leading-tight">{workspace.workspaceName}</span>
                      {workspace.namespace ? (
                        <span className="text-xs uppercase tracking-wide text-muted-foreground">
                          {workspace.namespace}
                        </span>
                      ) : null}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="outline" size="icon" disabled={isTablesLoading} onClick={() => refetch()}>
                <RefreshCw className={cn('h-4 w-4', isFetching && 'animate-spin')} />
              </Button>
              <Button onClick={handleCreateTable} disabled={!selectedWorkspaceId}>
                <Plus className="mr-2 h-4 w-4" />
                Create Table
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Database className="h-4 w-4 text-primary" />
                Active tables
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold text-foreground">{totalTables}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Across {workGroups.length} workgroup{workGroups.length === 1 ? '' : 's'}
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                End-to-end encrypted
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold text-foreground">{encryptedTables}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {encryptedTables ? `${encryptedPercentage}% of catalog` : 'Ready to secure sensitive data'}
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Workflow className="h-4 w-4 text-purple-500" />
                Automation ready
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold text-foreground">{automationEnabledTables}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Trigger workflows directly from table records
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
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="bg-background text-xs uppercase tracking-wide">
                Status
              </Badge>
              <Button
                size="sm"
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('all')}
              >
                All
              </Button>
              {statusOptions.map((status) => (
                <Button
                  key={status}
                  size="sm"
                  variant={statusFilter === status ? 'default' : 'outline'}
                  className="capitalize"
                  onClick={() => setStatusFilter(status)}
                >
                  {status}
                </Button>
              ))}
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="bg-background text-xs uppercase tracking-wide">
              Encryption
            </Badge>
            <Button
              size="sm"
              variant={encryptionFilter === 'all' ? 'default' : 'outline'}
              onClick={() => setEncryptionFilter('all')}
            >
              All
            </Button>
            <Button
              size="sm"
              variant={encryptionFilter === 'encrypted' ? 'default' : 'outline'}
              onClick={() => setEncryptionFilter('encrypted')}
            >
              E2EE
            </Button>
            <Button
              size="sm"
              variant={encryptionFilter === 'standard' ? 'default' : 'outline'}
              onClick={() => setEncryptionFilter('standard')}
            >
              Server-side
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="bg-background text-xs uppercase tracking-wide">
              Automation
            </Badge>
            <Button
              size="sm"
              variant={automationFilter === 'all' ? 'default' : 'outline'}
              onClick={() => setAutomationFilter('all')}
            >
              All
            </Button>
            <Button
              size="sm"
              variant={automationFilter === 'automated' ? 'default' : 'outline'}
              onClick={() => setAutomationFilter('automated')}
            >
              With workflows
            </Button>
            <Button
              size="sm"
              variant={automationFilter === 'manual' ? 'default' : 'outline'}
              onClick={() => setAutomationFilter('manual')}
            >
              Manual only
            </Button>
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
