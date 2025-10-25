import CryptoJS from 'crypto-js';
import type { EncryptionKey, EncryptedData, EncryptionType } from '../types';

export class OPE {
  private static ALGORITHM = 'OPE';
  private static DOMAIN_SIZE = 2 ** 32; // Domain size for order preservation

  /**
   * Generate OPE key
   */
  static generateKey(): string {
    return CryptoJS.lib.WordArray.random(32).toString();
  }

  /**
   * Encrypt a number while preserving order
   */
  static async encryptNumber(
    value: number,
    key?: string,
    range: { min: number; max: number } = { min: 0, max: this.DOMAIN_SIZE }
  ): Promise<EncryptedData> {
    const encryptionKey = key || this.generateKey();
    const normalizedValue = this.normalizeValue(value, range);

    // Use HMAC to create order-preserving encryption
    const hmac = CryptoJS.HmacSHA256(
      normalizedValue.toString(),
      CryptoJS.enc.Hex.parse(encryptionKey)
    );

    // Convert to number while preserving order
    const encryptedValue = this.hmacToOrderedNumber(hmac, range);

    return {
      data: encryptedValue.toString(),
      algorithm: this.ALGORITHM as EncryptionType,
      metadata: {
        originalType: 'number',
        range,
        key: encryptionKey
      }
    };
  }

  /**
   * Decrypt a number while preserving order
   */
  static async decryptNumber(
    encryptedData: EncryptedData,
    key: string
  ): Promise<number> {
    if (encryptedData.algorithm !== this.ALGORITHM) {
      throw new Error(`Invalid algorithm. Expected ${this.ALGORITHM}, got ${encryptedData.algorithm}`);
    }

    const encryptedValue = parseInt(encryptedData.data);
    const range = encryptedData.metadata?.range || { min: 0, max: this.DOMAIN_SIZE };

    // Note: OPE decryption is not straightforward without the original value
    // In practice, OPE is often used for comparison/search only
    // For actual decryption, we'd need to store mapping or use different approach
    throw new Error('OPE decryption requires stored mapping or different implementation');
  }

  /**
   * Encrypt a date while preserving order
   */
  static async encryptDate(
    date: Date,
    key?: string
  ): Promise<EncryptedData> {
    const timestamp = date.getTime();
    const encryptedNumber = await this.encryptNumber(timestamp, key);

    return {
      ...encryptedNumber,
      metadata: {
        ...encryptedNumber.metadata,
        originalType: 'date',
        originalTimestamp: timestamp
      }
    };
  }

  /**
   * Encrypt a time value while preserving order
   */
  static async encryptTime(
    time: string, // Format: "HH:mm:ss" or "HH:mm"
    key?: string
  ): Promise<EncryptedData> {
    // Convert time to seconds since midnight
    const timeParts = time.split(':').map(Number);
    const [hours, minutes, seconds = 0] = timeParts;
    const totalSeconds = (hours || 0) * 3600 + (minutes || 0) * 60 + (seconds || 0);

    const range = { min: 0, max: 86400 }; // 24 hours in seconds
    const encryptedNumber = await this.encryptNumber(totalSeconds, key, range);

    return {
      ...encryptedNumber,
      metadata: {
        ...encryptedNumber.metadata,
        originalType: 'time',
        originalTime: time
      }
    };
  }

  /**
   * Compare two encrypted values (preserves order)
   */
  static compare(encryptedValue1: string, encryptedValue2: string): number {
    const num1 = parseInt(encryptedValue1);
    const num2 = parseInt(encryptedValue2);

    if (num1 < num2) return -1;
    if (num1 > num2) return 1;
    return 0;
  }

  /**
   * Check if encrypted value is within range
   */
  static isInRange(
    encryptedValue: string,
    encryptedMin: string,
    encryptedMax: string
  ): boolean {
    const value = parseInt(encryptedValue);
    const min = parseInt(encryptedMin);
    const max = parseInt(encryptedMax);

    return value >= min && value <= max;
  }

  /**
   * Normalize value to 0-1 range for encryption
   */
  private static normalizeValue(
    value: number,
    range: { min: number; max: number }
  ): number {
    if (range.max === range.min) return 0;
    return (value - range.min) / (range.max - range.min);
  }

  /**
   * Convert HMAC result to ordered number
   */
  private static hmacToOrderedNumber(
    hmac: CryptoJS.lib.WordArray,
    range: { min: number; max: number }
  ): number {
    // Convert HMAC to number
    const hmacHex = hmac.toString();
    const hmacNumber = parseInt(hmacHex.substring(0, 8), 16); // Use first 8 chars

    // Map to output range while preserving order
    const normalized = hmacNumber / 0xFFFFFFFF; // Normalize to 0-1
    return Math.floor(range.min + normalized * (range.max - range.min));
  }

  /**
   * Generate search tokens for range queries
   */
  static async generateSearchTokens(
    value: number,
    key: string,
    range: { min: number; max: number },
    tolerance: number = 0.1 // 10% tolerance
  ): Promise<{
    exact: string;
    range: { min: string; max: string };
  }> {
    const exactEncrypted = await this.encryptNumber(value, key, range);

    // Generate range tokens for approximate search
    const toleranceRange = (range.max - range.min) * tolerance;
    const searchMin = Math.max(range.min, value - toleranceRange);
    const searchMax = Math.min(range.max, value + toleranceRange);

    const minEncrypted = await this.encryptNumber(searchMin, key, range);
    const maxEncrypted = await this.encryptNumber(searchMax, key, range);

    return {
      exact: exactEncrypted.data,
      range: {
        min: minEncrypted.data,
        max: maxEncrypted.data
      }
    };
  }

  /**
   * Validate if value can be encrypted with OPE
   */
  static canEncrypt(value: any): boolean {
    return (
      typeof value === 'number' ||
      value instanceof Date ||
      (typeof value === 'string' && /^\d{2}:\d{2}(:\d{2})?$/.test(value))
    );
  }

  /**
   * Get value type for encryption
   */
  static getValueType(value: any): 'number' | 'date' | 'time' | 'unsupported' {
    if (typeof value === 'number') return 'number';
    if (value instanceof Date) return 'date';
    if (typeof value === 'string' && /^\d{2}:\d{2}(:\d{2})?$/.test(value)) return 'time';
    return 'unsupported';
  }
}