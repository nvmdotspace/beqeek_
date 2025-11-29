/**
 * ValueBuilder - Main component for building JSON values
 *
 * Provides toggle between visual builder and JSON editor.
 * Supports object, array, or any mode.
 */

import { useState, useCallback } from 'react';
import { Button } from '@workspace/ui/components/button';
import { Code, List, Braces } from 'lucide-react';
import { cn } from '@workspace/ui/lib/utils';
import { JsonEditor } from './json-editor';
import { KeyValueBuilder } from './key-value-builder';
import { ArrayBuilder } from './array-builder';

export type ValueBuilderMode = 'object' | 'array' | 'any';
type ViewMode = 'visual' | 'json';

interface ValueBuilderProps {
  value: string;
  onChange: (value: string) => void;
  mode?: ValueBuilderMode;
  contextVariables?: string[];
  placeholder?: string;
  height?: string;
  className?: string;
}

export function ValueBuilder({
  value,
  onChange,
  mode = 'any',
  contextVariables = [],
  placeholder,
  height = '120px',
  className,
}: ValueBuilderProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('visual');

  // Determine default visual mode based on value or mode prop
  const getDefaultVisualMode = useCallback((): 'object' | 'array' => {
    if (mode === 'object') return 'object';
    if (mode === 'array') return 'array';

    // Auto-detect from value
    try {
      const parsed = JSON.parse(value || '{}');
      return Array.isArray(parsed) ? 'array' : 'object';
    } catch {
      return 'object';
    }
  }, [value, mode]);

  const [visualType, setVisualType] = useState<'object' | 'array'>(getDefaultVisualMode);

  const handleViewModeChange = (newMode: ViewMode) => {
    setViewMode(newMode);
  };

  const handleVisualTypeChange = (type: 'object' | 'array') => {
    setVisualType(type);
    // Convert value when switching types
    try {
      const parsed = JSON.parse(value || (type === 'array' ? '[]' : '{}'));
      if (type === 'array' && !Array.isArray(parsed)) {
        // Convert object to array of values
        onChange(JSON.stringify(Object.values(parsed), null, 2));
      } else if (type === 'object' && Array.isArray(parsed)) {
        // Convert array to object with index keys
        const obj: Record<string, unknown> = {};
        parsed.forEach((item, i) => {
          obj[`item_${i}`] = item;
        });
        onChange(JSON.stringify(obj, null, 2));
      }
    } catch {
      onChange(type === 'array' ? '[]' : '{}');
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      {/* Mode Toggle Bar */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant={viewMode === 'visual' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => handleViewModeChange('visual')}
            className="h-7 text-xs px-2"
          >
            {visualType === 'object' ? <Braces className="h-3 w-3 mr-1" /> : <List className="h-3 w-3 mr-1" />}
            Visual
          </Button>
          <Button
            type="button"
            variant={viewMode === 'json' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => handleViewModeChange('json')}
            className="h-7 text-xs px-2"
          >
            <Code className="h-3 w-3 mr-1" />
            JSON
          </Button>
        </div>

        {viewMode === 'visual' && mode === 'any' && (
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant={visualType === 'object' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => handleVisualTypeChange('object')}
              className="h-6 text-xs px-2"
            >
              <Braces className="h-3 w-3" />
            </Button>
            <Button
              type="button"
              variant={visualType === 'array' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => handleVisualTypeChange('array')}
              className="h-6 text-xs px-2"
            >
              <List className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>

      {/* Content */}
      {viewMode === 'json' ? (
        <JsonEditor value={value} onChange={onChange} height={height} placeholder={placeholder} />
      ) : visualType === 'array' || mode === 'array' ? (
        <ArrayBuilder value={value} onChange={onChange} contextVariables={contextVariables} />
      ) : (
        <KeyValueBuilder value={value} onChange={onChange} contextVariables={contextVariables} />
      )}
    </div>
  );
}
