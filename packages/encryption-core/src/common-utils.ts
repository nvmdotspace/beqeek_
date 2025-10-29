/**
 * CommonUtils - Encryption orchestrator
 * Routes field encryption to appropriate algorithms based on field type
 */

import { AES256 } from './algorithms/aes-256.js';
import { OPE } from './algorithms/ope.js';
import { HMAC } from './algorithms/hmac.js';
import type {
  FieldConfig,
  TableDetail,
  RecordData,
  RecordHashes,
} from './types.js';

export class CommonUtils {
  /**
   * Tokenize text for Vietnamese full-text search
   * Normalizes NFD and removes diacritics
   */
  static tokenize(text: string): string[] {
    return text
      .normalize('NFD') // tách dấu tiếng Việt
      .replace(/[\u0300-\u036f]/g, '') // xóa dấu
      .toLowerCase()
      .split(/\W+/) // tách theo ký tự không phải chữ cái/số
      .filter(Boolean); // xóa phần tử rỗng
  }

  /**
   * Hash keywords using HMAC-SHA256 for searchable encryption
   */
  static hashKeyword(text: string, tableToken: string = ''): string[] {
    if (!text || typeof text !== 'string') return [];
    const tokens = this.tokenize(text);
    return tokens.map((token) => {
      try {
        return HMAC.hash(token, tableToken);
      } catch (error) {
        console.error('Hashing error:', error);
        return token; // Fallback to original token if hashing fails
      }
    });
  }

  /**
   * Field type categorization - used to determine encryption method
   */
  static encryptFields(): string[] {
    return ['SHORT_TEXT', 'RICH_TEXT', 'TEXT', 'EMAIL', 'URL'];
  }

  static opeEncryptFields(): string[] {
    return [
      'YEAR',
      'MONTH',
      'DAY',
      'HOUR',
      'MINUTE',
      'SECOND',
      'DATE',
      'DATETIME',
      'TIME',
      'INTEGER',
      'NUMERIC',
    ];
  }

  static hashEncryptFields(): string[] {
    return [
      'CHECKBOX_YES_NO',
      'CHECKBOX_ONE',
      'CHECKBOX_LIST',
      'SELECT_ONE',
      'SELECT_LIST',
    ];
  }

  static noneEncryptFields(): string[] {
    return [
      'SELECT_ONE_RECORD',
      'SELECT_LIST_RECORD',
      'SELECT_ONE_WORKSPACE_USER',
      'SELECT_LIST_WORKSPACE_USER',
    ];
  }

  /**
   * Encrypt data using AES-256-CBC
   */
  static encryptData = AES256.encrypt;

  /**
   * Decrypt data using AES-256-CBC
   */
  static decryptData = AES256.decrypt;

  /**
   * Generate authentication key from encryption key
   */
  static hashKeyForAuth = AES256.hashKeyForAuth;

  /**
   * Encrypt table field data based on field type
   * Routes to appropriate encryption method
   */
  static encryptTableData(table: TableDetail, fieldName: string, value: any): any {
    if (!fieldName || !value) return value;

    const field = table.config.fields.find((f) => f.name === fieldName);
    const encryptionKey = table.config.encryptionKey;

    if (!field || !encryptionKey) return value;

    if (CommonUtils.encryptFields().includes(field.type) && value) {
      return AES256.encrypt(value, encryptionKey);
    } else if (CommonUtils.opeEncryptFields().includes(field.type) && value) {
      if (!OPE.ope) {
        OPE.ope = new OPE(encryptionKey);
      }

      if (['DATE'].includes(field.type)) {
        return OPE.ope.encryptStringDate(value);
      } else if (['DATETIME'].includes(field.type)) {
        return OPE.ope.encryptStringDatetime(value);
      } else if (field.type === 'NUMERIC') {
        return OPE.ope.encryptDecimal(value);
      } else {
        return OPE.ope.encryptInt(value);
      }
    } else if (
      CommonUtils.hashEncryptFields().includes(field.type) &&
      ['CHECKBOX_LIST', 'SELECT_LIST'].includes(field.type) &&
      value
    ) {
      return HMAC.hashArray(value, encryptionKey);
    } else if (CommonUtils.hashEncryptFields().includes(field.type) && value) {
      return HMAC.hash(value, encryptionKey);
    } else {
      return value;
    }
  }

  /**
   * Decrypt table field data based on field type
   * Routes to appropriate decryption method
   */
  static decryptTableData(
    tableDetail: TableDetail,
    fieldName: string,
    value: any
  ): any {
    const field = tableDetail.config.fields.find((f) => f.name === fieldName);
    const encryptionKey = tableDetail.config.encryptionKey;
    if (!tableDetail || !tableDetail.config) {
      return value;
    }

    if (!field || !encryptionKey) return value;

    try {
      if (CommonUtils.encryptFields().includes(field.type) && value) {
        return AES256.decrypt(value, encryptionKey);
      } else if (CommonUtils.opeEncryptFields().includes(field.type) && value) {
        if (!OPE.ope) {
          OPE.ope = new OPE(encryptionKey);
        }

        if (value) {
          return OPE.ope.decrypt(value);
        }

        return value;
      } else if (CommonUtils.hashEncryptFields().includes(field.type) && value) {
        if (['CHECKBOX_LIST', 'SELECT_LIST'].includes(field.type)) {
          return value.map((v: string) => {
            const option = field.options?.find(
              (opt) => HMAC.hash(opt.value, encryptionKey) === v
            );
            return option ? option.value : v;
          });
        } else {
          const option = field.options?.find(
            (opt) => HMAC.hash(opt.value, encryptionKey) === value
          );

          if (option) {
            return option.value;
          }

          return value;
        }
      } else {
        return value;
      }
    } catch (error) {
      console.error('Error decrypting data:', error);
      return value; // Trả về giá trị gốc nếu có lỗi trong quá trình giải mã
    }
  }

  /**
   * Hash record data using HMAC-SHA256.
   */
  static hashRecordData(
    fields: FieldConfig[],
    record: RecordData,
    tableKey: string
  ): RecordHashes {
    if (!fields || !record || !tableKey) {
      return {};
    }

    const hashedData: RecordHashes = {};

    fields.forEach((field) => {
      const fieldName = field.name;
      const fieldType = field.type;

      if (record.hasOwnProperty(fieldName)) {
        const fieldValue = record[fieldName];

        if (
          Array.isArray(fieldValue) &&
          ['CHECKBOX_LIST', 'SELECT_LIST'].includes(fieldType)
        ) {
          // Hash each item in the list
          hashedData[fieldName] = HMAC.hashArray(fieldValue, tableKey);
        } else {
          // Hash the single value
          hashedData[fieldName] = HMAC.hash(fieldValue, tableKey);
        }
      }
    });

    return hashedData;
  }
}
