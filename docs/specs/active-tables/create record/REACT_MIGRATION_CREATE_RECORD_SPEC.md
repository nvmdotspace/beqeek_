# React Migration: Create Record Technical Specification

## Prompt Template for Claude Code

```
Create a React component for creating records in an Active Tables system with the following requirements:

1. **Field Types Support**: Implement support for these field types with proper encryption:
   - Text fields: SHORT_TEXT, TEXT, EMAIL, URL (AES-CBC encryption)
   - Rich text: RICH_TEXT (AES-CBC encryption with SimpleMDE)
   - Numeric: INTEGER, NUMERIC (Order-Preserving Encryption)
   - Date/Time: DATE, DATETIME, TIME (Order-Preserving Encryption)
   - Boolean: CHECKBOX_YES_NO (HMAC-SHA256 hashing)
   - Select: SELECT_ONE, SELECT_LIST (HMAC-SHA256 hashing)
   - References: SELECT_ONE_RECORD, SELECT_LIST_RECORD (no encryption, async loading)
   - Users: SELECT_ONE_WORKSPACE_USER, SELECT_LIST_WORKSPACE_USER (no encryption)
   - Auto-reference: FIRST_REFERENCE_RECORD (read-only)

2. **Encryption Implementation**:
   - Port the OPEncryptor class from the Laravel codebase
   - Implement AES-CBC encryption with random IV generation
   - Implement HMAC-SHA256 hashing for select/checkbox fields
   - Generate record hashes for all fields

3. **Form Validation**:
   - Required field validation
   - Field-type specific validation
   - Real-time validation feedback

4. **API Integration**:
   - Endpoint: POST /api/workspace/{workspaceId}/workflow/post/active_tables/{tableId}/records
   - Include proper authentication headers
   - Handle response and error states

5. **UI Components**:
   - Use react-hook-form for form management
   - Implement Select2 equivalent with react-select for async loading
   - Use react-datepicker for date/time fields
   - Use SimpleMDE React equivalent for rich text
   - Implement proper loading states and error handling

6. **Data Flow**:
   - Collect form data based on field types
   - Apply field-specific encryption/hashing
   - Generate record hashes
   - Create final payload structure
   - Submit to API and handle response

Reference the Laravel implementation in /Users/macos/Workspace/buildinpublic/nvm/beqeek-laravel/resources/views/html-module/active-table-records.blade.php for exact encryption logic and field handling.
```

## Detailed Implementation Guide

### 1. Data Models and Types

```typescript
// types/field.types.ts
export enum FieldType {
  SHORT_TEXT = 'SHORT_TEXT',
  RICH_TEXT = 'RICH_TEXT',
  TEXT = 'TEXT',
  EMAIL = 'EMAIL',
  URL = 'URL',
  INTEGER = 'INTEGER',
  NUMERIC = 'NUMERIC',
  DATE = 'DATE',
  DATETIME = 'DATETIME',
  TIME = 'TIME',
  CHECKBOX_YES_NO = 'CHECKBOX_YES_NO',
  CHECKBOX_ONE = 'CHECKBOX_ONE',
  CHECKBOX_LIST = 'CHECKBOX_LIST',
  SELECT_ONE = 'SELECT_ONE',
  SELECT_LIST = 'SELECT_LIST',
  SELECT_ONE_RECORD = 'SELECT_ONE_RECORD',
  SELECT_LIST_RECORD = 'SELECT_LIST_RECORD',
  SELECT_ONE_WORKSPACE_USER = 'SELECT_ONE_WORKSPACE_USER',
  SELECT_LIST_WORKSPACE_USER = 'SELECT_LIST_WORKSPACE_USER',
  FIRST_REFERENCE_RECORD = 'FIRST_REFERENCE_RECORD',
}

export interface FieldOption {
  value: string;
  text: string;
  text_color?: string;
  background_color?: string;
}

export interface Field {
  name: string;
  type: FieldType;
  label: string;
  required?: boolean;
  placeholder?: string;
  defaultValue?: any;
  options?: FieldOption[];
  referenceTableId?: string;
  referenceLabelField?: string;
  referenceField?: string;
  additionalCondition?: string;
}

export interface Table {
  id: string;
  name: string;
  config: {
    fields: Field[];
    encryptionKey: string;
    encryptionAuthKey: string;
    hashedKeywordFields: string[];
    e2eeEncryption?: boolean;
  };
}

export interface CreateRecordPayload {
  record: Record<string, any>;
  hashed_keywords: Record<string, string | string[]>;
  record_hashes: Record<string, string | string[]>;
}

export interface CreateRecordResponse {
  message: string;
  data: {
    id: string;
  };
}
```

### 2. Encryption Service Implementation

```typescript
// services/encryption.service.ts
import CryptoJS from 'crypto-js';

export class EncryptionService {
  private opeEncryptor: OPEncryptor;

  constructor(private encryptionKey: string) {
    this.opeEncryptor = new OPEncryptor(encryptionKey);
  }

  /**
   * Encrypt field value based on field type
   */
  encryptField(field: Field, value: any): any {
    if (!value) return value;

    switch (field.type) {
      // AES-CBC Encryption for text fields
      case FieldType.SHORT_TEXT:
      case FieldType.RICH_TEXT:
      case FieldType.TEXT:
      case FieldType.EMAIL:
      case FieldType.URL:
        return this.encryptAES(value);

      // Order-Preserving Encryption for date/time fields
      case FieldType.DATE:
        return this.opeEncryptor.encryptStringDate(value);
      case FieldType.DATETIME:
        return this.opeEncryptor.encryptStringDatetime(value);
      case FieldType.TIME:
        return this.opeEncryptor.encryptString(value);

      // Order-Preserving Encryption for numeric fields
      case FieldType.INTEGER:
        return this.opeEncryptor.encryptInt(value);
      case FieldType.NUMERIC:
        return this.opeEncryptor.encryptDecimal(value);

      // HMAC-SHA256 Hashing for boolean fields
      case FieldType.CHECKBOX_YES_NO:
        return CryptoJS.HmacSHA256(value.toString(), this.encryptionKey).toString();

      // HMAC-SHA256 Hashing for select fields
      case FieldType.SELECT_ONE:
      case FieldType.CHECKBOX_ONE:
        return CryptoJS.HmacSHA256(value, this.encryptionKey).toString();

      case FieldType.SELECT_LIST:
      case FieldType.CHECKBOX_LIST:
        return value.map((v: string) => CryptoJS.HmacSHA256(v, this.encryptionKey).toString());

      // No encryption for reference fields
      case FieldType.SELECT_ONE_RECORD:
      case FieldType.SELECT_LIST_RECORD:
      case FieldType.SELECT_ONE_WORKSPACE_USER:
      case FieldType.SELECT_LIST_WORKSPACE_USER:
      case FieldType.FIRST_REFERENCE_RECORD:
        return value;

      default:
        return value;
    }
  }

  /**
   * AES-CBC encryption with random IV
   */
  private encryptAES(data: string): string {
    const keyBytes = CryptoJS.enc.Utf8.parse(this.encryptionKey);
    const iv = CryptoJS.lib.WordArray.random(16); // 16 bytes IV
    const encrypted = CryptoJS.AES.encrypt(data, keyBytes, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    // Return IV + ciphertext as base64 (same as Laravel implementation)
    return CryptoJS.enc.Base64.stringify(iv.concat(encrypted.ciphertext));
  }

  /**
   * Generate record hashes for all fields
   */
  generateRecordHashes(record: Record<string, any>): Record<string, string | string[]> {
    const hashes: Record<string, string | string[]> = {};

    Object.entries(record).forEach(([fieldName, value]) => {
      if (!value) return;

      // Handle array values (checkbox lists, select lists)
      if (Array.isArray(value)) {
        hashes[fieldName] = value.map((item) => CryptoJS.HmacSHA256(item, this.encryptionKey).toString());
      } else {
        hashes[fieldName] = CryptoJS.HmacSHA256(value.toString(), this.encryptionKey).toString();
      }
    });

    return hashes;
  }

  /**
   * Generate hashed keywords for searchable fields
   */
  generateHashedKeywords(
    record: Record<string, any>,
    hashedKeywordFields: string[],
  ): Record<string, string | string[]> {
    const keywords: Record<string, string | string[]> = {};

    hashedKeywordFields.forEach((fieldName) => {
      const value = record[fieldName];
      if (value) {
        if (Array.isArray(value)) {
          keywords[fieldName] = value.map((v) => CryptoJS.HmacSHA256(v, this.encryptionKey).toString());
        } else {
          keywords[fieldName] = CryptoJS.HmacSHA256(value.toString(), this.encryptionKey).toString();
        }
      }
    });

    return keywords;
  }
}
```

### 3. OPEncryptor Port

```typescript
// services/ope-encryptor.service.ts
import CryptoJS from 'crypto-js';

export class OPEncryptor {
  private chunkSize = 1;
  private multiplier: number;
  private offsets: number[];
  private cumSteps: Record<number, number> = {};
  private length: number = 64;

  constructor(private secretKey: string) {
    // Generate 32 offsets from key hash
    this.offsets = this.generateChaoticOffsets(secretKey);

    // Create HMAC SHA256 for multiplier
    const prf = CryptoJS.HmacSHA256(`secret|${secretKey}`, secretKey);
    const prfBytes = this.wordArrayToByteString(prf);
    this.multiplier = Math.max(1, this.getUIntFromHash(prfBytes, 0, 5) % 2147483647);

    // Build monotone map
    this.buildMonotoneMap();
  }

  /**
   * Port of PHP encryptString function
   */
  encryptString(str: string): string {
    this.length = 64;
    return this.encrypt(str, str);
  }

  /**
   * Port of PHP encryptStringDate function
   */
  encryptStringDate(str: string): string {
    this.length = 10;
    return this.encrypt(str, str);
  }

  /**
   * Port of PHP encryptStringDatetime function
   */
  encryptStringDatetime(str: string): string {
    this.length = 26;
    return this.encrypt(str, str);
  }

  /**
   * Port of PHP encryptInt function
   */
  encryptInt(str: string): string {
    this.length = 20;
    return this.encrypt(this.intToLatin(str), str);
  }

  /**
   * Port of PHP encryptDecimal function
   */
  encryptDecimal(str: string, fracLength = 10): string {
    this.length = 65;
    return this.encrypt(this.decimalToLatin(str, fracLength), str);
  }

  /**
   * Core encryption logic (port of PHP encrypt function)
   */
  private encrypt(str: string, origStr: string): string {
    if (!this.cumSteps) {
      this.buildMonotoneMap();
    }

    str = str.padStart(this.length, '\0');
    let numStr = this.stringToAsciiNumber(str);

    const preChunks = [];
    for (let i = 0; i < numStr.length; i += this.chunkSize * 3) {
      preChunks.push(numStr.slice(i, i + this.chunkSize * 3));
    }

    let chunks = preChunks;

    for (let i = 0; i < chunks.length; i++) {
      let p_num = parseInt(chunks[i]);

      const F = this.monotoneF(p_num);
      const no = this.boundedNoise(p_num, F);
      const cInt = F + no;

      chunks[i] = cInt.toString();
    }

    let ciphertext = chunks.join('');
    ciphertext = this.toBaseSecure(ciphertext, this.generateSecretAlphabet(this.length + this.offsets[30], 48));
    ciphertext = this.toBaseSecure(
      this.stringToAsciiNumber(ciphertext),
      this.generateSecretAlphabet(this.length + this.offsets[31], 48),
    );

    const strong_enc = this.encryptData(origStr, this.secretKey);
    const full_ciphertext = ciphertext + '|' + strong_enc;

    return full_ciphertext;
  }

  /**
   * Port of PHP intToLatin function
   */
  private intToLatin(num: string): string {
    const lettersLower = 'abcdefghijklmnopqrstuvwxyz'.split('');
    const lettersUpper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const base = 26;

    const maxPositive = Number.MAX_SAFE_INTEGER;
    const maxNegative = Number.MAX_SAFE_INTEGER;
    const lenPos = Math.ceil(Math.log(maxPositive + 1) / Math.log(base));
    const lenNeg = Math.ceil(Math.log(maxNegative + 1) / Math.log(base));
    const length = Math.max(lenPos, lenNeg);

    const encode = (value: number, alphabet: string[], len: number): string => {
      let str = '';
      do {
        const remainder = value % base;
        str = alphabet[remainder] + str;
        value = Math.floor(value / base);
      } while (value > 0);
      return str.padStart(len, alphabet[0]);
    };

    const numValue = parseInt(num);
    if (numValue >= 0) {
      return encode(numValue, lettersLower, length);
    }

    const offset = numValue - Number.MIN_SAFE_INTEGER;
    return encode(offset, lettersUpper, length);
  }

  /**
   * Port of PHP generateChaoticOffsets function
   */
  private generateChaoticOffsets(key: string, numOffsets = 32): number[] {
    let x0 = 0.5; // Initial value
    const r = 3.999; // Chaotic regime
    let offsets: number[] = [];
    let x = x0;
    let cumulative = 0;

    for (let i = 0; i < numOffsets; i++) {
      x = r * x * (1 - x);
      const offset = Math.floor(x * 1e9);
      cumulative += offset;
      offsets.push(cumulative % 2147483647);
    }

    return offsets;
  }

  /**
   * Port of PHP buildMonotoneMap function
   */
  private buildMonotoneMap(): void {
    const minP = 100,
      maxP = 355;
    const Dmax = 1000;
    let cum = 0;
    this.cumSteps = {};

    for (let p = minP; p <= maxP; p++) {
      const prf = CryptoJS.HmacSHA256(`step|${p}`, this.secretKey);
      const prfHex = prf.toString(CryptoJS.enc.Hex);
      const prfBytes = prfHex
        .match(/.{2}/g)!
        .map((b) => String.fromCharCode(parseInt(b, 16)))
        .join('');

      const stepRaw = this.getUIntFromHash(prfBytes, 0, 4);
      const step = 1 + (stepRaw % Dmax);

      cum += step;
      this.cumSteps[p] = cum;
    }
  }

  /**
   * Port of PHP monotoneF function
   */
  private monotoneF(p_num: number): number {
    let S = 0;
    let offsetHashChain = '';

    for (let i = 0; i < 32; i++) {
      offsetHashChain = offsetHashChain + this.offsets[i].toString();
      const wa = CryptoJS.enc.Latin1.parse(offsetHashChain);
      const hmac = CryptoJS.HmacSHA256(wa, this.secretKey);
      offsetHashChain = hmac.toString(CryptoJS.enc.Latin1);
      S += this.getUIntFromHash(offsetHashChain, 0, 4);
    }

    S = S % 2147483647;
    const cum = this.cumSteps[p_num] || 0;
    return S + this.multiplier * cum;
  }

  /**
   * Port of PHP boundedNoise function
   */
  private boundedNoise(p_num: number, F: number): number {
    const minGap = Math.max(1, Math.floor(0.1 * this.multiplier));
    const max = Math.max(minGap, Math.floor(0.8 * this.multiplier));

    const prf = CryptoJS.HmacSHA256(`noise|${p_num}|${F}`, this.secretKey);
    const prfHex = prf.toString(CryptoJS.enc.Hex);
    const prfBytes = prfHex
      .match(/.{2}/g)!
      .map((b) => String.fromCharCode(parseInt(b, 16)))
      .join('');

    const h = this.getUIntFromHash(prfBytes, 0, 4);
    return h % max;
  }

  /**
   * Helper function to convert string to ASCII number
   */
  private stringToAsciiNumber(str: string): string {
    let numStr = '';
    for (let i = 0; i < str.length; i++) {
      const code = 100 + str.charCodeAt(i);
      numStr += code.toString();
    }
    return numStr;
  }

  /**
   * Helper function to convert to base secure
   */
  private toBaseSecure(num: string, alphabet: string[]): string {
    const base = alphabet.length;
    let result = '';

    if (num === '0') {
      result = alphabet[0];
    } else {
      let bigNum = BigInt(num);
      while (bigNum > BigInt(0)) {
        const rem = Number(bigNum % BigInt(base));
        result = alphabet[rem] + result;
        bigNum = bigNum / BigInt(base);
      }
    }

    return result;
  }

  /**
   * Helper function to generate secret alphabet
   */
  private generateSecretAlphabet(noise: number, minBase: number): string[] {
    let alphabet = Array.from({ length: 94 }, (_, i) => String.fromCharCode(33 + i)).filter((c) => c !== '|');
    const alphabetLength = alphabet.length;
    const pickedPullOffsets = this.generateArrayFromKey(
      `${this.secretKey}|${noise}`,
      alphabetLength,
      alphabetLength - minBase,
    );

    pickedPullOffsets.sort((a, b) => b - a);
    for (const offset of pickedPullOffsets) {
      alphabet.splice(offset, 1);
    }

    return alphabet;
  }

  /**
   * Helper function to generate array from key
   */
  private generateArrayFromKey(secretKey: string, length: number, reductionCount: number): number[] {
    let pool = Array.from({ length: length }, (_, i) => i);
    const hashHex = CryptoJS.SHA512(secretKey).toString(CryptoJS.enc.Hex);
    let bytes: number[] = [];

    for (let i = 0; i < hashHex.length; i += 2) {
      bytes.push(parseInt(hashHex.substr(i, 2), 16));
    }

    let byteIndex = 0;
    const byteCount = bytes.length;

    // Deterministic shuffle (Fisher-Yates)
    for (let i = pool.length - 1; i > 0; i--) {
      const byte = bytes[byteIndex % byteCount];
      const j = byte % (i + 1);
      [pool[i], pool[j]] = [pool[j], pool[i]];
      byteIndex++;
    }

    reductionCount = (bytes[byteIndex % byteCount] % reductionCount) + 1;
    return pool.slice(0, reductionCount);
  }

  /**
   * Helper function to convert WordArray to byte string
   */
  private wordArrayToByteString(wordArray: CryptoJS.lib.WordArray): string {
    const words = wordArray.words;
    const sigBytes = wordArray.sigBytes;
    let byteStr = '';

    for (let i = 0; i < sigBytes; i++) {
      byteStr += String.fromCharCode((words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff);
    }

    return byteStr;
  }

  /**
   * Helper function to get uint from hash
   */
  private getUIntFromHash(bytes: string, start: number, end: number): number {
    let num = 0;
    for (let i = start; i < end && i < bytes.length; i++) {
      num = (num * 256 + bytes.charCodeAt(i)) >>> 0;
    }
    return num;
  }

  /**
   * Port of PHP encryptData function
   */
  private encryptData(data: string, key: string): string {
    const keyBytes = CryptoJS.enc.Utf8.parse(key);
    const iv = CryptoJS.lib.WordArray.random(16);
    const encrypted = CryptoJS.AES.encrypt(data, keyBytes, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    return CryptoJS.enc.Base64.stringify(iv.concat(encrypted.ciphertext));
  }

  /**
   * Decrypt function (for completeness)
   */
  decrypt(data: string): string {
    const full_parts = data.split('|');
    if (full_parts.length !== 2) {
      return '';
    }

    const ciphertext = full_parts[0];
    const strong_enc = full_parts[1];

    return this.decryptData(strong_enc, this.secretKey);
  }

  /**
   * Port of PHP decryptData function
   */
  private decryptData(encryptedData: string, key: string): string {
    try {
      const keyBytes = CryptoJS.enc.Utf8.parse(key);
      const encryptedWordArray = CryptoJS.enc.Base64.parse(encryptedData);

      const iv = CryptoJS.lib.WordArray.create(encryptedWordArray.words.slice(0, 4), 16);
      const ciphertext = CryptoJS.lib.WordArray.create(
        encryptedWordArray.words.slice(4),
        encryptedWordArray.sigBytes - 16,
      );

      const decrypted = CryptoJS.AES.decrypt({ ciphertext: ciphertext }, keyBytes, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      });

      return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('Decryption error:', error);
      return encryptedData;
    }
  }
}
```

### 4. Field Renderer Component

```typescript
// components/FieldRenderer.tsx
import React, { useEffect, useState } from 'react';
import { UseFormRegister, FieldErrors, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import SimpleMDE from 'react-simplemde-editor';
import 'easymde/dist/easymde.min.css';
import 'react-datepicker/dist/react-datepicker.css';

interface FieldRendererProps {
  field: Field;
  register: UseFormRegister<any>;
  errors: FieldErrors;
  setValue: UseFormSetValue<any>;
  watch: UseFormWatch<any>;
  workspaceId: string;
  authToken: string;
}

export const FieldRenderer: React.FC<FieldRendererProps> = ({
  field,
  register,
  errors,
  setValue,
  watch,
  workspaceId,
  authToken
}) => {
  const [selectOptions, setSelectOptions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fieldValue = watch(field.name);

  useEffect(() => {
    // Initialize field-specific components
    if (field.type === FieldType.SELECT_ONE_RECORD || field.type === FieldType.SELECT_LIST_RECORD) {
      loadReferenceOptions();
    } else if (field.type === FieldType.SELECT_ONE_WORKSPACE_USER || field.type === FieldType.SELECT_LIST_WORKSPACE_USER) {
      loadUserOptions();
    }
  }, [field.type]);

  const loadReferenceOptions = async (searchTerm?: string) => {
    if (!field.referenceTableId) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/workspace/${workspaceId}/workflow/get/active_tables/${field.referenceTableId}/records`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          filtering: {
            record: searchTerm ? { search: searchTerm } : {}
          },
          limit: 20
        })
      });

      const data = await response.json();
      const options = data.data.map((record: any) => ({
        value: record.id,
        label: record.record[field.referenceLabelField || 'id'] || record.id
      }));

      setSelectOptions(options);
    } catch (error) {
      console.error('Error loading reference options:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserOptions = async (searchTerm?: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/workspace/${workspaceId}/workspace/get/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          queries: {
            fields: 'id,fullName',
            filtering: searchTerm ? { search: searchTerm } : {},
            limit: 20
          }
        })
      });

      const data = await response.json();
      const options = data.data.map((user: any) => ({
        value: user.id,
        label: user.fullName || user.id
      }));

      setSelectOptions(options);
    } catch (error) {
      console.error('Error loading user options:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderField = () => {
    const isRequired = field.required;
    const hasError = errors[field.name];

    switch (field.type) {
      case FieldType.SHORT_TEXT:
      case FieldType.TEXT:
      case FieldType.EMAIL:
      case FieldType.URL:
        return (
          <input
            type="text"
            {...register(field.name, { required: isRequired })}
            placeholder={field.placeholder}
            className={`form-control ${hasError ? 'is-invalid' : ''}`}
          />
        );

      case FieldType.RICH_TEXT:
        return (
          <SimpleMDE
            value={fieldValue || ''}
            onChange={(value) => setValue(field.name, value)}
            options={{
              placeholder: field.placeholder || 'Nhập nội dung...',
              spellChecker: false,
              status: false,
              minHeight: '100px',
              toolbar: ["bold", "italic", "heading", "|", "quote", "unordered-list", "ordered-list", "|", "link", "image", "|", "preview"]
            }}
          />
        );

      case FieldType.INTEGER:
      case FieldType.NUMERIC:
        return (
          <input
            type="number"
            {...register(field.name, { required: isRequired })}
            placeholder={field.placeholder}
            className={`form-control ${hasError ? 'is-invalid' : ''}`}
            step={field.type === FieldType.NUMERIC ? '0.01' : '1'}
          />
        );

      case FieldType.DATE:
      case FieldType.DATETIME:
      case FieldType.TIME:
        return (
          <DatePicker
            selected={fieldValue ? new Date(fieldValue) : null}
            onChange={(date) => setValue(field.name, date ? date.toISOString() : '')}
            showTimeSelect={field.type === FieldType.DATETIME || field.type === FieldType.TIME}
            showTimeSelectOnly={field.type === FieldType.TIME}
            dateFormat={field.type === FieldType.DATE ? 'yyyy-MM-dd' : field.type === FieldType.DATETIME ? 'yyyy-MM-dd HH:mm' : 'HH:mm'}
            timeFormat="HH:mm"
            className={`form-control ${hasError ? 'is-invalid' : ''}`}
            placeholderText={field.placeholder}
          />
        );

      case FieldType.CHECKBOX_YES_NO:
        return (
          <div className="form-check">
            <input
              type="checkbox"
              {...register(field.name)}
              className="form-check-input"
            />
            <label className="form-check-label">{field.label}</label>
          </div>
        );

      case FieldType.SELECT_ONE:
      case FieldType.SELECT_LIST:
        return (
          <Select
            value={fieldValue ?
              (Array.isArray(fieldValue) ?
                fieldValue.map(v => ({ value: v, label: v })) :
                { value: fieldValue, label: fieldValue }
              ) : null
            }
            onChange={(selected) => {
              const value = Array.isArray(selected) ?
                selected.map(s => s.value) :
                selected?.value;
              setValue(field.name, value);
            }}
            options={field.options?.map(opt => ({ value: opt.value, label: opt.text }))}
            isMulti={field.type === FieldType.SELECT_LIST}
            isClearable
            className={hasError ? 'is-invalid' : ''}
            placeholder={field.placeholder}
          />
        );

      case FieldType.SELECT_ONE_RECORD:
      case FieldType.SELECT_LIST_RECORD:
      case FieldType.SELECT_ONE_WORKSPACE_USER:
      case FieldType.SELECT_LIST_WORKSPACE_USER:
        return (
          <Select
            value={fieldValue ?
              (Array.isArray(fieldValue) ?
                fieldValue.map(v => ({ value: v, label: v })) :
                { value: fieldValue, label: fieldValue }
              ) : null
            }
            onChange={(selected) => {
              const value = Array.isArray(selected) ?
                selected.map(s => s.value) :
                selected?.value;
              setValue(field.name, value);
            }}
            options={selectOptions}
            isMulti={field.type === FieldType.SELECT_LIST_RECORD || field.type === FieldType.SELECT_LIST_WORKSPACE_USER}
            isClearable
            isLoading={isLoading}
            onInputChange={(inputValue) => {
              if (field.type.includes('RECORD')) {
                loadReferenceOptions(inputValue);
              } else {
                loadUserOptions(inputValue);
              }
            }}
            className={hasError ? 'is-invalid' : ''}
            placeholder={field.placeholder || 'Chọn...'}
          />
        );

      case FieldType.CHECKBOX_LIST:
        return (
          <div className="checkbox-group">
            {field.options?.map(opt => (
              <div key={opt.value} className="form-check">
                <input
                  type="checkbox"
                  value={opt.value}
                  {...register(field.name)}
                  className="form-check-input"
                />
                <label className="form-check-label">{opt.text}</label>
              </div>
            ))}
          </div>
        );

      case FieldType.FIRST_REFERENCE_RECORD:
        return (
          <div className="readonly-field">
            <span className="text-muted">Trường này chỉ đọc, không thể chỉnh sửa</span>
          </div>
        );

      default:
        return (
          <input
            type="text"
            {...register(field.name, { required: isRequired })}
            placeholder={field.placeholder}
            className={`form-control ${hasError ? 'is-invalid' : ''}`}
          />
        );
    }
  };

  return (
    <div className="field-renderer">
      <label className="form-label">
        {field.label}
        {field.required && <span className="text-danger"> *</span>}
      </label>
      {renderField()}
      {hasError && (
        <div className="invalid-feedback">
          {errors[field.name]?.message as string}
        </div>
      )}
    </div>
  );
};
```

### 5. Main Create Record Component

```typescript
// components/CreateRecordForm.tsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FieldRenderer } from './FieldRenderer';
import { EncryptionService } from '../services/encryption.service';
import { TableApiService } from '../services/table-api.service';

interface CreateRecordFormProps {
  table: Table;
  workspaceId: string;
  authToken: string;
  onSuccess: (recordId: string) => void;
  onCancel: () => void;
}

export const CreateRecordForm: React.FC<CreateRecordFormProps> = ({
  table,
  workspaceId,
  authToken,
  onSuccess,
  onCancel
}) => {
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Initialize encryption service
  const encryptionService = new EncryptionService(table.config.encryptionKey);
  const tableApiService = new TableApiService(`/api`, workspaceId);

  const onSubmit = async (formData: any) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Process form data based on field types
      const processedData = processFormData(formData, table.config.fields);

      // Encrypt data based on field types
      const encryptedRecord = encryptRecordData(processedData, table.config.fields, encryptionService);

      // Generate hashed keywords
      const hashedKeywords = encryptionService.generateHashedKeywords(
        processedData,
        table.config.hashedKeywordFields
      );

      // Generate record hashes
      const recordHashes = encryptionService.generateRecordHashes(processedData);

      // Create final payload
      const payload: CreateRecordPayload = {
        record: encryptedRecord,
        hashed_keywords: hashedKeywords,
        record_hashes: recordHashes
      };

      // Submit to API
      const response = await tableApiService.createRecord(table.id, payload, authToken);

      // Handle success
      onSuccess(response.data.id);

    } catch (error) {
      console.error('Error creating record:', error);
      setSubmitError(error instanceof Error ? error.message : 'Lỗi khi tạo bản ghi');
    } finally {
      setIsSubmitting(false);
    }
  };

  const processFormData = (formData: any, fields: Field[]): Record<string, any> => {
    const processed: Record<string, any> = {};

    fields.forEach(field => {
      const value = formData[field.name];

      // Skip FIRST_REFERENCE_RECORD fields
      if (field.type === FieldType.FIRST_REFERENCE_RECORD) {
        return;
      }

      // Handle different field types
      switch (field.type) {
        case FieldType.CHECKBOX_YES_NO:
          processed[field.name] = !!value;
          break;

        case FieldType.CHECKBOX_LIST:
          processed[field.name] = Array.isArray(value) ? value : [];
          break;

        case FieldType.SELECT_LIST:
        case FieldType.SELECT_LIST_RECORD:
        case FieldType.SELECT_LIST_WORKSPACE_USER:
          processed[field.name] = Array.isArray(value) ? value : (value ? [value] : []);
          break;

        case FieldType.INTEGER:
        case FieldType.NUMERIC:
          processed[field.name] = value ? parseFloat(value) : null;
          break;

        default:
          processed[field.name] = value || null;
      }
    });

    return processed;
  };

  const encryptRecordData = (
    data: Record<string, any>,
    fields: Field[],
    encryptionService: EncryptionService
  ): Record<string, any> => {
    const encrypted: Record<string, any> = {};

    Object.entries(data).forEach(([fieldName, value]) => {
      const field = fields.find(f => f.name === fieldName);
      if (!field) return;

      // Encrypt value based on field type
      encrypted[fieldName] = encryptionService.encryptField(field, value);
    });

    return encrypted;
  };

  return (
    <div className="create-record-form">
      <div className="form-header">
        <h3>Tạo bản ghi mới - {table.name}</h3>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-fields">
          {table.config.fields.map(field => (
            <FieldRenderer
              key={field.name}
              field={field}
              register={register}
              errors={errors}
              setValue={setValue}
              watch={watch}
              workspaceId={workspaceId}
              authToken={authToken}
            />
          ))}
        </div>

        {submitError && (
          <div className="alert alert-danger">
            {submitError}
          </div>
        )}

        <div className="form-actions">
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-secondary"
            disabled={isSubmitting}
          >
            Hủy
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Đang xử lý...
              </>
            ) : (
              'Tạo bản ghi'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
```

This comprehensive specification provides everything needed to implement the create record functionality in React while maintaining full compatibility with the existing Laravel backend encryption system.
