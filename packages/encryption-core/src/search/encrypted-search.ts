import { AES256 } from '../algorithms/aes-256';
import { OPE } from '../algorithms/ope';
import { HMAC } from '../algorithms/hmac';
import type { EncryptionType } from '../types';
import type { FieldEncryptionConfig } from '../field-types';

export interface SearchToken {
  field: string;
  value: string;
  tokens: SearchTokenData[];
  encryptionType: EncryptionType;
}

export interface SearchTokenData {
  type: 'exact' | 'prefix' | 'suffix' | 'contains' | 'range';
  token: string;
  weight?: number;
}

export interface SearchResult {
  recordId: string;
  matches: FieldMatch[];
  score: number;
}

export interface FieldMatch {
  field: string;
  matchType: string;
  matchValue: string;
  highlightedValue?: string;
}

export class EncryptedSearch {
  private searchIndexes: Map<string, Map<string, Set<string>>> = new Map();

  /**
   * Generate search tokens for a value
   */
  async generateSearchTokens(
    field: string,
    value: any,
    encryptionConfig: FieldEncryptionConfig,
    encryptionKey: string
  ): Promise<SearchToken> {
    const tokens: SearchTokenData[] = [];
    const stringValue = String(value);

    if (!encryptionConfig.searchable || !value) {
      return {
        field,
        value: stringValue,
        tokens: [],
        encryptionType: encryptionConfig.type
      };
    }

    switch (encryptionConfig.type) {
      case 'AES-256-CBC':
        tokens.push(...await this.generateAESSearchTokens(stringValue, encryptionKey));
        break;
      case 'OPE':
        tokens.push(...await this.generateOPESearchTokens(value, encryptionKey));
        break;
      case 'HMAC-SHA256':
        tokens.push(...await this.generateHMACSearchTokens(stringValue, encryptionKey));
        break;
    }

    return {
      field,
      value: stringValue,
      tokens,
      encryptionType: encryptionConfig.type
    };
  }

  /**
   * Search in encrypted data
   */
  async search(
    query: string,
    fieldConfigs: Map<string, FieldEncryptionConfig>,
    encryptionKeys: Map<string, string>,
    options: {
      fuzzy?: boolean;
      caseSensitive?: boolean;
      includePartial?: boolean;
    } = {}
  ): Promise<SearchResult[]> {
    const {
      fuzzy = false,
      caseSensitive = false,
      includePartial = true
    } = options;

    const results: SearchResult[] = [];
    const queryTokens = this.tokenizeQuery(query);

    // Search through all indexes
    for (const [field, fieldIndex] of this.searchIndexes) {
      const config = fieldConfigs.get(field);
      if (!config || !config.searchable) continue;

      const fieldResults = await this.searchInField(
        field,
        queryTokens,
        config,
        encryptionKeys.get(field) || '',
        { fuzzy, caseSensitive, includePartial }
      );

      results.push(...fieldResults);
    }

    // Sort by score
    return results.sort((a, b) => b.score - a.score);
  }

  /**
   * Add record to search index
   */
  async addToIndex(
    recordId: string,
    field: string,
    value: any,
    encryptionConfig: FieldEncryptionConfig,
    encryptionKey: string
  ): Promise<void> {
    const searchTokens = await this.generateSearchTokens(
      field,
      value,
      encryptionConfig,
      encryptionKey
    );

    // Add tokens to index
    if (!this.searchIndexes.has(field)) {
      this.searchIndexes.set(field, new Map());
    }

    const fieldIndex = this.searchIndexes.get(field)!;

    for (const tokenData of searchTokens.tokens) {
      if (!fieldIndex.has(tokenData.token)) {
        fieldIndex.set(tokenData.token, new Set());
      }
      fieldIndex.get(tokenData.token)!.add(recordId);
    }
  }

  /**
   * Remove record from search index
   */
  removeFromIndex(recordId: string, field?: string): void {
    if (field) {
      // Remove from specific field
      const fieldIndex = this.searchIndexes.get(field);
      if (fieldIndex) {
        for (const [token, recordIds] of fieldIndex) {
          recordIds.delete(recordId);
          if (recordIds.size === 0) {
            fieldIndex.delete(token);
          }
        }
      }
    } else {
      // Remove from all fields
      for (const fieldIndex of this.searchIndexes.values()) {
        for (const [token, recordIds] of fieldIndex) {
          recordIds.delete(recordId);
          if (recordIds.size === 0) {
            fieldIndex.delete(token);
          }
        }
      }
    }
  }

  /**
   * Update record in search index
   */
  async updateIndex(
    recordId: string,
    field: string,
    oldValue: any,
    newValue: any,
    encryptionConfig: FieldEncryptionConfig,
    encryptionKey: string
  ): Promise<void> {
    // Remove old value
    this.removeFromIndex(recordId, field);

    // Add new value
    await this.addToIndex(recordId, field, newValue, encryptionConfig, encryptionKey);
  }

  /**
   * Get search statistics
   */
  getSearchStats(): {
    totalTokens: number;
    totalFields: number;
    fieldStats: Array<{
      field: string;
      tokenCount: number;
      recordCount: number;
    }>;
  } {
    let totalTokens = 0;
    const fieldStats: Array<{
      field: string;
      tokenCount: number;
      recordCount: number;
    }> = [];

    for (const [field, fieldIndex] of this.searchIndexes) {
      const tokenCount = fieldIndex.size;
      const allRecordIds = new Set<string>();

      for (const recordIds of fieldIndex.values()) {
        for (const recordId of recordIds) {
          allRecordIds.add(recordId);
        }
      }

      totalTokens += tokenCount;
      fieldStats.push({
        field,
        tokenCount,
        recordCount: allRecordIds.size
      });
    }

    return {
      totalTokens,
      totalFields: this.searchIndexes.size,
      fieldStats
    };
  }

  /**
   * Clear search index
   */
  clearIndex(field?: string): void {
    if (field) {
      this.searchIndexes.delete(field);
    } else {
      this.searchIndexes.clear();
    }
  }

  /**
   * Generate search tokens for AES encrypted fields
   */
  private async generateAESSearchTokens(
    value: string,
    encryptionKey: string
  ): Promise<SearchTokenData[]> {
    const tokens: SearchTokenData[] = [];

    // Exact match token
    const exactToken = await HMAC.createSearchableHash(value, encryptionKey);
    tokens.push({
      type: 'exact',
      token: exactToken,
      weight: 1.0
    });

    // Prefix tokens for autocomplete
    const prefixes = this.generatePrefixes(value);
    for (const prefix of prefixes) {
      const prefixToken = await HMAC.createSearchableHash(prefix, encryptionKey);
      tokens.push({
        type: 'prefix',
        token: prefixToken,
        weight: 0.8
      });
    }

    // Word tokens for full-text search
    const words = this.tokenizeWords(value);
    for (const word of words) {
      const wordToken = await HMAC.createSearchableHash(word, encryptionKey);
      tokens.push({
        type: 'contains',
        token: wordToken,
        weight: 0.6
      });
    }

    return tokens;
  }

  /**
   * Generate search tokens for OPE encrypted fields
   */
  private async generateOPESearchTokens(
    value: number | Date,
    encryptionKey: string
  ): Promise<SearchTokenData[]> {
    const tokens: SearchTokenData[] = [];

    let searchValue: number;
    let range: { min: number; max: number };

    if (value instanceof Date) {
      searchValue = value.getTime();
      const now = new Date();
      const oneYear = 365 * 24 * 60 * 60 * 1000;
      range = { min: now.getTime() - oneYear, max: now.getTime() + oneYear };
    } else {
      searchValue = value;
      range = { min: value - 1000, max: value + 1000 }; // ±1000 range
    }

    // Exact match
    const encrypted = await OPE.encryptNumber(searchValue, encryptionKey, range);
    const exactHashed = await HMAC.createSearchableHash(encrypted.data, encryptionKey);
    tokens.push({
      type: 'exact',
      token: exactHashed,
      weight: 1.0
    });

    // Range tokens for approximate search
    const searchTokens = await OPE.generateSearchTokens(searchValue, encryptionKey, range);
    const rangeTokenRaw = `${searchTokens.range.min}-${searchTokens.range.max}`;
    const rangeHashed = await HMAC.createSearchableHash(rangeTokenRaw, encryptionKey);
    tokens.push({
      type: 'range',
      token: rangeHashed,
      weight: 0.7
    });

    return tokens;
  }

  /**
   * Generate search tokens for HMAC hashed fields
   */
  private async generateHMACSearchTokens(
    value: string,
    encryptionKey: string
  ): Promise<SearchTokenData[]> {
    const tokens: SearchTokenData[] = [];

    // Exact match token
    const hashed = await HMAC.hash(value, encryptionKey);
    tokens.push({
      type: 'exact',
      token: hashed.data,
      weight: 1.0
    });

    // For selection fields, also store original value for exact matching
    tokens.push({
      type: 'exact',
      token: await HMAC.createSearchableHash(value, encryptionKey),
      weight: 1.0
    });

    return tokens;
  }

  /**
   * Search in a specific field
   */
  private async searchInField(
    field: string,
    queryTokens: string[],
    config: FieldEncryptionConfig,
    encryptionKey: string,
    options: {
      fuzzy: boolean;
      caseSensitive: boolean;
      includePartial: boolean;
    }
  ): Promise<SearchResult[]> {
    const results: SearchResult[] = [];
    const fieldIndex = this.searchIndexes.get(field);

    if (!fieldIndex) return results;

    const matchingRecordIds = new Set<string>();
    const matchScores = new Map<string, number>();

    for (const queryToken of queryTokens) {
      let searchToken: string;

      // Generate search token based on encryption type
      switch (config.type) {
        case 'AES-256-CBC':
          searchToken = await HMAC.createSearchableHash(queryToken, encryptionKey);
          break;
        case 'OPE':
          // For OPE, we need to handle number parsing
          const numValue = parseFloat(queryToken);
          if (!isNaN(numValue)) {
            const encrypted = await OPE.encryptNumber(numValue, encryptionKey);
            searchToken = await HMAC.createSearchableHash(encrypted.data, encryptionKey);
          } else {
            searchToken = queryToken; // Fallback
          }
          break;
        case 'HMAC-SHA256':
          searchToken = await HMAC.createSearchableHash(queryToken, encryptionKey);
          break;
        default:
          searchToken = queryToken;
      }

      // Find matching records
      const recordIds = fieldIndex.get(searchToken);
      if (recordIds) {
        for (const recordId of recordIds) {
          matchingRecordIds.add(recordId);
          const currentScore = matchScores.get(recordId) || 0;
          matchScores.set(recordId, currentScore + 1);
        }
      }
    }

    // Convert to search results
    for (const [recordId, score] of matchScores) {
      results.push({
        recordId,
        matches: [{
          field,
          matchType: 'exact',
          matchValue: queryTokens.join(' ')
        }],
        score
      });
    }

    return results;
  }

  /**
   * Tokenize search query
   */
  private tokenizeQuery(query: string): string[] {
    return query
      .toLowerCase()
      .split(/\s+/)
      .filter(token => token.length > 0);
  }

  /**
   * Generate prefixes for a string
   */
  private generatePrefixes(value: string, minLength: number = 2): string[] {
    const prefixes: string[] = [];
    const normalizedValue = value.toLowerCase();

    for (let i = minLength; i <= normalizedValue.length; i++) {
      prefixes.push(normalizedValue.substring(0, i));
    }

    return prefixes;
  }

  /**
   * Tokenize words in a string
   */
  private tokenizeWords(value: string): string[] {
    return value
      .toLowerCase()
      .split(/\W+/)
      .filter(word => word.length > 2);
  }
}