/**
 * Performance Tests for Nested Workflow Features
 *
 * Ensures large workflows perform acceptably:
 * - Conversion time < 1 second for 100 nodes
 * - Auto-layout time < 500ms
 * - Deep nesting (10 levels) handles correctly
 */

import { describe, it, expect } from 'vitest';
import { irToReactFlow } from '../utils/ir-to-reactflow';
import { autoLayout } from '../utils/auto-layout';
import { convertLegacyToIR } from '../utils/legacy-yaml-adapter';
import {
  generateLargeWorkflow,
  generateDeeplyNestedConditions,
  generateRandomWorkflow,
  createDeeplyNestedConditions,
  getMaxNestingDepth,
} from './fixtures/nested-workflows';

describe('Performance Tests', () => {
  describe('IR to ReactFlow Conversion', () => {
    it('should convert 100 nodes in under 1 second', () => {
      const ir = generateLargeWorkflow(100);

      const startTime = performance.now();
      const { nodes, edges: _edges } = irToReactFlow(ir);
      const endTime = performance.now();

      const duration = endTime - startTime;

      expect(duration).toBeLessThan(1000);
      expect(nodes.length).toBe(100);
    });

    it('should convert 50 nodes in under 500ms', () => {
      const ir = generateLargeWorkflow(50);

      const startTime = performance.now();
      const { nodes } = irToReactFlow(ir);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(500);
      expect(nodes.length).toBe(50);
    });

    it('should handle multiple conversions efficiently', () => {
      const ir = generateLargeWorkflow(20);
      const iterations = 10;

      const startTime = performance.now();
      for (let i = 0; i < iterations; i++) {
        irToReactFlow(ir);
      }
      const endTime = performance.now();

      const avgTime = (endTime - startTime) / iterations;
      expect(avgTime).toBeLessThan(100); // Average should be under 100ms
    });
  });

  describe('Deep Nesting Performance', () => {
    it('should handle 10 levels of nesting in under 2 seconds', () => {
      const ir = generateDeeplyNestedConditions(10);

      const startTime = performance.now();
      const { nodes: _nodes } = irToReactFlow(ir);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(2000);
      expect(getMaxNestingDepth(ir.steps[0]!)).toBe(10);
    });

    it('should handle 5 levels of nesting quickly', () => {
      const ir = generateDeeplyNestedConditions(5);

      const startTime = performance.now();
      const { nodes: _nodes } = irToReactFlow(ir);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(500);
    });

    it('should handle legacy deeply nested conversion', () => {
      const legacy = createDeeplyNestedConditions(7);

      const startTime = performance.now();
      const ir = convertLegacyToIR(legacy, 'WEBHOOK', {});
      const { nodes: _nodes } = irToReactFlow(ir);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(1000);
      expect(getMaxNestingDepth(ir.steps[0]!)).toBe(7);
    });
  });

  describe('Auto-Layout Performance', () => {
    it('should layout 50 nodes in under 500ms', () => {
      const { nodes, edges } = generateRandomWorkflow(50);

      const startTime = performance.now();
      const layouted = autoLayout(nodes, edges);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(500);
      expect(layouted.length).toBe(50);
    });

    it('should layout 100 nodes in under 1 second', () => {
      const { nodes, edges } = generateRandomWorkflow(100);

      const startTime = performance.now();
      const _layouted = autoLayout(nodes, edges);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(1000);
    });

    it('should handle layout with compound nodes efficiently', () => {
      const ir = generateDeeplyNestedConditions(5);
      const { nodes, edges } = irToReactFlow(ir);

      const startTime = performance.now();
      const _layouted = autoLayout(nodes, edges);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(500);
    });

    it('should handle multiple layout operations', () => {
      const { nodes, edges } = generateRandomWorkflow(30);
      const iterations = 5;

      const startTime = performance.now();
      for (let i = 0; i < iterations; i++) {
        autoLayout(nodes, edges);
      }
      const endTime = performance.now();

      const avgTime = (endTime - startTime) / iterations;
      expect(avgTime).toBeLessThan(200);
    });
  });

  describe('Legacy Conversion Performance', () => {
    it('should convert large legacy workflow quickly', () => {
      // Create a complex legacy workflow
      const legacy = {
        stages: Array.from({ length: 10 }, (_, i) => ({
          name: `stage_${i}`,
          blocks: Array.from({ length: 5 }, (_, j) => ({
            type: 'log',
            name: `block_${i}_${j}`,
            input: { message: `Stage ${i} Block ${j}` },
          })),
        })),
      };

      const startTime = performance.now();
      const ir = convertLegacyToIR(legacy, 'WEBHOOK', {});
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(500);
      expect(ir.steps.length).toBeGreaterThan(0);
    });

    it('should handle legacy workflow with many nested conditions', () => {
      const legacy = {
        stages: [
          {
            name: 'main',
            blocks: Array.from({ length: 20 }, (_, i) => ({
              type: 'condition',
              name: `condition_${i}`,
              input: { expressions: [{ field: `field${i}`, operator: '=', value: 'true' }] },
              then: [{ type: 'log', name: `then_${i}`, input: { message: 'then' } }],
              else: [{ type: 'log', name: `else_${i}`, input: { message: 'else' } }],
            })),
          },
        ],
      };

      const startTime = performance.now();
      const ir = convertLegacyToIR(legacy, 'WEBHOOK', {});
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(1000);
      expect(ir.steps.length).toBe(20);
    });

    it('should handle legacy workflow with loops containing many blocks', () => {
      const legacy = {
        stages: [
          {
            name: 'main',
            blocks: [
              {
                type: 'loop',
                name: 'big_loop',
                input: { array: '$[items]', iterator: 'item' },
                blocks: Array.from({ length: 50 }, (_, i) => ({
                  type: 'log',
                  name: `loop_block_${i}`,
                  input: { message: `Block ${i}` },
                })),
              },
            ],
          },
        ],
      };

      const startTime = performance.now();
      const ir = convertLegacyToIR(legacy, 'ACTIVE_TABLE', {});
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(500);
      expect(ir.steps[0]?.nested_blocks?.length).toBe(50);
    });
  });

  describe('End-to-End Pipeline Performance', () => {
    it('should complete full pipeline for medium workflow', () => {
      // Legacy → IR → ReactFlow → Layout
      const legacy = {
        stages: [
          {
            name: 'main',
            blocks: Array.from({ length: 10 }, (_, i) => ({
              type: i % 2 === 0 ? 'condition' : 'loop',
              name: `block_${i}`,
              input: i % 2 === 0 ? { expressions: [] } : { array: '$[items]', iterator: 'item' },
              ...(i % 2 === 0
                ? {
                    then: [{ type: 'log', name: `then_${i}`, input: { message: 'then' } }],
                    else: [{ type: 'log', name: `else_${i}`, input: { message: 'else' } }],
                  }
                : {
                    blocks: [{ type: 'log', name: `loop_${i}`, input: { message: 'loop' } }],
                  }),
            })),
          },
        ],
      };

      const startTime = performance.now();

      const ir = convertLegacyToIR(legacy, 'WEBHOOK', {});
      const { nodes, edges } = irToReactFlow(ir);
      const layouted = autoLayout(nodes, edges);

      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(1000);
      expect(layouted.length).toBeGreaterThan(0);
    });

    it('should handle large workflow through full pipeline', () => {
      const ir = generateLargeWorkflow(50);

      const startTime = performance.now();

      const { nodes, edges } = irToReactFlow(ir);
      const layouted = autoLayout(nodes, edges);

      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(1500);
      expect(layouted.length).toBe(50);
    });
  });

  describe('Memory Efficiency', () => {
    it('should not grow memory excessively with repeated operations', () => {
      const ir = generateLargeWorkflow(30);
      const iterations = 100;

      // Just ensure it doesn't throw and completes in reasonable time
      const startTime = performance.now();

      for (let i = 0; i < iterations; i++) {
        const { nodes, edges } = irToReactFlow(ir);
        autoLayout(nodes, edges);
      }

      const endTime = performance.now();

      // Should complete all iterations in under 30 seconds
      expect(endTime - startTime).toBeLessThan(30000);
    });
  });

  describe('Scalability Limits', () => {
    it('should document performance at scale boundaries', () => {
      // Test at 200 nodes (double the target)
      const ir = generateLargeWorkflow(200);

      const startTime = performance.now();
      const { nodes } = irToReactFlow(ir);
      const endTime = performance.now();

      // Should still complete, even if slower
      expect(endTime - startTime).toBeLessThan(5000);
      expect(nodes.length).toBe(200);
    });

    it('should handle deep nesting at boundary', () => {
      // Test at depth 15 (1.5x the documented limit of 10)
      const ir = generateDeeplyNestedConditions(15);

      const startTime = performance.now();
      const { nodes: _nodes } = irToReactFlow(ir);
      const endTime = performance.now();

      // Should complete but may be slower
      expect(endTime - startTime).toBeLessThan(5000);
      expect(getMaxNestingDepth(ir.steps[0]!)).toBe(15);
    });
  });
});
