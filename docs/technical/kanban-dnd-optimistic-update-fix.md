# Kanban Drag & Drop - Optimistic Update Fix

## ⚠️ Vấn Đề

Sau khi hoàn thành implementation kanban drag & drop, phát hiện ra **UI không update ngay lập tức** sau khi kéo thả card giữa các columns. Mặc dù API call thành công và server lưu đúng dữ liệu, nhưng người dùng phải **refresh page** mới thấy sự thay đổi.

### Triệu chứng

- ✅ API PATCH request thành công (200 OK)
- ✅ Server state được cập nhật chính xác
- ❌ UI không di chuyển card sang column mới
- ❌ Phải reload page mới thấy thay đổi

## 🔍 Root Cause Analysis

Vấn đề nằm ở **query key mismatch** giữa:

1. **Data fetching** sử dụng query key có `params`
2. **Query invalidation** chỉ match partial key không có `params`

### Query Key Thực Tế

**Hook fetch data** (`useActiveTableRecordsWithConfig`):

```typescript
const recordsQuery = useQueryWithAuth({
  queryKey: activeTableRecordsQueryKey(workspaceId, tableId, params),
  // queryKey = ['active-table-records', workspaceId, tableId, { paging: 'cursor', limit: 50, direction: 'desc' }]
});
```

**Mutation invalidation** (ban đầu - SAI):

```typescript
queryClient.invalidateQueries({
  queryKey: ['active-tables', tableId, 'records'], // ❌ Key hoàn toàn sai!
});
```

### Lỗi Cascade

1. **Lỗi 1**: Query key prefix sai - `'active-tables'` vs `'active-table-records'`
2. **Lỗi 2**: Thiếu `workspaceId` trong key
3. **Lỗi 3**: Thiếu `params` object khiến không match exact key
4. **Kết quả**: `invalidateQueries` không tìm thấy query nào để invalidate → không trigger refetch

## ✅ Solution Implemented

### 1. Fix Query Key Prefix & Structure

**File**: `apps/web/src/features/active-tables/hooks/use-update-record.ts`

#### Sử Dụng Prefix Matching

React Query hỗ trợ **prefix matching** với `exact: false`, cho phép invalidate tất cả queries bắt đầu với một prefix nhất định, bất kể params.

**Before** (không work):

```typescript
queryClient.invalidateQueries({
  queryKey: ['active-tables', tableId, 'records'],
});
```

**After** (works):

```typescript
queryClient.invalidateQueries({
  queryKey: ['active-table-records', workspaceId, tableId],
  exact: false, // Match all queries with this prefix, regardless of params
});
```

Với `exact: false`, React Query sẽ invalidate:

- ✅ `['active-table-records', '123', '456', { paging: 'cursor', limit: 50 }]`
- ✅ `['active-table-records', '123', '456', { paging: 'offset', limit: 100 }]`
- ✅ Bất kỳ query nào bắt đầu với prefix `['active-table-records', '123', '456']`

### 2. Fix Optimistic Updates

Optimistic update cũng gặp vấn đề tương tự - cần update **tất cả** queries matching prefix, không chỉ một query cụ thể.

**Before** (chỉ update 1 exact query):

```typescript
const previousRecords = queryClient.getQueryData(['active-table-records', workspaceId, tableId]);

queryClient.setQueryData(['active-table-records', workspaceId, tableId], (old: any) => {
  // Update logic...
});
```

**After** (update tất cả matching queries):

```typescript
// Snapshot all matching queries for rollback
const previousQueries: any[] = [];
queryClient
  .getQueriesData({
    queryKey: ['active-table-records', workspaceId, tableId],
    exact: false,
  })
  .forEach(([key, data]) => {
    previousQueries.push({ key, data });
  });

// Optimistically update ALL matching queries
queryClient.setQueriesData(
  {
    queryKey: ['active-table-records', workspaceId, tableId],
    exact: false,
  },
  (old: any) => {
    if (!old?.data) return old;

    return {
      ...old,
      data: old.data.map((record: any) => {
        if (record.id === recordId) {
          return {
            ...record,
            record: {
              ...record.record,
              [fieldName]: newValue,
            },
            data: record.data
              ? {
                  ...record.data,
                  [fieldName]: newValue,
                }
              : undefined,
          };
        }
        return record;
      }),
    };
  },
);
```

### 3. Fix Error Rollback

Rollback cũng cần restore **tất cả** queries đã snapshot:

**Before**:

```typescript
if (context?.previousRecords) {
  queryClient.setQueryData(['active-table-records', workspaceId, tableId], context.previousRecords);
}
```

**After**:

```typescript
if (context?.previousQueries) {
  context.previousQueries.forEach(({ key, data }: any) => {
    queryClient.setQueryData(key, data);
  });
}
```

### 4. Fix TypeScript Errors

Sửa lỗi tham chiếu `table.tableId` không tồn tại:

**Before**:

```typescript
const encryptionKey = localStorage.getItem(`table_${table.tableId}_encryption_key`);
```

**After**:

```typescript
const encryptionKey = localStorage.getItem(`table_${tableId}_encryption_key`);
```

## 📊 Changes Summary

### Files Modified

1. **`apps/web/src/features/active-tables/hooks/use-update-record.ts`**
   - ✅ Fixed `onMutate`: Use `setQueriesData` with prefix matching
   - ✅ Fixed `onError`: Restore all previous queries
   - ✅ Fixed `onSuccess`: Invalidate with `exact: false`
   - ✅ Fixed encryption key retrieval: Use `tableId` param instead of `table.tableId`
   - ✅ Applied to both `useUpdateRecordField` and `useBatchUpdateRecord` hooks

### Code Diff Summary

```diff
onMutate: async ({ recordId, fieldName, newValue }) => {
  if (!table) return;

  // Cancel outgoing refetches
  await queryClient.cancelQueries({
-   queryKey: ['active-tables', tableId, 'records'],
+   queryKey: ['active-table-records', workspaceId, tableId],
+   exact: false,
  });

- // Snapshot previous value for rollback
- const previousRecords = queryClient.getQueryData(['active-tables', tableId, 'records']);
+ // Snapshot all queries for rollback
+ const previousQueries: any[] = [];
+ queryClient.getQueriesData({
+   queryKey: ['active-table-records', workspaceId, tableId],
+   exact: false,
+ }).forEach(([key, data]) => {
+   previousQueries.push({ key, data });
+ });

- // Optimistically update to new value
- queryClient.setQueryData(['active-tables', tableId, 'records'], (old: any) => {
+ // Optimistically update all matching queries
+ queryClient.setQueriesData(
+   {
+     queryKey: ['active-table-records', workspaceId, tableId],
+     exact: false,
+   },
+   (old: any) => {
    // Update logic...
-  });
+  },
+ );

- return { previousRecords };
+ return { previousQueries };
},

onError: (err, variables, context) => {
- if (context?.previousRecords) {
-   queryClient.setQueryData(['active-tables', tableId, 'records'], context.previousRecords);
+ if (context?.previousQueries) {
+   context.previousQueries.forEach(({ key, data }: any) => {
+     queryClient.setQueryData(key, data);
+   });
  }
  console.error('Failed to update record:', err);
},

onSuccess: () => {
  if (!table) return;
  queryClient.invalidateQueries({
-   queryKey: ['active-tables', tableId, 'records'],
+   queryKey: ['active-table-records', workspaceId, tableId],
+   exact: false,
  });
},
```

## ✅ Verification

### Expected Behavior After Fix

1. **Drag card from Column A to Column B**
2. **Immediately see**:
   - ✅ Card disappears from Column A
   - ✅ Card appears in Column B
   - ✅ Column counts update (A: -1, B: +1)
3. **Behind the scenes**:
   - Optimistic update makes UI change instantly
   - API PATCH request sent to server
   - Query invalidation triggers refetch to sync with server
   - If API fails, rollback to previous state

### Test Case

```
Initial State:
- Column "Nữ": 1 card ("Lưu Thanh Sang")
- Column "Nam": 0 cards

Action: Drag "Lưu Thanh Sang" from "Nữ" → "Nam"

Expected Result (IMMEDIATE):
- Column "Nữ": 0 cards
- Column "Nam": 1 card ("Lưu Thanh Sang")

Server Sync:
- PATCH /api/workspace/.../records/... { record: { gender: "Nam" } }
- 200 OK
- Refetch records → UI stays consistent
```

## 🎯 Key Learnings

### React Query Best Practices

1. **Use Prefix Matching for Dynamic Queries**
   - When query keys include dynamic params, use `exact: false` for invalidation
   - Ensures all variations of the query are invalidated

2. **Snapshot All Related Queries for Rollback**
   - Don't assume there's only one query instance
   - Use `getQueriesData()` to find all matching queries
   - Store all snapshots for complete rollback on error

3. **Consistent Query Keys**
   - Maintain consistent query key structure across hooks
   - Use helper functions like `activeTableRecordsQueryKey()` to generate keys
   - Document query key format in comments

4. **Optimistic Updates = Better UX**
   - Users see changes instantly without waiting for network
   - Rollback on error maintains data integrity
   - Worth the extra complexity for better perceived performance

### Common Pitfalls Avoided

❌ **Don't**: Hard-code query keys in mutations
✅ **Do**: Use query key factory functions

❌ **Don't**: Assume exact key match works for all scenarios
✅ **Do**: Use prefix matching when params vary

❌ **Don't**: Forget to handle optimistic update rollback
✅ **Do**: Always implement `onError` with proper rollback logic

## 📝 Remaining Work

### 1. Test with Multiple Cards

Current limitation: Testhanya có 1 card duy nhất, nên kéo thả luôn collision với chính nó. Cần test với table có nhiều cards để verify:

- ✅ Drag from card A to card B (drop on another card)
- ✅ Drag to empty column area
- ✅ Optimistic update cho nhiều cards

### 2. Remove Debug Logs

Clean up console.log statements trong production:

```typescript
console.log('🎯 DND handleDragEnd called', { activeId: active.id, overId: over?.id });
console.log('🔍 Direct column match:', destinationColumn?.id);
console.log('✅ Moving record:', { activeId, currentStatus, newStatus: destinationColumn.id });
console.log('⏭️ Status unchanged, skipping move');
```

### 3. Add Toast Notifications

Replace console logs với user-facing toast messages:

- ✅ Success: "Card moved successfully"
- ❌ Error: "Failed to move card: {error message}"
- ⏳ Loading: Show spinner on dragged card

## 🚀 Impact

### Before Fix

- ❌ No immediate UI feedback
- ❌ Users must refresh page to see changes
- ❌ Poor UX despite functional API

### After Fix

- ✅ Instant UI updates (optimistic)
- ✅ Automatic sync with server
- ✅ Automatic rollback on errors
- ✅ Professional drag & drop experience

## 📚 Related Documentation

- [Kanban DnD Implementation Summary](./kanban-dnd-implementation-summary.md)
- [Kanban DnD Testing Results](./kanban-dnd-testing-results.md)
- [React Query Documentation - Optimistic Updates](https://tanstack.com/query/latest/docs/react/guides/optimistic-updates)
- [React Query Documentation - Query Invalidation](https://tanstack.com/query/latest/docs/react/guides/query-invalidation)
