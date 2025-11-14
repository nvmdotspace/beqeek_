# Phase 7: Preview Polish, i18n, and Testing

**Date**: 2025-11-14
**Priority**: P1 (High)
**Status**: Pending
**Estimate**: 1 day

## Context

- [Phase 6: Field Management](phase-06-field-management.md)
- [i18n with Paraglide.js](https://inlang.com/m/gercan/paraglide-js)
- [Design System](/Users/macos/Workspace/buildinpublic/beqeek/docs/design-system.md)
- [Testing Strategy](/Users/macos/Workspace/buildinpublic/beqeek/docs/code-standards.md)

## Overview

Final polish phase: enhance form preview rendering, add complete i18n support (Vietnamese/English), implement comprehensive testing (unit, integration, e2e), accessibility improvements, error handling polish.

## Key Insights

- Paraglide.js compiles messages at build time (zero-runtime overhead)
- Messages in `messages/{locale}/*.json`, compiled to `src/paraglide/generated`
- Preview should handle all field types gracefully (date pickers, rich selects)
- Error boundaries at route level, toast notifications for mutations
- Accessibility: ARIA labels, keyboard navigation, screen reader support
- Loading states: Skeleton for lists, Spinner for mutations

## Requirements

### Preview Enhancements

1. **Date/Datetime Fields** - Use shadcn/ui DatePicker (not HTML5 inputs)
2. **Select Fields** - Use shadcn/ui Select with proper styling
3. **Textarea** - Proper height, char counter if maxlength
4. **Validation Preview** - Show required indicator, error states (static preview only)
5. **Mobile Responsive** - Preview adapts to mobile viewport

### i18n Coverage

1. **UI Strings** - All buttons, labels, headings, placeholders
2. **Error Messages** - API errors, validation messages
3. **Empty States** - "No forms yet", "No fields yet"
4. **Confirmation Dialogs** - Delete confirmations
5. **Form Templates** - Template names/descriptions (hardcoded per locale)
6. **Field Types** - Display names for field types

### Testing

1. **Unit Tests**
   - API client functions (mock responses)
   - React Query hooks (React Query testing utils)
   - Zustand store actions
   - Utility functions (name generation)

2. **Integration Tests**
   - List view renders forms
   - Create flow end-to-end
   - Update flow saves correctly
   - Delete flow removes form
   - Field CRUD operations
   - Drag-drop reordering

3. **E2E Tests** (Optional, if time permits)
   - Full user journey: create template → configure fields → save → view in list

### Accessibility

1. **Keyboard Navigation** - Tab order, Enter/Esc in dialogs
2. **ARIA Labels** - Buttons, form fields, dialogs
3. **Screen Readers** - Announce loading states, errors
4. **Focus Management** - Dialog opens focus first input, closes return focus
5. **Color Contrast** - Design tokens ensure WCAG AA compliance

### Error Handling

1. **API Errors** - Toast notifications with retry option
2. **Network Failures** - Offline indicator, retry logic
3. **Validation Errors** - Inline field errors, summary at top
4. **Boundary Errors** - Error boundary with "Try again" button
5. **404 Not Found** - Form doesn't exist → redirect to list

## Architecture

### i18n Message Structure

```
messages/
├── vi/                                   # Vietnamese (default)
│   └── workflow-forms.json
└── en/                                   # English
    └── workflow-forms.json
```

### Vietnamese Messages (`messages/vi/workflow-forms.json`)

```json
{
  "workflowForms": {
    "title": "Biểu mẫu Workflow",
    "createForm": "Tạo biểu mẫu",
    "searchPlaceholder": "Tìm kiếm biểu mẫu...",
    "noForms": "Chưa có biểu mẫu nào",
    "createFirstForm": "Tạo biểu mẫu đầu tiên",
    "selectTemplate": "Chọn mẫu biểu mẫu",
    "viewFormsList": "Xem danh sách",

    "formBuilder": {
      "title": "Trình soạn biểu mẫu",
      "save": "Lưu",
      "delete": "Xóa",
      "settings": "Cài đặt",
      "formId": "ID Biểu mẫu",
      "copyId": "Sao chép ID",
      "submitButtonText": "Văn bản nút gửi",
      "formFields": "Các trường biểu mẫu",
      "addField": "Thêm trường",
      "preview": "Xem trước biểu mẫu",
      "noFields": "Chưa có trường nào",
      "addFirstField": "Thêm trường đầu tiên"
    },

    "fieldConfig": {
      "addField": "Thêm trường",
      "editField": "Sửa trường",
      "fieldType": "Loại trường",
      "label": "Nhãn",
      "name": "Tên biến",
      "placeholder": "Placeholder",
      "defaultValue": "Giá trị mặc định",
      "required": "Bắt buộc",
      "options": "Tùy chọn",
      "addOption": "Thêm tùy chọn",
      "optionText": "Văn bản tùy chọn",
      "optionValue": "Giá trị tùy chọn"
    },

    "fieldTypes": {
      "text": "Văn bản",
      "email": "Email",
      "number": "Số",
      "textarea": "Văn bản dài",
      "select": "Chọn",
      "checkbox": "Hộp kiểm",
      "date": "Ngày",
      "datetime-local": "Ngày giờ"
    },

    "templates": {
      "basic": {
        "name": "Form Cơ bản",
        "description": "Form cơ bản với các trường văn bản và email."
      },
      "subscription": {
        "name": "Form Đăng ký",
        "description": "Form dành cho đăng ký nhận thông tin hoặc bản tin."
      },
      "survey": {
        "name": "Form Khảo sát",
        "description": "Form khảo sát với các trường tùy chọn và câu hỏi."
      }
    },

    "errors": {
      "loadFailed": "Không thể tải biểu mẫu",
      "createFailed": "Không thể tạo biểu mẫu",
      "updateFailed": "Không thể cập nhật biểu mẫu",
      "deleteFailed": "Không thể xóa biểu mẫu",
      "labelRequired": "Nhãn không được để trống",
      "optionsRequired": "Cần ít nhất một tùy chọn cho trường chọn"
    },

    "confirmations": {
      "deleteForm": "Bạn có chắc chắn muốn xóa biểu mẫu này?",
      "deleteField": "Bạn có chắc chắn muốn xóa trường này?"
    }
  }
}
```

### English Messages (`messages/en/workflow-forms.json`)

```json
{
  "workflowForms": {
    "title": "Workflow Forms",
    "createForm": "Create Form",
    "searchPlaceholder": "Search forms...",
    "noForms": "No forms yet",
    "createFirstForm": "Create your first form",
    "selectTemplate": "Select Form Template",
    "viewFormsList": "View Forms List",

    "formBuilder": {
      "title": "Form Builder",
      "save": "Save",
      "delete": "Delete",
      "settings": "Settings",
      "formId": "Form ID",
      "copyId": "Copy ID",
      "submitButtonText": "Submit Button Text",
      "formFields": "Form Fields",
      "addField": "Add Field",
      "preview": "Form Preview",
      "noFields": "No fields yet",
      "addFirstField": "Add your first field"
    },

    "fieldConfig": {
      "addField": "Add Field",
      "editField": "Edit Field",
      "fieldType": "Field Type",
      "label": "Label",
      "name": "Name (Variable)",
      "placeholder": "Placeholder",
      "defaultValue": "Default Value",
      "required": "Required",
      "options": "Options",
      "addOption": "Add Option",
      "optionText": "Option text",
      "optionValue": "Option value"
    },

    "fieldTypes": {
      "text": "Text",
      "email": "Email",
      "number": "Number",
      "textarea": "Textarea",
      "select": "Select",
      "checkbox": "Checkbox",
      "date": "Date",
      "datetime-local": "Datetime"
    },

    "templates": {
      "basic": {
        "name": "Basic Form",
        "description": "A basic form with text and email fields."
      },
      "subscription": {
        "name": "Subscription Form",
        "description": "Form for newsletter or information subscription."
      },
      "survey": {
        "name": "Survey Form",
        "description": "Survey form with select fields and questions."
      }
    },

    "errors": {
      "loadFailed": "Failed to load forms",
      "createFailed": "Failed to create form",
      "updateFailed": "Failed to update form",
      "deleteFailed": "Failed to delete form",
      "labelRequired": "Label is required",
      "optionsRequired": "At least one option is required for select fields"
    },

    "confirmations": {
      "deleteForm": "Are you sure you want to delete this form?",
      "deleteField": "Are you sure you want to delete this field?"
    }
  }
}
```

### Using i18n in Components

```tsx
import * as m from '@/paraglide/messages';

export function WorkflowFormsList() {
  return (
    <div>
      <h1>{m.workflowForms_title()}</h1>
      <Button>{m.workflowForms_createForm()}</Button>
      {forms.length === 0 && <p>{m.workflowForms_noForms()}</p>}
    </div>
  );
}
```

### Enhanced Preview Component

```tsx
import { format } from 'date-fns';
import { Calendar } from '@workspace/ui/components/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@workspace/ui/components/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
import { cn } from '@workspace/ui/lib/utils';

export function FormPreview({ title, fields, submitButtonText }: FormPreviewProps) {
  return (
    <div className="border rounded-lg p-6 bg-card">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>

      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        {fields.map((field, index) => (
          <div key={index}>
            <Label htmlFor={`preview-${index}`}>
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>

            {renderFieldInput(field, index)}
          </div>
        ))}

        <Button type="submit" className="w-full" disabled>
          {submitButtonText}
        </Button>
      </form>
    </div>
  );
}

function renderFieldInput(field: Field, index: number) {
  switch (field.type) {
    case 'textarea':
      return (
        <Textarea
          id={`preview-${index}`}
          placeholder={field.placeholder}
          defaultValue={field.defaultValue}
          maxLength={field.maxlength}
          disabled
          className="resize-none"
        />
      );

    case 'select':
      return (
        <Select disabled defaultValue={field.defaultValue}>
          <SelectTrigger id={`preview-${index}`}>
            <SelectValue placeholder={field.placeholder} />
          </SelectTrigger>
          <SelectContent>
            {field.options?.map((opt, i) => (
              <SelectItem key={i} value={opt.value}>
                {opt.text}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );

    case 'checkbox':
      return <Checkbox id={`preview-${index}`} disabled defaultChecked={!!field.defaultValue} />;

    case 'date':
    case 'datetime-local':
      return (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'w-full justify-start text-left font-normal',
                !field.defaultValue && 'text-muted-foreground',
              )}
              disabled
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {field.defaultValue || field.placeholder || 'Pick a date'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar mode="single" disabled />
          </PopoverContent>
        </Popover>
      );

    default:
      return (
        <Input
          id={`preview-${index}`}
          type={field.type}
          placeholder={field.placeholder}
          defaultValue={field.defaultValue}
          disabled
        />
      );
  }
}
```

### Testing Example (React Query Hook)

```typescript
// hooks/__tests__/use-workflow-forms.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useWorkflowForms } from '../use-workflow-forms';
import { getWorkflowForms } from '../../api/workflow-forms-api';

jest.mock('../../api/workflow-forms-api');
const mockGetWorkflowForms = getWorkflowForms as jest.MockedFunction<typeof getWorkflowForms>;

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useWorkflowForms', () => {
  it('fetches forms successfully', async () => {
    const mockData = {
      data: [
        { id: '1', name: 'Test Form', description: 'Test', formType: 'BASIC', config: {} },
      ],
    };
    mockGetWorkflowForms.mockResolvedValue(mockData);

    const { result } = renderHook(() => useWorkflowForms('workspace-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockData);
  });

  it('handles errors', async () => {
    mockGetWorkflowForms.mockRejectedValue(new Error('API Error'));

    const { result } = renderHook(() => useWorkflowForms('workspace-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeTruthy();
  });
});
```

## Implementation Steps

1. Create i18n message files (vi, en)
2. Replace all hardcoded strings with i18n calls
3. Enhance FormPreview with shadcn/ui components
4. Add error boundaries at route level
5. Implement toast notifications for mutations
6. Add ARIA labels to interactive elements
7. Write unit tests for API client, hooks, store
8. Write integration tests for CRUD flows
9. Test keyboard navigation
10. Verify accessibility with screen reader

## Todo

- [ ] Create i18n message files (vi, en)
- [ ] Replace hardcoded strings with i18n
- [ ] Enhance FormPreview component
- [ ] Add error boundaries
- [ ] Implement toast notifications
- [ ] Add ARIA labels
- [ ] Write unit tests (API, hooks, store)
- [ ] Write integration tests (CRUD flows)
- [ ] Test keyboard navigation
- [ ] Test with screen reader

## Success Criteria

- ✅ All UI strings translated (vi/en)
- ✅ Preview renders all field types correctly
- ✅ Date/datetime use DatePicker component
- ✅ Error boundaries catch route errors
- ✅ Toast notifications on mutation success/error
- ✅ ARIA labels on all interactive elements
- ✅ Keyboard navigation works (Tab, Enter, Esc)
- ✅ Unit test coverage >80%
- ✅ Integration tests pass
- ✅ No console errors in production

## Risk Assessment

**Low Risk** - Polishing phase, no major new features.

Risks:

- i18n message key typos → Use type-safe imports from paraglide
- DatePicker complexity → Use shadcn/ui examples as reference
- Test setup time → Prioritize critical paths if time constrained

## Security Considerations

- No XSS in preview (all inputs disabled, no innerHTML)
- i18n messages don't contain executable code

## Next Steps

After Phase 7 completion:

- Production deployment
- User acceptance testing
- Monitor error rates, performance metrics
- Gather feedback for future iterations
