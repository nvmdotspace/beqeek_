/**
 * Utility for detecting encrypted data in records
 * Used as a fallback when backend config doesn't properly indicate encryption
 */

import type { ActiveTableRecord } from '../types';

/**
 * Check if a string appears to be base64-encoded (common pattern for encrypted data)
 * @param value - String to check
 * @returns true if value matches base64 pattern
 */
export function looksLikeBase64(value: unknown): boolean {
  if (typeof value !== 'string' || value.length === 0) {
    return false;
  }

  // Base64 pattern: alphanumeric + / + = (padding)
  // Must be at least 16 chars (encrypted data is typically longer)
  const base64Pattern = /^[A-Za-z0-9+/]{16,}={0,2}$/;
  return base64Pattern.test(value);
}

/**
 * Check if a value appears to be encrypted AES-256-CBC output
 * (base64-encoded IV + ciphertext, typically 44+ characters)
 */
export function looksLikeEncryptedText(value: unknown): boolean {
  if (!looksLikeBase64(value)) {
    return false;
  }

  const str = value as string;
  // AES-256-CBC with IV typically produces 44+ chars for even short inputs
  return str.length >= 32;
}

/**
 * Analyze a single record to determine if it contains encrypted data
 * @param record - Record to analyze
 * @returns Encryption analysis result
 */
export interface EncryptionAnalysis {
  /** Whether record appears to be encrypted */
  looksEncrypted: boolean;
  /** Number of fields that look encrypted */
  encryptedFieldCount: number;
  /** Total number of string fields analyzed */
  totalStringFields: number;
  /** Percentage of fields that appear encrypted */
  encryptionPercentage: number;
}

export function analyzeRecordEncryption(record: ActiveTableRecord): EncryptionAnalysis {
  let totalStringFields = 0;
  let encryptedFieldCount = 0;

  // Analyze all fields in the record
  for (const [key, value] of Object.entries(record.record)) {
    // Only analyze string values
    if (typeof value === 'string' && value.length > 0) {
      totalStringFields++;
      if (looksLikeEncryptedText(value)) {
        encryptedFieldCount++;
      }
    }
  }

  const encryptionPercentage =
    totalStringFields > 0 ? (encryptedFieldCount / totalStringFields) * 100 : 0;

  // Consider encrypted if >50% of string fields look encrypted
  const looksEncrypted = encryptionPercentage >= 50;

  return {
    looksEncrypted,
    encryptedFieldCount,
    totalStringFields,
    encryptionPercentage,
  };
}

/**
 * Analyze multiple records to determine if the dataset appears encrypted
 * @param records - Records to analyze
 * @param sampleSize - Number of records to sample (default: all or max 5)
 * @returns Aggregate encryption analysis
 */
export function analyzeRecordsEncryption(
  records: ActiveTableRecord[],
  sampleSize = 5
): EncryptionAnalysis {
  if (records.length === 0) {
    return {
      looksEncrypted: false,
      encryptedFieldCount: 0,
      totalStringFields: 0,
      encryptionPercentage: 0,
    };
  }

  // Sample up to N records for analysis
  const sampled = records.slice(0, Math.min(sampleSize, records.length));

  let totalEncryptedFields = 0;
  let totalStringFields = 0;
  let recordsLookingEncrypted = 0;

  for (const record of sampled) {
    const analysis = analyzeRecordEncryption(record);
    totalEncryptedFields += analysis.encryptedFieldCount;
    totalStringFields += analysis.totalStringFields;

    if (analysis.looksEncrypted) {
      recordsLookingEncrypted++;
    }
  }

  const encryptionPercentage =
    totalStringFields > 0 ? (totalEncryptedFields / totalStringFields) * 100 : 0;

  // Consider the dataset encrypted if:
  // 1. More than 50% of records look encrypted, OR
  // 2. More than 60% of all string fields look encrypted
  const looksEncrypted =
    recordsLookingEncrypted / sampled.length >= 0.5 || encryptionPercentage >= 60;

  return {
    looksEncrypted,
    encryptedFieldCount: totalEncryptedFields,
    totalStringFields,
    encryptionPercentage,
  };
}
