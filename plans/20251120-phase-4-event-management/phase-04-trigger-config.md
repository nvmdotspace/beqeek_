# Phase 4: Trigger Configuration Forms

**Date**: 2025-11-20
**Priority**: P1 (Core Feature)
**Status**: Planning
**Estimated Effort**: 10-12 hours

## Context

**Related Files**:

- Research: `/docs/research/251120-workflow-trigger-ux-patterns.md`
- Design system: `docs/design-system.md`
- Form library: TanStack Form (already in use)
- UI components: `packages/ui/src/components/*`

**Dependencies**:

- Phase 1: Event API hooks
- Design system components (Form, Input, Select, etc.)

## Key Insights from Research

1. **Progressive Disclosure**: Show only relevant fields based on trigger type
2. **Helper Tools**: Cron expression builder, URL preview for webhooks
3. **Validation**: Real-time with actionable error messages
4. **Presets**: Common configurations (daily, weekly, monthly)
5. **Context-Aware**: Form trigger shows workspace forms, table trigger shows tables

## Requirements

### Functional

**Schedule Trigger**:

- Cron expression input with syntax validation
- Cron builder helper (dropdown presets)
- Timezone selector (default: Asia/Ho_Chi_Minh)
- Human-readable preview ("Every Monday at 9 AM")

**Webhook Trigger**:

- Auto-generate webhook URL on creation
- Display URL with copy button
- Security token (regenerate option)
- HTTP method filter (GET, POST, ALL)

**Form Trigger**:

- Select workspace form from dropdown
- Trigger on: Submit, Approve, Reject (checkboxes)
- Field condition (optional): "Only when field X equals Y"

**Table Trigger**:

- Select workspace table from dropdown
- Trigger on: Create, Update, Delete (checkboxes)
- Field condition (optional): "Only when field X changes to Y"

### Non-Functional

- Form validation <100ms
- Cron preview updates instantly
- Webhook URL generated <500ms
- Accessible (WCAG 2.1 AA)
- Mobile-friendly (responsive inputs)

## Architecture

### Component Hierarchy

```
TriggerConfigForm
  ├── TriggerTypeSelector (Radio group)
  ├── ScheduleTriggerForm
  │   ├── CronInput (with builder)
  │   ├── TimezoneSelect
  │   └── CronPreview
  ├── WebhookTriggerForm
  │   ├── WebhookURLDisplay
  │   ├── SecurityTokenInput
  │   └── HTTPMethodSelect
  ├── FormTriggerForm
  │   ├── FormSelect (workspace forms)
  │   ├── ActionCheckboxes
  │   └── FieldConditionInput
  └── TableTriggerForm
      ├── TableSelect (workspace tables)
      ├── ActionCheckboxes
      └── FieldConditionInput
```

### State Management

**TanStack Form (Form State)**:

```typescript
interface TriggerConfig {
  type: 'schedule' | 'webhook' | 'form' | 'table';
  config: ScheduleConfig | WebhookConfig | FormConfig | TableConfig;
}

interface ScheduleConfig {
  cron: string;
  timezone: string;
}

interface WebhookConfig {
  url: string;
  security_token: string;
  http_method: 'GET' | 'POST' | 'ALL';
}

interface FormConfig {
  form_id: string;
  trigger_on_submit: boolean;
  trigger_on_approve: boolean;
  trigger_on_reject: boolean;
  field_condition?: {
    field_id: string;
    operator: 'equals' | 'not_equals' | 'contains';
    value: string;
  };
}

interface TableConfig {
  table_id: string;
  trigger_on_create: boolean;
  trigger_on_update: boolean;
  trigger_on_delete: boolean;
  field_condition?: {
    field_id: string;
    operator: 'equals' | 'not_equals' | 'contains' | 'changes_to';
    value: string;
  };
}
```

**React Query (Server State)**:

- Workspace forms via `useForms(workspaceId)`
- Workspace tables via `useTables(workspaceId)`
- Generate webhook URL via `useGenerateWebhookURL()`

**Local State**:

- Cron builder open/closed
- Webhook URL copied feedback
- Field condition expanded/collapsed

### Validation (Zod Schemas)

```typescript
import { z } from 'zod';
import cronstrue from 'cronstrue';

const cronSchema = z.string().refine(
  (val) => {
    try {
      cronstrue.toString(val);
      return true;
    } catch {
      return false;
    }
  },
  { message: 'Invalid cron expression' },
);

export const scheduleConfigSchema = z.object({
  cron: cronSchema,
  timezone: z.string().min(1, 'Timezone is required'),
});

export const webhookConfigSchema = z.object({
  url: z.string().url('Invalid webhook URL'),
  security_token: z.string().min(16, 'Token must be at least 16 characters'),
  http_method: z.enum(['GET', 'POST', 'ALL']),
});

export const formConfigSchema = z
  .object({
    form_id: z.string().min(1, 'Form is required'),
    trigger_on_submit: z.boolean(),
    trigger_on_approve: z.boolean(),
    trigger_on_reject: z.boolean(),
    field_condition: z
      .object({
        field_id: z.string(),
        operator: z.enum(['equals', 'not_equals', 'contains']),
        value: z.string(),
      })
      .optional(),
  })
  .refine((data) => data.trigger_on_submit || data.trigger_on_approve || data.trigger_on_reject, {
    message: 'Select at least one trigger action',
    path: ['trigger_on_submit'],
  });

export const tableConfigSchema = z
  .object({
    table_id: z.string().min(1, 'Table is required'),
    trigger_on_create: z.boolean(),
    trigger_on_update: z.boolean(),
    trigger_on_delete: z.boolean(),
    field_condition: z
      .object({
        field_id: z.string(),
        operator: z.enum(['equals', 'not_equals', 'contains', 'changes_to']),
        value: z.string(),
      })
      .optional(),
  })
  .refine((data) => data.trigger_on_create || data.trigger_on_update || data.trigger_on_delete, {
    message: 'Select at least one trigger action',
    path: ['trigger_on_create'],
  });
```

## Related Code Files

**UI Components** (packages/ui):

- `components/form.tsx` - Form wrapper
- `components/input.tsx` - Text inputs
- `components/select.tsx` - Dropdowns
- `components/checkbox.tsx` - Action checkboxes
- `components/radio-group.tsx` - Trigger type selector
- `components/label.tsx` - Form labels
- `components/popover.tsx` - Cron builder

**Existing Form Patterns**:

- `apps/web/src/features/auth/components/login-form.tsx` - TanStack Form usage
- `apps/web/src/features/active-tables/components/field-editor.tsx` - Complex form

**Helper Libraries**:

- `cronstrue` - Cron to human-readable
- `cron-parser` - Cron validation

## Implementation Steps

### 1. Install Dependencies

```bash
pnpm add cronstrue cron-parser
pnpm add -D @types/cronstrue
```

### 2. Create Validation Schemas

**File**: `apps/web/src/features/workflows/utils/trigger-validation.ts`

- Implement 4 Zod schemas (schedule, webhook, form, table)
- Export validation functions

### 3. Create Cron Helper Components

**File**: `apps/web/src/features/workflows/components/cron-input.tsx`

```typescript
import { useState } from 'react';
import { Input } from '@workspace/ui/components/input';
import { Button } from '@workspace/ui/components/button';
import { Popover, PopoverContent, PopoverTrigger } from '@workspace/ui/components/popover';
import { Calendar } from 'lucide-react';
import cronstrue from 'cronstrue';

const CRON_PRESETS = [
  { label: 'Every minute', value: '* * * * *' },
  { label: 'Every hour', value: '0 * * * *' },
  { label: 'Every day at 9 AM', value: '0 9 * * *' },
  { label: 'Every Monday at 9 AM', value: '0 9 * * 1' },
  { label: 'Every month on the 1st', value: '0 9 1 * *' },
];

interface CronInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function CronInput({ value, onChange, error }: CronInputProps) {
  const [preview, setPreview] = useState('');

  const handleChange = (newValue: string) => {
    onChange(newValue);
    try {
      setPreview(cronstrue.toString(newValue));
    } catch {
      setPreview('Invalid cron expression');
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="0 9 * * 1"
          className="font-mono"
        />
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon">
              <Calendar className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64">
            <div className="space-y-2">
              <p className="text-sm font-medium">Common schedules</p>
              {CRON_PRESETS.map((preset) => (
                <Button
                  key={preset.value}
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => handleChange(preset.value)}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>
      {preview && !error && (
        <p className="text-xs text-muted-foreground">{preview}</p>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
```

### 4. Create Schedule Trigger Form

**File**: `apps/web/src/features/workflows/components/schedule-trigger-form.tsx`

```typescript
import { useForm } from '@tanstack/react-form';
import { zodValidator } from '@tanstack/zod-form-adapter';
import { scheduleConfigSchema } from '../utils/trigger-validation';
import { CronInput } from './cron-input';
import { Label } from '@workspace/ui/components/label';
import { Select } from '@workspace/ui/components/select';

interface ScheduleTriggerFormProps {
  initialData?: ScheduleConfig;
  onChange: (data: ScheduleConfig) => void;
}

export function ScheduleTriggerForm({
  initialData,
  onChange,
}: ScheduleTriggerFormProps) {
  const form = useForm({
    defaultValues: initialData || {
      cron: '0 9 * * 1',
      timezone: 'Asia/Ho_Chi_Minh',
    },
    validatorAdapter: zodValidator(),
    validators: {
      onChange: scheduleConfigSchema,
    },
    onSubmit: ({ value }) => onChange(value),
  });

  return (
    <form className="space-y-4">
      <div>
        <Label>Schedule</Label>
        <form.Field name="cron">
          {(field) => (
            <CronInput
              value={field.state.value}
              onChange={field.handleChange}
              error={field.state.meta.errors[0]}
            />
          )}
        </form.Field>
      </div>

      <div>
        <Label>Timezone</Label>
        <form.Field name="timezone">
          {(field) => (
            <Select
              value={field.state.value}
              onValueChange={field.handleChange}
            >
              <option value="Asia/Ho_Chi_Minh">Asia/Ho_Chi_Minh (GMT+7)</option>
              <option value="UTC">UTC (GMT+0)</option>
              <option value="America/New_York">America/New_York (EST)</option>
              {/* ... more timezones */}
            </Select>
          )}
        </form.Field>
      </div>
    </form>
  );
}
```

### 5. Create Webhook Trigger Form

**File**: `apps/web/src/features/workflows/components/webhook-trigger-form.tsx`

```typescript
import { useState } from 'react';
import { Input } from '@workspace/ui/components/input';
import { Button } from '@workspace/ui/components/button';
import { Select } from '@workspace/ui/components/select';
import { Label } from '@workspace/ui/components/label';
import { Copy, RefreshCw } from 'lucide-react';

export function WebhookTriggerForm({ initialData, onChange }) {
  const [url, setUrl] = useState(
    initialData?.url || `https://api.beqeek.com/webhooks/${crypto.randomUUID()}`
  );
  const [securityToken, setSecurityToken] = useState(
    initialData?.security_token || crypto.randomUUID()
  );

  const handleCopyURL = () => {
    navigator.clipboard.writeText(url);
    // Show toast notification
  };

  const handleRegenerateToken = () => {
    setSecurityToken(crypto.randomUUID());
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Webhook URL</Label>
        <div className="flex gap-2">
          <Input value={url} readOnly className="font-mono text-sm" />
          <Button variant="outline" size="icon" onClick={handleCopyURL}>
            <Copy className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Send HTTP requests to this URL to trigger the workflow
        </p>
      </div>

      <div>
        <Label>Security Token</Label>
        <div className="flex gap-2">
          <Input
            value={securityToken}
            onChange={(e) => setSecurityToken(e.target.value)}
            className="font-mono text-sm"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={handleRegenerateToken}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Include in X-Security-Token header
        </p>
      </div>

      <div>
        <Label>HTTP Method</Label>
        <Select
          value={initialData?.http_method || 'POST'}
          onValueChange={(value) =>
            onChange({ url, security_token: securityToken, http_method: value })
          }
        >
          <option value="POST">POST only</option>
          <option value="GET">GET only</option>
          <option value="ALL">All methods</option>
        </Select>
      </div>
    </div>
  );
}
```

### 6. Create Form Trigger Form

**File**: `apps/web/src/features/workflows/components/form-trigger-form.tsx`

```typescript
import { useForms } from '@/features/forms/hooks/use-forms';
import { Select } from '@workspace/ui/components/select';
import { Checkbox } from '@workspace/ui/components/checkbox';
import { Label } from '@workspace/ui/components/label';

export function FormTriggerForm({ workspaceId, initialData, onChange }) {
  const { data: forms } = useForms(workspaceId);

  return (
    <div className="space-y-4">
      <div>
        <Label>Form</Label>
        <Select
          value={initialData?.form_id}
          onValueChange={(value) => onChange({ ...initialData, form_id: value })}
        >
          {forms?.map((form) => (
            <option key={form.id} value={form.id}>
              {form.name}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <Label>Trigger when</Label>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={initialData?.trigger_on_submit}
              onCheckedChange={(checked) =>
                onChange({ ...initialData, trigger_on_submit: checked })
              }
            />
            <span className="text-sm">Form is submitted</span>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              checked={initialData?.trigger_on_approve}
              onCheckedChange={(checked) =>
                onChange({ ...initialData, trigger_on_approve: checked })
              }
            />
            <span className="text-sm">Form is approved</span>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              checked={initialData?.trigger_on_reject}
              onCheckedChange={(checked) =>
                onChange({ ...initialData, trigger_on_reject: checked })
              }
            />
            <span className="text-sm">Form is rejected</span>
          </div>
        </div>
      </div>

      {/* TODO: Field condition (optional) */}
    </div>
  );
}
```

### 7. Create Table Trigger Form

**File**: `apps/web/src/features/workflows/components/table-trigger-form.tsx`

```typescript
import { useTables } from '@/features/active-tables/hooks/use-tables';
import { Select } from '@workspace/ui/components/select';
import { Checkbox } from '@workspace/ui/components/checkbox';
import { Label } from '@workspace/ui/components/label';

export function TableTriggerForm({ workspaceId, initialData, onChange }) {
  const { data: tables } = useTables(workspaceId);

  return (
    <div className="space-y-4">
      <div>
        <Label>Table</Label>
        <Select
          value={initialData?.table_id}
          onValueChange={(value) => onChange({ ...initialData, table_id: value })}
        >
          {tables?.map((table) => (
            <option key={table.id} value={table.id}>
              {table.name}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <Label>Trigger when</Label>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={initialData?.trigger_on_create}
              onCheckedChange={(checked) =>
                onChange({ ...initialData, trigger_on_create: checked })
              }
            />
            <span className="text-sm">Record is created</span>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              checked={initialData?.trigger_on_update}
              onCheckedChange={(checked) =>
                onChange({ ...initialData, trigger_on_update: checked })
              }
            />
            <span className="text-sm">Record is updated</span>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              checked={initialData?.trigger_on_delete}
              onCheckedChange={(checked) =>
                onChange({ ...initialData, trigger_on_delete: checked })
              }
            />
            <span className="text-sm">Record is deleted</span>
          </div>
        </div>
      </div>

      {/* TODO: Field condition (optional) */}
    </div>
  );
}
```

### 8. Create Main Trigger Config Component

**File**: `apps/web/src/features/workflows/components/trigger-config-form.tsx`

```typescript
import { useState } from 'react';
import { RadioGroup, RadioGroupItem } from '@workspace/ui/components/radio-group';
import { Label } from '@workspace/ui/components/label';
import { ScheduleTriggerForm } from './schedule-trigger-form';
import { WebhookTriggerForm } from './webhook-trigger-form';
import { FormTriggerForm } from './form-trigger-form';
import { TableTriggerForm } from './table-trigger-form';
import type { TriggerConfig } from '../types';

interface TriggerConfigFormProps {
  workspaceId: string;
  initialData?: TriggerConfig;
  onChange: (data: TriggerConfig) => void;
}

export function TriggerConfigForm({
  workspaceId,
  initialData,
  onChange,
}: TriggerConfigFormProps) {
  const [triggerType, setTriggerType] = useState<TriggerConfig['type']>(
    initialData?.type || 'schedule'
  );

  return (
    <div className="space-y-6">
      <div>
        <Label>Trigger Type</Label>
        <RadioGroup value={triggerType} onValueChange={setTriggerType}>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="schedule" id="schedule" />
            <Label htmlFor="schedule">Schedule (Cron)</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="webhook" id="webhook" />
            <Label htmlFor="webhook">Webhook</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="form" id="form" />
            <Label htmlFor="form">Form Submission</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="table" id="table" />
            <Label htmlFor="table">Table Event</Label>
          </div>
        </RadioGroup>
      </div>

      {/* Progressive disclosure */}
      {triggerType === 'schedule' && (
        <ScheduleTriggerForm
          initialData={initialData?.config}
          onChange={(config) => onChange({ type: 'schedule', config })}
        />
      )}
      {triggerType === 'webhook' && (
        <WebhookTriggerForm
          initialData={initialData?.config}
          onChange={(config) => onChange({ type: 'webhook', config })}
        />
      )}
      {triggerType === 'form' && (
        <FormTriggerForm
          workspaceId={workspaceId}
          initialData={initialData?.config}
          onChange={(config) => onChange({ type: 'form', config })}
        />
      )}
      {triggerType === 'table' && (
        <TableTriggerForm
          workspaceId={workspaceId}
          initialData={initialData?.config}
          onChange={(config) => onChange({ type: 'table', config })}
        />
      )}
    </div>
  );
}
```

### 9. Write Unit Tests

**File**: `apps/web/src/features/workflows/components/trigger-config-form.test.tsx`

- Test trigger type selection
- Test schedule form validation (cron, timezone)
- Test webhook URL generation
- Test form/table selection
- Test checkbox validation (at least one action)
- Test progressive disclosure

### 10. Add i18n Messages

**File**: `messages/vi.json` and `messages/en.json`

```json
{
  "workflow.trigger.type.schedule": "Schedule (Cron)",
  "workflow.trigger.type.webhook": "Webhook",
  "workflow.trigger.type.form": "Form Submission",
  "workflow.trigger.type.table": "Table Event",
  "workflow.trigger.schedule.cron.label": "Schedule",
  "workflow.trigger.schedule.cron.placeholder": "0 9 * * 1",
  "workflow.trigger.schedule.timezone.label": "Timezone",
  "workflow.trigger.webhook.url.label": "Webhook URL",
  "workflow.trigger.webhook.token.label": "Security Token"
}
```

## Todo List

- [ ] Install cronstrue + cron-parser
- [ ] Create trigger-validation.ts with 4 Zod schemas
- [ ] Create cron-input.tsx with builder
- [ ] Create schedule-trigger-form.tsx
- [ ] Create webhook-trigger-form.tsx
- [ ] Create form-trigger-form.tsx
- [ ] Create table-trigger-form.tsx
- [ ] Create trigger-config-form.tsx (main component)
- [ ] Write unit tests (80%+ coverage)
- [ ] Add i18n messages (vi + en)
- [ ] Accessibility testing (keyboard + screen reader)

## Success Criteria

✅ **Schedule Trigger**:

- Cron validation works (instant feedback)
- Cron builder shows common presets
- Human-readable preview updates live
- Timezone selector works

✅ **Webhook Trigger**:

- URL auto-generated on creation
- Copy button works (with toast)
- Security token regenerates
- HTTP method selection works

✅ **Form Trigger**:

- Form dropdown shows workspace forms
- At least one action required (validation)
- Field condition optional (future)

✅ **Table Trigger**:

- Table dropdown shows workspace tables
- At least one action required (validation)
- Field condition optional (future)

✅ **Validation**:

- Real-time validation (<100ms)
- Clear error messages
- Form submission blocked if invalid

✅ **UX**:

- Progressive disclosure (only show selected trigger)
- Keyboard accessible
- Mobile-friendly
- WCAG AA compliant

✅ **Testing**:

- 80%+ test coverage
- All trigger types tested
- Validation edge cases covered

## Risk Assessment

**High Risk**: None
**Medium Risk**: Cron validation complexity
→ Mitigation: Use cronstrue + cron-parser libraries, test with edge cases

**Low Risk**: Form/table dropdowns empty (no data)
→ Mitigation: Show empty state with link to create

## Security Considerations

1. **Webhook URL**: Generated server-side (prevents URL collision)
2. **Security Token**: Min 16 chars, regenerate option
3. **Input Validation**: Zod schemas prevent injection
4. **CSRF**: All mutations use CSRF token (HTTP client)

## Next Steps

1. Complete Phase 4 implementation (this file)
2. Test all 4 trigger types with validation
3. Move to Phase 5: Event Dialogs (uses trigger config)
4. Integrate with Phase 6: Event Editor (full flow)
5. End-to-end test: Create event → Configure trigger → Save
