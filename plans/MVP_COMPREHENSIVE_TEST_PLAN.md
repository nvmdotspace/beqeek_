# MVP Comprehensive Test Plan - Workflow Units Module

**Date Created**: 2025-11-20
**Module**: Workflow Units (Event Management & Visual Builder)
**Target**: Production MVP Release
**Test Coverage**: Phase 1-8 (All implemented features)

---

## Executive Summary

### Implementation Status

| Phase     | Feature             | Status      | Lines of Code | Test Status        |
| --------- | ------------------- | ----------- | ------------- | ------------------ |
| Phase 1-3 | Foundation & Core   | ✅ Complete | ~2,000        | ⏳ Pending         |
| Phase 4   | Event Management    | ✅ Complete | ~1,500        | ⏳ Pending         |
| Phase 5   | YAML Converter      | ✅ Complete | ~800          | ⏳ Pending         |
| Phase 6   | Visual Builder Core | ✅ Complete | ~1,200        | ⏳ Pending         |
| Phase 7A  | Console Monitoring  | ✅ Complete | ~600          | ⏳ Pending         |
| Phase 7B  | Canvas Polish       | ✅ Complete | ~400          | ✅ Tested          |
| Phase 8   | Visual Features     | ✅ Complete | ~300          | ✅ Tested          |
| **TOTAL** | **All Features**    | **✅ 100%** | **~6,800**    | **⏳ In Progress** |

### Test Strategy

- **Manual Testing**: MCP Chrome DevTools for UI/UX validation
- **Screenshot Documentation**: Visual evidence for each feature
- **Test Cases**: 50+ comprehensive scenarios
- **Browsers**: Chrome (primary), Firefox/Safari (smoke test)
- **Environment**: localhost:4173 (dev) → staging → production

---

## Phase-by-Phase Feature Breakdown

### Phase 1-3: Foundation & Core Setup

**Features Implemented**:

1. ✅ Project structure (`apps/web/src/features/workflow-units/`)
2. ✅ API client (`api/workflow-units-client.ts`)
3. ✅ Type definitions (`api/types.ts`)
4. ✅ React Query hooks (`hooks/`)
5. ✅ TanStack Router routes (`routes/$locale/workspaces/$workspaceId/workflow-units/**`)
6. ✅ Base components (layouts, error boundaries)

**Test Cases**:

```
TC-001: API Client Integration
  ✓ List workflow units (GET)
  ✓ Get single unit (GET by ID)
  ✓ Create unit (POST)
  ✓ Update unit (PATCH)
  ✓ Delete unit (DELETE)
  ✓ Error handling (404, 500, network)

TC-002: Routing
  ✓ Navigate to /workflow-units (list)
  ✓ Navigate to /workflow-units/create (create form)
  ✓ Navigate to /workflow-units/{id} (detail)
  ✓ Navigate to /workflow-units/{id}/events (events list)
  ✓ 404 handling for invalid IDs
  ✓ Breadcrumb navigation

TC-003: State Management
  ✓ React Query caching
  ✓ Optimistic updates
  ✓ Mutation success/error handling
  ✓ Query invalidation on mutations
```

**Screenshot Requirements**:

- [ ] Units list page (empty state)
- [ ] Units list page (with data)
- [ ] Create unit dialog
- [ ] Unit detail page
- [ ] Error states (404, network error)

---

### Phase 4: Event Management

**Features Implemented**:

1. ✅ Workflow events CRUD operations
2. ✅ Event list sidebar
3. ✅ Event source types (SCHEDULE, WEBHOOK, ACTIVE_TABLE, OPTIN_FORM)
4. ✅ Event activation toggle
5. ✅ Event editor routing
6. ✅ Console routing

**Test Cases**:

```
TC-101: Event List Sidebar
  ✓ Display all events for a unit
  ✓ Show event name, status (Active/Inactive)
  ✓ Show event source type badge
  ✓ Click event to navigate to editor
  ✓ Highlight selected event
  ✓ Empty state when no events

TC-102: Create Event
  ✓ Open create dialog
  ✓ Fill event name (required validation)
  ✓ Select event source type (dropdown)
  ✓ Configure source params (conditional fields)
  ✓ Submit and create event
  ✓ Success toast notification
  ✓ Auto-navigate to editor

TC-103: Event Activation Toggle
  ✓ Toggle event active/inactive
  ✓ Update API call
  ✓ Badge color change (green/gray)
  ✓ Toast notification
  ✓ Optimistic update

TC-104: Event Source Configuration
  ✓ SCHEDULE: Cron expression editor
  ✓ WEBHOOK: Webhook URL display
  ✓ ACTIVE_TABLE: Table + action selector
  ✓ OPTIN_FORM: Form selector
  ✓ Validation for each type

TC-105: Event Actions Menu
  ✓ Edit event name
  ✓ Duplicate event
  ✓ Delete event (confirmation)
  ✓ View console logs
  ✓ Test workflow execution
```

**Screenshot Requirements**:

- [ ] Event list sidebar (populated)
- [ ] Create event dialog (each source type)
- [ ] Event active toggle (before/after)
- [ ] Event actions menu
- [ ] Delete confirmation dialog

---

### Phase 5: YAML Converter

**Features Implemented**:

1. ✅ YAML → React Flow converter (`yamlToReactFlow`)
2. ✅ React Flow → YAML converter (`reactFlowToYAML`)
3. ✅ YAML validation with Zod schemas
4. ✅ Error handling (`YAMLParseError`)
5. ✅ Topological sort (circular dependency detection)
6. ✅ 17 node types mapping
7. ✅ **YAML parse error display fix** (today's fix)

**Test Cases**:

```
TC-201: YAML to React Flow Conversion
  ✓ Parse valid YAML with all node types
  ✓ Convert trigger config
  ✓ Convert steps to nodes
  ✓ Convert blocks hierarchy to edges
  ✓ Handle empty YAML (no steps)
  ✓ Handle minimal workflow (trigger only)

TC-202: React Flow to YAML Conversion
  ✓ Convert nodes back to YAML steps
  ✓ Maintain step order (topological sort)
  ✓ Preserve trigger config
  ✓ Preserve node data (inputs, config)
  ✓ Handle empty canvas
  ✓ Handle disconnected nodes

TC-203: YAML Validation Errors (NEW - Fixed Today)
  ✓ Invalid YAML syntax (missing colon, indent)
  ✓ Missing required fields (trigger, steps)
  ✓ Invalid field types (string vs object)
  ✓ Trailing keys without values (blocks:)
  ✓ Circular dependencies
  ✓ Display error alert in canvas header ✅ FIXED
  ✓ Show detailed error message

TC-204: Round-trip Fidelity
  ✓ YAML → React Flow → YAML (no data loss)
  ✓ Compare normalized outputs
  ✓ Preserve comments (if possible)
  ✓ Preserve formatting preferences
```

**Screenshot Requirements**:

- [x] YAML parse error alert (captured today) ✅
- [ ] Valid YAML loaded successfully
- [ ] Empty workflow (no steps)
- [ ] Complex workflow (10+ nodes)

---

### Phase 6: Visual Builder Core

**Features Implemented**:

1. ✅ React Flow canvas setup
2. ✅ 17 custom node components
3. ✅ Node palette (drag-and-drop)
4. ✅ Edge connections
5. ✅ Node configuration panel
6. ✅ Zustand editor store
7. ✅ Canvas controls (zoom, pan, fit view)
8. ✅ Background grid

**Node Types**:

- Triggers: schedule, webhook, form_submit, table_action
- Actions: table_operation, send_email, google_sheet, api_call, user_operation, delay, log
- Logic: condition, match, loop, math, variables, debug_log

**Test Cases**:

```
TC-301: Node Palette
  ✓ Display all 17 node types
  ✓ Grouped by category (Triggers, Actions, Logic)
  ✓ Drag node from palette
  ✓ Drop node onto canvas
  ✓ Node created at drop position
  ✓ Unique ID generated

TC-302: Node Selection
  ✓ Click node to select
  ✓ Show selection ring
  ✓ Display config panel
  ✓ Multi-select (Ctrl+Click)
  ✓ Deselect (click background)

TC-303: Node Connections
  ✓ Drag from source handle
  ✓ Drop on target handle
  ✓ Edge created with animation
  ✓ Prevent circular dependencies (optional)
  ✓ Delete edge (select + Delete key)
  ✓ Edge styling (arrow, color)

TC-304: Node Configuration Panel
  ✓ Display selected node info
  ✓ Show node type icon + name
  ✓ Show node ID
  ✓ Show node description
  ✓ Display current data (JSON preview)
  ✓ Empty state when no selection

TC-305: Canvas Controls
  ✓ Zoom in/out buttons
  ✓ Fit view button
  ✓ Mouse wheel zoom
  ✓ Pan with drag (Space + drag)
  ✓ Reset zoom (double-click background)

TC-306: Node Operations
  ✓ Delete node (select + Delete key)
  ✓ Duplicate node (Ctrl+D)
  ✓ Copy/paste (Ctrl+C/Ctrl+V)
  ✓ Move node (drag)
  ✓ Snap to grid (optional)
```

**Screenshot Requirements**:

- [ ] Empty canvas (initial state)
- [ ] Node palette expanded
- [ ] Single node on canvas (selected)
- [ ] Multiple nodes with edges
- [ ] Node configuration panel (each node type)
- [ ] Canvas controls (zoom, pan, fit)

---

### Phase 7A: Console Monitoring

**Features Implemented**:

1. ✅ WebSocket connection (`use-console-websocket.ts`)
2. ✅ Console viewer component
3. ✅ Virtual scrolling (react-window v2.x)
4. ✅ Log filtering (by level, search)
5. ✅ Auto-reconnect with exponential backoff
6. ✅ Real-time log streaming
7. ✅ 10k log limit (memory management)

**Test Cases**:

```
TC-401: WebSocket Connection
  ✓ Connect on page load
  ✓ Show "Connected" status
  ✓ Receive real-time logs
  ✓ Display connection errors
  ✓ Auto-reconnect on disconnect
  ✓ Exponential backoff (1s, 2s, 5s, 10s, 30s)
  ✓ Ping/pong heartbeat

TC-402: Console Viewer
  ✓ Display logs in reverse chronological order
  ✓ Show timestamp, level, message
  ✓ Color-code by level (debug, info, warn, error)
  ✓ Virtual scrolling (performance)
  ✓ Auto-scroll to bottom (toggleable)
  ✓ Handle 10k+ logs without lag

TC-403: Log Filtering
  ✓ Filter by level (checkboxes)
  ✓ Search by keyword (debounced input)
  ✓ Filter by event ID
  ✓ Filter by execution ID
  ✓ Clear filters button
  ✓ Update count badge

TC-404: Log Details
  ✓ Expand log for full message
  ✓ Show metadata (event, step, execution)
  ✓ Copy log JSON
  ✓ Download logs (CSV, JSON)

TC-405: Empty States
  ✓ No logs yet
  ✓ No logs match filters
  ✓ Connection error state
```

**Screenshot Requirements**:

- [ ] Console page (empty state)
- [ ] Console with logs (various levels)
- [ ] Filter UI (expanded)
- [ ] Search in action
- [ ] Connection status indicators
- [ ] Log detail expanded

---

### Phase 7B: Canvas Polish (Undo/Redo + Auto-Layout)

**Features Implemented**:

1. ✅ Zundo temporal middleware (undo/redo)
2. ✅ 50-step history
3. ✅ Undo/Redo buttons
4. ✅ Keyboard shortcuts (Cmd+Z, Cmd+Shift+Z)
5. ✅ Dagre auto-layout algorithm
6. ✅ Auto-Layout button
7. ✅ Keyboard shortcut (Cmd+Shift+L)
8. ✅ Toast notifications

**Test Cases**:

```
TC-501: Undo/Redo Functionality
  ✓ Add node → Undo → Node removed
  ✓ Delete node → Undo → Node restored
  ✓ Move node → Undo → Node position reset
  ✓ Connect edges → Undo → Edge removed
  ✓ Redo after undo → Action restored
  ✓ Redo disabled at latest state
  ✓ Undo disabled at initial state

TC-502: Undo/Redo UI
  ✓ Undo button enabled after action
  ✓ Redo button enabled after undo
  ✓ Button tooltips show shortcuts
  ✓ Buttons update on state change
  ✓ Toast notifications (optional)

TC-503: Keyboard Shortcuts
  ✓ Cmd+Z triggers undo
  ✓ Cmd+Shift+Z triggers redo
  ✓ Ctrl+Y triggers redo (Windows)
  ✓ Shortcuts work in canvas focus
  ✓ Shortcuts disabled in input fields

TC-504: Auto-Layout
  ✓ Click Auto-Layout button
  ✓ Nodes arranged left-to-right
  ✓ Proper spacing (80px horiz, 120px vert)
  ✓ Trigger nodes at start
  ✓ Logic nodes follow flow
  ✓ No overlapping nodes
  ✓ Toast success notification

TC-505: Auto-Layout with Undo
  ✓ Auto-layout → Undo → Original positions
  ✓ Auto-layout → Redo → Layout reapplied
  ✓ Manual move → Auto-layout → New layout
```

**Screenshot Requirements**:

- [x] Undo/Redo buttons (before action) ✅ Tested
- [x] Undo/Redo buttons (after action) ✅ Tested
- [x] Auto-layout button ✅ Tested
- [x] Canvas before auto-layout ✅ Tested
- [x] Canvas after auto-layout ✅ Tested
- [x] Toast notifications ✅ Tested

---

### Phase 8: Visual Features (MiniMap + Export)

**Features Implemented**:

1. ✅ React Flow MiniMap component
2. ✅ Custom node colors (trigger=blue, log=green, logic=teal)
3. ✅ PNG export with html-to-image
4. ✅ Export button in toolbar
5. ✅ 2x retina quality
6. ✅ UI element filtering (minimap, controls excluded)
7. ✅ Filename sanitization
8. ✅ Toast notifications
9. ✅ Loading states

**Test Cases**:

```
TC-601: MiniMap Display
  ✓ MiniMap visible at bottom-right
  ✓ Shows all canvas nodes
  ✓ Updates in real-time on node move
  ✓ Color-coded nodes (blue/green/teal)
  ✓ Viewport rectangle visible
  ✓ Click minimap to pan canvas

TC-602: MiniMap Interaction
  ✓ Drag viewport in minimap
  ✓ Canvas follows minimap pan
  ✓ Zoom updates minimap scale
  ✓ Add node → Minimap updates
  ✓ Delete node → Minimap updates

TC-603: Export PNG Button
  ✓ Button visible in toolbar
  ✓ Button disabled when no nodes
  ✓ Button enabled with 1+ nodes
  ✓ Loading state during export
  ✓ Success toast on complete
  ✓ Error toast on failure

TC-604: PNG Export Quality
  ✓ File downloads to browser
  ✓ Filename format: {event_name}.png
  ✓ 2x pixel ratio (retina quality)
  ✓ UI elements filtered (no minimap in PNG)
  ✓ No controls visible in PNG
  ✓ All nodes visible in PNG
  ✓ Edges visible in PNG

TC-605: Export with Multiple Nodes
  ✓ Export 1 node → Single node in PNG
  ✓ Export 3 nodes → All nodes in PNG
  ✓ Export 10+ nodes → All visible
  ✓ Export after auto-layout → Layout preserved
  ✓ Export empty canvas → Error message
```

**Screenshot Requirements**:

- [x] MiniMap visible (bottom-right) ✅ Tested
- [x] MiniMap with 3 nodes ✅ Tested
- [x] Export button (enabled) ✅ Tested
- [x] Export button (disabled) ✅ Tested
- [x] Export loading state ✅ Tested
- [x] Export success toast ✅ Tested
- [ ] Exported PNG file (open in image viewer)

---

## Integration Test Scenarios

### Scenario 1: Complete Workflow Creation

```
User Story: Create a scheduled workflow that sends email notifications

Steps:
1. Navigate to /workflow-units
2. Click "Create Unit" → Fill name → Submit
3. Navigate to unit detail
4. Click "Create Event" → Select SCHEDULE → Configure cron → Submit
5. Event editor loads (visual mode)
6. Drag "Schedule" trigger to canvas
7. Drag "Send Email" node to canvas
8. Connect trigger → email node
9. Click email node → Configure in panel
10. Click "Auto-Layout" → Verify layout
11. Click "Export PNG" → Verify download
12. Click "Save Workflow" → Verify YAML saved
13. Toggle event active → Verify status

Expected Results:
✓ All steps complete without errors
✓ Visual builder updates in real-time
✓ YAML conversion successful
✓ PNG export includes all nodes
✓ Event activates successfully
✓ Console shows execution logs (if triggered)
```

### Scenario 2: Error Handling Flow

```
User Story: Handle YAML parsing errors gracefully

Steps:
1. Navigate to event with broken YAML (trailing "blocks:")
2. Verify error alert displays
3. Read error message (clear, actionable)
4. Cannot edit canvas (error state)
5. Fix YAML in backend or create new event
6. Reload page → Verify loads correctly

Expected Results:
✓ Error alert visible (red banner)
✓ Error message detailed (Zod validation)
✓ Canvas in read-only mode
✓ No console errors
✓ Graceful degradation
```

### Scenario 3: Multi-User Workflow Editing

```
User Story: Collaborate on workflow design

Steps:
1. User A opens event editor
2. User A adds 5 nodes + connects edges
3. User A saves workflow
4. User B opens same event (different browser/tab)
5. User B sees User A's changes
6. User B adds 3 more nodes
7. User B saves workflow
8. User A refreshes → Sees User B's changes

Expected Results:
✓ React Query refetches on window focus
✓ No data loss on concurrent edits
✓ Last save wins (no conflict resolution yet)
✓ Both users see final state after refresh
```

---

## Cross-Browser Testing Matrix

| Feature        | Chrome 142+ | Firefox 115+ | Safari 17+ | Edge 120+  |
| -------------- | ----------- | ------------ | ---------- | ---------- |
| Visual Builder | ✅ Primary  | ⏳ Pending   | ⏳ Pending | ⏳ Pending |
| Drag & Drop    | ✅ Tested   | ⏳ Pending   | ⏳ Pending | ⏳ Pending |
| WebSocket      | ✅ Tested   | ⏳ Pending   | ⏳ Pending | ⏳ Pending |
| PNG Export     | ✅ Tested   | ⏳ Pending   | ⏳ Pending | ⏳ Pending |
| Undo/Redo      | ✅ Tested   | ⏳ Pending   | ⏳ Pending | ⏳ Pending |
| Auto-Layout    | ✅ Tested   | ⏳ Pending   | ⏳ Pending | ⏳ Pending |

**Priority**: Chrome first (95% users), then Firefox/Safari smoke test.

---

## Performance Benchmarks

### Target Metrics

| Metric                      | Target | Current | Status |
| --------------------------- | ------ | ------- | ------ |
| Initial page load           | <2s    | TBD     | ⏳     |
| Canvas render (10 nodes)    | <100ms | TBD     | ⏳     |
| Canvas render (100 nodes)   | <500ms | TBD     | ⏳     |
| YAML parse time             | <50ms  | TBD     | ⏳     |
| PNG export time             | <500ms | TBD     | ⏳     |
| Auto-layout time (50 nodes) | <200ms | TBD     | ⏳     |
| WebSocket message delay     | <100ms | TBD     | ⏳     |
| Bundle size increase        | <500kb | ~150kb  | ✅     |

### Load Testing

```
Scenarios:
- 10 concurrent users editing workflows
- 100 WebSocket connections streaming logs
- 1000 events per workspace
- 50 nodes per workflow
- 10k console logs per event
```

---

## Accessibility Checklist

### WCAG 2.1 AA Compliance

- [ ] Keyboard navigation (Tab, Arrow keys, Enter, Escape)
- [ ] Screen reader support (ARIA labels, roles)
- [ ] Color contrast (4.5:1 for text, 3:1 for UI)
- [ ] Focus indicators (visible outline)
- [ ] Skip links (skip to main content)
- [ ] Alt text for icons
- [ ] Form labels and error messages
- [ ] Semantic HTML (headings, lists, landmarks)

### Keyboard Shortcuts Reference

| Shortcut             | Action                       |
| -------------------- | ---------------------------- |
| Cmd+Z / Ctrl+Z       | Undo                         |
| Cmd+Shift+Z / Ctrl+Y | Redo                         |
| Cmd+Shift+L          | Auto-layout                  |
| Cmd+Shift+E          | Export PNG (not implemented) |
| Delete               | Delete selected nodes/edges  |
| Cmd+C / Ctrl+C       | Copy (future)                |
| Cmd+V / Ctrl+V       | Paste (future)               |
| Space+Drag           | Pan canvas                   |
| Mouse Wheel          | Zoom                         |

---

## Security Testing

### XSS Prevention

```
TC-801: Input Sanitization
  ✓ Event name with <script> tags → Escaped
  ✓ YAML with malicious code → Validation error
  ✓ Node config with HTML → Sanitized
  ✓ Console logs with XSS payload → Escaped

TC-802: API Security
  ✓ Authorization header required
  ✓ Workspace ID validation
  ✓ Event ID validation
  ✓ Rate limiting (429 responses)

TC-803: WebSocket Security
  ✓ Token-based authentication
  ✓ Workspace ID validation
  ✓ Message signature verification
  ✓ Connection limit per user
```

---

## Test Execution Plan

### Phase 1: Core Features (Day 1)

**Time**: 4 hours

1. **Foundation (1h)**
   - TC-001: API Client (all CRUD)
   - TC-002: Routing (all pages)
   - TC-003: State Management
   - Capture 5 screenshots

2. **Event Management (1.5h)**
   - TC-101 to TC-105 (all event tests)
   - Capture 5 screenshots

3. **YAML Converter (1h)**
   - TC-201 to TC-204 (conversion + validation)
   - Capture 4 screenshots

4. **Visual Builder Core (0.5h)**
   - TC-301 to TC-306 (basic canvas operations)
   - Capture 6 screenshots

### Phase 2: Advanced Features (Day 2)

**Time**: 3 hours

1. **Console Monitoring (1h)**
   - TC-401 to TC-405 (WebSocket + logs)
   - Capture 6 screenshots

2. **Canvas Polish (1h)**
   - TC-501 to TC-505 (undo/redo + auto-layout)
   - Already tested, capture remaining screenshots

3. **Visual Features (1h)**
   - TC-601 to TC-605 (minimap + export)
   - Already tested, capture remaining screenshots

### Phase 3: Integration & Polish (Day 3)

**Time**: 4 hours

1. **Integration Scenarios (2h)**
   - Scenario 1: Complete workflow creation
   - Scenario 2: Error handling
   - Scenario 3: Multi-user editing

2. **Cross-Browser (1h)**
   - Firefox smoke test (top 10 features)
   - Safari smoke test (top 10 features)

3. **Performance & Accessibility (1h)**
   - Run performance benchmarks
   - Accessibility audit
   - Security scan

---

## Test Report Template

### Test Execution Summary

**Date**: YYYY-MM-DD
**Tester**: Name
**Environment**: localhost / staging / production
**Browser**: Chrome 142.0.0.0

### Results

| Test Case | Status  | Time | Issues Found         |
| --------- | ------- | ---- | -------------------- |
| TC-001    | ✅ PASS | 5min | None                 |
| TC-002    | ✅ PASS | 3min | None                 |
| TC-101    | ❌ FAIL | 8min | Button not clickable |
| ...       | ...     | ...  | ...                  |

### Issues Log

**Issue #1**: Event activation toggle not updating UI

- **Severity**: Medium
- **Steps**: Click toggle → No visual feedback
- **Expected**: Badge color changes immediately
- **Actual**: Badge color updates after page refresh
- **Root Cause**: Missing optimistic update
- **Fix**: Add optimistic update to React Query mutation

### Screenshots

See `plans/mvp-test-screenshots/` directory:

- `01-units-list.png`
- `02-create-event.png`
- `03-visual-builder.png`
- ...

---

## Next Steps

1. ✅ Create test plan (this document)
2. ⏳ Execute Phase 1 tests (Day 1)
3. ⏳ Execute Phase 2 tests (Day 2)
4. ⏳ Execute Phase 3 tests (Day 3)
5. ⏳ Create user documentation
6. ⏳ Create developer documentation
7. ⏳ Final sign-off
8. ✅ Deploy to production

---

## References

- [Phase 8 Test Report](251120-1303-phase-8-visual-features/FINAL_MVP_TEST_REPORT.md)
- [Phase 8 Gap Analysis](251120-1303-phase-8-visual-features/PHASE_8_GAP_ANALYSIS.md)
- [Workflow Units Migration Plan](workflow-units-migration-plan.md)
- [Design System](../docs/design-system.md)

---

**Document Status**: ✅ Ready for Test Execution
**Last Updated**: 2025-11-20
**Next Review**: After Phase 1 test execution
