# Create Record API Reference

## API Endpoint

```
POST /api/workspace/{workspaceId}/workflow/post/active_tables/{tableId}/records
```

## Authentication

**Headers**:

```
Content-Type: application/json
Authorization: Bearer {access_token}
```

## Request Structure

### Complete Request Body

```json
{
  "record": {
    "field_name_1": "encrypted_value_1",
    "field_name_2": "encrypted_value_2",
    "field_name_3": ["encrypted_array_value_1", "encrypted_array_value_2"],
    "field_name_4": "plain_value_for_reference_fields",
    "field_name_5": 123.45,
    "field_name_6": true
  },
  "hashed_keywords": {
    "searchable_field_1": "hashed_keyword_1",
    "searchable_field_2": ["hashed_keyword_2", "hashed_keyword_3"]
  },
  "record_hashes": {
    "field_name_1": "field_hash_1",
    "field_name_2": "field_hash_2",
    "field_name_3": ["array_field_hash_1", "array_field_hash_2"]
  }
}
```

### Field Encryption by Type

#### 1. AES-CBC Encrypted Fields (Text Fields)

**Field Types**: `SHORT_TEXT`, `RICH_TEXT`, `TEXT`, `EMAIL`, `URL`

**Encryption**: AES-CBC with random 16-byte IV
**Format**: Base64(IV + Ciphertext)

```json
{
  "record": {
    "short_text_field": "base64_encoded_iv_ciphertext",
    "email_field": "base64_encoded_iv_ciphertext",
    "rich_text_field": "base64_encoded_iv_ciphertext"
  }
}
```

#### 2. Order-Preserving Encrypted Fields (Numeric/Date)

**Field Types**: `INTEGER`, `NUMERIC`, `DATE`, `DATETIME`, `TIME`, `YEAR`, `MONTH`, `DAY`, `HOUR`, `MINUTE`, `SECOND`

**Encryption**: Custom OPE (Order-Preserving Encryption)
**Format**: Encrypted string that preserves order

```json
{
  "record": {
    "integer_field": "ope_encrypted_integer",
    "numeric_field": "ope_encrypted_decimal",
    "date_field": "ope_encrypted_date_string",
    "datetime_field": "ope_encrypted_datetime_string"
  }
}
```

#### 3. HMAC-SHA256 Hashed Fields (Select/Boolean)

**Field Types**: `CHECKBOX_YES_NO`, `CHECKBOX_ONE`, `CHECKBOX_LIST`, `SELECT_ONE`, `SELECT_LIST`

**Encryption**: HMAC-SHA256 with table encryption key
**Format**: Hex string of HMAC hash

```json
{
  "record": {
    "checkbox_yes_no": "hmac_sha256_hash_of_boolean",
    "select_one": "hmac_sha256_hash_of_selected_value",
    "checkbox_list": ["hmac_hash_1", "hmac_hash_2", "hmac_hash_3"],
    "select_list": ["hmac_hash_1", "hmac_hash_2"]
  }
}
```

#### 4. Plain Text Fields (References)

**Field Types**: `SELECT_ONE_RECORD`, `SELECT_LIST_RECORD`, `SELECT_ONE_WORKSPACE_USER`, `SELECT_LIST_WORKSPACE_USER`, `FIRST_REFERENCE_RECORD`

**Encryption**: None (plain values)
**Format**: Original values or IDs

```json
{
  "record": {
    "select_one_record": "record_id_123",
    "select_list_record": ["record_id_1", "record_id_2"],
    "select_one_workspace_user": "user_id_456",
    "select_list_workspace_user": ["user_id_1", "user_id_2"]
  }
}
```

### Hashed Keywords Section

**Purpose**: Enable search functionality on encrypted fields
**Algorithm**: HMAC-SHA256 with table encryption key

```json
{
  "hashed_keywords": {
    "searchable_text_field": "hmac_sha256_of_searchable_content",
    "searchable_select_field": "hmac_sha256_of_selected_option",
    "searchable_list_field": ["hmac_hash_1", "hmac_hash_2"]
  }
}
```

### Record Hashes Section

**Purpose**: Data integrity verification and reference lookups
**Algorithm**: HMAC-SHA256 with table encryption key

```json
{
  "record_hashes": {
    "field_1": "hmac_sha256_of_field_value",
    "field_2": "hmac_sha256_of_field_value",
    "list_field": ["hmac_hash_1", "hmac_hash_2"]
  }
}
```

## Complete Field Type Mapping

| Field Type                 | Encryption Method | Storage Format        | Searchable                | Example Value                |
| -------------------------- | ----------------- | --------------------- | ------------------------- | ---------------------------- |
| SHORT_TEXT                 | AES-CBC           | Base64(IV+Ciphertext) | Yes (via hashed_keywords) | `"ZW5jcnlwdGVkX3RleHQ="`     |
| RICH_TEXT                  | AES-CBC           | Base64(IV+Ciphertext) | Yes (via hashed_keywords) | `"ZW5jcnlwdGVkX21hcmtkb3du"` |
| TEXT                       | AES-CBC           | Base64(IV+Ciphertext) | Yes (via hashed_keywords) | `"ZW5jcnlwdGVkX3RleHQ="`     |
| EMAIL                      | AES-CBC           | Base64(IV+Ciphertext) | Yes (via hashed_keywords) | `"ZW5jcnlwdGVkX2VtYWls"`     |
| URL                        | AES-CBC           | Base64(IV+Ciphertext) | Yes (via hashed_keywords) | `"ZW5jcnlwdGVkX3VybA=="`     |
| INTEGER                    | OPE               | OPE Encrypted String  | Yes (direct)              | `"b3BlX2ludGVnZXI="`         |
| NUMERIC                    | OPE               | OPE Encrypted String  | Yes (direct)              | `"b3BlX251bWVyaWM="`         |
| DATE                       | OPE               | OPE Encrypted String  | Yes (direct)              | `"b3BlX2RhdGU="`             |
| DATETIME                   | OPE               | OPE Encrypted String  | Yes (direct)              | `"b3BlX2RhdGV0aW1l"`         |
| TIME                       | OPE               | OPE Encrypted String  | Yes (direct)              | `"b3BlX3RpbWU="`             |
| CHECKBOX_YES_NO            | HMAC-SHA256       | Hex Hash              | No                        | `"NGE4ZjI3YzQ3Y2Y1ZDEyMw=="` |
| CHECKBOX_ONE               | HMAC-SHA256       | Hex Hash              | No                        | `"YWJjZGVmMTIzNDU2"`         |
| CHECKBOX_LIST              | HMAC-SHA256       | Array of Hex Hashes   | No                        | `["YWJj", "ZGVm", "Z2hp"]`   |
| SELECT_ONE                 | HMAC-SHA256       | Hex Hash              | No                        | `"YWJjZGVmMTIzNDU2"`         |
| SELECT_LIST                | HMAC-SHA256       | Array of Hex Hashes   | No                        | `["YWJj", "ZGVm", "Z2hp"]`   |
| SELECT_ONE_RECORD          | None              | Plain Record ID       | No                        | `"record_id_123"`            |
| SELECT_LIST_RECORD         | None              | Array of Record IDs   | No                        | `["id1", "id2"]`             |
| SELECT_ONE_WORKSPACE_USER  | None              | Plain User ID         | No                        | `"user_id_456"`              |
| SELECT_LIST_WORKSPACE_USER | None              | Array of User IDs     | No                        | `["user1", "user2"]`         |
| FIRST_REFERENCE_RECORD     | None              | Plain Record ID       | No                        | `"auto_calculated_id"`       |

## Response Structure

### Success Response

```json
{
  "message": "Bản ghi đã được tạo thành công",
  "data": {
    "id": "new_record_id_123456"
  }
}
```

### Error Response

```json
{
  "error": "Validation failed",
  "message": "Trường Tên là bắt buộc",
  "details": {
    "field": "name",
    "code": "required"
  }
}
```

## Encryption Implementation Details

### AES-CBC Encryption (Text Fields)

```javascript
// Encryption Process
const keyBytes = CryptoJS.enc.Utf8.parse(encryptionKey);
const iv = CryptoJS.lib.WordArray.random(16); // 16 bytes IV
const encrypted = CryptoJS.AES.encrypt(data, keyBytes, {
  iv: iv,
  mode: CryptoJS.mode.CBC,
  padding: CryptoJS.pad.Pkcs7,
});

// Combine IV + Ciphertext and encode as Base64
const result = CryptoJS.enc.Base64.stringify(iv.concat(encrypted.ciphertext));
```

### Order-Preserving Encryption (Numeric/Date)

```javascript
// Uses custom OPEncryptor class
const ope = new OPEncryptor(encryptionKey);

// For integers
const encryptedInt = ope.encryptInt(integerValue.toString());

// For dates
const encryptedDate = ope.encryptStringDate(dateString);

// For decimals
const encryptedDecimal = ope.encryptDecimal(decimalValue.toString());
```

### HMAC-SHA256 Hashing (Select/Boolean)

```javascript
// For single values
const hash = CryptoJS.HmacSHA256(value, encryptionKey).toString();

// For array values
const hashes = values.map((v) => CryptoJS.HmacSHA256(v, encryptionKey).toString());
```

## Field Processing Examples

### Example 1: Text Field with Search

```javascript
// Original value
const textValue = "Customer Name";

// AES encryption for storage
const encryptedText = encryptAES(textValue, encryptionKey);
// Result: "base64_encoded_iv_ciphertext"

// HMAC hash for search
const searchHash = CryptoJS.HmacSHA256(textValue, encryptionKey).toString();
// Result: "abc123def456..."

// Final payload
{
  "record": {
    "customer_name": "base64_encoded_iv_ciphertext"
  },
  "hashed_keywords": {
    "customer_name": "abc123def456..."
  },
  "record_hashes": {
    "customer_name": "def456ghi789..."
  }
}
```

### Example 2: Select Field with Options

```javascript
// Original value
const selectedOption = "active";

// HMAC hash for storage
const storageHash = CryptoJS.HmacSHA256(selectedOption, encryptionKey).toString();
// Result: "xyz789abc123..."

// HMAC hash for search (same as storage)
const searchHash = storageHash;

// Final payload
{
  "record": {
    "status": "xyz789abc123..."
  },
  "hashed_keywords": {
    "status": "xyz789abc123..."
  },
  "record_hashes": {
    "status": "xyz789abc123..."
  }
}
```

### Example 3: Date Field

```javascript
// Original value
const dateValue = "2024-01-15";

// OPE encryption for storage (preserves order)
const encryptedDate = opeEncryptor.encryptStringDate(dateValue);
// Result: "ope_encrypted_date_string"

// HMAC hash for search
const searchHash = CryptoJS.HmacSHA256(dateValue, encryptionKey).toString();
// Result: "pqr456stu789..."

// Final payload
{
  "record": {
    "created_date": "ope_encrypted_date_string"
  },
  "hashed_keywords": {
    "created_date": "pqr456stu789..."
  },
  "record_hashes": {
    "created_date": "stu789vwx012..."
  }
}
```

## Security Considerations

1. **Encryption Key Management**: Never store encryption keys in plain text
2. **IV Generation**: Always use cryptographically secure random IV for AES
3. **Key Rotation**: Implement key rotation mechanism for enhanced security
4. **Input Validation**: Validate all inputs before encryption
5. **HTTPS Only**: All API calls must use HTTPS
6. **Token Security**: Implement proper JWT token management and refresh

## Migration Notes for React Implementation

1. **Crypto Library**: Use `crypto-js` for all cryptographic operations
2. **OPE Implementation**: Port the OPEncryptor class exactly as specified
3. **Field Mapping**: Follow the field type to encryption method mapping strictly
4. **Error Handling**: Implement proper error handling for encryption failures
5. **Performance**: Consider encrypting fields in parallel for better performance
6. **Testing**: Test encryption/decryption round-trip for all field types
