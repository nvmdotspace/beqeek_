import { useState, useEffect, useCallback } from 'react';
import {
  getEncryptionKeyStorageKey,
  isValidEncryptionKey,
  validateEncryptionKey,
} from '../utils/encryption-helpers';

/**
 * Hook for managing encryption key in localStorage
 * Handles loading, saving, and validation of encryption keys
 */

export interface UseEncryptionKeyOptions {
  workspaceId: string;
  tableId: string;
  encryptionAuthKey?: string; // Server's auth key for validation
}

export interface UseEncryptionKeyResult {
  /** Current encryption key (null if not loaded) */
  encryptionKey: string | null;

  /** Whether encryption key is loaded and valid */
  isKeyLoaded: boolean;

  /** Whether key is being loaded from localStorage */
  isLoading: boolean;

  /** Key validation error (if any) */
  error: string | null;

  /** Load encryption key from localStorage */
  loadKey: () => string | null;

  /** Save encryption key to localStorage */
  saveKey: (key: string) => void;

  /** Remove encryption key from localStorage */
  removeKey: () => void;

  /** Validate key against server's auth key */
  validateKey: (key: string) => boolean;

  /** Check if key format is valid */
  isKeyValid: (key: string) => boolean;
}

/**
 * Custom hook for encryption key management
 * Automatically loads key on mount and validates against server's auth key
 */
export function useEncryptionKey(options: UseEncryptionKeyOptions): UseEncryptionKeyResult {
  const { workspaceId, tableId, encryptionAuthKey } = options;

  const [encryptionKey, setEncryptionKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get storage key
  const storageKey = getEncryptionKeyStorageKey(workspaceId, tableId);

  /**
   * Load key from localStorage
   */
  const loadKey = useCallback((): string | null => {
    try {
      const key = localStorage.getItem(storageKey);

      if (!key) {
        return null;
      }

      // Validate key format
      if (!isValidEncryptionKey(key)) {
        setError('Invalid encryption key format');
        return null;
      }

      // Validate against server's auth key if available
      if (encryptionAuthKey && !validateEncryptionKey(key, encryptionAuthKey)) {
        setError('Encryption key does not match server auth key');
        return null;
      }

      setError(null);
      return key;
    } catch (err) {
      console.error('Failed to load encryption key:', err);
      setError('Failed to load encryption key from storage');
      return null;
    }
  }, [storageKey, encryptionAuthKey]);

  /**
   * Save key to localStorage
   */
  const saveKey = useCallback(
    (key: string) => {
      try {
        // Validate key format
        if (!isValidEncryptionKey(key)) {
          throw new Error('Invalid encryption key format. Key must be 64 hex characters.');
        }

        // Validate against server's auth key if available
        if (encryptionAuthKey && !validateEncryptionKey(key, encryptionAuthKey)) {
          throw new Error('Encryption key does not match server auth key');
        }

        // Save to localStorage
        localStorage.setItem(storageKey, key);
        setEncryptionKey(key);
        setError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to save encryption key';
        console.error('Failed to save encryption key:', err);
        setError(errorMessage);
        throw err; // Re-throw for caller to handle
      }
    },
    [storageKey, encryptionAuthKey]
  );

  /**
   * Remove key from localStorage
   */
  const removeKey = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
      setEncryptionKey(null);
      setError(null);
    } catch (err) {
      console.error('Failed to remove encryption key:', err);
      setError('Failed to remove encryption key from storage');
    }
  }, [storageKey]);

  /**
   * Validate key against server's auth key
   */
  const validateKeyFn = useCallback(
    (key: string): boolean => {
      if (!encryptionAuthKey) {
        return isValidEncryptionKey(key);
      }
      return validateEncryptionKey(key, encryptionAuthKey);
    },
    [encryptionAuthKey]
  );

  /**
   * Check if key format is valid
   */
  const isKeyValid = useCallback((key: string): boolean => {
    return isValidEncryptionKey(key);
  }, []);

  // Auto-load key on mount
  useEffect(() => {
    console.log('[useEncryptionKey] Loading encryption key...', {
      workspaceId,
      tableId,
      storageKey,
      hasAuthKey: !!encryptionAuthKey,
    });

    setIsLoading(true);
    const key = loadKey();

    console.log('[useEncryptionKey] Key loaded:', {
      hasKey: !!key,
      keyLength: key?.length,
      isValid: key ? isValidEncryptionKey(key) : false,
    });

    setEncryptionKey(key);
    setIsLoading(false);
  }, [loadKey, workspaceId, tableId, storageKey, encryptionAuthKey]);

  return {
    encryptionKey,
    isKeyLoaded: encryptionKey !== null,
    isLoading,
    error,
    loadKey,
    saveKey,
    removeKey,
    validateKey: validateKeyFn,
    isKeyValid,
  };
}
