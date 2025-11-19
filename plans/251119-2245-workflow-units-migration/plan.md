# Workflow Units Migration: Blade → React Flow

**Date**: 2025-11-19 22:45
**Status**: Draft
**Priority**: High
**Estimated Duration**: 11 weeks (9 phases)

---

## Overview

Migrate Workflow Units module from legacy Blade/Blockly to modern React 19 + React Flow architecture. Transform visual workflow builder from Google Blockly to React Flow v12 node-based system with bi-directional YAML ↔ visual conversion.

**Technology Decisions**:

- React Flow v12+ (node-based workflows) replaces Blockly
- Monaco Editor for YAML editing (same as legacy)
- WebSocket for real-time console monitoring
- TanStack Router (file-based) + React Query + Zustand

**Key Requirements**:

- 3 main views: List, Detail, Console
- 13 custom node types (4 triggers, 7 actions, 6 logic)
- Bi-directional YAML ↔ React Flow conversion
- 4 trigger types: SCHEDULE, WEBHOOK, OPTIN_FORM, ACTIVE_TABLE
- Real-time console via WebSocket
- Design system compliance mandatory

---

## Implementation Phases

### Phase 1: Foundation Setup (Week 1)

**File**: [phase-01-foundation-setup.md](./phase-01-foundation-setup.md)
**Status**: ⚪ Not Started
**Focus**: Folder structure, dependencies, routing, API skeleton

- Create feature directory structure
- Install @xyflow/react, @monaco-editor/react, js-yaml, dagre
- Setup TanStack Router routes (4 routes)
- API client skeleton + types
- Zustand store initialization
- Route constants in shared/route-paths.ts

**Deliverable**: Working routes with placeholder content

---

### Phase 2: Workflow Units CRUD (Week 2)

**File**: [phase-02-workflow-units-crud.md](./phase-02-workflow-units-crud.md)
**Status**: ⚪ Not Started
**Focus**: Workflow Units list + CRUD operations

- API client implementation (5 methods)
- React Query hooks (5 hooks)
- List page component
- Create/Edit/Delete dialogs
- Unit detail page skeleton
- Integration tests

**Deliverable**: Functional Workflow Units CRUD

---

### Phase 3: React Flow Integration (Week 3-4)

**File**: [phase-03-react-flow-integration.md](./phase-03-react-flow-integration.md)
**Status**: ⚪ Not Started
**Focus**: Visual workflow builder with custom nodes

- Define 13 node types + interfaces
- Implement custom node components:
  - 4 Trigger nodes
  - 7 Action nodes (table, email, API, Google Sheet, user, delay, log)
  - 6 Logic nodes (condition, match, loop, math, definition, log)
- Workflow canvas with React Flow
- Node palette/toolbar
- Node configuration panel
- Connection validation
- Mini-map and controls

**Deliverable**: Working React Flow canvas with all node types

---

### Phase 4: YAML Conversion (Week 5)

**File**: [phase-04-yaml-conversion.md](./phase-04-yaml-conversion.md)
**Status**: ⚪ Not Started
**Focus**: Bi-directional YAML ↔ React Flow conversion

- YAML parser (yaml-to-nodes.ts)
- YAML serializer (nodes-to-yaml.ts)
- Zod schemas for validation
- Nested block handling (condition, loop, match)
- Error handling + recovery
- Conversion unit tests

**Deliverable**: Reliable YAML ↔ Nodes conversion

---

### Phase 5: Event Management (Week 6)

**File**: [phase-05-event-management.md](./phase-05-event-management.md)
**Status**: ⚪ Not Started
**Focus**: Workflow Events CRUD + trigger configuration

- Event API client + hooks
- Event list component (sidebar)
- Trigger configuration forms (4 types)
- Event editor page
- Create/Edit/Delete event workflows
- Helper API integration (forms, tables)

**Deliverable**: Event CRUD with trigger configuration

---

### Phase 6: Monaco Editor (Week 7)

**File**: [phase-06-monaco-editor.md](./phase-06-monaco-editor.md)
**Status**: ⚪ Not Started
**Focus**: YAML code editor + dual-mode switching

- Monaco Editor React wrapper
- YAML language configuration
- Custom auto-completion provider
- Validation integration
- Dual-mode toggle (Visual ↔ YAML)
- Sync mechanism between modes

**Deliverable**: Functional Monaco YAML editor with mode switching

---

### Phase 7: Console Monitoring (Week 8)

**File**: [phase-07-console-monitoring.md](./phase-07-console-monitoring.md)
**Status**: ⚪ Not Started
**Focus**: Real-time console logs via WebSocket

- WebSocket client setup
- useConsoleWebSocket hook
- Console viewer component
- Real-time log streaming
- Log filtering + search
- Connection status indicators

**Deliverable**: Real-time console monitoring

---

### Phase 8: Advanced Features (Week 9-10)

**File**: [phase-08-advanced-features.md](./phase-08-advanced-features.md)
**Status**: ⚪ Not Started
**Focus**: Enhanced workflow editing experience

- Undo/redo functionality
- Keyboard shortcuts (delete, copy/paste, select all)
- Auto-layout with dagre
- Node grouping (stages)
- Copy/paste nodes
- Export/import workflows
- Performance optimization (memoization, virtual rendering)

**Deliverable**: Advanced editing features

---

### Phase 9: Testing & Deployment (Week 11)

**File**: [phase-09-testing-deployment.md](./phase-09-testing-deployment.md)
**Status**: ⚪ Not Started
**Focus**: Testing, optimization, docs, production deployment

- Unit tests (utilities, parsers)
- Integration tests (API, hooks)
- E2E tests with Playwright
- Accessibility audit (WCAG 2.1 AA)
- Performance benchmarks
- User + developer documentation
- Staging + production deployment

**Deliverable**: Production-ready module

---

## Research Citations

**React Flow v12 Best Practices**:

- Package renamed to `@xyflow/react` in v12
- Node dimensions now in `node.measured.width/height`
- Custom nodes are React components with full control
- Medium guide (July 2025): Auto-layout with ELK.js, conditional branching
- React Summit workshop: Custom nodes/edges, drag-drop, state management

**Monaco Editor YAML Support**:

- `monaco-yaml` plugin: Schema-based autocompletion + validation
- `@monaco-editor/react` wrapper for clean API
- Configure via `configureMonacoYaml` in `beforeMount`
- Worker registration required for language services

**n8n Architecture Insights**:

- Uses Vue.js (NOT React Flow) for workflow editor
- Custom canvas-based implementation
- React Flow is popular alternative for similar tools
- Beqeek follows n8n-style UX with React Flow tech

---

## Progress Tracking

| Phase | Status      | Start Date | End Date | Notes |
| ----- | ----------- | ---------- | -------- | ----- |
| 1     | Not Started | -          | -        | -     |
| 2     | Not Started | -          | -        | -     |
| 3     | Not Started | -          | -        | -     |
| 4     | Not Started | -          | -        | -     |
| 5     | Not Started | -          | -        | -     |
| 6     | Not Started | -          | -        | -     |
| 7     | Not Started | -          | -        | -     |
| 8     | Not Started | -          | -        | -     |
| 9     | Not Started | -          | -        | -     |

---

## Success Metrics

**Technical**:

- Time to Interactive < 3s
- React Flow render < 500ms for 100 nodes
- YAML parsing < 100ms for 1000 lines
- WebSocket latency < 100ms

**User Experience**:

- Workflow creation 50% faster than legacy
- User satisfaction > 4.0/5.0
- Bug reports < 5 per week post-launch
- Feature adoption > 60% within 3 months

---

## Key Architecture Decisions

1. **React Flow over Blockly**: Better enterprise UX, native React, active development
2. **File-based routing**: TanStack Router auto-generates routes from file structure
3. **State strategy**: React Query (server) + Zustand (editor) + useState (local)
4. **Design tokens**: Mandatory for all UI components (no hardcoded colors)
5. **YAML as source of truth**: Visual editor is representation of YAML structure

---

## Related Documents

- **Source code**: `docs/html-module/workflow-units.blade.php`
- **Functional spec**: `docs/workflow-units-functional-spec.md`
- **High-level plan**: `plans/workflow-units-migration-plan.md`
- **Design system**: `docs/design-system.md`
- **Route helpers**: `apps/web/src/shared/route-helpers.md`

---

**Next Step**: Review plan with stakeholders → Approve → Begin Phase 1
