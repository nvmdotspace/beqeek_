# Phase 2: Workflow Units CRUD

**Date**: 2025-11-19 22:45
**Duration**: Week 2 (5 days)
**Priority**: High
**Dependencies**: Phase 1 complete
**Status**: ⚪ Not Started

---

## Context

- **Parent Plan**: [plan.md](./plan.md)
- **Previous Phase**: [Phase 1: Foundation Setup](./phase-01-foundation-setup.md)
- **Next Phase**: [Phase 3: React Flow Integration](./phase-03-react-flow-integration.md)
- **Related Docs**:
  - API spec: `/docs/swagger.yaml`
  - Design system: `/docs/design-system.md`
  - Active Tables CRUD pattern: `/apps/web/src/features/active-tables/`

---

## Overview

Implement full CRUD operations for Workflow Units with React Query hooks, list/detail pages, create/edit/delete dialogs. Establishes data layer before visual workflow builder.

**Implementation Status**: Not Started
**Review Status**: Pending

---

## Key Insights

**React Query Patterns**:

- Query keys: `['workflow-units', workspaceId]` for list, `['workflow-units', workspaceId, unitId]` for detail
- Optimistic updates for mutations
- Invalidate related queries after mutations
- Error boundaries for query failures

**TanStack Router Auth Guards**:

- Use `beforeLoad` hook for authentication check
- Redirect to login if not authenticated
- Extract workspaceId from route params
- Validate workspace access

**Design System Best Practices**:

- Use layout primitives (Container, Stack, Grid, GridItem)
- Typography components (Heading, Text)
- Button size variants (sm, default, lg)
- Design tokens for colors (no hardcoded values)

---

## Requirements

### Functional Requirements

1. **List Page**:
   - Display all workflow units in current workspace
   - Create new unit button
   - Search/filter units by name
   - Edit unit (inline or dialog)
   - Delete unit with confirmation
   - Empty state when no units exist
   - Loading skeleton during fetch

2. **Detail Page**:
   - Display unit name + description
   - Edit unit name/description inline
   - Events list (left sidebar) - Phase 5 implementation
   - Breadcrumb navigation (Workspace > Workflow Units > Unit Name)
   - Delete unit button

3. **Create Dialog**:
   - Name field (required)
   - Description field (optional)
   - Validation: Name 1-100 chars
   - Cancel/Save buttons
   - Success toast after creation
   - Navigate to detail page on success

4. **Delete Confirmation**:
   - Confirm dialog with unit name
   - Warning about deleting associated events
   - Cancel/Delete buttons
   - Success toast after deletion
   - Navigate to list page on success

### Technical Requirements

1. **React Query Hooks**:
   - `useWorkflowUnits(workspaceId)` - List query
   - `useWorkflowUnit(workspaceId, unitId)` - Detail query
   - `useCreateWorkflowUnit()` - Create mutation
   - `useUpdateWorkflowUnit()` - Update mutation
   - `useDeleteWorkflowUnit()` - Delete mutation

2. **Error Handling**:
   - API error messages in toast notifications
   - Retry logic for failed requests (max 3)
   - Error boundaries for unexpected errors

3. **Performance**:
   - Lazy load page components
   - Debounce search input (300ms)
   - Optimistic UI updates for mutations

### Design Requirements

1. **Responsive Grid**: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`
2. **Card Spacing**: `gap-4` (16px between cards)
3. **Page Padding**: `p-6` (24px)
4. **Button Heights**: Use size prop (sm/default/lg)
5. **Section Spacing**: `space-600` (48px between major sections)

---

## Architecture

### Data Flow

```
User Action
    ↓
React Query Hook → API Client → HTTP Client → Server
    ↓                              ↓
Cache Update                 Error Handler
    ↓                              ↓
UI Re-render                 Toast Notification
```

### Component Hierarchy

```
WorkflowUnitsListPage
├── Container
│   ├── Stack (page layout)
│   │   ├── Inline (header: title + create button)
│   │   ├── Input (search field)
│   │   └── Grid (unit cards)
│   │       └── WorkflowUnitCard (map over units)
│   │           ├── CardHeader (name)
│   │           ├── CardContent (description)
│   │           └── CardFooter (edit/delete buttons)
│   └── CreateWorkflowUnitDialog
│       └── Form (react-hook-form + zod)

WorkflowUnitDetailPage
├── Container
│   ├── Breadcrumb
│   ├── Inline (header: title + delete button)
│   ├── Text (description)
│   └── Text (events placeholder - Phase 5)
```

---

## Related Code Files

**Reference files**:

- `/apps/web/src/features/active-tables/hooks/use-active-tables.ts`
- `/apps/web/src/features/active-tables/pages/active-tables-list.tsx`
- `/apps/web/src/features/active-tables/components/create-table-dialog.tsx`

**Files to create**:

1. `/apps/web/src/features/workflow-units/hooks/use-workflow-units.ts`
2. `/apps/web/src/features/workflow-units/hooks/use-workflow-unit.ts`
3. `/apps/web/src/features/workflow-units/hooks/use-create-workflow-unit.ts`
4. `/apps/web/src/features/workflow-units/hooks/use-update-workflow-unit.ts`
5. `/apps/web/src/features/workflow-units/hooks/use-delete-workflow-unit.ts`
6. `/apps/web/src/features/workflow-units/components/workflow-unit-card.tsx`
7. `/apps/web/src/features/workflow-units/components/dialogs/create-workflow-unit-dialog.tsx`
8. `/apps/web/src/features/workflow-units/components/dialogs/edit-workflow-unit-dialog.tsx`
9. `/apps/web/src/features/workflow-units/components/dialogs/delete-confirm-dialog.tsx`

**Files to update**:

- `/apps/web/src/features/workflow-units/pages/workflow-units-list.tsx`
- `/apps/web/src/features/workflow-units/pages/workflow-unit-detail.tsx`

---

## Implementation Steps

### Step 1: Create React Query Hooks (2 hours)

**useWorkflowUnits.ts**:

```typescript
import { useQuery } from '@tanstack/react-query';
import { workflowUnitsApi } from '../api/workflow-units-api';

export const useWorkflowUnits = (workspaceId: string) => {
  return useQuery({
    queryKey: ['workflow-units', workspaceId],
    queryFn: () => workflowUnitsApi.getWorkflowUnits(workspaceId),
    enabled: !!workspaceId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
```

**useCreateWorkflowUnit.ts**:

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { workflowUnitsApi } from '../api/workflow-units-api';

export const useCreateWorkflowUnit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ workspaceId, data }: { workspaceId: string; data: any }) =>
      workflowUnitsApi.createWorkflowUnit(workspaceId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['workflow-units', variables.workspaceId],
      });
      toast.success('Workflow unit created successfully');
    },
    onError: (error) => {
      toast.error(`Failed to create unit: ${error.message}`);
    },
  });
};
```

**Similar patterns for update/delete hooks**

### Step 2: Create Unit Card Component (1 hour)

```typescript
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { Inline } from '@workspace/ui/components/primitives';
import { Edit, Trash } from 'lucide-react';
import type { WorkflowUnit } from '../api/types';

interface WorkflowUnitCardProps {
  unit: WorkflowUnit;
  onEdit: (unit: WorkflowUnit) => void;
  onDelete: (unit: WorkflowUnit) => void;
}

export function WorkflowUnitCard({ unit, onEdit, onDelete }: WorkflowUnitCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{unit.name}</CardTitle>
        {unit.description && <CardDescription>{unit.description}</CardDescription>}
      </CardHeader>
      <CardFooter>
        <Inline space="space-150" justify="end" className="w-full">
          <Button variant="ghost" size="sm" onClick={() => onEdit(unit)}>
            <Edit className="size-4 mr-2" />
            Edit
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onDelete(unit)}>
            <Trash className="size-4 mr-2" />
            Delete
          </Button>
        </Inline>
      </CardFooter>
    </Card>
  );
}
```

### Step 3: Create Dialog Components (3 hours)

**CreateWorkflowUnitDialog**:

- Use react-hook-form + zod for validation
- Schema: `z.object({ name: z.string().min(1).max(100), description: z.string().optional() })`
- Form fields with Label + Input components
- DialogFooter with Cancel + Save buttons
- Call useCreateWorkflowUnit hook on submit

**EditWorkflowUnitDialog**: Similar to create, but pre-fill with existing data

**DeleteConfirmDialog**:

- Display unit name
- Warning message about cascade deletion
- Cancel + Delete buttons (destructive variant)

### Step 4: Implement List Page (2 hours)

```typescript
import { useState } from 'react';
import { Container, Stack, Grid, GridItem, Inline } from '@workspace/ui/components/primitives';
import { Heading } from '@workspace/ui/components/typography';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Plus } from 'lucide-react';
import { useWorkflowUnits } from '../hooks/use-workflow-units';
import { WorkflowUnitCard } from '../components/workflow-unit-card';
import { CreateWorkflowUnitDialog } from '../components/dialogs/create-workflow-unit-dialog';

export default function WorkflowUnitsListPage() {
  const { workspaceId } = useParams(); // From TanStack Router
  const { data: units, isLoading } = useWorkflowUnits(workspaceId);
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);

  const filteredUnits = units?.filter((unit) =>
    unit.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Container maxWidth="xl" padding="margin">
      <Stack space="space-400">
        <Inline justify="between" align="center">
          <Heading level={1}>Workflow Units</Heading>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="size-4 mr-2" />
            Create Unit
          </Button>
        </Inline>

        <Input
          placeholder="Search units..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {isLoading ? (
          <div>Loading...</div>
        ) : filteredUnits?.length === 0 ? (
          <div>No units found</div>
        ) : (
          <Grid columns={12} gap="space-300">
            {filteredUnits?.map((unit) => (
              <GridItem key={unit.id} span={12} spanMd={6} spanLg={4} spanXl={3}>
                <WorkflowUnitCard unit={unit} onEdit={handleEdit} onDelete={handleDelete} />
              </GridItem>
            ))}
          </Grid>
        )}
      </Stack>

      <CreateWorkflowUnitDialog open={createOpen} onOpenChange={setCreateOpen} />
    </Container>
  );
}
```

### Step 5: Implement Detail Page (1.5 hours)

```typescript
import { Container, Stack, Inline } from '@workspace/ui/components/primitives';
import { Heading, Text } from '@workspace/ui/components/typography';
import { Button } from '@workspace/ui/components/button';
import { Trash } from 'lucide-react';
import { useWorkflowUnit } from '../hooks/use-workflow-unit';
import { Breadcrumb } from '@/components/breadcrumb';

export default function WorkflowUnitDetailPage() {
  const { workspaceId, unitId } = useParams();
  const { data: unit, isLoading } = useWorkflowUnit(workspaceId, unitId);

  if (isLoading) return <div>Loading...</div>;
  if (!unit) return <div>Unit not found</div>;

  return (
    <Container maxWidth="xl" padding="margin">
      <Stack space="space-400">
        <Breadcrumb items={[
          { label: 'Workspace', href: '...' },
          { label: 'Workflow Units', href: '...' },
          { label: unit.name }
        ]} />

        <Inline justify="between" align="center">
          <Heading level={1}>{unit.name}</Heading>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash className="size-4 mr-2" />
            Delete Unit
          </Button>
        </Inline>

        {unit.description && <Text>{unit.description}</Text>}

        <div>
          <Text color="muted">Events list - Phase 5</Text>
        </div>
      </Stack>
    </Container>
  );
}
```

### Step 6: Add Route Guards (1 hour)

Update route files with `beforeLoad` authentication:

```typescript
import { getRouteApi, redirect } from '@tanstack/react-router';
import { getIsAuthenticated } from '@/features/auth';

export const Route = createFileRoute('/$locale/workspaces/$workspaceId/workflow-units/')({
  beforeLoad: async ({ params }) => {
    const isAuthenticated = await getIsAuthenticated();
    if (!isAuthenticated) {
      throw redirect({ to: '/login' });
    }
    // Validate workspace access if needed
  },
  component: WorkflowUnitsListRoute,
});
```

### Step 7: Integration Tests (2 hours)

```typescript
// use-workflow-units.test.ts
describe('useWorkflowUnits', () => {
  it('fetches units successfully', async () => {
    // Mock API response
    // Render hook with QueryClient
    // Assert data returned
  });

  it('handles errors gracefully', async () => {
    // Mock API error
    // Render hook
    // Assert error state
  });
});
```

### Step 8: Manual Testing (1 hour)

1. Test create workflow unit
2. Test search/filter
3. Test edit unit
4. Test delete unit with confirmation
5. Test navigation to detail page
6. Test responsive layout (mobile, tablet, desktop)
7. Test error states (network failure, validation errors)

---

## Todo List

- [ ] Create useWorkflowUnits hook
- [ ] Create useWorkflowUnit hook
- [ ] Create useCreateWorkflowUnit hook
- [ ] Create useUpdateWorkflowUnit hook
- [ ] Create useDeleteWorkflowUnit hook
- [ ] Create WorkflowUnitCard component
- [ ] Create CreateWorkflowUnitDialog
- [ ] Create EditWorkflowUnitDialog
- [ ] Create DeleteConfirmDialog
- [ ] Implement list page (search, create, grid)
- [ ] Implement detail page (breadcrumb, header, delete)
- [ ] Add route guards (beforeLoad)
- [ ] Write integration tests
- [ ] Manual testing checklist
- [ ] Verify design system compliance

---

## Success Criteria

**Testable**:

- ✅ Can create workflow unit via dialog
- ✅ Can update unit name/description
- ✅ Can delete unit with confirmation
- ✅ List page displays units in grid
- ✅ Search filters units correctly
- ✅ Detail page shows unit info
- ✅ Navigation breadcrumb works
- ✅ All mutations show toast notifications
- ✅ Error handling displays user-friendly messages

**Measurable**:

- 5 React Query hooks created
- 4 dialog components implemented
- 2 pages fully functional
- Test coverage > 70% for hooks
- 0 TypeScript errors
- 0 hardcoded colors

---

## Risk Assessment

| Risk                        | Impact | Probability | Mitigation                                 |
| --------------------------- | ------ | ----------- | ------------------------------------------ |
| API contract mismatch       | High   | Medium      | Verify with backend team, mock API first   |
| React Query cache issues    | Medium | Low         | Follow TanStack Query best practices       |
| Form validation edge cases  | Medium | Medium      | Comprehensive zod schemas, test edge cases |
| Responsive layout breaks    | Low    | Low         | Test on multiple screen sizes              |
| Performance with many units | Medium | Low         | Implement pagination in future phase       |

---

## Security Considerations

- **Auth Guards**: Verify workspace access in beforeLoad
- **Input Sanitization**: Zod schemas validate all inputs
- **CSRF Protection**: HTTP client includes CSRF tokens
- **XSS Prevention**: React auto-escapes text content

---

## Next Steps

**Dependencies**: Phase 3 needs detail page complete for event editor integration

**Blockers**: None (API endpoints must exist)

**Handoff**: Once CRUD works, Phase 3 can add event editor to detail page

---

**Phase 2 Completion**: When all CRUD operations work and tests pass
