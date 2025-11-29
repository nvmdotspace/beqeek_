/**
 * Compound Condition Node - Container for conditional branches
 *
 * Uses React Flow's parent-child node pattern to create a visual container
 * that groups then/else branches within a resizable container.
 */
import { memo, useState } from 'react';
import { Handle, Position, NodeResizer, useNodeId } from '@xyflow/react';
import { GitBranch, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { cn } from '@workspace/ui/lib/utils';
import { useWorkflowEditorStore } from '../../../stores/workflow-editor-store';

export interface CompoundConditionData {
  label: string;
  condition: string;
  hasThenBranch: boolean;
  hasElseBranch: boolean;
  config?: Record<string, unknown>;
}

export interface CompoundConditionNodeProps {
  id: string;
  data: CompoundConditionData;
  selected?: boolean;
}

export const CompoundConditionNode = memo(({ data, selected }: CompoundConditionNodeProps) => {
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
      {/* Node resizer - allows manual sizing */}
      <NodeResizer minWidth={300} minHeight={200} isVisible={selected} />

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
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 hover:bg-accent"
          onClick={handleEdit}
          title="Edit condition"
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={handleDelete}
          title="Delete condition"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Container with visual branch indicators */}
      <div
        className={cn(
          'min-w-[300px] min-h-[200px] rounded-lg border-2 border-dashed',
          'bg-accent-teal-subtle/30 backdrop-blur-sm',
          selected ? 'border-accent-teal' : 'border-border',
        )}
      >
        {/* Header */}
        <div className="flex items-center gap-2 p-3 bg-accent-teal-subtle border-b border-border rounded-t-lg">
          <GitBranch className="size-4 text-accent-teal" />
          <span className="font-semibold text-sm">{data.label}</span>
        </div>

        {/* Condition preview */}
        <div className="p-2 text-xs font-mono text-muted-foreground border-b border-border bg-background/50">
          {data.condition || 'No condition set'}
        </div>

        {/* Branch labels with execution order indicator */}
        <div className="grid grid-cols-2 gap-2 p-2 text-xs text-muted-foreground">
          {data.hasThenBranch && (
            <div className="text-center py-1 bg-accent-green-subtle rounded border border-accent-green/30">
              <span className="inline-flex items-center gap-1">
                <span className="px-1 py-0.5 text-[10px] bg-accent-green/20 rounded">1st</span>✓ Then
              </span>
            </div>
          )}
          {data.hasElseBranch && (
            <div className="text-center py-1 bg-accent-red-subtle rounded border border-accent-red/30">
              <span className="inline-flex items-center gap-1">
                <span className="px-1 py-0.5 text-[10px] bg-accent-red/20 rounded">2nd</span>✗ Else
              </span>
            </div>
          )}
        </div>

        {/* Empty state */}
        {!data.hasThenBranch && !data.hasElseBranch && (
          <div className="p-4 text-center text-sm text-muted-foreground">No branches configured</div>
        )}

        {/* Spacer for child nodes */}
        <div className="min-h-[60px]" />
      </div>

      {/* Input handle (top) */}
      <Handle
        type="target"
        position={Position.Top}
        id="input"
        className={cn('!w-3 !h-3 !rounded-full !border-2 !border-card', '!-top-1.5 !bg-accent-teal')}
      />

      {/* THEN output handle (bottom-left) */}
      {data.hasThenBranch && (
        <div className="absolute -bottom-1.5" style={{ left: '30%' }}>
          <Handle
            type="source"
            position={Position.Bottom}
            id="then"
            className="!w-3 !h-3 !rounded-full !border-2 !border-card !bg-accent-green !relative !transform-none !left-0 !top-0"
          />
          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-[10px] font-medium text-accent-green whitespace-nowrap">
            ✓ Then
          </div>
        </div>
      )}

      {/* ELSE output handle (bottom-right) */}
      {data.hasElseBranch && (
        <div className="absolute -bottom-1.5" style={{ left: '70%' }}>
          <Handle
            type="source"
            position={Position.Bottom}
            id="else"
            className="!w-3 !h-3 !rounded-full !border-2 !border-card !bg-accent-red !relative !transform-none !left-0 !top-0"
          />
          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-[10px] font-medium text-accent-red whitespace-nowrap">
            ✗ Else
          </div>
        </div>
      )}

      {/* Fallback output handle if no branches configured */}
      {!data.hasThenBranch && !data.hasElseBranch && (
        <Handle
          type="source"
          position={Position.Bottom}
          id="output"
          className={cn('!w-3 !h-3 !rounded-full !border-2 !border-card', '!-bottom-1.5 !bg-border')}
        />
      )}
    </div>
  );
});

CompoundConditionNode.displayName = 'CompoundConditionNode';
