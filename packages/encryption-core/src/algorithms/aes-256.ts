import CryptoJS from 'crypto-js';
import type { EncryptionKey, EncryptedData, EncryptionType } from '../types';

export class AES256 {
  private static ALGORITHM = 'AES-256-CBC';
  private static KEY_SIZE = 256;
  private static IV_SIZE = 128;

  /**
   * Generate a new AES-256 key
   */
  static generateKey(): string {
    return CryptoJS.lib.WordArray.random(32).toString(); // 32 bytes = 256 bits
  }

  /**
   * Generate a random IV
   */
  static generateIV(): string {
    return CryptoJS.lib.WordArray.random(16).toString(); // 16 bytes = 128 bits
  }

  /**
   * Encrypt data using AES-256-CBC
   */
  static async encrypt(data: string, key?: string): Promise<EncryptedData> {
    const encryptionKey = key || this.generateKey();
    const iv = this.generateIV();

    try {
      const encrypted = CryptoJS.AES.encrypt(data, CryptoJS.enc.Hex.parse(encryptionKey), {
        iv: CryptoJS.enc.Hex.parse(iv),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });

      return {
        data: encrypted.toString(),
        iv,
        algorithm: this.ALGORITHM as EncryptionType,
        metadata: {
          keyLength: this.KEY_SIZE,
          ivLength: this.IV_SIZE
        }
      };
    } catch (error) {
      throw new Error(`AES encryption failed: ${error}`);
    }
  }

  /**
   * Decrypt data using AES-256-CBC
   */
  static async decrypt(encryptedData: EncryptedData, key: string): Promise<string> {
    if (encryptedData.algorithm !== this.ALGORITHM) {
      throw new Error(`Invalid algorithm. Expected ${this.ALGORITHM}, got ${encryptedData.algorithm}`);
    }

    if (!encryptedData.iv) {
      throw new Error('IV is required for AES decryption');
    }

    try {
      const decrypted = CryptoJS.AES.decrypt(encryptedData.data, CryptoJS.enc.Hex.parse(key), {
        iv: CryptoJS.enc.Hex.parse(encryptedData.iv),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });

      const result = decrypted.toString(CryptoJS.enc.Utf8);

      if (!result) {
        throw new Error('Decryption resulted in empty string - possible wrong key');
      }

      return result;
    } catch (error) {
      throw new Error(`AES decryption failed: ${error}`);
    }
  }

  /**
   * Encrypt multiple fields with different keys
   */
  static async encryptFields(
    data: Record<string, any>,
    fieldKeys: Record<string, string>
  ): Promise<Record<string, EncryptedData>> {
    const result: Record<string, EncryptedData> = {};

    for (const [fieldName, fieldValue] of Object.entries(data)) {
      const fieldKey = fieldKeys[fieldName];

      if (fieldKey && fieldValue !== null && fieldValue !== undefined) {
        const stringValue = String(fieldValue);
        result[fieldName] = await this.encrypt(stringValue, fieldKey);
      }
    }

    return result;
  }

  /**
   * Decrypt multiple fields with different keys
   */
  static async decryptFields(
    encryptedData: Record<string, EncryptedData>,
    fieldKeys: Record<string, string>
  ): Promise<Record<string, string>> {
    const result: Record<string, string> = {};

    for (const [fieldName, encryptedField] of Object.entries(encryptedData)) {
      const fieldKey = fieldKeys[fieldName];

      if (fieldKey) {
        try {
          result[fieldName] = await this.decrypt(encryptedField, fieldKey);
        } catch (error) {
          console.warn(`Failed to decrypt field ${fieldName}:`, error);
          result[fieldName] = ''; // or handle error as needed
        }
      }
    }

    return result;
  }

  /**
   * Validate key format
   */
  static isValidKey(key: string): boolean {
    return /^[a-fA-F0-9]{64}$/.test(key); // 64 hex characters = 32 bytes
  }

  /**
   * Derive key from password using PBKDF2
   */
  static async deriveKeyFromPassword(
    password: string,
    salt?: string,
    iterations: number = 100000
  ): Promise<{ key: string; salt: string }> {
    const keySalt = salt || CryptoJS.lib.WordArray.random(16).toString();

    const key = CryptoJS.PBKDF2(password, CryptoJS.enc.Hex.parse(keySalt), {
      keySize: 256 / 32, // 256 bits
      iterations
    }).toString();

    return { key, salt: keySalt };
  }

  static packIvPrefixed(encryptedData: EncryptedData): string {
    if (encryptedData.algorithm !== this.ALGORITHM) {
      throw new Error(`Invalid algorithm. Expected ${this.ALGORITHM}, got ${encryptedData.algorithm}`);
    }
    if (!encryptedData.iv) {
      throw new Error('IV is required to pack AES ciphertext');
    }

    const ivWA = CryptoJS.enc.Hex.parse(encryptedData.iv);
    const ctWA = CryptoJS.enc.Base64.parse(encryptedData.data);
    const combined = ivWA.clone();
    combined.concat(ctWA);
    return CryptoJS.enc.Base64.stringify(combined);
  }

  static unpackIvPrefixed(packed: string): { iv: string; data: string } {
    const combined = CryptoJS.enc.Base64.parse(packed);

    // IV is 16 bytes (AES-256-CBC) => 4 words
    const ivWords = combined.words.slice(0, 4);
    const ivWA = CryptoJS.lib.WordArray.create(ivWords, this.IV_SIZE);

    const ctWords = combined.words.slice(4);
    const ctWA = CryptoJS.lib.WordArray.create(ctWords, combined.sigBytes - this.IV_SIZE);

    const ivHex = CryptoJS.enc.Hex.stringify(ivWA);
    const ctBase64 = CryptoJS.enc.Base64.stringify(ctWA);

    return { iv: ivHex, data: ctBase64 };
  }
}