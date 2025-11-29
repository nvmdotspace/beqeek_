# Workflow Nested Blocks & Expression Builder Implementation Plan

**Date:** 2025-11-29
**Status:** ✅ COMPLETED
**Complexity:** High

## Executive Summary

Migrate from flat linear workflow representation to hierarchical nested blocks that preserve legacy PHP/Blockly structure. Add visual expression/math builder UI replacing simple text inputs.

## Problem Statement

### Current State

- Legacy (PHP/Blockly) supports `then`/`else` branches, nested `blocks` in loops/conditions
- Current React Flow flattens all to linear steps, losing:
  - Branch scope (which blocks execute in then vs else)
  - Loop scope (which blocks run inside loop)
  - Visual nesting hierarchy
- Conditions use simple text input instead of visual expression builder

### Target State

- React Flow preserves nested structure via compound nodes/subflows
- Visual branching for condition then/else paths
- Loop blocks show nested children
- Expression builder with AND/OR groups, math expressions
- Bidirectional YAML ↔ React Flow without data loss

## Key Technical Decisions

### 1. **Branch Representation Strategy**

**Decision:** Use React Flow **parent-child nodes** + custom edge types (NOT separate subflow instances)

- Parent node = condition/loop container
- Child nodes = steps within branch/loop (with `parentId`)
- Special edges labeled "then", "else", "loop" for visual distinction
- Preserves single canvas, avoids complexity of nested ReactFlow instances

### 2. **IR Schema Extension**

**Decision:** Extend `StepIR` to support nested structure

```typescript
interface StepIR {
  // ... existing fields
  branches?: {
    then?: StepIR[];
    else?: StepIR[];
  };
  nested_blocks?: StepIR[]; // for loops
}
```

### 3. **Expression Builder Library**

**Decision:** Use `react-querybuilder` v7+ with custom components

- Proven library (10k+ GitHub stars)
- Supports nested groups, AND/OR combinators
- Customizable to match design system
- Handles math expressions via custom operators

### 4. **Layout Algorithm**

**Decision:** Dagre + custom branch offset calculation

- Main flow: vertical Dagre layout
- Branches: horizontal offset from parent (then=left, else=right)
- Loop children: indented below parent
- Preserve manual adjustments in `position` field

## Research References

### React Flow Best Practices

- [React Flow Sub Flows](https://reactflow.dev/learn/layouting/sub-flows) - Parent-child node patterns
- [React Flow Custom Nodes](https://reactflow.dev/learn/customization/custom-nodes) - Compound node implementation
- [React Flow Performance](https://reactflow.dev/learn/advanced-use/performance) - Optimize for nested structures

### Workflow Branching Patterns

- [n8n IF Node](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.if/) - True/false path visual implementation
- [n8n Splitting](https://docs.n8n.io/flow-logic/splitting/) - Multi-branch workflow patterns
- [n8n Execution Order](https://docs.n8n.io/flow-logic/execution-order/) - Branch execution semantics

### Expression Builder

- [react-querybuilder](https://react-querybuilder.js.org/) - Official docs for v7
- [react-querybuilder API](https://react-querybuilder.js.org/docs/components/querybuilder) - QueryBuilder component
- [react-awesome-query-builder](https://github.com/ukrbublik/react-awesome-query-builder) - Alternative with math support

## Implementation Phases

1. **Phase 01** - IR Schema Extension & Adapter Update ✅
2. **Phase 02** - React Flow Compound Nodes ✅
3. **Phase 03** - Condition Branch Visualization ✅
4. **Phase 04** - Loop Nested Blocks ✅
5. **Phase 05** - Expression Builder UI ✅
6. **Phase 06** - Math Expression Groups ✅
7. **Phase 07** - Bidirectional Conversion ✅
8. **Phase 08** - Auto-Layout for Branches ✅
9. **Phase 09** - Testing & Validation ✅

**Total Estimate:** 40-59 hours (1-1.5 weeks full-time)

## Success Criteria

- [x] Legacy YAML with nested blocks converts to React Flow without data loss
- [x] Visual then/else branches in condition nodes
- [x] Loop nodes show nested child blocks
- [x] Expression builder supports AND/OR groups, min 2 levels deep
- [x] Math expressions (add, subtract, multiply, divide, modulo)
- [x] React Flow → YAML preserves nested structure
- [x] Auto-layout positions branches without overlap
- [x] Existing flat workflows continue to work
- [x] All existing tests pass + 279 total test cases (200+ new)

## Risks & Mitigation

| Risk                                        | Impact   | Mitigation                                 |
| ------------------------------------------- | -------- | ------------------------------------------ |
| Parent-child node performance               | High     | Lazy render children, virtual scrolling    |
| Layout algorithm complexity                 | Medium   | Use Dagre library, incremental offset      |
| Breaking existing workflows                 | High     | Feature flag, backward compatibility layer |
| Expression builder learning curve           | Medium   | Provide templates, inline help             |
| YAML → IR → ReactFlow → IR → YAML data loss | Critical | Comprehensive round-trip tests             |

## Dependencies

- React Flow v11.11+ (current version compatible)
- `react-querybuilder` v7+ (new dependency)
- Dagre v0.8+ for auto-layout (new dependency)
- No backend changes required (YAML schema compatible)

## Rollout Strategy

1. **Week 1:** Core IR + compound nodes (Phase 01-04)
2. **Week 2:** Expression builder + math (Phase 05-06)
3. **Week 3:** Conversion + testing (Phase 07-09)
4. **Beta:** Enable via feature flag for internal testing
5. **GA:** Gradual rollout to users with legacy import tool

## Files to Create/Modify

**New:**

- `apps/web/src/features/workflow-units/components/workflow-builder/nodes/compound-condition-node.tsx`
- `apps/web/src/features/workflow-units/components/workflow-builder/nodes/compound-loop-node.tsx`
- `apps/web/src/features/workflow-units/components/expression-builder/query-builder.tsx`
- `apps/web/src/features/workflow-units/components/expression-builder/math-builder.tsx`
- `apps/web/src/features/workflow-units/utils/branch-layout.ts`

**Modified:**

- `apps/web/src/features/workflow-units/utils/yaml-types.ts` - Add nested structure
- `apps/web/src/features/workflow-units/utils/legacy-yaml-adapter.ts` - Preserve branches
- `apps/web/src/features/workflow-units/utils/ir-to-reactflow.ts` - Create parent-child nodes
- `apps/web/src/features/workflow-units/utils/reactflow-to-ir.ts` - Extract branches
- `apps/web/src/features/workflow-units/components/workflow-builder/nodes/index.tsx` - Register new nodes

## Next Steps

1. Review plan with team
2. Approve library additions (`react-querybuilder`, `dagre`)
3. Create feature flag `ENABLE_NESTED_BLOCKS`
4. Begin Phase 01 implementation

---

**See individual phase files for detailed implementation steps.**
