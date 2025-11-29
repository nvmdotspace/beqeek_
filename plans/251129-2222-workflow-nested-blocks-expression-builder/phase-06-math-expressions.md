# Phase 06: Math Expression Groups

**Duration:** 4-6 hours
**Priority:** Medium

## Objectives

Extend expression builder to support math operations (add, subtract, multiply, divide, modulo) with visual formula builder similar to legacy Blockly implementation.

## Tasks

### 6.1 Define Math Operators (0.5h)

**File:** `apps/web/src/features/workflow-units/components/expression-builder/math-operators.ts` (new)

```typescript
export const MATH_OPERATORS = [
  { name: 'add', label: '+ Add', symbol: '+' },
  { name: 'subtract', label: '− Subtract', symbol: '-' },
  { name: 'multiply', label: '× Multiply', symbol: '×' },
  { name: 'divide', label: '÷ Divide', symbol: '÷' },
  { name: 'modulo', label: '% Modulo', symbol: '%' },
  { name: 'power', label: '^ Power', symbol: '^' },
  { name: 'sqrt', label: '√ Square Root', symbol: '√' },
  { name: 'abs', label: '|x| Absolute', symbol: '||' },
  { name: 'round', label: '≈ Round', symbol: '≈' },
  { name: 'floor', label: '⌊x⌋ Floor', symbol: '⌊⌋' },
  { name: 'ceil', label: '⌈x⌉ Ceiling', symbol: '⌈⌉' },
] as const;

export type MathOperator = (typeof MATH_OPERATORS)[number]['name'];

export interface MathExpression {
  type: 'operation' | 'value' | 'variable';
  operator?: MathOperator;
  left?: MathExpression;
  right?: MathExpression;
  value?: number | string;
}
```

### 6.2 Create Math Expression Builder (2h)

**File:** `apps/web/src/features/workflow-units/components/expression-builder/math-builder.tsx` (new)

```typescript
import { useState, useCallback } from 'react';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Select } from '@workspace/ui/components/select';
import { MATH_OPERATORS, MathExpression, MathOperator } from './math-operators';
import { Trash2, Plus } from 'lucide-react';
import { cn } from '@workspace/ui/lib/utils';

interface MathBuilderProps {
  initialExpression?: MathExpression;
  onChange: (expression: MathExpression) => void;
  onSave?: () => void;
  className?: string;
}

export function MathBuilder({
  initialExpression,
  onChange,
  onSave,
  className,
}: MathBuilderProps) {
  const [expression, setExpression] = useState<MathExpression>(
    initialExpression || { type: 'value', value: 0 }
  );

  const handleExpressionChange = useCallback(
    (newExpression: MathExpression) => {
      setExpression(newExpression);
      onChange(newExpression);
    },
    [onChange]
  );

  const renderExpression = (
    expr: MathExpression,
    path: number[] = [],
    depth: number = 0
  ): JSX.Element => {
    const indent = depth * 20;

    if (expr.type === 'value') {
      return (
        <div className="flex items-center gap-2" style={{ marginLeft: indent }}>
          <Input
            type="number"
            value={expr.value || 0}
            onChange={(e) => {
              const updated = { ...expr, value: parseFloat(e.target.value) };
              updateExpressionAtPath(path, updated);
            }}
            className="w-24"
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => convertToOperation(path)}
            title="Convert to operation"
          >
            <Plus className="size-4" />
          </Button>
        </div>
      );
    }

    if (expr.type === 'variable') {
      return (
        <div className="flex items-center gap-2" style={{ marginLeft: indent }}>
          <Input
            type="text"
            value={expr.value || ''}
            onChange={(e) => {
              const updated = { ...expr, value: e.target.value };
              updateExpressionAtPath(path, updated);
            }}
            placeholder="variable.name"
            className="w-48 font-mono text-sm"
          />
        </div>
      );
    }

    if (expr.type === 'operation') {
      const operatorInfo = MATH_OPERATORS.find(op => op.name === expr.operator);

      return (
        <div className="border border-border rounded-lg p-3 bg-muted/50">
          {/* Operator selector */}
          <div className="flex items-center gap-2 mb-2">
            <Select
              value={expr.operator}
              onChange={(value) => {
                const updated = { ...expr, operator: value as MathOperator };
                updateExpressionAtPath(path, updated);
              }}
            >
              {MATH_OPERATORS.map(op => (
                <option key={op.name} value={op.name}>
                  {op.label}
                </option>
              ))}
            </Select>
            <span className="text-2xl font-bold text-accent-blue">
              {operatorInfo?.symbol}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeExpression(path)}
              title="Remove operation"
            >
              <Trash2 className="size-4 text-destructive" />
            </Button>
          </div>

          {/* Left operand */}
          <div className="mb-2">
            <div className="text-xs text-muted-foreground mb-1">Left:</div>
            {expr.left && renderExpression(expr.left, [...path, 0], depth + 1)}
          </div>

          {/* Right operand (if binary operator) */}
          {!['sqrt', 'abs', 'round', 'floor', 'ceil'].includes(expr.operator || '') && (
            <div>
              <div className="text-xs text-muted-foreground mb-1">Right:</div>
              {expr.right && renderExpression(expr.right, [...path, 1], depth + 1)}
            </div>
          )}
        </div>
      );
    }

    return <div>Unknown expression type</div>;
  };

  const updateExpressionAtPath = (path: number[], updated: MathExpression) => {
    const newExpression = JSON.parse(JSON.stringify(expression)); // Deep clone
    let current: any = newExpression;

    for (let i = 0; i < path.length - 1; i++) {
      current = path[i] === 0 ? current.left : current.right;
    }

    if (path.length === 0) {
      handleExpressionChange(updated);
    } else {
      const lastIndex = path[path.length - 1];
      if (lastIndex === 0) {
        current.left = updated;
      } else {
        current.right = updated;
      }
      handleExpressionChange(newExpression);
    }
  };

  const convertToOperation = (path: number[]) => {
    const newOperation: MathExpression = {
      type: 'operation',
      operator: 'add',
      left: { type: 'value', value: 0 },
      right: { type: 'value', value: 0 },
    };
    updateExpressionAtPath(path, newOperation);
  };

  const removeExpression = (path: number[]) => {
    updateExpressionAtPath(path, { type: 'value', value: 0 });
  };

  // Convert to formula string for preview
  const expressionToFormula = (expr: MathExpression): string => {
    if (expr.type === 'value') return String(expr.value || 0);
    if (expr.type === 'variable') return String(expr.value || 'x');
    if (expr.type === 'operation') {
      const op = MATH_OPERATORS.find(o => o.name === expr.operator);
      const left = expr.left ? expressionToFormula(expr.left) : '0';
      const right = expr.right ? expressionToFormula(expr.right) : '0';

      // Unary operators
      if (['sqrt', 'abs', 'round', 'floor', 'ceil'].includes(expr.operator || '')) {
        return `${expr.operator}(${left})`;
      }

      // Binary operators
      return `(${left} ${op?.symbol} ${right})`;
    }
    return '';
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Expression tree */}
      <div className="border border-border rounded-lg p-4 bg-background">
        {renderExpression(expression)}
      </div>

      {/* Formula preview */}
      <div className="border border-border rounded-lg p-3 bg-muted">
        <div className="text-xs text-muted-foreground mb-1">Formula:</div>
        <div className="font-mono text-sm">{expressionToFormula(expression)}</div>
      </div>

      {/* Actions */}
      {onSave && (
        <div className="flex justify-end">
          <Button size="sm" onClick={onSave}>
            Save Math Expression
          </Button>
        </div>
      )}
    </div>
  );
}
```

### 6.3 Integrate Math Builder with Node Config (1h)

**File:** `apps/web/src/features/workflow-units/components/workflow-builder/node-config-panel.tsx`

Add math builder for math nodes:

```typescript
import { MathBuilder } from '../expression-builder/math-builder';

if (selectedNode?.type === 'math') {
  const currentExpression = selectedNode.data.config?.expression;

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Math Operation</h3>

      <MathBuilder
        initialExpression={currentExpression}
        onChange={(expression) => {
          updateNodeData(selectedNode.id, {
            config: {
              ...selectedNode.data.config,
              expression,
            },
          });
        }}
        onSave={() => {
          // Close panel or show success
        }}
      />
    </div>
  );
}
```

### 6.4 Add Visual Math Operators Palette (1.5h)

**File:** `apps/web/src/features/workflow-units/components/expression-builder/operator-palette.tsx` (new)

```typescript
import { MATH_OPERATORS } from './math-operators';
import { Button } from '@workspace/ui/components/button';

interface OperatorPaletteProps {
  onSelect: (operator: string) => void;
}

export function OperatorPalette({ onSelect }: OperatorPaletteProps) {
  return (
    <div className="grid grid-cols-4 gap-2 p-3 bg-muted rounded-lg">
      {MATH_OPERATORS.map(op => (
        <Button
          key={op.name}
          variant="outline"
          size="sm"
          onClick={() => onSelect(op.name)}
          className="h-12 flex flex-col items-center justify-center gap-1"
          title={op.label}
        >
          <span className="text-lg font-bold">{op.symbol}</span>
          <span className="text-xs">{op.name}</span>
        </Button>
      ))}
    </div>
  );
}
```

### 6.5 Math Expression Templates (0.5h)

**File:** `apps/web/src/features/workflow-units/components/expression-builder/math-templates.ts` (new)

```typescript
import { MathExpression } from './math-operators';

export const MATH_TEMPLATES: Record<string, { label: string; expression: MathExpression }> = {
  percentage: {
    label: 'Calculate Percentage',
    expression: {
      type: 'operation',
      operator: 'divide',
      left: {
        type: 'operation',
        operator: 'multiply',
        left: { type: 'variable', value: 'value' },
        right: { type: 'value', value: 100 },
      },
      right: { type: 'variable', value: 'total' },
    },
  },
  average: {
    label: 'Calculate Average',
    expression: {
      type: 'operation',
      operator: 'divide',
      left: { type: 'variable', value: 'sum' },
      right: { type: 'variable', value: 'count' },
    },
  },
  compound_interest: {
    label: 'Compound Interest',
    expression: {
      type: 'operation',
      operator: 'multiply',
      left: { type: 'variable', value: 'principal' },
      right: {
        type: 'operation',
        operator: 'power',
        left: {
          type: 'operation',
          operator: 'add',
          left: { type: 'value', value: 1 },
          right: { type: 'variable', value: 'rate' },
        },
        right: { type: 'variable', value: 'time' },
      },
    },
  },
};
```

### 6.6 Convert Math Expression to YAML-Compatible Format (1h)

**File:** `apps/web/src/features/workflow-units/utils/math-expression-converter.ts` (new)

```typescript
import { MathExpression } from '../components/expression-builder/math-operators';

/**
 * Convert visual math expression to YAML-compatible object
 */
export function mathExpressionToYAML(expr: MathExpression): any {
  if (expr.type === 'value') {
    return { type: 'value', value: expr.value };
  }

  if (expr.type === 'variable') {
    return { type: 'variable', name: expr.value };
  }

  if (expr.type === 'operation') {
    const result: any = {
      type: 'operation',
      operator: expr.operator,
    };

    if (expr.left) {
      result.left = mathExpressionToYAML(expr.left);
    }

    if (expr.right) {
      result.right = mathExpressionToYAML(expr.right);
    }

    return result;
  }

  return null;
}

/**
 * Convert YAML math object to visual expression
 */
export function yamlToMathExpression(yaml: any): MathExpression | null {
  if (!yaml || typeof yaml !== 'object') return null;

  if (yaml.type === 'value') {
    return { type: 'value', value: yaml.value };
  }

  if (yaml.type === 'variable') {
    return { type: 'variable', value: yaml.name };
  }

  if (yaml.type === 'operation') {
    return {
      type: 'operation',
      operator: yaml.operator,
      left: yaml.left ? yamlToMathExpression(yaml.left) : undefined,
      right: yaml.right ? yamlToMathExpression(yaml.right) : undefined,
    };
  }

  return null;
}
```

### 6.7 Testing (0.5h)

**File:** `apps/web/src/features/workflow-units/__tests__/math-builder.test.tsx` (new)

Tests:

1. Math builder renders with simple value
2. Convert value to operation works
3. Nested operations render correctly
4. Formula preview matches structure
5. Conversion to/from YAML preserves structure
6. Operator palette selection works
7. Template selection populates complex expressions

## Validation Checklist

- [ ] Math operators defined with symbols
- [ ] MathBuilder component created
- [ ] Visual tree representation of expressions
- [ ] Operator palette for quick insertion
- [ ] Math templates for common formulas
- [ ] Conversion to/from YAML format
- [ ] Integrated into math node config
- [ ] Manual test: build complex formula works

## Visual Design

```
┌──────────────────────────────────────────┐
│ Math Operation                           │
├──────────────────────────────────────────┤
│ Operators: [+] [-] [×] [÷] [%] [^] [√]  │
├──────────────────────────────────────────┤
│ ┌─ ÷ Divide ──────────────────────────┐ │
│ │ Left:                               │ │
│ │   ┌─ × Multiply ────────────────┐   │ │
│ │   │ Left:  [100]                │   │ │
│ │   │ Right: [variable: price]    │   │ │
│ │   └──────────────────────────────┘   │ │
│ │ Right:                              │ │
│ │   [variable: quantity]              │ │
│ └──────────────────────────────────────┘│
│                                          │
│ Formula: ((100 × price) ÷ quantity)     │
└──────────────────────────────────────────┘
```

## Dependencies

- Phase 05 (expression builder foundation)

## Risks

- **Risk:** Deeply nested math expressions difficult to visualize
  **Mitigation:** Add collapse/expand for deep trees, max depth warning

- **Risk:** Users make syntax errors in formula
  **Mitigation:** Live validation, show evaluation result preview

## Next Phase

Phase 07 implements bidirectional conversion preserving all nested structures.
