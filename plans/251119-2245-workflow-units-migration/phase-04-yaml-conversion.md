# Phase 4: YAML Conversion

**Date**: 2025-11-19 22:45
**Duration**: Week 5 (5 days)
**Priority**: Critical
**Dependencies**: Phase 3 complete
**Status**: ⚪ Not Started

---

## Context

Implement bi-directional YAML ↔ React Flow conversion. Parse YAML stages/blocks to nodes/edges, serialize nodes/edges back to YAML. Handle nested structures (condition, loop, match).

---

## Key Insights

**js-yaml Library**:

- `yaml.load()` for parsing YAML to JS objects
- `yaml.dump()` for serializing JS objects to YAML
- Options: `indent: 2`, `lineWidth: 120`, `noRefs: true`

**Zod Validation**:

- Schema per block type
- Runtime validation catches malformed YAML
- Type-safe parsing with `.parse()` vs `.safeParse()`

**Nested Block Challenges**:

- Condition: then/else arrays → separate node branches
- Loop: blocks array → subflow or expanded nodes
- Match: cases array → multiple branches

**Conversion Strategy**:

- YAML stages → horizontal layout (x-axis)
- YAML blocks → vertical flow (y-axis)
- Nested blocks → indented sub-graphs
- Auto-layout with dagre for complex workflows

---

## Requirements

### Functional Requirements

1. **YAML → Nodes** (`yaml-to-nodes.ts`):
   - Parse YAML string to stages/blocks structure
   - Create React Flow Node for each block
   - Generate edges based on execution order
   - Handle nested blocks (flatten or create subflows)
   - Auto-layout nodes (x/y positions)
   - Return { nodes: Node[], edges: Edge[] }

2. **Nodes → YAML** (`nodes-to-yaml.ts`):
   - Topological sort nodes by edges
   - Group nodes into stages
   - Convert node data to block structure
   - Serialize to YAML string
   - Preserve comments if possible
   - Return formatted YAML string

3. **Validation** (`yaml-validator.ts`):
   - Zod schemas for all 13 block types
   - Validate YAML structure before conversion
   - Return validation errors with line numbers
   - Type-safe interfaces from schemas

4. **Error Handling**:
   - Partial parsing: Extract valid blocks, flag errors
   - Recovery: Default values for missing fields
   - User-friendly error messages

### Technical Requirements

1. **Performance**:
   - Parse 1000-line YAML in <100ms
   - Serialize 100 nodes in <50ms
   - Memoize conversion results

2. **Accuracy**:
   - Round-trip conversion preserves logic
   - Test coverage >90% for converters
   - Handle edge cases (empty stages, circular refs)

---

## Implementation Steps

### Step 1: Define Zod Schemas (2 hours)

```typescript
// utils/yaml-schemas.ts
import { z } from 'zod';

export const ScheduleParamsSchema = z.object({
  expression: z.string(),
});

export const TableOperationBlockSchema = z.object({
  type: z.literal('table'),
  name: z.string(),
  input: z.object({
    connector: z.string(),
    action: z.enum(['get_list', 'get_one', 'create', 'update', 'delete']),
    query: z.record(z.unknown()).optional(),
    record: z.string().optional(),
    data: z.record(z.unknown()).optional(),
  }),
});

// ... schemas for all 13 block types

export const YamlBlockSchema = z.discriminatedUnion('type', [
  TableOperationBlockSchema,
  SmtpEmailBlockSchema,
  // ... all block schemas
]);

export const YamlStageSchema = z.object({
  name: z.string(),
  blocks: z.array(YamlBlockSchema),
});

export const YamlWorkflowSchema = z.object({
  stages: z.array(YamlStageSchema),
});
```

### Step 2: Implement YAML → Nodes (4 hours)

```typescript
// utils/yaml-to-nodes.ts
import * as yaml from 'js-yaml';
import { Node, Edge } from '@xyflow/react';
import dagre from 'dagre';
import { YamlWorkflowSchema } from './yaml-schemas';

export const yamlToNodes = (yamlString: string): { nodes: Node[]; edges: Edge[] } => {
  try {
    const parsed = yaml.load(yamlString);
    const validated = YamlWorkflowSchema.parse(parsed);

    const nodes: Node[] = [];
    const edges: Edge[] = [];
    let nodeIdCounter = 0;

    validated.stages.forEach((stage, stageIdx) => {
      let previousNodeId: string | null = null;

      stage.blocks.forEach((block, blockIdx) => {
        const nodeId = `node-${nodeIdCounter++}`;

        nodes.push({
          id: nodeId,
          type: mapBlockTypeToNodeType(block.type),
          position: { x: 0, y: 0 }, // Will be auto-laid out
          data: {
            name: block.name,
            ...block.input,
          },
        });

        // Connect to previous block in stage
        if (previousNodeId) {
          edges.push({
            id: `edge-${previousNodeId}-${nodeId}`,
            source: previousNodeId,
            target: nodeId,
          });
        }

        previousNodeId = nodeId;

        // Handle nested blocks
        if (block.type === 'condition') {
          const { thenNodes, elseNodes } = handleConditionBlock(block, nodeId);
          nodes.push(...thenNodes);
          nodes.push(...elseNodes);
          // Create edges for then/else branches
        }

        // Handle loop blocks
        if (block.type === 'loop') {
          const loopNodes = handleLoopBlock(block, nodeId);
          nodes.push(...loopNodes);
        }
      });
    });

    // Auto-layout with dagre
    const layoutedNodes = autoLayout(nodes, edges);

    return { nodes: layoutedNodes, edges };
  } catch (error) {
    console.error('YAML parsing error:', error);
    throw new Error(`Invalid YAML: ${error.message}`);
  }
};

const autoLayout = (nodes: Node[], edges: Edge[]): Node[] => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: 'TB', nodesep: 100, ranksep: 150 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 200, height: 80 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  return nodes.map((node) => {
    const position = dagreGraph.node(node.id);
    return {
      ...node,
      position: { x: position.x, y: position.y },
    };
  });
};

const mapBlockTypeToNodeType = (blockType: string): string => {
  const mapping: Record<string, string> = {
    table: 'table_operation',
    user: 'user_operation',
    smtp_email: 'smtp_email',
    google_sheet: 'google_sheet',
    api_call: 'api_call',
    delay: 'delay',
    condition: 'condition',
    match: 'match',
    loop: 'loop',
    math: 'math',
    definition: 'definition',
    log: 'log',
  };
  return mapping[blockType] || 'log';
};
```

### Step 3: Implement Nodes → YAML (3 hours)

```typescript
// utils/nodes-to-yaml.ts
import * as yaml from 'js-yaml';
import { Node, Edge } from '@xyflow/react';

export const nodesToYaml = (nodes: Node[], edges: Edge[]): string => {
  // Build adjacency graph
  const graph = buildGraph(nodes, edges);

  // Topological sort
  const sortedNodes = topologicalSort(nodes, graph);

  // Group into stages (simple: one stage called "main")
  const stages = [
    {
      name: 'main',
      blocks: sortedNodes.map(nodeToBlock),
    },
  ];

  return yaml.dump(
    { stages },
    {
      indent: 2,
      lineWidth: 120,
      noRefs: true,
    },
  );
};

const nodeToBlock = (node: Node) => {
  const blockType = mapNodeTypeToBlockType(node.type);
  const { name, ...input } = node.data;

  return {
    type: blockType,
    name,
    input,
  };
};

const buildGraph = (nodes: Node[], edges: Edge[]): Map<string, string[]> => {
  const graph = new Map<string, string[]>();

  nodes.forEach((node) => graph.set(node.id, []));

  edges.forEach((edge) => {
    const targets = graph.get(edge.source) || [];
    targets.push(edge.target);
    graph.set(edge.source, targets);
  });

  return graph;
};

const topologicalSort = (nodes: Node[], graph: Map<string, string[]>): Node[] => {
  const visited = new Set<string>();
  const result: Node[] = [];

  const visit = (nodeId: string) => {
    if (visited.has(nodeId)) return;
    visited.add(nodeId);

    const children = graph.get(nodeId) || [];
    children.forEach(visit);

    const node = nodes.find((n) => n.id === nodeId);
    if (node) result.unshift(node);
  };

  // Find root nodes (no incoming edges)
  const rootIds = nodes
    .filter((node) => {
      return ![...graph.values()].flat().includes(node.id);
    })
    .map((n) => n.id);

  rootIds.forEach(visit);

  return result;
};

const mapNodeTypeToBlockType = (nodeType: string): string => {
  const mapping: Record<string, string> = {
    table_operation: 'table',
    user_operation: 'user',
    // ... inverse of yaml-to-nodes mapping
  };
  return mapping[nodeType] || 'log';
};
```

### Step 4: Implement Validator (2 hours)

```typescript
// utils/yaml-validator.ts
import * as yaml from 'js-yaml';
import { YamlWorkflowSchema } from './yaml-schemas';

export interface ValidationResult {
  valid: boolean;
  errors: Array<{
    path: string;
    message: string;
    lineNumber?: number;
  }>;
}

export const validateYaml = (yamlString: string): ValidationResult => {
  try {
    const parsed = yaml.load(yamlString);
    const result = YamlWorkflowSchema.safeParse(parsed);

    if (result.success) {
      return { valid: true, errors: [] };
    }

    return {
      valid: false,
      errors: result.error.errors.map((err) => ({
        path: err.path.join('.'),
        message: err.message,
      })),
    };
  } catch (error) {
    return {
      valid: false,
      errors: [{ path: 'root', message: error.message }],
    };
  }
};
```

### Step 5: Unit Tests (4 hours)

```typescript
// utils/yaml-to-nodes.test.ts
describe('yamlToNodes', () => {
  it('converts simple workflow', () => {
    const yaml = `
stages:
  - name: main
    blocks:
      - type: log
        name: log_start
        input:
          message: "Starting workflow"
          level: info
    `;

    const { nodes, edges } = yamlToNodes(yaml);

    expect(nodes).toHaveLength(1);
    expect(nodes[0].type).toBe('log');
    expect(edges).toHaveLength(0);
  });

  it('converts workflow with edges', () => {
    const yaml = `
stages:
  - name: main
    blocks:
      - type: log
        name: step1
        input:
          message: "Step 1"
      - type: log
        name: step2
        input:
          message: "Step 2"
    `;

    const { nodes, edges } = yamlToNodes(yaml);

    expect(nodes).toHaveLength(2);
    expect(edges).toHaveLength(1);
    expect(edges[0].source).toBe(nodes[0].id);
    expect(edges[0].target).toBe(nodes[1].id);
  });

  it('handles nested condition blocks', () => {
    // Test condition with then/else
  });

  it('throws on invalid YAML', () => {
    expect(() => yamlToNodes('invalid: [yaml')).toThrow();
  });
});
```

### Step 6: Integration with Editor (2 hours)

```typescript
// pages/workflow-event-editor.tsx
import { useEffect } from 'react';
import { useWorkflowEditorStore } from '../stores/workflow-editor-store';
import { yamlToNodes, nodesToYaml } from '../utils';

export default function WorkflowEventEditorPage() {
  const { mode, nodes, edges, setNodes, setEdges } = useWorkflowEditorStore();
  const { data: event } = useWorkflowEvent(workspaceId, eventId);

  // Load YAML to nodes on mount
  useEffect(() => {
    if (event?.yaml) {
      try {
        const { nodes, edges } = yamlToNodes(event.yaml);
        setNodes(nodes);
        setEdges(edges);
      } catch (error) {
        toast.error('Failed to parse workflow YAML');
      }
    }
  }, [event?.yaml]);

  const handleSave = async () => {
    try {
      const yaml = nodesToYaml(nodes, edges);
      await updateEventMutation.mutateAsync({ yaml });
      toast.success('Workflow saved');
    } catch (error) {
      toast.error('Failed to save workflow');
    }
  };

  // ... render canvas or monaco based on mode
}
```

---

## Todo List

- [ ] Define Zod schemas for 13 block types
- [ ] Implement yaml-to-nodes.ts
- [ ] Implement nodes-to-yaml.ts
- [ ] Implement yaml-validator.ts
- [ ] Handle nested condition blocks
- [ ] Handle nested loop blocks
- [ ] Handle match/case branching
- [ ] Implement auto-layout with dagre
- [ ] Write unit tests (90% coverage)
- [ ] Integration test with event editor
- [ ] Manual testing: round-trip conversion
- [ ] Edge case testing (empty, circular, malformed)

---

## Success Criteria

**Testable**:

- ✅ Simple YAML converts to nodes/edges correctly
- ✅ Nodes/edges convert to valid YAML
- ✅ Round-trip conversion preserves logic
- ✅ Validation catches malformed YAML
- ✅ Nested blocks handled correctly
- ✅ Error messages user-friendly
- ✅ Performance: <100ms for 1000-line YAML

**Measurable**:

- Test coverage >90%
- 0 TypeScript errors
- 3 converter utilities created
- 13 Zod schemas defined

---

## Risk Assessment

| Risk                        | Impact | Probability | Mitigation                               |
| --------------------------- | ------ | ----------- | ---------------------------------------- |
| Nested block complexity     | High   | High        | Simplify initial version, iterate        |
| Round-trip data loss        | High   | Medium      | Extensive testing, metadata preservation |
| Performance with large YAML | Medium | Low         | Optimize parsing, lazy evaluation        |
| Zod schema maintenance      | Medium | Medium      | Co-locate with node types, automate      |

---

**Phase 4 Completion**: When round-trip conversion works reliably
