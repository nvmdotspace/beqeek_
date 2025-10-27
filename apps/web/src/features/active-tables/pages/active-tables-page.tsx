import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, RefreshCw, Search, Plus, Edit, Trash2, ShieldCheck, Database, FolderOpen } from 'lucide-react';

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
import type { ActiveTable } from '../types';

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
  const localePrefix = (locale as string) === 'vi' ? '' : `/${locale}`;

  useEffect(() => {
    if (!selectedWorkspaceId && workspaceOptions.length > 0) {
      setSelectedWorkspaceId(workspaceOptions[0]!.id);
    }
  }, [selectedWorkspaceId, workspaceOptions]);

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

  const totalTables = grouped.reduce((count, entry) => count + entry.tables.length, 0);

  const filteredGroups = useMemo(() => {
    if (!searchQuery) {
      return visibleGroups;
    }
    const lowerCaseQuery = searchQuery.toLowerCase();
    return visibleGroups.map((groupEntry) => ({
      ...groupEntry,
      tables: groupEntry.tables.filter(
        (table) =>
          table.name.toLowerCase().includes(lowerCaseQuery) ||
          table.description?.toLowerCase().includes(lowerCaseQuery),
      ),
    })).filter(groupEntry => groupEntry.tables.length > 0);
  }, [visibleGroups, searchQuery]);

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

  const handleEditTable = (table: ActiveTable) => {
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

  return (
    <div className="space-y-6 p-6">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl p-6 border">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Active Tables</h1>
            <p className="text-lg text-muted-foreground">
              Structured data management with workflows, encryption & team collaboration
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <div className="flex items-center gap-2 text-sm bg-white/60 dark:bg-gray-800/60 px-3 py-1 rounded-full">
                <ShieldCheck className="h-4 w-4 text-green-600" />
                End-to-End Encryption
              </div>
              <div className="flex items-center gap-2 text-sm bg-white/60 dark:bg-gray-800/60 px-3 py-1 rounded-full">
                <Database className="h-4 w-4 text-blue-600" />
                Flexible Schema
              </div>
              <div className="flex items-center gap-2 text-sm bg-white/60 dark:bg-gray-800/60 px-3 py-1 rounded-full">
                <FolderOpen className="h-4 w-4 text-purple-600" />
                Workflow Integration
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-full md:w-auto">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={m.activeTables_page_searchPlaceholder()}
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="min-w-[220px] justify-between">
                <span className="truncate">
                  {isWorkspacesLoading
                    ? m.activeTables_page_workspaceLoading()
                    : (workspaceOptions.find((workspace) => workspace.id === selectedWorkspaceId)?.workspaceName ??
                      m.activeTables_page_workspacePlaceholder())}
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
                    <span className="text-xs uppercase tracking-wide text-muted-foreground">{workspace.namespace}</span>
                  ) : null}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="icon" disabled={isTablesLoading} onClick={() => refetch()}>
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          </Button>
            <Button onClick={handleCreateTable} disabled={!selectedWorkspaceId}>
              <Plus className="h-4 w-4 mr-2" />
              Create Table
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="bg-background">
            {m.activeTables_page_totalTables({ count: totalTables })}
          </Badge>
          <Badge variant="default">{m.activeTables_page_totalWorkGroups({ count: workGroups.length })}</Badge>
        </div>

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

      {!isTablesLoading && !error && !hasAnyTables ? <ActiveTablesEmptyState /> : null}

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
                    onEdit={handleEditTable}
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
