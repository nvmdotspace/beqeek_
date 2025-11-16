# Phase 02: List & Select Views (Read-Only UI)

**Duration**: 6-8 hours
**Dependencies**: Phase 01 complete
**Risk Level**: Low

## Context

Build read-only UI for browsing and selecting connector types. List view shows existing connectors with category tabs. Select view displays connector type catalog with search. Focus on shadcn/ui components, loading states, and responsive design.

## Overview

Create 2 of 3 core views: List (all connectors with filtering) and Select (type catalog). No create/edit/delete yet—pure read operations with React Query. Implement Suspense boundaries, skeleton loaders, search debouncing, and category tabs.

## Key Insights

1. **Suspense > raptor-ripple**: Use React 19 Suspense for declarative loading states
2. **Search debouncing**: 300ms delay prevents excessive re-renders
3. **Category tabs**: Dynamic tab generation with counts (All, SMTP, Zalo, etc.)
4. **Mobile-first grid**: Responsive from 1-col (mobile) to 3-col (desktop)
5. **Empty states**: Dedicated UI when no connectors exist

## Requirements

### Functional Requirements

- [ ] List view displays all connectors with name + description
- [ ] Category tabs filter by connector type with counts
- [ ] Select view shows connector type cards with logos
- [ ] Real-time search in Select view (debounced)
- [ ] Navigate to Detail view on card click (read-only for now)
- [ ] "Create Connector" button navigates to Select view
- [ ] Loading skeletons during data fetch
- [ ] Empty state when no connectors match filter

### Non-Functional Requirements

- [ ] Mobile-responsive (1-col → 2-col → 3-col grid)
- [ ] WCAG 2.1 AA accessible (keyboard nav, ARIA)
- [ ] Design tokens only (no hardcoded colors)
- [ ] i18n support (Vietnamese, English)
- [ ] Dark mode compatible

## Architecture

### Route Files

```
apps/web/src/routes/$locale/workspaces/$workspaceId/workflow-connectors/
├── index.tsx         # List view (default)
└── select.tsx        # Select view
```

### Components

```
apps/web/src/features/workflow-connectors/components/
├── connector-card.tsx              # Select view grid item
├── connector-list-item.tsx         # List view row
├── connector-list-skeleton.tsx     # Loading placeholder
├── connector-card-skeleton.tsx     # Card loading state
├── category-tabs.tsx               # Filter tabs with counts
├── empty-state.tsx                 # No results message
└── search-input.tsx                # Debounced search field
```

### Pages

```
apps/web/src/features/workflow-connectors/pages/
├── connector-list-page.tsx
└── connector-select-page.tsx
```

## Implementation Steps

### Step 1: List View Route (1.5h)

**File**: `apps/web/src/routes/$locale/workspaces/$workspaceId/workflow-connectors/index.tsx`

```typescript
import { createFileRoute } from '@tanstack/react-router';
import { lazy, Suspense } from 'react';
import { ConnectorListSkeleton } from '@/features/workflow-connectors/components/connector-list-skeleton';

const ConnectorListPageLazy = lazy(() =>
  import('@/features/workflow-connectors/pages/connector-list-page').then(m => ({
    default: m.ConnectorListPage
  }))
);

export const Route = createFileRoute('/$locale/workspaces/$workspaceId/workflow-connectors/')({
  component: ConnectorListRoute
});

function ConnectorListRoute() {
  return (
    <Suspense fallback={<ConnectorListSkeleton />}>
      <ConnectorListPageLazy />
    </Suspense>
  );
}
```

### Step 2: Select View Route (1h)

**File**: `apps/web/src/routes/$locale/workspaces/$workspaceId/workflow-connectors/select.tsx`

Similar pattern to List view, lazy load ConnectorSelectPage.

### Step 3: List Page Component (2h)

**File**: `apps/web/src/features/workflow-connectors/pages/connector-list-page.tsx`

```typescript
import { getRouteApi } from '@tanstack/react-router';
import { ROUTES } from '@/shared/route-paths';
import { useConnectors } from '../api/connector-api';
import { ConnectorListItem } from '../components/connector-list-item';
import { CategoryTabs } from '../components/category-tabs';
import { EmptyState } from '../components/empty-state';
import { Button } from '@workspace/ui/components/button';
import { Heading } from '@workspace/ui/components/typography';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import * as m from '@/paraglide/messages';

const route = getRouteApi(ROUTES.WORKFLOW_CONNECTORS.LIST);

export function ConnectorListPage() {
  const { workspaceId, locale } = route.useParams();
  const navigate = route.useNavigate();
  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  const { data: connectors, isLoading } = useConnectors(workspaceId);

  const filteredConnectors =
    activeCategory === 'ALL'
      ? connectors
      : connectors?.filter(c => c.connectorType === activeCategory);

  const handleCreateClick = () => {
    navigate({
      to: ROUTES.WORKFLOW_CONNECTORS.SELECT,
      params: { locale, workspaceId }
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Heading level={1}>{m.workflowConnectors_title()}</Heading>
        <Button onClick={handleCreateClick}>
          <Plus className="mr-2 size-4" />
          {m.workflowConnectors_create()}
        </Button>
      </div>

      <CategoryTabs
        connectors={connectors || []}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      {filteredConnectors && filteredConnectors.length > 0 ? (
        <div className="space-y-2">
          {filteredConnectors.map(connector => (
            <ConnectorListItem
              key={connector.id}
              connector={connector}
              workspaceId={workspaceId}
              locale={locale}
            />
          ))}
        </div>
      ) : (
        <EmptyState message={m.workflowConnectors_noResults()} />
      )}
    </div>
  );
}
```

### Step 4: Select Page Component (2h)

Implement connector type grid with search, similar structure to List page.

### Step 5: Shared Components (2-3h)

**ConnectorCard**: Grid item with logo, name, description, onClick handler
**ConnectorListItem**: Row with name, description, type badge, navigate to detail
**CategoryTabs**: Dynamic tabs from CONNECTOR_TYPES with counts
**SearchInput**: Debounced input (use `useDebouncedValue` hook)
**Skeletons**: Shimmer loading placeholders

## Todo List

- [ ] Create route files (index.tsx, select.tsx)
- [ ] Implement ConnectorListPage
- [ ] Implement ConnectorSelectPage
- [ ] Create ConnectorCard component
- [ ] Create ConnectorListItem component
- [ ] Create CategoryTabs component
- [ ] Create SearchInput with debouncing
- [ ] Create ConnectorListSkeleton
- [ ] Create ConnectorCardSkeleton
- [ ] Create EmptyState component
- [ ] Add i18n messages (workflowConnectors.\*)
- [ ] Test responsive breakpoints (mobile, tablet, desktop)
- [ ] Test keyboard navigation (tab, enter)
- [ ] Verify design token usage (no hardcoded colors)

## Success Criteria

- [ ] List view renders connectors from API
- [ ] Category tabs filter correctly with accurate counts
- [ ] Select view displays all 5 connector types
- [ ] Search filters connector types in real-time
- [ ] Loading skeletons appear during fetch
- [ ] Empty state shows when no results
- [ ] Mobile-responsive (grid adapts to screen size)
- [ ] Keyboard accessible (can tab through, activate with Enter)
- [ ] Dark mode works (design tokens used)

## Security Considerations

- Workspace ID validated in route params
- No sensitive data displayed (config fields hidden)

## Next Steps

**Phase 03**: Add create/edit dialogs and dynamic forms
