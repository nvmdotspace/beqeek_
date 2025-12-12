/**
 * IR to React Flow Converter - Converts Intermediate Representation to React Flow nodes/edges
 *
 * Flow: WorkflowIR → React Flow Nodes + Edges
 */

import type { Node, Edge } from '@xyflow/react';
import type { WorkflowIR } from './yaml-types';

/**
 * Result of IR to React Flow conversion
 */
export interface ReactFlowConversionResult {
  nodes: Node[];
  edges: Edge[];
  trigger: WorkflowIR['trigger'];
}

/**
 * Convert Intermediate Representation to React Flow nodes and edges
 *
 * @param ir - Validated WorkflowIR object
 * @returns Object containing nodes, edges, and trigger config
 *
 * @example
 * ```typescript
 * const ir = parseWorkflowYAML(yamlString);
 * const { nodes, edges, trigger } = irToReactFlow(ir);
 * // Load into React Flow canvas
 * setNodes(nodes);
 * setEdges(edges);
 * ```
 */
export function irToReactFlow(ir: WorkflowIR): ReactFlowConversionResult {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // Convert steps to nodes
  ir.steps.forEach((step, index) => {
    nodes.push({
      id: step.id,
      type: step.type,
      position: step.position || calculateVerticalPosition(index, ir.steps.length),
      data: {
        label: step.name,
        config: step.config,
      },
    });

    // Convert depends_on to edges
    if (step.depends_on && step.depends_on.length > 0) {
      step.depends_on.forEach((sourceId) => {
        edges.push({
          id: `${sourceId}->${step.id}`,
          source: sourceId,
          target: step.id,
          type: 'default',
        });
      });
    }
  });

  return {
    nodes,
    edges,
    trigger: ir.trigger,
  };
}

/**
 * Calculate vertical position for auto-layout
 *
 * Uses simple vertical stacking with consistent spacing.
 * For more complex layouts, consider using Dagre algorithm.
 *
 * @param index - Step index in array
 * @param total - Total number of steps
 * @returns Position object with x,y coordinates
 */
function calculateVerticalPosition(index: number, _total: number): { x: number; y: number } {
  const HORIZONTAL_CENTER = 400; // Center horizontally
  const VERTICAL_SPACING = 120; // Space between nodes
  const VERTICAL_START = 100; // Top padding

  return {
    x: HORIZONTAL_CENTER,
    y: VERTICAL_START + index * VERTICAL_SPACING,
  };
}

/**
 * Calculate grid position for auto-layout (alternative layout)
 *
 * Arranges nodes in a grid pattern, useful for workflows with many parallel steps.
 *
 * @param index - Step index in array
 * @param total - Total number of steps
 * @returns Position object with x,y coordinates
 */
export function calculateGridPosition(index: number, total: number): { x: number; y: number } {
  const COLUMNS = Math.ceil(Math.sqrt(total)); // Square-ish grid
  const HORIZONTAL_SPACING = 250;
  const VERTICAL_SPACING = 120;
  const HORIZONTAL_START = 100;
  const VERTICAL_START = 100;

  const row = Math.floor(index / COLUMNS);
  const col = index % COLUMNS;

  return {
    x: HORIZONTAL_START + col * HORIZONTAL_SPACING,
    y: VERTICAL_START + row * VERTICAL_SPACING,
  };
}
