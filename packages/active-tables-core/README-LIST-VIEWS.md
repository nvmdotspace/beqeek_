# List Views - Phase 3 Implementation

## Overview

Phase 3 adds comprehensive list view components for displaying Active Table records in multiple layouts. Supports both table and card views with sorting, filtering, and selection capabilities.

## Components

### 1. RecordList (Main Component)

The main router component that automatically selects the appropriate layout based on configuration.

```tsx
import { RecordList } from '@workspace/active-tables-core';

<RecordList
  table={tableMetadata}
  records={records}
  config={{
    layout: 'head-column', // or 'table'
    titleField: 'task_title',
    subLineFields: ['status', 'assignee'],
    tailFields: ['due_date'],
  }}
  onRecordClick={(record) => navigateToDetail(record.id)}
  enableSelection={true}
  selectedIds={selectedIds}
  onSelectionChange={setSelectedIds}
  loading={isLoading}
  error={error}
  messages={{
    loading: 'Đang tải...',
    noRecordsFound: 'Không tìm thấy bản ghi',
    error: 'Lỗi tải dữ liệu',
  }}
/>
```

### 2. HeadColumnLayout (Card View)

Mobile-optimized card-based layout with:
- Title field (prominent display)
- Subline fields (status badges, metadata)
- Tail fields (additional info at bottom)
- Selection checkboxes (optional)
- Click handlers

**Best for:**
- Mobile applications
- Kanban-style views
- Quick scanning of records

**Features:**
- ✅ Responsive design
- ✅ Touch-friendly
- ✅ Visual hierarchy
- ✅ Field renderer integration
- ✅ E2EE decryption support

### 3. GenericTableLayout (Table View)

Powerful table layout using TanStack Table with:
- Sortable columns
- Row selection
- Column visibility
- Responsive scrolling

**Best for:**
- Desktop applications
- Data-heavy views
- Analysis and reporting

**Features:**
- ✅ TanStack Table v8
- ✅ Sortable columns (click header)
- ✅ Bulk selection
- ✅ Field renderer cells
- ✅ E2EE decryption support
- ✅ Horizontal scroll on mobile

### 4. State Components

#### EmptyState
```tsx
<EmptyState
  message="No records found"
  description="Try adjusting your filters"
  action={<button>Create New</button>}
/>
```

#### LoadingState
```tsx
<LoadingState
  message="Loading..."
  type="skeleton" // or 'spinner', 'bars'
  size="md" // or 'sm', 'lg'
/>
```

#### ErrorState
```tsx
<ErrorState
  message="Failed to load"
  details={error.message}
  onRetry={refetch}
  retryText="Try again"
/>
```

## Configuration

### RecordListConfig Structure

```typescript
interface RecordListConfig {
  /** Layout type: 'table' | 'head-column' | 'card' */
  layout: string;

  /** Field name to use as title */
  titleField: string;

  /** Field names to display as subline (below title) */
  subLineFields: string[];

  /** Field names to display at the end (right side) */
  tailFields: string[];
}
```

### Example Configuration

```json
{
  "layout": "head-column",
  "titleField": "task_title",
  "subLineFields": ["status", "priority", "assignee"],
  "tailFields": ["start_date", "due_date", "progress"]
}
```

## Props Reference

### RecordListProps

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `table` | `Table` | ✅ | Table metadata and configuration |
| `records` | `TableRecord[]` | ✅ | Array of records to display |
| `config` | `RecordListConfig` | ✅ | Layout configuration |
| `loading` | `boolean` | ❌ | Loading state |
| `error` | `Error \| string` | ❌ | Error state |
| `currentUser` | `CurrentUser` | ❌ | Current user for permissions |
| `workspaceUsers` | `WorkspaceUser[]` | ❌ | Users for user fields |
| `messages` | `Partial<ActiveTablesMessages>` | ❌ | i18n messages |
| `encryptionKey` | `string` | ❌ | E2EE key for encrypted tables |
| `onRecordClick` | `(record) => void` | ❌ | Record click handler |
| `onSelectionChange` | `(ids) => void` | ❌ | Selection change handler |
| `enableSelection` | `boolean` | ❌ | Enable bulk selection |
| `selectedIds` | `string[]` | ❌ | Selected record IDs |
| `enableSorting` | `boolean` | ❌ | Enable sorting |
| `enableFiltering` | `boolean` | ❌ | Enable filtering |
| `className` | `string` | ❌ | Additional CSS classes |

## Usage Examples

### Basic Card List

```tsx
function TaskList() {
  const { data: tasks, isLoading } = useQuery(['tasks'], fetchTasks);

  return (
    <RecordList
      table={taskTable}
      records={tasks}
      config={{
        layout: 'head-column',
        titleField: 'task_title',
        subLineFields: ['status', 'assignee'],
        tailFields: ['due_date'],
      }}
      loading={isLoading}
      onRecordClick={(record) => navigate(`/tasks/${record.id}`)}
    />
  );
}
```

### Table with Selection

```tsx
function DataTable() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const { data: records } = useQuery(['records'], fetchRecords);

  return (
    <div>
      <RecordList
        table={tableMetadata}
        records={records}
        config={{
          layout: 'table',
          titleField: 'name',
          subLineFields: ['status', 'category'],
          tailFields: ['created_at', 'updated_at'],
        }}
        enableSelection={true}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
      />

      {selectedIds.length > 0 && (
        <div className="fixed bottom-4 left-4">
          <button onClick={() => bulkDelete(selectedIds)}>
            Delete {selectedIds.length} selected
          </button>
        </div>
      )}
    </div>
  );
}
```

### With E2EE Encryption

```tsx
function SecureList() {
  const encryptionKey = useEncryptionKey(); // From localStorage
  const { data: records } = useQuery(['secure-records'], fetchRecords);

  return (
    <RecordList
      table={secureTable}
      records={records}
      config={listConfig}
      encryptionKey={encryptionKey}
      loading={isLoading}
    />
  );
}
```

### Vietnamese Localization

```tsx
import * as m from '@/paraglide/messages';

function VietnameseList() {
  return (
    <RecordList
      table={table}
      records={records}
      config={config}
      messages={{
        loading: m.loading(),
        noRecordsFound: m.no_records_found(),
        error: m.error_loading_data(),
        retry: m.retry(),
        scrollHorizontally: m.scroll_to_see_more(),
      }}
    />
  );
}
```

## Layout Selection Strategy

The RecordList component automatically selects the layout based on `config.layout`:

| Config Value | Component | Best For |
|--------------|-----------|----------|
| `'head-column'` | HeadColumnLayout | Mobile, cards, visual scanning |
| `'card'` | HeadColumnLayout | Same as above |
| `'table'` | GenericTableLayout | Desktop, data analysis |
| `'generic-table'` | GenericTableLayout | Same as above |

## Styling

### Default Styles

All components use TailwindCSS classes and follow the design system:

- **Card hover**: Subtle shadow elevation
- **Selection**: Blue ring and background
- **Table rows**: Gray hover background
- **Headers**: Gray background with uppercase text
- **Sorting**: Arrow indicators in headers

### Customization

```tsx
// Custom className
<RecordList
  {...props}
  className="shadow-lg rounded-xl"
/>

// Override with global CSS
.record-card {
  /* Your custom styles */
}
```

## Performance

### Optimization Tips

1. **Memoize handlers**:
```tsx
const handleClick = useCallback((record) => {
  navigate(`/records/${record.id}`);
}, [navigate]);
```

2. **Lazy load large lists**:
```tsx
import { Suspense } from 'react';

<Suspense fallback={<LoadingState />}>
  <RecordList {...props} />
</Suspense>
```

3. **Virtual scrolling** (for 1000+ records):
Consider using `@tanstack/react-virtual` with GenericTableLayout

4. **Pagination**:
Implement server-side pagination for very large datasets

## Accessibility

All components include:
- ✅ Proper ARIA labels
- ✅ Keyboard navigation
- ✅ Focus management
- ✅ Screen reader support
- ✅ Semantic HTML

## Mobile Responsiveness

- **HeadColumnLayout**: Optimized for mobile by default
- **GenericTableLayout**: Horizontal scroll with hint message
- **Touch targets**: Minimum 44x44px for interactive elements
- **Viewport meta**: Tested on iOS and Android

## Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers

## Dependencies

- `@tanstack/react-table@^8.20.6` - Table functionality
- `date-fns@^4.1.0` - Date formatting
- React 19 compatible

## Troubleshooting

### Records not displaying

**Check:**
1. `config.titleField` matches an existing field
2. Records array is not empty
3. Field configs exist in `table.config.fields`

### Sorting not working

**Ensure:**
- Columns have `enableSorting: true`
- Click on table headers (not just the text)

### Selection not working

**Verify:**
- `enableSelection={true}` is set
- `onSelectionChange` callback is provided
- `selectedIds` state is managed properly

### Decryption failing

**Check:**
- `encryptionKey` is provided
- Table has `e2eeEncryption: true`
- Key is 32 characters

## Migration from HTML Module

If migrating from the old Blade templates:

1. **Layout mapping**:
   - `head-column` → HeadColumnLayout
   - `table` → GenericTableLayout

2. **Data structure**: Same JSON structure, no changes needed

3. **Event handlers**: Use React callbacks instead of jQuery

4. **Styling**: Replace inline styles with TailwindCSS classes

## Future Enhancements

- [ ] Virtual scrolling for performance
- [ ] Advanced filtering UI
- [ ] Column reordering
- [ ] Export to CSV/Excel
- [ ] Print-friendly view
- [ ] Infinite scroll
- [ ] Sticky headers
- [ ] Column resizing
- [ ] Multi-column sorting

## References

- [TanStack Table Docs](https://tanstack.com/table/latest)
- [Active Tables Config Spec](../docs/specs/active-table-config-functional-spec.md)
- [Implementation Plan](../plans/active-tables-core-implementation-plan-vi.md)
