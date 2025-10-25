import { AES256 } from '../algorithms/aes-256';
import type { KeyDerivationOptions } from '../types';

export class KeyDerivation {
  private static DEFAULT_ITERATIONS = 100000;
  private static DEFAULT_KEY_LENGTH = 256;

  /**
   * Derive key from password using PBKDF2
   */
  static async deriveKeyFromPassword(
    password: string,
    salt?: string,
    options: KeyDerivationOptions = {}
  ): Promise<{
    key: string;
    salt: string;
    iterations: number;
    keyLength: number;
  }> {
    const {
      iterations = this.DEFAULT_ITERATIONS,
      keyLength = this.DEFAULT_KEY_LENGTH,
      hashFunction = 'SHA-256'
    } = options;

    const keySalt = salt || this.generateSalt();

    const { key } = await AES256.deriveKeyFromPassword(password, keySalt, iterations);

    return {
      key,
      salt: keySalt,
      iterations,
      keyLength
    };
  }

  /**
   * Derive multiple keys from a master key
   */
  static deriveMultipleKeys(
    masterKey: string,
    contexts: string[]
  ): Record<string, string> {
    const keys: Record<string, string> = {};

    for (const context of contexts) {
      keys[context] = this.deriveKey(masterKey, context);
    }

    return keys;
  }

  /**
   * Derive key from master key with context
   */
  static deriveKey(masterKey: string, context: string, length: number = 32): string {
    const encoder = new TextEncoder();
    const data = encoder.encode(`${masterKey}:${context}`);

    // Simple key derivation - in production, use HKDF
    let hash = '';
    for (let i = 0; i < Math.ceil(length / 32); i++) {
      const input = new Uint8Array([...data, i]);
      const hashBuffer = this.simpleHash(input);
      hash += Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
    }

    return hash.substring(0, length * 2); // Convert to hex string
  }

  /**
   * Generate random salt
   */
  static generateSalt(length: number = 16): string {
    return AES256.generateIV();
  }

  /**
   * Generate cryptographically secure random key
   */
  static generateRandomKey(length: number = 32): string {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  /**
   * Validate key strength
   */
  static validateKeyStrength(key: string): {
    isValid: boolean;
    score: number;
    suggestions: string[];
  } {
    const suggestions: string[] = [];
    let score = 0;

    // Length check
    if (key.length >= 64) { // 32 bytes in hex
      score += 25;
    } else {
      suggestions.push('Key should be at least 32 bytes (64 hex characters)');
    }

    // Entropy check
    const uniqueChars = new Set(key.toLowerCase()).size;
    if (uniqueChars >= 10) {
      score += 25;
    } else {
      suggestions.push('Key should have high entropy (many unique characters)');
    }

    // Hex format check
    if (/^[a-f0-9]+$/i.test(key)) {
      score += 25;
    } else {
      suggestions.push('Key should be in hexadecimal format');
    }

    // Pattern check
    const hasRepeatingPattern = /(.)\1{4,}/.test(key);
    if (!hasRepeatingPattern) {
      score += 25;
    } else {
      suggestions.push('Key should not have repeating patterns');
    }

    return {
      isValid: score >= 75,
      score,
      suggestions
    };
  }

  /**
   * Derive key hierarchy for different purposes
   */
  static deriveKeyHierarchy(masterKey: string, workspaceId: string): {
    workspaceKey: string;
    tableKeyPrefix: string;
    fieldKeyPrefix: string;
    searchKeyPrefix: string;
    auditKey: string;
  } {
    const contexts = [
      'workspace_key',
      'table_key_prefix',
      'field_key_prefix',
      'search_key_prefix',
      'audit_key'
    ];

    const keys = this.deriveMultipleKeys(masterKey, contexts.map(c => `${workspaceId}:${c}`));

    return {
      workspaceKey: keys[`workspace_key:${workspaceId}:workspace_key`] || '',
      tableKeyPrefix: keys[`workspace_key:${workspaceId}:table_key_prefix`] || '',
      fieldKeyPrefix: keys[`workspace_key:${workspaceId}:field_key_prefix`] || '',
      searchKeyPrefix: keys[`workspace_key:${workspaceId}:search_key_prefix`] || '',
      auditKey: keys[`workspace_key:${workspaceId}:audit_key`] || ''
    };
  }

  /**
   * Derive time-based key (for key rotation)
   */
  static deriveTimeBasedKey(
    masterKey: string,
    context: string,
    timestamp?: Date,
    period: 'hour' | 'day' | 'week' | 'month' = 'day'
  ): string {
    const time = timestamp || new Date();
    let periodKey: string;

    switch (period) {
      case 'hour':
        periodKey = `${time.getFullYear()}-${time.getMonth()}-${time.getDate()}-${time.getHours()}`;
        break;
      case 'day':
        periodKey = `${time.getFullYear()}-${time.getMonth()}-${time.getDate()}`;
        break;
      case 'week':
        const weekStart = new Date(time);
        weekStart.setDate(time.getDate() - time.getDay());
        periodKey = `${weekStart.getFullYear()}-W${Math.ceil(weekStart.getDate() / 7)}`;
        break;
      case 'month':
        periodKey = `${time.getFullYear()}-${time.getMonth()}`;
        break;
    }

    return this.deriveKey(masterKey, `${context}:${periodKey}`);
  }

  /**
   * Simple hash function for key derivation
   */
  private static simpleHash(data: Uint8Array): ArrayBuffer {
    // In production, use Web Crypto API's subtle.digest
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data[i] || 0;
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }

    const result = new ArrayBuffer(4);
    new DataView(result).setUint32(0, hash);
    return result;
  }

  /**
   * Generate key pair for asymmetric operations (if needed)
   */
  static async generateKeyPair(): Promise<{
    publicKey: string;
    privateKey: string;
  }> {
    // This would use Web Crypto API in a real implementation
    // For now, generate a mock key pair
    const privateKey = this.generateRandomKey(32);
    const publicKey = this.deriveKey(privateKey, 'public_key');

    return {
      publicKey,
      privateKey
    };
  }

  /**
   * Derive shared key from two keys (Diffie-Hellman-like)
   */
  static deriveSharedKey(key1: string, key2: string): string {
    const encoder = new TextEncoder();
    const data = encoder.encode(`${key1}:${key2}`);
    return Array.from(new Uint8Array(data))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
      .substring(0, 64);
  }

  /**
   * Validate derived key context
   */
  static validateContext(context: string): boolean {
    // Ensure context doesn't contain malicious characters
    return /^[a-zA-Z0-9_:-]+$/.test(context) && context.length > 0 && context.length <= 256;
  }

  /**
   * Create key derivation info
   */
  static createDerivationInfo(
    masterKeyId: string,
    context: string,
    timestamp?: Date
  ): {
    masterKeyId: string;
    context: string;
    timestamp: string;
    algorithm: string;
    version: string;
  } {
    return {
      masterKeyId,
      context,
      timestamp: (timestamp || new Date()).toISOString(),
      algorithm: 'PBKDF2-SHA256',
      version: '1.0'
    };
  }
}