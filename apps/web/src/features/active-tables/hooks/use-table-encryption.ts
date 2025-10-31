/**
 * useTableEncryption Hook
 *
 * Manages encryption key lifecycle for Active Tables with E2EE
 * - Loads keys from localStorage
 * - Validates keys against encryptionAuthKey
 * - Provides save/clear functionality
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { validateEncryptionKey, isValidEncryptionKey, clearDecryptionCache } from '@workspace/active-tables-core';
import {
  getEncryptionKey,
  saveEncryptionKey as saveEncryptionKeyToStorage,
  clearEncryptionKey as clearEncryptionKeyFromStorage,
} from '../utils/encryption-key-storage';
import type { ActiveTableConfig } from '../types';

export type EncryptionKeyStatus = 'valid' | 'invalid' | 'unknown' | 'not-required';

export interface UseTableEncryptionReturn {
  // State
  encryptionKey: string | null;
  isKeyLoaded: boolean;
  isKeyValid: boolean;
  keyValidationStatus: EncryptionKeyStatus;
  isE2EEEnabled: boolean;
  encryptionAuthKey: string | null;

  // Actions
  saveKey: (key: string) => Promise<boolean>;
  clearKey: () => void;
  validateKey: (key: string) => boolean;
}

export function useTableEncryption(
  workspaceId: string,
  tableId: string,
  config?: ActiveTableConfig,
): UseTableEncryptionReturn {
  const [encryptionKey, setEncryptionKey] = useState<string | null>(null);
  const [isKeyLoaded, setIsKeyLoaded] = useState(false);

  const isE2EEEnabled = config?.e2eeEncryption ?? false;
  const encryptionAuthKey = config?.encryptionAuthKey ?? null;

  // Load key from localStorage on mount
  useEffect(() => {
    if (!workspaceId || !tableId || !isE2EEEnabled) {
      setIsKeyLoaded(false);
      setEncryptionKey(null);
      return;
    }

    const key = getEncryptionKey(workspaceId, tableId);
    setEncryptionKey(key);
    setIsKeyLoaded(true);
  }, [workspaceId, tableId, isE2EEEnabled]);

  // Validate key against authKey
  const isKeyValid = useMemo(() => {
    if (!encryptionKey || !encryptionAuthKey || !isE2EEEnabled) {
      return false;
    }
    return validateEncryptionKey(encryptionKey, encryptionAuthKey);
  }, [encryptionKey, encryptionAuthKey, isE2EEEnabled]);

  // Determine validation status
  const keyValidationStatus = useMemo((): EncryptionKeyStatus => {
    if (!isE2EEEnabled) return 'not-required';
    if (!encryptionKey) return 'unknown';
    if (!encryptionAuthKey) return 'unknown';
    return isKeyValid ? 'valid' : 'invalid';
  }, [isE2EEEnabled, encryptionKey, encryptionAuthKey, isKeyValid]);

  // Save key to localStorage
  const saveKey = useCallback(
    async (key: string): Promise<boolean> => {
      try {
        // Validate format
        if (!isValidEncryptionKey(key)) {
          console.error('Invalid key format: must be 32 characters');
          return false;
        }

        // Validate against authKey
        if (encryptionAuthKey && !validateEncryptionKey(key, encryptionAuthKey)) {
          console.error('Key validation failed: does not match auth key');
          return false;
        }

        // Save to localStorage
        saveEncryptionKeyToStorage(workspaceId, tableId, key);
        setEncryptionKey(key);
        return true;
      } catch (error) {
        console.error('Failed to save encryption key:', error);
        return false;
      }
    },
    [workspaceId, tableId, encryptionAuthKey],
  );

  // Clear key from localStorage and decryption cache
  const clearKey = useCallback(() => {
    clearEncryptionKeyFromStorage(workspaceId, tableId);
    setEncryptionKey(null);
    // Clear cached decrypted values when key is cleared
    clearDecryptionCache();
  }, [workspaceId, tableId]);

  // Validate a key without saving
  const validateKey = useCallback(
    (key: string): boolean => {
      if (!isValidEncryptionKey(key)) return false;
      if (!encryptionAuthKey) return false;
      return validateEncryptionKey(key, encryptionAuthKey);
    },
    [encryptionAuthKey],
  );

  return {
    encryptionKey,
    isKeyLoaded,
    isKeyValid,
    keyValidationStatus,
    isE2EEEnabled,
    encryptionAuthKey,
    saveKey,
    clearKey,
    validateKey,
  };
}
