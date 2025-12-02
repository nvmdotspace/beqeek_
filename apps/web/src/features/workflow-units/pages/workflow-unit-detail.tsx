import { useState } from 'react';
import { getRouteApi, useNavigate } from '@tanstack/react-router';
import { Box, Stack, Inline, Grid } from '@workspace/ui/components/primitives';
import { Heading, Text } from '@workspace/ui/components/typography';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@workspace/ui/components/breadcrumb';
import { Trash, Edit, Loader2, AlertCircle, Plus, Calendar, Boxes } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@workspace/ui/components/alert';
import { Skeleton } from '@workspace/ui/components/skeleton';
import { cn } from '@workspace/ui/lib/utils';
import { useWorkflowUnit } from '../hooks/use-workflow-unit';
import { useWorkflowEvents } from '../hooks/use-workflow-events';
import { EditWorkflowUnitDialog } from '../components/dialogs/edit-workflow-unit-dialog';
import { DeleteConfirmDialog } from '../components/dialogs/delete-confirm-dialog';
import { CreateEventDialog } from '../components/dialogs/create-event-dialog';
import { EventCard } from '../components/event-card';
// @ts-expect-error - Paraglide generates JS without .d.ts files
import { m } from '@/paraglide/generated/messages.js';

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
      <Box padding="space-300">
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertTitle>{m.common_error()}</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : m.workflowUnits_detail_errorLoad()}
          </AlertDescription>
        </Alert>
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box padding="space-300">
        <Stack space="space-300">
          <Skeleton className="h-6 w-64" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-48 w-full" />
        </Stack>
      </Box>
    );
  }

  if (!unit) {
    return (
      <Box padding="space-300">
        <Alert>
          <AlertCircle className="size-4" />
          <AlertTitle>{m.workflowUnits_detail_notFound()}</AlertTitle>
          <AlertDescription>{m.workflowUnits_detail_notFoundDescription()}</AlertDescription>
        </Alert>
      </Box>
    );
  }

  return (
    <Box padding="space-300">
      <Stack space="space-300">
        {/* Breadcrumb - Separate row at top */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href={`/${locale}/workspaces/${workspaceId}`}>
                {m.workflowUnits_detail_breadcrumb_workspace()}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/${locale}/workspaces/${workspaceId}/workflow-units`}>
                {m.workflowUnits_detail_breadcrumb_list()}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{unit.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header Section - Clean layout */}
        <Stack space="space-200">
          {/* Title + Actions Row */}
          <Inline justify="between" align="center">
            <Inline space="space-150" align="center">
              {/* Icon */}
              <div
                className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
                  'bg-accent-blue-subtle',
                )}
              >
                <Boxes className="h-5 w-5 text-accent-blue" />
              </div>

              {/* Title */}
              <Heading level={1} className="text-2xl">
                {unit.name}
              </Heading>
            </Inline>

            {/* Actions - Right aligned */}
            <Inline space="space-100">
              <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
                <Edit className="size-4" />
                {m.workflowUnits_detail_edit()}
              </Button>
              <Button variant="outline" size="sm" onClick={() => setDeleteOpen(true)}>
                <Trash className="size-4" />
                {m.workflowUnits_detail_delete()}
              </Button>
            </Inline>
          </Inline>

          {/* Badge + Metadata Row */}
          <Inline space="space-200" align="center" className="text-sm text-muted-foreground">
            <Badge variant="outline" className="border-accent-blue/30 text-accent-blue">
              {m.workflowUnits_detail_badge()}
            </Badge>
            <Text size="small" color="muted">
              •
            </Text>
            <Inline space="space-050" align="center">
              <Calendar className="h-3.5 w-3.5" />
              <Text size="small" color="muted">
                {m.workflowUnits_detail_created({ date: new Date(unit.createdAt).toLocaleDateString() })}
              </Text>
            </Inline>
            <Text size="small" color="muted">
              •
            </Text>
            <Text size="small" color="muted">
              {m.workflowUnits_detail_updated({ date: new Date(unit.updatedAt).toLocaleDateString() })}
            </Text>
          </Inline>

          {/* Description */}
          {unit.description && (
            <Text color="muted" className="max-w-3xl">
              {unit.description}
            </Text>
          )}
        </Stack>

        {/* Divider */}
        <div className="border-t border-border" />

        {/* Workflow Events Section */}
        <Box>
          <Inline justify="between" align="center" className="mb-4">
            <Heading level={2}>{m.workflowEvents_title()}</Heading>
            <Button size="sm" onClick={() => setCreateEventOpen(true)}>
              <Plus className="size-4" />
              {m.workflowEvents_createButton()}
            </Button>
          </Inline>

          {/* Events Loading */}
          {eventsLoading && (
            <Grid columns={1} gap="space-300" className="sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-48 w-full rounded-xl" />
              ))}
            </Grid>
          )}

          {/* Events List */}
          {!eventsLoading && events && events.length > 0 && (
            <Grid columns={1} gap="space-300" className="sm:grid-cols-2 lg:grid-cols-3">
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
            </Grid>
          )}

          {/* Empty State */}
          {!eventsLoading && (!events || events.length === 0) && (
            <div className="flex flex-col items-center justify-center py-16 text-center rounded-xl border-2 border-dashed border-border bg-muted/20">
              <Calendar className="h-12 w-12 mb-4 text-muted-foreground" />
              <Heading level={3} className="mb-2">
                {m.workflowEvents_empty_title()}
              </Heading>
              <Text color="muted" className="mb-4 max-w-md">
                {m.workflowEvents_empty_description()}
              </Text>
              <Button onClick={() => setCreateEventOpen(true)}>
                <Plus className="size-4" />
                {m.workflowEvents_empty_createFirst()}
              </Button>
            </div>
          )}
        </Box>
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
    </Box>
  );
}
