import { Box, Stack, Inline } from '@workspace/ui/components/primitives';
import { Text } from '@workspace/ui/components/typography';
import { Heading } from '@workspace/ui/components/typography';
import { cn } from '@workspace/ui/lib/utils';
import { NODE_DEFINITIONS, type NodeDefinition } from '../../utils/node-types';
import { getWorkflowIcon } from '../../utils/workflow-icons';

interface NodePaletteItemProps {
  definition: NodeDefinition;
}

const NodePaletteItem = ({ definition }: NodePaletteItemProps) => {
  const IconComponent = getWorkflowIcon(definition.icon);

  const onDragStart = (event: React.DragEvent) => {
    event.dataTransfer.setData('application/reactflow', definition.type);
    event.dataTransfer.effectAllowed = 'move';
  };

  // Handle keyboard activation for accessibility
  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      // Create a custom event that the canvas can listen for
      const customEvent = new CustomEvent('workflow:add-node', {
        detail: { type: definition.type },
        bubbles: true,
      });
      event.currentTarget.dispatchEvent(customEvent);
    }
  };

  // Category colors (design tokens)
  const categoryColors = {
    trigger: 'hover:bg-accent-blue-subtle border-accent-blue-subtle focus:ring-accent-blue',
    action: 'hover:bg-accent-green-subtle border-accent-green-subtle focus:ring-accent-green',
    logic: 'hover:bg-accent-teal-subtle border-accent-teal-subtle focus:ring-accent-teal',
  };

  return (
    <Box
      padding="space-150"
      backgroundColor="card"
      borderRadius="md"
      border="default"
      className={cn(
        'cursor-move transition-all',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        categoryColors[definition.category],
      )}
      draggable
      onDragStart={onDragStart}
      onKeyDown={onKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`Add ${definition.label} node to canvas. Drag or press Enter to add.`}
      aria-describedby={`desc-${definition.type}`}
      title={definition.description}
    >
      <Inline space="space-100" align="center">
        {IconComponent && <IconComponent className="size-4 text-muted-foreground flex-shrink-0" aria-hidden="true" />}
        <Text size="small" className="line-clamp-1">
          {definition.label}
        </Text>
      </Inline>
      <span id={`desc-${definition.type}`} className="sr-only">
        {definition.description}
      </span>
    </Box>
  );
};

export const NodePalette = () => {
  // Group nodes by category
  const triggers = NODE_DEFINITIONS.filter((d) => d.category === 'trigger');
  const actions = NODE_DEFINITIONS.filter((d) => d.category === 'action');
  const logic = NODE_DEFINITIONS.filter((d) => d.category === 'logic');

  return (
    <Box
      padding="none"
      backgroundColor="background"
      className="h-full overflow-y-auto px-6 pt-6"
      role="region"
      aria-label="Node palette - drag or press Enter on a node to add it to the canvas"
    >
      <Stack space="space-400">
        {/* Header */}
        <Heading level={4} className="text-base" id="node-palette-heading">
          Node Palette
        </Heading>

        {/* Triggers Section */}
        <section aria-labelledby="triggers-heading">
          <Stack space="space-200">
            <Text weight="semibold" size="small" color="muted" id="triggers-heading">
              Triggers
            </Text>
            <Stack space="space-150" role="group" aria-label="Trigger nodes">
              {triggers.map((def) => (
                <NodePaletteItem key={def.type} definition={def} />
              ))}
            </Stack>
          </Stack>
        </section>

        {/* Actions Section */}
        <section aria-labelledby="actions-heading">
          <Stack space="space-200">
            <Text weight="semibold" size="small" color="muted" id="actions-heading">
              Actions
            </Text>
            <Stack space="space-150" role="group" aria-label="Action nodes">
              {actions.map((def) => (
                <NodePaletteItem key={def.type} definition={def} />
              ))}
            </Stack>
          </Stack>
        </section>

        {/* Logic Section */}
        <section aria-labelledby="logic-heading">
          <Stack space="space-200">
            <Text weight="semibold" size="small" color="muted" id="logic-heading">
              Logic
            </Text>
            <Stack space="space-150" role="group" aria-label="Logic nodes">
              {logic.map((def) => (
                <NodePaletteItem key={def.type} definition={def} />
              ))}
            </Stack>
          </Stack>
        </section>
      </Stack>
    </Box>
  );
};
