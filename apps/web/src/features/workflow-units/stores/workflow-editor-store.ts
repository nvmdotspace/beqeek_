import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { temporal } from 'zundo';
import type { Node, Edge } from '@xyflow/react';
import type { WorkflowEvent } from '../api/types';
import { yamlToReactFlow } from '../utils/yaml-converter';

export type EditorMode = 'visual' | 'yaml';

interface ClipboardData {
  nodes: Node[];
  edges: Edge[];
}

interface WorkflowEditorState {
  // Editor mode
  mode: EditorMode;
  setMode: (mode: EditorMode) => void;

  // React Flow state
  nodes: Node[];
  edges: Edge[];
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  updateNodes: (nodes: Node[]) => void;
  updateEdges: (edges: Edge[]) => void;

  // YAML editor state
  yamlContent: string;
  yamlError: string | null;
  setYamlContent: (content: string) => void;
  setYamlError: (error: string | null) => void;

  // Selection
  selectedNodeIds: string[];
  setSelectedNodeIds: (ids: string[]) => void;

  // Clipboard (for copy/paste)
  clipboard: ClipboardData | null;

  // Node selection/manipulation actions
  selectAllNodes: () => void;
  deselectAllNodes: () => void;
  deleteSelectedNodes: () => void;
  copySelectedNodes: () => void;
  pasteNodes: (offset?: { x: number; y: number }) => void;

  // Canvas state
  zoom: number;
  setZoom: (zoom: number) => void;

  // Current editing event
  currentEventId: string | null;
  currentEvent: WorkflowEvent | null;
  setCurrentEventId: (id: string | null) => void;

  // Event loading
  isLoading: boolean;
  parseError: string | null;
  loadEvent: (event: WorkflowEvent) => void;

  // Dirty state (manual save for Option A)
  isDirty: boolean;
  setIsDirty: (dirty: boolean) => void;

  // Panel states (n8n-style maximized canvas)
  isPaletteOpen: boolean;
  isConfigDrawerOpen: boolean;
  togglePalette: () => void;
  openConfigDrawer: () => void;
  closeConfigDrawer: () => void;

  // Reset
  reset: () => void;
}

const initialState = {
  mode: 'visual' as EditorMode,
  nodes: [] as Node[],
  edges: [] as Edge[],
  yamlContent: '',
  yamlError: null,
  selectedNodeIds: [] as string[],
  zoom: 1,
  currentEventId: null,
  currentEvent: null,
  isLoading: false,
  parseError: null,
  isDirty: false,
  isPaletteOpen: false,
  isConfigDrawerOpen: false,
  clipboard: null as ClipboardData | null,
};

export const useWorkflowEditorStore = create<WorkflowEditorState>()(
  devtools(
    temporal(
      (set) => ({
        ...initialState,

        setMode: (mode) => set({ mode }),

        setNodes: (nodes) => set({ nodes, isDirty: true }),
        setEdges: (edges) => set({ edges, isDirty: true }),
        updateNodes: (nodes) => set({ nodes, isDirty: true }),
        updateEdges: (edges) => set({ edges, isDirty: true }),

        setYamlContent: (yamlContent) => set({ yamlContent, isDirty: true }),
        setYamlError: (yamlError) => set({ yamlError }),

        setSelectedNodeIds: (selectedNodeIds) => set({ selectedNodeIds }),

        // Select all nodes
        selectAllNodes: () =>
          set((state) => ({
            selectedNodeIds: state.nodes.map((n) => n.id),
            nodes: state.nodes.map((n) => ({ ...n, selected: true })),
          })),

        // Deselect all nodes
        deselectAllNodes: () =>
          set((state) => ({
            selectedNodeIds: [],
            nodes: state.nodes.map((n) => ({ ...n, selected: false })),
          })),

        // Delete selected nodes and their connected edges
        deleteSelectedNodes: () =>
          set((state) => {
            const selectedSet = new Set(state.selectedNodeIds);
            if (selectedSet.size === 0) return state;

            const newNodes = state.nodes.filter((n) => !selectedSet.has(n.id));
            const newEdges = state.edges.filter((e) => !selectedSet.has(e.source) && !selectedSet.has(e.target));

            return {
              nodes: newNodes,
              edges: newEdges,
              selectedNodeIds: [],
              isDirty: true,
            };
          }),

        // Copy selected nodes to clipboard
        copySelectedNodes: () =>
          set((state) => {
            const selectedSet = new Set(state.selectedNodeIds);
            if (selectedSet.size === 0) return state;

            const selectedNodes = state.nodes.filter((n) => selectedSet.has(n.id));
            // Copy edges that connect selected nodes
            const selectedEdges = state.edges.filter((e) => selectedSet.has(e.source) && selectedSet.has(e.target));

            return {
              clipboard: {
                nodes: selectedNodes,
                edges: selectedEdges,
              },
            };
          }),

        // Paste nodes from clipboard
        pasteNodes: (offset = { x: 50, y: 50 }) =>
          set((state) => {
            if (!state.clipboard || state.clipboard.nodes.length === 0) return state;

            const timestamp = Date.now();
            const idMap = new Map<string, string>();

            // Create new nodes with offset positions and new IDs
            const newNodes = state.clipboard.nodes.map((node, index) => {
              const newId = `${node.type}-${timestamp}-${index}`;
              idMap.set(node.id, newId);

              return {
                ...node,
                id: newId,
                position: {
                  x: node.position.x + offset.x,
                  y: node.position.y + offset.y,
                },
                selected: true,
                data: {
                  ...node.data,
                  name: `${node.data?.name || node.type}_copy`,
                },
              };
            });

            // Create new edges with updated node IDs
            const newEdges = state.clipboard.edges.map((edge, index) => ({
              ...edge,
              id: `edge-${timestamp}-${index}`,
              source: idMap.get(edge.source) || edge.source,
              target: idMap.get(edge.target) || edge.target,
            }));

            // Deselect existing nodes, add new ones
            const updatedNodes = state.nodes.map((n) => ({ ...n, selected: false }));

            return {
              nodes: [...updatedNodes, ...newNodes],
              edges: [...state.edges, ...newEdges],
              selectedNodeIds: newNodes.map((n) => n.id),
              isDirty: true,
            };
          }),

        setZoom: (zoom) => set({ zoom }),

        setCurrentEventId: (currentEventId) => set({ currentEventId }),

        loadEvent: (event: WorkflowEvent) => {
          try {
            set({ isLoading: true, parseError: null });

            // Set currentEvent FIRST so error alert can display
            set({
              currentEvent: event,
              currentEventId: event.id,
            });

            // Parse YAML and load into canvas
            if (event.yaml && event.yaml !== '{}') {
              const { nodes, edges } = yamlToReactFlow(event.yaml);
              set({
                nodes,
                edges,
                yamlContent: event.yaml,
                isLoading: false,
                isDirty: false,
                parseError: null,
              });
            } else {
              // Empty event - no workflow steps yet
              set({
                nodes: [],
                edges: [],
                yamlContent: '',
                isLoading: false,
                isDirty: false,
                parseError: null,
              });
            }
          } catch (error) {
            // currentEvent already set, so error alert will display
            set({
              nodes: [],
              edges: [],
              parseError: error instanceof Error ? error.message : 'Failed to parse workflow YAML',
              isLoading: false,
            });
          }
        },

        setIsDirty: (isDirty) => set({ isDirty }),

        // Panel actions (n8n-style maximized canvas)
        togglePalette: () => set((state) => ({ isPaletteOpen: !state.isPaletteOpen })),
        openConfigDrawer: () => set({ isConfigDrawerOpen: true }),
        closeConfigDrawer: () => set({ isConfigDrawerOpen: false }),

        reset: () => set(initialState),
      }),
      {
        // Zundo configuration
        limit: 50, // Keep 50 history steps
        equality: (pastState, currentState) => {
          // Only track changes to nodes and edges
          return (
            JSON.stringify(pastState.nodes) === JSON.stringify(currentState.nodes) &&
            JSON.stringify(pastState.edges) === JSON.stringify(currentState.edges)
          );
        },
      },
    ),
    { name: 'WorkflowEditor' },
  ),
);
