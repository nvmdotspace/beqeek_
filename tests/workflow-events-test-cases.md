# Workflow Event Management - Test Cases

## Test Suite: Phase 5 + 6 - Event Dialogs & Editor Integration

### Test Case 1: Navigate to Workflow Units

**Priority:** High
**Steps:**

1. Open http://localhost:4173/vi/workspaces/732878538910205329/workflow-units
2. Verify page loads successfully
3. Verify "Workflow Units" heading is displayed
4. Verify at least one workflow unit card is visible

**Expected Results:**

- Page loads without errors
- Workflow units list displays correctly
- Each unit card shows name and action buttons

---

### Test Case 2: View Workflow Unit Details

**Priority:** High
**Steps:**

1. Navigate to workflow units list
2. Click on any workflow unit card
3. Verify redirect to unit detail page
4. Verify breadcrumb navigation shows: Workspace > Workflow Units > [Unit Name]
5. Verify "Workflow Events" section is displayed

**Expected Results:**

- Unit detail page loads successfully
- Breadcrumb navigation is correct
- Events section shows either list of events or empty state

---

### Test Case 3: Create New Workflow Event - Schedule Trigger

**Priority:** High
**Steps:**

1. Navigate to workflow unit detail page
2. Click "Create Event" button
3. Verify "Create Workflow Event" dialog opens
4. Enter event name: "Test Daily Sync"
5. Enter description: "Syncs data every day"
6. Verify trigger type is "SCHEDULE" (default)
7. Verify cron expression shows "0 9 \* \* 1"
8. Click "Create Event" button
9. Wait for dialog to close
10. Verify new event appears in events list

**Expected Results:**

- Dialog opens with all required fields
- Default trigger is Schedule
- Default cron expression is provided
- Event is created successfully
- Dialog closes automatically
- New event appears in the list with "Inactive" status

---

### Test Case 4: Create Event - Validation

**Priority:** Medium
**Steps:**

1. Click "Create Event" button
2. Leave event name empty
3. Verify "Create Event" button is disabled
4. Enter event name: "Test Event"
5. Verify "Create Event" button becomes enabled

**Expected Results:**

- Cannot submit with empty event name
- Button enables after entering valid name

---

### Test Case 5: Open Workflow Editor

**Priority:** High
**Steps:**

1. From workflow unit detail page
2. Click on any workflow event card
3. Verify redirect to editor page (URL contains /events/{eventId}/edit)
4. Wait for editor to load
5. Verify event sidebar shows on the left
6. Verify canvas header shows event name and status
7. Verify node palette shows all node categories
8. Verify workflow canvas is empty (for new events)
9. Verify config panel shows on the right

**Expected Results:**

- Editor page loads successfully
- All UI components render correctly:
  - Event List Sidebar (left)
  - Canvas Header with event info
  - Node Palette with Triggers/Actions/Logic
  - Workflow Canvas (center)
  - Node Configuration Panel (right)
- No JavaScript errors in console

---

### Test Case 6: Canvas Header Display

**Priority:** High
**Steps:**

1. Open workflow editor for an event
2. Verify event name is displayed in header
3. Verify status badge shows "Inactive" or "Active"
4. Verify trigger type badge shows correctly (e.g., "Schedule")
5. Verify "Save Workflow" button is displayed
6. Verify button is disabled when no changes made

**Expected Results:**

- All event information displays correctly
- Badges use appropriate colors
- Save button state reflects dirty state

---

### Test Case 7: Node Palette Categories

**Priority:** Medium
**Steps:**

1. Open workflow editor
2. Locate Node Palette on the left
3. Verify "Triggers" section shows:
   - Schedule
   - Webhook
   - Form Submit
   - Table Action
4. Verify "Actions" section shows:
   - Table Operation
   - Send Email
   - Google Sheet
   - API Call
   - User Operation
   - Delay
   - Log
5. Verify "Logic" section shows:
   - Condition
   - Match
   - Loop
   - Math
   - Variables
   - Debug Log

**Expected Results:**

- All node types are listed
- Nodes are grouped correctly
- Each node shows icon and description

---

### Test Case 8: Event List in Sidebar

**Priority:** Medium
**Steps:**

1. Open workflow editor
2. Verify event list sidebar on the far left
3. Verify current event is highlighted
4. Verify event count badge shows correct number
5. Click "Create Event" button in sidebar
6. Verify create dialog opens from sidebar

**Expected Results:**

- Event list shows all events for the unit
- Current event has visual indicator
- Can create new events from sidebar

---

### Test Case 9: Edit Event Dialog

**Priority:** Medium
**Steps:**

1. From workflow unit detail page
2. Click three-dot menu on event card
3. Click "Edit"
4. Verify "Edit Workflow Event" dialog opens
5. Verify form is pre-populated with event data
6. Change event name to "Updated Event Name"
7. Click "Save Changes"
8. Verify dialog closes
9. Verify event name updates in the list

**Expected Results:**

- Edit dialog shows current event data
- Can update event name and trigger config
- Changes save successfully
- UI updates to reflect changes

---

### Test Case 10: Delete Event Dialog - Confirmation

**Priority:** High
**Steps:**

1. From workflow unit detail page
2. Click three-dot menu on event card
3. Click "Delete"
4. Verify "Delete Workflow Event" dialog opens
5. Verify event name is displayed in red alert
6. Verify delete button is disabled
7. Type the event name in confirmation field
8. Verify delete button becomes enabled
9. Click "Cancel"
10. Verify dialog closes without deleting

**Expected Results:**

- Delete requires typing event name for confirmation
- Cannot delete without exact name match
- Can cancel deletion safely

---

### Test Case 11: Delete Event - Complete Flow

**Priority:** High
**Steps:**

1. Create a test event "Event to Delete"
2. Click three-dot menu on the event
3. Click "Delete"
4. Type exact event name: "Event to Delete"
5. Click "Delete Event" button
6. Wait for deletion to complete
7. Verify event is removed from list

**Expected Results:**

- Event deletes successfully
- Event disappears from list
- No errors occur

---

### Test Case 12: Canvas Controls

**Priority:** Low
**Steps:**

1. Open workflow editor
2. Locate canvas controls (bottom right)
3. Verify controls show:
   - Zoom In
   - Zoom Out
   - Fit View
   - Toggle Interactivity
4. Verify Mini Map is visible
5. Click "Zoom In" and verify canvas zooms
6. Click "Fit View" and verify canvas adjusts

**Expected Results:**

- All canvas controls are functional
- Zoom level changes work
- Mini Map displays canvas overview

---

### Test Case 13: Empty Canvas State

**Priority:** Medium
**Steps:**

1. Create a new event
2. Open the event in editor
3. Verify canvas is empty
4. Verify no nodes are displayed
5. Verify "Save Workflow" button is disabled

**Expected Results:**

- New events start with empty canvas
- Canvas shows grid/background
- Save button disabled until changes made

---

### Test Case 14: Multiple Events Navigation

**Priority:** Medium
**Steps:**

1. Create 3 different events
2. From unit detail page, verify all 3 events display
3. Click on first event
4. Verify editor opens for first event
5. Navigate back to unit detail
6. Click on second event
7. Verify editor opens for second event
8. Verify event name in header matches selected event

**Expected Results:**

- Can navigate between multiple events
- Each event opens in separate editor session
- Event data loads correctly for each event

---

### Test Case 15: API Error Handling

**Priority:** Medium
**Steps:**

1. Disconnect internet or block API requests
2. Try to load workflow units list
3. Verify error message displays
4. Reconnect internet
5. Try again and verify data loads

**Expected Results:**

- Appropriate error message shows when API fails
- User can retry after connection restored
- No crashes or white screens

---

### Test Case 16: Responsive Layout - Sidebar Collapse

**Priority:** Low
**Steps:**

1. Open workflow editor
2. Resize browser to tablet width (768px)
3. Verify sidebar auto-collapses
4. Resize to mobile width (<768px)
5. Verify mobile layout activates

**Expected Results:**

- Layout adapts to different screen sizes
- Content remains accessible on smaller screens

---

### Test Case 17: Browser Back/Forward Navigation

**Priority:** Medium
**Steps:**

1. Navigate: Units List → Unit Detail → Event Editor
2. Click browser back button
3. Verify returns to unit detail page
4. Click browser back button again
5. Verify returns to units list
6. Click browser forward button
7. Verify returns to unit detail

**Expected Results:**

- Browser navigation works correctly
- No data loss during navigation
- Correct page state restored

---

### Test Case 18: Direct URL Access

**Priority:** Medium
**Steps:**

1. Copy workflow editor URL
2. Open new browser tab
3. Paste URL and navigate
4. Verify editor loads correctly
5. Verify event data displays

**Expected Results:**

- Can access editor via direct URL
- Page loads with correct data
- No authentication errors

---

### Test Case 19: Event Status Toggle

**Priority:** Low
**Steps:**

1. From workflow unit detail page
2. Locate event card
3. Find active/inactive toggle switch
4. Toggle the switch
5. Verify status changes immediately
6. Refresh page
7. Verify status persists

**Expected Results:**

- Status toggle works without errors
- Status persists after page refresh
- Badge color updates correctly

---

### Test Case 20: Concurrent Editing Protection

**Priority:** Low
**Steps:**

1. Open event editor in two browser tabs
2. Make changes in first tab
3. Make different changes in second tab
4. Save in first tab
5. Try to save in second tab
6. Verify appropriate handling

**Expected Results:**

- System handles concurrent edits gracefully
- No data corruption occurs
- User is notified of conflicts if any

---

## Test Summary

**Total Test Cases:** 20
**Priority Breakdown:**

- High: 9 test cases
- Medium: 9 test cases
- Low: 2 test cases

**Coverage Areas:**

- Navigation & Routing: 5 tests
- CRUD Operations: 6 tests
- UI Components: 5 tests
- Error Handling: 2 tests
- Edge Cases: 2 tests
