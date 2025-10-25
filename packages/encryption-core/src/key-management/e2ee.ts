import CryptoJS from 'crypto-js';

/**
 * E2EE Handshake utilities
 * - encryptionAuthKey = SHA256 applied 3 times over encryptionKey
 * - verification uses timing-safe comparison
 */
export class E2EE {
  /**
   * Compute encryptionAuthKey by applying SHA256 three times on the encryptionKey (hex string)
   */
  static computeEncryptionAuthKey(encryptionKey: string): string {
    const step1 = CryptoJS.SHA256(encryptionKey).toString();
    const step2 = CryptoJS.SHA256(step1).toString();
    const step3 = CryptoJS.SHA256(step2).toString();
    return step3;
  }

  /**
   * Timing-safe comparison
   */
  static safeCompare(a: string, b: string): boolean {
    if (a.length !== b.length) return false;
    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return result === 0;
  }

  /**
   * Verify that the provided encryptionKey corresponds to the encryptionAuthKey
   */
  static verifyEncryptionKey(encryptionKey: string, encryptionAuthKey: string): boolean {
    const computed = this.computeEncryptionAuthKey(encryptionKey);
    return this.safeCompare(computed, encryptionAuthKey);
  }
}