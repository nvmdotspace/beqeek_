import CryptoJS from 'crypto-js';
import type { EncryptionKey, EncryptedData, EncryptionType } from '../types';

export class HMAC {
  private static ALGORITHM = 'HMAC-SHA256';

  /**
   * Generate HMAC key
   */
  static generateKey(): string {
    return CryptoJS.lib.WordArray.random(32).toString();
  }

  /**
   * Create HMAC-SHA256 hash of data
   */
  static async hash(
    data: string,
    key?: string
  ): Promise<EncryptedData> {
    const hashKey = key || this.generateKey();

    try {
      const hmac = CryptoJS.HmacSHA256(data, CryptoJS.enc.Hex.parse(hashKey));
      const hash = hmac.toString();

      return {
        data: hash,
        algorithm: this.ALGORITHM as EncryptionType,
        metadata: {
          originalDataLength: data.length
        }
      };
    } catch (error) {
      throw new Error(`HMAC hashing failed: ${error}`);
    }
  }

  /**
   * Verify HMAC hash
   */
  static async verify(
    originalData: string,
    encryptedData: EncryptedData,
    key: string
  ): Promise<boolean> {
    if (encryptedData.algorithm !== this.ALGORITHM) {
      throw new Error(`Invalid algorithm. Expected ${this.ALGORITHM}, got ${encryptedData.algorithm}`);
    }

    try {
      const hmac = CryptoJS.HmacSHA256(originalData, CryptoJS.enc.Hex.parse(key));
      const expectedHash = hmac.toString();

      return encryptedData.data === expectedHash;
    } catch (error) {
      throw new Error(`HMAC verification failed: ${error}`);
    }
  }

  /**
   * Hash checkbox/boolean values
   */
  static async hashCheckbox(
    value: boolean,
    key?: string
  ): Promise<EncryptedData> {
    return this.hash(value.toString(), key);
  }

  /**
   * Hash single select value
   */
  static async hashSelectOne(
    value: string,
    key?: string
  ): Promise<EncryptedData> {
    return this.hash(value, key);
  }

  /**
   * Hash multiple select values
   */
  static async hashSelectList(
    values: string[],
    key?: string
  ): Promise<EncryptedData[]> {
    const results: EncryptedData[] = [];

    for (const value of values) {
      const hashed = await this.hash(value, key);
      results.push(hashed);
    }

    return results;
  }

  /**
   * Hash checkbox list values
   */
  static async hashCheckboxList(
    values: string[],
    key?: string
  ): Promise<EncryptedData[]> {
    return this.hashSelectList(values, key);
  }

  /**
   * Create searchable hash for exact matching
   */
  static async createSearchableHash(
    value: string,
    key: string
  ): Promise<string> {
    const hmac = CryptoJS.HmacSHA256(value, CryptoJS.enc.Hex.parse(key));
    return hmac.toString();
  }

  /**
   * Create multiple search hashes for different use cases
   */
  static async createSearchHashes(
    value: string,
    key: string,
    options: {
      caseSensitive?: boolean;
      includeExact?: boolean;
      includeLowercase?: boolean;
      includeUppercase?: boolean;
    } = {}
  ): Promise<{
    exact?: string;
    lowercase?: string;
    uppercase?: string;
  }> {
    const {
      caseSensitive = false,
      includeExact = true,
      includeLowercase = true,
      includeUppercase = false
    } = options;

    const hashes: any = {};

    if (includeExact) {
      hashes.exact = await this.createSearchableHash(
        caseSensitive ? value : value.toLowerCase(),
        key
      );
    }

    if (includeLowercase && !caseSensitive) {
      hashes.lowercase = await this.createSearchableHash(
        value.toLowerCase(),
        key
      );
    }

    if (includeUppercase) {
      hashes.uppercase = await this.createSearchableHash(
        value.toUpperCase(),
        key
      );
    }

    return hashes;
  }

  /**
   * Batch hash multiple values
   */
  static async batchHash(
    values: string[],
    key?: string
  ): Promise<EncryptedData[]> {
    const results: EncryptedData[] = [];

    for (const value of values) {
      const hashed = await this.hash(value, key);
      results.push(hashed);
    }

    return results;
  }

  /**
   * Create deterministic hash for consistent mapping
   */
  static createDeterministicHash(
    value: string,
    key: string,
    salt?: string
  ): string {
    const saltedValue = salt ? `${value}:${salt}` : value;
    const hmac = CryptoJS.HmacSHA256(saltedValue, CryptoJS.enc.Hex.parse(key));
    return hmac.toString();
  }

  /**
   * Generate hash-based tokens for searching
   */
  static async generateSearchTokens(
    value: string,
    key: string,
    options: {
      includePartial?: boolean;
      includePhonetic?: boolean;
      minLength?: number;
    } = {}
  ): Promise<{
    exact: string;
    partial?: string[];
    phonetic?: string;
  }> {
    const {
      includePartial = false,
      includePhonetic = false,
      minLength = 3
    } = options;

    const tokens: any = {
      exact: await this.createSearchableHash(value, key)
    };

    // Generate partial search tokens (for autocomplete, etc.)
    if (includePartial && value.length >= minLength) {
      tokens.partial = [];
      for (let i = minLength; i <= value.length; i++) {
        const partial = value.substring(0, i);
        tokens.partial.push(await this.createSearchableHash(partial, key));
      }
    }

    // Generate phonetic hash (for fuzzy matching)
    if (includePhonetic) {
      tokens.phonetic = await this.createSearchableHash(
        this.phoneticHash(value),
        key
      );
    }

    return tokens;
  }

  /**
   * Simple phonetic hash implementation
   */
  private static phoneticHash(value: string): string {
    // Basic phonetic algorithm (can be replaced with Soundex, Metaphone, etc.)
    return value
      .toLowerCase()
      .replace(/[^a-z]/g, '')
      .replace(/[aeiou]/g, 'a')
      .replace(/[bcdfg]/g, 'b')
      .replace(/[hjklm]/g, 'h')
      .replace(/[npqrst]/g, 'n')
      .replace(/[vwxyz]/g, 'v');
  }

  /**
   * Validate HMAC key format
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

  /**
   * Compare two hashed values
   */
  static compare(hash1: string, hash2: string): boolean {
    // Use timing-safe comparison
    if (hash1.length !== hash2.length) return false;

    let result = 0;
    for (let i = 0; i < hash1.length; i++) {
      result |= hash1.charCodeAt(i) ^ hash2.charCodeAt(i);
    }

    return result === 0;
  }
}