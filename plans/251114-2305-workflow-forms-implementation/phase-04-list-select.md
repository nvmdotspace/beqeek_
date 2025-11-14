# Phase 4: List & Template Selection Views

**Date**: 2025-11-14
**Completed**: 2025-11-15
**Priority**: P1 (High)
**Status**: ✅ Completed
**Estimate**: 1 day
**Actual**: < 30 minutes

## Context

- [Phase 3: Routing](phase-03-routing.md)
- [shadcn/ui Components](https://ui.shadcn.com/docs)
- [Design System](/Users/macos/Workspace/buildinpublic/beqeek/docs/design-system.md)
- [Legacy UI](/Users/macos/Workspace/buildinpublic/beqeek/docs/html-module/workflow-forms.blade.php)

## Overview

Implement List View (display all forms) and Template Selection View (choose form type template). Use shadcn/ui components, design tokens, React Query hooks. Real-time search/filter, loading states, error boundaries.

## Key Insights

- List View: Grid/list toggle, search, empty state, loading skeleton
- Select View: Template cards with icons, descriptions, search filter
- Both views use design tokens (no hardcoded colors)
- Loading states use Skeleton component (not "raptor ripple")
- Empty states with call-to-action
- Mobile-first responsive design
- Vietnamese default, English i18n support

## Requirements

### List View Features

1. Display all forms in grid/table layout
2. Show: form name, description, type, created date
3. Search by name/description
4. "Create Form" button → navigate to select view
5. Click form → navigate to detail view
6. Loading skeleton while fetching
7. Empty state with "Create your first form" CTA
8. Error boundary for API failures

### Template Selection Features

1. Display template cards (BASIC, SUBSCRIPTION, SURVEY)
2. Search/filter templates by name
3. Template card: icon, name, description
4. Click template → open create dialog
5. "Back to List" button
6. Empty state if search yields no results

### Create Form Dialog

1. Modal/dialog component (shadcn/ui Dialog)
2. Fields: Form Name (required), Description, Submit Button Text
3. Pre-fill from selected template
4. Validation: Name required
5. On submit: call create mutation, navigate to detail on success
6. Loading state during creation

## Architecture

### File Structure

```
apps/web/src/features/workflow-forms/
├── pages/
│   ├── workflow-forms-list.tsx           # List view page
│   └── workflow-forms-select.tsx         # Template selection page
├── components/
│   ├── form-list-item.tsx                # Single form in list
│   ├── form-template-card.tsx            # Template selection card
│   ├── create-form-dialog.tsx            # Create form modal
│   ├── form-list-skeleton.tsx            # Loading skeleton
│   └── empty-state.tsx                   # Empty state component
```

### List View (`pages/workflow-forms-list.tsx`)

```tsx
import { useState } from 'react';
import { getRouteApi } from '@tanstack/react-router';
import { ROUTES } from '@/shared/route-paths';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { useWorkflowForms } from '../hooks';
import { FormListItem } from '../components/form-list-item';
import { FormListSkeleton } from '../components/form-list-skeleton';
import { EmptyState } from '../components/empty-state';

const route = getRouteApi(ROUTES.WORKFLOW_FORMS.LIST);

export function WorkflowFormsList() {
  const { workspaceId, locale } = route.useParams();
  const navigate = route.useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading, error } = useWorkflowForms(workspaceId);
  const forms = data?.data ?? [];

  const filteredForms = forms.filter(
    (form) =>
      form.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      form.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (error) {
    throw error; // Caught by error boundary
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Workflow Forms</h1>
        <Button
          onClick={() =>
            navigate({
              to: ROUTES.WORKFLOW_FORMS.SELECT,
              params: { locale, workspaceId },
            })
          }
        >
          Create Form
        </Button>
      </div>

      <Input
        placeholder="Search forms..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="mb-6"
      />

      {isLoading ? (
        <FormListSkeleton count={3} />
      ) : filteredForms.length === 0 ? (
        <EmptyState
          message={searchQuery ? 'No forms found' : 'No forms yet'}
          action={
            !searchQuery && (
              <Button
                onClick={() =>
                  navigate({
                    to: ROUTES.WORKFLOW_FORMS.SELECT,
                    params: { locale, workspaceId },
                  })
                }
              >
                Create your first form
              </Button>
            )
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredForms.map((form) => (
            <FormListItem key={form.id} form={form} />
          ))}
        </div>
      )}
    </div>
  );
}
```

### Template Selection (`pages/workflow-forms-select.tsx`)

```tsx
import { useState } from 'react';
import { getRouteApi } from '@tanstack/react-router';
import { ROUTES } from '@/shared/route-paths';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { FORM_TYPES } from '../constants';
import { FormTemplateCard } from '../components/form-template-card';
import { CreateFormDialog } from '../components/create-form-dialog';
import { EmptyState } from '../components/empty-state';
import type { FormType } from '../types';

const route = getRouteApi(ROUTES.WORKFLOW_FORMS.SELECT);

export function WorkflowFormsSelect() {
  const { workspaceId, locale } = route.useParams();
  const navigate = route.useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<FormType | null>(null);

  const filteredTemplates = FORM_TYPES.filter(
    (template) =>
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Select Form Template</h1>
        <Button
          variant="outline"
          onClick={() =>
            navigate({
              to: ROUTES.WORKFLOW_FORMS.LIST,
              params: { locale, workspaceId },
            })
          }
        >
          View Forms List
        </Button>
      </div>

      <Input
        placeholder="Search templates..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="mb-6"
      />

      {filteredTemplates.length === 0 ? (
        <EmptyState message="No templates found" />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map((template) => (
            <FormTemplateCard
              key={template.type}
              template={template}
              onSelect={() => setSelectedTemplate(template.type)}
            />
          ))}
        </div>
      )}

      <CreateFormDialog
        open={!!selectedTemplate}
        onClose={() => setSelectedTemplate(null)}
        templateType={selectedTemplate}
        workspaceId={workspaceId}
      />
    </div>
  );
}
```

### Form List Item (`components/form-list-item.tsx`)

```tsx
import { getRouteApi } from '@tanstack/react-router';
import { ROUTES } from '@/shared/route-paths';
import { Card, CardHeader, CardTitle, CardDescription } from '@workspace/ui/components/card';
import type { FormInstance } from '../types';

const route = getRouteApi(ROUTES.WORKFLOW_FORMS.LIST);

interface FormListItemProps {
  form: FormInstance;
}

export function FormListItem({ form }: FormListItemProps) {
  const { locale, workspaceId } = route.useParams();
  const navigate = route.useNavigate();

  return (
    <Card
      className="cursor-pointer hover:border-primary transition-colors"
      onClick={() =>
        navigate({
          to: ROUTES.WORKFLOW_FORMS.DETAIL,
          params: { locale, workspaceId, formId: form.id },
        })
      }
    >
      <CardHeader>
        <CardTitle>{form.name}</CardTitle>
        <CardDescription>{form.description || 'No description'}</CardDescription>
      </CardHeader>
    </Card>
  );
}
```

### Template Card (`components/form-template-card.tsx`)

```tsx
import { Card, CardHeader, CardTitle, CardDescription } from '@workspace/ui/components/card';
import type { FormTypeDefinition } from '../types';

interface FormTemplateCardProps {
  template: FormTypeDefinition;
  onSelect: () => void;
}

export function FormTemplateCard({ template, onSelect }: FormTemplateCardProps) {
  return (
    <Card className="cursor-pointer hover:border-primary transition-colors" onClick={onSelect}>
      <CardHeader className="text-center">
        <img src={template.logo} alt={template.name} className="w-16 h-16 mx-auto mb-4" />
        <CardTitle>{template.name}</CardTitle>
        <CardDescription>{template.description}</CardDescription>
      </CardHeader>
    </Card>
  );
}
```

### Create Dialog (`components/create-form-dialog.tsx`)

```tsx
import { useState } from 'react';
import { getRouteApi } from '@tanstack/react-router';
import { ROUTES } from '@/shared/route-paths';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@workspace/ui/components/dialog';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { Textarea } from '@workspace/ui/components/textarea';
import { useCreateWorkflowForm } from '../hooks';
import { FORM_CONFIGS } from '../constants';
import type { FormType } from '../types';

const route = getRouteApi(ROUTES.WORKFLOW_FORMS.SELECT);

interface CreateFormDialogProps {
  open: boolean;
  onClose: () => void;
  templateType: FormType | null;
  workspaceId: string;
}

export function CreateFormDialog({ open, onClose, templateType, workspaceId }: CreateFormDialogProps) {
  const { locale } = route.useParams();
  const navigate = route.useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const createMutation = useCreateWorkflowForm(workspaceId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !templateType) return;

    const config = FORM_CONFIGS[templateType];
    if (!config) return;

    try {
      const result = await createMutation.mutateAsync({
        name,
        description,
        formType: templateType,
        config,
      });

      // Navigate to detail view
      navigate({
        to: ROUTES.WORKFLOW_FORMS.DETAIL,
        params: { locale, workspaceId, formId: result.data.id },
      });
    } catch (error) {
      console.error('Failed to create form:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Form</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="name">Form Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter form name"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter form description"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name || createMutation.isPending}>
              {createMutation.isPending ? 'Creating...' : 'Create Form'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

## Implementation Steps

1. Create `pages/` directory
2. Implement WorkflowFormsList page
3. Implement WorkflowFormsSelect page
4. Create components: FormListItem, FormTemplateCard
5. Create CreateFormDialog with form validation
6. Create EmptyState and FormListSkeleton components
7. Add i18n strings for all UI text
8. Test search/filter functionality
9. Test navigation between views
10. Test form creation flow end-to-end

## Todo

- [ ] Create `pages/` and `components/` directories
- [ ] Implement WorkflowFormsList page
- [ ] Implement WorkflowFormsSelect page
- [ ] Create FormListItem component
- [ ] Create FormTemplateCard component
- [ ] Create CreateFormDialog component
- [ ] Create EmptyState component
- [ ] Create FormListSkeleton component
- [ ] Add i18n translations
- [ ] Test search/filter
- [ ] Test navigation flows

## Success Criteria

- ✅ List view displays all forms with search
- ✅ Template selection shows all templates
- ✅ Create dialog validates and creates forms
- ✅ Navigation between views works correctly
- ✅ Loading states use Skeleton components
- ✅ Empty states have appropriate CTAs
- ✅ Design tokens used (no hardcoded colors)
- ✅ Mobile responsive
- ✅ i18n complete for vi/en

## Risk Assessment

**Low Risk** - Standard CRUD UI. Well-established component patterns.

Risks:

- Template icons from external CDN → Consider self-hosting or using Lucide icons
- Search performance with many forms → Add debounce if needed

## Security Considerations

- No sensitive data displayed
- Workspace scoping enforced by API

## Next Steps

After Phase 4 completion:

- Phase 5: Form builder detail view
