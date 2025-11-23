# Phase 3: Event List UI

**Date**: 2025-11-20
**Priority**: P1 (User-facing)
**Status**: Planning
**Estimated Effort**: 6-8 hours

## Context

**Related Files**:

- Unit detail page: `apps/web/src/features/workflows/pages/unit-detail-page.tsx`
- Design system: `docs/design-system.md`
- UI components: `packages/ui/src/components/*`
- Sidebar example: `apps/web/src/components/app-sidebar.tsx`

**Dependencies**:

- Phase 1: Event API hooks (useEvents, useEvent)
- Design system components (Card, Button, Badge, ScrollArea)

## Key Insights from Research

1. **Location**: Event list sidebar in unit detail page (left side)
2. **Selection State**: Single active event at a time (loads into canvas)
3. **Status Toggle**: Quick enable/disable without opening dialog
4. **Create Button**: Primary action at top of list
5. **Visual Feedback**: Active event highlighted, inactive events dimmed

## Requirements

### Functional

- Display all events for current unit
- Select event to load into canvas
- Toggle event active/inactive status
- Create new event (opens dialog)
- Show event metadata (name, trigger type, status)
- Empty state when no events
- Loading state during fetch
- Error state for failed fetches

### Non-Functional

- List scrollable with 100+ events
- Instant selection feedback (<50ms)
- Responsive layout (collapses on mobile)
- Keyboard navigation support (↑↓ arrows)
- WCAG 2.1 AA compliance

## Architecture

### Component Hierarchy

```
UnitDetailPage
  ├── EventListSidebar
  │   ├── EventListHeader
  │   │   ├── Button (Create Event)
  │   │   └── Badge (Event Count)
  │   ├── ScrollArea
  │   │   └── EventCard[] (List)
  │   │       ├── EventIcon (Trigger Type)
  │   │       ├── EventInfo (Name, Type)
  │   │       ├── EventStatus (Active Badge)
  │   │       └── EventActions (Toggle, Menu)
  │   └── EventListEmpty (No Events)
  └── WorkflowEditorCanvas
```

### State Management

**React Query (Server State)**:

- Event list fetched via `useEvents(workspaceId, unitId)`
- Single event fetched via `useEvent(workspaceId, eventId)` when selected

**Zustand (Canvas State)**:

```typescript
interface WorkflowEditorState {
  selectedEventId: string | null;
  setSelectedEventId: (id: string | null) => void;
  // ... existing canvas state
}
```

**Local State**:

- Sidebar collapsed/expanded (mobile)
- Hover state for event cards

### Data Flow

```
useEvents() → EventListSidebar → EventCard
                    ↓
              onClick(eventId)
                    ↓
        setSelectedEventId(eventId)
                    ↓
    WorkflowEditorCanvas loads event
```

## Related Code Files

**UI Components** (packages/ui):

- `components/button.tsx` - Primary action
- `components/card.tsx` - Event card container
- `components/badge.tsx` - Status indicator
- `components/scroll-area.tsx` - Scrollable list
- `components/separator.tsx` - Visual divider
- `components/switch.tsx` - Active/inactive toggle

**Layout Reference**:

- `apps/web/src/components/app-sidebar.tsx` - Sidebar pattern
- `apps/web/src/features/workflows/pages/unit-detail-page.tsx` - Parent page

**Icons** (lucide-react):

- `Calendar` - Schedule trigger
- `Webhook` - Webhook trigger
- `FormInput` - Form trigger
- `Table` - Table trigger
- `Plus` - Create button
- `MoreVertical` - Actions menu

## Implementation Steps

### 1. Update Workflow Editor Store

**File**: `apps/web/src/features/workflows/stores/workflow-editor-store.ts`

```typescript
interface WorkflowEditorState {
  // ... existing state
  selectedEventId: string | null;
  setSelectedEventId: (id: string | null) => void;
}

export const useWorkflowEditorStore = create<WorkflowEditorState>((set) => ({
  // ... existing state
  selectedEventId: null,
  setSelectedEventId: (id) => set({ selectedEventId: id }),
}));
```

### 2. Create EventCard Component

**File**: `apps/web/src/features/workflows/components/event-card.tsx`

```typescript
import { Card, CardContent } from '@workspace/ui/components/card';
import { Badge } from '@workspace/ui/components/badge';
import { Switch } from '@workspace/ui/components/switch';
import { Calendar, Webhook, FormInput, Table } from 'lucide-react';
import { cn } from '@workspace/ui/lib/utils';
import type { WorkflowEvent } from '../types';

const TRIGGER_ICONS = {
  schedule: Calendar,
  webhook: Webhook,
  form: FormInput,
  table: Table,
} as const;

interface EventCardProps {
  event: WorkflowEvent;
  isSelected: boolean;
  onSelect: (eventId: string) => void;
  onToggleActive: (eventId: string, active: boolean) => void;
}

export function EventCard({
  event,
  isSelected,
  onSelect,
  onToggleActive,
}: EventCardProps) {
  const Icon = TRIGGER_ICONS[event.trigger_type];

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all hover:bg-muted/50',
        isSelected && 'ring-2 ring-primary bg-muted'
      )}
      onClick={() => onSelect(event.id)}
    >
      <CardContent className="flex items-start gap-3 p-3">
        <Icon className="h-5 w-5 text-muted-foreground mt-0.5" />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-medium text-sm truncate">{event.name}</h4>
            <Badge variant={event.is_active ? 'default' : 'secondary'}>
              {event.is_active ? 'Active' : 'Inactive'}
            </Badge>
          </div>

          {event.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {event.description}
            </p>
          )}

          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-muted-foreground capitalize">
              {event.trigger_type}
            </span>

            <Switch
              checked={event.is_active}
              onCheckedChange={(checked) =>
                onToggleActive(event.id, checked)
              }
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

### 3. Create EventListEmpty Component

**File**: `apps/web/src/features/workflows/components/event-list-empty.tsx`

```typescript
import { FileQuestion } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';

interface EventListEmptyProps {
  onCreateEvent: () => void;
}

export function EventListEmpty({ onCreateEvent }: EventListEmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <FileQuestion className="h-16 w-16 text-muted-foreground mb-4" />
      <h3 className="font-semibold text-lg mb-2">No events yet</h3>
      <p className="text-sm text-muted-foreground mb-4 max-w-sm">
        Create your first workflow event to automate tasks
      </p>
      <Button onClick={onCreateEvent}>Create Event</Button>
    </div>
  );
}
```

### 4. Create EventListSidebar Component

**File**: `apps/web/src/features/workflows/components/event-list-sidebar.tsx`

```typescript
import { ScrollArea } from '@workspace/ui/components/scroll-area';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import { Separator } from '@workspace/ui/components/separator';
import { Plus, AlertCircle } from 'lucide-react';
import { useEvents } from '../hooks/use-events';
import { useUpdateEvent } from '../hooks/use-events';
import { useWorkflowEditorStore } from '../stores/workflow-editor-store';
import { EventCard } from './event-card';
import { EventListEmpty } from './event-list-empty';
import { Skeleton } from '@workspace/ui/components/skeleton';

interface EventListSidebarProps {
  workspaceId: string;
  unitId: string;
  onCreateEvent: () => void;
}

export function EventListSidebar({
  workspaceId,
  unitId,
  onCreateEvent,
}: EventListSidebarProps) {
  const { data: events, isLoading, error } = useEvents(workspaceId, unitId);
  const { selectedEventId, setSelectedEventId } = useWorkflowEditorStore();
  const updateEvent = useUpdateEvent(workspaceId, selectedEventId || '');

  const handleToggleActive = (eventId: string, active: boolean) => {
    updateEvent.mutate({ is_active: active });
  };

  if (isLoading) {
    return (
      <div className="w-80 border-r bg-background p-4 space-y-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-80 border-r bg-background p-4">
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircle className="h-5 w-5" />
          <span className="text-sm">Failed to load events</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 border-r bg-background flex flex-col">
      {/* Header */}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-lg">Events</h2>
          <Badge variant="secondary">{events?.length || 0}</Badge>
        </div>
        <Button onClick={onCreateEvent} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Create Event
        </Button>
      </div>

      <Separator />

      {/* Event List */}
      {events && events.length > 0 ? (
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-2">
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                isSelected={event.id === selectedEventId}
                onSelect={setSelectedEventId}
                onToggleActive={handleToggleActive}
              />
            ))}
          </div>
        </ScrollArea>
      ) : (
        <EventListEmpty onCreateEvent={onCreateEvent} />
      )}
    </div>
  );
}
```

### 5. Update UnitDetailPage

**File**: `apps/web/src/features/workflows/pages/unit-detail-page.tsx`

```typescript
import { useState } from 'react';
import { EventListSidebar } from '../components/event-list-sidebar';
import { WorkflowEditorCanvas } from '../components/workflow-editor-canvas';
import { CreateEventDialog } from '../components/create-event-dialog';
// ... existing imports

export function UnitDetailPage() {
  const { workspaceId, unitId } = useParams();
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  return (
    <div className="flex h-full">
      <EventListSidebar
        workspaceId={workspaceId}
        unitId={unitId}
        onCreateEvent={() => setShowCreateDialog(true)}
      />

      <WorkflowEditorCanvas />

      <CreateEventDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        workspaceId={workspaceId}
        unitId={unitId}
      />
    </div>
  );
}
```

### 6. Add Keyboard Navigation

**File**: `apps/web/src/features/workflows/components/event-list-sidebar.tsx`

```typescript
// Add keyboard handler
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (!events || events.length === 0) return;

    const currentIndex = events.findIndex((e) => e.id === selectedEventId);

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = Math.min(currentIndex + 1, events.length - 1);
      setSelectedEventId(events[nextIndex].id);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = Math.max(currentIndex - 1, 0);
      setSelectedEventId(events[prevIndex].id);
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [events, selectedEventId, setSelectedEventId]);
```

### 7. Add Mobile Responsive Layout

**File**: `apps/web/src/features/workflows/components/event-list-sidebar.tsx`

```typescript
// Add collapse state for mobile
const [isCollapsed, setIsCollapsed] = useState(false);

return (
  <div
    className={cn(
      'border-r bg-background flex flex-col transition-all',
      isCollapsed ? 'w-0' : 'w-80'
    )}
  >
    {/* Toggle button for mobile */}
    <Button
      variant="ghost"
      size="icon"
      className="md:hidden absolute top-2 right-2"
      onClick={() => setIsCollapsed(!isCollapsed)}
    >
      <Menu className="h-4 w-4" />
    </Button>

    {/* ... rest of sidebar */}
  </div>
);
```

### 8. Write Unit Tests

**File**: `apps/web/src/features/workflows/components/event-list-sidebar.test.tsx`

- Test rendering event list
- Test event selection
- Test toggle active/inactive
- Test empty state
- Test loading state
- Test error state
- Test keyboard navigation
- Test mobile collapse

### 9. Add i18n Messages

**File**: `messages/vi.json` and `messages/en.json`

```json
{
  "workflow.events.title": "Events",
  "workflow.events.create": "Create Event",
  "workflow.events.empty.title": "No events yet",
  "workflow.events.empty.description": "Create your first workflow event to automate tasks",
  "workflow.events.active": "Active",
  "workflow.events.inactive": "Inactive",
  "workflow.events.error": "Failed to load events"
}
```

### 10. Accessibility Testing

- Screen reader announces event count
- Keyboard navigation works (Tab, ↑↓ arrows)
- Focus visible on all interactive elements
- ARIA labels for icon buttons
- Color contrast meets WCAG AA

## Todo List

- [ ] Update workflow-editor-store.ts with selectedEventId
- [ ] Create event-card.tsx component
- [ ] Create event-list-empty.tsx component
- [ ] Create event-list-sidebar.tsx component
- [ ] Update unit-detail-page.tsx with sidebar
- [ ] Add keyboard navigation (↑↓ arrows)
- [ ] Add mobile responsive layout
- [ ] Write unit tests (80%+ coverage)
- [ ] Add i18n messages (vi + en)
- [ ] Accessibility testing (WCAG AA)
- [ ] Test with 100+ events (performance)

## Success Criteria

✅ **Rendering**:

- Event list displays all events for unit
- Loading state shows skeletons
- Error state shows error message
- Empty state shows call-to-action

✅ **Interaction**:

- Click event to select (highlights)
- Toggle active/inactive (instant feedback)
- Create button opens dialog
- Selected event loads into canvas

✅ **Performance**:

- List scrollable with 100+ events
- Selection feedback <50ms
- No jank during scroll
- Optimistic updates for toggle

✅ **Responsive**:

- Sidebar collapses on mobile
- Touch-friendly tap targets (44x44px)
- Works on 320px width

✅ **Accessibility**:

- Keyboard navigation (Tab, ↑↓)
- Screen reader announces changes
- Focus visible on all elements
- ARIA labels complete

✅ **Testing**:

- 80%+ test coverage
- All interaction paths tested
- Edge cases covered (no events, errors)

## Risk Assessment

**High Risk**: None
**Medium Risk**: Performance with 1000+ events
→ Mitigation: Virtual scrolling (react-window), pagination

**Low Risk**: Mobile layout conflicts
→ Mitigation: Test on real devices, use design system breakpoints

## Security Considerations

1. **Authorization**: Event list filtered by workspace membership (backend)
2. **XSS Prevention**: Sanitize event names/descriptions (handled by React)
3. **CSRF**: Toggle active uses CSRF token (HTTP client handles)

## Next Steps

1. Complete Phase 3 implementation (this file)
2. Test event list with mock data
3. Move to Phase 4: Trigger Configuration (uses event data)
4. Integrate with Phase 5: Event Dialogs (create flow)
5. Full integration test: Create → Select → Load → Edit
