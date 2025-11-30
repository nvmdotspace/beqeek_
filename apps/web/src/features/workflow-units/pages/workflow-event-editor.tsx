import { useState, useEffect } from 'react';
import { getRouteApi } from '@tanstack/react-router';
import { WorkflowCanvas } from '../components/workflow-builder/workflow-canvas';
import { NodePalette } from '../components/workflow-builder/node-palette';
import { NodeConfigPanel } from '../components/workflow-builder/node-config-panel';
import { YamlEditor } from '../components/workflow-builder/yaml-editor';
import { CanvasHeader } from '../components/workflow-builder/canvas-header';
import { CreateEventDialog } from '../components/dialogs/create-event-dialog';
import { ErrorBoundary } from '@/components/error-boundary';
import { useWorkflowEvent } from '../hooks/use-workflow-event';
import { useWorkflowEditorStore } from '../stores/workflow-editor-store';
import { useModeSync } from '../hooks/use-mode-sync';

const route = getRouteApi('/$locale/workspaces/$workspaceId/workflow-units/$unitId/events/$eventId/edit');

/**
 * Workflow Event Editor Page
 * Visual workflow builder with React Flow
 *
 * Layout (make.com style):
 * - Event selector in header
 * - Node Palette sidebar (left) for drag-and-drop nodes
 * - Canvas (center) - maximized width
 * - Config panel (right) - inline, no overlay/blur background
 */
export default function WorkflowEventEditorPage() {
  const { workspaceId, unitId, eventId } = route.useParams();
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const { currentEventId, setCurrentEventId, loadEvent, mode } = useWorkflowEditorStore();
  const { data: event } = useWorkflowEvent(workspaceId, eventId);

  // Bidirectional sync between Visual and YAML modes
  useModeSync();

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
      {/* Full height container - uses calc to fill remaining viewport height */}
      <div className="absolute inset-0 flex flex-col overflow-hidden">
        {/* Canvas Header with Event Selector */}
        <CanvasHeader workspaceId={workspaceId} unitId={unitId} onCreateEvent={() => setShowCreateDialog(true)} />

        {/* Main Editor Area */}
        <div className="flex-1 flex overflow-hidden min-h-0">
          {mode === 'visual' ? (
            <>
              {/* Node Palette - Left Sidebar */}
              <div className="w-64 border-r border-border flex-shrink-0 overflow-hidden">
                <NodePalette />
              </div>

              {/* Canvas - Center (flex-1 takes remaining space) */}
              <div className="flex-1 relative overflow-hidden">
                <WorkflowCanvas />
              </div>

              {/* Node Config Panel - Inline right panel (make.com style, no overlay) */}
              <NodeConfigPanel />
            </>
          ) : (
            <div className="flex-1 overflow-hidden">
              <YamlEditor workspaceId={workspaceId} />
            </div>
          )}
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
