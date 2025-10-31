/**
 * Filter Store - Manages filters, search, and sort
 *
 * Handles all filtering, searching, and sorting state for records
 */

import { create } from 'zustand';

// ============================================
// Types
// ============================================

export interface FilterValue {
  fieldName: string;
  operator: 'equals' | 'contains' | 'greaterThan' | 'lessThan' | 'between' | 'in';
  value: unknown;
}

export interface SortConfig {
  fieldName: string;
  direction: 'asc' | 'desc';
}

export interface FilterState {
  // Active filters
  filters: FilterValue[];

  // Search query
  searchQuery: string;

  // Sort configuration
  sort: SortConfig | null;

  // Actions
  addFilter: (filter: FilterValue) => void;
  removeFilter: (fieldName: string) => void;
  clearFilters: () => void;
  setSearchQuery: (query: string) => void;
  setSort: (sort: SortConfig | null) => void;
  reset: () => void;
}

// ============================================
// Initial State
// ============================================

const initialState = {
  filters: [],
  searchQuery: '',
  sort: null,
};

// ============================================
// Store
// ============================================

/**
 * Filter store - manages filters, search, and sort
 *
 * @example
 * ```tsx
 * const { filters, addFilter, searchQuery, setSearchQuery } = useFilterStore();
 *
 * // Add a filter
 * addFilter({
 *   fieldName: 'status',
 *   operator: 'equals',
 *   value: 'active'
 * });
 *
 * // Search
 * setSearchQuery('search term');
 *
 * // Sort
 * setSort({ fieldName: 'createdAt', direction: 'desc' });
 * ```
 */
export const useFilterStore = create<FilterState>((set) => ({
  ...initialState,

  addFilter: (filter) =>
    set((state) => {
      // Remove existing filter for same field
      const filtered = state.filters.filter((f) => f.fieldName !== filter.fieldName);
      return { filters: [...filtered, filter] };
    }),

  removeFilter: (fieldName) =>
    set((state) => ({
      filters: state.filters.filter((f) => f.fieldName !== fieldName),
    })),

  clearFilters: () => set({ filters: [] }),

  setSearchQuery: (query) => set({ searchQuery: query }),

  setSort: (sort) => set({ sort }),

  reset: () => set(initialState),
}));
