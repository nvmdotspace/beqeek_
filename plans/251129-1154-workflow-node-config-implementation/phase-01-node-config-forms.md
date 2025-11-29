# Phase 1: Node Configuration Forms

## Context

- **Parent Plan**: [plan.md](./plan.md)
- **Dependencies**: `@workspace/ui`, `zustand`, React Flow
- **Reference**: Blade Blockly implementation (`workflow-units.blade.php:512-1116`)

## Overview

- **Date**: 2024-11-29
- **Description**: Implement editable forms in NodeConfigDrawer for each node type
- **Priority**: Critical
- **Implementation Status**: ⏳ Not Started
- **Review Status**: N/A

## Key Insights

1. Blockly uses inline `FieldTextInput`, `FieldDropdown`, `FieldNumber` for editing
2. React Flow approach: side panel forms (n8n-style)
3. Current `NodeConfigDrawer` is placeholder showing JSON only
4. 17 node types need custom forms

## Requirements

### Functional

- F1: Each node type has dedicated config form
- F2: Changes update store via `updateNodes()`
- F3: Real-time validation with error messages
- F4: Form state persists when switching nodes

### Non-Functional

- NF1: Form renders < 50ms
- NF2: Accessible (ARIA labels, keyboard nav)
- NF3: Dark mode support via design tokens

## Architecture

```
NodeConfigDrawer
├── NodeFormRouter (switch by node.type)
│   ├── TriggerScheduleForm
│   ├── TriggerWebhookForm
│   ├── TableOperationForm
│   ├── ApiCallForm
│   ├── ConditionForm
│   └── ...
└── FormField (reusable component)
    ├── Input / Textarea
    ├── Select / MultiSelect
    └── JsonEditor (for complex values)
```

## Related Code Files

| File                                                 | Purpose                           |
| ---------------------------------------------------- | --------------------------------- |
| `components/workflow-builder/node-config-drawer.tsx` | Container, replace placeholder    |
| `components/workflow-builder/node-forms/index.ts`    | Form router                       |
| `components/workflow-builder/node-forms/*.tsx`       | Individual forms                  |
| `utils/node-types.ts`                                | Node definitions with field specs |
| `stores/workflow-editor-store.ts`                    | State updates                     |

## Implementation Steps

### Step 1: Form Infrastructure

- [ ] Create `FormField` reusable component
- [ ] Add `updateNodeData(nodeId, data)` to store
- [ ] Create `NodeFormRouter` component

### Step 2: Trigger Forms (4 forms)

- [ ] `TriggerScheduleForm`: cron expression input
- [ ] `TriggerWebhookForm`: webhook ID (readonly), URL preview
- [ ] `TriggerFormForm`: form selector, action selector
- [ ] `TriggerTableForm`: table selector, action selector

### Step 3: Action Forms (7 forms)

- [ ] `TableOperationForm`: connector, action dropdown, query/data input
- [ ] `SmtpEmailForm`: to, cc, bcc, subject, body
- [ ] `GoogleSheetForm`: spreadsheet ID, sheet, operation, range
- [ ] `ApiCallForm`: method, URL, headers, payload
- [ ] `UserOperationForm`: action, user ID
- [ ] `DelayForm`: duration value, unit selector
- [ ] `LogForm`: message, level dropdown

### Step 4: Logic Forms (6 forms)

- [ ] `ConditionForm`: expression builder (simplified)
- [ ] `MatchForm`: value input, cases list
- [ ] `LoopForm`: collection, iterator variable
- [ ] `MathForm`: operation, operands
- [ ] `DefinitionForm`: variables JSON editor
- [ ] `LogLogicForm`: debug message, level

## Todo List

- [ ] Create base `FormField` component
- [ ] Add `updateNodeData` action to store
- [ ] Implement `NodeFormRouter`
- [ ] Implement trigger forms (4)
- [ ] Implement action forms (7)
- [ ] Implement logic forms (6)
- [ ] Add form validation
- [ ] Test each form type
- [ ] Update drawer to use forms

## Success Criteria

- [ ] All 17 node types have working forms
- [ ] Changes persist in store and sync to YAML
- [ ] No TypeScript errors
- [ ] Accessible via keyboard
- [ ] Works in dark mode

## Risk Assessment

| Risk                             | Impact | Mitigation               |
| -------------------------------- | ------ | ------------------------ |
| Complex nested data (conditions) | High   | Use JSON editor fallback |
| Store update performance         | Medium | Debounce form changes    |
| Form state loss on node switch   | Medium | Save before switch       |

## Security Considerations

- Sanitize text inputs (XSS prevention)
- Validate URL inputs in ApiCallForm
- No sensitive data in localStorage

## Next Steps

After Phase 1 complete:

1. → Phase 2: Add missing block types
2. → Integration test with YAML converter
