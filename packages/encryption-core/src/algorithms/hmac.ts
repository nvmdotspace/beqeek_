/**
 * HMAC-SHA256 implementation
 * Compatible with legacy JavaScript implementation
 */

import CryptoJS from 'crypto-js';

export class HMAC {
  /**
   * Create HMAC-SHA256 hash
   * Returns hex string directly (legacy compatible)
   */
  static hash(value: string, key: string): string {
    return CryptoJS.HmacSHA256(value, key).toString(CryptoJS.enc.Hex);
  }

  /**
   * Hash array of values
   * For SELECT_LIST and CHECKBOX_LIST fields
   */
  static hashArray(values: string[], key: string): string[] {
    return values.map((v) => this.hash(v, key));
  }

  /**
   * Hash single select value
   */
  static hashSelectOne(value: string, key: string): string {
    return this.hash(value, key);
  }

  /**
   * Hash multiple select values
   */
  static hashSelectList(values: string[], key: string): string[] {
    return this.hashArray(values, key);
  }

  /**
   * Hash checkbox value
   */
  static hashCheckbox(value: string, key: string): string {
    return this.hash(value, key);
  }

  /**
   * Hash checkbox list values
   */
  static hashCheckboxList(values: string[], key: string): string[] {
    return this.hashArray(values, key);
  }
}
