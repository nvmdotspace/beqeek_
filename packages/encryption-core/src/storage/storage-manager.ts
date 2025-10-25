import { SecureStorage } from './secure-storage';
import type { StorageConfig } from '../types';

export class StorageManager {
  private static instance: StorageManager;
  private storage: SecureStorage;

  private constructor(config?: Partial<StorageConfig>) {
    this.storage = SecureStorage.getInstance(config);
  }

  static getInstance(config?: Partial<StorageConfig>): StorageManager {
    if (!StorageManager.instance) {
      StorageManager.instance = new StorageManager(config);
    }
    return StorageManager.instance;
  }

  /**
   * Get the underlying SecureStorage instance
   */
  getStorage(): SecureStorage {
    return this.storage;
  }

  /**
   * Initialize storage with password
   */
  async initialize(password?: string): Promise<void> {
    await this.storage.initialize(password);
  }

  /**
   * Store encryption keys
   */
  async storeKeys(keys: Record<string, string>): Promise<void> {
    await this.storage.set('encryption_keys', keys);
  }

  /**
   * Retrieve encryption keys
   */
  async getKeys(): Promise<Record<string, string> | null> {
    return await this.storage.get<Record<string, string>>('encryption_keys');
  }

  /**
   * Store table configuration
   */
  async storeTableConfig(tableId: string, config: any): Promise<void> {
    const allConfigs = (await this.storage.get<Record<string, any>>('table_configs')) || {};
    allConfigs[tableId] = config;
    await this.storage.set('table_configs', allConfigs);
  }

  /**
   * Retrieve table configuration
   */
  async getTableConfig(tableId: string): Promise<any | null> {
    const allConfigs = await this.storage.get<Record<string, any>>('table_configs');
    return allConfigs?.[tableId] || null;
  }

  /**
   * Store encrypted records
   */
  async storeRecords(tableId: string, records: any[]): Promise<void> {
    const allRecords = (await this.storage.get<Record<string, any[]>>('encrypted_records')) || {};
    allRecords[tableId] = records;
    await this.storage.set('encrypted_records', allRecords);
  }

  /**
   * Retrieve encrypted records
   */
  async getRecords(tableId: string): Promise<any[] | null> {
    const allRecords = await this.storage.get<Record<string, any[]>>('encrypted_records');
    return allRecords?.[tableId] || null;
  }

  /**
   * Store search indexes
   */
  async storeSearchIndexes(tableId: string, indexes: Record<string, string[]>): Promise<void> {
    const allIndexes = (await this.storage.get<Record<string, Record<string, string[]>>>('search_indexes')) || {};
    allIndexes[tableId] = indexes;
    await this.storage.set('search_indexes', allIndexes);
  }

  /**
   * Retrieve search indexes
   */
  async getSearchIndexes(tableId: string): Promise<Record<string, string[]> | null> {
    const allIndexes = await this.storage.get<Record<string, Record<string, string[]>>>('search_indexes');
    return allIndexes?.[tableId] || null;
  }

  /**
   * Store user preferences
   */
  async storeUserPreferences(preferences: Record<string, any>): Promise<void> {
    await this.storage.set('user_preferences', preferences);
  }

  /**
   * Retrieve user preferences
   */
  async getUserPreferences(): Promise<Record<string, any> | null> {
    return await this.storage.get<Record<string, any>>('user_preferences');
  }

  /**
   * Clear all data for a specific table
   */
  async clearTableData(tableId: string): Promise<void> {
    // Remove table records
    const allRecords = await this.storage.get<Record<string, any[]>>('encrypted_records');
    if (allRecords?.[tableId]) {
      delete allRecords[tableId];
      await this.storage.set('encrypted_records', allRecords);
    }

    // Remove table configuration
    const allConfigs = await this.storage.get<Record<string, any>>('table_configs');
    if (allConfigs?.[tableId]) {
      delete allConfigs[tableId];
      await this.storage.set('table_configs', allConfigs);
    }

    // Remove search indexes
    const allIndexes = await this.storage.get<Record<string, Record<string, string[]>>>('search_indexes');
    if (allIndexes?.[tableId]) {
      delete allIndexes[tableId];
      await this.storage.set('search_indexes', allIndexes);
    }
  }

  /**
   * Get all table IDs
   */
  async getTableIds(): Promise<string[]> {
    const allRecords = await this.storage.get<Record<string, any[]>>('encrypted_records');
    return Object.keys(allRecords || {});
  }

  /**
   * Backup all data
   */
  async backupAll(): Promise<Record<string, any>> {
    const data = await this.storage.exportData();

    // Add metadata
    const backup = {
      data,
      metadata: {
        version: '1.0',
        timestamp: new Date().toISOString(),
        tableIds: await this.getTableIds(),
        storageStats: this.storage.getStorageStats()
      }
    };

    return backup;
  }

  /**
   * Restore all data
   */
  async restoreAll(backup: Record<string, any>): Promise<void> {
    if (!backup.data) {
      throw new Error('Invalid backup format');
    }

    await this.storage.importData(backup.data);
  }

  /**
   * Get storage summary
   */
  async getStorageSummary(): Promise<{
    tableCount: number;
    totalRecords: number;
    storageStats: any;
    tableIds: string[];
  }> {
    const tableIds = await this.getTableIds();
    let totalRecords = 0;

    for (const tableId of tableIds) {
      const records = await this.getRecords(tableId);
      totalRecords += records?.length || 0;
    }

    return {
      tableCount: tableIds.length,
      totalRecords,
      storageStats: this.storage.getStorageStats(),
      tableIds
    };
  }

  /**
   * Migrate data from old storage format
   */
  async migrateFromOldFormat(): Promise<void> {
    // Check for old format data
    const oldKeys = ['old_table_data', 'old_encrypted_data', 'old_keys'];

    for (const oldKey of oldKeys) {
      if (this.storage.exists(oldKey)) {
        const oldData = await this.storage.get(oldKey);
        if (oldData) {
          // Process and migrate old data
          console.log(`Migrating data from ${oldKey}`);
          // Add migration logic here
          this.storage.remove(oldKey);
        }
      }
    }
  }

  /**
   * Perform storage maintenance
   */
  async performMaintenance(): Promise<{
    cleanedUp: string[];
    errors: string[];
    summary: any;
  }> {
    const cleanedUp: string[] = [];
    const errors: string[] = [];

    try {
      // Check for orphaned data
      const allKeys = this.storage.getAllKeys();
      const tableIds = await this.getTableIds();

      // Clean up records for tables that no longer exist
      const allRecords = await this.storage.get<Record<string, any[]>>('encrypted_records');
      if (allRecords) {
        for (const tableId of Object.keys(allRecords)) {
          if (!tableIds.includes(tableId)) {
            await this.clearTableData(tableId);
            cleanedUp.push(`Cleaned up orphaned table: ${tableId}`);
          }
        }
      }

      // Check storage quota
      const stats = this.storage.getStorageStats();
      const usagePercent = (stats.usedSpace / stats.totalSpace) * 100;

      if (usagePercent > 80) {
        cleanedUp.push(`Storage usage is high: ${usagePercent.toFixed(2)}%`);
        // Add cleanup logic here
      }

      const summary = await this.getStorageSummary();

      return {
        cleanedUp,
        errors,
        summary
      };
    } catch (error) {
      errors.push(`Maintenance error: ${error}`);
      throw error;
    }
  }
}