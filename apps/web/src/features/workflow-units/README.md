# Workflow Units Feature

Visual workflow editor built on React Flow with YAML-based workflow definitions.

## Overview

The Workflow Units feature provides a visual editor for creating and managing automation workflows. It supports:

- **Visual Canvas**: Drag-and-drop workflow design
- **YAML Mode**: Direct YAML editing with Monaco editor
- **Nested Blocks**: Compound nodes for conditions and loops
- **Auto-Layout**: Dagre-based hierarchical layout
- **Bidirectional Conversion**: YAML ↔ React Flow without data loss

## Architecture

```
workflow-units/
├── components/
│   ├── workflow-builder/     # Main canvas components
│   │   ├── canvas-header.tsx # Toolbar with save, layout, export
│   │   ├── workflow-canvas.tsx
│   │   ├── nodes/            # Custom node types
│   │   └── edges/            # Custom edge types
│   ├── node-forms/           # Configuration forms for each node type
│   └── expression-builder/   # Visual query/math expression UI
├── hooks/                    # React hooks
├── stores/                   # Zustand state management
├── utils/                    # Conversion and layout utilities
└── __tests__/               # Vitest test suites
```

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
   - Collection: Array to iterate (e.g., `$[orders]`, `$[users]`)
   - Item Variable: Name for current item (e.g., `order`, `user`)
3. Drag child nodes inside loop container
4. Children execute once per iteration

**Execution Order:**

- Children run sequentially (top to bottom)
- After last child, loop repeats with next item
- After all items processed, flow continues to next node

## Expression Builder

Visual query builder for condition expressions:

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

## Auto-Layout

Click **Auto Layout** button (or `Cmd+Shift+L`) to arrange nodes:

- Uses Dagre for hierarchical layout (top-to-bottom)
- Positions branches side-by-side for conditions
- Stacks loop children vertically
- Prevents overlaps between nodes

**Tips:**

- Run after importing legacy workflows
- Run after adding many nodes
- Manual adjustments are preserved

## YAML Format

### New IR Format

```yaml
version: '1.0'
trigger:
  type: webhook # schedule, webhook, form, table
  config: {}
steps:
  - id: step_1
    name: Check Status
    type: condition
    config:
      expressions:
        - field: status
          operator: '='
          value: active
    branches:
      then:
        - id: then_1
          name: Send Email
          type: smtp_email
          config:
            to: 'admin@example.com'
      else:
        - id: else_1
          name: Log Error
          type: log
          config:
            message: 'Status inactive'
```

### Legacy Format (PHP/Blockly)

The editor supports importing legacy workflows with `stages` and `blocks`:

```yaml
stages:
  - name: main
    blocks:
      - type: condition
        name: Check Status
        input:
          expressions:
            - field: status
              operator: '='
              value: active
        then:
          - type: smtp_email
            name: Send Email
            input:
              to: 'admin@example.com'
        else:
          - type: log
            name: Log Error
            input:
              message: 'Status inactive'
```

Legacy workflows are automatically converted to the new format on import.

## Testing

Run tests:

```bash
# All tests
pnpm --filter web test

# Watch mode
pnpm --filter web test:watch

# Coverage
pnpm --filter web test -- --coverage
```

### Test Suites

| Suite                                 | Description                     |
| ------------------------------------- | ------------------------------- |
| `legacy-yaml-adapter.test.ts`         | Legacy format conversion        |
| `ir-to-reactflow.test.ts`             | IR → React Flow nodes/edges     |
| `reactflow-to-ir.test.ts`             | React Flow → IR                 |
| `branch-layout.test.ts`               | Compound node child positioning |
| `dagre-layout.test.ts`                | Hierarchical graph layout       |
| `nested-workflow-integration.test.ts` | End-to-end flow                 |
| `performance.test.ts`                 | Scale and performance           |
| `edge-cases.test.ts`                  | Boundary conditions             |

### Test Fixtures

Located in `__tests__/fixtures/nested-workflows.ts`:

- `createNestedConditionIR()` - IR with condition branches
- `createLoopWithBlocksIR()` - IR with loop nested blocks
- `createLegacyConditionWithThen()` - Legacy format condition
- `generateLargeWorkflow(count)` - Performance testing
- `generateDeeplyNestedConditions(depth)` - Deep nesting

## Utilities

### Conversion Pipeline

```
Legacy YAML → adaptYAMLToIR() → IR → irToReactFlow() → React Flow Nodes/Edges
```

### Key Functions

| Function              | File                     | Purpose                    |
| --------------------- | ------------------------ | -------------------------- |
| `irToReactFlow`       | `ir-to-reactflow.ts`     | Convert IR to React Flow   |
| `reactFlowToIR`       | `reactflow-to-ir.ts`     | Convert React Flow to IR   |
| `convertLegacyToIR`   | `legacy-yaml-adapter.ts` | Legacy format conversion   |
| `autoLayout`          | `auto-layout.ts`         | Dagre + compound layout    |
| `applyDagreLayout`    | `dagre-layout.ts`        | Top-level node positioning |
| `applyCompoundLayout` | `branch-layout.ts`       | Child node positioning     |

## Known Limitations

- **Max nesting depth**: 10 levels (validated)
- **Large compound nodes**: >20 children may be slower (lazy render)
- **Loop-back edges**: Skipped in topological sort
- **Expression builder bundle**: ~50KB (lazy loaded)

## Related Documentation

- [Workflow YAML Editor Guide](../../../../docs/workflow-yaml-editor-guide.md)
- [Design System](../../../../docs/design-system.md)
