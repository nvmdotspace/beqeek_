# Phase 3: Bidirectional Sync

**Timeline**: Day 3-4 | **Effort**: 6-8h | **Status**: 🔴 Not Started

## Context

Implement bidirectional conversion between Visual (React Flow nodes/edges) and YAML modes. Conversion happens automatically on mode switch, preserving workflow state with validation.

**Dependencies**: Phase 1 (Monaco) + Phase 2 (Mode Toggle) complete

## Key Insights from Research

1. **Conversion utilities exist**: `yaml-converter.ts` has `reactFlowToYAML()` and `yamlToReactFlow()`
2. **Validation exists**: `yaml-parser.ts` uses Zod schemas for structure validation
3. **Store has trigger**: `setMode()` is perfect hook for conversion
4. **Dirty state**: Already tracked via `isDirty` flag
5. **Error handling**: `parseError` state already exists

## Requirements

### Functional

- **Visual → YAML**: Converting canvas to YAML shows current workflow structure
- **YAML → Visual**: Valid YAML updates canvas nodes/edges
- **Validation**: Invalid YAML blocks mode switch to Visual with clear error
- **Lossless**: Round-trip (Visual→YAML→Visual) preserves all data
- **Auto-save**: Mode switch triggers save if dirty

### Technical

- Conversion triggered by `setMode()` middleware
- Validation errors stored in `parseError` state
- Monaco markers show inline errors
- Alert component shows validation errors
- Debounced onChange (300ms) prevents re-render loops

### Design

- Alert banner above editor shows validation errors
- Monaco inline squigglies for syntax errors
- Error messages user-friendly (not Zod internals)
- Loading state during conversion (if > 100ms)

## Architecture Decisions

### Conversion Flow

**Visual → YAML**:

```
User clicks "YAML" tab
  ↓
setMode('yaml') called
  ↓
Middleware: reactFlowToYAML(nodes, edges, trigger)
  ↓
Store yamlContent state
  ↓
YamlEditor renders with yamlContent
```

**YAML → Visual**:

```
User clicks "Visual" tab
  ↓
setMode('visual') called
  ↓
Middleware: validateWorkflowYAML(yamlContent)
  ↓
If valid: yamlToReactFlow(yamlContent) → update nodes/edges
  ↓
If invalid: stay in YAML mode, show errors
  ↓
WorkflowCanvas renders with updated nodes/edges
```

### Store Extension

**File**: `/apps/web/src/features/workflow-units/stores/workflow-editor-store.ts`

Add state:

```typescript
interface WorkflowEditorState {
  // ... existing state

  // YAML state
  yamlContent: string;
  yamlError: string | null;
  setYamlContent: (yaml: string) => void;
  setYamlError: (error: string | null) => void;

  // Enhanced setMode with conversion
  setMode: (mode: EditorMode) => void;
}
```

Add middleware logic:

```typescript
setMode: (targetMode) =>
  set((state) => {
    try {
      // Visual → YAML
      if (state.mode === 'visual' && targetMode === 'yaml') {
        const yaml = reactFlowToYAML(state.nodes, state.edges, {
          type: state.currentEvent?.eventSourceType.toLowerCase(),
          config: state.currentEvent?.eventSourceParams,
        });

        return {
          mode: targetMode,
          yamlContent: yaml,
          yamlError: null,
        };
      }

      // YAML → Visual
      if (state.mode === 'yaml' && targetMode === 'visual') {
        const validationResult = validateWorkflowYAML(state.yamlContent);

        if (!validationResult.success) {
          // Block mode switch, show errors
          return {
            yamlError: validationResult.errors.join('\n'),
          };
        }

        const { nodes, edges } = yamlToReactFlow(state.yamlContent);

        return {
          mode: targetMode,
          nodes,
          edges,
          yamlError: null,
          isDirty: true, // Mark dirty since canvas updated
        };
      }

      // Fallback: just switch mode
      return { mode: targetMode };
    } catch (error) {
      return {
        yamlError: error instanceof Error ? error.message : 'Conversion failed',
      };
    }
  }),
```

### Validation Error Display

**Monaco inline errors**: Handled by monaco-yaml automatically
**Banner errors**: Show above editor for structural errors

## Related Code Files

**To modify**:

- `/apps/web/src/features/workflow-units/stores/workflow-editor-store.ts` - Add sync logic
- `/apps/web/src/features/workflow-units/pages/workflow-event-editor.tsx` - Wire up yamlContent state

**Reference**:

- `/apps/web/src/features/workflow-units/utils/yaml-converter.ts` - Conversion functions
- `/apps/web/src/features/workflow-units/utils/yaml-parser.ts` - Validation
- `/apps/web/src/features/workflow-units/utils/yaml-serializer.ts` - YAML formatting

## Implementation Steps

### Step 3.1: Extend Zustand Store with YAML State (1h)

**File**: `/apps/web/src/features/workflow-units/stores/workflow-editor-store.ts`

Add state (after line 47):

```typescript
interface WorkflowEditorState {
  // ... existing

  // YAML editor state
  yamlContent: string;
  yamlError: string | null;
  isConverting: boolean;
  setYamlContent: (yaml: string) => void;
  setYamlError: (error: string | null) => void;
}
```

Add to initialState (after line 60):

```typescript
const initialState = {
  // ... existing
  yamlContent: '',
  yamlError: null,
  isConverting: false,
};
```

Add actions (after line 122):

```typescript
setYamlContent: (yamlContent) =>
  set({ yamlContent, isDirty: true }),

setYamlError: (yamlError) =>
  set({ yamlError }),
```

**Acceptance**:

- ✅ TypeScript compiles without errors
- ✅ Store has yamlContent and yamlError state
- ✅ Setters update state correctly

### Step 3.2: Implement Visual → YAML Conversion (2h)

Update `setMode` action:

```typescript
setMode: (targetMode) =>
  set((state) => {
    // Visual → YAML conversion
    if (state.mode === 'visual' && targetMode === 'yaml') {
      try {
        set({ isConverting: true });

        const yaml = reactFlowToYAML(state.nodes, state.edges, {
          type: state.currentEvent?.eventSourceType.toLowerCase() as any,
          config: (state.currentEvent?.eventSourceParams || {}) as Record<string, unknown>,
        });

        return {
          mode: targetMode,
          yamlContent: yaml,
          yamlError: null,
          isConverting: false,
        };
      } catch (error) {
        console.error('Failed to convert visual to YAML:', error);

        return {
          yamlError:
            error instanceof Error
              ? `Conversion failed: ${error.message}`
              : 'Failed to convert workflow to YAML',
          isConverting: false,
        };
      }
    }

    // Just switch mode if no conversion needed
    return { mode: targetMode };
  }),
```

**Key features**:

- ✅ Uses existing `reactFlowToYAML()` utility
- ✅ Includes trigger config from currentEvent
- ✅ Sets loading state during conversion
- ✅ Catches errors and displays to user
- ✅ Updates yamlContent for Monaco

**Acceptance**:

- ✅ Switching to YAML shows workflow structure
- ✅ Empty canvas shows minimal YAML (trigger only)
- ✅ Complex workflow (10+ nodes) converts successfully
- ✅ Error toast if conversion fails

### Step 3.3: Implement YAML → Visual Conversion (2-3h)

Extend `setMode` action:

```typescript
setMode: (targetMode) =>
  set((state) => {
    // Visual → YAML (from Step 3.2)
    // ...

    // YAML → Visual conversion
    if (state.mode === 'yaml' && targetMode === 'visual') {
      try {
        set({ isConverting: true });

        // Validate YAML structure first
        const validationResult = validateWorkflowYAML(state.yamlContent);

        if (!validationResult.success) {
          // Validation failed - block mode switch
          const errorMessage = validationResult.errors
            .map((err, idx) => `${idx + 1}. ${err}`)
            .join('\n');

          toast.error('Cannot switch to Visual mode', {
            description: 'Fix YAML errors before switching modes',
          });

          return {
            yamlError: `Validation errors:\n${errorMessage}`,
            isConverting: false,
            // Do NOT change mode - stay in YAML
          };
        }

        // Valid YAML - convert to React Flow
        const { nodes, edges } = yamlToReactFlow(state.yamlContent);

        return {
          mode: targetMode,
          nodes,
          edges,
          yamlError: null,
          isDirty: true, // Mark dirty since canvas updated
          isConverting: false,
        };
      } catch (error) {
        console.error('Failed to convert YAML to visual:', error);

        toast.error('Conversion failed', {
          description: error instanceof Error ? error.message : 'Invalid workflow structure',
        });

        return {
          yamlError:
            error instanceof Error
              ? `Conversion failed: ${error.message}`
              : 'Failed to parse YAML workflow',
          isConverting: false,
          // Stay in YAML mode
        };
      }
    }

    // Fallback
    return { mode: targetMode };
  }),
```

**Key features**:

- ✅ Validates before conversion (uses `validateWorkflowYAML()`)
- ✅ Blocks mode switch if validation fails
- ✅ Shows numbered error list
- ✅ Updates nodes/edges on success
- ✅ Marks workflow dirty (shows "Unsaved changes")
- ✅ Toast notification for errors

**Acceptance**:

- ✅ Valid YAML converts to canvas
- ✅ Invalid YAML shows errors, stays in YAML mode
- ✅ Error list numbered and clear
- ✅ Canvas updates with new nodes/edges
- ✅ isDirty flag set correctly

### Step 3.4: Wire YAML State to Editor Component (1h)

**File**: `/apps/web/src/features/workflow-units/pages/workflow-event-editor.tsx`

Update to use store state:

```typescript
export function WorkflowEventEditor() {
  const mode = useWorkflowEditorStore((state) => state.mode);
  const yamlContent = useWorkflowEditorStore((state) => state.yamlContent);
  const yamlError = useWorkflowEditorStore((state) => state.yamlError);
  const setYamlContent = useWorkflowEditorStore((state) => state.setYamlContent);
  const setYamlError = useWorkflowEditorStore((state) => state.setYamlError);
  const isConverting = useWorkflowEditorStore((state) => state.isConverting);

  // Debounced onChange to prevent re-render loops
  const debouncedSetYaml = useMemo(
    () =>
      debounce((value: string) => {
        setYamlContent(value);
      }, 300),
    [setYamlContent]
  );

  useEffect(() => {
    return () => debouncedSetYaml.cancel();
  }, [debouncedSetYaml]);

  return (
    <div className="flex flex-col h-full">
      <CanvasHeader workspaceId={workspaceId} />

      <div className="flex-1 relative">
        {isConverting && (
          <div className="absolute inset-0 bg-background/80 z-50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="text-sm text-muted-foreground">Converting workflow...</span>
            </div>
          </div>
        )}

        {mode === 'visual' ? (
          <>
            <NodePalette />
            <WorkflowCanvas />
            <NodeConfigPanel />
          </>
        ) : (
          <div className="h-full flex flex-col">
            {/* Validation Error Banner */}
            {yamlError && (
              <Alert variant="destructive" className="m-4 mb-0 rounded-b-none">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>YAML Validation Errors:</strong>
                  <pre className="mt-2 text-xs whitespace-pre-wrap font-mono">
                    {yamlError}
                  </pre>
                </AlertDescription>
              </Alert>
            )}

            {/* Monaco Editor */}
            <div className="flex-1">
              <YamlEditor
                value={yamlContent}
                onChange={(v) => debouncedSetYaml(v || '')}
                onValidationError={(errors) => {
                  if (errors.length > 0) {
                    setYamlError(errors.join('\n'));
                  } else {
                    setYamlError(null);
                  }
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

Add debounce utility (install if needed):

```typescript
// Install: pnpm add lodash-es @types/lodash-es --filter web
import { debounce } from 'lodash-es';
```

**Key features**:

- ✅ Debounced onChange (300ms) prevents render thrashing
- ✅ Error banner shows above editor
- ✅ Loading overlay during conversion
- ✅ Monaco validation errors also display in banner

**Acceptance**:

- ✅ Typing in editor updates store (after debounce)
- ✅ Validation errors show immediately
- ✅ Loading overlay appears during mode switch
- ✅ No performance issues typing fast

### Step 3.5: Round-Trip Testing (1-2h)

Create test suite to verify lossless conversion:

**File**: `/apps/web/src/features/workflow-units/utils/__tests__/yaml-roundtrip.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { yamlToReactFlow, reactFlowToYAML } from '../yaml-converter';

describe('YAML Roundtrip Conversion', () => {
  it('should preserve simple workflow (trigger + 1 step)', () => {
    const originalYaml = `
trigger:
  type: active_table
  config:
    tableId: "123"

steps:
  - id: step_1
    name: "Test step"
    type: conditional
    config:
      condition: "status == 'active'"
`.trim();

    // YAML → React Flow
    const { nodes, edges } = yamlToReactFlow(originalYaml);
    expect(nodes).toHaveLength(2); // trigger + 1 step
    expect(edges).toHaveLength(1); // trigger → step

    // React Flow → YAML
    const convertedYaml = reactFlowToYAML(nodes, edges, {
      type: 'active_table',
      config: { tableId: '123' },
    });

    // Parse both and compare structures
    const { nodes: nodes2, edges: edges2 } = yamlToReactFlow(convertedYaml);

    expect(nodes2).toEqual(nodes);
    expect(edges2).toEqual(edges);
  });

  it('should preserve complex workflow (10 nodes, 12 edges)', () => {
    // Test large workflow
  });

  it('should preserve all node config fields', () => {
    // Test field preservation
  });

  it('should handle workflows with parallel branches', () => {
    // Test branching logic
  });
});
```

Run tests:

```bash
pnpm --filter web test yaml-roundtrip
```

**Acceptance**:

- ✅ All tests pass
- ✅ Simple workflows (1-3 nodes) roundtrip perfectly
- ✅ Complex workflows (10+ nodes) roundtrip perfectly
- ✅ No data loss in conversion

## Todo List

- [ ] Add yamlContent and yamlError to Zustand store
- [ ] Implement Visual → YAML conversion in setMode()
- [ ] Implement YAML → Visual conversion with validation
- [ ] Add validation error handling (block mode switch)
- [ ] Wire yamlContent state to YamlEditor component
- [ ] Add debounced onChange to prevent re-render loops
- [ ] Display validation errors in Alert banner
- [ ] Add loading overlay during conversion
- [ ] Create round-trip test suite
- [ ] Test simple workflows (1-3 nodes)
- [ ] Test complex workflows (10+ nodes)
- [ ] Test parallel branches and loops
- [ ] Test error cases (invalid YAML, missing fields)
- [ ] Document conversion behavior

## Success Criteria

### Must Have

- ✅ Visual → YAML shows current workflow
- ✅ YAML → Visual updates canvas
- ✅ Invalid YAML blocks mode switch
- ✅ Error messages clear and actionable
- ✅ Round-trip preserves all data
- ✅ No infinite re-render loops

### Nice to Have

- ✅ Debounced onChange (300ms)
- ✅ Loading state during conversion
- ✅ Toast notifications for errors
- ✅ Monaco inline errors + banner errors

### Performance

- ✅ Conversion < 200ms for 100-node workflows
- ✅ No memory leaks after 20+ mode switches
- ✅ Editor responsive while typing

## Risk Assessment

**High Risk**:

- Round-trip may lose data if serializer incomplete

**Medium Risk**:

- Validation errors may be cryptic (Zod internals)
- Debounce may feel laggy

**Low Risk**:

- Conversion already implemented and tested

**Mitigations**:

- Comprehensive round-trip test suite
- Format Zod errors into plain English
- Use 300ms debounce (imperceptible lag)
- Test with real workflows from production

## Unresolved Questions

1. Should we preserve YAML comments? (No, serializer doesn't support)
2. Should invalid YAML show diff view? (No, too complex for MVP)
3. Should we auto-fix common YAML errors? (No, explicit is better)
4. Should we warn before discarding YAML changes? (Yes, Phase 4: unsaved changes warning)
