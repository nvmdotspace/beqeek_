/**
 * Integration tests for useCanvasShortcuts hook
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCanvasShortcuts } from '../hooks/use-canvas-shortcuts';
import { useWorkflowEditorStore } from '../stores/workflow-editor-store';

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
  },
}));

describe('useCanvasShortcuts', () => {
  const mockNodes = [
    { id: 'node_1', type: 'action_a', position: { x: 100, y: 100 }, data: { label: 'A' } },
    { id: 'node_2', type: 'action_b', position: { x: 100, y: 200 }, data: { label: 'B' } },
  ];

  beforeEach(() => {
    // Reset store to initial state
    useWorkflowEditorStore.setState({
      nodes: [],
      edges: [],
      selectedNodeIds: [],
      clipboard: null,
      mode: 'visual',
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('selectAll', () => {
    it('should select all nodes', () => {
      useWorkflowEditorStore.setState({ nodes: mockNodes });

      const { result } = renderHook(() => useCanvasShortcuts());

      act(() => {
        result.current.selectAll();
      });

      const state = useWorkflowEditorStore.getState();
      expect(state.selectedNodeIds).toHaveLength(2);
      expect(state.selectedNodeIds).toContain('node_1');
      expect(state.selectedNodeIds).toContain('node_2');
    });

    it('should not select anything when no nodes exist', () => {
      const { result } = renderHook(() => useCanvasShortcuts());

      act(() => {
        result.current.selectAll();
      });

      const state = useWorkflowEditorStore.getState();
      expect(state.selectedNodeIds).toHaveLength(0);
    });
  });

  describe('copy', () => {
    it('should copy selected nodes to clipboard', () => {
      useWorkflowEditorStore.setState({
        nodes: mockNodes,
        selectedNodeIds: ['node_1'],
      });

      const { result } = renderHook(() => useCanvasShortcuts());

      act(() => {
        result.current.copy();
      });

      const state = useWorkflowEditorStore.getState();
      expect(state.clipboard).not.toBeNull();
      expect(state.clipboard?.nodes).toHaveLength(1);
      expect(state.clipboard?.nodes[0]?.id).toBe('node_1');
    });

    it('should not copy when no nodes selected', () => {
      useWorkflowEditorStore.setState({ nodes: mockNodes });

      const { result } = renderHook(() => useCanvasShortcuts());

      act(() => {
        result.current.copy();
      });

      const state = useWorkflowEditorStore.getState();
      expect(state.clipboard).toBeNull();
    });
  });

  describe('paste', () => {
    it('should paste nodes from clipboard with offset', () => {
      const clipboardNodes = [{ id: 'node_1', type: 'action_a', position: { x: 100, y: 100 }, data: { label: 'A' } }];

      useWorkflowEditorStore.setState({
        nodes: mockNodes,
        clipboard: { nodes: clipboardNodes, edges: [] },
      });

      const { result } = renderHook(() => useCanvasShortcuts());
      const initialNodeCount = useWorkflowEditorStore.getState().nodes.length;

      act(() => {
        result.current.paste();
      });

      const state = useWorkflowEditorStore.getState();
      expect(state.nodes.length).toBe(initialNodeCount + 1);
      // Pasted node should have offset position
      const pastedNode = state.nodes[state.nodes.length - 1];
      expect(pastedNode?.position?.x).toBe(150); // 100 + 50
      expect(pastedNode?.position?.y).toBe(150); // 100 + 50
    });

    it('should not paste when clipboard is empty', () => {
      useWorkflowEditorStore.setState({ nodes: mockNodes });

      const { result } = renderHook(() => useCanvasShortcuts());

      act(() => {
        result.current.paste();
      });

      const state = useWorkflowEditorStore.getState();
      expect(state.nodes).toHaveLength(2);
    });
  });

  describe('deleteSelected', () => {
    it('should delete selected nodes', () => {
      useWorkflowEditorStore.setState({
        nodes: mockNodes,
        selectedNodeIds: ['node_1'],
      });

      const { result } = renderHook(() => useCanvasShortcuts());

      act(() => {
        result.current.deleteSelected();
      });

      const state = useWorkflowEditorStore.getState();
      expect(state.nodes).toHaveLength(1);
      expect(state.nodes[0]?.id).toBe('node_2');
    });

    it('should do nothing when no nodes selected', () => {
      useWorkflowEditorStore.setState({ nodes: mockNodes });

      const { result } = renderHook(() => useCanvasShortcuts());

      act(() => {
        result.current.deleteSelected();
      });

      const state = useWorkflowEditorStore.getState();
      expect(state.nodes).toHaveLength(2);
    });
  });

  describe('deselect', () => {
    it('should clear selection', () => {
      useWorkflowEditorStore.setState({
        nodes: mockNodes,
        selectedNodeIds: ['node_1', 'node_2'],
      });

      const { result } = renderHook(() => useCanvasShortcuts());

      act(() => {
        result.current.deselect();
      });

      const state = useWorkflowEditorStore.getState();
      expect(state.selectedNodeIds).toHaveLength(0);
    });
  });

  describe('state indicators', () => {
    it('should report hasSelection correctly', () => {
      useWorkflowEditorStore.setState({ nodes: mockNodes });

      const { result, rerender } = renderHook(() => useCanvasShortcuts());

      expect(result.current.hasSelection).toBe(false);

      act(() => {
        useWorkflowEditorStore.setState({ selectedNodeIds: ['node_1'] });
      });
      rerender();

      expect(result.current.hasSelection).toBe(true);
    });

    it('should report hasClipboard correctly', () => {
      const { result, rerender } = renderHook(() => useCanvasShortcuts());

      expect(result.current.hasClipboard).toBe(false);

      act(() => {
        useWorkflowEditorStore.setState({
          clipboard: {
            nodes: [{ id: 'node_1', type: 'action_a', position: { x: 0, y: 0 }, data: {} }],
            edges: [],
          },
        });
      });
      rerender();

      expect(result.current.hasClipboard).toBe(true);
    });
  });

  describe('keyboard events', () => {
    it('should not respond when disabled', () => {
      useWorkflowEditorStore.setState({ nodes: mockNodes, mode: 'visual' });

      renderHook(() => useCanvasShortcuts({ enabled: false }));

      // Simulate Cmd+A
      const event = new KeyboardEvent('keydown', { key: 'a', metaKey: true });
      window.dispatchEvent(event);

      const state = useWorkflowEditorStore.getState();
      expect(state.selectedNodeIds).toHaveLength(0);
    });

    it('should not respond in YAML mode', () => {
      useWorkflowEditorStore.setState({ nodes: mockNodes, mode: 'yaml' });

      renderHook(() => useCanvasShortcuts());

      // Simulate Cmd+A
      const event = new KeyboardEvent('keydown', { key: 'a', metaKey: true });
      window.dispatchEvent(event);

      const state = useWorkflowEditorStore.getState();
      expect(state.selectedNodeIds).toHaveLength(0);
    });
  });
});
