import { Box, Stack } from '@workspace/ui/components/primitives';
import { Heading, Text } from '@workspace/ui/components/typography';
import { Alert, AlertDescription } from '@workspace/ui/components/alert';
import { Info } from 'lucide-react';
import { useWorkflowEditorStore } from '../../stores/workflow-editor-store';
import { NODE_DEFINITIONS } from '../../utils/node-types';

/**
 * Node Configuration Panel
 * Placeholder for Phase 3 - detailed forms will be added in future phases
 */
export const NodeConfigPanel = () => {
  const { nodes, selectedNodeIds } = useWorkflowEditorStore();

  const selectedNode = nodes.find((n) => selectedNodeIds.includes(n.id));

  if (!selectedNode) {
    return (
      <Box padding="space-300" className="h-full">
        <Stack space="space-300">
          <Heading level={4} className="text-base">
            Node Configuration
          </Heading>
          <Text color="muted" size="small">
            Select a node to view and edit its configuration
          </Text>
        </Stack>
      </Box>
    );
  }

  const nodeDef = NODE_DEFINITIONS.find((d) => d.type === selectedNode.type);

  return (
    <Box padding="space-300" className="h-full overflow-y-auto">
      <Stack space="space-300">
        <Heading level={4} className="text-base">
          Node Configuration
        </Heading>

        <Stack space="space-200">
          <Text weight="semibold">{nodeDef?.label || selectedNode.type}</Text>
          <Text size="small" color="muted">
            ID: {selectedNode.id}
          </Text>
          {nodeDef?.description && (
            <Text size="small" color="muted">
              {nodeDef.description}
            </Text>
          )}
        </Stack>

        {/* Placeholder alert */}
        <Alert>
          <Info className="size-4" />
          <AlertDescription>
            <Text size="small">Configuration forms will be implemented in future phases based on node type.</Text>
          </AlertDescription>
        </Alert>

        {/* Display current node data */}
        <Stack space="space-150">
          <Text weight="semibold" size="small">
            Current Data:
          </Text>
          <Box
            padding="space-200"
            backgroundColor="muted"
            borderRadius="md"
            className="font-mono text-xs overflow-auto max-h-96"
          >
            <pre>{JSON.stringify(selectedNode.data, null, 2)}</pre>
          </Box>
        </Stack>
      </Stack>
    </Box>
  );
};
