# Workflow Units MVP - Comprehensive Test Scenarios

**Plan ID**: `251120-mvp-test-scenarios`
**Created**: 2025-11-20
**Status**: Ready for Execution
**Target Release**: MVP v1.0

---

## Executive Summary

Comprehensive test plan for Workflow Units MVP covering all implemented features across Phases 1-8, based on analysis of:

- 9-phase workflow migration plan (11 weeks)
- Phase 7 console & canvas polish implementation
- Phase 8 visual features (MiniMap + Export PNG)
- Current implementation gaps and pending enhancements

**Test Coverage**: 60+ test scenarios organized by feature area
**Estimated Execution Time**: 10-14 hours manual testing
**Target Pass Rate**: 90% for P0+P1 tests

---

## Implementation Status Summary

### ✅ Fully Implemented (Phases 1-5, 7B, 8)

- **Phase 1-2**: Foundation, routing, CRUD operations
- **Phase 3**: React Flow canvas with 16 node types
- **Phase 4**: YAML ↔ React Flow conversion (IR layer)
- **Phase 5**: Event management (4 trigger types)
- **Phase 7B**: Canvas polish (undo/redo, auto-layout, dynamic forms)
- **Phase 8**: Visual features (PNG export, MiniMap)

### ⏳ Planned But Not Tested

- **Phase 6**: Monaco YAML editor (not in MVP)
- **Phase 7A**: WebSocket console monitoring (implemented, not tested)

### 🟡 Partially Complete (P1 Enhancements)

- Keyboard shortcuts (Cmd+Shift+E export)
- MiniMap interactivity props
- Mobile responsive CSS
- Dark mode styling

---

## Test Scenario Categories

### 1. Authentication & Routing (2 tests)

- TC-AUTH-001: Authenticated access verification
- TC-AUTH-002: Unauthenticated redirect to login

### 2. Workflow Units CRUD (4 tests)

- TC-CRUD-001: List workflow units
- TC-CRUD-002: Create workflow unit
- TC-CRUD-003: Edit workflow unit metadata
- TC-CRUD-004: Delete workflow unit (soft delete)

### 3. Event Management (6 tests)

- TC-EVENT-001: List events in sidebar
- TC-EVENT-002: Create event with Schedule trigger (cron)
- TC-EVENT-003: Create event with Webhook trigger (auto-generated URL)
- TC-EVENT-004: Create event with Active Table trigger
- TC-EVENT-005: Edit event configuration
- TC-EVENT-006: Delete event

### 4. Visual Canvas Interactions (9 tests)

- TC-CANVAS-001: Add node from palette (drag-drop)
- TC-CANVAS-002: Connect two nodes (edge creation)
- TC-CANVAS-003: Node configuration panel (dynamic forms)
- TC-CANVAS-004: Delete node (with connections)
- TC-CANVAS-005: Multi-node selection (Cmd+Click)
- TC-CANVAS-006: Pan and zoom canvas (Space+drag, Ctrl+scroll)
- TC-CANVAS-007: Undo/Redo actions (50 steps, Cmd+Z)
- TC-CANVAS-008: Auto-layout (Dagre algorithm)
- TC-CANVAS-009: Save workflow (persist to backend)

### 5. YAML Conversion (4 tests)

- TC-YAML-001: Nodes → YAML conversion (IR serialization)
- TC-YAML-002: YAML → Nodes conversion (IR parsing)
- TC-YAML-003: Nested condition block handling
- TC-YAML-004: Nested loop block handling

### 6. Phase 8 Visual Features (7 tests)

- TC-EXPORT-001: Export PNG single node (2x retina) ✅ PASSED
- TC-EXPORT-002: Export PNG multi-node workflow ✅ PASSED
- TC-EXPORT-003: Export button disabled when empty
- TC-MINIMAP-001: MiniMap displays all nodes ✅ PASSED
- TC-MINIMAP-002: MiniMap interactivity ⏳ PENDING (P1 props)
- TC-MINIMAP-003: MiniMap responsive mobile ⏳ PENDING (CSS)
- TC-MINIMAP-004: MiniMap dark mode ⏳ PENDING (CSS)

### 7. Phase 7A Console Monitoring (5 tests) ⏳ NOT TESTED

- TC-CONSOLE-001: WebSocket connection
- TC-CONSOLE-002: Real-time log display
- TC-CONSOLE-003: Log filtering (by level)
- TC-CONSOLE-004: Log search (regex)
- TC-CONSOLE-005: IndexedDB persistence (7-day retention)

### 8. Error Handling & Edge Cases (4 tests)

- TC-ERROR-001: API failure handling (500 errors)
- TC-ERROR-002: Invalid YAML handling
- TC-ERROR-003: Large workflow performance (100+ nodes)
- TC-ERROR-004: Browser compatibility (Chrome, Firefox, Safari)

### 9. Accessibility & Usability (3 tests)

- TC-A11Y-001: Keyboard navigation (Tab, Enter, Cmd+Z, Delete)
- TC-A11Y-002: Screen reader support (VoiceOver/NVDA)
- TC-A11Y-003: Color contrast WCAG AA (4.5:1 ratio)

### 10. Integration Tests (3 tests)

- TC-INTEGRATION-001: End-to-end workflow creation & execution
- TC-INTEGRATION-002: Workflow copy/duplicate
- TC-INTEGRATION-003: Workflow export/import JSON

---

## Detailed Test Scenarios

### 1. Authentication & Routing

#### TC-AUTH-001: Authenticated Access ✅ P0

**Preconditions**: User logged in, workspace ID `732878538910205329`

**Steps**:

1. Navigate to `/vi/workspaces/{workspaceId}/workflow-units`
2. Verify page loads without redirect
3. Check workspace context available

**Expected**: Page loads, workspace name in breadcrumb, no 401/403 errors

---

#### TC-AUTH-002: Unauthenticated Redirect ✅ P0

**Preconditions**: User logged out, cookies cleared

**Steps**:

1. Navigate to workflow units page
2. Verify redirect behavior
3. Login and check return URL

**Expected**: Redirect to `/vi/login`, return URL preserved, redirect back after login

---

### 2. Workflow Units CRUD

#### TC-CRUD-001: List Workflow Units ✅ P0

**Steps**:

1. Navigate to workflow units list
2. Verify list renders
3. Check search, filter, pagination

**Expected**: All units displayed, search works, pagination if >20 items

---

#### TC-CRUD-002: Create Workflow Unit ✅ P0

**Steps**:

1. Click "Create Workflow Unit"
2. Fill form: Name "Test Workflow", Description "Test desc"
3. Click "Create"

**Expected**: Form validation, success toast, redirect to detail page, unit in list

---

#### TC-CRUD-003: Edit Workflow Unit Metadata ✅ P1

**Preconditions**: Unit ID `832082302203854849` exists

**Steps**:

1. Click "Edit" on workflow unit
2. Update name and description
3. Save changes

**Expected**: Edit dialog opens, values pre-filled, changes saved, toast appears, UI updates

---

#### TC-CRUD-004: Delete Workflow Unit ✅ P1

**Steps**:

1. Click "Delete" button
2. Confirm deletion dialog
3. Verify redirect to list

**Expected**: Confirmation dialog, warning message, success toast, soft delete (not hard)

---

### 3. Event Management

#### TC-EVENT-001: List Events ✅ P0

**Preconditions**: Unit has 2+ events

**Steps**:

1. Navigate to workflow unit detail
2. Check events sidebar
3. Verify event list displays

**Expected**: All events with names, status indicators, trigger badges, click → navigate

---

#### TC-EVENT-002: Create Event (Schedule Trigger) ✅ P0

**Steps**:

1. Click "Create Event"
2. Fill: Name "Daily Backup", Trigger "Schedule", Cron `0 2 * * *`
3. Create and verify redirect

**Expected**: Event created, redirect to editor, canvas empty, event in sidebar

---

#### TC-EVENT-003: Create Event (Webhook Trigger) ✅ P1

**Steps**:

1. Create event with Webhook trigger
2. Verify webhook URL generated
3. Check URL format

**Expected**: URL auto-generated `https://.../webhook/{eventId}`, copyable, event created

---

#### TC-EVENT-004: Create Event (Active Table Trigger) ✅ P1

**Preconditions**: At least 1 Active Table exists

**Steps**:

1. Create event with Active Table trigger
2. Select table from dropdown
3. Select action: create_record

**Expected**: Table dropdown populated, actions (create/update/delete), trigger config saved

---

#### TC-EVENT-005: Edit Event Configuration ✅ P1

**Preconditions**: Event ID `832086988889784321`

**Steps**:

1. Navigate to event edit page
2. Click "Event Settings"
3. Update name, active status, trigger config
4. Save

**Expected**: Settings dialog, values pre-filled, changes saved, sidebar updated

---

#### TC-EVENT-006: Delete Event ✅ P2

**Steps**:

1. Click "Delete Event"
2. Confirm deletion
3. Verify redirect

**Expected**: Confirmation dialog, success toast, event removed from sidebar

---

### 4. Visual Canvas Interactions

#### TC-CANVAS-001: Add Node from Palette ✅ P0

**Steps**:

1. Open node palette (left sidebar)
2. Find "User Operation" node
3. Click or drag to canvas

**Expected**: Node palette shows 16 types, node added, unique ID, centered position, undo enabled

---

#### TC-CANVAS-002: Connect Two Nodes ✅ P0

**Preconditions**: 2 nodes on canvas

**Steps**:

1. Hover over node, drag from output handle
2. Drop on target input handle

**Expected**: Connection handles visible, edge created, unique ID, validation passes

---

#### TC-CANVAS-003: Node Configuration Panel ✅ P0

**Preconditions**: "Log" node on canvas

**Steps**:

1. Click Log node to select
2. Config panel opens (right sidebar)
3. Update: Log Level "info" → "warn", Message "Test log"
4. Save or auto-save

**Expected**: Panel displays, form fields match schema, validation works, canvas updates, undo enabled

---

#### TC-CANVAS-004: Delete Node ✅ P0

**Steps**:

1. Select node
2. Press Delete or Backspace key

**Expected**: Node deleted, connected edges deleted, undo enabled, config panel closes

---

#### TC-CANVAS-005: Multi-Node Selection ✅ P1

**Preconditions**: 3+ nodes on canvas

**Steps**:

1. Click first node
2. Hold Cmd/Ctrl, click second node
3. Click third node

**Expected**: All selected (blue border), selection count indicator, drag together, delete with Delete key

---

#### TC-CANVAS-006: Pan and Zoom Canvas ✅ P1

**Preconditions**: 5+ nodes spread out

**Steps**:

1. Pan: Space + drag canvas
2. Zoom in: Ctrl + scroll up
3. Zoom out: Ctrl + scroll down
4. Fit View: Click "Fit View" button

**Expected**: Canvas pans smoothly, zoom 10%-200%, Fit View centers all, MiniMap updates

---

#### TC-CANVAS-007: Undo/Redo Actions ✅ P0

**Preconditions**: Canvas with 2 nodes

**Steps**:

1. Add 3rd node "Send Email"
2. Click Undo (or Cmd+Z)
3. Click Redo (or Cmd+Shift+Z)

**Expected**: Undo reverts last action, Redo reapplies, button states update, 50 steps tracked

---

#### TC-CANVAS-008: Auto-Layout ✅ P0

**Preconditions**: 5+ nodes unorganized

**Steps**:

1. Click "Auto-Layout" button
2. Wait for layout calculation

**Expected**: Nodes arranged left-to-right hierarchy, no overlaps, edges straightened, <1s, undo restores

---

#### TC-CANVAS-009: Save Workflow ✅ P0

**Preconditions**: Canvas modified with 3 nodes

**Steps**:

1. Click "Save Workflow" button
2. Wait for API call

**Expected**: Loading indicator, success toast, API POST succeeds, state persisted, reload restores changes

---

### 5. YAML Conversion

#### TC-YAML-001: Nodes → YAML Conversion ✅ P0

**Preconditions**: Canvas with Schedule trigger, Update User action, Condition logic

**Steps**:

1. Build workflow on canvas
2. Click "Save Workflow"
3. Inspect API payload (Network tab)

**Expected**: YAML structure correct (`events.{eventId}.steps[]`), node positions NOT in YAML, nested blocks handled, no data loss

---

#### TC-YAML-002: YAML → Nodes Conversion ✅ P0

**Preconditions**: Event with saved YAML workflow

**Steps**:

1. Navigate to event edit page
2. Wait for canvas to load

**Expected**: All nodes rendered, connections restored, configs populated, auto-layout if no positions, no data loss

---

#### TC-YAML-003: Nested Condition Block ✅ P1

**Steps**:

1. Add Condition node: `user.role === "admin"`
2. True branch: Send Email, False branch: Log
3. Save, reload, verify structure

**Expected**: Condition has 2 outputs, true/false branches preserved, nested steps render, no data loss

---

#### TC-YAML-004: Nested Loop Block ✅ P1

**Steps**:

1. Add Loop node over `users` array
2. Loop body: Send Email → Log
3. Save, reload

**Expected**: Loop renders with nested steps, loop body indented in YAML, iterator preserved, no infinite loops

---

### 6. Phase 8 Visual Features

#### TC-EXPORT-001: Export PNG (Single Node) ✅ P0 PASSED

**Preconditions**: Canvas with 1 node, event "Test Daily Sync"

**Steps**:

1. Click "Export PNG" button
2. Wait for export, check toast, verify download

**Expected**: Success toast, PNG downloaded `test_daily_sync.png`, 2x retina, UI excluded

**Status**: ✅ PASSED (Chrome DevTools MCP on 2025-11-20)

---

#### TC-EXPORT-002: Export PNG (Multi-Node) ✅ P0 PASSED

**Preconditions**: Canvas with 10+ nodes, auto-layout applied

**Steps**:

1. Create complex workflow
2. Click Auto-Layout, then Export PNG

**Expected**: All nodes visible, edges correct, layout preserved, <1s export, <5MB file

**Status**: ✅ PASSED (Chrome DevTools MCP on 2025-11-20)

---

#### TC-EXPORT-003: Export Button Disabled ✅ P1

**Preconditions**: Canvas empty (0 nodes)

**Steps**:

1. Navigate to event editor
2. Check "Export PNG" button state

**Expected**: Button disabled (grayed), tooltip "Add nodes to export", enabled after adding node

---

#### TC-MINIMAP-001: MiniMap Displays All Nodes ✅ P0 PASSED

**Preconditions**: Canvas with 5 nodes

**Steps**:

1. Add 5 nodes to canvas
2. Check MiniMap (bottom-right)

**Expected**: Shows all 5 nodes, colors (triggers=blue, actions=green, logic=teal), real-time updates, viewport indicator

**Status**: ✅ PASSED (Chrome DevTools MCP on 2025-11-20)

---

#### TC-MINIMAP-002: MiniMap Interactivity 🟡 P1 PENDING

**Preconditions**: Canvas with 10+ nodes

**Steps**:

1. Click on MiniMap
2. Drag viewport indicator

**Expected**: MiniMap pannable, canvas pans to clicked location, viewport updates, zoomable if prop added

**Status**: ⏳ PENDING (P1 props `pannable`, `zoomable` not added yet)

---

#### TC-MINIMAP-003: MiniMap Responsive (Mobile) 🟡 P1 PENDING

**Preconditions**: Browser width < 768px

**Steps**:

1. Resize browser to 375px width
2. Check MiniMap visibility

**Expected**: MiniMap hidden on mobile (<768px), canvas fully visible, toolbar responsive

**Status**: ⏳ PENDING (Mobile responsive CSS not added yet)

---

#### TC-MINIMAP-004: MiniMap Dark Mode 🟡 P1 PENDING

**Preconditions**: Dark mode enabled

**Steps**:

1. Toggle dark mode
2. Check MiniMap styling

**Expected**: Background `hsl(var(--card))`, border `hsl(var(--border))`, mask `rgba(0, 0, 0, 0.2)`, readable

**Status**: ⏳ PENDING (Dark mode CSS not added yet)

---

### 7. Phase 7A Console Monitoring (NOT TESTED)

#### TC-CONSOLE-001: WebSocket Connection ⏳ P0

**Expected**: WebSocket URL `ws://connect.o1erp.com?sys={workspaceId}&token=nvmteam&response_id={responseId}`, status "Connected", auto-reconnect, heartbeat 30s

**Status**: ⏳ NOT TESTED (Feature planned but not tested)

---

#### TC-CONSOLE-002: Real-Time Log Display ⏳ P1

**Expected**: Logs appear <100ms, format `[timestamp] [level] message`, levels (debug/info/warn/error), virtual scrolling (10k logs)

**Status**: ⏳ NOT TESTED

---

#### TC-CONSOLE-003: Log Filtering ⏳ P1

**Expected**: Filter by level, filter count updates, clear filter button

**Status**: ⏳ NOT TESTED

---

#### TC-CONSOLE-004: Log Search ⏳ P2

**Expected**: Search by keyword, regex support, search count displayed

**Status**: ⏳ NOT TESTED

---

#### TC-CONSOLE-005: IndexedDB Persistence ⏳ P2

**Expected**: Logs restored from IndexedDB, 7-day retention, old logs auto-deleted

**Status**: ⏳ NOT TESTED

---

### 8. Error Handling & Edge Cases

#### TC-ERROR-001: API Failure Handling ✅ P0

**Preconditions**: Mock 500 error from backend

**Expected**: Error toast "Failed to save workflow", retry button, no data loss (local state preserved), console error logged

---

#### TC-ERROR-002: Invalid YAML Handling ✅ P1

**Preconditions**: Backend returns corrupted YAML

**Expected**: Error toast "Invalid workflow format", canvas empty state, option to reset, no app crash

---

#### TC-ERROR-003: Large Workflow Performance ✅ P1

**Preconditions**: Workflow with 100 nodes

**Steps**: Test pan/zoom, save, auto-layout, export PNG

**Expected**: Canvas 60fps, save <2s, auto-layout <3s, export <5s, no freeze

---

#### TC-ERROR-004: Browser Compatibility ✅ P1

**Steps**: Test same workflow in Chrome, Firefox, Safari

**Expected**: All features work, no visual regressions, export PNG works (Safari may differ), acceptable performance

**Status**: ⏳ PENDING (Firefox/Safari not tested yet)

---

### 9. Accessibility & Usability

#### TC-A11Y-001: Keyboard Navigation ✅ P1

**Steps**: Tab through UI, arrow keys, Enter to activate, Cmd+Z undo, Delete to remove

**Expected**: All interactive elements focusable, focus indicators visible, shortcuts work, can create workflow without mouse

---

#### TC-A11Y-002: Screen Reader Support ✅ P2

**Expected**: Buttons have ARIA labels, node types announced, canvas changes announced, error messages read aloud

---

#### TC-A11Y-003: Color Contrast WCAG AA ✅ P1

**Steps**: Check text on backgrounds, button states, node colors with DevTools

**Expected**: All text meets WCAG AA (4.5:1), interactive elements distinguishable, node colors distinct

---

### 10. Integration Tests

#### TC-INTEGRATION-001: End-to-End Workflow Creation ✅ P0

**Steps**:

1. Create workflow unit "E2E Test Workflow"
2. Create event "Schedule Daily Report" (cron `0 9 * * *`)
3. Add nodes: Schedule trigger, Query Active Table, Condition (if records > 0), Send Email (true), Log (false)
4. Configure all nodes, connect, save, activate
5. Wait for execution (next day 9am), check console logs

**Expected**: All steps complete, workflow executes at scheduled time, console shows logs, email sent if condition met

---

#### TC-INTEGRATION-002: Workflow Copy/Duplicate ✅ P2

**Steps**: Duplicate workflow with 5+ nodes

**Expected**: New workflow " (Copy)", all nodes duplicated, node IDs regenerated, no references to original

---

#### TC-INTEGRATION-003: Workflow Export/Import JSON ✅ P2

**Steps**: Export as JSON, save file, create new workflow, import JSON, verify restored

**Expected**: JSON valid format, import reconstructs workflow, all data preserved, node positions preserved

---

## Test Execution Strategy

### Phase 1: Smoke Tests (1 hour) - P0 Critical Path

**Goal**: Verify core functionality
**Tests**: TC-AUTH-001, TC-CRUD-001, TC-CRUD-002, TC-EVENT-001, TC-EVENT-002, TC-CANVAS-001, TC-CANVAS-002, TC-CANVAS-009
**Success Criteria**: 8/8 tests pass

### Phase 2: Core Functionality (3 hours) - P0 + P1

**Goal**: Test all implemented features
**Tests**: All TC-CRUD (4), TC-EVENT (6), TC-CANVAS (9), TC-YAML (4), TC-EXPORT (2), TC-MINIMAP (1)
**Success Criteria**: 90% pass rate

### Phase 3: Visual Features (2 hours) - Phase 8 Validation

**Goal**: Verify Phase 8 export and minimap
**Tests**: TC-EXPORT (3), TC-MINIMAP (4)
**Success Criteria**: All tests pass

### Phase 4: Console Monitoring (2 hours) - Phase 7A (If Implemented)

**Goal**: Validate WebSocket console
**Tests**: TC-CONSOLE (5)
**Success Criteria**: All tests pass
**Status**: ⏳ DEFERRED (Feature planned but not tested)

### Phase 5: Error Handling (2 hours) - P1 Robustness

**Goal**: Test edge cases and errors
**Tests**: TC-ERROR (4)
**Success Criteria**: All tests pass

### Phase 6: Accessibility (1 hour) - P1-P2 Compliance

**Goal**: WCAG AA compliance
**Tests**: TC-A11Y (3)
**Success Criteria**: All tests pass

### Phase 7: Integration Tests (3 hours) - P0 E2E

**Goal**: Full workflow lifecycle
**Tests**: TC-INTEGRATION (3)
**Success Criteria**: All tests pass

**Total Estimated Time**: 10-14 hours (manual testing)

---

## Test Environment Configuration

### Development

```bash
pnpm dev  # Runs on localhost:4173

# Test IDs:
Workspace ID:  732878538910205329
Unit ID:       832082302203854849
Event ID:      832086988889784321
```

### Test URLs

- List: `http://localhost:4173/vi/workspaces/732878538910205329/workflow-units`
- Detail: `http://localhost:4173/vi/workspaces/732878538910205329/workflow-units/832082302203854849`
- Event Edit: `http://localhost:4173/vi/workspaces/732878538910205329/workflow-units/832082302203854849/events/832086988889784321/edit`
- Console: `http://localhost:4173/vi/workspaces/732878538910205329/workflow-units/832082302203854849/events/832086988889784321/console`

---

## MVP Release Criteria

### Critical (Must Pass)

- ✅ 100% of P0 tests pass
- ✅ 0 critical bugs
- ✅ API integration functional
- ✅ Data persistence working
- ✅ No console errors

### Important (Should Pass)

- ✅ 90% of P1 tests pass
- ✅ < 5 minor bugs
- ✅ Performance acceptable (<3s load)
- ✅ Works in Chrome, Firefox, Safari

### Nice to Have (Can Defer)

- ✅ 80% of P2 tests pass
- ✅ Accessibility WCAG AA
- ✅ Mobile responsive
- ✅ Dark mode

---

## Known Gaps & Mitigation

### Phase 6: Monaco Editor ⏳ NOT IN MVP

- YAML code editor not implemented
- Dual-mode toggle pending
- Syntax validation pending

**Impact**: Medium - Power users prefer code editing
**Mitigation**: Plan for Phase 6 in MVP+1

### Phase 7A: Console Monitoring ⏳ PARTIALLY IMPLEMENTED

- WebSocket implementation exists but not tested
- IndexedDB persistence not tested
- Log filtering not tested

**Impact**: Medium - Debugging workflows harder
**Mitigation**: Test before production launch

### Phase 8: P1 Enhancements ⏳ PENDING

- Keyboard shortcut (Cmd+Shift+E) missing
- Timestamp in filename missing
- MiniMap props (pannable, zoomable) missing
- Mobile responsive CSS missing
- Dark mode CSS missing

**Impact**: Low - Core functionality works
**Mitigation**: Add in Phase 8.1 (1.5 hours)

---

## Test Automation Roadmap

### Unit Tests (Vitest)

- YAML conversion utilities
- Node validation schemas
- Filename sanitization
- Auto-layout algorithm
- Store actions (Zustand)

### Integration Tests (Playwright)

- API client methods
- React Query hooks
- WebSocket connection
- IndexedDB operations

### E2E Tests (Playwright)

- Critical user flows (P0 tests)
- Workflow creation
- Event management
- Canvas interactions
- Export PNG

**Recommendation**: Prioritize E2E tests for P0 critical path

---

## Pre-MVP Launch Checklist

- [ ] All P0 tests executed and passed
- [ ] All P1 tests executed (>90% pass rate)
- [ ] Browser compatibility tested (Chrome, Firefox, Safari)
- [ ] API integration verified
- [ ] Data persistence verified
- [ ] Error handling verified
- [ ] Performance benchmarks met
- [ ] No critical bugs
- [ ] No console errors
- [ ] Documentation updated

---

## Post-MVP Monitoring

- [ ] Monitor production errors (Sentry)
- [ ] Collect user feedback
- [ ] Track usage analytics
- [ ] Identify pain points
- [ ] Plan Phase 8.1 enhancements
- [ ] Plan Phase 6 (Monaco Editor)
- [ ] Plan Phase 7A testing (Console)

---

**Plan Status**: ✅ Ready for Execution

**Next Steps**:

1. Execute Phase 1 Smoke Tests (1 hour)
2. Execute Phase 2 Core Functionality (3 hours)
3. Execute Phase 3 Visual Features (2 hours)
4. Document results in test report
5. Fix critical bugs if any
6. Re-test and validate
7. Approve for production launch

---

**References**:

- `/plans/251119-2245-workflow-units-migration/` - 9-phase migration plan
- `/plans/251120-1303-phase-8-visual-features/` - Phase 8 visual features implementation
- `/plans/251120-1303-phase-8-visual-features/PHASE_8_GAP_ANALYSIS.md` - Gap analysis
- `/plans/251120-1303-phase-8-visual-features/FINAL_MVP_TEST_REPORT.md` - Phase 8 test results
- `/plans/251120-2345-phase-7-console-canvas/` - Phase 7 console & canvas polish

**Plan Author**: Workflow Units Test Team
**Review Date**: 2025-11-20
**Approval Status**: Ready for Execution
