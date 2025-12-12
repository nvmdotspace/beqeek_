import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { temporal } from 'zundo';
import { useShallow } from 'zustand/react/shallow';
import { produce } from 'immer';
import { isEqual } from 'lodash-es';
import type { Node, Edge } from '@xyflow/react';
import type { WorkflowEvent } from '../api/types';
import { yamlToReactFlow } from '../utils/yaml-converter';

export type EditorMode = 'visual' | 'yaml';

interface ClipboardData {
  nodes: Node[];
  edges: Edge[];
}

// Mouse position for candidate node tracking
interface MousePosition {
  pageX: number;
  pageY: number;
  elementX: number;
  elementY: number;
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

  // Node data update (for config forms)
  updateNodeData: (nodeId: string, data: Record<string, unknown>) => void;

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
  deleteNode: (nodeId: string) => void;
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

  // Candidate node (ghost node preview during drag from palette)
  candidateNode: Node | null;
  mousePosition: MousePosition;
  setCandidateNode: (node: Node | null) => void;
  setMousePosition: (position: MousePosition) => void;
  placeCandidateNode: (position: { x: number; y: number }) => void;
  cancelCandidateNode: () => void;

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
  candidateNode: null as Node | null,
  mousePosition: { pageX: 0, pageY: 0, elementX: 0, elementY: 0 } as MousePosition,
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

        // Update specific node's data (for config forms) - uses Immer for cleaner syntax
        updateNodeData: (nodeId, data) =>
          set((state) => ({
            nodes: produce(state.nodes, (draft) => {
              const node = draft.find((n) => n.id === nodeId);
              if (node) {
                node.data = { ...node.data, ...data };
              }
            }),
            isDirty: true,
          })),

        setYamlContent: (yamlContent) => set({ yamlContent, isDirty: true }),
        setYamlError: (yamlError) => set({ yamlError }),

        setSelectedNodeIds: (selectedNodeIds) => set({ selectedNodeIds }),

        // Select all nodes - uses Immer for cleaner syntax
        selectAllNodes: () =>
          set((state) => ({
            selectedNodeIds: state.nodes.map((n) => n.id),
            nodes: produce(state.nodes, (draft) => {
              draft.forEach((n) => {
                n.selected = true;
              });
            }),
          })),

        // Deselect all nodes - uses Immer for cleaner syntax
        deselectAllNodes: () =>
          set((state) => ({
            selectedNodeIds: [],
            nodes: produce(state.nodes, (draft) => {
              draft.forEach((n) => {
                n.selected = false;
              });
            }),
          })),

        // Delete selected nodes and their connected edges
        // Note: Start node (id='start-node') cannot be deleted
        deleteSelectedNodes: () =>
          set((state) => {
            // Filter out start node from selection - it cannot be deleted
            const deletableIds = state.selectedNodeIds.filter((id) => id !== 'start-node');
            const selectedSet = new Set(deletableIds);
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

        // Delete a single node by ID
        // Note: Start node (id='start-node') cannot be deleted
        deleteNode: (nodeId: string) =>
          set((state) => {
            // Prevent deletion of start node
            if (nodeId === 'start-node') return state;

            const newNodes = state.nodes.filter((n) => n.id !== nodeId);
            const newEdges = state.edges.filter((e) => e.source !== nodeId && e.target !== nodeId);

            return {
              nodes: newNodes,
              edges: newEdges,
              selectedNodeIds: state.selectedNodeIds.filter((id) => id !== nodeId),
              isConfigDrawerOpen: state.selectedNodeIds.includes(nodeId) ? false : state.isConfigDrawerOpen,
              isDirty: true,
            };
          }),

        // Copy selected nodes to clipboard
        // Note: Start node cannot be copied
        copySelectedNodes: () =>
          set((state) => {
            // Filter out start node from selection - it cannot be copied
            const copyableIds = state.selectedNodeIds.filter((id) => id !== 'start-node');
            const selectedSet = new Set(copyableIds);
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

        // Paste nodes from clipboard - uses Immer for cleaner syntax
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

            // Deselect existing nodes using Immer
            const updatedNodes = produce(state.nodes, (draft) => {
              draft.forEach((n) => {
                n.selected = false;
              });
            });

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

            // Create start node from event trigger type
            const startNode = {
              id: 'start-node',
              type: 'start',
              position: { x: 250, y: 50 },
              data: {
                name: 'start',
                triggerType: event.eventSourceType,
                triggerParams: event.eventSourceParams as unknown as Record<string, unknown>,
                _isStartNode: true,
              },
              deletable: false, // Prevent deletion
              draggable: true,
            };

            // Parse YAML and load into canvas
            // Pass event context to handle legacy PHP/Blockly format
            if (event.yaml && event.yaml !== '{}') {
              const { nodes, edges, wasLegacy } = yamlToReactFlow(event.yaml, {
                eventSourceType: event.eventSourceType,
                eventSourceParams: event.eventSourceParams as unknown as Record<string, unknown>,
              });

              // Log if legacy format was detected
              if (wasLegacy) {
                console.info('[WorkflowEditor] Legacy YAML format detected, converted to new format');
              }

              // Add start node at the beginning
              set({
                nodes: [startNode, ...nodes],
                edges,
                yamlContent: event.yaml,
                isLoading: false,
                isDirty: wasLegacy, // Mark dirty if converted so user can save new format
                parseError: null,
              });
            } else {
              // Empty event - only start node
              set({
                nodes: [startNode],
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

        // Candidate node actions (ghost node preview)
        setCandidateNode: (candidateNode) => set({ candidateNode }),
        setMousePosition: (mousePosition) => set({ mousePosition }),
        placeCandidateNode: (position) =>
          set((state) => {
            if (!state.candidateNode) return state;

            // Create the actual node from candidate
            const newNode: Node = {
              ...state.candidateNode,
              position,
              data: {
                ...state.candidateNode.data,
                _isCandidate: false,
              },
            };

            return {
              nodes: produce(state.nodes, (draft) => {
                draft.push(newNode);
              }),
              candidateNode: null,
              isDirty: true,
            };
          }),
        cancelCandidateNode: () => set({ candidateNode: null }),

        reset: () => set(initialState),
      }),
      {
        // Zundo configuration
        limit: 50, // Keep 50 history steps
        // Use lodash isEqual for better performance than JSON.stringify
        equality: (pastState, currentState) => {
          return isEqual(pastState.nodes, currentState.nodes) && isEqual(pastState.edges, currentState.edges);
        },
      },
    ),
    { name: 'WorkflowEditor' },
  ),
);

// ============================================================================
// Selector Hooks - Optimized for specific use cases
// ============================================================================

/**
 * Select only candidate node state (for ghost preview)
 * Uses useShallow to prevent unnecessary re-renders
 */
export const useCandidateNodeState = () =>
  useWorkflowEditorStore(
    useShallow((state) => ({
      candidateNode: state.candidateNode,
      mousePosition: state.mousePosition,
      setCandidateNode: state.setCandidateNode,
      setMousePosition: state.setMousePosition,
      placeCandidateNode: state.placeCandidateNode,
      cancelCandidateNode: state.cancelCandidateNode,
    })),
  );
