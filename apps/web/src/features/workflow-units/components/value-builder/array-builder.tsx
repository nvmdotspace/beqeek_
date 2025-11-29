/**
 * ArrayBuilder - Visual builder for JSON arrays
 *
 * Allows users to build JSON arrays visually with variable insertion support.
 */

import { useState, useCallback, useEffect } from 'react';
import { Input } from '@workspace/ui/components/input';
import { Button } from '@workspace/ui/components/button';
import { Plus, Trash2, Variable, GripVertical } from 'lucide-react';
import { VariablePicker } from './variable-picker';

interface ArrayBuilderProps {
  value: string;
  onChange: (value: string) => void;
  contextVariables?: string[];
}

function parseJsonToArray(json: string): string[] {
  try {
    const parsed = JSON.parse(json || '[]');
    if (!Array.isArray(parsed)) {
      return [''];
    }
    if (parsed.length === 0) {
      return [''];
    }
    return parsed.map((item) => (typeof item === 'string' ? item : JSON.stringify(item)));
  } catch {
    return [''];
  }
}

function arrayToJson(items: string[]): string {
  const parsed = items
    .filter((item) => item.trim() !== '')
    .map((item) => {
      try {
        return JSON.parse(item);
      } catch {
        return item;
      }
    });
  return JSON.stringify(parsed, null, 2);
}

export function ArrayBuilder({ value, onChange, contextVariables = [] }: ArrayBuilderProps) {
  const [items, setItems] = useState<string[]>(() => parseJsonToArray(value));

  // Sync items when external value changes
  useEffect(() => {
    const newItems = parseJsonToArray(value);
    const currentJson = arrayToJson(items);
    if (value !== currentJson) {
      setItems(newItems);
    }
  }, [value]);

  const handleChange = useCallback(
    (index: number, newValue: string) => {
      const updated = items.map((item, i) => (i === index ? newValue : item));
      setItems(updated);
      onChange(arrayToJson(updated));
    },
    [items, onChange],
  );

  const handleRemove = useCallback(
    (index: number) => {
      if (items.length <= 1) return;
      const updated = items.filter((_, i) => i !== index);
      setItems(updated);
      onChange(arrayToJson(updated));
    },
    [items, onChange],
  );

  const handleAdd = useCallback(() => {
    const updated = [...items, ''];
    setItems(updated);
    onChange(arrayToJson(updated));
  }, [items, onChange]);

  const handleInsertVariable = useCallback(
    (index: number, variable: string) => {
      const updated = items.map((item, i) => (i === index ? item + variable : item));
      setItems(updated);
      onChange(arrayToJson(updated));
    },
    [items, onChange],
  );

  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div key={index} className="flex gap-2 items-center">
          <GripVertical className="h-4 w-4 text-muted-foreground shrink-0 cursor-move" />
          <span className="text-xs text-muted-foreground w-6 shrink-0">[{index}]</span>
          <Input
            value={item}
            onChange={(e) => handleChange(index, e.target.value)}
            placeholder="item value"
            className="flex-1 font-mono text-sm h-9"
          />
          <VariablePicker variables={contextVariables} onSelect={(variable) => handleInsertVariable(index, variable)}>
            <Button type="button" variant="ghost" size="icon" className="h-9 w-9 shrink-0" title="Insert variable">
              <Variable className="h-4 w-4" />
            </Button>
          </VariablePicker>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => handleRemove(index)}
            disabled={items.length <= 1}
            className="h-9 w-9 shrink-0"
            title="Remove"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}

      <Button type="button" variant="outline" size="sm" onClick={handleAdd} className="w-full h-8 text-xs">
        <Plus className="h-3 w-3 mr-1" />
        Add Item
      </Button>
    </div>
  );
}
