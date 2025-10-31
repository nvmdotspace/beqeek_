/**
 * AES-256-CBC implementation
 * Compatible with legacy JavaScript implementation
 * Key is parsed as UTF8 (NOT hex), IV is prepended to ciphertext
 */

import CryptoJS from 'crypto-js';

export class AES256 {
  /**
   * Encrypt data using AES-256-CBC
   * Matches legacy JavaScript implementation exactly:
   * - Key parsed as UTF8 string (NOT hex)
   * - Random 16-byte IV generated
   * - IV prepended to ciphertext
   * - Output is Base64 encoded
   */
  static encrypt(data: any, key: string): any {
    if (!key || !data) return data;

    data = data.toString(); // Ensure data is string

    try {
      const keyBytes = CryptoJS.enc.Utf8.parse(key);
      const iv = CryptoJS.lib.WordArray.random(16); // IV 16 bytes (128 bit)
      const encrypted = CryptoJS.AES.encrypt(data, keyBytes, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      });

      // Prepend IV to ciphertext (Base64 encoded)
      const encryptedBase64 = CryptoJS.enc.Base64.stringify(iv.concat(encrypted.ciphertext));
      return encryptedBase64;
    } catch (error) {
      console.error('Encryption error:', error);
      return data;
    }
  }

  /**
   * Decrypt data using AES-256-CBC
   * Matches legacy JavaScript implementation exactly:
   * - Key parsed as UTF8 string
   * - Extracts IV from first 16 bytes
   * - Decrypts remaining ciphertext
   */
  static decrypt(encryptedData: any, key: string): any {
    if (!key || !encryptedData) return encryptedData;

    try {
      const keyBytes = CryptoJS.enc.Utf8.parse(key);
      const encryptedWordArray = CryptoJS.enc.Base64.parse(encryptedData);

      const iv = CryptoJS.lib.WordArray.create(encryptedWordArray.words.slice(0, 4), 16); // IV is first 16 bytes
      const ciphertext = CryptoJS.lib.WordArray.create(
        encryptedWordArray.words.slice(4),
        encryptedWordArray.sigBytes - 16,
      );

      const decrypted = CryptoJS.AES.decrypt({ ciphertext: ciphertext } as any, keyBytes, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      });

      return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('Decryption error:', error);
      return encryptedData;
    }
  }

  /**
   * Generate authentication key from encryption key
   * Uses triple SHA256 hashing
   */
  static hashKeyForAuth(key: string): string {
    let hash = key;
    for (let i = 0; i < 3; i++) {
      hash = CryptoJS.SHA256(hash).toString();
    }
    return hash;
  }

  /**
   * Legacy alias for backward compatibility
   */
  static encryptData = AES256.encrypt;
  static decryptData = AES256.decrypt;
}
