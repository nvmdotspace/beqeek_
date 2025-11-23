/**
 * React Flow to IR Converter - Converts React Flow nodes/edges to Intermediate Representation
 *
 * Flow: React Flow Nodes + Edges → WorkflowIR (topologically sorted)
 */

import type { Node, Edge } from '@xyflow/react';
import type { WorkflowIR, StepIR, TriggerIR } from './yaml-types';
import { topologicalSort, buildDependencyMap, validateUniqueStepIds } from './topological-sort';

/**
 * Convert React Flow nodes and edges to Intermediate Representation
 *
 * @param nodes - Array of React Flow nodes from canvas
 * @param edges - Array of React Flow edges from canvas
 * @param trigger - Trigger configuration for the workflow
 * @returns WorkflowIR with topologically sorted steps
 * @throws {Error} If circular dependency or invalid step IDs
 *
 * @example
 * ```typescript
 * const { nodes, edges } = useWorkflowEditorStore();
 * const ir = reactFlowToIR(nodes, edges, {
 *   type: 'schedule',
 *   config: { cron: '0 9 * * 1-5' }
 * });
 * ```
 */
export function reactFlowToIR(nodes: Node[], edges: Edge[], trigger: TriggerIR): WorkflowIR {
  // Build dependency map from edges
  const dependencyMap = buildDependencyMapFromEdges(edges);

  // Convert nodes to steps
  const steps: StepIR[] = nodes.map((node) => {
    // Validate node has required fields
    if (!node.type) {
      throw new Error(`Node "${node.id}" is missing required 'type' field`);
    }

    return {
      id: node.id,
      name: (node.data?.label as string) || node.id,
      type: node.type,
      config: (node.data?.config as Record<string, unknown>) || {},
      depends_on: dependencyMap.get(node.id),
      position: {
        x: Math.round(node.position.x), // Round to avoid floating point precision issues
        y: Math.round(node.position.y),
      },
    };
  });

  // Validate step IDs are unique
  validateUniqueStepIds(steps);

  // Build fresh dependency map from steps for topological sort
  const stepDependencyMap = buildDependencyMap(steps);

  // Topologically sort steps (validates no circular dependencies)
  const sortedSteps = topologicalSort(steps, stepDependencyMap);

  return {
    version: '1.0',
    trigger,
    steps: sortedSteps,
  };
}

/**
 * Build dependency map from React Flow edges
 *
 * Maps each target node to array of source node IDs it depends on.
 *
 * @param edges - Array of React Flow edges
 * @returns Map of target ID to array of source IDs
 */
function buildDependencyMapFromEdges(edges: Edge[]): Map<string, string[]> {
  const map = new Map<string, string[]>();

  for (const edge of edges) {
    // Skip edges without source/target (invalid state)
    if (!edge.source || !edge.target) {
      continue;
    }

    const dependencies = map.get(edge.target) || [];
    dependencies.push(edge.source);
    map.set(edge.target, dependencies);
  }

  return map;
}

/**
 * Extract metadata from nodes (optional future enhancement)
 *
 * @param nodes - Array of React Flow nodes
 * @returns Metadata object with description and tags
 */
export function extractMetadataFromNodes(nodes: Node[]): WorkflowIR['metadata'] {
  // Future: Extract metadata from special "metadata" node or global config
  return undefined;
}
