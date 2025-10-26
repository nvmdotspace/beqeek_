import { AES256 } from '../algorithms/aes-256';
import { HMAC } from '../algorithms/hmac';
import { OPE } from '../algorithms/ope';
import { EncryptedSearch } from '../search/encrypted-search';
import type { EncryptedData } from '../types';
import type { FieldEncryptionConfig } from '../field-types';
import CryptoJS from 'crypto-js';

export type EncryptedRecord = Record<string, EncryptedData | EncryptedData[]>;
export type HashedKeywords = Record<string, string[]>;
export type RecordHashes = Record<string, string | string[]>;

export interface EncryptedPayload {
  record: EncryptedRecord;
  hashed_keywords: HashedKeywords;
  record_hashes: RecordHashes;
  record_hash: string;
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
 * Build overall record_hash from field-level record_hashes.
 * Uses a canonical string of `field=hashes` joined by '|' in sorted field order,
 * and derives a composite key by SHA-256 over the concatenated per-field keys.
 */
export async function buildTotalRecordHash(
  recordHashes: RecordHashes,
  encryptionKeys: Map<string, string>
): Promise<string> {
  const fields = Object.keys(recordHashes).sort();
  const canonicalParts: string[] = [];
  const keyParts: string[] = [];

  for (const field of fields) {
    const val = recordHashes[field];
    keyParts.push(encryptionKeys.get(field) || '');
    if (Array.isArray(val)) {
      canonicalParts.push(`${field}=${val.join(',')}`);
    } else {
      canonicalParts.push(`${field}=${val}`);
    }
  }

  const canonical = canonicalParts.join('|');
  const compositeKeyHex = CryptoJS.SHA256(keyParts.join('|')).toString();
  return await HMAC.createSearchableHash(canonical, compositeKeyHex);
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
  const record_hash = await buildTotalRecordHash(record_hashes, encryptionKeys);

  return { record, hashed_keywords, record_hashes, record_hash };
}

/**
 * Verify record integrity by recomputing field hashes and total record_hash.
 * Returns { ok, mismatches } where mismatches lists fields that differ and 'total'.
 */
export async function verifyRecordIntegrity(
  record: EncryptedRecord,
  recordHashes: RecordHashes,
  encryptionKeys: Map<string, string>,
  expectedRecordHash?: string
): Promise<{ ok: boolean; mismatches: string[] }> {
  const mismatches: string[] = [];
  const recomputed = await buildRecordHashes(record, encryptionKeys);

  const fields = Array.from(new Set([
    ...Object.keys(recordHashes),
    ...Object.keys(recomputed)
  ])).sort();

  for (const field of fields) {
    const a = (recordHashes as Record<string, string | string[] | undefined>)[field];
    const b = (recomputed as Record<string, string | string[] | undefined>)[field];

    if (Array.isArray(a) && Array.isArray(b)) {
      const aa = a as string[];
      const bb = b as string[];
      if (aa.length !== bb.length) {
        mismatches.push(field);
        continue;
      }
      for (let i = 0; i < aa.length; i++) {
        if (!HMAC.compare(aa[i]!, bb[i]!)) {
          mismatches.push(field);
          break;
        }
      }
    } else if (typeof a === 'string' && typeof b === 'string') {
      if (!HMAC.compare(a, b)) {
        mismatches.push(field);
      }
    } else {
      // Type mismatch or missing value
      mismatches.push(field);
    }
  }

  const recomputedTotal = await buildTotalRecordHash(recomputed, encryptionKeys);
  const expectedTotal = expectedRecordHash ?? await buildTotalRecordHash(recordHashes, encryptionKeys);
  if (!HMAC.compare(recomputedTotal, expectedTotal)) {
    mismatches.push('total');
  }

  return { ok: mismatches.length === 0, mismatches };
}