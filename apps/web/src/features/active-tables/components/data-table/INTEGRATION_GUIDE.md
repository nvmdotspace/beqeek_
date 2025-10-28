# Data Table Integration Guide

Quick guide to integrate the new DataTable component into the Active Tables Records Page.

## Step 1: Import the DataTable Component

In `apps/web/src/features/active-tables/pages/active-table-records-page.tsx`:

```tsx
// Add this import at the top
import { DataTable } from "../components/data-table";
```

## Step 2: Get Encryption Key

You already have `useEncryption` imported. You can use it to get the encryption key:

```tsx
const { isReady: isEncryptionReady, encryptionKey } = useEncryption();
```

Or if you need to implement a new hook specifically for table encryption:

```tsx
// Create apps/web/src/features/active-tables/hooks/use-encryption-key.ts
import { useState, useEffect } from "react";

export function useEncryptionKey(tableId: string) {
  const [encryptionKey, setEncryptionKey] = useState<string | null>(null);

  useEffect(() => {
    if (!tableId) return;

    // Load encryption key from localStorage
    const key = localStorage.getItem(`active-table-encryption-key-${tableId}`);
    setEncryptionKey(key);
  }, [tableId]);

  return { encryptionKey };
}
```

## Step 3: Replace Old RecordsTable Component

Find this code in `active-table-records-page.tsx` (around lines 403-431):

```tsx
<RecordsTable
  fields={fields}
  records={records}
  emptyLabel={m.activeTables_records_emptyState()}
  onEdit={handleEditRecord}
  onDelete={handleDeleteRecord}
  onSelect={handleSelectRecord}
/>
```

Replace it with:

```tsx
<DataTable
  table={table!} // table is guaranteed to exist at this point
  records={records}
  isLoading={isLoading}
  isFetching={isFetching}
  encryptionKey={encryptionKey}
  page={page}
  hasNextPage={records.length > 0} // or use actual next_id check
  hasPreviousPage={page > 0}
  onNextPage={loadNext}
  onPreviousPage={loadPrevious}
  onRefresh={refetch}
  onCreateRecord={handleCreateRecord}
  onEditRecord={handleEditRecord}
  onDeleteRecord={handleDeleteRecord}
  onViewComments={handleSelectRecord}
  onRowClick={handleSelectRecord}
/>
```

## Step 4: Remove Old Components (Optional)

You can remove or comment out the old `RecordsTable` component (lines 64-186) once you verify the new DataTable works correctly.

## Step 5: Update Pagination Logic (If Needed)

The DataTable uses `hasNextPage` and `hasPreviousPage` props. Update your pagination logic:

```tsx
// In your useActiveTableRecords hook response
const hasNextPage = !!nextCursor; // or however you determine this
const hasPreviousPage = page > 0;
```

## Complete Example

Here's a complete TabsContent replacement:

```tsx
<TabsContent value="table" className="space-y-4">
  {isLoading ? (
    <div className="space-y-3">
      <Skeleton className="h-10 w-full rounded-lg" />
      <Skeleton className="h-64 w-full rounded-lg" />
    </div>
  ) : error ? (
    <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-6 text-sm text-destructive">
      {error instanceof Error ? error.message : m.activeTables_records_errorGeneric()}
    </div>
  ) : table ? (
    <DataTable
      table={table}
      records={records}
      isLoading={isLoadingRecords}
      isFetching={isFetching}
      encryptionKey={encryptionKey}
      page={page}
      hasNextPage={records.length > 0}
      hasPreviousPage={page > 0}
      onNextPage={loadNext}
      onPreviousPage={loadPrevious}
      onRefresh={refetch}
      onCreateRecord={handleCreateRecord}
      onEditRecord={handleEditRecord}
      onDeleteRecord={handleDeleteRecord}
      onViewComments={handleSelectRecord}
      onRowClick={handleSelectRecord}
    />
  ) : (
    <div className="rounded-lg border border-dashed border-border/60 bg-muted/20 p-6 text-sm text-muted-foreground">
      {m.activeTables_records_invalidContext()}
    </div>
  )}
</TabsContent>
```

## Step 6: Test

1. **Run the dev server**:
   ```bash
   pnpm dev
   ```

2. **Navigate to a table's records page**:
   - Non-encrypted table: Verify data displays correctly
   - E2EE table: Verify decryption works (data is readable, not garbled)

3. **Test all features**:
   - Click rows → Comments panel should open
   - Click Edit → Edit dialog should open
   - Click Delete → Confirmation should appear
   - Click Refresh → Data should reload
   - Click Create Record → Create dialog should open
   - Click Next/Previous → Pagination should work
   - Try on mobile → Should be responsive

## Troubleshooting

### Data Shows as Encrypted/Garbled

**Problem**: Records show encrypted values like "U2FsdGVkX1..."

**Solution**:
- Ensure `encryptionKey` is passed to DataTable
- Check that `table.config.e2eeEncryption` is true
- Verify encryption key is correct (32 characters)
- Check browser console for decryption errors

### TypeScript Errors

**Problem**: Import errors or type mismatches

**Solution**:
```bash
# Rebuild workspace
pnpm build

# Check types
pnpm --filter web check-types
```

### Table Doesn't Render

**Problem**: Empty screen or error

**Solution**:
- Ensure `table` prop is not null/undefined
- Check `records` is an array
- Verify `fields` is populated
- Check browser console for errors

### Pagination Doesn't Work

**Problem**: Next/Previous buttons don't work

**Solution**:
- Ensure `onNextPage` and `onPreviousPage` are provided
- Verify `hasNextPage` and `hasPreviousPage` are correct
- Check that your pagination hook updates the page state

## Advanced: Custom Field Rendering

If you need custom rendering for specific fields:

```tsx
// In data-table-columns.tsx, modify formatFieldValue:
case "CUSTOM_FIELD_TYPE":
  return (
    <CustomFieldRenderer value={value} field={field} />
  );
```

## Advanced: Add Column Visibility Toggle

```tsx
import { DataTable } from "../components/data-table";
import { Button } from "@workspace/ui/components/button";
import { Settings2 } from "lucide-react";

// In your component
const [columnVisibility, setColumnVisibility] = useState({});

// Add a button to toggle columns
<Button onClick={() => {/* show column selector */}}>
  <Settings2 className="h-4 w-4" />
  Columns
</Button>
```

## Support

For issues or questions:
1. Check the [README.md](./README.md) for detailed documentation
2. Review [IMPLEMENTATION_SUMMARY.md](../../../../../IMPLEMENTATION_SUMMARY.md)
3. Check the [rebuild plan](../../../../../plans/20241128-active-tables-record-detail-rebuild-plan.md)
