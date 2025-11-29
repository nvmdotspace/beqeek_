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
 * Maximum nesting depth for nested blocks (prevents infinite recursion)
 */
const MAX_NESTING_DEPTH = 10;

/**
 * Base schema for step fields (without recursive fields)
 */
const StepIRBaseSchema = z.object({
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
 * Schema for individual workflow step (with recursive nested structure support)
 *
 * Validation rules:
 * - `branches` only valid for 'condition' type
 * - `nested_blocks` only valid for 'loop' or 'match' type
 * - Cannot have both `branches` and `nested_blocks`
 */
export const StepIRSchema: z.ZodType<{
  id: string;
  name: string;
  type: string;
  config: Record<string, unknown>;
  depends_on?: string[];
  position?: { x: number; y: number };
  branches?: {
    then?: z.infer<typeof StepIRBaseSchema>[];
    else?: z.infer<typeof StepIRBaseSchema>[];
  };
  nested_blocks?: z.infer<typeof StepIRBaseSchema>[];
}> = StepIRBaseSchema.extend({
  branches: z
    .object({
      then: z.array(z.lazy(() => StepIRSchema)).optional(),
      else: z.array(z.lazy(() => StepIRSchema)).optional(),
    })
    .optional(),
  nested_blocks: z.array(z.lazy(() => StepIRSchema)).optional(),
})
  .refine(
    (data) => {
      // Cannot have both branches and nested_blocks
      return !(data.branches && data.nested_blocks);
    },
    { message: 'Step cannot have both branches and nested_blocks' },
  )
  .refine(
    (data) => {
      // branches only valid for 'condition' type
      if (data.branches && data.type !== 'condition') {
        return false;
      }
      return true;
    },
    { message: 'branches is only valid for condition type steps' },
  )
  .refine(
    (data) => {
      // nested_blocks only valid for 'loop' or 'match' type
      if (data.nested_blocks && !['loop', 'match'].includes(data.type)) {
        return false;
      }
      return true;
    },
    { message: 'nested_blocks is only valid for loop or match type steps' },
  );

/**
 * Validate nesting depth to prevent infinite recursion
 */
export function validateNestingDepth(steps: unknown[], currentDepth: number = 0): boolean {
  if (currentDepth > MAX_NESTING_DEPTH) {
    return false;
  }

  for (const step of steps) {
    if (typeof step !== 'object' || step === null) continue;

    const s = step as Record<string, unknown>;

    // Check branches
    if (s.branches && typeof s.branches === 'object') {
      const branches = s.branches as Record<string, unknown>;
      if (branches.then && Array.isArray(branches.then)) {
        if (!validateNestingDepth(branches.then, currentDepth + 1)) return false;
      }
      if (branches.else && Array.isArray(branches.else)) {
        if (!validateNestingDepth(branches.else, currentDepth + 1)) return false;
      }
    }

    // Check nested_blocks
    if (s.nested_blocks && Array.isArray(s.nested_blocks)) {
      if (!validateNestingDepth(s.nested_blocks, currentDepth + 1)) return false;
    }
  }

  return true;
}

/**
 * Schema for workflow metadata
 */
export const MetadataSchema = z.object({
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

/**
 * Schema for callback step (for delay blocks)
 * Callbacks are executed asynchronously after a delay completes
 */
export const CallbackIRSchema = z.object({
  id: z
    .string()
    .min(1, 'Callback ID cannot be empty')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Callback ID must contain only alphanumeric characters, underscores, and hyphens'),
  name: z.string().min(1, 'Callback name cannot be empty'),
  type: z.string().min(1, 'Callback type cannot be empty'),
  config: z.record(z.string(), z.unknown()),
  steps: z.array(StepIRSchema).optional(),
  position: PositionSchema.optional(),
});

/**
 * Schema for complete workflow IR
 * Note: steps can be empty for new/blank workflows
 */
export const WorkflowIRSchema = z.object({
  version: z.string().default('1.0'),
  trigger: TriggerIRSchema,
  steps: z.array(StepIRSchema), // Allow empty steps for new workflows
  callbacks: z.array(CallbackIRSchema).optional(),
  metadata: MetadataSchema.optional(),
});

/**
 * Type exports derived from schemas
 */
export type TriggerIRType = z.infer<typeof TriggerIRSchema>;
export type StepIRType = z.infer<typeof StepIRSchema>;
export type CallbackIRType = z.infer<typeof CallbackIRSchema>;
export type WorkflowIRType = z.infer<typeof WorkflowIRSchema>;
