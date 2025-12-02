/**
 * CanvasHeader Component
 *
 * Displays current event info, dirty state, and manual save button above workflow canvas.
 * Now includes EventSelector for n8n-style maximized canvas layout.
 */

import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import { Alert, AlertDescription } from '@workspace/ui/components/alert';
import { Separator } from '@workspace/ui/components/separator';
import { Save, AlertCircle, FileQuestion, Undo2, Redo2, Network, Download } from 'lucide-react';
import { useWorkflowEditorStore } from '../../stores/workflow-editor-store';
import { useUpdateWorkflowEvent } from '../../hooks/use-update-workflow-event';
import { reactFlowToYAML } from '../../utils/yaml-converter';
import { autoLayout } from '../../utils/auto-layout';
import { exportWorkflowToPng } from '../../utils/export-utils';
import { EditorModeToggle } from './editor-mode-toggle';
import { EventSelector } from './event-selector';
import { toast } from 'sonner';
import { useCallback, useEffect, useState } from 'react';
// @ts-expect-error - Paraglide generates JS without .d.ts files
import { m } from '@/paraglide/generated/messages.js';

interface CanvasHeaderProps {
  workspaceId: string;
  unitId: string;
  onCreateEvent: () => void;
}

export function CanvasHeader({ workspaceId, unitId, onCreateEvent }: CanvasHeaderProps) {
  const { currentEvent, nodes, edges, isDirty, parseError, mode, setIsDirty, setNodes, setMode } =
    useWorkflowEditorStore();
  const [isExporting, setIsExporting] = useState(false);

  const updateEvent = useUpdateWorkflowEvent();

  // Zundo undo/redo
  const { undo, redo, futureStates, pastStates } = useWorkflowEditorStore.temporal.getState();
  const canUndo = pastStates.length > 0;
  const canRedo = futureStates.length > 0;

  const handleManualSave = useCallback(async () => {
    if (!currentEvent) return;

    try {
      let yaml: string;

      // Get YAML content based on current mode
      if (mode === 'yaml') {
        // In YAML mode, use yamlContent directly
        const { yamlContent } = useWorkflowEditorStore.getState();
        yaml = yamlContent;
      } else {
        // In visual mode, convert nodes/edges to YAML
        yaml = reactFlowToYAML(nodes, edges, {
          type: currentEvent.eventSourceType.toLowerCase() as any,
          config: currentEvent.eventSourceParams as unknown as Record<string, unknown>,
        });
      }

      // Save to API
      updateEvent.mutate(
        {
          workspaceId,
          eventId: currentEvent.id,
          data: { yaml },
        },
        {
          onSuccess: () => {
            setIsDirty(false);
            toast.success(m.workflowCanvas_toast_saved());
          },
          onError: (error) => {
            toast.error(m.workflowCanvas_toast_saveFailed(), {
              description: error instanceof Error ? error.message : m.common_tryAgain(),
            });
          },
        },
      );
    } catch (error) {
      toast.error(m.workflowCanvas_toast_saveFailed(), {
        description: error instanceof Error ? error.message : m.workflowCanvas_toast_checkErrors(),
      });
    }
  }, [currentEvent, workspaceId, nodes, edges, mode, updateEvent, setIsDirty]);

  // Auto-layout handler (supports compound nodes with branches/loops)
  const handleAutoLayout = useCallback(() => {
    if (nodes.length === 0) return;

    try {
      const layoutedNodes = autoLayout(nodes, edges);
      setNodes(layoutedNodes);
      toast.success(m.workflowCanvas_toast_autoLayout());
    } catch (error) {
      toast.error(m.workflowCanvas_toast_autoLayoutFailed(), {
        description: error instanceof Error ? error.message : m.common_tryAgain(),
      });
    }
  }, [nodes, edges, setNodes]);

  // Export handler
  const handleExport = useCallback(async () => {
    if (nodes.length === 0) {
      toast.error(m.workflowCanvas_toast_cannotExportEmpty());
      return;
    }

    setIsExporting(true);
    try {
      const fileName = currentEvent?.eventName.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'workflow';
      await exportWorkflowToPng('workflow-canvas', { fileName });
      toast.success(m.workflowCanvas_toast_exported());
    } catch (error) {
      toast.error(m.workflowCanvas_toast_exportFailed(), {
        description: error instanceof Error ? error.message : m.common_tryAgain(),
      });
    } finally {
      setIsExporting(false);
    }
  }, [nodes.length, currentEvent?.eventName]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Undo: Cmd+Z / Ctrl+Z (visual mode only)
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key === 'z' && mode === 'visual') {
        e.preventDefault();
        if (canUndo) undo();
      }
      // Redo: Cmd+Shift+Z / Ctrl+Y (visual mode only)
      if (
        (((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'z') || (e.ctrlKey && e.key === 'y')) &&
        mode === 'visual'
      ) {
        e.preventDefault();
        if (canRedo) redo();
      }
      // Auto-layout: Cmd+Shift+L / Ctrl+Shift+L (visual mode only)
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'l' && mode === 'visual') {
        e.preventDefault();
        handleAutoLayout();
      }
      // Toggle mode: Cmd+Shift+Y / Ctrl+Shift+Y
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'y') {
        e.preventDefault();
        setMode(mode === 'visual' ? 'yaml' : 'visual');
      }
      // Save: Cmd+S / Ctrl+S
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        if (isDirty) handleManualSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canUndo, canRedo, undo, redo, handleAutoLayout, mode, setMode, isDirty, handleManualSave]);

  // Empty state - no event selected (still show EventSelector)
  if (!currentEvent) {
    return (
      <div className="border-b bg-background p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <EventSelector workspaceId={workspaceId} unitId={unitId} onCreateEvent={onCreateEvent} />
          </div>
          <div className="flex items-center gap-2 text-muted-foreground" role="status">
            <FileQuestion className="h-5 w-5" aria-hidden="true" />
            <span className="text-sm">{m.workflowCanvas_selectEventToStart()}</span>
          </div>
        </div>
      </div>
    );
  }

  // Parse error state
  if (parseError) {
    return (
      <div className="border-b bg-background p-4">
        <Alert variant="destructive" role="alert">
          <AlertCircle className="h-4 w-4" aria-hidden="true" />
          <AlertDescription>
            <strong>{m.workflowCanvas_failedToLoad()}:</strong> {parseError}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="border-b bg-background p-4">
      <div className="flex items-center justify-between">
        {/* Event Selector + Mode Toggle */}
        <div className="flex items-center gap-3">
          <EventSelector workspaceId={workspaceId} unitId={unitId} onCreateEvent={onCreateEvent} />
          <Badge variant={currentEvent.eventActive ? 'success' : 'warning'}>
            {currentEvent.eventActive ? m.workflowEvents_card_active() : m.workflowEvents_card_inactive()}
          </Badge>
          <Separator orientation="vertical" className="h-6" />
          <EditorModeToggle />
        </div>

        {/* Toolbar Actions */}
        <div className="flex items-center gap-3">
          {/* Undo/Redo */}
          <div className="flex items-center gap-1" role="group" aria-label="History controls">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => undo()}
              disabled={!canUndo}
              title="Undo (Cmd+Z)"
              aria-label="Undo last action"
            >
              <Undo2 className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => redo()}
              disabled={!canRedo}
              title="Redo (Cmd+Shift+Z)"
              aria-label="Redo last action"
            >
              <Redo2 className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Auto-Layout */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleAutoLayout}
            disabled={nodes.length === 0}
            title="Auto-layout nodes (Cmd+Shift+L)"
            aria-label="Auto-layout nodes"
          >
            <Network className="h-4 w-4" aria-hidden="true" />
            {m.workflowCanvas_autoLayout()}
          </Button>

          {/* Export PNG */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={nodes.length === 0 || isExporting}
            title="Export workflow as PNG"
            aria-label="Export workflow as PNG"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            {isExporting ? m.workflowCanvas_exporting() : m.workflowCanvas_exportPng()}
          </Button>

          <Separator orientation="vertical" className="h-6" />

          {/* Save Button + Dirty State */}
          {isDirty && (
            <span className="text-sm text-muted-foreground" role="status" aria-live="polite">
              {m.workflowCanvas_unsavedChanges()}
            </span>
          )}
          <Button
            onClick={handleManualSave}
            disabled={!isDirty || updateEvent.isPending}
            size="sm"
            aria-label={updateEvent.isPending ? m.workflowCanvas_saving() : m.workflowCanvas_saveWorkflow()}
          >
            <Save className="h-4 w-4" aria-hidden="true" />
            {updateEvent.isPending ? m.workflowCanvas_saving() : m.workflowCanvas_saveWorkflow()}
          </Button>
        </div>
      </div>
    </div>
  );
}
