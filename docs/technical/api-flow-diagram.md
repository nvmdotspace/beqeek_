# API Call Flow Diagrams

## Before Fix: Race Condition ❌

```
┌─────────────────────────────────────────────────────────────────┐
│                    Component Mount                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ├──────────────┬───────────────────┐
                              │              │                   │
                              ▼              ▼                   ▼
                    ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
                    │ useActiveTable│  │useActiveTable│  │useTableEncry-│
                    │              │  │Records       │  │ption         │
                    │ GET /tables/ │  │              │  │              │
                    │ {tableId}    │  │ GET /tables/ │  │ config=undef.│
                    └──────────────┘  │ {tableId}/   │  │ isE2EE=false │
                           │          │ records      │  └──────────────┘
                           │          └──────────────┘
                           │                 │
                    (slower API)      (faster API)
                           │                 │
                           │                 ▼
                           │         ┌──────────────────┐
                           │         │ ❌ Records Return│
                           │         │ FIRST            │
                           │         │ (encrypted data) │
                           │         └──────────────────┘
                           │                 │
                           │                 ▼
                           │         ┌──────────────────┐
                           │         │ useEffect Trigger│
                           │         │ !isE2EEEnabled   │
                           │         │ → setDecrypted   │
                           │         │   (encrypted!)❌ │
                           │         └──────────────────┘
                           │                 │
                           ▼                 ▼
                    ┌──────────────────────────────────┐
                    │ Table Config Returns SECOND      │
                    │ - e2eeEncryption: false          │
                    │ - isE2EEEnabled updates: false   │
                    │ ❌ useEffect DOES NOT re-run     │
                    │   (records array unchanged)      │
                    └──────────────────────────────────┘
                                   │
                                   ▼
                    ┌──────────────────────────────────┐
                    │ ❌ UI SHOWS ENCRYPTED DATA       │
                    │    (should show plaintext)       │
                    └──────────────────────────────────┘
```

---

## After Fix: Sequential Loading ✅

```
┌─────────────────────────────────────────────────────────────────┐
│                    Component Mount                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
              ┌────────────────────────────────────┐
              │ useActiveTableRecordsWithConfig    │
              └────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
                    ▼                   ▼
        ┌──────────────────┐   ┌──────────────────┐
        │ Step 1:          │   │ Step 2:          │
        │ useActiveTable   │   │ useActiveTable   │
        │                  │   │ Records          │
        │ GET /tables/     │   │                  │
        │ {tableId}        │   │ enabled: false   │
        │                  │   │ (waiting...)     │
        └──────────────────┘   └──────────────────┘
                    │                   │
                    ▼                   │
        ┌──────────────────┐           │
        │ Table Config     │           │
        │ Returns          │           │
        │ - e2eeEncryption:│           │
        │   false          │           │
        │ - fields: [...]  │           │
        └──────────────────┘           │
                    │                   │
                    │ ✅ Config Ready   │
                    └──────────┬────────┘
                               │
                               ▼
                   ┌──────────────────────┐
                   │ Records Query ENABLED │
                   │                       │
                   │ GET /tables/{tableId}/│
                   │ records               │
                   │                       │
                   │ (with table.config)   │
                   └──────────────────────┘
                               │
                               ▼
                   ┌──────────────────────┐
                   │ ✅ Records Return     │
                   │ (plaintext data -    │
                   │  already decrypted   │
                   │  by server)          │
                   └──────────────────────┘
                               │
                               ▼
                   ┌──────────────────────┐
                   │ useTableEncryption   │
                   │ - isE2EEEnabled:false│
                   │ - config: {...}      │
                   └──────────────────────┘
                               │
                               ▼
                   ┌──────────────────────┐
                   │ useEffect Trigger    │
                   │ - isReady: true ✅   │
                   │ - table.config: ✅   │
                   │ - !isE2EEEnabled ✅  │
                   │                      │
                   │ → setDecryptedRecords│
                   │   (plaintext) ✅     │
                   └──────────────────────┘
                               │
                               ▼
                   ┌──────────────────────┐
                   │ ✅ UI SHOWS PLAINTEXT│
                   │    DATA CORRECTLY    │
                   └──────────────────────┘
```

---

## Key Differences

| Aspect | Before (❌) | After (✅) |
|--------|------------|-----------|
| **API Call Order** | Parallel (race condition) | Sequential (guaranteed order) |
| **Records Query Enabled** | Always (on mount) | Only when `table.config` exists |
| **Encryption Detection** | May run with `undefined` config | Always has valid config |
| **useEffect Guard** | No config check | `if (!isReady \|\| !table?.config) return;` |
| **Dependencies** | Missing `table?.config` | Includes `isReady` + `table?.config` |
| **Server-Side Mode** | Shows encrypted (wrong) | Shows plaintext (correct) |
| **E2EE Mode** | May attempt decrypt without config | Waits for config first |

---

## React Query Dependency Pattern

### Before: Independent Queries
```typescript
const tableQuery = useActiveTable(workspaceId, tableId);
const recordsQuery = useActiveTableRecords(workspaceId, tableId, params);
// ❌ Both enabled simultaneously → race condition
```

### After: Dependent Queries
```typescript
const tableQuery = useActiveTable(workspaceId, tableId);
const table = tableQuery.data?.data;

const recordsQuery = useQueryWithAuth({
  // ...
  enabled: !!workspaceId && !!tableId && !!table?.config,
  //                                      ^^^^^^^^^^^^^^^^
  //                                      ✅ Waits for table config
});
```

This is the standard **dependent queries** pattern in React Query, ensuring proper data loading order.

---

## Encryption Mode Handling

### Server-Side Encryption Mode
```
Table Config: { e2eeEncryption: false }
         │
         ▼
Server decrypts data BEFORE sending
         │
         ▼
API Response: { data: [...plaintext records...] }
         │
         ▼
Client: if (!isE2EEEnabled) {
          setDecryptedRecords(records); // ✅ Already plaintext
        }
         │
         ▼
UI displays plaintext ✅
```

### E2EE Mode (End-to-End Encryption)
```
Table Config: { e2eeEncryption: true, encryptionAuthKey: "..." }
         │
         ▼
Server sends ENCRYPTED data
         │
         ▼
API Response: { data: [...encrypted records...] }
         │
         ▼
Client checks localStorage for encryption key
         │
         ├─ Key found & valid
         │  └─ Decrypt records → Display plaintext ✅
         │
         └─ Key not found
            └─ Show "Enter Encryption Key" modal
               └─ User inputs key → Verify → Decrypt ✅
```

---

## Timeline Comparison

### Before Fix (Race Condition)
```
0ms   ├─ Component Mount
      ├─ API 1: GET /tables/{tableId} (starts)
      └─ API 2: GET /tables/{tableId}/records (starts)

50ms  └─ API 2 returns ❌ (faster - no config yet)
      └─ useEffect: !isE2EEEnabled → set encrypted data

150ms └─ API 1 returns (slower)
      └─ Config available but useEffect doesn't re-run ❌

Result: UI shows encrypted data ❌
```

### After Fix (Sequential)
```
0ms   ├─ Component Mount
      └─ API 1: GET /tables/{tableId} (starts)
      └─ API 2: DISABLED (waiting)

150ms └─ API 1 returns ✅
      └─ Config available
      └─ API 2: ENABLED (starts)

200ms └─ API 2 returns ✅
      └─ useEffect: isReady=true, config exists
      └─ !isE2EEEnabled → set plaintext data

Result: UI shows plaintext data ✅
```

**Total time difference**: ~50ms slower BUT correct result every time.

---

## Related Files

- Implementation: [apps/web/src/features/active-tables/hooks/use-active-tables.ts:127-183](apps/web/src/features/active-tables/hooks/use-active-tables.ts:127-183)
- Usage: [apps/web/src/features/active-tables/pages/active-table-records-page.tsx:49-127](apps/web/src/features/active-tables/pages/active-table-records-page.tsx:49-127)
- Analysis: [docs/technical/issue-records-not-displaying.md](docs/technical/issue-records-not-displaying.md:1)
