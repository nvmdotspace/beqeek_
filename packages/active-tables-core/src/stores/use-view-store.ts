/**
 * View Store - Manages view mode and active screens
 *
 * Handles switching between different views (list, kanban, gantt, etc.)
 * and tracking active screen IDs
 */

import { create } from 'zustand';

// ============================================
// Types
// ============================================

export type ViewMode = 'list' | 'card' | 'table' | 'kanban' | 'gantt' | 'calendar';

export interface ViewState {
  // Current view mode
  viewMode: ViewMode;

  // Active kanban screen ID (if in kanban mode)
  activeKanbanScreenId?: string;

  // Active gantt screen ID (if in gantt mode)
  activeGanttScreenId?: string;

  // Actions
  setViewMode: (mode: ViewMode) => void;
  setActiveKanbanScreenId: (id: string | undefined) => void;
  setActiveGanttScreenId: (id: string | undefined) => void;
  reset: () => void;
}

// ============================================
// Initial State
// ============================================

const initialState = {
  viewMode: 'list' as ViewMode,
  activeKanbanScreenId: undefined,
  activeGanttScreenId: undefined,
};

// ============================================
// Store
// ============================================

/**
 * View store - manages current view mode and active screens
 *
 * @example
 * ```tsx
 * const { viewMode, setViewMode } = useViewStore();
 *
 * // Switch to kanban view
 * setViewMode('kanban');
 *
 * // Set active kanban screen
 * setActiveKanbanScreenId('screen-1');
 * ```
 */
export const useViewStore = create<ViewState>((set) => ({
  ...initialState,

  setViewMode: (mode) => set({ viewMode: mode }),

  setActiveKanbanScreenId: (id) => set({ activeKanbanScreenId: id }),

  setActiveGanttScreenId: (id) => set({ activeGanttScreenId: id }),

  reset: () => set(initialState),
}));
