/**
 * Decryption cache utility
 * Caches decrypted values to avoid redundant decryption operations
 *
 * Performance benefits:
 * - Reduces CPU usage from repeated decryption
 * - Improves rendering performance for large datasets
 * - Memory-efficient with LRU eviction
 */

interface CacheEntry<T> {
  value: T;
  timestamp: number;
  accessCount: number;
}

/**
 * LRU Cache for decrypted values
 * Automatically evicts least recently used entries when capacity is reached
 */
export class DecryptionCache<T = unknown> {
  private cache: Map<string, CacheEntry<T>>;
  private readonly maxSize: number;
  private readonly ttl: number; // Time to live in milliseconds

  /**
   * Create a new decryption cache
   * @param maxSize - Maximum number of entries (default: 1000)
   * @param ttl - Time to live in milliseconds (default: 5 minutes)
   */
  constructor(maxSize = 1000, ttl = 5 * 60 * 1000) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttl = ttl;
  }

  /**
   * Generate cache key from encrypted value and field metadata
   */
  private generateKey(encryptedValue: unknown, fieldName: string, fieldType: string): string {
    return `${fieldName}:${fieldType}:${JSON.stringify(encryptedValue)}`;
  }

  /**
   * Get cached decrypted value
   * @returns Cached value or undefined if not found or expired
   */
  get(encryptedValue: unknown, fieldName: string, fieldType: string): T | undefined {
    const key = this.generateKey(encryptedValue, fieldName, fieldType);
    const entry = this.cache.get(key);

    if (!entry) {
      return undefined;
    }

    // Check if entry has expired
    const now = Date.now();
    if (now - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return undefined;
    }

    // Update access count and timestamp (LRU)
    entry.accessCount++;
    entry.timestamp = now;

    return entry.value;
  }

  /**
   * Set cached decrypted value
   * Evicts least recently used entry if cache is full
   */
  set(encryptedValue: unknown, fieldName: string, fieldType: string, decryptedValue: T): void {
    const key = this.generateKey(encryptedValue, fieldName, fieldType);

    // Evict LRU entry if cache is full
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this.evictLRU();
    }

    this.cache.set(key, {
      value: decryptedValue,
      timestamp: Date.now(),
      accessCount: 1,
    });
  }

  /**
   * Evict least recently used entry
   */
  private evictLRU(): void {
    let lruKey: string | null = null;
    let lruTimestamp = Infinity;
    let lruAccessCount = Infinity;

    // Find entry with the oldest timestamp and lowest access count
    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < lruTimestamp || (entry.timestamp === lruTimestamp && entry.accessCount < lruAccessCount)) {
        lruKey = key;
        lruTimestamp = entry.timestamp;
        lruAccessCount = entry.accessCount;
      }
    }

    if (lruKey) {
      this.cache.delete(lruKey);
    }
  }

  /**
   * Check if cache has entry for given value
   */
  has(encryptedValue: unknown, fieldName: string, fieldType: string): boolean {
    const key = this.generateKey(encryptedValue, fieldName, fieldType);
    const entry = this.cache.get(key);

    if (!entry) {
      return false;
    }

    // Check if expired
    const now = Date.now();
    if (now - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Clear all cached entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Clear expired entries
   */
  clearExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.ttl) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      ttl: this.ttl,
      entries: Array.from(this.cache.entries()).map(([key, entry]) => ({
        key,
        timestamp: entry.timestamp,
        accessCount: entry.accessCount,
        age: Date.now() - entry.timestamp,
      })),
    };
  }
}

/**
 * Global decryption cache instance
 * Shared across all decryption operations for maximum efficiency
 */
export const globalDecryptionCache = new DecryptionCache(1000, 5 * 60 * 1000);

/**
 * Create a scoped decryption cache for specific use cases
 * @param maxSize - Maximum cache size
 * @param ttl - Time to live in milliseconds
 */
export function createDecryptionCache<T = unknown>(maxSize?: number, ttl?: number): DecryptionCache<T> {
  return new DecryptionCache<T>(maxSize, ttl);
}
