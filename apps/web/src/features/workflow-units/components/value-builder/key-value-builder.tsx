/**
 * KeyValueBuilder - Visual builder for object key-value pairs
 *
 * Allows users to build JSON objects visually with variable insertion support.
 */

import { useState, useCallback, useEffect } from 'react';
import { Button } from '@workspace/ui/components/button';
import { Plus } from 'lucide-react';
import { KeyValueRow, type KeyValuePair } from './key-value-row';

interface KeyValueBuilderProps {
  value: string;
  onChange: (value: string) => void;
  contextVariables?: string[];
}

function parseJsonToKeyValues(json: string): KeyValuePair[] {
  try {
    const parsed = JSON.parse(json || '{}');
    if (typeof parsed !== 'object' || Array.isArray(parsed) || parsed === null) {
      return [{ key: '', value: '' }];
    }
    const entries = Object.entries(parsed);
    if (entries.length === 0) {
      return [{ key: '', value: '' }];
    }
    return entries.map(([key, val]) => ({
      key,
      value: typeof val === 'string' ? val : JSON.stringify(val),
    }));
  } catch {
    return [{ key: '', value: '' }];
  }
}

function keyValuesToJson(pairs: KeyValuePair[]): string {
  const obj: Record<string, unknown> = {};
  for (const pair of pairs) {
    if (pair.key.trim()) {
      // Try to parse value as JSON, otherwise use as string
      try {
        obj[pair.key] = JSON.parse(pair.value);
      } catch {
        obj[pair.key] = pair.value;
      }
    }
  }
  return JSON.stringify(obj, null, 2);
}

export function KeyValueBuilder({ value, onChange, contextVariables = [] }: KeyValueBuilderProps) {
  const [pairs, setPairs] = useState<KeyValuePair[]>(() => parseJsonToKeyValues(value));

  // Sync pairs when external value changes
  useEffect(() => {
    const newPairs = parseJsonToKeyValues(value);
    // Only update if actually different to avoid loops
    const currentJson = keyValuesToJson(pairs);
    if (value !== currentJson) {
      setPairs(newPairs);
    }
  }, [value, pairs]);

  const handleChange = useCallback(
    (index: number, field: 'key' | 'value', newValue: string) => {
      const updated = pairs.map((p, i) => (i === index ? { ...p, [field]: newValue } : p));
      setPairs(updated);
      onChange(keyValuesToJson(updated));
    },
    [pairs, onChange],
  );

  const handleRemove = useCallback(
    (index: number) => {
      if (pairs.length <= 1) return;
      const updated = pairs.filter((_, i) => i !== index);
      setPairs(updated);
      onChange(keyValuesToJson(updated));
    },
    [pairs, onChange],
  );

  const handleAdd = useCallback(() => {
    const updated = [...pairs, { key: '', value: '' }];
    setPairs(updated);
    onChange(keyValuesToJson(updated));
  }, [pairs, onChange]);

  const handleInsertVariable = useCallback(
    (index: number, variable: string) => {
      const updated = pairs.map((p, i) => (i === index ? { ...p, value: p.value + variable } : p));
      setPairs(updated);
      onChange(keyValuesToJson(updated));
    },
    [pairs, onChange],
  );

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
        <span>Key</span>
        <span>Value</span>
      </div>

      {pairs.map((pair, index) => (
        <KeyValueRow
          key={index}
          pair={pair}
          index={index}
          onChange={handleChange}
          onRemove={handleRemove}
          onInsertVariable={handleInsertVariable}
          contextVariables={contextVariables}
          canRemove={pairs.length > 1}
        />
      ))}

      <Button type="button" variant="outline" size="sm" onClick={handleAdd} className="w-full h-8 text-xs">
        <Plus className="h-3 w-3 mr-1" />
        Add Field
      </Button>
    </div>
  );
}
