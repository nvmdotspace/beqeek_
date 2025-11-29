/**
 * Merge Node - Joins conditional branches back together
 *
 * Used when both then/else branches complete and need to rejoin
 * into a single execution path.
 */
import { memo, useState } from 'react';
import { Handle, Position, useNodeId } from '@xyflow/react';
import { GitMerge, Trash2 } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { cn } from '@workspace/ui/lib/utils';
import { useWorkflowEditorStore } from '../../../stores/workflow-editor-store';

export interface MergeNodeData {
  label?: string;
  branchIds?: string[]; // IDs of merged branches
}

export interface MergeNodeProps {
  id: string;
  data: MergeNodeData;
  selected?: boolean;
}

export const MergeNode = memo(({ data, selected }: MergeNodeProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const nodeId = useNodeId();

  const { deleteNode } = useWorkflowEditorStore();

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (nodeId) {
      deleteNode(nodeId);
    }
  };

  return (
    <div className="relative group" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      {/* Delete button on hover */}
      <div
        className={cn(
          'absolute -right-8 top-1/2 -translate-y-1/2 z-10',
          'transition-all duration-200',
          isHovered || selected ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 pointer-events-none',
        )}
      >
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={handleDelete}
          title="Delete merge"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>

      {/* Merge node circle */}
      <div
        className={cn(
          'w-12 h-12 rounded-full border-2 flex items-center justify-center',
          'bg-background transition-all duration-200',
          selected ? 'border-accent-teal shadow-lg' : 'border-border hover:border-muted-foreground',
        )}
      >
        <GitMerge className="size-5 text-muted-foreground" />
      </div>

      {/* Label */}
      {data.label && (
        <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground whitespace-nowrap">
          {data.label}
        </div>
      )}

      {/* Multiple target handles for branch inputs */}
      <Handle
        type="target"
        position={Position.Top}
        id="then"
        className="!w-2 !h-2 !rounded-full !border !border-card !bg-accent-green"
        style={{ left: '30%' }}
      />
      <Handle
        type="target"
        position={Position.Top}
        id="else"
        className="!w-2 !h-2 !rounded-full !border !border-card !bg-accent-red"
        style={{ left: '70%' }}
      />

      {/* Single output handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="output"
        className={cn('!w-3 !h-3 !rounded-full !border-2 !border-card', '!-bottom-1.5 !bg-border')}
      />
    </div>
  );
});

MergeNode.displayName = 'MergeNode';
