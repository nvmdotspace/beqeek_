/**
 * Tests for OPE decryption with real API data format
 */

import { describe, test, expect } from 'vitest';
import CryptoJS from 'crypto-js';
import { decryptFieldValue } from '../encryption-helpers';
import type { ActiveFieldConfig } from '../../types';

describe('OPE Decryption', () => {
  const testKey = 'abcdef1234567890ABCDEF1234567890';

  /**
   * Simulate OPE encryption as done by old system
   * Format: ciphertext|strong_enc
   */
  function encryptOPEFormat(originalValue: string, key: string): string {
    // Encrypt the original value using AES-256-CBC
    const keyBytes = CryptoJS.enc.Utf8.parse(key);
    const iv = CryptoJS.lib.WordArray.random(16);

    const encrypted = CryptoJS.AES.encrypt(originalValue, keyBytes, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });

    // Prepend IV to ciphertext
    const encryptedWordArray = CryptoJS.enc.Base64.parse(encrypted.toString());
    const combined = iv.clone();
    combined.concat(encryptedWordArray);
    const strongEnc = CryptoJS.enc.Base64.stringify(combined);

    // Create a fake ciphertext part (for sorting, not used in decryption)
    const fakeCiphertext = 'ope_encrypted_' + originalValue.length;

    // Return OPE format: ciphertext|strong_enc
    return `${fakeCiphertext}|${strongEnc}`;
  }

  test('should decrypt OPE date field', async () => {
    const originalDate = '1990-05-15';
    const encrypted = encryptOPEFormat(originalDate, testKey);

    const field: ActiveFieldConfig = {
      name: 'date_of_birth',
      type: 'DATE',
      label: 'Date of Birth'
    };

    const decrypted = await decryptFieldValue(encrypted, field, testKey);

    expect(decrypted).toBe(originalDate);
  });

  test('should decrypt OPE datetime field', async () => {
    const originalDatetime = '2025-01-15 14:30:00';
    const encrypted = encryptOPEFormat(originalDatetime, testKey);

    const field: ActiveFieldConfig = {
      name: 'created_at',
      type: 'DATETIME',
      label: 'Created At'
    };

    const decrypted = await decryptFieldValue(encrypted, field, testKey);

    expect(decrypted).toBe(originalDatetime);
  });

  test('should decrypt OPE integer field', async () => {
    const originalNumber = '12345';
    const encrypted = encryptOPEFormat(originalNumber, testKey);

    const field: ActiveFieldConfig = {
      name: 'employee_count',
      type: 'INTEGER',
      label: 'Employee Count'
    };

    const decrypted = await decryptFieldValue(encrypted, field, testKey);

    expect(decrypted).toBe(originalNumber);
  });

  test('should decrypt OPE numeric field with decimals', async () => {
    const originalNumber = '123.45';
    const encrypted = encryptOPEFormat(originalNumber, testKey);

    const field: ActiveFieldConfig = {
      name: 'salary',
      type: 'NUMERIC',
      label: 'Salary'
    };

    const decrypted = await decryptFieldValue(encrypted, field, testKey);

    expect(decrypted).toBe(originalNumber);
  });

  test('should handle invalid OPE format gracefully', async () => {
    // Missing the | separator
    const invalidFormat = 'just_some_encrypted_text';

    const field: ActiveFieldConfig = {
      name: 'date_field',
      type: 'DATE',
      label: 'Date Field'
    };

    const result = await decryptFieldValue(invalidFormat, field, testKey);

    // Should return original value when format is invalid
    expect(result).toBe(invalidFormat);
  });

  test('should handle empty OPE value', async () => {
    const field: ActiveFieldConfig = {
      name: 'date_field',
      type: 'DATE',
      label: 'Date Field'
    };

    const result = await decryptFieldValue('', field, testKey);

    expect(result).toBe('');
  });
});
