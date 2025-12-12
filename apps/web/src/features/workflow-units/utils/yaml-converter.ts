/**
 * YAML Converter - Public API for YAML ↔ React Flow conversion
 *
 * This module provides the main public interface for converting between
 * YAML workflow definitions and React Flow nodes/edges.
 *
 * @example
 * ```typescript
 * // Load YAML from API into canvas
 * const { nodes, edges, trigger } = yamlToReactFlow(event.yamlContent);
 * setNodes(nodes);
 * setEdges(edges);
 *
 * // Save canvas to YAML for API
 * const yamlContent = reactFlowToYAML(nodes, edges, trigger);
 * updateWorkflowEvent({ yamlContent });
 * ```
 */

import type { Node, Edge } from '@xyflow/react';
import { parseWorkflowYAMLWithInfo, type ParseOptions } from './yaml-parser';
import { irToReactFlow } from './ir-to-reactflow';
import { reactFlowToIR } from './reactflow-to-ir';
import { serializeWorkflowYAML } from './yaml-serializer';
import type { WorkflowIR, TriggerIR, CallbackIR } from './yaml-types';

/**
 * Options for YAML to React Flow conversion
 */
export type YAMLToReactFlowOptions = ParseOptions;

/**
 * Result of YAML to React Flow conversion
 */
export interface YAMLToReactFlowResult {
  /** React Flow nodes for canvas */
  nodes: Node[];
  /** React Flow edges for canvas */
  edges: Edge[];
  /** Trigger configuration */
  trigger: TriggerIR;
  /** Callback definitions (for delay blocks) */
  callbacks?: CallbackIR[];
  /** Original IR for reference */
  ir: WorkflowIR;
  /** Whether the input was in legacy format */
  wasLegacy: boolean;
}

/**
 * Convert YAML string to React Flow nodes and edges
 *
 * Complete pipeline: YAML String → IR → React Flow
 *
 * Supports both:
 * - New format: trigger/steps (React Flow native)
 * - Legacy format: stages/blocks (PHP/Blockly) - auto-converted
 *
 * @param yamlString - Raw YAML workflow definition
 * @param options - Optional conversion options (eventSourceType, eventSourceParams)
 * @returns Object with nodes, edges, trigger, IR, and wasLegacy flag
 * @throws {YAMLParseError} If YAML is invalid
 * @throws {Error} If conversion fails
 *
 * @example
 * ```typescript
 * // Basic usage
 * const { nodes, edges, trigger } = yamlToReactFlow(event.yamlContent);
 *
 * // With event context for legacy format
 * const { nodes, edges, trigger, wasLegacy } = yamlToReactFlow(event.yaml, {
 *   eventSourceType: event.eventSourceType,
 *   eventSourceParams: event.eventSourceParams
 * });
 * if (wasLegacy) {
 *   toast.info('Workflow converted from legacy format');
 * }
 * ```
 */
export function yamlToReactFlow(yamlString: string, options?: YAMLToReactFlowOptions): YAMLToReactFlowResult {
  // Parse YAML → IR with validation (handles legacy format automatically)
  const { ir, wasLegacy } = parseWorkflowYAMLWithInfo(yamlString, options);

  // Convert IR → React Flow nodes/edges
  const { nodes, edges, trigger, callbacks } = irToReactFlow(ir);

  return {
    nodes,
    edges,
    trigger,
    callbacks,
    ir, // Return IR for reference/debugging
    wasLegacy,
  };
}

/**
 * Convert React Flow nodes and edges to YAML string
 *
 * Complete pipeline: React Flow → IR (sorted) → YAML String
 *
 * @param nodes - React Flow nodes from canvas
 * @param edges - React Flow edges from canvas
 * @param trigger - Trigger configuration
 * @returns YAML string ready for API
 * @throws {CircularDependencyError} If circular dependency detected
 * @throws {YAMLSerializeError} If serialization fails
 *
 * @example
 * ```typescript
 * const handleSave = async () => {
 *   try {
 *     const { nodes, edges } = useWorkflowEditorStore();
 *     const yamlContent = reactFlowToYAML(nodes, edges, trigger);
 *
 *     await updateWorkflowEvent({
 *       workspaceId,
 *       eventId,
 *       data: { yamlContent }
 *     });
 *
 *     toast.success('Workflow saved');
 *   } catch (error) {
 *     if (error instanceof CircularDependencyError) {
 *       toast.error(`Cannot save: ${error.message}`);
 *     }
 *   }
 * };
 * ```
 */
export function reactFlowToYAML(nodes: Node[], edges: Edge[], trigger: TriggerIR): string {
  // Convert React Flow → IR (with topological sort)
  const ir = reactFlowToIR(nodes, edges, trigger);

  // Serialize IR → YAML string
  const yamlString = serializeWorkflowYAML(ir);

  return yamlString;
}

/**
 * Validate YAML without full conversion (lightweight check)
 *
 * Supports both new and legacy formats.
 *
 * @param yamlString - YAML string to validate
 * @param options - Optional parse options
 * @returns Validation result with success flag, error message, and format info
 */
export function validateWorkflowYAML(
  yamlString: string,
  options?: YAMLToReactFlowOptions,
): {
  valid: boolean;
  error?: string;
  wasLegacy?: boolean;
} {
  try {
    const { wasLegacy } = parseWorkflowYAMLWithInfo(yamlString, options);
    return { valid: true, wasLegacy };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Unknown validation error',
    };
  }
}

/**
 * Round-trip test: YAML → React Flow → YAML
 *
 * Useful for testing fidelity and debugging conversion issues.
 *
 * @param yamlString - Original YAML string
 * @returns Object with converted YAML and fidelity flag
 */
export function roundTripTest(yamlString: string): {
  originalYAML: string;
  convertedYAML: string;
  fidelity: boolean;
} {
  const { nodes, edges, trigger } = yamlToReactFlow(yamlString);
  const convertedYAML = reactFlowToYAML(nodes, edges, trigger);

  // Simple fidelity check (normalize whitespace)
  const normalizeYAML = (yaml: string) => yaml.replace(/\s+/g, ' ').trim();
  const fidelity = normalizeYAML(yamlString) === normalizeYAML(convertedYAML);

  return {
    originalYAML: yamlString,
    convertedYAML,
    fidelity,
  };
}

// Re-export types and errors for convenience
export type { WorkflowIR, StepIR, TriggerIR, CallbackIR } from './yaml-types';
export { YAMLParseError, isLegacyYAML } from './yaml-parser';
export { YAMLSerializeError } from './yaml-serializer';
export { CircularDependencyError } from './topological-sort';
export { isLegacyFormat, convertLegacyToIR } from './legacy-yaml-adapter';
