/**
 * Test Fixtures for Nested Workflow Testing
 *
 * Provides reusable workflow data structures for testing:
 * - Legacy YAML format (stages/blocks)
 * - New IR format (trigger/steps with branches/nested_blocks)
 * - Complex nested structures
 */

import type { WorkflowIR, StepIR } from '../../utils/yaml-types';

/**
 * Legacy YAML format types (PHP/Blockly)
 */
interface LegacyBlock {
  type: string;
  name: string;
  input?: Record<string, unknown>;
  blocks?: LegacyBlock[];
  then?: LegacyBlock[];
  else?: LegacyBlock[];
}

interface LegacyStage {
  name: string;
  blocks: LegacyBlock[];
}

interface LegacyYAML {
  stages: LegacyStage[];
  callbacks?: LegacyBlock[];
}

// ====================
// Legacy Format Fixtures
// ====================

/**
 * Create legacy condition with then branch
 */
export function createLegacyConditionWithThen(): LegacyYAML {
  return {
    stages: [
      {
        name: 'main',
        blocks: [
          {
            type: 'condition',
            name: 'Check Status',
            input: {
              expressions: [{ field: 'status', operator: '=', value: 'active' }],
            },
            then: [
              { type: 'log', name: 'Log Success', input: { message: 'Status is active' } },
              { type: 'smtp_email', name: 'Send Email', input: { to: 'admin@example.com' } },
            ],
          },
        ],
      },
    ],
  };
}

/**
 * Create legacy condition with both then and else branches
 */
export function createLegacyConditionWithElse(): LegacyYAML {
  return {
    stages: [
      {
        name: 'main',
        blocks: [
          {
            type: 'condition',
            name: 'Check Status',
            input: {
              expressions: [{ field: 'status', operator: '=', value: 'active' }],
            },
            then: [{ type: 'log', name: 'Log Success', input: { message: 'Active' } }],
            else: [{ type: 'log', name: 'Log Failure', input: { message: 'Inactive' } }],
          },
        ],
      },
    ],
  };
}

/**
 * Create legacy loop with nested blocks
 */
export function createLegacyLoopWithBlocks(): LegacyYAML {
  return {
    stages: [
      {
        name: 'process',
        blocks: [
          {
            type: 'loop',
            name: 'Process Orders',
            input: {
              array: '$[orders]',
              iterator: 'order',
            },
            blocks: [
              { type: 'log', name: 'Log Order', input: { message: '$[order.id]' } },
              {
                type: 'api_call',
                name: 'Update Order',
                input: { url: 'https://api.example.com/orders', request_type: 'POST' },
              },
              { type: 'smtp_email', name: 'Send Confirmation', input: { to: '$[order.email]' } },
            ],
          },
        ],
      },
    ],
  };
}

/**
 * Create deeply nested conditions
 */
export function createDeeplyNestedConditions(depth: number): LegacyYAML {
  function createNestedCondition(currentDepth: number): LegacyBlock {
    if (currentDepth === 0) {
      return {
        type: 'log',
        name: `Leaf Node`,
        input: { message: 'Reached bottom' },
      };
    }

    return {
      type: 'condition',
      name: `Level ${currentDepth} Condition`,
      input: {
        expressions: [{ field: `level${currentDepth}`, operator: '=', value: 'true' }],
      },
      then: [createNestedCondition(currentDepth - 1)],
      else: [
        {
          type: 'log',
          name: `Level ${currentDepth} Else`,
          input: { message: `Else at level ${currentDepth}` },
        },
      ],
    };
  }

  return {
    stages: [
      {
        name: 'nested',
        blocks: [createNestedCondition(depth)],
      },
    ],
  };
}

/**
 * Create complex legacy workflow with multiple patterns
 */
export function createComplexLegacyWorkflow(): LegacyYAML {
  return {
    stages: [
      {
        name: 'initialization',
        blocks: [
          { type: 'log', name: 'Start', input: { message: 'Workflow started' } },
          { type: 'definition', name: 'Set Variables', input: { counter: 0 } },
        ],
      },
      {
        name: 'processing',
        blocks: [
          {
            type: 'condition',
            name: 'Check Items',
            input: {
              expressions: [{ field: 'items.length', operator: '>', value: '0' }],
            },
            then: [
              {
                type: 'loop',
                name: 'Process Items',
                input: { array: '$[items]', iterator: 'item' },
                blocks: [
                  {
                    type: 'condition',
                    name: 'Item Valid',
                    input: {
                      expressions: [{ field: 'item.valid', operator: '=', value: 'true' }],
                    },
                    then: [{ type: 'log', name: 'Valid Item', input: { message: '$[item.name]' } }],
                    else: [{ type: 'log', name: 'Invalid Item', input: { message: 'Skipping' } }],
                  },
                ],
              },
            ],
            else: [{ type: 'log', name: 'No Items', input: { message: 'Nothing to process' } }],
          },
        ],
      },
      {
        name: 'completion',
        blocks: [{ type: 'smtp_email', name: 'Send Report', input: { to: 'report@example.com' } }],
      },
    ],
    callbacks: [
      {
        type: 'log',
        name: 'delay_callback',
        input: { message: 'Callback executed' },
        blocks: [{ type: 'log', name: 'Nested Callback', input: { message: 'Inside callback' } }],
      },
    ],
  };
}

// ====================
// New IR Format Fixtures
// ====================

/**
 * Create new IR format with nested condition
 */
export function createNestedConditionIR(): WorkflowIR {
  return {
    version: '1.0',
    trigger: { type: 'webhook', config: {} },
    steps: [
      {
        id: 'cond1',
        name: 'Check Status',
        type: 'condition',
        config: {
          expressions: [{ field: 'status', operator: '=', value: 'active' }],
        },
        branches: {
          then: [
            { id: 'then1', name: 'Send Success Email', type: 'smtp_email', config: { to: 'success@example.com' } },
            { id: 'then2', name: 'Log Success', type: 'log', config: { message: 'Success' } },
          ],
          else: [
            { id: 'else1', name: 'Send Failure Email', type: 'smtp_email', config: { to: 'fail@example.com' } },
            { id: 'else2', name: 'Log Failure', type: 'log', config: { message: 'Failure' } },
          ],
        },
      },
    ],
  };
}

/**
 * Create new IR format with loop nested blocks
 */
export function createLoopWithBlocksIR(): WorkflowIR {
  return {
    version: '1.0',
    trigger: { type: 'table', config: { tableId: 'orders' } },
    steps: [
      {
        id: 'loop1',
        name: 'Process Orders',
        type: 'loop',
        config: {
          items: '$[orders]',
          itemVariable: 'order',
        },
        nested_blocks: [
          { id: 'loop1_1', name: 'Validate Order', type: 'log', config: { message: 'Validating $[order.id]' } },
          {
            id: 'loop1_2',
            name: 'Update Status',
            type: 'table_operation',
            config: { operation: 'update', recordId: '$[order.id]' },
          },
          {
            id: 'loop1_3',
            name: 'Send Notification',
            type: 'smtp_email',
            config: { to: '$[order.customerEmail]' },
          },
        ],
      },
    ],
  };
}

/**
 * Create condition with only then branch (no else)
 */
export function createConditionThenOnly(): WorkflowIR {
  return {
    version: '1.0',
    trigger: { type: 'webhook', config: {} },
    steps: [
      {
        id: 'cond1',
        name: 'Check Condition',
        type: 'condition',
        config: {
          expressions: [{ field: 'flag', operator: '=', value: 'true' }],
        },
        branches: {
          then: [{ id: 'then1', name: 'Execute', type: 'log', config: { message: 'Flag is true' } }],
        },
      },
    ],
  };
}

/**
 * Create empty loop (no nested blocks)
 */
export function createEmptyLoop(): WorkflowIR {
  return {
    version: '1.0',
    trigger: { type: 'webhook', config: {} },
    steps: [
      {
        id: 'loop1',
        name: 'Empty Loop',
        type: 'loop',
        config: {
          items: '$[items]',
          itemVariable: 'item',
        },
        nested_blocks: [],
      },
    ],
  };
}

/**
 * Create complex nested workflow with multiple levels
 */
export function createComplexNestedIR(): WorkflowIR {
  return {
    version: '1.0',
    trigger: { type: 'schedule', config: { cron: '0 9 * * 1-5' } },
    steps: [
      { id: 'start', name: 'Initialize', type: 'log', config: { message: 'Starting...' } },
      {
        id: 'cond1',
        name: 'Check Data',
        type: 'condition',
        config: {
          expressions: [{ field: 'data.length', operator: '>', value: '0' }],
        },
        depends_on: ['start'],
        branches: {
          then: [
            {
              id: 'loop1',
              name: 'Process Items',
              type: 'loop',
              config: { items: '$[data]', itemVariable: 'item' },
              nested_blocks: [
                {
                  id: 'nestedCond',
                  name: 'Validate Item',
                  type: 'condition',
                  config: {
                    expressions: [{ field: 'item.valid', operator: '=', value: 'true' }],
                  },
                  branches: {
                    then: [{ id: 'valid', name: 'Process Valid', type: 'log', config: { message: 'Valid' } }],
                    else: [{ id: 'invalid', name: 'Skip Invalid', type: 'log', config: { message: 'Invalid' } }],
                  },
                },
              ],
            },
          ],
          else: [{ id: 'noData', name: 'No Data', type: 'log', config: { message: 'Empty' } }],
        },
      },
      { id: 'end', name: 'Finish', type: 'smtp_email', config: { to: 'done@example.com' }, depends_on: ['cond1'] },
    ],
    metadata: {
      description: 'Complex nested workflow for testing',
      tags: ['test', 'nested'],
    },
  };
}

// ====================
// Performance Testing Fixtures
// ====================

/**
 * Generate a large workflow with specified number of nodes
 */
export function generateLargeWorkflow(nodeCount: number): WorkflowIR {
  const steps: StepIR[] = [];

  for (let i = 0; i < nodeCount; i++) {
    const step: StepIR = {
      id: `step_${i}`,
      name: `Step ${i}`,
      type: i % 3 === 0 ? 'log' : i % 3 === 1 ? 'smtp_email' : 'api_call',
      config: { index: i },
    };

    // Add dependencies to create realistic workflow graph
    if (i > 0) {
      step.depends_on = [steps[i - 1]!.id];
    }

    steps.push(step);
  }

  return {
    version: '1.0',
    trigger: { type: 'webhook', config: {} },
    steps,
  };
}

/**
 * Generate deeply nested conditions
 */
export function generateDeeplyNestedConditions(depth: number): WorkflowIR {
  function createNestedStep(currentDepth: number, parentId?: string): StepIR {
    if (currentDepth === 0) {
      return {
        id: `leaf_${parentId}`,
        name: 'Leaf Action',
        type: 'log',
        config: { message: 'Bottom reached' },
      };
    }

    return {
      id: `condition_level_${currentDepth}`,
      name: `Level ${currentDepth}`,
      type: 'condition',
      config: {
        expressions: [{ field: `level${currentDepth}`, operator: '=', value: 'true' }],
      },
      branches: {
        then: [createNestedStep(currentDepth - 1, `then_${currentDepth}`)],
        else: [createNestedStep(currentDepth - 1, `else_${currentDepth}`)],
      },
    };
  }

  return {
    version: '1.0',
    trigger: { type: 'webhook', config: {} },
    steps: [createNestedStep(depth)],
  };
}

/**
 * Generate random workflow with mix of node types
 */
export function generateRandomWorkflow(nodeCount: number): { nodes: any[]; edges: any[] } {
  const nodes: any[] = [];
  const edges: any[] = [];

  const types = ['log', 'smtp_email', 'api_call', 'condition', 'loop'];

  for (let i = 0; i < nodeCount; i++) {
    nodes.push({
      id: `node_${i}`,
      type: types[i % types.length],
      position: { x: 0, y: 0 },
      data: { label: `Node ${i}`, config: {} },
    });

    // Add edges to create graph
    if (i > 0) {
      edges.push({
        id: `edge_${i - 1}_${i}`,
        source: `node_${i - 1}`,
        target: `node_${i}`,
        type: 'default',
      });
    }
  }

  return { nodes, edges };
}

// ====================
// Utility Functions
// ====================

/**
 * Get maximum nesting depth of a workflow
 */
export function getMaxNestingDepth(step: StepIR): number {
  let maxDepth = 0;

  if (step.branches) {
    if (step.branches.then) {
      for (const thenStep of step.branches.then) {
        maxDepth = Math.max(maxDepth, 1 + getMaxNestingDepth(thenStep));
      }
    }
    if (step.branches.else) {
      for (const elseStep of step.branches.else) {
        maxDepth = Math.max(maxDepth, 1 + getMaxNestingDepth(elseStep));
      }
    }
  }

  if (step.nested_blocks) {
    for (const nestedStep of step.nested_blocks) {
      maxDepth = Math.max(maxDepth, 1 + getMaxNestingDepth(nestedStep));
    }
  }

  return maxDepth;
}

/**
 * Count total steps including nested
 */
export function countTotalSteps(steps: StepIR[]): number {
  let count = steps.length;

  for (const step of steps) {
    if (step.branches?.then) {
      count += countTotalSteps(step.branches.then);
    }
    if (step.branches?.else) {
      count += countTotalSteps(step.branches.else);
    }
    if (step.nested_blocks) {
      count += countTotalSteps(step.nested_blocks);
    }
  }

  return count;
}
