/**
 * KeyValueRow - Single key-value pair in the builder
 */

import { Input } from '@workspace/ui/components/input';
import { Button } from '@workspace/ui/components/button';
import { Trash2, Variable } from 'lucide-react';
import { VariablePicker } from './variable-picker';

export interface KeyValuePair {
  key: string;
  value: string;
}

interface KeyValueRowProps {
  pair: KeyValuePair;
  index: number;
  onChange: (index: number, field: 'key' | 'value', value: string) => void;
  onRemove: (index: number) => void;
  onInsertVariable: (index: number, variable: string) => void;
  contextVariables: string[];
  canRemove: boolean;
}

export function KeyValueRow({
  pair,
  index,
  onChange,
  onRemove,
  onInsertVariable,
  contextVariables,
  canRemove,
}: KeyValueRowProps) {
  return (
    <div className="flex gap-2 items-start">
      <Input
        value={pair.key}
        onChange={(e) => onChange(index, 'key', e.target.value)}
        placeholder="key"
        className="flex-1 font-mono text-sm h-9"
      />
      <div className="flex-[2] flex gap-1">
        <Input
          value={pair.value}
          onChange={(e) => onChange(index, 'value', e.target.value)}
          placeholder="value"
          className="flex-1 font-mono text-sm h-9"
        />
        <VariablePicker variables={contextVariables} onSelect={(variable) => onInsertVariable(index, variable)}>
          <Button type="button" variant="ghost" size="icon" className="h-9 w-9 shrink-0" title="Insert variable">
            <Variable className="h-4 w-4" />
          </Button>
        </VariablePicker>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => onRemove(index)}
        disabled={!canRemove}
        className="h-9 w-9 shrink-0"
        title="Remove"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
