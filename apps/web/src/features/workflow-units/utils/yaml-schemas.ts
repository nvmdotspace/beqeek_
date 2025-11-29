/**
 * Zod Validation Schemas for YAML Workflow Conversion
 *
 * These schemas validate the Intermediate Representation (IR) at parse
 * and serialize boundaries to ensure type safety and data integrity.
 */

import { z } from 'zod';

/**
 * Schema for trigger configuration
 */
export const TriggerIRSchema = z.object({
  type: z.enum(['schedule', 'webhook', 'form', 'table']),
  config: z.record(z.string(), z.unknown()),
});

/**
 * Schema for position coordinates
 */
export const PositionSchema = z.object({
  x: z.number().finite(),
  y: z.number().finite(),
});

/**
 * Schema for individual workflow step
 */
export const StepIRSchema = z.object({
  id: z
    .string()
    .min(1, 'Step ID cannot be empty')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Step ID must contain only alphanumeric characters, underscores, and hyphens'),
  name: z.string().min(1, 'Step name cannot be empty'),
  type: z.string().min(1, 'Step type cannot be empty'),
  config: z.record(z.string(), z.unknown()),
  depends_on: z.array(z.string().min(1)).optional(),
  position: PositionSchema.optional(),
});

/**
 * Schema for workflow metadata
 */
export const MetadataSchema = z.object({
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

/**
 * Schema for complete workflow IR
 * Note: steps can be empty for new/blank workflows
 */
export const WorkflowIRSchema = z.object({
  version: z.string().default('1.0'),
  trigger: TriggerIRSchema,
  steps: z.array(StepIRSchema), // Allow empty steps for new workflows
  metadata: MetadataSchema.optional(),
});

/**
 * Type exports derived from schemas
 */
export type TriggerIRType = z.infer<typeof TriggerIRSchema>;
export type StepIRType = z.infer<typeof StepIRSchema>;
export type WorkflowIRType = z.infer<typeof WorkflowIRSchema>;
