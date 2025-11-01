/**
 * RecordFieldDisplay Component
 *
 * Displays a single field value from a record with proper formatting
 * based on field type
 */

import { format } from 'date-fns';
import type { FieldConfig } from '@workspace/active-tables-core';
import { Badge } from '@workspace/ui/components/badge';

export interface RecordFieldDisplayProps {
  /** Field configuration */
  field: FieldConfig;

  /** Field value */
  value: unknown;

  /** Display mode: 'inline' | 'block' */
  mode?: 'inline' | 'block';

  /** Show field label */
  showLabel?: boolean;

  /** Custom class name */
  className?: string;
}

/**
 * Format field value for display based on type
 */
export function RecordFieldDisplay({
  field,
  value,
  mode = 'block',
  showLabel = true,
  className = '',
}: RecordFieldDisplayProps) {
  const displayValue = formatFieldValue(field, value);
  const isInline = mode === 'inline';

  // Handle empty values
  if (!displayValue) {
    return (
      <div className={`${isInline ? 'inline-flex items-center gap-2' : 'space-y-1'} ${className}`}>
        {showLabel && <label className="text-sm font-medium text-muted-foreground">{field.label}</label>}
        <div className="text-sm text-muted-foreground italic">—</div>
      </div>
    );
  }

  // Render based on field type
  return (
    <div className={`${isInline ? 'inline-flex items-center gap-2' : 'space-y-1'} ${className}`}>
      {showLabel && <label className="text-sm font-medium text-muted-foreground">{field.label}</label>}
      <div className="text-sm">{renderFieldValue(field, displayValue)}</div>
    </div>
  );
}

/**
 * Format value based on field type
 */
function formatFieldValue(field: FieldConfig, value: unknown): string | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  switch (field.type) {
    case 'DATE':
    case 'DATETIME': {
      try {
        const date = new Date(value as string);
        if (field.type === 'DATE') {
          return format(date, 'MMM dd, yyyy');
        }
        return format(date, 'MMM dd, yyyy HH:mm');
      } catch {
        return String(value);
      }
    }

    case 'TIME': {
      try {
        const time = new Date(`1970-01-01T${value}`);
        return format(time, 'HH:mm');
      } catch {
        return String(value);
      }
    }

    case 'CHECKBOX_YES_NO': {
      return value ? 'Yes' : 'No';
    }

    case 'INTEGER':
    case 'NUMERIC': {
      if (typeof value === 'number') {
        return field.type === 'INTEGER' ? value.toString() : value.toFixed(2);
      }
      return String(value);
    }

    case 'SELECT_ONE':
    case 'SELECT_ONE_RECORD':
    case 'SELECT_ONE_WORKSPACE_USER': {
      // Find the option text if available
      if (field.options && Array.isArray(field.options)) {
        const option = field.options.find((opt) => opt.value === value);
        if (option) {
          return option.text;
        }
      }
      return String(value);
    }

    case 'SELECT_LIST':
    case 'CHECKBOX_LIST':
    case 'SELECT_LIST_RECORD':
    case 'SELECT_LIST_WORKSPACE_USER': {
      if (Array.isArray(value)) {
        if (field.options && Array.isArray(field.options)) {
          return value
            .map((val) => {
              const option = field.options!.find((opt) => opt.value === val);
              return option ? option.text : String(val);
            })
            .join(', ');
        }
        return value.join(', ');
      }
      return String(value);
    }

    case 'RICH_TEXT': {
      // Strip HTML tags for plain text display
      const text = String(value).replace(/<[^>]*>/g, '');
      return text.substring(0, 200) + (text.length > 200 ? '...' : '');
    }

    case 'TEXT': {
      const text = String(value);
      return text.substring(0, 200) + (text.length > 200 ? '...' : '');
    }

    default: {
      return String(value);
    }
  }
}

/**
 * Render field value with appropriate styling
 */
function renderFieldValue(field: FieldConfig, displayValue: string) {
  // Render select options as badges
  if (field.type === 'SELECT_ONE' && field.options) {
    const option = field.options.find((opt) => opt.text === displayValue);
    if (option) {
      return (
        <Badge
          style={{
            backgroundColor: option.background_color || undefined,
            color: option.text_color || undefined,
          }}
          className="font-medium"
        >
          {option.text}
        </Badge>
      );
    }
  }

  // Render select list as multiple badges
  if ((field.type === 'SELECT_LIST' || field.type === 'CHECKBOX_LIST') && field.options && displayValue) {
    const values = displayValue.split(', ');
    return (
      <div className="flex flex-wrap gap-1">
        {values.map((val, idx) => {
          const option = field.options!.find((opt) => opt.text === val);
          if (option) {
            return (
              <Badge
                key={idx}
                style={{
                  backgroundColor: option.background_color || undefined,
                  color: option.text_color || undefined,
                }}
                className="font-medium"
              >
                {option.text}
              </Badge>
            );
          }
          return <Badge key={idx}>{val}</Badge>;
        })}
      </div>
    );
  }

  // Render boolean as badge
  if (field.type === 'CHECKBOX_YES_NO') {
    return <Badge variant={displayValue === 'Yes' ? 'default' : 'secondary'}>{displayValue}</Badge>;
  }

  // Rich text - render HTML
  if (field.type === 'RICH_TEXT') {
    return (
      <div
        className="prose prose-sm dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: String(displayValue) }}
      />
    );
  }

  // Default text rendering
  return <span className="text-foreground">{displayValue}</span>;
}
