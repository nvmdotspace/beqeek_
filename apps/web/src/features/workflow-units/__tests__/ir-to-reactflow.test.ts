/**
 * Unit tests for IR to React Flow Converter
 */

import { describe, it, expect } from 'vitest';
import { irToReactFlow, calculateGridPosition } from '../utils/ir-to-reactflow';
import type { WorkflowIR } from '../utils/yaml-types';

describe('ir-to-reactflow', () => {
  describe('irToReactFlow', () => {
    it('should convert empty workflow', () => {
      const ir: WorkflowIR = {
        version: '1.0',
        trigger: { type: 'webhook', config: {} },
        steps: [],
      };

      const result = irToReactFlow(ir);
      expect(result.nodes).toEqual([]);
      expect(result.edges).toEqual([]);
      expect(result.trigger).toEqual({ type: 'webhook', config: {} });
    });

    it('should convert single step to node', () => {
      const ir: WorkflowIR = {
        version: '1.0',
        trigger: { type: 'webhook', config: {} },
        steps: [
          {
            id: 'step_1',
            name: 'Test Step',
            type: 'action_log',
            config: { message: 'Hello' },
          },
        ],
      };

      const result = irToReactFlow(ir);
      expect(result.nodes).toHaveLength(1);
      expect(result.nodes[0]).toMatchObject({
        id: 'step_1',
        type: 'action_log',
        data: {
          label: 'Test Step',
          config: { message: 'Hello' },
        },
      });
    });

    it('should convert depends_on to edges', () => {
      const ir: WorkflowIR = {
        version: '1.0',
        trigger: { type: 'webhook', config: {} },
        steps: [
          { id: 'step_1', name: 'First', type: 'action_a', config: {} },
          { id: 'step_2', name: 'Second', type: 'action_b', config: {}, depends_on: ['step_1'] },
        ],
      };

      const result = irToReactFlow(ir);
      expect(result.edges).toHaveLength(1);
      expect(result.edges[0]).toMatchObject({
        id: 'step_1->step_2',
        source: 'step_1',
        target: 'step_2',
        type: 'default',
      });
    });

    it('should handle multiple dependencies', () => {
      const ir: WorkflowIR = {
        version: '1.0',
        trigger: { type: 'webhook', config: {} },
        steps: [
          { id: 'step_1', name: 'First', type: 'action_a', config: {} },
          { id: 'step_2', name: 'Second', type: 'action_b', config: {} },
          { id: 'step_3', name: 'Third', type: 'action_c', config: {}, depends_on: ['step_1', 'step_2'] },
        ],
      };

      const result = irToReactFlow(ir);
      expect(result.edges).toHaveLength(2);
      expect(result.edges.map((e) => e.source)).toContain('step_1');
      expect(result.edges.map((e) => e.source)).toContain('step_2');
    });

    it('should preserve step positions if provided', () => {
      const ir: WorkflowIR = {
        version: '1.0',
        trigger: { type: 'webhook', config: {} },
        steps: [
          {
            id: 'step_1',
            name: 'Positioned',
            type: 'action_log',
            config: {},
            position: { x: 250, y: 350 },
          },
        ],
      };

      const result = irToReactFlow(ir);
      expect(result.nodes[0].position).toEqual({ x: 250, y: 350 });
    });

    it('should auto-calculate positions when not provided', () => {
      const ir: WorkflowIR = {
        version: '1.0',
        trigger: { type: 'webhook', config: {} },
        steps: [
          { id: 'step_1', name: 'First', type: 'action_a', config: {} },
          { id: 'step_2', name: 'Second', type: 'action_b', config: {} },
        ],
      };

      const result = irToReactFlow(ir);
      // Each node should have a position
      expect(result.nodes[0].position).toBeDefined();
      expect(result.nodes[1].position).toBeDefined();
      // Second node should be below first
      expect(result.nodes[1].position.y).toBeGreaterThan(result.nodes[0].position.y);
    });

    it('should return trigger configuration', () => {
      const ir: WorkflowIR = {
        version: '1.0',
        trigger: {
          type: 'schedule',
          config: { cron: '0 9 * * 1-5', timezone: 'UTC' },
        },
        steps: [],
      };

      const result = irToReactFlow(ir);
      expect(result.trigger).toEqual({
        type: 'schedule',
        config: { cron: '0 9 * * 1-5', timezone: 'UTC' },
      });
    });
  });

  describe('calculateGridPosition', () => {
    it('should calculate position for first element', () => {
      const pos = calculateGridPosition(0, 9);
      expect(pos.x).toBe(100); // HORIZONTAL_START
      expect(pos.y).toBe(100); // VERTICAL_START
    });

    it('should create grid layout', () => {
      // For 9 items, should create 3x3 grid (sqrt(9) = 3 columns)
      const positions = Array.from({ length: 9 }, (_, i) => calculateGridPosition(i, 9));

      // First row (indices 0, 1, 2)
      expect(positions[0].y).toBe(positions[1].y);
      expect(positions[1].y).toBe(positions[2].y);

      // Second row (indices 3, 4, 5)
      expect(positions[3].y).toBe(positions[4].y);
      expect(positions[3].y).toBeGreaterThan(positions[0].y);

      // Columns
      expect(positions[0].x).toBeLessThan(positions[1].x);
      expect(positions[1].x).toBeLessThan(positions[2].x);
    });

    it('should handle single item', () => {
      const pos = calculateGridPosition(0, 1);
      expect(pos).toEqual({ x: 100, y: 100 });
    });
  });
});
