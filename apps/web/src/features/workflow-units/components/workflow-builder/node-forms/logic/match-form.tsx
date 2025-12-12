/**
 * MatchForm - Switch/case matching configuration
 *
 * Configures value matching with multiple cases and default branch.
 */

import { useState } from 'react';
import { Input } from '@workspace/ui/components/input';
import { Button } from '@workspace/ui/components/button';
import { Plus, Trash2 } from 'lucide-react';
import { FormField } from '../form-field';

interface MatchCase {
  value: string;
  branch: string;
}

interface MatchFormProps {
  data: Record<string, unknown>;
  onUpdate: (data: Record<string, unknown>) => void;
}

export function MatchForm({ data, onUpdate }: MatchFormProps) {
  const config = (data.config as Record<string, unknown>) || {};
  const name = (data.label as string) || 'match';
  const value = (config.value as string) || '';
  const rawCases = config.cases as MatchCase[] | undefined;
  const cases: MatchCase[] = rawCases?.length ? rawCases : [{ value: '', branch: '' }];
  const defaultBranch = (config.defaultBranch as string) || '';

  const [localCases, setLocalCases] = useState<MatchCase[]>(cases);

  const updateConfig = (updates: Record<string, unknown>) => {
    onUpdate({ config: { ...config, ...updates } });
  };

  const handleCaseChange = (index: number, field: 'value' | 'branch', newValue: string) => {
    const updated: MatchCase[] = localCases.map((c, i) =>
      i === index ? { value: c.value, branch: c.branch, [field]: newValue } : c,
    );
    setLocalCases(updated);
    updateConfig({ cases: updated });
  };

  const addCase = () => {
    const updated = [...localCases, { value: '', branch: '' }];
    setLocalCases(updated);
    updateConfig({ cases: updated });
  };

  const removeCase = (index: number) => {
    if (localCases.length <= 1) return;
    const updated = localCases.filter((_, i) => i !== index);
    setLocalCases(updated);
    updateConfig({ cases: updated });
  };

  return (
    <div className="space-y-4">
      <FormField label="Name" htmlFor="match-name" description="Unique identifier for this step" required>
        <Input id="match-name" value={name} onChange={(e) => onUpdate({ label: e.target.value })} placeholder="match" />
      </FormField>

      <FormField
        label="Value to Match"
        htmlFor="match-value"
        description="Expression to evaluate, e.g. $[trigger.type]"
        required
      >
        <Input
          id="match-value"
          value={value}
          onChange={(e) => updateConfig({ value: e.target.value })}
          placeholder="$[trigger.type]"
          className="font-mono"
        />
      </FormField>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Cases</span>
          <Button type="button" variant="outline" size="sm" onClick={addCase} className="h-7 text-xs">
            <Plus className="h-3 w-3 mr-1" />
            Add Case
          </Button>
        </div>

        {localCases.map((matchCase, index) => (
          <div key={index} className="flex gap-2 items-start">
            <div className="flex-1 space-y-2">
              <Input
                value={matchCase.value}
                onChange={(e) => handleCaseChange(index, 'value', e.target.value)}
                placeholder="case value"
                className="font-mono text-sm"
              />
              <Input
                value={matchCase.branch}
                onChange={(e) => handleCaseChange(index, 'branch', e.target.value)}
                placeholder="branch stage name"
                className="text-sm"
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeCase(index)}
              disabled={localCases.length <= 1}
              className="h-8 w-8 shrink-0"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      <FormField label="Default Branch" htmlFor="match-default" description="Stage to execute if no case matches">
        <Input
          id="match-default"
          value={defaultBranch}
          onChange={(e) => updateConfig({ defaultBranch: e.target.value })}
          placeholder="handle_unknown"
        />
      </FormField>

      <div className="rounded-md bg-muted p-3 text-xs">
        <p className="font-medium mb-1">How match works:</p>
        <ul className="space-y-1 text-muted-foreground list-disc list-inside">
          <li>Evaluates the value expression</li>
          <li>Compares against each case in order</li>
          <li>Executes first matching case&apos;s branch</li>
          <li>Falls back to default if no match</li>
        </ul>
      </div>
    </div>
  );
}
