# Phase 8: Visual Features - Detailed Implementation

**Plan Reference**: [plan.md](./plan.md)
**Status**: Ready for Implementation

## Table of Contents

1. [Phase 1: MiniMap Integration](#phase-1-minimap-integration)
2. [Phase 2: Export Utilities](#phase-2-export-utilities)
3. [Phase 3: UI Integration](#phase-3-ui-integration)
4. [Phase 4: Testing & Polish](#phase-4-testing--polish)

---

## Phase 1: MiniMap Integration

**Estimated Time**: 1-2 hours
**Files Modified**: `workflow-canvas.tsx`

### Overview

Configure React Flow's built-in MiniMap component with:

- Dynamic node coloring by type (triggers=blue, actions=green, logic=teal)
- Responsive hiding on mobile
- Dark mode support
- Performance optimization for large workflows

### Implementation Steps

#### 1.1: Update MiniMap Configuration

**File**: `/apps/web/src/features/workflow-units/components/workflow-builder/workflow-canvas.tsx`

**Current Code** (lines 161-169):

```tsx
<MiniMap
  nodeColor={(node) => {
    // Use CSS custom properties from design tokens
    if (node.type?.startsWith('trigger_')) return 'hsl(217 91% 60%)'; // accent-blue
    if (node.type?.startsWith('log')) return 'hsl(142 76% 36%)'; // accent-green
    return 'hsl(173 80% 40%)'; // accent-teal (logic)
  }}
  maskColor="rgba(0, 0, 0, 0.1)"
/>
```

**Updated Code**:

```tsx
<MiniMap
  nodeColor={(node) => {
    // Dynamic coloring based on node category
    const nodeType = node.type || '';

    // Triggers: blue (CRON, Record, Manual)
    if (nodeType.startsWith('trigger_')) {
      return 'hsl(217 91% 60%)'; // --accent-blue
    }

    // Actions: green (Log, HTTP, Email, Active Tables)
    if (nodeType.startsWith('log') || nodeType.startsWith('action_')) {
      return 'hsl(142 76% 36%)'; // --accent-green
    }

    // Logic: teal (Conditional, Loop, Transform, etc.)
    return 'hsl(173 80% 40%)'; // --accent-teal
  }}
  maskColor="rgba(0, 0, 0, 0.1)"
  className="minimap-canvas"
  pannable
  zoomable
  position="bottom-right"
/>
```

**Why**: Improved categorization logic, added interactivity (pan/zoom), explicit positioning.

#### 1.2: Add Responsive CSS

**File**: `/apps/web/src/features/workflow-units/components/workflow-builder/workflow-canvas.tsx`

Add CSS to hide minimap on mobile (add to component or global styles):

```tsx
// Option A: Inline style in component
<MiniMap
  // ... existing props
  style={{
    '@media (max-width: 768px)': {
      display: 'none',
    },
  }}
/>

// Option B: Add to globals.css (RECOMMENDED)
```

**File**: `/packages/ui/src/styles/globals.css` (add at end of file)

```css
/* Workflow Canvas Responsive Styles */
@media (max-width: 768px) {
  .react-flow__minimap {
    display: none;
  }
}

/* Dark mode minimap styling */
.dark .react-flow__minimap {
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
}

.dark .react-flow__minimap-mask {
  fill: rgba(0, 0, 0, 0.2);
}
```

**Why**: Mobile users don't need minimap (limited screen space). Dark mode support follows design system.

#### 1.3: Test MiniMap Performance

**Test Cases**:

1. **Small workflow** (10 nodes): Verify minimap renders all nodes
2. **Medium workflow** (50 nodes): Check minimap responsiveness
3. **Large workflow** (100+ nodes): Ensure <16ms render time (60fps)
4. **Mobile viewport**: Confirm minimap hidden at 768px breakpoint
5. **Dark mode**: Verify minimap colors in dark theme

**Acceptance Criteria**:

- ✅ Minimap updates in real-time as nodes move
- ✅ Color coding accurate (blue/green/teal)
- ✅ Minimap hidden on mobile (<768px)
- ✅ No performance degradation on large workflows
- ✅ Pan/zoom works in minimap viewport

---

## Phase 2: Export Utilities

**Estimated Time**: 2-3 hours
**Files Created**: `export-utils.ts`
**Dependencies**: `html-to-image@1.11.11`

### Overview

Create utility functions to export workflow canvas as high-quality PNG using html-to-image library with:

- 2x pixel ratio for retina displays
- UI element filtering (exclude minimap, controls)
- Viewport bounds calculation
- Error handling for browser limits

### Implementation Steps

#### 2.1: Install html-to-image

**Command**:

```bash
cd /Users/macos/Workspace/buildinpublic/beqeek
pnpm --filter web add html-to-image@1.11.11
```

**Verify**:

```bash
pnpm --filter web list html-to-image
# Expected: html-to-image 1.11.11
```

#### 2.2: Create Export Utilities File

**File**: `/apps/web/src/features/workflow-units/utils/export-utils.ts` (NEW)

````typescript
import { toPng } from 'html-to-image';
import type { Node, Edge } from '@xyflow/react';
import { getNodesBounds, getViewportForBounds } from '@xyflow/react';

/**
 * Export options for workflow canvas PNG generation
 */
export interface ExportWorkflowOptions {
  /**
   * Workflow event name for filename generation
   */
  eventName: string;

  /**
   * Pixel ratio for high-DPI displays (default: 2)
   */
  pixelRatio?: number;

  /**
   * Background color (default: transparent)
   */
  backgroundColor?: string;
}

/**
 * Generates a filename for exported workflow PNG
 * Format: workflow-{eventName}-{timestamp}.png
 *
 * @param eventName - Name of workflow event
 * @returns Sanitized filename
 *
 * @example
 * generateExportFilename('Daily Sync')
 * // => 'workflow-daily-sync-20251120-1303.png'
 */
export function generateExportFilename(eventName: string): string {
  // Sanitize event name (remove special chars, spaces to hyphens)
  const sanitized = eventName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50); // Limit length

  // Generate timestamp
  const now = new Date();
  const timestamp = now.toISOString().slice(0, 16).replace('T', '-').replace(/:/g, '');

  return `workflow-${sanitized}-${timestamp}.png`;
}

/**
 * Downloads a data URL as a file
 *
 * @param dataUrl - Base64 encoded data URL
 * @param filename - Target filename
 */
function downloadImage(dataUrl: string, filename: string): void {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  link.click();
}

/**
 * Exports workflow canvas to PNG with high quality
 *
 * @param nodes - React Flow nodes
 * @param edges - React Flow edges
 * @param options - Export options
 * @returns Promise resolving to data URL
 * @throws Error if export fails or canvas element not found
 *
 * @example
 * ```tsx
 * try {
 *   await exportWorkflowToPng(nodes, edges, {
 *     eventName: 'Daily Sync',
 *     pixelRatio: 2,
 *   });
 *   toast.success('Workflow exported successfully');
 * } catch (error) {
 *   toast.error('Failed to export workflow');
 * }
 * ```
 */
export async function exportWorkflowToPng(nodes: Node[], edges: Edge[], options: ExportWorkflowOptions): Promise<void> {
  const { eventName, pixelRatio = 2, backgroundColor = 'transparent' } = options;

  // Validate inputs
  if (nodes.length === 0) {
    throw new Error('Cannot export empty workflow');
  }

  // Find React Flow viewport element
  const viewportElement = document.querySelector('.react-flow__viewport') as HTMLElement;
  if (!viewportElement) {
    throw new Error('Canvas element not found');
  }

  // Calculate bounds for all nodes
  const nodesBounds = getNodesBounds(nodes);

  // Get viewport transform to fit all nodes
  const viewport = getViewportForBounds(
    nodesBounds,
    viewportElement.clientWidth,
    viewportElement.clientHeight,
    0.5, // min zoom
    2, // max zoom
    0.1, // padding
  );

  try {
    // Generate PNG with high quality
    const dataUrl = await toPng(viewportElement, {
      backgroundColor,
      pixelRatio,
      width: viewportElement.clientWidth,
      height: viewportElement.clientHeight,
      filter: (node: HTMLElement) => {
        // Exclude UI elements from export
        const excludeClasses = [
          'react-flow__minimap',
          'react-flow__controls',
          'react-flow__attribution',
          'react-flow__panel', // Exclude Save/Test buttons
        ];

        return !excludeClasses.some((className) => node.classList?.contains(className));
      },
    });

    // Generate filename and download
    const filename = generateExportFilename(eventName);
    downloadImage(dataUrl, filename);
  } catch (error) {
    // Re-throw with user-friendly message
    throw new Error(error instanceof Error ? error.message : 'Failed to generate PNG. Try reducing canvas size.');
  }
}
````

**Key Features**:

- **Filename sanitization**: Removes special characters, limits length
- **High-DPI support**: 2x pixel ratio by default
- **UI filtering**: Excludes minimap, controls, panels
- **Error handling**: Graceful failures with user messages
- **TypeScript strict**: Full type coverage

#### 2.3: Add Type Definitions

**File**: `/apps/web/src/features/workflow-units/utils/export-utils.ts` (add at top)

Ensure proper type imports from @xyflow/react:

```typescript
import type { Node, Edge } from '@xyflow/react';
```

**Verify** no TypeScript errors:

```bash
pnpm --filter web check-types
```

---

## Phase 3: UI Integration

**Estimated Time**: 1 hour
**Files Modified**: `canvas-header.tsx`

### Overview

Add Export button to canvas header toolbar with:

- Loading state during export
- Success/error toast notifications
- Positioned next to Save button
- Disabled when no nodes present

### Implementation Steps

#### 3.1: Add Export Button to Canvas Header

**File**: `/apps/web/src/features/workflow-units/components/workflow-builder/canvas-header.tsx`

**Step 1**: Add imports (top of file):

```typescript
import { Download } from 'lucide-react'; // Add to existing imports
import { exportWorkflowToPng } from '../../utils/export-utils'; // New import
import { useState } from 'react'; // Add to existing React imports
```

**Step 2**: Add export state (inside component, after existing hooks):

```typescript
export function CanvasHeader({ workspaceId }: CanvasHeaderProps) {
  const { currentEvent, nodes, edges, isDirty, parseError, setIsDirty, setNodes } = useWorkflowEditorStore();

  const updateEvent = useUpdateWorkflowEvent();

  // ... existing zundo hooks ...

  // Export state
  const [isExporting, setIsExporting] = useState(false);

  // ... rest of component
```

**Step 3**: Add export handler function (after `handleAutoLayout`):

```typescript
// Export workflow as PNG
const handleExport = useCallback(async () => {
  if (!currentEvent || nodes.length === 0) return;

  setIsExporting(true);

  try {
    await exportWorkflowToPng(nodes, edges, {
      eventName: currentEvent.eventName,
      pixelRatio: 2,
      backgroundColor: 'transparent',
    });

    toast.success('Workflow exported successfully', {
      description: 'PNG saved to downloads folder',
    });
  } catch (error) {
    toast.error('Failed to export workflow', {
      description: error instanceof Error ? error.message : 'Please try again',
    });
  } finally {
    setIsExporting(false);
  }
}, [currentEvent, nodes, edges]);
```

**Step 4**: Add Export button to toolbar (after Save button):

**Find this section** (around line 176-184):

```typescript
{/* Save Button + Dirty State */}
{isDirty && <span className="text-sm text-muted-foreground">Unsaved changes</span>}
<Button onClick={handleManualSave} disabled={!isDirty || updateEvent.isPending} size="sm">
  <Save className="h-4 w-4 mr-2" />
  {updateEvent.isPending ? 'Saving...' : 'Save Workflow'}
</Button>
```

**Add after Save button** (before closing `</div>`):

```typescript
{/* Save Button + Dirty State */}
{isDirty && <span className="text-sm text-muted-foreground">Unsaved changes</span>}
<Button onClick={handleManualSave} disabled={!isDirty || updateEvent.isPending} size="sm">
  <Save className="h-4 w-4 mr-2" />
  {updateEvent.isPending ? 'Saving...' : 'Save Workflow'}
</Button>

{/* Export Button */}
<Button
  variant="outline"
  size="sm"
  onClick={handleExport}
  disabled={nodes.length === 0 || isExporting}
  title="Export workflow as PNG"
>
  <Download className="h-4 w-4 mr-2" />
  {isExporting ? 'Exporting...' : 'Export PNG'}
</Button>
```

**Step 5**: Add keyboard shortcut for export (update `handleKeyDown` in `useEffect`):

```typescript
// Keyboard shortcuts
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    // ... existing undo/redo shortcuts ...

    // Export: Cmd+Shift+E / Ctrl+Shift+E
    if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'e') {
      e.preventDefault();
      if (nodes.length > 0 && !isExporting) {
        handleExport();
      }
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [canUndo, canRedo, undo, redo, handleAutoLayout, nodes.length, isExporting, handleExport]);
```

#### 3.2: Update Button Styling (if needed)

Verify Export button matches design system:

```typescript
// Existing button classes should work:
variant = 'outline'; // Light border, transparent bg
size = 'sm'; // Small size (matches Save button)

// If adjustments needed, ensure using design tokens:
className = 'border-input bg-background hover:bg-accent hover:text-accent-foreground';
```

#### 3.3: Verify TypeScript & Build

```bash
# Type check
pnpm --filter web check-types

# Build to verify no runtime errors
pnpm --filter web build
```

**Expected**: No errors, export button appears next to Save.

---

## Phase 4: Testing & Polish

**Estimated Time**: 1 hour

### Overview

Comprehensive testing across browsers, devices, and edge cases to ensure production readiness.

### Testing Checklist

#### 4.1: Functional Testing

**Test Case 1: Basic Export**

- [ ] Create workflow with 10 nodes
- [ ] Click "Export PNG" button
- [ ] Verify file downloads
- [ ] Open PNG in image viewer
- [ ] Confirm all nodes visible
- [ ] Check filename format: `workflow-{name}-{timestamp}.png`

**Test Case 2: Large Workflow**

- [ ] Create workflow with 100+ nodes
- [ ] Export workflow
- [ ] Verify export completes in <500ms
- [ ] Check PNG quality (2x retina)
- [ ] Confirm no missing nodes

**Test Case 3: Special Characters**

- [ ] Create event named "Test: Workflow (2024)"
- [ ] Export workflow
- [ ] Verify filename sanitized: `workflow-test-workflow-2024-{timestamp}.png`

**Test Case 4: Empty Workflow**

- [ ] Select event with no nodes
- [ ] Verify Export button disabled
- [ ] Confirm no error on click

**Test Case 5: UI Element Filtering**

- [ ] Export workflow
- [ ] Open PNG
- [ ] Verify minimap NOT visible in export
- [ ] Verify controls NOT visible in export
- [ ] Verify Save/Export buttons NOT visible

#### 4.2: Browser Compatibility

**Chrome/Edge** (Chromium):

- [ ] Export works
- [ ] File downloads correctly
- [ ] Toast notifications appear

**Firefox**:

- [ ] Export works
- [ ] File downloads correctly
- [ ] No console errors

**Safari** (macOS):

- [ ] Export works
- [ ] File downloads correctly
- [ ] Canvas rendering accurate

#### 4.3: Mobile Responsive Testing

**Viewport 375px** (iPhone SE):

- [ ] Minimap hidden
- [ ] Export button visible in header
- [ ] Export works (if enabled)

**Viewport 768px** (iPad):

- [ ] Minimap hidden at breakpoint
- [ ] Export button accessible

#### 4.4: Dark Mode Testing

- [ ] Switch to dark mode
- [ ] Verify minimap background dark
- [ ] Export workflow
- [ ] Check PNG renders correctly (not inverted)

#### 4.5: Performance Testing

**Metrics**:

```bash
# Bundle size increase check
pnpm --filter web build

# Expected: html-to-image adds ~35kb gzipped
# Verify total increase < 50kb
```

**Export timing** (use DevTools Performance tab):

- 10 nodes: <100ms
- 50 nodes: <300ms
- 100 nodes: <500ms

**MiniMap render** (use React DevTools Profiler):

- Initial render: <16ms (60fps)
- Update on node move: <16ms

#### 4.6: Error Handling Testing

**Test Case 1: Browser Blocks Download**

- [ ] Block downloads in browser settings
- [ ] Click Export
- [ ] Verify error toast appears
- [ ] Check console for error message

**Test Case 2: Large Canvas (Memory Limit)**

- [ ] Create 500+ node workflow
- [ ] Attempt export
- [ ] Verify graceful error (not crash)
- [ ] Error message suggests reducing size

**Test Case 3: Canvas Element Not Found**

- [ ] Mock scenario where `.react-flow__viewport` missing
- [ ] Verify error toast: "Canvas element not found"

#### 4.7: Accessibility Testing

**Keyboard Navigation**:

- [ ] Tab to Export button
- [ ] Press Enter to export
- [ ] Verify Cmd+Shift+E shortcut works

**Screen Reader** (VoiceOver/NVDA):

- [ ] Button announced as "Export PNG button"
- [ ] Disabled state announced
- [ ] Loading state announced

**Color Contrast**:

- [ ] Minimap node colors meet WCAG AA (4.5:1)
- [ ] Export button text readable

#### 4.8: Integration Testing

- [ ] Export workflow, edit, export again
- [ ] Verify different timestamps
- [ ] Verify different content in PNGs

- [ ] Save workflow, then export
- [ ] Verify exported PNG matches saved state

- [ ] Undo/redo changes, then export
- [ ] Verify export reflects current state

### Polish Tasks

#### Code Quality

**Lint Check**:

```bash
pnpm --filter web lint
```

Expected: Max 120 warnings (project baseline)

**Type Safety**:

```bash
pnpm --filter web check-types
```

Expected: 0 errors

**Code Formatting**:

```bash
pnpm format
```

#### Documentation

**Update Component JSDoc**:

```typescript
/**
 * CanvasHeader Component
 *
 * Displays current event info, dirty state, manual save, and PNG export.
 *
 * Features:
 * - Manual save workflow (Cmd+S)
 * - Export workflow as PNG (Cmd+Shift+E)
 * - Auto-layout nodes (Cmd+Shift+L)
 * - Undo/redo (Cmd+Z / Cmd+Shift+Z)
 *
 * @param workspaceId - Current workspace ID
 */
```

**Add inline comments** for complex logic:

```typescript
// Calculate viewport bounds to fit all nodes in export
const nodesBounds = getNodesBounds(nodes);
```

#### Bundle Size Verification

```bash
# Build production bundle
NODE_ENV=production pnpm --filter web build

# Check build output
ls -lh apps/web/dist/assets/*.js

# Verify total gzipped size
du -sh apps/web/dist
```

**Expected**:

- html-to-image: ~35kb gzipped
- Total increase: <50kb gzipped

### Acceptance Criteria

**All checklist items completed**:

- ✅ Functional tests pass (5/5)
- ✅ Browser compatibility verified (3/3)
- ✅ Mobile responsive tests pass (2/2)
- ✅ Dark mode tests pass (3/3)
- ✅ Performance benchmarks met
- ✅ Error handling robust
- ✅ Accessibility standards met
- ✅ Code quality checks pass
- ✅ Bundle size within limits
- ✅ Documentation updated

### Known Limitations (Document)

1. **PNG-only export**: No SVG, PDF in MVP (deferred to backlog)
2. **500+ node workflows**: May hit browser memory limits (document workaround)
3. **Safari 14-**: May have rendering inconsistencies (upgrade browser)
4. **Mobile export**: Works but not optimized (desktop recommended)

---

## Deployment Checklist

### Pre-Deployment

- [ ] All Phase 1-4 tests passing
- [ ] Code review completed (use `/code-reviewer` agent)
- [ ] Merge conflicts resolved
- [ ] Changelog updated

### Deployment Steps

1. **Merge to main**:

```bash
git add .
git commit -m "feat: add workflow canvas minimap and PNG export

- Implement React Flow MiniMap with dynamic node coloring
- Add PNG export with html-to-image@1.11.11 (2x retina quality)
- Export button in canvas header with loading states
- Mobile responsive (hide minimap on small screens)
- Keyboard shortcut: Cmd+Shift+E
- UI element filtering (exclude minimap, controls from export)

Closes #XXX"
git push origin feature/phase-8-visual-features
```

2. **Create PR**:

```bash
gh pr create --title "Phase 8: Workflow Canvas Minimap & PNG Export" \
  --body "$(cat <<'EOF'
## Summary
- ✅ Canvas minimap with color-coded node types
- ✅ High-quality PNG export (2x retina)
- ✅ Mobile responsive design
- ✅ Error handling and loading states

## Test Plan
- [x] Tested with 10, 50, 100+ node workflows
- [x] Verified export quality (2x retina)
- [x] Tested mobile responsive behavior
- [x] Verified dark mode minimap colors
- [x] Checked bundle size increase (<50kb)

## Screenshots
[Attach minimap screenshot]
[Attach export button screenshot]

EOF
)"
```

### Post-Deployment

- [ ] Smoke test on staging environment
- [ ] Verify analytics tracking (if applicable)
- [ ] Monitor error logs for export failures
- [ ] Gather user feedback on Discord/support

---

## Troubleshooting Guide

### Issue: Export button not appearing

**Diagnosis**:

```bash
# Check TypeScript errors
pnpm --filter web check-types

# Check build errors
pnpm --filter web build
```

**Solution**: Verify imports in `canvas-header.tsx`, ensure `export-utils.ts` compiled.

### Issue: Minimap colors incorrect

**Diagnosis**: Check node type naming convention.

**Solution**: Verify node types start with `trigger_`, `action_`, or logic category.

### Issue: Export fails with "Canvas element not found"

**Diagnosis**: React Flow viewport not rendered.

**Solution**: Add null check before export:

```typescript
const viewportElement = document.querySelector('.react-flow__viewport');
if (!viewportElement) {
  toast.error('Please wait for canvas to load');
  return;
}
```

### Issue: Exported PNG missing nodes

**Diagnosis**: Viewport bounds calculation incorrect.

**Solution**: Verify `getNodesBounds()` includes all nodes, adjust padding parameter.

### Issue: Bundle size too large (>50kb increase)

**Diagnosis**: html-to-image pulling extra dependencies.

**Solution**: Check for duplicate packages:

```bash
pnpm dedupe
pnpm install
```

---

## Rollback Instructions

If critical bug discovered in production:

**Step 1**: Feature flag (quick disable):

```typescript
// In canvas-header.tsx, hide Export button
const ENABLE_EXPORT = false; // Set to false

{ENABLE_EXPORT && (
  <Button variant="outline" size="sm" onClick={handleExport}>
    <Download className="h-4 w-4 mr-2" />
    Export PNG
  </Button>
)}
```

**Step 2**: Revert MiniMap (if performance issue):

```typescript
// In workflow-canvas.tsx, comment out MiniMap
{
  /* <MiniMap ... /> */
}
```

**Step 3**: Full rollback (remove html-to-image):

```bash
# Revert commit
git revert HEAD

# Remove dependency
pnpm --filter web remove html-to-image

# Rebuild
pnpm --filter web build
```

---

## Future Enhancements (Backlog)

1. **SVG Export**: For better scalability and editing
2. **PDF Export**: For documentation and reporting
3. **Custom export dimensions**: User-defined width/height
4. **Watermark support**: Branding on exports
5. **Batch export**: Export all events in workspace
6. **Copy to clipboard**: Skip download, paste directly
7. **Export with transparent background**: For presentations
8. **Auto-export on save**: Optional workflow history

**Priority**: Low (gather user feedback first)

---

## Related Documents

- [Plan Overview](./plan.md)
- [React Flow MiniMap API](https://reactflow.dev/api-reference/components/mini-map)
- [html-to-image Documentation](https://github.com/bubkoo/html-to-image#readme)
- [Beqeek Design System](/docs/design-system.md)

---

**Implementation Status**: ⏳ Ready to Start

**Next Step**: Begin Phase 1 - MiniMap Integration
