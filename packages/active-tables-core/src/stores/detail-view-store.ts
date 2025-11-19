/**
 * Zustand store for record detail view UI state
 * @module active-tables-core/stores/detail-view-store
 */

import { create } from 'zustand';

interface DetailViewState {
  // Inline editing state
  editingRecordId: string | null;
  editingFieldName: string | null;

  // UI toggle state
  showComments: boolean;
  showTimeline: boolean;
  showRelatedRecords: boolean;

  // Actions
  startEdit: (recordId: string, fieldName: string) => void;
  cancelEdit: () => void;
  toggleComments: () => void;
  toggleTimeline: () => void;
  toggleRelatedRecords: () => void;
  setShowComments: (show: boolean) => void;
  setShowTimeline: (show: boolean) => void;
  setShowRelatedRecords: (show: boolean) => void;
}

/**
 * Global store for detail view UI state
 * Manages inline editing state and UI panel visibility
 */
export const useDetailViewStore = create<DetailViewState>((set) => ({
  // Initial state
  editingRecordId: null,
  editingFieldName: null,
  showComments: true,
  showTimeline: true,
  showRelatedRecords: true,

  // Start inline editing for a specific field
  startEdit: (recordId, fieldName) =>
    set({
      editingRecordId: recordId,
      editingFieldName: fieldName,
    }),

  // Cancel inline editing
  cancelEdit: () =>
    set({
      editingRecordId: null,
      editingFieldName: null,
    }),

  // Toggle comments panel visibility
  toggleComments: () =>
    set((state) => ({
      showComments: !state.showComments,
    })),

  // Toggle timeline visibility
  toggleTimeline: () =>
    set((state) => ({
      showTimeline: !state.showTimeline,
    })),

  // Toggle related records visibility
  toggleRelatedRecords: () =>
    set((state) => ({
      showRelatedRecords: !state.showRelatedRecords,
    })),

  // Set comments visibility explicitly
  setShowComments: (show) =>
    set({
      showComments: show,
    }),

  // Set timeline visibility explicitly
  setShowTimeline: (show) =>
    set({
      showTimeline: show,
    }),

  // Set related records visibility explicitly
  setShowRelatedRecords: (show) =>
    set({
      showRelatedRecords: show,
    }),
}));

/**
 * Hook to check if a specific field is being edited
 */
export function useIsFieldEditing(recordId: string, fieldName: string): boolean {
  return useDetailViewStore((state) => state.editingRecordId === recordId && state.editingFieldName === fieldName);
}

/**
 * Hook to get editing state for a record
 */
export function useRecordEditingState(recordId: string) {
  const editingRecordId = useDetailViewStore((state) => state.editingRecordId);
  const editingFieldName = useDetailViewStore((state) => state.editingFieldName);

  return {
    isEditing: editingRecordId === recordId,
    editingFieldName: editingRecordId === recordId ? editingFieldName : null,
  };
}
