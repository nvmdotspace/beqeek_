# Phase 2: YAML Conversion

**Date**: 2025-11-20
**Priority**: P0 (Critical path)
**Status**: Planning
**Estimated Effort**: 8-10 hours

## Context

**Related Files**:

- Research: `/plans/yaml-workflow-research/yaml-workflow-conversion-research.md`
- Node types: `apps/web/src/features/workflows/components/node-palette.tsx`
- Canvas store: `apps/web/src/features/workflows/stores/workflow-editor-store.ts`

**Research Findings**:

- **Pattern**: YAML → IR (Intermediate Representation) → React Flow Nodes
- **Validation**: Zod schemas at every layer
- **Dependencies**: Extract from node configs, topological sort for execution order
- **Error Handling**: Collect all errors, don't fail fast

## Key Insights from Research

1. **Intermediate Representation (IR)**: Decouple YAML from React Flow
2. **Topological Sort**: Ensure nodes execute in dependency order
3. **Bidirectional**: Parse (YAML → Nodes) and Serialize (Nodes → YAML)
4. **Position Calculation**: Auto-layout using Dagre or manual calculation
5. **Type Safety**: Validate with Zod at parse + serialize boundaries

## Requirements

### Functional

- Parse YAML to React Flow nodes + edges
- Serialize React Flow nodes + edges to YAML
- Extract dependencies from node configs
- Topologically sort nodes for execution order
- Validate YAML structure (Zod schemas)
- Handle parsing errors gracefully
- Auto-calculate node positions (if not in YAML)

### Non-Functional

- Parsing under 100ms for 100-node workflows
- Preserve unknown fields (future compatibility)
- Support all 17 node types
- Handle circular dependencies (error)
- Round-trip fidelity (parse → serialize = original)

## Architecture

### Data Flow

**Parse Direction**:

```
YAML String
  ↓ (js-yaml)
YAML Object
  ↓ (Zod validation)
IR (Intermediate Representation)
  ↓ (toReactFlow)
React Flow Nodes + Edges
```

**Serialize Direction**:

```
React Flow Nodes + Edges
  ↓ (fromReactFlow)
IR (Intermediate Representation)
  ↓ (topological sort)
Sorted IR
  ↓ (js-yaml)
YAML String
```

### Intermediate Representation (IR)

```typescript
interface WorkflowIR {
  version: string; // e.g., "1.0"
  trigger: TriggerIR;
  steps: StepIR[];
  metadata?: {
    description?: string;
    tags?: string[];
  };
}

interface TriggerIR {
  type: 'schedule' | 'webhook' | 'form' | 'table';
  config: Record<string, unknown>; // Type-specific config
}

interface StepIR {
  id: string; // Unique step ID
  name: string; // Display name
  type: string; // Node type (e.g., 'http', 'condition', 'loop')
  config: Record<string, unknown>; // Node-specific config
  depends_on?: string[]; // Step IDs this depends on
  position?: { x: number; y: number }; // Optional for manual layout
}

interface EdgeIR {
  source: string; // Source step ID
  target: string; // Target step ID
  label?: string; // Edge label (for conditions)
}
```

### Zod Schemas

```typescript
import { z } from 'zod';

export const TriggerIRSchema = z.object({
  type: z.enum(['schedule', 'webhook', 'form', 'table']),
  config: z.record(z.unknown()),
});

export const StepIRSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  type: z.string().min(1),
  config: z.record(z.unknown()),
  depends_on: z.array(z.string()).optional(),
  position: z
    .object({
      x: z.number(),
      y: z.number(),
    })
    .optional(),
});

export const WorkflowIRSchema = z.object({
  version: z.string().default('1.0'),
  trigger: TriggerIRSchema,
  steps: z.array(StepIRSchema),
  metadata: z
    .object({
      description: z.string().optional(),
      tags: z.array(z.string()).optional(),
    })
    .optional(),
});
```

## Related Code Files

**Node Type Registry**:

- `apps/web/src/features/workflows/components/node-palette.tsx` - All 17 node types

**Existing Stores**:

- `apps/web/src/features/workflows/stores/workflow-editor-store.ts` - Canvas state

**Example YAML** (from research):

```yaml
version: '1.0'
trigger:
  type: schedule
  config:
    cron: '0 9 * * 1-5'
    timezone: 'Asia/Ho_Chi_Minh'

steps:
  - id: fetch_data
    name: Fetch Customer Data
    type: http
    config:
      method: GET
      url: 'https://api.example.com/customers'
      headers:
        Authorization: 'Bearer {{secrets.api_key}}'

  - id: process_data
    name: Process Data
    type: javascript
    depends_on:
      - fetch_data
    config:
      code: |
        return data.filter(c => c.status === 'active');

  - id: send_notification
    name: Send Notification
    type: notification
    depends_on:
      - process_data
    config:
      channel: slack
      message: 'Processed {{output.process_data.length}} customers'
```

## Implementation Steps

### 1. Create Type Definitions

**File**: `apps/web/src/features/workflows/utils/yaml-types.ts`

- Define `WorkflowIR`, `TriggerIR`, `StepIR`, `EdgeIR` interfaces
- Export TypeScript types

### 2. Create Zod Schemas

**File**: `apps/web/src/features/workflows/utils/yaml-schemas.ts`

- Define `WorkflowIRSchema` with all validators
- Export schemas for use in parser/serializer

### 3. Implement YAML Parser

**File**: `apps/web/src/features/workflows/utils/yaml-parser.ts`

```typescript
import yaml from 'js-yaml';
import { WorkflowIRSchema } from './yaml-schemas';
import type { WorkflowIR } from './yaml-types';

export function parseWorkflowYAML(yamlString: string): WorkflowIR {
  try {
    // Parse YAML to object
    const rawYaml = yaml.load(yamlString);

    // Validate with Zod
    const ir = WorkflowIRSchema.parse(rawYaml);

    return ir;
  } catch (error) {
    if (error instanceof yaml.YAMLException) {
      throw new Error(`YAML parsing error: ${error.message}`);
    }
    throw error;
  }
}
```

### 4. Implement IR → React Flow Converter

**File**: `apps/web/src/features/workflows/utils/ir-to-reactflow.ts`

```typescript
import type { Node, Edge } from '@xyflow/react';
import type { WorkflowIR } from './yaml-types';

export function irToReactFlow(ir: WorkflowIR): {
  nodes: Node[];
  edges: Edge[];
} {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // Convert steps to nodes
  ir.steps.forEach((step, index) => {
    nodes.push({
      id: step.id,
      type: step.type,
      position: step.position || calculatePosition(index, ir.steps.length),
      data: {
        label: step.name,
        config: step.config,
      },
    });

    // Convert depends_on to edges
    if (step.depends_on) {
      step.depends_on.forEach((sourceId) => {
        edges.push({
          id: `${sourceId}->${step.id}`,
          source: sourceId,
          target: step.id,
        });
      });
    }
  });

  return { nodes, edges };
}

function calculatePosition(index: number, total: number): { x: number; y: number } {
  // Simple vertical layout
  const x = 400; // Center
  const y = 100 + index * 120; // Spacing

  return { x, y };
}
```

### 5. Implement React Flow → IR Converter

**File**: `apps/web/src/features/workflows/utils/reactflow-to-ir.ts`

```typescript
import type { Node, Edge } from '@xyflow/react';
import type { WorkflowIR, StepIR } from './yaml-types';

export function reactFlowToIR(nodes: Node[], edges: Edge[], trigger: WorkflowIR['trigger']): WorkflowIR {
  // Build dependency map from edges
  const dependencyMap = new Map<string, string[]>();
  edges.forEach((edge) => {
    const deps = dependencyMap.get(edge.target) || [];
    deps.push(edge.source);
    dependencyMap.set(edge.target, deps);
  });

  // Convert nodes to steps
  const steps: StepIR[] = nodes.map((node) => ({
    id: node.id,
    name: node.data.label || node.id,
    type: node.type!,
    config: node.data.config || {},
    depends_on: dependencyMap.get(node.id),
    position: { x: node.position.x, y: node.position.y },
  }));

  // Topologically sort steps
  const sortedSteps = topologicalSort(steps, dependencyMap);

  return {
    version: '1.0',
    trigger,
    steps: sortedSteps,
  };
}
```

### 6. Implement Topological Sort

**File**: `apps/web/src/features/workflows/utils/topological-sort.ts`

```typescript
import type { StepIR } from './yaml-types';

export function topologicalSort(steps: StepIR[], dependencyMap: Map<string, string[]>): StepIR[] {
  const sorted: StepIR[] = [];
  const visited = new Set<string>();
  const visiting = new Set<string>();

  function visit(stepId: string) {
    if (visited.has(stepId)) return;

    if (visiting.has(stepId)) {
      throw new Error(`Circular dependency detected involving step: ${stepId}`);
    }

    visiting.add(stepId);

    // Visit dependencies first
    const deps = dependencyMap.get(stepId) || [];
    deps.forEach(visit);

    visiting.delete(stepId);
    visited.add(stepId);

    const step = steps.find((s) => s.id === stepId);
    if (step) sorted.push(step);
  }

  steps.forEach((step) => visit(step.id));

  return sorted;
}
```

### 7. Implement YAML Serializer

**File**: `apps/web/src/features/workflows/utils/yaml-serializer.ts`

```typescript
import yaml from 'js-yaml';
import type { WorkflowIR } from './yaml-types';
import { WorkflowIRSchema } from './yaml-schemas';

export function serializeWorkflowYAML(ir: WorkflowIR): string {
  // Validate IR before serialization
  const validatedIR = WorkflowIRSchema.parse(ir);

  // Convert to YAML string
  const yamlString = yaml.dump(validatedIR, {
    indent: 2,
    lineWidth: 120,
    noRefs: true,
    sortKeys: false,
  });

  return yamlString;
}
```

### 8. Create Public API

**File**: `apps/web/src/features/workflows/utils/yaml-converter.ts`

```typescript
import type { Node, Edge } from '@xyflow/react';
import { parseWorkflowYAML } from './yaml-parser';
import { irToReactFlow } from './ir-to-reactflow';
import { reactFlowToIR } from './reactflow-to-ir';
import { serializeWorkflowYAML } from './yaml-serializer';
import type { WorkflowIR } from './yaml-types';

/**
 * Convert YAML string to React Flow nodes and edges
 */
export function yamlToReactFlow(yamlString: string): {
  nodes: Node[];
  edges: Edge[];
  trigger: WorkflowIR['trigger'];
} {
  const ir = parseWorkflowYAML(yamlString);
  const { nodes, edges } = irToReactFlow(ir);

  return { nodes, edges, trigger: ir.trigger };
}

/**
 * Convert React Flow nodes and edges to YAML string
 */
export function reactFlowToYAML(nodes: Node[], edges: Edge[], trigger: WorkflowIR['trigger']): string {
  const ir = reactFlowToIR(nodes, edges, trigger);
  const yamlString = serializeWorkflowYAML(ir);

  return yamlString;
}
```

### 9. Write Unit Tests

**File**: `apps/web/src/features/workflows/utils/yaml-converter.test.ts`

- Test YAML → IR parsing (valid + invalid cases)
- Test IR → React Flow conversion
- Test React Flow → IR conversion
- Test topological sort (with circular deps)
- Test round-trip fidelity (parse → serialize)
- Test error handling (malformed YAML, validation errors)

### 10. Integration Testing

- Load real event YAML from API
- Convert to React Flow, render on canvas
- Modify nodes, convert back to YAML
- Verify YAML structure matches expected format

## Todo List

- [ ] Create yaml-types.ts with IR interfaces
- [ ] Create yaml-schemas.ts with Zod validators
- [ ] Implement yaml-parser.ts (YAML → IR)
- [ ] Implement ir-to-reactflow.ts (IR → Nodes)
- [ ] Implement reactflow-to-ir.ts (Nodes → IR)
- [ ] Implement topological-sort.ts with cycle detection
- [ ] Implement yaml-serializer.ts (IR → YAML)
- [ ] Create yaml-converter.ts public API
- [ ] Write unit tests (80%+ coverage)
- [ ] Test with real event data
- [ ] Document usage examples

## Success Criteria

✅ **Parsing (YAML → React Flow)**:

- Parse valid YAML without errors
- Convert all 17 node types correctly
- Extract dependencies from `depends_on`
- Generate edges from dependencies
- Auto-calculate positions if missing

✅ **Serialization (React Flow → YAML)**:

- Convert nodes to steps with full config
- Extract dependencies from edges
- Topologically sort steps
- Generate valid YAML string
- Preserve positions

✅ **Validation**:

- Zod schemas validate all layers
- Circular dependency detection works
- Error messages are actionable
- Invalid YAML throws clear errors

✅ **Performance**:

- Parse 100-node workflow in <100ms
- Serialize 100-node workflow in <100ms
- No memory leaks

✅ **Round-Trip Fidelity**:

- `parse(serialize(nodes)) === nodes` (structurally)
- Unknown fields preserved
- Position accuracy ±1px

✅ **Testing**:

- 80%+ test coverage
- All node types tested
- Edge cases covered (circular deps, missing fields)

## Risk Assessment

**High Risk**: Circular dependency in workflows
→ Mitigation: Topological sort with cycle detection, throw error with helpful message

**Medium Risk**: Position calculation conflicts
→ Mitigation: Use Dagre for auto-layout (optional), fallback to simple vertical

**Low Risk**: YAML parsing errors
→ Mitigation: Zod validation, wrap js-yaml errors with context

## Security Considerations

1. **YAML Injection**: js-yaml safe mode enabled (no code execution)
2. **Input Validation**: Zod schemas validate structure + types
3. **Denial of Service**: Limit YAML size (backend enforces)
4. **Code Injection**: Node configs stored as data, not executed during parse

## Next Steps

1. Complete Phase 2 implementation (this file)
2. Test with sample events from research
3. Move to Phase 3: Event List UI (uses parsed events)
4. Integrate with Phase 1 API hooks
5. Build end-to-end flow: API → YAML → Canvas
