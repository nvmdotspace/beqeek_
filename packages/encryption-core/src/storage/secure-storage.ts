import { AES256 } from '../algorithms/aes-256';
import type { StorageConfig } from '../types';

export class SecureStorage {
  private static instance: SecureStorage;
  private config: StorageConfig;
  private masterKey: string | null = null;
  private isInitialized: boolean = false;

  private constructor(config: Partial<StorageConfig> = {}) {
    this.config = {
      prefix: 'beqeek_',
      encryptionEnabled: true,
      compressionEnabled: false,
      ...config
    };
  }

  static getInstance(config?: Partial<StorageConfig>): SecureStorage {
    if (!SecureStorage.instance) {
      SecureStorage.instance = new SecureStorage(config);
    }
    return SecureStorage.instance;
  }

  /**
   * Initialize secure storage with master key
   */
  async initialize(masterPassword?: string): Promise<void> {
    if (this.isInitialized) return;

    if (masterPassword) {
      // Derive key from password
      const { key } = await AES256.deriveKeyFromPassword(masterPassword);
      this.masterKey = key;

      // Store key hash for authentication
      const keyHash = await this.hashKey(key);
      localStorage.setItem(this.getKeyName('master_key_hash'), keyHash);
    } else {
      // Check if existing key hash exists
      const existingHash = localStorage.getItem(this.getKeyName('master_key_hash'));
      if (!existingHash) {
        throw new Error('No master password provided and no existing session found');
      }
    }

    this.isInitialized = true;
  }

  /**
   * Store data securely
   */
  async set(key: string, data: any): Promise<void> {
    this.ensureInitialized();

    const storageKey = this.getKeyName(key);
    const serialized = JSON.stringify(data);

    try {
      if (this.config.encryptionEnabled && this.masterKey) {
        const encrypted = await AES256.encrypt(serialized, this.masterKey);
        localStorage.setItem(storageKey, JSON.stringify(encrypted));
      } else {
        localStorage.setItem(storageKey, serialized);
      }
    } catch (error) {
      throw new Error(`Failed to store secure data: ${error}`);
    }
  }

  /**
   * Retrieve data securely
   */
  async get<T>(key: string): Promise<T | null> {
    this.ensureInitialized();

    const storageKey = this.getKeyName(key);
    const stored = localStorage.getItem(storageKey);

    if (!stored) return null;

    try {
      if (this.config.encryptionEnabled && this.masterKey) {
        const encryptedData = JSON.parse(stored);
        const decrypted = await AES256.decrypt(encryptedData, this.masterKey);
        return JSON.parse(decrypted) as T;
      } else {
        return JSON.parse(stored) as T;
      }
    } catch (error) {
      console.warn(`Failed to retrieve secure data for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Remove data from storage
   */
  remove(key: string): void {
    const storageKey = this.getKeyName(key);
    localStorage.removeItem(storageKey);
  }

  /**
   * Check if key exists
   */
  exists(key: string): boolean {
    const storageKey = this.getKeyName(key);
    return localStorage.getItem(storageKey) !== null;
  }

  /**
   * Get all storage keys with prefix
   */
  getAllKeys(): string[] {
    const prefix = this.config.prefix;
    const keys: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        // Remove prefix to return clean key names
        keys.push(key.substring(prefix.length));
      }
    }

    return keys;
  }

  /**
   * Clear all secure storage data
   */
  clear(): void {
    const keys = this.getAllKeys();
    for (const key of keys) {
      this.remove(key);
    }
  }

  /**
   * Change master password
   */
  async changeMasterPassword(oldPassword: string, newPassword: string): Promise<void> {
    // Verify old password
    const tempKey = await AES256.deriveKeyFromPassword(oldPassword);
    const oldKeyHash = await this.hashKey(tempKey.key);
    const storedHash = localStorage.getItem(this.getKeyName('master_key_hash'));

    if (oldKeyHash !== storedHash) {
      throw new Error('Invalid old password');
    }

    // Get all current data
    const keys = this.getAllKeys();
    const currentData: Record<string, any> = {};

    for (const key of keys) {
      if (key !== 'master_key_hash') {
        const data = await this.get(key);
        if (data !== null) {
          currentData[key] = data;
        }
      }
    }

    // Clear storage
    this.clear();

    // Initialize with new password
    await this.initialize(newPassword);

    // Re-encrypt and store all data with new key
    for (const [key, data] of Object.entries(currentData)) {
      await this.set(key, data);
    }
  }

  /**
   * Export encrypted data for backup
   */
  async exportData(): Promise<Record<string, string>> {
    const keys = this.getAllKeys();
    const exportData: Record<string, string> = {};

    for (const key of keys) {
      const storageKey = this.getKeyName(key);
      const data = localStorage.getItem(storageKey);
      if (data) {
        exportData[key] = data;
      }
    }

    return exportData;
  }

  /**
   * Import encrypted data from backup
   */
  async importData(data: Record<string, string>): Promise<void> {
    for (const [key, value] of Object.entries(data)) {
      const storageKey = this.getKeyName(key);
      localStorage.setItem(storageKey, value);
    }
  }

  /**
   * Get storage usage statistics
   */
  getStorageStats(): {
    usedSpace: number;
    totalSpace: number;
    keyCount: number;
    encryptionEnabled: boolean;
  } {
    const keys = this.getAllKeys();
    let usedSpace = 0;

    for (const key of keys) {
      const storageKey = this.getKeyName(key);
      const data = localStorage.getItem(storageKey);
      if (data) {
        usedSpace += data.length;
      }
    }

    // Rough estimate of localStorage limit (varies by browser)
    const totalSpace = 5 * 1024 * 1024; // 5MB typical limit

    return {
      usedSpace,
      totalSpace,
      keyCount: keys.length,
      encryptionEnabled: this.config.encryptionEnabled
    };
  }

  /**
   * Securely clear sensitive data from memory
   */
  secureClear(): void {
    this.masterKey = null;
    this.isInitialized = false;
  }

  /**
   * Check if storage is properly initialized
   */
  isReady(): boolean {
    return this.isInitialized && this.masterKey !== null;
  }

  /**
   * Get the prefixed key name
   */
  private getKeyName(key: string): string {
    return `${this.config.prefix}${key}`;
  }

  /**
   * Ensure storage is initialized
   */
  private ensureInitialized(): void {
    if (!this.isInitialized) {
      throw new Error('SecureStorage not initialized. Call initialize() first.');
    }
  }

  /**
   * Hash key for authentication
   */
  private async hashKey(key: string): Promise<string> {
    // Simple hash for key verification (not for encryption)
    const encoder = new TextEncoder();
    const data = encoder.encode(key);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Handle storage quota exceeded
   */
  private handleQuotaExceeded(): void {
    // Clean up old or less important data
    const keys = this.getAllKeys();
    const priorityKeys = ['master_key_hash', 'workspace_keys', 'table_keys'];

    for (const key of keys) {
      if (!priorityKeys.includes(key)) {
        this.remove(key);
        console.log(`Cleaned up key: ${key}`);
        break;
      }
    }
  }
}
