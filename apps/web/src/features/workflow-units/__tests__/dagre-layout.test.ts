/**
 * Unit Tests for Dagre Layout Utility
 *
 * Tests the hierarchical graph layout using Dagre library
 * for positioning top-level workflow nodes.
 */

import { describe, it, expect } from 'vitest';
import type { Node, Edge } from '@xyflow/react';
import { applyDagreLayout, shouldApplyLayout, getLayoutInfo } from '../utils/dagre-layout';

describe('dagre-layout', () => {
  describe('applyDagreLayout', () => {
    const createNode = (id: string, type: string = 'log', parentId?: string): Node => ({
      id,
      type,
      position: { x: 0, y: 0 },
      data: { label: `Node ${id}`, config: {} },
      ...(parentId && { parentId }),
    });

    const createEdge = (source: string, target: string, type: string = 'default'): Edge => ({
      id: `${source}-${target}`,
      source,
      target,
      type,
    });

    it('should position nodes with no edges in vertical layout', () => {
      const nodes: Node[] = [createNode('node1'), createNode('node2'), createNode('node3')];

      const layouted = applyDagreLayout(nodes, [], { direction: 'TB' });

      // All nodes should have positions
      layouted.forEach((node) => {
        expect(node.position).toBeDefined();
        expect(typeof node.position.x).toBe('number');
        expect(typeof node.position.y).toBe('number');
      });
    });

    it('should position connected nodes with proper spacing', () => {
      const nodes: Node[] = [createNode('node1'), createNode('node2'), createNode('node3')];
      const edges: Edge[] = [createEdge('node1', 'node2'), createEdge('node2', 'node3')];

      const layouted = applyDagreLayout(nodes, edges, { direction: 'TB' });

      // In TB layout, each node should be below the previous
      const node1 = layouted.find((n) => n.id === 'node1');
      const node2 = layouted.find((n) => n.id === 'node2');
      const node3 = layouted.find((n) => n.id === 'node3');

      expect(node2?.position.y).toBeGreaterThan(node1?.position.y ?? 0);
      expect(node3?.position.y).toBeGreaterThan(node2?.position.y ?? 0);
    });

    it('should handle left-to-right layout direction', () => {
      const nodes: Node[] = [createNode('node1'), createNode('node2')];
      const edges: Edge[] = [createEdge('node1', 'node2')];

      const layouted = applyDagreLayout(nodes, edges, { direction: 'LR' });

      const node1 = layouted.find((n) => n.id === 'node1');
      const node2 = layouted.find((n) => n.id === 'node2');

      // In LR layout, node2 should be to the right of node1
      expect(node2?.position.x).toBeGreaterThan(node1?.position.x ?? 0);
    });

    it('should skip child nodes (nodes with parentId)', () => {
      const nodes: Node[] = [
        createNode('parent'),
        createNode('child1', 'log', 'parent'),
        createNode('child2', 'log', 'parent'),
      ];

      const layouted = applyDagreLayout(nodes, []);

      // Child nodes should keep their original positions (not processed by Dagre)
      const child1 = layouted.find((n) => n.id === 'child1');
      const child2 = layouted.find((n) => n.id === 'child2');

      expect(child1?.position).toEqual({ x: 0, y: 0 });
      expect(child2?.position).toEqual({ x: 0, y: 0 });
    });

    it('should handle compound nodes with larger dimensions', () => {
      const nodes: Node[] = [createNode('cond1', 'compound_condition'), createNode('node2')];
      const edges: Edge[] = [createEdge('cond1', 'node2')];

      const layouted = applyDagreLayout(nodes, edges, { direction: 'TB' });

      const cond1 = layouted.find((n) => n.id === 'cond1');
      const node2 = layouted.find((n) => n.id === 'node2');

      // Node2 should be well below cond1 (accounting for larger compound node)
      expect(node2?.position.y).toBeGreaterThan((cond1?.position.y ?? 0) + 100);
    });

    it('should skip branch and loop edges', () => {
      const nodes: Node[] = [
        createNode('cond1', 'compound_condition'),
        createNode('then1', 'log', 'cond1'),
        createNode('node2'),
      ];
      const edges: Edge[] = [
        createEdge('cond1', 'then1', 'branch'), // Should be skipped
        createEdge('cond1', 'node2'),
      ];

      const layouted = applyDagreLayout(nodes, edges, { direction: 'TB' });

      // then1 should not be layouted (it's a child node)
      const then1 = layouted.find((n) => n.id === 'then1');
      expect(then1?.position).toEqual({ x: 0, y: 0 });
    });

    it('should skip loop-repeat edges', () => {
      const nodes: Node[] = [createNode('loop1', 'compound_loop'), createNode('node2')];
      const edges: Edge[] = [
        { id: 'loop1-loop-repeat', source: 'loop1_child', target: 'loop1', type: 'loop' },
        createEdge('loop1', 'node2'),
      ];

      // Should not throw even with loop-back edge
      expect(() => applyDagreLayout(nodes, edges)).not.toThrow();
    });

    it('should respect nodeSpacing option', () => {
      const nodes: Node[] = [createNode('node1'), createNode('node2'), createNode('node3')];

      // All at same rank (no edges), so nodeSpacing affects horizontal distance
      const layoutSmall = applyDagreLayout(nodes, [], { nodeSpacing: 20 });
      const layoutLarge = applyDagreLayout(nodes, [], { nodeSpacing: 200 });

      // Calculate horizontal spread
      const getSpread = (nodes: Node[]) => {
        const xs = nodes.map((n) => n.position.x);
        return Math.max(...xs) - Math.min(...xs);
      };

      expect(getSpread(layoutLarge)).toBeGreaterThan(getSpread(layoutSmall));
    });

    it('should respect rankSpacing option', () => {
      const nodes: Node[] = [createNode('node1'), createNode('node2')];
      const edges: Edge[] = [createEdge('node1', 'node2')];

      const layoutSmall = applyDagreLayout(nodes, edges, { direction: 'TB', rankSpacing: 50 });
      const layoutLarge = applyDagreLayout(nodes, edges, { direction: 'TB', rankSpacing: 200 });

      const getVerticalDistance = (nodes: Node[]) => {
        const n1 = nodes.find((n) => n.id === 'node1');
        const n2 = nodes.find((n) => n.id === 'node2');
        return (n2?.position.y ?? 0) - (n1?.position.y ?? 0);
      };

      expect(getVerticalDistance(layoutLarge)).toBeGreaterThan(getVerticalDistance(layoutSmall));
    });

    it('should handle empty node array', () => {
      const result = applyDagreLayout([], []);
      expect(result).toEqual([]);
    });

    it('should handle single node', () => {
      const nodes: Node[] = [createNode('single')];

      const result = applyDagreLayout(nodes, []);

      expect(result).toHaveLength(1);
      expect(result[0]?.position).toBeDefined();
    });

    it('should handle parallel branches (fork/join)', () => {
      const nodes: Node[] = [createNode('start'), createNode('branch1'), createNode('branch2'), createNode('end')];
      const edges: Edge[] = [
        createEdge('start', 'branch1'),
        createEdge('start', 'branch2'),
        createEdge('branch1', 'end'),
        createEdge('branch2', 'end'),
      ];

      const layouted = applyDagreLayout(nodes, edges, { direction: 'TB' });

      const start = layouted.find((n) => n.id === 'start');
      const branch1 = layouted.find((n) => n.id === 'branch1');
      const branch2 = layouted.find((n) => n.id === 'branch2');
      const end = layouted.find((n) => n.id === 'end');

      // Branches should be side by side
      expect(branch1?.position.y).toBeCloseTo(branch2?.position.y ?? 0, 0);
      expect(branch1?.position.x).not.toBe(branch2?.position.x);

      // End should be below branches
      expect(end?.position.y).toBeGreaterThan(branch1?.position.y ?? 0);
    });

    it('should preserve node properties', () => {
      const nodes: Node[] = [
        {
          id: 'node1',
          type: 'custom_type',
          position: { x: 0, y: 0 },
          data: { label: 'Test', custom: 'value' },
          selected: true,
          dragging: false,
        },
      ];

      const result = applyDagreLayout(nodes, []);

      expect(result[0]?.type).toBe('custom_type');
      expect(result[0]?.data.custom).toBe('value');
      expect(result[0]?.selected).toBe(true);
    });

    it('should use measured dimensions when available', () => {
      const nodes: Node[] = [
        {
          id: 'node1',
          type: 'log',
          position: { x: 0, y: 0 },
          data: {},
          measured: { width: 300, height: 100 },
        },
        createNode('node2'),
      ];
      const edges: Edge[] = [createEdge('node1', 'node2')];

      const layouted = applyDagreLayout(nodes, edges, { direction: 'TB' });

      const node2 = layouted.find((n) => n.id === 'node2');
      // Node2 should account for node1's larger measured height
      expect(node2?.position.y).toBeGreaterThan(100);
    });
  });

  describe('shouldApplyLayout', () => {
    it('should return true for nodes at origin', () => {
      const nodes: Node[] = [
        { id: '1', type: 'log', position: { x: 0, y: 0 }, data: {} },
        { id: '2', type: 'log', position: { x: 0, y: 0 }, data: {} },
      ];

      expect(shouldApplyLayout(nodes)).toBe(true);
    });

    it('should return false for nodes with meaningful positions', () => {
      const nodes: Node[] = [
        { id: '1', type: 'log', position: { x: 100, y: 200 }, data: {} },
        { id: '2', type: 'log', position: { x: 300, y: 400 }, data: {} },
      ];

      expect(shouldApplyLayout(nodes)).toBe(false);
    });

    it('should return false for empty array', () => {
      expect(shouldApplyLayout([])).toBe(false);
    });

    it('should ignore child nodes when checking positions', () => {
      const nodes: Node[] = [
        { id: 'parent', type: 'log', position: { x: 0, y: 0 }, data: {} },
        { id: 'child', type: 'log', position: { x: 100, y: 200 }, data: {}, parentId: 'parent' },
      ];

      // Only parent node is checked, and it's at origin
      expect(shouldApplyLayout(nodes)).toBe(true);
    });

    it('should return false if any top-level node has position', () => {
      const nodes: Node[] = [
        { id: '1', type: 'log', position: { x: 0, y: 0 }, data: {} },
        { id: '2', type: 'log', position: { x: 50, y: 50 }, data: {} },
      ];

      expect(shouldApplyLayout(nodes)).toBe(false);
    });

    it('should consider small positions as needing layout', () => {
      const nodes: Node[] = [{ id: '1', type: 'log', position: { x: 5, y: 5 }, data: {} }];

      // Within 10px threshold
      expect(shouldApplyLayout(nodes)).toBe(true);
    });
  });

  describe('getLayoutInfo', () => {
    it('should return correct counts', () => {
      const nodes: Node[] = [
        { id: 'parent1', type: 'compound_condition', position: { x: 0, y: 0 }, data: {} },
        { id: 'child1', type: 'log', position: { x: 0, y: 0 }, data: {}, parentId: 'parent1' },
        { id: 'child2', type: 'log', position: { x: 0, y: 0 }, data: {}, parentId: 'parent1' },
        { id: 'parent2', type: 'log', position: { x: 0, y: 0 }, data: {} },
      ];
      const edges: Edge[] = [
        { id: 'e1', source: 'parent1', target: 'parent2', type: 'default' },
        { id: 'e2', source: 'parent1', target: 'child1', type: 'branch' },
      ];

      const info = getLayoutInfo(nodes, edges);

      expect(info.nodeCount).toBe(4);
      expect(info.topLevelCount).toBe(2);
      expect(info.childCount).toBe(2);
      expect(info.edgeCount).toBe(1); // Only the edge between top-level nodes
    });

    it('should handle empty inputs', () => {
      const info = getLayoutInfo([], []);

      expect(info.nodeCount).toBe(0);
      expect(info.topLevelCount).toBe(0);
      expect(info.childCount).toBe(0);
      expect(info.edgeCount).toBe(0);
    });

    it('should not count edges to child nodes', () => {
      const nodes: Node[] = [
        { id: 'parent', type: 'compound_loop', position: { x: 0, y: 0 }, data: {} },
        { id: 'child', type: 'log', position: { x: 0, y: 0 }, data: {}, parentId: 'parent' },
      ];
      const edges: Edge[] = [{ id: 'e1', source: 'parent', target: 'child', type: 'loop' }];

      const info = getLayoutInfo(nodes, edges);

      expect(info.edgeCount).toBe(0); // Edge is to child, not counted
    });
  });

  describe('Layout Consistency', () => {
    it('should produce deterministic layout for same input', () => {
      const nodes: Node[] = [
        { id: 'a', type: 'log', position: { x: 0, y: 0 }, data: {} },
        { id: 'b', type: 'log', position: { x: 0, y: 0 }, data: {} },
        { id: 'c', type: 'log', position: { x: 0, y: 0 }, data: {} },
      ];
      const edges: Edge[] = [
        { id: 'e1', source: 'a', target: 'b', type: 'default' },
        { id: 'e2', source: 'b', target: 'c', type: 'default' },
      ];

      const layout1 = applyDagreLayout(nodes, edges);
      const layout2 = applyDagreLayout(nodes, edges);

      // Same positions
      for (let i = 0; i < layout1.length; i++) {
        expect(layout1[i]?.position.x).toBe(layout2[i]?.position.x);
        expect(layout1[i]?.position.y).toBe(layout2[i]?.position.y);
      }
    });

    it('should handle disconnected subgraphs', () => {
      const nodes: Node[] = [
        { id: 'a1', type: 'log', position: { x: 0, y: 0 }, data: {} },
        { id: 'a2', type: 'log', position: { x: 0, y: 0 }, data: {} },
        { id: 'b1', type: 'log', position: { x: 0, y: 0 }, data: {} },
        { id: 'b2', type: 'log', position: { x: 0, y: 0 }, data: {} },
      ];
      const edges: Edge[] = [
        { id: 'e1', source: 'a1', target: 'a2', type: 'default' },
        { id: 'e2', source: 'b1', target: 'b2', type: 'default' },
      ];

      const layouted = applyDagreLayout(nodes, edges, { direction: 'TB' });

      // All nodes should have valid positions
      layouted.forEach((node) => {
        expect(Number.isFinite(node.position.x)).toBe(true);
        expect(Number.isFinite(node.position.y)).toBe(true);
      });
    });
  });
});
