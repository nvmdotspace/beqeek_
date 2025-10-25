import { http, HttpResponse } from 'msw';
import { mockStore } from '../data/store';
import { QueryRequest, MutationRequest } from '../types';

// Helper to extract user ID from Authorization header
function getUserIdFromAuth(request: Request): string | null {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  return mockStore.validateToken(token);
}

interface WorkflowForm {
  id: string;
  workspaceId: string;
  name: string;
  description?: string;
  fields: FormField[];
  settings: FormSettings;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface FormField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'email' | 'number' | 'date' | 'select' | 'textarea' | 'checkbox' | 'radio' | 'file';
  required: boolean;
  placeholder?: string;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
  order: number;
}

interface FormSettings {
  submitAction: 'email' | 'webhook' | 'database' | 'custom';
  submitUrl?: string;
  redirectUrl?: string;
  emailRecipients?: string[];
  allowMultipleSubmissions: boolean;
  requireAuthentication: boolean;
  captchaEnabled: boolean;
}

// Mock forms data
const mockForms: WorkflowForm[] = [
  {
    id: '7001',
    workspaceId: '1001',
    name: 'Contact Form',
    description: 'General contact form for website',
    fields: [
      {
        id: 'field_1',
        name: 'name',
        label: 'Full Name',
        type: 'text',
        required: true,
        placeholder: 'Enter your full name',
        order: 1,
      },
      {
        id: 'field_2',
        name: 'email',
        label: 'Email Address',
        type: 'email',
        required: true,
        placeholder: 'Enter your email',
        validation: {
          pattern: '^[^@]+@[^@]+\\.[^@]+$',
          message: 'Please enter a valid email address',
        },
        order: 2,
      },
      {
        id: 'field_3',
        name: 'subject',
        label: 'Subject',
        type: 'select',
        required: true,
        options: ['General Inquiry', 'Support', 'Sales', 'Partnership'],
        order: 3,
      },
      {
        id: 'field_4',
        name: 'message',
        label: 'Message',
        type: 'textarea',
        required: true,
        placeholder: 'Enter your message',
        validation: {
          min: 10,
          max: 1000,
          message: 'Message must be between 10 and 1000 characters',
        },
        order: 4,
      },
    ],
    settings: {
      submitAction: 'email',
      emailRecipients: ['contact@company.com'],
      redirectUrl: '/thank-you',
      allowMultipleSubmissions: true,
      requireAuthentication: false,
      captchaEnabled: true,
    },
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '7002',
    workspaceId: '1001',
    name: 'Job Application Form',
    description: 'Form for job applications',
    fields: [
      {
        id: 'field_5',
        name: 'fullName',
        label: 'Full Name',
        type: 'text',
        required: true,
        order: 1,
      },
      {
        id: 'field_6',
        name: 'email',
        label: 'Email',
        type: 'email',
        required: true,
        order: 2,
      },
      {
        id: 'field_7',
        name: 'position',
        label: 'Position Applied For',
        type: 'select',
        required: true,
        options: ['Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'DevOps Engineer'],
        order: 3,
      },
      {
        id: 'field_8',
        name: 'resume',
        label: 'Resume',
        type: 'file',
        required: true,
        order: 4,
      },
    ],
    settings: {
      submitAction: 'webhook',
      submitUrl: 'https://api.company.com/applications',
      allowMultipleSubmissions: false,
      requireAuthentication: false,
      captchaEnabled: true,
    },
    isActive: true,
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
  },
];

export const workflowFormHandlers = [
  // POST /api/workspace/{workspaceId}/workflow/get/forms
  http.post('*/api/workspace/:workspaceId/workflow/get/forms', async ({ request, params }) => {
    const userId = getUserIdFromAuth(request);

    if (!userId) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { workspaceId } = params;

    try {
      const body = (await request.json()) as QueryRequest;

      let forms = mockForms.filter((form) => form.workspaceId === workspaceId);

      // Apply filtering if specified
      if (body.queries?.filtering) {
        if (body.queries.filtering.search && typeof body.queries.filtering.search === 'string') {
          const searchTerm = body.queries.filtering.search.toLowerCase();
          forms = forms.filter(
            (form) =>
              form.name.toLowerCase().includes(searchTerm) || form.description?.toLowerCase().includes(searchTerm),
          );
        }

        if (body.queries.filtering.isActive !== undefined) {
          forms = forms.filter((form) => form.isActive === body.queries?.filtering?.isActive);
        }
      }

      // Apply sorting if specified
      if (body.queries?.sorting && typeof body.queries.sorting === 'object') {
        const sorting = body.queries.sorting as { field: string; direction: 'asc' | 'desc' };
        const { field, direction } = sorting;
        forms.sort((a, b) => {
          const aValue = a[field as keyof WorkflowForm];
          const bValue = b[field as keyof WorkflowForm];

          if (aValue === undefined || bValue === undefined) return 0;

          if (direction === 'desc') {
            return aValue > bValue ? -1 : 1;
          }
          return aValue > bValue ? 1 : -1;
        });
      }

      // Apply pagination
      const page = body.queries?.pagination?.page || 1;
      const perPage = body.queries?.pagination?.per_page || 50;
      const startIndex = (page - 1) * perPage;
      const endIndex = startIndex + perPage;
      const paginatedForms = forms.slice(startIndex, endIndex);

      return HttpResponse.json({
        data: paginatedForms,
        meta: {
          current_page: page,
          last_page: Math.ceil(forms.length / perPage),
          per_page: perPage,
          total: forms.length,
        },
      });
    } catch {
      return HttpResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
  }),

  // POST /api/workspace/{workspaceId}/workflow/get/forms/{formId}
  http.post('*/api/workspace/:workspaceId/workflow/get/forms/:formId', async ({ request, params }) => {
    const userId = getUserIdFromAuth(request);

    if (!userId) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { workspaceId, formId } = params;

    const form = mockForms.find((f) => f.id === formId && f.workspaceId === workspaceId);

    if (!form) {
      return HttpResponse.json({ message: 'Form not found' }, { status: 404 });
    }

    return HttpResponse.json({
      data: form,
    });
  }),

  // POST /api/workspace/{workspaceId}/workflow/post/forms
  http.post('*/api/workspace/:workspaceId/workflow/post/forms', async ({ request, params }) => {
    const userId = getUserIdFromAuth(request);

    if (!userId) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { workspaceId } = params;

    try {
      const body = (await request.json()) as MutationRequest<{
        name: string;
        description?: string;
        fields: FormField[];
        settings: FormSettings;
        isActive?: boolean;
      }>;

      if (!body.data?.name || !body.data?.fields || !body.data?.settings) {
        return HttpResponse.json({ message: 'Name, fields, and settings are required' }, { status: 400 });
      }

      const newForm: WorkflowForm = {
        id: mockStore.generateId(),
        workspaceId: workspaceId as string,
        name: body.data.name,
        description: body.data.description,
        fields: body.data.fields,
        settings: body.data.settings,
        isActive: body.data.isActive ?? true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockForms.push(newForm);

      return HttpResponse.json({
        data: newForm,
        success: true,
        message: 'Form created successfully',
      });
    } catch {
      return HttpResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
  }),

  // PATCH /api/workspace/:workspaceId/workflow/patch/forms/:formId
  http.post('*/api/workspace/:workspaceId/workflow/patch/forms/:formId', async ({ request, params }) => {
    const userId = getUserIdFromAuth(request);

    if (!userId) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { workspaceId, formId } = params;

    const formIndex = mockForms.findIndex((f) => f.id === formId && f.workspaceId === workspaceId);

    if (formIndex === -1) {
      return HttpResponse.json({ message: 'Form not found' }, { status: 404 });
    }

    try {
      const body = (await request.json()) as MutationRequest<
        Partial<{
          name: string;
          description: string;
          fields: FormField[];
          settings: FormSettings;
          isActive: boolean;
        }>
      >;

      const currentForm = mockForms[formIndex];

      if (!currentForm) {
        return HttpResponse.json({ message: 'Form not found' }, { status: 404 });
      }

      const updatedForm: WorkflowForm = {
        ...currentForm,
        ...body.data,
        updatedAt: new Date().toISOString(),
      };

      mockForms[formIndex] = updatedForm;

      return HttpResponse.json({
        data: updatedForm,
        success: true,
        message: 'Form updated successfully',
      });
    } catch {
      return HttpResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
  }),

  // DELETE /api/workspace/:workspaceId/workflow/delete/forms/:formId
  http.post('*/api/workspace/:workspaceId/workflow/delete/forms/:formId', async ({ request, params }) => {
    const userId = getUserIdFromAuth(request);

    if (!userId) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { workspaceId, formId } = params;

    const formIndex = mockForms.findIndex((f) => f.id === formId && f.workspaceId === workspaceId);

    if (formIndex === -1) {
      return HttpResponse.json({ message: 'Form not found' }, { status: 404 });
    }

    mockForms.splice(formIndex, 1);

    return HttpResponse.json({
      success: true,
      message: 'Form deleted successfully',
    });
  }),

  // POST /api/workspace/{workspaceId}/workflow/post/forms/{formId}/submit
  http.post('*/api/workspace/:workspaceId/workflow/post/forms/:formId/submit', async ({ request, params }) => {
    const { workspaceId, formId } = params;

    const form = mockForms.find((f) => f.id === formId && f.workspaceId === workspaceId);

    if (!form) {
      return HttpResponse.json({ message: 'Form not found' }, { status: 404 });
    }

    if (!form.isActive) {
      return HttpResponse.json({ message: 'Form is not active' }, { status: 400 });
    }

    try {
      const body = (await request.json()) as {
        data: Record<string, unknown>;
        captchaToken?: string;
      };

      // Validate required fields
      const missingFields = form.fields
        .filter((field) => field.required)
        .filter((field) => !body.data[field.name])
        .map((field) => field.name);

      if (missingFields.length > 0) {
        return HttpResponse.json(
          {
            message: 'Missing required fields',
            errors: { fields: missingFields },
          },
          { status: 400 },
        );
      }

      // Mock form submission processing
      const submissionId = mockStore.generateId();

      return HttpResponse.json({
        data: {
          submissionId,
          formId: form.id,
          submittedAt: new Date().toISOString(),
          redirectUrl: form.settings.redirectUrl,
        },
        success: true,
        message: 'Form submitted successfully',
      });
    } catch {
      return HttpResponse.json({ message: 'Invalid request body' }, { status: 400 });
    }
  }),
];
