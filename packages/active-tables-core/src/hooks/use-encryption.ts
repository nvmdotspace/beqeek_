/**
 * useEncryption Hook
 *
 * React hook for managing encryption state and operations
 * Wraps encryption utilities with React state management
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import {
  decryptFieldValue,
  decryptRecord,
  decryptRecords,
  validateEncryptionKey,
  isValidEncryptionKey,
  getEncryptionKeyStorageKey,
} from '../utils/index.js';
import type { FieldConfig } from '../types/field.js';
import type { TableRecord } from '../types/record.js';
import type { Table } from '../types/common.js';

// ============================================
// Types
// ============================================

export interface UseEncryptionOptions {
  /** Workspace ID (for localStorage key) */
  workspaceId?: string;

  /** Table ID (for localStorage key) */
  tableId?: string;

  /** Encryption auth key (for validation) */
  encryptionAuthKey?: string;

  /** Auto-load key from localStorage on mount */
  autoLoad?: boolean;
}

export interface UseEncryptionReturn {
  // State
  encryptionKey: string | null;
  isReady: boolean;
  isValid: boolean;
  error: string | null;

  // Actions
  setEncryptionKey: (key: string) => void;
  clearEncryptionKey: () => void;
  loadEncryptionKey: () => void;
  saveEncryptionKey: (key: string) => void;
  validateKey: (key: string) => boolean;

  // Decryption operations
  decryptField: (value: unknown, field: FieldConfig) => Promise<unknown>;
  decryptSingleRecord: (record: TableRecord, fields: FieldConfig[]) => Promise<TableRecord>;
  decryptMultipleRecords: (records: TableRecord[], fields: FieldConfig[]) => Promise<TableRecord[]>;
}

// ============================================
// Hook
// ============================================

/**
 * Hook for managing encryption and decryption operations
 *
 * @example
 * ```tsx
 * const {
 *   encryptionKey,
 *   isReady,
 *   setEncryptionKey,
 *   decryptSingleRecord
 * } = useEncryption({
 *   workspaceId: 'workspace-1',
 *   tableId: 'table-1',
 *   encryptionAuthKey: 'auth-key-hash',
 *   autoLoad: true
 * });
 *
 * // Set encryption key
 * setEncryptionKey('my-32-char-encryption-key-here');
 *
 * // Decrypt a record
 * const decrypted = await decryptSingleRecord(record, fields);
 * ```
 */
export function useEncryption(options: UseEncryptionOptions = {}): UseEncryptionReturn {
  const { workspaceId, tableId, encryptionAuthKey, autoLoad = false } = options;

  // State
  const [encryptionKey, setEncryptionKeyState] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Derived state
  const isReady = !!encryptionKey && isValid;

  // Get localStorage key
  const storageKey = workspaceId && tableId ? getEncryptionKeyStorageKey(workspaceId, tableId) : null;

  // Load key from localStorage
  const loadEncryptionKey = useCallback(() => {
    if (!storageKey) return;

    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        setEncryptionKeyState(stored);

        // Validate if auth key provided
        if (encryptionAuthKey) {
          const valid = validateEncryptionKey(stored, encryptionAuthKey);
          setIsValid(valid);
          if (!valid) {
            setError('Invalid encryption key');
          }
        } else {
          setIsValid(isValidEncryptionKey(stored));
        }
      }
    } catch (err) {
      setError('Failed to load encryption key');
      console.error('Failed to load encryption key:', err);
    }
  }, [storageKey, encryptionAuthKey]);

  // Save key to localStorage
  const saveEncryptionKey = useCallback(
    (key: string) => {
      if (!storageKey) return;

      try {
        localStorage.setItem(storageKey, key);
        setEncryptionKeyState(key);

        // Validate
        if (encryptionAuthKey) {
          const valid = validateEncryptionKey(key, encryptionAuthKey);
          setIsValid(valid);
          if (!valid) {
            setError('Invalid encryption key');
          } else {
            setError(null);
          }
        } else {
          setIsValid(isValidEncryptionKey(key));
          setError(null);
        }
      } catch (err) {
        setError('Failed to save encryption key');
        console.error('Failed to save encryption key:', err);
      }
    },
    [storageKey, encryptionAuthKey],
  );

  // Set encryption key (in-memory only)
  const setEncryptionKey = useCallback(
    (key: string) => {
      setEncryptionKeyState(key);

      // Validate
      if (encryptionAuthKey) {
        const valid = validateEncryptionKey(key, encryptionAuthKey);
        setIsValid(valid);
        if (!valid) {
          setError('Invalid encryption key');
        } else {
          setError(null);
        }
      } else {
        setIsValid(isValidEncryptionKey(key));
        setError(null);
      }
    },
    [encryptionAuthKey],
  );

  // Clear encryption key
  const clearEncryptionKey = useCallback(() => {
    if (storageKey) {
      try {
        localStorage.removeItem(storageKey);
      } catch (err) {
        console.error('Failed to clear encryption key:', err);
      }
    }
    setEncryptionKeyState(null);
    setIsValid(false);
    setError(null);
  }, [storageKey]);

  // Validate key
  const validateKey = useCallback(
    (key: string) => {
      if (encryptionAuthKey) {
        return validateEncryptionKey(key, encryptionAuthKey);
      }
      return isValidEncryptionKey(key);
    },
    [encryptionAuthKey],
  );

  // Decryption operations (only if key is ready)
  const decryptField = useCallback(
    async (value: unknown, field: FieldConfig): Promise<unknown> => {
      if (!encryptionKey) {
        throw new Error('Encryption key not set');
      }
      return decryptFieldValue(value, field, encryptionKey);
    },
    [encryptionKey],
  );

  const decryptSingleRecord = useCallback(
    async (record: TableRecord, fields: FieldConfig[]): Promise<TableRecord> => {
      if (!encryptionKey) {
        throw new Error('Encryption key not set');
      }
      return decryptRecord(record, fields, encryptionKey);
    },
    [encryptionKey],
  );

  const decryptMultipleRecords = useCallback(
    async (records: TableRecord[], fields: FieldConfig[]): Promise<TableRecord[]> => {
      if (!encryptionKey) {
        throw new Error('Encryption key not set');
      }
      return decryptRecords(records, fields, encryptionKey);
    },
    [encryptionKey],
  );

  // Auto-load on mount
  useEffect(() => {
    if (autoLoad) {
      loadEncryptionKey();
    }
  }, [autoLoad, loadEncryptionKey]);

  return {
    // State
    encryptionKey,
    isReady,
    isValid,
    error,

    // Actions
    setEncryptionKey,
    clearEncryptionKey,
    loadEncryptionKey,
    saveEncryptionKey,
    validateKey,

    // Decryption
    decryptField,
    decryptSingleRecord,
    decryptMultipleRecords,
  };
}

// ============================================
// useRecordDecryption Hook (Simplified)
// ============================================

/**
 * Simplified hook for decrypting records in components
 *
 * @example
 * ```tsx
 * const { decryptRecord } = useRecordDecryption(table, encryptionKey);
 * const displayRecord = decryptRecord(record);
 * ```
 */
export function useRecordDecryption(table: Table, encryptionKey?: string) {
  const fields = useMemo(() => table.config.fields || [], [table.config.fields]);

  const decryptRecordFunc = useCallback((record: TableRecord): TableRecord => {
    // Note: This hook assumes records are already decrypted before being passed to components.
    // The actual decryption should happen at the API/data layer, not during render.
    // This function just normalizes the record format to ensure `data` property exists.
    return {
      ...record,
      data: record.data || record.record,
    };
  }, []);

  return {
    decryptRecord: decryptRecordFunc,
  };
}
