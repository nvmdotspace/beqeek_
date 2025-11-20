# Phase 7B: Canvas Polish Implementation

**Duration**: 6 days (48 hours)
**Effort**: 60% of Phase 7
**Status**: 🟡 Planning

---

## Context & Dependencies

**Current State**:

- ✅ React Flow canvas operational with drag-drop
- ✅ YAML ↔ React Flow bidirectional conversion
- ✅ Connection validation with cycle detection
- ✅ Existing utilities: `ir-to-reactflow.ts`, `reactflow-to-ir.ts`, `yaml-converter.ts`
- ⚠️ Node configuration panel is placeholder only
- ❌ No auto-layout (dagre installed but unused)
- ❌ No undo/redo functionality

**Goal**: Transform basic canvas into production-ready visual editor with dynamic forms, auto-layout, and undo/redo.

**Dependencies**:

- `@xyflow/react`: ^12.9.3 (installed)
- `dagre`: ^0.8.5 (installed)
- `zundo`: Not installed (need to add)
- Existing workflow stores and utilities

---

## Architecture Decisions

### 1. Dynamic Node Configuration Forms

**Problem**: 16 node types × unique config forms = maintenance nightmare.

**Solution**: Registry pattern with form schema definitions.

```typescript
// Node configuration registry
interface NodeFormSchema {
  type: string;
  fields: FieldDefinition[];
  validator: ZodSchema;
}

const NODE_FORM_REGISTRY: Record<string, NodeFormSchema> = {
  schedule: {
    type: 'schedule',
    fields: [
      { name: 'cronExpression', type: 'cron-builder', label: 'Schedule', required: true },
      { name: 'timezone', type: 'select', options: TIMEZONES, default: 'UTC' },
    ],
    validator: z.object({
      cronExpression: z.string().regex(/^(\S+\s+){4,5}\S+$/),
      timezone: z.string(),
    }),
  },
  webhook: {
    type: 'webhook',
    fields: [
      { name: 'url', type: 'display', readonly: true },
      { name: 'method', type: 'select', options: ['GET', 'POST'], default: 'POST' },
    ],
    validator: z.object({ url: z.string().url(), method: z.enum(['GET', 'POST']) }),
  },
  // ... 14 more node types
};
```

**Benefits**:

- Single `DynamicNodeForm` component renders all types
- Add new node type = add registry entry (no new component)
- Centralized validation logic

---

### 2. Auto-Layout with Dagre

**Implementation**:

```typescript
import dagre from 'dagre';
import { Node, Edge } from '@xyflow/react';

export const autoLayoutNodes = (nodes: Node[], edges: Edge[]): Node[] => {
  const graph = new dagre.graphlib.Graph();
  graph.setGraph({
    rankdir: 'LR', // Left-to-right
    nodesep: 80, // Horizontal spacing
    ranksep: 120, // Vertical spacing
    edgesep: 40,
  });
  graph.setDefaultEdgeLabel(() => ({}));

  // Add nodes to graph
  nodes.forEach((node) => {
    graph.setNode(node.id, {
      width: node.measured?.width || 180,
      height: node.measured?.height || 40,
    });
  });

  // Add edges
  edges.forEach((edge) => {
    graph.setEdge(edge.source, edge.target);
  });

  // Run layout algorithm
  dagre.layout(graph);

  // Update node positions
  return nodes.map((node) => {
    const position = graph.node(node.id);
    return {
      ...node,
      position: { x: position.x, y: position.y },
    };
  });
};
```

**Trigger**: Auto-layout button in toolbar + keyboard shortcut (Cmd+Shift+L).

---

### 3. Undo/Redo with Zundo

**Integration**:

```typescript
import { create } from 'zustand';
import { temporal } from 'zundo';

interface WorkflowEditorStore {
  nodes: Node[];
  edges: Edge[];
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  // ... other actions
}

export const useWorkflowEditorStore = create<WorkflowEditorStore>()(
  temporal(
    (set) => ({
      nodes: [],
      edges: [],
      setNodes: (nodes) => set({ nodes }),
      setEdges: (edges) => set({ edges }),
    }),
    {
      limit: 50, // Keep 50 history steps
      equality: (a, b) => JSON.stringify(a) === JSON.stringify(b), // Deep equality
      handleSet: (handleSet) =>
        throttle<typeof handleSet>((state) => {
          handleSet(state);
        }, 100), // Throttle to avoid recording every keystroke
    },
  ),
);

// Usage in components
const undo = useWorkflowEditorStore.temporal.getState().undo;
const redo = useWorkflowEditorStore.temporal.getState().redo;
const canUndo = useWorkflowEditorStore.temporal((state) => state.pastStates.length > 0);
```

**Keyboard Shortcuts**:

- `Cmd+Z` / `Ctrl+Z`: Undo
- `Cmd+Shift+Z` / `Ctrl+Y`: Redo

---

### 4. Enhanced Node Selection

**Multi-Select**:

- Drag to select multiple nodes (lasso selection)
- `Cmd+A`: Select all nodes
- `Shift+Click`: Add/remove from selection

**Alignment Helpers**:

- Align left/right/center (horizontal)
- Align top/middle/bottom (vertical)
- Distribute evenly (horizontal/vertical)

```typescript
const alignNodes = (nodes: Node[], alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => {
  const selectedNodes = nodes.filter((n) => n.selected);
  if (selectedNodes.length < 2) return nodes;

  const bounds = {
    minX: Math.min(...selectedNodes.map((n) => n.position.x)),
    maxX: Math.max(...selectedNodes.map((n) => n.position.x + (n.measured?.width || 0))),
    minY: Math.min(...selectedNodes.map((n) => n.position.y)),
    maxY: Math.max(...selectedNodes.map((n) => n.position.y + (n.measured?.height || 0))),
  };

  return nodes.map((node) => {
    if (!node.selected) return node;

    switch (alignment) {
      case 'left':
        return { ...node, position: { ...node.position, x: bounds.minX } };
      case 'center':
        return {
          ...node,
          position: { ...node.position, x: (bounds.minX + bounds.maxX) / 2 - (node.measured?.width || 0) / 2 },
        };
      // ... other alignments
      default:
        return node;
    }
  });
};
```

---

## Component Specifications

### 1. Dynamic Node Configuration Form

**File**: `apps/web/src/features/workflows/components/node-config-form.tsx`

**Props**:

```typescript
interface NodeConfigFormProps {
  nodeId: string;
  nodeType: string;
  initialData: Record<string, unknown>;
  onSave: (data: Record<string, unknown>) => void;
  onCancel: () => void;
}
```

**Layout**:

```
┌─────────────────────────────────┐
│ Configure: Schedule Node        │ ← Header with node type
├─────────────────────────────────┤
│ ┌─────────────────────────────┐ │
│ │ Schedule *                  │ │ ← Dynamic fields from registry
│ │ [Cron Expression Builder]  │ │
│ │                             │ │
│ │ Timezone                    │ │
│ │ [UTC ▼]                     │ │
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│         [Cancel] [Save]         │ ← Actions
└─────────────────────────────────┘
```

**Field Types**:

1. `text`: Standard text input
2. `textarea`: Multi-line text
3. `select`: Dropdown selector
4. `cron-builder`: Visual cron expression builder
5. `key-value`: Dynamic key-value pairs (for variables)
6. `field-mapping`: Table field selector with drag-drop
7. `code-editor`: Monaco editor for expressions
8. `display`: Read-only display field

**Form Validation** (React Hook Form + Zod):

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const NodeConfigForm = ({ nodeType, initialData, onSave }: NodeConfigFormProps) => {
  const schema = NODE_FORM_REGISTRY[nodeType]?.validator;
  const fields = NODE_FORM_REGISTRY[nodeType]?.fields || [];

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: initialData,
  });

  const handleSubmit = form.handleSubmit((data) => {
    onSave(data);
  });

  return (
    <form onSubmit={handleSubmit}>
      {fields.map((field) => (
        <DynamicField key={field.name} field={field} control={form.control} />
      ))}
      <Button type="submit">Save</Button>
    </form>
  );
};
```

---

### 2. Node Configuration Panel

**File**: `apps/web/src/features/workflows/components/node-config-panel.tsx`

**State Management**:

```typescript
interface ConfigPanelState {
  selectedNodeId: string | null;
  isOpen: boolean;
}

const useConfigPanel = create<ConfigPanelState>((set) => ({
  selectedNodeId: null,
  isOpen: false,
  openPanel: (nodeId: string) => set({ selectedNodeId: nodeId, isOpen: true }),
  closePanel: () => set({ isOpen: false }),
}));
```

**Layout** (Right sidebar):

```
Canvas (main)         │ Config Panel (right)
                      │
[Workflow Nodes]      │ ┌─────────────────┐
                      │ │ Configure Node  │
[+ Add Node]          │ │                 │
                      │ │ [Form Fields]   │
                      │ │                 │
                      │ │ [Save] [Cancel] │
                      │ └─────────────────┘
                      │
```

**Responsive Behavior**:

- Desktop: 360px fixed-width sidebar
- Tablet: 300px sidebar
- Mobile: Full-screen modal

---

### 3. Auto-Layout Toolbar Button

**File**: `apps/web/src/features/workflows/components/workflow-toolbar.tsx`

**Button**:

```tsx
<Button variant="outline" size="sm" onClick={handleAutoLayout} disabled={nodes.length === 0} className="gap-space-100">
  <LayoutGridIcon className="h-4 w-4" />
  Auto-Layout
  <Kbd>⌘⇧L</Kbd>
</Button>
```

**Keyboard Shortcut Handler**:

```typescript
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'l') {
      e.preventDefault();
      handleAutoLayout();
    }
  };
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [handleAutoLayout]);
```

---

### 4. Undo/Redo Toolbar Buttons

**Buttons**:

```tsx
<Inline space="space-100">
  <Button variant="ghost" size="sm" onClick={undo} disabled={!canUndo} aria-label="Undo">
    <UndoIcon className="h-4 w-4" />
    <Kbd>⌘Z</Kbd>
  </Button>
  <Button variant="ghost" size="sm" onClick={redo} disabled={!canRedo} aria-label="Redo">
    <RedoIcon className="h-4 w-4" />
    <Kbd>⌘⇧Z</Kbd>
  </Button>
</Inline>
```

**Global Keyboard Handler**:

```typescript
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key === 'z') {
      e.preventDefault();
      undo();
    }
    if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'z') {
      e.preventDefault();
      redo();
    }
  };
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [undo, redo]);
```

---

### 5. Node Alignment Toolbar

**File**: `apps/web/src/features/workflows/components/alignment-toolbar.tsx`

**Layout**:

```tsx
<Inline space="space-50" className="border rounded-md p-space-50">
  <Button size="sm" variant="ghost" onClick={() => alignNodes('left')} title="Align Left">
    <AlignLeftIcon />
  </Button>
  <Button size="sm" variant="ghost" onClick={() => alignNodes('center')} title="Align Center">
    <AlignCenterIcon />
  </Button>
  <Button size="sm" variant="ghost" onClick={() => alignNodes('right')} title="Align Right">
    <AlignRightIcon />
  </Button>
  <Separator orientation="vertical" />
  <Button size="sm" variant="ghost" onClick={() => distributeNodes('horizontal')} title="Distribute Horizontally">
    <DistributeHorizontalIcon />
  </Button>
</Inline>
```

**Visibility**: Show only when 2+ nodes selected.

---

## Node Configuration Schemas (16 Types)

### Trigger Nodes (4)

**1. Schedule**:

```typescript
{
  type: 'schedule',
  fields: [
    { name: 'cronExpression', type: 'cron-builder', label: 'Schedule', required: true },
    { name: 'timezone', type: 'select', options: TIMEZONES, default: 'UTC' },
  ],
  validator: scheduleSchema,
}
```

**2. Webhook**:

```typescript
{
  type: 'webhook',
  fields: [
    { name: 'url', type: 'display', label: 'Webhook URL', readonly: true },
    { name: 'method', type: 'select', options: ['GET', 'POST', 'PUT', 'DELETE'], default: 'POST' },
    { name: 'regenerate', type: 'button', label: 'Regenerate URL', action: 'regenerate' },
  ],
  validator: webhookSchema,
}
```

**3. Optin Form**:

```typescript
{
  type: 'form',
  fields: [
    { name: 'formId', type: 'select-async', label: 'Form', fetchOptions: fetchForms, required: true },
    { name: 'triggerOn', type: 'select', options: ['submit', 'update', 'delete'], default: 'submit' },
  ],
  validator: formSchema,
}
```

**4. Active Table**:

```typescript
{
  type: 'table',
  fields: [
    { name: 'tableId', type: 'select-async', label: 'Table', fetchOptions: fetchTables, required: true },
    { name: 'triggerOn', type: 'select', options: ['create', 'update', 'delete'], default: 'create' },
    { name: 'filterCondition', type: 'code-editor', label: 'Filter (optional)', language: 'javascript' },
  ],
  validator: tableSchema,
}
```

---

### Action Nodes (7)

**5. Table Operation**:

```typescript
{
  type: 'table-operation',
  fields: [
    { name: 'action', type: 'select', options: ['create', 'update', 'delete', 'find'], required: true },
    { name: 'tableId', type: 'select-async', fetchOptions: fetchTables, required: true },
    { name: 'fieldMapping', type: 'field-mapping', label: 'Field Mapping', dependsOn: 'tableId' },
  ],
  validator: tableOperationSchema,
}
```

**6. SMTP Email**:

```typescript
{
  type: 'email',
  fields: [
    { name: 'to', type: 'textarea', label: 'To (comma-separated)', required: true },
    { name: 'subject', type: 'text', label: 'Subject', required: true },
    { name: 'body', type: 'rich-text', label: 'Body', required: true },
    { name: 'attachments', type: 'file-upload', label: 'Attachments (optional)' },
  ],
  validator: emailSchema,
}
```

**7. API Call**:

```typescript
{
  type: 'api-call',
  fields: [
    { name: 'method', type: 'select', options: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], required: true },
    { name: 'url', type: 'text', label: 'URL', placeholder: 'https://api.example.com/endpoint', required: true },
    { name: 'headers', type: 'key-value', label: 'Headers (optional)' },
    { name: 'body', type: 'code-editor', label: 'Request Body', language: 'json' },
  ],
  validator: apiCallSchema,
}
```

**8. Google Sheet**:

```typescript
{
  type: 'google-sheet',
  fields: [
    { name: 'action', type: 'select', options: ['append', 'update', 'read'], required: true },
    { name: 'spreadsheetId', type: 'text', label: 'Spreadsheet ID', required: true },
    { name: 'sheetName', type: 'text', label: 'Sheet Name', default: 'Sheet1', required: true },
    { name: 'range', type: 'text', label: 'Range', placeholder: 'A1:Z1000' },
  ],
  validator: googleSheetSchema,
}
```

**9. Update User**:

```typescript
{
  type: 'update-user',
  fields: [
    { name: 'userId', type: 'text', label: 'User ID', required: true },
    { name: 'fields', type: 'key-value', label: 'Fields to Update', required: true },
  ],
  validator: updateUserSchema,
}
```

**10. Delay**:

```typescript
{
  type: 'delay',
  fields: [
    { name: 'duration', type: 'number', label: 'Duration', required: true },
    { name: 'unit', type: 'select', options: ['seconds', 'minutes', 'hours', 'days'], default: 'minutes' },
  ],
  validator: delaySchema,
}
```

**11. Console Log**:

```typescript
{
  type: 'log',
  fields: [
    { name: 'level', type: 'select', options: ['debug', 'info', 'warn', 'error'], default: 'info' },
    { name: 'message', type: 'textarea', label: 'Message', required: true },
  ],
  validator: logSchema,
}
```

---

### Logic Nodes (6)

**12. Condition (If/Else)**:

```typescript
{
  type: 'condition',
  fields: [
    { name: 'expression', type: 'code-editor', label: 'Condition Expression', language: 'javascript', required: true },
    { name: 'trueLabel', type: 'text', label: 'True Branch Label', default: 'Yes' },
    { name: 'falseLabel', type: 'text', label: 'False Branch Label', default: 'No' },
  ],
  validator: conditionSchema,
}
```

**13. Match (Switch)**:

```typescript
{
  type: 'match',
  fields: [
    { name: 'expression', type: 'code-editor', label: 'Match Expression', language: 'javascript', required: true },
    { name: 'cases', type: 'key-value', label: 'Cases', required: true },
    { name: 'defaultLabel', type: 'text', label: 'Default Case Label', default: 'Default' },
  ],
  validator: matchSchema,
}
```

**14. Loop (For Each)**:

```typescript
{
  type: 'loop',
  fields: [
    { name: 'collection', type: 'code-editor', label: 'Collection', language: 'javascript', required: true },
    { name: 'itemVariable', type: 'text', label: 'Item Variable', default: 'item', required: true },
    { name: 'maxIterations', type: 'number', label: 'Max Iterations (safety)', default: 1000 },
  ],
  validator: loopSchema,
}
```

**15. Math Operation**:

```typescript
{
  type: 'math',
  fields: [
    { name: 'operation', type: 'select', options: ['add', 'subtract', 'multiply', 'divide', 'modulo', 'power'], required: true },
    { name: 'operandA', type: 'code-editor', label: 'Operand A', language: 'javascript', required: true },
    { name: 'operandB', type: 'code-editor', label: 'Operand B', language: 'javascript', required: true },
  ],
  validator: mathSchema,
}
```

**16. Variable Definition**:

```typescript
{
  type: 'variable',
  fields: [
    { name: 'variables', type: 'key-value', label: 'Variables', required: true },
  ],
  validator: variableSchema,
}
```

---

## Implementation Steps

### Day 1: Form Registry & Dynamic Form (8 hours)

**Tasks**:

1. Create node form registry (`node-form-registry.ts`)
2. Define Zod schemas for all 16 node types
3. Implement `DynamicField` component (renders field by type)
4. Implement `NodeConfigForm` component
5. Write unit tests for form validation

**Acceptance Criteria**:

- Registry contains all 16 node types
- Dynamic form renders correct fields per type
- Validation works for all node types
- Form submits valid data to store

---

### Day 2: Configuration Panel UI (8 hours)

**Tasks**:

1. Implement `NodeConfigPanel` component (right sidebar)
2. Add open/close animations (slide in/out)
3. Integrate with React Flow `onNodeClick` event
4. Add responsive layout (desktop/tablet/mobile)
5. Style with design system tokens

**Acceptance Criteria**:

- Panel opens when node clicked
- Panel displays correct form for node type
- Save updates node data in store
- Cancel closes panel without saving
- Mobile layout uses full-screen modal

---

### Day 3: Auto-Layout Integration (8 hours)

**Tasks**:

1. Implement `autoLayoutNodes` function with Dagre
2. Add auto-layout button to toolbar
3. Integrate keyboard shortcut (Cmd+Shift+L)
4. Add "Reset Layout" option (restore manual positions)
5. Optimize layout algorithm for 100+ nodes
6. Write unit tests for layout logic

**Acceptance Criteria**:

- Auto-layout arranges nodes left-to-right
- Layout completes in < 1s for 100 nodes
- Keyboard shortcut works
- Manual positions preserved when disabled
- No overlapping nodes after layout

---

### Day 4: Undo/Redo with Zundo (8 hours)

**Tasks**:

1. Install `zundo`: `pnpm add zundo`
2. Integrate `temporal` middleware into workflow store
3. Add undo/redo buttons to toolbar
4. Implement keyboard shortcuts (Cmd+Z, Cmd+Shift+Z)
5. Add history limit (50 steps)
6. Test with complex workflows (add/delete/move nodes)

**Acceptance Criteria**:

- Undo/redo works for node add/delete/move/edit
- History limited to 50 steps
- Keyboard shortcuts functional
- Undo/redo buttons show correct disabled state
- No memory leaks with large history

---

### Day 5: Node Selection & Alignment (8 hours)

**Tasks**:

1. Implement lasso selection (drag to select multiple)
2. Add Cmd+A (select all) shortcut
3. Implement alignment functions (left/center/right/top/middle/bottom)
4. Implement distribute evenly (horizontal/vertical)
5. Add alignment toolbar (shows when 2+ nodes selected)
6. Style selected nodes with design system highlight

**Acceptance Criteria**:

- Multi-select works via lasso drag
- Cmd+A selects all nodes
- Alignment functions align selected nodes correctly
- Distribute evenly spaces nodes evenly
- Alignment toolbar appears/disappears correctly

---

### Day 6: Integration & Polish (8 hours)

**Tasks**:

1. Integrate all features into workflow editor page
2. Add keyboard shortcuts help panel (press `?`)
3. Optimize React Flow performance (memoization)
4. Write integration tests (form → store → canvas)
5. Accessibility audit (keyboard nav, ARIA labels)
6. Mobile testing (responsive breakpoints)
7. Fix bugs from testing

**Acceptance Criteria**:

- All features work together seamlessly
- Keyboard shortcuts documented and accessible
- No performance issues with 100 nodes
- Passes accessibility audit (WCAG 2.1 AA)
- Mobile layout functional on 375px width

---

## Success Criteria

**Functional**:

- ✅ All 16 node types have configuration forms
- ✅ Forms validate data before saving
- ✅ Auto-layout arranges nodes readably (< 1s)
- ✅ Undo/redo works for all actions (50 steps)
- ✅ Multi-select and alignment helpers work
- ✅ Keyboard shortcuts match industry standards (VS Code)
- ✅ Configuration panel responsive (desktop/tablet/mobile)

**Non-Functional**:

- ✅ Design system compliant (no hardcoded colors)
- ✅ Mobile-responsive (375px - 1920px)
- ✅ Accessible (WCAG 2.1 AA)
- ✅ Performance: 100 nodes render < 500ms
- ✅ TypeScript strict mode (no `any`)

---

## Risk Assessment

**High Risks**:

1. **Dagre layout quality varies by workflow structure**
   - Mitigation: Add manual override + position locking
2. **Form registry complexity (16 types × unique fields)**
   - Mitigation: Shared field components, extensive testing

**Medium Risks**:

1. **Undo/redo state size with large workflows**
   - Mitigation: 50-step history limit, throttle state updates
2. **Mobile responsiveness for complex forms**
   - Mitigation: Responsive field layouts, full-screen modal

---

## Testing Strategy

**Unit Tests**:

- `node-form-registry.ts`: All schemas validate correctly
- `auto-layout.ts`: Dagre layout produces non-overlapping nodes
- `alignment.ts`: Alignment functions calculate correct positions
- `undo-redo.ts`: History management works correctly

**Integration Tests**:

- Form submission → store update → canvas re-render
- Auto-layout → node positions update → YAML updates
- Undo/redo → canvas state restores → YAML syncs

**E2E Tests** (Playwright):

- User clicks node → config panel opens → edits form → saves → node updates
- User clicks auto-layout → nodes rearrange → manual drag still works
- User performs 10 actions → undo 5 times → redo 3 times → state correct

---

## Files Created/Modified

```
apps/web/src/features/workflows/
├── components/
│   ├── node-config-form.tsx              (NEW - 180 lines)
│   ├── node-config-panel.tsx             (NEW - 120 lines)
│   ├── dynamic-field.tsx                 (NEW - 200 lines)
│   ├── workflow-toolbar.tsx              (MODIFIED - add buttons)
│   ├── alignment-toolbar.tsx             (NEW - 80 lines)
│   └── keyboard-shortcuts-help.tsx       (NEW - 60 lines)
├── stores/
│   └── workflow-editor-store.ts          (MODIFIED - add zundo)
├── utils/
│   ├── node-form-registry.ts             (NEW - 500 lines)
│   ├── auto-layout.ts                    (NEW - 100 lines)
│   ├── alignment.ts                      (NEW - 120 lines)
│   ├── ir-to-reactflow.ts                (MODIFIED - preserve positions)
│   └── reactflow-to-ir.ts                (MODIFIED - save metadata)
└── schemas/
    └── node-validation-schemas.ts        (NEW - 400 lines)
```

**Total**: ~1,760 lines of new code + modifications

---

## Unresolved Questions

1. **Cron builder UI**: Should we use third-party library (react-cron-generator) or build custom?
2. **Field mapping UX**: Drag-drop vs. dropdown selector for table field mapping?
3. **Position locking**: Should users be able to lock individual node positions to prevent auto-layout changes?
4. **Form persistence**: Should partially filled forms persist if user closes panel?

---

**Next**: Integration testing and deployment preparation
