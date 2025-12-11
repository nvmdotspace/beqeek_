/**
 * Candidate Node Slice - Manages ghost node preview during drag
 * Inspired by Dify's candidate node pattern for better UX
 */
import type { StateCreator } from 'zustand';
import { produce } from 'immer';
import type { Node } from '@xyflow/react';
import type { WorkflowEditorShape, CandidateNodeSlice } from './types';

export const initialCandidateNodeState = {
  candidateNode: null as Node | null,
  mousePosition: { pageX: 0, pageY: 0, elementX: 0, elementY: 0 },
};

export const createCandidateNodeSlice: StateCreator<
  WorkflowEditorShape,
  [['zustand/devtools', never]],
  [],
  CandidateNodeSlice
> = (set, get) => ({
  ...initialCandidateNodeState,

  setCandidateNode: (node) => {
    set({ candidateNode: node }, undefined, 'candidate/setNode');
  },

  setMousePosition: (position) => {
    set({ mousePosition: position }, undefined, 'candidate/setMousePosition');
  },

  placeCandidateNode: (position) => {
    const { candidateNode, nodes } = get();

    if (!candidateNode) return;

    // Create the actual node from candidate
    const newNode: Node = {
      ...candidateNode,
      position,
      data: {
        ...candidateNode.data,
        _isCandidate: false,
      },
    };

    set(
      {
        nodes: produce(nodes, (draft) => {
          draft.push(newNode);
        }),
        candidateNode: null,
        isDirty: true,
      },
      undefined,
      'candidate/placeNode',
    );
  },

  cancelCandidateNode: () => {
    set({ candidateNode: null }, undefined, 'candidate/cancel');
  },
});
