# Active Tables Data Table Components

Comprehensive TanStack Table implementation for Active Tables with built-in encryption/decryption support.

## Overview

This directory contains all components needed for displaying Active Tables records in a data table view with the following features:

- **Automatic decryption** - Seamlessly decrypts E2EE records using the `use-decrypted-records` hook
- **Field type rendering** - Smart rendering for all Active Tables field types (SHORT_TEXT, INTEGER, DATE, SELECT_ONE, etc.)
- **Sorting & filtering** - Client-side sorting and filtering with TanStack Table
- **Column visibility** - Toggle column visibility
- **Cursor-based pagination** - Matches Active Tables API pagination pattern
- **Row actions** - Edit, delete, and view comments
- **Responsive design** - Mobile-first responsive layout
- **Accessibility** - ARIA labels, keyboard navigation, screen reader support

## Components

### DataTable

Main data table component that orchestrates all features.

```tsx
import { DataTable } from "@/features/active-tables/components/data-table";

<DataTable
  table={activeTable}
  records={records}
  isLoading={isLoadingRecords}
  isFetching={isFetching}
  encryptionKey={encryptionKey}
  page={currentPage}
  hasNextPage={!!nextCursor}
  hasPreviousPage={currentPage > 0}
  onNextPage={handleNextPage}
  onPreviousPage={handlePreviousPage}
  onRefresh={refetch}
  onCreateRecord={handleCreateRecord}
  onEditRecord={handleEditRecord}
  onDeleteRecord={handleDeleteRecord}
  onViewComments={handleViewComments}
  onRowClick={handleRowClick}
/>
```

### DataTableToolbar

Toolbar with search, refresh, and create record actions.

```tsx
import { DataTableToolbar } from "@/features/active-tables/components/data-table";

<DataTableToolbar
  searchQuery={searchQuery}
  onSearchChange={setSearchQuery}
  onRefresh={refetch}
  onCreateRecord={handleCreateRecord}
  isLoading={isFetching}
  searchDisabled={true} // Coming soon feature
/>
```

### DataTablePagination

Pagination controls with cursor-based navigation.

```tsx
import { DataTablePagination } from "@/features/active-tables/components/data-table";

<DataTablePagination
  page={currentPage}
  recordCount={records.length}
  hasNextPage={!!nextCursor}
  hasPreviousPage={currentPage > 0}
  onNextPage={handleNextPage}
  onPreviousPage={handlePreviousPage}
  isLoading={isFetching}
/>
```

### DataTableRowActions

Dropdown menu for row actions.

```tsx
import { DataTableRowActions } from "@/features/active-tables/components/data-table";

<DataTableRowActions
  record={record}
  onEdit={handleEdit}
  onDelete={handleDelete}
  onViewComments={handleViewComments}
  canEdit={record.permissions?.update}
  canDelete={record.permissions?.delete}
/>
```

### Column Definitions

Utility functions to create column definitions.

```tsx
import {
  createColumns,
  createIdColumn,
  createUpdatedAtColumn,
} from "@/features/active-tables/components/data-table";

const columns = [
  createIdColumn(),
  ...createColumns(fields),
  createUpdatedAtColumn(),
];
```

## Field Type Support

The data table automatically handles rendering for all Active Tables field types:

| Field Type | Rendering | Features |
|------------|-----------|----------|
| SHORT_TEXT | Plain text | Truncation, hover tooltip |
| RICH_TEXT | Plain text preview | Truncation |
| INTEGER | Formatted number | Monospace font, locale formatting |
| NUMERIC | Formatted number | Monospace font, locale formatting |
| DATE | Formatted date | "MMM dd, yyyy" format |
| DATETIME | Formatted datetime | "MMM dd, yyyy HH:mm" format |
| SELECT_ONE | Badge | Custom colors from field options |
| SELECT_LIST | Multiple badges | Custom colors, wrapped layout |
| CHECKBOX | Checkbox (disabled) | Visual indicator |
| EMAIL | Plain text | Truncation |
| URL | Plain text | Truncation |
| PHONE | Plain text | Formatting |
| ATTACHMENT | File count | "X files" display |
| USER | User name | Object name extraction |
| USERS | User names | Comma-separated list |

## Encryption Support

The data table integrates with the `use-decrypted-records` hook for automatic decryption:

1. **E2EE Detection** - Checks `table.config.e2eeEncryption`
2. **Key Retrieval** - Gets encryption key from props
3. **Automatic Decryption** - Decrypts all records before rendering
4. **Error Handling** - Gracefully handles decryption failures
5. **Loading States** - Shows decryption progress

```tsx
// Encryption is handled automatically
const { records: decryptedRecords, isDecrypting } = useDecryptedRecords({
  records,
  fields,
  encryptionKey,
  isE2EEEnabled,
});
```

## Responsive Design

The data table is fully responsive:

- **Mobile** - Horizontal scroll for table, stacked toolbar
- **Tablet** - Optimized column widths, better spacing
- **Desktop** - Full features, all columns visible

## Accessibility

All components follow WCAG 2.1 AA guidelines:

- **ARIA labels** - All interactive elements labeled
- **Keyboard navigation** - Full keyboard support
- **Screen readers** - Semantic HTML, proper roles
- **Focus management** - Visible focus indicators
- **Color contrast** - Meets AA standards

## Performance

Optimizations for large datasets:

- **Memoization** - Decrypted records cached with `useMemo`
- **Lazy loading** - Components loaded on demand
- **Virtual scrolling** - (Future) For 1000+ records
- **Batch decryption** - Parallel decryption with `Promise.all`

## Usage Example

Complete integration example:

```tsx
import { DataTable } from "@/features/active-tables/components/data-table";
import { useActiveTableRecords } from "@/features/active-tables/hooks/use-active-records";
import { useEncryptionKey } from "@/features/active-tables/hooks/use-encryption-key";

export function RecordsPage({ tableId, workspaceId }) {
  const { table } = useActiveTable(workspaceId, tableId);
  const {
    records,
    isLoading,
    isFetching,
    page,
    loadNext,
    loadPrevious,
    refetch,
  } = useActiveTableRecords({ workspaceId, tableId });

  const { encryptionKey } = useEncryptionKey(tableId);

  const handleCreateRecord = () => {
    // Open create dialog
  };

  const handleEditRecord = (record) => {
    // Open edit dialog
  };

  const handleDeleteRecord = async (record) => {
    if (confirm("Delete this record?")) {
      await deleteRecord(record.id);
      refetch();
    }
  };

  const handleViewComments = (record) => {
    // Open comments panel
  };

  return (
    <DataTable
      table={table}
      records={records}
      isLoading={isLoading}
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
      onViewComments={handleViewComments}
    />
  );
}
```

## Future Enhancements

- [ ] Column resizing
- [ ] Column reordering (drag & drop)
- [ ] Inline editing
- [ ] Bulk operations (select multiple rows)
- [ ] Advanced filtering UI
- [ ] Export to CSV/Excel
- [ ] Virtual scrolling for large datasets
- [ ] Custom cell renderers
- [ ] Expandable rows
- [ ] Server-side sorting/filtering

## Testing

Run type checks:

```bash
pnpm --filter web check-types
```

Run tests (when available):

```bash
pnpm --filter web test
```

## Dependencies

- `@tanstack/react-table` - Table state management
- `@workspace/ui` - UI components (Button, Badge, Input, etc.)
- `date-fns` - Date formatting
- `lucide-react` - Icons
- `@workspace/active-tables-core` - Types
- `@workspace/encryption-core` - Encryption utilities

## Related Documentation

- [Active Tables Plan](../../../../../plans/20241128-active-tables-record-detail-rebuild-plan.md)
- [Encryption Helpers](../../utils/encryption-helpers.ts)
- [Decrypted Records Hook](../../hooks/use-decrypted-records.ts)
- [Design System](../../../../../docs/design-system.md)
