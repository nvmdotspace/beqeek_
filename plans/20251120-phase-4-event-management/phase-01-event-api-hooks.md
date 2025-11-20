# Phase 1: Event API Integration

**Date**: 2025-11-20
**Priority**: P0 (Foundation layer)
**Status**: Planning
**Estimated Effort**: 4-6 hours

## Context

**Related Files**:

- Research: `/plans/yaml-workflow-research/yaml-workflow-conversion-research.md`
- Existing API client: `apps/web/src/shared/api/workflow-client.ts`
- Existing hooks pattern: `apps/web/src/features/workflows/hooks/use-workflows.ts`
- HTTP client: `apps/web/src/shared/api/http-client.ts`

**Existing Patterns**:

- POST-based RPC: `/api/workspace/{workspaceId}/workflow/{verb}/workflow_events`
- React Query for server state
- Optimistic updates with onMutate
- Error handling via `api-error.ts`

## Key Insights from Research

1. **API Pattern**: Follows existing workflow CRUD (create_event, update_event, delete_event, etc.)
2. **YAML Storage**: Server stores `trigger_config_yaml` and `steps_yaml` as TEXT columns
3. **Caching Strategy**: Use React Query with workspace-scoped cache keys
4. **Type Safety**: Full TypeScript types for API payloads and responses

## Requirements

### Functional

- Create new event (name, trigger config, steps)
- Read single event by ID
- Read all events for unit
- Update existing event (name, config, steps, active status)
- Delete event with confirmation
- Toggle event active status

### Non-Functional

- API calls under 500ms (typical)
- Optimistic UI updates for mutations
- Proper cache invalidation
- Type-safe payloads (Zod validation)
- Error messages in Vietnamese + English

## Architecture

### Data Flow

```
Component → Hook → API Client → HTTP Client → Backend
              ↓         ↓
         React Query  Cache
```

### API Endpoints (RPC Pattern)

```typescript
POST /api/workspace/{workspaceId}/workflow/create/workflow_events
POST /api/workspace/{workspaceId}/workflow/read/workflow_events/{eventId}
POST /api/workspace/{workspaceId}/workflow/read_all/workflow_events?unit_id={unitId}
POST /api/workspace/{workspaceId}/workflow/update/workflow_events/{eventId}
POST /api/workspace/{workspaceId}/workflow/delete/workflow_events/{eventId}
POST /api/workspace/{workspaceId}/workflow/update/workflow_events/{eventId}/toggle_active
```

### Data Types

```typescript
interface WorkflowEvent {
  id: string;
  workspace_id: string;
  unit_id: string;
  name: string;
  description?: string;
  trigger_type: 'schedule' | 'webhook' | 'form' | 'table';
  trigger_config_yaml: string; // YAML string
  steps_yaml: string; // YAML string
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
  last_modified_by: string;
}

interface CreateEventPayload {
  unit_id: string;
  name: string;
  description?: string;
  trigger_type: string;
  trigger_config_yaml: string;
  steps_yaml: string;
  is_active?: boolean;
}

interface UpdateEventPayload {
  name?: string;
  description?: string;
  trigger_config_yaml?: string;
  steps_yaml?: string;
  is_active?: boolean;
}
```

## Related Code Files

**Follow Patterns From**:

1. `apps/web/src/shared/api/workflow-client.ts` - API client structure
2. `apps/web/src/features/workflows/hooks/use-workflows.ts` - React Query hooks
3. `apps/web/src/features/workflows/types.ts` - Type definitions
4. `apps/web/src/shared/query-client.ts` - Query client config

## Implementation Steps

### 1. Install Dependencies

```bash
pnpm add js-yaml
pnpm add -D @types/js-yaml
```

### 2. Create Type Definitions

**File**: `apps/web/src/features/workflows/types.ts`

- Add `WorkflowEvent` interface
- Add `CreateEventPayload`, `UpdateEventPayload` types
- Add `TriggerType` enum

### 3. Extend API Client

**File**: `apps/web/src/shared/api/workflow-client.ts`

- Add `createEvent()` method
- Add `getEvent()` method
- Add `getEventsByUnit()` method
- Add `updateEvent()` method
- Add `deleteEvent()` method
- Add `toggleEventActive()` method

### 4. Create Query Key Helpers

**File**: `apps/web/src/features/workflows/hooks/query-keys.ts`

```typescript
export const eventKeys = {
  all: (workspaceId: string) => ['workspaces', workspaceId, 'events'] as const,
  unit: (workspaceId: string, unitId: string) => [...eventKeys.all(workspaceId), 'unit', unitId] as const,
  detail: (workspaceId: string, eventId: string) => [...eventKeys.all(workspaceId), eventId] as const,
};
```

### 5. Create React Query Hooks

**File**: `apps/web/src/features/workflows/hooks/use-events.ts`

**Hook 1: useEvents (List)**

```typescript
export function useEvents(workspaceId: string, unitId: string) {
  return useQuery({
    queryKey: eventKeys.unit(workspaceId, unitId),
    queryFn: () => workflowClient.getEventsByUnit(workspaceId, unitId),
    staleTime: 30_000, // 30 seconds
  });
}
```

**Hook 2: useEvent (Single)**

```typescript
export function useEvent(workspaceId: string, eventId: string) {
  return useQuery({
    queryKey: eventKeys.detail(workspaceId, eventId),
    queryFn: () => workflowClient.getEvent(workspaceId, eventId),
    enabled: !!eventId,
  });
}
```

**Hook 3: useCreateEvent**

```typescript
export function useCreateEvent(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateEventPayload) => workflowClient.createEvent(workspaceId, payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: eventKeys.unit(workspaceId, variables.unit_id),
      });
    },
  });
}
```

**Hook 4: useUpdateEvent**

```typescript
export function useUpdateEvent(workspaceId: string, eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateEventPayload) => workflowClient.updateEvent(workspaceId, eventId, payload),
    onMutate: async (payload) => {
      // Optimistic update
      await queryClient.cancelQueries({
        queryKey: eventKeys.detail(workspaceId, eventId),
      });

      const previous = queryClient.getQueryData(eventKeys.detail(workspaceId, eventId));

      queryClient.setQueryData(eventKeys.detail(workspaceId, eventId), (old: WorkflowEvent) => ({
        ...old,
        ...payload,
      }));

      return { previous };
    },
    onError: (err, payload, context) => {
      // Rollback on error
      queryClient.setQueryData(eventKeys.detail(workspaceId, eventId), context?.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: eventKeys.detail(workspaceId, eventId),
      });
    },
  });
}
```

**Hook 5: useDeleteEvent**

```typescript
export function useDeleteEvent(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (eventId: string) => workflowClient.deleteEvent(workspaceId, eventId),
    onSuccess: (_, eventId) => {
      queryClient.invalidateQueries({
        queryKey: eventKeys.all(workspaceId),
      });
      queryClient.removeQueries({
        queryKey: eventKeys.detail(workspaceId, eventId),
      });
    },
  });
}
```

### 6. Add Error Handling

**File**: `apps/web/src/shared/api/api-error.ts`

- Add event-specific error codes
- Add Vietnamese + English error messages

### 7. Write Unit Tests

**File**: `apps/web/src/features/workflows/hooks/use-events.test.ts`

- Test query hooks with mock data
- Test mutation hooks with optimistic updates
- Test cache invalidation
- Test error handling

## Todo List

- [ ] Install js-yaml + types
- [ ] Add WorkflowEvent types to types.ts
- [ ] Extend workflow-client.ts with 6 event methods
- [ ] Create query-keys.ts with eventKeys helpers
- [ ] Create use-events.ts with 5 hooks
- [ ] Add event error codes to api-error.ts
- [ ] Write unit tests for all hooks
- [ ] Test API integration with Postman/curl
- [ ] Verify cache invalidation works
- [ ] Document usage in feature README

## Success Criteria

✅ **API Client**:

- All 6 methods typed and functional
- Proper error handling
- Request/response logging (dev mode)

✅ **React Query Hooks**:

- useEvents returns list for unit
- useEvent returns single event
- useCreateEvent creates + invalidates cache
- useUpdateEvent has optimistic updates
- useDeleteEvent removes from cache

✅ **Type Safety**:

- Zero TypeScript errors
- Full intellisense support
- Payload validation with Zod

✅ **Performance**:

- List query cached 30s
- Optimistic updates feel instant
- No unnecessary refetches

✅ **Testing**:

- 80%+ test coverage
- All hooks tested with MSW
- Error cases covered

## Risk Assessment

**High Risk**: None
**Medium Risk**: None
**Low Risk**: API endpoint mismatch with backend
→ Mitigation: Verify with swagger.yaml, coordinate with backend team

## Security Considerations

1. **Authorization**: All endpoints require workspace membership
2. **Input Validation**: Validate payloads before API calls (Zod)
3. **YAML Injection**: Sanitize YAML strings (handled in Phase 2)
4. **Rate Limiting**: Backend enforces limits (not client concern)

## Next Steps

1. Complete Phase 1 implementation (this file)
2. Move to Phase 2: YAML Conversion (enables testing with real events)
3. Test API integration end-to-end
4. Document hook usage for UI components
