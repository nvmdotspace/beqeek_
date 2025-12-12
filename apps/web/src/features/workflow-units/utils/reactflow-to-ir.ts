/**
 * React Flow to IR Converter - Converts React Flow nodes/edges to Intermediate Representation
 *
 * Flow: React Flow Nodes + Edges → WorkflowIR (topologically sorted)
 *
 * Supports:
 * - Regular flat steps
 * - Compound condition nodes (with then/else branches)
 * - Compound loop nodes (with nested_blocks)
 * - Callback nodes (for delay blocks)
 */

import type { Node, Edge } from '@xyflow/react';
import type { WorkflowIR, StepIR, TriggerIR, CallbackIR } from './yaml-types';
import { topologicalSort, buildDependencyMap, validateUniqueStepIds } from './topological-sort';

/**
 * Check if a node is a callback node (marked by isCallback flag in data)
 */
function isCallbackNode(node: Node): boolean {
  return node.data?.isCallback === true || node.id.startsWith('callback_');
}

/**
 * Check if a node is a nested step within a callback
 */
function isCallbackNestedNode(node: Node): boolean {
  return node.data?.isCallbackStep === true || node.data?.parentCallbackId != null;
}

/**
 * Check if a node is a child of a compound node
 */
function isChildNode(node: Node): boolean {
  return !!node.parentId;
}

/**
 * Extract callback ID from callback node ID
 * e.g., "callback_check_payment" -> "check_payment"
 */
function extractCallbackId(nodeId: string): string {
  if (nodeId.startsWith('callback_')) {
    return nodeId.slice('callback_'.length);
  }
  return nodeId;
}

/**
 * Extract base type from compound node type
 * e.g., "compound_condition" -> "condition"
 */
function extractBaseType(nodeType: string): string {
  if (nodeType.startsWith('compound_')) {
    return nodeType.replace('compound_', '');
  }
  return nodeType;
}

/**
 * Extract step ID from child node ID
 * e.g., "parent_then_step1" -> "step1"
 */
function extractChildStepId(childNodeId: string): string {
  const parts = childNodeId.split('_');
  return parts[parts.length - 1] ?? childNodeId;
}

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
  // Separate nodes by type
  // Top-level nodes (not children of compound nodes, not callbacks)
  const topLevelNodes = nodes.filter((n) => !isCallbackNode(n) && !isCallbackNestedNode(n) && !isChildNode(n));
  const callbackNodes = nodes.filter((n) => isCallbackNode(n) && !isCallbackNestedNode(n));
  const callbackNestedNodes = nodes.filter((n) => isCallbackNestedNode(n));

  // Filter edges for regular workflow (exclude callback, branch, and loop edges)
  const regularEdges = edges.filter(
    (e) => e.type !== 'callback' && e.type !== 'branch' && e.type !== 'loop' && !e.id.includes('callback_'),
  );

  // Build dependency map from regular edges
  const dependencyMap = buildDependencyMapFromEdges(regularEdges);

  // Convert top-level nodes to steps (including compound nodes)
  const steps: StepIR[] = topLevelNodes.map((node) => {
    // Validate node has required fields
    if (!node.type) {
      throw new Error(`Node "${node.id}" is missing required 'type' field`);
    }

    const step: StepIR = {
      id: node.id,
      name: (node.data?.label as string) || node.id,
      type: extractBaseType(node.type), // compound_condition → condition
      config: (node.data?.config as Record<string, unknown>) || {},
      depends_on: dependencyMap.get(node.id),
      position: {
        x: Math.round(node.position.x), // Round to avoid floating point precision issues
        y: Math.round(node.position.y),
      },
    };

    // Handle compound condition nodes - extract branches
    if (node.type === 'compound_condition') {
      const children = nodes.filter((n) => n.parentId === node.id);
      const thenChildren = children.filter((n) => n.id.includes('_then_'));
      const elseChildren = children.filter((n) => n.id.includes('_else_'));

      if (thenChildren.length > 0 || elseChildren.length > 0) {
        step.branches = {};
        if (thenChildren.length > 0) {
          step.branches.then = childrenToSteps(thenChildren, nodes, edges);
        }
        if (elseChildren.length > 0) {
          step.branches.else = childrenToSteps(elseChildren, nodes, edges);
        }
      }
    }

    // Handle compound loop nodes - extract nested blocks
    if (node.type === 'compound_loop') {
      const children = nodes.filter((n) => n.parentId === node.id);
      if (children.length > 0) {
        step.nested_blocks = childrenToSteps(children, nodes, edges);
      }
    }

    return step;
  });

  // Validate step IDs are unique
  validateUniqueStepIds(steps);

  // Build fresh dependency map from steps for topological sort
  const stepDependencyMap = buildDependencyMap(steps);

  // Topologically sort steps (validates no circular dependencies)
  const sortedSteps = topologicalSort(steps, stepDependencyMap);

  // Convert callback nodes to CallbackIR
  const callbacks: CallbackIR[] = callbackNodes.map((callbackNode) => {
    const callbackId = (callbackNode.data?.callbackId as string) || extractCallbackId(callbackNode.id);

    // Find nested steps for this callback
    const nestedNodes = callbackNestedNodes.filter((n) => n.data?.parentCallbackId === callbackId);

    // Convert nested nodes to steps
    const nestedSteps: StepIR[] = nestedNodes.map((nestedNode) => {
      // Extract step ID (remove callback prefix)
      const stepId = nestedNode.id.replace(`callback_${callbackId}_`, '');

      return {
        id: stepId,
        name: (nestedNode.data?.label as string) || stepId,
        type: nestedNode.type || 'log',
        config: (nestedNode.data?.config as Record<string, unknown>) || {},
        position: {
          x: Math.round(nestedNode.position.x),
          y: Math.round(nestedNode.position.y),
        },
      };
    });

    return {
      id: callbackId,
      name: (callbackNode.data?.label as string) || callbackId,
      type: callbackNode.type || 'log',
      config: (callbackNode.data?.config as Record<string, unknown>) || {},
      steps: nestedSteps.length > 0 ? nestedSteps : undefined,
      position: {
        x: Math.round(callbackNode.position.x),
        y: Math.round(callbackNode.position.y),
      },
    };
  });

  const result: WorkflowIR = {
    version: '1.0',
    trigger,
    steps: sortedSteps,
  };

  // Only include callbacks if there are any
  if (callbacks.length > 0) {
    result.callbacks = callbacks;
  }

  return result;
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
 * Convert child nodes of a compound node to StepIR array
 *
 * Handles nested compound nodes recursively.
 * Sorts children by Y position (top to bottom) for consistent ordering.
 *
 * @param children - Array of child nodes belonging to a compound parent
 * @param allNodes - All nodes in the workflow (for finding nested children)
 * @param edges - All edges in the workflow (for internal dependencies)
 * @returns Array of StepIR representing the nested steps
 */
function childrenToSteps(children: Node[], allNodes: Node[], edges: Edge[]): StepIR[] {
  // Sort children by Y position (top to bottom execution order)
  const sortedChildren = [...children].sort((a, b) => a.position.y - b.position.y);

  // Build dependency map for internal edges within this branch
  const internalEdges = edges.filter(
    (e) => children.some((c) => c.id === e.source) && children.some((c) => c.id === e.target),
  );
  const dependencyMap = buildDependencyMapFromEdges(internalEdges);

  return sortedChildren.map((child) => {
    const childStepId = extractChildStepId(child.id);

    const step: StepIR = {
      id: childStepId,
      name: (child.data?.label as string) || childStepId,
      type: extractBaseType(child.type || 'log'),
      config: (child.data?.config as Record<string, unknown>) || {},
      position: {
        x: Math.round(child.position.x),
        y: Math.round(child.position.y),
      },
    };

    // Add internal dependencies if any (convert full IDs to child IDs)
    const deps = dependencyMap.get(child.id);
    if (deps && deps.length > 0) {
      step.depends_on = deps.map(extractChildStepId);
    }

    // Handle nested compound nodes (recursively)
    if (child.type === 'compound_condition') {
      const nestedChildren = allNodes.filter((n) => n.parentId === child.id);
      const thenChildren = nestedChildren.filter((n) => n.id.includes('_then_'));
      const elseChildren = nestedChildren.filter((n) => n.id.includes('_else_'));

      if (thenChildren.length > 0 || elseChildren.length > 0) {
        step.branches = {};
        if (thenChildren.length > 0) {
          step.branches.then = childrenToSteps(thenChildren, allNodes, edges);
        }
        if (elseChildren.length > 0) {
          step.branches.else = childrenToSteps(elseChildren, allNodes, edges);
        }
      }
    }

    if (child.type === 'compound_loop') {
      const nestedChildren = allNodes.filter((n) => n.parentId === child.id);
      if (nestedChildren.length > 0) {
        step.nested_blocks = childrenToSteps(nestedChildren, allNodes, edges);
      }
    }

    return step;
  });
}

/**
 * Extract metadata from nodes (optional future enhancement)
 *
 * @param nodes - Array of React Flow nodes
 * @returns Metadata object with description and tags
 */
export function extractMetadataFromNodes(_nodes: Node[]): WorkflowIR['metadata'] {
  // Future: Extract metadata from special "metadata" node or global config
  return undefined;
}
