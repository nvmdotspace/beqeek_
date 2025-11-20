import { useState, useEffect } from 'react';
import { getRouteApi } from '@tanstack/react-router';
import { Grid, GridItem } from '@workspace/ui/components/primitives';
import { WorkflowCanvas } from '../components/workflow-builder/workflow-canvas';
import { NodePalette } from '../components/workflow-builder/node-palette';
import { NodeConfigPanel } from '../components/workflow-builder/node-config-panel';
import { EventListSidebar } from '../components/event-list-sidebar';
import { CanvasHeader } from '../components/workflow-builder/canvas-header';
import { CreateEventDialog } from '../components/dialogs/create-event-dialog';
import { ErrorBoundary } from '@/components/error-boundary';
import { useWorkflowEvent } from '../hooks/use-workflow-event';
import { useWorkflowEditorStore } from '../stores/workflow-editor-store';

const route = getRouteApi('/$locale/workspaces/$workspaceId/workflow-units/$unitId/events/$eventId/edit');

/**
 * Workflow Event Editor Page
 * Visual workflow builder with React Flow
 * Layout: Event List (left) | Node Palette | Canvas (center) | Config Panel (right)
 */
export default function WorkflowEventEditorPage() {
  const { workspaceId, unitId, eventId } = route.useParams();
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const { currentEventId, setCurrentEventId, loadEvent } = useWorkflowEditorStore();
  const { data: event } = useWorkflowEvent(workspaceId, eventId);

  // Sync currentEventId with URL params when route changes
  useEffect(() => {
    if (eventId && eventId !== currentEventId) {
      setCurrentEventId(eventId);
    }
  }, [eventId, currentEventId, setCurrentEventId]);

  // Load event into canvas when event data is available
  useEffect(() => {
    if (event && eventId === event.id) {
      loadEvent(event);
    }
  }, [event, eventId, loadEvent]);

  return (
    <ErrorBoundary>
      <div className="h-screen flex">
        {/* Event List Sidebar - Far Left */}
        <EventListSidebar workspaceId={workspaceId} unitId={unitId} onCreateEvent={() => setShowCreateDialog(true)} />

        {/* Main Editor Area */}
        <div className="flex-1 flex flex-col">
          {/* Canvas Header */}
          <CanvasHeader workspaceId={workspaceId} />

          <Grid columns={12} className="flex-1">
            {/* Node Palette - Left Sidebar */}
            <GridItem span={2} className="border-r border-border overflow-hidden">
              <NodePalette />
            </GridItem>

            {/* Canvas - Center */}
            <GridItem span={7} className="relative overflow-hidden">
              <WorkflowCanvas />
            </GridItem>

            {/* Config Panel - Right Sidebar */}
            <GridItem span={3} className="border-l border-border overflow-hidden">
              <NodeConfigPanel />
            </GridItem>
          </Grid>
        </div>
      </div>

      {/* Create Event Dialog */}
      <CreateEventDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        workspaceId={workspaceId}
        unitId={unitId}
      />
    </ErrorBoundary>
  );
}
