/**
 * Type definitions for Active Table Settings
 *
 * Defines types for the settings screen including tabs, validation, and state management.
 */

/**
 * Available settings tab IDs
 */
export type SettingsTabId =
  | 'general'
  | 'fields'
  | 'actions'
  | 'list-view'
  | 'quick-filters'
  | 'detail-view'
  | 'kanban'
  | 'gantt'
  | 'permissions'
  | 'danger-zone';

/**
 * Settings tab configuration
 */
export interface SettingsTab {
  /** Unique tab identifier */
  id: SettingsTabId;

  /** Display label */
  label: string;

  /** Description for the tab */
  description: string;

  /** Icon name (lucide-react) */
  icon: string;

  /** Whether the tab is enabled */
  enabled?: boolean;
}

/**
 * Unsaved changes state
 */
export interface UnsavedChanges {
  /** Whether there are unsaved changes */
  isDirty: boolean;

  /** Sections with unsaved changes */
  sections: SettingsTabId[];

  /** Timestamp of last change */
  lastModified?: Date;
}

/**
 * Validation error
 */
export interface ValidationError {
  /** Field path (e.g., 'fields.0.name') */
  field: string;

  /** Error message */
  message: string;

  /** Error code for i18n */
  code?: string;
}

/**
 * Validation result
 */
export interface ValidationResult {
  /** Whether validation passed */
  isValid: boolean;

  /** List of validation errors */
  errors: ValidationError[];
}

/**
 * Settings state for form management
 */
export interface SettingsFormState<T = unknown> {
  /** Current form data */
  data: T;

  /** Original data for comparison */
  original: T;

  /** Whether data is being saved */
  isSaving: boolean;

  /** Save error if any */
  error: Error | null;

  /** Whether data has been modified */
  isDirty: boolean;

  /** Validation errors */
  validationErrors: ValidationError[];
}

/**
 * Field form data
 */
export interface FieldFormData {
  /** Field type */
  type: string;

  /** Field label */
  label: string;

  /** Field name (auto-generated from label) */
  name: string;

  /** Placeholder text */
  placeholder?: string;

  /** Default value */
  defaultValue?: string | number | boolean;

  /** Whether field is required */
  required?: boolean;

  /** Maximum length for text fields */
  maxlength?: number;

  /** Options for SELECT/CHECKBOX fields */
  options?: Array<{
    text: string;
    value: string;
    text_color?: string;
    background_color?: string;
  }>;

  /** Reference table ID for REFERENCE fields */
  referenceTableId?: string;

  /** Reference field name */
  referenceField?: string;

  /** Reference label field */
  referenceLabelField?: string;

  /** Additional condition for reference */
  additionalCondition?: string;
}

/**
 * Action form data
 */
export interface ActionFormData {
  /** Action ID (UUID v7) */
  actionId: string;

  /** Action name */
  name: string;

  /** Action type */
  type: 'default' | 'custom';

  /** Icon name */
  icon?: string;
}

/**
 * Quick filter form data
 */
export interface QuickFilterFormData {
  /** Filter ID (UUID v7) */
  filterId: string;

  /** Field name to filter by */
  fieldName: string;

  /** Field label (auto-populated) */
  fieldLabel?: string;

  /** Field type (auto-populated) */
  fieldType?: string;
}

/**
 * Kanban config form data
 */
export interface KanbanConfigFormData {
  /** Kanban screen ID (UUID v7) */
  kanbanScreenId: string;

  /** Screen name */
  screenName: string;

  /** Screen description */
  screenDescription?: string;

  /** Status field name (must be SELECT_ONE or SELECT_ONE_WORKSPACE_USER) */
  statusField: string;

  /** Headline field name */
  kanbanHeadlineField: string;

  /** Display fields */
  displayFields: string[];
}

/**
 * Gantt config form data
 */
export interface GanttConfigFormData {
  /** Gantt chart ID (UUID v7) */
  ganttChartId: string;

  /** Chart name */
  chartName: string;

  /** Chart description */
  chartDescription?: string;

  /** Task name field */
  taskNameField: string;

  /** Start date field */
  startDateField: string;

  /** End date field */
  endDateField: string;

  /** Progress field (optional) */
  progressField?: string;

  /** Dependency field (optional) */
  dependencyField?: string;

  /** Status field (optional, SELECT_ONE type) */
  statusField?: string;

  /** Status complete value (optional, value from statusField options) */
  statusCompleteValue?: string;
}

/**
 * Permission type by action category
 */
export type PermissionType =
  // Create actions
  | 'not_allowed'
  | 'allowed'
  // Access/Update/Delete/Custom actions
  | 'all'
  | 'self_created'
  | 'self_created_2h'
  | 'self_created_12h'
  | 'self_created_24h'
  | 'assigned_user'
  | 'related_user'
  | 'self_created_or_assigned'
  | 'self_created_or_related'
  | 'created_by_team'
  | 'created_by_team_2h'
  | 'created_by_team_12h'
  | 'created_by_team_24h'
  | 'created_by_team_48h'
  | 'created_by_team_72h'
  | 'assigned_team_member'
  | 'related_team_member'
  | 'created_or_assigned_team_member'
  | 'created_or_related_team_member'
  // Comment actions
  | 'comment_self_created'
  | 'comment_self_created_or_tagged'
  | 'comment_created_by_team'
  | 'comment_created_or_tagged_team_member'
  | 'comment_self_created_2h'
  | 'comment_self_created_12h'
  | 'comment_self_created_24h'
  | 'comment_created_by_team_2h'
  | 'comment_created_by_team_12h'
  | 'comment_created_by_team_24h';

/**
 * Permission configuration
 */
export interface PermissionConfig {
  /** Team ID */
  teamId: string;

  /** Role ID */
  roleId: string;

  /** Action permissions */
  actions: Array<{
    actionId: string;
    permission: PermissionType;
  }>;
}
