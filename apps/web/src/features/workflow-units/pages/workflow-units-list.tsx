import { useState, useMemo } from 'react';
import { getRouteApi } from '@tanstack/react-router';
import { Container, Stack, Grid, GridItem, Inline } from '@workspace/ui/components/primitives';
import { Heading, Text } from '@workspace/ui/components/typography';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Plus, Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@workspace/ui/components/alert';
import { useWorkflowUnits } from '../hooks/use-workflow-units';
import { WorkflowUnitCard } from '../components/workflow-unit-card';
import { CreateWorkflowUnitDialog } from '../components/dialogs/create-workflow-unit-dialog';
import { EditWorkflowUnitDialog } from '../components/dialogs/edit-workflow-unit-dialog';
import { DeleteConfirmDialog } from '../components/dialogs/delete-confirm-dialog';
import type { WorkflowUnit } from '../api/types';

const route = getRouteApi('/$locale/workspaces/$workspaceId/workflow-units/');

export default function WorkflowUnitsListPage() {
  const { workspaceId, locale } = route.useParams();
  const { data: units, isLoading, error } = useWorkflowUnits(workspaceId);

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

  if (error) {
    return (
      <Container maxWidth="xl" padding="margin">
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertTitle>Error Loading Workflow Units</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : 'Failed to load workflow units. Please try again.'}
          </AlertDescription>
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" padding="margin">
      <Stack space="space-400">
        {/* Header */}
        <Inline justify="between" align="center">
          <Heading level={1}>Workflow Units</Heading>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="size-4 mr-2" />
            Create Unit
          </Button>
        </Inline>

        {/* Search Input */}
        <Input
          placeholder="Search workflow units..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
          aria-label="Search workflow units"
        />

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Empty State - No Units */}
        {!isLoading && units && units.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Text color="muted" className="mb-4">
              No workflow units yet. Create your first workflow unit to get started.
            </Text>
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="size-4 mr-2" />
              Create First Unit
            </Button>
          </div>
        )}

        {/* Empty State - No Search Results */}
        {!isLoading && filteredUnits.length === 0 && units && units.length > 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Text color="muted">No workflow units match your search.</Text>
          </div>
        )}

        {/* Units Grid */}
        {!isLoading && filteredUnits.length > 0 && (
          <Grid columns={12} gap="space-300">
            {filteredUnits.map((unit) => (
              <GridItem key={unit.id} span={12} spanMd={6} spanLg={4} spanXl={3}>
                <WorkflowUnitCard
                  unit={unit}
                  workspaceId={workspaceId}
                  locale={locale}
                  onEdit={setEditUnit}
                  onDelete={setDeleteUnit}
                />
              </GridItem>
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
    </Container>
  );
}
