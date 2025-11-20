/**
 * CanvasHeader Component
 *
 * Displays current event info, dirty state, and manual save button above workflow canvas.
 */

import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import { Alert, AlertDescription } from '@workspace/ui/components/alert';
import { Separator } from '@workspace/ui/components/separator';
import { Save, AlertCircle, FileQuestion, Undo2, Redo2, Network, Download } from 'lucide-react';
import { useWorkflowEditorStore } from '../../stores/workflow-editor-store';
import { useUpdateWorkflowEvent } from '../../hooks/use-update-workflow-event';
import { reactFlowToYAML } from '../../utils/yaml-converter';
import { autoLayoutNodes } from '../../utils/auto-layout';
import { exportWorkflowToPng } from '../../utils/export-utils';
import { EditorModeToggle } from './editor-mode-toggle';
import { toast } from 'sonner';
import { useCallback, useEffect, useState } from 'react';

interface CanvasHeaderProps {
  workspaceId: string;
}

export function CanvasHeader({ workspaceId }: CanvasHeaderProps) {
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
            toast.success('Workflow saved successfully');
          },
          onError: (error) => {
            toast.error('Failed to save workflow', {
              description: error instanceof Error ? error.message : 'Please try again',
            });
          },
        },
      );
    } catch (error) {
      toast.error('Failed to save workflow', {
        description: error instanceof Error ? error.message : 'Check your workflow for errors',
      });
    }
  }, [currentEvent, workspaceId, nodes, edges, mode, updateEvent, setIsDirty]);

  // Auto-layout handler
  const handleAutoLayout = useCallback(() => {
    if (nodes.length === 0) return;

    try {
      const layoutedNodes = autoLayoutNodes(nodes, edges);
      setNodes(layoutedNodes);
      toast.success('Nodes arranged automatically');
    } catch (error) {
      toast.error('Failed to auto-layout', {
        description: error instanceof Error ? error.message : 'Please try again',
      });
    }
  }, [nodes, edges, setNodes]);

  // Export handler
  const handleExport = useCallback(async () => {
    if (nodes.length === 0) {
      toast.error('Cannot export empty workflow');
      return;
    }

    setIsExporting(true);
    try {
      const fileName = currentEvent?.eventName.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'workflow';
      await exportWorkflowToPng('workflow-canvas', { fileName });
      toast.success('Workflow exported successfully');
    } catch (error) {
      toast.error('Failed to export workflow', {
        description: error instanceof Error ? error.message : 'Please try again',
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

  // Empty state - no event selected
  if (!currentEvent) {
    return (
      <div className="border-b bg-background p-4">
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <FileQuestion className="h-5 w-5" />
          <span className="text-sm">Select an event from the sidebar to start editing</span>
        </div>
      </div>
    );
  }

  // Parse error state
  if (parseError) {
    return (
      <div className="border-b bg-background p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Failed to load workflow:</strong> {parseError}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="border-b bg-background p-4">
      <div className="flex items-center justify-between">
        {/* Event Info */}
        <div className="flex items-center gap-3">
          <h2 className="font-semibold text-lg">{currentEvent.eventName}</h2>
          <Badge variant={currentEvent.eventActive ? 'default' : 'secondary'}>
            {currentEvent.eventActive ? 'Active' : 'Inactive'}
          </Badge>
          {currentEvent.eventSourceType && (
            <Badge variant="outline" className="capitalize">
              {currentEvent.eventSourceType.replace('_', ' ').toLowerCase()}
            </Badge>
          )}
          <Separator orientation="vertical" className="h-6" />
          <EditorModeToggle />
        </div>

        {/* Toolbar Actions */}
        <div className="flex items-center gap-3">
          {/* Undo/Redo */}
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={() => undo()} disabled={!canUndo} title="Undo (Cmd+Z)">
              <Undo2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => redo()} disabled={!canRedo} title="Redo (Cmd+Shift+Z)">
              <Redo2 className="h-4 w-4" />
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
          >
            <Network className="h-4 w-4 mr-2" />
            Auto-Layout
          </Button>

          {/* Export PNG */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={nodes.length === 0 || isExporting}
            title="Export workflow as PNG"
          >
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? 'Exporting...' : 'Export PNG'}
          </Button>

          <Separator orientation="vertical" className="h-6" />

          {/* Save Button + Dirty State */}
          {isDirty && <span className="text-sm text-muted-foreground">Unsaved changes</span>}
          <Button onClick={handleManualSave} disabled={!isDirty || updateEvent.isPending} size="sm">
            <Save className="h-4 w-4 mr-2" />
            {updateEvent.isPending ? 'Saving...' : 'Save Workflow'}
          </Button>
        </div>
      </div>
    </div>
  );
}
