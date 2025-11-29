/**
 * Math Expression Builder Component
 *
 * Visual builder for mathematical expressions supporting:
 * - Binary operations (add, subtract, multiply, divide, etc.)
 * - Unary operations (sqrt, abs, round, floor, ceil)
 * - Numeric values
 * - Variable references
 */
import { useState, useCallback } from 'react';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
import { cn } from '@workspace/ui/lib/utils';
import { Trash2, Plus, Variable, Hash } from 'lucide-react';
import {
  MATH_OPERATORS,
  type MathExpression,
  type MathOperator,
  isUnaryOperator,
  getOperatorInfo,
  expressionToFormula,
} from './math-operators';

interface MathBuilderProps {
  /** Initial expression to load */
  initialExpression?: MathExpression;
  /** Callback when expression changes */
  onChange: (expression: MathExpression) => void;
  /** Optional save callback */
  onSave?: () => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Visual math expression builder
 */
export function MathBuilder({ initialExpression, onChange, onSave, className }: MathBuilderProps) {
  const [expression, setExpression] = useState<MathExpression>(initialExpression || { type: 'value', value: 0 });

  const handleExpressionChange = useCallback(
    (newExpression: MathExpression) => {
      setExpression(newExpression);
      onChange(newExpression);
    },
    [onChange],
  );

  /**
   * Update expression at a specific path
   */
  const updateExpressionAtPath = (path: ('left' | 'right')[], updated: MathExpression) => {
    if (path.length === 0) {
      handleExpressionChange(updated);
      return;
    }

    const newExpression = JSON.parse(JSON.stringify(expression)) as MathExpression;
    let current: MathExpression = newExpression;

    for (let i = 0; i < path.length - 1; i++) {
      const key = path[i];
      const child = key === 'left' ? current.left : current.right;
      if (child) {
        current = child;
      }
    }

    const lastKey = path[path.length - 1];
    if (lastKey === 'left') {
      current.left = updated;
    } else {
      current.right = updated;
    }
    handleExpressionChange(newExpression);
  };

  /**
   * Convert value/variable to operation at path
   */
  const convertToOperation = (path: ('left' | 'right')[]) => {
    const newOperation: MathExpression = {
      type: 'operation',
      operator: 'add',
      left: { type: 'value', value: 0 },
      right: { type: 'value', value: 0 },
    };
    updateExpressionAtPath(path, newOperation);
  };

  /**
   * Toggle between value and variable type
   */
  const toggleType = (path: ('left' | 'right')[], currentType: string) => {
    const newExpr: MathExpression =
      currentType === 'value' ? { type: 'variable', value: 'variable_name' } : { type: 'value', value: 0 };
    updateExpressionAtPath(path, newExpr);
  };

  /**
   * Remove operation, replace with value
   */
  const removeOperation = (path: ('left' | 'right')[]) => {
    updateExpressionAtPath(path, { type: 'value', value: 0 });
  };

  /**
   * Render expression node recursively
   */
  const renderExpression = (
    expr: MathExpression,
    path: ('left' | 'right')[] = [],
    depth: number = 0,
  ): React.ReactNode => {
    // Value node
    if (expr.type === 'value') {
      return (
        <div className="flex items-center gap-2">
          <Hash className="h-4 w-4 text-muted-foreground" />
          <Input
            type="number"
            value={expr.value ?? 0}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              updateExpressionAtPath(path, {
                ...expr,
                value: isNaN(val) ? 0 : val,
              });
            }}
            className="w-24 font-mono"
          />
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => toggleType(path, 'value')}
            title="Switch to variable"
          >
            <Variable className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => convertToOperation(path)}
            title="Convert to operation"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      );
    }

    // Variable node
    if (expr.type === 'variable') {
      return (
        <div className="flex items-center gap-2">
          <Variable className="h-4 w-4 text-accent-blue" />
          <Input
            type="text"
            value={expr.value ?? ''}
            onChange={(e) => {
              updateExpressionAtPath(path, { ...expr, value: e.target.value });
            }}
            placeholder="variable.name"
            className="w-40 font-mono text-sm"
          />
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => toggleType(path, 'variable')}
            title="Switch to number"
          >
            <Hash className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => convertToOperation(path)}
            title="Convert to operation"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      );
    }

    // Operation node
    if (expr.type === 'operation') {
      const operatorInfo = getOperatorInfo(expr.operator!);
      const isUnary = isUnaryOperator(expr.operator!);

      return (
        <div
          className={cn(
            'border border-border rounded-lg p-3 bg-muted/30',
            depth > 0 && 'ml-4 border-l-4 border-l-accent-blue/30',
          )}
        >
          {/* Header with operator selector */}
          <div className="flex items-center gap-2 mb-3">
            <Select
              value={expr.operator}
              onValueChange={(value) => {
                const newIsUnary = isUnaryOperator(value as MathOperator);
                const updated: MathExpression = {
                  ...expr,
                  operator: value as MathOperator,
                  // Reset right if switching to unary
                  right: newIsUnary ? undefined : (expr.right ?? { type: 'value', value: 0 }),
                };
                updateExpressionAtPath(path, updated);
              }}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MATH_OPERATORS.map((op) => (
                  <SelectItem key={op.name} value={op.name}>
                    <span className="flex items-center gap-2">
                      <span className="font-mono text-lg">{op.symbol}</span>
                      <span>{op.name}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <span className="text-2xl font-bold text-accent-blue">{operatorInfo?.symbol}</span>

            {path.length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 ml-auto"
                onClick={() => removeOperation(path)}
                title="Remove operation"
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            )}
          </div>

          {/* Left operand */}
          <div className="mb-2">
            <div className="text-xs text-muted-foreground mb-1 font-medium">{isUnary ? 'Value:' : 'Left:'}</div>
            {expr.left && renderExpression(expr.left, [...path, 'left'], depth + 1)}
          </div>

          {/* Right operand (only for binary operators) */}
          {!isUnary && (
            <div>
              <div className="text-xs text-muted-foreground mb-1 font-medium">Right:</div>
              {expr.right && renderExpression(expr.right, [...path, 'right'], depth + 1)}
            </div>
          )}
        </div>
      );
    }

    return <div className="text-muted-foreground">Unknown expression type</div>;
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Expression tree */}
      <div className="border border-border rounded-lg p-4 bg-background">{renderExpression(expression)}</div>

      {/* Formula preview */}
      <div className="border border-border rounded-lg p-3 bg-muted/50">
        <div className="text-xs text-muted-foreground mb-1 font-medium">Formula Preview:</div>
        <div className="font-mono text-sm text-foreground">{expressionToFormula(expression)}</div>
      </div>

      {/* Actions */}
      {onSave && (
        <div className="flex justify-end">
          <Button size="sm" onClick={onSave}>
            Save Expression
          </Button>
        </div>
      )}
    </div>
  );
}
