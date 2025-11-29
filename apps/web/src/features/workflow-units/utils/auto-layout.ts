/**
 * Auto-Layout Utility with Dagre
 *
 * Automatically arranges workflow nodes using the Dagre graph layout algorithm.
 * Provides hierarchical layout with configurable spacing.
 *
 * Supports:
 * - Top-level nodes via Dagre algorithm
 * - Compound nodes (conditions, loops) with child positioning
 * - Overlap prevention
 */

import dagre from 'dagre';
import type { Node, Edge } from '@xyflow/react';
import { applyDagreLayout, shouldApplyLayout } from './dagre-layout';
import { applyCompoundLayout } from './branch-layout';

interface LayoutOptions {
  direction?: 'LR' | 'TB' | 'RL' | 'BT'; // Left-Right, Top-Bottom, Right-Left, Bottom-Top
  nodeWidth?: number;
  nodeHeight?: number;
  horizontalSpacing?: number;
  verticalSpacing?: number;
}

const DEFAULT_OPTIONS: Required<LayoutOptions> = {
  direction: 'LR',
  nodeWidth: 180,
  nodeHeight: 80,
  horizontalSpacing: 120,
  verticalSpacing: 80,
};

/**
 * Automatically arranges nodes using Dagre graph layout algorithm
 *
 * @param nodes - Array of React Flow nodes
 * @param edges - Array of React Flow edges
 * @param options - Layout configuration options
 * @returns Array of nodes with updated positions
 */
export function autoLayoutNodes(nodes: Node[], edges: Edge[], options: LayoutOptions = {}): Node[] {
  if (nodes.length === 0) {
    return nodes;
  }

  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Create new Dagre graph
  const graph = new dagre.graphlib.Graph();

  // Configure graph layout
  graph.setGraph({
    rankdir: opts.direction,
    nodesep: opts.verticalSpacing,
    ranksep: opts.horizontalSpacing,
    edgesep: 40,
    marginx: 20,
    marginy: 20,
  });

  // Set default edge label
  graph.setDefaultEdgeLabel(() => ({}));

  // Add nodes to graph
  nodes.forEach((node) => {
    graph.setNode(node.id, {
      width: node.measured?.width || opts.nodeWidth,
      height: node.measured?.height || opts.nodeHeight,
    });
  });

  // Add edges to graph
  edges.forEach((edge) => {
    graph.setEdge(edge.source, edge.target);
  });

  // Run Dagre layout algorithm
  dagre.layout(graph);

  // Update node positions based on layout
  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = graph.node(node.id);

    // Dagre returns center position, convert to top-left
    const x = nodeWithPosition.x - (nodeWithPosition.width || opts.nodeWidth) / 2;
    const y = nodeWithPosition.y - (nodeWithPosition.height || opts.nodeHeight) / 2;

    return {
      ...node,
      position: { x, y },
    };
  });

  return layoutedNodes;
}

/**
 * Aligns selected nodes horizontally
 *
 * @param nodes - Array of React Flow nodes
 * @param alignment - Horizontal alignment type
 * @returns Array of nodes with updated positions
 */
export function alignNodesHorizontal(nodes: Node[], alignment: 'left' | 'center' | 'right'): Node[] {
  const selectedNodes = nodes.filter((n) => n.selected);

  if (selectedNodes.length < 2) {
    return nodes;
  }

  // Calculate bounds
  const minX = Math.min(...selectedNodes.map((n) => n.position.x));
  const maxX = Math.max(...selectedNodes.map((n) => n.position.x + (n.measured?.width || 180)));
  const centerX = (minX + maxX) / 2;

  // Update positions
  return nodes.map((node) => {
    if (!node.selected) return node;

    let newX = node.position.x;

    switch (alignment) {
      case 'left':
        newX = minX;
        break;
      case 'center':
        newX = centerX - (node.measured?.width || 180) / 2;
        break;
      case 'right':
        newX = maxX - (node.measured?.width || 180);
        break;
    }

    return {
      ...node,
      position: { ...node.position, x: newX },
    };
  });
}

/**
 * Aligns selected nodes vertically
 *
 * @param nodes - Array of React Flow nodes
 * @param alignment - Vertical alignment type
 * @returns Array of nodes with updated positions
 */
export function alignNodesVertical(nodes: Node[], alignment: 'top' | 'middle' | 'bottom'): Node[] {
  const selectedNodes = nodes.filter((n) => n.selected);

  if (selectedNodes.length < 2) {
    return nodes;
  }

  // Calculate bounds
  const minY = Math.min(...selectedNodes.map((n) => n.position.y));
  const maxY = Math.max(...selectedNodes.map((n) => n.position.y + (n.measured?.height || 80)));
  const middleY = (minY + maxY) / 2;

  // Update positions
  return nodes.map((node) => {
    if (!node.selected) return node;

    let newY = node.position.y;

    switch (alignment) {
      case 'top':
        newY = minY;
        break;
      case 'middle':
        newY = middleY - (node.measured?.height || 80) / 2;
        break;
      case 'bottom':
        newY = maxY - (node.measured?.height || 80);
        break;
    }

    return {
      ...node,
      position: { ...node.position, y: newY },
    };
  });
}

/**
 * Distributes selected nodes evenly horizontally
 *
 * @param nodes - Array of React Flow nodes
 * @returns Array of nodes with updated positions
 */
export function distributeNodesHorizontal(nodes: Node[]): Node[] {
  const selectedNodes = nodes.filter((n) => n.selected);

  if (selectedNodes.length < 3) {
    return nodes;
  }

  // Sort by x position
  const sorted = [...selectedNodes].sort((a, b) => a.position.x - b.position.x);

  // Calculate total width and spacing
  const minX = sorted[0]!.position.x;
  const maxX = sorted[sorted.length - 1]!.position.x + (sorted[sorted.length - 1]!.measured?.width || 180);
  const totalWidth = maxX - minX;
  const spacing = totalWidth / (sorted.length - 1);

  // Update positions
  const updatedMap = new Map<string, number>();
  sorted.forEach((node, index) => {
    updatedMap.set(node.id, minX + spacing * index);
  });

  return nodes.map((node) => {
    const newX = updatedMap.get(node.id);
    if (newX === undefined) return node;

    return {
      ...node,
      position: { ...node.position, x: newX },
    };
  });
}

/**
 * Distributes selected nodes evenly vertically
 *
 * @param nodes - Array of React Flow nodes
 * @returns Array of nodes with updated positions
 */
export function distributeNodesVertical(nodes: Node[]): Node[] {
  const selectedNodes = nodes.filter((n) => n.selected);

  if (selectedNodes.length < 3) {
    return nodes;
  }

  // Sort by y position
  const sorted = [...selectedNodes].sort((a, b) => a.position.y - b.position.y);

  // Calculate total height and spacing
  const minY = sorted[0]!.position.y;
  const maxY = sorted[sorted.length - 1]!.position.y + (sorted[sorted.length - 1]!.measured?.height || 80);
  const totalHeight = maxY - minY;
  const spacing = totalHeight / (sorted.length - 1);

  // Update positions
  const updatedMap = new Map<string, number>();
  sorted.forEach((node, index) => {
    updatedMap.set(node.id, minY + spacing * index);
  });

  return nodes.map((node) => {
    const newY = updatedMap.get(node.id);
    if (newY === undefined) return node;

    return {
      ...node,
      position: { ...node.position, y: newY },
    };
  });
}

/**
 * Complete auto-layout for workflows with compound nodes
 *
 * Steps:
 * 1. Position children within compound nodes (branches, loops)
 * 2. Apply Dagre layout to top-level nodes
 * 3. Prevent overlaps between nodes
 *
 * @param nodes - All workflow nodes
 * @param edges - All workflow edges
 * @returns Nodes with updated positions
 *
 * @example
 * ```typescript
 * const handleAutoLayout = () => {
 *   const layoutedNodes = autoLayout(nodes, edges);
 *   setNodes(layoutedNodes);
 * };
 * ```
 */
export function autoLayout(nodes: Node[], edges: Edge[]): Node[] {
  if (nodes.length === 0) {
    return nodes;
  }

  // Step 1: Position children within compound nodes
  let layoutedNodes = applyCompoundLayout(nodes);

  // Step 2: Apply Dagre to top-level nodes
  layoutedNodes = applyDagreLayout(layoutedNodes, edges, {
    direction: 'TB', // Top-to-bottom for workflow clarity
    nodeSpacing: 60,
    rankSpacing: 120,
  });

  // Step 3: Prevent overlaps
  layoutedNodes = preventOverlaps(layoutedNodes);

  return layoutedNodes;
}

/**
 * Detect and fix node overlaps
 *
 * Compares all top-level nodes and pushes overlapping nodes down.
 */
function preventOverlaps(nodes: Node[]): Node[] {
  const topLevelNodes = nodes.filter((n) => !n.parentId);
  const childNodes = nodes.filter((n) => n.parentId);

  // Simple collision detection and resolution
  for (let i = 0; i < topLevelNodes.length; i++) {
    const node = topLevelNodes[i];
    if (!node) continue;

    for (let j = i + 1; j < topLevelNodes.length; j++) {
      const otherNode = topLevelNodes[j];
      if (!otherNode) continue;

      if (nodesOverlap(node, otherNode)) {
        // Push the later node down
        otherNode.position = {
          ...otherNode.position,
          y: otherNode.position.y + 120,
        };
      }
    }
  }

  return [...topLevelNodes, ...childNodes];
}

/**
 * Check if two nodes overlap
 */
function nodesOverlap(a: Node, b: Node): boolean {
  const aWidth = a.measured?.width ?? a.width ?? 200;
  const aHeight = a.measured?.height ?? a.height ?? 100;
  const bWidth = b.measured?.width ?? b.width ?? 200;
  const bHeight = b.measured?.height ?? b.height ?? 100;

  const padding = 20; // Minimum gap between nodes

  return !(
    a.position.x + Number(aWidth) + padding < b.position.x ||
    b.position.x + Number(bWidth) + padding < a.position.x ||
    a.position.y + Number(aHeight) + padding < b.position.y ||
    b.position.y + Number(bHeight) + padding < a.position.y
  );
}

/**
 * Check if nodes need auto-layout
 *
 * Returns true if nodes don't have meaningful positions.
 */
export { shouldApplyLayout };
