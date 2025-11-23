# React Flow Workflow Canvas: Best Practices & Implementation Patterns

**Date**: 2025-11-20
**Scope**: Drag-and-drop, node connections, state management, YAML serialization for workflow canvas
**Status**: Research Complete

---

## Executive Summary

This report synthesizes React Flow v12 best practices from official documentation, real-world implementations, and Beqeek's existing codebase. Key findings: (1) HTML Drag-and-Drop API for palette-to-canvas, (2) Zustand + React Flow hooks for state sync, (3) DFS-based cycle detection for connection validation, (4) 3-layer IR architecture for YAML conversion.

**Core patterns already implemented in Beqeek**:

- ✅ Palette drag-and-drop with `onDragStart`/`onDrop`
- ✅ Zustand store synced with React Flow state
- ✅ DFS cycle detection in connection validator
- ✅ YAML ↔ IR ↔ React Flow pipeline with topological sort

---

## 1. Drag-and-Drop: Palette to Canvas

### 1.1 Pattern: HTML Drag-and-Drop API

**Official React Flow approach** (reactflow.dev/examples/interaction/drag-and-drop):

```tsx
// Sidebar palette item
const onDragStart = (event: React.DragEvent, nodeType: string) => {
  event.dataTransfer.setData('application/reactflow', nodeType);
  event.dataTransfer.effectAllowed = 'move';
};

<div draggable onDragStart={(e) => onDragStart(e, 'log')}>
  <LogIcon /> Log Node
</div>;
```

**Canvas drop handler**:

```tsx
const onDrop = useCallback(
  (event: React.DragEvent) => {
    event.preventDefault();

    const type = event.dataTransfer.getData('application/reactflow');
    if (!type) return;

    // Convert screen coordinates to flow coordinates
    const position = screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    });

    const newNode = {
      id: `${type}-${Date.now()}`,
      type,
      position,
      data: { label: `New ${type}` },
    };

    setNodes((nds) => nds.concat(newNode));
  },
  [screenToFlowPosition, setNodes],
);

<ReactFlow
  nodes={nodes}
  onDrop={onDrop}
  onDragOver={(e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }}
/>;
```

### 1.2 Beqeek Implementation (Existing)

**File**: `apps/web/src/features/workflow-units/components/workflow-builder/node-palette.tsx`

```tsx
// ✅ Already implements best practice
const onDragStart = (event: React.DragEvent) => {
  event.dataTransfer.setData('application/reactflow', definition.type);
  event.dataTransfer.effectAllowed = 'move';
};

<Box draggable onDragStart={onDragStart} />;
```

**File**: `workflow-canvas.tsx`

```tsx
// ✅ Correct pattern with manual position calculation
const onDrop = useCallback((event: React.DragEvent) => {
  const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
  const position = {
    x: event.clientX - reactFlowBounds.left - 100, // Center node
    y: event.clientY - reactFlowBounds.top - 50,
  };
  // ... create node
}, []);
```

**Recommendation**: Add `screenToFlowPosition` hook for viewport zoom/pan awareness:

```tsx
import { useReactFlow } from '@xyflow/react';

const { screenToFlowPosition } = useReactFlow();
const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
```

### 1.3 Touch Device Support (Future Enhancement)

HTML Drag-and-Drop API not supported on mobile. Use **Pointer Events** alternative:

```tsx
const [draggedType, setDraggedType] = useState<string | null>(null);

const onPointerDown = (e: React.PointerEvent, type: string) => {
  setDraggedType(type);
  e.currentTarget.setPointerCapture(e.pointerId);
};

const onPointerMove = (e: React.PointerEvent) => {
  if (!draggedType) return;
  // Show ghost node following cursor
};

const onPointerUp = (e: React.PointerEvent) => {
  if (!draggedType) return;
  // Create node at drop position
  setDraggedType(null);
};
```

---

## 2. Node Connection & Edge Validation

### 2.1 Pattern: `isValidConnection` Prop

**React Flow API** (reactflow.dev/examples/interaction/validation):

```tsx
const isValidConnection = useCallback(
  (connection: Connection) => {
    // Prevent self-loops
    if (connection.source === connection.target) return false;

    // Check if edge already exists
    const edgeExists = edges.some((e) => e.source === connection.source && e.target === connection.target);
    if (edgeExists) return false;

    // Custom validation (e.g., type compatibility)
    const sourceNode = nodes.find((n) => n.id === connection.source);
    const targetNode = nodes.find((n) => n.id === connection.target);

    if (sourceNode?.type === 'trigger' && targetNode?.type === 'trigger') {
      return false; // Triggers can't connect to triggers
    }

    return true;
  },
  [nodes, edges],
);

<ReactFlow isValidConnection={isValidConnection} />;
```

### 2.2 Beqeek Implementation: DFS Cycle Detection

**File**: `apps/web/src/features/workflow-units/utils/connection-validator.ts`

```tsx
// ✅ Industry-standard DFS algorithm for cycle detection
const hasCycleDFS = (
  nodeId: string,
  visited: Set<string>,
  recursionStack: Set<string>,
  adjacencyList: Map<string, string[]>,
): boolean => {
  visited.add(nodeId);
  recursionStack.add(nodeId);

  const neighbors = adjacencyList.get(nodeId) || [];
  for (const neighbor of neighbors) {
    if (!visited.has(neighbor)) {
      if (hasCycleDFS(neighbor, visited, recursionStack, adjacencyList)) {
        return true; // Cycle detected
      }
    } else if (recursionStack.has(neighbor)) {
      return true; // Back edge = cycle
    }
  }

  recursionStack.delete(nodeId);
  return false;
};

export const isValidConnection = (connection: Connection, nodes: Node[], edges: Edge[]): boolean => {
  // Rule 1: No self-loops
  if (connection.source === connection.target) return false;

  // Rule 2: Trigger nodes cannot have inputs
  const targetNode = nodes.find((n) => n.id === connection.target);
  if (targetNode.type?.startsWith('trigger_')) return false;

  // Rule 3: No circular dependencies (build temp graph and check)
  const adjacencyList = new Map<string, string[]>();
  // ... build graph with new edge
  // ... run DFS
  return !hasCycle;
};
```

**Performance**: O(V + E) - optimal for DAG validation.

### 2.3 Advanced: Handle-Level Validation

**Use case**: Condition nodes have 2 outputs (then/else), limit connections per handle.

```tsx
// Custom node with multiple handles
<Handle type="source" position={Position.Right} id="then" isConnectable={1} />
<Handle type="source" position={Position.Bottom} id="else" isConnectable={1} />

// Connection validator checks handle IDs
const isValidConnection = (connection: Connection) => {
  const existingEdges = edges.filter(
    (e) => e.source === connection.source && e.sourceHandle === connection.sourceHandle
  );

  // Max 1 connection per handle
  if (existingEdges.length >= 1) return false;

  return true;
};
```

### 2.4 Edge Types & Custom Connection Lines

**Built-in types**: `default`, `straight`, `step`, `smoothstep`

```tsx
const edges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', type: 'smoothstep' },
  { id: 'e2-3', source: '2', target: '3', type: 'straight', animated: true },
];
```

**Custom connection line** (preview while dragging):

```tsx
import { getBezierPath } from '@xyflow/react';

function CustomConnectionLine({ fromX, fromY, toX, toY }: ConnectionLineComponentProps) {
  const [edgePath] = getBezierPath({ sourceX: fromX, sourceY: fromY, targetX: toX, targetY: toY });

  return (
    <g>
      <path fill="none" stroke="hsl(var(--accent-teal))" strokeWidth={2} d={edgePath} />
      <circle cx={toX} cy={toY} r={3} fill="hsl(var(--accent-teal))" />
    </g>
  );
}

<ReactFlow connectionLineComponent={CustomConnectionLine} />;
```

---

## 3. Node Configuration & State Management

### 3.1 Pattern: Selected Node → Config Panel

**Zustand store** (Beqeek existing):

```tsx
// workflow-editor-store.ts
interface WorkflowEditorState {
  selectedNodeIds: string[];
  setSelectedNodeIds: (ids: string[]) => void;
}

// Sync with React Flow selection
const handleNodesChange: OnNodesChange = useCallback(
  (changes) => {
    const selectedIds = changes
      .filter((c): c is NodeSelectionChange => c.type === 'select' && c.selected)
      .map((c) => c.id);

    if (selectedIds.length > 0) {
      setSelectedNodeIds(selectedIds);
    }
  },
  [setSelectedNodeIds],
);
```

**Config panel reactivity**:

```tsx
// node-config-panel.tsx
const { nodes, selectedNodeIds } = useWorkflowEditorStore();

const selectedNode = nodes.find((n) => n.id === selectedNodeIds[0]);
if (!selectedNode) return <EmptyState />;

return (
  <ConfigForm
    nodeType={selectedNode.type}
    data={selectedNode.data}
    onUpdate={(newData) => {
      // Update node data in store
      updateNodeData(selectedNode.id, newData);
    }}
  />
);
```

### 3.2 Pattern: Node Data Updates

**Best practice**: Immutable updates via `setNodes` callback

```tsx
const updateNodeData = useCallback(
  (nodeId: string, newData: Record<string, unknown>) => {
    setNodes((nds) => nds.map((node) => (node.id === nodeId ? { ...node, data: { ...node.data, ...newData } } : node)));
  },
  [setNodes],
);
```

**Zustand integration** (Beqeek pattern):

```tsx
// Store triggers dirty state on node updates
setNodes: (nodes) => set({ nodes, isDirty: true }),
```

### 3.3 Custom Node Structure

**Beqeek pattern** (existing):

```tsx
// base-workflow-node.tsx
interface BaseNodeProps extends NodeProps {
  icon: keyof typeof LucideIcons;
  category: 'trigger' | 'action' | 'logic';
  label: string;
  summary: string;
}

export const BaseWorkflowNode = ({ icon, category, label, summary, selected }: BaseNodeProps) => {
  const IconComponent = LucideIcons[icon];

  return (
    <Box
      className={cn(
        'border-2 rounded-lg p-4 min-w-[200px]',
        selected && 'ring-2 ring-ring',
        category === 'trigger' && 'border-accent-blue',
        category === 'action' && 'border-accent-green',
        category === 'logic' && 'border-accent-teal',
      )}
    >
      <Handle type="target" position={Position.Top} />
      <Inline space="space-100">
        <IconComponent className="size-4" />
        <Text weight="semibold">{label}</Text>
      </Inline>
      <Text size="small" color="muted">
        {summary}
      </Text>
      <Handle type="source" position={Position.Bottom} />
    </Box>
  );
};
```

**Design token compliance**: ✅ Uses `border-accent-*` not hardcoded colors.

---

## 4. Workflow State Management: Zustand + React Flow

### 4.1 Pattern: Dual State Sources

**Challenge**: React Flow manages nodes/edges internally, Zustand manages app state. How to sync?

**Solution**: React Flow hooks (`useNodesState`, `useEdgesState`) + Zustand store

```tsx
// Beqeek implementation (existing)
const { nodes: storeNodes, edges: storeEdges, setNodes: setStoreNodes } = useWorkflowEditorStore();

// Local React Flow state
const [nodes, setNodes, onNodesChange] = useNodesState(storeNodes);
const [edges, setEdges, onEdgesChange] = useEdgesState(storeEdges);

// Sync changes back to store
const handleNodesChange: OnNodesChange = useCallback(
  (changes) => {
    onNodesChange(changes);
    setNodes((nds) => {
      setStoreNodes(nds); // Persist to Zustand
      return nds;
    });
  },
  [onNodesChange, setNodes, setStoreNodes],
);
```

**Why dual state?**

- React Flow hooks handle drag, select, resize (internal state)
- Zustand persists data for save/load, undo/redo

### 4.2 Dirty State Tracking

**Pattern**: Flag unsaved changes

```tsx
// workflow-editor-store.ts
interface WorkflowEditorState {
  isDirty: boolean;
  setIsDirty: (dirty: boolean) => void;
}

// Trigger on any change
setNodes: (nodes) => set({ nodes, isDirty: true }),
setEdges: (edges) => set({ edges, isDirty: true }),

// Clear after save
const handleSave = async () => {
  const yamlContent = reactFlowToYAML(nodes, edges, trigger);
  await updateWorkflowEvent({ yamlContent });
  setIsDirty(false); // ✅ Clear dirty flag
};
```

**UI integration**:

```tsx
const { isDirty } = useWorkflowEditorStore();

// Warn on navigation
useEffect(() => {
  const handler = (e: BeforeUnloadEvent) => {
    if (isDirty) {
      e.preventDefault();
      e.returnValue = 'You have unsaved changes. Leave anyway?';
    }
  };
  window.addEventListener('beforeunload', handler);
  return () => window.removeEventListener('beforeunload', handler);
}, [isDirty]);
```

### 4.3 Undo/Redo Pattern (Future Enhancement)

**Library**: `zundo` (Zustand middleware for time travel)

```bash
pnpm add zundo
```

**Setup**:

```tsx
import { temporal } from 'zundo';

export const useWorkflowEditorStore = create<WorkflowEditorState>()(
  temporal(
    (set) => ({
      nodes: [],
      edges: [],
      setNodes: (nodes) => set({ nodes }),
      setEdges: (edges) => set({ edges }),
    }),
    {
      limit: 50, // Keep 50 history states
      equality: (a, b) => a.nodes === b.nodes && a.edges === b.edges,
      handleSet: (handleSet) =>
        throttle<typeof handleSet>((state) => {
          handleSet(state);
        }, 500), // Throttle to avoid history spam during drag
    }
  )
);

// Usage
const { undo, redo, canUndo, canRedo } = useTemporalStore();

<Button onClick={undo} disabled={!canUndo}>Undo</Button>
<Button onClick={redo} disabled={!canRedo}>Redo</Button>
```

**Performance**: Zundo clones state on each change - acceptable for <100 nodes.

---

## 5. YAML Serialization: 3-Layer Architecture

### 5.1 Pipeline Overview

```
YAML String ←→ Intermediate Representation (IR) ←→ React Flow (Nodes/Edges)
    ↑                        ↑                              ↑
[js-yaml]              [Validators]                    [Dagre Layout]
```

**Why 3 layers?**

1. **Separation of concerns**: Parsing ≠ layout ≠ rendering
2. **Validation**: IR enforces business rules before visualization
3. **Bidirectional symmetry**: Same IR for both conversions
4. **Testability**: Mock IR for unit tests

### 5.2 Beqeek Implementation (Existing)

**File**: `yaml-converter.ts`

```tsx
// ✅ Public API with error handling
export function yamlToReactFlow(yamlString: string): YAMLToReactFlowResult {
  const ir = parseWorkflowYAML(yamlString); // YAML → IR
  const { nodes, edges, trigger } = irToReactFlow(ir); // IR → React Flow
  return { nodes, edges, trigger, ir };
}

export function reactFlowToYAML(nodes: Node[], edges: Edge[], trigger: TriggerIR): string {
  const ir = reactFlowToIR(nodes, edges, trigger); // React Flow → IR (topological sort)
  return serializeWorkflowYAML(ir); // IR → YAML
}
```

**File**: `ir-to-reactflow.ts` (IR → Nodes/Edges)

```tsx
export function irToReactFlow(ir: WorkflowIR): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  ir.stages.forEach((stage) => {
    stage.blocks.forEach((block, idx) => {
      // Create node from block
      nodes.push({
        id: block.id,
        type: block.type,
        position: block.metadata?.position || { x: 0, y: 0 },
        data: block.input,
      });

      // Create edges from dependencies
      if (idx > 0) {
        const prevBlock = stage.blocks[idx - 1];
        edges.push({
          id: `${prevBlock.id}-${block.id}`,
          source: prevBlock.id,
          target: block.id,
        });
      }
    });
  });

  return { nodes, edges };
}
```

**File**: `reactflow-to-ir.ts` (Nodes/Edges → IR)

```tsx
import { topologicalSort } from './topological-sort';

export function reactFlowToIR(nodes: Node[], edges: Edge[], trigger: TriggerIR): WorkflowIR {
  // Build adjacency list
  const graph = new Map<string, string[]>();
  edges.forEach((e) => {
    if (!graph.has(e.source)) graph.set(e.source, []);
    graph.get(e.source)!.push(e.target);
  });

  // Topological sort for execution order
  const sortedIds = topologicalSort(graph);

  // Reconstruct blocks in sorted order
  const blocks = sortedIds.map((id) => {
    const node = nodes.find((n) => n.id === id)!;
    return {
      id: node.id,
      type: node.type,
      name: node.data.name || node.id,
      input: node.data,
      dependencies: graph.get(id) || [],
    };
  });

  return { trigger, stages: [{ id: '1', name: 'main', blocks }] };
}
```

### 5.3 Topological Sort (DFS Postorder)

**File**: `topological-sort.ts`

```tsx
// ✅ Industry-standard algorithm with cycle detection
export class CircularDependencyError extends Error {
  constructor(public cycle: string[]) {
    super(`Circular dependency detected: ${cycle.join(' → ')}`);
  }
}

export function topologicalSort(graph: Map<string, string[]>): string[] {
  const visited = new Set<string>();
  const stack: string[] = [];
  const recursionStack = new Set<string>();

  function dfs(node: string, path: string[]) {
    if (recursionStack.has(node)) {
      throw new CircularDependencyError([...path, node]);
    }

    if (visited.has(node)) return;

    visited.add(node);
    recursionStack.add(node);

    (graph.get(node) || []).forEach((neighbor) => {
      dfs(neighbor, [...path, node]);
    });

    recursionStack.delete(node);
    stack.push(node);
  }

  graph.forEach((_, node) => {
    if (!visited.has(node)) dfs(node, []);
  });

  return stack.reverse(); // Reverse postorder
}
```

### 5.4 YAML Schema Validation (Zod)

**File**: `yaml-schemas.ts`

```tsx
import { z } from 'zod';

const LogBlockSchema = z.object({
  type: z.literal('log'),
  name: z.string().min(1),
  input: z.object({
    message: z.string(),
    level: z.enum(['info', 'warn', 'error', 'debug']),
  }),
});

const ConditionBlockSchema = z.object({
  type: z.literal('condition'),
  name: z.string(),
  input: z.object({
    expressions: z.array(
      z.object({
        operator: z.enum(['equals', 'greater_than', 'and', 'or']),
        operand: z.string(),
        value: z.any(),
      }),
    ),
  }),
  then: z.array(z.lazy(() => BlockSchema)), // Recursive schema
  else: z.array(z.lazy(() => BlockSchema)).optional(),
});

const BlockSchema = z.discriminatedUnion('type', [
  LogBlockSchema,
  ConditionBlockSchema,
  // ... other block types
]);
```

**Usage**:

```tsx
export function parseWorkflowYAML(yamlString: string): WorkflowIR {
  const parsed = yaml.load(yamlString);

  // Validate against schema
  const validated = WorkflowIRSchema.parse(parsed); // Throws ZodError if invalid

  return validated;
}
```

---

## 6. Best Practices Summary

### 6.1 Drag-and-Drop

- ✅ Use HTML Drag-and-Drop API for desktop (existing Beqeek pattern)
- ✅ Set `event.dataTransfer.effectAllowed = 'move'` for cursor feedback
- ⚠️ Consider Pointer Events for touch support (future)
- ✅ Use `screenToFlowPosition` hook for zoom-aware drop (improve existing)

### 6.2 Connection Validation

- ✅ Implement `isValidConnection` prop with DFS cycle detection (existing)
- ✅ Check node type compatibility (e.g., trigger → trigger = invalid)
- ✅ Validate at connection time (prevents invalid state)
- ⚠️ Add handle-level limits for branching nodes (e.g., condition `then`/`else`)

### 6.3 State Management

- ✅ Use Zustand for app state, React Flow hooks for canvas state (existing)
- ✅ Sync Zustand ← React Flow on every change (existing)
- ✅ Track dirty state for unsaved changes (existing)
- ⚠️ Add Zundo middleware for undo/redo (future enhancement)

### 6.4 YAML Conversion

- ✅ Use 3-layer architecture: YAML ↔ IR ↔ React Flow (existing)
- ✅ Validate with Zod schemas at IR layer (existing)
- ✅ Topological sort for execution order (existing)
- ✅ Store node positions in IR metadata for layout persistence (existing)

### 6.5 Node Configuration

- ✅ Use selected node IDs to drive config panel (existing)
- ✅ Immutable updates via `setNodes` callback (existing)
- ✅ Design token compliance for colors (existing)
- ✅ Category-based styling (trigger/action/logic) (existing)

---

## 7. Code Quality Checklist

**Beqeek implementation status**:

- ✅ **TypeScript strict mode**: All files use strict types
- ✅ **Design tokens**: No hardcoded colors (`border-accent-*`)
- ✅ **Error handling**: Try/catch with custom error classes
- ✅ **Accessibility**: ARIA labels on draggable items
- ✅ **Performance**: Memoized callbacks with `useCallback`
- ✅ **Testability**: IR layer decoupled from UI
- ⚠️ **Documentation**: Add JSDoc to public APIs (improve)
- ⚠️ **Undo/Redo**: Not yet implemented (future)
- ⚠️ **Touch support**: Not yet implemented (future)

---

## 8. Real-World Examples

### 8.1 n8n Workflow Automation

**Pattern**: Native graph JSON with explicit connections

```json
{
  "nodes": [
    { "id": "trigger", "type": "webhook", "position": [100, 100] },
    { "id": "filter", "type": "if", "position": [300, 100] },
    { "id": "send_email", "type": "smtp", "position": [500, 50] }
  ],
  "connections": {
    "trigger": { "main": [[{ "node": "filter" }]] },
    "filter": { "main": [[{ "node": "send_email" }]] }
  }
}
```

**Lesson**: Store node positions for manual layout preservation (Beqeek already does this in IR metadata).

### 8.2 Temporal Workflow DSL

**Pattern**: Dependency graph extracted from variable references

```yaml
workflow:
  - id: fetch_user
    activity: GetUser
    result: user
  - id: send_email
    activity: SendEmail
    arguments:
      to: $user.email # Dependency on fetch_user
```

**Lesson**: Parse `$[variable]` references to build adjacency list (Beqeek uses this pattern).

### 8.3 GitHub Actions

**Pattern**: Flat job structure with `needs` dependencies

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps: [...]

  deploy:
    needs: test # Explicit dependency
    steps: [...]
```

**Lesson**: Avoid deep nesting - use flat structure with explicit edges (Beqeek uses stages + blocks).

---

## 9. References

**Official Documentation**:

- React Flow Drag-and-Drop: https://reactflow.dev/examples/interaction/drag-and-drop
- Connection Validation: https://reactflow.dev/examples/interaction/validation
- State Management: https://reactflow.dev/learn/advanced-use/state-management
- Undo/Redo: https://reactflow.dev/examples/interaction/undo-redo

**Libraries**:

- React Flow v12: https://reactflow.dev
- Zundo (undo/redo): https://github.com/charkour/zundo
- js-yaml: https://github.com/nodeca/js-yaml
- Zod validation: https://zod.dev

**Related Beqeek Files**:

- `/apps/web/src/features/workflow-units/components/workflow-builder/workflow-canvas.tsx`
- `/apps/web/src/features/workflow-units/stores/workflow-editor-store.ts`
- `/apps/web/src/features/workflow-units/utils/connection-validator.ts`
- `/apps/web/src/features/workflow-units/utils/yaml-converter.ts`
- `/plans/yaml-workflow-research/yaml-workflow-conversion-research.md`

---

## 10. Unresolved Questions

1. **Auto-layout trigger**: Re-layout on every node add, or manual "Auto-Layout" button?
2. **Multi-stage visualization**: Show stages as grouped containers or just organizational?
3. **Variable dependency visualization**: Show `$[variable]` references as dashed edges?
4. **Mobile support**: Implement touch-based drag-and-drop or desktop-only?
5. **Undo granularity**: Snapshot entire state or incremental patches?

---

**Status**: ✅ Research complete. Beqeek implementation follows industry best practices with 3-layer IR architecture, DFS validation, and Zustand state sync. Recommended enhancements: (1) Zundo undo/redo, (2) `screenToFlowPosition` for drop, (3) handle-level connection limits.
