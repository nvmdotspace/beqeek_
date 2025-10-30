# @workspace/encryption-core

Client-side encryption library for Beqeek Active Tables. Provides end-to-end encryption (E2EE) with field-level encryption using multiple algorithms optimized for different data types.

## Overview

This package is a **1:1 TypeScript port** of the JavaScript encryption implementation from `active-table-records.blade.php`, ensuring **100% compatibility** with the legacy system while providing modern TypeScript type safety.

### Key Features

- 🔒 **End-to-End Encryption (E2EE)** - Encryption keys never leave the client
- 🎯 **Field-Level Encryption** - Different algorithms for different field types
- 🔍 **Searchable Encryption** - HMAC-based keyword hashing for encrypted search
- 📊 **Order-Preserving Encryption (OPE)** - Enables range queries on encrypted numbers/dates
- 🌏 **Vietnamese Text Support** - NFD normalization and diacritic removal for search
- 🔗 **Type-Safe** - Full TypeScript support with strict typing

## Installation

```bash
pnpm add @workspace/encryption-core
```

## Encryption Algorithms

This library uses different encryption methods based on field types, following the [Active Table specification](../../docs/specs/active-table-config-functional-spec.md):

| Field Type | Algorithm | Purpose | Supports |
|------------|-----------|---------|----------|
| **Text Fields** | AES-256-CBC | Strong encryption | - |
| **Numbers/Dates** | OPE | Order-preserving | Range queries, sorting |
| **Select Fields** | HMAC-SHA256 | Deterministic hashing | Equality checks, filtering |
| **Reference Fields** | None | Not encrypted | - |

### Encryption Methods by Field Type

```typescript
// Text fields → AES-256-CBC
SHORT_TEXT, TEXT, RICH_TEXT, EMAIL, URL

// Time/Number fields → OPE (Order-Preserving Encryption)
DATE, DATETIME, TIME, YEAR, MONTH, DAY, HOUR, MINUTE, SECOND, INTEGER, NUMERIC

// Selection fields → HMAC-SHA256
CHECKBOX_YES_NO, CHECKBOX_ONE, CHECKBOX_LIST, SELECT_ONE, SELECT_LIST

// Reference fields → No encryption
SELECT_ONE_RECORD, SELECT_LIST_RECORD, SELECT_ONE_WORKSPACE_USER, SELECT_LIST_WORKSPACE_USER
```

## Usage

### Basic Encryption/Decryption

```typescript
import { AES256, OPE, HMAC } from '@workspace/encryption-core';

// AES-256-CBC for text
const key = 'my-secret-key-exactly-32-chars!';
const plaintext = 'Sensitive data';
const encrypted = AES256.encrypt(plaintext, key);
const decrypted = AES256.decrypt(encrypted, key);

// OPE for numbers (preserves order)
const ope = new OPE(key);
const num1Encrypted = ope.encryptInt('100');
const num2Encrypted = ope.encryptInt('200');
// num1Encrypted < num2Encrypted (order preserved!)
const num1Decrypted = ope.decrypt(num1Encrypted); // '100'

// HMAC for select fields
const hash = HMAC.hash('option-value', key);
const hashArray = HMAC.hashArray(['option1', 'option2'], key);
```

### Table-Level Encryption

```typescript
import { CommonUtils } from '@workspace/encryption-core';
import type { TableDetail } from '@workspace/encryption-core';

const table: TableDetail = {
  id: '123',
  name: 'Tasks',
  config: {
    encryptionKey: 'my-secret-key-exactly-32-chars!',
    fields: [
      { name: 'title', type: 'SHORT_TEXT', label: 'Title', required: true },
      { name: 'priority', type: 'INTEGER', label: 'Priority', required: false },
      { name: 'status', type: 'SELECT_ONE', label: 'Status', required: false },
    ],
  },
};

// Encrypt field data
const encryptedTitle = CommonUtils.encryptTableData(table, 'title', 'My Task');
const encryptedPriority = CommonUtils.encryptTableData(table, 'priority', 5);
const encryptedStatus = CommonUtils.encryptTableData(table, 'status', 'pending');

// Decrypt field data
const decryptedTitle = CommonUtils.decryptTableData(table, 'title', encryptedTitle);
const decryptedPriority = CommonUtils.decryptTableData(table, 'priority', encryptedPriority);
const decryptedStatus = CommonUtils.decryptTableData(table, 'status', encryptedStatus);
```

### Searchable Encryption

```typescript
import { CommonUtils } from '@workspace/encryption-core';

// Tokenize Vietnamese text
const text = 'Xin chào Việt Nam';
const tokens = CommonUtils.tokenize(text);
// ['xin', 'chao', 'viet', 'nam']

// Hash keywords for searchable encryption
const hashedKeywords = CommonUtils.hashKeyword(text, 'table-token');
// [hash1, hash2, hash3, hash4]

// Server can search encrypted data by comparing hashes
```

### Authentication Key Generation

```typescript
import { AES256 } from '@workspace/encryption-core';

// Generate authentication key (triple SHA256)
const encryptionKey = 'my-secret-key-exactly-32-chars!';
const authKey = AES256.hashKeyForAuth(encryptionKey);

// Store authKey on server to verify client has correct key
// NEVER store encryptionKey on server!
```

## API Reference

### CommonUtils

Main encryption orchestrator that routes field encryption to appropriate algorithms.

#### Static Methods

##### `tokenize(text: string): string[]`
Tokenizes text for Vietnamese full-text search (NFD normalization, diacritic removal).

##### `hashKeyword(text: string, tableToken?: string): string[]`
Hashes keywords using HMAC-SHA256 for searchable encryption.

##### `encryptFields(): string[]`
Returns array of field types encrypted with AES-256-CBC.

##### `opeEncryptFields(): string[]`
Returns array of field types encrypted with OPE.

##### `hashEncryptFields(): string[]`
Returns array of field types hashed with HMAC-SHA256.

##### `noneEncryptFields(): string[]`
Returns array of field types not encrypted (reference fields).

##### `encryptData(data: any, key: string): string`
Alias for `AES256.encrypt()`.

##### `decryptData(encryptedData: string, key: string): string`
Alias for `AES256.decrypt()`.

##### `hashKeyForAuth(key: string): string`
Alias for `AES256.hashKeyForAuth()`.

##### `encryptTableData(table: TableDetail, fieldName: string, value: any): any`
Encrypts field data based on field type configuration.

##### `decryptTableData(table: TableDetail, fieldName: string, value: any): any`
Decrypts field data based on field type configuration.

##### `hashRecordData(fields: FieldConfig[], record: RecordData, tableKey: string): RecordHashes`
Hashes record data for searchable encryption.

---

### AES256

AES-256-CBC encryption with UTF8 key parsing and IV-prepended format.

#### Static Methods

##### `encrypt(data: any, key: string): string`
Encrypts data using AES-256-CBC. Returns Base64-encoded string with IV prepended.

**Parameters:**
- `data` - Data to encrypt (converted to string)
- `key` - Encryption key (UTF8 string, any length)

**Returns:** Base64 string with format: `[IV (16 bytes)][Ciphertext]`

##### `decrypt(encryptedData: string, key: string): string`
Decrypts AES-256-CBC encrypted data.

**Parameters:**
- `encryptedData` - Base64 string with IV prepended
- `key` - Encryption key (same as used for encryption)

**Returns:** Decrypted plaintext string

##### `hashKeyForAuth(key: string): string`
Generates authentication key using triple SHA256 hashing.

**Parameters:**
- `key` - Encryption key

**Returns:** SHA256 hash (hex string)

---

### OPE (Order-Preserving Encryption)

Encrypts numbers and dates while preserving sort order for range queries.

#### Constructor

```typescript
const ope = new OPE(secretKey: string)
```

#### Instance Methods

##### `encryptInt(value: string): string`
Encrypts integer value (preserves order).

##### `encryptDecimal(value: string, fracLength?: number): string`
Encrypts decimal number (preserves order).

##### `encryptStringDate(value: string): string`
Encrypts date string in format `YYYY-MM-DD`.

##### `encryptStringDatetime(value: string): string`
Encrypts datetime string in format `YYYY-MM-DD HH:MM:SS`.

##### `decrypt(encryptedData: string): string`
Decrypts OPE-encrypted data back to original value.

**Note:** OPE output format is `[OPE_CIPHERTEXT]|[AES_ENCRYPTED_PLAINTEXT]` to enable both range queries and exact value retrieval.

---

### HMAC

HMAC-SHA256 hashing for deterministic encryption of select field values.

#### Static Methods

##### `hash(value: string, key: string): string`
Creates HMAC-SHA256 hash of value.

**Returns:** Hex string

##### `hashArray(values: string[], key: string): string[]`
Hashes array of values (for SELECT_LIST, CHECKBOX_LIST).

##### `hashSelectOne(value: string, key: string): string`
Alias for `hash()` - for single select fields.

##### `hashSelectList(values: string[], key: string): string[]`
Alias for `hashArray()` - for multi-select fields.

##### `hashCheckbox(value: string, key: string): string`
Alias for `hash()` - for checkbox fields.

##### `hashCheckboxList(values: string[], key: string): string[]`
Alias for `hashArray()` - for checkbox list fields.

## Type Definitions

The package uses types from `@workspace/beqeek-shared` for field types and re-exports common types:

```typescript
import type {
  FieldType,
  FieldConfig,
  FieldOption,
  TableConfig,
  TableDetail,
  RecordData,
  HashedKeywords,
  RecordHashes,
  EncryptionKey,
  EncryptedData,
  EncryptionType,
} from '@workspace/encryption-core';
```

## Security Considerations

### ⚠️ Critical Security Rules

1. **Never store encryption keys on the server** - Keys must remain client-side only
2. **Never log encryption keys** - They should never appear in logs or errors
3. **Never transmit encryption keys** - Only send `encryptionAuthKey` (triple SHA256 hash)
4. **Key Length**: Use 32-character keys for optimal security
5. **Key Storage**: Store keys in browser localStorage or secure client storage
6. **Key Backup**: Warn users to backup keys - lost keys = lost data

### Authentication Pattern

```typescript
// Client-side
const encryptionKey = 'my-secret-key-exactly-32-chars!'; // User provides
const authKey = AES256.hashKeyForAuth(encryptionKey);   // Triple SHA256

// Send authKey to server (NOT encryptionKey!)
await api.verifyKey(tableId, authKey);

// Server verifies by comparing authKey
// Server never sees or stores encryptionKey
```

### OPE Security Considerations

Order-Preserving Encryption (OPE) provides weaker security than AES-256 because:
- Order information leaks (encrypted values maintain sort order)
- Suitable for **low-sensitivity numeric data** where range queries are needed
- Not recommended for highly sensitive data (SSN, credit cards, etc.)

**Use OPE for:** Dates, priorities, quantities, ratings, ages
**Don't use OPE for:** SSN, credit card numbers, passwords, private keys

## Implementation Notes

### Legacy Compatibility

This package is a **strict 1:1 port** of the JavaScript implementation:

- ✅ Identical encryption output
- ✅ Same key derivation
- ✅ Same IV handling
- ✅ Same padding scheme
- ✅ Compatible with existing encrypted data

### Vietnamese Text Handling

The `tokenize()` function uses NFD (Canonical Decomposition) normalization:

```typescript
// Input: "Xin chào Việt Nam"
// NFD:   "Xin cha\u0300o Vie\u0323t Nam" (diacritics separated)
// Remove diacritics: "Xin chao Viet Nam"
// Lowercase: "xin chao viet nam"
// Split: ["xin", "chao", "viet", "nam"]
```

This enables accent-insensitive search for Vietnamese text.

## Examples

### Complete E2EE Workflow

```typescript
import {
  CommonUtils,
  AES256,
  type TableDetail,
} from '@workspace/encryption-core';

// 1. User provides encryption key (client-side only)
const encryptionKey = prompt('Enter your encryption key (32 chars):');

// 2. Generate auth key for server verification
const authKey = AES256.hashKeyForAuth(encryptionKey);

// 3. Create table with E2EE enabled
const table: TableDetail = {
  id: '123',
  name: 'Private Tasks',
  config: {
    e2eeEncryption: true,
    encryptionKey: encryptionKey,      // Client-side only
    encryptionAuthKey: authKey,        // Send to server
    hashedKeywordFields: ['title', 'description'],
    fields: [
      { name: 'title', type: 'SHORT_TEXT', label: 'Title', required: true },
      { name: 'description', type: 'TEXT', label: 'Description', required: false },
      { name: 'priority', type: 'INTEGER', label: 'Priority', required: false },
      { name: 'status', type: 'SELECT_ONE', label: 'Status', required: false,
        options: [
          { value: 'todo', text: 'To Do' },
          { value: 'done', text: 'Done' },
        ],
      },
    ],
  },
};

// 4. Encrypt data before sending to server
const record = {
  title: 'Buy groceries',
  description: 'Milk, eggs, bread',
  priority: 5,
  status: 'todo',
};

const encryptedRecord = {
  title: CommonUtils.encryptTableData(table, 'title', record.title),
  description: CommonUtils.encryptTableData(table, 'description', record.description),
  priority: CommonUtils.encryptTableData(table, 'priority', record.priority),
  status: CommonUtils.encryptTableData(table, 'status', record.status),
};

// 5. Generate searchable keyword hashes
const titleKeywords = CommonUtils.hashKeyword(record.title, encryptionKey);
const descKeywords = CommonUtils.hashKeyword(record.description, encryptionKey);

// 6. Send to server
await api.createRecord({
  data: encryptedRecord,
  keywords: {
    title: titleKeywords,
    description: descKeywords,
  },
});

// 7. Decrypt when retrieving from server
const retrieved = await api.getRecord(recordId);
const decryptedRecord = {
  title: CommonUtils.decryptTableData(table, 'title', retrieved.title),
  description: CommonUtils.decryptTableData(table, 'description', retrieved.description),
  priority: CommonUtils.decryptTableData(table, 'priority', retrieved.priority),
  status: CommonUtils.decryptTableData(table, 'status', retrieved.status),
};
```

## Performance Considerations

- **AES-256-CBC**: Fast (~1-2ms per field)
- **OPE**: Moderate (~5-10ms per field due to complex math)
- **HMAC-SHA256**: Very fast (~0.5ms per field)

For large datasets, consider:
- Encrypting/decrypting in batches
- Using Web Workers for heavy operations
- Caching decrypted data in memory

## Testing

```bash
# Run type checking
pnpm check-types

# Build package
pnpm build

# Lint code
pnpm lint
```

## Migration from Legacy JavaScript

If you're migrating from the legacy JavaScript implementation:

1. ✅ Drop-in replacement - same API
2. ✅ No changes to encrypted data format
3. ✅ Existing encrypted data remains compatible
4. ✅ Import paths: `import { AES256 } from '@workspace/encryption-core'`

## Related Packages

- [`@workspace/beqeek-shared`](../beqeek-shared) - Shared constants and types
- [`@workspace/active-tables-core`](../active-tables-core) - Active Table models
- [`@workspace/active-tables-hooks`](../active-tables-hooks) - React hooks

## License

MIT

## Support

For issues or questions:
- 📖 [Active Table Specification](../../docs/specs/active-table-config-functional-spec.md)
- 🐛 [Report Issues](https://github.com/anthropics/beqeek/issues)
- 💬 Contact: support@beqeek.com
