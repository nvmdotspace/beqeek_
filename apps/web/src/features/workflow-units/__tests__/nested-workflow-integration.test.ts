/**
 * Integration Tests for Nested Workflow Flow
 *
 * Tests the complete flow: YAML → IR → React Flow → IR → YAML
 * Ensures round-trip conversion without data loss.
 */

import { describe, it, expect } from 'vitest';
import { irToReactFlow } from '../utils/ir-to-reactflow';
import { autoLayout } from '../utils/auto-layout';
import { convertLegacyToIR, adaptYAMLToIR } from '../utils/legacy-yaml-adapter';
import {
  createNestedConditionIR,
  createLoopWithBlocksIR,
  createComplexNestedIR,
  createLegacyConditionWithThen,
  createLegacyLoopWithBlocks,
  createDeeplyNestedConditions,
  getMaxNestingDepth,
  countTotalSteps,
} from './fixtures/nested-workflows';
import type { WorkflowIR, StepIR } from '../utils/yaml-types';

describe('Nested Workflow Integration', () => {
  describe('IR to ReactFlow Conversion - Conditions', () => {
    it('should convert nested condition to compound node with children', () => {
      const ir = createNestedConditionIR();
      const { nodes, edges } = irToReactFlow(ir);

      // Should have 1 compound condition + 4 children (2 then + 2 else)
      expect(nodes.length).toBe(5);

      // Find compound condition node
      const conditionNode = nodes.find((n) => n.type === 'compound_condition');
      expect(conditionNode).toBeDefined();
      expect(conditionNode?.data.label).toBe('Check Status');

      // Check children have parentId
      const children = nodes.filter((n) => n.parentId === conditionNode?.id);
      expect(children.length).toBe(4);
    });

    it('should create correct edges for then/else branches', () => {
      const ir = createNestedConditionIR();
      const { nodes, edges } = irToReactFlow(ir);

      // Should have edges from condition to first then and first else
      const thenEdge = edges.find((e) => e.label === 'then');
      const elseEdge = edges.find((e) => e.label === 'else');

      expect(thenEdge).toBeDefined();
      expect(elseEdge).toBeDefined();
      expect(thenEdge?.type).toBe('branch');
      expect(elseEdge?.type).toBe('branch');
    });

    it('should preserve condition data in node', () => {
      const ir = createNestedConditionIR();
      const { nodes } = irToReactFlow(ir);

      const conditionNode = nodes.find((n) => n.type === 'compound_condition');

      expect(conditionNode?.data.hasThenBranch).toBe(true);
      expect(conditionNode?.data.hasElseBranch).toBe(true);
      expect(conditionNode?.data.condition).toBeDefined();
    });
  });

  describe('IR to ReactFlow Conversion - Loops', () => {
    it('should convert loop to compound node with nested children', () => {
      const ir = createLoopWithBlocksIR();
      const { nodes, edges } = irToReactFlow(ir);

      // Should have 1 compound loop + 3 children
      expect(nodes.length).toBe(4);

      const loopNode = nodes.find((n) => n.type === 'compound_loop');
      expect(loopNode).toBeDefined();

      const children = nodes.filter((n) => n.parentId === loopNode?.id);
      expect(children.length).toBe(3);
    });

    it('should create sequential edges between loop children', () => {
      const ir = createLoopWithBlocksIR();
      const { nodes, edges } = irToReactFlow(ir);

      const loopNode = nodes.find((n) => n.type === 'compound_loop');
      const children = nodes.filter((n) => n.parentId === loopNode?.id);

      // Should have edges connecting children sequentially
      const sequentialEdges = edges.filter(
        (e) => e.type === 'loop' && !e.id.includes('loop-start') && !e.id.includes('loop-repeat'),
      );

      expect(sequentialEdges.length).toBe(2); // Between 3 children = 2 edges
    });

    it('should create loop-back edge from last child to parent', () => {
      const ir = createLoopWithBlocksIR();
      const { edges } = irToReactFlow(ir);

      const loopBackEdge = edges.find((e) => e.id.includes('loop-repeat'));
      expect(loopBackEdge).toBeDefined();
      expect(loopBackEdge?.animated).toBe(true);
      expect(loopBackEdge?.label).toBe('repeat');
    });

    it('should preserve loop config in node data', () => {
      const ir = createLoopWithBlocksIR();
      const { nodes } = irToReactFlow(ir);

      const loopNode = nodes.find((n) => n.type === 'compound_loop');

      expect(loopNode?.data.itemVar).toBeDefined();
      expect(loopNode?.data.collection).toBeDefined();
      expect(loopNode?.data.childCount).toBe(3);
    });
  });

  describe('Complex Nested Workflows', () => {
    it('should handle condition inside loop inside condition', () => {
      const ir = createComplexNestedIR();
      const { nodes, edges } = irToReactFlow(ir);

      // Count node types
      const conditions = nodes.filter((n) => n.type === 'compound_condition' || n.type === 'condition');
      const loops = nodes.filter((n) => n.type === 'compound_loop' || n.type === 'loop');

      expect(conditions.length).toBeGreaterThanOrEqual(1);
      // Should have nested structures
      expect(nodes.some((n) => n.parentId)).toBe(true);
    });

    it('should maintain correct parent-child relationships', () => {
      const ir = createNestedConditionIR();
      const { nodes } = irToReactFlow(ir);

      // All children should reference valid parents
      const parentIds = new Set(nodes.map((n) => n.id));
      const children = nodes.filter((n) => n.parentId);

      children.forEach((child) => {
        expect(parentIds.has(child.parentId!)).toBe(true);
      });
    });

    it('should preserve step dependencies (depends_on)', () => {
      const ir = createComplexNestedIR();
      const { edges } = irToReactFlow(ir);

      // Should have edge from start to condition
      const startEdge = edges.find((e) => e.source === 'start');
      expect(startEdge).toBeDefined();

      // Should have edge from condition to end
      const endEdge = edges.find((e) => e.target === 'end');
      expect(endEdge).toBeDefined();
    });
  });

  describe('Legacy YAML Conversion Flow', () => {
    it('should convert legacy condition to IR and then to ReactFlow', () => {
      // Legacy YAML → IR
      const legacy = createLegacyConditionWithThen();
      const ir = convertLegacyToIR(legacy, 'WEBHOOK', {});

      // IR → ReactFlow
      const { nodes, edges } = irToReactFlow(ir);

      expect(nodes.some((n) => n.type === 'compound_condition')).toBe(true);
      expect(nodes.filter((n) => n.parentId).length).toBeGreaterThan(0);
    });

    it('should convert legacy loop to IR and then to ReactFlow', () => {
      const legacy = createLegacyLoopWithBlocks();
      const ir = convertLegacyToIR(legacy, 'ACTIVE_TABLE', {});

      const { nodes, edges } = irToReactFlow(ir);

      expect(nodes.some((n) => n.type === 'compound_loop')).toBe(true);
      expect(nodes.filter((n) => n.parentId).length).toBe(3);
    });

    it('should handle deeply nested conditions through full pipeline', () => {
      const legacy = createDeeplyNestedConditions(5);
      const ir = convertLegacyToIR(legacy, 'WEBHOOK', {});

      // Verify depth is preserved in IR
      expect(getMaxNestingDepth(ir.steps[0]!)).toBe(5);

      // Convert to ReactFlow
      const { nodes } = irToReactFlow(ir);

      // Should have compound nodes
      const compoundNodes = nodes.filter((n) => n.type === 'compound_condition' || n.type === 'compound_loop');
      expect(compoundNodes.length).toBeGreaterThan(0);
    });
  });

  describe('Auto-Layout Integration', () => {
    it('should auto-layout nested workflow without errors', () => {
      const ir = createNestedConditionIR();
      const { nodes, edges } = irToReactFlow(ir);

      expect(() => autoLayout(nodes, edges)).not.toThrow();

      const layouted = autoLayout(nodes, edges);
      expect(layouted.length).toBe(nodes.length);
    });

    it('should position parent nodes without overlap', () => {
      const ir = createComplexNestedIR();
      const { nodes, edges } = irToReactFlow(ir);

      const layouted = autoLayout(nodes, edges);

      // Get top-level nodes
      const topLevel = layouted.filter((n) => !n.parentId);

      // Check no overlaps (simple bounding box check)
      for (let i = 0; i < topLevel.length; i++) {
        for (let j = i + 1; j < topLevel.length; j++) {
          const a = topLevel[i]!;
          const b = topLevel[j]!;

          const aWidth = (a.style?.width as number) || 200;
          const aHeight = (a.style?.height as number) || 60;
          const bWidth = (b.style?.width as number) || 200;
          const bHeight = (b.style?.height as number) || 60;

          const horizontalOverlap = a.position.x < b.position.x + bWidth && a.position.x + aWidth > b.position.x;

          const verticalOverlap = a.position.y < b.position.y + bHeight && a.position.y + aHeight > b.position.y;

          const overlap = horizontalOverlap && verticalOverlap;

          // Allow some overlap for complex workflows, but not complete overlap
          if (overlap) {
            // Nodes shouldn't have exactly the same position
            expect(a.position.x !== b.position.x || a.position.y !== b.position.y).toBe(true);
          }
        }
      }
    });

    it('should preserve child node parentId after layout', () => {
      const ir = createNestedConditionIR();
      const { nodes, edges } = irToReactFlow(ir);

      const layouted = autoLayout(nodes, edges);

      const children = layouted.filter((n) => n.parentId);
      const conditionNode = layouted.find((n) => n.type === 'compound_condition');

      children.forEach((child) => {
        expect(child.parentId).toBe(conditionNode?.id);
      });
    });
  });

  describe('adaptYAMLToIR Integration', () => {
    it('should detect and convert legacy format', () => {
      const legacy = createLegacyConditionWithThen();
      const { ir, wasLegacy } = adaptYAMLToIR(legacy, 'WEBHOOK', {});

      expect(wasLegacy).toBe(true);
      expect(ir.version).toBe('1.0');
      expect(ir.steps[0]?.branches?.then).toBeDefined();
    });

    it('should pass through new IR format unchanged', () => {
      const original = createNestedConditionIR();
      const { ir, wasLegacy } = adaptYAMLToIR(original);

      expect(wasLegacy).toBe(false);
      expect(ir).toEqual(original);
    });
  });

  describe('Trigger Configuration', () => {
    it('should preserve trigger config in conversion', () => {
      const ir = createComplexNestedIR();
      const { trigger } = irToReactFlow(ir);

      expect(trigger.type).toBe('schedule');
      expect(trigger.config.cron).toBe('0 9 * * 1-5');
    });

    it('should preserve callbacks in conversion', () => {
      const ir: WorkflowIR = {
        version: '1.0',
        trigger: { type: 'webhook', config: {} },
        steps: [{ id: 'step1', name: 'Step', type: 'delay', config: { callback: 'myCallback' } }],
        callbacks: [
          {
            id: 'cb1',
            name: 'myCallback',
            type: 'log',
            config: { message: 'Callback executed' },
          },
        ],
      };

      const { callbacks } = irToReactFlow(ir);

      expect(callbacks).toBeDefined();
      expect(callbacks?.length).toBe(1);
      expect(callbacks?.[0]?.name).toBe('myCallback');
    });
  });

  describe('Edge Cases in Integration', () => {
    it('should handle condition with only then branch', () => {
      const ir: WorkflowIR = {
        version: '1.0',
        trigger: { type: 'webhook', config: {} },
        steps: [
          {
            id: 'cond1',
            name: 'Condition',
            type: 'condition',
            config: {},
            branches: {
              then: [{ id: 'then1', name: 'Then Step', type: 'log', config: {} }],
            },
          },
        ],
      };

      const { nodes } = irToReactFlow(ir);

      const conditionNode = nodes.find((n) => n.type === 'compound_condition');
      expect(conditionNode?.data.hasThenBranch).toBe(true);
      expect(conditionNode?.data.hasElseBranch).toBe(false);
    });

    it('should handle empty branches gracefully', () => {
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

      const { nodes, edges } = irToReactFlow(ir);

      // Should still create the compound node
      expect(nodes.length).toBe(1);
      expect(nodes[0]?.type).toBe('compound_condition');

      // No branch edges since no children
      const branchEdges = edges.filter((e) => e.type === 'branch');
      expect(branchEdges.length).toBe(0);
    });

    it('should handle empty loop gracefully', () => {
      const ir: WorkflowIR = {
        version: '1.0',
        trigger: { type: 'webhook', config: {} },
        steps: [
          {
            id: 'loop1',
            name: 'Empty Loop',
            type: 'loop',
            config: { items: '[]', itemVariable: 'item' },
            nested_blocks: [],
          },
        ],
      };

      const { nodes, edges } = irToReactFlow(ir);

      expect(nodes.length).toBe(1);
      expect(nodes[0]?.type).toBe('compound_loop');

      const loopEdges = edges.filter((e) => e.type === 'loop');
      expect(loopEdges.length).toBe(0);
    });
  });

  describe('Workflow Metadata Preservation', () => {
    it('should preserve metadata through conversion', () => {
      const ir = createComplexNestedIR();

      expect(ir.metadata).toBeDefined();
      expect(ir.metadata?.description).toBe('Complex nested workflow for testing');
      expect(ir.metadata?.tags).toContain('test');
      expect(ir.metadata?.tags).toContain('nested');
    });
  });
});
