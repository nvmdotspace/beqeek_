/**
 * Shared types for workflow editor store slices
 */
import type { Node, Edge } from '@xyflow/react';
import type { WorkflowEvent } from '../../api/types';
import type { NodeDefinition } from '../../utils/node-types';

// ============================================================================
// Canvas Slice Types
// ============================================================================
export interface CanvasSliceState {
  nodes: Node[];
  edges: Edge[];
  zoom: number;
}

export interface CanvasSliceActions {
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  updateNodeData: (nodeId: string, data: Record<string, unknown>) => void;
  setZoom: (zoom: number) => void;
}

export type CanvasSlice = CanvasSliceState & CanvasSliceActions;

// ============================================================================
// Selection Slice Types
// ============================================================================
export interface SelectionSliceState {
  selectedNodeIds: string[];
}

export interface SelectionSliceActions {
  setSelectedNodeIds: (ids: string[]) => void;
  selectAllNodes: () => void;
  deselectAllNodes: () => void;
}

export type SelectionSlice = SelectionSliceState & SelectionSliceActions;

// ============================================================================
// Clipboard Slice Types
// ============================================================================
export interface ClipboardData {
  nodes: Node[];
  edges: Edge[];
}

export interface ClipboardSliceState {
  clipboard: ClipboardData | null;
}

export interface ClipboardSliceActions {
  copySelectedNodes: () => void;
  pasteNodes: (offset?: { x: number; y: number }) => void;
}

export type ClipboardSlice = ClipboardSliceState & ClipboardSliceActions;

// ============================================================================
// Node Operations Slice Types
// ============================================================================
export interface NodeOperationsSliceActions {
  deleteSelectedNodes: () => void;
  deleteNode: (nodeId: string) => void;
  addNode: (node: Node) => void;
}

export type NodeOperationsSlice = NodeOperationsSliceActions;

// ============================================================================
// Candidate Node Slice Types (Ghost node preview)
// ============================================================================
export interface CandidateNodeSliceState {
  candidateNode: Node | null;
  mousePosition: { pageX: number; pageY: number; elementX: number; elementY: number };
}

export interface CandidateNodeSliceActions {
  setCandidateNode: (node: Node | null) => void;
  setMousePosition: (position: CandidateNodeSliceState['mousePosition']) => void;
  placeCandidateNode: (position: { x: number; y: number }) => void;
  cancelCandidateNode: () => void;
}

export type CandidateNodeSlice = CandidateNodeSliceState & CandidateNodeSliceActions;

// ============================================================================
// YAML Editor Slice Types
// ============================================================================
export interface YamlSliceState {
  yamlContent: string;
  yamlError: string | null;
}

export interface YamlSliceActions {
  setYamlContent: (content: string) => void;
  setYamlError: (error: string | null) => void;
}

export type YamlSlice = YamlSliceState & YamlSliceActions;

// ============================================================================
// Editor Mode Slice Types
// ============================================================================
export type EditorMode = 'visual' | 'yaml';

export interface EditorModeSliceState {
  mode: EditorMode;
}

export interface EditorModeSliceActions {
  setMode: (mode: EditorMode) => void;
}

export type EditorModeSlice = EditorModeSliceState & EditorModeSliceActions;

// ============================================================================
// Panel Slice Types
// ============================================================================
export interface PanelSliceState {
  isPaletteOpen: boolean;
  isConfigDrawerOpen: boolean;
}

export interface PanelSliceActions {
  togglePalette: () => void;
  openConfigDrawer: () => void;
  closeConfigDrawer: () => void;
}

export type PanelSlice = PanelSliceState & PanelSliceActions;

// ============================================================================
// Event Slice Types
// ============================================================================
export interface EventSliceState {
  currentEventId: string | null;
  currentEvent: WorkflowEvent | null;
  isLoading: boolean;
  parseError: string | null;
  isDirty: boolean;
}

export interface EventSliceActions {
  setCurrentEventId: (id: string | null) => void;
  loadEvent: (event: WorkflowEvent) => void;
  setIsDirty: (dirty: boolean) => void;
}

export type EventSlice = EventSliceState & EventSliceActions;

// ============================================================================
// Combined Store Shape
// ============================================================================
export type WorkflowEditorShape = CanvasSlice &
  SelectionSlice &
  ClipboardSlice &
  NodeOperationsSlice &
  CandidateNodeSlice &
  YamlSlice &
  EditorModeSlice &
  PanelSlice &
  EventSlice & {
    reset: () => void;
  };
