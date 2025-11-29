/**
 * DefinitionForm - Variable definition configuration
 *
 * Configures workflow-level variable definitions and constants.
 */

import { useState } from 'react';
import { Input } from '@workspace/ui/components/input';
import { Textarea } from '@workspace/ui/components/textarea';
import { Button } from '@workspace/ui/components/button';
import { Plus, Trash2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
import { FormField } from '../form-field';

interface Variable {
  key: string;
  value: string;
  type: 'string' | 'number' | 'boolean' | 'json';
}

interface DefinitionFormProps {
  data: Record<string, unknown>;
  onUpdate: (data: Record<string, unknown>) => void;
}

export function DefinitionForm({ data, onUpdate }: DefinitionFormProps) {
  const config = (data.config as Record<string, unknown>) || {};
  const name = (data.label as string) || 'definition';
  const rawVars = config.variables as Variable[] | undefined;
  const variables: Variable[] = rawVars?.length ? rawVars : [{ key: '', value: '', type: 'string' }];

  const [localVars, setLocalVars] = useState<Variable[]>(variables);

  const updateConfig = (updates: Record<string, unknown>) => {
    onUpdate({ config: { ...config, ...updates } });
  };

  const handleVarChange = (index: number, field: keyof Variable, newValue: string) => {
    const updated: Variable[] = localVars.map((v, i) =>
      i === index
        ? {
            key: v.key,
            value: v.value,
            type: v.type,
            [field]: field === 'type' ? (newValue as Variable['type']) : newValue,
          }
        : v,
    );
    setLocalVars(updated);
    updateConfig({ variables: updated });
  };

  const addVariable = () => {
    const updated = [...localVars, { key: '', value: '', type: 'string' as const }];
    setLocalVars(updated);
    updateConfig({ variables: updated });
  };

  const removeVariable = (index: number) => {
    if (localVars.length <= 1) return;
    const updated = localVars.filter((_, i) => i !== index);
    setLocalVars(updated);
    updateConfig({ variables: updated });
  };

  return (
    <div className="space-y-4">
      <FormField label="Name" htmlFor="def-name" description="Unique identifier for this step" required>
        <Input
          id="def-name"
          value={name}
          onChange={(e) => onUpdate({ label: e.target.value })}
          placeholder="definition"
        />
      </FormField>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Variables</span>
          <Button type="button" variant="outline" size="sm" onClick={addVariable} className="h-7 text-xs">
            <Plus className="h-3 w-3 mr-1" />
            Add Variable
          </Button>
        </div>

        {localVars.map((variable, index) => (
          <div key={index} className="p-3 border rounded-md space-y-2">
            <div className="flex gap-2 items-center">
              <Input
                value={variable.key}
                onChange={(e) => handleVarChange(index, 'key', e.target.value)}
                placeholder="variable_name"
                className="font-mono text-sm flex-1"
              />
              <Select value={variable.type} onValueChange={(value) => handleVarChange(index, 'type', value)}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="string">String</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="boolean">Boolean</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeVariable(index)}
                disabled={localVars.length <= 1}
                className="h-8 w-8 shrink-0"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            {variable.type === 'json' ? (
              <Textarea
                value={variable.value}
                onChange={(e) => handleVarChange(index, 'value', e.target.value)}
                placeholder={'{\n  "key": "value"\n}'}
                className="font-mono text-sm min-h-[60px]"
              />
            ) : variable.type === 'boolean' ? (
              <Select
                value={variable.value || 'true'}
                onValueChange={(value) => handleVarChange(index, 'value', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">True</SelectItem>
                  <SelectItem value="false">False</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <Input
                type={variable.type === 'number' ? 'number' : 'text'}
                value={variable.value}
                onChange={(e) => handleVarChange(index, 'value', e.target.value)}
                placeholder={variable.type === 'number' ? '0' : 'value'}
                className="font-mono text-sm"
              />
            )}
          </div>
        ))}
      </div>

      <div className="rounded-md bg-muted p-3 text-xs">
        <p className="font-medium mb-1">Access defined variables:</p>
        <ul className="space-y-1 text-muted-foreground list-disc list-inside">
          <li>
            <code className="text-primary">$[{name}.variable_name]</code>
          </li>
          <li>Variables are available to all subsequent steps</li>
        </ul>
      </div>
    </div>
  );
}
