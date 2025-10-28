/**
 * Tests for encryption-helpers utility functions
 *
 * These tests verify that decryption works with data encrypted by the old HTML module
 */

import { describe, test, expect } from 'vitest';
import CryptoJS from 'crypto-js';
import { decryptTextValue, validateEncryptionKey } from '../encryption-helpers';

describe('encryption-helpers', () => {
  // Use a 32-character UTF-8 key (matching old system)
  const testKey = 'abcdef1234567890ABCDEF1234567890';

  describe('decryptTextValue', () => {
    /**
     * Helper to encrypt data the same way as old HTML module
     * This simulates server-encrypted data
     */
    function encryptDataOldWay(data: string, key: string): string {
      const keyBytes = CryptoJS.enc.Utf8.parse(key);
      const iv = CryptoJS.lib.WordArray.random(16);

      const encrypted = CryptoJS.AES.encrypt(data, keyBytes, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });

      // Prepend IV to ciphertext
      const encryptedWordArray = CryptoJS.enc.Base64.parse(encrypted.toString());
      const combined = iv.clone();
      combined.concat(encryptedWordArray);

      return CryptoJS.enc.Base64.stringify(combined);
    }

    test('should decrypt simple text encrypted by old system', () => {
      const plaintext = 'Hello, World!';
      const encrypted = encryptDataOldWay(plaintext, testKey);

      const decrypted = decryptTextValue(encrypted, testKey);

      expect(decrypted).toBe(plaintext);
    });

    test('should decrypt email addresses', () => {
      const email = 'user@example.com';
      const encrypted = encryptDataOldWay(email, testKey);

      const decrypted = decryptTextValue(encrypted, testKey);

      expect(decrypted).toBe(email);
    });

    test('should decrypt multi-line text', () => {
      const multiline = 'Line 1\nLine 2\nLine 3';
      const encrypted = encryptDataOldWay(multiline, testKey);

      const decrypted = decryptTextValue(encrypted, testKey);

      expect(decrypted).toBe(multiline);
    });

    test('should decrypt special characters', () => {
      const special = '!@#$%^&*()_+-=[]{}|;:",.<>?/';
      const encrypted = encryptDataOldWay(special, testKey);

      const decrypted = decryptTextValue(encrypted, testKey);

      expect(decrypted).toBe(special);
    });

    test('should decrypt Unicode characters', () => {
      const unicode = 'Hello 你好 🚀';
      const encrypted = encryptDataOldWay(unicode, testKey);

      const decrypted = decryptTextValue(encrypted, testKey);

      expect(decrypted).toBe(unicode);
    });

    test('should return original value on decryption error', () => {
      const invalidEncrypted = 'not-valid-base64!@#';

      const result = decryptTextValue(invalidEncrypted, testKey);

      expect(result).toBe(invalidEncrypted);
    });

    test('should return original value with wrong key', () => {
      const plaintext = 'Secret message';
      const encrypted = encryptDataOldWay(plaintext, testKey);
      const wrongKey = 'wrongkey1234567890WRONGKEY123456';

      const result = decryptTextValue(encrypted, wrongKey);

      // Should return original encrypted string, not throw
      expect(result).toBe(encrypted);
    });
  });

  describe('validateEncryptionKey', () => {
    test('should validate correct 32-character key', () => {
      const validKey = 'abcdef1234567890ABCDEF1234567890';
      const authKey = CryptoJS.SHA256(validKey).toString(CryptoJS.enc.Hex);

      const result = validateEncryptionKey(validKey, authKey);

      expect(result).toBe(true);
    });

    test('should reject key with wrong length', () => {
      const shortKey = 'tooshort';
      const authKey = CryptoJS.SHA256(shortKey).toString(CryptoJS.enc.Hex);

      const result = validateEncryptionKey(shortKey, authKey);

      expect(result).toBe(false);
    });

    test('should reject key with wrong auth hash', () => {
      const validKey = 'abcdef1234567890ABCDEF1234567890';
      const wrongAuthKey = CryptoJS.SHA256('wrongkey123').toString(CryptoJS.enc.Hex);

      const result = validateEncryptionKey(validKey, wrongAuthKey);

      expect(result).toBe(false);
    });

    test('should handle empty key', () => {
      const result = validateEncryptionKey('', '');

      expect(result).toBe(false);
    });
  });
});
