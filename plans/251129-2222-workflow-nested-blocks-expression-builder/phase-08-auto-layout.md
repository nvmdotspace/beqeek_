# Phase 08: Auto-Layout for Branches

**Duration:** 4-6 hours
**Priority:** Medium (UX polish)

## Objectives

Implement intelligent auto-layout algorithm that positions compound nodes and their children without overlaps, using Dagre for main flow and custom logic for branches.

## Research Reference

Dagre is the industry-standard hierarchical graph layout library used by React Flow, n8n, and other workflow tools.

## Tasks

### 8.1 Install Dagre (0.5h)

```bash
pnpm add dagre @types/dagre
```

**File:** `apps/web/package.json`

```json
{
  "dependencies": {
    "dagre": "^0.8.5"
  },
  "devDependencies": {
    "@types/dagre": "^0.7.52"
  }
}
```

### 8.2 Create Base Dagre Layout Utility (1.5h)

**File:** `apps/web/src/features/workflow-units/utils/dagre-layout.ts` (new)

```typescript
import dagre from 'dagre';
import { Node, Edge } from '@xyflow/react';

export interface LayoutOptions {
  direction?: 'TB' | 'LR'; // Top-Bottom or Left-Right
  nodeSpacing?: number;
  rankSpacing?: number;
  edgeSpacing?: number;
}

const DEFAULT_OPTIONS: LayoutOptions = {
  direction: 'TB',
  nodeSpacing: 50,
  rankSpacing: 100,
  edgeSpacing: 10,
};

/**
 * Apply Dagre layout to nodes and edges
 *
 * Only applies to top-level nodes (nodes without parentId).
 * Child nodes (branches, loops) are positioned manually.
 */
export function applyDagreLayout(nodes: Node[], edges: Edge[], options: LayoutOptions = {}): Node[] {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Create Dagre graph
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({
    rankdir: opts.direction,
    nodesep: opts.nodeSpacing,
    ranksep: opts.rankSpacing,
    edgesep: opts.edgeSpacing,
    marginx: 50,
    marginy: 50,
  });

  // Filter to top-level nodes only
  const topLevelNodes = nodes.filter((n) => !n.parentId);
  const topLevelNodeIds = new Set(topLevelNodes.map((n) => n.id));

  // Add nodes to graph
  topLevelNodes.forEach((node) => {
    g.setNode(node.id, {
      width: node.width || 200,
      height: node.height || 100,
    });
  });

  // Add edges between top-level nodes only
  edges.forEach((edge) => {
    if (
      topLevelNodeIds.has(edge.source) &&
      topLevelNodeIds.has(edge.target) &&
      edge.type !== 'loop' // Skip loop-back edges
    ) {
      g.setEdge(edge.source, edge.target);
    }
  });

  // Run Dagre layout
  dagre.layout(g);

  // Apply positions to nodes
  const layoutedNodes = nodes.map((node) => {
    // Only update top-level nodes
    if (node.parentId) return node;

    const nodeWithPosition = g.node(node.id);
    if (!nodeWithPosition) return node;

    return {
      ...node,
      position: {
        x: nodeWithPosition.x - (node.width || 200) / 2,
        y: nodeWithPosition.y - (node.height || 100) / 2,
      },
    };
  });

  return layoutedNodes;
}
```

### 8.3 Create Branch Layout Algorithm (2h)

**File:** `apps/web/src/features/workflow-units/utils/branch-layout.ts` (new)

```typescript
import { Node } from '@xyflow/react';

export interface BranchLayoutConfig {
  parentWidth: number;
  parentHeight: number;
  headerHeight: number;
  childSpacing: number;
  branchGap: number;
}

const DEFAULT_CONFIG: BranchLayoutConfig = {
  parentWidth: 300,
  parentHeight: 200,
  headerHeight: 100,
  childSpacing: 80,
  branchGap: 20,
};

/**
 * Calculate positions for branch children (then/else)
 *
 * Layout pattern:
 * ┌────────────────────┐
 * │  Parent Header     │
 * ├──────────┬─────────┤
 * │ Then     │  Else   │
 * │ - Child1 │ - Child1│
 * │ - Child2 │ - Child2│
 * └──────────┴─────────┘
 */
export function layoutBranchChildren(
  parentNode: Node,
  thenChildren: Node[],
  elseChildren: Node[],
  config: Partial<BranchLayoutConfig> = {},
): { nodes: Node[]; parentSize: { width: number; height: number } } {
  const cfg = { ...DEFAULT_CONFIG, ...config };

  // Calculate required height
  const maxChildCount = Math.max(thenChildren.length, elseChildren.length);
  const requiredHeight = Math.max(cfg.parentHeight, cfg.headerHeight + maxChildCount * cfg.childSpacing + 40);

  // Calculate branch widths (half of parent width each)
  const branchWidth = (cfg.parentWidth - cfg.branchGap) / 2;

  // Position THEN children (left side)
  const positionedThenChildren = thenChildren.map((child, index) => ({
    ...child,
    position: {
      x: 20, // Left padding
      y: cfg.headerHeight + index * cfg.childSpacing,
    },
    parentId: parentNode.id,
    extent: 'parent' as const,
  }));

  // Position ELSE children (right side)
  const positionedElseChildren = elseChildren.map((child, index) => ({
    ...child,
    position: {
      x: branchWidth + cfg.branchGap, // Right side
      y: cfg.headerHeight + index * cfg.childSpacing,
    },
    parentId: parentNode.id,
    extent: 'parent' as const,
  }));

  return {
    nodes: [...positionedThenChildren, ...positionedElseChildren],
    parentSize: {
      width: cfg.parentWidth,
      height: requiredHeight,
    },
  };
}

/**
 * Calculate positions for loop children (vertical stack)
 */
export function layoutLoopChildren(
  parentNode: Node,
  children: Node[],
  config: Partial<BranchLayoutConfig> = {},
): { nodes: Node[]; parentSize: { width: number; height: number } } {
  const cfg = { ...DEFAULT_CONFIG, ...config };

  const requiredHeight = Math.max(cfg.parentHeight, cfg.headerHeight + children.length * cfg.childSpacing + 40);

  const positionedChildren = children.map((child, index) => ({
    ...child,
    position: {
      x: 30, // Left indent
      y: cfg.headerHeight + index * cfg.childSpacing,
    },
    parentId: parentNode.id,
    extent: 'parent' as const,
  }));

  return {
    nodes: positionedChildren,
    parentSize: {
      width: 280, // Fixed width for loop nodes
      height: requiredHeight,
    },
  };
}

/**
 * Apply layout to all compound nodes and their children
 */
export function applyCompoundLayout(nodes: Node[]): Node[] {
  const updatedNodes: Node[] = [];

  nodes.forEach((node) => {
    if (node.type === 'compound_condition') {
      const children = nodes.filter((n) => n.parentId === node.id);
      const thenChildren = children.filter((n) => n.id.includes('_then_'));
      const elseChildren = children.filter((n) => n.id.includes('_else_'));

      const { nodes: layoutedChildren, parentSize } = layoutBranchChildren(node, thenChildren, elseChildren);

      // Update parent size
      updatedNodes.push({
        ...node,
        style: {
          ...node.style,
          width: parentSize.width,
          height: parentSize.height,
        },
      });

      // Add layouted children
      updatedNodes.push(...layoutedChildren);
    } else if (node.type === 'compound_loop') {
      const children = nodes.filter((n) => n.parentId === node.id);

      const { nodes: layoutedChildren, parentSize } = layoutLoopChildren(node, children);

      // Update parent size
      updatedNodes.push({
        ...node,
        style: {
          ...node.style,
          width: parentSize.width,
          height: parentSize.height,
        },
      });

      // Add layouted children
      updatedNodes.push(...layoutedChildren);
    } else if (!node.parentId) {
      // Keep top-level nodes as-is (will be positioned by Dagre)
      updatedNodes.push(node);
    }
    // Skip child nodes (handled above)
  });

  return updatedNodes;
}
```

### 8.4 Create Combined Layout Function (1h)

**File:** `apps/web/src/features/workflow-units/utils/auto-layout.ts`

Update to use Dagre + compound layout:

```typescript
import { Node, Edge } from '@xyflow/react';
import { applyDagreLayout } from './dagre-layout';
import { applyCompoundLayout } from './branch-layout';

/**
 * Apply complete auto-layout to workflow
 *
 * Steps:
 * 1. Layout compound node children (branches, loops)
 * 2. Apply Dagre layout to top-level nodes
 * 3. Adjust positions to prevent overlaps
 */
export function autoLayout(nodes: Node[], edges: Edge[]): Node[] {
  // Step 1: Position children within compound nodes
  let layoutedNodes = applyCompoundLayout(nodes);

  // Step 2: Apply Dagre to top-level nodes
  layoutedNodes = applyDagreLayout(layoutedNodes, edges, {
    direction: 'TB',
    nodeSpacing: 60,
    rankSpacing: 120,
  });

  // Step 3: Prevent overlaps (additional spacing if needed)
  layoutedNodes = preventOverlaps(layoutedNodes);

  return layoutedNodes;
}

/**
 * Detect and fix node overlaps
 */
function preventOverlaps(nodes: Node[]): Node[] {
  // Simple collision detection
  const topLevelNodes = nodes.filter((n) => !n.parentId);

  topLevelNodes.forEach((node, index) => {
    for (let i = index + 1; i < topLevelNodes.length; i++) {
      const otherNode = topLevelNodes[i];
      if (otherNode && nodesOverlap(node, otherNode)) {
        // Push down the later node
        otherNode.position.y += 100;
      }
    }
  });

  return nodes;
}

function nodesOverlap(a: Node, b: Node): boolean {
  const aWidth = a.width || 200;
  const aHeight = a.height || 100;
  const bWidth = b.width || 200;
  const bHeight = b.height || 100;

  return !(
    a.position.x + aWidth < b.position.x ||
    b.position.x + bWidth < a.position.x ||
    a.position.y + aHeight < b.position.y ||
    b.position.y + bHeight < a.position.y
  );
}
```

### 8.5 Add Auto-Layout Button to Canvas (0.5h)

**File:** `apps/web/src/features/workflow-units/components/workflow-builder/canvas-header.tsx`

```typescript
import { LayoutGrid } from 'lucide-react';
import { autoLayout } from '../../utils/auto-layout';

export function CanvasHeader() {
  const { nodes, edges, setNodes } = useWorkflowEditorStore();

  const handleAutoLayout = () => {
    const layoutedNodes = autoLayout(nodes, edges);
    setNodes(layoutedNodes);
  };

  return (
    <div className="flex items-center gap-2">
      {/* ... existing buttons ... */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleAutoLayout}
        title="Auto-arrange nodes"
      >
        <LayoutGrid className="size-4 mr-2" />
        Auto Layout
      </Button>
    </div>
  );
}
```

### 8.6 Auto-Layout on Import (0.5h)

Automatically apply layout when loading legacy workflows:

**File:** `apps/web/src/features/workflow-units/utils/ir-to-reactflow.ts`

```typescript
import { autoLayout } from './auto-layout';

export function irToReactFlow(ir: WorkflowIR): ReactFlowConversionResult {
  // ... existing conversion logic ...

  let nodes = /* ... */;
  const edges = /* ... */;

  // Auto-layout if no positions saved
  const hasPositions = nodes.some(n => n.position && (n.position.x !== 0 || n.position.y !== 0));
  if (!hasPositions) {
    nodes = autoLayout(nodes, edges);
  }

  return { nodes, edges, trigger: ir.trigger };
}
```

### 8.7 Testing (0.5h)

**File:** `apps/web/src/features/workflow-units/__tests__/auto-layout.test.ts`

Tests:

1. Dagre layout positions nodes vertically
2. Branch children positioned left/right correctly
3. Loop children stacked vertically
4. Auto-layout prevents overlaps
5. Parent nodes resize to fit children
6. Manual positions preserved if already set

## Validation Checklist

- [ ] Dagre library installed and configured
- [ ] Base Dagre layout utility created
- [ ] Branch layout algorithm positions then/else correctly
- [ ] Loop layout algorithm stacks children
- [ ] Combined auto-layout function works end-to-end
- [ ] Auto-layout button in canvas header
- [ ] Auto-layout applied on legacy workflow import
- [ ] Manual test: complex nested workflow layouts cleanly

## Visual Result

Before:

```
All nodes at (0,0), overlapping mess
```

After:

```
         [Trigger]
             │
         [Condition]
        ┌────┴────┐
    [Then]      [Else]
      │           │
   [Log OK]   [Log Error]
      │           │
      └─────┬─────┘
          [Merge]
            │
         [Email]
```

## Dependencies

- All previous phases (needs compound nodes)

## Risks

- **Risk:** Dagre layout breaks with cyclic graphs
  **Mitigation:** Filter loop-back edges before passing to Dagre

- **Risk:** Large workflows become too wide/tall
  **Mitigation:** Add zoom-to-fit, minimap navigation

## Next Phase

Phase 09 comprehensive testing and validation.
