/**
 * @workspace/active-tables-core
 *
 * Core UI components and utilities for Active Tables
 * API-agnostic, reusable across apps/web and apps/admin
 *
 * Phase 0: Encryption utilities and types ✅
 * Phase 1: Type system, hooks, stores, constants ✅
 * Phase 2: Field Renderers (25+ field types) ✅
 * Phase 3: List Views (table & card layouts) ✅
 * Phase 4: Detail Views (single/two-column, comments) ✅
 * Phase 5+: Kanban, gantt, filters (coming soon)
 */

// ============================================
// Utilities (Phase 0 + Phase 1)
// ============================================
export * from './utils/index.js';

// ============================================
// Types (Phase 0 + Phase 1)
// ============================================
export * from './types/index.js';

// ============================================
// Hooks (Phase 1)
// ============================================
export * from './hooks/index.js';

// ============================================
// Stores (Phase 1)
// ============================================
export * from './stores/index.js';

// ============================================
// Constants (Phase 1)
// ============================================
export * from './constants/index.js';

// ============================================
// Components (Phase 2+)
// ============================================
export * from './components/index.js';

// ============================================
// Re-exports from encryption-core for convenience
// ============================================
export { CommonUtils, AES256, OPE, HMAC } from '@workspace/encryption-core';
