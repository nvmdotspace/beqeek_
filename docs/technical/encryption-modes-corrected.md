# Encryption Modes - Corrected Understanding

## ❌ Previous Misunderstanding

**Incorrect assumption**: Server-side encryption mode means server decrypts data before sending to client.

**Reality**: BOTH encryption modes require client-side decryption. The difference is WHERE the encryption key is stored and managed.

---

## ✅ Correct Understanding

### Mode 1: Server-Side Encryption (`e2eeEncryption: false`)

**Characteristics**:

- Encryption key is **GENERATED AND STORED by server**
- Server **SENDS KEY to client** in table config API response
- Data is **ENCRYPTED in database**
- Server sends **ENCRYPTED data** to client
- Client **DECRYPTS** using key from server

**API Response Example**:

```json
{
  "config": {
    "e2eeEncryption": false,
    "encryptionKey": "mRX76b6kRRi3Alz0V5gFbqOT4MF7cZtx",
    "encryptionAuthKey": "d4ea0cb2cf5a6bc85ee3f163f9b66b7948d8ac3906fc6945e4fdbc1ba3918c79"
  }
}
```

**Flow**:

```
1. Client: GET /tables/{tableId}
2. Server: Returns config with encryptionKey
3. Client: GET /tables/{tableId}/records
4. Server: Returns ENCRYPTED records
5. Client: Decrypt using table.config.encryptionKey
6. Display plaintext
```

**Security Characteristics**:

- ✅ Data encrypted at rest in database
- ✅ Data encrypted in transit (HTTPS)
- ⚠️ Server has plaintext access (can decrypt anytime)
- ⚠️ Key transmitted over network (secured by HTTPS)
- ⚠️ Anyone with database + server access can decrypt
- ✅ User doesn't need to remember encryption key
- ✅ Key recovery possible (server has key)

### Mode 2: End-to-End Encryption (E2EE) (`e2eeEncryption: true`)

**Characteristics**:

- Encryption key is **GENERATED AND STORED by client** (localStorage)
- Key **NEVER sent to server**
- Server only stores `encryptionAuthKey` (SHA256³ hash for verification)
- Data is **ENCRYPTED in database**
- Server sends **ENCRYPTED data** to client
- Client **DECRYPTS** using key from localStorage

**API Response Example**:

```json
{
  "config": {
    "e2eeEncryption": true,
    "encryptionKey": null, // ❌ Server does NOT send key
    "encryptionAuthKey": "d4ea0cb2cf5a6bc85ee3f163f9b66b7948d8ac3906fc6945e4fdbc1ba3918c79"
  }
}
```

**Flow**:

```
1. Client: GET /tables/{tableId}
2. Server: Returns config with e2eeEncryption=true, encryptionAuthKey
3. Client: Check localStorage for encryption key
   ├─ Key found → Verify with authKey
   └─ Key not found → Show "Enter Encryption Key" modal
4. User inputs key → SHA256³(key) === encryptionAuthKey → Save to localStorage
5. Client: GET /tables/{tableId}/records
6. Server: Returns ENCRYPTED records
7. Client: Decrypt using localStorage key
8. Display plaintext
```

**Security Characteristics**:

- ✅ Data encrypted at rest in database
- ✅ Data encrypted in transit (HTTPS)
- ✅ Server has NO plaintext access (zero-knowledge)
- ✅ Key NEVER transmitted over network
- ✅ Even with database + server compromise, data remains secure
- ⚠️ User must remember/backup encryption key
- ❌ Key loss = permanent data loss (no recovery)

---

## Comparison Table

| Aspect                    | Server-Side Encryption       | E2EE                             |
| ------------------------- | ---------------------------- | -------------------------------- |
| **Key Storage**           | Server database              | Client localStorage              |
| **Key in API Response**   | ✅ Yes (`encryptionKey`)     | ❌ No (only `encryptionAuthKey`) |
| **Data in Database**      | Encrypted                    | Encrypted                        |
| **Data in API Response**  | Encrypted                    | Encrypted                        |
| **Client Decryption**     | ✅ Required                  | ✅ Required                      |
| **Decryption Key Source** | `table.config.encryptionKey` | `localStorage`                   |
| **Server Can Decrypt**    | ✅ Yes                       | ❌ No                            |
| **Key Recovery**          | ✅ Possible                  | ❌ Impossible                    |
| **Zero-Knowledge**        | ❌ No                        | ✅ Yes                           |
| **User Convenience**      | ✅ High (no key management)  | ⚠️ Low (must manage key)         |
| **Security Level**        | ⚠️ Medium                    | ✅ High                          |

---

## Implementation Details

### Decryption Logic (Client-Side)

```typescript
useEffect(() => {
  const decryptAllRecords = async () => {
    if (!isReady || !table?.config) return;

    let decryptionKey: string | null = null;

    if (encryption.isE2EEEnabled) {
      // E2EE Mode: Use key from localStorage
      if (!encryption.isKeyValid || !encryption.encryptionKey) {
        setDecryptedRecords(records); // Show encrypted (no key)
        return;
      }
      decryptionKey = encryption.encryptionKey;
    } else {
      // Server-Side Mode: Use key from server config
      decryptionKey = table.config.encryptionKey ?? null;
    }

    if (!decryptionKey) {
      setDecryptedRecords(records);
      return;
    }

    // Decrypt records with available key
    const decrypted = await Promise.all(
      records.map((record) => decryptRecord(record, table.config.fields, decryptionKey)),
    );
    setDecryptedRecords(decrypted);
  };

  decryptAllRecords();
}, [isReady, records, encryption.isE2EEEnabled, encryption.encryptionKey, table?.config]);
```

### Key Points

1. **BOTH modes require client-side decryption**
2. **Server NEVER sends plaintext data** (only encrypted)
3. **Difference**: WHERE the encryption key comes from
   - Server-side: `table.config.encryptionKey`
   - E2EE: `localStorage.getItem('encryption_key_...')`

---

## Use Cases

### When to Use Server-Side Encryption

✅ **Good for**:

- Internal business applications
- Trusted environment (users trust server admin)
- Need for data recovery
- Compliance requires encryption at rest
- Users shouldn't manage keys

❌ **Not suitable for**:

- Highly sensitive data (medical, financial)
- Zero-trust requirements
- User-controlled privacy
- Untrusted server environment

### When to Use E2EE

✅ **Good for**:

- Maximum privacy requirements
- Zero-trust architecture
- User-controlled encryption
- Highly sensitive data
- Compliance requires zero-knowledge

❌ **Not suitable for**:

- Need for data recovery
- Users forget keys frequently
- Server needs to index/search data
- Shared access without key sharing

---

## Migration Path

If you need to migrate from server-side to E2EE:

1. **Export data** (decrypt with server key)
2. **Generate client-side key** (32 chars)
3. **Re-encrypt data** with new key
4. **Update config**: `e2eeEncryption: true`
5. **Remove server key** from database
6. **Distribute new key** to authorized users

**Warning**: This is a one-way migration. E2EE → Server-side requires key escrow.

---

## Security Recommendations

### For Server-Side Encryption:

1. Use HSM (Hardware Security Module) for key storage
2. Implement key rotation policy
3. Audit key access logs
4. Encrypt keys at rest
5. Use separate database for keys

### For E2EE:

1. Implement key backup/export feature
2. Show key on first setup (print/download)
3. Warn users about key loss
4. Consider key derivation from passphrase (PBKDF2)
5. Implement key sharing for teams (encrypted key distribution)

---

## Related Files

- Implementation: [apps/web/src/features/active-tables/pages/active-table-records-page.tsx:74-138](apps/web/src/features/active-tables/pages/active-table-records-page.tsx:74-138)
- Encryption Hook: [apps/web/src/features/active-tables/hooks/use-table-encryption.ts](apps/web/src/features/active-tables/hooks/use-table-encryption.ts:1)
- Core Decryption: [packages/active-tables-core/src/utils/record-decryptor.ts](packages/active-tables-core/src/utils/record-decryptor.ts:1)
- Original Analysis: [docs/technical/analysis-encryption-flow.md](docs/technical/analysis-encryption-flow.md:1)

---

## Acknowledgment

Special thanks to the user for correcting the misunderstanding about server-side encryption mode. The initial assumption that "server decrypts before sending" was incorrect. In reality, BOTH modes use client-side decryption - they differ only in key management.

**Key Insight**: The term "server-side encryption" is misleading. A better term would be "server-managed encryption" vs "client-managed encryption (E2EE)".
