# Phase 1: Foundation - API Client, Types, and Constants

**Date**: 2025-11-14
**Completed**: 2025-11-14
**Priority**: P0 (Critical)
**Status**: ✅ Completed
**Estimate**: 1 day
**Actual**: < 1 hour

## Context

- [Functional Spec](/Users/macos/Workspace/buildinpublic/beqeek/docs/workflow-forms-functional-spec.md)
- [Legacy Implementation](/Users/macos/Workspace/buildinpublic/beqeek/docs/html-module/workflow-forms.blade.php)
- [Active Tables API Pattern](/Users/macos/Workspace/buildinpublic/beqeek/apps/web/src/shared/api/active-tables-client.ts)
- [HTTP Client](/Users/macos/Workspace/buildinpublic/beqeek/apps/web/src/shared/api/http-client.ts)

## Overview

Establish type-safe foundation for workflow forms feature. Define TypeScript interfaces matching API contracts, create centralized constants for form types/templates, implement API client following project's POST-based RPC pattern.

## Key Insights

- Legacy uses POST for all operations (GET, POST, PATCH, DELETE verbs in URL)
- FormType templates hardcoded client-side (BASIC, SUBSCRIPTION, SURVEY)
- Field types: text, email, number, textarea, select, checkbox, date, datetime-local
- FormInstance structure: id, name, description, formType, config (fields + submitButton)
- API pattern: `/api/workspace/{workspaceId}/workflow/{verb}/workflow_forms[/{formId}]`

## Requirements

### Types to Define

1. **FormType** - Template identifiers (BASIC, SUBSCRIPTION, SURVEY)
2. **FieldType** - Input types (text, email, number, textarea, select, checkbox, date, datetime-local)
3. **Field** - Field configuration object (type, label, name, placeholder, defaultValue, required, options)
4. **Option** - Select field options (text, value)
5. **FormConfig** - Form structure (title, fields[], submitButton)
6. **FormInstance** - Complete form entity (id, name, description, formType, config, timestamps)
7. **FormListResponse** - API list response ({ data: FormInstance[] })
8. **FormDetailResponse** - API detail response ({ data: FormInstance })
9. **FormCreatePayload** - Create request (name, description, formType, config)
10. **FormUpdatePayload** - Update request (entire FormInstance)
11. **FormCreateResponse** - Create response ({ data: { id: string }, message: string })
12. **FormDeleteResponse** - Delete response ({ message: string })

### Constants to Create

1. **FORM_TYPES** - Array of form type definitions (type, name, description, logo)
2. **FORM_CONFIGS** - Template configurations (BASIC, SUBSCRIPTION, SURVEY)
3. **FIELD_TYPES** - Object mapping field type constants
4. **DEFAULT_SUBMIT_BUTTON_TEXT** - Default submit button text per locale

### API Client Functions

1. `getWorkflowForms(workspaceId)` - Fetch all forms
2. `getWorkflowFormById(workspaceId, formId)` - Fetch single form
3. `createWorkflowForm(workspaceId, payload)` - Create form
4. `updateWorkflowForm(workspaceId, formId, payload)` - Update form
5. `deleteWorkflowForm(workspaceId, formId)` - Delete form

## Architecture

### File Structure

```
apps/web/src/features/workflow-forms/
├── types.ts                          # TypeScript interfaces
├── constants.ts                      # Form types, templates, field types
├── api/
│   └── workflow-forms-api.ts         # API client functions
└── README.md                         # Feature documentation
```

### Type Definitions (`types.ts`)

**Note**: No Zod schemas. Use TypeScript strict typing + runtime validation functions (see Phase 6 for field validation patterns).

```typescript
// Form type identifiers
export type FormType = 'BASIC' | 'SUBSCRIPTION' | 'SURVEY';

// Field types
export type FieldType = 'text' | 'email' | 'number' | 'textarea' | 'select' | 'checkbox' | 'date' | 'datetime-local';

// Field configuration
export interface Field {
  type: FieldType;
  label: string;
  name: string;
  placeholder?: string;
  defaultValue?: string;
  required: boolean;
  options?: Option[];
  maxlength?: number; // For textarea
}

// Select option
export interface Option {
  text: string;
  value: string;
}

// Form configuration
export interface FormConfig {
  title: string;
  fields: Field[];
  submitButton: {
    text: string;
  };
}

// Form instance (API entity)
export interface FormInstance {
  id: string;
  name: string;
  description: string;
  formType: FormType;
  config: FormConfig;
  createdAt?: string;
  updatedAt?: string;
}

// Form type definition (for template selection)
export interface FormTypeDefinition {
  type: FormType;
  name: string;
  description: string;
  logo: string;
}

// API payloads
export interface FormCreatePayload {
  name: string;
  description: string;
  formType: FormType;
  config: FormConfig;
}

export interface FormUpdatePayload {
  name: string;
  description: string;
  config: FormConfig;
}

// API responses
export interface FormListResponse {
  data: FormInstance[];
}

export interface FormDetailResponse {
  data: FormInstance;
}

export interface FormCreateResponse {
  data: { id: string };
  message: string;
}

export interface FormUpdateResponse {
  message: string;
}

export interface FormDeleteResponse {
  message: string;
}
```

### Constants (`constants.ts`)

```typescript
import type { FormTypeDefinition, FormConfig } from './types';

// Form type definitions (for template selection UI)
export const FORM_TYPES: FormTypeDefinition[] = [
  {
    type: 'BASIC',
    name: 'Form Cơ bản',
    description: 'Form cơ bản với các trường văn bản và email.',
    logo: 'https://img.icons8.com/color/64/000000/form.png',
  },
  {
    type: 'SUBSCRIPTION',
    name: 'Form Đăng ký',
    description: 'Form dành cho đăng ký nhận thông tin hoặc bản tin.',
    logo: 'https://img.icons8.com/color/64/000000/newsletter.png',
  },
  {
    type: 'SURVEY',
    name: 'Form Khảo sát',
    description: 'Form khảo sát với các trường tùy chọn và câu hỏi.',
    logo: 'https://img.icons8.com/color/64/000000/survey.png',
  },
];

// Template configurations (initial field structure)
export const FORM_CONFIGS: Record<string, FormConfig> = {
  BASIC: {
    title: 'Form Cơ bản',
    fields: [
      { type: 'text', label: 'Họ và Tên', name: 'fullName', required: true, placeholder: 'Nhập họ và tên' },
      { type: 'email', label: 'Email', name: 'email', required: true, placeholder: 'Nhập địa chỉ email' },
    ],
    submitButton: { text: 'Gửi' },
  },
  SUBSCRIPTION: {
    title: 'Đăng ký nhận thông tin',
    fields: [
      { type: 'text', label: 'Họ và Tên', name: 'fullName', required: true, placeholder: 'Nhập họ và tên' },
      { type: 'email', label: 'Email', name: 'email', required: true, placeholder: 'Nhập địa chỉ email' },
      {
        type: 'select',
        label: 'Bạn biết chúng tôi qua đâu?',
        name: 'source',
        required: true,
        options: [
          { value: '', text: 'Chọn một tùy chọn' },
          { value: 'social', text: 'Mạng xã hội' },
          { value: 'friend', text: 'Bạn bè giới thiệu' },
          { value: 'ads', text: 'Quảng cáo' },
          { value: 'other', text: 'Khác' },
        ],
      },
    ],
    submitButton: { text: 'Đăng ký' },
  },
  SURVEY: {
    title: 'Khảo sát ý kiến',
    fields: [
      { type: 'text', label: 'Họ và Tên', name: 'fullName', required: true, placeholder: 'Nhập họ và tên' },
      { type: 'email', label: 'Email', name: 'email', required: true, placeholder: 'Nhập địa chỉ email' },
      {
        type: 'select',
        label: 'Bạn đánh giá dịch vụ của chúng tôi thế nào?',
        name: 'rating',
        required: true,
        options: [
          { value: '', text: 'Chọn một tùy chọn' },
          { value: 'excellent', text: 'Tuyệt vời' },
          { value: 'good', text: 'Tốt' },
          { value: 'average', text: 'Trung bình' },
          { value: 'poor', text: 'Kém' },
        ],
      },
      {
        type: 'textarea',
        label: 'Ý kiến đóng góp',
        name: 'feedback',
        required: false,
        placeholder: 'Nhập ý kiến của bạn',
        maxlength: 1500,
      },
      { type: 'date', label: 'Ngày khảo sát', name: 'surveyDate', required: true, placeholder: 'Chọn ngày' },
      {
        type: 'datetime-local',
        label: 'Thời điểm khảo sát',
        name: 'surveyDateTime',
        required: false,
        placeholder: 'Chọn ngày và giờ',
      },
    ],
    submitButton: { text: 'Gửi khảo sát' },
  },
};

// Field type constants
export const FIELD_TYPES = {
  TEXT: 'text',
  EMAIL: 'email',
  NUMBER: 'number',
  TEXTAREA: 'textarea',
  SELECT: 'select',
  CHECKBOX: 'checkbox',
  DATE: 'date',
  DATETIME_LOCAL: 'datetime-local',
} as const;
```

### API Client (`api/workflow-forms-api.ts`)

```typescript
import { apiRequest } from '@/shared/api/http-client';
import type {
  FormListResponse,
  FormDetailResponse,
  FormCreatePayload,
  FormCreateResponse,
  FormUpdatePayload,
  FormUpdateResponse,
  FormDeleteResponse,
} from '../types';

const getApiPath = (workspaceId: string, verb: string, resource: string, id?: string) => {
  const base = `/api/workspace/${workspaceId}/workflow/${verb}/${resource}`;
  return id ? `${base}/${id}` : base;
};

export const getWorkflowForms = async (workspaceId: string): Promise<FormListResponse> => {
  return apiRequest<FormListResponse>({
    method: 'POST',
    url: getApiPath(workspaceId, 'get', 'workflow_forms'),
  });
};

export const getWorkflowFormById = async (workspaceId: string, formId: string): Promise<FormDetailResponse> => {
  return apiRequest<FormDetailResponse>({
    method: 'POST',
    url: getApiPath(workspaceId, 'get', 'workflow_forms', formId),
  });
};

export const createWorkflowForm = async (
  workspaceId: string,
  payload: FormCreatePayload,
): Promise<FormCreateResponse> => {
  return apiRequest<FormCreateResponse, FormCreatePayload>({
    method: 'POST',
    url: getApiPath(workspaceId, 'post', 'workflow_forms'),
    data: payload,
  });
};

export const updateWorkflowForm = async (
  workspaceId: string,
  formId: string,
  payload: FormUpdatePayload,
): Promise<FormUpdateResponse> => {
  return apiRequest<FormUpdateResponse, FormUpdatePayload>({
    method: 'POST',
    url: getApiPath(workspaceId, 'patch', 'workflow_forms', formId),
    data: payload,
  });
};

export const deleteWorkflowForm = async (workspaceId: string, formId: string): Promise<FormDeleteResponse> => {
  return apiRequest<FormDeleteResponse>({
    method: 'POST',
    url: getApiPath(workspaceId, 'delete', 'workflow_forms', formId),
  });
};
```

## Implementation Steps

1. Create feature directory structure: `apps/web/src/features/workflow-forms/`
2. Define TypeScript types in `types.ts` matching functional spec
3. Create constants file with FORM_TYPES and FORM_CONFIGS
4. Implement API client functions in `api/workflow-forms-api.ts`
5. Add JSDoc comments to all exports
6. Write unit tests for API client (mock responses)
7. Update route-paths.ts with workflow forms routes
8. Create feature README.md documenting architecture

## Todo

- [ ] Create `apps/web/src/features/workflow-forms/` directory
- [ ] Create `types.ts` with all interfaces
- [ ] Create `constants.ts` with FORM_TYPES and FORM_CONFIGS
- [ ] Create `api/workflow-forms-api.ts` with API functions
- [ ] Add JSDoc comments to all exports
- [ ] Write unit tests for API client
- [ ] Add workflow forms routes to `route-paths.ts`
- [ ] Create feature `README.md`

## Success Criteria

- ✅ All TypeScript types defined and exported
- ✅ API client functions implement POST-based RPC pattern correctly
- ✅ Constants match legacy implementation exactly
- ✅ No TypeScript errors, strict mode passing
- ✅ Unit tests cover happy path + error scenarios
- ✅ JSDoc comments on all public exports
- ✅ README documents feature architecture

## Risk Assessment

**Low Risk** - Straightforward type definitions and API client. Pattern well-established in codebase.

Risks:

- API contract mismatch with backend → Validate with swagger.yaml if available
- Field type coverage incomplete → Verify all types from legacy code extracted

## Security Considerations

- **No E2EE required** - Legacy analysis confirms no encryption. Form configs are non-sensitive metadata (field labels, types, placeholders)
- **Server-side ID generation** - API returns form ID in create response. No client-side ID generation needed
- **Manual validation** - Use TypeScript strict typing + runtime checks (no Zod dependency). Pattern: `if (!value) return error`
- Auth handled by http-client interceptor (Bearer token)
- Workspace ID validated server-side (prevent unauthorized access)
- **No versioning needed** - Simple CRUD with overwrite (PATCH replaces entire config)

## Next Steps

After Phase 1 completion:

- Phase 2: React Query hooks for CRUD operations
- Phase 3: Routing and navigation setup
