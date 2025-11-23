/**
 * YAML Parser - Converts YAML strings to Intermediate Representation
 *
 * Flow: YAML String → YAML Object → Validated IR
 */

import yaml from 'js-yaml';
import { WorkflowIRSchema } from './yaml-schemas';
import type { WorkflowIR } from './yaml-types';

/**
 * Custom error class for YAML parsing failures
 */
export class YAMLParseError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'YAMLParseError';
  }
}

/**
 * Parse YAML string to validated Intermediate Representation
 *
 * @param yamlString - Raw YAML string from event.yamlContent
 * @returns Validated WorkflowIR object
 * @throws {YAMLParseError} If YAML is malformed or validation fails
 *
 * @example
 * ```typescript
 * const ir = parseWorkflowYAML(event.yamlContent);
 * console.log(ir.steps.length); // Number of workflow steps
 * ```
 */
export function parseWorkflowYAML(yamlString: string): WorkflowIR {
  try {
    // Parse YAML to raw object
    const rawYaml = yaml.load(yamlString, {
      // Security: Disable code execution
      schema: yaml.JSON_SCHEMA,
    });

    // Validate with Zod schema
    const ir = WorkflowIRSchema.parse(rawYaml);

    return ir;
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
