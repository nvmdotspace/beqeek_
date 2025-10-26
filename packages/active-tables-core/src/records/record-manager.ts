import { KeyManager, EncryptedSearch, buildEncryptedPayload } from '@workspace/encryption-core';
import type {
  TableRecord,
  EncryptedRecord,
  TableConfig,
  SearchQuery,
  SearchResult,
  ImportConfig,
  ExportConfig,
  ExportResult,
  ValidationResult,
  FieldChange,
  CreateRecordRequest,
  UpdateRecordRequest,
  ActiveTablesApiClient
} from '../types';


export class RecordManager {
  private keyManager: KeyManager;
  private searchEngine: EncryptedSearch;
  private apiClient: ActiveTablesApiClient;

  constructor(apiClient: ActiveTablesApiClient) {
    this.keyManager = KeyManager.getInstance();
    this.searchEngine = new EncryptedSearch();
    this.apiClient = apiClient;
  }

  /**
   * Create a new record
   */
  async createRecord(request: CreateRecordRequest): Promise<TableRecord> {
    // Get table configuration
    const tableConfig = await this.getTableConfig(request.tableId);
    if (!tableConfig) {
      throw new Error('Table not found');
    }

    // Validate record data
    const validation = this.validateRecordData(request.data, tableConfig);
    if (!validation.isValid) {
      throw new Error(`Invalid record data: ${validation.errors.map(e => e.message).join(', ')}`);
    }

    // Generate record ID
    const recordId = this.generateRecordId();

    // Encrypt record data
    const encryptedRecord = await this.encryptRecord(
      recordId,
      request.data,
      tableConfig
    );

    // Prepare record object
    const record: TableRecord = {
      id: recordId,
      tableId: request.tableId,
      data: request.data,
      encryptedData: encryptedRecord.encryptedData,
      searchIndexes: encryptedRecord.searchIndexes,
      record_hashes: encryptedRecord.recordHashes,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: request.createdBy,
      updatedBy: request.createdBy,
      version: 1,
      metadata: {
        encryptionVersion: '1.0',
        fieldVersions: this.getFieldVersions(tableConfig),
        auditLog: [{
          timestamp: new Date(),
          userId: request.createdBy,
          action: 'create',
          fieldChanges: this.getFieldChanges({}, request.data, tableConfig)
        }]
      }
    };

    try {
      // Call API to create record
      const response = await this.apiClient.post(`/tables/${request.tableId}/records`, {
        record: encryptedRecord.encryptedData,
        hashed_keywords: encryptedRecord.searchIndexes,
        record_hashes: encryptedRecord.recordHashes
      });

      // Store record locally for offline access
      await this.storeRecordLocally(record);

      // Add to search index
      await this.addToSearchIndex(record, tableConfig);

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get a record by ID
   */
  async getRecord(recordId: string, tableId: string): Promise<TableRecord | null> {
    try {
      // Try API first
      const response = await this.apiClient.get(`/tables/${tableId}/records/${recordId}`);
      const record = response.data;

      // Store locally for offline access
      await this.storeRecordLocally(record);

      return record;
    } catch (error) {
      // Fallback to local storage
      return await this.getRecordLocally(recordId, tableId);
    }
  }

  /**
   * Update a record
   */
  async updateRecord(recordId: string, request: UpdateRecordRequest): Promise<TableRecord> {
    // Get existing record
    const existingRecord = await this.getRecord(recordId, request.data.tableId || '');
    if (!existingRecord) {
      throw new Error('Record not found');
    }

    // Get table configuration
    const tableConfig = await this.getTableConfig(existingRecord.tableId);
    if (!tableConfig) {
      throw new Error('Table not found');
    }

    // Validate update data
    const validation = this.validateRecordData(request.data, tableConfig);
    if (!validation.isValid) {
      throw new Error(`Invalid record data: ${validation.errors.map(e => e.message).join(', ')}`);
    }

    // Check version for optimistic locking
    if (request.version !== undefined && request.version !== existingRecord.version) {
      throw new Error('Record has been modified by another user');
    }

    // Calculate field changes
    const fieldChanges = this.getFieldChanges(existingRecord.data, request.data, tableConfig);

    // Encrypt updated data
    const encryptedRecord = await this.encryptRecord(
      recordId,
      request.data,
      tableConfig
    );

    // Update search index
    await this.updateSearchIndex(existingRecord, request.data, tableConfig);

    // Prepare updated record
    const updatedRecord: TableRecord = {
      ...existingRecord,
      data: request.data,
      encryptedData: encryptedRecord.encryptedData,
      searchIndexes: encryptedRecord.searchIndexes,
      record_hashes: encryptedRecord.recordHashes,
      updatedAt: new Date(),
      updatedBy: request.updatedBy,
      version: existingRecord.version + 1,
      metadata: {
        ...existingRecord.metadata,
        auditLog: [
          ...existingRecord.metadata.auditLog,
          {
            timestamp: new Date(),
            userId: request.updatedBy,
            action: 'update',
            fieldChanges
          }
        ]
      }
    };

    try {
      const response = await this.apiClient.put(
        `/tables/${existingRecord.tableId}/records/${recordId}`,
        {
          record: encryptedRecord.encryptedData,
          hashed_keywords: encryptedRecord.searchIndexes,
          record_hashes: encryptedRecord.recordHashes
        }
      );

      // Update local storage
      await this.storeRecordLocally(updatedRecord);

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete a record
   */
  async deleteRecord(recordId: string, tableId: string): Promise<void> {
    try {
      await this.apiClient.delete(`/tables/${tableId}/records/${recordId}`);
    } catch (error) {
      console.warn('Failed to delete record from server, cleaning up locally:', error);
    }

    // Remove from local storage
    await this.deleteRecordLocally(recordId, tableId);

    // Remove from search index
    this.searchEngine.removeFromIndex(recordId);
  }

  /**
   * Search records
   */
  async searchRecords(query: SearchQuery): Promise<SearchResult> {
    const tableConfig = await this.getTableConfig(query.tableId);
    if (!tableConfig) {
      throw new Error('Table not found');
    }

    // Get encryption keys for searchable fields
    const fieldConfigs = new Map();
    const encryptionKeys = new Map();

    for (const field of tableConfig.fields) {
      if (field.encryption.searchable) {
        fieldConfigs.set(field.name, field.encryption);
        const fieldKey = await this.keyManager.getFieldKey(query.tableId, field.name);
        if (fieldKey) {
          encryptionKeys.set(field.name, fieldKey);
        }
      }
    }

    try {
      // Try API search first
      const response = await this.apiClient.post(`/tables/${query.tableId}/search`, query);
      return response.data;
    } catch (error) {
      // Fallback to local search
      const localResults = await this.searchEngine.search(
        query.query,
        fieldConfigs,
        encryptionKeys,
        {
          fuzzy: true,
          caseSensitive: false,
          includePartial: true
        }
      );

      return {
        records: [],
        totalCount: localResults.length,
        facets: [],
        suggestions: []
      };
    }
  }

  /**
   * List records in a table
   */
  async listRecords(
    tableId: string,
    options: {
      limit?: number;
      offset?: number;
      sort?: Array<{ field: string; direction: 'asc' | 'desc' }>;
      filters?: Array<{ field: string; operator: string; value: any }>;
    } = {}
  ): Promise<{ records: TableRecord[]; totalCount: number }> {
    try {
      const response = await this.apiClient.get(`/tables/${tableId}/records`, {
        params: options
      });

      // Cache records locally
      for (const record of response.data.records) {
        await this.storeRecordLocally(record);
      }

      return response.data;
    } catch (error) {
      // Fallback to local records
      return await this.listRecordsLocally(tableId, options);
    }
  }

  /**
   * Encrypt record data
   */
  private async encryptRecord(
    recordId: string,
    data: Record<string, any>,
    tableConfig: TableConfig
  ): Promise<{ encryptedData: Record<string, any>; searchIndexes: Record<string, string[]>; recordHashes: Record<string, string | string[]> }> {
    const fieldConfigs = new Map<string, any>();
    const encryptionKeys = new Map<string, string>();

    for (const field of tableConfig.fields) {
      if (field.encryption.enabled) {
        fieldConfigs.set(field.name, field.encryption);
        const fieldKey = await this.keyManager.getFieldKey(tableConfig.id, field.name);
        if (fieldKey) {
          encryptionKeys.set(field.name, fieldKey);
        }
      }
    }

    const payload = await buildEncryptedPayload(data, fieldConfigs as any, encryptionKeys, {
      packAesInRecord: true
    });

    return { encryptedData: payload.record, searchIndexes: payload.hashed_keywords, recordHashes: payload.record_hashes };
  }

  /**
   * Validate record data
   */
  private validateRecordData(data: Record<string, any>, tableConfig: TableConfig): ValidationResult {
    const errors: any[] = [];
    const warnings: any[] = [];

    for (const field of tableConfig.fields) {
      const value = data[field.name];

      // Required field validation
      if (field.required && (value === null || value === undefined || value === '')) {
        errors.push({
          field: field.name,
          value,
          rule: 'required',
          message: `${field.label || field.name} is required`,
          code: 'REQUIRED_FIELD'
        });
      }

      // Type validation
      if (value !== null && value !== undefined) {
        if (!this.validateFieldType(value, field.type)) {
          errors.push({
            field: field.name,
            value,
            rule: 'type',
            message: `${field.label || field.name} must be of type ${field.type}`,
            code: 'INVALID_TYPE'
          });
        }
      }

      // Custom validation
      if (field.validation && value !== null && value !== undefined) {
        const customErrors = this.validateFieldConstraints(value, field.validation, field);
        errors.push(...customErrors);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate field type
   */
  private validateFieldType(value: any, fieldType: string): boolean {
    switch (fieldType) {
      case 'SHORT_TEXT':
      case 'TEXT':
      case 'EMAIL':
      case 'URL':
      case 'PHONE':
        return typeof value === 'string';
      case 'INTEGER':
        return Number.isInteger(value);
      case 'NUMERIC':
      case 'CURRENCY':
      case 'PERCENTAGE':
      case 'RATING':
        return typeof value === 'number';
      case 'CHECKBOX_YES_NO':
        return typeof value === 'boolean';
      case 'DATE':
      case 'DATETIME':
        return value instanceof Date;
      case 'TIME':
        return typeof value === 'string' && /^\d{2}:\d{2}(:\d{2})?$/.test(value);
      case 'CHECKBOX_ONE':
      case 'CHECKBOX_LIST':
      case 'SELECT_ONE':
      case 'SELECT_LIST':
        return Array.isArray(value);
      default:
        return true;
    }
  }

  /**
   * Validate field constraints
   */
  private validateFieldConstraints(value: any, validation: any, field: any): any[] {
    const errors: any[] = [];

    if (validation.minLength && typeof value === 'string' && value.length < validation.minLength) {
      errors.push({
        field: field.name,
        value,
        rule: 'minLength',
        message: `${field.label || field.name} must be at least ${validation.minLength} characters`,
        code: 'MIN_LENGTH_VIOLATION'
      });
    }

    if (validation.maxLength && typeof value === 'string' && value.length > validation.maxLength) {
      errors.push({
        field: field.name,
        value,
        rule: 'maxLength',
        message: `${field.label || field.name} must be no more than ${validation.maxLength} characters`,
        code: 'MAX_LENGTH_VIOLATION'
      });
    }

    if (validation.min !== undefined && typeof value === 'number' && value < validation.min) {
      errors.push({
        field: field.name,
        value,
        rule: 'min',
        message: `${field.label || field.name} must be at least ${validation.min}`,
        code: 'MIN_VALUE_VIOLATION'
      });
    }

    if (validation.max !== undefined && typeof value === 'number' && value > validation.max) {
      errors.push({
        field: field.name,
        value,
        rule: 'max',
        message: `${field.label || field.name} must be no more than ${validation.max}`,
        code: 'MAX_VALUE_VIOLATION'
      });
    }

    if (validation.pattern && typeof value === 'string' && !new RegExp(validation.pattern).test(value)) {
      errors.push({
        field: field.name,
        value,
        rule: 'pattern',
        message: `${field.label || field.name} format is invalid`,
        code: 'PATTERN_VIOLATION'
      });
    }

    return errors;
  }

  /**
   * Get field changes for audit log
   */
  private getFieldChanges(
    oldData: Record<string, any>,
    newData: Record<string, any>,
    tableConfig: TableConfig
  ): FieldChange[] {
    const changes: FieldChange[] = [];

    for (const field of tableConfig.fields) {
      const oldValue = oldData[field.name];
      const newValue = newData[field.name];

      if (oldValue !== newValue) {
        changes.push({
          field: field.name,
          oldValue,
          newValue,
          encrypted: field.encryption.enabled
        });
      }
    }

    return changes;
  }

  /**
   * Get field versions
   */
  private getFieldVersions(tableConfig: TableConfig): Record<string, string> {
    const versions: Record<string, string> = {};

    for (const field of tableConfig.fields) {
      versions[field.name] = '1.0';
    }

    return versions;
  }

  /**
   * Helper methods
   */
  private async getTableConfig(tableId: string): Promise<TableConfig | null> {
    return await this.keyManager.getStorageManager().getTableConfig(tableId);
  }

  private generateRecordId(): string {
    return `rec_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  private async storeRecordLocally(record: TableRecord): Promise<void> {
    const existingRecords = await this.keyManager.getStorageManager().getRecords(record.tableId) || [];
    const index = existingRecords.findIndex((r: any) => r.id === record.id);

    if (index >= 0) {
      existingRecords[index] = record;
    } else {
      existingRecords.push(record);
    }

    await this.keyManager.getStorageManager().storeRecords(record.tableId, existingRecords);
  }

  private async getRecordLocally(recordId: string, tableId: string): Promise<TableRecord | null> {
    const records = await this.keyManager.getStorageManager().getRecords(tableId) || [];
    return records.find((r: any) => r.id === recordId) || null;
  }

  private async deleteRecordLocally(recordId: string, tableId: string): Promise<void> {
    const records = await this.keyManager.getStorageManager().getRecords(tableId) || [];
    const filteredRecords = records.filter((r: any) => r.id !== recordId);
    await this.keyManager.getStorageManager().storeRecords(tableId, filteredRecords);
  }

  private async addToSearchIndex(record: TableRecord, tableConfig: TableConfig): Promise<void> {
    for (const field of tableConfig.fields) {
      if (field.encryption.searchable) {
        const fieldKey = await this.keyManager.getFieldKey(record.tableId, field.name);
        if (fieldKey) {
          await this.searchEngine.addToIndex(
            record.id,
            field.name,
            record.data[field.name],
            field.encryption,
            fieldKey
          );
        }
      }
    }
  }

  private async updateSearchIndex(
    oldRecord: TableRecord,
    newData: Record<string, any>,
    tableConfig: TableConfig
  ): Promise<void> {
    for (const field of tableConfig.fields) {
      if (field.encryption.searchable) {
        const fieldKey = await this.keyManager.getFieldKey(oldRecord.tableId, field.name);
        if (fieldKey) {
          await this.searchEngine.updateIndex(
            oldRecord.id,
            field.name,
            oldRecord.data[field.name],
            newData[field.name],
            field.encryption,
            fieldKey
          );
        }
      }
    }
  }

  private async listRecordsLocally(
    tableId: string,
    options: any
  ): Promise<{ records: TableRecord[]; totalCount: number }> {
    const records = await this.keyManager.getStorageManager().getRecords(tableId) || [];

    // Apply filters, sorting, pagination locally
    let filteredRecords = [...records];

    // Apply filters
    if (options.filters) {
      for (const filter of options.filters) {
        filteredRecords = filteredRecords.filter((record: any) => {
          const value = record.data[filter.field];
          switch (filter.operator) {
            case 'eq':
              return value === filter.value;
            case 'contains':
              return String(value).includes(String(filter.value));
            default:
              return true;
          }
        });
      }
    }

    // Apply sorting
    if (options.sort && options.sort.length > 0) {
      const sortField = options.sort[0].field;
      const direction = options.sort[0].direction;

      filteredRecords.sort((a: any, b: any) => {
        const aVal = a.data[sortField];
        const bVal = b.data[sortField];

        if (aVal < bVal) return direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    const totalCount = filteredRecords.length;

    // Apply pagination
    if (options.offset || options.limit) {
      const start = options.offset || 0;
      const end = options.limit ? start + options.limit : undefined;
      filteredRecords = filteredRecords.slice(start, end);
    }

    return { records: filteredRecords, totalCount };
  }

  /**
   * Bulk create records
   */
  async bulkCreateRecords(
    tableId: string,
    records: Array<{ data: any; createdBy: string }>
  ): Promise<{ records: TableRecord[]; errors: any[] }> {
    const results: TableRecord[] = [];
    const errors: any[] = [];

    for (const recordData of records) {
      try {
        const record = await this.createRecord({
          tableId,
          data: recordData.data,
          createdBy: recordData.createdBy
        });
        results.push(record);
      } catch (error) {
        errors.push({
          data: recordData.data,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    return { records: results, errors };
  }

  /**
   * Bulk update records
   */
  async bulkUpdateRecords(
    updates: Array<{ recordId: string; data: any; updatedBy: string }>
  ): Promise<{ records: TableRecord[]; errors: any[] }> {
    const results: TableRecord[] = [];
    const errors: any[] = [];

    for (const update of updates) {
      try {
        const record = await this.updateRecord(update.recordId, {
          data: update.data,
          updatedBy: update.updatedBy
        });
        results.push(record);
      } catch (error) {
        errors.push({
          recordId: update.recordId,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    return { records: results, errors };
  }

  /**
   * Export records
   */
  async exportRecords(config: ExportConfig): Promise<ExportResult> {
    const tableConfig = await this.getTableConfig(config.tableId);
    if (!tableConfig) {
      throw new Error('Table not found');
    }

    // Get all records with optional filters
    const result = await this.listRecords(config.tableId, {
      filters: config.filters
    });
    let records = result.records;

    // Apply field selection
    if (config.fields && config.fields.length > 0) {
      records = records.map(record => ({
        ...record,
        data: config.fields!.reduce((acc: any, field) => {
          if (record.data[field] !== undefined) {
            acc[field] = record.data[field];
          }
          return acc;
        }, {})
      }));
    }

    // Transform data based on format
    let exportData: any;
    let mimeType: string;
    let fileExtension: string;

    switch (config.format) {
      case 'csv':
        exportData = this.convertToCSV(records, config.includeHeaders);
        mimeType = 'text/csv';
        fileExtension = 'csv';
        break;
      case 'json':
        exportData = JSON.stringify(records, null, 2);
        mimeType = 'application/json';
        fileExtension = 'json';
        break;
      case 'xlsx':
        exportData = await this.convertToXLSX(records, config.includeHeaders);
        mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        fileExtension = 'xlsx';
        break;
      default:
        throw new Error(`Unsupported export format: ${config.format}`);
    }

    return {
      data: exportData,
      mimeType,
      filename: `${tableConfig.name || config.tableId}_${new Date().toISOString().split('T')[0]}.${fileExtension}`,
      recordCount: records.length,
      fieldCount: config.fields.length
    };
  }

  /**
   * Import records
   */
  async importRecords(config: ImportConfig): Promise<{
    records: TableRecord[];
    errors: any[];
    totalCount: number;
  }> {
    const tableConfig = await this.getTableConfig(config.tableId);
    if (!tableConfig) {
      throw new Error('Table not found');
    }

    // Note: In a real implementation, the data would be provided separately
    // For now, this is a placeholder that shows the structure
    const records: any[] = [];

    const results: TableRecord[] = [];
    const errors: any[] = [];

    for (const recordData of records) {
      try {
        // Map fields based on mapping configuration
        const mappedData: any = {};

        for (const mapping of config.mapping) {
          if (recordData[mapping.sourceField] !== undefined) {
            mappedData[mapping.targetField] = recordData[mapping.sourceField];
          }
        }

        const record = await this.createRecord({
          tableId: config.tableId,
          data: mappedData,
          createdBy: 'current-user' // TODO: Get actual user ID
        });
        results.push(record);
      } catch (error) {
        errors.push({
          data: recordData,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    return {
      records: results,
      errors,
      totalCount: records.length
    };
  }

  /**
   * Helper methods for export/import
   */
  private convertToCSV(records: TableRecord[], includeHeaders: boolean): string {
    if (records.length === 0) return '';

    const firstRecord = records[0];
    if (!firstRecord) return '';

    const headers = Object.keys(firstRecord.data);
    const csvRows: string[] = [];

    if (includeHeaders) {
      csvRows.push(headers.join(','));
    }

    for (const record of records) {
      const values = headers.map(header => {
        const value = record.data[header];
        if (value === null || value === undefined) return '';
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return String(value);
      });
      csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
  }

  private async convertToXLSX(records: TableRecord[], includeHeaders: boolean): Promise<ArrayBuffer> {
    // Simple XLSX conversion - in a real implementation, use a library like xlsx
    const headers = includeHeaders && records.length > 0 ? Object.keys(records[0]!.data) : [];
    const data = records.map(record => headers.map(header => record.data[header] || ''));

    // For now, return CSV data as placeholder
    const csvContent = this.convertToCSV(records, includeHeaders);
    return new TextEncoder().encode(csvContent).buffer;
  }

  private parseCSV(csvData: string, includeHeaders: boolean): any[] {
    const lines = csvData.split('\n').filter(line => line.trim());
    if (lines.length === 0) return [];

    const firstLine = lines[0];
    if (!firstLine) return [];

    const headers = includeHeaders ? firstLine.split(',').map(h => h.trim()) : [];
    const dataLines = includeHeaders ? lines.slice(1) : lines;

    return dataLines.map(line => {
      const values = line.split(',').map(v => v.trim().replace(/^"(.*)"$/, '$1'));
      const record: any = {};

      headers.forEach((header, index) => {
        record[header] = values[index] || '';
      });

      return record;
    });
  }

  private async parseXLSX(xlsxData: ArrayBuffer): Promise<any[]> {
    // Simple XLSX parsing - in a real implementation, use a library like xlsx
    // For now, return empty array as placeholder
    return [];
  }
}