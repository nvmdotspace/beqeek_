# Phase 7: Console Monitoring + Canvas Polish

**Date**: 2025-11-20 23:45
**Duration**: 2 weeks (10 days)
**Status**: 🟡 Planning
**Priority**: High

---

## Executive Summary

Dual-track implementation combining new WebSocket console monitoring with enhancements to existing React Flow canvas. Part A adds real-time workflow execution logs. Part B polishes visual editor with dynamic configuration forms, auto-layout, and undo/redo.

**Scope Division**:

- **Part A (Console)**: NEW - Real-time monitoring (40% effort)
- **Part B (Canvas)**: ENHANCEMENT - Visual editor polish (60% effort)

**Current Status**:

- ✅ React Flow canvas with drag-drop operational
- ✅ YAML bidirectional conversion working
- ✅ Connection validation with cycle detection
- ⚠️ Node configuration panel placeholder only
- ❌ Console monitoring not implemented
- ❌ Auto-layout installed but unused (dagre)
- ❌ Undo/redo not implemented

---

## Architecture Decisions

**Console Monitoring**:

- WebSocket endpoint: `ws://connect.o1erp.com`
- Virtual scrolling for 10k+ logs (react-window)
- IndexedDB persistence for offline replay
- Zustand store for console state isolation

**Canvas Polish**:

- Dynamic forms via registry pattern (avoid 16 hardcoded components)
- Dagre auto-layout (horizontal LR, 80px node spacing)
- Zundo middleware for undo/redo (50 history steps)
- React Hook Form for node configuration validation

---

## Implementation Phases

### Part A: Console Monitoring

**File**: [phase-7a-console-monitoring.md](./phase-7a-console-monitoring.md)
**Duration**: 4 days
**Effort**: 40%

**Deliverables**:

1. WebSocket hook with auto-reconnect
2. Console viewer with virtual scrolling
3. Log filtering (4 levels: debug/info/warn/error)
4. Search with regex support
5. Copy/clear/export actions
6. Connection status indicator
7. Auto-scroll toggle with bottom detection

### Part B: Canvas Polish

**File**: [phase-7b-canvas-polish.md](./phase-7b-canvas-polish.md)
**Duration**: 6 days
**Effort**: 60%

**Deliverables**:

1. Dynamic configuration forms (16 node types)
2. Auto-layout with Dagre algorithm
3. Undo/redo with Zundo (Cmd+Z, Cmd+Shift+Z)
4. Enhanced node selection (multi-select, Cmd+A)
5. Node alignment helpers (distribute, align edges)
6. Keyboard shortcuts (Del, Cmd+C/V, Escape)

---

## Technical Constraints

**Mandatory Requirements**:

- Design system compliance (no hardcoded colors)
- `@workspace/ui` components only
- TypeScript strict mode
- React Query for server state
- Zustand for editor/console state
- ARIA labels + keyboard navigation
- Mobile-responsive (responsive breakpoints)

**Performance Targets**:

- Console: 10k logs render < 500ms (virtual scrolling)
- Canvas: 100 nodes layout < 1s (Dagre optimization)
- Undo/redo: < 50ms state restoration
- WebSocket: < 100ms message latency

---

## Dependencies

**New Packages Required**:

```bash
pnpm add react-window @types/react-window   # Virtual scrolling
pnpm add zundo                               # Undo/redo middleware
pnpm add date-fns                           # Log timestamp formatting
```

**Already Installed**:

- `@xyflow/react`: ^12.9.3 ✅
- `dagre`: ^0.8.5 ✅
- `@types/dagre`: ^0.7.53 ✅

**Existing Files to Enhance**:

- `apps/web/src/features/workflows/utils/ir-to-reactflow.ts` (layout positions)
- `apps/web/src/features/workflows/utils/reactflow-to-ir.ts` (preserve metadata)
- `apps/web/src/features/workflows/stores/*` (add undo/redo slice)

---

## Success Criteria

**Part A - Console**:

- ✅ WebSocket connects and streams logs in real-time
- ✅ Renders 10k logs without lag (virtual scrolling)
- ✅ Filter/search works on large datasets
- ✅ Auto-reconnect on connection loss (max 5 retries)
- ✅ Connection status updates within 100ms

**Part B - Canvas**:

- ✅ All 16 node types have configuration forms
- ✅ Auto-layout creates readable flow in < 1s
- ✅ Undo/redo works for 50 operations
- ✅ Keyboard shortcuts match VS Code patterns
- ✅ Forms validate before saving (React Hook Form)

---

## Risk Assessment

**High Risks**:

1. **WebSocket reliability**: Mitigate with exponential backoff + heartbeat
2. **Console memory leak**: Implement log rotation (max 10k entries)
3. **Dagre layout quality**: Add manual override + position locking

**Medium Risks**:

1. **Form complexity**: Use registry pattern to avoid duplication
2. **Undo/redo state size**: Limit history to 50 operations
3. **Mobile responsiveness**: Test on small screens early

---

## Testing Strategy

**Unit Tests**:

- WebSocket hook reconnection logic
- Log filtering/search algorithms
- Dagre layout calculations
- Undo/redo state transitions

**Integration Tests**:

- Console + API log ingestion
- Canvas + configuration form sync
- Auto-layout + manual positioning

**E2E Tests** (Playwright):

- Console displays real logs from workflow execution
- User edits node config → saves → YAML updates
- Undo/redo preserves canvas state
- Auto-layout rearranges complex workflow

---

## Related Documents

**Research**:

- `plans/251119-2245-workflow-units-migration/plan.md` (parent plan)
- `plans/251119-2245-workflow-units-migration/phase-07-console-monitoring.md` (original spec)
- `apps/web/src/features/workflows/utils/*.ts` (existing YAML converters)

**Design System**:

- `docs/design-system.md` (UI standards)
- `packages/ui/src/components/*` (component library)

**Architecture**:

- `CLAUDE.md` (state management philosophy)
- `apps/web/src/shared/route-helpers.md` (routing patterns)

---

## Next Steps

1. **Review**: Stakeholder approval on scope split
2. **Part A**: Begin console monitoring (4 days)
3. **Part B**: Begin canvas polish (6 days)
4. **Integration**: Test combined workflow (2 days buffer)
5. **Deployment**: Merge to main after QA

---

**Estimated Completion**: 2025-12-04 (14 calendar days)
