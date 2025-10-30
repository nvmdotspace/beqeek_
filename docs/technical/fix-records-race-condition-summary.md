# Fix Summary: Records Page Race Condition

## Issue Fixed
Records not displaying properly in Active Table Records Page when using server-side encryption mode due to race condition between API calls.

## Root Cause
- `useActiveTable` (get table config) and `useActiveTableRecords` (get records) were called in parallel
- Records API could return before table config was loaded
- Decryption logic ran without knowing the encryption mode
- Result: Encrypted data shown instead of plaintext in server-side encryption mode

## Solution Implemented

### 1. Created Combined Hook (`useActiveTableRecordsWithConfig`)

**File**: [apps/web/src/features/active-tables/hooks/use-active-tables.ts:127-183](apps/web/src/features/active-tables/hooks/use-active-tables.ts:127-183)

```typescript
export const useActiveTableRecordsWithConfig = (
  workspaceId?: string,
  tableId?: string,
  params?: RecordQueryRequest
) => {
  // Step 1: Load table details first
  const tableQuery = useActiveTable(workspaceId, tableId);
  const table = tableQuery.data?.data;

  // Step 2: Only enable records query when table config is available
  const recordsQuery = useQueryWithAuth({
    queryKey: activeTableRecordsQueryKey(workspaceId, tableId, params),
    queryFn: () => getActiveTableRecords(workspaceId!, tableId!, params),
    // ✅ Wait for table config to be loaded before fetching records
    enabled: isAuthenticated && !!workspaceId && !!tableId && !!table?.config,
  });

  return {
    table,
    records,
    nextId,
    previousId,
    isReady,
    // ... other state
  };
};
```

**Key Feature**: Records query is **disabled** until `table.config` is loaded, ensuring correct order.

### 2. Updated Active Table Records Page

**File**: [apps/web/src/features/active-tables/pages/active-table-records-page.tsx:49-65](apps/web/src/features/active-tables/pages/active-table-records-page.tsx:49-65)

**Changes**:
- Replaced separate `useActiveTable` + `useActiveTableRecords` with `useActiveTableRecordsWithConfig`
- Simplified state management (single hook provides both table and records)
- Added pagination data (`nextId`, `previousId`)

### 3. Fixed useEffect Dependencies

**File**: [apps/web/src/features/active-tables/pages/active-table-records-page.tsx:72-127](apps/web/src/features/active-tables/pages/active-table-records-page.tsx:72-127)

**Before**:
```typescript
useEffect(() => {
  if (!encryption.isE2EEEnabled || ...) {
    setDecryptedRecords(records); // ❌ Could run before table.config loads
    return;
  }
  // ...
}, [recordsResp?.data, encryption.isE2EEEnabled, ...]);
```

**After**:
```typescript
useEffect(() => {
  // ✅ Guard: Wait for table config to be loaded
  if (!isReady || !table?.config) {
    return;
  }

  // ✅ Server-side encryption mode: data already decrypted by server
  if (!encryption.isE2EEEnabled) {
    setDecryptedRecords(records);
    return;
  }

  // E2EE mode: decrypt with key...
}, [
  isReady,        // ✅ Wait for both table and records
  records,
  encryption.isE2EEEnabled,
  encryption.isKeyValid,
  encryption.encryptionKey,
  table?.config,  // ✅ Added as dependency
  table?.id,
]);
```

**Key Improvements**:
1. **`isReady` guard**: Ensures both table config and records are loaded
2. **`table?.config` dependency**: Re-runs effect when config becomes available
3. **Clear encryption mode handling**: Explicit check for server-side vs E2EE mode

## Execution Flow Comparison

### Before (❌ Broken)
```
1. Component mount
   ├─ useActiveTable() → pending
   ├─ useActiveTableRecords() → pending
   └─ encryption.isE2EEEnabled = false (no config yet)

2. ❌ Records API returns FIRST
   ├─ records = [...encrypted data...]
   └─ useEffect triggers
      └─ !encryption.isE2EEEnabled → setDecryptedRecords(encrypted data)

3. Table API returns SECOND
   ├─ table.config.e2eeEncryption = false
   └─ useEffect DOES NOT re-run (records unchanged)
      └─ UI shows ENCRYPTED data ❌
```

### After (✅ Fixed)
```
1. Component mount
   ├─ useActiveTable() → pending
   └─ useActiveTableRecords() → DISABLED (waiting for config)

2. Table API returns
   ├─ table.config.e2eeEncryption = false
   └─ Records query ENABLED

3. ✅ Records API returns (server-side mode = plaintext)
   ├─ records = [...plaintext data...]
   └─ useEffect triggers
      ├─ isReady = true
      ├─ table.config exists
      └─ !encryption.isE2EEEnabled → setDecryptedRecords(plaintext)

4. ✅ UI shows PLAINTEXT data correctly
```

## Files Changed

1. [apps/web/src/features/active-tables/hooks/use-active-tables.ts](apps/web/src/features/active-tables/hooks/use-active-tables.ts:127-183)
   - Added `useActiveTableRecordsWithConfig` hook
   - Returns pagination data (`nextId`, `previousId`)

2. [apps/web/src/features/active-tables/pages/active-table-records-page.tsx](apps/web/src/features/active-tables/pages/active-table-records-page.tsx:1)
   - Updated imports to use new combined hook
   - Replaced separate queries with combined hook
   - Fixed useEffect dependencies and guards
   - Updated pagination to use `nextId` from hook

## Testing Checklist

- [x] TypeScript compilation passes
- [x] Build succeeds without errors
- [ ] **Manual Testing Required**:
  - [ ] Server-side encryption mode: Records display immediately
  - [ ] E2EE mode without key: Prompt shown, no data until key entered
  - [ ] E2EE mode with valid key: Records decrypt correctly
  - [ ] No flickering between encrypted/decrypted states
  - [ ] Pagination works with new hook

## Benefits

1. **Eliminates Race Condition**: Guaranteed API call order
2. **Clearer Intent**: Single hook expresses "get table WITH records"
3. **Better Developer Experience**: Less boilerplate, simpler state management
4. **Type Safety**: Full TypeScript coverage maintained
5. **Reusable Pattern**: Can be applied to other dependent queries

## Related Documentation

- [Root Cause Analysis](docs/technical/issue-records-not-displaying.md:1)
- [Encryption Flow Analysis](docs/technical/analysis-encryption-flow.md:1)
- [API Specification](docs/swagger.yaml:735-843)

## Deployment Notes

No database migrations or environment changes required. This is a pure frontend fix.

## Performance Impact

**Slight improvement**:
- Records API only fires after table config loads (fewer wasted requests on error)
- No unnecessary re-renders from race condition
- Decryption cache still active for performance

---

**Status**: ✅ Implemented and Built Successfully
**Date**: 2025-10-30
**Author**: Claude Code
