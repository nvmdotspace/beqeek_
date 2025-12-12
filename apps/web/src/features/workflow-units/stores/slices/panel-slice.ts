/**
 * Panel Slice - Manages UI panel visibility states
 */
import type { StateCreator } from 'zustand';
import type { WorkflowEditorShape, PanelSlice } from './types';

export const initialPanelState = {
  isPaletteOpen: false,
  isConfigDrawerOpen: false,
};

export const createPanelSlice: StateCreator<WorkflowEditorShape, [['zustand/devtools', never]], [], PanelSlice> = (
  set,
) => ({
  ...initialPanelState,

  togglePalette: () => {
    set((state) => ({ isPaletteOpen: !state.isPaletteOpen }), undefined, 'panel/togglePalette');
  },

  openConfigDrawer: () => {
    set({ isConfigDrawerOpen: true }, undefined, 'panel/openConfigDrawer');
  },

  closeConfigDrawer: () => {
    set({ isConfigDrawerOpen: false }, undefined, 'panel/closeConfigDrawer');
  },
});
