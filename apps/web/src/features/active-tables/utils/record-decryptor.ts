import type { ActiveTableRecord, ActiveFieldConfig } from '../types';
import { decryptFieldValue, isEncryptableField } from './encryption-helpers';
import { globalDecryptionCache } from './decryption-cache';

/**
 * Record decryption utilities for Active Tables
 * Handles batch decryption of records with field-type detection
 *
 * Performance optimizations:
 * - LRU cache for decrypted values
 * - Batch processing with parallel decryption
 * - Field-level caching to avoid redundant operations
 */

/**
 * Decrypt a single record's encrypted fields with caching
 * @param record - Record with potentially encrypted data
 * @param fields - Table field configurations
 * @param encryptionKey - 32-char encryption key
 * @param useCache - Whether to use decryption cache (default: true)
 * @returns Record with decrypted data
 */
export async function decryptRecord(
  record: ActiveTableRecord,
  fields: ActiveFieldConfig[],
  encryptionKey: string,
  useCache = true
): Promise<ActiveTableRecord> {
  if (!encryptionKey || !record.record || typeof record.record !== 'object') {
    return record;
  }

  try {
    const decryptedData: Record<string, unknown> = {};

    // Decrypt each field in the record
    for (const field of fields) {
      const fieldName = field.name;
      const fieldValue = record.record[fieldName];

      // Skip if field value doesn't exist or field doesn't need encryption
      if (fieldValue === undefined || fieldValue === null || !isEncryptableField(field)) {
        decryptedData[fieldName] = fieldValue;
        continue;
      }

      try {
        // Check cache first if enabled
        if (useCache) {
          const cachedValue = globalDecryptionCache.get(fieldValue, fieldName, field.type);
          if (cachedValue !== undefined) {
            decryptedData[fieldName] = cachedValue;
            continue;
          }
        }

        // Decrypt field value based on field type
        const decryptedValue = await decryptFieldValue(fieldValue, field, encryptionKey);
        decryptedData[fieldName] = decryptedValue;

        // Cache decrypted value if enabled
        if (useCache) {
          globalDecryptionCache.set(fieldValue, fieldName, field.type, decryptedValue);
        }
      } catch (error) {
        console.error(`Failed to decrypt field ${fieldName}:`, error);
        // Keep original value on error
        decryptedData[fieldName] = fieldValue;
      }
    }

    // Return new record with decrypted data
    return {
      ...record,
      record: decryptedData,
    };
  } catch (error) {
    console.error('Record decryption failed:', error);
    return record; // Return original record on error
  }
}

/**
 * Decrypt multiple records in batch with optimized parallel processing
 * @param records - Array of records to decrypt
 * @param fields - Table field configurations
 * @param encryptionKey - 32-char encryption key
 * @param useCache - Whether to use decryption cache (default: true)
 * @param batchSize - Number of records to decrypt in parallel (default: 50)
 * @returns Array of records with decrypted data
 */
export async function decryptRecords(
  records: ActiveTableRecord[],
  fields: ActiveFieldConfig[],
  encryptionKey: string,
  useCache = true,
  batchSize = 50
): Promise<ActiveTableRecord[]> {
  if (!records || !Array.isArray(records) || records.length === 0) {
    return records;
  }

  if (!encryptionKey) {
    console.warn('No encryption key provided, records will not be decrypted');
    return records;
  }

  try {
    // Process records in batches to prevent overwhelming the event loop
    const decryptedRecords: ActiveTableRecord[] = [];

    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);

      // Decrypt batch in parallel
      const decryptedBatch = await Promise.all(
        batch.map((record) => decryptRecord(record, fields, encryptionKey, useCache))
      );

      decryptedRecords.push(...decryptedBatch);

      // Yield to event loop between batches for better UI responsiveness
      if (i + batchSize < records.length) {
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
    }

    return decryptedRecords;
  } catch (error) {
    console.error('Batch record decryption failed:', error);
    return records; // Return original records on error
  }
}

/**
 * Decrypt a specific field across multiple records
 * Useful for column-based operations
 * @param records - Array of records
 * @param field - Field configuration
 * @param encryptionKey - 32-char encryption key
 * @returns Array of decrypted field values
 */
export async function decryptFieldAcrossRecords(
  records: ActiveTableRecord[],
  field: ActiveFieldConfig,
  encryptionKey: string
): Promise<unknown[]> {
  if (!records || !Array.isArray(records) || !encryptionKey) {
    return records.map((r) => r.record[field.name]);
  }

  try {
    const decryptedValues = await Promise.all(
      records.map(async (record) => {
        const value = record.record[field.name];
        if (value === undefined || value === null || !isEncryptableField(field)) {
          return value;
        }
        return await decryptFieldValue(value, field, encryptionKey);
      })
    );

    return decryptedValues;
  } catch (error) {
    console.error(`Failed to decrypt field ${field.name} across records:`, error);
    return records.map((r) => r.record[field.name]);
  }
}

/**
 * Get encryption statistics for a set of records
 * Useful for debugging and monitoring
 */
export function getEncryptionStats(records: ActiveTableRecord[], fields: ActiveFieldConfig[]) {
  const stats = {
    totalRecords: records.length,
    totalFields: fields.length,
    encryptableFields: fields.filter(isEncryptableField).length,
    encryptedFieldsByType: {} as Record<string, number>,
    totalEncryptedValues: 0,
    cacheStats: globalDecryptionCache.getStats(),
  };

  // Count encrypted values by field type
  for (const field of fields) {
    if (!isEncryptableField(field)) continue;

    const encryptedCount = records.filter((r) => {
      const value = r.record[field.name];
      return value !== undefined && value !== null;
    }).length;

    stats.encryptedFieldsByType[field.type] =
      (stats.encryptedFieldsByType[field.type] || 0) + encryptedCount;
    stats.totalEncryptedValues += encryptedCount;
  }

  return stats;
}

/**
 * Clear decryption cache
 * Useful when switching tables or encryption keys
 */
export function clearDecryptionCache(): void {
  globalDecryptionCache.clear();
}

/**
 * Clear expired cache entries
 * Can be called periodically to free memory
 */
export function cleanupDecryptionCache(): void {
  globalDecryptionCache.clearExpired();
}
