# Workflow Nested Blocks & Expression Builder - Implementation Plan

**Created:** 2025-11-29
**Status:** Planning Complete
**Estimated Duration:** 40-59 hours (1-1.5 weeks full-time)

## Overview

Comprehensive plan to migrate Beqeek workflow editor from flat linear representation to hierarchical nested blocks, preserving legacy PHP/Blockly structure. Adds visual expression/math builder replacing text inputs.

## Problem Solved

**Before:**

- Legacy workflows with `then`/`else` branches flattened to linear steps
- Lost branch scope, loop scope, visual nesting
- Conditions configured via plain text input
- No visual math formula builder

**After:**

- React Flow preserves nested structure via compound nodes
- Visual then/else branch splitting
- Loop blocks show nested children
- Expression builder with AND/OR groups
- Math formula builder with operator palette
- Bidirectional YAML ↔ React Flow without data loss

## Key Decisions

1. **Branch Strategy:** Parent-child React Flow nodes (NOT separate subflow instances)
2. **IR Schema:** Extended `StepIR` with `branches` and `nested_blocks` fields
3. **Expression Builder:** `react-querybuilder` v7+ with design system customization
4. **Layout:** Dagre for main flow + custom branch offset algorithm

## Implementation Phases

### Phase 01: IR Schema Extension (3-5h) ✅

- Extend `StepIR` with nested structure
- Update YAML schemas and validation
- Modify legacy adapter to preserve branches
- Comprehensive unit tests

### Phase 02: Compound Nodes (5-8h)

- Create compound condition/loop node components
- Parent-child relationships with `parentId` and `extent: 'parent'`
- Custom branch edge types with labels
- Node resizer for manual sizing

### Phase 03: Branch Visualization (4-6h)

- Multiple output handles (then/else)
- Color-coded branch edges (green=then, red=else)
- Merge node pattern for branch rejoin
- Connection validation for branches

### Phase 04: Loop Blocks (3-5h)

- Enhanced loop node visual design
- Nested block child positioning
- Loop edge type with iteration indicators
- Sequential child connections

### Phase 05: Expression Builder (6-8h)

- Install and configure `react-querybuilder`
- Custom styling to match design system
- Context-aware field suggestions
- Expression templates for quick start

### Phase 06: Math Expressions (4-6h)

- Visual math formula builder
- Operator palette (add, subtract, multiply, divide, etc.)
- Math templates (percentage, average, compound interest)
- YAML conversion for storage

### Phase 07: Bidirectional Conversion (5-7h)

- React Flow → IR extracts branches/nested blocks
- YAML serializer handles nested structure
- Round-trip validation utility
- Comprehensive conversion tests

### Phase 08: Auto-Layout (4-6h)

- Install Dagre for hierarchical layout
- Branch layout algorithm (then left, else right)
- Loop layout (vertical stack)
- Auto-layout button in UI

### Phase 09: Testing & Validation (6-8h)

- Unit tests (80%+ coverage)
- Integration tests
- Visual regression tests
- Performance tests (100 nodes, 10 nesting levels)
- Edge cases and accessibility

## Files Created/Modified

**New Files (15):**

- `compound-condition-node.tsx`
- `compound-loop-node.tsx`
- `merge-node.tsx`
- `branch-edge.tsx`
- `loop-edge.tsx`
- `query-builder.tsx` + CSS
- `math-builder.tsx`
- `dagre-layout.ts`
- `branch-layout.ts`
- `round-trip-validator.ts`
- `math-expression-converter.ts`
- Plus 5+ test files

**Modified Files (5):**

- `yaml-types.ts` - Add nested structure
- `legacy-yaml-adapter.ts` - Preserve branches
- `ir-to-reactflow.ts` - Create compound nodes
- `reactflow-to-ir.ts` - Extract branches
- `nodes/index.tsx` - Register new node types

## Dependencies

**New Libraries:**

- `react-querybuilder` v7+ (~50KB) - Expression builder
- `dagre` v0.8+ (~30KB) - Graph layout
- `@types/dagre` - TypeScript definitions

**No Backend Changes:** YAML schema compatible with existing API

## Success Metrics

- [ ] Legacy workflows import without data loss
- [ ] Visual then/else branches display correctly
- [ ] Loop nested blocks show hierarchy
- [ ] Expression builder supports 2+ nesting levels
- [ ] Math formulas build visually
- [ ] Round-trip conversion maintains fidelity
- [ ] Auto-layout positions without overlaps
- [ ] 80%+ test coverage
- [ ] All existing workflows continue working

## Rollout Plan

1. **Week 1:** Phases 01-04 (IR + compound nodes)
2. **Week 2:** Phases 05-06 (expression/math builders)
3. **Week 3:** Phases 07-09 (conversion + testing)
4. **Beta:** Feature flag `ENABLE_NESTED_BLOCKS` for internal testing
5. **GA:** Gradual rollout with legacy migration tool

## Risk Mitigation

| Risk                          | Mitigation                             |
| ----------------------------- | -------------------------------------- |
| Breaking existing workflows   | Feature flag + backward compatibility  |
| Performance with nested nodes | Lazy render, virtual scrolling         |
| Layout complexity             | Dagre library, incremental development |
| User learning curve           | Templates, tooltips, video tutorial    |
| Data loss in conversion       | Comprehensive round-trip tests         |

## Research References

### React Flow Best Practices

- [Sub Flows Guide](https://reactflow.dev/learn/layouting/sub-flows)
- [Custom Nodes](https://reactflow.dev/learn/customization/custom-nodes)
- [Performance](https://reactflow.dev/learn/advanced-use/performance)

### Workflow Patterns

- [n8n IF Node](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.if/)
- [n8n Splitting](https://docs.n8n.io/flow-logic/splitting/)
- [n8n Execution Order](https://docs.n8n.io/flow-logic/execution-order/)

### Expression Builder

- [react-querybuilder](https://react-querybuilder.js.org/)
- [QueryBuilder API](https://react-querybuilder.js.org/docs/components/querybuilder)

## Next Actions

1. ✅ **Review plan** - Stakeholder approval
2. **Approve libraries** - Add to package.json
3. **Create feature flag** - `ENABLE_NESTED_BLOCKS`
4. **Begin Phase 01** - IR schema extension

---

**Plan Author:** Claude (Sonnet 4.5)
**Plan Directory:** `/Users/macos/Workspace/buildinpublic/beqeek/plans/251129-2222-workflow-nested-blocks-expression-builder/`
**Total Files:** 11 markdown documents (main plan + 9 phase docs + README)
