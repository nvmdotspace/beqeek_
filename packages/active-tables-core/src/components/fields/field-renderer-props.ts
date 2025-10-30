/**
 * Base Props for Field Renderers
 *
 * Common interface used by all field renderer components
 */

import type { FieldConfig } from '../../types/field.js';
import type { CurrentUser, WorkspaceUser } from '../../types/responses.js';
import type { ActiveTablesMessages } from '../../types/messages.js';
import type { Table } from '../../types/common.js';

/**
 * Base props shared by all field renderer components
 */
export interface BaseFieldRendererProps {
  /** The table metadata */
  table: Table;
  /** Current authenticated user */
  currentUser?: CurrentUser;
  /** List of workspace users (for user selection fields) */
  workspaceUsers?: WorkspaceUser[];
  /** Localized messages */
  messages?: Partial<ActiveTablesMessages>;
  /** Encryption key for E2EE tables */
  encryptionKey?: string;
}

/**
 * Props for individual field renderers
 */
export interface FieldRendererProps extends BaseFieldRendererProps {
  /** Field configuration */
  field: FieldConfig;
  /** Current field value */
  value: unknown;
  /** Callback when value changes */
  onChange?: (value: unknown) => void;
  /** Display or edit mode */
  mode: 'display' | 'edit';
  /** Whether the field is disabled */
  disabled?: boolean;
  /** Error message to display */
  error?: string;
  /** Additional CSS class names */
  className?: string;
}

/**
 * Type guard to check if a field renderer is in edit mode
 */
export function isEditMode(mode: 'display' | 'edit'): mode is 'edit' {
  return mode === 'edit';
}

/**
 * Type guard to check if a field renderer is in display mode
 */
export function isDisplayMode(mode: 'display' | 'edit'): mode is 'display' {
  return mode === 'display';
}
