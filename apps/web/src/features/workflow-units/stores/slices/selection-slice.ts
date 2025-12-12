/**
 * Selection Slice - Manages node selection state
 * Uses Immer for efficient immutable updates
 */
import type { StateCreator } from 'zustand';
import { produce } from 'immer';
import type { WorkflowEditorShape, SelectionSlice } from './types';

export const initialSelectionState = {
  selectedNodeIds: [] as string[],
};

export const createSelectionSlice: StateCreator<
  WorkflowEditorShape,
  [['zustand/devtools', never]],
  [],
  SelectionSlice
> = (set, _get) => ({
  ...initialSelectionState,

  setSelectedNodeIds: (selectedNodeIds) => {
    set({ selectedNodeIds }, undefined, 'selection/setSelectedNodeIds');
  },

  selectAllNodes: () => {
    set(
      (state) => ({
        selectedNodeIds: state.nodes.map((n) => n.id),
        nodes: produce(state.nodes, (draft) => {
          draft.forEach((n) => {
            n.selected = true;
          });
        }),
      }),
      undefined,
      'selection/selectAllNodes',
    );
  },

  deselectAllNodes: () => {
    set(
      (state) => ({
        selectedNodeIds: [],
        nodes: produce(state.nodes, (draft) => {
          draft.forEach((n) => {
            n.selected = false;
          });
        }),
      }),
      undefined,
      'selection/deselectAllNodes',
    );
  },
});
