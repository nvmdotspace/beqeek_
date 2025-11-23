# Phase 1: Monaco Setup & Integration

**Timeline**: Day 1-2 | **Effort**: 6-8h | **Status**: 🔴 Not Started

## Context

Monaco Editor is VS Code's editor component. Integration requires:

- Package installation (`monaco-yaml` for YAML language support)
- Vite worker configuration (Monaco uses Web Workers)
- React component wrapper from `@monaco-editor/react`
- Schema definition for YAML validation

**Dependencies**: None (first phase)

## Key Insights from Research

1. **@monaco-editor/react** already installed (v4.7.0) in package.json
2. Need `monaco-yaml@5.4.0` for YAML language features
3. Need `monaco-editor@0.54.0` as peer dependency
4. Vite requires explicit worker configuration
5. Monaco loads ~300kb gzipped (acceptable for MVP)

## Requirements

### Functional

- Monaco editor initializes successfully
- YAML syntax highlighting works
- Editor shows line numbers, folding, minimap
- Basic editing (type, delete, copy/paste) works

### Technical

- Vite worker configuration supports Monaco
- TypeScript types for Monaco APIs
- No console warnings about missing workers
- Editor height responsive to viewport

### Design

- Monospace font (Monaco default)
- Dark theme matching Beqeek design system
- Border and spacing consistent with canvas

## Architecture Decisions

### Package Versions

```json
{
  "@monaco-editor/react": "^4.7.0", // Already installed
  "monaco-yaml": "5.4.0", // Add
  "monaco-editor": "0.54.0" // Add (peer dependency)
}
```

### Vite Configuration

Add worker plugin to handle Monaco's Web Worker requirements:

```typescript
// vite.config.ts
import monacoEditorPlugin from 'vite-plugin-monaco-editor';

export default {
  plugins: [
    monacoEditorPlugin({
      languageWorkers: ['editorWorkerService', 'yaml'],
    }),
  ],
};
```

### Component Structure

```
/features/workflow-units/components/workflow-builder/
  yaml-editor.tsx          # New: Monaco wrapper component
  canvas-header.tsx        # Existing: Will add mode toggle later
  workflow-canvas.tsx      # Existing: Will add conditional rendering later
```

## Related Code Files

**To create**:

- `/apps/web/src/features/workflow-units/components/workflow-builder/yaml-editor.tsx`

**To modify** (Phase 2):

- `/apps/web/vite.config.ts` - Add Monaco worker plugin
- `/apps/web/package.json` - Add monaco-yaml dependency

**Reference**:

- `/apps/web/src/features/workflow-units/utils/yaml-schemas.ts` - Schema for validation
- `/apps/web/src/features/workflow-units/utils/yaml-types.ts` - Type definitions

## Implementation Steps

### Step 1.1: Install Dependencies (30 min)

```bash
cd /Users/macos/Workspace/buildinpublic/beqeek
pnpm add monaco-yaml@5.4.0 monaco-editor@0.54.0 --filter web
```

**Acceptance**:

- ✅ package.json shows new dependencies
- ✅ pnpm-lock.yaml updated
- ✅ node_modules contains packages

### Step 1.2: Configure Vite Workers (45 min)

**File**: `/apps/web/vite.config.ts`

Add worker configuration:

```typescript
import monacoEditorPlugin from 'vite-plugin-monaco-editor';

// In plugins array
plugins: [
  // ... existing plugins
  monacoEditorPlugin({
    languageWorkers: ['editorWorkerService', 'yaml'],
    customWorkers: [
      {
        label: 'yaml',
        entry: 'monaco-yaml/yaml.worker',
      },
    ],
  }),
],

// In optimizeDeps
optimizeDeps: {
  include: [
    'monaco-editor/esm/vs/editor/editor.worker',
    'monaco-yaml/yaml.worker',
  ],
},
```

**Acceptance**:

- ✅ Vite dev server starts without errors
- ✅ No worker-related console warnings
- ✅ Build succeeds with workers bundled

### Step 1.3: Create YamlEditor Component (2-3h)

**File**: `/apps/web/src/features/workflow-units/components/workflow-builder/yaml-editor.tsx`

**Component structure**:

```typescript
import { Editor } from '@monaco-editor/react';
import { useEffect, useRef } from 'react';
import { setDiagnosticsOptions } from 'monaco-yaml';
import type { editor } from 'monaco-editor';

interface YamlEditorProps {
  value: string;
  onChange: (value: string | undefined) => void;
  onValidationError?: (errors: string[]) => void;
  readOnly?: boolean;
  height?: string;
}

export function YamlEditor({
  value,
  onChange,
  onValidationError,
  readOnly = false,
  height = '100%',
}: YamlEditorProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  // Configure YAML language features
  useEffect(() => {
    setDiagnosticsOptions({
      enableSchemaRequest: true,
      hover: true,
      completion: true,
      validate: true,
      format: true,
      schemas: [
        {
          uri: 'http://beqeek.local/workflow-schema.json',
          fileMatch: ['*'],
          schema: {
            // Schema from yaml-schemas.ts
          },
        },
      ],
    });
  }, []);

  const handleEditorDidMount = (editor: editor.IStandaloneCodeEditor) => {
    editorRef.current = editor;

    // Listen for validation markers
    const model = editor.getModel();
    if (model) {
      editor.onDidChangeModelDecorations(() => {
        const markers = monaco.editor.getModelMarkers({ resource: model.uri });
        const errors = markers
          .filter(m => m.severity === monaco.MarkerSeverity.Error)
          .map(m => m.message);

        if (onValidationError) {
          onValidationError(errors);
        }
      });
    }
  };

  return (
    <Editor
      height={height}
      defaultLanguage="yaml"
      value={value}
      onChange={onChange}
      onMount={handleEditorDidMount}
      theme="vs-dark" // Match Beqeek dark mode
      options={{
        readOnly,
        minimap: { enabled: true },
        lineNumbers: 'on',
        folding: true,
        scrollBeyondLastLine: false,
        wordWrap: 'on',
        fontSize: 14,
        tabSize: 2,
        insertSpaces: true,
        automaticLayout: true,
      }}
    />
  );
}
```

**Key features**:

- ✅ YAML syntax highlighting (via monaco-yaml)
- ✅ Schema validation with inline errors
- ✅ onChange callback for value updates
- ✅ onValidationError callback for error display
- ✅ Read-only mode support
- ✅ Configurable height
- ✅ Dark theme matching design system

**Acceptance**:

- ✅ Component renders without errors
- ✅ Typing updates value
- ✅ Syntax highlighting visible
- ✅ Line numbers, minimap, folding work
- ✅ onChange fires on edits

### Step 1.4: Create Test Page (1-2h)

**File**: `/apps/web/src/features/workflow-units/pages/yaml-editor-test.tsx`

Create standalone test page to verify Monaco works:

```typescript
import { useState } from 'react';
import { YamlEditor } from '../components/workflow-builder/yaml-editor';

const SAMPLE_YAML = `
trigger:
  type: active_table
  config:
    tableId: "123"

steps:
  - id: step_1
    name: "Process record"
    type: conditional
    config:
      condition: "status == 'active'"
`.trim();

export function YamlEditorTestPage() {
  const [value, setValue] = useState(SAMPLE_YAML);
  const [errors, setErrors] = useState<string[]>([]);

  return (
    <div className="h-screen flex flex-col p-4">
      <h1 className="text-2xl font-bold mb-4">Monaco YAML Editor Test</h1>

      {errors.length > 0 && (
        <div className="bg-destructive/10 border border-destructive rounded p-4 mb-4">
          <h2 className="font-semibold">Validation Errors:</h2>
          <ul className="list-disc list-inside">
            {errors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex-1 border rounded overflow-hidden">
        <YamlEditor
          value={value}
          onChange={(v) => setValue(v || '')}
          onValidationError={setErrors}
        />
      </div>
    </div>
  );
}
```

**Add route** (temporary):

```typescript
// /apps/web/src/routes/$locale/yaml-test.tsx
import { createFileRoute } from '@tanstack/react-router';
import { YamlEditorTestPage } from '@/features/workflow-units/pages/yaml-editor-test';

export const Route = createFileRoute('/$locale/yaml-test')({
  component: YamlEditorTestPage,
});
```

**Acceptance**:

- ✅ Navigate to `/vi/yaml-test` loads page
- ✅ Editor shows sample YAML with syntax highlighting
- ✅ Typing updates state
- ✅ Invalid YAML shows errors
- ✅ No console errors

### Step 1.5: Schema Integration (2h)

Integrate existing Zod schemas into Monaco YAML validation:

**File**: `/apps/web/src/features/workflow-units/utils/yaml-schema-json.ts`

```typescript
import { zodToJsonSchema } from 'zod-to-json-schema';
import { WorkflowYAMLSchema } from './yaml-schemas';

/**
 * Converts Zod schema to JSON Schema for Monaco validation
 */
export function getMonacoYamlSchema() {
  return zodToJsonSchema(WorkflowYAMLSchema, {
    name: 'WorkflowYAML',
    $refStrategy: 'none',
  });
}
```

Install helper: `pnpm add zod-to-json-schema --filter web`

Update YamlEditor to use schema:

```typescript
import { getMonacoYamlSchema } from '../../utils/yaml-schema-json';

// In useEffect
schemas: [
  {
    uri: 'http://beqeek.local/workflow-schema.json',
    fileMatch: ['*'],
    schema: getMonacoYamlSchema(),
  },
],
```

**Acceptance**:

- ✅ Invalid workflow structure shows red squigglies
- ✅ Hover shows error message
- ✅ Autocomplete suggests valid keys (trigger, steps, etc.)

## Todo List

- [ ] Install monaco-yaml and monaco-editor packages
- [ ] Add vite-plugin-monaco-editor dependency
- [ ] Configure Vite worker support in vite.config.ts
- [ ] Create YamlEditor component with Monaco wrapper
- [ ] Add YAML schema validation using monaco-yaml
- [ ] Create test page route for isolated testing
- [ ] Verify syntax highlighting works
- [ ] Verify validation errors display inline
- [ ] Test editor performance with large YAML files
- [ ] Verify no console errors/warnings
- [ ] Test keyboard shortcuts (Cmd+Z, Cmd+F, Cmd+Shift+F)
- [ ] Document component props and usage

## Success Criteria

### Must Have

- ✅ Monaco editor renders in React component
- ✅ YAML syntax highlighting visible
- ✅ Line numbers, minimap, folding functional
- ✅ onChange callback fires on edits
- ✅ No worker-related console errors
- ✅ Vite dev server and build both work

### Nice to Have

- ✅ Schema validation shows inline errors
- ✅ Autocomplete suggests workflow keys
- ✅ Error messages are user-friendly
- ✅ Editor matches dark theme

### Performance

- ✅ Editor initializes in < 1s
- ✅ Typing latency < 50ms
- ✅ Bundle size increase < 400kb gzipped

## Risk Assessment

**High Risk**:

- Vite worker configuration may require iteration

**Medium Risk**:

- Monaco bundle size may exceed 500kb (target: 300kb)
- Schema validation errors may be cryptic

**Low Risk**:

- TypeScript types for Monaco

**Mitigations**:

- Follow @monaco-editor/react examples for Vite
- Use code splitting to lazy load Monaco
- Format Zod errors into plain English
- Test across browsers early

## Unresolved Questions

1. Should Monaco use light theme in light mode? (Yes, add theme prop)
2. Should editor support Vim keybindings? (No, too complex for MVP)
3. Should we cache editor state in localStorage? (No, already saved to server)
