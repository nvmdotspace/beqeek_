/**
 * Canvas Slice - Manages nodes, edges, and zoom state
 * Uses Immer for efficient immutable updates
 */
import type { StateCreator } from 'zustand';
import { produce } from 'immer';
import type { Node, Edge } from '@xyflow/react';
import type { WorkflowEditorShape, CanvasSlice } from './types';

export const initialCanvasState = {
  nodes: [] as Node[],
  edges: [] as Edge[],
  zoom: 1,
};

export const createCanvasSlice: StateCreator<WorkflowEditorShape, [['zustand/devtools', never]], [], CanvasSlice> = (
  set,
  _get,
) => ({
  ...initialCanvasState,

  setNodes: (nodes) => {
    set({ nodes, isDirty: true }, undefined, 'canvas/setNodes');
  },

  setEdges: (edges) => {
    set({ edges, isDirty: true }, undefined, 'canvas/setEdges');
  },

  updateNodeData: (nodeId, data) => {
    set(
      (state) => ({
        nodes: produce(state.nodes, (draft) => {
          const node = draft.find((n) => n.id === nodeId);
          if (node) {
            node.data = { ...node.data, ...data };
          }
        }),
        isDirty: true,
      }),
      undefined,
      'canvas/updateNodeData',
    );
  },

  setZoom: (zoom) => {
    set({ zoom }, undefined, 'canvas/setZoom');
  },
});
