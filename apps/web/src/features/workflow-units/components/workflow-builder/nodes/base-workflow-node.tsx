import { memo, useState } from 'react';
import { Handle, Position, useNodeId } from '@xyflow/react';
import { Pencil, Trash2 } from 'lucide-react';
import { Box, Stack, Inline } from '@workspace/ui/components/primitives';
import { Text } from '@workspace/ui/components/typography';
import { Button } from '@workspace/ui/components/button';
import { cn } from '@workspace/ui/lib/utils';
import type { NodeCategory, BaseNodeData } from '../../../utils/node-types';
import { getWorkflowIcon } from '../../../utils/workflow-icons';
import { useWorkflowEditorStore } from '../../../stores/workflow-editor-store';

// Category accent colors for handles and borders
const CATEGORY_STYLES = {
  trigger: {
    accent: 'var(--accent-blue)',
    handleBg: 'bg-accent-blue',
  },
  action: {
    accent: 'var(--accent-green)',
    handleBg: 'bg-accent-green',
  },
  logic: {
    accent: 'var(--accent-teal)',
    handleBg: 'bg-accent-teal',
  },
};

interface BaseWorkflowNodeProps {
  icon: string;
  category: NodeCategory;
  label: string;
  summary?: string;
  selected?: boolean;
  data: BaseNodeData;
}

/**
 * Base component for all workflow nodes
 * Follows DRY principle - all nodes use this component with different props
 *
 * Features:
 * - Hover toolbar with Edit/Delete buttons
 * - Visual feedback on selection
 * - Connection handles based on node category
 */
export const BaseWorkflowNode = memo(({ icon, category, label, summary, selected, data }: BaseWorkflowNodeProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const nodeId = useNodeId();

  // Store actions
  const { setSelectedNodeIds, openConfigDrawer, deleteNode } = useWorkflowEditorStore();

  // Get icon component dynamically
  const IconComponent = getWorkflowIcon(icon);

  // Category-based colors (design tokens)
  const categoryColors = {
    trigger: 'text-accent-blue bg-accent-blue-subtle',
    action: 'text-accent-green bg-accent-green-subtle',
    logic: 'text-accent-teal bg-accent-teal-subtle',
  };

  const iconBgColor = categoryColors[category];

  // Handle edit button click - select node and open drawer
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (nodeId) {
      setSelectedNodeIds([nodeId]);
      openConfigDrawer();
    }
  };

  // Handle delete button click
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (nodeId) {
      deleteNode(nodeId);
    }
  };

  const styles = CATEGORY_STYLES[category];

  return (
    <div className="relative group" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      {/* Toolbar - positioned to the right side, doesn't block handles */}
      <div
        className={cn(
          'absolute -right-10 top-1/2 -translate-y-1/2 z-10',
          'flex flex-col gap-1 p-1',
          'bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-lg',
          'transition-all duration-200',
          isHovered || selected ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 pointer-events-none',
        )}
      >
        <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-accent" onClick={handleEdit} title="Edit node">
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={handleDelete}
          title="Delete node"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Node card with category accent border */}
      <div
        className={cn(
          'min-w-[200px] max-w-[280px] rounded-lg border bg-card transition-all duration-200',
          selected ? 'shadow-lg' : 'shadow-sm hover:shadow-md',
        )}
        style={{
          // Use individual border properties to avoid mixing shorthand and non-shorthand
          borderTopColor: selected ? styles.accent : 'var(--border)',
          borderRightColor: selected ? styles.accent : 'var(--border)',
          borderBottomColor: selected ? styles.accent : 'var(--border)',
          borderLeftWidth: '3px',
          borderLeftColor: styles.accent,
        }}
      >
        <div className="p-3">
          <Stack space="space-150">
            {/* Header with icon and label */}
            <Inline space="space-100" align="center">
              <div className={cn('rounded-md p-1.5', iconBgColor)}>
                {IconComponent && <IconComponent className="size-4" />}
              </div>
              <Text size="small" weight="semibold" className="line-clamp-1">
                {label}
              </Text>
            </Inline>

            {/* Summary/config preview */}
            {summary && (
              <Text size="small" color="muted" className="line-clamp-2 font-mono text-xs">
                {summary}
              </Text>
            )}

            {/* Node name */}
            <Text size="small" color="muted" className="line-clamp-1">
              {data.label}
            </Text>
          </Stack>
        </div>

        {/* Connection handles - minimal style, visible on hover */}
        {category !== 'trigger' && (
          <Handle
            type="target"
            position={Position.Top}
            className={cn(
              '!w-3 !h-3 !rounded-full !border-2 !border-card',
              '!-top-1.5 transition-all duration-200',
              styles.handleBg,
              // Expand on hover for easier grabbing
              'group-hover:!w-4 group-hover:!h-4 group-hover:!-top-2',
            )}
          />
        )}
        <Handle
          type="source"
          position={Position.Bottom}
          className={cn(
            '!w-3 !h-3 !rounded-full !border-2 !border-card',
            '!-bottom-1.5 transition-all duration-200',
            styles.handleBg,
            // Expand on hover for easier grabbing
            'group-hover:!w-4 group-hover:!h-4 group-hover:!-bottom-2',
          )}
        />
      </div>
    </div>
  );
});

BaseWorkflowNode.displayName = 'BaseWorkflowNode';
