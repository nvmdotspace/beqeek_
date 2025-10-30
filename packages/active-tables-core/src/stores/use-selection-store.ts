/**
 * Selection Store - Manages selected records
 *
 * Handles multi-select state for bulk operations
 */

import { create } from 'zustand';

// ============================================
// Types
// ============================================

export interface SelectionState {
  // Selected record IDs
  selectedIds: Set<string>;

  // Select all mode (if true, all records are selected except deselected ones)
  selectAllMode: boolean;

  // Deselected IDs (when selectAllMode is true)
  deselectedIds: Set<string>;

  // Actions
  selectRecord: (id: string) => void;
  deselectRecord: (id: string) => void;
  toggleRecord: (id: string) => void;
  selectAll: () => void;
  deselectAll: () => void;
  isSelected: (id: string) => boolean;
  getSelectedCount: () => number;
  reset: () => void;
}

// ============================================
// Initial State
// ============================================

const initialState = {
  selectedIds: new Set<string>(),
  selectAllMode: false,
  deselectedIds: new Set<string>(),
};

// ============================================
// Store
// ============================================

/**
 * Selection store - manages selected records for bulk operations
 *
 * @example
 * ```tsx
 * const { selectedIds, selectRecord, deselectAll, isSelected } = useSelectionStore();
 *
 * // Select a record
 * selectRecord('record-1');
 *
 * // Check if selected
 * const selected = isSelected('record-1');
 *
 * // Clear selection
 * deselectAll();
 *
 * // Select all
 * selectAll();
 * ```
 */
export const useSelectionStore = create<SelectionState>((set, get) => ({
  ...initialState,

  selectRecord: (id) =>
    set((state) => {
      if (state.selectAllMode) {
        // In select-all mode, remove from deselected
        const deselectedIds = new Set(state.deselectedIds);
        deselectedIds.delete(id);
        return { deselectedIds };
      } else {
        // Normal mode, add to selected
        const selectedIds = new Set(state.selectedIds);
        selectedIds.add(id);
        return { selectedIds };
      }
    }),

  deselectRecord: (id) =>
    set((state) => {
      if (state.selectAllMode) {
        // In select-all mode, add to deselected
        const deselectedIds = new Set(state.deselectedIds);
        deselectedIds.add(id);
        return { deselectedIds };
      } else {
        // Normal mode, remove from selected
        const selectedIds = new Set(state.selectedIds);
        selectedIds.delete(id);
        return { selectedIds };
      }
    }),

  toggleRecord: (id) => {
    const isSelected = get().isSelected(id);
    if (isSelected) {
      get().deselectRecord(id);
    } else {
      get().selectRecord(id);
    }
  },

  selectAll: () =>
    set({
      selectAllMode: true,
      selectedIds: new Set(),
      deselectedIds: new Set(),
    }),

  deselectAll: () =>
    set({
      selectAllMode: false,
      selectedIds: new Set(),
      deselectedIds: new Set(),
    }),

  isSelected: (id) => {
    const state = get();
    if (state.selectAllMode) {
      return !state.deselectedIds.has(id);
    } else {
      return state.selectedIds.has(id);
    }
  },

  getSelectedCount: () => {
    const state = get();
    if (state.selectAllMode) {
      // Would need total count to compute this properly
      return -1; // Indicates "all selected"
    } else {
      return state.selectedIds.size;
    }
  },

  reset: () => set(initialState),
}));
