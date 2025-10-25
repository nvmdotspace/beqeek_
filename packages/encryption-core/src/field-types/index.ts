// Field type definitions for Active Tables
export type FieldType =
  | 'SHORT_TEXT'
  | 'TEXT'
  | 'RICH_TEXT'
  | 'INTEGER'
  | 'NUMERIC'
  | 'DATE'
  | 'DATETIME'
  | 'TIME'
  | 'CHECKBOX_YES_NO'
  | 'CHECKBOX_ONE'
  | 'CHECKBOX_LIST'
  | 'SELECT_ONE'
  | 'SELECT_LIST'
  | 'SELECT_*_RECORD'
  | 'SELECT_*_WORKSPACE_USER'
  | 'EMAIL'
  | 'URL'
  | 'PHONE'
  | 'CURRENCY'
  | 'PERCENTAGE'
  | 'RATING'
  | 'FILE'
  | 'IMAGE'
  | 'SIGNATURE'
  | 'CALCULATION'
  | 'LOOKUP'
  | 'ROLLUP'
  | 'CREATED_TIME'
  | 'CREATED_BY'
  | 'LAST_MODIFIED_TIME'
  | 'LAST_MODIFIED_BY';

export type EncryptionType = 'AES-256-CBC' | 'OPE' | 'HMAC-SHA256' | 'NONE';

export interface FieldDefinition {
  id: string;
  name: string;
  type: FieldType;
  label: string;
  required: boolean;
  unique: boolean;
  description?: string;
  defaultValue?: any;
  validation?: FieldValidation;
  encryption: FieldEncryptionConfig;
  options?: FieldOption[];
  lookupConfig?: LookupConfig;
  calculationConfig?: CalculationConfig;
}

export interface FieldEncryptionConfig {
  enabled: boolean;
  type: EncryptionType;
  searchable: boolean;
  orderPreserving: boolean;
  e2ee: boolean;
  keyRotation: boolean;
  retentionPolicy?: {
    encryptAfter: number; // days
    deleteAfter: number; // days
  };
}

export interface FieldValidation {
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  custom?: string;
}

export interface FieldOption {
  id: string;
  label: string;
  value: string;
  color?: string;
  icon?: string;
  order: number;
}

export interface LookupConfig {
  tableId: string;
  fieldId: string;
  filter?: string;
  multiple: boolean;
}

export interface CalculationConfig {
  formula: string;
  fields: string[];
  rounding?: number;
}

// Field type categories
export const FIELD_CATEGORIES = {
  TEXT: ['SHORT_TEXT', 'TEXT', 'RICH_TEXT', 'EMAIL', 'URL', 'PHONE'],
  NUMBER: ['INTEGER', 'NUMERIC', 'CURRENCY', 'PERCENTAGE', 'RATING'],
  DATE_TIME: ['DATE', 'DATETIME', 'TIME'],
  SELECTION: ['CHECKBOX_YES_NO', 'CHECKBOX_ONE', 'CHECKBOX_LIST', 'SELECT_ONE', 'SELECT_LIST'],
  RELATIONSHIP: ['SELECT_*_RECORD', 'SELECT_*_WORKSPACE_USER', 'LOOKUP', 'ROLLUP'],
  MEDIA: ['FILE', 'IMAGE', 'SIGNATURE'],
  SYSTEM: ['CREATED_TIME', 'CREATED_BY', 'LAST_MODIFIED_TIME', 'LAST_MODIFIED_BY'],
  ADVANCED: ['CALCULATION']
} as const;

// Default encryption configs by field type
export const DEFAULT_ENCRYPTION_CONFIGS: Record<FieldType, FieldEncryptionConfig> = {
  SHORT_TEXT: {
    enabled: true,
    type: 'AES-256-CBC',
    searchable: true,
    orderPreserving: false,
    e2ee: false,
    keyRotation: true
  },
  TEXT: {
    enabled: true,
    type: 'AES-256-CBC',
    searchable: false,
    orderPreserving: false,
    e2ee: false,
    keyRotation: true
  },
  RICH_TEXT: {
    enabled: true,
    type: 'AES-256-CBC',
    searchable: false,
    orderPreserving: false,
    e2ee: false,
    keyRotation: true
  },
  INTEGER: {
    enabled: true,
    type: 'OPE',
    searchable: true,
    orderPreserving: true,
    e2ee: false,
    keyRotation: true
  },
  NUMERIC: {
    enabled: true,
    type: 'OPE',
    searchable: true,
    orderPreserving: true,
    e2ee: false,
    keyRotation: true
  },
  DATE: {
    enabled: true,
    type: 'OPE',
    searchable: true,
    orderPreserving: true,
    e2ee: false,
    keyRotation: true
  },
  DATETIME: {
    enabled: true,
    type: 'OPE',
    searchable: true,
    orderPreserving: true,
    e2ee: false,
    keyRotation: true
  },
  TIME: {
    enabled: true,
    type: 'OPE',
    searchable: true,
    orderPreserving: true,
    e2ee: false,
    keyRotation: true
  },
  CHECKBOX_YES_NO: {
    enabled: true,
    type: 'HMAC-SHA256',
    searchable: true,
    orderPreserving: false,
    e2ee: false,
    keyRotation: false
  },
  CHECKBOX_ONE: {
    enabled: true,
    type: 'HMAC-SHA256',
    searchable: true,
    orderPreserving: false,
    e2ee: false,
    keyRotation: false
  },
  CHECKBOX_LIST: {
    enabled: true,
    type: 'HMAC-SHA256',
    searchable: true,
    orderPreserving: false,
    e2ee: false,
    keyRotation: false
  },
  SELECT_ONE: {
    enabled: true,
    type: 'HMAC-SHA256',
    searchable: true,
    orderPreserving: false,
    e2ee: false,
    keyRotation: false
  },
  SELECT_LIST: {
    enabled: true,
    type: 'HMAC-SHA256',
    searchable: true,
    orderPreserving: false,
    e2ee: false,
    keyRotation: false
  },
  'SELECT_*_RECORD': {
    enabled: false,
    type: 'NONE',
    searchable: true,
    orderPreserving: false,
    e2ee: false,
    keyRotation: false
  },
  'SELECT_*_WORKSPACE_USER': {
    enabled: false,
    type: 'NONE',
    searchable: true,
    orderPreserving: false,
    e2ee: false,
    keyRotation: false
  },
  EMAIL: {
    enabled: true,
    type: 'AES-256-CBC',
    searchable: false,
    orderPreserving: false,
    e2ee: false,
    keyRotation: true
  },
  URL: {
    enabled: true,
    type: 'AES-256-CBC',
    searchable: false,
    orderPreserving: false,
    e2ee: false,
    keyRotation: true
  },
  PHONE: {
    enabled: true,
    type: 'AES-256-CBC',
    searchable: false,
    orderPreserving: false,
    e2ee: false,
    keyRotation: true
  },
  CURRENCY: {
    enabled: true,
    type: 'OPE',
    searchable: true,
    orderPreserving: true,
    e2ee: false,
    keyRotation: true
  },
  PERCENTAGE: {
    enabled: true,
    type: 'OPE',
    searchable: true,
    orderPreserving: true,
    e2ee: false,
    keyRotation: true
  },
  RATING: {
    enabled: true,
    type: 'OPE',
    searchable: true,
    orderPreserving: true,
    e2ee: false,
    keyRotation: true
  },
  FILE: {
    enabled: true,
    type: 'AES-256-CBC',
    searchable: false,
    orderPreserving: false,
    e2ee: false,
    keyRotation: true
  },
  IMAGE: {
    enabled: true,
    type: 'AES-256-CBC',
    searchable: false,
    orderPreserving: false,
    e2ee: false,
    keyRotation: true
  },
  SIGNATURE: {
    enabled: true,
    type: 'AES-256-CBC',
    searchable: false,
    orderPreserving: false,
    e2ee: false,
    keyRotation: true
  },
  CALCULATION: {
    enabled: false,
    type: 'NONE',
    searchable: false,
    orderPreserving: false,
    e2ee: false,
    keyRotation: false
  },
  LOOKUP: {
    enabled: false,
    type: 'NONE',
    searchable: true,
    orderPreserving: false,
    e2ee: false,
    keyRotation: false
  },
  ROLLUP: {
    enabled: false,
    type: 'NONE',
    searchable: false,
    orderPreserving: false,
    e2ee: false,
    keyRotation: false
  },
  CREATED_TIME: {
    enabled: false,
    type: 'NONE',
    searchable: true,
    orderPreserving: true,
    e2ee: false,
    keyRotation: false
  },
  CREATED_BY: {
    enabled: false,
    type: 'NONE',
    searchable: true,
    orderPreserving: false,
    e2ee: false,
    keyRotation: false
  },
  LAST_MODIFIED_TIME: {
    enabled: false,
    type: 'NONE',
    searchable: true,
    orderPreserving: true,
    e2ee: false,
    keyRotation: false
  },
  LAST_MODIFIED_BY: {
    enabled: false,
    type: 'NONE',
    searchable: true,
    orderPreserving: false,
    e2ee: false,
    keyRotation: false
  }
};

// Field type utilities
export class FieldTypeUtils {
  static isTextType(type: FieldType): boolean {
    return FIELD_CATEGORIES.TEXT.includes(type as any);
  }

  static isNumberType(type: FieldType): boolean {
    return FIELD_CATEGORIES.NUMBER.includes(type as any);
  }

  static isDateTimeType(type: FieldType): boolean {
    return FIELD_CATEGORIES.DATE_TIME.includes(type as any);
  }

  static isSelectionType(type: FieldType): boolean {
    return FIELD_CATEGORIES.SELECTION.includes(type as any);
  }

  static isRelationshipType(type: FieldType): boolean {
    return FIELD_CATEGORIES.RELATIONSHIP.includes(type as any);
  }

  static isMediaType(type: FieldType): boolean {
    return FIELD_CATEGORIES.MEDIA.includes(type as any);
  }

  static isSystemType(type: FieldType): boolean {
    return FIELD_CATEGORIES.SYSTEM.includes(type as any);
  }

  static isAdvancedType(type: FieldType): boolean {
    return FIELD_CATEGORIES.ADVANCED.includes(type as any);
  }

  static supportsEncryption(type: FieldType): boolean {
    return DEFAULT_ENCRYPTION_CONFIGS[type].enabled;
  }

  static supportsSearch(type: FieldType): boolean {
    return DEFAULT_ENCRYPTION_CONFIGS[type].searchable;
  }

  static supportsOrdering(type: FieldType): boolean {
    return DEFAULT_ENCRYPTION_CONFIGS[type].orderPreserving;
  }

  static supportsE2EE(type: FieldType): boolean {
    return DEFAULT_ENCRYPTION_CONFIGS[type].e2ee;
  }

  static getEncryptionType(type: FieldType): EncryptionType {
    return DEFAULT_ENCRYPTION_CONFIGS[type].type;
  }

  static getDefaultValue(type: FieldType): any {
    switch (type) {
      case 'SHORT_TEXT':
      case 'TEXT':
      case 'EMAIL':
      case 'URL':
      case 'PHONE':
        return '';
      case 'INTEGER':
      case 'NUMERIC':
      case 'CURRENCY':
      case 'PERCENTAGE':
      case 'RATING':
        return 0;
      case 'CHECKBOX_YES_NO':
        return false;
      case 'CHECKBOX_ONE':
      case 'CHECKBOX_LIST':
      case 'SELECT_ONE':
      case 'SELECT_LIST':
        return [];
      case 'DATE':
      case 'DATETIME':
        return new Date();
      case 'TIME':
        return '00:00:00';
      default:
        return null;
    }
  }

  static validateValue(type: FieldType, value: any): boolean {
    if (value === null || value === undefined) return true;

    switch (type) {
      case 'SHORT_TEXT':
      case 'TEXT':
      case 'EMAIL':
      case 'URL':
      case 'PHONE':
        return typeof value === 'string';
      case 'INTEGER':
        return Number.isInteger(value);
      case 'NUMERIC':
      case 'CURRENCY':
      case 'PERCENTAGE':
      case 'RATING':
        return typeof value === 'number';
      case 'CHECKBOX_YES_NO':
        return typeof value === 'boolean';
      case 'DATE':
      case 'DATETIME':
        return value instanceof Date;
      case 'TIME':
        return typeof value === 'string' && /^\d{2}:\d{2}(:\d{2})?$/.test(value);
      case 'CHECKBOX_ONE':
      case 'CHECKBOX_LIST':
      case 'SELECT_ONE':
      case 'SELECT_LIST':
        return Array.isArray(value);
      default:
        return true;
    }
  }

  static formatValue(type: FieldType, value: any): string {
    if (value === null || value === undefined) return '';

    switch (type) {
      case 'DATE':
        return (value as Date).toLocaleDateString();
      case 'DATETIME':
        return (value as Date).toLocaleString();
      case 'CURRENCY':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(value);
      case 'PERCENTAGE':
        return `${value}%`;
      case 'CHECKBOX_YES_NO':
        return value ? 'Yes' : 'No';
      default:
        return String(value);
    }
  }
}