/**
 * ConditionForm - Conditional branching configuration
 *
 * Configures if/else logic with expression and branch paths.
 */

import { Input } from '@workspace/ui/components/input';
import { Textarea } from '@workspace/ui/components/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
import { FormField } from '../form-field';

interface ConditionFormProps {
  data: Record<string, unknown>;
  onUpdate: (data: Record<string, unknown>) => void;
}

export function ConditionForm({ data, onUpdate }: ConditionFormProps) {
  const config = (data.config as Record<string, unknown>) || {};
  const name = (data.label as string) || 'condition';
  const operator = (config.operator as string) || 'equals';
  const leftOperand = (config.leftOperand as string) || '';
  const rightOperand = (config.rightOperand as string) || '';
  const expression = (config.expression as string) || '';
  const thenBranch = (config.thenBranch as string) || '';
  const elseBranch = (config.elseBranch as string) || '';

  const updateConfig = (updates: Record<string, unknown>) => {
    onUpdate({ config: { ...config, ...updates } });
  };

  const isAdvanced = operator === 'expression';

  return (
    <div className="space-y-4">
      <FormField label="Name" htmlFor="condition-name" description="Unique identifier for this step" required>
        <Input
          id="condition-name"
          value={name}
          onChange={(e) => onUpdate({ label: e.target.value })}
          placeholder="condition"
        />
      </FormField>

      <FormField label="Operator" htmlFor="condition-operator" description="Comparison type" required>
        <Select value={operator} onValueChange={(value) => updateConfig({ operator: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select operator" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="equals">Equals (==)</SelectItem>
            <SelectItem value="not_equals">Not Equals (!=)</SelectItem>
            <SelectItem value="greater_than">Greater Than (&gt;)</SelectItem>
            <SelectItem value="less_than">Less Than (&lt;)</SelectItem>
            <SelectItem value="greater_equal">Greater or Equal (&gt;=)</SelectItem>
            <SelectItem value="less_equal">Less or Equal (&lt;=)</SelectItem>
            <SelectItem value="contains">Contains</SelectItem>
            <SelectItem value="not_contains">Not Contains</SelectItem>
            <SelectItem value="starts_with">Starts With</SelectItem>
            <SelectItem value="ends_with">Ends With</SelectItem>
            <SelectItem value="is_empty">Is Empty</SelectItem>
            <SelectItem value="is_not_empty">Is Not Empty</SelectItem>
            <SelectItem value="expression">Custom Expression</SelectItem>
          </SelectContent>
        </Select>
      </FormField>

      {!isAdvanced ? (
        <>
          <FormField
            label="Left Operand"
            htmlFor="condition-left"
            description="Value to compare, e.g. $[trigger.status]"
            required
          >
            <Input
              id="condition-left"
              value={leftOperand}
              onChange={(e) => updateConfig({ leftOperand: e.target.value })}
              placeholder="$[trigger.status]"
              className="font-mono"
            />
          </FormField>

          <FormField label="Right Operand" htmlFor="condition-right" description="Value to compare against" required>
            <Input
              id="condition-right"
              value={rightOperand}
              onChange={(e) => updateConfig({ rightOperand: e.target.value })}
              placeholder="active"
              className="font-mono"
            />
          </FormField>
        </>
      ) : (
        <FormField label="Expression" htmlFor="condition-expression" description="Custom boolean expression" required>
          <Textarea
            id="condition-expression"
            value={expression}
            onChange={(e) => updateConfig({ expression: e.target.value })}
            placeholder="$[trigger.amount] > 100 && $[trigger.status] == 'pending'"
            className="font-mono text-sm min-h-[80px]"
          />
        </FormField>
      )}

      <FormField label="Then Branch" htmlFor="condition-then" description="Stage to execute if condition is true">
        <Input
          id="condition-then"
          value={thenBranch}
          onChange={(e) => updateConfig({ thenBranch: e.target.value })}
          placeholder="process_order"
        />
      </FormField>

      <FormField label="Else Branch" htmlFor="condition-else" description="Stage to execute if condition is false">
        <Input
          id="condition-else"
          value={elseBranch}
          onChange={(e) => updateConfig({ elseBranch: e.target.value })}
          placeholder="reject_order"
        />
      </FormField>

      <div className="rounded-md bg-muted p-3 text-xs">
        <p className="font-medium mb-1">Variable syntax:</p>
        <ul className="space-y-1 text-muted-foreground list-disc list-inside">
          <li>
            <code className="text-primary">$[trigger.*]</code> - Trigger data
          </li>
          <li>
            <code className="text-primary">$[step_name.*]</code> - Step output
          </li>
          <li>
            <code className="text-primary">$[env.*]</code> - Environment vars
          </li>
        </ul>
      </div>
    </div>
  );
}
