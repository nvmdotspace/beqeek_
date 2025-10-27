export interface ActiveWorkGroup {
  id: string;
  name: string;
  description?: string;
  config?: unknown[];
}

export interface ActiveTableOption {
  text: string;
  value: string;
  text_color?: string;
  background_color?: string;
}

export interface ActiveFieldConfig {
  type: string;
  label: string;
  name: string;
  placeholder?: string;
  required?: boolean;
  options?: ActiveTableOption[];
}

export interface ActiveTableAction {
  name: string;
  type: string;
  icon?: string;
  actionId: string;
}

export interface ActiveTableQuickFilter {
  fieldName: string;
}

export interface KanbanConfig {
  kanbanScreenId: string;
  screenName: string;
  screenDescription?: string;
  statusField: string;
  kanbanHeadlineField: string;
  displayFields: string[];
}

export interface RecordListConfig {
  layout: string;
  titleField: string;
  subLineFields: string[];
  tailFields: string[];
}

export interface RecordDetailConfig {
  layout: string;
  commentsPosition: string;
  headTitleField: string;
  headSubLineFields: string[];
  rowTailFields: string[];
}

export interface PermissionAction {
  actionId: string;
  permission: string;
}

export interface PermissionsConfig {
  teamId: string;
  roleId: string;
  actions: PermissionAction[];
}

export interface GanttChart {
  ganttScreenId: string;
  screenName: string;
  screenDescription?: string;
  taskNameField: string;
  startDateField: string;
  endDateField: string;
  progressField?: string;
  dependencyField?: string;
}

export interface ActiveTableConfig {
  title: string;
  fields: ActiveFieldConfig[];
  actions: ActiveTableAction[];
  quickFilters: ActiveTableQuickFilter[];
  tableLimit: number;
  e2eeEncryption: boolean;
  hashedKeywordFields: string[];
  defaultSort: string;
  kanbanConfigs: KanbanConfig[];
  recordListConfig: RecordListConfig;
  recordDetailConfig: RecordDetailConfig;
  permissionsConfig: PermissionsConfig[];
  ganttCharts: GanttChart[];
  encryptionKey?: string;
  encryptionAuthKey: string;
}

export interface ActiveTable {
  id: string;
  name: string;
  workGroupId: string;
  tableType: string;
  description?: string;
  config: ActiveTableConfig;
  createdAt?: string;
  updatedAt?: string;
}

export interface ActiveWorkGroupsResponse {
  data: ActiveWorkGroup[];
  limit?: number;
  sort?: Record<string, unknown>;
}

export interface ActiveTablesResponse {
  data: ActiveTable[];
  limit?: number;
  sort?: Record<string, unknown>;
}

export interface ActiveTableRecordPermissions {
  access: boolean;
  update: boolean;
  delete?: boolean;
}

export interface ActiveTableRecord {
  id: string;
  record: Record<string, unknown>;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
  valueUpdatedAt?: Record<string, string>;
  relatedUserIds?: string[];
  assignedUserIds?: string[];
  record_hashes?: Record<string, string | string[]>;
  hashed_keywords?: string[];
  permissions?: ActiveTableRecordPermissions;
}

export interface ActiveRecordsResponse {
  data: ActiveTableRecord[];
  next_id?: string | null;
  previous_id?: string | null;
  limit?: number;
  offset?: number;
}
