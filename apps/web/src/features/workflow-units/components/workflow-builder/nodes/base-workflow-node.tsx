import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Box, Stack, Inline } from '@workspace/ui/components/primitives';
import { Text } from '@workspace/ui/components/typography';
import { cn } from '@workspace/ui/lib/utils';
import type { NodeCategory, BaseNodeData } from '../../../utils/node-types';
import { getWorkflowIcon } from '../../../utils/workflow-icons';

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
 */
export const BaseWorkflowNode = memo(({ icon, category, label, summary, selected, data }: BaseWorkflowNodeProps) => {
  // Get icon component dynamically
  const IconComponent = getWorkflowIcon(icon);

  // Category-based colors (design tokens)
  const categoryColors = {
    trigger: 'text-accent-blue bg-accent-blue-subtle',
    action: 'text-accent-green bg-accent-green-subtle',
    logic: 'text-accent-teal bg-accent-teal-subtle',
  };

  const iconBgColor = categoryColors[category];

  return (
    <Box
      padding="space-200"
      backgroundColor="card"
      borderRadius="md"
      border="default"
      className={cn('min-w-[200px] max-w-[280px] transition-all', selected ? 'ring-2 ring-primary shadow-lg' : '')}
    >
      <Stack space="space-150">
        {/* Header with icon and label */}
        <Inline space="space-100" align="center">
          <div className={cn('rounded-md p-1', iconBgColor)}>
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
          {data.name}
        </Text>
      </Stack>

      {/* Connection handles */}
      {category !== 'trigger' && <Handle type="target" position={Position.Top} className="!bg-primary" />}
      <Handle type="source" position={Position.Bottom} className="!bg-primary" />
    </Box>
  );
});

BaseWorkflowNode.displayName = 'BaseWorkflowNode';
