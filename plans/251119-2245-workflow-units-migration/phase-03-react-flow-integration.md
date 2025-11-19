# Phase 3: React Flow Integration

**Date**: 2025-11-19 22:45
**Duration**: Week 3-4 (10 days)
**Priority**: Critical
**Dependencies**: Phase 2 complete
**Status**: ⚪ Not Started

---

## Context

- **Parent Plan**: [plan.md](./plan.md)
- **Previous Phase**: [Phase 2: Workflow Units CRUD](./phase-02-workflow-units-crud.md)
- **Next Phase**: [Phase 4: YAML Conversion](./phase-04-yaml-conversion.md)
- **Key Research**: React Flow v12 best practices, n8n UX patterns

---

## Overview

Implement visual workflow builder with React Flow. Create 13 custom node types, workflow canvas, node palette, configuration panel. Foundation for YAML conversion in Phase 4.

---

## Key Insights

**React Flow v12 (@xyflow/react)**:

- Custom nodes: React components with data + selected props
- Node dimensions: `node.measured.width/height` for layout libraries
- Built-in components: Background, Controls, MiniMap, Panel
- Connection validation via `isValidConnection` prop
- Performance: Memoize nodes, use viewport culling for 100+ nodes

**Node Design Patterns**:

- Color-coded by category (trigger: blue, action: green, logic: teal)
- Icon + label in header
- Configuration summary in body
- Input/output handles (Position.Top/Bottom)
- Selected state with ring-2 ring-primary

**n8n UX Learnings** (Vue.js implementation):

- Node-based graph with clear visual hierarchy
- Configuration panel on right
- Node palette on left or top
- Execution flow indicated by arrow direction
- Error states shown on nodes

---

## Requirements

### Functional Requirements

**13 Custom Node Types**:

**Triggers (4)**:

1. trigger_schedule - Cron expression
2. trigger_webhook - Webhook URL display
3. trigger_form - Form selector
4. trigger_table - Table + action selector

**Actions (7)**: 5. table_operation - CRUD on Active Tables 6. smtp_email - Send email 7. google_sheet - Spreadsheet operations 8. api_call - HTTP requests 9. user_operation - User CRUD 10. delay - Wait/pause 11. log - Debug logging

**Logic (6)**: 12. condition - If/then/else 13. match - Switch/case 14. loop - ForEach iteration 15. math - Calculations 16. definition - Variable declarations 17. log - Debug output (duplicate for organization)

**Canvas Features**:

- Drag nodes from palette
- Connect nodes (source → target)
- Select/multi-select nodes
- Delete nodes (keyboard + button)
- Pan and zoom canvas
- Mini-map for navigation
- Fit view button
- Background grid

**Node Configuration Panel**:

- Shows selected node config
- Form fields for node inputs
- Save button updates node data
- Validation for required fields

### Technical Requirements

1. **Node Component Structure**:
   - Props: `data` (node config), `selected` (boolean)
   - Handles: Input (top), Output (bottom)
   - Memoized with React.memo()
   - TypeScript interfaces for data

2. **State Management**:
   - Zustand store: nodes, edges, selected
   - React Flow hooks: useNodesState, useEdgesState
   - Sync store ↔ React Flow state

3. **Performance**:
   - Virtual rendering for 100+ nodes
   - Debounced auto-save (2 seconds)
   - Lazy load node components

---

## Architecture

**Component Hierarchy**:

```
WorkflowEventEditor
├── WorkflowCanvas (React Flow)
│   ├── Background
│   ├── Controls (zoom, fit view)
│   ├── MiniMap
│   ├── Panel (top-right: save, test, deploy)
│   └── Custom Nodes (13 types)
├── NodePalette (left sidebar)
│   └── NodePaletteItem (drag source)
└── NodeConfigPanel (right sidebar)
    └── NodeConfigForm (react-hook-form)
```

**Data Flow**:

```
User Drag Node → onDrop → Add to nodes array
                            ↓
                     Zustand store update
                            ↓
                     React Flow re-render
                            ↓
                     Node component with data
```

---

## Implementation Steps

### Step 1: Define Node Type Interfaces (1 hour)

```typescript
// utils/node-types.ts
export type NodeType =
  | 'trigger_schedule'
  | 'trigger_webhook'
  | 'trigger_form'
  | 'trigger_table'
  | 'table_operation'
  | 'smtp_email'
  | 'google_sheet'
  | 'api_call'
  | 'user_operation'
  | 'delay'
  | 'condition'
  | 'match'
  | 'loop'
  | 'math'
  | 'definition'
  | 'log';

export interface BaseNodeData {
  name: string;
  label?: string;
}

export interface TriggerScheduleData extends BaseNodeData {
  expression: string; // Cron
}

export interface TableOperationData extends BaseNodeData {
  connector: string;
  action: 'get_list' | 'get_one' | 'create' | 'update' | 'delete';
  config?: Record<string, unknown>;
}

// ... Define data interfaces for all 13 types
```

### Step 2: Implement Custom Node Components (8 hours)

**Example: TriggerScheduleNode**

```typescript
// components/workflow-builder/nodes/trigger-schedule-node.tsx
import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Clock } from 'lucide-react';
import { Box, Stack, Inline } from '@workspace/ui/components/primitives';
import { Text } from '@workspace/ui/components/typography';
import { cn } from '@workspace/ui/lib/utils';
import type { TriggerScheduleData } from '../../../utils/node-types';

export const TriggerScheduleNode = memo(({ data, selected }: NodeProps<TriggerScheduleData>) => {
  return (
    <Box
      padding="space-200"
      backgroundColor="card"
      borderRadius="md"
      border="default"
      className={cn(
        'min-w-[200px] transition-shadow',
        selected && 'ring-2 ring-primary shadow-lg'
      )}
    >
      <Stack space="space-150">
        <Inline space="space-100" align="center">
          <Clock className="size-4 text-blue-500" />
          <Text size="small" weight="semibold">
            Schedule Trigger
          </Text>
        </Inline>
        <Text size="small" color="muted" className="font-mono">
          {data.expression || '* * * * *'}
        </Text>
      </Stack>

      <Handle type="source" position={Position.Bottom} />
    </Box>
  );
});
TriggerScheduleNode.displayName = 'TriggerScheduleNode';
```

**Repeat for all 13 node types** (6-8 hours)

### Step 3: Create Node Registry (30 min)

```typescript
// components/workflow-builder/nodes/index.ts
import { TriggerScheduleNode } from './trigger-schedule-node';
import { TriggerWebhookNode } from './trigger-webhook-node';
// ... import all 13 nodes

export const NODE_TYPES = {
  trigger_schedule: TriggerScheduleNode,
  trigger_webhook: TriggerWebhookNode,
  trigger_form: TriggerFormNode,
  trigger_table: TriggerTableNode,
  table_operation: TableOperationNode,
  smtp_email: SmtpEmailNode,
  google_sheet: GoogleSheetNode,
  api_call: ApiCallNode,
  user_operation: UserOperationNode,
  delay: DelayNode,
  condition: ConditionNode,
  match: MatchNode,
  loop: LoopNode,
  math: MathNode,
  definition: DefinitionNode,
  log: LogNode,
};
```

### Step 4: Implement Workflow Canvas (3 hours)

```typescript
// components/workflow-builder/workflow-canvas.tsx
import { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Button } from '@workspace/ui/components/button';
import { Save, Play } from 'lucide-react';
import { NODE_TYPES } from './nodes';
import { useWorkflowEditorStore } from '../../stores/workflow-editor-store';

export const WorkflowCanvas = () => {
  const { nodes: storeNodes, edges: storeEdges, updateNodes, updateEdges } = useWorkflowEditorStore();

  const [nodes, setNodes, onNodesChange] = useNodesState(storeNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(storeEdges);

  const onConnect = useCallback(
    (params: Connection) => {
      const newEdges = addEdge(params, edges);
      setEdges(newEdges);
      updateEdges(newEdges);
    },
    [edges, setEdges, updateEdges]
  );

  const nodeTypes = useMemo(() => NODE_TYPES, []);

  const handleSave = () => {
    // Phase 4: Convert nodes to YAML and save
    console.log('Save workflow', nodes, edges);
  };

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-right"
      >
        <Background />
        <Controls />
        <MiniMap />

        <Panel position="top-right" className="flex gap-2">
          <Button size="sm" variant="outline" onClick={handleSave}>
            <Save className="size-4 mr-2" />
            Save
          </Button>
          <Button size="sm">
            <Play className="size-4 mr-2" />
            Test
          </Button>
        </Panel>
      </ReactFlow>
    </div>
  );
};
```

### Step 5: Create Node Palette (2 hours)

```typescript
// components/workflow-builder/node-palette.tsx
import { Box, Stack } from '@workspace/ui/components/primitives';
import { Text } from '@workspace/ui/components/typography';
import { Clock, Webhook, FileText, Database /* ... */ } from 'lucide-react';

interface NodePaletteItemProps {
  type: string;
  label: string;
  icon: React.ReactNode;
  category: 'trigger' | 'action' | 'logic';
}

const NodePaletteItem = ({ type, label, icon }: NodePaletteItemProps) => {
  const onDragStart = (event: React.DragEvent) => {
    event.dataTransfer.setData('application/reactflow', type);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <Box
      padding="space-150"
      backgroundColor="card"
      borderRadius="md"
      border="default"
      className="cursor-move hover:bg-accent transition-colors"
      draggable
      onDragStart={onDragStart}
    >
      <Inline space="space-100" align="center">
        {icon}
        <Text size="small">{label}</Text>
      </Inline>
    </Box>
  );
};

export const NodePalette = () => {
  return (
    <Box padding="space-300" backgroundColor="background" className="h-full overflow-y-auto">
      <Stack space="space-400">
        <Stack space="space-200">
          <Text weight="semibold">Triggers</Text>
          <NodePaletteItem type="trigger_schedule" label="Schedule" icon={<Clock className="size-4" />} category="trigger" />
          <NodePaletteItem type="trigger_webhook" label="Webhook" icon={<Webhook className="size-4" />} category="trigger" />
          {/* ... more triggers */}
        </Stack>

        <Stack space="space-200">
          <Text weight="semibold">Actions</Text>
          {/* ... action nodes */}
        </Stack>

        <Stack space="space-200">
          <Text weight="semibold">Logic</Text>
          {/* ... logic nodes */}
        </Stack>
      </Stack>
    </Box>
  );
};
```

### Step 6: Implement Node Config Panel (3 hours)

```typescript
// components/workflow-builder/node-config-panel.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Box, Stack } from '@workspace/ui/components/primitives';
import { Heading, Text } from '@workspace/ui/components/typography';
import { Label } from '@workspace/ui/components/label';
import { Input } from '@workspace/ui/components/input';
import { Button } from '@workspace/ui/components/button';
import { useWorkflowEditorStore } from '../../stores/workflow-editor-store';

export const NodeConfigPanel = () => {
  const { nodes, selectedNodeIds, updateNodes } = useWorkflowEditorStore();

  const selectedNode = nodes.find((n) => selectedNodeIds.includes(n.id));

  if (!selectedNode) {
    return (
      <Box padding="space-300">
        <Text color="muted">Select a node to configure</Text>
      </Box>
    );
  }

  // Dynamic form based on node type
  return (
    <Box padding="space-300" className="h-full overflow-y-auto">
      <Stack space="space-300">
        <Heading level={3}>Node Configuration</Heading>

        {/* Dynamic form fields based on selectedNode.type */}
        {selectedNode.type === 'trigger_schedule' && (
          <ScheduleConfigForm node={selectedNode} onSave={handleSave} />
        )}
        {/* ... other node type forms */}
      </Stack>
    </Box>
  );
};
```

### Step 7: Integrate into Event Editor Page (2 hours)

```typescript
// pages/workflow-event-editor.tsx
import { Grid, GridItem } from '@workspace/ui/components/primitives';
import { WorkflowCanvas } from '../components/workflow-builder/workflow-canvas';
import { NodePalette } from '../components/workflow-builder/node-palette';
import { NodeConfigPanel } from '../components/workflow-builder/node-config-panel';

export default function WorkflowEventEditorPage() {
  const { eventId } = useParams();

  return (
    <div className="h-screen flex flex-col">
      <Grid columns={12} gap="space-0" className="flex-1">
        {/* Node Palette - Left */}
        <GridItem span={2} className="border-r border-border">
          <NodePalette />
        </GridItem>

        {/* Canvas - Center */}
        <GridItem span={7} className="relative">
          <WorkflowCanvas />
        </GridItem>

        {/* Config Panel - Right */}
        <GridItem span={3} className="border-l border-border">
          <NodeConfigPanel />
        </GridItem>
      </Grid>
    </div>
  );
}
```

### Step 8: Connection Validation (1 hour)

```typescript
// utils/connection-validator.ts
import type { Connection, Node } from '@xyflow/react';

export const isValidConnection = (connection: Connection, nodes: Node[]): boolean => {
  const sourceNode = nodes.find((n) => n.id === connection.source);
  const targetNode = nodes.find((n) => n.id === connection.target);

  if (!sourceNode || !targetNode) return false;

  // Rules:
  // 1. Cannot connect node to itself
  if (connection.source === connection.target) return false;

  // 2. Trigger nodes must be first (no input)
  if (targetNode.type?.startsWith('trigger_')) return false;

  // 3. Only one trigger per workflow
  const triggerCount = nodes.filter((n) => n.type?.startsWith('trigger_')).length;
  if (sourceNode.type?.startsWith('trigger_') && triggerCount > 1) return false;

  return true;
};
```

### Step 9: Manual Testing (2 hours)

- Drag nodes from palette to canvas
- Connect nodes with edges
- Select node and configure in panel
- Delete nodes with Delete key
- Pan and zoom canvas
- Use mini-map for navigation
- Test responsive layout
- Verify 13 node types render correctly

---

## Todo List

- [ ] Define node type interfaces (13 types)
- [ ] Implement 13 custom node components
- [ ] Create node registry (NODE_TYPES)
- [ ] Implement WorkflowCanvas with React Flow
- [ ] Create NodePalette with drag sources
- [ ] Implement NodeConfigPanel with dynamic forms
- [ ] Integrate canvas into event editor page
- [ ] Add connection validation rules
- [ ] Handle drop events for adding nodes
- [ ] Implement node selection logic
- [ ] Add keyboard shortcuts (Delete)
- [ ] Manual testing checklist

---

## Success Criteria

**Testable**:

- ✅ All 13 node types render correctly
- ✅ Can drag nodes from palette to canvas
- ✅ Can connect nodes with edges
- ✅ Can select and configure nodes
- ✅ Can delete nodes
- ✅ Canvas pans and zooms smoothly
- ✅ Mini-map shows full workflow

**Measurable**:

- 13 node components created
- 1 workflow canvas component
- 1 node palette component
- 1 config panel component
- 0 TypeScript errors
- Performance: <500ms render for 100 nodes

---

## Risk Assessment

| Risk                             | Impact | Probability | Mitigation                               |
| -------------------------------- | ------ | ----------- | ---------------------------------------- |
| React Flow learning curve        | Medium | High        | Review official docs, reference examples |
| Node component complexity        | Medium | Medium      | Keep components simple, iterate          |
| Performance with many nodes      | High   | Medium      | Memoization, virtual rendering, testing  |
| Connection validation edge cases | Medium | Medium      | Comprehensive validation rules, testing  |
| State sync issues                | High   | Low         | Single source of truth in Zustand        |

---

## Next Steps

**Dependencies**: Phase 4 needs nodes/edges data structure for YAML conversion

**Blockers**: None

**Handoff**: Once canvas works, Phase 4 converts to/from YAML

---

**Phase 3 Completion**: When all nodes render and canvas interactions work
