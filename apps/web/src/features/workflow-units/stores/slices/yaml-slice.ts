/**
 * YAML Slice - Manages YAML editor state
 */
import type { StateCreator } from 'zustand';
import type { WorkflowEditorShape, YamlSlice } from './types';

export const initialYamlState = {
  yamlContent: '',
  yamlError: null as string | null,
};

export const createYamlSlice: StateCreator<WorkflowEditorShape, [['zustand/devtools', never]], [], YamlSlice> = (
  set,
) => ({
  ...initialYamlState,

  setYamlContent: (yamlContent) => {
    set({ yamlContent, isDirty: true }, undefined, 'yaml/setContent');
  },

  setYamlError: (yamlError) => {
    set({ yamlError }, undefined, 'yaml/setError');
  },
});
