/**
 * useModeSync Hook
 *
 * Handles bidirectional synchronization between Visual and YAML modes.
 * - Visual → YAML: Convert nodes/edges to YAML when switching to YAML mode
 * - YAML → Visual: Parse YAML and load nodes/edges when switching to Visual mode
 */

import { useEffect, useRef } from 'react';
import { useWorkflowEditorStore } from '../stores/workflow-editor-store';
import { reactFlowToYAML, yamlToReactFlow } from '../utils/yaml-converter';
import type { TriggerIR } from '../utils/yaml-types';

/**
 * Map event source type to trigger IR type
 */
function mapEventSourceToTriggerType(eventSourceType: string): TriggerIR['type'] {
  const typeMap: Record<string, TriggerIR['type']> = {
    ACTIVE_TABLE: 'table',
    WEBHOOK: 'webhook',
    OPTIN_FORM: 'form',
    SCHEDULE: 'schedule',
  };
  return typeMap[eventSourceType] || 'webhook';
}

export function useModeSync() {
  const { mode, nodes, edges, yamlContent, currentEvent, setYamlContent, setNodes, setEdges, setYamlError } =
    useWorkflowEditorStore();

  const prevModeRef = useRef<'visual' | 'yaml'>('visual');

  useEffect(() => {
    if (!currentEvent) return;

    const prevMode = prevModeRef.current;
    const currentMode = mode;

    // Skip if mode hasn't changed
    if (prevMode === currentMode) return;

    try {
      // Visual → YAML: Convert nodes/edges to YAML
      if (prevMode === 'visual' && currentMode === 'yaml') {
        const yaml = reactFlowToYAML(nodes, edges, {
          type: mapEventSourceToTriggerType(currentEvent.eventSourceType),
          config: currentEvent.eventSourceParams as unknown as Record<string, unknown>,
        });
        setYamlContent(yaml);
        setYamlError(null);
      }

      // YAML → Visual: Parse YAML and load nodes/edges
      if (prevMode === 'yaml' && currentMode === 'visual') {
        if (!yamlContent || yamlContent.trim() === '' || yamlContent === '{}') {
          // Empty YAML - clear canvas
          setNodes([]);
          setEdges([]);
          setYamlError(null);
        } else {
          // Parse YAML (pass event context to handle legacy format)
          const { nodes: parsedNodes, edges: parsedEdges } = yamlToReactFlow(yamlContent, {
            eventSourceType: currentEvent.eventSourceType,
            eventSourceParams: currentEvent.eventSourceParams as unknown as Record<string, unknown>,
          });
          setNodes(parsedNodes);
          setEdges(parsedEdges);
          setYamlError(null);
        }
      }
    } catch (error) {
      // Set error but don't block mode switch
      const errorMessage = error instanceof Error ? error.message : 'Failed to sync modes';
      setYamlError(errorMessage);

      // If switching TO YAML failed, still show the raw YAML (even if invalid)
      // If switching TO VISUAL failed, show error and stay in YAML mode
      if (prevMode === 'yaml' && currentMode === 'visual') {
        // Block switch to visual if YAML is invalid
        // User will see error in YAML editor
        console.error('[useModeSync] Failed to parse YAML:', errorMessage);
      }
    }

    // Update prev mode ref
    prevModeRef.current = currentMode;
  }, [mode, nodes, edges, yamlContent, currentEvent, setYamlContent, setNodes, setEdges, setYamlError]);
}
