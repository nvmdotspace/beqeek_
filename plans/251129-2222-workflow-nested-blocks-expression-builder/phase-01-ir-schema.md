# Phase 01: IR Schema Extension & Adapter Update

**Duration:** 3-5 hours
**Priority:** Critical (foundation for all phases)

## Objectives

Extend Intermediate Representation to support nested blocks for conditions/loops while maintaining backward compatibility with existing flat workflows.

## Tasks

### 1.1 Extend `yaml-types.ts` with Nested Structure (1h)

**File:** `apps/web/src/features/workflow-units/utils/yaml-types.ts`

Add optional nested fields to `StepIR`:

```typescript
export interface StepIR {
  // ... existing fields
  id: string;
  name: string;
  type: string;
  config: Record<string, unknown>;
  depends_on?: string[];
  position?: { x: number; y: number };

  // NEW: Nested block support
  branches?: {
    then?: StepIR[];
    else?: StepIR[];
  };
  nested_blocks?: StepIR[]; // For loops, match blocks
}
```

**Validation Rules:**

- `branches` only valid for `type: 'condition'`
- `nested_blocks` only valid for `type: 'loop' | 'match'`
- Cannot have both `branches` and `nested_blocks`
- Nested steps inherit parent's execution context

### 1.2 Update YAML Schema Validation (1h)

**File:** `apps/web/src/features/workflow-units/utils/yaml-schemas.ts`

Add Zod schema extensions:

```typescript
const StepIRSchema = z
  .object({
    // ... existing fields
    branches: z
      .object({
        then: z.array(z.lazy(() => StepIRSchema)).optional(),
        else: z.array(z.lazy(() => StepIRSchema)).optional(),
      })
      .optional(),
    nested_blocks: z.array(z.lazy(() => StepIRSchema)).optional(),
  })
  .refine(
    (data) => {
      // Cannot have both branches and nested_blocks
      return !(data.branches && data.nested_blocks);
    },
    { message: 'Step cannot have both branches and nested_blocks' },
  )
  .refine(
    (data) => {
      // branches only for condition
      if (data.branches && data.type !== 'condition') {
        return false;
      }
      // nested_blocks only for loop/match
      if (data.nested_blocks && !['loop', 'match'].includes(data.type)) {
        return false;
      }
      return true;
    },
    { message: 'Invalid nested structure for step type' },
  );
```

### 1.3 Modify `legacy-yaml-adapter.ts` to Preserve Branches (1.5h)

**File:** `apps/web/src/features/workflow-units/utils/legacy-yaml-adapter.ts`

**Current Behavior:**

```typescript
// Lines 97-145 - flattenBlocks() flattens everything
function flattenBlocks(blocks: LegacyBlock[], prefix: string = ''): StepIR[] {
  // Processes then/else as separate sequential steps
}
```

**New Behavior:**

```typescript
function convertBlocksPreservingNesting(blocks: LegacyBlock[], prefix: string = ''): StepIR[] {
  const steps: StepIR[] = [];

  for (const block of blocks) {
    const step: StepIR = {
      id: generateStepId(block.type, counter),
      name: block.name || `step_${counter}`,
      type: mapBlockType(block.type),
      config: mapBlockInputToConfig(block.type, block.input || {}),
    };

    // Handle condition branches (NEW)
    if (block.type === 'condition') {
      step.branches = {
        then: block.then ? convertBlocksPreservingNesting(block.then) : undefined,
        else: block.else ? convertBlocksPreservingNesting(block.else) : undefined,
      };
    }

    // Handle loop nested blocks (NEW)
    if (block.type === 'loop' && block.blocks) {
      step.nested_blocks = convertBlocksPreservingNesting(block.blocks);
    }

    // Handle match cases (NEW)
    if (block.type === 'match' && block.blocks) {
      step.nested_blocks = convertBlocksPreservingNesting(block.blocks);
    }

    // Regular nested blocks (for non-branching nodes)
    if (block.blocks && !['condition', 'loop', 'match'].includes(block.type)) {
      // Process as sequential children (existing behavior)
    }

    steps.push(step);
  }

  return steps;
}
```

**Keep Legacy Fallback:**

```typescript
export function convertLegacyToIR(legacyYaml: LegacyYAML, options?: { preserveNesting?: boolean }): WorkflowIR {
  const preserveNesting = options?.preserveNesting ?? true;

  const allSteps = preserveNesting
    ? convertBlocksPreservingNesting(stage.blocks || [])
    : flattenBlocks(stage.blocks || []); // Keep old behavior for compatibility

  // ...
}
```

### 1.4 Add Unit Tests for Nested IR (1h)

**File:** `apps/web/src/features/workflow-units/__tests__/nested-ir.test.ts` (new)

Test cases:

1. **Condition with then branch only**
2. **Condition with both then/else branches**
3. **Loop with nested blocks**
4. **Match with nested cases**
5. **Deeply nested conditions (3+ levels)**
6. **Invalid combinations (branches + nested_blocks)**
7. **Backward compatibility - flat workflows still work**
8. **Round-trip: Legacy YAML → IR → Legacy YAML preserves structure**

Example test:

```typescript
describe('Nested IR Schema', () => {
  it('should convert condition with branches', () => {
    const legacy: LegacyYAML = {
      stages: [
        {
          name: 'main',
          blocks: [
            {
              type: 'condition',
              name: 'check_status',
              input: {
                expressions: [
                  /* ... */
                ],
              },
              then: [
                {
                  type: 'log',
                  name: 'log_success',
                  input: { message: 'Success' },
                },
              ],
              else: [
                {
                  type: 'log',
                  name: 'log_failure',
                  input: { message: 'Failed' },
                },
              ],
            },
          ],
        },
      ],
    };

    const ir = convertLegacyToIR(legacy, { preserveNesting: true });

    expect(ir.steps[0].branches?.then).toHaveLength(1);
    expect(ir.steps[0].branches?.else).toHaveLength(1);
    expect(ir.steps[0].branches?.then?.[0].name).toBe('log_success');
  });
});
```

### 1.5 Documentation Update (0.5h)

**File:** `apps/web/src/features/workflow-units/README.md`

Add section on nested IR structure:

```markdown
## Nested Block Structure

Conditions and loops support nested blocks via `branches` and `nested_blocks`:

- **Condition nodes**: Use `branches.then` and `branches.else`
- **Loop nodes**: Use `nested_blocks` for repeated steps
- **Match nodes**: Use `nested_blocks` for case handlers

Nested steps do NOT appear in top-level `steps` array - they are
embedded within parent step definition.
```

## Validation Checklist

- [ ] `StepIR` interface extended with optional nested fields
- [ ] Zod schemas validate nested structure constraints
- [ ] Legacy adapter preserves then/else branches
- [ ] Legacy adapter preserves loop nested blocks
- [ ] Feature flag `preserveNesting` controls behavior
- [ ] All existing tests pass (no regression)
- [ ] 8+ new tests for nested structures pass
- [ ] README documents nested IR pattern

## Dependencies

None - pure type/schema work.

## Risks

- **Risk:** Breaking existing workflows that rely on flat structure
  **Mitigation:** Feature flag + keep `flattenBlocks()` as fallback

- **Risk:** Infinite recursion in deeply nested workflows
  **Mitigation:** Add max depth check (10 levels) in schema validation

## Next Phase

Phase 02 uses this IR structure to create compound React Flow nodes.
