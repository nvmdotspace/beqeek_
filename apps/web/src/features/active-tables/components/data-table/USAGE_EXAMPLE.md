# DataTable Usage Example

This guide shows how to integrate the TanStack Table implementation with Active Tables encryption support.

## Basic Usage

```tsx
import { useParams } from "@tanstack/react-router";
import { DataTable, createColumns } from "@/features/active-tables/components/data-table";
import { useDecryptedRecords } from "@/features/active-tables/hooks/use-decrypted-records";
import { useEncryptionKey } from "@/features/active-tables/hooks/use-encryption-key";

export function ActiveTableRecordsPage() {
  const { tableId } = useParams({ strict: false });
  
  // Fetch table configuration
  const { data: table, isLoading: isLoadingTable } = useActiveTable(tableId);
  
  // Fetch records
  const { 
    data: recordsData, 
    isLoading: isLoadingRecords,
    refetch 
  } = useActiveTableRecords(tableId);
  
  // Get encryption key
  const { encryptionKey } = useEncryptionKey(tableId);
  
  // Decrypt records
  const { records: decryptedRecords, isDecrypting } = useDecryptedRecords({
    records: recordsData?.data || [],
    fields: table?.config?.fields || [],
    encryptionKey,
    isE2EEEnabled: table?.config?.e2eeEncryption || false,
  });
  
  // Create columns with row actions
  const columns = React.useMemo(
    () =>
      createColumns(table?.config?.fields || [], {
        enableRowActions: true,
        onEdit: handleEditRecord,
        onDelete: handleDeleteRecord,
        onViewComments: handleViewComments,
      }),
    [table?.config?.fields]
  );
  
  return (
    <DataTable
      table={table}
      records={decryptedRecords}
      columns={columns}
      isLoading={isLoadingRecords || isDecrypting}
      isE2EEEnabled={table?.config?.e2eeEncryption}
      hasEncryptionKey={!!encryptionKey}
      nextCursor={recordsData?.next_id}
      previousCursor={recordsData?.previous_id}
      onPageChange={handlePageChange}
      onRefresh={refetch}
      onCreate={handleCreateRecord}
      totalRecords={recordsData?.totalRecords}
    />
  );
}
```

## Column Customization

Create custom columns for specific field types:

```tsx
import { type ColumnDef } from "@tanstack/react-table";
import { createColumns } from "@/features/active-tables/components/data-table";

// Use default columns
const columns = createColumns(fields, {
  enableRowActions: true,
  onEdit: handleEdit,
  onDelete: handleDelete,
});

// Or create fully custom columns
const customColumns: ColumnDef<ActiveTableRecord>[] = [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => <span className="font-mono">{row.original.id}</span>,
  },
  {
    accessorFn: (row) => row.record.name,
    id: "name",
    header: "Name",
    cell: ({ row }) => {
      const name = row.original.record.name;
      return <span className="font-medium">{name}</span>;
    },
  },
  // Add more custom columns...
];
```

## Pagination Handling

Cursor-based pagination with API integration:

```tsx
const [cursor, setCursor] = React.useState<string | null>(null);
const [direction, setDirection] = React.useState<"next" | "previous">("next");

// Query with cursor
const { data } = useActiveTableRecords(tableId, {
  cursor,
  limit: 20,
});

const handlePageChange = (newCursor: string | null, dir: "next" | "previous") => {
  setCursor(newCursor);
  setDirection(dir);
};

<DataTable
  // ... other props
  nextCursor={data?.next_id}
  previousCursor={data?.previous_id}
  onPageChange={handlePageChange}
/>
```

## Row Actions

Handle row actions with callbacks:

```tsx
const handleEditRecord = (record: ActiveTableRecord) => {
  setSelectedRecord(record);
  setIsEditDialogOpen(true);
};

const handleDeleteRecord = async (record: ActiveTableRecord) => {
  if (confirm("Are you sure you want to delete this record?")) {
    await deleteRecordMutation.mutateAsync(record.id);
  }
};

const handleViewComments = (record: ActiveTableRecord) => {
  setSelectedRecord(record);
  setIsCommentsPanelOpen(true);
};

const columns = createColumns(fields, {
  enableRowActions: true,
  onEdit: handleEditRecord,
  onDelete: handleDeleteRecord,
  onViewComments: handleViewComments,
});
```

## Encryption Integration

The DataTable automatically works with decrypted records:

```tsx
// 1. Get encryption key
const { encryptionKey, isKeyLoaded } = useEncryptionKey(tableId);

// 2. Decrypt records
const { records: decryptedRecords, isDecrypting, hasError } = useDecryptedRecords({
  records: rawRecords,
  fields: table.config.fields,
  encryptionKey,
  isE2EEEnabled: table.config.e2eeEncryption,
});

// 3. Pass decrypted records to DataTable
<DataTable
  records={decryptedRecords}  // Already decrypted!
  isLoading={isDecrypting}
  isE2EEEnabled={table.config.e2eeEncryption}
  hasEncryptionKey={isKeyLoaded}
  // ... other props
/>
```

## Loading States

```tsx
<DataTable
  table={table}
  records={records}
  columns={columns}
  isLoading={isLoadingRecords || isDecrypting}
  // Shows spinner when loading and no records
  // Shows skeleton when loading and has records
/>
```

## Empty States

The DataTable automatically shows appropriate empty states:

```tsx
// No records + E2EE without key = "Please provide encryption key"
// No records + no E2EE = "Create your first record to get started"
// No records + E2EE with key = "Create your first record to get started"

<DataTable
  records={[]}  // Empty array triggers empty state
  isE2EEEnabled={table.config.e2eeEncryption}
  hasEncryptionKey={!!encryptionKey}
  onCreate={handleCreateRecord}  // Shows "Create Record" button
/>
```

## Field Type Support

The DataTable automatically handles all Active Tables field types:

- **SHORT_TEXT, RICH_TEXT, EMAIL, URL**: Text truncation
- **INTEGER, NUMERIC**: Number formatting with locale
- **DATE**: Date formatting
- **DATETIME**: DateTime formatting
- **SELECT_ONE**: Badge with custom colors
- **SELECT_LIST**: Multiple badges
- **CHECKBOX**: Checkbox display
- **RATING**: Star display
- **ATTACHMENT**: File count
- **USER**: User ID display
- **FORMULA, COMPUTED**: Monospace display

## Sorting

Sorting is enabled by default on all columns:

```tsx
// Columns are sortable by default
// Click header to toggle: unsorted → asc → desc → unsorted

// To disable sorting on a specific column:
const columns = createColumns(fields).map(col => 
  col.id === "actions" ? { ...col, enableSorting: false } : col
);
```

## Column Visibility

Column visibility will be implemented in future phases:

```tsx
// Future implementation:
<DataTableToolbar
  table={table}
  // Column visibility toggle button
/>
```

## Responsive Design

The DataTable is mobile-responsive:

- Desktop: Full table with all columns
- Tablet: Horizontal scroll for wide tables
- Mobile: Action buttons stack, columns scroll horizontally

## Accessibility

The DataTable follows WCAG 2.1 AA standards:

- Keyboard navigation (Tab, Arrow keys)
- Screen reader support (ARIA labels)
- Focus management
- Semantic HTML
- Sufficient color contrast

## Performance Tips

1. **Memoize columns**: Use `React.useMemo` for column definitions
2. **Debounce search**: If implementing search, debounce input
3. **Limit page size**: Keep page size under 100 records for best performance
4. **Virtual scrolling**: For very large datasets, consider adding virtual scrolling

```tsx
const columns = React.useMemo(
  () => createColumns(fields, { enableRowActions: true }),
  [fields]
);
```

## Error Handling

Handle decryption errors gracefully:

```tsx
const { 
  records: decryptedRecords, 
  hasError, 
  error 
} = useDecryptedRecords({...});

if (hasError) {
  return (
    <Alert variant="destructive">
      <AlertTitle>Decryption Error</AlertTitle>
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  );
}

<DataTable records={decryptedRecords} {...otherProps} />
```

## Complete Example

See `active-table-records-page.tsx` for a complete implementation with:
- Encryption key management
- Record CRUD operations
- Comments panel integration
- Kanban view toggle
- Loading and error states
