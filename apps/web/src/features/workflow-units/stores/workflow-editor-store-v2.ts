/**
 * Workflow Editor Store v2 - Sliced Architecture
 *
 * Benefits over v1:
 * - Sliced architecture: Each slice manages its own state, reducing re-renders
 * - Immer integration: Clean mutation syntax with structural sharing
 * - lodash isEqual: Faster deep comparison than JSON.stringify
 * - Candidate node support: Ghost node preview during drag
 * - Better DevTools: Named actions for easier debugging
 */
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { temporal } from 'zundo';
import { useShallow } from 'zustand/react/shallow';
import { isEqual } from 'lodash-es';
import type { Node, Edge } from '@xyflow/react';

import {
  type WorkflowEditorShape,
  createCanvasSlice,
  createSelectionSlice,
  createClipboardSlice,
  createNodeOperationsSlice,
  createCandidateNodeSlice,
  createYamlSlice,
  createEditorModeSlice,
  createPanelSlice,
  createEventSlice,
  initialCanvasState,
  initialSelectionState,
  initialClipboardState,
  initialCandidateNodeState,
  initialYamlState,
  initialEditorModeState,
  initialPanelState,
  initialEventState,
} from './slices';

// Combined initial state for reset
const initialState = {
  ...initialCanvasState,
  ...initialSelectionState,
  ...initialClipboardState,
  ...initialCandidateNodeState,
  ...initialYamlState,
  ...initialEditorModeState,
  ...initialPanelState,
  ...initialEventState,
};

/**
 * Main workflow editor store with sliced architecture
 */
export const useWorkflowEditorStore = create<WorkflowEditorShape>()(
  devtools(
    temporal(
      (...args) => ({
        // Combine all slices
        ...createCanvasSlice(...args),
        ...createSelectionSlice(...args),
        ...createClipboardSlice(...args),
        ...createNodeOperationsSlice(...args),
        ...createCandidateNodeSlice(...args),
        ...createYamlSlice(...args),
        ...createEditorModeSlice(...args),
        ...createPanelSlice(...args),
        ...createEventSlice(...args),

        // Reset action
        reset: () => {
          const [set] = args;
          set(initialState, undefined, 'store/reset');
        },
      }),
      {
        // Zundo configuration - Undo/Redo history
        limit: 50,
        // Use lodash isEqual instead of JSON.stringify for better performance
        equality: (pastState, currentState) => {
          return isEqual(pastState.nodes, currentState.nodes) && isEqual(pastState.edges, currentState.edges);
        },
      },
    ),
    { name: 'WorkflowEditorV2' },
  ),
);

// ============================================================================
// Selector Hooks - Subscribe to specific slices for optimized re-renders
// Uses useShallow to prevent infinite loops from object reference changes
// ============================================================================

/**
 * Select only canvas-related state (nodes, edges, zoom)
 * Components using this won't re-render on selection/clipboard changes
 */
export const useCanvasState = () =>
  useWorkflowEditorStore(
    useShallow((state) => ({
      nodes: state.nodes,
      edges: state.edges,
      zoom: state.zoom,
      setNodes: state.setNodes,
      setEdges: state.setEdges,
      updateNodeData: state.updateNodeData,
      setZoom: state.setZoom,
    })),
  );

/**
 * Select only selection state
 */
export const useSelectionState = () =>
  useWorkflowEditorStore(
    useShallow((state) => ({
      selectedNodeIds: state.selectedNodeIds,
      setSelectedNodeIds: state.setSelectedNodeIds,
      selectAllNodes: state.selectAllNodes,
      deselectAllNodes: state.deselectAllNodes,
    })),
  );

/**
 * Select only clipboard state
 */
export const useClipboardState = () =>
  useWorkflowEditorStore(
    useShallow((state) => ({
      clipboard: state.clipboard,
      copySelectedNodes: state.copySelectedNodes,
      pasteNodes: state.pasteNodes,
    })),
  );

/**
 * Select only candidate node state (for ghost preview)
 * Includes mousePosition for convenience; use useMousePosition() if you only need position updates
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

/**
 * Select only mouse position - high frequency updates (60fps during drag)
 * Use this sparingly and only in components that truly need real-time mouse position
 * Most components should use useCandidateNodeState() instead
 */
export const useMousePosition = () => useWorkflowEditorStore((state) => state.mousePosition);

/**
 * Select only panel visibility state
 */
export const usePanelState = () =>
  useWorkflowEditorStore(
    useShallow((state) => ({
      isPaletteOpen: state.isPaletteOpen,
      isConfigDrawerOpen: state.isConfigDrawerOpen,
      togglePalette: state.togglePalette,
      openConfigDrawer: state.openConfigDrawer,
      closeConfigDrawer: state.closeConfigDrawer,
    })),
  );

/**
 * Select only editor mode state
 */
export const useEditorModeState = () =>
  useWorkflowEditorStore(
    useShallow((state) => ({
      mode: state.mode,
      setMode: state.setMode,
    })),
  );

/**
 * Select only event/loading state
 */
export const useEventState = () =>
  useWorkflowEditorStore(
    useShallow((state) => ({
      currentEvent: state.currentEvent,
      currentEventId: state.currentEventId,
      isLoading: state.isLoading,
      parseError: state.parseError,
      isDirty: state.isDirty,
      loadEvent: state.loadEvent,
      setIsDirty: state.setIsDirty,
    })),
  );

/**
 * Select only YAML state
 */
export const useYamlState = () =>
  useWorkflowEditorStore(
    useShallow((state) => ({
      yamlContent: state.yamlContent,
      yamlError: state.yamlError,
      setYamlContent: state.setYamlContent,
      setYamlError: state.setYamlError,
    })),
  );

/**
 * Select node operations
 */
export const useNodeOperations = () =>
  useWorkflowEditorStore(
    useShallow((state) => ({
      addNode: state.addNode,
      deleteNode: state.deleteNode,
      deleteSelectedNodes: state.deleteSelectedNodes,
    })),
  );
