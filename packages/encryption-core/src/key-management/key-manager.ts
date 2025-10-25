import { AES256 } from '../algorithms/aes-256';
import { StorageManager } from '../storage/storage-manager';
import type { EncryptionKey, EncryptionType } from '../types';
import { E2EE } from './e2ee';

export interface TableKey {
  tableId: string;
  masterKey: string;
  fieldKeys: Record<string, string>;
  createdAt: Date;
  version: string;
  e2eeEnabled: boolean;
}

export interface WorkspaceKey {
  workspaceId: string;
  encryptedKey: string;
  salt: string;
  iv: string;
  createdAt: Date;
}

export class KeyManager {
  private static instance: KeyManager;
  private storageManager: StorageManager;

  /**
   * Get storage manager instance
   */
  getStorageManager(): StorageManager {
    return this.storageManager;
  }
  private masterKey: string | null = null;
  private workspaceKeys: Map<string, WorkspaceKey> = new Map();
  private tableKeys: Map<string, TableKey> = new Map();

  private constructor() {
    this.storageManager = StorageManager.getInstance();
  }

  static getInstance(): KeyManager {
    if (!KeyManager.instance) {
      KeyManager.instance = new KeyManager();
    }
    return KeyManager.instance;
  }

  /**
   * Initialize key manager with master password
   */
  async initialize(masterPassword: string): Promise<void> {
    // Derive master key from password
    const { key } = await AES256.deriveKeyFromPassword(masterPassword);
    this.masterKey = key;

    // Load existing keys from storage
    await this.loadKeysFromStorage();
  }

  /**
   * Create workspace key
   */
  async createWorkspaceKey(workspaceId: string): Promise<WorkspaceKey> {
    if (!this.masterKey) {
      throw new Error('Key manager not initialized');
    }

    const workspaceKey = AES256.generateKey();
    const salt = AES256.generateIV();
    const iv = AES256.generateIV();

    // Encrypt workspace key with master key
    const encryptedData = await AES256.encrypt(workspaceKey, this.masterKey);

    const workspaceKeyData: WorkspaceKey = {
      workspaceId,
      encryptedKey: encryptedData.data,
      salt: encryptedData.salt || salt,
      iv: encryptedData.iv || iv,
      createdAt: new Date()
    };

    // Store in memory and persistent storage
    this.workspaceKeys.set(workspaceId, workspaceKeyData);
    await this.saveWorkspaceKey(workspaceKeyData);

    return workspaceKeyData;
  }

  /**
   * Get workspace key
   */
  async getWorkspaceKey(workspaceId: string): Promise<string | null> {
    if (!this.masterKey) {
      throw new Error('Key manager not initialized');
    }

    // Check memory first
    const workspaceKeyData = this.workspaceKeys.get(workspaceId);
    if (!workspaceKeyData) {
      // Try to load from storage
      await this.loadWorkspaceKey(workspaceId);
    }

    const keyData = this.workspaceKeys.get(workspaceId);
    if (!keyData) {
      return null;
    }

    // Decrypt workspace key
    const encryptedData = {
      data: keyData.encryptedKey,
      iv: keyData.iv,
      salt: keyData.salt,
      algorithm: 'AES-256-CBC' as EncryptionType
    };

    const decryptedKey = await AES256.decrypt(encryptedData, this.masterKey);
    return decryptedKey;
  }

  /**
   * Create table key
   */
  async createTableKey(
    tableId: string,
    workspaceId: string,
    fieldTypes: Record<string, string>,
    e2eeEnabled: boolean = false
  ): Promise<TableKey> {
    const workspaceKey = await this.getWorkspaceKey(workspaceId);
    if (!workspaceKey) {
      throw new Error('Workspace key not found');
    }

    const tableMasterKey = AES256.generateKey();
    const fieldKeys: Record<string, string> = {};

    // Generate separate key for each field that needs encryption
    for (const [fieldName, fieldType] of Object.entries(fieldTypes)) {
      const encryptionType = this.getEncryptionTypeForFieldType(fieldType);
      if (encryptionType !== 'NONE') {
        fieldKeys[fieldName] = this.generateFieldKey(tableMasterKey, fieldName, encryptionType);
      }
    }

    const tableKeyData: TableKey = {
      tableId,
      masterKey: tableMasterKey,
      fieldKeys,
      createdAt: new Date(),
      version: '1.0',
      e2eeEnabled
    };

    // Store in memory and persistent storage
    this.tableKeys.set(tableId, tableKeyData);
    await this.saveTableKey(tableKeyData);

    return tableKeyData;
  }

  /**
   * Get table key
   */
  async getTableKey(tableId: string): Promise<TableKey | null> {
    // Check memory first
    const tableKey = this.tableKeys.get(tableId);
    if (tableKey) {
      return tableKey;
    }

    // Load from storage
    await this.loadTableKey(tableId);
    return this.tableKeys.get(tableId) || null;
  }

  /**
   * Get field key for encryption
   */
  async getFieldKey(tableId: string, fieldName: string): Promise<string | null> {
    const tableKey = await this.getTableKey(tableId);
    if (!tableKey) {
      return null;
    }

    return tableKey.fieldKeys[fieldName] || null;
  }

  /**
   * Rotate table key
   */
  async rotateTableKey(tableId: string): Promise<void> {
    const tableKey = await this.getTableKey(tableId);
    if (!tableKey) {
      throw new Error('Table key not found');
    }

    // Create new table key
    const newMasterKey = AES256.generateKey();
    const newFieldKeys: Record<string, string> = {};

    // Re-generate field keys with new master key
    for (const fieldName of Object.keys(tableKey.fieldKeys)) {
      newFieldKeys[fieldName] = this.generateFieldKey(newMasterKey, fieldName, 'AES-256-CBC');
    }

    // Update table key
    const updatedTableKey: TableKey = {
      ...tableKey,
      masterKey: newMasterKey,
      fieldKeys: newFieldKeys,
      version: this.incrementVersion(tableKey.version)
    };

    this.tableKeys.set(tableId, updatedTableKey);
    await this.saveTableKey(updatedTableKey);

    // Note: Actual data re-encryption should be handled by the caller
  }

  /**
   * Delete table key
   */
  async deleteTableKey(tableId: string): Promise<void> {
    this.tableKeys.delete(tableId);

    // Remove from storage
    const allTableKeys = await this.storageManager.getStorage().get<Record<string, TableKey>>('table_keys');
    if (allTableKeys && allTableKeys[tableId]) {
      delete allTableKeys[tableId];
      await this.storageManager.getStorage().set('table_keys', allTableKeys);
    }
  }

  /**
   * Get all table IDs for a workspace
   */
  async getTableIdsForWorkspace(workspaceId: string): Promise<string[]> {
    const tableIds: string[] = [];

    for (const tableKey of this.tableKeys.values()) {
      // This would require storing workspaceId in TableKey or having a separate mapping
      // For now, return all table IDs
      tableIds.push(tableKey.tableId);
    }

    return tableIds;
  }

  /**
   * Validate key integrity
   */
  async validateKeyIntegrity(): Promise<boolean> {
    try {
      // Test master key by encrypting/decrypting test data
      if (!this.masterKey) return false;

      const testData = 'key-integrity-test';
      const encrypted = await AES256.encrypt(testData, this.masterKey);
      const decrypted = await AES256.decrypt(encrypted, this.masterKey);

      return decrypted === testData;
    } catch (error) {
      console.error('Key integrity validation failed:', error);
      return false;
    }
  }

  /**
   * Export keys for backup
   */
  async exportKeys(): Promise<{
    workspaceKeys: Record<string, WorkspaceKey>;
    tableKeys: Record<string, TableKey>;
    metadata: any;
  }> {
    const workspaceKeys: Record<string, WorkspaceKey> = {};
    const tableKeys: Record<string, TableKey> = {};

    for (const [id, key] of this.workspaceKeys) {
      workspaceKeys[id] = { ...key };
    }

    for (const [id, key] of this.tableKeys) {
      tableKeys[id] = { ...key };
    }

    return {
      workspaceKeys,
      tableKeys,
      metadata: {
        exportedAt: new Date().toISOString(),
        version: '1.0',
        workspaceCount: Object.keys(workspaceKeys).length,
        tableCount: Object.keys(tableKeys).length
      }
    };
  }

  /**
   * Import keys from backup
   */
  async importKeys(backup: {
    workspaceKeys: Record<string, WorkspaceKey>;
    tableKeys: Record<string, TableKey>;
    metadata?: any;
  }): Promise<void> {
    // Validate backup structure
    if (!backup.workspaceKeys || !backup.tableKeys) {
      throw new Error('Invalid backup format');
    }

    // Import workspace keys
    for (const [id, key] of Object.entries(backup.workspaceKeys)) {
      this.workspaceKeys.set(id, key);
      await this.saveWorkspaceKey(key);
    }

    // Import table keys
    for (const [id, key] of Object.entries(backup.tableKeys)) {
      this.tableKeys.set(id, key);
      await this.saveTableKey(key);
    }
  }

  /**
   * Clear all keys from memory
   */
  clearKeys(): void {
    this.workspaceKeys.clear();
    this.tableKeys.clear();
    this.masterKey = null;
  }

  /**
   * Get encryption type for field type
   */
  private getEncryptionTypeForFieldType(fieldType: string): EncryptionType {
    const encryptionMap: Record<string, EncryptionType> = {
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
      'SELECT_LIST': 'HMAC-SHA256',
      'SELECT_*_RECORD': 'NONE',
      'SELECT_*_WORKSPACE_USER': 'NONE'
    };

    return encryptionMap[fieldType] || 'NONE';
  }

  /**
   * Generate field key
   */
  private generateFieldKey(masterKey: string, fieldName: string, encryptionType: EncryptionType): string {
    // Derive field key from master key and field name
    const encoder = new TextEncoder();
    const data = encoder.encode(`${masterKey}:${fieldName}:${encryptionType}`);
    return Array.from(new Uint8Array(data))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
      .substring(0, 64); // Ensure 64-character hex string
  }

  /**
   * Increment version number
   */
  private incrementVersion(version: string): string {
    const parts = version.split('.');
    const patch = parseInt(parts[2] || '0') + 1;
    return `${parts[0]}.${parts[1]}.${patch}`;
  }

  /**
   * Load keys from storage
   */
  private async loadKeysFromStorage(): Promise<void> {
    // Load workspace keys
    const workspaceKeysData = await this.storageManager.getStorage().get<Record<string, WorkspaceKey>>('workspace_keys');
    if (workspaceKeysData) {
      for (const [id, key] of Object.entries(workspaceKeysData)) {
        this.workspaceKeys.set(id, key as WorkspaceKey);
      }
    }

    // Load table keys
    const tableKeysData = await this.storageManager.getStorage().get<Record<string, TableKey>>('table_keys');
    if (tableKeysData) {
      for (const [id, key] of Object.entries(tableKeysData)) {
        this.tableKeys.set(id, key as TableKey);
      }
    }
  }

  /**
   * Save workspace key to storage
   */
  private async saveWorkspaceKey(workspaceKey: WorkspaceKey): Promise<void> {
    const allWorkspaceKeys = await this.storageManager.getStorage().get<Record<string, WorkspaceKey>>('workspace_keys') || {};
    allWorkspaceKeys[workspaceKey.workspaceId] = workspaceKey;
    await this.storageManager.getStorage().set('workspace_keys', allWorkspaceKeys);
  }

  /**
   * Save table key to storage
   */
  private async saveTableKey(tableKey: TableKey): Promise<void> {
    const allTableKeys = await this.storageManager.getStorage().get<Record<string, TableKey>>('table_keys') || {};
    allTableKeys[tableKey.tableId] = tableKey;
    await this.storageManager.getStorage().set('table_keys', allTableKeys);
  }

  /**
   * Load workspace key from storage
   */
  private async loadWorkspaceKey(workspaceId: string): Promise<void> {
    const allWorkspaceKeys = await this.storageManager.getStorage().get<Record<string, WorkspaceKey>>('workspace_keys');
    if (allWorkspaceKeys && allWorkspaceKeys[workspaceId]) {
      this.workspaceKeys.set(workspaceId, allWorkspaceKeys[workspaceId]);
    }
  }

  /**
   * Load table key from storage
   */
  private async loadTableKey(tableId: string): Promise<void> {
    const allTableKeys = await this.storageManager.getStorage().get<Record<string, TableKey>>('table_keys');
    if (allTableKeys && allTableKeys[tableId]) {
      this.tableKeys.set(tableId, allTableKeys[tableId]);
    }
  }
  /**
   * Compute encryptionAuthKey from a raw encryptionKey
   */
  computeEncryptionAuthKey(encryptionKey: string): string {
    return E2EE.computeEncryptionAuthKey(encryptionKey);
  }

  /**
   * Verify encryptionKey against encryptionAuthKey (E2EE handshake)
   */
  verifyEncryptionKey(encryptionKey: string, encryptionAuthKey: string): boolean {
    return E2EE.verifyEncryptionKey(encryptionKey, encryptionAuthKey);
  }
}