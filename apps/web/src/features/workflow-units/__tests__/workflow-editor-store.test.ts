/**
 * Integration tests for Workflow Editor Store
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { act } from '@testing-library/react';
import { useWorkflowEditorStore } from '../stores/workflow-editor-store';
import type { Node, Edge } from '@xyflow/react';

describe('workflow-editor-store', () => {
  beforeEach(() => {
    // Reset store to initial state
    useWorkflowEditorStore.setState({
      nodes: [],
      edges: [],
      selectedNodeIds: [],
      clipboard: null,
      mode: 'visual',
      isDirty: false,
      currentEvent: null,
      currentEventId: null,
      yamlContent: '',
      yamlError: null,
      parseError: null,
      isConfigDrawerOpen: false,
    });
  });

  describe('Node Operations', () => {
    it('should add nodes', () => {
      const { setNodes } = useWorkflowEditorStore.getState();
      const newNodes: Node[] = [
        { id: 'node_1', type: 'action_log', position: { x: 100, y: 100 }, data: { label: 'A' } },
        { id: 'node_2', type: 'action_http', position: { x: 100, y: 200 }, data: { label: 'B' } },
      ];

      act(() => {
        setNodes(newNodes);
      });

      expect(useWorkflowEditorStore.getState().nodes).toHaveLength(2);
    });

    it('should update nodes via updateNodes', () => {
      const { setNodes, updateNodes } = useWorkflowEditorStore.getState();

      act(() => {
        setNodes([{ id: 'node_1', type: 'action_log', position: { x: 100, y: 100 }, data: { label: 'A' } }]);
      });

      act(() => {
        updateNodes([{ id: 'node_1', type: 'action_log', position: { x: 200, y: 300 }, data: { label: 'A' } }]);
      });

      const state = useWorkflowEditorStore.getState();
      expect(state.nodes[0]?.position).toEqual({ x: 200, y: 300 });
    });

    it('should replace all nodes via setNodes', () => {
      const { setNodes } = useWorkflowEditorStore.getState();

      act(() => {
        setNodes([
          { id: 'node_1', type: 'action_log', position: { x: 100, y: 100 }, data: { label: 'A' } },
          { id: 'node_2', type: 'action_log', position: { x: 100, y: 200 }, data: { label: 'B' } },
        ]);
      });

      act(() => {
        setNodes([{ id: 'node_3', type: 'action_log', position: { x: 100, y: 300 }, data: { label: 'C' } }]);
      });

      const state = useWorkflowEditorStore.getState();
      expect(state.nodes).toHaveLength(1);
      expect(state.nodes[0]?.id).toBe('node_3');
    });
  });

  describe('Edge Operations', () => {
    it('should add edges', () => {
      const { setEdges } = useWorkflowEditorStore.getState();
      const newEdges: Edge[] = [{ id: 'e1', source: 'node_1', target: 'node_2' }];

      act(() => {
        setEdges(newEdges);
      });

      expect(useWorkflowEditorStore.getState().edges).toHaveLength(1);
    });

    it('should replace all edges via setEdges', () => {
      const { setEdges } = useWorkflowEditorStore.getState();

      act(() => {
        setEdges([
          { id: 'e1', source: 'node_1', target: 'node_2' },
          { id: 'e2', source: 'node_2', target: 'node_3' },
        ]);
      });

      act(() => {
        setEdges([{ id: 'e3', source: 'node_1', target: 'node_3' }]);
      });

      const state = useWorkflowEditorStore.getState();
      expect(state.edges).toHaveLength(1);
      expect(state.edges[0]?.id).toBe('e3');
    });
  });

  describe('Selection Operations', () => {
    it('should set selected node IDs', () => {
      const { setNodes, setSelectedNodeIds } = useWorkflowEditorStore.getState();

      act(() => {
        setNodes([
          { id: 'node_1', type: 'action_log', position: { x: 100, y: 100 }, data: { label: 'A' } },
          { id: 'node_2', type: 'action_log', position: { x: 100, y: 200 }, data: { label: 'B' } },
        ]);
        setSelectedNodeIds(['node_1']);
      });

      expect(useWorkflowEditorStore.getState().selectedNodeIds).toEqual(['node_1']);
    });

    it('should select all nodes', () => {
      const { setNodes, selectAllNodes } = useWorkflowEditorStore.getState();

      act(() => {
        setNodes([
          { id: 'node_1', type: 'action_log', position: { x: 100, y: 100 }, data: { label: 'A' } },
          { id: 'node_2', type: 'action_log', position: { x: 100, y: 200 }, data: { label: 'B' } },
          { id: 'node_3', type: 'action_log', position: { x: 100, y: 300 }, data: { label: 'C' } },
        ]);
      });

      act(() => {
        selectAllNodes();
      });

      expect(useWorkflowEditorStore.getState().selectedNodeIds).toHaveLength(3);
    });

    it('should deselect all nodes', () => {
      const { setSelectedNodeIds, deselectAllNodes } = useWorkflowEditorStore.getState();

      act(() => {
        setSelectedNodeIds(['node_1', 'node_2']);
      });

      act(() => {
        deselectAllNodes();
      });

      expect(useWorkflowEditorStore.getState().selectedNodeIds).toHaveLength(0);
    });
  });

  describe('Clipboard Operations', () => {
    it('should copy selected nodes to clipboard', () => {
      const { setNodes, setSelectedNodeIds, copySelectedNodes } = useWorkflowEditorStore.getState();

      act(() => {
        setNodes([
          { id: 'node_1', type: 'action_log', position: { x: 100, y: 100 }, data: { label: 'A' } },
          { id: 'node_2', type: 'action_log', position: { x: 100, y: 200 }, data: { label: 'B' } },
        ]);
        setSelectedNodeIds(['node_1']);
      });

      act(() => {
        copySelectedNodes();
      });

      const clipboard = useWorkflowEditorStore.getState().clipboard;
      expect(clipboard).not.toBeNull();
      expect(clipboard?.nodes).toHaveLength(1);
      expect(clipboard?.nodes[0]?.id).toBe('node_1');
    });

    it('should paste nodes from clipboard with new IDs', () => {
      const { setNodes, setSelectedNodeIds, copySelectedNodes, pasteNodes } = useWorkflowEditorStore.getState();

      act(() => {
        setNodes([{ id: 'node_1', type: 'action_log', position: { x: 100, y: 100 }, data: { label: 'A' } }]);
        setSelectedNodeIds(['node_1']);
      });

      act(() => {
        copySelectedNodes();
      });

      act(() => {
        pasteNodes({ x: 50, y: 50 });
      });

      const state = useWorkflowEditorStore.getState();
      expect(state.nodes).toHaveLength(2);
      // Pasted node should have new ID
      expect(state.nodes.filter((n) => n.id === 'node_1')).toHaveLength(1);
      // Pasted node should have offset position
      const pastedNode = state.nodes.find((n) => n.id !== 'node_1');
      expect(pastedNode?.position?.x).toBe(150); // 100 + 50
      expect(pastedNode?.position?.y).toBe(150); // 100 + 50
    });
  });

  describe('Delete Operations', () => {
    it('should delete selected nodes', () => {
      const { setNodes, setEdges, setSelectedNodeIds, deleteSelectedNodes } = useWorkflowEditorStore.getState();

      act(() => {
        setNodes([
          { id: 'node_1', type: 'action_log', position: { x: 100, y: 100 }, data: { label: 'A' } },
          { id: 'node_2', type: 'action_log', position: { x: 100, y: 200 }, data: { label: 'B' } },
        ]);
        setEdges([{ id: 'e1', source: 'node_1', target: 'node_2' }]);
        setSelectedNodeIds(['node_1']);
      });

      act(() => {
        deleteSelectedNodes();
      });

      const state = useWorkflowEditorStore.getState();
      expect(state.nodes).toHaveLength(1);
      expect(state.nodes[0]?.id).toBe('node_2');
      // Edge should also be removed (node_1 was source)
      expect(state.edges).toHaveLength(0);
    });

    it('should clear selection after delete', () => {
      const { setNodes, setSelectedNodeIds, deleteSelectedNodes } = useWorkflowEditorStore.getState();

      act(() => {
        setNodes([{ id: 'node_1', type: 'action_log', position: { x: 100, y: 100 }, data: { label: 'A' } }]);
        setSelectedNodeIds(['node_1']);
      });

      act(() => {
        deleteSelectedNodes();
      });

      expect(useWorkflowEditorStore.getState().selectedNodeIds).toHaveLength(0);
    });
  });

  describe('Mode Operations', () => {
    it('should switch between visual and yaml modes', () => {
      const { setMode } = useWorkflowEditorStore.getState();

      expect(useWorkflowEditorStore.getState().mode).toBe('visual');

      act(() => {
        setMode('yaml');
      });

      expect(useWorkflowEditorStore.getState().mode).toBe('yaml');

      act(() => {
        setMode('visual');
      });

      expect(useWorkflowEditorStore.getState().mode).toBe('visual');
    });
  });

  describe('Config Drawer Operations', () => {
    it('should open and close config drawer', () => {
      const { openConfigDrawer, closeConfigDrawer } = useWorkflowEditorStore.getState();

      expect(useWorkflowEditorStore.getState().isConfigDrawerOpen).toBe(false);

      act(() => {
        openConfigDrawer();
      });

      expect(useWorkflowEditorStore.getState().isConfigDrawerOpen).toBe(true);

      act(() => {
        closeConfigDrawer();
      });

      expect(useWorkflowEditorStore.getState().isConfigDrawerOpen).toBe(false);
    });
  });

  describe('Dirty State', () => {
    it('should track dirty state', () => {
      const { setIsDirty } = useWorkflowEditorStore.getState();

      expect(useWorkflowEditorStore.getState().isDirty).toBe(false);

      act(() => {
        setIsDirty(true);
      });

      expect(useWorkflowEditorStore.getState().isDirty).toBe(true);
    });

    it('should set dirty when nodes change', () => {
      const { setNodes } = useWorkflowEditorStore.getState();

      act(() => {
        setNodes([{ id: 'node_1', type: 'action_log', position: { x: 100, y: 100 }, data: { label: 'A' } }]);
      });

      // Nodes changed, should be dirty
      expect(useWorkflowEditorStore.getState().isDirty).toBe(true);
    });
  });
});
