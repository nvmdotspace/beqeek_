/**
 * Action type definitions for Active Tables
 *
 * Actions are buttons/operations that can be performed on records
 */

// ============================================
// Action Types Constants
// ============================================

/**
 * Supported action types
 */
export const ACTION_TYPES = {
  // Navigation actions
  OPEN_FORM: 'OPEN_FORM',
  OPEN_URL: 'OPEN_URL',
  NAVIGATE_TO: 'NAVIGATE_TO',

  // Data actions
  CREATE_RECORD: 'CREATE_RECORD',
  UPDATE_RECORD: 'UPDATE_RECORD',
  DELETE_RECORD: 'DELETE_RECORD',

  // Workflow actions
  TRIGGER_WORKFLOW: 'TRIGGER_WORKFLOW',
  SEND_EMAIL: 'SEND_EMAIL',
  SEND_NOTIFICATION: 'SEND_NOTIFICATION',

  // Custom actions
  CUSTOM_SCRIPT: 'CUSTOM_SCRIPT',
  API_CALL: 'API_CALL',
} as const;

export type ActionType = (typeof ACTION_TYPES)[keyof typeof ACTION_TYPES];

// ============================================
// Action Configuration
// ============================================

/**
 * Configuration for an action button
 */
export interface ActionConfig {
  /** Action unique identifier */
  actionId: string;

  /** Display name of the action */
  name: string;

  /** Action type (determines behavior) */
  type: string;

  /** Optional icon name (from icon library) */
  icon?: string;

  /** Action-specific configuration */
  config?: Record<string, unknown>;
}

// ============================================
// Quick Filter Configuration
// ============================================

/**
 * Configuration for a quick filter button
 */
export interface QuickFilterConfig {
  /** Field name to filter on */
  fieldName: string;

  /** Optional filter value (if not provided, shows all values) */
  value?: string | string[];

  /** Optional display label */
  label?: string;
}

// ============================================
// Type Guards
// ============================================

/**
 * Navigation action types
 */
export const NAVIGATION_ACTION_TYPES = [
  ACTION_TYPES.OPEN_FORM,
  ACTION_TYPES.OPEN_URL,
  ACTION_TYPES.NAVIGATE_TO,
] as const;

const NAVIGATION_ACTION_TYPE_SET = new Set<ActionType>(NAVIGATION_ACTION_TYPES);

/**
 * Data manipulation action types
 */
export const DATA_ACTION_TYPES = [
  ACTION_TYPES.CREATE_RECORD,
  ACTION_TYPES.UPDATE_RECORD,
  ACTION_TYPES.DELETE_RECORD,
] as const;

const DATA_ACTION_TYPE_SET = new Set<ActionType>(DATA_ACTION_TYPES);

/**
 * Workflow action types
 */
export const WORKFLOW_ACTION_TYPES = [
  ACTION_TYPES.TRIGGER_WORKFLOW,
  ACTION_TYPES.SEND_EMAIL,
  ACTION_TYPES.SEND_NOTIFICATION,
] as const;

const WORKFLOW_ACTION_TYPE_SET = new Set<ActionType>(WORKFLOW_ACTION_TYPES);

/**
 * Check if action type is valid
 */
const ACTION_TYPE_VALUES = Object.values(ACTION_TYPES) as ActionType[];

export function isValidActionType(type: string): type is ActionType {
  return ACTION_TYPE_VALUES.includes(type as ActionType);
}

/**
 * Check if action config has required properties
 */
export function isNavigationAction(type: string): boolean {
  return isValidActionType(type) && NAVIGATION_ACTION_TYPE_SET.has(type);
}

export function isDataAction(type: string): boolean {
  return isValidActionType(type) && DATA_ACTION_TYPE_SET.has(type);
}

export function isWorkflowAction(type: string): boolean {
  return isValidActionType(type) && WORKFLOW_ACTION_TYPE_SET.has(type);
}

export function isValidActionConfig(action: unknown): action is ActionConfig {
  if (!action || typeof action !== 'object') {
    return false;
  }

  const candidate = action as Partial<ActionConfig>;
  return (
    typeof candidate.actionId === 'string' &&
    typeof candidate.name === 'string' &&
    typeof candidate.type === 'string' &&
    isValidActionType(candidate.type)
  );
}

// ============================================
// Legacy Type Aliases (for backward compatibility)
// ============================================

/**
 * @deprecated Use ActionConfig instead
 */
export type ActiveTableAction = ActionConfig;

/**
 * @deprecated Use QuickFilterConfig instead
 */
export type ActiveTableQuickFilter = QuickFilterConfig;
