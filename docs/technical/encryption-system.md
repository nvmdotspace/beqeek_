# Technical Documentation: Active Tables Encryption System

## Table of Contents

1. [System Overview](#system-overview)
2. [Encryption Classification](#encryption-classification)
3. [Detailed Encryption Algorithms](#detailed-encryption-algorithms)
4. [Data Flow Architecture](#data-flow-architecture)
5. [Key Management System](#key-management-system)
6. [Search & Query System](#search--query-system)
7. [Security Considerations](#security-considerations)
8. [Implementation Guidelines](#implementation-guidelines)

## System Overview

The Active Tables system implements a sophisticated multi-layered encryption architecture designed to balance security with functional requirements like searching, sorting, and filtering. The system supports both End-to-End Encryption (E2EE) and server-side encryption models.

### Core Principles

- **Data Confidentiality**: Sensitive data is encrypted at rest and in transit
- **Functional Security**: Encryption methods preserve necessary database operations
- **Key Security**: Multiple key management approaches for different security requirements
- **Search Capability**: Encrypted data remains searchable through hashed indexes

## Encryption Classification

### Field Type Classification Schema

```php
// From hash_step.md:71-74
'encryptFields' => ['SHORT_TEXT', 'TEXT', 'RICH_TEXT', 'EMAIL', 'URL'],
'opeEncryptFields' => ['INTEGER', 'NUMERIC', 'DATE', 'DATETIME', 'TIME'],
'hashEncryptFields' => ['CHECKBOX_YES_NO', 'CHECKBOX_ONE', 'CHECKBOX_LIST', 'SELECT_ONE', 'SELECT_LIST'],
'noneEncryptFields' => ['SELECT_ONE_RECORD', 'SELECT_LIST_RECORD', 'SELECT_ONE_WORKSPACE_USER', 'SELECT_LIST_WORKSPACE_USER']
```

### Encryption Types Matrix

| Field Type                      | Encryption Method           | Purpose                 | Search Support            | Use Cases                  |
| ------------------------------- | --------------------------- | ----------------------- | ------------------------- | -------------------------- |
| **SHORT_TEXT, TEXT, RICH_TEXT** | AES-256-CBC                 | Maximum confidentiality | Yes (hashed keywords)     | Names, descriptions, notes |
| **EMAIL, URL**                  | AES-256-CBC                 | Maximum confidentiality | Yes (hashed keywords)     | Contact information        |
| **INTEGER, NUMERIC**            | Order Preserving Encryption | Range queries & sorting | Yes (numeric comparison)  | Age, salary, quantity      |
| **DATE, DATETIME, TIME**        | Order Preserving Encryption | Range queries & sorting | Yes (temporal comparison) | Birth dates, deadlines     |
| **CHECKBOX_YES_NO**             | HMAC-SHA256                 | Exact match lookup      | Yes (exact match)         | Yes/No flags               |
| **CHECKBOX_ONE, CHECKBOX_LIST** | HMAC-SHA256                 | Exact match lookup      | Yes (exact match)         | Multi-select options       |
| **SELECT_ONE, SELECT_LIST**     | HMAC-SHA256                 | Exact match lookup      | Yes (exact match)         | Dropdown selections        |
| **SELECT\_\*\_RECORD**          | None                        | Referential integrity   | Direct                    | Foreign keys               |
| **SELECT\_\*\_WORKSPACE_USER**  | None                        | System functionality    | Direct                    | User references            |

## Detailed Encryption Algorithms

### 1. AES-256-CBC Encryption (encryptFields)

**Purpose**: Maximum security for textual data with search capability

#### Encryption Process

```php
public static function encryptFieldData($string, $encryptionKey)
{
    if (empty($string)) {
        return $string;
    }

    // Generate 16-byte random initialization vector
    $iv = openssl_random_pseudo_bytes(16);

    // Encrypt using AES-256-CBC
    $encrypted = openssl_encrypt(
        $string,
        'AES-256-CBC',
        $encryptionKey,
        OPENSSL_RAW_DATA,
        $iv
    );

    // Prepend IV to encrypted data and base64 encode
    return base64_encode($iv . $encrypted);
}
```

#### Decryption Process

```php
public static function decryptFieldData($encryptedString, $encryptionKey)
{
    if (empty($encryptedString)) {
        return $encryptedString;
    }

    // Decode base64 and separate IV from encrypted data
    $data = base64_decode($encryptedString);
    $iv = substr($data, 0, 16);
    $encrypted = substr($data, 16);

    // Decrypt using AES-256-CBC
    return openssl_decrypt(
        $encrypted,
        'AES-256-CBC',
        $encryptionKey,
        OPENSSL_RAW_DATA,
        $iv
    );
}
```

#### Technical Specifications

- **Algorithm**: AES-256-CBC
- **Key Size**: 256 bits (32 bytes)
- **Block Size**: 128 bits (16 bytes)
- **IV Size**: 128 bits (16 bytes) - random per encryption
- **Output Format**: Base64 encoded (IV + encrypted data)
- **Security Level**: High

#### Keyword Hashing for Search

```php
protected static function hashKeywords($keywords, $encryptionKey)
{
    $hashedKeywords = [];

    // Tokenize text into searchable tokens
    $tokens = self::tokenizeText($keywords);

    foreach ($tokens as $token) {
        if (!in_array($token, self::getStopWords())) {
            // HMAC-SHA256 for each searchable token
            $hashedKeywords[] = hash_hmac('sha256', $token, $encryptionKey);
        }
    }

    return $hashedKeywords;
}
```

**Example**:
Input: `"John Doe johndoe@example.com"`
Tokens: `["john", "doe", "johndoe@example.com"]`
Hashed Output: `["a1b2c3...", "d4e5f6...", "g7h8i9..."]`

### 2. Order Preserving Encryption (opeEncryptFields)

**Purpose**: Enable range queries and sorting on encrypted numerical/date data

#### OPE Algorithm (Conceptual)

```php
public static function opeEncryptFieldData($value, $encryptionKey)
{
    // Convert dates to timestamps for consistency
    if ($value instanceof \Carbon\Carbon) {
        $value = $value->timestamp;
    }

    // Apply order-preserving transformation
    // This is a simplified representation
    $encryptedValue = self::preserveOrder($value, $encryptionKey);

    return $encryptedValue;
}
```

#### Key Properties

- **Order Preservation**: `encrypt(a) < encrypt(b)` if `a < b`
- **Range Queries**: Supports `BETWEEN`, `>`, `<`, `>=`, `<=`
- **Indexable**: Database indexes work on encrypted values
- **Deterministic**: Same input produces same output
- **Security Trade-off**: Less secure than AES but more functional

#### Database Query Example

```sql
-- Range query on encrypted age field
SELECT * FROM active_records
WHERE JSON_UNQUOTE(JSON_EXTRACT(record, '$.age'))
BETWEEN 145321 AND 287654;

-- Sorting by encrypted birth date
SELECT * FROM records
ORDER BY JSON_UNQUOTE(JSON_EXTRACT(record, '$.birth_date')) DESC;
```

#### Practical Example

```php
// Age values with OPE encryption
$ages = [18, 25, 30, 45, 60];
$encryptedAges = [];

foreach ($ages as $age) {
    $encryptedAges[] = self::opeEncryptFieldData($age, $encryptionKey);
}

// Output preserves numerical order:
// [145321, 287654, 432987, 578320, 723653]
//   18 <     25 <     30 <     45 <     60
```

### 3. HMAC-SHA256 Hashing (hashEncryptFields)

**Purpose**: One-way encryption for exact match lookups

#### Hashing Algorithm

```php
public static function hashFieldData($value, $encryptionKey, $single = false)
{
    if (empty($value)) {
        return $value;
    }

    $hashedValues = [];
    $values = (array)$value; // Ensure array for multi-select

    foreach ($values as $val) {
        // HMAC-SHA256 for each value
        $hashedValues[] = hash_hmac('sha256', $val, $encryptionKey);
    }

    return $single ? $hashedValues[0] : json_encode($hashedValues);
}
```

#### Technical Specifications

- **Algorithm**: HMAC-SHA256
- **Output Size**: 64 characters (256 bits)
- **Output Format**: Hexadecimal string
- **Properties**:
  - One-way (cannot reverse)
  - Deterministic (same input = same output)
  - Collision-resistant
  - Keyed (requires secret key)

#### Single vs Multi-Select Fields

```php
// Single select field (e.g., gender)
$gender = 'Male';
$hashedGender = self::hashFieldData($gender, $encryptionKey, true);
// Output: "7c4a8d09ca3762af61e59520943dc26494f8941b"

// Multi-select field (e.g., skills)
$skills = ['PHP', 'JavaScript', 'React'];
$hashedSkills = self::hashFieldData($skills, $encryptionKey, false);
// Output: "[\"a1b2c3...\", \"d4e5f6...\", \"g7h8i9...\"]"
```

### 4. No Encryption (noneEncryptFields)

**Purpose**: System functionality and referential integrity

#### Unencrypted Field Types

- **SELECT_ONE_RECORD**: Foreign key references to other records
- **SELECT_LIST_RECORD**: Multiple foreign key references
- **SELECT_ONE_WORKSPACE_USER**: User ID references
- **SELECT_LIST_WORKSPACE_USER**: Multiple user ID references

#### Rationale for No Encryption

1. **Referential Integrity**: Database constraints require clear values
2. **Index Performance**: Optimal query performance on indexes
3. **System Functionality**: User management, permissions, workflows
4. **Low Sensitivity**: Reference IDs are not inherently sensitive

## Data Flow Architecture

### Complete Record Processing Flow

#### Step 1: Input Data Classification

```php
// Example user input
$recordData = [
    'name' => 'John Doe',                    // SHORT_TEXT -> AES
    'email' => 'john@example.com',           // EMAIL -> AES
    'age' => 30,                             // INTEGER -> OPE
    'birth_date' => '1994-05-15',           // DATE -> OPE
    'gender' => 'Male',                      // SELECT_ONE -> HMAC
    'skills' => ['PHP', 'JavaScript'],       // SELECT_LIST -> HMAC
    'manager_id' => 123,                     // SELECT_ONE_RECORD -> None
    'team_members' => [456, 789]            // SELECT_LIST_RECORD -> None
];
```

#### Step 2: Encryption Processing

```php
public static function processRecordData($recordData, $fields, $encryptionKey)
{
    $result = [
        'encrypted_record' => [],
        'hashed_keywords' => [],
        'record_hashes' => []
    ];

    foreach ($fields as $field) {
        $value = $recordData[$field['name']] ?? null;

        if ($value !== null) {
            $encryptionType = self::getFieldEncryptionType($field['type']);

            switch ($encryptionType) {
                case 'encrypt':
                    // AES-256-CBC encryption
                    $result['encrypted_record'][$field['name']] =
                        self::encryptFieldData($value, $encryptionKey);

                    // Generate searchable keyword hashes
                    $result['hashed_keywords'][$field['name']] =
                        self::hashKeywords($value, $encryptionKey);
                    break;

                case 'ope':
                    // Order Preserving Encryption
                    $result['encrypted_record'][$field['name']] =
                        self::opeEncryptFieldData($value, $encryptionKey);
                    break;

                case 'hash':
                    // HMAC-SHA256 hashing
                    $result['encrypted_record'][$field['name']] =
                        self::hashFieldData($value, $encryptionKey);
                    break;

                case 'none':
                    // No encryption for reference fields
                    $result['encrypted_record'][$field['name']] = $value;
                    break;
            }
        }
    }

    // Generate record-level integrity hashes
    $result['record_hashes'] =
        self::generateRecordHashes($result['encrypted_record'], $fields, $encryptionKey);

    return $result;
}
```

#### Step 3: Database Storage Structure

```sql
CREATE TABLE active_records (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    active_table_id BIGINT NOT NULL,
    record JSON NOT NULL,                    -- Encrypted field values
    record_hash VARCHAR(64) NOT NULL,        -- Record integrity hash
    hashed_keywords JSON,                    -- Searchable keyword hashes
    created_by BIGINT,
    updated_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_table_hash (active_table_id, record_hash),
    INDEX idx_table_created (active_table_id, created_at),
    FULLTEXT idx_keywords (CAST(hashed_keywords AS CHAR))
);
```

#### Example Storage Format

```json
{
  "id": 12345,
  "active_table_id": 678,
  "record": {
    "name": "base64:aBcDeFg123456...",
    "email": "base64:xYzWvU789012...",
    "age": "encrypted_number_287654",
    "birth_date": "encrypted_timestamp_845321",
    "gender": "7c4a8d09ca3762af61e59520943dc26494f8941b",
    "skills": "[\"a1b2c3...\", \"d4e5f6...\"]",
    "manager_id": 123,
    "team_members": "[456, 789]"
  },
  "record_hash": "hash_of_complete_record_abcdef123456...",
  "hashed_keywords": {
    "name": ["hash_john", "hash_doe"],
    "email": ["hash_john", "hash_example", "hash_com"]
  },
  "created_by": 1001,
  "updated_by": 1001,
  "created_at": "2024-01-15 10:30:00",
  "updated_at": "2024-01-15 10:30:00"
}
```

## Key Management System

### Dual Encryption Modes

#### 1. End-to-End Encryption (E2EE)

**Configuration**: `e2eeEncryption: true`

**Key Management Flow**:

```php
class E2EEKeyManager
{
    /**
     * Generate unique encryption key for table
     */
    public function generateTableKey($userPassword, $workspaceId, $tableId)
    {
        // Generate 32-byte random table key
        $tableKey = openssl_random_pseudo_bytes(32);

        // Derive authentication key from user password (triple hash)
        $authKey = hash('sha256', hash('sha256', hash('sha256', $userPassword)));

        // Encrypt table key with user-derived key
        $iv = openssl_random_pseudo_bytes(16);
        $encryptedTableKey = openssl_encrypt(
            $tableKey,
            'AES-256-CBC',
            $authKey,
            OPENSSL_RAW_DATA,
            $iv
        );

        // Store encrypted key in client-side storage
        $storedKey = base64_encode($iv . $encryptedTableKey);

        return [
            'table_key' => $tableKey,
            'stored_key' => $storedKey,
            'workspace_id' => $workspaceId,
            'table_id' => $tableId
        ];
    }

    /**
     * Retrieve stored table key
     */
    public function getTableKey($userPassword, $workspaceId, $tableId)
    {
        $storageKey = "e2ee_key_{$workspaceId}_{$tableId}";
        $storedKey = $_SESSION[$storageKey] ?? null; // or localStorage

        if (!$storedKey) {
            throw new Exception("Table key not found in storage");
        }

        // Decrypt stored key with user password
        $data = base64_decode($storedKey);
        $iv = substr($data, 0, 16);
        $encryptedKey = substr($data, 16);

        $authKey = hash('sha256', hash('sha256', hash('sha256', $userPassword)));

        $tableKey = openssl_decrypt(
            $encryptedKey,
            'AES-256-CBC',
            $authKey,
            OPENSSL_RAW_DATA,
            $iv
        );

        if ($tableKey === false) {
            throw new Exception("Failed to decrypt table key");
        }

        return $tableKey;
    }

    /**
     * Validate stored key against authentication
     */
    public function validateKey($storedKey, $authKey)
    {
        try {
            $data = base64_decode($storedKey);
            $iv = substr($data, 0, 16);
            $encryptedKey = substr($data, 16);

            $decrypted = openssl_decrypt(
                $encryptedKey,
                'AES-256-CBC',
                $authKey,
                OPENSSL_RAW_DATA,
                $iv
            );

            return $decrypted !== false;
        } catch (Exception $e) {
            return false;
        }
    }
}
```

**Client-Side Storage Pattern**:

```javascript
// Browser localStorage implementation
class ClientKeyManager {
  storeTableKey(workspaceId, tableId, encryptedKey) {
    const key = `e2ee_key_${workspaceId}_${tableId}`;
    localStorage.setItem(key, encryptedKey);
  }

  getTableKey(workspaceId, tableId) {
    const key = `e2ee_key_${workspaceId}_${tableId}`;
    return localStorage.getItem(key);
  }

  clearTableKey(workspaceId, tableId) {
    const key = `e2ee_key_${workspaceId}_${tableId}`;
    localStorage.removeItem(key);
  }
}
```

#### 2. Server-Side Encryption

**Configuration**: `e2eeEncryption: false`

**Key Storage**:

```sql
CREATE TABLE workspace_table_keys (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    workspace_id BIGINT NOT NULL,
    active_table_id BIGINT NOT NULL,
    encryption_key VARCHAR(255) NOT NULL,  -- Base64 encoded encrypted key
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY unique_workspace_table (workspace_id, active_table_id),
    INDEX idx_workspace (workspace_id),
    INDEX idx_table (active_table_id)
);
```

**Key Management**:

```php
class ServerKeyManager
{
    public function generateTableKey($workspaceId, $tableId)
    {
        // Generate random 32-byte key
        $tableKey = openssl_random_pseudo_bytes(32);

        // Store encrypted in database (server-side master key)
        $masterKey = $this->getServerMasterKey();
        $encryptedKey = openssl_encrypt(
            $tableKey,
            'AES-256-CBC',
            $masterKey,
            OPENSSL_RAW_DATA,
            $iv = openssl_random_pseudo_bytes(16)
        );

        DB::table('workspace_table_keys')->insert([
            'workspace_id' => $workspaceId,
            'active_table_id' => $tableId,
            'encryption_key' => base64_encode($iv . $encryptedKey)
        ]);

        return $tableKey;
    }

    public function getTableKey($workspaceId, $tableId)
    {
        $record = DB::table('workspace_table_keys')
            ->where('workspace_id', $workspaceId)
            ->where('active_table_id', $tableId)
            ->first();

        if (!$record) {
            throw new Exception("Table key not found");
        }

        // Decrypt with server master key
        $masterKey = $this->getServerMasterKey();
        $data = base64_decode($record->encryption_key);
        $iv = substr($data, 0, 16);
        $encryptedKey = substr($data, 16);

        return openssl_decrypt(
            $encryptedKey,
            'AES-256-CBC',
            $masterKey,
            OPENSSL_RAW_DATA,
            $iv
        );
    }
}
```

## Search & Query System

### Multi-Modal Search Architecture

#### 1. Text Search on Encrypted Fields

```php
class EncryptedTextSearch
{
    /**
     * Search encrypted text fields using keyword hashes
     */
    public function searchEncryptedText($tableId, $fieldName, $searchTerm, $encryptionKey)
    {
        // 1. Tokenize search term
        $tokens = $this->tokenizeSearchTerm($searchTerm);

        // 2. Generate HMAC hashes for each token
        $hashedTokens = [];
        foreach ($tokens as $token) {
            $hashedTokens[] = hash_hmac('sha256', $token, $encryptionKey);
        }

        // 3. Build dynamic query for multiple tokens
        $query = "
            SELECT ar.* FROM active_records ar
            WHERE ar.active_table_id = :tableId
            AND (
        ";

        $conditions = [];
        foreach ($hashedTokens as $index => $hashToken) {
            $conditions[] = "JSON_SEARCH(ar.hashed_keywords, 'one', :hashToken{$index}) IS NOT NULL";
        }

        $query .= implode(' OR ', $conditions) . ')';

        // 4. Execute with parameter binding
        $bindings = ['tableId' => $tableId];
        foreach ($hashedTokens as $index => $hashToken) {
            $bindings["hashToken{$index}"] = $hashToken;
        }

        return DB::select($query, $bindings);
    }

    /**
     * Tokenize search term for matching
     */
    private function tokenizeSearchTerm($searchTerm)
    {
        // Convert to lowercase and split on spaces/punctuation
        $tokens = preg_split('/[\s,.;:!?\(\)\[\]{}"\'\/\\]+/', strtolower($searchTerm));

        // Filter empty strings and stop words
        $stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for'];

        return array_filter($tokens, function($token) use ($stopWords) {
            return !empty($token) && !in_array($token, $stopWords);
        });
    }
}
```

#### 2. Range Queries on OPE Fields

```php
class OPEFieldSearch
{
    /**
     * Range query on Order Preserving Encrypted fields
     */
    public function searchOpeRange($tableId, $fieldName, $minValue, $maxValue, $encryptionKey)
    {
        // Encrypt range boundaries
        $encryptedMin = $this->opeEncryptFieldData($minValue, $encryptionKey);
        $encryptedMax = $this->opeEncryptFieldData($maxValue, $encryptionKey);

        // Build range query
        $query = "
            SELECT ar.* FROM active_records ar
            WHERE ar.active_table_id = :tableId
            AND JSON_UNQUOTE(JSON_EXTRACT(ar.record, '$.{$fieldName}'))
            BETWEEN :minValue AND :maxValue
        ";

        return DB::select($query, [
            'tableId' => $tableId,
            'minValue' => $encryptedMin,
            'maxValue' => $encryptedMax
        ]);
    }

    /**
     * Date range query
     */
    public function searchDateRange($tableId, $fieldName, $startDate, $endDate, $encryptionKey)
    {
        // Convert dates to timestamps for OPE encryption
        $startTimestamp = $startDate instanceof \Carbon\Carbon
            ? $startDate->timestamp
            : strtotime($startDate);
        $endTimestamp = $endDate instanceof \Carbon\Carbon
            ? $endDate->timestamp
            : strtotime($endDate);

        return $this->searchOpeRange($tableId, $fieldName, $startTimestamp, $endTimestamp, $encryptionKey);
    }

    /**
     * Greater than/Less than queries
     */
    public function searchOpeComparison($tableId, $fieldName, $operator, $value, $encryptionKey)
    {
        $encryptedValue = $this->opeEncryptFieldData($value, $encryptionKey);

        $query = "
            SELECT ar.* FROM active_records ar
            WHERE ar.active_table_id = :tableId
            AND JSON_UNQUOTE(JSON_EXTRACT(ar.record, '$.{$fieldName}')) {$operator} :value
        ";

        return DB::select($query, [
            'tableId' => $tableId,
            'value' => $encryptedValue
        ]);
    }
}
```

#### 3. Exact Match on Hashed Fields

```php
class HashedFieldSearch
{
    /**
     * Exact match search on HMAC-SHA256 hashed fields
     */
    public function searchHashedField($tableId, $fieldName, $searchValue, $encryptionKey)
    {
        // Hash the search value
        $hashedValue = hash_hmac('sha256', $searchValue, $encryptionKey);

        // Build exact match query
        $query = "
            SELECT ar.* FROM active_records ar
            WHERE ar.active_table_id = :tableId
            AND JSON_UNQUOTE(JSON_EXTRACT(ar.record, '$.{$fieldName}')) = :hashedValue
        ";

        return DB::select($query, [
            'tableId' => $tableId,
            'hashedValue' => $hashedValue
        ]);
    }

    /**
     * Multi-select field search (array contains value)
     */
    public function searchHashedArrayField($tableId, $fieldName, $searchValue, $encryptionKey)
    {
        $hashedValue = hash_hmac('sha256', $searchValue, $encryptionKey);

        // Search in JSON array
        $query = "
            SELECT ar.* FROM active_records ar
            WHERE ar.active_table_id = :tableId
            AND JSON_CONTAINS(
                JSON_EXTRACT(ar.record, '$.{$fieldName}'),
                :hashedValue
            )
        ";

        return DB::select($query, [
            'tableId' => $tableId,
            'hashedValue' => json_encode($hashedValue)
        ]);
    }
}
```

#### 4. Direct Search on Unencrypted Fields

```php
class PlainFieldSearch
{
    /**
     * Direct search on unencrypted reference fields
     */
    public function searchPlainField($tableId, $fieldName, $searchValue)
    {
        $query = "
            SELECT ar.* FROM active_records ar
            WHERE ar.active_table_id = :tableId
            AND JSON_UNQUOTE(JSON_EXTRACT(ar.record, '$.{$fieldName}')) = :searchValue
        ";

        return DB::select($query, [
            'tableId' => $tableId,
            'searchValue' => $searchValue
        ]);
    }

    /**
     * Array field search (for multi-select references)
     */
    public function searchPlainArrayField($tableId, $fieldName, $searchValue)
    {
        $query = "
            SELECT ar.* FROM active_records ar
            WHERE ar.active_table_id = :tableId
            AND JSON_CONTAINS(
                JSON_EXTRACT(ar.record, '$.{$fieldName}'),
                :searchValue
            )
        ";

        return DB::select($query, [
            'tableId' => $tableId,
            'searchValue' => json_encode($searchValue)
        ]);
    }
}
```

### Unified Search Interface

```php
class UnifiedSearch
{
    private $encryptionKey;
    private $tableId;

    public function __construct($tableId, $encryptionKey)
    {
        $this->tableId = $tableId;
        $this->encryptionKey = $encryptionKey;
    }

    /**
     * Universal search method that routes to appropriate search type
     */
    public function search($fieldName, $searchType, $searchValue, $options = [])
    {
        $fieldType = $this->getFieldType($fieldName);

        switch ($fieldType) {
            case 'encrypt':
                return $this->searchEncryptedField($fieldName, $searchValue, $options);

            case 'ope':
                return $this->searchOpeField($fieldName, $searchValue, $searchType, $options);

            case 'hash':
                return $this->searchHashedField($fieldName, $searchValue, $options);

            case 'none':
                return $this->searchPlainField($fieldName, $searchValue, $options);

            default:
                throw new Exception("Unknown field type: {$fieldType}");
        }
    }

    /**
     * Complex search combining multiple conditions
     */
    public function complexSearch($conditions)
    {
        $query = "
            SELECT ar.* FROM active_records ar
            WHERE ar.active_table_id = :tableId
        ";

        $bindings = ['tableId' => $this->tableId];
        $whereConditions = [];

        foreach ($conditions as $index => $condition) {
            $fieldType = $this->getFieldType($condition['field']);

            switch ($fieldType) {
                case 'encrypt':
                    $whereConditions[] = $this->buildEncryptedCondition($condition, $index);
                    break;

                case 'ope':
                    $whereConditions[] = $this->buildOpeCondition($condition, $index);
                    break;

                case 'hash':
                    $whereConditions[] = $this->buildHashedCondition($condition, $index);
                    break;

                case 'none':
                    $whereConditions[] = $this->buildPlainCondition($condition, $index);
                    break;
            }

            // Merge bindings for current condition
            $bindings = array_merge($bindings, $condition['bindings']);
        }

        if (!empty($whereConditions)) {
            $query .= ' AND (' . implode(' AND ', $whereConditions) . ')';
        }

        return DB::select($query, $bindings);
    }
}
```

## Security Considerations

### 1. Key Security

#### Key Storage Protection

```php
class SecurityManager
{
    /**
     * Secure key storage validation
     */
    public function validateKeyStorage($keyData)
    {
        // Check for potential key exposure
        if (preg_match('/password|secret|key/i', $keyData)) {
            throw new SecurityException("Key contains suspicious content");
        }

        // Validate key format
        if (!preg_match('/^[a-zA-Z0-9+\/=]+$/', $keyData)) {
            throw new SecurityException("Invalid key format");
        }

        return true;
    }

    /**
     * Memory cleanup for sensitive operations
     */
    public function secureMemoryCleanup(&$sensitiveData)
    {
        // Overwrite memory variable
        $sensitiveData = str_repeat('x', strlen($sensitiveData));
        unset($sensitiveData);

        // Force garbage collection
        if (function_exists('gc_collect_cycles')) {
            gc_collect_cycles();
        }
    }

    /**
     * Rate limiting for encryption operations
     */
    public function checkRateLimit($userId, $operation)
    {
        $cacheKey = "rate_limit_{$userId}_{$operation}";
        $currentCount = Cache::get($cacheKey, 0);

        if ($currentCount >= $this->getRateLimit($operation)) {
            throw new RateLimitException("Rate limit exceeded for {$operation}");
        }

        Cache::put($cacheKey, $currentCount + 1, 60); // 1 minute window
    }
}
```

### 2. Data Integrity

#### Record Hashing

```php
class DataIntegrity
{
    /**
     * Generate comprehensive record hash
     */
    public static function generateRecordHashes($encryptedRecord, $fields, $encryptionKey)
    {
        $hashes = [];

        foreach ($fields as $field) {
            $fieldValue = $encryptedRecord[$field['name']] ?? null;

            if ($fieldValue !== null) {
                // Create hash including field name for context
                $hashInput = $field['name'] . '|' . $fieldValue;
                $hashes[$field['name']] = hash_hmac('sha256', $hashInput, $encryptionKey);
            }
        }

        // Generate overall record hash
        $recordString = json_encode($encryptedRecord, JSON_SORT_KEYS);
        $hashes['_record'] = hash_hmac('sha256', $recordString, $encryptionKey);

        return $hashes;
    }

    /**
     * Verify record integrity
     */
    public static function verifyRecordIntegrity($record, $fields, $encryptionKey)
    {
        $storedHashes = $record->record_hash ? json_decode($record->record_hash, true) : [];
        $currentHashes = self::generateRecordHashes(
            json_decode($record->record, true),
            $fields,
            $encryptionKey
        );

        foreach ($currentHashes as $fieldName => $expectedHash) {
            if (!isset($storedHashes[$fieldName]) ||
                !hash_equals($storedHashes[$fieldName], $expectedHash)) {
                throw new IntegrityException("Record integrity check failed for field: {$fieldName}");
            }
        }

        return true;
    }
}
```

### 3. Access Control

#### Field-Level Permissions

```php
class FieldAccessControl
{
    /**
     * Check if user has permission to access field
     */
    public function canAccessField($user, $table, $field, $action = 'read')
    {
        $permissions = $this->getUserPermissions($user->id, $table->id);

        // Check global table permissions
        if (!$this->hasTablePermission($permissions, $action)) {
            return false;
        }

        // Check field-specific restrictions
        $fieldRestrictions = $this->getFieldRestrictions($table->id, $field->name);

        if (!empty($fieldRestrictions[$action])) {
            return in_array($user->role, $fieldRestrictions[$action]);
        }

        return true;
    }

    /**
     * Filter record data based on field permissions
     */
    public function filterRecordData($record, $user, $table, $fields)
    {
        $filteredData = [];

        foreach ($fields as $field) {
            if ($this->canAccessField($user, $table, $field, 'read')) {
                $filteredData[$field['name']] = $record[$field['name']] ?? null;
            }
        }

        return $filteredData;
    }
}
```

## Implementation Guidelines

### 1. React Implementation Considerations

#### JavaScript Encryption Service

```javascript
// services/encryptionService.js
import CryptoJS from 'crypto-js';

export class EncryptionService {
  constructor() {
    this.encryptionKey = null;
    this.fieldTypes = {
      encryptFields: ['SHORT_TEXT', 'TEXT', 'RICH_TEXT', 'EMAIL', 'URL'],
      opeEncryptFields: ['INTEGER', 'NUMERIC', 'DATE', 'DATETIME', 'TIME'],
      hashEncryptFields: ['CHECKBOX_YES_NO', 'CHECKBOX_ONE', 'CHECKBOX_LIST', 'SELECT_ONE', 'SELECT_LIST'],
      noneEncryptFields: [
        'SELECT_ONE_RECORD',
        'SELECT_LIST_RECORD',
        'SELECT_ONE_WORKSPACE_USER',
        'SELECT_LIST_WORKSPACE_USER',
      ],
    };
  }

  /**
   * AES-256-CBC encryption (matching PHP implementation)
   */
  encryptFieldData(data, key) {
    if (!data || !key) return data;

    const iv = CryptoJS.lib.WordArray.random(16);
    const encrypted = CryptoJS.AES.encrypt(data, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    // Prepend IV to encrypted data and base64 encode
    return CryptoJS.enc.Base64.stringify(iv.concat(encrypted.ciphertext));
  }

  /**
   * AES-256-CBC decryption
   */
  decryptFieldData(encryptedData, key) {
    if (!encryptedData || !key) return encryptedData;

    const combined = CryptoJS.enc.Base64.parse(encryptedData);
    const iv = CryptoJS.lib.WordArray.create(combined.words.slice(0, 4));
    const ciphertext = CryptoJS.lib.WordArray.create(combined.words.slice(4));

    const decrypted = CryptoJS.AES.decrypt({ ciphertext: ciphertext }, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    return decrypted.toString(CryptoJS.enc.Utf8);
  }

  /**
   * HMAC-SHA256 hashing
   */
  hashFieldData(data, key) {
    if (!data || !key) return data;

    const values = Array.isArray(data) ? data : [data];
    const hashedValues = values.map((value) => CryptoJS.HmacSHA256(value, key).toString());

    return values.length === 1 ? hashedValues[0] : JSON.stringify(hashedValues);
  }

  /**
   * Order Preserving Encryption (simplified)
   */
  opeEncryptFieldData(value, key) {
    // This needs to match the PHP OPE implementation exactly
    // Implementation details depend on the specific OPE algorithm used
    return this.implementOPE(value, key);
  }

  /**
   * Generate searchable keyword hashes
   */
  hashKeywords(text, key) {
    const tokens = this.tokenizeText(text);
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for'];

    return tokens
      .filter((token) => token && !stopWords.includes(token.toLowerCase()))
      .map((token) => CryptoJS.HmacSHA256(token, key).toString());
  }

  /**
   * Tokenize text for search
   */
  tokenizeText(text) {
    return text.split(/[\s,.;:!?\(\)\[\]{}"\'\/\\]+/).filter((token) => token.trim().length > 0);
  }
}
```

#### React Hook for Encryption

```javascript
// hooks/useEncryption.js
import { useState, useCallback } from 'react';
import { EncryptionService } from '../services/encryptionService';

export const useEncryption = (tableId) => {
  const [encryptionService] = useState(() => new EncryptionService());
  const [isKeyLoaded, setIsKeyLoaded] = useState(false);
  const [encryptionKey, setEncryptionKey] = useState(null);

  /**
   * Setup encryption for table
   */
  const setupEncryption = useCallback(
    async (userPassword, workspaceId) => {
      try {
        // Try to get stored key
        const storedKey = await getStoredTableKey(workspaceId, tableId);

        if (storedKey) {
          // Validate and decrypt stored key
          const authKey = sha256(sha256(sha256(userPassword)));
          const isValid = await validateStoredKey(storedKey, authKey);

          if (isValid) {
            const key = await decryptStoredKey(storedKey, authKey);
            setEncryptionKey(key);
            encryptionService.encryptionKey = key;
            setIsKeyLoaded(true);
            return true;
          }
        }

        return false;
      } catch (error) {
        console.error('Encryption setup failed:', error);
        return false;
      }
    },
    [tableId, encryptionService],
  );

  /**
   * Encrypt complete record
   */
  const encryptRecord = useCallback(
    (recordData, fields) => {
      if (!encryptionKey) throw new Error('Encryption key not loaded');

      const encryptedRecord = { record: {} };
      const hashedKeywords = {};

      fields.forEach((field) => {
        const rawValue = recordData[field.name];
        if (rawValue !== undefined && rawValue !== null) {
          const fieldType = getFieldTypeEncryptionType(field.type);

          switch (fieldType) {
            case 'encrypt':
              encryptedRecord.record[field.name] = encryptionService.encryptFieldData(rawValue, encryptionKey);
              hashedKeywords[field.name] = encryptionService.hashKeywords(String(rawValue), encryptionKey);
              break;

            case 'ope':
              encryptedRecord.record[field.name] = encryptionService.opeEncryptFieldData(rawValue, encryptionKey);
              break;

            case 'hash':
              encryptedRecord.record[field.name] = encryptionService.hashFieldData(rawValue, encryptionKey);
              break;

            case 'none':
              encryptedRecord.record[field.name] = rawValue;
              break;
          }
        }
      });

      // Generate record hashes
      const recordHashes = generateRecordHashes(encryptedRecord.record, fields, encryptionKey);

      return {
        encryptedRecord,
        hashedKeywords,
        recordHashes,
      };
    },
    [encryptionKey, encryptionService],
  );

  /**
   * Decrypt record for display
   */
  const decryptRecord = useCallback(
    (encryptedRecord, fields) => {
      if (!encryptionKey) throw new Error('Encryption key not loaded');

      const decryptedRecord = { ...encryptedRecord };
      decryptedRecord.record = { ...encryptedRecord.record };

      fields.forEach((field) => {
        const encryptedValue = encryptedRecord.record[field.name];
        if (encryptedValue !== undefined && encryptedValue !== null) {
          const fieldType = getFieldTypeEncryptionType(field.type);

          if (fieldType === 'encrypt') {
            decryptedRecord.record[field.name] = encryptionService.decryptFieldData(encryptedValue, encryptionKey);
          }
          // Hash and OPE fields remain encrypted in display
          // Reference fields are already plain
        }
      });

      return decryptedRecord;
    },
    [encryptionKey, encryptionService],
  );

  return {
    isKeyLoaded,
    setupEncryption,
    encryptRecord,
    decryptRecord,
  };
};
```

### 2. Migration Strategy

#### Data Validation Checklist

```php
class MigrationValidator
{
    /**
     * Validate encryption compatibility between PHP and JavaScript implementations
     */
    public function validateEncryptionCompatibility()
    {
        $testData = [
            'text' => 'John Doe john@example.com',
            'number' => 12345,
            'date' => '1994-05-15',
            'select' => 'Option A',
            'array' => ['Item 1', 'Item 2']
        ];

        $testKey = 'test_encryption_key_32_bytes_long';

        $phpResults = [
            'encrypted_text' => $this->encryptFieldData($testData['text'], $testKey),
            'hashed_text' => $this->hashFieldData($testData['text'], $testKey),
            'ope_number' => $this->opeEncryptFieldData($testData['number'], $testKey),
            // ... more test cases
        ];

        // Run JavaScript tests and compare results
        $jsResults = $this->runJavaScriptTests($testData, $testKey);

        $mismatches = [];
        foreach ($phpResults as $key => $phpValue) {
            if (!hash_equals($phpValue, $jsResults[$key] ?? '')) {
                $mismatches[] = $key;
            }
        }

        if (!empty($mismatches)) {
            throw new Exception("Encryption compatibility failed for: " . implode(', ', $mismatches));
        }

        return true;
    }

    /**
     * Performance benchmark for encryption operations
     */
    public function benchmarkEncryptionOperations()
    {
        $iterations = 1000;
        $testData = 'This is a test string for encryption performance testing';
        $key = 'performance_test_key_32_bytes_long';

        $startTime = microtime(true);

        for ($i = 0; $i < $iterations; $i++) {
            $encrypted = $this->encryptFieldData($testData, $key);
            $decrypted = $this->decryptFieldData($encrypted, $key);
        }

        $endTime = microtime(true);
        $avgTime = (($endTime - $startTime) / $iterations) * 1000; // Convert to milliseconds

        if ($avgTime > 10) { // 10ms threshold
            throw new Exception("Encryption performance too slow: {$avgTime}ms per operation");
        }

        return [
            'iterations' => $iterations,
            'total_time' => $endTime - $startTime,
            'avg_time_ms' => $avgTime
        ];
    }
}
```

This technical documentation provides comprehensive coverage of the Active Tables encryption system, including detailed algorithms, implementation guidelines, and security considerations for migration to React.
