# Phase 09: Testing & Validation

**Duration:** 6-8 hours
**Priority:** Critical (quality assurance)

## Objectives

Comprehensive testing of all nested block and expression builder features. Ensure production-ready quality with unit, integration, and E2E tests.

## Tasks

### 9.1 Unit Test Coverage (2h)

Ensure 80%+ code coverage for new modules.

**Files to Test:**

1. `yaml-types.ts` - Schema validation
2. `legacy-yaml-adapter.ts` - Branch preservation
3. `ir-to-reactflow.ts` - Compound node creation
4. `reactflow-to-ir.ts` - Branch extraction
5. `branch-layout.ts` - Positioning logic
6. `math-builder.tsx` - Expression tree
7. `query-builder.tsx` - Condition builder

**Example test suite:**

```typescript
// __tests__/legacy-yaml-adapter.test.ts
describe('Legacy YAML Adapter - Nested Blocks', () => {
  it('preserves condition then branch', () => {
    const legacy = createLegacyConditionWithThen();
    const ir = convertLegacyToIR(legacy, { preserveNesting: true });

    expect(ir.steps[0].branches?.then).toBeDefined();
    expect(ir.steps[0].branches?.then).toHaveLength(2);
  });

  it('preserves condition else branch', () => {
    const legacy = createLegacyConditionWithElse();
    const ir = convertLegacyToIR(legacy, { preserveNesting: true });

    expect(ir.steps[0].branches?.else).toBeDefined();
  });

  it('preserves loop nested blocks', () => {
    const legacy = createLegacyLoopWithBlocks();
    const ir = convertLegacyToIR(legacy, { preserveNesting: true });

    expect(ir.steps[0].nested_blocks).toHaveLength(3);
  });

  it('handles deeply nested conditions (5 levels)', () => {
    const legacy = createDeeplyNestedConditions(5);
    const ir = convertLegacyToIR(legacy, { preserveNesting: true });

    const depth = getMaxNestingDepth(ir.steps[0]);
    expect(depth).toBe(5);
  });

  it('falls back to flat mode when flag disabled', () => {
    const legacy = createLegacyConditionWithThen();
    const ir = convertLegacyToIR(legacy, { preserveNesting: false });

    expect(ir.steps[0].branches).toBeUndefined();
    expect(ir.steps).toHaveLength(3); // Flattened
  });
});
```

### 9.2 Integration Tests (2h)

Test interaction between modules.

**File:** `__tests__/integration/nested-workflow-flow.test.tsx`

```typescript
import { renderWorkflowBuilder } from '../test-utils';
import { createNestedConditionIR } from '../fixtures';

describe('Nested Workflow Integration', () => {
  it('loads nested condition and displays branches', async () => {
    const ir = createNestedConditionIR();
    const { getByText, getAllByRole } = renderWorkflowBuilder(ir);

    // Check compound condition node rendered
    expect(getByText('Check Status')).toBeInTheDocument();

    // Check then/else handles present
    const handles = getAllByRole('button', { name: /handle/i });
    expect(handles).toHaveLength(3); // input, then, else
  });

  it('allows editing condition expression', async () => {
    const { user, getByText, getByLabelText } = renderWorkflowBuilder();

    // Click condition node to open config
    await user.click(getByText('Condition'));

    // Expression builder should appear
    expect(getByLabelText('Add Rule')).toBeInTheDocument();

    // Add a rule
    await user.click(getByLabelText('Add Rule'));

    // Verify rule added
    expect(getByText('equals')).toBeInTheDocument();
  });

  it('converts to YAML and back without data loss', async () => {
    const originalIR = createComplexNestedIR();
    const { nodes, edges } = irToReactFlow(originalIR);

    const reconstructedIR = reactFlowToIR(nodes, edges, originalIR.trigger);
    const yamlString = irToYAML(reconstructedIR);
    const finalIR = parseWorkflowYAML(yamlString);

    expect(finalIR).toEqual(originalIR);
  });

  it('auto-layouts nested workflow correctly', async () => {
    const ir = createNestedConditionIR();
    const { nodes, edges } = irToReactFlow(ir);

    const layoutedNodes = autoLayout(nodes, edges);

    // Check parent positioned
    const parent = layoutedNodes.find((n) => n.type === 'compound_condition');
    expect(parent?.position.x).toBeGreaterThan(0);
    expect(parent?.position.y).toBeGreaterThan(0);

    // Check children have parentId
    const children = layoutedNodes.filter((n) => n.parentId === parent?.id);
    expect(children).toHaveLength(4); // 2 then + 2 else

    // Check no overlaps
    const overlaps = detectNodeOverlaps(layoutedNodes);
    expect(overlaps).toHaveLength(0);
  });
});
```

### 9.3 Visual Regression Tests (1h)

Use Playwright to capture screenshots and detect visual changes.

**File:** `e2e/nested-blocks.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Nested Blocks Visual Tests', () => {
  test('compound condition node renders correctly', async ({ page }) => {
    await page.goto('/workflows/editor');

    // Load fixture with nested condition
    await page.evaluate(() => {
      // Inject test workflow
    });

    // Take screenshot
    await expect(page).toHaveScreenshot('compound-condition.png');
  });

  test('branch edges have correct colors', async ({ page }) => {
    await page.goto('/workflows/editor');

    // Verify then edge is green
    const thenEdge = page.locator('[data-edge-type="branch"][data-label="then"]');
    await expect(thenEdge).toHaveCSS('stroke', 'rgb(var(--accent-green))');

    // Verify else edge is red
    const elseEdge = page.locator('[data-edge-type="branch"][data-label="else"]');
    await expect(elseEdge).toHaveCSS('stroke', 'rgb(var(--accent-red))');
  });

  test('expression builder UI matches design', async ({ page }) => {
    await page.goto('/workflows/editor');

    // Open condition config
    await page.click('[data-node-type="condition"]');

    // Wait for expression builder
    await page.waitForSelector('.queryBuilder-custom');

    // Screenshot
    await expect(page.locator('.queryBuilder-custom')).toHaveScreenshot('expression-builder.png');
  });
});
```

### 9.4 Performance Tests (1h)

Ensure large workflows perform acceptably.

**File:** `__tests__/performance/large-workflow.test.ts`

```typescript
describe('Performance Tests', () => {
  it('handles 100 nodes without lag', () => {
    const ir = generateLargeWorkflow(100);

    const startTime = performance.now();
    const { nodes, edges } = irToReactFlow(ir);
    const endTime = performance.now();

    expect(endTime - startTime).toBeLessThan(1000); // < 1 second
    expect(nodes).toHaveLength(100);
  });

  it('handles deeply nested workflow (10 levels)', () => {
    const ir = generateDeeplyNestedConditions(10);

    const startTime = performance.now();
    const { nodes } = irToReactFlow(ir);
    const endTime = performance.now();

    expect(endTime - startTime).toBeLessThan(2000); // < 2 seconds
    expect(getMaxNestingDepth(ir.steps[0])).toBe(10);
  });

  it('auto-layout completes in reasonable time', () => {
    const { nodes, edges } = generateRandomWorkflow(50);

    const startTime = performance.now();
    const layouted = autoLayout(nodes, edges);
    const endTime = performance.now();

    expect(endTime - startTime).toBeLessThan(500); // < 500ms
  });

  it('expression builder handles 20+ rules', () => {
    const query = generateComplexQuery(20);

    const { rerender } = render(
      <ExpressionBuilder initialQuery={query} onChange={() => {}} />
    );

    // Should render without performance issues
    expect(screen.getAllByRole('button', { name: /remove/i })).toHaveLength(20);
  });
});
```

### 9.5 Edge Case Testing (1.5h)

Test boundary conditions and error cases.

**File:** `__tests__/edge-cases.test.ts`

```typescript
describe('Edge Cases', () => {
  it('handles condition with only then branch (no else)', () => {
    const ir = createConditionThenOnly();
    const { nodes } = irToReactFlow(ir);

    const conditionNode = nodes.find(n => n.type === 'compound_condition');
    expect(conditionNode?.data.hasThenBranch).toBe(true);
    expect(conditionNode?.data.hasElseBranch).toBe(false);
  });

  it('handles empty loop (no nested blocks)', () => {
    const ir = createEmptyLoop();
    const { nodes } = irToReactFlow(ir);

    const loopNode = nodes.find(n => n.type === 'compound_loop');
    expect(loopNode?.data.childCount).toBe(0);
  });

  it('handles condition with empty branches', () => {
    const ir: WorkflowIR = {
      version: '1.0',
      trigger: { type: 'webhook', config: {} },
      steps: [{
        id: 'cond1',
        name: 'Empty Condition',
        type: 'condition',
        config: {},
        branches: {
          then: [],
          else: [],
        },
      }],
    };

    const { nodes } = irToReactFlow(ir);
    expect(nodes).toHaveLength(1); // Only parent, no children
  });

  it('handles malformed expression data gracefully', () => {
    const { container } = render(
      <ExpressionBuilder
        initialQuery={null as any}
        onChange={() => {}}
      />
    );

    // Should render with default empty query
    expect(container).toBeInTheDocument();
  });

  it('prevents circular dependencies in nested blocks', () => {
    const ir = createCircularDependency();

    expect(() => {
      const { nodes, edges } = irToReactFlow(ir);
      topologicalSort(nodes, edges);
    }).toThrow('Circular dependency detected');
  });

  it('handles max nesting depth limit', () => {
    const deeplyNested = createDeeplyNestedConditions(100);

    expect(() => {
      validateWorkflowIR(deeplyNested);
    }).toThrow('Max nesting depth exceeded (limit: 10)');
  });
});
```

### 9.6 Accessibility Testing (1h)

Ensure WCAG 2.1 AA compliance.

**File:** `__tests__/a11y/nested-blocks.test.tsx`

```typescript
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('Accessibility', () => {
  it('compound condition node has no a11y violations', async () => {
    const { container } = render(
      <CompoundConditionNode
        id="test"
        data={{ label: 'Test', hasThenBranch: true, hasElseBranch: true }}
      />
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('expression builder keyboard navigable', async () => {
    const { getByLabelText } = render(
      <ExpressionBuilder onChange={() => {}} />
    );

    const addRuleBtn = getByLabelText('Add Rule');

    // Should be focusable
    addRuleBtn.focus();
    expect(document.activeElement).toBe(addRuleBtn);

    // Should activate with Enter/Space
    fireEvent.keyDown(addRuleBtn, { key: 'Enter' });
    expect(getByLabelText('Field')).toBeInTheDocument();
  });

  it('handles have accessible labels', async () => {
    const { container } = render(
      <CompoundConditionNode
        id="test"
        data={{ label: 'Test', hasThenBranch: true, hasElseBranch: true }}
      />
    );

    const handles = container.querySelectorAll('[data-handleid]');
    handles.forEach(handle => {
      const ariaLabel = handle.getAttribute('aria-label');
      expect(ariaLabel).toBeTruthy();
    });
  });
});
```

### 9.7 Documentation & User Guide (1h)

**File:** `apps/web/src/features/workflow-units/README.md`

Add sections:

```markdown
## Nested Blocks

### Condition Branches

Condition nodes support **then** and **else** branches for conditional logic:

1. Add a Condition node to canvas
2. Click to open configuration panel
3. Use Expression Builder to define conditions
4. Connect nodes to **Then** (green) or **Else** (red) handles
5. Both branches can contain multiple nested steps

**Visual Indicators:**

- Green handle = Then branch (executes when condition is true)
- Red handle = Else branch (executes when condition is false)

### Loop Nested Blocks

Loop nodes repeat steps for each item in a collection:

1. Add a Loop node to canvas
2. Configure:
   - Collection: Array to iterate (e.g., `orders`, `users`)
   - Item Variable: Name for current item (e.g., `order`, `user`)
3. Drag child nodes inside loop container
4. Children execute once per iteration

**Execution Order:**

- Children run sequentially (top to bottom)
- After last child, loop repeats with next item
- After all items processed, flow continues to next node

### Expression Builder

Replace text inputs with visual query builder:

- **Add Rule**: Create single condition
- **Add Group**: Create nested AND/OR group
- **Combinators**: Toggle between AND/OR logic
- **Templates**: Use pre-built common patterns

**Available Operators:**

- Equality: `=`, `!=`
- Comparison: `<`, `>`, `<=`, `>=`
- Text: `contains`, `begins with`, `ends with`
- Null checks: `is null`, `is not null`
- Lists: `in`, `not in`

### Auto-Layout

Click **Auto Layout** button to arrange nodes:

- Uses hierarchical layout (top-to-bottom)
- Positions branches side-by-side
- Prevents overlaps
- Maintains visual clarity

**Tips:**

- Run after importing legacy workflows
- Run after adding many nodes
- Manual adjustments preserved after re-layout
```

### 9.8 Test Fixtures and Utilities (0.5h)

**File:** `__tests__/fixtures/nested-workflows.ts`

```typescript
export function createNestedConditionIR(): WorkflowIR {
  return {
    version: '1.0',
    trigger: { type: 'webhook', config: {} },
    steps: [
      {
        id: 'cond1',
        name: 'Check Status',
        type: 'condition',
        config: {
          expressions: [{ field: 'status', operator: '=', value: 'active' }],
        },
        branches: {
          then: [
            { id: 'then1', name: 'Send Success Email', type: 'smtp_email', config: {} },
            { id: 'then2', name: 'Log Success', type: 'log', config: {} },
          ],
          else: [
            { id: 'else1', name: 'Send Failure Email', type: 'smtp_email', config: {} },
            { id: 'else2', name: 'Log Failure', type: 'log', config: {} },
          ],
        },
      },
    ],
  };
}

export function createLoopWithBlocksIR(): WorkflowIR {
  // Similar fixture for loop
}

export function generateDeeplyNestedConditions(depth: number): WorkflowIR {
  // Recursive fixture generator
}
```

## Validation Checklist

- [ ] Unit test coverage ≥ 80% for new modules
- [ ] All integration tests pass
- [ ] Visual regression tests capture screenshots
- [ ] Performance tests meet targets (<1s for 100 nodes)
- [ ] Edge cases handled gracefully
- [ ] Accessibility tests pass (no violations)
- [ ] Documentation complete and accurate
- [ ] Test fixtures cover all scenarios
- [ ] Manual testing on real workflows

## Test Coverage Targets

| Module              | Target | Priority |
| ------------------- | ------ | -------- |
| yaml-types          | 90%    | High     |
| legacy-yaml-adapter | 85%    | Critical |
| ir-to-reactflow     | 85%    | Critical |
| reactflow-to-ir     | 85%    | Critical |
| branch-layout       | 80%    | High     |
| expression-builder  | 75%    | Medium   |
| math-builder        | 70%    | Medium   |

## Manual Testing Checklist

- [ ] Import legacy workflow with nested conditions
- [ ] Import legacy workflow with loops
- [ ] Create new nested condition from scratch
- [ ] Create new loop with nested blocks
- [ ] Edit expression using query builder
- [ ] Build complex math expression
- [ ] Auto-layout positions nodes correctly
- [ ] Export to YAML preserves structure
- [ ] Re-import exported YAML matches original
- [ ] Drag children within parent works
- [ ] Resize parent updates children
- [ ] Delete parent deletes children
- [ ] Connect branches to other nodes
- [ ] Execution shows correct flow

## Known Issues to Document

- Loop-back edges may confuse topological sort → skip in dependency graph
- Max nesting depth 10 levels → validation prevents deeper
- Large compound nodes (>20 children) may be slow → lazy render
- Expression builder bundle adds 50KB → lazy load component

## Dependencies

All previous phases complete.

## Next Steps After Phase 09

1. Beta release with feature flag
2. Gather user feedback
3. Performance optimization if needed
4. Gradual rollout to 100% users
5. Legacy workflow migration tool
