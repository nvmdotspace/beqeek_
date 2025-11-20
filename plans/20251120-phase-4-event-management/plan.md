# Phase 4: Event Management - Implementation Plan

**Created**: 2025-11-20
**Status**: Planning
**Dependencies**: Phase 3 (React Flow Canvas) - Complete

## Overview

Phase 4 implements full event lifecycle management: CRUD operations, YAML conversion, trigger configuration, and editor integration. Transforms visual workflow builder into production-ready event orchestrator.

## Context

**Research Foundation**:

- YAML conversion strategies (IR pattern, Zod validation)
- Trigger UX patterns (progressive disclosure, helper tools)
- Existing codebase patterns (API clients, React Query hooks, Zustand stores)

**Phase 3 Foundation** (Complete):

- React Flow canvas with 17 node types + connection validator
- Node palette with drag-and-drop
- Workflow editor store (Zustand)
- Node configuration panel (placeholder)

## Implementation Phases

### Phase 1: Event API Integration

**File**: `phase-01-event-api-hooks.md`
**Status**: ⏸️ Pending
**Scope**: API client, React Query hooks, query key helpers
**Dependencies**: None

### Phase 2: YAML Conversion

**File**: `phase-02-yaml-conversion.md`
**Status**: ⏸️ Pending
**Scope**: Bidirectional YAML ↔ React Flow conversion, validation
**Dependencies**: js-yaml library

### Phase 3: Event List UI

**File**: `phase-03-event-list-ui.md`
**Status**: ⏸️ Pending
**Scope**: Event sidebar, event cards, selection state
**Dependencies**: Phase 1

### Phase 4: Trigger Configuration

**File**: `phase-04-trigger-config.md`
**Status**: ⏸️ Pending
**Scope**: 4 trigger types (schedule, webhook, form, table)
**Dependencies**: Phase 1

### Phase 5: Event Dialogs

**File**: `phase-05-event-dialogs.md`
**Status**: ⏸️ Pending
**Scope**: Create/Edit/Delete event dialogs
**Dependencies**: Phase 1, Phase 4

### Phase 6: Event Editor Integration

**File**: `phase-06-integration.md`
**Status**: ⏸️ Pending
**Scope**: Load/save events, auto-save, event switching
**Dependencies**: Phase 2, Phase 3, Phase 5

## Success Criteria

- [ ] Create, read, update, delete events via API
- [ ] Convert YAML ↔ React Flow nodes bidirectionally
- [ ] Select events from sidebar, load into canvas
- [ ] Configure 4 trigger types with validation
- [ ] Auto-save node changes to YAML
- [ ] Manually save events
- [ ] Switch between events without data loss

## Architecture Highlights

**Data Flow**:

```
API (YAML) → Parser → IR → React Flow Nodes → Canvas
Canvas → Nodes → IR → Serializer → YAML → API
```

**State Management**:

- React Query: Event CRUD, caching, optimistic updates
- Zustand: Canvas state (nodes, edges, selected event)
- Local: Form state (dialogs, trigger config)

**Key Components**:

- `EventListSidebar` - Event selection
- `TriggerConfigForm` - 4 trigger types
- `CreateEventDialog` - Multi-step event creation
- `YAMLConverter` - Bidirectional conversion
- `EventEditorCanvas` - React Flow integration

## Risk Mitigation

**High Risk**: YAML conversion errors
→ Validation at every layer (Zod schemas), unit tests

**Medium Risk**: Auto-save performance
→ Debounce node changes (500ms), differential updates

**Low Risk**: Trigger config complexity
→ Progressive disclosure, helper tools (cron builder)

## Next Steps

1. Review research reports for implementation details
2. Start with Phase 1 (API + hooks) - foundation layer
3. Implement Phase 2 (YAML) - enables testing with real data
4. Build UI layers (Phase 3, 4, 5) in parallel
5. Integrate everything in Phase 6
