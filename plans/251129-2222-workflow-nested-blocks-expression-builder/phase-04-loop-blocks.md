# Phase 04: Loop Nested Blocks

**Duration:** 3-5 hours
**Priority:** High

## Objectives

Implement visual nesting for loop blocks showing repeated steps contained within loop scope.

## Tasks

### 4.1 Enhance Compound Loop Node Visual Design (1h)

**File:** `apps/web/src/features/workflow-units/components/workflow-builder/nodes/compound-loop-node.tsx`

Add iteration indicator and nested block area:

```typescript
export const CompoundLoopNode = memo(({ id, data, selected }: CompoundLoopNodeProps) => {
  const { childCount, itemVar, collection } = data;

  return (
    <div className="relative">
      <NodeResizer minWidth={280} minHeight={200} isVisible={selected} />

      <div className={cn(
        'min-w-[280px] min-h-[200px] rounded-lg border-2 border-dashed',
        'bg-accent-purple-subtle/30 backdrop-blur-sm',
        selected ? 'border-accent-purple' : 'border-border'
      )}>
        {/* Header with iteration icon */}
        <div className="flex items-center justify-between p-3 bg-accent-purple-subtle border-b border-border">
          <div className="flex items-center gap-2">
            <Repeat className="size-4 text-accent-purple" />
            <span className="font-semibold text-sm">{data.label}</span>
          </div>
          {/* Iteration count badge */}
          <div className="px-2 py-0.5 text-xs bg-accent-purple text-white rounded-full">
            {childCount}× iteration
          </div>
        </div>

        {/* Loop config with visual array representation */}
        <div className="p-2 border-b border-border">
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-muted-foreground">for each</span>
            <span className="px-1.5 py-0.5 bg-accent-blue-subtle text-accent-blue rounded">
              {itemVar}
            </span>
            <span className="text-muted-foreground">in</span>
            <span className="px-1.5 py-0.5 bg-background border border-border rounded">
              {collection}
            </span>
          </div>
        </div>

        {/* Nested blocks container with visual loop indicator */}
        <div className="p-3 relative">
          {/* Left border indicator for loop scope */}
          <div className="absolute left-4 top-3 bottom-3 w-0.5 bg-accent-purple-subtle" />

          {childCount > 0 ? (
            <div className="text-xs text-muted-foreground ml-4">
              {childCount} step{childCount !== 1 ? 's' : ''} will execute for each item
            </div>
          ) : (
            <div className="text-xs text-destructive ml-4">
              No steps inside loop - add nested blocks
            </div>
          )}

          {/* Children will be positioned here by React Flow */}
          <div className="min-h-[80px]" />
        </div>
      </div>

      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-accent-purple" />
      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-accent-purple" />
    </div>
  );
});
```

### 4.2 Nested Block Child Positioning (1.5h)

**File:** `apps/web/src/features/workflow-units/utils/ir-to-reactflow.ts`

Create child nodes for loop `nested_blocks`:

```typescript
// In irToReactFlow function
if (step.type === 'loop' && step.nested_blocks?.length) {
  // Create parent loop node
  const loopNode = {
    id: step.id,
    type: 'compound_loop',
    position: step.position || calculateVerticalPosition(index, ir.steps.length),
    data: {
      label: step.name,
      itemVar: step.config.itemVariable || 'item',
      collection: step.config.items || '[]',
      childCount: step.nested_blocks.length,
    },
    style: {
      width: 280,
      height: Math.max(200, 150 + step.nested_blocks.length * 70), // Dynamic height
    },
  };
  nodes.push(loopNode);

  // Create child nodes for nested blocks
  step.nested_blocks.forEach((nestedStep, nestedIndex) => {
    const childNode = {
      id: `${step.id}_loop_${nestedStep.id}`,
      type: nestedStep.type,
      position: {
        x: 30, // Indented from left edge
        y: 100 + nestedIndex * 70, // Stacked vertically
      },
      data: {
        label: nestedStep.name,
        config: nestedStep.config,
      },
      parentId: step.id,
      extent: 'parent',
      draggable: true,
    };
    nodes.push(childNode);

    // Connect children sequentially
    if (nestedIndex === 0) {
      // First child connects to parent
      edges.push({
        id: `${step.id}-loop-start`,
        source: step.id,
        target: childNode.id,
        type: 'loop',
        style: { stroke: 'var(--accent-purple)', strokeDasharray: '5,5' },
      });
    } else {
      // Subsequent children connect to previous sibling
      const prevChildId = `${step.id}_loop_${step.nested_blocks[nestedIndex - 1].id}`;
      edges.push({
        id: `${prevChildId}-${childNode.id}`,
        source: prevChildId,
        target: childNode.id,
        type: 'default',
      });
    }

    // Last child loops back to parent (visual indicator)
    if (nestedIndex === step.nested_blocks.length - 1) {
      edges.push({
        id: `${childNode.id}-loop-end`,
        source: childNode.id,
        target: step.id,
        type: 'loop',
        animated: true,
        style: { stroke: 'var(--accent-purple)', strokeDasharray: '5,5' },
        label: 'repeat',
      });
    }
  });
}
```

### 4.3 Create Loop Edge Type (1h)

**File:** `apps/web/src/features/workflow-units/components/workflow-builder/edges/loop-edge.tsx` (new)

```typescript
import { memo } from 'react';
import { BaseEdge, EdgeLabelRenderer, EdgeProps, getSmoothStepPath } from '@xyflow/react';
import { Repeat } from 'lucide-react';

export const LoopEdge = memo(({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  label,
  style,
  markerEnd,
}: EdgeProps) => {
  // Use smooth step for loop-back edges
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    borderRadius: 8,
  });

  return (
    <>
      <BaseEdge id={id} path={edgePath} style={style} markerEnd={markerEnd} />
      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-accent-purple-subtle text-accent-purple border border-accent-purple rounded-full"
          >
            <Repeat className="size-3" />
            {label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
});

LoopEdge.displayName = 'LoopEdge';
```

**Register:**

```typescript
// edges/index.tsx
export const EDGE_TYPES = {
  default: DefaultEdge,
  callback: CallbackEdge,
  branch: BranchEdge,
  loop: LoopEdge, // NEW
};
```

### 4.4 Loop Execution Visualization (Optional, 1h)

Add runtime animation showing loop iterations:

**File:** `apps/web/src/features/workflow-units/hooks/use-loop-execution-animation.ts` (new)

```typescript
import { useState, useEffect } from 'react';
import { useWorkflowEditorStore } from '../stores/workflow-editor-store';

export function useLoopExecutionAnimation(loopNodeId: string) {
  const [currentIteration, setCurrentIteration] = useState(0);
  const [isExecuting, setIsExecuting] = useState(false);

  const animateLoop = (totalIterations: number) => {
    setIsExecuting(true);
    let iteration = 0;

    const interval = setInterval(() => {
      iteration++;
      setCurrentIteration(iteration);

      if (iteration >= totalIterations) {
        clearInterval(interval);
        setIsExecuting(false);
        setCurrentIteration(0);
      }
    }, 500); // 500ms per iteration

    return () => clearInterval(interval);
  };

  return { currentIteration, isExecuting, animateLoop };
}
```

Use in compound loop node:

```typescript
const { currentIteration, isExecuting } = useLoopExecutionAnimation(id);

// Show iteration badge during execution
{isExecuting && (
  <div className="absolute -top-2 -right-2 px-2 py-1 bg-accent-purple text-white rounded-full text-xs font-bold animate-pulse">
    Iteration {currentIteration}
  </div>
)}
```

### 4.5 Testing (0.5h)

**File:** `apps/web/src/features/workflow-units/__tests__/loop-nodes.test.tsx` (new)

Tests:

1. Loop node renders with nested children
2. Children have correct `parentId` = loop node ID
3. Children positioned inside loop container
4. Sequential edges connect children
5. Loop-back edge connects last child to parent
6. Parent resizes when children added/removed

## Validation Checklist

- [ ] Compound loop node visual design updated
- [ ] Nested blocks create child nodes with `parentId`
- [ ] Children positioned with left indentation
- [ ] Sequential edges connect children
- [ ] Loop edge type with dashed style created
- [ ] Loop-back edge (last child → parent) shows "repeat"
- [ ] Dynamic parent height based on child count
- [ ] Manual test: drag children, add/remove works

## Visual Design

```
┌─────────────────────────────────┐
│ 🔁 Loop          [3× iteration] │
│ for each item in orders         │
├─────────────────────────────────┤
│ │                               │
│ │  ┌───────────────────┐        │
│ │  │ Process Order     │        │
│ │  └─────────┬─────────┘        │
│ │            │                  │
│ │  ┌─────────▼─────────┐        │
│ │  │ Send Email        │        │
│ │  └─────────┬─────────┘        │
│ │            │                  │
│ │  ┌─────────▼─────────┐        │
│ │  │ Update Status     │        │
│ │  └───────────────────┘        │
│ │         │ (repeat) ↻          │
└─┼─────────┼─────────────────────┘
  │         └─────────────┐
  └───────────────────────┘
```

## Dependencies

- Phase 02 (compound nodes)

## Risks

- **Risk:** Loop-back edge causes cyclic graph issues
  **Mitigation:** Mark loop-back edges with `data.isLoopBack = true`, skip in topological sort

- **Risk:** Many nested children make parent too tall
  **Mitigation:** Virtual scrolling for >10 children, or collapsible sections

## Next Phase

Phase 05 builds expression builder UI to replace text inputs for conditions.
