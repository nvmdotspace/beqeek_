import { useCallback, useMemo, useRef, useEffect } from 'react';
import { setAutoFreeze } from 'immer';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  type NodeSelectionChange,
  type ColorMode,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import './edges/edge-styles.css';
import { NODE_TYPES } from './nodes';
import { EDGE_TYPES, DEFAULT_EDGE_OPTIONS } from './edges';
import { useWorkflowEditorStore } from '../../stores/workflow-editor-store';
import { isValidConnection } from '../../utils/connection-validator';
import { useThemeStore } from '@/stores/theme-store';
import { useCanvasShortcuts } from '../../hooks/use-canvas-shortcuts';
import { CandidateNode } from './candidate-node';

export const WorkflowCanvas = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const resolvedTheme = useThemeStore((state) => state.resolvedTheme);

  const {
    nodes: storeNodes,
    edges: storeEdges,
    setNodes: setStoreNodes,
    setEdges: setStoreEdges,
    setSelectedNodeIds,
  } = useWorkflowEditorStore();

  const [nodes, setNodes, onNodesChange] = useNodesState(storeNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(storeEdges);

  // Track previous store state to prevent infinite sync loops
  // Using ref comparison instead of RAF which can have race conditions
  const prevStoreNodesRef = useRef(storeNodes);
  const prevStoreEdgesRef = useRef(storeEdges);

  // Initialize canvas keyboard shortcuts (Cmd+A, Cmd+C, Cmd+V, Delete, Escape)
  useCanvasShortcuts();

  // Performance optimization: Disable Immer's auto-freeze for high-frequency canvas updates
  // This prevents the overhead of freezing objects on every drag/resize operation
  // Uses instance counter to handle multiple canvas instances safely
  useEffect(() => {
    // Track how many canvas instances have disabled auto-freeze
    const currentCount =
      (window as unknown as { __immerAutoFreezeDisabledCount?: number }).__immerAutoFreezeDisabledCount ?? 0;
    (window as unknown as { __immerAutoFreezeDisabledCount: number }).__immerAutoFreezeDisabledCount = currentCount + 1;

    if (currentCount === 0) {
      setAutoFreeze(false);
    }

    return () => {
      const count = (window as unknown as { __immerAutoFreezeDisabledCount: number }).__immerAutoFreezeDisabledCount;
      (window as unknown as { __immerAutoFreezeDisabledCount: number }).__immerAutoFreezeDisabledCount = count - 1;

      // Only re-enable when all canvas instances are unmounted
      if (count - 1 === 0) {
        setAutoFreeze(true);
      }
    };
  }, []);

  // Sync local state FROM store when store changes externally (e.g., paste/delete/undo)
  // Only sync if store actually changed (ref comparison)
  useEffect(() => {
    if (storeNodes !== prevStoreNodesRef.current) {
      prevStoreNodesRef.current = storeNodes;
      setNodes(storeNodes);
    }
  }, [storeNodes, setNodes]);

  useEffect(() => {
    if (storeEdges !== prevStoreEdgesRef.current) {
      prevStoreEdgesRef.current = storeEdges;
      setEdges(storeEdges);
    }
  }, [storeEdges, setEdges]);

  // Sync React Flow state with Zustand store
  const handleNodesChange: OnNodesChange = useCallback(
    (changes) => {
      onNodesChange(changes);

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
    [onNodesChange, setSelectedNodeIds],
  );

  // Sync local nodes TO store after local changes (drag, resize, etc.)
  // Skip if nodes came from store (same reference as what we just synced)
  useEffect(() => {
    if (nodes === prevStoreNodesRef.current) return;
    prevStoreNodesRef.current = nodes;
    setStoreNodes(nodes);
  }, [nodes, setStoreNodes]);

  const handleEdgesChange: OnEdgesChange = useCallback(
    (changes) => {
      onEdgesChange(changes);
    },
    [onEdgesChange],
  );

  // Sync local edges TO store after local changes
  // Skip if edges came from store (same reference as what we just synced)
  useEffect(() => {
    if (edges === prevStoreEdgesRef.current) return;
    prevStoreEdgesRef.current = edges;
    setStoreEdges(edges);
  }, [edges, setStoreEdges]);

  const handleConnect: OnConnect = useCallback(
    (connection: Connection) => {
      // Validate connection before adding (with cycle detection)
      if (!isValidConnection(connection, nodes, edges)) {
        return;
      }

      setEdges((eds) => addEdge(connection, eds));
    },
    [nodes, edges, setEdges],
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

      setNodes((nds) => [...nds, newNode]);
    },
    [setNodes],
  );

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const nodeTypes = useMemo(() => NODE_TYPES, []);
  const edgeTypes = useMemo(() => EDGE_TYPES, []);

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

        {/* Candidate node preview - ghost node that follows mouse during palette drag */}
        <CandidateNode />
      </ReactFlow>
    </div>
  );
};
