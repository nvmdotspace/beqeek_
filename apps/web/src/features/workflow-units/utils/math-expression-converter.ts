/**
 * Math Expression Converter
 *
 * Converts between visual MathExpression and YAML-compatible format.
 */
import type { MathExpression, MathOperator } from '../components/expression-builder/math-operators';

/**
 * YAML representation of math expression
 */
export interface YAMLMathExpression {
  type: 'value' | 'variable' | 'operation';
  value?: number;
  name?: string;
  operator?: string;
  left?: YAMLMathExpression;
  right?: YAMLMathExpression;
}

/**
 * Convert visual MathExpression to YAML-compatible object
 */
export function mathExpressionToYAML(expr: MathExpression): YAMLMathExpression | null {
  if (!expr) return null;

  if (expr.type === 'value') {
    return {
      type: 'value',
      value: typeof expr.value === 'number' ? expr.value : parseFloat(String(expr.value)) || 0,
    };
  }

  if (expr.type === 'variable') {
    return {
      type: 'variable',
      name: String(expr.value || 'x'),
    };
  }

  if (expr.type === 'operation') {
    const result: YAMLMathExpression = {
      type: 'operation',
      operator: expr.operator,
    };

    if (expr.left) {
      result.left = mathExpressionToYAML(expr.left) ?? undefined;
    }

    if (expr.right) {
      result.right = mathExpressionToYAML(expr.right) ?? undefined;
    }

    return result;
  }

  return null;
}

/**
 * Convert YAML math object to visual MathExpression
 */
export function yamlToMathExpression(yaml: YAMLMathExpression | null | undefined): MathExpression | null {
  if (!yaml || typeof yaml !== 'object') return null;

  if (yaml.type === 'value') {
    return {
      type: 'value',
      value: yaml.value ?? 0,
    };
  }

  if (yaml.type === 'variable') {
    return {
      type: 'variable',
      value: yaml.name ?? 'x',
    };
  }

  if (yaml.type === 'operation') {
    return {
      type: 'operation',
      operator: yaml.operator as MathOperator,
      left: yaml.left ? (yamlToMathExpression(yaml.left) ?? undefined) : undefined,
      right: yaml.right ? (yamlToMathExpression(yaml.right) ?? undefined) : undefined,
    };
  }

  return null;
}

/**
 * Validate math expression structure
 */
export function validateMathExpression(expr: MathExpression): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  function validate(e: MathExpression, path: string): void {
    if (!e.type) {
      errors.push(`${path}: Missing type`);
      return;
    }

    if (e.type === 'operation') {
      if (!e.operator) {
        errors.push(`${path}: Missing operator`);
      }

      if (!e.left) {
        errors.push(`${path}: Missing left operand`);
      } else {
        validate(e.left, `${path}.left`);
      }

      // Only check right for binary operators
      const unaryOps = ['sqrt', 'abs', 'round', 'floor', 'ceil'];
      if (!unaryOps.includes(e.operator || '') && !e.right) {
        errors.push(`${path}: Missing right operand for binary operator`);
      } else if (e.right) {
        validate(e.right, `${path}.right`);
      }
    }
  }

  validate(expr, 'root');

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Deep clone a math expression
 */
export function cloneMathExpression(expr: MathExpression): MathExpression {
  return JSON.parse(JSON.stringify(expr));
}
