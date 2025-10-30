/**
 * Temporary stub for useEncryption hook
 * TODO: Implement proper encryption state management in Phase 1
 *
 * This is a placeholder to fix broken imports after removing @workspace/active-tables-hooks
 */

export function useEncryption() {
  // For now, assume encryption is always ready
  // In production, this should check localStorage for encryption key
  return {
    isReady: true,
    initialize: () => Promise.resolve(),
  };
}
