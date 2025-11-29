/**
 * Unit Tests for Branch Layout Algorithm
 *
 * Tests the positioning of child nodes within compound nodes
 * (conditions with then/else branches, loops with nested blocks).
 */

import { describe, it, expect } from 'vitest';
import type { Node } from '@xyflow/react';
import {
  layoutBranchChildren,
  layoutLoopChildren,
  applyCompoundLayout,
  calculateCompoundNodeSize,
} from '../utils/branch-layout';

describe('branch-layout', () => {
  describe('layoutBranchChildren', () => {
    const createParentNode = (id: string = 'parent'): Node => ({
      id,
      type: 'compound_condition',
      position: { x: 100, y: 100 },
      data: { label: 'Test Condition' },
    });

    const createChildNode = (id: string, name: string): Node => ({
      id,
      type: 'log',
      position: { x: 0, y: 0 },
      data: { label: name, config: {} },
    });

    it('should position then children in left column', () => {
      const parent = createParentNode();
      const thenChildren = [createChildNode('then1', 'Then Step 1'), createChildNode('then2', 'Then Step 2')];

      const { nodes } = layoutBranchChildren(parent, thenChildren, []);

      // All then children should have same x position
      const xPositions = nodes.map((n) => n.position.x);
      expect(new Set(xPositions).size).toBe(1);

      // First child should be positioned below header
      expect(nodes[0]?.position.y).toBeGreaterThanOrEqual(80); // Header height
    });

    it('should position else children in right column', () => {
      const parent = createParentNode();
      const elseChildren = [createChildNode('else1', 'Else Step 1'), createChildNode('else2', 'Else Step 2')];

      const { nodes } = layoutBranchChildren(parent, [], elseChildren);

      // All else children should have same x position
      const xPositions = nodes.map((n) => n.position.x);
      expect(new Set(xPositions).size).toBe(1);

      // Else column should be to the right of then column
      expect(nodes[0]?.position.x).toBeGreaterThan(100);
    });

    it('should stack children vertically', () => {
      const parent = createParentNode();
      const thenChildren = [
        createChildNode('then1', 'Then Step 1'),
        createChildNode('then2', 'Then Step 2'),
        createChildNode('then3', 'Then Step 3'),
      ];

      const { nodes } = layoutBranchChildren(parent, thenChildren, []);

      // Each child should be below the previous one
      for (let i = 1; i < nodes.length; i++) {
        expect(nodes[i]?.position.y).toBeGreaterThan(nodes[i - 1]?.position.y ?? 0);
      }
    });

    it('should set parentId on child nodes', () => {
      const parent = createParentNode('cond1');
      const thenChildren = [createChildNode('then1', 'Then Step')];
      const elseChildren = [createChildNode('else1', 'Else Step')];

      const { nodes } = layoutBranchChildren(parent, thenChildren, elseChildren);

      nodes.forEach((node) => {
        expect(node.parentId).toBe('cond1');
      });
    });

    it('should set extent to parent', () => {
      const parent = createParentNode();
      const thenChildren = [createChildNode('then1', 'Then Step')];

      const { nodes } = layoutBranchChildren(parent, thenChildren, []);

      nodes.forEach((node) => {
        expect(node.extent).toBe('parent');
      });
    });

    it('should calculate correct parent size based on children count', () => {
      const parent = createParentNode();
      const thenChildren = [
        createChildNode('then1', 'Then Step 1'),
        createChildNode('then2', 'Then Step 2'),
        createChildNode('then3', 'Then Step 3'),
      ];

      const { parentSize } = layoutBranchChildren(parent, thenChildren, []);

      // Height should accommodate all children
      expect(parentSize.height).toBeGreaterThan(200);
      expect(parentSize.width).toBeGreaterThanOrEqual(320);
    });

    it('should handle empty branches', () => {
      const parent = createParentNode();

      const { nodes, parentSize } = layoutBranchChildren(parent, [], []);

      expect(nodes).toHaveLength(0);
      expect(parentSize.height).toBeGreaterThanOrEqual(200); // Minimum height
    });

    it('should handle asymmetric branches', () => {
      const parent = createParentNode();
      const thenChildren = [
        createChildNode('then1', 'Then Step 1'),
        createChildNode('then2', 'Then Step 2'),
        createChildNode('then3', 'Then Step 3'),
      ];
      const elseChildren = [createChildNode('else1', 'Else Step 1')];

      const { nodes, parentSize } = layoutBranchChildren(parent, thenChildren, elseChildren);

      expect(nodes).toHaveLength(4);
      // Height should be based on max(thenCount, elseCount)
      const thenCount = 3;
      const expectedMinHeight = 80 + thenCount * 70; // header + children
      expect(parentSize.height).toBeGreaterThanOrEqual(expectedMinHeight);
    });

    it('should accept custom config options', () => {
      const parent = createParentNode();
      const thenChildren = [createChildNode('then1', 'Then Step')];

      const { parentSize } = layoutBranchChildren(parent, thenChildren, [], {
        headerHeight: 100,
        childSpacing: 100,
      });

      // Should use custom config values
      expect(parentSize.height).toBeGreaterThanOrEqual(200);
    });
  });

  describe('layoutLoopChildren', () => {
    const createParentNode = (id: string = 'loop1'): Node => ({
      id,
      type: 'compound_loop',
      position: { x: 100, y: 100 },
      data: { label: 'Test Loop' },
    });

    const createChildNode = (id: string, name: string): Node => ({
      id,
      type: 'log',
      position: { x: 0, y: 0 },
      data: { label: name, config: {} },
    });

    it('should position children vertically', () => {
      const parent = createParentNode();
      const children = [
        createChildNode('child1', 'Step 1'),
        createChildNode('child2', 'Step 2'),
        createChildNode('child3', 'Step 3'),
      ];

      const { nodes } = layoutLoopChildren(parent, children);

      // Each child should be below the previous one
      for (let i = 1; i < nodes.length; i++) {
        expect(nodes[i]?.position.y).toBeGreaterThan(nodes[i - 1]?.position.y ?? 0);
      }
    });

    it('should center children horizontally', () => {
      const parent = createParentNode();
      const children = [createChildNode('child1', 'Step 1'), createChildNode('child2', 'Step 2')];

      const { nodes } = layoutLoopChildren(parent, children);

      // All children should have same x position (centered)
      const xPositions = nodes.map((n) => n.position.x);
      expect(new Set(xPositions).size).toBe(1);
    });

    it('should set parentId on child nodes', () => {
      const parent = createParentNode('loop1');
      const children = [createChildNode('child1', 'Step 1')];

      const { nodes } = layoutLoopChildren(parent, children);

      nodes.forEach((node) => {
        expect(node.parentId).toBe('loop1');
      });
    });

    it('should calculate narrower width for loop (single column)', () => {
      const parent = createParentNode();
      const children = [createChildNode('child1', 'Step 1')];

      const { parentSize } = layoutLoopChildren(parent, children);

      // Loop should be narrower than condition (single column vs two columns)
      expect(parentSize.width).toBeLessThan(320);
    });

    it('should handle empty loop', () => {
      const parent = createParentNode();

      const { nodes, parentSize } = layoutLoopChildren(parent, []);

      expect(nodes).toHaveLength(0);
      expect(parentSize.height).toBeGreaterThanOrEqual(200);
    });

    it('should expand height for many children', () => {
      const parent = createParentNode();
      const children = Array.from({ length: 10 }, (_, i) => createChildNode(`child${i}`, `Step ${i + 1}`));

      const { parentSize } = layoutLoopChildren(parent, children);

      // Height should expand to fit all children
      expect(parentSize.height).toBeGreaterThan(500);
    });
  });

  describe('applyCompoundLayout', () => {
    it('should process compound_condition nodes', () => {
      const nodes: Node[] = [
        {
          id: 'cond1',
          type: 'compound_condition',
          position: { x: 0, y: 0 },
          data: { label: 'Condition' },
        },
        {
          id: 'then1',
          type: 'log',
          position: { x: 0, y: 0 },
          data: { label: 'Then Step' },
          parentId: 'cond1',
        },
        {
          id: 'else1',
          type: 'log',
          position: { x: 0, y: 0 },
          data: { label: 'Else Step' },
          parentId: 'cond1',
        },
      ];

      // Need to update IDs to include branch markers for detection
      nodes[1]!.id = 'cond1_then_1';
      nodes[2]!.id = 'cond1_else_1';

      const layouted = applyCompoundLayout(nodes);

      // Should still have all nodes
      expect(layouted).toHaveLength(3);

      // Parent should have updated style
      const parent = layouted.find((n) => n.id === 'cond1');
      expect(parent?.style?.width).toBeDefined();
      expect(parent?.style?.height).toBeDefined();

      // Children should have parentId set
      const children = layouted.filter((n) => n.parentId === 'cond1');
      expect(children).toHaveLength(2);
    });

    it('should process compound_loop nodes', () => {
      const nodes: Node[] = [
        {
          id: 'loop1',
          type: 'compound_loop',
          position: { x: 0, y: 0 },
          data: { label: 'Loop' },
        },
        {
          id: 'child1',
          type: 'log',
          position: { x: 0, y: 0 },
          data: { label: 'Child Step' },
          parentId: 'loop1',
        },
      ];

      const layouted = applyCompoundLayout(nodes);

      const parent = layouted.find((n) => n.id === 'loop1');
      expect(parent?.style?.width).toBeDefined();
      expect(parent?.style?.height).toBeDefined();
    });

    it('should preserve non-compound top-level nodes', () => {
      const nodes: Node[] = [
        {
          id: 'regular1',
          type: 'log',
          position: { x: 100, y: 200 },
          data: { label: 'Regular Node' },
        },
        {
          id: 'cond1',
          type: 'compound_condition',
          position: { x: 0, y: 0 },
          data: { label: 'Condition' },
        },
      ];

      const layouted = applyCompoundLayout(nodes);

      const regular = layouted.find((n) => n.id === 'regular1');
      expect(regular?.position).toEqual({ x: 100, y: 200 });
    });

    it('should handle multiple compound nodes', () => {
      const nodes: Node[] = [
        {
          id: 'cond1',
          type: 'compound_condition',
          position: { x: 0, y: 0 },
          data: { label: 'Condition 1' },
        },
        {
          id: 'cond1_then_1',
          type: 'log',
          position: { x: 0, y: 0 },
          data: { label: 'Then Step' },
          parentId: 'cond1',
        },
        {
          id: 'loop1',
          type: 'compound_loop',
          position: { x: 0, y: 0 },
          data: { label: 'Loop 1' },
        },
        {
          id: 'loop1_child',
          type: 'log',
          position: { x: 0, y: 0 },
          data: { label: 'Loop Child' },
          parentId: 'loop1',
        },
      ];

      const layouted = applyCompoundLayout(nodes);

      const cond = layouted.find((n) => n.id === 'cond1');
      const loop = layouted.find((n) => n.id === 'loop1');

      expect(cond?.style?.width).toBeDefined();
      expect(loop?.style?.width).toBeDefined();
    });
  });

  describe('calculateCompoundNodeSize', () => {
    it('should calculate condition node size', () => {
      const size = calculateCompoundNodeSize('compound_condition', 4);

      expect(size.width).toBe(320); // minParentWidth
      expect(size.height).toBeGreaterThanOrEqual(200);
    });

    it('should calculate loop node size', () => {
      const size = calculateCompoundNodeSize('compound_loop', 4);

      expect(size.width).toBeLessThan(320); // Narrower for single column
      expect(size.height).toBeGreaterThanOrEqual(200);
    });

    it('should increase height for more children', () => {
      const small = calculateCompoundNodeSize('compound_loop', 2);
      const large = calculateCompoundNodeSize('compound_loop', 10);

      expect(large.height).toBeGreaterThan(small.height);
    });

    it('should use custom config', () => {
      const size = calculateCompoundNodeSize('compound_condition', 2, {
        minParentHeight: 300,
      });

      expect(size.height).toBeGreaterThanOrEqual(300);
    });

    it('should handle zero children', () => {
      const size = calculateCompoundNodeSize('compound_condition', 0);

      expect(size.width).toBeGreaterThan(0);
      expect(size.height).toBeGreaterThanOrEqual(200);
    });
  });

  describe('Edge Cases', () => {
    it('should handle node with null data', () => {
      const parent: Node = {
        id: 'parent',
        type: 'compound_condition',
        position: { x: 0, y: 0 },
        data: null as any,
      };
      const children: Node[] = [];

      const { nodes, parentSize } = layoutBranchChildren(parent, children, []);

      expect(nodes).toHaveLength(0);
      expect(parentSize).toBeDefined();
    });

    it('should handle deeply nested nodes', () => {
      // Test that layout works even with nodes that have nested parentId chains
      const nodes: Node[] = [
        {
          id: 'loop1',
          type: 'compound_loop',
          position: { x: 0, y: 0 },
          data: { label: 'Outer Loop' },
        },
        {
          id: 'loop1_child1',
          type: 'compound_condition',
          position: { x: 0, y: 0 },
          data: { label: 'Inner Condition' },
          parentId: 'loop1',
        },
      ];

      const layouted = applyCompoundLayout(nodes);

      // Should have all nodes (parent loop + child condition, but child condition
      // is also a compound node so it gets processed and may include its style)
      expect(layouted.length).toBeGreaterThanOrEqual(2);

      // The inner compound condition should keep its parentId
      const innerCond = layouted.find((n) => n.id === 'loop1_child1');
      expect(innerCond?.parentId).toBe('loop1');
    });
  });
});
