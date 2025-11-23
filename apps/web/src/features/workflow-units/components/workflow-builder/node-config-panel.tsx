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
      <Box padding="space-300" className="h-full" role="region" aria-label="Node configuration panel">
        <Stack space="space-300">
          <Heading level={4} className="text-base" id="config-panel-heading">
            Node Configuration
          </Heading>
          <Text color="muted" size="small" role="status">
            Select a node to view and edit its configuration
          </Text>
        </Stack>
      </Box>
    );
  }

  const nodeDef = NODE_DEFINITIONS.find((d) => d.type === selectedNode.type);

  return (
    <Box
      padding="space-300"
      className="h-full overflow-y-auto"
      role="region"
      aria-label={`Configuration for ${nodeDef?.label || selectedNode.type} node`}
    >
      <Stack space="space-300">
        <Heading level={4} className="text-base" id="config-panel-heading">
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
        <Alert role="note">
          <Info className="size-4" aria-hidden="true" />
          <AlertDescription>
            <Text size="small">Configuration forms will be implemented in future phases based on node type.</Text>
          </AlertDescription>
        </Alert>

        {/* Display current node data */}
        <Stack space="space-150">
          <Text weight="semibold" size="small" id="node-data-label">
            Current Data:
          </Text>
          <Box
            padding="space-200"
            backgroundColor="muted"
            borderRadius="md"
            className="font-mono text-xs overflow-auto max-h-96"
            role="region"
            aria-labelledby="node-data-label"
            tabIndex={0}
          >
            <pre aria-label="Node configuration data in JSON format">{JSON.stringify(selectedNode.data, null, 2)}</pre>
          </Box>
        </Stack>
      </Stack>
    </Box>
  );
};
