# Research Report: Monaco Editor + YAML for Workflow Dual-Mode UI

Date: 2025-11-20 | Focus: Monaco Editor, monaco-yaml, React Flow ↔ YAML Bidirectional Sync

## Executive Summary

Monaco Editor v0.54.0 with @monaco-editor/react v4.7.0 provides production-ready YAML editing via monaco-yaml v5.4.0. React Flow serialization is JSON-based; bidirectional sync requires js-yaml (already installed). Key challenges: state synchronization across modes, unsaved changes handling, schema-driven validation.

---

## 1. PACKAGE VERSIONS & INSTALLATION

### Current Status in Beqeek

- ✅ **@monaco-editor/react**: v4.7.0 (already installed)
- ✅ **js-yaml**: v4.1.1 + @types/js-yaml v4.0.9 (already installed)
- ❌ **monaco-yaml**: v5.4.0 (NOT installed - required)
- ❌ **monaco-editor**: v0.54.0 (NOT installed - peer dependency for types)

### Installation Command

```bash
pnpm add monaco-yaml@5.4.0 monaco-editor@0.54.0
```

### React 19 Compatibility

- @monaco-editor/react v4.7.0 fully supports React 19
- No RC version needed (v4.7.0-rc.0 has been promoted to stable)

---

## 2. MONACO EDITOR BASIC SETUP

### TypeScript Integration Pattern

```tsx
import Editor, { useMonaco } from '@monaco-editor/react';
import { useRef, useEffect } from 'react';
import * as monaco from 'monaco-editor';

interface YamlEditorProps {
  value: string;
  onChange: (value: string | undefined) => void;
  schema?: object;
  readOnly?: boolean;
}

export function YamlEditor({ value, onChange, schema, readOnly = false }: YamlEditorProps) {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const monacoInstance = useMonaco();

  function handleEditorDidMount(editor: monaco.editor.IStandaloneCodeEditor, monacoRef: typeof monaco) {
    editorRef.current = editor;

    // Focus management
    editor.focus();
  }

  return (
    <Editor
      height="100%"
      defaultLanguage="yaml"
      value={value}
      onChange={onChange}
      onMount={handleEditorDidMount}
      options={{
        minimap: { enabled: false },
        lineNumbers: 'on',
        readOnly,
        scrollBeyondLastLine: false,
        fontSize: 14,
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        tabSize: 2,
        insertSpaces: true,
        wordWrap: 'on',
        automaticLayout: true, // Auto-resize on container size change
      }}
      theme="vs-dark" // or "vs-light", "hc-black"
    />
  );
}
```

### Editor Options Reference

| Option                 | Type                          | Default | Purpose                                                      |
| ---------------------- | ----------------------------- | ------- | ------------------------------------------------------------ |
| `minimap.enabled`      | boolean                       | true    | Show code minimap (disable for small editors)                |
| `lineNumbers`          | 'on'\|'off'\|'relative'       | 'on'    | Line number display                                          |
| `readOnly`             | boolean                       | false   | Prevent editing                                              |
| `scrollBeyondLastLine` | boolean                       | true    | Allow scrolling past EOF                                     |
| `fontSize`             | number                        | 14      | Font size in px                                              |
| `tabSize`              | number                        | 4       | Spaces per tab                                               |
| `wordWrap`             | 'on'\|'off'\|'wordWrapColumn' | 'off'   | Text wrapping                                                |
| `automaticLayout`      | boolean                       | false   | Auto-resize on container change (CRITICAL for responsive UI) |
| `formatOnPaste`        | boolean                       | false   | Auto-format pasted content                                   |
| `formatOnType`         | boolean                       | false   | Auto-format while typing                                     |

**Performance Note**: Disable minimap for editors <50 lines. Use `automaticLayout: true` instead of manual `editor.layout()` calls.

---

## 3. MONACO-YAML CONFIGURATION

### Worker Setup (Vite)

**Critical**: Monaco workers must be registered in Vite config or via MonacoEnvironment.

**Option 1: Explicit Worker Registration (Recommended for Vite)**

```typescript
// src/workers/monaco-workers.ts
import * as monaco from 'monaco-editor';
import { configureMonacoYaml } from 'monaco-yaml';
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import YamlWorker from 'monaco-yaml/yaml.worker?worker';

window.MonacoEnvironment = {
  getWorker(_: string, label: string) {
    if (label === 'yaml') {
      return new YamlWorker();
    }
    return new EditorWorker();
  },
};

export { configureMonacoYaml };
```

**Option 2: Dynamic Import (Fallback)**

```typescript
window.MonacoEnvironment = {
  getWorker(moduleId, label) {
    switch (label) {
      case 'yaml':
        return new Worker(new URL('monaco-yaml/yaml.worker', import.meta.url));
      default:
        return new Worker(new URL('monaco-editor/esm/vs/editor/editor.worker', import.meta.url));
    }
  },
};
```

### Schema-Based Validation Setup

```tsx
import { useEffect } from 'react';
import { useMonaco } from '@monaco-editor/react';
import { configureMonacoYaml } from 'monaco-yaml';

const WORKFLOW_SCHEMA = {
  type: 'object',
  required: ['workflow_name', 'units'],
  properties: {
    workflow_name: { type: 'string', minLength: 1 },
    description: { type: 'string' },
    units: {
      type: 'array',
      items: {
        type: 'object',
        required: ['id', 'type', 'config'],
        properties: {
          id: { type: 'string', pattern: '^[a-zA-Z0-9_-]+$' },
          type: { type: 'string', enum: ['trigger', 'action', 'condition'] },
          config: { type: 'object' },
        },
      },
    },
  },
};

export function useYamlValidation(uri: string = '**/*.workflow.yaml') {
  const monaco = useMonaco();

  useEffect(() => {
    if (!monaco) return;

    const disposable = configureMonacoYaml(monaco, {
      enableSchemaRequest: true,
      hover: true,
      completion: true,
      validate: true,
      format: true,
      schemas: [
        {
          uri: 'https://beqeek.local/schemas/workflow.json', // Document schema source
          fileMatch: [uri], // Glob pattern
          schema: WORKFLOW_SCHEMA,
        },
      ],
    });

    return () => disposable?.dispose();
  }, [monaco, uri]);
}
```

### Configuration Options

| Option                | Type         | Default | Purpose                                  |
| --------------------- | ------------ | ------- | ---------------------------------------- |
| `validate`            | boolean      | true    | Enable schema validation (red squiggles) |
| `completion`          | boolean      | true    | Schema-based autocomplete (Ctrl+Space)   |
| `hover`               | boolean      | true    | Show field descriptions on hover         |
| `format`              | boolean      | true    | Enable Prettier formatting (Shift+Alt+F) |
| `enableSchemaRequest` | boolean      | false   | Fetch remote schemas via HTTP            |
| `customTags`          | string[]     | []      | Custom YAML tags (e.g., '!include')      |
| `yamlVersion`         | '1.1'\|'1.2' | '1.2'   | YAML spec version                        |

**Gotcha**: `enableSchemaRequest: true` requires CORS-enabled schema URLs. For local schemas, embed inline.

---

## 4. REACT FLOW ↔ YAML BIDIRECTIONAL CONVERSION

### React Flow Serialization Structure

```typescript
// React Flow native format
interface ReactFlowData {
  nodes: Node[]; // Array of node objects
  edges: Edge[]; // Array of edge objects
  viewport: Viewport; // { x, y, zoom }
}

// Get current flow state
const { getNodes, getEdges, getViewport } = useReactFlow();
const flowData = {
  nodes: getNodes(),
  edges: getEdges(),
  viewport: getViewport(),
};
```

### Conversion Utilities

```typescript
// apps/web/src/features/workflow-units/utils/yaml-conversion.ts
import yaml from 'js-yaml';
import type { Node, Edge, Viewport } from '@xyflow/react';

export interface WorkflowYaml {
  workflow_name: string;
  description?: string;
  viewport?: { x: number; y: number; zoom: number };
  units: Array<{
    id: string;
    type: string;
    position: { x: number; y: number };
    data: Record<string, unknown>;
  }>;
  connections: Array<{
    id: string;
    source: string;
    target: string;
    sourceHandle?: string;
    targetHandle?: string;
  }>;
}

// React Flow → YAML
export function flowToYaml(nodes: Node[], edges: Edge[], viewport: Viewport, name: string): string {
  const yamlData: WorkflowYaml = {
    workflow_name: name,
    viewport: { x: viewport.x, y: viewport.y, zoom: viewport.zoom },
    units: nodes.map((node) => ({
      id: node.id,
      type: node.type || 'default',
      position: node.position,
      data: node.data,
    })),
    connections: edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle,
      targetHandle: edge.targetHandle,
    })),
  };

  return yaml.dump(yamlData, {
    indent: 2,
    lineWidth: 120,
    noRefs: true, // Prevent YAML anchors/aliases
  });
}

// YAML → React Flow
export function yamlToFlow(yamlText: string): {
  nodes: Node[];
  edges: Edge[];
  viewport: Viewport;
  name: string;
} {
  const data = yaml.load(yamlText) as WorkflowYaml;

  const nodes: Node[] = data.units.map((unit) => ({
    id: unit.id,
    type: unit.type,
    position: unit.position,
    data: unit.data,
  }));

  const edges: Edge[] = data.connections.map((conn) => ({
    id: conn.id,
    source: conn.source,
    target: conn.target,
    sourceHandle: conn.sourceHandle,
    targetHandle: conn.targetHandle,
  }));

  const viewport: Viewport = data.viewport || { x: 0, y: 0, zoom: 1 };

  return { nodes, edges, viewport, name: data.workflow_name };
}

// Validation utility
export function validateYamlStructure(yamlText: string): { valid: boolean; error?: string } {
  try {
    const data = yaml.load(yamlText);

    if (!data || typeof data !== 'object') {
      return { valid: false, error: 'Invalid YAML structure' };
    }

    const required = ['workflow_name', 'units', 'connections'];
    for (const field of required) {
      if (!(field in data)) {
        return { valid: false, error: `Missing required field: ${field}` };
      }
    }

    return { valid: true };
  } catch (err) {
    return { valid: false, error: (err as Error).message };
  }
}
```

**Key Considerations**:

- Use `noRefs: true` in yaml.dump() to prevent YAML anchors (incompatible with JSON Schema validation)
- Store viewport data for visual consistency across modes
- Validate YAML structure before converting to React Flow (prevents UI crashes)

---

## 5. DUAL-MODE UI/UX PATTERNS

### State Management Strategy

```tsx
// apps/web/src/features/workflow-units/stores/workflow-editor-store.ts
import { create } from 'zustand';
import type { Node, Edge, Viewport } from '@xyflow/react';

type EditorMode = 'visual' | 'code';

interface WorkflowEditorState {
  mode: EditorMode;
  hasUnsavedChanges: boolean;
  yamlContent: string;
  yamlError: string | null;

  // Visual mode state
  nodes: Node[];
  edges: Edge[];
  viewport: Viewport;

  // Actions
  setMode: (mode: EditorMode) => void;
  setYamlContent: (content: string) => void;
  setYamlError: (error: string | null) => void;
  syncVisualToYaml: () => void;
  syncYamlToVisual: () => void;
  markDirty: () => void;
  markClean: () => void;
}

export const useWorkflowEditorStore = create<WorkflowEditorState>((set, get) => ({
  mode: 'visual',
  hasUnsavedChanges: false,
  yamlContent: '',
  yamlError: null,
  nodes: [],
  edges: [],
  viewport: { x: 0, y: 0, zoom: 1 },

  setMode: (mode) => set({ mode }),
  setYamlContent: (content) => set({ yamlContent: content, yamlError: null }),
  setYamlError: (error) => set({ yamlError: error }),
  markDirty: () => set({ hasUnsavedChanges: true }),
  markClean: () => set({ hasUnsavedChanges: false }),

  syncVisualToYaml: () => {
    const { nodes, edges, viewport } = get();
    const yaml = flowToYaml(nodes, edges, viewport, 'Workflow');
    set({ yamlContent: yaml });
  },

  syncYamlToVisual: () => {
    const { yamlContent } = get();
    const validation = validateYamlStructure(yamlContent);

    if (!validation.valid) {
      set({ yamlError: validation.error });
      return;
    }

    try {
      const { nodes, edges, viewport } = yamlToFlow(yamlContent);
      set({ nodes, edges, viewport, yamlError: null });
    } catch (err) {
      set({ yamlError: (err as Error).message });
    }
  },
}));
```

### Tab Switching Component

```tsx
// apps/web/src/features/workflow-units/components/workflow-builder/mode-switcher.tsx
import { Tabs, TabsList, TabsTrigger } from '@workspace/ui/components/tabs';
import { AlertDialog } from '@workspace/ui/components/alert-dialog';
import { useWorkflowEditorStore } from '../../stores/workflow-editor-store';

export function ModeSwitcher() {
  const { mode, hasUnsavedChanges, setMode, syncVisualToYaml, syncYamlToVisual } = useWorkflowEditorStore();
  const [showWarning, setShowWarning] = useState(false);
  const [pendingMode, setPendingMode] = useState<'visual' | 'code' | null>(null);

  const handleModeChange = (newMode: 'visual' | 'code') => {
    if (newMode === mode) return;

    // Sync content before switching
    if (mode === 'visual') {
      syncVisualToYaml(); // Always sync visual → YAML
      setMode(newMode);
    } else {
      // Switching from code → visual requires validation
      const validation = validateYamlStructure(useWorkflowEditorStore.getState().yamlContent);

      if (!validation.valid) {
        setPendingMode(newMode);
        setShowWarning(true); // Show error dialog
        return;
      }

      syncYamlToVisual();
      setMode(newMode);
    }
  };

  return (
    <>
      <Tabs value={mode} onValueChange={handleModeChange}>
        <TabsList>
          <TabsTrigger value="visual">Visual Builder</TabsTrigger>
          <TabsTrigger value="code">YAML Code</TabsTrigger>
        </TabsList>
      </Tabs>

      <AlertDialog open={showWarning} onOpenChange={setShowWarning}>
        {/* Error dialog content */}
      </AlertDialog>
    </>
  );
}
```

### UX Best Practices

1. **Auto-sync direction**: Visual → YAML (lossless), YAML → Visual (validation required)
2. **Validation timing**: On mode switch (not on every keystroke - performance)
3. **Error display**: Inline Monaco markers + AlertDialog for critical errors
4. **Loading states**: Show skeleton during YAML parsing (>100 nodes can take 100-300ms)
5. **Keyboard shortcuts**: Ctrl+S (save), Ctrl+Shift+P (format), Escape (cancel)

---

## 6. ACCESSIBILITY & THEME CONSIDERATIONS

### Keyboard Navigation

Monaco Editor has built-in keyboard support:

- **Tab/Shift+Tab**: Navigate focusable elements
- **Ctrl+Space**: Trigger autocomplete
- **F1**: Open command palette
- **Ctrl+F**: Find in editor
- **Alt+Up/Down**: Move line up/down

**Integrate with TanStack Router**: Prevent Ctrl+K (command palette) conflicts.

### Theme Integration

```tsx
import { useTheme } from '@workspace/ui/hooks/use-theme';

export function ThemedYamlEditor() {
  const { theme } = useTheme(); // 'light' | 'dark'

  return (
    <Editor
      theme={theme === 'dark' ? 'vs-dark' : 'vs-light'}
      // ... other props
    />
  );
}
```

**Custom Theme**: Define via `monaco.editor.defineTheme()` for brand consistency. See design-system.md tokens.

### Screen Reader Support

- Monaco has ARIA labels for editor regions
- Add `aria-label` to container: "YAML workflow editor"
- Announce mode changes: `<div role="status" aria-live="polite">`

---

## 7. PERFORMANCE OPTIMIZATIONS

### Large Document Handling

| Size          | Strategy                      | Notes                                 |
| ------------- | ----------------------------- | ------------------------------------- |
| <100 nodes    | No optimization needed        | Sub-100ms sync                        |
| 100-500 nodes | Debounce onChange (300ms)     | Prevent re-renders on every keystroke |
| 500+ nodes    | Virtual scrolling + lazy sync | Consider pagination warning           |

### Debounced Sync Pattern

```tsx
import { useDebouncedCallback } from '@workspace/ui/hooks/use-debounced-callback';

const handleYamlChange = useDebouncedCallback((value: string | undefined) => {
  if (value) {
    setYamlContent(value);
    markDirty();
  }
}, 300); // 300ms delay
```

### Memory Management

- Dispose Monaco editor on unmount: `editorRef.current?.dispose()`
- Clear undo/redo stack when switching modes: `editor.getModel()?.setValue(newValue)`
- Limit YAML file size: warn at >10,000 lines (Monaco performance degrades)

---

## 8. INTEGRATION WITH EXISTING BEQEEK CODE

### File Locations

```
apps/web/src/features/workflow-units/
├── components/
│   └── workflow-builder/
│       ├── mode-switcher.tsx          # NEW: Tab switcher
│       └── yaml-editor-panel.tsx      # NEW: Monaco wrapper
├── utils/
│   ├── export-utils.ts                # Existing: PNG export
│   └── yaml-conversion.ts             # NEW: Flow ↔ YAML
├── stores/
│   └── workflow-editor-store.ts       # Update: Add mode, yamlContent
└── hooks/
    └── use-yaml-validation.ts         # NEW: Schema setup
```

### Zustand Store Updates

Current store has: `nodes`, `edges`, `viewport`
Required additions: `mode`, `yamlContent`, `yamlError`, `hasUnsavedChanges`

### React Flow Integration Point

In `workflow-canvas.tsx`, wrap existing `<ReactFlow>` with mode conditional:

```tsx
{mode === 'visual' ? (
  <ReactFlow nodes={nodes} edges={edges} ... />
) : (
  <YamlEditorPanel />
)}
```

---

## 9. GOTCHAS & COMMON PITFALLS

### Worker Loading in Vite

**Issue**: `Uncaught Error: Unexpected usage` when workers fail to load
**Fix**: Use `?worker` suffix in imports + explicit MonacoEnvironment setup

### YAML Parsing Errors

**Issue**: `js-yaml` throws on invalid syntax, crashes UI
**Fix**: Wrap all yaml.load() calls in try-catch, display errors via Monaco markers

### React Flow Node IDs

**Issue**: YAML round-trip loses node IDs if not explicitly mapped
**Fix**: Preserve `id` field in serialization (see flowToYaml() implementation)

### Viewport Sync

**Issue**: Switching modes resets zoom/pan
**Fix**: Store viewport in Zustand, restore via `setViewport()` after mode switch

### Monaco Rerender Loops

**Issue**: `onChange` triggers state update → rerender → value prop change → onChange
**Fix**: Use controlled value with ref comparison: `if (value !== editorRef.current.getValue()) return;`

---

## 10. RECOMMENDED IMPLEMENTATION APPROACH

### Phase 1: Foundation (1-2 days)

1. Install monaco-yaml + monaco-editor peer dependency
2. Configure worker setup in Vite
3. Create basic YamlEditor component with theme integration
4. Add yaml-conversion.ts utilities

### Phase 2: Dual-Mode UI (2-3 days)

5. Update workflow-editor-store with mode state
6. Implement ModeSwitcher component with validation
7. Add YamlEditorPanel wrapper
8. Integrate with workflow-canvas conditional rendering

### Phase 3: Schema & Validation (1-2 days)

9. Define WORKFLOW_SCHEMA for workflow structure
10. Configure monaco-yaml with schema
11. Add inline error markers for YAML syntax errors
12. Test round-trip conversion (Visual → YAML → Visual)

### Phase 4: Polish & UX (1 day)

13. Add unsaved changes warning dialog
14. Implement keyboard shortcuts (Ctrl+S, format)
15. Add loading states during sync
16. Accessibility audit (keyboard nav, ARIA labels)

**Total Estimate**: 5-8 days including testing

---

## 11. TESTING STRATEGY

### Unit Tests

- `yaml-conversion.ts`: Test flowToYaml() and yamlToFlow() with various node types
- `validateYamlStructure()`: Test missing fields, invalid syntax, edge cases

### Integration Tests

- Mode switching with valid/invalid YAML
- Unsaved changes warning flow
- Viewport preservation across mode switches

### Manual Testing Checklist

- [ ] Large workflows (100+ nodes) performance
- [ ] YAML syntax errors display inline markers
- [ ] Tab switching doesn't lose data
- [ ] Keyboard shortcuts work (Ctrl+S, Ctrl+F)
- [ ] Dark/light theme compatibility
- [ ] Screen reader announces mode changes
- [ ] Browser reload preserves last mode

---

## 12. ALTERNATIVES CONSIDERED

### CodeMirror 6

**Pros**: Lighter weight (50KB vs 300KB), better mobile support
**Cons**: Less mature YAML plugin, weaker TypeScript DX, no VSCode compatibility
**Decision**: Monaco chosen for VSCode familiarity + robust YAML support

### Ace Editor

**Pros**: Lightweight, simple API
**Cons**: No React 19 support, unmaintained YAML mode, poor accessibility
**Decision**: Rejected due to maintenance concerns

### Plain Textarea + Syntax Highlighter

**Pros**: Minimal bundle size
**Cons**: No autocomplete, validation, or formatting
**Decision**: Not suitable for production workflow editor

---

## UNRESOLVED QUESTIONS

1. Should YAML export include comments/metadata? (Not in initial schema, but possible future enhancement)
2. Should we support YAML anchors/aliases for repeated config blocks? (Requires schema adjustments)
3. Should mode preference persist to localStorage? (Recommendation: yes, store in user preferences)
4. Should we show diff view for YAML changes? (Nice-to-have for v2, requires monaco-diff-editor)
5. Should validation be real-time or on-demand? (Recommendation: debounced 500ms for performance)
