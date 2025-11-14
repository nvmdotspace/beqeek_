# Phase 3: Routing - File-Based Routes and Navigation

**Date**: 2025-11-14
**Completed**: 2025-11-15
**Priority**: P0 (Critical)
**Status**: ✅ Completed
**Estimate**: 0.5 day
**Actual**: < 15 minutes

## Context

- [Phase 2: Core Hooks](phase-02-core-hooks.md)
- [Route Paths Constants](/Users/macos/Workspace/buildinpublic/beqeek/apps/web/src/shared/route-paths.ts)
- [TanStack Router File-Based Routing](https://tanstack.com/router/latest/docs/framework/react/guide/file-based-routing)
- [Existing Routes](/Users/macos/Workspace/buildinpublic/beqeek/apps/web/src/routes)

## Overview

Setup file-based routes for workflow forms feature matching legacy URL structure. Create route constants, implement auth guards, configure lazy-loaded page components.

## Key Insights

- Routes auto-generated from `src/routes/**/*.tsx` file structure
- Use `createFileRoute()` from `@tanstack/react-router`
- Auth guards in `beforeLoad` hook using `getIsAuthenticated()`
- Lazy loading with `React.lazy()` + Suspense
- Route params accessed via `getRouteApi()` with constants from `route-paths.ts`
- Legacy pattern: `/workspace/{workspaceId}/workflow-forms[/select|/{formId}]`
- Modern pattern: `/$locale/workspaces/$workspaceId/workflow-forms[/select|/{formId}]`

## Requirements

### Routes to Create

1. **List View** - `/$locale/workspaces/$workspaceId/workflow-forms/index.tsx`
   - Lists all workflow forms
   - "Create Form" button → navigate to select view

2. **Template Selection** - `/$locale/workspaces/$workspaceId/workflow-forms/select.tsx`
   - Shows form type templates (BASIC, SUBSCRIPTION, SURVEY)
   - Search/filter templates
   - Select template → open create dialog

3. **Form Builder Detail** - `/$locale/workspaces/$workspaceId/workflow-forms/$formId.tsx`
   - Form configuration editor
   - Field management
   - Live preview

### Navigation Helpers

- Add routes to `route-paths.ts` ROUTES.WORKFLOW_FORMS object
- Helper functions for type-safe navigation

## Architecture

### Route Constants (`route-paths.ts`)

```typescript
export const ROUTES = {
  // ... existing routes

  /**
   * Workflow Forms feature routes
   */
  WORKFLOW_FORMS: {
    /** Forms list: /$locale/workspaces/$workspaceId/workflow-forms */
    LIST: '/$locale/workspaces/$workspaceId/workflow-forms' as const,

    /** Template selection: /$locale/workspaces/$workspaceId/workflow-forms/select */
    SELECT: '/$locale/workspaces/$workspaceId/workflow-forms/select' as const,

    /** Form builder detail: /$locale/workspaces/$workspaceId/workflow-forms/$formId */
    DETAIL: '/$locale/workspaces/$workspaceId/workflow-forms/$formId' as const,
  },
} as const;

// Update ROUTE_GROUPS.AUTHENTICATED
export const ROUTE_GROUPS = {
  AUTHENTICATED: [
    // ... existing
    ...Object.values(ROUTES.WORKFLOW_FORMS),
  ],
} as const;
```

### List Route (`routes/$locale/workspaces/$workspaceId/workflow-forms/index.tsx`)

```tsx
import { createFileRoute } from '@tanstack/react-router';
import { lazy, Suspense } from 'react';
import { getIsAuthenticated } from '@/features/auth';

const WorkflowFormsListLazy = lazy(() =>
  import('@/features/workflow-forms/pages/workflow-forms-list').then((m) => ({
    default: m.WorkflowFormsList,
  })),
);

export const Route = createFileRoute('/$locale/workspaces/$workspaceId/workflow-forms/')({
  component: WorkflowFormsListPage,
  beforeLoad: async ({ params, location }) => {
    const isAuthenticated = await getIsAuthenticated();
    if (!isAuthenticated) {
      throw redirect({
        to: '/$locale/login',
        params: { locale: params.locale },
        search: { redirect: location.href },
      });
    }
  },
});

function WorkflowFormsListPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <WorkflowFormsListLazy />
    </Suspense>
  );
}
```

### Select Route (`routes/$locale/workspaces/$workspaceId/workflow-forms/select.tsx`)

```tsx
import { createFileRoute } from '@tanstack/react-router';
import { lazy, Suspense } from 'react';
import { getIsAuthenticated } from '@/features/auth';

const WorkflowFormsSelectLazy = lazy(() =>
  import('@/features/workflow-forms/pages/workflow-forms-select').then((m) => ({
    default: m.WorkflowFormsSelect,
  })),
);

export const Route = createFileRoute('/$locale/workspaces/$workspaceId/workflow-forms/select')({
  component: WorkflowFormsSelectPage,
  beforeLoad: async ({ params, location }) => {
    const isAuthenticated = await getIsAuthenticated();
    if (!isAuthenticated) {
      throw redirect({
        to: '/$locale/login',
        params: { locale: params.locale },
        search: { redirect: location.href },
      });
    }
  },
});

function WorkflowFormsSelectPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <WorkflowFormsSelectLazy />
    </Suspense>
  );
}
```

### Detail Route (`routes/$locale/workspaces/$workspaceId/workflow-forms/$formId.tsx`)

```tsx
import { createFileRoute } from '@tanstack/react-router';
import { lazy, Suspense } from 'react';
import { getIsAuthenticated } from '@/features/auth';

const WorkflowFormDetailLazy = lazy(() =>
  import('@/features/workflow-forms/pages/workflow-form-detail').then((m) => ({
    default: m.WorkflowFormDetail,
  })),
);

export const Route = createFileRoute('/$locale/workspaces/$workspaceId/workflow-forms/$formId')({
  component: WorkflowFormDetailPage,
  beforeLoad: async ({ params, location }) => {
    const isAuthenticated = await getIsAuthenticated();
    if (!isAuthenticated) {
      throw redirect({
        to: '/$locale/login',
        params: { locale: params.locale },
        search: { redirect: location.href },
      });
    }
  },
});

function WorkflowFormDetailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <WorkflowFormDetailLazy />
    </Suspense>
  );
}
```

### Navigation Helpers (`features/workflow-forms/utils/navigation.ts`)

```typescript
import { getRouteApi } from '@tanstack/react-router';
import { ROUTES } from '@/shared/route-paths';

export const workflowFormsListRoute = getRouteApi(ROUTES.WORKFLOW_FORMS.LIST);
export const workflowFormsSelectRoute = getRouteApi(ROUTES.WORKFLOW_FORMS.SELECT);
export const workflowFormDetailRoute = getRouteApi(ROUTES.WORKFLOW_FORMS.DETAIL);

// Usage in components:
// const navigate = workflowFormDetailRoute.useNavigate();
// navigate({ to: ROUTES.WORKFLOW_FORMS.DETAIL, params: { locale, workspaceId, formId } });
```

## Implementation Steps

1. Add WORKFLOW_FORMS routes to `route-paths.ts`
2. Create route directory: `routes/$locale/workspaces/$workspaceId/workflow-forms/`
3. Create list route: `index.tsx`
4. Create select route: `select.tsx`
5. Create detail route: `$formId.tsx`
6. Add auth guards to all routes
7. Create placeholder page components (empty shells)
8. Create navigation helper utilities
9. Test route generation (check `routeTree.gen.ts`)
10. Verify auth redirects work

## Todo

- [ ] Update `route-paths.ts` with WORKFLOW_FORMS routes
- [ ] Create route directory structure
- [ ] Create `index.tsx` (list route)
- [ ] Create `select.tsx` (template selection route)
- [ ] Create `$formId.tsx` (detail route)
- [ ] Add auth guards to all routes
- [ ] Create placeholder page components
- [ ] Create `utils/navigation.ts` helpers
- [ ] Test route generation
- [ ] Verify auth redirects

## Success Criteria

- ✅ All routes registered in `route-paths.ts`
- ✅ Routes auto-generated in `routeTree.gen.ts`
- ✅ Auth guards redirect to login for unauthenticated users
- ✅ Lazy loading configured for all pages
- ✅ Navigation helpers use type-safe constants
- ✅ No TypeScript errors
- ✅ Routes accessible in browser (with placeholder content)

## Risk Assessment

**Very Low Risk** - File-based routing is well-established. Copying existing patterns.

Risks:

- Route generation fails → Check TanStack Router plugin in vite.config.ts
- Typos in route paths → Use constants, verify generated tree

## Security Considerations

- Auth guards prevent unauthenticated access
- Workspace ID validated by API (no client-side checks needed)
- Redirect to login preserves original URL for post-login navigation

## Next Steps

After Phase 3 completion:

- Phase 4: List and template selection views (UI implementation)
