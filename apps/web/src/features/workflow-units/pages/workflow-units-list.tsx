import { useState, useMemo } from 'react';
import { getRouteApi } from '@tanstack/react-router';
import { Box, Stack, Inline, Grid } from '@workspace/ui/components/primitives';
import { Heading, Text } from '@workspace/ui/components/typography';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Badge } from '@workspace/ui/components/badge';
import { Skeleton } from '@workspace/ui/components/skeleton';
import { Plus, RefreshCw, Search, Boxes, Calendar, Globe } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@workspace/ui/components/alert';
import { cn } from '@workspace/ui/lib/utils';
import { useWorkflowUnits } from '../hooks/use-workflow-units';
import { WorkflowUnitCard } from '../components/workflow-unit-card';
import { CreateWorkflowUnitDialog } from '../components/dialogs/create-workflow-unit-dialog';
import { EditWorkflowUnitDialog } from '../components/dialogs/edit-workflow-unit-dialog';
import { DeleteConfirmDialog } from '../components/dialogs/delete-confirm-dialog';
import { StatBadge } from '@/features/workspace/components/stat-badge';
import { useSidebarStore } from '@/stores/sidebar-store';
import type { WorkflowUnit } from '../api/types';

const route = getRouteApi('/$locale/workspaces/$workspaceId/workflow-units/');

export default function WorkflowUnitsListPage() {
  const { workspaceId, locale } = route.useParams();
  const { data: units, isLoading, isFetching, error, refetch } = useWorkflowUnits(workspaceId);
  const currentWorkspace = useSidebarStore((state) => state.currentWorkspace);

  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [editUnit, setEditUnit] = useState<WorkflowUnit | null>(null);
  const [deleteUnit, setDeleteUnit] = useState<WorkflowUnit | null>(null);

  // Filter units by search query
  const filteredUnits = useMemo(() => {
    if (!units) return [];
    if (!search.trim()) return units;

    const query = search.toLowerCase();
    return units.filter(
      (unit) => unit.name.toLowerCase().includes(query) || unit.description?.toLowerCase().includes(query),
    );
  }, [units, search]);

  // Calculate stats
  const totalUnits = units?.length ?? 0;
  const activeUnits = units?.length ?? 0; // TODO: Add activeCount when backend provides it
  const scheduledUnits = units?.length ?? 0; // TODO: Add scheduledCount when backend provides it

  if (error) {
    return (
      <Box padding="space-300">
        <Alert variant="destructive">
          <AlertTitle>Error Loading Workflow Units</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : 'Failed to load workflow units. Please try again.'}
          </AlertDescription>
        </Alert>
      </Box>
    );
  }

  return (
    <Box padding="space-300">
      <Stack space="space-300">
        {/* Header section with title, search, and buttons */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <Stack space="space-025">
            <Heading level={1}>Workflow Units</Heading>
            <Text size="small" color="muted">
              {currentWorkspace?.workspaceName
                ? `Workspace • ${currentWorkspace.workspaceName}`
                : 'Manage your workflow automation units'}
            </Text>
          </Stack>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search workflow units..."
                className="h-10 rounded-lg border-border/60 pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Inline space="space-050" align="center">
              <div className="text-sm text-muted-foreground">
                Workspace •{' '}
                <span className="font-medium text-foreground">{currentWorkspace?.workspaceName || 'No workspace'}</span>
              </div>
              <Button variant="outline" size="icon" disabled={isLoading} onClick={() => refetch()}>
                <RefreshCw className={cn('h-4 w-4', isFetching && 'animate-spin')} />
              </Button>
              <Button variant="brand-primary" size="sm" onClick={() => setCreateOpen(true)} disabled={!workspaceId}>
                Create
              </Button>
            </Inline>
          </div>
        </div>

        {/* Stat badges section */}
        <Inline space="space-250" align="center" wrap className="gap-y-[var(--space-250)]">
          <StatBadge icon={Boxes} value={totalUnits} label="Units" color="accent-blue" loading={isLoading} />
          <StatBadge
            icon={Calendar}
            value={scheduledUnits}
            label="Scheduled"
            color="accent-purple"
            loading={isLoading}
          />
          <StatBadge icon={Globe} value={activeUnits} label="Active" color="success" loading={isLoading} />
        </Inline>

        {/* Summary info */}
        <Stack space="space-100">
          <Inline space="space-050" wrap className="text-xs text-muted-foreground">
            <Badge variant="outline" className="border-dashed">
              {filteredUnits.length} {filteredUnits.length === 1 ? 'unit' : 'units'}
            </Badge>
            {search && (
              <Badge variant="secondary" className="border-dashed">
                Filtered from {totalUnits} total
              </Badge>
            )}
          </Inline>
        </Stack>

        {/* Loading State */}
        {isLoading && (
          <Grid
            columns={1}
            gap="space-300"
            className="sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4"
          >
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-48 w-full rounded-xl" />
            ))}
          </Grid>
        )}

        {/* Empty State - No Units */}
        {!isLoading && units && units.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center rounded-xl border-2 border-dashed border-border bg-muted/20">
            <Boxes className="h-12 w-12 mb-4 text-muted-foreground" />
            <Heading level={3} className="mb-2">
              No workflow units yet
            </Heading>
            <Text color="muted" className="mb-4 max-w-md">
              Create your first workflow unit to start automating business processes
            </Text>
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="size-4 mr-2" />
              Create First Unit
            </Button>
          </div>
        )}

        {/* Empty State - No Search Results */}
        {!isLoading && filteredUnits.length === 0 && units && units.length > 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center rounded-xl border-2 border-dashed border-border bg-muted/20">
            <Search className="h-12 w-12 mb-4 text-muted-foreground" />
            <Heading level={3} className="mb-2">
              No results found
            </Heading>
            <Text color="muted" className="mb-4">
              No workflow units match "{search}"
            </Text>
            <Button variant="outline" onClick={() => setSearch('')}>
              Clear search
            </Button>
          </div>
        )}

        {/* Units Grid */}
        {!isLoading && filteredUnits.length > 0 && (
          <Grid
            columns={1}
            gap="space-300"
            className="sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4"
          >
            {filteredUnits.map((unit) => (
              <WorkflowUnitCard
                key={unit.id}
                unit={unit}
                workspaceId={workspaceId}
                locale={locale}
                onEdit={setEditUnit}
                onDelete={setDeleteUnit}
              />
            ))}
          </Grid>
        )}
      </Stack>

      {/* Dialogs */}
      <CreateWorkflowUnitDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        workspaceId={workspaceId}
        locale={locale}
      />

      {editUnit && (
        <EditWorkflowUnitDialog
          open={!!editUnit}
          onOpenChange={(open) => !open && setEditUnit(null)}
          workspaceId={workspaceId}
          unit={editUnit}
        />
      )}

      {deleteUnit && (
        <DeleteConfirmDialog
          open={!!deleteUnit}
          onOpenChange={(open) => !open && setDeleteUnit(null)}
          workspaceId={workspaceId}
          locale={locale}
          unit={deleteUnit}
        />
      )}
    </Box>
  );
}
