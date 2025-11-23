/**
 * Unit tests for Topological Sort
 */

import { describe, it, expect } from 'vitest';
import {
  topologicalSort,
  buildDependencyMap,
  validateUniqueStepIds,
  CircularDependencyError,
} from '../utils/topological-sort';
import type { StepIR } from '../utils/yaml-types';

describe('topological-sort', () => {
  describe('topologicalSort', () => {
    it('should sort steps with no dependencies', () => {
      const steps: StepIR[] = [
        { id: 'step_1', name: 'A', type: 'action_a', config: {} },
        { id: 'step_2', name: 'B', type: 'action_b', config: {} },
        { id: 'step_3', name: 'C', type: 'action_c', config: {} },
      ];
      const depMap = buildDependencyMap(steps);

      const sorted = topologicalSort(steps, depMap);
      expect(sorted).toHaveLength(3);
      // All steps should be in output
      expect(sorted.map((s) => s.id)).toContain('step_1');
      expect(sorted.map((s) => s.id)).toContain('step_2');
      expect(sorted.map((s) => s.id)).toContain('step_3');
    });

    it('should sort linear dependency chain', () => {
      const steps: StepIR[] = [
        { id: 'step_3', name: 'C', type: 'action_c', config: {}, depends_on: ['step_2'] },
        { id: 'step_1', name: 'A', type: 'action_a', config: {} },
        { id: 'step_2', name: 'B', type: 'action_b', config: {}, depends_on: ['step_1'] },
      ];
      const depMap = buildDependencyMap(steps);

      const sorted = topologicalSort(steps, depMap);
      const ids = sorted.map((s) => s.id);

      // step_1 must come before step_2, step_2 must come before step_3
      expect(ids.indexOf('step_1')).toBeLessThan(ids.indexOf('step_2'));
      expect(ids.indexOf('step_2')).toBeLessThan(ids.indexOf('step_3'));
    });

    it('should sort diamond dependency pattern', () => {
      //     step_1
      //    /      \
      // step_2   step_3
      //    \      /
      //     step_4
      const steps: StepIR[] = [
        { id: 'step_4', name: 'D', type: 'action_d', config: {}, depends_on: ['step_2', 'step_3'] },
        { id: 'step_2', name: 'B', type: 'action_b', config: {}, depends_on: ['step_1'] },
        { id: 'step_3', name: 'C', type: 'action_c', config: {}, depends_on: ['step_1'] },
        { id: 'step_1', name: 'A', type: 'action_a', config: {} },
      ];
      const depMap = buildDependencyMap(steps);

      const sorted = topologicalSort(steps, depMap);
      const ids = sorted.map((s) => s.id);

      // step_1 must come before step_2 and step_3
      expect(ids.indexOf('step_1')).toBeLessThan(ids.indexOf('step_2'));
      expect(ids.indexOf('step_1')).toBeLessThan(ids.indexOf('step_3'));
      // step_2 and step_3 must come before step_4
      expect(ids.indexOf('step_2')).toBeLessThan(ids.indexOf('step_4'));
      expect(ids.indexOf('step_3')).toBeLessThan(ids.indexOf('step_4'));
    });

    it('should detect simple circular dependency', () => {
      const steps: StepIR[] = [
        { id: 'step_1', name: 'A', type: 'action_a', config: {}, depends_on: ['step_2'] },
        { id: 'step_2', name: 'B', type: 'action_b', config: {}, depends_on: ['step_1'] },
      ];
      const depMap = buildDependencyMap(steps);

      expect(() => topologicalSort(steps, depMap)).toThrow(CircularDependencyError);
    });

    it('should detect self-dependency cycle', () => {
      const steps: StepIR[] = [{ id: 'step_1', name: 'A', type: 'action_a', config: {}, depends_on: ['step_1'] }];
      const depMap = buildDependencyMap(steps);

      expect(() => topologicalSort(steps, depMap)).toThrow(CircularDependencyError);
    });

    it('should detect longer circular dependency chain', () => {
      // step_1 → step_2 → step_3 → step_1 (cycle)
      const steps: StepIR[] = [
        { id: 'step_1', name: 'A', type: 'action_a', config: {}, depends_on: ['step_3'] },
        { id: 'step_2', name: 'B', type: 'action_b', config: {}, depends_on: ['step_1'] },
        { id: 'step_3', name: 'C', type: 'action_c', config: {}, depends_on: ['step_2'] },
      ];
      const depMap = buildDependencyMap(steps);

      expect(() => topologicalSort(steps, depMap)).toThrow(CircularDependencyError);
    });

    it('should include cycle information in error', () => {
      const steps: StepIR[] = [
        { id: 'step_1', name: 'A', type: 'action_a', config: {}, depends_on: ['step_2'] },
        { id: 'step_2', name: 'B', type: 'action_b', config: {}, depends_on: ['step_1'] },
      ];
      const depMap = buildDependencyMap(steps);

      try {
        topologicalSort(steps, depMap);
        expect.fail('Should have thrown CircularDependencyError');
      } catch (error) {
        expect(error).toBeInstanceOf(CircularDependencyError);
        const cyclicError = error as CircularDependencyError;
        expect(cyclicError.cycle).toContain('step_1');
        expect(cyclicError.cycle).toContain('step_2');
      }
    });

    it('should throw error for non-existent dependency', () => {
      const steps: StepIR[] = [{ id: 'step_1', name: 'A', type: 'action_a', config: {}, depends_on: ['non_existent'] }];
      const depMap = buildDependencyMap(steps);

      expect(() => topologicalSort(steps, depMap)).toThrow('non-existent step');
    });

    it('should handle empty steps array', () => {
      const sorted = topologicalSort([], new Map());
      expect(sorted).toEqual([]);
    });

    it('should handle disconnected components', () => {
      // Two separate chains with no connection
      const steps: StepIR[] = [
        { id: 'chain1_a', name: 'C1A', type: 'action_a', config: {} },
        { id: 'chain1_b', name: 'C1B', type: 'action_b', config: {}, depends_on: ['chain1_a'] },
        { id: 'chain2_a', name: 'C2A', type: 'action_a', config: {} },
        { id: 'chain2_b', name: 'C2B', type: 'action_b', config: {}, depends_on: ['chain2_a'] },
      ];
      const depMap = buildDependencyMap(steps);

      const sorted = topologicalSort(steps, depMap);
      expect(sorted).toHaveLength(4);

      const ids = sorted.map((s) => s.id);
      // Within each chain, dependencies must be respected
      expect(ids.indexOf('chain1_a')).toBeLessThan(ids.indexOf('chain1_b'));
      expect(ids.indexOf('chain2_a')).toBeLessThan(ids.indexOf('chain2_b'));
    });
  });

  describe('buildDependencyMap', () => {
    it('should build map from steps with dependencies', () => {
      const steps: StepIR[] = [
        { id: 'step_1', name: 'A', type: 'action_a', config: {} },
        { id: 'step_2', name: 'B', type: 'action_b', config: {}, depends_on: ['step_1'] },
        { id: 'step_3', name: 'C', type: 'action_c', config: {}, depends_on: ['step_1', 'step_2'] },
      ];

      const map = buildDependencyMap(steps);
      expect(map.get('step_2')).toEqual(['step_1']);
      expect(map.get('step_3')).toEqual(['step_1', 'step_2']);
      expect(map.has('step_1')).toBe(false); // No dependencies
    });

    it('should return empty map for steps without dependencies', () => {
      const steps: StepIR[] = [
        { id: 'step_1', name: 'A', type: 'action_a', config: {} },
        { id: 'step_2', name: 'B', type: 'action_b', config: {} },
      ];

      const map = buildDependencyMap(steps);
      expect(map.size).toBe(0);
    });

    it('should ignore empty depends_on arrays', () => {
      const steps: StepIR[] = [{ id: 'step_1', name: 'A', type: 'action_a', config: {}, depends_on: [] }];

      const map = buildDependencyMap(steps);
      expect(map.size).toBe(0);
    });
  });

  describe('validateUniqueStepIds', () => {
    it('should pass for unique step IDs', () => {
      const steps: StepIR[] = [
        { id: 'step_1', name: 'A', type: 'action_a', config: {} },
        { id: 'step_2', name: 'B', type: 'action_b', config: {} },
        { id: 'step_3', name: 'C', type: 'action_c', config: {} },
      ];

      expect(() => validateUniqueStepIds(steps)).not.toThrow();
    });

    it('should throw for duplicate step IDs', () => {
      const steps: StepIR[] = [
        { id: 'duplicate', name: 'A', type: 'action_a', config: {} },
        { id: 'unique', name: 'B', type: 'action_b', config: {} },
        { id: 'duplicate', name: 'C', type: 'action_c', config: {} },
      ];

      expect(() => validateUniqueStepIds(steps)).toThrow('Duplicate step IDs');
      expect(() => validateUniqueStepIds(steps)).toThrow('duplicate');
    });

    it('should pass for empty array', () => {
      expect(() => validateUniqueStepIds([])).not.toThrow();
    });

    it('should pass for single step', () => {
      const steps: StepIR[] = [{ id: 'only_one', name: 'A', type: 'action_a', config: {} }];
      expect(() => validateUniqueStepIds(steps)).not.toThrow();
    });
  });

  describe('CircularDependencyError', () => {
    it('should have correct name property', () => {
      const error = new CircularDependencyError('Test error', ['a', 'b', 'a']);
      expect(error.name).toBe('CircularDependencyError');
    });

    it('should preserve cycle information', () => {
      const cycle = ['step_1', 'step_2', 'step_3', 'step_1'];
      const error = new CircularDependencyError('Cycle detected', cycle);
      expect(error.cycle).toEqual(cycle);
    });
  });
});
