## Encryption

- All active tables utilize encryption for sensitive data.
- The `e2eeEncryption` flag in a table's configuration (`e2eeEncryption: true`) determines the key management strategy:
  - If `true` (End-to-End Encryption): The `encryptionKey` is managed and stored _client-side_ by the user (e.g., in local storage). The server stores an `encryptionAuthKey` (a SHA256 hash of the `encryptionKey` repeated 3 times) for verification.
  - If `false` (Server-Managed Encryption): The `encryptionKey` is managed and stored _server-side_. The client does not directly handle the `encryptionKey`.

Process:

1.  **Retrieve Table Configuration and Key:**
    - When a user accesses an E2EE-enabled table, the application fetches the table's configuration.
    - It checks for `e2eeEncryption: true`.
    - If the `encryptionKey` is not already available client-side, the user is prompted to enter it.
    - The entered `encryptionKey` is verified against the `encryptionAuthKey` from the table configuration.
    - The valid `encryptionKey` is stored client-side (e.g., in `localStorage`) and attached to `States.currentTable.config.encryptionKey`.

2.  **Prepare Record Data for Submission (e.g., in `RecordView.saveRecord`):**
    - Collect raw record data from the form fields.
    - Initialize `data` (for encrypted field values) and `hashedKeywords` (for searchable hashed values).

3.  **Encrypt and Hash Fields:**
    - Iterate through each field defined in `States.currentTable.config.fields`.
    - For each field, determine its encryption/hashing strategy based on its `type`:  
      a. **Direct Encryption (AES-256 CBC):**
      - Applicable to `SHORT_TEXT`, `RICH_TEXT`, `TEXT`, `EMAIL`, `URL` field types.
      - Use `CommonUtils.encryptTableData(table, field.name, rawValue)` which internally calls `CommonUtils.encryptData(rawValue, encryptionKey)`.
      - The encrypted ciphertext (Base64 encoded, with IV prepended) replaces the raw value in the `data.record` object.  
        b. **Order-Preserving Encryption (OPE):**
      - Applicable to `INTEGER`, `NUMERIC`, `DATE`, `DATETIME`, `TIME` field types.
      - Use `CommonUtils.encryptTableData(table, field.name, rawValue)` which internally calls `OPEncryptor.encrypt...` methods.
      - The OPE-encrypted value replaces the raw value in the `data.record` object.  
        c. **Hashing (HMAC-SHA256):**
      - Applicable to `SELECT_ONE`, `SELECT_LIST`, `CHECKBOX_YES_NO`, `CHECKBOX_ONE`, `CHECKBOX_LIST` field types.
      - Use `CommonUtils.encryptTableData(table, field.name, rawValue)` which internally calls `CryptoJS.HmacSHA256(rawValue, encryptionKey)`.
      - The HMAC-hashed value replaces the raw value in the `data.record` object.  
        d. **Hashed Keywords for Search:**
      - If a field's `name` is present in `States.currentTable.config.hashedKeywordFields` AND its `type` is one of `encryptFields` (e.g., `SHORT_TEXT`, `RICH_TEXT`), then:
      - Tokenize the raw field value using `CommonUtils.tokenize(rawValue)`.
      - Hash each token using `CommonUtils.hashKeyword(token, encryptionKey)`.
      - Store these hashed tokens in the `hashedKeywords` object (e.g., `hashedKeywords[field.name] = [hashedToken1, hashedToken2, ...]`).

4.  **Generate Record Hashes:**
    - After all fields in `data.record` are encrypted/hashed, generate a hash for each field's _encrypted_ value.
    - Use `CommonUtils.hashRecordData(fields, rawRecordData, encryptionKey)` to create `record_hashes`. This is typically HMAC-SHA256 of the encrypted field values.
    - This `record_hashes` object is included in the payload.

5.  **Send to API:**
    - Construct the final payload: `{"record": encryptedRecordData, "hashed_keywords": hashedKeywords, "record_hashes": recordHashes}`.
    - Send this payload to the `/api/workspace/{workspaceId}/workflow/post/active_tables/{tableId}/records` endpoint (for creation) or  
      `/api/workspace/{workspaceId}/workflow/patch/active_tables/{tableId}/records/{recordId}` (for update).

Example Flow (Simplified):

```javascript
// Assuming States.currentTable.config.encryptionKey is available
const rawRecordData = {
  task_title: 'My secret task',
  start_date: '2025-10-26',
  status: 'pending',
};

const encryptedRecord = {};
const hashedKeywords = {};

States.currentTable.config.fields.forEach((field) => {
  const rawValue = rawRecordData[field.name];
  if (rawValue !== undefined) {
    encryptedRecord[field.name] = CommonUtils.encryptTableData(States.currentTable, field.name, rawValue);

    if (
      States.currentTable.config.hashedKeywordFields.includes(field.name) &&
      CommonUtils.encryptFields().includes(field.type)
    ) {
      hashedKeywords[field.name] = CommonUtils.hashKeyword(rawValue, States.currentTable.config.encryptionKey);
    }
  }
});

const recordHashes = CommonUtils.hashRecordData(
  States.currentTable.config.fields,
  rawRecordData,
  States.currentTable.config.encryptionKey,
);

const payload = {
  record: encryptedRecord,
  hashed_keywords: hashedKeywords,
  record_hashes: recordHashes,
};

// Send payload to API
// await TableAPI.createRecord(States.currentTable, payload);
```

## Decryption

// Send payload to API  
// await TableAPI.createRecord(States.currentTable, payload);

**Decryption Process (Client-Side):**

1.  **Retrieve Encrypted Record Data:**
    - When fetching records from the API (e.g., in `TableAPI.fetchRecords` or `TableAPI.fetchRecordById`), the response will contain encrypted field values.
    - Ensure the `encryptionKey` for the table is available client-side (as established in the encryption key management step).

2.  **Decrypt Fields:**
    - Iterate through each field in the fetched record.
    - For each field, use `CommonUtils.decryptTableData(table, field.name, encryptedValue)` to decrypt the value based on its `type`:  
      a. **Direct Decryption (AES-256 CBC):**
      - For fields originally encrypted with AES-256 (e.g., `SHORT_TEXT`, `RICH_TEXT`), `CommonUtils.decryptData(encryptedValue, encryptionKey)` is called.
      - The IV (prepended to the ciphertext) is extracted, and the remaining ciphertext is decrypted using AES-256.  
        b. **Order-Preserving Decryption (OPE):**
      - For fields originally encrypted with OPE (e.g., `INTEGER`, `NUMERIC`, `DATE`, `DATETIME`), `OPEncryptor.decrypt(encryptedValue)` is called.
      - This method extracts the strongly encrypted part and decrypts it to retrieve the original value.  
        c. **Hashing (HMAC-SHA256) - Value Mapping:**
      - For fields originally hashed (e.g., `SELECT_ONE`, `SELECT_LIST`), direct decryption is not possible as hashing is one-way.
      - Instead, the client-side code attempts to map the hashed value back to its original plaintext option by re-hashing known options and comparing them.
      - For `SELECT_LIST` and `CHECKBOX_LIST`, each hashed value in the array is mapped.

3.  **Display Decrypted Data:**
    - The decrypted values are then used for display in the UI.

Example Flow (Simplified Decryption):

```javascript
// Assuming States.currentTable.config.encryptionKey is available
// And 'encryptedRecordFromServer' is the data received from the API
const encryptedRecordFromServer = {
  id: '...',
  record: {
    task_title: 'ck4nR0HA2LK/lXE8RUv9KT7tPtQzsyc2IoU+4Y9pnFPi4PrlfEqD5Diw3tQikW9E',
    status: 'daa9d4d4b2cf614bcaf946c68442a3190c3bf07e2870b21afdd1f198cbf64476',
  },
  // ... other fields
};

const decryptedRecord = { ...encryptedRecordFromServer };
decryptedRecord.record = { ...encryptedRecordFromServer.record };

States.currentTable.config.fields.forEach((field) => {
  const encryptedValue = encryptedRecordFromServer.record[field.name];
  if (encryptedValue !== undefined) {
    decryptedRecord.record[field.name] = CommonUtils.decryptTableData(States.currentTable, field.name, encryptedValue);
  }
});

// 'decryptedRecord' now contains the original plaintext values for display.
// console.log(decryptedRecord.record.task_title); // "My secret task"
```
