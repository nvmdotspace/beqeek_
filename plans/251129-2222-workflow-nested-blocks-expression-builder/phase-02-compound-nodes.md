# Phase 02: React Flow Compound Nodes

**Duration:** 5-8 hours
**Priority:** High (core visual feature)

## Objectives

Create compound nodes for conditions and loops that act as containers for nested child steps, using React Flow's parent-child node pattern.

## Background Research

From [React Flow Sub Flows docs](https://reactflow.dev/learn/layouting/sub-flows):

- Use `parentId` on child nodes to establish parent-child relationship
- Set `extent: 'parent'` to constrain children within parent bounds
- Parent node with `type: 'group'` or custom compound type
- Automatically creates visual grouping

## Tasks

### 2.1 Create Compound Condition Node (2h)

**File:** `apps/web/src/features/workflow-units/components/workflow-builder/nodes/compound-condition-node.tsx` (new)

```typescript
import { memo } from 'react';
import { Handle, Position, NodeResizer } from '@xyflow/react';
import { GitBranch } from 'lucide-react';
import { cn } from '@workspace/ui/lib/utils';

interface CompoundConditionNodeProps {
  id: string;
  data: {
    label: string;
    condition: string;
    hasThenBranch: boolean;
    hasElseBranch: boolean;
  };
  selected?: boolean;
}

export const CompoundConditionNode = memo(({ id, data, selected }: CompoundConditionNodeProps) => {
  return (
    <div className="relative">
      {/* Node resizer - allows manual sizing */}
      <NodeResizer
        minWidth={300}
        minHeight={200}
        isVisible={selected}
      />

      {/* Container with visual branch indicators */}
      <div
        className={cn(
          'min-w-[300px] min-h-[200px] rounded-lg border-2 border-dashed',
          'bg-accent-teal-subtle/30 backdrop-blur-sm',
          selected ? 'border-accent-teal' : 'border-border'
        )}
      >
        {/* Header */}
        <div className="flex items-center gap-2 p-3 bg-accent-teal-subtle border-b border-border">
          <GitBranch className="size-4 text-accent-teal" />
          <span className="font-semibold text-sm">{data.label}</span>
        </div>

        {/* Condition preview */}
        <div className="p-2 text-xs font-mono text-muted-foreground border-b border-border">
          {data.condition || 'No condition set'}
        </div>

        {/* Branch labels (children will be positioned here by React Flow) */}
        <div className="grid grid-cols-2 gap-2 p-2 text-xs text-muted-foreground">
          {data.hasThenBranch && (
            <div className="text-center py-1 bg-accent-green-subtle rounded">
              ✓ Then
            </div>
          )}
          {data.hasElseBranch && (
            <div className="text-center py-1 bg-accent-red-subtle rounded">
              ✗ Else
            </div>
          )}
        </div>

        {/* Empty state */}
        {!data.hasThenBranch && !data.hasElseBranch && (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No branches configured
          </div>
        )}
      </div>

      {/* Connection handles */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-accent-teal"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-accent-teal"
      />
    </div>
  );
});

CompoundConditionNode.displayName = 'CompoundConditionNode';
```

**Design Notes:**

- Dashed border to distinguish from regular nodes
- Semi-transparent background so children are visible
- Resizable to accommodate different branch sizes
- Branch labels in header (then=green, else=red)

### 2.2 Create Compound Loop Node (1.5h)

**File:** `apps/web/src/features/workflow-units/components/workflow-builder/nodes/compound-loop-node.tsx` (new)

```typescript
import { memo } from 'react';
import { Handle, Position, NodeResizer } from '@xyflow/react';
import { Repeat } from 'lucide-react';
import { cn } from '@workspace/ui/lib/utils';

interface CompoundLoopNodeProps {
  id: string;
  data: {
    label: string;
    itemVar: string;
    collection: string;
    childCount: number;
  };
  selected?: boolean;
}

export const CompoundLoopNode = memo(({ id, data, selected }: CompoundLoopNodeProps) => {
  return (
    <div className="relative">
      <NodeResizer minWidth={280} minHeight={180} isVisible={selected} />

      <div
        className={cn(
          'min-w-[280px] min-h-[180px] rounded-lg border-2 border-dashed',
          'bg-accent-purple-subtle/30 backdrop-blur-sm',
          selected ? 'border-accent-purple' : 'border-border'
        )}
      >
        {/* Header */}
        <div className="flex items-center gap-2 p-3 bg-accent-purple-subtle border-b border-border">
          <Repeat className="size-4 text-accent-purple" />
          <span className="font-semibold text-sm">{data.label}</span>
        </div>

        {/* Loop config */}
        <div className="p-2 text-xs font-mono text-muted-foreground border-b border-border">
          forEach <span className="text-foreground">{data.itemVar}</span> in{' '}
          <span className="text-foreground">{data.collection}</span>
        </div>

        {/* Child count indicator */}
        <div className="p-2 text-xs text-muted-foreground">
          {data.childCount > 0 ? (
            <span>{data.childCount} step(s) inside loop</span>
          ) : (
            <span className="text-destructive">No steps configured</span>
          )}
        </div>

        {/* Nested blocks area (children positioned here) */}
        <div className="min-h-[60px]" />
      </div>

      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-accent-purple" />
      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-accent-purple" />
    </div>
  );
});

CompoundLoopNode.displayName = 'CompoundLoopNode';
```

### 2.3 Update Node Type Registry (0.5h)

**File:** `apps/web/src/features/workflow-units/components/workflow-builder/nodes/index.tsx`

```typescript
import { CompoundConditionNode } from './compound-condition-node';
import { CompoundLoopNode } from './compound-loop-node';

export const NODE_TYPES = {
  // ... existing nodes
  condition: ConditionNode, // Keep for simple mode
  loop: LoopNode, // Keep for simple mode

  // NEW: Compound nodes for nested blocks
  compound_condition: CompoundConditionNode,
  compound_loop: CompoundLoopNode,
};
```

### 2.4 Modify IR to React Flow Converter (2h)

**File:** `apps/web/src/features/workflow-units/utils/ir-to-reactflow.ts`

**Add function to detect nested structure:**

```typescript
function hasNestedStructure(step: StepIR): boolean {
  return !!(step.branches || step.nested_blocks);
}
```

**Extend conversion logic:**

```typescript
export function irToReactFlow(ir: WorkflowIR): ReactFlowConversionResult {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  ir.steps.forEach((step, index) => {
    if (hasNestedStructure(step)) {
      // Create compound parent node
      const parentNode = {
        id: step.id,
        type: step.type === 'condition' ? 'compound_condition' : 'compound_loop',
        position: step.position || calculateVerticalPosition(index, ir.steps.length),
        data: {
          label: step.name,
          condition: step.config.condition,
          hasThenBranch: !!step.branches?.then?.length,
          hasElseBranch: !!step.branches?.else?.length,
          itemVar: step.config.itemVariable,
          collection: step.config.items,
          childCount:
            (step.nested_blocks?.length || 0) + (step.branches?.then?.length || 0) + (step.branches?.else?.length || 0),
        },
        // Compound node style
        style: {
          width: 300,
          height: 200,
        },
      };
      nodes.push(parentNode);

      // Create child nodes for branches
      if (step.branches?.then) {
        step.branches.then.forEach((thenStep, thenIndex) => {
          const childNode = createChildNode(thenStep, step.id, 'then', thenIndex, step.branches!.then!.length);
          nodes.push(childNode);

          // Edge from parent to first then child
          if (thenIndex === 0) {
            edges.push({
              id: `${step.id}-then-${thenStep.id}`,
              source: step.id,
              target: childNode.id,
              type: 'branch',
              label: 'then',
              style: { stroke: 'var(--accent-green)' },
            });
          }
        });
      }

      if (step.branches?.else) {
        step.branches.else.forEach((elseStep, elseIndex) => {
          const childNode = createChildNode(elseStep, step.id, 'else', elseIndex, step.branches!.else!.length);
          nodes.push(childNode);

          // Edge from parent to first else child
          if (elseIndex === 0) {
            edges.push({
              id: `${step.id}-else-${elseStep.id}`,
              source: step.id,
              target: childNode.id,
              type: 'branch',
              label: 'else',
              style: { stroke: 'var(--accent-red)' },
            });
          }
        });
      }

      // Similar logic for nested_blocks (loop children)
    } else {
      // Regular node (existing logic)
      nodes.push({
        id: step.id,
        type: step.type,
        position: step.position || calculateVerticalPosition(index, ir.steps.length),
        data: { label: step.name, config: step.config },
      });
    }
  });

  return { nodes, edges, trigger: ir.trigger };
}

function createChildNode(
  step: StepIR,
  parentId: string,
  branch: 'then' | 'else' | 'loop',
  index: number,
  totalSiblings: number,
): Node {
  return {
    id: `${parentId}_${branch}_${step.id}`,
    type: step.type,
    position: calculateChildPosition(branch, index, totalSiblings),
    data: {
      label: step.name,
      config: step.config,
    },
    // Key: Establish parent-child relationship
    parentId: parentId,
    extent: 'parent', // Constrain child within parent bounds
    draggable: true, // Allow repositioning within parent
  };
}

function calculateChildPosition(
  branch: 'then' | 'else' | 'loop',
  index: number,
  totalSiblings: number,
): { x: number; y: number } {
  const CHILD_VERTICAL_SPACING = 80;
  const HEADER_HEIGHT = 80; // Space for parent header

  if (branch === 'then') {
    return {
      x: 20, // Left side
      y: HEADER_HEIGHT + index * CHILD_VERTICAL_SPACING,
    };
  } else if (branch === 'else') {
    return {
      x: 160, // Right side
      y: HEADER_HEIGHT + index * CHILD_VERTICAL_SPACING,
    };
  } else {
    // loop
    return {
      x: 20,
      y: HEADER_HEIGHT + index * CHILD_VERTICAL_SPACING,
    };
  }
}
```

### 2.5 Add Custom Branch Edge Type (1h)

**File:** `apps/web/src/features/workflow-units/components/workflow-builder/edges/branch-edge.tsx` (new)

```typescript
import { memo } from 'react';
import { BaseEdge, EdgeLabelRenderer, EdgeProps, getBezierPath } from '@xyflow/react';

export const BranchEdge = memo(({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  label,
  style,
}: EdgeProps) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  return (
    <>
      <BaseEdge id={id} path={edgePath} style={style} />
      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="px-2 py-0.5 text-xs font-medium bg-background border border-border rounded-full"
          >
            {label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
});

BranchEdge.displayName = 'BranchEdge';
```

**Register edge type:**

```typescript
// edges/index.tsx
import { BranchEdge } from './branch-edge';

export const EDGE_TYPES = {
  default: DefaultEdge,
  callback: CallbackEdge,
  branch: BranchEdge, // NEW
};
```

### 2.6 Testing (1h)

**File:** `apps/web/src/features/workflow-units/__tests__/compound-nodes.test.tsx` (new)

Tests:

1. Compound condition node renders with then/else branches
2. Child nodes have correct `parentId`
3. Child nodes use `extent: 'parent'`
4. Branch edges have correct labels and colors
5. Loop node renders with nested children
6. Parent node resizes to fit children
7. Drag child within parent updates position

## Validation Checklist

- [ ] Compound condition node component created
- [ ] Compound loop node component created
- [ ] Nodes registered in NODE_TYPES
- [ ] IR converter creates parent-child relationships
- [ ] Child nodes have `parentId` and `extent: 'parent'`
- [ ] Branch edge type with labels created
- [ ] Children positioned within parent bounds
- [ ] Manual testing: drag children, resize parent works

## Dependencies

- Phase 01 (IR schema with nested structure)

## Risks

- **Risk:** Parent node not resizing to fit all children
  **Mitigation:** Use `NodeResizer` component, set `minHeight` based on child count

- **Risk:** Children not visible inside semi-transparent parent
  **Mitigation:** Use `backdrop-blur-sm` and test contrast ratios

## Next Phase

Phase 03 adds visual then/else branch splitting with proper edge routing.
