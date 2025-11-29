/**
 * MathForm - Mathematical operations configuration
 *
 * Configures arithmetic and math function operations.
 */

import { Input } from '@workspace/ui/components/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
import { FormField } from '../form-field';

interface MathFormProps {
  data: Record<string, unknown>;
  onUpdate: (data: Record<string, unknown>) => void;
}

export function MathForm({ data, onUpdate }: MathFormProps) {
  const name = (data.name as string) || 'math';
  const operation = (data.operation as string) || 'add';
  const operandA = (data.operandA as string) || '';
  const operandB = (data.operandB as string) || '';
  const precision = (data.precision as number) ?? 2;

  const isBinaryOperation = ['add', 'subtract', 'multiply', 'divide', 'modulo', 'power', 'min', 'max'].includes(
    operation,
  );
  const isUnaryOperation = ['abs', 'round', 'floor', 'ceil', 'sqrt', 'log', 'exp', 'negate'].includes(operation);

  return (
    <div className="space-y-4">
      <FormField label="Name" htmlFor="math-name" description="Unique identifier for this step" required>
        <Input id="math-name" value={name} onChange={(e) => onUpdate({ name: e.target.value })} placeholder="math" />
      </FormField>

      <FormField label="Operation" htmlFor="math-operation" description="Mathematical operation to perform" required>
        <Select value={operation} onValueChange={(value) => onUpdate({ operation: value })}>
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
          onChange={(e) => onUpdate({ operandA: e.target.value })}
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
            onChange={(e) => onUpdate({ operandB: e.target.value })}
            placeholder="$[trigger.price]"
            className="font-mono"
          />
        </FormField>
      )}

      <FormField label="Decimal Precision" htmlFor="math-precision" description="Number of decimal places in result">
        <Input
          id="math-precision"
          type="number"
          min={0}
          max={10}
          value={precision}
          onChange={(e) => onUpdate({ precision: parseInt(e.target.value) || 0 })}
          placeholder="2"
        />
      </FormField>

      <div className="rounded-md bg-muted p-3 text-xs">
        <p className="font-medium mb-1">Result access:</p>
        <p className="text-muted-foreground">
          Use <code className="text-primary">$[{name}.result]</code> to get the computed value
        </p>
      </div>
    </div>
  );
}
