import { useState, useEffect, useCallback } from 'react';
import { KeyManager, StorageManager } from '@workspace/encryption-core';
import type { EncryptionType } from '@workspace/encryption-core';

export interface UseEncryptionOptions {
  autoInitialize?: boolean;
  storageConfig?: {
    prefix?: string;
    encryptionEnabled?: boolean;
  };
}

export interface UseEncryptionReturn {
  isInitialized: boolean;
  isReady: boolean;
  isLoading: boolean;
  error: string | null;
  masterPassword: string | null;

  // Actions
  initialize: (password: string) => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  encryptValue: (value: string, fieldType: string, key?: string) => Promise<any>;
  decryptValue: (encryptedData: any, key: string) => Promise<string>;
  validatePassword: (password: string) => Promise<boolean>;

  // Key management
  getTableKey: (tableId: string) => Promise<string | null>;
  getFieldKey: (tableId: string, fieldName: string) => Promise<string | null>;

  // Storage
  clearAllData: () => Promise<void>;
  exportKeys: () => Promise<any>;
  importKeys: (keys: any) => Promise<void>;
}

export function useEncryption(options: UseEncryptionOptions = {}): UseEncryptionReturn {
  const {
    autoInitialize = false,
    storageConfig = {}
  } = options;

  const [isInitialized, setIsInitialized] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [masterPassword, setMasterPassword] = useState<string | null>(null);

  const keyManager = KeyManager.getInstance();
  const storageManager = StorageManager.getInstance(storageConfig);

  // Initialize encryption system
  const initialize = useCallback(async (password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await storageManager.initialize(password);
      await keyManager.initialize(password);

      setIsInitialized(true);
      setIsReady(true);
      setMasterPassword(password);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize encryption';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [keyManager, storageManager]);

  // Change master password
  const changePassword = useCallback(async (oldPassword: string, newPassword: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await storageManager.getStorage().changeMasterPassword(oldPassword, newPassword);
      setMasterPassword(newPassword);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to change password';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [storageManager]);

  // Encrypt a value based on field type
  const encryptValue = useCallback(async (
    value: string,
    fieldType: string,
    key?: string
  ): Promise<any> => {
    if (!isReady) {
      throw new Error('Encryption system not ready');
    }

    try {
      const encryptionType = getEncryptionTypeForFieldType(fieldType);

      switch (encryptionType) {
        case 'AES-256-CBC':
          const { AES256 } = await import('@workspace/encryption-core');
          return await AES256.encrypt(value, key);

        case 'OPE':
          const { OPE } = await import('@workspace/encryption-core');
          if (fieldType === 'INTEGER' || fieldType === 'NUMERIC') {
            return await OPE.encryptNumber(parseFloat(value), key);
          } else if (fieldType === 'DATE' || fieldType === 'DATETIME') {
            return await OPE.encryptDate(new Date(value), key);
          } else if (fieldType === 'TIME') {
            return await OPE.encryptTime(value, key);
          }
          break;

        case 'HMAC-SHA256':
          const { HMAC } = await import('@workspace/encryption-core');
          return await HMAC.hash(value, key);

        default:
          return value; // No encryption
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to encrypt value';
      setError(errorMessage);
      throw err;
    }
  }, [isReady]);

  // Decrypt a value
  const decryptValue = useCallback(async (
    encryptedData: any,
    key: string
  ): Promise<string> => {
    if (!isReady) {
      throw new Error('Encryption system not ready');
    }

    try {
      if (!encryptedData.algorithm) {
        return encryptedData; // Not encrypted
      }

      switch (encryptedData.algorithm) {
        case 'AES-256-CBC':
          const { AES256 } = await import('@workspace/encryption-core');
          return await AES256.decrypt(encryptedData, key);

        case 'OPE':
          // OPE decryption is not straightforward without stored mapping
          throw new Error('OPE decryption requires additional implementation');

        case 'HMAC-SHA256':
          // HMAC is one-way, can't decrypt
          throw new Error('HMAC values cannot be decrypted');

        default:
          return encryptedData;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to decrypt value';
      setError(errorMessage);
      throw err;
    }
  }, [isReady]);

  // Validate password
  const validatePassword = useCallback(async (password: string): Promise<boolean> => {
    try {
      await storageManager.initialize(password);
      return true;
    } catch {
      return false;
    }
  }, [storageManager]);

  // Get table key
  const getTableKey = useCallback(async (tableId: string): Promise<string | null> => {
    if (!isReady) return null;
    const tableKey = await keyManager.getTableKey(tableId);
    return tableKey?.masterKey || null;
  }, [isReady, keyManager]);

  // Get field key
  const getFieldKey = useCallback(async (
    tableId: string,
    fieldName: string
  ): Promise<string | null> => {
    if (!isReady) return null;
    return await keyManager.getFieldKey(tableId, fieldName);
  }, [isReady, keyManager]);

  // Clear all data
  const clearAllData = useCallback(async (): Promise<void> => {
    try {
      storageManager.getStorage().clear();
      keyManager.clearKeys();
      setIsInitialized(false);
      setIsReady(false);
      setMasterPassword(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to clear data';
      setError(errorMessage);
      throw err;
    }
  }, [keyManager, storageManager]);

  // Export keys
  const exportKeys = useCallback(async (): Promise<any> => {
    if (!isReady) {
      throw new Error('Encryption system not ready');
    }

    return await keyManager.exportKeys();
  }, [isReady, keyManager]);

  // Import keys
  const importKeys = useCallback(async (keys: any): Promise<void> => {
    if (!isReady) {
      throw new Error('Encryption system not ready');
    }

    try {
      await keyManager.importKeys(keys);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to import keys';
      setError(errorMessage);
      throw err;
    }
  }, [isReady, keyManager]);

  // Auto-initialize if password is stored
  useEffect(() => {
    if (autoInitialize && !isInitialized) {
      const checkStoredSession = async () => {
        try {
          // Check if there's an existing session
          const hasStoredData = storageManager.getStorage().exists('master_key_hash');
          if (hasStoredData) {
            // Try to initialize without password (existing session)
            await storageManager.initialize();
            setIsInitialized(true);
            setIsReady(true);
          }
        } catch (err) {
          // No existing session or invalid session
          console.log('No existing encryption session found');
        }
      };

      checkStoredSession();
    }
  }, [autoInitialize, isInitialized, storageManager]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clear sensitive data from memory
      if (keyManager) {
        keyManager.clearKeys();
      }
    };
  }, [keyManager]);

  return {
    isInitialized,
    isReady,
    isLoading,
    error,
    masterPassword,

    initialize,
    changePassword,
    encryptValue,
    decryptValue,
    validatePassword,

    getTableKey,
    getFieldKey,

    clearAllData,
    exportKeys,
    importKeys
  };
}

// Helper function to get encryption type for field type
function getEncryptionTypeForFieldType(fieldType: string): EncryptionType {
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
