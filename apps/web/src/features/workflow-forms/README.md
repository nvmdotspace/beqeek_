# Workflow Forms Feature

Visual form builder for creating, configuring, and managing workflow forms.

## Overview

Workflow Forms is a drag-and-drop form builder that allows users to:

- Create forms from templates (BASIC, SUBSCRIPTION, SURVEY)
- Add, edit, delete, and reorder fields
- Configure field properties (type, label, placeholder, required, options)
- Preview forms in real-time
- Manage form submissions (future phase)

## Architecture

### File Structure

```
apps/web/src/features/workflow-forms/
├── types.ts                    # TypeScript interfaces
├── constants.ts                # Templates and field type constants
├── api/
│   └── workflow-forms-api.ts   # API client (POST-based RPC)
├── hooks/                      # React Query hooks (Phase 2)
├── stores/                     # Zustand stores (Phase 2)
├── pages/                      # Page components (Phase 4-5)
├── components/                 # Reusable components (Phase 4-6)
├── utils/                      # Validation utilities (Phase 6)
└── README.md                   # This file
```

### State Management

**React Query** - Server data (forms API)

- `useWorkflowForms()` - List all forms
- `useWorkflowForm()` - Get form details
- `useCreateWorkflowForm()` - Create form mutation
- `useUpdateWorkflowForm()` - Update form mutation
- `useDeleteWorkflowForm()` - Delete form mutation

**Zustand** - Form builder state (Phase 5)

- Fields array (drag-drop ordering)
- Currently editing field
- Form config (title, submit button text)

**useState** - Local UI state

- Dialog open/closed
- Search query
- Loading states

### API Pattern

All endpoints use **POST method** with verb in URL (legacy RPC pattern):

```typescript
// List forms
POST /api/workspace/{workspaceId}/workflow/get/workflow_forms

// Get form detail
POST /api/workspace/{workspaceId}/workflow/get/workflow_forms/{formId}

// Create form
POST /api/workspace/{workspaceId}/workflow/post/workflow_forms
Body: { name, description, formType, config }

// Update form
POST /api/workspace/{workspaceId}/workflow/patch/workflow_forms/{formId}
Body: { name, description, config }

// Delete form
POST /api/workspace/{workspaceId}/workflow/delete/workflow_forms/{formId}
```

### Routes

**File-based routing** (TanStack Router):

```
src/routes/$locale/workspaces/$workspaceId/workflow-forms/
├── index.tsx                   # List view
├── select.tsx                  # Template selection
└── $formId.tsx                 # Form builder detail
```

**Route constants** (`@/shared/route-paths.ts`):

```typescript
ROUTES.WORKFLOW_FORMS.LIST; // /$locale/workspaces/$workspaceId/workflow-forms
ROUTES.WORKFLOW_FORMS.SELECT; // /$locale/workspaces/$workspaceId/workflow-forms/select
ROUTES.WORKFLOW_FORMS.FORM_DETAIL; // /$locale/workspaces/$workspaceId/workflow-forms/$formId
```

## Types

### FormInstance

Complete form entity (API response):

```typescript
{
  id: string;              // Server-generated
  name: string;
  description: string;
  formType: FormType;      // 'BASIC' | 'SUBSCRIPTION' | 'SURVEY'
  config: {
    title: string;
    fields: Field[];
    submitButton: { text: string };
  };
  createdAt?: string;
  updatedAt?: string;
}
```

### Field

Field configuration:

```typescript
{
  type: FieldType;         // 'text' | 'email' | 'number' | 'textarea' | 'select' | 'checkbox' | 'date' | 'datetime-local'
  label: string;
  name: string;            // Auto-generated from label if empty
  placeholder?: string;
  defaultValue?: string;
  required: boolean;
  options?: Option[];      // For select type
  maxlength?: number;      // For textarea (default: 1500)
}
```

## Templates

### FORM_CONFIGS

**BASIC** - Simple contact form

- Full Name (text, required)
- Email (email, required)

**SUBSCRIPTION** - Newsletter signup

- Full Name (text, required)
- Email (email, required)
- Source (select, required): Social, Friends, Ads, Other

**SURVEY** - Feedback form

- Full Name (text, required)
- Email (email, required)
- Rating (select, required): Excellent, Good, Average, Poor
- Feedback (textarea, optional, maxlength: 1500)
- Survey Date (date, required)
- Survey DateTime (datetime-local, optional)

## Usage

### Import Types

```typescript
import type { FormInstance, Field, FormConfig } from '@/features/workflow-forms/types';
```

### Import Constants

```typescript
import { FORM_TYPES, FORM_CONFIGS, FIELD_TYPES } from '@/features/workflow-forms/constants';
```

### API Client

```typescript
import {
  getWorkflowForms,
  getWorkflowFormById,
  createWorkflowForm,
  updateWorkflowForm,
  deleteWorkflowForm,
} from '@/features/workflow-forms/api/workflow-forms-api';

// Fetch all forms
const { data: forms } = await getWorkflowForms('workspace123');

// Create form from template
const { data, message } = await createWorkflowForm('workspace123', {
  name: 'Contact Form',
  description: 'Customer contact form',
  formType: 'BASIC',
  config: FORM_CONFIGS.BASIC,
});
```

### Route Navigation

```typescript
import { getRouteApi } from '@tanstack/react-router';
import { ROUTES } from '@/shared/route-paths';

const route = getRouteApi(ROUTES.WORKFLOW_FORMS.FORM_DETAIL);

export function MyComponent() {
  const { formId, workspaceId, locale } = route.useParams();
  const navigate = route.useNavigate();

  const handleNavigate = () => {
    navigate({
      to: ROUTES.WORKFLOW_FORMS.LIST,
      params: { locale, workspaceId },
    });
  };
}
```

## Implementation Phases

- [x] **Phase 1**: Foundation (types, constants, API client) ✅
- [x] **Phase 2**: React Query hooks ✅
- [x] **Phase 3**: Routes and navigation ✅
- [x] **Phase 4**: List and template selection views ✅
- [x] **Phase 5**: Form builder detail view ✅
- [ ] **Phase 6**: Field management (add, edit, delete, drag-drop)
- [ ] **Phase 7**: Preview, i18n, testing, polish

## Design Decisions

### No E2EE Encryption

Form configs are non-sensitive metadata (labels, types, placeholders). No encryption needed.

### Server-Side ID Generation

API returns form ID in create response. No client-side ID generation.

### No Versioning

Simple CRUD with overwrite. `PATCH` replaces entire config. No version history tracking.

### Manual Validation

TypeScript strict typing + runtime checks. No Zod dependency.
Pattern: `if (!value) return 'Error message'`

## References

- [Implementation Plan](../../../../../plans/251114-2305-workflow-forms-implementation/plan.md)
- [Decisions Document](../../../../../plans/251114-2305-workflow-forms-implementation/DECISIONS.md)
- [Functional Spec](../../../../../docs/workflow-forms-functional-spec.md)
- [Legacy Implementation](../../../../../docs/html-module/workflow-forms.blade.php)
