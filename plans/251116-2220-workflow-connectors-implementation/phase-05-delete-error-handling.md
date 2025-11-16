# Phase 05: Delete Operations & Error Handling

**Duration**: 4-6 hours
**Dependencies**: Phase 04 complete
**Risk Level**: Low

## Context

Add delete operations with confirmation, comprehensive error handling for all mutations, and proper error boundaries. Implement toast notifications, loading states, and rollback on optimistic update failures.

## Implementation Steps

### Step 1: Delete Confirmation Dialog (1h)

Alert dialog from shadcn/ui with cancel/confirm, integrates with useDeleteConnector mutation.

### Step 2: Error Boundaries (1.5h)

Wrap views in ErrorBoundary, fallback UI, retry mechanism.

### Step 3: Mutation Error Handling (1.5h)

Add try/catch to all mutations, toast on error, log to console.

### Step 4: Network Error Handling (1h)

Offline detection, retry logic, fallback to cached data.

## Todo List

- [ ] Create DeleteConfirmationDialog component
- [ ] Add ErrorBoundary to routes
- [ ] Add error handling to all mutations
- [ ] Test offline scenarios
- [ ] Test API error responses (400, 401, 403, 500)
- [ ] Add retry button to error fallbacks

## Success Criteria

- [ ] Delete requires confirmation
- [ ] Errors show user-friendly messages
- [ ] Network errors handled gracefully
- [ ] Error boundaries catch React errors
- [ ] Can retry failed operations

## Next Steps

**Phase 06**: Testing and refinement
