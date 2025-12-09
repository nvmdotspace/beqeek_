# Routing (TanStack Router)

TanStack Router v1.133+ with **FILE-BASED routing**

## Key Concepts

- **Route Files**: `src/routes/**/*.tsx` - File structure defines URL structure
- **Generated Tree**: `src/routeTree.gen.ts` - Auto-generated (DO NOT EDIT, in `.gitignore`)
- **Plugin**: `@tanstack/router-plugin/vite` in `vite.config.ts` generates routes on save
- **Locale patterns**: `/` (vi default) and `/$locale` prefix for other languages
- **Auth guards**: `beforeLoad` hook using `getIsAuthenticated()` from `src/features/auth`
- **Lazy loading**: Automatic code-splitting with `autoCodeSplitting: true`

## Route Structure

```
src/routes/
├── __root.tsx                              # Root layout with RootLayout component
├── index.tsx                               # / - Redirect to locale
├── $.tsx                                   # 404 catch-all route
├── $locale.tsx                             # Layout for /$locale routes
├── $locale/
│   ├── index.tsx                           # /$locale - Redirect based on auth
│   ├── login.tsx                           # /$locale/login
│   ├── workspaces.tsx                      # /$locale/workspaces
│   ├── workspaces/
│   │   └── $workspaceId/
│   │       ├── tables.tsx                  # Tables list
│   │       ├── tables/
│   │       │   └── $tableId/
│   │       │       ├── index.tsx           # Table detail
│   │       │       ├── records.tsx         # Records page
│   │       │       └── settings.tsx        # Settings page
```

## Creating New Routes

1. Create file in `src/routes/` following naming convention
2. Use `createFileRoute()` from `@tanstack/react-router`
3. Export `Route` constant with component and options
4. Plugin auto-generates `routeTree.gen.ts` on save
5. Use `useRouter()` hook to access router instance (NOT a global import)

## Example Route File

```tsx
import { createFileRoute } from '@tanstack/react-router';
import { lazy, Suspense } from 'react';

const MyPageLazy = lazy(() => import('@/features/my-feature/pages/my-page'));

export const Route = createFileRoute('/$locale/my-route')({
  component: MyComponent,
  beforeLoad: ({ params }) => {
    // Auth guards, redirects, etc.
  },
});

function MyComponent() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MyPageLazy />
    </Suspense>
  );
}
```

## Accessing Route Params (REQUIRED PATTERN)

Use `getRouteApi()` with centralized route constants for type-safe param extraction:

```tsx
// ✅ CORRECT: Type-safe constants + getRouteApi()
import { getRouteApi } from '@tanstack/react-router';
import { ROUTES } from '@/shared/route-paths';

const route = getRouteApi(ROUTES.ACTIVE_TABLES.TABLE_DETAIL);

export function MyPage() {
  const { tableId, workspaceId, locale } = route.useParams();
  const navigate = route.useNavigate();

  // Navigate using constants - prevents typos!
  navigate({
    to: ROUTES.ACTIVE_TABLES.TABLE_RECORDS,
    params: { locale, workspaceId, tableId },
  });
}
```

```tsx
// ❌ WRONG: Hardcoded paths + type assertions
import { useParams } from '@tanstack/react-router';

const route = getRouteApi('/$locale/workspaces/$workspaceId/tables/$tableId'); // Typo-prone!
const params = useParams({ from: '...' });
const tableId = (params as any).tableId as string; // Loses type safety!
```

## Route Constants

Located in [route-paths.ts](../../apps/web/src/shared/route-paths.ts):

```tsx
ROUTES.ACTIVE_TABLES.LIST          // /$locale/workspaces/$workspaceId/tables
ROUTES.ACTIVE_TABLES.TABLE_DETAIL  // /$locale/workspaces/$workspaceId/tables/$tableId
ROUTES.ACTIVE_TABLES.TABLE_RECORDS // /$locale/workspaces/$workspaceId/tables/$tableId/records
ROUTES.ACTIVE_TABLES.TABLE_SETTINGS// /$locale/workspaces/$workspaceId/tables/$tableId/settings
ROUTES.WORKSPACE.*                 // Workspace feature routes
ROUTES.LOGIN, ROUTES.WORKSPACES    // Auth routes
```

## Route Naming Conventions

- `$` for params (e.g., `$tableId`)
- `_` prefix for pathless layouts
- `$.tsx` for catch-all/404
