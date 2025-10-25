import { useState, useEffect, useCallback } from 'react';
import { SecureStorage, StorageManager } from '@workspace/encryption-core';

export interface UseLocalStorageOptions {
  storageKey: string;
  defaultValue?: any;
  encryptionEnabled?: boolean;
}

export interface UseLocalStorageReturn {
  value: any;
  isLoading: boolean;
  error: string | null;

  // Actions
  setValue: (value: any) => Promise<void>;
  removeValue: () => Promise<void>;
  clearAll: () => Promise<void>;
}

export function useLocalStorage(options: UseLocalStorageOptions): UseLocalStorageReturn {
  const {
    storageKey,
    defaultValue,
    encryptionEnabled = true
  } = options;

  const [value, setValueState] = useState(defaultValue);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const storage = SecureStorage.getInstance({
    encryptionEnabled
  });

  // Load value from storage
  const loadValue = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const storedValue = await storage.get(storageKey);
      setValueState(storedValue !== null ? storedValue : defaultValue);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load from storage';
      setError(errorMessage);
      setValueState(defaultValue);
    } finally {
      setIsLoading(false);
    }
  }, [storage, storageKey, defaultValue]);

  // Save value to storage
  const setValue = useCallback(async (newValue: any) => {
    setError(null);

    try {
      await storage.set(storageKey, newValue);
      setValueState(newValue);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save to storage';
      setError(errorMessage);
      throw err;
    }
  }, [storage, storageKey]);

  // Remove value from storage
  const removeValue = useCallback(async () => {
    setError(null);

    try {
      storage.remove(storageKey);
      setValueState(defaultValue);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove from storage';
      setError(errorMessage);
      throw err;
    }
  }, [storage, storageKey, defaultValue]);

  // Clear all storage
  const clearAll = useCallback(async () => {
    setError(null);

    try {
      storage.clear();
      setValueState(defaultValue);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to clear storage';
      setError(errorMessage);
      throw err;
    }
  }, [storage, defaultValue]);

  // Load value on mount
  useEffect(() => {
    loadValue();
  }, [loadValue]);

  return {
    value,
    isLoading,
    error,
    setValue,
    removeValue,
    clearAll
  };
}

// Hook for storage manager (higher level operations)
export function useStorageManager() {
  const [storageManager] = useState(() => StorageManager.getInstance());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const storeTableConfig = useCallback(async (tableId: string, config: any) => {
    setIsLoading(true);
    setError(null);

    try {
      await storageManager.storeTableConfig(tableId, config);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to store table config';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [storageManager]);

  const getTableConfig = useCallback(async (tableId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const config = await storageManager.getTableConfig(tableId);
      return config;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get table config';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [storageManager]);

  const storeRecords = useCallback(async (tableId: string, records: any[]) => {
    setIsLoading(true);
    setError(null);

    try {
      await storageManager.storeRecords(tableId, records);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to store records';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [storageManager]);

  const getRecords = useCallback(async (tableId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const records = await storageManager.getRecords(tableId);
      return records;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get records';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [storageManager]);

  const clearTableData = useCallback(async (tableId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await storageManager.clearTableData(tableId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to clear table data';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [storageManager]);

  const backupAll = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const backup = await storageManager.backupAll();
      return backup;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to backup data';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [storageManager]);

  const restoreAll = useCallback(async (backup: any) => {
    setIsLoading(true);
    setError(null);

    try {
      await storageManager.restoreAll(backup);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to restore data';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [storageManager]);

  return {
    storageManager,
    isLoading,
    error,

    storeTableConfig,
    getTableConfig,
    storeRecords,
    getRecords,
    clearTableData,
    backupAll,
    restoreAll
  };
}
