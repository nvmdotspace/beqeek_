# TypeScript Migration Plan: @workspace/encryption-core

**Date:** October 29, 2025
**Author:** Technical Research Specialist
**Status:** READY FOR IMPLEMENTATION
**Objective:** Convert JavaScript encryption implementation to TypeScript WITHOUT functional changes

## Executive Summary

This document provides a comprehensive plan to migrate the existing JavaScript encryption implementation from the legacy HTML module (`active-table-records.blade.php`) to the TypeScript package `@workspace/encryption-core`. The migration must be 1:1 functionality preserving, with NO optimizations or changes to the encryption logic.

## Current Implementation Analysis

### Source Location
- **JavaScript Implementation:** `/docs/technical/html-module/active-table-records.blade.php`
- **Lines:** 2364-2935 (CommonUtils), 2937-3219 (OPEncryptor)
- **Dependencies:** crypto-js v4.1.1 (loaded via CDN)

### Core Classes and Methods

#### 1. CommonUtils Class
Primary utility class handling encryption/decryption orchestration.

**Key Methods:**
- `encryptData(data, key)` - AES-256-CBC encryption with random IV
- `decryptData(encryptedData, key)` - AES-256-CBC decryption
- `encryptTableData(table, fieldName, value)` - Field-specific encryption routing
- `decryptTableData(tableDetail, fieldName, value)` - Field-specific decryption routing
- `hashKeyword(text, tableToken)` - HMAC-SHA256 for searchable tokens
- `hashRecordData(fields, record, tableKey)` - Field value hashing for integrity
- `hashKeyForAuth(key)` - Triple SHA256 for auth key generation
- `tokenize(text)` - Vietnamese text normalization and tokenization

**Field Type Categories:**
```javascript
encryptFields() = ['SHORT_TEXT', 'RICH_TEXT', 'TEXT', 'EMAIL', 'URL']
opeEncryptFields() = ['YEAR', 'MONTH', 'DAY', 'HOUR', 'MINUTE', 'SECOND', 'DATE', 'DATETIME', 'TIME', 'INTEGER', 'NUMERIC']
hashEncryptFields() = ['CHECKBOX_YES_NO', 'CHECKBOX_ONE', 'CHECKBOX_LIST', 'SELECT_ONE', 'SELECT_LIST']
noneEncryptFields() = ['SELECT_ONE_RECORD', 'SELECT_LIST_RECORD', 'SELECT_ONE_WORKSPACE_USER', 'SELECT_LIST_WORKSPACE_USER']
```

#### 2. OPEncryptor Class
Order-Preserving Encryption implementation with deterministic noise.

**Key Properties:**
- `chunkSize = 1` - Fixed chunk size for processing
- `offsets[]` - 32 chaotic offsets derived from key
- `multiplier` - Derived from HMAC of key
- `cumSteps` - Monotone mapping table

**Key Methods:**
- `encryptString(str)` - 64-char fixed length encryption
- `encryptStringDatetime(str)` - 26-char datetime encryption
- `encryptStringDate(str)` - 10-char date encryption
- `encryptInt(str)` - 20-char integer encryption
- `encryptDecimal(str, fracLength)` - 65-char decimal encryption
- `decrypt(fullCiphertext)` - Extract and decrypt strong encryption part

**Encryption Process:**
1. Convert input to Latin representation (for numbers)
2. Pad to fixed length with null characters
3. Convert to ASCII numbers (3 digits per char)
4. Apply monotone function F(p) = S + m*CUM[p]
5. Add bounded noise based on input
6. Apply two rounds of secret alphabet encoding
7. Append strong AES encryption with pipe delimiter

### Current TypeScript Package Structure

**Existing Files:**
- `/src/index.ts` - Main exports
- `/src/types.ts` - Type definitions
- `/src/field-types/index.ts` - Field type configurations
- `/src/algorithms/aes-256.ts` - AES implementation (DIFFERENT from JS)
- `/src/algorithms/ope.ts` - OPE implementation (TO BE REPLACED)
- `/src/algorithms/hmac.ts` - HMAC implementation

**Key Differences Found:**
1. Current TS AES uses Hex encoding, JS uses UTF8 for key parsing
2. Current TS AES generates random keys, JS expects 32-char string
3. Current TS has async methods, JS is synchronous
4. Current TS OPE is placeholder, needs complete rewrite

## Migration Requirements

### CRITICAL: Exact Behavior Preservation

The following behaviors MUST be preserved exactly:

1. **AES-256-CBC Encryption**
   - Key: 32-character UTF8 string (NOT hex)
   - IV: 16-byte random, prepended to ciphertext
   - Output: Base64 encoded (IV + ciphertext)
   - Mode: CBC with PKCS7 padding

2. **OPE Encryption**
   - Fixed length outputs per type
   - Chaotic offset generation from key
   - Monotone mapping with bounded noise
   - Two-round secret alphabet encoding
   - Strong encryption appended with pipe delimiter

3. **HMAC-SHA256 Hashing**
   - Direct HMAC for single values
   - Array handling for SELECT_LIST/CHECKBOX_LIST
   - Hex output format

4. **Special Behaviors**
   - Vietnamese text tokenization (NFD normalization)
   - Triple SHA256 for auth key
   - Null/undefined value passthrough
   - Empty string handling

## TypeScript Interface Definitions

```typescript
// Table configuration types
interface TableConfig {
  id: string;
  name: string;
  e2eeEncryption: boolean;
  encryptionKey?: string;
  encryptionAuthKey?: string;
  hashedKeywordFields: string[];
  fields: FieldConfig[];
}

interface FieldConfig {
  name: string;
  type: FieldType;
  label: string;
  required: boolean;
  // ... other properties as in current implementation
}

// Encryption method signatures (must match JS exactly)
interface ICommonUtils {
  // Basic encryption
  encryptData(data: string, key: string): string;
  decryptData(encryptedData: string, key: string): string;

  // Table-aware encryption
  encryptTableData(table: TableConfig, fieldName: string, value: any): any;
  decryptTableData(table: TableConfig, fieldName: string, value: any): any;

  // Hashing methods
  hashKeyword(text: string, tableToken: string): string[];
  hashRecordData(fields: FieldConfig[], record: Record<string, any>, tableKey: string): Record<string, any>;
  hashKeyForAuth(key: string): string;

  // Text processing
  tokenize(text: string): string[];

  // Field type categorization
  encryptFields(): string[];
  opeEncryptFields(): string[];
  hashEncryptFields(): string[];
  noneEncryptFields(): string[];
}

interface IOPEncryptor {
  constructor(secretKey: string): void;
  encryptString(str: string): string;
  encryptStringDatetime(str: string): string;
  encryptStringDate(str: string): string;
  encryptInt(str: string): string;
  encryptDecimal(str: string, fracLength?: number): string;
  decrypt(fullCiphertext: string): string;
}
```

## File-by-File Migration Strategy

### Phase 1: Create Legacy Compatibility Layer

**New Files to Create:**

1. `/src/legacy/common-utils.ts`
   - Exact port of CommonUtils class
   - All methods must be static
   - Synchronous operation (no async/await)

2. `/src/legacy/ope-encryptor.ts`
   - Exact port of OPEncryptor class
   - Preserve singleton pattern (static ope property)
   - Include all helper methods

3. `/src/legacy/types.ts`
   - Legacy-specific type definitions
   - Match JS implementation exactly

### Phase 2: Update Existing Files

1. **Update `/src/algorithms/aes-256.ts`**
   - Add legacy-compatible methods
   - Support UTF8 key parsing
   - Support IV-prepended format
   - Add synchronous variants

2. **Replace `/src/algorithms/ope.ts`**
   - Complete rewrite based on JS implementation
   - Preserve all quirks and edge cases

3. **Update `/src/algorithms/hmac.ts`**
   - Ensure hex output format
   - Array handling for multi-select fields

### Phase 3: Integration Layer

1. **Create `/src/compat/index.ts`**
   - Export legacy-compatible API
   - Bridge between legacy and modern implementations

2. **Update `/src/index.ts`**
   - Export both modern and legacy APIs
   - Clear documentation on usage

## Implementation Checklist

### Pre-Implementation
- [x] Backup current TypeScript implementation - COMPLETED (src.backup.[timestamp])
- [ ] Create feature branch `feature/encryption-core-legacy-compat` - SKIPPED (working in main)
- [x] Set up test environment with crypto-js 4.2.0 - COMPLETED (already installed)

### Core Implementation
- [x] Port CommonUtils class (exact 1:1) - COMPLETED
  - [x] encryptData/decryptData methods - COMPLETED
  - [x] encryptTableData/decryptTableData methods - COMPLETED
  - [x] hashKeyword method with tokenization - COMPLETED
  - [x] hashRecordData method - COMPLETED
  - [x] hashKeyForAuth (triple SHA256) - COMPLETED
  - [x] Field type categorization methods - COMPLETED
- [x] Port OPEncryptor class (exact 1:1) - COMPLETED
  - [x] Constructor with offset generation - COMPLETED
  - [x] All encrypt variant methods - COMPLETED
  - [x] Decrypt method - COMPLETED
  - [x] Helper methods (monotone functions, noise, etc.) - COMPLETED
- [x] Create type definitions - COMPLETED
- [ ] Update existing algorithms for compatibility - NOT NEEDED (legacy is separate module)

### Testing Requirements
- [ ] Create test vectors from JS implementation - IN PROGRESS
- [ ] Unit tests for each encryption method - PENDING
- [ ] Integration tests with sample table configs - PENDING
- [ ] Cross-validation with JS implementation - PENDING
- [ ] Performance benchmarks - PENDING

### Documentation
- [x] API documentation with examples - COMPLETED (MIGRATION.md)
- [x] Migration guide for consumers - COMPLETED (MIGRATION.md)
- [x] Compatibility notes - COMPLETED (MIGRATION.md)
- [x] Security considerations - COMPLETED (MIGRATION.md)

## Testing Strategy

### Test Data Generation
1. Run JS implementation with known inputs
2. Capture outputs for all encryption methods
3. Create test fixtures with input/output pairs

### Test Categories
1. **Basic Encryption Tests**
   - AES with various input lengths
   - Empty string handling
   - Special characters
   - Vietnamese text

2. **OPE Tests**
   - Integer encryption/decryption
   - Decimal with various precisions
   - Date/datetime formats
   - Boundary values

3. **Field Type Tests**
   - Each field type with typical values
   - Null/undefined handling
   - Array values for multi-select

4. **Integration Tests**
   - Full record encryption/decryption
   - Hashed keywords generation
   - Record hash verification

## Risk Mitigation

### Potential Issues and Solutions

1. **Crypto-JS Version Differences**
   - Risk: Different behavior between 4.1.1 and 4.2.0
   - Solution: Test thoroughly, pin exact version if needed

2. **Character Encoding**
   - Risk: UTF8/Hex parsing differences
   - Solution: Explicit encoding specifications

3. **Floating Point Precision**
   - Risk: OPE decimal handling differences
   - Solution: Use exact same arithmetic operations

4. **Random Number Generation**
   - Risk: Different RNG implementations
   - Solution: Use same crypto-js methods

## Success Criteria

The migration is successful when:

1. All encryption/decryption produces identical outputs to JS implementation
2. No breaking changes to existing consumers
3. Performance is comparable or better
4. All tests pass with 100% coverage
5. Can decrypt data encrypted with JS implementation
6. Can encrypt data that JS implementation can decrypt

## Post-Migration Tasks

1. Update consuming packages
2. Performance optimization (separate PR)
3. Security audit
4. Documentation updates
5. Deprecation notices for old API

## Code Examples

### Example: Exact AES Implementation Match
```typescript
// Current JS implementation (must preserve exactly)
static encryptData(data, key) {
  if (!key || !data) return data;
  data = data.toString();

  try {
    const keyBytes = CryptoJS.enc.Utf8.parse(key);
    const iv = CryptoJS.lib.WordArray.random(16);
    const encrypted = CryptoJS.AES.encrypt(data, keyBytes, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });

    const encryptedBase64 = CryptoJS.enc.Base64.stringify(
      iv.concat(encrypted.ciphertext)
    );
    return encryptedBase64;
  } catch (error) {
    console.error('Encryption error:', error);
    return data;
  }
}

// TypeScript port (exact match)
export class CommonUtils {
  static encryptData(data: any, key: string): any {
    if (!key || !data) return data;
    data = data.toString();

    try {
      const keyBytes = CryptoJS.enc.Utf8.parse(key);
      const iv = CryptoJS.lib.WordArray.random(16);
      const encrypted = CryptoJS.AES.encrypt(data, keyBytes, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });

      const encryptedBase64 = CryptoJS.enc.Base64.stringify(
        iv.concat(encrypted.ciphertext)
      );
      return encryptedBase64;
    } catch (error) {
      console.error('Encryption error:', error);
      return data;
    }
  }
}
```

## Timeline

- **Week 1:** Setup and core CommonUtils port
- **Week 2:** OPEncryptor implementation
- **Week 3:** Testing and validation
- **Week 4:** Integration and documentation

## Conclusion

This migration plan ensures a precise, risk-free conversion of the JavaScript encryption implementation to TypeScript. By maintaining exact behavioral compatibility, we protect existing data while gaining the benefits of TypeScript's type safety and tooling support.

The key to success is resisting any temptation to "improve" or "optimize" during migration. All enhancements should be deferred to future iterations after establishing a stable, compatible baseline.