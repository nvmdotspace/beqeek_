# Phase 5: Event Dialogs

**Date**: 2025-11-20
**Priority**: P1 (User-facing)
**Status**: Planning
**Estimated Effort**: 8-10 hours

## Context

**Related Files**:

- Research: `/docs/research/251120-workflow-trigger-ux-patterns.md`
- Design system: `docs/design-system.md`
- UI components: `packages/ui/src/components/*`

**Dependencies**:

- Phase 1: Event API hooks (useCreateEvent, useUpdateEvent, useDeleteEvent)
- Phase 4: Trigger configuration forms (TriggerConfigForm)

## Key Insights from Research

1. **Multi-Step Creation**: Create event in 2 steps (basic info → trigger config)
2. **Edit in Place**: Edit event name/description inline, full edit in dialog
3. **Delete Confirmation**: Two-step delete (confirm → permanent)
4. **Form Validation**: Block submission until valid
5. **Optimistic Updates**: Instant feedback on save

## Requirements

### Functional

**Create Event Dialog**:

- Step 1: Basic info (name, description)
- Step 2: Trigger configuration (4 types)
- Progress indicator (1 of 2, 2 of 2)
- Back/Next navigation
- Submit creates event with YAML
- Close dialog on success

**Edit Event Dialog**:

- Single form with all fields
- Pre-populate with existing data
- Save updates event (optimistic)
- Close dialog on success

**Delete Confirmation Dialog**:

- Show event name
- Require typing event name to confirm
- Delete button disabled until match
- Close dialog on success

### Non-Functional

- Dialog animations smooth (300ms)
- Form validation instant (<100ms)
- API calls <500ms (typical)
- Mobile-friendly (responsive)
- Accessible (keyboard + screen reader)

## Architecture

### Component Hierarchy

```
CreateEventDialog
  ├── DialogContent
  ├── DialogHeader (with step indicator)
  ├── Step1Form (name, description)
  ├── Step2Form (trigger config)
  └── DialogFooter (Cancel, Back, Next, Create)

EditEventDialog
  ├── DialogContent
  ├── DialogHeader
  ├── EventForm (name, description, trigger config)
  └── DialogFooter (Cancel, Save)

DeleteEventDialog
  ├── DialogContent
  ├── DialogHeader (with warning icon)
  ├── ConfirmationInput (type event name)
  └── DialogFooter (Cancel, Delete)
```

### State Management

**Dialog State (Local)**:

```typescript
// Create dialog
const [step, setStep] = useState<1 | 2>(1);
const [basicInfo, setBasicInfo] = useState({ name: '', description: '' });
const [triggerConfig, setTriggerConfig] = useState<TriggerConfig | null>(null);

// Delete confirmation
const [confirmText, setConfirmText] = useState('');
const isDeleteEnabled = confirmText === event.name;
```

**Form State (TanStack Form)**:

```typescript
const form = useForm({
  defaultValues: {
    name: '',
    description: '',
    trigger_type: 'schedule',
    trigger_config: {},
  },
  validators: {
    onChange: eventFormSchema,
  },
});
```

**Mutations (React Query)**:

- `useCreateEvent()` - Create new event
- `useUpdateEvent()` - Update existing event
- `useDeleteEvent()` - Delete event

### Validation (Zod Schemas)

```typescript
import { z } from 'zod';
import { scheduleConfigSchema, webhookConfigSchema, formConfigSchema, tableConfigSchema } from './trigger-validation';

export const eventBasicInfoSchema = z.object({
  name: z.string().min(1, 'Event name is required').max(100, 'Name too long'),
  description: z.string().max(500, 'Description too long').optional(),
});

export const eventFormSchema = z.object({
  name: z.string().min(1, 'Event name is required').max(100, 'Name too long'),
  description: z.string().max(500, 'Description too long').optional(),
  trigger_type: z.enum(['schedule', 'webhook', 'form', 'table']),
  trigger_config: z.union([scheduleConfigSchema, webhookConfigSchema, formConfigSchema, tableConfigSchema]),
});
```

## Related Code Files

**UI Components** (packages/ui):

- `components/dialog.tsx` - Dialog container
- `components/form.tsx` - Form wrapper
- `components/input.tsx` - Text inputs
- `components/textarea.tsx` - Description field
- `components/button.tsx` - Actions
- `components/progress.tsx` - Step indicator

**Existing Dialog Patterns**:

- `apps/web/src/features/active-tables/components/create-table-dialog.tsx` - Multi-step dialog
- `apps/web/src/features/workflows/components/delete-workflow-dialog.tsx` - Delete confirmation

**Icons** (lucide-react):

- `Plus` - Create button
- `Edit` - Edit button
- `Trash2` - Delete button
- `AlertTriangle` - Delete warning
- `ChevronLeft`, `ChevronRight` - Navigation

## Implementation Steps

### 1. Create Event Form Schema

**File**: `apps/web/src/features/workflows/utils/event-validation.ts`

```typescript
import { z } from 'zod';
import { scheduleConfigSchema, webhookConfigSchema, formConfigSchema, tableConfigSchema } from './trigger-validation';

export const eventBasicInfoSchema = z.object({
  name: z.string().min(1, 'Event name is required').max(100),
  description: z.string().max(500).optional(),
});

export const eventFormSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  trigger_type: z.enum(['schedule', 'webhook', 'form', 'table']),
  trigger_config: z.union([scheduleConfigSchema, webhookConfigSchema, formConfigSchema, tableConfigSchema]),
});
```

### 2. Create Step Indicator Component

**File**: `apps/web/src/features/workflows/components/step-indicator.tsx`

```typescript
import { cn } from '@workspace/ui/lib/utils';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
        <div key={step} className="flex items-center gap-2">
          <div
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium',
              step === currentStep
                ? 'bg-primary text-primary-foreground'
                : step < currentStep
                  ? 'bg-primary/20 text-primary'
                  : 'bg-muted text-muted-foreground'
            )}
          >
            {step}
          </div>
          {step < totalSteps && (
            <div
              className={cn(
                'h-0.5 w-12',
                step < currentStep ? 'bg-primary' : 'bg-muted'
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}
```

### 3. Create Event Dialog (Multi-Step)

**File**: `apps/web/src/features/workflows/components/create-event-dialog.tsx`

```typescript
import { useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { zodValidator } from '@tanstack/zod-form-adapter';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@workspace/ui/components/dialog';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Textarea } from '@workspace/ui/components/textarea';
import { Label } from '@workspace/ui/components/label';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCreateEvent } from '../hooks/use-events';
import { TriggerConfigForm } from './trigger-config-form';
import { StepIndicator } from './step-indicator';
import { eventBasicInfoSchema, eventFormSchema } from '../utils/event-validation';
import type { TriggerConfig } from '../types';
import { reactFlowToYAML } from '../utils/yaml-converter';

interface CreateEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
  unitId: string;
}

export function CreateEventDialog({
  open,
  onOpenChange,
  workspaceId,
  unitId,
}: CreateEventDialogProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [basicInfo, setBasicInfo] = useState({ name: '', description: '' });
  const [triggerConfig, setTriggerConfig] = useState<TriggerConfig | null>(null);

  const createEvent = useCreateEvent(workspaceId);

  const basicForm = useForm({
    defaultValues: basicInfo,
    validatorAdapter: zodValidator(),
    validators: {
      onChange: eventBasicInfoSchema,
    },
  });

  const handleNext = () => {
    // Validate step 1
    const values = basicForm.state.values;
    const result = eventBasicInfoSchema.safeParse(values);

    if (result.success) {
      setBasicInfo(values);
      setStep(2);
    }
  };

  const handleCreate = async () => {
    if (!triggerConfig) return;

    // Generate empty YAML for steps (will be populated in editor)
    const stepsYaml = reactFlowToYAML([], [], triggerConfig);

    await createEvent.mutateAsync({
      unit_id: unitId,
      name: basicInfo.name,
      description: basicInfo.description,
      trigger_type: triggerConfig.type,
      trigger_config_yaml: JSON.stringify(triggerConfig.config), // TODO: Convert to YAML
      steps_yaml: stepsYaml,
      is_active: false, // Default to inactive
    });

    // Close dialog and reset
    onOpenChange(false);
    setStep(1);
    setBasicInfo({ name: '', description: '' });
    setTriggerConfig(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Event</DialogTitle>
          <StepIndicator currentStep={step} totalSteps={2} />
        </DialogHeader>

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <Label>Event Name</Label>
              <basicForm.Field name="name">
                {(field) => (
                  <Input
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Daily Sales Report"
                    autoFocus
                  />
                )}
              </basicForm.Field>
            </div>

            <div>
              <Label>Description (optional)</Label>
              <basicForm.Field name="description">
                {(field) => (
                  <Textarea
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Sends daily sales report to team"
                    rows={3}
                  />
                )}
              </basicForm.Field>
            </div>
          </div>
        )}

        {/* Step 2: Trigger Config */}
        {step === 2 && (
          <TriggerConfigForm
            workspaceId={workspaceId}
            initialData={triggerConfig}
            onChange={setTriggerConfig}
          />
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>

          {step === 2 && (
            <Button variant="outline" onClick={() => setStep(1)}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          )}

          {step === 1 && (
            <Button onClick={handleNext} disabled={!basicForm.state.isValid}>
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          )}

          {step === 2 && (
            <Button
              onClick={handleCreate}
              disabled={!triggerConfig || createEvent.isPending}
            >
              {createEvent.isPending ? 'Creating...' : 'Create Event'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

### 4. Create Edit Event Dialog

**File**: `apps/web/src/features/workflows/components/edit-event-dialog.tsx`

```typescript
import { useEffect } from 'react';
import { useForm } from '@tanstack/react-form';
import { zodValidator } from '@tanstack/zod-form-adapter';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@workspace/ui/components/dialog';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Textarea } from '@workspace/ui/components/textarea';
import { Label } from '@workspace/ui/components/label';
import { useUpdateEvent } from '../hooks/use-events';
import { TriggerConfigForm } from './trigger-config-form';
import { eventFormSchema } from '../utils/event-validation';
import type { WorkflowEvent, TriggerConfig } from '../types';

interface EditEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
  event: WorkflowEvent;
}

export function EditEventDialog({
  open,
  onOpenChange,
  workspaceId,
  event,
}: EditEventDialogProps) {
  const updateEvent = useUpdateEvent(workspaceId, event.id);

  const form = useForm({
    defaultValues: {
      name: event.name,
      description: event.description || '',
      trigger_type: event.trigger_type,
      trigger_config: JSON.parse(event.trigger_config_yaml), // TODO: Parse YAML
    },
    validatorAdapter: zodValidator(),
    validators: {
      onChange: eventFormSchema,
    },
  });

  const handleSave = async () => {
    const values = form.state.values;

    await updateEvent.mutateAsync({
      name: values.name,
      description: values.description,
      trigger_config_yaml: JSON.stringify(values.trigger_config), // TODO: Convert to YAML
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Event</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Event Name</Label>
            <form.Field name="name">
              {(field) => (
                <Input
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              )}
            </form.Field>
          </div>

          <div>
            <Label>Description</Label>
            <form.Field name="description">
              {(field) => (
                <Textarea
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  rows={3}
                />
              )}
            </form.Field>
          </div>

          <form.Field name="trigger_config">
            {(field) => (
              <TriggerConfigForm
                workspaceId={workspaceId}
                initialData={{
                  type: form.state.values.trigger_type,
                  config: field.state.value,
                }}
                onChange={(config) => field.handleChange(config.config)}
              />
            )}
          </form.Field>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!form.state.isValid || updateEvent.isPending}
          >
            {updateEvent.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

### 5. Create Delete Confirmation Dialog

**File**: `apps/web/src/features/workflows/components/delete-event-dialog.tsx`

```typescript
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@workspace/ui/components/dialog';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { AlertTriangle } from 'lucide-react';
import { useDeleteEvent } from '../hooks/use-events';
import type { WorkflowEvent } from '../types';

interface DeleteEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
  event: WorkflowEvent;
}

export function DeleteEventDialog({
  open,
  onOpenChange,
  workspaceId,
  event,
}: DeleteEventDialogProps) {
  const [confirmText, setConfirmText] = useState('');
  const deleteEvent = useDeleteEvent(workspaceId);

  const isDeleteEnabled = confirmText === event.name;

  const handleDelete = async () => {
    await deleteEvent.mutateAsync(event.id);
    onOpenChange(false);
    setConfirmText('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            <DialogTitle>Delete Event</DialogTitle>
          </div>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the
            event and all its workflow steps.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg bg-muted p-4">
            <p className="font-medium">{event.name}</p>
            {event.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {event.description}
              </p>
            )}
          </div>

          <div>
            <Label>
              Type <span className="font-mono">{event.name}</span> to confirm
            </Label>
            <Input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={event.name}
              autoFocus
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={!isDeleteEnabled || deleteEvent.isPending}
          >
            {deleteEvent.isPending ? 'Deleting...' : 'Delete Event'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

### 6. Add Dialog Triggers to Event Card

**File**: `apps/web/src/features/workflows/components/event-card.tsx`

```typescript
import { useState } from 'react';
import { MoreVertical, Edit, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu';
import { Button } from '@workspace/ui/components/button';
import { EditEventDialog } from './edit-event-dialog';
import { DeleteEventDialog } from './delete-event-dialog';

// Add to EventCard component
const [showEditDialog, setShowEditDialog] = useState(false);
const [showDeleteDialog, setShowDeleteDialog] = useState(false);

// Add actions menu to card
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button
      variant="ghost"
      size="icon"
      onClick={(e) => e.stopPropagation()}
    >
      <MoreVertical className="h-4 w-4" />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end">
    <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
      <Edit className="h-4 w-4 mr-2" />
      Edit
    </DropdownMenuItem>
    <DropdownMenuItem
      onClick={() => setShowDeleteDialog(true)}
      className="text-destructive"
    >
      <Trash2 className="h-4 w-4 mr-2" />
      Delete
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>

<EditEventDialog
  open={showEditDialog}
  onOpenChange={setShowEditDialog}
  workspaceId={workspaceId}
  event={event}
/>

<DeleteEventDialog
  open={showDeleteDialog}
  onOpenChange={setShowDeleteDialog}
  workspaceId={workspaceId}
  event={event}
/>
```

### 7. Write Unit Tests

**File**: `apps/web/src/features/workflows/components/event-dialogs.test.tsx`

- Test create dialog multi-step flow
- Test edit dialog pre-population
- Test delete confirmation text matching
- Test form validation
- Test mutation loading states
- Test dialog close on success

### 8. Add i18n Messages

**File**: `messages/vi.json` and `messages/en.json`

```json
{
  "workflow.event.create.title": "Create Event",
  "workflow.event.create.step1": "Basic Information",
  "workflow.event.create.step2": "Trigger Configuration",
  "workflow.event.edit.title": "Edit Event",
  "workflow.event.delete.title": "Delete Event",
  "workflow.event.delete.warning": "This action cannot be undone",
  "workflow.event.delete.confirm": "Type {name} to confirm",
  "workflow.event.name.label": "Event Name",
  "workflow.event.description.label": "Description"
}
```

### 9. Accessibility Testing

- Dialog traps focus (Escape to close)
- Screen reader announces dialog title
- Keyboard navigation (Tab through fields)
- ARIA labels for all form fields
- Focus returns to trigger on close

### 10. Integration Testing

- Create event → appears in list
- Edit event → changes persist
- Delete event → removed from list
- Form validation blocks submission
- API errors show toast notifications

## Todo List

- [ ] Create event-validation.ts with form schemas
- [ ] Create step-indicator.tsx component
- [ ] Create create-event-dialog.tsx (multi-step)
- [ ] Create edit-event-dialog.tsx (single form)
- [ ] Create delete-event-dialog.tsx (confirmation)
- [ ] Add dialog triggers to event-card.tsx
- [ ] Write unit tests (80%+ coverage)
- [ ] Add i18n messages (vi + en)
- [ ] Accessibility testing (focus trap, keyboard)
- [ ] Integration testing (create → edit → delete)

## Success Criteria

✅ **Create Event Dialog**:

- Multi-step flow works (basic → trigger)
- Step indicator shows progress
- Back/Next navigation works
- Form validation blocks invalid data
- Creates event on success

✅ **Edit Event Dialog**:

- Pre-populates with event data
- All fields editable
- Saves changes on submit
- Optimistic update works

✅ **Delete Event Dialog**:

- Shows event details
- Requires typing event name
- Delete button disabled until match
- Removes event on success

✅ **UX**:

- Dialogs animate smoothly (300ms)
- Loading states show spinners
- Success shows toast notification
- Errors show actionable messages

✅ **Accessibility**:

- Focus trapped in dialog
- Escape key closes dialog
- Screen reader announces changes
- Keyboard navigation works

✅ **Testing**:

- 80%+ test coverage
- All dialog flows tested
- Validation edge cases covered

## Risk Assessment

**High Risk**: None
**Medium Risk**: Multi-step form state management
→ Mitigation: Use local state for steps, validate each step independently

**Low Risk**: Dialog close on background click
→ Mitigation: Warn if unsaved changes, prevent accidental close

## Security Considerations

1. **Input Validation**: Zod schemas prevent injection
2. **XSS Prevention**: React escapes all user input
3. **CSRF**: Mutations use CSRF token (HTTP client)
4. **Authorization**: Backend enforces workspace membership

## Next Steps

1. Complete Phase 5 implementation (this file)
2. Test all dialog flows with validation
3. Move to Phase 6: Integration (load/save events)
4. Full end-to-end test: Create → Load → Edit → Save → Delete
5. User acceptance testing with real workflows
