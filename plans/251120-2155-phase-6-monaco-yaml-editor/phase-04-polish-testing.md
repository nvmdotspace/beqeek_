# Phase 4: Polish & Testing

**Timeline**: Day 4-5 | **Effort**: 4-6h | **Status**: 🔴 Not Started

## Context

Final polish: keyboard shortcuts, unsaved changes warning, mobile responsive, cross-browser testing, accessibility audit, E2E tests.

**Dependencies**: Phase 1, 2, 3 complete (full feature working)

## Requirements

### Functional

- **Keyboard shortcuts**: Cmd+S (save), Cmd+Shift+Y (toggle mode)
- **Unsaved warning**: Alert before leaving with unsaved YAML changes
- **Mode persistence**: Restore last mode when returning to event
- **Viewport preservation**: Zoom/pan state preserved when switching back to visual

### Technical

- Cross-browser compatibility (Chrome, Firefox, Safari)
- Mobile responsive (320px-768px)
- Accessibility (keyboard nav, screen readers, ARIA labels)
- E2E tests for mode switching scenarios
- Performance profiling (no memory leaks)

### Design

- Focus states follow design system (ring-ring)
- Mobile: YAML editor full-screen with readable font size
- Tablet: Same layout as desktop
- Dark mode support verified

## Architecture Decisions

### Keyboard Shortcuts

Use existing pattern from `canvas-header.tsx`:

```typescript
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    // Save: Cmd+S / Ctrl+S
    if ((e.metaKey || e.ctrlKey) && e.key === 's') {
      e.preventDefault();
      handleManualSave();
    }

    // Toggle mode: Cmd+Shift+Y / Ctrl+Shift+Y
    if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'y') {
      e.preventDefault();
      toggleMode();
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, []);
```

### Unsaved Changes Warning

Use browser `beforeunload` event:

```typescript
useEffect(() => {
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    if (isDirty) {
      e.preventDefault();
      e.returnValue = ''; // Required for Chrome
    }
  };

  window.addEventListener('beforeunload', handleBeforeUnload);
  return () => window.removeEventListener('beforeunload', handleBeforeUnload);
}, [isDirty]);
```

### Mode Persistence

Store last mode in event metadata (server-side):

```typescript
// When saving workflow
updateEvent.mutate({
  workspaceId,
  eventId,
  data: {
    yaml,
    metadata: {
      lastEditorMode: mode, // 'visual' | 'yaml'
    },
  },
});

// When loading event
const loadEvent = (event: WorkflowEvent) => {
  const preferredMode = event.metadata?.lastEditorMode || 'visual';
  set({ mode: preferredMode });
  // ... rest of load logic
};
```

### Viewport Preservation

Store viewport state when switching away from visual:

```typescript
// Store viewport before switching to YAML
if (mode === 'visual' && targetMode === 'yaml') {
  const viewport = reactFlowInstance.getViewport();
  sessionStorage.setItem('workflow-viewport', JSON.stringify(viewport));
}

// Restore viewport when switching back to visual
if (mode === 'yaml' && targetMode === 'visual') {
  const savedViewport = sessionStorage.getItem('workflow-viewport');
  if (savedViewport) {
    setTimeout(() => {
      reactFlowInstance.setViewport(JSON.parse(savedViewport));
    }, 100); // Wait for nodes to render
  }
}
```

## Related Code Files

**To modify**:

- `/apps/web/src/features/workflow-units/pages/workflow-event-editor.tsx` - Add shortcuts, warnings
- `/apps/web/src/features/workflow-units/stores/workflow-editor-store.ts` - Add viewport state
- `/apps/web/src/features/workflow-units/components/workflow-builder/yaml-editor.tsx` - Mobile styles

**To create**:

- `/apps/web/src/features/workflow-units/__tests__/yaml-editor-e2e.test.tsx` - E2E tests

## Implementation Steps

### Step 4.1: Add Keyboard Shortcuts (1h)

**File**: `/apps/web/src/features/workflow-units/pages/workflow-event-editor.tsx`

Add keyboard handler:

```typescript
export function WorkflowEventEditor() {
  const mode = useWorkflowEditorStore((state) => state.mode);
  const setMode = useWorkflowEditorStore((state) => state.setMode);
  const isDirty = useWorkflowEditorStore((state) => state.isDirty);

  // Toggle mode helper
  const toggleMode = useCallback(() => {
    const nextMode = mode === 'visual' ? 'yaml' : 'visual';
    setMode(nextMode);
    toast.success(`Switched to ${nextMode === 'visual' ? 'Visual' : 'YAML'} mode`);
  }, [mode, setMode]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle mode: Cmd+Shift+Y / Ctrl+Shift+Y
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'y') {
        e.preventDefault();
        toggleMode();
      }

      // Note: Cmd+S handled by CanvasHeader component
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleMode]);

  // ... rest of component
}
```

**Key features**:

- ✅ Cmd+Shift+Y toggles mode (both directions)
- ✅ Toast notification confirms switch
- ✅ Cross-platform (Cmd on Mac, Ctrl on Windows/Linux)

**Acceptance**:

- ✅ Cmd+Shift+Y switches Visual → YAML
- ✅ Cmd+Shift+Y switches YAML → Visual
- ✅ Toast shows confirmation
- ✅ Works on Mac, Windows, Linux

### Step 4.2: Unsaved Changes Warning (1h)

Add browser warning for unsaved changes:

```typescript
export function WorkflowEventEditor() {
  const isDirty = useWorkflowEditorStore((state) => state.isDirty);
  const yamlContent = useWorkflowEditorStore((state) => state.yamlContent);

  // Warn before closing tab/window
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = ''; // Standard requires empty string
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // ... rest
}
```

**Acceptance**:

- ✅ Browser shows "Leave site?" dialog if isDirty
- ✅ No warning if no unsaved changes
- ✅ Warning dismisses after save

### Step 4.3: Viewport Preservation (1.5h)

**File**: `/apps/web/src/features/workflow-units/stores/workflow-editor-store.ts`

Add viewport state:

```typescript
interface WorkflowEditorState {
  // ... existing

  // Viewport preservation
  savedViewport: { x: number; y: number; zoom: number } | null;
  setSavedViewport: (viewport: { x: number; y: number; zoom: number } | null) => void;
}
```

Update `setMode` logic:

```typescript
setMode: (targetMode) =>
  set((state) => {
    // Visual → YAML: save viewport
    if (state.mode === 'visual' && targetMode === 'yaml') {
      // Viewport saved by WorkflowCanvas component (has reactFlowInstance ref)
      // Store will receive setSavedViewport call from component

      // ... conversion logic from Phase 3
    }

    // YAML → Visual: mark to restore viewport
    if (state.mode === 'yaml' && targetMode === 'visual') {
      // ... conversion logic from Phase 3

      // Flag will be checked by WorkflowCanvas to restore viewport
      return {
        mode: targetMode,
        nodes,
        edges,
        yamlError: null,
        // savedViewport will be used by WorkflowCanvas
      };
    }

    // ...
  }),

setSavedViewport: (savedViewport) => set({ savedViewport }),
```

**File**: `/apps/web/src/features/workflow-units/components/workflow-builder/workflow-canvas.tsx`

Add viewport save/restore:

```typescript
export function WorkflowCanvas() {
  const { mode, savedViewport, setSavedViewport } = useWorkflowEditorStore();
  const reactFlowInstance = useReactFlow();

  // Save viewport when leaving visual mode
  useEffect(() => {
    if (mode === 'yaml') {
      const viewport = reactFlowInstance.getViewport();
      setSavedViewport(viewport);
    }
  }, [mode]);

  // Restore viewport when returning to visual mode
  useEffect(() => {
    if (mode === 'visual' && savedViewport) {
      setTimeout(() => {
        reactFlowInstance.setViewport(savedViewport);
        setSavedViewport(null); // Clear after restore
      }, 100); // Wait for nodes to render
    }
  }, [mode, savedViewport]);

  // ... rest
}
```

**Acceptance**:

- ✅ Zoom level preserved after YAML roundtrip
- ✅ Pan position preserved after YAML roundtrip
- ✅ Viewport resets if nodes change significantly

### Step 4.4: Mobile Responsive Styling (1-2h)

**File**: `/apps/web/src/features/workflow-units/components/workflow-builder/yaml-editor.tsx`

Update options for mobile:

```typescript
export function YamlEditor({ ... }: YamlEditorProps) {
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <Editor
      // ... existing props
      options={{
        readOnly,
        minimap: { enabled: !isMobile }, // Disable minimap on mobile
        lineNumbers: 'on',
        folding: true,
        scrollBeyondLastLine: false,
        wordWrap: 'on',
        fontSize: isMobile ? 12 : 14, // Smaller font on mobile
        tabSize: 2,
        insertSpaces: true,
        automaticLayout: true,
        scrollbar: {
          verticalScrollbarSize: isMobile ? 8 : 10,
          horizontalScrollbarSize: isMobile ? 8 : 10,
        },
      }}
    />
  );
}
```

Add media query hook:

```typescript
// /apps/web/src/hooks/use-media-query.ts
import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
}
```

**Acceptance**:

- ✅ Mobile: Minimap hidden, font 12px
- ✅ Tablet: Same as desktop
- ✅ Editor fills viewport on all screen sizes
- ✅ Scrollbars visible and usable

### Step 4.5: Accessibility Audit (1h)

Add ARIA labels and keyboard navigation:

**File**: `editor-mode-toggle.tsx`

```typescript
<Tabs value={mode} onValueChange={handleModeChange}>
  <TabsList
    className="grid w-full sm:w-[240px] grid-cols-2"
    aria-label="Editor mode selection"
  >
    <TabsTrigger
      value="visual"
      className="flex items-center gap-2"
      aria-label="Switch to visual editor"
    >
      <Workflow className="h-4 w-4" aria-hidden="true" />
      <span>Visual</span>
    </TabsTrigger>
    <TabsTrigger
      value="yaml"
      className="flex items-center gap-2"
      aria-label="Switch to YAML editor"
    >
      <Code2 className="h-4 w-4" aria-hidden="true" />
      <span>YAML</span>
    </TabsTrigger>
  </TabsList>
</Tabs>
```

**File**: `yaml-editor.tsx`

```typescript
<div
  role="region"
  aria-label="YAML workflow editor"
  className="h-full"
>
  <Editor
    // ... props
    options={{
      // ... existing
      ariaLabel: 'Workflow YAML code editor',
    }}
  />
</div>
```

Run accessibility checks:

```bash
# Install axe-core
pnpm add @axe-core/react --filter web --save-dev

# Add to main.tsx (dev only)
if (import.meta.env.DEV) {
  import('@axe-core/react').then((axe) => {
    axe.default(React, ReactDOM, 1000);
  });
}
```

**Acceptance**:

- ✅ Screen reader announces mode switches
- ✅ Tab navigation works (tabs, toolbar buttons, editor)
- ✅ Focus indicators visible (ring-ring)
- ✅ No axe-core violations

### Step 4.6: E2E Test Suite (2h)

**File**: `/apps/web/src/features/workflow-units/__tests__/yaml-editor-e2e.test.tsx`

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WorkflowEventEditor } from '../pages/workflow-event-editor';
import { useWorkflowEditorStore } from '../stores/workflow-editor-store';

describe('YAML Editor E2E', () => {
  beforeEach(() => {
    useWorkflowEditorStore.getState().reset();
  });

  it('should switch to YAML mode via tab click', async () => {
    render(<WorkflowEventEditor />);

    const yamlTab = screen.getByRole('tab', { name: /YAML/i });
    await userEvent.click(yamlTab);

    expect(useWorkflowEditorStore.getState().mode).toBe('yaml');
    expect(screen.getByLabelText(/YAML workflow editor/i)).toBeInTheDocument();
  });

  it('should switch to YAML mode via keyboard shortcut', async () => {
    render(<WorkflowEventEditor />);

    await userEvent.keyboard('{Meta>}{Shift>}y{/Shift}{/Meta}');

    await waitFor(() => {
      expect(useWorkflowEditorStore.getState().mode).toBe('yaml');
    });
  });

  it('should convert visual workflow to YAML on mode switch', async () => {
    const { getState } = useWorkflowEditorStore;

    // Setup: Load event with nodes
    getState().loadEvent({
      id: '1',
      eventName: 'Test Event',
      yaml: '...',
      // ...
    });

    render(<WorkflowEventEditor />);

    const yamlTab = screen.getByRole('tab', { name: /YAML/i });
    await userEvent.click(yamlTab);

    await waitFor(() => {
      const yamlContent = getState().yamlContent;
      expect(yamlContent).toContain('trigger:');
      expect(yamlContent).toContain('steps:');
    });
  });

  it('should block mode switch if YAML invalid', async () => {
    const { getState, setState } = useWorkflowEditorStore;

    setState({ mode: 'yaml', yamlContent: 'invalid: [ yaml' });

    render(<WorkflowEventEditor />);

    const visualTab = screen.getByRole('tab', { name: /Visual/i });
    await userEvent.click(visualTab);

    // Should stay in YAML mode
    await waitFor(() => {
      expect(getState().mode).toBe('yaml');
      expect(screen.getByText(/Validation errors/i)).toBeInTheDocument();
    });
  });

  it('should preserve viewport on roundtrip', async () => {
    // Test viewport preservation
  });

  it('should show unsaved changes warning', async () => {
    // Test beforeunload event
  });
});
```

Run tests:

```bash
pnpm --filter web test yaml-editor-e2e
```

**Acceptance**:

- ✅ All E2E tests pass
- ✅ Coverage > 80% for new code
- ✅ Tests run in < 30s

### Step 4.7: Cross-Browser Testing (1h)

Test in multiple browsers:

**Chrome (latest)**:

- ✅ Monaco loads correctly
- ✅ Syntax highlighting works
- ✅ Mode switching smooth
- ✅ Keyboard shortcuts work

**Firefox (latest)**:

- ✅ Same as Chrome
- ✅ No console errors
- ✅ Worker loads correctly

**Safari (latest)**:

- ✅ Same as Chrome
- ✅ Cmd key shortcuts work (not Ctrl)
- ✅ Font rendering correct

**Browsers to skip** (not supported):

- ❌ IE11 (EOL, not supported by Vite/React 19)
- ❌ Safari < 15 (no ES2020 support)

**Acceptance**:

- ✅ Feature works identically in Chrome, Firefox, Safari
- ✅ No browser-specific bugs
- ✅ Console clean (no errors/warnings)

## Todo List

- [ ] Add Cmd+Shift+Y keyboard shortcut to toggle mode
- [ ] Add unsaved changes warning (beforeunload)
- [ ] Implement viewport preservation (save/restore)
- [ ] Add mobile responsive styles (hide minimap, smaller font)
- [ ] Create useMediaQuery hook
- [ ] Add ARIA labels to tabs and editor
- [ ] Run axe-core accessibility audit
- [ ] Fix accessibility violations
- [ ] Write E2E tests for mode switching
- [ ] Write E2E tests for validation errors
- [ ] Write E2E tests for keyboard shortcuts
- [ ] Test in Chrome (latest)
- [ ] Test in Firefox (latest)
- [ ] Test in Safari (latest)
- [ ] Test on mobile devices (iOS, Android)
- [ ] Document keyboard shortcuts in UI
- [ ] Update README with editor usage

## Success Criteria

### Must Have

- ✅ Keyboard shortcuts work (Cmd+S, Cmd+Shift+Y)
- ✅ Unsaved changes warning displays
- ✅ Viewport preserved on roundtrip
- ✅ Mobile responsive (readable, usable)
- ✅ Chrome, Firefox, Safari compatible
- ✅ E2E tests pass

### Nice to Have

- ✅ ARIA labels for accessibility
- ✅ Screen reader compatible
- ✅ Keyboard navigation smooth
- ✅ No axe-core violations

### Performance

- ✅ Mode switch < 100ms (cached)
- ✅ No memory leaks (DevTools profile)
- ✅ Editor responsive on mobile

## Risk Assessment

**Low Risk**:

- Keyboard shortcuts well-tested pattern
- beforeunload standard browser API
- Accessibility tools available (axe-core)

**Medium Risk**:

- Safari may have quirks with Monaco
- Mobile performance may need optimization

**Mitigations**:

- Test Safari early
- Profile mobile performance
- Use code splitting for Monaco
- Add loading states for slow networks

## Unresolved Questions

1. Should we add keyboard shortcut help dialog? (Yes, add "?" shortcut to show modal)
2. Should viewport reset if workflow structure changes? (Yes, auto-layout on major changes)
3. Should we track mode usage analytics? (Yes, track mode switches and time spent)
