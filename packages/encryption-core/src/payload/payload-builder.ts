import { AES256 } from '../algorithms/aes-256';
import { HMAC } from '../algorithms/hmac';
import { OPE } from '../algorithms/ope';
import { EncryptedSearch } from '../search/encrypted-search';
import type { EncryptedData } from '../types';
import type { FieldEncryptionConfig } from '../field-types';

export type EncryptedRecord = Record<string, EncryptedData | EncryptedData[]>;
export type HashedKeywords = Record<string, string[]>;
export type RecordHashes = Record<string, string | string[]>;

export interface EncryptedPayload {
  record: EncryptedRecord;
  hashed_keywords: HashedKeywords;
  record_hashes: RecordHashes;
}

export interface BuildPayloadOptions {
  packAesInRecord?: boolean;
}

/**
 * Build encrypted record values based on field configs and per-field keys.
 */
export async function buildEncryptedRecord(
  rawRecord: Record<string, any>,
  fieldConfigs: Map<string, FieldEncryptionConfig>,
  encryptionKeys: Map<string, string>,
  options: BuildPayloadOptions = {}
): Promise<EncryptedRecord> {
  const result: EncryptedRecord = {};

  for (const [field, value] of Object.entries(rawRecord)) {
    const config = fieldConfigs.get(field);
    if (!config || !config.enabled) continue;

    const key = encryptionKeys.get(field);
    if (!key) continue;

    if (value === null || value === undefined) continue;

    switch (config.type) {
      case 'AES-256-CBC': {
        const stringValue = String(value);
        const enc = await AES256.encrypt(stringValue, key);
        if (options.packAesInRecord) {
          const packed = AES256.packIvPrefixed(enc);
          result[field] = {
            ...enc,
            data: packed,
            metadata: {
              ...(enc.metadata || {}),
              ivPrefixed: true
            }
          };
        } else {
          result[field] = enc;
        }
        break;
      }
      case 'HMAC-SHA256': {
        if (Array.isArray(value)) {
          const arr: EncryptedData[] = [];
          for (const v of value) {
            arr.push(await HMAC.hash(String(v), key));
          }
          result[field] = arr;
        } else {
          result[field] = await HMAC.hash(String(value), key);
        }
        break;
      }
      case 'OPE': {
        if (typeof value === 'number') {
          result[field] = await OPE.encryptNumber(value, key);
        } else if (value instanceof Date) {
          result[field] = await OPE.encryptDate(value, key);
        } else if (typeof value === 'string') {
          // try time format HH:mm or HH:mm:ss
          result[field] = await OPE.encryptTime(value, key);
        }
        break;
      }
      default: {
        // NONE or unsupported, skip
        break;
      }
    }
  }

  return result;
}

/**
 * Build hashed keywords for search. Uses EncryptedSearch to generate tokens.
 * For OPE tokens, additionally HMAC-hash the token strings to unify format.
 */
export async function buildHashedKeywords(
  rawRecord: Record<string, any>,
  fieldConfigs: Map<string, FieldEncryptionConfig>,
  encryptionKeys: Map<string, string>
): Promise<HashedKeywords> {
  const search = new EncryptedSearch();
  const result: HashedKeywords = {};

  for (const [field, value] of Object.entries(rawRecord)) {
    const config = fieldConfigs.get(field);
    if (!config || !config.searchable) continue;

    const key = encryptionKeys.get(field) || '';
    if (!value) continue;

    const tokens = await search.generateSearchTokens(field, value, config, key);

    // Tokens from EncryptedSearch are already normalized/hashes where applicable
    const normalized: string[] = [];
    for (const td of tokens.tokens) {
      normalized.push(td.token);
    }

    if (normalized.length > 0) {
      result[field] = normalized;
    }
  }

  return result;
}

/**
 * Build record hashes: HMAC-SHA256 over encrypted field values.
 * For AES, combine IV + ciphertext using packIvPrefixed before hashing.
 * For array values (e.g., select list), produce array of hashes.
 */
export async function buildRecordHashes(
  encryptedRecord: EncryptedRecord,
  encryptionKeys: Map<string, string>
): Promise<RecordHashes> {
  const result: RecordHashes = {};

  for (const [field, encVal] of Object.entries(encryptedRecord)) {
    const key = encryptionKeys.get(field);
    if (!key) continue;

    if (Array.isArray(encVal)) {
      const hashes: string[] = [];
      for (const item of encVal) {
        const sourceStr = item.algorithm === 'AES-256-CBC'
          ? (item.metadata?.ivPrefixed ? item.data : AES256.packIvPrefixed(item))
          : item.data;
        hashes.push(await HMAC.createSearchableHash(sourceStr, key));
      }
      result[field] = hashes;
    } else {
      const sourceStr = encVal.algorithm === 'AES-256-CBC'
        ? (encVal.metadata?.ivPrefixed ? encVal.data : AES256.packIvPrefixed(encVal))
        : encVal.data;
      result[field] = await HMAC.createSearchableHash(sourceStr, key);
    }
  }

  return result;
}

/**
 * Build the full encrypted payload according to BE expectations.
 */
export async function buildEncryptedPayload(
  rawRecord: Record<string, any>,
  fieldConfigs: Map<string, FieldEncryptionConfig>,
  encryptionKeys: Map<string, string>,
  options: BuildPayloadOptions = {}
): Promise<EncryptedPayload> {
  const record = await buildEncryptedRecord(rawRecord, fieldConfigs, encryptionKeys, options);
  const hashed_keywords = await buildHashedKeywords(rawRecord, fieldConfigs, encryptionKeys);
  const record_hashes = await buildRecordHashes(record, encryptionKeys);

  return { record, hashed_keywords, record_hashes };
}