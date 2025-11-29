/**
 * YAML Parser - Converts YAML strings to Intermediate Representation
 *
 * Flow: YAML String → YAML Object → (Legacy Adapter if needed) → Validated IR
 *
 * Supports both:
 * - New format: trigger/steps (React Flow native)
 * - Legacy format: stages/blocks (PHP/Blockly)
 */

import yaml from 'js-yaml';
import { WorkflowIRSchema } from './yaml-schemas';
import { adaptYAMLToIR, isLegacyFormat } from './legacy-yaml-adapter';
import type { WorkflowIR } from './yaml-types';

/**
 * Custom error class for YAML parsing failures
 */
export class YAMLParseError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown,
    public readonly isLegacyFormat?: boolean,
  ) {
    super(message);
    this.name = 'YAMLParseError';
  }
}

/**
 * Options for parsing YAML
 */
export interface ParseOptions {
  /** Event source type for trigger inference (ACTIVE_TABLE, WEBHOOK, etc.) */
  eventSourceType?: string;
  /** Event source params for trigger config */
  eventSourceParams?: Record<string, unknown>;
}

/**
 * Result of parsing YAML
 */
export interface ParseResult {
  /** Validated WorkflowIR object */
  ir: WorkflowIR;
  /** Whether the input was in legacy format */
  wasLegacy: boolean;
}

/**
 * Parse YAML string to validated Intermediate Representation
 *
 * Automatically detects and converts legacy PHP/Blockly format (stages/blocks)
 * to new React Flow format (trigger/steps).
 *
 * @param yamlString - Raw YAML string from event.yamlContent
 * @param options - Optional parsing options (eventSourceType, eventSourceParams)
 * @returns Validated WorkflowIR object
 * @throws {YAMLParseError} If YAML is malformed or validation fails
 *
 * @example
 * ```typescript
 * // New format
 * const ir = parseWorkflowYAML(event.yamlContent);
 *
 * // Legacy format with event context
 * const ir = parseWorkflowYAML(event.yaml, {
 *   eventSourceType: 'ACTIVE_TABLE',
 *   eventSourceParams: { tableId: '123' }
 * });
 * ```
 */
export function parseWorkflowYAML(yamlString: string, options?: ParseOptions): WorkflowIR {
  const result = parseWorkflowYAMLWithInfo(yamlString, options);
  return result.ir;
}

/**
 * Parse YAML with additional info about the format
 *
 * @param yamlString - Raw YAML string
 * @param options - Optional parsing options
 * @returns ParseResult with IR and format info
 */
export function parseWorkflowYAMLWithInfo(yamlString: string, options?: ParseOptions): ParseResult {
  try {
    // Parse YAML to raw object
    const rawYaml = yaml.load(yamlString, {
      // Security: Disable code execution
      schema: yaml.JSON_SCHEMA,
    });

    // Detect format and adapt if needed
    const { ir, wasLegacy } = adaptYAMLToIR(rawYaml, options?.eventSourceType, options?.eventSourceParams);

    // Validate with Zod schema
    const validatedIR = WorkflowIRSchema.parse(ir);

    return {
      ir: validatedIR,
      wasLegacy,
    };
  } catch (error) {
    // Handle YAML syntax errors
    if (error instanceof yaml.YAMLException) {
      throw new YAMLParseError(`YAML syntax error: ${error.message}`, error);
    }

    // Handle Zod validation errors
    if (error && typeof error === 'object' && 'issues' in error) {
      const zodError = error as { issues: Array<{ path: (string | number)[]; message: string }> };
      const issues = zodError.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ');
      throw new YAMLParseError(`YAML validation error: ${issues}`, error);
    }

    // Rethrow unknown errors
    throw error;
  }
}

/**
 * Check if YAML string is in legacy format without full parsing
 */
export function isLegacyYAML(yamlString: string): boolean {
  try {
    const rawYaml = yaml.load(yamlString, { schema: yaml.JSON_SCHEMA });
    return isLegacyFormat(rawYaml);
  } catch {
    return false;
  }
}

/**
 * Validate YAML string without full parsing
 *
 * @param yamlString - Raw YAML string
 * @returns true if valid, false otherwise
 */
export function isValidWorkflowYAML(yamlString: string): boolean {
  try {
    parseWorkflowYAML(yamlString);
    return true;
  } catch {
    return false;
  }
}
