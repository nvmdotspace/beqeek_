/**
 * NodeConfigPanel Component
 *
 * Inline configuration panel that appears next to the selected node (make.com style).
 * No overlay/blur background - user can still interact with canvas.
 */

import { useCallback } from 'react';
import { X } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { ScrollArea } from '@workspace/ui/components/scroll-area';
import { Badge } from '@workspace/ui/components/badge';
import { Text } from '@workspace/ui/components/typography';
import { Stack } from '@workspace/ui/components/primitives';
import { cn } from '@workspace/ui/lib/utils';
import { useWorkflowEditorStore } from '../../stores/workflow-editor-store';
import { NODE_DEFINITIONS } from '../../utils/node-types';
import { getWorkflowIcon } from '../../utils/workflow-icons';
import { NodeFormRouter } from './node-forms';

export function NodeConfigPanel() {
  const { nodes, selectedNodeIds, isConfigDrawerOpen, closeConfigDrawer, setSelectedNodeIds, updateNodeData } =
    useWorkflowEditorStore();

  const selectedNode = nodes.find((n) => selectedNodeIds.includes(n.id));
  const nodeDef = selectedNode ? NODE_DEFINITIONS.find((d) => d.type === selectedNode.type) : null;

  // Handle node data update from forms
  const handleNodeUpdate = useCallback(
    (data: Record<string, unknown>) => {
      if (selectedNode) {
        updateNodeData(selectedNode.id, data);
      }
    },
    [selectedNode, updateNodeData],
  );

  // Handle close
  const handleClose = () => {
    closeConfigDrawer();
    setSelectedNodeIds([]);
  };

  // Don't render if no node selected or panel not open
  if (!isConfigDrawerOpen || !selectedNode || !nodeDef) {
    return null;
  }

  // Get icon component
  const IconComponent = nodeDef.icon ? getWorkflowIcon(nodeDef.icon) : null;

  // Category colors for badge
  const categoryColors = {
    trigger: 'bg-accent-blue-subtle text-accent-blue',
    action: 'bg-accent-green-subtle text-accent-green',
    logic: 'bg-accent-teal-subtle text-accent-teal',
  };

  return (
    <div
      className={cn(
        'w-[400px] h-full bg-background border-l border-border flex-shrink-0',
        'animate-in slide-in-from-right-5 duration-200',
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border">
        {IconComponent && (
          <div className={cn('p-2 rounded-lg', categoryColors[nodeDef.category])} aria-hidden="true">
            <IconComponent className="h-5 w-5" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">{nodeDef.label}</h3>
          <Badge variant="outline" className="text-xs mt-1">
            {nodeDef.category}
          </Badge>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={handleClose} aria-label="Close panel">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <ScrollArea className="h-[calc(100%-73px)]">
        <div className="p-4 space-y-4">
          {/* Node Description */}
          {nodeDef.description && (
            <Text size="small" color="muted">
              {nodeDef.description}
            </Text>
          )}

          {/* Node ID */}
          <Stack space="space-100">
            <Text weight="semibold" size="small">
              Node ID
            </Text>
            <Text size="small" color="muted" className="font-mono text-xs">
              {selectedNode.id}
            </Text>
          </Stack>

          {/* Node Configuration Form */}
          <NodeFormRouter node={selectedNode} onUpdate={handleNodeUpdate} />
        </div>
      </ScrollArea>
    </div>
  );
}
