import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { temporal } from 'zundo';
import type { Node, Edge } from '@xyflow/react';
import type { WorkflowEvent } from '../api/types';
import { yamlToReactFlow } from '../utils/yaml-converter';

export type EditorMode = 'visual' | 'yaml';

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

  // Selection
  selectedNodeIds: string[];
  setSelectedNodeIds: (ids: string[]) => void;

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

  // Reset
  reset: () => void;
}

const initialState = {
  mode: 'visual' as EditorMode,
  nodes: [],
  edges: [],
  selectedNodeIds: [],
  zoom: 1,
  currentEventId: null,
  currentEvent: null,
  isLoading: false,
  parseError: null,
  isDirty: false,
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

        setSelectedNodeIds: (selectedNodeIds) => set({ selectedNodeIds }),

        setZoom: (zoom) => set({ zoom }),

        setCurrentEventId: (currentEventId) => set({ currentEventId }),

        loadEvent: (event: WorkflowEvent) => {
          try {
            set({ isLoading: true, parseError: null });

            // Parse YAML and load into canvas
            if (event.yaml && event.yaml !== '{}') {
              const { nodes, edges } = yamlToReactFlow(event.yaml);
              set({
                nodes,
                edges,
                currentEvent: event,
                currentEventId: event.id,
                isLoading: false,
                isDirty: false,
                parseError: null,
              });
            } else {
              // Empty event - no workflow steps yet
              set({
                nodes: [],
                edges: [],
                currentEvent: event,
                currentEventId: event.id,
                isLoading: false,
                isDirty: false,
                parseError: null,
              });
            }
          } catch (error) {
            set({
              parseError: error instanceof Error ? error.message : 'Failed to parse workflow YAML',
              isLoading: false,
            });
          }
        },

        setIsDirty: (isDirty) => set({ isDirty }),

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
