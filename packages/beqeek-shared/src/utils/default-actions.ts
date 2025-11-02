/**
 * Default Actions Generator
 *
 * Auto-generates 8 system actions when creating a new Active Table:
 * - 4 record actions (create, access, update, delete)
 * - 4 comment actions (comment_create, comment_access, comment_update, comment_delete)
 *
 * Based on: api-integration-create-active-table.md Section 7.1
 *
 * IMPORTANT: This function returns i18n keys for action names, not localized text.
 * The consuming application must localize these keys using its i18n system.
 */

import { generateUUIDv7 } from './uuid-generator.js';

export interface DefaultAction {
  name: string; // i18n key (e.g., "actions_record_create")
  type:
    | 'create'
    | 'access'
    | 'update'
    | 'delete'
    | 'comment_create'
    | 'comment_access'
    | 'comment_update'
    | 'comment_delete';
  icon: 'create' | 'access' | 'update' | 'delete';
  actionId: string;
}

/**
 * Initialize default actions for a new Active Table
 *
 * @returns Array of 8 default actions with generated UUID v7 identifiers
 *
 * NOTE: Action names are i18n keys that must be localized by the consuming app.
 * Add these keys to your messages/{locale}.json files:
 * - actions_record_create: "Create record"
 * - actions_record_access: "Access record"
 * - actions_record_update: "Update record"
 * - actions_record_delete: "Delete record"
 * - actions_comment_create: "Add comment"
 * - actions_comment_access: "Access comment"
 * - actions_comment_update: "Update comment"
 * - actions_comment_delete: "Delete comment"
 *
 * @example
 * ```typescript
 * const actions = initDefaultActions();
 * // Returns:
 * // [
 * //   { name: 'actions_record_create', type: 'create', icon: 'create', actionId: '...' },
 * //   { name: 'actions_record_access', type: 'access', icon: 'access', actionId: '...' },
 * //   ...
 * // ]
 *
 * // In your app, localize the names:
 * const localizedActions = actions.map(action => ({
 *   ...action,
 *   name: m[action.name]?.() || action.name
 * }));
 * ```
 */
export function initDefaultActions(): DefaultAction[] {
  const defaultActions: Omit<DefaultAction, 'actionId'>[] = [
    { name: 'actions_record_create', type: 'create', icon: 'create' },
    { name: 'actions_record_access', type: 'access', icon: 'access' },
    { name: 'actions_record_update', type: 'update', icon: 'update' },
    { name: 'actions_record_delete', type: 'delete', icon: 'delete' },
    { name: 'actions_comment_create', type: 'comment_create', icon: 'create' },
    { name: 'actions_comment_access', type: 'comment_access', icon: 'access' },
    { name: 'actions_comment_update', type: 'comment_update', icon: 'update' },
    { name: 'actions_comment_delete', type: 'comment_delete', icon: 'delete' },
  ];

  // Generate UUID v7 for each action
  return defaultActions.map((action) => ({
    ...action,
    actionId: generateUUIDv7(),
  }));
}
