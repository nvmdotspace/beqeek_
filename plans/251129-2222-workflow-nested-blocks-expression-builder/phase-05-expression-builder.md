# Phase 05: Expression Builder UI

**Duration:** 6-8 hours
**Priority:** High (major UX improvement)

## Objectives

Replace text input for condition expressions with visual query builder supporting AND/OR groups, nested conditions, and field-based comparisons.

## Research Reference

From [react-querybuilder docs](https://react-querybuilder.js.org/):

- Drag-drop rules and groups
- Independent combinators (AND/OR between each rule)
- Nested groups support
- Custom operators and value editors
- Export to SQL, MongoDB, JSON, etc.

## Library Selection

**Chosen:** `react-querybuilder` v7+
**Why:**

- 10k+ GitHub stars, active maintenance
- TypeScript support, React 19 compatible
- Customizable components (match design system)
- Supports nested groups (unlimited depth)
- Export to multiple formats (JSON for YAML storage)

**Alternative considered:** `react-awesome-query-builder`

- More features but heavier (200KB+ vs 50KB)
- Complex API, steeper learning curve
- Overkill for current needs

## Tasks

### 5.1 Install and Configure react-querybuilder (0.5h)

```bash
pnpm add react-querybuilder@^7.0.0
pnpm add -D @types/react-querybuilder
```

**File:** `apps/web/package.json`

```json
{
  "dependencies": {
    "react-querybuilder": "^7.0.0"
  }
}
```

### 5.2 Create Expression Builder Component (2h)

**File:** `apps/web/src/features/workflow-units/components/expression-builder/query-builder.tsx` (new)

```typescript
import { useState, useCallback } from 'react';
import { QueryBuilder, RuleGroupType, formatQuery } from 'react-querybuilder';
import 'react-querybuilder/dist/query-builder.css';
import { Button } from '@workspace/ui/components/button';
import { cn } from '@workspace/ui/lib/utils';

// Define available fields based on workflow context
const fields = [
  { name: 'trigger.data', label: 'Trigger Data', type: 'text' },
  { name: 'trigger.user', label: 'Trigger User', type: 'text' },
  { name: 'steps.*.output', label: 'Step Output', type: 'text' },
  { name: 'context.variables.*', label: 'Variable', type: 'text' },
];

// Define operators for each field type
const operators = [
  { name: '=', label: 'equals' },
  { name: '!=', label: 'not equals' },
  { name: '<', label: 'less than' },
  { name: '>', label: 'greater than' },
  { name: '<=', label: 'less than or equal' },
  { name: '>=', label: 'greater than or equal' },
  { name: 'contains', label: 'contains' },
  { name: 'beginsWith', label: 'begins with' },
  { name: 'endsWith', label: 'ends with' },
  { name: 'null', label: 'is null' },
  { name: 'notNull', label: 'is not null' },
  { name: 'in', label: 'in' },
  { name: 'notIn', label: 'not in' },
];

interface ExpressionBuilderProps {
  initialQuery?: RuleGroupType;
  onChange: (query: RuleGroupType) => void;
  onSave?: () => void;
  className?: string;
}

export function ExpressionBuilder({
  initialQuery,
  onChange,
  onSave,
  className,
}: ExpressionBuilderProps) {
  const [query, setQuery] = useState<RuleGroupType>(
    initialQuery || {
      combinator: 'and',
      rules: [],
    }
  );

  const handleQueryChange = useCallback(
    (newQuery: RuleGroupType) => {
      setQuery(newQuery);
      onChange(newQuery);
    },
    [onChange]
  );

  // Convert to YAML-compatible format
  const handleExport = useCallback(() => {
    const jsonExport = formatQuery(query, 'json_without_ids');
    console.log('Exported query:', jsonExport);
  }, [query]);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Query Builder */}
      <div className="border border-border rounded-lg p-4 bg-background">
        <QueryBuilder
          fields={fields}
          operators={operators}
          query={query}
          onQueryChange={handleQueryChange}
          controlClassnames={{
            queryBuilder: 'queryBuilder-custom',
            ruleGroup: 'ruleGroup-custom',
            rule: 'rule-custom',
            addRule: 'btn-add-rule',
            addGroup: 'btn-add-group',
            removeRule: 'btn-remove-rule',
            removeGroup: 'btn-remove-group',
            combinators: 'combinator-select',
            fields: 'field-select',
            operators: 'operator-select',
            value: 'value-input',
          }}
          // Enable independent combinators (AND/OR between each rule)
          independentCombinators
          showCombinatorsBetweenRules
          showNotToggle
          showCloneButtons
        />
      </div>

      {/* Preview */}
      <div className="border border-border rounded-lg p-3 bg-muted">
        <div className="text-xs text-muted-foreground mb-1">Preview (JSON):</div>
        <pre className="text-xs font-mono overflow-x-auto">
          {JSON.stringify(query, null, 2)}
        </pre>
      </div>

      {/* Actions */}
      {onSave && (
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            Export
          </Button>
          <Button size="sm" onClick={onSave}>
            Save Expression
          </Button>
        </div>
      )}
    </div>
  );
}
```

### 5.3 Style Query Builder to Match Design System (1.5h)

**File:** `apps/web/src/features/workflow-units/components/expression-builder/query-builder.css` (new)

```css
/* Override react-querybuilder default styles */
.queryBuilder-custom {
  font-family: inherit;
  background: transparent;
}

.ruleGroup-custom {
  background: hsl(var(--muted));
  border: 1px solid hsl(var(--border));
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 0.5rem;
}

.rule-custom {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: 0.375rem;
  margin-bottom: 0.5rem;
}

.combinator-select,
.field-select,
.operator-select {
  padding: 0.375rem 0.75rem;
  border: 1px solid hsl(var(--input));
  border-radius: 0.375rem;
  background: hsl(var(--background));
  color: hsl(var(--foreground));
  font-size: 0.875rem;
  transition: all 0.2s;
}

.combinator-select:focus,
.field-select:focus,
.operator-select:focus {
  outline: none;
  ring: 1px;
  ring-color: hsl(var(--ring));
}

.value-input {
  padding: 0.375rem 0.75rem;
  border: 1px solid hsl(var(--input));
  border-radius: 0.375rem;
  background: hsl(var(--background));
  color: hsl(var(--foreground));
  font-size: 0.875rem;
  flex: 1;
}

.btn-add-rule,
.btn-add-group {
  padding: 0.375rem 0.75rem;
  background: hsl(var(--accent-blue));
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-add-rule:hover,
.btn-add-group:hover {
  opacity: 0.9;
}

.btn-remove-rule,
.btn-remove-group {
  padding: 0.25rem 0.5rem;
  background: hsl(var(--destructive));
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-remove-rule:hover,
.btn-remove-group:hover {
  opacity: 0.9;
}

/* Nested group indicators */
.ruleGroup-custom > .ruleGroup-custom {
  margin-left: 1.5rem;
  border-left: 3px solid hsl(var(--accent-teal));
}

/* Combinator badges */
.combinator-select[value='and'] {
  background: hsl(var(--accent-green-subtle));
  color: hsl(var(--accent-green));
  font-weight: 600;
}

.combinator-select[value='or'] {
  background: hsl(var(--accent-orange-subtle));
  color: hsl(var(--accent-orange));
  font-weight: 600;
}
```

Import in main component:

```typescript
import './query-builder.css';
```

### 5.4 Integrate with Condition Node Config (1.5h)

**File:** `apps/web/src/features/workflow-units/components/workflow-builder/node-config-panel.tsx`

Replace text input for condition with expression builder:

```typescript
import { ExpressionBuilder } from '../expression-builder/query-builder';

export function NodeConfigPanel() {
  const { selectedNodeIds, nodes, updateNodeData } = useWorkflowEditorStore();
  const selectedNode = nodes.find(n => n.id === selectedNodeIds[0]);

  // ... existing code ...

  if (selectedNode?.type === 'condition' || selectedNode?.type === 'compound_condition') {
    const currentExpression = selectedNode.data.config?.expressions;

    return (
      <div className="space-y-4">
        <h3 className="font-semibold">Condition Configuration</h3>

        {/* Expression Builder replaces text input */}
        <ExpressionBuilder
          initialQuery={currentExpression}
          onChange={(query) => {
            updateNodeData(selectedNode.id, {
              config: {
                ...selectedNode.data.config,
                expressions: query,
              },
            });
          }}
          onSave={() => {
            // Close panel or show success message
          }}
        />
      </div>
    );
  }

  // ... other node types ...
}
```

### 5.5 Context-Aware Field Suggestions (1.5h)

Add dynamic field suggestions based on workflow context:

**File:** `apps/web/src/features/workflow-units/hooks/use-expression-fields.ts` (new)

```typescript
import { useMemo } from 'react';
import { useWorkflowEditorStore } from '../stores/workflow-editor-store';
import { Field } from 'react-querybuilder';

export function useExpressionFields(currentNodeId?: string): Field[] {
  const { nodes } = useWorkflowEditorStore();

  return useMemo(() => {
    const fields: Field[] = [
      // Trigger fields
      { name: 'trigger.data', label: '🎯 Trigger Data', type: 'text' },
      { name: 'trigger.user.id', label: '👤 User ID', type: 'text' },
      { name: 'trigger.user.email', label: '📧 User Email', type: 'text' },
    ];

    // Add fields from previous steps
    if (currentNodeId) {
      const currentIndex = nodes.findIndex((n) => n.id === currentNodeId);
      const previousNodes = nodes.slice(0, currentIndex);

      previousNodes.forEach((node) => {
        if (node.data?.label) {
          fields.push({
            name: `steps.${node.id}.output`,
            label: `📦 ${node.data.label} Output`,
            type: 'text',
          });
        }
      });
    }

    // Add context variables
    fields.push(
      { name: 'context.timestamp', label: '🕐 Timestamp', type: 'text' },
      { name: 'context.environment', label: '🌍 Environment', type: 'text' },
    );

    return fields;
  }, [nodes, currentNodeId]);
}
```

Use in ExpressionBuilder:

```typescript
const fields = useExpressionFields(selectedNode.id);

<QueryBuilder
  fields={fields}
  // ... other props
/>
```

### 5.6 Expression Templates (1h)

**File:** `apps/web/src/features/workflow-units/components/expression-builder/expression-templates.tsx` (new)

```typescript
import { RuleGroupType } from 'react-querybuilder';
import { Button } from '@workspace/ui/components/button';

const templates: Record<string, { label: string; query: RuleGroupType }> = {
  user_check: {
    label: 'Check User Status',
    query: {
      combinator: 'and',
      rules: [
        { field: 'trigger.user.status', operator: '=', value: 'active' },
        { field: 'trigger.user.email', operator: 'notNull', value: '' },
      ],
    },
  },
  value_range: {
    label: 'Value in Range',
    query: {
      combinator: 'and',
      rules: [
        { field: 'steps.*.output.value', operator: '>=', value: '0' },
        { field: 'steps.*.output.value', operator: '<=', value: '100' },
      ],
    },
  },
  text_match: {
    label: 'Text Contains Keyword',
    query: {
      combinator: 'or',
      rules: [
        { field: 'trigger.data.message', operator: 'contains', value: 'urgent' },
        { field: 'trigger.data.message', operator: 'contains', value: 'priority' },
      ],
    },
  },
};

interface ExpressionTemplatesProps {
  onSelect: (query: RuleGroupType) => void;
}

export function ExpressionTemplates({ onSelect }: ExpressionTemplatesProps) {
  return (
    <div className="space-y-2">
      <div className="text-sm font-medium text-muted-foreground">Quick Templates</div>
      <div className="grid grid-cols-2 gap-2">
        {Object.entries(templates).map(([key, { label, query }]) => (
          <Button
            key={key}
            variant="outline"
            size="sm"
            onClick={() => onSelect(query)}
            className="justify-start"
          >
            {label}
          </Button>
        ))}
      </div>
    </div>
  );
}
```

### 5.7 Testing (0.5h)

**File:** `apps/web/src/features/workflow-units/__tests__/expression-builder.test.tsx` (new)

Tests:

1. Expression builder renders with empty query
2. Add rule creates new condition
3. Add group creates nested group
4. Combinator toggle (AND ↔ OR) works
5. Field suggestions include previous step outputs
6. Template selection populates query
7. Export to JSON matches YAML schema

## Validation Checklist

- [ ] react-querybuilder installed and configured
- [ ] ExpressionBuilder component created
- [ ] Custom CSS matches design system
- [ ] Integrated into condition node config panel
- [ ] Context-aware field suggestions working
- [ ] Expression templates provide quick start
- [ ] Export to JSON format for YAML storage
- [ ] Manual test: create nested groups, save works

## Visual Design

```
┌─────────────────────────────────────────┐
│ Condition Configuration                 │
├─────────────────────────────────────────┤
│ Quick Templates: [User Check] [Range]  │
├─────────────────────────────────────────┤
│ ┌─ AND ──────────────────────────────┐ │
│ │ [Trigger Data] [equals] [active]  │ │
│ │                        [+ Rule]   │ │
│ │ ┌─ OR ──────────────────────────┐ │ │
│ │ │ [User Email] [contains] [@]  │ │ │
│ │ │ [User Status] [!=] [banned]  │ │ │
│ │ └──────────────────────────────┘ │ │
│ │                      [+ Group]   │ │
│ └──────────────────────────────────┘ │
│                                         │
│ Preview: { "combinator": "and", ... }  │
└─────────────────────────────────────────┘
```

## Dependencies

- Phase 01 (IR schema supports expressions)

## Risks

- **Risk:** Bundle size increase (~50KB)
  **Mitigation:** Lazy load expression builder component

- **Risk:** Learning curve for users
  **Mitigation:** Provide templates, inline help, video tutorial

## Next Phase

Phase 06 extends expression builder for math operations.
