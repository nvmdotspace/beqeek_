# Phase 03: Condition Branch Visualization

**Duration:** 4-6 hours
**Priority:** High (key UX improvement)

## Objectives

Implement visual branching for condition nodes showing distinct then/else paths, inspired by n8n's IF node pattern.

## Research Reference

From [n8n IF Node docs](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.if/):

- Two output handles: one for "true" path, one for "false" path
- Visual labels on handles
- Distinct colors for branch paths (green=true, red=false)
- Execution follows topmost-to-bottommost branch order

## Tasks

### 3.1 Add Multiple Output Handles to Condition Node (1.5h)

**File:** `apps/web/src/features/workflow-units/components/workflow-builder/nodes/compound-condition-node.tsx`

Modify to support two source handles:

```typescript
export const CompoundConditionNode = memo(({ id, data, selected }: CompoundConditionNodeProps) => {
  return (
    <div className="relative">
      {/* ... existing container ... */}

      {/* Input handle (top) */}
      <Handle
        type="target"
        position={Position.Top}
        id="input"
        className="!w-3 !h-3 !bg-accent-teal"
      />

      {/* THEN output handle (bottom-left) */}
      {data.hasThenBranch && (
        <Handle
          type="source"
          position={Position.Bottom}
          id="then"
          className="!w-3 !h-3 !bg-accent-green"
          style={{ left: '30%' }}
        >
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-medium text-accent-green whitespace-nowrap">
            ✓ Then
          </div>
        </Handle>
      )}

      {/* ELSE output handle (bottom-right) */}
      {data.hasElseBranch && (
        <Handle
          type="source"
          position={Position.Bottom}
          id="else"
          className="!w-3 !h-3 !bg-accent-red"
          style={{ left: '70%' }}
        >
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-medium text-accent-red whitespace-nowrap">
            ✗ Else
          </div>
        </Handle>
      )}

      {/* Fallback handle if no branches configured */}
      {!data.hasThenBranch && !data.hasElseBranch && (
        <Handle
          type="source"
          position={Position.Bottom}
          id="output"
          className="!w-3 !h-3 !bg-border"
        />
      )}
    </div>
  );
});
```

### 3.2 Update Edge Creation Logic (2h)

**File:** `apps/web/src/features/workflow-units/utils/ir-to-reactflow.ts`

When creating edges from condition node, specify `sourceHandle`:

```typescript
// Create edge from condition to then branch
if (step.branches?.then?.[0]) {
  edges.push({
    id: `${step.id}-then`,
    source: step.id,
    sourceHandle: 'then', // Specific handle ID
    target: `${step.id}_then_${step.branches.then[0].id}`,
    type: 'branch',
    label: 'then',
    animated: false,
    style: {
      stroke: 'var(--accent-green)',
      strokeWidth: 2,
    },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: 'var(--accent-green)',
    },
  });
}

// Create edge from condition to else branch
if (step.branches?.else?.[0]) {
  edges.push({
    id: `${step.id}-else`,
    source: step.id,
    sourceHandle: 'else', // Specific handle ID
    target: `${step.id}_else_${step.branches.else[0].id}`,
    type: 'branch',
    label: 'else',
    animated: false,
    style: {
      stroke: 'var(--accent-red)',
      strokeWidth: 2,
    },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: 'var(--accent-red)',
    },
  });
}
```

### 3.3 Implement Branch Merge Pattern (1.5h)

When branches rejoin workflow (both then/else complete), add merge node:

**File:** `apps/web/src/features/workflow-units/components/workflow-builder/nodes/merge-node.tsx` (new)

```typescript
import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { GitMerge } from 'lucide-react';

interface MergeNodeProps {
  id: string;
  data: {
    branchIds: string[]; // IDs of merged branches
  };
  selected?: boolean;
}

export const MergeNode = memo(({ id, data, selected }: MergeNodeProps) => {
  return (
    <div className="relative">
      <div className="w-12 h-12 rounded-full border-2 border-border bg-background flex items-center justify-center">
        <GitMerge className="size-5 text-muted-foreground" />
      </div>

      {/* Multiple target handles for branch inputs */}
      <Handle
        type="target"
        position={Position.Top}
        id="then"
        className="!w-2 !h-2 !bg-accent-green"
        style={{ left: '30%' }}
      />
      <Handle
        type="target"
        position={Position.Top}
        id="else"
        className="!w-2 !h-2 !bg-accent-red"
        style={{ left: '70%' }}
      />

      {/* Single output */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2 !h-2 !bg-border"
      />
    </div>
  );
});

MergeNode.displayName = 'MergeNode';
```

**Auto-insert merge nodes:**

```typescript
function detectBranchMerge(step: StepIR, allSteps: StepIR[]): string | null {
  // Find first step that depends on both then and else branches
  const thenLeafId = findLeafStep(step.branches?.then);
  const elseLeafId = findLeafStep(step.branches?.else);

  if (!thenLeafId || !elseLeafId) return null;

  // Find step that depends on both leaves
  const mergeStep = allSteps.find((s) => s.depends_on?.includes(thenLeafId) && s.depends_on?.includes(elseLeafId));

  return mergeStep?.id || null;
}

function findLeafStep(branch?: StepIR[]): string | null {
  if (!branch?.length) return null;
  // Find last step in branch (no children)
  const leaf = branch[branch.length - 1];
  return leaf.id;
}
```

### 3.4 Handle Connection Validation for Branches (1h)

**File:** `apps/web/src/features/workflow-units/utils/connection-validator.ts`

Update validation to handle branch handles:

```typescript
export function isValidConnection(connection: Connection, nodes: Node[], edges: Edge[]): boolean {
  // ... existing validation ...

  const sourceNode = nodes.find((n) => n.id === connection.source);
  const targetNode = nodes.find((n) => n.id === connection.target);

  // Prevent connecting to same branch twice
  if (sourceNode?.type === 'compound_condition') {
    const sourceHandle = connection.sourceHandle;
    const existingBranchEdge = edges.find((e) => e.source === connection.source && e.sourceHandle === sourceHandle);

    if (existingBranchEdge) {
      console.warn(`Branch "${sourceHandle}" already connected`);
      return false;
    }
  }

  // Prevent connecting child to different parent
  if (targetNode?.parentId && targetNode.parentId !== sourceNode?.id) {
    console.warn('Cannot connect child to different parent');
    return false;
  }

  return true;
}
```

### 3.5 Branch Execution Order Indicator (Optional, 0.5h)

Add visual indicator showing execution order (then before else):

```typescript
// In compound-condition-node.tsx, add badges
<div className="flex items-center gap-2 text-xs text-muted-foreground">
  <span className="px-1.5 py-0.5 bg-accent-green-subtle rounded text-accent-green">
    1st: Then
  </span>
  <span className="px-1.5 py-0.5 bg-accent-red-subtle rounded text-accent-red">
    2nd: Else
  </span>
</div>
```

## Validation Checklist

- [ ] Condition node has separate then/else handles
- [ ] Handles positioned at bottom-left (then) and bottom-right (else)
- [ ] Handle colors match branch type (green=then, red=else)
- [ ] Edges use correct `sourceHandle` ID
- [ ] Connection validator prevents duplicate branch connections
- [ ] Merge node component created
- [ ] Visual labels on handles ("✓ Then", "✗ Else")
- [ ] Manual test: connect branches works correctly

## Dependencies

- Phase 02 (compound nodes infrastructure)

## Visual Design

```
         ┌──────────────────┐
         │   Condition      │
         │  x > 10          │
         └────────┬─────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
    ✓ Then              ✗ Else
  (green)              (red)
        │                   │
   ┌────▼────┐        ┌─────▼─────┐
   │ Log OK  │        │ Log Error │
   └────┬────┘        └─────┬─────┘
        │                   │
        └─────────┬─────────┘
                  │
             ┌────▼────┐
             │  Merge  │
             └─────────┘
```

## Risks

- **Risk:** Edge routing overlaps when branches are close
  **Mitigation:** Use React Flow's `edgeOptions.pathfinding: true` for auto-routing

- **Risk:** Users confused about execution order
  **Mitigation:** Add numbered badges (1st, 2nd) and documentation tooltip

## Next Phase

Phase 04 implements similar pattern for loop nested blocks.
