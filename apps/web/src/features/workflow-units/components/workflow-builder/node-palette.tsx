import { Box, Stack, Inline } from '@workspace/ui/components/primitives';
import { Text } from '@workspace/ui/components/typography';
import { Heading } from '@workspace/ui/components/typography';
import { cn } from '@workspace/ui/lib/utils';
import * as LucideIcons from 'lucide-react';
import { NODE_DEFINITIONS, type NodeDefinition } from '../../utils/node-types';

interface NodePaletteItemProps {
  definition: NodeDefinition;
}

const NodePaletteItem = ({ definition }: NodePaletteItemProps) => {
  const IconComponent = LucideIcons[definition.icon as keyof typeof LucideIcons] as React.ComponentType<{
    className?: string;
  }>;

  const onDragStart = (event: React.DragEvent) => {
    event.dataTransfer.setData('application/reactflow', definition.type);
    event.dataTransfer.effectAllowed = 'move';
  };

  // Category colors (design tokens)
  const categoryColors = {
    trigger: 'hover:bg-accent-blue-subtle border-accent-blue-subtle',
    action: 'hover:bg-accent-green-subtle border-accent-green-subtle',
    logic: 'hover:bg-accent-teal-subtle border-accent-teal-subtle',
  };

  return (
    <Box
      padding="space-150"
      backgroundColor="card"
      borderRadius="md"
      border="default"
      className={cn('cursor-move transition-all', categoryColors[definition.category])}
      draggable
      onDragStart={onDragStart}
      role="button"
      tabIndex={0}
      aria-label={`Drag ${definition.label} node`}
      title={definition.description}
    >
      <Inline space="space-100" align="center">
        {IconComponent && <IconComponent className="size-4 text-muted-foreground flex-shrink-0" />}
        <Text size="small" className="line-clamp-1">
          {definition.label}
        </Text>
      </Inline>
    </Box>
  );
};

export const NodePalette = () => {
  // Group nodes by category
  const triggers = NODE_DEFINITIONS.filter((d) => d.category === 'trigger');
  const actions = NODE_DEFINITIONS.filter((d) => d.category === 'action');
  const logic = NODE_DEFINITIONS.filter((d) => d.category === 'logic');

  return (
    <Box padding="space-300" backgroundColor="background" className="h-full overflow-y-auto">
      <Stack space="space-400">
        {/* Header */}
        <Heading level={4} className="text-base">
          Node Palette
        </Heading>

        {/* Triggers Section */}
        <Stack space="space-200">
          <Text weight="semibold" size="small" color="muted">
            Triggers
          </Text>
          <Stack space="space-150">
            {triggers.map((def) => (
              <NodePaletteItem key={def.type} definition={def} />
            ))}
          </Stack>
        </Stack>

        {/* Actions Section */}
        <Stack space="space-200">
          <Text weight="semibold" size="small" color="muted">
            Actions
          </Text>
          <Stack space="space-150">
            {actions.map((def) => (
              <NodePaletteItem key={def.type} definition={def} />
            ))}
          </Stack>
        </Stack>

        {/* Logic Section */}
        <Stack space="space-200">
          <Text weight="semibold" size="small" color="muted">
            Logic
          </Text>
          <Stack space="space-150">
            {logic.map((def) => (
              <NodePaletteItem key={def.type} definition={def} />
            ))}
          </Stack>
        </Stack>
      </Stack>
    </Box>
  );
};
