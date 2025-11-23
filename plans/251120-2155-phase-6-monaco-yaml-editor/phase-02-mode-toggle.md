# Phase 2: Mode Toggle UI

**Timeline**: Day 2-3 | **Effort**: 4-6h | **Status**: 🔴 Not Started

## Context

Add dual-mode interface allowing users to switch between Visual (React Flow) and YAML (Monaco) modes. Tabs component from @workspace/ui provides the switcher UI.

**Dependencies**: Phase 1 (Monaco setup) must be complete

## Key Insights from Research

1. **Store already has mode state**: `workflow-editor-store.ts` line 8-13
2. **Canvas header has toolbar pattern**: Can add tabs alongside existing buttons
3. **Tabs component exists**: `@workspace/ui/components/tabs`
4. **Conditional rendering**: React Flow vs Monaco based on mode

## Requirements

### Functional

- User clicks "Visual" or "YAML" tab to switch modes
- Active tab visually highlighted
- Switching modes triggers state update
- Canvas/editor swap instantly (no flicker)
- Toolbar buttons (Save, Auto-Layout, Export) remain visible in both modes

### Technical

- Zustand store `mode` state drives UI
- YamlEditor only mounts when mode === 'yaml'
- WorkflowCanvas only mounts when mode === 'visual'
- No memory leaks on repeated mode switches

### Design

- Tabs follow design system (border-input, focus-visible:ring-ring)
- Tabs positioned left side of canvas header
- Existing toolbar buttons stay right side
- Active tab: primary color background
- Inactive tab: ghost/outline style

## Architecture Decisions

### Store Extension

Already exists in `workflow-editor-store.ts`:

```typescript
mode: EditorMode; // 'visual' | 'yaml'
setMode: (mode: EditorMode) => void;
```

No changes needed to store in this phase (sync logic added in Phase 3).

### Component Hierarchy

```
<WorkflowEventEditor>
  <CanvasHeader>
    <EditorModeToggle />  // NEW: Tab switcher
    <div>                 // EXISTING: Toolbar buttons
  </CanvasHeader>

  {mode === 'visual' ? (
    <WorkflowCanvas />    // EXISTING: React Flow
  ) : (
    <YamlEditor />        // NEW: Monaco editor
  )}
</WorkflowEventEditor>
```

### Tab Switcher Design

Use shadcn/ui Tabs component for consistent styling:

```typescript
<Tabs value={mode} onValueChange={(v) => setMode(v as EditorMode)}>
  <TabsList>
    <TabsTrigger value="visual">
      <Workflow className="h-4 w-4 mr-2" />
      Visual
    </TabsTrigger>
    <TabsTrigger value="yaml">
      <Code2 className="h-4 w-4 mr-2" />
      YAML
    </TabsTrigger>
  </TabsList>
</Tabs>
```

## Related Code Files

**To create**:

- `/apps/web/src/features/workflow-units/components/workflow-builder/editor-mode-toggle.tsx`

**To modify**:

- `/apps/web/src/features/workflow-units/components/workflow-builder/canvas-header.tsx` - Add mode toggle
- `/apps/web/src/features/workflow-units/pages/workflow-event-editor.tsx` - Add conditional rendering

**Reference**:

- `/apps/web/src/features/workflow-units/stores/workflow-editor-store.ts` - Mode state
- `/packages/ui/src/components/tabs.tsx` - Tabs component
- `/apps/web/src/features/workflow-units/components/workflow-builder/yaml-editor.tsx` - Phase 1 editor

## Implementation Steps

### Step 2.1: Create EditorModeToggle Component (1h)

**File**: `/apps/web/src/features/workflow-units/components/workflow-builder/editor-mode-toggle.tsx`

```typescript
import { Tabs, TabsList, TabsTrigger } from '@workspace/ui/components/tabs';
import { Workflow, Code2 } from 'lucide-react';
import { useWorkflowEditorStore } from '../../stores/workflow-editor-store';
import type { EditorMode } from '../../stores/workflow-editor-store';

export function EditorModeToggle() {
  const mode = useWorkflowEditorStore((state) => state.mode);
  const setMode = useWorkflowEditorStore((state) => state.setMode);

  const handleModeChange = (value: string) => {
    setMode(value as EditorMode);
  };

  return (
    <Tabs value={mode} onValueChange={handleModeChange}>
      <TabsList className="grid w-[240px] grid-cols-2">
        <TabsTrigger value="visual" className="flex items-center gap-2">
          <Workflow className="h-4 w-4" />
          <span>Visual</span>
        </TabsTrigger>
        <TabsTrigger value="yaml" className="flex items-center gap-2">
          <Code2 className="h-4 w-4" />
          <span>YAML</span>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
```

**Key features**:

- ✅ Controlled component (value from store)
- ✅ Icon + text for clarity
- ✅ Fixed width for stable layout
- ✅ Grid layout for equal tab sizes

**Acceptance**:

- ✅ Component renders without errors
- ✅ Clicking tabs updates Zustand store
- ✅ Active tab visually distinct
- ✅ Icons display correctly

### Step 2.2: Update CanvasHeader with Mode Toggle (1h)

**File**: `/apps/web/src/features/workflow-units/components/workflow-builder/canvas-header.tsx`

Add import:

```typescript
import { EditorModeToggle } from './editor-mode-toggle';
```

Update toolbar layout (line 158-220):

```typescript
return (
  <div className="border-b bg-background p-4">
    <div className="flex items-center justify-between">
      {/* Left side: Event Info + Mode Toggle */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <h2 className="font-semibold text-lg">{currentEvent.eventName}</h2>
          <Badge variant={currentEvent.eventActive ? 'default' : 'secondary'}>
            {currentEvent.eventActive ? 'Active' : 'Inactive'}
          </Badge>
          {currentEvent.eventSourceType && (
            <Badge variant="outline" className="capitalize">
              {currentEvent.eventSourceType.replace('_', ' ').toLowerCase()}
            </Badge>
          )}
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* NEW: Mode Toggle */}
        <EditorModeToggle />
      </div>

      {/* Right side: Toolbar Actions */}
      <div className="flex items-center gap-3">
        {/* ... existing toolbar buttons ... */}
      </div>
    </div>
  </div>
);
```

**Acceptance**:

- ✅ Mode toggle appears left of toolbar
- ✅ Layout doesn't break on narrow screens
- ✅ Vertical separator provides visual separation
- ✅ Clicking tabs updates mode state

### Step 2.3: Update WorkflowEventEditor with Conditional Rendering (2h)

**File**: `/apps/web/src/features/workflow-units/pages/workflow-event-editor.tsx`

Add imports:

```typescript
import { YamlEditor } from '../components/workflow-builder/yaml-editor';
import { useWorkflowEditorStore } from '../stores/workflow-editor-store';
import { useState } from 'react';
```

Update component structure:

```typescript
export function WorkflowEventEditor() {
  const mode = useWorkflowEditorStore((state) => state.mode);
  const currentEvent = useWorkflowEditorStore((state) => state.currentEvent);
  const [yamlContent, setYamlContent] = useState('');
  const [yamlError, setYamlError] = useState<string[]>([]);

  // Initialize YAML content when mode switches (Phase 3 will add conversion)
  // For now, just show empty editor or current event YAML
  const displayYaml = currentEvent?.yaml || '# No workflow steps defined';

  return (
    <div className="flex flex-col h-full">
      <CanvasHeader workspaceId={workspaceId} />

      {/* Conditional rendering based on mode */}
      <div className="flex-1 relative">
        {mode === 'visual' ? (
          <>
            <NodePalette />
            <WorkflowCanvas />
            <NodeConfigPanel />
          </>
        ) : (
          <div className="h-full flex flex-col">
            {/* YAML Validation Errors */}
            {yamlError.length > 0 && (
              <Alert variant="destructive" className="m-4 mb-0">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>YAML Validation Errors:</strong>
                  <ul className="list-disc list-inside mt-2">
                    {yamlError.map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Monaco Editor */}
            <div className="flex-1">
              <YamlEditor
                value={displayYaml}
                onChange={(v) => setYamlContent(v || '')}
                onValidationError={setYamlError}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

**Key features**:

- ✅ Mode state drives which view renders
- ✅ Visual mode shows all canvas components
- ✅ YAML mode shows editor full-height
- ✅ Validation errors display above editor
- ✅ No unmounting/remounting of CanvasHeader (stays visible)

**Acceptance**:

- ✅ Switching to "Visual" shows React Flow canvas
- ✅ Switching to "YAML" shows Monaco editor
- ✅ No console errors on mode switch
- ✅ Layout fills viewport in both modes
- ✅ Toolbar buttons remain visible

### Step 2.4: Add Loading State for Editor (1h)

Improve UX with loading fallback for Monaco:

```typescript
import { Suspense, lazy } from 'react';

const YamlEditorLazy = lazy(() =>
  import('../components/workflow-builder/yaml-editor').then((m) => ({
    default: m.YamlEditor,
  }))
);

// In render
{mode === 'yaml' && (
  <Suspense
    fallback={
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Loading YAML editor...</span>
        </div>
      </div>
    }
  >
    <YamlEditorLazy ... />
  </Suspense>
)}
```

**Benefits**:

- ✅ Monaco only loads when YAML mode activated
- ✅ Reduces initial bundle size
- ✅ Visual feedback during load
- ✅ Improves perceived performance

**Acceptance**:

- ✅ First switch to YAML shows loader
- ✅ Subsequent switches instant (cached)
- ✅ Bundle analyzer shows Monaco in separate chunk

### Step 2.5: Mobile Responsive Adjustments (1h)

Ensure mode toggle works on mobile:

**File**: `editor-mode-toggle.tsx`

```typescript
export function EditorModeToggle() {
  const mode = useWorkflowEditorStore((state) => state.mode);
  const setMode = useWorkflowEditorStore((state) => state.setMode);

  return (
    <Tabs value={mode} onValueChange={(v) => setMode(v as EditorMode)}>
      <TabsList className="grid w-full sm:w-[240px] grid-cols-2">
        <TabsTrigger value="visual" className="flex items-center gap-2">
          <Workflow className="h-4 w-4" />
          <span className="hidden sm:inline">Visual</span>
          <span className="sm:hidden">V</span>
        </TabsTrigger>
        <TabsTrigger value="yaml" className="flex items-center gap-2">
          <Code2 className="h-4 w-4" />
          <span className="hidden sm:inline">YAML</span>
          <span className="sm:hidden">Y</span>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
```

**File**: `canvas-header.tsx`

Adjust header layout for mobile:

```typescript
<div className="border-b bg-background p-2 sm:p-4">
  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:justify-between">
    {/* Left side - stacks on mobile */}
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
      {/* Event info */}
      <div className="flex items-center gap-2 flex-wrap">
        <h2 className="font-semibold text-base sm:text-lg">{currentEvent.eventName}</h2>
        {/* ... badges ... */}
      </div>

      <Separator orientation="vertical" className="hidden sm:block h-6" />

      {/* Mode toggle */}
      <EditorModeToggle />
    </div>

    {/* Right side toolbar - horizontal scroll on mobile */}
    <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto w-full sm:w-auto">
      {/* ... toolbar buttons ... */}
    </div>
  </div>
</div>
```

**Acceptance**:

- ✅ Mobile: Mode toggle full-width, abbreviated labels
- ✅ Mobile: Header stacks vertically
- ✅ Tablet: Horizontal layout with full labels
- ✅ Desktop: Original layout preserved

## Todo List

- [ ] Create EditorModeToggle component with Tabs
- [ ] Add mode toggle to CanvasHeader
- [ ] Update WorkflowEventEditor with conditional rendering
- [ ] Add Visual mode rendering (WorkflowCanvas + panels)
- [ ] Add YAML mode rendering (YamlEditor)
- [ ] Display validation errors above YAML editor
- [ ] Add Suspense lazy loading for Monaco
- [ ] Test mode switching works both directions
- [ ] Verify no console errors on mode switch
- [ ] Test mobile responsive layout
- [ ] Test tablet layout (768px-1024px)
- [ ] Verify toolbar buttons visible in both modes
- [ ] Document mode switching behavior

## Success Criteria

### Must Have

- ✅ Tab switcher renders in canvas header
- ✅ Clicking "Visual" shows React Flow canvas
- ✅ Clicking "YAML" shows Monaco editor
- ✅ Active tab visually highlighted
- ✅ Mode state persists in Zustand
- ✅ No layout shift when switching modes

### Nice to Have

- ✅ Lazy loading reduces initial bundle
- ✅ Loading spinner on first YAML switch
- ✅ Mobile-friendly tab labels
- ✅ Smooth transition between modes

### Performance

- ✅ Mode switch < 100ms (cached)
- ✅ First YAML load < 1s
- ✅ No memory leaks after 10+ switches

## Risk Assessment

**Low Risk**:

- Tabs component well-tested in shadcn/ui
- Conditional rendering is standard React pattern
- Store already has mode state

**Medium Risk**:

- Mobile layout may need iteration
- Lazy loading may cause flash

**Mitigations**:

- Test on real devices early
- Add loading fallback for Monaco
- Use CSS transitions for smooth mode switch

## Unresolved Questions

1. Should mode preference persist in localStorage? (No, use last-saved mode from event)
2. Should we show tooltip on tabs? (Yes: "Switch to visual editor" / "Switch to YAML editor")
3. Should keyboard shortcut toggle mode? (Yes, Phase 4: Cmd+Shift+Y)
