/**
 * Edge Case Tests for Nested Workflow Features
 *
 * Tests boundary conditions, error cases, and unusual inputs
 * to ensure robust handling.
 */

import { describe, it, expect } from 'vitest';
import { irToReactFlow } from '../utils/ir-to-reactflow';
import { autoLayout } from '../utils/auto-layout';
import { applyCompoundLayout, layoutBranchChildren, layoutLoopChildren } from '../utils/branch-layout';
import { applyDagreLayout, shouldApplyLayout } from '../utils/dagre-layout';
import { convertLegacyToIR, isLegacyFormat, isNewIRFormat, adaptYAMLToIR } from '../utils/legacy-yaml-adapter';
import type { WorkflowIR, StepIR } from '../utils/yaml-types';
import type { Node, Edge } from '@xyflow/react';
import { createConditionThenOnly, createEmptyLoop, getMaxNestingDepth } from './fixtures/nested-workflows';

describe('Edge Cases', () => {
  describe('Condition Branches', () => {
    it('should handle condition with only then branch (no else)', () => {
      const ir = createConditionThenOnly();
      const { nodes } = irToReactFlow(ir);

      const conditionNode = nodes.find((n) => n.type === 'compound_condition');
      expect(conditionNode?.data.hasThenBranch).toBe(true);
      expect(conditionNode?.data.hasElseBranch).toBe(false);
    });

    it('should handle condition with only else branch (no then)', () => {
      const ir: WorkflowIR = {
        version: '1.0',
        trigger: { type: 'webhook', config: {} },
        steps: [
          {
            id: 'cond1',
            name: 'Else Only',
            type: 'condition',
            config: {},
            branches: {
              else: [{ id: 'else1', name: 'Else Step', type: 'log', config: {} }],
            },
          },
        ],
      };

      const { nodes } = irToReactFlow(ir);

      const conditionNode = nodes.find((n) => n.type === 'compound_condition');
      expect(conditionNode?.data.hasThenBranch).toBe(false);
      expect(conditionNode?.data.hasElseBranch).toBe(true);
    });

    it('should handle condition with empty branches', () => {
      const ir: WorkflowIR = {
        version: '1.0',
        trigger: { type: 'webhook', config: {} },
        steps: [
          {
            id: 'cond1',
            name: 'Empty Condition',
            type: 'condition',
            config: {},
            branches: {
              then: [],
              else: [],
            },
          },
        ],
      };

      const { nodes } = irToReactFlow(ir);
      expect(nodes).toHaveLength(1); // Only parent, no children
    });

    it('should handle condition without branches property', () => {
      const ir: WorkflowIR = {
        version: '1.0',
        trigger: { type: 'webhook', config: {} },
        steps: [
          {
            id: 'cond1',
            name: 'No Branches',
            type: 'condition',
            config: { condition: 'true' },
          },
        ],
      };

      const { nodes } = irToReactFlow(ir);
      // Should create regular node, not compound
      expect(nodes[0]?.type).toBe('condition');
    });
  });

  describe('Loop Nested Blocks', () => {
    it('should handle empty loop (no nested blocks)', () => {
      const ir = createEmptyLoop();
      const { nodes } = irToReactFlow(ir);

      const loopNode = nodes.find((n) => n.type === 'compound_loop');
      expect(loopNode?.data.childCount).toBe(0);
    });

    it('should handle loop without nested_blocks property', () => {
      const ir: WorkflowIR = {
        version: '1.0',
        trigger: { type: 'webhook', config: {} },
        steps: [
          {
            id: 'loop1',
            name: 'No Nested',
            type: 'loop',
            config: { items: '$[items]' },
          },
        ],
      };

      const { nodes } = irToReactFlow(ir);
      // Should create regular node, not compound
      expect(nodes[0]?.type).toBe('loop');
    });

    it('should handle loop with single nested block', () => {
      const ir: WorkflowIR = {
        version: '1.0',
        trigger: { type: 'webhook', config: {} },
        steps: [
          {
            id: 'loop1',
            name: 'Single Nested',
            type: 'loop',
            config: { items: '$[items]' },
            nested_blocks: [{ id: 'child1', name: 'Only Child', type: 'log', config: {} }],
          },
        ],
      };

      const { nodes, edges } = irToReactFlow(ir);

      expect(nodes).toHaveLength(2); // Parent + 1 child

      // Should still have loop-start and loop-repeat edges
      const loopEdges = edges.filter((e) => e.type === 'loop');
      expect(loopEdges.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Malformed Data', () => {
    it('should handle step with null config', () => {
      const ir: WorkflowIR = {
        version: '1.0',
        trigger: { type: 'webhook', config: {} },
        steps: [
          {
            id: 'step1',
            name: 'Null Config',
            type: 'log',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            config: null as any,
          },
        ],
      };

      expect(() => irToReactFlow(ir)).not.toThrow();
    });

    it('should handle step with undefined name', () => {
      const ir: WorkflowIR = {
        version: '1.0',
        trigger: { type: 'webhook', config: {} },
        steps: [
          {
            id: 'step1',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            name: undefined as any,
            type: 'log',
            config: {},
          },
        ],
      };

      const { nodes } = irToReactFlow(ir);
      expect(nodes[0]?.data.label).toBeFalsy();
    });

    it('should handle empty steps array', () => {
      const ir: WorkflowIR = {
        version: '1.0',
        trigger: { type: 'webhook', config: {} },
        steps: [],
      };

      const { nodes, edges } = irToReactFlow(ir);
      expect(nodes).toHaveLength(0);
      expect(edges).toHaveLength(0);
    });

    it('should handle trigger with empty config', () => {
      const ir: WorkflowIR = {
        version: '1.0',
        trigger: { type: 'webhook', config: {} },
        steps: [{ id: 'step1', name: 'Step', type: 'log', config: {} }],
      };

      const { trigger } = irToReactFlow(ir);
      expect(trigger.config).toEqual({});
    });
  });

  describe('Legacy Format Edge Cases', () => {
    it('should handle legacy with empty stages array', () => {
      const legacy = { stages: [] };
      const ir = convertLegacyToIR(legacy, 'WEBHOOK', {});

      // Should create placeholder step
      expect(ir.steps).toHaveLength(1);
      expect(ir.steps[0]?.name).toBe('placeholder');
    });

    it('should handle legacy stage with empty blocks array', () => {
      const legacy = { stages: [{ name: 'empty', blocks: [] }] };
      const ir = convertLegacyToIR(legacy, 'WEBHOOK', {});

      expect(ir.steps).toHaveLength(1);
      expect(ir.steps[0]?.name).toBe('placeholder');
    });

    it('should handle legacy block with missing input', () => {
      const legacy = {
        stages: [
          {
            name: 'main',
            blocks: [{ type: 'log', name: 'No Input' }],
          },
        ],
      };

      const ir = convertLegacyToIR(legacy, 'WEBHOOK', {});
      expect(ir.steps[0]?.config).toEqual({});
    });

    it('should handle legacy block with null then/else', () => {
      const legacy = {
        stages: [
          {
            name: 'main',
            blocks: [
              {
                type: 'condition',
                name: 'Null Branches',
                input: {},
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                then: null as any,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                else: null as any,
              },
            ],
          },
        ],
      };

      const ir = convertLegacyToIR(legacy, 'WEBHOOK', {});
      expect(ir.steps[0]?.branches).toBeUndefined();
    });

    it('should handle unknown block type', () => {
      const legacy = {
        stages: [
          {
            name: 'main',
            blocks: [{ type: 'unknown_custom_type', name: 'Unknown', input: { foo: 'bar' } }],
          },
        ],
      };

      const ir = convertLegacyToIR(legacy, 'WEBHOOK', {});
      expect(ir.steps[0]?.type).toBe('unknown_custom_type');
    });
  });

  describe('Format Detection', () => {
    it('should reject non-object inputs', () => {
      expect(isLegacyFormat('string')).toBe(false);
      expect(isLegacyFormat(123)).toBe(false);
      expect(isLegacyFormat(true)).toBe(false);
      expect(isLegacyFormat([])).toBe(false);
    });

    it('should reject null and undefined', () => {
      expect(isLegacyFormat(null)).toBe(false);
      expect(isLegacyFormat(undefined)).toBe(false);
      expect(isNewIRFormat(null)).toBe(false);
      expect(isNewIRFormat(undefined)).toBe(false);
    });

    it('should throw for unknown format', () => {
      expect(() => adaptYAMLToIR({ random: 'object' })).toThrow('Unknown YAML format');
    });
  });

  describe('Layout Edge Cases', () => {
    it('should handle layout with no nodes', () => {
      const result = autoLayout([], []);
      expect(result).toEqual([]);
    });

    it('should handle layout with single node', () => {
      const nodes: Node[] = [{ id: 'single', type: 'log', position: { x: 0, y: 0 }, data: {} }];

      const result = autoLayout(nodes, []);
      expect(result).toHaveLength(1);
      expect(result[0]?.position).toBeDefined();
    });

    it('should handle layout with only child nodes (no parents)', () => {
      const nodes: Node[] = [
        { id: 'child1', type: 'log', position: { x: 0, y: 0 }, data: {}, parentId: 'missing' },
        { id: 'child2', type: 'log', position: { x: 0, y: 0 }, data: {}, parentId: 'missing' },
      ];

      // Should not throw, even with orphan children
      expect(() => autoLayout(nodes, [])).not.toThrow();
    });

    it('should handle shouldApplyLayout with undefined positions', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const nodes: Node[] = [{ id: 'node1', type: 'log', position: undefined as any, data: {} }];

      // Should not throw
      expect(() => shouldApplyLayout(nodes)).not.toThrow();
    });

    it('should handle very large positions', () => {
      const nodes: Node[] = [
        { id: 'node1', type: 'log', position: { x: 999999, y: 999999 }, data: {} },
        { id: 'node2', type: 'log', position: { x: -999999, y: -999999 }, data: {} },
      ];

      expect(shouldApplyLayout(nodes)).toBe(false);
    });
  });

  describe('Branch Layout Edge Cases', () => {
    const createNode = (id: string): Node => ({
      id,
      type: 'log',
      position: { x: 0, y: 0 },
      data: {},
    });

    it('should handle layoutBranchChildren with empty arrays', () => {
      const parent = createNode('parent');

      const { nodes, parentSize } = layoutBranchChildren(parent, [], []);

      expect(nodes).toHaveLength(0);
      expect(parentSize.width).toBeGreaterThan(0);
      expect(parentSize.height).toBeGreaterThan(0);
    });

    it('should handle layoutLoopChildren with empty array', () => {
      const parent = createNode('parent');

      const { nodes, parentSize } = layoutLoopChildren(parent, []);

      expect(nodes).toHaveLength(0);
      expect(parentSize.width).toBeGreaterThan(0);
    });

    it('should handle very large child counts', () => {
      const parent = createNode('parent');
      const children = Array.from({ length: 100 }, (_, i) => createNode(`child${i}`));

      const { parentSize } = layoutLoopChildren(parent, children);

      // Height should scale with children
      expect(parentSize.height).toBeGreaterThan(5000);
    });
  });

  describe('Dagre Layout Edge Cases', () => {
    it('should handle self-loop edge', () => {
      const nodes: Node[] = [{ id: 'node1', type: 'log', position: { x: 0, y: 0 }, data: {} }];
      const edges: Edge[] = [{ id: 'e1', source: 'node1', target: 'node1', type: 'default' }];

      // Should not throw
      expect(() => applyDagreLayout(nodes, edges)).not.toThrow();
    });

    it('should handle edges to non-existent nodes', () => {
      const nodes: Node[] = [{ id: 'node1', type: 'log', position: { x: 0, y: 0 }, data: {} }];
      const edges: Edge[] = [{ id: 'e1', source: 'node1', target: 'missing', type: 'default' }];

      // Should not throw, edge is just skipped
      expect(() => applyDagreLayout(nodes, edges)).not.toThrow();
    });

    it('should handle all nodes having same position initially', () => {
      const nodes: Node[] = [
        { id: 'a', type: 'log', position: { x: 0, y: 0 }, data: {} },
        { id: 'b', type: 'log', position: { x: 0, y: 0 }, data: {} },
        { id: 'c', type: 'log', position: { x: 0, y: 0 }, data: {} },
      ];
      const edges: Edge[] = [
        { id: 'e1', source: 'a', target: 'b', type: 'default' },
        { id: 'e2', source: 'b', target: 'c', type: 'default' },
      ];

      const result = applyDagreLayout(nodes, edges);

      // After layout, positions should be different
      const uniquePositions = new Set(result.map((n) => `${n.position.x},${n.position.y}`));
      expect(uniquePositions.size).toBe(3);
    });
  });

  describe('Compound Layout Edge Cases', () => {
    it('should handle mixed compound and regular nodes', () => {
      const nodes: Node[] = [
        { id: 'cond1', type: 'compound_condition', position: { x: 0, y: 0 }, data: {} },
        { id: 'regular1', type: 'log', position: { x: 100, y: 200 }, data: {} },
        { id: 'cond1_then_1', type: 'log', position: { x: 0, y: 0 }, data: {}, parentId: 'cond1' },
      ];

      const result = applyCompoundLayout(nodes);

      // Regular node position should be preserved
      const regular = result.find((n) => n.id === 'regular1');
      expect(regular?.position).toEqual({ x: 100, y: 200 });

      // Compound node should have style
      const cond = result.find((n) => n.id === 'cond1');
      expect(cond?.style?.width).toBeDefined();
    });

    it('should handle nested compound nodes', () => {
      const nodes: Node[] = [
        { id: 'loop1', type: 'compound_loop', position: { x: 0, y: 0 }, data: {} },
        { id: 'loop1_child1', type: 'compound_condition', position: { x: 0, y: 0 }, data: {}, parentId: 'loop1' },
      ];

      // Should not throw for nested compound nodes
      expect(() => applyCompoundLayout(nodes)).not.toThrow();
    });
  });

  describe('Deep Nesting Limits', () => {
    it('should handle 20 levels of nesting without stack overflow', () => {
      function createDeeplyNested(depth: number): StepIR {
        if (depth === 0) {
          return { id: 'leaf', name: 'Leaf', type: 'log', config: {} };
        }
        return {
          id: `level${depth}`,
          name: `Level ${depth}`,
          type: 'condition',
          config: {},
          branches: {
            then: [createDeeplyNested(depth - 1)],
          },
        };
      }

      const ir: WorkflowIR = {
        version: '1.0',
        trigger: { type: 'webhook', config: {} },
        steps: [createDeeplyNested(20)],
      };

      expect(() => irToReactFlow(ir)).not.toThrow();

      const depth = getMaxNestingDepth(ir.steps[0]!);
      expect(depth).toBe(20);
    });
  });

  describe('Special Characters in IDs and Names', () => {
    it('should handle special characters in step IDs', () => {
      const ir: WorkflowIR = {
        version: '1.0',
        trigger: { type: 'webhook', config: {} },
        steps: [
          { id: 'step-with-dashes', name: 'Step 1', type: 'log', config: {} },
          { id: 'step_with_underscores', name: 'Step 2', type: 'log', config: {} },
          { id: 'step.with.dots', name: 'Step 3', type: 'log', config: {} },
        ],
      };

      const { nodes } = irToReactFlow(ir);
      expect(nodes).toHaveLength(3);
    });

    it('should handle unicode in step names', () => {
      const ir: WorkflowIR = {
        version: '1.0',
        trigger: { type: 'webhook', config: {} },
        steps: [
          { id: 'step1', name: 'Bước xử lý đầu tiên', type: 'log', config: {} },
          { id: 'step2', name: '日本語のステップ', type: 'log', config: {} },
          { id: 'step3', name: '🚀 Emoji Step', type: 'log', config: {} },
        ],
      };

      const { nodes } = irToReactFlow(ir);
      expect(nodes[0]?.data.label).toBe('Bước xử lý đầu tiên');
      expect(nodes[1]?.data.label).toBe('日本語のステップ');
      expect(nodes[2]?.data.label).toBe('🚀 Emoji Step');
    });
  });

  describe('Numeric Edge Cases', () => {
    it('should handle NaN positions', () => {
      const nodes: Node[] = [{ id: 'node1', type: 'log', position: { x: NaN, y: NaN }, data: {} }];

      // Should treat NaN as needing layout
      expect(() => autoLayout(nodes, [])).not.toThrow();
    });

    it('should handle Infinity positions', () => {
      const nodes: Node[] = [{ id: 'node1', type: 'log', position: { x: Infinity, y: -Infinity }, data: {} }];

      expect(() => applyDagreLayout(nodes, [])).not.toThrow();
    });
  });
});
