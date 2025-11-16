# Phase 03: Create & Edit Flows (Dynamic Forms)

**Duration**: 8-10 hours
**Dependencies**: Phase 02 complete
**Risk Level**: Medium (complex validation)

## Context

Implement create and edit operations with dynamic config forms. Dialog-based flows for name/description, then navigate to detail for config. Use TanStack Form for validation, shadcn/ui Dialog for modals, React Query mutations for optimistic updates.

## Overview

Enable CRUD operations: Create connector (name + type → detail page), Edit basic info (name/description popup), Dynamic config forms (type-specific fields with validation). Integrate with React Query for cache invalidation and toast notifications.

## Key Insights

1. **Two-step create**: Name/type in dialog → navigate to detail for config
2. **Separate edit flows**: Basic info (dialog) vs Config (detail page)
3. **Type-driven validation**: Required fields, type checking (number, text, checkbox)
4. **Optimistic updates**: Update UI before API response for better UX
5. **Toast feedback**: sonner replaces alert() dialogs

## Requirements

### Functional Requirements

- [ ] Create connector dialog (name, description, type selection)
- [ ] Edit basic info dialog (name, description only)
- [ ] Dynamic config form based on connector type
- [ ] Field validation (required, type, min/max)
- [ ] Optimistic UI updates on mutation success
- [ ] Toast notifications on success/error
- [ ] Navigate to detail page after creation

### Non-Functional Requirements

- [ ] Form validation with TanStack Form
- [ ] Accessible dialogs (ARIA, focus trap, escape key)
- [ ] Design system compliant (shadcn/ui Dialog, Form components)
- [ ] Type-safe form inputs (ConnectorType union)

## Implementation Steps

### Step 1: Create Connector Dialog (3h)

**File**: `apps/web/src/features/workflow-connectors/components/create-connector-dialog.tsx`

```typescript
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@workspace/ui/components/dialog';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Textarea } from '@workspace/ui/components/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
import { Label } from '@workspace/ui/components/label';
import { useForm } from '@tanstack/react-form';
import { CONNECTOR_TYPES, type ConnectorType } from '@workspace/beqeek-shared/workflow-connectors';
import { useCreateConnector } from '../api/connector-api';
import { toast } from 'sonner';
import * as m from '@/paraglide/messages';

interface CreateConnectorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
  locale: string;
  selectedType?: ConnectorType;
  onSuccess: (connectorId: string) => void;
}

export function CreateConnectorDialog({
  open,
  onOpenChange,
  workspaceId,
  selectedType,
  onSuccess
}: CreateConnectorDialogProps) {
  const createMutation = useCreateConnector(workspaceId);

  const form = useForm({
    defaultValues: {
      name: '',
      description: '',
      connectorType: selectedType || ('' as ConnectorType)
    },
    onSubmit: async ({ value }) => {
      try {
        const result = await createMutation.mutateAsync(value);
        toast.success(result.message);
        onSuccess(result.data.id);
        onOpenChange(false);
      } catch (error) {
        toast.error(error.message || 'Failed to create connector');
      }
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{m.workflowConnectors_createTitle()}</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="name">
              {m.workflowConnectors_name()} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              {...form.getFieldProps('name')}
              placeholder={m.workflowConnectors_namePlaceholder()}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="connectorType">{m.workflowConnectors_type()}</Label>
            <Select
              value={form.state.values.connectorType}
              onValueChange={(value) => form.setFieldValue('connectorType', value as ConnectorType)}
            >
              <SelectTrigger>
                <SelectValue placeholder={m.workflowConnectors_selectType()} />
              </SelectTrigger>
              <SelectContent>
                {CONNECTOR_TYPES.map(type => (
                  <SelectItem key={type.type} value={type.type}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{m.workflowConnectors_description()}</Label>
            <Textarea
              id="description"
              {...form.getFieldProps('description')}
              placeholder={m.workflowConnectors_descriptionPlaceholder()}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {m.workflowConnectors_cancel()}
            </Button>
            <Button type="submit" disabled={form.state.isSubmitting}>
              {form.state.isSubmitting ? m.workflowConnectors_creating() : m.workflowConnectors_create()}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

### Step 2: Edit Basic Info Dialog (2h)

Similar structure, but for updating name/description only using useUpdateConnector.

### Step 3: Dynamic Config Form Hook (2h)

**File**: `apps/web/src/features/workflow-connectors/hooks/use-connector-config.ts`

```typescript
import { CONNECTOR_CONFIGS } from '@workspace/beqeek-shared/workflow-connectors';

export function useConnectorConfig(connectorType: string) {
  return (
    CONNECTOR_CONFIGS.find((c) => c.connectorType === connectorType) || {
      configFields: [],
      oauth: false,
    }
  );
}
```

### Step 4: Password Field Component (1.5h)

**File**: `apps/web/src/features/workflow-connectors/components/password-field.tsx`

```typescript
import { Input } from '@workspace/ui/components/input';
import { Button } from '@workspace/ui/components/button';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

export function PasswordField({ ...props }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <Input {...props} type={showPassword ? 'text' : 'password'} className="pr-10" />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute right-0 top-0 h-full"
        onClick={() => setShowPassword(!showPassword)}
        aria-label={showPassword ? 'Hide password' : 'Show password'}
      >
        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </Button>
    </div>
  );
}
```

### Step 5: Connector Config Form (3-4h)

Dynamic form generation from CONNECTOR_CONFIGS, handles text/number/password/checkbox types, validation.

## Todo List

- [ ] Create CreateConnectorDialog component
- [ ] Create EditBasicInfoDialog component
- [ ] Create PasswordField component
- [ ] Create useConnectorConfig hook
- [ ] Add i18n messages for form labels/placeholders
- [ ] Integrate create dialog in Select view
- [ ] Add "Create" button in List view
- [ ] Test required field validation
- [ ] Test type-specific validation (number, checkbox)
- [ ] Test optimistic updates
- [ ] Test toast notifications
- [ ] Test dialog accessibility (keyboard, screen reader)

## Success Criteria

- [ ] Can create connector with name + type
- [ ] Auto-navigate to detail page after creation
- [ ] Can edit name/description via settings button
- [ ] Form validation prevents invalid submission
- [ ] Toast shows success/error messages
- [ ] Optimistic UI updates before API response
- [ ] Dialog closes on success
- [ ] Password fields have show/hide toggle

## Security Considerations

- No secret fields exposed in create dialog (set later in detail)
- Client-side validation (server validates too)

## Next Steps

**Phase 04**: Detail view with full config form + OAuth integration
