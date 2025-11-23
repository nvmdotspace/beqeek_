# Phase 5: Event Management

**Date**: 2025-11-19 22:45
**Duration**: Week 6 (5 days)
**Priority**: High
**Dependencies**: Phase 4 complete
**Status**: ⚪ Not Started

---

## Context

Implement Workflow Events CRUD with trigger configuration forms. Events belong to Units and define when/how workflows execute (SCHEDULE, WEBHOOK, OPTIN_FORM, ACTIVE_TABLE).

---

## Requirements

### Functional Requirements

**Event List (Left Sidebar in Unit Detail)**:

- Display all events for current unit
- Create new event button
- Event status toggle (active/inactive)
- Click event to edit in canvas
- Delete event with confirmation

**Trigger Configuration**:

1. **SCHEDULE**: Cron expression input with helper
2. **WEBHOOK**: Display auto-generated webhook URL
3. **OPTIN_FORM**: Form dropdown + optional action selector
4. **ACTIVE_TABLE**: Table dropdown + action dropdown

**Event Editor Integration**:

- Load event YAML into canvas on selection
- Auto-save YAML on node changes (debounced 2s)
- Manual save button
- Test workflow button (Phase 8)

---

## Implementation Steps

### Step 1: Event API Hooks (2 hours)

```typescript
// hooks/use-workflow-events.ts
export const useWorkflowEvents = (workspaceId: string, unitId: string) => {
  return useQuery({
    queryKey: ['workflow-events', workspaceId, unitId],
    queryFn: () => workflowEventsApi.getWorkflowEvents(workspaceId, unitId),
  });
};

// hooks/use-create-workflow-event.ts
export const useCreateWorkflowEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ workspaceId, data }) => workflowEventsApi.createWorkflowEvent(workspaceId, data),
    onSuccess: (_, { workspaceId, data }) => {
      queryClient.invalidateQueries(['workflow-events', workspaceId, data.workflowUnit]);
      toast.success('Event created');
    },
  });
};
```

### Step 2: Event List Component (2 hours)

```typescript
// components/workflow-event-list.tsx
import { Stack, Box, Inline } from '@workspace/ui/components/primitives';
import { Button } from '@workspace/ui/components/button';
import { Switch } from '@workspace/ui/components/switch';
import { Plus } from 'lucide-react';

export const WorkflowEventList = ({ unitId }: { unitId: string }) => {
  const { data: events } = useWorkflowEvents(workspaceId, unitId);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <Box padding="space-300" className="h-full overflow-y-auto">
      <Stack space="space-300">
        <Button onClick={() => setCreateOpen(true)} size="sm">
          <Plus className="size-4 mr-2" />
          New Event
        </Button>

        <Stack space="space-150">
          {events?.map((event) => (
            <Box
              key={event.id}
              padding="space-200"
              backgroundColor={selectedId === event.id ? 'accent' : 'card'}
              borderRadius="md"
              className="cursor-pointer"
              onClick={() => setSelectedId(event.id)}
            >
              <Stack space="space-100">
                <Text size="small" weight="semibold">{event.eventName}</Text>
                <Inline space="space-100" align="center">
                  <Switch checked={event.eventActive} onCheckedChange={handleToggle} />
                  <Text size="small" color="muted">{event.eventSourceType}</Text>
                </Inline>
              </Stack>
            </Box>
          ))}
        </Stack>
      </Stack>
    </Box>
  );
};
```

### Step 3: Trigger Config Forms (4 hours)

**Schedule Form**:

```typescript
const ScheduleTriggerForm = ({ value, onChange }) => {
  return (
    <Stack space="space-200">
      <Label>Cron Expression</Label>
      <Input value={value.expression} onChange={(e) => onChange({ expression: e.target.value })} />
      <Text size="small" color="muted">Example: */5 * * * * (every 5 minutes)</Text>
    </Stack>
  );
};
```

**Webhook Form**: Display `webhookUrl` (read-only)

**OptIn Form**: Dropdown from `/get/workflow_forms`

**Active Table Form**: Dropdowns from `/get/active_tables` and actions

### Step 4: Create Event Dialog (3 hours)

### Step 5: Integration with Canvas (2 hours)

---

## Todo List

- [ ] Create event API hooks (5 hooks)
- [ ] Create WorkflowEventList component
- [ ] Create trigger config forms (4 types)
- [ ] Create CreateEventDialog
- [ ] Create DeleteEventDialog
- [ ] Integrate event list into unit detail page
- [ ] Load event YAML into canvas on selection
- [ ] Auto-save YAML on node changes
- [ ] Helper API calls (forms, tables)
- [ ] Manual testing

---

**Phase 5 Completion**: When event CRUD works with trigger configuration
