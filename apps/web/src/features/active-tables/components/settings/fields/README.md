# Fields Settings Components

Comprehensive field configuration system for Active Tables with support for 26+ field types.

## Quick Start

```typescript
import { FieldsSettingsSection } from '@/features/active-tables/components/settings/fields';

function MySettingsPage() {
  const [fields, setFields] = useState<FieldConfig[]>([]);

  return (
    <FieldsSettingsSection
      fields={fields}
      onChange={setFields}
      e2eeEnabled={false}
    />
  );
}
```

## Components

### FieldsSettingsSection

Main component that displays field list and manages field CRUD operations.

**Props:**

```typescript
interface FieldsSettingsSectionProps {
  fields: FieldConfig[]; // Current fields
  onChange: (fields: FieldConfig[]) => void; // Callback when fields change
  e2eeEnabled?: boolean; // Whether E2EE is enabled (future)
}
```

**Features:**

- List view with field metadata
- Add/Edit/Delete actions
- Field type badges with colors
- Options preview for SELECT fields
- Integrated modal for field configuration

---

### FieldFormModal

Comprehensive modal for adding/editing fields.

**Props:**

```typescript
interface FieldFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (field: FieldConfig) => void;
  editingField?: FieldConfig | null;
  existingFieldNames: string[];
  availableTables?: Array<{ id: string; name: string }>;
  onLoadReferenceFields?: (tableId: string) => Promise<Field[]>;
}
```

**Usage:**

```typescript
<FieldFormModal
  open={isOpen}
  onClose={() => setIsOpen(false)}
  onSubmit={(field) => {
    console.log('New field:', field);
    setIsOpen(false);
  }}
  editingField={null} // null for new field
  existingFieldNames={fields.map(f => f.name)}
  availableTables={workspaceTables}
  onLoadReferenceFields={async (tableId) => {
    const table = await fetchTableConfig(tableId);
    return table.config.fields;
  }}
/>
```

---

### FieldTypeSelector

Visual field type picker with 26+ types organized by category.

**Props:**

```typescript
interface FieldTypeSelectorProps {
  value?: FieldType;
  onChange: (type: FieldType) => void;
  disabled?: boolean;
  error?: boolean;
}
```

**Categories:**

- Text (5 types)
- Time (9 types)
- Numeric (2 types)
- Selection (5 types)
- Reference (3 types)
- User (2 types)

---

### FieldOptionsEditor

Editor for SELECT/CHECKBOX field options.

**Props:**

```typescript
interface FieldOptionsEditorProps {
  options: FieldOption[];
  onChange: (options: FieldOption[]) => void;
  error?: boolean;
  errorMessage?: string;
}
```

**Features:**

- Add/edit/delete options
- 8 color presets
- Reorder options
- Auto-generate values
- Visual preview

---

### ReferenceFieldConfig

Configuration for REFERENCE field types.

**Props:**

```typescript
interface ReferenceFieldConfigProps {
  fieldType: FieldType;
  referenceTableId?: string;
  referenceLabelField?: string;
  referenceField?: string; // For FIRST_REFERENCE_RECORD
  availableTables: Array<{ id: string; name: string }>;
  availableFields: Array<{ name: string; label: string; type: string }>;
  onChange: (config: ReferenceConfig) => void;
  loadingFields?: boolean;
  error?: boolean;
  errorMessage?: string;
}
```

**Special Handling:**

- FIRST_REFERENCE_RECORD requires `referenceField`
- Only SELECT_ONE_RECORD/SELECT_LIST_RECORD fields eligible as reference field
- Contextual help for reverse lookup concept

---

## Field Types

### Text Fields

```typescript
'SHORT_TEXT'; // Single line (max 255)
'TEXT'; // Multi-line
'RICH_TEXT'; // Formatted text
'EMAIL'; // Email validation
'URL'; // URL validation
```

### Time Fields

```typescript
'DATE'; // YYYY-MM-DD
'DATETIME'; // YYYY-MM-DD HH:MM:SS
'TIME'; // HH:MM:SS
'YEAR'; // YYYY
'MONTH'; // 1-12
'DAY'; // 1-31
'HOUR'; // 0-23
'MINUTE'; // 0-59
'SECOND'; // 0-59
```

### Numeric Fields

```typescript
'INTEGER'; // Whole numbers
'NUMERIC'; // Decimals
```

### Selection Fields

```typescript
'CHECKBOX_YES_NO'; // Boolean
'CHECKBOX_ONE'; // Single checkbox
'CHECKBOX_LIST'; // Multiple checkboxes
'SELECT_ONE'; // Single select
'SELECT_LIST'; // Multiple select
```

### Reference Fields

```typescript
'SELECT_ONE_RECORD'; // Link to one record
'SELECT_LIST_RECORD'; // Link to many records
'FIRST_REFERENCE_RECORD'; // Reverse lookup (read-only)
```

### User Fields

```typescript
'SELECT_ONE_WORKSPACE_USER'; // Assign one user
'SELECT_LIST_WORKSPACE_USER'; // Assign many users
```

---

## Utilities

### Field Name Generator

Auto-generate field names from labels with Vietnamese normalization.

```typescript
import {
  generateFieldName,
  ensureUniqueFieldName,
  validateFieldName,
} from '@/features/active-tables/utils/field-name-generator';

// Generate from label
const name = generateFieldName('Tên khách hàng');
// → 'ten_khach_hang'

// Ensure uniqueness
const uniqueName = ensureUniqueFieldName('email', ['email', 'email_2']);
// → 'email_3'

// Validate
const validation = validateFieldName('my_field');
// → { valid: true }
```

**Features:**

- Vietnamese diacritic normalization
- snake_case conversion
- Reserved keyword checking
- Uniqueness enforcement

---

## Validation Rules

### Required Fields

- Field type (must be valid FieldType)
- Field label (non-empty string)
- Field name (valid, unique)

### Field Type Specific

- **SELECT/CHECKBOX**: Minimum 1 option required
- **REFERENCE**: Reference table and label field required
- **FIRST_REFERENCE_RECORD**: Reference field also required

### Field Name Rules

- Lowercase letters, numbers, underscores only
- Must start with letter or underscore
- Max 64 characters
- Cannot be SQL reserved keyword
- Must be unique in table

---

## Examples

### Adding a New Field

```typescript
const [fields, setFields] = useState<FieldConfig[]>([
  {
    type: 'SHORT_TEXT',
    label: 'Customer Name',
    name: 'customer_name',
    placeholder: 'Enter name...',
    required: true,
  },
]);

function handleAddField(newField: FieldConfig) {
  setFields([...fields, newField]);
}
```

### Editing an Existing Field

```typescript
function handleEditField(index: number, updatedField: FieldConfig) {
  const newFields = [...fields];
  newFields[index] = updatedField;
  setFields(newFields);
}
```

### Field with Options

```typescript
const selectField: FieldConfig = {
  type: 'SELECT_ONE',
  label: 'Status',
  name: 'status',
  required: true,
  options: [
    {
      text: 'Open',
      value: 'open',
      text_color: '#1E40AF',
      background_color: '#DBEAFE',
    },
    {
      text: 'In Progress',
      value: 'in_progress',
      text_color: '#EA580C',
      background_color: '#FFEDD5',
    },
    {
      text: 'Completed',
      value: 'completed',
      text_color: '#047857',
      background_color: '#D1FAE5',
    },
  ],
};
```

### Reference Field

```typescript
const referenceField: FieldConfig = {
  type: 'SELECT_ONE_RECORD',
  label: 'Customer',
  name: 'customer_id',
  referenceLabelField: 'customer_name',
  // Note: referenceTableId stored separately in backend
};
```

### FIRST_REFERENCE_RECORD

```typescript
const reverseField: FieldConfig = {
  type: 'FIRST_REFERENCE_RECORD',
  label: 'Latest Payment',
  name: 'latest_payment',
  referenceLabelField: 'payment_date',
  // referenceField specified which field in reference table links back
};
```

---

## API Integration

### Fetch Available Tables

```typescript
import { createActiveTablesApiClient } from '@/shared/api/active-tables-client';

const client = createActiveTablesApiClient(workspaceId);

const { data: tables } = await client.get<ActiveTablesResponse>('/workflow/get/active_tables');

const availableTables = tables.data.map((t) => ({
  id: t.id,
  name: t.name,
}));
```

### Fetch Table Fields

```typescript
const { data: tableData } = await client.post<ActiveTable>(`/workflow/get/active_tables/${tableId}`, {});

const availableFields = tableData.config.fields.map((f) => ({
  name: f.name,
  label: f.label,
  type: f.type,
}));
```

### Update Table Fields

```typescript
await client.post(`/workflow/update/active_tables/${tableId}`, {
  config: {
    ...existingConfig,
    fields: updatedFields,
  },
});
```

---

## Styling

All components use the design system:

```typescript
// Colors
text - blue - 600; // Text fields
text - purple - 600; // Time fields
text - green - 600; // Numeric fields
text - orange - 600; // Selection fields
text - pink - 600; // Reference fields

// Spacing
space - y - 2; // Within fields
space - y - 4; // Within sections
space - y - 6; // Between sections

// Typography
text - sm; // Body text
text - xs; // Help text
font - mono; // Technical text
```

---

## Accessibility

### Keyboard Navigation

- Tab through all fields
- Enter to submit
- Escape to close modal
- Arrow keys in dropdowns

### Screen Readers

- All fields have labels
- Error messages linked with aria-describedby
- ARIA expanded/selected states
- Loading states announced

### Mobile

- Touch targets min 44x44px
- Scrollable content areas
- No hover-dependent features
- Responsive modals

---

## Testing

### Unit Tests

```typescript
describe('generateFieldName', () => {
  it('normalizes Vietnamese characters', () => {
    expect(generateFieldName('Tên khách hàng')).toBe('ten_khach_hang');
  });

  it('converts to snake_case', () => {
    expect(generateFieldName('Email Address')).toBe('email_address');
  });

  it('handles special characters', () => {
    expect(generateFieldName('Số điện thoại (Mobile)')).toBe('so_dien_thoai_mobile');
  });
});
```

### Integration Tests

```typescript
describe('FieldFormModal', () => {
  it('submits valid field', async () => {
    const onSubmit = jest.fn();
    render(
      <FieldFormModal
        open={true}
        onClose={() => {}}
        onSubmit={onSubmit}
        existingFieldNames={[]}
      />
    );

    // Select field type
    await userEvent.click(screen.getByLabelText('Field Type'));
    await userEvent.click(screen.getByText('Short Text'));

    // Enter label
    await userEvent.type(screen.getByLabelText('Field Label'), 'Test Field');

    // Submit
    await userEvent.click(screen.getByText('Add Field'));

    expect(onSubmit).toHaveBeenCalledWith({
      type: 'SHORT_TEXT',
      label: 'Test Field',
      name: 'test_field',
      // ...
    });
  });
});
```

---

## Troubleshooting

### Field name not auto-generating

- Check that label has been entered
- Verify `nameManuallyEdited` state is false
- Check Vietnamese normalization for special characters

### Options not saving

- Ensure at least 1 option exists
- Check that option text is not empty
- Verify color values are valid hex codes

### Reference fields not loading

- Verify `onLoadReferenceFields` is provided
- Check API response format matches expected structure
- Look for console errors in field loading

### Validation errors not showing

- Ensure `showValidation` is true (triggered on first submit)
- Check `validationErrors` state is populated
- Verify error messages are conditionally rendered

---

## Performance Tips

1. **Memoize field lists**: Use `useMemo` for large schemas
2. **Debounce API calls**: Don't fetch on every keystroke
3. **Lazy load reference fields**: Only fetch when table selected
4. **Optimize re-renders**: Use proper dependencies in useEffect

---

## Related Documentation

- [Implementation Summary](../../../../../docs/implementation-summary-fields-settings-component.md)
- [Design Decisions](../../../../../docs/design-decisions-fields-settings.md)
- [Active Table Config Spec](../../../../../docs/specs/active-table-config-functional-spec.md)
- [Design System](../../../../../docs/design-system.md)

---

## Support

For issues or questions:

1. Check existing implementation summary
2. Review design decisions document
3. Check TypeScript types for detailed interfaces
4. Refer to shadcn/ui documentation for base components
