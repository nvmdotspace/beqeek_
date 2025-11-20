/**
 * YAML Serializer - Converts Intermediate Representation to YAML strings
 *
 * Flow: WorkflowIR → Validated IR → YAML String
 */

import yaml from 'js-yaml';
import type { WorkflowIR } from './yaml-types';
import { WorkflowIRSchema } from './yaml-schemas';

/**
 * Custom error class for YAML serialization failures
 */
export class YAMLSerializeError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'YAMLSerializeError';
  }
}

/**
 * Serialize Intermediate Representation to YAML string
 *
 * @param ir - WorkflowIR object to serialize
 * @returns Formatted YAML string
 * @throws {YAMLSerializeError} If validation fails or serialization error
 *
 * @example
 * ```typescript
 * const ir = reactFlowToIR(nodes, edges, trigger);
 * const yamlString = serializeWorkflowYAML(ir);
 * // Save to event.yamlContent
 * ```
 */
export function serializeWorkflowYAML(ir: WorkflowIR): string {
  try {
    // Validate IR structure before serialization
    const validatedIR = WorkflowIRSchema.parse(ir);

    // Convert to YAML string with formatting options
    const yamlString = yaml.dump(validatedIR, {
      // Indentation
      indent: 2,
      // Line width before wrapping
      lineWidth: 120,
      // Disable circular reference aliases
      noRefs: true,
      // Preserve key order (don't sort alphabetically)
      sortKeys: false,
      // Use block style for multiline strings (more readable)
      styles: {
        '!!str': 'literal',
      },
      // Disable document markers (---) for cleaner output
      noCompatMode: false,
    });

    return yamlString;
  } catch (error) {
    // Handle Zod validation errors
    if (error && typeof error === 'object' && 'issues' in error) {
      const zodError = error as { issues: Array<{ path: (string | number)[]; message: string }> };
      const issues = zodError.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ');
      throw new YAMLSerializeError(`IR validation error before serialization: ${issues}`, error);
    }

    // Handle js-yaml errors
    if (error instanceof Error) {
      throw new YAMLSerializeError(`YAML serialization error: ${error.message}`, error);
    }

    // Rethrow unknown errors
    throw error;
  }
}

/**
 * Serialize IR to YAML with custom formatting options
 *
 * @param ir - WorkflowIR object to serialize
 * @param options - Custom yaml.dump options
 * @returns Formatted YAML string
 */
export function serializeWorkflowYAMLWithOptions(ir: WorkflowIR, options?: Partial<yaml.DumpOptions>): string {
  try {
    const validatedIR = WorkflowIRSchema.parse(ir);

    const yamlString = yaml.dump(validatedIR, {
      indent: 2,
      lineWidth: 120,
      noRefs: true,
      sortKeys: false,
      ...options, // Allow custom overrides
    });

    return yamlString;
  } catch (error) {
    if (error && typeof error === 'object' && 'issues' in error) {
      const zodError = error as { issues: Array<{ path: (string | number)[]; message: string }> };
      const issues = zodError.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ');
      throw new YAMLSerializeError(`IR validation error: ${issues}`, error);
    }

    if (error instanceof Error) {
      throw new YAMLSerializeError(`YAML serialization error: ${error.message}`, error);
    }

    throw error;
  }
}
