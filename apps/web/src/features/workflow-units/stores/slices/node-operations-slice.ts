/**
 * Node Operations Slice - Manages node add/delete operations
 * Uses Immer for efficient immutable updates
 */
import type { StateCreator } from 'zustand';
import { produce } from 'immer';
import type { Node } from '@xyflow/react';
import type { WorkflowEditorShape, NodeOperationsSlice } from './types';

export const createNodeOperationsSlice: StateCreator<
  WorkflowEditorShape,
  [['zustand/devtools', never]],
  [],
  NodeOperationsSlice
> = (set, get) => ({
  deleteSelectedNodes: () => {
    const { selectedNodeIds, nodes, edges } = get();
    const selectedSet = new Set(selectedNodeIds);

    if (selectedSet.size === 0) return;

    const newNodes = nodes.filter((n) => !selectedSet.has(n.id));
    const newEdges = edges.filter((e) => !selectedSet.has(e.source) && !selectedSet.has(e.target));

    set(
      {
        nodes: newNodes,
        edges: newEdges,
        selectedNodeIds: [],
        isDirty: true,
      },
      undefined,
      'nodeOps/deleteSelected',
    );
  },

  deleteNode: (nodeId: string) => {
    const { nodes, edges, selectedNodeIds, isConfigDrawerOpen } = get();

    const newNodes = nodes.filter((n) => n.id !== nodeId);
    const newEdges = edges.filter((e) => e.source !== nodeId && e.target !== nodeId);

    set(
      {
        nodes: newNodes,
        edges: newEdges,
        selectedNodeIds: selectedNodeIds.filter((id) => id !== nodeId),
        isConfigDrawerOpen: selectedNodeIds.includes(nodeId) ? false : isConfigDrawerOpen,
        isDirty: true,
      },
      undefined,
      'nodeOps/deleteNode',
    );
  },

  addNode: (node: Node) => {
    set(
      (state) => ({
        nodes: produce(state.nodes, (draft) => {
          draft.push(node);
        }),
        isDirty: true,
      }),
      undefined,
      'nodeOps/addNode',
    );
  },
});
