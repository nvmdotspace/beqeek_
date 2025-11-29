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

import type { WorkflowIR, StepIR, TriggerIR } from './yaml-types';

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
 * Flatten nested blocks into linear steps array
 *
 * Blockly format can have nested blocks inside blocks.
 * This function flattens them while preserving execution order.
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
 * Convert legacy YAML object to new IR format
 *
 * @param legacyYaml - Parsed legacy YAML object
 * @param eventSourceType - Optional event source type for trigger inference
 * @param eventSourceParams - Optional event source params for trigger config
 * @returns WorkflowIR in new format
 */
export function convertLegacyToIR(
  legacyYaml: LegacyYAML,
  eventSourceType?: string,
  eventSourceParams?: Record<string, unknown>,
): WorkflowIR {
  const allSteps: StepIR[] = [];
  let previousStageLastStep: string | undefined;

  // Process each stage
  for (let stageIndex = 0; stageIndex < legacyYaml.stages.length; stageIndex++) {
    const stage = legacyYaml.stages[stageIndex];
    const stagePrefix = stage?.name || `stage_${stageIndex + 1}`;

    if (!stage) continue;

    // Flatten blocks in this stage
    const stageSteps = flattenBlocks(stage.blocks || [], stagePrefix);

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

    // Track last step for next stage connection
    if (stageSteps.length > 0) {
      previousStageLastStep = stageSteps[stageSteps.length - 1]?.id;
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

  return {
    version: '1.0',
    trigger,
    steps: allSteps,
  };
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
