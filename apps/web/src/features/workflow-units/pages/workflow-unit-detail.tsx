import { useState } from 'react';
import { getRouteApi, useNavigate } from '@tanstack/react-router';
import { Container, Stack, Inline } from '@workspace/ui/components/primitives';
import { Heading, Text } from '@workspace/ui/components/typography';
import { Button } from '@workspace/ui/components/button';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@workspace/ui/components/breadcrumb';
import { Trash, Edit, Loader2, AlertCircle, Plus } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@workspace/ui/components/alert';
import { useWorkflowUnit } from '../hooks/use-workflow-unit';
import { useWorkflowEvents } from '../hooks/use-workflow-events';
import { EditWorkflowUnitDialog } from '../components/dialogs/edit-workflow-unit-dialog';
import { DeleteConfirmDialog } from '../components/dialogs/delete-confirm-dialog';
import { CreateEventDialog } from '../components/dialogs/create-event-dialog';
import { EventCard } from '../components/event-card';

const route = getRouteApi('/$locale/workspaces/$workspaceId/workflow-units/$unitId/');

export default function WorkflowUnitDetailPage() {
  const { workspaceId, unitId, locale } = route.useParams();
  const navigate = useNavigate();
  const { data: unit, isLoading, error } = useWorkflowUnit(workspaceId, unitId);
  const { data: events, isLoading: eventsLoading } = useWorkflowEvents(workspaceId, unitId);

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [createEventOpen, setCreateEventOpen] = useState(false);

  if (error) {
    return (
      <Container maxWidth="xl" padding="margin">
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertTitle>Error Loading Workflow Unit</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : 'Failed to load workflow unit. Please try again.'}
          </AlertDescription>
        </Alert>
      </Container>
    );
  }

  if (isLoading) {
    return (
      <Container maxWidth="xl" padding="margin">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      </Container>
    );
  }

  if (!unit) {
    return (
      <Container maxWidth="xl" padding="margin">
        <Alert>
          <AlertCircle className="size-4" />
          <AlertTitle>Workflow Unit Not Found</AlertTitle>
          <AlertDescription>The workflow unit you are looking for does not exist.</AlertDescription>
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" padding="margin">
      <Stack space="space-400">
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href={`/${locale}/workspaces/${workspaceId}`}>Workspace</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/${locale}/workspaces/${workspaceId}/workflow-units`}>
                Workflow Units
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{unit.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <Inline justify="between" align="center">
          <Heading level={1}>{unit.name}</Heading>
          <Inline space="space-150">
            <Button variant="outline" onClick={() => setEditOpen(true)}>
              <Edit className="size-4 mr-2" />
              Edit
            </Button>
            <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
              <Trash className="size-4 mr-2" />
              Delete
            </Button>
          </Inline>
        </Inline>

        {/* Description */}
        {unit.description && (
          <div>
            <Text className="text-base">{unit.description}</Text>
          </div>
        )}

        {/* Workflow Events Section */}
        <div className="mt-8">
          <Inline justify="between" align="center" className="mb-4">
            <Heading level={2}>Workflow Events</Heading>
            <Button onClick={() => setCreateEventOpen(true)}>
              <Plus className="size-4 mr-2" />
              Create Event
            </Button>
          </Inline>

          {/* Events Loading */}
          {eventsLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {/* Events List */}
          {!eventsLoading && events && events.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {events.map((event) => (
                <div
                  key={event.id}
                  onClick={() =>
                    navigate({
                      to: '/$locale/workspaces/$workspaceId/workflow-units/$unitId/events/$eventId/edit',
                      params: { locale, workspaceId, unitId, eventId: event.id },
                    })
                  }
                  className="cursor-pointer"
                >
                  <EventCard event={event} />
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!eventsLoading && (!events || events.length === 0) && (
            <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-lg">
              <Text color="muted" className="mb-4">
                No workflow events yet. Create your first event to get started.
              </Text>
              <Button onClick={() => setCreateEventOpen(true)}>
                <Plus className="size-4 mr-2" />
                Create First Event
              </Button>
            </div>
          )}
        </div>
      </Stack>

      {/* Dialogs */}
      <EditWorkflowUnitDialog open={editOpen} onOpenChange={setEditOpen} workspaceId={workspaceId} unit={unit} />

      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        workspaceId={workspaceId}
        locale={locale}
        unit={unit}
      />

      <CreateEventDialog
        open={createEventOpen}
        onOpenChange={setCreateEventOpen}
        workspaceId={workspaceId}
        unitId={unitId}
      />
    </Container>
  );
}
