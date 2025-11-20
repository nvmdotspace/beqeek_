# Phase 5-6 Consolidated: Event Management End-to-End

**Date**: 2025-11-20
**Priority**: P0 (Critical Path)
**Status**: Ready to Execute
**Estimated Effort**: 12-14 hours (2 work sessions)

## Overview

Implement complete event management: create/edit/delete dialogs + YAML loading/saving in editor canvas. Combines Phase 5 (dialogs) and Phase 6 (integration) for end-to-end functionality without integration gaps.

**Why consolidate**: Reduces context switching, enables incremental testing, delivers working feature faster.

**What we're building**:

1. Multi-step event creation (basic info → trigger config)
2. Event editing (single-form with all fields)
3. Delete confirmation (type-to-confirm pattern)
4. Canvas integration (load YAML → edit → auto-save → manual save)
5. Dirty state tracking (unsaved changes warnings)

## Dependencies Complete

✅ Phase 1: Event API hooks (useEvent, useCreateEvent, useUpdateEvent, useDeleteEvent)
✅ Phase 2: YAML conversion (yamlToReactFlow, reactFlowToYAML)
✅ Phase 3: Event list sidebar (selection state)
✅ Phase 4: Trigger configuration forms (TriggerConfigForm)

## Implementation Milestones

### Milestone 1: Foundation (2-3 hours)

**Goal**: Validation + shared components ready

**Tasks**:

1. Create event validation schemas (`event-validation.ts`)
   - `eventBasicInfoSchema`: name (1-100 chars), description (max 500)
   - `eventFormSchema`: full form with trigger config union
   - Reuse Phase 4 trigger schemas (schedule, webhook, form, table)

2. Create step indicator component (`step-indicator.tsx`)
   - Shows current step / total steps (1 of 2, 2 of 2)
   - Visual progress: filled circle (current), outlined circle (future)
   - Reusable for multi-step flows

3. Create debounce hook (`use-debounce.ts`)
   - Generic `useDebounce<T>(value, delay)` for auto-save
   - 500ms delay for node changes

**Testing**: Validation schemas pass/fail correctly, step indicator renders

---

### Milestone 2: Event Dialogs (3-4 hours)

**Goal**: Create/edit/delete events via dialogs

**Tasks**:

1. Create event dialog (`create-event-dialog.tsx`)
   - Step 1: Basic info (name, description) with validation
   - Step 2: Trigger config (reuse TriggerConfigForm from Phase 4)
   - Back/Next navigation, form validation blocks Next
   - Submit → `useCreateEvent({ steps_yaml: emptyYAML })`
   - Close + reset on success

2. Edit event dialog (`edit-event-dialog.tsx`)
   - Single form with all fields pre-populated
   - Reuse TriggerConfigForm for trigger editing
   - Save → `useUpdateEvent({ name, description, trigger_config_yaml })`
   - Optimistic update

3. Delete event dialog (`delete-event-dialog.tsx`)
   - Show event name + description in read-only box
   - Type event name to enable delete button
   - `useDeleteEvent(eventId)` on confirm

4. Wire dialogs to event card (`event-card.tsx`)
   - Add dropdown menu (Edit, Delete)
   - Local state for dialog visibility
   - Stop propagation on action clicks

**Testing**: Create event → appears in list, Edit → changes persist, Delete → removed from list

---

### Milestone 3: Canvas Integration (3-4 hours)

**Goal**: Load event YAML into canvas, display header

**Tasks**:

1. Extend workflow editor store (`workflow-editor-store.ts`)
   - Add state: `isDirty`, `isAutoSaving`, `lastSavedAt`, `currentEvent`, `parseError`
   - Add actions: `loadEvent(event)`, `setIsDirty`, `setIsAutoSaving`, `resetEditor`
   - Mark dirty on `onNodesChange`, `onEdgesChange`, `onConnect`
   - `loadEvent`: Parse YAML → `yamlToReactFlow` → set nodes/edges

2. Create canvas header (`canvas-header.tsx`)
   - Display event name, trigger type badge
   - Show dirty state ("Unsaved changes"), auto-save spinner, last saved timestamp
   - Manual save button (disabled if clean or auto-saving)
   - Empty state: "Select an event from sidebar"

3. Update canvas component (`workflow-editor-canvas.tsx`)
   - Render canvas header above ReactFlow
   - Fetch event with `useEvent(workspaceId, selectedEventId)`
   - Load event into store on data change
   - Show parse error alert if YAML invalid
   - Loading spinner while fetching

**Testing**: Select event → loads nodes, header shows event name, parse error displays

---

### Milestone 4: Auto-Save (2-3 hours)

**Goal**: Auto-save node changes after 500ms debounce

**Tasks**:

1. Create auto-save hook (`use-event-auto-save.ts`)
   - Debounce nodes/edges with `useDebounce(nodes, 500)`
   - On debounced change: `reactFlowToYAML` → `useUpdateEvent({ steps_yaml })`
   - Set `isAutoSaving` during mutation
   - Update `lastSavedAt`, clear `isDirty` on success
   - Keep dirty on error (show toast)

2. Wire auto-save to canvas
   - Call `useEventAutoSave(workspaceId)` in canvas component
   - Return `saveEvent` for manual save button
   - Auto-save triggers on debounced changes

**Testing**: Add node → auto-saves after 500ms, header shows "Saving...", timestamp updates

---

### Milestone 5: Dirty State Protection (1-2 hours)

**Goal**: Prevent data loss from navigation

**Tasks**:

1. Create unsaved changes hook (`use-unsaved-changes-warning.ts`)
   - `useBlocker` from TanStack Router (warn before route change)
   - `beforeunload` event listener (warn before page close)
   - Only block if `isDirty === true`

2. Update event list sidebar (`event-list-sidebar.tsx`)
   - Check `isDirty` before `setSelectedEventId`
   - `window.confirm("Unsaved changes. Switch anyway?")`
   - Abort selection if user cancels

**Testing**: Edit event → try to switch → warns, try to close tab → warns

---

### Milestone 6: Polish + i18n (1-2 hours)

**Goal**: Production-ready UX

**Tasks**:

1. Add i18n messages (`messages/vi.json`, `messages/en.json`)
   - Dialog titles, button labels, warnings, placeholders
   - Use Paraglide `m.*` in all components

2. Accessibility audit
   - Dialog focus trap (Escape to close)
   - Keyboard navigation (Tab, Enter)
   - ARIA labels for all inputs
   - Screen reader announcements

3. Error handling polish
   - Parse error: Show raw YAML snippet + "Reset to last saved" option
   - Save failure: Toast with retry button
   - Network errors: "Check connection" message

**Testing**: Navigate with keyboard only, test with screen reader, trigger error states

---

## Integration Points

**Phase 5 → Phase 6**:

- Create dialog → generates empty `steps_yaml` → Phase 6 loads into canvas
- Edit dialog → updates `trigger_config_yaml` → Phase 6 re-parses trigger
- Delete dialog → removes event → Phase 6 resets canvas to empty state

**Shared State**:

- Zustand store: Canvas state (nodes, edges, dirty flag)
- React Query: Server state (events list, current event)
- Local state: Dialog visibility, confirmation text

**Data Flow**:

```
Create Event → API saves with empty steps_yaml
  ↓
Select Event → useEvent fetches from API
  ↓
Load Event → yamlToReactFlow(steps_yaml) → setNodes/setEdges
  ↓
Edit Nodes → isDirty = true → debounce 500ms
  ↓
Auto-Save → reactFlowToYAML → useUpdateEvent({ steps_yaml })
```

## Testing Strategy

**Unit Tests** (80%+ coverage):

- Validation schemas: Valid/invalid inputs
- Step indicator: All states render
- Debounce hook: Delays value updates
- Store actions: `loadEvent` parses YAML correctly

**Integration Tests**:

- Create flow: Step 1 → Step 2 → Submit → Event in list
- Edit flow: Open dialog → Change fields → Save → Changes persist
- Delete flow: Confirm text → Delete button enables → Event removed
- Load flow: Select event → Canvas shows nodes → Edit → Auto-saves
- Dirty flow: Edit → Switch event → Warns → Cancel → Stays on event

**Manual QA Checklist**:

- [ ] Create event with all 4 trigger types (schedule, webhook, form, table)
- [ ] Edit event name/description, verify changes in list
- [ ] Delete event, verify removal from list + canvas resets
- [ ] Load event with 10+ nodes, verify all render correctly
- [ ] Add/edit/delete nodes, verify auto-save after 500ms
- [ ] Try to switch events with unsaved changes, verify warning
- [ ] Try to close tab with unsaved changes, verify browser warning
- [ ] Manual save button works when auto-save disabled
- [ ] Parse error (corrupt YAML) shows error message
- [ ] Network error (offline) shows retry option

## Risks & Mitigations

**High Risk**: Parse error loses user work
→ **Mitigation**: Store raw YAML in Zustand, add "Reset to last saved" button, never discard data

**Medium Risk**: Auto-save race condition (user edits while saving)
→ **Mitigation**: Debounce prevents rapid saves, optimistic updates feel instant, retry on conflict

**Medium Risk**: Multi-step form state management complexity
→ **Mitigation**: Local state for steps, validate each step independently, reset on dialog close

**Low Risk**: Dialog close on accidental background click
→ **Mitigation**: Dialogs don't close on backdrop click by default (shadcn/ui behavior)

**Low Risk**: Dirty state false positives
→ **Mitigation**: Reset `isDirty` on successful save, deep comparison not needed (React Flow handles)

## File Checklist

**New Files** (10):

1. `apps/web/src/features/workflows/utils/event-validation.ts`
2. `apps/web/src/features/workflows/components/step-indicator.tsx`
3. `apps/web/src/features/workflows/components/create-event-dialog.tsx`
4. `apps/web/src/features/workflows/components/edit-event-dialog.tsx`
5. `apps/web/src/features/workflows/components/delete-event-dialog.tsx`
6. `apps/web/src/features/workflows/components/canvas-header.tsx`
7. `apps/web/src/features/workflows/hooks/use-event-auto-save.ts`
8. `apps/web/src/features/workflows/hooks/use-unsaved-changes-warning.ts`
9. `apps/web/src/hooks/use-debounce.ts`
10. `apps/web/src/features/workflows/components/event-dialogs.test.tsx`

**Modified Files** (3):

1. `apps/web/src/features/workflows/stores/workflow-editor-store.ts` - Add save state
2. `apps/web/src/features/workflows/components/workflow-editor-canvas.tsx` - Add header + auto-save
3. `apps/web/src/features/workflows/components/event-list-sidebar.tsx` - Add switch warning

**i18n Files** (2):

1. `messages/vi.json` - Add Vietnamese messages
2. `messages/en.json` - Add English messages

## Effort Breakdown

| Milestone             | Estimated  | Tasks                                | Complexity |
| --------------------- | ---------- | ------------------------------------ | ---------- |
| 1. Foundation         | 2-3h       | Validation, step indicator, debounce | Low        |
| 2. Dialogs            | 3-4h       | Create, edit, delete dialogs         | Medium     |
| 3. Canvas Integration | 3-4h       | Store, header, load event            | Medium     |
| 4. Auto-Save          | 2-3h       | Hook, debounce, mutation             | Medium     |
| 5. Dirty State        | 1-2h       | Warnings, blockers                   | Low        |
| 6. Polish             | 1-2h       | i18n, a11y, errors                   | Low        |
| **Total**             | **12-14h** | **13 files**                         | **Medium** |

## Success Criteria

✅ **Complete Event Lifecycle**:

- Create event → Edit trigger → Add workflow steps → Auto-save → Delete event
- All operations <500ms response time
- No data loss on errors

✅ **User Experience**:

- Multi-step creation feels guided
- Auto-save is invisible (except spinner)
- Unsaved changes warnings prevent data loss
- Error messages are actionable

✅ **Code Quality**:

- 80%+ test coverage
- All dialogs accessible (keyboard + screen reader)
- TypeScript strict mode (no `any`)
- Vietnamese + English i18n complete

✅ **Performance**:

- Load 100-node event <500ms
- Auto-save 100-node event <500ms
- No UI jank during save

## Next Actions

1. Execute milestones 1-6 in sequence
2. Run test suite after each milestone
3. Manual QA after milestone 6
4. Deploy to staging for UAT
5. Monitor auto-save performance in production
