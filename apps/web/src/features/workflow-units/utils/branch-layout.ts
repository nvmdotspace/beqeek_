/**
 * Branch Layout Algorithm
 *
 * Positions child nodes within compound nodes (conditions, loops).
 *
 * Layout patterns:
 *
 * Condition (then/else branches side by side):
 * ┌────────────────────────────┐
 * │  IF condition              │
 * ├─────────────┬──────────────┤
 * │ THEN        │  ELSE        │
 * │ - Child1    │  - Child1    │
 * │ - Child2    │  - Child2    │
 * └─────────────┴──────────────┘
 *
 * Loop (children stacked vertically):
 * ┌────────────────────────────┐
 * │  FOR EACH item             │
 * ├────────────────────────────┤
 * │ - Child1                   │
 * │ - Child2                   │
 * │ - Child3                   │
 * └────────────────────────────┘
 */

import type { Node } from '@xyflow/react';

/**
 * Configuration for branch layout
 */
export interface BranchLayoutConfig {
  /** Minimum parent width */
  minParentWidth: number;
  /** Minimum parent height */
  minParentHeight: number;
  /** Height of parent header (title, controls) */
  headerHeight: number;
  /** Vertical spacing between child nodes */
  childSpacing: number;
  /** Horizontal gap between then/else columns */
  branchGap: number;
  /** Padding inside parent */
  padding: number;
  /** Child node height estimate */
  childHeight: number;
  /** Child node width */
  childWidth: number;
}

const DEFAULT_CONFIG: BranchLayoutConfig = {
  minParentWidth: 320,
  minParentHeight: 200,
  headerHeight: 80,
  childSpacing: 70,
  branchGap: 20,
  padding: 15,
  childHeight: 50,
  childWidth: 130,
};

/**
 * Result of layout calculation
 */
export interface LayoutResult {
  /** Positioned child nodes */
  nodes: Node[];
  /** Calculated parent dimensions */
  parentSize: { width: number; height: number };
}

/**
 * Position branch children (then/else) within a condition node
 *
 * Layout: Two columns side by side
 *
 * @param parentNode - The compound_condition parent node
 * @param thenChildren - Nodes for the "then" branch
 * @param elseChildren - Nodes for the "else" branch
 * @param config - Layout configuration
 * @returns Positioned nodes and calculated parent size
 */
export function layoutBranchChildren(
  parentNode: Node,
  thenChildren: Node[],
  elseChildren: Node[],
  config: Partial<BranchLayoutConfig> = {},
): LayoutResult {
  const cfg = { ...DEFAULT_CONFIG, ...config };

  // Calculate required dimensions
  const maxChildCount = Math.max(thenChildren.length, elseChildren.length, 1);
  const requiredHeight = Math.max(
    cfg.minParentHeight,
    cfg.headerHeight + maxChildCount * cfg.childSpacing + cfg.padding * 2,
  );

  // Each branch gets half the width (minus gap and padding)
  const branchWidth = cfg.childWidth;
  const totalWidth = Math.max(cfg.minParentWidth, branchWidth * 2 + cfg.branchGap + cfg.padding * 2);

  // Position THEN children (left column)
  const positionedThenChildren = thenChildren.map((child, index) => ({
    ...child,
    position: {
      x: cfg.padding,
      y: cfg.headerHeight + index * cfg.childSpacing,
    },
    parentId: parentNode.id,
    extent: 'parent' as const,
    expandParent: true,
    draggable: true,
  }));

  // Position ELSE children (right column)
  const positionedElseChildren = elseChildren.map((child, index) => ({
    ...child,
    position: {
      x: cfg.padding + branchWidth + cfg.branchGap,
      y: cfg.headerHeight + index * cfg.childSpacing,
    },
    parentId: parentNode.id,
    extent: 'parent' as const,
    expandParent: true,
    draggable: true,
  }));

  return {
    nodes: [...positionedThenChildren, ...positionedElseChildren],
    parentSize: {
      width: totalWidth,
      height: requiredHeight,
    },
  };
}

/**
 * Position loop children within a loop node
 *
 * Layout: Single column, vertically stacked
 *
 * @param parentNode - The compound_loop parent node
 * @param children - Child nodes to position
 * @param config - Layout configuration
 * @returns Positioned nodes and calculated parent size
 */
export function layoutLoopChildren(
  parentNode: Node,
  children: Node[],
  config: Partial<BranchLayoutConfig> = {},
): LayoutResult {
  const cfg = { ...DEFAULT_CONFIG, ...config };

  // Calculate required dimensions
  const childCount = Math.max(children.length, 1);
  const requiredHeight = Math.max(
    cfg.minParentHeight,
    cfg.headerHeight + childCount * cfg.childSpacing + cfg.padding * 2,
  );

  // Loop nodes are narrower (single column)
  const loopWidth = Math.max(cfg.minParentWidth - 40, cfg.childWidth + cfg.padding * 2);

  // Position children vertically centered
  const positionedChildren = children.map((child, index) => ({
    ...child,
    position: {
      x: cfg.padding + 10, // Slight indent for visual hierarchy
      y: cfg.headerHeight + index * cfg.childSpacing,
    },
    parentId: parentNode.id,
    extent: 'parent' as const,
    expandParent: true,
    draggable: true,
  }));

  return {
    nodes: positionedChildren,
    parentSize: {
      width: loopWidth,
      height: requiredHeight,
    },
  };
}

/**
 * Apply layout to all compound nodes and their children
 *
 * Processes compound_condition and compound_loop nodes,
 * positioning their children and calculating parent sizes.
 *
 * @param nodes - All nodes in the workflow
 * @param config - Optional layout configuration
 * @returns Nodes with updated positions and parent sizes
 */
export function applyCompoundLayout(nodes: Node[], config: Partial<BranchLayoutConfig> = {}): Node[] {
  const _nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const updatedNodes: Node[] = [];
  const processedChildIds = new Set<string>();

  // First pass: process compound nodes and their children
  nodes.forEach((node) => {
    if (node.type === 'compound_condition') {
      // Find children of this condition node
      const children = nodes.filter((n) => n.parentId === node.id);
      const thenChildren = children.filter((n) => n.id.includes('_then_'));
      const elseChildren = children.filter((n) => n.id.includes('_else_'));

      // Calculate layout
      const { nodes: layoutedChildren, parentSize } = layoutBranchChildren(node, thenChildren, elseChildren, config);

      // Update parent node with calculated size
      updatedNodes.push({
        ...node,
        style: {
          ...node.style,
          width: parentSize.width,
          height: parentSize.height,
        },
      });

      // Add positioned children
      layoutedChildren.forEach((child) => {
        updatedNodes.push(child);
        processedChildIds.add(child.id);
      });
    } else if (node.type === 'compound_loop') {
      // Find children of this loop node
      const children = nodes.filter((n) => n.parentId === node.id);

      // Calculate layout
      const { nodes: layoutedChildren, parentSize } = layoutLoopChildren(node, children, config);

      // Update parent node with calculated size
      updatedNodes.push({
        ...node,
        style: {
          ...node.style,
          width: parentSize.width,
          height: parentSize.height,
        },
      });

      // Add positioned children
      layoutedChildren.forEach((child) => {
        updatedNodes.push(child);
        processedChildIds.add(child.id);
      });
    } else if (!node.parentId) {
      // Keep top-level non-compound nodes as-is
      updatedNodes.push(node);
    }
    // Child nodes are handled above, skip them here
  });

  // Add any remaining child nodes that weren't processed
  // (shouldn't happen in normal use, but safety check)
  nodes.forEach((node) => {
    if (node.parentId && !processedChildIds.has(node.id)) {
      updatedNodes.push(node);
    }
  });

  return updatedNodes;
}

/**
 * Calculate minimum size for a compound node based on children
 */
export function calculateCompoundNodeSize(
  nodeType: 'compound_condition' | 'compound_loop',
  childCount: number,
  config: Partial<BranchLayoutConfig> = {},
): { width: number; height: number } {
  const cfg = { ...DEFAULT_CONFIG, ...config };

  if (nodeType === 'compound_condition') {
    // Condition: side-by-side branches
    const height = cfg.headerHeight + Math.ceil(childCount / 2) * cfg.childSpacing + cfg.padding * 2;
    return {
      width: cfg.minParentWidth,
      height: Math.max(cfg.minParentHeight, height),
    };
  } else {
    // Loop: vertical stack
    const height = cfg.headerHeight + childCount * cfg.childSpacing + cfg.padding * 2;
    return {
      width: cfg.minParentWidth - 40,
      height: Math.max(cfg.minParentHeight, height),
    };
  }
}
