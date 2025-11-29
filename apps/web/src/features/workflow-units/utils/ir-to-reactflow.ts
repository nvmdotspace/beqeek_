/**
 * IR to React Flow Converter - Converts Intermediate Representation to React Flow nodes/edges
 *
 * Flow: WorkflowIR → React Flow Nodes + Edges
 *
 * Supports:
 * - Regular flat steps
 * - Compound condition nodes (with then/else branches)
 * - Compound loop nodes (with nested_blocks)
 * - Callback nodes (for delay blocks)
 */

import { MarkerType, type Node, type Edge } from '@xyflow/react';
import type { WorkflowIR, StepIR, CallbackIR } from './yaml-types';
import { autoLayout, shouldApplyLayout } from './auto-layout';

/**
 * Result of IR to React Flow conversion
 */
export interface ReactFlowConversionResult {
  nodes: Node[];
  edges: Edge[];
  trigger: WorkflowIR['trigger'];
  callbacks?: CallbackIR[];
}

/**
 * Check if a step has nested structure (compound node)
 */
function hasNestedStructure(step: StepIR): boolean {
  return !!(step.branches || step.nested_blocks);
}

/**
 * Calculate child node position within a parent compound node
 */
function calculateChildPosition(
  branch: 'then' | 'else' | 'loop',
  index: number,
  _totalSiblings: number,
): { x: number; y: number } {
  const CHILD_VERTICAL_SPACING = 80;
  const HEADER_HEIGHT = 80; // Space for parent header

  if (branch === 'then') {
    return {
      x: 20, // Left side
      y: HEADER_HEIGHT + index * CHILD_VERTICAL_SPACING,
    };
  } else if (branch === 'else') {
    return {
      x: 160, // Right side
      y: HEADER_HEIGHT + index * CHILD_VERTICAL_SPACING,
    };
  } else {
    // loop
    return {
      x: 20,
      y: HEADER_HEIGHT + index * CHILD_VERTICAL_SPACING,
    };
  }
}

/**
 * Create a child node within a compound parent
 */
function createChildNode(
  step: StepIR,
  parentId: string,
  branch: 'then' | 'else' | 'loop',
  index: number,
  totalSiblings: number,
): Node {
  return {
    id: `${parentId}_${branch}_${step.id}`,
    type: step.type,
    position: step.position || calculateChildPosition(branch, index, totalSiblings),
    data: {
      label: step.name,
      config: step.config,
    },
    // Key: Establish parent-child relationship
    parentId: parentId,
    extent: 'parent' as const, // Constrain child within parent bounds
    draggable: true, // Allow repositioning within parent
  };
}

/**
 * Convert Intermediate Representation to React Flow nodes and edges
 *
 * @param ir - Validated WorkflowIR object
 * @returns Object containing nodes, edges, trigger config, and callbacks
 *
 * @example
 * ```typescript
 * const ir = parseWorkflowYAML(yamlString);
 * const { nodes, edges, trigger, callbacks } = irToReactFlow(ir);
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
    if (hasNestedStructure(step)) {
      // Create compound parent node
      const isCondition = step.type === 'condition';
      const isLoop = step.type === 'loop';

      const parentNode: Node = {
        id: step.id,
        type: isCondition ? 'compound_condition' : isLoop ? 'compound_loop' : step.type,
        position: step.position || calculateVerticalPosition(index, ir.steps.length),
        data: {
          label: step.name,
          config: step.config,
          // Condition-specific data
          condition: step.config?.condition || step.config?.expressions,
          hasThenBranch: !!step.branches?.then?.length,
          hasElseBranch: !!step.branches?.else?.length,
          // Loop-specific data
          itemVar: step.config?.itemVariable || step.config?.iterator || 'item',
          collection: step.config?.items || step.config?.array || '[]',
          childCount:
            (step.nested_blocks?.length || 0) + (step.branches?.then?.length || 0) + (step.branches?.else?.length || 0),
        },
        // Compound node style - initial size
        style: {
          width: 300,
          height: 200,
        },
      };
      nodes.push(parentNode);

      // Create child nodes for branches (condition)
      if (step.branches?.then) {
        step.branches.then.forEach((thenStep, thenIndex) => {
          const childNode = createChildNode(thenStep, step.id, 'then', thenIndex, step.branches!.then!.length);
          nodes.push(childNode);

          // Edge from parent to first then child with sourceHandle
          if (thenIndex === 0) {
            edges.push({
              id: `${step.id}-then-${thenStep.id}`,
              source: step.id,
              sourceHandle: 'then', // Specific handle ID
              target: childNode.id,
              type: 'branch',
              label: 'then',
              animated: false,
              style: {
                stroke: 'var(--accent-green)',
                strokeWidth: 2,
              },
              markerEnd: {
                type: MarkerType.ArrowClosed,
                color: 'var(--accent-green)',
              },
            });
          }
        });
      }

      if (step.branches?.else) {
        step.branches.else.forEach((elseStep, elseIndex) => {
          const childNode = createChildNode(elseStep, step.id, 'else', elseIndex, step.branches!.else!.length);
          nodes.push(childNode);

          // Edge from parent to first else child with sourceHandle
          if (elseIndex === 0) {
            edges.push({
              id: `${step.id}-else-${elseStep.id}`,
              source: step.id,
              sourceHandle: 'else', // Specific handle ID
              target: childNode.id,
              type: 'branch',
              label: 'else',
              animated: false,
              style: {
                stroke: 'var(--accent-red)',
                strokeWidth: 2,
              },
              markerEnd: {
                type: MarkerType.ArrowClosed,
                color: 'var(--accent-red)',
              },
            });
          }
        });
      }

      // Create child nodes for loop nested blocks
      if (step.nested_blocks) {
        const nestedBlocks = step.nested_blocks;
        const childNodeIds: string[] = [];

        nestedBlocks.forEach((nestedStep, nestedIndex) => {
          const childNode = createChildNode(nestedStep, step.id, 'loop', nestedIndex, nestedBlocks.length);
          nodes.push(childNode);
          childNodeIds.push(childNode.id);

          // Edge from parent to first nested child
          if (nestedIndex === 0) {
            edges.push({
              id: `${step.id}-loop-start-${nestedStep.id}`,
              source: step.id,
              target: childNode.id,
              type: 'loop',
              label: 'each item',
              animated: false,
              style: {
                stroke: 'var(--accent-purple)',
                strokeWidth: 2,
                strokeDasharray: '5,5', // Dashed line for loop
              },
              markerEnd: {
                type: MarkerType.ArrowClosed,
                color: 'var(--accent-purple)',
              },
            });
          }
        });

        // Add sequential edges between loop children
        for (let i = 0; i < childNodeIds.length - 1; i++) {
          const sourceId = childNodeIds[i];
          const targetId = childNodeIds[i + 1];
          if (sourceId && targetId) {
            edges.push({
              id: `${step.id}-loop-seq-${i}`,
              source: sourceId,
              target: targetId,
              type: 'loop',
              animated: false,
              style: {
                stroke: 'var(--accent-purple)',
                strokeWidth: 1.5,
              },
              markerEnd: {
                type: MarkerType.ArrowClosed,
                color: 'var(--accent-purple)',
              },
            });
          }
        }

        // Add loop-back edge from last child to parent (visual repeat indicator)
        const lastChildId = childNodeIds[childNodeIds.length - 1];
        if (lastChildId) {
          edges.push({
            id: `${step.id}-loop-repeat`,
            source: lastChildId,
            target: step.id,
            targetHandle: 'loop-back', // Special handle for loop-back
            type: 'loop',
            label: 'repeat',
            animated: true, // Animated to show flow
            style: {
              stroke: 'var(--accent-purple)',
              strokeWidth: 1.5,
              strokeDasharray: '3,3',
            },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: 'var(--accent-purple)',
            },
          });
        }
      }
    } else {
      // Regular node (existing logic)
      nodes.push({
        id: step.id,
        type: step.type,
        position: step.position || calculateVerticalPosition(index, ir.steps.length),
        data: {
          label: step.name,
          config: step.config,
        },
      });
    }

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

  // Convert callbacks to nodes (placed in a separate area)
  if (ir.callbacks && ir.callbacks.length > 0) {
    const callbackStartY = calculateCallbackAreaY(ir.steps.length);

    ir.callbacks.forEach((callback, index) => {
      const callbackNodeId = `callback_${callback.id}`;

      nodes.push({
        id: callbackNodeId,
        type: callback.type,
        position: callback.position || calculateCallbackPosition(index, callbackStartY),
        data: {
          label: callback.name,
          config: callback.config,
          isCallback: true, // Mark as callback node for UI styling
          callbackId: callback.id,
        },
      });

      // Find delay nodes that reference this callback and create edges
      ir.steps.forEach((step) => {
        if (step.type === 'delay' && step.config.callback === callback.name) {
          edges.push({
            id: `${step.id}->callback_${callback.id}`,
            source: step.id,
            target: callbackNodeId,
            type: 'callback', // Special edge type for callback connections
            animated: true, // Visual indicator for async connection
            style: { strokeDasharray: '5,5' },
          });
        }
      });

      // Convert callback's nested steps to nodes (if any)
      if (callback.steps && callback.steps.length > 0) {
        callback.steps.forEach((nestedStep, nestedIndex) => {
          const nestedNodeId = `${callbackNodeId}_${nestedStep.id}`;

          nodes.push({
            id: nestedNodeId,
            type: nestedStep.type,
            position: nestedStep.position || calculateCallbackNestedPosition(index, nestedIndex, callbackStartY),
            data: {
              label: nestedStep.name,
              config: nestedStep.config,
              isCallbackStep: true,
              parentCallbackId: callback.id,
            },
          });

          // Connect nested steps
          if (nestedStep.depends_on && nestedStep.depends_on.length > 0) {
            nestedStep.depends_on.forEach((sourceId) => {
              edges.push({
                id: `${callbackNodeId}_${sourceId}->${nestedNodeId}`,
                source: `${callbackNodeId}_${sourceId}`,
                target: nestedNodeId,
                type: 'default',
              });
            });
          } else if (nestedIndex === 0) {
            // First nested step depends on callback node
            edges.push({
              id: `${callbackNodeId}->${nestedNodeId}`,
              source: callbackNodeId,
              target: nestedNodeId,
              type: 'default',
            });
          }
        });
      }
    });
  }

  // Auto-layout if nodes don't have meaningful positions saved
  // This ensures clean layout for legacy/imported workflows
  let finalNodes = nodes;
  if (shouldApplyLayout(nodes)) {
    finalNodes = autoLayout(nodes, edges);
  }

  return {
    nodes: finalNodes,
    edges,
    trigger: ir.trigger,
    callbacks: ir.callbacks,
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
function calculateVerticalPosition(index: number, total: number): { x: number; y: number } {
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

/**
 * Calculate Y position for callback area (below main workflow)
 *
 * @param stepsCount - Number of steps in main workflow
 * @returns Y coordinate for callback area start
 */
function calculateCallbackAreaY(stepsCount: number): number {
  const VERTICAL_SPACING = 120;
  const VERTICAL_START = 100;
  const CALLBACK_AREA_GAP = 100; // Gap between main workflow and callbacks

  return VERTICAL_START + stepsCount * VERTICAL_SPACING + CALLBACK_AREA_GAP;
}

/**
 * Calculate position for callback node
 *
 * @param index - Callback index
 * @param startY - Y coordinate for callback area
 * @returns Position object with x,y coordinates
 */
function calculateCallbackPosition(index: number, startY: number): { x: number; y: number } {
  const HORIZONTAL_SPACING = 300;
  const HORIZONTAL_START = 700; // Offset to the right of main workflow

  return {
    x: HORIZONTAL_START + index * HORIZONTAL_SPACING,
    y: startY,
  };
}

/**
 * Calculate position for nested step within callback
 *
 * @param callbackIndex - Parent callback index
 * @param nestedIndex - Nested step index
 * @param startY - Y coordinate for callback area
 * @returns Position object with x,y coordinates
 */
function calculateCallbackNestedPosition(
  callbackIndex: number,
  nestedIndex: number,
  startY: number,
): { x: number; y: number } {
  const HORIZONTAL_SPACING = 300;
  const VERTICAL_SPACING = 100;
  const HORIZONTAL_START = 700;

  return {
    x: HORIZONTAL_START + callbackIndex * HORIZONTAL_SPACING,
    y: startY + (nestedIndex + 1) * VERTICAL_SPACING,
  };
}
