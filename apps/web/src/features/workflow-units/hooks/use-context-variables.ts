/**
 * useContextVariables - Hook to get available variables in workflow context
 *
 * Provides list of $[...] variables that can be referenced in the current workflow.
 */

import { useMemo } from 'react';
import { useWorkflowEditorStore } from '../stores/workflow-editor-store';

interface ContextVariable {
  name: string;
  path: string;
  type: 'trigger' | 'step' | 'env' | 'secret';
}

export function useContextVariables(currentNodeId?: string): ContextVariable[] {
  const { nodes } = useWorkflowEditorStore();

  return useMemo(() => {
    const variables: ContextVariable[] = [];

    // Add trigger variables
    const triggerNode = nodes.find((n) => n.type?.startsWith('trigger_'));
    if (triggerNode) {
      const triggerName = (triggerNode.data as { name?: string })?.name || 'trigger';
      variables.push(
        { name: `${triggerName}.data`, path: `${triggerName}.data`, type: 'trigger' },
        { name: `${triggerName}.id`, path: `${triggerName}.id`, type: 'trigger' },
        { name: `${triggerName}.timestamp`, path: `${triggerName}.timestamp`, type: 'trigger' },
      );

      // Add specific trigger fields based on type
      if (triggerNode.type === 'trigger_table') {
        variables.push(
          { name: `${triggerName}.record_id`, path: `${triggerName}.record_id`, type: 'trigger' },
          { name: `${triggerName}.action`, path: `${triggerName}.action`, type: 'trigger' },
        );
      } else if (triggerNode.type === 'trigger_form') {
        variables.push({ name: `${triggerName}.form_data`, path: `${triggerName}.form_data`, type: 'trigger' });
      } else if (triggerNode.type === 'trigger_webhook') {
        variables.push(
          { name: `${triggerName}.body`, path: `${triggerName}.body`, type: 'trigger' },
          { name: `${triggerName}.headers`, path: `${triggerName}.headers`, type: 'trigger' },
        );
      }
    }

    // Add step variables (from nodes before current node)
    const currentIndex = currentNodeId ? nodes.findIndex((n) => n.id === currentNodeId) : nodes.length;

    for (let i = 0; i < currentIndex; i++) {
      const node = nodes[i];
      if (node && !node.type?.startsWith('trigger_')) {
        const stepName = (node.data as { name?: string })?.name || `step_${i}`;
        variables.push(
          { name: `${stepName}.result`, path: `${stepName}.result`, type: 'step' },
          { name: `${stepName}.success`, path: `${stepName}.success`, type: 'step' },
        );

        // Add specific output fields based on node type
        if (node.type === 'api_call') {
          variables.push(
            { name: `${stepName}.response`, path: `${stepName}.response`, type: 'step' },
            { name: `${stepName}.status`, path: `${stepName}.status`, type: 'step' },
          );
        } else if (node.type === 'table_operation') {
          variables.push(
            { name: `${stepName}.data`, path: `${stepName}.data`, type: 'step' },
            { name: `${stepName}.count`, path: `${stepName}.count`, type: 'step' },
          );
        }
      }
    }

    return variables;
  }, [nodes, currentNodeId]);
}

/**
 * Get simple variable paths for picker
 */
export function useContextVariablePaths(currentNodeId?: string): string[] {
  const variables = useContextVariables(currentNodeId);
  return useMemo(() => variables.map((v) => v.path), [variables]);
}
