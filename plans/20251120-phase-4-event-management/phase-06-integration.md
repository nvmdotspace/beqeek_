# Phase 6: Event Editor Integration

**Date**: 2025-11-20
**Priority**: P0 (Critical Path)
**Status**: Planning
**Estimated Effort**: 6-8 hours

## Context

**Related Files**:

- Canvas: `apps/web/src/features/workflows/components/workflow-editor-canvas.tsx`
- Store: `apps/web/src/features/workflows/stores/workflow-editor-store.ts`
- YAML converter: (Phase 2) `apps/web/src/features/workflows/utils/yaml-converter.ts`

**Dependencies**:

- Phase 1: Event API hooks (useEvent, useUpdateEvent)
- Phase 2: YAML conversion utilities (yamlToReactFlow, reactFlowToYAML)
- Phase 3: Event list sidebar (selection state)
- Phase 5: Event dialogs (create/edit)

## Key Insights from Research

1. **Load on Select**: Clicking event in sidebar loads YAML into canvas
2. **Auto-Save**: Debounce node changes (500ms), save YAML to API
3. **Manual Save**: Save button for explicit control
4. **Dirty State**: Track unsaved changes, warn on navigation
5. **Error Handling**: Show parsing errors, allow recovery

## Requirements

### Functional

- Load event YAML into React Flow canvas
- Display event name/trigger in canvas header
- Auto-save node changes to API (debounced)
- Manual save button (force save)
- Track dirty state (unsaved changes indicator)
- Warn before switching events with unsaved changes
- Show parsing errors (malformed YAML)
- Handle empty events (new event with no steps)

### Non-Functional

- Load event <500ms
- Auto-save debounce 500ms
- Parse 100-node workflows <100ms
- Serialize 100-node workflows <100ms
- No data loss on errors
- Optimistic updates for save

## Architecture

### Data Flow

**Load Event**:

```
Event selected in sidebar
  ↓
useEvent(eventId) fetches from API
  ↓
yamlToReactFlow(steps_yaml)
  ↓
setNodes(nodes), setEdges(edges)
  ↓
Canvas renders nodes
```

**Save Event**:

```
Node/edge changed on canvas
  ↓
Debounce 500ms
  ↓
reactFlowToYAML(nodes, edges, trigger)
  ↓
useUpdateEvent({ steps_yaml })
  ↓
API saves YAML
```

### State Management

**Zustand Store (Canvas State)**:

```typescript
interface WorkflowEditorState {
  // Existing
  nodes: Node[];
  edges: Edge[];
  selectedEventId: string | null;

  // New
  isDirty: boolean; // Unsaved changes
  isLoading: boolean; // Loading event
  isAutoSaving: boolean; // Auto-save in progress
  lastSavedAt: Date | null; // Last save timestamp

  // Actions
  loadEvent: (event: WorkflowEvent) => void;
  saveEvent: () => Promise<void>;
  setIsDirty: (dirty: boolean) => void;
}
```

**React Query (Server State)**:

- `useEvent(workspaceId, eventId)` - Fetch event data
- `useUpdateEvent(workspaceId, eventId)` - Save event changes

**Local State**:

- Save button loading state
- Parse error messages
- Unsaved changes warning dialog

### Canvas Header Component

```typescript
interface CanvasHeaderProps {
  event: WorkflowEvent | null;
  isDirty: boolean;
  isAutoSaving: boolean;
  lastSavedAt: Date | null;
  onSave: () => void;
}

function CanvasHeader({
  event,
  isDirty,
  isAutoSaving,
  lastSavedAt,
  onSave,
}: CanvasHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b p-4">
      <div>
        <h2 className="font-semibold">{event?.name || 'No event selected'}</h2>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="secondary">{event?.trigger_type}</Badge>
          {isDirty && <span>• Unsaved changes</span>}
          {isAutoSaving && <Loader2 className="h-3 w-3 animate-spin" />}
          {lastSavedAt && !isDirty && (
            <span>Saved {formatDistanceToNow(lastSavedAt)} ago</span>
          )}
        </div>
      </div>

      <Button onClick={onSave} disabled={!isDirty || isAutoSaving}>
        {isAutoSaving ? 'Saving...' : 'Save'}
      </Button>
    </div>
  );
}
```

## Related Code Files

**Canvas Component**:

- `apps/web/src/features/workflows/components/workflow-editor-canvas.tsx`

**Store**:

- `apps/web/src/features/workflows/stores/workflow-editor-store.ts`

**YAML Utilities** (Phase 2):

- `apps/web/src/features/workflows/utils/yaml-converter.ts`

**Existing Patterns**:

- `apps/web/src/features/active-tables/hooks/use-auto-save.ts` - Auto-save pattern
- `apps/web/src/features/active-tables/components/record-editor.tsx` - Dirty state

## Implementation Steps

### 1. Extend Workflow Editor Store

**File**: `apps/web/src/features/workflows/stores/workflow-editor-store.ts`

```typescript
import { create } from 'zustand';
import type { Node, Edge } from '@xyflow/react';
import type { WorkflowEvent } from '../types';
import { yamlToReactFlow, reactFlowToYAML } from '../utils/yaml-converter';

interface WorkflowEditorState {
  // Existing
  nodes: Node[];
  edges: Edge[];
  selectedEventId: string | null;
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;

  // New
  isDirty: boolean;
  isLoading: boolean;
  isAutoSaving: boolean;
  lastSavedAt: Date | null;
  currentEvent: WorkflowEvent | null;
  parseError: string | null;

  // Actions
  setSelectedEventId: (id: string | null) => void;
  loadEvent: (event: WorkflowEvent) => void;
  setIsDirty: (dirty: boolean) => void;
  setIsAutoSaving: (saving: boolean) => void;
  setLastSavedAt: (date: Date) => void;
  resetEditor: () => void;
}

export const useWorkflowEditorStore = create<WorkflowEditorState>((set, get) => ({
  // Existing state
  nodes: [],
  edges: [],
  selectedEventId: null,
  onNodesChange: (changes) => {
    set({ nodes: applyNodeChanges(changes, get().nodes), isDirty: true });
  },
  onEdgesChange: (changes) => {
    set({ edges: applyEdgeChanges(changes, get().edges), isDirty: true });
  },
  onConnect: (connection) => {
    set({ edges: addEdge(connection, get().edges), isDirty: true });
  },

  // New state
  isDirty: false,
  isLoading: false,
  isAutoSaving: false,
  lastSavedAt: null,
  currentEvent: null,
  parseError: null,

  // Actions
  setSelectedEventId: (id) => set({ selectedEventId: id }),

  loadEvent: (event) => {
    set({ isLoading: true, parseError: null });

    try {
      const { nodes, edges, trigger } = yamlToReactFlow(event.steps_yaml);

      set({
        nodes,
        edges,
        currentEvent: event,
        isDirty: false,
        isLoading: false,
        lastSavedAt: new Date(event.updated_at),
      });
    } catch (error) {
      set({
        parseError: error instanceof Error ? error.message : 'Failed to parse event',
        isLoading: false,
      });
    }
  },

  setIsDirty: (dirty) => set({ isDirty: dirty }),
  setIsAutoSaving: (saving) => set({ isAutoSaving: saving }),
  setLastSavedAt: (date) => set({ lastSavedAt: date }),

  resetEditor: () =>
    set({
      nodes: [],
      edges: [],
      selectedEventId: null,
      isDirty: false,
      isLoading: false,
      isAutoSaving: false,
      lastSavedAt: null,
      currentEvent: null,
      parseError: null,
    }),
}));
```

### 2. Create Auto-Save Hook

**File**: `apps/web/src/features/workflows/hooks/use-event-auto-save.ts`

```typescript
import { useEffect, useCallback } from 'react';
import { useDebounce } from '@/hooks/use-debounce';
import { useUpdateEvent } from './use-events';
import { useWorkflowEditorStore } from '../stores/workflow-editor-store';
import { reactFlowToYAML } from '../utils/yaml-converter';

export function useEventAutoSave(workspaceId: string) {
  const { nodes, edges, currentEvent, isDirty, setIsAutoSaving, setLastSavedAt, setIsDirty } = useWorkflowEditorStore();

  const updateEvent = useUpdateEvent(workspaceId, currentEvent?.id || '');

  // Debounce node changes (500ms)
  const debouncedNodes = useDebounce(nodes, 500);
  const debouncedEdges = useDebounce(edges, 500);

  const saveEvent = useCallback(async () => {
    if (!currentEvent || !isDirty) return;

    setIsAutoSaving(true);

    try {
      const trigger = JSON.parse(currentEvent.trigger_config_yaml); // TODO: Parse YAML
      const stepsYaml = reactFlowToYAML(nodes, edges, trigger);

      await updateEvent.mutateAsync({
        steps_yaml: stepsYaml,
      });

      setLastSavedAt(new Date());
      setIsDirty(false);
    } catch (error) {
      console.error('Auto-save failed:', error);
      // Don't reset dirty flag on error
    } finally {
      setIsAutoSaving(false);
    }
  }, [nodes, edges, currentEvent, isDirty, updateEvent]);

  // Auto-save when debounced nodes/edges change
  useEffect(() => {
    if (isDirty) {
      saveEvent();
    }
  }, [debouncedNodes, debouncedEdges]);

  return { saveEvent };
}
```

### 3. Create Canvas Header Component

**File**: `apps/web/src/features/workflows/components/canvas-header.tsx`

```typescript
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import { Loader2, Save } from 'lucide-react';
import type { WorkflowEvent } from '../types';

interface CanvasHeaderProps {
  event: WorkflowEvent | null;
  isDirty: boolean;
  isAutoSaving: boolean;
  lastSavedAt: Date | null;
  onSave: () => void;
}

export function CanvasHeader({
  event,
  isDirty,
  isAutoSaving,
  lastSavedAt,
  onSave,
}: CanvasHeaderProps) {
  if (!event) {
    return (
      <div className="flex items-center justify-center border-b p-4 bg-muted">
        <p className="text-sm text-muted-foreground">
          Select an event from the sidebar to start editing
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between border-b p-4 bg-background">
      <div className="flex-1 min-w-0">
        <h2 className="font-semibold text-lg truncate">{event.name}</h2>

        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
          <Badge variant="secondary" className="capitalize">
            {event.trigger_type}
          </Badge>

          {isDirty && <span>• Unsaved changes</span>}

          {isAutoSaving && (
            <>
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>Saving...</span>
            </>
          )}

          {lastSavedAt && !isDirty && !isAutoSaving && (
            <span>Saved {formatDistanceToNow(lastSavedAt, { addSuffix: true })}</span>
          )}
        </div>
      </div>

      <Button
        onClick={onSave}
        disabled={!isDirty || isAutoSaving}
        size="sm"
      >
        <Save className="h-4 w-4 mr-2" />
        {isAutoSaving ? 'Saving...' : 'Save'}
      </Button>
    </div>
  );
}
```

### 4. Update Workflow Editor Canvas

**File**: `apps/web/src/features/workflows/components/workflow-editor-canvas.tsx`

```typescript
import { useEffect } from 'react';
import { ReactFlow } from '@xyflow/react';
import { useWorkflowEditorStore } from '../stores/workflow-editor-store';
import { useEvent } from '../hooks/use-events';
import { useEventAutoSave } from '../hooks/use-event-auto-save';
import { CanvasHeader } from './canvas-header';
import { NodePalette } from './node-palette';
import { Alert, AlertDescription } from '@workspace/ui/components/alert';
import { AlertCircle } from 'lucide-react';

interface WorkflowEditorCanvasProps {
  workspaceId: string;
}

export function WorkflowEditorCanvas({ workspaceId }: WorkflowEditorCanvasProps) {
  const {
    nodes,
    edges,
    selectedEventId,
    onNodesChange,
    onEdgesChange,
    onConnect,
    loadEvent,
    isDirty,
    isLoading,
    isAutoSaving,
    lastSavedAt,
    currentEvent,
    parseError,
  } = useWorkflowEditorStore();

  // Fetch event when selected
  const { data: event } = useEvent(
    workspaceId,
    selectedEventId || '',
    { enabled: !!selectedEventId }
  );

  // Auto-save hook
  const { saveEvent } = useEventAutoSave(workspaceId);

  // Load event into canvas
  useEffect(() => {
    if (event) {
      loadEvent(event);
    }
  }, [event]);

  return (
    <div className="flex flex-col flex-1">
      <CanvasHeader
        event={currentEvent}
        isDirty={isDirty}
        isAutoSaving={isAutoSaving}
        lastSavedAt={lastSavedAt}
        onSave={saveEvent}
      />

      {parseError && (
        <Alert variant="destructive" className="m-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{parseError}</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center flex-1">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
        >
          {/* ... existing controls, background, etc. */}
        </ReactFlow>
      )}

      <NodePalette />
    </div>
  );
}
```

### 5. Add Unsaved Changes Warning

**File**: `apps/web/src/features/workflows/hooks/use-unsaved-changes-warning.ts`

```typescript
import { useEffect } from 'react';
import { useBlocker } from '@tanstack/react-router';
import { useWorkflowEditorStore } from '../stores/workflow-editor-store';

export function useUnsavedChangesWarning() {
  const { isDirty } = useWorkflowEditorStore();

  // Warn before navigation
  useBlocker({
    condition: isDirty,
    blockerFn: () => {
      return window.confirm('You have unsaved changes. Are you sure you want to leave?');
    },
  });

  // Warn before page unload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = ''; // Chrome requires returnValue to be set
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);
}
```

### 6. Update Event List Sidebar

**File**: `apps/web/src/features/workflows/components/event-list-sidebar.tsx`

```typescript
// Add unsaved changes check before switching events
const handleSelectEvent = (eventId: string) => {
  if (isDirty) {
    const confirmed = window.confirm('You have unsaved changes. Are you sure you want to switch events?');
    if (!confirmed) return;
  }

  setSelectedEventId(eventId);
};
```

### 7. Create useDebounce Hook

**File**: `apps/web/src/hooks/use-debounce.ts`

```typescript
import { useEffect, useState } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
```

### 8. Write Unit Tests

**File**: `apps/web/src/features/workflows/hooks/use-event-auto-save.test.ts`

- Test auto-save triggers after debounce
- Test manual save works
- Test dirty state updates
- Test save failure handling
- Test unsaved changes warning

### 9. Integration Testing

- Load event → renders nodes on canvas
- Modify nodes → auto-saves after 500ms
- Switch events → warns if unsaved changes
- Parse error → shows error message
- Save button → force saves changes

### 10. Add Error Recovery

**File**: `apps/web/src/features/workflows/components/parse-error-dialog.tsx`

```typescript
// Dialog to show parse errors with options:
// 1. View raw YAML
// 2. Reset to last saved version
// 3. Contact support
```

## Todo List

- [ ] Extend workflow-editor-store.ts with save state
- [ ] Create use-event-auto-save.ts hook (debounce 500ms)
- [ ] Create canvas-header.tsx component
- [ ] Update workflow-editor-canvas.tsx with header + auto-save
- [ ] Create use-unsaved-changes-warning.ts hook
- [ ] Update event-list-sidebar.tsx with switch warning
- [ ] Create use-debounce.ts hook
- [ ] Write unit tests (80%+ coverage)
- [ ] Integration testing (load → edit → save)
- [ ] Add parse error recovery dialog

## Success Criteria

✅ **Load Event**:

- Selected event loads into canvas <500ms
- Nodes + edges render correctly
- Trigger displays in header
- Parse errors show actionable message

✅ **Auto-Save**:

- Node changes auto-save after 500ms
- Saving indicator shows in header
- Last saved timestamp updates
- Failed saves don't lose data

✅ **Manual Save**:

- Save button works (force save)
- Disabled when no changes
- Shows loading state
- Success updates timestamp

✅ **Dirty State**:

- Unsaved changes indicator shows
- Warn before switching events
- Warn before page navigation
- Warn before page close

✅ **Performance**:

- Load 100-node event <500ms
- Auto-save 100-node event <500ms
- No UI jank during save
- Debounce prevents excessive saves

✅ **Error Handling**:

- Parse errors show message
- Failed saves show toast
- Retry option for failures
- No data loss on errors

✅ **Testing**:

- 80%+ test coverage
- All integration paths tested
- Edge cases covered (parse errors, save failures)

## Risk Assessment

**High Risk**: Data loss on parse error
→ Mitigation: Keep raw YAML in store, allow recovery

**Medium Risk**: Auto-save conflicts with manual edits
→ Mitigation: Debounce prevents race conditions, optimistic updates

**Low Risk**: Dirty state false positives
→ Mitigation: Deep comparison of nodes/edges, reset on successful save

## Security Considerations

1. **YAML Injection**: Backend validates YAML (not client concern)
2. **CSRF**: Update mutations use CSRF token
3. **Authorization**: Backend enforces workspace membership
4. **Data Loss**: Auto-save prevents accidental loss

## Next Steps

1. Complete Phase 6 implementation (this file)
2. Full end-to-end testing (create → load → edit → save)
3. Performance testing with large workflows (100+ nodes)
4. User acceptance testing with real workflows
5. Deploy Phase 4 to staging environment
6. Monitor auto-save performance in production
