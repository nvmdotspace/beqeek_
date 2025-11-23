/**
 * Unit tests for React Flow to IR Converter
 */

import { describe, it, expect } from 'vitest';
import type { Node, Edge } from '@xyflow/react';
import { reactFlowToIR } from '../utils/reactflow-to-ir';
import type { TriggerIR } from '../utils/yaml-types';

describe('reactflow-to-ir', () => {
  const defaultTrigger: TriggerIR = { type: 'webhook', config: {} };

  describe('reactFlowToIR', () => {
    it('should convert empty canvas', () => {
      const result = reactFlowToIR([], [], defaultTrigger);
      expect(result.version).toBe('1.0');
      expect(result.trigger).toEqual(defaultTrigger);
      expect(result.steps).toEqual([]);
    });

    it('should convert single node', () => {
      const nodes: Node[] = [
        {
          id: 'node_1',
          type: 'action_log',
          position: { x: 100, y: 200 },
          data: { label: 'Test Node', config: { message: 'Hello' } },
        },
      ];

      const result = reactFlowToIR(nodes, [], defaultTrigger);
      expect(result.steps).toHaveLength(1);
      expect(result.steps[0]).toMatchObject({
        id: 'node_1',
        name: 'Test Node',
        type: 'action_log',
        config: { message: 'Hello' },
        position: { x: 100, y: 200 },
      });
    });

    it('should convert edges to depends_on', () => {
      const nodes: Node[] = [
        { id: 'node_1', type: 'action_a', position: { x: 100, y: 100 }, data: { label: 'First' } },
        { id: 'node_2', type: 'action_b', position: { x: 100, y: 200 }, data: { label: 'Second' } },
      ];
      const edges: Edge[] = [{ id: 'e1', source: 'node_1', target: 'node_2' }];

      const result = reactFlowToIR(nodes, edges, defaultTrigger);
      const secondStep = result.steps.find((s) => s.id === 'node_2');
      expect(secondStep?.depends_on).toEqual(['node_1']);
    });

    it('should handle multiple edges to same target', () => {
      const nodes: Node[] = [
        { id: 'node_1', type: 'action_a', position: { x: 50, y: 100 }, data: { label: 'A' } },
        { id: 'node_2', type: 'action_b', position: { x: 150, y: 100 }, data: { label: 'B' } },
        { id: 'node_3', type: 'action_c', position: { x: 100, y: 200 }, data: { label: 'C' } },
      ];
      const edges: Edge[] = [
        { id: 'e1', source: 'node_1', target: 'node_3' },
        { id: 'e2', source: 'node_2', target: 'node_3' },
      ];

      const result = reactFlowToIR(nodes, edges, defaultTrigger);
      const thirdStep = result.steps.find((s) => s.id === 'node_3');
      expect(thirdStep?.depends_on).toContain('node_1');
      expect(thirdStep?.depends_on).toContain('node_2');
    });

    it('should round positions to avoid floating point issues', () => {
      const nodes: Node[] = [
        {
          id: 'node_1',
          type: 'action_log',
          position: { x: 100.7, y: 200.3 },
          data: { label: 'Test' },
        },
      ];

      const result = reactFlowToIR(nodes, [], defaultTrigger);
      expect(result.steps[0]?.position).toEqual({ x: 101, y: 200 });
    });

    it('should use node id as name if label not provided', () => {
      const nodes: Node[] = [
        {
          id: 'node_1',
          type: 'action_log',
          position: { x: 100, y: 100 },
          data: {},
        },
      ];

      const result = reactFlowToIR(nodes, [], defaultTrigger);
      expect(result.steps[0]?.name).toBe('node_1');
    });

    it('should default config to empty object', () => {
      const nodes: Node[] = [
        {
          id: 'node_1',
          type: 'action_log',
          position: { x: 100, y: 100 },
          data: { label: 'Test' },
        },
      ];

      const result = reactFlowToIR(nodes, [], defaultTrigger);
      expect(result.steps[0]?.config).toEqual({});
    });

    it('should throw error for node missing type', () => {
      const nodes: Node[] = [
        {
          id: 'node_1',
          type: undefined as unknown as string,
          position: { x: 100, y: 100 },
          data: { label: 'Missing Type' },
        },
      ];

      expect(() => reactFlowToIR(nodes, [], defaultTrigger)).toThrow("missing required 'type' field");
    });

    it('should throw error for duplicate node IDs', () => {
      const nodes: Node[] = [
        { id: 'same_id', type: 'action_a', position: { x: 100, y: 100 }, data: { label: 'First' } },
        { id: 'same_id', type: 'action_b', position: { x: 100, y: 200 }, data: { label: 'Second' } },
      ];

      expect(() => reactFlowToIR(nodes, [], defaultTrigger)).toThrow('Duplicate step IDs');
    });

    it('should skip edges with missing source or target', () => {
      const nodes: Node[] = [{ id: 'node_1', type: 'action_a', position: { x: 100, y: 100 }, data: { label: 'Test' } }];
      const edges: Edge[] = [
        { id: 'e1', source: '', target: 'node_1' },
        { id: 'e2', source: 'node_1', target: '' },
      ];

      const result = reactFlowToIR(nodes, edges, defaultTrigger);
      expect(result.steps[0]?.depends_on).toBeUndefined();
    });

    it('should include trigger configuration', () => {
      const trigger: TriggerIR = {
        type: 'schedule',
        config: { cron: '0 9 * * *' },
      };

      const result = reactFlowToIR([], [], trigger);
      expect(result.trigger).toEqual(trigger);
    });

    it('should topologically sort steps', () => {
      // Create nodes in reverse dependency order
      const nodes: Node[] = [
        { id: 'step_3', type: 'action_c', position: { x: 100, y: 300 }, data: { label: 'C' } },
        { id: 'step_2', type: 'action_b', position: { x: 100, y: 200 }, data: { label: 'B' } },
        { id: 'step_1', type: 'action_a', position: { x: 100, y: 100 }, data: { label: 'A' } },
      ];
      const edges: Edge[] = [
        { id: 'e1', source: 'step_1', target: 'step_2' },
        { id: 'e2', source: 'step_2', target: 'step_3' },
      ];

      const result = reactFlowToIR(nodes, edges, defaultTrigger);

      // Steps should be sorted: step_1 → step_2 → step_3
      const stepIds = result.steps.map((s) => s.id);
      expect(stepIds.indexOf('step_1')).toBeLessThan(stepIds.indexOf('step_2'));
      expect(stepIds.indexOf('step_2')).toBeLessThan(stepIds.indexOf('step_3'));
    });
  });
});
