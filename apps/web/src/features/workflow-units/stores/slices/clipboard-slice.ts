/**
 * Clipboard Slice - Manages copy/paste operations
 * Uses Immer for efficient immutable updates
 */
import type { StateCreator } from 'zustand';
import { produce } from 'immer';
import type { WorkflowEditorShape, ClipboardSlice, ClipboardData } from './types';

export const initialClipboardState = {
  clipboard: null as ClipboardData | null,
};

export const createClipboardSlice: StateCreator<
  WorkflowEditorShape,
  [['zustand/devtools', never]],
  [],
  ClipboardSlice
> = (set, get) => ({
  ...initialClipboardState,

  copySelectedNodes: () => {
    const { nodes, edges, selectedNodeIds } = get();
    const selectedSet = new Set(selectedNodeIds);

    if (selectedSet.size === 0) return;

    const selectedNodes = nodes.filter((n) => selectedSet.has(n.id));
    // Copy edges that connect selected nodes
    const selectedEdges = edges.filter((e) => selectedSet.has(e.source) && selectedSet.has(e.target));

    set(
      {
        clipboard: {
          nodes: selectedNodes,
          edges: selectedEdges,
        },
      },
      undefined,
      'clipboard/copy',
    );
  },

  pasteNodes: (offset = { x: 50, y: 50 }) => {
    const { clipboard, nodes, edges } = get();

    if (!clipboard || clipboard.nodes.length === 0) return;

    const timestamp = Date.now();
    const idMap = new Map<string, string>();

    // Create new nodes with offset positions and new IDs
    const newNodes = clipboard.nodes.map((node, index) => {
      const newId = `${node.type}-${timestamp}-${index}`;
      idMap.set(node.id, newId);

      return {
        ...node,
        id: newId,
        position: {
          x: node.position.x + offset.x,
          y: node.position.y + offset.y,
        },
        selected: true,
        data: {
          ...node.data,
          name: `${node.data?.name || node.type}_copy`,
        },
      };
    });

    // Create new edges with updated node IDs
    const newEdges = clipboard.edges.map((edge, index) => ({
      ...edge,
      id: `edge-${timestamp}-${index}`,
      source: idMap.get(edge.source) || edge.source,
      target: idMap.get(edge.target) || edge.target,
    }));

    // Deselect existing nodes using Immer
    const updatedNodes = produce(nodes, (draft) => {
      draft.forEach((n) => {
        n.selected = false;
      });
    });

    set(
      {
        nodes: [...updatedNodes, ...newNodes],
        edges: [...edges, ...newEdges],
        selectedNodeIds: newNodes.map((n) => n.id),
        isDirty: true,
      },
      undefined,
      'clipboard/paste',
    );
  },
});
