/**
 * Unit Tests for Legacy YAML Adapter - Nested Blocks
 *
 * Tests the conversion from legacy PHP/Blockly format to new IR format
 * with special focus on nested structures (branches, loops).
 */

import { describe, it, expect } from 'vitest';
import { isLegacyFormat, isNewIRFormat, convertLegacyToIR, adaptYAMLToIR } from '../utils/legacy-yaml-adapter';
import {
  createLegacyConditionWithThen,
  createLegacyConditionWithElse,
  createLegacyLoopWithBlocks,
  createDeeplyNestedConditions,
  createComplexLegacyWorkflow,
  createNestedConditionIR,
  getMaxNestingDepth,
  countTotalSteps,
} from './fixtures/nested-workflows';

describe('legacy-yaml-adapter', () => {
  describe('isLegacyFormat', () => {
    it('should detect legacy format with stages', () => {
      const legacy = createLegacyConditionWithThen();
      expect(isLegacyFormat(legacy)).toBe(true);
    });

    it('should reject new IR format', () => {
      const ir = createNestedConditionIR();
      expect(isLegacyFormat(ir)).toBe(false);
    });

    it('should reject null/undefined', () => {
      expect(isLegacyFormat(null)).toBe(false);
      expect(isLegacyFormat(undefined)).toBe(false);
    });

    it('should reject empty object', () => {
      expect(isLegacyFormat({})).toBe(false);
    });

    it('should reject object without stages array', () => {
      expect(isLegacyFormat({ stages: 'not array' })).toBe(false);
    });
  });

  describe('isNewIRFormat', () => {
    it('should detect new IR format with trigger and steps', () => {
      const ir = createNestedConditionIR();
      expect(isNewIRFormat(ir)).toBe(true);
    });

    it('should reject legacy format', () => {
      const legacy = createLegacyConditionWithThen();
      expect(isNewIRFormat(legacy)).toBe(false);
    });

    it('should reject incomplete IR', () => {
      expect(isNewIRFormat({ trigger: {} })).toBe(false);
      expect(isNewIRFormat({ steps: [] })).toBe(false);
    });
  });

  describe('convertLegacyToIR - Condition Branches', () => {
    it('should preserve condition then branch', () => {
      const legacy = createLegacyConditionWithThen();
      const ir = convertLegacyToIR(legacy, 'WEBHOOK', {});

      expect(ir.steps).toHaveLength(1);
      expect(ir.steps[0]?.type).toBe('condition');
      expect(ir.steps[0]?.branches?.then).toBeDefined();
      expect(ir.steps[0]?.branches?.then).toHaveLength(2);
    });

    it('should preserve condition then branch step names', () => {
      const legacy = createLegacyConditionWithThen();
      const ir = convertLegacyToIR(legacy, 'WEBHOOK', {});

      const thenBranch = ir.steps[0]?.branches?.then;
      expect(thenBranch?.[0]?.name).toBe('Log Success');
      expect(thenBranch?.[1]?.name).toBe('Send Email');
    });

    it('should preserve condition then branch step types', () => {
      const legacy = createLegacyConditionWithThen();
      const ir = convertLegacyToIR(legacy, 'WEBHOOK', {});

      const thenBranch = ir.steps[0]?.branches?.then;
      expect(thenBranch?.[0]?.type).toBe('log');
      expect(thenBranch?.[1]?.type).toBe('smtp_email');
    });

    it('should preserve condition else branch', () => {
      const legacy = createLegacyConditionWithElse();
      const ir = convertLegacyToIR(legacy, 'WEBHOOK', {});

      expect(ir.steps[0]?.branches?.else).toBeDefined();
      expect(ir.steps[0]?.branches?.else).toHaveLength(1);
      expect(ir.steps[0]?.branches?.else?.[0]?.name).toBe('Log Failure');
    });

    it('should preserve both then and else branches', () => {
      const legacy = createLegacyConditionWithElse();
      const ir = convertLegacyToIR(legacy, 'WEBHOOK', {});

      const step = ir.steps[0];
      expect(step?.branches?.then).toHaveLength(1);
      expect(step?.branches?.else).toHaveLength(1);
    });

    it('should preserve condition config (expressions)', () => {
      const legacy = createLegacyConditionWithThen();
      const ir = convertLegacyToIR(legacy, 'WEBHOOK', {});

      const config = ir.steps[0]?.config as { expressions?: unknown[] };
      expect(config.expressions).toBeDefined();
      expect(config.expressions).toHaveLength(1);
    });
  });

  describe('convertLegacyToIR - Loop Nested Blocks', () => {
    it('should preserve loop nested blocks', () => {
      const legacy = createLegacyLoopWithBlocks();
      const ir = convertLegacyToIR(legacy, 'ACTIVE_TABLE', { tableId: 'orders' });

      expect(ir.steps).toHaveLength(1);
      expect(ir.steps[0]?.type).toBe('loop');
      expect(ir.steps[0]?.nested_blocks).toHaveLength(3);
    });

    it('should preserve nested block details', () => {
      const legacy = createLegacyLoopWithBlocks();
      const ir = convertLegacyToIR(legacy, 'ACTIVE_TABLE', {});

      const nestedBlocks = ir.steps[0]?.nested_blocks;
      expect(nestedBlocks?.[0]?.name).toBe('Log Order');
      expect(nestedBlocks?.[1]?.name).toBe('Update Order');
      expect(nestedBlocks?.[2]?.name).toBe('Send Confirmation');
    });

    it('should transform loop config (array -> items, iterator -> itemVariable)', () => {
      const legacy = createLegacyLoopWithBlocks();
      const ir = convertLegacyToIR(legacy, 'ACTIVE_TABLE', {});

      const config = ir.steps[0]?.config as { items?: string; itemVariable?: string };
      expect(config.items).toBe('$[orders]');
      expect(config.itemVariable).toBe('order');
    });

    it('should preserve nested block config', () => {
      const legacy = createLegacyLoopWithBlocks();
      const ir = convertLegacyToIR(legacy, 'ACTIVE_TABLE', {});

      const nestedBlocks = ir.steps[0]?.nested_blocks;
      const apiCallConfig = nestedBlocks?.[1]?.config as { url?: string; requestType?: string };
      expect(apiCallConfig.url).toBe('https://api.example.com/orders');
      expect(apiCallConfig.requestType).toBe('POST'); // Transformed from request_type
    });
  });

  describe('convertLegacyToIR - Deep Nesting', () => {
    it('should handle 3 levels of nesting', () => {
      const legacy = createDeeplyNestedConditions(3);
      const ir = convertLegacyToIR(legacy, 'WEBHOOK', {});

      const depth = getMaxNestingDepth(ir.steps[0]!);
      expect(depth).toBe(3);
    });

    it('should handle 5 levels of nesting', () => {
      const legacy = createDeeplyNestedConditions(5);
      const ir = convertLegacyToIR(legacy, 'WEBHOOK', {});

      const depth = getMaxNestingDepth(ir.steps[0]!);
      expect(depth).toBe(5);
    });

    it('should preserve structure at each level', () => {
      const legacy = createDeeplyNestedConditions(3);
      const ir = convertLegacyToIR(legacy, 'WEBHOOK', {});

      // Level 1
      expect(ir.steps[0]?.type).toBe('condition');
      expect(ir.steps[0]?.branches?.then).toHaveLength(1);

      // Level 2
      const level2 = ir.steps[0]?.branches?.then?.[0];
      expect(level2?.type).toBe('condition');
      expect(level2?.branches?.then).toHaveLength(1);

      // Level 3
      const level3 = level2?.branches?.then?.[0];
      expect(level3?.type).toBe('condition');
    });
  });

  describe('convertLegacyToIR - Complex Workflows', () => {
    it('should handle complex workflow with multiple patterns', () => {
      const legacy = createComplexLegacyWorkflow();
      const ir = convertLegacyToIR(legacy, 'SCHEDULE', { cron: '0 9 * * 1-5' });

      // Should have steps from all stages connected
      expect(ir.steps.length).toBeGreaterThan(0);
      expect(ir.trigger.type).toBe('schedule');
    });

    it('should connect stages with depends_on', () => {
      const legacy = createComplexLegacyWorkflow();
      const ir = convertLegacyToIR(legacy, 'WEBHOOK', {});

      // Find steps with depends_on that reference previous stage
      const stepsWithDependencies = ir.steps.filter((s) => s.depends_on && s.depends_on.length > 0);
      expect(stepsWithDependencies.length).toBeGreaterThan(0);
    });

    it('should convert callbacks section', () => {
      const legacy = createComplexLegacyWorkflow();
      const ir = convertLegacyToIR(legacy, 'WEBHOOK', {});

      expect(ir.callbacks).toBeDefined();
      expect(ir.callbacks?.length).toBeGreaterThan(0);
      expect(ir.callbacks?.[0]?.name).toBe('delay_callback');
    });

    it('should preserve nested blocks in callbacks', () => {
      const legacy = createComplexLegacyWorkflow();
      const ir = convertLegacyToIR(legacy, 'WEBHOOK', {});

      expect(ir.callbacks?.[0]?.steps).toBeDefined();
      expect(ir.callbacks?.[0]?.steps?.length).toBeGreaterThan(0);
    });

    it('should handle condition inside loop', () => {
      const legacy = createComplexLegacyWorkflow();
      const ir = convertLegacyToIR(legacy, 'WEBHOOK', {});

      // Find the loop step
      const loopStep = ir.steps.find((s) => s.branches?.then?.some((t) => t.type === 'loop'));

      if (loopStep?.branches?.then) {
        const innerLoop = loopStep.branches.then.find((s) => s.type === 'loop');
        expect(innerLoop?.nested_blocks).toBeDefined();

        // Find condition inside loop
        const innerCondition = innerLoop?.nested_blocks?.find((s) => s.type === 'condition');
        expect(innerCondition?.branches?.then).toBeDefined();
        expect(innerCondition?.branches?.else).toBeDefined();
      }
    });
  });

  describe('convertLegacyToIR - preserveNesting option', () => {
    it('should flatten blocks when preserveNesting is false', () => {
      const legacy = createLegacyConditionWithThen();
      const ir = convertLegacyToIR(legacy, 'WEBHOOK', {}, { preserveNesting: false });

      // With flattening, branches become regular steps
      expect(ir.steps[0]?.branches).toBeUndefined();
      // Steps should include condition + then blocks
      expect(ir.steps.length).toBeGreaterThanOrEqual(3);
    });

    it('should preserve nesting by default', () => {
      const legacy = createLegacyConditionWithThen();
      const ir = convertLegacyToIR(legacy, 'WEBHOOK', {});

      expect(ir.steps[0]?.branches?.then).toBeDefined();
    });

    it('should preserve nesting when explicitly enabled', () => {
      const legacy = createLegacyConditionWithThen();
      const ir = convertLegacyToIR(legacy, 'WEBHOOK', {}, { preserveNesting: true });

      expect(ir.steps[0]?.branches?.then).toBeDefined();
    });
  });

  describe('convertLegacyToIR - Trigger Inference', () => {
    it('should infer webhook trigger', () => {
      const legacy = createLegacyConditionWithThen();
      const ir = convertLegacyToIR(legacy, 'WEBHOOK', {});

      expect(ir.trigger.type).toBe('webhook');
    });

    it('should infer table trigger', () => {
      const legacy = createLegacyConditionWithThen();
      const ir = convertLegacyToIR(legacy, 'ACTIVE_TABLE', { tableId: 'test' });

      expect(ir.trigger.type).toBe('table');
      expect(ir.trigger.config).toEqual({ tableId: 'test' });
    });

    it('should infer schedule trigger', () => {
      const legacy = createLegacyConditionWithThen();
      const ir = convertLegacyToIR(legacy, 'SCHEDULE', { cron: '0 9 * * *' });

      expect(ir.trigger.type).toBe('schedule');
    });

    it('should infer form trigger', () => {
      const legacy = createLegacyConditionWithThen();
      const ir = convertLegacyToIR(legacy, 'OPTIN_FORM', { formId: 'signup' });

      expect(ir.trigger.type).toBe('form');
    });

    it('should default to webhook for unknown type', () => {
      const legacy = createLegacyConditionWithThen();
      const ir = convertLegacyToIR(legacy, 'UNKNOWN_TYPE', {});

      expect(ir.trigger.type).toBe('webhook');
    });
  });

  describe('convertLegacyToIR - Empty Workflows', () => {
    it('should create placeholder for empty stages', () => {
      const legacy = { stages: [] };
      const ir = convertLegacyToIR(legacy, 'WEBHOOK', {});

      expect(ir.steps).toHaveLength(1);
      expect(ir.steps[0]?.type).toBe('log');
      expect(ir.steps[0]?.name).toBe('placeholder');
    });

    it('should create placeholder for stages with empty blocks', () => {
      const legacy = { stages: [{ name: 'empty', blocks: [] }] };
      const ir = convertLegacyToIR(legacy, 'WEBHOOK', {});

      expect(ir.steps).toHaveLength(1);
      expect(ir.steps[0]?.name).toBe('placeholder');
    });
  });

  describe('adaptYAMLToIR', () => {
    it('should return new IR format as-is', () => {
      const ir = createNestedConditionIR();
      const { ir: result, wasLegacy } = adaptYAMLToIR(ir);

      expect(wasLegacy).toBe(false);
      expect(result).toEqual(ir);
    });

    it('should convert legacy format', () => {
      const legacy = createLegacyConditionWithThen();
      const { ir, wasLegacy } = adaptYAMLToIR(legacy, 'WEBHOOK', {});

      expect(wasLegacy).toBe(true);
      expect(ir.steps[0]?.branches?.then).toBeDefined();
    });

    it('should throw for unknown format', () => {
      expect(() => adaptYAMLToIR({ unknown: 'format' })).toThrow('Unknown YAML format');
    });
  });

  describe('Step ID Generation', () => {
    it('should generate unique IDs for nested steps', () => {
      const legacy = createLegacyConditionWithThen();
      const ir = convertLegacyToIR(legacy, 'WEBHOOK', {});

      const allIds = new Set<string>();

      function collectIds(steps: typeof ir.steps): void {
        for (const step of steps) {
          allIds.add(step.id);
          if (step.branches?.then) collectIds(step.branches.then);
          if (step.branches?.else) collectIds(step.branches.else);
          if (step.nested_blocks) collectIds(step.nested_blocks);
        }
      }

      collectIds(ir.steps);

      // All IDs should be unique
      const totalSteps = countTotalSteps(ir.steps);
      expect(allIds.size).toBe(totalSteps);
    });

    it('should include parent context in nested step IDs', () => {
      const legacy = createLegacyConditionWithThen();
      const ir = convertLegacyToIR(legacy, 'WEBHOOK', {});

      const thenStep = ir.steps[0]?.branches?.then?.[0];
      expect(thenStep?.id).toContain('then');
    });
  });
});
