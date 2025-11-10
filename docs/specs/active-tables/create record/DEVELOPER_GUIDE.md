# Create Record Developer Guide

## Quick Start

### Using the Create Record Dialog

```tsx
import { CreateRecordDialog } from '@/features/active-tables/components/record-form/create-record-dialog';

// In your component
const [isDialogOpen, setIsDialogOpen] = useState(false);

return (
  <>
    <Button onClick={() => setIsDialogOpen(true)}>Create Record</Button>

    <CreateRecordDialog
      open={isDialogOpen}
      onOpenChange={setIsDialogOpen}
      table={table}
      workspaceId={workspaceId}
      tableId={tableId}
      onSuccess={(recordId) => {
        console.log('Created record:', recordId);
        // Navigate or refresh
      }}
    />
  </>
);
```

### Using the Hook Directly

```tsx
import { useCreateRecord } from '@/features/active-tables/hooks/use-create-record';

const createMutation = useCreateRecord(workspaceId, tableId, table);

const handleSubmit = async (formData: Record<string, any>) => {
  try {
    const response = await createMutation.mutateAsync({
      record: formData,
    });
    console.log('Created record ID:', response.data.id);
  } catch (error) {
    console.error('Failed:', error);
  }
};
```

## Encryption Flow

### How It Works

```typescript
// 1. User fills form
const formData = {
  name: 'John Doe',
  age: 30,
  status: 'active',
};

// 2. Hook encrypts based on field types
const encrypted = {
  name: AES256.encrypt('John Doe', key),        // Text → AES-256-CBC
  age: OPE.encryptInt('30', key),                // Number → OPE
  status: HMAC.hash('active', key),              // Select → HMAC
};

// 3. Generate hashes
const record_hashes = {
  name: HMAC.hash('John Doe', key),
  age: HMAC.hash('30', key),
  status: HMAC.hash('active', key),
};

// 4. Generate searchable keywords (if configured)
const hashed_keywords = {
  name: ['john_hash', 'doe_hash'],  // Tokenized + hashed
};

// 5. Send to API
POST /api/.../records
{
  record: encrypted,
  hashed_keywords: hashed_keywords,
  record_hashes: record_hashes
}
```

### Encryption Key Storage

```typescript
// E2EE mode: Key in localStorage
const encryptionKey = localStorage.getItem(`table_${tableId}_encryption_key`);

// Server-side encryption: Key in table config
const encryptionKey = table.config.encryptionKey;
```

## Adding New Field Types

### 1. Add to Field Input Component

```tsx
// apps/web/src/features/active-tables/components/record-form/field-input.tsx

if (field.type === 'YOUR_NEW_TYPE') {
  return (
    <div className="space-y-2">
      <FieldLabel />
      <YourCustomInput value={value} onChange={(val) => setValue(field.name, val)} error={error} />
    </div>
  );
}
```

### 2. Add Encryption Logic (if needed)

If your field type needs custom encryption:

```typescript
// apps/web/src/shared/utils/field-encryption.ts

export function encryptFieldValue(value: unknown, fieldType: FieldType, key: string) {
  // ... existing types ...

  if (fieldType === 'YOUR_NEW_TYPE') {
    return YourEncryptionFunction(value, key);
  }
}
```

Or use existing encryption in CommonUtils:

```typescript
// packages/encryption-core/src/common-utils.ts

// Add to appropriate category
static yourTypeFields(): string[] {
  return ['YOUR_NEW_TYPE'];
}
```

## Field Type Examples

### Text Field

```typescript
{
  name: 'email',
  type: 'EMAIL',
  label: 'Email Address',
  required: true,
  placeholder: 'user@example.com'
}
// Renders: <input type="email" required />
// Encrypts: AES-256-CBC
```

### Number Field

```typescript
{
  name: 'price',
  type: 'NUMERIC',
  label: 'Price',
  required: true,
  placeholder: '0.00'
}
// Renders: <input type="number" step="0.01" />
// Encrypts: OPE (Order-Preserving)
```

### Select Field

```typescript
{
  name: 'status',
  type: 'SELECT_ONE',
  label: 'Status',
  required: true,
  options: [
    { value: 'active', text: 'Active' },
    { value: 'inactive', text: 'Inactive' }
  ]
}
// Renders: <Select> dropdown
// Encrypts: HMAC-SHA256 hash
```

### Date Field

```typescript
{
  name: 'birthday',
  type: 'DATE',
  label: 'Birthday',
  required: false,
  placeholder: 'Select date'
}
// Renders: <input type="date" />
// Encrypts: OPE (enables date range queries)
```

## Validation

### Built-in Validation

```tsx
// Required fields
{
  name: 'email',
  required: true,  // ← Enforced by react-hook-form
}

// Type validation (automatic)
type: 'EMAIL'  // → validates email format
type: 'URL'    // → validates URL format
type: 'INTEGER' // → only accepts integers
```

### Custom Validation

```tsx
import { useForm } from 'react-hook-form';

const form = useForm({
  defaultValues: getDefaultValues(table),
  // Add custom validation rules
  resolver: async (values) => {
    const errors = {};

    if (values.age && values.age < 18) {
      errors.age = {
        type: 'manual',
        message: 'Must be 18 or older',
      };
    }

    return {
      values: Object.keys(errors).length === 0 ? values : {},
      errors,
    };
  },
});
```

## Error Handling

### API Errors

```tsx
const createMutation = useCreateRecord(workspaceId, tableId, table);

if (createMutation.isError) {
  // Display error
  <Alert variant="destructive">{createMutation.error?.message || 'Failed to create record'}</Alert>;
}
```

### Encryption Errors

```typescript
try {
  const encrypted = AES256.encrypt(value, key);
} catch (error) {
  if (error.message.includes('invalid key')) {
    // Prompt user to re-enter key
  } else {
    // Show generic error
  }
}
```

### Validation Errors

```tsx
const {
  formState: { errors },
} = form;

if (errors.email) {
  <p className="text-destructive">{errors.email.message}</p>;
}
```

## Testing

### Unit Testing

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { useCreateRecord } from './use-create-record';

test('creates record with encryption', async () => {
  const { result } = renderHook(() => useCreateRecord('ws-1', 'table-1', mockTable));

  const record = { name: 'Test' };

  await act(async () => {
    await result.current.mutateAsync({ record });
  });

  expect(mockApiCall).toHaveBeenCalledWith(
    expect.objectContaining({
      record: expect.objectContaining({
        name: expect.stringMatching(/^[A-Za-z0-9+/]+=*$/), // Base64
      }),
    }),
  );
});
```

### Integration Testing

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { CreateRecordDialog } from './create-record-dialog';

test('submits form with validation', async () => {
  render(
    <CreateRecordDialog
      open={true}
      onOpenChange={jest.fn()}
      table={mockTable}
      workspaceId="ws-1"
      tableId="table-1"
      onSuccess={jest.fn()}
    />
  );

  // Fill required field
  const input = screen.getByLabelText(/Name/);
  fireEvent.change(input, { target: { value: 'John' } });

  // Submit
  const submitBtn = screen.getByText('Create Record');
  fireEvent.click(submitBtn);

  // Wait for success
  await waitFor(() => {
    expect(mockOnSuccess).toHaveBeenCalled();
  });
});
```

## Performance Optimization

### Lazy Field Loading

For tables with 50+ fields, consider lazy loading:

```tsx
import { lazy, Suspense } from 'react';

const HeavyFieldInput = lazy(() => import('./heavy-field-input'));

// In render
<Suspense fallback={<Skeleton />}>
  <HeavyFieldInput field={field} form={form} />
</Suspense>;
```

### Memoization

```tsx
import { memo } from 'react';

export const FieldInput = memo(
  ({ field, form }) => {
    // Component logic
  },
  (prevProps, nextProps) => {
    // Custom comparison
    return prevProps.field.name === nextProps.field.name;
  },
);
```

### Debounced Validation

```tsx
import { useDebounce } from '@/hooks/use-debounce';

const debouncedValue = useDebounce(value, 500);

useEffect(() => {
  // Validate after 500ms of inactivity
  validateField(debouncedValue);
}, [debouncedValue]);
```

## Troubleshooting

### Dialog Not Opening

```tsx
// Check state management
const [isOpen, setIsOpen] = useState(false);

// Ensure controlled properly
<CreateRecordDialog
  open={isOpen}
  onOpenChange={setIsOpen} // ← Must handle open/close
/>;
```

### Encryption Key Not Found

```typescript
// Check localStorage
const key = localStorage.getItem(`table_${tableId}_encryption_key`);

if (!key) {
  // Redirect to enter key page
  navigate({ to: ROUTES.ACTIVE_TABLES.TABLE_DETAIL });
}
```

### Field Not Rendering

```typescript
// Check field type spelling
field.type === 'SHORT_TEXT'; // ✅ Correct
field.type === 'short_text'; // ❌ Wrong (case-sensitive)

// Check beqeek-shared constants
import { FIELD_TYPE_SHORT_TEXT } from '@workspace/beqeek-shared';
```

### Validation Not Working

```tsx
// Ensure required flag is set
{
  name: 'email',
  required: true,  // ← Must be true, not 'true' or 1
}

// Register with validation
{...register(field.name, {
  required: field.required ? 'This field is required' : false
})}
```

## Best Practices

### 1. Always Use Type Constants

```typescript
// ❌ Bad
if (field.type === 'SHORT_TEXT') { ... }

// ✅ Good
import { FIELD_TYPE_SHORT_TEXT } from '@workspace/beqeek-shared';
if (field.type === FIELD_TYPE_SHORT_TEXT) { ... }
```

### 2. Handle Encryption Keys Securely

```typescript
// ❌ Bad - Never log encryption keys
console.log('Key:', encryptionKey);

// ✅ Good - Only log key existence
console.log('Key exists:', !!encryptionKey);
```

### 3. Validate Before Encrypting

```typescript
// ✅ Good - Validate first
if (!value || value === '') {
  return null; // Don't encrypt empty values
}
const encrypted = AES256.encrypt(value, key);
```

### 4. Use TypeScript Types

```typescript
// ✅ Good - Full type safety
import type { FieldConfig, Table } from '@workspace/active-tables-core';
import type { FieldType } from '@workspace/beqeek-shared';

interface Props {
  field: FieldConfig;
  table: Table;
}
```

### 5. Provide User Feedback

```tsx
// ✅ Good - Show loading state
<Button disabled={createMutation.isPending}>
  {createMutation.isPending ? (
    <>
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      Creating...
    </>
  ) : (
    'Create Record'
  )}
</Button>
```

## Additional Resources

- **API Reference**: `/docs/specs/active-tables/create record/CREATE_RECORD_API_REFERENCE.md`
- **Flow Analysis**: `/docs/specs/active-tables/create record/CREATE_RECORD_FLOW_ANALYSIS.md`
- **React Spec**: `/docs/specs/active-tables/create record/REACT_MIGRATION_CREATE_RECORD_SPEC.md`
- **Implementation Summary**: `/docs/specs/active-tables/create record/IMPLEMENTATION_SUMMARY.md`
- **Encryption Core**: `/packages/encryption-core/README.md`
- **Active Tables Core**: `/packages/active-tables-core/README.md`
- **Shared Types**: `/packages/beqeek-shared/README.md`
