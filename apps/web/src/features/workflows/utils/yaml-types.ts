/**
 * Intermediate Representation (IR) Types for YAML Workflow Conversion
 *
 * These types decouple YAML structure from React Flow representation,
 * enabling bidirectional conversion with validation.
 */

/**
 * Trigger configuration for workflow events
 */
export interface TriggerIR {
  type: 'schedule' | 'webhook' | 'form' | 'table';
  config: Record<string, unknown>;
}

/**
 * Individual workflow step in IR format
 */
export interface StepIR {
  /** Unique identifier for the step */
  id: string;
  /** Display name shown in UI */
  name: string;
  /** Node type (must match React Flow node types) */
  type: string;
  /** Node-specific configuration */
  config: Record<string, unknown>;
  /** Array of step IDs this step depends on */
  depends_on?: string[];
  /** Optional position for manual layout preservation */
  position?: {
    x: number;
    y: number;
  };
}

/**
 * Edge representation in IR format
 */
export interface EdgeIR {
  /** Source step ID */
  source: string;
  /** Target step ID */
  target: string;
  /** Optional edge label (used for conditional branches) */
  label?: string;
}

/**
 * Complete workflow in Intermediate Representation format
 */
export interface WorkflowIR {
  /** Workflow schema version */
  version: string;
  /** Trigger configuration */
  trigger: TriggerIR;
  /** Array of workflow steps (topologically sorted for execution) */
  steps: StepIR[];
  /** Optional metadata */
  metadata?: {
    description?: string;
    tags?: string[];
  };
}
