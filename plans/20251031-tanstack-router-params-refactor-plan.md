# TanStack Router Type-Safe Parameters Refactor Plan

## Executive Summary

This plan addresses the maintenance issues caused by hardcoded route paths in `useParams` hooks throughout the codebase. The current approach using `useParams({ from: '/specific/route/path' })` with type assertions creates brittle code that breaks when routes change. We will implement TanStack Router v1.133+ best practices for type-safe parameter extraction.

## Problem Analysis

### Current Issues

1. **Hardcoded Route Paths**: Every `useParams` call includes the full route path as a string
2. **Type Assertions**: Using `(params as any).tableId` loses TypeScript's type safety
3. **Maintenance Burden**: When routes change, all related `useParams` calls must be manually updated
4. **No Type Inference**: Parameters aren't automatically typed based on the route definition

### Current Anti-Pattern Example
```typescript
// Current problematic pattern in active-table-detail-page.tsx
const params = useParams({ from: '/$locale/workspaces/$workspaceId/tables/$tableId' });
const tableId = (params as any).tableId as string;
const workspaceId = (params as any).workspaceId as string;
```

## Research Findings

### TanStack Router Best Practices (v1.133+)

1. **Route.useParams()**: Each route exports a type-safe `useParams` hook
2. **getRouteApi()**: For code-split components, provides access to route APIs without importing the route
3. **Automatic Type Inference**: Parameters are automatically typed based on route definition
4. **No Hardcoded Paths**: Routes know their own path, eliminating string dependencies

## Recommended Solution

### Approach 1: Direct Route API Usage (Recommended)

For components that are directly associated with a specific route:

```typescript
// In route file: src/routes/$locale/workspaces/$workspaceId/tables/$tableId/index.tsx
export const Route = createFileRoute('/$locale/workspaces/$workspaceId/tables/$tableId/')({
  component: TableDetailComponent,
});

// In component file: Can access Route.useParams() directly
function TableDetailComponent() {
  const { tableId, workspaceId, locale } = Route.useParams(); // Fully typed!
  // No type assertions needed, all params are properly typed
}
```

### Approach 2: getRouteApi for Code-Split Components (Most Flexible)

For lazy-loaded components that need to remain in separate files:

```typescript
// In component file: active-table-detail-page.tsx
import { getRouteApi } from '@tanstack/react-router';

// Create a typed route API reference
const route = getRouteApi('/$locale/workspaces/$workspaceId/tables/$tableId');

export const ActiveTableDetailPage = () => {
  // Type-safe params without importing the route file
  const { tableId, workspaceId, locale } = route.useParams();

  // Also available:
  const search = route.useSearch();
  const loaderData = route.useLoaderData();
  const navigate = route.useNavigate();

  // Rest of component...
};
```

### Approach 3: Route Context Pattern (For Shared Logic)

For components that need to work across multiple similar routes:

```typescript
// Create a context hook for workspace routes
function useWorkspaceParams() {
  // Use strict: false for components used across multiple routes
  const params = useParams({ strict: false });

  // TypeScript will infer a union of all possible params
  return {
    workspaceId: params.workspaceId as string | undefined,
    tableId: params.tableId as string | undefined,
    locale: params.locale as string | undefined,
  };
}
```

## Implementation Strategy

### Phase 1: Update Route Files to Export Components Directly

Instead of lazy-loading in route files, move the component logic into the route file or use `getRouteApi`:

```typescript
// Option A: Component in route file (simple cases)
export const Route = createFileRoute('/$locale/workspaces/$workspaceId/tables')({
  component: TablesComponent,
});

function TablesComponent() {
  const { workspaceId, locale } = Route.useParams();
  return <ActiveTablesPage workspaceId={workspaceId} locale={locale} />;
}

// Option B: Use getRouteApi in the lazy-loaded component
// (shown in Approach 2 above)
```

### Phase 2: Refactor Components to Use Route APIs

Update each component to use the appropriate pattern:

1. **Direct route components**: Use `Route.useParams()`
2. **Lazy-loaded feature pages**: Use `getRouteApi(routePath).useParams()`
3. **Shared components**: Use `useParams({ strict: false })` or accept params as props

### Phase 3: Remove Type Assertions

Once proper route APIs are in place, remove all `as any` type assertions.

## Migration Checklist

### Files to Update

Based on the current codebase analysis:

- [ ] `/features/active-tables/pages/active-tables-page.tsx`
  - Current: `useParams({ from: '/$locale/workspaces/$workspaceId/tables' })`
  - Update to: `getRouteApi('/$locale/workspaces/$workspaceId/tables').useParams()`

- [ ] `/features/active-tables/pages/active-table-detail-page.tsx`
  - Current: `useParams({ from: '/$locale/workspaces/$workspaceId/tables/$tableId' })`
  - Update to: `getRouteApi('/$locale/workspaces/$workspaceId/tables/$tableId').useParams()`

- [ ] `/features/active-tables/pages/active-table-records-page.tsx`
  - Current: `useParams({ from: '/$locale/workspaces/$workspaceId/tables/$tableId/records' })`
  - Update to: `getRouteApi('/$locale/workspaces/$workspaceId/tables/$tableId/records').useParams()`

- [ ] `/features/active-tables/pages/active-table-settings-page.tsx`
  - Current: `useParams({ from: '/$locale/workspaces/$workspaceId/tables/$tableId/settings' })`
  - Update to: `getRouteApi('/$locale/workspaces/$workspaceId/tables/$tableId/settings').useParams()`

## Code Examples

### Before (Current Anti-Pattern)
```typescript
import { useParams } from '@tanstack/react-router';

export const ActiveTableDetailPage = () => {
  const params = useParams({ from: '/$locale/workspaces/$workspaceId/tables/$tableId' });
  const tableId = (params as any).tableId as string;
  const workspaceId = (params as any).workspaceId as string;
  // ...
};
```

### After (Best Practice)
```typescript
import { getRouteApi } from '@tanstack/react-router';

const route = getRouteApi('/$locale/workspaces/$workspaceId/tables/$tableId');

export const ActiveTableDetailPage = () => {
  const { tableId, workspaceId, locale } = route.useParams(); // Fully typed!
  // ...
};
```

## Benefits

1. **Type Safety**: Full TypeScript inference for all route parameters
2. **Maintainability**: Routes are the single source of truth for their parameters
3. **Developer Experience**: Auto-completion and compile-time error checking
4. **Refactoring Safety**: Changing route paths automatically updates TypeScript types
5. **Performance**: No runtime overhead from type assertions
6. **Code Clarity**: Cleaner, more readable code without type casting

## Risks and Mitigation

### Risk 1: Breaking Changes During Migration
- **Mitigation**: Update components one at a time, test thoroughly
- **Rollback Plan**: Git commits for each component update

### Risk 2: Learning Curve
- **Mitigation**: Start with simple components first
- **Documentation**: This plan serves as internal documentation

### Risk 3: Bundle Size Impact
- **Mitigation**: Already using `autoCodeSplitting: true` in Vite config
- **Monitoring**: Check bundle sizes before/after migration

## Testing Strategy

1. **Type Checking**: Run `pnpm check-types` after each update
2. **Runtime Testing**: Verify parameter extraction works correctly
3. **Route Navigation**: Test that all routes still navigate properly
4. **Edge Cases**: Test with missing optional parameters

## Success Metrics

- ✅ Zero type assertions (`as any`) for route parameters
- ✅ All route parameters fully typed without manual type definitions
- ✅ Routes can be refactored without updating component code
- ✅ TypeScript compilation succeeds without errors
- ✅ Developer experience improved with auto-completion

## Timeline

- **Phase 1**: Update route structure (1 hour)
- **Phase 2**: Refactor components (2 hours)
- **Phase 3**: Testing and cleanup (1 hour)
- **Total Estimate**: 4 hours

## TODO Checklist

- [ ] Backup current implementation
- [ ] Update active-tables-page.tsx to use getRouteApi
- [ ] Update active-table-detail-page.tsx to use getRouteApi
- [ ] Update active-table-records-page.tsx to use getRouteApi
- [ ] Update active-table-settings-page.tsx to use getRouteApi
- [ ] Remove all type assertions for params
- [ ] Run type checking to verify no TypeScript errors
- [ ] Test all affected routes in the browser
- [ ] Update any other components using the old pattern
- [ ] Document the new pattern for team reference
- [ ] Create PR with changes

## References

- [TanStack Router Type Safety Guide](https://tanstack.com/router/v1/docs/framework/react/guide/type-safety)
- [TanStack Router Code Splitting Guide](https://tanstack.com/router/latest/docs/framework/react/guide/code-splitting)
- [useParams Hook Documentation](https://tanstack.com/router/v1/docs/framework/react/api/router/useParamsHook)
- [getRouteApi Documentation](https://tanstack.com/router/latest/docs/framework/react/api/router/getRouteApi)

## Conclusion

By adopting TanStack Router's built-in type-safe parameter extraction patterns, we eliminate maintenance burden, improve type safety, and enhance developer experience. The `getRouteApi` approach provides the perfect balance between code organization (keeping components in feature folders) and type safety (full parameter inference).