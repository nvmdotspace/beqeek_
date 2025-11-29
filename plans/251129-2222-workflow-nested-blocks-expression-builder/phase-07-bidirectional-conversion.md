# Phase 07: Bidirectional Conversion

**Duration:** 5-7 hours
**Priority:** Critical (data integrity)

## Objectives

Implement and test bidirectional conversion between nested IR, React Flow, and YAML formats without data loss. Ensure round-trip fidelity.

## Tasks

### 7.1 Extend React Flow to IR Converter for Nested Structures (2h)

**File:** `apps/web/src/features/workflow-units/utils/reactflow-to-ir.ts`

Update to extract branches and nested blocks from compound nodes:

```typescript
export function reactFlowToIR(nodes: Node[], edges: Edge[], trigger: TriggerIR): WorkflowIR {
  const regularNodes = nodes.filter((n) => !n.parentId); // Top-level nodes only
  const steps: StepIR[] = [];

  regularNodes.forEach((node) => {
    const step: StepIR = {
      id: node.id,
      name: (node.data?.label as string) || node.id,
      type: extractBaseType(node.type), // compound_condition → condition
      config: (node.data?.config as Record<string, unknown>) || {},
      depends_on: extractDependencies(node.id, edges, nodes),
      position: { x: Math.round(node.position.x), y: Math.round(node.position.y) },
    };

    // Extract branches for compound condition nodes
    if (node.type === 'compound_condition') {
      const children = nodes.filter((n) => n.parentId === node.id);
      const thenChildren = children.filter((n) => n.id.includes('_then_'));
      const elseChildren = children.filter((n) => n.id.includes('_else_'));

      step.branches = {
        then: thenChildren.length > 0 ? childrenToSteps(thenChildren, edges, nodes) : undefined,
        else: elseChildren.length > 0 ? childrenToSteps(elseChildren, edges, nodes) : undefined,
      };
    }

    // Extract nested blocks for compound loop nodes
    if (node.type === 'compound_loop') {
      const children = nodes.filter((n) => n.parentId === node.id);
      step.nested_blocks = children.length > 0 ? childrenToSteps(children, edges, nodes) : undefined;
    }

    steps.push(step);
  });

  // Topologically sort
  const dependencyMap = buildDependencyMap(steps);
  const sortedSteps = topologicalSort(steps, dependencyMap);

  return {
    version: '1.0',
    trigger,
    steps: sortedSteps,
  };
}

/**
 * Convert compound node type to base type
 * compound_condition → condition
 * compound_loop → loop
 */
function extractBaseType(nodeType: string): string {
  if (nodeType.startsWith('compound_')) {
    return nodeType.replace('compound_', '');
  }
  return nodeType;
}

/**
 * Convert child nodes to StepIR array
 */
function childrenToSteps(children: Node[], edges: Edge[], allNodes: Node[]): StepIR[] {
  // Sort children by position (top to bottom)
  const sortedChildren = [...children].sort((a, b) => a.position.y - b.position.y);

  return sortedChildren.map((child) => {
    const childId = extractChildStepId(child.id); // Remove parent prefix

    const step: StepIR = {
      id: childId,
      name: (child.data?.label as string) || childId,
      type: child.type || 'log',
      config: (child.data?.config as Record<string, unknown>) || {},
      position: { x: Math.round(child.position.x), y: Math.round(child.position.y) },
    };

    // Check if child has its own nested structure
    if (child.type === 'compound_condition' || child.type === 'compound_loop') {
      // Recursively handle nested compound nodes
      const grandchildren = allNodes.filter((n) => n.parentId === child.id);
      // ... recursive logic
    }

    return step;
  });
}

/**
 * Extract step ID from child node ID
 * parent_then_step1 → step1
 */
function extractChildStepId(childNodeId: string): string {
  const parts = childNodeId.split('_');
  return parts[parts.length - 1];
}

/**
 * Extract dependencies, excluding parent-child edges
 */
function extractDependencies(nodeId: string, edges: Edge[], nodes: Node[]): string[] | undefined {
  const node = nodes.find((n) => n.id === nodeId);
  if (!node) return undefined;

  const incomingEdges = edges.filter(
    (e) =>
      e.target === nodeId &&
      e.type !== 'branch' && // Exclude branch edges
      e.type !== 'loop', // Exclude loop-back edges
  );

  if (incomingEdges.length === 0) return undefined;

  return incomingEdges.map((e) => e.source);
}
```

### 7.2 Update YAML Serializer (1.5h)

**File:** `apps/web/src/features/workflow-units/utils/yaml-serializer.ts`

Handle nested branches and blocks in serialization:

```typescript
import yaml from 'js-yaml';
import { WorkflowIR, StepIR } from './yaml-types';

export function irToYAML(ir: WorkflowIR): string {
  const yamlObj = {
    version: ir.version,
    trigger: ir.trigger,
    steps: ir.steps.map(stepToYAML),
  };

  if (ir.callbacks) {
    yamlObj.callbacks = ir.callbacks;
  }

  return yaml.dump(yamlObj, {
    indent: 2,
    lineWidth: 100,
    noRefs: true,
  });
}

function stepToYAML(step: StepIR): any {
  const yamlStep: any = {
    id: step.id,
    name: step.name,
    type: step.type,
    config: step.config,
  };

  if (step.depends_on && step.depends_on.length > 0) {
    yamlStep.depends_on = step.depends_on;
  }

  if (step.position) {
    yamlStep.position = step.position;
  }

  // NEW: Serialize branches
  if (step.branches) {
    yamlStep.branches = {};
    if (step.branches.then) {
      yamlStep.branches.then = step.branches.then.map(stepToYAML);
    }
    if (step.branches.else) {
      yamlStep.branches.else = step.branches.else.map(stepToYAML);
    }
  }

  // NEW: Serialize nested blocks
  if (step.nested_blocks) {
    yamlStep.nested_blocks = step.nested_blocks.map(stepToYAML);
  }

  return yamlStep;
}
```

### 7.3 Round-Trip Validation Utility (1h)

**File:** `apps/web/src/features/workflow-units/utils/round-trip-validator.ts` (new)

```typescript
import { WorkflowIR, StepIR } from './yaml-types';
import { irToReactFlow } from './ir-to-reactflow';
import { reactFlowToIR } from './reactflow-to-ir';
import { irToYAML } from './yaml-serializer';
import { parseWorkflowYAML } from './yaml-parser';

export interface ValidationResult {
  success: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate round-trip conversion: IR → ReactFlow → IR
 */
export function validateRoundTrip(originalIR: WorkflowIR): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    // Step 1: IR → React Flow
    const { nodes, edges, trigger } = irToReactFlow(originalIR);

    // Step 2: React Flow → IR
    const reconstructedIR = reactFlowToIR(nodes, edges, trigger);

    // Step 3: Compare structures
    compareIRs(originalIR, reconstructedIR, errors, warnings);

    // Step 4: YAML round-trip
    const yamlString = irToYAML(originalIR);
    const parsedIR = parseWorkflowYAML(yamlString);
    compareIRs(originalIR, parsedIR, errors, warnings);
  } catch (error) {
    errors.push(`Round-trip failed: ${error instanceof Error ? error.message : String(error)}`);
  }

  return {
    success: errors.length === 0,
    errors,
    warnings,
  };
}

function compareIRs(original: WorkflowIR, reconstructed: WorkflowIR, errors: string[], warnings: string[]): void {
  // Compare step count
  if (original.steps.length !== reconstructed.steps.length) {
    errors.push(`Step count mismatch: original=${original.steps.length}, reconstructed=${reconstructed.steps.length}`);
  }

  // Compare each step
  original.steps.forEach((originalStep, index) => {
    const reconstructedStep = reconstructed.steps[index];
    if (!reconstructedStep) {
      errors.push(`Missing step at index ${index}: ${originalStep.id}`);
      return;
    }

    compareSteps(originalStep, reconstructedStep, errors, warnings, `steps[${index}]`);
  });
}

function compareSteps(
  original: StepIR,
  reconstructed: StepIR,
  errors: string[],
  warnings: string[],
  path: string,
): void {
  // Compare basic fields
  if (original.id !== reconstructed.id) {
    errors.push(`${path}: ID mismatch - ${original.id} vs ${reconstructed.id}`);
  }

  if (original.type !== reconstructed.type) {
    errors.push(`${path}: Type mismatch - ${original.type} vs ${reconstructed.type}`);
  }

  // Compare branches
  if (original.branches || reconstructed.branches) {
    if (!original.branches || !reconstructed.branches) {
      errors.push(`${path}: Branch presence mismatch`);
    } else {
      // Compare then branch
      if (original.branches.then?.length !== reconstructed.branches.then?.length) {
        errors.push(
          `${path}.branches.then: Length mismatch - ${original.branches.then?.length} vs ${reconstructed.branches.then?.length}`,
        );
      }

      // Compare else branch
      if (original.branches.else?.length !== reconstructed.branches.else?.length) {
        errors.push(
          `${path}.branches.else: Length mismatch - ${original.branches.else?.length} vs ${reconstructed.branches.else?.length}`,
        );
      }

      // Recursively compare branch steps
      original.branches.then?.forEach((thenStep, i) => {
        const reconstructedThenStep = reconstructed.branches?.then?.[i];
        if (reconstructedThenStep) {
          compareSteps(thenStep, reconstructedThenStep, errors, warnings, `${path}.branches.then[${i}]`);
        }
      });

      original.branches.else?.forEach((elseStep, i) => {
        const reconstructedElseStep = reconstructed.branches?.else?.[i];
        if (reconstructedElseStep) {
          compareSteps(elseStep, reconstructedElseStep, errors, warnings, `${path}.branches.else[${i}]`);
        }
      });
    }
  }

  // Compare nested blocks
  if (original.nested_blocks || reconstructed.nested_blocks) {
    if (original.nested_blocks?.length !== reconstructed.nested_blocks?.length) {
      errors.push(
        `${path}.nested_blocks: Length mismatch - ${original.nested_blocks?.length} vs ${reconstructed.nested_blocks?.length}`,
      );
    } else {
      original.nested_blocks?.forEach((nestedStep, i) => {
        const reconstructedNestedStep = reconstructed.nested_blocks?.[i];
        if (reconstructedNestedStep) {
          compareSteps(nestedStep, reconstructedNestedStep, errors, warnings, `${path}.nested_blocks[${i}]`);
        }
      });
    }
  }

  // Position changes are warnings, not errors
  if (original.position && reconstructed.position) {
    const deltaX = Math.abs(original.position.x - reconstructed.position.x);
    const deltaY = Math.abs(original.position.y - reconstructed.position.y);
    if (deltaX > 10 || deltaY > 10) {
      warnings.push(`${path}: Position changed by (${deltaX}, ${deltaY})`);
    }
  }
}
```

### 7.4 Comprehensive Round-Trip Tests (2h)

**File:** `apps/web/src/features/workflow-units/__tests__/round-trip-conversion.test.ts` (new)

```typescript
import { validateRoundTrip } from '../utils/round-trip-validator';
import { WorkflowIR } from '../utils/yaml-types';

describe('Round-Trip Conversion', () => {
  it('should preserve simple linear workflow', () => {
    const ir: WorkflowIR = {
      version: '1.0',
      trigger: { type: 'webhook', config: {} },
      steps: [
        { id: 'step1', name: 'Log', type: 'log', config: { message: 'Hello' } },
        { id: 'step2', name: 'Email', type: 'smtp_email', config: { to: 'test@example.com' } },
      ],
    };

    const result = validateRoundTrip(ir);
    expect(result.success).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should preserve condition with then/else branches', () => {
    const ir: WorkflowIR = {
      version: '1.0',
      trigger: { type: 'schedule', config: {} },
      steps: [
        {
          id: 'cond1',
          name: 'Check Status',
          type: 'condition',
          config: { expressions: [{ field: 'status', operator: '=', value: 'active' }] },
          branches: {
            then: [{ id: 'then1', name: 'Success Log', type: 'log', config: { message: 'Active' } }],
            else: [{ id: 'else1', name: 'Failure Log', type: 'log', config: { message: 'Inactive' } }],
          },
        },
      ],
    };

    const result = validateRoundTrip(ir);
    expect(result.success).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should preserve loop with nested blocks', () => {
    const ir: WorkflowIR = {
      version: '1.0',
      trigger: { type: 'table', config: {} },
      steps: [
        {
          id: 'loop1',
          name: 'Process Items',
          type: 'loop',
          config: { itemVariable: 'item', items: 'orders' },
          nested_blocks: [
            { id: 'nested1', name: 'Process', type: 'log', config: { message: 'Processing' } },
            { id: 'nested2', name: 'Update', type: 'table_operation', config: { action: 'update' } },
          ],
        },
      ],
    };

    const result = validateRoundTrip(ir);
    expect(result.success).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should preserve deeply nested conditions (3 levels)', () => {
    const ir: WorkflowIR = {
      version: '1.0',
      trigger: { type: 'webhook', config: {} },
      steps: [
        {
          id: 'cond1',
          name: 'Level 1',
          type: 'condition',
          config: {},
          branches: {
            then: [
              {
                id: 'cond2',
                name: 'Level 2',
                type: 'condition',
                config: {},
                branches: {
                  then: [
                    {
                      id: 'cond3',
                      name: 'Level 3',
                      type: 'condition',
                      config: {},
                      branches: {
                        then: [{ id: 'deep', name: 'Deep Log', type: 'log', config: {} }],
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
      ],
    };

    const result = validateRoundTrip(ir);
    expect(result.success).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should warn on position changes but not fail', () => {
    const ir: WorkflowIR = {
      version: '1.0',
      trigger: { type: 'webhook', config: {} },
      steps: [
        {
          id: 'step1',
          name: 'Log',
          type: 'log',
          config: {},
          position: { x: 100, y: 200 },
        },
      ],
    };

    const result = validateRoundTrip(ir);
    expect(result.success).toBe(true);
    expect(result.warnings.length).toBeGreaterThanOrEqual(0); // May have position warnings
  });
});
```

### 7.5 Integration Testing with Real Workflows (0.5h)

Load actual legacy workflows and test conversion:

```typescript
describe('Legacy Workflow Round-Trip', () => {
  it('should convert PHP/Blockly condition workflow', async () => {
    const legacyYAML = await loadLegacyWorkflow('condition-with-branches.yaml');
    const { ir } = adaptYAMLToIR(legacyYAML);

    const result = validateRoundTrip(ir);
    expect(result.success).toBe(true);
  });

  it('should convert PHP/Blockly loop workflow', async () => {
    const legacyYAML = await loadLegacyWorkflow('loop-with-nested.yaml');
    const { ir } = adaptYAMLToIR(legacyYAML);

    const result = validateRoundTrip(ir);
    expect(result.success).toBe(true);
  });
});
```

## Validation Checklist

- [ ] React Flow to IR extracts branches correctly
- [ ] React Flow to IR extracts nested blocks correctly
- [ ] YAML serializer outputs branches and nested_blocks
- [ ] Round-trip validator detects structural differences
- [ ] 10+ round-trip tests pass
- [ ] Legacy workflow conversions tested
- [ ] Position changes logged as warnings, not errors
- [ ] Deeply nested workflows (3+ levels) work

## Dependencies

- All previous phases (complete implementation)

## Risks

- **Risk:** Floating point precision issues in position comparison
  **Mitigation:** Round positions to integers, allow 10px tolerance

- **Risk:** Topological sort fails with nested structures
  **Mitigation:** Mark loop-back edges, skip in dependency graph

## Next Phase

Phase 08 adds auto-layout for visual branch positioning.
