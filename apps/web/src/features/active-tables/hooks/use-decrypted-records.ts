import { useMemo, useEffect, useState } from 'react';
import type { ActiveTableRecord, ActiveFieldConfig } from '../types';
import { decryptRecords } from '../utils/record-decryptor';

/**
 * Hook for decrypting Active Table records
 * Handles batch decryption with memoization for performance
 *
 * Performance optimizations:
 * - Async decryption with proper state management
 * - Caching via record-decryptor utilities
 * - Memoization to prevent re-decryption on unrelated prop changes
 */

export interface UseDecryptedRecordsOptions {
  /** Records to decrypt */
  records: ActiveTableRecord[];

  /** Table field configurations */
  fields: ActiveFieldConfig[];

  /** Encryption key (null if not available) */
  encryptionKey: string | null;

  /** Whether E2EE is enabled for this table */
  isE2EEEnabled: boolean;
}

export interface UseDecryptedRecordsResult {
  /** Decrypted records (or original if no encryption) */
  records: ActiveTableRecord[];

  /** Whether decryption is in progress */
  isDecrypting: boolean;

  /** Whether decryption failed */
  hasError: boolean;

  /** Decryption error message (if any) */
  error: string | null;
}

/**
 * Custom hook for decrypting Active Table records
 * Automatically decrypts records when encryption key is available
 *
 * Uses async decryption with proper state management for better UX
 *
 * @example
 * ```tsx
 * const { records: decryptedRecords, isDecrypting } = useDecryptedRecords({
 *   records,
 *   fields: table.config.fields,
 *   encryptionKey,
 *   isE2EEEnabled: table.config.e2eeEncryption,
 * });
 *
 * if (isDecrypting) {
 *   return <LoadingSpinner />;
 * }
 *
 * return <DataTable data={decryptedRecords} />;
 * ```
 */
export function useDecryptedRecords(
  options: UseDecryptedRecordsOptions
): UseDecryptedRecordsResult {
  const { records, fields, encryptionKey, isE2EEEnabled } = options;

  // State for async decryption
  const [decryptedRecords, setDecryptedRecords] = useState<ActiveTableRecord[]>(records);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Memoize dependencies to prevent unnecessary re-decryption
  const recordsKey = useMemo(() => JSON.stringify(records.map((r) => r.id)), [records]);
  const fieldsKey = useMemo(() => JSON.stringify(fields.map((f) => f.name)), [fields]);

  useEffect(() => {
    // If E2EE is not enabled, use original records
    if (!isE2EEEnabled) {
      setDecryptedRecords(records);
      setIsDecrypting(false);
      setHasError(false);
      setError(null);
      return;
    }

    // If encryption key is not available, use original records
    if (!encryptionKey) {
      setDecryptedRecords(records);
      setIsDecrypting(false);
      setHasError(false);
      setError(null);
      return;
    }

    // If no records or fields, return empty
    if (!records || !Array.isArray(records) || records.length === 0) {
      setDecryptedRecords([]);
      setIsDecrypting(false);
      setHasError(false);
      setError(null);
      return;
    }

    if (!fields || !Array.isArray(fields) || fields.length === 0) {
      setDecryptedRecords(records);
      setIsDecrypting(false);
      setHasError(false);
      setError(null);
      return;
    }

    // Perform async decryption
    let cancelled = false;
    setIsDecrypting(true);
    setHasError(false);
    setError(null);

    decryptRecords(records, fields, encryptionKey)
      .then((result) => {
        if (!cancelled) {
          setDecryptedRecords(result);
          setIsDecrypting(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.error('Decryption failed:', err);
          setHasError(true);
          setError(err instanceof Error ? err.message : 'Decryption failed');
          setDecryptedRecords(records); // Fallback to original records
          setIsDecrypting(false);
        }
      });

    // Cleanup function to cancel stale decryption
    return () => {
      cancelled = true;
    };
  }, [recordsKey, fieldsKey, encryptionKey, isE2EEEnabled, records, fields]);

  return {
    records: decryptedRecords,
    isDecrypting,
    hasError,
    error,
  };
}

