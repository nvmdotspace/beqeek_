/**
 * Compound Loop Node - Container for loop iterations
 *
 * Uses React Flow's parent-child node pattern to create a visual container
 * for loop body steps.
 */
import { memo, useState } from 'react';
import { Handle, Position, NodeResizer, useNodeId } from '@xyflow/react';
import { Repeat, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { cn } from '@workspace/ui/lib/utils';
import { useWorkflowEditorStore } from '../../../stores/workflow-editor-store';

export interface CompoundLoopData {
  label: string;
  itemVar: string;
  collection: string;
  childCount: number;
  config?: Record<string, unknown>;
}

export interface CompoundLoopNodeProps {
  id: string;
  data: CompoundLoopData;
  selected?: boolean;
}

export const CompoundLoopNode = memo(({ data, selected }: CompoundLoopNodeProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const nodeId = useNodeId();

  const { setSelectedNodeIds, openConfigDrawer, deleteNode } = useWorkflowEditorStore();

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (nodeId) {
      setSelectedNodeIds([nodeId]);
      openConfigDrawer();
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (nodeId) {
      deleteNode(nodeId);
    }
  };

  return (
    <div className="relative" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      {/* Node resizer */}
      <NodeResizer minWidth={280} minHeight={180} isVisible={selected} />

      {/* Toolbar */}
      <div
        className={cn(
          'absolute -right-10 top-4 z-10',
          'flex flex-col gap-1 p-1',
          'bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-lg',
          'transition-all duration-200',
          isHovered || selected ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 pointer-events-none',
        )}
      >
        <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-accent" onClick={handleEdit} title="Edit loop">
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={handleDelete}
          title="Delete loop"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Container */}
      <div
        className={cn(
          'min-w-[280px] min-h-[200px] rounded-lg border-2 border-dashed',
          'bg-accent-purple-subtle/30 backdrop-blur-sm',
          selected ? 'border-accent-purple' : 'border-border',
        )}
      >
        {/* Header with iteration count badge */}
        <div className="flex items-center justify-between p-3 bg-accent-purple-subtle border-b border-border rounded-t-lg">
          <div className="flex items-center gap-2">
            <Repeat className="size-4 text-accent-purple" />
            <span className="font-semibold text-sm">{data.label}</span>
          </div>
          {/* Iteration count badge */}
          {data.childCount > 0 && (
            <div className="px-2 py-0.5 text-[10px] bg-accent-purple text-white rounded-full font-medium">
              {data.childCount}× steps
            </div>
          )}
        </div>

        {/* Loop config with visual styling */}
        <div className="p-2 border-b border-border bg-background/50">
          <div className="flex items-center gap-1.5 text-xs font-mono">
            <span className="text-muted-foreground">for each</span>
            <span className="px-1.5 py-0.5 bg-accent-blue-subtle text-accent-blue rounded font-medium">
              {data.itemVar || 'item'}
            </span>
            <span className="text-muted-foreground">in</span>
            <span className="px-1.5 py-0.5 bg-background border border-border rounded font-medium text-foreground">
              {data.collection || '[]'}
            </span>
          </div>
        </div>

        {/* Nested blocks container with visual loop indicator */}
        <div className="p-3 relative">
          {/* Left border indicator for loop scope */}
          <div className="absolute left-3 top-3 bottom-3 w-0.5 bg-accent-purple/40 rounded-full" />

          {data.childCount > 0 ? (
            <div className="text-xs text-muted-foreground ml-4">
              {data.childCount} step{data.childCount !== 1 ? 's' : ''} will execute for each item
            </div>
          ) : (
            <div className="text-xs text-destructive ml-4">No steps inside loop - add nested blocks</div>
          )}

          {/* Spacer for child nodes */}
          <div className="min-h-[80px]" />
        </div>
      </div>

      {/* Connection handles */}
      {/* Main input handle (top) */}
      <Handle
        type="target"
        position={Position.Top}
        id="input"
        className={cn('!w-3 !h-3 !rounded-full !border-2 !border-card', '!-top-1.5 !bg-accent-purple')}
      />

      {/* Loop-back handle (left side) - for repeat edge from last child */}
      <Handle
        type="target"
        position={Position.Left}
        id="loop-back"
        className={cn('!w-2.5 !h-2.5 !rounded-full !border-2 !border-card', '!bg-accent-purple/60')}
        style={{ top: '50%' }}
      />

      {/* Main output handle (bottom) */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="output"
        className={cn('!w-3 !h-3 !rounded-full !border-2 !border-card', '!-bottom-1.5 !bg-accent-purple')}
      />
    </div>
  );
});

CompoundLoopNode.displayName = 'CompoundLoopNode';
