/**
 * Math Operators for Expression Builder
 *
 * Defines available math operations with symbols and labels
 * for the visual formula builder.
 */

export const MATH_OPERATORS = [
  { name: 'add', label: '+ Add', symbol: '+', arity: 'binary' },
  { name: 'subtract', label: '− Subtract', symbol: '−', arity: 'binary' },
  { name: 'multiply', label: '× Multiply', symbol: '×', arity: 'binary' },
  { name: 'divide', label: '÷ Divide', symbol: '÷', arity: 'binary' },
  { name: 'modulo', label: '% Modulo', symbol: '%', arity: 'binary' },
  { name: 'power', label: '^ Power', symbol: '^', arity: 'binary' },
  { name: 'sqrt', label: '√ Square Root', symbol: '√', arity: 'unary' },
  { name: 'abs', label: '|x| Absolute', symbol: '||', arity: 'unary' },
  { name: 'round', label: '≈ Round', symbol: '≈', arity: 'unary' },
  { name: 'floor', label: '⌊x⌋ Floor', symbol: '⌊⌋', arity: 'unary' },
  { name: 'ceil', label: '⌈x⌉ Ceiling', symbol: '⌈⌉', arity: 'unary' },
] as const;

export type MathOperator = (typeof MATH_OPERATORS)[number]['name'];

export type MathExpressionType = 'operation' | 'value' | 'variable';

export interface MathExpression {
  /** Type of expression node */
  type: MathExpressionType;
  /** Operator (for operations) */
  operator?: MathOperator;
  /** Left operand (for binary/unary operations) */
  left?: MathExpression;
  /** Right operand (for binary operations) */
  right?: MathExpression;
  /** Numeric value (for value type) */
  value?: number | string;
}

/**
 * Check if an operator is unary (takes single operand)
 */
export function isUnaryOperator(operator: MathOperator): boolean {
  return ['sqrt', 'abs', 'round', 'floor', 'ceil'].includes(operator);
}

/**
 * Get operator info by name
 */
export function getOperatorInfo(operator: MathOperator) {
  return MATH_OPERATORS.find((op) => op.name === operator);
}

/**
 * Convert math expression to formula string
 */
export function expressionToFormula(expr: MathExpression): string {
  if (expr.type === 'value') {
    return String(expr.value ?? 0);
  }

  if (expr.type === 'variable') {
    return `$[${expr.value ?? 'x'}]`;
  }

  if (expr.type === 'operation' && expr.operator) {
    const op = getOperatorInfo(expr.operator);
    const left = expr.left ? expressionToFormula(expr.left) : '0';
    const right = expr.right ? expressionToFormula(expr.right) : '0';

    // Unary operators
    if (isUnaryOperator(expr.operator)) {
      return `${expr.operator}(${left})`;
    }

    // Binary operators
    return `(${left} ${op?.symbol ?? expr.operator} ${right})`;
  }

  return '0';
}
