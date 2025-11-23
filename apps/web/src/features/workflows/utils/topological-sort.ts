/**
 * Topological Sort with Cycle Detection
 *
 * Sorts workflow steps in dependency order using Depth-First Search (DFS).
 * Detects circular dependencies and provides helpful error messages.
 */

import type { StepIR } from './yaml-types';

/**
 * Custom error class for circular dependency detection
 */
export class CircularDependencyError extends Error {
  constructor(
    message: string,
    public readonly cycle: string[],
  ) {
    super(message);
    this.name = 'CircularDependencyError';
  }
}

/**
 * Topologically sort workflow steps based on dependencies
 *
 * Uses DFS algorithm to:
 * 1. Visit each step and its dependencies recursively
 * 2. Detect cycles using "visiting" set
 * 3. Return steps in execution order (dependencies first)
 *
 * @param steps - Array of workflow steps
 * @param dependencyMap - Map of step ID to array of dependency IDs
 * @returns Steps sorted in topological order
 * @throws {CircularDependencyError} If circular dependency detected
 *
 * @example
 * ```typescript
 * const sorted = topologicalSort(steps, dependencyMap);
 * // sorted[0] has no dependencies
 * // sorted[1] may depend on sorted[0]
 * // etc.
 * ```
 */
export function topologicalSort(steps: StepIR[], dependencyMap: Map<string, string[]>): StepIR[] {
  const sorted: StepIR[] = [];
  const visited = new Set<string>();
  const visiting = new Set<string>();
  const visitPath: string[] = []; // Track current DFS path for cycle reporting

  /**
   * Recursive DFS visit function
   */
  function visit(stepId: string): void {
    // Already processed this step
    if (visited.has(stepId)) {
      return;
    }

    // Cycle detected - step is currently being visited
    if (visiting.has(stepId)) {
      const cycleStart = visitPath.indexOf(stepId);
      const cycle = [...visitPath.slice(cycleStart), stepId];
      const cycleDescription = cycle.join(' → ');

      throw new CircularDependencyError(
        `Circular dependency detected: ${cycleDescription}. ` +
          `Steps in a workflow cannot depend on each other in a cycle. ` +
          `Please review the 'depends_on' configuration for these steps.`,
        cycle,
      );
    }

    // Mark as currently visiting
    visiting.add(stepId);
    visitPath.push(stepId);

    // Visit all dependencies first (DFS)
    const dependencies = dependencyMap.get(stepId) || [];
    for (const depId of dependencies) {
      // Validate dependency exists
      const depExists = steps.some((s) => s.id === depId);
      if (!depExists) {
        throw new Error(
          `Step "${stepId}" depends on non-existent step "${depId}". ` +
            `Please ensure all dependencies reference valid step IDs.`,
        );
      }

      visit(depId);
    }

    // Done visiting this step
    visiting.delete(stepId);
    visitPath.pop();
    visited.add(stepId);

    // Add to sorted list (dependencies already added)
    const step = steps.find((s) => s.id === stepId);
    if (step) {
      sorted.push(step);
    }
  }

  // Visit all steps (handles disconnected components)
  for (const step of steps) {
    visit(step.id);
  }

  return sorted;
}

/**
 * Build dependency map from array of steps
 *
 * @param steps - Array of workflow steps
 * @returns Map of step ID to array of dependency IDs
 */
export function buildDependencyMap(steps: StepIR[]): Map<string, string[]> {
  const map = new Map<string, string[]>();

  for (const step of steps) {
    if (step.depends_on && step.depends_on.length > 0) {
      map.set(step.id, step.depends_on);
    }
  }

  return map;
}

/**
 * Validate that all step IDs are unique
 *
 * @param steps - Array of workflow steps
 * @throws {Error} If duplicate IDs found
 */
export function validateUniqueStepIds(steps: StepIR[]): void {
  const ids = new Set<string>();
  const duplicates: string[] = [];

  for (const step of steps) {
    if (ids.has(step.id)) {
      duplicates.push(step.id);
    } else {
      ids.add(step.id);
    }
  }

  if (duplicates.length > 0) {
    throw new Error(`Duplicate step IDs found: ${duplicates.join(', ')}. ` + `Each step must have a unique ID.`);
  }
}
