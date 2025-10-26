import { KeyManager } from '@workspace/encryption-core';
import type {
  TableConfig,
  TablePermission,
  Workspace,
  ValidationResult,
  CreateTableRequest,
  UpdateTableRequest,
  ActiveTablesApiClient
} from '../types';


export class TableManager {
  private keyManager: KeyManager;
  private apiClient: ActiveTablesApiClient;

  constructor(apiClient: ActiveTablesApiClient) {
    this.keyManager = KeyManager.getInstance();
    this.apiClient = apiClient;
  }

  /**
   * Create a new table
   */
  async createTable(request: CreateTableRequest): Promise<TableConfig> {
    // Validate request
    const validation = this.validateCreateRequest(request);
    if (!validation.isValid) {
      throw new Error(`Invalid table creation request: ${validation.errors.map(e => e.message).join(', ')}`);
    }

    // Generate table ID
    const tableId = this.generateTableId();

    // Create encryption keys for the table
    const fieldTypes: Record<string, string> = {};
    request.fields.forEach(field => {
      fieldTypes[field.name] = field.type;
    });

    const tableKey = await this.keyManager.createTableKey(
      tableId,
      request.workspaceId,
      fieldTypes,
      request.e2eeEnabled || false
    );

    // Prepare table configuration
    const tableConfig: TableConfig = {
      id: tableId,
      name: request.name,
      description: request.description,
      workspaceId: request.workspaceId,
      fields: this.processFields(request.fields, tableKey),
      encryptionEnabled: request.encryptionEnabled ?? true,
      e2eeEnabled: request.e2eeEnabled ?? false,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'current-user', // TODO: Get actual user ID
      settings: this.getDefaultTableSettings()
    };

    try {
      // Call API to create table
      const response = await this.apiClient.post('/tables', tableConfig);

      // Store table configuration locally for encryption
      await this.keyManager.getStorageManager().storeTableConfig(tableId, tableConfig);

      return response.data;
    } catch (error) {
      // Clean up keys if API call fails
      await this.keyManager.deleteTableKey(tableId);
      throw error;
    }
  }

  /**
   * Get table configuration
   */
  async getTable(tableId: string): Promise<TableConfig | null> {
    try {
      // Try API first
      const response = await this.apiClient.get(`/tables/${tableId}`);
      const tableConfig = response.data;

      // Cache locally
      await this.keyManager.getStorageManager().storeTableConfig(tableId, tableConfig);

      return tableConfig;
    } catch (error) {
      // Fallback to local cache
      return await this.keyManager.getStorageManager().getTableConfig(tableId);
    }
  }

  /**
   * Update table configuration
   */
  async updateTable(tableId: string, request: UpdateTableRequest): Promise<TableConfig> {
    const existingTable = await this.getTable(tableId);
    if (!existingTable) {
      throw new Error('Table not found');
    }

    // Validate update
    const validation = this.validateUpdateRequest(request, existingTable);
    if (!validation.isValid) {
      throw new Error(`Invalid table update request: ${validation.errors.map(e => e.message).join(', ')}`);
    }

    const updatedTable: TableConfig = {
      ...existingTable,
      ...request,
      updatedAt: new Date()
    };

    // Handle field changes
    if (request.fields) {
      const tableKey = await this.keyManager.getTableKey(tableId);
      if (tableKey) {
        updatedTable.fields = this.processFields(request.fields, tableKey);
      }
    }

    try {
      const response = await this.apiClient.put(`/tables/${tableId}`, updatedTable);

      // Update local cache
      await this.keyManager.getStorageManager().storeTableConfig(tableId, response.data);

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete table
   */
  async deleteTable(tableId: string): Promise<void> {
    try {
      await this.apiClient.delete(`/tables/${tableId}`);
    } catch (error) {
      // Continue with local cleanup even if API call fails
      console.warn('Failed to delete table from server, cleaning up locally:', error);
    }

    // Clean up local data
    await this.keyManager.getStorageManager().clearTableData(tableId);
    await this.keyManager.deleteTableKey(tableId);
  }

  /**
   * List tables in workspace
   */
  async listTables(workspaceId: string): Promise<TableConfig[]> {
    try {
      const response = await this.apiClient.get(`/workspaces/${workspaceId}/tables`);
      return response.data;
    } catch (error) {
      // Fallback to locally cached tables
      const tableIds = await this.keyManager.getTableIdsForWorkspace(workspaceId);
      const tables: TableConfig[] = [];

      for (const tableId of tableIds) {
        const table = await this.getTable(tableId);
        if (table && table.workspaceId === workspaceId) {
          tables.push(table);
        }
      }

      return tables;
    }
  }

  /**
   * Duplicate table
   */
  async duplicateTable(
    sourceTableId: string,
    newName: string
  ): Promise<TableConfig> {
    const sourceTable = await this.getTable(sourceTableId);
    if (!sourceTable) {
      throw new Error('Source table not found');
    }

    const duplicateRequest: CreateTableRequest = {
      name: newName,
      description: sourceTable.description ? `Copy of ${sourceTable.description}` : undefined,
      workspaceId: sourceTable.workspaceId,
      fields: sourceTable.fields.map(field => ({
        name: field.name,
        type: field.type,
        label: field.label,
        required: field.required,
        description: field.description,
        defaultValue: field.defaultValue,
        validation: field.validation
      })),
      encryptionEnabled: sourceTable.encryptionEnabled,
      e2eeEnabled: sourceTable.e2eeEnabled
    };

    return this.createTable(duplicateRequest);
  }

  /**
   * Get table permissions
   */
  async getTablePermissions(tableId: string): Promise<TablePermission[]> {
    try {
      const response = await this.apiClient.get(`/tables/${tableId}/permissions`);
      return response.data;
    } catch (error) {
      console.warn('Failed to fetch table permissions:', error);
      return [];
    }
  }

  /**
   * Update table permissions
   */
  async updateTablePermissions(
    tableId: string,
    permissions: Partial<TablePermission>[]
  ): Promise<TablePermission[]> {
    try {
      const response = await this.apiClient.put(`/tables/${tableId}/permissions`, {
        permissions,
        updatedBy: 'current-user' // TODO: Get actual user ID
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Export table configuration
   */
  async exportTableConfig(tableId: string): Promise<any> {
    const table = await this.getTable(tableId);
    if (!table) {
      throw new Error('Table not found');
    }

    const tableKey = await this.keyManager.getTableKey(tableId);
    const permissions = await this.getTablePermissions(tableId);

    return {
      table,
      tableKey: tableKey ? {
        id: tableKey.tableId,
        version: tableKey.version,
        e2eeEnabled: tableKey.e2eeEnabled,
        fieldTypes: Object.keys(tableKey.fieldKeys)
      } : null,
      permissions,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };
  }

  /**
   * Import table configuration
   */
  async importTableConfig(config: any, workspaceId: string): Promise<TableConfig> {
    if (!config.table) {
      throw new Error('Invalid import configuration: missing table data');
    }

    const importRequest: CreateTableRequest = {
      name: config.table.name,
      description: config.table.description,
      workspaceId,
      fields: config.table.fields.map((field: any) => ({
        name: field.name,
        type: field.type,
        label: field.label,
        required: field.required,
        description: field.description,
        defaultValue: field.defaultValue,
        validation: field.validation
      })),
      encryptionEnabled: config.table.encryptionEnabled,
      e2eeEnabled: config.table.e2eeEnabled
    };

    const newTable = await this.createTable(importRequest);

    // Import permissions if available
    if (config.permissions && config.permissions.length > 0) {
      const adaptedPermissions = config.permissions.map((perm: any) => ({
        ...perm,
        tableId: newTable.id,
        grantedBy: 'current-user', // TODO: Get actual user ID
        grantedAt: new Date()
      }));

      await this.updateTablePermissions(newTable.id, adaptedPermissions);
    }

    return newTable;
  }

  /**
   * Validate create table request
   */
  private validateCreateRequest(request: CreateTableRequest): ValidationResult {
    const errors: any[] = [];

    if (!request.name || request.name.trim().length === 0) {
      errors.push({
        field: 'name',
        value: request.name,
        rule: 'required',
        message: 'Table name is required',
        code: 'REQUIRED_FIELD'
      });
    }

    if (!request.workspaceId) {
      errors.push({
        field: 'workspaceId',
        value: request.workspaceId,
        rule: 'required',
        message: 'Workspace ID is required',
        code: 'REQUIRED_FIELD'
      });
    }

    if (!request.fields || request.fields.length === 0) {
      errors.push({
        field: 'fields',
        value: request.fields,
        rule: 'required',
        message: 'At least one field is required',
        code: 'REQUIRED_FIELD'
      });
    }

    // Validate field names are unique
    if (request.fields) {
      const fieldNames = request.fields.map(f => f.name);
      const duplicates = fieldNames.filter((name, index) => fieldNames.indexOf(name) !== index);
      if (duplicates.length > 0) {
        errors.push({
          field: 'fields',
          value: duplicates,
          rule: 'unique',
          message: `Field names must be unique: ${duplicates.join(', ')}`,
          code: 'DUPLICATE_FIELD_NAMES'
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings: []
    };
  }

  /**
   * Validate update table request
   */
  private validateUpdateRequest(request: UpdateTableRequest, existingTable: TableConfig): ValidationResult {
    const errors: any[] = [];

    if (request.fields) {
      // Validate field names are unique
      const fieldNames = request.fields.map(f => f.name);
      const duplicates = fieldNames.filter((name, index) => fieldNames.indexOf(name) !== index);
      if (duplicates.length > 0) {
        errors.push({
          field: 'fields',
          value: duplicates,
          rule: 'unique',
          message: `Field names must be unique: ${duplicates.join(', ')}`,
          code: 'DUPLICATE_FIELD_NAMES'
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings: []
    };
  }

  /**
   * Process fields and assign encryption settings
   */
  private processFields(fields: any[], tableKey: any): any[] {
    return fields.map((field, index) => ({
      id: this.generateFieldId(),
      ...field,
      encryption: {
        enabled: true,
        type: this.getEncryptionTypeForFieldType(field.type),
        searchable: this.isSearchableFieldType(field.type),
        orderPreserving: this.isOrderPreservingFieldType(field.type),
        e2ee: tableKey.e2eeEnabled,
        keyRotation: true
      }
    }));
  }

  /**
   * Get default table settings
   */
  private getDefaultTableSettings(): any {
    return {
      allowExport: true,
      allowImport: true,
      maxRecords: 10000,
      defaultSortField: 'created_at',
      defaultSortOrder: 'desc' as const,
      viewSettings: {
        defaultView: 'table' as const,
        defaultPageSize: 25,
        showRowNumbers: true,
        enableFilters: true,
        enableSearch: true,
        enableSorting: true
      }
    };
  }

  /**
   * Generate unique table ID
   */
  private generateTableId(): string {
    return `tbl_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Generate unique field ID
   */
  private generateFieldId(): string {
    return `fld_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Get encryption type for field type
   */
  private getEncryptionTypeForFieldType(fieldType: string): string {
    const encryptionMap: Record<string, string> = {
      'SHORT_TEXT': 'AES-256-CBC',
      'TEXT': 'AES-256-CBC',
      'RICH_TEXT': 'AES-256-CBC',
      'EMAIL': 'AES-256-CBC',
      'URL': 'AES-256-CBC',
      'INTEGER': 'OPE',
      'NUMERIC': 'OPE',
      'DATE': 'OPE',
      'DATETIME': 'OPE',
      'TIME': 'OPE',
      'CHECKBOX_YES_NO': 'HMAC-SHA256',
      'CHECKBOX_ONE': 'HMAC-SHA256',
      'CHECKBOX_LIST': 'HMAC-SHA256',
      'SELECT_ONE': 'HMAC-SHA256',
      'SELECT_LIST': 'HMAC-SHA256'
    };

    return encryptionMap[fieldType] || 'NONE';
  }

  /**
   * Check if field type is searchable
   */
  private isSearchableFieldType(fieldType: string): boolean {
    const searchableTypes = [
      'SHORT_TEXT', 'TEXT', 'EMAIL', 'URL',
      'INTEGER', 'NUMERIC', 'DATE', 'DATETIME', 'TIME',
      'CHECKBOX_YES_NO', 'CHECKBOX_ONE', 'CHECKBOX_LIST',
      'SELECT_ONE', 'SELECT_LIST'
    ];

    return searchableTypes.includes(fieldType);
  }

  /**
   * Check if field type supports order preservation
   */
  private isOrderPreservingFieldType(fieldType: string): boolean {
    const orderPreservingTypes = [
      'INTEGER', 'NUMERIC', 'DATE', 'DATETIME', 'TIME'
    ];

    return orderPreservingTypes.includes(fieldType);
  }
}
