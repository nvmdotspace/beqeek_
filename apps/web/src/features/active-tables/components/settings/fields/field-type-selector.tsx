/**
 * Field Type Selector Component
 *
 * Displays grouped field types with icons and descriptions.
 * Organized by category: Text, Time, Numeric, Selection, Reference, User.
 */

import { useState } from 'react';
import {
  FileText,
  AlignLeft,
  Mail,
  Link,
  Calendar,
  Clock,
  Hash,
  CheckSquare,
  List,
  Users,
  GitBranch,
  ChevronDown,
} from 'lucide-react';
import { Label } from '@workspace/ui/components/label';
import { Badge } from '@workspace/ui/components/badge';
import { ScrollArea } from '@workspace/ui/components/scroll-area';
import { Separator } from '@workspace/ui/components/separator';
import {
  TEXT_FIELD_TYPES,
  TIME_FIELD_TYPES,
  NUMBER_FIELD_TYPES,
  SELECTION_FIELD_TYPES,
  REFERENCE_FIELD_TYPES,
  type FieldType,
  // Import field type constants
  FIELD_TYPE_SHORT_TEXT,
  FIELD_TYPE_TEXT,
  FIELD_TYPE_RICH_TEXT,
  FIELD_TYPE_EMAIL,
  FIELD_TYPE_URL,
  FIELD_TYPE_DATE,
  FIELD_TYPE_DATETIME,
  FIELD_TYPE_TIME,
  FIELD_TYPE_YEAR,
  FIELD_TYPE_MONTH,
  FIELD_TYPE_DAY,
  FIELD_TYPE_HOUR,
  FIELD_TYPE_MINUTE,
  FIELD_TYPE_SECOND,
  FIELD_TYPE_INTEGER,
  FIELD_TYPE_NUMERIC,
  FIELD_TYPE_CHECKBOX_YES_NO,
  FIELD_TYPE_CHECKBOX_ONE,
  FIELD_TYPE_CHECKBOX_LIST,
  FIELD_TYPE_SELECT_ONE,
  FIELD_TYPE_SELECT_LIST,
  FIELD_TYPE_SELECT_ONE_RECORD,
  FIELD_TYPE_SELECT_LIST_RECORD,
  FIELD_TYPE_FIRST_REFERENCE_RECORD,
  FIELD_TYPE_SELECT_ONE_WORKSPACE_USER,
  FIELD_TYPE_SELECT_LIST_WORKSPACE_USER,
} from '@workspace/beqeek-shared';

export interface FieldTypeSelectorProps {
  /** Currently selected field type */
  value?: FieldType;

  /** Callback when field type changes */
  onChange: (type: FieldType) => void;

  /** Disable selector */
  disabled?: boolean;

  /** Show error state */
  error?: boolean;
}

interface FieldTypeInfo {
  type: FieldType;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  category: string;
}

/**
 * Field type metadata organized by category
 */
const FIELD_TYPE_INFO: FieldTypeInfo[] = [
  // Text Fields
  {
    type: FIELD_TYPE_SHORT_TEXT,
    label: 'Short Text',
    description: 'Single line text (max 255 chars)',
    icon: FileText,
    category: 'Text',
  },
  {
    type: FIELD_TYPE_TEXT,
    label: 'Long Text',
    description: 'Multi-line text area',
    icon: AlignLeft,
    category: 'Text',
  },
  {
    type: FIELD_TYPE_RICH_TEXT,
    label: 'Rich Text',
    description: 'Formatted text with styling',
    icon: FileText,
    category: 'Text',
  },
  {
    type: FIELD_TYPE_EMAIL,
    label: 'Email',
    description: 'Email address validation',
    icon: Mail,
    category: 'Text',
  },
  {
    type: FIELD_TYPE_URL,
    label: 'URL',
    description: 'Web link validation',
    icon: Link,
    category: 'Text',
  },

  // Time Fields
  {
    type: FIELD_TYPE_DATE,
    label: 'Date',
    description: 'Calendar date (YYYY-MM-DD)',
    icon: Calendar,
    category: 'Time',
  },
  {
    type: FIELD_TYPE_DATETIME,
    label: 'Date & Time',
    description: 'Date with timestamp',
    icon: Calendar,
    category: 'Time',
  },
  {
    type: FIELD_TYPE_TIME,
    label: 'Time',
    description: 'Time of day (HH:MM:SS)',
    icon: Clock,
    category: 'Time',
  },
  {
    type: FIELD_TYPE_YEAR,
    label: 'Year',
    description: 'Year only (YYYY)',
    icon: Calendar,
    category: 'Time',
  },
  {
    type: FIELD_TYPE_MONTH,
    label: 'Month',
    description: 'Month (1-12)',
    icon: Calendar,
    category: 'Time',
  },
  {
    type: FIELD_TYPE_DAY,
    label: 'Day',
    description: 'Day of month (1-31)',
    icon: Calendar,
    category: 'Time',
  },
  {
    type: FIELD_TYPE_HOUR,
    label: 'Hour',
    description: 'Hour (0-23)',
    icon: Clock,
    category: 'Time',
  },
  {
    type: FIELD_TYPE_MINUTE,
    label: 'Minute',
    description: 'Minute (0-59)',
    icon: Clock,
    category: 'Time',
  },
  {
    type: FIELD_TYPE_SECOND,
    label: 'Second',
    description: 'Second (0-59)',
    icon: Clock,
    category: 'Time',
  },

  // Numeric Fields
  {
    type: FIELD_TYPE_INTEGER,
    label: 'Integer',
    description: 'Whole numbers only',
    icon: Hash,
    category: 'Numeric',
  },
  {
    type: FIELD_TYPE_NUMERIC,
    label: 'Decimal',
    description: 'Numbers with decimals',
    icon: Hash,
    category: 'Numeric',
  },

  // Selection Fields
  {
    type: FIELD_TYPE_CHECKBOX_YES_NO,
    label: 'Yes/No Checkbox',
    description: 'Boolean checkbox',
    icon: CheckSquare,
    category: 'Selection',
  },
  {
    type: FIELD_TYPE_CHECKBOX_ONE,
    label: 'Single Checkbox',
    description: 'Select one option',
    icon: CheckSquare,
    category: 'Selection',
  },
  {
    type: FIELD_TYPE_CHECKBOX_LIST,
    label: 'Multiple Checkboxes',
    description: 'Select multiple options',
    icon: CheckSquare,
    category: 'Selection',
  },
  {
    type: FIELD_TYPE_SELECT_ONE,
    label: 'Single Select',
    description: 'Dropdown select one',
    icon: List,
    category: 'Selection',
  },
  {
    type: FIELD_TYPE_SELECT_LIST,
    label: 'Multiple Select',
    description: 'Dropdown select many',
    icon: List,
    category: 'Selection',
  },

  // Reference Fields
  {
    type: FIELD_TYPE_SELECT_ONE_RECORD,
    label: 'Single Record Reference',
    description: 'Link to one record',
    icon: GitBranch,
    category: 'Reference',
  },
  {
    type: FIELD_TYPE_SELECT_LIST_RECORD,
    label: 'Multiple Record Reference',
    description: 'Link to many records',
    icon: GitBranch,
    category: 'Reference',
  },
  {
    type: FIELD_TYPE_FIRST_REFERENCE_RECORD,
    label: 'First Reference Record',
    description: 'Reverse lookup (read-only)',
    icon: GitBranch,
    category: 'Reference',
  },

  // User Fields
  {
    type: FIELD_TYPE_SELECT_ONE_WORKSPACE_USER,
    label: 'Single User',
    description: 'Assign to one user',
    icon: Users,
    category: 'User',
  },
  {
    type: FIELD_TYPE_SELECT_LIST_WORKSPACE_USER,
    label: 'Multiple Users',
    description: 'Assign to many users',
    icon: Users,
    category: 'User',
  },
];

/**
 * Get field type metadata by type
 */
function getFieldTypeInfo(type: FieldType): FieldTypeInfo {
  const found = FIELD_TYPE_INFO.find((info) => info.type === type);
  if (found) return found;

  // Fallback to first item (should always exist)
  const fallback = FIELD_TYPE_INFO[0];
  if (!fallback) {
    throw new Error('FIELD_TYPE_INFO is empty');
  }
  return fallback;
}

/**
 * Group field types by category
 */
function groupFieldTypesByCategory(): Record<string, FieldTypeInfo[]> {
  const groups: Record<string, FieldTypeInfo[]> = {};
  FIELD_TYPE_INFO.forEach((info) => {
    if (!groups[info.category]) {
      groups[info.category] = [];
    }
    const group = groups[info.category];
    if (group) {
      group.push(info);
    }
  });
  return groups;
}

/**
 * Field Type Selector Component
 *
 * Features:
 * - Grouped by category with visual separation
 * - Icons for each field type
 * - Descriptions for clarity
 * - Keyboard navigation
 * - Mobile-responsive
 */
export function FieldTypeSelector({ value, onChange, disabled, error }: FieldTypeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedInfo = value ? getFieldTypeInfo(value) : null;
  const groupedTypes = groupFieldTypesByCategory();

  const handleSelect = (type: FieldType) => {
    onChange(type);
    setIsOpen(false);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="field-type-selector">
        Field Type <span className="text-destructive">*</span>
      </Label>

      <div className="relative">
        {/* Trigger Button */}
        <button
          id="field-type-selector"
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`
            flex h-10 w-full items-center justify-between rounded-lg border
            bg-background px-3 py-2 text-sm
            placeholder:text-muted-foreground
            focus:outline-none focus:ring-1 focus:ring-inset focus:ring-ring
            disabled:cursor-not-allowed disabled:opacity-50
            transition-colors
            ${error ? 'border-destructive' : 'border-input'}
          `}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        >
          {selectedInfo ? (
            <div className="flex items-center gap-2">
              <selectedInfo.icon className="h-4 w-4 text-muted-foreground" />
              <span>{selectedInfo.label}</span>
              <Badge variant="outline" className="text-xs">
                {selectedInfo.category}
              </Badge>
            </div>
          ) : (
            <span className="text-muted-foreground">Select field type...</span>
          )}
          <ChevronDown className="h-4 w-4 opacity-50" />
        </button>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute z-50 mt-1 w-full rounded-lg border bg-popover shadow-lg">
            <ScrollArea className="h-[400px]">
              <div className="p-2">
                {Object.entries(groupedTypes).map(([category, types], categoryIndex) => (
                  <div key={category}>
                    {categoryIndex > 0 && <Separator className="my-2" />}

                    {/* Category Header */}
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">{category} Fields</div>

                    {/* Field Types */}
                    {types.map((typeInfo) => {
                      const Icon = typeInfo.icon;
                      const isSelected = value === typeInfo.type;

                      return (
                        <button
                          key={typeInfo.type}
                          type="button"
                          onClick={() => handleSelect(typeInfo.type)}
                          className={`
                            w-full flex items-start gap-3 rounded-md p-2 text-left
                            transition-colors
                            hover:bg-accent hover:text-accent-foreground
                            ${isSelected ? 'bg-accent text-accent-foreground' : ''}
                          `}
                          role="option"
                          aria-selected={isSelected}
                        >
                          <Icon className="h-4 w-4 mt-0.5 shrink-0" />
                          <div className="flex-1 space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{typeInfo.label}</span>
                              {isSelected && (
                                <Badge variant="default" className="h-4 text-xs">
                                  Selected
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">{typeInfo.description}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && <p className="text-sm text-destructive">Field type is required</p>}

      {/* Help Text */}
      {selectedInfo && (
        <p className="text-sm text-muted-foreground">
          Selected: <strong>{selectedInfo.label}</strong> - {selectedInfo.description}
        </p>
      )}
    </div>
  );
}
