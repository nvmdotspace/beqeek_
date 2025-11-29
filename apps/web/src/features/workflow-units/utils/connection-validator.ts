import type { Connection, Node, Edge } from '@xyflow/react';

/**
 * Detects cycles in the graph using Depth-First Search
 * @param nodeId - Starting node ID
 * @param visited - Set of visited nodes
 * @param recursionStack - Set of nodes in current DFS path
 * @param adjacencyList - Map of node ID to connected node IDs
 * @returns true if cycle detected, false otherwise
 */
const hasCycleDFS = (
  nodeId: string,
  visited: Set<string>,
  recursionStack: Set<string>,
  adjacencyList: Map<string, string[]>,
): boolean => {
  visited.add(nodeId);
  recursionStack.add(nodeId);

  const neighbors = adjacencyList.get(nodeId) || [];
  for (const neighbor of neighbors) {
    if (!visited.has(neighbor)) {
      if (hasCycleDFS(neighbor, visited, recursionStack, adjacencyList)) {
        return true;
      }
    } else if (recursionStack.has(neighbor)) {
      // Found a back edge (cycle)
      return true;
    }
  }

  recursionStack.delete(nodeId);
  return false;
};

/**
 * Validates connections between workflow nodes
 * Enforces workflow rules and prevents invalid connections
 */
export const isValidConnection = (connection: Connection, nodes: Node[], edges: Edge[] = []): boolean => {
  if (!connection.source || !connection.target) return false;

  const sourceNode = nodes.find((n) => n.id === connection.source);
  const targetNode = nodes.find((n) => n.id === connection.target);

  if (!sourceNode || !targetNode) return false;

  // Rule 1: Cannot connect node to itself
  if (connection.source === connection.target) {
    return false;
  }

  // Rule 2: Trigger nodes cannot have inputs (must be first)
  if (targetNode.type?.startsWith('trigger_')) {
    return false;
  }

  // Rule 3: Prevent connecting to same branch twice for compound_condition nodes
  if (sourceNode.type === 'compound_condition') {
    const sourceHandle = connection.sourceHandle;
    if (sourceHandle === 'then' || sourceHandle === 'else') {
      const existingBranchEdge = edges.find((e) => e.source === connection.source && e.sourceHandle === sourceHandle);

      if (existingBranchEdge) {
        console.warn(`Branch "${sourceHandle}" already connected`);
        return false;
      }
    }
  }

  // Rule 4: Prevent connecting child node to a different parent
  if (targetNode.parentId && targetNode.parentId !== sourceNode.id) {
    // Target is a child of a compound node, but source is not its parent
    console.warn('Cannot connect child to different parent');
    return false;
  }

  // Rule 5: Prevent circular dependencies using DFS
  // Build adjacency list from existing edges + new connection
  const adjacencyList = new Map<string, string[]>();

  // Initialize adjacency list for all nodes
  nodes.forEach((node) => {
    adjacencyList.set(node.id, []);
  });

  // Add existing edges
  edges.forEach((edge) => {
    if (edge.source && edge.target) {
      const neighbors = adjacencyList.get(edge.source) || [];
      neighbors.push(edge.target);
      adjacencyList.set(edge.source, neighbors);
    }
  });

  // Add the new connection temporarily
  const newNeighbors = adjacencyList.get(connection.source) || [];
  newNeighbors.push(connection.target);
  adjacencyList.set(connection.source, newNeighbors);

  // Check for cycles using DFS
  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  for (const node of nodes) {
    if (!visited.has(node.id)) {
      if (hasCycleDFS(node.id, visited, recursionStack, adjacencyList)) {
        return false; // Cycle detected
      }
    }
  }

  return true;
};
