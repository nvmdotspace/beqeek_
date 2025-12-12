/**
 * Editor Mode Slice - Manages visual/yaml mode toggle
 */
import type { StateCreator } from 'zustand';
import type { WorkflowEditorShape, EditorModeSlice, EditorMode } from './types';

export const initialEditorModeState = {
  mode: 'visual' as EditorMode,
};

export const createEditorModeSlice: StateCreator<
  WorkflowEditorShape,
  [['zustand/devtools', never]],
  [],
  EditorModeSlice
> = (set) => ({
  ...initialEditorModeState,

  setMode: (mode) => {
    set({ mode }, undefined, 'editorMode/setMode');
  },
});
