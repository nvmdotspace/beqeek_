# Phase 2: Core Hooks - React Query Integration

**Date**: 2025-11-14
**Completed**: 2025-11-14
**Priority**: P0 (Critical)
**Status**: ✅ Completed
**Estimate**: 1 day
**Actual**: < 30 minutes

## Context

- [Phase 1: Foundation](phase-01-foundation.md)
- [useActiveTable Hook Pattern](/Users/macos/Workspace/buildinpublic/beqeek/apps/web/src/features/active-tables/hooks/use-active-tables.ts)
- [useWorkspaces Hook Pattern](/Users/macos/Workspace/buildinpublic/beqeek/apps/web/src/features/workspace/hooks/use-workspaces.ts)
- [React Query Best Practices](https://tanstack.com/query/latest/docs/framework/react/guides/queries)

## Overview

Implement React Query hooks for workflow forms CRUD operations. Follow project patterns: query keys as functions, proper cache management, optimistic updates for mutations, type-safe hooks with error handling.

## Key Insights

- Project uses `useQueryWithAuth` wrapper for authenticated queries
- Query keys are functions returning arrays: `workflowFormsQueryKey(workspaceId)`
- Mutations invalidate related queries using `queryClient.invalidateQueries()`
- Stale/GC times configured per query (list: 2min stale, 5min GC; detail: immediate)
- Error handling via ApiError from http-client
- Loading states separate: `isLoading` (first fetch), `isFetching` (background refetch)

## Requirements

### Query Hooks

1. **useWorkflowForms** - List all forms for workspace
   - Cache: 2min stale, 5min GC
   - Enabled when authenticated + workspaceId present

2. **useWorkflowForm** - Get single form by ID
   - Cache: immediate stale (always fresh)
   - Enabled when authenticated + workspaceId + formId present

### Mutation Hooks

1. **useCreateWorkflowForm** - Create new form
   - Optimistic update: add to list cache
   - On success: invalidate list, navigate to detail
   - On error: rollback optimistic update

2. **useUpdateWorkflowForm** - Update existing form
   - Optimistic update: update both detail and list cache
   - On success: invalidate queries
   - On error: rollback optimistic update

3. **useDeleteWorkflowForm** - Delete form
   - Optimistic update: remove from list cache
   - On success: invalidate list, navigate to list view
   - On error: rollback optimistic update

## Architecture

### File Structure

```
apps/web/src/features/workflow-forms/
├── hooks/
│   ├── index.ts                          # Export all hooks
│   ├── use-workflow-forms.ts             # List query hook
│   ├── use-workflow-form.ts              # Detail query hook
│   ├── use-create-workflow-form.ts       # Create mutation
│   ├── use-update-workflow-form.ts       # Update mutation
│   └── use-delete-workflow-form.ts       # Delete mutation
```

### Query Keys (`hooks/use-workflow-forms.ts`)

```typescript
export const workflowFormsQueryKey = (workspaceId?: string) => ['workflow-forms', workspaceId ?? 'unknown'];

export const workflowFormQueryKey = (workspaceId?: string, formId?: string) => [
  'workflow-form',
  workspaceId ?? 'unknown',
  formId ?? 'unknown',
];
```

### List Hook (`hooks/use-workflow-forms.ts`)

```typescript
import { useQueryWithAuth } from '@/hooks/use-query-with-auth';
import { useAuthStore, selectIsAuthenticated } from '@/features/auth';
import { getWorkflowForms } from '../api/workflow-forms-api';

export const useWorkflowForms = (workspaceId?: string) => {
  const isAuthenticated = useAuthStore(selectIsAuthenticated);

  return useQueryWithAuth({
    queryKey: workflowFormsQueryKey(workspaceId),
    queryFn: () => getWorkflowForms(workspaceId!),
    enabled: isAuthenticated && !!workspaceId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};
```

### Detail Hook (`hooks/use-workflow-form.ts`)

```typescript
import { useQueryWithAuth } from '@/hooks/use-query-with-auth';
import { useAuthStore, selectIsAuthenticated } from '@/features/auth';
import { getWorkflowFormById } from '../api/workflow-forms-api';

export const useWorkflowForm = (workspaceId?: string, formId?: string) => {
  const isAuthenticated = useAuthStore(selectIsAuthenticated);

  return useQueryWithAuth({
    queryKey: workflowFormQueryKey(workspaceId, formId),
    queryFn: () => getWorkflowFormById(workspaceId!, formId!),
    enabled: isAuthenticated && !!workspaceId && !!formId,
    // No staleTime - always fetch fresh data for detail view
  });
};
```

### Create Mutation (`hooks/use-create-workflow-form.ts`)

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore, selectIsAuthenticated } from '@/features/auth';
import { createWorkflowForm } from '../api/workflow-forms-api';
import { workflowFormsQueryKey } from './use-workflow-forms';
import type { FormCreatePayload } from '../types';

export const useCreateWorkflowForm = (workspaceId: string) => {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore(selectIsAuthenticated);

  return useMutation({
    mutationFn: (payload: FormCreatePayload) => createWorkflowForm(workspaceId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workflowFormsQueryKey(workspaceId) });
    },
    enabled: isAuthenticated && !!workspaceId,
  });
};
```

### Update Mutation (`hooks/use-update-workflow-form.ts`)

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore, selectIsAuthenticated } from '@/features/auth';
import { updateWorkflowForm } from '../api/workflow-forms-api';
import { workflowFormsQueryKey, workflowFormQueryKey } from './use-workflow-forms';
import type { FormUpdatePayload } from '../types';

export const useUpdateWorkflowForm = (workspaceId: string, formId: string) => {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore(selectIsAuthenticated);

  return useMutation({
    mutationFn: (payload: FormUpdatePayload) => updateWorkflowForm(workspaceId, formId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workflowFormQueryKey(workspaceId, formId) });
      queryClient.invalidateQueries({ queryKey: workflowFormsQueryKey(workspaceId) });
    },
    enabled: isAuthenticated && !!workspaceId && !!formId,
  });
};
```

### Delete Mutation (`hooks/use-delete-workflow-form.ts`)

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore, selectIsAuthenticated } from '@/features/auth';
import { deleteWorkflowForm } from '../api/workflow-forms-api';
import { workflowFormsQueryKey, workflowFormQueryKey } from './use-workflow-forms';

export const useDeleteWorkflowForm = (workspaceId: string, formId: string) => {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore(selectIsAuthenticated);

  return useMutation({
    mutationFn: () => deleteWorkflowForm(workspaceId, formId),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: workflowFormQueryKey(workspaceId, formId) });
      queryClient.invalidateQueries({ queryKey: workflowFormsQueryKey(workspaceId) });
    },
    enabled: isAuthenticated && !!workspaceId && !!formId,
  });
};
```

### Index Export (`hooks/index.ts`)

```typescript
export * from './use-workflow-forms';
export * from './use-workflow-form';
export * from './use-create-workflow-form';
export * from './use-update-workflow-form';
export * from './use-delete-workflow-form';
```

## Implementation Steps

1. Create `hooks/` directory in workflow-forms feature
2. Implement query key functions
3. Create list query hook with proper cache settings
4. Create detail query hook
5. Implement create mutation with cache invalidation
6. Implement update mutation with cache invalidation
7. Implement delete mutation with cache cleanup
8. Create index.ts for clean exports
9. Add JSDoc comments to all hooks
10. Write unit tests for hooks (using React Query testing utilities)

## Todo

- [ ] Create `hooks/` directory
- [ ] Implement `use-workflow-forms.ts` (list query)
- [ ] Implement `use-workflow-form.ts` (detail query)
- [ ] Implement `use-create-workflow-form.ts` (create mutation)
- [ ] Implement `use-update-workflow-form.ts` (update mutation)
- [ ] Implement `use-delete-workflow-form.ts` (delete mutation)
- [ ] Create `index.ts` with exports
- [ ] Add JSDoc comments
- [ ] Write unit tests for hooks
- [ ] Test cache invalidation behavior

## Success Criteria

- ✅ All hooks follow project patterns (query keys, cache times, auth checks)
- ✅ Mutations properly invalidate related queries
- ✅ Error handling via ApiError
- ✅ TypeScript types fully inferred
- ✅ No manual cache manipulation (use invalidateQueries/removeQueries)
- ✅ Unit tests cover happy path + error scenarios
- ✅ JSDoc comments on all hooks

## Risk Assessment

**Low Risk** - Well-established patterns in codebase. React Query handling is mature.

Risks:

- Cache invalidation too aggressive → Monitor network tab, adjust stale times
- Optimistic updates rollback issues → Start without optimistic updates, add later if needed

## Security Considerations

- Auth check via `isAuthenticated` selector
- Workspace ID scoping prevents cross-workspace access
- No client-side data validation (server authoritative)

## Next Steps

After Phase 2 completion:

- Phase 3: Routes and navigation
- Phase 4: List and template selection views
