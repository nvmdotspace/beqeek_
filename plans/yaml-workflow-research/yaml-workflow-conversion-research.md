# Research Report: YAML Workflow to Graph Conversion Patterns

**Date**: 2025-01-20
**Context**: Beqeek Workflow Units feature - dual-mode editor (YAML/visual)
**Scope**: Best practices for YAML workflow definitions and bidirectional graph conversion

---

## Executive Summary

This report analyzes workflow engine patterns (GitHub Actions, Temporal, n8n) to establish conversion strategy between hierarchical YAML and visual React Flow graphs for Beqeek Workflow Units. Key finding: **staged transformation** (YAML → IR → Graph) with topological ordering is industry standard for maintainability and error handling.

---

## 1. YAML Workflow Format Analysis

### 1.1 GitHub Actions Pattern

**Structure**: Jobs → Steps with conditional execution

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    if: github.event_name == 'pull_request'
    steps:
      - uses: actions/checkout@v3
      - name: Run tests
        run: npm test
```

**Key Insights**:

- **Flat job hierarchy** with dependencies via `needs: [job1, job2]`
- **Matrix strategy** for loops (parallel job creation, not sequential)
- **Conditionals** use `if:` with expression syntax, not nested blocks
- **Best practice**: Delegate complex logic to external scripts, keep YAML for orchestration only
- **Pain point**: Nested loops require 3 jobs + artifacts + jq scripting (avoid if possible)

**Lesson for Beqeek**: Separate orchestration (YAML) from business logic (action blocks). Keep nesting shallow.

---

### 1.2 Temporal DSL Pattern

**Structure**: Statements (ActivityInvocation, Sequence, Parallel) with topological execution

```yaml
workflow:
  statements:
    - type: sequence
      activities:
        - id: fetchData
          activity: GetUserData
          result: userData
        - id: processData
          activity: TransformData
          arguments:
            input: $userData
```

**Key Insights**:

- **Topological sort** determines execution order from dependencies
- **Explicit dependency graph**: Activity results become next activity's inputs
- **Parallel vs Sequential**: First-class citizens via statement types
- **Variable scope**: Results stored in workflow context (`$userData`)
- **DSL → Code**: YAML parsed into native Temporal workflow code

**Lesson for Beqeek**: Implement dependency graph extraction from `$[variable]` references. Use topo-sort for execution order.

---

### 1.3 n8n Pattern

**Structure**: Node-based JSON with explicit connections array

```json
{
  "nodes": [
    { "id": "node1", "type": "webhook", "parameters": {} },
    { "id": "node2", "type": "code", "parameters": { "code": "..." } }
  ],
  "connections": {
    "node1": { "main": [[{ "node": "node2", "type": "main", "index": 0 }]] }
  }
}
```

**Key Insights**:

- **Native graph format**: Nodes + explicit connection edges
- **No native YAML**: Uses JSON, but community nodes convert YAML ↔ JSON
- **Node dimensions required**: For visual layout (stored in `position` field)
- **Export = source control**: Workflows versioned in Git as JSON files
- **Credential security**: IDs/names removed before sharing

**Lesson for Beqeek**: Store React Flow node positions in YAML comments or separate metadata. Strip sensitive data on export.

---

## 2. YAML ↔ Graph Conversion Strategy

### 2.1 Recommended Architecture: 3-Layer Transformation

```
YAML <--> Intermediate Representation (IR) <--> React Flow Graph
         [Parser/Generator]              [Layout Engine]
```

**Why 3 layers?**

1. **Separation of concerns**: Parsing logic ≠ layout logic
2. **Bidirectional symmetry**: Same IR for both directions
3. **Validation layer**: IR enforces workflow correctness
4. **Extensibility**: Add new YAML features without touching layout

---

### 2.2 Intermediate Representation (IR) Design

**TypeScript interface**:

```typescript
interface WorkflowIR {
  stages: StageIR[];
}

interface StageIR {
  id: string;
  name: string;
  blocks: BlockIR[];
}

interface BlockIR {
  id: string; // UUID for node mapping
  type: string; // 'log' | 'table' | 'condition' | 'loop'...
  name: string;
  input: Record<string, unknown>;
  dependencies: string[]; // Extracted from $[variables]

  // Nested blocks (for condition/loop)
  then?: BlockIR[];
  else?: BlockIR[];
  blocks?: BlockIR[];
}
```

**Dependency extraction**:

```typescript
function extractDependencies(input: Record<string, unknown>): string[] {
  const deps = new Set<string>();
  const regex = /\$\[([^\]]+)\]/g;

  JSON.stringify(input).replace(regex, (_, ref) => {
    deps.add(ref.split('.')[0]); // Extract block name
    return '';
  });

  return Array.from(deps);
}
```

---

### 2.3 YAML → IR Parser (js-yaml + validation)

```typescript
import yaml from 'js-yaml';

function parseYamlToIR(yamlString: string): WorkflowIR {
  const parsed = yaml.load(yamlString);

  // Validate structure
  if (!parsed.stages || !Array.isArray(parsed.stages)) {
    throw new YAMLStructureError('Missing stages array');
  }

  // Transform to IR
  const ir: WorkflowIR = {
    stages: parsed.stages.map((stage) => ({
      id: generateId(),
      name: stage.name,
      blocks: parseBlocks(stage.blocks),
    })),
  };

  // Validate dependencies (no circular refs)
  validateDependencyGraph(ir);

  return ir;
}
```

---

### 2.4 IR → React Flow Graph Conversion

```typescript
import { Node, Edge } from '@xyflow/react';
import dagre from '@dagrejs/dagre';

function irToReactFlow(ir: WorkflowIR): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // Flatten nested blocks (condition/loop expand to subgraphs)
  ir.stages.forEach((stage) => {
    const stageNode = createStageNode(stage);
    nodes.push(stageNode);

    stage.blocks.forEach((block, idx) => {
      const blockNode = createBlockNode(block, stage.id);
      nodes.push(blockNode);

      // Connect to previous block or stage
      if (idx === 0) {
        edges.push({ id: `${stage.id}-${block.id}`, source: stage.id, target: block.id });
      } else {
        const prevBlock = stage.blocks[idx - 1];
        edges.push({ id: `${prevBlock.id}-${block.id}`, source: prevBlock.id, target: block.id });
      }

      // Handle nested blocks (condition branches)
      if (block.then) {
        const thenNodes = expandNestedBlocks(block.then, block.id, 'then');
        nodes.push(...thenNodes.nodes);
        edges.push(...thenNodes.edges);
      }

      if (block.else) {
        const elseNodes = expandNestedBlocks(block.else, block.id, 'else');
        nodes.push(...elseNodes.nodes);
        edges.push(...elseNodes.edges);
      }
    });
  });

  // Apply auto-layout
  return applyDagreLayout(nodes, edges);
}
```

---

### 2.5 Graph → IR → YAML (Reverse Flow)

**Challenge**: React Flow only stores nodes/edges, not hierarchical structure.

**Solution**: Reconstruct hierarchy via topological sort + heuristics

```typescript
function reactFlowToIR(nodes: Node[], edges: Edge[]): WorkflowIR {
  // Build adjacency list
  const graph = new Map<string, string[]>();
  edges.forEach((edge) => {
    if (!graph.has(edge.source)) graph.set(edge.source, []);
    graph.get(edge.source)!.push(edge.target);
  });

  // Topological sort to determine execution order
  const sorted = topologicalSort(graph);

  // Group nodes into stages (heuristic: stage boundaries are explicit stage nodes)
  const stages = groupByStages(sorted, nodes);

  // Reconstruct nested blocks (condition nodes with multiple outgoing edges)
  const ir: WorkflowIR = {
    stages: stages.map((stage) => ({
      id: stage.id,
      name: stage.name,
      blocks: reconstructBlocks(stage.nodeIds, nodes, edges),
    })),
  };

  return ir;
}

function topologicalSort(graph: Map<string, string[]>): string[] {
  const visited = new Set<string>();
  const stack: string[] = [];

  function dfs(node: string) {
    visited.add(node);
    (graph.get(node) || []).forEach((neighbor) => {
      if (!visited.has(neighbor)) dfs(neighbor);
    });
    stack.push(node);
  }

  graph.forEach((_, node) => {
    if (!visited.has(node)) dfs(node);
  });

  return stack.reverse();
}
```

---

## 3. React Flow Best Practices

### 3.1 Auto-Layout with Dagre

**Library**: `@dagrejs/dagre` (maintained fork)

**Setup**:

```typescript
import dagre from '@dagrejs/dagre';

function applyDagreLayout(nodes: Node[], edges: Edge[]): { nodes: Node[]; edges: Edge[] } {
  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: 'TB', ranksep: 80, nodesep: 40 });
  g.setDefaultEdgeLabel(() => ({}));

  // Add nodes with dimensions
  nodes.forEach((node) => {
    g.setNode(node.id, {
      width: node.measured?.width || 200,
      height: node.measured?.height || 80,
    });
  });

  // Add edges
  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target);
  });

  dagre.layout(g);

  // Update node positions
  const layoutedNodes = nodes.map((node) => {
    const pos = g.node(node.id);
    return { ...node, position: { x: pos.x, y: pos.y } };
  });

  return { nodes: layoutedNodes, edges };
}
```

**Key considerations**:

- **Node dimensions required**: Use `measured` property or defaults
- **Custom nodes**: Render first, then re-layout after measuring
- **Dynamic layout**: Trigger on node/edge changes via `useEffect`

---

### 3.2 Custom Node Types for Workflow Blocks

```typescript
const nodeTypes = {
  stage: StageNode,
  log: LogBlockNode,
  condition: ConditionBlockNode,
  loop: LoopBlockNode,
  table: TableBlockNode,
};

function ConditionBlockNode({ data }: NodeProps) {
  return (
    <div className="border-2 border-amber-500 rounded-lg p-4 bg-amber-50">
      <Handle type="target" position={Position.Top} />
      <div className="font-semibold">IF {data.name}</div>
      <div className="text-sm text-muted-foreground">{data.condition}</div>
      {/* Two output handles for then/else branches */}
      <Handle type="source" position={Position.Right} id="then" />
      <Handle type="source" position={Position.Bottom} id="else" />
    </div>
  );
}
```

---

### 3.3 State Management Integration

**Zustand store** (existing pattern):

```typescript
interface WorkflowEditorState {
  // IR as single source of truth
  workflowIR: WorkflowIR | null;

  // Derived state (computed from IR)
  nodes: Node[];
  edges: Edge[];

  // Actions
  setWorkflowFromYAML: (yaml: string) => void;
  updateBlock: (blockId: string, input: Record<string, unknown>) => void;
  addBlock: (stageId: string, blockType: string) => void;

  // Mode switching
  mode: 'yaml' | 'visual';
  switchMode: (mode: 'yaml' | 'visual') => void;
}

const useWorkflowEditorStore = create<WorkflowEditorState>((set, get) => ({
  workflowIR: null,
  nodes: [],
  edges: [],
  mode: 'visual',

  setWorkflowFromYAML: (yaml) => {
    const ir = parseYamlToIR(yaml);
    const { nodes, edges } = irToReactFlow(ir);
    set({ workflowIR: ir, nodes, edges });
  },

  switchMode: (mode) => {
    if (mode === 'yaml') {
      // Generate YAML from IR
      const yaml = irToYaml(get().workflowIR);
      // Update Monaco editor
    }
    set({ mode });
  },
}));
```

---

## 4. Error Handling & Validation

### 4.1 YAML Parsing Errors

**Common issues**:

- **Indentation errors**: YAML is whitespace-sensitive
- **Invalid types**: Expected array, got object
- **Missing required fields**: No `stages` key

**Strategy**:

```typescript
class WorkflowValidationError extends Error {
  constructor(
    message: string,
    public line?: number,
    public column?: number,
    public context?: string,
  ) {
    super(message);
  }
}

function parseWithErrorContext(yaml: string): WorkflowIR {
  try {
    const parsed = yaml.load(yaml);
    return validateAndTransform(parsed);
  } catch (error) {
    if (error instanceof yaml.YAMLException) {
      throw new WorkflowValidationError(
        error.message,
        error.mark?.line,
        error.mark?.column,
        getLineContext(yaml, error.mark?.line),
      );
    }
    throw error;
  }
}
```

**UI feedback**:

- Monaco editor: Highlight line with squiggly underline
- Toast notification: "YAML syntax error at line 12: Invalid indentation"

---

### 4.2 Circular Dependency Detection

**Algorithm**: DFS with visiting/visited states

```typescript
function validateDependencyGraph(ir: WorkflowIR): void {
  const graph = buildDependencyGraph(ir);
  const visiting = new Set<string>();
  const visited = new Set<string>();

  function detectCycle(node: string, path: string[]): void {
    if (visiting.has(node)) {
      throw new WorkflowValidationError(`Circular dependency detected: ${path.join(' → ')} → ${node}`);
    }

    if (visited.has(node)) return;

    visiting.add(node);
    path.push(node);

    (graph.get(node) || []).forEach((dep) => detectCycle(dep, [...path]));

    visiting.delete(node);
    visited.add(node);
  }

  graph.forEach((_, node) => {
    if (!visited.has(node)) detectCycle(node, []);
  });
}

function buildDependencyGraph(ir: WorkflowIR): Map<string, string[]> {
  const graph = new Map<string, string[]>();

  ir.stages.forEach((stage) => {
    stage.blocks.forEach((block) => {
      graph.set(block.name, block.dependencies);
    });
  });

  return graph;
}
```

---

### 4.3 Invalid Node Configuration

**Examples**:

- Loop with empty `blocks` array
- Condition with no `then` branch
- Table action missing `connector` ID

**Validation rules** (JSON Schema or Zod):

```typescript
import { z } from 'zod';

const ConditionBlockSchema = z.object({
  type: z.literal('condition'),
  name: z.string().min(1),
  input: z.object({
    expressions: z
      .array(
        z.object({
          operator: z.enum(['equals', 'greater_than', 'and', 'or']),
          operand: z.string(),
          value: z.any(),
        }),
      )
      .min(1),
  }),
  then: z.array(BlockSchema).min(1), // At least one block
  else: z.array(BlockSchema).optional(),
});

function validateBlock(block: unknown): BlockIR {
  return ConditionBlockSchema.parse(block); // Throws ZodError if invalid
}
```

---

## 5. Beqeek-Specific Recommendations

### 5.1 YAML Structure Enhancements

**Current structure** (from spec):

```yaml
stages:
  - name: process_order
    blocks:
      - type: condition
        name: check_total
        input: { ... }
        then: [...]
        else: [...]
```

**Suggested additions**:

```yaml
stages:
  - name: process_order
    description: 'Validate and process customer orders' # Human-readable
    blocks:
      - type: condition
        name: check_total
        id: blk_1a2b3c # Explicit ID (for graph mapping)
        input: { ... }
        then: [...]
        else: [...]
        metadata: # Store React Flow position
          position: { x: 100, y: 200 }
          color: '#fbbf24' # Custom styling
```

**Benefits**:

- `id`: Stable reference for graph nodes (UUID collision-resistant)
- `metadata.position`: Preserve manual layout adjustments
- `description`: Generate tooltips in visual mode

---

### 5.2 Conversion Flow Implementation

**Phase 1: Parser & Validator** (Week 1)

- `packages/workflow-yaml-parser/`: New package
- Exports: `parseYaml()`, `generateYaml()`, `validateWorkflow()`
- Dependencies: `js-yaml`, `zod`

**Phase 2: IR Layer** (Week 1)

- `@workspace/beqeek-shared/workflow-ir.ts`: Type definitions
- Dependency extraction logic
- Topological sort utility

**Phase 3: Graph Conversion** (Week 2)

- `apps/web/src/features/workflow-units/utils/ir-to-graph.ts`
- `apps/web/src/features/workflow-units/utils/graph-to-ir.ts`
- Dagre integration in `workflow-canvas.tsx`

**Phase 4: Custom Nodes** (Week 2-3)

- 13 node types (log, table, smtp_email, condition, loop, etc.)
- Color-coded by category (control flow = amber, data = blue, integration = green)
- Handle positioning for branch nodes (condition, match)

---

### 5.3 Error Handling UX

**Monaco Editor** (YAML mode):

- Real-time validation via `monaco.editor.setModelMarkers()`
- Errors: Red squiggly underline
- Warnings: Yellow (e.g., "Unused variable")

**React Flow** (Visual mode):

- Invalid nodes: Red border + warning icon
- Circular dependencies: Highlight involved nodes in orange
- Missing dependencies: Dashed gray edge to "ghost node"

**Console Output**: Unified error message format

```typescript
interface WorkflowError {
  type: 'syntax' | 'validation' | 'runtime';
  message: string;
  location?: {
    line?: number;
    column?: number;
    nodeId?: string;
  };
  severity: 'error' | 'warning';
  fix?: string; // Suggested fix
}
```

---

## 6. Performance Considerations

### 6.1 Large Workflows (100+ blocks)

**Challenges**:

- Dagre layout: O(n log n) time, may lag on 100+ nodes
- React Flow: Canvas re-renders on every node change

**Solutions**:

1. **Virtualization**: Only render visible viewport (React Flow built-in)
2. **Lazy layout**: Debounce re-layout during editing (300ms)
3. **Web Workers**: Run Dagre in background thread

```typescript
// workflow-layout-worker.ts
importScripts('dagre.js');

self.addEventListener('message', (e) => {
  const { nodes, edges } = e.data;
  const layouted = applyDagreLayout(nodes, edges);
  self.postMessage(layouted);
});

// usage
const worker = new Worker('/workflow-layout-worker.js');
worker.postMessage({ nodes, edges });
worker.onmessage = (e) => {
  setNodes(e.data.nodes);
  setEdges(e.data.edges);
};
```

---

### 6.2 Real-Time Collaboration (Future)

**Library**: Yjs (CRDT for collaborative editing)

```typescript
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

const ydoc = new Y.Doc();
const ytext = ydoc.getText('workflow-yaml');
const provider = new WebsocketProvider('ws://...', 'workflow-123', ydoc);

// Bind to Monaco editor
const binding = new MonacoBinding(ytext, monacoEditor.getModel(), new Set([monacoEditor]), provider.awareness);
```

---

## 7. Libraries & Dependencies

### 7.1 Required Packages

```json
{
  "dependencies": {
    "js-yaml": "^4.1.0", // YAML parsing
    "@dagrejs/dagre": "^1.1.4", // Auto-layout
    "zod": "^3.23.8", // Schema validation
    "@xyflow/react": "^12.0.0", // Already installed
    "uuid": "^10.0.0" // ID generation
  },
  "devDependencies": {
    "@types/js-yaml": "^4.0.9",
    "@types/dagre": "^0.7.52"
  }
}
```

---

### 7.2 Alternative Layout Engines

**Dagre** (recommended):

- ✅ Fast, simple, hierarchical layouts
- ❌ Limited customization (only TB, LR, RL, BT)

**ELK (Eclipse Layout Kernel)**:

- ✅ Advanced algorithms (layered, force-directed, orthogonal)
- ✅ Handles complex node sizes
- ❌ Larger bundle size (~200KB), overkill for most workflows

**d3-hierarchy**:

- ✅ Tree/radial layouts for hierarchical data
- ❌ Not ideal for DAGs with cross-stage edges

**Recommendation**: Start with Dagre, migrate to ELK if users create complex workflows with 50+ nodes.

---

## 8. Unresolved Questions

1. **Visual edits persistence**: Should manual node repositioning override auto-layout on next edit? Or preserve `metadata.position` in YAML?

2. **Stage boundaries**: Should stages have visual containers (grouped nodes) or just be organizational in YAML?

3. **Undo/redo**: Implement at IR level (full snapshot) or React Flow level (node/edge patches)?

4. **Nested loop depth limit**: Current spec allows infinite nesting. Enforce max depth (e.g., 5 levels)?

5. **Variable scope visualization**: How to show `$[workflowData.total]` dependencies in visual mode? (Dashed edges? Tooltip?)

6. **Version migration**: If YAML structure changes (e.g., add new field), how to migrate old workflows? Schema versioning?

7. **Real-time validation**: Validate on every keystroke (laggy?) or debounced (delayed feedback)?

---

## 9. References & Further Reading

- **Temporal DSL Samples**: [github.com/temporalio/samples-go/tree/main/dsl](https://github.com/temporalio/samples-go/tree/main/dsl)
- **React Flow Dagre Example**: [reactflow.dev/examples/layout/dagre](https://reactflow.dev/examples/layout/dagre)
- **GitHub Actions Workflow Syntax**: [docs.github.com/en/actions/reference/workflow-syntax](https://docs.github.com/en/actions/reference/workflow-syntax)
- **js-yaml Documentation**: [github.com/nodeca/js-yaml](https://github.com/nodeca/js-yaml)
- **Zod Validation**: [zod.dev](https://zod.dev)
- **Topological Sort**: [geeksforgeeks.org/topological-sorting](https://www.geeksforgeeks.org/topological-sorting/)

---

**End of Report**
