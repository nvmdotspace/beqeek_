/**
 * MathForm - Mathematical operations configuration
 *
 * Configures arithmetic and math function operations.
 * Supports both simple mode (single operation) and visual builder mode.
 */

import { useState } from 'react';
import { Input } from '@workspace/ui/components/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs';
import { Button } from '@workspace/ui/components/button';
import { FormField } from '../form-field';
import { MathBuilder, MATH_TEMPLATES, type MathExpression } from '../../../expression-builder';

interface MathFormProps {
  data: Record<string, unknown>;
  onUpdate: (data: Record<string, unknown>) => void;
}

export function MathForm({ data, onUpdate }: MathFormProps) {
  const config = (data.config as Record<string, unknown>) || {};
  const name = (data.label as string) || 'math';
  const operation = (config.operation as string) || 'add';
  const operandA = (config.operandA as string) || '';
  const operandB = (config.operandB as string) || '';
  const precision = (config.precision as number) ?? 2;
  const mathExpression = config.mathExpression as MathExpression | undefined;

  // Determine initial mode
  const hasExpression = mathExpression && mathExpression.type;
  const [mode, setMode] = useState<'simple' | 'visual'>(hasExpression ? 'visual' : 'simple');

  const updateConfig = (updates: Record<string, unknown>) => {
    onUpdate({ config: { ...config, ...updates } });
  };

  const handleExpressionChange = (expr: MathExpression) => {
    updateConfig({ mathExpression: expr });
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = MATH_TEMPLATES.find((t) => t.id === templateId);
    if (template) {
      updateConfig({ mathExpression: template.expression });
    }
  };

  const isBinaryOperation = ['add', 'subtract', 'multiply', 'divide', 'modulo', 'power', 'min', 'max'].includes(
    operation,
  );
  const isUnaryOperation = ['abs', 'round', 'floor', 'ceil', 'sqrt', 'log', 'exp', 'negate'].includes(operation);

  return (
    <div className="space-y-4">
      <FormField label="Name" htmlFor="math-name" description="Unique identifier for this step" required>
        <Input id="math-name" value={name} onChange={(e) => onUpdate({ label: e.target.value })} placeholder="math" />
      </FormField>

      {/* Mode Selector */}
      <Tabs value={mode} onValueChange={(v) => setMode(v as typeof mode)}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="simple">Simple</TabsTrigger>
          <TabsTrigger value="visual">Visual Builder</TabsTrigger>
        </TabsList>

        {/* Simple Mode */}
        <TabsContent value="simple" className="space-y-4 mt-4">
          <FormField
            label="Operation"
            htmlFor="math-operation"
            description="Mathematical operation to perform"
            required
          >
            <Select value={operation} onValueChange={(value) => updateConfig({ operation: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select operation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="add">Add (+)</SelectItem>
                <SelectItem value="subtract">Subtract (-)</SelectItem>
                <SelectItem value="multiply">Multiply (*)</SelectItem>
                <SelectItem value="divide">Divide (/)</SelectItem>
                <SelectItem value="modulo">Modulo (%)</SelectItem>
                <SelectItem value="power">Power (^)</SelectItem>
                <SelectItem value="min">Minimum</SelectItem>
                <SelectItem value="max">Maximum</SelectItem>
                <SelectItem value="abs">Absolute Value</SelectItem>
                <SelectItem value="round">Round</SelectItem>
                <SelectItem value="floor">Floor</SelectItem>
                <SelectItem value="ceil">Ceiling</SelectItem>
                <SelectItem value="sqrt">Square Root</SelectItem>
                <SelectItem value="log">Logarithm</SelectItem>
                <SelectItem value="exp">Exponential</SelectItem>
                <SelectItem value="negate">Negate</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <FormField
            label={isUnaryOperation ? 'Value' : 'First Operand'}
            htmlFor="math-operand-a"
            description="Numeric value or variable reference"
            required
          >
            <Input
              id="math-operand-a"
              value={operandA}
              onChange={(e) => updateConfig({ operandA: e.target.value })}
              placeholder="$[trigger.quantity]"
              className="font-mono"
            />
          </FormField>

          {isBinaryOperation && (
            <FormField
              label="Second Operand"
              htmlFor="math-operand-b"
              description="Numeric value or variable reference"
              required
            >
              <Input
                id="math-operand-b"
                value={operandB}
                onChange={(e) => updateConfig({ operandB: e.target.value })}
                placeholder="$[trigger.price]"
                className="font-mono"
              />
            </FormField>
          )}
        </TabsContent>

        {/* Visual Builder Mode */}
        <TabsContent value="visual" className="space-y-4 mt-4">
          {/* Quick Templates */}
          <div className="space-y-2">
            <div className="text-xs font-medium text-muted-foreground">Quick Templates</div>
            <div className="flex flex-wrap gap-1.5">
              {MATH_TEMPLATES.slice(0, 4).map((template) => (
                <Button
                  key={template.id}
                  variant="outline"
                  size="sm"
                  onClick={() => handleTemplateSelect(template.id)}
                  className="text-xs h-7"
                  title={template.description}
                >
                  {template.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Math Builder */}
          <MathBuilder
            initialExpression={mathExpression || { type: 'value', value: 0 }}
            onChange={handleExpressionChange}
          />
        </TabsContent>
      </Tabs>

      {/* Common settings */}
      <div className="border-t border-border pt-4">
        <FormField label="Decimal Precision" htmlFor="math-precision" description="Number of decimal places in result">
          <Input
            id="math-precision"
            type="number"
            min={0}
            max={10}
            value={precision}
            onChange={(e) => updateConfig({ precision: parseInt(e.target.value) || 0 })}
            placeholder="2"
          />
        </FormField>
      </div>

      <div className="rounded-md bg-muted p-3 text-xs">
        <p className="font-medium mb-1">Result access:</p>
        <p className="text-muted-foreground">
          Use <code className="text-primary">$[{name}.result]</code> to get the computed value
        </p>
      </div>
    </div>
  );
}
