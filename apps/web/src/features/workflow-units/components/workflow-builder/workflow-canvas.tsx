import { useCallback, useMemo, useRef } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Panel,
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  type NodeSelectionChange,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Button } from '@workspace/ui/components/button';
import { Save, Play } from 'lucide-react';
import { NODE_TYPES } from './nodes';
import { useWorkflowEditorStore } from '../../stores/workflow-editor-store';
import { isValidConnection } from '../../utils/connection-validator';

export const WorkflowCanvas = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  const {
    nodes: storeNodes,
    edges: storeEdges,
    setNodes: setStoreNodes,
    setEdges: setStoreEdges,
    setSelectedNodeIds,
  } = useWorkflowEditorStore();

  const [nodes, setNodes, onNodesChange] = useNodesState(storeNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(storeEdges);

  // Sync React Flow state with Zustand store
  const handleNodesChange: OnNodesChange = useCallback(
    (changes) => {
      onNodesChange(changes);
      // Update store after local state changes
      setNodes((nds) => {
        setStoreNodes(nds);
        return nds;
      });

      // Update selected nodes
      const selectedIds = changes
        .filter(
          (change): change is NodeSelectionChange =>
            change.type === 'select' && 'selected' in change && change.selected,
        )
        .map((change) => change.id);
      if (selectedIds.length > 0) {
        setSelectedNodeIds(selectedIds);
      }
    },
    [onNodesChange, setNodes, setStoreNodes, setSelectedNodeIds],
  );

  const handleEdgesChange: OnEdgesChange = useCallback(
    (changes) => {
      onEdgesChange(changes);
      // Update store after local state changes
      setEdges((eds) => {
        setStoreEdges(eds);
        return eds;
      });
    },
    [onEdgesChange, setEdges, setStoreEdges],
  );

  const handleConnect: OnConnect = useCallback(
    (connection: Connection) => {
      // Validate connection before adding (with cycle detection)
      if (!isValidConnection(connection, nodes, edges)) {
        return;
      }

      setEdges((eds) => {
        const updated = addEdge(connection, eds);
        setStoreEdges(updated);
        return updated;
      });
    },
    [nodes, edges, setEdges, setStoreEdges],
  );

  // Handle drop event from node palette
  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      if (!type) return;

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      if (!reactFlowBounds) return;

      // Calculate position relative to React Flow canvas
      const position = {
        x: event.clientX - reactFlowBounds.left - 100, // Center node
        y: event.clientY - reactFlowBounds.top - 50,
      };

      // Create new node with default data
      const newNode = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: { name: `${type}_${Date.now()}` },
      };

      setNodes((nds) => {
        const updated = [...nds, newNode];
        setStoreNodes(updated);
        return updated;
      });
    },
    [setNodes, setStoreNodes],
  );

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const nodeTypes = useMemo(() => NODE_TYPES, []);

  const handleSave = () => {
    // Phase 4: Convert nodes/edges to YAML
    if (import.meta.env.DEV) {
      console.log('Save workflow', { nodes, edges });
    }
  };

  const handleTest = () => {
    // Phase 7: Test execution via API
    if (import.meta.env.DEV) {
      console.log('Test workflow', { nodes, edges });
    }
  };

  return (
    <div ref={reactFlowWrapper} className="h-full w-full" onDrop={onDrop} onDragOver={onDragOver}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={handleConnect}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-right"
        deleteKeyCode="Delete"
        multiSelectionKeyCode="Control"
      >
        <Background gap={16} size={1} />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            // Use CSS custom properties from design tokens
            if (node.type?.startsWith('trigger_')) return 'hsl(217 91% 60%)'; // accent-blue
            if (node.type?.startsWith('log')) return 'hsl(142 76% 36%)'; // accent-green
            return 'hsl(173 80% 40%)'; // accent-teal (logic)
          }}
          maskColor="rgba(0, 0, 0, 0.1)"
        />

        <Panel position="top-right" className="flex gap-2">
          <Button size="sm" variant="outline" onClick={handleSave}>
            <Save className="size-4 mr-2" />
            Save
          </Button>
          <Button size="sm" variant="outline" onClick={handleTest}>
            <Play className="size-4 mr-2" />
            Test
          </Button>
        </Panel>
      </ReactFlow>
    </div>
  );
};
