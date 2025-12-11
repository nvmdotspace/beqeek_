/**
 * SourceHandleWithMenu Component
 *
 * A custom source handle that:
 * - Shows a dropdown menu when clicked to add a connected node
 * - Allows dragging to create connections (default React Flow behavior)
 *
 * Key insight: Handle must NOT be wrapped in DropdownMenuTrigger
 * because it blocks React Flow's drag events.
 */

import { memo, useState, useCallback, useRef } from 'react';
import { Handle, Position, useNodeId, useReactFlow } from '@xyflow/react';
import { Plus } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@workspace/ui/components/dropdown-menu';
import { cn } from '@workspace/ui/lib/utils';
import { NODE_DEFINITIONS, type NodeDefinition, type NodeCategory } from '../../../utils/node-types';
import { getWorkflowIcon } from '../../../utils/workflow-icons';
import { useWorkflowEditorStore } from '../../../stores/workflow-editor-store';

// Category-based icon styles (matching node-palette.tsx and edges/index.tsx)
const CATEGORY_STYLES: Record<NodeCategory, { bg: string; text: string }> = {
  trigger: {
    bg: 'bg-blue-100 dark:bg-blue-500/20',
    text: 'text-blue-600 dark:text-blue-400',
  },
  action: {
    bg: 'bg-violet-100 dark:bg-violet-500/20',
    text: 'text-violet-600 dark:text-violet-400',
  },
  logic: {
    bg: 'bg-orange-100 dark:bg-orange-500/20',
    text: 'text-orange-600 dark:text-orange-400',
  },
};

// Pre-compute insertable nodes (same as edges/index.tsx)
const INSERTABLE_NODES = NODE_DEFINITIONS.filter(
  (def) => def.category !== 'trigger' && !def.type.startsWith('compound_') && def.type !== 'merge',
);
const ACTION_NODES = INSERTABLE_NODES.filter((d) => d.category === 'action');
const LOGIC_NODES = INSERTABLE_NODES.filter((d) => d.category === 'logic');

interface SourceHandleWithMenuProps {
  handleClassName?: string;
  handleBgClass?: string;
}

export const SourceHandleWithMenu = memo(({ handleClassName, handleBgClass }: SourceHandleWithMenuProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const nodeId = useNodeId();
  const { getNode } = useReactFlow();

  // Track mouse state to differentiate click vs drag
  const mouseDownPos = useRef<{ x: number; y: number; time: number } | null>(null);
  const hasDragged = useRef(false);

  // Store actions
  const setNodes = useWorkflowEditorStore((state) => state.setNodes);
  const setEdges = useWorkflowEditorStore((state) => state.setEdges);

  // Handle adding a new node connected to this one
  const handleAddNode = useCallback(
    (nodeType: string) => {
      if (!nodeId) return;

      const timestamp = Date.now();
      const newNodeId = `${nodeType}-${timestamp}`;

      // Get current node position
      const currentNode = getNode(nodeId);
      if (!currentNode) return;

      // Position new node below the current one
      const newNodePosition = {
        x: currentNode.position.x,
        y: currentNode.position.y + 150,
      };

      // Get default data for node type
      const nodeDef = NODE_DEFINITIONS.find((def) => def.type === nodeType);
      const newNode = {
        id: newNodeId,
        type: nodeType,
        position: newNodePosition,
        data: {
          name: `${nodeType}_${timestamp}`,
          ...nodeDef?.defaultData,
        },
      };

      // Create edge from current node to new node
      const newEdge = {
        id: `edge-${nodeId}-${newNodeId}`,
        source: nodeId,
        target: newNodeId,
        type: 'workflow',
      };

      // Get fresh state
      const { nodes: currentNodes, edges: currentEdges } = useWorkflowEditorStore.getState();

      // Update state
      setNodes([...currentNodes, newNode]);
      setEdges([...currentEdges, newEdge]);
      setIsMenuOpen(false);
    },
    [nodeId, getNode, setNodes, setEdges],
  );

  // Mouse handlers to differentiate click vs drag
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    mouseDownPos.current = { x: e.clientX, y: e.clientY, time: Date.now() };
    hasDragged.current = false;

    const handleGlobalMouseMove = (moveEvent: MouseEvent) => {
      if (mouseDownPos.current) {
        const dx = Math.abs(moveEvent.clientX - mouseDownPos.current.x);
        const dy = Math.abs(moveEvent.clientY - mouseDownPos.current.y);
        if (dx > 5 || dy > 5) {
          hasDragged.current = true;
        }
      }
    };

    const handleGlobalMouseUp = () => {
      const timeDiff = Date.now() - (mouseDownPos.current?.time || 0);

      // Only open menu if: not dragged and quick click (<300ms)
      if (!hasDragged.current && mouseDownPos.current && timeDiff < 300) {
        setIsMenuOpen(true);
      }

      mouseDownPos.current = null;
      hasDragged.current = false;
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };

    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  // Render menu item with colored icon
  const renderMenuItem = useCallback(
    (def: NodeDefinition) => {
      const IconComponent = getWorkflowIcon(def.icon);
      const styles = CATEGORY_STYLES[def.category];
      return (
        <DropdownMenuItem
          key={def.type}
          onClick={() => handleAddNode(def.type)}
          className="flex cursor-pointer items-center gap-2"
        >
          <div className={cn('flex h-6 w-6 shrink-0 items-center justify-center rounded-md', styles.bg, styles.text)}>
            {IconComponent && <IconComponent className="size-3.5" />}
          </div>
          <span>{def.label}</span>
        </DropdownMenuItem>
      );
    },
    [handleAddNode],
  );

  // Only allow closing via onOpenChange, opening is controlled by our click handler
  const handleOpenChange = useCallback((open: boolean) => {
    if (!open) setIsMenuOpen(false);
  }, []);

  return (
    <>
      <DropdownMenu open={isMenuOpen} onOpenChange={handleOpenChange}>
        <DropdownMenuTrigger asChild>
          <div
            className={cn(
              'absolute left-1/2 -translate-x-1/2 -bottom-1.5 group-hover:-bottom-2',
              'w-3 h-3 group-hover:w-4 group-hover:h-4', // Match handle dimensions for correct anchoring
              'pointer-events-none opacity-0', // Invisible and non-interactive
            )}
          />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start" side="bottom" className="max-h-80 w-48 overflow-y-auto">
          <DropdownMenuLabel className="text-xs text-muted-foreground">Actions</DropdownMenuLabel>
          {ACTION_NODES.map(renderMenuItem)}
          <DropdownMenuSeparator />
          <DropdownMenuLabel className="text-xs text-muted-foreground">Logic</DropdownMenuLabel>
          {LOGIC_NODES.map(renderMenuItem)}
        </DropdownMenuContent>
      </DropdownMenu>

      <div
        className="absolute left-1/2 -translate-x-1/2 -bottom-1.5 group-hover:-bottom-2 z-10"
        onMouseDown={handleMouseDown}
      >
        <Handle
          type="source"
          position={Position.Bottom}
          className={cn(
            '!relative !transform-none !left-0 !top-0',
            '!w-3 !h-3 !rounded-full !border-2 !border-card',
            'transition-all duration-200 cursor-crosshair',
            handleBgClass || '!bg-accent-green',
            'group-hover:!w-4 group-hover:!h-4',
            'flex items-center justify-center',
            handleClassName,
          )}
        >
          <Plus className="pointer-events-none size-2.5 text-white opacity-0 transition-opacity group-hover:opacity-100" />
        </Handle>
      </div>
    </>
  );
});

SourceHandleWithMenu.displayName = 'SourceHandleWithMenu';
