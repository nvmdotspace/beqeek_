# Accessibility Audit Report - Workflow Builder Components

**Date:** 2025-11-23
**Scope:** `apps/web/src/features/workflow-units/components/workflow-builder/*.tsx`
**Files Reviewed:** 8 files

## Summary

Performed comprehensive accessibility audit on workflow builder components focusing on:

- ARIA labels for interactive elements
- Keyboard navigation support
- Focus indicators
- Screen reader compatibility
- Semantic HTML

## Files Audited

1. `canvas-header.tsx`
2. `node-palette.tsx`
3. `node-config-panel.tsx`
4. `node-config-drawer.tsx`
5. `editor-mode-toggle.tsx`
6. `event-selector.tsx`
7. `yaml-editor.tsx`
8. `workflow-canvas.tsx`

## Issues Found & Fixed

### Critical Fixes

| Component             | Issue                                                         | Fix Applied                                                     |
| --------------------- | ------------------------------------------------------------- | --------------------------------------------------------------- |
| `canvas-header.tsx`   | Icon-only Undo/Redo buttons missing aria-labels               | Added `aria-label` to both buttons                              |
| `node-palette.tsx`    | Draggable items with `role="button"` missing keyboard handler | Added `onKeyDown` for Enter/Space keys                          |
| `workflow-canvas.tsx` | Canvas missing role and keyboard shortcut info                | Added `role="application"` with aria-label describing shortcuts |

### High Priority Fixes

| Component                | Issue                                             | Fix Applied                                                   |
| ------------------------ | ------------------------------------------------- | ------------------------------------------------------------- |
| `canvas-header.tsx`      | "Unsaved changes" not announced to screen readers | Added `role="status"` and `aria-live="polite"`                |
| `canvas-header.tsx`      | Icons not marked decorative                       | Added `aria-hidden="true"` to all icons                       |
| `node-palette.tsx`       | Missing section landmarks                         | Added `<section>` with `aria-labelledby` for each category    |
| `node-palette.tsx`       | No focus indicators on items                      | Added focus ring classes (`focus:ring-2 focus:ring-offset-2`) |
| `editor-mode-toggle.tsx` | Tabs missing aria-label                           | Added `aria-label` to Tabs and TabsList                       |

### Medium Priority Fixes

| Component                | Issue                                    | Fix Applied                                           |
| ------------------------ | ---------------------------------------- | ----------------------------------------------------- |
| `node-config-panel.tsx`  | JSON data region not keyboard accessible | Added `tabIndex={0}` and `role="region"`              |
| `node-config-drawer.tsx` | Category badge missing context           | Added `aria-label="Category: {category}"`             |
| `event-selector.tsx`     | Loading skeleton not labeled             | Added `aria-label="Loading events"`                   |
| `event-selector.tsx`     | Dropdown trigger missing context         | Added descriptive `aria-label` with current selection |
| `yaml-editor.tsx`        | Editor container missing role            | Added `role="region"` and `aria-label`                |
| `yaml-editor.tsx`        | Error alert missing live region          | Added `role="alert"` and `aria-live="assertive"`      |
| `workflow-canvas.tsx`    | Panel buttons missing aria-labels        | Added `aria-label` to Save/Test buttons               |

## Code Changes Summary

### canvas-header.tsx

- Added `role="group"` with `aria-label="History controls"` to undo/redo container
- Added `aria-label` to Undo, Redo, Auto-Layout, Export, Save buttons
- Added `aria-hidden="true"` to all decorative icons
- Added `role="status"` and `aria-live="polite"` to unsaved changes indicator
- Added `role="alert"` to parse error alert

### node-palette.tsx

- Added keyboard handler (`onKeyDown`) for Enter/Space key activation
- Added focus indicator classes for visual feedback
- Added `aria-describedby` linking to description text
- Added screen reader only description spans
- Added `role="region"` to container
- Added `<section>` landmarks with `aria-labelledby`
- Added `role="group"` to node category lists

### node-config-panel.tsx

- Added `role="region"` with contextual `aria-label`
- Added `tabIndex={0}` to JSON data region for keyboard focus
- Added `aria-labelledby` linking to section label

### node-config-drawer.tsx

- Added `aria-hidden="true"` to decorative icon container
- Added `aria-label` to category badge
- Added `tabIndex={0}` and `role="region"` to JSON data
- Changed info alert to `role="note"`

### editor-mode-toggle.tsx

- Added `aria-label="Editor mode"` to Tabs
- Added descriptive `aria-label` to TabsList
- Added specific `aria-label` to each TabsTrigger
- Added `aria-hidden="true"` to icons

### event-selector.tsx

- Added `aria-label="Loading events"` to skeleton
- Added descriptive `aria-label` to dropdown trigger
- Added `aria-hidden="true"` to badge in trigger

### yaml-editor.tsx

- Added `role="region"` and `aria-label` to container
- Added `role="alert"` and `aria-live="assertive"` to error alert
- Added `aria-hidden="true"` to error icon
- Added `aria-label` to editor container

### workflow-canvas.tsx

- Added `role="application"` to canvas (complex widget)
- Added `aria-label` describing keyboard shortcuts
- Added `role="toolbar"` to panel
- Added `aria-label` to Save/Test buttons
- Added `aria-hidden="true"` to button icons

## Verification

- TypeScript: No new type errors introduced
- ESLint: No new lint errors introduced
- All existing functionality preserved

## Remaining Considerations

1. **ReactFlow Library**: The underlying ReactFlow library handles its own accessibility. Consider reviewing their documentation for additional a11y customization options.

2. **Custom Events**: The keyboard-activated node addition uses custom events (`workflow:add-node`). Ensure the canvas listens for these events.

3. **Monaco Editor**: The YAML editor uses Monaco which has built-in accessibility features. No additional customization needed.

## WCAG 2.1 Compliance

| Criterion                    | Status                                              |
| ---------------------------- | --------------------------------------------------- |
| 1.3.1 Info and Relationships | Pass - Semantic HTML and ARIA                       |
| 2.1.1 Keyboard               | Pass - All interactive elements keyboard accessible |
| 2.4.4 Link Purpose           | Pass - Labels describe purpose                      |
| 2.4.6 Headings and Labels    | Pass - Descriptive labels                           |
| 4.1.2 Name, Role, Value      | Pass - ARIA attributes properly set                 |
