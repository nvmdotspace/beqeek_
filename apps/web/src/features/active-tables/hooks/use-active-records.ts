/**
 * Temporary stub for useActiveRecords hook
 * TODO: Implement proper records management in Phase 1
 *
 * This is a placeholder to fix broken imports after removing @workspace/active-tables-hooks
 */

export function useActiveRecords(_tableId?: string, _workspaceId?: string) {
  // For now, return empty/default values
  // In production, this should fetch and manage active table records
  return {
    records: [],
    isLoading: false,
    isFetching: false,
    error: null,
    refetch: async () => {},
  };
}
