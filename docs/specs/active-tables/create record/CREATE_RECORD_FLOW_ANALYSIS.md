# Create Record Flow Analysis - React Migration Guide

## Overview

This document provides a comprehensive analysis of the create record functionality in the Laravel Active Tables system for migration to React. It covers the complete flow from form initialization to API submission with detailed encryption and data transformation steps.

## Architecture Overview

### Frontend Components

- **Main Classes**: `RecordView`, `TableAPI`, `CommonUtils`
- **Encryption**: Field-level encryption with multiple algorithms based on field types
- **API Endpoint**: `POST /api/workspace/{workspaceId}/workflow/post/active_tables/{tableId}/records`

## Create Record Flow

### 1. Form Initialization (`RecordView.openRecordForm`)

**Trigger**: User clicks "Bản ghi mới" (Create New Record) button

```javascript
// Button click handler
<button class="btn btn-primary btn-create-record" onclick="RecordView.openRecordForm('create')">
  <span class="material-icons">add</span>
  Bản ghi mới
</button>
```

**Form Setup Process**:

1. Sets `RecordView.currentAction = 'create'`
2. Calls `CommonUtils.setupPopup()` to configure popup UI
3. Renders form fields based on table configuration
4. Initializes field-specific components (Select2, Flatpickr, AutoNumeric, SimpleMDE)

### 2. Field Rendering Logic

**Field Types and Components**:

| Field Type                                            | Component                 | Encryption             | Special Handling                |
| ----------------------------------------------------- | ------------------------- | ---------------------- | ------------------------------- |
| SHORT_TEXT, TEXT, EMAIL, URL                          | `<input type="text">`     | AES-CBC                | Encrypted with IV prefix        |
| RICH_TEXT                                             | SimpleMDE Editor          | AES-CBC                | Markdown editor with encryption |
| INTEGER, NUMERIC                                      | AutoNumeric               | OPE (Order Preserving) | Numeric formatting + encryption |
| DATE, DATETIME, TIME                                  | Flatpickr                 | OPE                    | Date picker with encryption     |
| CHECKBOX_YES_NO                                       | `<input type="checkbox">` | HMAC-SHA256            | Boolean to hash conversion      |
| SELECT_ONE, SELECT_LIST                               | `<select>`                | HMAC-SHA256            | Option values hashed            |
| SELECT_ONE_RECORD, SELECT_LIST_RECORD                 | Select2 AJAX              | None                   | Reference to other tables       |
| SELECT_ONE_WORKSPACE_USER, SELECT_LIST_WORKSPACE_USER | Select2 AJAX              | None                   | User reference fields           |
| FIRST_REFERENCE_RECORD                                | Read-only span            | None                   | Auto-calculated reference       |

**Field Rendering Code**:

```javascript
// Example for TEXT field
inputHtml = `<input type="text" id="record-${field.name}" placeholder="${field.placeholder || ''}" value="${record ? record[field.name] || '' : field.defaultValue || ''}" ${field.required ? 'required' : ''} />`;

// Example for RICH_TEXT field
this.simplemde = new SimpleMDE({
  element: document.getElementById(`record-${field.name}`),
  placeholder: 'Nhập nội dung...',
  spellChecker: false,
  toolbar: [
    'bold',
    'italic',
    'heading',
    '|',
    'quote',
    'unordered-list',
    'ordered-list',
    '|',
    'link',
    'image',
    '|',
    'fullscreen',
  ],
});
```

### 3. Form Validation

**Validation Rules**:

- Required field validation for fields with `field.required = true`
- Field-specific validation based on type
- Encryption key validation

```javascript
if (field.required && !input.value && field.type !== 'CHECKBOX_YES_NO') {
  isValid = false;
  CommonUtils.showMessage(`Trường ${field.label} là bắt buộc.`, false);
  return;
}
```

### 4. Data Collection and Encryption

**Collection Process** (`RecordView.saveRecord`):

1. **Iterate through all fields** and collect values
2. **Apply field-specific data extraction**:

```javascript
// Checkbox list handling
if (['CHECKBOX_LIST'].includes(field.type)) {
  const checkboxes = document.getElementsByName(`record-${field.name}`);
  data[field.name] = Array.from(checkboxes)
    .filter((cb) => cb.checked)
    .map((cb) => cb.value);
}

// Numeric field handling with AutoNumeric
else if (['NUMERIC'].includes(field.type)) {
  const priceAuto = AutoNumeric.getAutoNumericElement(input);
  data[field.name] = priceAuto.getNumber();
}

// Rich text with SimpleMDE
else if (field.type === 'RICH_TEXT') {
  const input = document.getElementById(`record-${field.name}`);
  data[field.name] = input._simplemde.value().trim();
}
```

### 5. Encryption Pipeline

**Encryption Categories**:

#### A. AES-CBC Encryption (Sensitive Text Fields)

```javascript
// Fields: SHORT_TEXT, RICH_TEXT, TEXT, EMAIL, URL
static encryptData(data, key) {
    const keyBytes = CryptoJS.enc.Utf8.parse(key);
    const iv = CryptoJS.lib.WordArray.random(16); // 16 bytes IV
    const encrypted = CryptoJS.AES.encrypt(data, keyBytes, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    });

    // Return IV + ciphertext as base64
    return CryptoJS.enc.Base64.stringify(iv.concat(encrypted.ciphertext));
}
```

#### B. Order-Preserving Encryption (Numeric/Date Fields)

```javascript
// Fields: YEAR, MONTH, DAY, HOUR, MINUTE, SECOND, DATE, DATETIME, TIME, INTEGER, NUMERIC
static encryptTableData(table, fieldName, value) {
    if (['DATE'].includes(field.type)) {
        return OPEncryptor.ope.encryptStringDate(value);
    } else if (['DATETIME'].includes(field.type)) {
        return OPEncryptor.ope.encryptStringDatetime(value);
    } else if (field.type === 'NUMERIC') {
        return OPEncryptor.ope.encryptDecimal(value);
    } else {
        return OPEncryptor.ope.encryptInt(value);
    }
}
```

#### C. HMAC-SHA256 Hashing (Select/Checkbox Fields)

```javascript
// Fields: CHECKBOX_YES_NO, CHECKBOX_ONE, CHECKBOX_LIST, SELECT_ONE, SELECT_LIST
static encryptTableData(table, fieldName, value) {
    if (['CHECKBOX_LIST', 'SELECT_LIST'].includes(field.type) && value) {
        return value.map(v => CryptoJS.HmacSHA256(v, encryptionKey).toString(CryptoJS.enc.Hex));
    } else if (value) {
        return CryptoJS.HmacSHA256(value, encryptionKey).toString(CryptoJS.enc.Hex);
    }
}
```

### 6. Record Hashes Generation

**Purpose**: Create searchable hashes for encrypted fields

```javascript
static hashRecordData(fields, record, tableKey) {
    const hashedData = {};

    fields.forEach(field => {
        const fieldName = field.name;
        const fieldType = field.type;

        if (record.hasOwnProperty(fieldName)) {
            const fieldValue = record[fieldName];

            if (Array.isArray(fieldValue) && ['CHECKBOX_LIST', 'SELECT_LIST'].includes(fieldType)) {
                hashedData[fieldName] = fieldValue.map(item =>
                    CryptoJS.HmacSHA256(item, tableKey).toString(CryptoJS.enc.Hex)
                );
            } else {
                hashedData[fieldName] = CryptoJS.HmacSHA256(fieldValue, tableKey).toString(CryptoJS.enc.Hex);
            }
        }
    });

    return hashedData;
}
```

### 7. Final Payload Structure

**Request Body Format**:

```json
{
  "record": {
    "field1": "encrypted_value_1",
    "field2": "encrypted_value_2",
    "field3": ["hashed_array_value_1", "hashed_array_value_2"]
    // ... all field values
  },
  "hashed_keywords": {
    "searchable_field1": ["hash1", "hash2"],
    "searchable_field2": "single_hash"
  },
  "record_hashes": {
    "field1": "field_hash_1",
    "field2": "field_hash_2",
    "field3": ["array_hash_1", "array_hash_2"]
  }
}
```

### 8. API Call

**Endpoint**: `POST /api/workspace/{workspaceId}/workflow/post/active_tables/{tableId}/records`

**Headers**:

```javascript
{
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${access_token}`
}
```

**Implementation**:

```javascript
static async createRecord(table, data) {
    const encryptionKey = table?.config?.encryptionKey || '';
    const fields = table?.config?.fields || [];

    // Clone data to avoid mutation
    const encryptedData = { ...data, record: { ...data.record } };

    // Encrypt each field based on type
    fields.forEach(field => {
        if(data.record[field.name]) {
            encryptedData.record[field.name] = CommonUtils.encryptTableData(table, field.name, data.record[field.name]);
        }
    });

    // Generate record hashes for all fields
    if(encryptedData.record) {
        encryptedData.record_hashes = CommonUtils.hashRecordData(fields, data.record, encryptionKey);
    }

    const response = await CommonUtils.apiCall(
        `${API_PREFIX}/post/active_tables/${table.id}/records`,
        encryptedData
    );

    return { message: response.message, id: response.data.id };
}
```

## React Migration Implementation Guide

### 1. Component Structure

```typescript
// Types
type FieldType =
  | 'SHORT_TEXT'
  | 'RICH_TEXT'
  | 'TEXT'
  | 'EMAIL'
  | 'URL'
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
  | 'SELECT_ONE_RECORD'
  | 'SELECT_LIST_RECORD'
  | 'SELECT_ONE_WORKSPACE_USER'
  | 'SELECT_LIST_WORKSPACE_USER'
  | 'FIRST_REFERENCE_RECORD';

interface Field {
  name: string;
  type: FieldType;
  label: string;
  required?: boolean;
  placeholder?: string;
  defaultValue?: any;
  options?: Array<{ value: string; text: string }>;
  referenceTableId?: string;
  referenceLabelField?: string;
  referenceField?: string;
}

interface TableConfig {
  fields: Field[];
  encryptionKey: string;
  encryptionAuthKey: string;
  hashedKeywordFields: string[];
}
```

### 2. Encryption Service

```typescript
// encryption.service.ts
import CryptoJS from 'crypto-js';

export class EncryptionService {
  private opeEncryptor: OPEncryptor;

  constructor(private encryptionKey: string) {
    this.opeEncryptor = new OPEncryptor(encryptionKey);
  }

  encryptField(field: Field, value: any): any {
    if (!value) return value;

    switch (field.type) {
      case 'SHORT_TEXT':
      case 'RICH_TEXT':
      case 'TEXT':
      case 'EMAIL':
      case 'URL':
        return this.encryptAES(value);

      case 'DATE':
        return this.opeEncryptor.encryptStringDate(value);
      case 'DATETIME':
        return this.opeEncryptor.encryptStringDatetime(value);
      case 'INTEGER':
        return this.opeEncryptor.encryptInt(value);
      case 'NUMERIC':
        return this.opeEncryptor.encryptDecimal(value);

      case 'CHECKBOX_YES_NO':
      case 'CHECKBOX_ONE':
      case 'SELECT_ONE':
        return CryptoJS.HmacSHA256(value, this.encryptionKey).toString();

      case 'CHECKBOX_LIST':
      case 'SELECT_LIST':
        return value.map((v) => CryptoJS.HmacSHA256(v, this.encryptionKey).toString());

      default:
        return value;
    }
  }

  private encryptAES(data: string): string {
    const keyBytes = CryptoJS.enc.Utf8.parse(this.encryptionKey);
    const iv = CryptoJS.lib.WordArray.random(16);
    const encrypted = CryptoJS.AES.encrypt(data, keyBytes, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    return CryptoJS.enc.Base64.stringify(iv.concat(encrypted.ciphertext));
  }

  generateRecordHashes(record: Record): RecordHashes {
    const hashes: RecordHashes = {};

    Object.entries(record).forEach(([fieldName, value]) => {
      const field = this.getFieldByName(fieldName);
      if (!field || !value) return;

      if (Array.isArray(value) && ['CHECKBOX_LIST', 'SELECT_LIST'].includes(field.type)) {
        hashes[fieldName] = value.map((item) => CryptoJS.HmacSHA256(item, this.encryptionKey).toString());
      } else {
        hashes[fieldName] = CryptoJS.HmacSHA256(value, this.encryptionKey).toString();
      }
    });

    return hashes;
  }
}
```

### 3. Form Component

```typescript
// CreateRecordForm.tsx
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';

interface Props {
  table: Table;
  onSubmit: (data: CreateRecordPayload) => Promise<void>;
  onCancel: () => void;
}

export const CreateRecordForm: React.FC<Props> = ({ table, onSubmit, onCancel }) => {
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm();
  const [encryptionService] = useState(() => new EncryptionService(table.config.encryptionKey));

  const onFormSubmit = async (formData: any) => {
    // Process form data
    const processedData = processFormData(formData, table.config.fields);

    // Encrypt data
    const encryptedRecord = encryptRecordData(processedData, table.config.fields, encryptionService);

    // Generate hashes
    const recordHashes = encryptionService.generateRecordHashes(processedData);

    // Create payload
    const payload: CreateRecordPayload = {
      record: encryptedRecord,
      hashed_keywords: generateHashedKeywords(processedData, table.config),
      record_hashes: recordHashes
    };

    await onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)}>
      {table.config.fields.map(field => (
        <FieldRenderer
          key={field.name}
          field={field}
          register={register}
          errors={errors}
          setValue={setValue}
          watch={watch}
        />
      ))}

      <div className="form-actions">
        <button type="button" onClick={onCancel}>Hủy</button>
        <button type="submit">Tạo bản ghi</button>
      </div>
    </form>
  );
};
```

### 4. API Service

```typescript
// table-api.service.ts
export class TableApiService {
  constructor(
    private baseUrl: string,
    private workspaceId: string,
  ) {}

  async createRecord(tableId: string, payload: CreateRecordPayload): Promise<CreateRecordResponse> {
    const response = await fetch(
      `${this.baseUrl}/api/workspace/${this.workspaceId}/workflow/post/active_tables/${tableId}/records`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.getAuthToken()}`,
        },
        body: JSON.stringify(payload),
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return response.json();
  }

  private getAuthToken(): string {
    return localStorage.getItem('access_token') || '';
  }
}
```

## Key Considerations for React Migration

### 1. Encryption Dependencies

- **crypto-js**: For AES, HMAC-SHA256 operations
- **Custom OPE implementation**: Port the OPEncryptor class
- **IV Generation**: Use crypto-js random word array

### 2. Form Libraries

- **react-hook-form**: For form state management
- **Select2 React alternative**: react-select with async loading
- **Date picker**: react-datepicker or similar
- **Rich text**: react-simplemde or similar markdown editor
- **Numeric input**: Custom component with formatting

### 3. State Management

- **Table configuration**: Store in context or state management
- **Field validation**: Implement real-time validation
- **Encryption state**: Manage encryption key securely

### 4. Error Handling

- **Field validation errors**: Display inline error messages
- **Encryption errors**: Handle crypto operation failures
- **API errors**: Show user-friendly error messages
- **Network errors**: Implement retry logic

### 5. Security Considerations

- **Key storage**: Store encryption key securely (not in plain localStorage)
- **Input sanitization**: Sanitize user inputs before encryption
- **HTTPS**: Ensure all API calls use HTTPS
- **Token management**: Implement proper JWT token refresh

This analysis provides the complete foundation for implementing the create record functionality in React while maintaining compatibility with the existing Laravel backend encryption system.
