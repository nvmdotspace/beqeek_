# Code Standards & Best Practices

## Table of Contents

- [General Principles](#general-principles)
- [TypeScript Standards](#typescript-standards)
- [React Patterns](#react-patterns)
- [State Management](#state-management)
- [Styling Guidelines](#styling-guidelines)
- [File Organization](#file-organization)
- [Naming Conventions](#naming-conventions)
- [API Integration](#api-integration)
- [Testing Requirements](#testing-requirements)
- [Code Review Checklist](#code-review-checklist)

## General Principles

### Core Values

1. **Type Safety**: Full TypeScript coverage, no implicit any
2. **Immutability**: Prefer const, avoid mutations
3. **Simplicity**: Solve current problems, don't over-engineer
4. **Consistency**: Follow established patterns
5. **Performance**: Optimize where it matters

### Anti-Patterns to Avoid

❌ **Don't**:

```typescript
// Hardcoded values instead of constants
const STATUSES = ['active', 'inactive'];
type ActionType = 'create' | 'update' | 'delete';

// Mixed state management
const [data, setData] = useState(); // Server data in local state
const serverData = useStore((state) => state.data); // Duplicate

// Untyped API calls
const data = await fetch('/api/data').then((r) => r.json()); // any type
```

✅ **Do**:

```typescript
// Import constants from shared package
import { RECORD_ACTION_TYPES, type ActionType } from '@workspace/beqeek-shared';

// Use appropriate state management
const { data } = useQuery(['records'], fetchRecords); // Server state
const [isOpen, setIsOpen] = useState(false); // Local UI state

// Typed API calls
const data = await api.getRecords(): Promise<Record[]>;
```

## TypeScript Standards

### Configuration

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

### Type Definitions

**Component Props**:

```typescript
// ✅ Interface with JSDoc
interface ButtonProps {
  /** Button text content */
  label: string;
  /** Click handler */
  onClick: () => void;
  /** Optional variant style */
  variant?: 'primary' | 'secondary';
  /** Disabled state */
  disabled?: boolean;
}

export function Button({ label, onClick, variant = 'primary', disabled }: ButtonProps) {
  // Implementation
}
```

**Import Types**:

```typescript
// ✅ Import from shared package
import type { FieldType, ActionType, Permission } from '@workspace/beqeek-shared';

// ✅ Use type imports for types only
import type { ReactNode } from 'react';
import { useState } from 'react';
```

**Generic Types**:

```typescript
// ✅ Constrained generics
interface DataTableProps<T extends Record<string, unknown>> {
  data: T[];
  columns: ColumnDef<T>[];
  onRowClick: (row: T) => void;
}
```

**Type Guards**:

```typescript
// ✅ Proper type guards
function isTextFieldType(type: FieldType): type is TextFieldType {
  return TEXT_FIELD_TYPES.includes(type);
}

// Usage
if (isTextFieldType(field.type)) {
  // TypeScript knows field.type is TextFieldType here
}
```

### No Any Policy

❌ **Never**:

```typescript
const data: any = fetchData();
const params = route.params as any;
```

✅ **Always**:

```typescript
const data: ApiResponse = fetchData();
const params = route.useParams(); // Type-safe with getRouteApi
```

## React Patterns

### Component Structure

```typescript
// 1. Imports
import { useState, useEffect } from 'react';
import { Button } from '@workspace/ui/components/button';
import { useRecords } from '../hooks/use-records';
import type { TableConfig } from '@workspace/beqeek-shared';

// 2. Types
interface TableViewProps {
  tableId: string;
  config: TableConfig;
}

// 3. Component
export function TableView({ tableId, config }: TableViewProps) {
  // 3a. Hooks (top level only)
  const { records, loading } = useRecords(tableId);
  const [isOpen, setIsOpen] = useState(false);

  // 3b. Effects
  useEffect(() => {
    // Side effects
  }, []);

  // 3c. Handlers
  const handleCreate = () => {
    setIsOpen(true);
  };

  // 3d. Early returns
  if (loading) return <LoadingState />;

  // 3e. Render
  return (
    <div>
      <Button onClick={handleCreate}>Create</Button>
      {/* ... */}
    </div>
  );
}
```

### Hooks Best Practices

**Custom Hooks**:

```typescript
// ✅ Single responsibility
function useRecordPermissions(record: Record, user: User) {
  const canUpdate = useMemo(() => {
    return checkPermission('update', record, user);
  }, [record.id, user.id]);

  const canDelete = useMemo(() => {
    return checkPermission('delete', record, user);
  }, [record.id, user.id]);

  return { canUpdate, canDelete };
}

// ❌ Too many responsibilities
function useEverything() {
  // Handles records, permissions, encryption, UI state...
  // Split into focused hooks
}
```

**Dependency Arrays**:

```typescript
// ✅ Explicit dependencies
useEffect(() => {
  fetchData(tableId);
}, [tableId]);

// ❌ Missing dependencies (ESLint will warn)
useEffect(() => {
  fetchData(tableId);
}, []); // Missing tableId
```

### Event Handlers

```typescript
// ✅ Typed event handlers
const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
  event.preventDefault();
  // ...
};

const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  setValue(event.target.value);
};

// ✅ Generic handlers
const handleFieldChange = (fieldName: string, value: unknown) => {
  updateRecord({ [fieldName]: value });
};
```

### Conditional Rendering

```typescript
// ✅ Early returns for loading/error states
if (loading) return <LoadingState />;
if (error) return <ErrorState error={error} />;
if (!data) return <EmptyState />;

// ✅ Ternary for simple conditions
{isOpen ? <Modal /> : null}

// ✅ Logical AND for existence checks
{data && <DataDisplay data={data} />}

// ❌ Nested ternaries (hard to read)
{isOpen ? (isLoading ? <Spinner /> : <Content />) : null}

// ✅ Extract to variable or component
const content = isLoading ? <Spinner /> : <Content />;
{isOpen && content}
```

## State Management

### Philosophy

| State Type | Tool        | Usage                                      |
| ---------- | ----------- | ------------------------------------------ |
| **Local**  | useState    | UI state, form inputs, modals, toggles     |
| **Server** | React Query | API data, caching, mutations, invalidation |
| **Global** | Zustand     | User preferences, auth, theme, sidebar     |

### React Query Patterns

```typescript
// ✅ Query with proper keys
const { data, isLoading, error } = useQuery({
  queryKey: ['records', tableId, filters],
  queryFn: () => fetchRecords(tableId, filters),
  staleTime: 5 * 60 * 1000, // 5 minutes
});

// ✅ Mutation with optimistic updates
const mutation = useMutation({
  mutationFn: updateRecord,
  onMutate: async (newRecord) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: ['records'] });

    // Snapshot previous value
    const previous = queryClient.getQueryData(['records']);

    // Optimistically update
    queryClient.setQueryData(['records'], (old) => old.map((r) => (r.id === newRecord.id ? newRecord : r)));

    return { previous };
  },
  onError: (err, newRecord, context) => {
    // Rollback on error
    queryClient.setQueryData(['records'], context.previous);
  },
  onSettled: () => {
    // Refetch after success or error
    queryClient.invalidateQueries({ queryKey: ['records'] });
  },
});
```

### Zustand Patterns

```typescript
// ✅ Slice-based store
interface AuthSlice {
  user: User | null;
  token: string | null;
  setUser: (user: User) => void;
  logout: () => void;
}

const useAuthStore = create<AuthSlice>((set) => ({
  user: null,
  token: null,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null, token: null }),
}));

// ✅ Selector usage (prevents re-renders)
const user = useAuthStore((state) => state.user);
const logout = useAuthStore((state) => state.logout);

// ❌ Don't subscribe to entire store
const authState = useAuthStore(); // Re-renders on any change
```

### Local State Patterns

```typescript
// ✅ Simple UI state
const [isOpen, setIsOpen] = useState(false);
const [inputValue, setInputValue] = useState('');

// ✅ Object state (with proper typing)
interface FormState {
  name: string;
  email: string;
  status: 'idle' | 'submitting' | 'success' | 'error';
}

const [form, setForm] = useState<FormState>({
  name: '',
  email: '',
  status: 'idle',
});

// Update specific field
setForm((prev) => ({ ...prev, name: 'New Name' }));
```

## Styling Guidelines

### TailwindCSS Standards

**Design Tokens (MANDATORY)**:

```typescript
// ✅ Use design tokens
<input className="border border-input bg-background text-foreground" />

// ❌ Never hardcode colors
<input className="border border-gray-300 bg-gray-100 text-gray-900" />
```

**Standard Input Classes**:

```typescript
const inputClasses = cn(
  // Base
  'border border-input rounded-md',
  'bg-background text-foreground',
  'transition-all',

  // Focus
  'focus-visible:outline-none',
  'focus-visible:ring-1',
  'focus-visible:ring-inset',
  'focus-visible:ring-ring',

  // States
  'placeholder:text-muted-foreground',
  'disabled:cursor-not-allowed',
  'disabled:opacity-50',
  'aria-invalid:border-destructive',

  // Custom classes
  className,
);
```

**Responsive Design**:

```typescript
// ✅ Mobile-first
<div className="
  w-full              // Mobile
  md:w-1/2            // Tablet
  lg:w-1/3            // Desktop
  xl:w-1/4            // Large desktop
">
```

**Component Composition**:

```typescript
import { cn } from '@workspace/ui/lib/utils';

// ✅ Composable with cn utility
<Button className={cn(
  'base-classes',
  variant === 'primary' && 'variant-classes',
  disabled && 'disabled-classes',
  className
)} />
```

### CSS Variables (Design Tokens)

```css
/* Available in globals.css */
--background
--foreground
--card
--card-foreground
--primary
--primary-foreground
--secondary
--muted
--muted-foreground
--destructive
--border
--input
--ring
```

## File Organization

### Feature Structure

```
features/
└── active-tables/
    ├── components/        # Feature-specific components
    │   ├── table-list.tsx
    │   ├── table-form.tsx
    │   └── field-editor.tsx
    ├── hooks/            # Feature-specific hooks
    │   ├── use-table.ts
    │   └── use-fields.ts
    ├── stores/           # Feature-specific Zustand stores
    │   └── table-store.ts
    ├── pages/            # Page components
    │   ├── table-list-page.tsx
    │   └── table-detail-page.tsx
    ├── api.ts            # API client for this feature
    └── types.ts          # Feature-specific types
```

### Import Order

```typescript
// 1. External dependencies
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

// 2. Workspace packages
import { Button } from '@workspace/ui/components/button';
import { FIELD_TYPE_SHORT_TEXT } from '@workspace/beqeek-shared';

// 3. Absolute imports from src
import { useAuthStore } from '@/stores/auth-store';
import { api } from '@/shared/api/http-client';

// 4. Relative imports
import { TableList } from './components/table-list';
import { useTable } from './hooks/use-table';
import type { TableConfig } from './types';
```

## Naming Conventions

### Files

- **Components**: `kebab-case.tsx` (e.g., `table-list.tsx`)
- **Hooks**: `use-kebab-case.ts` (e.g., `use-table.ts`)
- **Utilities**: `kebab-case.ts` (e.g., `format-date.ts`)
- **Types**: `types.ts` or `feature-name.types.ts`
- **Constants**: `constants.ts` or `SCREAMING_SNAKE_CASE.ts`

### Components

```typescript
// ✅ PascalCase
export function TableList() {}
export function RecordDetailView() {}

// ❌ camelCase
export function tableList() {}
```

### Hooks

```typescript
// ✅ Prefix with 'use', camelCase
export function useTable() {}
export function useRecordPermissions() {}

// ❌ Missing 'use' prefix
export function table() {}
```

### Variables & Functions

```typescript
// ✅ camelCase
const tableId = '123';
const isLoading = false;
function fetchRecords() {}

// ❌ PascalCase for variables
const TableId = '123';
```

### Constants

```typescript
// ✅ SCREAMING_SNAKE_CASE
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const API_TIMEOUT = 30000;

// ✅ Import from shared package
import { FIELD_TYPE_SHORT_TEXT, ACTION_TYPE_CREATE } from '@workspace/beqeek-shared';
```

### Types & Interfaces

```typescript
// ✅ PascalCase, descriptive
interface TableConfig {}
type FieldType = string;
type RecordPermission = 'read' | 'write';

// ✅ Prefix with 'I' for interfaces (optional)
interface ITableConfig {}
```

## API Integration

### Client Setup

```typescript
// shared/api/http-client.ts
import axios from 'axios';
import { handleApiError } from './api-error';

export const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 30000,
});

// Request interceptor
httpClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor
httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    handleApiError(error);
    return Promise.reject(error);
  },
);
```

### Feature API Client

```typescript
// features/active-tables/api.ts
import { httpClient } from '@/shared/api/http-client';
import type { Table, CreateTableInput } from './types';

export const tablesApi = {
  getAll: async (workspaceId: string): Promise<Table[]> => {
    const { data } = await httpClient.post(`/api/workspace/${workspaceId}/workflow/search/active_tables`);
    return data.data;
  },

  getById: async (workspaceId: string, tableId: string): Promise<Table> => {
    const { data } = await httpClient.post(`/api/workspace/${workspaceId}/workflow/get/active_tables`, {
      table_id: tableId,
    });
    return data.data;
  },

  create: async (workspaceId: string, input: CreateTableInput): Promise<Table> => {
    const { data } = await httpClient.post(`/api/workspace/${workspaceId}/workflow/create/active_tables`, input);
    return data.data;
  },
};
```

### React Query Integration

```typescript
// features/active-tables/hooks/use-tables.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tablesApi } from '../api';

export function useTables(workspaceId: string) {
  return useQuery({
    queryKey: ['tables', workspaceId],
    queryFn: () => tablesApi.getAll(workspaceId),
  });
}

export function useCreateTable(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTableInput) => tablesApi.create(workspaceId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables', workspaceId] });
    },
  });
}
```

## Testing Requirements

### Unit Tests

```typescript
// Component test
import { render, screen } from '@testing-library/react';
import { Button } from './button';

describe('Button', () => {
  it('renders label', () => {
    render(<Button label="Click me" onClick={() => {}} />);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    render(<Button label="Click" onClick={onClick} />);
    screen.getByText('Click').click();
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
```

### Hook Tests

```typescript
import { renderHook } from '@testing-library/react';
import { useCounter } from './use-counter';

describe('useCounter', () => {
  it('increments count', () => {
    const { result } = renderHook(() => useCounter());
    act(() => result.current.increment());
    expect(result.current.count).toBe(1);
  });
});
```

## Code Review Checklist

### Before Submitting PR

- [ ] TypeScript: No `any`, all types defined
- [ ] Imports: Proper import order, no unused imports
- [ ] State: Appropriate state management (local/server/global)
- [ ] Styling: Design tokens used, no hardcoded colors
- [ ] Naming: Conventions followed (PascalCase, camelCase, etc.)
- [ ] Constants: Imported from `@workspace/beqeek-shared`
- [ ] API: Typed responses, error handling
- [ ] Performance: Memoization where needed, no unnecessary re-renders
- [ ] Accessibility: ARIA labels, keyboard navigation
- [ ] i18n: All strings translated
- [ ] Tests: Unit tests for utilities, integration tests for features
- [ ] Lint: `pnpm lint` passes
- [ ] Build: `pnpm build` succeeds
- [ ] Types: `pnpm check-types` passes

### Reviewer Checklist

- [ ] Code follows established patterns
- [ ] No security vulnerabilities (XSS, injection, etc.)
- [ ] Error handling comprehensive
- [ ] Performance implications considered
- [ ] Mobile responsive
- [ ] Browser compatibility
- [ ] Documentation updated
- [ ] Breaking changes documented

## Common Pitfalls

### 1. Hardcoding Values

❌ Don't: `const statuses = ['active', 'inactive'];`
✅ Do: `import { STATUS_OPTIONS } from '@workspace/beqeek-shared';`

### 2. Wrong State Management

❌ Don't: Store API data in useState
✅ Do: Use React Query for server state

### 3. Missing Type Safety

❌ Don't: `const params = route.params as any;`
✅ Do: `const params = route.useParams();` (with getRouteApi)

### 4. Hardcoded Colors

❌ Don't: `className="text-gray-500 border-blue-300"`
✅ Do: `className="text-muted-foreground border-input"`

### 5. Component Coupling

❌ Don't: Direct API calls in components
✅ Do: Use hooks for API logic

### 6. Missing Error Handling

❌ Don't: `const data = await api.fetch();` (uncaught errors)
✅ Do: React Query handles errors automatically

## References

- **TypeScript**: https://www.typescriptlang.org/docs/handbook/
- **React**: https://react.dev/learn
- **TanStack Query**: https://tanstack.com/query/latest/docs/react/overview
- **Zustand**: https://zustand-demo.pmnd.rs/
- **TailwindCSS**: https://tailwindcss.com/docs
- **shadcn/ui**: https://ui.shadcn.com/docs
