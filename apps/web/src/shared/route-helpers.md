# Route Helpers Pattern Guide

**IMPORTANT**: This is the official pattern for accessing route parameters in TanStack Router v1.133+.

## Why `getRouteApi()` + Route Constants?

This pattern provides:
- ✅ **Type Safety**: Full TypeScript inference from route definitions
- ✅ **Single Source of Truth**: Centralized route paths in `route-paths.ts`
- ✅ **Zero Maintenance**: Change routes without updating components
- ✅ **Typo Prevention**: Auto-completion for all route paths
- ✅ **Refactoring Safe**: Compiler catches invalid route references
- ✅ **Better DX**: Auto-completion, compile-time errors
- ✅ **Code Splitting Compatible**: Works perfectly with lazy-loaded components

## Anti-Pattern (DO NOT USE)

```tsx
// ❌ BAD: Hardcoded route path + unsafe type assertions
import { useParams } from '@tanstack/react-router';

const params = useParams({ from: '/$locale/workspaces/$workspaceId/tables/$tableId' });
const tableId = (params as any).tableId as string; // Type safety lost!
const workspaceId = (params as any).workspaceId as string;
```

**Problems:**
- Hardcoded route paths throughout codebase
- When routes change → must update all components
- Type assertions with `as any` lose type safety
- No auto-completion or compile-time checks

## Recommended Pattern (USE THIS)

```tsx
// ✅ GOOD: Type-safe constants + getRouteApi()
import { getRouteApi } from '@tanstack/react-router';
import { ROUTES } from '@/shared/route-paths';

const route = getRouteApi(ROUTES.ACTIVE_TABLES.TABLE_DETAIL);

export function MyComponent() {
  const { tableId, workspaceId, locale } = route.useParams();
  // ^ Fully typed! Auto-completion works! No type assertions needed!

  const navigate = route.useNavigate();
  const search = route.useSearch(); // Type-safe search params

  // Navigate using constants - typo-safe!
  const goToRecords = () => {
    navigate({
      to: ROUTES.ACTIVE_TABLES.TABLE_RECORDS,
      params: { locale, workspaceId, tableId },
    });
  };

  return <div>Table: {tableId}</div>;
}
```

## Common Route Patterns

### 1. Workspace-Level Routes

```tsx
// For: /$locale/workspaces/$workspaceId/tables
import { getRouteApi } from '@tanstack/react-router';
import { ROUTES } from '@/shared/route-paths';

const route = getRouteApi(ROUTES.ACTIVE_TABLES.LIST);

export function ActiveTablesPage() {
  const { workspaceId, locale } = route.useParams();
  const navigate = route.useNavigate();

  // Navigate to child route using constants
  navigate({
    to: ROUTES.ACTIVE_TABLES.TABLE_DETAIL,
    params: { locale, workspaceId, tableId: 'some-id' },
  });
}
```

### 2. Table-Level Routes

```tsx
// For: /$locale/workspaces/$workspaceId/tables/$tableId
import { getRouteApi } from '@tanstack/react-router';
import { ROUTES } from '@/shared/route-paths';

const route = getRouteApi(ROUTES.ACTIVE_TABLES.TABLE_DETAIL);

export function ActiveTableDetailPage() {
  const { tableId, workspaceId, locale } = route.useParams();
  const navigate = route.useNavigate();

  // Access all parent params automatically!
  console.log({ tableId, workspaceId, locale });
}
```

### 3. Nested Routes (Records, Settings)

```tsx
// For: /$locale/workspaces/$workspaceId/tables/$tableId/records
import { getRouteApi } from '@tanstack/react-router';
import { ROUTES } from '@/shared/route-paths';

const route = getRouteApi(ROUTES.ACTIVE_TABLES.TABLE_RECORDS);

export function RecordsPage() {
  const { tableId, workspaceId, locale } = route.useParams();
  // All parent params are inherited and typed!
}
```

```tsx
// For: /$locale/workspaces/$workspaceId/tables/$tableId/settings
import { getRouteApi } from '@tanstack/react-router';
import { ROUTES } from '@/shared/route-paths';

const route = getRouteApi(ROUTES.ACTIVE_TABLES.TABLE_SETTINGS);

export function SettingsPage() {
  const { tableId, workspaceId, locale } = route.useParams();
}
```

### 4. Navigation Between Routes

```tsx
import { getRouteApi } from '@tanstack/react-router';
import { ROUTES } from '@/shared/route-paths';

const route = getRouteApi(ROUTES.ACTIVE_TABLES.TABLE_DETAIL);

export function MyComponent() {
  const { tableId, workspaceId, locale } = route.useParams();
  const navigate = route.useNavigate();

  const goToRecords = () => {
    navigate({
      to: ROUTES.ACTIVE_TABLES.TABLE_RECORDS,
      params: { locale, workspaceId, tableId },
    });
  };

  const goBack = () => {
    navigate({
      to: ROUTES.ACTIVE_TABLES.LIST,
      params: { locale, workspaceId },
    });
  };
}
```

## Working with Search Params

```tsx
import { getRouteApi } from '@tanstack/react-router';
import { ROUTES } from '@/shared/route-paths';

const route = getRouteApi(ROUTES.ACTIVE_TABLES.LIST);

export function TablesPage() {
  const params = route.useParams();
  const search = route.useSearch(); // Type-safe search params
  const navigate = route.useNavigate();

  const updateFilters = (filter: string) => {
    navigate({
      search: { filter }, // Type-checked!
    });
  };
}
```

## Migration Checklist

When migrating from old pattern to `getRouteApi()`:

1. ✅ Add import: `import { getRouteApi } from '@tanstack/react-router';`
2. ✅ Create route instance: `const route = getRouteApi('/$locale/...');`
3. ✅ Replace `useParams({ from: '...' })` with `route.useParams()`
4. ✅ Remove all type assertions (`as any`, `as string`)
5. ✅ Replace `useNavigate()` with `route.useNavigate()` if needed
6. ✅ Update all navigation calls to use typed params
7. ✅ Test component to ensure params work correctly

## Benefits Summary

| Feature | Old Pattern | New Pattern (`getRouteApi`) |
|---------|-------------|----------------------------|
| Type Safety | ❌ Lost with `as any` | ✅ Full inference |
| Maintenance | ❌ High (update all files) | ✅ Zero (routes are SSoT) |
| Refactoring | ❌ Error-prone | ✅ Compile-time safe |
| Auto-completion | ❌ None | ✅ Full IDE support |
| Code Splitting | ⚠️ Works but unsafe | ✅ Fully compatible |
| Developer Experience | ❌ Manual typing | ✅ Automatic |

## Resources

- TanStack Router Docs: https://tanstack.com/router/latest/docs/framework/react/guide/route-api
- Route File Conventions: `src/routes/README.md`
- Example Implementations: See migrated components in `src/features/active-tables/pages/`
