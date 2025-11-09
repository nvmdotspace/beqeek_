/**
 * FieldSummary Component
 *
 * Displays field configuration information (metadata) rather than values
 * Used in table configuration views and field overviews
 */

import { Shield, Lock, Hash } from 'lucide-react';
import type { FieldConfig } from '../../types/field.js';
import { getEncryptionTypeForField } from '../../utils/encryption-helpers.js';
import { FieldBadge } from '../common/field-badge.js';

interface FieldSummaryProps {
  /** Field configuration to display */
  field: FieldConfig;
  /** Whether E2EE is enabled for this table */
  isE2EEEnabled?: boolean;
  /** Custom CSS class name */
  className?: string;
  /** Messages for localization */
  messages?: {
    required?: string;
    optional?: string;
    options?: string | ((count: number) => string);
  };
}

/**
 * FieldSummary component for displaying field configuration
 */
export function FieldSummary({ field, isE2EEEnabled = false, className = '', messages }: FieldSummaryProps) {
  const optionCount = field.options?.length ?? 0;
  const encryptionType = isE2EEEnabled ? getEncryptionTypeForField(field.type) : 'NONE';

  const requiredText = messages?.required || 'Required';
  const optionalText = messages?.optional || 'Optional';
  const optionsText =
    typeof messages?.options === 'function'
      ? messages.options(optionCount)
      : (messages?.options || '{count} options').replace('{count}', String(optionCount));

  // Using Tailwind classes to match Badge component from UI package without circular dependency
  return (
    <div className={`rounded-lg border border-border/60 bg-card/40 p-4 ${className}`}>
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-foreground">{field.label}</p>
          <p className="text-xs text-muted-foreground">{field.name}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="inline-flex items-center rounded-md bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
            {field.type}
          </div>
          {encryptionType !== 'NONE' && (
            <div className="inline-flex items-center rounded-md border border-gray-200 px-2 py-1 text-xs">
              {encryptionType === 'AES-256-CBC' && <Shield className="mr-1 h-2.5 w-2.5" />}
              {encryptionType === 'OPE' && <Lock className="mr-1 h-2.5 w-2.5" />}
              {encryptionType === 'HMAC-SHA256' && <Hash className="mr-1 h-2.5 w-2.5" />}
              {encryptionType}
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <div
          className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
            field.required ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
          }`}
        >
          {field.required ? requiredText : optionalText}
        </div>
        {optionCount > 0 ? (
          <div className="inline-flex items-center rounded-md border border-gray-200 px-2 py-1 text-xs">
            {optionsText}
          </div>
        ) : null}
      </div>

      {field.placeholder ? <p className="mt-3 text-sm text-muted-foreground">{field.placeholder}</p> : null}

      {field.options && field.options.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {field.options.slice(0, 6).map((option) => (
            <FieldBadge
              key={option.value}
              variant="outline"
              style={
                option.background_color
                  ? {
                      backgroundColor: option.background_color,
                      color: option.text_color ?? 'inherit',
                    }
                  : undefined
              }
            >
              {option.text}
            </FieldBadge>
          ))}
          {field.options.length > 6 && <FieldBadge variant="outline">+{field.options.length - 6}</FieldBadge>}
        </div>
      ) : null}
    </div>
  );
}
