/**
 * NodeConfigDrawer Component
 *
 * Slide-over drawer for node configuration (n8n-style).
 * Opens from right when a node is selected.
 * Replaces the fixed NodeConfigPanel sidebar.
 */

import { useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@workspace/ui/components/sheet';
import { Box, Stack } from '@workspace/ui/components/primitives';
import { Text } from '@workspace/ui/components/typography';
import { Alert, AlertDescription } from '@workspace/ui/components/alert';
import { Badge } from '@workspace/ui/components/badge';
import { ScrollArea } from '@workspace/ui/components/scroll-area';
import { Info } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { useWorkflowEditorStore } from '../../stores/workflow-editor-store';
import { NODE_DEFINITIONS } from '../../utils/node-types';

export function NodeConfigDrawer() {
  const { nodes, selectedNodeIds, isConfigDrawerOpen, openConfigDrawer, closeConfigDrawer, setSelectedNodeIds, mode } =
    useWorkflowEditorStore();

  const selectedNode = nodes.find((n) => selectedNodeIds.includes(n.id));
  const nodeDef = selectedNode ? NODE_DEFINITIONS.find((d) => d.type === selectedNode.type) : null;

  // Open drawer when node is selected (in visual mode)
  useEffect(() => {
    if (selectedNodeIds.length > 0 && mode === 'visual' && !isConfigDrawerOpen) {
      openConfigDrawer();
    }
  }, [selectedNodeIds, mode, isConfigDrawerOpen, openConfigDrawer]);

  // Handle drawer close - also clear selection
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      closeConfigDrawer();
      setSelectedNodeIds([]); // Clear selection when closing
    }
  };

  // Get icon component
  const IconComponent = nodeDef?.icon
    ? (LucideIcons[nodeDef.icon as keyof typeof LucideIcons] as React.ComponentType<{ className?: string }>)
    : null;

  // Category colors for badge
  const categoryColors = {
    trigger: 'bg-accent-blue-subtle text-accent-blue',
    action: 'bg-accent-green-subtle text-accent-green',
    logic: 'bg-accent-teal-subtle text-accent-teal',
  };

  return (
    <Sheet open={isConfigDrawerOpen} onOpenChange={handleOpenChange}>
      <SheetContent side="right" className="w-80 sm:w-96 sm:max-w-md p-0">
        {selectedNode && nodeDef ? (
          <>
            <SheetHeader className="p-4 pb-0">
              <div className="flex items-center gap-3">
                {IconComponent && (
                  <div className={`p-2 rounded-lg ${categoryColors[nodeDef.category]}`} aria-hidden="true">
                    <IconComponent className="h-5 w-5" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <SheetTitle className="truncate">{nodeDef.label}</SheetTitle>
                  <SheetDescription className="truncate">
                    <Badge variant="outline" className="text-xs mt-1" aria-label={`Category: ${nodeDef.category}`}>
                      {nodeDef.category}
                    </Badge>
                  </SheetDescription>
                </div>
              </div>
            </SheetHeader>

            <ScrollArea className="flex-1 h-[calc(100vh-120px)]">
              <div className="p-4 space-y-4">
                {/* Node Description */}
                {nodeDef.description && (
                  <Text size="small" color="muted">
                    {nodeDef.description}
                  </Text>
                )}

                {/* Node ID */}
                <Stack space="space-100">
                  <Text weight="semibold" size="small">
                    Node ID
                  </Text>
                  <Text size="small" color="muted" className="font-mono">
                    {selectedNode.id}
                  </Text>
                </Stack>

                {/* Placeholder alert */}
                <Alert role="note">
                  <Info className="size-4" aria-hidden="true" />
                  <AlertDescription>
                    <Text size="small">
                      Configuration forms will be implemented in future phases based on node type.
                    </Text>
                  </AlertDescription>
                </Alert>

                {/* Display current node data */}
                <Stack space="space-150">
                  <Text weight="semibold" size="small" id="drawer-node-data-label">
                    Current Data
                  </Text>
                  <Box
                    padding="space-200"
                    backgroundColor="muted"
                    borderRadius="md"
                    className="font-mono text-xs overflow-auto max-h-80"
                    role="region"
                    aria-labelledby="drawer-node-data-label"
                    tabIndex={0}
                  >
                    <pre className="whitespace-pre-wrap break-all" aria-label="Node configuration data in JSON format">
                      {JSON.stringify(selectedNode.data, null, 2)}
                    </pre>
                  </Box>
                </Stack>
              </div>
            </ScrollArea>
          </>
        ) : (
          <div className="p-4">
            <SheetHeader>
              <SheetTitle>Node Configuration</SheetTitle>
              <SheetDescription>Select a node to view and edit its configuration</SheetDescription>
            </SheetHeader>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
