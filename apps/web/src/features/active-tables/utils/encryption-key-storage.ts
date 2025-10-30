/**
 * Encryption Key Storage Utilities
 *
 * Centralized localStorage operations for managing encryption keys
 * Keys are stored per workspace+table combination: e2ee_key_{workspaceId}_{tableId}
 */

import { getEncryptionKeyStorageKey } from '@workspace/active-tables-core';

/**
 * Save encryption key to localStorage
 * @throws Error if key is invalid format (not 32 chars)
 */
export function saveEncryptionKey(
  workspaceId: string,
  tableId: string,
  key: string
): void {
  if (!key || key.length !== 32) {
    throw new Error('Encryption key must be exactly 32 characters');
  }

  const storageKey = getEncryptionKeyStorageKey(workspaceId, tableId);
  localStorage.setItem(storageKey, key);
}

/**
 * Get encryption key from localStorage
 * @returns Encryption key or null if not found
 */
export function getEncryptionKey(
  workspaceId: string,
  tableId: string
): string | null {
  const storageKey = getEncryptionKeyStorageKey(workspaceId, tableId);
  return localStorage.getItem(storageKey);
}

/**
 * Clear encryption key from localStorage
 */
export function clearEncryptionKey(
  workspaceId: string,
  tableId: string
): void {
  const storageKey = getEncryptionKeyStorageKey(workspaceId, tableId);
  localStorage.removeItem(storageKey);
}

/**
 * Check if encryption key exists in localStorage
 */
export function hasEncryptionKey(
  workspaceId: string,
  tableId: string
): boolean {
  return getEncryptionKey(workspaceId, tableId) !== null;
}
