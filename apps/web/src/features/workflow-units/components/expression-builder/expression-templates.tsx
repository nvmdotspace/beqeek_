/**
 * Expression Templates Component
 *
 * Provides quick-start templates for common condition patterns.
 * Users can select a template to populate the expression builder.
 */
import type { RuleGroupType } from 'react-querybuilder';
import { Button } from '@workspace/ui/components/button';
import { cn } from '@workspace/ui/lib/utils';
import { User, Hash, FileText, Calendar, CheckCircle, AlertCircle } from 'lucide-react';

interface ExpressionTemplate {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  query: RuleGroupType;
}

const templates: ExpressionTemplate[] = [
  {
    id: 'user_active',
    label: 'Active User',
    description: 'Check if user is active',
    icon: <User className="h-3.5 w-3.5" />,
    query: {
      combinator: 'and',
      rules: [
        { field: 'trigger.user.status', operator: '=', value: 'active' },
        { field: 'trigger.user.email', operator: 'notNull', value: '' },
      ],
    },
  },
  {
    id: 'value_range',
    label: 'Value Range',
    description: 'Check if value is within range',
    icon: <Hash className="h-3.5 w-3.5" />,
    query: {
      combinator: 'and',
      rules: [
        { field: 'trigger.data.value', operator: '>=', value: '0' },
        { field: 'trigger.data.value', operator: '<=', value: '100' },
      ],
    },
  },
  {
    id: 'text_contains',
    label: 'Text Match',
    description: 'Check if text contains keywords',
    icon: <FileText className="h-3.5 w-3.5" />,
    query: {
      combinator: 'or',
      rules: [
        { field: 'trigger.data.message', operator: 'contains', value: 'urgent' },
        { field: 'trigger.data.message', operator: 'contains', value: 'priority' },
      ],
    },
  },
  {
    id: 'date_recent',
    label: 'Recent Date',
    description: 'Check if date is not null',
    icon: <Calendar className="h-3.5 w-3.5" />,
    query: {
      combinator: 'and',
      rules: [{ field: 'trigger.data.date', operator: 'notNull', value: '' }],
    },
  },
  {
    id: 'status_success',
    label: 'Success Status',
    description: 'Check for success status',
    icon: <CheckCircle className="h-3.5 w-3.5" />,
    query: {
      combinator: 'and',
      rules: [{ field: 'trigger.data.status', operator: '=', value: 'success' }],
    },
  },
  {
    id: 'error_check',
    label: 'Error Check',
    description: 'Check for error conditions',
    icon: <AlertCircle className="h-3.5 w-3.5" />,
    query: {
      combinator: 'or',
      rules: [
        { field: 'trigger.data.status', operator: '=', value: 'error' },
        { field: 'trigger.data.error', operator: 'notNull', value: '' },
      ],
    },
  },
];

export interface ExpressionTemplatesProps {
  /** Callback when a template is selected */
  onSelect: (query: RuleGroupType) => void;
  /** Additional CSS classes */
  className?: string;
  /** Layout variant */
  variant?: 'grid' | 'list';
}

/**
 * Quick template selector for common expression patterns
 */
export function ExpressionTemplates({ onSelect, className, variant = 'grid' }: ExpressionTemplatesProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">Quick Templates</span>
      </div>
      <div className={cn(variant === 'grid' ? 'grid grid-cols-2 gap-2' : 'flex flex-col gap-1.5')}>
        {templates.map((template) => (
          <Button
            key={template.id}
            variant="outline"
            size="sm"
            onClick={() => onSelect(template.query)}
            className={cn('justify-start gap-2 h-auto py-2', variant === 'list' && 'px-3')}
            title={template.description}
          >
            <span className="text-muted-foreground">{template.icon}</span>
            <span className="text-xs">{template.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}

export { templates as expressionTemplates };
