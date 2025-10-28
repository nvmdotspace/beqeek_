import { useMemo } from 'react';
import type { ActiveTable } from '../types';
import { useEncryptionKey } from './use-encryption-key';

/**
 * Hook for managing table-level encryption
 * Combines table config with encryption key management
 */

export interface UseTableEncryptionOptions {
  table: ActiveTable | undefined;
  workspaceId: string;
}

export interface UseTableEncryptionResult {
  /** Whether table has E2EE enabled */
  isE2EEEnabled: boolean;

  /** Current encryption key (null if not loaded) */
  encryptionKey: string | null;

  /** Whether encryption key is loaded and valid */
  isKeyLoaded: boolean;

  /** Whether key is being loaded */
  isLoading: boolean;

  /** Key validation error (if any) */
  error: string | null;

  /** Server's encryption auth key (SHA-256 hash of encryption key) */
  encryptionAuthKey: string | undefined;

  /** Save encryption key to localStorage */
  saveKey: (key: string) => void;

  /** Remove encryption key from localStorage */
  removeKey: () => void;

  /** Validate key against server's auth key */
  validateKey: (key: string) => boolean;

  /** Whether encryption is required for this table */
  isEncryptionRequired: boolean;
}

/**
 * Custom hook for table encryption management
 * Handles encryption key loading and validation for E2EE-enabled tables
 *
 * @example
 * ```tsx
 * const { isE2EEEnabled, encryptionKey, isKeyLoaded } = useTableEncryption({
 *   table,
 *   workspaceId,
 * });
 *
 * if (isE2EEEnabled && !isKeyLoaded) {
 *   return <EncryptionKeyDialog />;
 * }
 * ```
 */
export function useTableEncryption(options: UseTableEncryptionOptions): UseTableEncryptionResult {
  const { table, workspaceId } = options;

  // Check if table has E2EE enabled
  const isE2EEEnabled = table?.config?.e2eeEncryption ?? false;
  const encryptionAuthKey = table?.config?.encryptionAuthKey;
  const tableId = table?.id ?? '';

  // Use encryption key hook
  const encryptionKeyHook = useEncryptionKey({
    workspaceId,
    tableId,
    encryptionAuthKey,
  });

  // Determine if encryption is required
  const isEncryptionRequired = useMemo(() => {
    return isE2EEEnabled && !!encryptionAuthKey;
  }, [isE2EEEnabled, encryptionAuthKey]);

  // Return combined result
  return {
    isE2EEEnabled,
    encryptionKey: encryptionKeyHook.encryptionKey,
    isKeyLoaded: encryptionKeyHook.isKeyLoaded,
    isLoading: encryptionKeyHook.isLoading,
    error: encryptionKeyHook.error,
    encryptionAuthKey,
    saveKey: encryptionKeyHook.saveKey,
    removeKey: encryptionKeyHook.removeKey,
    validateKey: encryptionKeyHook.validateKey,
    isEncryptionRequired,
  };
}

/**
 * Hook for checking if encryption key is needed
 * Useful for conditional rendering of encryption key prompts
 */
export function useNeedsEncryptionKey(options: UseTableEncryptionOptions): boolean {
  const { isEncryptionRequired, isKeyLoaded } = useTableEncryption(options);
  return isEncryptionRequired && !isKeyLoaded;
}
