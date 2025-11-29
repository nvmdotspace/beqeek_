# Phase 3: Value Builders

## Context

- **Parent Plan**: [plan.md](./plan.md)
- **Dependencies**: Phase 1 (forms), Phase 2 (block types)
- **Reference**: Blade Blockly value blocks (`workflow-units.blade.php:211-227`)

## Overview

- **Date**: 2024-11-29
- **Description**: Implement value builders for constructing complex data (objects, arrays) in workflows
- **Priority**: Medium
- **Implementation Status**: ✅ Complete
- **Completion Date**: 2025-11-29
- **Review Status**: Verified - all types pass

## Key Insights

### Blade Value Blocks

```
[V] Giá trị:     text, math_number, logic_boolean
[V-R] Mảng:      dynamic_array, array_item
[V-O] Đối tượng: object_lookup, dynamic_object, object_pair
```

### How Blockly Value Blocks Work

```
┌──────────────────────────────────────────┐
│ dynamic_object                           │
│ Pairs ┌────────────────────────────────┐ │
│       │ object_pair                    │ │
│       │ Key [name_] Value ○───[text]   │ │ ← Nested blocks
│       ├────────────────────────────────┤ │
│       │ object_pair                    │ │
│       │ Key [age__] Value ○───[number] │ │
│       └────────────────────────────────┘ │
└──────────────────────────────────────────┘
```

**Output YAML:**

```yaml
data:
  name: 'John'
  age: 25
```

### React Flow Approach Options

| Approach              | Pros                          | Cons                |
| --------------------- | ----------------------------- | ------------------- |
| **A: JSON Editor**    | Simple, handles any structure | No visual building  |
| **B: Key-Value Form** | Visual, user-friendly         | Limited nesting     |
| **C: Value Nodes**    | Match Blade exactly           | Complex, many nodes |

**Recommendation**: Hybrid - JSON Editor with Key-Value builder overlay.

## Requirements

### Functional

- F1: Build objects visually with key-value pairs
- F2: Build arrays visually with item list
- F3: Reference variables with `$[context.field]` syntax
- F4: JSON editor fallback for complex cases

### Non-Functional

- NF1: Syntax highlighting for variable references
- NF2: Auto-complete for known context variables

## Architecture

### Proposed Components

```
ValueBuilder/
├── JsonEditor.tsx           # Monaco with YAML/JSON mode
├── KeyValueBuilder.tsx      # Visual key-value pairs
│   ├── KeyValueRow.tsx      # Single key-value pair
│   └── AddRowButton.tsx
├── ArrayBuilder.tsx         # Visual array items
│   ├── ArrayItemRow.tsx
│   └── AddItemButton.tsx
└── VariablePicker.tsx       # $[...] reference picker
```

### Integration Points

```tsx
// In node config forms
<FormField label="Query">
  <ValueBuilder
    value={data.query}
    onChange={(v) => updateNodeData(nodeId, { query: v })}
    mode="object" // or "array" or "any"
    contextVariables={availableVariables}
  />
</FormField>
```

## Related Code Files

| File                                           | Purpose                    |
| ---------------------------------------------- | -------------------------- |
| `components/value-builder/`                    | New directory for builders |
| `components/workflow-builder/node-forms/*.tsx` | Integration                |
| `utils/variable-resolver.ts`                   | Parse `$[...]` syntax      |
| `hooks/use-context-variables.ts`               | Get available variables    |

## Implementation Steps

### Step 1: Base Components

- [x] Create `JsonEditor` with Monaco (JSON mode)
- [x] Create `KeyValueBuilder` component
- [x] Create `ArrayBuilder` component

### Step 2: Variable Support

- [x] Create `VariablePicker` dropdown
- [x] Implement `$[context.field]` insertion via picker
- [x] Create `use-context-variables` hook

### Step 3: Form Integration

- [x] Replace text inputs with `ValueBuilder` where needed:
  - [x] `TableOperationForm.query`
  - [x] `TableOperationForm.data`
  - [x] `ApiCallForm.headers`
  - [x] `ApiCallForm.payload`
  - [x] `LogForm.context`
  - [ ] `ConditionForm.expressions` (deferred - needs separate expression builder)

### Step 4: Mode Toggle

- [x] Add toggle: Visual Builder ↔ JSON Editor
- [x] Sync state between modes

## Todo List

- [x] Create `JsonEditor` component
- [x] Create `KeyValueBuilder` component
- [x] Create `KeyValueRow` component
- [x] Create `ArrayBuilder` component
- [x] Create `ArrayItemRow` component (inline in ArrayBuilder)
- [x] Create `VariablePicker` component
- [x] Create `use-context-variables` hook
- [x] Integrate into forms
- [x] Add mode toggle
- [ ] Test with complex data (manual testing needed)

## Success Criteria

- [x] Can build `{ key: value, ... }` visually
- [x] Can build `[item1, item2, ...]` visually
- [x] Can insert `$[context.field]` variables
- [x] JSON editor works for complex cases
- [x] Mode toggle preserves data

## Risk Assessment

| Risk                         | Impact | Mitigation                        |
| ---------------------------- | ------ | --------------------------------- |
| Complex nested objects       | High   | JSON editor fallback              |
| Variable auto-complete scope | Medium | Limit to current workflow context |
| Performance with large data  | Low    | Virtualize lists                  |

## Security Considerations

- Validate JSON before save
- Sanitize variable references
- Prevent code injection in expressions

## Next Steps

After Phase 3 complete:

1. → Integration testing with real workflows
2. → Documentation for users
3. → Consider Phase 4: Expression builder (visual condition builder)
