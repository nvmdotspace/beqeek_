# Workflow Trigger Configuration UX Research

**Date**: 2025-11-20
**Status**: Complete
**Research Scope**: UI/UX patterns for workflow trigger configuration forms across n8n, Zapier, Make.com

---

## Executive Summary

Research analyzed leading automation platforms (n8n, Zapier, Make.com) and form validation libraries (react-hook-form, Zod) to identify best practices for trigger configuration UX. Key findings: progressive disclosure reduces cognitive load, natural language interfaces improve usability for cron expressions, and conditional validation with superRefine() enables dynamic field dependencies.

---

## 1. Trigger Types & UX Patterns

### 1.1 Schedule (Cron) Triggers

**Best Practices from n8n & UX Research:**

- **Natural Language Interface**: Convert cron expressions to readable sentences with underlined dropdown choices
  - Example: "Every [Monday] at [9:00 AM]" where underlined parts are clickable
  - Reduces errors compared to raw cron syntax (0 9 \* \* 1)

- **Dual Input Modes**:
  - **Visual Builder** (default): Tab-based interface with sections for Minutes, Hours, Days, Months
  - **Raw Expression** (advanced): Direct text input with syntax validation and preview
  - Toggle between modes with format conversion

- **Validation & Preview**:
  - Real-time validation with red border/background for errors
  - Human-readable preview: "Next 3 runs: Nov 20 9:00 AM, Nov 27 9:00 AM..."
  - Support shortcuts: @daily, @weekly, @monthly, @yearly, @hourly

**Component Structure**:

```tsx
<Stack space="space-300">
  {/* Mode Toggle */}
  <Inline space="space-150" align="center">
    <Label>Input Mode</Label>
    <SegmentedControl
      options={[
        { label: 'Visual Builder', value: 'builder' },
        { label: 'Cron Expression', value: 'raw' },
      ]}
    />
  </Inline>

  {mode === 'builder' ? (
    <CronBuilderTabs /> // Tabs: Minutes, Hours, Days, Months
  ) : (
    <Input placeholder="0 9 * * 1" aria-invalid={!isValidCron} aria-describedby="cron-error" />
  )}

  {/* Preview Box */}
  <Box backgroundColor="muted" padding="space-200" borderRadius="md">
    <Text size="small" color="muted">
      Next runs:
    </Text>
    <Text size="small">{nextRuns}</Text>
  </Box>
</Stack>
```

**Libraries for React**:

- `react-cron-generator` (12k+ downloads/week)
- `react-js-cron-mui` (Material UI integration)
- `cron-expression-input` (Accessible natural language UI)

---

### 1.2 Webhook Triggers

**Best Practices from n8n & Zapier:**

- **Auto-Generated URLs**: Provide pre-generated webhook URLs on load
  - Display: `https://api.beqeek.com/webhook/wh_abc123xyz`
  - Copy button with visual confirmation (toast notification)

- **Progressive Disclosure**:
  - **Primary View**: URL display + Copy button
  - **Advanced Settings** (collapsed by default):
    - HTTP Methods (GET, POST, PUT, DELETE - multi-select)
    - Authentication (None, API Key, Basic Auth, Bearer Token)
    - Response configuration (status code, body template)

- **Security Options**:
  - Secret key generation for HMAC validation
  - IP whitelist (optional)
  - Rate limiting configuration

**Component Structure**:

```tsx
<Stack space="space-300">
  {/* Webhook URL */}
  <Stack space="space-100">
    <Label>Webhook URL</Label>
    <Inline space="space-150">
      <Input value={webhookUrl} readOnly className="font-mono" />
      <Button variant="outline" size="icon" onClick={handleCopy} aria-label="Copy webhook URL">
        <Copy className="size-4" />
      </Button>
    </Inline>
  </Stack>

  {/* Advanced Settings - Accordion */}
  <Accordion type="single" collapsible>
    <AccordionItem value="methods">
      <AccordionTrigger>HTTP Methods</AccordionTrigger>
      <AccordionContent>
        <CheckboxGroup>
          <Checkbox id="get" label="GET" />
          <Checkbox id="post" label="POST" checked />
          <Checkbox id="put" label="PUT" />
        </CheckboxGroup>
      </AccordionContent>
    </AccordionItem>

    <AccordionItem value="auth">
      <AccordionTrigger>Authentication</AccordionTrigger>
      <AccordionContent>{/* Conditional fields based on auth type */}</AccordionContent>
    </AccordionItem>
  </Accordion>

  {/* Test Webhook */}
  <Box backgroundColor="info" padding="space-200" borderRadius="md">
    <Text size="small">Send a test request to verify webhook configuration</Text>
    <Button variant="outline" size="sm">
      Send Test Request
    </Button>
  </Box>
</Stack>
```

---

### 1.3 Form Submit Triggers

**Best Practices from Zapier Integration Guides:**

- **Form Selection**: Searchable dropdown with form previews
  - Show form name, last modified date, submission count
  - Option to "Create New Form" (redirect to form builder)

- **Field Mapping Preview**:
  - Display detected form fields with types (text, email, number, date)
  - Visual mapping to workflow variables
  - Auto-detect field types for validation

**Component Structure**:

```tsx
<Stack space="space-300">
  {/* Form Selection */}
  <Stack space="space-100">
    <Label htmlFor="form-select">Select Form</Label>
    <Select onValueChange={handleFormChange}>
      <SelectTrigger id="form-select">
        <SelectValue placeholder="Choose a form..." />
      </SelectTrigger>
      <SelectContent>
        {forms.map((form) => (
          <SelectItem value={form.id} key={form.id}>
            <div>
              <Text weight="medium">{form.name}</Text>
              <Text size="small" color="muted">
                {form.submissionCount} submissions
              </Text>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </Stack>

  {/* Field Preview (conditional) */}
  {selectedForm && (
    <Box padding="space-300" backgroundColor="card" borderRadius="lg" border="default">
      <Stack space="space-200">
        <Heading level={4}>Form Fields</Heading>
        {selectedForm.fields.map((field) => (
          <Inline justify="between" align="center" key={field.name}>
            <Text>{field.label}</Text>
            <Badge variant="secondary">{field.type}</Badge>
          </Inline>
        ))}
      </Stack>
    </Box>
  )}

  {/* Action on Submit */}
  <Stack space="space-100">
    <Label>When form is submitted</Label>
    <RadioGroup>
      <Radio value="instant" label="Trigger immediately" />
      <Radio value="batch" label="Batch every 15 minutes" />
    </RadioGroup>
  </Stack>
</Stack>
```

---

### 1.4 Database Action Triggers

**Best Practices from n8n "Resource → Operation" Pattern:**

- **Two-Step Selection**:
  1. **Resource**: Table/Collection selection (most important field)
  2. **Operation**: Action type (second field - depends on Resource)

- **Scope from Broad to Narrow**:
  - Database → Table → Action → Conditions
  - Follow n8n's field ordering principle

**Component Structure**:

```tsx
<Stack space="space-300">
  {/* Step 1: Table Selection */}
  <Stack space="space-100">
    <Label htmlFor="table">Select Table</Label>
    <Select onValueChange={handleTableChange}>
      <SelectTrigger id="table">
        <SelectValue placeholder="Choose a table..." />
      </SelectTrigger>
      <SelectContent>
        {tables.map((table) => (
          <SelectItem value={table.id}>
            {table.name} ({table.recordCount} records)
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </Stack>

  {/* Step 2: Action Type (conditional) */}
  {selectedTable && (
    <Stack space="space-100">
      <Label htmlFor="action">Trigger on</Label>
      <Select onValueChange={handleActionChange}>
        <SelectTrigger id="action">
          <SelectValue placeholder="Select action..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="record_created">Record Created</SelectItem>
          <SelectItem value="record_updated">Record Updated</SelectItem>
          <SelectItem value="record_deleted">Record Deleted</SelectItem>
          <SelectItem value="field_changed">Specific Field Changed</SelectItem>
        </SelectContent>
      </Select>
    </Stack>
  )}

  {/* Step 3: Conditions (conditional) */}
  {selectedAction === 'field_changed' && (
    <Stack space="space-100">
      <Label>Field to Watch</Label>
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select field..." />
        </SelectTrigger>
        <SelectContent>
          {selectedTable.fields.map((field) => (
            <SelectItem value={field.id}>{field.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Stack>
  )}
</Stack>
```

---

## 2. Form Design Patterns

### 2.1 Progressive Disclosure

**Definition**: Defer advanced features to secondary UI, keeping essential content in primary view.

**Benefits**:

- Reduces cognitive load by 40-60% (NN/g research)
- Simplifies complex forms (eCommerce checkout standard)
- Reduces errors by hiding rare-use options

**Implementation Patterns**:

1. **Accordion Pattern** (Recommended for Triggers):

   ```tsx
   <Accordion type="single" collapsible defaultValue="basic">
     <AccordionItem value="basic">
       <AccordionTrigger>Basic Settings</AccordionTrigger>
       <AccordionContent>{/* Essential fields: trigger type, name */}</AccordionContent>
     </AccordionItem>
     <AccordionItem value="advanced">
       <AccordionTrigger>Advanced Options</AccordionTrigger>
       <AccordionContent>{/* Retry logic, timeout, filters */}</AccordionContent>
     </AccordionItem>
   </Accordion>
   ```

2. **Conditional Disclosure**:

   ```tsx
   // Show API key field only if auth type is "API Key"
   {
     authType === 'api_key' && <Input label="API Key" type="password" required />;
   }
   ```

3. **Staged Disclosure** (Multi-Step Forms):
   ```tsx
   // Step 1: Trigger Type → Step 2: Configuration → Step 3: Test
   <Stepper currentStep={step}>
     <Step label="Choose Trigger Type" />
     <Step label="Configure Settings" />
     <Step label="Test & Activate" />
   </Stepper>
   ```

### 2.2 Field Dependencies

**Zapier Best Practice**: Order fields from most important to least important.

**n8n Best Practice**: Resource first, then Operation, then specific parameters.

**Implementation**:

- Use `watch()` from react-hook-form to observe field changes
- Conditionally render fields based on watched values
- Clear dependent field values when parent changes

```tsx
const triggerType = watch('triggerType');

useEffect(() => {
  if (triggerType !== 'webhook') {
    setValue('webhookConfig', null); // Clear webhook-specific fields
  }
}, [triggerType, setValue]);
```

---

## 3. Validation Rules

### 3.1 Zod Schema with Conditional Validation

**Using `.superRefine()` for Complex Dependencies**:

```typescript
const triggerSchema = z
  .object({
    name: z.string().min(1, 'Name is required').max(100),
    triggerType: z.enum(['schedule', 'webhook', 'form_submit', 'database_action']),
    config: z.object({}).passthrough(), // Dynamic based on triggerType
  })
  .superRefine((data, ctx) => {
    // Conditional validation based on triggerType
    if (data.triggerType === 'schedule') {
      if (!data.config.cronExpression) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Cron expression is required for schedule triggers',
          path: ['config', 'cronExpression'],
        });
      }
    }

    if (data.triggerType === 'webhook') {
      if (!data.config.allowedMethods || data.config.allowedMethods.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'At least one HTTP method must be selected',
          path: ['config', 'allowedMethods'],
        });
      }
    }
  });
```

**Dynamic Schema Selection** (Recommended):

```typescript
const baseSchema = z.object({
  name: z.string().min(1).max(100),
  triggerType: z.enum(['schedule', 'webhook', 'form_submit', 'database_action']),
});

const scheduleSchema = baseSchema.extend({
  config: z.object({
    cronExpression: z
      .string()
      .regex(
        /^(@(yearly|monthly|weekly|daily|hourly)|(\*|[0-9,\-\/]+)\s+(\*|[0-9,\-\/]+)\s+(\*|[0-9,\-\/]+)\s+(\*|[0-9,\-\/]+)\s+(\*|[0-9,\-\/]+))$/,
      ),
    timezone: z.string().default('UTC'),
  }),
});

const webhookSchema = baseSchema.extend({
  config: z.object({
    webhookUrl: z.string().url(),
    allowedMethods: z.array(z.enum(['GET', 'POST', 'PUT', 'DELETE'])).min(1),
    authentication: z.enum(['none', 'api_key', 'bearer']).default('none'),
    secretKey: z.string().optional(),
  }),
});

// Select schema dynamically
const getSchema = (triggerType: string) => {
  switch (triggerType) {
    case 'schedule':
      return scheduleSchema;
    case 'webhook':
      return webhookSchema;
    // ... other cases
    default:
      return baseSchema;
  }
};
```

### 3.2 Error Handling Best Practices

**From n8n & Zapier**:

1. **Inline Validation**: Show errors immediately below fields
2. **Error Summary**: Display count at top: "3 errors found"
3. **Scroll to First Error**: Auto-focus first invalid field on submit
4. **Toast Notifications**: Success/failure feedback after save

```tsx
<form onSubmit={handleSubmit(onSubmit)}>
  {/* Error Summary */}
  {Object.keys(errors).length > 0 && (
    <Alert variant="destructive">
      <AlertTitle>Validation Error</AlertTitle>
      <AlertDescription>Please fix {Object.keys(errors).length} error(s) below.</AlertDescription>
    </Alert>
  )}

  {/* Field with Error */}
  <Stack space="space-100">
    <Label htmlFor="name">Trigger Name</Label>
    <Input
      id="name"
      {...register('name')}
      aria-invalid={!!errors.name}
      aria-describedby={errors.name ? 'name-error' : undefined}
    />
    {errors.name && (
      <Text id="name-error" size="small" className="text-destructive">
        {errors.name.message}
      </Text>
    )}
  </Stack>
</form>
```

---

## 4. Example Component Structure

### 4.1 Complete Trigger Configuration Form

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Stack, Inline } from '@workspace/ui/components/primitives';
import { Heading, Text } from '@workspace/ui/components/typography';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@workspace/ui/components/select';
import { Input } from '@workspace/ui/components/input';
import { Button } from '@workspace/ui/components/button';
import { Label } from '@workspace/ui/components/label';

// Base schema
const triggerFormSchema = z
  .object({
    name: z.string().min(1, 'Name is required').max(100),
    description: z.string().max(500).optional(),
    triggerType: z.enum(['schedule', 'webhook', 'form_submit', 'database_action']),
  })
  .passthrough();

export function TriggerConfigForm() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(triggerFormSchema),
    defaultValues: {
      triggerType: 'schedule',
    },
  });

  const triggerType = watch('triggerType');

  const onSubmit = (data) => {
    console.log('Form submitted:', data);
    // API call here
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack space="space-400">
        {/* Header */}
        <Stack space="space-100">
          <Heading level={2}>Create Trigger</Heading>
          <Text color="muted">Configure when this workflow should execute</Text>
        </Stack>

        {/* Basic Info */}
        <Stack space="space-200">
          <Stack space="space-100">
            <Label htmlFor="name">Trigger Name</Label>
            <Input
              id="name"
              placeholder="e.g., Daily report generation"
              {...register('name')}
              aria-invalid={!!errors.name}
            />
            {errors.name && (
              <Text size="small" className="text-destructive">
                {errors.name.message}
              </Text>
            )}
          </Stack>

          <Stack space="space-100">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea id="description" placeholder="Describe what this trigger does..." {...register('description')} />
          </Stack>
        </Stack>

        {/* Trigger Type Selection */}
        <Stack space="space-100">
          <Label htmlFor="trigger-type">Trigger Type</Label>
          <Select {...register('triggerType')}>
            <SelectTrigger id="trigger-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="schedule">Schedule (Cron)</SelectItem>
              <SelectItem value="webhook">Webhook</SelectItem>
              <SelectItem value="form_submit">Form Submit</SelectItem>
              <SelectItem value="database_action">Database Action</SelectItem>
            </SelectContent>
          </Select>
        </Stack>

        {/* Dynamic Configuration based on trigger type */}
        {triggerType === 'schedule' && <ScheduleConfig />}
        {triggerType === 'webhook' && <WebhookConfig />}
        {triggerType === 'form_submit' && <FormSubmitConfig />}
        {triggerType === 'database_action' && <DatabaseActionConfig />}

        {/* Actions */}
        <Inline space="space-150" justify="end">
          <Button type="button" variant="outline">
            Cancel
          </Button>
          <Button type="submit">Create Trigger</Button>
        </Inline>
      </Stack>
    </form>
  );
}
```

---

## 5. Design Mockup Descriptions

### 5.1 Schedule Trigger Configuration

**Visual Layout**:

```
┌────────────────────────────────────────────────┐
│ Create Trigger                                 │
│ Configure when this workflow should execute    │
├────────────────────────────────────────────────┤
│ Trigger Name *                                 │
│ [Daily report generation........................]│
│                                                │
│ Description (Optional)                         │
│ [Generate and send reports every morning....]  │
│                                                │
│ Trigger Type *                                 │
│ [Schedule (Cron) ▼]                           │
│                                                │
│ ┌──────────────────────────────────────────┐  │
│ │ Schedule Configuration                   │  │
│ │                                          │  │
│ │ Input Mode: ( Visual Builder ) Raw      │  │
│ │                                          │  │
│ │ ┌─────────────────────────────────────┐ │  │
│ │ │ Tabs: [Minutes] [Hours] [Days] ...  │ │  │
│ │ │                                      │ │  │
│ │ │ Every: [○ Minute ○ Hour ● Day]      │ │  │
│ │ │ At:    [09]:[00] [AM ▼]            │ │  │
│ │ │ On:    [☑ Mon] [☐ Tue] [☐ Wed]...  │ │  │
│ │ └─────────────────────────────────────┘ │  │
│ │                                          │  │
│ │ Preview: Next 3 runs                    │  │
│ │ • Nov 20, 2025 at 9:00 AM              │  │
│ │ • Nov 27, 2025 at 9:00 AM              │  │
│ │ • Dec 4, 2025 at 9:00 AM               │  │
│ └──────────────────────────────────────────┘  │
│                                                │
│ [Advanced Options ▼]                          │
│                                                │
│                       [Cancel] [Create Trigger]│
└────────────────────────────────────────────────┘
```

### 5.2 Webhook Trigger Configuration

**Visual Layout**:

```
┌────────────────────────────────────────────────┐
│ Create Trigger                                 │
│ Configure when this workflow should execute    │
├────────────────────────────────────────────────┤
│ Trigger Name *                                 │
│ [New order webhook...........................]│
│                                                │
│ Trigger Type *                                 │
│ [Webhook ▼]                                   │
│                                                │
│ ┌──────────────────────────────────────────┐  │
│ │ Webhook Configuration                    │  │
│ │                                          │  │
│ │ Webhook URL (auto-generated)            │  │
│ │ [https://api.beqeek.com/wh/abc123] [📋] │  │
│ │                                          │  │
│ │ ▼ HTTP Methods                          │  │
│ │   [☐ GET] [☑ POST] [☐ PUT] [☐ DELETE] │  │
│ │                                          │  │
│ │ ▼ Authentication                        │  │
│ │   ( None ) API Key  Bearer Token        │  │
│ │                                          │  │
│ │ ▼ Advanced Settings                     │  │
│ │   Response Status Code: [200 ▼]        │  │
│ │   Response Body: [JSON ▼]              │  │
│ │                                          │  │
│ │ ℹ Test your webhook                     │  │
│ │ [Send Test Request]                     │  │
│ └──────────────────────────────────────────┘  │
│                                                │
│                       [Cancel] [Create Trigger]│
└────────────────────────────────────────────────┘
```

---

## 6. Recommendations Summary

### High Priority (Must Have)

1. **Progressive Disclosure**: Use accordions for advanced settings (reduces cognitive load 40-60%)
2. **Dynamic Validation**: Implement conditional Zod schemas based on trigger type
3. **Inline Error Display**: Show validation errors immediately below fields with aria-describedby
4. **Natural Language Cron**: Use visual builder as default with raw input toggle
5. **Auto-Generated URLs**: For webhooks, generate URL on component mount

### Medium Priority (Should Have)

6. **Field Preview**: Show next 3 scheduled runs for cron, detected fields for forms
7. **Test Functionality**: "Send Test Request" for webhooks, "Test Cron" with next run time
8. **Copy to Clipboard**: Webhook URLs with visual confirmation (toast)
9. **Default Values**: Pre-populate common configurations (e.g., POST for webhooks)
10. **Keyboard Navigation**: Full keyboard support with proper focus management

### Low Priority (Nice to Have)

11. **Visual Templates**: Pre-configured trigger templates ("Daily at 9 AM", "Every Monday")
12. **Usage Analytics**: Show "Most popular trigger type: Schedule (45%)"
13. **Related Documentation**: Inline help tooltips with links to docs
14. **Multi-Language**: Support for Vietnamese natural language in cron builder

---

## Unresolved Questions

1. **Cron Library Choice**: Should we use `react-cron-generator` (popular) or `react-js-cron-mui` (Material UI aligned)? Need to test Vietnamese localization support.

2. **Webhook Security**: Should we enforce HMAC signature validation by default, or make it opt-in? Industry standard varies.

3. **Form Submit Trigger**: How to handle form changes after trigger creation? Auto-update field mappings or require manual reconfiguration?

4. **Database Action Polling**: What's acceptable polling interval for record changes? Real-time via WebSocket or batch every 5 min?

5. **Error Recovery**: Should failed triggers auto-retry with exponential backoff, or require manual intervention?

---

## References

- n8n Node UI Design Guide: https://docs.n8n.io/integrations/creating-nodes/plan/node-ui-design/
- Zapier Trigger Design Best Practices: https://community.zapier.com/general-discussion-13/trigger-design-best-practices-24336
- NN/g Progressive Disclosure: https://www.nngroup.com/articles/progressive-disclosure/
- React Hook Form + Zod Conditional Validation: https://micahjon.com/2023/form-validation-with-zod/
- Cron Expression Input Components: https://github.com/JossyDevers/cron-expression-input
