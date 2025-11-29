/**
 * Math Expression Templates
 *
 * Pre-built formulas for common calculations.
 */
import type { MathExpression } from './math-operators';

export interface MathTemplate {
  id: string;
  label: string;
  description: string;
  expression: MathExpression;
}

export const MATH_TEMPLATES: MathTemplate[] = [
  {
    id: 'percentage',
    label: 'Percentage',
    description: '(value / total) × 100',
    expression: {
      type: 'operation',
      operator: 'multiply',
      left: {
        type: 'operation',
        operator: 'divide',
        left: { type: 'variable', value: 'value' },
        right: { type: 'variable', value: 'total' },
      },
      right: { type: 'value', value: 100 },
    },
  },
  {
    id: 'average',
    label: 'Average',
    description: 'sum / count',
    expression: {
      type: 'operation',
      operator: 'divide',
      left: { type: 'variable', value: 'sum' },
      right: { type: 'variable', value: 'count' },
    },
  },
  {
    id: 'discount',
    label: 'Discount Price',
    description: 'price × (1 - discount%)',
    expression: {
      type: 'operation',
      operator: 'multiply',
      left: { type: 'variable', value: 'price' },
      right: {
        type: 'operation',
        operator: 'subtract',
        left: { type: 'value', value: 1 },
        right: {
          type: 'operation',
          operator: 'divide',
          left: { type: 'variable', value: 'discount' },
          right: { type: 'value', value: 100 },
        },
      },
    },
  },
  {
    id: 'tax',
    label: 'Add Tax',
    description: 'amount × (1 + tax%)',
    expression: {
      type: 'operation',
      operator: 'multiply',
      left: { type: 'variable', value: 'amount' },
      right: {
        type: 'operation',
        operator: 'add',
        left: { type: 'value', value: 1 },
        right: {
          type: 'operation',
          operator: 'divide',
          left: { type: 'variable', value: 'tax_rate' },
          right: { type: 'value', value: 100 },
        },
      },
    },
  },
  {
    id: 'simple_add',
    label: 'Addition',
    description: 'a + b',
    expression: {
      type: 'operation',
      operator: 'add',
      left: { type: 'variable', value: 'a' },
      right: { type: 'variable', value: 'b' },
    },
  },
  {
    id: 'round_value',
    label: 'Round Value',
    description: 'round(value)',
    expression: {
      type: 'operation',
      operator: 'round',
      left: { type: 'variable', value: 'value' },
    },
  },
];

/**
 * Get template by ID
 */
export function getMathTemplate(id: string): MathTemplate | undefined {
  return MATH_TEMPLATES.find((t) => t.id === id);
}
