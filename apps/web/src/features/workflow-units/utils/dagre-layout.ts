/**
 * Dagre Layout Utility
 *
 * Applies hierarchical graph layout using Dagre library.
 * Positions top-level nodes in a clean workflow layout.
 *
 * Only applies to top-level nodes - child nodes (branches, loops)
 * are positioned by branch-layout.ts
 */

import dagre from 'dagre';
import type { Node, Edge } from '@xyflow/react';

/**
 * Layout direction options
 */
export type LayoutDirection = 'TB' | 'LR' | 'BT' | 'RL';

/**
 * Configuration options for Dagre layout
 */
export interface DagreLayoutOptions {
  /** Layout direction: TB (top-bottom), LR (left-right), etc. */
  direction?: LayoutDirection;
  /** Horizontal spacing between nodes in same rank */
  nodeSpacing?: number;
  /** Vertical spacing between ranks */
  rankSpacing?: number;
  /** Minimum spacing between edges */
  edgeSpacing?: number;
  /** Margin around the entire graph */
  marginX?: number;
  marginY?: number;
}

const DEFAULT_OPTIONS: Required<DagreLayoutOptions> = {
  direction: 'TB',
  nodeSpacing: 50,
  rankSpacing: 100,
  edgeSpacing: 10,
  marginX: 50,
  marginY: 50,
};

/** Default node dimensions for layout calculation */
const DEFAULT_NODE_WIDTH = 200;
const DEFAULT_NODE_HEIGHT = 60;

/** Larger dimensions for compound nodes */
const COMPOUND_NODE_WIDTH = 320;
const COMPOUND_NODE_HEIGHT = 200;

/**
 * Get node dimensions based on type
 */
function getNodeDimensions(node: Node): { width: number; height: number } {
  // Check if node has explicit dimensions
  const width = node.measured?.width ?? node.width;
  const height = node.measured?.height ?? node.height;

  if (width && height) {
    return { width: Number(width), height: Number(height) };
  }

  // Use larger dimensions for compound nodes
  if (node.type === 'compound_condition' || node.type === 'compound_loop') {
    return { width: COMPOUND_NODE_WIDTH, height: COMPOUND_NODE_HEIGHT };
  }

  return { width: DEFAULT_NODE_WIDTH, height: DEFAULT_NODE_HEIGHT };
}

/**
 * Apply Dagre layout to nodes and edges
 *
 * Only positions top-level nodes (nodes without parentId).
 * Child nodes are handled separately by branch-layout.
 *
 * @param nodes - All React Flow nodes
 * @param edges - All React Flow edges
 * @param options - Layout configuration options
 * @returns New array of nodes with updated positions
 *
 * @example
 * ```typescript
 * const layoutedNodes = applyDagreLayout(nodes, edges, {
 *   direction: 'TB',
 *   nodeSpacing: 60,
 *   rankSpacing: 120,
 * });
 * setNodes(layoutedNodes);
 * ```
 */
export function applyDagreLayout(nodes: Node[], edges: Edge[], options: DagreLayoutOptions = {}): Node[] {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Create Dagre graph
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({
    rankdir: opts.direction,
    nodesep: opts.nodeSpacing,
    ranksep: opts.rankSpacing,
    edgesep: opts.edgeSpacing,
    marginx: opts.marginX,
    marginy: opts.marginY,
  });

  // Filter to top-level nodes only (exclude children of compound nodes)
  const topLevelNodes = nodes.filter((n) => !n.parentId);
  const topLevelNodeIds = new Set(topLevelNodes.map((n) => n.id));

  // Add nodes to Dagre graph
  topLevelNodes.forEach((node) => {
    const { width, height } = getNodeDimensions(node);
    g.setNode(node.id, { width, height });
  });

  // Add edges between top-level nodes only
  // Skip internal branch/loop edges
  edges.forEach((edge) => {
    if (
      topLevelNodeIds.has(edge.source) &&
      topLevelNodeIds.has(edge.target) &&
      edge.type !== 'loop' &&
      edge.type !== 'branch' &&
      !edge.id.includes('loop-repeat') // Skip loop-back edges
    ) {
      g.setEdge(edge.source, edge.target);
    }
  });

  // Run Dagre layout algorithm
  dagre.layout(g);

  // Apply calculated positions to nodes
  const layoutedNodes = nodes.map((node) => {
    // Only update positions for top-level nodes
    if (node.parentId) {
      return node;
    }

    const nodeWithPosition = g.node(node.id);
    if (!nodeWithPosition) {
      return node;
    }

    const { width, height } = getNodeDimensions(node);

    return {
      ...node,
      position: {
        // Dagre returns center position, convert to top-left
        x: nodeWithPosition.x - width / 2,
        y: nodeWithPosition.y - height / 2,
      },
    };
  });

  return layoutedNodes;
}

/**
 * Check if layout should be applied
 *
 * Returns true if nodes don't have meaningful positions yet.
 */
export function shouldApplyLayout(nodes: Node[]): boolean {
  // Check if any top-level node has non-zero position
  const topLevelNodes = nodes.filter((n) => !n.parentId);

  if (topLevelNodes.length === 0) {
    return false;
  }

  // If all nodes are at (0,0) or very close, we need layout
  const hasPositions = topLevelNodes.some(
    (n) => n.position && (Math.abs(n.position.x) > 10 || Math.abs(n.position.y) > 10),
  );

  return !hasPositions;
}

/**
 * Get Dagre graph info for debugging
 */
export function getLayoutInfo(
  nodes: Node[],
  edges: Edge[],
): {
  nodeCount: number;
  edgeCount: number;
  topLevelCount: number;
  childCount: number;
} {
  const topLevelNodes = nodes.filter((n) => !n.parentId);
  const childNodes = nodes.filter((n) => n.parentId);
  const topLevelEdges = edges.filter(
    (e) => topLevelNodes.some((n) => n.id === e.source) && topLevelNodes.some((n) => n.id === e.target),
  );

  return {
    nodeCount: nodes.length,
    edgeCount: topLevelEdges.length,
    topLevelCount: topLevelNodes.length,
    childCount: childNodes.length,
  };
}
