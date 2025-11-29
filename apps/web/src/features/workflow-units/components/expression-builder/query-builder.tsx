/**
 * Expression Builder Component
 *
 * Visual query builder for condition expressions in workflows.
 * Supports AND/OR groups, nested conditions, and field-based comparisons.
 *
 * Uses react-querybuilder under the hood with custom styling.
 */
import { useState, useCallback } from 'react';
import { QueryBuilder, type RuleGroupType, type Field, formatQuery } from 'react-querybuilder';
import 'react-querybuilder/dist/query-builder.css';
import { Button } from '@workspace/ui/components/button';
import { cn } from '@workspace/ui/lib/utils';
import { Copy, Check } from 'lucide-react';
import './query-builder.css';

// Default operators for all field types
const DEFAULT_OPERATORS = [
  { name: '=', label: 'equals' },
  { name: '!=', label: 'not equals' },
  { name: '<', label: 'less than' },
  { name: '>', label: 'greater than' },
  { name: '<=', label: 'less or equal' },
  { name: '>=', label: 'greater or equal' },
  { name: 'contains', label: 'contains' },
  { name: 'beginsWith', label: 'starts with' },
  { name: 'endsWith', label: 'ends with' },
  { name: 'null', label: 'is null' },
  { name: 'notNull', label: 'is not null' },
  { name: 'in', label: 'in list' },
  { name: 'notIn', label: 'not in list' },
];

// Default fields when none provided
const DEFAULT_FIELDS: Field[] = [
  { name: 'trigger.data', label: 'Trigger Data' },
  { name: 'trigger.user', label: 'Trigger User' },
  { name: 'context.timestamp', label: 'Timestamp' },
];

export interface ExpressionBuilderProps {
  /** Initial query to populate the builder */
  initialQuery?: RuleGroupType;
  /** Callback when query changes */
  onChange: (query: RuleGroupType) => void;
  /** Optional save callback */
  onSave?: () => void;
  /** Available fields for selection */
  fields?: Field[];
  /** Additional CSS classes */
  className?: string;
  /** Show preview panel */
  showPreview?: boolean;
  /** Compact mode for inline usage */
  compact?: boolean;
}

/**
 * Visual expression builder for workflow conditions
 *
 * @example
 * ```tsx
 * <ExpressionBuilder
 *   initialQuery={{ combinator: 'and', rules: [] }}
 *   onChange={(query) => console.log('Query:', query)}
 *   fields={[
 *     { name: 'user.email', label: 'User Email' },
 *     { name: 'order.total', label: 'Order Total' },
 *   ]}
 * />
 * ```
 */
export function ExpressionBuilder({
  initialQuery,
  onChange,
  onSave,
  fields = DEFAULT_FIELDS,
  className,
  showPreview = true,
  compact = false,
}: ExpressionBuilderProps) {
  const [query, setQuery] = useState<RuleGroupType>(
    initialQuery || {
      combinator: 'and',
      rules: [],
    },
  );
  const [copied, setCopied] = useState(false);

  const handleQueryChange = useCallback(
    (newQuery: RuleGroupType) => {
      setQuery(newQuery);
      onChange(newQuery);
    },
    [onChange],
  );

  // Copy JSON to clipboard
  const handleCopy = useCallback(() => {
    const jsonExport = formatQuery(query, 'json_without_ids');
    navigator.clipboard.writeText(jsonExport);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [query]);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Query Builder */}
      <div className={cn('border border-border rounded-lg bg-background', compact ? 'p-2' : 'p-4')}>
        <QueryBuilder
          fields={fields}
          operators={DEFAULT_OPERATORS}
          query={query}
          onQueryChange={handleQueryChange}
          controlClassnames={{
            queryBuilder: 'qb-custom',
            ruleGroup: 'qb-ruleGroup',
            header: 'qb-ruleGroupHeader',
            body: 'qb-ruleGroupBody',
            rule: 'qb-rule',
            addRule: 'qb-btn-addRule',
            addGroup: 'qb-btn-addGroup',
            removeRule: 'qb-btn-remove',
            removeGroup: 'qb-btn-remove',
            combinators: 'qb-combinator',
            fields: 'qb-select',
            operators: 'qb-select',
            value: 'qb-input',
            notToggle: 'qb-notToggle',
            cloneRule: 'qb-btn-clone',
            cloneGroup: 'qb-btn-clone',
          }}
          showCombinatorsBetweenRules
          showNotToggle
          showCloneButtons
        />
      </div>

      {/* Preview Panel */}
      {showPreview && (
        <div className="border border-border rounded-lg p-3 bg-muted/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground font-medium">Expression Preview</span>
            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={handleCopy}>
              {copied ? (
                <>
                  <Check className="h-3 w-3 mr-1" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3 mr-1" />
                  Copy
                </>
              )}
            </Button>
          </div>
          <pre className="text-xs font-mono overflow-x-auto text-foreground/80 max-h-32 overflow-y-auto">
            {JSON.stringify(query, null, 2)}
          </pre>
        </div>
      )}

      {/* Actions */}
      {onSave && (
        <div className="flex justify-end gap-2">
          <Button size="sm" onClick={onSave}>
            Save Expression
          </Button>
        </div>
      )}
    </div>
  );
}

export type { RuleGroupType, Field };
