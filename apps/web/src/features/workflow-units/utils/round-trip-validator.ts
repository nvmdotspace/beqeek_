/**
 * Round-Trip Validation Utility
 *
 * Validates bidirectional conversion between React Flow and YAML formats.
 * Ensures data integrity is preserved through the conversion cycle:
 *
 * React Flow → IR → YAML → IR → React Flow
 *
 * Key validations:
 * - Step IDs match
 * - Step types match
 * - Dependencies preserved
 * - Nested structures (branches, nested_blocks) preserved
 * - Positions within tolerance
 */

import type { Node, Edge } from '@xyflow/react';
import type { WorkflowIR, StepIR, TriggerIR } from './yaml-types';
import { reactFlowToIR } from './reactflow-to-ir';
import { irToReactFlow } from './ir-to-reactflow';
import { serializeWorkflowYAML } from './yaml-serializer';
import { parseWorkflowYAML } from './yaml-parser';

/**
 * Result of round-trip validation
 */
export interface RoundTripValidationResult {
  success: boolean;
  errors: string[];
  warnings: string[];
  /** Original IR before round-trip */
  originalIR: WorkflowIR;
  /** IR after round-trip */
  roundTrippedIR: WorkflowIR;
  /** Differences detected */
  differences: RoundTripDifference[];
}

/**
 * Describes a difference found during round-trip validation
 */
export interface RoundTripDifference {
  type:
    | 'step_missing'
    | 'step_type_mismatch'
    | 'dependency_mismatch'
    | 'branch_mismatch'
    | 'nested_block_mismatch'
    | 'position_drift'
    | 'config_mismatch'
    | 'callback_mismatch';
  path: string;
  expected: unknown;
  actual: unknown;
  severity: 'error' | 'warning';
}

/**
 * Options for round-trip validation
 */
export interface RoundTripValidationOptions {
  /** Maximum allowed position drift in pixels */
  positionTolerance?: number;
  /** Whether to validate config deep equality */
  validateConfig?: boolean;
  /** Whether to validate callbacks */
  validateCallbacks?: boolean;
}

const DEFAULT_OPTIONS: Required<RoundTripValidationOptions> = {
  positionTolerance: 1, // 1 pixel tolerance (positions are rounded)
  validateConfig: true,
  validateCallbacks: true,
};

/**
 * Validate round-trip conversion: React Flow → IR → YAML → IR → React Flow
 *
 * @param nodes - Original React Flow nodes
 * @param edges - Original React Flow edges
 * @param trigger - Workflow trigger configuration
 * @param options - Validation options
 * @returns Validation result with errors and differences
 *
 * @example
 * ```typescript
 * const result = validateRoundTrip(nodes, edges, trigger);
 * if (!result.success) {
 *   console.error('Round-trip errors:', result.errors);
 * }
 * ```
 */
export function validateRoundTrip(
  nodes: Node[],
  edges: Edge[],
  trigger: TriggerIR,
  options?: RoundTripValidationOptions,
): RoundTripValidationResult {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const errors: string[] = [];
  const warnings: string[] = [];
  const differences: RoundTripDifference[] = [];

  // Step 1: Convert React Flow to IR
  let originalIR: WorkflowIR;
  try {
    originalIR = reactFlowToIR(nodes, edges, trigger);
  } catch (error) {
    return {
      success: false,
      errors: [`Failed to convert React Flow to IR: ${(error as Error).message}`],
      warnings: [],
      originalIR: { version: '1.0', trigger, steps: [] },
      roundTrippedIR: { version: '1.0', trigger, steps: [] },
      differences: [],
    };
  }

  // Step 2: Serialize IR to YAML
  let yamlString: string;
  try {
    yamlString = serializeWorkflowYAML(originalIR);
  } catch (error) {
    return {
      success: false,
      errors: [`Failed to serialize IR to YAML: ${(error as Error).message}`],
      warnings: [],
      originalIR,
      roundTrippedIR: { version: '1.0', trigger, steps: [] },
      differences: [],
    };
  }

  // Step 3: Parse YAML back to IR
  let parsedIR: WorkflowIR;
  try {
    parsedIR = parseWorkflowYAML(yamlString);
  } catch (error) {
    return {
      success: false,
      errors: [`Failed to parse YAML back to IR: ${(error as Error).message}`],
      warnings: [],
      originalIR,
      roundTrippedIR: { version: '1.0', trigger, steps: [] },
      differences: [],
    };
  }

  // Step 4: Convert IR back to React Flow
  let roundTrippedResult;
  try {
    roundTrippedResult = irToReactFlow(parsedIR);
  } catch (error) {
    return {
      success: false,
      errors: [`Failed to convert IR back to React Flow: ${(error as Error).message}`],
      warnings: [],
      originalIR,
      roundTrippedIR: parsedIR,
      differences: [],
    };
  }

  // Step 5: Convert back to IR for comparison
  let roundTrippedIR: WorkflowIR;
  try {
    roundTrippedIR = reactFlowToIR(roundTrippedResult.nodes, roundTrippedResult.edges, trigger);
  } catch (error) {
    return {
      success: false,
      errors: [`Failed to convert round-tripped React Flow to IR: ${(error as Error).message}`],
      warnings: [],
      originalIR,
      roundTrippedIR: parsedIR,
      differences: [],
    };
  }

  // Step 6: Compare original IR with round-tripped IR
  compareSteps(originalIR.steps, roundTrippedIR.steps, 'steps', opts, differences);

  // Validate callbacks if enabled
  if (opts.validateCallbacks) {
    compareCallbacks(originalIR.callbacks || [], roundTrippedIR.callbacks || [], differences);
  }

  // Categorize differences
  for (const diff of differences) {
    if (diff.severity === 'error') {
      errors.push(formatDifferenceMessage(diff));
    } else {
      warnings.push(formatDifferenceMessage(diff));
    }
  }

  return {
    success: errors.length === 0,
    errors,
    warnings,
    originalIR,
    roundTrippedIR,
    differences,
  };
}

/**
 * Compare two step arrays recursively
 */
function compareSteps(
  original: StepIR[],
  roundTripped: StepIR[],
  path: string,
  opts: Required<RoundTripValidationOptions>,
  differences: RoundTripDifference[],
): void {
  // Check for missing steps
  const originalIds = new Set(original.map((s) => s.id));
  const roundTrippedIds = new Set(roundTripped.map((s) => s.id));

  for (const id of originalIds) {
    if (!roundTrippedIds.has(id)) {
      differences.push({
        type: 'step_missing',
        path: `${path}[${id}]`,
        expected: id,
        actual: undefined,
        severity: 'error',
      });
    }
  }

  // Compare matching steps
  for (const originalStep of original) {
    const roundTrippedStep = roundTripped.find((s) => s.id === originalStep.id);
    if (!roundTrippedStep) continue;

    const stepPath = `${path}[${originalStep.id}]`;

    // Compare type
    if (originalStep.type !== roundTrippedStep.type) {
      differences.push({
        type: 'step_type_mismatch',
        path: `${stepPath}.type`,
        expected: originalStep.type,
        actual: roundTrippedStep.type,
        severity: 'error',
      });
    }

    // Compare dependencies
    const originalDeps = new Set(originalStep.depends_on || []);
    const roundTrippedDeps = new Set(roundTrippedStep.depends_on || []);

    if (!setsEqual(originalDeps, roundTrippedDeps)) {
      differences.push({
        type: 'dependency_mismatch',
        path: `${stepPath}.depends_on`,
        expected: Array.from(originalDeps),
        actual: Array.from(roundTrippedDeps),
        severity: 'error',
      });
    }

    // Compare config if enabled
    if (opts.validateConfig) {
      if (!deepEqual(originalStep.config, roundTrippedStep.config)) {
        differences.push({
          type: 'config_mismatch',
          path: `${stepPath}.config`,
          expected: originalStep.config,
          actual: roundTrippedStep.config,
          severity: 'warning', // Config may have been transformed
        });
      }
    }

    // Compare position if both have positions
    if (originalStep.position && roundTrippedStep.position) {
      const xDiff = Math.abs(originalStep.position.x - roundTrippedStep.position.x);
      const yDiff = Math.abs(originalStep.position.y - roundTrippedStep.position.y);

      if (xDiff > opts.positionTolerance || yDiff > opts.positionTolerance) {
        differences.push({
          type: 'position_drift',
          path: `${stepPath}.position`,
          expected: originalStep.position,
          actual: roundTrippedStep.position,
          severity: 'warning',
        });
      }
    }

    // Compare branches recursively
    if (originalStep.branches || roundTrippedStep.branches) {
      const originalBranches = originalStep.branches || {};
      const roundTrippedBranches = roundTrippedStep.branches || {};

      // Check then branch
      if (originalBranches.then || roundTrippedBranches.then) {
        if (!originalBranches.then || !roundTrippedBranches.then) {
          differences.push({
            type: 'branch_mismatch',
            path: `${stepPath}.branches.then`,
            expected: originalBranches.then?.length ?? 0,
            actual: roundTrippedBranches.then?.length ?? 0,
            severity: 'error',
          });
        } else {
          compareSteps(
            originalBranches.then,
            roundTrippedBranches.then,
            `${stepPath}.branches.then`,
            opts,
            differences,
          );
        }
      }

      // Check else branch
      if (originalBranches.else || roundTrippedBranches.else) {
        if (!originalBranches.else || !roundTrippedBranches.else) {
          differences.push({
            type: 'branch_mismatch',
            path: `${stepPath}.branches.else`,
            expected: originalBranches.else?.length ?? 0,
            actual: roundTrippedBranches.else?.length ?? 0,
            severity: 'error',
          });
        } else {
          compareSteps(
            originalBranches.else,
            roundTrippedBranches.else,
            `${stepPath}.branches.else`,
            opts,
            differences,
          );
        }
      }
    }

    // Compare nested blocks recursively
    if (originalStep.nested_blocks || roundTrippedStep.nested_blocks) {
      const originalBlocks = originalStep.nested_blocks || [];
      const roundTrippedBlocks = roundTrippedStep.nested_blocks || [];

      if (originalBlocks.length !== roundTrippedBlocks.length) {
        differences.push({
          type: 'nested_block_mismatch',
          path: `${stepPath}.nested_blocks`,
          expected: originalBlocks.length,
          actual: roundTrippedBlocks.length,
          severity: 'error',
        });
      } else {
        compareSteps(originalBlocks, roundTrippedBlocks, `${stepPath}.nested_blocks`, opts, differences);
      }
    }
  }
}

/**
 * Compare callbacks arrays
 */
function compareCallbacks(
  original: WorkflowIR['callbacks'],
  roundTripped: WorkflowIR['callbacks'],
  differences: RoundTripDifference[],
): void {
  const originalCallbacks = original || [];
  const roundTrippedCallbacks = roundTripped || [];

  if (originalCallbacks.length !== roundTrippedCallbacks.length) {
    differences.push({
      type: 'callback_mismatch',
      path: 'callbacks',
      expected: originalCallbacks.length,
      actual: roundTrippedCallbacks.length,
      severity: 'error',
    });
    return;
  }

  // Compare individual callbacks
  const originalIds = new Set(originalCallbacks.map((c) => c.id));
  const roundTrippedIds = new Set(roundTrippedCallbacks.map((c) => c.id));

  for (const id of originalIds) {
    if (!roundTrippedIds.has(id)) {
      differences.push({
        type: 'callback_mismatch',
        path: `callbacks[${id}]`,
        expected: id,
        actual: undefined,
        severity: 'error',
      });
    }
  }
}

/**
 * Format a difference into a human-readable message
 */
function formatDifferenceMessage(diff: RoundTripDifference): string {
  switch (diff.type) {
    case 'step_missing':
      return `Step "${diff.expected}" is missing after round-trip`;
    case 'step_type_mismatch':
      return `${diff.path}: Type changed from "${diff.expected}" to "${diff.actual}"`;
    case 'dependency_mismatch':
      return `${diff.path}: Dependencies changed from [${diff.expected}] to [${diff.actual}]`;
    case 'branch_mismatch':
      return `${diff.path}: Branch count changed from ${diff.expected} to ${diff.actual}`;
    case 'nested_block_mismatch':
      return `${diff.path}: Nested block count changed from ${diff.expected} to ${diff.actual}`;
    case 'position_drift':
      return `${diff.path}: Position drifted from (${JSON.stringify(diff.expected)}) to (${JSON.stringify(diff.actual)})`;
    case 'config_mismatch':
      return `${diff.path}: Config values differ`;
    case 'callback_mismatch':
      return `${diff.path}: Callback mismatch - expected ${diff.expected}, got ${diff.actual}`;
    default:
      return `${diff.path}: Unknown difference`;
  }
}

/**
 * Check if two sets are equal
 */
function setsEqual<T>(a: Set<T>, b: Set<T>): boolean {
  if (a.size !== b.size) return false;
  for (const item of a) {
    if (!b.has(item)) return false;
  }
  return true;
}

/**
 * Deep equality check for objects
 */
function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (a === null || b === null) return a === b;

  if (typeof a === 'object' && typeof b === 'object') {
    const aObj = a as Record<string, unknown>;
    const bObj = b as Record<string, unknown>;
    const aKeys = Object.keys(aObj);
    const bKeys = Object.keys(bObj);

    if (aKeys.length !== bKeys.length) return false;

    for (const key of aKeys) {
      if (!bKeys.includes(key)) return false;
      if (!deepEqual(aObj[key], bObj[key])) return false;
    }

    return true;
  }

  return false;
}

/**
 * Validate IR-only round-trip: IR → YAML → IR
 *
 * Simpler validation that only tests YAML serialization/parsing.
 *
 * @param ir - Original WorkflowIR
 * @returns Validation result
 */
export function validateIRRoundTrip(ir: WorkflowIR): RoundTripValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const differences: RoundTripDifference[] = [];

  // Serialize to YAML
  let yamlString: string;
  try {
    yamlString = serializeWorkflowYAML(ir);
  } catch (error) {
    return {
      success: false,
      errors: [`Failed to serialize IR to YAML: ${(error as Error).message}`],
      warnings: [],
      originalIR: ir,
      roundTrippedIR: { version: '1.0', trigger: ir.trigger, steps: [] },
      differences: [],
    };
  }

  // Parse back to IR
  let parsedIR: WorkflowIR;
  try {
    parsedIR = parseWorkflowYAML(yamlString);
  } catch (error) {
    return {
      success: false,
      errors: [`Failed to parse YAML back to IR: ${(error as Error).message}`],
      warnings: [],
      originalIR: ir,
      roundTrippedIR: { version: '1.0', trigger: ir.trigger, steps: [] },
      differences: [],
    };
  }

  // Compare steps
  compareSteps(ir.steps, parsedIR.steps, 'steps', DEFAULT_OPTIONS, differences);

  // Categorize differences
  for (const diff of differences) {
    if (diff.severity === 'error') {
      errors.push(formatDifferenceMessage(diff));
    } else {
      warnings.push(formatDifferenceMessage(diff));
    }
  }

  return {
    success: errors.length === 0,
    errors,
    warnings,
    originalIR: ir,
    roundTrippedIR: parsedIR,
    differences,
  };
}
