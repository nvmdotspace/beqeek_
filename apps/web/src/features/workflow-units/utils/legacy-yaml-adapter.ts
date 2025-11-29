/**
 * Legacy YAML Adapter - Converts PHP/Blockly YAML format to new IR format
 *
 * PHP/Blockly format (stages/blocks):
 * ```yaml
 * stages:
 *   - name: stage_name
 *     blocks:
 *       - type: log
 *         name: step_name
 *         input:
 *           message: "..."
 *         blocks:
 *           - type: nested_block
 *             ...
 * ```
 *
 * New IR format (trigger/steps):
 * ```yaml
 * version: '1.0'
 * trigger:
 *   type: table
 *   config: {}
 * steps:
 *   - id: step_1
 *     name: step_name
 *     type: log
 *     config:
 *       message: "..."
 * ```
 */

import type { WorkflowIR, StepIR, TriggerIR, CallbackIR } from './yaml-types';

/**
 * Legacy block structure from PHP/Blockly
 */
interface LegacyBlock {
  type: string;
  name: string;
  input?: Record<string, unknown>;
  blocks?: LegacyBlock[];
  then?: LegacyBlock[];
  else?: LegacyBlock[];
}

/**
 * Legacy stage structure from PHP/Blockly
 */
interface LegacyStage {
  name: string;
  blocks: LegacyBlock[];
}

/**
 * Legacy YAML structure from PHP/Blockly
 */
interface LegacyYAML {
  stages: LegacyStage[];
  callbacks?: LegacyBlock[];
}

/**
 * Check if YAML object is in legacy format (has stages array)
 */
export function isLegacyFormat(yamlObj: unknown): yamlObj is LegacyYAML {
  return (
    typeof yamlObj === 'object' &&
    yamlObj !== null &&
    'stages' in yamlObj &&
    Array.isArray((yamlObj as LegacyYAML).stages)
  );
}

/**
 * Check if YAML object is in new IR format (has trigger and steps)
 */
export function isNewIRFormat(yamlObj: unknown): boolean {
  return typeof yamlObj === 'object' && yamlObj !== null && 'trigger' in yamlObj && 'steps' in yamlObj;
}

/**
 * Generate unique step ID
 */
function generateStepId(type: string, index: number): string {
  // Sanitize type for ID (remove special chars, lowercase)
  const sanitizedType = type.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
  return `${sanitizedType}_${index}`;
}

/**
 * Counter for generating unique step IDs within a conversion session
 */
let stepCounter = 0;

/**
 * Reset the step counter (used at the start of each conversion)
 */
function resetStepCounter(): void {
  stepCounter = 0;
}

/**
 * Flatten nested blocks into linear steps array (LEGACY - for backward compatibility)
 *
 * Blockly format can have nested blocks inside blocks.
 * This function flattens them while preserving execution order.
 *
 * @deprecated Use convertBlocksPreservingNesting for compound nodes
 */
function flattenBlocks(blocks: LegacyBlock[], prefix: string = ''): StepIR[] {
  const steps: StepIR[] = [];
  let counter = 0;

  function processBlock(block: LegacyBlock, parentDepends?: string): void {
    counter++;
    const stepId = prefix ? `${prefix}_${counter}` : generateStepId(block.type, counter);

    // Create step from block
    const step: StepIR = {
      id: stepId,
      name: block.name || `step_${counter}`,
      type: mapBlockType(block.type),
      config: mapBlockInputToConfig(block.type, block.input || {}),
    };

    // Add dependency on parent if exists
    if (parentDepends) {
      step.depends_on = [parentDepends];
    }

    steps.push(step);

    // Process nested blocks (children execute after parent)
    if (block.blocks && block.blocks.length > 0) {
      for (const nestedBlock of block.blocks) {
        processBlock(nestedBlock, stepId);
      }
    }

    // Process then/else branches for conditions
    if (block.then && block.then.length > 0) {
      for (const thenBlock of block.then) {
        processBlock(thenBlock, stepId);
      }
    }
    if (block.else && block.else.length > 0) {
      for (const elseBlock of block.else) {
        processBlock(elseBlock, stepId);
      }
    }
  }

  for (const block of blocks) {
    processBlock(block);
  }

  return steps;
}

/**
 * Convert blocks while preserving nested structure for compound nodes
 *
 * This function converts legacy blocks to StepIR while preserving:
 * - branches (then/else) for condition blocks
 * - nested_blocks for loop and match blocks
 *
 * @param blocks - Array of legacy blocks to convert
 * @param prefix - Optional prefix for step IDs
 * @returns Array of StepIR with preserved nesting
 */
function convertBlocksPreservingNesting(blocks: LegacyBlock[], prefix: string = ''): StepIR[] {
  const steps: StepIR[] = [];

  for (const block of blocks) {
    stepCounter++;
    const stepId = prefix ? `${prefix}_${stepCounter}` : generateStepId(block.type, stepCounter);

    // Create base step from block
    const step: StepIR = {
      id: stepId,
      name: block.name || `step_${stepCounter}`,
      type: mapBlockType(block.type),
      config: mapBlockInputToConfig(block.type, block.input || {}),
    };

    // Handle condition blocks - preserve then/else as branches
    if (block.type === 'condition') {
      const branches: StepIR['branches'] = {};

      if (block.then && block.then.length > 0) {
        branches.then = convertBlocksPreservingNesting(block.then, `${stepId}_then`);
      }

      if (block.else && block.else.length > 0) {
        branches.else = convertBlocksPreservingNesting(block.else, `${stepId}_else`);
      }

      // Only add branches if at least one exists
      if (branches.then || branches.else) {
        step.branches = branches;
      }
    }

    // Handle loop blocks - preserve blocks as nested_blocks
    if (block.type === 'loop' && block.blocks && block.blocks.length > 0) {
      step.nested_blocks = convertBlocksPreservingNesting(block.blocks, `${stepId}_loop`);
    }

    // Handle match blocks - preserve blocks as nested_blocks
    if (block.type === 'match' && block.blocks && block.blocks.length > 0) {
      step.nested_blocks = convertBlocksPreservingNesting(block.blocks, `${stepId}_match`);
    }

    // Handle regular nested blocks (non-branching containers)
    // These become sequential dependencies in the parent's context
    if (block.blocks && block.blocks.length > 0 && !['condition', 'loop', 'match'].includes(block.type)) {
      // For non-compound blocks, nested children become siblings after parent
      const nestedSteps = convertBlocksPreservingNesting(block.blocks, `${stepId}_nested`);

      // First nested step depends on parent
      if (nestedSteps.length > 0 && nestedSteps[0]) {
        nestedSteps[0].depends_on = [stepId];
      }

      // Add nested steps after current step
      steps.push(step);
      steps.push(...nestedSteps);
      continue;
    }

    steps.push(step);
  }

  return steps;
}

/**
 * Map legacy block type to new node type
 */
function mapBlockType(legacyType: string): string {
  const typeMap: Record<string, string> = {
    // Actions
    table: 'table_operation',
    table_operation: 'table_operation',
    smtp_email: 'smtp_email',
    google_sheet: 'google_sheet',
    api_call: 'api_call',
    user_operation: 'user_operation',
    delay: 'delay',
    log: 'log',

    // Logic
    condition: 'condition',
    match: 'match',
    loop: 'loop',
    math: 'math',
    definition: 'definition',

    // Comments
    table_comment_create: 'table_comment_create',
    table_comment_get: 'table_comment_get',
  };

  return typeMap[legacyType] || legacyType;
}

/**
 * Map legacy block input to new config format
 *
 * Legacy format uses 'input' with specific keys
 * New format uses 'config' with normalized keys
 */
function mapBlockInputToConfig(type: string, input: Record<string, unknown>): Record<string, unknown> {
  // Most inputs can be passed through directly
  const config = { ...input };

  // Type-specific transformations
  switch (type) {
    case 'table':
    case 'table_operation':
      // Rename 'record' to 'recordId' if present as string reference
      if (typeof config.record === 'string' && config.record.includes('{{')) {
        // Keep as is - it's a template variable
      }
      break;

    case 'api_call':
      // Normalize request_type to requestType
      if ('request_type' in config) {
        config.requestType = config.request_type;
        delete config.request_type;
      }
      // Normalize response_format to responseFormat
      if ('response_format' in config) {
        config.responseFormat = config.response_format;
        delete config.response_format;
      }
      break;

    case 'delay':
      // Duration is already in correct format
      // Preserve callback field for linking to callbacks section
      if ('callback' in config) {
        // Keep callback as-is - it references a callback by name
      }
      break;

    case 'loop':
      // Rename 'array' to 'items' and 'iterator' to 'itemVariable'
      if ('array' in config) {
        config.items = config.array;
        delete config.array;
      }
      if ('iterator' in config) {
        config.itemVariable = config.iterator;
        delete config.iterator;
      }
      break;

    case 'condition':
      // Expressions format is compatible
      break;

    case 'match':
      // Cases format is compatible
      break;
  }

  return config;
}

/**
 * Infer trigger type from event source type
 */
function inferTriggerType(eventSourceType?: string): TriggerIR['type'] {
  const typeMap: Record<string, TriggerIR['type']> = {
    ACTIVE_TABLE: 'table',
    WEBHOOK: 'webhook',
    OPTIN_FORM: 'form',
    SCHEDULE: 'schedule',
  };

  return typeMap[eventSourceType || ''] || 'webhook';
}

/**
 * Convert a single legacy callback block to CallbackIR format
 */
function convertCallbackBlock(block: LegacyBlock, index: number, preserveNesting: boolean = true): CallbackIR {
  const callbackId = block.name || `callback_${index + 1}`;

  // Convert nested blocks if present
  const nestedSteps: StepIR[] = [];
  if (block.blocks && block.blocks.length > 0) {
    const convertedSteps = preserveNesting
      ? convertBlocksPreservingNesting(block.blocks, callbackId)
      : flattenBlocks(block.blocks, callbackId);
    nestedSteps.push(...convertedSteps);
  }

  return {
    id: callbackId,
    name: block.name || `callback_${index + 1}`,
    type: mapBlockType(block.type),
    config: mapBlockInputToConfig(block.type, block.input || {}),
    steps: nestedSteps.length > 0 ? nestedSteps : undefined,
  };
}

/**
 * Options for legacy YAML conversion
 */
export interface ConvertLegacyOptions {
  /** Preserve nested structure for compound nodes (default: true) */
  preserveNesting?: boolean;
}

/**
 * Convert legacy YAML object to new IR format
 *
 * @param legacyYaml - Parsed legacy YAML object
 * @param eventSourceType - Optional event source type for trigger inference
 * @param eventSourceParams - Optional event source params for trigger config
 * @param options - Optional conversion options
 * @returns WorkflowIR in new format
 */
export function convertLegacyToIR(
  legacyYaml: LegacyYAML,
  eventSourceType?: string,
  eventSourceParams?: Record<string, unknown>,
  options?: ConvertLegacyOptions,
): WorkflowIR {
  const preserveNesting = options?.preserveNesting ?? true;

  // Reset step counter for fresh conversion
  resetStepCounter();

  const allSteps: StepIR[] = [];
  let previousStageLastStep: string | undefined;

  // Process each stage
  for (let stageIndex = 0; stageIndex < legacyYaml.stages.length; stageIndex++) {
    const stage = legacyYaml.stages[stageIndex];
    const stagePrefix = stage?.name || `stage_${stageIndex + 1}`;

    if (!stage) continue;

    // Convert blocks - use preserveNesting or flatten based on option
    const stageSteps = preserveNesting
      ? convertBlocksPreservingNesting(stage.blocks || [], stagePrefix)
      : flattenBlocks(stage.blocks || [], stagePrefix);

    // Connect first step of this stage to last step of previous stage
    if (previousStageLastStep && stageSteps.length > 0 && stageSteps[0]) {
      if (!stageSteps[0].depends_on) {
        stageSteps[0].depends_on = [];
      }
      if (!stageSteps[0].depends_on.includes(previousStageLastStep)) {
        stageSteps[0].depends_on.push(previousStageLastStep);
      }
    }

    allSteps.push(...stageSteps);

    // Track last step for next stage connection (find the last top-level step)
    if (stageSteps.length > 0) {
      previousStageLastStep = stageSteps[stageSteps.length - 1]?.id;
    }
  }

  // Process callbacks section (for delay blocks)
  const callbacks: CallbackIR[] = [];
  if (legacyYaml.callbacks && legacyYaml.callbacks.length > 0) {
    for (let i = 0; i < legacyYaml.callbacks.length; i++) {
      const callbackBlock = legacyYaml.callbacks[i];
      if (callbackBlock) {
        callbacks.push(convertCallbackBlock(callbackBlock, i, preserveNesting));
      }
    }
  }

  // Create trigger from event source
  const trigger: TriggerIR = {
    type: inferTriggerType(eventSourceType),
    config: eventSourceParams || {},
  };

  // Ensure we have at least one step
  if (allSteps.length === 0) {
    allSteps.push({
      id: 'placeholder_1',
      name: 'placeholder',
      type: 'log',
      config: {
        message: 'Empty workflow - add steps',
        level: 'info',
      },
    });
  }

  const result: WorkflowIR = {
    version: '1.0',
    trigger,
    steps: allSteps,
  };

  // Only include callbacks if there are any
  if (callbacks.length > 0) {
    result.callbacks = callbacks;
  }

  return result;
}

/**
 * Detect format and convert to IR if needed
 *
 * @param yamlObj - Parsed YAML object (could be legacy or new format)
 * @param eventSourceType - Optional event source type
 * @param eventSourceParams - Optional event source params
 * @returns WorkflowIR in new format
 */
export function adaptYAMLToIR(
  yamlObj: unknown,
  eventSourceType?: string,
  eventSourceParams?: Record<string, unknown>,
): { ir: WorkflowIR; wasLegacy: boolean } {
  // Check if already in new format
  if (isNewIRFormat(yamlObj)) {
    return {
      ir: yamlObj as WorkflowIR,
      wasLegacy: false,
    };
  }

  // Check if in legacy format
  if (isLegacyFormat(yamlObj)) {
    const ir = convertLegacyToIR(yamlObj, eventSourceType, eventSourceParams);
    return {
      ir,
      wasLegacy: true,
    };
  }

  // Unknown format - throw error
  throw new Error('Unknown YAML format: expected either stages (legacy) or trigger/steps (new)');
}
