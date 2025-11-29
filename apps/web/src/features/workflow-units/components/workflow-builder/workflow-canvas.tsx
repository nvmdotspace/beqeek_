import { useCallback, useMemo, useRef, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Panel,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
  type Connection,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  type NodeSelectionChange,
  type ColorMode,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import './edges/edge-styles.css';
import { Button } from '@workspace/ui/components/button';
import { Save, Play } from 'lucide-react';
import { NODE_TYPES } from './nodes';
import { EDGE_TYPES, DEFAULT_EDGE_OPTIONS } from './edges';
import { useWorkflowEditorStore } from '../../stores/workflow-editor-store';
import { isValidConnection } from '../../utils/connection-validator';
import { useTheme } from '@/providers/theme-provider';
import { useCanvasShortcuts } from '../../hooks/use-canvas-shortcuts';

export const WorkflowCanvas = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();

  const {
    nodes: storeNodes,
    edges: storeEdges,
    setNodes: setStoreNodes,
    setEdges: setStoreEdges,
    setSelectedNodeIds,
  } = useWorkflowEditorStore();

  const [nodes, setNodes, onNodesChange] = useNodesState(storeNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(storeEdges);

  // Initialize canvas keyboard shortcuts (Cmd+A, Cmd+C, Cmd+V, Delete, Escape)
  useCanvasShortcuts();

  // Sync local state with store when store changes (e.g., from paste/delete actions)
  useEffect(() => {
    setNodes(storeNodes);
  }, [storeNodes, setNodes]);

  useEffect(() => {
    setEdges(storeEdges);
  }, [storeEdges, setEdges]);

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
  const edgeTypes = useMemo(() => EDGE_TYPES, []);

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

  // Map resolved theme to React Flow ColorMode
  const colorMode: ColorMode = resolvedTheme === 'dark' ? 'dark' : 'light';

  return (
    <div
      id="workflow-canvas"
      ref={reactFlowWrapper}
      className="h-full w-full"
      onDrop={onDrop}
      onDragOver={onDragOver}
      role="application"
      aria-label="Workflow canvas. Use keyboard shortcuts: Delete to remove selected, Ctrl+A to select all, Ctrl+C to copy, Ctrl+V to paste, Escape to deselect."
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={handleConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={DEFAULT_EDGE_OPTIONS}
        colorMode={colorMode}
        fitView
        attributionPosition="bottom-right"
        deleteKeyCode="Delete"
        multiSelectionKeyCode="Control"
        connectionLineStyle={{ stroke: 'var(--muted-foreground)', strokeWidth: 2 }}
        connectionRadius={30}
      >
        <Background gap={16} size={1} />
        <Controls />
        <MiniMap
          position="bottom-left"
          nodeColor={(node) => {
            // Use CSS custom properties from design tokens
            if (node.type?.startsWith('trigger_')) return 'var(--accent-blue)';
            if (node.type?.startsWith('log')) return 'var(--accent-green)';
            return 'var(--accent-teal)'; // logic nodes
          }}
          maskColor={resolvedTheme === 'dark' ? 'rgba(0, 0, 0, 0.6)' : 'rgba(0, 0, 0, 0.1)'}
          style={{
            backgroundColor: 'var(--background)',
          }}
        />

        <Panel position="top-right" className="flex gap-2" role="toolbar" aria-label="Canvas actions">
          <Button size="sm" variant="outline" onClick={handleSave} aria-label="Save workflow">
            <Save className="size-4 mr-2" aria-hidden="true" />
            Save
          </Button>
          <Button size="sm" variant="outline" onClick={handleTest} aria-label="Test workflow">
            <Play className="size-4 mr-2" aria-hidden="true" />
            Test
          </Button>
        </Panel>
      </ReactFlow>
    </div>
  );
};
