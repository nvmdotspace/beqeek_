# Phase 6: Monaco Editor

**Date**: 2025-11-19 22:45
**Duration**: Week 7 (5 days)
**Status**: ⚪ Not Started

---

## Overview

Integrate Monaco Editor for YAML code editing. Implement dual-mode toggle (Visual ↔ YAML) with bi-directional sync. Add YAML language support, validation, auto-completion.

---

## Key Requirements

**Monaco Editor Features**:

- YAML syntax highlighting
- Schema-based auto-completion
- Real-time validation with error highlighting
- Find/replace
- Multi-cursor editing
- Theme integration (light/dark)

**Dual-Mode Switching**:

- Toggle button: Visual ↔ YAML
- Visual → YAML: Convert nodes to YAML string
- YAML → Visual: Parse YAML to nodes
- Validation before mode switch
- Confirmation if unsaved changes

---

## Implementation Steps

### Step 1: Install monaco-yaml (30 min)

```bash
pnpm add monaco-yaml
```

### Step 2: Monaco Wrapper Component (2 hours)

```typescript
// components/workflow-builder/yaml-editor.tsx
import { useEffect, useRef } from 'react';
import Editor, { Monaco } from '@monaco-editor/react';
import { configureMonacoYaml } from 'monaco-yaml';

export const YamlEditor = ({ value, onChange }: { value: string; onChange: (value: string) => void }) => {
  const editorRef = useRef<any>(null);

  const handleEditorWillMount = (monaco: Monaco) => {
    // Configure YAML language
    configureMonacoYaml(monaco, {
      enableSchemaRequest: true,
      schemas: [
        {
          uri: 'http://beqeek.com/workflow-schema.json',
          fileMatch: ['*'],
          schema: WORKFLOW_YAML_SCHEMA, // JSON Schema for validation
        },
      ],
    });
  };

  return (
    <Editor
      height="100%"
      language="yaml"
      value={value}
      onChange={(value) => onChange(value || '')}
      beforeMount={handleEditorWillMount}
      theme="vs-dark"
      options={{
        minimap: { enabled: true },
        scrollBeyondLastLine: false,
        fontSize: 14,
        tabSize: 2,
      }}
    />
  );
};
```

### Step 3: Dual-Mode Toggle (2 hours)

```typescript
// stores/workflow-editor-store.ts
// Add mode: 'visual' | 'yaml'

// pages/workflow-event-editor.tsx
const { mode, setMode, nodes, edges } = useWorkflowEditorStore();
const [yamlContent, setYamlContent] = useState('');

const handleModeSwitch = (newMode: 'visual' | 'yaml') => {
  if (newMode === 'yaml') {
    // Visual → YAML
    const yaml = nodesToYaml(nodes, edges);
    setYamlContent(yaml);
  } else {
    // YAML → Visual
    try {
      const { nodes, edges } = yamlToNodes(yamlContent);
      setNodes(nodes);
      setEdges(edges);
    } catch (error) {
      toast.error('Invalid YAML');
      return;
    }
  }
  setMode(newMode);
};

return (
  <>
    <Inline space="space-150">
      <Button variant={mode === 'visual' ? 'default' : 'outline'} onClick={() => handleModeSwitch('visual')}>
        Visual
      </Button>
      <Button variant={mode === 'yaml' ? 'default' : 'outline'} onClick={() => handleModeSwitch('yaml')}>
        YAML
      </Button>
    </Inline>

    {mode === 'visual' ? <WorkflowCanvas /> : <YamlEditor value={yamlContent} onChange={setYamlContent} />}
  </>
);
```

### Step 4: YAML Schema Definition (2 hours)

Define JSON Schema for auto-completion and validation:

```typescript
const WORKFLOW_YAML_SCHEMA = {
  type: 'object',
  properties: {
    stages: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          blocks: {
            type: 'array',
            items: {
              /* block schemas */
            },
          },
        },
      },
    },
  },
};
```

### Step 5: Error Highlighting (1 hour)

Show validation errors inline with Monaco markers.

---

## Success Criteria

- ✅ Monaco Editor renders with YAML highlighting
- ✅ Auto-completion works for block types
- ✅ Validation shows errors inline
- ✅ Mode switching preserves data
- ✅ Theme matches design system (light/dark)

---

**Phase 6 Completion**: When dual-mode editing works reliably
