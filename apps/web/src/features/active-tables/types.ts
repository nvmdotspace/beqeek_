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

export interface ActiveTableConfig {
  title: string;
  fields: ActiveFieldConfig[];
  e2eeEncryption?: boolean;
  encryptionKey?: string | null;
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
